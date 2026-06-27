/**
 * Pro 會員自訂頭像 — 圓形裁切後壓縮為 JPEG base64 存入 Firestore（換圖即覆寫舊檔）。
 * 預算：最多 50 位 Pro × 512KB ≈ 25MB。
 */
export const CUSTOM_AVATAR_TYPE = "custom_upload";
export const JPEG_MIME = "image/jpeg";
export const MAX_EDGE_PX = 384;
export const MAX_B64_CHARS = 700000;
export const MAX_STORE_BYTES = 512000;
export const MAX_FILE_INPUT_BYTES = 8 * 1024 * 1024;
export const AVATAR_CROP_VIEW_PX = 300;
export const AVATAR_CROP_RADIUS_PX = 130;

function tierFromUser(data) {
    if (globalThis.DoratchSubscription && typeof globalThis.DoratchSubscription.getActiveTier === "function") {
        return String(globalThis.DoratchSubscription.getActiveTier(data || {}) || "");
    }
    const sub = data && data.subscription;
    if (!sub || typeof sub !== "object") return "";
    const exp = Number(sub.expiresAtMs) || 0;
    if (exp && Date.now() > exp) return "";
    return String(sub.tier || "");
}

export function canUploadCustomAvatar(userData) {
    return tierFromUser(userData) === "pro";
}

export function hasStoredCustomAvatar(userData) {
    const b64 = userData && userData.customAvatarB64;
    return typeof b64 === "string" && b64.length >= 40;
}

export function equippedAvatarType(userData) {
    const eq = userData && userData.equippedCosmetics;
    return eq && typeof eq === "object" ? String(eq.avatar || "").trim() : "";
}

export function isCustomAvatarEquipped(userData, avatarType) {
    const passed = avatarType != null ? String(avatarType).trim() : "";
    const t = passed || equippedAvatarType(userData);
    return t === CUSTOM_AVATAR_TYPE && hasStoredCustomAvatar(userData);
}

export function dataUriFromUser(userData) {
    if (!hasStoredCustomAvatar(userData)) return "";
    const mime = String(userData.customAvatarMime || JPEG_MIME);
    return "data:" + mime + ";base64," + userData.customAvatarB64;
}

export function resolveAvatarUrl(userData, emailOrName, avatarType, fallbackFn) {
    if (userData && isCustomAvatarEquipped(userData, avatarType) && canUploadCustomAvatar(userData)) {
        const uri = dataUriFromUser(userData);
        if (uri) return uri;
    }
    return typeof fallbackFn === "function" ? fallbackFn(emailOrName, avatarType) : "";
}

export function buildCustomAvatarFirestorePayload(compressed) {
    return {
        customAvatarB64: compressed.b64,
        customAvatarMime: compressed.mime || JPEG_MIME,
        customAvatarBytes: compressed.bytes || 0,
        customAvatarUpdatedAt: Date.now()
    };
}

export function shouldClearCustomAvatarOnEquip(newAvatarType) {
    return String(newAvatarType || "").trim() !== CUSTOM_AVATAR_TYPE;
}

export function validateImageFile(file) {
    if (!file || !(file instanceof Blob)) throw new Error("INVALID_FILE");
    if (file.size > MAX_FILE_INPUT_BYTES) throw new Error("FILE_TOO_LARGE");
    const mime = String(file.type || "").toLowerCase();
    if (!/^image\/(jpeg|jpg|png|webp|gif)$/.test(mime)) throw new Error("UNSUPPORTED_TYPE");
}

export async function loadImageBitmapFromFile(file) {
    validateImageFile(file);
    return createImageBitmap(file);
}

export function computeInitialCropState(bitmap, viewSize = AVATAR_CROP_VIEW_PX, cropRadius = AVATAR_CROP_RADIUS_PX) {
    const coverSide = cropRadius * 2;
    const minScale = Math.max(coverSide / bitmap.width, coverSide / bitmap.height) * 1.05;
    const iw = bitmap.width * minScale;
    const ih = bitmap.height * minScale;
    return {
        scale: minScale,
        minScale: minScale,
        maxScale: minScale * 4,
        ox: (viewSize - iw) / 2,
        oy: (viewSize - ih) / 2
    };
}

export function drawCropPreview(ctx, bitmap, state, viewSize = AVATAR_CROP_VIEW_PX) {
    if (!ctx || !bitmap || !state) return;
    ctx.clearRect(0, 0, viewSize, viewSize);
    const iw = bitmap.width * state.scale;
    const ih = bitmap.height * state.scale;
    ctx.drawImage(bitmap, state.ox, state.oy, iw, ih);
}

export function setCropScaleKeepingCenter(state, bitmap, newScale, viewSize = AVATAR_CROP_VIEW_PX) {
    if (!state || !bitmap) return;
    const cx = viewSize / 2;
    const cy = viewSize / 2;
    const iw0 = bitmap.width * state.scale;
    const ih0 = bitmap.height * state.scale;
    const relX = iw0 > 0 ? (cx - state.ox) / iw0 : 0.5;
    const relY = ih0 > 0 ? (cy - state.oy) / ih0 : 0.5;
    const clamped = Math.max(state.minScale, Math.min(state.maxScale, newScale));
    state.scale = clamped;
    const iw = bitmap.width * state.scale;
    const ih = bitmap.height * state.scale;
    state.ox = cx - relX * iw;
    state.oy = cy - relY * ih;
}

export function extractCropCanvas(bitmap, state, viewSize = AVATAR_CROP_VIEW_PX, cropRadius = AVATAR_CROP_RADIUS_PX, exportPx = MAX_EDGE_PX) {
    if (!bitmap || !state) throw new Error("INVALID_CROP");
    const staging = document.createElement("canvas");
    staging.width = viewSize;
    staging.height = viewSize;
    const sctx = staging.getContext("2d");
    if (!sctx) throw new Error("CANVAS_UNSUPPORTED");
    drawCropPreview(sctx, bitmap, state, viewSize);
    const side = cropRadius * 2;
    const cx = viewSize / 2;
    const out = document.createElement("canvas");
    out.width = exportPx;
    out.height = exportPx;
    const octx = out.getContext("2d");
    if (!octx) throw new Error("CANVAS_UNSUPPORTED");
    octx.drawImage(staging, cx - cropRadius, cx - cropRadius, side, side, 0, 0, exportPx, exportPx);
    return out;
}

async function compressCanvasSource(sourceCanvas) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("CANVAS_UNSUPPORTED");

    let edge = MAX_EDGE_PX;
    let quality = 0.92;
    const sw = sourceCanvas.width;
    const sh = sourceCanvas.height;

    for (let attempt = 0; attempt < 8; attempt += 1) {
        const scale = Math.min(1, edge / Math.max(sw, sh));
        const cw = Math.max(1, Math.round(sw * scale));
        const ch = Math.max(1, Math.round(sh * scale));
        canvas.width = cw;
        canvas.height = ch;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(sourceCanvas, 0, 0, cw, ch);
        const dataUrl = canvas.toDataURL(JPEG_MIME, quality);
        const b64 = (dataUrl.split(",")[1] || "");
        const bytes = Math.ceil(b64.length * 3 / 4);
        if (b64 && b64.length <= MAX_B64_CHARS && bytes <= MAX_STORE_BYTES) {
            return {
                b64: b64,
                mime: JPEG_MIME,
                bytes: bytes,
                w: cw,
                h: ch,
                quality: quality
            };
        }
        if (quality > 0.72) quality -= 0.06;
        else edge = Math.max(256, edge - 32);
    }
    throw new Error("AVATAR_TOO_LARGE");
}

export async function compressCroppedCanvas(sourceCanvas) {
    return compressCanvasSource(sourceCanvas);
}

/** @deprecated 請改用圓形裁切流程 compressCroppedCanvas(extractCropCanvas(...)) */
export async function compressImageFile(file) {
    validateImageFile(file);
    const bitmap = await createImageBitmap(file);
    try {
        const state = computeInitialCropState(bitmap);
        const cropped = extractCropCanvas(bitmap, state);
        return compressCanvasSource(cropped);
    } finally {
        if (typeof bitmap.close === "function") bitmap.close();
    }
}

/**
 * 掛載頭像裁切 modal：圓心固定，拖曳平移、滑桿縮放；匯出圓內正方形。
 */
export function createAvatarCropController(cfg) {
    const overlay = document.getElementById(cfg.overlayId || "avatar-crop-modal");
    const canvas = document.getElementById(cfg.canvasId || "avatar-crop-canvas");
    const slider = document.getElementById(cfg.sliderId || "avatar-crop-zoom");
    const btnCancel = document.getElementById(cfg.btnCancelId || "btn-avatar-crop-cancel");
    const btnConfirm = document.getElementById(cfg.btnConfirmId || "btn-avatar-crop-confirm");
    if (!overlay || !canvas) return null;

    const viewSize = AVATAR_CROP_VIEW_PX;
    const ctx = canvas.getContext("2d");
    canvas.width = viewSize;
    canvas.height = viewSize;

    let bitmap = null;
    let state = null;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let pendingFile = null;

    function redraw() {
        if (!bitmap || !state || !ctx) return;
        drawCropPreview(ctx, bitmap, state, viewSize);
    }

    function close() {
        overlay.classList.remove("open");
        overlay.setAttribute("aria-hidden", "true");
        dragging = false;
        pendingFile = null;
        if (bitmap && typeof bitmap.close === "function") bitmap.close();
        bitmap = null;
        state = null;
    }

    function onPointerDown(e) {
        if (!state) return;
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e) {
        if (!dragging || !state) return;
        state.ox += e.clientX - lastX;
        state.oy += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        redraw();
    }

    function onPointerUp(e) {
        dragging = false;
        try { canvas.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    }

    function onSliderInput() {
        if (!slider || !state || !bitmap) return;
        const t = (Number(slider.value) - 100) / 300;
        const next = state.minScale + (state.maxScale - state.minScale) * t;
        setCropScaleKeepingCenter(state, bitmap, next, viewSize);
        redraw();
    }

    async function open(file) {
        validateImageFile(file);
        if (bitmap && typeof bitmap.close === "function") bitmap.close();
        bitmap = await createImageBitmap(file);
        state = computeInitialCropState(bitmap, viewSize, AVATAR_CROP_RADIUS_PX);
        pendingFile = file;
        if (slider) slider.value = "100";
        overlay.classList.add("open");
        overlay.setAttribute("aria-hidden", "false");
        redraw();
    }

    function getCropCanvas() {
        return extractCropCanvas(bitmap, state, viewSize, AVATAR_CROP_RADIUS_PX, MAX_EDGE_PX);
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    if (slider) slider.addEventListener("input", onSliderInput);
    if (btnCancel) btnCancel.addEventListener("click", close);
    if (btnConfirm) {
        btnConfirm.addEventListener("click", () => {
            if (typeof cfg.onConfirm === "function" && bitmap && state) cfg.onConfirm(getCropCanvas(), pendingFile);
        });
    }

    return {
        open: open,
        close: close,
        getCropCanvas: getCropCanvas,
        destroy: () => {
            close();
            canvas.removeEventListener("pointerdown", onPointerDown);
            canvas.removeEventListener("pointermove", onPointerMove);
            canvas.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("pointercancel", onPointerUp);
            if (slider) slider.removeEventListener("input", onSliderInput);
        }
    };
}

export function formatCompressError(code) {
    const c = String(code || "");
    if (c === "FILE_TOO_LARGE") return "檔案太大，請選 8MB 以內的圖片。";
    if (c === "UNSUPPORTED_TYPE") return "僅支援 JPG、PNG、WebP、GIF。";
    if (c === "AVATAR_TOO_LARGE") return "壓縮後仍超過單人上限（約 512KB），請換一張較簡單的圖或縮小裁切範圍。";
    return "無法處理這張圖片。";
}

export const DoratchCustomAvatar = {
    CUSTOM_AVATAR_TYPE,
    JPEG_MIME,
    MAX_EDGE_PX,
    MAX_B64_CHARS,
    MAX_STORE_BYTES,
    AVATAR_CROP_VIEW_PX,
    AVATAR_CROP_RADIUS_PX,
    canUploadCustomAvatar,
    hasStoredCustomAvatar,
    equippedAvatarType,
    isCustomAvatarEquipped,
    dataUriFromUser,
    resolveAvatarUrl,
    buildCustomAvatarFirestorePayload,
    shouldClearCustomAvatarOnEquip,
    validateImageFile,
    loadImageBitmapFromFile,
    computeInitialCropState,
    drawCropPreview,
    setCropScaleKeepingCenter,
    extractCropCanvas,
    compressCroppedCanvas,
    compressImageFile,
    createAvatarCropController,
    formatCompressError
};

if (typeof globalThis !== "undefined") {
    globalThis.DoratchCustomAvatar = DoratchCustomAvatar;
}

/**
 * Pro 會員自訂頭像 — 壓縮為 JPEG base64 存入 Firestore users 文件（單欄位覆寫，換圖即刪舊資料）。
 */
export const CUSTOM_AVATAR_TYPE = "custom_upload";
export const JPEG_MIME = "image/jpeg";
export const MAX_EDGE_PX = 96;
export const MAX_B64_CHARS = 88000;
export const MAX_FILE_INPUT_BYTES = 5 * 1024 * 1024;

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
    const t = String(avatarType != null ? avatarType : equippedAvatarType(userData)).trim();
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

/**
 * 將圖片壓到 96px 邊長、JPEG，盡量小於 ~66KB 二進位。
 */
export async function compressImageFile(file) {
    if (!file || !(file instanceof Blob)) throw new Error("INVALID_FILE");
    if (file.size > MAX_FILE_INPUT_BYTES) throw new Error("FILE_TOO_LARGE");
    const mime = String(file.type || "").toLowerCase();
    if (!/^image\/(jpeg|jpg|png|webp|gif)$/.test(mime)) throw new Error("UNSUPPORTED_TYPE");

    const bitmap = await createImageBitmap(file);
    try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("CANVAS_UNSUPPORTED");

        let w = bitmap.width;
        let h = bitmap.height;
        let edge = MAX_EDGE_PX;
        let quality = 0.72;

        for (let attempt = 0; attempt < 6; attempt += 1) {
            const scale = Math.min(1, edge / Math.max(w, h));
            const cw = Math.max(1, Math.round(w * scale));
            const ch = Math.max(1, Math.round(h * scale));
            canvas.width = cw;
            canvas.height = ch;
            ctx.clearRect(0, 0, cw, ch);
            ctx.drawImage(bitmap, 0, 0, cw, ch);
            const dataUrl = canvas.toDataURL(JPEG_MIME, quality);
            const b64 = (dataUrl.split(",")[1] || "");
            if (b64 && b64.length <= MAX_B64_CHARS) {
                return {
                    b64: b64,
                    mime: JPEG_MIME,
                    bytes: Math.ceil(b64.length * 3 / 4),
                    w: cw,
                    h: ch,
                    quality: quality
                };
            }
            if (quality > 0.48) quality -= 0.08;
            else edge = Math.max(64, edge - 12);
        }
        throw new Error("AVATAR_TOO_LARGE");
    } finally {
        if (typeof bitmap.close === "function") bitmap.close();
    }
}

export function formatCompressError(code) {
    const c = String(code || "");
    if (c === "FILE_TOO_LARGE") return "檔案太大，請選 5MB 以內的圖片。";
    if (c === "UNSUPPORTED_TYPE") return "僅支援 JPG、PNG、WebP、GIF。";
    if (c === "AVATAR_TOO_LARGE") return "壓縮後仍過大，請換一張較簡單的圖片。";
    return "無法處理這張圖片。";
}

export const DoratchCustomAvatar = {
    CUSTOM_AVATAR_TYPE,
    JPEG_MIME,
    MAX_EDGE_PX,
    MAX_B64_CHARS,
    canUploadCustomAvatar,
    hasStoredCustomAvatar,
    equippedAvatarType,
    isCustomAvatarEquipped,
    dataUriFromUser,
    resolveAvatarUrl,
    buildCustomAvatarFirestorePayload,
    shouldClearCustomAvatarOnEquip,
    compressImageFile,
    formatCompressError
};

if (typeof globalThis !== "undefined") {
    globalThis.DoratchCustomAvatar = DoratchCustomAvatar;
}

/**
 * Doratch 使用者顯示名稱（Firestore users.displayName）
 */
export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 20;

export function normalizeDisplayName(raw) {
    if (raw == null) return "";
    return String(raw).trim().slice(0, DISPLAY_NAME_MAX);
}

/** 對外顯示用名稱：有 displayName 用 displayName，否則 email 前綴 */
export function getDisplayLabel(userData, email) {
    const dn = normalizeDisplayName(userData && userData.displayName);
    if (dn.length >= DISPLAY_NAME_MIN) return dn;
    const em = (email || "").trim();
    if (em.includes("@")) return em.split("@")[0];
    return em || "使用者";
}

export function needsDisplayName(userData) {
    return normalizeDisplayName(userData && userData.displayName).length < DISPLAY_NAME_MIN;
}

export function validateDisplayNameInput(raw) {
    const name = normalizeDisplayName(raw);
    if (name.length < DISPLAY_NAME_MIN) {
        return { ok: false, name, error: `顯示名稱至少 ${DISPLAY_NAME_MIN} 個字元` };
    }
    if (!/^[\p{L}\p{N}\u4e00-\u9fff_\-\s]+$/u.test(name)) {
        return { ok: false, name, error: "僅可使用中文、英文、數字、空格、底線或連字號" };
    }
    return { ok: true, name, error: "" };
}

export function avatarUrlFor(userData, email, size) {
    const label = getDisplayLabel(userData, email);
    return (
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(label) +
        "&size=" +
        (size || 128) +
        "&background=random"
    );
}

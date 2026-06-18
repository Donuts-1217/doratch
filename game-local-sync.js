/** 小遊戲本機存檔 + 雲端背景同步共用工具 */

export function toMillis(v) {
    if (!v) return 0;
    if (typeof v === "number") return v;
    if (v.toMillis) return v.toMillis();
    if (v.seconds) return v.seconds * 1000;
    return 0;
}

export function loadLocal(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function saveLocal(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify({ ...data, savedAt: Date.now() }));
    } catch (e) {
        console.error(e);
    }
}

export function pickNewer(localData, cloudData, cloudSavedAt) {
    const localAt = localData?.savedAt || 0;
    const cloudAt = toMillis(cloudSavedAt) || cloudData?.savedAt || 0;
    if (cloudAt > localAt + 3000) return cloudData;
    return localData;
}

export async function connectCloud(onReady, onFail) {
    try {
        const api = await import("./doratch-game-api.js");
        api.requireLogin(async (user) => {
            try {
                await onReady(user, api);
            } catch (e) {
                console.error(e);
                onFail?.("雲端讀取失敗 · 本機進度仍可用");
            }
        });
        return api;
    } catch (e) {
        console.warn("Firebase 不可用", e);
        onFail?.("本機模式（未連線雲端）");
        return null;
    }
}

export async function refreshPlatformCoins(uid, elId, getUserCoins) {
    const el = document.getElementById(elId);
    if (el) el.textContent = "💰 暫停發放";
}

export function setSyncHint(text) {
    const el = document.getElementById("sync-hint");
    if (el) el.textContent = text;
}

/** Doratch Plus / Pro 訂閱 — 類 Discord Basic / Nitro */

export const TIER_PLUS = "plus";
export const TIER_PRO = "pro";

export const SUBSCRIPTION_PLANS = {
    plus: {
        id: TIER_PLUS,
        name: "Doratch Plus",
        tagline: "輕量會員 · 類 Discord Basic",
        icon: "✨",
        perks: [
            "專屬 Plus 徽章與稱號",
            "訂閱專屬頭像框、橫幅與名稱特效",
            "Plus 色彩主題 · 顯示名稱樣式（字型、顏色、效果）",
            "自訂狀態 100 字 · 簡介 500 字",
            "雲端空間 5 MB · 作品上限 20",
            "審核上傳每日 2 次",
            "商城 Doord 消費 95 折",
            "伺服器加成 1 點（Plus 會員專屬）"
        ]
    },
    pro: {
        id: TIER_PRO,
        name: "Doratch Pro",
        tagline: "頂級會員 · 類 Discord Nitro",
        icon: "💎",
        perks: [
            "包含 Plus 全部權益",
            "Pro 專屬色彩主題 · 自訂強調色 · 進階名稱樣式",
            "Pro 專屬動態頭像框、橫幅與面板特效",
            "自訂狀態 128 字 · 簡介 1000 字",
            "雲端空間 20 MB · 作品上限 50",
            "審核上傳每日 5 次",
            "商城 Doord 消費 9 折 · Pro 光環辨識",
            "伺服器加成 2 點（可強化同一或不同伺服器）"
        ]
    }
};

/** 訂閱期間自動解鎖的外觀（不需購買） */
export const SUBSCRIPTION_COSMETIC_ITEMS = [
    { id: "sub_plus_badge", slot: "badge", label: "Doratch Plus", value: "Doratch Plus", minTier: TIER_PLUS },
    { id: "sub_plus_title", slot: "title", label: "Doratch Plus 會員", value: "Doratch Plus 會員", minTier: TIER_PLUS },
    { id: "sub_plus_frame", slot: "frame", label: "Plus 脈衝框", value: "neon", minTier: TIER_PLUS },
    { id: "sub_plus_banner", slot: "banner", label: "Plus 繽紛橫幅", value: "candy_pop", minTier: TIER_PLUS },
    { id: "sub_plus_namecolor", slot: "nameColor", label: "Plus 紫晶名稱", value: "#a855f7", minTier: TIER_PLUS },
    { id: "sub_plus_namefx", slot: "nameEffect", label: "Plus 柔光", value: "soft_glow", minTier: TIER_PLUS },
    { id: "sub_pro_badge", slot: "badge", label: "Doratch Pro", value: "Doratch Pro", minTier: TIER_PRO },
    { id: "sub_pro_title", slot: "title", label: "Doratch Pro 會員", value: "Doratch Pro 會員", minTier: TIER_PRO },
    { id: "sub_pro_frame", slot: "frame", label: "Pro 極光框", value: "aurora", minTier: TIER_PRO },
    { id: "sub_pro_banner", slot: "banner", label: "Pro 銀河橫幅", value: "galaxy", minTier: TIER_PRO },
    { id: "sub_pro_namefx", slot: "nameEffect", label: "Pro 霓虹閃爍", value: "neon_flicker", minTier: TIER_PRO },
    { id: "sub_pro_profilefx", slot: "profileEffect", label: "Pro 宇宙極光", value: "cosmic_aurora", minTier: TIER_PRO },
    { id: "sub_pro_namecolor", slot: "nameColor", label: "Pro 漸層金紫", value: "#c084fc", minTier: TIER_PRO }
];

const TIER_RANK = { plus: 1, pro: 2 };
const SUB_ITEM_BY_ID = Object.fromEntries(SUBSCRIPTION_COSMETIC_ITEMS.map((it) => [it.id, it]));

function tierRank(tier) {
    return TIER_RANK[String(tier || "").toLowerCase()] || 0;
}

function getMillis(v) {
    if (v == null || v === "") return 0;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v.toMillis === "function") return v.toMillis();
    if (typeof v === "object" && typeof v.seconds === "number") return v.seconds * 1000;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

export function getSubscriptionRaw(data) {
    const sub = data && data.subscription;
    if (!sub || typeof sub !== "object") return null;
    return sub;
}

export function getActiveTier(data) {
    const sub = getSubscriptionRaw(data);
    if (!sub) return "";
    const tier = String(sub.tier || "").trim().toLowerCase();
    if (tier !== TIER_PLUS && tier !== TIER_PRO) return "";
    const exp = getMillis(sub.expiresAtMs != null ? sub.expiresAtMs : sub.expiresAt);
    if (exp > 0 && exp <= Date.now()) return "";
    return tier;
}

export function isPlusOrAbove(data) {
    return tierRank(getActiveTier(data)) >= 1;
}

export function isPro(data) {
    return getActiveTier(data) === TIER_PRO;
}

export function subscriptionLabel(tier) {
    if (tier === TIER_PRO) return "Pro";
    if (tier === TIER_PLUS) return "Plus";
    return "";
}

export function subscriptionGrantedItems(data) {
    const active = getActiveTier(data);
    const rank = tierRank(active);
    if (!rank) return [];
    return SUBSCRIPTION_COSMETIC_ITEMS.filter((it) => tierRank(it.minTier) <= rank);
}

export function wrapOwnedItemsBySlot(baseFn, data, allItems, slot) {
    const base = typeof baseFn === "function" ? baseFn(data, allItems, slot) : [];
    const granted = subscriptionGrantedItems(data).filter((it) => it.slot === slot);
    const seen = new Set(base.map((it) => it.id));
    const merged = granted
        .filter((it) => !seen.has(it.id))
        .map((it) => ({ ...it, subscriptionGranted: true }));
    return [...merged, ...base];
}

export function subscriptionBadgeHtml(tier) {
    const t = tier || "";
    if (t === TIER_PRO) {
        return '<span class="sub-tier-badge sub-tier-pro" title="Doratch Pro">💎 PRO</span>';
    }
    if (t === TIER_PLUS) {
        return '<span class="sub-tier-badge sub-tier-plus" title="Doratch Plus">✨ PLUS</span>';
    }
    return "";
}

export function subscriptionTierForSnapshot(data) {
    return getActiveTier(data);
}

export function getCustomStatusMaxLen(data) {
    const t = getActiveTier(data);
    if (t === TIER_PRO) return 128;
    if (t === TIER_PLUS) return 100;
    return 60;
}

export function getProfileBioMaxLen(data) {
    const t = getActiveTier(data);
    if (t === TIER_PRO) return 1000;
    if (t === TIER_PLUS) return 500;
    return 300;
}

export function getDefaultCloudStorageMB(data) {
    const t = getActiveTier(data);
    if (t === TIER_PRO) return 20;
    if (t === TIER_PLUS) return 5;
    return 1;
}

export function getDefaultCloudMaxFiles(data) {
    const t = getActiveTier(data);
    if (t === TIER_PRO) return 50;
    if (t === TIER_PLUS) return 20;
    return 10;
}

export function getDefaultReviewDailyLimit(data) {
    const t = getActiveTier(data);
    if (t === TIER_PRO) return 5;
    if (t === TIER_PLUS) return 2;
    return 1;
}

export function getShopDiscountMultiplier(data) {
    const t = getActiveTier(data);
    if (t === TIER_PRO) return 0.9;
    if (t === TIER_PLUS) return 0.95;
    return 1;
}

export function applyShopDiscount(price, data) {
    const p = Math.max(0, Math.floor(Number(price) || 0));
    const mul = getShopDiscountMultiplier(data);
    if (mul >= 1) return p;
    return Math.max(1, Math.floor(p * mul));
}

export function isProAura(data) {
    return isPro(data);
}

export function isSubscriptionGrantedValue(data, slot, value) {
    const v = String(value || "").trim();
    if (!v) return false;
    return subscriptionGrantedItems(data).some((it) => it.slot === slot && it.value === v);
}

export function formatSubscriptionExpiry(data) {
    const sub = getSubscriptionRaw(data);
    if (!sub) return "";
    const exp = getMillis(sub.expiresAtMs != null ? sub.expiresAtMs : sub.expiresAt);
    if (!exp) return "永久有效";
    if (exp <= Date.now()) return "已過期";
    return new Date(exp).toLocaleString("zh-TW");
}

if (typeof window !== "undefined") {
    window.DoratchSubscription = {
        TIER_PLUS,
        TIER_PRO,
        SUBSCRIPTION_PLANS,
        SUBSCRIPTION_COSMETIC_ITEMS,
        getActiveTier,
        isPlusOrAbove,
        isPro,
        subscriptionLabel,
        subscriptionGrantedItems,
        wrapOwnedItemsBySlot,
        subscriptionBadgeHtml,
        subscriptionTierForSnapshot,
        getCustomStatusMaxLen,
        getProfileBioMaxLen,
        getDefaultCloudStorageMB,
        getDefaultCloudMaxFiles,
        getDefaultReviewDailyLimit,
        getShopDiscountMultiplier,
        applyShopDiscount,
        isProAura,
        isSubscriptionGrantedValue,
        formatSubscriptionExpiry,
        getSubscriptionRaw
    };
}

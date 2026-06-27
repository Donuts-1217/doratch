/**
 * 榮耀（原徽章）— 多數需達成條件解鎖，僅部分可在商城購買。
 */

/** 可在商城直接購買的榮耀 id */
export const SHOP_PURCHASABLE_BADGE_IDS = new Set([
    "badge_mentor",
    "badge_speedrunner",
    "badge_alpha",
    "badge_guardian",
    "badge_ocean_explorer",
    "badge_meal_master",
    "badge_sports_mvp",
    "badge_moonlight",
    "badge_supernova",
    "badge_reactor",
    "badge_void_rift",
    "badge_event_horizon",
    "badge_singularity",
    "badge_ether_crown",
    "badge_ancient_rune",
    "badge_quantum_flux"
]);

export const SHOP_BADGE_LABELS = {
    badge_mentor: "班級導師",
    badge_speedrunner: "速通玩家",
    badge_alpha: "內測先鋒",
    badge_guardian: "社群守護者",
    badge_ocean_explorer: "海洋探險家",
    badge_meal_master: "美食大師",
    badge_sports_mvp: "運動 MVP",
    badge_moonlight: "月光旅人",
    badge_supernova: "超新星之眼",
    badge_reactor: "反應爐核心",
    badge_void_rift: "虛無裂隙",
    badge_event_horizon: "事件視界",
    badge_singularity: "奇點核心",
    badge_ether_crown: "以太王冠",
    badge_ancient_rune: "遠古符文",
    badge_quantum_flux: "量子 flux"
};

export const HONOR_BADGE_RULES = [
    { id: "badge_gift_star", value: "送禮之星", icon: "🎁", source: "gift_send", min: 1, hint: "送出 1 份禮物" },
    { id: "badge_gift_generous", value: "慷慨大使", icon: "💝", source: "gift_send", min: 10, hint: "累計送出 10 份禮物" },
    { id: "badge_gift_joy", value: "收禮喜悅", icon: "🎀", source: "gift_claim", min: 1, hint: "領取 1 份禮物" },
    { id: "badge_gift_bond", value: "情誼相傳", icon: "🤝", source: "gift_bond", min: 1, hint: "曾送出且領取過禮物" },
    { id: "badge_helper_heart", value: "熱心助人", icon: "💗", source: "manual", hint: "協助社群或獲管理員授予" },
    { id: "badge_creator_star", value: "創作者之星", icon: "⭐", source: "manual", hint: "發布作品或獲管理員授予" },
    { id: "badge_early_bird", value: "早鳥先鋒", icon: "🐣", source: "manual", hint: "早期加入或活動授予" },
    { id: "badge_open_source", value: "開源貢獻者", icon: "📂", source: "manual", hint: "開源貢獻或活動授予" },
    { id: "badge_pixel_master", value: "像素大師", icon: "🎮", source: "manual", hint: "創作活動或評選授予" },
    { id: "badge_hackathon_winner", value: "黑客松冠軍", icon: "🏆", source: "manual", hint: "黑客松優勝或活動授予" },
    { id: "badge_homework_hero", value: "作業達人", icon: "📝", source: "manual", hint: "完成作業挑戰或老師授予" },
    { id: "badge_debug_pro", value: "除錯專家", icon: "🔍", source: "manual", hint: "除錯挑戰或老師授予" },
    { id: "badge_dragon", value: "龍焰核心", icon: "🐉", source: "manual", hint: "傳奇榮耀，活動或成就授予" },
    { id: "badge_cosmos", value: "星穹航行者", icon: "🪐", source: "manual", hint: "傳奇榮耀，活動或成就授予" },
    { id: "badge_phantom", value: "幻影駭客", icon: "👻", source: "manual", hint: "傳奇榮耀，活動或成就授予" },
    { id: "badge_titan", value: "鈦晶守衛", icon: "🛡️", source: "manual", hint: "傳奇榮耀，活動或成就授予" }
];

const HONOR_RULE_BY_ID = Object.fromEntries(HONOR_BADGE_RULES.map((r) => [r.id, r]));

export function isShopPurchasableBadge(id) {
    return SHOP_PURCHASABLE_BADGE_IDS.has(String(id || ""));
}

export function isHonorOnlyBadge(id) {
    const bid = String(id || "");
    if (!bid.startsWith("badge_")) return false;
    return !SHOP_PURCHASABLE_BADGE_IDS.has(bid);
}

export function normalizeHonorStats(raw) {
    const s = raw && typeof raw === "object" ? raw : {};
    return {
        giftsSent: Math.max(0, Math.floor(Number(s.giftsSent) || 0)),
        giftsClaimed: Math.max(0, Math.floor(Number(s.giftsClaimed) || 0))
    };
}

export function evaluateHonorUnlocks(stats, inventory) {
    const inv = Array.isArray(inventory) ? inventory : [];
    const s = normalizeHonorStats(stats);
    const out = [];
    HONOR_BADGE_RULES.forEach(function (rule) {
        if (inv.includes(rule.id)) return;
        if (rule.source === "manual") return;
        if (rule.source === "gift_send" && s.giftsSent >= rule.min) out.push(rule.id);
        if (rule.source === "gift_claim" && s.giftsClaimed >= rule.min) out.push(rule.id);
        if (rule.source === "gift_bond" && s.giftsSent >= 1 && s.giftsClaimed >= 1) out.push(rule.id);
    });
    return out;
}

export function inferHonorStatsFromLegacy(data) {
    const s = normalizeHonorStats(data && data.honorStats);
    if (!s.giftsSent && data && data.lastGiftAt) s.giftsSent = 1;
    if (!s.giftsClaimed && data && data.lastGiftClaimAt) s.giftsClaimed = 1;
    return s;
}

export function syncHonorInventory(inventory, honorStats, legacyData) {
    const inferred = legacyData ? inferHonorStatsFromLegacy(legacyData) : normalizeHonorStats(honorStats);
    return applyHonorProgress(inventory, honorStats, inferred);
}

export function applyHonorProgress(inventory, honorStats, patch) {
    const prev = normalizeHonorStats(honorStats);
    const stats = normalizeHonorStats(Object.assign({}, prev, patch || {}));
    const inv = Array.isArray(inventory) ? inventory.slice() : [];
    const added = [];
    evaluateHonorUnlocks(stats, inv).forEach(function (id) {
        if (!inv.includes(id)) {
            inv.push(id);
            added.push(id);
        }
    });
    return { inventory: inv, honorStats: stats, addedIds: added };
}

export function getHonorBadgeHint(id) {
    const rule = HONOR_RULE_BY_ID[String(id || "")];
    if (rule) return rule.hint;
    if (isShopPurchasableBadge(id)) return "可在商城購買";
    return "特殊途徑解鎖";
}

export function getHonorBadgeMeta(id) {
    const rule = HONOR_RULE_BY_ID[String(id || "")];
    if (rule) return rule;
    return null;
}

/** 個人頁榮耀牆：合併規則型 + 已擁有商城榮耀 */
export function listHonorWallEntries(inventory) {
    const inv = Array.isArray(inventory) ? inventory : [];
    const seen = new Set();
    const rows = [];
    HONOR_BADGE_RULES.forEach(function (rule) {
        seen.add(rule.id);
        rows.push({
            id: rule.id,
            value: rule.value,
            icon: rule.icon || "🏅",
            hint: rule.hint,
            owned: inv.includes(rule.id),
            shop: false
        });
    });
    SHOP_PURCHASABLE_BADGE_IDS.forEach(function (id) {
        if (seen.has(id)) return;
        seen.add(id);
        rows.push({
            id: id,
            value: SHOP_BADGE_LABELS[id] || id.replace(/^badge_/, "").replace(/_/g, " "),
            icon: "🛒",
            hint: "可在商城購買",
            owned: inv.includes(id),
            shop: true
        });
    });
    return rows;
}

export const DoratchHonor = {
    SHOP_PURCHASABLE_BADGE_IDS,
    HONOR_BADGE_RULES,
    isShopPurchasableBadge,
    isHonorOnlyBadge,
    normalizeHonorStats,
    evaluateHonorUnlocks,
    syncHonorInventory,
    inferHonorStatsFromLegacy,
    applyHonorProgress,
    getHonorBadgeHint,
    getHonorBadgeMeta,
    listHonorWallEntries
};

if (typeof globalThis !== "undefined") {
    globalThis.DoratchHonor = DoratchHonor;
}

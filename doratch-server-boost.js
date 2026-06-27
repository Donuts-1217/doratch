/** Doratch 伺服器加成 — 類 Discord Server Boost（Plus / Pro） */

export const BOOST_LEVELS = [
    { level: 0, points: 0, messageLimit: 300, memberBonus: 0, label: "無加成" },
    { level: 1, points: 1, messageLimit: 500, memberBonus: 5, label: "Lv.1 脈衝" },
    { level: 2, points: 2, messageLimit: 800, memberBonus: 10, label: "Lv.2 極光" },
    { level: 3, points: 4, messageLimit: 1200, memberBonus: 20, label: "Lv.3 傳奇" }
];

export function getUserBoostCapacity(tier) {
    const t = String(tier || "").toLowerCase();
    if (t === "pro") return 2;
    if (t === "plus") return 1;
    return 0;
}

export function tierBoostPoints(tier) {
    const t = String(tier || "").toLowerCase();
    if (t === "pro") return 2;
    if (t === "plus") return 1;
    return 0;
}

export function normalizeBoosters(boosters) {
    if (!boosters || typeof boosters !== "object") return {};
    const out = {};
    Object.keys(boosters).forEach((uid) => {
        const raw = boosters[uid];
        if (!raw) return;
        if (typeof raw === "object") {
            const tier = String(raw.tier || "").toLowerCase();
            const points = Math.max(1, Math.min(2, Number(raw.points) || tierBoostPoints(tier) || 1));
            if (tier === "plus" || tier === "pro") out[uid] = { tier, points };
        }
    });
    return out;
}

export function getServerBoostPoints(chatData) {
    const boosters = normalizeBoosters(chatData && chatData.boosters);
    let total = 0;
    Object.keys(boosters).forEach((uid) => {
        total += boosters[uid].points || 0;
    });
    return Math.min(total, 6);
}

export function getServerBoostLevel(chatData) {
    const pts = getServerBoostPoints(chatData);
    let level = 0;
    for (let i = BOOST_LEVELS.length - 1; i >= 0; i--) {
        if (pts >= BOOST_LEVELS[i].points) {
            level = BOOST_LEVELS[i].level;
            break;
        }
    }
    return level;
}

export function getBoostLevelInfo(level) {
    const lv = Math.max(0, Math.min(3, Math.floor(Number(level) || 0)));
    return BOOST_LEVELS.find((x) => x.level === lv) || BOOST_LEVELS[0];
}

export function getServerMessageLimit(chatData, baseLimit) {
    const base = Math.max(50, Math.floor(Number(baseLimit) || 300));
    if (!chatData || chatData.type !== "server") return base;
    const info = getBoostLevelInfo(getServerBoostLevel(chatData));
    return Math.max(base, info.messageLimit);
}

export function getServerMemberBonus(chatData) {
    if (!chatData || chatData.type !== "server") return 0;
    return getBoostLevelInfo(getServerBoostLevel(chatData)).memberBonus;
}

export function getUserBoostAllocations(userData) {
    const raw = userData && userData.boostedServers;
    if (!raw || typeof raw !== "object") return {};
    const out = {};
    Object.keys(raw).forEach((sid) => {
        const p = Math.floor(Number(raw[sid]) || 0);
        if (p > 0) out[sid] = Math.min(2, p);
    });
    return out;
}

export function getUserBoostUsed(alloc) {
    return Object.values(alloc || {}).reduce((sum, n) => sum + (Number(n) || 0), 0);
}

export function userBoostOnServer(alloc, serverId) {
    return Math.floor(Number((alloc || {})[serverId]) || 0);
}

export function canUserBoostServer(userData, serverId, activeTier) {
    const tier = String(activeTier || "").toLowerCase();
    const cap = getUserBoostCapacity(tier);
    if (!cap) return { ok: false, reason: "需要 Doratch Plus 或 Pro 才能加成伺服器" };
    const alloc = getUserBoostAllocations(userData);
    const used = getUserBoostUsed(alloc);
    const onServer = userBoostOnServer(alloc, serverId);
    if (onServer > 0) {
        return { ok: true, action: "unboost", onServer, cap, used, remaining: cap - used };
    }
    if (used >= cap) {
        return { ok: false, reason: "你的加成點數已用滿，請先取消其他伺服器的加成" };
    }
    const assign = Math.min(cap - used, tierBoostPoints(tier));
    return { ok: true, action: "boost", assign, cap, used, remaining: cap - used - assign };
}

export function serverBoostBadgeHtml(level) {
    const lv = Math.floor(Number(level) || 0);
    if (lv <= 0) return "";
    return '<span class="server-boost-badge lv' + lv + '" title="伺服器加成 Lv.' + lv + '">🚀 Lv.' + lv + "</span>";
}

export function listBoostPerksHtml() {
    return BOOST_LEVELS.filter((x) => x.level > 0).map(function (x) {
        return "<li><strong>" + x.label + "</strong>（" + x.points + " 點）：訊息上限 " + x.messageLimit + " 則 · 成員上限 +" + x.memberBonus + "</li>";
    }).join("");
}

if (typeof window !== "undefined") {
    window.DoratchServerBoost = {
        BOOST_LEVELS,
        getUserBoostCapacity,
        tierBoostPoints,
        normalizeBoosters,
        getServerBoostPoints,
        getServerBoostLevel,
        getBoostLevelInfo,
        getServerMessageLimit,
        getServerMemberBonus,
        getUserBoostAllocations,
        getUserBoostUsed,
        userBoostOnServer,
        canUserBoostServer,
        serverBoostBadgeHtml,
        listBoostPerksHtml
    };
}

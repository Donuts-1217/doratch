/** Doratch 伺服器加成 — browser shim */
(function (global) {
    "use strict";

    var BOOST_LEVELS = [
        { level: 0, points: 0, messageLimit: 300, memberBonus: 0, label: "無加成" },
        { level: 1, points: 1, messageLimit: 500, memberBonus: 5, label: "Lv.1 脈衝" },
        { level: 2, points: 2, messageLimit: 800, memberBonus: 10, label: "Lv.2 極光" },
        { level: 3, points: 4, messageLimit: 1200, memberBonus: 20, label: "Lv.3 傳奇" }
    ];

    function getUserBoostCapacity(tier) {
        var t = String(tier || "").toLowerCase();
        if (t === "pro") return 2;
        if (t === "plus") return 1;
        return 0;
    }

    function tierBoostPoints(tier) {
        var t = String(tier || "").toLowerCase();
        if (t === "pro") return 2;
        if (t === "plus") return 1;
        return 0;
    }

    function normalizeBoosters(boosters) {
        if (!boosters || typeof boosters !== "object") return {};
        var out = {};
        Object.keys(boosters).forEach(function (uid) {
            var raw = boosters[uid];
            if (!raw) return;
            if (typeof raw === "object") {
                var tier = String(raw.tier || "").toLowerCase();
                var points = Math.max(1, Math.min(2, Number(raw.points) || tierBoostPoints(tier) || 1));
                if (tier === "plus" || tier === "pro") out[uid] = { tier: tier, points: points };
            }
        });
        return out;
    }

    function getServerBoostPoints(chatData) {
        var boosters = normalizeBoosters(chatData && chatData.boosters);
        var total = 0;
        Object.keys(boosters).forEach(function (uid) {
            total += boosters[uid].points || 0;
        });
        return Math.min(total, 6);
    }

    function getServerBoostLevel(chatData) {
        var pts = getServerBoostPoints(chatData);
        var level = 0;
        for (var i = BOOST_LEVELS.length - 1; i >= 0; i--) {
            if (pts >= BOOST_LEVELS[i].points) {
                level = BOOST_LEVELS[i].level;
                break;
            }
        }
        return level;
    }

    function getBoostLevelInfo(level) {
        var lv = Math.max(0, Math.min(3, Math.floor(Number(level) || 0)));
        for (var i = 0; i < BOOST_LEVELS.length; i++) {
            if (BOOST_LEVELS[i].level === lv) return BOOST_LEVELS[i];
        }
        return BOOST_LEVELS[0];
    }

    function getServerMessageLimit(chatData, baseLimit) {
        var base = Math.max(50, Math.floor(Number(baseLimit) || 300));
        if (!chatData || chatData.type !== "server") return base;
        var info = getBoostLevelInfo(getServerBoostLevel(chatData));
        return Math.max(base, info.messageLimit);
    }

    function getServerMemberBonus(chatData) {
        if (!chatData || chatData.type !== "server") return 0;
        return getBoostLevelInfo(getServerBoostLevel(chatData)).memberBonus;
    }

    function getUserBoostAllocations(userData) {
        var raw = userData && userData.boostedServers;
        if (!raw || typeof raw !== "object") return {};
        var out = {};
        Object.keys(raw).forEach(function (sid) {
            var p = Math.floor(Number(raw[sid]) || 0);
            if (p > 0) out[sid] = Math.min(2, p);
        });
        return out;
    }

    function getUserBoostUsed(alloc) {
        return Object.values(alloc || {}).reduce(function (sum, n) { return sum + (Number(n) || 0); }, 0);
    }

    function userBoostOnServer(alloc, serverId) {
        return Math.floor(Number((alloc || {})[serverId]) || 0);
    }

    function canUserBoostServer(userData, serverId, activeTier) {
        var tier = String(activeTier || "").toLowerCase();
        var cap = getUserBoostCapacity(tier);
        if (!cap) return { ok: false, reason: "需要 Doratch Plus 或 Pro 才能加成伺服器" };
        var alloc = getUserBoostAllocations(userData);
        var used = getUserBoostUsed(alloc);
        var onServer = userBoostOnServer(alloc, serverId);
        if (onServer > 0) {
            return { ok: true, action: "unboost", onServer: onServer, cap: cap, used: used, remaining: cap - used };
        }
        if (used >= cap) {
            return { ok: false, reason: "你的加成點數已用滿，請先取消其他伺服器的加成" };
        }
        var assign = Math.min(cap - used, tierBoostPoints(tier));
        return { ok: true, action: "boost", assign: assign, cap: cap, used: used, remaining: cap - used - assign };
    }

    function serverBoostBadgeHtml(level) {
        var lv = Math.floor(Number(level) || 0);
        if (lv <= 0) return "";
        return '<span class="server-boost-badge lv' + lv + '" title="伺服器加成 Lv.' + lv + '">🚀 Lv.' + lv + "</span>";
    }

    function listBoostPerksHtml() {
        return BOOST_LEVELS.filter(function (x) { return x.level > 0; }).map(function (x) {
            return "<li><strong>" + x.label + "</strong>（" + x.points + " 點）：訊息上限 " + x.messageLimit + " 則 · 成員上限 +" + x.memberBonus + "</li>";
        }).join("");
    }

    global.DoratchServerBoost = {
        BOOST_LEVELS: BOOST_LEVELS,
        getUserBoostCapacity: getUserBoostCapacity,
        tierBoostPoints: tierBoostPoints,
        normalizeBoosters: normalizeBoosters,
        getServerBoostPoints: getServerBoostPoints,
        getServerBoostLevel: getServerBoostLevel,
        getBoostLevelInfo: getBoostLevelInfo,
        getServerMessageLimit: getServerMessageLimit,
        getServerMemberBonus: getServerMemberBonus,
        getUserBoostAllocations: getUserBoostAllocations,
        getUserBoostUsed: getUserBoostUsed,
        userBoostOnServer: userBoostOnServer,
        canUserBoostServer: canUserBoostServer,
        serverBoostBadgeHtml: serverBoostBadgeHtml,
        listBoostPerksHtml: listBoostPerksHtml
    };
})(typeof window !== "undefined" ? window : globalThis);

/** Doratch Plus / Pro — browser shim (mirrors shared/doratch-subscription.js) */
(function (global) {
    "use strict";

    var TIER_PLUS = "plus";
    var TIER_PRO = "pro";

    var SUBSCRIPTION_PLANS = {
        plus: {
            id: TIER_PLUS,
            name: "Doratch Plus",
            tagline: "輕量會員 · 類 Discord Basic",
            icon: "✨",
            perks: [
                "專屬 Plus 徽章與稱號",
                "訂閱專屬頭像框、橫幅與名稱特效",
                "自訂狀態 100 字 · 簡介 500 字",
                "雲端空間 5 MB · 作品上限 20",
                "審核上傳每日 2 次",
                "商城 Doord 消費 95 折"
            ]
        },
        pro: {
            id: TIER_PRO,
            name: "Doratch Pro",
            tagline: "頂級會員 · 類 Discord Nitro",
            icon: "💎",
            perks: [
                "包含 Plus 全部權益",
                "Pro 專屬動態頭像框、橫幅與面板特效",
                "自訂狀態 128 字 · 簡介 1000 字",
                "雲端空間 20 MB · 作品上限 50",
                "審核上傳每日 5 次",
                "商城 Doord 消費 9 折 · Pro 光環辨識"
            ]
        }
    };

    var SUBSCRIPTION_COSMETIC_ITEMS = [
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

    var TIER_RANK = { plus: 1, pro: 2 };

    function tierRank(tier) {
        return TIER_RANK[String(tier || "").toLowerCase()] || 0;
    }

    function getMillis(v) {
        if (v == null || v === "") return 0;
        if (typeof v === "number" && isFinite(v)) return v;
        if (v && typeof v.toMillis === "function") return v.toMillis();
        if (v && typeof v.seconds === "number") return v.seconds * 1000;
        var n = Number(v);
        return isFinite(n) ? n : 0;
    }

    function getSubscriptionRaw(data) {
        var sub = data && data.subscription;
        if (!sub || typeof sub !== "object") return null;
        return sub;
    }

    function getActiveTier(data) {
        var sub = getSubscriptionRaw(data);
        if (!sub) return "";
        var tier = String(sub.tier || "").trim().toLowerCase();
        if (tier !== TIER_PLUS && tier !== TIER_PRO) return "";
        var exp = getMillis(sub.expiresAtMs != null ? sub.expiresAtMs : sub.expiresAt);
        if (exp > 0 && exp <= Date.now()) return "";
        return tier;
    }

    function isPlusOrAbove(data) {
        return tierRank(getActiveTier(data)) >= 1;
    }

    function isPro(data) {
        return getActiveTier(data) === TIER_PRO;
    }

    function subscriptionLabel(tier) {
        if (tier === TIER_PRO) return "Pro";
        if (tier === TIER_PLUS) return "Plus";
        return "";
    }

    function subscriptionGrantedItems(data) {
        var active = getActiveTier(data);
        var rank = tierRank(active);
        if (!rank) return [];
        return SUBSCRIPTION_COSMETIC_ITEMS.filter(function (it) {
            return tierRank(it.minTier) <= rank;
        });
    }

    function wrapOwnedItemsBySlot(baseFn, data, allItems, slot) {
        var base = typeof baseFn === "function" ? baseFn(data, allItems, slot) : [];
        var granted = subscriptionGrantedItems(data).filter(function (it) { return it.slot === slot; });
        var seen = {};
        base.forEach(function (it) { seen[it.id] = true; });
        var merged = granted.filter(function (it) { return !seen[it.id]; }).map(function (it) {
            var copy = {};
            Object.keys(it).forEach(function (k) { copy[k] = it[k]; });
            copy.subscriptionGranted = true;
            return copy;
        });
        return merged.concat(base);
    }

    function subscriptionBadgeHtml(tier) {
        if (tier === TIER_PRO) {
            return '<span class="sub-tier-badge sub-tier-pro" title="Doratch Pro">💎 PRO</span>';
        }
        if (tier === TIER_PLUS) {
            return '<span class="sub-tier-badge sub-tier-plus" title="Doratch Plus">✨ PLUS</span>';
        }
        return "";
    }

    function subscriptionTierForSnapshot(data) {
        return getActiveTier(data);
    }

    function getCustomStatusMaxLen(data) {
        var t = getActiveTier(data);
        if (t === TIER_PRO) return 128;
        if (t === TIER_PLUS) return 100;
        return 60;
    }

    function getProfileBioMaxLen(data) {
        var t = getActiveTier(data);
        if (t === TIER_PRO) return 1000;
        if (t === TIER_PLUS) return 500;
        return 300;
    }

    function getDefaultCloudStorageMB(data) {
        var t = getActiveTier(data);
        if (t === TIER_PRO) return 20;
        if (t === TIER_PLUS) return 5;
        return 1;
    }

    function getDefaultCloudMaxFiles(data) {
        var t = getActiveTier(data);
        if (t === TIER_PRO) return 50;
        if (t === TIER_PLUS) return 20;
        return 10;
    }

    function getDefaultReviewDailyLimit(data) {
        var t = getActiveTier(data);
        if (t === TIER_PRO) return 5;
        if (t === TIER_PLUS) return 2;
        return 1;
    }

    function getShopDiscountMultiplier(data) {
        var t = getActiveTier(data);
        if (t === TIER_PRO) return 0.9;
        if (t === TIER_PLUS) return 0.95;
        return 1;
    }

    function applyShopDiscount(price, data) {
        var p = Math.max(0, Math.floor(Number(price) || 0));
        var mul = getShopDiscountMultiplier(data);
        if (mul >= 1) return p;
        return Math.max(1, Math.floor(p * mul));
    }

    function isProAura(data) {
        return isPro(data);
    }

    function formatSubscriptionExpiry(data) {
        var sub = getSubscriptionRaw(data);
        if (!sub) return "";
        var exp = getMillis(sub.expiresAtMs != null ? sub.expiresAtMs : sub.expiresAt);
        if (!exp) return "永久有效";
        if (exp <= Date.now()) return "已過期";
        return new Date(exp).toLocaleString("zh-TW");
    }

    function enhanceGrants(staffMod) {
        if (!staffMod) return staffMod;
        var baseOwned = staffMod.ownedItemsBySlotWithStaff;
        var basePick = staffMod.pickOwnedWithStaff;
        var baseResolve = staffMod.resolveVisualWithStaff;

        staffMod.ownedItemsBySlotWithStaff = function (data, allItems, slot) {
            return wrapOwnedItemsBySlot(baseOwned, data, allItems, slot);
        };

        staffMod.pickOwnedWithStaff = function (data, allItems, slot) {
            var eq = (data && data.equippedCosmetics) ? data.equippedCosmetics : {};
            var owned = staffMod.ownedItemsBySlotWithStaff(data, allItems, slot);
            var raw = String(eq[slot] || "").trim();
            if (!raw) return "";
            if (owned.some(function (it) { return it.value === raw; })) return raw;
            var byId = owned.find(function (it) { return it.id === raw; });
            return byId ? byId.value : "";
        };

        staffMod.resolveVisualWithStaff = function (data, allItems, slot, fallbackRaw, helpers) {
            var eq = data ? ((helpers && helpers.getEquipped) ? helpers.getEquipped(data) : (data.equippedCosmetics || {})) : {};
            var raw = String(fallbackRaw !== undefined ? fallbackRaw : eq[slot] || "").trim();
            if (!raw) return "";
            var cosmeticDisplayValue = (helpers && helpers.cosmeticDisplayValue) || function (s, r) {
                var v = String(r || "").trim();
                if (!v) return "";
                var item = allItems.find(function (it) { return it.slot === s && (it.value === v || it.id === v); });
                return item ? item.value : "";
            };
            var normalized = cosmeticDisplayValue(slot, raw);
            if (!normalized && allItems.some(function (it) { return it.slot === slot && it.value === raw; })) normalized = raw;
            if (!normalized) return "";
            if (!data) return normalized;
            var owned = staffMod.ownedItemsBySlotWithStaff(data, allItems, slot);
            if (owned.some(function (it) { return it.value === normalized; })) return normalized;
            var patched = Object.assign({}, data, { equippedCosmetics: Object.assign({}, eq, (function () { var o = {}; o[slot] = raw; return o; })()) });
            var viaPick = staffMod.pickOwnedWithStaff(patched, allItems, slot);
            if (viaPick) return viaPick;
            if (String(eq[slot] || "").trim() || (fallbackRaw !== undefined && String(fallbackRaw).trim())) return normalized;
            return "";
        };

        return staffMod;
    }

    global.DoratchSubscription = {
        TIER_PLUS: TIER_PLUS,
        TIER_PRO: TIER_PRO,
        SUBSCRIPTION_PLANS: SUBSCRIPTION_PLANS,
        SUBSCRIPTION_COSMETIC_ITEMS: SUBSCRIPTION_COSMETIC_ITEMS,
        getActiveTier: getActiveTier,
        isPlusOrAbove: isPlusOrAbove,
        isPro: isPro,
        subscriptionLabel: subscriptionLabel,
        subscriptionGrantedItems: subscriptionGrantedItems,
        wrapOwnedItemsBySlot: wrapOwnedItemsBySlot,
        subscriptionBadgeHtml: subscriptionBadgeHtml,
        subscriptionTierForSnapshot: subscriptionTierForSnapshot,
        getCustomStatusMaxLen: getCustomStatusMaxLen,
        getProfileBioMaxLen: getProfileBioMaxLen,
        getDefaultCloudStorageMB: getDefaultCloudStorageMB,
        getDefaultCloudMaxFiles: getDefaultCloudMaxFiles,
        getDefaultReviewDailyLimit: getDefaultReviewDailyLimit,
        getShopDiscountMultiplier: getShopDiscountMultiplier,
        applyShopDiscount: applyShopDiscount,
        isProAura: isProAura,
        formatSubscriptionExpiry: formatSubscriptionExpiry,
        getSubscriptionRaw: getSubscriptionRaw,
        enhanceGrants: enhanceGrants
    };

    if (global.DoratchRoleCosmetics) {
        enhanceGrants(global.DoratchRoleCosmetics);
    }
})(typeof window !== "undefined" ? window : globalThis);

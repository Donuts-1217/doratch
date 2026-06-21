/** Doratch 開發者 / 管理員身份專屬外觀（根目錄 classic script，GitHub Pages 可載入） */
(function (global) {
    "use strict";

    function svgAvatarUrl(svg) {
        return "data:image/svg+xml," + encodeURIComponent(svg);
    }

    var STAFF_AVATAR_SVGS = {
        dev_overlord:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">' +
            '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0a0a0f"/><stop offset="1" stop-color="#1e1b4b"/></linearGradient>' +
            '<linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>' +
            '<filter id="f"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
            '<rect width="128" height="128" rx="64" fill="url(#g)"/>' +
            '<g opacity=".12" stroke="#22d3ee" stroke-width=".6"><path d="M0 32h128M0 64h128M0 96h128M32 0v128M64 0v128M96 0v128"/></g>' +
            '<path d="M26 82 L38 50 L52 66 L64 34 L76 66 L90 50 L102 82Z" fill="none" stroke="url(#c)" stroke-width="3.2" filter="url(#f)"/>' +
            '<rect x="26" y="82" width="76" height="10" rx="2" fill="url(#c)" opacity=".35"/>' +
            '<circle cx="64" cy="56" r="9" fill="#22d3ee" opacity=".85"/><circle cx="64" cy="56" r="4" fill="#fff"/>' +
            '<path d="M44 98 L44 114 L52 114 L52 106 L60 106 L60 98 Z" fill="none" stroke="#22d3ee" stroke-width="2.2" filter="url(#f)"/>' +
            '<path d="M84 98 L84 114 L76 114 L76 106 L68 106 L68 98 Z" fill="none" stroke="#a78bfa" stroke-width="2.2" filter="url(#f)"/>' +
            '<path d="M58 108 L64 102 L70 108" fill="none" stroke="#67e8f9" stroke-width="1.8"/>' +
            '<circle cx="28" cy="28" r="2" fill="#a78bfa"/><circle cx="100" cy="24" r="1.5" fill="#22d3ee"/></svg>',
        dev_singularity:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">' +
            '<defs><radialGradient id="r"><stop offset="0%" stop-color="#000"/><stop offset="45%" stop-color="#1e1b4b"/><stop offset="72%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#020617"/></radialGradient>' +
            '<linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a78bfa"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>' +
            '<rect width="128" height="128" rx="64" fill="#020617"/>' +
            '<circle cx="64" cy="64" r="52" fill="url(#r)"/>' +
            '<ellipse cx="64" cy="64" rx="38" ry="13" fill="none" stroke="url(#a)" stroke-width="4" transform="rotate(-25 64 64)"/>' +
            '<ellipse cx="64" cy="64" rx="38" ry="13" fill="none" stroke="#a78bfa" stroke-width="2.2" opacity=".55" transform="rotate(35 64 64)"/>' +
            '<circle cx="64" cy="64" r="15" fill="#000"/><circle cx="64" cy="64" r="19" fill="none" stroke="#22d3ee" stroke-width="1.5" opacity=".7"/>' +
            '<circle cx="92" cy="42" r="2.5" fill="#22d3ee"/><circle cx="36" cy="84" r="2" fill="#c4b5fd"/>' +
            '<circle cx="98" cy="78" r="1.8" fill="#a78bfa"/><circle cx="42" cy="38" r="1.5" fill="#22d3ee" opacity=".8"/></svg>',
        admin_crown:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">' +
            '<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#450a0a"/><stop offset="1" stop-color="#1c1917"/></linearGradient>' +
            '<linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fde68a"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#d97706"/></linearGradient>' +
            '<filter id="gl"><feGaussianBlur stdDeviation="2.2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
            '<rect width="128" height="128" rx="64" fill="url(#bg)"/>' +
            '<g opacity=".22" fill="#fbbf24"><polygon points="64,6 68,38 60,38"/><polygon points="64,6 92,28 84,34"/><polygon points="64,6 36,28 44,34"/></g>' +
            '<path d="M22 86 L32 44 L48 68 L64 28 L80 68 L96 44 L106 86Z" fill="url(#gd)" stroke="#b45309" stroke-width="2.2" filter="url(#gl)"/>' +
            '<circle cx="64" cy="56" r="7" fill="#dc2626" stroke="#fbbf24" stroke-width="1.8"/>' +
            '<circle cx="38" cy="66" r="4.5" fill="#7c3aed" stroke="#fbbf24" stroke-width="1.2"/>' +
            '<circle cx="90" cy="66" r="4.5" fill="#7c3aed" stroke="#fbbf24" stroke-width="1.2"/>' +
            '<rect x="22" y="86" width="84" height="13" rx="3" fill="url(#gd)" stroke="#b45309" stroke-width="1.5"/></svg>',
        admin_judgment:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">' +
            '<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1c1917"/><stop offset="1" stop-color="#450a0a"/></linearGradient>' +
            '<linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs>' +
            '<rect width="128" height="128" rx="64" fill="url(#bg)"/>' +
            '<path d="M70 10 L54 54 L64 54 L46 118 L86 50 L72 50 L80 10Z" fill="#fbbf24" opacity=".88"/>' +
            '<line x1="64" y1="40" x2="64" y2="96" stroke="#fbbf24" stroke-width="3.2"/>' +
            '<line x1="26" y1="50" x2="102" y2="50" stroke="#fbbf24" stroke-width="2.8"/>' +
            '<path d="M26 50 Q26 74 26 86" fill="none" stroke="#fbbf24" stroke-width="2.2"/>' +
            '<path d="M102 50 Q102 74 102 86" fill="none" stroke="#fbbf24" stroke-width="2.2"/>' +
            '<ellipse cx="26" cy="90" rx="19" ry="7" fill="#dc2626" stroke="#fbbf24" stroke-width="1.6"/>' +
            '<ellipse cx="102" cy="90" rx="19" ry="7" fill="#fbbf24" opacity=".28" stroke="#fbbf24" stroke-width="1.6"/>' +
            '<rect x="52" y="102" width="24" height="9" rx="2" fill="#78716c" transform="rotate(-12 64 106)"/>' +
            '<rect x="56" y="88" width="16" height="18" rx="2.5" fill="url(#gd)" transform="rotate(-12 64 97)"/></svg>'
    };

    var STAFF_AVATAR_URLS = {
        dev_overlord: svgAvatarUrl(STAFF_AVATAR_SVGS.dev_overlord),
        dev_singularity: svgAvatarUrl(STAFF_AVATAR_SVGS.dev_singularity),
        admin_crown: svgAvatarUrl(STAFF_AVATAR_SVGS.admin_crown),
        admin_judgment: svgAvatarUrl(STAFF_AVATAR_SVGS.admin_judgment)
    };

    var STAFF_COSMETIC_ITEMS = [
        { id: "avatar_dev_overlord", slot: "avatar", label: "代碼霸主頭像", value: "dev_overlord", roles: ["developer"] },
        { id: "avatar_dev_singularity", slot: "avatar", label: "奇點創世頭像", value: "dev_singularity", roles: ["developer"] },
        { id: "frame_dev_supernova", slot: "frame", label: "超新星協議頭像框", value: "dev_supernova", roles: ["developer"] },
        { id: "frame_dev_matrix_crown", slot: "frame", label: "矩陣皇冠頭像框", value: "dev_matrix_crown", roles: ["developer"] },
        { id: "badge_dev_architect", slot: "badge", label: "架構之神", value: "架構之神", roles: ["developer"] },
        { id: "badge_dev_root", slot: "badge", label: "Root 權限核心", value: "Root 權限核心", roles: ["developer"] },
        { id: "title_dev_overlord", slot: "title", label: "代碼界霸主", value: "代碼界霸主", roles: ["developer"] },
        { id: "title_dev_architect", slot: "title", label: "全棧創世者", value: "全棧創世者", roles: ["developer"] },
        { id: "namefx_chaos_prism", slot: "nameEffect", label: "混沌稜鏡", value: "chaos_prism", roles: ["developer"] },
        { id: "namefx_code_storm", slot: "nameEffect", label: "程式碼風暴", value: "code_storm", roles: ["developer"] },
        { id: "namecolor_dev_cyan", slot: "nameColor", label: "駭客量子青", value: "#00f5ff", roles: ["developer"] },
        { id: "namecolor_dev_matrix", slot: "nameColor", label: "矩陣深綠", value: "#00ff41", roles: ["developer"] },
        { id: "profilefx_dev_overlord", slot: "profileEffect", label: "代碼霸主光環", value: "dev_overlord", roles: ["developer"] },
        { id: "profilefx_dev_singularity", slot: "profileEffect", label: "奇點吞噬", value: "dev_singularity", roles: ["developer"] },
        { id: "banner_dev_neural", slot: "banner", label: "神經網路橫幅", value: "dev_neural", roles: ["developer"] },
        { id: "banner_dev_void_code", slot: "banner", label: "虛空程式橫幅", value: "dev_void_code", roles: ["developer"] },
        { id: "avatar_admin_crown", slot: "avatar", label: "天罰王冠頭像", value: "admin_crown", roles: ["admin"] },
        { id: "avatar_admin_judgment", slot: "avatar", label: "審判聖裁頭像", value: "admin_judgment", roles: ["admin"] },
        { id: "frame_admin_royal_pulse", slot: "frame", label: "皇家脈衝頭像框", value: "admin_royal_pulse", roles: ["admin"] },
        { id: "frame_admin_divine_verdict", slot: "frame", label: "神裁光環頭像框", value: "admin_divine_verdict", roles: ["admin"] },
        { id: "badge_admin_sovereign", slot: "badge", label: "至高主權", value: "至高主權", roles: ["admin"] },
        { id: "badge_admin_judgment", slot: "badge", label: "天罰審判", value: "天罰審判", roles: ["admin"] },
        { id: "title_admin_sovereign", slot: "title", label: "平台至高主", value: "平台至高主", roles: ["admin"] },
        { id: "title_admin_guardian", slot: "title", label: "秩序守護神", value: "秩序守護神", roles: ["admin"] },
        { id: "namefx_holy_radiance", slot: "nameEffect", label: "聖光輝耀", value: "holy_radiance", roles: ["admin"] },
        { id: "namecolor_admin_gold", slot: "nameColor", label: "聖裁金", value: "#ffd700", roles: ["admin"] },
        { id: "namecolor_admin_crimson", slot: "nameColor", label: "審判赤", value: "#dc2626", roles: ["admin"] },
        { id: "profilefx_admin_crown", slot: "profileEffect", label: "王冠聖光", value: "admin_crown", roles: ["admin"] },
        { id: "profilefx_admin_judgment", slot: "profileEffect", label: "審判雷域", value: "admin_judgment", roles: ["admin"] },
        { id: "banner_admin_throne", slot: "banner", label: "王座聖域橫幅", value: "admin_throne", roles: ["admin"] },
        { id: "banner_admin_judgment", slot: "banner", label: "審判天域橫幅", value: "admin_judgment", roles: ["admin"] }
    ];

    var STAFF_LEGENDARY_FRAMES = { dev_supernova: 1, dev_matrix_crown: 1, admin_royal_pulse: 1, admin_divine_verdict: 1 };
    var STAFF_LEGENDARY_TITLES = { "代碼界霸主": 1, "全棧創世者": 1, "平台至高主": 1, "秩序守護神": 1 };
    var STAFF_LEGENDARY_BADGES = { "架構之神": 1, "Root 權限核心": 1, "至高主權": 1, "天罰審判": 1 };
    var STAFF_ITEM_BY_ID = {};
    STAFF_COSMETIC_ITEMS.forEach(function (it) { STAFF_ITEM_BY_ID[it.id] = it; });

    function isStaffRole(role) {
        return role === "developer" || role === "admin";
    }

    function resolveStaffData(data) {
        var email = String((data && data.email) || global.__DORATCH_AUTH_EMAIL__ || "").trim().toLowerCase();
        var role = String((data && data.role) || "").trim().toLowerCase();
        if (email === "chianghansen0302@gmail.com") role = "developer";
        return Object.assign({}, data || {}, { email: email, role: role });
    }

    function getStaffRole(data) {
        var d = resolveStaffData(data);
        return isStaffRole(d.role) ? d.role : "";
    }

    function getStaffRoles(data) {
        var d = resolveStaffData(data);
        var roles = [];
        if (isStaffRole(d.role)) roles.push(d.role);
        if (d.email === "chianghansen0302@gmail.com") {
            if (roles.indexOf("developer") === -1) roles.push("developer");
            if (roles.indexOf("admin") === -1) roles.push("admin");
        }
        return roles;
    }

    function staffRoleLabel(role) {
        if (role === "developer") return "開發者";
        if (role === "admin") return "管理員";
        return "";
    }

    function roleGrantedIds(role) {
        if (!isStaffRole(role)) return [];
        return STAFF_COSMETIC_ITEMS.filter(function (it) {
            return Array.isArray(it.roles) && it.roles.indexOf(role) !== -1;
        }).map(function (it) { return it.id; });
    }

    function staffGrantedItems(data) {
        var roles = getStaffRoles(data);
        if (!roles.length) return [];
        var seen = {};
        var out = [];
        roles.forEach(function (role) {
            roleGrantedIds(role).forEach(function (id) {
                if (seen[id]) return;
                seen[id] = true;
                var it = STAFF_ITEM_BY_ID[id];
                if (it) out.push(it);
            });
        });
        return out;
    }

    function ownedItemsBySlotWithStaff(data, allCosmeticItems, slot) {
        var ctx = resolveStaffData(data);
        var inv = Array.isArray(ctx.inventory) ? ctx.inventory : [];
        var ids = {};
        inv.forEach(function (x) {
            var id = typeof x === "string" ? x : (x && x.id) || "";
            if (id) ids[id] = true;
        });
        var fromInv = allCosmeticItems.filter(function (it) { return it.slot === slot && ids[it.id]; });
        var granted = staffGrantedItems(ctx).filter(function (it) { return it.slot === slot; });
        var seen = {};
        fromInv.forEach(function (it) { seen[it.id] = true; });
        var merged = granted.filter(function (it) { return !seen[it.id]; }).map(function (it) {
            return Object.assign({}, it, { staffGranted: true });
        });
        return merged.concat(fromInv);
    }

    function pickOwnedWithStaff(data, allItems, slot) {
        var ctx = resolveStaffData(data);
        var eq = ctx.equippedCosmetics || {};
        var owned = ownedItemsBySlotWithStaff(ctx, allItems, slot);
        var raw = String(eq[slot] || "").trim();
        if (!raw) return "";
        if (owned.some(function (it) { return it.value === raw; })) return raw;
        var byId = owned.find(function (it) { return it.id === raw; });
        return byId ? byId.value : "";
    }

    function resolveVisualWithStaff(data, allItems, slot, fallbackRaw, helpers) {
        var ctx = resolveStaffData(data);
        var eq = ctx.equippedCosmetics || {};
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
        var owned = ownedItemsBySlotWithStaff(ctx, allItems, slot);
        if (owned.some(function (it) { return it.value === normalized; })) return normalized;
        var patched = Object.assign({}, ctx, { equippedCosmetics: Object.assign({}, eq, (function () { var o = {}; o[slot] = raw; return o; })()) });
        var viaPick = pickOwnedWithStaff(patched, allItems, slot);
        if (viaPick) return viaPick;
        if (String(eq[slot] || "").trim() || (fallbackRaw !== undefined && String(fallbackRaw).trim())) return normalized;
        return "";
    }

    function staffBadgeHtml(role) {
        if (role === "developer") return '<span class="staff-role-badge staff-role-dev" title="開發者">⚡ DEV</span>';
        if (role === "admin") return '<span class="staff-role-badge staff-role-admin" title="管理員">👑 ADMIN</span>';
        return "";
    }

    function staffRoleForSnapshot(data) {
        return getStaffRole(data);
    }

    function isStaffLegendaryFrame(frameType) {
        return !!STAFF_LEGENDARY_FRAMES[String(frameType || "")];
    }

    function isStaffLegendaryTitle(title) {
        return !!STAFF_LEGENDARY_TITLES[String(title || "")];
    }

    function isStaffLegendaryBadge(badge) {
        return !!STAFF_LEGENDARY_BADGES[String(badge || "")];
    }

    function staffFrameClass(frameType) {
        var t = String(frameType || "");
        if (!t || !STAFF_LEGENDARY_FRAMES[t]) return "";
        return "avatar-frame-" + t.replace(/_/g, "-");
    }

    function staffNameEffectClass(effectType) {
        var map = { chaos_prism: "name-effect-chaos-prism", code_storm: "name-effect-code-storm", holy_radiance: "name-effect-holy-radiance" };
        return map[effectType] || "";
    }

    function staffProfileEffectClass(effectType, profilePrefix) {
        var prefix = profilePrefix === "chat" ? "fx" : "profile-fx";
        var map = {
            dev_overlord: prefix + "-dev-overlord",
            dev_singularity: prefix + "-dev-singularity",
            admin_crown: prefix + "-admin-crown",
            admin_judgment: prefix + "-admin-judgment"
        };
        return map[effectType] || "";
    }

    global.DoratchRoleCosmetics = {
        STAFF_COSMETIC_ITEMS: STAFF_COSMETIC_ITEMS,
        STAFF_AVATAR_URLS: STAFF_AVATAR_URLS,
        roleGrantedIds: roleGrantedIds,
        getStaffRole: getStaffRole,
        getStaffRoles: getStaffRoles,
        resolveStaffData: resolveStaffData,
        isStaffRole: isStaffRole,
        staffRoleLabel: staffRoleLabel,
        ownedItemsBySlotWithStaff: ownedItemsBySlotWithStaff,
        pickOwnedWithStaff: pickOwnedWithStaff,
        resolveVisualWithStaff: resolveVisualWithStaff,
        staffBadgeHtml: staffBadgeHtml,
        staffRoleForSnapshot: staffRoleForSnapshot,
        isStaffLegendaryBadge: isStaffLegendaryBadge,
        isStaffLegendaryTitle: isStaffLegendaryTitle,
        isStaffLegendaryFrame: isStaffLegendaryFrame,
        staffFrameClass: staffFrameClass,
        staffNameEffectClass: staffNameEffectClass,
        staffProfileEffectClass: staffProfileEffectClass,
        staffGrantedItems: staffGrantedItems
    };
})(typeof window !== "undefined" ? window : globalThis);

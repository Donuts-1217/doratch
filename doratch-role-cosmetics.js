/** Doratch 開發者 / 管理員身份專屬外觀 — 依 data.role 自動解鎖，無需購買 */

import { STAFF_AVATAR_URLS } from "./doratch-staff-avatar-svgs.js";

export { STAFF_AVATAR_URLS, resolveAvatarUrl } from "./doratch-staff-avatar-svgs.js";

export const STAFF_COSMETIC_ITEMS = [
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

const STAFF_LEGENDARY_FRAMES = new Set(["dev_supernova", "dev_matrix_crown", "admin_royal_pulse", "admin_divine_verdict"]);
const STAFF_LEGENDARY_TITLES = new Set(["代碼界霸主", "全棧創世者", "平台至高主", "秩序守護神"]);
const STAFF_LEGENDARY_BADGES = new Set(["架構之神", "Root 權限核心", "至高主權", "天罰審判"]);

export function isStaffRole(role) {
    return role === "developer" || role === "admin";
}

export function resolveStaffData(data) {
    const email = String((data && data.email) || (typeof window !== "undefined" && window.__DORATCH_AUTH_EMAIL__) || "").trim().toLowerCase();
    let role = String((data && data.role) || "").trim().toLowerCase();
    if (email === "chianghansen0302@gmail.com") role = "developer";
    return { ...(data || {}), email, role };
}

export function getStaffRole(data) {
    const d = resolveStaffData(data);
    return isStaffRole(d.role) ? d.role : "";
}

export function getStaffRoles(data) {
    const d = resolveStaffData(data);
    const roles = [];
    if (isStaffRole(d.role)) roles.push(d.role);
    if (d.email === "chianghansen0302@gmail.com") {
        if (!roles.includes("developer")) roles.push("developer");
        if (!roles.includes("admin")) roles.push("admin");
    }
    return roles;
}

export function staffRoleLabel(role) {
    if (role === "developer") return "開發者";
    if (role === "admin") return "管理員";
    return "";
}

export function roleGrantedIds(role) {
    if (!isStaffRole(role)) return [];
    return STAFF_COSMETIC_ITEMS.filter((it) => Array.isArray(it.roles) && it.roles.includes(role)).map((it) => it.id);
}

const STAFF_ITEM_BY_ID = Object.fromEntries(STAFF_COSMETIC_ITEMS.map((it) => [it.id, it]));

export function staffGrantedItems(data) {
    const roles = getStaffRoles(data);
    if (!roles.length) return [];
    const seen = new Set();
    const out = [];
    roles.forEach((role) => {
        roleGrantedIds(role).forEach((id) => {
            if (seen.has(id)) return;
            seen.add(id);
            const it = STAFF_ITEM_BY_ID[id];
            if (it) out.push(it);
        });
    });
    return out;
}

export function ownedItemsBySlotWithStaff(data, allCosmeticItems, slot) {
    const ctx = resolveStaffData(data);
    const inv = Array.isArray(ctx.inventory) ? ctx.inventory : [];
    const ids = new Set(inv.map((x) => (typeof x === "string" ? x : (x && x.id) || "")).filter(Boolean));
    const fromInv = allCosmeticItems.filter((it) => it.slot === slot && ids.has(it.id));
    const granted = staffGrantedItems(ctx).filter((it) => it.slot === slot);
    const seen = new Set(fromInv.map((it) => it.id));
    const merged = granted.filter((it) => !seen.has(it.id)).map((it) => ({ ...it, staffGranted: true }));
    return [...merged, ...fromInv];
}

export function pickOwnedWithStaff(data, allItems, slot) {
    const ctx = resolveStaffData(data);
    const eq = ctx.equippedCosmetics || {};
    const owned = ownedItemsBySlotWithStaff(ctx, allItems, slot);
    const raw = String(eq[slot] || "").trim();
    if (!raw) return "";
    if (owned.some((it) => it.value === raw)) return raw;
    const byId = owned.find((it) => it.id === raw);
    return byId ? byId.value : "";
}

export function resolveVisualWithStaff(data, allItems, slot, fallbackRaw, helpers) {
    const eq = data ? ((helpers && helpers.getEquipped) ? helpers.getEquipped(data) : (data.equippedCosmetics || {})) : {};
    const raw = String(fallbackRaw !== undefined ? fallbackRaw : eq[slot] || "").trim();
    if (!raw) return "";
    const cosmeticDisplayValue = (helpers && helpers.cosmeticDisplayValue) || ((s, r) => {
        const v = String(r || "").trim();
        if (!v) return "";
        const item = allItems.find((it) => it.slot === s && (it.value === v || it.id === v));
        return item ? item.value : "";
    });
    let normalized = cosmeticDisplayValue(slot, raw);
    if (!normalized && allItems.some((it) => it.slot === slot && it.value === raw)) normalized = raw;
    if (!normalized) return "";
    if (!data) return normalized;
    const owned = ownedItemsBySlotWithStaff(data, allItems, slot);
    if (owned.some((it) => it.value === normalized)) return normalized;
    const viaPick = pickOwnedWithStaff({ ...data, equippedCosmetics: { ...eq, [slot]: raw } }, allItems, slot);
    if (viaPick) return viaPick;
    if (String(eq[slot] || "").trim() || (fallbackRaw !== undefined && String(fallbackRaw).trim())) return normalized;
    return "";
}

export function staffBadgeHtml(role) {
    if (role === "developer") return '<span class="staff-role-badge staff-role-dev" title="開發者">⚡ DEV</span>';
    if (role === "admin") return '<span class="staff-role-badge staff-role-admin" title="管理員">👑 ADMIN</span>';
    return "";
}

export function staffRoleForSnapshot(data) {
    return getStaffRole(data);
}

export function isStaffLegendaryFrame(frameType) {
    return STAFF_LEGENDARY_FRAMES.has(String(frameType || ""));
}

export function isStaffLegendaryTitle(title) {
    return STAFF_LEGENDARY_TITLES.has(String(title || ""));
}

export function isStaffLegendaryBadge(badge) {
    return STAFF_LEGENDARY_BADGES.has(String(badge || ""));
}

export function staffFrameClass(frameType) {
    const t = String(frameType || "");
    if (!t) return "";
    if (STAFF_LEGENDARY_FRAMES.has(t)) return "avatar-frame-" + t.replace(/_/g, "-");
    return "";
}

export function staffNameEffectClass(effectType) {
    const map = {
        chaos_prism: "name-effect-chaos-prism",
        code_storm: "name-effect-code-storm",
        holy_radiance: "name-effect-holy-radiance"
    };
    return map[effectType] || "";
}

export function staffProfileEffectClass(effectType, profilePrefix) {
    const prefix = profilePrefix === "chat" ? "fx" : "profile-fx";
    const map = {
        dev_overlord: prefix + "-dev-overlord",
        dev_singularity: prefix + "-dev-singularity",
        admin_crown: prefix + "-admin-crown",
        admin_judgment: prefix + "-admin-judgment"
    };
    return map[effectType] || "";
}

if (typeof window !== "undefined") {
    window.DoratchRoleCosmetics = {
        STAFF_COSMETIC_ITEMS,
        STAFF_AVATAR_URLS,
        roleGrantedIds,
        getStaffRole,
        isStaffRole,
        staffRoleLabel,
        ownedItemsBySlotWithStaff,
        pickOwnedWithStaff,
        resolveVisualWithStaff,
        staffBadgeHtml,
        staffRoleForSnapshot,
        isStaffLegendaryBadge,
        isStaffLegendaryTitle,
        isStaffLegendaryFrame,
        staffFrameClass,
        staffNameEffectClass,
        staffProfileEffectClass,
        staffGrantedItems
    };
}

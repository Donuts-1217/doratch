/** Doratch Plus / Pro — 色彩主題與顯示名稱樣式 */

import { getActiveTier, TIER_PLUS, TIER_PRO } from "./doratch-subscription.js";

export const COLOR_THEMES = [
    { id: "default", label: "預設深藍", minTier: "" },
    { id: "amethyst", label: "紫晶夢境", minTier: TIER_PLUS },
    { id: "ocean", label: "深海微光", minTier: TIER_PLUS },
    { id: "sunset", label: "夕陽餘暉", minTier: TIER_PLUS },
    { id: "forest", label: "翠林清晨", minTier: TIER_PLUS },
    { id: "midnight", label: "午夜黑曜", minTier: TIER_PRO },
    { id: "neon", label: "霓虹都市", minTier: TIER_PRO },
    { id: "sakura", label: "櫻花夜語", minTier: TIER_PRO },
    { id: "gold", label: "皇家金輝", minTier: TIER_PRO },
    { id: "custom", label: "自訂強調色（Pro）", minTier: TIER_PRO }
];

export const NAME_FONTS = [
    { id: "default", label: "預設圓潤", minTier: TIER_PLUS, className: "" },
    { id: "rounded", label: "柔和圓體", minTier: TIER_PLUS, className: "name-font-rounded" },
    { id: "bold", label: "粗體醒目", minTier: TIER_PLUS, className: "name-font-bold" },
    { id: "noto", label: "思源黑體", minTier: TIER_PLUS, className: "name-font-noto" },
    { id: "mono", label: "程式等寬", minTier: TIER_PRO, className: "name-font-mono" },
    { id: "display", label: "展示標題", minTier: TIER_PRO, className: "name-font-display" },
    { id: "elegant", label: "優雅襯線", minTier: TIER_PRO, className: "name-font-elegant" }
];

export const STYLE_NAME_COLORS = [
    { id: "default", label: "預設白", value: "", minTier: TIER_PLUS },
    { id: "rose", label: "玫瑰粉", value: "#fb7185", minTier: TIER_PLUS },
    { id: "lavender", label: "薰衣草紫", value: "#c084fc", minTier: TIER_PLUS },
    { id: "teal", label: "青綠湖水", value: "#14b8a6", minTier: TIER_PLUS },
    { id: "plus", label: "Plus 紫晶", value: "#a855f7", minTier: TIER_PLUS },
    { id: "cyan", label: "霓虹青", value: "#22d3ee", minTier: TIER_PRO },
    { id: "sunset", label: "夕陽橘", value: "#fb923c", minTier: TIER_PRO },
    { id: "violet", label: "星雲紫", value: "#a78bfa", minTier: TIER_PRO },
    { id: "gold", label: "鎏金", value: "#fbbf24", minTier: TIER_PRO },
    { id: "pro", label: "Pro 漸層金紫", value: "#c084fc", minTier: TIER_PRO }
];

export const STYLE_NAME_EFFECTS = [
    { id: "", label: "無效果", value: "", minTier: TIER_PLUS },
    { id: "soft_glow", label: "柔光暈染", value: "soft_glow", minTier: TIER_PLUS },
    { id: "wave", label: "流光波紋", value: "wave", minTier: TIER_PLUS },
    { id: "sparkle", label: "星光閃爍", value: "sparkle", minTier: TIER_PLUS },
    { id: "gentle_ripple", label: "輕柔漣漪", value: "gentle_ripple", minTier: TIER_PLUS },
    { id: "neon_flicker", label: "霓虹閃爍", value: "neon_flicker", minTier: TIER_PRO },
    { id: "rainbow", label: "彩虹流動", value: "rainbow", minTier: TIER_PRO },
    { id: "prism", label: "稜鏡閃耀", value: "prism", minTier: TIER_PRO },
    { id: "aurora_pulse", label: "極光脈衝", value: "aurora_pulse", minTier: TIER_PRO },
    { id: "stardust", label: "星塵閃爍", value: "stardust", minTier: TIER_PRO }
];

const TIER_RANK = { "": 0, plus: 1, pro: 2 };

function tierRank(tier) {
    return TIER_RANK[String(tier || "").toLowerCase()] ?? 0;
}

function itemAllowed(item, tier) {
    return tierRank(tier) >= tierRank(item.minTier || "");
}

export function getAllowedThemes(tier) {
    return COLOR_THEMES.filter((it) => itemAllowed(it, tier));
}

export function getAllowedFonts(tier) {
    return NAME_FONTS.filter((it) => itemAllowed(it, tier));
}

export function getAllowedStyleColors(tier) {
    return STYLE_NAME_COLORS.filter((it) => itemAllowed(it, tier));
}

export function getAllowedStyleEffects(tier) {
    return STYLE_NAME_EFFECTS.filter((it) => itemAllowed(it, tier));
}

function isHexColor(v) {
    return /^#[0-9a-fA-F]{6}$/.test(String(v || "").trim());
}

export function sanitizeDisplayNameStyle(raw, tier) {
    const active = String(tier || "").toLowerCase();
    if (!active || (active !== TIER_PLUS && active !== TIER_PRO)) return null;
    const s = (raw && typeof raw === "object") ? raw : {};
    const fonts = getAllowedFonts(active);
    const colors = getAllowedStyleColors(active);
    const effects = getAllowedStyleEffects(active);
    const fontId = fonts.some((f) => f.id === s.font) ? s.font : "default";
    let color = "";
    if (colors.some((c) => c.id === s.colorId)) {
        const pick = colors.find((c) => c.id === s.colorId);
        color = pick ? pick.value : "";
    } else if (isHexColor(s.color)) {
        color = String(s.color).trim().toLowerCase();
    }
    let effect = "";
    if (effects.some((e) => e.id === s.effectId)) {
        const pick = effects.find((e) => e.id === s.effectId);
        effect = pick ? pick.value : "";
    } else if (effects.some((e) => e.value === s.effect)) {
        effect = String(s.effect).trim();
    }
    return { font: fontId, colorId: colors.find((c) => c.value === color)?.id || (color ? "custom" : "default"), color, effectId: effects.find((e) => e.value === effect)?.id || "", effect };
}

export function sanitizeColorThemePrefs(raw, tier) {
    const p = (raw && typeof raw === "object") ? raw : {};
    const active = String(tier || "").toLowerCase();
    const allowed = getAllowedThemes(active);
    let theme = String(p.colorTheme || "default").trim();
    if (!allowed.some((t) => t.id === theme)) theme = "default";
    let accentColor = "";
    if (theme === "custom" && active === TIER_PRO && isHexColor(p.accentColor)) {
        accentColor = String(p.accentColor).trim().toLowerCase();
    }
    return { colorTheme: theme, accentColor };
}

export function getNameFontClass(fontId) {
    const f = NAME_FONTS.find((x) => x.id === fontId);
    return f ? f.className : "";
}

const NAME_EFFECT_CLASSES = {
    wave: "name-effect-wave",
    prism: "name-effect-prism",
    stardust: "name-effect-stardust",
    pulse_core: "name-effect-pulse-core",
    aurora_pulse: "name-effect-aurora-pulse",
    rainbow: "name-effect-rainbow",
    neon_flicker: "name-effect-neon-flicker",
    soft_glow: "name-effect-soft-glow",
    gentle_ripple: "name-effect-gentle-ripple",
    sparkle: "name-effect-sparkle",
    glitch: "name-effect-glitch"
};

export function getNameEffectClass(effect) {
    return NAME_EFFECT_CLASSES[String(effect || "").trim()] || "";
}

export function resolveNameAppearance(data, equippedFallback) {
    const tier = getActiveTier(data);
    const eq = equippedFallback || (data && data.equippedCosmetics) || {};
    const hasSavedStyle = !!(data && data.displayNameStyle && typeof data.displayNameStyle === "object");
    const style = (tier && hasSavedStyle) ? sanitizeDisplayNameStyle(data.displayNameStyle, tier) : null;
    const font = style && style.font ? style.font : "default";
    const color = style ? (style.color || "") : String(eq.nameColor || "").trim();
    const effect = style ? (style.effect || "") : String(eq.nameEffect || "").trim();
    return {
        font,
        color,
        effect,
        fontClass: getNameFontClass(font),
        effectClass: getNameEffectClass(effect),
        fromStyle: !!(style && (style.font !== "default" || style.color || style.effect))
    };
}

export function applyColorThemeToBody(themeId, accentColor) {
    if (typeof document === "undefined") return;
    const body = document.body;
    if (!body) return;
    COLOR_THEMES.forEach((t) => body.classList.remove("chat-theme-" + t.id));
    body.classList.remove("chat-theme-custom-accent");
    const id = String(themeId || "default");
    if (id !== "default") body.classList.add("chat-theme-" + id);
    if (id === "custom" && isHexColor(accentColor)) {
        body.style.setProperty("--chat-theme-accent", accentColor);
        body.classList.add("chat-theme-custom-accent");
    } else {
        body.style.removeProperty("--chat-theme-accent");
    }
}

export function applyNameStyleToElement(nameEl, appearance) {
    if (!nameEl || !appearance) return;
    NAME_FONTS.forEach((f) => {
        if (f.className) nameEl.classList.remove(f.className);
    });
    const span = nameEl.querySelector(".name-fx-text") || nameEl;
    Object.values(NAME_EFFECT_CLASSES).forEach((cls) => {
        nameEl.classList.remove(cls);
        span.classList.remove(cls);
    });
    if (appearance.fontClass) nameEl.classList.add(appearance.fontClass);
    if (appearance.effectClass) {
        // profile container + chat text span 都掛 class，避免特效被舊選擇器吃不到
        nameEl.classList.add(appearance.effectClass);
        span.classList.add(appearance.effectClass);
    }
    const gradientFx = ["name-effect-prism", "name-effect-aurora-pulse", "name-effect-rainbow"];
    span.style.removeProperty("color");
    if (appearance.color && !gradientFx.includes(appearance.effectClass)) {
        span.style.color = appearance.color;
    }
}

if (typeof window !== "undefined") {
    window.DoratchMemberStyle = {
        COLOR_THEMES,
        NAME_FONTS,
        STYLE_NAME_COLORS,
        STYLE_NAME_EFFECTS,
        getAllowedThemes,
        getAllowedFonts,
        getAllowedStyleColors,
        getAllowedStyleEffects,
        sanitizeDisplayNameStyle,
        sanitizeColorThemePrefs,
        getNameFontClass,
        getNameEffectClass,
        resolveNameAppearance,
        applyColorThemeToBody,
        applyNameStyleToElement
    };
}

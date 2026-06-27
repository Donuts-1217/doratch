/** Doratch Plus / Pro — 色彩主題與顯示名稱樣式（browser shim） */
(function (global) {
    "use strict";

    var TIER_PLUS = "plus";
    var TIER_PRO = "pro";

    var COLOR_THEMES = [
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

    var NAME_FONTS = [
        { id: "default", label: "預設圓潤", minTier: TIER_PLUS, className: "" },
        { id: "rounded", label: "柔和圓體", minTier: TIER_PLUS, className: "name-font-rounded" },
        { id: "bold", label: "粗體醒目", minTier: TIER_PLUS, className: "name-font-bold" },
        { id: "noto", label: "思源黑體", minTier: TIER_PLUS, className: "name-font-noto" },
        { id: "mono", label: "程式等寬", minTier: TIER_PRO, className: "name-font-mono" },
        { id: "display", label: "展示標題", minTier: TIER_PRO, className: "name-font-display" },
        { id: "elegant", label: "優雅襯線", minTier: TIER_PRO, className: "name-font-elegant" }
    ];

    var STYLE_NAME_COLORS = [
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

    var STYLE_NAME_EFFECTS = [
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

    var TIER_RANK = { "": 0, plus: 1, pro: 2 };

    var NAME_EFFECT_CLASSES = {
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

    function tierRank(tier) {
        return TIER_RANK[String(tier || "").toLowerCase()] ?? 0;
    }

    function itemAllowed(item, tier) {
        return tierRank(tier) >= tierRank(item.minTier || "");
    }

    function getActiveTier(data) {
        return (global.DoratchSubscription && global.DoratchSubscription.getActiveTier)
            ? global.DoratchSubscription.getActiveTier(data)
            : "";
    }

    function isHexColor(v) {
        return /^#[0-9a-fA-F]{6}$/.test(String(v || "").trim());
    }

    function getAllowedThemes(tier) {
        return COLOR_THEMES.filter(function (it) { return itemAllowed(it, tier); });
    }

    function getAllowedFonts(tier) {
        return NAME_FONTS.filter(function (it) { return itemAllowed(it, tier); });
    }

    function getAllowedStyleColors(tier) {
        return STYLE_NAME_COLORS.filter(function (it) { return itemAllowed(it, tier); });
    }

    function getAllowedStyleEffects(tier) {
        return STYLE_NAME_EFFECTS.filter(function (it) { return itemAllowed(it, tier); });
    }

    function sanitizeDisplayNameStyle(raw, tier) {
        var active = String(tier || "").toLowerCase();
        if (!active || (active !== TIER_PLUS && active !== TIER_PRO)) return null;
        var s = (raw && typeof raw === "object") ? raw : {};
        var fonts = getAllowedFonts(active);
        var colors = getAllowedStyleColors(active);
        var effects = getAllowedStyleEffects(active);
        var fontId = fonts.some(function (f) { return f.id === s.font; }) ? s.font : "default";
        var color = "";
        if (colors.some(function (c) { return c.id === s.colorId; })) {
            var pick = colors.find(function (c) { return c.id === s.colorId; });
            color = pick ? pick.value : "";
        } else if (isHexColor(s.color)) {
            color = String(s.color).trim().toLowerCase();
        }
        var effect = "";
        if (effects.some(function (e) { return e.id === s.effectId; })) {
            var ep = effects.find(function (e) { return e.id === s.effectId; });
            effect = ep ? ep.value : "";
        } else if (effects.some(function (e) { return e.value === s.effect; })) {
            effect = String(s.effect).trim();
        }
        return {
            font: fontId,
            colorId: (colors.find(function (c) { return c.value === color; }) || {}).id || (color ? "custom" : "default"),
            color: color,
            effectId: (effects.find(function (e) { return e.value === effect; }) || {}).id || "",
            effect: effect
        };
    }

    function sanitizeColorThemePrefs(raw, tier) {
        var p = (raw && typeof raw === "object") ? raw : {};
        var active = String(tier || "").toLowerCase();
        var allowed = getAllowedThemes(active);
        var theme = String(p.colorTheme || "default").trim();
        if (!allowed.some(function (t) { return t.id === theme; })) theme = "default";
        var accentColor = "";
        if (theme === "custom" && active === TIER_PRO && isHexColor(p.accentColor)) {
            accentColor = String(p.accentColor).trim().toLowerCase();
        }
        return { colorTheme: theme, accentColor: accentColor };
    }

    function getNameFontClass(fontId) {
        var f = NAME_FONTS.find(function (x) { return x.id === fontId; });
        return f ? f.className : "";
    }

    function getNameEffectClass(effect) {
        return NAME_EFFECT_CLASSES[String(effect || "").trim()] || "";
    }

    function resolveNameAppearance(data, equippedFallback) {
        var tier = getActiveTier(data);
        var eq = equippedFallback || (data && data.equippedCosmetics) || {};
        var hasSavedStyle = !!(data && data.displayNameStyle && typeof data.displayNameStyle === "object");
        var style = (tier && hasSavedStyle) ? sanitizeDisplayNameStyle(data.displayNameStyle, tier) : null;
        var font = style && style.font ? style.font : "default";
        var color = style ? (style.color || "") : String(eq.nameColor || "").trim();
        var effect = style ? (style.effect || "") : String(eq.nameEffect || "").trim();
        return {
            font: font,
            color: color,
            effect: effect,
            fontClass: getNameFontClass(font),
            effectClass: getNameEffectClass(effect),
            fromStyle: !!(style && (style.font !== "default" || style.color || style.effect))
        };
    }

    function applyColorThemeToBody(themeId, accentColor) {
        if (typeof document === "undefined") return;
        var body = document.body;
        if (!body) return;
        COLOR_THEMES.forEach(function (t) { body.classList.remove("chat-theme-" + t.id); });
        body.classList.remove("chat-theme-custom-accent");
        var id = String(themeId || "default");
        if (id !== "default") body.classList.add("chat-theme-" + id);
        if (id === "custom" && isHexColor(accentColor)) {
            body.style.setProperty("--chat-theme-accent", accentColor);
            body.classList.add("chat-theme-custom-accent");
        } else {
            body.style.removeProperty("--chat-theme-accent");
        }
    }

    function applyNameStyleToElement(nameEl, appearance) {
        if (!nameEl || !appearance) return;
        NAME_FONTS.forEach(function (f) {
            if (f.className) nameEl.classList.remove(f.className);
        });
        var span = nameEl.querySelector(".name-fx-text") || nameEl;
        Object.keys(NAME_EFFECT_CLASSES).forEach(function (k) {
            nameEl.classList.remove(NAME_EFFECT_CLASSES[k]);
            span.classList.remove(NAME_EFFECT_CLASSES[k]);
        });
        if (appearance.fontClass) nameEl.classList.add(appearance.fontClass);
        if (appearance.effectClass) {
            // profile.html 既有特效吃在容器上，chat 吃在 .name-fx-text；兩邊都加確保可見
            nameEl.classList.add(appearance.effectClass);
            span.classList.add(appearance.effectClass);
        }
        var gradientFx = ["name-effect-prism", "name-effect-aurora-pulse", "name-effect-rainbow"];
        span.style.removeProperty("color");
        if (appearance.color && gradientFx.indexOf(appearance.effectClass) < 0) {
            span.style.color = appearance.color;
        }
    }

    global.DoratchMemberStyle = {
        COLOR_THEMES: COLOR_THEMES,
        NAME_FONTS: NAME_FONTS,
        STYLE_NAME_COLORS: STYLE_NAME_COLORS,
        STYLE_NAME_EFFECTS: STYLE_NAME_EFFECTS,
        getAllowedThemes: getAllowedThemes,
        getAllowedFonts: getAllowedFonts,
        getAllowedStyleColors: getAllowedStyleColors,
        getAllowedStyleEffects: getAllowedStyleEffects,
        sanitizeDisplayNameStyle: sanitizeDisplayNameStyle,
        sanitizeColorThemePrefs: sanitizeColorThemePrefs,
        getNameFontClass: getNameFontClass,
        getNameEffectClass: getNameEffectClass,
        resolveNameAppearance: resolveNameAppearance,
        applyColorThemeToBody: applyColorThemeToBody,
        applyNameStyleToElement: applyNameStyleToElement
    };
})(typeof window !== "undefined" ? window : globalThis);

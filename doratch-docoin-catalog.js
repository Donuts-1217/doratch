/** Docoin 商店商品對應的 value／標籤 — 用於套用 docoin-lux 豪華視覺 */
(function (global) {
    var DOCOIN_PROFILE_EFFECTS = {
        nebula: 1, starfall: 1, cosmic_aurora: 1, void_rift: 1, glitch: 1, matrix_rain: 1,
        void_ripple: 1, cyber_grid: 1, plasma_storm: 1, golden_aura: 1, neon_city: 1,
        thunder_roll: 1, digital_pulse: 1
    };
    var DOCOIN_BANNERS = { galaxy: 1, neon_city: 1, aurora_borealis: 1 };
    var DOCOIN_NAME_EFFECTS = {
        prism: 1, aurora_pulse: 1, stardust: 1, pulse_core: 1, neon_flicker: 1
    };
    var DOCOIN_FRAMES = {
        phoenix_particle: 1, quantum_particle: 1, glitch_legend: 1, celestial_particle: 1,
        eclipse_particle: 1, stardust_particle: 1, moonlit_legend: 1, comet_legend: 1, circuit_pulse: 1
    };
    var DOCOIN_AVATARS = {
        stardust_lord: 1, void_emperor: 1, phoenix_flame: 1, docoin_golden: 1,
        docoin_crystal: 1, galaxy_cat: 1, docoin_phoenix: 1
    };
    var DOCOIN_MYTHIC_BADGES = {
        "超新星之眼": 1, "反應爐核心": 1, "虛無裂隙": 1, "事件視界": 1,
        "奇點核心": 1, "以太王冠": 1, "遠古符文": 1, "量子 flux": 1
    };
    var DOCOIN_LEGENDARY_TITLES = {
        "量子駭客": 1, "虛空行者": 1, "超頻核心": 1, "星際領主": 1, "賽博忍者": 1, "霓虹女帝": 1
    };

    function isDocoinProfileEffect(value) {
        return !!DOCOIN_PROFILE_EFFECTS[String(value || "").trim()];
    }
    function isDocoinBanner(value) {
        return !!DOCOIN_BANNERS[String(value || "").trim()];
    }
    function isDocoinNameEffect(value) {
        return !!DOCOIN_NAME_EFFECTS[String(value || "").trim()];
    }
    function isDocoinFrame(value) {
        return !!DOCOIN_FRAMES[String(value || "").trim()];
    }
    function isDocoinAvatar(value) {
        return !!DOCOIN_AVATARS[String(value || "").trim()];
    }
    function isDocoinMythicBadge(value) {
        return !!DOCOIN_MYTHIC_BADGES[String(value || "").trim()];
    }
    function isDocoinLegendaryTitle(value) {
        return !!DOCOIN_LEGENDARY_TITLES[String(value || "").trim()];
    }

    global.DoratchDocoinCatalog = {
        isDocoinProfileEffect: isDocoinProfileEffect,
        isDocoinBanner: isDocoinBanner,
        isDocoinNameEffect: isDocoinNameEffect,
        isDocoinFrame: isDocoinFrame,
        isDocoinAvatar: isDocoinAvatar,
        isDocoinMythicBadge: isDocoinMythicBadge,
        isDocoinLegendaryTitle: isDocoinLegendaryTitle
    };
})(typeof window !== "undefined" ? window : globalThis);

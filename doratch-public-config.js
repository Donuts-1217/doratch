/** Doratch 正式站（GitHub Pages）— 供 Email 驗證連結等使用 */
window.DoratchPublicConfig = {
    siteBase: "https://donuts-1217.github.io/doratch"
};

window.doratchPublicUrl = function doratchPublicUrl(path) {
    const p = String(path || "").replace(/^\//, "");
    const cfg = window.DoratchPublicConfig;
    const onProd = typeof location !== "undefined" && location.hostname === "donuts-1217.github.io";
    if (onProd && cfg && cfg.siteBase) {
        return cfg.siteBase.replace(/\/$/, "") + "/" + p;
    }
    if (typeof location !== "undefined") {
        return new URL(p, location.href).href;
    }
    return p;
};

/** GitHub Pages：所有 .js 與 HTML 同層（根目錄） */
(function (global) {
    "use strict";

    function getBasePath() {
        if (global.__DORATCH_ASSET_ROOT__) {
            return global.__DORATCH_ASSET_ROOT__;
        }
        if (global.DoratchBase && global.DoratchBase._rootOverride) {
            return global.DoratchBase._rootOverride;
        }
        var path = location.pathname || "/";
        if (/\.html?$/i.test(path)) {
            path = path.replace(/[^/]+$/, "");
        }
        if (!path.endsWith("/")) path += "/";
        return path;
    }

    global.DoratchBase = {
        path: getBasePath,
        asset: function (rel) {
            if (/^https?:\/\//i.test(rel)) return rel;
            return getBasePath() + String(rel || "").replace(/^\//, "");
        },
        isGitHubPages: function () {
            return /\.github\.io$/i.test(location.hostname || "");
        }
    };
})(typeof window !== "undefined" ? window : globalThis);

/** Skulpt 載入：GitHub Pages 優先本地 vendor，失敗再試 CDN */
(function (global) {
    "use strict";

    var VERSION = "1.2.0";
    var loadPromise = null;

    var SOURCES = [
        {
            sk: "vendor/skulpt/skulpt.min.js",
            std: "vendor/skulpt/skulpt-stdlib.js",
            label: "本地"
        },
        {
            sk: "https://cdn.jsdelivr.net/npm/skulpt@" + VERSION + "/dist/skulpt.min.js",
            std: "https://cdn.jsdelivr.net/npm/skulpt@" + VERSION + "/dist/skulpt-stdlib.js",
            label: "jsDelivr"
        },
        {
            sk: "https://unpkg.com/skulpt@" + VERSION + "/dist/skulpt.min.js",
            std: "https://unpkg.com/skulpt@" + VERSION + "/dist/skulpt-stdlib.js",
            label: "unpkg"
        }
    ];

    function resolveUrl(url) {
        if (global.DoratchBase && global.DoratchBase.asset) {
            return global.DoratchBase.asset(url);
        }
        if (/^https?:\/\//i.test(url)) return url;
        var base = (location.pathname || "/").replace(/[^/]*$/, "");
        return base + url.replace(/^\//, "");
    }

    function getBuiltinFilesMap() {
        if (!global.Sk || !global.Sk.builtinFiles) return null;
        return global.Sk.builtinFiles.files || global.Sk.builtinFiles["files"] || null;
    }

    function skulptReady() {
        return typeof global.Sk !== "undefined"
            && typeof global.Sk.importMainWithBody === "function"
            && !!getBuiltinFilesMap();
    }

    function wait(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    function loadScript(url) {
        url = resolveUrl(url);
        var marker = "doratch-sk-" + url;
        var existing = document.querySelector('script[data-doratch-sk="' + marker + '"]');
        if (existing) {
            if (existing.getAttribute("data-loaded") === "1") {
                return Promise.resolve();
            }
            return new Promise(function (resolve, reject) {
                existing.addEventListener("load", function () { resolve(); });
                existing.addEventListener("error", function () { reject(new Error(url)); });
            });
        }
        return new Promise(function (resolve, reject) {
            var s = document.createElement("script");
            s.src = url;
            s.async = false;
            s.setAttribute("data-doratch-sk", marker);
            s.onload = function () {
                s.setAttribute("data-loaded", "1");
                resolve();
            };
            s.onerror = function () { reject(new Error("無法載入 " + url)); };
            document.head.appendChild(s);
        });
    }

    function trySource(index) {
        if (skulptReady()) return Promise.resolve(true);
        if (index >= SOURCES.length) {
            var hint = lastFailUrl
                ? " 最後失敗：" + lastFailUrl
                : "";
            return Promise.reject(new Error(
                "Python 引擎（Skulpt）載入失敗。" + hint +
                (global.DoratchBase && global.DoratchBase.isGitHubPages()
                    ? " 請確認 GitHub → Settings → Pages 已開啟，並用 https://帳號.github.io/倉庫名/python.html 開啟（不是 github.com 原始碼頁）。"
                    : " 請確認 vendor/skulpt/ 存在，或重新整理。")
            ));
        }
        var src = SOURCES[index];
        return loadScript(src.sk).then(function () {
            return loadScript(src.std);
        }).then(function () {
            return wait(80);
        }).then(function () {
            if (skulptReady()) return true;
            lastFailUrl = resolveUrl(src.std) + "（已載入但未就緒）";
            return trySource(index + 1);
        }).catch(function (err) {
            lastFailUrl = (err && err.message) ? err.message : resolveUrl(src.sk);
            return trySource(index + 1);
        });
    }

    var lastFailUrl = "";

    function load(maxWait) {
        maxWait = maxWait || 20000;
        if (skulptReady()) return Promise.resolve(true);

        if (!loadPromise) {
            loadPromise = trySource(0).catch(function (err) {
                loadPromise = null;
                throw err;
            });
        }

        var deadline = Date.now() + maxWait;
        return loadPromise.then(function poll(ok) {
            if (skulptReady()) return true;
            if (Date.now() >= deadline) {
                throw new Error(
                    "Skulpt 載入逾時。" +
                    (global.DoratchBase && global.DoratchBase.isGitHubPages()
                        ? " 請用 https://帳號.github.io/倉庫名/python.html 開啟，並確認 Firebase 已加入此網域。"
                        : " 請重新整理或檢查網路。")
                );
            }
            return wait(60).then(function () { return poll(ok); });
        });
    }

    global.DoratchSkulptLoader = {
        load: load,
        isReady: skulptReady,
        reset: function () { loadPromise = null; lastFailUrl = ""; },
        getLastError: function () { return lastFailUrl; },
        probe: function () {
            var tests = [
                "js/doratch-base.js",
                "js/python-engine.js",
                "vendor/skulpt/skulpt.min.js",
                "vendor/skulpt/skulpt-stdlib.js"
            ];
            return Promise.all(tests.map(function (p) {
                var url = resolveUrl(p);
                return fetch(url, { method: "HEAD", cache: "no-store" }).then(function (r) {
                    return { path: p, url: url, ok: r.ok, status: r.status };
                }).catch(function () {
                    return { path: p, url: url, ok: false, status: 0 };
                });
            }));
        }
    };
})(typeof window !== "undefined" ? window : globalThis);

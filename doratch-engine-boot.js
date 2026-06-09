/** 頁面載入後立刻啟動 Python 引擎（不等 Firebase module） */
(function (global) {
    "use strict";

    function statusBar() {
        return document.getElementById("engine-bar") || document.getElementById("engine-status");
    }

    function setStatus(msg, kind) {
        var bar = statusBar();
        if (!bar) return;
        bar.textContent = msg;
        var base = bar.className.replace(/\b(ready|error|loading)\b/g, "").trim();
        if (kind === "ready") bar.className = (base + " ready").trim();
        else if (kind === "error") bar.className = (base + " error").trim();
        else bar.className = (base + (base ? " " : "") + "loading").trim();
    }

    function enableRun() {
        var btn = document.getElementById("btn-run");
        if (btn) btn.disabled = false;
        var testBtn = document.getElementById("btn-test");
        if (testBtn) testBtn.disabled = false;
        var reload = document.getElementById("btn-reload-engine");
        if (reload) reload.style.display = "none";
    }

    function markReady() {
        global.__DORATCH_ENGINE_READY__ = true;
        setStatus("Python 已就緒 · 可直接寫程式", "ready");
        enableRun();
        global.dispatchEvent(new CustomEvent("doratch-engine-ready"));
    }

    function boot(isReload) {
        if (!isReload && global.__DORATCH_ENGINE_READY__) {
            markReady();
            return Promise.resolve(true);
        }
        if (!global.PythonEngine) {
            setStatus("python-engine.js 未載入", "error");
            return Promise.reject(new Error("python-engine.js 未載入"));
        }
        if (isReload && global.DoratchSkulptLoader && global.DoratchSkulptLoader.reset) {
            global.DoratchSkulptLoader.reset();
            global.__DORATCH_ENGINE_READY__ = false;
        }
        setStatus("正在啟動 Python 引擎…", "loading");
        return global.PythonEngine.init(function (msg) {
            setStatus(msg, "loading");
        }).then(function () {
            markReady();
            return true;
        }).catch(function (e) {
            global.__DORATCH_ENGINE_READY__ = false;
            var msg = e.message || String(e);
            setStatus(msg, "error");
            var reload = document.getElementById("btn-reload-engine");
            if (reload) reload.style.display = "inline-block";
            throw e;
        });
    }

    global.DoratchEngineBoot = {
        start: boot,
        isReady: function () { return !!global.__DORATCH_ENGINE_READY__; }
    };

    function onReady() {
        boot(false).catch(function () {});
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onReady);
    } else {
        onReady();
    }
})(typeof window !== "undefined" ? window : globalThis);

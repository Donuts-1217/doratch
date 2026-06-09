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
        bar.className = bar.className.replace(/\b(ready|error|loading)\b/g, "").trim();
        if (kind === "ready") bar.className = (bar.className + " ready").trim();
        else if (kind === "error") bar.className = (bar.className + " error").trim();
        else bar.className = (bar.className + " loading").trim();
    }

    function enableRun() {
        var btn = document.getElementById("btn-run");
        if (btn) btn.disabled = false;
        var testBtn = document.getElementById("btn-test");
        if (testBtn) testBtn.disabled = false;
        var reload = document.getElementById("btn-reload-engine");
        if (reload) reload.style.display = "none";
    }

    function boot(isReload) {
        if (!isReload && global.__DORATCH_ENGINE_READY__) {
            setStatus("Python 已就緒", "ready");
            enableRun();
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
            global.__DORATCH_ENGINE_READY__ = true;
            setStatus("Python 已就緒", "ready");
            enableRun();
            global.dispatchEvent(new CustomEvent("doratch-engine-ready"));
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

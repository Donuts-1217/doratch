/** 不等 Firebase：編輯器、終端、快捷鍵 */
(function (global) {
    "use strict";

    var monacoStarted = false;
    var pyTermRef = null;

    function fallbackEl() {
        return document.getElementById("editor-fallback");
    }

    function monacoShell() {
        return document.querySelector(".monaco-shell");
    }

    function showFallbackEditor(code) {
        var fb = fallbackEl();
        var shell = monacoShell();
        if (shell) shell.style.display = "none";
        if (fb) {
            fb.style.display = "block";
            fb.style.flex = "1";
            fb.style.minHeight = "240px";
            fb.style.width = "100%";
            if (typeof code === "string" && code.trim()) fb.value = code;
            else if (!String(fb.value || "").trim()) {
                fb.value = "# Python\nprint('Hello, Doratch!')\n";
            }
        }
        global.__DORATCH_USE_MONACO__ = false;
    }

    function showMonacoEditor() {
        var shell = monacoShell();
        var fb = fallbackEl();
        if (shell) {
            shell.style.display = "flex";
            shell.style.flex = "1";
            shell.style.minHeight = "240px";
        }
        if (fb) fb.style.display = "none";
        global.__DORATCH_USE_MONACO__ = true;
        if (global.PythonMonaco) global.PythonMonaco.layout();
    }

    function mountTerminal() {
        if (pyTermRef) return pyTermRef;
        var el = document.getElementById("py-terminal");
        if (!el || !global.PythonTerminal) return null;
        if (el.dataset.mounted === "1") {
            pyTermRef = global.PythonTerminal.get(el.id || "py-terminal");
            return pyTermRef;
        }
        el.dataset.mounted = "1";
        pyTermRef = global.PythonTerminal.mount(el);
        return pyTermRef;
    }

    function getTerminal() {
        if (pyTermRef) return pyTermRef;
        if (global.PythonTerminal) {
            pyTermRef = global.PythonTerminal.get("py-terminal");
        }
        return pyTermRef || mountTerminal();
    }

    function bindEditorKeys() {
        var fb = fallbackEl();
        if (!fb || fb.dataset.keysBound === "1") return;
        fb.dataset.keysBound = "1";
        fb.addEventListener("keydown", function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                var btn = document.getElementById("btn-run");
                if (btn && !btn.disabled) btn.click();
            }
        });
    }

    function initMonacoEditor() {
        if (monacoStarted) {
            return global.__DORATCH_MONACO_PROMISE__ || Promise.resolve(!!global.__DORATCH_USE_MONACO__);
        }
        monacoStarted = true;
        if (!global.PythonMonaco) {
            showFallbackEditor();
            return Promise.resolve(false);
        }
        var shell = monacoShell();
        if (shell) {
            shell.style.display = "flex";
            shell.style.flex = "1";
            shell.style.minHeight = "240px";
        }
        global.__DORATCH_MONACO_PROMISE__ = global.PythonMonaco.init("monaco-editor").then(function () {
            var fb = fallbackEl();
            var code = fb ? fb.value : "";
            global.PythonMonaco.setValue(code || "# Python\nprint('Hello, Doratch!')\n");
            return new Promise(function (resolve) {
                requestAnimationFrame(function () {
                    if (global.PythonMonaco) global.PythonMonaco.layout();
                    requestAnimationFrame(function () {
                        var container = document.getElementById("monaco-editor");
                        if (container && container.offsetHeight > 20) {
                            showMonacoEditor();
                            if (global.PythonMonaco) global.PythonMonaco.layout();
                            resolve(true);
                        } else {
                            showFallbackEditor(code);
                            resolve(false);
                        }
                    });
                });
            });
        }).catch(function () {
            showFallbackEditor();
            return false;
        });
        return global.__DORATCH_MONACO_PROMISE__;
    }

    function boot() {
        showFallbackEditor();
        mountTerminal();
        bindEditorKeys();
        setTimeout(function () { initMonacoEditor(); }, 50);
    }

    global.DoratchUiBoot = {
        showFallbackEditor: showFallbackEditor,
        showMonacoEditor: showMonacoEditor,
        mountTerminal: mountTerminal,
        getTerminal: getTerminal,
        initMonacoEditor: initMonacoEditor,
        isMonaco: function () {
            return !!(global.__DORATCH_USE_MONACO__ && global.PythonMonaco && global.PythonMonaco.isReady());
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})(typeof window !== "undefined" ? window : globalThis);

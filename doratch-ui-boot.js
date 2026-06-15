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
            bindEditorKeys();
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

    function findAssistSnippet(key) {
        if (!global.PythonCompletions || !key) return null;
        var lists = [
            global.PythonCompletions.BASE_SNIPPETS,
            global.PythonCompletions.DISCORD_SNIPPETS,
            global.PythonCompletions.LEGACY_BOT_SNIPPETS
        ];
        for (var i = 0; i < lists.length; i++) {
            var item = lists[i].find(function (s) { return s.label === key; });
            if (item) return item;
        }
        return null;
    }

    function insertAssistSnippet(key) {
        var item = findAssistSnippet(key);
        if (!item) return false;

        if (global.__DORATCH_USE_MONACO__ && global.PythonMonaco && global.PythonMonaco.isReady()) {
            if (global.PythonMonaco.insertSnippet(item.insert)) {
                document.dispatchEvent(new CustomEvent("doratch-editor-change"));
                return true;
            }
            var cur = global.PythonMonaco.getValue();
            global.PythonMonaco.setValue(cur + (cur.endsWith("\n") ? "" : "\n") + item.insert);
            document.dispatchEvent(new CustomEvent("doratch-editor-change"));
            return true;
        }

        var fb = fallbackEl();
        if (!fb) return false;
        fb.focus();
        var pos = fb.selectionStart;
        var before = fb.value.slice(0, pos);
        var after = fb.value.slice(pos);
        var sep = before && !before.endsWith("\n") ? "\n" : "";
        fb.value = before + sep + item.insert + after;
        var caret = before.length + sep.length + item.insert.length;
        fb.selectionStart = fb.selectionEnd = caret;
        fb.dispatchEvent(new Event("input", { bubbles: true }));
        document.dispatchEvent(new CustomEvent("doratch-editor-change"));
        return true;
    }

    function bindAssistBars() {
        document.querySelectorAll("#bot-assist-bar [data-snippet], #py-assist-bar [data-snippet]").forEach(function (btn) {
            if (btn.dataset.assistBound === "1") return;
            btn.dataset.assistBound = "1";
            btn.addEventListener("click", function () {
                insertAssistSnippet(btn.getAttribute("data-snippet"));
            });
        });
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
        if (global.PythonEditorAssist) {
            global.PythonEditorAssist.attach(fb, {
                getCode: function () { return fb.value; },
                forceBot: !!global.__DORATCH_FORCE_BOT_ASSIST__
            });
        }
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
        bindAssistBars();
        setTimeout(function () { initMonacoEditor(); }, 50);
    }

    global.DoratchUiBoot = {
        showFallbackEditor: showFallbackEditor,
        showMonacoEditor: showMonacoEditor,
        mountTerminal: mountTerminal,
        getTerminal: getTerminal,
        initMonacoEditor: initMonacoEditor,
        insertAssistSnippet: insertAssistSnippet,
        bindAssistBars: bindAssistBars,
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

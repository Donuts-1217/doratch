/**
 * Monaco Editor — VS Code 風格 Python 自動完成（修正游標對齊）
 */
(function (global) {
    "use strict";

    var editor = null;
    var ready = false;
    var initPromise = null;
    var MONACO_BASE = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs";
    var MONACO_FALLBACK = "https://unpkg.com/monaco-editor@0.52.2/min/vs";
    var INIT_TIMEOUT_MS = 15000;
    var EDITOR_FONT_SIZE = 14;
    var EDITOR_LINE_HEIGHT = 21;
    var EDITOR_FONT =
        '"JetBrains Mono", Consolas, "Courier New", monospace';

    var KEYWORDS = (global.PythonCompletions && global.PythonCompletions.KEYWORDS) || [
        "and", "as", "assert", "break", "class", "continue", "def", "del", "elif", "else",
        "except", "False", "finally", "for", "from", "global", "if", "import", "in", "is",
        "lambda", "None", "nonlocal", "not", "or", "pass", "raise", "return", "True", "try",
        "while", "with", "yield", "async", "await"
    ];

    function monacoKind(monaco, kind) {
        var map = {
            keyword: monaco.languages.CompletionItemKind.Keyword,
            function: monaco.languages.CompletionItemKind.Function,
            snippet: monaco.languages.CompletionItemKind.Snippet,
            method: monaco.languages.CompletionItemKind.Method,
            variable: monaco.languages.CompletionItemKind.Variable,
            module: monaco.languages.CompletionItemKind.Module
        };
        return map[kind] || monaco.languages.CompletionItemKind.Text;
    }

    function registerCompletions(monaco) {
        monaco.languages.registerCompletionItemProvider("python", {
            triggerCharacters: [".", "@"],
            provideCompletionItems: function (model, position) {
                var word = model.getWordUntilPosition(position);
                var range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };
                var prefix = (word.word || "").replace(/^@/, "");
                var code = model.getValue();
                var offset = model.getOffsetAt(position);
                var codeBefore = code.slice(0, offset);
                var suggestions = [];
                var comp = global.PythonCompletions;
                var lineBefore = model.getLineContent(position.lineNumber).slice(0, position.column - 1);

                if (comp) {
                    var memberCtx = comp.getMemberContext ? comp.getMemberContext(lineBefore) : null;
                    if (memberCtx && memberCtx.member) {
                        var memberPrefix = memberCtx.prefix || "";
                        comp.getMemberItems(memberCtx.member, memberPrefix, code).forEach(function (item) {
                            suggestions.push({
                                label: item.label,
                                kind: monacoKind(monaco, item.kind),
                                detail: item.detail,
                                insertText: item.insert,
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                range: range,
                                sortText: item.sort
                            });
                        });
                        return { suggestions: suggestions };
                    }

                    comp.collectItems(prefix, code, !!global.__DORATCH_FORCE_BOT_ASSIST__, { lineBefore: lineBefore, codeBefore: codeBefore }).forEach(function (item) {
                        suggestions.push({
                            label: item.label,
                            kind: monacoKind(monaco, item.kind),
                            detail: item.detail,
                            insertText: item.insert,
                            insertTextRules: item.kind === "keyword"
                                ? monaco.languages.CompletionItemInsertTextRule.None
                                : monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            range: range,
                            sortText: item.sort
                        });
                    });
                    return { suggestions: suggestions };
                }

                KEYWORDS.forEach(function (kw) {
                    if (!prefix || kw.toLowerCase().indexOf(prefix) === 0) {
                        suggestions.push({
                            label: kw,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: kw,
                            range: range,
                            sortText: "3_" + kw
                        });
                    }
                });

                return { suggestions: suggestions };
            }
        });
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement("script");
            s.src = src;
            s.onload = resolve;
            s.onerror = function () { reject(new Error("無法載入 " + src)); };
            document.head.appendChild(s);
        });
    }

    function waitForEditorFonts() {
        if (!document.fonts || !document.fonts.load) {
            return Promise.resolve();
        }
        var spec = EDITOR_FONT_SIZE + "px " + EDITOR_FONT;
        return Promise.all([
            document.fonts.load(spec).catch(function () {}),
            document.fonts.load(EDITOR_FONT_SIZE + "px Consolas").catch(function () {}),
            document.fonts.ready
        ]).then(function () {});
    }

    function setupMonacoEnvironment(base) {
        global.MonacoEnvironment = {
            getWorkerUrl: function (_moduleId, label) {
                var worker =
                    label === "json" ? base + "/language/json/json.worker.js" :
                    label === "css" || label === "scss" || label === "less" ? base + "/language/css/css.worker.js" :
                    label === "html" || label === "handlebars" || label === "razor" ? base + "/language/html/html.worker.js" :
                    base + "/base/worker/workerMain.js";
                var code = "self.MonacoEnvironment={baseUrl:'" + base + "'};importScripts('" + worker + "');";
                return URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
            }
        };
    }

    function createEditor(monaco, container) {
        registerCompletions(monaco);
        editor = monaco.editor.create(container, {
            value: "# 在此撰寫 Python…\n",
            language: "python",
            theme: "vs-dark",
            fontSize: EDITOR_FONT_SIZE,
            lineHeight: EDITOR_LINE_HEIGHT,
            fontFamily: EDITOR_FONT,
            fontLigatures: false,
            letterSpacing: 0,
            fontWeight: "normal",
            lineNumbers: "on",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordBasedSuggestions: "off",
            quickSuggestions: { other: true, comments: false, strings: false },
            suggestOnTriggerCharacters: true,
            snippetSuggestions: "top",
            formatOnPaste: true,
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            bracketPairColorization: { enabled: true },
            padding: { top: 8, bottom: 8 },
            fixedOverflowWidgets: true,
            smoothScrolling: false
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function () {
            var btn = document.getElementById("btn-run");
            if (btn && !btn.disabled) btn.click();
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, function () {
            var btn = document.getElementById("btn-test");
            if (btn && !btn.disabled) btn.click();
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, function () {
            editor.trigger("manual", "editor.action.triggerSuggest", {});
        });

        editor.onDidChangeModelContent(function () {
            document.dispatchEvent(new CustomEvent("doratch-editor-change"));
        });

        waitForEditorFonts().then(function () {
            if (editor) {
                editor.layout();
                monaco.editor.remeasureFonts();
            }
        });
    }

    function startMonacoLoader(container, resolve, reject, monacoBase) {
        setupMonacoEnvironment(monacoBase);
        global.require.config({ paths: { vs: monacoBase } });
        global.require(["vs/editor/editor.main"], function () {
            try {
                createEditor(global.monaco, container);
                ready = true;
                resolve(editor);
            } catch (e) {
                reject(e);
            }
        }, function (e) { reject(e || new Error("Monaco 載入失敗")); });
    }

    function init(containerId) {
        if (ready && editor) return Promise.resolve(editor);
        if (initPromise) return initPromise;

        initPromise = waitForEditorFonts().then(function () {
            return new Promise(function (resolve, reject) {
                var container = document.getElementById(containerId);
                if (!container) {
                    reject(new Error("找不到編輯器容器"));
                    return;
                }

                var settled = false;
                function finish(err, ed) {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    if (err) reject(err);
                    else resolve(ed);
                }

                var timer = setTimeout(function () {
                    finish(new Error("Monaco 編輯器載入逾時（" + (INIT_TIMEOUT_MS / 1000) + " 秒），已改用純文字編輯器"));
                }, INIT_TIMEOUT_MS);

                if (!document.querySelector("link[data-monaco-css]")) {
                    var link = document.createElement("link");
                    link.rel = "stylesheet";
                    link.setAttribute("data-monaco-css", "1");
                    link.href = MONACO_BASE + "/editor/editor.main.css";
                    document.head.appendChild(link);
                }

                function tryLoad(monacoBase, isFallback) {
                    startMonacoLoader(container, function (ed) {
                        finish(null, ed);
                    }, function (err) {
                        if (!isFallback && MONACO_FALLBACK) {
                            tryLoad(MONACO_FALLBACK, true);
                        } else {
                            finish(err);
                        }
                    }, monacoBase);
                }

                function onLoaderReady() {
                    tryLoad(MONACO_BASE, false);
                }

                if (global.require && global.require.config) {
                    onLoaderReady();
                } else {
                    loadScript(MONACO_BASE + "/loader.js").then(onLoaderReady).catch(function () {
                        loadScript(MONACO_FALLBACK + "/loader.js").then(onLoaderReady).catch(function (e) {
                            finish(e);
                        });
                    });
                }
            });
        });

        return initPromise;
    }

    function insertSnippet(text) {
        if (!editor || !global.monaco || !text) return false;
        var monaco = global.monaco;
        var pos = editor.getPosition();
        if (!pos) return false;

        var line = editor.getModel().getLineContent(pos.lineNumber);
        var before = line.slice(0, pos.column - 1);
        var needsSep = before.trim().length > 0 && !/\s$/.test(before);
        var range = new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column);

        if (needsSep) {
            editor.executeEdits("assist", [{
                range: range,
                text: "\n",
                forceMoveMarkers: true
            }]);
            pos = editor.getPosition();
            if (!pos) return false;
            range = new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column);
        }

        if (/\$\{/.test(text)) {
            var snippetController = editor.getContribution("snippetController2");
            if (snippetController && typeof snippetController.insert === "function") {
                snippetController.insert(text);
                editor.focus();
                document.dispatchEvent(new CustomEvent("doratch-editor-change"));
                return true;
            }
        }

        editor.executeEdits("assist", [{
            range: range,
            text: text,
            forceMoveMarkers: true
        }]);
        editor.focus();
        document.dispatchEvent(new CustomEvent("doratch-editor-change"));
        return true;
    }

    var changeListeners = [];

    function notifyChange() {
        changeListeners.forEach(function (fn) {
            try { fn(); } catch (_) {}
        });
    }

    global.PythonMonaco = {
        init: init,
        isReady: function () { return ready; },
        getEditor: function () { return editor; },
        getValue: function () {
            return editor ? editor.getValue() : "";
        },
        setValue: function (code) {
            if (editor) {
                editor.setValue(code || "");
                editor.setPosition({ lineNumber: 1, column: 1 });
                editor.focus();
                notifyChange();
            }
        },
        onDidChange: function (fn) {
            if (typeof fn !== "function") return;
            changeListeners.push(fn);
        },
        insertSnippet: insertSnippet,
        layout: function () {
            if (editor) {
                editor.layout();
                if (global.monaco && global.monaco.editor.remeasureFonts) {
                    global.monaco.editor.remeasureFonts();
                }
            }
        }
    };
})(typeof window !== "undefined" ? window : globalThis);

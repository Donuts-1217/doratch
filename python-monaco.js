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

    var KEYWORDS = [
        "and", "as", "assert", "break", "class", "continue", "def", "del", "elif", "else",
        "except", "False", "finally", "for", "from", "global", "if", "import", "in", "is",
        "lambda", "None", "nonlocal", "not", "or", "pass", "raise", "return", "True", "try",
        "while", "with", "yield"
    ];

    var BUILTINS = [
        { label: "print", detail: "輸出到螢幕", insert: "print(${1})" },
        { label: "input", detail: "讀取使用者輸入", insert: "input(${1:})" },
        { label: "int", detail: "轉整數", insert: "int(${1})" },
        { label: "str", detail: "轉字串", insert: "str(${1})" },
        { label: "float", detail: "轉浮點數", insert: "float(${1})" },
        { label: "len", detail: "長度", insert: "len(${1})" },
        { label: "range", detail: "產生數列", insert: "range(${1:start}, ${2:stop})" },
        { label: "sum", detail: "加總", insert: "sum(${1})" },
        { label: "min", detail: "最小值", insert: "min(${1})" },
        { label: "max", detail: "最大值", insert: "max(${1})" },
        { label: "abs", detail: "絕對值", insert: "abs(${1})" },
        { label: "round", detail: "四捨五入", insert: "round(${1})" },
        { label: "list", detail: "建立串列", insert: "list(${1})" },
        { label: "sorted", detail: "排序", insert: "sorted(${1})" },
        { label: "enumerate", detail: "索引迭代", insert: "enumerate(${1})" },
        { label: "type", detail: "型別", insert: "type(${1})" }
    ];

    var SNIPPETS = [
        { label: "if", detail: "條件骨架（需自行填條件）", insert: "if ${1:條件}:\n    ${2:pass}" },
        { label: "elif", detail: "否則若骨架", insert: "elif ${1:條件}:\n    ${2:pass}" },
        { label: "else", detail: "否則骨架", insert: "else:\n    ${1:pass}" },
        { label: "for", detail: "for 骨架（需自行填寫）", insert: "for ${1:i} in range(${2:n}):\n    ${3:pass}" },
        { label: "while", detail: "while 骨架", insert: "while ${1:條件}:\n    ${2:pass}" },
        { label: "def", detail: "函式骨架", insert: "def ${1:函式名稱}(${2:參數}):\n    ${3:pass}" }
    ];

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

    function registerCompletions(monaco) {
        monaco.languages.registerCompletionItemProvider("python", {
            triggerCharacters: ["."],
            provideCompletionItems: function (model, position) {
                var word = model.getWordUntilPosition(position);
                var range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };
                var prefix = (word.word || "").toLowerCase();
                var suggestions = [];

                KEYWORDS.forEach(function (kw) {
                    if (!prefix || kw.toLowerCase().indexOf(prefix) === 0) {
                        suggestions.push({
                            label: kw,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: kw,
                            range: range,
                            sortText: "1_" + kw
                        });
                    }
                });

                BUILTINS.forEach(function (b) {
                    if (!prefix || b.label.toLowerCase().indexOf(prefix) === 0) {
                        suggestions.push({
                            label: b.label,
                            kind: monaco.languages.CompletionItemKind.Function,
                            detail: b.detail,
                            insertText: b.insert,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            range: range,
                            sortText: "0_" + b.label
                        });
                    }
                });

                SNIPPETS.forEach(function (sn) {
                    if (!prefix || sn.label.toLowerCase().indexOf(prefix) === 0) {
                        suggestions.push({
                            label: sn.label,
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            detail: sn.detail,
                            insertText: sn.insert,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            range: range,
                            sortText: "2_" + sn.label
                        });
                    }
                });

                return { suggestions: suggestions };
            }
        });
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
            snippetSuggestions: "none",
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

    global.PythonMonaco = {
        init: init,
        isReady: function () { return ready; },
        getValue: function () {
            return editor ? editor.getValue() : "";
        },
        setValue: function (code) {
            if (editor) {
                editor.setValue(code || "");
                editor.setPosition({ lineNumber: 1, column: 1 });
                editor.focus();
            }
        },
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

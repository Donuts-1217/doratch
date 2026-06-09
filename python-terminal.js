/** VS Code 風格終端：輸出與 input() 游標同一行接續 */
(function (global) {
    "use strict";

    var instances = {};

    function injectStyles() {
        if (document.getElementById("py-terminal-styles")) return;
        var link = document.createElement("link");
        link.id = "py-terminal-styles";
        link.rel = "stylesheet";
        link.href = "python-terminal.css";
        document.head.appendChild(link);
    }

    function mount(rootEl) {
        if (!rootEl) throw new Error("找不到終端容器");
        injectStyles();

        rootEl.classList.add("py-terminal-root");
        rootEl.innerHTML =
            '<div class="py-term-scroll" tabindex="0"></div>' +
            '<div class="py-term-placeholder">按「執行」開始 · input() 會在輸出末尾出現輸入框</div>';

        var scroll = rootEl.querySelector(".py-term-scroll");
        var placeholder = rootEl.querySelector(".py-term-placeholder");
        var pendingResolve = null;
        var activeInputLine = null;
        var activePromptEl = null;
        var activeInputEl = null;

        function hidePlaceholder() {
            if (placeholder) placeholder.style.display = "none";
        }

        function scrollToBottom() {
            scroll.scrollTop = scroll.scrollHeight;
        }

        /** Skulpt 有時會先把 prompt 寫進 output，避免重複顯示造成游標错位 */
        function stripTrailingPrompt(prompt) {
            if (!prompt) return;
            var nodes = scroll.querySelectorAll(".py-term-out");
            if (!nodes.length) return;
            var last = nodes[nodes.length - 1];
            var t = last.textContent || "";
            if (t.endsWith(prompt)) {
                var trimmed = t.slice(0, -prompt.length);
                if (trimmed) last.textContent = trimmed;
                else last.remove();
            }
        }

        function appendChunk(text, className) {
            hidePlaceholder();
            if (!text) return;
            var node = document.createElement("span");
            node.className = className || "py-term-out";
            node.textContent = text;
            scroll.appendChild(node);
            scrollToBottom();
        }

        function removeActiveInputLine() {
            if (activeInputLine && activeInputLine.parentNode) {
                activeInputLine.parentNode.removeChild(activeInputLine);
            }
            activeInputLine = null;
            activePromptEl = null;
            activeInputEl = null;
        }

        function commitInputLine(prompt, value) {
            hidePlaceholder();
            removeActiveInputLine();
            var echo = document.createElement("span");
            echo.className = "py-term-out py-term-echo";
            echo.textContent = (prompt || "") + value;
            scroll.appendChild(echo);
            scrollToBottom();
        }

        function onInputKeydown(e) {
            if (e.key !== "Enter" || !pendingResolve || !activeInputEl) return;
            e.preventDefault();
            var prompt = activePromptEl ? activePromptEl.textContent : "";
            var value = activeInputEl.value;
            var resolve = pendingResolve;
            pendingResolve = null;
            commitInputLine(prompt, value);
            resolve(value);
        }

        var api = {
            clear: function () {
                scroll.innerHTML = "";
                pendingResolve = null;
                removeActiveInputLine();
                if (placeholder) placeholder.style.display = "";
            },
            write: function (text) {
                appendChunk(text, "py-term-out");
            },
            writeError: function (text) {
                hidePlaceholder();
                removeActiveInputLine();
                var node = document.createElement("div");
                node.className = "py-term-line py-term-err";
                node.textContent = text;
                scroll.appendChild(node);
                scrollToBottom();
            },
            readLine: function (prompt) {
                hidePlaceholder();
                prompt = prompt != null ? String(prompt) : "";
                stripTrailingPrompt(prompt);

                return new Promise(function (resolve) {
                    pendingResolve = resolve;

                    var line = document.createElement("span");
                    line.className = "py-term-input-line";
                    line.setAttribute("role", "group");

                    var promptSpan = document.createElement("span");
                    promptSpan.className = "py-term-prompt";
                    promptSpan.textContent = prompt;

                    var input = document.createElement("input");
                    input.className = "py-term-input";
                    input.type = "text";
                    input.spellcheck = false;
                    input.autocomplete = "off";
                    input.setAttribute("aria-label", "程式輸入");
                    input.addEventListener("keydown", onInputKeydown);

                    line.appendChild(promptSpan);
                    line.appendChild(input);
                    scroll.appendChild(line);

                    activeInputLine = line;
                    activePromptEl = promptSpan;
                    activeInputEl = input;

                    input.focus();
                    scrollToBottom();
                });
            },
            setRunning: function (isRunning) {
                rootEl.classList.toggle("py-term-running", !!isRunning);
            },
            focus: function () {
                if (activeInputEl) activeInputEl.focus();
                else scroll.focus();
            }
        };

        if (rootEl.id) instances[rootEl.id] = api;
        return api;
    }

    function get(id) {
        return instances[id] || null;
    }

    global.PythonTerminal = {
        mount: mount,
        get: get
    };
})(typeof window !== "undefined" ? window : globalThis);

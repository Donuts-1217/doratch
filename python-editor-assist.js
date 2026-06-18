/** 純文字編輯器語法輔助（Monaco 不可用時）— Ctrl+Space 或輸入 @ 觸發 */
(function (global) {
    "use strict";

    var popup = null;
    var activeEl = null;
    var getCodeFn = null;
    var forceBot = false;

    function ensurePopup() {
        if (popup) return popup;
        popup = document.createElement("div");
        popup.className = "py-assist-popup";
        popup.hidden = true;
        document.body.appendChild(popup);
        popup.addEventListener("mousedown", function (e) {
            e.preventDefault();
        });
        return popup;
    }

    function hidePopup() {
        if (popup) popup.hidden = true;
    }

    function getCaret(el) {
        return { start: el.selectionStart, end: el.selectionEnd };
    }

    function setCaret(el, pos) {
        el.selectionStart = el.selectionEnd = pos;
    }

    function currentWord(el) {
        var text = el.value;
        var pos = el.selectionStart;
        var start = pos;
        while (start > 0 && /[\w@]/.test(text[start - 1])) start--;
        return { word: text.slice(start, pos), start: start, end: pos };
    }

    function insertSnippet(el, text, replaceStart, replaceEnd) {
        var before = el.value.slice(0, replaceStart);
        var after = el.value.slice(replaceEnd);
        el.value = before + text + after;
        var pos = before.length + text.length;
        setCaret(el, pos);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        hidePopup();
        el.focus();
    }

    function showSuggestions(el, items, replaceStart, replaceEnd) {
        if (!items.length) {
            hidePopup();
            return;
        }
        var box = ensurePopup();
        box.innerHTML = "";
        items.slice(0, 24).forEach(function (item) {
            var row = document.createElement("button");
            row.type = "button";
            row.className = "py-assist-item";
            row.innerHTML = "<span class=\"py-assist-label\">" + item.label + "</span>" +
                (item.detail ? "<span class=\"py-assist-detail\">" + item.detail + "</span>" : "");
            row.onclick = function () {
                insertSnippet(el, item.insert, replaceStart, replaceEnd);
            };
            box.appendChild(row);
        });
        var rect = el.getBoundingClientRect();
        box.style.left = rect.left + 12 + "px";
        box.style.top = rect.top + 28 + "px";
        box.style.maxWidth = Math.min(rect.width - 24, 520) + "px";
        box.hidden = false;
    }

    function openAssist(el, forcedPrefix) {
        if (!global.PythonCompletions) return;
        var code = getCodeFn ? getCodeFn() : el.value;
        var w = currentWord(el);
        var prefix = forcedPrefix != null ? forcedPrefix : w.word;
        if (prefix.charAt(0) === "@") prefix = prefix.slice(1);

        var beforeCursor = el.value.slice(0, el.selectionStart);
        var currentLineBefore = beforeCursor.split("\n").pop();
        var memberCtx = global.PythonCompletions.getMemberContext
            ? global.PythonCompletions.getMemberContext(currentLineBefore)
            : null;
        var member = memberCtx && memberCtx.member ? memberCtx.member : null;
        if (member) prefix = memberCtx.prefix || "";

        var items;
        if (member) {
            items = global.PythonCompletions.getMemberItems(member, prefix, code);
        } else {
            items = global.PythonCompletions.collectItems(prefix, code, forceBot, { lineBefore: currentLineBefore, codeBefore: beforeCursor });
        }

        var start = member ? (el.selectionStart - prefix.length) : w.start;
        var end = el.selectionStart;
        showSuggestions(el, items, start, end);
    }

    var assistTimer = null;

    function attach(el, options) {
        if (!el || el.dataset.assistBound === "1") return;
        el.dataset.assistBound = "1";
        activeEl = el;
        getCodeFn = (options && options.getCode) || null;
        forceBot = !!(options && options.forceBot);

        el.addEventListener("keydown", function (e) {
            if (e.key === "Escape") hidePopup();
            if ((e.ctrlKey || e.metaKey) && e.key === " ") {
                e.preventDefault();
                openAssist(el);
            }
            if (e.key === "Tab" && popup && !popup.hidden) {
                e.preventDefault();
                var first = popup.querySelector(".py-assist-item");
                if (first) first.click();
            }
        });

        el.addEventListener("keyup", function (e) {
            if (e.key === "@" || e.key === ".") {
                openAssist(el, e.key === "@" ? "" : null);
            }
        });

        el.addEventListener("input", function () {
            clearTimeout(assistTimer);
            assistTimer = setTimeout(function () {
                if (el.offsetParent === null) return;
                var w = currentWord(el);
                if (!w.word) {
                    hidePopup();
                    return;
                }
                if (/^[@a-zA-Z_][\w@]*$/.test(w.word)) {
                    openAssist(el);
                }
            }, 120);
        });

        document.addEventListener("click", function (e) {
            if (popup && !popup.hidden && !popup.contains(e.target) && e.target !== el) {
                hidePopup();
            }
        });
    }

    function setForceBot(on) {
        forceBot = !!on;
    }

    global.PythonEditorAssist = {
        attach: attach,
        open: function () {
            if (activeEl) openAssist(activeEl);
        },
        hide: hidePopup,
        setForceBot: setForceBot
    };
})(typeof window !== "undefined" ? window : globalThis);

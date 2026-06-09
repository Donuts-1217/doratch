/**
 * Skulpt 相容層：執行時轉換 VS Code 合法、但 Skulpt 不支援的語法
 * 原始碼可保留 f-string、型別標注；只在瀏覽器執行前轉換
 */
(function (global) {
    "use strict";

    var lastPrefixLines = 0;

    function isDiscordPyCode(code) {
        code = String(code || "");
        return /\b(import\s+discord|from\s+discord)/.test(code) ||
            /\bcommands\.Bot\b/.test(code) ||
            /\bdiscord\.Client\b/.test(code) ||
            /\bapp_commands\b/.test(code);
    }

    function stripOpenEncoding(code) {
        return String(code || "").replace(/,\s*encoding\s*=\s*(['"])utf-8\1/g, "");
    }

    function needsBrowserOsPatch(code) {
        return /\bimport\s+os\b/.test(code) && /\bos\.path\b/.test(code);
    }

    function stripTypeAnnotations(code) {
        return String(code || "").split("\n").map(function (line) {
            if (!/\bdef\b/.test(line)) return line;
            line = line.replace(/\)\s*->\s*[^:\n]+:/, "):");
            line = line.replace(/(\w+)\s*:\s*[^=,)]+(?=[=,)])/g, "$1");
            return line;
        }).join("\n");
    }

    function convertFStringExpr(inner) {
        var parts = [];
        var i = 0;
        var re = /\{([^}]*)\}/g;
        var m;
        while ((m = re.exec(inner)) !== null) {
            if (m.index > i) {
                parts.push(JSON.stringify(inner.slice(i, m.index)));
            }
            var expr = m[1].trim();
            parts.push(expr ? "str(" + expr + ")" : '""');
            i = re.lastIndex;
        }
        if (i < inner.length) parts.push(JSON.stringify(inner.slice(i)));
        if (!parts.length) return '""';
        return parts.join(" + ");
    }

    function convertFStrings(code) {
        return String(code || "").split("\n").map(function (line) {
            if (!/\bf(['"])/.test(line)) return line;
            return line.replace(/\bf(['"])((?:\\.|(?!\1).)*)\1/g, function (_match, _q, inner) {
                return convertFStringExpr(inner);
            });
        }).join("\n");
    }

    function normalizeNewlines(code) {
        return String(code || "").replace(/\r\n/g, "\n");
    }

    /** 供 Skulpt 執行的版本（VS Code 原始碼不必改） */
    function preprocessForSkulpt(code) {
        code = normalizeNewlines(code);
        var prefix = "";
        lastPrefixLines = 0;
        if (needsBrowserOsPatch(code)) {
            prefix = "import doratch_browser\n" +
                "doratch_browser.install()\n\n";
            lastPrefixLines = 2;
        }
        code = stripOpenEncoding(code);
        code = stripTypeAnnotations(code);
        code = convertFStrings(code);
        return prefix + code;
    }

    /** 把 Skulpt 行號對回使用者程式（平台會加 2 行 import，不再加 28 行） */
    function remapErrorLines(msg, userLineCount) {
        msg = String(msg || "");
        var prefix = lastPrefixLines || 0;
        return msg.replace(/line\s+(\d+)/gi, function (full, num) {
            var n = parseInt(num, 10);
            if (prefix && n <= prefix) {
                return "line " + n + "（平台檔案模擬，不是你的程式）";
            }
            var userLine = prefix ? n - prefix : n;
            if (userLineCount && userLine > userLineCount) {
                return "line " + userLine + "（平台 Bot 啟動程式，若持續出現請回報）";
            }
            return "line " + userLine + "（你的程式第 " + userLine + " 行）";
        });
    }

    global.SkulptCompat = {
        isDiscordPyCode: isDiscordPyCode,
        preprocessForSkulpt: preprocessForSkulpt,
        stripTypeAnnotations: stripTypeAnnotations,
        convertFStrings: convertFStrings,
        remapErrorLines: remapErrorLines,
        get lastPrefixLines() { return lastPrefixLines; }
    };
})(typeof window !== "undefined" ? window : globalThis);

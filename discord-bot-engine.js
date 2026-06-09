/** Discord Bot 引擎：Token + discord.py / 舊版 handle 雙模式 */
(function (global) {
    "use strict";

    var DEMO_TOKEN = "doratch-demo-learn-2026";
    var TOKEN_PREFIX = "doratch-";

    function skulptReady() {
        return typeof global.Sk !== "undefined" && global.PythonEngine;
    }

    function normalize(text) {
        return global.PythonEngine
            ? global.PythonEngine.normalizeOutput(text)
            : String(text || "").trim();
    }

    function formatError(e) {
        try {
            if (global.Sk && global.Sk.err && global.Sk.err.printExc) {
                return String(global.Sk.err.printExc(e) || e);
            }
        } catch (_) { /* ignore */ }
        return String(e && e.message ? e.message : e);
    }

    /** 舊版：handle(msg) 或 input() 邏輯（學習關卡測試用） */
    function runBotCodeLegacy(code, message) {
        code = String(code || "").trim();
        message = String(message == null ? "" : message);

        return new Promise(function (resolve) {
            if (!code) {
                resolve({ reply: null, error: "Bot 尚未設定程式碼" });
                return;
            }
            if (!skulptReady()) {
                resolve({ reply: null, error: "Python 引擎未載入" });
                return;
            }

            var hasHandle = /\bdef\s+handle\s*\(/.test(code);
            var runBody = hasHandle
                ? code + "\nprint(handle(" + JSON.stringify(message) + "))\n"
                : code;

            var stdinLines = hasHandle ? [] : [message];
            var output = "";
            var inputIdx = 0;

            if (global.DiscordPyMock) global.DiscordPyMock.inject();

            global.Sk.configure({
                output: function (t) { output += t; },
                read: function (x) {
                    var files = global.Sk.builtinFiles.files || global.Sk.builtinFiles["files"];
                    if (!files[x]) throw new Error("File not found: " + x);
                    return files[x];
                },
                inputfun: function () {
                    var v = inputIdx < stdinLines.length ? stdinLines[inputIdx] : "";
                    inputIdx += 1;
                    return Promise.resolve(v);
                },
                inputfunTakesPrompt: true,
                python3: true,
                __future__: global.Sk.python3
            });

            global.Sk.misceval.asyncToPromise(function () {
                return global.Sk.importMainWithBody("<bot>", false, runBody, true);
            }).then(
                function () {
                    var reply = normalize(output);
                    if (reply === "None") reply = null;
                    resolve({ reply: reply || null, error: null });
                },
                function (e) {
                    resolve({ reply: null, error: formatError(e) });
                }
            );
        });
    }

    async function runBotCode(code, message) {
        if (global.DiscordBotRuntime && global.DiscordBotRuntime.isDiscordPyCode(code)) {
            var result = await global.DiscordBotRuntime.handleInteraction({
                code: code,
                type: "prefix",
                payload: message
            });
            if (result.error) return { reply: null, error: result.error };
            var text = (result.responses || []).map(function (r) { return r.content; }).filter(Boolean).join("\n");
            return { reply: text || null, error: null, responses: result.responses };
        }
        return runBotCodeLegacy(code, message);
    }

    function generateToken(uid) {
        return generateStableToken(uid);
    }

    /** 每位使用者固定同一個 Token（不會每次重新產生） */
    function generateStableToken(uid) {
        var part = String(uid || "user").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
        var h = 5381;
        var s = String(uid) + "doratch-bot-token-v1";
        for (var i = 0; i < s.length; i++) {
            h = ((h << 5) + h + s.charCodeAt(i)) | 0;
        }
        var suffix = Math.abs(h).toString(36);
        while (suffix.length < 8) suffix = suffix + "0";
        return TOKEN_PREFIX + part + "-" + suffix.slice(0, 10);
    }

    function extractTokenFromCode(code) {
        code = String(code || "");
        var m = code.match(/(?:^|\n)\s*TOKEN\s*=\s*['"]([^'"]+)['"]/m);
        if (m) return m[1];
        m = code.match(/bot\.run\s*\(\s*['"]([^'"]+)['"]\s*\)/);
        if (m) return m[1];
        m = code.match(/bot\.run\s*\(\s*TOKEN\s*\)/);
        if (m) return "__USE_TOKEN_VAR__";
        return null;
    }

    function applyTokenToCode(code, token) {
        code = String(code || "");
        if (!token) return code;
        if (code.indexOf("YOUR_BOT_TOKEN") !== -1) {
            return code.replace(/YOUR_BOT_TOKEN/g, token);
        }
        if (/(?:^|\n)\s*TOKEN\s*=\s*['"][^'"]*['"]/m.test(code)) {
            return code.replace(/(TOKEN\s*=\s*['"])([^'"]*)(['"])/, "$1" + token + "$3");
        }
        return code;
    }

    function isValidTokenFormat(token) {
        return typeof token === "string" && (
            token === DEMO_TOKEN ||
            (token.indexOf(TOKEN_PREFIX) === 0 && token.length >= 12)
        );
    }

    function maskToken(token) {
        if (!token) return "";
        if (token === DEMO_TOKEN) return token;
        if (token.length <= 12) return token;
        return token.slice(0, 12) + "…" + token.slice(-4);
    }

    global.DiscordBotEngine = {
        DEMO_TOKEN: DEMO_TOKEN,
        TOKEN_PREFIX: TOKEN_PREFIX,
        runBotCode: runBotCode,
        runBotCodeLegacy: runBotCodeLegacy,
        generateToken: generateToken,
        generateStableToken: generateStableToken,
        extractTokenFromCode: extractTokenFromCode,
        applyTokenToCode: applyTokenToCode,
        isValidTokenFormat: isValidTokenFormat,
        maskToken: maskToken,
        getDemoBotMeta: function () {
            return {
                token: DEMO_TOKEN,
                name: "Doratch 示範 Bot",
                description: "discord.py 語法示範，與 VS Code 真 Bot 相同寫法。",
                isDemo: true
            };
        }
    };
})(typeof window !== "undefined" ? window : globalThis);

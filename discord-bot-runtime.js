/** Discord Bot 執行期：保留 async/await，完整 coroutine 調度 */
(function (global) {
    "use strict";

    var sessions = {};
    var sessionCounter = 0;

    function preprocessDiscordPy(code) {
        if (global.SkulptCompat) {
            return global.SkulptCompat.preprocessForSkulpt(code);
        }
        return String(code || "").replace(/\r\n/g, "\n");
    }

    function isDiscordPyCode(code) {
        code = String(code || "");
        return /\b(import\s+discord|from\s+discord)/.test(code) ||
            /\bcommands\.Bot\b/.test(code) ||
            /\bdiscord\.Client\b/.test(code) ||
            /\bapp_commands\b/.test(code);
    }

    function hasLegacyHandle(code) {
        return /\bdef\s+handle\s*\(/.test(String(code || ""));
    }

    function skulptReady() {
        if (typeof global.Sk === "undefined" || !global.Sk.importMainWithBody) return false;
        var bf = global.Sk.builtinFiles;
        return !!(bf && (bf.files || bf["files"]));
    }

    function injectMocks() {
        if (global.DiscordPyMock) global.DiscordPyMock.inject();
    }

    function builtinRead(x) {
        var files = global.Sk.builtinFiles && (global.Sk.builtinFiles.files || global.Sk.builtinFiles["files"]);
        if (!files || !files[x]) throw new Error("File not found: " + x);
        return files[x];
    }

    function extractJsonOutput(output) {
        var marker = "__DORATCH_JSON__";
        var idx = output.lastIndexOf(marker);
        if (idx === -1) return null;
        try {
            return JSON.parse(output.slice(idx + marker.length).trim());
        } catch (_) {
            return null;
        }
    }

    function extractInitMeta(output) {
        var marker = "__DORATCH_META__";
        var idx = output.lastIndexOf(marker);
        if (idx === -1) return null;
        try {
            return JSON.parse(output.slice(idx + marker.length).split("\n")[0].trim());
        } catch (_) {
            return null;
        }
    }

    function formatRuntimeError(msg, userLineCount) {
        if (global.SkulptCompat && global.SkulptCompat.remapErrorLines) {
            return global.SkulptCompat.remapErrorLines(msg, userLineCount);
        }
        return msg;
    }

    function runSkulptBody(body, options) {
        options = options || {};
        var output = "";
        var inputIdx = 0;
        var stdinLines = options.stdin || [];
        var userLineCount = options.userLineCount || 0;

        injectMocks();

        global.Sk.configure({
            output: function (t) { output += t; },
            read: builtinRead,
            inputfun: function () {
                var v = inputIdx < stdinLines.length ? stdinLines[inputIdx] : "";
                inputIdx += 1;
                return Promise.resolve(v);
            },
            inputfunTakesPrompt: true,
            python3: true,
            __future__: global.Sk.python3
        });

        return global.Sk.misceval.asyncToPromise(function () {
            return global.Sk.importMainWithBody("<discord_bot>", false, body, true);
        }).then(
            function () { return { output: output, error: null }; },
            function (e) {
                var msg = String(e);
                try {
                    if (global.Sk.err && global.Sk.err.printExc) msg = String(global.Sk.err.printExc(e) || e);
                } catch (_) { /* ignore */ }
                return { output: output, error: formatRuntimeError(msg, userLineCount) };
            }
        );
    }

    var META_SNIPPET =
        "\nimport json as _json\n" +
        "import discord.ext.commands as _dbc\n" +
        "_b = _dbc.get_active_bot()\n" +
        "if _b:\n" +
        "    _cmds = getattr(_b, '_commands', {})\n" +
        "    if _cmds is None:\n" +
        "        _cmds = {}\n" +
        "    _slash_raw = getattr(_b, '_slash', {})\n" +
        "    if _slash_raw is None:\n" +
        "        _slash_raw = {}\n" +
        "    _slash_out = []\n" +
        "    for _sk in _slash_raw:\n" +
        "        _se = _slash_raw[_sk]\n" +
        "        _sd = ''\n" +
        "        if _se is not None and 'description' in _se:\n" +
        "            _sd = _se['description']\n" +
        "        _slash_out.append({'name': _sk, 'description': _sd})\n" +
        "    _meta = {'slash': _slash_out, 'prefix': list(_cmds.keys()), 'user': _b.user}\n" +
        "    print('__DORATCH_META__' + _json.dumps(_meta))\n";

    function buildDispatchSnippet(kind, payload) {
        var py =
            "\nimport json as _json\n" +
            "import discord.ext.commands as _dbc\n" +
            "import discord.ext.async_runner as _ar\n" +
            "async def __doratch_dispatch__():\n" +
            "    _b = _dbc.get_active_bot()\n" +
            "    if not _b:\n" +
            "        return []\n";
        if (kind === "prefix") {
            py += "    return await _b.dispatch_prefix(" + JSON.stringify(payload) + ")\n";
        } else if (kind === "slash") {
            py += "    return await _b.dispatch_slash(" + JSON.stringify(payload) + ")\n";
        } else if (kind === "component") {
            py += "    return await _dbc._dispatch_component_async(" +
                JSON.stringify(payload.viewId) + ", " +
                JSON.stringify(payload.customId) + ", " +
                JSON.stringify(payload.values || []) + ")\n";
        } else {
            py += "    return []\n";
        }
        py += "__resp__ = _ar.run(__doratch_dispatch__())\n";
        py += "print('__DORATCH_JSON__' + _json.dumps(__resp__ if __resp__ else []))\n";
        return py;
    }

    function normalizeResponses(raw) {
        if (!raw || !Array.isArray(raw)) return [];
        return raw.map(function (r) {
            if (!r || typeof r !== "object") return { content: String(r || "") };
            return {
                content: r.content != null ? String(r.content) : "",
                embed: r.embed || null,
                ephemeral: !!r.ephemeral,
                view: r.view || null
            };
        }).filter(function (r) {
            return r.content || r.embed || (r.view && r.view.items && r.view.items.length);
        });
    }

    function formatEmbedText(embed) {
        if (!embed || typeof embed !== "object") return "";
        var parts = [];
        if (embed.title) parts.push("**" + embed.title + "**");
        if (embed.description) parts.push(String(embed.description));
        (embed.fields || []).forEach(function (f) {
            parts.push("**" + f.name + "**: " + f.value);
        });
        return parts.join("\n");
    }

    function getSessionKey(code) {
        return "s" + (++sessionCounter) + "_" + String(code || "").length;
    }

    /** 從原始碼解析 @client.tree.command / @bot.tree.command（Skulpt 裝飾器可能未生效時的備援） */
    function extractSlashCommandsFromCode(code) {
        code = String(code || "");
        var handlers = [];
        var lines = code.split("\n");
        for (var i = 0; i < lines.length; i++) {
            if (!/\.tree\.command\s*\(/.test(lines[i])) continue;
            var block = lines.slice(i, Math.min(i + 6, lines.length)).join(" ");
            var nameM = block.match(/name\s*=\s*['"]([^'"]+)['"]/);
            var descM = block.match(/description\s*=\s*['"]([^'"]*)['"]/);
            var funcName = null;
            for (var j = i + 1; j < Math.min(i + 10, lines.length); j++) {
                var dm = lines[j].match(/^\s*async\s+def\s+(\w+)\s*\(/);
                if (dm) {
                    funcName = dm[1];
                    break;
                }
            }
            if (!funcName) continue;
            handlers.push({
                name: nameM ? nameM[1] : funcName,
                description: descM ? descM[1] : "",
                funcName: funcName
            });
        }
        return handlers;
    }

    function buildSlashFixSnippet(handlers) {
        if (!handlers || !handlers.length) return "";
        var py = "\nimport discord.ext.commands as _dbc\n" +
            "_b = _dbc.get_active_bot()\n" +
            "if _b:\n" +
            "    if not hasattr(_b, '_slash') or _b._slash is None:\n" +
            "        _b._slash = {}\n";
        handlers.forEach(function (h) {
            var desc = JSON.stringify(h.description || "");
            py += "    if '" + h.name + "' not in _b._slash:\n" +
                "        try:\n" +
                "            _b._slash['" + h.name + "'] = {'description': " + desc + ", 'func': " + h.funcName + "}\n" +
                "        except NameError:\n" +
                "            pass\n";
        });
        return py;
    }

    function mergeSlashMeta(meta, handlers) {
        if (!meta) meta = { slash: [], prefix: [], user: "MyBot#0001" };
        if (!meta.slash || !meta.slash.length) {
            meta.slash = handlers.map(function (h) {
                return { name: h.name, description: h.description || "" };
            });
        }
        return meta;
    }

    async function loadBot(code) {
        if (!skulptReady() && global.PythonEngine && global.PythonEngine.waitForSkulpt) {
            try {
                await global.PythonEngine.waitForSkulpt(10000);
            } catch (e) {
                return { ok: false, error: e.message || "Python 引擎未載入" };
            }
        }
        if (!skulptReady()) return { ok: false, error: "Python 引擎未載入" };
        var originalCode = String(code || "");
        var originalLines = originalCode.replace(/\r\n/g, "\n").split("\n").length;
        if (!isDiscordPyCode(originalCode)) {
            return { ok: false, error: null, legacy: true };
        }
        var handlers = extractSlashCommandsFromCode(originalCode);
        code = preprocessDiscordPy(originalCode);

        var body = code + buildSlashFixSnippet(handlers) + META_SNIPPET;
        var res = await runSkulptBody(body, { userLineCount: originalLines });
        if (res.error) return { ok: false, error: res.error };

        var meta = extractInitMeta(res.output);
        if (!meta) return { ok: false, error: "Bot 未正確啟動。請確認有 client.run(TOKEN) 或 bot.run(TOKEN)，且指令為 async def。" };
        meta = mergeSlashMeta(meta, handlers);

        var key = getSessionKey(code);
        sessions[key] = { code: code, userLines: originalLines, handlers: handlers };

        return {
            ok: true,
            sessionKey: key,
            meta: meta,
            readyMessage: meta.user ? "已登入 " + meta.user : "Bot 已就緒"
        };
    }

    async function dispatch(sessionKey, code, kind, payload) {
        var stored = sessions[sessionKey];
        var src = stored ? stored.code : preprocessDiscordPy(code);
        var handlers = stored ? stored.handlers : extractSlashCommandsFromCode(code);
        var userLineCount = stored ? (stored.userLines || 0) : String(code || "").split("\n").length;
        var body = src + buildSlashFixSnippet(handlers) + buildDispatchSnippet(kind, payload);
        var res = await runSkulptBody(body, { userLineCount: userLineCount });
        if (res.error) return { responses: [], error: res.error };
        var raw = extractJsonOutput(res.output);
        return { responses: normalizeResponses(raw), error: null };
    }

    async function runLegacy(code, message) {
        if (!global.DiscordBotEngine) return { responses: [], error: "引擎未載入" };
        var res = await global.DiscordBotEngine.runBotCodeLegacy(code, message);
        if (res.error) return { responses: [], error: res.error };
        return {
            responses: res.reply ? [{ content: res.reply }] : [],
            error: null
        };
    }

    async function handleInteraction(opts) {
        opts = opts || {};
        var code = opts.code || "";
        var sessionKey = opts.sessionKey;
        var type = opts.type || "prefix";
        var payload = opts.payload;

        if (isDiscordPyCode(code)) {
            if (!sessionKey) {
                var load = await loadBot(code);
                if (!load.ok) return { responses: [], error: load.error, meta: null };
                sessionKey = load.sessionKey;
            }
            var kind = type === "slash" ? "slash" : (type === "component" ? "component" : "prefix");
            var result = await dispatch(sessionKey, code, kind, payload);
            return Object.assign({ sessionKey: sessionKey }, result);
        }
        if (hasLegacyHandle(code) || !isDiscordPyCode(code)) {
            var legacy = await runLegacy(code, payload);
            return Object.assign({ sessionKey: null }, legacy);
        }
        return { responses: [], error: "無法辨識 Bot 程式格式", sessionKey: null };
    }

    global.DiscordBotRuntime = {
        preprocessDiscordPy: preprocessDiscordPy,
        isDiscordPyCode: isDiscordPyCode,
        loadBot: loadBot,
        dispatch: dispatch,
        handleInteraction: handleInteraction,
        normalizeResponses: normalizeResponses,
        formatEmbedText: formatEmbedText,
        invalidateSession: function (key) { delete sessions[key]; }
    };
})(typeof window !== "undefined" ? window : globalThis);

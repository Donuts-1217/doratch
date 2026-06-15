/** Discord Bot 執行期：保留 async/await，完整 coroutine 調度 */
(function (global) {
    "use strict";

    var sessions = {};
    var sessionCounter = 0;

    function preprocessDiscordPy(code) {
        var normalized = String(code || "").replace(/\r\n/g, "\n");
        // 容錯：裝飾器區塊與 def 中間若有空行，Skulpt 會直接 SyntaxError，這裡做逐行修復
        (function () {
            var lines = normalized.split("\n");
            var out = [];
            var decoDepth = 0;
            var seenDecorator = false;
            var nextNonEmptyCache = function (start) {
                for (var n = start; n < lines.length; n++) {
                    if (String(lines[n] || "").trim()) return String(lines[n] || "").trim();
                }
                return "";
            };
            for (var i = 0; i < lines.length; i++) {
                var raw = String(lines[i] || "");
                var t = raw.trim();
                var startsDecorator = t.indexOf("@") === 0;
                if (startsDecorator) seenDecorator = true;
                if (startsDecorator || decoDepth > 0) {
                    var opens = (raw.match(/\(/g) || []).length;
                    var closes = (raw.match(/\)/g) || []).length;
                    decoDepth += opens - closes;
                    if (decoDepth < 0) decoDepth = 0;
                }

                if (!t && seenDecorator && decoDepth === 0) {
                    var next = nextNonEmptyCache(i + 1);
                    if (/^(?:@|async\s+def|def)\b/.test(next)) {
                        continue; // 移除裝飾器區塊後的空行
                    }
                }

                out.push(raw);
                if (seenDecorator && decoDepth === 0 && /^(?:async\s+def|def)\b/.test(t)) {
                    seenDecorator = false;
                }
                if (!seenDecorator && decoDepth === 0 && t && t.indexOf("@") !== 0) {
                    // 普通區塊，維持原狀
                }
            }
            normalized = out.join("\n");
        })();
        if (global.SkulptCompat) {
            return global.SkulptCompat.preprocessForSkulpt(normalized);
        }
        return normalized;
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
        "if _b is None:\n" +
        "    try:\n" +
        "        _dbc.set_active_bot(bot)\n" +
        "        _b = bot\n" +
        "    except NameError:\n" +
        "        try:\n" +
        "            _dbc.set_active_bot(client)\n" +
        "            _b = client\n" +
        "        except NameError:\n" +
        "            _b = None\n" +
        "if _b:\n" +
        "    _slash_out = _dbc.client_list_slash(_b)\n" +
        "    _cmds = getattr(_b, '_commands', {})\n" +
        "    if _cmds is None:\n" +
        "        _cmds = {}\n" +
        "    _prefix = []\n" +
        "    _seen = set()\n" +
        "    for _k in list(_cmds.keys()):\n" +
        "        _lk = str(_k).lower()\n" +
        "        if _lk in _seen:\n" +
        "            continue\n" +
        "        _seen.add(_lk)\n" +
        "        _prefix.append(_k)\n" +
        "    _meta = {'slash': _slash_out, 'prefix': _prefix, 'user': getattr(_b, 'user', 'MyBot#0001')}\n" +
        "    print('__DORATCH_META__' + _json.dumps(_meta))\n";

    var ACTIVE_BOT_FALLBACK =
        "\nimport discord.ext.commands as _dbc\n" +
        "if _dbc.get_active_bot() is None:\n" +
        "    try:\n" +
        "        _dbc.set_active_bot(bot)\n" +
        "    except NameError:\n" +
        "        try:\n" +
        "            _dbc.set_active_bot(client)\n" +
        "        except NameError:\n" +
        "            pass\n";

    function stripBotRun(code) {
        return String(code || "").replace(
            /^[ \t]*(?:bot|client)\.run\s*\([^)]*\)\s*$/gm,
            "# __doratch__: bot.run skipped for dispatch"
        );
    }

    function buildDispatchSnippet(kind, payload) {
        var py =
            "\nimport json as _json\n" +
            "import discord.ext.commands as _dbc\n" +
            "import discord.ext.async_runner as _ar\n" +
            "def __doratch_dispatch__():\n" +
            "    _b = _dbc.get_active_bot()\n" +
            "    if not _b:\n" +
            "        try:\n" +
            "            _dbc.set_active_bot(bot)\n" +
            "            _b = bot\n" +
            "        except NameError:\n" +
            "            try:\n" +
            "                _dbc.set_active_bot(client)\n" +
            "                _b = client\n" +
            "            except NameError:\n" +
            "                _b = None\n" +
            "    if not _b:\n" +
            "        return []\n";
        if (kind === "prefix") {
            py +=
                "    if hasattr(_b, 'dispatch_prefix_sync'):\n" +
                "        return _b.dispatch_prefix_sync(" + JSON.stringify(payload) + ")\n" +
                "    return _ar.run(_b.dispatch_prefix(" + JSON.stringify(payload) + "))\n";
        } else if (kind === "slash") {
            py +=
                "    if hasattr(_b, 'dispatch_slash_sync'):\n" +
                "        return _b.dispatch_slash_sync(" + JSON.stringify(payload) + ")\n" +
                "    return _ar.run(_b.dispatch_slash(" + JSON.stringify(payload) + "))\n";
        } else if (kind === "component") {
            py +=
                "    if hasattr(_dbc, 'dispatch_component'):\n" +
                "        return _dbc.dispatch_component(" +
                JSON.stringify(payload.viewId) + ", " +
                JSON.stringify(payload.customId) + ", " +
                JSON.stringify(payload.values || []) + ")\n" +
                "    return _ar.run(_dbc._dispatch_component_async(" +
                JSON.stringify(payload.viewId) + ", " +
                JSON.stringify(payload.customId) + ", " +
                JSON.stringify(payload.values || []) + "))\n";
        } else {
            py += "    return []\n";
        }
        py += "__resp__ = __doratch_dispatch__()\n";
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

    /** 從原始碼解析 @bot.command / @client.command（裝飾器未生效時的備援） */
    function extractPrefixCommandsFromCode(code) {
        code = String(code || "");
        var handlers = [];
        var lines = code.split("\n");
        for (var i = 0; i < lines.length; i++) {
            if (!/\.command\b/.test(lines[i])) continue;
            if (/\.tree\.command/.test(lines[i])) continue;
            var block = lines.slice(i, Math.min(i + 8, lines.length)).join(" ");
            var nameM = block.match(/name\s*=\s*['"]([^'"]+)['"]/);
            var funcName = null;
            for (var j = i + 1; j < Math.min(i + 12, lines.length); j++) {
                var dm = lines[j].match(/^\s*async\s+def\s+(\w+)\s*\(/);
                if (dm) {
                    funcName = dm[1];
                    break;
                }
                var dm2 = lines[j].match(/^\s*def\s+(\w+)\s*\(/);
                if (dm2) {
                    funcName = dm2[1];
                    break;
                }
            }
            if (!funcName) continue;
            handlers.push({
                name: nameM ? nameM[1] : funcName,
                funcName: funcName
            });
        }
        return handlers;
    }

    /** 從原始碼解析 @client.tree.command / @bot.tree.command（Skulpt 裝飾器可能未生效時的備援） */
    function extractSlashCommandsFromCode(code) {
        code = String(code || "");
        var handlers = [];
        var lines = code.split("\n");
        for (var i = 0; i < lines.length; i++) {
            if (!/\.tree\.command\b/.test(lines[i])) continue;
            var block = lines.slice(i, Math.min(i + 6, lines.length)).join(" ");
            var nameM = block.match(/name\s*=\s*['"]([^'"]+)['"]/);
            var descM = block.match(/description\s*=\s*['"]([^'"]*)['"]/);
            var funcName = null;
            for (var j = i + 1; j < Math.min(i + 12, lines.length); j++) {
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

    function buildCommandFixSnippet(slashHandlers, prefixHandlers) {
        var slash = slashHandlers || [];
        var prefix = prefixHandlers || [];
        if (!slash.length && !prefix.length) return "";
        var py = "\nimport discord.ext.commands as _dbc\n" +
            "_b = _dbc.get_active_bot()\n" +
            "if _b is None:\n" +
            "    try:\n" +
            "        _dbc.set_active_bot(bot)\n" +
            "        _b = bot\n" +
            "    except NameError:\n" +
            "        try:\n" +
            "            _dbc.set_active_bot(client)\n" +
            "            _b = client\n" +
            "        except NameError:\n" +
            "            _b = None\n" +
            "if _b:\n" +
            "    if not hasattr(_b, '_slash') or _b._slash is None:\n" +
            "        _b._slash = {}\n" +
            "    if not hasattr(_b, '_commands') or _b._commands is None:\n" +
            "        _b._commands = {}\n" +
            "    if getattr(_b, 'tree', None) is None:\n" +
            "        _b.tree = _dbc.CommandTree(_b)\n";
        slash.forEach(function (h) {
            var desc = JSON.stringify(h.description || "");
            var lc = h.name.toLowerCase();
            py += "    if '" + h.name + "' not in _b._slash:\n" +
                "        try:\n" +
                "            _b._slash['" + h.name + "'] = {'description': " + desc + ", 'func': " + h.funcName + "}\n" +
                "            _b._slash['" + lc + "'] = {'description': " + desc + ", 'func': " + h.funcName + "}\n" +
                "        except NameError:\n" +
                "            pass\n";
        });
        prefix.forEach(function (h) {
            var lc = h.name.toLowerCase();
            py += "    if '" + h.name + "' not in _b._commands:\n" +
                "        try:\n" +
                "            _b._commands['" + h.name + "'] = " + h.funcName + "\n" +
                "            _b._commands['" + lc + "'] = " + h.funcName + "\n" +
                "        except NameError:\n" +
                "            pass\n";
        });
        return py;
    }

    function buildSlashFixSnippet(handlers) {
        return buildCommandFixSnippet(handlers, []);
    }

    function mergeMetaFromSource(meta, slashHandlers, prefixHandlers) {
        if (!meta) meta = { slash: [], prefix: [], user: "MyBot#0001" };
        if (!meta.slash || !meta.slash.length) {
            var seenSlash = {};
            meta.slash = (slashHandlers || []).map(function (h) {
                return { name: h.name, description: h.description || "" };
            }).filter(function (h) {
                var key = String(h.name).toLowerCase();
                if (seenSlash[key]) return false;
                seenSlash[key] = true;
                return true;
            });
        }
        if (!meta.prefix || !meta.prefix.length) {
            var seenPrefix = {};
            meta.prefix = (prefixHandlers || []).map(function (h) { return h.name; }).filter(function (n) {
                var key = String(n).toLowerCase();
                if (seenPrefix[key]) return false;
                seenPrefix[key] = true;
                return true;
            });
        }
        return meta;
    }

    function mergeSlashMeta(meta, handlers) {
        return mergeMetaFromSource(meta, handlers, []);
    }

    function parseBotMetaFromCode(code) {
        var slash = extractSlashCommandsFromCode(code);
        var prefix = extractPrefixCommandsFromCode(code);
        return {
            slash: slash.map(function (h) {
                return { name: h.name, description: h.description || "" };
            }),
            prefix: prefix.map(function (h) { return h.name; }),
            user: "MyBot#0001"
        };
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
        var prefixHandlers = extractPrefixCommandsFromCode(originalCode);
        code = preprocessDiscordPy(originalCode);

        var body = code + ACTIVE_BOT_FALLBACK + buildCommandFixSnippet(handlers, prefixHandlers) + META_SNIPPET;
        var res = await runSkulptBody(body, { userLineCount: originalLines });
        if (res.error) return { ok: false, error: res.error };

        var meta = extractInitMeta(res.output);
        if (!meta) {
            var parsedOnly = parseBotMetaFromCode(originalCode);
            if (!parsedOnly.slash.length && !parsedOnly.prefix.length) {
                return { ok: false, error: "Bot 未正確啟動。請確認有 bot.run(TOKEN) 或 client.run(TOKEN)，且指令為 async def。" };
            }
            meta = parsedOnly;
        } else {
            meta = mergeMetaFromSource(meta, handlers, prefixHandlers);
        }

        var key = getSessionKey(code);
        sessions[key] = { code: code, userLines: originalLines, handlers: handlers, prefixHandlers: prefixHandlers };

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
        var prefixHandlers = stored ? stored.prefixHandlers : extractPrefixCommandsFromCode(code);
        var userLineCount = stored ? (stored.userLines || 0) : String(code || "").split("\n").length;
        var body = stripBotRun(src) + ACTIVE_BOT_FALLBACK + buildCommandFixSnippet(handlers, prefixHandlers) + buildDispatchSnippet(kind, payload);
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
        extractSlashCommandsFromCode: extractSlashCommandsFromCode,
        extractPrefixCommandsFromCode: extractPrefixCommandsFromCode,
        parseBotMetaFromCode: parseBotMetaFromCode,
        invalidateSession: function (key) { delete sessions[key]; }
    };
})(typeof window !== "undefined" ? window : globalThis);

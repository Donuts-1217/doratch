/** Discord Bot 模擬器 UI：/ 斜線指令、前綴指令、按鈕、下拉選單 */
(function (global) {
    "use strict";

    var instances = {};
    var BTN_STYLES = { 1: "primary", 2: "secondary", 3: "success", 4: "danger", 5: "link" };

    function esc(s) {
        return String(s || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function mount(container, options) {
        options = options || {};
        var id = container.id || "bot-sim-" + Date.now();
        container.id = id;
        container.className = (container.className + " dbs-root").trim();
        container.innerHTML =
            '<div class="dbs-header">' +
            '  <div class="dbs-title">🤖 Discord Bot 模擬器</div>' +
            '  <span class="dbs-status" data-role="status">未連線</span>' +
            "</div>" +
            '<div class="dbs-token-panel">' +
            '  <label>Bot Token</label>' +
            '  <div class="dbs-token-row">' +
            '    <input type="text" class="dbs-token-input" data-role="token" placeholder="YOUR_BOT_TOKEN 或示範 Token">' +
            '    <button type="button" class="dbs-btn dbs-btn-demo" data-role="demo">示範</button>' +
            '    <button type="button" class="dbs-btn dbs-btn-connect" data-role="connect">連線</button>' +
            '    <button type="button" class="dbs-btn dbs-btn-demo" data-role="reconnect" title="程式改過後重新載入指令">重新連線</button>' +
            "  </div>" +
            '  <p class="dbs-token-hint">連線時會讀取程式 <code>TOKEN = \'…\'</code> · 與 VS Code <code>python main.py</code> 相同 · 改程式後請按「重新連線」</p>' +
            "</div>" +
            '<div class="dbs-channel">' +
            '  <div class="dbs-channel-bar"># <span data-role="channel">general</span> · <span data-role="botname">—</span></div>' +
            '  <div class="dbs-slash-bar" data-role="slash-bar" style="display:none;">' +
            '    <span class="dbs-slash-label">/</span>' +
            '    <div class="dbs-slash-list" data-role="slash-list"></div>' +
            "  </div>" +
            '  <div class="dbs-messages" data-role="messages"></div>' +
            '  <div class="dbs-input-row">' +
            '    <button type="button" class="dbs-btn dbs-btn-slash" data-role="slash-toggle" title="斜線指令">/</button>' +
            '    <input type="text" class="dbs-msg-input" data-role="input" placeholder="輸入 !ping 或 /hello…" disabled>' +
            '    <button type="button" class="dbs-btn dbs-btn-send" data-role="send" disabled>送出</button>' +
            "  </div>" +
            "</div>";

        var state = {
            connected: false,
            token: "",
            botName: "",
            sessionKey: null,
            meta: { slash: [], prefix: [] },
            getCode: options.getCode || function () { return ""; },
            onConnect: options.onConnect || null
        };

        var els = {
            status: container.querySelector('[data-role="status"]'),
            token: container.querySelector('[data-role="token"]'),
            botname: container.querySelector('[data-role="botname"]'),
            messages: container.querySelector('[data-role="messages"]'),
            input: container.querySelector('[data-role="input"]'),
            send: container.querySelector('[data-role="send"]'),
            slashBar: container.querySelector('[data-role="slash-bar"]'),
            slashList: container.querySelector('[data-role="slash-list"]'),
            slashToggle: container.querySelector('[data-role="slash-toggle"]')
        };

        function setBusy(busy) {
            els.input.disabled = busy || !state.connected;
            els.send.disabled = busy || !state.connected;
            els.slashToggle.disabled = busy || !state.connected;
        }

        function setStatus(text, ok) {
            els.status.textContent = text;
            els.status.className = "dbs-status" + (ok ? " online" : "");
        }

        function systemNote(text) {
            var n = document.createElement("div");
            n.className = "dbs-system";
            n.textContent = text;
            els.messages.appendChild(n);
            els.messages.scrollTop = els.messages.scrollHeight;
        }

        function renderComponents(view) {
            if (!view || !view.items || !view.items.length) return null;
            var wrap = document.createElement("div");
            wrap.className = "dbs-components";
            view.items.forEach(function (item) {
                if (item.type === "button") {
                    var btn = document.createElement("button");
                    btn.type = "button";
                    btn.className = "dbs-comp-btn dbs-comp-btn--" + (BTN_STYLES[item.style] || "secondary");
                    btn.textContent = (item.emoji ? item.emoji + " " : "") + (item.label || "Button");
                    btn.onclick = function () {
                        handleInteraction({
                            type: "component",
                            payload: {
                                viewId: view.view_id,
                                customId: item.custom_id,
                                values: []
                            }
                        });
                    };
                    wrap.appendChild(btn);
                } else if (item.type === "select") {
                    var sel = document.createElement("select");
                    sel.className = "dbs-comp-select";
                    var ph = document.createElement("option");
                    ph.value = "";
                    ph.textContent = item.placeholder || "選擇…";
                    sel.appendChild(ph);
                    (item.options || []).forEach(function (opt) {
                        var o = document.createElement("option");
                        o.value = opt.value || opt.label;
                        o.textContent = opt.label || opt.value;
                        sel.appendChild(o);
                    });
                    sel.onchange = function () {
                        if (!sel.value) return;
                        handleInteraction({
                            type: "component",
                            payload: {
                                viewId: view.view_id,
                                customId: item.custom_id,
                                values: [sel.value]
                            }
                        });
                        sel.value = "";
                    };
                    wrap.appendChild(sel);
                }
            });
            return wrap;
        }

        function appendBotResponses(responses) {
            (responses || []).forEach(function (resp) {
                var row = document.createElement("div");
                row.className = "dbs-msg bot" + (resp.ephemeral ? " ephemeral" : "");
                var author = state.botName || "Bot";
                var html = '<span class="dbs-msg-author">' + esc(author) + (resp.ephemeral ? " （僅你可見）" : "") + "</span>";
                if (resp.embed && global.DiscordBotRuntime) {
                    var embedText = global.DiscordBotRuntime.formatEmbedText(resp.embed);
                    if (embedText) {
                        html += '<div class="dbs-msg-embed">' + esc(embedText) + "</div>";
                    }
                }
                if (resp.content) {
                    html += '<span class="dbs-msg-text">' + esc(resp.content) + "</span>";
                }
                row.innerHTML = html;
                els.messages.appendChild(row);
                if (resp.view) {
                    var comp = renderComponents(resp.view);
                    if (comp) {
                        var compRow = document.createElement("div");
                        compRow.className = "dbs-msg bot dbs-msg-components";
                        compRow.appendChild(comp);
                        els.messages.appendChild(compRow);
                    }
                }
            });
            els.messages.scrollTop = els.messages.scrollHeight;
        }

        async function handleInteraction(opts) {
            if (!state.connected || !global.DiscordBotRuntime) return;
            setBusy(true);
            var code = state.getCode();
            var type = opts.type || "prefix";
            var payload = opts.payload;

            try {
                var result = await global.DiscordBotRuntime.handleInteraction({
                    code: code,
                    sessionKey: state.sessionKey,
                    type: type,
                    payload: payload
                });
                if (result.sessionKey) state.sessionKey = result.sessionKey;
                if (result.error) {
                    appendBotResponses([{ content: "⚠ " + result.error }]);
                } else {
                    appendBotResponses(result.responses);
                }
            } catch (e) {
                appendBotResponses([{ content: "⚠ " + (e.message || e) }]);
            }
            setBusy(false);
            els.input.focus();
        }

        function appendUserLine(text, isSlash) {
            var row = document.createElement("div");
            row.className = "dbs-msg user";
            row.innerHTML =
                '<span class="dbs-msg-author">你' + (isSlash ? " · /指令" : "") + "</span>" +
                '<span class="dbs-msg-text">' + esc(text) + "</span>";
            els.messages.appendChild(row);
            els.messages.scrollTop = els.messages.scrollHeight;
        }

        async function sendUserMessage(text) {
            text = String(text || "").trim();
            if (!state.connected || !text) return;

            var isSlash = text.charAt(0) === "/";
            appendUserLine(text, isSlash);
            els.input.value = "";
            hideSlashBar();

            if (isSlash) {
                var cmd = text.slice(1).split(/\s+/)[0];
                await handleInteraction({ type: "slash", payload: cmd });
            } else {
                await handleInteraction({ type: "prefix", payload: text });
            }
        }

        function renderSlashCommands() {
            els.slashList.innerHTML = "";
            var cmds = (state.meta && state.meta.slash) || [];
            if (!cmds.length) {
                els.slashBar.style.display = "none";
                return;
            }
            var seen = {};
            cmds.forEach(function (c) {
                var key = String(c.name || "").toLowerCase();
                if (!c.name || seen[key]) return;
                seen[key] = true;
                var btn = document.createElement("button");
                btn.type = "button";
                btn.className = "dbs-slash-cmd";
                btn.innerHTML = "<strong>/" + esc(c.name) + "</strong> <span>" + esc(c.description || "") + "</span>";
                btn.onclick = function () {
                    sendUserMessage("/" + c.name);
                };
                els.slashList.appendChild(btn);
            });
        }

        function showSlashBar() {
            var hasSlash = state.meta && state.meta.slash && state.meta.slash.length;
            var hasPrefix = state.meta && state.meta.prefix && state.meta.prefix.length;
            if (!hasSlash && !hasPrefix) {
                systemNote("此 Bot 尚未註冊指令（@bot.command 或 @bot.tree.command）");
                return;
            }
            if (!hasSlash && hasPrefix) {
                systemNote("前綴指令：" + state.meta.prefix.map(function (c) { return "!" + c; }).join(" · ") + "（在下方輸入框輸入）");
                return;
            }
            renderSlashCommands();
            els.slashBar.style.display = els.slashBar.style.display === "flex" ? "none" : "flex";
        }

        function hideSlashBar() {
            els.slashBar.style.display = "none";
        }

        async function connect() {
            var code = state.getCode();
            var token = els.token.value.trim();
            if (!token && global.DiscordBotEngine) {
                var fromCode = global.DiscordBotEngine.extractTokenFromCode(code);
                if (fromCode && fromCode !== "YOUR_BOT_TOKEN") {
                    token = fromCode;
                    els.token.value = token;
                }
            }
            if (!token && global.DiscordBotEngine) {
                token = global.DiscordBotEngine.DEMO_TOKEN;
                els.token.value = token;
            }
            if (!token) {
                alert("請輸入 Bot Token");
                return;
            }

            if (state.onConnect) {
                try {
                    await state.onConnect(token);
                } catch (e) {
                    alert(e.message || String(e));
                    return;
                }
            }

            setBusy(true);
            state.connected = true;
            state.token = token;
            state.sessionKey = null;

            var code = state.getCode();
            var botName = "MyBot#0001";
            state.meta = { slash: [], prefix: [] };

            if (global.DiscordBotRuntime && global.DiscordBotRuntime.isDiscordPyCode(code)) {
                var load = await global.DiscordBotRuntime.loadBot(code);
                if (!load.ok) {
                    state.connected = false;
                    setBusy(true);
                    alert(load.error || "Bot 載入失敗");
                    return;
                }
                state.sessionKey = load.sessionKey;
                state.meta = load.meta || state.meta;
                botName = (load.meta && load.meta.user) || botName;
                systemNote("✅ " + (load.readyMessage || "Bot 上線"));
                if (state.meta.prefix && state.meta.prefix.length) {
                    systemNote("前綴指令：" + state.meta.prefix.map(function (c) { return "!" + c; }).join(" · "));
                }
                if (state.meta.slash && state.meta.slash.length) {
                    systemNote("斜線指令：/" + state.meta.slash.map(function (c) { return c.name; }).join(" · /"));
                }
                if (!(state.meta.slash && state.meta.slash.length) && !(state.meta.prefix && state.meta.prefix.length)) {
                    systemNote("⚠️ 未偵測到指令。請確認有 @bot.command 或 @bot.tree.command，並按「重新連線」");
                }
            } else {
                botName = token === global.DiscordBotEngine.DEMO_TOKEN ? "Doratch 示範 Bot" : "Legacy Bot";
                systemNote("✅ 已連線（簡易模式：handle(msg) / input 邏輯）");
            }

            state.botName = botName;
            els.botname.textContent = botName;
            setStatus("已連線 · " + global.DiscordBotEngine.maskToken(token), true);
            renderSlashCommands();
            setBusy(false);
            els.input.focus();
        }

        container.querySelector('[data-role="demo"]').onclick = function () {
            if (global.DiscordBotEngine) els.token.value = global.DiscordBotEngine.DEMO_TOKEN;
        };
        container.querySelector('[data-role="connect"]').onclick = connect;
        container.querySelector('[data-role="reconnect"]').onclick = async function () {
            if (state.connected && global.DiscordBotRuntime) {
                if (state.sessionKey) global.DiscordBotRuntime.invalidateSession(state.sessionKey);
                state.sessionKey = null;
            }
            await connect();
        };
        els.send.onclick = function () { sendUserMessage(els.input.value); };
        els.slashToggle.onclick = showSlashBar;
        els.input.onkeydown = function (e) {
            if (e.key === "Enter") sendUserMessage(els.input.value);
            if (e.key === "/" && !els.input.value) showSlashBar();
        };

        var api = {
            connect: connect,
            disconnect: function () {
                if (state.sessionKey && global.DiscordBotRuntime) {
                    global.DiscordBotRuntime.invalidateSession(state.sessionKey);
                }
                state.connected = false;
                state.sessionKey = null;
                setStatus("未連線", false);
                setBusy(true);
            },
            refreshMeta: async function () {
                var code = state.getCode();
                if (!global.DiscordBotRuntime || !global.DiscordBotRuntime.isDiscordPyCode(code)) {
                    state.meta = { slash: [], prefix: [] };
                    renderSlashCommands();
                    return state.meta;
                }
                var load = await global.DiscordBotRuntime.loadBot(code);
                if (load.ok && load.meta) {
                    state.meta = load.meta;
                    if (state.connected) {
                        renderSlashCommands();
                        if (state.meta.slash && state.meta.slash.length) {
                            systemNote("已更新斜線指令：/" + state.meta.slash.map(function (c) { return c.name; }).join(" · /"));
                        }
                    }
                }
                return state.meta;
            },
            clearMessages: function () { els.messages.innerHTML = ""; },
            getToken: function () { return state.token; },
            setToken: function (t) { if (t) els.token.value = t; },
            isConnected: function () { return state.connected; },
            appendSystem: systemNote
        };

        instances[id] = api;
        return api;
    }

    global.DiscordBotSimulator = {
        mount: mount,
        get: function (id) { return instances[id]; }
    };
})(typeof window !== "undefined" ? window : globalThis);

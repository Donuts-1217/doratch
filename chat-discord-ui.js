/** 交流大廳 Discord 風格 UI：斜線指令選單、成員/Bot 列表 */
(function (global) {
    "use strict";

    var slashCommands = [];
    var pickerEl = null;
    var inputEl = null;
    var pickerIndex = 0;
    var filtered = [];
    var pickerMode = "";
    var getMentionCandidatesFn = null;

    function esc(s) {
        return String(s || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    async function loadBotsMeta(attachedBots, loadBotCodeFn) {
        var metas = [];
        var flatSlash = [];
        if (!attachedBots || !attachedBots.length) {
            slashCommands = [];
            return metas;
        }

        for (var i = 0; i < attachedBots.length; i++) {
            var entry = attachedBots[i];
            var meta = {
                entry: entry,
                name: entry.name || "Bot",
                slash: [],
                prefix: [],
                botName: entry.name || "Bot"
            };
            try {
                var botData = await loadBotCodeFn(entry.ownerId, entry.botId);
                if (!botData || !botData.pythonCode) {
                    metas.push(meta);
                    continue;
                }
                meta.name = entry.name || botData.name || "Bot";
                if (global.DiscordBotRuntime && global.DiscordBotRuntime.isDiscordPyCode(botData.pythonCode)) {
                    var load = await global.DiscordBotRuntime.loadBot(botData.pythonCode);
                    if (load.ok && load.meta) {
                        meta.slash = load.meta.slash || [];
                        meta.prefix = load.meta.prefix || [];
                        meta.botName = (load.meta.user || meta.name).split("#")[0];
                        load.meta.slash.forEach(function (cmd) {
                            flatSlash.push({
                                name: cmd.name,
                                description: cmd.description || "",
                                botName: meta.name,
                                botToken: entry.token
                            });
                        });
                    } else if (global.DiscordBotRuntime.parseBotMetaFromCode) {
                        var parsed = global.DiscordBotRuntime.parseBotMetaFromCode(botData.pythonCode);
                        meta.slash = parsed.slash || [];
                        meta.prefix = parsed.prefix || [];
                        parsed.slash.forEach(function (cmd) {
                            flatSlash.push({
                                name: cmd.name,
                                description: cmd.description || "",
                                botName: meta.name,
                                botToken: entry.token
                            });
                        });
                    }
                }
            } catch (e) {
                console.warn("Bot meta 載入失敗", e);
            }
            metas.push(meta);
        }

        slashCommands = flatSlash;
        return metas;
    }

    function hidePicker() {
        if (pickerEl) pickerEl.style.display = "none";
        pickerIndex = 0;
        filtered = [];
        pickerMode = "";
    }

    function bindPickerItems(onPick) {
        if (!pickerEl) return;
        pickerEl.querySelectorAll(".slash-picker-item").forEach(function (btn) {
            btn.onclick = function () {
                onPick(filtered[parseInt(btn.dataset.idx, 10)]);
            };
        });
    }

    function showSlashPicker(items) {
        if (!pickerEl) return;
        pickerMode = "slash";
        filtered = items;
        pickerIndex = 0;
        if (!items.length) {
            pickerEl.innerHTML = '<div class="slash-picker-empty">沒有符合的斜線指令<br><small>請先按 🤖 Bot 連接已部署的 Bot</small></div>';
            pickerEl.style.display = "block";
            return;
        }
        pickerEl.innerHTML = items.map(function (cmd, idx) {
            return (
                '<button type="button" class="slash-picker-item' + (idx === 0 ? " active" : "") + '" data-idx="' + idx + '">' +
                '<span class="slash-cmd-name">/' + esc(cmd.name) + "</span>" +
                '<span class="slash-cmd-desc">' + esc(cmd.description || "執行指令") + "</span>" +
                '<span class="slash-cmd-bot">🤖 ' + esc(cmd.botName) + "</span>" +
                "</button>"
            );
        }).join("");
        pickerEl.style.display = "block";
        bindPickerItems(pickSlash);
    }

    function showMentionPicker(items) {
        if (!pickerEl) return;
        pickerMode = "mention";
        filtered = items;
        pickerIndex = 0;
        if (!items.length) {
            pickerEl.innerHTML = '<div class="slash-picker-empty">沒有符合的成員<br><small>輸入 @ 可艾特對方顯示名稱</small></div>';
            pickerEl.style.display = "block";
            return;
        }
        pickerEl.innerHTML = items.map(function (member, idx) {
            var avatar = "https://ui-avatars.com/api/?name=" + encodeURIComponent(member.label || member.handle || "U") + "&background=5865F2&color=fff";
            var sub = member.emailAlias ? ("帳號 " + member.emailAlias) : "";
            return (
                '<button type="button" class="slash-picker-item mention-picker-item' + (idx === 0 ? " active" : "") + '" data-idx="' + idx + '">' +
                '<img src="' + avatar + '" alt="" class="mention-avatar">' +
                '<span class="mention-name">' + esc(member.label || member.handle) + "</span>" +
                '<span class="mention-handle">@' + esc(member.label || member.handle || "") + "</span>" +
                (sub ? ('<span class="slash-cmd-bot">' + esc(sub) + "</span>") : "") +
                "</button>"
            );
        }).join("");
        pickerEl.style.display = "block";
        bindPickerItems(pickMention);
    }

    function highlightPicker() {
        if (!pickerEl) return;
        pickerEl.querySelectorAll(".slash-picker-item").forEach(function (el, i) {
            el.classList.toggle("active", i === pickerIndex);
        });
        var active = pickerEl.querySelector(".slash-picker-item.active");
        if (active) active.scrollIntoView({ block: "nearest" });
    }

    function pickSlash(cmd) {
        if (!cmd || !inputEl) return;
        inputEl.value = "/" + cmd.name;
        hidePicker();
        inputEl.focus();
    }

    function getMentionQueryAtCursor() {
        if (!inputEl) return null;
        var val = inputEl.value || "";
        var pos = typeof inputEl.selectionStart === "number" ? inputEl.selectionStart : val.length;
        var before = val.slice(0, pos);
        var m = before.match(/(?:^|\s)@([^@\n]*)$/);
        if (!m) return null;
        var atPos = before.length - m[0].length + (m[0].charAt(0) === " " ? 1 : 0);
        return { query: (m[1] || "").toLowerCase(), atPos: atPos, cursorPos: pos };
    }

    function pickMention(member) {
        if (!member || !inputEl) return;
        var ctx = getMentionQueryAtCursor();
        if (!ctx) return;
        var val = inputEl.value || "";
        var displayName = String(member.label || member.handle || "使用者").trim();
        var insert = "@" + displayName + " ";
        var next = val.slice(0, ctx.atPos) + insert + val.slice(ctx.cursorPos);
        inputEl.value = next;
        hidePicker();
        inputEl.focus();
        var caret = ctx.atPos + insert.length;
        if (typeof inputEl.setSelectionRange === "function") inputEl.setSelectionRange(caret, caret);
        if (typeof inputEl.dispatchEvent === "function") {
            inputEl.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    function onInputChange() {
        if (!inputEl) return;
        var val = inputEl.value || "";
        var mentionCtx = getMentionQueryAtCursor();
        if (mentionCtx && typeof getMentionCandidatesFn === "function") {
            var candidates = getMentionCandidatesFn() || [];
            var q = mentionCtx.query;
            var items = candidates.filter(function (c) {
                if (!q) return true;
                var label = String(c.label || c.handle || "").toLowerCase();
                var alias = String(c.emailAlias || "").toLowerCase();
                return label.indexOf(q) >= 0 || (alias && alias.indexOf(q) === 0);
            });
            showMentionPicker(items);
            return;
        }
        if (val.startsWith("/")) {
            var slashQ = val.slice(1).split(/\s/)[0].toLowerCase();
            var slashItems = slashCommands.filter(function (c) {
                return !slashQ || c.name.toLowerCase().indexOf(slashQ) === 0;
            });
            showSlashPicker(slashItems);
            return;
        }
        hidePicker();
    }

    function mountInput(input, picker, onSlashBtn, options) {
        options = options || {};
        inputEl = input;
        pickerEl = picker;
        getMentionCandidatesFn = typeof options.getMentionCandidates === "function"
            ? options.getMentionCandidates
            : null;
        if (input._discordUiMounted) return;
        input._discordUiMounted = true;

        input.addEventListener("input", onInputChange);
        input.addEventListener("click", onInputChange);
        input.addEventListener("keyup", onInputChange);
        input.addEventListener("keydown", function (e) {
            if (pickerEl && pickerEl.style.display === "block" && filtered.length) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    pickerIndex = Math.min(pickerIndex + 1, filtered.length - 1);
                    highlightPicker();
                    return;
                }
                if (e.key === "ArrowUp") {
                    e.preventDefault();
                    pickerIndex = Math.max(pickerIndex - 1, 0);
                    highlightPicker();
                    return;
                }
                if (e.key === "Enter" && pickerMode === "slash") {
                    e.preventDefault();
                    pickSlash(filtered[pickerIndex]);
                    if (typeof inputEl._chatSend === "function") inputEl._chatSend();
                    return;
                }
                if ((e.key === "Enter" || e.key === "Tab") && pickerMode === "mention") {
                    e.preventDefault();
                    pickMention(filtered[pickerIndex]);
                    return;
                }
                if (e.key === "Escape") {
                    hidePicker();
                    return;
                }
            }
            if (e.key === "Enter" && typeof inputEl._chatSend === "function") {
                if (e.shiftKey) return;
                var sendOnEnter = true;
                if (typeof inputEl._enterToSendCheck === "function") {
                    sendOnEnter = !!inputEl._enterToSendCheck();
                }
                if (!sendOnEnter && !e.ctrlKey && !e.metaKey) return;
                e.preventDefault();
                e.stopPropagation();
                hidePicker();
                inputEl._chatSend();
            }
        });

        if (onSlashBtn) {
            onSlashBtn.onclick = function () {
                if (!slashCommands.length) {
                    alert("此聊天室尚無 Bot 斜線指令。\n請按 🤖 Bot 連接已部署的 Discord Bot。");
                    return;
                }
                input.value = "/";
                input.focus();
                showSlashPicker(slashCommands);
            };
        }
    }

    function renderMemberList(container, options) {
        options = options || {};
        var members = options.members || [];
        var bots = options.botsMeta || [];
        var teacherId = options.teacherId;
        var currentUid = options.currentUid;
        var onKick = options.onKick;
        var onDisconnectBot = options.onDisconnectBot;
        var onUseSlash = options.onUseSlash;

        var header = document.getElementById("member-sidebar-header-text");
        if (header) {
            header.textContent = "成員 — " + members.length + (bots.length ? " · 🤖 " + bots.length : "");
        }

        container.innerHTML = "";

        var sec1 = null;
        if (members.length) {
            sec1 = document.createElement("div");
            sec1.className = "member-section-title";
            container.appendChild(sec1);
            var onlineCount = 0;
            members.forEach(function (member) {
                var isOwner = member.uid === teacherId;
                var isMe = member.uid === currentUid;
                var online = options.isOnlineUser ? !!options.isOnlineUser(member) : false;
                if (online) onlineCount += 1;
                var avatarUrl = "https://ui-avatars.com/api/?name=" + encodeURIComponent(member.email || "U") + "&background=random";
                var displayName = (member.email || "未知").split("@")[0];
                var kickBtn = (teacherId === currentUid && !isOwner && !isMe && onKick)
                    ? '<button type="button" class="kick-btn" data-kick="' + esc(member.uid) + '" data-name="' + esc(displayName) + '">踢出</button>'
                    : "";
                var crown = isOwner ? " 👑" : "";
                var meTag = isMe ? ' <span class="member-tag">你</span>' : "";
                var statusCls = online ? "online" : "offline";

                var item = document.createElement("div");
                item.className = "member-item";
                item.setAttribute("data-member-uid", member.uid || "");
                item.innerHTML =
                    '<div class="member-avatar-wrap">' +
                    '<img src="' + avatarUrl + '" class="member-avatar" alt="">' +
                    '<span class="member-status ' + statusCls + '"></span>' +
                    "</div>" +
                    '<div class="member-info">' +
                    '<div class="member-name">' + esc(displayName) + crown + meTag + "</div>" +
                    (isOwner ? '<div class="member-role">管理員</div>' : "") +
                    "</div>" + kickBtn;
                container.appendChild(item);
            });
            if (sec1) sec1.textContent = "線上 — " + onlineCount + " / " + members.length;
        }

        var sec2 = document.createElement("div");
        sec2.className = "member-section-title";
        sec2.textContent = "Bot — " + bots.length;
        container.appendChild(sec2);

        if (!bots.length) {
            var empty = document.createElement("div");
            empty.className = "member-empty-hint";
            empty.innerHTML = "尚無 Bot<br><small>按 🤖 Bot 貼 Token 連接</small>";
            container.appendChild(empty);
        }

        bots.forEach(function (bm) {
            var entry = bm.entry;
            var canDisconnect = onDisconnectBot && (entry.ownerId === currentUid || teacherId === currentUid);
            var avatarUrl = "https://ui-avatars.com/api/?name=" + encodeURIComponent(bm.name) + "&background=23a559&color=fff";
            var cmds = [];
            bm.slash.forEach(function (s) { cmds.push("/" + s.name); });
            bm.prefix.forEach(function (p) { cmds.push("!" + p); });
            var cmdLine = cmds.length ? cmds.slice(0, 6).join(" · ") : "（無指令）";

            var item = document.createElement("div");
            item.className = "member-item member-item--bot";
            item.innerHTML =
                '<div class="member-avatar-wrap">' +
                '<img src="' + avatarUrl + '" class="member-avatar" alt="">' +
                '<span class="member-status bot"></span>' +
                "</div>" +
                '<div class="member-info">' +
                '<div class="member-name">' + esc(bm.name) + ' <span class="member-tag bot">APP</span></div>' +
                '<div class="member-role member-cmds">' + esc(cmdLine) + "</div>" +
                "</div>" +
                (canDisconnect
                    ? '<button type="button" class="kick-btn bot-disconnect" data-token="' + esc(entry.token) + '" title="中斷 Bot">✕</button>'
                    : "");

            container.appendChild(item);

            if (onUseSlash && bm.slash.length) {
                item.querySelector(".member-cmds").style.cursor = "pointer";
                item.title = "點指令列可快速輸入 / 斜線指令";
            }
        });

        container.querySelectorAll("[data-kick]").forEach(function (btn) {
            btn.onclick = function () {
                onKick(btn.dataset.kick, btn.dataset.name);
            };
        });
        container.querySelectorAll(".bot-disconnect").forEach(function (btn) {
            btn.onclick = function () {
                onDisconnectBot(btn.dataset.token);
            };
        });
        container.querySelectorAll(".member-item--bot .member-cmds").forEach(function (el, idx) {
            if (!onUseSlash || !bots[idx] || !bots[idx].slash.length) return;
            el.onclick = function () {
                onUseSlash(bots[idx].slash[0].name);
            };
        });
    }

    global.ChatDiscordUI = {
        loadBotsMeta: loadBotsMeta,
        mountInput: mountInput,
        hidePicker: hidePicker,
        renderMemberList: renderMemberList,
        getSlashCommands: function () { return slashCommands; },
        pickSlashByName: function (name) {
            var cmd = slashCommands.find(function (c) { return c.name === name; });
            if (cmd && inputEl) {
                inputEl.value = "/" + cmd.name;
                inputEl.focus();
            }
        }
    };
})(typeof window !== "undefined" ? window : globalThis);

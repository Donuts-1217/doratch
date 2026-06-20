/**
 * Python 學習 — 問答助教（情境式引導，不直接給答案）
 * 可日後接上 Firebase / Gemini 等 LLM：PythonTutorQA.setRemoteHandler(fn)
 */
(function (global) {
    "use strict";

    var remoteHandler = null;
    var history = [];

    function norm(s) {
        return String(s || "").trim().toLowerCase();
    }

    function includesAny(text, words) {
        var t = norm(text);
        return words.some(function (w) { return t.indexOf(w) >= 0; });
    }

    function lessonCtx(ctx) {
        var lesson = (ctx && ctx.lesson) || {};
        return {
            id: lesson.id || "",
            title: lesson.title || "本關",
            summary: lesson.summary || "",
            goals: lesson.goals || [],
            track: lesson.track || "base",
            tests: lesson.tests || []
        };
    }

    function firstFailedCheck(ctx) {
        var a = ctx && ctx.analysis;
        if (!a || !a.checks) return null;
        for (var i = 0; i < a.checks.length; i++) {
            if (!a.checks[i].pass) return a.checks[i].text;
        }
        return null;
    }

    function reply(text, chips) {
        return { text: text, chips: chips || [] };
    }

    function answerLocal(question, ctx) {
        var q = norm(question);
        var L = lessonCtx(ctx);
        var failed = firstFailedCheck(ctx);
        var next = (ctx && ctx.analysis && ctx.analysis.next) || [];
        var err = String((ctx && ctx.lastError) || "").trim();
        var codeLines = String((ctx && ctx.code) || "").split("\n").filter(function (l) {
            return l.trim() && !l.trim().startsWith("#");
        }).length;

        if (!q) {
            return reply("想問什麼都可以，例如：「這關要幹嘛？」「print 怎麼用？」「我為什麼錯？」");
        }

        if (includesAny(q, ["你好", "嗨", "hello", "哈囉"])) {
            return reply(
                "你好！我是 **Python 問答助教**。\n\n我會依你目前的關卡與程式，用提示引導你思考——**不會直接貼答案**。\n\n你可以問：這關目標、語法用法、為什麼測試失敗、Bot 怎麼測。"
            );
        }

        if (includesAny(q, ["這關", "題目", "要幹嘛", "目標", "通關", "要求"])) {
            var goals = L.goals.length
                ? L.goals.map(function (g, i) { return (i + 1) + ". " + g; }).join("\n")
                : "（請看上方通關條件）";
            return reply(
                "**" + L.title + "**\n" + L.summary + "\n\n🎯 通關重點：\n" + goals +
                "\n\n💡 先看「分段教學」，再按「載入本關骨架」建立結構。"
            );
        }

        if (includesAny(q, ["卡住", "不會", "怎麼開始", "從哪", "第一步"])) {
            if (codeLines <= 1) {
                return reply(
                    "還沒開始寫程式很正常！建議順序：\n" +
                    "1️⃣ 讀 starter 註解裡的「任務」\n" +
                    "2️⃣ 按 **載入本關骨架** 放結構\n" +
                    "3️⃣ 只補最小一行（例如 print 或 input）\n" +
                    "4️⃣ 按 ▶ 執行看結果\n\n" +
                    (next[0] ? "助教分析建議：**" + next[0] + "**" : "")
                );
            }
            if (failed) {
                return reply(
                    "目前卡關點：**" + failed + "**\n\n" +
                    (next.length ? "試試看：\n• " + next.slice(0, 3).join("\n• ") : "打開「學習輔助系統」看下一步。")
                );
            }
            return reply("程式已有 " + codeLines + " 行，方向對了！先 ▶ 執行手測，再 ✅ 跑測試。");
        }

        if (includesAny(q, ["print", "輸出", "印出"])) {
            return reply(
                "**print()** 把資料顯示在執行視窗。\n\n" +
                "• 文字要用引號：`print(\"Hello\")`\n" +
                "• 變數不用引號：`print(x)`\n" +
                "• 本關輸出必須**和題目一模一樣**（空格、標點都要對）\n\n" +
                "試著只寫一行 print，按 ▶ 執行確認。"
            );
        }

        if (includesAny(q, ["input", "輸入", "讀取"])) {
            return reply(
                "**input()** 從執行視窗讀一行文字。\n\n" +
                "• `name = input()` 再 `print(name)`\n" +
                "• 執行時終端機會等你打字\n" +
                "• **不要**把測試資料寫死在 print 裡\n\n" +
                "本關要用 input 讀值，再依題目格式輸出。"
            );
        }

        if (includesAny(q, ["if", "elif", "else", "條件", "分支", "判斷"])) {
            return reply(
                "條件分支骨架：\n```\nif 條件:\n    ...\nelif 其他:\n    ...\nelse:\n    ...\n```\n" +
                "• 條件後面要有 **冒號**\n" +
                "• 下一行要 **縮排 4 格**\n" +
                "• 成績題記得 **elif** 處理中間分數\n\n" +
                (L.id === "if-grade" ? "提示：從高分往低分判斷，或依題目邊界 90/80/60。" : "")
            );
        }

        if (includesAny(q, ["for", "while", "迴圈", "loop"])) {
            return reply(
                "**for** 適合已知次數：`for i in range(n):`\n" +
                "**while** 適合不知道何時停：`while 條件:`\n\n" +
                "加總題常用累加變數，每圈更新。\n" +
                "while-guess 關：讀到 0 就 break，0 不算在總和裡。"
            );
        }

        if (includesAny(q, ["def", "函式", "function", "return"])) {
            return reply(
                "函式模板：\n```\ndef 名稱(參數):\n    # 邏輯\n    return 結果\n```\n" +
                "主程式讀 input → 呼叫函式 → print 回傳值。\n" +
                "Discord 關 14：`handle(msg)` 用 return 回字串，外面再 print。"
            );
        }

        if (includesAny(q, ["list", "串列", "平均", "陣列"])) {
            return reply(
                "讀多筆資料可用：\n" +
                "• 先 `n = int(input())` 再 for 讀 n 次\n" +
                "• 或 `scores = []` 搭配 `append`\n" +
                "平均：加總 ÷ 個數（本關用整數除法 //）。"
            );
        }

        if (includesAny(q, ["bot", "discord", "指令", "!hello", "!ping", "模擬器"])) {
            if (L.id.indexOf("discord-py") === 0) {
                return reply(
                    "**discord.py 關卡** 請用右側 **Bot 模擬器**：\n" +
                    "1️⃣ 按「連線 / 重新連線」\n" +
                    "2️⃣ 頻道輸入 `!指令` 或按 `/` 選斜線指令\n" +
                    "3️⃣ 指令需 `async def` + `await ctx.send(...)`\n" +
                    "4️⃣ 最後要有 `bot.run(TOKEN)`\n\n" +
                    "快插按鈕可插入 @bot.command 骨架。"
                );
            }
            return reply(
                "Bot 邏輯關（11–15）用 **print 模擬** Bot 回覆：\n" +
                "• 讀 `msg = input()`\n" +
                "• `if msg == '!hello': print('Bot: ...')`\n" +
                "• 多指令用 elif，未知指令要有 else\n\n" +
                "格式要和測試期望的 **Bot: ...** 一致。"
            );
        }

        if (includesAny(q, ["錯", "失敗", "error", "syntax", "語法", "例外", "traceback", "為什麼"])) {
            if (err) {
                var hint = "";
                if (/syntaxerror|invalid syntax/i.test(err)) {
                    hint = "\n\n常見原因：少冒號、括號不配對、縮排錯誤、全形符號。";
                } else if (/indentationerror/i.test(err)) {
                    hint = "\n\n常見原因：if/for/def 下一行沒縮排，或混用 Tab/空格。";
                } else if (/nameerror/i.test(err)) {
                    hint = "\n\n常見原因：變數名拼錯，或還沒賦值就使用。";
                } else if (/typeerror|valueerror/i.test(err)) {
                    hint = "\n\n常見原因：型別不對，例如 int(input()) 但輸入不是數字。";
                }
                return reply("執行錯誤訊息：\n`" + err.slice(0, 280) + "`" + hint);
            }
            if (failed) {
                return reply(
                    "測試/條件還沒過：**" + failed + "**\n\n" +
                    (next[0] ? "建議：**" + next[0] + "**" : "對照上方通關條件逐項檢查。")
                );
            }
            return reply(
                "先按 ▶ 執行或 ✅ 跑測試，把錯誤訊息或失敗測試貼給我。\n" +
                "也可以問「我卡住了」讓我看輔助分析。"
            );
        }

        if (includesAny(q, ["測試", "跑測試", "通過", "期望"])) {
            if (!L.tests.length) {
                return reply("本關沒有自動測試，請用執行視窗或 Bot 模擬器手動驗證。");
            }
            return reply(
                "自動測試會餵 **stdin** 並比對 **stdout**。\n" +
                "• 輸出要完全一致（含換行）\n" +
                "• 先 ▶ 執行，手動輸入測試資料試試\n" +
                "• 通過後 +15 金幣（每關首次）\n\n" +
                (failed ? "目前未過：**" + failed + "**" : "輔助系統顯示條件已齊，可以跑測試！")
            );
        }

        if (includesAny(q, ["答案", "給我", "直接寫", "抄", "solution"])) {
            return reply(
                "我不能直接給完整答案喔 😊\n\n" +
                "你可以：\n" +
                "• 按 **載入本關骨架** 看結構\n" +
                "• 看 **分段教學** 的語法示範（示範 ≠ 答案）\n" +
                "• 問「print 怎麼用」「我卡住了」取得提示\n\n" +
                "自己寫出來才學得會！"
            );
        }

        if (next.length) {
            return reply(
                "關於「" + question + "」——\n\n" +
                "依你目前的程式，建議先處理：\n• " + next.slice(0, 3).join("\n• ") +
                "\n\n也可以問更具体的：語法（print/if/for）、Bot、或「為什麼錯」。"
            );
        }

        return reply(
            "我還不太確定你的問題。試試這些問法：\n" +
            "• 這關要幹嘛？\n" +
            "• print / input 怎麼用？\n" +
            "• 我卡住了\n" +
            "• 為什麼測試失敗？\n" +
            "• Bot 模擬器怎麼測？"
        );
    }

    function answer(question, ctx) {
        if (remoteHandler) {
            return remoteHandler(question, ctx, history).catch(function () {
                return answerLocal(question, ctx);
            });
        }
        return Promise.resolve(answerLocal(question, ctx));
    }

    function defaultQuickChips(ctx) {
        var L = lessonCtx(ctx);
        var chips = ["這關要幹嘛？", "我卡住了", "為什麼錯？"];
        if (L.track === "discord") {
            chips.push(L.id.indexOf("discord-py") === 0 ? "Bot 模擬器怎麼測？" : "! 指令怎麼寫？");
        } else {
            chips.push("print 怎麼用？");
        }
        return chips;
    }

    function mount(options) {
        options = options || {};
        var root = document.getElementById(options.rootId || "tutor-qa-root");
        if (!root) return;

        var getContext = options.getContext || function () { return {}; };
        var messagesEl = root.querySelector(".tutor-messages");
        var inputEl = root.querySelector(".tutor-qa-input");
        var sendBtn = root.querySelector(".tutor-qa-send");
        var quickEl = root.querySelector(".tutor-quick");

        function renderQuick() {
            if (!quickEl) return;
            quickEl.innerHTML = "";
            defaultQuickChips(getContext()).forEach(function (label) {
                var b = document.createElement("button");
                b.type = "button";
                b.textContent = label;
                b.onclick = function () { ask(label); };
                quickEl.appendChild(b);
            });
        }

        function appendMsg(role, text) {
            if (!messagesEl) return;
            var empty = messagesEl.querySelector(".tutor-empty");
            if (empty) empty.remove();
            var div = document.createElement("div");
            div.className = "tutor-msg " + role;
            div.innerHTML = text
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/`([^`]+)`/g, "<code>$1</code>")
                .replace(/```[\s\S]*?```/g, function (block) {
                    return "<pre style=\"margin:6px 0;padding:8px;background:#1e293b;color:#e2e8f0;border-radius:8px;font-size:12px;overflow:auto;\">" +
                        block.replace(/```/g, "").trim() + "</pre>";
                });
            messagesEl.appendChild(div);
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }

        function setBusy(on) {
            if (sendBtn) sendBtn.disabled = !!on;
            if (inputEl) inputEl.disabled = !!on;
        }

        function ask(text) {
            var q = String(text || (inputEl && inputEl.value) || "").trim();
            if (!q) return;
            if (inputEl) inputEl.value = "";
            appendMsg("user", q);
            history.push({ role: "user", content: q });
            setBusy(true);
            answer(q, getContext()).then(function (res) {
                var body = (res && res.text) || "（無回覆）";
                appendMsg("bot", body);
                history.push({ role: "assistant", content: body });
                if (res && res.chips && res.chips.length && quickEl) {
                    res.chips.forEach(function (label) {
                        var b = document.createElement("button");
                        b.type = "button";
                        b.textContent = label;
                        b.onclick = function () { ask(label); };
                        quickEl.appendChild(b);
                    });
                }
            }).finally(function () {
                setBusy(false);
                if (inputEl) inputEl.focus();
            });
        }

        if (sendBtn) sendBtn.onclick = function () { ask(); };
        if (inputEl) {
            inputEl.addEventListener("keydown", function (e) {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ask();
                }
            });
        }

        renderQuick();
        if (options.welcome !== false) {
            appendMsg("bot", "我是 **Python 問答助教**。問我語法、除錯方向或本關目標——我會引導你，不直接給答案。");
        }

        return {
            refresh: renderQuick,
            ask: ask,
            clear: function () {
                history = [];
                if (messagesEl) {
                    messagesEl.innerHTML = "<div class=\"tutor-empty\">尚無對話，選快捷問題或輸入問題。</div>";
                }
            }
        };
    }

    global.PythonTutorQA = {
        answer: answer,
        answerLocal: answerLocal,
        mount: mount,
        setRemoteHandler: function (fn) {
            remoteHandler = typeof fn === "function" ? fn : null;
        },
        clearHistory: function () { history = []; }
    };
})(typeof window !== "undefined" ? window : globalThis);

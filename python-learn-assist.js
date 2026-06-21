/**
 * Doratch Python 學習 — 學習輔助系統（通關條件檢查、骨架、Bot 關卡提示）
 */
(function (global) {
    "use strict";

    function countEffectiveLines(code) {
        return String(code || "")
            .split("\n")
            .map(function (s) { return s.trim(); })
            .filter(function (s) { return s && !s.startsWith("#"); }).length;
    }

    function lessonTrack(lesson) {
        return (lesson && lesson.track) || "base";
    }

    function isDiscordPyLesson(lesson) {
        var id = String(lesson && lesson.id || "");
        return id.indexOf("discord-py") === 0;
    }

    function getLessonScaffold(lesson) {
        if (!lesson) return "# TODO\n";
        var id = lesson.id || "";

        if (isDiscordPyLesson(lesson)) {
            if (id === "discord-py-slash") {
                return [
                    "import discord",
                    "from discord.ext import commands",
                    "",
                    "TOKEN = 'doratch-demo-learn-2026'",
                    "intents = discord.Intents.default()",
                    "intents.message_content = True",
                    "bot = commands.Bot(command_prefix='!', intents=intents)",
                    "",
                    "@bot.tree.command(name='ping', description='測試')",
                    "async def slash_ping(interaction):",
                    "    # TODO: await interaction.response.send_message('Pong!')",
                    "    pass",
                    "",
                    "bot.run(TOKEN)"
                ].join("\n");
            }
            if (id === "discord-py-ui") {
                return [
                    "import discord",
                    "from discord.ext import commands",
                    "from discord import ui",
                    "",
                    "TOKEN = 'doratch-demo-learn-2026'",
                    "intents = discord.Intents.default()",
                    "intents.message_content = True",
                    "bot = commands.Bot(command_prefix='!', intents=intents)",
                    "",
                    "class MyView(ui.View):",
                    "    # TODO: @ui.button 與 @ui.select",
                    "    pass",
                    "",
                    "@bot.command(name='menu')",
                    "async def menu_cmd(ctx):",
                    "    # TODO: await ctx.send('選單', view=MyView())",
                    "    pass",
                    "",
                    "bot.run(TOKEN)"
                ].join("\n");
            }
            return [
                "import discord",
                "from discord.ext import commands",
                "",
                "TOKEN = 'doratch-demo-learn-2026'",
                "intents = discord.Intents.default()",
                "intents.message_content = True",
                "bot = commands.Bot(command_prefix='!', intents=intents)",
                "",
                "@bot.event",
                "async def on_ready():",
                "    print(f'Bot 上線：{bot.user}')",
                "",
                "@bot.command()",
                "async def hello(ctx):",
                "    # TODO: await ctx.send('你好！')",
                "    pass",
                "",
                "bot.run(TOKEN)"
            ].join("\n");
        }

        if (lessonTrack(lesson) === "discord") {
            if (id === "discord-func") {
                return [
                    "def handle(msg):",
                    "    # TODO: 依 msg 回傳 Bot 字串",
                    "    return ''",
                    "",
                    "msg = input()",
                    "print(handle(msg))"
                ].join("\n");
            }
            if (id === "discord-echo") {
                return [
                    "msg = input()",
                    "if msg.startswith('!echo '):",
                    "    # TODO: 印出 Bot: + 後面的文字",
                    "    pass"
                ].join("\n");
            }
            if (id === "discord-multi") {
                return [
                    "msg = input()",
                    "if msg == '!hello':",
                    "    print('Bot: 你好！')",
                    "elif msg == '!ping':",
                    "    print('Bot: pong')",
                    "elif msg == '!help':",
                    "    print('Bot: 指令：hello ping help')",
                    "else:",
                    "    print('Bot: 未知指令')"
                ].join("\n");
            }
            return [
                "msg = input()",
                "if msg == '!hello':",
                "    print('Bot: 你好！')"
            ].join("\n");
        }

        var rules = lesson.rules || {};
        var mustUse = rules.mustUse || [];
        var lines = [];

        if (mustUse.indexOf("def") >= 0) {
            lines.push("def solve():");
            lines.push("    # TODO: 先完成邏輯");
            lines.push("    pass");
            lines.push("");
            lines.push("# TODO: 讀取輸入並呼叫 solve()");
            return lines.join("\n");
        }
        if (rules.requireLoop && mustUse.indexOf("while") >= 0) {
            return [
                "total = 0",
                "while True:",
                "    x = int(input())",
                "    if x == 0:",
                "        break",
                "    # TODO: 更新 total",
                "print(total)"
            ].join("\n");
        }
        if (rules.requireLoop) {
            return [
                "n = int(input())",
                "for i in range(n):",
                "    # TODO: 補上邏輯",
                "    pass",
                "print()"
            ].join("\n");
        }
        if (rules.requireBranch) {
            return [
                "x = input()",
                "if ...:",
                "    print(...)",
                "elif ...:",
                "    print(...)",
                "else:",
                "    print(...)"
            ].join("\n");
        }
        lines.push("# TODO: 依題目補上程式");
        if (mustUse.indexOf("input") >= 0) lines.push("x = input()");
        if (mustUse.indexOf("print") >= 0) lines.push("print(x)");
        return lines.join("\n");
    }

    function addCheck(checks, pass, text) {
        checks.push({ pass: !!pass, text: text });
    }

    function addNext(next, seen, text) {
        if (!text || seen[text]) return;
        seen[text] = 1;
        next.push(text);
    }

    function analyzeDiscordLogic(lesson, src, lower, checks, next, seen) {
        var id = lesson.id || "";

        if (id === "discord-intro" || id === "discord-ping") {
            addCheck(checks, /\bif\b/.test(lower), "需要 if 判斷指令");
            addCheck(checks, /!hello|!ping/.test(src), "需比對本關指令字串（!hello 或 !ping）");
            if (!/bot:/i.test(src)) addNext(next, seen, "回覆格式建議以 Bot: 開頭（與測試一致）");
        }
        if (id === "discord-multi") {
            addCheck(checks, /\belif\b/.test(lower), "多指令需使用 elif");
            addCheck(checks, /!help/.test(src), "需處理 !help 指令");
            addCheck(checks, /未知/.test(src), "未知指令需印出提示（含「未知」）");
        }
        if (id === "discord-func") {
            addCheck(checks, /\bdef\s+handle\s*\(/.test(src), "需定義 handle(msg) 函式");
            addCheck(checks, /\breturn\b/.test(lower), "handle 需用 return 回傳字串");
        }
        if (id === "discord-echo") {
            addCheck(checks, /startswith\s*\(\s*['"]!echo /i.test(src), "需用 startswith 判斷 !echo 前綴");
            addCheck(checks, /!echo /.test(src), "需處理 !echo 後面的文字");
        }
    }

    function analyzeDiscordPy(lesson, src, lower, checks, next, seen) {
        var id = lesson.id || "";

        addCheck(checks, /import\s+discord/.test(lower), "需 import discord");
        addCheck(checks, /commands\.bot|commands\.Bot/.test(src), "需建立 commands.Bot");
        addCheck(checks, /bot\.run\s*\(/.test(lower), "需 bot.run(TOKEN) 啟動 Bot");
        addCheck(checks, /\basync\s+def\b/.test(lower), "discord.py 指令需 async def");
        addCheck(checks, /\bawait\b/.test(lower), "需使用 await 呼叫 send / send_message");

        if (id === "discord-py-cmd") {
            addCheck(checks, /@bot\.command/.test(src), "需 @bot.command() 註冊前綴指令");
            addCheck(checks, /ctx\.send|await\s+ctx\.send/.test(src), "指令內需 await ctx.send(...)");
            if (!/hello|ping/i.test(src)) addNext(next, seen, "建議至少完成 hello 或 ping 其中一個 ! 指令");
        }
        if (id === "discord-py-slash") {
            addCheck(checks, /@bot\.tree\.command|tree\.command/.test(src), "需 @bot.tree.command 註冊斜線指令");
            addCheck(checks, /interaction\.response\.send_message|interaction\.response\.send/.test(src),
                "斜線指令需 interaction.response.send_message");
            addNext(next, seen, "右側模擬器：連線 → 按 / → 選指令測試");
        }
        if (id === "discord-py-ui") {
            addCheck(checks, /ui\.view|discord\.ui\.View|class\s+\w+\s*\(\s*ui\.View/i.test(src), "需 ui.View 類別");
            addCheck(checks, /ui\.button|@discord\.ui\.button/.test(src), "需 @ui.button 按鈕");
            addCheck(checks, /ui\.select|@discord\.ui\.select/.test(src), "需 @ui.select 下拉選單");
            addCheck(checks, /@bot\.command/.test(src) && /menu/i.test(src), "需 !menu 指令顯示 View");
            addNext(next, seen, "模擬器輸入 !menu，確認按鈕與選單有反應");
        }
    }

    function analyzeCodeForLesson(code, lesson) {
        lesson = lesson || {};
        var rules = lesson.rules || {};
        var mustUse = rules.mustUse || [];
        var checks = [];
        var next = [];
        var seen = {};
        var src = String(code || "");
        var effectiveLines = countEffectiveLines(src);
        var lower = src.toLowerCase();

        if (!effectiveLines) {
            checks.push({ pass: false, text: "尚未撰寫可執行程式碼（目前只有空白或註解）" });
            next.push("先完成最小可執行版本：至少讀 input / print 一次");
            if (isDiscordPyLesson(lesson)) {
                next.push("或從「載入本關骨架」開始，補上 @bot.command 與 await ctx.send");
            }
            return { checks: checks, next: next, ok: false };
        }

        if (rules.minLines) {
            var linePass = effectiveLines >= rules.minLines;
            addCheck(checks, linePass, "有效程式碼行數 " + effectiveLines + "/" + rules.minLines);
            if (!linePass) addNext(next, seen, "至少補到 " + rules.minLines + " 行可執行程式碼");
        }

        mustUse.forEach(function (kw) {
            var kwStr = String(kw);
            var pass = lower.indexOf(kwStr.toLowerCase()) >= 0;
            addCheck(checks, pass, "需使用 `" + kwStr + "`");
            if (!pass) addNext(next, seen, "加入 `" + kwStr + "`（本關必要語法）");
        });

        if (rules.requireLoop) {
            var loopPass = /\bfor\b|\bwhile\b/.test(lower);
            addCheck(checks, loopPass, "需要迴圈邏輯（for 或 while）");
            if (!loopPass) addNext(next, seen, "先用 for/while 建立可重複處理輸入的骨架");
        }
        if (rules.requireBranch) {
            var branchPass = /\bif\b/.test(lower);
            addCheck(checks, branchPass, "需要條件分支（if / elif / else）");
            if (!branchPass) addNext(next, seen, "加入 if / elif / else 處理不同情況");
        }
        if (rules.requireDef) {
            var defPass = /\bdef\s+[a-zA-Z_]\w*\s*\(/.test(src);
            addCheck(checks, defPass, "需要函式定義（def）");
            if (!defPass) addNext(next, seen, "先定義函式，再由主程式呼叫");
        }

        if (lessonTrack(lesson) === "discord" && !isDiscordPyLesson(lesson)) {
            analyzeDiscordLogic(lesson, src, lower, checks, next, seen);
        }
        if (isDiscordPyLesson(lesson)) {
            analyzeDiscordPy(lesson, src, lower, checks, next, seen);
        }

        var hasInput = /\binput\s*\(/.test(src);
        if ((mustUse.indexOf("input") >= 0 || lesson.id === "io") && !hasInput && !isDiscordPyLesson(lesson)) {
            addNext(next, seen, "本關是動態輸入題，請勿把答案寫死在 print 裡");
        }
        if (/print\(\s*["'][^"']*alice|bob|hello doratch/i.test(src) && hasInput) {
            addNext(next, seen, "偵測到可能寫死測資，請改為使用 input 讀入值");
        }

        if (!next.length) {
            if (isDiscordPyLesson(lesson)) {
                next.push("核心結構完整：右側模擬器連線 → 測 ! 或 / 指令 → 改程式後重新連線");
            } else if (!lesson.tests || !lesson.tests.length) {
                next.push("依教學完成後，用執行視窗或模擬器手動驗證");
            } else {
                next.push("很接近完成：先按「▶ 執行」手測，再按「✅ 跑測試」");
            }
        }

        return {
            checks: checks,
            next: next,
            ok: checks.every(function (c) { return c.pass; })
        };
    }

    function renderAssistResult(analysis, ids) {
        ids = ids || {};
        var goalEl = document.getElementById(ids.goals || "assist-goals");
        var nextEl = document.getElementById(ids.next || "assist-next");
        var statusEl = document.getElementById(ids.status || "assist-status");
        if (!goalEl || !nextEl || !statusEl) return;

        goalEl.innerHTML = analysis.checks.map(function (c) {
            return "<li class=\"" + (c.pass ? "pass" : "warn") + "\">" +
                (c.pass ? "✓" : "•") + " " + c.text + "</li>";
        }).join("");
        nextEl.innerHTML = analysis.next.map(function (s) {
            return "<li>" + s + "</li>";
        }).join("");

        if (analysis.ok) {
            statusEl.classList.add("ok");
            statusEl.textContent = "助教判定：核心條件大致完整，可以進入測試驗證。";
        } else {
            statusEl.classList.remove("ok");
            statusEl.textContent = "助教判定：還有條件未滿足，先補上「下一步建議」再測試。";
        }
    }

    var debounceTimer = null;

    function bindAutoAnalysis(getCodeFn, getLessonFn, onAnalyze) {
        function schedule() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                if (typeof onAnalyze === "function") onAnalyze();
            }, 220);
        }

        document.addEventListener("doratch-editor-change", schedule);

        var fb = document.getElementById("editor-fallback");
        if (fb && fb.dataset.learnAssistBound !== "1") {
            fb.dataset.learnAssistBound = "1";
            fb.addEventListener("input", schedule);
        }

        if (global.PythonMonaco && global.PythonMonaco.onDidChange) {
            global.PythonMonaco.onDidChange(schedule);
        } else {
            var tries = 0;
            var waitMonaco = setInterval(function () {
                tries += 1;
                if (global.PythonMonaco && global.PythonMonaco.onDidChange) {
                    global.PythonMonaco.onDidChange(schedule);
                    clearInterval(waitMonaco);
                } else if (tries > 40) {
                    clearInterval(waitMonaco);
                }
            }, 250);
        }
    }

    global.PythonLearnAssist = {
        countEffectiveLines: countEffectiveLines,
        getLessonScaffold: getLessonScaffold,
        analyzeCodeForLesson: analyzeCodeForLesson,
        renderAssistResult: renderAssistResult,
        bindAutoAnalysis: bindAutoAnalysis
    };
})(typeof window !== "undefined" ? window : globalThis);

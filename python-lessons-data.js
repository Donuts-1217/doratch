/** Doratch Python 課程 — 起始碼僅題目說明，不含解答 */
window.PYTHON_LESSONS = [
    {
        id: "hello",
        track: "base",
        title: "1. 第一個程式 print",
        lv: "入門",
        summary: "用 print() 在螢幕上顯示指定文字。",
        goals: ["使用 print()", "輸出內容需完全符合題目"],
        starter: `# 任務：印出 Hello Doratch
# 請自己寫程式，不可留空或只寫註解

`,
        rules: { minLines: 1, mustUse: ["print"] },
        tests: [
            { stdin: [], expected: "Hello Doratch", label: "基本輸出" }
        ]
    },
    {
        id: "io",
        title: "2. 變數與 input",
        lv: "入門",
        summary: "讀取一行名字，印出問候語。",
        goals: ["使用 input() 讀資料", "輸出格式：Hello, 名字!"],
        starter: `# 任務：讀取名字，印出 Hello, 名字!
# 例：輸入 Alice → Hello, Alice!
# 必須用 input，不可把名字寫死在程式裡

`,
        rules: { minLines: 2, mustUse: ["input", "print"] },
        tests: [
            { stdin: ["Alice"], expected: "Hello, Alice!", label: "Alice" },
            { stdin: ["Bob"], expected: "Hello, Bob!", label: "Bob" },
            { stdin: ["小華"], expected: "Hello, 小華!", label: "中文名字" }
        ]
    },
    {
        id: "if-grade",
        title: "3. if / elif / else 成績",
        lv: "LV1",
        summary: "依分數輸出等第（APCS 經典題）。",
        goals: ["90↑ A", "80–89 B", "60–79 C", "59↓ F", "必須用 if / elif / else"],
        starter: `# 任務：讀取分數(整數)，印出等第 A/B/C/F
# 90 以上 A · 80–89 B · 60–79 C · 59 以下 F
# 不可寫死分數或只 print 某一個等第

`,
        rules: { minLines: 4, mustUse: ["input", "if", "elif", "print"], requireBranch: true },
        tests: [
            { stdin: ["95"], expected: "A", label: "95 分" },
            { stdin: ["90"], expected: "A", label: "邊界 90" },
            { stdin: ["85"], expected: "B", label: "85 分" },
            { stdin: ["80"], expected: "B", label: "邊界 80" },
            { stdin: ["70"], expected: "C", label: "70 分" },
            { stdin: ["60"], expected: "C", label: "邊界 60" },
            { stdin: ["50"], expected: "F", label: "50 分" },
            { stdin: ["59"], expected: "F", label: "邊界 59" }
        ]
    },
    {
        id: "for-sum",
        title: "4. for 迴圈加總",
        lv: "LV1",
        summary: "讀取 n，計算 1+2+…+n。",
        goals: ["使用 for 與 range", "不可直接寫死答案"],
        starter: `# 任務：讀取 n，印出 1+2+...+n 的結果
# 例：n=5 → 15
# 必須用 for 迴圈

`,
        rules: { minLines: 3, mustUse: ["input", "for", "print"], requireLoop: true },
        tests: [
            { stdin: ["1"], expected: "1", label: "n=1" },
            { stdin: ["5"], expected: "15", label: "n=5" },
            { stdin: ["10"], expected: "55", label: "n=10" },
            { stdin: ["100"], expected: "5050", label: "n=100" }
        ]
    },
    {
        id: "while-guess",
        title: "5. while 迴圈",
        lv: "LV2",
        summary: "重複讀取數字加總，直到讀到 0。",
        goals: ["使用 while", "遇到 0 停止並印總和"],
        starter: `# 任務：一直讀整數並加總，讀到 0 時印出總和（0 不算在總和內）
# 例：3, 5, 0 → 8
# 必須用 while

`,
        rules: { minLines: 4, mustUse: ["input", "while", "print"], requireLoop: true },
        tests: [
            { stdin: ["3", "5", "0"], expected: "8", label: "3+5" },
            { stdin: ["10", "0"], expected: "10", label: "單筆" },
            { stdin: ["0"], expected: "0", label: "直接 0" },
            { stdin: ["1", "2", "3", "4", "0"], expected: "10", label: "四筆" }
        ]
    },
    {
        id: "list-avg",
        title: "6. 串列 list",
        lv: "LV2",
        summary: "讀取 n 個成績，印出平均（整數除法）。",
        goals: ["用 list 或迴圈讀多筆", "輸出平均"],
        starter: `# 任務：第一行讀 n，接著讀 n 個分數，印出平均（整數）
# 例：3 / 80 90 70 → 80
# 不可寫死分數

`,
        rules: { minLines: 4, mustUse: ["input", "for", "print"], requireLoop: true },
        tests: [
            { stdin: ["3", "80", "90", "70"], expected: "80", label: "80,90,70" },
            { stdin: ["1", "100"], expected: "100", label: "一筆" },
            { stdin: ["4", "10", "20", "30", "40"], expected: "25", label: "四筆" }
        ]
    },
    {
        id: "func",
        title: "7. 函式 def",
        lv: "LV2",
        summary: "定義 square(x) 回傳平方，讀 n 印出 square(n)。",
        goals: ["def 函式", "return 回傳值"],
        starter: `# 任務：定義 square(x) 回傳 x 的平方
# 讀取 n，印出 square(n) 的結果
# 不可直接 print n*n 而沒有函式

`,
        rules: { minLines: 4, mustUse: ["def", "return", "input", "print"], requireDef: true },
        tests: [
            { stdin: ["7"], expected: "49", label: "7²" },
            { stdin: ["0"], expected: "0", label: "0²" },
            { stdin: ["12"], expected: "144", label: "12²" }
        ]
    },
    {
        id: "triangle",
        title: "8. 三角形判定",
        lv: "LV2",
        summary: "APCS：三邊長能否構成三角形。",
        goals: ["任意兩邊和大於第三邊", "輸出「合法三角形」或「不合法」"],
        starter: `# 任務：讀取三邊 a b c，判斷能否構成三角形
# 可以 → 印「合法三角形」  不行 → 印「不合法」
# 必須用 if 判斷，不可寫死答案

`,
        rules: { minLines: 4, mustUse: ["input", "if", "print"], requireBranch: true },
        tests: [
            { stdin: ["3", "4", "5"], expected: "合法三角形", label: "3-4-5" },
            { stdin: ["1", "2", "5"], expected: "不合法", label: "1-2-5" },
            { stdin: ["5", "5", "5"], expected: "合法三角形", label: "等邊" },
            { stdin: ["1", "1", "3"], expected: "不合法", label: "1-1-3" }
        ]
    },
    {
        id: "prime",
        title: "9. 質數判斷",
        lv: "LV3",
        summary: "APCS：判斷是否為質數。",
        goals: ["n<=1 不是質數", "用迴圈檢查因數", "印「是質數」或「不是質數」"],
        starter: `# 任務：讀取 n，判斷是否為質數
# 印「是質數」或「不是質數」
# 必須用迴圈檢查，不可寫死幾個數字

`,
        rules: { minLines: 5, mustUse: ["input", "for", "print"], requireLoop: true },
        tests: [
            { stdin: ["2"], expected: "是質數", label: "2" },
            { stdin: ["7"], expected: "是質數", label: "7" },
            { stdin: ["9"], expected: "不是質數", label: "9" },
            { stdin: ["1"], expected: "不是質數", label: "1" },
            { stdin: ["97"], expected: "是質數", label: "97" }
        ]
    },
    {
        id: "fib",
        title: "10. 費氏數列",
        lv: "LV3",
        summary: "APCS：印出前 k 項費氏數列（空白分隔）。",
        goals: ["前兩項為 1", "k=1 只印 1", "k=0 印空行"],
        starter: `# 任務：讀取 k，印出前 k 項費氏：1 1 2 3 5 ...
# k=0 → 空行  k=1 → 1  k=5 → 1 1 2 3 5
# 不可寫死特定 k 的答案

`,
        rules: { minLines: 5, mustUse: ["input", "for", "print"], requireLoop: true },
        tests: [
            { stdin: ["0"], expected: "", label: "k=0" },
            { stdin: ["1"], expected: "1", label: "k=1" },
            { stdin: ["2"], expected: "1 1", label: "k=2" },
            { stdin: ["5"], expected: "1 1 2 3 5", label: "k=5" },
            { stdin: ["8"], expected: "1 1 2 3 5 8 13 21", label: "k=8" }
        ]
    },
    {
        id: "discord-intro",
        track: "discord",
        title: "11. Bot 是什麼？",
        lv: "Bot",
        summary: "認識 Discord Bot：使用者傳訊息，Bot 依規則回覆（此關用 print 模擬）。",
        goals: ["訊息以 ! 開頭代表指令", "讀取一行訊息", "符合 !hello 就回覆"],
        starter: `# 任務：模擬 Discord 頻道訊息
# 讀取一行文字 msg，若 msg 是 "!hello" 就印 "Bot: 你好！"
# 其他訊息不要印任何東西
# （之後會用 discord.py 寫真 Bot，現在先練邏輯）

`,
        rules: { minLines: 3, mustUse: ["input", "if", "print"], requireBranch: true },
        tests: [
            { stdin: ["!hello"], expected: "Bot: 你好！", label: "!hello" },
            { stdin: ["hello"], expected: "", label: "非指令" },
            { stdin: ["!help"], expected: "", label: "其他指令" }
        ]
    },
    {
        id: "discord-ping",
        track: "discord",
        title: "12. !ping 指令",
        lv: "Bot",
        summary: "經典 !ping → pong，Bot 確認在線。",
        goals: ["判斷指令字串", "只回應 !ping"],
        starter: `# 任務：讀取訊息，若是 "!ping" 印 "Bot: pong"
# 其他訊息不印

`,
        rules: { minLines: 3, mustUse: ["input", "if", "print"], requireBranch: true },
        tests: [
            { stdin: ["!ping"], expected: "Bot: pong", label: "!ping" },
            { stdin: ["!hello"], expected: "", label: "非 ping" }
        ]
    },
    {
        id: "discord-multi",
        track: "discord",
        title: "13. 多指令 if / elif",
        lv: "Bot",
        summary: "一個 Bot 要處理多種 ! 指令。",
        goals: ["!hello / !ping / !help", "未知指令印提示", "用 elif"],
        starter: `# 任務：讀取 msg，依指令印出對應 Bot 回覆
# 需處理 !hello、!ping、!help 與未知指令
# 詳細對照見上方教學 · 必須用 if / elif / else

`,
        rules: { minLines: 6, mustUse: ["input", "if", "elif", "print"], requireBranch: true },
        tests: [
            { stdin: ["!hello"], expected: "Bot: 你好！", label: "!hello" },
            { stdin: ["!ping"], expected: "Bot: pong", label: "!ping" },
            { stdin: ["!help"], expected: "Bot: 指令：hello ping help", label: "!help" },
            { stdin: ["!xyz"], expected: "Bot: 未知指令", label: "未知" }
        ]
    },
    {
        id: "discord-func",
        track: "discord",
        title: "14. 指令寫成函式",
        lv: "Bot",
        summary: "把回覆邏輯包成 handle(msg)，像 discord.py 的事件函式。",
        goals: ["def handle(msg)", "return 回覆字串", "主程式 print(handle(msg))"],
        starter: `# 任務：定義 handle(msg) 回傳 Bot 回覆字串
# 讀 msg，印出 handle(msg) 的結果
# 需處理 !hello、!ping 與未知指令 · 詳見教學
# 必須用 def 與 return

`,
        rules: { minLines: 6, mustUse: ["def", "return", "input", "print"], requireDef: true },
        tests: [
            { stdin: ["!hello"], expected: "Bot: 你好！", label: "!hello" },
            { stdin: ["!ping"], expected: "Bot: pong", label: "!ping" },
            { stdin: ["!abc"], expected: "Bot: 未知指令", label: "未知" }
        ]
    },
    {
        id: "discord-echo",
        track: "discord",
        title: "15. !echo 帶參數",
        lv: "Bot",
        summary: "指令後面可帶文字，例如 !echo 你好 → Bot: 你好",
        goals: ["startswith 判斷前綴", "取出 !echo 後面的文字", "用 if 分支"],
        starter: `# 任務：讀取 msg
# 若 msg 以 "!echo " 開頭，印 "Bot: " + 後面的文字
# 例：!echo 大家好 → Bot: 大家好
# 其他訊息不印
# 教學區有 startswith / 切片 說明

`,
        rules: { minLines: 4, mustUse: ["input", "if", "print"], requireBranch: true },
        tests: [
            { stdin: ["!echo hi"], expected: "Bot: hi", label: "echo hi" },
            { stdin: ["!echo 大家好"], expected: "Bot: 大家好", label: "echo 中文" },
            { stdin: ["!ping"], expected: "", label: "非 echo" }
        ]
    },
    {
        id: "discord-py-cmd",
        track: "discord",
        title: "16. discord.py 前綴指令",
        lv: "Bot",
        summary: "使用與 VS Code 相同的 discord.py 語法：@bot.command() 前綴指令。",
        goals: ["import discord", "async def", "await ctx.send", "@bot.command", "bot.run(TOKEN)"],
        starter: `# 任務：discord.py 標準 Bot（必須 async/await，與 VS Code 相同）
# @bot.event async def on_ready(): ...
# @bot.command() async def hello(ctx): await ctx.send('...')
# TOKEN = '...'  ·  bot.run(TOKEN)

import discord
from discord.ext import commands

TOKEN = 'doratch-demo-learn-2026'  # 示範 Token（學習關卡固定）

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

# 在此撰寫 async 指令 ...

bot.run(TOKEN)
`,
        rules: { minLines: 10, mustUse: ["async def", "await", "commands.Bot", "bot.run"], requireDef: true },
        tests: []
    },
    {
        id: "discord-py-slash",
        track: "discord",
        title: "17. 斜線指令 /command",
        lv: "Bot",
        summary: "註冊 Discord 斜線指令 @bot.tree.command，模擬器按 / 選擇。",
        goals: ["@bot.tree.command", "interaction.response.send_message", "/ping", "/hello"],
        starter: `# 任務：在前綴指令之外，新增斜線指令
# @bot.tree.command(name='ping', description='測試')
# def slash_ping(interaction):
#     interaction.response.send_message('Pong!')
# 模擬器：連線 → 按 / → 選指令

import discord
from discord.ext import commands

TOKEN = 'doratch-demo-learn-2026'

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

# @bot.command 與 @bot.tree.command 請自行完成

bot.run(TOKEN)
`,
        rules: { minLines: 12, mustUse: ["async def", "await", "tree.command"], requireDef: true },
        tests: []
    },
    {
        id: "discord-py-ui",
        track: "discord",
        title: "18. 按鈕與下拉選單",
        lv: "Bot",
        summary: "discord.ui.View、@ui.button、@ui.select，像真 Discord 互動元件。",
        goals: ["ui.View", "ui.button", "ui.select", "!menu 顯示元件"],
        starter: `# 任務：!menu 指令回覆附帶按鈕與下拉選單
# class MyView(discord.ui.View):
#     @discord.ui.button(label='確認', style=discord.ButtonStyle.success)
#     def confirm(self, interaction, button): ...
#     @discord.ui.select(placeholder='選水果', options=[...])
#     def select_fruit(self, interaction, select): ...

import discord
from discord.ext import commands
from discord import ui

TOKEN = 'doratch-demo-learn-2026'

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

# 在此撰寫 View 與 @bot.command(name='menu')

bot.run(TOKEN)
`,
        rules: { minLines: 14, mustUse: ["async def", "await", "ui.View", "ui.button"], requireDef: true },
        tests: []
    }
];

window.getPythonLesson = function (id) {
    return window.PYTHON_LESSONS.find(function (l) { return l.id === id; }) || window.PYTHON_LESSONS[0];
};

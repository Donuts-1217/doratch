/** Python + Discord Bot 語法輔助資料（Monaco 與純文字編輯器共用） */
(function (global) {
    "use strict";

    var BASE_BUILTINS = [
        { label: "print", detail: "輸出到螢幕", insert: "print(${1})" },
        { label: "input", detail: "讀取使用者輸入（Bot 模擬訊息）", insert: "input(${1:})" },
        { label: "int", detail: "轉整數", insert: "int(${1})" },
        { label: "str", detail: "轉字串", insert: "str(${1})" },
        { label: "float", detail: "轉浮點數", insert: "float(${1})" },
        { label: "bool", detail: "轉布林", insert: "bool(${1})" },
        { label: "len", detail: "長度", insert: "len(${1})" },
        { label: "range", detail: "產生數列", insert: "range(${1:start}, ${2:stop})" },
        { label: "sum", detail: "加總", insert: "sum(${1})" },
        { label: "min", detail: "最小值", insert: "min(${1})" },
        { label: "max", detail: "最大值", insert: "max(${1})" },
        { label: "abs", detail: "絕對值", insert: "abs(${1})" },
        { label: "round", detail: "四捨五入", insert: "round(${1})" },
        { label: "list", detail: "建立串列", insert: "list(${1})" },
        { label: "dict", detail: "建立字典", insert: "dict(${1})" },
        { label: "set", detail: "建立集合", insert: "set(${1})" },
        { label: "tuple", detail: "建立元組", insert: "tuple(${1})" },
        { label: "sorted", detail: "排序", insert: "sorted(${1})" },
        { label: "enumerate", detail: "索引迭代", insert: "enumerate(${1})" },
        { label: "zip", detail: "合併迭代", insert: "zip(${1}, ${2})" },
        { label: "map", detail: "映射", insert: "map(${1:func}, ${2:iterable})" },
        { label: "filter", detail: "篩選", insert: "filter(${1:func}, ${2:iterable})" },
        { label: "any", detail: "任一為真", insert: "any(${1})" },
        { label: "all", detail: "全部為真", insert: "all(${1})" },
        { label: "type", detail: "型別", insert: "type(${1})" },
        { label: "isinstance", detail: "型別檢查", insert: "isinstance(${1}, ${2:type})" },
        { label: "open", detail: "開啟檔案", insert: "open(${1:path}, ${2:'r'})" },
        { label: "pow", detail: "次方", insert: "pow(${1}, ${2})" },
        { label: "divmod", detail: "商與餘數", insert: "divmod(${1}, ${2})" },
        { label: "chr", detail: "ASCII 轉字元", insert: "chr(${1})" },
        { label: "ord", detail: "字元轉 ASCII", insert: "ord(${1})" },
        { label: "hex", detail: "轉十六進位字串", insert: "hex(${1})" },
        { label: "bin", detail: "轉二進位字串", insert: "bin(${1})" },
        { label: "reversed", detail: "反轉迭代", insert: "reversed(${1})" },
        { label: "format", detail: "格式化", insert: "\"{}\".format(${1})" }
    ];

    var BASE_SNIPPETS = [
        { label: "if", detail: "條件", insert: "if ${1:條件}:\n    ${2:pass}" },
        { label: "elif", detail: "否則若", insert: "elif ${1:條件}:\n    ${2:pass}" },
        { label: "else", detail: "否則", insert: "else:\n    ${1:pass}" },
        { label: "for", detail: "for 迴圈", insert: "for ${1:i} in range(${2:n}):\n    ${3:pass}" },
        { label: "forin", detail: "for 迭代", insert: "for ${1:item} in ${2:items}:\n    ${3:pass}" },
        { label: "while", detail: "while 迴圈", insert: "while ${1:條件}:\n    ${2:pass}" },
        { label: "def", detail: "函式", insert: "def ${1:函式名稱}(${2:參數}):\n    ${3:pass}" },
        { label: "async def", detail: "非同步函式（discord.py 必用）", insert: "async def ${1:函式名稱}(${2:參數}):\n    ${3:pass}" },
        { label: "class", detail: "類別", insert: "class ${1:ClassName}:\n    def __init__(self, ${2:args}):\n        ${3:pass}" },
        { label: "try", detail: "例外處理", insert: "try:\n    ${1:pass}\nexcept ${2:Exception} as e:\n    ${3:print(e)}" },
        { label: "with", detail: "with 語句", insert: "with ${1:open('file.txt')} as f:\n    ${2:pass}" },
        { label: "import", detail: "import 模組", insert: "import ${1:模組}" },
        { label: "from", detail: "from import", insert: "from ${1:模組} import ${2:名稱}" },
        { label: "fstring", detail: "f 字串", insert: "f\"${1:文字}{${2:變數}}\"" },
        { label: "main", detail: "主程式區塊", insert: "if __name__ == '__main__':\n    ${1:pass}" },
        { label: "print", detail: "print 多參數", insert: "print(${1}, sep=' ', end='\\n')" },
        { label: "input-int", detail: "讀整數", insert: "int(input(${1:提示}))" },
        { label: "input-str", detail: "讀字串", insert: "input(${1:提示})" },
        { label: "listcomp", detail: "串列推導", insert: "[${1:x} for ${2:x} in ${3:items}]" },
        { label: "dictcomp", detail: "字典推導", insert: "{${1:k}: ${2:v} for ${3:k}, ${4:v} in ${5:items}}" },
        { label: "assert", detail: "斷言", insert: "assert ${1:條件}, ${2:訊息}" },
        { label: "raise", detail: "拋出例外", insert: "raise ${1:ValueError}(${2:訊息})" },
        { label: "import-json", detail: "import json", insert: "import json\n" },
        { label: "import-random", detail: "import random", insert: "import random\n" },
        { label: "import-math", detail: "import math", insert: "import math\n" },
        { label: "randint", detail: "random.randint", insert: "random.randint(${1:1}, ${2:10})" },
        { label: "len-range", detail: "range + len 迴圈", insert: "for ${1:i} in range(len(${2:items})):\n    ${3:pass}" }
    ];

    /** 早期 Bot 邏輯關（!hello / input 模擬） */
    var LEGACY_BOT_SNIPPETS = [
        { label: "bot-if-hello", detail: "if msg == '!hello'", insert: "msg = input()\nif msg == \"!hello\":\n    print(\"Bot: 你好！\")\n" },
        { label: "bot-if-ping", detail: "if msg == '!ping'", insert: "msg = input()\nif msg == \"!ping\":\n    print(\"Bot: pong\")\n" },
        { label: "bot-elif-chain", detail: "多指令 elif 鏈", insert: "msg = input()\nif msg == \"!hello\":\n    print(\"Bot: 你好！\")\nelif msg == \"!ping\":\n    print(\"Bot: pong\")\nelif msg == \"!help\":\n    print(\"Bot: 指令：hello ping help\")\nelse:\n    print(\"Bot: 未知指令\")\n" },
        { label: "bot-echo", detail: "!echo 後面文字", insert: "msg = input()\nif msg.startswith(\"!echo \"):\n    print(\"Bot: \" + msg[6:])\n" },
        { label: "handle-func", detail: "handle(msg) 函式", insert: "def handle(msg):\n    if msg == \"!hello\":\n        return \"Bot: 你好！\"\n    if msg == \"!ping\":\n        return \"Bot: pong\"\n    return \"Bot: 未知指令\"\n\nmsg = input()\nprint(handle(msg))\n" }
    ];

    /** discord.py 完整輔助 */
    var DISCORD_SNIPPETS = [
        {
            label: "discord-import",
            detail: "discord.py 標準 import",
            insert: "import discord\nfrom discord.ext import commands\nfrom discord import ui\n"
        },
        {
            label: "bot-skeleton",
            detail: "Bot 完整骨架（VS Code 相同）",
            insert: "import discord\nfrom discord.ext import commands\n\nTOKEN = \"YOUR_BOT_TOKEN\"\n\nintents = discord.Intents.default()\nintents.message_content = True\nbot = commands.Bot(command_prefix=\"!\", intents=intents)\n\n@bot.event\nasync def on_ready():\n    print(f\"Logged in as {bot.user}\")\n    await bot.tree.sync()\n\n# ↓ 在此加 @bot.command / @bot.tree.command\n\nbot.run(TOKEN)\n"
        },
        {
            label: "client-skeleton",
            detail: "discord.Client + 斜線指令（send_ 模式）",
            insert: "import discord\n\nTOKEN = \"YOUR_BOT_TOKEN\"\n\nintents = discord.Intents.default()\nintents.message_content = True\n\nclass MyBot(discord.Client):\n    def __init__(self):\n        super().__init__(intents=intents)\n        self.tree = discord.app_commands.CommandTree(self)\n\nclient = MyBot()\n\n@client.event\nasync def on_ready():\n    print(f\"Logged in as {client.user}\")\n    await client.tree.sync()\n\n# ↓ @client.tree.command(name=\"send_\", ...)\n\nclient.run(TOKEN)\n"
        },
        {
            label: "intents",
            detail: "Intents + message_content",
            insert: "intents = discord.Intents.default()\nintents.message_content = True\n"
        },
        {
            label: "commands.Bot",
            detail: "建立 Bot 物件",
            insert: "bot = commands.Bot(command_prefix=\"!\", intents=intents)\n"
        },
        {
            label: "TOKEN",
            detail: "Bot Token 常數",
            insert: "TOKEN = \"YOUR_BOT_TOKEN\"\n"
        },
        {
            label: "@bot.event on_ready",
            detail: "上線事件 + sync 斜線",
            insert: "@bot.event\nasync def on_ready():\n    print(f\"Logged in as {bot.user}\")\n    await bot.tree.sync()\n"
        },
        {
            label: "@bot.command",
            detail: "前綴指令 !hello",
            insert: "@bot.command(name=\"${1:hello}\")\nasync def ${1:hello}(ctx):\n    await ctx.send(\"${2:你好！}\")\n"
        },
        {
            label: "@bot.tree.command",
            detail: "斜線指令 /ping",
            insert: "@bot.tree.command(name=\"${1:ping}\", description=\"${2:說明}\")\nasync def slash_${1:ping}(interaction):\n    await interaction.response.send_message(\"${3:Pong!}\")\n"
        },
        {
            label: "send_",
            detail: "教學用斜線 send_（含參數）",
            insert: "@bot.tree.command(name=\"send_${1:cmd}\", description=\"${2:說明}\")\nasync def send_${1:cmd}(interaction, ${3:text}: str):\n    await interaction.response.send_message(f\"${4:回覆：}{${3:text}}\")\n"
        },
        {
            label: "@client.tree.command",
            detail: "Client 模式斜線指令",
            insert: "@client.tree.command(name=\"${1:cmd}\", description=\"${2:說明}\")\nasync def ${1:cmd}(interaction):\n    await interaction.response.send_message(\"${3:回覆}\")\n"
        },
        {
            label: "ctx.send",
            detail: "前綴指令回覆",
            insert: "await ctx.send(\"${1:回覆}\")\n"
        },
        {
            label: "interaction.response",
            detail: "斜線第一次回覆",
            insert: "await interaction.response.send_message(\"${1:回覆}\")\n"
        },
        {
            label: "interaction.followup",
            detail: "斜線後續回覆",
            insert: "await interaction.followup.send(\"${1:後續訊息}\", ephemeral=${2:False})\n"
        },
        {
            label: "embed",
            detail: "Embed 嵌入訊息",
            insert: "embed = discord.Embed(title=\"${1:標題}\", description=\"${2:說明}\", color=discord.Colour.blue())\nembed.add_field(name=\"${3:欄位}\", value=\"${4:內容}\", inline=False)\nawait ctx.send(embed=embed)\n"
        },
        {
            label: "ui.View",
            detail: "按鈕 + 選單 View",
            insert: "class MenuView(ui.View):\n    @ui.button(label=\"確認\", style=discord.ButtonStyle.success)\n    async def confirm(self, interaction, button):\n        await interaction.response.send_message(\"已確認 ✅\", ephemeral=True)\n\n    @ui.select(\n        placeholder=\"請選擇…\",\n        options=[discord.SelectOption(label=\"選項A\", value=\"a\")],\n    )\n    async def pick(self, interaction, select):\n        val = interaction.data[\"values\"][0]\n        await interaction.response.send_message(f\"你選了：{val}\")\n"
        },
        {
            label: "bot.run",
            detail: "啟動 Bot",
            insert: "bot.run(TOKEN)\n"
        },
        {
            label: "client.run",
            detail: "Client 啟動",
            insert: "client.run(TOKEN)\n"
        }
    ];

    var DISCORD_MEMBERS = {
        ctx: [
            { label: "send", detail: "回覆訊息", insert: "await send(${1})" },
            { label: "reply", detail: "回覆引用", insert: "await reply(${1})" },
            { label: "author", detail: "使用者", insert: "author" },
            { label: "channel", detail: "頻道", insert: "channel" },
            { label: "guild", detail: "伺服器", insert: "guild" },
            { label: "message", detail: "訊息物件", insert: "message" }
        ],
        interaction: [
            { label: "response.send_message", detail: "斜線第一次回覆", insert: "await response.send_message(${1})" },
            { label: "response.defer", detail: "延後回覆", insert: "await response.defer(ephemeral=${1:False})" },
            { label: "followup.send", detail: "斜線後續訊息", insert: "await followup.send(${1})" },
            { label: "user", detail: "使用者", insert: "user" },
            { label: "channel", detail: "頻道", insert: "channel" },
            { label: "guild", detail: "伺服器", insert: "guild" },
            { label: "data", detail: "互動資料", insert: "data" }
        ],
        bot: [
            { label: "command", detail: "裝飾器 @bot.command", insert: "command(name=\"${1:cmd}\")" },
            { label: "event", detail: "裝飾器 @bot.event", insert: "event" },
            { label: "tree.command", detail: "裝飾器 @bot.tree.command", insert: "tree.command(name=\"${1:cmd}\", description=\"${2:說明}\")" },
            { label: "tree.sync", detail: "同步斜線指令", insert: "await tree.sync()" },
            { label: "run", detail: "啟動", insert: "run(TOKEN)" },
            { label: "user", detail: "Bot 使用者", insert: "user" }
        ],
        client: [
            { label: "tree.command", detail: "@client.tree.command", insert: "tree.command(name=\"${1:cmd}\", description=\"${2:說明}\")" },
            { label: "tree.sync", detail: "同步斜線", insert: "await tree.sync()" },
            { label: "run", detail: "啟動", insert: "run(TOKEN)" },
            { label: "user", detail: "Bot 使用者", insert: "user" }
        ],
        discord: [
            { label: "Intents.default()", detail: "預設 Intents", insert: "Intents.default()" },
            { label: "Intents.all()", detail: "全部 Intents", insert: "Intents.all()" },
            { label: "Embed", detail: "嵌入訊息", insert: "Embed(title=\"${1}\", description=\"${2}\")" },
            { label: "ButtonStyle.success", detail: "綠色按鈕", insert: "ButtonStyle.success" },
            { label: "ButtonStyle.danger", detail: "紅色按鈕", insert: "ButtonStyle.danger" },
            { label: "SelectOption", detail: "下拉選項", insert: "SelectOption(label=\"${1}\", value=\"${2}\")" },
            { label: "Colour.blue", detail: "藍色", insert: "Colour.blue()" },
            { label: "ui.View", detail: "UI 容器", insert: "ui.View()" },
            { label: "ui.Button", detail: "按鈕", insert: "ui.Button(label=\"${1}\", style=discord.ButtonStyle.primary)" }
        ],
        ui: [
            { label: "button", detail: "@ui.button", insert: "button(label=\"${1}\", style=discord.ButtonStyle.primary)" },
            { label: "select", detail: "@ui.select", insert: "select(placeholder=\"${1}\", options=[discord.SelectOption(label=\"${2}\", value=\"${3}\")])" },
            { label: "View", detail: "View 類別", insert: "View()" }
        ],
        commands: [
            { label: "Bot", detail: "commands.Bot(...)", insert: "Bot(command_prefix=\"!\", intents=intents)" }
        ],
        str: [
            { label: "split", detail: "分割字串", insert: "split(${1})" },
            { label: "join", detail: "連接（從字串呼叫）", insert: "join(${1})" },
            { label: "strip", detail: "去除空白", insert: "strip()" },
            { label: "replace", detail: "替換", insert: "replace(${1:舊}, ${2:新})" },
            { label: "startswith", detail: "開頭比對", insert: "startswith(${1})" },
            { label: "endswith", detail: "結尾比對", insert: "endswith(${1})" },
            { label: "upper", detail: "大寫", insert: "upper()" },
            { label: "lower", detail: "小寫", insert: "lower()" },
            { label: "find", detail: "尋找位置", insert: "find(${1})" },
            { label: "format", detail: "format 格式化", insert: "format(${1})" }
        ],
        list: [
            { label: "append", detail: "加入元素", insert: "append(${1})" },
            { label: "pop", detail: "彈出元素", insert: "pop(${1:})" },
            { label: "sort", detail: "排序", insert: "sort()" },
            { label: "reverse", detail: "反轉", insert: "reverse()" },
            { label: "extend", detail: "擴展", insert: "extend(${1})" },
            { label: "insert", detail: "插入", insert: "insert(${1:索引}, ${2:值})" }
        ],
        dict: [
            { label: "get", detail: "安全取值", insert: "get(${1:鍵}, ${2:預設})" },
            { label: "keys", detail: "所有鍵", insert: "keys()" },
            { label: "values", detail: "所有值", insert: "values()" },
            { label: "items", detail: "鍵值對", insert: "items()" },
            { label: "update", detail: "合併字典", insert: "update(${1})" }
        ]
    };

    var KEYWORDS = [
        "and", "as", "assert", "break", "class", "continue", "def", "del", "elif", "else",
        "except", "False", "finally", "for", "from", "global", "if", "import", "in", "is",
        "lambda", "None", "nonlocal", "not", "or", "pass", "raise", "return", "True", "try",
        "while", "with", "yield", "async", "await"
    ];

    var STDLIB_MODULES = [
        "abc", "argparse", "array", "asyncio", "base64", "binascii", "bisect", "builtins",
        "calendar", "cmath", "collections", "concurrent", "contextlib", "copy", "csv",
        "datetime", "decimal", "difflib", "enum", "functools", "fractions", "glob", "hashlib",
        "heapq", "hmac", "html", "http", "importlib", "inspect", "io", "itertools", "json",
        "logging", "math", "mimetypes", "numbers", "operator", "os", "pathlib", "pickle",
        "platform", "pprint", "queue", "random", "re", "secrets", "shlex", "shutil",
        "socket", "sqlite3", "statistics", "string", "struct", "subprocess", "sys", "tempfile",
        "textwrap", "threading", "time", "timeit", "traceback", "types", "typing", "unicodedata",
        "unittest", "urllib", "uuid", "warnings", "weakref", "xml", "zipfile"
    ];

    function isBotCode(code) {
        if (!code) return false;
        return /\bdiscord\b|commands\.Bot|@bot\.|@client\.|client\.tree|tree\.command|!hello|!ping|handle\s*\(|Bot:\s/.test(code);
    }

    function isDiscordPyCode(code) {
        if (!code) return false;
        return /\bimport\s+discord\b|from\s+discord|commands\.Bot|discord\.Client|@bot\.|@client\./.test(code);
    }

    function isLegacyBotCode(code) {
        if (!code) return false;
        return /!hello|!ping|!echo|handle\s*\(|msg\s*=\s*input/.test(code) && !isDiscordPyCode(code);
    }

    function matchPrefix(label, prefix) {
        if (!prefix) return true;
        return label.toLowerCase().indexOf(prefix.toLowerCase()) === 0;
    }

    function getMemberBeforeDot(model, position) {
        var line = model.getLineContent(position.lineNumber);
        var before = line.slice(0, position.column - 1);
        var m = before.match(/([a-zA-Z_][\w]*)\.\s*$/);
        return m ? m[1] : null;
    }

    function collectItems(prefix, code, forceBot, context) {
        var bot = forceBot || isBotCode(code);
        var discordPy = isDiscordPyCode(code);
        var legacy = isLegacyBotCode(code);
        var items = [];
        var lineBefore = (context && context.lineBefore) ? String(context.lineBefore) : "";
        var importCtx = /\bimport\s+[a-zA-Z0-9_.,\s]*$/.test(lineBefore) || /\bfrom\s+[a-zA-Z0-9_.]*$/.test(lineBefore);

        KEYWORDS.forEach(function (kw) {
            if (matchPrefix(kw, prefix)) {
                items.push({ kind: "keyword", label: kw, insert: kw, sort: "3_" + kw, detail: "Python 關鍵字" });
            }
        });

        BASE_BUILTINS.forEach(function (b) {
            if (matchPrefix(b.label, prefix)) {
                items.push({ kind: "function", label: b.label, insert: b.insert, sort: "1_" + b.label, detail: b.detail });
            }
        });

        BASE_SNIPPETS.forEach(function (s) {
            if (matchPrefix(s.label, prefix)) {
                items.push({ kind: "snippet", label: s.label, insert: s.insert, sort: "2_" + s.label, detail: s.detail });
            }
        });

        STDLIB_MODULES.forEach(function (m) {
            if (matchPrefix(m, prefix)) {
                items.push({
                    kind: "module",
                    label: m,
                    insert: m,
                    sort: (importCtx ? "0_" : "4_") + m,
                    detail: "Python 內建模組"
                });
            }
        });

        if (forceBot || bot || discordPy) {
            DISCORD_SNIPPETS.forEach(function (s) {
                if (matchPrefix(s.label, prefix)) {
                    items.push({ kind: "snippet", label: s.label, insert: s.insert, sort: "0_" + s.label, detail: "🤖 " + s.detail });
                }
            });
        }

        if (forceBot || legacy || (bot && !discordPy)) {
            LEGACY_BOT_SNIPPETS.forEach(function (s) {
                if (matchPrefix(s.label, prefix)) {
                    items.push({ kind: "snippet", label: s.label, insert: s.insert, sort: "0_" + s.label, detail: "🤖 " + s.detail });
                }
            });
        }

        return items;
    }

    function getMemberItems(member, prefix) {
        var list = DISCORD_MEMBERS[member];
        if (!list) return [];
        var isBot = /^(ctx|bot|client|interaction|discord|ui|commands)$/.test(member);
        return list.filter(function (m) { return matchPrefix(m.label, prefix); }).map(function (m) {
            var detail = m.detail || ((isBot ? "🤖 " : "") + member + "." + m.label);
            return { kind: "method", label: m.label, insert: m.insert, sort: (isBot ? "0_" : "1_") + m.label, detail: detail };
        });
    }

    global.PythonCompletions = {
        KEYWORDS: KEYWORDS,
        STDLIB_MODULES: STDLIB_MODULES,
        BASE_BUILTINS: BASE_BUILTINS,
        BASE_SNIPPETS: BASE_SNIPPETS,
        DISCORD_SNIPPETS: DISCORD_SNIPPETS,
        LEGACY_BOT_SNIPPETS: LEGACY_BOT_SNIPPETS,
        DISCORD_MEMBERS: DISCORD_MEMBERS,
        isBotCode: isBotCode,
        isDiscordPyCode: isDiscordPyCode,
        isLegacyBotCode: isLegacyBotCode,
        getMemberBeforeDot: getMemberBeforeDot,
        collectItems: collectItems,
        getMemberItems: getMemberItems
    };
})(typeof window !== "undefined" ? window : globalThis);

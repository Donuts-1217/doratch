/**
 * Python 學習 — 詳細教學（語法示範 ≠ 本關答案）
 * 每關說明：學什麼、用什麼、怎麼寫、怎麼測
 */
window.PYTHON_LESSON_TEACH = {
    hello: {
        apis: [
            { name: "print(內容)", desc: "把資料印到執行視窗。本關只用這個。" }
        ],
        sections: [
            {
                h: "這關在學什麼？",
                p: "Python 程式是一行一行執行的。`print()` 是最常用的輸出指令，把文字顯示在螢幕（執行視窗）上。"
            },
            {
                h: "print() 語法",
                p: "文字（字串）要用引號包起來，可以是雙引號 `\"\"` 或單引號 `''`。括號裡放要印的內容。",
                code: "# 語法示範（內容請依題目自己填）\nprint(\"這是一段文字\")\nprint('也可以用單引號')"
            },
            {
                h: "本關題目要求",
                p: "題目要求印出固定一句話。請看 starter 註解裡的「任務」那一行，輸出必須<strong>一模一樣</strong>（大小寫、空格都要相同）。"
            },
            {
                h: "建議步驟",
                steps: [
                    "在編輯器寫一行 `print(...)`",
                    "括號內用引號包住題目要求的文字",
                    "按 ▶ 執行，看執行視窗是否正確",
                    "按 ✅ 跑測試 確認通關"
                ]
            },
            {
                h: "常見錯誤",
                tips: [
                    "忘記引號 → 會報錯",
                    "多空格或少字 → 測試會失敗",
                    "只寫註解沒寫程式 → 無法通關"
                ]
            }
        ]
    },
    io: {
        apis: [
            { name: "input()", desc: "等待使用者輸入一行文字，當成字串回傳。" },
            { name: "print()", desc: "輸出結果。" },
            { name: "+", desc: "串接字串，例如 \"Hello, \" + name" }
        ],
        sections: [
            {
                h: "這關在學什麼？",
                p: "程式不只印固定文字，還要<strong>讀使用者輸入</strong>。`input()` 讀一行；再用 `+` 把字串接起來。"
            },
            {
                h: "input() 怎麼用？",
                p: "執行時，程式跑到 `input()` 會在執行視窗<strong>跳出輸入框</strong>，你打字按 Enter 後，程式才繼續。",
                code: "name = input()   # 讀一行，存到變數 name\nprint(name)      # 把讀到的內容印出"
            },
            {
                h: "串接字串",
                p: "題目要印 `Hello, 名字!` 格式。固定部分用引號，名字來自變數，中間用 `+` 連接。",
                code: "# 格式示範（名字來自 input，不要寫死）\nword = input()\nprint(\"前段\" + word + \"後段\")"
            },
            {
                h: "本關怎麼做？",
                steps: [
                    "用 `input()` 讀名字（可存成變數）",
                    "用 `print()` 印出 `Hello, ` + 名字 + `!`",
                    "▶ 執行：在輸入框打 Alice，應看到 Hello, Alice!",
                    "不可把 \"Alice\" 寫死在程式裡"
                ]
            },
            {
                h: "常見錯誤",
                tips: [
                    "寫成 print(\"Hello, Alice!\") 沒有 input → 測試換名字會失敗",
                    "逗號後面多空格 → 格式不符"
                ]
            }
        ]
    },
    "if-grade": {
        apis: [
            { name: "input()", desc: "讀分數（字串），通常要 int(input()) 轉整數。" },
            { name: "int()", desc: "把字串轉成整數，例如 int(\"85\") → 85" },
            { name: "if / elif / else", desc: "依條件執行不同分支。" },
            { name: ">=", desc: "大於或等於，用於分數區間。" }
        ],
        sections: [
            {
                h: "這關在學什麼？",
                p: "依<strong>不同分數</strong>印<strong>不同等第</strong>。不能寫死一個答案，要用條件判斷。"
            },
            {
                h: "if / elif / else 結構",
                p: "Python 用縮排（通常 4 空格）表示區塊。`elif` 是「否則如果」，`else` 是「都不符合時」。",
                code: "score = int(input())\nif score >= 90:\n    print(\"A\")\nelif score >= 80:\n    print(\"B\")\nelse:\n    print(\"其他\")"
            },
            {
                h: "本關分數對照",
                p: "90 以上 → A · 80–89 → B · 60–79 → C · 59 以下 → F。注意 90、80、60 邊界。"
            },
            {
                h: "建議步驟",
                steps: [
                    "讀分數並用 int() 轉整數",
                    "用 if 判斷 >= 90 印 A",
                    "elif 判斷 >= 80 印 B，依此類推",
                    "else 處理 59 以下印 F",
                    "用 ▶ 執行手動試 95、85、70、50"
                ]
            },
            {
                h: "常見錯誤",
                tips: [
                    "忘記 int() → 無法和數字比較",
                    "條件順序錯（先判 60 再判 90）→ 邏輯錯",
                    "只 print 一個等第 → 其他測資失敗"
                ]
            }
        ]
    },
    "for-sum": {
        apis: [
            { name: "for ... in range(...)", desc: "迴圈重複執行。" },
            { name: "range(a, b)", desc: "產生 a 到 b-1 的整數。range(1, 4) → 1,2,3" },
            { name: "累加變數", desc: "total = 0 開始，迴圈裡 total += i" }
        ],
        sections: [
            {
                h: "這關在學什麼？",
                p: "計算 1+2+…+n。用 **for 迴圈**累加，不要直接寫死答案。"
            },
            {
                h: "for 迴圈語法",
                code: "total = 0\nfor i in range(1, 5):\n    total = total + i\nprint(total)   # 1+2+3+4 = 10"
            },
            {
                h: "range 怎麼設？",
                p: "要加 1 到 n，可用 `range(1, n + 1)`。記得 n 要先從 input 讀進來並轉 int。"
            },
            {
                h: "建議步驟",
                steps: [
                    "讀 n",
                    "建立 total = 0",
                    "for 迴圈從 1 加到 n",
                    "印 total"
                ]
            }
        ]
    },
    "while-guess": {
        apis: [
            { name: "while 條件:", desc: "條件為真就重複執行區塊。" },
            { name: "break", desc: "（可選）跳出迴圈。本關也可用 while True + if 判斷 0" }
        ],
        sections: [
            {
                h: "這關在學什麼？",
                p: "不確定要讀幾次輸入時用 **while**。讀到 0 停止，印加總（0 不算）。"
            },
            {
                h: "while 語法",
                code: "total = 0\nwhile True:\n    x = int(input())\n    if x == 0:\n        break\n    total += x\nprint(total)"
            },
            {
                h: "建議步驟",
                steps: [
                    "total 從 0 開始",
                    "迴圈內每次 int(input())",
                    "若是 0 就 break",
                    "否則加到 total",
                    "結束後 print(total)"
                ]
            },
            {
                h: "測試方式",
                p: "▶ 執行時依序輸入多行，例如 3 → Enter → 5 → Enter → 0 → Enter，應得到 8。"
            }
        ]
    },
    "list-avg": {
        apis: [
            { name: "for + range(n)", desc: "重複讀 n 次。" },
            { name: "list 與 append", desc: "scores = [] 然後 scores.append(分數)" },
            { name: "sum(list) / len(list)", desc: "算平均；本關用整數 //" }
        ],
        sections: [
            {
                h: "這關在學什麼？",
                p: "先讀有幾筆，再讀每一筆分數，算平均。"
            },
            {
                h: "讀多筆資料",
                code: "n = int(input())\nscores = []\nfor i in range(n):\n    scores.append(int(input()))\nprint(sum(scores) // len(scores))"
            },
            {
                h: "建議步驟",
                steps: [
                    "讀 n",
                    "用 for 迴圈讀 n 個分數（可存 list）",
                    "加總後除以個數（整數除法 //）",
                    "印平均"
                ]
            }
        ]
    },
    func: {
        apis: [
            { name: "def 名稱(參數):", desc: "定義函式。" },
            { name: "return 值", desc: "回傳結果給呼叫者。" }
        ],
        sections: [
            {
                h: "這關在學什麼？",
                p: "把「算平方」包成函式 `square(x)`，主程式讀 n 再呼叫函式。"
            },
            {
                h: "def 語法",
                code: "def square(x):\n    return x * x\n\nn = int(input())\nprint(square(n))"
            },
            {
                h: "建議步驟",
                steps: [
                    "定義 square(x)，return x * x",
                    "讀 n",
                    "print(square(n))",
                    "不可只在主程式 print n*n 而沒有 def"
                ]
            }
        ]
    },
    triangle: {
        apis: [
            { name: "if 與 and", desc: "多條件同時成立用 and 連接。" }
        ],
        sections: [
            {
                h: "這關在學什麼？",
                p: "三角形定理：任意兩邊之和<strong>大於</strong>第三邊。"
            },
            {
                h: "條件怎麼寫？",
                p: "三邊 a,b,c 要同時滿足：a+b>c 且 a+c>b 且 b+c>a。",
                code: "if a + b > c and a + c > b and b + c > a:\n    print(\"合法\")\nelse:\n    print(\"不合法\")"
            },
            {
                h: "本關輸出文字",
                p: "合法 → `合法三角形` · 不合法 → `不合法`（須完全一致）。"
            }
        ]
    },
    prime: {
        apis: [
            { name: "for 迴圈", desc: "檢查 2 到 n-1 能否整除。" },
            { name: "n % i == 0", desc: "餘數為 0 表示可整除，不是質數。" }
        ],
        sections: [
            {
                h: "這關在學什麼？",
                p: "質數：大於 1，只能被 1 和自己整除。1 不是質數。"
            },
            {
                h: "思路",
                steps: [
                    "n <= 1 直接印「不是質數」",
                    "用迴圈 i 從 2 試到 n-1（或 sqrt(n)）",
                    "若 n % i == 0 表示有因數 → 不是質數",
                    "迴圈都沒找到因數 → 是質數"
                ]
            },
            {
                h: "輸出",
                p: "是質數 → `是質數` · 否則 → `不是質數`"
            }
        ]
    },
    fib: {
        apis: [
            { name: "list", desc: "存費氏數列各項。" },
            { name: "for 迴圈", desc: "從第 3 項起每项 = 前兩項之和。" }
        ],
        sections: [
            {
                h: "這關在學什麼？",
                p: "費氏：1, 1, 2, 3, 5, 8… 前兩項是 1，之後每项等於前兩項和。"
            },
            {
                h: "邊界",
                p: "k=0 → 印空行 · k=1 → 只印 1 · k=2 → 1 1（空白分隔）"
            },
            {
                h: "思路",
                steps: [
                    "讀 k",
                    "k=0 特殊處理",
                    "用 list 存序列，迴圈算出 k 項",
                    "用空格 join 或逐個 print(end=' ')",
                    "輸出格式：數字間一個空格，末尾不要多餘空格"
                ]
            }
        ]
    },
    "discord-intro": {
        apis: [
            { name: "input()", desc: "讀取一行文字 — 在本關代表「使用者在 Discord 頻道打的訊息」。" },
            { name: "if 條件:", desc: "條件成立才執行縮排區塊內的程式。" },
            { name: "==", desc: "字串完全相等才為 True（大小寫、空格、驚嘆號都要一模一樣）。" },
            { name: "print(...)", desc: "在本關代表「Bot 在頻道回覆的訊息」。" }
        ],
        demoMode: "terminal",
        demoProgram:
            "# 【示範程式】練習 input + if 判斷指令\n" +
            "# 試跑：▶ 執行 → 輸入 !示範 → 應看到 Bot: 這是語法示範\n" +
            "# ⚠️ 本關答案要改成 !hello → Bot: 你好！\n\n" +
            "msg = input()\n" +
            "if msg == \"!示範\":\n" +
            "    print(\"Bot: 這是語法示範\")\n",
        sections: [
            {
                h: "Discord Bot 是什麼？",
                p: "Bot 是<strong>自動回覆</strong>的程式。人在頻道打字（例如 <code>!hello</code>），Bot 讀到後依規則回覆。第 11–15 關用 <code>input()</code> 假裝「頻道訊息」、<code>print()</code> 假裝「Bot 回覆」，先練<strong>判斷字串</strong>的邏輯。"
            },
            {
                h: "語法示範 ①：讀訊息 + 判斷",
                p: "最基本結構：先讀一行存成變數，再用 <code>if</code> 比對是否為某個指令。",
                code: "msg = input()          # 等待使用者輸入一行\nif msg == \"!示範\":    # 字串要完全相等\n    print(\"Bot: 收到示範指令\")",
                demo: true
            },
            {
                h: "語法示範 ②：為什麼必須完全相等？",
                p: "<code>==</code> 比對的是<strong>整段字串</strong>。<code>hello</code>、<code>!Hello</code>、<code>!hello </code>（多空格）都<strong>不等於</strong> <code>!hello</code>。",
                code: "# 以下都不會觸發 if msg == \"!hello\":\n# hello      ← 沒有 !\n# !Hello     ← H 大寫\n# !hello     ← 前面多空格",
                demo: true
            },
            {
                h: "本關題目要做什麼？（不是抄示範）",
                steps: [
                    "讀取 msg = input()",
                    "若 msg 剛好是 \"!hello\"，印 \"Bot: 你好！\"",
                    "其他任何訊息<strong>不要 print 任何東西</strong>（保持安靜）"
                ]
            },
            {
                h: "▶ 執行視窗怎麼測？",
                steps: [
                    "按 ▶ 執行（或 Ctrl+Enter）",
                    "程式停在 input() 時，執行視窗下方會出現輸入框",
                    "輸入 <code>!hello</code> 按 Enter → 應看到 <code>Bot: 你好！</code>",
                    "再 ▶ 執行，輸入 <code>hello</code> 或 <code>!help</code> → 應<strong>沒有任何輸出</strong>",
                    "確認無誤後按 ✅ 跑測試 自動批改"
                ]
            },
            {
                h: "常見錯誤",
                tips: [
                    "寫成 print('Bot: 你好！') 沒有 if → 任何輸入都會回覆，測試失敗",
                    "漏寫 Bot: 前綴或標點不同 → 格式不符",
                    "用 = 而不是 == → 語法或邏輯錯誤"
                ]
            }
        ]
    },
    "discord-ping": {
        apis: [
            { name: "input()", desc: "讀頻道訊息。" },
            { name: "if msg == \"!ping\":", desc: "判斷是否為 ping 指令（字串要完全一致）。" },
            { name: "print(\"Bot: pong\")", desc: "Bot 慣用 Bot: 開頭的回覆格式。" }
        ],
        demoMode: "terminal",
        demoProgram:
            "# 【示範程式】另一個指令 !status\n" +
            "# 試跑：輸入 !status → Bot: online\n" +
            "# ⚠️ 本關要寫 !ping → Bot: pong\n\n" +
            "msg = input()\n" +
            "if msg == \"!status\":\n" +
            "    print(\"Bot: online\")\n",
        sections: [
            {
                h: "!ping 是什麼？",
                p: "Discord Bot 開發者常用 <code>!ping</code> 測試 Bot 是否在線；Bot 通常回 <code>pong</code>。就像對 Server 喊「你在嗎？」"
            },
            {
                h: "語法示範：單一指令判斷",
                p: "和第 11 關相同結構，只是換成不同的指令字串與回覆內容。",
                code: "msg = input()\nif msg == \"!status\":      # 示範用指令名\n    print(\"Bot: online\")     # 示範用回覆\n# 本關請改成 !ping 與 Bot: pong",
                demo: true
            },
            {
                h: "本關題目",
                steps: [
                    "msg = input()",
                    "若 msg == \"!ping\"，印 \"Bot: pong\"",
                    "其他訊息不印任何東西"
                ]
            },
            {
                h: "▶ 怎麼手動測？",
                steps: [
                    "▶ 執行 → 輸入 !ping → 應看到 Bot: pong",
                    "▶ 執行 → 輸入 !hello → 應無輸出",
                    "✅ 跑測試 確認通關"
                ]
            }
        ]
    },
    "discord-multi": {
        apis: [
            { name: "if / elif / else", desc: "多種互斥條件分支；依序檢查，命中一個就執行。" },
            { name: "elif", desc: "「否則如果」— 前面 if 不成立才檢查這條。" },
            { name: "else", desc: "前面都不成立時執行（處理未知指令）。" }
        ],
        demoMode: "terminal",
        demoProgram:
            "# 【示範程式】三種指令 + 未知（指令名稱與本關不同）\n" +
            "msg = input()\n" +
            "if msg == \"!a\":\n" +
            "    print(\"Bot: A\")\n" +
            "elif msg == \"!b\":\n" +
            "    print(\"Bot: B\")\n" +
            "else:\n" +
            "    print(\"Bot: 不認識\")\n",
        sections: [
            {
                h: "一個 Bot 為什麼需要 elif？",
                p: "真實 Bot 要處理很多指令。用一連串 <code>if / elif / else</code>，每次只走<strong>一條</strong>分支，不會重複回覆。"
            },
            {
                h: "語法示範：if / elif / else 結構",
                code: "msg = input()\nif msg == \"!a\":\n    print(\"Bot: A\")\nelif msg == \"!b\":\n    print(\"Bot: B\")\nelse:\n    print(\"Bot: 不認識\")",
                demo: true
            },
            {
                h: "本關對照表（請自己寫成 if / elif / else）",
                table: [
                    ["使用者輸入", "Bot 應回覆"],
                    ["!hello", "Bot: 你好！"],
                    ["!ping", "Bot: pong"],
                    ["!help", "Bot: 指令：hello ping help"],
                    ["其他任何", "Bot: 未知指令"]
                ]
            },
            {
                h: "寫法提示",
                tips: [
                    "用 elif 串起 !hello、!ping、!help，不要寫三個獨立 if（邏輯雖可但本關要求 elif）",
                    "else 放最後處理未知指令",
                    "每行 print 的文字必須與上表完全一致"
                ]
            },
            {
                h: "▶ 建議測試順序",
                steps: [
                    "▶ → !hello → Bot: 你好！",
                    "▶ → !ping → Bot: pong",
                    "▶ → !help → Bot: 指令：hello ping help",
                    "▶ → !xyz → Bot: 未知指令",
                    "✅ 跑測試"
                ]
            }
        ]
    },
    "discord-func": {
        apis: [
            { name: "def handle(msg):", desc: "定義函式，msg 是參數（收到的訊息）。" },
            { name: "return \"字串\"", desc: "把回覆字串交給呼叫者，不在函式內 print。" },
            { name: "print(handle(msg))", desc: "主程式讀 input、呼叫函式、印出回傳值。" }
        ],
        demoMode: "terminal",
        demoProgram:
            "# 【示範程式】函式結構（指令名 !demo，非本關答案）\n" +
            "def handle(msg):\n" +
            "    if msg == \"!demo\":\n" +
            "        return \"Bot: 示範回覆\"\n" +
            "    return \"Bot: 未知\"\n\n" +
            "msg = input()\n" +
            "print(handle(msg))\n",
        sections: [
            {
                h: "為什麼要包成函式？",
                p: "真實 discord.py 會把「收到訊息怎麼回」寫在事件函式裡。本關用 <code>handle(msg)</code> 模擬這個習慣：<strong>函式負責決定回覆，主程式負責 I/O</strong>。"
            },
            {
                h: "語法示範：def + return + 主程式",
                code: "def handle(msg):\n    if msg == \"!demo\":\n        return \"Bot: 示範回覆\"\n    return \"Bot: 未知\"\n\nmsg = input()\nprint(handle(msg))   # 主程式只負責讀和印",
                demo: true
            },
            {
                h: "return 與 print 的差別",
                p: "在 <code>handle</code> 裡用 <code>return \"Bot: …\"</code> 把字串<strong>交出去</strong>；主程式 <code>print(handle(msg))</code> 才真的輸出。若在 handle 裡 print 又沒 return，可能得到 None。"
            },
            {
                h: "本關題目",
                steps: [
                    "定義 def handle(msg):",
                    "!hello → return \"Bot: 你好！\"",
                    "!ping → return \"Bot: pong\"",
                    "其他 → return \"Bot: 未知指令\"",
                    "主程式：msg = input() 然後 print(handle(msg))"
                ]
            },
            {
                h: "▶ 測試",
                steps: [
                    "▶ → !hello、!ping、!abc 各試一次",
                    "✅ 跑測試"
                ]
            }
        ]
    },
    "discord-echo": {
        apis: [
            { name: "msg.startswith(\"!echo \")", desc: "判斷字串是否以指定前綴開頭（注意 echo 後有空格）。" },
            { name: "msg[6:]", desc: "字串切片：從第 6 個字元取到結尾（\"!echo \" 長度為 6）。" },
            { name: "msg[len(\"!echo \"):]", desc: "同上，用 len 算前綴長度，較不易算錯。" }
        ],
        demoMode: "terminal",
        demoProgram:
            "# 【示範程式】!repeat 前綴（本關要寫 !echo ）\n" +
            "msg = input()\n" +
            "prefix = \"!repeat \"\n" +
            "if msg.startswith(prefix):\n" +
            "    text = msg[len(prefix):]\n" +
            "    print(\"Bot: \" + text)\n",
        sections: [
            {
                h: "帶參數的指令",
                p: "有些指令後面還有文字，例如 <code>!echo 大家好</code>。Bot 要取出 <code>大家好</code> 再回覆。不能只用 <code>==</code> 比對整段，要用<strong>前綴判斷 + 切片</strong>。"
            },
            {
                h: "語法示範 ①：startswith",
                code: "msg = \"!repeat 測試文字\"\nif msg.startswith(\"!repeat \"):\n    print(\"有 repeat 前綴\")",
                demo: true
            },
            {
                h: "語法示範 ②：取出參數文字",
                code: "prefix = \"!repeat \"\nif msg.startswith(prefix):\n    text = msg[len(prefix):]   # 去掉前綴\n    print(\"Bot: \" + text)",
                demo: true
            },
            {
                h: "本關題目",
                steps: [
                    "msg = input()",
                    "若 msg 以 \"!echo \" 開頭（注意空格），印 \"Bot: \" + 後面的文字",
                    "例：!echo hi → Bot: hi",
                    "其他訊息不印"
                ]
            },
            {
                h: "▶ 測試",
                steps: [
                    "▶ → !echo hi → Bot: hi",
                    "▶ → !echo 大家好 → Bot: 大家好",
                    "▶ → !ping → 無輸出",
                    "✅ 跑測試"
                ]
            },
            {
                h: "常見錯誤",
                tips: [
                    "寫成 \"!echo\" 沒有空格 → !echo hi 無法匹配",
                    "用 msg[5:] 而不是 [6:] → 會多留一個空格",
                    "用 == 比對整段 → 無法處理後面的可變文字"
                ]
            }
        ]
    },
    "discord-py-cmd": {
        apis: [
            { name: "import discord", desc: "discord.py 主套件（平台模擬器會 mock，VS Code 需 pip install discord.py）。" },
            { name: "commands.Bot(...)", desc: "建立 Bot；command_prefix='!' 表示前綴指令。" },
            { name: "intents.message_content", desc: "必須開啟才能讀頻道文字訊息（真 Discord 也要）。" },
            { name: "@bot.command()", desc: "註冊前綴指令，例如 !hello。" },
            { name: "async def / await", desc: "discord.py 2.x 事件與指令都必須 async，回覆用 await。" },
            { name: "TOKEN + bot.run(TOKEN)", desc: "與 VS Code python main.py 相同；學習關卡用 doratch-demo-learn-2026。" }
        ],
        demoMode: "simulator",
        demoProgram:
            "# 【示範程式】discord.py 骨架 + !demo 指令\n" +
            "# 載入後 → 右側模擬器 → 連線 → 輸入 !demo\n" +
            "# ⚠️ 本關要自己寫 !hello 等題目要求的指令\n\n" +
            "import discord\n" +
            "from discord.ext import commands\n\n" +
            "TOKEN = 'doratch-demo-learn-2026'\n\n" +
            "intents = discord.Intents.default()\n" +
            "intents.message_content = True\n" +
            "bot = commands.Bot(command_prefix='!', intents=intents)\n\n" +
            "@bot.event\n" +
            "async def on_ready():\n" +
            "    print(f'Logged in as {bot.user}')\n\n" +
            "@bot.command(name='demo')\n" +
            "async def demo_cmd(ctx):\n" +
            "    await ctx.send('這是示範指令 !demo — 請自己加 @bot.command hello')\n\n" +
            "bot.run(TOKEN)\n",
        sections: [
            {
                h: "從第 16 關起：真 discord.py 語法",
                p: "程式寫法與 <strong>VS Code + pip install discord.py</strong> 完全相同。右側 <strong>Bot 模擬器</strong> 取代真 Discord 頻道；Token 用 <code>doratch-demo-learn-2026</code>（固定示範 Token）。"
            },
            {
                h: "語法示範 ①：main.py 標準骨架",
                code:
                    "import discord\n" +
                    "from discord.ext import commands\n\n" +
                    "TOKEN = 'doratch-demo-learn-2026'\n\n" +
                    "intents = discord.Intents.default()\n" +
                    "intents.message_content = True\n" +
                    "bot = commands.Bot(command_prefix='!', intents=intents)\n\n" +
                    "# ↓ 在這裡加 @bot.event、@bot.command\n\n" +
                    "bot.run(TOKEN)",
                demo: true
            },
            {
                h: "語法示範 ②：@bot.command 前綴指令",
                code:
                    "@bot.command(name='hello')   # 註冊 !hello\n" +
                    "async def hello(ctx):        # 必須 async def\n" +
                    "    await ctx.send('你好！')   # 必須 await 回覆",
                demo: true
            },
            {
                h: "語法示範 ③：on_ready 事件（可選但建議）",
                code:
                    "@bot.event\n" +
                    "async def on_ready():\n" +
                    "    print(f'Logged in as {bot.user}')",
                demo: true
            },
            {
                h: "async / await 為什麼必要？",
                p: "discord.py 2.x 所有 Bot 邏輯都是<strong>非同步</strong>。寫 <code>def hello</code> 或忘記 <code>await ctx.send</code> 會在 VS Code 與模擬器都失敗。平台會<strong>真正 await</strong> 你的 coroutine。"
            },
            {
                h: "本關題目（starter 是骨架，指令自己寫）",
                steps: [
                    "保留 import、TOKEN、intents、bot、bot.run(TOKEN)",
                    "至少寫一個 @bot.command() async 指令（例如 !hello）",
                    "用 await ctx.send(...) 回覆",
                    "建議加上 async def on_ready() 印上線訊息"
                ]
            },
            {
                h: "🤖 模擬器操作步驟",
                steps: [
                    "（可選）按上方「📋 載入示範程式」先試 !demo",
                    "依 starter 自己完成程式",
                    "右側模擬器：Token 可留空（會自動讀 TOKEN）→ 按「連線」",
                    "看到「已連線」後，在底部輸入 !hello 等指令",
                    "本關無 ✅ 測試，以模擬器能正常回覆為準"
                ]
            },
            {
                h: "VS Code 上真 Discord",
                steps: [
                    "pip install discord.py",
                    "把 TOKEN 改成 Developer Portal 的 Bot Token",
                    "終端機執行 python main.py",
                    "到 Discord 伺服器輸入 !指令 測試"
                ]
            }
        ]
    },
    "discord-py-slash": {
        apis: [
            { name: "@bot.tree.command(name=..., description=...)", desc: "註冊斜線指令 /name。" },
            { name: "async def slash_xxx(interaction):", desc: "斜線指令處理函式，參數是 interaction。" },
            { name: "await interaction.response.send_message(...)", desc: "第一次回覆斜線指令必須用 response。" },
            { name: "await bot.tree.sync()", desc: "真 Discord 需同步指令；模擬器會自動處理。" }
        ],
        demoMode: "simulator",
        demoProgram:
            "# 【示範程式】只有 /demo 斜線指令\n" +
            "# 連線 → 按 / → 選 demo\n" +
            "# ⚠️ 本關要自己寫 /ping、/hello\n\n" +
            "import discord\n" +
            "from discord.ext import commands\n\n" +
            "TOKEN = 'doratch-demo-learn-2026'\n\n" +
            "intents = discord.Intents.default()\n" +
            "intents.message_content = True\n" +
            "bot = commands.Bot(command_prefix='!', intents=intents)\n\n" +
            "@bot.event\n" +
            "async def on_ready():\n" +
            "    print(f'Logged in as {bot.user}')\n" +
            "    await bot.tree.sync()\n\n" +
            "@bot.tree.command(name='demo', description='示範斜線指令')\n" +
            "async def slash_demo(interaction):\n" +
            "    await interaction.response.send_message('這是 /demo 示範')\n\n" +
            "bot.run(TOKEN)\n",
        sections: [
            {
                h: "前綴指令 vs 斜線指令",
                table: [
                    ["類型", "使用者怎麼打", "怎麼註冊"],
                    ["前綴", "!hello", "@bot.command(name='hello')"],
                    ["斜線", "/hello", "@bot.tree.command(name='hello', description='...')"]
                ]
            },
            {
                h: "語法示範：註冊斜線指令",
                code:
                    "@bot.tree.command(name='demo', description='示範用')\n" +
                    "async def slash_demo(interaction):\n" +
                    "    await interaction.response.send_message('回覆內容')",
                demo: true
            },
            {
                h: "語法示範：on_ready 裡 sync",
                code:
                    "@bot.event\n" +
                    "async def on_ready():\n" +
                    "    print(f'Logged in as {bot.user}')\n" +
                    "    await bot.tree.sync()   # 真 Discord 需要",
                demo: true
            },
            {
                h: "response  vs  followup",
                p: "斜線指令<strong>第一次</strong>回覆用 <code>interaction.response.send_message</code>。若已經 response 過，之後才用 <code>interaction.followup.send</code>。本關只需 response。"
            },
            {
                h: "本關題目",
                steps: [
                    "保留前綴指令（@bot.command）並新增斜線指令",
                    "至少註冊 /ping 與 /hello（名稱與 description 自訂）",
                    "用 await interaction.response.send_message 回覆",
                    "on_ready 裡 await bot.tree.sync()"
                ]
            },
            {
                h: "🤖 模擬器怎麼測斜線指令？",
                steps: [
                    "連線成功後，按模擬器右下角 <strong>/</strong> 按鈕",
                    "或游標在輸入框時按 / 鍵",
                    "從清單選 /ping、/hello",
                    "看 Bot 是否回覆"
                ]
            }
        ]
    },
    "discord-py-ui": {
        apis: [
            { name: "from discord import ui", desc: "匯入 UI 元件模組。" },
            { name: "class XxxView(ui.View):", desc: "View 容器，可附在訊息下方。" },
            { name: "@ui.button(label=..., style=...)", desc: "定義按鈕；callback 必須 async。" },
            { name: "@ui.select(..., options=[...])", desc: "定義下拉選單；options 用 SelectOption。" },
            { name: "await ctx.send(..., view=MyView())", desc: "送訊息並附上可互動元件。" }
        ],
        demoMode: "simulator",
        demoProgram:
            "# 【示範程式】!tryui + 一個按鈕\n" +
            "# 連線 → !tryui → 點「試試看」\n" +
            "# ⚠️ 本關要自己寫 !menu + 按鈕 + 下拉\n\n" +
            "import discord\n" +
            "from discord.ext import commands\n" +
            "from discord import ui\n\n" +
            "TOKEN = 'doratch-demo-learn-2026'\n\n" +
            "intents = discord.Intents.default()\n" +
            "intents.message_content = True\n" +
            "bot = commands.Bot(command_prefix='!', intents=intents)\n\n" +
            "class DemoView(ui.View):\n" +
            "    @ui.button(label='試試看', style=discord.ButtonStyle.primary)\n" +
            "    async def try_btn(self, interaction, button):\n" +
            "        await interaction.response.send_message('你按了示範按鈕 ✅', ephemeral=True)\n\n" +
            "@bot.command(name='tryui')\n" +
            "async def tryui(ctx):\n" +
            "    await ctx.send('點下面按鈕：', view=DemoView())\n\n" +
            "bot.run(TOKEN)\n",
        sections: [
            {
                h: "互動元件是什麼？",
                p: "Discord 訊息下方可以附<strong>按鈕</strong>、<strong>下拉選單</strong>。使用者點擊後 Bot 收到 interaction，在 callback 裡 await 回覆。"
            },
            {
                h: "語法示範 ①：View + 按鈕",
                code:
                    "class DemoView(ui.View):\n" +
                    "    @ui.button(label='確認', style=discord.ButtonStyle.success)\n" +
                    "    async def confirm(self, interaction, button):\n" +
                    "        await interaction.response.send_message('已確認', ephemeral=True)",
                demo: true
            },
            {
                h: "語法示範 ②：下拉選單",
                code:
                    "    @ui.select(\n" +
                    "        placeholder='選一個…',\n" +
                    "        options=[discord.SelectOption(label='A', value='a')]\n" +
                    "    )\n" +
                    "    async def pick(self, interaction, select):\n" +
                    "        val = interaction.data['values'][0]\n" +
                    "        await interaction.response.send_message('你選了 ' + val)",
                demo: true
            },
            {
                h: "語法示範 ③：指令附上 View",
                code:
                    "@bot.command(name='menu')\n" +
                    "async def menu_cmd(ctx):\n" +
                    "    await ctx.send('請選擇：', view=DemoView())",
                demo: true
            },
            {
                h: "ButtonStyle 顏色",
                table: [
                    ["style", "外觀"],
                    ["discord.ButtonStyle.primary", "藍色"],
                    ["discord.ButtonStyle.success", "綠色"],
                    ["discord.ButtonStyle.danger", "紅色"],
                    ["discord.ButtonStyle.secondary", "灰色"]
                ]
            },
            {
                h: "本關題目",
                steps: [
                    "定義 class …(ui.View)",
                    "至少一個 @ui.button 與一個 @ui.select",
                    "寫 @bot.command(name='menu') 用 view= 附上 View",
                    "callback 裡 await interaction.response.send_message"
                ]
            },
            {
                h: "🤖 模擬器測試步驟",
                steps: [
                    "連線 → 輸入 !menu",
                    "訊息下方會出現按鈕與下拉",
                    "點按鈕 → 看 Bot ephemeral 回覆",
                    "選下拉選項 → 看 Bot 回覆"
                ]
            }
        ]
    }
};

window.loadPythonLessonDemo = function (lessonId) {
    var data = window.PYTHON_LESSON_TEACH[lessonId];
    return (data && data.demoProgram) ? data.demoProgram : "";
};

window.renderPythonTeach = function (lessonId) {
    var data = window.PYTHON_LESSON_TEACH[lessonId];
    if (!data) return "<p class=\"teach-empty\">（本關尚無教學說明）</p>";

    var html = "";

    if (data.demoProgram || (data.sections || []).some(function (s) { return s.demo; })) {
        html += "<div class=\"teach-banner\">📘 <strong>藍框</strong> = 語法片段示範 · " +
            "<strong>綠區</strong> = 可載入試玩的完整示範程式 · 皆非本關作業答案，通關請依 starter 自己寫。</div>";
    }

    if (data.apis && data.apis.length) {
        html += "<div class=\"teach-block\"><h3>📌 本關會用到的語法</h3><ul class=\"teach-apis\">";
        data.apis.forEach(function (a) {
            html += "<li><code>" + a.name + "</code> — " + a.desc + "</li>";
        });
        html += "</ul></div>";
    }

    (data.sections || []).forEach(function (sec) {
        html += "<div class=\"teach-block\"><h3>" + sec.h + "</h3>";
        if (sec.p) html += "<p>" + sec.p + "</p>";
        if (sec.table && sec.table.length) {
            html += "<table class=\"teach-table\"><tbody>";
            sec.table.forEach(function (row, ri) {
                html += "<tr>";
                row.forEach(function (cell) {
                    html += (ri === 0 ? "<th>" : "<td>") + cell + (ri === 0 ? "</th>" : "</td>");
                });
                html += "</tr>";
            });
            html += "</tbody></table>";
        }
        if (sec.code) {
            var codeClass = "teach-code" + (sec.demo ? " teach-code-demo" : "");
            html += "<pre class=\"" + codeClass + "\"><code>" +
                sec.code.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</code></pre>";
            html += "<p class=\"teach-code-note" + (sec.demo ? " demo" : "") + "\">↑ " +
                (sec.demo ? "語法示範（非本關答案，請勿整段抄作業）" : "參考寫法，請依題目自己完成。") + "</p>";
        }
        if (sec.steps && sec.steps.length) {
            html += "<ol class=\"teach-steps\">";
            sec.steps.forEach(function (s) { html += "<li>" + s + "</li>"; });
            html += "</ol>";
        }
        if (sec.tips && sec.tips.length) {
            html += "<ul class=\"teach-tips\">";
            sec.tips.forEach(function (t) { html += "<li>" + t + "</li>"; });
            html += "</ul>";
        }
        html += "</div>";
    });

    if (data.demoProgram) {
        var where = data.demoMode === "simulator" ? "右側 Bot 模擬器" : "▶ 執行視窗";
        html += "<div class=\"teach-block teach-demo-program\">" +
            "<h3>🧪 完整示範程式（試玩用）</h3>" +
            "<p>載入後在 <strong>" + where + "</strong> 試跑，熟悉語法與操作。<strong>不是本關答案</strong>，通關仍要依 starter 自己寫。</p>" +
            "<pre class=\"teach-code teach-code-demo\"><code>" +
            data.demoProgram.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</code></pre>" +
            "<button type=\"button\" class=\"teach-load-demo\">📋 載入示範程式到編輯器</button>" +
            "</div>";
    }

    var isDiscordPy = lessonId.indexOf("discord-py") === 0;
    var isDiscordLegacy = lessonId.indexOf("discord-") === 0 && !isDiscordPy;

    html += "<div class=\"teach-block teach-run\"><h3>▶ 怎麼執行與測試？</h3><ol class=\"teach-steps\">";
    if (isDiscordPy) {
        html += "<li><strong>模擬器</strong>：右側 Token 留空或示範 Token → 連線 → 輸入 ! 或 / 指令。</li>" +
            "<li>可先按上方「載入示範程式」試玩，再清空重寫或改回 starter 完成題目。</li>" +
            "<li>本關<strong>無 ✅ 自動測試</strong>，以模擬器手動確認功能。</li>" +
            "<li><strong>VS Code</strong>：pip install discord.py → 改 TOKEN → python main.py。</li>";
    } else if (isDiscordLegacy) {
        html += "<li><strong>執行</strong>：▶ 或 Ctrl+Enter；input() 時在執行視窗輸入模擬訊息。</li>" +
            "<li>可先「載入示範程式」看語法怎麼跑，再按 🗑 清空重寫完成題目。</li>" +
            "<li><strong>跑測試</strong>：✅ 用隱藏測資自動批改。</li>";
    } else {
        html += "<li><strong>執行</strong>：按 ▶ 或 Ctrl+Enter。有 input() 時，執行視窗會出現輸入框，打完按 Enter。</li>" +
            "<li><strong>跑測試</strong>：按 ✅ 跑測試，系統用<strong>隱藏測資</strong>自動檢查。</li>" +
            "<li>starter 只有題目，<strong>答案要自己寫</strong>；可參考上方教學，不可整段複製示範程式當作業。</li>";
    }
    html += "</ol></div>";

    return html;
};

/** Doratch Python 課程：由淺入深，對應 APCS 基礎 */

export const PYTHON_LESSONS = [
    {
        id: "hello",
        title: "1. 第一個程式 print",
        lv: "入門",
        summary: "用 print() 在螢幕上顯示文字。",
        goals: ["認識 print()", "字串要用引號包起來"],
        starter: `# 在下面寫程式，執行後應印出 Hello Doratch
print("Hello Doratch")
`,
        tests: [{ stdin: [], expected: "Hello Doratch" }]
    },
    {
        id: "io",
        title: "2. 變數與 input",
        lv: "入門",
        summary: "讀取使用者輸入，做簡單計算。",
        goals: ["input() 讀字串", "int() 轉整數", "f-string 格式化"],
        starter: `# 讀取名字，印出 Hello, 名字!
name = input()
print(f"Hello, {name}!")
`,
        tests: [{ stdin: ["Alice"], expected: "Hello, Alice!" }]
    },
    {
        id: "if-grade",
        title: "3. if / elif / else 成績",
        lv: "LV1",
        summary: "依分數輸出等第（APCS 經典題）。",
        goals: ["90↑ A", "80–89 B", "60–79 C", "60↓ F"],
        starter: `# 讀取 0–100 分數，印出等第 A/B/C/F
score = int(input())
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 60:
    print("C")
else:
    print("F")
`,
        tests: [
            { stdin: ["95"], expected: "A" },
            { stdin: ["85"], expected: "B" },
            { stdin: ["70"], expected: "C" },
            { stdin: ["50"], expected: "F" }
        ]
    },
    {
        id: "for-sum",
        title: "4. for 迴圈加總",
        lv: "LV1",
        summary: "用 for 把 1 加到 n。",
        goals: ["range()", "累加變數"],
        starter: `# 輸入 n，印出 1+2+...+n
n = int(input())
total = 0
for i in range(1, n + 1):
    total += i
print(total)
`,
        tests: [
            { stdin: ["5"], expected: "15" },
            { stdin: ["10"], expected: "55" }
        ]
    },
    {
        id: "while-guess",
        title: "5. while 迴圈",
        lv: "LV2",
        summary: "重複讀取直到符合條件。",
        goals: ["while 條件", "break 或累加"],
        starter: `# 一直讀數字，加總；輸入 0 時印出總和並結束
total = 0
while True:
    x = int(input())
    if x == 0:
        break
    total += x
print(total)
`,
        tests: [{ stdin: ["3", "5", "0"], expected: "8" }]
    },
    {
        id: "list-avg",
        title: "6. 串列 list",
        lv: "LV2",
        summary: "讀取多個成績，求平均。",
        goals: ["list 與 append", "len", "平均"],
        starter: `# 第一行 n，接著 n 個分數，印出平均（取整）
n = int(input())
scores = []
for _ in range(n):
    scores.append(int(input()))
print(sum(scores) // len(scores))
`,
        tests: [{ stdin: ["3", "80", "90", "70"], expected: "80" }]
    },
    {
        id: "func",
        title: "7. 函式 def",
        lv: "LV2",
        summary: "自訂函式計算平方。",
        goals: ["def", "return", "呼叫函式"],
        starter: `def square(x):
    return x * x

n = int(input())
print(square(n))
`,
        tests: [{ stdin: ["7"], expected: "49" }]
    },
    {
        id: "triangle",
        title: "8. 三角形判定",
        lv: "LV2",
        summary: "APCS：三邊能否構成三角形。",
        goals: ["任意兩邊和大於第三邊"],
        starter: `a = int(input())
b = int(input())
c = int(input())
if a + b > c and a + c > b and b + c > a:
    print("合法三角形")
else:
    print("不合法")
`,
        tests: [
            { stdin: ["3", "4", "5"], expected: "合法三角形" },
            { stdin: ["1", "2", "5"], expected: "不合法" }
        ]
    },
    {
        id: "prime",
        title: "9. 質數判斷",
        lv: "LV3",
        summary: "APCS：判斷是否為質數。",
        goals: ["迴圈整除", "邊界 n<=1"],
        starter: `n = int(input())
if n <= 1:
    print("不是質數")
else:
    is_prime = True
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            is_prime = False
            break
    print("是質數" if is_prime else "不是質數")
`,
        tests: [
            { stdin: ["7"], expected: "是質數" },
            { stdin: ["9"], expected: "不是質數" }
        ]
    },
    {
        id: "fib",
        title: "10. 費氏數列",
        lv: "LV3",
        summary: "APCS：印出前 k 項費氏數列。",
        goals: ["list 動態追加", "前兩項為 1"],
        starter: `k = int(input())
if k <= 0:
    print("")
elif k == 1:
    print("1")
else:
    fib = [1, 1]
    for _ in range(2, k):
        fib.append(fib[-1] + fib[-2])
    print(" ".join(str(x) for x in fib))
`,
        tests: [
            { stdin: ["5"], expected: "1 1 2 3 5" },
            { stdin: ["1"], expected: "1" }
        ]
    }
];

export function getLesson(id) {
    return PYTHON_LESSONS.find((l) => l.id === id) || PYTHON_LESSONS[0];
}

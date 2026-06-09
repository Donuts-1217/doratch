/** Pyodide 執行與測資比對 */

let pyodide = null;
let loadingPromise = null;

export function normalizeOutput(text) {
    return String(text || "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim();
}

function indentCode(code, spaces = 4) {
    const pad = " ".repeat(spaces);
    return code
        .split("\n")
        .map((line) => (line.trim() ? pad + line : line))
        .join("\n");
}

export async function initPyodide(onStatus) {
    if (pyodide) return pyodide;
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
        onStatus?.("正在載入 Python 引擎（首次約 10–30 秒）…");
        if (!globalThis.loadPyodide) {
            await new Promise((resolve, reject) => {
                const s = document.createElement("script");
                s.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
                s.onload = resolve;
                s.onerror = () => reject(new Error("無法載入 Pyodide"));
                document.head.appendChild(s);
            });
        }
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/"
        });
        onStatus?.("Python 引擎就緒");
        return pyodide;
    })();

    return loadingPromise;
}

/**
 * @param {string} userCode
 * @param {string[]} stdinLines
 */
export async function runPython(userCode, stdinLines = []) {
    const py = await initPyodide();
    const stdinText = stdinLines.join("\n") + (stdinLines.length ? "\n" : "");
    const wrapped = `
import sys
from io import StringIO
_stdout = StringIO()
_stdin = StringIO(${JSON.stringify(stdinText)})
sys.stdout = _stdout
sys.stdin = _stdin
_err = None
_tb = None
try:
${indentCode(userCode)}
except Exception as e:
    import traceback
    _err = str(e)
    _tb = traceback.format_exc()
_output = _stdout.getvalue()
`;
    await py.runPythonAsync(wrapped);
    const output = py.globals.get("_output");
    const err = py.globals.get("_err");
    const tb = py.globals.get("_tb");
    py.globals.set("_output", undefined);
    py.globals.set("_err", undefined);
    py.globals.set("_tb", undefined);
    return {
        output: output ?? "",
        error: err ? (tb || err) : null
    };
}

/**
 * @param {string} userCode
 * @param {{ stdin?: string[], expected: string }[]} tests
 */
export async function runTests(userCode, tests) {
    const results = [];
    let allPass = true;
    for (let i = 0; i < tests.length; i++) {
        const t = tests[i];
        const { output, error } = await runPython(userCode, t.stdin || []);
        const got = normalizeOutput(output);
        const want = normalizeOutput(t.expected);
        const pass = !error && got === want;
        if (!pass) allPass = false;
        results.push({
            index: i + 1,
            pass,
            expected: want,
            got: error ? `(錯誤) ${error}` : got,
            stdin: (t.stdin || []).join(", ")
        });
    }
    return { allPass, results };
}

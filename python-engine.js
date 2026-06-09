/** Skulpt 執行 + 繳交驗證 + 測試判定 */
(function (global) {
    "use strict";

    function normalizeOutput(text) {
        return String(text || "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n")
            .map(function (line) { return line.trimEnd(); })
            .join("\n")
            .trim();
    }

    function stripComments(code) {
        return code.split("\n").filter(function (line) {
            var t = line.trim();
            return t && t.charAt(0) !== "#";
        }).join("\n");
    }

    function countCodeLines(code) {
        return stripComments(code).split("\n").filter(function (l) { return l.trim(); }).length;
    }

    /**
     * 繳交前驗證：不可空交、不可只有註解、須符合題目要求
     */
    function validateSubmission(code, rules) {
        rules = rules || {};
        var clean = stripComments(code);
        if (!clean.trim()) {
            return { ok: false, message: "請撰寫程式碼，不能只留註解或空白。" };
        }
        if (rules.minLines && countCodeLines(code) < rules.minLines) {
            return { ok: false, message: "程式太短，請完整實作題目要求（至少 " + rules.minLines + " 行有效程式）。" };
        }
        var lower = clean.toLowerCase();
        for (var i = 0; i < (rules.mustUse || []).length; i++) {
            var tok = rules.mustUse[i];
            if (lower.indexOf(tok.toLowerCase()) === -1) {
                return { ok: false, message: "題目要求必須使用「" + tok + "」，請自行實作。" };
            }
        }
        if (rules.requireBranch && !/\bif\b/.test(clean)) {
            return { ok: false, message: "本題必須使用 if 條件判斷，不可硬編答案。" };
        }
        if (rules.requireLoop && !/\b(for|while)\b/.test(clean)) {
            return { ok: false, message: "本題必須使用 for 或 while 迴圈，不可硬編答案。" };
        }
        if (rules.requireDef && !/\bdef\b/.test(clean)) {
            return { ok: false, message: "本題必須定義 def 函式。" };
        }
        var printCount = (clean.match(/\bprint\s*\(/g) || []).length;
        var hasLogic = /\b(if|for|while|def)\b/.test(clean);
        if (printCount >= 3 && !hasLogic) {
            return { ok: false, message: "不可連續 print 多個答案；請用邏輯（if / 迴圈 / 函式）依輸入計算結果。" };
        }
        return { ok: true };
    }

    function getBuiltinFilesMap() {
        if (!global.Sk || !global.Sk.builtinFiles) return null;
        return global.Sk.builtinFiles.files || global.Sk.builtinFiles["files"] || null;
    }

    function skulptReady() {
        return typeof global.Sk !== "undefined"
            && typeof global.Sk.importMainWithBody === "function"
            && !!getBuiltinFilesMap();
    }

    function waitForSkulpt(maxMs) {
        maxMs = maxMs || 15000;
        return new Promise(function (resolve, reject) {
            var start = Date.now();
            var loaderTried = false;

            function done() {
                if (global.DiscordPyMock && global.DiscordPyMock.inject) {
                    global.DiscordPyMock.inject();
                }
                resolve(true);
            }

            function fail(msg) {
                reject(new Error(msg));
            }

            function tick() {
                if (skulptReady()) {
                    done();
                    return;
                }
                var elapsed = Date.now() - start;
                if (elapsed >= maxMs) {
                    fail("Skulpt 引擎載入逾時。請確認 skulpt.min.js 與 skulpt-stdlib.js 在根目錄且可開啟。");
                    return;
                }
                if (!loaderTried && elapsed > 400 && global.DoratchSkulptLoader) {
                    loaderTried = true;
                    global.DoratchSkulptLoader.load(maxMs - elapsed).then(function () {
                        tick();
                    }).catch(function (e) {
                        fail(e.message || String(e));
                    });
                    return;
                }
                setTimeout(tick, 40);
            }
            tick();
        });
    }

    function formatSkulptError(e) {
        try {
            if (global.Sk.err && global.Sk.err.printExc) {
                return String(global.Sk.err.printExc(e) || e);
            }
        } catch (_) { /* ignore */ }
        return String(e && e.message ? e.message : e);
    }

    function runSkulpt(code, options) {
        options = options || {};
        var stdinLines = options.stdin || options.stdinLines || [];
        var io = options.io || null;

        var userLineCount = 0;
        if (global.SkulptCompat && global.SkulptCompat.isDiscordPyCode(code)) {
            userLineCount = String(code || "").split("\n").length;
            code = global.SkulptCompat.preprocessForSkulpt(code);
            if (global.DiscordPyMock) global.DiscordPyMock.inject();
        }

        return new Promise(function (resolve) {
            if (!skulptReady()) {
                resolve({ output: "", error: "Python 引擎未載入，請重新整理頁面" });
                return;
            }

            var output = "";
            var inputIdx = 0;

            function outf(text) {
                output += text;
                if (io && io.onWrite) io.onWrite(text);
            }

            function builtinRead(x) {
                var files = getBuiltinFilesMap();
                if (!files || !files[x]) {
                    throw new Error("File not found: " + x);
                }
                return files[x];
            }

            global.Sk.configure({
                output: outf,
                read: builtinRead,
                inputfun: function (prompt) {
                    var p = prompt != null ? String(prompt) : "";
                    if (io && io.onInput) {
                        return Promise.resolve(io.onInput(p));
                    }
                    var v = inputIdx < stdinLines.length ? String(stdinLines[inputIdx]) : "";
                    inputIdx += 1;
                    return Promise.resolve(v);
                },
                inputfunTakesPrompt: true,
                python3: true,
                __future__: global.Sk.python3
            });

            global.Sk.misceval.asyncToPromise(function () {
                return global.Sk.importMainWithBody("<stdin>", false, code, true);
            }).then(
                function () {
                    resolve({
                        output: output,
                        error: null,
                        inputUsed: inputIdx,
                        inputExpected: stdinLines.length
                    });
                },
                function (e) {
                    var msg = formatSkulptError(e);
                    if (userLineCount && global.SkulptCompat && global.SkulptCompat.remapErrorLines) {
                        msg = global.SkulptCompat.remapErrorLines(msg, userLineCount);
                    }
                    resolve({
                        output: output,
                        error: msg,
                        inputUsed: inputIdx,
                        inputExpected: stdinLines.length
                    });
                }
            );
        });
    }

    function runPythonInteractive(code, io) {
        return runSkulpt(code, { io: io });
    }

    function compareOutput(got, want) {
        return normalizeOutput(got) === normalizeOutput(want);
    }

    async function runTests(code, lessonOrTests, rules) {
        var tests = Array.isArray(lessonOrTests) ? lessonOrTests : (lessonOrTests.tests || []);
        rules = rules || (lessonOrTests && lessonOrTests.rules) || {};

        var validation = validateSubmission(code, rules);
        if (!validation.ok) {
            return {
                allPass: false,
                validationFailed: true,
                validationMessage: validation.message,
                results: []
            };
        }

        var results = [];
        var allPass = true;

        for (var i = 0; i < tests.length; i++) {
            var t = tests[i];
            var res = await runSkulpt(code, { stdin: t.stdin || [] });
            var got = normalizeOutput(res.output);
            var want = normalizeOutput(t.expected);
            var pass = false;

            if (res.error) {
                pass = false;
            } else if (t.stdin && t.stdin.length && res.inputUsed < t.stdin.length) {
                pass = false;
                res.error = "程式提早結束，input() 次數不足（需要 " + t.stdin.length + " 次）";
            } else {
                pass = compareOutput(got, want);
            }

            if (!pass) allPass = false;

            results.push({
                index: i + 1,
                label: t.label || ("測試 #" + (i + 1)),
                pass: pass,
                expected: want || "(空)",
                got: res.error ? "(執行錯誤) " + res.error : (got || "(空)"),
                stdin: (t.stdin || []).join(", ")
            });
        }

        return { allPass: allPass, validationFailed: false, results: results };
    }

    global.PythonEngine = {
        init: function (onStatus) {
            onStatus && onStatus("正在啟動 Python 引擎…");
            return waitForSkulpt(20000).then(function () {
                onStatus && onStatus("Python 已就緒 · 請自行撰寫程式");
                return true;
            });
        },
        waitForSkulpt: waitForSkulpt,
        isReady: skulptReady,
        runPython: function (code, stdinLines) {
            return runSkulpt(code, { stdin: stdinLines || [] });
        },
        runPythonInteractive: runPythonInteractive,
        runTests: runTests,
        validateSubmission: validateSubmission,
        normalizeOutput: normalizeOutput
    };
})(typeof window !== "undefined" ? window : globalThis);

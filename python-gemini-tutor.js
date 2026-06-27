/**
 * Python 學習 — Gemini 問答助教
 * backend: gas（免費，Google Apps Script）| firebase（需 Blaze）| 未啟用則離線
 */
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const REGION = "asia-east1";
const FN_NAME = "pythonTutorGemini";

let connected = false;
let backendMode = "local";

function setBadge(mode, label) {
    var el = document.querySelector(".tutor-qa-badge");
    if (!el) return;
    if (mode === "gemini") {
        el.textContent = label || "Gemini · 引導模式";
        el.style.background = "#dbeafe";
        el.style.color = "#1d4ed8";
    } else {
        el.textContent = "離線助教 · 引導模式";
        el.style.background = "#ede9fe";
        el.style.color = "#6d28d9";
    }
}

function setDescNote(text) {
    var el = document.querySelector(".tutor-qa-desc");
    if (el && text) el.textContent = text;
}

function buildPayload(question, ctx, history) {
    var lesson = (ctx && ctx.lesson) || {};
    var analysis = ctx && ctx.analysis;
    var failed = analysis && analysis.checks
        ? analysis.checks.filter(function (c) { return !c.pass; }).map(function (c) { return c.text; })
        : [];
    var hist = (history || []).slice(-8);
    if (hist.length && hist[hist.length - 1].role === "user") {
        hist = hist.slice(0, -1);
    }
    return {
        question: question,
        lessonId: lesson.id || "",
        lessonTitle: lesson.title || "",
        lessonSummary: lesson.summary || "",
        goals: lesson.goals || [],
        codeSnippet: String((ctx && ctx.code) || "").slice(0, 4500),
        lastError: String((ctx && ctx.lastError) || "").slice(0, 500),
        analysisFailed: failed,
        history: hist.map(function (m) {
            return { role: m.role, content: m.content };
        })
    };
}

function normalizeTutorModel(name) {
    var aliases = {
        "gemini-2.0-flash-lite": "gemini-2.5-flash-lite",
        "gemini-2.0-flash": "gemini-2.5-flash",
        "gemini-1.5-flash": "gemini-2.5-flash-lite",
        "gemini-1.5-pro": "gemini-2.5-flash"
    };
    var m = String(name || "").trim();
    return aliases[m] || m || "gemini-2.5-flash-lite";
}

function friendlyGeminiError(json, rawMsg) {
    var msg = rawMsg || (json && json.error) || "GAS 代理錯誤";
    if (/high demand|try again later|overloaded|temporarily unavailable/i.test(msg)) {
        return "Gemini 目前流量較高（暫時性），請等 1～3 分鐘後再試。若持續失敗，請確認 GAS 代理已部署最新版腳本。";
    }
    if (/not found|not supported/i.test(msg)) {
        return "Gemini 模型已下架或名稱錯誤。請在 admin 改為 gemini-2.5-flash-lite，並重新部署 GAS 代理。";
    }
    if (json && json.quotaExceeded) {
        return "Gemini 配額已用盡或該模型無免費額度。請稍後再試，或在管理後台改為 gemini-2.5-flash-lite，並至 Google AI Studio 查看 API 用量。";
    }
    if (/quota|exceeded|limit:\s*0|resource exhausted/i.test(msg)) {
        return "Gemini 配額不足。請稍後再試，或在管理後台改為 gemini-2.5-flash-lite。";
    }
    if (/rate limit|429|too many requests/i.test(msg)) {
        return "請求過於頻繁，請稍候數分鐘後再試。";
    }
    return msg;
}

async function callGasProxy(proxyUrl, payload, model) {
    var url = String(proxyUrl || "").trim();
    if (!url || url.indexOf("script.google.com") < 0) {
        throw new Error("未設定有效的 Google Apps Script 代理 URL");
    }
    payload.model = normalizeTutorModel(model);
    var res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    });
    var json = await res.json();
    if (!json.ok) {
        var err = new Error(friendlyGeminiError(json, json.error));
        err.quotaExceeded = !!json.quotaExceeded;
        err.gasHint = json.hint || "";
        throw err;
    }
    return json;
}

async function callFirebaseCallable(callable, payload) {
    var res = await callable(payload);
    return res.data || {};
}

function attachRemoteHandler(handler, cfg) {
    window.PythonTutorQA.setRemoteHandler(async function (question, ctx, history) {
        var payload = buildPayload(question, ctx, history);
        try {
            var data = await handler(payload);
            return {
                text: data.text || "（Gemini 無回覆）",
                chips: ["我卡住了", "為什麼錯？"]
            };
        } catch (err) {
            var msg = err && err.message ? String(err.message) : "連線失敗";
            var local = await window.PythonTutorQA.answerLocal(question, ctx);
            var suffix = "⚠️ 雲端助教暫不可用（" + msg + "），以上為離線回覆。";
            if (err && err.gasHint) {
                suffix += "\n\n" + err.gasHint;
            }
            return {
                text: local.text + "\n\n" + suffix,
                chips: local.chips
            };
        }
    });
    connected = true;
    backendMode = cfg.backend || "gas";
    var badge = backendMode === "gas"
        ? "Gemini · GAS 免費 · " + (cfg.model || "AI")
        : "Gemini · " + (cfg.model || "AI");
    setBadge("gemini", badge + " · 引導模式");
    setDescNote(
        backendMode === "gas"
            ? "已啟用 Gemini（Google 試算表代理，免 Blaze）。引導模式，不直接給完整答案。"
            : "已啟用 Gemini（Firebase 雲端）。引導模式，不直接給完整答案。"
    );
}

export async function initPythonGeminiTutor(app, db) {
    if (!db || !window.PythonTutorQA) return false;

    try {
        var snap = await getDoc(doc(db, "system_config", "python_tutor"));
        var cfg = snap.exists() ? snap.data() : {};
        if (!cfg.enabled) {
            setBadge("local");
            setDescNote("離線規則助教：可問語法、除錯與本關目標。若要 Gemini AI，請在 admin 啟用並選「GAS 免費」後端。");
            return false;
        }

        var backend = String(cfg.backend || "gas").trim();
        var model = normalizeTutorModel(cfg.model);

        if (backend === "gas") {
            var proxyUrl = cfg.gasProxyUrl || "";
            attachRemoteHandler(function (payload) {
                return callGasProxy(proxyUrl, payload, model);
            }, { backend: "gas", model: model });
            return true;
        }

        if (backend === "firebase") {
            if (!app) throw new Error("Firebase app 未初始化");
            var functions = getFunctions(app, REGION);
            var callable = httpsCallable(functions, FN_NAME, { timeout: 55000 });
            attachRemoteHandler(function (payload) {
                return callFirebaseCallable(callable, payload);
            }, { backend: "firebase", model: model });
            return true;
        }

        setBadge("local");
        return false;
    } catch (e) {
        console.warn("Gemini tutor init failed:", e);
        setBadge("local");
        return false;
    }
}

export function isGeminiTutorConnected() {
    return connected;
}

export function getTutorBackendMode() {
    return backendMode;
}

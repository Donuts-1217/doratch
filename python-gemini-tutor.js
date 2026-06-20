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

async function callGasProxy(proxyUrl, payload, model) {
    var url = String(proxyUrl || "").trim();
    if (!url || url.indexOf("script.google.com") < 0) {
        throw new Error("未設定有效的 Google Apps Script 代理 URL");
    }
    payload.model = model || "gemini-2.0-flash";
    var res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    });
    var json = await res.json();
    if (!json.ok) {
        throw new Error(json.error || "GAS 代理錯誤");
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
            return {
                text: local.text + "\n\n⚠️ 雲端助教暫不可用（" + msg + "），以上為離線回覆。",
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
        var model = cfg.model || "gemini-2.0-flash";

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

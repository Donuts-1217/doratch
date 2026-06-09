import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const firebaseConfig = {
    apiKey: "AIzaSyDwRdQFgQVn5Un8Od2nP4u5EbMx-dMOYoU",
    authDomain: "chat-52c0d.firebaseapp.com",
    projectId: "chat-52c0d",
    storageBucket: "chat-52c0d.firebasestorage.app",
    appId: "1:449329325475:web:75f255c4055360dc9e6616"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function toMillis(v) {
    if (!v) return 0;
    if (typeof v === "number") return v;
    if (v.toMillis) return v.toMillis();
    if (v.seconds) return v.seconds * 1000;
    return 0;
}

export function requireLogin(cb) {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            location.href = "login.html";
            return;
        }
        try {
            await ensureUserDoc(user.uid, user.email);
            await cb(user);
        } catch (e) {
            console.error(e);
            alert("載入失敗：" + (e.message || "請重新整理"));
        }
    });
}

export async function ensureUserDoc(uid, email) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await setDoc(ref, {
            email: email || "",
            coins: 100,
            xp: 0,
            lv: 1,
            createdAt: serverTimestamp()
        });
    }
}

export async function loadGameDoc(uid, collectionName) {
    const ref = doc(db, "users", uid, collectionName, "profile");
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
}

function stripForFirestore(obj) {
    if (obj == null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(stripForFirestore);
    const out = {};
    Object.keys(obj).forEach((k) => {
        if (obj[k] !== undefined) out[k] = stripForFirestore(obj[k]);
    });
    return out;
}

export async function saveGameDoc(uid, collectionName, patch, coinReward = 0) {
    const ref = doc(db, "users", uid, collectionName, "profile");
    const clean = stripForFirestore({ ...patch, updatedAt: serverTimestamp() });
    await setDoc(ref, clean, { merge: true });
    if (coinReward > 0) await awardCoins(uid, coinReward);
}

export async function awardCoins(uid, amount) {
    if (!amount || amount <= 0) return;
    await ensureUserDoc(uid, auth.currentUser?.email || "");
    await updateDoc(doc(db, "users", uid), { coins: increment(Math.floor(amount)) });
}

export async function getUserCoins(uid) {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data().coins || 0 : 0;
}

export function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

export async function refreshCoinLabel(uid, elId) {
    const el = document.getElementById(elId);
    if (el) el.textContent = "💰 " + (await getUserCoins(uid));
}

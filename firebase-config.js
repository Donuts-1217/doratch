// 1. 從網址引入所有需要的組件 (不要混用兩種引入方式)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. 你的 Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyDwRdQFgQVn5Un8Od2nP4u5EbMx-dMOYoU",
  authDomain: "chat-52c0d.firebaseapp.com",
  projectId: "chat-52c0d",
  storageBucket: "chat-52c0d.firebasestorage.app",
  messagingSenderId: "449329325475",
  appId: "1:449329325475:web:75f255c4055360dc9e6616",
  measurementId: "G-8R8648H53V"
};

// 3. 初始化並匯出 (Export)
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider(); // 這次有從上面 import 了，不會報錯
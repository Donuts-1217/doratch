/**
 * Doratch 手機 App — 底部導覽、PWA、App 模式連結保留
 */
(function (global) {
    function isMobileDevice() {
        if (global.matchMedia && global.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches) {
            return false;
        }
        var ua = /Android|webOS|iPhone|iPod|IEMobile|Opera Mini|Mobile/i.test(global.navigator.userAgent || "");
        var touch = global.matchMedia && global.matchMedia("(max-width: 900px) and (hover: none) and (pointer: coarse)").matches;
        return ua || touch;
    }

    function postLoginDestination(opts) {
        opts = opts || {};
        if (!isMobileDevice()) {
            if (opts.needDisplayName) return "profile.html?needDisplayName=1";
            return opts.fallback || "main.html";
        }
        try { global.localStorage.setItem("doratchAppMode", "1"); } catch (_) {}
        if (opts.needDisplayName) return "profile.html?needDisplayName=1&app=1";
        return "app.html?app=1";
    }

    function maybeMobileEntryRedirect() {
        var qs = new global.URLSearchParams(global.location.search);
        if (qs.get("site") === "1") return;
        var file = (global.location.pathname.split("/").pop() || "index.html").split("?")[0];
        if ((file === "index.html" || file === "main.html") && isMobileDevice()) {
            global.location.replace("app.html?app=1");
        }
    }

    global.DoratchDevice = {
        isMobileDevice: isMobileDevice,
        postLoginDestination: postLoginDestination
    };

    maybeMobileEntryRedirect();
})(window);

(function () {
    const PAGE_KEYS = {
        "app.html": "home",
        "chat.html": "chat",
        "shop.html": "shop",
        "game.html": "game",
        "game-survival.html": "game",
        "game-clicker.html": "game",
        "game-rpg.html": "game",
        "game-cards.html": "game",
        "game-pet.html": "game",
        "game-mine.html": "game",
        "profile.html": "profile",
        "admin.html": "admin"
    };

    const TABS = [
        { key: "home", href: "app.html", icon: "🏠", label: "首頁" },
        { key: "chat", href: "chat.html", icon: "💬", label: "聊天" },
        { key: "shop", href: "shop.html", icon: "🛍️", label: "商城" },
        { key: "game", href: "game.html", icon: "🎮", label: "遊戲" },
        { key: "profile", href: "profile.html", icon: "👤", label: "我的" },
        { key: "admin", href: "admin.html", icon: "🛠️", label: "管理", adminOnly: true }
    ];

    function currentFile() {
        return (location.pathname.split("/").pop() || "index.html").split("?")[0];
    }

    function pageKey() {
        return PAGE_KEYS[currentFile()] || "";
    }

    function isStandalone() {
        return window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
    }

    function clearAppModeState() {
        try { localStorage.removeItem("doratchAppMode"); } catch (_) {}
        document.body.classList.remove("doratch-app-mode", "doratch-app-force", "chat-app");
        var bar = document.getElementById("doratch-mobile-tabbar");
        if (bar) bar.remove();
    }

    function isAppMode() {
        const qs = new URLSearchParams(location.search);
        const file = currentFile();
        const mobile = window.DoratchDevice && window.DoratchDevice.isMobileDevice();

        // 明確離開 App：完整網站
        if (qs.get("site") === "1" || qs.get("app") === "0" || file === "index.html") {
            clearAppModeState();
            return false;
        }

        // 桌面版一律走完整網站，不因 localStorage 或 ?app=1 進入手機殼層
        if (!mobile) {
            clearAppModeState();
            return false;
        }

        if (qs.get("app") === "1") {
            try { localStorage.setItem("doratchAppMode", "1"); } catch (_) {}
            return true;
        }
        if (isStandalone()) return !!pageKey();
        try {
            if (localStorage.getItem("doratchAppMode") === "1" && pageKey()) return true;
        } catch (_) {}
        return false;
    }

    function siteHref(href) {
        if (!href || href.indexOf("#") === 0) return href;
        if (/^https?:\/\//i.test(href)) return href;
        try {
            const url = new URL(href, location.href);
            const file = url.pathname.split("/").pop() || "";
            if (file === "index.html" || href === "index.html" || href.startsWith("index.html")) {
                url.searchParams.set("site", "1");
                url.searchParams.delete("app");
                return url.pathname.split("/").pop() + url.search + url.hash;
            }
        } catch (_) {}
        return href;
    }

    function withApp(href) {
        if (!href || href.indexOf("#") === 0) return href;
        if (/^https?:\/\//i.test(href)) return href;
        try {
            const url = new URL(href, location.href);
            if (PAGE_KEYS[url.pathname.split("/").pop() || ""]) {
                url.searchParams.set("app", "1");
            }
            return url.pathname.split("/").pop() + url.search + url.hash;
        } catch (_) {
            return href;
        }
    }

    function patchLinks(root) {
        if (!root) return;
        root.querySelectorAll("a[href]").forEach(function (a) {
            const href = a.getAttribute("href");
            if (!href || href.startsWith("#") || /^https?:\/\//i.test(href)) return;
            const file = href.split("?")[0].split("/").pop();
            if (file === "index.html") {
                a.setAttribute("href", siteHref(href));
                return;
            }
            if (PAGE_KEYS[file]) a.setAttribute("href", withApp(href));
        });
    }

    function shouldShowAdminTab() {
        if (pageKey() === "admin") return true;
        const link = document.getElementById("admin-link-main");
        if (!link) return false;
        const st = window.getComputedStyle(link);
        return st.display !== "none" && st.visibility !== "hidden";
    }

    function renderTabbar(activeKey) {
        if (document.getElementById("doratch-mobile-tabbar")) return;
        const bar = document.createElement("nav");
        bar.id = "doratch-mobile-tabbar";
        bar.className = "doratch-mobile-tabbar";
        bar.setAttribute("aria-label", "手機導覽");

        TABS.forEach(function (tab) {
            if (tab.adminOnly && !shouldShowAdminTab()) return;
            const a = document.createElement("a");
            a.className = "doratch-mobile-tab" + (tab.key === activeKey ? " active" : "");
            a.href = withApp(tab.href);
            a.setAttribute("data-key", tab.key);
            a.innerHTML = '<span class="tab-icon">' + tab.icon + '</span><span>' + tab.label + "</span>";
            bar.appendChild(a);
        });

        document.body.appendChild(bar);
    }

    function syncAdminTab() {
        const bar = document.getElementById("doratch-mobile-tabbar");
        if (!bar) return;
        const show = shouldShowAdminTab();
        const existing = bar.querySelector('[data-key="admin"]');
        if (show && !existing) {
            const tab = TABS.find(function (t) { return t.key === "admin"; });
            if (!tab) return;
            const a = document.createElement("a");
            a.className = "doratch-mobile-tab" + (pageKey() === "admin" ? " active" : "");
            a.href = withApp(tab.href);
            a.setAttribute("data-key", "admin");
            a.innerHTML = '<span class="tab-icon">' + tab.icon + '</span><span>' + tab.label + "</span>";
            bar.appendChild(a);
        } else if (!show && existing) {
            existing.remove();
        }
    }

    function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) return;
        navigator.serviceWorker.register("./sw.js").catch(function () {});
    }

    function setupInstallBanner() {
        if (isStandalone() || isAppMode()) return;
        let deferredPrompt = null;
        window.addEventListener("beforeinstallprompt", function (e) {
            e.preventDefault();
            deferredPrompt = e;
            const banner = document.getElementById("doratch-mobile-install-banner");
            if (banner) banner.style.display = "flex";
        });

        const banner = document.createElement("div");
        banner.id = "doratch-mobile-install-banner";
        banner.className = "doratch-mobile-install-banner";
        banner.innerHTML = '<span>📱 安裝 Doratch 到手機主畫面</span>';
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "安裝";
        btn.onclick = function () {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.finally(function () {
                    deferredPrompt = null;
                    banner.style.display = "none";
                });
                return;
            }
            location.href = withApp("app.html");
        };
        const close = document.createElement("button");
        close.type = "button";
        close.textContent = "稍後";
        close.onclick = function () { banner.style.display = "none"; };
        banner.appendChild(btn);
        banner.appendChild(close);
        document.body.appendChild(banner);
    }

    function init() {
        const file = currentFile();
        if (file === "index.html") {
            clearAppModeState();
            return;
        }

        const key = pageKey();
        if (!key && !isAppMode()) return;

        if (isAppMode()) {
            document.body.classList.add("doratch-app-mode");
            if (key === "chat") document.body.classList.add("chat-app");
            renderTabbar(key);
            patchLinks(document.body);
            registerServiceWorker();

            const obs = new MutationObserver(function () {
                syncAdminTab();
                patchLinks(document.body);
            });
            obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] });
            setTimeout(syncAdminTab, 400);
            setTimeout(syncAdminTab, 1500);
        }

        setupInstallBanner();
    }

    window.DoratchMobile = {
        isAppMode: isAppMode,
        isMobileDevice: function () { return window.DoratchDevice && window.DoratchDevice.isMobileDevice(); },
        postLoginDestination: function (opts) { return window.DoratchDevice && window.DoratchDevice.postLoginDestination(opts); },
        withApp: withApp,
        siteHref: siteHref,
        clearAppMode: clearAppModeState,
        go: function (href) { location.href = withApp(href); },
        goSite: function (href) { location.href = siteHref(href || "index.html"); }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

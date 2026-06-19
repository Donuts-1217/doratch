/**
 * Doratch 手機 App — 底部導覽、PWA、App 模式連結保留
 */
(function () {
    const PAGE_KEYS = {
        "app.html": "home",
        "index.html": "home",
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

    function isAppMode() {
        const qs = new URLSearchParams(location.search);
        if (qs.get("app") === "1") {
            try { localStorage.setItem("doratchAppMode", "1"); } catch (_) {}
            return true;
        }
        if (pageKey()) {
            try {
                if (localStorage.getItem("doratchAppMode") === "1") return true;
            } catch (_) {}
        }
        if (isStandalone()) return true;
        if (window.innerWidth <= 900 && pageKey()) return true;
        return false;
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
        const key = pageKey();
        if (!key && !isAppMode()) return;

        if (isAppMode()) {
            document.body.classList.add("doratch-app-mode");
            if (key === "chat") document.body.classList.add("chat-app");
            if (window.innerWidth > 900 && new URLSearchParams(location.search).get("app") === "1") {
                document.body.classList.add("doratch-app-force");
            }
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
        withApp: withApp,
        go: function (href) { location.href = withApp(href); }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

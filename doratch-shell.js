/**
 * Doratch 全站導覽 — 側欄只顯示六大類別（班級 / 學習 / 挑戰 / 遊戲 / 其他 / 管理）
 */
(function () {
    if (typeof window.handleLogout !== "function") {
        window.handleLogout = function () {
            location.href = "index.html";
        };
    }

    const HOME_LINK = { key: "index", href: "index.html", label: "🏠 平台首頁", pages: ["index"] };
    /** 側欄主類別：點擊展開右拉選單 */
    const CATEGORIES = [
        {
            key: "class",
            label: "🏫 班級",
            pages: ["dashboard", "profile"],
            items: [
                { href: "dashboard.html", label: "我的班級", pages: ["dashboard"] },
                { href: "profile.html", label: "個人檔案", pages: ["profile"] }
            ]
        },
        {
            key: "learn",
            label: "🐍 學習",
            pages: ["python", "create", "projects", "main", "lab"],
            items: [
                { href: "python.html", label: "Python 學習", pages: ["python"] },
                { href: "create.html", label: "創作空間", pages: ["create"] },
                { href: "projects.html", label: "我的作品", pages: ["projects"] },
                { href: "main.html", label: "探索中心", pages: ["main"] },
                { href: "lab.html", label: "指令實驗室", pages: ["lab"] }
            ]
        },
        {
            key: "challenge",
            label: "🎯 挑戰",
            pages: ["challenge_zone"],
            items: [{ href: "challenge_zone.html", label: "挑戰區", pages: ["challenge_zone"] }]
        },
        {
            key: "game",
            label: "🎮 遊戲",
            pages: ["game", "game_survival", "game_clicker", "game_rpg", "game_cards", "game_pet", "game_mine"],
            items: [
                { href: "game.html", label: "遊戲中心", pages: ["game"] },
                { href: "game-survival.html", label: "異界生存", pages: ["game_survival"] },
                { href: "game-clicker.html", label: "點擊放置", pages: ["game_clicker"] },
                { href: "game-rpg.html", label: "RPG 探索", pages: ["game_rpg"] },
                { href: "game-cards.html", label: "卡牌對戰", pages: ["game_cards"] },
                { href: "game-pet.html", label: "寵物養成", pages: ["game_pet"] },
                { href: "game-mine.html", label: "採礦經營", pages: ["game_mine"] }
            ]
        },
        {
            key: "other",
            label: "📦 其他",
            pages: ["shop", "topup", "chat", "support"],
            items: [
                { href: "shop.html", label: "創意商城", pages: ["shop"] },
                { href: "topup.html", label: "儲值中心", pages: ["topup"] },
                { href: "chat.html", label: "交流大廳", pages: ["chat"] },
                { href: "support.html", label: "客服中心", pages: ["support"] }
            ]
        },
        {
            key: "admin",
            label: "🛠️ 管理",
            pages: ["admin"],
            id: "admin-link-main",
            adminOnly: true,
            items: [{ href: "admin.html", label: "管理面板", pages: ["admin"] }]
        }
    ];

    const TOP_LINKS = [
        { href: "index.html", label: "首頁" },
        { href: "dashboard.html", label: "班級" },
        { href: "python.html", label: "學習" },
        { href: "challenge_zone.html", label: "挑戰" },
        { href: "game.html", label: "遊戲" },
        { href: "chat.html", label: "其他" },
        { href: "admin.html", label: "管理" }
    ];

    const PAGE_ACTIVE = {
        "index.html": "index",
        "dashboard.html": "dashboard",
        "profile.html": "profile",
        "class_view.html": "dashboard",
        "python.html": "python",
        "create.html": "create",
        "page.html": "create",
        "python-studio.html": "create",
        "projects.html": "projects",
        "project.html": "projects",
        "main.html": "main",
        "lab.html": "lab",
        "challenge_zone.html": "challenge_zone",
        "game.html": "game",
        "game-survival.html": "game_survival",
        "game-clicker.html": "game_clicker",
        "game-rpg.html": "game_rpg",
        "game-cards.html": "game_cards",
        "game-pet.html": "game_pet",
        "game-mine.html": "game_mine",
        "shop.html": "shop",
        "topup.html": "topup",
        "chat.html": "chat",
        "support.html": "support",
        "admin.html": "admin",
        "login.html": "index"
    };

    window.DORATCH_BRAND = "doratch";

    function pageActiveKey() {
        const file = (location.pathname.split("/").pop() || "index.html").split("?")[0];
        return PAGE_ACTIVE[file] || "";
    }

    function categoryForPage(pageKey) {
        if (!pageKey) return "";
        for (var i = 0; i < CATEGORIES.length; i++) {
            var cat = CATEGORIES[i];
            if (cat.pages && cat.pages.indexOf(pageKey) !== -1) return cat.key;
        }
        return "";
    }

    function resolveActiveCategory(rawPageKey) {
        return categoryForPage(String(rawPageKey || pageActiveKey()).trim());
    }

    function isItemActive(item, pageKey) {
        return Array.isArray(item.pages) && item.pages.indexOf(pageKey) !== -1;
    }

    function renderSidebarLinks(activePageKey, includeBrand, skipAdmin) {
        const activeCat = resolveActiveCategory(activePageKey);
        const pageKey = String(activePageKey || pageActiveKey()).trim();
        let html = "";
        if (includeBrand) {
            html +=
                '<div class="sidebar-logo doratch-brand-logo" role="button" tabindex="0" onclick="location.href=\'index.html\'">' +
                window.DORATCH_BRAND +
                '<span>logic &amp; blocks</span></div>';
        }
        html +=
            '<a href="' + HOME_LINK.href + '" class="nav-item nav-item--category' + (pageKey === "index" ? " active" : "") + '">' +
            HOME_LINK.label +
            "</a>";
        CATEGORIES.forEach(function (cat) {
            if (skipAdmin && cat.adminOnly) return;
            const isActiveCat = cat.key === activeCat;
            const open = false;
            const wrapCls = "doratch-nav-category" + (open ? " is-open" : "");
            const btnCls = "nav-item nav-item--category nav-item--toggle" + (isActiveCat ? " active" : "");
            const menuCls = "doratch-submenu" + (open ? " is-open" : "");
            const idAttr = cat.id ? ' id="' + cat.id + '"' : "";
            const styleAttr = cat.adminOnly ? ' style="display:none;color:#855CD6;"' : "";
            const submenu = (cat.items || []).map(function (item) {
                const itemCls = "doratch-submenu-item" + (isItemActive(item, pageKey) ? " active" : "");
                return '<a href="' + item.href + '" class="' + itemCls + '">' + item.label + "</a>";
            }).join("");
            html +=
                '<div class="' + wrapCls + '" data-nav-category="' + cat.key + '">' +
                '<button type="button" class="' + btnCls + '" data-nav-toggle="' + cat.key + '"' + idAttr + styleAttr + ' aria-expanded="' + (open ? "true" : "false") + '">' +
                '<span>' + cat.label + '</span><span class="doratch-caret">▸</span></button>' +
                '<div class="' + menuCls + '" data-nav-menu="' + cat.key + '">' + submenu + "</div>" +
                "</div>";
        });
        return html;
    }

    function bindSidebarMenus(aside) {
        const wraps = aside.querySelectorAll(".doratch-nav-category");
        if (!wraps.length) return;
        const desktopHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

        function placeMenu(btn, menu) {
            if (!btn || !menu) return;
            const rect = btn.getBoundingClientRect();
            menu.style.visibility = "hidden";
            menu.classList.add("is-open");
            const menuRect = menu.getBoundingClientRect();
            const maxLeft = window.innerWidth - menuRect.width - 10;
            const maxTop = window.innerHeight - menuRect.height - 10;
            const left = Math.max(8, Math.min(maxLeft, rect.right - 6));
            const top = Math.max(8, Math.min(maxTop, rect.top));
            menu.style.setProperty("--submenu-left", left + "px");
            menu.style.setProperty("--submenu-top", top + "px");
            menu.style.visibility = "";
        }

        function closeAll(exceptKey) {
            wraps.forEach(function (w) {
                const key = w.getAttribute("data-nav-category");
                const open = key === exceptKey;
                w.classList.toggle("is-open", open);
                const btn = w.querySelector("[data-nav-toggle]");
                const menu = w.querySelector("[data-nav-menu]");
                if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
                if (menu) {
                    menu.classList.toggle("is-open", open);
                    if (open) placeMenu(btn, menu);
                }
            });
        }

        wraps.forEach(function (w) {
            const key = w.getAttribute("data-nav-category");
            const btn = w.querySelector("[data-nav-toggle]");
            if (!btn) return;
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                const willOpen = !w.classList.contains("is-open");
                closeAll(willOpen ? key : "");
            });
            if (desktopHover) {
                w.addEventListener("mouseenter", function () {
                    closeAll(key);
                });
                w.addEventListener("mouseleave", function () {
                    closeAll("");
                });
            }
        });

        document.addEventListener("click", function (e) {
            if (!aside.contains(e.target)) closeAll("");
        });
        window.addEventListener("resize", function () {
            const openWrap = aside.querySelector(".doratch-nav-category.is-open");
            if (!openWrap) return;
            const btn = openWrap.querySelector("[data-nav-toggle]");
            const menu = openWrap.querySelector("[data-nav-menu]");
            placeMenu(btn, menu);
        });
    }

    function mountAppSidebars() {
        document.querySelectorAll(".sidebar-main").forEach(function (aside) {
            const footer = aside.querySelector(".sidebar-footer");
            const key = aside.getAttribute("data-doratch-active") || pageActiveKey();
            Array.from(aside.children).forEach(function (ch) {
                if (ch !== footer) ch.remove();
            });
            const host = document.createElement("div");
            host.className = "doratch-nav-host";
            if (footer) aside.insertBefore(host, footer);
            else aside.appendChild(host);
            host.innerHTML = renderSidebarLinks(key, true, false);
            bindSidebarMenus(aside);
        });
    }

    function mountAdminQuickNav() {
        if (document.querySelector('.sidebar-main[data-doratch-active="admin"]')) return;
        const sidebar = document.querySelector('.sidebar[data-doratch-active="admin"], .sidebar[data-doratch-admin-nav]');
        if (!sidebar) return;
        const panel = document.getElementById("admin-site-nav-panel");
        const oldQuick = sidebar.querySelector(".doratch-admin-quick-nav");
        if (oldQuick) oldQuick.remove();
        const wrap = document.createElement("div");
        wrap.className = "doratch-admin-quick-nav";
        wrap.innerHTML =
            '<div class="doratch-nav-section-label">全站導覽</div>' +
            renderSidebarLinks("admin", false, true);
        if (panel) {
            panel.innerHTML = "";
            panel.appendChild(wrap);
        } else {
            const footer = sidebar.querySelector(".sidebar-footer");
            if (footer) sidebar.insertBefore(wrap, footer);
            else sidebar.appendChild(wrap);
        }
        bindSidebarMenus(sidebar);
    }

    function mountTopNav() {
        document.querySelectorAll("[data-doratch-top-nav]").forEach(function (el) {
            const brand = el.querySelector(".doratch-top-brand, .logo, .nav-logo");
            if (brand) {
                brand.textContent = window.DORATCH_BRAND;
                brand.classList.add("doratch-top-brand");
                if (!brand.getAttribute("onclick")) {
                    brand.onclick = function () { location.href = "index.html"; };
                }
            }
            const linksHost = el.querySelector(".doratch-top-links-host");
            if (linksHost) {
                linksHost.innerHTML = TOP_LINKS.map(function (l) {
                    return '<a href="' + l.href + '">' + l.label + "</a>";
                }).join("");
                linksHost.classList.add("doratch-top-links");
            }
        });
        document.querySelectorAll(".logo, .nav-logo, .sidebar-logo").forEach(function (el) {
            if (el.closest("[data-doratch-top-nav]")) return;
            if (el.classList.contains("doratch-brand-logo")) return;
            if (el.textContent.includes("Creative Blocks") || el.textContent.includes("🧩")) {
                el.textContent = window.DORATCH_BRAND;
                el.classList.add("doratch-brand-logo");
            }
        });
    }

    function bindProfileEntryShortcut() {
        document.querySelectorAll(".sidebar-footer .user-mini-card").forEach(function (card) {
            if (!card || card.dataset.profileShortcutBound === "1") return;
            card.dataset.profileShortcutBound = "1";
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
            card.title = "前往個人設定";
            card.addEventListener("click", function (e) {
                const target = e.target;
                if (target && typeof target.closest === "function" && target.closest("button")) return;
                location.href = "profile.html";
            });
            card.addEventListener("keydown", function (e) {
                if (e.key !== "Enter" && e.key !== " ") return;
                const target = e.target;
                if (target && typeof target.closest === "function" && target.closest("button")) return;
                e.preventDefault();
                location.href = "profile.html";
            });
        });
    }

    function applyRoleAdminEntry(rawRole, email) {
        const adminLink = document.getElementById("admin-link-main");
        if (!adminLink) return;
        const emailNorm = String(email || "").trim().toLowerCase();
        let role = String(rawRole || "student").trim().toLowerCase();
        if (emailNorm === "chianghansen0302@gmail.com") role = "admin";
        if (role === "admin") {
            adminLink.style.display = "flex";
            adminLink.innerText = "🛠️ 管理面板";
            return;
        }
        if (role === "support") {
            adminLink.style.display = "flex";
            adminLink.innerText = "🎧 客服後台";
            return;
        }
        if (role === "teacher") {
            adminLink.style.display = "flex";
            adminLink.innerText = "❓ 題庫管理";
            return;
        }
        adminLink.style.display = "none";
    }

    function rebrandDocument() {
        document.title = document.title.replace(/Creative Blocks(\s*Pro)?/gi, "Doratch");
        document.querySelectorAll('meta[name="description"]').forEach(function (m) {
            m.content = (m.content || "").replace(/Creative Blocks(\s*Pro)?/gi, "Doratch");
        });
    }

    function ensureSiteIcons() {
        if (document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')) return;
        var head = document.head;
        if (!head) return;
        [
            { rel: "icon", type: "image/png", href: "Doratch.png" },
            { rel: "apple-touch-icon", href: "Doratch.png" }
        ].forEach(function (spec) {
            var link = document.createElement("link");
            link.rel = spec.rel;
            if (spec.type) link.type = spec.type;
            link.href = spec.href;
            head.appendChild(link);
        });
    }

    function init() {
        ensureSiteIcons();
        rebrandDocument();
        mountAppSidebars();
        mountAdminQuickNav();
        mountTopNav();
        bindProfileEntryShortcut();
    }

    window.DoratchShell = Object.assign({}, window.DoratchShell || {}, {
        applyRoleAdminEntry: applyRoleAdminEntry
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

/**
 * Doratch 全站導覽與品牌
 * 自動接管 .sidebar-main（保留 .sidebar-footer），並更新頂部 logo。
 */
(function () {
    const NAV = [
        { key: "index", href: "index.html", label: "🏠 平台首頁", section: null },
        { key: "dashboard", href: "dashboard.html", label: "🏫 我的班級", section: null },
        { key: "_explore", section: "創作與探索" },
        { key: "challenge_zone", href: "challenge_zone.html", label: "🎯 挑戰區", section: "創作與探索" },
        { key: "page", href: "page.html", label: "🚀 創作空間", section: "創作與探索" },
        { key: "projects", href: "projects.html", label: "📂 我的作品", section: "創作與探索" },
        { key: "main", href: "main.html", label: "🌍 探索中心", section: "創作與探索" },
        { key: "_arena", section: "指令競技" },
        { key: "lab", href: "lab.html", label: "🧪 指令實驗室", section: "指令競技" },
        { key: "game", href: "game.html", label: "🎮 指令塔防", section: "指令競技" },
        { key: "shop", href: "shop.html", label: "🛒 創意商城", section: "指令競技" },
        { key: "chat", href: "chat.html", label: "💬 交流大廳", section: "指令競技" },
        { key: "admin", href: "admin.html", label: "🛠️ 管理面板", section: null, id: "admin-link-main", adminOnly: true }
    ];

    const TOP_LINKS = [
        { href: "index.html", label: "首頁" },
        { href: "dashboard.html", label: "班級" },
        { href: "challenge_zone.html", label: "挑戰區" },
        { href: "page.html", label: "創作" },
        { href: "main.html", label: "探索" },
        { href: "chat.html", label: "交流" },
        { href: "login.html", label: "登入" }
    ];

    const PAGE_ACTIVE = {
        "index.html": "index",
        "dashboard.html": "dashboard",
        "challenge_zone.html": "challenge_zone",
        "class_view.html": "dashboard",
        "page.html": "page",
        "projects.html": "projects",
        "main.html": "main",
        "project.html": "projects",
        "profile.html": "dashboard",
        "lab.html": "lab",
        "game.html": "game",
        "shop.html": "shop",
        "chat.html": "chat",
        "admin.html": "admin",
        "login.html": "index"
    };

    window.DORATCH_BRAND = "doratch";

    function pageActiveKey() {
        const file = (location.pathname.split("/").pop() || "index.html").split("?")[0];
        return PAGE_ACTIVE[file] || "";
    }

    function resolveActiveKey(raw) {
        const key = String(raw || pageActiveKey()).trim();
        if (key === "class_view" || key === "profile") return "dashboard";
        if (key === "project") return "projects";
        return key;
    }

    function renderSidebarLinks(activeKey, includeBrand, skipAdmin) {
        const active = resolveActiveKey(activeKey);
        let html = "";
        if (includeBrand) {
            html +=
                '<div class="sidebar-logo doratch-brand-logo" role="button" tabindex="0" onclick="location.href=\'index.html\'">' +
                window.DORATCH_BRAND +
                '<span>logic &amp; blocks</span></div>';
        }
        let lastSection = null;
        NAV.forEach((item) => {
            if (skipAdmin && item.adminOnly) return;
            if (!item.href) {
                if (item.section && item.section !== lastSection) {
                    html += '<div class="doratch-nav-section-label">' + item.section + "</div>";
                    lastSection = item.section;
                }
                return;
            }
            if (item.section && item.section !== lastSection) {
                html += '<div class="doratch-nav-section-label">' + item.section + "</div>";
                lastSection = item.section;
            }
            const cls = "nav-item" + (item.key === active ? " active" : "");
            const idAttr = item.id ? ' id="' + item.id + '"' : "";
            const styleAttr = item.adminOnly ? ' style="display:none;color:#855CD6;"' : "";
            html +=
                '<a href="' +
                item.href +
                '" class="' +
                cls +
                '"' +
                idAttr +
                styleAttr +
                ">" +
                item.label +
                "</a>";
        });
        return html;
    }

    function mountAppSidebars() {
        document.querySelectorAll(".sidebar-main").forEach((aside) => {
            const footer = aside.querySelector(".sidebar-footer");
            const key = aside.getAttribute("data-doratch-active") || pageActiveKey();
            Array.from(aside.children).forEach((ch) => {
                if (ch !== footer) ch.remove();
            });
            const host = document.createElement("div");
            host.className = "doratch-nav-host";
            if (footer) aside.insertBefore(host, footer);
            else aside.appendChild(host);
            host.innerHTML = renderSidebarLinks(key, true, false);
        });
    }

    function mountAdminQuickNav() {
        const sidebar = document.querySelector('.sidebar[data-doratch-active="admin"], .sidebar[data-doratch-admin-nav]');
        if (!sidebar) return;
        const footer = sidebar.querySelector(".sidebar-footer");
        const oldQuick = sidebar.querySelector(".doratch-admin-quick-nav");
        if (oldQuick) oldQuick.remove();
        const wrap = document.createElement("div");
        wrap.className = "doratch-admin-quick-nav";
        wrap.innerHTML =
            '<div class="doratch-nav-section-label" style="margin-top:12px;">全站導覽</div>' +
            renderSidebarLinks("admin", false, true);
        if (footer) sidebar.insertBefore(wrap, footer);
        else sidebar.appendChild(wrap);
    }

    function mountTopNav() {
        document.querySelectorAll("[data-doratch-top-nav]").forEach((el) => {
            const brand = el.querySelector(".doratch-top-brand, .logo, .nav-logo");
            if (brand) {
                brand.textContent = window.DORATCH_BRAND;
                brand.classList.add("doratch-top-brand");
                if (!brand.getAttribute("onclick")) {
                    brand.onclick = () => {
                        location.href = "index.html";
                    };
                }
            }
            const linksHost = el.querySelector(".doratch-top-links-host");
            if (linksHost) {
                linksHost.innerHTML = TOP_LINKS.map((l) => '<a href="' + l.href + '">' + l.label + "</a>").join("");
                linksHost.classList.add("doratch-top-links");
            }
        });
        document.querySelectorAll(".logo, .nav-logo, .sidebar-logo").forEach((el) => {
            if (el.closest("[data-doratch-top-nav]")) return;
            if (el.classList.contains("doratch-brand-logo")) return;
            if (el.textContent.includes("Creative Blocks") || el.textContent.includes("🧩")) {
                el.textContent = window.DORATCH_BRAND;
                el.classList.add("doratch-brand-logo");
            }
        });
    }

    function rebrandDocument() {
        document.title = document.title.replace(/Creative Blocks(\s*Pro)?/gi, "Doratch");
        document.querySelectorAll('meta[name="description"]').forEach((m) => {
            m.content = (m.content || "").replace(/Creative Blocks(\s*Pro)?/gi, "Doratch");
        });
    }

    function init() {
        rebrandDocument();
        mountAppSidebars();
        mountAdminQuickNav();
        mountTopNav();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

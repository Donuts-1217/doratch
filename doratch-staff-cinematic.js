/** 身份專屬全螢幕爆發 → 收回動畫（GitHub Pages classic script） */
(function (global) {
    "use strict";

    var lastBurstAt = 0;
    var MIN_INTERVAL_MS = 4500;

    function labelForRole(role) {
        if (role === "developer") return "⚡ 開發者";
        if (role === "admin") return "👑 管理員";
        return "";
    }

    function triggerStaffCinematic(role, anchorEl, opts) {
        if (role !== "developer" && role !== "admin") return false;
        opts = opts || {};
        var now = Date.now();
        if (!opts.force && now - lastBurstAt < MIN_INTERVAL_MS) return false;
        lastBurstAt = now;

        var soft = opts.soft !== false;
        var c = anchorCenter(anchorEl);
        var root = document.createElement("div");
        root.className = "staff-cinematic-root staff-cinematic-" + role + (soft ? " staff-cinematic-soft" : "");
        root.setAttribute("aria-hidden", "true");
        root.innerHTML =
            '<div class="staff-cinematic-vignette"></div>' +
            '<div class="staff-cinematic-burst"></div>' +
            (soft ? "" : '<div class="staff-cinematic-burst staff-cinematic-burst-2"></div>') +
            '<div class="staff-cinematic-ring"></div>' +
            '<div class="staff-cinematic-ring staff-cinematic-ring-2"></div>' +
            (soft ? "" : '<div class="staff-cinematic-ring staff-cinematic-ring-3"></div>') +
            (soft ? "" : '<div class="staff-cinematic-flash"></div>') +
            '<div class="staff-cinematic-label">' + labelForRole(role) + "</div>";
        root.style.setProperty("--cx", c.x + "%");
        root.style.setProperty("--cy", c.y + "%");
        root.style.setProperty("--tx", c.px + "px");
        root.style.setProperty("--ty", c.py + "px");
        document.body.appendChild(root);

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                root.classList.add("is-active");
            });
        });

        if (anchorEl && anchorEl.classList) {
            anchorEl.classList.add("staff-cinematic-anchor-hit");
            setTimeout(function () {
                anchorEl.classList.remove("staff-cinematic-anchor-hit");
            }, soft ? 2000 : 2600);
        }

        if (!soft) {
            document.body.classList.add("staff-cinematic-body-" + role);
            document.documentElement.classList.add("staff-cinematic-html-" + role);
            setTimeout(function () {
                document.body.classList.remove("staff-cinematic-body-" + role);
                document.documentElement.classList.remove("staff-cinematic-html-" + role);
            }, 2800);
        }

        var duration = soft ? 2000 : 2600;
        setTimeout(function () {
            root.classList.add("is-done");
            setTimeout(function () {
                if (root.parentNode) root.parentNode.removeChild(root);
            }, 500);
        }, duration);
        return true;
    }

    function anchorCenter(el) {
        if (!el || !el.getBoundingClientRect) {
            return { x: 50, y: 50, px: global.innerWidth / 2, py: global.innerHeight / 2 };
        }
        var r = el.getBoundingClientRect();
        return {
            x: ((r.left + r.width / 2) / global.innerWidth) * 100,
            y: ((r.top + r.height / 2) / global.innerHeight) * 100,
            px: r.left + r.width / 2,
            py: r.top + r.height / 2
        };
    }

    global.DoratchStaffCinematic = {
        trigger: triggerStaffCinematic,
        anchorCenter: anchorCenter
    };
})(typeof window !== "undefined" ? window : globalThis);

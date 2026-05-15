# -*- coding: utf-8 -*-
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ACTIVE = {
    "dashboard.html": "dashboard",
    "main.html": "main",
    "challenge_zone.html": "challenge_zone",
    "class_view.html": "class_view",
    "chat.html": "chat",
    "profile.html": "profile",
    "lab.html": "lab",
    "projects.html": "projects",
    "shop.html": "shop",
    "game.html": "game",
    "project.html": "project",
}

CSS_SNIP = '<link rel="stylesheet" href="responsive-global.css">'
CSS_BOTH = CSS_SNIP + '\n    <link rel="stylesheet" href="doratch-shell.css">'
JS_SNIP = '    <script src="doratch-shell.js" defer></script>\n</body>'


def inject_assets(text):
    if "responsive-global.css" in text and "doratch-shell.css" not in text:
        text = text.replace(CSS_SNIP, CSS_BOTH, 1)
    if "doratch-shell.js" not in text:
        text = text.replace("</body>", JS_SNIP, 1)
    return text


def rebrand(text):
    text = text.replace("Creative Blocks Pro", "Doratch")
    text = text.replace("Creative Blocks", "Doratch")
    text = text.replace("🧩 Doratch", "doratch")
    text = text.replace("🧩 Creative Blocks", "doratch")
    return text


for path in ROOT.glob("*.html"):
    text = path.read_text(encoding="utf-8")
    orig = text
    text = rebrand(text)

    if path.name in ACTIVE:
        key = ACTIVE[path.name]
        text = inject_assets(text)
        pat = re.compile(
            r'<aside class="sidebar-main">.*?(?=<div class="sidebar-footer">)',
            re.DOTALL,
        )
        repl = (
            f'<aside class="sidebar-main" data-doratch-active="{key}">\n'
            f'        <div class="doratch-nav-host"></div>\n\n        '
        )
        text, n = pat.subn(repl, text, count=1)
        if n == 0:
            print("no sidebar:", path.name)

    if path.name == "index.html":
        text = inject_assets(text)
        text = text.replace("<nav>", '<nav data-doratch-top-nav>', 1)
        if "doratch-top-links-host" not in text:
            text = text.replace(
                '<div class="nav-links" id="nav-actions">',
                '<div class="doratch-top-links-host"></div><div class="nav-links" id="nav-actions">',
                1,
            )

    if path.name == "page.html":
        text = inject_assets(text)
        text = text.replace("<nav>", '<nav data-doratch-top-nav>', 1)
        if "challenge_zone.html" not in text:
            text = text.replace(
                '<a href="dashboard.html" class="dropdown-item">🏫 我的班級</a>',
                '<a href="challenge_zone.html" class="dropdown-item">🎯 挑戰區</a>\n'
                '                <a href="dashboard.html" class="dropdown-item">🏫 我的班級</a>',
                1,
            )

    if path.name == "login.html":
        text = text.replace(
            'class="logo" onclick="location.href=\'index.html\'">doratch',
            'class="logo doratch-top-brand" onclick="location.href=\'index.html\'">doratch',
            1,
        )

    if path.name == "admin.html":
        text = text.replace("開發者中心 - Doratch Admin", "開發者中心 - Doratch", 1)
        text = inject_assets(text)
        text = text.replace(
            '<div class="sidebar">',
            '<div class="sidebar" data-doratch-active="admin">',
            1,
        )
        pat = re.compile(
            r'(<div style="margin: 20px 30px 10px; font-size: 11px; color: #475569; letter-spacing: 1px;">快速切換</div>\s*)'
            r'(<a href="index\.html".*?<a href="chat\.html"[^>]*>💬 交流大廳</a>\s*)',
            re.DOTALL,
        )
        if "doratch-nav-host" not in text:
            text, n = pat.subn(
                r'\1<div class="doratch-nav-host" data-doratch-nav-mode="links-only"></div>\n\n    ',
                text,
                count=1,
            )

    if text != orig:
        path.write_text(text, encoding="utf-8")
        print("updated", path.name)

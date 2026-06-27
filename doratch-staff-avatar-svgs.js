/** Staff-exclusive avatar SVG art — encoded as data URLs for offline / GitHub Pages */

function svgAvatarUrl(svg) {
    return "data:image/svg+xml," + encodeURIComponent(svg);
}

const STAFF_AVATAR_SVGS = {
    dev_overlord:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0a0a0f"/><stop offset="1" stop-color="#1e1b4b"/></linearGradient>' +
        '<linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>' +
        '<filter id="f"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
        '<rect width="128" height="128" rx="64" fill="url(#g)"/>' +
        '<g opacity=".12" stroke="#22d3ee" stroke-width=".6"><path d="M0 32h128M0 64h128M0 96h128M32 0v128M64 0v128M96 0v128"/></g>' +
        '<path d="M26 82 L38 50 L52 66 L64 34 L76 66 L90 50 L102 82Z" fill="none" stroke="url(#c)" stroke-width="3.2" filter="url(#f)"/>' +
        '<rect x="26" y="82" width="76" height="10" rx="2" fill="url(#c)" opacity=".35"/>' +
        '<circle cx="64" cy="56" r="9" fill="#22d3ee" opacity=".85"/><circle cx="64" cy="56" r="4" fill="#fff"/>' +
        '<path d="M44 98 L44 114 L52 114 L52 106 L60 106 L60 98 Z" fill="none" stroke="#22d3ee" stroke-width="2.2" filter="url(#f)"/>' +
        '<path d="M84 98 L84 114 L76 114 L76 106 L68 106 L68 98 Z" fill="none" stroke="#a78bfa" stroke-width="2.2" filter="url(#f)"/>' +
        '<path d="M58 108 L64 102 L70 108" fill="none" stroke="#67e8f9" stroke-width="1.8"/>' +
        '<circle cx="28" cy="28" r="2" fill="#a78bfa"/><circle cx="100" cy="24" r="1.5" fill="#22d3ee"/></svg>',
    dev_singularity:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">' +
        '<defs><radialGradient id="r"><stop offset="0%" stop-color="#000"/><stop offset="45%" stop-color="#1e1b4b"/><stop offset="72%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#020617"/></radialGradient>' +
        '<linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a78bfa"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>' +
        '<rect width="128" height="128" rx="64" fill="#020617"/>' +
        '<circle cx="64" cy="64" r="52" fill="url(#r)"/>' +
        '<ellipse cx="64" cy="64" rx="38" ry="13" fill="none" stroke="url(#a)" stroke-width="4" transform="rotate(-25 64 64)"/>' +
        '<ellipse cx="64" cy="64" rx="38" ry="13" fill="none" stroke="#a78bfa" stroke-width="2.2" opacity=".55" transform="rotate(35 64 64)"/>' +
        '<circle cx="64" cy="64" r="15" fill="#000"/><circle cx="64" cy="64" r="19" fill="none" stroke="#22d3ee" stroke-width="1.5" opacity=".7"/>' +
        '<circle cx="92" cy="42" r="2.5" fill="#22d3ee"/><circle cx="36" cy="84" r="2" fill="#c4b5fd"/>' +
        '<circle cx="98" cy="78" r="1.8" fill="#a78bfa"/><circle cx="42" cy="38" r="1.5" fill="#22d3ee" opacity=".8"/></svg>',
    admin_crown:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">' +
        '<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#450a0a"/><stop offset="1" stop-color="#1c1917"/></linearGradient>' +
        '<linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fde68a"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#d97706"/></linearGradient>' +
        '<filter id="gl"><feGaussianBlur stdDeviation="2.2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
        '<rect width="128" height="128" rx="64" fill="url(#bg)"/>' +
        '<g opacity=".22" fill="#fbbf24"><polygon points="64,6 68,38 60,38"/><polygon points="64,6 92,28 84,34"/><polygon points="64,6 36,28 44,34"/></g>' +
        '<path d="M22 86 L32 44 L48 68 L64 28 L80 68 L96 44 L106 86Z" fill="url(#gd)" stroke="#b45309" stroke-width="2.2" filter="url(#gl)"/>' +
        '<circle cx="64" cy="56" r="7" fill="#dc2626" stroke="#fbbf24" stroke-width="1.8"/>' +
        '<circle cx="38" cy="66" r="4.5" fill="#7c3aed" stroke="#fbbf24" stroke-width="1.2"/>' +
        '<circle cx="90" cy="66" r="4.5" fill="#7c3aed" stroke="#fbbf24" stroke-width="1.2"/>' +
        '<rect x="22" y="86" width="84" height="13" rx="3" fill="url(#gd)" stroke="#b45309" stroke-width="1.5"/></svg>',
    admin_judgment:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">' +
        '<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1c1917"/><stop offset="1" stop-color="#450a0a"/></linearGradient>' +
        '<linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs>' +
        '<rect width="128" height="128" rx="64" fill="url(#bg)"/>' +
        '<path d="M70 10 L54 54 L64 54 L46 118 L86 50 L72 50 L80 10Z" fill="#fbbf24" opacity=".88"/>' +
        '<line x1="64" y1="40" x2="64" y2="96" stroke="#fbbf24" stroke-width="3.2"/>' +
        '<line x1="26" y1="50" x2="102" y2="50" stroke="#fbbf24" stroke-width="2.8"/>' +
        '<path d="M26 50 Q26 74 26 86" fill="none" stroke="#fbbf24" stroke-width="2.2"/>' +
        '<path d="M102 50 Q102 74 102 86" fill="none" stroke="#fbbf24" stroke-width="2.2"/>' +
        '<ellipse cx="26" cy="90" rx="19" ry="7" fill="#dc2626" stroke="#fbbf24" stroke-width="1.6"/>' +
        '<ellipse cx="102" cy="90" rx="19" ry="7" fill="#fbbf24" opacity=".28" stroke="#fbbf24" stroke-width="1.6"/>' +
        '<rect x="52" y="102" width="24" height="9" rx="2" fill="#78716c" transform="rotate(-12 64 106)"/>' +
        '<rect x="56" y="88" width="16" height="18" rx="2.5" fill="url(#gd)" transform="rotate(-12 64 97)"/></svg>'
};

export const STAFF_AVATAR_URLS = {
    dev_overlord: svgAvatarUrl(STAFF_AVATAR_SVGS.dev_overlord),
    dev_singularity: svgAvatarUrl(STAFF_AVATAR_SVGS.dev_singularity),
    admin_crown: svgAvatarUrl(STAFF_AVATAR_SVGS.admin_crown),
    admin_judgment: svgAvatarUrl(STAFF_AVATAR_SVGS.admin_judgment)
};

export function resolveAvatarUrl(url, size) {
    if (!url) return url;
    if (String(url).startsWith("data:")) return url;
    return url + (size ? "&size=" + size : "");
}

/**
 * Doratch：異界生存 — Vampire Survivors 風格 Canvas 遊戲
 */
export function createSurvivalGame(canvas, hooks = {}) {
    const ctx = canvas.getContext("2d");
    const WIN_SEC = 600;
    const RARITIES = [
        { id: "common", name: "普通", color: "#94a3b8", mult: 1 },
        { id: "rare", name: "稀有", color: "#3b82f6", mult: 1.15 },
        { id: "epic", name: "史詩", color: "#a855f7", mult: 1.35 },
        { id: "legend", name: "傳說", color: "#f59e0b", mult: 1.6 },
        { id: "mythic", name: "神話", color: "#ef4444", mult: 2 }
    ];
    const SKILL_DEFS = {
        fireball: { name: "火球", icon: "🔥", cd: 0.75, dmg: 14, speed: 320, color: "#f97316" },
        lightning: { name: "閃電", icon: "⚡", cd: 1.1, dmg: 10, chains: 4, color: "#fde047" },
        ice: { name: "冰凍", icon: "❄️", cd: 1.4, dmg: 6, slow: 0.45, radius: 90, color: "#67e8f9" },
        split: { name: "分裂箭", icon: "🏹", cd: 0.95, dmg: 9, count: 3, speed: 280, color: "#86efac" },
        pet: { name: "召喚寵物", icon: "🐾", cd: 0.5, dmg: 8, orbit: 48, color: "#c4b5fd" }
    };
    const EQUIP_SLOTS = ["weapon", "armor", "accessory"];

    let W = 800, H = 600, raf = 0, last = 0;
    let keys = {};
    let state = "menu";
    let pauseReason = null;
    let pickChoices = [];

    const game = {
        time: 0,
        kills: 0,
        bossSpawned: false,
        bossDefeated: false,
        won: false,
        player: {
            x: 400, y: 300, r: 14, hp: 100, maxHp: 100, speed: 165,
            level: 1, xp: 0, xpNeed: 12,
            skills: { fireball: 1 },
            equip: { weapon: null, armor: null, accessory: null },
            invuln: 0
        },
        enemies: [],
        bullets: [],
        orbs: [],
        pets: [],
        floats: [],
        spawnAcc: 0,
        dmgAcc: 0
    };

    function resize() {
        const rect = canvas.parentElement?.getBoundingClientRect();
        W = Math.floor(rect?.width || 800);
        H = Math.floor(rect?.height || 600);
        canvas.width = W;
        canvas.height = H;
        if (state === "menu") game.player.x = W / 2, game.player.y = H / 2;
    }

    function xpNeed(lv) {
        return Math.floor(12 + lv * lv * 2.2);
    }

    function rollRarity() {
        const r = Math.random();
        if (r < 0.02) return RARITIES[4];
        if (r < 0.08) return RARITIES[3];
        if (r < 0.2) return RARITIES[2];
        if (r < 0.45) return RARITIES[1];
        return RARITIES[0];
    }

    function randomEquipDrop() {
        const slot = EQUIP_SLOTS[Math.floor(Math.random() * EQUIP_SLOTS.length)];
        const rar = rollRarity();
        const names = {
            weapon: ["木杖", "法刃", "雷弓", "虛空刃", "神話之槍"],
            armor: ["布甲", "鎖甲", "冰鱗", "龍殼", "永恆護盾"],
            accessory: ["銅戒", "魔力環", "瞬影靴", "賢者石", "異界之眼"]
        };
        const idx = RARITIES.indexOf(rar);
        return {
            slot,
            name: names[slot][idx] || names[slot][0],
            rarity: rar,
            atk: slot === "weapon" ? Math.round(3 * rar.mult) : 0,
            hp: slot === "armor" ? Math.round(15 * rar.mult) : 0,
            spd: slot === "accessory" ? Math.round(8 * rar.mult) : 0
        };
    }

    function applyEquip(eq) {
        if (!eq) return;
        const p = game.player;
        const prev = p.equip[eq.slot];
        p.equip[eq.slot] = eq;
        if (!prev) {
            p.maxHp += eq.hp;
            p.hp += eq.hp;
            p.speed += eq.spd * 0.5;
        }
        addFloat(p.x, p.y - 30, `${eq.rarity.name} ${eq.name}`, eq.rarity.color);
    }

    function equipPower() {
        let atk = 0;
        Object.values(game.player.equip).forEach((e) => { if (e) atk += e.atk || 0; });
        return atk;
    }

    function addFloat(x, y, text, color) {
        game.floats.push({ x, y, text, color, life: 1.2 });
    }

    function spawnEnemy(isBoss = false) {
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        if (edge === 0) { x = Math.random() * W; y = -20; }
        else if (edge === 1) { x = W + 20; y = Math.random() * H; }
        else if (edge === 2) { x = Math.random() * W; y = H + 20; }
        else { x = -20; y = Math.random() * H; }
        const t = game.time;
        const scale = 1 + t / 120;
        if (isBoss) {
            game.enemies.push({
                x, y, r: 36, hp: 800 + scale * 80, maxHp: 800 + scale * 80,
                spd: 55, dmg: 18, xp: 80, boss: true, slow: 1, color: "#dc2626"
            });
            return;
        }
        const roll = Math.random();
        game.enemies.push({
            x, y,
            r: roll > 0.85 ? 16 : 10,
            hp: (roll > 0.85 ? 55 : 28) * scale,
            maxHp: (roll > 0.85 ? 55 : 28) * scale,
            spd: (roll > 0.85 ? 70 : 95) + scale * 8,
            dmg: 8 + scale * 2,
            xp: roll > 0.85 ? 8 : 4,
            boss: false,
            slow: 1,
            color: roll > 0.85 ? "#7c3aed" : "#64748b"
        });
    }

    function nearestEnemy(fromX, fromY, maxDist = 9999) {
        let best = null, bd = maxDist;
        for (const e of game.enemies) {
            const d = Math.hypot(e.x - fromX, e.y - fromY);
            if (d < bd) { bd = d; best = e; }
        }
        return best;
    }

    function damageEnemy(e, dmg) {
        e.hp -= dmg;
        if (e.hp <= 0) {
            game.kills++;
            game.orbs.push({ x: e.x, y: e.y, r: 5, xp: e.xp, life: 12 });
            if (e.boss) game.bossDefeated = true;
            const idx = game.enemies.indexOf(e);
            if (idx >= 0) game.enemies.splice(idx, 1);
            if (game.kills % 15 === 0) applyEquip(randomEquipDrop());
        }
    }

    function fireSkill(id, lv) {
        const def = SKILL_DEFS[id];
        const p = game.player;
        const bonus = equipPower() + lv * 2;
        if (id === "fireball") {
            const t = nearestEnemy(p.x, p.y);
            if (!t) return;
            const ang = Math.atan2(t.y - p.y, t.x - p.x);
            game.bullets.push({
                x: p.x, y: p.y, vx: Math.cos(ang) * def.speed, vy: Math.sin(ang) * def.speed,
                r: 7, dmg: def.dmg + bonus, life: 2, color: def.color, pierce: 1 + Math.floor(lv / 3)
            });
        } else if (id === "lightning") {
            let cur = nearestEnemy(p.x, p.y, 220);
            let left = def.chains + lv;
            const hit = new Set();
            while (cur && left-- > 0) {
                damageEnemy(cur, def.dmg + bonus);
                addFloat(cur.x, cur.y, "⚡", def.color);
                hit.add(cur);
                let next = null, nd = 9999;
                for (const e of game.enemies) {
                    if (hit.has(e)) continue;
                    const d = Math.hypot(e.x - cur.x, e.y - cur.y);
                    if (d < 120 && d < nd) { nd = d; next = e; }
                }
                cur = next;
            }
        } else if (id === "ice") {
            const rad = def.radius + lv * 8;
            for (const e of game.enemies) {
                if (Math.hypot(e.x - p.x, e.y - p.y) < rad) {
                    e.slow = Math.min(e.slow, def.slow);
                    damageEnemy(e, def.dmg + bonus * 0.5);
                }
            }
            game.bullets.push({ x: p.x, y: p.y, r: rad, dmg: 0, life: 0.25, color: def.color, iceRing: true });
        } else if (id === "split") {
            const base = Math.random() * Math.PI * 2;
            const n = def.count + Math.min(2, Math.floor(lv / 2));
            for (let i = 0; i < n; i++) {
                const ang = base + (i / n) * Math.PI * 2;
                game.bullets.push({
                    x: p.x, y: p.y, vx: Math.cos(ang) * def.speed, vy: Math.sin(ang) * def.speed,
                    r: 5, dmg: def.dmg + bonus, life: 1.5, color: def.color, pierce: 1
                });
            }
        } else if (id === "pet") {
            if (game.pets.length < 1 + Math.floor(lv / 2)) {
                game.pets.push({ angle: Math.random() * 6.28, r: def.orbit, dmg: def.dmg + bonus, spd: 2.5 });
            }
        }
    }

    const skillCd = {};

    function tickSkills(dt) {
        for (const [id, lv] of Object.entries(game.player.skills)) {
            if (!lv) continue;
            skillCd[id] = (skillCd[id] || 0) - dt;
            const def = SKILL_DEFS[id];
            if (skillCd[id] <= 0) {
                fireSkill(id, lv);
                skillCd[id] = def.cd * (id === "pet" ? 0.3 : 1);
            }
        }
    }

    function levelUpChoices() {
        const choices = [];
        const owned = Object.keys(game.player.skills);
        const pool = Object.keys(SKILL_DEFS);
        for (let i = 0; i < 40 && choices.length < 3; i++) {
            const id = pool[Math.floor(Math.random() * pool.length)];
            const lv = game.player.skills[id] || 0;
            if (lv >= 5) continue;
            const label = lv ? `${SKILL_DEFS[id].name} Lv.${lv + 1}` : `解鎖 ${SKILL_DEFS[id].name}`;
            if (choices.some((c) => c.id === id)) continue;
            choices.push({ id, label, desc: SKILL_DEFS[id].icon + " " + SKILL_DEFS[id].name });
        }
        return choices.length ? choices : [{ id: "fireball", label: "火球 Lv.2", desc: "🔥 強化" }];
    }

    function openLevelPick() {
        state = "levelup";
        pauseReason = "levelup";
        pickChoices = levelUpChoices();
        hooks.onLevelUp?.(pickChoices);
    }

    function pickSkill(id) {
        game.player.skills[id] = (game.player.skills[id] || 0) + 1;
        game.player.xpNeed = xpNeed(game.player.level);
        state = "playing";
        pauseReason = null;
        hooks.onStateChange?.(state);
    }

    let bossAllowed = true;
    let bossCooldownNotified = false;

    function start(opts = {}) {
        bossAllowed = opts.bossAllowed !== false;
        bossCooldownNotified = false;
        game.time = 0;
        game.kills = 0;
        game.bossSpawned = false;
        game.bossDefeated = false;
        game.won = false;
        game.enemies = [];
        game.bullets = [];
        game.orbs = [];
        game.pets = [];
        game.floats = [];
        game.player = {
            x: W / 2, y: H / 2, r: 14, hp: 100, maxHp: 100, speed: 165,
            level: 1, xp: 0, xpNeed: xpNeed(1),
            skills: { fireball: 1 },
            equip: { weapon: null, armor: null, accessory: null },
            invuln: 0
        };
        state = "playing";
        pauseReason = null;
        last = performance.now();
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
        hooks.onStateChange?.(state);
    }

    function endGame(won) {
        state = "over";
        game.won = won;
        cancelAnimationFrame(raf);
        hooks.onEnd?.({
            won,
            time: game.time,
            kills: game.kills,
            level: game.player.level,
            score: Math.floor(game.kills * 10 + game.time * 2 + (won ? 500 : 0))
        });
    }

    function update(dt) {
        if (state !== "playing") return;
        game.time += dt;
        const p = game.player;

        let vx = 0, vy = 0;
        if (keys["w"] || keys["arrowup"]) vy -= 1;
        if (keys["s"] || keys["arrowdown"]) vy += 1;
        if (keys["a"] || keys["arrowleft"]) vx -= 1;
        if (keys["d"] || keys["arrowright"]) vx += 1;
        if (vx || vy) {
            const len = Math.hypot(vx, vy) || 1;
            p.x += (vx / len) * p.speed * dt;
            p.y += (vy / len) * p.speed * dt;
        }
        p.x = Math.max(p.r, Math.min(W - p.r, p.x));
        p.y = Math.max(p.r, Math.min(H - p.r, p.y));
        if (p.invuln > 0) p.invuln -= dt;

        game.spawnAcc += dt;
        const spawnRate = Math.max(0.35, 1.1 - game.time / 200);
        if (game.spawnAcc >= spawnRate) {
            game.spawnAcc = 0;
            spawnEnemy();
            if (game.time > 30 && Math.random() < 0.35) spawnEnemy();
        }

        if (!game.bossSpawned && game.time >= WIN_SEC) {
            game.bossSpawned = true;
            if (bossAllowed) {
                spawnEnemy(true);
                addFloat(W / 2, H / 2, "👹 異界 Boss 來襲！", "#ef4444");
                hooks.onBossSpawn?.();
            } else if (!bossCooldownNotified) {
                bossCooldownNotified = true;
                addFloat(W / 2, H / 2, "⏳ Boss 冷卻中（每小時1次）", "#f59e0b");
            }
        }

        if (game.won === false && bossAllowed && game.bossSpawned && game.bossDefeated && game.time >= WIN_SEC) {
            game.won = true;
            endGame(true);
            return;
        }

        tickSkills(dt);

        for (const e of game.enemies) {
            e.slow = Math.min(1, e.slow + dt * 0.4);
            const ang = Math.atan2(p.y - e.y, p.x - e.x);
            const spd = e.spd * e.slow;
            e.x += Math.cos(ang) * spd * dt;
            e.y += Math.sin(ang) * spd * dt;
            if (Math.hypot(e.x - p.x, e.y - p.y) < e.r + p.r && p.invuln <= 0) {
                p.hp -= e.dmg * dt * 1.8;
                p.invuln = 0.4;
            }
        }

        for (let i = game.bullets.length - 1; i >= 0; i--) {
            const b = game.bullets[i];
            b.life -= dt;
            if (!b.iceRing) {
                b.x += b.vx * dt;
                b.y += b.vy * dt;
            }
            if (b.life <= 0) { game.bullets.splice(i, 1); continue; }
            if (b.iceRing) continue;
            for (const e of [...game.enemies]) {
                if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
                    damageEnemy(e, b.dmg);
                    b.pierce--;
                    if (b.pierce <= 0) { game.bullets.splice(i, 1); break; }
                }
            }
        }

        for (const pet of game.pets) {
            pet.angle += pet.spd * dt;
            const px = p.x + Math.cos(pet.angle) * pet.r;
            const py = p.y + Math.sin(pet.angle) * pet.r;
            for (const e of [...game.enemies]) {
                if (Math.hypot(e.x - px, e.y - py) < e.r + 12) damageEnemy(e, pet.dmg * dt * 3);
            }
        }

        for (let i = game.orbs.length - 1; i >= 0; i--) {
            const o = game.orbs[i];
            o.life -= dt;
            const d = Math.hypot(o.x - p.x, o.y - p.y);
            if (d < 120) { o.x += (p.x - o.x) * 6 * dt; o.y += (p.y - o.y) * 6 * dt; }
            if (d < p.r + 10 || o.life <= 0) {
                p.xp += o.xp;
                game.orbs.splice(i, 1);
                if (p.xp >= p.xpNeed) {
                    p.xp -= p.xpNeed;
                    p.level++;
                    p.xpNeed = xpNeed(p.level);
                    p.hp = Math.min(p.maxHp, p.hp + 12);
                    openLevelPick();
                }
            }
        }

        for (let i = game.floats.length - 1; i >= 0; i--) {
            game.floats[i].life -= dt;
            game.floats[i].y -= 28 * dt;
            if (game.floats[i].life <= 0) game.floats.splice(i, 1);
        }

        if (p.hp <= 0) endGame(false);
        hooks.onTick?.(game);
    }

    function draw() {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "rgba(76,151,255,0.08)";
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        for (const o of game.orbs) {
            ctx.fillStyle = "#4ade80";
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
            ctx.fill();
        }

        for (const e of game.enemies) {
            ctx.fillStyle = e.color;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
            ctx.fill();
            if (e.maxHp > 40) {
                ctx.fillStyle = "#1e293b";
                ctx.fillRect(e.x - e.r, e.y - e.r - 8, e.r * 2, 4);
                ctx.fillStyle = e.boss ? "#ef4444" : "#22c55e";
                ctx.fillRect(e.x - e.r, e.y - e.r - 8, (e.hp / e.maxHp) * e.r * 2, 4);
            }
        }

        for (const b of game.bullets) {
            if (b.iceRing) {
                ctx.strokeStyle = b.color;
                ctx.globalAlpha = 0.35;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            } else {
                ctx.fillStyle = b.color;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const p = game.player;
        if (p.invuln > 0 && Math.floor(game.time * 10) % 2 === 0) ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#4c97ff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        for (const pet of game.pets) {
            const px = p.x + Math.cos(pet.angle) * pet.r;
            const py = p.y + Math.sin(pet.angle) * pet.r;
            ctx.font = "18px sans-serif";
            ctx.fillText("🐾", px - 9, py + 6);
        }

        for (const f of game.floats) {
            ctx.globalAlpha = Math.min(1, f.life);
            ctx.fillStyle = f.color;
            ctx.font = "bold 13px 'Noto Sans TC', sans-serif";
            ctx.fillText(f.text, f.x - 20, f.y);
            ctx.globalAlpha = 1;
        }

        if (state === "playing" || state === "levelup") {
            const left = Math.max(0, WIN_SEC - game.time);
            const m = Math.floor(left / 60);
            const s = Math.floor(left % 60);
            ctx.fillStyle = "#e2e8f0";
            ctx.font = "bold 14px 'Noto Sans TC', sans-serif";
            ctx.fillText(`⏱ ${m}:${String(s).padStart(2, "0")}  |  Lv.${p.level}  |  💀 ${game.kills}`, 14, 24);
            ctx.fillStyle = "#334155";
            ctx.fillRect(14, 32, 120, 8);
            ctx.fillStyle = p.hp / p.maxHp > 0.3 ? "#22c55e" : "#ef4444";
            ctx.fillRect(14, 32, 120 * (p.hp / p.maxHp), 8);
        }
    }

    function loop(ts) {
        const dt = Math.min(0.05, (ts - last) / 1000 || 0);
        last = ts;
        if (state === "playing") update(dt);
        draw();
        if (state !== "over") raf = requestAnimationFrame(loop);
    }

    function onKey(e, down) {
        const k = e.key.toLowerCase();
        keys[k] = down;
        if (down && k === "escape" && state === "playing") {
            state = "paused";
            hooks.onStateChange?.(state);
        } else if (down && k === "escape" && state === "paused") {
            state = "playing";
            hooks.onStateChange?.(state);
        }
    }

    window.addEventListener("keydown", (e) => onKey(e, true));
    window.addEventListener("keyup", (e) => onKey(e, false));

    resize();
    window.addEventListener("resize", resize);

    function resume() {
        if (state === "paused") {
            state = "playing";
            hooks.onStateChange?.(state);
        }
    }

    return {
        start,
        resume,
        pickSkill,
        getState: () => state,
        getGame: () => game,
        getPickChoices: () => pickChoices,
        destroy: () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        },
        runLoop: () => {
            last = performance.now();
            raf = requestAnimationFrame(loop);
        },
        SKILL_DEFS,
        RARITIES,
        WIN_SEC
    };
}

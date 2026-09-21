/* Jádro hry: smyčka, vstup, chůze, přechody místností, UI stavy. */
(function () {
  const TP = (window.TP = window.TP || {});
  const U = TP.util;

  const game = {
    canvas: null, ctx: null, scale: 1,
    mode: 'title',            // title | play | end
    menuOpen: false,
    room: null,
    player: { x: 320, y: 300, tx: 320, ty: 300, walking: false, facing: 1, phase: 0 },
    selected: null,
    hoverText: '',
    hoverChoice: -1,
    hoverHotspot: null,
    bubble: null,
    fx: null,
    tint: null,
    fading: 0,
    fadeState: null,
    skipRequested: false,
    actorAnim: {},
    buttons: [],
    choiceRects: [],
    menuRects: [],
    titleRects: [],
    endText: null,
    last: 0,

    /* ---------- start ---------- */
    init() {
      this.canvas = document.getElementById('game');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;
      TP.assets.load(window.TP_MANIFEST, () => {});
      this.bindInput();
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.hasSave = TP.state.load();
      this.mode = 'title';
      this.last = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    },

    resize() {
      const maxW = window.innerWidth, maxH = window.innerHeight;
      let s = Math.min(maxW / TP.render.W, maxH / TP.render.H);
      if (s >= 1) s = Math.floor(s);
      this.scale = Math.max(0.2, s);
      this.canvas.style.width = Math.round(TP.render.W * this.scale) + 'px';
      this.canvas.style.height = Math.round(TP.render.H * this.scale) + 'px';
    },

    newGame() {
      TP.state.reset();
      this.selected = null;
      TP.script.clear();
      TP.dialogue.active = false;
      this.mode = 'play';
      this.menuOpen = false;
      TP.audio.resume();
      this.changeRoom('diner', null, 1, true);
    },

    continueGame() {
      this.mode = 'play';
      this.menuOpen = false;
      TP.audio.resume();
      const r = TP.data.rooms[TP.state.room] || TP.data.rooms.diner;
      this.room = r;
      this.player.x = TP.state.x; this.player.y = TP.state.y;
      this.player.tx = this.player.x; this.player.ty = this.player.y;
      this.player.walking = false;
      this.actorAnim = {};
      if (r.music) TP.audio.music(r.music);
    },

    /* ---------- místnosti ---------- */
    changeRoom(id, at, facing, instant) {
      const target = TP.data.rooms[id];
      if (!target) { console.warn('Neznámá místnost:', id); return; }
      const apply = () => {
        this.room = target;
        TP.state.room = id;
        const pos = at || target.start || [320, 296];
        this.player.x = pos[0]; this.player.y = pos[1];
        this.player.tx = pos[0]; this.player.ty = pos[1];
        this.player.walking = false;
        if (facing) this.player.facing = facing;
        this.actorAnim = {};
        this.selected = null;
        this.tint = null;
        TP.state.x = this.player.x; TP.state.y = this.player.y;
        TP.state.save();
        if (target.music) TP.audio.music(target.music);
        if (target.onEnter) TP.script.run(target.onEnter);
      };
      if (instant) { apply(); this.fading = 0; this.fadeState = null; return; }
      this.fading = 1;
      this.fadeState = { phase: 'out', t: 0, apply };
    },

    updateFade(dt) {
      const f = this.fadeState;
      if (!f) { this.fading = 0; return; }
      f.t += dt;
      const dur = 230;
      if (f.phase === 'out') {
        this.fadeAlpha = U.clamp(f.t / dur, 0, 1);
        if (f.t >= dur) { f.apply(); f.phase = 'in'; f.t = 0; }
      } else {
        this.fadeAlpha = 1 - U.clamp(f.t / dur, 0, 1);
        if (f.t >= dur) { this.fadeState = null; this.fading = 0; this.fadeAlpha = 0; }
      }
    },

    scaleAt(y) {
      const r = this.room;
      if (!r || !r.scale) return 1;
      const [yTop, sTop, yBot, sBot] = r.scale;
      const t = U.clamp((y - yTop) / (yBot - yTop), 0, 1);
      return U.lerp(sTop, sBot, t);
    },

    /* ---------- chůze ---------- */
    walkTo(x, y) {
      const r = this.room;
      if (!r || r.noWalk) return;
      const p = U.clampToPoly(x, y, r.walk);
      this.player.tx = p[0]; this.player.ty = p[1];
      this.player.walking = true;
    },

    updatePlayer(dt) {
      const p = this.player;
      if (!p.walking) { p.phase = 0; return; }
      const sc = this.scaleAt(p.y);
      const speed = 105 * sc * (dt / 1000);
      const dx = p.tx - p.x, dy = p.ty - p.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= speed || d < 0.6) {
        p.x = p.tx; p.y = p.ty; p.walking = false; p.phase = 0;
      } else {
        p.x += (dx / d) * speed;
        p.y += (dy / d) * speed;
        if (Math.abs(dx) > 1) p.facing = dx > 0 ? 1 : -1;
        p.phase += dt / 70;
      }
      TP.state.x = p.x; TP.state.y = p.y; TP.state.facing = p.facing;
    },

    moveActor(id, to, hide) {
      if (!this.actorAnim[id]) this.actorAnim[id] = {};
      const a = this.actorAnim[id];
      if (to) { a.tx = to[0]; a.ty = to[1]; }
      if (hide !== undefined) a.hidden = !!hide;
    },

    /* ---------- hotspoty ---------- */
    hotspots() {
      const r = this.room;
      if (!r) return [];
      return (r.hotspots || []).filter((h) => h.if === undefined || TP.script.check(h.if));
    },

    hotspotRect(h) {
      if (h.actor) {
        const def = TP.data.actors[h.actor] || {};
        const sc = this.scaleAt(h.y) * (h.scale || 1);
        const hh = (def.height || 52) * sc;
        const w = Math.max(24, hh * 0.5);
        return { x: h.x - w / 2, y: h.y - hh, w, h: hh };
      }
      return { x: h.x, y: h.y, w: h.w, h: h.h };
    },

    /** Z překrývajících se hotspotů vyhrává ten menší (konkrétnější):
        hrnek mouky na pultu je přednější než servírka za ním. */
    hotspotAt(x, y) {
      const list = this.hotspots();
      let best = null, bestArea = Infinity;
      for (let i = list.length - 1; i >= 0; i--) {
        const h = list[i];
        const r = this.hotspotRect(h);
        if (!U.rectHit(x, y, r)) continue;
        const area = r.w * r.h;
        if (area < bestArea) { best = h; bestArea = area; }
      }
      return best;
    },

    verbFor(h) {
      if (!h) return null;
      if (h.verb) return h.verb;
      if (h.exit) return 'go';
      if (h.actor) return 'talk';
      if (h.use) return 'use';
      return 'look';
    },

    labelFor(h) {
      if (!h) return '';
      const name = h.name || (h.actor && TP.data.actors[h.actor] && TP.data.actors[h.actor].name) || '';
      if (this.selected) {
        const it = TP.data.items[this.selected] || {};
        return 'Použít ' + (it.name || this.selected) + ' na: ' + name;
      }
      const v = this.verbFor(h);
      const pref = v === 'go' ? 'Jít: ' : v === 'talk' ? 'Promluvit: ' : v === 'take' ? 'Vzít: '
        : v === 'use' ? 'Použít: ' : 'Prohlédnout: ';
      return pref + name;
    },

    /* ---------- interakce ---------- */
    defaultLine(kind) {
      const lines = {
        look: ['Nic zvláštního.', 'Nic, co by teď pomohlo.', 'Vypadá to úplně obyčejně. Což v tomhle městě nic neznamená.'],
        use: ['To nejde.', 'Tohle asi ne.', 'Nechám to být.'],
        useWith: ['Tohle dohromady nedává smysl.', 'Ne. Ani trochu.', 'Zkusila jsem to. Nic.'],
        far: ['Tam se nedostanu.'],
      };
      const arr = lines[kind] || lines.look;
      return arr[Math.floor(Math.random() * arr.length)];
    },

    interact(h, verb) {
      if (!h) return;
      const ops = [];
      if (h.walkTo && !this.room.noWalk) ops.push({ walkTo: h.walkTo });
      if (h.face) ops.push({ face: h.face });
      let body = null;
      if (verb === 'look') body = h.look || [{ say: h.lookText || this.defaultLine('look') }];
      else if (verb === 'go') {
        if (h.blockedIf && TP.script.check(h.blockedIf)) body = h.blocked || [{ say: 'Tudy teď ne.' }];
        else body = h.use || [{ go: h.exit, at: h.exitAt, facing: h.exitFacing }];
      } else if (verb === 'talk') body = h.talk || h.use || [{ say: this.defaultLine('use') }];
      else body = h.use || h.talk || h.look || [{ say: this.defaultLine('use') }];
      TP.script.run(ops.concat(body));
    },

    useItemOn(itemId, h) {
      const item = TP.data.items[itemId] || {};
      const ops = [];
      if (h.walkTo && !this.room.noWalk) ops.push({ walkTo: h.walkTo });
      if (h.face) ops.push({ face: h.face });
      let body = (h.useWith && h.useWith[itemId]) || (item.useOn && item.useOn[h.id]) || null;
      if (!body) {
        const target = h.name || '';
        body = [{ say: item.failLine || this.defaultLine('useWith') }];
        if (h.useWithFail) body = h.useWithFail;
        void target;
      }
      this.selected = null;
      TP.script.run(ops.concat(body));
    },

    combineItems(a, b) {
      const ia = TP.data.items[a] || {}, ib = TP.data.items[b] || {};
      const rec = (ia.combine && ia.combine[b]) || (ib.combine && ib.combine[a]);
      this.selected = null;
      if (rec) { TP.script.run(rec); return; }
      TP.script.run([{ say: this.defaultLine('useWith') }]);
    },

    /* ---------- bubliny / efekty ---------- */
    showBubble(who, text) {
      const def = TP.data.actors[who] || {};
      let x = 320, y = 120;
      if (who === 'natalie') { x = this.player.x; y = this.player.y - (def.height || 52) * this.scaleAt(this.player.y) - 4; }
      else {
        const h = this.hotspots().find((s) => s.actor === who);
        if (h) { x = h.x; y = h.y - (TP.data.actors[h.actor].height || 52) * this.scaleAt(h.y) * (h.scale || 1) - 4; }
        else { x = 320; y = 90; }
      }
      this.bubble = { text, x, y, color: def.color || TP.render.pal.bone };
    },

    hideBubble() { this.bubble = null; },

    startFx(type, dur) {
      this.fx = { type, t: 0, dur, done: false };
      if (type === 'red') TP.audio.sfx('sting');
    },

    endGame() {
      this.mode = 'end';
      TP.audio.music('red', true);
    },

    /* ---------- vstup ---------- */
    bindInput() {
      const c = this.canvas;
      const toScene = (ev) => {
        const r = c.getBoundingClientRect();
        const px = (ev.clientX - r.left) / (r.width / TP.render.W);
        const py = (ev.clientY - r.top) / (r.height / TP.render.H);
        return { x: px, y: py };
      };
      c.addEventListener('contextmenu', (e) => e.preventDefault());
      c.addEventListener('pointermove', (e) => {
        const p = toScene(e);
        this.updateHover(p.x, p.y);
      });
      c.addEventListener('pointerdown', (e) => {
        TP.audio.resume();
        const p = toScene(e);
        this.pressPos = p;
        this.pressTime = performance.now();
        this.longDone = false;
        if (e.button === 2) { this.longDone = true; this.click(p.x, p.y, true); }
        this.longTimer = setTimeout(() => {
          if (this.longDone) return;
          this.longDone = true;
          this.click(p.x, p.y, true);
        }, 480);
      });
      c.addEventListener('pointerup', (e) => {
        clearTimeout(this.longTimer);
        if (this.longDone) { this.longDone = false; return; }
        const p = toScene(e);
        this.click(p.x, p.y, false);
      });
      c.addEventListener('pointerleave', () => { clearTimeout(this.longTimer); this.hoverText = ''; });
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { if (this.mode === 'play') this.menuOpen = !this.menuOpen; }
        if (e.key === ' ' || e.key === 'Enter') this.skipRequested = true;
      });
    },

    updateHover(x, y) {
      this.hoverChoice = -1;
      if (this.mode !== 'play') { this.hoverText = ''; return; }
      if (TP.dialogue.active) {
        this.choiceRects.forEach((r, i) => { if (U.rectHit(x, y, r)) this.hoverChoice = i; });
        this.hoverText = '';
        return;
      }
      if (y >= TP.render.BAR_Y) {
        const id = this.invSlotAt(x, y);
        const it = id && TP.data.items[id];
        this.hoverText = it ? (this.selected && this.selected !== id
          ? 'Použít ' + (TP.data.items[this.selected] || {}).name + ' na: ' + it.name
          : 'Prohlédnout: ' + it.name) : '';
        return;
      }
      const h = this.hotspotAt(x, y);
      this.hoverHotspot = h;
      this.hoverText = h ? this.labelFor(h) : (this.selected ? 'Použít ' + (TP.data.items[this.selected] || {}).name : '');
    },

    invSlotAt(x, y) {
      const R = TP.render;
      if (y < R.SLOT_Y || y > R.SLOT_Y + R.SLOT) return null;
      for (let i = 0; i < 14; i++) {
        const sx = R.SLOT_X + i * (R.SLOT + R.SLOT_GAP);
        if (x >= sx && x <= sx + R.SLOT) return TP.state.inv[i] || null;
      }
      return null;
    },

    click(x, y, secondary) {
      if (this.mode === 'title') { this.titleClick(x, y); return; }
      if (this.mode === 'end') { this.mode = 'title'; TP.audio.music('diner'); return; }
      if (this.menuOpen) { this.menuClick(x, y); return; }

      if (TP.dialogue.active) {
        if (TP.dialogue.choices.length) {
          for (let i = 0; i < this.choiceRects.length; i++) {
            if (U.rectHit(x, y, this.choiceRects[i])) { TP.dialogue.pick(i); return; }
          }
          return;
        }
        TP.dialogue.advance();
        return;
      }

      if (TP.script.busy()) { this.skipRequested = true; return; }

      // spodní lišta
      if (y >= TP.render.BAR_Y) {
        const btn = (this.buttons || []).find((b) => U.rectHit(x, y, b));
        if (btn) {
          TP.audio.sfx('click');
          if (btn.id === 'sound') TP.audio.toggle();
          else this.menuOpen = true;
          return;
        }
        const id = this.invSlotAt(x, y);
        if (!id) { this.selected = null; return; }
        const item = TP.data.items[id] || {};
        if (secondary) { this.selected = null; TP.script.run(item.look || [{ say: 'Obyčejná věc. Zatím.' }]); return; }
        if (this.selected && this.selected !== id) { this.combineItems(this.selected, id); return; }
        this.selected = this.selected === id ? null : id;
        TP.audio.sfx('click');
        return;
      }

      // scéna
      const h = this.hotspotAt(x, y);
      if (this.selected) {
        if (h) this.useItemOn(this.selected, h);
        else { this.selected = null; TP.script.run([{ say: this.defaultLine('useWith') }]); }
        return;
      }
      if (h) { this.interact(h, secondary ? 'look' : this.verbFor(h)); return; }
      if (secondary) { TP.script.run([{ say: this.defaultLine('look') }]); return; }
      if (this.room && !this.room.noWalk) { this.walkTo(x, y); }
    },

    titleClick(x, y) {
      for (const r of this.titleRects) {
        if (U.rectHit(x, y, r)) {
          TP.audio.resume();
          if (r.id === 'new') this.newGame();
          else if (r.id === 'continue') this.continueGame();
          else if (r.id === 'sound') TP.audio.toggle();
          return;
        }
      }
    },

    menuClick(x, y) {
      for (const r of this.menuRects) {
        if (U.rectHit(x, y, r)) {
          TP.audio.sfx('click');
          if (r.id === 'resume') this.menuOpen = false;
          else if (r.id === 'sound') TP.audio.toggle();
          else if (r.id === 'new') { this.menuOpen = false; this.newGame(); }
          else if (r.id === 'title') { this.menuOpen = false; this.mode = 'title'; this.hasSave = true; }
          return;
        }
      }
      this.menuOpen = false;
    },

    /* ---------- smyčka ---------- */
    loop(t) {
      const dt = Math.min(64, t - this.last);
      this.last = t;
      this.update(dt);
      this.draw();
      requestAnimationFrame((tt) => this.loop(tt));
    },

    update(dt) {
      if (this.mode !== 'play') return;
      if (this.fadeState) this.updateFade(dt);
      if (this.fx) {
        this.fx.t += dt;
        if (this.fx.t >= this.fx.dur) { this.fx.done = true; this.fx = null; }
      }
      if (!this.menuOpen) {
        this.updatePlayer(dt);
        TP.script.update(dt);
      }
      // animace vedlejších postav
      Object.keys(this.actorAnim).forEach((id) => {
        const a = this.actorAnim[id];
        if (a.tx === undefined) return;
        const h = this.hotspots().find((s) => s.actor === id);
        if (!h) return;
        if (a.x === undefined) { a.x = h.x; a.y = h.y; }
        const dx = a.tx - a.x, dy = a.ty - a.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const sp = 70 * (dt / 1000);
        if (d <= sp) { a.x = a.tx; a.y = a.ty; a.arrived = true; }
        else { a.x += (dx / d) * sp; a.y += (dy / d) * sp; a.phase = (a.phase || 0) + dt / 70; a.facing = dx > 0 ? 1 : -1; }
      });
    },

    draw() {
      const ctx = this.ctx, R = TP.render;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, R.W, R.H);
      if (this.mode === 'title') { TP.screens.title(ctx, this); ctx.restore(); return; }
      if (this.mode === 'end') { TP.screens.end(ctx, this); ctx.restore(); return; }

      const room = this.room;
      if (room) {
        const bg = room.bg && TP.assets.img(room.bg);
        if (bg) ctx.drawImage(bg, 0, 0, R.W, R.SCENE_H);
        R.layer(ctx, room.art, false, !!bg);
        // postavy a kulisy s hloubkou (z) v jednom pořadí odzadu dopředu
        const drawables = [];
        if (!bg) {
          (room.art || []).forEach((sh) => {
            if (sh.z === undefined) return;
            if (sh.if !== undefined && !TP.script.check(sh.if)) return;
            drawables.push({ shape: sh, y: sh.z });
          });
        }
        this.hotspots().forEach((h) => {
          if (!h.actor) return;
          const a = this.actorAnim[h.actor] || {};
          if (a.hidden) return;
          drawables.push({
            def: TP.data.actors[h.actor] || {},
            x: a.x !== undefined ? a.x : h.x,
            y: a.y !== undefined ? a.y : h.y,
            facing: a.facing || h.facing || 1,
            sitting: h.sitting,
            phase: a.phase || 0,
            sc: (h.scale || 1),
          });
        });
        if (!room.noWalk && !room.hidePlayer) {
          drawables.push({
            def: TP.data.actors.natalie, x: this.player.x, y: this.player.y,
            facing: this.player.facing, phase: this.player.phase, sc: 1,
          });
        }
        drawables.sort((a, b) => a.y - b.y);
        drawables.forEach((d) => {
          if (d.shape) R.shape(ctx, d.shape);
          else R.actor(ctx, d.def, d.x, d.y, this.scaleAt(d.y) * d.sc, d.facing, d.phase, d.sitting);
        });
        R.layer(ctx, room.art, true, !!(room.bg && TP.assets.img(room.bg)));
      }

      R.tint(ctx, this.tint);
      R.fx(ctx, this.fx);
      R.bubble(ctx, this.bubble);
      if (!TP.dialogue.active) {
        R.topBar(ctx, this.hoverText);
        R.inventory(ctx, this);
      } else {
        R.dialogueBox(ctx, this);
      }
      R.fade(ctx, this.fadeAlpha || 0);
      if (this.menuOpen) TP.screens.menu(ctx, this);
      ctx.restore();
    },
  };

  TP.game = game;
  window.addEventListener('load', () => game.init());
})();

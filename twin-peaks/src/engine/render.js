/* Vykreslování: scéna z tvarů (placeholdery), postavy, bubliny, dialog a UI.
   Každý tvar i postava se dá vyměnit za obrázek z manifestu (t:'img'). */
(function () {
  const TP = (window.TP = window.TP || {});
  const U = TP.util;

  const W = 640, H = 360, SCENE_H = 316, BAR_Y = 316, BAR_H = 44;
  const SLOT = 30, SLOT_GAP = 4, SLOT_X = 10, SLOT_Y = 322;

  const pal = {
    ink: '#0d0b0c', night: '#161314', wood: '#5a4636', woodDark: '#3b2e24',
    cream: '#e8dcc0', paper: '#d8cba8', fir: '#1b2f1f', firDark: '#0f1a12',
    red: '#a81c22', redBright: '#d02b2b', gold: '#f0c060', amber: '#c9903a',
    fog: '#8d9aa0', steel: '#4a5257', bone: '#efe7d8', shadow: 'rgba(0,0,0,0.35)',
  };

  function font(size, bold) {
    return (bold ? 'bold ' : '') + size + 'px "Courier New", ui-monospace, monospace';
  }

  const render = {
    pal, W, H, SCENE_H, BAR_Y, BAR_H, SLOT, SLOT_GAP, SLOT_X, SLOT_Y, font,

    /* ---------- tvary scény ---------- */
    shape(ctx, s) {
      if (s.if !== undefined && !TP.script.check(s.if)) return;
      const img = s.id ? TP.assets.img(s.id) : null;
      if (img) { ctx.drawImage(img, s.x | 0, s.y | 0, s.w || img.width, s.h || img.height); return; }
      ctx.save();
      if (s.alpha !== undefined) ctx.globalAlpha = s.alpha;
      switch (s.t) {
        case 'rect':
          ctx.fillStyle = s.c; ctx.fillRect(s.x, s.y, s.w, s.h);
          if (s.o) { ctx.strokeStyle = s.o; ctx.lineWidth = 1; ctx.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h - 1); }
          break;
        case 'grad': {
          const g = ctx.createLinearGradient(s.x, s.y, s.horizontal ? s.x + s.w : s.x, s.horizontal ? s.y : s.y + s.h);
          g.addColorStop(0, s.c1); g.addColorStop(1, s.c2);
          ctx.fillStyle = g; ctx.fillRect(s.x, s.y, s.w, s.h);
          break;
        }
        case 'poly':
          ctx.fillStyle = s.c; ctx.beginPath();
          s.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
          ctx.closePath(); ctx.fill();
          break;
        case 'ell':
          ctx.fillStyle = s.c; ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.rx, s.ry, 0, 0, Math.PI * 2); ctx.fill();
          break;
        case 'line':
          ctx.strokeStyle = s.c; ctx.lineWidth = s.w || 1;
          ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
          break;
        case 'text':
          ctx.fillStyle = s.c || pal.bone; ctx.font = font(s.size || 10, s.bold);
          ctx.textAlign = s.align || 'left'; ctx.textBaseline = 'top';
          ctx.fillText(s.s, s.x, s.y);
          break;
        case 'checker': {
          const sz = s.size || 12;
          for (let yy = 0; yy * sz < s.h; yy++) {
            for (let xx = 0; xx * sz < s.w; xx++) {
              ctx.fillStyle = (xx + yy) % 2 ? s.c1 : s.c2;
              const px = s.x + xx * sz, py = s.y + yy * sz;
              ctx.fillRect(px, py, Math.min(sz, s.x + s.w - px), Math.min(sz, s.y + s.h - py));
            }
          }
          break;
        }
        case 'stripes': {
          const gap = s.gap || 8;
          ctx.fillStyle = s.c;
          if (s.vertical === false) for (let yy = s.y; yy < s.y + s.h; yy += gap) ctx.fillRect(s.x, yy, s.w, Math.max(1, s.thick || 2));
          else for (let xx = s.x; xx < s.x + s.w; xx += gap) ctx.fillRect(xx, s.y, Math.max(1, s.thick || 2), s.h);
          break;
        }
        case 'trees': {
          // jedle na obzoru
          const n = s.n || 8;
          for (let i = 0; i < n; i++) {
            const bx = s.x + (i + 0.5) * (s.w / n) + ((i * 37) % 11) - 5;
            const bh = s.h * (0.7 + ((i * 53) % 30) / 100);
            ctx.fillStyle = i % 2 ? s.c : (s.c2 || s.c);
            ctx.beginPath();
            ctx.moveTo(bx, s.y + s.h - bh);
            ctx.lineTo(bx + (s.tw || 12) / 2, s.y + s.h);
            ctx.lineTo(bx - (s.tw || 12) / 2, s.y + s.h);
            ctx.closePath(); ctx.fill();
          }
          break;
        }
        default: break;
      }
      ctx.restore();
    },

    layer(ctx, list, fg, skipPlaceholders) {
      if (!list) return;
      list.forEach((s) => {
        if (s.z !== undefined) return; // řadí se podle hloubky mezi postavy
        if (!!s.fg !== !!fg) return;
        if (skipPlaceholders && !s.keep) return; // scénu kreslí hotové pozadí
        this.shape(ctx, s);
      });
    },

    /* ---------- postavy ---------- */
    actor(ctx, def, x, y, scale, facing, phase, sitting) {
      const c = def.colors || {};
      const skin = c.skin || '#d9a887', hair = c.hair || '#3b2a1c';
      const top = c.top || '#5c6b7a', bottom = c.bottom || '#2e3440';
      const h = (def.height || 52) * scale;
      const img = TP.assets.img(def.sprite);

      ctx.save();
      ctx.fillStyle = pal.shadow;
      ctx.beginPath(); ctx.ellipse(x, y, h * 0.20, h * 0.05, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      if (img) { ctx.drawImage(img, x - (img.width * scale) / 2, y - img.height * scale, img.width * scale, img.height * scale); return; }

      if (def.shape === 'dog') { this.dog(ctx, def, x, y, scale, facing, phase); return; }

      const swing = sitting ? 0 : Math.sin(phase) * h * 0.07;
      const bob = sitting ? 0 : Math.abs(Math.sin(phase)) * h * 0.015;
      const bw = h * 0.30, bx = x - bw / 2;
      const hipY = y - (sitting ? h * 0.30 : h * 0.34) - bob;
      const shoY = y - (sitting ? h * 0.64 : h * 0.74) - bob;

      ctx.save();
      if (sitting) {
        const kneeX = x + facing * h * 0.22;
        ctx.fillStyle = bottom;
        // stehno dopředu
        ctx.fillRect(Math.min(x, kneeX) - h * 0.04, hipY - h * 0.02, h * 0.30, h * 0.12);
        // lýtko dolů
        ctx.fillRect(kneeX - h * 0.05, hipY, h * 0.10, h * 0.30);
        ctx.fillStyle = pal.ink;
        ctx.fillRect(kneeX - h * 0.06, y - h * 0.04, h * 0.14, h * 0.04);
      } else {
        ctx.fillStyle = bottom;
        ctx.fillRect(x - h * 0.13 + swing, hipY, h * 0.11, h * 0.34);
        ctx.fillRect(x + h * 0.02 - swing, hipY, h * 0.11, h * 0.34);
        ctx.fillStyle = pal.ink;
        ctx.fillRect(x - h * 0.14 + swing, y - h * 0.04, h * 0.13, h * 0.04);
        ctx.fillRect(x + h * 0.01 - swing, y - h * 0.04, h * 0.13, h * 0.04);
      }

      // trup
      ctx.fillStyle = top;
      ctx.fillRect(bx, shoY, bw, hipY - shoY + h * 0.02);
      if (def.apron) {
        ctx.fillStyle = def.apronColor || '#e9e4d6';
        ctx.fillRect(bx + bw * 0.18, shoY + h * 0.12, bw * 0.64, hipY - shoY - h * 0.08);
      }
      if (def.tie) {
        ctx.fillStyle = def.tie;
        ctx.fillRect(x - h * 0.02, shoY + h * 0.02, h * 0.04, h * 0.18);
      }
      // paže
      ctx.fillStyle = top;
      ctx.fillRect(bx - h * 0.07, shoY + h * 0.02, h * 0.07, h * 0.30);
      ctx.fillRect(bx + bw, shoY + h * 0.02, h * 0.07, h * 0.30);
      ctx.fillStyle = skin;
      ctx.fillRect(bx - h * 0.07, shoY + h * 0.30, h * 0.07, h * 0.06);
      ctx.fillRect(bx + bw, shoY + h * 0.30, h * 0.07, h * 0.06);

      // hlava
      const hw = h * 0.26, hh = h * 0.24, hx = x - hw / 2, hy = shoY - hh - h * 0.02;
      ctx.fillStyle = skin; ctx.fillRect(hx, hy, hw, hh);
      ctx.fillStyle = hair;
      ctx.fillRect(hx - h * 0.01, hy - h * 0.03, hw + h * 0.02, hh * (def.longHair ? 0.42 : 0.34));
      if (def.longHair) {
        ctx.fillRect(hx - h * 0.02, hy, h * 0.04, hh * 1.05);
        ctx.fillRect(hx + hw - h * 0.02, hy, h * 0.04, hh * 1.05);
      }
      if (def.hat) {
        ctx.fillStyle = def.hat;
        ctx.fillRect(hx - h * 0.05, hy - h * 0.04, hw + h * 0.10, h * 0.03);
        ctx.fillRect(hx, hy - h * 0.10, hw, h * 0.07);
      }
      if (def.glasses) {
        ctx.fillStyle = '#1b1b1b';
        ctx.fillRect(hx + hw * 0.08, hy + hh * 0.36, hw * 0.84, h * 0.03);
      } else {
        ctx.fillStyle = pal.ink;
        const ex = facing > 0 ? hw * 0.52 : hw * 0.22;
        ctx.fillRect(hx + ex, hy + hh * 0.42, h * 0.025, h * 0.03);
        ctx.fillRect(hx + ex - h * 0.06, hy + hh * 0.42, h * 0.025, h * 0.03);
      }
      ctx.restore();
    },

    dog(ctx, def, x, y, scale, facing, phase) {
      const c = def.colors || {};
      const fur = c.top || '#6b4a2f', furDark = c.hair || '#4a3220';
      const h = (def.height || 26) * scale;
      const swing = Math.sin(phase) * h * 0.12;
      ctx.save();
      ctx.fillStyle = fur;
      ctx.beginPath(); ctx.ellipse(x, y - h * 0.45, h * 0.42, h * 0.24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = furDark;
      ctx.fillRect(x - h * 0.32 + swing, y - h * 0.3, h * 0.1, h * 0.3);
      ctx.fillRect(x + h * 0.22 - swing, y - h * 0.3, h * 0.1, h * 0.3);
      ctx.fillRect(x - h * 0.18 - swing, y - h * 0.3, h * 0.1, h * 0.3);
      ctx.fillRect(x + h * 0.08 + swing, y - h * 0.3, h * 0.1, h * 0.3);
      // ocas
      ctx.fillRect(x - facing * h * 0.46, y - h * 0.72 + Math.sin(phase * 2) * h * 0.06, h * 0.1, h * 0.3);
      // hlava
      ctx.fillStyle = fur;
      ctx.fillRect(x + facing * h * 0.32 - h * 0.14, y - h * 0.95, h * 0.28, h * 0.26);
      ctx.fillRect(x + facing * h * 0.46 - h * 0.08, y - h * 0.82, h * 0.2 * facing, h * 0.12);
      ctx.fillStyle = furDark;
      ctx.fillRect(x + facing * h * 0.24, y - h * 1.06, h * 0.08, h * 0.12);
      ctx.fillStyle = pal.ink;
      ctx.fillRect(x + facing * h * 0.38, y - h * 0.88, h * 0.04, h * 0.04);
      ctx.restore();
    },

    portrait(ctx, def, x, y, size) {
      const c = (def && def.colors) || {};
      ctx.save();
      ctx.fillStyle = '#1a1614'; ctx.fillRect(x, y, size, size);
      ctx.strokeStyle = '#4a3f33'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
      const img = TP.assets.img(def && def.portraitImg);
      if (img) { ctx.drawImage(img, x + 1, y + 1, size - 2, size - 2); ctx.restore(); return; }
      const s = size;
      // ramena
      ctx.fillStyle = c.top || '#5c6b7a';
      ctx.fillRect(x + s * 0.12, y + s * 0.72, s * 0.76, s * 0.28);
      if (def && def.shape === 'dog') {
        ctx.fillStyle = c.top || '#6b4a2f';
        ctx.fillRect(x + s * 0.22, y + s * 0.34, s * 0.56, s * 0.42);
        ctx.fillStyle = c.hair || '#4a3220';
        ctx.fillRect(x + s * 0.16, y + s * 0.2, s * 0.14, s * 0.24);
        ctx.fillRect(x + s * 0.7, y + s * 0.2, s * 0.14, s * 0.24);
        ctx.fillStyle = pal.ink;
        ctx.fillRect(x + s * 0.34, y + s * 0.5, s * 0.07, s * 0.07);
        ctx.fillRect(x + s * 0.59, y + s * 0.5, s * 0.07, s * 0.07);
        ctx.fillRect(x + s * 0.44, y + s * 0.62, s * 0.12, s * 0.08);
        ctx.restore(); return;
      }
      // hlava
      ctx.fillStyle = c.skin || '#d9a887';
      ctx.fillRect(x + s * 0.26, y + s * 0.24, s * 0.48, s * 0.52);
      ctx.fillStyle = c.hair || '#3b2a1c';
      ctx.fillRect(x + s * 0.22, y + s * 0.16, s * 0.56, s * 0.18);
      if (def && def.longHair) {
        ctx.fillRect(x + s * 0.2, y + s * 0.2, s * 0.08, s * 0.5);
        ctx.fillRect(x + s * 0.72, y + s * 0.2, s * 0.08, s * 0.5);
      }
      if (def && def.hat) {
        ctx.fillStyle = def.hat;
        ctx.fillRect(x + s * 0.14, y + s * 0.14, s * 0.72, s * 0.06);
        ctx.fillRect(x + s * 0.24, y + s * 0.04, s * 0.52, s * 0.12);
      }
      ctx.fillStyle = pal.ink;
      if (def && def.glasses) ctx.fillRect(x + s * 0.28, y + s * 0.44, s * 0.44, s * 0.06);
      else {
        ctx.fillRect(x + s * 0.36, y + s * 0.44, s * 0.06, s * 0.06);
        ctx.fillRect(x + s * 0.58, y + s * 0.44, s * 0.06, s * 0.06);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(x + s * 0.42, y + s * 0.62, s * 0.16, s * 0.03);
      ctx.restore();
    },

    /* ---------- bublina ---------- */
    bubble(ctx, b) {
      if (!b) return;
      ctx.save();
      ctx.font = font(10);
      const maxw = 210;
      const lines = U.wrap(ctx, b.text, maxw);
      let wdt = 0;
      lines.forEach((l) => { wdt = Math.max(wdt, ctx.measureText(l).width); });
      const bw = wdt + 12, bh = lines.length * 12 + 8;
      let bx = U.clamp(b.x - bw / 2, 4, W - bw - 4);
      let by = U.clamp(b.y - bh - 10, 16, SCENE_H - bh - 4);
      ctx.fillStyle = 'rgba(12,10,10,0.82)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1;
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      ctx.fillStyle = b.color || pal.bone;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      lines.forEach((l, i) => ctx.fillText(l, bx + bw / 2, by + 5 + i * 12));
      ctx.restore();
    },

    /* ---------- UI ---------- */
    topBar(ctx, text) {
      if (!text) return;
      ctx.save();
      ctx.font = font(10);
      const w = ctx.measureText(text).width + 14;
      ctx.fillStyle = 'rgba(10,9,9,0.72)';
      ctx.fillRect(W / 2 - w / 2, 2, w, 15);
      ctx.fillStyle = pal.gold;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, W / 2, 10);
      ctx.restore();
    },

    inventory(ctx, game) {
      ctx.save();
      ctx.fillStyle = '#17120f'; ctx.fillRect(0, BAR_Y, W, BAR_H);
      ctx.fillStyle = '#3a2d23'; ctx.fillRect(0, BAR_Y, W, 2);
      const inv = TP.state.inv;
      for (let i = 0; i < 14; i++) {
        const x = SLOT_X + i * (SLOT + SLOT_GAP);
        ctx.fillStyle = '#201914'; ctx.fillRect(x, SLOT_Y, SLOT, SLOT);
        ctx.strokeStyle = '#332a21'; ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, SLOT_Y + 0.5, SLOT - 1, SLOT - 1);
        const id = inv[i];
        if (!id) continue;
        const it = TP.data.items[id] || {};
        const sel = game.selected === id;
        const img = TP.assets.img(it.icon);
        if (img) ctx.drawImage(img, x + 2, SLOT_Y + 2, SLOT - 4, SLOT - 4);
        else {
          ctx.fillStyle = it.color || '#7a6a58';
          ctx.fillRect(x + 4, SLOT_Y + 4, SLOT - 8, SLOT - 8);
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.fillRect(x + 4, SLOT_Y + SLOT - 11, SLOT - 8, 7);
          ctx.fillStyle = pal.bone; ctx.font = font(9, true);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(it.short || '?', x + SLOT / 2, SLOT_Y + 11);
        }
        if (sel) {
          ctx.strokeStyle = pal.gold; ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, SLOT_Y + 1, SLOT - 2, SLOT - 2);
        }
      }
      // tlačítka
      game.buttons = [
        { id: 'sound', x: 556, y: SLOT_Y, w: 30, h: SLOT, label: TP.audio.on ? '♪' : 'x' },
        { id: 'menu', x: 592, y: SLOT_Y, w: 38, h: SLOT, label: 'MENU' },
      ];
      game.buttons.forEach((b) => {
        ctx.fillStyle = '#241c16'; ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = '#3d3125'; ctx.lineWidth = 1; ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
        ctx.fillStyle = pal.paper; ctx.font = font(b.id === 'sound' ? 12 : 9, true);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);
      });
      ctx.restore();
    },

    dialogueBox(ctx, game) {
      const d = TP.dialogue;
      if (!d.active || !d.node) return;
      const who = d.speaker();
      const def = TP.data.actors[who] || {};
      const line = d.currentLine();

      ctx.save();
      ctx.font = font(11);
      const textLines = line === undefined ? [] : U.wrap(ctx, line, W - 92).slice(0, 3);
      const nCh = d.choices.length;
      let h = 16 + textLines.length * 14 + (nCh ? nCh * 15 + 8 : 10);
      h = Math.max(h, 58);
      const y0 = Math.max(150, H - h);

      ctx.fillStyle = 'rgba(9,8,8,0.93)'; ctx.fillRect(0, y0, W, H - y0);
      ctx.fillStyle = '#3a2d23'; ctx.fillRect(0, y0, W, 2);

      const ps = Math.min(46, H - y0 - 12);
      this.portrait(ctx, def, 9, y0 + 7, ps);
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillStyle = def.color || pal.gold;
      ctx.font = font(9, true);
      ctx.fillText((def.name || '').toUpperCase(), 64, y0 + 7);

      ctx.font = font(11); ctx.fillStyle = pal.bone;
      textLines.forEach((l, i) => ctx.fillText(l, 64, y0 + 20 + i * 14));

      game.choiceRects = [];
      if (nCh) {
        const startY = y0 + 20 + textLines.length * 14 + 4;
        d.choices.forEach((c, i) => {
          const ry = startY + i * 15;
          const hov = game.hoverChoice === i;
          ctx.font = font(10);
          ctx.fillStyle = hov ? pal.gold : '#bfae90';
          ctx.fillText((hov ? '\u25B8 ' : '  ') + c.text, 58, ry);
          game.choiceRects.push({ x: 52, y: ry - 3, w: W - 66, h: 14 });
        });
      } else {
        ctx.font = font(8);
        ctx.fillStyle = '#6d5f4e';
        ctx.textAlign = 'right';
        ctx.fillText('klikni pro pokra\u010dov\u00e1n\u00ed', W - 10, H - 11);
      }
      ctx.restore();
    },

    fx(ctx, fx) {
      if (!fx) return;
      const p = U.clamp(fx.t / fx.dur, 0, 1);
      if (fx.type === 'red') {
        const a = Math.sin(p * Math.PI) * 0.7;
        ctx.save();
        ctx.globalAlpha = a * 0.75;
        ctx.fillStyle = '#7a0f14'; ctx.fillRect(0, 0, W, SCENE_H);
        ctx.globalAlpha = a;
        // závěsy
        ctx.fillStyle = '#5c0b10';
        for (let x = 0; x < W; x += 24) ctx.fillRect(x, 0, 12, SCENE_H);
        ctx.fillStyle = '#2a0508';
        for (let x = 12; x < W; x += 24) ctx.fillRect(x, 0, 4, SCENE_H);
        // cikcak podlaha
        ctx.globalAlpha = a * 0.9;
        ctx.fillStyle = '#efe7d8';
        for (let x = -20; x < W + 20; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, SCENE_H); ctx.lineTo(x + 20, SCENE_H - 46); ctx.lineTo(x + 40, SCENE_H);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      } else if (fx.type === 'white') {
        ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI); ctx.fillStyle = '#efe7d8';
        ctx.fillRect(0, 0, W, H); ctx.restore();
      }
    },

    /** Trvalé přebarvení scény — finále: rudá, zbytek vyšedne. */
    tint(ctx, kind) {
      if (!kind) return;
      ctx.save();
      if (kind === 'red') {
        ctx.fillStyle = 'rgba(70,78,72,0.28)'; ctx.fillRect(0, 0, W, SCENE_H);
        ctx.fillStyle = 'rgba(122,15,20,0.34)'; ctx.fillRect(0, 0, W, SCENE_H);
        ctx.fillStyle = 'rgba(12,4,6,0.30)';
        ctx.fillRect(0, 0, W, 26); ctx.fillRect(0, SCENE_H - 26, W, 26);
        ctx.fillRect(0, 0, 26, SCENE_H); ctx.fillRect(W - 26, 0, 26, SCENE_H);
      }
      ctx.restore();
    },

    fade(ctx, alpha) {
      if (alpha <= 0) return;
      ctx.save(); ctx.globalAlpha = U.clamp(alpha, 0, 1);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
    },
  };

  TP.render = render;
})();

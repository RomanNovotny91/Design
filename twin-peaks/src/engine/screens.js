/* Titulní obrazovka, menu a závěrečná karta. */
(function () {
  const TP = (window.TP = window.TP || {});

  function panelButton(ctx, r, label, hot) {
    ctx.fillStyle = hot ? '#2e2319' : '#1d1712';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = '#4a3b2b'; ctx.lineWidth = 1;
    ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    ctx.fillStyle = '#e8dcc0'; ctx.font = TP.render.font(11, true);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2);
  }

  TP.screens = {
    title(ctx, game) {
      const R = TP.render, W = R.W, H = R.H;
      ctx.fillStyle = '#0b0f0c'; ctx.fillRect(0, 0, W, H);
      R.shape(ctx, { t: 'grad', x: 0, y: 0, w: W, h: 200, c1: '#16211a', c2: '#0b0f0c' });
      R.shape(ctx, { t: 'trees', x: -10, y: 90, w: 300, h: 150, c: '#0d1710', c2: '#101c13', n: 9, tw: 46 });
      R.shape(ctx, { t: 'trees', x: 360, y: 80, w: 300, h: 170, c: '#0d1710', c2: '#101c13', n: 9, tw: 46 });
      R.shape(ctx, { t: 'rect', x: 0, y: 236, w: W, h: 124, c: '#080b09' });
      // silnice
      R.shape(ctx, { t: 'poly', pts: [[250, 236], [390, 236], [520, 360], [120, 360]], c: '#1a1a1a' });
      for (let i = 0; i < 5; i++) {
        const t = i / 5;
        R.shape(ctx, { t: 'rect', x: 320 - 3 - t * 4, y: 244 + t * 120, w: 6 + t * 8, h: 8 + t * 10, c: '#c9b26a' });
      }
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillStyle = '#7a0f14'; ctx.font = R.font(30, true);
      ctx.fillText('TWIN PEAKS', W / 2 + 2, 42);
      ctx.fillStyle = '#d02b2b';
      ctx.fillText('TWIN PEAKS', W / 2, 40);
      ctx.fillStyle = '#e8dcc0'; ctx.font = R.font(15, true);
      ctx.fillText('Ztracená kazeta', W / 2, 78);
      ctx.fillStyle = '#8d9aa0'; ctx.font = R.font(9);
      ctx.fillText('krátká adventura · soukromý dárek pro Natálii', W / 2, 100);

      game.titleRects = [];
      const bw = 190, bx = W / 2 - bw / 2;
      if (game.hasSave) {
        const r = { id: 'continue', x: bx, y: 150, w: bw, h: 26 };
        panelButton(ctx, r, 'Pokračovat'); game.titleRects.push(r);
      }
      const r2 = { id: 'new', x: bx, y: game.hasSave ? 182 : 160, w: bw, h: 26 };
      panelButton(ctx, r2, 'Nová hra'); game.titleRects.push(r2);
      const r3 = { id: 'sound', x: bx, y: r2.y + 32, w: bw, h: 22 };
      panelButton(ctx, r3, 'Zvuk: ' + (TP.audio.on ? 'zapnutý' : 'vypnutý')); game.titleRects.push(r3);

      ctx.fillStyle = '#5c5344'; ctx.font = R.font(8); ctx.textAlign = 'center';
      ctx.fillText('levý klik = jít a použít · pravý klik nebo podržení = prohlédnout', W / 2, H - 22);
    },

    menu(ctx, game) {
      const R = TP.render, W = R.W, H = R.H;
      ctx.fillStyle = 'rgba(6,5,5,0.78)'; ctx.fillRect(0, 0, W, H);
      const pw = 220, ph = 168, px = W / 2 - pw / 2, py = H / 2 - ph / 2;
      ctx.fillStyle = '#12100e'; ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = '#4a3b2b'; ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
      ctx.fillStyle = '#d02b2b'; ctx.font = R.font(12, true);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('MENU', W / 2, py + 12);
      ctx.fillStyle = '#6d5f4e'; ctx.font = R.font(8);
      ctx.fillText('hra se ukládá automaticky', W / 2, py + 30);
      game.menuRects = [
        { id: 'resume', x: px + 20, y: py + 48, w: pw - 40, h: 24 },
        { id: 'sound', x: px + 20, y: py + 78, w: pw - 40, h: 24 },
        { id: 'title', x: px + 20, y: py + 108, w: pw - 40, h: 24 },
        { id: 'new', x: px + 20, y: py + 136, w: pw - 40, h: 22 },
      ];
      panelButton(ctx, game.menuRects[0], 'Pokračovat');
      panelButton(ctx, game.menuRects[1], 'Zvuk: ' + (TP.audio.on ? 'zap' : 'vyp'));
      panelButton(ctx, game.menuRects[2], 'Titulní obrazovka');
      panelButton(ctx, game.menuRects[3], 'Nová hra (smaže postup)');
    },

    end(ctx, game) {
      const R = TP.render, W = R.W, H = R.H;
      ctx.fillStyle = '#0b0708'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#5c0b10';
      for (let x = 0; x < W; x += 24) ctx.fillRect(x, 0, 12, H);
      ctx.fillStyle = 'rgba(11,7,8,0.72)'; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillStyle = '#d02b2b'; ctx.font = R.font(22, true);
      ctx.fillText('KONEC', W / 2, 90);
      ctx.fillStyle = '#e8dcc0'; ctx.font = R.font(11);
      const lines = [
        'Kazeta se vrátila tam, kam patří.',
        'Káva je čerstvá, koláč taky.',
        '',
        'A sen o Natálii zůstal na pásce.',
      ];
      lines.forEach((l, i) => ctx.fillText(l, W / 2, 132 + i * 16));
      ctx.fillStyle = '#6d5f4e'; ctx.font = R.font(9);
      ctx.fillText('klikni pro návrat na titulní obrazovku', W / 2, H - 40);
      game.titleRects = [];
    },
  };
})();

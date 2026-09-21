/* Twin Peaks: Ztracená kazeta — drobné pomocné funkce. */
(function () {
  const TP = (window.TP = window.TP || {});

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function dist(x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1; return Math.sqrt(dx * dx + dy * dy); }

  function pointInPoly(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  function closestOnSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return [ax, ay];
    let t = ((px - ax) * dx + (py - ay) * dy) / len2;
    t = clamp(t, 0, 1);
    return [ax + dx * t, ay + dy * t];
  }

  /** Nejbližší bod uvnitř (nebo na hraně) walkboxu. */
  function clampToPoly(x, y, poly) {
    if (!poly || poly.length < 3) return [x, y];
    if (pointInPoly(x, y, poly)) return [x, y];
    let best = null, bestD = Infinity;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const p = closestOnSegment(x, y, poly[j][0], poly[j][1], poly[i][0], poly[i][1]);
      const d = dist(x, y, p[0], p[1]);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best || [x, y];
  }

  /** Zalomení textu na řádky podle šířky v pixelech. */
  function wrap(ctx, text, maxWidth) {
    const out = [];
    String(text).split('\n').forEach((para) => {
      const words = para.split(' ');
      let line = '';
      words.forEach((w) => {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width > maxWidth && line) { out.push(line); line = w; }
        else line = test;
      });
      out.push(line);
    });
    return out;
  }

  function rectHit(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  TP.util = { clamp, lerp, dist, pointInPoly, closestOnSegment, clampToPoly, wrap, rectHit };
})();

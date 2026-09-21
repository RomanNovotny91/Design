/* Stav hry: vlajky, inventář, pozice. Ukládá se automaticky do localStorage. */
(function () {
  const TP = (window.TP = window.TP || {});
  const KEY = 'twinpeaks-ztracena-kazeta-v1';

  const state = {
    room: null,
    x: 320, y: 300, facing: 1,
    flags: {},
    inv: [],
    seen: {},
    version: 1,

    reset() {
      this.room = null;
      this.flags = {};
      this.inv = [];
      this.seen = {};
      this.x = 320; this.y = 300; this.facing = 1;
      try { localStorage.removeItem(KEY); } catch (e) { /* soukromý režim */ }
    },

    flag(name) { return !!this.flags[name]; },
    setFlag(name, val) {
      const v = val === undefined ? true : !!val;
      const changed = !!this.flags[name] !== v;
      this.flags[name] = v;
      if (changed) this.save();
      return changed;
    },

    has(id) { return this.inv.indexOf(id) >= 0; },
    add(id) { if (!this.has(id)) { this.inv.push(id); this.save(); } },
    remove(id) {
      const i = this.inv.indexOf(id);
      if (i >= 0) { this.inv.splice(i, 1); this.save(); }
    },

    markSeen(key) { this.seen[key] = true; this.save(); },
    wasSeen(key) { return !!this.seen[key]; },

    save() {
      try {
        localStorage.setItem(KEY, JSON.stringify({
          v: this.version, room: this.room, x: this.x, y: this.y,
          facing: this.facing, flags: this.flags, inv: this.inv, seen: this.seen,
        }));
      } catch (e) { /* ukládání není kritické */ }
    },

    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return false;
        const d = JSON.parse(raw);
        if (!d || d.v !== this.version || !d.room) return false;
        this.room = d.room; this.x = d.x; this.y = d.y; this.facing = d.facing || 1;
        this.flags = d.flags || {}; this.inv = d.inv || []; this.seen = d.seen || {};
        return true;
      } catch (e) { return false; }
    },
  };

  TP.state = state;
})();

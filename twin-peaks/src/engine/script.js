/* Vyhodnocování podmínek a spouštění akcí (skriptovací vrstva nad daty).
   Akce se dávkují do zásobníku rámců, aby mohly čekat na chůzi, repliku
   nebo dokončený dialog, aniž by se blokovala smyčka hry. */
(function () {
  const TP = (window.TP = window.TP || {});

  const script = {
    frames: [],
    blocker: null,

    /** Podmínka: řetězec = vlajka, nebo objekt {not|all|any|has|nohas|flag}. */
    check(cond) {
      if (cond === undefined || cond === null) return true;
      if (typeof cond === 'string') return TP.state.flag(cond);
      if (Array.isArray(cond)) return cond.every((c) => this.check(c));
      if (cond.not !== undefined) return !this.check(cond.not);
      if (cond.all) return cond.all.every((c) => this.check(c));
      if (cond.any) return cond.any.some((c) => this.check(c));
      if (cond.has !== undefined) return TP.state.has(cond.has);
      if (cond.nohas !== undefined) return !TP.state.has(cond.nohas);
      if (cond.flag !== undefined) return TP.state.flag(cond.flag);
      if (cond.room !== undefined) return TP.state.room === cond.room;
      return true;
    },

    busy() { return this.frames.length > 0 || !!this.blocker; },

    run(ops) {
      if (!ops) return;
      const list = Array.isArray(ops) ? ops : [ops];
      if (!list.length) return;
      this.frames.push({ ops: list, i: 0 });
    },

    clear() { this.frames = []; this.blocker = null; },

    update(dt) {
      let guard = 0;
      while (guard++ < 200) {
        if (this.blocker) {
          if (!this.blocker(dt)) return;
          this.blocker = null;
        }
        if (!this.frames.length) return;
        const f = this.frames[this.frames.length - 1];
        if (f.i >= f.ops.length) { this.frames.pop(); continue; }
        const op = f.ops[f.i++];
        this.exec(op);
      }
    },

    exec(op) {
      if (!op) return;
      const g = TP.game;

      if (op.if !== undefined) {
        const branch = this.check(op.if) ? op.then : op.else;
        if (branch) this.run(branch);
        return;
      }
      if (op.say !== undefined) {
        const by = op.by || 'natalie';
        g.showBubble(by, op.say);
        const dur = Math.max(1100, String(op.say).length * 58);
        let t = 0;
        this.blocker = (dt) => {
          t += dt;
          if (g.skipRequested) { g.skipRequested = false; g.hideBubble(); return true; }
          if (t >= dur) { g.hideBubble(); return true; }
          return false;
        };
        return;
      }
      if (op.wait !== undefined) {
        let t = 0;
        this.blocker = (dt) => { t += dt; return t >= op.wait; };
        return;
      }
      if (op.get !== undefined) {
        const it = TP.data.items[op.get];
        TP.state.add(op.get);
        TP.audio.sfx('take');
        if (it && op.silent !== true) this.run([{ say: it.takeLine || ('Beru si ' + (it.acc || it.name) + '.') }]);
        return;
      }
      if (op.drop !== undefined) { TP.state.remove(op.drop); return; }
      if (op.flag !== undefined) { TP.state.setFlag(op.flag, true); TP.audio.sfx('flag'); return; }
      if (op.unflag !== undefined) { TP.state.setFlag(op.unflag, false); return; }
      if (op.quiet !== undefined) { TP.state.setFlag(op.quiet, true); return; }
      if (op.dialog !== undefined) {
        TP.dialogue.start(op.dialog);
        this.blocker = () => !TP.dialogue.active;
        return;
      }
      if (op.go !== undefined) {
        g.changeRoom(op.go, op.at, op.facing);
        this.blocker = () => !g.fading;
        return;
      }
      if (op.walkTo !== undefined) {
        g.walkTo(op.walkTo[0], op.walkTo[1]);
        this.blocker = () => !g.player.walking;
        return;
      }
      if (op.face !== undefined) { g.player.facing = op.face === 'left' ? -1 : 1; return; }
      if (op.actor !== undefined) {
        g.moveActor(op.actor, op.to, op.hide);
        return;
      }
      if (op.sfx !== undefined) { TP.audio.sfx(op.sfx); return; }
      if (op.music !== undefined) { TP.audio.music(op.music, op.reverse); return; }
      if (op.fx !== undefined) {
        g.startFx(op.fx, op.duration || 2500);
        this.blocker = () => !g.fx || g.fx.done;
        return;
      }
      if (op.tint !== undefined) { g.tint = op.tint; return; }
      if (op.shake !== undefined) { g.shake = op.shake; return; }
      if (op.end !== undefined) { g.endGame(op.end); return; }
      if (op.credits !== undefined) { g.endGame(true); return; }
    },
  };

  TP.script = script;
})();

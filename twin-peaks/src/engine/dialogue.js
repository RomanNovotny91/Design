/* Dialogy jako stromy. Uzel má repliku a buď pokračování, nebo volby. */
(function () {
  const TP = (window.TP = window.TP || {});

  const dialogue = {
    active: false,
    treeId: null,
    tree: null,
    node: null,
    nodeId: null,
    lines: [],
    lineIndex: 0,
    choices: [],
    pending: [],

    start(id) {
      const tree = TP.data.dialogues[id];
      if (!tree) { console.warn('Neznámý dialog:', id); return; }
      this.treeId = id;
      this.tree = tree;
      this.pending = [];
      this.active = true;
      this.goTo(tree.start);
    },

    goTo(nodeId) {
      if (!nodeId) { this.end(); return; }
      const node = this.tree.nodes[nodeId];
      if (!node) { this.end(); return; }
      this.nodeId = nodeId;
      this.node = node;
      if (node.do) this.applyOps(node.do);
      if (node.once) TP.state.markSeen('dlg:' + this.treeId + ':' + nodeId);
      const text = node.text;
      this.lines = text === undefined ? [] : (Array.isArray(text) ? text.slice() : [text]);
      this.lineIndex = 0;
      this.choices = [];
      if (!this.lines.length) this.afterLines();
    },

    /** Vlajky a předměty musí platit hned (ovlivňují nabídku voleb). */
    applyOps(ops) {
      (Array.isArray(ops) ? ops : [ops]).forEach((op) => {
        if (!op) return;
        if (op.flag !== undefined) TP.state.setFlag(op.flag, true);
        else if (op.unflag !== undefined) TP.state.setFlag(op.unflag, false);
        else if (op.get !== undefined) { TP.state.add(op.get); TP.audio.sfx('take'); }
        else if (op.drop !== undefined) TP.state.remove(op.drop);
        else if (op.sfx !== undefined) TP.audio.sfx(op.sfx);
        else if (op.music !== undefined) TP.audio.music(op.music, op.reverse);
        else this.pending.push(op); // zbytek (go, fx, say, end) až po dialogu
      });
    },

    afterLines() {
      const node = this.node;
      if (node.choices) {
        this.choices = node.choices.filter((c) => {
          if (c.if !== undefined && !TP.script.check(c.if)) return false;
          if (c.once && TP.state.wasSeen('choice:' + this.treeId + ':' + c.once)) return false;
          return true;
        });
        if (!this.choices.length) { this.goTo(node.next); return; }
        return;
      }
      if (node.end) { this.end(); return; }
      this.goTo(node.next);
    },

    /** Kliknutí do textu: další řádek, nebo posun na další uzel. */
    advance() {
      if (this.choices.length) return;
      if (this.lineIndex < this.lines.length - 1) { this.lineIndex++; return; }
      this.afterLines();
    },

    pick(i) {
      const c = this.choices[i];
      if (!c) return;
      if (c.once) TP.state.markSeen('choice:' + this.treeId + ':' + c.once);
      this.choices = [];
      TP.audio.sfx('click');
      if (c.do) this.applyOps(c.do);
      if (c.end) { this.end(); return; }
      this.goTo(c.to);
    },

    end() {
      this.active = false;
      this.tree = null; this.node = null; this.choices = []; this.lines = [];
      const ops = this.pending;
      this.pending = [];
      if (ops.length) TP.script.run(ops);
    },

    currentLine() { return this.lines[this.lineIndex]; },
    speaker() {
      const node = this.node;
      if (!node) return null;
      const by = Array.isArray(node.by) ? node.by[Math.min(this.lineIndex, node.by.length - 1)] : node.by;
      return by || 'natalie';
    },
  };

  TP.dialogue = dialogue;
})();

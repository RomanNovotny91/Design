/* Zvuk. Když v manifestu leží skutečné soubory, hrají se ty; jinak si engine
   vystačí s jednoduchým syntetizátorem (WebAudio), aby hra nebyla němá. */
(function () {
  const TP = (window.TP = window.TP || {});

  const audio = {
    ctx: null,
    on: true,
    musicNodes: [],
    musicTimer: null,
    current: null,
    reversed: false,

    init() {
      if (this.ctx) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.28;
        this.master.connect(this.ctx.destination);
      } catch (e) { this.ctx = null; }
    },

    resume() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    toggle() {
      this.on = !this.on;
      if (!this.on) this.stopMusic();
      else if (this.current) this.music(this.current, this.reversed);
      return this.on;
    },

    note(freq, dur, type, gain, delay) {
      if (!this.on || !this.ctx) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain || 0.2, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(this.master);
      osc.start(t0); osc.stop(t0 + dur + 0.05);
      return osc;
    },

    /** Obrácená obálka — tón se "nasává" místo doznívání. Pro finále. */
    noteReverse(freq, dur, type, gain, delay) {
      if (!this.on || !this.ctx) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq * 0.94, t0);
      osc.frequency.linearRampToValueAtTime(freq, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain || 0.2, t0 + dur * 0.92);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(this.master);
      osc.start(t0); osc.stop(t0 + dur + 0.05);
    },

    sfx(id) {
      this.init();
      if (!this.on || !this.ctx) return;
      const src = TP.assets.audioSrc && TP.assets.audioSrc(id);
      if (src) { try { const a = new Audio(src); a.volume = 0.6; a.play(); return; } catch (e) { /* fallback níž */ } }
      switch (id) {
        case 'click': this.note(880, 0.05, 'square', 0.06); break;
        case 'take': this.note(523, 0.08, 'triangle', 0.12); this.note(784, 0.10, 'triangle', 0.10, 0.06); break;
        case 'no': this.note(180, 0.12, 'sawtooth', 0.08); break;
        case 'flag': this.note(392, 0.12, 'sine', 0.12); this.note(587, 0.18, 'sine', 0.10, 0.09); break;
        case 'tape': this.note(120, 0.5, 'sawtooth', 0.05); break;
        case 'sting': this.note(110, 1.4, 'sawtooth', 0.10); this.note(164, 1.4, 'sine', 0.06, 0.05); break;
        case 'dog': this.note(330, 0.09, 'square', 0.10); this.note(260, 0.12, 'square', 0.08, 0.10); break;
        default: this.note(440, 0.06, 'sine', 0.08);
      }
    },

    /** Smyčka nálady. reverse = pozpátku (finále). */
    music(id, reverse) {
      this.init();
      this.stopMusic();
      this.current = id;
      this.reversed = !!reverse;
      if (!this.on || !this.ctx) return;
      const themes = {
        diner: { root: 196.00, chord: [0, 4, 7, 11], step: 1.6, type: 'sine' },
        town: { root: 146.83, chord: [0, 3, 7, 10], step: 2.0, type: 'triangle' },
        woods: { root: 110.00, chord: [0, 3, 7, 8], step: 2.4, type: 'sine' },
        red: { root: 98.00, chord: [0, 1, 6, 7], step: 1.2, type: 'sawtooth' },
      };
      const th = themes[id] || themes.diner;
      let i = 0;
      const play = () => {
        const semi = th.chord[i % th.chord.length];
        const f = th.root * Math.pow(2, semi / 12);
        const order = this.reversed ? th.chord.length - 1 - (i % th.chord.length) : semi;
        const freq = this.reversed ? th.root * Math.pow(2, th.chord[order] / 12) * 1.5 : f;
        if (this.reversed) this.noteReverse(freq, th.step * 0.95, th.type, 0.09);
        else { this.note(freq, th.step * 0.95, th.type, 0.07); this.note(freq * 2, th.step * 0.5, 'sine', 0.02, th.step * 0.3); }
        i++;
      };
      play();
      this.musicTimer = setInterval(play, th.step * 1000);
    },

    stopMusic() {
      if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
    },
  };

  TP.audio = audio;
})();

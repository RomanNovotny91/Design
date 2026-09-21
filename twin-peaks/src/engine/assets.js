/* Načítání assetů z jednoho manifestu. Když obrázek chybí, scéna se vykreslí
   placeholderem — díky tomu jde pixelart doplnit později bez zásahu do kódu. */
(function () {
  const TP = (window.TP = window.TP || {});

  const assets = {
    manifest: null,
    images: {},
    ready: false,

    load(manifest, done) {
      this.manifest = manifest || { images: {}, audio: {} };
      const ids = Object.keys(this.manifest.images || {});
      if (!ids.length) { this.ready = true; done && done(); return; }
      let left = ids.length;
      const tick = () => { if (--left <= 0) { this.ready = true; done && done(); } };
      ids.forEach((id) => {
        const img = new Image();
        img.onload = tick;
        img.onerror = () => { this.images[id] = null; tick(); };
        img.src = this.manifest.images[id];
        this.images[id] = img;
      });
    },

    /** Obrázek, nebo null když se nenačetl (pak kreslíme placeholder). */
    img(id) {
      const im = id && this.images[id];
      return im && im.complete && im.naturalWidth > 0 ? im : null;
    },

    audioSrc(id) {
      return (this.manifest && this.manifest.audio && this.manifest.audio[id]) || null;
    },
  };

  TP.assets = assets;
})();

/* Logika hádanek na jednom místě. Místnosti si odsud berou hotové sekvence
   akcí, takže se dá vyvážení měnit bez zásahu do enginu. */
(function () {
  const TP = (window.TP = window.TP || {});
  TP.data = TP.data || {};

  const puzzles = {
    /* --- tutoriál: tři kávy --- */
    kava: {
      hosti: {
        hostA: { flag: 'kavaA', line: 'Řidič mlčky přikývne a hrnek podrží oběma rukama.' },
        hostB: { flag: 'kavaB', line: '„Díky, zlato. Venku je mlha jako mlíko.“' },
        hostC: { flag: 'kavaC', line: 'Pán ani nezvedne oči od novin. Hrnek si přitáhne přesně o dva centimetry.' },
      },
    },
    nalij(hostId) {
      const h = puzzles.kava.hosti[hostId];
      if (!h) return [{ say: 'Tomu kávu nenaliju.' }];
      return [
        { if: h.flag, then: [{ say: 'Tenhle hrnek je plný. Víc kávy už by bylo obtěžování.' }], else: [
          { say: 'Naliju kávu. Do tří čtvrtin, jak říkala Norma.' },
          { flag: h.flag },
          { say: h.line },
          { if: { all: ['kavaA', 'kavaB', 'kavaC'] }, then: [
            { by: 'norma', say: 'Tři hrnky a nikomu jsi nešlápla na nohu. Dobrý začátek.' },
            { flag: 'kavaHotova' },
            { by: 'norma', say: 'Běž. A drž se dál od lesa, dokud budeš mít mou zástěru.' },
          ] },
        ] },
      ];
    },

    /* --- Log Lady: zanechané, odebrané, darované --- */
    obeti: {
      hrnek: { flag: 'obetZanechane', slovo: 'zanechané',
        line: 'Polínko je teplé. Hrnek postavím vedle něj na deku.',
        react: 'Něco zanechaného. Muž, který odešel uprostřed věty.' },
      paska: { flag: 'obetOdebrane', slovo: 'odebrané',
        line: 'Pásku položím lepivou stranou vzhůru. Otisk se leskne.',
        react: 'Něco odebraného. Prst, který si myslel, že ho nikdo nevidí.' },
      kolac: { flag: 'obetDarovane', slovo: 'darované',
        line: 'Rozbalím koláč. Višně voní i v téhle zimě.',
        react: 'Něco darovaného. To je vždycky to nejtěžší.' },
    },
    obetuj(itemId) {
      const o = puzzles.obeti[itemId];
      if (!o) return null;
      return [
        { say: o.line },
        { drop: itemId },
        { flag: o.flag },
        { by: 'logLady', say: o.react },
        { if: { all: ['obetZanechane', 'obetOdebrane', 'obetDarovane'] },
          then: [{ dialog: 'polinko_mluvi' }] },
      ];
    },

    /* --- otisky (kombinace mouka + páska) je v items.js --- */
    stav() {
      return {
        kava: TP.state.flag('kavaHotova'),
        jerry: TP.state.flag('jerryZmineny'),
        karta: TP.state.has('karta'),
        otisky: TP.state.flag('otiskyShoda'),
        polinko: TP.state.flag('polinkoPromluvilo'),
      };
    },
  };

  TP.data.puzzles = puzzles;
})();

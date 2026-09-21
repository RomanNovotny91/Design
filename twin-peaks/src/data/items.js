/* Předměty v inventáři. */
(function () {
  const TP = (window.TP = window.TP || {});
  TP.data = TP.data || {};

  TP.data.items = {
    diktafon: {
      name: 'diktafon', acc: 'diktafon', short: 'DIK', color: '#4a5257',
      takeLine: 'Beru si diktafon. Není Cooperův, ale je přesně jako Cooperův.',
      look: [{ say: 'Stejný model, stejné oděrky. Na spodku štítek: 315, Great Northern.' },
             { say: 'Uvnitř kazeta. Hraje jen šum — a pod ním něco, co šum není.' }],
      failLine: 'Nahrávat teď nemá smysl.',
    },
    zapisnik: {
      name: 'zápisník', acc: 'zápisník', short: 'ZÁP', color: '#a08f76',
      takeLine: 'Normin zápisník objednávek. Snad mi to odpustí.',
      look: [{ say: '„Stůl 2: dva koláče, káva. Platil kanadskými. Jerry H.“' },
             { say: 'Jerry Horne. Seděl přesně tam, kde ležel Cooperův diktafon.' }],
    },
    hrnek: {
      name: 'prázdný hrnek', acc: 'hrnek', short: 'HRN', color: '#d9dcdb',
      takeLine: 'Cooperův hrnek. Na dně kruh od kávy jako roční kruh stromu.',
      look: [{ say: 'Něco, co tu někdo zanechal. Ani ho nedopil — odešel uprostřed věty.' }],
    },
    kolac: {
      name: 'koláč s sebou', acc: 'koláč', short: 'KOL', color: '#a81c22',
      takeLine: 'Višňový, zabalený. Norma říká, že se hodí vždycky.',
      look: [{ say: 'Višňový koláč v papíru. Pořád ještě teplý.' }],
    },
    mouka: {
      name: 'hrnek mouky', acc: 'mouku', short: 'MOU', color: '#e8dcc0',
      takeLine: 'Hrnek mouky. V kriminálce se tomu asi říká jinak.',
      look: [{ say: 'Jemná mouka. Drží se všeho, čeho se dotknu — což je přesně to, co potřebuju.' }],
    },
    karta: {
      name: 'univerzální karta', acc: 'kartu', short: 'KAR', color: '#f0c060',
      takeLine: 'Univerzální karta. Otevře všechno v hotelu, prý i věci, co otevřené být nemají.',
      look: [{ say: 'Plastová karta bez popisu. Ben Horne ji hlídá míň než svoje historky o Kanadě.' }],
    },
    uniforma: {
      name: 'uniforma pokojské', acc: 'uniformu', short: 'UNI', color: '#55606b',
      takeLine: 'Uniforma a gumové rukavice. Dneska jsem servírka i pokojská.',
      look: [{ say: 'Šedomodrá uniforma a rukavice. V rukavicích nedělám otisky — to se hodí.' }],
    },
    uctenka: {
      name: 'účtenka z Kanady', acc: 'účtenku', short: 'ÚČT', color: '#d8cba8',
      takeLine: 'Účtenka. Z místa, kde platí jiné peníze.',
      look: [{ say: '„Bar Rendez-vous, Kanada.“ Datum: včera. Dvě whisky a telefon.' }],
    },
    paska: {
      name: 'lepicí páska', acc: 'pásku', short: 'PÁS', color: '#c9903a',
      takeLine: 'Kus lepicí pásky z koše. Na lepivé straně je krásný otisk prstu.',
      look: [{ say: 'Na pásce je otisk palce. Někdo ji odtrhl v rychlosti — něco odebral.' }],
    },
    kapesnik: {
      name: 'kapesník', acc: 'kapesník', short: 'KAP', color: '#efe7d8',
      takeLine: 'Kapesník. Na téhle stanici spotřební materiál.',
      look: [{ say: 'Bílý kapesník. Lucy jich má v šuplíku dvě krabice, a ví proč.' }],
    },
    souprava: {
      name: 'souprava na otisky', acc: 'soupravu', short: 'SOU', color: '#2c4a30',
      takeLine: 'Souprava na otisky. Lucy říká, že ji mám vrátit čistou.',
      look: [{ say: 'Štěteček, fólie a karta se vzorky otisků z kartotéky. Chybí jen prášek.' }],
    },
    mapa: {
      name: 'mapa lesa', acc: 'mapu', short: 'MAP', color: '#6f8f5e',
      takeLine: 'Mapa. Hawk na ni nakreslil křížek a pod něj jednu větu.',
      look: [{ say: 'Ghostwood. Křížek u starého pařezu a Hawkův vzkaz: „Nejdřív navštivte Log Lady.“' }],
    },
  };

  /* Kombinace předmětů. Klíčová logika hry — otisky. */
  TP.data.items.mouka.combine = {
    paska: [
      {
        if: { has: 'souprava' },
        then: [
          { say: 'Štětečkem nanesu mouku na pásku. Prach se chytí přesně tam, kde má.' },
          { sfx: 'flag' },
          { say: 'Otisk je čitelný. Porovnám ho s kartou z kartotéky…' },
          { flag: 'otiskyShoda' },
          { say: 'Jerry Horne. Shoda. Ten otisk sedí jako klíč do zámku.' },
        ],
        else: [{ say: 'Sypat mouku na pásku v ruce? Takhle si jen umažu zástěru. Potřebuju pořádnou soupravu.' }],
      },
    ],
  };
  TP.data.items.souprava.combine = {
    paska: [{ say: 'Souprava sama otisk nevyvolá. Chce to prášek — nebo něco, co se prášku hodně podobá.' }],
    mouka: [{ say: 'Mouka i souprava. Teď potřebuju plochu, na které někdo nechal prst.' }],
  };
  TP.data.items.diktafon.combine = {
    zapisnik: [{ say: 'Diktafon a zápisník. Dvě verze jednoho rána, obě neúplné.' }],
  };
  TP.data.items.kolac.combine = {
    hrnek: [{ say: 'Koláč a prázdný hrnek. Vypadá to skoro jako Cooperovo ráno.' }],
  };
})();

/* Konvice je jen tutoriálový předmět — po dolití se vrací na plotnu. */
(function () {
  const TP = window.TP;
  TP.data.items.konvice = {
    name: 'konvice s kávou', acc: 'konvici', short: 'KÁV', color: '#2a231d',
    takeLine: 'Beru konvici. Norma říká: do tří čtvrtin, jinak to nedojdou.',
    look: [{ say: 'Skleněná konvice. Káva v ní je černá jako říjnové ráno.' }],
    failLine: 'Tohle polít kávou by nepomohlo ničemu.',
  };
})();

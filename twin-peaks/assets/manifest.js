/* Jediné místo, kde se vyměňuje grafika a zvuk.
   Dokud soubor neexistuje, engine kreslí placeholder — hra běží dál.
   Pozadí místnosti: 640×316 px. Postavy: výška ~52 px, kotva dole uprostřed. */
window.TP_MANIFEST = {
  images: {
    // pozadí místností
    bg_diner: 'assets/bg_diner.png',
    bg_mapa: 'assets/bg_mapa.png',
    bg_hotel: 'assets/bg_hotel.png',
    bg_chodba: 'assets/bg_chodba.png',
    bg_pokoj315: 'assets/bg_pokoj315.png',
    bg_stanice: 'assets/bg_stanice.png',
    bg_chatka: 'assets/bg_chatka.png',
    bg_les: 'assets/bg_les.png',
    bg_diner2: 'assets/bg_diner2.png',
    // postavy
    natalie: 'assets/natalie.png',
    cooper: 'assets/cooper.png',
    // portréty do dialogového okna (64×64)
    natalie_portrait: 'assets/natalie_portrait.png',
    cooper_portrait: 'assets/cooper_portrait.png',
  },
  audio: {
    // hudba a ruchy; klíče odpovídají op. {music:'...'} a {sfx:'...'}
    diner: null,
    town: null,
    woods: null,
    red: null,
    take: null,
    tape: null,
    sting: null,
  },
};

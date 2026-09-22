# Twin Peaks: Ztracená kazeta

Krátká point-and-click adventura (30–45 minut) v češtině. Běží v prohlížeči,
bez instalace a bez build kroku.

**Spuštění:** otevři `index.html` v prohlížeči (funguje i dvojklikem z disku),
nebo nahraj celou složku na jakýkoli statický hosting.

## Ovládání

| akce | myš | dotyk |
|---|---|---|
| jít / použít / promluvit | levé tlačítko | ťuknutí |
| prohlédnout | pravé tlačítko | podržení (~0,5 s) |
| předmět na objekt | klik na předmět v liště, pak na objekt | totéž |
| kombinovat předměty | klik na předmět, pak na druhý předmět | totéž |
| přeskočit repliku | klik kamkoli / mezerník | ťuknutí |
| menu | tlačítko MENU / Esc | MENU |

Horní řádek ukazuje, co je pod kurzorem („Vzít: diktafon“). Postup se průběžně
ukládá do `localStorage`, takže zavření záložky nic nezruší.

## Struktura

```
index.html            jediná stránka, natahuje data i engine
assets/manifest.js    jediné místo pro výměnu grafiky a zvuku
assets/README.md      rozměry assetů a paleta
src/engine/           util, assets, audio, state, script, dialogue, render, screens, game
src/data/             actors, items, dialogues, puzzles, rooms
```

Obsah (místnosti, předměty, dialogy, hádanky) je v `src/data/` oddělený od
enginu. Nová scéna se přidá jako další záznam v `rooms.js`, nový rozhovor jako
strom v `dialogues.js` — bez zásahu do kódu.

> **Proč `.js` místo `.json`:** hra se má dát otevřít přímo z disku jako
> `index.html`. Prohlížeče na `file://` blokují `fetch()` kvůli CORS, takže by
> se `.json` nenačetl. Data proto leží v souborech `.js`, které jen plní
> `TP.data.*` — formát je stejný, jen s hlavičkou navíc.

## Datový formát ve zkratce

**Místnost** — pozadí z tvarů (placeholder), walkbox, perspektiva, hotspoty:

```js
diner: {
  bg: 'bg_diner',                       // obrázek z manifestu; chybí-li, kreslí se tvary
  walk: [[26,274],[612,274],[620,308],[22,308]],
  scale: [274, 0.88, 308, 1.06],        // vepředu je postava větší
  art: [ { t:'rect', x:0, y:236, w:528, h:16, c:'#8a7053', z:272 } ],
  hotspots: [ { id:'diktafon', name:'diktafon', x:438, y:216, w:40, h:24,
                walkTo:[438,292], verb:'take', look:[…], use:[…] } ],
}
```

- `z` u tvaru = hloubka: kulisa se seřadí mezi postavy (pult zakryje servírku
  za ním, ale ne hráčku před ním).
- `if` u tvaru i hotspotu = podmínka (`'vlajka'`, `{not:…}`, `{has:'predmet'}`,
  `{all:[…]}`, `{any:[…]}`).

**Akce** jsou seznamy operací: `{say}`, `{get}`, `{drop}`, `{flag}`, `{dialog}`,
`{go}`, `{walkTo}`, `{wait}`, `{if,then,else}`, `{sfx}`, `{music}`, `{fx}`,
`{tint}`, `{actor}`, `{credits}`.

**Dialog** je strom uzlů s `by` / `text` / `next` / `choices` / `do`.

## Grafika a zvuk

První verze běží na barevných placeholderech kreslených z tvarů. Skutečný
pixelart se doplní přes `assets/manifest.js` — jakmile se obrázek pozadí načte,
placeholder se sám přeskočí. Rozměry a paletu má `assets/README.md`.

Zvuk je zatím jednoduchý syntetizátor (WebAudio); v manifestu jsou připravené
klíče pro skutečné soubory. Ve finále se hudba přehrává „pozpátku“ (obrácená
obálka tónu) a obraz se přebarví do rudé.

## Řešení (spoiler)

<details>
<summary>rozklikni</summary>

1. **Double R:** prohlédni diktafon (štítek 315), vezmi ho. Vezmi zápisník
   (stopa: Jerry Horne), mouku, koláč z vitríny, Cooperův hrnek. Vezmi konvici
   a nalij kávu třem hostům — teprve pak tě Norma pustí ven.
2. **Great Northern:** zeptej se Bena na Kanadu, pak vezmi z tabule
   univerzální kartu. Na chodbě si z vozíku vezmi uniformu a rukavice, pak
   otevři pokoj 315. Na stole je účtenka z Kanady, v koši páska s otiskem.
3. **Šerifova stanice:** vezmi kapesník, uklidni Lucy („jednoznačně
   lososová“), dej Andymu kapesník a Lucy ti půjčí soupravu na otisky.
   Zkombinuj **mouku + pásku** → shoda s Jerrym. Hawk ti za to dá mapu lesa.
4. **Log Lady:** polož před polínko **hrnek** (zanechané), **pásku**
   (odebrané) a **koláč** (darované).
5. **Ghostwood:** Jerryho usvědč otiskem, pak na něj použij diktafon.

</details>

## Poznámka

Hra je soukromý dárek pro jednoho člověka. Twin Peaks má vlastníka práv —
nešířit veřejně, nenahrávat na veřejné platformy.

## Jak to dostat na web

**GitHub Pages** — jednou v `Settings → Pages` přepnout *Source* na
**GitHub Actions**, pak workflow `.github/workflows/pages.yml` nasadí web sám
při každém pushi do vývojové větve. Kořen webu je specimen, hra běží na
`/twin-peaks/`. Token GitHub Actions nesmí Pages založit, proto ten jeden
ruční krok.

**Jeden soubor bez hostingu** — `node build-standalone.js` vloží engine i data
přímo do HTML a uloží `dist/twin-peaks-hra.html`. Ten jde poslat mailem nebo
messengerem a otevřít dvojklikem, bez internetu a bez serveru. Po každé změně
obsahu je potřeba sestavit znovu.

# Assety

Všechno se načítá přes `manifest.js`. Dokud soubor chybí, engine vykreslí
placeholder z barevných tvarů a hra funguje dál — grafiku jde tedy doplňovat
po částech.

## Rozměry

| co | rozměr | poznámka |
|---|---|---|
| pozadí místnosti | 640 × 316 px | spodních 44 px zakrývá lišta inventáře |
| postava | výška ~52 px | kotva = spodní střed sprite |
| portrét do dialogu | 64 × 64 px | |
| ikona předmětu | 26 × 26 px | klíč `icon` v `src/data/items.js` |

## Paleta (24 barev, Twin Peaks / Broken Sword)

```
#0d0b0c #1b1714 #2a231d #3b312a #56483c #7a6a58 #a08f76 #c9bda3
#0f1a12 #1b2f1f #2c4a30 #3f6b42 #6f8f5e #e8dcc0 #efe7d8 #d8cba8
#7a0f14 #a81c22 #d02b2b #e46b6b #f0c060 #c9903a #4a5257 #8d9aa0
```

## Jak vyměnit pozadí

1. Ulož `bg_diner.png` (640 × 316) sem do `assets/`.
2. Nic dalšího — cesta už v manifestu je. Placeholderové tvary se samy
   přeskočí (kromě těch, které mají v datech `keep: true`).

## Zvuk

Klíče v `audio` odpovídají akcím `{music:'diner'}` a `{sfx:'tape'}`.
Dokud jsou `null`, hraje jednoduchý syntetizátor z `src/engine/audio.js`.

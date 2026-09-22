/* Sestaví hru do jediného HTML souboru bez závislostí.
   Použití: node build-standalone.js
   Výsledek: dist/twin-peaks-hra.html — jde poslat mailem a otevřít dvojklikem. */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const inlined = html.replace(/[ \t]*<script src="([^"]+)"><\/script>\n?/g, (_, src) => {
  const code = fs.readFileSync(path.join(root, src), 'utf8');
  // aby text uvnitř kódu nerozbil značku
  const safe = code.replace(/<\/script>/gi, '<\\/script>');
  return '  <script>\n/* ' + src + ' */\n' + safe + '\n  </script>\n';
});

if (/<script src=/.test(inlined)) throw new Error('nějaký skript se nepodařilo vložit');

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const out = path.join(root, 'dist', 'twin-peaks-hra.html');
fs.writeFileSync(out, inlined);
console.log('hotovo:', out, '(' + Math.round(fs.statSync(out).size / 1024) + ' kB)');

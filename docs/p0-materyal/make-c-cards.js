// P0 görsel oturumu için C kartı (v2, yetişkin sürüm) HTML'ini üretir.
// Kaynak: docs/inceleme-2026-09-25/14-gorsel-prototipler/v2/kart-v2.html (CSS ve kart kurucu JS birebir alınır).
// Fark: Google Fonts yerine yerel .ttf (çevrimdışı), emoji Android'in Noto Color Emoji'si (uygulamadaki
// "Eski" kartla aynı glifler) ve içerik uygulamadaki kartla AYNI (aynı unvan, satırlar, özet).
//
// Kullanım:  node make-c-cards.js <çıktıKlasörü>
//   <çıktıKlasörü>/fonts/ içinde şunlar olmalı (README.md'ye bakın):
//   Fraunces_800ExtraBold.ttf, Fraunces_600SemiBold_Italic.ttf, Inter_500Medium.ttf, Inter_700Bold.ttf,
//   Inter_800ExtraBold.ttf, NotoColorEmoji.ttf
// Çıktı: <çıktıKlasörü>/kart-c.html  (?k=normal | gizli | ornek | seviye)
const fs = require('fs');
const path = require('path');

const out = process.argv[2];
if (!out) {
  console.error('Kullanım: node make-c-cards.js <çıktıKlasörü>');
  process.exit(1);
}
const src = fs.readFileSync(path.join(__dirname, '..', 'inceleme-2026-09-25', '14-gorsel-prototipler', 'v2', 'kart-v2.html'), 'utf8');

const cssStart = src.indexOf('/* =================== KART v2');
const cssEnd = src.indexOf('</style>', cssStart);
const jsStart = src.indexOf('  var TONE');
const jsEnd = src.indexOf('  var N = {');
if (cssStart < 0 || cssEnd < 0 || jsStart < 0 || jsEnd < 0) throw new Error('kart-v2.html yapısı değişmiş');
const css = src.slice(cssStart, cssEnd);
const builder = src.slice(jsStart, jsEnd);

const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<style>
  @font-face { font-family: Fraunces; font-weight: 800; font-style: normal; src: url(fonts/Fraunces_800ExtraBold.ttf); }
  @font-face { font-family: Fraunces; font-weight: 500 700; font-style: italic; src: url(fonts/Fraunces_600SemiBold_Italic.ttf); }
  @font-face { font-family: Inter; font-weight: 400 599; font-style: normal; src: url(fonts/Inter_500Medium.ttf); }
  @font-face { font-family: Inter; font-weight: 600 750; font-style: normal; src: url(fonts/Inter_700Bold.ttf); }
  @font-face { font-family: Inter; font-weight: 751 900; font-style: normal; src: url(fonts/Inter_800ExtraBold.ttf); }
  @font-face { font-family: "Noto Color Emoji"; src: url(fonts/NotoColorEmoji.ttf); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #3D2E7C; width: 360px; height: 640px; overflow: hidden; }
  .emo { font-family: "Noto Color Emoji", sans-serif; font-weight: 400; font-style: normal; line-height: 1; }
  ${css}
</style></head>
<body><div id="out"></div>
<script>
  var lv = 'pos';
${builder}
  // İçerik: uygulamadaki "Eski" kartla aynı (aynı unvan, satırlar, özet).
  var N = { title: 'Adım Çok, Fiş Yok', sum: 'Kıyaslayacak önceki hafta yok, sayfa yeni açıldı.', rows: [
    { c: 'mov', l: 3, e: '🏃', w: 'yoğun', t: 'Adım sayar ter döktü.' },
    { c: 'slp', l: 2, e: '😌', w: 'orta', t: 'Ne baykuş ne tarla kuşu, ortada bir haftaydın.' },
    { c: 'spn', l: 1, e: '🐷', w: 'az', t: 'Alışveriş sepeti hep boş kaldı.' },
    { c: 'soc', l: 2, e: '👥', w: 'orta', t: 'Ne kalabalık ne tenha, ortalama bir düzen.' }] };
  function clone(o, ext) { var r = JSON.parse(JSON.stringify(o)); for (var k in ext) r[k] = ext[k]; return r; }
  // Varsayılan gizleme (uygulamadakiyle aynı): uyku + harcama gizli, unvan harcamadan türediği için o da gizli.
  var G = clone(N, { hideTitle: true }); G.rows[1].h = true; G.rows[2].h = true;
  var O = { tape: 'ÖRNEK', ornek: true, noLevel: true, dip: 'Bu kart yalnızca örnektir.', title: 'Ara Sıra Maraton', sum: 'Bu hafta geçen haftadan biraz daha hızlı geçti.', rows: [
    { c: 'mov', l: 3, e: '🏃', w: '', t: 'Adım sayar bu hafta kendini maraton sandı.' },
    { c: 'slp', h: true }, { c: 'spn', h: true },
    { c: 'soc', l: 2, e: '👥', w: '', t: 'Telefonun rehberi bu hafta hafifçe ısındı.' }] };
  // L1 seviye karşılaştırması: AYNI kategori (harcama), üç seviye, yan yana okunur; başka metin/başlık yok (yönlendirmesin).
  function levelStrip() {
    var w = ['az', 'orta', 'çok'], e = ['🐷', '💳', '💸'];
    return '<div class="card"><ul class="rows" style="top:196px">' + [1, 2, 3].map(function (l) {
      return '<li class="row">' + discw({ c: 'spn', l: l, e: e[l - 1] }, 'pos') + '<div class="txt"><div class="meta"><b>HARCAMA</b><i>' + w[l - 1] + '</i><span class="sp"></span>' + mark(l) + '</div><p>Örnek satır metni burada yer alır.</p></div></li>';
    }).join('') + '</ul></div>';
  }
  var k = (location.search.match(/k=(\\w+)/) || [])[1] || 'normal';
  var data = { normal: N, gizli: G, ornek: O }[k] || N;
  // Altbilgi: sohbet/oturum görselinde yer tutucu damga "haftik" (mağaza bağlantısı yok). Kartın kendi wordmark'ı zaten "haftik".
  document.getElementById('out').innerHTML = k === 'seviye' ? levelStrip() : card(data);
</script></body></html>`;

fs.writeFileSync(path.join(out, 'kart-c.html'), html);
console.log('yazıldı', path.join(out, 'kart-c.html'));

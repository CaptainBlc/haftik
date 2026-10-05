#!/usr/bin/env node
/**
 * P0 görsel oturumu sonuç hesaplayıcı (`docs/p0-gorsel-oturum-kontrol-listesi.md` bölüm C, 23 §2.2, 27 §3.2).
 * YEREL ve AĞSIZ: bir CSV okur, karar tablosunu Markdown olarak yazar. Karar vermez, ÖNERİR; karar Batuhan'ındır.
 *
 *   node scripts/p0-sonuc.js <kayit.csv>
 *
 * CSV: `docs/p0-materyal/kayit-sablonu.csv` başlığıyla (ayırıcı `,` ya da `;`; `#` ile başlayan satırlar yok sayılır).
 * Katılımcı kodu (P1..P6) dışında kimlik toplanmaz. Eşikler ÖNERİDİR (23 §2.2: "kimse onaylamadı").
 */
'use strict';

const fs = require('node:fs');

const COLUMNS = [
  'kod', // P1..P6
  'platform', // android | iphone
  'sikiklik', // agir | ara | nadir
  'sira', // E (eski önce) | C (C önce)
  'unvan_eski', // 3 sn testi, Eski-görünür: unvanı doğru söyledi mi? E | H
  'unvan_c', // 3 sn testi, C-görünür: E | H
  'koyar_eski_gorunur', // Durumuna koyar mıydı? E | B | H
  'koyar_eski_gizli',
  'koyar_c_gorunur',
  'koyar_c_gizli',
  'cocuk_c', // "yetişkin espri mi çocuk oyunu mu" 1 (yetişkin) .. 5 (çocuk oyunu)
  'cocuksu_acik', // açık uçta kendiliğinden "çocuksu" dedi mi: E | H
  'gizli_secim', // unvanlı mı gizli mi: unvanli | gizli | esit
  'engel', // seçtiği ANA engel (kısa anahtar sözcük)
  'l1_sagdaki_iyi', // "sağdaki daha mı iyi?": E | H
  'l1_orta_en_iyi', // "orta en iyisi mi?": E | H
  'ornek_kendi', // ÖRNEK kartı kendi kartı sandı mı: E | H
  'gercek_koydu', // 24 saat sonra C'yi gerçekten koydu mu: E | H | (boş = henüz bakılmadı)
];

const SCORE = { E: 2, B: 1, H: 0 };

function parseCsv(text) {
  const lines = String(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
  if (lines.length === 0) return { rows: [], errors: ['dosya boş'] };
  const delim = lines[0].includes(';') ? ';' : ',';
  const header = lines[0].split(delim).map((h) => h.trim());
  const errors = [];
  for (const c of COLUMNS) if (!header.includes(c)) errors.push(`başlıkta "${c}" sütunu yok`);
  const rows = lines.slice(1).map((line, i) => {
    const cells = line.split(delim).map((c) => c.trim());
    const row = {};
    header.forEach((h, k) => (row[h] = cells[k] || ''));
    row.__line = i + 2;
    return row;
  });
  return { rows, errors };
}

const up = (v) => String(v || '').trim().toUpperCase();
const low = (v) => String(v || '').trim().toLowerCase();

function count(rows, fn) {
  return rows.filter(fn).length;
}

/** Her ölçü: { ad, deger, payda, durum: 'geçer'|'uyarı'|'kalır'|'bilgi', not }. */
function analyze(rows) {
  const n = rows.length;
  const frac = (k) => `${k}/${n}`;
  const measures = [];

  // M1: C-görünür kartta unvanı 3 sn'de doğru okuyan >= %80.
  const m1 = count(rows, (r) => up(r.unvan_c) === 'E');
  measures.push({
    id: 'M1',
    ad: 'Unvanı 3 sn\'de doğru okur (C-görünür)',
    deger: frac(m1),
    durum: n > 0 && m1 / n >= 0.8 ? 'geçer' : 'kalır',
    esik: '>= %80',
    not: 'Kalırsa: unvan boyutu/kontrast, öğe sayısı azaltılır',
  });

  // M2: "koyarım" karşılaştırması + C'yi seçen.
  const cYes = count(rows, (r) => up(r.koyar_c_gorunur) === 'E');
  const eYes = count(rows, (r) => up(r.koyar_eski_gorunur) === 'E');
  const preferC = count(rows, (r) => SCORE[up(r.koyar_c_gorunur)] > SCORE[up(r.koyar_eski_gorunur)]);
  const preferOld = count(rows, (r) => SCORE[up(r.koyar_c_gorunur)] < SCORE[up(r.koyar_eski_gorunur)]);
  const m2Pass = cYes >= 3 && cYes - eYes >= 1;
  let m2Durum = 'uyarı';
  if (preferC <= 1) m2Durum = 'kalır'; // kill
  else if (m2Pass && n > 0 && preferC / n >= 4 / 6) m2Durum = 'geçer';
  measures.push({
    id: 'M2',
    ad: '"Koyarım": C-görünür, Eski-görünürden iyi',
    deger: `C'ye koyar ${frac(cYes)}, Eski'ye koyar ${frac(eYes)}, C'yi tercih eden ${frac(preferC)}, Eski'yi tercih eden ${frac(preferOld)}`,
    durum: m2Durum,
    esik: 'geç: C evet >= 3 ve Eski\'den en az +1 ve C tercih >= %67; kill: C tercih <= 1',
    not: m2Durum === 'kalır' ? 'KILL: görsel yatırım durur, değer katmanına dönülür (15 KC1)' : '',
  });

  // M3: çocuksu algı.
  const m3 = count(rows, (r) => Number(r.cocuk_c) >= 4 || up(r.cocuksu_acik) === 'E');
  measures.push({
    id: 'M3',
    ad: '"Çocuk oyunu" (4-5 puan ya da açık uçta çocuksu)',
    deger: frac(m3),
    durum: m3 <= 1 ? 'geçer' : m3 === 2 ? 'uyarı' : 'kalır',
    esik: '<= 1 geçer; 2 uyarı (olgunlaştırma turu); >= 3 olgunlaştırma varyantı + yeniden test',
    not: 'C seçimi sorgulanmaz; tetiklenen şey görsel/olgunlaştırma işidir',
  });

  // M4: gerçek davranış (24 saat).
  const m4known = count(rows, (r) => ['E', 'H'].includes(up(r.gercek_koydu)));
  const m4 = count(rows, (r) => up(r.gercek_koydu) === 'E');
  measures.push({
    id: 'M4',
    ad: 'Gerçekten koydu (24 saat, C)',
    deger: m4known === 0 ? 'henüz bakılmadı' : `${m4}/${m4known}`,
    durum: m4known === 0 ? 'bilgi' : m4 >= 1 ? 'geçer' : 'uyarı',
    esik: '>= 1',
    not: m4known > 0 && m4 === 0 ? '0 koydu: M2 geçtiyse niyet abartısı, E1 beklentisi düşer' : '',
  });

  // M5: unvanlı vs gizli.
  const unv = count(rows, (r) => low(r.gizli_secim) === 'unvanli');
  const giz = count(rows, (r) => low(r.gizli_secim) === 'gizli');
  measures.push({
    id: 'M5',
    ad: 'Unvanlı mı gizli mi',
    deger: `unvanlı ${frac(unv)}, gizli ${frac(giz)}, eşit ${frac(count(rows, (r) => low(r.gizli_secim) === 'esit'))}`,
    durum: unv >= 4 ? 'geçer' : 'uyarı',
    esik: 'unvanlı >= 4/6 (I-2 önceliğini doğrular)',
    not: giz >= 3 ? 'Gizliyi seçen >= 3: "gizli çıkartma" esprisi işliyor olabilir' : '',
  });

  // M6: en sık engel.
  const tally = {};
  for (const r of rows) {
    const k = low(r.engel);
    if (k) tally[k] = (tally[k] || 0) + 1;
  }
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
  measures.push({
    id: 'M6',
    ad: 'En sık ana engel',
    deger: top ? `${top[0]} (${top[1]}/${n})` : 'veri yok',
    durum: top && top[1] >= 3 ? 'uyarı' : 'bilgi',
    esik: 'tek engel >= 3/6 ise o engele göre öncelik',
    not: Object.keys(tally).length > 0 ? `Dağılım: ${Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(', ')}` : '',
  });

  // L1: seviye işareti puan gibi okunuyor mu.
  const l1a = count(rows, (r) => up(r.l1_sagdaki_iyi) === 'E');
  const l1b = count(rows, (r) => up(r.l1_orta_en_iyi) === 'E');
  measures.push({
    id: 'L1',
    ad: 'Seviye işareti puan gibi okunuyor mu',
    deger: `"sağdaki daha iyi" ${frac(l1a)}, "orta en iyi" ${frac(l1b)}`,
    durum: l1a <= 1 && l1b <= 1 ? 'geçer' : 'kalır',
    esik: 'ikisi de <= 1',
    not: l1a <= 1 && l1b <= 1 ? '' : 'Kalırsa yalnız kelime kalır (B2); işaret çıkar',
  });

  // ÖRNEK kart.
  const ork = count(rows, (r) => up(r.ornek_kendi) === 'E');
  measures.push({
    id: 'ÖRNEK',
    ad: 'ÖRNEK kartı kendi kartı sandı',
    deger: frac(ork),
    durum: ork === 0 ? 'geçer' : ork === 1 ? 'uyarı' : 'kalır',
    esik: '0 (<= 1 uyarı)',
    not: ork >= 1 ? '"ÖRNEK" şeridi güçlendirilir / onboarding örneği yeniden çizilir' : '',
  });

  // Genel öneri (27 §3.2 karar kuralı, 6 kişiye uyarlanmış).
  const byId = Object.fromEntries(measures.map((m) => [m.id, m]));
  let oneri;
  if (byId.M2.durum === 'kalır' || byId.M3.durum === 'kalır') {
    oneri = 'DUR ve olgunlaştır: yatırımı durdur; olgunlaştırma varyantı hazırla, ikinci 3-5 kişiyle tekrar sına';
  } else if (byId.M2.durum === 'geçer' && byId.M3.durum === 'geçer' && byId.M1.durum === 'geçer') {
    oneri = 'GEÇ: CardView v2 (S19\'un kalanı) ile devam';
  } else {
    oneri = 'BELİRSİZ: ton/renk doygunluğu/kontur/unvan okunurluğu olgunlaştır, ikinci 3-5 kişi turu';
  }
  return { n, measures, oneri };
}

function validateRows(rows) {
  const problems = [];
  const codes = new Set();
  for (const r of rows) {
    const where = `satır ${r.__line} (${r.kod || '?'})`;
    if (!r.kod) problems.push(`${where}: kod boş`);
    if (codes.has(r.kod)) problems.push(`${where}: kod yinelenmiş`);
    codes.add(r.kod);
    for (const c of ['koyar_eski_gorunur', 'koyar_eski_gizli', 'koyar_c_gorunur', 'koyar_c_gizli']) {
      if (!['E', 'B', 'H'].includes(up(r[c]))) problems.push(`${where}: ${c} E/B/H olmalı ("${r[c] || ''}")`);
    }
    const k = Number(r.cocuk_c);
    if (!(k >= 1 && k <= 5)) problems.push(`${where}: cocuk_c 1-5 olmalı ("${r.cocuk_c || ''}")`);
    for (const c of ['unvan_eski', 'unvan_c', 'cocuksu_acik', 'l1_sagdaki_iyi', 'l1_orta_en_iyi', 'ornek_kendi']) {
      if (!['E', 'H'].includes(up(r[c]))) problems.push(`${where}: ${c} E/H olmalı ("${r[c] || ''}")`);
    }
    if (!['unvanli', 'gizli', 'esit'].includes(low(r.gizli_secim))) problems.push(`${where}: gizli_secim unvanli/gizli/esit olmalı`);
    if (r.gercek_koydu && !['E', 'H'].includes(up(r.gercek_koydu))) problems.push(`${where}: gercek_koydu E/H ya da boş olmalı`);
  }
  return problems;
}

function balance(rows) {
  const e = count(rows, (r) => up(r.sira) === 'E');
  const c = count(rows, (r) => up(r.sira) === 'C');
  const iphone = count(rows, (r) => low(r.platform) === 'iphone');
  return { e, c, iphone };
}

function formatMarkdown(result, problems, errors) {
  const out = ['# P0 görsel oturumu: sonuç', ''];
  out.push(`Katılımcı: ${result.n}. Eşikler ÖNERİDİR; bu çıktı karar değil, karar girdisidir.`, '');
  if (errors.length || problems.length) {
    out.push('## Veri sorunları (sonuçtan önce düzelt)', '');
    for (const p of [...errors, ...problems]) out.push(`- ${p}`);
    out.push('');
  }
  if (result.n < 5) out.push('> UYARI: 5 kişiden az katılımcı; sonuçlar yalnız yönsel.', '');
  out.push('| Ölçü | Değer | Eşik | Durum |', '|---|---|---|---|');
  for (const m of result.measures) {
    out.push(`| ${m.id} ${m.ad} | ${m.deger} | ${m.esik} | **${m.durum}**${m.not ? ` (${m.not})` : ''} |`);
  }
  out.push('', `## Öneri: ${result.oneri}`, '');
  out.push(
    '- n = 6\'da tek başına 3/6 anlamsızdır (fark yokken bile yaklaşık %50 olasılıkla çıkar); 6/6 aynı yön p = 0,031.',
    '- Ölçülen şey HTML prototipin görüntüsüdür, React Native derlemesi değil; S19 sonrası 3 kişilik tekrar var (P1).',
    '- Karar tablosu ve gerekçe: `docs/p0-gorsel-oturum-kontrol-listesi.md` bölüm C.',
    ''
  );
  return out.join('\n');
}

function main(argv) {
  const file = argv[2];
  if (!file) {
    console.error('Kullanım: node scripts/p0-sonuc.js <kayit.csv>');
    return 1;
  }
  const { rows, errors } = parseCsv(fs.readFileSync(file, 'utf8'));
  const problems = validateRows(rows);
  const result = analyze(rows);
  const b = balance(rows);
  process.stdout.write(formatMarkdown(result, problems, errors));
  process.stdout.write(`Sıra dengesi: Eski önce ${b.e}, C önce ${b.c}; iPhone ${b.iphone}.\n`);
  return errors.length || problems.length ? 2 : 0;
}

module.exports = { COLUMNS, parseCsv, validateRows, analyze, balance, formatMarkdown };

if (require.main === module) {
  process.exit(main(process.argv));
}

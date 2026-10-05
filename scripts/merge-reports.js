#!/usr/bin/env node
/**
 * Deneme raporu v2 birleştirme betiği (27-olcum-v2.md §4.3). YEREL ve AĞSIZ: yalnız dosya okur, stdout'a yazar.
 * Batuhan'ın elle toplayıp yapıştırdığı raporları tek tabloya ve oranlara çevirir.
 *
 * Kullanım:
 *   node scripts/merge-reports.js <klasör> [--invited N] [--neutral A,B]
 *
 * Girdi: klasördeki her `.txt`/`.json` dosyası bir rapor mesajıdır (uygulamanın paylaştığı metin; içinde `{"v":2,...}`
 * ile başlayan tek JSON satırı aranır). Dosya adı `<testçi>_<dönem>[_...]` biçimindedir: ör. `T01_A.txt`,
 * `T01_B_2.txt`. Testçi kodu rapora YAZILMAZ (kimlik yok); yalnız dosya adında durur, bu klasör repoda tutulmaz.
 *   --invited N   davet edilen toplam kişi (`N_toplam`); verilirse her orana alt/üst sınır eklenir (§4.3 kural 3)
 *   --neutral X   paylaşım oranına (E1) sayılan dönem kodları, virgülle; varsayılan `A` (tek nötr dönem)
 *
 * Kurallar (§4.3): aynı testçi + dönem + build için yalnızca SON `seq`; farklı `build`'ler ayrı tabloda; bütünlük
 * kuralını (§4.2) bozan rapor tabloya alınmaz, nedeniyle listelenir; `pending` ve ilk karttan < 8 gün olanlar paydadan
 * çıkar ama ayrı sayılır; her orana Wilson %95 aralığı.
 *
 * Bütünlük kuralları `src/domain/report-v2.ts` `validateReportV2`'nin birebir karşılığıdır; ikisi aynı sonucu
 * verir (`__tests__/scripts/merge-reports.test.ts` eşlik testi).
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** `validateReportV2` ile aynı kurallar; ihlal adları da aynı. */
function validate(report) {
  const violations = [];
  const weeks = report.weeks || [];
  const cards = report.cards || {};
  const share = report.share || {};
  const openedSum = weeks.reduce((sum, w) => sum + w.opened, 0);
  if (cards.frozen > openedSum) violations.push('frozen<=sum(opened)');
  if (cards.frozen > cards.eligibleWeeks) violations.push('frozen<=eligibleWeeks');
  if (weeks.some((w) => w.fill < 0 || w.fill > 7)) violations.push('fill 0-7');
  if (report.d && report.d.d7 === 'yes' && !(report.day !== null && report.day >= 7)) violations.push('d7=yes => day>=7');
  if (share.n >= 1 && cards.frozen < 1) violations.push('share.n>=1 => frozen>=1');
  if (Array.isArray(share.hiddenN)) {
    if (share.hiddenN.reduce((a, b) => a + b, 0) !== share.n) violations.push('sum(hiddenN)==share.n');
  }
  if (share.defaultKept !== undefined && share.defaultKept > share.n) violations.push('defaultKept<=share.n');
  if (Array.isArray(cards.lateBuckets)) {
    if (cards.lateBuckets.reduce((a, b) => a + b, 0) !== cards.frozen) violations.push('sum(lateBuckets)==frozen');
  }
  return violations;
}

/** Rapor metninden v2 JSON satırını çıkarır; yoksa/bozuksa `null`. */
function parseReportText(text) {
  const line = String(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.startsWith('{"v":2'));
  if (!line) return null;
  try {
    const report = JSON.parse(line);
    return report && report.v === 2 ? report : null;
  } catch {
    return null;
  }
}

/** `T01_A_2.txt` -> { tester: 'T01', period: 'A' }; dönem yoksa '?'. */
function parseFileName(name) {
  const base = path.basename(name).replace(/\.[^.]+$/, '');
  const [tester, period] = base.split('_');
  return { tester: tester || base, period: period || '?' };
}

/** Wilson %95 aralığı (yüzde değil oran). n=0 için null. */
function wilson(k, n) {
  if (n <= 0) return null;
  const z = 1.96;
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, centre - half), Math.min(1, centre + half)];
}

/** Aynı (testçi, dönem, build) için en yüksek `seq`'i tutar; elenenleri ayrıca döndürür. */
function pickLatest(entries) {
  const best = new Map();
  const superseded = [];
  for (const e of entries) {
    const key = [e.tester, e.period, e.report.build].join('\u0000');
    const prev = best.get(key);
    if (!prev || e.report.seq > prev.report.seq) {
      if (prev) superseded.push(prev);
      best.set(key, e);
    } else {
      superseded.push(e);
    }
  }
  return { latest: Array.from(best.values()), superseded };
}

function openedTotal(report) {
  return (report.weeks || []).reduce((s, w) => s + w.opened, 0);
}

function pct(x) {
  return x === null ? '-' : `%${Math.round(x * 100)}`;
}

function rate(num, den) {
  const ci = wilson(num, den);
  return {
    num,
    den,
    value: den > 0 ? num / den : null,
    ci,
    text: den > 0 ? `${num}/${den} = ${pct(num / den)} [${pct(ci[0])}-${pct(ci[1])}]` : `${num}/${den} = -`,
  };
}

/**
 * Bir build grubunun metrikleri. `invited`: davet edilen toplam (yoksa null). `neutral`: nötr dönem kodları.
 * D7 için alt/üst sınır: alt = yes / N_toplam, üst = (yes + (N_toplam - N_rapor)) / N_toplam (§4.3 kural 3).
 */
function computeMetrics(rows, { invited = null, neutral = ['A'] } = {}) {
  const reports = rows.map((r) => r.report);
  const testers = new Set(rows.map((r) => r.tester));

  const activationDen = reports.filter((r) => r.day !== null && r.day >= 8);
  const activation = rate(activationDen.filter((r) => r.cards.frozen >= 1).length, activationDen.length);

  const ikoDen = reports.filter((r) => r.d && r.d.firstCardDay !== null && r.day - r.d.firstCardDay >= 8);
  const iko = rate(ikoDen.filter((r) => r.cards.frozen >= 2).length, ikoDen.length);

  const d7 = { yes: 0, no: 0, pending: 0, unknown: 0 };
  for (const r of reports) d7[r.d.d7] = (d7[r.d.d7] || 0) + 1;
  const d7Rate = rate(d7.yes, d7.yes + d7.no);
  let d7Bounds = null;
  if (invited && invited > 0) {
    const lower = d7.yes / invited;
    const upper = Math.min(1, (d7.yes + Math.max(0, invited - testers.size)) / invited);
    d7Bounds = { lower, upper, text: `en az ${pct(lower)}, en çok ${pct(upper)}` };
  }

  const neutralRows = rows.filter((r) => neutral.includes(r.period)).map((r) => r.report);
  const e1Den = neutralRows.filter((r) => openedTotal(r) >= 1);
  const e1 = rate(e1Den.filter((r) => r.share.n >= 1).length, e1Den.length);

  const shareSum = reports.reduce((s, r) => s + (r.weeks || []).reduce((a, w) => a + w.share, 0), 0);
  const openedSum = reports.reduce((s, r) => s + openedTotal(r), 0);
  const perCard = rate(shareSum, openedSum);

  const withDefault = reports.filter((r) => r.share.defaultKept !== undefined);
  const defaultKept = rate(
    withDefault.reduce((s, r) => s + r.share.defaultKept, 0),
    withDefault.reduce((s, r) => s + r.share.n, 0)
  );

  const hidden = [0, 0, 0, 0, 0];
  for (const r of reports) if (Array.isArray(r.share.hiddenN)) r.share.hiddenN.forEach((v, i) => (hidden[i] += v));
  const late = [0, 0, 0];
  for (const r of reports) if (Array.isArray(r.cards.lateBuckets)) r.cards.lateBuckets.forEach((v, i) => (late[i] += v));
  const notif = { card: 0, daily: 0 };
  for (const r of reports) {
    if (r.notifOpened) {
      notif.card += r.notifOpened.card;
      notif.daily += r.notifOpened.daily;
    }
  }
  const perm = { granted: 0, denied: 0, unset: 0 };
  for (const r of reports) perm[r.perm] = (perm[r.perm] || 0) + 1;

  const young = reports.filter((r) => r.day !== null && r.day < 8).length;
  return {
    reportCount: reports.length,
    testerCount: testers.size,
    activation,
    iko,
    d7,
    d7Rate,
    d7Bounds,
    e1,
    perCard,
    defaultKept,
    hidden,
    late,
    notif,
    perm,
    excluded: { under8Days: young, d7Pending: d7.pending },
  };
}

function formatMarkdown({ groups, rejected, superseded, invited, neutral, unreadable }) {
  const out = [];
  out.push('# Deneme raporları: birleştirme', '');
  out.push(
    `Davet edilen (N_toplam): ${invited ?? 'belirtilmedi'} · nötr dönem(ler): ${neutral.join(', ')} · ` +
      `kabul edilen rapor: ${groups.reduce((s, g) => s + g.rows.length, 0)} · elenen: ${rejected.length} · ` +
      `daha eski seq: ${superseded.length} · okunamayan: ${unreadable.length}`,
    ''
  );
  for (const g of groups) {
    out.push(`## Build ${g.build}`, '');
    out.push('| Testçi | Dönem | seq | gün | D7 | d1d3 | kart | açılan | paylaşım | izin |', '|---|---|---|---|---|---|---|---|---|---|');
    for (const r of g.rows) {
      const rep = r.report;
      out.push(
        `| ${r.tester} | ${r.period} | ${rep.seq} | ${rep.day ?? '-'} | ${rep.d.d7} | ${rep.d.d1d3 ?? '-'} | ${rep.cards.frozen} | ${openedTotal(rep)} | ${rep.share.n} | ${rep.perm} |`
      );
    }
    const m = g.metrics;
    out.push('', '| Metrik | Değer (pay/payda = oran, Wilson %95) |', '|---|---|');
    out.push(`| Aktivasyon (kart ≥1 / gün ≥8) | ${m.activation.text} |`);
    out.push(`| İKO (kart ≥2 / ilk karttan ≥8 gün) | ${m.iko.text} |`);
    out.push(
      `| D7 (evet / ölçülebilir) | ${m.d7Rate.text}${m.d7Bounds ? ` · ${m.d7Bounds.text}` : ''} · beklemede ${m.d7.pending}, bilinmiyor ${m.d7.unknown} |`
    );
    out.push(`| Paylaşım E1 (nötr dönem: paylaşan / kartı açan) | ${m.e1.text} |`);
    out.push(`| Kart başına paylaşım (Σ paylaşım / Σ açılan) | ${m.perCard.text} |`);
    out.push(`| Varsayılan gizleme korunan paylaşım | ${m.defaultKept.text} |`);
    out.push(`| Gizlenen satır dağılımı (0/1/2/3/4) | ${m.hidden.join(' / ')} |`);
    out.push(`| Kart gecikmesi (aynı gün / 1-2 gün / 3+) | ${m.late.join(' / ')} |`);
    out.push(`| Bildirimle açılış (kart-hazır / günlük) | ${m.notif.card} / ${m.notif.daily} |`);
    out.push(`| Bildirim izni (verildi / reddedildi / belirsiz) | ${m.perm.granted} / ${m.perm.denied} / ${m.perm.unset} |`);
    out.push(`| Paydadan çıkanlar | ilk karttan/kurulumdan < 8 gün: ${m.excluded.under8Days}, D7 beklemede: ${m.excluded.d7Pending} |`);
    out.push('');
  }
  if (rejected.length > 0) {
    out.push('## Tabloya alınmayanlar (bütünlük kuralı ihlali)', '', '| Dosya | Neden |', '|---|---|');
    for (const r of rejected) out.push(`| ${r.file} | ${r.violations.join(', ')} |`);
    out.push('');
  }
  if (unreadable.length > 0) {
    out.push('## Okunamayanlar (v2 JSON satırı yok ya da bozuk)', '', ...unreadable.map((f) => `- ${f}`), '');
  }
  out.push(
    '## Okuma notları',
    '',
    '- Oranlar yalnızca raporu gönderenleri kapsar; `--invited` verilirse D7 için alt sınır (göndermeyenler yapmadı) ve üst sınır (hepsi yaptı) yazılır.',
    '- n küçükken (≤30) oranlar kesin doğrulama değil, yön sinyalidir; Wilson aralığı geniştir.',
    '- Farklı build\'ler ayrı tablodadır; karıştırma.',
    '- Haftalık yorum: tablo + tek cümle karar + güven düzeyi (27 §4.3 madde 7).',
    ''
  );
  return out.join('\n');
}

/** Klasörü okur ve hazır sonuç nesnesini döndürür (CLI ve testler paylaşır). */
function mergeDirectory(dir, options = {}) {
  const { invited = null, neutral = ['A'] } = options;
  const entries = [];
  const unreadable = [];
  for (const file of fs.readdirSync(dir).sort()) {
    if (!/\.(txt|json)$/i.test(file)) continue;
    const report = parseReportText(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (!report) {
      unreadable.push(file);
      continue;
    }
    entries.push({ file, ...parseFileName(file), report });
  }
  return mergeEntries(entries, { invited, neutral, unreadable });
}

function mergeEntries(entries, { invited = null, neutral = ['A'], unreadable = [] } = {}) {
  const accepted = [];
  const rejected = [];
  for (const e of entries) {
    const violations = validate(e.report);
    if (violations.length > 0) rejected.push({ file: e.file, tester: e.tester, violations });
    else accepted.push(e);
  }
  const { latest, superseded } = pickLatest(accepted);
  const byBuild = new Map();
  for (const e of latest) {
    if (!byBuild.has(e.report.build)) byBuild.set(e.report.build, []);
    byBuild.get(e.report.build).push(e);
  }
  const groups = Array.from(byBuild.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([build, rows]) => ({
      build,
      rows: rows.sort((x, y) => (x.tester + x.period < y.tester + y.period ? -1 : 1)),
      metrics: computeMetrics(rows, { invited, neutral }),
    }));
  return { groups, rejected, superseded, invited, neutral, unreadable };
}

function main(argv) {
  const args = argv.slice(2);
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      i += 1; // bayrağın değerini atla
      continue;
    }
    positional.push(args[i]);
  }
  const dir = positional[0];
  if (!dir) {
    console.error('Kullanım: node scripts/merge-reports.js <klasör> [--invited N] [--neutral A,B]');
    return 1;
  }
  const flag = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const invited = flag('--invited') ? Number(flag('--invited')) : null;
  if (invited !== null && !(invited > 0)) {
    console.error('--invited pozitif bir sayı olmalı');
    return 1;
  }
  const neutral = (flag('--neutral') || 'A').split(',').map((s) => s.trim()).filter(Boolean);
  const result = mergeDirectory(dir, { invited, neutral });
  process.stdout.write(formatMarkdown(result) + '\n');
  return 0;
}

module.exports = {
  validate,
  parseReportText,
  parseFileName,
  wilson,
  pickLatest,
  computeMetrics,
  mergeEntries,
  mergeDirectory,
  formatMarkdown,
};

if (require.main === module) {
  process.exit(main(process.argv));
}

/**
 * Deneme raporu birleştirme betiği (27 §4.3): ayrıştırma, bütünlük eşliği (TS `validateReportV2` ile aynı sonuç),
 * Wilson aralığı, "aynı testçi için son seq", build ayrımı, formüller ve spec'teki 12/8/5 örneği.
 */
import { formatReportText } from '@/metrics/report';
import {
  buildReportV2,
  validateReportV2,
  type ReportV2,
  type ReportV2Input,
} from '../../src/domain/report-v2';
import type { Checkin } from '../../src/domain/types';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const merge = require('../../scripts/merge-reports') as {
  validate: (r: ReportV2) => string[];
  parseReportText: (t: string) => ReportV2 | null;
  parseFileName: (n: string) => { tester: string; period: string };
  wilson: (k: number, n: number) => [number, number] | null;
  pickLatest: (e: { tester: string; period: string; report: ReportV2 }[]) => { latest: unknown[]; superseded: unknown[] };
  mergeEntries: (
    e: { file: string; tester: string; period: string; report: ReportV2 }[],
    o?: { invited?: number | null; neutral?: string[] }
  ) => {
    groups: { build: string; rows: unknown[]; metrics: Record<string, any> }[];
    rejected: { file: string; violations: string[] }[];
    superseded: unknown[];
  };
  formatMarkdown: (r: unknown) => string;
};

// Mock'lar (report.ts import ediyor; yalnız formatReportText kullanılır).
jest.mock('@/notify/wiring', () => ({ getNotificationPermissionState: jest.fn() }));
jest.mock('expo-sharing', () => ({ __esModule: true, isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('expo-file-system/legacy', () => ({ __esModule: true, cacheDirectory: 'file:///c/' }));

const checkin = (localDate: string): Checkin => ({ localDate, movement: 2, sleep: 2, spending: 2, social: 2 });

/** Gerçek `buildReportV2` ile bir rapor kurar (alanlar gerçek şemayla aynı). */
function report(over: Partial<ReportV2Input> = {}, tweak?: (r: ReportV2) => void): ReportV2 {
  const r = buildReportV2({
    now: new Date(2026, 9, 12, 12, 0, 0),
    build: '0.2.0+3',
    channel: 'preview',
    seq: 1,
    perm: 'granted',
    firstOpenDate: '2026-09-21',
    checkins: ['2026-09-21', '2026-09-22', '2026-09-23'].map(checkin),
    cardWeekStarts: ['2026-09-21'],
    events: [
      { name: 'card_opened', weekStart: '2026-09-21', at: new Date(2026, 8, 28).getTime() },
      { name: 'share_initiated', weekStart: '2026-09-21', at: new Date(2026, 8, 28).getTime() },
    ],
    counters: [
      { name: 'share_hidden_n', weekStart: '', dim: '2', n: 1 },
      { name: 'share_default_kept', weekStart: '', dim: 'y', n: 1 },
    ],
    cards: [{ weekStart: '2026-09-21', generatedAt: new Date(2026, 8, 27, 21).getTime() }],
    ...over,
  });
  tweak?.(r);
  return r;
}

const entry = (tester: string, period: string, r: ReportV2) => ({ file: `${tester}_${period}.txt`, tester, period, report: r });

describe('parseReportText / parseFileName', () => {
  it('uygulamanın gerçek rapor metninden v2 JSON satırını çıkarır (formatReportText ile gidiş-dönüş)', () => {
    const r = report();
    const parsed = merge.parseReportText(formatReportText(r));
    expect(parsed).toEqual(JSON.parse(JSON.stringify(r)));
  });

  it('JSON satırı yoksa, v2 değilse ya da bozuksa null', () => {
    expect(merge.parseReportText('merhaba')).toBeNull();
    expect(merge.parseReportText('{"v":1,"x":1}')).toBeNull();
    expect(merge.parseReportText('{"v":2,"bozuk"')).toBeNull();
    expect(merge.parseReportText('')).toBeNull();
  });

  it('WhatsApp gibi araçlar satır sonu/boşluk ekleyebilir: kenar boşluğu ve CRLF tolere edilir', () => {
    const line = JSON.stringify(report());
    expect(merge.parseReportText(`Rapor:\r\n  ${line}  \r\nSon`)).not.toBeNull();
  });

  it('dosya adı: T01_A.txt -> testçi T01, dönem A; dönem yoksa ?', () => {
    expect(merge.parseFileName('T01_A.txt')).toEqual({ tester: 'T01', period: 'A' });
    expect(merge.parseFileName('klasor/T07_B_2.json')).toEqual({ tester: 'T07', period: 'B' });
    expect(merge.parseFileName('T03.txt')).toEqual({ tester: 'T03', period: '?' });
  });
});

describe('bütünlük eşliği: betik ve TS validateReportV2 aynı sonucu verir', () => {
  const cases: [string, (r: ReportV2) => void][] = [
    ['tutarlı', () => undefined],
    ['frozen > opened', (r) => (r.weeks[0].opened = 0)],
    ['frozen > eligibleWeeks', (r) => (r.cards.eligibleWeeks = 0)],
    ['fill > 7', (r) => (r.weeks[0].fill = 9)],
    ['d7=yes, gün < 7', (r) => ((r.d.d7 = 'yes'), (r.day = 3))],
    ['share.n>=1, kart yok', (r) => ((r.cards.frozen = 0), (r.cards.lateBuckets = [0, 0, 0]))],
    ['sum(hiddenN) != n', (r) => (r.share.n = 3)],
    ['defaultKept > n', (r) => (r.share.defaultKept = 4)],
    ['lateBuckets toplamı != frozen', (r) => (r.cards.lateBuckets = [0, 0, 0])],
    // SINIR değerleri: kuralın bir birim kaymasını yakalamak için (betik ile TS kuralı aynı yerde ayrılmalı).
    ['sınır: defaultKept = n (geçerli)', (r) => (r.share.defaultKept = r.share.n)],
    ['sınır: defaultKept = n + 1', (r) => (r.share.defaultKept = r.share.n + 1)],
    ['sınır: sum(hiddenN) = n + 1', (r) => (r.share.hiddenN = [0, 0, 2, 0, 0])],
    ['sınır: sum(hiddenN) = n - 1', (r) => (r.share.hiddenN = [0, 0, 0, 0, 0])],
    ['sınır: frozen = opened (geçerli)', (r) => ((r.cards.frozen = 1), (r.weeks[0].opened = 1))],
    ['sınır: frozen = opened + 1', (r) => ((r.cards.frozen = 2), (r.cards.eligibleWeeks = 2), (r.cards.lateBuckets = [2, 0, 0]))],
    ['sınır: frozen = eligibleWeeks + 1', (r) => ((r.cards.eligibleWeeks = 0))],
    ['sınır: fill = 7 (geçerli)', (r) => (r.weeks[0].fill = 7)],
    ['sınır: fill = 8', (r) => (r.weeks[0].fill = 8)],
    ['sınır: fill = -1', (r) => (r.weeks[0].fill = -1)],
    ['sınır: d7=yes, gün = 7 (geçerli)', (r) => ((r.d.d7 = 'yes'), (r.day = 7))],
    ['sınır: d7=yes, gün = 6', (r) => ((r.d.d7 = 'yes'), (r.day = 6))],
    ['sınır: d7=yes, gün null', (r) => ((r.d.d7 = 'yes'), (r.day = null))],
    ['sınır: lateBuckets toplamı = frozen + 1', (r) => (r.cards.lateBuckets = [2, 0, 0])],
    [
      'eski sürüm raporu (yeni alanlar yok)',
      (r) => {
        delete r.share.hiddenN;
        delete r.share.defaultKept;
        delete r.cards.lateBuckets;
        delete r.notifOpened;
        r.share.n = 7;
      },
    ],
  ];
  it.each(cases)('%s', (_name, tweak) => {
    const r = report({}, tweak);
    expect(merge.validate(r)).toEqual(validateReportV2(r));
  });
});

describe('wilson', () => {
  const rounded = (k: number, n: number) => merge.wilson(k, n)!.map((x) => Math.round(x * 100));
  it('27 §3.2 tablosundaki değerler: 5/5 [57,100], 4/5 [38,96], 3/5 [23,88], 7/12 [32,81]', () => {
    expect(rounded(5, 5)).toEqual([57, 100]);
    expect(rounded(4, 5)).toEqual([38, 96]);
    expect(rounded(3, 5)).toEqual([23, 88]);
    expect(rounded(7, 12)).toEqual([32, 81]);
  });
  it('payda 0 -> null', () => {
    expect(merge.wilson(0, 0)).toBeNull();
  });
});

describe('seçim ve gruplama', () => {
  it('aynı testçi + dönem + build için yalnız en yüksek seq kalır, eskiler ayrı sayılır', () => {
    const r = merge.mergeEntries([
      entry('T01', 'A', report({ seq: 1 })),
      entry('T01', 'A', report({ seq: 3 })),
      entry('T01', 'A', report({ seq: 2 })),
    ]);
    expect(r.groups).toHaveLength(1);
    expect(r.groups[0].rows).toHaveLength(1);
    expect((r.groups[0].rows[0] as { report: ReportV2 }).report.seq).toBe(3);
    expect(r.superseded).toHaveLength(2);
  });

  it('aynı testçi farklı dönemde ayrı satırlar; farklı build ayrı tablolar', () => {
    const r = merge.mergeEntries([
      entry('T01', 'A', report({ build: '0.2.0+3' })),
      entry('T01', 'B', report({ build: '0.2.0+3' })),
      entry('T02', 'A', report({ build: '0.3.0+5' })),
    ]);
    expect(r.groups.map((g) => g.build)).toEqual(['0.2.0+3', '0.3.0+5']);
    expect(r.groups[0].rows).toHaveLength(2);
    expect(r.groups[1].rows).toHaveLength(1);
  });

  it('bütünlük kuralını bozan rapor tabloya girmez, nedeniyle listelenir', () => {
    const bad = report({}, (r) => (r.share.n = 3));
    const r = merge.mergeEntries([entry('T01', 'A', report()), { ...entry('T02', 'A', bad), file: 'T02_A.txt' }]);
    expect(r.groups[0].rows).toHaveLength(1);
    expect(r.rejected).toEqual([{ file: 'T02_A.txt', tester: 'T02', violations: ['sum(hiddenN)==share.n'] }]);
  });
});

describe('formüller', () => {
  /** Sabit alanlarla rapor: gün, ilk kart günü, kart, açılan, paylaşım, d7. */
  function shaped(p: {
    day: number | null;
    firstCardDay: number | null;
    frozen: number;
    opened: number;
    shareN: number;
    d7: 'yes' | 'no' | 'pending' | 'unknown';
  }): ReportV2 {
    return report({}, (r) => {
      r.day = p.day;
      r.d.firstCardDay = p.firstCardDay;
      r.d.d7 = p.d7;
      r.cards.frozen = p.frozen;
      r.cards.eligibleWeeks = Math.max(p.frozen, 1);
      r.cards.lateBuckets = [p.frozen, 0, 0];
      r.weeks = Array.from({ length: Math.max(p.opened, 1) }, (_v, i) => ({
        i: i + 1,
        fill: 4,
        opened: (i < p.opened ? 1 : 0) as 0 | 1,
        share: i < p.shareN ? 1 : 0,
      }));
      r.share.n = p.shareN;
      r.share.hiddenN = [p.shareN, 0, 0, 0, 0];
      r.share.defaultKept = p.shareN;
    });
  }

  it('spec örneği (§4.3): 12 davet, 8 rapor, 5 D7 evet -> raporlayanlarda 5/8 (yaklaşık %62-63); en az %42, en çok %75', () => {
    const rows = [
      ...[1, 2, 3, 4, 5].map((i) => entry(`T0${i}`, 'A', shaped({ day: 10, firstCardDay: 6, frozen: 2, opened: 2, shareN: 1, d7: 'yes' }))),
      ...[6, 7, 8].map((i) => entry(`T0${i}`, 'A', shaped({ day: 10, firstCardDay: 6, frozen: 1, opened: 1, shareN: 0, d7: 'no' }))),
    ];
    const m = merge.mergeEntries(rows, { invited: 12 }).groups[0].metrics;
    expect(m.d7Rate.text.startsWith('5/8 = %63')).toBe(true); // 5/8 = 0,625 -> yuvarlama %63
    expect(Math.round(m.d7Bounds.lower * 100)).toBe(42);
    expect(Math.round(m.d7Bounds.upper * 100)).toBe(75);
  });

  it('Aktivasyon: kart>=1 / gün>=8; İKO: kart>=2 / ilk karttan >=8 gün; gün<8 olanlar paydadan çıkar ve sayılır', () => {
    const rows = [
      entry('T01', 'A', shaped({ day: 20, firstCardDay: 6, frozen: 2, opened: 2, shareN: 0, d7: 'yes' })), // İKO payda (14>=8), pay
      entry('T02', 'A', shaped({ day: 20, firstCardDay: 6, frozen: 1, opened: 1, shareN: 0, d7: 'yes' })), // İKO payda, pay yok
      entry('T03', 'A', shaped({ day: 12, firstCardDay: 10, frozen: 1, opened: 1, shareN: 0, d7: 'yes' })), // İKO paydada DEĞİL (2 gün)
      entry('T04', 'A', shaped({ day: 5, firstCardDay: null, frozen: 0, opened: 0, shareN: 0, d7: 'pending' })), // gün<8
    ];
    const m = merge.mergeEntries(rows).groups[0].metrics;
    expect(m.activation).toMatchObject({ num: 3, den: 3 });
    expect(m.iko).toMatchObject({ num: 1, den: 2 });
    expect(m.excluded).toEqual({ under8Days: 1, d7Pending: 1 });
    expect(m.d7).toMatchObject({ yes: 3, pending: 1 });
  });

  it('E1: yalnız nötr dönemlerde, kartı açan payda; paylaşan pay (çağrılı dönem sayılmaz)', () => {
    const rows = [
      entry('T01', 'A', shaped({ day: 10, firstCardDay: 6, frozen: 1, opened: 1, shareN: 1, d7: 'yes' })), // nötr, paylaştı
      entry('T02', 'A', shaped({ day: 10, firstCardDay: 6, frozen: 1, opened: 1, shareN: 0, d7: 'yes' })), // nötr, paylaşmadı
      entry('T03', 'A', shaped({ day: 10, firstCardDay: 6, frozen: 0, opened: 0, shareN: 0, d7: 'yes' })), // nötr, kart açmadı: payda dışı
      entry('T01', 'C', shaped({ day: 24, firstCardDay: 6, frozen: 3, opened: 3, shareN: 3, d7: 'yes' })), // çağrılı dönem
    ];
    expect(merge.mergeEntries(rows).groups[0].metrics.e1).toMatchObject({ num: 1, den: 2 });
    expect(merge.mergeEntries(rows, { neutral: ['A', 'C'] }).groups[0].metrics.e1).toMatchObject({ num: 2, den: 3 });
  });

  it('kart başına paylaşım ve varsayılan korunma oranı', () => {
    const rows = [
      entry('T01', 'A', shaped({ day: 10, firstCardDay: 6, frozen: 2, opened: 2, shareN: 1, d7: 'yes' })),
      entry('T02', 'A', shaped({ day: 10, firstCardDay: 6, frozen: 2, opened: 2, shareN: 0, d7: 'yes' })),
    ];
    const m = merge.mergeEntries(rows).groups[0].metrics;
    expect(m.perCard).toMatchObject({ num: 1, den: 4 });
    expect(m.defaultKept).toMatchObject({ num: 1, den: 1 });
  });

  it('eski sürüm raporunda (alan yok) varsayılan korunma paydası dışında kalır, çökmez', () => {
    const old = report({}, (r) => {
      delete r.share.hiddenN;
      delete r.share.defaultKept;
      delete r.cards.lateBuckets;
      delete r.notifOpened;
    });
    const m = merge.mergeEntries([entry('T01', 'A', old)]).groups[0].metrics;
    expect(m.defaultKept).toMatchObject({ num: 0, den: 0 });
    expect(m.hidden).toEqual([0, 0, 0, 0, 0]);
  });
});

describe('çıktı', () => {
  it('Markdown tablo, build başlığı, elenenler ve okuma notları içerir; testçi kodu yalnız dosya adından gelir', () => {
    const bad = report({}, (r) => (r.share.n = 3));
    const result = merge.mergeEntries([entry('T01', 'A', report()), entry('T02', 'A', bad)], { invited: 10 });
    const md = merge.formatMarkdown({ ...result, invited: 10, neutral: ['A'], unreadable: ['T09_A.txt'] });
    expect(md).toContain('## Build 0.2.0+3');
    expect(md).toContain('| T01 | A |');
    expect(md).toContain('Tabloya alınmayanlar');
    expect(md).toContain('sum(hiddenN)==share.n');
    expect(md).toContain('T09_A.txt');
    expect(md).toContain('Okuma notları');
    // Rapor JSON'unda hiçbir kimlik/tarih yok; çıktıya da girmez.
    expect(md).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});

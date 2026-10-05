/**
 * Rapor v2 genişletmesi (27 §2.3-2.4, §4.1-4.2): sayaç tabanlı alanlar (hiddenN, defaultKept, notifOpened),
 * kart gecikme kovaları ve yeni bütünlük kuralları. Saat/veri parametre.
 */
import {
  buildReportV2,
  validateReportV2,
  type ReportCounterInput,
  type ReportV2Input,
} from '../../src/domain/report-v2';
import type { Checkin } from '../../src/domain/types';

const checkin = (localDate: string): Checkin => ({ localDate, movement: 2, sleep: 2, spending: 2, social: 2 });
const counter = (name: string, dim: string, n: number, weekStart = ''): ReportCounterInput => ({ name, weekStart, dim, n });

function input(over: Partial<ReportV2Input> = {}): ReportV2Input {
  return {
    now: new Date(2026, 9, 5, 12, 0, 0), // 2026-10-05 Pzt
    build: '0.2.0+3',
    channel: 'preview',
    seq: 1,
    perm: 'granted',
    firstOpenDate: '2026-09-21',
    checkins: ['2026-09-21', '2026-09-22', '2026-09-23'].map(checkin),
    cardWeekStarts: [],
    events: [],
    ...over,
  };
}

describe('alanlar yalnız ilgili girdi verilince rapora girer', () => {
  it('counters/cards verilmezse yeni alanlar yok (eski çağrılar, eski sürüm raporları)', () => {
    const r = buildReportV2(input());
    expect(r.share.hiddenN).toBeUndefined();
    expect(r.share.defaultKept).toBeUndefined();
    expect(r.notifOpened).toBeUndefined();
    expect(r.cards.lateBuckets).toBeUndefined();
  });

  it('boş dizi verilirse alanlar girer ve sıfırdır (ölçüm var, olay yok)', () => {
    const r = buildReportV2(input({ counters: [], cards: [] }));
    expect(r.share.hiddenN).toEqual([0, 0, 0, 0, 0]);
    expect(r.share.defaultKept).toBe(0);
    expect(r.notifOpened).toEqual({ card: 0, daily: 0 });
    expect(r.cards.lateBuckets).toEqual([0, 0, 0]);
  });
});

describe('sayaçlar', () => {
  it('hiddenN, defaultKept ve notifOpened sayaç satırlarından toplanır (haftalar ve sürümler toplanır)', () => {
    const r = buildReportV2(
      input({
        counters: [
          counter('share_hidden_n', '2', 3, '2026-09-21'),
          counter('share_hidden_n', '2', 1, '2026-09-28'),
          counter('share_hidden_n', '0', 1, '2026-09-28'),
          counter('share_default_kept', 'y', 3, '2026-09-21'),
          counter('share_default_kept', 'n', 2, '2026-09-28'),
          counter('notif_opened', 'card_ready', 2),
          counter('notif_opened', 'daily', 5),
          counter('baska_sayac', 'x', 99),
        ],
      })
    );
    expect(r.share.hiddenN).toEqual([1, 0, 4, 0, 0]);
    expect(r.share.defaultKept).toBe(3); // yalnız y
    expect(r.notifOpened).toEqual({ card: 2, daily: 5 });
  });
});

describe('kart gecikme kovaları (Pazar gününe göre)', () => {
  // 2026-09-21 haftasının Pazar'ı = 2026-09-27.
  const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

  it('aynı gün / 1-2 gün / 3+ gün kovalarına ayrılır', () => {
    const r = buildReportV2(
      input({
        cardWeekStarts: ['2026-09-07', '2026-09-14', '2026-09-21'],
        cards: [
          { weekStart: '2026-09-07', generatedAt: at(2026, 9, 13, 21) }, // Pazar akşamı: aynı gün
          { weekStart: '2026-09-14', generatedAt: at(2026, 9, 21, 9) }, // Pazartesi (1 gün sonra): 1-2
          { weekStart: '2026-09-21', generatedAt: at(2026, 10, 2, 9) }, // 5 gün sonra: 3+
        ],
      })
    );
    expect(r.cards.lateBuckets).toEqual([1, 1, 1]);
  });

  it('kova sınırları: 0 -> aynı gün, 1 ve 2 -> orta, 3 -> son kova; Pazar\'dan ÖNCE üretim 0 sayılır', () => {
    const base = '2026-09-21';
    const lateBy = (days: number) =>
      buildReportV2(
        input({
          cardWeekStarts: [base],
          cards: [{ weekStart: base, generatedAt: at(2026, 9, 27 + days, 10) }],
        })
      ).cards.lateBuckets;
    expect(lateBy(0)).toEqual([1, 0, 0]);
    expect(lateBy(1)).toEqual([0, 1, 0]);
    expect(lateBy(2)).toEqual([0, 1, 0]);
    expect(lateBy(3)).toEqual([0, 0, 1]);
    expect(lateBy(-2)).toEqual([1, 0, 0]);
  });

  it('JSON tarih/epoch/kategori adı içermez (üretim anı yalnız kova olur)', () => {
    const r = buildReportV2(
      input({
        cardWeekStarts: ['2026-09-21'],
        cards: [{ weekStart: '2026-09-21', generatedAt: at(2026, 10, 2, 9) }],
        counters: [counter('share_hidden_n', '2', 1), counter('notif_opened', 'daily', 1)],
      })
    );
    const json = JSON.stringify(r);
    expect(json).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(json).not.toMatch(/\d{10,}/);
    expect(json).not.toMatch(/movement|sleep|spending|social|hareket|uyku|harcama|sosyal/i);
  });
});

describe('yeni bütünlük kuralları', () => {
  const base = () =>
    buildReportV2(
      input({
        checkins: ['2026-09-21', '2026-09-22', '2026-09-23'].map(checkin),
        cardWeekStarts: ['2026-09-21'],
        events: [
          { name: 'card_opened', weekStart: '2026-09-21', at: new Date(2026, 8, 28).getTime() },
          { name: 'share_initiated', weekStart: '2026-09-21', at: new Date(2026, 8, 28).getTime() },
        ],
        counters: [counter('share_hidden_n', '2', 1), counter('share_default_kept', 'y', 1)],
        cards: [{ weekStart: '2026-09-21', generatedAt: new Date(2026, 8, 27, 21).getTime() }],
      })
    );

  it('tutarlı rapor ihlal döndürmez', () => {
    expect(validateReportV2(base())).toEqual([]);
  });

  it('kural 1: sum(hiddenN) != share.n yakalanır (sayaç öncesi paylaşımlar / karışık sürüm)', () => {
    const r = base();
    r.share.n = 2; // ikinci paylaşımın sayacı yok
    expect(validateReportV2(r)).toContain('sum(hiddenN)==share.n');
  });

  it('defaultKept > share.n yakalanır', () => {
    const r = base();
    r.share.defaultKept = 2;
    expect(validateReportV2(r)).toContain('defaultKept<=share.n');
  });

  it('sum(lateBuckets) != frozen yakalanır', () => {
    const r = base();
    r.cards.lateBuckets = [0, 0, 0];
    expect(validateReportV2(r)).toContain('sum(lateBuckets)==frozen');
  });

  it('alan yoksa (eski sürüm raporu) bu kurallar denetlenmez', () => {
    const r = base();
    delete r.share.hiddenN;
    delete r.share.defaultKept;
    delete r.cards.lateBuckets;
    r.share.n = 5;
    expect(validateReportV2(r)).toEqual([]);
  });
});

/**
 * Rapor v2 saf mantığı (S16b, 27 §4.1-4.2): hafta tablosu, ilk 3 gün deseni, kart
 * sayıları, firstCardDay ofseti ve bütünlük kuralları. Saat/veri parametre.
 */
import { buildReportV2, validateReportV2, type ReportV2Input } from '../../src/domain/report-v2';
import type { Checkin } from '../../src/domain/types';

const checkin = (localDate: string): Checkin => ({
  localDate,
  movement: 2,
  sleep: 2,
  spending: 2,
  social: 2,
});

function input(over: Partial<ReportV2Input> = {}): ReportV2Input {
  return {
    now: new Date(2026, 8, 30, 12, 0, 0), // 2026-09-30
    build: '0.1.0+12',
    channel: 'preview',
    seq: 2,
    perm: 'granted',
    firstOpenDate: '2026-09-21',
    checkins: [],
    cardWeekStarts: [],
    events: [],
    ...over,
  };
}

describe('buildReportV2: kimlik alanları', () => {
  it('sürüm, build, kanal, seq ve izin olduğu gibi taşınır', () => {
    const r = buildReportV2(input());
    expect(r).toMatchObject({ v: 2, build: '0.1.0+12', ch: 'preview', seq: 2, perm: 'granted' });
  });

  it('gün numarası kurulum gününden (1) hesaplanır', () => {
    expect(buildReportV2(input()).day).toBe(10);
  });

  it('kurulum tarihi yoksa gün ve d1d3 null', () => {
    const r = buildReportV2(input({ firstOpenDate: null }));
    expect(r.day).toBeNull();
    expect(r.d.d1d3).toBeNull();
  });
});

describe('buildReportV2: d1d3 deseni', () => {
  it('var/yok ve henüz gelmeyen günler "-" ile ayrılır', () => {
    const now = new Date(2026, 8, 22, 12, 0, 0); // kurulumdan 2. gün
    const r = buildReportV2(
      input({ now, checkins: [checkin('2026-09-21')], firstOpenDate: '2026-09-21' })
    );
    expect(r.d.d1d3).toBe('10-');
  });

  it('3. günden sonra tam desen', () => {
    const r = buildReportV2(
      input({ checkins: [checkin('2026-09-21'), checkin('2026-09-23')] })
    );
    expect(r.d.d1d3).toBe('101');
  });
});

describe('buildReportV2: haftalar ve kartlar', () => {
  const week1 = ['2026-09-21', '2026-09-22', '2026-09-23']; // 3 gün: ilk hafta, eşik 3
  const week2 = ['2026-09-28', '2026-09-29']; // 2 gün

  it('haftalar kronolojik sıra numarasıyla (tarihsiz) listelenir, uygun hafta sayılır', () => {
    const r = buildReportV2(input({ checkins: [...week1, ...week2].map(checkin) }));
    expect(r.weeks).toEqual([
      { i: 1, fill: 3, opened: 0, share: 0 },
      { i: 2, fill: 2, opened: 0, share: 0 },
    ]);
    expect(r.cards).toEqual({ frozen: 0, eligibleWeeks: 1 });
  });

  it('kart açılışı ve paylaşım olayları ilgili haftaya işlenir', () => {
    const r = buildReportV2(
      input({
        checkins: [...week1, ...week2].map(checkin),
        cardWeekStarts: ['2026-09-21'],
        events: [
          { name: 'card_opened', weekStart: '2026-09-21', at: new Date(2026, 8, 27, 20, 5).getTime() },
          { name: 'share_initiated', weekStart: '2026-09-21', at: new Date(2026, 8, 27, 20, 6).getTime() },
          { name: 'line_hidden', weekStart: '2026-09-21', at: new Date(2026, 8, 27, 20, 6).getTime() },
          { name: 'line_hidden', weekStart: '2026-09-21', at: new Date(2026, 8, 27, 20, 6).getTime() },
        ],
      })
    );
    expect(r.weeks[0]).toEqual({ i: 1, fill: 3, opened: 1, share: 1 });
    expect(r.cards.frozen).toBe(1);
    expect(r.share).toEqual({ n: 1, hiddenTotal: 2 });
    expect(r.d.firstCardDay).toBe(7); // 2026-09-27, kurulumdan 7. gün
  });

  it('kart hiç açılmadıysa firstCardDay null', () => {
    expect(buildReportV2(input()).d.firstCardDay).toBeNull();
  });

  it('aynı güne ait yinelenen check-in kayıtları tekilleştirilir', () => {
    const r = buildReportV2(
      input({ checkins: ['2026-09-21', '2026-09-21', '2026-09-22'].map(checkin) })
    );
    expect(r.weeks[0].fill).toBe(2);
  });
});

describe('buildReportV2: gizlilik', () => {
  it('JSON tarih, epoch veya kategori adı içermez', () => {
    const r = buildReportV2(
      input({
        checkins: ['2026-09-21', '2026-09-22', '2026-09-23'].map(checkin),
        events: [{ name: 'card_opened', weekStart: '2026-09-21', at: Date.now() }],
      })
    );
    const json = JSON.stringify(r);
    expect(json).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(json).not.toMatch(/\d{10,}/);
    expect(json).not.toMatch(/movement|sleep|spending|social|hareket|uyku|harcama|sosyal/i);
  });
});

describe('validateReportV2 (27 §4.2, kural 3-7)', () => {
  const base = () =>
    buildReportV2(
      input({
        checkins: ['2026-09-21', '2026-09-22', '2026-09-23'].map(checkin),
        cardWeekStarts: ['2026-09-21'],
        events: [{ name: 'card_opened', weekStart: '2026-09-21', at: new Date(2026, 8, 27).getTime() }],
      })
    );

  it('tutarlı rapor ihlal döndürmez', () => {
    expect(validateReportV2(base())).toEqual([]);
  });

  it('kart sayısı açılan haftalardan fazlaysa yakalanır (kural 3)', () => {
    const r = base();
    r.weeks[0].opened = 0;
    expect(validateReportV2(r)).toContain('frozen<=sum(opened)');
  });

  it('kart sayısı uygun haftalardan fazlaysa yakalanır (kural 4)', () => {
    const r = base();
    r.cards.frozen = 5;
    r.weeks[0].opened = 1;
    expect(validateReportV2(r)).toContain('frozen<=eligibleWeeks');
  });

  it('dolu gün 0-7 dışındaysa yakalanır (kural 5)', () => {
    const r = base();
    r.weeks[0].fill = 8;
    expect(validateReportV2(r)).toContain('fill 0-7');
  });

  it('d7=yes iken gün < 7 ise yakalanır (kural 6)', () => {
    const r = base();
    r.d.d7 = 'yes';
    r.day = 3;
    expect(validateReportV2(r)).toContain('d7=yes => day>=7');
  });

  it('paylaşım var ama kart yoksa yakalanır (kural 7)', () => {
    const r = base();
    r.cards.frozen = 0;
    r.share.n = 1;
    expect(validateReportV2(r)).toContain('share.n>=1 => frozen>=1');
  });
});

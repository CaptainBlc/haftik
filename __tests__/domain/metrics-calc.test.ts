import {
  aggregateMetrics,
  computeD7,
  computeDeviceMetrics,
  countEvents,
  dayNumber,
  type DeviceMetrics,
} from '@/domain/metrics-calc';

// Kurulum günü 2026-09-01 (Salı) = gün 1  =>  gün 7 = 2026-09-07.
const FIRST = '2026-09-01';

describe('computeD7 (kurulum günü = gün 1, gün 7 = +6 takvim günü)', () => {
  it('gün 7 dolu ise yes', () => {
    expect(computeD7(FIRST, ['2026-09-07'], '2026-09-10')).toBe('yes');
  });

  it('gün 6 ve gün 8 dolu ama gün 7 boş ise (bugün gün 7den sonra) no', () => {
    expect(computeD7(FIRST, ['2026-09-06', '2026-09-08'], '2026-09-09')).toBe('no');
  });

  it('gün 1 (kurulum günü) dolu olması D7 sayılmaz', () => {
    expect(computeD7(FIRST, ['2026-09-01'], '2026-09-20')).toBe('no');
  });

  it('kurulumdan 7 gün geçmemişse henüz ölçülemez (pending)', () => {
    expect(computeD7(FIRST, [], '2026-09-01')).toBe('pending');
    expect(computeD7(FIRST, ['2026-09-02'], '2026-09-06')).toBe('pending');
  });

  it('gün 7 içindeyken (bugün = gün 7) henüz check-in yoksa pending, varsa yes', () => {
    expect(computeD7(FIRST, [], '2026-09-07')).toBe('pending');
    expect(computeD7(FIRST, ['2026-09-07'], '2026-09-07')).toBe('yes');
  });

  it('gün 8 kenarı: gün 7 boşsa artık no', () => {
    expect(computeD7(FIRST, [], '2026-09-08')).toBe('no');
  });

  it('ay sınırını geçen gün 7 (kurulum 2026-09-27 -> gün 7 = 2026-10-03)', () => {
    expect(computeD7('2026-09-27', ['2026-10-03'], '2026-10-05')).toBe('yes');
    expect(computeD7('2026-09-27', ['2026-10-02'], '2026-10-05')).toBe('no');
  });

  it('kurulum tarihi yok/bozuksa unknown', () => {
    expect(computeD7(null, ['2026-09-07'], '2026-09-10')).toBe('unknown');
    expect(computeD7('2026-13-45', [], '2026-09-10')).toBe('unknown');
    expect(computeD7('bozuk', [], '2026-09-10')).toBe('unknown');
  });
});

describe('dayNumber', () => {
  it('kurulum günü 1, sonraki gün 2; kurulumdan önce null', () => {
    expect(dayNumber(FIRST, '2026-09-01')).toBe(1);
    expect(dayNumber(FIRST, '2026-09-07')).toBe(7);
    expect(dayNumber(FIRST, '2026-08-31')).toBeNull();
    expect(dayNumber(null, '2026-09-07')).toBeNull();
  });
});

describe('countEvents / computeDeviceMetrics', () => {
  it('bilinmeyen adları saymaz, sabit kümeyi sayar', () => {
    const c = countEvents([
      { name: 'card_opened' },
      { name: 'card_opened' },
      { name: 'line_hidden' },
      { name: 'toString' },
      { name: 'bilinmeyen' },
    ]);
    expect(c).toEqual({
      card_unlocked: 0,
      card_opened: 2,
      share_initiated: 0,
      line_hidden: 1,
      check_in_saved: 0,
    });
  });

  it('dolu gün sayısı tekrarlı tarihleri tekilleştirir', () => {
    const m = computeDeviceMetrics({
      events: [],
      firstOpenDate: FIRST,
      checkinDates: ['2026-09-01', '2026-09-01', '2026-09-02'],
      today: '2026-09-03',
    });
    expect(m.filledDays).toBe(2);
    expect(m.dayNumber).toBe(3);
  });

  it('kartı görmeyen cihazda sharedGivenSeen null (paydaya girmez)', () => {
    const m = computeDeviceMetrics({
      events: [{ name: 'share_initiated' }],
      firstOpenDate: FIRST,
      checkinDates: [],
      today: '2026-09-03',
    });
    expect(m.cardSeen).toBe(false);
    expect(m.sharedGivenSeen).toBeNull();
  });

  it('kartı gören: paylaşım başlattıysa true, başlatmadıysa false', () => {
    const base = { firstOpenDate: FIRST, checkinDates: [], today: '2026-09-03' };
    expect(
      computeDeviceMetrics({ ...base, events: [{ name: 'card_opened' }, { name: 'share_initiated' }] })
        .sharedGivenSeen
    ).toBe(true);
    expect(computeDeviceMetrics({ ...base, events: [{ name: 'card_opened' }] }).sharedGivenSeen).toBe(false);
  });
});

function device(p: Partial<DeviceMetrics> & { seen: boolean; shared?: boolean; d7?: DeviceMetrics['d7'] }): DeviceMetrics {
  return {
    dayNumber: 10,
    filledDays: 5,
    d7: p.d7 ?? 'yes',
    counts: {
      card_unlocked: 0,
      card_opened: p.seen ? 1 : 0,
      share_initiated: p.shared ? 1 : 0,
      line_hidden: 0,
      check_in_saved: 0,
    },
    cardSeen: p.seen,
    sharedGivenSeen: p.seen ? !!p.shared : null,
  };
}

describe('aggregateMetrics (paylaşım oranı paydası = kartı görenler; E4-c)', () => {
  it('payda kartı görenlerdir, kurulum sayısı değil', () => {
    // 10 kurulum: 4 kartı gördü (2 paylaştı), 6 hiç görmedi.
    const devices = [
      device({ seen: true, shared: true }),
      device({ seen: true, shared: true }),
      device({ seen: true }),
      device({ seen: true }),
      ...Array.from({ length: 6 }, () => device({ seen: false })),
    ];
    const a = aggregateMetrics(devices);
    expect(a.installs).toBe(10);
    expect(a.shareDenominator).toBe(4);
    expect(a.sharers).toBe(2);
    expect(a.shareRate).toBeCloseTo(0.5);
    // Kurulum paydası olsaydı 0.2 olurdu:
    expect(a.shareRate).not.toBeCloseTo(0.2);
  });

  it('kart açan / kurulum ayrı raporlanır; hiç görmeyenler ayrı sayılır', () => {
    const a = aggregateMetrics([device({ seen: true }), device({ seen: false }), device({ seen: false }), device({ seen: false })]);
    expect(a.cardOpenedUsers).toBe(1);
    expect(a.cardOpenRate).toBeCloseTo(0.25);
    expect(a.neverSawCard).toBe(3);
  });

  it('kimse kartı görmediyse shareRate null (0/0 değil)', () => {
    const a = aggregateMetrics([device({ seen: false }), device({ seen: false })]);
    expect(a.shareRate).toBeNull();
    expect(a.cardOpenRate).toBe(0);
  });

  it('D7 yalnızca ölçülebilir cihazlar üzerinden (pending/unknown paydada değil)', () => {
    const a = aggregateMetrics([
      device({ seen: false, d7: 'yes' }),
      device({ seen: false, d7: 'no' }),
      device({ seen: false, d7: 'pending' }),
      device({ seen: false, d7: 'unknown' }),
    ]);
    expect(a.d7Measurable).toBe(2);
    expect(a.d7Rate).toBeCloseTo(0.5);
  });

  it('boş liste: oranlar null', () => {
    const a = aggregateMetrics([]);
    expect(a.cardOpenRate).toBeNull();
    expect(a.shareRate).toBeNull();
    expect(a.d7Rate).toBeNull();
  });
});

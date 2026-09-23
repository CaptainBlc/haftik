/**
 * S2 domain testleri: değişim (delta) hesaplama (spec "Hesaplama kuralları"
 * + S2 netleştirme #2, #3).
 */
import { computeDelta } from '../../src/domain/delta';
import { computeCategoryAverage } from '../../src/domain/score';
import type { Category, Checkin } from '../../src/domain/types';

const CATEGORIES: Category[] = ['movement', 'sleep', 'spending', 'social'];

function checkin(localDate: string, value: 1 | 2 | 3): Checkin {
  return { localDate, movement: value, sleep: value, spending: value, social: value };
}

describe('computeDelta — geçen hafta veri yeterliliği', () => {
  it('geçen hafta < 2 dolu gün ise 4 kategorinin de deltası NULL döner', () => {
    const prevWeekCheckins = [checkin('2026-09-14', 2)]; // yalnızca 1 gün
    for (const category of CATEGORIES) {
      expect(computeDelta(2.5, prevWeekCheckins, category)).toBeNull();
    }
  });

  it('geçen hafta 0 dolu gün ise NULL döner', () => {
    for (const category of CATEGORIES) {
      expect(computeDelta(2.5, [], category)).toBeNull();
    }
  });

  it('geçen hafta tam 2 dolu gün ise NULL DEĞİLDİR', () => {
    const prevWeekCheckins = [checkin('2026-09-14', 2), checkin('2026-09-15', 2)];
    expect(computeDelta(2.5, prevWeekCheckins, 'movement')).not.toBeNull();
  });

  it('bu haftanın ortalaması null ise (0 dolu gün) delta da NULL döner', () => {
    const prevWeekCheckins = [checkin('2026-09-14', 2), checkin('2026-09-15', 2)];
    expect(computeDelta(null, prevWeekCheckins, 'movement')).toBeNull();
  });
});

describe('computeDelta — fark büyüklüğü (tam ±0,5 sabit sayılır)', () => {
  // Geçen hafta ortalaması sabit 2.0 olacak şekilde iki gün, ikisi de "2".
  const prevWeekCheckins = [checkin('2026-09-14', 2), checkin('2026-09-15', 2)];

  it('fark tam +0,5 -> 0 (sabit)', () => {
    expect(computeDelta(2.5, prevWeekCheckins, 'movement')).toBe(0);
  });

  it('fark +0,51 -> +1', () => {
    expect(computeDelta(2.51, prevWeekCheckins, 'movement')).toBe(1);
  });

  it('fark tam -0,5 -> 0 (sabit)', () => {
    expect(computeDelta(1.5, prevWeekCheckins, 'movement')).toBe(0);
  });

  it('fark -0,51 -> -1', () => {
    expect(computeDelta(1.49, prevWeekCheckins, 'movement')).toBe(-1);
  });

  it('fark 0 ise 0 döner', () => {
    expect(computeDelta(2.0, prevWeekCheckins, 'movement')).toBe(0);
  });
});

describe('computeDelta — gerçek ortalama zincirinde IEEE754 floating-point riski (regresyon)', () => {
  // Bu hafta 3 dolu gün [2,2,3] -> ortalama tam 7/3. Geçen hafta 6 dolu gün
  // [1,2,2,2,2,2] -> ortalama tam 11/6. Matematiksel fark tam 3/6 = 0,5'tir,
  // ama JS'de `7/3 - 11/6` ikili kayan noktada tam 0,5 değil,
  // `0.5000000000000002` olarak temsil edilir (`> 0.5` epsilon'suz
  // karşılaştırma yanlışlıkla +1 döndürüyordu). Spec S2 netleştirme #2:
  // tam ±0,5 SABİT (0) sayılır. `computeCategoryAverage` üzerinden gerçek
  // check-in dizileriyle test edilir — literal `0.5` kullanılmaz.
  it('bu hafta [2,2,3] (avg 7/3) ve geçen hafta [1,2,2,2,2,2] (avg 11/6) -> fark matematiksel tam +0,5 -> 0 (sabit)', () => {
    const thisWeekCheckins: Checkin[] = [
      checkin('2026-09-21', 2),
      checkin('2026-09-20', 2),
      checkin('2026-09-19', 3),
    ];
    const prevWeekCheckins: Checkin[] = [
      checkin('2026-09-14', 1),
      checkin('2026-09-15', 2),
      checkin('2026-09-16', 2),
      checkin('2026-09-17', 2),
      checkin('2026-09-18', 2),
      checkin('2026-09-19', 2),
    ];

    const thisWeekAvg = computeCategoryAverage(thisWeekCheckins, 'movement');
    expect(thisWeekAvg).toBe(7 / 3);

    expect(computeDelta(thisWeekAvg, prevWeekCheckins, 'movement')).toBe(0);
  });

  it('bu hafta 3 dolu gün [2,2,2] (avg 2) ve geçen hafta 7 dolu gün sum=10 (avg 10/7) -> gerçek fark ~+0,571 (epsilonun çok üstünde) -> +1', () => {
    const thisWeekCheckins: Checkin[] = [
      checkin('2026-09-21', 2),
      checkin('2026-09-20', 2),
      checkin('2026-09-19', 2),
    ];
    // Toplam 10, 7 gün: [1,1,1,1,2,2,2] -> avg 10/7 ≈ 1,42857
    const prevWeekCheckins: Checkin[] = [
      checkin('2026-09-08', 1),
      checkin('2026-09-09', 1),
      checkin('2026-09-10', 1),
      checkin('2026-09-11', 1),
      checkin('2026-09-12', 2),
      checkin('2026-09-13', 2),
      checkin('2026-09-14', 2),
    ];

    const thisWeekAvg = computeCategoryAverage(thisWeekCheckins, 'movement');
    expect(thisWeekAvg).toBe(2);

    expect(computeDelta(thisWeekAvg, prevWeekCheckins, 'movement')).toBe(1);
  });

  it('bu hafta 7 dolu gün sum=10 (avg 10/7) ve geçen hafta 3 dolu gün [2,2,2] (avg 2) -> gerçek fark ~-0,571 (epsilonun çok üstünde) -> -1', () => {
    // Toplam 10, 7 gün: [1,1,1,1,2,2,2] -> avg 10/7 ≈ 1,42857
    const thisWeekCheckins: Checkin[] = [
      checkin('2026-09-15', 1),
      checkin('2026-09-16', 1),
      checkin('2026-09-17', 1),
      checkin('2026-09-18', 1),
      checkin('2026-09-19', 2),
      checkin('2026-09-20', 2),
      checkin('2026-09-21', 2),
    ];
    const prevWeekCheckins: Checkin[] = [
      checkin('2026-09-08', 2),
      checkin('2026-09-09', 2),
      checkin('2026-09-10', 2),
    ];

    const thisWeekAvg = computeCategoryAverage(thisWeekCheckins, 'movement');
    expect(thisWeekAvg).toBe(10 / 7);

    expect(computeDelta(thisWeekAvg, prevWeekCheckins, 'movement')).toBe(-1);
  });
});

describe('computeDelta — weekly_card kaydı gerekmez', () => {
  it('yalnızca prevWeekCheckins doğrudan verilirse delta hesaplanabilir', () => {
    // Fonksiyon imzası zaten weekly_card tablosuna referans almıyor;
    // prevWeekCheckins'i doğrudan (ör. veri katmanından ayrı sorgulanmış
    // ham check-in listesi olarak) geçirmek yeterlidir.
    const prevWeekCheckins: Checkin[] = [
      { localDate: '2026-09-14', movement: 1, sleep: 3, spending: 2, social: 1 },
      { localDate: '2026-09-15', movement: 1, sleep: 3, spending: 2, social: 1 },
      { localDate: '2026-09-16', movement: 1, sleep: 3, spending: 2, social: 1 },
    ];

    expect(computeDelta(3, prevWeekCheckins, 'movement')).toBe(1); // 3 - 1 = +2 > 0.5
    expect(computeDelta(3, prevWeekCheckins, 'sleep')).toBe(0); // 3 - 3 = 0
    expect(computeDelta(1, prevWeekCheckins, 'spending')).toBe(-1); // 1 - 2 = -1 < -0.5
  });
});

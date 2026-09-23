/**
 * S2 domain testleri: kategori ortalaması ve seviye eşikleri (spec
 * "Hesaplama kuralları" + S2 netleştirme #1 — 5/3 ve 7/3 tam kesirleri,
 * literal 1.67/2.33 değil).
 */
import { computeCategoryAverage, computeLevel } from '../../src/domain/score';
import type { Checkin } from '../../src/domain/types';

function checkin(localDate: string, movement: 1 | 2 | 3, sleep: 1 | 2 | 3 = 2): Checkin {
  return { localDate, movement, sleep, spending: 2, social: 2 };
}

describe('computeCategoryAverage', () => {
  it('0 dolu gün ise null döner', () => {
    expect(computeCategoryAverage([], 'movement')).toBeNull();
  });

  it('tekilleştirilmiş check-in\'lerin ham ortalamasını döner', () => {
    const checkins = [checkin('2026-09-21', 1), checkin('2026-09-22', 2), checkin('2026-09-23', 2)];
    expect(computeCategoryAverage(checkins, 'movement')).toBe(5 / 3);
  });

  it('aynı local_date tekrar ederse yalnızca son kayıt sayılır', () => {
    const checkins = [checkin('2026-09-21', 1), checkin('2026-09-21', 3)];
    expect(computeCategoryAverage(checkins, 'movement')).toBe(3);
  });
});

describe('computeLevel — eşikler tam 5/3 ve 7/3 kesirleridir (literal ondalık değil)', () => {
  it('tam sınır 5/3 -> orta (düşük değil)', () => {
    expect(computeLevel(5 / 3)).toBe('medium');
  });

  it('tam sınır 7/3 -> orta (yüksek değil)', () => {
    expect(computeLevel(7 / 3)).toBe('medium');
  });

  it('ortalama 1.0 -> düşük', () => {
    expect(computeLevel(1.0)).toBe('low');
  });

  it('ortalama 3.0 -> yüksek', () => {
    expect(computeLevel(3.0)).toBe('high');
  });

  it('ortalama 2.0 -> orta', () => {
    expect(computeLevel(2.0)).toBe('medium');
  });

  it('7 günlük hafta [1,1,1,2,2,2,2] (11/7) -> düşük', () => {
    const days = ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27'];
    const values: (1 | 2 | 3)[] = [1, 1, 1, 2, 2, 2, 2];
    const checkins = days.map((d, i) => checkin(d, values[i]));
    const average = computeCategoryAverage(checkins, 'movement');
    expect(average).toBe(11 / 7);
    expect(computeLevel(average as number)).toBe('low');
  });

  it('kategoriler birbirinden bağımsızdır (aynı haftada farklı seviyeler)', () => {
    const days = ['2026-09-21', '2026-09-22', '2026-09-23'];
    const checkins: Checkin[] = days.map((d) => ({
      localDate: d,
      movement: 3, // yüksek
      sleep: 1, // düşük
      spending: 2, // orta
      social: 2,
    }));

    const movementAvg = computeCategoryAverage(checkins, 'movement');
    const sleepAvg = computeCategoryAverage(checkins, 'sleep');
    const spendingAvg = computeCategoryAverage(checkins, 'spending');

    expect(computeLevel(movementAvg as number)).toBe('high');
    expect(computeLevel(sleepAvg as number)).toBe('low');
    expect(computeLevel(spendingAvg as number)).toBe('medium');
  });
});

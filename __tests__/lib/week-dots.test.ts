/** 7 nokta ilerleme göstergesi (Ekran 3) — saf hesaplama. */
import { computeWeekDots } from '@/lib/week-dots';
import type { Checkin } from '@/domain/types';

function checkin(localDate: string): Checkin {
  return { localDate, movement: 1, sleep: 1, spending: 1, social: 1 };
}

describe('computeWeekDots', () => {
  const weekStart = '2026-09-21'; // Pazartesi

  it('7 gün döner, Pzt-Paz sırasıyla', () => {
    const dots = computeWeekDots(weekStart, [], '2026-09-23');
    expect(dots).toHaveLength(7);
    expect(dots.map((d) => d.label)).toEqual(['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']);
    expect(dots.map((d) => d.localDate)).toEqual([
      '2026-09-21',
      '2026-09-22',
      '2026-09-23',
      '2026-09-24',
      '2026-09-25',
      '2026-09-26',
      '2026-09-27',
    ]);
  });

  it('check-in olan günler dolu (filled: true) işaretlenir', () => {
    const dots = computeWeekDots(
      weekStart,
      [checkin('2026-09-21'), checkin('2026-09-22'), checkin('2026-09-23')],
      '2026-09-23'
    );
    expect(dots.filter((d) => d.filled).map((d) => d.localDate)).toEqual([
      '2026-09-21',
      '2026-09-22',
      '2026-09-23',
    ]);
    expect(dots.filter((d) => !d.filled)).toHaveLength(4);
  });

  it('haftaya ait olmayan bir check-in yok sayılır', () => {
    const dots = computeWeekDots(weekStart, [checkin('2026-09-14')], '2026-09-23');
    expect(dots.every((d) => !d.filled)).toBe(true);
  });

  it('"bugün" olan gün isToday: true olur', () => {
    const dots = computeWeekDots(weekStart, [], '2026-09-24');
    const today = dots.find((d) => d.localDate === '2026-09-24');
    expect(today?.isToday).toBe(true);
    expect(dots.filter((d) => d.isToday)).toHaveLength(1);
  });
});

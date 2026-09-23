/**
 * Zaman simülasyon panelinin saf tarih aritmetiği (`src/dev/dev-time-helpers.ts`).
 * Geliştirici aracı olsa da davranışı yanlış olursa panel "Pazar 20:00'e
 * ilerlet" düğmesi gerçek kilidi açmaz hale gelir — bu yüzden test edilir.
 */
import { addDays, addHours, currentWeekSunday2000 } from '@/dev/dev-time-helpers';

describe('currentWeekSunday2000', () => {
  it('Pazartesi verildiğinde o haftanın Pazar 20:00\'ini döner', () => {
    const monday = new Date(2026, 8, 21, 9, 0); // Pzt 21 Eylül 2026, 09:00
    const result = currentWeekSunday2000(monday);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(8);
    expect(result.getDate()).toBe(27); // Pazar
    expect(result.getHours()).toBe(20);
    expect(result.getMinutes()).toBe(0);
  });

  it('haftanın Pazar günü verildiğinde aynı günün 20:00\'ini döner (idempotent)', () => {
    const sunday = new Date(2026, 8, 27, 8, 0); // Paz 27 Eylül 2026, 08:00
    const result = currentWeekSunday2000(sunday);
    expect(result.getDate()).toBe(27);
    expect(result.getHours()).toBe(20);
  });

  it('haftanın herhangi bir günü aynı takvim Pazar\'ını verir (domain/week.ts ile tutarlı)', () => {
    const wednesday = new Date(2026, 8, 23, 23, 59);
    const saturday = new Date(2026, 8, 26, 0, 1);
    expect(currentWeekSunday2000(wednesday).getDate()).toBe(27);
    expect(currentWeekSunday2000(saturday).getDate()).toBe(27);
  });
});

describe('addHours', () => {
  it('saat ekler ve gerekirse gün taşırır', () => {
    const base = new Date(2026, 8, 23, 22, 0);
    const result = addHours(base, 3);
    expect(result.getDate()).toBe(24);
    expect(result.getHours()).toBe(1);
  });
});

describe('addDays', () => {
  it('gün ekler ve ay taşırır', () => {
    const base = new Date(2026, 8, 30, 12, 0);
    const result = addDays(base, 1);
    expect(result.getMonth()).toBe(9);
    expect(result.getDate()).toBe(1);
  });
});

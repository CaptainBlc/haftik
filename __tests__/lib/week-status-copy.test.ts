/**
 * Hafta durumu ekranının (Ekran 3) saf metin seçimi (`docs/ux/ekran-akisi.md`
 * ile birebir iki durum + S6'nın dokümante ettiği üçüncü durum, bkz.
 * `src/lib/week-status-copy.ts` dosya başı notu).
 */
import { lockedBoxCaption, weekStatusHeadline } from '@/lib/week-status-copy';
import type { WeekState } from '@/domain/types';

function state(overrides: Partial<WeekState>): WeekState {
  return {
    weekStart: '2026-09-21',
    filledDays: 0,
    requiredDays: 4,
    thresholdMet: false,
    timeMet: false,
    unlocked: false,
    ...overrides,
  };
}

describe('weekStatusHeadline', () => {
  it('eşik dolu değilse kalan gün sayısını yazar', () => {
    const s = state({ filledDays: 3, requiredDays: 4, thresholdMet: false, timeMet: false });
    expect(weekStatusHeadline(s)).toBe('Kartın için 1 gün daha lazım.');
  });

  it('eşik dolu ama saat gelmediyse hazırlanıyor mesajı verir', () => {
    const s = state({
      filledDays: 4,
      requiredDays: 4,
      thresholdMet: true,
      timeMet: false,
      unlocked: false,
    });
    expect(weekStatusHeadline(s)).toBe("Kartın hazırlanıyor, Pazar 20:00'de açılacak.");
  });

  it('unlocked ise "Kartın hazır!" der', () => {
    const s = state({
      filledDays: 5,
      requiredDays: 4,
      thresholdMet: true,
      timeMet: true,
      unlocked: true,
    });
    expect(weekStatusHeadline(s)).toBe('Kartın hazır!');
  });

  it('ilk kart eşiğinde (3) kalan gün doğru hesaplanır', () => {
    const s = state({ filledDays: 1, requiredDays: 3, thresholdMet: false, timeMet: false });
    expect(weekStatusHeadline(s)).toBe('Kartın için 2 gün daha lazım.');
  });
});

describe('lockedBoxCaption', () => {
  it('eşik dolu değilse "ekran-akisi.md" ile birebir metni yazar', () => {
    const s = state({ filledDays: 2, requiredDays: 3, thresholdMet: false, timeMet: false });
    expect(lockedBoxCaption(s)).toBe('Kartın için 1 gün daha lazım.');
  });

  it('eşik dolu ama saat gelmediyse "Pazar 20:00\'de açılıyor" der (ekran-akisi.md birebir)', () => {
    const s = state({
      filledDays: 4,
      requiredDays: 4,
      thresholdMet: true,
      timeMet: false,
      unlocked: false,
    });
    expect(lockedBoxCaption(s)).toBe("Pazar 20:00'de açılıyor");
  });

  it('unlocked ise dokunma daveti metnini verir', () => {
    const s = state({
      filledDays: 4,
      requiredDays: 4,
      thresholdMet: true,
      timeMet: true,
      unlocked: true,
    });
    expect(lockedBoxCaption(s)).toBe('Kartın hazır, açmak için dokun');
  });

  it("K3: unlocked olsa bile needsTodayCheckin true ise pazar-akisi.md'nin metnini verir", () => {
    const s = state({
      filledDays: 4,
      requiredDays: 4,
      thresholdMet: true,
      timeMet: true,
      unlocked: true,
    });
    expect(lockedBoxCaption(s, true)).toBe('Bugünü işaretlemeden kartın açılmaz');
  });

  it('needsTodayCheckin varsayılan olarak false sayılır (geriye dönük uyumlu)', () => {
    const s = state({
      filledDays: 4,
      requiredDays: 4,
      thresholdMet: true,
      timeMet: true,
      unlocked: true,
    });
    expect(lockedBoxCaption(s, false)).toBe(lockedBoxCaption(s));
  });
});

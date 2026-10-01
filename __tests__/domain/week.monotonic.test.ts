/**
 * Kritik-1 düzeltmesinin (öneri B, A8 — bkz. `docs/kararlar/2026-10-01-
 * cekirdekten-once-kararlar.md` ve `docs/inceleme-2026-09-25/21-mimari-ve-
 * efor.md` §2f) **monotonluk özellik testi**: bir kez `unlocked: true` olmuş
 * bir hafta, kendi günleri ve "şimdi" aynı kalırken hiçbir ek işlemle
 * (kart kaydetme, başka haftalara check-in ekleme, aynı sorguyu tekrarlama)
 * yeniden `false`'a dönemez.
 *
 * Bu dosya `week.test.ts`'e (S2'de dondurulmuş, bkz. `CLAUDE.md`) EKLENMEDİ,
 * ayrı bir dosya olarak eklendi (S6'daki `week.date-helpers.test.ts` ile
 * aynı desen).
 */
import { getWeekState, hasQualifiedWeekBefore } from '../../src/domain/week';
import type { Checkin } from '../../src/domain/types';

function checkin(localDate: string): Checkin {
  return { localDate, movement: 2, sleep: 2, spending: 2, social: 2 };
}

describe('hasQualifiedWeekBefore — yalnızca weekStart öncesine bakar', () => {
  it('weekStart\'ın KENDİ haftasına veya SONRAKİ haftalara check-in eklemek sonucu asla değiştirmez', () => {
    const scenarios: { before: string[]; weekStart: string; expected: boolean }[] = [
      { before: [], weekStart: '2026-09-21', expected: false },
      { before: ['2026-09-07', '2026-09-08'], weekStart: '2026-09-21', expected: false }, // önceki hafta yalnız 2 gün
      { before: ['2026-09-07', '2026-09-08', '2026-09-09'], weekStart: '2026-09-21', expected: true }, // 3 gün yeterli
      {
        before: ['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10'],
        weekStart: '2026-09-21',
        expected: true,
      },
    ];

    for (const { before, weekStart, expected } of scenarios) {
      const beforeCheckins = before.map(checkin);
      expect(hasQualifiedWeekBefore(beforeCheckins, weekStart)).toBe(expected);

      // weekStart'ın kendi haftasına VE sonraki haftalara (uzak gelecek
      // dahil) günler ekleniyor — sonuç DEĞİŞMEMELİ, çünkü yalnızca
      // weekStart'tan KESİNLİKLE ÖNCEKİ günler sayılır.
      const addedAtOrAfter = ['2026-09-21', '2026-09-24', '2026-09-28', '2026-10-05', '2026-12-31'].map(
        checkin
      );
      const after = hasQualifiedWeekBefore([...beforeCheckins, ...addedAtOrAfter], weekStart);
      expect(after).toBe(expected);
    }
  });
});

describe('getWeekState — monotonluk (Kritik-1)', () => {
  const weekStart = '2026-09-21';
  const sunday2000 = new Date('2026-09-27T20:00:00');
  const ownDays = ['2026-09-21', '2026-09-22', '2026-09-23'].map(checkin);

  it('ilk nitelikli hafta (3 dolu gün, hiç geçmiş yok) unlocked olur', () => {
    const state = getWeekState({
      weekStart,
      now: sunday2000,
      checkins: ownDays,
      hasQualifiedWeekBefore: hasQualifiedWeekBefore([], weekStart),
    });
    expect(state.unlocked).toBe(true);
  });

  it('KRİTİK-1: aynı hafta, aynı check-in geçmişiyle (ör. kart kaydedildikten, ' +
      'Hafta ekranına birden çok kez dönüldükten sonra) YENİDEN DEĞERLENDİRİLİNCE ' +
      'özdeş sonucu verir — asla yeniden kilitlenmez', () => {
    // Eski (hatalı) davranışta `hasAnyPriorCard()` kart kaydından sonra
    // `true`'ya dönerdi ve bu haftanın kendi eşiği 3'ten 4'e çıkardı
    // (3 dolu gün artık yetersiz kalırdı). Yeni kural yalnızca check-in
    // geçmişinden türediği için ve bu haftaya hiçbir YENİ check-in
    // EKLENMEDİĞİ için (yalnızca aynı sorgu tekrarlanıyor), sonuç birebir
    // aynı kalmalı.
    const first = getWeekState({
      weekStart,
      now: sunday2000,
      checkins: ownDays,
      hasQualifiedWeekBefore: hasQualifiedWeekBefore([], weekStart),
    });
    const second = getWeekState({
      weekStart,
      now: sunday2000,
      checkins: ownDays,
      hasQualifiedWeekBefore: hasQualifiedWeekBefore([], weekStart),
    });
    expect(second).toEqual(first);
    expect(second.unlocked).toBe(true);
  });

  it('sonraki bir haftaya check-in eklenmesi, önceki (zaten unlocked) haftanın ' +
      'durumunu geriye dönük DEĞİŞTİRMEZ', () => {
    const before = getWeekState({
      weekStart,
      now: sunday2000,
      checkins: ownDays,
      hasQualifiedWeekBefore: hasQualifiedWeekBefore([], weekStart),
    });
    expect(before.unlocked).toBe(true);

    // Zaman ilerledi, sonraki haftaya (2026-09-28) 4 check-in daha eklendi.
    const laterCheckins = [
      ...ownDays,
      ...['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01'].map(checkin),
    ];
    const after = getWeekState({
      weekStart, // AYNI hafta
      now: sunday2000, // AYNI an
      checkins: laterCheckins, // ek (sonraki haftaya ait) check-in'lerle
      hasQualifiedWeekBefore: hasQualifiedWeekBefore(
        laterCheckins.filter((c) => c.localDate < weekStart),
        weekStart
      ),
    });
    expect(after).toEqual(before);
    expect(after.unlocked).toBe(true);
  });
});

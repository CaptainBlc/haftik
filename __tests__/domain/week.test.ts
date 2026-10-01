/**
 * S2 domain testleri: hafta sınırları, uygunluk kuralı, saf fonksiyon
 * garantisi ve DST/saat dilimi altyapısı (spec "Hesaplama kuralları" +
 * S2 netleştirmeleri; `plan.md` S2 "Bitti kanıtı").
 */
import { dedupeByLocalDate, getWeekStart, getWeekState } from '../../src/domain/week';
import type { Checkin } from '../../src/domain/types';

function checkin(localDate: string, value: 1 | 2 | 3 = 2): Checkin {
  return { localDate, movement: value, sleep: value, spending: value, social: value };
}

describe('getWeekStart — hafta sınırları', () => {
  it('Pazar 23:59:59, o haftanın (bir önceki) Pazartesi tarihini döndürür', () => {
    expect(getWeekStart(new Date('2026-09-27T23:59:59'))).toBe('2026-09-21');
  });

  it('bir sonraki an, Pazartesi 00:00:00, weekStart değişimini (yeni haftaya geçişi) tetikler', () => {
    expect(getWeekStart(new Date('2026-09-28T00:00:00'))).toBe('2026-09-28');
  });

  it('yıl sonu geçişinde hafta, takvim yıl sınırını aşabilir (aynı hafta iki yılda)', () => {
    // 2026-12-31 (Perşembe) ve 2027-01-01 (Cuma) aynı haftadadır.
    expect(getWeekStart(new Date('2026-12-31T12:00:00'))).toBe('2026-12-28');
    expect(getWeekStart(new Date('2027-01-01T12:00:00'))).toBe('2026-12-28');
  });

  it('ay sonu geçişinde hafta, ay sınırını aşabilir (aynı hafta iki ayda)', () => {
    // 2026-01-31 (Cumartesi) ve 2026-02-01 (Pazar) aynı haftadadır.
    expect(getWeekStart(new Date('2026-01-31T12:00:00'))).toBe('2026-01-26');
    expect(getWeekStart(new Date('2026-02-01T12:00:00'))).toBe('2026-01-26');
  });

  it('artık yıl 29 Şubat için doğru Pazartesi\'yi döndürür', () => {
    // 2024-02-29 bir Perşembe; haftanın Pazartesi'si 2024-02-26.
    expect(getWeekStart(new Date('2024-02-29T12:00:00'))).toBe('2024-02-26');
  });

  it('ISO hafta numarasıyla karışmaz: yalnızca Pazartesi tarihini döndürür, hafta sırasını değil', () => {
    // 2026-01-01 (Perşembe) ISO-8601'de "2026 W01" içindedir, ama o haftanın
    // Pazartesi'si takvimsel olarak önceki yıldadır (2025-12-29). Fonksiyon
    // bir "WNN" veya yıl+hafta-no biçimi değil, daima YYYY-MM-DD tarih döner.
    const result = getWeekStart(new Date('2026-01-01T12:00:00'));
    expect(result).toBe('2025-12-29');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('dedupeByLocalDate', () => {
  it('aynı local_date için tek kayıt bırakır (sonuncusu kazanır)', () => {
    const result = dedupeByLocalDate([checkin('2026-09-21', 1), checkin('2026-09-21', 3)]);
    expect(result).toHaveLength(1);
    expect(result[0].movement).toBe(3);
  });
});

describe('getWeekState — uygunluk sınırları', () => {
  const weekStart = '2026-09-21'; // Pazartesi
  const afterSundayCard = new Date('2026-09-27T20:00:00'); // o hafta Pazar 20:00

  it('normal haftada (ikinci+ kart) 3 dolu gün uygun değildir', () => {
    const checkins = ['2026-09-21', '2026-09-22', '2026-09-23'].map((d) => checkin(d));
    const state = getWeekState({ weekStart, now: afterSundayCard, checkins, hasQualifiedWeekBefore: true });
    expect(state.filledDays).toBe(3);
    expect(state.requiredDays).toBe(4);
    expect(state.thresholdMet).toBe(false);
    expect(state.unlocked).toBe(false);
  });

  it('normal haftada (ikinci+ kart) 4 dolu gün uygundur', () => {
    const checkins = ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24'].map((d) => checkin(d));
    const state = getWeekState({ weekStart, now: afterSundayCard, checkins, hasQualifiedWeekBefore: true });
    expect(state.filledDays).toBe(4);
    expect(state.requiredDays).toBe(4);
    expect(state.thresholdMet).toBe(true);
    expect(state.unlocked).toBe(true);
  });

  it('ilk nitelikli haftada (hasQualifiedWeekBefore=false) 2 dolu gün uygun değildir', () => {
    const checkins = ['2026-09-21', '2026-09-22'].map((d) => checkin(d));
    const state = getWeekState({ weekStart, now: afterSundayCard, checkins, hasQualifiedWeekBefore: false });
    expect(state.filledDays).toBe(2);
    expect(state.requiredDays).toBe(3);
    expect(state.thresholdMet).toBe(false);
    expect(state.unlocked).toBe(false);
  });

  it('ilk nitelikli haftada (hasQualifiedWeekBefore=false) 3 dolu gün uygundur', () => {
    const checkins = ['2026-09-21', '2026-09-22', '2026-09-23'].map((d) => checkin(d));
    const state = getWeekState({ weekStart, now: afterSundayCard, checkins, hasQualifiedWeekBefore: false });
    expect(state.filledDays).toBe(3);
    expect(state.requiredDays).toBe(3);
    expect(state.thresholdMet).toBe(true);
    expect(state.unlocked).toBe(true);
  });

  it('bir önceki hafta nitelikliyse sonraki haftada eşik 4\'e döner', () => {
    const nextWeekStart = '2026-09-28';
    const nextAfterSundayCard = new Date('2026-10-04T20:00:00');
    const threeDays = ['2026-09-28', '2026-09-29', '2026-09-30'].map((d) => checkin(d));
    // Kritik-1 düzeltmesi: artık "kart üretildi mi" değil, "önceki hafta
    // 3+ dolu gün geçirdi mi" soruluyor (hasQualifiedWeekBefore=true) ->
    // aynı 3 gün bu kez eşiği karşılamaz.
    const state = getWeekState({
      weekStart: nextWeekStart,
      now: nextAfterSundayCard,
      checkins: threeDays,
      hasQualifiedWeekBefore: true,
    });
    expect(state.requiredDays).toBe(4);
    expect(state.thresholdMet).toBe(false);
  });

  it('Pazar 19:59 -> timeMet false (kart henüz açılamaz)', () => {
    const fourDays = ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24'].map((d) => checkin(d));
    const state = getWeekState({
      weekStart,
      now: new Date('2026-09-27T19:59:59'),
      checkins: fourDays,
      hasQualifiedWeekBefore: true,
    });
    expect(state.thresholdMet).toBe(true);
    expect(state.timeMet).toBe(false);
    expect(state.unlocked).toBe(false);
  });

  it('Pazar 20:00 (sınır dahil, >=) -> timeMet true', () => {
    const fourDays = ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24'].map((d) => checkin(d));
    const state = getWeekState({
      weekStart,
      now: new Date('2026-09-27T20:00:00'),
      checkins: fourDays,
      hasQualifiedWeekBefore: true,
    });
    expect(state.thresholdMet).toBe(true);
    expect(state.timeMet).toBe(true);
    expect(state.unlocked).toBe(true);
  });

  it('uygun ama açılmamış geçmiş bir haftanın kartı aylar sonra bile unlocked=true kalır', () => {
    const fourDays = ['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08'].map((d) => checkin(d));
    const monthsLater = new Date('2026-09-22T10:00:00');
    const state = getWeekState({
      weekStart: '2026-01-05',
      now: monthsLater,
      checkins: fourDays,
      hasQualifiedWeekBefore: true,
    });
    expect(state.thresholdMet).toBe(true);
    expect(state.timeMet).toBe(true);
    expect(state.unlocked).toBe(true);
  });

  it('aynı local_date\'e iki check-in filledDays\'i yalnızca 1 kez saydırır', () => {
    const checkins = [checkin('2026-09-21', 1), checkin('2026-09-21', 3), checkin('2026-09-22')];
    const state = getWeekState({ weekStart, now: afterSundayCard, checkins, hasQualifiedWeekBefore: true });
    expect(state.filledDays).toBe(2);
  });

  it('haftanın dışındaki check-in\'ler filledDays\'e dahil edilmez', () => {
    const checkins = [
      checkin('2026-09-20'), // önceki hafta Pazar
      checkin('2026-09-21'),
      checkin('2026-09-27'), // bu haftanın Pazar'ı (dahil)
      checkin('2026-09-28'), // sonraki hafta Pazartesi
    ];
    const state = getWeekState({ weekStart, now: afterSundayCard, checkins, hasQualifiedWeekBefore: true });
    expect(state.filledDays).toBe(2);
  });
});

describe('getWeekState — saf fonksiyon garantisi', () => {
  it('aynı girdiyle iki kez çağrılınca özdeş sonuç döner', () => {
    const params = {
      weekStart: '2026-09-21',
      now: new Date('2026-09-27T20:00:00'),
      checkins: ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24'].map((d) => checkin(d)),
      hasQualifiedWeekBefore: true,
    };
    const first = getWeekState(params);
    const second = getWeekState(params);
    expect(second).toEqual(first);
  });

  it('gerçek Date.now()/sistem saatine dokunmaz, yalnızca `now` parametresini kullanır', () => {
    const dateNowSpy = jest.spyOn(Date, 'now');
    dateNowSpy.mockClear();

    getWeekState({
      weekStart: '2026-09-21',
      now: new Date('2026-09-27T20:00:00'),
      checkins: [checkin('2026-09-21')],
      hasQualifiedWeekBefore: true,
    });

    expect(dateNowSpy).not.toHaveBeenCalled();
    dateNowSpy.mockRestore();
  });
});

describe('altyapı: TZ=Europe/Istanbul sabitlemesi 2016 sonrası DST uygulamıyor', () => {
  // S1'in `__tests__/spike/` içindeki spike testine değil, buraya (domain
  // testleri) eklendi — çünkü hafta/uygunluk hesaplarının determinizmi
  // doğrudan bu varsayıma dayanır. Türkiye 2016'dan beri UTC+3'te sabit
  // kalır (yaz saati uygulaması yoktur); bu, `getWeekState`'in "Pazar
  // 20:00" gibi saat karşılaştırmalarının yıl boyunca kaymadığının garantisidir.
  it('kış ve yaz aylarında UTC ofseti aynıdır (-180 dakika, yani UTC+3)', () => {
    const winter = new Date('2026-01-15T12:00:00Z');
    const summer = new Date('2026-07-15T12:00:00Z');
    expect(winter.getTimezoneOffset()).toBe(-180);
    expect(summer.getTimezoneOffset()).toBe(-180);
  });

  it('DST geçiş tarihi olsaydı kayacak bir an (son Pazar Mart/Ekim) bile ofseti değiştirmez', () => {
    // AB/eski Türkiye kuralında DST geçişleri Mart ve Ekim ayının son
    // Pazar günleri olurdu; 2016 sonrası Türkiye bu geçişleri uygulamadığı
    // için bu tarihlerde de ofset -180 olarak sabit kalmalı.
    const marchTransitionWeekend = new Date('2026-03-29T12:00:00Z');
    const octoberTransitionWeekend = new Date('2026-10-25T12:00:00Z');
    expect(marchTransitionWeekend.getTimezoneOffset()).toBe(-180);
    expect(octoberTransitionWeekend.getTimezoneOffset()).toBe(-180);
  });
});

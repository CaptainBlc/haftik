/**
 * S1 (araç zinciri) örnek testi.
 *
 * Amaç bu testte gerçek domain mantığı değil, altyapının çalıştığını
 * kanıtlamak: (1) jest-expo preset'i TypeScript'i doğru derliyor, (2) saat
 * dilimi Europe/Istanbul'a sabitlenmiş, bu yüzden hafta/gün hesapları
 * (S2'de yazılacak) deterministik olacak. Gerçek domain testleri S2'de gelir.
 */
describe('S1 araç zinciri altyapısı', () => {
  it('jest-expo + TypeScript ile basit bir hesap doğru sonuç veriyor', () => {
    const sum = (a: number, b: number): number => a + b;
    expect(sum(2, 3)).toBe(5);
  });

  it('saat dilimi Europe/Istanbul olarak sabitlenmiş (deterministik hafta testleri için)', () => {
    expect(process.env.TZ).toBe('Europe/Istanbul');

    // Türkiye 2016'dan beri yaz saati uygulamıyor; yıl boyunca sabit UTC+3.
    // getTimezoneOffset() dakika cinsinden ve UTC'nin *gerisinde kalınan*
    // miktarı pozitif verir; UTC+3 için bu -180 olmalı.
    const yazTarihi = new Date('2026-07-15T12:00:00Z');
    const kisTarihi = new Date('2026-01-15T12:00:00Z');
    expect(yazTarihi.getTimezoneOffset()).toBe(-180);
    expect(kisTarihi.getTimezoneOffset()).toBe(-180);
  });

  it('bilinen bir UTC anını doğru yerel (Istanbul) saate çeviriyor', () => {
    // 2026-09-20T21:00:00Z -> Europe/Istanbul'da (+03:00) 2026-09-21 00:00 olmalı.
    const an = new Date('2026-09-20T21:00:00.000Z');
    expect(an.getFullYear()).toBe(2026);
    expect(an.getMonth()).toBe(8); // 0 tabanlı: Eylül = 8
    expect(an.getDate()).toBe(21);
    expect(an.getHours()).toBe(0);
    expect(an.getMinutes()).toBe(0);
  });
});

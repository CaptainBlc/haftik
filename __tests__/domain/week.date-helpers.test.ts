/**
 * S6 eklentisi: `toLocalDateString`/`addLocalDays` (bkz. `src/domain/week.ts`
 * dosya başı S6 notu — S2'de dondurulan mevcut dışa aktarımları
 * DEĞİŞTİRMEYEN, geriye dönük uyumlu ek dışa aktarımlar). Ayrı bir dosyada:
 * mevcut `week.test.ts` (S2'de dondurulmuş, "test dosyasını değiştirme"
 * kuralına saygıyla) hiç dokunulmadı.
 */
import { addLocalDays, toLocalDateString } from '@/domain/week';

describe('toLocalDateString', () => {
  it('yerel tarihi YYYY-MM-DD olarak döndürür', () => {
    expect(toLocalDateString(new Date(2026, 8, 23, 14, 30))).toBe('2026-09-23');
  });

  it('tek haneli ay/günü sıfırla doldurur', () => {
    expect(toLocalDateString(new Date(2026, 0, 5, 0, 0))).toBe('2026-01-05');
  });

  it('gece yarısına yakın anlarda (23:59) günü kaydırmaz', () => {
    expect(toLocalDateString(new Date(2026, 8, 27, 23, 59, 59))).toBe('2026-09-27');
  });
});

describe('addLocalDays', () => {
  it('pozitif gün ekler', () => {
    expect(addLocalDays('2026-09-23', 1)).toBe('2026-09-24');
  });

  it('negatif gün çıkarır (dün)', () => {
    expect(addLocalDays('2026-09-23', -1)).toBe('2026-09-22');
  });

  it('ay sonunu doğru taşırır', () => {
    expect(addLocalDays('2026-09-30', 1)).toBe('2026-10-01');
  });

  it('yıl sonunu doğru taşırır', () => {
    expect(addLocalDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('0 gün eklemek aynı tarihi döner', () => {
    expect(addLocalDays('2026-09-23', 0)).toBe('2026-09-23');
  });

  it('haftaStart + 6 gün, o haftanın Pazar günüdür (week.ts ile tutarlılık)', () => {
    // 2026-09-21 bir Pazartesi (bkz. week.test.ts'teki bilinen sabitler).
    expect(addLocalDays('2026-09-21', 6)).toBe('2026-09-27');
  });
});

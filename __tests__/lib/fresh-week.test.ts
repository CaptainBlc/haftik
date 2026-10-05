/**
 * "Yeni bir hafta, temiz sayfa." koşulu (S22; 18 §3 tablo): yalnız check-in TARİHLERİNE bakar. Referans hafta:
 * Pzt 2026-10-12 .. Paz 2026-10-18; önceki hafta 2026-10-05 .. 2026-10-11.
 */
import { FRESH_WEEK_TEXT } from '@/domain/content/save-feedback-texts';
import { shouldShowFreshWeekLine } from '@/lib/fresh-week';

const show = (today: string, ...dates: string[]) => shouldShowFreshWeekLine({ today, checkinDates: dates });

describe('shouldShowFreshWeekLine', () => {
  it('uzun aradan sonra yeni haftanın ilk günü: gösterilir', () => {
    expect(show('2026-10-13', '2026-10-05')).toBe(true); // son kayıt 8 gün önce
  });

  it('SINIR: son kayıt tam 4 gün önce -> gösterilir; 3 gün önce -> gösterilmez', () => {
    expect(show('2026-10-12', '2026-10-08')).toBe(true); // Per -> Pzt: 4 gün
    expect(show('2026-10-12', '2026-10-09')).toBe(false); // Cum -> Pzt: 3 gün
  });

  it('dünkü (Pazar) kayıttan sonra Pazartesi: gösterilmez (aralık yok)', () => {
    expect(show('2026-10-12', '2026-10-11')).toBe(false);
  });

  it('bu haftada zaten bir kayıt varsa "yeni hafta" iddiası yanlış olur: gösterilmez', () => {
    expect(show('2026-10-14', '2026-10-01', '2026-10-12')).toBe(false);
    expect(show('2026-10-14', '2026-10-01', '2026-10-14')).toBe(false); // bugünün kaydı
  });

  it('hiç geçmiş kayıt yok (ilk kullanım): gösterilmez', () => {
    expect(show('2026-10-12')).toBe(false);
  });

  it('haftanın herhangi bir günü (Pazar dahil), hafta boşsa ve son kayıt >= 4 gün önceyse gösterilir', () => {
    expect(show('2026-10-18', '2026-10-05')).toBe(true); // Pazar, hafta tamamen boş
  });

  it('aralık hafta sınırını aşarsa (son kayıt bu haftadan ÖNCE olmalı) sıralama sorun çıkarmaz', () => {
    expect(show('2026-10-13', '2026-09-01', '2026-10-05', '2026-09-20')).toBe(true); // en yakın önceki: 10-05
    expect(show('2026-10-13', '2026-09-01', '2026-10-11', '2026-09-20')).toBe(false); // en yakın: 10-11, 2 gün
  });

  it('gelecek tarihli (bozuk) kayıtlar bu haftayı doldurmuş sayılmaz', () => {
    expect(show('2026-10-13', '2026-10-05', '2026-10-17')).toBe(true);
  });
});

describe('FRESH_WEEK_TEXT', () => {
  it('onaylı metin, kısa, rakamsız, kaç gün geçtiğini yazmaz, kayıp/kaçırma dili yok', () => {
    expect(FRESH_WEEK_TEXT).toBe('Yeni bir hafta, temiz sayfa.');
    expect(FRESH_WEEK_TEXT.length).toBeLessThanOrEqual(52);
    expect(FRESH_WEEK_TEXT).not.toMatch(/\d/);
    expect(FRESH_WEEK_TEXT).not.toMatch(/seri|kaçır|hâlâ|kayıp|unuttun|yine de|gün geçti/i);
  });
});

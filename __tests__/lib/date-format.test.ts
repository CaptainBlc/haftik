/** Bugün ekranı başlığı (Ekran 2): "23 Eylül, Çarşamba" biçimi. */
import { formatTurkishDateLabel } from '@/lib/date-format';

describe('formatTurkishDateLabel', () => {
  it('ekran-akisi.md örneğiyle birebir eşleşir (23 Eylül, Çarşamba)', () => {
    expect(formatTurkishDateLabel('2026-09-23')).toBe('23 Eylül, Çarşamba');
  });

  it('yıl başı (Ocak, Perşembe) doğru biçimlenir', () => {
    // 2026-01-01 bir Perşembe.
    expect(formatTurkishDateLabel('2026-01-01')).toBe('1 Ocak, Perşembe');
  });

  it('Pazar günü doğru biçimlenir', () => {
    // 2026-09-27 bir Pazar (haftaStart 2026-09-21 + 6).
    expect(formatTurkishDateLabel('2026-09-27')).toBe('27 Eylül, Pazar');
  });
});

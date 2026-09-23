/**
 * UI'a özgü Türkçe tarih biçimlendirme (`docs/ux/ekran-akisi.md` Ekran 2
 * başlığı: "23 Eylül, Çarşamba"). Domain katmanına ait DEĞİLDİR (yalnızca
 * görüntüleme metni üretir, hiçbir hesaplama/karar içermez); `YYYY-MM-DD`
 * ayrıştırması `src/domain/week.ts`'teki `parseLocalDate` ile aynı deseni
 * (yalnızca yıl/ay/gün ile `new Date(...)`, `toISOString()` yok) kasıtlı
 * olarak tekrar eder — UI katmanının domain'in iç (dışa aktarılmamış)
 * yardımcılarına bağımlı olmaması için.
 */
const MONTHS_TR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

const WEEKDAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

/** `localDate` (`YYYY-MM-DD`) için "23 Eylül, Çarşamba" biçiminde etiket. */
export function formatTurkishDateLabel(localDate: string): string {
  const [year, month, day] = localDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${day} ${MONTHS_TR[month - 1]}, ${WEEKDAYS_TR[date.getDay()]}`;
}

/** `weekStart`'ın (Pazartesi, `YYYY-MM-DD`) gün baş harfleri: Pzt Sal Çar Per Cum Cmt Paz. */
export const WEEKDAY_SHORT_LABELS_MON_FIRST = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

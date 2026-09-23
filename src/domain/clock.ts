/**
 * Enjekte edilebilir saat arayüzü (spec "Tasarım ilkeleri": "Pazar 20:00" ve
 * "hafta sonu" mantığı gerçek saatle test edilemez; saat dışarıdan verilir).
 *
 * Bu dosya minimaldir: domain fonksiyonlarının asıl saat enjeksiyonu
 * (`week.ts`'teki `getWeekState` gibi) doğrudan `now: Date` parametresi
 * üzerinden yapılır. `Clock` arayüzü, ileride UI/altyapı katmanının gerçek
 * saati (`SystemClock`) veya geliştirme derlemesindeki simülasyon saatini
 * (`src/dev/` — plan.md S6) domain'e enjekte etmek istediğinde kullanılacak
 * ortak sözleşmedir; domain katmanının kendisi bu arayüzü implemente etmez,
 * yalnızca tanımlar.
 */
export interface Clock {
  now(): Date;
}

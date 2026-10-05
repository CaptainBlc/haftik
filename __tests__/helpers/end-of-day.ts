/**
 * `openOrBuildCard` artık `now: Date` ister (TB-10). Eskiden `now` verilmeyen çağrılar `today`in gün sonunu
 * (23:59:59, yerel) varsayıyordu; bu yardımcı o varsayılanı testlerde birebir korur, böylece yalnız ÇAĞRI
 * İMZASI değişir, hiçbir beklenti değişmez.
 */
export function endOfDay(localDate: string): Date {
  return new Date(`${localDate}T23:59:59`);
}

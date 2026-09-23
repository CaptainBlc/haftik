/**
 * Zaman simülasyon panelinin (`dev-time-menu.tsx`) saf tarih aritmetiği.
 * Bilerek React/RN'e dokunmaz — bu dosya doğrudan Jest'le test edilebilir.
 *
 * Bu, `src/domain/week.ts`'in kendisi DEĞİLDİR (domain katmanına ait
 * değildir, saf bir geliştirici aracıdır); yine de "Pazar 20:00" tanımı
 * `week.ts`'teki `CARD_UNLOCK_HOUR` ile birebir tutarlı olmalı — burada
 * kasıtlı olarak aynı sabit (20) tekrar tanımlanır (domain'in özel/dışa
 * aktarılmamış sabitine bağımlılık kurmamak için); ikisi ayrışırsa dev
 * panelindeki "Pazar 20:00'e ilerlet" düğmesi gerçek kilidi açmaz hale
 * gelir — bu bir test/geliştirme aracı riski, ürün riski değil.
 */

/** `week.ts`'teki `CARD_UNLOCK_HOUR` ile bilerek aynı (bkz. yukarıdaki not). */
const CARD_UNLOCK_HOUR = 20;

/**
 * `base`'in içinde bulunduğu haftanın (Pazartesi-Pazar) Pazar günü saat
 * 20:00'ine (yerel) karşılık gelen `Date`'i döndürür. `base` haftanın
 * herhangi bir günü olabilir (Pazartesi..Pazar), sonuç her zaman aynı takvim
 * Pazar'ıdır — `domain/week.ts`'teki `getWeekState`'in `weekStart + 6 gün,
 * saat 20:00` hesabıyla birebir aynı takvim gününü verir.
 */
export function currentWeekSunday2000(base: Date): Date {
  const day = base.getDay(); // 0 = Pazar .. 6 = Cumartesi
  const diffToSunday = day === 0 ? 0 : 7 - day;
  const result = new Date(base);
  result.setDate(result.getDate() + diffToSunday);
  result.setHours(CARD_UNLOCK_HOUR, 0, 0, 0);
  return result;
}

/** `base`'e `hours` saat ekler/çıkarır. */
export function addHours(base: Date, hours: number): Date {
  const result = new Date(base);
  result.setHours(result.getHours() + hours);
  return result;
}

/** `base`'e `days` gün ekler/çıkarır. */
export function addDays(base: Date, days: number): Date {
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  return result;
}

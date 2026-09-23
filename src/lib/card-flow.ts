/**
 * Pazar çakışması (K3, spec "Bildirim planlama kuralları > Pazar çakışması
 * (E4)"; somut akış `docs/ux/pazar-akisi.md`) — saf karar fonksiyonu.
 *
 * Spec kararı (E4a, K3 varsayılanı): "Pazar günü kart ilk açılırken bugün
 * henüz işaretlenmediyse kullanıcı önce check-in ekranına yönlendirilir
 * ('bugünü de ekle, sonra kart açılsın'); kart, check-in sonrası dondurulur."
 * Bu yalnızca kartın **ilk açılışında** (henüz `weekly_card`a
 * dondurulmamışken) geçerlidir — zaten dondurulmuş bir kart için bu kontrol
 * hiç yapılmaz (`open-card.ts`teki çağıran bunu garanti eder).
 */
import type { Checkin } from '@/domain/types';
import { addLocalDays } from '@/domain/week';

export interface NeedsTodayCheckinParams {
  /** Haftanın Pazartesi tarihi, `YYYY-MM-DD`. */
  weekStart: string;
  /** Bugünün yerel tarihi, `YYYY-MM-DD` (`toLocalDateString(now)`). */
  today: string;
  /** O haftanın (henüz dondurulmamış) check-in'leri. */
  checkins: readonly Pick<Checkin, 'localDate'>[];
}

/**
 * `true` döner ancak ve ancak: bugün tam olarak bu haftanın Pazar'ıysa
 * (`weekStart + 6 gün`) **ve** o gün için henüz bir check-in yoksa
 * (`docs/ux/pazar-akisi.md` "Akış (adım adım)": "Sistem kontrolü: bugünün
 * (Pazar) check-in kaydı var mı?"). Geçmiş, açılmamış bir hafta için
 * (bugün artık o haftanın Pazar'ı değil, bkz. `pazar-akisi.md` kenar durum
 * #3) her zaman `false` döner — o haftaya artık check-in eklenemez
 * (düzenleme penceresi bugün/dün ile sınırlı), yönlendirme anlamsız olurdu.
 */
export function needsTodayCheckinBeforeCard(params: NeedsTodayCheckinParams): boolean {
  const { weekStart, today, checkins } = params;
  const weekSunday = addLocalDays(weekStart, 6);
  if (today !== weekSunday) {
    return false;
  }
  return !checkins.some((c) => c.localDate === today);
}

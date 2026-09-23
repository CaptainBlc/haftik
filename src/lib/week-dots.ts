/**
 * Hafta durumu ekranının 7 nokta ilerleme göstergesi (`docs/ux/ekran-akisi.md`
 * Ekran 3: "Pzt Sal Çar Per Cum Cmt Paz" + dolu/boş daire). Saf mantık,
 * React/RN'e dokunmaz.
 */
import { addLocalDays } from '@/domain/week';
import type { Checkin } from '@/domain/types';
import { WEEKDAY_SHORT_LABELS_MON_FIRST } from './date-format';

export interface WeekDot {
  /** `YYYY-MM-DD`, yerel takvim günü. */
  localDate: string;
  /** "Pzt", "Sal", ... */
  label: string;
  /** O gün için dört kategorinin de dolu bir check-in'i var mı. */
  filled: boolean;
  /** O gün, verilen "bugün"e eşit mi (görsel vurgu için). */
  isToday: boolean;
}

/**
 * `weekStart`den (Pazartesi) başlayarak 7 günlük dot dizisini üretir.
 * `checkins` yalnızca o haftaya ait olacak şekilde önceden filtrelenmiş
 * olması beklenmez — burada da `localDate`'e göre bir `Set` kurulur, ekstra
 * günler yok sayılır.
 */
export function computeWeekDots(
  weekStart: string,
  checkins: readonly Checkin[],
  today: string
): WeekDot[] {
  const filledDates = new Set(checkins.map((c) => c.localDate));

  return WEEKDAY_SHORT_LABELS_MON_FIRST.map((label, index) => {
    const localDate = addLocalDays(weekStart, index);
    return {
      localDate,
      label,
      filled: filledDates.has(localDate),
      isToday: localDate === today,
    };
  });
}

/**
 * Bildirim planı (spec "Bildirim planlama kuralları" + "S8 netleştirmeleri",
 * `plan.md` S8). Saf TypeScript: DB/OS/expo import etmez, saat yalnızca
 * `now` parametresidir. Çıktı, scheduler'ın "hepsini iptal et, sonra bunları
 * kur" (idempotent) dediği tam listedir.
 *
 * - Günlük hatırlatma: bugün .. bugün+6 (7 takvim günü); bugün check-in
 *   varsa bugün atlanır; `fireAt <= now` olan planlanmaz (telafi yok).
 * - Pazar 20:00 "kart hazır": yalnızca İÇİNDE BULUNULAN haftanın Pazar'ı,
 *   yalnızca `getWeekState(...).thresholdMet` ise (ilk kart 3, sonrası 4;
 *   eşik mantığı burada yeniden yazılmaz). Hatırlatma kapalıyken de planlanır.
 * - `lastOpenAt` girdisi yok: pencere `now`'a göre kurulduğundan 7+ gün
 *   açılmazsa hatırlatmalar yapısal olarak söner.
 */
import type { NotificationKind } from './content/notification-texts';
import type { Checkin } from './types';
import { addLocalDays, getWeekStart, getWeekState, toLocalDateString } from './week';

export type { NotificationKind };

export interface PlannedNotification {
  /** Deterministik: `daily-YYYY-MM-DD` veya `card-YYYY-MM-DD` (o haftanın Pazar'ı). */
  id: string;
  kind: NotificationKind;
  fireAt: Date;
  /** Bildirim `data` yükü için: tetiklenme gününün haftasının Pazartesi'si. */
  weekStart: string;
}

export interface NotifyPlanInput {
  now: Date;
  checkins: Checkin[];
  settings: { reminderEnabled: boolean; reminderTime: string };
  hasAnyPriorCard: boolean;
}

export const DEFAULT_REMINDER_TIME = '21:00';
export const CARD_READY_TIME = '20:00';
export const REMINDER_WINDOW_DAYS = 7;

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Bozuk saat -> 21:00 (sessizce bildirimsiz kalmak yerine). */
export function parseReminderTime(value: string): { hour: number; minute: number } {
  const match = typeof value === 'string' ? TIME_PATTERN.exec(value) : null;
  const source = match ?? TIME_PATTERN.exec(DEFAULT_REMINDER_TIME)!;
  return { hour: Number(source[1]), minute: Number(source[2]) };
}

/** Yerel takvim gününün belirtilen yerel saatini üretir (DST'de JS normalleştirir, gün başına tek Date). */
function localDateTime(localDate: string, hour: number, minute: number): Date {
  const [year, month, day] = localDate.split('-').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function planNotifications(input: NotifyPlanInput): PlannedNotification[] {
  const { now, checkins, settings, hasAnyPriorCard } = input;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    return [];
  }

  const nowMs = now.getTime();
  const today = toLocalDateString(now);
  const planned: PlannedNotification[] = [];

  if (settings.reminderEnabled) {
    const { hour, minute } = parseReminderTime(settings.reminderTime);
    const todayFilled = checkins.some((c) => c.localDate === today);
    for (let i = 0; i < REMINDER_WINDOW_DAYS; i++) {
      if (i === 0 && todayFilled) {
        continue;
      }
      const date = addLocalDays(today, i);
      const fireAt = localDateTime(date, hour, minute);
      if (fireAt.getTime() <= nowMs) {
        continue;
      }
      planned.push({
        id: `daily-${date}`,
        kind: 'daily',
        fireAt,
        weekStart: getWeekStart(fireAt),
      });
    }
  }

  const weekStart = getWeekStart(now);
  const state = getWeekState({ weekStart, now, checkins, hasAnyPriorCard });
  if (state.thresholdMet) {
    const sunday = addLocalDays(weekStart, 6);
    const cardTime = parseReminderTime(CARD_READY_TIME);
    const fireAt = localDateTime(sunday, cardTime.hour, cardTime.minute);
    if (fireAt.getTime() > nowMs) {
      planned.push({ id: `card-${sunday}`, kind: 'card-ready', fireAt, weekStart });
    }
  }

  planned.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime() || a.id.localeCompare(b.id));
  return planned;
}

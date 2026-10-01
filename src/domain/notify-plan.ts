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
  /** Kritik-1 düzeltmesi (A8) — bkz. `domain/week.ts` `hasQualifiedWeekBefore`. */
  hasQualifiedWeekBefore: boolean;
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

/**
 * `PlannedNotification.id` biçiminin tek kaynağı (22 §4.4, teslim edilmiş
 * bildirimleri kaldırma): `notify/wiring.ts`teki `dismissDailyNotification`/
 * `dismissCardNotification` da bu formatı kullanır, iki yerde ayrı ayrı
 * yazılan şablonların bir gün birbirinden sapması riskine karşı.
 */
export function dailyNotificationId(date: string): string {
  return `daily-${date}`;
}
export function cardNotificationId(sunday: string): string {
  return `card-${sunday}`;
}

export function planNotifications(input: NotifyPlanInput): PlannedNotification[] {
  const { now, checkins, settings, hasQualifiedWeekBefore } = input;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    return [];
  }

  const nowMs = now.getTime();
  const today = toLocalDateString(now);
  const planned: PlannedNotification[] = [];

  const weekStart = getWeekStart(now);
  const state = getWeekState({ weekStart, now, checkins, hasQualifiedWeekBefore });
  const sunday = addLocalDays(weekStart, 6);
  // A13 (Ç24, `docs/inceleme-2026-09-25/29-yol-haritasi.md`): kartın
  // planlandığı Pazar'da ayrıca `daily` kurulmaz -- önceden ikisi de aynı
  // akşam, farklı saatlerde (20:00/21:00) planlanıyor ve Doze/pil yönetimi
  // yüzünden TERS SIRADA bile gelebiliyordu (04-kod-incelemesi.md #11).
  const cardWillFireThisSunday = state.thresholdMet;

  if (settings.reminderEnabled) {
    const { hour, minute } = parseReminderTime(settings.reminderTime);
    const todayFilled = checkins.some((c) => c.localDate === today);
    for (let i = 0; i < REMINDER_WINDOW_DAYS; i++) {
      if (i === 0 && todayFilled) {
        continue;
      }
      const date = addLocalDays(today, i);
      if (cardWillFireThisSunday && date === sunday) {
        continue;
      }
      const fireAt = localDateTime(date, hour, minute);
      if (fireAt.getTime() <= nowMs) {
        continue;
      }
      planned.push({
        id: dailyNotificationId(date),
        kind: 'daily',
        fireAt,
        weekStart: getWeekStart(fireAt),
      });
    }
  }

  if (state.thresholdMet) {
    const cardTime = parseReminderTime(CARD_READY_TIME);
    const fireAt = localDateTime(sunday, cardTime.hour, cardTime.minute);
    if (fireAt.getTime() > nowMs) {
      planned.push({ id: cardNotificationId(sunday), kind: 'card-ready', fireAt, weekStart });
    }
  }

  planned.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime() || a.id.localeCompare(b.id));
  return planned;
}

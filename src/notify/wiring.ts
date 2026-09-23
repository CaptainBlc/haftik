/**
 * Gerçek repo + gerçek scheduler bağlaması (`plan.md` S8). Uygulama kodu
 * (açılış, check-in/kart kaydı, ayar değişimi, silme) yalnızca bu dosyadaki
 * fonksiyonları çağırır. Bildirim hatası asla akışı bozmaz.
 */
import { hasAnyPriorCard } from '@/data/card-repo';
import { getCheckins } from '@/data/checkin-repo';
import { getAllSettings } from '@/data/setting-repo';
import { addLocalDays, getWeekStart } from '@/domain/week';
import { getNow } from '@/lib/now';
import { getDefaultScheduler, type NotificationScheduler, type PermissionStatus } from './scheduler';
import { runExclusiveNotify, syncNotifications, type NotifyState, type SyncResult } from './sync';

export async function readNotifyState(now: Date): Promise<NotifyState> {
  const weekStart = getWeekStart(now);
  const [settings, checkins, prior] = await Promise.all([
    getAllSettings(),
    getCheckins(weekStart, addLocalDays(weekStart, 6)),
    hasAnyPriorCard(),
  ]);
  return {
    checkins,
    settings: {
      reminderEnabled: settings.reminderEnabled,
      reminderTime: settings.reminderTime,
      onboardingDone: settings.onboardingDone,
    },
    hasAnyPriorCard: prior,
  };
}

interface Overrides {
  scheduler?: NotificationScheduler;
  now?: () => Date;
}

/** Açılış / öne gelme / check-in / kart kaydı / ayar değişimi tetikleyicisi. */
export function syncNotificationsNow(overrides: Overrides = {}): Promise<SyncResult> {
  return syncNotifications({
    scheduler: overrides.scheduler ?? getDefaultScheduler(),
    now: overrides.now ?? getNow,
    readState: readNotifyState,
  });
}

/** Kullanıcı akışından: izin `undetermined` ise ister, sonra yeniden planlar. */
export async function requestPermissionAndSync(
  overrides: Overrides = {}
): Promise<PermissionStatus> {
  const scheduler = overrides.scheduler ?? getDefaultScheduler();
  let status: PermissionStatus = 'undetermined';
  try {
    status = await scheduler.getPermission();
    if (status === 'undetermined') {
      status = await scheduler.requestPermission();
    }
  } catch {
    return status;
  }
  await syncNotificationsNow(overrides);
  return status;
}

export async function getNotificationPermission(
  overrides: Overrides = {}
): Promise<PermissionStatus> {
  try {
    return await (overrides.scheduler ?? getDefaultScheduler()).getPermission();
  } catch {
    return 'undetermined';
  }
}

/**
 * "Tüm verilerimi sil" akışını sync kuyruğunun İÇİNDE çalıştırır: çalışan
 * bir sync bitmeden silme başlamaz, sonradan gelen sync silinmiş (boş)
 * veriyi okuyup `onboardingDone=false` ile no-op olur.
 */
export function runDeleteExclusive(task: () => Promise<void>): Promise<void> {
  return runExclusiveNotify(task);
}

/** `deleteAllData` kancası. */
export function cancelAllNotifications(overrides: Overrides = {}): Promise<void> {
  return (overrides.scheduler ?? getDefaultScheduler()).cancelAll();
}

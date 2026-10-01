/**
 * Gerçek repo + gerçek scheduler bağlaması (`plan.md` S8). Uygulama kodu
 * (açılış, check-in/kart kaydı, ayar değişimi, silme) yalnızca bu dosyadaki
 * fonksiyonları çağırır. Bildirim hatası asla akışı bozmaz.
 */
import { getCheckins, getCheckinsBefore } from '@/data/checkin-repo';
import { getAllSettings } from '@/data/setting-repo';
import { cardNotificationId, dailyNotificationId } from '@/domain/notify-plan';
import { addLocalDays, getWeekStart, hasQualifiedWeekBefore } from '@/domain/week';
import { getNow } from '@/lib/now';
import { getDefaultScheduler, type NotificationScheduler, type PermissionState, type PermissionStatus } from './scheduler';
import { runExclusiveNotify, syncNotifications, type NotifyState, type SyncResult } from './sync';

export async function readNotifyState(now: Date): Promise<NotifyState> {
  const weekStart = getWeekStart(now);
  const [settings, checkins, priorCheckins] = await Promise.all([
    getAllSettings(),
    getCheckins(weekStart, addLocalDays(weekStart, 6)),
    // Kritik-1 düzeltmesi (A8): bkz. domain/week.ts hasQualifiedWeekBefore.
    getCheckinsBefore(weekStart),
  ]);
  return {
    checkins,
    settings: {
      reminderEnabled: settings.reminderEnabled,
      reminderTime: settings.reminderTime,
      onboardingDone: settings.onboardingDone,
    },
    hasQualifiedWeekBefore: hasQualifiedWeekBefore(priorCheckins, weekStart),
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

/**
 * Kullanıcı akışından (onboarding "İzin ver" / Ayarlar anahtarı): izin yoksa
 * sistem diyaloğunu ister, sonra yeniden planlar.
 *
 * **V-03 düzeltmesi (2026-10-01, S15):** `canAskAgain: false` iken de istek
 * YAPILIR (eskiden yalnızca `canAskAgain: true` iken isteniyordu). Gerekçe:
 * Android 13+ izin diyaloğu **geri tuşuyla** kapatılırsa (`05-platform-
 * gercekleri.md` P-03/V-03, emülatörde tekrar üretildi) Expo'nun kendi
 * `blocked` bayrağı `true` yazıyor ve `canAskAgain` yanlışlıkla `false`
 * dönüyor — ama OS bayrağı `USER_SET`/`USER_FIXED` DEĞİL, yani sistem aslında
 * TEKRAR SORABİLİR. `canAskAgain: false`e güvenip isteği hiç yapmamak bu
 * durumda kullanıcıyı gereksiz yere "Ayarları aç"a yönlendirirdi. Gerçekten
 * kalıcı reddedilmişse (iki gerçek ret) istek zararsızdır: sistem diyalog
 * göstermeden sessizce `DENIED` döner (Android belgesi). UI yine de
 * `canAskAgain: false` iken "Ayarları aç"ı GÖSTERMEYE devam eder (bu, tek
 * seferlik "harçsız" deneme buna EK bir güvence ağıdır, yerini almaz).
 * Android 13'te kanal, ilk bildirimden önce yoksa diyalog çıkmayabildiğinden
 * kanal istekten ÖNCE oluşturulur (en iyi çaba).
 */
export async function requestPermissionAndSync(
  overrides: Overrides = {}
): Promise<PermissionStatus> {
  const scheduler = overrides.scheduler ?? getDefaultScheduler();
  let status: PermissionStatus = 'undetermined';
  try {
    const state = await scheduler.getPermissionState();
    status = state.status;
    if (!state.granted) {
      await scheduler.ensureChannel().catch(() => undefined);
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

/** Ayarlar UI'ı için: durum + tekrar sorulabilir mi. Hata -> `undetermined`, sorulabilir. */
export async function getNotificationPermissionState(
  overrides: Overrides = {}
): Promise<PermissionState> {
  try {
    return await (overrides.scheduler ?? getDefaultScheduler()).getPermissionState();
  } catch {
    return { status: 'undetermined', granted: false, canAskAgain: true };
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

/**
 * `deleteAllData` kancası. 22 §4.4: yalnızca planlı bildirimleri iptal etmek
 * yetmez — bildirim merkezinde zaten görünen (teslim edilmiş) bildirimler de
 * kaldırılmalı, yoksa "Tüm verilerimi sil" sonrası eski bir hatırlatma
 * gölgede kalabilir.
 */
export async function cancelAllNotifications(overrides: Overrides = {}): Promise<void> {
  const scheduler = overrides.scheduler ?? getDefaultScheduler();
  await scheduler.cancelAll();
  await scheduler.dismissAll();
}

/**
 * 22 §4.4: kart açılınca o haftanın `card-ready` bildirimi (teslim edilmiş
 * olsa bile) bildirim merkezinden kaldırılır — iş zaten bitti, gölgede
 * kalmasın. En iyi çaba, akışı bozmaz.
 */
export function dismissCardNotification(weekStart: string, overrides: Overrides = {}): Promise<void> {
  const scheduler = overrides.scheduler ?? getDefaultScheduler();
  const sunday = addLocalDays(weekStart, 6);
  return scheduler.dismiss(cardNotificationId(sunday));
}

/**
 * 22 §4.4: check-in kaydedilince (Kaydet) o günün `daily` hatırlatması
 * (teslim edilmiş olsa bile) bildirim merkezinden kaldırılır. `date`,
 * kaydedilen check-in'in `localDate`'idir (bugün ya da dün olabilir, düzenleme
 * penceresi gereği) — her zaman "bugün" varsayılmaz.
 */
export function dismissDailyNotification(date: string, overrides: Overrides = {}): Promise<void> {
  const scheduler = overrides.scheduler ?? getDefaultScheduler();
  return scheduler.dismiss(dailyNotificationId(date));
}

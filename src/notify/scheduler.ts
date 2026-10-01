/**
 * `expo-notifications` sarmalayıcısı (`plan.md` S8). YALNIZCA YEREL
 * planlama: push token / uzak push / FCM-APNs kaydı YOK (yasak API'ler
 * bu klasörde geçmez; statik tarama testi var).
 *
 * `expo-notifications` yalnızca `getDefaultNotifications()` içinde (tembel
 * `require`) çözülür; `domain/` ve `data/` içine sızmaz, testler sahte
 * `ExpoNotificationsLike` enjekte eder.
 *
 * `replaceAll` = önce hepsini iptal, sonra deterministik `identifier` ile
 * kur (idempotent). Uygulamanın başka bildirimi olmadığı için "hepsini
 * iptal" güvenlidir. Çağrılar tek bir kuyrukta seri çalışır (son çağrı kazanır).
 */
import { Platform } from 'react-native';

import { NOTIFICATION_TEXTS, type NotificationKind } from '@/domain/content/notification-texts';
import type { PlannedNotification } from '@/domain/notify-plan';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

/**
 * İzin durumu + "sistem tekrar sorabilir mi". Android 13+'da `expo-notifications`
 * henüz hiç sorulmamış izni de `status: 'denied'` + `canAskAgain: true` diye
 * döndürür (`NotificationPermissionsModule.kt`: `areAllDenied`/`!areEnabled` ->
 * DENIED, `UNDETERMINED`den önce), bu yüzden karar `status`e DEĞİL `granted`
 * ve `canAskAgain`e göre verilir (QA BLG-01).
 */
export interface PermissionState {
  status: PermissionStatus;
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * A12 (`docs/kararlar/2026-10-01-taban-oncesi-kararlar-b.md`, S15 — kanal
 * tanımı; Ayarlar'daki ayrı anahtarlar S23'te): **iki kanal**, `hhk-reminders`
 * tek kanalının yerini alır. Kullanıcı sistem ayarlarında günlük hatırlatmayı
 * kapatıp kart bildirimini açık bırakabilir (`22-platform-v2.md` §4.3, tek
 * yönlü kapı — 0.2.0'dan sonra kanal kimliği değişmez).
 */
export const NOTIFICATION_CHANNEL_IDS: Readonly<Record<NotificationKind, string>> = {
  daily: 'daily',
  'card-ready': 'card-ready',
};

const NOTIFICATION_CHANNEL_NAMES: Readonly<Record<NotificationKind, string>> = {
  daily: 'Günlük hatırlatma',
  'card-ready': 'Kart hazır',
};

/** Eski tek kanal (S8-S14); A12 ile ikiye bölündü, yalnızca silmek için tutulur. */
const LEGACY_CHANNEL_ID = 'hhk-reminders';

/** Kullandığımız `expo-notifications` yüzeyinin dar, mock'lanabilir hali. */
export interface ExpoNotificationsLike {
  getPermissionsAsync(): Promise<{ status: string; granted?: boolean; canAskAgain?: boolean }>;
  requestPermissionsAsync(): Promise<{ status: string; granted?: boolean; canAskAgain?: boolean }>;
  scheduleNotificationAsync(request: {
    identifier?: string;
    content: { title: string; body: string; data?: Record<string, unknown> };
    trigger: { type: unknown; date: Date; channelId?: string };
  }): Promise<string>;
  cancelAllScheduledNotificationsAsync(): Promise<void>;
  getAllScheduledNotificationsAsync(): Promise<
    { identifier: string; content: { data?: Record<string, unknown> }; trigger: unknown }[]
  >;
  // 22 §4.4, teslim edilmiş bildirimleri kaldırma: `cancelAll*` yalnızca
  // HENÜZ TETİKLENMEMİŞ planlı bildirimleri etkiler, bildirim merkezinde
  // zaten görünen (teslim edilmiş) bir bildirimi KALDIRMAZ.
  dismissNotificationAsync(identifier: string): Promise<void>;
  dismissAllNotificationsAsync(): Promise<void>;
  setNotificationChannelAsync(channelId: string, channel: Record<string, unknown>): Promise<unknown>;
  /** A12: eski tek kanaldan (`hhk-reminders`) iki kanala geçişte en iyi çaba temizliği. */
  deleteNotificationChannelAsync(channelId: string): Promise<void>;
  SchedulableTriggerInputTypes: { DATE: unknown };
  AndroidImportance: { DEFAULT: unknown };
  // T3, bildirim yönlendirmesi (`notify/notification-routing.ts`):
  // soğuk açılış (uygulama bir bildirime dokunularak başlatıldı) ve sıcak
  // açılış (uygulama açıkken dokunuldu) için. SDK 57 d.ts'inde ikisi de var.
  getLastNotificationResponseAsync(): Promise<{
    notification: { request: { content: { data?: Record<string, unknown> } } };
  } | null>;
  addNotificationResponseReceivedListener(
    listener: (response: {
      notification: { request: { content: { data?: Record<string, unknown> } } };
    }) => void
  ): { remove(): void };
  clearLastNotificationResponseAsync(): Promise<void>;
}

export interface PendingNotification {
  id: string;
  kind: string;
  fireAt: Date;
}

/** T3: bir bildirim yanıtından (dokunma) çözülen, yalnızca ilgilendiğimiz `data` yükü. */
export interface NotificationResponseData {
  data: Record<string, unknown>;
}

export interface NotificationScheduler {
  getPermission(): Promise<PermissionStatus>;
  /** `status` + `granted` + `canAskAgain` (izin isteme kararı için). */
  getPermissionState(): Promise<PermissionState>;
  /** Yalnızca kullanıcı akışından (onboarding / ayar anahtarı) çağrılır. */
  requestPermission(): Promise<PermissionStatus>;
  /** Android kanalı; iOS'ta no-op. İlk planlamadan ÖNCE çağrılmalı. */
  ensureChannel(): Promise<void>;
  replaceAll(plan: PlannedNotification[]): Promise<{ scheduled: number; failed: number }>;
  cancelAll(): Promise<void>;
  listPending(): Promise<PendingNotification[]>;
  /** 22 §4.4: zaten teslim edilmiş (bildirim merkezinde görünen) tek bir bildirimi kaldırır. En iyi çaba, hata yutulur. */
  dismiss(id: string): Promise<void>;
  /** 22 §4.4: "Tüm verilerimi sil" akışı — teslim edilmiş TÜM bildirimleri kaldırır. En iyi çaba, hata yutulur. */
  dismissAll(): Promise<void>;
  /** T3, soğuk açılış: uygulama bir bildirime dokunularak başlatıldıysa son yanıtı döner. */
  getLastResponse(): Promise<NotificationResponseData | null>;
  /** T3, sıcak açılış: uygulama açıkken bir bildirime dokunulursa tetiklenir. */
  onResponseReceived(listener: (response: NotificationResponseData) => void): { remove(): void };
  /** T3: bir yanıt işlendikten sonra tekrar işlenmesin diye temizler. */
  clearLastResponse(): Promise<void>;
}

function toPermissionStatus(status: string): PermissionStatus {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

function toPermissionState(result: {
  status: string;
  granted?: boolean;
  canAskAgain?: boolean;
}): PermissionState {
  const status = toPermissionStatus(result.status);
  const granted = result.granted ?? status === 'granted';
  // Alan yoksa (eski/sahte sürüm) ihtiyatlı ol: yalnızca `undetermined` sorulabilir sayılır.
  const canAskAgain = granted ? false : (result.canAskAgain ?? status === 'undetermined');
  return { status: granted ? 'granted' : status, granted, canAskAgain };
}

export function createScheduler(deps: {
  notifications: ExpoNotificationsLike;
  /** Varsayılan: `Platform.OS`. */
  platform?: string;
}): NotificationScheduler {
  const { notifications } = deps;
  const platform = deps.platform ?? Platform.OS;
  let queue: Promise<unknown> = Promise.resolve();

  function enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = queue.then(task, task);
    queue = run.catch(() => undefined);
    return run;
  }

  return {
    async getPermission() {
      const result = await notifications.getPermissionsAsync();
      return toPermissionStatus(result.status);
    },
    async getPermissionState() {
      return toPermissionState(await notifications.getPermissionsAsync());
    },
    async requestPermission() {
      const result = await notifications.requestPermissionsAsync();
      return toPermissionState(result).status;
    },
    async ensureChannel() {
      if (platform !== 'android') {
        return;
      }
      for (const kind of Object.keys(NOTIFICATION_CHANNEL_IDS) as NotificationKind[]) {
        await notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_IDS[kind], {
          name: NOTIFICATION_CHANNEL_NAMES[kind],
          importance: notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        });
      }
      // En iyi çaba: eski tek kanal varsa kaldırılır (yoksa no-op/hata yutulur).
      await notifications.deleteNotificationChannelAsync(LEGACY_CHANNEL_ID).catch(() => undefined);
    },
    replaceAll(plan) {
      return enqueue(async () => {
        await notifications.cancelAllScheduledNotificationsAsync();
        let scheduled = 0;
        let failed = 0;
        for (const item of plan) {
          const text = NOTIFICATION_TEXTS[item.kind];
          try {
            await notifications.scheduleNotificationAsync({
              identifier: item.id,
              content: {
                title: text.title,
                body: text.body,
                // T3, bildirim yönlendirmesi: `card-ready` rotası `weekStart`e
                // ihtiyaç duyar (`notify/notification-routing.ts`
                // `resolveNotificationRoute`); `daily` her zaman `/today`e
                // gittiğinden yükü büyütmemek için eklenmez.
                data: item.kind === 'card-ready' ? { kind: item.kind, weekStart: item.weekStart } : { kind: item.kind },
              },
              trigger: {
                type: notifications.SchedulableTriggerInputTypes.DATE,
                date: item.fireAt,
                channelId: NOTIFICATION_CHANNEL_IDS[item.kind],
              },
            });
            scheduled++;
          } catch {
            // Tek bildirim hatası kalanları durdurmaz; log sabit metin (veri yok).
            failed++;
            console.warn('[notify] bildirim planlanamadi');
          }
        }
        return { scheduled, failed };
      });
    },
    cancelAll() {
      return enqueue(() => notifications.cancelAllScheduledNotificationsAsync());
    },
    dismiss(id) {
      return notifications.dismissNotificationAsync(id).catch(() => undefined);
    },
    dismissAll() {
      return notifications.dismissAllNotificationsAsync().catch(() => undefined);
    },
    async listPending() {
      const all = await notifications.getAllScheduledNotificationsAsync();
      return all.map((n) => {
        const trigger = n.trigger as {
          value?: number | string | Date;
          date?: number | string | Date;
        } | null;
        const raw = trigger?.date ?? trigger?.value ?? 0;
        return {
          id: n.identifier,
          kind: String(n.content.data?.kind ?? ''),
          fireAt: new Date(raw),
        };
      });
    },
    async getLastResponse() {
      const response = await notifications.getLastNotificationResponseAsync();
      return response ? { data: response.notification.request.content.data ?? {} } : null;
    },
    onResponseReceived(listener) {
      return notifications.addNotificationResponseReceivedListener((response) =>
        listener({ data: response.notification.request.content.data ?? {} })
      );
    },
    clearLastResponse() {
      return notifications.clearLastNotificationResponseAsync();
    },
  };
}

/** Gerçek `expo-notifications` modülünü tembel çözer (yalnızca üretim yolu). */
export function getDefaultNotifications(): ExpoNotificationsLike {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-notifications') as ExpoNotificationsLike;
}

let defaultScheduler: NotificationScheduler | null = null;

export function getDefaultScheduler(): NotificationScheduler {
  if (!defaultScheduler) {
    defaultScheduler = createScheduler({ notifications: getDefaultNotifications() });
  }
  return defaultScheduler;
}

/** Ön planda da bildirim gösterilsin (yalnızca yerel bildirim; ses/rozet yok). */
export function configureNotificationHandler(): void {
  const N = getDefaultNotifications() as unknown as {
    setNotificationHandler(h: {
      handleNotification: () => Promise<Record<string, boolean>>;
    }): void;
  };
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

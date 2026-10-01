/**
 * Sahte `expo-notifications` (S8 testleri): bekleyenler id ile Map (aynı id
 * ezilir, gerçek sözleşme), hata enjeksiyonu ve çağrı sırası kaydı.
 */
import type { ExpoNotificationsLike } from '@/notify/scheduler';

type FakeNotificationResponse = { notification: { request: { content: { data?: Record<string, unknown> } } } };

export interface FakeNotifications extends ExpoNotificationsLike {
  pending: Map<string, { identifier: string; content: { data?: Record<string, unknown>; title: string; body: string }; trigger: { date: Date; channelId?: string } }>;
  calls: string[];
  /** A12: `setNotificationChannelAsync` çağrılarının argümanları (kanal/isim/önem/ses doğrulaması için). */
  channelCalls: { channelId: string; config: Record<string, unknown> }[];
  /** A12: `deleteNotificationChannelAsync` ile silinen kanal id'leri. */
  deletedChannels: string[];
  permission: string;
  requestResult: string;
  failScheduleFor: Set<string>;
  failCancel: boolean;
  requestCount: number;
  /** Android 13+ gerçek davranışı: hiç sorulmamış izin = denied + canAskAgain true. Tanımsız = alan hiç dönmez. */
  canAskAgain?: boolean;
  /** İstek sonrası canAskAgain (ör. ikinci ret -> false). */
  canAskAgainAfterRequest?: boolean;
  /** T3: soğuk açılış senaryosu için `getLastNotificationResponseAsync`in döneceği değer. */
  lastResponse: FakeNotificationResponse | null;
  /** T3: `clearLastNotificationResponseAsync` çağrı sayısı. */
  clearCount: number;
  /** T3: testin `onResponseReceived`i tetiklemesi için kayıtlı dinleyiciler. */
  responseListeners: ((response: FakeNotificationResponse) => void)[];
  /** T3 test yardımcısı: sıcak açılışı taklit eder (gerçek native olayı gibi). */
  emitResponse(data: Record<string, unknown>): void;
  /** 22 §4.4: `dismissNotificationAsync` ile kaldırılan tekil id'ler. */
  dismissed: string[];
  /** 22 §4.4: `dismissAllNotificationsAsync` çağrı sayısı. */
  dismissAllCount: number;
  /** Test enjeksiyonu: bir sonraki `dismissNotificationAsync`/`dismissAllNotificationsAsync` çağrısı hata fırlatsın mı. */
  failDismiss: boolean;
}

export function createFakeNotifications(permission = 'granted'): FakeNotifications {
  const fake: FakeNotifications = {
    pending: new Map(),
    calls: [],
    channelCalls: [],
    deletedChannels: [],
    permission,
    requestResult: 'granted',
    failScheduleFor: new Set(),
    failCancel: false,
    requestCount: 0,
    lastResponse: null,
    clearCount: 0,
    responseListeners: [],
    dismissed: [],
    dismissAllCount: 0,
    failDismiss: false,
    SchedulableTriggerInputTypes: { DATE: 'date' },
    AndroidImportance: { DEFAULT: 3 },
    async getPermissionsAsync() {
      return fake.canAskAgain === undefined
        ? { status: fake.permission }
        : { status: fake.permission, granted: fake.permission === 'granted', canAskAgain: fake.canAskAgain };
    },
    async requestPermissionsAsync() {
      fake.requestCount++;
      fake.permission = fake.requestResult;
      if (fake.canAskAgainAfterRequest !== undefined) fake.canAskAgain = fake.canAskAgainAfterRequest;
      return fake.canAskAgain === undefined
        ? { status: fake.permission }
        : { status: fake.permission, granted: fake.permission === 'granted', canAskAgain: fake.canAskAgain };
    },
    async scheduleNotificationAsync(req) {
      fake.calls.push('schedule');
      const id = req.identifier ?? `auto-${fake.pending.size}`;
      if (fake.failScheduleFor.has(id)) {
        throw new Error('native failure');
      }
      fake.pending.set(id, {
        identifier: id,
        content: req.content,
        trigger: { date: req.trigger.date, channelId: req.trigger.channelId },
      });
      return id;
    },
    async cancelAllScheduledNotificationsAsync() {
      fake.calls.push('cancelAll');
      if (fake.failCancel) {
        throw new Error('cancel failure');
      }
      fake.pending.clear();
    },
    async getAllScheduledNotificationsAsync() {
      return Array.from(fake.pending.values());
    },
    async setNotificationChannelAsync(channelId, config) {
      fake.calls.push('channel');
      fake.channelCalls.push({ channelId, config });
      return null;
    },
    async deleteNotificationChannelAsync(channelId) {
      fake.deletedChannels.push(channelId);
    },
    async getLastNotificationResponseAsync() {
      return fake.lastResponse;
    },
    addNotificationResponseReceivedListener(listener) {
      fake.responseListeners.push(listener);
      return {
        remove() {
          const i = fake.responseListeners.indexOf(listener);
          if (i >= 0) fake.responseListeners.splice(i, 1);
        },
      };
    },
    async clearLastNotificationResponseAsync() {
      fake.clearCount++;
      fake.lastResponse = null;
    },
    emitResponse(data) {
      const response: FakeNotificationResponse = { notification: { request: { content: { data } } } };
      for (const listener of fake.responseListeners) {
        listener(response);
      }
    },
    async dismissNotificationAsync(identifier) {
      if (fake.failDismiss) {
        throw new Error('dismiss failure');
      }
      fake.dismissed.push(identifier);
    },
    async dismissAllNotificationsAsync() {
      if (fake.failDismiss) {
        throw new Error('dismiss failure');
      }
      fake.dismissAllCount++;
    },
  };
  return fake;
}

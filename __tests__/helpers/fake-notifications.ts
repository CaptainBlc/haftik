/**
 * Sahte `expo-notifications` (S8 testleri): bekleyenler id ile Map (aynı id
 * ezilir, gerçek sözleşme), hata enjeksiyonu ve çağrı sırası kaydı.
 */
import type { ExpoNotificationsLike } from '@/notify/scheduler';

export interface FakeNotifications extends ExpoNotificationsLike {
  pending: Map<string, { identifier: string; content: { data?: Record<string, unknown>; title: string; body: string }; trigger: { date: Date } }>;
  calls: string[];
  permission: string;
  requestResult: string;
  failScheduleFor: Set<string>;
  failCancel: boolean;
  requestCount: number;
  /** Android 13+ gerçek davranışı: hiç sorulmamış izin = denied + canAskAgain true. Tanımsız = alan hiç dönmez. */
  canAskAgain?: boolean;
  /** İstek sonrası canAskAgain (ör. ikinci ret -> false). */
  canAskAgainAfterRequest?: boolean;
}

export function createFakeNotifications(permission = 'granted'): FakeNotifications {
  const fake: FakeNotifications = {
    pending: new Map(),
    calls: [],
    permission,
    requestResult: 'granted',
    failScheduleFor: new Set(),
    failCancel: false,
    requestCount: 0,
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
        trigger: { date: req.trigger.date },
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
    async setNotificationChannelAsync() {
      fake.calls.push('channel');
      return null;
    },
  };
  return fake;
}

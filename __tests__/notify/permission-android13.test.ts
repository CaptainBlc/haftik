/**
 * QA BLG-01: Android 13+ `expo-notifications`, hiç sorulmamış izni
 * `denied` + `canAskAgain: true` döndürür. Karar `status`e değil `granted` /
 * `canAskAgain`e göre verilir.
 */
import { setOnboardingDone } from '@/data/setting-repo';
import { createScheduler } from '@/notify/scheduler';
import { getNotificationPermissionState, requestPermissionAndSync } from '@/notify/wiring';
import { createFakeNotifications } from '../helpers/fake-notifications';
import { setupTestDb } from '../helpers/setup-test-db';

const NOW = new Date('2026-09-23T12:00:00');

function env(permission: string, canAskAgain?: boolean) {
  const fake = createFakeNotifications(permission);
  fake.canAskAgain = canAskAgain;
  const scheduler = createScheduler({ notifications: fake, platform: 'android' });
  return { fake, scheduler, o: { scheduler, now: () => NOW } };
}

describe('bildirim izni: Android 13+ durumu (BLG-01)', () => {
  setupTestDb();

  it('denied + canAskAgain:true -> sistem diyaloğu İSTENİR, verilirse plan kurulur', async () => {
    await setOnboardingDone(true);
    const { fake, o } = env('denied', true);
    fake.requestResult = 'granted';
    fake.canAskAgainAfterRequest = false;
    expect(await requestPermissionAndSync(o)).toBe('granted');
    expect(fake.requestCount).toBe(1);
    expect(fake.pending.size).toBe(7);
  });

  it('istekten ÖNCE kanal oluşturulur (Android 13 diyalog koşulu)', async () => {
    await setOnboardingDone(true);
    const { fake, o } = env('denied', true);
    const order: string[] = [];
    const origRequest = fake.requestPermissionsAsync.bind(fake);
    fake.requestPermissionsAsync = async () => {
      order.push('request');
      return origRequest();
    };
    const origChannel = fake.setNotificationChannelAsync.bind(fake);
    fake.setNotificationChannelAsync = async (...a) => {
      order.push('channel');
      return origChannel(...a);
    };
    await requestPermissionAndSync(o);
    expect(order.slice(0, 2)).toEqual(['channel', 'request']);
  });

  it('denied + canAskAgain:false (kalıcı ret) -> istek YAPILMAZ, plan yok', async () => {
    await setOnboardingDone(true);
    const { fake, o } = env('denied', false);
    expect(await requestPermissionAndSync(o)).toBe('denied');
    expect(fake.requestCount).toBe(0);
    expect(fake.pending.size).toBe(0);
  });

  it('granted -> istek yapılmaz, plan kurulur', async () => {
    await setOnboardingDone(true);
    const { fake, o } = env('granted', false);
    expect(await requestPermissionAndSync(o)).toBe('granted');
    expect(fake.requestCount).toBe(0);
    expect(fake.pending.size).toBe(7);
  });

  it('istenip reddedilirse (ikinci ret) çökmez, plan yok, durum kalıcı ret', async () => {
    await setOnboardingDone(true);
    const { fake, o } = env('denied', true);
    fake.requestResult = 'denied';
    fake.canAskAgainAfterRequest = false;
    expect(await requestPermissionAndSync(o)).toBe('denied');
    expect(fake.pending.size).toBe(0);
    expect(await getNotificationPermissionState(o)).toEqual({
      status: 'denied',
      granted: false,
      canAskAgain: false,
    });
  });

  it('getNotificationPermissionState: Android 13 ilk durum = denied ama sorulabilir', async () => {
    const { o } = env('denied', true);
    expect(await getNotificationPermissionState(o)).toEqual({
      status: 'denied',
      granted: false,
      canAskAgain: true,
    });
  });

  it('native hata -> çökmez', async () => {
    const { fake, o } = env('denied', true);
    fake.getPermissionsAsync = async () => {
      throw new Error('native');
    };
    await expect(requestPermissionAndSync(o)).resolves.toBe('undetermined');
    expect(await getNotificationPermissionState(o)).toEqual({
      status: 'undetermined',
      granted: false,
      canAskAgain: true,
    });
  });
});

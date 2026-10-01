/**
 * S8 entegrasyon: gerçek repolar (bellek-içi test DB) + sahte expo-notifications.
 */
import { saveCard } from '@/data/card-repo';
import { getCheckins, saveCheckin } from '@/data/checkin-repo';
import { deleteAllData } from '@/data/delete-all';
import { setOnboardingDone, setReminderEnabled, setReminderTime } from '@/data/setting-repo';
import type { CardSnapshot } from '@/domain/types';
import { createScheduler } from '@/notify/scheduler';
import {
  cancelAllNotifications,
  requestPermissionAndSync,
  syncNotificationsNow,
} from '@/notify/wiring';
import { createFakeNotifications } from '../helpers/fake-notifications';
import { setupTestDb } from '../helpers/setup-test-db';

const NOW = new Date('2026-09-23T12:00:00');

function env(permission = 'granted') {
  const fake = createFakeNotifications(permission);
  const scheduler = createScheduler({ notifications: fake, platform: 'android' });
  return { fake, o: { scheduler, now: () => NOW } };
}

const day = (d: string) => ({ localDate: d, movement: 2, sleep: 2, spending: 2, social: 2 }) as const;

const CARD: CardSnapshot = {
  weekStart: '2026-09-14',
  checkinDays: 4,
  title: { id: 't', text: 't', basedOnCategories: [] },
  lines: {
    movement: { id: 'm', text: 'm' },
    sleep: { id: 's', text: 's' },
    spending: { id: 'sp', text: 'sp' },
    social: { id: 'so', text: 'so' },
  },
  deltas: { movement: null, sleep: null, spending: null, social: null },
  summary: { id: 'su', text: 'su' },
  contentVersion: 1,
};

describe('bildirim entegrasyonu', () => {
  setupTestDb();

  it('onboarding bitmeden hiçbir şey kurulmaz', async () => {
    const { fake, o } = env();
    expect(await syncNotificationsNow(o)).toEqual({ status: 'skipped' });
    expect(fake.pending.size).toBe(0);
  });

  it('açılış sync: onboarding sonrası 7 günlük plan', async () => {
    await setOnboardingDone(true);
    const { fake, o } = env();
    await syncNotificationsNow(o);
    expect(fake.pending.size).toBe(7);
  });

  it('check-in kaydı sonrası sync: bugünkü iptal', async () => {
    await setOnboardingDone(true);
    const { fake, o } = env();
    await syncNotificationsNow(o);
    await saveCheckin(day('2026-09-23'));
    await syncNotificationsNow(o);
    expect(fake.pending.has('daily-2026-09-23')).toBe(false);
  });

  it('Kritik-1 düzeltmesi (A8): başka bir haftanın kartını kaydetmek bu haftanın eşiğini DEĞİŞTİRMEZ', async () => {
    // Eski davranış (B-2, bu test eskiden tam tersini doğruluyordu): herhangi
    // bir haftaya kart kaydetmek `hasAnyPriorCard()`'ı global olarak true
    // yapıyordu, bu da İLGİSİZ haftaların eşiğini 3'ten 4'e çıkarıp
    // card-ready bildirimini yanlışlıkla düşürüyordu. Yeni kural check-in
    // GEÇMİŞİNE bakar (`hasQualifiedWeekBefore`), kart varlığına değil --
    // bu testte check-in geçmişi değişmediği için card-2026-09-27 kalıcı
    // olmalı (bkz. docs/kararlar/2026-10-01-cekirdekten-once-kararlar.md A8).
    await setOnboardingDone(true);
    for (const d of ['2026-09-21', '2026-09-22', '2026-09-23']) {
      await saveCheckin(day(d));
    }
    const { fake, o } = env();
    await syncNotificationsNow(o);
    expect(fake.pending.has('card-2026-09-27')).toBe(true);
    await saveCard(CARD); // farklı (önceki) haftanın kartı: weekStart 2026-09-14.
    await syncNotificationsNow(o);
    expect(fake.pending.has('card-2026-09-27')).toBe(true);
  });

  it('ayar değişimi: kapat -> günlük yok; saat değişimi -> yeni saat', async () => {
    await setOnboardingDone(true);
    const { fake, o } = env();
    await setReminderTime('20:00');
    await syncNotificationsNow(o);
    expect(fake.pending.get('daily-2026-09-24')!.trigger.date.getHours()).toBe(20);
    await setReminderEnabled(false);
    await syncNotificationsNow(o);
    expect(fake.pending.size).toBe(0);
  });

  it('izin akışı: undetermined -> ister; reddedilirse çökmez, plan yok', async () => {
    await setOnboardingDone(true);
    const { fake, o } = env('undetermined');
    fake.requestResult = 'denied';
    expect(await requestPermissionAndSync(o)).toBe('denied');
    expect(fake.requestCount).toBe(1);
    expect(fake.pending.size).toBe(0);
    const g = env('undetermined');
    expect(await requestPermissionAndSync(g.o)).toBe('granted');
    expect(g.fake.pending.size).toBe(7);
  });

  it('S-05/S-06: silme bekleyenleri boşaltır, silme sonrası sync yeniden KURMAZ', async () => {
    await setOnboardingDone(true);
    await saveCheckin(day('2026-09-23'));
    const { fake, o } = env();
    await syncNotificationsNow(o);
    expect(fake.pending.size).toBeGreaterThan(0);
    await deleteAllData(() => cancelAllNotifications(o));
    expect(fake.pending.size).toBe(0);
    await syncNotificationsNow(o); // ekran odak efekti benzeri
    expect(fake.pending.size).toBe(0);
  });

  it('S-07: cancelAll hata verse de veri silinir', async () => {
    await setOnboardingDone(true);
    await saveCheckin(day('2026-09-23'));
    const { fake, o } = env();
    fake.failCancel = true;
    await expect(deleteAllData(() => cancelAllNotifications(o))).resolves.toBeUndefined();
    expect(await getCheckins('2026-09-01', '2026-09-30')).toEqual([]);
  });
});

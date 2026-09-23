import { NOTIFICATION_TEXTS } from '@/domain/content/notification-texts';
import type { PlannedNotification } from '@/domain/notify-plan';
import { createScheduler } from '@/notify/scheduler';
import { createFakeNotifications } from '../helpers/fake-notifications';

const item = (id: string, kind: 'daily' | 'card-ready', iso: string): PlannedNotification => ({
  id,
  kind,
  fireAt: new Date(iso),
  weekStart: '2026-09-21',
});

const PLAN = [
  item('daily-2026-09-24', 'daily', '2026-09-24T18:00:00Z'),
  item('daily-2026-09-25', 'daily', '2026-09-25T18:00:00Z'),
  item('card-2026-09-27', 'card-ready', '2026-09-27T17:00:00Z'),
];

describe('scheduler', () => {
  it('S-01: aynı planla 3 kez replaceAll -> kopya yok', async () => {
    const fake = createFakeNotifications();
    const s = createScheduler({ notifications: fake, platform: 'android' });
    for (let i = 0; i < 3; i++) {
      await s.replaceAll(PLAN);
    }
    const pending = await s.listPending();
    expect(pending.map((p) => p.id)).toEqual(PLAN.map((p) => p.id));
    expect(pending[2].fireAt.toISOString()).toBe('2026-09-27T17:00:00.000Z');
    expect(pending[2].kind).toBe('card-ready');
  });

  it('S-02: plan dışında kalan eski bekleyen kalmaz', async () => {
    const fake = createFakeNotifications();
    const s = createScheduler({ notifications: fake, platform: 'android' });
    await s.replaceAll(PLAN);
    await s.replaceAll(PLAN.slice(0, 1));
    expect((await s.listPending()).map((p) => p.id)).toEqual(['daily-2026-09-24']);
  });

  it('S-13: sabit id ile ikinci schedule ezer (deterministik identifier)', async () => {
    const fake = createFakeNotifications();
    const s = createScheduler({ notifications: fake, platform: 'android' });
    await s.replaceAll([PLAN[0], PLAN[0]]);
    expect(fake.pending.size).toBe(1);
  });

  it('S-11: tek schedule hatası yakalanır, kalanlar kurulur', async () => {
    const fake = createFakeNotifications();
    fake.failScheduleFor.add('daily-2026-09-25');
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const s = createScheduler({ notifications: fake, platform: 'android' });
    const result = await s.replaceAll(PLAN);
    expect(result).toEqual({ scheduled: 2, failed: 1 });
    expect(fake.pending.has('card-2026-09-27')).toBe(true);
    // log veri içermez
    for (const call of warn.mock.calls) {
      expect(JSON.stringify(call)).not.toMatch(/2026|daily|card/);
    }
    warn.mockRestore();
  });

  it('metin kind`dan çözülür, data yalnızca {kind}, trigger tarih tipinde', async () => {
    const fake = createFakeNotifications();
    const spy = jest.spyOn(fake, 'scheduleNotificationAsync');
    const s = createScheduler({ notifications: fake, platform: 'android' });
    await s.replaceAll([PLAN[2]]);
    const req = spy.mock.calls[0][0];
    expect(req.content.title).toBe(NOTIFICATION_TEXTS['card-ready'].title);
    expect(req.content.body).toBe(NOTIFICATION_TEXTS['card-ready'].body);
    expect(req.content.data).toEqual({ kind: 'card-ready' });
    expect(req.trigger.type).toBe('date');
    expect(req.trigger.date).toEqual(PLAN[2].fireAt);
    expect(req.identifier).toBe('card-2026-09-27');
  });

  it('S-03: eşzamanlı iki replaceAll seri çalışır, sonuç SON planın kendisi', async () => {
    const fake = createFakeNotifications();
    const s = createScheduler({ notifications: fake, platform: 'android' });
    await Promise.all([s.replaceAll(PLAN), s.replaceAll(PLAN.slice(0, 1))]);
    expect(Array.from(fake.pending.keys())).toEqual(['daily-2026-09-24']);
    // her replaceAll cancel ile başlar: cancel, schedule*, cancel, schedule
    expect(fake.calls).toEqual([
      'cancelAll',
      'schedule',
      'schedule',
      'schedule',
      'cancelAll',
      'schedule',
    ]);
  });

  it('S-05: cancelAll bekleyenleri boşaltır', async () => {
    const fake = createFakeNotifications();
    const s = createScheduler({ notifications: fake, platform: 'android' });
    await s.replaceAll(PLAN);
    await s.cancelAll();
    expect(await s.listPending()).toEqual([]);
  });

  it('S-12: Android kanalı oluşturulur, iOS no-op', async () => {
    const a = createFakeNotifications();
    await createScheduler({ notifications: a, platform: 'android' }).ensureChannel();
    expect(a.calls).toEqual(['channel']);
    const i = createFakeNotifications();
    await createScheduler({ notifications: i, platform: 'ios' }).ensureChannel();
    expect(i.calls).toEqual([]);
  });

  it('izin durumları eşlenir; bilinmeyen -> undetermined', async () => {
    const fake = createFakeNotifications('denied');
    const s = createScheduler({ notifications: fake, platform: 'android' });
    expect(await s.getPermission()).toBe('denied');
    fake.permission = 'weird';
    expect(await s.getPermission()).toBe('undetermined');
    fake.permission = 'granted';
    expect(await s.getPermission()).toBe('granted');
  });
});

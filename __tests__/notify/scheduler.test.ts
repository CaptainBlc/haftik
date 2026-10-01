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

  it('metin kind`dan çözülür, data {kind, weekStart} (T3 yönlendirmesi için), trigger tarih tipinde', async () => {
    const fake = createFakeNotifications();
    const spy = jest.spyOn(fake, 'scheduleNotificationAsync');
    const s = createScheduler({ notifications: fake, platform: 'android' });
    await s.replaceAll([PLAN[2]]);
    const req = spy.mock.calls[0][0];
    expect(req.content.title).toBe(NOTIFICATION_TEXTS['card-ready'].title);
    expect(req.content.body).toBe(NOTIFICATION_TEXTS['card-ready'].body);
    expect(req.content.data).toEqual({ kind: 'card-ready', weekStart: '2026-09-21' });
    expect(req.trigger.type).toBe('date');
    expect(req.trigger.date).toEqual(PLAN[2].fireAt);
    expect(req.identifier).toBe('card-2026-09-27');
  });

  it('T3: `daily` için data yalnızca {kind} (weekStart eklenmez, rota zaten sabit /today)', async () => {
    const fake = createFakeNotifications();
    const spy = jest.spyOn(fake, 'scheduleNotificationAsync');
    const s = createScheduler({ notifications: fake, platform: 'android' });
    await s.replaceAll([PLAN[0]]);
    const req = spy.mock.calls[0][0];
    expect(req.content.data).toEqual({ kind: 'daily' });
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

  it('S-12 (A12 ile güncellendi): Android İKİ kanal oluşturur, iOS no-op', async () => {
    const a = createFakeNotifications();
    await createScheduler({ notifications: a, platform: 'android' }).ensureChannel();
    expect(a.calls).toEqual(['channel', 'channel']);
    expect(a.channelCalls.map((c) => c.channelId).sort()).toEqual(['card-ready', 'daily']);
    for (const call of a.channelCalls) {
      expect(call.config.importance).toBe(a.AndroidImportance.DEFAULT);
      expect(call.config.sound).toBe('default');
    }
    const i = createFakeNotifications();
    await createScheduler({ notifications: i, platform: 'ios' }).ensureChannel();
    expect(i.calls).toEqual([]);
  });

  it('A12: eski tek kanal (hhk-reminders) en iyi çabayla silinir', async () => {
    const a = createFakeNotifications();
    await createScheduler({ notifications: a, platform: 'android' }).ensureChannel();
    expect(a.deletedChannels).toEqual(['hhk-reminders']);
  });

  it('A12: card-ready bildirimi card-ready kanalına, daily bildirimi daily kanalına planlanır', async () => {
    const fake = createFakeNotifications();
    const s = createScheduler({ notifications: fake, platform: 'android' });
    await s.replaceAll(PLAN);
    expect(fake.pending.get('daily-2026-09-24')!.trigger.channelId).toBe('daily');
    expect(fake.pending.get('card-2026-09-27')!.trigger.channelId).toBe('card-ready');
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

  describe('T3: bildirim yanıtı (yönlendirme için)', () => {
    it('getLastResponse: yanıt yoksa null, varsa yalnızca data çözülür', async () => {
      const fake = createFakeNotifications();
      const s = createScheduler({ notifications: fake, platform: 'android' });
      expect(await s.getLastResponse()).toBeNull();

      fake.lastResponse = { notification: { request: { content: { data: { kind: 'daily' } } } } };
      expect(await s.getLastResponse()).toEqual({ data: { kind: 'daily' } });
    });

    it('getLastResponse: data yoksa boş obje döner (çökmez)', async () => {
      const fake = createFakeNotifications();
      fake.lastResponse = { notification: { request: { content: {} } } };
      const s = createScheduler({ notifications: fake, platform: 'android' });
      expect(await s.getLastResponse()).toEqual({ data: {} });
    });

    it('onResponseReceived: sıcak açılış olayında dinleyici data ile çağrılır', () => {
      const fake = createFakeNotifications();
      const s = createScheduler({ notifications: fake, platform: 'android' });
      const received: Record<string, unknown>[] = [];
      s.onResponseReceived((r) => received.push(r.data));
      fake.emitResponse({ kind: 'card-ready', weekStart: '2026-09-07' });
      expect(received).toEqual([{ kind: 'card-ready', weekStart: '2026-09-07' }]);
    });

    it('onResponseReceived: remove() sonrası dinleyici tetiklenmez', () => {
      const fake = createFakeNotifications();
      const s = createScheduler({ notifications: fake, platform: 'android' });
      const received: unknown[] = [];
      const sub = s.onResponseReceived((r) => received.push(r.data));
      sub.remove();
      fake.emitResponse({ kind: 'daily' });
      expect(received).toEqual([]);
    });

    it('clearLastResponse: native temizleyiciyi çağırır', async () => {
      const fake = createFakeNotifications();
      fake.lastResponse = { notification: { request: { content: { data: { kind: 'daily' } } } } };
      const s = createScheduler({ notifications: fake, platform: 'android' });
      await s.clearLastResponse();
      expect(fake.clearCount).toBe(1);
      expect(fake.lastResponse).toBeNull();
    });
  });

  describe('22 §4.4: teslim edilmiş bildirimleri kaldırma', () => {
    it('dismiss: native dismissNotificationAsync id ile çağrılır', async () => {
      const fake = createFakeNotifications();
      const s = createScheduler({ notifications: fake, platform: 'android' });
      await s.dismiss('daily-2026-09-23');
      expect(fake.dismissed).toEqual(['daily-2026-09-23']);
    });

    it('dismiss: native hata verirse yutulur (en iyi çaba, çökmez)', async () => {
      const fake = createFakeNotifications();
      fake.failDismiss = true;
      const s = createScheduler({ notifications: fake, platform: 'android' });
      await expect(s.dismiss('daily-2026-09-23')).resolves.toBeUndefined();
    });

    it('dismissAll: native dismissAllNotificationsAsync çağrılır', async () => {
      const fake = createFakeNotifications();
      const s = createScheduler({ notifications: fake, platform: 'android' });
      await s.dismissAll();
      expect(fake.dismissAllCount).toBe(1);
    });

    it('dismissAll: native hata verirse yutulur (en iyi çaba, çökmez)', async () => {
      const fake = createFakeNotifications();
      fake.failDismiss = true;
      const s = createScheduler({ notifications: fake, platform: 'android' });
      await expect(s.dismissAll()).resolves.toBeUndefined();
    });
  });
});

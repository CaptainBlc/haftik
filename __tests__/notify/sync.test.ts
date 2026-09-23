import type { Checkin } from '@/domain/types';
import { createScheduler } from '@/notify/scheduler';
import { runExclusiveNotify, syncNotifications, type NotifyState } from '@/notify/sync';
import { createFakeNotifications } from '../helpers/fake-notifications';

const ci = (localDate: string): Checkin => ({
  localDate,
  movement: 2,
  sleep: 2,
  spending: 2,
  social: 2,
});

function state(over: Partial<NotifyState> = {}): NotifyState {
  return {
    checkins: [],
    settings: { reminderEnabled: true, reminderTime: '21:00', onboardingDone: true },
    hasAnyPriorCard: true,
    ...over,
  };
}

const NOW = new Date('2026-09-23T12:00:00');

function setup(permission = 'granted') {
  const fake = createFakeNotifications(permission);
  const scheduler = createScheduler({ notifications: fake, platform: 'android' });
  return { fake, scheduler };
}

describe('syncNotifications', () => {
  it('granted: kanal ÖNCE, sonra planlama; 7 günlük', async () => {
    const { fake, scheduler } = setup();
    const r = await syncNotifications({ scheduler, now: () => NOW, readState: async () => state() });
    expect(r.status).toBe('granted');
    expect(fake.calls[0]).toBe('channel');
    expect(fake.calls.indexOf('channel')).toBeLessThan(fake.calls.indexOf('schedule'));
    expect(fake.pending.size).toBe(7);
  });

  it('S-08: denied -> schedule çağrılmaz, izin istenmez', async () => {
    const { fake, scheduler } = setup('denied');
    const r = await syncNotifications({ scheduler, now: () => NOW, readState: async () => state() });
    expect(r).toEqual({ status: 'denied' });
    expect(fake.calls).toEqual([]);
    expect(fake.requestCount).toBe(0);
  });

  it('S-09: undetermined -> arka plan sync izin İSTEMEZ', async () => {
    const { fake, scheduler } = setup('undetermined');
    const r = await syncNotifications({ scheduler, now: () => NOW, readState: async () => state() });
    expect(r).toEqual({ status: 'undetermined' });
    expect(fake.requestCount).toBe(0);
    expect(fake.pending.size).toBe(0);
  });

  it('S-10: izin sonradan açılınca sonraki sync planı kurar', async () => {
    const { fake, scheduler } = setup('denied');
    const deps = { scheduler, now: () => NOW, readState: async () => state() };
    await syncNotifications(deps);
    fake.permission = 'granted';
    await syncNotifications(deps);
    expect(fake.pending.size).toBe(7);
  });

  it('S-06/B-3: onboardingDone=false -> no-op (bildirim dirilmez)', async () => {
    const { fake, scheduler } = setup();
    const r = await syncNotifications({
      scheduler,
      now: () => NOW,
      readState: async () =>
        state({ settings: { reminderEnabled: true, reminderTime: '21:00', onboardingDone: false } }),
    });
    expect(r).toEqual({ status: 'skipped' });
    // Planlama yok; yalnızca en iyi çaba temizlik (cancelAll).
    expect(fake.calls).toEqual(['cancelAll']);
    expect(fake.pending.size).toBe(0);
  });

  it('skipped dalında iptal hatası yutulur', async () => {
    const { fake, scheduler } = setup();
    fake.failCancel = true;
    const r = await syncNotifications({
      scheduler,
      now: () => NOW,
      readState: async () =>
        state({ settings: { reminderEnabled: true, reminderTime: '21:00', onboardingDone: false } }),
    });
    expect(r).toEqual({ status: 'skipped' });
  });

  describe('silme ile eşzamanlı sync yarışı', () => {
    function gatedPermission() {
      const { fake, scheduler } = setup();
      let release!: () => void;
      const gate = new Promise<void>((r) => {
        release = r;
      });
      let entered!: () => void;
      const enteredPromise = new Promise<void>((r) => {
        entered = r;
      });
      const original = scheduler.getPermission.bind(scheduler);
      scheduler.getPermission = async () => {
        entered();
        await gate;
        return original();
      };
      return { fake, scheduler, release, entered: enteredPromise };
    }

    it('sync getPermission beklerken silme kuyrukta çalışır -> bekleyen 0', async () => {
      const { fake, scheduler, release, entered } = gatedPermission();
      let s = state();
      const deps = { scheduler, now: () => NOW, readState: async () => s };
      const sync = syncNotifications(deps);
      await entered;
      const del = runExclusiveNotify(async () => {
        await scheduler.cancelAll();
        s = state({ settings: { reminderEnabled: true, reminderTime: '21:00', onboardingDone: false } });
      });
      release();
      await Promise.all([sync, del]);
      expect(fake.pending.size).toBe(0);
    });

    it('silme kuyruk DIŞINDA çalışsa bile yeniden okuma bildirimi diriltmez', async () => {
      const { fake, scheduler, release, entered } = gatedPermission();
      let s = state();
      const deps = { scheduler, now: () => NOW, readState: async () => s };
      const sync = syncNotifications(deps);
      await entered;
      await scheduler.cancelAll();
      s = state({ settings: { reminderEnabled: true, reminderTime: '21:00', onboardingDone: false } });
      release();
      await sync;
      expect(fake.pending.size).toBe(0);
    });
  });

  it('check-in sonrası yeniden plan: bugün düşer, eski bayat kalmaz', async () => {
    const { fake, scheduler } = setup();
    let s = state();
    const deps = { scheduler, now: () => NOW, readState: async () => s };
    await syncNotifications(deps);
    expect(fake.pending.has('daily-2026-09-23')).toBe(true);
    s = state({ checkins: [ci('2026-09-23')] });
    await syncNotifications(deps);
    expect(fake.pending.has('daily-2026-09-23')).toBe(false);
    expect(fake.pending.size).toBe(6);
  });

  it('kart kaydı sonrası (hasAnyPriorCard değişimi) C kalkar (H-01/B-2)', async () => {
    const { fake, scheduler } = setup();
    const three = ['2026-09-21', '2026-09-22', '2026-09-23'].map(ci);
    let s = state({ checkins: three, hasAnyPriorCard: false });
    const deps = { scheduler, now: () => NOW, readState: async () => s };
    await syncNotifications(deps);
    expect(fake.pending.has('card-2026-09-27')).toBe(true);
    s = state({ checkins: three, hasAnyPriorCard: true });
    await syncNotifications(deps);
    expect(fake.pending.has('card-2026-09-27')).toBe(false);
  });

  it('hatırlatma kapalı: günlük yok, C var (K-1)', async () => {
    const { fake, scheduler } = setup();
    const four = ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24'].map(ci);
    await syncNotifications({
      scheduler,
      now: () => NOW,
      readState: async () =>
        state({
          checkins: four,
          settings: { reminderEnabled: false, reminderTime: '21:00', onboardingDone: true },
        }),
    });
    expect(Array.from(fake.pending.keys())).toEqual(['card-2026-09-27']);
  });

  it('S-03: eşzamanlı iki sync seri, sonuç SON çağrının verisi', async () => {
    const { fake, scheduler } = setup();
    let s = state();
    const deps = {
      scheduler,
      now: () => NOW,
      readState: async () => {
        await new Promise((r) => setTimeout(r, 5));
        return s;
      },
    };
    const first = syncNotifications(deps);
    s = state({ checkins: [ci('2026-09-23')] });
    const second = syncNotifications(deps);
    await Promise.all([first, second]);
    expect(fake.pending.has('daily-2026-09-23')).toBe(false);
    expect(fake.pending.size).toBe(6);
  });

  it('hata (okuma / cancel) yutulur, çökmez', async () => {
    const { fake, scheduler } = setup();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const r1 = await syncNotifications({
      scheduler,
      now: () => NOW,
      readState: async () => {
        throw new Error('db');
      },
    });
    expect(r1).toEqual({ status: 'skipped' });
    fake.failCancel = true;
    const r2 = await syncNotifications({ scheduler, now: () => NOW, readState: async () => state() });
    expect(r2).toEqual({ status: 'skipped' });
    warn.mockRestore();
  });

  it('S-04: iptalden sonra çökme -> sonraki sync düzeltir (çift yok)', async () => {
    const { fake, scheduler } = setup();
    const deps = { scheduler, now: () => NOW, readState: async () => state() };
    await syncNotifications(deps);
    fake.pending.clear(); // yarım kalmış durum simülasyonu
    await syncNotifications(deps);
    expect(fake.pending.size).toBe(7);
  });
});

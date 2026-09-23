import { recordEvent, getAllEvents, METRIC_EVENT_NAMES } from '@/data/metric-repo';
import { getDriver } from '@/data/db';
import { setupTestDb } from '../helpers/setup-test-db';

describe('metric-repo', () => {
  setupTestDb();

  it('bir olay kaydeder ve geri okur (weekStart doluyken)', async () => {
    await recordEvent('card_opened', '2026-09-21');
    const events = await getAllEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ name: 'card_opened', weekStart: '2026-09-21' });
    expect(typeof events[0].at).toBe('number');
  });

  it('weekStart nullable: null ile de kaydedilebilir', async () => {
    await recordEvent('check_in_saved', null);
    const events = await getAllEvents();
    expect(events[0]).toMatchObject({ name: 'check_in_saved', weekStart: null });
  });

  it('METRIC_EVENT_NAMES sabit kumesindeki her isim gecerli bir olay olarak kaydedilebilir', async () => {
    for (const name of METRIC_EVENT_NAMES) {
      await recordEvent(name, null);
    }
    const events = await getAllEvents();
    expect(events.map((e) => e.name).sort()).toEqual([...METRIC_EVENT_NAMES].sort());
  });

  it('sabit kume disinda bir isim SQLite CHECK kisitina carpar (dogrudan SQL, TS bunu zaten reddeder)', () => {
    const driver = getDriver();
    expect(() =>
      driver.run('INSERT INTO metric_event (name, week_start, at) VALUES (?, ?, ?)', [
        'not_a_real_event',
        null,
        1000,
      ])
    ).toThrow();
  });

  it('icerik/deger/konum/cihaz kimligi taşımaz: satirlarda name/week_start/at disinda alan yok', async () => {
    await recordEvent('share_initiated', '2026-09-21');
    const driver = getDriver();
    const row = driver.get<Record<string, unknown>>('SELECT * FROM metric_event LIMIT 1');
    expect(row ? Object.keys(row).sort() : []).toEqual(['at', 'id', 'name', 'week_start']);
  });

  it('birden fazla olay id artan sirada dogru dondurulur', async () => {
    await recordEvent('card_unlocked', '2026-09-14');
    await recordEvent('card_opened', '2026-09-14');
    await recordEvent('line_hidden', '2026-09-14');

    const events = await getAllEvents();
    expect(events.map((e) => e.name)).toEqual(['card_unlocked', 'card_opened', 'line_hidden']);
    expect(events[0].id).toBeLessThan(events[1].id);
    expect(events[1].id).toBeLessThan(events[2].id);
  });

  it('hic olay yoksa bos dizi doner', async () => {
    expect(await getAllEvents()).toEqual([]);
  });
});

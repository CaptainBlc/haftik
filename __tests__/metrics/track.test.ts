import { getDriver, resetDriver } from '@/data/db';
import { getAllEvents, recordEvent, type MetricEventName } from '@/data/metric-repo';
import { deleteAllData } from '@/data/delete-all';
import { METRIC_EVENT_NAMES, isMetricEventName } from '@/metrics/events';
import { trackEvent, trackEventOnce, trackShareInitiated } from '@/metrics/track';
import { setupTestDb } from '../helpers/setup-test-db';

describe('sabit olay kümesi', () => {
  it('yalnızca 5 olay adı', () => {
    expect([...METRIC_EVENT_NAMES].sort()).toEqual(
      ['card_opened', 'card_unlocked', 'check_in_saved', 'line_hidden', 'share_initiated'].sort()
    );
    expect(isMetricEventName('card_opened')).toBe(true);
    expect(isMetricEventName('screen_view')).toBe(false);
    expect(isMetricEventName(42)).toBe(false);
  });
});

describe('metrik kancaları', () => {
  setupTestDb();

  it('küme dışı olay reddedilir: trackEvent false döner, hiçbir şey yazılmaz', async () => {
    const ok = await trackEvent('screen_view' as unknown as MetricEventName, null);
    expect(ok).toBe(false);
    expect(await getAllEvents()).toEqual([]);
  });

  it('repo da küme dışı adı yazmaz (tip sistemini aşan çağrı)', async () => {
    await expect(recordEvent('x' as unknown as MetricEventName, null)).rejects.toThrow();
    expect(await getAllEvents()).toEqual([]);
  });

  it('yazılan satır yalnızca ad + hafta + zaman taşır (içerik/kimlik sütunu yok)', async () => {
    await trackEvent('check_in_saved');
    const cols = getDriver()
      .all<{ name: string }>("SELECT name FROM pragma_table_info('metric_event')")
      .map((c) => c.name)
      .sort();
    expect(cols).toEqual(['at', 'id', 'name', 'week_start']);
  });

  it('trackEventOnce hafta başına tek kayıt yazar; farklı hafta ayrı sayılır', async () => {
    expect(await trackEventOnce('card_unlocked', '2026-09-14')).toBe(true);
    expect(await trackEventOnce('card_unlocked', '2026-09-14')).toBe(false);
    expect(await trackEventOnce('card_unlocked', '2026-09-21')).toBe(true);
    const events = await getAllEvents();
    expect(events.map((e) => [e.name, e.weekStart])).toEqual([
      ['card_unlocked', '2026-09-14'],
      ['card_unlocked', '2026-09-21'],
    ]);
  });

  it('trackShareInitiated: 1 share_initiated + gizli satır sayısı kadar line_hidden, kategori yok', async () => {
    await trackShareInitiated('2026-09-14', 2);
    const events = await getAllEvents();
    expect(events.map((e) => e.name)).toEqual(['share_initiated', 'line_hidden', 'line_hidden']);
    expect(JSON.stringify(events)).not.toMatch(/movement|sleep|spending|social/);
  });

  it('trackShareInitiated: 0 gizli satırda yalnızca share_initiated', async () => {
    await trackShareInitiated(null, 0);
    expect((await getAllEvents()).map((e) => e.name)).toEqual(['share_initiated']);
  });
});

describe('kanca hatasında akış bozulmaz', () => {
  it('sürücü yokken (DB hatası) trackEvent/trackEventOnce/trackShareInitiated fırlatmaz', async () => {
    resetDriver();
    await expect(trackEvent('check_in_saved')).resolves.toBe(false);
    await expect(trackEventOnce('card_unlocked', '2026-09-14')).resolves.toBe(false);
    await expect(trackShareInitiated('2026-09-14', 2)).resolves.toBeUndefined();
  });
});

describe('silme', () => {
  setupTestDb();

  it('"Tüm verilerimi sil" sonrası metric_event tablosu boş', async () => {
    await trackEvent('check_in_saved');
    await trackEvent('card_opened', '2026-09-14');
    await trackShareInitiated('2026-09-14', 2);
    expect((await getAllEvents()).length).toBeGreaterThan(0);

    await deleteAllData(() => {});

    const row = getDriver().get<{ c: number }>('SELECT COUNT(*) AS c FROM metric_event');
    expect(row?.c).toBe(0);
    expect(await getAllEvents()).toEqual([]);
  });
});

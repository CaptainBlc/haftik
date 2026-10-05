/**
 * Rapor v2 sayaçları (`metric_counter`, v3): `trackCounter` kapalı sözlük doğrulaması ve
 * `trackShareInitiated`'ın sayaç yazımı. Gerçek bellek içi SQLite (`setupTestDb`).
 */
import { getAllCounters } from '@/data/metric-counter-repo';
import { resetDriver } from '@/data/db';
import { getAllEvents } from '@/data/metric-repo';
import { COUNTER_DIMS, isCounterEvent } from '@/metrics/events';
import { trackCounter, trackShareInitiated } from '@/metrics/track';
import { setupTestDb } from '../helpers/setup-test-db';

describe('COUNTER_DIMS (kapalı sözlük)', () => {
  it('yalnızca üç sayaç ve sabit boyutlar', () => {
    expect(Object.keys(COUNTER_DIMS).sort()).toEqual(['notif_opened', 'share_default_kept', 'share_hidden_n']);
    expect(COUNTER_DIMS.share_hidden_n).toEqual(['0', '1', '2', '3', '4']);
    expect(COUNTER_DIMS.share_default_kept).toEqual(['y', 'n']);
    expect(COUNTER_DIMS.notif_opened).toEqual(['card_ready', 'daily']);
  });

  it('isCounterEvent: ad ve boyut birlikte geçerli olmalı; prototip anahtarları reddedilir', () => {
    expect(isCounterEvent('notif_opened', 'daily')).toBe(true);
    expect(isCounterEvent('notif_opened', 'card-ready')).toBe(false); // tire değil alt çizgi
    expect(isCounterEvent('share_hidden_n', '5')).toBe(false);
    expect(isCounterEvent('baska', 'y')).toBe(false);
    expect(isCounterEvent('constructor', 'y')).toBe(false);
    expect(isCounterEvent('toString', 'y')).toBe(false);
    expect(isCounterEvent(1, 'y')).toBe(false);
  });
});

describe('trackCounter', () => {
  setupTestDb();

  it('geçerli ad+boyut: sayacı artırır (tekrarlı çağrı UPSERT)', async () => {
    expect(await trackCounter('notif_opened', { dim: 'daily' })).toBe(true);
    expect(await trackCounter('notif_opened', { dim: 'daily' })).toBe(true);
    expect(await trackCounter('notif_opened', { dim: 'card_ready' })).toBe(true);
    const rows = await getAllCounters();
    expect(rows.map((r) => [r.name, r.dim, r.n])).toEqual([
      ['notif_opened', 'card_ready', 1],
      ['notif_opened', 'daily', 2],
    ]);
  });

  it('küme dışı ad ya da boyut reddedilir, hiçbir şey yazılmaz', async () => {
    expect(await trackCounter('screen_view' as never, { dim: 'x' })).toBe(false);
    expect(await trackCounter('notif_opened', { dim: 'weekly' })).toBe(false);
    expect(await trackCounter('share_hidden_n', { dim: '9' })).toBe(false);
    expect(await getAllCounters()).toEqual([]);
  });

  it('sürücü yokken fırlatmaz, false döner', async () => {
    resetDriver();
    await expect(trackCounter('notif_opened', { dim: 'daily' })).resolves.toBe(false);
  });
});

describe('trackShareInitiated: sayaçlar', () => {
  setupTestDb();

  it('her paylaşım için share_hidden_n tam bir kez artar (dim = gizli satır sayısı), line_hidden eskisi gibi', async () => {
    await trackShareInitiated('2026-09-14', 2, true);
    await trackShareInitiated('2026-09-14', 0, false);
    await trackShareInitiated('2026-09-21', 4, false);
    const counters = await getAllCounters();
    const hidden = counters.filter((c) => c.name === 'share_hidden_n').map((c) => [c.weekStart, c.dim, c.n]);
    expect(hidden).toEqual([
      ['2026-09-14', '0', 1],
      ['2026-09-14', '2', 1],
      ['2026-09-21', '4', 1],
    ]);
    // Toplam = paylaşım sayısı (rapor bütünlük kuralı 1).
    expect(counters.filter((c) => c.name === 'share_hidden_n').reduce((s, c) => s + c.n, 0)).toBe(3);
    const events = await getAllEvents();
    expect(events.filter((e) => e.name === 'share_initiated')).toHaveLength(3);
    expect(events.filter((e) => e.name === 'line_hidden')).toHaveLength(6);
  });

  it('defaultKept verilirse share_default_kept y/n yazılır; verilmezse yazılmaz', async () => {
    await trackShareInitiated(null, 2, true);
    await trackShareInitiated(null, 1, false);
    await trackShareInitiated(null, 1); // eski çağrı biçimi
    const kept = (await getAllCounters()).filter((c) => c.name === 'share_default_kept').map((c) => [c.dim, c.n]);
    expect(kept).toEqual([
      ['n', 1],
      ['y', 1],
    ]);
  });

  it('gizli sayı 4 ile sınırlanır (4+ ve negatif/NaN güvenli)', async () => {
    await trackShareInitiated(null, 9);
    await trackShareInitiated(null, -3);
    await trackShareInitiated(null, Number.NaN);
    const hidden = (await getAllCounters()).filter((c) => c.name === 'share_hidden_n').map((c) => [c.dim, c.n]);
    expect(hidden).toEqual([
      ['0', 2],
      ['4', 1],
    ]);
  });

  it('sayaç satırı yalnız ad/hafta/boyut/sürüm/n taşır; içerik, kategori ve kimlik sütunu yok', async () => {
    await trackShareInitiated('2026-09-14', 2, true);
    const row = (await getAllCounters())[0];
    expect(Object.keys(row).sort()).toEqual(['build', 'dim', 'n', 'name', 'weekStart']);
  });
});

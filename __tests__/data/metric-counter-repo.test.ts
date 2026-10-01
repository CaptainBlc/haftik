/**
 * `metric_counter` repo testleri (v3 migration, A10 kararı). Henüz hiçbir
 * akışa bağlanmadı — bu testler yalnızca şema/okuma-yazma sözleşmesini
 * doğrular (bkz. `src/data/metric-counter-repo.ts` dosya başı notu).
 */
import { incrementCounter, getCounter, getAllCounters } from '@/data/metric-counter-repo';
import { setupTestDb } from '../helpers/setup-test-db';

describe('metric-counter-repo', () => {
  setupTestDb();

  it('kayıt yokken getCounter 0 döner', async () => {
    expect(await getCounter({ name: 'test_event' })).toBe(0);
  });

  it('incrementCounter önce 1 ile oluşturur, sonraki çağrılarda artırır (UPSERT)', async () => {
    await incrementCounter({ name: 'test_event', weekStart: '2026-10-01' });
    expect(await getCounter({ name: 'test_event', weekStart: '2026-10-01' })).toBe(1);

    await incrementCounter({ name: 'test_event', weekStart: '2026-10-01' });
    await incrementCounter({ name: 'test_event', weekStart: '2026-10-01' });
    expect(await getCounter({ name: 'test_event', weekStart: '2026-10-01' })).toBe(3);
  });

  it('farklı weekStart/dim/build anahtarları ayrı sayaçlardır', async () => {
    await incrementCounter({ name: 'share_initiated', weekStart: '2026-10-01', dim: 'p916' });
    await incrementCounter({ name: 'share_initiated', weekStart: '2026-10-01', dim: 'sq11' });
    await incrementCounter({ name: 'share_initiated', weekStart: '2026-10-08', dim: 'p916' });

    expect(
      await getCounter({ name: 'share_initiated', weekStart: '2026-10-01', dim: 'p916' })
    ).toBe(1);
    expect(
      await getCounter({ name: 'share_initiated', weekStart: '2026-10-01', dim: 'sq11' })
    ).toBe(1);
    expect(
      await getCounter({ name: 'share_initiated', weekStart: '2026-10-08', dim: 'p916' })
    ).toBe(1);
  });

  it('weekStart/dim/build verilmezse sentinel (boş dize) kullanılır, NULL değil', async () => {
    await incrementCounter({ name: 'global_event' });
    const all = await getAllCounters();
    const row = all.find((c) => c.name === 'global_event');
    expect(row).toEqual({ name: 'global_event', weekStart: '', dim: '', build: '', n: 1 });
  });

  it('getAllCounters tüm sayaçları ad/anahtar sırasıyla döner', async () => {
    await incrementCounter({ name: 'b_event' });
    await incrementCounter({ name: 'a_event' });
    const all = await getAllCounters();
    expect(all.map((c) => c.name)).toEqual(['a_event', 'b_event']);
  });
});

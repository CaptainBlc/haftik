import { saveCheckin, getCheckins, getAllCheckins } from '@/data/checkin-repo';
import { getDriver } from '@/data/db';
import { setupTestDb } from '../helpers/setup-test-db';

describe('checkin-repo', () => {
  setupTestDb();

  it('bir check-in kaydeder ve geri okur', async () => {
    await saveCheckin({ localDate: '2026-09-21', movement: 2, sleep: 3, spending: 1, social: 2 });

    const rows = await getCheckins('2026-09-21', '2026-09-21');
    expect(rows).toEqual([
      { localDate: '2026-09-21', movement: 2, sleep: 3, spending: 1, social: 2 },
    ]);
  });

  it('ayni local_date icin ikinci saveCheckin UPSERT yapar (PRIMARY KEY tekilligi korunur)', async () => {
    await saveCheckin({ localDate: '2026-09-21', movement: 1, sleep: 1, spending: 1, social: 1 });
    await saveCheckin({ localDate: '2026-09-21', movement: 3, sleep: 3, spending: 3, social: 3 });

    const rows = await getCheckins('2026-09-21', '2026-09-21');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      localDate: '2026-09-21',
      movement: 3,
      sleep: 3,
      spending: 3,
      social: 3,
    });
  });

  it('upsert sirasinda created_at korunur, updated_at guncellenir (repo dogrudan Date.now kullanir)', async () => {
    await saveCheckin({ localDate: '2026-09-21', movement: 1, sleep: 1, spending: 1, social: 1 });
    const driver = getDriver();
    const firstRow = driver.get<{ created_at: number; updated_at: number }>(
      'SELECT created_at, updated_at FROM checkin WHERE local_date = ?',
      ['2026-09-21']
    );

    // updated_at kesinlikle ilerlesin diye bir sonraki cagriyi biraz geciktir.
    await new Promise((resolve) => setTimeout(resolve, 5));
    await saveCheckin({ localDate: '2026-09-21', movement: 2, sleep: 2, spending: 2, social: 2 });
    const secondRow = driver.get<{ created_at: number; updated_at: number }>(
      'SELECT created_at, updated_at FROM checkin WHERE local_date = ?',
      ['2026-09-21']
    );

    expect(secondRow?.created_at).toBe(firstRow?.created_at);
    expect(secondRow!.updated_at).toBeGreaterThanOrEqual(firstRow!.updated_at);
  });

  it('CHECK 1..3 kisiti SQLite seviyesinde uygulanir: gecersiz bir deger reddedilir', async () => {
    const driver = getDriver();
    expect(() =>
      driver.run(
        'INSERT INTO checkin (local_date, movement, sleep, spending, social, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['2026-09-21', 4, 1, 1, 1, 1000, 1000]
      )
    ).toThrow();
    expect(() =>
      driver.run(
        'INSERT INTO checkin (local_date, movement, sleep, spending, social, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['2026-09-22', 0, 1, 1, 1, 1000, 1000]
      )
    ).toThrow();
  });

  it("bugun/dun disinda, 2+ gun onceki bir local_date'i de POZITIF olarak kabul eder (duzenleme penceresi repo'da UYGULANMAZ, spec S5 netlestirme #1)", async () => {
    await saveCheckin({ localDate: '2020-01-01', movement: 1, sleep: 1, spending: 1, social: 1 });
    const rows = await getCheckins('2020-01-01', '2020-01-01');
    expect(rows).toEqual([
      { localDate: '2020-01-01', movement: 1, sleep: 1, spending: 1, social: 1 },
    ]);
  });

  it('getCheckins hafta/ay/yil sinirlarinda dogru araligi doner (yil sonu -> yil basi)', async () => {
    await saveCheckin({ localDate: '2025-12-30', movement: 1, sleep: 1, spending: 1, social: 1 });
    await saveCheckin({ localDate: '2025-12-31', movement: 2, sleep: 2, spending: 2, social: 2 });
    await saveCheckin({ localDate: '2026-01-01', movement: 3, sleep: 3, spending: 3, social: 3 });
    await saveCheckin({ localDate: '2026-01-02', movement: 1, sleep: 2, spending: 3, social: 1 });

    const rows = await getCheckins('2025-12-31', '2026-01-01');
    expect(rows.map((r) => r.localDate)).toEqual(['2025-12-31', '2026-01-01']);
  });

  it('getCheckins ay sonu -> ay basi sinirinda dogru araligi doner', async () => {
    await saveCheckin({ localDate: '2026-01-31', movement: 1, sleep: 1, spending: 1, social: 1 });
    await saveCheckin({ localDate: '2026-02-01', movement: 2, sleep: 2, spending: 2, social: 2 });
    await saveCheckin({ localDate: '2026-02-02', movement: 3, sleep: 3, spending: 3, social: 3 });

    const rows = await getCheckins('2026-01-31', '2026-02-01');
    expect(rows.map((r) => r.localDate)).toEqual(['2026-01-31', '2026-02-01']);
  });

  it('getCheckins aralik disindaki kayitlari haric tutar', async () => {
    await saveCheckin({ localDate: '2026-09-13', movement: 1, sleep: 1, spending: 1, social: 1 });
    await saveCheckin({ localDate: '2026-09-20', movement: 2, sleep: 2, spending: 2, social: 2 });
    await saveCheckin({ localDate: '2026-09-21', movement: 3, sleep: 3, spending: 3, social: 3 });
    await saveCheckin({ localDate: '2026-09-28', movement: 1, sleep: 1, spending: 1, social: 1 });

    const rows = await getCheckins('2026-09-14', '2026-09-27');
    expect(rows.map((r) => r.localDate)).toEqual(['2026-09-20', '2026-09-21']);
  });

  it('hic kayit yoksa bos dizi doner', async () => {
    const rows = await getCheckins('2026-09-01', '2026-09-30');
    expect(rows).toEqual([]);
  });

  it('getAllCheckins tarih sinirlamasi olmadan TUM gecmisi artan sirada doner (T2)', async () => {
    await saveCheckin({ localDate: '2026-09-23', movement: 1, sleep: 1, spending: 1, social: 1 });
    await saveCheckin({ localDate: '2020-01-01', movement: 2, sleep: 2, spending: 2, social: 2 });
    await saveCheckin({ localDate: '2026-01-01', movement: 3, sleep: 3, spending: 3, social: 3 });

    const rows = await getAllCheckins();
    expect(rows.map((r) => r.localDate)).toEqual(['2020-01-01', '2026-01-01', '2026-09-23']);
  });

  it('getAllCheckins hic kayit yoksa bos dizi doner', async () => {
    expect(await getAllCheckins()).toEqual([]);
  });
});

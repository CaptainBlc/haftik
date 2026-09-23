/**
 * Migration mekanizmasi testleri (spec S5 netlestirme #4, `plan.md` S5
 * "Bitti kaniti": "migration v1'den v2'ye ornek"). Bu dosya `db.ts`'in
 * `setDriver`'ini `skipMigrations: true` ile kullanir -- adim adim, elle
 * `runMigrations` cagirarak surum gecislerini gozlemleyebilmek icin.
 */
import { setDriver, resetDriver, getDriver } from '@/data/db';
import { runMigrations, MIGRATIONS, LATEST_SCHEMA_VERSION } from '@/data/migrations';
import { createNodeSqliteDriver } from '../helpers/node-sqlite-driver';

describe('migrations', () => {
  afterEach(() => {
    resetDriver();
  });

  it('sifirdan kurulumda tum tablolari olusturur ve user_version LATEST_SCHEMA_VERSION olur', () => {
    setDriver(createNodeSqliteDriver(), { skipMigrations: true });
    const driver = getDriver();

    expect(driver.getUserVersion()).toBe(0);
    runMigrations(driver);
    expect(driver.getUserVersion()).toBe(LATEST_SCHEMA_VERSION);

    // `sqlite_sequence` SQLite'in kendi ic tablosu (metric_event.id icin
    // AUTOINCREMENT kullanildiginda otomatik olusur); bizim semamizin
    // parcasi degildir, bu yuzden disaridak birakilir (`sqlite_%` deseni).
    const tableNames = driver
      .all<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
      )
      .map((row) => row.name)
      .sort();
    expect(tableNames).toEqual(['checkin', 'metric_event', 'setting', 'weekly_card']);
  });

  it('MIGRATIONS en az v1 ve bir v2 placeholder icerir, surumler artan ve ardisik', () => {
    expect(MIGRATIONS.length).toBeGreaterThanOrEqual(2);
    const versions = MIGRATIONS.map((m) => m.version);
    expect(versions).toEqual([...versions].sort((a, b) => a - b));
    // Ardisik: [1, 2, ...] bosluksuz.
    versions.forEach((v, i) => expect(v).toBe(i + 1));
  });

  it('runMigrations idempotenttir: ikinci cagri hata firlatmaz ve user_version degismez', () => {
    setDriver(createNodeSqliteDriver(), { skipMigrations: true });
    const driver = getDriver();

    runMigrations(driver);
    const versionAfterFirst = driver.getUserVersion();

    expect(() => runMigrations(driver)).not.toThrow();
    expect(driver.getUserVersion()).toBe(versionAfterFirst);
  });

  it('v1 -> v2 gecisi var olan veriyi korur (mevcut satirlar bozulmaz)', () => {
    setDriver(createNodeSqliteDriver(), { skipMigrations: true });
    const driver = getDriver();

    // Yalnizca v1'i uygula.
    const migrationV1 = MIGRATIONS.find((m) => m.version === 1);
    if (!migrationV1) {
      throw new Error('v1 migration bulunamadi (test kurulum hatasi).');
    }
    migrationV1.up(driver);
    driver.setUserVersion(1);

    driver.run(
      'INSERT INTO checkin (local_date, movement, sleep, spending, social, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['2026-09-21', 2, 2, 2, 2, 1000, 1000]
    );

    // Simdi kalan migration'lari (v2 dahil) calistir.
    runMigrations(driver);

    expect(driver.getUserVersion()).toBe(LATEST_SCHEMA_VERSION);
    const row = driver.get<{ local_date: string; movement: number }>(
      'SELECT local_date, movement FROM checkin WHERE local_date = ?',
      ['2026-09-21']
    );
    expect(row).toEqual({ local_date: '2026-09-21', movement: 2 });
  });

  it('placeholder v2 sutunu zararsizdir: v1 satirlarinda NULL olarak gelir, hicbir CHECK kisitini bozmaz', () => {
    setDriver(createNodeSqliteDriver());
    const driver = getDriver();

    driver.run('INSERT INTO setting (key, value) VALUES (?, ?)', ['onboarding_done', 'false']);
    const row = driver.get<{ _v2_mechanism_proof_placeholder: string | null }>(
      'SELECT _v2_mechanism_proof_placeholder FROM setting WHERE key = ?',
      ['onboarding_done']
    );
    expect(row?._v2_mechanism_proof_placeholder ?? null).toBeNull();
  });
});

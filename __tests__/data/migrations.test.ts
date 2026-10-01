/**
 * Migration mekanizmasi testleri (spec S5 netlestirme #4, `plan.md` S5
 * "Bitti kaniti": "migration v1'den v2'ye ornek"). Bu dosya `db.ts`'in
 * `setDriver`'ini `skipMigrations: true` ile kullanir -- adim adim, elle
 * `runMigrations` cagirarak surum gecislerini gozlemleyebilmek icin.
 */
import { setDriver, resetDriver, getDriver } from '@/data/db';
import {
  runMigrations,
  applyMigrations,
  MIGRATIONS,
  LATEST_SCHEMA_VERSION,
  type Migration,
} from '@/data/migrations';
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
    // (2026-10-01, A10 karari) v3 `metric_counter`i ekledi; tablo listesi
    // buna gore guncellendi -- bu sessiz bir test gevsetmesi degil, onayli
    // sema degisikliginin dogrudan sonucu (bkz. docs/kararlar/2026-10-01-
    // taban-oncesi-kararlar-b.md A10).
    expect(tableNames).toEqual([
      'checkin',
      'metric_counter',
      'metric_event',
      'setting',
      'weekly_card',
    ]);
  });

  it('MIGRATIONS en az v1, v2 placeholder ve v3 metric_counter icerir, surumler artan ve ardisik', () => {
    expect(MIGRATIONS.length).toBeGreaterThanOrEqual(3);
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

  it('v2 fikstüründen v3e yükseltme: checkin verisi korunur, metric_counter boş olarak eklenir (A10)', () => {
    setDriver(createNodeSqliteDriver(), { skipMigrations: true });
    const driver = getDriver();

    // Yalnızca v1+v2'yi uygula (2026-10-01 öncesi gerçek bir cihazın durumu).
    applyMigrations(
      driver,
      MIGRATIONS.filter((m) => m.version <= 2)
    );
    expect(driver.getUserVersion()).toBe(2);

    driver.run(
      'INSERT INTO checkin (local_date, movement, sleep, spending, social, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['2026-10-01', 3, 2, 1, 2, 2000, 2000]
    );

    // Şimdi gerçek MIGRATIONS ile v3'e tamamla.
    runMigrations(driver);

    expect(driver.getUserVersion()).toBe(LATEST_SCHEMA_VERSION);
    const checkinRow = driver.get<{ local_date: string }>(
      'SELECT local_date FROM checkin WHERE local_date = ?',
      ['2026-10-01']
    );
    expect(checkinRow).toEqual({ local_date: '2026-10-01' });

    const counterCount = driver.get<{ c: number }>('SELECT COUNT(*) AS c FROM metric_counter');
    expect(counterCount?.c).toBe(0);

    // Tablo gerçekten yazılabilir mi (şema sözleşmesi, round-trip).
    driver.run(
      'INSERT INTO metric_counter (name, week_start, dim, build, n) VALUES (?, ?, ?, ?, ?)',
      ['test_event', '2026-10-01', '', '', 1]
    );
    const written = driver.get<{ n: number }>(
      "SELECT n FROM metric_counter WHERE name = 'test_event'"
    );
    expect(written?.n).toBe(1);
  });

  describe('T7: atomiklik (kesinti simülasyonu)', () => {
    it('migration ortasında hata fırlarsa şema da user_version da öncesine döner (ROLLBACK)', () => {
      setDriver(createNodeSqliteDriver(), { skipMigrations: true });
      const driver = getDriver();

      // v1+v2+v3'ü gerçek listeyle kur (başlangıç durumu: LATEST_SCHEMA_VERSION).
      runMigrations(driver);
      const versionBeforeBreak = driver.getUserVersion();
      expect(versionBeforeBreak).toBe(LATEST_SCHEMA_VERSION);

      // Kasıtlı bozuk bir "sonraki" migration: önce zararsız bir tablo
      // yaratır (bu kısmın kalıp kalmadığını test ediyoruz), SONRA fırlatır.
      // Gerçek `MIGRATIONS`e asla eklenmez -- yalnızca bu test içinde.
      const brokenMigration: Migration = {
        version: versionBeforeBreak + 1,
        description: 'test: kasıtlı kesinti',
        up: (d) => {
          d.exec('CREATE TABLE _interrupted_proof (id INTEGER PRIMARY KEY);');
          throw new Error('kasıtlı kesinti (test)');
        },
      };

      expect(() => applyMigrations(driver, [...MIGRATIONS, brokenMigration])).toThrow(
        'kasıtlı kesinti'
      );

      // user_version İLERLEMEDİ.
      expect(driver.getUserVersion()).toBe(versionBeforeBreak);
      // Yarım kalan CREATE TABLE de ROLLBACK ile geri alındı -- kalıcı değil.
      const leftover = driver.get<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='_interrupted_proof'"
      );
      expect(leftover).toBeUndefined();
    });

    it('kesintiden sonra düzeltilmiş aynı sürüm numarasıyla yeniden denemek başarıyla tamamlanır', () => {
      setDriver(createNodeSqliteDriver(), { skipMigrations: true });
      const driver = getDriver();
      runMigrations(driver);
      const base = driver.getUserVersion();

      const broken: Migration = {
        version: base + 1,
        description: 'test: ilk deneme başarısız',
        up: () => {
          throw new Error('ilk deneme başarısız (test)');
        },
      };
      expect(() => applyMigrations(driver, [...MIGRATIONS, broken])).toThrow();
      expect(driver.getUserVersion()).toBe(base);

      // "Bir sonraki açılış": aynı sürüm numarasıyla, bu kez başarılı bir
      // migration -- uygulama kullanıcıya "Tekrar dene" verdiğinde beklenen
      // davranış budur (bkz. src/app/_layout.tsx ErrorBoundary).
      const fixed: Migration = {
        version: base + 1,
        description: 'test: düzeltilmiş',
        up: (d) => {
          d.exec('CREATE TABLE _fixed_proof (id INTEGER PRIMARY KEY);');
        },
      };
      expect(() => applyMigrations(driver, [...MIGRATIONS, fixed])).not.toThrow();
      expect(driver.getUserVersion()).toBe(base + 1);
      const row = driver.get<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='_fixed_proof'"
      );
      expect(row?.name).toBe('_fixed_proof');
    });
  });
});

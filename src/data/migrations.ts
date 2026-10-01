/**
 * Numarali migration dizisi ve `PRAGMA user_version` takibi (spec "Veri
 * modeli", S5 netlestirme #4, `plan.md` S5). `db.ts`'ten `SqlDriver`
 * TIPINI alir (type-only import, derlemede silinir) -- bu yuzden `db.ts` bu
 * dosyayi calisma zamaninda import etse de gercek bir dongu olusmaz.
 *
 * **Sema notu (S5 sapmasi, dokumante edilmis):** `weekly_card` tablosu,
 * spec'in tablo listesindeki sutunlara ek olarak `title_based_on_categories`
 * ve `summary_id` sutunlarini icerir. Spec'in tablosu yalnizca
 * `title_id`/`title_text` ve `summary_text` sayar; ama `src/domain/types.ts`
 * (S2/S3'te donmus) `TitleResult.basedOnCategories: Category[]` ve
 * `LineResult.id` (summary da bir `LineResult`) alanlarini zaten tasiyor --
 * `getCard`'in `CardSnapshot`'i eksiksiz geri vermesi icin bu iki sutun
 * olmadan round-trip imkansiz olurdu. Bu bir ozellik degisikligi degil,
 * zaten kilitli domain sozlesmesini karsilamak icin gereken bir tamamlama.
 */
import type { SqlDriver } from './db';

export interface Migration {
  version: number;
  description: string;
  up: (driver: SqlDriver) => void;
}

/**
 * v1 -- ilk sema (spec "Veri modeli"): `checkin`, `weekly_card`, `setting`,
 * `metric_event`. CHECK kisitlari spec'te acikca istenenlerle birebir
 * (1..3 kategori degerleri, delta -1/0/1/NULL, metric_event.name sabit
 * kume) -- bkz. S5 netlestirme #3.
 */
const migrationV1: Migration = {
  version: 1,
  description: 'Ilk sema: checkin, weekly_card, setting, metric_event.',
  up: (driver) => {
    driver.exec(`
      CREATE TABLE checkin (
        local_date TEXT PRIMARY KEY,
        movement   INTEGER NOT NULL CHECK (movement BETWEEN 1 AND 3),
        sleep      INTEGER NOT NULL CHECK (sleep BETWEEN 1 AND 3),
        spending   INTEGER NOT NULL CHECK (spending BETWEEN 1 AND 3),
        social     INTEGER NOT NULL CHECK (social BETWEEN 1 AND 3),
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    driver.exec(`
      CREATE TABLE weekly_card (
        week_start                  TEXT PRIMARY KEY,
        generated_at                INTEGER NOT NULL,
        checkin_days                INTEGER NOT NULL,
        title_id                    TEXT NOT NULL,
        title_text                  TEXT NOT NULL,
        title_based_on_categories   TEXT NOT NULL,
        line_movement_id            TEXT NOT NULL,
        line_movement_text          TEXT NOT NULL,
        line_sleep_id               TEXT NOT NULL,
        line_sleep_text             TEXT NOT NULL,
        line_spending_id            TEXT NOT NULL,
        line_spending_text          TEXT NOT NULL,
        line_social_id              TEXT NOT NULL,
        line_social_text            TEXT NOT NULL,
        delta_movement               INTEGER CHECK (delta_movement IN (-1, 0, 1) OR delta_movement IS NULL),
        delta_sleep                  INTEGER CHECK (delta_sleep IN (-1, 0, 1) OR delta_sleep IS NULL),
        delta_spending                INTEGER CHECK (delta_spending IN (-1, 0, 1) OR delta_spending IS NULL),
        delta_social                  INTEGER CHECK (delta_social IN (-1, 0, 1) OR delta_social IS NULL),
        summary_id                   TEXT NOT NULL,
        summary_text                 TEXT NOT NULL,
        content_version              INTEGER NOT NULL
      );
    `);

    driver.exec(`
      CREATE TABLE setting (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    driver.exec(`
      CREATE TABLE metric_event (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL CHECK (
          name IN ('card_unlocked', 'card_opened', 'share_initiated', 'line_hidden', 'check_in_saved')
        ),
        week_start TEXT,
        at         INTEGER NOT NULL
      );
    `);
  },
};

/**
 * v2 -- PLACEHOLDER migration (spec S5 netlestirme #4): henuz gercek bir v2
 * ozelligi yok. Bu migration yalnizca mekanizmayi (numarali migration
 * dizisi, `PRAGMA user_version` takibi, var olan veriyi koruma) kanitlamak
 * icindir -- zararsiz, kullanilmayan, nullable bir sutun ekler. Gercek bir
 * urun ozelligi DEGILDIR; bir sonraki gercek migration bu deseni izler ve bu
 * placeholder sutunu kullanmaz.
 */
const migrationV2Placeholder: Migration = {
  version: 2,
  description:
    'PLACEHOLDER -- mekanizma kaniti, gercek ozellik degil (spec S5 netlestirme #4). ' +
    'Zararsiz, kullanilmayan nullable sutun.',
  up: (driver) => {
    driver.exec(`ALTER TABLE setting ADD COLUMN _v2_mechanism_proof_placeholder TEXT;`);
  },
};

/**
 * v3 -- `metric_counter` tablosu (A10 kararı, `docs/kararlar/2026-10-01-
 * taban-oncesi-kararlar-b.md`): `metric_event`in `name` sütunundaki CHECK
 * kısıtı yeni bir olay adı eklemeyi (tüm tabloyu yeniden kurmadan)
 * imkânsız kılıyordu. Çözüm EKLEME biçimindedir: yeni bir tablo, CHECK
 * kısıtı yok (ad kümesi TS tipiyle korunur, bkz. `metric-counter-repo.ts`),
 * `n` sütunu UPSERT ile artan bir sayaç. **Eski `metric_event` tablosu
 * SİLİNMEZ** (silme kapsamında kalmaya devam eder, `delete-all.ts`), yalnızca
 * yeni olaylar bu tabloya yazılır; mevcut 5 olay (`track.ts`) bu migration'da
 * taşınmaz -- hangi yeni özellik hangi sayacı kullanacaksa o dilimde eklenir
 * (bkz. `docs/muhendislik/veri-ve-migration.md`).
 *
 * `week_start`/`dim`/`build` bilerek NULLABLE DEĞİL (`NOT NULL DEFAULT ''`):
 * SQLite'ta birleşik (composite) PRIMARY KEY sütunları otomatik NOT NULL
 * olmaz -- NULL'lü bir sütun PK'ye girerse aynı (name, NULL, dim, build)
 * kombinasyonundan birden fazla satır sessizce eklenebilir (NULL != NULL
 * karşılaştırması PK'nin tekillik denetimini atlar), UPSERT'in güvendiği
 * tekillik kırılır. Boş dize "hafta/boyut/sürüm yok" sentinel'idir.
 */
const migrationV3MetricCounter: Migration = {
  version: 3,
  description:
    "metric_counter tablosu eklendi (A10): CHECK kisitsiz, ekleme bicimli olcum semasi. " +
    'metric_event SILINMEDI, yalnizca yeni yazim bu tabloya gider.',
  up: (driver) => {
    driver.exec(`
      CREATE TABLE metric_counter (
        name       TEXT NOT NULL,
        week_start TEXT NOT NULL DEFAULT '',
        dim        TEXT NOT NULL DEFAULT '',
        build      TEXT NOT NULL DEFAULT '',
        n          INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (name, week_start, dim, build)
      );
    `);
  },
};

/** Surum sirasina gore migration listesi (artan). */
export const MIGRATIONS: readonly Migration[] = [
  migrationV1,
  migrationV2Placeholder,
  migrationV3MetricCounter,
];

/** Su an tanimli en yuksek sema surumu. */
export const LATEST_SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

/**
 * `driver`'in `PRAGMA user_version`'ini okur, henuz uygulanmamis (surum >
 * mevcut) tum migration'lari surum sirasiyla uygular. Idempotenttir: zaten
 * en son surumdeyse hicbir sey yapmaz.
 *
 * **T7 -- atomiklik (2026-10-01):** her migration kendi `BEGIN;`/`COMMIT;`
 * islemi icinde calisir; `migration.up(driver)` VE ardindan gelen
 * `setUserVersion` AYNI islemin parcasidir. Kesinti (hata, crash, cihaz
 * kapanmasi) migration bitmeden olursa `ROLLBACK` ile hem sema hem
 * `user_version` migration ONCESI durumuna doner -- yarim kalmis bir
 * `CREATE TABLE`/`ALTER TABLE` asla kalici olmaz, bir sonraki acilista
 * migration BASTAN (ayni surumden) yeniden calisir. (SQLite'ta DDL
 * islemler icinde geri alinabilir, bu yuzden bu desen guvenlidir.)
 *
 * Gercek `MIGRATIONS` listesiyle calisir; test edilebilirlik icin asil is
 * parametre alan `applyMigrations`'a devredilir (bkz.
 * `__tests__/data/migrations.test.ts` "kesinti simulasyonu": testler
 * `MIGRATIONS`i degistirmeden, kendi (gercek + bozuk) listesini verebilir).
 */
export function runMigrations(driver: SqlDriver): void {
  applyMigrations(driver, MIGRATIONS);
}

/**
 * `runMigrations`in gercek calisma mantigi; `migrations` disaridan verilir
 * (production'da hep `MIGRATIONS`, testte kesinti/yukseltme senaryolari icin
 * ozel listeler). Ayrintili davranis: yukaridaki `runMigrations` yorumu.
 */
export function applyMigrations(driver: SqlDriver, migrations: readonly Migration[]): void {
  const currentVersion = driver.getUserVersion();
  const pending = migrations
    .filter((m) => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    driver.exec('BEGIN;');
    try {
      migration.up(driver);
      driver.setUserVersion(migration.version);
    } catch (error) {
      try {
        driver.exec('ROLLBACK;');
      } catch {
        // Acik transaction yoksa (ornegin hata BEGIN'den once olustuysa)
        // ROLLBACK kendisi hata verebilir; bu durumda yutulur, asil hata
        // asagida yeniden firlatilir.
      }
      throw error;
    }
    driver.exec('COMMIT;');
  }
}

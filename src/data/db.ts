/**
 * Veri katmani -- baglanti yonetimi ve `PRAGMA user_version` erisimi (spec
 * "Veri modeli", `plan.md` S5). Gercek surucu `expo-sqlite`'tir; repo
 * dosyalari (`checkin-repo.ts`, `card-repo.ts`, ...) bu dosyaya degil, ince
 * bir `SqlDriver` arayuzune bagimlidir -- bu da testlerin gercek bir SQLite
 * motoruna (bellek-ici) karsi calismasini saglar (bkz. `plan.md` S5 "Teknik
 * not" ve Riskler #6; ayrica CLAUDE.md "Bilinen tuzaklar" MOB/S5).
 *
 * **Onemli -- Metro bundling kisiti:** bu dosya (ve onu import eden her repo
 * dosyasi) gercek uygulamanin parcasidir, yani Metro tarafindan bundle
 * edilir. Bu yuzden burada **yalnizca `expo-sqlite`** referans alinir (Metro
 * bunu cozebilir, gercek bagimlilik). Test surucusu (`node:sqlite`, Node'un
 * yerlesik modulu) bilerek burada YOKTUR ve `__tests__/helpers/node-sqlite-driver.ts`
 * icinde, yalnizca test dosyalarinin eristigi ayri bir dosyada tutulur --
 * Metro'nun asla goremeyecegi bir yerde. `node:sqlite` bir Node cekirdek
 * modulodur; Metro bunu cozemez, uygulama kodunun herhangi bir yerinden
 * (dogrudan veya dolayli) import edilirse gercek Expo build'i "Unable to
 * resolve module node:sqlite" hatasiyla kirilir. Bu dosyaya veya diger
 * `src/data/*.ts` dosyalarina asla `node:sqlite` importu eklenmemeli.
 */
import { runMigrations } from './migrations';
// Yalnizca tip icin (derlemede tamamen silinir, Metro icin bir runtime
// importu OLUSTURMAZ) -- `expo-sqlite`'in bind parametre tipini yeniden
// yazmamak icin.
import type { SQLiteBindParams as SqliteBindParams } from 'expo-sqlite';

/** Bir SQL calistirmasinin etkiledigi satir sayisi ve varsa eklenen id. */
export interface SqlRunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

/**
 * Repo katmaninin bagimli oldugu ince arayuz. Hem gercek `expo-sqlite`
 * surucusu hem de test surucusu (`node:sqlite`, bkz. yukaridaki not) bunu
 * uygular. Parametreler yalnizca **pozisyonel** (`?`) baglanir -- hem
 * `expo-sqlite` hem `node:sqlite` bunu ayni sekilde destekler, isimli
 * parametre soz dizimi (`$ad`) iki surucude farklilastigindan bilerek
 * kullanilmaz.
 */
export interface SqlDriver {
  /** Parametresiz, tek veya coklu deyim (DDL, PRAGMA, vs.) calistirir. */
  exec(sql: string): void;
  /** Tek bir deyimi (INSERT/UPDATE/DELETE) pozisyonel parametrelerle calistirir. */
  run(sql: string, params?: readonly unknown[]): SqlRunResult;
  /** Tek satir dondurur, yoksa `undefined`. */
  get<T = unknown>(sql: string, params?: readonly unknown[]): T | undefined;
  /** Tum eslesen satirlari dondurur. */
  all<T = unknown>(sql: string, params?: readonly unknown[]): T[];
  /** `PRAGMA user_version` okur (migration takibi, bkz. `migrations.ts`). */
  getUserVersion(): number;
  /** `PRAGMA user_version` yazar. */
  setUserVersion(version: number): void;
  /** Baglantiyi kapatir (testlerde her testten sonra cagrilir). */
  close(): void;
}

/**
 * Gercek uygulamanin kullandigi surucu: `expo-sqlite`'in senkron API'si
 * (`openDatabaseSync`). Lazy `require` ile alinir: bu dosya testlerde de
 * import edilir (repo dosyalari uzerinden), ama testler bu fonksiyonu hic
 * cagirmaz (yalnizca `__tests__/helpers/node-sqlite-driver.ts`'teki surucuyu
 * kullanir) -- yine de `expo-sqlite` gercek, `package.json`'da tanimli bir
 * bagimlilik oldugundan Metro veya Jest icin bir cozumleme sorunu yoktur;
 * lazy olmasinin nedeni yalnizca Jest/Node ortaminda native modulun
 * cagrilmasini (import edilmesini degil) onlemektir.
 *
 * @param name Cihazdaki veritabani dosyasinin adi (or. `hhk.db`).
 */
export function createExpoSqliteDriver(name: string): SqlDriver {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { openDatabaseSync } = require('expo-sqlite') as typeof import('expo-sqlite');
  const db = openDatabaseSync(name);
  // S16b (24 N-1 / 21 P-5): silinen sayfalar sıfırlansın. En iyi çaba; bu
  // pragma kurulamazsa uygulama yine çalışır (silmede ayrıca VACUUM var).
  try {
    db.execSync('PRAGMA secure_delete = ON');
  } catch {
    // bilerek yutuldu
  }

  return {
    exec(sql) {
      db.execSync(sql);
    },
    run(sql, params = []) {
      // `expo-sqlite`'in bind tipleri (`SQLiteBindValue`) bizim genel
      // `unknown[]` parametremizden daha dar; repo katmani yalnizca
      // string/number/null gonderdiginden calisma zamaninda guvenli, burada
      // yalnizca tip seviyesinde bir gevseme var.
      const result = db.runSync(sql, params as SqliteBindParams);
      return { changes: result.changes, lastInsertRowid: result.lastInsertRowId };
    },
    get<T>(sql: string, params: readonly unknown[] = []) {
      return db.getFirstSync<T>(sql, params as SqliteBindParams) ?? undefined;
    },
    all<T>(sql: string, params: readonly unknown[] = []) {
      return db.getAllSync<T>(sql, params as SqliteBindParams);
    },
    getUserVersion() {
      const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
      return row?.user_version ?? 0;
    },
    setUserVersion(version) {
      db.execSync(`PRAGMA user_version = ${version}`);
    },
    close() {
      db.closeSync();
    },
  };
}

let activeDriver: SqlDriver | null = null;

/**
 * Etkin surucuyu kurar ve gerekli migration'lari calistirir (`skipMigrations`
 * yalnizca migration mekanizmasinin kendisini adim adim test etmek isteyen
 * `__tests__/data/migrations.test.ts` icindir -- normal kullanimda verilmez).
 * Uygulama acilisinda bir kez `setDriver(createExpoSqliteDriver('hhk.db'))`
 * cagrilmasi beklenir (S6+ wiring); testler her `beforeEach`'te taze bir
 * bellek-ici surucuyle cagirir.
 */
export function setDriver(driver: SqlDriver, options?: { skipMigrations?: boolean }): void {
  activeDriver = driver;
  if (!options?.skipMigrations) {
    runMigrations(driver);
  }
}

/** Etkin surucuyu dondurur; `setDriver` hic cagrilmadiysa hata firlatir. */
export function getDriver(): SqlDriver {
  if (!activeDriver) {
    throw new Error(
      'Veritabani surucusu kurulmadi: repo fonksiyonlarindan once setDriver() cagrilmali.'
    );
  }
  return activeDriver;
}

/** Etkin surucuyu kapatir ve referansi temizler (testlerde `afterEach`). */
export function resetDriver(): void {
  activeDriver?.close();
  activeDriver = null;
}

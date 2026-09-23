/**
 * S5 veri katmani testleri icin bellek-ici SQLite surucusu. `node:sqlite`
 * (Node 22.5+'ta yerlesik, `DatabaseSync`) gercek bir SQLite motoru
 * calistirir -- yani CHECK/PRIMARY KEY/UNIQUE kisitlari, tip zorlamasi vb.
 * saf bir JS mock'unda oldugu gibi taklit edilmez, GERCEKTEN uygulanir. Bu
 * `db.ts`'teki `SqlDriver` arayuzunu uygular, boylece
 * `src/data/checkin-repo.ts` gibi gercek repo dosyalari testte de
 * degistirilmeden calisir.
 *
 * **Neden yeni bir npm bagimliligi degil:** `node:sqlite` Node'un kendi
 * cekirdek modulu (Node 22.5+, bu makinede Node 24 kurulu) -- `package.json`'a
 * hicbir yeni satir eklemez, "aga veri gonderiyor mu" kontrolu (CLAUDE.md
 * guvenlik notu) tartismasiz gecer (ag erisimi olan bir paket bile degil).
 * `better-sqlite3` gibi bir alternatif de calisirdi ama ekstra bir native
 * derleme bagimliligi eklerdi; `node:sqlite` zaten kurulu, sifir ek risk.
 *
 * **Bu dosya YALNIZCA testlerden import edilmelidir.** `node:sqlite` bir Node
 * cekirdek modulu oldugundan Metro (React Native bundler) onu cozemez;
 * gercek uygulama kodundan (`src/**`) buraya bir import zinciri olusursa
 * `npx expo start` / EAS build kirilir. Bu yuzden bu dosya bilerek `src/`
 * disinda, `__tests__/helpers/` altinda tutulur (bkz. `src/data/db.ts`
 * basindaki not).
 */
import { DatabaseSync } from 'node:sqlite';
import type { SqlDriver } from '@/data/db';

/**
 * Her cagrida taze, izole bir bellek-ici veritabani baglantisi doner
 * (`:memory:`) -- testler arasinda veri sizmaz. Migration'lar burada
 * calistirilmaz; cagiran (`db.ts`'teki `setDriver`) bunu yapar.
 */
export function createNodeSqliteDriver(): SqlDriver {
  const db = new DatabaseSync(':memory:');
  // Test motorunda da foreign key/CHECK zorlamasi acik olsun (varsayilan
  // SQLite davranisiyla tutarli; bu semada FK yok ama CHECK zaten varsayilan
  // acik).
  db.exec('PRAGMA foreign_keys = ON;');

  return {
    exec(sql) {
      db.exec(sql);
    },
    run(sql, params = []) {
      const stmt = db.prepare(sql);
      const result = stmt.run(...(params as unknown[]));
      return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
    },
    get<T>(sql: string, params: readonly unknown[] = []) {
      const stmt = db.prepare(sql);
      return stmt.get(...(params as unknown[])) as T | undefined;
    },
    all<T>(sql: string, params: readonly unknown[] = []) {
      const stmt = db.prepare(sql);
      return stmt.all(...(params as unknown[])) as T[];
    },
    getUserVersion() {
      const row = db.prepare('PRAGMA user_version').get() as { user_version: number } | undefined;
      return row?.user_version ?? 0;
    },
    setUserVersion(version) {
      db.exec(`PRAGMA user_version = ${version};`);
    },
    close() {
      db.close();
    },
  };
}

/**
 * Uygulama açılışında veritabanı sürücüsünü kurar (bkz. `db.ts` "S6+
 * wiring" notu: "Uygulama açılışında bir kez `setDriver(createExpoSqliteDriver(...))`
 * çağrılması beklenir"). `plan.md` S6.
 *
 * `initialized` guard'ı, Fast Refresh sırasında kök layout yeniden mount
 * olursa ikinci bir `expo-sqlite` bağlantısı açılmasını engeller (gereksiz
 * dosya tanıtıcısı/migration tekrar çalıştırması, zararsız ama israf).
 */
import { createExpoSqliteDriver, setDriver } from './db';

/** Cihazdaki veritabanı dosyasının adı. */
export const DATABASE_NAME = 'hhk.db';

let initialized = false;

export function initAppDatabase(): void {
  if (initialized) {
    return;
  }
  setDriver(createExpoSqliteDriver(DATABASE_NAME));
  initialized = true;
}

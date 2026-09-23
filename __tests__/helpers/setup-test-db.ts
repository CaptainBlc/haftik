/**
 * Repo testleri icin ortak `beforeEach`/`afterEach` kurulumu: her testten
 * once taze bir bellek-ici surucu kurar (migration'lar dahil), her testten
 * sonra kapatir. Repo dosyalari (`checkin-repo.ts` vb.) `db.ts`'teki tekil
 * `activeDriver`'i kullandigindan, testler arasi sizinti olmamasi icin bu
 * cift adim (kur/kapat) sarttir.
 */
import { setDriver, resetDriver } from '@/data/db';
import { createNodeSqliteDriver } from './node-sqlite-driver';

export function setupTestDb(): void {
  beforeEach(() => {
    setDriver(createNodeSqliteDriver());
  });

  afterEach(() => {
    resetDriver();
  });
}

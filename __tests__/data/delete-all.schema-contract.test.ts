/**
 * R-9 sözleşme testi (S14 "veri sağlamlığı",
 * `docs/inceleme-2026-09-25/28-muhendislik-standartlari-v2.md` §2.1):
 * `deleteAllData` sonrası `sqlite_master`'daki HER kullanıcı tablosu 0 satır
 * olmalı. Bu test tablo adlarını elle listelemez — şemadan mekanik olarak
 * okur; yeni bir kalıcı tablo eklenip `delete-all.ts`'e eklenmeyi
 * unutursa bu test (ad listeleyen bir test değil, gerçekten
 * `sqlite_master`'ı sorgulayan bir test) onu yakalar.
 */
import { deleteAllData } from '@/data/delete-all';
import { getDriver } from '@/data/db';
import { setupTestDb } from '../helpers/setup-test-db';

function userTableNames(): string[] {
  const driver = getDriver();
  return driver
    .all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
    )
    .map((row) => row.name);
}

describe('delete-all: şema sözleşmesi (R-9)', () => {
  setupTestDb();

  it('en az bir kullanıcı tablosu var (testin kendisi sahte geçmiyor)', () => {
    expect(userTableNames().length).toBeGreaterThan(0);
  });

  it('deleteAllData sonrası sqlite_master daki HER tablo 0 satırdır', async () => {
    const tables = userTableNames();
    expect(tables).toContain('metric_counter'); // A10 ile eklenen tablo da listede olmalı

    await deleteAllData(() => {});

    const driver = getDriver();
    for (const table of tables) {
      const row = driver.get<{ c: number }>(`SELECT COUNT(*) AS c FROM ${table}`);
      expect(row?.c ?? 0).toBe(0);
    }
  });
});

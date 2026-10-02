/** S10 I-1: deleteAllData sonrası geçici snapshot süpürmesi çağrılır. */
import { getDriver } from '@/data/db';
import { deleteAllData } from '@/data/delete-all';
import { setupTestDb } from '../helpers/setup-test-db';

const mockSweep = jest.fn(async () => undefined);
const mockDeleteShareDir = jest.fn(async () => undefined);
jest.mock('@/card/temp-cleanup', () => ({
  sweepSnapshotFiles: () => mockSweep(),
}));
jest.mock('@/card/share-dir', () => ({
  deleteShareDir: () => mockDeleteShareDir(),
}));

describe('delete-all: snapshot süpürmesi', () => {
  setupTestDb();

  afterEach(() => jest.clearAllMocks());

  it('tablolar silindikten sonra süpürme çağrılır', async () => {
    await deleteAllData(() => undefined);
    expect(mockSweep).toHaveBeenCalledTimes(1);
  });

  it('S16b: adanmış paylaşım dizini (kart PNG + rapor) tamamen silinir', async () => {
    await deleteAllData(() => undefined);
    expect(mockDeleteShareDir).toHaveBeenCalledTimes(1);
  });
});

describe('S16b: güvenli silme (24 F3 / 21 P-5)', () => {
  setupTestDb();

  it('tablolar silindikten SONRA VACUUM ve wal_checkpoint çalıştırılır', async () => {
    const driver = getDriver();
    const execSpy = jest.spyOn(driver, 'exec');
    await deleteAllData(() => undefined);
    const statements = execSpy.mock.calls.map((c) => c[0]);
    const commitIdx = statements.findIndex((s) => s.includes('COMMIT;'));
    const vacuumIdx = statements.indexOf('VACUUM;');
    expect(commitIdx).toBeGreaterThanOrEqual(0);
    expect(vacuumIdx).toBeGreaterThan(commitIdx);
    expect(statements).toContain('PRAGMA wal_checkpoint(TRUNCATE);');
  });

  it('VACUUM hata verse bile silme tamamlanır (en iyi çaba)', async () => {
    const driver = getDriver();
    const original = driver.exec.bind(driver);
    jest.spyOn(driver, 'exec').mockImplementation((sql: string) => {
      if (sql === 'VACUUM;') throw new Error('vacuum failed');
      original(sql);
    });
    await expect(deleteAllData(() => undefined)).resolves.toBeUndefined();
  });
});

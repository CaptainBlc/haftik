/** S10 I-1: deleteAllData sonrası geçici snapshot süpürmesi çağrılır. */
import { deleteAllData } from '@/data/delete-all';
import { setupTestDb } from '../helpers/setup-test-db';

const mockSweep = jest.fn(async () => undefined);
jest.mock('@/card/temp-cleanup', () => ({
  sweepSnapshotFiles: () => mockSweep(),
}));

describe('delete-all: snapshot süpürmesi', () => {
  setupTestDb();

  afterEach(() => jest.clearAllMocks());

  it('tablolar silindikten sonra süpürme çağrılır', async () => {
    await deleteAllData(() => undefined);
    expect(mockSweep).toHaveBeenCalledTimes(1);
  });
});

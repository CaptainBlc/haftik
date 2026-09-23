/** N-1: rapor dosyası kalıntısı temizliği ve cacheDirectory null davranışı. */
import { deleteReportFile, getReportFileUri } from '@/metrics/report-file';
import { shareReport } from '@/metrics/report';

jest.mock('expo-sharing', () => ({
  __esModule: true,
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

const mockFs = {
  cacheDirectory: 'file:///cache/' as string | null,
  writeAsStringAsync: jest.fn(async () => undefined),
  deleteAsync: jest.fn(async () => undefined),
};
jest.mock('expo-file-system/legacy', () => ({
  __esModule: true,
  get cacheDirectory() {
    return mockFs.cacheDirectory;
  },
  writeAsStringAsync: (...a: unknown[]) => (mockFs.writeAsStringAsync as jest.Mock)(...a),
  deleteAsync: (...a: unknown[]) => (mockFs.deleteAsync as jest.Mock)(...a),
}));

afterEach(() => {
  mockFs.cacheDirectory = 'file:///cache/';
  jest.clearAllMocks();
});

describe('deneme raporu dosyası', () => {
  it('deleteReportFile idempotent siler', async () => {
    await deleteReportFile();
    expect(mockFs.deleteAsync).toHaveBeenCalledWith('file:///cache/deneme-raporu.txt', {
      idempotent: true,
    });
  });

  it('cacheDirectory null ise getReportFileUri hata fırlatır, deleteReportFile sessiz kalır', async () => {
    mockFs.cacheDirectory = null;
    expect(() => getReportFileUri()).toThrow();
    await expect(deleteReportFile()).resolves.toBeUndefined();
  });

  it('cacheDirectory null ise shareReport dosya yazmadan/paylaşmadan hata verir', async () => {
    mockFs.cacheDirectory = null;
    await expect(shareReport(new Date(2026, 8, 10))).rejects.toThrow();
    expect(mockFs.writeAsStringAsync).not.toHaveBeenCalled();
  });
});

/** S10 I-1: geçici snapshot PNG süpürmesi (yalnızca view-shot desenine uyanlar). */
import { isSnapshotFileName, sweepSnapshotFiles } from '@/card/temp-cleanup';

const mockFs = {
  cacheDirectory: 'file:///cache/' as string | null,
  readDirectoryAsync: jest.fn(async (): Promise<string[]> => []),
  deleteAsync: jest.fn(async (..._args: unknown[]) => undefined),
};
jest.mock('expo-file-system/legacy', () => ({
  __esModule: true,
  get cacheDirectory() {
    return mockFs.cacheDirectory;
  },
  readDirectoryAsync: (...a: unknown[]) =>
    (mockFs.readDirectoryAsync as unknown as (...x: unknown[]) => Promise<string[]>)(...a),
  deleteAsync: (...a: unknown[]) => mockFs.deleteAsync(...a),
}));

afterEach(() => {
  mockFs.cacheDirectory = 'file:///cache/';
  jest.clearAllMocks();
});

describe('isSnapshotFileName', () => {
  it('yalnızca ReactNative-snapshot-image*.png eşleşir', () => {
    expect(isSnapshotFileName('ReactNative-snapshot-image123456.png')).toBe(true);
    expect(isSnapshotFileName('ReactNative-snapshot-image123456.jpg')).toBe(false);
    expect(isSnapshotFileName('deneme-raporu.txt')).toBe(false);
    expect(isSnapshotFileName('other-ReactNative-snapshot-image1.png')).toBe(false);
  });
});

describe('sweepSnapshotFiles', () => {
  it('yalnızca desene uyan dosyaları siler', async () => {
    mockFs.readDirectoryAsync.mockResolvedValueOnce([
      'ReactNative-snapshot-image1.png',
      'deneme-raporu.txt',
      'photo.png',
      'ReactNative-snapshot-image2.png',
    ]);
    await sweepSnapshotFiles();
    expect(mockFs.deleteAsync).toHaveBeenCalledTimes(2);
    expect(mockFs.deleteAsync).toHaveBeenCalledWith(
      'file:///cache/ReactNative-snapshot-image1.png',
      { idempotent: true }
    );
    expect(mockFs.deleteAsync).toHaveBeenCalledWith(
      'file:///cache/ReactNative-snapshot-image2.png',
      { idempotent: true }
    );
  });

  it('cacheDirectory yoksa hiçbir şey yapmaz ve hata fırlatmaz', async () => {
    mockFs.cacheDirectory = null;
    await expect(sweepSnapshotFiles()).resolves.toBeUndefined();
    expect(mockFs.readDirectoryAsync).not.toHaveBeenCalled();
  });

  it('dizin okuma hatası akışı bozmaz', async () => {
    mockFs.readDirectoryAsync.mockRejectedValueOnce(new Error('io'));
    await expect(sweepSnapshotFiles()).resolves.toBeUndefined();
  });

  it('bir dosyanın silme hatası diğerlerini engellemez', async () => {
    mockFs.readDirectoryAsync.mockResolvedValueOnce([
      'ReactNative-snapshot-image1.png',
      'ReactNative-snapshot-image2.png',
    ]);
    mockFs.deleteAsync.mockRejectedValueOnce(new Error('io'));
    await expect(sweepSnapshotFiles()).resolves.toBeUndefined();
    expect(mockFs.deleteAsync).toHaveBeenCalledTimes(2);
  });
});

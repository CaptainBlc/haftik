/**
 * S16b (22 F-8, 24 §2.1, 04 #4): adanmış paylaşım dizini — sabit tarihsiz ad,
 * yaşa göre süpürme, tam silme. Gerçek dosya sistemi yok; `expo-file-system/legacy` mock'lu.
 */
import {
  deleteShareDir,
  ensureShareDir,
  getShareDirUri,
  getShareFileUri,
  SHARE_FILE_NAME,
  SHARE_MAX_AGE_MS,
  sweepShareDir,
} from '@/card/share-dir';

const mockInfos = new Map<string, { exists: boolean; modificationTime?: number }>();
let mockCacheDir: string | null = 'file:///cache/';

jest.mock('expo-file-system/legacy', () => ({
  __esModule: true,
  get cacheDirectory() {
    return mockCacheDir;
  },
  makeDirectoryAsync: jest.fn(async () => undefined),
  readDirectoryAsync: jest.fn(async () => Array.from(mockInfos.keys())),
  getInfoAsync: jest.fn(async (uri: string) => {
    const name = uri.split('/').pop() as string;
    return mockInfos.get(name) ?? { exists: false };
  }),
  deleteAsync: jest.fn(async () => undefined),
}));

function FS() {
  return jest.requireMock('expo-file-system/legacy') as Record<string, jest.Mock>;
}

const NOW_MS = 1_800_000_000_000;

beforeEach(() => {
  mockInfos.clear();
  mockCacheDir = 'file:///cache/';
});
afterEach(() => jest.clearAllMocks());

describe('share-dir: adlar', () => {
  it('dizin cache altında adanmış klasör, dosya adı sabit ve tarihsiz', () => {
    expect(getShareDirUri()).toBe('file:///cache/haftik-share/');
    expect(getShareFileUri()).toBe('file:///cache/haftik-share/Haftik-kart.png');
    expect(SHARE_FILE_NAME).not.toMatch(/\d/);
  });

  it('cache dizini yoksa hata fırlatır (sessizce boş yola yazılmaz)', () => {
    mockCacheDir = null;
    expect(() => getShareDirUri()).toThrow(/önbellek/);
  });

  it('ensureShareDir dizini intermediates ile oluşturur', async () => {
    await ensureShareDir();
    expect(FS().makeDirectoryAsync).toHaveBeenCalledWith('file:///cache/haftik-share/', {
      intermediates: true,
    });
  });
});

describe('share-dir: yaşa göre süpürme', () => {
  it('1 saatten eski dosyaları siler, yenilerini bırakır', async () => {
    mockInfos.set('eski.png', { exists: true, modificationTime: (NOW_MS - SHARE_MAX_AGE_MS - 1000) / 1000 });
    mockInfos.set('yeni.png', { exists: true, modificationTime: (NOW_MS - 60_000) / 1000 });
    await sweepShareDir(SHARE_MAX_AGE_MS, NOW_MS);
    const deleted = FS().deleteAsync.mock.calls.map((c) => c[0]);
    expect(deleted).toEqual(['file:///cache/haftik-share/eski.png']);
  });

  it('yaşı bilinmeyen dosya silinir (gizlilik tarafında kalınır)', async () => {
    mockInfos.set('gizemli.png', { exists: true });
    await sweepShareDir(SHARE_MAX_AGE_MS, NOW_MS);
    expect(FS().deleteAsync).toHaveBeenCalledWith(
      'file:///cache/haftik-share/gizemli.png',
      expect.objectContaining({ idempotent: true })
    );
  });

  it('dizin okunamazsa (yok) sessizce geçer', async () => {
    FS().readDirectoryAsync.mockRejectedValueOnce(new Error('yok'));
    await expect(sweepShareDir(SHARE_MAX_AGE_MS, NOW_MS)).resolves.toBeUndefined();
  });

  it('bir dosyanın silinmesi başarısız olsa da kalanlar denenir', async () => {
    mockInfos.set('a.png', { exists: true, modificationTime: 1 });
    mockInfos.set('b.png', { exists: true, modificationTime: 1 });
    FS().deleteAsync.mockRejectedValueOnce(new Error('disk'));
    await sweepShareDir(SHARE_MAX_AGE_MS, NOW_MS);
    expect(FS().deleteAsync).toHaveBeenCalledTimes(2);
  });
});

describe('share-dir: tam silme ("Tüm verilerimi sil")', () => {
  it('dizin idempotent olarak komple silinir', async () => {
    await deleteShareDir();
    expect(FS().deleteAsync).toHaveBeenCalledWith(
      'file:///cache/haftik-share/',
      expect.objectContaining({ idempotent: true })
    );
  });

  it('hata fırlatmaz (cache yok / silme hatası)', async () => {
    mockCacheDir = null;
    await expect(deleteShareDir()).resolves.toBeUndefined();
  });
});

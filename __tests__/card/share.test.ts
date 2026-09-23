/**
 * `shareCard` — `expo-sharing` ile paylaşım + paylaşım sonrası geçici PNG
 * temizliği (spec E10 açık noktası, `plan.md` S7b). Bkz. `src/card/share.ts`
 * başlığı. Gerçek cihaz/native modül yok; `expo-sharing` ve
 * `expo-file-system/legacy` mock'lanır (aynı desen: `__tests__/card/capture.test.ts`).
 */
import { shareCard } from '@/card/share';

jest.mock('expo-sharing', () => ({
  __esModule: true,
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-file-system/legacy', () => ({
  __esModule: true,
  deleteAsync: jest.fn(async () => undefined),
}));

function mocks() {
  const Sharing = jest.requireMock('expo-sharing') as {
    isAvailableAsync: jest.Mock;
    shareAsync: jest.Mock;
  };
  const FileSystem = jest.requireMock('expo-file-system/legacy') as {
    deleteAsync: jest.Mock;
  };
  return { Sharing, FileSystem };
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('shareCard', () => {
  it('paylaşım kullanılabiliyorsa shareAsync\'i PNG mime type ve mesajla (dialogTitle) çağırır', async () => {
    const { Sharing } = mocks();
    await shareCard('file:///fake/card.png', 'Haftalık karnem hazır!');
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      'file:///fake/card.png',
      expect.objectContaining({ mimeType: 'image/png', dialogTitle: 'Haftalık karnem hazır!' })
    );
  });

  it('paylaşım kullanılamıyorsa hata fırlatır ve shareAsync hiç çağrılmaz', async () => {
    const { Sharing } = mocks();
    Sharing.isAvailableAsync.mockResolvedValueOnce(false);
    await expect(shareCard('file:///fake/card.png')).rejects.toThrow(
      /bu cihazda paylaşım kullanılamıyor/
    );
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });

  it('paylaşım TAMAMLANDIĞINDA geçici PNG dosyasını siler (E10 açık noktasının çözümü)', async () => {
    const { FileSystem } = mocks();
    await shareCard('file:///fake/card.png');
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
      'file:///fake/card.png',
      expect.objectContaining({ idempotent: true })
    );
  });

  it('dosya silme başarısız olsa bile paylaşım akışı hata fırlatmaz (en iyi çaba temizlik)', async () => {
    const { FileSystem } = mocks();
    FileSystem.deleteAsync.mockRejectedValueOnce(new Error('disk hatası'));
    await expect(shareCard('file:///fake/card.png')).resolves.toBeUndefined();
  });

  it('shareAsync hata fırlatsa bile geçici dosya silme yine de denenir (finally)', async () => {
    const { Sharing, FileSystem } = mocks();
    Sharing.shareAsync.mockRejectedValueOnce(new Error('kullanıcı iptal etti değil, gerçek hata'));
    await expect(shareCard('file:///fake/card.png')).rejects.toThrow();
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
      'file:///fake/card.png',
      expect.objectContaining({ idempotent: true })
    );
  });
});

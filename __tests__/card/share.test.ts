/**
 * `shareCard` — `expo-sharing` ile paylaşım (S16b: paylaşım sonrası silme YOK,
 * bkz. `src/card/share.ts` başlığı ve `__tests__/card/share-dir.test.ts`).
 * Gerçek cihaz/native modül yok; `expo-sharing` ve
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

  // S16b (04 #4, 24 §2.1): eski E10 kararı (finally'de silme) BİLİNÇLİ olarak
  // kaldırıldı — seçici hedef uygulama dosyayı okumadan çözülebildiği için silmek
  // boş/eksik görsel verebiliyordu. Temizlik artık share-dir.ts'te (yaşa göre
  // süpürme, açılış, "Tüm verilerimi sil"). Aşağıdaki testler yeni sözleşmeyi korur.
  it('paylaşım TAMAMLANINCA dosyayı SİLMEZ (hedef uygulama henüz okuyor olabilir)', async () => {
    const { FileSystem } = mocks();
    await shareCard('file:///fake/card.png');
    expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
  });

  it('shareAsync hata fırlatsa da dosyayı silmez (temizlik süpürmeye bırakılır)', async () => {
    const { Sharing, FileSystem } = mocks();
    Sharing.shareAsync.mockRejectedValueOnce(new Error('gerçek hata'));
    await expect(shareCard('file:///fake/card.png')).rejects.toThrow();
    expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
  });
});

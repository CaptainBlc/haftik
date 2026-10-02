/**
 * S10 I-1 testi, S16b'de (04 #4) YENİ sözleşmeye göre yeniden yazıldı: paylaşım
 * kullanılamadığında da dosya `shareCard` içinde SİLİNMEZ (temizlik süpürmeye
 * bırakılır, bkz. `src/card/share-dir.ts`); hata yine fırlatılır.
 */
import { shareCard } from '@/card/share';

jest.mock('expo-sharing', () => ({
  __esModule: true,
  isAvailableAsync: jest.fn(async () => false),
  shareAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-file-system/legacy', () => ({
  __esModule: true,
  deleteAsync: jest.fn(async () => undefined),
}));

afterEach(() => jest.clearAllMocks());

describe('shareCard: isAvailableAsync false', () => {
  it('hata fırlatır, shareAsync çağrılmaz, dosya silinmez', async () => {
    const FileSystem = jest.requireMock('expo-file-system/legacy') as { deleteAsync: jest.Mock };
    const Sharing = jest.requireMock('expo-sharing') as { shareAsync: jest.Mock };
    await expect(shareCard('file:///fake/card.png')).rejects.toThrow(/kullanılamıyor/);
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
    expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
  });

  it('isAvailableAsync kendisi reddederse hata aynen yayılır', async () => {
    const Sharing = jest.requireMock('expo-sharing') as { isAvailableAsync: jest.Mock };
    Sharing.isAvailableAsync.mockRejectedValueOnce(new Error('native'));
    await expect(shareCard('file:///fake/card.png')).rejects.toThrow('native');
  });
});

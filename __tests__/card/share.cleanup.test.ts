/** S10 I-1: paylaşım kullanılamadığında da geçici PNG silinir. */
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
  it('hata fırlatır ama geçici PNG yine silinir', async () => {
    const FileSystem = jest.requireMock('expo-file-system/legacy') as { deleteAsync: jest.Mock };
    await expect(shareCard('file:///fake/card.png')).rejects.toThrow(/kullanılamıyor/);
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
      'file:///fake/card.png',
      expect.objectContaining({ idempotent: true })
    );
  });

  it('isAvailableAsync kendisi reddederse de PNG silinir', async () => {
    const Sharing = jest.requireMock('expo-sharing') as { isAvailableAsync: jest.Mock };
    const FileSystem = jest.requireMock('expo-file-system/legacy') as { deleteAsync: jest.Mock };
    Sharing.isAvailableAsync.mockRejectedValueOnce(new Error('native'));
    await expect(shareCard('file:///fake/card.png')).rejects.toThrow('native');
    expect(FileSystem.deleteAsync).toHaveBeenCalledTimes(1);
  });
});

/**
 * `captureCardPng` — S16b (22 F-8, 24 §2.1) sonrası: view-shot `result:'base64'`
 * ile yakalar, PNG adanmış `haftik-share/` dizinine sabit, tarihsiz adla yazılır.
 * Gerçek cihaz/native modül yok; `captureRef` ve `expo-file-system/legacy` mock'lanır.
 */
import { captureCardPng } from '@/card/capture';
import { CARD_OUTPUT_HEIGHT, CARD_OUTPUT_WIDTH } from '@/card/layout';
import type { ViewShotRef } from 'react-native-view-shot';

jest.mock('react-native-view-shot', () => ({
  __esModule: true,
  captureRef: jest.fn(async () => 'QkFTRTY0'),
  default: null,
}));

jest.mock('expo-file-system/legacy', () => ({
  __esModule: true,
  cacheDirectory: 'file:///cache/',
  EncodingType: { Base64: 'base64', UTF8: 'utf8' },
  makeDirectoryAsync: jest.fn(async () => undefined),
  readDirectoryAsync: jest.fn(async () => []),
  getInfoAsync: jest.fn(async () => ({ exists: false })),
  deleteAsync: jest.fn(async () => undefined),
  writeAsStringAsync: jest.fn(async () => undefined),
}));

function fs() {
  return jest.requireMock('expo-file-system/legacy') as Record<string, jest.Mock>;
}

afterEach(() => jest.clearAllMocks());

describe('captureCardPng', () => {
  it('captureRef’i 1080x1920 PNG + base64 sonucuyla çağırır', async () => {
    const { captureRef } = jest.requireMock('react-native-view-shot') as { captureRef: jest.Mock };
    const ref = { current: {} } as React.RefObject<ViewShotRef>;

    await captureCardPng(ref);

    expect(captureRef).toHaveBeenCalledWith(
      ref,
      expect.objectContaining({
        width: CARD_OUTPUT_WIDTH,
        height: CARD_OUTPUT_HEIGHT,
        format: 'png',
        result: 'base64',
      })
    );
  });

  it('PNG adanmış dizine SABİT, tarihsiz adla yazılır ve o URI döner (sızdırmayan ad)', async () => {
    const ref = { current: {} } as React.RefObject<ViewShotRef>;
    const uri = await captureCardPng(ref);

    expect(uri).toBe('file:///cache/haftik-share/Haftik-kart.png');
    expect(uri).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(fs().makeDirectoryAsync).toHaveBeenCalledWith('file:///cache/haftik-share/', {
      intermediates: true,
    });
    expect(fs().writeAsStringAsync).toHaveBeenCalledWith(uri, 'QkFTRTY0', { encoding: 'base64' });
  });

  it('ref bağlı değilse hata fırlatır (CardView mount olmadan yakalama denenemez)', async () => {
    const ref = { current: null } as React.RefObject<ViewShotRef | null>;
    await expect(captureCardPng(ref)).rejects.toThrow(/ref henüz bağlı değil/);
    expect(fs().writeAsStringAsync).not.toHaveBeenCalled();
  });
});

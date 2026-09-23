/**
 * `captureCardPng` — S1 spike'ının (`spike/view-shot/CardCaptureSpike.tsx`,
 * bkz. `__tests__/spike/CardCaptureSpike.test.tsx`) gerçek koda taşınmış
 * hali için aynı desende test. Gerçek cihaz/native modül yok; `captureRef`
 * mock'lanır.
 */
import { captureCardPng } from '@/card/capture';
import { CARD_OUTPUT_HEIGHT, CARD_OUTPUT_WIDTH } from '@/card/layout';
import type { ViewShotRef } from 'react-native-view-shot';

jest.mock('react-native-view-shot', () => {
  const captureRef = jest.fn(async () => 'file:///fake/card.png');
  return {
    __esModule: true,
    captureRef,
    default: null,
  };
});

describe('captureCardPng', () => {
  it('captureRef’i 1080x1920 PNG seçenekleriyle çağırır ve dosya URI’sini döner', async () => {
    const { captureRef } = jest.requireMock('react-native-view-shot') as { captureRef: jest.Mock };
    const ref = { current: {} } as React.RefObject<ViewShotRef>;

    const uri = await captureCardPng(ref);

    expect(uri).toBe('file:///fake/card.png');
    expect(captureRef).toHaveBeenCalledWith(
      ref,
      expect.objectContaining({
        width: CARD_OUTPUT_WIDTH,
        height: CARD_OUTPUT_HEIGHT,
        format: 'png',
      })
    );
  });

  it('ref bağlı değilse hata fırlatır (CardView mount olmadan yakalama denenemez)', async () => {
    const ref = { current: null } as React.RefObject<ViewShotRef | null>;
    await expect(captureCardPng(ref)).rejects.toThrow(/ref henüz bağlı değil/);
  });
});

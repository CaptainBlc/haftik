/**
 * S1 spike testi (bkz. `spike/view-shot/CardCaptureSpike.tsx`).
 *
 * Gerçek cihaz/native modül yok; bu yüzden `react-native-view-shot`'ın
 * `captureRef` fonksiyonu mock'lanıyor. Amaç: (1) bileşen Türkçe metinle
 * derlenip render oluyor mu, (2) `captureCardSpike` beklenen 1080x1920 PNG
 * seçenekleriyle `captureRef`'i doğru çağırıyor mu. Gerçek PNG üretimi ve
 * font tutarlılığı S7a'da gerçek cihazda doğrulanır (plan.md S7a).
 */
import { createRef } from 'react';
import { create, act } from 'react-test-renderer';

import {
  CARD_OUTPUT_HEIGHT,
  CARD_OUTPUT_WIDTH,
  CardCaptureSpike,
  captureCardSpike,
} from '../../spike/view-shot/CardCaptureSpike';
import type { ViewShotRef } from 'react-native-view-shot';

jest.mock('react-native-view-shot', () => {
  // jest.mock fabrikası, üstteki `import`larla bağlanmış değişkenlere
  // erişemez (hoisting kısıtı); bu yüzden burada kasıtlı olarak `require`
  // kullanılıyor (Jest'in resmi önerdiği desen).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const captureRef = jest.fn(async () => 'file:///fake/card-spike.png');
  return {
    __esModule: true,
    captureRef,
    default: React.forwardRef(function MockViewShot(
      props: { children?: React.ReactNode },
      ref: React.Ref<unknown>
    ) {
      return React.createElement(
        'View',
        { ref },
        props.children
      );
    }),
  };
});

describe('S1 spike: kart görseli yakalama (react-native-view-shot)', () => {
  it('Türkçe karakterli kartı derler ve render eder', () => {
    const ref = createRef<ViewShotRef>();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardCaptureSpike ref={ref} />);
    });
    expect(tree).toBeDefined();
    const json = tree!.toJSON();
    expect(JSON.stringify(json)).toContain('ğ ş ı İ ö ü ç');
  });

  it('captureCardSpike, captureRef’i 1080x1920 PNG seçenekleriyle çağırır', async () => {
    const { captureRef } = jest.requireMock('react-native-view-shot') as {
      captureRef: jest.Mock;
    };
    const ref = { current: {} } as React.RefObject<ViewShotRef>;

    const uri = await captureCardSpike(ref);

    expect(uri).toBe('file:///fake/card-spike.png');
    expect(captureRef).toHaveBeenCalledWith(
      ref,
      expect.objectContaining({
        width: CARD_OUTPUT_WIDTH,
        height: CARD_OUTPUT_HEIGHT,
        format: 'png',
      })
    );
  });

  it('ref bağlı değilse captureCardSpike hata fırlatır', async () => {
    const ref = { current: null } as React.RefObject<ViewShotRef | null>;
    await expect(captureCardSpike(ref)).rejects.toThrow(/ref henüz bağlı değil/);
  });
});

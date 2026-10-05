/**
 * S19 / R1 (21 §2b): yakalama çerçevesi. view-shot Android'de görünümü kendi piksel boyutunda çizip
 * 1080x1920'ye büyütür (bulanıklık); çerçeve piksel olarak TAM 1080x1920 olursa büyütme olmaz.
 * Cihaz karşılığı (2,0x ve 2,625x kenar keskinliği, K4) `docs/muhendislik/kart-render.md`'de.
 */
import { PixelRatio, StyleSheet } from 'react-native';
import { act, create } from 'react-test-renderer';

import { CardView } from '@/card/CardView';
import { computeCaptureFrame } from '@/card/capture-frame';
import { CARD_LOGICAL_HEIGHT, CARD_LOGICAL_WIDTH, CARD_OUTPUT_HEIGHT, CARD_OUTPUT_WIDTH } from '@/card/layout';
import { CARD_FIXTURES } from '@/dev/card-fixtures';

describe('computeCaptureFrame', () => {
  it.each([1.5, 2, 2.625, 2.75, 3, 3.5, 4])('yoğunluk %s: çerçeve piksel olarak tam 1080x1920', (pr) => {
    const f = computeCaptureFrame(pr);
    expect(f.widthDp * pr).toBeCloseTo(CARD_OUTPUT_WIDTH, 6);
    expect(f.heightDp * pr).toBeCloseTo(CARD_OUTPUT_HEIGHT, 6);
  });

  it.each([1.5, 2, 2.625, 3, 3.5])('yoğunluk %s: büyütülmüş kart (360x640 x scale) çerçeveyi tam doldurur', (pr) => {
    const f = computeCaptureFrame(pr);
    expect(CARD_LOGICAL_WIDTH * f.scale).toBeCloseTo(f.widthDp, 9);
    expect(CARD_LOGICAL_HEIGHT * f.scale).toBeCloseTo(f.heightDp, 9);
  });

  it('merkez-etrafı büyütme: kartın merkezi çerçevenin merkezindedir (kenar kaymaz)', () => {
    const f = computeCaptureFrame(2.625);
    expect(f.offsetX + CARD_LOGICAL_WIDTH / 2).toBeCloseTo(f.widthDp / 2, 9);
    expect(f.offsetY + CARD_LOGICAL_HEIGHT / 2).toBeCloseTo(f.heightDp / 2, 9);
  });

  it('2,625x için bilinen değerler: 411,43 x 731,43 dp, ölçek 1,1429', () => {
    const f = computeCaptureFrame(2.625);
    expect(f.widthDp).toBeCloseTo(411.43, 2);
    expect(f.heightDp).toBeCloseTo(731.43, 2);
    expect(f.scale).toBeCloseTo(1.1429, 4);
  });

  it('geçersiz yoğunlukta (0, negatif, NaN) fırlatır', () => {
    for (const bad of [0, -1, NaN, Infinity]) expect(() => computeCaptureFrame(bad)).toThrow(/geçersiz PixelRatio/);
  });
});

describe('CardView captureFrame', () => {
  const fx = CARD_FIXTURES[0];
  const flat = (n: { props: { style?: unknown } }) => StyleSheet.flatten(n.props.style as never) as Record<string, unknown>;
  const render = (captureFrame: boolean) => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardView snapshot={fx.snapshot} captureFrame={captureFrame} />);
    });
    return tree!;
  };
  const host = (tree: ReturnType<typeof create>, id: string) => {
    const hits = tree.root.findAll((n) => (n.type as unknown) === 'View' && n.props.testID === id);
    return hits[0];
  };

  afterEach(() => jest.restoreAllMocks());

  it('varsayılan (ekran) örneğinde çerçeve yok: kart 360x640 dp kalır', () => {
    const tree = render(false);
    expect(host(tree, 'card-capture-frame')).toBeUndefined();
    act(() => tree.unmount());
  });

  it('yakalama örneğinde çerçeve ve ölçekleyici, PixelRatio\'ya göre kurulur', () => {
    jest.spyOn(PixelRatio, 'get').mockReturnValue(2.625);
    const tree = render(true);
    const frame = flat(host(tree, 'card-capture-frame'));
    const scaler = flat(host(tree, 'card-capture-scaler'));
    expect(frame.width as number).toBeCloseTo(411.43, 2);
    expect(frame.height as number).toBeCloseTo(731.43, 2);
    expect(frame.overflow).toBe('hidden');
    expect(scaler.transform).toEqual([{ scale: expect.closeTo(1.1429, 4) }]);
    expect(scaler.position).toBe('absolute');
    act(() => tree.unmount());
  });

  it('çerçeve içeriği değiştirmez: aynı metinler, aynı sırada', () => {
    jest.spyOn(PixelRatio, 'get').mockReturnValue(2);
    const texts = (tree: ReturnType<typeof create>) => JSON.stringify(tree.toJSON()).match(/"children":\["[^"]*"\]/g);
    const a = render(false);
    const b = render(true);
    expect(texts(b)).toEqual(texts(a));
    act(() => a.unmount());
    act(() => b.unmount());
  });
});

/** S22: `CrossFade` (Kaydet etiketi 120 ms opaklık geçişi). */
import { Animated, StyleSheet, Text } from 'react-native';
import { act, create } from 'react-test-renderer';

import { CrossFade } from '@/components/cross-fade';

const opacityOf = (tree: ReturnType<typeof create>) => {
  const view = tree.root.findByType(Animated.View);
  return StyleSheet.flatten(view.props.style).opacity as { __getValue?: () => number } | number;
};

describe('CrossFade', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('ilk çizimde animasyon yok: içerik hemen görünür', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <CrossFade changeKey="a">
          <Text>a</Text>
        </CrossFade>
      );
    });
    const o = opacityOf(tree!);
    expect(typeof o === 'number' ? o : o.__getValue?.()).toBe(1);
    act(() => tree!.unmount());
  });

  it('changeKey değişince sıfırdan başlar ve opacity için 120 ms, yerel sürücülü bir geçiş başlatır; çocuk aynı kalır', () => {
    // Yerel sürücülü animasyon Jest'te JS değerini ilerletmez; bu yüzden başlangıç değeri ve
    // başlatılan geçişin yapılandırması doğrulanır. Gerçek akıcılık K4/K5'tedir.
    const timing = jest.spyOn(Animated, 'timing');
    let tree: ReturnType<typeof create> | undefined;
    const render = (key: string, label: string) =>
      act(() => {
        const el = (
          <CrossFade changeKey={key}>
            <Text>{label}</Text>
          </CrossFade>
        );
        if (!tree) tree = create(el);
        else tree.update(el);
      });
    render('a', 'Kaydet');
    expect(timing).not.toHaveBeenCalled();
    render('b', '✓ Kaydedildi');
    expect(timing).toHaveBeenCalledTimes(1);
    expect(timing.mock.calls[0][1]).toMatchObject({ toValue: 1, duration: 120, useNativeDriver: true });
    const o = opacityOf(tree!);
    expect(typeof o === 'number' ? o : o.__getValue?.()).toBe(0);
    expect(JSON.stringify(tree!.toJSON())).toContain('✓ Kaydedildi');
    act(() => tree!.unmount());
    timing.mockRestore();
  });

  it('aynı changeKey ile yeniden çizim animasyon başlatmaz', () => {
    let tree: ReturnType<typeof create> | undefined;
    const render = () =>
      act(() => {
        const el = (
          <CrossFade changeKey="a">
            <Text>x</Text>
          </CrossFade>
        );
        if (!tree) tree = create(el);
        else tree.update(el);
      });
    render();
    render();
    const o = opacityOf(tree!);
    expect(typeof o === 'number' ? o : o.__getValue?.()).toBe(1);
    act(() => tree!.unmount());
  });
});

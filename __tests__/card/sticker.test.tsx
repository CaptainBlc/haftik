/** S19: `<Sticker>` ilkeli — yapı ve R-15 madde 1 (yakalanan ağaçta platforma bağlı gölge yok). */
import { StyleSheet, Text } from 'react-native';
import { act, create } from 'react-test-renderer';

import { Sticker } from '@/card/Sticker';
import { CARD_COLORS, CARD_CUT_EDGE } from '@/card/tokens';

function render(el: React.ReactElement) {
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(el);
  });
  return tree!;
}

const flat = (node: { props: { style?: unknown } }) =>
  (StyleSheet.flatten(node.props.style as never) ?? {}) as unknown as Record<string, unknown>;

describe('Sticker', () => {
  afterEach(() => undefined);

  /** `testID` hem bileşende hem host View'da var; stil host View'dadır. */
  const host = (tree: ReturnType<typeof create>, id: string) => {
    const hits = tree.root.findAll((n) => (n.type as unknown) === 'View' && n.props.testID === id);
    expect(hits).toHaveLength(1);
    return hits[0];
  };

  it('eğim verilince dış View döner; verilmezse transform yok', () => {
    const tilted = render(<Sticker tilt={-1.5} testID="s" style={{ width: 100, height: 50 }} />);
    expect(flat(host(tilted, 's')).transform).toEqual([{ rotate: '-1.5deg' }]);

    const flatOne = render(<Sticker testID="s" style={{ width: 100, height: 50 }} />);
    expect(flat(host(flatOne, 's')).transform).toBeUndefined();
  });

  it('gölge yalnızca ofset verilince var, albumDeep dolgulu ve ofsetli (gölge çıkartmayla birlikte döner)', () => {
    const none = render(<Sticker testID="s" />);
    expect(none.root.findAllByProps({ testID: 's-shadow' })).toHaveLength(0);

    const withShadow = render(<Sticker testID="s" tilt={8} dropOffset={{ x: 3, y: 4 }} radius={18} />);
    const shadow = flat(host(withShadow, 's-shadow'));
    expect(shadow.backgroundColor).toBe(CARD_COLORS.albumDeep);
    expect(shadow.left).toBe(3);
    expect(shadow.top).toBe(4);
    expect(shadow.borderRadius).toBe(18);
    // Gölge dış (dönen) View'un çocuğu: dönüşü miras alır.
    const outer = withShadow.root.findByProps({ testID: 's' });
    expect(outer.findAllByProps({ testID: 's-shadow' }).length).toBeGreaterThan(0);
  });

  it('yüz beyaz kesim kenarı taşır (varsayılan CARD_CUT_EDGE) ve çocukları yüzün içinde', () => {
    const tree = render(
      <Sticker testID="s">
        <Text testID="child">merhaba</Text>
      </Sticker>
    );
    const face = flat(host(tree, 's-face'));
    expect(face.borderWidth).toBe(CARD_CUT_EDGE);
    expect(face.borderColor).toBe(CARD_COLORS.paper);
    expect(tree.root.findByProps({ testID: 's-face' }).findAllByProps({ testID: 'child' }).length).toBeGreaterThan(0);
  });

  it('hiçbir View elevation/shadow*/boxShadow taşımaz (R-15 madde 1)', () => {
    const tree = render(<Sticker testID="s" tilt={8} dropOffset={{ x: 3, y: 4 }} />);
    const banned = /^(elevation|shadow.*|boxShadow|filter)$/;
    const bad: string[] = [];
    tree.root.findAll((n) => {
      for (const key of Object.keys(flat(n))) if (banned.test(key)) bad.push(key);
      return false;
    });
    expect(bad).toEqual([]);
  });
});

/** 4 kategori x 3 emoji seçim ızgarası (Ekran 2). */
import { act, create } from 'react-test-renderer';

import { CategoryPicker } from '@/components/category-picker';

describe('CategoryPicker', () => {
  it('12 seçenek de (4 kategori x 3 emoji) sabit sırayla render edilir', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CategoryPicker selection={{}} onSelect={() => {}} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    // Sıra: hareket → uyku → harcama → sosyal (docs/ux/emoji-seti.md).
    const movementIdx = json.indexOf('🐢');
    const sleepIdx = json.indexOf('😪');
    const spendingIdx = json.indexOf('🐷');
    const socialIdx = json.indexOf('👤');
    expect(movementIdx).toBeGreaterThan(-1);
    expect(movementIdx).toBeLessThan(sleepIdx);
    expect(sleepIdx).toBeLessThan(spendingIdx);
    expect(spendingIdx).toBeLessThan(socialIdx);
  });

  it('bir emojiye dokunma onSelect\'i doğru kategori/değerle çağırır', () => {
    const onSelect = jest.fn();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CategoryPicker selection={{}} onSelect={onSelect} />);
    });
    const option = tree!.root.findByProps({ testID: 'category-sleep-3' });
    act(() => {
      option.props.onPress();
    });
    expect(onSelect).toHaveBeenCalledWith('sleep', 3);
  });

  it('seçili seçenek accessibilityState.selected: true taşır', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CategoryPicker selection={{ movement: 2 }} onSelect={() => {}} />);
    });
    const selected = tree!.root.findByProps({ testID: 'category-movement-2' });
    const unselected = tree!.root.findByProps({ testID: 'category-movement-1' });
    expect(selected.props.accessibilityState.selected).toBe(true);
    expect(unselected.props.accessibilityState.selected).toBe(false);
  });
});

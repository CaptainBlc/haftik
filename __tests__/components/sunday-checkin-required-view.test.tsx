/** Ara ekran "Bugünü de ekleyelim" (K3, `docs/ux/pazar-akisi.md`). */
import { act, create } from 'react-test-renderer';

import { SundayCheckinRequiredView } from '@/components/sunday-checkin-required-view';

describe('SundayCheckinRequiredView', () => {
  it('başlık ve gövde metnini çizer', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<SundayCheckinRequiredView onMarkToday={() => {}} onBack={() => {}} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('bugünü de ekleyelim');
    expect(json).toContain('eksik sayılır');
  });

  it('"Bugünü işaretle" dokunması onMarkToday\'i çağırır', () => {
    const onMarkToday = jest.fn();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<SundayCheckinRequiredView onMarkToday={onMarkToday} onBack={() => {}} />);
    });
    const button = tree!.root.findByProps({ testID: 'mark-today-button' });
    act(() => {
      button.props.onPress();
    });
    expect(onMarkToday).toHaveBeenCalledTimes(1);
  });

  it('"Geri" dokunması onBack\'i çağırır', () => {
    const onBack = jest.fn();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<SundayCheckinRequiredView onMarkToday={() => {}} onBack={onBack} />);
    });
    const back = tree!.root.findByProps({ testID: 'sunday-required-back' });
    act(() => {
      back.props.onPress();
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

/** T2, kaçırılan hafta yolu — Hafta ekranı banner'ı (18-ux-akislar-v2.md §2.7). */
import { act, create } from 'react-test-renderer';

import { MissedWeekBanner } from '@/components/missed-week-banner';

describe('MissedWeekBanner', () => {
  it('"Geçen haftanın kartı seni bekliyor" metnini çizer', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<MissedWeekBanner onPress={() => {}} />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('Geçen haftanın kartı seni bekliyor');
  });

  it('dokununca onPress çağrılır', () => {
    const onPress = jest.fn();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<MissedWeekBanner onPress={onPress} />);
    });
    const banner = tree!.root.findByProps({ testID: 'missed-week-banner' });
    act(() => {
      banner.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

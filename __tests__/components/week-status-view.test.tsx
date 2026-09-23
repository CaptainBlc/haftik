/** Hafta durumu ekranı (Ekran 3) — sunum bileşeni birleşimi. */
import { act, create } from 'react-test-renderer';

import { WeekStatusView } from '@/components/week-status-view';
import { computeWeekDots } from '@/lib/week-dots';

describe('WeekStatusView', () => {
  const dots = computeWeekDots('2026-09-21', [], '2026-09-23');

  it('headline ve caption metinlerini çizer', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <WeekStatusView
          dots={dots}
          headline="Kartın için 1 gün daha lazım."
          caption="Kartın için 1 gün daha lazım."
          unlocked={false}
          onLockedPress={() => {}}
        />
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Bu hafta');
    expect(json).toContain('Kartın için 1 gün daha lazım.');
  });

  it('7 nokta da render edilir', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <WeekStatusView
          dots={dots}
          headline="x"
          caption="y"
          unlocked={false}
          onLockedPress={() => {}}
        />
      );
    });
    // `findAll` bileşik + host katmanlarının ikisini de eşleştirebildiğinden
    // (aynı `testID` prop'unu taşıyan iç içe sarmalayıcılar), benzersiz
    // `testID` kümesinin boyutuna bakılır — 7 farklı gün.
    const dotInstances = tree!.root.findAll(
      (instance) =>
        typeof instance.props.testID === 'string' && instance.props.testID.startsWith('week-dot-')
    );
    const uniqueTestIds = new Set(dotInstances.map((instance) => instance.props.testID));
    expect(uniqueTestIds.size).toBe(7);
  });

  it('kilitli kutuya dokunma onLockedPress\'i çağırır', () => {
    const onLockedPress = jest.fn();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <WeekStatusView
          dots={dots}
          headline="x"
          caption="y"
          unlocked={false}
          onLockedPress={onLockedPress}
        />
      );
    });
    const box = tree!.root.findByProps({ testID: 'locked-card-placeholder' });
    act(() => {
      box.props.onPress();
    });
    expect(onLockedPress).toHaveBeenCalledTimes(1);
  });
});

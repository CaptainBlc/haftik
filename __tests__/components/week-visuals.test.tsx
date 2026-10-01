/** Emülatör UX B6 / B7 / B10 (Hafta ekranı görselleri). */
import { StyleSheet } from 'react-native';
import { act, create } from 'react-test-renderer';

import { LockedCardPlaceholder, placeholderSize } from '@/components/locked-card-placeholder';
import { WeekDotsRow } from '@/components/week-dots-row';
import { WeekStatusView } from '@/components/week-status-view';
import type { WeekDot } from '@/lib/week-dots';

const dots: WeekDot[] = [
  { localDate: '2026-09-21', label: 'Pzt', filled: true, isToday: false },
  { localDate: '2026-09-22', label: 'Sal', filled: false, isToday: false },
  { localDate: '2026-09-23', label: 'Çar', filled: true, isToday: true }, // bugün + dolu
  { localDate: '2026-09-24', label: 'Per', filled: false, isToday: false },
];

describe('WeekDotsRow B7: bugün dolu olunca da ayırt edilir', () => {
  function render() {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<WeekDotsRow dots={dots} />);
    });
    return tree!;
  }
  const style = (t: ReturnType<typeof create>, id: string) =>
    StyleSheet.flatten(t.root.findByProps({ testID: id }).props.style);

  it('bugünün halkası çerçeve rengi taşır, diğerleri şeffaf', () => {
    const t = render();
    expect(style(t, 'week-ring-2026-09-23').borderColor).not.toBe('transparent');
    expect(style(t, 'week-ring-2026-09-22').borderColor).toBe('transparent');
  });

  it('dolu bugün noktası hâlâ dolu çizilir (kesikli değil)', () => {
    const dot = style(render(), 'week-dot-2026-09-23');
    expect(dot.backgroundColor).toBeDefined();
    expect(dot.borderStyle).not.toBe('dashed');
  });

  it('boş bugün noktası halka + kesikli çizgiyle ayırt edilir', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <WeekDotsRow
          dots={[{ localDate: '2026-09-24', label: 'Per', filled: false, isToday: true }]}
        />
      );
    });
    expect(style(tree!, 'week-dot-2026-09-24').borderStyle).toBe('dashed');
    expect(style(tree!, 'week-ring-2026-09-24').borderColor).not.toBe('transparent');
  });

  it('erişilebilirlik etiketi gün, bugün ve doluluk bilgisini taşır', () => {
    const t = render();
    const labels = t.root
      .findAll((n) => typeof n.props.accessibilityLabel === 'string')
      .map((n) => n.props.accessibilityLabel as string);
    expect(labels).toContain('Çar, bugün, dolu');
    expect(labels).toContain('Sal, dolu değil');
  });

  it('nokta boyutu 24dp', () => {
    expect(style(render(), 'week-dot-2026-09-21').width).toBe(24);
  });
});

describe('LockedCardPlaceholder B6/B10', () => {
  it('boyut 9:16 oranını korur; kısa ekranda küçülür, büyükte 356 sınırı', () => {
    expect(placeholderSize(2000)).toEqual({ width: 200, height: 356 });
    const small = placeholderSize(600);
    expect(small.height).toBe(240);
    expect(Math.abs(small.width / small.height - 9 / 16)).toBeLessThan(0.01);
  });

  it('kilit katmanı dokunmayı engellemez', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<LockedCardPlaceholder caption="x" unlocked={false} onPress={() => {}} />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('"pointerEvents":"none"');
  });
});

describe('WeekStatusView B10', () => {
  it('içerik kaydırılabilir (ScrollView)', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <WeekStatusView
          dots={dots}
          headline="h"
          caption="c"
          unlocked={false}
          onLockedPress={() => {}}
        />
      );
    });
    expect(tree!.root.findAllByProps({ testID: 'week-scroll' }).length).toBeGreaterThan(0);
  });
});

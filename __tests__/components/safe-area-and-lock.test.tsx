/** QA YB-1 (üst güvenli alan), YB-2/B6 (kilit konumu), YB-7 (kart görüldü metni). */
import { StyleSheet } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { act, create } from 'react-test-renderer';

import { CheckinForm } from '@/components/checkin-form';
import { LockedCardPlaceholder } from '@/components/locked-card-placeholder';
import { SettingsView } from '@/components/settings-view';
import { WeekStatusView } from '@/components/week-status-view';
import type { WeekState } from '@/domain/types';
import { lockedBoxCaption, weekStatusHeadline } from '@/lib/week-status-copy';

const INSETS = { top: 52, bottom: 0, left: 0, right: 0 };

function withInsets(node: React.ReactElement) {
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(
      <SafeAreaInsetsContext.Provider value={INSETS}>{node}</SafeAreaInsetsContext.Provider>
    );
  });
  return tree!;
}

function paddingTopOf(node: { props: { style?: unknown } }): number {
  const flat = StyleSheet.flatten(node.props.style as never) as { paddingTop?: number } | undefined;
  return flat?.paddingTop ?? 0;
}

describe('YB-1: ekran içeriği durum çubuğunun altına itilir', () => {
  it('Bugün formu: üst boşluk >= inset.top (Dün düğmesi çubuğun altında kalır)', () => {
    const tree = withInsets(
      <CheckinForm
        dateLabel="24 Eylül"
        canGoToYesterday
        canGoToToday={false}
        onGoToYesterday={() => {}}
        onGoToToday={() => {}}
        selection={{}}
        onSelect={() => {}}
        onSave={() => {}}
      />
    );
    const back = tree.root.findByProps({ testID: 'date-nav-back' });
    // Dün düğmesinin atası (kök kap) üst dolgusu inset'i içerir.
    let n = back.parent;
    let max = 0;
    while (n) {
      max = Math.max(max, paddingTopOf(n));
      n = n.parent;
    }
    expect(max).toBeGreaterThanOrEqual(INSETS.top);
  });

  it('Hafta ekranı üst boşluğu >= inset.top', () => {
    const tree = withInsets(
      <WeekStatusView dots={[]} headline="h" caption="c" unlocked={false} onLockedPress={() => {}} />
    );
    const scroll = tree.root.findByProps({ testID: 'week-scroll' });
    let n = scroll.parent;
    let max = 0;
    while (n) {
      max = Math.max(max, paddingTopOf(n));
      n = n.parent;
    }
    expect(max).toBeGreaterThanOrEqual(INSETS.top);
  });

  it('Sağlayıcı yokken çökmez (üst boşluk 0)', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <WeekStatusView dots={[]} headline="h" caption="c" unlocked={false} onLockedPress={() => {}} />
      );
    });
    expect(tree).toBeDefined();
  });

  it('Ayarlar görünümü tanımlı (üst boşluk kancası import edilebilir)', () => {
    expect(SettingsView).toBeDefined();
  });
});

describe('B6/YB-2: kilit dairesi iskelet satırlarıyla örtüşmez', () => {
  it('kilit akış içinde: mutlak konumlu değil, özet pill ve damga arasında', () => {
    const tree = withInsets(<LockedCardPlaceholder caption="x" unlocked={false} onPress={() => {}} />);
    const lock = tree.root.findByProps({ testID: 'locked-card-lock' });
    expect(StyleSheet.flatten(lock.props.style).position).not.toBe('absolute');
    const siblings = lock.parent!.children.filter((c) => typeof c !== 'string');
    const idx = siblings.findIndex((c) => c === lock || (c as { props?: unknown }).props === lock.props);
    expect(idx).toBe(siblings.length - 2); // sonuncu damga, ondan önce kilit; öncesi özet pill
    expect(idx).toBeGreaterThan(2); // unvan, satırlar bloğu, pill'den sonra
  });
});

describe('YB-7: kart zaten açılmışsa metin "hazır" demez', () => {
  const s: WeekState = {
    weekStart: '2026-09-21',
    filledDays: 5,
    requiredDays: 4,
    thresholdMet: true,
    timeMet: true,
    unlocked: true,
  };
  it('kart görüldü', () => {
    expect(weekStatusHeadline(s, true)).toBe('Kartın açıldı.');
    expect(lockedBoxCaption(s, false, true)).toBe('Kartını tekrar görmek için dokun');
  });
  it('varsayılan davranış değişmedi', () => {
    expect(weekStatusHeadline(s)).toBe('Kartın hazır!');
    expect(lockedBoxCaption(s)).toBe('Kartın hazır, açmak için dokun');
  });
});

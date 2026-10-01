/** QA BLG-04 (özet kesilmesi), BLG-07 (kart ekranı yerleşimi), BLG-08 (yazı tipi ölçeği). */
import { StyleSheet, Text } from 'react-native';
import { act, create } from 'react-test-renderer';

import { CardRevealView } from '@/card/CardRevealView';
import { CardView } from '@/card/CardView';
import {
  CARD_LOGICAL_HEIGHT,
  CARD_LOGICAL_WIDTH,
  CARD_SCREEN_BOTTOM_BAR,
  CARD_SCREEN_TOP_BAR,
  CardLayout,
  SummaryTextLayout,
  computeCardDisplayScale,
} from '@/card/layout';
import { SUMMARY_VARIANTS } from '@/domain/content/tr';
import type { CardSnapshot } from '@/domain/types';

function snap(summaryText: string): CardSnapshot {
  return {
    weekStart: '2026-09-21',
    checkinDays: 5,
    title: { id: 't', text: 'Enerji Canavarı', basedOnCategories: ['movement'] },
    lines: {
      movement: { id: 'line.movement.high.1', text: 'Bu hafta hiç durmadın.' },
      sleep: { id: 'line.sleep.medium.2', text: 'İdare eden bir uyku haftası.' },
      spending: { id: 'line.spending.low.1', text: 'Cüzdanına iyi davrandın.' },
      social: { id: 'line.social.medium.3', text: 'Ne fazla ne az, tam kıvamında.' },
    },
    deltas: { movement: 1, sleep: 0, spending: null, social: -1 },
    summary: { id: 's', text: summaryText },
    contentVersion: 1,
  };
}

const allSummaries = Object.values(SUMMARY_VARIANTS).flat();
const longest = allSummaries.reduce((a, b) => (b.text.length > a.text.length ? b : a));

describe('BLG-04: özet alanı 2 satırı kesmeden taşır', () => {
  it('summaryHeight = 2 x satır yüksekliği + pill dolgusu için yeterli', () => {
    const needed =
      SummaryTextLayout.maxLines * SummaryTextLayout.lineHeight +
      2 * SummaryTextLayout.pillPaddingVertical;
    expect(CardLayout.summaryHeight).toBeGreaterThanOrEqual(needed);
  });

  it('toplam yükseklik hâlâ tam 640 (sabit 360x640 yerleşim bozulmadı)', () => {
    const total =
      CardLayout.topSpacer +
      CardLayout.titleHeight +
      CardLayout.gapAfterTitle +
      CardLayout.lineRowHeight * 4 +
      CardLayout.gapAfterLines +
      CardLayout.summaryHeight +
      CardLayout.gapAfterSummary +
      CardLayout.stampHeight +
      CardLayout.bottomSpacer;
    expect(total).toBe(CARD_LOGICAL_HEIGHT);
  });

  it('en uzun özet metni: 2 satır sınırı ve açık satır yüksekliği ile çizilir', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardView snapshot={snap(longest.text)} />);
    });
    const summary = tree!.root.findByProps({ testID: 'card-summary' });
    const text = summary.findAllByType(Text)[0];
    expect(text.props.numberOfLines).toBe(2);
    expect(StyleSheet.flatten(text.props.style).lineHeight).toBe(SummaryTextLayout.lineHeight);
    expect(text.props.children).toBe(longest.text);
    // 264px metin genişliği, 16px italik: satır başına ~35 karakter; 2 satır >= metin.
    expect(longest.text.length).toBeLessThanOrEqual(2 * 32);
  });

  it('özet sarmalayıcı yüksekliği summaryHeight', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardView snapshot={snap(longest.text)} />);
    });
    const wrapper = tree!.root.findByProps({ testID: 'card-summary' });
    expect(StyleSheet.flatten(wrapper.props.style).height).toBe(CardLayout.summaryHeight);
  });
});

describe('BLG-08: kart metinleri sistem yazı tipi ölçeğinden bağımsız', () => {
  it('kartın TÜM Text düğümleri allowFontScaling={false}', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardView snapshot={snap('Bu hafta karışık geçti.')} />);
    });
    const texts = tree!.root.findAllByType(Text);
    expect(texts.length).toBeGreaterThanOrEqual(9); // unvan, 4 emoji, 4 satır, özet, damga
    for (const t of texts) {
      expect(t.props.allowFontScaling).toBe(false);
    }
  });
});

describe('BLG-07: kart ekranı yerleşimi', () => {
  it('ölçek: büyük ekranda 1, kısa ekranda küçülür ve üst/alt çubuklara yer bırakır', () => {
    expect(computeCardDisplayScale(412, 915)).toBe(1);
    const small = computeCardDisplayScale(360, 640);
    expect(small).toBeLessThan(1);
    const shownHeight = CARD_LOGICAL_HEIGHT * small;
    expect(shownHeight + CARD_SCREEN_TOP_BAR + CARD_SCREEN_BOTTOM_BAR).toBeLessThanOrEqual(640);
  });

  it('dar ekranda genişliğe de sığar', () => {
    const s = computeCardDisplayScale(300, 1000);
    expect(CARD_LOGICAL_WIDTH * s).toBeLessThanOrEqual(300);
  });

  it('Kapat üst çubukta (kartın dışında), Paylaş sabit alt çubukta; ikisi de >= 48dp', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardRevealView snapshot={snap('x')} onClose={() => {}} onShare={() => {}} />);
    });
    act(() => {
      tree!.root.findByProps({ testID: 'card-reveal-skip-overlay' }).props.onPress();
    });
    const close = StyleSheet.flatten(
      tree!.root.findByProps({ testID: 'card-reveal-close' }).props.style
    );
    expect(close.position).toBeUndefined(); // artık mutlak konumlu değil
    expect(close.width).toBeGreaterThanOrEqual(48);
    const share = StyleSheet.flatten(
      tree!.root.findByProps({ testID: 'card-reveal-share' }).props.style
    );
    expect(share.position).toBeUndefined();
    expect(share.minHeight).toBeGreaterThanOrEqual(48);
    act(() => tree!.unmount());
  });
});

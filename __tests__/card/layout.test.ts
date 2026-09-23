import { CARD_LOGICAL_HEIGHT, CardLayout } from '@/card/layout';

describe('CardLayout (docs/ux/kart-yerlesimi.md ölçüleriyle birebir)', () => {
  it('bölüm yükseklikleri toplamı tam CARD_LOGICAL_HEIGHT eder', () => {
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
});

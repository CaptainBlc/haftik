/**
 * S16a (A14, 19 §3.1): seviye kelimeleri miktar/yoğunluk söyler, kalite/damga söylemez.
 */
import { CATEGORY_LEVEL_LABELS_TR } from '@/constants/emoji';

describe('CATEGORY_LEVEL_LABELS_TR (A14)', () => {
  it('uyku: kısa / orta / uzun (kötü/idare/iyi değil)', () => {
    expect(CATEGORY_LEVEL_LABELS_TR.sleep).toEqual({ 1: 'kısa', 2: 'orta', 3: 'uzun' });
  });

  it('sosyal: sakin / orta / kalabalık (yalnız/ölçülü değil)', () => {
    expect(CATEGORY_LEVEL_LABELS_TR.social).toEqual({ 1: 'sakin', 2: 'orta', 3: 'kalabalık' });
  });

  it('hareket ve harcama değişmedi', () => {
    expect(CATEGORY_LEVEL_LABELS_TR.movement).toEqual({ 1: 'durgun', 2: 'hafif', 3: 'yoğun' });
    expect(CATEGORY_LEVEL_LABELS_TR.spending).toEqual({ 1: 'az', 2: 'orta', 3: 'çok' });
  });

  it('hiçbir etiket kalite/damga sözcüğü taşımaz (kötü, iyi, idare, yalnız, ölçülü)', () => {
    const all = Object.values(CATEGORY_LEVEL_LABELS_TR).flatMap((l) => Object.values(l));
    for (const bad of ['kötü', 'iyi', 'idare', 'yalnız', 'ölçülü']) {
      expect(all).not.toContain(bad);
    }
  });
});

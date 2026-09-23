/**
 * Kart mantıksal/çıktı boyutları ve bölüm ölçüleri
 * (`docs/ux/kart-yerlesimi.md` "Genel yerleşim" + "Bölüm bölüm ölçüler",
 * birebir). Tek kaynak: `CardView.tsx` ve `capture.ts` bu dosyayı okur.
 *
 * Tüm ölçüler mantıksal 360x640 birimindedir; çıktı PNG x3 (1080x1920)
 * ölçeklenir (kart-yerlesimi.md satır 6-7).
 */

export const CARD_LOGICAL_WIDTH = 360;
export const CARD_LOGICAL_HEIGHT = 640;
export const CARD_OUTPUT_WIDTH = 1080;
export const CARD_OUTPUT_HEIGHT = 1920;

/**
 * Bölüm yükseklikleri (`kart-yerlesimi.md` tablosu). Toplamı tam
 * `CARD_LOGICAL_HEIGHT` eder: 48+92+24+(4×72)+40+48+40+40+20 = 640
 * (bkz. `__tests__/card/layout.test.ts`).
 */
export const CardLayout = {
  /** y 0-48: üst boşluk. */
  topSpacer: 48,
  /** y 48-140 (92px): unvan. */
  titleHeight: 92,
  /** y 140-164 (24px): ayraç boşluk. */
  gapAfterTitle: 24,
  /** y 164-452, 4×72px: kategori satırları (her biri). */
  lineRowHeight: 72,
  /** y 452-492 (40px): ayraç boşluk. */
  gapAfterLines: 40,
  /** y 492-540 (48px): özet. */
  summaryHeight: 48,
  /** y 540-580 (40px): boşluk. */
  gapAfterSummary: 40,
  /** y 580-620 (40px): damga. */
  stampHeight: 40,
  /** y 620-640 (20px): alt boşluk. */
  bottomSpacer: 20,
  /** 360 - 2×32 = 296px metin genişliği (kart-yerlesimi.md "60 karakter" notu). */
  horizontalPadding: 32,
} as const;

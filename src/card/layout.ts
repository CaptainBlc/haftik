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

/** Kart ekranı (reveal): üst çubuk (Kapat) ve alt çubuk (Paylaş) yükseklikleri, dp. */
export const CARD_SCREEN_TOP_BAR = 56;
export const CARD_SCREEN_BOTTOM_BAR = 88;
/** Durum/gezinme çubukları için tahmini pay (SafeArea ekstra güvence). */
const CARD_SCREEN_INSETS_ALLOWANCE = 56;
const CARD_SCREEN_SIDE_PADDING = 16;

/**
 * Kartın EKRANDA gösterildiği ölçek (yalnızca görünüm; PNG her zaman 360x640
 * mantıksal boyuttan yakalanır). Kart üst/alt çubuklarla çakışmasın diye kısa
 * veya dar ekranlarda küçülür, büyük ekranda 1'i geçmez (QA BLG-07).
 */
export function computeCardDisplayScale(windowWidth: number, windowHeight: number): number {
  const availableHeight =
    windowHeight - CARD_SCREEN_TOP_BAR - CARD_SCREEN_BOTTOM_BAR - CARD_SCREEN_INSETS_ALLOWANCE;
  const availableWidth = windowWidth - 2 * CARD_SCREEN_SIDE_PADDING;
  const scale = Math.min(1, availableHeight / CARD_LOGICAL_HEIGHT, availableWidth / CARD_LOGICAL_WIDTH);
  return Math.max(0.3, scale);
}

/**
 * Bölüm yükseklikleri (`kart-yerlesimi.md` tablosu). Toplamı tam
 * `CARD_LOGICAL_HEIGHT` eder: 48+92+24+(4×72)+40+56+32+40+20 = 640
 * (QA BLG-04: özet 48px iken 2 satır + pill dolgusu sığmıyor, 2. satır
 * kesiliyordu; 8px `gapAfterSummary`den alınıp özete verildi).
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
  /** y 492-548 (56px): özet (2 satır x 20px + 2 x 6px pill dolgusu = 52px sığar). */
  summaryHeight: 56,
  /** y 548-580 (32px): boşluk. */
  gapAfterSummary: 32,
  /** y 580-620 (40px): damga. */
  stampHeight: 40,
  /** y 620-640 (20px): alt boşluk. */
  bottomSpacer: 20,
  /** 360 - 2×32 = 296px metin genişliği (kart-yerlesimi.md "60 karakter" notu). */
  horizontalPadding: 32,
} as const;

/** Özet pill'inin metin ölçüleri; `summaryHeight` bunlara göre yeterli olmak ZORUNDA (test var). */
export const SummaryTextLayout = {
  fontSize: 16,
  lineHeight: 20,
  maxLines: 2,
  pillPaddingVertical: 6,
  pillPaddingHorizontal: 16,
} as const;

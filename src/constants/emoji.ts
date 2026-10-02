/**
 * Emoji seti — 4 kategori x 3 seviye (`docs/ux/emoji-seti.md`, birebir).
 * Bilerek `src/constants/` altında, `src/domain/` DEĞİL: domain katmanı
 * yalnızca 1/2/3 sayısal değerlerle çalışır (spec "Veri modeli"), emoji
 * temsili tamamen bir UI kararıdır. Kart (S7) ve check-in ekranı (S6) aynı
 * kaynağı kullanır (tek kaynak, iki yerde ayrı ikon seti yok — bkz.
 * `emoji-seti.md`).
 */
import { CATEGORIES } from '@/domain/types';
import type { Category, CategoryValue } from '@/domain/types';

export const CATEGORY_LABELS_TR: Record<Category, string> = {
  movement: 'Hareket',
  sleep: 'Uyku',
  spending: 'Harcama',
  social: 'Sosyal',
};

/** Sıra: hareket → uyku → harcama → sosyal (spec `CATEGORIES` sabitiyle birebir). */
export { CATEGORIES };

export const CATEGORY_EMOJI: Record<Category, Record<CategoryValue, string>> = {
  movement: { 1: '🐢', 2: '🚶', 3: '🏃' },
  sleep: { 1: '😪', 2: '😌', 3: '😴' },
  spending: { 1: '🐷', 2: '💳', 3: '💸' },
  social: { 1: '👤', 2: '👥', 3: '🎉' },
};

/**
 * Seviye adları (erişilebilirlik etiketi + seçili seviyenin kısa gösterimi).
 * Sıralı MİKTAR/yoğunluk anlatımı; iyi-kötü (kalite) ve kişilik/damga dili
 * taşımaz (emülatör UX B2). **S16a (A14, 19 §3.1):** uyku kötü/idare/iyi ->
 * **kısa/orta/uzun**, sosyal yalnız/ölçülü/kalabalık -> **sakin/orta/kalabalık**
 * ("yalnız" damgalayıcı, "ölçülü" normatifti); hareket (durgun/hafif/yoğun) ve
 * harcama (az/orta/çok) değişmedi. Kayıtlı değerler 1/2/3 olduğundan veri
 * etkilenmez, yalnızca görünen kelime değişir.
 */
export const CATEGORY_LEVEL_LABELS_TR: Record<Category, Record<CategoryValue, string>> = {
  movement: { 1: 'durgun', 2: 'hafif', 3: 'yoğun' },
  sleep: { 1: 'kısa', 2: 'orta', 3: 'uzun' },
  spending: { 1: 'az', 2: 'orta', 3: 'çok' },
  social: { 1: 'sakin', 2: 'orta', 3: 'kalabalık' },
};

export const CATEGORY_VALUES: readonly CategoryValue[] = [1, 2, 3];

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

export const CATEGORY_VALUES: readonly CategoryValue[] = [1, 2, 3];

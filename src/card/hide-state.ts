/**
 * Satır gizleme durumu — saf durum yönetimi (spec "MVP kapsamı" > "Satır
 * gizleme", güvenlik gereksinimi 3; `docs/ux/ekran-akisi.md` "Ekran 5 —
 * Gizleme önizleme"; `plan.md` S7b).
 *
 * Bu dosya React'a dokunmaz (UI değil, saf `Set` işlemleri) — `CardPreviewView`
 * bunu `useState<ReadonlySet<Category>>` ile birlikte kullanır. Ayrı
 * tutulmasının sebebi: varsayılan küme ve aç/kapa mantığı, bileşen render'ından
 * bağımsız olarak (Jest'te React render etmeden) test edilebilsin.
 *
 * **Varsayılan:** uyku ve harcama gizli, hareket ve sosyal açık (spec güvenlik
 * gereksinimi 3 ile birebir: "uyku ve harcama satırları paylaşımda varsayılan
 * gizli"). Kullanıcı hiç dokunmasa bile bu varsayılanla paylaşabilir.
 *
 * **Kalıcı değil:** `docs/ux/ekran-akisi.md` "Gizleme seçimleri kalıcı
 * değildir: ekrandan her çıkışta ... varsayılana sıfırlanır." Bu modül kendi
 * başına bir "sıfırlama zamanlayıcısı" tutmaz — çağıran taraf (önizleme
 * bileşeni) paylaşım tamamlandığında veya ekrandan çıkarken `defaultHiddenCategories()`
 * ile yeni bir küme kurar (bkz. `src/components/card-preview-view.tsx`).
 */
import type { Category } from '@/domain/types';

/** Spec güvenlik gereksinimi 3: uyku ve harcama varsayılan gizli. */
export const DEFAULT_HIDDEN_CATEGORIES: readonly Category[] = ['sleep', 'spending'];

/** Her çağrıda yeni, bağımsız bir `Set` döner (paylaşılan mutable referans riski olmasın diye). */
export function defaultHiddenCategories(): Set<Category> {
  return new Set(DEFAULT_HIDDEN_CATEGORIES);
}

/** Bir kategorinin göster/gizle durumunu değiştirir; girdi kümesini mutate ETMEZ, yeni bir `Set` döner. */
export function toggleHiddenCategory(
  hidden: ReadonlySet<Category>,
  category: Category
): Set<Category> {
  const next = new Set(hidden);
  if (next.has(category)) {
    next.delete(category);
  } else {
    next.add(category);
  }
  return next;
}

export function isCategoryHidden(hidden: ReadonlySet<Category>, category: Category): boolean {
  return hidden.has(category);
}

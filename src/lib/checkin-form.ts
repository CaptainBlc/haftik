/**
 * Bugün ekranının (Ekran 2) saf seçim mantığı: dört kategorinin dördü de
 * seçilmeden "Kaydet" aktif olmaz (spec "Veri modeli": "kısmi kayıt yok").
 * React/RN'e dokunmaz, doğrudan test edilebilir.
 */
import { CATEGORIES } from '@/domain/types';
import type { Category, CategoryValue, Checkin } from '@/domain/types';

/** Henüz tamamlanmamış olabilecek, ekranın o anki seçim durumu. */
export type CategorySelection = Partial<Record<Category, CategoryValue>>;

/**
 * Dört kategorinin dördü de seçili mi? (spec: "kısmi kayıt yok, dört
 * kategorinin dördü de seçilince dolu gün sayılır" — `docs/ux/ekran-akisi.md`
 * Ekran 2: "Kaydet dördü de seçilene kadar devre dışı").
 */
export function isSelectionComplete(
  selection: CategorySelection
): selection is Record<Category, CategoryValue> {
  return CATEGORIES.every((category) => selection[category] !== undefined);
}

/**
 * Tamamlanmış bir seçimi, `saveCheckin`'e verilecek `Checkin`'e çevirir.
 * Çağıran, önce `isSelectionComplete` ile tamamlandığını doğrulamalıdır
 * (tip daraltması bunu zaten zorunlu kılar).
 */
export function selectionToCheckin(
  localDate: string,
  selection: Record<Category, CategoryValue>
): Checkin {
  return {
    localDate,
    movement: selection.movement,
    sleep: selection.sleep,
    spending: selection.spending,
    social: selection.social,
  };
}

/** Var olan bir `Checkin` kaydını ekranın seçim durumuna çevirir (düzenleme). */
export function checkinToSelection(checkin: Checkin | null): CategorySelection {
  if (!checkin) {
    return {};
  }
  return {
    movement: checkin.movement,
    sleep: checkin.sleep,
    spending: checkin.spending,
    social: checkin.social,
  };
}

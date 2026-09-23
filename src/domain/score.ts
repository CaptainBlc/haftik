/**
 * Kategori ortalaması ve seviye hesaplama (spec "Hesaplama kuralları" ve S2
 * netleştirme #1). Saf TypeScript.
 */
import { dedupeByLocalDate } from './week';
import type { Category, Checkin, Level } from './types';

/**
 * Verilen check-in dizisindeki (tekilleştirilmiş) bir kategorinin ham
 * sayısal ortalamasını (1-3 skalası) döndürür. Dizi boşsa (0 dolu gün)
 * `null` döner — ortalama tanımsızdır, düşük/orta/yüksek gibi 0'a
 * yuvarlanmaz.
 */
export function computeCategoryAverage(checkins: Checkin[], category: Category): number | null {
  const deduped = dedupeByLocalDate(checkins);
  if (deduped.length === 0) {
    return null;
  }
  const sum = deduped.reduce((acc, checkin) => acc + checkin[category], 0);
  return sum / deduped.length;
}

/**
 * Eşikler `1,67` ve `2,33`'ün **kesir gösterimi değil**, `5/3` ve `7/3`
 * kesirlerinin kendisidir (1-3 aralığının üç eşit parçaya bölünmesi: spec S2
 * netleştirme #1 — KRİTİK). Literal ondalık (`1.67`/`2.33`) kullanılmaz;
 * aksi halde tam `5/3` ortalaması (ör. 3 günde `[1,2,2]`) yanlış sınıflanır.
 * Sınır dahil olduğu taraf **orta**.
 */
const LOW_MEDIUM_BOUNDARY = 5 / 3;
const MEDIUM_HIGH_BOUNDARY = 7 / 3;

/**
 * Ham sayısal ortalamadan (1-3 skalası) seviye türetir:
 * `< 5/3` -> düşük, `5/3 <= ortalama <= 7/3` -> orta, `> 7/3` -> yüksek.
 */
export function computeLevel(average: number): Level {
  if (average < LOW_MEDIUM_BOUNDARY) {
    return 'low';
  }
  if (average > MEDIUM_HIGH_BOUNDARY) {
    return 'high';
  }
  return 'medium';
}

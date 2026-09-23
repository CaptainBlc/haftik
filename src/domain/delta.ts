/**
 * Geçen haftaya göre değişim (delta) hesaplama (spec "Hesaplama kuralları"
 * ve S2 netleştirme #2, #3). Saf TypeScript.
 */
import { computeCategoryAverage } from './score';
import type { Category, Checkin, Delta } from './types';

/**
 * Fark eşiği tam `+0,5` / `-0,5` ise **sabit (0)** sayılır — spec'teki
 * "üstü" ifadesi kesin üstü demektir (S2 netleştirme #2). Karşılaştırmalar
 * bu yüzden `>` / `<` (dahil değil), `>=` / `<=` değildir.
 */
const DELTA_THRESHOLD = 0.5;

/**
 * IEEE754 toleransı: `thisWeekAvg`/`prevWeekAvg` farklı paydalı kesirler
 * olabildiğinden (bu hafta N dolu gün, geçen hafta M dolu gün, N≠M),
 * matematiksel olarak tam `±0,5` olan bir fark ikili kayan noktada
 * `0.5000000000000002` veya `0.49999999999999994` gibi temsil edilebilir
 * (örnek: `7/3 - 11/6` JS'de tam `0.5` değil, `0.5000000000000002` verir).
 * Bu epsilon, sınır karşılaştırmasını bu temsil hatasına karşı toleranslı
 * yapar. Değeri, gerçek (payda en fazla 7 olan, yani en çok haftanın 7 günü
 * dolu) iki farklı ortalama arasındaki en küçük olası farktan (>= 1/42 ≈
 * 0,0238) çok küçük tutulur ki matematiksel olarak GERÇEKTEN farklı iki
 * eşik durumu yanlışlıkla birleştirilmesin.
 */
const EPSILON = 1e-9;

/** Delta hesabı için geçen hafta en az kaç dolu gün gerekir (spec). */
const MIN_PREV_WEEK_FILLED_DAYS = 2;

/**
 * Bu haftanın ham sayısal ortalamasını (`thisWeekAvg`, 1-3 skalası; seviye
 * etiketi değil — S2 netleştirme #2) geçen haftanın (takvimsel bir önceki
 * Pazartesi-Pazar haftası, S2 netleştirme #3) aynı kategorideki ortalamasıyla
 * karşılaştırır.
 *
 * `weekly_card` tablosuna ihtiyaç duymaz: geçen haftanın check-in'leri
 * (`prevWeekCheckins`) doğrudan verilirse delta hesaplanabilir (S2
 * netleştirme #2 son madde).
 *
 * - Bu haftanın ortalaması `null` ise (bu hafta 0 dolu gün) -> `null`.
 * - Geçen hafta `< 2` dolu gün ise -> `null` ("ilk kart / karşılaştırma yok").
 * - Fark kesin `> +0,5` -> `+1`; kesin `< -0,5` -> `-1`; aksi halde (tam
 *   `±0,5` dahil) `0`.
 */
export function computeDelta(
  thisWeekAvg: number | null,
  prevWeekCheckins: Checkin[],
  category: Category
): Delta {
  if (thisWeekAvg === null) {
    return null;
  }

  if (prevWeekCheckins.length < MIN_PREV_WEEK_FILLED_DAYS) {
    return null;
  }

  const prevWeekAvg = computeCategoryAverage(prevWeekCheckins, category);
  // computeCategoryAverage yalnızca dizi boşsa null döner; uzunluk kontrolü
  // yukarıda yapıldığından ve tekilleştirme sonrası uzunluk azalabileceğinden
  // (aynı local_date tekrar ederse) burada tekrar null olabilir — bu da
  // "gerçekte < 2 tekil dolu gün" anlamına gelir, yine null dönülür.
  if (prevWeekAvg === null) {
    return null;
  }

  const uniquePrevDays = new Set(prevWeekCheckins.map((c) => c.localDate)).size;
  if (uniquePrevDays < MIN_PREV_WEEK_FILLED_DAYS) {
    return null;
  }

  const diff = thisWeekAvg - prevWeekAvg;

  if (diff > DELTA_THRESHOLD + EPSILON) {
    return 1;
  }
  if (diff < -DELTA_THRESHOLD - EPSILON) {
    return -1;
  }
  return 0;
}

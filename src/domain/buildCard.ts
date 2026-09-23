/**
 * Kartın domain birleştirmesi (spec "API sözleşmesi" > modül sınırı
 * sözleşmeleri, `plan.md` S3): `buildCard` S2'nin (`week`/`score`/`delta`)
 * ve S3'ün (`titles`/`copy`) saf fonksiyonlarını birleştirip tek bir
 * `CardSnapshot` üretir. UI/SQLite/OS import etmez, gerçek saate dokunmaz.
 *
 * **Sözleşme notu (deviation, dokümante edilmiş):** spec'in dondurduğu imza
 * yalnızca `(weekCheckins, prevWeekCheckins, prevTitleId, weekStart)`
 * alır — önceki haftanın satır/özet varyant kimliklerini taşımaz. Bu,
 * "ardışık haftada aynı varyant tekrarlanmaz" kuralının satır/özet için tam
 * uçtan uca uygulanabilmesi için yetersiz bir girdi kümesidir (unvan için
 * `prevTitleId` yeterli, ama satır/özet için karşılık gelen "önceki hafta
 * hangi varyantı seçmişti" bilgisi yok). Bu yüzden isteğe bağlı 5. bir
 * parametre (`prevVariants`) eklendi: verilmezse (`undefined`), her kategori
 * ve özet için `prevVariantId: null` varsayılır — bu, tekrar-önleme
 * mekanizmasının **çağıran taşımadığı** durumda sessizce normal (tohum
 * tabanlı) seçime düşmesi anlamına gelir (bkz. `copy.ts`), hataya değil.
 * Bu ek parametre geriye dönük uyumludur (var olan 4 argümanlı çağırıcılar
 * bozulmaz).
 *
 * **Wiring tamamlandı (S7a):** gerçek kalıcı önceki-varyant izleme artık
 * `src/card/open-card.ts`te yapılıyor — `openOrBuildCard`, `weekStart`in
 * bir önceki haftasının dondurulmuş kartını (`getCard(prevWeekStart)`)
 * okuyup satır/özet kimliklerini bu parametreye geçiriyor. Bu dosya hâlâ
 * `prevVariants` verilmezse sessizce normal seçime düşer (aşağıdaki
 * davranış değişmedi); yalnızca "kim çağırıyor" sorusu artık yanıtlı.
 */
import { CATEGORIES } from './types';
import type { Category, CardSnapshot, Checkin, Delta, Level, LineResult } from './types';
import { dedupeByLocalDate } from './week';
import { computeCategoryAverage, computeLevel } from './score';
import { computeDelta } from './delta';
import { selectTitle } from './titles';
import { selectLine, selectSummary } from './copy';
import { CONTENT_VERSION } from './content/tr';

export interface PrevCardVariants {
  /** Kategori bazında bir önceki haftanın seçtiği satır kimlikleri. */
  lines?: Partial<Record<Category, string>>;
  /** Bir önceki haftanın özet satırı kimliği. */
  summary?: string | null;
}

/**
 * Bir haftanın check-in'lerinden `CardSnapshot` üretir (spec: unvan + 4
 * satır + değişim özeti). `weekCheckins` en az bir dolu gün içermelidir;
 * 0 dolu günle çağrılması bir çağıran hatasıdır (fail-fast, sessizce
 * tanımsız/boş bir kart üretmez) — normal akışta zaten yalnızca
 * `WeekState.unlocked === true` olan haftalar için çağrılır (>= 3/4 dolu
 * gün), bu eşik domain'in başka bir katmanında (`week.ts`) zaten
 * doğrulanmıştır; burada yalnızca "tamamen boş hafta" savunmacı olarak
 * reddedilir.
 */
export function buildCard(
  weekCheckins: Checkin[],
  prevWeekCheckins: Checkin[],
  prevTitleId: string | null,
  weekStart: string,
  prevVariants?: PrevCardVariants
): CardSnapshot {
  const dedupedWeek = dedupeByLocalDate(weekCheckins);
  const checkinDays = dedupedWeek.length;
  if (checkinDays === 0) {
    throw new Error(
      'buildCard: weekCheckins en az bir dolu gün içermeli (0 dolu günle kart üretilemez).'
    );
  }

  const levels = {} as Record<Category, Level>;
  const deltas = {} as Record<Category, Delta>;
  const lines = {} as Record<Category, LineResult>;

  for (const category of CATEGORIES) {
    const average = computeCategoryAverage(dedupedWeek, category);
    if (average === null) {
      // dedupedWeek.length > 0 olduğundan computeCategoryAverage burada
      // asla null dönmez (bkz. score.ts); savunmacı, ulaşılamaması gereken dal.
      throw new Error(`buildCard: ${category} için ortalama hesaplanamadı (beklenmeyen durum).`);
    }

    const level = computeLevel(average);
    levels[category] = level;
    deltas[category] = computeDelta(average, prevWeekCheckins, category);
    lines[category] = selectLine({
      category,
      level,
      weekStart,
      prevVariantId: prevVariants?.lines?.[category] ?? null,
    });
  }

  const title = selectTitle({ levels, checkinDays, deltas, prevTitleId });
  const summary = selectSummary({
    deltas,
    weekStart,
    prevVariantId: prevVariants?.summary ?? null,
  });

  return {
    weekStart,
    checkinDays,
    title,
    lines,
    deltas,
    summary,
    contentVersion: CONTENT_VERSION,
  };
}

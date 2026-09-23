/**
 * Satır (kategori) ve özet/değişim satırı seçimi (spec "Hesaplama kuralları"
 * > "Satırlar" / "Özet/değişim satırı", `plan.md` S3). Saf TypeScript:
 * UI/SQLite/OS import etmez.
 *
 * Varyant seçimi `week_start` tabanlı **sabit tohumla** yapılır (aynı hafta
 * = aynı kart, `buildCard` iki kez çağrılsa da özdeş sonuç). Ardışık haftada
 * aynı varyant tekrarlanmaz: seçilen varyant `prevVariantId`'ye eşitse ve
 * havuzda başka varyant varsa bir sonrakine kaydırılır. Havuzda tek varyant
 * kalırsa (kaydıracak yer yok) ya da `prevVariantId` farklı bir havuzdan
 * (ör. önceki hafta farklı seviyedeydi) geliyorsa, tekrar-önleme sessizce
 * atlanır ve normal (tohum tabanlı) seçime dönülür.
 */
import { CATEGORIES } from './types';
import type { Category, Delta, Level, LineResult } from './types';
import { LINE_VARIANTS, SUMMARY_VARIANTS } from './content/tr';
import type { SummaryBucket } from './content/tr';

/**
 * FNV-1a (32-bit) — basit, bağımlılıksız, deterministik dize karması.
 * Kriptografik güç gerekmiyor; yalnızca `week_start` + bağlam dizesinden
 * havuz içinde tekrarlanabilir bir indeks türetmek için kullanılır.
 */
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Bir havuzdan, `seedKey`'den türetilen sabit tohumla bir varyant seçer.
 * Seçilen varyant `prevVariantId`'ye eşitse (yani havuz o kimliği içeriyorsa
 * ve tam o kimlik seçildiyse) ve havuzda birden fazla varyant varsa, bir
 * sonraki varyanta kaydırır (ardışık tekrar önleme). `prevVariantId` bu
 * havuza ait değilse (farklı seviye/bucket'tan geliyorsa) hiçbir etkisi
 * olmaz — sessizce normal seçime dönülür.
 */
function pickFromPool(pool: readonly LineResult[], seedKey: string, prevVariantId: string | null): LineResult {
  if (pool.length === 0) {
    throw new Error(`pickFromPool: boş metin havuzu (seedKey='${seedKey}').`);
  }

  const seed = hashString(seedKey);
  let index = seed % pool.length;
  let candidate = pool[index];

  const prevBelongsToThisPool = prevVariantId !== null && pool.some((variant) => variant.id === prevVariantId);
  if (prevBelongsToThisPool && candidate.id === prevVariantId && pool.length > 1) {
    index = (index + 1) % pool.length;
    candidate = pool[index];
  }

  return candidate;
}

export interface SelectLineParams {
  category: Category;
  level: Level;
  /** Haftanın Pazartesi tarihi, `YYYY-MM-DD` (yerel) — tohum kaynağı. */
  weekStart: string;
  /** Bir önceki haftanın bu kategori için seçtiği satır kimliği, yoksa `null`. */
  prevVariantId: string | null;
}

/**
 * Bir (kategori, seviye) çifti için, `week_start` tabanlı sabit tohumla bir
 * satır seçer (spec: aynı hafta = aynı kart; ardışık haftada aynı varyant
 * tekrarlanmaz).
 */
export function selectLine(params: SelectLineParams): LineResult {
  const { category, level, weekStart, prevVariantId } = params;
  const pool = LINE_VARIANTS[category]?.[level];
  if (!pool || pool.length === 0) {
    throw new Error(`selectLine: (${category}, ${level}) için metin havuzu boş/eksik.`);
  }
  const seedKey = `line:${weekStart}:${category}:${level}`;
  return pickFromPool(pool, seedKey, prevVariantId);
}

/**
 * Deltalardan kaba bir özet şablon türü çıkarır (spec S3 netleştirme #4:
 * içerik-özel eşikler — ör. "büyük sıçrama" — S4'e bırakıldı; burada
 * yalnızca yükselen/düşen/sabit kategori sayısına göre sınıflandırma var).
 */
export function classifySummaryBucket(deltas: Record<Category, Delta>): SummaryBucket {
  const values = CATEGORIES.map((category) => deltas[category]);
  const nullCount = values.filter((value) => value === null).length;

  if (nullCount === CATEGORIES.length) {
    return 'firstCard';
  }
  if (nullCount > 0) {
    return 'partialData';
  }

  const risingCount = values.filter((value) => value === 1).length;
  const fallingCount = values.filter((value) => value === -1).length;

  if (risingCount === 0 && fallingCount === 0) {
    return 'allStable';
  }
  if (risingCount > fallingCount) {
    return 'risingMajority';
  }
  if (fallingCount > risingCount) {
    return 'fallingMajority';
  }
  return 'balancedMixed';
}

export interface SelectSummaryParams {
  deltas: Record<Category, Delta>;
  weekStart: string;
  /** Bir önceki haftanın özet satırı kimliği, yoksa `null`. */
  prevVariantId: string | null;
}

/**
 * Değişim özet satırını seçer: önce `classifySummaryBucket` ile şablon
 * türünü belirler, sonra o türün havuzundan `week_start` tabanlı sabit
 * tohumla (ardışık hafta tekrarı önlenerek) bir varyant seçer.
 */
export function selectSummary(params: SelectSummaryParams): LineResult {
  const { deltas, weekStart, prevVariantId } = params;
  const bucket = classifySummaryBucket(deltas);
  const pool = SUMMARY_VARIANTS[bucket];
  if (!pool || pool.length === 0) {
    throw new Error(`selectSummary: '${bucket}' şablonu için metin havuzu boş/eksik.`);
  }
  const seedKey = `summary:${weekStart}:${bucket}`;
  return pickFromPool(pool, seedKey, prevVariantId);
}

/**
 * `LineResult.id` → `Level` ayrıştırması. Kimlik biçimi
 * `line.<kategori>.<seviye>.<varyant>` (bkz. `src/domain/content/tr.ts`
 * `lines()` yardımcı fonksiyonu: `` `line.${category}.${level}.${index + 1}` ``).
 *
 * **Neden burada, `content/tr.ts`'e dokunmadan:** `CardView`'in kategori
 * emoji'sini seçmesi için hangi seviyeden (`low`/`medium`/`high`) geldiğini
 * bilmesi gerekir (`docs/ux/emoji-seti.md`: her seviyenin kendi emoji'si
 * var, kart-yerleşimi örnekleri emoji ile satır metninin tonunu birebir
 * eşliyor — ör. 🚶 + "tam ortası bir tempo" = medium). Bu bilgi
 * `CardSnapshot`ta ayrı bir alan olarak YOK (`types.ts`: `LineResult` yalnızca
 * `id`+`text`), ama zaten dondurulmuş `id` string'inin biçiminde saklı.
 * Bu fonksiyon yalnızca o string'i ayrıştırır — içerik havuzunun kendisine
 * (`LINE_VARIANTS`) hiç dokunmaz, `content/tr.ts`'i import etmez; dolayısıyla
 * "CardView içeriği dondurulmuş alanlardan render eder, havuzu yeniden
 * çözümlemez" kuralını bozmaz.
 */
import type { Category, CategoryValue, Level } from '@/domain/types';

/**
 * **S19 / P-6 (21 §2e): satır kimliği biçimi DONDURULDU.** Biçim
 * `line.<kategori>.<seviye>.<varyant>`; kategori `Category`, seviye `low|medium|high`,
 * varyant 1'den başlayan tam sayı. Kimlikler `weekly_card` satırlarında kalıcıdır; biçim
 * değişirse eski kartlar okunamaz. Tek ayrıştırıcı burasıdır (`parseLineId`); biçimi
 * değiştirmek migration + yeni `CONTENT_VERSION` gerektirir (`__tests__/domain/id-format.test.ts`
 * içerik havuzunun tamamını bu ayrıştırıcıdan geçirir).
 */
const LINE_ID_PATTERN = /^line\.(movement|sleep|spending|social)\.(low|medium|high)\.([1-9][0-9]*)$/;

export interface ParsedLineId {
  category: Category;
  level: Level;
  variant: number;
}

/** Biçime uymayan kimlik için `null` döner (fırlatmaz); sert denetim isteyen `levelFromLineId` kullanır. */
export function parseLineId(id: string): ParsedLineId | null {
  const m = LINE_ID_PATTERN.exec(id);
  if (!m) return null;
  return { category: m[1] as Category, level: m[2] as Level, variant: Number(m[3]) };
}

export function levelFromLineId(id: string): Level {
  const parsed = parseLineId(id);
  if (parsed) return parsed.level;
  throw new Error(`levelFromLineId: beklenmeyen id biçimi '${id}' (level ayrıştırılamadı).`);
}

/**
 * `Level` → `CategoryValue` (1/2/3) eşlemesi. `CATEGORY_EMOJI`
 * (`src/constants/emoji.ts`) bu sayısal değerle indekslenir; hem `CardView`
 * hem de `CardPreviewView` (S7b) aynı eşlemeyi kullanır — tek kaynak.
 */
export const LEVEL_TO_VALUE: Record<Level, CategoryValue> = { low: 1, medium: 2, high: 3 };

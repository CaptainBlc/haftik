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
import type { CategoryValue, Level } from '@/domain/types';

const VALID_LEVELS: readonly Level[] = ['low', 'medium', 'high'];

export function levelFromLineId(id: string): Level {
  const level = id.split('.')[2];
  if ((VALID_LEVELS as readonly string[]).includes(level)) {
    return level as Level;
  }
  throw new Error(`levelFromLineId: beklenmeyen id biçimi '${id}' (level ayrıştırılamadı).`);
}

/**
 * `Level` → `CategoryValue` (1/2/3) eşlemesi. `CATEGORY_EMOJI`
 * (`src/constants/emoji.ts`) bu sayısal değerle indekslenir; hem `CardView`
 * hem de `CardPreviewView` (S7b) aynı eşlemeyi kullanır — tek kaynak.
 */
export const LEVEL_TO_VALUE: Record<Level, CategoryValue> = { low: 1, medium: 2, high: 3 };

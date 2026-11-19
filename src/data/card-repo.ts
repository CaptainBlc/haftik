/**
 * `weekly_card` tablosu icin repo (spec "Veri modeli" > `weekly_card`, "API
 * sozlesmesi", `plan.md` S5).
 *
 * **`saveCard` ikinci cagrisi -- KARAR: no-op** (spec S5 netlestirme #2).
 * Ayni `weekStart` icin `saveCard` ikinci kez cagrilirsa sessizce hicbir
 * sey yapmaz: var olan kayit korunur, hata firlatilmaz. Gerekce: "sonra
 * degismez" garantisini gercekten koruyan tek davranis budur.
 */
import { getDriver } from './db';
import type { CardSnapshot, Category, Delta, LineResult } from '@/domain/types';

interface WeeklyCardRow {
  week_start: string;
  checkin_days: number;
  title_id: string;
  title_text: string;
  title_based_on_categories: string;
  line_movement_id: string;
  line_movement_text: string;
  line_sleep_id: string;
  line_sleep_text: string;
  line_spending_id: string;
  line_spending_text: string;
  line_social_id: string;
  line_social_text: string;
  delta_movement: Delta;
  delta_sleep: Delta;
  delta_spending: Delta;
  delta_social: Delta;
  summary_id: string;
  summary_text: string;
  content_version: number;
  /** v4; v4 oncesi kartlarda NULL (geriye doldurma yok). */
  share_title_id: string | null;
  share_title_text: string | null;
  share_title_scope: string | null;
  share_summary_id: string | null;
  share_summary_text: string | null;
}

function shareScopeJson(c: CardSnapshot): string | null {
  const scope = (c.shareTitle ?? c.shareSummary)?.scope;
  return scope ? JSON.stringify(scope) : null;
}

const VALID_CATEGORIES: readonly string[] = ['movement', 'sleep', 'spending', 'social'];

/**
 * `share_title_scope` JSON dizisini dogrular. Gecersiz/bos ise `null`: paylasim alanlari "yok"
 * sayilir ve gizleme varken serit gosterilir -- bozuk veri HICBIR zaman unvanin gorunmesine yol
 * acmaz (guvenli yon, katı goruntu kurali `domain/share-title.ts`).
 */
function parseShareScope(raw: string | null): Category[] | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every((entry) => typeof entry === 'string' && VALID_CATEGORIES.includes(entry))
    ) {
      return parsed as Category[];
    }
  } catch {
    // bilerek yutuldu: asagida null doner
  }
  return null;
}

function rowToCardSnapshot(row: WeeklyCardRow): CardSnapshot {
  const shareScope = parseShareScope(row.share_title_scope);
  const lines: Record<Category, LineResult> = {
    movement: { id: row.line_movement_id, text: row.line_movement_text },
    sleep: { id: row.line_sleep_id, text: row.line_sleep_text },
    spending: { id: row.line_spending_id, text: row.line_spending_text },
    social: { id: row.line_social_id, text: row.line_social_text },
  };

  const deltas: Record<Category, Delta> = {
    movement: row.delta_movement,
    sleep: row.delta_sleep,
    spending: row.delta_spending,
    social: row.delta_social,
  };

  return {
    weekStart: row.week_start,
    checkinDays: row.checkin_days,
    title: {
      id: row.title_id,
      text: row.title_text,
      basedOnCategories: JSON.parse(row.title_based_on_categories) as Category[],
    },
    lines,
    deltas,
    summary: { id: row.summary_id, text: row.summary_text },
    contentVersion: row.content_version,
    // v4 oncesi kartlarda alan HIC eklenmez (undefined = "yok"): eski kartin sekli degismez.
    ...(shareScope && row.share_title_id && row.share_title_text
      ? { shareTitle: { id: row.share_title_id, text: row.share_title_text, scope: shareScope } }
      : {}),
    ...(shareScope && row.share_summary_id && row.share_summary_text
      ? { shareSummary: { id: row.share_summary_id, text: row.share_summary_text, scope: shareScope } }
      : {}),
  };
}

/** `weekStart` icin dondurulmus karti dondurur; hic yoksa `null`. */
export async function getCard(weekStart: string): Promise<CardSnapshot | null> {
  const driver = getDriver();
  const row = driver.get<WeeklyCardRow>('SELECT * FROM weekly_card WHERE week_start = ?', [
    weekStart,
  ]);
  return row ? rowToCardSnapshot(row) : null;
}

/**
 * `c.weekStart` icin bir kayit zaten varsa NO-OP (sessizce doner, var olan
 * kaydi degistirmez, hata firlatmaz -- spec S5 netlestirme #2). Yoksa yeni
 * bir satir ekler; `generated_at` burada (kalici hale getirilirken)
 * `Date.now()` ile uretilir -- `CardSnapshot`'ta bu alan yoktur (bkz.
 * `types.ts` `CardSnapshot` yorumu: "gercek zamana bagli alanlar burada
 * YOKTUR").
 */
export async function saveCard(c: CardSnapshot): Promise<void> {
  const driver = getDriver();

  const existing = driver.get('SELECT 1 FROM weekly_card WHERE week_start = ?', [c.weekStart]);
  if (existing) {
    return;
  }

  driver.run(
    `
    INSERT INTO weekly_card (
      week_start, generated_at, checkin_days,
      title_id, title_text, title_based_on_categories,
      line_movement_id, line_movement_text,
      line_sleep_id, line_sleep_text,
      line_spending_id, line_spending_text,
      line_social_id, line_social_text,
      delta_movement, delta_sleep, delta_spending, delta_social,
      summary_id, summary_text, content_version,
      share_title_id, share_title_text, share_title_scope,
      share_summary_id, share_summary_text
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      c.weekStart,
      Date.now(),
      c.checkinDays,
      c.title.id,
      c.title.text,
      JSON.stringify(c.title.basedOnCategories),
      c.lines.movement.id,
      c.lines.movement.text,
      c.lines.sleep.id,
      c.lines.sleep.text,
      c.lines.spending.id,
      c.lines.spending.text,
      c.lines.social.id,
      c.lines.social.text,
      c.deltas.movement,
      c.deltas.sleep,
      c.deltas.spending,
      c.deltas.social,
      c.summary.id,
      c.summary.text,
      c.contentVersion,
      c.shareTitle?.id ?? null,
      c.shareTitle?.text ?? null,
      // Kapsam unvan ve ozet icin ortaktir; ikisi de yoksa SQL NULL (JSON "null" degil).
      shareScopeJson(c),
      c.shareSummary?.id ?? null,
      c.shareSummary?.text ?? null,
    ]
  );
}

/**
 * Kartı zaten kaydedilmiş tüm haftaların `week_start` listesini döndürür
 * (T2, kaçırılan hafta yolu — `domain/week.ts` `findOpenableWeeks` için).
 * Yılda en fazla 52 satır (bkz. `21-mimari-ve-efor.md` §2c), tek sorgu.
 */
export async function getCardWeekStarts(): Promise<string[]> {
  const driver = getDriver();
  const rows = driver.all<{ week_start: string }>('SELECT week_start FROM weekly_card');
  return rows.map((r) => r.week_start);
}

// (2026-10-01, Kritik-1 düzeltmesi/A8) `hasAnyPriorCard` buradan kaldırıldı:
// eşik artık kartların varlığına değil check-in geçmişine bakıyor
// (`domain/week.ts` `hasQualifiedWeekBefore`), bu fonksiyon hiçbir yerden
// çağrılmıyordu. Geçmiş: `docs/kararlar/2026-10-01-cekirdekten-once-kararlar.md` A8.

/**
 * Dondurulmuş kartların üretim anları (rapor v2 gecikme kovası için; epoch ms). Yalnız `week_start` ve
 * `generated_at`; kart içeriği okunmaz.
 */
export async function getCardGeneratedTimes(): Promise<{ weekStart: string; generatedAt: number }[]> {
  const driver = getDriver();
  const rows = driver.all<{ week_start: string; generated_at: number }>(
    'SELECT week_start, generated_at FROM weekly_card'
  );
  return rows.map((r) => ({ weekStart: r.week_start, generatedAt: r.generated_at }));
}

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
}

function rowToCardSnapshot(row: WeeklyCardRow): CardSnapshot {
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
      summary_id, summary_text, content_version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    ]
  );
}

/**
 * `weekly_card` tablosu bos mu (`domain/week.ts`'in `hasAnyPriorCard`
 * girdisini beslemek icin, spec S2 netlestirme #4 / #6: domain SQLite'a
 * dokunmaz, bu bilgiyi disaridan alir).
 */
export async function hasAnyPriorCard(): Promise<boolean> {
  const driver = getDriver();
  const row = driver.get('SELECT 1 FROM weekly_card LIMIT 1');
  return row !== undefined;
}

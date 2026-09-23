/**
 * `metric_event` tablosu icin repo (spec "Veri modeli" > `metric_event`,
 * E1/E3, `plan.md` S5, S9). Kimlik/icerik icermeyen sayac: icerik/deger/konum/cihaz
 * kimligi TASIMAZ, yalnizca sabit bir olay adi + hafta + zaman damgasi.
 *
 * **Not:** tablo + yazma/okuma burada (S5). Sayaclarin akislara baglanmasi
 * `src/metrics/track.ts`te, D7/rapor hesaplari `src/domain/metrics-calc.ts`
 * ve `src/metrics/report.ts`te (S9'da tamamlandi). Kanonik olay adi kumesi bu
 * dosyadadir; `src/metrics/events.ts` dogrulama yardimcisini saglar.
 */
import { getDriver } from './db';

/** Sabit olay adi kumesi (spec "Veri modeli" > `metric_event`). */
export type MetricEventName =
  | 'card_unlocked'
  | 'card_opened'
  | 'share_initiated'
  | 'line_hidden'
  | 'check_in_saved';

export const METRIC_EVENT_NAMES: readonly MetricEventName[] = [
  'card_unlocked',
  'card_opened',
  'share_initiated',
  'line_hidden',
  'check_in_saved',
];

export interface MetricEvent {
  id: number;
  name: MetricEventName;
  weekStart: string | null;
  at: number;
}

interface MetricEventRow {
  id: number;
  name: MetricEventName;
  week_start: string | null;
  at: number;
}

/**
 * Bir olay kaydi ekler. `weekStart` haftaya bagli olmayan olaylar icin
 * (spec: nullable) `null` verilebilir. Zaman damgasi (`at`) burada
 * `Date.now()` ile uretilir (domain katmani degil, veri katmani).
 */
export async function recordEvent(name: MetricEventName, weekStart: string | null): Promise<void> {
  // S9: sabit kume disi ad (tip sistemini asan cagri) asla yazilmaz.
  if (!METRIC_EVENT_NAMES.includes(name)) {
    throw new Error('recordEvent: bilinmeyen olay adi');
  }
  const driver = getDriver();
  driver.run('INSERT INTO metric_event (name, week_start, at) VALUES (?, ?, ?)', [
    name,
    weekStart,
    Date.now(),
  ]);
}

/** S9: `name` + `weekStart` icin en az bir kayit var mi (bir-kez-say dedupe icin). */
export async function hasEvent(name: MetricEventName, weekStart: string | null): Promise<boolean> {
  const driver = getDriver();
  const row =
    weekStart === null
      ? driver.get<{ c: number }>('SELECT COUNT(*) AS c FROM metric_event WHERE name = ? AND week_start IS NULL', [name])
      : driver.get<{ c: number }>('SELECT COUNT(*) AS c FROM metric_event WHERE name = ? AND week_start = ?', [
          name,
          weekStart,
        ]);
  return (row?.c ?? 0) > 0;
}

/** Tum olay kayitlarini `id` artan sirada dondurur (testler ve S9 rapor). */
export async function getAllEvents(): Promise<MetricEvent[]> {
  const driver = getDriver();
  const rows = driver.all<MetricEventRow>('SELECT id, name, week_start, at FROM metric_event ORDER BY id ASC');
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    weekStart: row.week_start,
    at: row.at,
  }));
}

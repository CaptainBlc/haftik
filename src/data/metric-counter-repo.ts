/**
 * `metric_counter` tablosu için repo (v3 migration, A10 kararı — bkz.
 * `migrations.ts` dosya başı yorumu ve `docs/muhendislik/veri-ve-migration.md`).
 * Eski `metric_event`'in (`metric-repo.ts`) aksine CHECK kısıtı yok; ad
 * kümesi burada TS tipiyle korunur. UPSERT sayaç: aynı (name, weekStart,
 * dim, build) için tekrar çağrı `n`'yi 1 artırır.
 *
 * **Henüz hiçbir akışa bağlanmadı.** Bu dosya yalnızca S14 "veri sağlamlığı"
 * işinin parçası olarak şemayı ve okuma/yazma sözleşmesini test eder; yeni
 * bir ölçüm olayı (ör. `album_opened`, `notif_opened`) eklenirken hangi
 * `name` değerinin kullanılacağı o dilimde (S19+) kararlaştırılır ve bu
 * dosyadaki `MetricCounterName` tipine eklenir.
 */
import { getDriver } from './db';

/**
 * Henüz kesinleşmiş bir olay sözlüğü yok (bkz. yukarıdaki not); bu yüzden
 * tip şimdilik serbest bir `string`dir. İlk gerçek kullanım eklenirken somut
 * bir union'a (`'album_opened' | 'notif_opened' | ...`) daraltılmalı.
 */
export type MetricCounterName = string;

/** Hafta/boyut/sürüm taşımayan sayaçlar için sentinel (migration'daki '' ile aynı). */
const NO_WEEK = '';
const NO_DIM = '';
const NO_BUILD = '';

export interface MetricCounterKey {
  name: MetricCounterName;
  /** Yerel hafta anahtarı (`YYYY-MM-DD`, Pazartesi). Hafta bağımsız sayaçlarda verilmez. */
  weekStart?: string | null;
  /** Kapalı bir sözlükten tek değer (ör. paylaşım biçimi, kaynak). */
  dim?: string | null;
  /** Uygulama sürüm/kol etiketi. */
  build?: string | null;
}

export interface MetricCounter {
  name: string;
  weekStart: string;
  dim: string;
  build: string;
  n: number;
}

function normalizeKey(key: MetricCounterKey): {
  name: string;
  weekStart: string;
  dim: string;
  build: string;
} {
  return {
    name: key.name,
    weekStart: key.weekStart ?? NO_WEEK,
    dim: key.dim ?? NO_DIM,
    build: key.build ?? NO_BUILD,
  };
}

/** Sayacı 1 artırır (yoksa `n=1` ile oluşturur). */
export async function incrementCounter(key: MetricCounterKey): Promise<void> {
  const { name, weekStart, dim, build } = normalizeKey(key);
  const driver = getDriver();
  driver.run(
    `INSERT INTO metric_counter (name, week_start, dim, build, n)
     VALUES (?, ?, ?, ?, 1)
     ON CONFLICT (name, week_start, dim, build) DO UPDATE SET n = n + 1`,
    [name, weekStart, dim, build]
  );
}

/** Tek bir sayacın değerini döndürür (kayıt yoksa `0`). */
export async function getCounter(key: MetricCounterKey): Promise<number> {
  const { name, weekStart, dim, build } = normalizeKey(key);
  const driver = getDriver();
  const row = driver.get<{ n: number }>(
    'SELECT n FROM metric_counter WHERE name = ? AND week_start = ? AND dim = ? AND build = ?',
    [name, weekStart, dim, build]
  );
  return row?.n ?? 0;
}

/** Testler ve gelecekteki rapor birleştirmesi için tüm sayaçları döndürür. */
export async function getAllCounters(): Promise<MetricCounter[]> {
  const driver = getDriver();
  return driver.all<MetricCounter>(
    'SELECT name, week_start AS weekStart, dim, build, n FROM metric_counter ORDER BY name, weekStart, dim, build'
  );
}

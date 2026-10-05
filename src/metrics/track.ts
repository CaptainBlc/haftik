/**
 * Olay kancaları (S9) — EN İYİ ÇABA: hiçbir hata çağıran akışa sızmaz
 * (kayıt/kart/paylaşım asla bir ölçüm hatası yüzünden bozulmaz). Sabit küme
 * dışı ad sessizce reddedilir (`false` döner, hiçbir şey yazılmaz).
 * Ağ çağrısı yok; yalnızca yerel `metric_event` tablosu.
 */
import { incrementCounter } from '@/data/metric-counter-repo';
import { hasEvent, recordEvent } from '@/data/metric-repo';

import { isCounterEvent, isMetricEventName, type MetricCounterName, type MetricEventName } from './events';

/** @returns yazıldıysa `true`. */
export async function trackEvent(name: MetricEventName, weekStart: string | null = null): Promise<boolean> {
  try {
    if (!isMetricEventName(name)) {
      return false;
    }
    await recordEvent(name, weekStart);
    return true;
  } catch {
    return false;
  }
}

/** Aynı (ad, hafta) için en fazla bir kez yazar (ör. `card_unlocked`). */
export async function trackEventOnce(name: MetricEventName, weekStart: string | null): Promise<boolean> {
  try {
    if (!isMetricEventName(name)) {
      return false;
    }
    if (await hasEvent(name, weekStart)) {
      return false;
    }
    await recordEvent(name, weekStart);
    return true;
  } catch {
    return false;
  }
}

/**
 * `metric_counter` sayacını 1 artırır (en iyi çaba, hata sızmaz). Ad + `dim` kapalı sözlükte değilse
 * (`COUNTER_DIMS`) hiçbir şey yazılmaz ve `false` döner.
 */
export async function trackCounter(
  name: MetricCounterName,
  opts: { dim: string; weekStart?: string | null }
): Promise<boolean> {
  try {
    if (!isCounterEvent(name, opts.dim)) {
      return false;
    }
    await incrementCounter({ name, dim: opts.dim, weekStart: opts.weekStart ?? null });
    return true;
  } catch {
    return false;
  }
}

/**
 * Paylaşım başlatılırken: 1 `share_initiated` + gizli satır sayısı kadar `line_hidden` (kategorisiz; eski olay
 * tablosu) + sayaçlar: `share_hidden_n` (paylaşım başına BİR kez, dim = gizli satır sayısı 0..4) ve, `defaultKept`
 * verilmişse, `share_default_kept` (dim y/n). `line_hidden` bu sürümde de yazılır: eski raporlarla ve
 * `hiddenTotal` ile geriye dönük uyum.
 */
export async function trackShareInitiated(
  weekStart: string | null,
  hiddenLineCount: number,
  defaultKept?: boolean
): Promise<void> {
  await trackEvent('share_initiated', weekStart);
  const n = Math.max(0, Math.min(4, Math.floor(hiddenLineCount) || 0));
  for (let i = 0; i < n; i++) {
    await trackEvent('line_hidden', weekStart);
  }
  await trackCounter('share_hidden_n', { dim: String(n), weekStart });
  if (defaultKept !== undefined) {
    await trackCounter('share_default_kept', { dim: defaultKept ? 'y' : 'n', weekStart });
  }
}

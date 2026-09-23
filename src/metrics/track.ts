/**
 * Olay kancaları (S9) — EN İYİ ÇABA: hiçbir hata çağıran akışa sızmaz
 * (kayıt/kart/paylaşım asla bir ölçüm hatası yüzünden bozulmaz). Sabit küme
 * dışı ad sessizce reddedilir (`false` döner, hiçbir şey yazılmaz).
 * Ağ çağrısı yok; yalnızca yerel `metric_event` tablosu.
 */
import { hasEvent, recordEvent } from '@/data/metric-repo';

import { isMetricEventName, type MetricEventName } from './events';

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

/** Paylaşım başlatılırken: 1 `share_initiated` + gizli satır sayısı kadar `line_hidden` (kategorisiz). */
export async function trackShareInitiated(weekStart: string | null, hiddenLineCount: number): Promise<void> {
  await trackEvent('share_initiated', weekStart);
  const n = Math.max(0, Math.min(4, Math.floor(hiddenLineCount) || 0));
  for (let i = 0; i < n; i++) {
    await trackEvent('line_hidden', weekStart);
  }
}

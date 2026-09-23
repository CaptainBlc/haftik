/**
 * Ölçüm hesapları (saf; spec E1 Seçenek A, E4-c, `plan.md` S9). Veri
 * katmanına/saate dokunmaz: her şey parametre olarak gelir.
 *
 * Tanımlar:
 * - **D7:** kurulum günü (`first_open_date`) = gün 1; gün 7 = kurulum günü + 6
 *   takvim günü. Gün 7'de dolu check-in varsa `yes` (henüz gün 7 bitmemiş olsa
 *   bile kesindir). Yoksa: bugün gün 7'den sonraysa `no`; bugün <= gün 7 ise
 *   `pending` ("henüz ölçülemez"). Kurulum tarihi yoksa/bozuksa `unknown`.
 * - **Paylaşım oranı paydası:** kartı görenler (`card_opened >= 1`). Kartı hiç
 *   görmeyenler paydaya girmez, ayrıca raporlanır (E4-c).
 * - **Kart açan / kurulum:** `card_opened >= 1` olan cihaz / tüm cihazlar.
 */

export interface MetricEventInput {
  name: string;
}

export type D7Status = 'yes' | 'no' | 'pending' | 'unknown';

export interface EventCounts {
  card_unlocked: number;
  card_opened: number;
  share_initiated: number;
  line_hidden: number;
  check_in_saved: number;
}

export interface DeviceMetrics {
  /** Kurulum gününden bugüne gün numarası (kurulum günü = 1); bilinmiyorsa `null`. */
  dayNumber: number | null;
  filledDays: number;
  d7: D7Status;
  counts: EventCounts;
  /** `card_opened >= 1`. */
  cardSeen: boolean;
  /** Kartı gördüyse paylaşım başlattı mı; görmediyse `null` (paydaya girmez). */
  sharedGivenSeen: boolean | null;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function utcDay(localDate: string): number {
  const [y, m, d] = localDate.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

function isValidDate(value: string | null | undefined): value is string {
  if (typeof value !== 'string' || !DATE_RE.test(value)) {
    return false;
  }
  const [y, m, d] = value.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

/** Kurulum günü = gün 1; kurulumdan sonraki gün numarası (bugün < kurulum ise `null`). */
export function dayNumber(firstOpenDate: string | null, today: string): number | null {
  if (!isValidDate(firstOpenDate) || !isValidDate(today)) {
    return null;
  }
  const n = utcDay(today) - utcDay(firstOpenDate) + 1;
  return n >= 1 ? n : null;
}

export function computeD7(
  firstOpenDate: string | null,
  checkinDates: readonly string[],
  today: string
): D7Status {
  if (!isValidDate(firstOpenDate) || !isValidDate(today)) {
    return 'unknown';
  }
  const day7 = utcDay(firstOpenDate) + 6;
  const hasDay7 = checkinDates.some((d) => isValidDate(d) && utcDay(d) === day7);
  if (hasDay7) {
    return 'yes';
  }
  return utcDay(today) > day7 ? 'no' : 'pending';
}

export function countEvents(events: readonly MetricEventInput[]): EventCounts {
  const counts: EventCounts = {
    card_unlocked: 0,
    card_opened: 0,
    share_initiated: 0,
    line_hidden: 0,
    check_in_saved: 0,
  };
  for (const e of events) {
    if (Object.prototype.hasOwnProperty.call(counts, e.name)) {
      counts[e.name as keyof EventCounts] += 1;
    }
  }
  return counts;
}

export function computeDeviceMetrics(params: {
  events: readonly MetricEventInput[];
  firstOpenDate: string | null;
  checkinDates: readonly string[];
  today: string;
}): DeviceMetrics {
  const counts = countEvents(params.events);
  const cardSeen = counts.card_opened >= 1;
  return {
    dayNumber: dayNumber(params.firstOpenDate, params.today),
    filledDays: new Set(params.checkinDates).size,
    d7: computeD7(params.firstOpenDate, params.checkinDates, params.today),
    counts,
    cardSeen,
    sharedGivenSeen: cardSeen ? counts.share_initiated >= 1 : null,
  };
}

export interface AggregateMetrics {
  installs: number;
  /** Kart açan cihaz sayısı. */
  cardOpenedUsers: number;
  /** Kart açan / kurulum; kurulum yoksa `null`. */
  cardOpenRate: number | null;
  /** Kartı hiç görmeyen cihaz sayısı (E4-c, ayrı rapor). */
  neverSawCard: number;
  /** Paylaşım oranı paydası = kartı görenler. */
  shareDenominator: number;
  sharers: number;
  /** sharers / shareDenominator; payda 0 ise `null`. */
  shareRate: number | null;
  /** D7'si ölçülebilir (`yes`/`no`) cihaz sayısı. */
  d7Measurable: number;
  d7Yes: number;
  d7Rate: number | null;
}

/** Batuhan'ın elle topladığı cihaz raporlarını birleştirir (20-30 kişilik deneme). */
export function aggregateMetrics(devices: readonly DeviceMetrics[]): AggregateMetrics {
  const installs = devices.length;
  const seen = devices.filter((d) => d.cardSeen);
  const sharers = seen.filter((d) => d.sharedGivenSeen === true).length;
  const measurable = devices.filter((d) => d.d7 === 'yes' || d.d7 === 'no');
  const d7Yes = measurable.filter((d) => d.d7 === 'yes').length;
  return {
    installs,
    cardOpenedUsers: seen.length,
    cardOpenRate: installs > 0 ? seen.length / installs : null,
    neverSawCard: installs - seen.length,
    shareDenominator: seen.length,
    sharers,
    shareRate: seen.length > 0 ? sharers / seen.length : null,
    d7Measurable: measurable.length,
    d7Yes,
    d7Rate: measurable.length > 0 ? d7Yes / measurable.length : null,
  };
}

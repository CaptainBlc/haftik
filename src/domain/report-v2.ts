/**
 * Deneme raporu v2 (S16b; `docs/inceleme-2026-09-25/27-*.md` §4.1-4.2). Saf TS:
 * veri okuma, saat ve platform YOK (hepsi parametre). Tarih, emoji, kategori adı,
 * kimlik ve epoch ASLA çıktıya girmez; yalnızca sayaçlar, haftanın SIRA numarası
 * ve gün ofsetleri.
 *
 * **Spec'ten bilinçli sapmalar (dokümante):** 27 §4.1 şemasının bir kısmı hâlâ
 * var olmayan özelliklere dayanır ve YOK: paylaşım biçimi `fmt`, kaynak `src`,
 * `switched` (biçim seçici yok), `album` (Albüm yok), `cardFeel` (kart tepkisi yok),
 * `strip` (paylaşım unvanı yok), `titleVisibleDefault` (koşullu alan: küçük hücre
 * bastırması + security-reviewer onayı bekliyor). Rapor v2 genişletmesiyle (2026-10-05)
 * GELENLER, hepsi isteğe bağlı alan (alan yok = o sürüm ölçmüyordu): `share.hiddenN`
 * (paylaşım başına gizlenen satır histogramı, `metric_counter` `share_hidden_n`),
 * `share.defaultKept` (`share_default_kept`), `notifOpened` (`notif_opened`) ve
 * `cards.lateBuckets` (türetilmiş: kartın Pazar'a göre gecikmesi, olay yok). Bütünlük
 * kuralları: 3-7 her zaman; 1 (`sum(hiddenN)==share.n`) ve yeni ikisi alan varsa.
 * `share.hiddenTotal` (eski `line_hidden` toplamı) geriye dönük uyum için kalır.
 * `perm`, `build`, `ch` (kanal, 26 R-5), `seq`, `d1d3`, `firstCardDay`, hafta tablosu
 * ve kart sayıları bugünkü veriden türetilir.
 */
import type { Checkin } from './types';
import { computeD7, dayNumber, type D7Status } from './metrics-calc';
import {
  getWeekStart,
  getWeekState,
  hasQualifiedWeekBefore,
  toLocalDateString,
} from './week';

export const REPORT_V2_VERSION = 2;

export type ReportPerm = 'granted' | 'denied' | 'unset';

export interface ReportEventInput {
  name: string;
  weekStart: string | null;
  /** Epoch ms; yalnızca gün ofseti hesabı için okunur, çıktıya girmez. */
  at: number;
}

/** `metric_counter` satırı (v3; 27 §2.3). `weekStart`/`dim` boş string = yok. */
export interface ReportCounterInput {
  name: string;
  weekStart: string;
  dim: string;
  n: number;
}

/** Dondurulmuş bir kartın üretim anı (epoch ms; yalnızca gecikme kovası için okunur, çıktıya girmez). */
export interface ReportCardInput {
  weekStart: string;
  generatedAt: number;
}

export interface ReportV2 {
  v: 2;
  build: string;
  ch: string;
  seq: number;
  day: number | null;
  perm: ReportPerm;
  d: {
    /** Kurulumun 1-3. günlerinde check-in: '1' var, '0' yok, '-' o gün henüz gelmedi. */
    d1d3: string | null;
    d7: D7Status;
    /** İlk kart açılışının kurulum gün numarası (kurulum günü = 1); açılmadıysa null. */
    firstCardDay: number | null;
  };
  cards: {
    frozen: number;
    eligibleWeeks: number;
    /**
     * Kart gecikme kovaları (27 §2.3): Pazar gününe göre [aynı gün, 1-2 gün, 3+ gün]; toplamı `frozen`.
     * Gün farkı hafta sırası gibi yalnızca bir SAYI olarak girer, tarih girmez. Alan yoksa o sürüm
     * ölçmüyordu (birleştirme betiği "bilinmiyor" sayar).
     */
    lateBuckets?: [number, number, number];
  };
  weeks: { i: number; fill: number; opened: 0 | 1; share: number }[];
  share: {
    n: number;
    hiddenTotal: number;
    /**
     * Paylaşım başına gizlenen satır sayısı histogramı (27 §2.3 `share_hidden_n`): `hiddenN[k]` = k satır
     * gizli paylaşılan paylaşım sayısı (k = 0..4). Toplamı `n` olmalı (bütünlük kuralı 1); aksi hâlde
     * rapor karışık sürümden gelmiştir (sayaç öncesi paylaşımlar) ve tabloya alınmaz.
     */
    hiddenN?: [number, number, number, number, number];
    /** Varsayılan gizleme (uyku + harcama) DEĞİŞTİRİLMEDEN yapılan paylaşım sayısı (`share_default_kept`, dim y). */
    defaultKept?: number;
  };
  /** Bildirime dokunarak açılış sayıları (`notif_opened`): kart-hazır ve günlük. Alan yoksa ölçülmüyordu. */
  notifOpened?: { card: number; daily: number };
}

export interface ReportV2Input {
  now: Date;
  build: string;
  channel: string;
  seq: number;
  perm: ReportPerm;
  firstOpenDate: string | null;
  checkins: readonly Checkin[];
  cardWeekStarts: readonly string[];
  events: readonly ReportEventInput[];
  /** Verilmezse (eski çağrılar) sayaç alanları rapora girmez; verilirse (boş dizi dahil) hepsi girer. */
  counters?: readonly ReportCounterInput[];
  /** Dondurulmuş kartların üretim anları (gecikme kovası için). Verilmezse `lateBuckets` girmez. */
  cards?: readonly ReportCardInput[];
}

function sumCounter(counters: readonly ReportCounterInput[], name: string, dim: string): number {
  return counters.filter((c) => c.name === name && c.dim === dim).reduce((sum, c) => sum + c.n, 0);
}

/** Gün farkı (b - a), `YYYY-MM-DD` yerel tarihleri; negatifse 0. Çıktıya yalnız sayı girer. */
function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.max(0, Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000));
}

function parseLocal(localDate: string): Date {
  const [y, m, d] = localDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDaysLocal(localDate: string, days: number): string {
  const date = parseLocal(localDate);
  date.setDate(date.getDate() + days);
  return toLocalDateString(date);
}

export function buildReportV2(input: ReportV2Input): ReportV2 {
  const { now, events } = input;
  const today = toLocalDateString(now);
  const checkins = Array.from(new Map(input.checkins.map((c) => [c.localDate, c])).values());
  const dates = new Set(checkins.map((c) => c.localDate));
  const day = dayNumber(input.firstOpenDate, today);

  let d1d3: string | null = null;
  if (day !== null && input.firstOpenDate) {
    d1d3 = [0, 1, 2]
      .map((k) => {
        if (day < k + 1) return '-';
        return dates.has(addDaysLocal(input.firstOpenDate as string, k)) ? '1' : '0';
      })
      .join('');
  }

  const cardOpened = events.filter((e) => e.name === 'card_opened');
  const shareEvents = events.filter((e) => e.name === 'share_initiated');
  const openedWeeks = new Set(cardOpened.map((e) => e.weekStart));

  let firstCardDay: number | null = null;
  if (cardOpened.length > 0) {
    const first = Math.min(...cardOpened.map((e) => e.at));
    firstCardDay = dayNumber(input.firstOpenDate, toLocalDateString(new Date(first)));
  }

  const weekStarts = Array.from(
    new Set(checkins.map((c) => getWeekStart(parseLocal(c.localDate))))
  ).sort();

  let eligibleWeeks = 0;
  const weeks = weekStarts.map((weekStart, index) => {
    const state = getWeekState({
      weekStart,
      now,
      checkins,
      hasQualifiedWeekBefore: hasQualifiedWeekBefore(checkins, weekStart),
    });
    if (state.unlocked) {
      eligibleWeeks += 1;
    }
    return {
      i: index + 1,
      fill: state.filledDays,
      opened: (openedWeeks.has(weekStart) ? 1 : 0) as 0 | 1,
      share: shareEvents.filter((e) => e.weekStart === weekStart).length,
    };
  });

  const cards: ReportV2['cards'] = { frozen: input.cardWeekStarts.length, eligibleWeeks };
  if (input.cards) {
    const buckets: [number, number, number] = [0, 0, 0];
    for (const card of input.cards) {
      const sunday = addDaysLocal(card.weekStart, 6);
      const late = dayDiff(sunday, toLocalDateString(new Date(card.generatedAt)));
      buckets[late === 0 ? 0 : late <= 2 ? 1 : 2] += 1;
    }
    cards.lateBuckets = buckets;
  }

  const share: ReportV2['share'] = {
    n: shareEvents.length,
    hiddenTotal: events.filter((e) => e.name === 'line_hidden').length,
  };
  const report: ReportV2 = {
    v: REPORT_V2_VERSION,
    build: input.build,
    ch: input.channel,
    seq: input.seq,
    day,
    perm: input.perm,
    d: { d1d3, d7: computeD7(input.firstOpenDate, Array.from(dates), today), firstCardDay },
    cards,
    weeks,
    share,
  };

  if (input.counters) {
    const counters = input.counters;
    share.hiddenN = [0, 1, 2, 3, 4].map((k) => sumCounter(counters, 'share_hidden_n', String(k))) as [
      number,
      number,
      number,
      number,
      number,
    ];
    share.defaultKept = sumCounter(counters, 'share_default_kept', 'y');
    report.notifOpened = {
      card: sumCounter(counters, 'notif_opened', 'card_ready'),
      daily: sumCounter(counters, 'notif_opened', 'daily'),
    };
  }
  return report;
}

/**
 * Bütünlük kuralları (27 §4.2: kural 3-7 her zaman; kural 1 `sum(hiddenN)==share.n` ve yeni kurallar alan varsa). İhlal edilen
 * kuralların adlarını döndürür; boş dizi = tutarlı. Kural 1-2 (`hiddenN`/`fmt`/`src`
 * toplamları) o alanlar eklenince gelir.
 */
export function validateReportV2(report: ReportV2): string[] {
  const violations: string[] = [];
  const openedSum = report.weeks.reduce((sum, w) => sum + w.opened, 0);
  if (report.cards.frozen > openedSum) violations.push('frozen<=sum(opened)');
  if (report.cards.frozen > report.cards.eligibleWeeks) violations.push('frozen<=eligibleWeeks');
  if (report.weeks.some((w) => w.fill < 0 || w.fill > 7)) violations.push('fill 0-7');
  if (report.d.d7 === 'yes' && !(report.day !== null && report.day >= 7)) violations.push('d7=yes => day>=7');
  if (report.share.n >= 1 && report.cards.frozen < 1) violations.push('share.n>=1 => frozen>=1');
  // Aşağıdakiler yalnız ilgili alan rapordaysa denetlenir (alan yok = o sürüm ölçmüyordu).
  if (report.share.hiddenN) {
    const hiddenSum = report.share.hiddenN.reduce((a, b) => a + b, 0);
    if (hiddenSum !== report.share.n) violations.push('sum(hiddenN)==share.n');
  }
  if (report.share.defaultKept !== undefined && report.share.defaultKept > report.share.n) {
    violations.push('defaultKept<=share.n');
  }
  if (report.cards.lateBuckets) {
    const lateSum = report.cards.lateBuckets.reduce((a, b) => a + b, 0);
    if (lateSum !== report.cards.frozen) violations.push('sum(lateBuckets)==frozen');
  }
  return violations;
}

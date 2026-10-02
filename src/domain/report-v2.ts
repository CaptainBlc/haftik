/**
 * Deneme raporu v2 (S16b; `docs/inceleme-2026-09-25/27-*.md` §4.1-4.2). Saf TS:
 * veri okuma, saat ve platform YOK (hepsi parametre). Tarih, emoji, kategori adı,
 * kimlik ve epoch ASLA çıktıya girmez; yalnızca sayaçlar, haftanın SIRA numarası
 * ve gün ofsetleri.
 *
 * **Spec'ten bilinçli sapmalar (dokümante):** 27 §4.1 şemasının bir kısmı henüz
 * var olmayan olaylara dayanır (paylaşım biçimi `fmt`, kaynak `src`, albüm,
 * `notifOpened`, `cardFeel`, `lateBuckets`, `titleVisibleDefault`, `defaultKept`,
 * `strip`, `switched`). Bu alanlar, ilgili özellikler (S19+) olay üretmeye
 * başlayınca eklenir; şimdi YOK. `share.hiddenN` (paylaşım başına gizleme
 * histogramı) için paylaşım-bazlı olay gruplaması yok: yerine toplam
 * `share.hiddenTotal` (line_hidden sayısı) var, bütünlük kuralları 1-2 bu yüzden
 * şimdilik uygulanmaz. `perm`, `build`, `ch` (kanal, 26 R-5), `seq`, `d1d3`,
 * `firstCardDay`, hafta tablosu ve kart sayıları bugünkü veriden türetilir.
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
  cards: { frozen: number; eligibleWeeks: number };
  weeks: { i: number; fill: number; opened: 0 | 1; share: number }[];
  share: { n: number; hiddenTotal: number };
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

  return {
    v: REPORT_V2_VERSION,
    build: input.build,
    ch: input.channel,
    seq: input.seq,
    day,
    perm: input.perm,
    d: { d1d3, d7: computeD7(input.firstOpenDate, Array.from(dates), today), firstCardDay },
    cards: { frozen: input.cardWeekStarts.length, eligibleWeeks },
    weeks,
    share: {
      n: shareEvents.length,
      hiddenTotal: events.filter((e) => e.name === 'line_hidden').length,
    },
  };
}

/**
 * Bütünlük kuralları (27 §4.2; yalnızca şimdi uygulanabilenler: 3-7). İhlal edilen
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
  return violations;
}

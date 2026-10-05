/**
 * Kaydet anı geri bildiriminin saf karar mantığı (S22; 18 §2.5, 19 §3.2). React/RN'e ve veriye dokunmaz.
 * Karar yalnızca gün sayısı ve zamandan türer; seviye ya da kategori verisine ASLA bakmaz
 * (`SaveFeedbackInput` bu veriyi taşımaz, tip düzeyinde sızdırma imkânsız).
 */
import {
  getSaveFeedbackText,
  type SaveFeedbackKind,
} from '@/domain/content/save-feedback-texts';
import type { Checkin, WeekState } from '@/domain/types';
import { getWeekStart, getWeekState, hasQualifiedWeekBefore } from '@/domain/week';

/** Yeni haftanın ilk kaydı, öncekinden en az bu kadar gün sonraysa "dönüş" sayılır (19 §3.2 I). */
export const RETURN_GAP_DAYS = 4;

export interface SaveFeedbackInput {
  /** Az önce kaydedilen gün, `YYYY-MM-DD`. */
  savedDate: string;
  /** Bugün, `YYYY-MM-DD`. */
  today: string;
  /** Kayıttan ÖNCE bu gün için bir kayıt var mıydı (düzenleme)? */
  wasEdit: boolean;
  /** Kart akışından (K3) "bugünü de ekle" ile gelindi mi? */
  fromK3: boolean;
  /** Kayıttan önceki tüm check-in'ler (düzenleme ise o günün eski hâli dahil). */
  historyBefore: readonly Pick<Checkin, 'localDate'>[];
  /** Kayıttan SONRAKİ tüm check-in'ler (yeni kayıt dahil), `getWeekState` için. */
  checkinsAfter: Checkin[];
  now: Date;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

export interface SaveFeedbackDecision {
  kind: SaveFeedbackKind;
  /** Kart için kalan gün (yalnız `below`/`oneLeft` metinleri kullanır). */
  remaining: number;
  weekState: WeekState;
}

export function decideSaveFeedback(input: SaveFeedbackInput): SaveFeedbackDecision {
  const { savedDate, today, wasEdit, fromK3, historyBefore, checkinsAfter, now } = input;
  const [sy, sm, sd] = savedDate.split('-').map(Number);
  const weekStart = getWeekStart(new Date(sy, sm - 1, sd, 12));
  const weekState = getWeekState({
    weekStart,
    now,
    checkins: checkinsAfter,
    hasQualifiedWeekBefore: hasQualifiedWeekBefore(checkinsAfter, weekStart),
  });
  const remaining = Math.max(0, weekState.requiredDays - weekState.filledDays);
  const decide = (kind: SaveFeedbackKind): SaveFeedbackDecision => ({ kind, remaining, weekState });

  if (fromK3) return decide('sundayK3');
  if (wasEdit) return decide('updated');
  if (savedDate !== today) return decide('yesterday');
  if (historyBefore.length === 0) return decide('first');

  // Dönüş: bu, yeni haftanın ilk kaydı ve bundan önceki en son kayıt >= 4 gün önce.
  const previous = historyBefore
    .map((c) => c.localDate)
    .filter((d) => d < savedDate)
    .sort()
    .pop();
  if (previous && weekState.filledDays === 1 && daysBetween(previous, savedDate) >= RETURN_GAP_DAYS) {
    return decide('return');
  }

  // Hafta zaman penceresi kapandıysa (Pazar 20:00 sonrası) "Pazar'da açılıyor" demek yanlış olur.
  if (weekState.timeMet) return decide('neutral');

  if (weekState.filledDays >= 7) return decide('fullWeek');
  if (weekState.filledDays === weekState.requiredDays) return decide('thresholdReached');
  if (weekState.filledDays > weekState.requiredDays) return decide('extraDay');
  if (remaining === 1) return decide('oneLeft');
  return decide('below');
}

/** Karar + cümle (UI bu işlevi çağırır). */
export function getSaveFeedback(input: SaveFeedbackInput): { kind: SaveFeedbackKind; text: string } {
  const { kind, remaining } = decideSaveFeedback(input);
  return { kind, text: getSaveFeedbackText(kind, input.savedDate, remaining) };
}


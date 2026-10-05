/**
 * Kart açılış/dondurma akışı (spec "Ana akışlar" > 3: "Kart açıldığında
 * domain katmanı haftayı hesaplar ..., sonucu `weekly_card` tablosuna
 * dondurur"; `plan.md` S7a "kart açılış akışı"). Ekran katmanının
 * (`src/app/card/[weekStart].tsx`) doğrudan çağırdığı tek fonksiyon:
 *
 * - Zaten dondurulmuş bir kart varsa (`getCard`) onu olduğu gibi döndürür
 *   (round-trip; içerik havuzu/checkin verisi sonradan değişse de bu kart
 *   asla yeniden hesaplanmaz — bkz. `__tests__/card/open-card.test.ts`
 *   "aynı hafta tekrar açılınca aynı görsel").
 * - Yoksa ve bugün bu haftanın Pazar'ıysa ve bugünün check-in'i eksikse
 *   (K3, `src/lib/card-flow.ts`), kartı ÜRETMEDEN `needsTodayCheckin`
 *   döner — hiçbir şey `saveCard` ile dondurulmaz.
 * - Aksi halde `buildCard` ile üretir, önceki haftanın kartı varsa onun
 *   unvan/satır/özet kimliklerini `prevTitleId`/`prevVariants` olarak
 *   geçirir (bkz. aşağıdaki not), `saveCard` ile dondurur ve döner.
 *
 * **`prevVariants` wiring notu (bkz. `buildCard.ts` dosya başı yorumu):**
 * `buildCard`in S3'te eklenen isteğe bağlı 5. parametresi ("Gerçek kalıcı
 * önceki-varyant izleme S5/S7'de `weekly_card` okunarak sağlanacak") burada
 * gerçek `getCard(prevWeekStart)` çağrısıyla doldurulur — bu, o dosyadaki
 * dokümante edilmiş sapmanın S7a'da kapatıldığı yerdir.
 *
 * **Güven sınırı (I-1, S9 SEC düzeltmesi):** bu fonksiyon dış kaynaklı bir
 * girdiyle (deep link `haftik://card/<Pazartesi>`) doğrudan
 * çağrılabilen tek yoldur; bu yüzden çağıran katmanın uygunluğu zaten
 * doğruladığına GÜVENMEZ. Kayıtlı kart yoksa `getWeekState(...).unlocked`
 * (dolu gün eşiği + Pazar 20:00; zaman = çağıranın verdiği `now`) burada da kontrol edilir; uygun değilse
 * `{ status: 'notReady' }` döner: `buildCard`/`saveCard` çağrılmaz (kart
 * eksik veriyle erken dondurulmaz) ve ekran
 * `card_opened` saymaz. Kayıtlı kartın yeniden açılışı bu kontrolden ÖNCE
 * döner, yani serbesttir. Sıra: kayıtlı kart -> uygunluk -> K3 (Pazar,
 * bugün boş). `buildCard` ise hâlâ eşiği kendisi doğrulamaz (saf domain).
 */
import { getCard, saveCard } from '@/data/card-repo';
import { getCheckins, getCheckinsBefore } from '@/data/checkin-repo';
import { buildCard, type PrevCardVariants } from '@/domain/buildCard';
import type { CardSnapshot } from '@/domain/types';
import { addLocalDays, getWeekState, hasQualifiedWeekBefore, toLocalDateString } from '@/domain/week';
import { needsTodayCheckinBeforeCard } from '@/lib/card-flow';
import { isValidWeekStartParam } from '@/lib/week-param';

export type OpenCardResult =
  | { status: 'needsTodayCheckin' }
  | { status: 'notReady' }
  | { status: 'ready'; card: CardSnapshot };

function prevVariantsFrom(prevCard: CardSnapshot | null): PrevCardVariants | undefined {
  if (!prevCard) {
    return undefined;
  }
  return {
    lines: {
      movement: prevCard.lines.movement.id,
      sleep: prevCard.lines.sleep.id,
      spending: prevCard.lines.spending.id,
      social: prevCard.lines.social.id,
    },
    summary: prevCard.summary.id,
  };
}

/**
 * **TB-10 (08 M-3, 2026-10-05):** `now` ZORUNLUDUR ve zamanın tek kaynağıdır. Eskiden `today: string` ve isteğe
 * bağlı `now?: Date` iki ayrı kaynaktı; `now` verilmezse `today`in gün sonu varsayılıyordu ve çağıran iki değeri
 * tutarsız verebilirdi. Şimdi bugünün yerel tarihi (K3, geçerlilik) `now`'dan türer; çağıran tek değer geçer.
 * `now`'ı isteğe bağlı yapmak tsc'de kırılır (`__tests__/card/open-card.signature.test.ts`).
 *
 * @param weekStart Haftanın Pazartesi tarihi, `YYYY-MM-DD`.
 * @param now Şimdiki an: uygunluk (Pazar 20:00), K3 (Pazar çakışması) ve `weekStart` geçerliliği buna göre.
 *   Zaten dondurulmuş bir kart varsa uygunluk ve K3 hiç okunmaz.
 */
export async function openOrBuildCard(weekStart: string, now: Date): Promise<OpenCardResult> {
  const today = toLocalDateString(now);
  // Savunma amaçlı: geçersiz/ileri tarihli hafta `saveCard`a asla ulaşmaz.
  if (!isValidWeekStartParam(weekStart, today)) {
    throw new Error('invalid weekStart');
  }
  const existing = await getCard(weekStart);
  if (existing) {
    return { status: 'ready', card: existing };
  }

  const weekEnd = addLocalDays(weekStart, 6);
  const [weekCheckins, priorCheckins] = await Promise.all([
    getCheckins(weekStart, weekEnd),
    getCheckinsBefore(weekStart),
  ]);

  const state = getWeekState({
    weekStart,
    now,
    checkins: weekCheckins,
    // Kritik-1 düzeltmesi (A8): bkz. domain/week.ts hasQualifiedWeekBefore.
    hasQualifiedWeekBefore: hasQualifiedWeekBefore(priorCheckins, weekStart),
  });
  if (!state.unlocked) {
    return { status: 'notReady' };
  }

  if (needsTodayCheckinBeforeCard({ weekStart, today, checkins: weekCheckins })) {
    return { status: 'needsTodayCheckin' };
  }

  const prevWeekStart = addLocalDays(weekStart, -7);
  const prevWeekEnd = addLocalDays(weekStart, -1);
  const [prevWeekCheckins, prevCard] = await Promise.all([
    getCheckins(prevWeekStart, prevWeekEnd),
    getCard(prevWeekStart),
  ]);

  const snapshot = buildCard(
    weekCheckins,
    prevWeekCheckins,
    prevCard?.title.id ?? null,
    weekStart,
    prevVariantsFrom(prevCard)
  );
  await saveCard(snapshot);
  return { status: 'ready', card: snapshot };
}

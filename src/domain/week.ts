/**
 * Hafta sınırları ve kart uygunluğu (spec "Veri modeli" > "Hesaplama
 * kuralları" ve S2 netleştirmeleri, `plan.md` S2). Saf TypeScript: UI/SQLite/
 * OS import etmez, saat yalnızca parametre olarak alınır.
 */
import type { Checkin, WeekState } from './types';

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * Yerel takvim tarihini `YYYY-MM-DD` biçiminde döndürür. Bilerek
 * `toISOString()` **kullanmaz**: o UTC'ye çevirir ve gece yarısına yakın
 * anlarda günü kaydırabilir (bilinen tuzak, bkz. `CLAUDE.md`).
 */
function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * `YYYY-MM-DD` yerel takvim tarihini, o günün yerel 00:00'ına karşılık gelen
 * bir `Date`'e çevirir.
 */
function parseLocalDate(localDate: string): Date {
  const [year, month, day] = localDate.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Bir tarihe yerel takvim gününe göre gün ekler/çıkarır. `setDate` kullanır
 * (milisaniye sabiti eklemez), böylece 2016 sonrası Türkiye'de DST
 * uygulanmasa da (bkz. `__tests__/domain/week.test.ts` altyapı testi) ay/yıl
 * taşmaları ve gelecekte olası saat dilimi kuralı değişiklikleri için doğru
 * davranır.
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Verilen tarihin içinde bulunduğu haftanın Pazartesi'sini yerel takvim
 * gününe göre `YYYY-MM-DD` olarak döndürür.
 *
 * **ISO-8601 hafta numarasıyla karıştırılmamalı:** bu fonksiyon yalnızca
 * Pazartesi'nin takvim tarihini döndürür, haftanın yıl içindeki sıra
 * numarasını (1-52/53) değil. Örn. `2026-01-01` (Perşembe) için ISO hafta
 * numarası "2026 W01" olsa da döndürülen Pazartesi tarihi `2025-12-29`'dur
 * (önceki takvim yılında).
 */
export function getWeekStart(date: Date): string {
  const dayOfWeek = date.getDay(); // 0 = Pazar .. 6 = Cumartesi
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  return formatLocalDate(addDays(date, diffToMonday));
}

/**
 * `checkins` dizisini `localDate` alanına göre tekilleştirir: aynı güne ait
 * birden fazla kayıt varsa dizideki **sonuncusu** kazanır (güncelleme
 * senaryosunu yansıtır). Veri katmanındaki `PRIMARY KEY (local_date)` kısıtı
 * bunu normalde zaten engeller; bu, domain katmanının savunmacı ek garantisi
 * (spec S2 netleştirme #7): domain kendi tekilleştirmesini yapar, veri
 * katmanına güvenmez.
 */
export function dedupeByLocalDate(checkins: Checkin[]): Checkin[] {
  const byDate = new Map<string, Checkin>();
  for (const checkin of checkins) {
    byDate.set(checkin.localDate, checkin);
  }
  return Array.from(byDate.values());
}

/** Pazar 20:00 (yerel) — kart açılış saati (spec "Hesaplama kuralları"). */
export const CARD_UNLOCK_HOUR = 20;

/**
 * Belirli bir haftanın (parametre olarak verilen `weekStart`) durumunu
 * hesaplar. Yalnızca "içinde bulunulan hafta" için değil, geçmiş, henüz
 * açılmamış herhangi bir hafta için de çağrılabilir (spec S2 netleştirme
 * #6) — süre sınırı yoktur, uygun ama açılmamış bir hafta aylar sonra bile
 * `unlocked: true` döner.
 *
 * Saf fonksiyondur: gerçek `Date.now()`/sistem saatine dokunmaz, yalnızca
 * `now` parametresini kullanır; aynı girdiyle çağrıldığında her zaman
 * özdeş sonucu döner.
 */
export function getWeekState(params: {
  weekStart: string;
  now: Date;
  checkins: Checkin[];
  hasAnyPriorCard: boolean;
}): WeekState {
  const { weekStart, now, checkins, hasAnyPriorCard } = params;

  // Bir sonraki Pazartesi (hariç üst sınır). YYYY-MM-DD sabit genişlikte
  // olduğundan lexicographic karşılaştırma kronolojik karşılaştırmayla
  // örtüşür; yıl/ay sınırlarını aşan haftalarda da doğru çalışır.
  const weekEndExclusive = formatLocalDate(addDays(parseLocalDate(weekStart), 7));
  const weekCheckins = checkins.filter(
    (c) => c.localDate >= weekStart && c.localDate < weekEndExclusive
  );
  const filledDays = dedupeByLocalDate(weekCheckins).length;

  const requiredDays = hasAnyPriorCard ? 4 : 3;
  const thresholdMet = filledDays >= requiredDays;

  const cardUnlockMoment = addDays(parseLocalDate(weekStart), 6); // o haftanın Pazar'ı
  cardUnlockMoment.setHours(CARD_UNLOCK_HOUR, 0, 0, 0);
  const timeMet = now.getTime() >= cardUnlockMoment.getTime();

  const unlocked = thresholdMet && timeMet;

  return { weekStart, filledDays, requiredDays, thresholdMet, timeMet, unlocked };
}

/**
 * `date`'in yerel takvim gününü `YYYY-MM-DD` biçiminde döndürür (bkz.
 * `formatLocalDate` üstündeki not — `toISOString()` kasıtlı olarak
 * kullanılmaz, gece yarısına yakın anlarda günü kaydırır). UI katmanı (S6,
 * `plan.md`) "bugün"ün tarih kimliğini bulmak için kullanır.
 *
 * **Sözleşme notu (S6, dokümante edilmiş, geriye dönük uyumlu ekleme):**
 * bu fonksiyon ve aşağıdaki `addLocalDays`, S2'de dondurulan `getWeekState`/
 * `dedupeByLocalDate`/`getWeekStart` imzalarını değiştirmez; yalnızca bu
 * dosyada zaten var olan, önceden dışa aktarılmamış yardımcı mantığı UI
 * katmanının erişebileceği şekilde dışa açar. Amaç: UI'ın kendi tarih
 * aritmetiğini (ör. "bugün"ün `YYYY-MM-DD`'si, hafta aralığının son günü)
 * ikinci kez, hataya açık biçimde yeniden yazmak yerine burada zaten
 * test edilmiş olan tek kaynağı yeniden kullanması.
 */
export function toLocalDateString(date: Date): string {
  return formatLocalDate(date);
}

/**
 * `localDate`'e (`YYYY-MM-DD`) `days` gün ekler/çıkarır, sonucu yine yerel
 * takvim günü `YYYY-MM-DD` olarak döndürür. UI katmanı (S6) hafta aralığı
 * sorguları (`weekStart` + 6 gün = o haftanın Pazar'ı) ve bugün/dün geçişleri
 * için kullanır.
 */
export function addLocalDays(localDate: string, days: number): string {
  return formatLocalDate(addDays(parseLocalDate(localDate), days));
}

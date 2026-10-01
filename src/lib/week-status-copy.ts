/**
 * Hafta durumu ekranının (Ekran 3, `docs/ux/ekran-akisi.md`) saf metin
 * seçimi. `WeekState`'ten (domain, S2) UI metnine saf bir eşleme; React/RN'e
 * dokunmaz.
 *
 * `docs/ux/ekran-akisi.md` (emülatör UX B5 sonrası güncel): başlık ve kutu
 * altı yazısı AYRI bilgi taşır, aynı cümle iki kez görünmez:
 * - başlık = ilerleme ("Kartın için X gün daha lazım." / "Kartın hazırlanıyor.")
 * - kutu altı = zaman ("Pazar 20:00'de açılıyor")
 *
 * **Dokümante edilmemiş üçüncü durum (S6 kararı):** `unlocked === true`
 * iken (kullanıcı henüz kutuya dokunmadan önce) gösterilecek metin
 * `ekran-akisi.md`de yazılı değil (doküman yalnızca "kilitli kutu"nun iki
 * alt-durumunu tanımlıyor; tam açık/dokunulmayı bekleyen an S7'nin kart
 * açılış ekranına geçiş anıdır). Burada seçilen "Kartın hazır, açmak için
 * dokun" nötr, ton kuralına uygun bir UI metnidir — spec'in dondurduğu bir
 * içerik havuzu (`content/tr.ts`) parçası DEĞİLDİR, gerektiğinde S7/UX
 * onayıyla değiştirilebilir.
 *
 * **Dördüncü durum (S7a, K3): `needsTodayCheckin`.** `docs/ux/pazar-akisi.md`
 * "Ara ekran" bölümü: kullanıcı kart açılış ekranından ("Bugünü de
 * ekleyelim") geri dönerse, kilitli kutu kilitli kalır ve altındaki metin
 * "Bugünü işaretlemeden kartın açılmaz" olarak güncellenir. Bu yalnızca
 * `unlocked === true` iken ve çağıran (`week.tsx`) K3 kontrolünü
 * (`needsTodayCheckinBeforeCard`) ayrıca çalıştırıp `true` bulduğunda
 * anlamlıdır — bu dosya kendi başına o kontrolü yapmaz (saf metin seçimi).
 */
import type { WeekState } from '@/domain/types';

/**
 * Nokta/kutu üstündeki bağımsız durum satırı.
 *
 * **Kritik-1 güvenlik ağı (2026-10-01, `docs/inceleme-2026-09-25/
 * 21-mimari-ve-efor.md` §2f):** `cardSeen` artık `thresholdMet`/`timeMet`
 * kontrollerinden ÖNCE sorulur. Bir kart zaten kaydedilmişse (`saveCard`
 * çağrıldıysa), bu o haftanın bir zamanlar `unlocked: true` olduğunun
 * kanıtıdır — `WeekState` yeniden hesaplanırken (ör. ileride başka bir
 * sapma) yanlışlıkla "daha fazla gün lazım" gibi yanıltıcı bir mesaj
 * göstermemeli. Kart varlığı, yeniden hesaplanan eşikten her zaman daha
 * güvenilir bir kanıttır.
 */
export function weekStatusHeadline(state: WeekState, cardSeen = false): string {
  if (cardSeen) {
    return 'Kartın açıldı.';
  }
  if (!state.thresholdMet) {
    const remaining = state.requiredDays - state.filledDays;
    return `Kartın için ${remaining} gün daha lazım.`;
  }
  if (!state.timeMet) {
    // Zaman bilgisi kutu altındaki yazıda (`lockedBoxCaption`), burada tekrarlanmaz.
    return 'Kartın hazırlanıyor.';
  }
  return 'Kartın hazır!';
}

/**
 * Kilitli kart kutusunun altındaki, kutuya özgü kısa metin.
 *
 * @param needsTodayCheckin K3 (bkz. dosya başı "Dördüncü durum"): `unlocked`
 *   olsa bile bugün bu haftanın Pazar'ıysa ve bugünün check-in'i eksikse
 *   `true` verilir (`needsTodayCheckinBeforeCard`, `src/lib/card-flow.ts`).
 */
export function lockedBoxCaption(
  state: WeekState,
  needsTodayCheckin = false,
  cardSeen = false
): string {
  // Kritik-1 güvenlik ağı: bkz. weekStatusHeadline dosya başı notu — kart
  // varlığı yeniden hesaplanan eşikten önce sorulur.
  if (cardSeen) {
    return 'Kartını tekrar görmek için dokun';
  }
  if (!state.thresholdMet) {
    // Kalan gün sayısı başlıkta; kutu altı yalnızca zamanı söyler (B5).
    return state.timeMet ? 'Yeterli gün dolunca açılır' : "Pazar 20:00'de açılıyor";
  }
  if (!state.timeMet) {
    return "Pazar 20:00'de açılıyor";
  }
  if (needsTodayCheckin) {
    return 'Bugünü işaretlemeden kartın açılmaz';
  }
  return 'Kartın hazır, açmak için dokun';
}

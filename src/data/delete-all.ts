/**
 * "Tum verilerimi sil" (spec "Veri modeli" > "Silme", guvenlik gereksinimi
 * 5, `plan.md` S5). Dort tabloyu bosaltir ve verilen bildirim iptal
 * kancasini cagirir.
 *
 * **Sira karari:** `cancelNotifications` once cagrilir, tablolar SONRA
 * silinir. Gerekce: iptal kancasi (S8'de gercek `expo-notifications`
 * cagrisiyla enjekte edilecek) planli bildirimleri iptal etmek icin
 * `setting.notification_ids`'e ihtiyac duyabilir; bu bilgi silinmeden once
 * cagriya erisilebilir olmali. `cancelNotifications` senkron ya da async
 * olabilir (`S8`'in kancasi async olacaktir); ikisi de `Promise.resolve`
 * ile beklenir.
 *
 * **S8 sonrası davranış:** iptal EN İYİ ÇABADIR — kanca hata fırlatsa da
 * tablolar yine silinir (hata yutulur). Çağıran (`settings.tsx`) bu
 * fonksiyonu bildirim sync kuyruğunun içinde (`runDeleteExclusive`)
 * çalıştırır; böylece eşzamanlı bir sync silmeyle iç içe geçemez ve
 * sonraki sync `onboardingDone=false` görüp kalan bildirimleri temizler.
 */
import { sweepSnapshotFiles } from '@/card/temp-cleanup';
import { deleteReportFile } from '@/metrics/report-file';

import { getDriver } from './db';

export async function deleteAllData(
  cancelNotifications: () => Promise<void> | void
): Promise<void> {
  // Bildirim iptali EN İYİ ÇABA (S8, QA B-1): kanca hata fırlatsa/reddetse
  // bile veri silme garanti tamamlanır; hata yutulur (veri loglanmaz).
  try {
    await Promise.resolve(cancelNotifications());
  } catch {
    // bilerek yutuldu
  }

  const driver = getDriver();
  // N-2: dört DELETE tek transaction'da (yarım silme olmaz). `SqlDriver`
  // arayüzü değişmedi; `exec` çoklu deyim kabul ettiğinden BEGIN/COMMIT
  // aynı çağrıda verilir. Hata olursa ROLLBACK ve hata yeniden fırlatılır.
  try {
    driver.exec(
      'BEGIN;' +
        'DELETE FROM checkin;' +
        'DELETE FROM weekly_card;' +
        'DELETE FROM setting;' +
        'DELETE FROM metric_event;' +
        'COMMIT;'
    );
  } catch (error) {
    try {
      driver.exec('ROLLBACK;');
    } catch {
      // açık transaction yoksa ROLLBACK hata verebilir; yut
    }
    throw error;
  }

  // N-1: kalan geçici deneme raporu dosyası (en iyi çaba).
  await deleteReportFile();
  // S10 I-1: kalan geçici kart PNG'leri (en iyi çaba).
  await sweepSnapshotFiles();
}

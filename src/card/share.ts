/**
 * Paylaşım (spec "API sözleşmesi" > `shareCard(fileUri: string, message?:
 * string): Promise<void>`; `plan.md` S7b). `expo-sharing` ile işletim
 * sisteminin paylaşım sayfasını (WhatsApp/Story/Galeri vb.) açar.
 *
 * **`message` sınırı (platform gerçeği):** `expo-sharing`in `shareAsync`'i,
 * RN'in kendi `Share` API'sindeki `{ url, message }` ikilisinin aksine, ayrı
 * bir "mesaj metni" parametresi almaz — yalnızca `dialogTitle` (yalnızca
 * Android + web) vardır ve bu metin hedef uygulamaya (WhatsApp vb.)
 * GÖNDERİLMEZ, yalnızca paylaşım SEÇİCİSİNİN başlık çubuğunda görünür; iOS'ta
 * expo-sharing bu alanı hiç kullanmaz (bkz. `node_modules/expo-sharing/build/
 * Sharing.types.d.ts` `SharingOptions.dialogTitle`). Sonuç: K5 (mağaza
 * bağlantısı) metninin PNG'nin YANINDA gerçek bir mesaj olarak hedefe taşınıp
 * taşınmadığı cihazsız DOĞRULANAMAZ (`docs/manual-checklist.md` cihaz maddesi).
 * `message` yine de `dialogTitle` olarak iletilir (en iyi çaba); K5 bağlantısı
 * ayrıca kartın kendi gömülü damgasında (`CARD_STAMP_TEXT`) PNG'nin içinde
 * basılıdır.
 *
 * **Geçici PNG temizliği (S16b'de DEĞİŞTİ — 04 #4, 24 §2.1):** eskiden
 * `shareAsync` döndüğünde `finally`de dosya silinirdi (S7b/E10 kararı). Ama
 * Android'de seçici bir hedef uygulamayı başlatırken kapanıp sonuç döndürdüğü
 * için promise, hedef (ör. WhatsApp) `content://` URI'sini OKUMADAN çözülebilir;
 * o anda silmek hedefe boş/eksik görsel verir. Artık dosya burada SİLİNMEZ:
 * adanmış `haftik-share/` dizininde (`share-dir.ts`) sabit adla durur; sonraki
 * yakalamada üzerine yazılır/yaşa göre süpürülür, açılışta yaşa göre süpürülür,
 * "Tüm verilerimi sil"de dizin tamamen silinir. Başarılı hedef seçiminin
 * gerçek cihazda doğrulanması (K5, WhatsApp) hâlâ gerekir.
 *
 * `expo-sharing` yalnızca yerel OS API'sidir (ağ isteği yok).
 */
import * as Sharing from 'expo-sharing';

export async function shareCard(fileUri: string, message?: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('shareCard: bu cihazda paylaşım kullanılamıyor.');
  }
  await Sharing.shareAsync(fileUri, {
    mimeType: 'image/png',
    dialogTitle: message,
  });
}

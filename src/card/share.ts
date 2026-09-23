/**
 * Paylaşım (spec "API sözleşmesi" > `shareCard(fileUri: string, message?:
 * string): Promise<void>`; `plan.md` S7b). `expo-sharing` ile işletim
 * sisteminin paylaşım sayfasını (WhatsApp/Story/Galeri vb.) açar.
 *
 * **`message` sınırı (görev talimatının açıkça belgelenmesini istediği bir
 * platform gerçeği):** `expo-sharing`in `shareAsync`'i, RN'in kendi `Share`
 * API'sindeki `{ url, message }` ikilisinin aksine, ayrı bir "mesaj metni"
 * parametresi almaz — yalnızca `dialogTitle` (yalnızca Android + web) vardır
 * ve bu metin hedef uygulamaya (WhatsApp vb.) GÖNDERİLMEZ, yalnızca
 * paylaşım SEÇİCİSİNİN başlık çubuğunda görünür; iOS'ta expo-sharing bu
 * alanı hiç kullanmaz (bkz. `node_modules/expo-sharing/build/Sharing.types.d.ts`
 * `SharingOptions.dialogTitle`: `@platform android`, `@platform web`).
 * Sonuç: K5 (mağaza bağlantısı) metninin PNG'nin YANINDA gerçek bir mesaj
 * olarak hedef uygulamaya taşınıp taşınmadığı bu ortamda (cihazsız)
 * DOĞRULANAMAZ — bu görevin karşılayamadığı bir madde olarak
 * `docs/manual-checklist.md`/`plan.md` S10-S11 cihaz kontrol listesine
 * düşülmelidir. `message` yine de `dialogTitle` olarak iletilir (en iyi
 * çaba); K5 bağlantısı ayrıca kartın kendi gömülü damgasında
 * (`CardView` > `CARD_STAMP_TEXT`) zaten PNG'nin içinde basılıdır, yani
 * bağlantı paylaşım metni taşınmasa bile görselin kendisinde vardır.
 *
 * **Geçici PNG temizliği (spec E10 açık noktası, `plan.md` S7b "paylaşılan
 * PNG'nin önbellekten temizlenme politikası"):** `captureCardPng`
 * (`react-native-view-shot`) her çağrıldığında önbellek dizininde yeni bir
 * dosya üretir; kullanıcı tetiklemedikçe bu dosyalar hiç silinmez ve
 * zamanla birikir. **Karar:** `shareAsync` TAMAMLANDIĞINDA (kullanıcı bir
 * hedef seçti VEYA paylaşım sayfasını iptal etti — ikisinde de promise
 * çözülür) bu fonksiyon geçici dosyayı `expo-file-system` ile siler.
 * Silme **en iyi çaba**dır (best-effort): dosya zaten yoksa/silinemezse
 * sessizce yutulur — kullanıcı için paylaşım zaten tamamlanmıştır, bir
 * disk temizliği hatası bu akışı bozmamalı.
 *
 * **`expo-file-system/legacy` alt-yolu bilerek kullanılıyor:** paket SDK
 * 57'de yeni bir `File`/`Directory` sınıf tabanlı API'ye geçti; ama
 * `captureCardPng` (dolayısıyla bu fonksiyonun `fileUri` parametresi) düz
 * bir `file://` string URI'sidir ve spec'in dondurduğu `shareCard(fileUri:
 * string, ...)` imzası da string alır — legacy `deleteAsync(fileUri, opts)`
 * bu string'i doğrudan kabul eder, yeni `File` sınıfına sarmaya gerek
 * bırakmaz.
 *
 * **Ağ kontrolü (CLAUDE.md "Değişmez kurallar" / spec güvenlik madde 2):**
 * `expo-sharing` ve `expo-file-system` ikisi de yalnızca yerel işletim
 * sistemi API'lerine sarmalayıcıdır (paylaşım sayfası açma, yerel dosya
 * okuma/silme); hiçbiri ağ isteği yapmaz. Bkz. `CLAUDE.md` "Bilinen
 * tuzaklar" (bu dilimde eklenen not).
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export async function shareCard(fileUri: string, message?: string): Promise<void> {
  // S10 I-1: kullanılabilirlik kontrolü de try/finally içinde; her hata
  // dalında geçici PNG silinir.
  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      throw new Error('shareCard: bu cihazda paylaşım kullanılamıyor.');
    }
    await Sharing.shareAsync(fileUri, {
      mimeType: 'image/png',
      dialogTitle: message,
    });
  } finally {
    await deleteTempCardFile(fileUri);
  }
}

async function deleteTempCardFile(fileUri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  } catch {
    // En iyi çaba temizlik (bkz. dosya başlığı); paylaşım akışını bozmaz.
  }
}

# S22 metin onayı: Kaydet anı cümleleri ve düğme etiketleri

> 2026-10-05. Taslak: copywriter metinleri (`19-metin-ve-icerik-v2.md` §3.2) kodda (`src/domain/content/save-feedback-texts.ts`).
> **Onay Batuhan'ın.** Bu cümleler kart (PNG) içeriği değil, geçici uygulama içi arayüz metnidir; "bugün", "{r} gün"
> gibi o anki duruma gönderme yapabilir, rakam serbesttir (B10). Cümleler hiçbir zaman seviye/kategori verisine bakmaz.
> Mekanik denetim: `__tests__/domain/save-feedback-texts.test.ts` (en çok 52 karakter, yasak dil, seviye/kategori sözcüğü
> yok, "Pazar 20:00" iddiası yalnız D/E/F, ardışık gün aynı varyant yok).

**Onay:** ☒ Olduğu gibi onaylıyorum · ☐ Aşağıdaki değişikliklerle onaylıyorum · ☐ Reddediyorum  (Batuhan, 2026-10-05; sohbette onaylandı)

## Düğme yuvası (sabit etiketler)

| Durum | Etiket |
|---|---|
| Kayıt yok / seçim eksik | Kaydet (seçim tamamlanana kadar pasif) |
| Kayıtlı, seçim değişmedi | ✓ Kaydedildi (pasif, bilgi) |
| Kayıtlı, seçim değişti | Güncelle |
| Kayıtlı + bekleyen geçen hafta kartı var (B8) | Geçen haftanın kartını aç |

## Kaydet sonrası ilerleme cümlesi (ipucu satırı; ekran okuyucuya aynen okunur)

`{r}` = kart için kalan gün. Aynı türde ardışık iki gün aynı varyant çıkmaz (gün numarasına göre deterministik).

| Tür | Ne zaman | Cümleler |
|---|---|---|
| A. İlk kayıt | tüm geçmişte ilk kayıt | İlk gün sayfaya yapıştı. · Başladık. Gerisi de birkaç saniye sürer. · İlk gün tamam. Albüm açıldı. |
| B. Eşik altı | kalan ≥ 2 | Bugün de tamam. Kart için {r} gün daha. · Yapıştı. Kart için {r} gün daha var. · Kaydedildi. Sayfada {r} yer daha var. · Bugün sayfaya girdi. {r} gün daha. |
| C. Eşik altı | kalan 1 | Bir gün daha, kart için yeter. · Yapıştı. Kart bir gün uzakta. · Bugün tamam. Bir gün daha yeter. |
| D. Eşik bu kayıtla doldu | Pazar 20:00 öncesi | Yeterli gün doldu. Kart Pazar 20:00'de açılıyor. · Kart için gereken gün tamam. Pazar akşamı görüşürüz. · Gereken gün doldu; kalanı senin keyfin. · Sayfa yeterince doldu. Kart Pazar akşamı hazır. |
| E. Eşik sonrası ek gün | Pazar 20:00 öncesi | Bugün de sayfada. Kart Pazar'da hazır. · Kaydedildi. Pazar 20:00'yi bekliyoruz. · Yapıştı. Kart Pazar akşamı seni bekliyor. · Bugün de eklendi. Kart Pazar 20:00'de. |
| F. Tam hafta (7/7) | Pazar 20:00 öncesi | Yedi günün yedisi de sayfada. · Bu hafta hiç boşluk kalmadı. · Tam sayfa. Kart bu akşam 20:00'de. · Sayfanın her köşesi dolu. |
| G. Aynı günün kaydı güncellendi | düzenleme | Bugünün kaydı güncellendi. · Değişiklik yapıştırıldı. · Güncellendi. Son hali geçerli. · Fikir değişti, kayıt da değişti. |
| Y. Dünün kaydı | "‹ Dün" ile | Dün de sayfada. · Dünkü yer de doldu. · Dünkü kayıt tamam. |
| H. Pazar 20:00 sonrası, kart akışına otomatik devam | K3 | Son gün de tamam. Kartın açılıyor. · Bugün de sayfada. Kartına geçiyoruz. · Yapıştı. Kart geliyor. |
| I. Dönüş | yeni haftanın ilk kaydı, öncekinden ≥ 4 gün sonra (kaç gün geçtiği yazılmaz) | Yeni sayfa, temiz başlangıç. · Hoş geldin. Yeni sayfa açık. · Bugünden devam. Sayfa yeni. |
| Yedek (kodda eklendi) | Pazar 20:00 SONRASI normal kayıt (hafta penceresi kapandı; "Pazar'da açılıyor" demek yanlış olurdu) | Kaydedildi. |

**Kodda eklenen, belgede olmayan tek şey:** "Yedek" satırı. Belgenin D/E/F cümleleri Pazar 20:00 sonrası yanlış olurdu;
bu durum için sade bir "Kaydedildi." seçtim. Değiştirmek istersen söyle.

## Kayıt hatası (X): koda alındı (2026-10-05)

"Kaydedemedik. Bir kez daha dener misin?" · "Bu sefer olmadı. Bir kez daha dener misin?" artık **ipucu satırında**
görünür (gün numarasına göre deterministik) ve ekran okuyucuya okunur; seçimler korunur, Kaydet aktif kalır, kilit hemen
açılır. **Uyarı kutusu ("Kaydedilemedi / Bugünün kaydı yapılamadı…") kaldırıldı**; S16b'nin o metni artık kullanılmıyor
(`docs/acik-isler.md`'deki "Kaydedilemedi" onay maddesi bu ekran için düştü; "Silinemedi" ve "Yüklenemedi" duruyor).
Onay kapsamı: bu belgenin X bölümü "olduğu gibi" kabul edildi; yalnız yeri (satır) bir seçimdi, geri alınabilir.

## Onay bekleyen ek metin (koda alınmadı)

| Yer | Metin | Ne zaman |
|---|---|---|
| Bugün boş durumu (ipucu satırı) | Yeni bir hafta, temiz sayfa. | Bugün boşken ve son kayıt ≥ 4 gün önceyse, "4 kategori kaldı" yerine (18 §3 tablo, kaç gün geçtiği yazılmaz) |

Bu cümle 18 numaralı UX belgesinden gelir, bu onay sayfasındaki 19 §3.2 havuzunda yoktu. Onaylarsan koda alırım.

# 25 — Gizlilik ve uyum v2 (privacy-compliance-analyst, 2026-09-28)

> Ajan dosyayı kendisi yazmadı; metin teslim raporundan bu dosyaya kaydedildi. Bölüm numaralandırması düzeltildi (eski "3" kaldırıldı).
> **Bu belge hukuki görüş değildir.** Hukuki görüşe gidecek dosyayı hazırlar. Kapsam dışı: KVKK'da veri sorumlusu unvanı, VERBİS, yurt dışı aktarım, özel nitelikli veri nitelemesi. Yer tutucular: `[iletişim e-postası]`, `[sorumlu kişi/unvan]`, `[yayıncı adı]`, `[tarih]`, `[mağaza bağlantısı]`.
> **Kanıt sınıfları:** K = kod/manifest/belge okuması · K4-rel = emülatörde release APK çıktısı (12-performans) · M = ölçülmüş ağ/cihaz kanıtı (**bu turda hâlâ yok**) · V = varsayım.
> 21/22/23/19 raporları yazıldığında albüm veri modeli, widget, paylaşım biçimi ve yeni metinler bu belgeye göre yeniden hizalanmalı (o raporlar bu ajan çalışırken henüz iskeletti).

## 0. Özet

1. 06'daki 17 boşluktan bu turda **kapanan yok**, **ilerleyen bir tane var:** 12-performans.md release APK'nın izin listesini ilk kez çıkardı (K4-rel). G1/G2/G3'ü kapatmıyor, somutlaştırıyor.
2. Release izin listesi: `INTERNET`, `ACCESS_NETWORK_STATE`, `com.google.android.c2dm.permission.RECEIVE`, `BIND_GET_INSTALL_REFERRER_SERVICE`, `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`, `VIBRATE`, ~12 satıcı rozet izni. Depolama ve `SYSTEM_ALERT_WINDOW` yok (`blockedPermissions` çalışıyor). `AD_ID` listede **yok**.
3. **İzin, veri iletimi değildir.** Google "collect" tanımı: "Transmitting data from your app off a user's device." İzinler tek başına Data Safety'yi "topluyor"a çevirmez. Ama site ve politika taslağı **"ağ isteği yapmaz"** diyor; bu söz ölçüm (M) olmadan yayınlanamaz.
4. `BIND_GET_INSTALL_REFERRER_SERVICE` `expo-application`'dan geliyor. `getInstallReferrerAsync`'i `src/` çağırmıyor (K). İzin var, okuma yok.
5. Yeni bulgu: `weekly_card` her kartın 4 satırını (gizlenecek uyku/harcama dahil) **süresiz** saklıyor (`migrations.ts:48-70`). Albüm bunu ekranda görünür kılar; politika taslağında saklama süresi ve "tek kart silme" yok.
6. Yeni bulgu: `metric_event.name` bir `CHECK (name IN (...))` kısıtı taşıyor (`migrations.ts:83-85`). `archive_opened` gibi yeni sayaç **şema göçü (v3)** ister.
7. Yeni özelliklerden Data Safety'yi değiştirebilecekler: (a) deneme raporunun genişlemesi (13 T8), (b) yerel dışa aktarma dosyası (en hassas çıktı), (c) INTERNET/FCM ölçüm sonucu.
8. Deneme raporu için öneri: **Play/App Store derlemesinde C (raporu kaldır), arkadaş APK'da açık.**
9. Politika v2 taslağı bölüm 3'te; `site/gizlilik.html`'e göre 9 düzeltme içeriyor.
10. Google Health apps formu kapalı test dahil **herkes için zorunlu**. Apple "Data Not Collected" için cihazda işlenen veri toplanmış sayılmıyor, ama cihazdan türetilip gönderilen veri ayrıca değerlendirilir (deneme raporunun durumu).
11. Mizahi metinlerde tıbbi iddia yok; 4 başlık "durum betimlemesine" yakın. Risk düşük-orta.
12. Batuhan'a 14 seçenekli soru (bölüm 7). En kritikleri: INTERNET kararı, rapor A/B/C, yayıncı adı/iletişim, hukuki görüş eşiği.

## 1. 06'nın güncel durumu

### 1.1 Boşluk tablosu

| # | Boşluk | Bugün (2026-09-28) | Kanıt |
|---|---|---|---|
| G1 | Release ağ ölçümü + merged manifest | **Kısmen:** izin listesi var (K4-rel, R8'siz APK). **Ağ ölçümü (M) yok.** R8'li ve EAS preview APK'nın manifesti okunmadı | 12 §5.5 |
| G2 | Firebase Installations/FCM davranışı | Açık. `c2dm.RECEIVE` release'te var; `google-services.json` yokluğunun Firebase'i başlatmadığı V | 12 §5.5 |
| G3 | INTERNET izni kararı | Açık | 12 §5.5 |
| G4 | Politika URL'si / uygulamada "yakında" | **Açık:** `settings-view.tsx:168` "Gizlilik politikası (yakında)", `settings.tsx:112` Alert | K |
| G5 | Politika düzeltmeleri | Açık; düzeltilmiş metin bölüm 3 | K |
| G6 | Rapor saklama/silme sözü | Açık; metin bölüm 3 ve 3.3 | - |
| G7 | Rapor için Data Safety seçeneği | Açık; bölüm 4.3 | Apple/Google tanım |
| G8 | Health apps formu | Açık; bölüm 4.2 | Google 14738291 |
| G9 | Data Safety / IARC / yaş Console'da | Açık | - |
| G10 | K10 hukuki görüş / geçici karar kaydı | Açık; `plan.md`'de yazılı karar yok | - |
| G11 | iOS yedek hariç tutma, xcprivacy, iOS temp süpürme | Açık (Apple üyeliği yok) | - |
| G12 | N-9 uygulama kilidi / FLAG_SECURE | **Ağırlığı arttı:** albüm geçmiş kartları (uyku dahil) açıkta gösterirse cihazı eline alan 3 ayın kartını görür | 13 §6 |
| G13 | N-7 placeholder sütunu | Açık; göç eklenecekse v3 numarası | K |
| G14 | 15+ rozet izni | Açık (~12 izin, release'te teyit) | 12 |
| G15 | Belge tutarsızlığı (paket adı yer tutucu) | Bu turda doğrulanmadı | - |
| G16 | Testçi Gmail listesi/WhatsApp | Açık | - |
| G17 | Bildirim başlığı kilit ekranında | Açık | - |

### 1.2 Release izinleri × Data Safety × politika

| İzin | Nereden | Kod kullanıyor mu | Data Safety etkisi | Öneri |
|---|---|---|---|---|
| `INTERNET` | Expo şablonu + `expo-file-system`, `expo-image` kütüphane manifestleri | Kodda fetch/XHR/WebSocket sıfır | Yok (izin iletim değildir); iletimin olmadığı **ölçülmeli** | Önce ölç (PCAPdroid). İzin blok kararı ölçümden sonra |
| `ACCESS_NETWORK_STATE` | Kütüphane manifesti | Çağrı yok (V) | Yok | Ölçümle birlikte bak |
| `c2dm.permission.RECEIVE` | `expo-notifications` FCM servisi | Push token çağrısı yok (`no-push.test.ts`) | **Şartlı:** FCM/Installations başlarsa "Device or other IDs" gündeme gelir | G2 ölçümüyle kapat |
| `BIND_GET_INSTALL_REFERRER_SERVICE` | `expo-application` → installreferrer 2.2 | **Hayır** | Yok | `tools:node="remove"` düşük öncelik |
| `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`, `VIBRATE` | Yerel bildirim planı | Evet | Yok | - |
| ~12 satıcı rozet izni | `expo-notifications` | Hayır | Yok | Sadeleştirme G14 |
| `AD_ID` | - | - | Listede yok | Preview/EAS APK'da tekrar kontrol |

**Sonuç:** İzin listesi "veri toplanmıyor" beyanını çürütmüyor. Beyanı **kanıtlayan** tek şey ağ ölçümü. Sıra: (1) PCAPdroid'li tam akış ölçümü, (2) temizse Data Safety "toplanmıyor" ve politika ağ cümlesi doğrulanmış olur, (3) temiz değilse bölüm 4.1'deki Firebase satırı doldurulur.

### 1.3 Yeni bulgular

| # | Bulgu | Kanıt | Risk | Kim kapatır |
|---|---|---|---|---|
| Y-1 | `weekly_card` 4 satırın tam metnini (gizlenecek dahil) + unvan + özet + delta'yı süresiz tutuyor; albüm görünür yapacak | `migrations.ts:48-70` | Orta: saklama süresi politikada yok; "tek kart silme" yok | copywriter, mobile-engineer |
| Y-2 | `metric_event` CHECK kısıtı yeni olay adını reddeder; `archive_opened` şema v3 ister | `migrations.ts:83-85`, `metric-repo.ts:18-25` | Düşük (teknik) | software-architect |
| Y-3 | `line_hidden` kategorisiz sayaç. Kategori kırılımı eklenirse davranış/çıkarım verisine dönüşür | `events.ts:7`, `track.ts:40-45` | Orta (tasarım kuralı) | data-analyst: eklenmesin |
| Y-4 | T8 (haftalık kırılım, bildirim izni durumu, ilk kart günü) rapora eklenirse 20-30 kişilik kohortta gönderen zaten bilinir | `report.ts:38-46` | Düşük-orta | data-analyst |
| Y-5 | Rapor onay iletisi saklama süresini ve alıcıyı söylemiyor | `report-confirm.ts:12-14` | Orta | copywriter + Batuhan |
| Y-6 | `deleteAllData` 4 tablo + rapor dosyası + snapshot PNG'lerini siliyor. **Yeni saklama** (albüm önbelleği, widget verisi, dışa aktarma dosyası) listeye eklenmezse "Tüm verilerimi sil" sözü yalan olur | `delete-all.ts:41-61` | Yüksek (yeni özellik şartı) | mobile-engineer (kural R-1) |
| Y-7 | Site "Toplanmayan: cihaz kimliği" (l.59): FCM/Installations ölçülmeden kesin değil | site | Orta | G2 ile |
| Y-8 | "Uyku" etiketi kararı işlendi; Health apps beyanı Console'da yapılmadı | CLAUDE.md | Orta | Batuhan |

## 2. Yeni özelliklerin veri işleme analizi

Varsayım: özellik tanımları 13-urun-vizyonu.md'den. Cihazdaki verinin "kişisel veri" olup olmadığı sorusu "geliştirici bu veriyi işliyor mu / veri sorumlusu mu" sorusuna döner (06 §7 soru 2, hukuka gidiyor); aşağıdaki sütun **yaklaşımdır**.

| Özellik | Ne saklanır | Silme kapsamı | Politika/mağaza etkisi |
|---|---|---|---|
| **Albüm / Kartlarım** | Yeni tablo gerekmez: mevcut `weekly_card` gösterilir, gizlenecek satırlar dahil. PNG kalıcı saklanırsa yeni önbellek doğar (kaçınılmalı) | "Tüm verilerimi sil" kapsar. **Tek kart / eski kartları silme yok** | Data Safety değişmez. Politikaya saklama süresi + tek kart silme; gizli satırlar açıkta ise N-9 ağırlığı artar |
| **Albüm küçük resimleri** | Kaçının: dondurulmuş veriden yeniden çiz, PNG saklama | Saklanırsa `sweepSnapshotFiles`/`deleteAllData` listesine girmek zorunda | "Geçici dosya" cümlesi artık doğru olmaz |
| **Tekrar paylaşım** | Yok (PNG geçici, `share.ts:63` `finally` siler) | Mevcut süpürme | Varsayılan gizleme (uyku/harcama) **her tekrar paylaşımda yeniden uygulanmalı** |
| **Paylaşım unvanı (V2)** | Yeni sütun; v3 göç | Aynı tablo | "Gizlediğin kategoriden türeyen hiçbir metin görselde yok" sözü kamuya açık güvence olur; seviye ipucu testi (security-reviewer) |
| **Paylaşım biçimleri (9:16, 1:1)** | Yok; aynı gizleme kuralları | Mevcut | İkinci düzen ikinci sızıntı yüzeyidir; aynı `capture` ve gizleme yolundan geçmeli |
| **Cihaz içi sayaçlar** | Ad (5 sabit), `week_start`, `at` (epoch), süresiz | `delete-all.ts:46` | **Site l.52 yanlış ("sayıları"):** gerçek: zaman damgalı olay kayıtları |
| **Deneme raporu (T8 ile genişleyen)** | Geçici `.txt`, paylaşım sonrası silinir; Batuhan'a ulaşınca Batuhan'da, **saklama süresi yazılı değil** | Cihaz: silinir. Batuhan tarafı: yazılı süreç yok | Alıcı gönderen kişiyi biliyorsa **takma adlı**; "anonim" değil. Data Safety gri alan: bölüm 4.3 |
| **Widget (v2 adayı)** | Widget durumu OS/widget deposunda: yalnızca dolu gün noktaları | **Yeni depo:** `deleteAllData` ve süpürme listesine eklenmeli | Data Safety değişmez; kilit ekranı görünürlüğü N-9 ile aynı |
| **Yerel yedek / dışa aktarma (öneri)** | Kullanıcı tetikli tek dosya (tarihler + seviyeler + kartlar). **En hassas çıktı:** tarih + uyku seviyesi birlikte | Uygulama silemez (PNG ile aynı sınıf, çok daha zengin) | Kullanıcı tetikli olduğu için "toplanmıyor" bozulmaz; politikada "yedek yok" yerine "isteğe bağlı elle dışa aktarma" |
| **"Kart" adlandırması** | Yok | - | Mağaza, bildirim ("Karnen hazır" → "Kartın hazır"), politika, silme diyaloğu, rapor başlığı tek terim olmalı |

**Kural R-1:** Yeni her kalıcı saklama (tablo, dosya, widget durumu, önbellek) aynı PR'da (a) `deleteAllData`, (b) `allowBackup=false` kapsamı, (c) politika saklama tablosu, (d) bu belgedeki envanter ile birlikte güncellenir.
**Kural R-2:** Rapora ve sayaçlara **kategori, seviye, tarih, satır metni** alanı girmez; `line_hidden` kategorisiz kalır. Yeni sayaç eklemeden önce yasak-desen testi genişletilir.

## 3. Gizlilik metni v2 (öneri; `site/gizlilik.html` DEĞİŞTİRİLMEDİ)

Ton: sade, "sen" hitabı. **[K10]** işaretli bölümler hukuki incelemeden geçmeden yayınlanmaz.

**Gizlilik politikası ve aydınlatma metni** — Yürürlük: [tarih] **[K10]**

**Kısaca**
- Haftik'te hesap yok. Check-in ve kartların yalnızca telefonunda durur.
- Haftik seni takip etmez: analitik, reklam ve çökme raporlama yazılımı yok. *(transitif Firebase: G2 ölçümü)*
- Bir şeyi paylaşmak yalnızca senin başlatacağın bir eylemle olur.
- Verilerini uygulamadan silebilirsin.
- Uygulamayı 18 yaş ve üstü kişiler için hazırladık.

**Sorumlu ve iletişim** — Yayıncı: [yayıncı adı]. Sorumlu: [sorumlu kişi/unvan]. İletişim: [iletişim e-postası]. Geliştirici, deneme raporu dışında telefonundaki verine erişemez. **[K10: veri sorumlusu nitelemesi]**

**Telefonunda tuttuklarımız**

| Veri | Ne için | Ne kadar |
|---|---|---|
| Günlük check-in: tarih, hareket/uyku/harcama/sosyallik seviyeleri | Haftalık kartını üretmek | Sen silene ya da uygulamayı kaldırana kadar |
| Kartların: unvan, satırlar, özet. Gizlemeyi seçmediğin kadar, gizlediğin satırlar da uygulamada saklanır; gizleme yalnızca paylaştığın görseli etkiler | Kartı yeniden görmek ve paylaşmak | Sen silene kadar |
| Ayarlar: hatırlatma saati ve açık/kapalı, ilk açılış tarihi | Uygulamanın çalışması | Sen silene kadar |
| Ölçüm kayıtları: "check-in kaydedildi", "kart açıldı", "paylaşım başlatıldı" gibi olayların adı, ilgili haftanın başlangıcı ve zaman damgası. İçerik, emoji ya da kategori adı tutulmaz | Deneme sürecinde kullanımı anlamak | Sen silene kadar |
| Geçici dosyalar: paylaşım için hazırlanan görsel (PNG) ve rapor dosyası | Paylaşım | Paylaşım kapanınca silinmeye çalışılır; açılışta kalıntı temizlenir |

**Toplamadıklarımız:** Hesap, e-posta, parola; konum; rehber, fotoğraf ve mesajlar; reklam kimliği; kullanım izleme verisi. *(cihaz/reklam kimliği cümlesi G2/M sonrası kesinleşir)*

**Ağ bağlantısı** (ölçüme göre biri seçilir; **M kanıtı olmadan yayınlanmaz**)
- *Varyant A (ölçüm temiz + INTERNET izni yok/kullanılmıyor):* "Haftik ağ üzerinden veri göndermez ve sunucudan veri almaz; uzaktan güncelleme ya da yapılandırma yoktur. Kurulum ve güncelleme mağazanın kendi işlemidir."
- *Varyant B (INTERNET izni kalıyor):* "İzin listesinde, kullandığımız yazılım bileşenlerinin gerektirdiği bir internet izni bulunur. Haftik bu izinle veri göndermez; bunu ölçtük [ölçüm tarihi]. Bildirimler bir sunucu ya da push hizmeti olmadan, telefonun kendi zamanlayıcısıyla gelir."

**Bildirimler:** Hatırlatmalar telefonda planlanır. Metinleri sabittir ve verinden hiçbir şey içermez (ör. "Bugün nasıldı?", "Kartın hazır"). İzni verip vermemek ve kapatmak sana ait.

**Paylaşım:** Kartı yalnızca sen istediğinde paylaşırsın. Önce önizleme görür, satırları tek tek gizleyebilirsin; uyku ve harcama satırları başta gizli gelir. Gizlediğin bir satır ve o satırdan türetilmiş bir başlık görselde yer almaz. Kart bir görsel (PNG) olarak paylaşım sayfasına verilir ve seçtiğin uygulamaya ya da kişiye gider. Görsel bir kez gönderildikten sonra silinemez; sonrası seçtiğin uygulamanın ve alıcının kontrolündedir.

**Deneme raporu** *(yalnızca deneme sürümlerinde; Play/App Store sürümünde yoksa bu bölüm çıkar — bkz. S-3)*: Ayarlardaki "Deneme raporu" düğmesine bastığında, göndermeden önce ne içerdiğini ve kime gideceğini görürsün. Rapor yalnızca sayıları içerir: kurulumdan beri kaçıncı gün, kaç gün check-in yaptığın, yukarıdaki olayların toplam sayısı. Emoji, kart metni, tarih ya da kimlik bilgisi içermez. Raporu tanıdığımız bir kişi olarak (mesajlaşma uygulamasında adınla) gönderirsen sana bağlayabiliriz; bu yüzden rapor "anonim" değil, sana **takma adla bağlanabilir** bir kayıttır. Rapor kendiliğinden gitmez. Yalnızca deneme sonuçlarını hesaplamak için kullanılır, [saklama süresi: Batuhan yazar] sonra silinir; silinmesini istersen [iletişim e-postası] adresine yaz. **[K10]**

**Dışa aktarma** *(yalnızca özellik eklenirse)*: İstersen Ayarlar'dan verini bir dosya olarak dışa aktarabilirsin. Bu dosya tarihlerini ve seviyelerini içerir; sen seçtiğin yere gider ve o noktadan sonra kontrol sende ve seçtiğin uygulamadadır. Haftik bu dosyayı kendiliğinden hiçbir yere göndermez.

**Yedekleme:** Android'de uygulama verisi telefonun otomatik yedeğinden hariç tutulur (`app.json:22`; cihaz kanıtı yok). iOS için bu bölüm iOS sürümünden önce güncellenecek (G11).

**Verilerini silme**
- **Ayarlar → Tüm verilerimi sil:** check-in'lerin, kartların, ayarların, ölçüm kayıtların ve geçici dosyalar silinir. Geri alınamaz.
- *[Öneri, özellik eklenirse]* Tek kart silme / eski kartları temizleme.
- Uygulamayı kaldırdığında uygulama alanı işletim sistemi tarafından silinir.
- Daha önce paylaştığın görselleri, dışa aktardığın dosyaları ve gönderdiğin raporları uygulamadan silemeyiz.

**18 yaş ve altı:** Haftik 18 yaş ve üzeri için hazırlandı ve çocuklara yönelik değildir. Uygulama yaş doğrulaması yapmaz. *(hukuk sorusu)*

**Haklarını kullanma** **[K10: KVKK m.10-11 aydınlatma unsurları, başvuru yolu, veri sorumlusu bilgisi hukukçu tarafından yazılır; bu bölüm yer tutucudur]**

**Değişiklikler ve iletişim:** Politika değişirse yeni sürüm bu sayfada yayınlanır, yürürlük tarihi güncellenir; önemli değişiklikte uygulama içinde de bilgi verilir. Sorular: [iletişim e-postası].

### 3.2 Site metnine göre değişenler
1. Sayaç anlatımı: "sayıları" → olay kayıtları (ad, hafta, zaman).
2. Saklama süresi tablosu eklendi.
3. Silme kapsamı: ayarlar, geçici dosyalar eklendi.
4. Rapor: saklama süresi, silme isteği yolu, "takma adlı" korundu; "Veriler bizde olmadığı için silme talebine gerek yok" cümlesi **kaldırıldı** (06: çelişki).
5. "Geliştirici bu verilere erişemez" → raporun istisnası açıkça yazıldı.
6. 18+ eklendi, yaş kapısı yokluğu dürüstçe yazıldı.
7. Kartların gizlenen satırlarının saklandığı yazıldı (albüm için şart).
8. Ağ cümlesi iki koşullu varyanta bölündü.
9. Dışa aktarma ve tek kart silme koşullu bölüm olarak eklendi.

### 3.3 Uygulama içi metinler (öneri)

| Yer | Mevcut | Öneri |
|---|---|---|
| Onboarding gizlilik (`onboarding/privacy.tsx:15-16`) | "Verilerin yalnızca bu telefonda kalır. Hesap yok, bulut yok. Telefon değişirse veri taşınmaz." | Aynı; dışa aktarma gelirse: "İstersen Ayarlar'dan dışa aktarabilirsin." |
| Kartlarım ekranı alt notu | yok | "Kartların yalnızca bu telefonda durur. Paylaşırken hangi satırların görüneceğini sen seçersin." |
| Paylaşım önizleme | mevcut | Ek satır: "Gizlediğin satırlar görselde yer almaz. Gönderdikten sonra görseli geri alamayız." |
| Rapor onay iletisi (`report-confirm.ts:12-14`) | "Paylaşılacak şey yalnızca sayaçlar ve gün sayısıdır..." | + "Raporu adınla ya da tanıdığın bir hesapla gönderirsen sana bağlanabilir. [Batuhan] raporu yalnızca deneme sonuçları için kullanır ve [süre] sonra siler." |
| Silme onayı | check-in/kart/sayaç | "Check-in'lerin, kartların, ayarların ve ölçüm kayıtların silinir. Daha önce paylaştığın görseller ve raporlar silinmez. Geri alınamaz." |
| Tek kart silme (öneri) | yok | "Bu kartı sil? Yalnızca bu telefondan silinir; paylaştığın kopyalar kalır." |
| Dışa aktarma uyarısı (öneri) | yok | "Bu dosya tarihlerini ve seviyelerini içerir. Sen seçtiğin yere gider; sonrasında kontrol sende ve seçtiğin uygulamadadır." |
| Ayarlar "Gizlilik politikası" | "(yakında)" | Canlı URL bağlanana kadar bağlantıyı gösterme ya da "Gizlilik politikası yayına hazırlanıyor." Play kapalı testte canlı URL zorunlu |

## 4. Mağaza beyanları

### 4.0 Güncel tanımlar (2026-09-28'de okundu)
- **Google Data Safety:** "Collect: Transmitting data from your app off a user's device"; yalnızca cihazda işlenen ve gönderilmeyen kullanıcı verisinin beyanı gerekmez; SDK/kütüphane verisi de yansıtılmalı; gizlilik politikası zorunlu. <https://support.google.com/googleplay/android-developer/answer/10787469>
- Kullanıcının **özel eylemiyle** başlattığı aktarım "shared" beyanından muaf sayılıyor (arama özeti; **Console tanımında doğrula**). PNG/rapor paylaşımı için dayanak bu.
- **Google Health apps:** tüm geliştiriciler, kapalı test dahil; "Activity and Fitness", "Sleep Management" gibi seçenekler; sağlık özelliği yoksa "My app doesn't provide any health features". <https://support.google.com/googleplay/android-developer/answer/14738291>
- **Apple:** cihazda işlenen veri "collected" sayılmaz; cihazdan türetilip gönderilen veri ayrıca değerlendirilir. <https://developer.apple.com/app-store/app-privacy-details/>
- **KVKK:** 6698'in 6. ve 9. maddeleri 7499 sayılı Kanun'la değişti (RG 12.03.2024, yürürlük 01.06.2024); içerik hukuka bırakıldı. <https://www.kvkk.gov.tr/Icerik/7834/6698-Sayili-Kisisel-Verilerin-Korunmasi-Kanununda-Yapilan-Degisiklikler-Hakkinda-Kamuoyu-Duyurusu>

### 4.1 Play Data Safety — cevap taslağı (ağ ölçümü temiz çıkarsa)

| Soru | Cevap | Kanıt / not |
|---|---|---|
| Zorunlu kullanıcı verisi türlerinden toplanan/paylaşılan var mı? | **Hayır** | K: fetch/XHR yok, hesap yok, SDK yok. **Şart: M (G1/G2)** ve release manifest |
| Sağlık ve fitness | Toplanmıyor | Seviye beyanı yalnızca cihazda |
| Uygulama etkinliği | Toplanmıyor | `metric_event` cihazda; **deneme raporu S-3'e bağlı** |
| Cihaz veya diğer kimlikler | Toplanmıyor | **G2 ölçümüne bağlı** |
| Fotoğraf/video | Toplanmıyor | Kart PNG'si cihaz içi, kullanıcı tetikli paylaşım |
| Gizlilik politikası URL'si | Canlı bağlantı (G4) | Zorunlu |

**Firebase çıkarsa (yedek satır):** Device or other IDs → toplanıyor, paylaşılmıyor, amaç: uygulama işlevi, aktarımda şifreli. Bu satır **ancak ölçümle** doldurulur.

### 4.2 Health apps ve yaş
- **Karar (2026-09-23):** etiket kalır, form dürüst doldurulur. Öneri: "Activity and Fitness" ve "Sleep Management" işaretlenir; açıklama: "Kullanıcı hareket ve uyku düzeyini 3 kademeli emojiyle kendisi beyan eder; cihaz sensörü, Health Connect ve tıbbi iddia yoktur; veri cihazdan çıkmaz." Kutuların doğruluğu Console'daki güncel tanımla teyit edilir.
- **Hedef yaş 18+:** Families kapsamı doğmaz. 16-17 yaş grubu bilinçli takasla dışarıda. Yaş kapısı yok; "18+" bir beyandır.
- **IARC:** beklenen en düşük bant; Console'da yapılmadı.

### 4.3 Deneme raporu seçenekleri (karar Batuhan'ın)

| | Ne | Play Data Safety | Apple | Artı | Eksi / koşul |
|---|---|---|---|---|---|
| **A** | Rapor her sürümde kalır, "toplanmıyor" bırakılır | Hayır (uygulama göndermiyor, kullanıcı OS paylaşımıyla kendisi gönderiyor) | "Data Not Collected" | Ek kod yok | Batuhan raporu alıp saklıyorsa off-device alınmış olur; yanlış beyan riski (hukuk sorusu) |
| **B** | "App interactions" olarak bildir | Evet | Evet (takma adla bağlanabilir olduğu için doğrula) | Dürüst | "Veri toplanıyor" görünür; iOS'ta "Data Not Collected" gider |
| **C** | Rapor **yalnızca preview/arkadaş APK'da**, Play/App Store'da yok | Hayır | "Data Not Collected" korunur | A'yı güvenli kılar | Build profili değişikliği; Play kohortunda E1 için başka yol (anket/görüşme) |

**Öneri: C.** Şartlar: (1) rapor kodu Play derlemesinde **paketten çıksın** (yalnızca gizleme yetmez), (2) sayaçlar Play derlemesinde tutulacaksa "yalnızca cihazda, hiçbir yere gitmez" olarak kalır, (3) arkadaş APK'sında onay iletisi bölüm 3.3'teki hâliyle.

### 4.4 App Store etiketi (iOS koşullu)
Varsayılan **Data Not Collected**; C seçilirse iOS'ta da rapor yok. `PrivacyInfo.xcprivacy` iOS derlemesinden sonra doğrulanır. iCloud yedeği: `expo-sqlite` dosyası varsayılanda yedeğe girebilir (V); "yalnızca bu telefonda" cümlesi iOS'ta çözülene kadar yanlış (G11).

### 4.5 Çapraz kontrol

| Beyan | Kod/manifest | Metin | Durum | Kim kapatır |
|---|---|---|---|---|
| "Toplanmıyor" | Ağ çağrısı yok (K) | Site l.35 | **M eksik** | Batuhan/OPS |
| "Reklam kimliği yok" | AD_ID izinde yok | Site l.59 | İzin düzeyinde tutarlı | - |
| "Push yok" | `no-push.test.ts`; c2dm izni var | Site l.74 | **M eksik (G2)** | Batuhan/OPS |
| "Sayaç" | Zaman damgalı olay satırları | Site l.52 (yanlış) | **Düzeltilecek** | copywriter |
| "Silme kapsamı" | 4 tablo + dosyalar | Site l.85 (eksik) | **Düzeltilecek** | copywriter |
| "Çocuklara yönelik değil" | Yaş kapısı yok | Site l.91 (18+ yok) | **Düzeltilecek** | copywriter |
| "Gizlilik politikası" | URL yok | TASLAK / "(yakında)" | **Play engeli (G4)** | Batuhan + mobile-engineer |
| Health apps | Sensör/Health Connect yok | Mağaza metni "uyku" yok | Karar var, form yok | Batuhan (G8) |
| Yeni saklama | - | - | R-1 uygulanmalı | mobile-engineer |

## 5. Yaş, hassas kategori ve mizahi metin riskleri

### 5.1 Çocuk / yaş
Uygulama 18+ beyan eder, yaş kapısı yok. Ek yükümlülük olup olmadığı **hukuk sorusu**. Öneri (S-6): uygulama içi yaş kapısı eklemeyin, onboarding'e tek satır "Haftik 18 yaş ve üzeri için hazırlandı." Not: 06'daki "reşit olmayanlar (m.9)" atfı hukuka götürülürken düzeltilsin (m.9 yurt dışı aktarımı düzenler).

### 5.2 Sağlık verisi sınıflaması

| Katman | Durum | Risk |
|---|---|---|
| Ham veri | Yok; 3 kademeli beyan | Düşük |
| Çıkarım | Kart seviyelerden yorum üretir (`title_based_on_categories`, delta) | Orta |
| Etiket | "Uyku" (kalır) | Orta; Health apps beyanıyla tutarlı |
| Mağaza metni | "Uyku/sağlık" sözcüğünden kaçınıyor; ekran görüntüsünde "Uyku" görünür | Ekran görüntüleri kurala uymalı |
| Dışa aktarma dosyası | tarih + uyku seviyesi | **Yüksek (yeni):** dosya adı "sağlık kaydı" izlenimi vermemeli (`haftik-yedek`, başlıkta "kullanıcı beyanı") |
| Widget | Yalnızca dolu gün noktası | Düşük |

### 5.3 Mizahi metinlerin "sağlık iddiası" riski (`tr.ts` taraması)
Ton kuralı (`tr.ts:13-16`): tanısız, tavsiyesiz.

| Metin | Sınıf |
|---|---|
| "Koşan Ama Uykusuz Kahraman" (`tr.ts:67`) | Düşük-orta: "uykusuz" durum tespiti |
| "Yorgun ve Tutumlu" (`tr.ts:62`) | Düşük |
| "Zinde ve Dinlenmiş Kahraman", "Dinlenmiş Sosyal Yıldız" (`tr.ts:53,63`) | Düşük |
| "Uyku bu hafta sana biraz küstü galiba." (`tr.ts:119`) | Düşük |
| "Gece yarıları senin mesai saatin gibiydi." (`tr.ts:118`) | Düşük |

Sonuç: tanı/tedavi/tavsiye/uyarı dili yok. Öneri: (1) "uykusuz/yorgun" gibi durum sözcüklerini "az uyuyan/tempolu" gibi davranış sözcüklerine kaydırmayı değerlendirin, (2) içerik testine yasak sözcük listesi (teşhis, tedavi, hasta, depresyon, stres, anksiyete, kilo, kalori, doktor, "yapmalısın"), (3) yeni içerik (13 V5) aynı listeye tabi.

## 6. Gizlilik-uyumlu yeni özellik önerileri
(Taslak intent; dosya olarak açılmaz. Etki/efor K0.)

| # | Öneri | Etki | Efor | Taslak intent |
|---|---|---|---|---|
| P-1 | **"Verilerim" ekranı** (Ayarlar içinde): ne saklandığı, ne kadar, sayılar | Yüksek | S | Kullanıcı Haftik'in telefonunda ne sakladığını göremiyor. Ayarlar'a saklanan veri türlerini ve sayılarını gösteren salt okunur bir ekran eklenir. Ölçüt: politikadaki tablo ile birebir aynı. Ham değer gösterilmez. |
| P-2 | **Tek kart silme + "eski kartları temizle" (3/6/12 ay)** | Yüksek (albüm ile şart; Y-1) | S-M | Albümdeki kartlar süresiz duruyor. Kullanıcı tek kartı ya da belirli yaştan eski kartları silebilir; onay "yalnızca bu telefondan silinir, paylaşılan kopyalar kalır" der. Silme `deleteAllData` ile aynı transaction kuralını izler. |
| P-3 | **Yerel dışa aktarma + içe aktarma** | Orta | M-L | Telefon değişince veri taşınmıyor. Kullanıcı tüm check-in ve kartlarını tek dosya olarak paylaşım sayfasına verir; yeni telefonda içe aktarır. Şifresiz dosya uyarısı, kalıcı saklanmaz, rapora karışmaz, içe aktarma şema doğrulaması security-reviewer'dan geçer. |
| P-4 | **Raporu preview/arkadaş sürümüne kısıtlama** | Yüksek (Data Safety'yi temizler) | S-M | Rapor kodu yalnızca preview profilinde derlenir; Play paketinde rapor dizesi 0. E1 ölçümü Play kohortunda ayrı yolla. |
| P-5 | **Rapor önizlemesi** (gönderilecek metnin tamamı) | Orta | S | Onay ekranında raporun tam metni gösterilir; yeni alan yok. |
| P-6 | **Uygulama kilidi / son uygulamalar gizleme (N-9)** | Orta (albümle artan ihtiyaç) | M | İsteğe bağlı, varsayılan kapalı kilit ya da FLAG_SECURE. Biyometrik veri uygulamaya gelmez. |
| P-7 | Saklama süresi ayarı | Düşük-orta | M | Yalnızca P-2 talep görürse. |
| P-8 | Widget gizlilik yönü: yalnızca dolu gün noktası; deposu `deleteAllData` kapsamında | Orta | L | 13 I-5 + kural R-1. |

Sıra: **P-4 → P-2 → P-1**; P-3 ve P-6 albüm yayına girerken değerlendirilsin.

## 7. Batuhan'a sorular

| # | Soru | Seçenekler | Öneri |
|---|---|---|---|
| S-1 | INTERNET izni | (a) Önce ölç, sonra karar. (b) Baştan `blockedPermissions` ile kapat (profil bazlı) ve bildirimi cihazda test et | **(a)**: kanıt ölçümdür |
| S-2 | FCM/Firebase ölçümü ağ çıkarırsa | (a) Data Safety'de "Device or other IDs" bildir. (b) Bileşeni devre dışı bırakma | Ölçüme göre |
| S-3 | Deneme raporu | A / B / C | **C** |
| S-4 | Rapor saklama süresi ve silme sözü | (a) Deneme bitince sil (+30 gün). (b) Sabit süre | (a); süreyi sen yaz |
| S-5 | Health apps kutuları | (a) Activity + Sleep işaretle. (b) "Health features yok" | **(a)** |
| S-6 | Yaş kapısı | (a) Yok, onboarding'de 18+ satırı. (b) Yaş beyanı ekranı | **(a)** |
| S-7 | Yayıncı adı ve iletişim | Kişisel ad + özel e-posta / marka + ayrı e-posta / şirket | Sen yazarsın; kişisel Gmail'in görünmesini istemiyorsan ayrı adres |
| S-8 | Hukuki görüş eşiği | (a) Play kapalı teste geçmeden. (b) Herkese açık yayından önce. (c) Arkadaş APK'sından önce | **(a)** |
| S-9 | Albüm süresi | (a) Süresiz + kullanıcı silme. (b) Otomatik 12 ay. (c) Son N kart | **(a)** |
| S-10 | Albümde gizli satırlar | (a) Açıkta. (b) Varsayılan `???`, dokununca açılır | (b) uyumda hafif iyi; N-9 kararıyla birlikte |
| S-11 | Yerel dışa aktarma | (a) v1.5. (b) v2. (c) Hiç | **(b)** |
| S-12 | "Kart" adlandırması | (a) Her yerde. (b) Karışık | **(a)**; "Karnen hazır" yayın metinlerinde kalmasın |
| S-13 | Politika yayın yeri | GitHub Pages / Cloudflare Pages / alan adı | Alan adı damga URL'si için de gerekli |
| S-14 | K10 geçici karar kaydı | `plan.md`'ye tarihli yazılı karar (kapsam, rapor sözü, hukuki görüş eşiği) | 06 §8'deki koşulları yaz; yazmadan davet mesajı gönderme |

Hukuka giden sorulara (06 §7, 11 soru) eklenenler: (12) Albüm gibi kartların cihazda süresiz saklanması, geliştirici erişmiyorsa aydınlatma ve saklama-imha yükümlülüğü doğurur mu? (13) Kullanıcı tetikli dışa aktarma dosyası veri işleme/aktarma sayılır mı? (14) Uygulama içi "18+" beyanı, yaş doğrulaması olmadan yeterli özen sayılır mı?

## 8. Doğrulanamayanlar ve devir

**Doğrulanamayanlar:** release ağ trafiği (M) hiç yapılmadı; izin listesi R8'siz emülatör APK'sından, EAS preview/AAB ve R8'li derleme okunmadı; `google-services.json` yokluğunun Firebase'i başlatmadığı V; Play Console'un güncel soru adları ve Health apps kutularının tam adı Console'da teyit; "Share" muafiyetinin resmî cümlesi Console tanımında doğrulanmalı; KVKK m.6/m.9 değişikliğinin içeriği; iOS yedek/xcprivacy/etiket teorik; bu turda emülatörde/cihazda hiçbir ölçüm yapılmadı.

**Devir:**
- Batuhan: S-1..S-14.
- security-reviewer: P-3 içe aktarma, paylaşım unvanı seviye ipucu, R-2 sayaç kuralı.
- mobile-platform-specialist: INTERNET/c2dm/referrer izin yönetimi, widget deposu, R8 sonrası izin listesi.
- release-manager: G1/G2 ölçümü preview APK ile, Data Safety'yi ölçümden SONRA gönderme.
- copywriter: bölüm 3 metinleri, "Kart" adlandırması, yasak sözcük listesi.
- software-architect: `metric_event` CHECK → v3 göç, R-1 (silme kapsamı).

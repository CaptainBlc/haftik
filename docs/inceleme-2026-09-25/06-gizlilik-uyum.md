# 06 — Gizlilik ve Uyum İncelemesi (Haftik)

Tarih: 2026-09-25. Hazırlayan: `privacy-compliance-analyst` (rapor dosyaya Claude tarafından kaydedildi; ajanın yanıtı birebir).
**Bu belge hukuki görüş değildir.** Hukuki görüşe gidecek dosyayı hazırlar. Kapsam dışı: KVKK'da veri sorumlusu unvanı, VERBİS,
yurt dışı aktarım, reşit olmayanlar (m.9). Kod ve yapılandırma değiştirilmedi. Kişisel bilgi uydurulmadı
(`[iletişim e-postası]`, `[sorumlu kişi/unvan]`, `[tarih]` yer tutucu).

**Kanıt sınıfları:** K = kod/manifest okuması. M = ölçülmüş (cihaz/ağ). B = belge beyanı. V = varsayım. Bu turda ölçülmüş kanıt yok;
tek cihaz verisi `C:\hhk\haftik` altındaki debug derleme çıktısıdır.

## Özet (8 satır)
1. "Toplanmıyor" iddiaları `src/` taramasında tutuyor (fetch, XHR, WebSocket, AsyncStorage, SecureStore, push token, konum, rehber, analitik,
   `expo-updates` için sıfır eşleşme). Bu bir kod okuması; release ağ ölçümü (G-01/G-02) ve release merged manifest (G-09) hâlâ yok.
2. En önemli çelişki: politika ve site "ağ isteği yapmaz" diyor. Debug merged manifest ise `INTERNET`, `c2dm.RECEIVE`, `FirebaseInitProvider`,
   Firebase Installations ve `BIND_GET_INSTALL_REFERRER_SERVICE` gösteriyor. Ölçülmeden "ağ yok" ve "Data Not Collected" "kanıtlı" sayılamaz.
3. Politika taslağı (`site/gizlilik.html`) iyi: "anonim" yok, rapor takma adlı diye doğru anlatılıyor. Üç eksik: sayaçlar gerçekte zaman
   damgalı olay satırları; rapor Batuhan'a ulaştıktan sonra onda kalıyor ama "silme talebine gerek yok" cümlesi bunu kapsamıyor; 18+ kararı metinde yok.
4. Gizlilik bağlantısı uygulamada hâlâ "yakında" (`settings-view.tsx:168`, `settings.tsx:112`). Play kapalı test için engel, arkadaş APK için değil.
5. Play Data Safety ve Apple etiketi: cihazda kalan veri "toplanmış" sayılmıyor (tanımlar doğrulandı). Deneme raporu gri alan: uygulama
   göndermiyor ama Batuhan alıyor. Beyan biçimi Batuhan kararı.
6. Hassaslık: hareket/uyku seviyesi kullanıcı beyanı ve cihazda kalıyor; yine de Play Health apps kapsamında "sleep management/activity tracking"
   sayılabilir. Batuhan 2026-09-23'te "dürüst doldur, etiket kalır" dedi. KVKK özel nitelikli veri sorunu hukuka gidiyor.
7. Arkadaş APK için zorunlu boşluk yok; kısa yazılı aydınlatma + rapor saklama/silme sözü öneriliyor. Play kapalı test engelleri: politika
   URL'si, uygulamadaki bağlantı, G-02/G-09 kanıtı, Health apps ve Data Safety formları, K10 kararı. iOS: yedek hariç tutma,
   `PrivacyInfo.xcprivacy`, iOS temp süpürmesi.
8. Hukuki görüş değildir; iletişim e-postası, sorumlu adı ve tarih yer tutucu kaldı.

## 1. Veri envanteri

Silme yolu: "Tüm verilerimi sil" = `settings.tsx:88-97` → `deleteAllData` (`src/data/delete-all.ts`).

| # | Veri türü | Amaç | Nerede | Ne kadar | Silme yolu | Dışarı çıkış | Kaynak |
|---|---|---|---|---|---|---|---|
| 1 | Günlük check-in: tarih + 4 kategori seviyesi (1-3) + created/updated zamanı | Kart üretimi | SQLite `checkin`, uygulama-özel alan, şifresiz | Süresiz; otomatik silme yok | `delete-all.ts:43`; uygulamayı kaldırma | Doğrudan yok; türetilmiş hâli kart satırlarında (#2) | `migrations.ts:36-45` |
| 2 | Haftalık kart: unvan, 4 satır, delta (-1/0/1), özet, `title_based_on_categories` (**çıkarım verisi**) | Kart gösterimi/paylaşım | SQLite `weekly_card` | Süresiz | `delete-all.ts:44` | Paylaşım PNG'si (#5), yalnızca kullanıcı tetiklerse | `migrations.ts:48-70` |
| 3 | Ayarlar: hatırlatma açık/saat, onboarding_done, `first_open_date`, `notification_ids` | İşleyiş, D7 | SQLite `setting` | Süresiz | `delete-all.ts:45` | `first_open_date` → rapordaki "kurulumdan bu yana gün" (tarih yok) | `setting-repo.ts:28`, `report.ts:73` |
| 4 | Ölçüm olayları: ad (5 sabit), `week_start`, `at` (epoch) | E1/E3 ölçüm | SQLite `metric_event` | Süresiz | `delete-all.ts:46` | Yalnızca toplam sayılar rapora girer; `at`/`week_start` girmez | `migrations.ts:80-89`, `metric-repo.ts:54`, `track.ts:42-45`, `report.ts:81` |
| 5 | Kart PNG'si (1080x1920; gizli satır `???`; damga içerir) | Paylaşım | Geçici önbellek (`ReactNative-snapshot-image*.png`) | Paylaşım kapanınca `finally` ile silinir; kalıntı açılışta ve silme akışında süpürülür | `share.ts:63-65`, `temp-cleanup.ts:30-50`, `_layout.tsx:42`, `delete-all.ts:61` | Kullanıcının seçtiği uygulama/kişi; **bir kez çıkınca silinemez** | `capture.ts:52-56`, `title-visibility.ts` |
| 6 | Deneme raporu (`deneme-raporu.txt`): gün no, dolu gün, D7, sayaçlar, bool'lar | Ölçüm | Geçici önbellek | Paylaşım bitince silinir; açılışta ve silme akışında ayrıca | `report.ts:126-131`, `report-file.ts:21`, `_layout.tsx:40`, `delete-all.ts:59` | Paylaşım sayfasıyla kullanıcının seçtiği kişiye (Batuhan); alınca cihaz dışında kalır | `report.ts:32-91,113-133` |
| 7 | Bildirim planı (sabit metin, `data:{kind}`) | Hatırlatma | OS zamanlayıcısı | Kapatınca/silince iptal | `delete-all.ts:31` (en iyi çaba) | Yok | `scheduler.ts:135-147`, `notification-texts.ts:12-19` |
| 8 | Bildirim izin durumu | Bildirim | OS | — | Sistem ayarları | — | `scheduler.ts` |
| 9 | Log: 2 sabit `console.warn` | Hata izi | Cihaz logu | — | — | Veri yok | `scheduler.ts:152`, `sync.ts:73` |
| 10 | OS kalıntıları: "Son uygulamalar" küçük resmi, ekran görüntüsü, bildirim geçmişi ("Bugün nasıldı?"), iOS yedeği | — | OS | — | Uygulama kontrolü dışında | — | N-9 açık (FLAG_SECURE yok) |

**"Toplanmıyor" iddiası sınaması** (K, `src/` taraması 2026-09-25; statik tarama, ağ ölçümü değil):

| İddia | Sonuç | Not |
|---|---|---|
| Ağ isteği yok | Uygulama kodunda kanıt yok (fetch/XHR/WebSocket sıfır). **Ölçülmedi**; manifestte `INTERNET` ve Firebase var | Bölüm 3, satır 10 |
| Hesap/e-posta yok | Kodda tutuyor | — |
| Konum, rehber, cihaz/reklam kimliği yok | Kodda import/çağrı yok; manifestte Firebase Installations çıktısı **doğrulanmalı** | — |
| Analitik/çökme SDK'sı yok | Doğrudan yok; `expo-notifications` içindeki Firebase (messaging/installations/datatransport) transitif ve ölçülmedi | CLAUDE.md S8 SEC-3 |
| OTA yok | `expo-updates` `package.json`'da yok, `app.json`'da `updates` bloğu yok | — |
| Push yok | `getExpoPushTokenAsync`/`getDevicePushToken` çağrısı yok; statik test var | `__tests__/notify/no-push.test.ts` |
| Kalıcı depo yalnızca SQLite | AsyncStorage/SecureStore yok | — |

Tespit: `metric_event` gizlilik metninin dediği gibi "sayaç" değil, zaman damgalı olay satırları (`at`, `week_start`). Cihazda kalıyor
ama metin yanlış anlatıyor (bkz. bölüm 4).

## 2. Çıkarım ve hassaslık analizi (karar Batuhan'ın, ardından hukuk)

Girdi: kullanıcı 4 kategori için 3 kademeli emoji seviyesini beyan eder. Sensör, Health Connect veya banka bağlantısı yok; ham tutar/saat yok.
Kart bu seviyelerden yorum cümleleri üretir (çıkarım) ve kullanıcı bunu paylaşabilir.

| Kategori | Sağlığa yakınlık | Finansa yakınlık | Not |
|---|---|---|---|
| Hareket | Orta ("activity tracking" alanı) | — | Ham ölçüm yok |
| Uyku | **Yüksek** (Play Health apps "sleep management") | — | Etiket "Uyku"; karar 2026-09-23: kalır |
| Harcama | — | Düşük (ham tutar yok) | Paylaşımda varsayılan gizli |
| Sosyal | Düşük (ruh hali çağrışımı) | — | Paylaşımda varsayılan açık |

**Resmî tanımlar (doğrulandı 2026-09-25):**
- Google Health apps formu, kapalı test dahil tüm uygulamalar için zorunlu; kapsam: activity tracking, nutrition/weight, period tracking,
  **sleep management**, stress/mental wellness. <https://support.google.com/googleplay/android-developer/answer/14738291>
- Google Data Safety "Fitness info" = egzersiz/fiziksel aktivite; "Health info" = tıbbi kayıt/semptom.
  <https://support.google.com/googleplay/android-developer/answer/10787469>
- Apple "Health" tanımı kullanıcı sağladığı sağlık verisini içerir ama yalnızca **toplama** olursa devreye girer.
  <https://developer.apple.com/app-store/app-privacy-details/>

**KVKK (hukuki soru, cevap verilmiyor):** 6698 m.6 "sağlık" verisini özel nitelikli sayar. Kullanıcı beyanı bir "uyku seviyesi"nin bu kapsama
girip girmediği ve cihazdaki verinin veri sorumluluğu doğurup doğurmadığı G-Açık'ta açık. Madde metni 2024'te revize edildi (doğrula).

**Risk azaltıcı tasarım (hepsi K):** (1) ham değer yok, 3 kademeli emoji; (2) veri cihazda, hesap/sunucu yok (ağ yokluğu ölçülünce M olur);
(3) paylaşımda uyku/harcama varsayılan gizli, gizli satır `CardView`'e hiç verilmez, unvan gizli kategoriden türetilmez; (4) tıbbi iddia/tavsiye/tanı yok;
(5) bildirim metni sabit; (6) paylaşım zorunlu önizleme sonrası ve kullanıcı tetiklemesiyle.

**Kalan risk (Batuhan):** mağaza metni "uyku/sağlık"tan kaçınıyor, uygulama içinde "Uyku" yazıyor; bu Health apps beyanını hafifletmez.
Seçenekler: (a) mevcut karar: etiket kalır, form dürüst doldurulur; (b) etiketi nötrleştir (ör. "Dinlenme").

## 3. Beyan çapraz kontrolü

| # | Beyan | Gerçek davranış / kanıt | Durum | Kim kapatır |
|---|---|---|---|---|
| 1 | Play Data Safety: "veri toplanmıyor" | Tanım: collect = uygulamadan cihaz dışına veri iletmek; cihazda işlenip çıkmayan veri bildirilmez. Yalnızca ağ kanıtıyla geçerli | **Şartlı**: G-02 (ağ) ve G-09 (release manifest) M yok | Batuhan/cihaz, `security-reviewer` |
| 2 | SDK verisi | SDK'nın ilettiği veri de sayılır; "Firebase installation ID" Device or other IDs listesinde. Debug merged manifest'te `FirebaseInitProvider`, Installations, datatransport var | **Açık soru**: `google-services.json` olmadığı için başlamadığı varsayımı (V) | Cihaz ölçümü, sonra Batuhan |
| 3 | Deneme raporu (kullanıcı tetikli, OS paylaşımı, alıcı Batuhan) | "Collect" tanımı burada tartışmalı; Batuhan raporu alıp tabloya işliyor | **Gri alan** (bölüm 3.1) | Batuhan; hukuk |
| 4 | Health apps declaration | Zorunlu. Karar 2026-09-23: dürüst doldur, tıbbi iddia yok, etiket kalır. Health Connect/sensör kullanılmıyor | Karar var; **hangi kutu Batuhan Console'da** (K11) | Batuhan |
| 5 | Hedef yaş 18+ | `s12-magaza-icerigi.md:123-135`. Uygulama içi yaş kapısı yok; politika "çocuklara yönelik değil" diyor, 18+ demiyor | Kararla uyumlu; yaş kapısı yokluğu ve politika dili açık | Batuhan (metin), hukuk (yaş) |
| 6 | İçerik derecelendirme (IARC) | Tahmin tablosu `s12-magaza-icerigi.md:104-115`; konsolda doğrulanmadı | Doğrulanmadı | Batuhan |
| 7 | App Store "Data Not Collected" | Cihazda işlenip sunucuya gitmeyen veri toplanmış sayılmaz; cihazdan türetilmiş sonuç dışarı gidiyorsa (deneme raporu) ayrıca değerlendirilir | iOS S11'de; rapor iOS'ta da varsa aynı gri alan | Batuhan, S11 |
| 8 | iOS `PrivacyInfo.xcprivacy` | Üretilmedi, "S11'de" notu | Açık | `mobile-platform-specialist` |
| 9 | Kategori Lifestyle, HealthKit yok | `app.json`'da HealthKit/Health Connect yok | Uyumlu | — |
| 10 | Manifest izinleri | Debug merged manifest: `INTERNET`, `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `ACCESS_NETWORK_STATE`, `WAKE_LOCK`, `c2dm.RECEIVE`, 15+ launcher rozet izni, `BIND_GET_INSTALL_REFERRER_SERVICE`, `allowBackup="false"`, `ExpoFirebaseMessagingService`, `FirebaseInitProvider`. Kök manifest: `INTERNET` var, storage ve `SYSTEM_ALERT_WINDOW` `tools:node="remove"` | **Debug, release değil**; Data Safety'yi etkileyen izinler release'te doğrulanmadı (G-09, BLG-10) | Batuhan, `security-reviewer` |
| 11 | Silme/erişim talebi ("veri bizde değil") | Rapor istisnası bölüm 4'te | Düzeltilmeli | `copywriter` |

### 3.1 Deneme raporu: Data Safety seçenekleri (karar Batuhan'ın)

| Seçenek | Ne | Artı | Eksi |
|---|---|---|---|
| A | "Toplanmıyor" bırak; rapor kullanıcı tetikli OS paylaşımı, uygulama hiçbir yere göndermiyor | Basit, kodla uyumlu | Batuhan raporu alıp saklıyor; "toplama" sayılırsa yanlış beyan riski (hukuk sorusu) |
| B | "Uygulama etkinliği" olarak bildir: isteğe bağlı, paylaşılmıyor, amaç ölçüm | Dürüst taraf | Mağazada "veri toplanıyor" etkisi; iOS "Data Not Collected" gider |
| C | Raporu yalnızca preview APK'da göster, Play/App Store derlemesinde kaldır | A'yı güvenli kılar, hesabı sadeleştirir | Play kapalı testte E1 ölçümü için başka yol gerekir; kod/profil değişikliği (ayrı karar) |

Öneri (karar değil): Play/App Store derlemesinde C; arkadaş APK'da rapor açık.

## 4. Politika ve aydınlatma metni: cümle-kanıt eşlemesi

Değerlendirilen: `site/gizlilik.html`, `site/index.html`, `onboarding/privacy.tsx:15-16`, `settings-view.tsx:168`, `report-confirm.ts:12-14`.

| Cümle / iddia (gizlilik.html) | Kanıt | Sonuç |
|---|---|---|
| "Hesap yok, veri yalnızca cihazında" (l.34) | K | Uygun; rapor istisnası l.80-81'de |
| "Ağ isteği yapmaz" (l.35, l.65) | K kodda yok; **M yok**, manifestte `INTERNET`+Firebase | **Ölçülmeden yayınlanmasın** |
| "Analitik, reklam, izleyici, çökme yazılımı yok" (l.36) | K doğrudan yok; transitif Firebase ölçülmedi | Şartlı |
| "Paylaşım yalnızca senin başlattığın" (l.37, 77) | K `share.ts`, `card-preview-view.tsx:86` | Uygun |
| "Cihaz içi ölçüm sayaçları... sayıları" (l.52) | `metric_event` zaman damgalı satırlar (`migrations.ts:80-89`) | **Yanlış anlatım**: "olay kayıtları (ad, hafta, zaman)" olmalı |
| "Rapor yalnızca sayaç ve gün sayısı; içerik, tarih, kimlik yok" (l.81) | K `report.ts:32-91` + yasak-desen testi | Uygun |
| "Rapor... göndereni alıcı bilebilir" (l.81) | Takma adlı doğru (I-3) | Doğru terim; "anonim" hiçbir yerde yok |
| "Veriler bizde olmadığı için silme talebine gerek yok" (l.87) | Rapor Batuhan'a ulaşınca Batuhan'da | **Çelişki**: rapor için saklama süresi, silme isteği yolu, kim erişir yazılmalı |
| "Geliştirici bu verilere erişemez" (l.44) | Rapor istisnası dışında doğru | Rapor bölümüne atıf |
| "Android yedekten hariç" (l.69) | K `app.json:22`; cihaz kanıtı G-05 yok | Şartlı |
| "iOS yedek belirsiz" (l.70) | Dürüst | Uygun, yayın kapısı |
| "Bildirim sabit metin" (l.74) | K | Uygun |
| "Gizlediğin satırlar görselde yer almaz; uyku/harcama varsayılan gizli" (l.77) | K `hide-state.ts:23`, PNG incelendi | Uygun |
| "Geçici dosya silinmeye çalışılır" (l.77) | K `share.ts:63` (en iyi çaba) | Uygun; iOS temp süpürmesi yok |
| "Silme: check-in, kart ve sayaç" (l.85) | K `delete-all.ts:43-46` | **Eksik**: `setting` ve bildirim planı da silinir; geçici dosyalar |
| "Uygulamayı kaldırınca veri kaldırılır" (l.86) | OS sandbox (V) | Uygun (V) |
| "Çocuklara yönelik değil" (l.91) | Karar 18+ | **18+ ibaresi yok**; uygulamada yaş kapısı yok |
| Yürürlük tarihi, sorumlu, iletişim | Yer tutucu | Batuhan |
| KVKK hakları (m.11), aydınlatma unsurları (m.10) | Metinde yok | **Hukuk sorusu** |
| Saklama süresi | Metinde yok (veri süresiz kalıyor) | Eksik |

**Uygulama içi metinler:**
- `onboarding/privacy.tsx:15-16` "Verilerin yalnızca bu telefonda kalır. Hesap yok, bulut yok. Telefon değişirse veri taşınmaz." Android'de uygun;
  **iOS'ta iCloud yedeği kapsam dışı kalana kadar yanlış olabilir** (S11).
- Rapor onay iletisi (`report-confirm.ts:12-14`) dürüst; Batuhan'ın saklama sözü eklenebilir.
- Onboarding'de deneme raporu ve paylaşım anlatımı yok; politika kapsıyor.
- "Gizlilik politikası (yakında)" (`settings-view.tsx:168`, `settings.tsx:112`): politika URL'si olmadan **Play kapalı test yayınlanmaz**.
- `index.html`: "Verin yalnızca cihazında durur; uygulama sunucuya veri göndermez" (l.49) aynı şartlı iddia.

## 5. Yaşam döngüsü

| Konu | Durum | Kanıt | Boşluk |
|---|---|---|---|
| Tablolar (4) | Tek transaction, hata → ROLLBACK | `delete-all.ts:41-56` | `VACUUM`/`secure_delete` yok (N-1); sandbox+yedeksiz, risk düşük |
| Bildirim planı | İptal en iyi çaba | `delete-all.ts:30-34` | İptal başarısızsa bildirimler kalabilir (sonraki sync temizler) |
| Kart PNG | Paylaşımda `finally` siler, açılış+silmede süpürür | `share.ts:63`, `temp-cleanup.ts` | **iOS**: view-shot dosyası `NSTemporaryDirectory()/ReactNative/`, süpürülemiyor (S11); Android harici cache için M yok (P-08) |
| Rapor dosyası | Paylaşımda, açılışta, silmede silinir | `report.ts:126`, `_layout.tsx:40`, `delete-all.ts:59` | En iyi çaba |
| Sayaçlar | `metric_event` silinir | `delete-all.ts:46` | — |
| Silme sonrası | `router.replace('/')` ile onboarding | CLAUDE.md (2026-09-24) | — |
| Yedek (Android) | `allowBackup:false` | K | Release'te `dumpsys` (G-05) M yok |
| Yedek (iOS) | Açık: `expo-sqlite` hariç tutma yolu yok (K7 iOS) | CLAUDE.md | iOS varsayılanda Documents iCloud'a gidebilir (V); S11 kapısı |
| **Paylaşılan PNG/rapor** | Cihaz dışına çıkınca **silinemez** | — | Politika l.77 PNG için söylüyor; rapor için yok |
| Batuhan tarafındaki veri | Raporlar, testçi Gmail listesi (Play), WhatsApp yazışmaları | `s12-magaza-icerigi.md:231-232` | Saklama/silme süreci yazılı değil |
| Arka plan kalıntısı | Son uygulamalar küçük resmi, bildirim geçmişi | N-9 | Karar bekliyor |

## 6. Uyum boşluk listesi

Kapı: **A** = arkadaş APK için gerekli, **P** = Play kapalı test için gerekli, **iOS** = S11.

| # | Boşluk | Risk | Kim kapatır | A | P | iOS |
|---|---|---|---|---|---|---|
| G1 | Release ağ ölçümü (G-01/G-02) ve merged manifest (G-09) yok; "ağ yok"/"Data Not Collected" buna bağlı | **Yüksek** (yanlış beyan) | Batuhan (PCAPdroid, `aapt`), `security-reviewer` | Öneri | **Evet** | Evet |
| G2 | Firebase Installations/FCM davranışı ölçülmedi | Yüksek ("Device or other IDs") | Aynı (G1 ile) | Hayır | **Evet** | — |
| G3 | INTERNET izni kararı | Orta | Batuhan | Hayır | Öneri | — |
| G4 | Politika URL'si yok, taslak `noindex`; uygulamada "yakında" | Yüksek (Play) | Batuhan, `copywriter`, kod | Hayır | **Evet** | Evet |
| G5 | Politika düzeltmeleri: sayaç anlatımı, silme kapsamı, rapor saklama/silme, 18+, saklama süresi | Orta | `copywriter` + Batuhan | Kısa metin | **Evet** | Evet |
| G6 | Rapor Batuhan'da: saklama, erişim, silme isteği yolu yazılı değil | Orta | Batuhan, hukuk | Kısa söz | **Evet** | — |
| G7 | Deneme raporu Data Safety beyanı (A/B/C) | Orta-yüksek | Batuhan + hukuk | Hayır | **Evet** | Evet |
| G8 | Health apps formu içeriği | Orta | Batuhan (K11) | Hayır | **Evet** | — |
| G9 | Data Safety formu, IARC anketi, hedef yaş Console'da yapılmadı | Orta | Batuhan | Hayır | **Evet** | Apple eşdeğerleri |
| G10 | K10: KVKK hukuki görüş / geçici karar kaydı | Orta | Batuhan, hukuk | Karar kaydı | **Evet** | Evet |
| G11 | iOS iCloud yedek hariç tutma; `PrivacyInfo.xcprivacy`; iOS temp süpürmesi | Orta | `mobile-platform-specialist` | — | — | **Evet** |
| G12 | N-9 uygulama kilidi/FLAG_SECURE kararı | Düşük-orta | Batuhan | Hayır | Öneri | — |
| G13 | N-7 kullanılmayan `_v2_mechanism_proof_placeholder` sütunu | Düşük | Batuhan | Hayır | Hayır | — |
| G14 | `expo-notifications` kaynaklı 15+ launcher rozet izni (BLG-10) | Düşük-orta | `mobile-platform-specialist` + Batuhan | Hayır | Değerlendirilmeli | — |
| G15 | Belge tutarsızlığı: `s12-magaza-icerigi.md:13` ve `s12-yayin-rehberi.md:59,238` paket adı yer tutucu diyor; CLAUDE.md `com.batuhan.haftik` (kesin) | Düşük | `copywriter`/Batuhan | — | Metin güncel olmalı | — |
| G16 | Testçi listesi (Gmail) ve kanal (WhatsApp) toplu kişisel veri işleme | Orta | Batuhan, hukuk | Hukuk sorusu | **Evet** | — |
| G17 | Bildirim başlığı "Bugün nasıldı?" kilit ekranında uygulama kullanımını ele verir | Düşük | Batuhan | Hayır | Hayır | — |

## 7. Avukata götürülecek sorular
(Ekler: bu belge, `spec.md` G-Açık, `site/gizlilik.html`, `docs/s10-guvenlik-raporu.md`, şema `migrations.ts`, rapor örneği çıktısı, Play/Apple tanım sayfaları.)

1. 3 kademeli emoji ile beyan edilen uyku/hareket/harcama/sosyal seviyesi özel nitelikli kişisel veri (sağlık) sayılır mı? Veri yalnızca cihazdaysa ve geliştiriciye ulaşmıyorsa sonuç değişir mi?
2. Cihazda kalan, geliştiricinin hiç erişmediği veri açısından geliştirici "veri sorumlusu" olur mu?
3. Kullanıcının kendi tetiklemesiyle gönderdiği deneme raporu (sayaç, gün no, takma adlı gönderen) Batuhan için kişisel veri işleme mi? Aydınlatma/açık rıza gerekli mi? Saklama ve silme süresi nasıl yazılmalı?
4. VERBİS: kapalı deneme ve sonrası (Play) için kayıt yükümlülüğü doğar mı?
5. Aydınlatma metni hangi unsurları içermeli (m.10)? Uygulama içi kısa metin + web tam metin yeterli mi? Açık rıza kutusu şart mı?
6. Yaş: 18+ kararı için uygulama içi yaş kapısı gerekir mi? 15-17 yaş grubu tesadüfen kullanırsa yükümlülük?
7. Testçi Gmail adresleri ve WhatsApp yazışmaları (kapalı test daveti) için ayrıca aydınlatma/silme yükümlülüğü?
8. Play Data Safety ve Apple etiketinde kullanıcı tetikli deneme raporu için doğru beyan biçimi (bölüm 3.1)? Yanlış beyanın hukuki sonucu?
9. Yurt dışı aktarım: rapor WhatsApp gibi yurt dışı hizmetle iletiliyor; kullanıcı tetikli ve Batuhan alıcıysa m.9 açısından "aktarım" doğurur mu?
10. Politika/mağaza metninde "uyku/sağlık"tan kaçınma ile uygulamadaki "Uyku" etiketi arasındaki tutarsızlık yanıltıcı beyan riski taşır mı?
11. Google/Apple tanımına uygun ama KVKK'da farklı sonuç doğuran bir durum var mı ("toplanmıyor" beyanı ile "veri işleniyor")?

## 8. Geçici karar: "Kapalı deneme yalnızca arkadaş çevresi, hukuki görüş sonra" — koşullar

`plan.md` K10'da tarif ediliyor ama yazılı karar hâlinde değil. Aşağıdakilerin **hepsi** sağlanırsa savunulabilir; biri bozulursa kapı kapanır
(hukuki güvence değildir):
1. **Kapsam:** yalnızca Batuhan'ın kişisel tanıdığı sınırlı kişiler (öneri: 20-30'u aşmama). Play kapalı test, mağaza listesi veya herkese açık bağlantı yok; dağıtım preview APK'sı, elden/özel mesajla.
2. **Yazılı karar:** Batuhan kararı ve tarihi `plan.md`'ye yazılır; hukuki görüşün hangi eşikte alınacağı (ör. mağaza kanalına geçmeden önce) belirtilir.
3. **Kısa yazılı aydınlatma** (davet mesajıyla, 5-6 cümle): neyin cihazda kaldığı, raporun içeriği, raporun Batuhan'da ne kadar kalacağı ve silme isteği yolu, iletişim, silme yolu. "Veri sadece telefonunda" cümlesi rapor istisnasını da söylemeli.
4. **Ağ iddiası sınırı:** G-01/G-02 ölçülmeden "uygulama ağ kullanmaz" denmez; doğrulanmış olan "hesap yok, sunucuya veri göndermeyen yerel uygulama; ölçüm sonucu ayrıca teyit edilecek".
5. **Rapor:** isteğe bağlı, kullanıcı tetikli, onay iletisiyle; Batuhan yalnızca ölçüm için kullanır, kimlikle birleştirilmiş tablo tutmaz, deneme bitince siler (süreyi Batuhan yazar).
6. **Yaş:** yalnızca 18 yaş üstü davet edilir.
7. **Testçi verisi:** Play kanalı yoksa Gmail toplanmaz; varsa G16/soru 7 çözülmeden başlanmaz.
8. **Mağaza kapısı:** Play/App Store'a geçiş için G1, G2, G4, G5, G7-G10 kapanmış (veya hukukla karara bağlanmış) olmalı.
9. **Sınır dışı iddialar:** "Data Not Collected"/"veri toplanmıyor" beyanı mağazaya girmeden önce ölçüm (M) ve Console doğrulaması şartı.

## 9. Batuhan karar listesi
1. `INTERNET` izni: release'te bloklansın mı, kalsın mı (G3)? Ağ ölçümü sonucuna göre.
2. Firebase/FCM ölçümü çıkarsa: Data Safety'de "Device or other IDs" bildirilsin mi, yoksa Firebase bileşenlerini devre dışı bırakma araştırması mı (kod işi, ayrı intent)?
3. Deneme raporu: Data Safety seçeneği A/B/C; Play derlemesinde rapor kalsın mı?
4. Health apps formu: hangi kutular (karar "dürüst"; içerik seçimi Console'da).
5. "Uyku" etiketi kararı teyidi (a: kalır).
6. Uygulama kilidi/`FLAG_SECURE` (N-9): v1 içinde mi?
7. Raporların saklama süresi ve silme sözü.
8. "Arkadaş çevresi" tanımı ve üst sınır; 18+ teyidi.
9. Politika yayın zamanı, iletişim adresi (uydurulmadı), sorumlu bilgisi (hukuk sonrası).
10. N-7 placeholder migration sütunu kapalı deneme kurulumundan önce kaldırılsın mı.

## 10. Doğrulanmadı / bu belge kanıtlamadı
- Release ağ trafiği ve merged manifest (yalnızca debug manifest okundu; tarihi bilinmiyor).
- `google-services.json` yokluğunun Firebase Installations'ı gerçekten engellediği (V).
- Play Console/App Store Connect'in güncel soru adları; IARC ve Apple yaş anketi sonucu.
- 6698 m.6'nın 2024 değişikliğinin tam metni (yalnızca arama özeti); kesin metin hukukçuya bırakıldı.
- iOS'ta `expo-sqlite` dosyasının iCloud yedeğine girip girmediği (V).

Kaynaklar: Play Data safety <https://support.google.com/googleplay/android-developer/answer/10787469>; Health apps
<https://support.google.com/googleplay/android-developer/answer/14738291>; Apple <https://developer.apple.com/app-store/app-privacy-details/>;
KVKK <https://www.kvkk.gov.tr/>.

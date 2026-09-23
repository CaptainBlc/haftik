# S10 Güvenlik Son İnceleme Raporu (Haftik)

Tarih: 2026-09-23. İnceleyen: `security-reviewer` (salt okunur; rapor dosyaya Claude tarafından kaydedildi).
Karar Batuhan'ındır. Bu bir hukuki görüş değildir.

**Genel sonuç:** Kodda veri sızıntısı, ağ çağrısı veya sır bulunmadı. 6 Important bulgu vardı (I-1..I-6);
durumları en altta "Kapanış durumu" bölümünde izlenir. Kapsam: `src/` (data, card, notify, metrics, dev, lib, app, config),
`app.json`, `package.json`, `.gitignore`, `.github/`. `CardView.tsx` ve `content/tr.ts` için S7b SEC incelemesine
güvenildi. Cihaz/release derlemesi yok; "cihazda doğrulanmalı" satırları ölçülmüş kanıt değildir.

## 1. Spec güvenlik gereksinimleri, madde madde

| # | Gereksinim | Durum | Kanıt | Kalan |
|---|---|---|---|---|
| 1 | Veri yalnızca cihazda, ağ çağrısı yok | Kısmen (kod temiz, release ölçümü yok) | `src/` içinde `fetch(`/`XMLHttpRequest`/`WebSocket`/`AsyncStorage`/`SecureStore` sıfır eşleşme; `console` çağrıları sabit metin (`src/notify/scheduler.ts:122`, `src/notify/sync.ts:73`); push API yok (`__tests__/notify/no-push.test.ts`); `expo-updates` yok, `updates` bloğu yok (K6). `INTERNET` izni manifestte duruyor. | Cihazda G-01/G-02 (ağ izleme, FCM). I-2. |
| 2 | Üçüncü parti SDK yok, sürümler sabit | Kısmen | Analitik/reklam/çökme SDK'sı yok. Sürüm sabitleme: `package-lock.json` + `npm ci` (`.github/workflows/ci.yml`). `expo-notifications` içindeki `firebase-messaging` ölçülmemiş (CLAUDE.md). Ölü şablon bileşenleri yüzünden `expo-web-browser`/`expo-symbols`/`expo-image` tutuluyor (N-2). | G-02. N-2, N-3. |
| 3 | Paylaşım kartı: zorunlu önizleme, gizle/göster, uyku+harcama varsayılan gizli, unvan gizlenenden türetilmez, EXIF yok | Kod: karşılanıyor. Cihazda doğrulanmalı | `src/card/hide-state.ts`, `src/components/card-preview-view.tsx`, `src/card/title-visibility.ts`, `src/card/capture.ts`. Gizli satır `CardView`'e hiç verilmiyor. | PNG EXIF/tEXt incelemesi cihazda (P-06). I-1. |
| 4 | Bildirim metinleri veri içermez | Karşılanıyor | Sabit iki metin: `src/domain/content/notification-texts.ts`; yük yalnızca `{kind}`. | Kilit ekranı cihazda (B-02). |
| 5 | Uygulama içi "tüm veriyi sil", log'a veri yok, uygulama kilidi isteğe bağlı | Kısmen | Silme 4 tablo, tek transaction, ROLLBACK: `src/data/delete-all.ts`. Rapor dosyası silinir. Geçici kart PNG'si süpürülmüyordu (I-1). Uygulama kilidi kararı yazılı değil (N-9). | Cihazda A-03, A-04. |
| 6 | Yedekten hariç tutma | Android: kısmen. iOS: karşılanmıyor (bilinçli açık) | `app.json` `allowBackup:false`. iOS için hazır alan bulunamadı. | Android: taze prebuild/release'te G-05. iOS: S11. |
| 7 | Sade aydınlatma + gizlilik politikası | Karşılanmıyor (S12 işi) | Ayarlar'da "(yakında)". | I-5. |
| 8 | Mağaza beyanı | Taslak bölüm 4'te; Console doğrulaması bekliyor | — | I-6. |
| 9 | Analitik ileride: varsayılan kapalı | Uygulanabilir değil | `src/metrics/*` yalnızca yerel sayaç; rapor kullanıcı tetikli ve onaylı. | — |

Temel ilkeler: hesap/e-posta/konum/cihaz kimliği toplanmıyor; reklam kimliği yok; paylaşım yalnızca kullanıcı tetiklemesiyle.
E10: yedekleme kararı uygulandı (Android); PNG temizleme politikası iki eksik dalla I-1'de; sağlık verisi tutumu G-Açık (I-5).

## 2. Bulgular

### Important

- **I-1. Geçici kart PNG'si "Tüm verilerimi sil" kapsamında değil, bir dalda da silinmiyor.** `src/card/share.ts`:
  `isAvailableAsync()` false ise `throw` `try/finally`'nin dışında kalıyor; paylaşım açıkken uygulama öldürülürse `finally`
  çalışmıyor. Rapor dosyasında açılış+silme koruması var, kart PNG'sinde yok. Öneri: kontrolü `try/finally` içine al;
  açılışta ve `deleteAllData`'da `cacheDirectory` altındaki snapshot dosyalarını süpür (dosya adı deseni cihazda doğrulanmalı).
- **I-2. Manifest/izin yüzeyi doğrulanmamış.** İncelemede görülen `android/` prebuild'i eskiydi (`hhkscaffold` şeması,
  `expo-updates` meta-data). Şablon izinleri: `INTERNET`, `SYSTEM_ALERT_WINDOW`, `VIBRATE`, `READ/WRITE_EXTERNAL_STORAGE`.
  Öneri: `android.blockedPermissions` ile `SYSTEM_ALERT_WINDOW` ve depolama izinlerini kaldır; `INTERNET` kararı Batuhan'ın
  (release'te kaldırmak spec 1'i mekanik kanıtlar ama dev derlemesi için ayrı profil ister); taze prebuild/release AAB birleşik
  manifesti bu belgeye eklenmeli.
- **I-3. Paket adı yer tutucu (`com.anonymous.hhkscaffold`), Play'de ilk yüklemeden sonra geri alınamaz;** `ios.bundleIdentifier` yok.
- **I-4. Checklist'in deep link güvenlik testleri (K-07, K-08; Blokör) eski `hhkscaffold://` şemasını kullanıyor;** güncel şema
  `haftik://`. Taze derlemede bu komutlar hiçbir şey tetiklemez, test sessizce "geçti" yazılabilir. Paket adı geçen satırlar da
  paket adı değişince güncellenmeli.
- **I-5. Gizlilik politikası + KVKK.** Politika bağlantısı yok (Ayarlar'da "yakında"); G-Açık KVKK sorusu açık. Yalnızca arkadaş
  çevresine APK ile kapalı deneme yapılıyorsa zorunluluk yok; Play kapalı test kanalı kullanılırsa politika URL'si ve Data Safety
  formu gerekir. Aydınlatmada deneme raporu (bilinen kişiden gelir, "anonim" değildir) yer almalı. S12 kapısına yönlendirilebilir;
  Batuhan'ın "hukuki görüş sonra" kararı yazılı olmalı.
- **I-6. Google Health apps beyan formu zorunlu** (tüm uygulamalar, kapalı test dahil). Asıl soru: hareket/uyku beyanı bir sağlık
  özelliği olarak beyan edilmeli mi; yanlış beyan politika ihlali, fazla beyan ek gereksinim getirebilir. Karar Batuhan'ın;
  S12 belgesine yazılmalı. Öneri kategori: Lifestyle, tıbbi iddia yok.

### Nit

- **N-1.** Silme yalnızca `DELETE`; `VACUUM`/`secure_delete` yok, serbest sayfalarda bayt kalabilir. Sandbox+yedeksiz, risk düşük.
- **N-2.** Ölü şablon kodu (`external-link.tsx` rastgele URL'yi uygulama içi tarayıcıda açar ama hiçbir ekran çağırmıyor;
  `collapsible`, `web-badge`, `animated-icon*`) ve bunlar yüzünden tutulan `expo-web-browser`/`expo-symbols`/`expo-image`;
  `react-dom`/`react-native-web` ve `app.json` web bloğu ürün kapsamında yok.
- **N-3.** `package.json`'da `^` aralıkları var; lockfile+`npm ci` koruyor. Dependabot'ta `expo-*`/`react-native` için SDK dışı PR
  riski (`@types/jest@30` tuzağı). `ci.yml`'de `permissions:` bloğu yok, `contents: read` eklenebilir.
- **N-4.** Deep link yüzeyi sağlam (`week-param.ts`), ama `haftik://today` ve `haftik://week` onboarding'i atlıyor (kapı yalnızca
  `/`'de); sonuç `first_open_date` boş (D7 `unknown`), bildirim sync `skipped`. Öneri: `(main)` layout'unda `onboardingDone` kapısı.
- **N-5.** Bazı ekranlarda `.catch` yok (`card/[weekStart].tsx`, `today.tsx`, `week.tsx`, `settings.tsx`, `index.tsx`); DB hatasında
  ekran `LoadingView`'da takılabilir; mesajlar sabit, veri sızdırmıyor.
- **N-6.** `expo-sharing` FileProvider yolları geniş (`files-path`/`cache-path`/`external-path` `.`); `exported=false`. `shareAsync`'e
  kullanıcı/dış kaynaklı yol hiçbir zaman geçirilmemeli.
- **N-7.** `src/data/migrations.ts` gerçek şemaya kullanılmayan `_v2_mechanism_proof_placeholder` sütunu ekliyor; kapalı deneme
  kurulumlarından önce kaldırmak daha temiz (geçiş mekanizması testleri buna dayanıyor, dikkatli).
- **N-8.** `__DEV__` koruması sağlam (`now.ts`, `_layout.tsx`, `dev-time-menu.tsx`); release paketinde yokluğu OPS raporunda `expo export`
  ile kanıtlandı. `eas.json` `development` profili `developmentClient:true` ama `expo-dev-client` bağımlılığı yok, profil çalışmaz.
- **N-9.** Uygulama kilidi kararı yazılı değil; `FLAG_SECURE` yok, "Son uygulamalar" küçük resminde Bugün ekranındaki emoji
  seçimleri görünür. Batuhan karar versin, v1 dışıysa `plan.md`'ye yazsın.
- **N-10.** Kabul edilenler: önizleme listesindeki `accessibilityLabel` gizli satır metnini taşıyor (S7b nit a); `metric_event.at`
  kullanılmıyor; `trackEventOnce` atomik değil.

## 3. Temiz çıkanlar

- Sır yok; `.gitignore` `.env*`, `*.jks`, `*.p8`, `*.p12`, `*.key`, `*.mobileprovision`, `android/`, `ios/` kapsıyor.
- SQL parametreleme: tüm sorgular pozisyonel `?`; tek interpolasyon kod sabiti olan sürüm numarası; `metric_event` adı tipte ve `CHECK`'te
  sabit kümeyle sınırlı.
- Kalıcı depo yalnızca SQLite (AsyncStorage/SecureStore yok). Geçici dosyalar: kart PNG'si (I-1) ve `deneme-raporu.txt` (temizleniyor).
- Kimlik doğrulama/şifre/token maddeleri uygulanamaz (hesap yok). `SCHEDULE_EXACT_ALARM` bilerek yok.

## 4. Mağaza beyan taslağı (Console'da doğrulanmalı)

**Google Play, Data safety:** yalnızca cihazda işlenen ve gönderilmeyen veri "toplanmış" sayılmaz. "Kullanıcı verisi topluyor/paylaşıyor mu?":
Hayır. Toplanmayan: kişisel bilgi, sağlık ve fitness (seviyeler cihazda kalır), finansal, konum, mesaj, fotoğraf/dosya, cihaz kimlikleri,
uygulama etkinliği (sayaçlar cihazda), çökme günlükleri. Aktarım şifrelemesi uygulanamaz; silme talebi: uygulama içi "Tüm verilerimi sil".
Reklam ve hesap yok. Deneme raporu OS paylaşım sayfasıyla kullanıcının seçtiği kişiye gider, politikada yazılmalı. Health apps beyanı
zorunlu (I-6). İzin: `POST_NOTIFICATIONS`. Gizlilik politikası URL'si ve içerik derecelendirme anketi gerekir.

**App Store gizlilik etiketi (S11):** "Data Not Collected" (Apple tanımı cihazda kalan veriyi kapsam dışı tutar; App Store Connect'te
doğrulanmalı). Gizlilik politikası URL'si iOS'ta zorunlu. Kategori Lifestyle, HealthKit yok. Bildirim yerel; `aps-environment` yok.
S11'de: `PrivacyInfo.xcprivacy`, şifreleme ihracat beyanı, iCloud yedek hariç tutma (K7 iOS yarısı).

## 5. Cihazda doğrulanacaklar (`docs/manual-checklist.md` eşleşmesi)

Listede zaten olanlar: P-06 (PNG metadata), P-07 (geçici dosya), B-02 (kilit ekranı), A-03/A-04 (silme), G-01/G-02 (ağ),
G-03/G-07 (izinler, FCM), G-04 (log), G-05 (yedek), G-06 (dev menü), K-07/K-08 (deep link), R-01..R-03 (rapor).
Eklenmesi gerekenler: (1) K-07, K-08, G-03, G-05 ve paket adı satırlarında yeni şema/paket adı; (2) taze prebuild/release birleşik
manifest; (3) paylaşım sayfası açıkken uygulamayı öldürüp "Tüm verilerimi sil" sonrası cache'te PNG kalmadığını doğrulama (I-1);
(4) temiz veriyle `haftik://today` / `haftik://week` davranışı (N-4); (5) "Son uygulamalar" küçük resmi (N-9); (6) açık kart
önizlemesinde ekran görüntüsü/kaydı; (7) iOS yedek hariç tutma (S11).

## 6. Plan "SEC raporu, açık Important bulgu yok" maddesi

Kod tarafında bloklayan Important yok. I-1, I-2, I-3, I-4 kapatılmalı; I-5/I-6 Batuhan kararı (S12'ye yönlendirilebilir, plan'a
kaydedilmeli). Cihaz kanıtları (G-01/G-02/G-05/G-06) alınınca madde kapanır.

## Kapanış durumu (Claude tarafından güncellenir)

Son güncelleme: 2026-09-23 (S10 güvenlik düzeltmeleri, MOB).

| Bulgu | Durum |
|---|---|
| I-1 | **Düzeltildi (kod + Jest).** `shareCard` kullanılabilirlik kontrolü `try/finally` içine alındı (her hata dalında PNG silinir); `src/card/temp-cleanup.ts` `sweepSnapshotFiles()` açılışta (`_layout.tsx`) ve `deleteAllData` sonunda yalnızca `ReactNative-snapshot-image*.png` dosyalarını `cacheDirectory` altından siler (desen react-native-view-shot Android kaynağından doğrulandı). Açık: iOS'ta dosyalar `NSTemporaryDirectory()/ReactNative/` altında, expo-file-system erişimi yok (S11); Android harici cache'e yazılırsa view-shot'ın kendi CleanTask'ı temizler. Cihaz kanıtı: checklist P-08. |
| I-2 | Kısmen: `blockedPermissions` artık READ/WRITE_EXTERNAL_STORAGE + `SYSTEM_ALERT_WINDOW` (taze prebuild'de ana manifestte `tools:node="remove"` doğrulandı; dev client yok). Açık: `INTERNET` kararı (Batuhan), release AAB/APK merged manifest (checklist G-09). |
| I-3 | KAPANDI: paket adı `com.batuhan.haftik` (Batuhan, 2026-09-23); `app.json` `android.package` + `ios.bundleIdentifier` |
| I-4 | **Düzeltildi.** `docs/manual-checklist.md` K-07/K-08 `haftik://` oldu; paket adı satırlarına "yer tutucu, değişince güncelle" notu; bölüm 5 ek maddeleri checklist'e eklendi (K-09, P-08, P-09, G-08, G-09, G-10). `docs/uygulama-adi-onerileri.md` tarihsel öneri belgesi, oradaki "şu an" ifadeleri olduğu gibi bırakıldı. |
| I-5, I-6 | Batuhan kararı, S12 (değiştirilmedi) |
| N-2 | **Düzeltildi.** Kanıtlanmış ölü şablon bileşenleri/varlıkları silindi; `expo-web-browser`, `expo-symbols` (transitif kalır), `expo-image` kaldırıldı. |
| N-4 | **Düzeltildi.** `(main)/_layout.tsx` onboarding kapısı (`src/lib/onboarding-gate.ts`, `index.tsx` ile paylaşılır); okuma hatası -> onboarding. |
| N-7, N-9 | Batuhan kararı bekliyor (placeholder migration sütunu; uygulama kilidi/FLAG_SECURE) |
| N-8 | **Düzeltildi.** `eas.json` `development` profili kaldırıldı (dev client gerekirse ayrı karar). |
| Diğer nit'ler | Kabul edildi / belgelendi |

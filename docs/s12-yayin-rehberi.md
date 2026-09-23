# S12 yayın rehberi (Haftik) — Batuhan için sıralı adımlar

Hazırlanma tarihi: 2026-09-23. Bu belge yalnızca anlatır; hesap açma, giriş, build ve gönderim Batuhan'ındır. Kod, `app.json`, `eas.json` bu belge kapsamında DEĞİŞTİRİLMEDİ (gereken değişiklikler bölüm 1.4 ve 7'de listelendi).

İşaretler: **doğrula: <kaynak>** = bilgi güncel Google/Apple/Expo sayfasından son kez kontrol edilmeli (kurallar sık değişiyor). Bu belgedeki tutar/tarih/koşullar 2026-09-23 web aramasıyla teyit edildi, ama Console ekranında görüneni esas al.

Kaynaklar (tek yerde):
- Google kapalı test şartı: https://support.google.com/googleplay/android-developer/answer/14151465
- Google Play Console'a başlama: https://support.google.com/googleplay/android-developer/answer/6112435
- Android geliştirici doğrulaması: https://support.google.com/android-developer-console/answer/16561738 ve https://android-developers.googleblog.com/2026/03/android-developer-verification-rolling-out-to-all-developers.html
- Health apps beyanı: https://support.google.com/googleplay/android-developer/answer/14738291
- EAS Submit (Android): https://docs.expo.dev/submit/android/ ; elle ilk yükleme: https://docs.expo.dev/submit/android-manual/ ; servis hesabı: https://github.com/expo/fyi/blob/main/creating-google-service-account.md
- EAS kimlik bilgileri: https://docs.expo.dev/app-signing/managed-credentials/ ve https://docs.expo.dev/app-signing/app-credentials/
- Apple Developer Program: https://developer.apple.com/programs/enroll/

---

## 1. Ön koşullar ve hesaplar

### 1.1 Google Play Console geliştirici hesabı

| Konu | Bilgi | Doğrulama |
|---|---|---|
| Ücret | Tek seferlik 25 USD, iade edilmez (yıllık değil). | doğrula: Console kayıt ekranı |
| Hesap türü | **Kişisel** veya **kuruluş**. Kuruluş için D-U-N-S numarası ve şirket belgeleri gerekir; Batuhan'ın şahıs/hobi ürünü için kişisel hesap yeterli. | doğrula: 6112435 |
| Kimlik doğrulama | Devlet fotoğraflı kimliği, telefon doğrulaması; bazı durumlarda selfie/adres kanıtı. Doğrulama birkaç iş günü sürebilir (kaynaklara göre 2-5 gün). Doğrulama başarısız olursa ücret iade edilmez. 2026 Eylül itibarıyla yeni kişisel hesaplarda doğrulama zorunlu tarif ediliyor. | doğrula: 16561738 |
| Kapalı test şartı | Kişisel hesap 13 Kasım 2023'ten sonra açıldıysa, üretime çıkmadan önce **en az 12 test kullanıcısı, kesintisiz 14 gün kapalı testte opt-in durumunda** olmalı. Şart uygulama başına geçerli. Üretim erişimi verilince sonraki güncellemeler için tekrar aranmaz. Kuruluş hesaplarında bu şart yok. | doğrula: 14151465 (Aralık 2024'te 20'den 12'ye indi) |

Karar notu: hesap bu ay yeni açılacaksa kesin olarak kapalı test şartına tabidir; takvimi buna göre kur (kayıt/doğrulama ~1 hafta + kapalı test 14 gün + üretim erişimi başvurusu incelemesi).

Ayrı konu (APK ile arkadaş dağıtımı): Google'ın "Android geliştirici doğrulaması" (sideload) kuralı Eylül 2026'da yalnızca Brezilya, Endonezya, Singapur, Tayland'da başlıyor, 2027'den sonra küreselleşmesi planlı. Türkiye ilk dalgada görünmüyor, ama Play dışı APK dağıtımı 2027 sonrası doğrulanmış geliştirici gerektirebilir. doğrula: https://android-developers.googleblog.com/2026/03/android-developer-verification-rolling-out-to-all-developers.html

### 1.2 Expo / EAS hesabı

```bash
npm i -g eas-cli
```
Beklenen: `eas --version` 16.0.0 veya üstü (eas.json `cli.version >= 16.0.0` ister). Hata: `command not found` ise terminali kapatıp aç ya da `npx eas-cli <komut>` kullan.

```bash
eas login
```
Beklenen: e-posta/şifre sorar (expo.dev'de ücretsiz hesap önceden açılır), `Logged in as <kullanıcı>`. Şifre yalnızca terminale yazılır, repoya girmez.

```bash
eas init
```
Beklenen: "Create a project @<kullanıcı>/haftik?" onayı, sonra `app.json` içine `expo.extra.eas.projectId` (ve gerekirse `owner`) yazar. Bu değişiklik commit edilecek bir dosya değişikliğidir (Batuhan commit eder). Hata: slug başka projede kullanılıyorsa ad çakışması; `app.json` `slug` değiştirilmez, EAS'ta eski proje silinir/başka slug seçilir (karar Batuhan'ın).

Ücret: EAS ücretsiz katmanında aylık sınırlı build kotası ve sıralı bekleme var; ücretli plana geçmek maliyet kalemidir, önce Batuhan onaylar. doğrula: https://expo.dev/pricing

### 1.3 Apple Developer üyeliği (K9, koşullu)

- Yıllık 99 USD (yerel para birimi kayıt sırasında görünür), kişisel veya kuruluş kaydı; kişisel kayıtta kendi kartınla ödeme gerekir. Türkiye'den ödeme için uluslararası geçerli kart gerekebilir. doğrula: https://developer.apple.com/programs/enroll/
- Onay süresi değişken (saatlerden günlere). iOS hiçbir Android adımına bağımlı değildir; üyelik yoksa bölüm 5 tamamen atlanır (plan.md S11/S12 kararı).

### 1.4 Paket adı kararı (KALICI)

- Biçim: `com.<geliştirici>.haftik`, küçük harf ASCII, Türkçe karakter/tire yok. `<geliştirici>` Batuhan'ın seçimi (kendi adı, takma ad, sahibi olduğu alan adının tersi). Şu anki `com.anonymous.hhkscaffold` yer tutucudur ve **yayınlanmamalıdır**.
- Play'de ilk yükleme (kapalı test dahil, bir AAB yüklendiği an) sonrası paket adı **değişmez**. Ad kesinleşmeden hiçbir build'i Play'e yükleme.
- Değişecek yerler (kod değişikliği, Batuhan onayıyla):
  1. `app.json` `expo.android.package` (var, yer tutucu).
  2. `app.json` `expo.ios.bundleIdentifier` (**şu an tanımlı değil**, iOS yapılacaksa eklenir; aynı değer olsun).
  3. `docs/manual-checklist.md` içindeki paket adı satırları (K-07/K-08 ve "yer tutucu" notlu satırlar; s10-guvenlik-raporu I-3/I-4).
  4. `android/` klasörü kaynak kontrolünde değil; değişince `npx expo prebuild --platform android --clean` ile yeniden üretilir (yalnızca yerelde bakmak istersen; EAS build kendisi üretir).
- `eas.json` içinde paket adı YOK, değişmez. EAS proje kimliği (`extra.eas.projectId`) slug/hesaba bağlıdır, paket adından bağımsızdır; paket adı değişince yeni proje açmak gerekmez. Ancak EAS'ta bir paket adı için üretilmiş keystore o paket adına bağlıdır: paket adı DEĞİŞTİKTEN SONRA ilk build yeni keystore üretir (bu yüzden adı ilk `eas build`den ÖNCE kesinleştir; s10-ops-raporu ile aynı uyarı).

---

## 2. Android imzalama

| Seçenek | Ne | Bu proje için |
|---|---|---|
| **EAS managed keystore (öneri)** | İlk `eas build`de EAS keystore üretir ve saklar. | Tek kişilik operasyon için en basit yol. |
| Kendi keystore | `keytool` ile sen üretirsin, `credentials.json`/`eas credentials` ile verirsin. | Gerekçesiz ek karmaşıklık; yalnızca EAS dışına çıkılırsa. |

**Play App Signing:** Play'e yüklediğin AAB'yi Google'ın tuttuğu asıl imza anahtarıyla yeniden imzalar; EAS'ın keystore'u yalnızca **yükleme (upload) anahtarı** olur. Yeni uygulamalarda Play App Signing zorunludur. Sonuç: yükleme anahtarı kaybolursa Google destekle sıfırlanabilir (kurtarılabilir), asıl imza anahtarı Google'dadır. doğrula: Play Console > Setup > App signing.

Güvenli saklama ve yedek:
```bash
eas credentials --platform android
```
Beklenen: menüden production profil > "Keystore: Manage everything needed to build your project" > keystore indirme seçeneği (veya "credentials.json" > "Download credentials from EAS to credentials.json"). Keystore dosyası, şifre, alias'ı **şifre yöneticisine** (ve bir çevrimdışı kopyaya) koy. Repoya asla girmez: `.gitignore` `*.keystore`, `*.jks`, `credentials.json`, `*.key` zaten kapsıyor (s10-ops-raporu). İndirdiysen dosyayı proje klasörünün dışına taşı; `git status` ile izlenmediğini teyit et. Menü adları EAS CLI sürümüne göre değişir. doğrula: https://docs.expo.dev/app-signing/app-credentials/

Önemli bir tuzak: `preview` APK'sı EAS'ın upload anahtarıyla imzalanır, Play'den kurulan sürüm ise Google'ın anahtarıyla imzalıdır. İkisi aynı cihazda birbirinin üstüne kurulamaz ("imza uyuşmazlığı"); testçiye kurulum yolunu tek seç, geçişte önce eskiyi kaldır.

---

## 3. Sıralı komutlar

Ön: bölüm 1.4 (paket adı) ve 7 (K4/K5 kesin değerler) bitmiş, testler yeşil.

**3.1 Sağlık kontrolü**
```bash
npm run typecheck && npm run lint && npm test && npx expo-doctor
```
Beklenen: hepsi temiz, expo-doctor 21/21. Hata: kırmızı varsa build alma, önce düzelt.

**3.2 Sürüm yönetimi (`appVersionSource: remote`)**
```bash
eas build:version:get --platform android --profile production
```
Beklenen: EAS'ta kayıtlı `versionCode` (yeni projede yok/0 olabilir). `app.json` `expo.version` ("1.0.0") kullanıcıya görünen sürümdür, elle artırılır; `versionCode` `production.autoIncrement: true` ile her production build'de EAS tarafından +1 olur, `app.json`a yazılmaz. İlk değeri elle vermek istersen:
```bash
eas build:version:set --platform android --profile production
```
(İnteraktif sorar; genellikle gerekmez.) doğrula: https://docs.expo.dev/build-reference/app-versions/

**3.3 Cihaz testi APK'sı (preview)**
```bash
eas build --platform android --profile preview
```
Beklenen: ilk seferde "Generate a new Android Keystore?" sorusu, cevap Evet; sonra bulut kuyruğu, ~10-30 dk, sonunda APK indirme bağlantısı + QR. Cihaza indir, "bilinmeyen kaynaklardan yükle" izni ver. Bu APK ile `docs/manual-checklist.md` cihaz maddeleri (S6-S10 açık maddeleri, merged izin listesi `aapt dump permissions`, ağ gözlemi) yapılır. Olası hatalar: `versionCode` hatası (remote kaynağı tanımsız; `eas build:version:set`), Gradle hatası (loglara bak; yerelde `npx expo-doctor`), kota bitti (ücretsiz katman; sonraki ay ya da ücretli plan = Batuhan onayı).

**3.4 Üretim paketi (AAB)**
```bash
eas build --platform android --profile production
```
Beklenen: `.aab` çıktısı, `versionCode` +1. Bu, Play'e yüklenecek dosyadır. Yüklemeden önce paket adının kesin olduğunu bir kez daha kontrol et (bölüm 1.4).

**3.5 Play'e yükleme: iki yol**

*Yol A (öneri, ilk yükleme): AAB'yi Console'a elle yükle.* AAB'yi EAS panelinden/bağlantıdan indir; Play Console > uygulama > Testing > Closed testing > Create release > AAB'yi sürükle. Neden elle: Google Play API'sinin sınırlaması nedeniyle bir uygulama için ilk yükleme geleneksel olarak Console'dan elle yapılır; güncel Expo dokümanı ise `eas submit`in ilk sürümü doğrudan dahili test kanalına oluşturabildiğini söylüyor, elle yükleme "isteğe bağlı". Tek kişilik, tek uygulama için servis hesabı kurmak yerine elle yükleme daha az karmaşık; ilk yükleme sırasında Play App Signing kaydı da Console'da bilinçli görülür. doğrula: https://docs.expo.dev/submit/android-manual/ ve https://expo.fyi/first-android-submission

*Yol B (sonraki sürümler): `eas submit`.* Servis hesabı anahtarı gerekir:
1. Google Cloud Console'da (play console'a bağlı projede) bir **servis hesabı** oluştur, JSON anahtar indir.
2. Play Console > Users and permissions (veya Setup > API access, arayüz değişebilir) > servis hesabı e-postasını davet et, uygulama için sürüm yönetme izni ver.
3. JSON'u `eas credentials`/EAS panelindeki "Google Service Account Key" alanına yükle (yerel dosya yolu kullanılacaksa `.gitignore`'a eklendiğini kontrol et; şu an `*.json` genel olarak hariç DEĞİL, `google-services.json` hariç; **anahtarı repoya koyma**, EAS'a yükleyip yerel kopyayı proje dışına taşı).
Adım adım: https://github.com/expo/fyi/blob/main/creating-google-service-account.md
```bash
eas submit --platform android --profile production
```
Beklenen: en son production build'i seçer/sorar, Play'e yükler (yeni uygulamada varsayılan dahili test kanalı). Olası hatalar: `The caller does not have permission` (servis hesabı izni/yayılma gecikmesi, birkaç saat sürebilir), `Package not found` (Play'de uygulama henüz oluşturulmamış/ilk yükleme yapılmamış). Not: `eas.json`da `submit` bloğu yok; servis hesabı yolu/track ayarı için `submit.production.android` eklemek gerekebilir (kod değişikliği, öneri).

---

## 4. Google Play kapalı test kurulumu

Sıra (Console arayüzü değişebilir, adlar yaklaşık): **doğrula: Console ekranı**.

1. **Uygulama oluştur:** Create app > ad "Haftik", varsayılan dil Türkçe, tür Uygulama, ücretsiz. Kalıcı olan paket adı ilk AAB yüklenince bağlanır.
2. **Dashboard > "Set up your app" görevlerini doldur** (kapalı test yayını için de istenir):
   - **Gizlilik politikası URL'si:** canlı `site/` sayfası (şu an `site/` yok, bölüm 7). URL herkese açık ve çalışır olmalı. Politika: cihaz dışına veri gönderilmez, deneme raporu OS paylaşım sayfasıyla kullanıcının seçtiği kişiye gider, silme = uygulama içi "Tüm verilerimi sil" (s10-guvenlik-raporu I-5).
   - **Reklam beyanı:** Hayır (reklam yok).
   - **Uygulama erişimi:** hesap/giriş yok, kısıtlama yok.
   - **İçerik derecelendirme (IARC anketi):** kategori "Yardımcı program/Yaşam tarzı" tarzı; şiddet/cinsellik/kumar/kullanıcı içeriği paylaşımı vb. hepsi Hayır; tıbbi iddia yok. Sonucu (yaş sınıfı) kaydet.
   - **Hedef kitle ve içerik:** yetişkin/genç yetişkin hedef (çocuklara yönelik DEĞİL, 13 yaş altını hedeflememek Families politikasını devreye sokmaz). Yaş aralığı seçimi Batuhan kararıdır; doğrula: Console yönlendirmeleri.
   - **Data safety:** s10-guvenlik-raporu.md bölüm 4 taslağı: "Kullanıcı verisi topluyor/paylaşıyor mu?" **Hayır**; veri cihazda kalır, ağa gönderilmez; reklam kimliği yok; silme talebi: uygulama içi "Tüm verilerimi sil". İzin: `POST_NOTIFICATIONS`. Manifest'te `INTERNET` şablondan durur (s10-ops-raporu bölüm 3); Data safety cevabıyla çelişmediğinden emin olmak için preview APK'da ağ gözlemi (checklist) tamamlanmadan formu **kesin** sayma. doğrula: Console Data safety tanımı (K11).
   - **Health apps beyanı (I-6, zorunlu, kapalı test dahil):** Play Console > Policy > App content > Health apps. Form Health Connect veri türleri/sağlık özelliklerine göre soruyor. Haftik hareket/uyku gibi kategorileri kullanıcının kendi emoji seviyesi olarak tutar, Health Connect/sensör/izin kullanmaz, tıbbi iddia yok. Öneri: "sağlık özelliği sunmuyor" beyanı; ancak bu beyanın doğru olup olmadığı Batuhan'ın kararıdır (yanlış beyan politika ihlali, fazla beyan ek gereksinim). Formdaki maddeleri tek tek oku. doğrula: https://support.google.com/googleplay/android-developer/answer/14738291
   - **Diğer formlar:** Haber uygulaması (Hayır), COVID (Hayır), Finansal özellikler (Yok), Devlet uygulaması (Hayır), Reklam kimliği (kullanmıyor).
   - **Mağaza girişi:** kategori "Lifestyle" (Yaşam tarzı), kısa/uzun açıklama, en az 2 ekran görüntüsü, 512x512 ikon, 1024x500 öne çıkan görsel; tıbbi/sağlık iddiası yok. Ad "Haftik" (30 karakter sınırı).
3. **Kapalı test kanalı:** Testing > Closed testing > (varsayılan "Alpha" ya da yeni kanal) > Create release, AAB'yi yükle (bölüm 3.5), sürüm notu, kaydet, incelemeye gönder. İlk kapalı test sürümü Google incelemesinden geçer (gün sürebilir).
4. **Testçi listesi:** Testers sekmesi > e-posta listesi oluştur (Gmail adresleri) **veya** Google Grubu (kolay yönetim: gruba eklenen herkes testçi olur). >= 12 kişi hedefle, tavan ~15-20 (bırakanları telafi için). Testçiler gerçek Google hesabı ve gerçek Android cihaz kullanmalı (spec E11).
5. **Davet akışı:** Kanal "Copy link" ile opt-in URL'si verir. Testçi bağlantıyı açar, "Become a tester"a basar, sonra Play Store bağlantısından yükler. Sayaç, testçi **opt-in olduğunda** işler; 14 gün boyunca kesintisiz >= 12 opt-in kalmalı (biri ayrılırsa sayaç etkilenir). Testçileri yönlendirmede "kendiliğinden paylaşım" şartını (E1, plan.md 355. satır) bozma: paylaşım isteme.
6. **14 gün sayacı:** Dashboard'da "Testing requirements" göstergesi kaç gün/kaç testçi kaldığını gösterir. doğrula: 14151465
7. **Üretim erişimi başvurusu:** şart dolunca Dashboard > "Apply for production" anketi (testçilerin geri bildirimi, ne öğrenildi, üretime hazırlık). Google inceleme süresi ~7 gün civarı bildiriliyor (doğrula). Sonra Production release oluşturulur.

**Kanıt kontrol listesi (plan.md S12 "Bitti kanıtı"):**
- [ ] Gizlilik politikası URL'si canlı ve Console'a girildi (ekran görüntüsü).
- [ ] Data safety, Health apps, İçerik derecelendirme, Hedef kitle, Reklam beyanı ekran görüntüleri alındı.
- [ ] Kapalı test kanalında AAB "Available to testers" durumunda.
- [ ] **Testçi davet akışı bir gerçek hesapla (Batuhan'ın ikinci hesabı/arkadaşı) uçtan uca denendi:** davet bağlantısı > opt-in > Play'den kurulum > uygulama açıldı. Ekran görüntüsü/not.
- [ ] Kesin ad/URL'li kartın PNG'sinde damga doğru (bölüm 7).
- [ ] KVKK görüşü belgesi eklendi **ya da** "kapalı deneme yalnızca arkadaş çevresi, hukuki görüş sonra" kararı plan.md'ye yazıldı.

---

## 5. iOS (koşullu, yalnızca Apple üyeliği alınmışsa, S11 sonrası)

Üyelik yoksa bu bölüm atlanır; ürün Android-only denemeye çıkar (spec E2, plan.md S11).

1. `app.json`a `ios.bundleIdentifier` ekle (bölüm 1.4). İkon `./assets/expo.icon` iOS ikonu olarak tanımlı; mağaza ikonu/ekran görüntülerinin iOS gerekleri Console'da/ASC'de doğrulanır.
2. App Store Connect (https://appstoreconnect.apple.com) > My Apps > + > New App: ad, dil, bundle ID, SKU.
3. İlk build (EAS Apple hesabı bilgilerini ister, girişi Batuhan yapar):
```bash
eas build --platform ios --profile production
```
Beklenen: Apple oturumu, sertifika/provisioning'i EAS'ın yönetmesi, ~15-30 dk. Hata: bundle ID kayıtlı değil (EAS oluşturur), Apple 2FA istemi.
4. Gönderim:
```bash
eas submit --platform ios --latest
```
Beklenen: ASC'ye yükleme, TestFlight'ta işleme (~10-30 dk), "Missing Compliance" (şifreleme) sorusu: standart HTTPS dışı şifreleme yok; doğrula: ASC sorusu. `eas.json`da iOS için `production` profili tanımsız; varsayılanlarla çalışır.
5. TestFlight: dahili testçiler (ASC kullanıcıları) incelemesiz; harici testçiler Beta App Review ister.
6. Gizlilik etiketi: "Data Not Collected" (s10-guvenlik-raporu bölüm 4; Apple tanımı cihazda kalan veriyi toplama saymaz, ASC'de doğrula). Gizlilik politikası URL'si gerekli.
7. iOS'a özgü açık madde: expo-sqlite dosyasının iCloud yedeğinden hariç tutulması (K7, S11).

---

## 6. Dağıtım seçenekleri

| | A) Yalnızca arkadaşlara APK (`preview`, internal) | B) Play kapalı test |
|---|---|---|
| Google hesabı/ücret | Gerekmez (EAS ücretsiz katman yeter) | 25 USD + kimlik doğrulama |
| Testçi şartı | Yok | >= 12, 14 gün (kişisel hesap) |
| Gizlilik politikası / Data safety | Zorunlu değil (s10 I-5) ama KVKK tarafında dürüst aydınlatma önerilir | **Zorunlu** (URL + Data safety + Health apps + içerik derecelendirme) |
| Güncelleme | APK'yı elle yeniden dağıt | Play otomatik günceller |
| Kurulum sürtünmesi | "Bilinmeyen kaynak" izni; 2027 sonrası sideload doğrulaması riski | Play'den normal kurulum |
| Üretime çıkış | Yolu yok | Şart dolunca üretim erişimi |

Öneri: ürünün gerçek hedefi mağaza olduğundan B; A yalnızca kendi cihazın ve yakın çevre için ilk gösterim. İkisi birlikte yürütülebilir (aynı cihazda birbirinin yerine kurulmaz, bölüm 2 tuzağı).

**Batuhan'ın vermesi gereken kararlar**

| # | Karar | Ne zamana kadar | Etki |
|---|---|---|---|
| 1 | Paket adı `com.<geliştirici>.haftik` | İlk `eas build`den ÖNCE | Play'de kalıcı; keystore adına bağlı |
| 2 | Geliştirici hesap türü (kişisel/kuruluş) | Hesap açmadan önce | Kişisel: 12 testçi/14 gün şartı; kuruluş: D-U-N-S gerekir |
| 3 | Dağıtım yolu (A, B ya da ikisi) | Build sonrası | Gizlilik/Data safety zorunluluğu |
| 4 | KVKK hukuki görüş zamanı (K10) | Kapalı deneme dışına çıkmadan | Yoksa "hukuki görüş sonra" kararı plan.md'ye yazılır |
| 5 | Health apps beyanı içeriği (I-6) | Console formu öncesi | Yanlış beyan riski |
| 6 | K5 mağaza bağlantısı / alan adı | Build öncesi | Kart damgası, kartlar yeniden üretilir |
| 7 | EAS/Apple ücretli plan (varsa) | Kota bitince | Maliyet kalemi |
| 8 | iOS yapılacak mı (Apple üyeliği K9) | S11 kararı | Bölüm 5 |
| 9 | Play'e ilk yükleme yolu (elle / `eas submit`) | İlk yükleme | Servis hesabı kurulumu |

---

## 7. Yayın öncesi kapı kontrol listesi

- [ ] **K4 ad kesin:** "Haftik" (`src/config/constants.ts` `APP_DISPLAY_NAME`, `app.json` name/slug/scheme uyumlu). Mağaza/alan adı/TÜRKPATENT kontrolleri Batuhan'da (uygulama-adi-onerileri.md "kısa liste").
- [ ] **K5 bağlantı kesin:** `constants.ts` içindeki `STORE_LINK_PLACEHOLDER = '[mağaza bağlantısı]'` gerçek kısa URL ile değiştirildi. Bu, `CARD_STAMP_TEXT`i değiştirir; kartların/ekran görüntülerinin yeniden üretilmesi ve `src/` testlerinin beklenen damga metnini kullandığının kontrolü gerekir (kod değişikliği, ayrı görev; **bu belgede yapılmadı**).
- [ ] **K10:** KVKK görüşü belgesi ya da açık karar kaydı.
- [ ] **K11:** Health apps ve Data safety beyanları Console'da doğrulandı.
- [ ] Paket adı yer tutucu değil (`app.json` `android.package`), `docs/manual-checklist.md` paket adı satırları güncel.
- [ ] `docs/manual-checklist.md` cihaz maddeleri tamamlanmış (S6-S10 açıklar, K5 paylaşım mesajı taşınıyor mu, aapt merged izin listesi, ağ gözlemi).
- [ ] `docs/s10-guvenlik-raporu.md`: I-1..I-4 kapalı; I-5/I-6 karara bağlandı; G-01/G-02/G-05/G-06 cihaz kanıtları alındı.
- [ ] `site/` canlı (şu an dizin yok): gizlilik politikası + akıllı mağaza bağlantısı; URL test edildi.
- [ ] Ekran görüntüleri kesin adla, S10 sonrası cihazdan alındı; ikon 512x512, öne çıkan görsel 1024x500.
- [ ] Sürüm: `app.json` `expo.version` ("1.0.0") kararlı; `versionCode` EAS'ta (bölüm 3.2).
- [ ] `eas build --profile production` AAB'si alındı; OTA/`expo-updates` yok (E3, CLAUDE.md tuzağı) teyit.
- [ ] Sır kontrolü: `git status`te keystore/JSON anahtar/`.env` yok.

---

## Bu rehberi yazarken bulunan noktalar (kod değişmedi, öneri)

1. `app.json` `ios.bundleIdentifier` yok ve `android.package` yer tutucu (`com.anonymous.hhkscaffold`).
2. `eas.json`da `submit` profili yok; `eas submit` için servis hesabı yolu/track eklemek gerekebilir.
3. `site/` dizini yok (S12 çıktısı, henüz üretilmemiş).
4. `src/config/constants.ts`de K5 hâlâ yer tutucu.
5. Servis hesabı JSON anahtarı için `.gitignore` genel `*.json`u hariç tutmuyor; anahtar proje dışında tutulmalı ya da desen eklenmeli (`*service-account*.json`, öneri).
6. Bölüm 1.1'deki geliştirici doğrulaması/12 testçi kuralı ve Console form adları sık değişir; her adımda Console ekranı esas alınır.

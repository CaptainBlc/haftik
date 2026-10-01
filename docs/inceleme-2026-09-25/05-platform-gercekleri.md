# 05 - Platform gerçekleri (Haftik) - 2026-09-25

Hazırlayan: mobil platform uzmanı (Principal, karar alanı: platform gerçekleri). Kod ve yapılandırma DEĞİŞTİRİLMEDİ,
emülatör başlatılmadı, commit yok. Yalnızca bu dosya yazıldı; ara çıktılar (introspect JSON, APK'dan çıkarılan `.so`
dosyaları) oturumun scratchpad dizininde, repo dışında.

## Özet (8 satır)

1. İzin durum makinesi Android 13+ için düzgün (BLG-01 düzeltmesi kaynakla tutarlı). Açık kenar: diyalog **kaydırılıp kapatılırsa** Expo sarmalayıcısı bunu "kalıcı ret" diye kaydedebilir (P-03, K1 ve olası UX hatası, K4 gerekiyor).
2. Bildirimler Android 12+'da **inexact** (`setAndAllowWhileIdle`). Resmi belge "1 saate kadar" gecikmeye izin veriyor. 23:00 seçeneği gece yarısını geçebilir (N-02). Saat dilimi değişince uygulama açılana kadar alarmlar eski yerel saatte çalar.
3. Paylaşım: geçici PNG, `shareAsync` biter bitmez siliniyor. Promise'in çözülme anı hedef uygulamaya bağlı. Drive, Quick Share, Gmail gibi dosyayı sonradan okuyan hedeflerde "dosya yok" riski var (S-01, K1, K4/K5 gerekiyor).
4. PNG 1080x1920 ama yakalama **cihaz yoğunluğunda** yapılıyor ve sonra büyütülüyor. 320 dpi cihazda 1,5x büyütülmüş, yumuşak metin çıkıyor (S-02, K1).
5. Manifest (debug birleşik, K4-debug): targetSdk 36 / minSdk 24, 16 KB hizalama tamam, dışa açık bileşenler güvenli. FCM servisi, c2dm izni ve 13 launcher rozet izni **duruyor**. `allowBackup=false` Android 12+'da bazı üreticilerde **cihazdan cihaza aktarımı engellemiyor** (M-03).
6. targetSdk 36 ile Android 16 tabletlerde/katlanabilirlerde `screenOrientation=portrait` **yok sayılıyor**. Yatay düzen hiç test edilmedi (E-01).
7. CLAUDE.md'de iki yanlış kayıt var: iOS `aps-environment` config plugin olmadan da ekleniyor (introspect ile ölçüldü). view-shot'ın CleanTask'ı "açılışta" çalışmıyor, yalnızca modül `invalidate()` edildiğinde çalışıyor.
8. Play hedef API şartı (31 Ağu 2026 itibarıyla 36) karşılanıyor. expo-doctor'ın bulduğu yama sürümleri düşük riskli, ama `decode-uri-component` açığını kapatmıyor.

## 0. Yöntem, kanıt ölçeği, sürüm haritası

K ölçeği: `~/.claude/team/ortak-standartlar.md` (K1 kaynak/doküman, K2 birim, K4 emülatör, K5 gerçek cihaz/release).
"K4-debug" = gerçek Gradle derleme çıktısı (debug varyant), release değil.

| Alan | Değer | Kanıt |
|---|---|---|
| minSdk / targetSdk / compileSdk | 24 / 36 / 36 (Android 7.0 - 16) | `aapt2 dump badging app-debug.apk`: `targetSdkVersion:'36'`, `compileSdkVersion='36'`; `node_modules/react-native/gradle/libs.versions.toml:3-5` (K4-debug) |
| Hedeflenen davranış dalları | API 24-30 (exact alarm, klasik bildirim izni), 31-32 (inexact alarm), 33+ (POST_NOTIFICATIONS), 35 (edge-to-edge zorunlu), 36 (büyük ekranda yön kilidi yok) | aşağıdaki bulgular |
| Birleşik manifest | `C:\hhk\haftik\android\app\build\intermediates\merged_manifest\debug\processDebugMainManifest\AndroidManifest.xml` (debug). Asıl repodaki `android/` **bayat** (paket yolu `com/anonymous/hhkscaffold`), analizde kullanılmadı | K4-debug |
| Prebuild'siz yapılandırma | `npx expo config --type introspect --json` (repoya yazmaz; çıktı scratchpad'de) | K1 (araç çıktısı) |
| 16 KB sayfa boyutu | `zipalign -c -P 16 -v 4` başarılı; 23 `.so` dosyasının hepsinde ELF LOAD hizası `0x4000` (x86_64; arm64 release'te tekrarlanmalı) | K4-debug |
| iOS | `supportsTablet` yok (yalnızca iPhone, iPad'de uyumluluk kipi); yön: portrait + upsideDown; `aps-environment: development` | introspect (K1) |

## 1. Bulgu tablosu

Sahip: MOB = mobile-engineer, REL = release-manager, SEC = security-reviewer, PRV = privacy-compliance-analyst, BAT = Batuhan kararı.

### 1.1 İzinler (soru 1)

| ID | Sürüm | Bulgu | K | Kaynak | Öneri | Sahip |
|---|---|---|---|---|---|---|
| P-01 | 33+ | Hiç sorulmamış izin `status:'denied', canAskAgain:true, granted:false` döner (`areAllDenied` ve `!areEnabled` dalları `UNDETERMINED`den önce geliyor). Uygulama kararı `granted`/`canAskAgain` üzerinden veriyor, doğru. | K1 + K4 (emülatör tekrar turunda BLG-01 GEÇTİ) | `node_modules/expo-notifications/android/.../permissions/NotificationPermissionsModule.kt:67-75`; `src/notify/scheduler.ts:79-89`; `src/notify/wiring.ts:54-71` | Yok (doğru) | - |
| P-02 | 24-32 | Klasik dal: izin yok, `status = areNotificationsEnabled()` ve `canAskAgain = areEnabled`. Varsayılan açık olduğu için `granted`. Kullanıcı kapattıysa `denied + canAskAgain:false`, UI "Ayarları aç" gösterir. `requestPermissionsAsync` diyalog göstermez, yalnızca durumu okur. Uygulama davranışı doğru. | K1 | `NotificationPermissionsModule.kt:43-48, 91-112` | Android 12 AVD'de (API 31/32) bir tur K4 | MOB/QA |
| P-03 | 33+ | **Kaydırıp kapatma riski.** Android belgesi: "diyalog kaydırılıp kapatılırsa izin durumu değişmez" (sistem tekrar sorabilir). Expo `withBlockedTracking`, sonuç DENIED iken `shouldShowRequestPermissionRationale` false ise `blocked=true` yazıyor. İlk sorguda kapatma bu koşulu sağlayabilir. Sonuç: `canAskAgain:false`, uygulama isteği hiç yapmaz ve yalnızca "Ayarları aç" der. Belgeye göre sistem hâlâ sorabilir. | K1 (kaynak + doküman), **doğrulanmadı** | `node_modules/expo-modules-core/.../permissions/PermissionsService.kt:73-86, 267-278`; [notification-permission](https://developer.android.com/develop/ui/views/notifications/notification-permission) | K4: aşağıdaki plan V-03. Doğrulanırsa: `canAskAgain:false` iken de "Ayarları aç"ın yanında bir kez istek denemek zararsızdır (kalıcı retse sistem diyalog göstermeden DENIED döner) | MOB |
| P-04 | 33+ | **Bayat "blocked" bayrağı.** Kalıcı ret, sonra Ayarlar'dan izin verme, sonra Ayarlar'dan tekrar kaldırma: Expo bayrağı yalnızca istek sonucunda günceller. Bu yüzden `canAskAgain:false` kalır. Sistem aslında tekrar sorabilir. Sonuç güvenli taraf (Ayarları aç), UX küçük. | K1 | `PermissionsService.kt:57, 73-86` | V-04 ile gözle; kod değişikliği gerekmez | - |
| P-05 | 13+ | "Ayarları aç" `Linking.openSettings()` ile uygulama bilgi sayfasını açıyor, bildirim sayfasını değil (bir dokunuş fazla). | K1 | `src/app/(main)/settings.tsx:126-128` | İsteğe bağlı: `Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [{key:'android.provider.extra.APP_PACKAGE', value:'com.batuhan.haftik'}])` | MOB |
| P-06 | 26+ | Kullanıcı yalnızca "Hatırlatmalar" kanalını kapatırsa `areNotificationsEnabled()` true kalır. Uygulama "izin var" görür, bildirimler sessizce düşer. Uygulama bunu göremez. | K1 | `NotificationPermissionsModule.kt:56-57` (kanal önemi okunmuyor) | Bilinçli kabul veya `getNotificationChannelAsync(...).importance === NONE` kontrolü; v1 için Düşük | BAT/MOB |
| P-07 | 33+ | Kod yorumu, Android 13'te "kanal yoksa diyalog çıkmayabilir" diyor. Resmi belgeye göre bu yalnızca **targetSdk 32 ve altı** için geçerli. targetSdk 36'da uygulama diyaloğun zamanını tamamen kendisi kontrol ediyor. İstekten önce kanal oluşturmak zararsız. | K1 | `src/notify/wiring.ts:51-52`; notification-permission belgesi | Yorumu düzelt (belge işi) | MOB |
| P-08 | iOS | iOS tek sefer sorar: ret sonrası `canAskAgain:false`. Mevcut mantık uyumlu. `requestPermissionsAsync` varsayılanı alert+badge+sound ister (rozet kullanılmıyor). | K1 | expo-notifications iOS varsayılanları | S11'de gerekirse `ios:{allowBadge:false}` | MOB |

### 1.2 Bildirim zamanlaması (soru 2)

| ID | Sürüm | Bulgu | K | Kaynak | Öneri | Sahip |
|---|---|---|---|---|---|---|
| N-01 | 24-30 / 31+ | API < 31 ise **exact** (`setExactAndAllowWhileIdle`), 31+ ve `SCHEDULE_EXACT_ALARM` yoksa **inexact** (`setAndAllowWhileIdle`, `RTC_WAKEUP`). Android 13+ yeni kurulumda bu izin ön-verilmiyor. `USE_EXACT_ALARM` alarm/takvim uygulamalarına özel, Haftik uygun değil. | K1 + K4 (emülatörde ~82 sn gecikme ölçülmüş) | `node_modules/expo-notifications/.../delegates/ExpoSchedulingDelegate.kt:105-120`; [alarm belgesi](https://developer.android.com/develop/background-work/services/alarms/schedule) | Mevcut karar doğru. Beklenti "birkaç dk" değil, **"1 saate kadar"** olarak yazılmalı | MOB (belge) |
| N-02 | 31+ | Belge: "Android 12+ inexact alarm, tetik zamanından sonraki **1 saat içinde** çağrılır, pil tasarrufu/Doze kısıtları hariç". 23:00 hatırlatması teoride 00:xx'te gelebilir. O anda "Bugün" yeni gündür, bildirim önceki günü kasteder. Dün'e 1 gün geri gidilebildiği için veri kaybı yok, ama metin/an uyumsuzluğu var. | K1 | alarm belgesi; `src/domain/notify-plan.ts:66-84`; `docs/emulator-test-sonuclari.md` B-02 | Karar: (a) kabul et, (b) 23:00 seçeneğini kaldır, (c) teslimde gün kontrolü (yeni kod). `dumpsys alarm` pencere alanlarıyla ölç (V-10) | BAT |
| N-03 | 24+ | Tetik tipi `DATE`: Android'de mutlak epoch ms (`RTC_WAKEUP`), iOS'ta `UNTimeIntervalNotificationTrigger`. **Saat dilimi değişince** (seyahat) alarm eski yerel saatte çalar. Uygulama öne gelince `syncNotificationsNow` yeniden planlar. Kütüphane `TIMEZONE_CHANGED`/`TIME_SET` dinlemiyor. | K1 | `NotificationTriggers.kt:56-73`; `NotificationsService.kt:33-39` (yalnızca BOOT/REBOOT/QUICKBOOT/MY_PACKAGE_REPLACED); `node_modules/expo-notifications/ios/.../TriggerRecords.swift:96-110`; `src/app/_layout.tsx:47-60` | Kabul edilebilir (v1). Hermes'in çalışan süreçte TZ değişimini görüp görmediği **doğrulanmadı** (V-08) | QA |
| N-04 | tümü | DST: Türkiye'de DST yok (Europe/Istanbul sabit +3). Yurt dışı kullanıcıda 20:00-23:00 saatleri DST geçiş penceresine (01:00-03:00) denk gelmez. 7 günlük pencere, `new Date(y,m,d,h,mm)` ile her gün için o günün ofsetiyle hesaplanıyor, doğru. | K1 + K2 (T-02..07 Jest'te atlanıyor) | `src/domain/notify-plan.ts:51-54` | V-09 (emülatörde TZ=Europe/Berlin, Ekim sonu geçişi) | QA |
| N-05 | 24+ | Yeniden başlatma: `BOOT_COMPLETED`/`REBOOT`/`QUICKBOOT_POWERON`, SharedPreferences'taki istekleri yeniden kurar. **Geçmişte kalmış DATE tetikleri silinir, telafi edilmez** (cihaz kapalıyken kaçan hatırlatma gelmez). Alıcı `directBootAware` değil, ilk kilit açılışından sonra çalışır. | K1 | `NotificationsService.kt:33-39, 828-829`; `ExpoSchedulingDelegate.kt:22-31, 61-65`; `NotificationTriggers.kt:64-72` | Beklenen ("telafi yok" spec'e uygun). V-07 (emülatör reboot) | QA |
| N-06 | 15+ | **Zorla durdurma.** Android 15'te uygulama "stopped" durumuna girince **tüm PendingIntent'ler iptal edilir**. Kullanıcı uygulamayı açana kadar `BOOT_COMPLETED` de gelmez. Bazı OEM'lerde son uygulamalardan kaydırmak zorla durdurma gibi davranır (cihazda doğrulanmadı). | K1 | [Android 15 tüm uygulamalar](https://developer.android.com/about/versions/15/behavior-changes-all) | V-06 (`am force-stop` sonra `dumpsys alarm`). OEM kısmı K5 | QA |
| N-07 | 28+ | Standby bucket: Restricted kovada günde 1 alarm; Android 13+'da 8 gün etkileşimsizlik sonrası. Plan zaten 7 günle sınırlı (`REMINDER_WINDOW_DAYS`). Rare kovada saatte 1 alarm, günlük 1 bildirim için yeterli. **Pratik etkisi düşük.** | K1 | [appstandby](https://developer.android.com/topic/performance/appstandby), [power-details](https://developer.android.com/topic/performance/power/power-details); `notify-plan.ts:39` | V-11 (`am set-standby-bucket ... rare`) | QA |
| N-08 | 26+ | Kanal `hhk-reminders`, önem DEFAULT, ses belirtilmemiş: kanalın varsayılan sesi çalar (ön plan işleyicisindeki `shouldPlaySound:false` yalnızca ön planı etkiler). Kanal önemi/sesi **oluşturulduktan sonra uygulama tarafından değiştirilemez**. v1'den sonra değişecekse yeni kanal kimliği gerekir. | K1 | `src/notify/scheduler.ts:118-126, 195-209`; Android `NotificationChannel` sözleşmesi | Karar kaydı: sesli mi sessiz mi, yayından ÖNCE kesinleştir (tek yönlü kapı) | BAT/MOB |
| N-09 | tümü | "Kart hazır" yalnızca içinde bulunulan haftanın Pazar 20:00'i için ve eşik aşıldıysa planlanır. Eşik bir check-in ile aşılır, check-in `sync` tetikler (`today.tsx:91`). Mantık tutarlı. Pazar check-in'i yoksa bildirim gelir ama kart önce check-in ister (K3 ara ekranı), ürün akışıyla uyumlu. | K1 + K2 | `src/domain/notify-plan.ts:87-96` | B-06 (Pazar teslimi) hâlâ koşulmadı: V-05 | QA |
| N-10 | OEM | Xiaomi/HyperOS (autostart kapalı, BOOT alınmaz), Samsung (uyuyan uygulamalar), Oppo/Vivo/Huawei (agresif öldürme) güvenilirliği bozar. **Emülatörde görülemez.** | K0/K1 (üçüncü taraf bilgi, cihazda doğrulanmadı) | dontkillmyapp.com (kamuya açık derleme) | K5 cihaz planı D-02/D-03 | QA |

### 1.3 Yaşam döngüsü (soru 3)

| ID | Sürüm | Bulgu | K | Kaynak | Öneri | Sahip |
|---|---|---|---|---|---|---|
| L-01 | tümü | **Rota sıfırlanmasının kök nedeni.** `configChanges` = `keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode|smallestScreenSize|assetsPaths`. `fontScale`, `density`, `locale`, `layoutDirection` yok. Bunlardan biri değişince Activity yeniden yaratılıyor. `MainActivity.onCreate` `super.onCreate(null)` ile kaydedilmiş durumu **bilerek atıyor**, JS kökü yeniden monte ediliyor ve rota `/`'a dönüyor (YB-6). Karanlık mod (`uiMode`) ve katlama/döndürme (`screenSize|smallestScreenSize`) yeniden yaratmıyor. | K1 + K4 (YB-6 gözlemi) | birleşik manifest `:96-103`; `C:\hhk\haftik\android\app\src\main\java\com\batuhan\haftik\MainActivity.kt:23` | v1 için kabul. Gerekirse config plugin ile `fontScale|density|locale` eklenir, ama RN'in bu değişimleri canlı uyguladığı K4 ile doğrulanmadan yapılmamalı | BAT/MOB |
| L-02 | tümü | Süreç ölümü (bellek baskısı, izin kaldırma, "etkinlikleri saklama"): yarım check-in seçimi, önizlemedeki gizle/göster durumu ve açık kart ekranı kaybolur. Soğuk açılış: `_layout` → kapı → Bugün. Kayıtlı veri (SQLite) güvende. Paylaşım sayfası açıkken ölüm: PNG önbellekte kalır, açılışta süpürülür (P-08 GEÇTİ). | K1 + K4 (P-08, D-01) | `src/app/_layout.tsx:37-43` | V-12 (`am kill` + `settings put global always_finish_activities 1`) ile kayıp listesini doğrula | QA |
| L-03 | tümü | Gün/hafta dönümü: `useNow` AppState `active` ve gece yarısı/Pazar 20:00 `setTimeout` zinciri kullanıyor (BLG-03 K4 GEÇTİ). RN Android'de uzun `setTimeout` sayacı arka planda donar. Öne gelişte AppState yolu bunu telafi ediyor. `msUntilNextTick` gece yarısında tamponla yeniden kuruluyor. | K1 + K4 | `src/lib/now.ts:69-118` | Yok | - |
| L-04 | 33+ | Çalışma zamanı izni Ayarlar'dan **kaldırılınca** Android'in süreci öldürüp öldürmediği POST_NOTIFICATIONS için doğrulanmadı. Öldürüyorsa kullanıcı dönüşte Bugün'e düşer (L-01 ile aynı sonuç). | K0 (doğrulanmadı) | - | V-04: `pm revoke` öncesi/sonrası `pidof` | QA |
| L-05 | tümü | Her öne gelişte `syncNotificationsNow` önce hepsini iptal ediyor, sonra kuruyor (izin diyaloğu, paylaşım sayfası dönüşleri dahil). İdempotent ve seri kuyrukta. İptal ile kurulum arasında süreç ölürse plan bir sonraki açılışa kadar boş kalır (düşük olasılık). | K1 + K2 | `src/notify/scheduler.ts:127-157`; `src/notify/sync.ts:36-80` | Kabul | - |

### 1.4 Ekran, sistem çubukları, büyük ekran (soru 4)

| ID | Sürüm | Bulgu | K | Kaynak | Öneri | Sahip |
|---|---|---|---|---|---|---|
| E-01 | 16 (API 36) | **targetSdk 36 + sw>=600dp (tablet, açılmış katlanabilir): `screenOrientation`, `resizeableActivity`, min/max en-boy oranı YOK SAYILIR.** Uygulama yatayda tam ekran açılır. Geçici çıkış yolu `PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY` (API 37 hedeflenince kalkacak). Bugün ekranının 411x914 dikey bütçesi yatayda (ör. 1280x800dp, küçük tablette ~960x600dp) hiç denenmedi. Kart ekranı `computeCardDisplayScale` ile küçülür (iyi). | K1 | [Android 16 davranış değişiklikleri](https://developer.android.com/about/versions/16/behavior-changes-16); birleşik manifest `:101`; `src/card/layout.ts:27-32` | V-15 (API 36 Pixel Tablet ve Pixel Fold AVD). Karar: yatay düzeni kabul edilebilir kıl (ScrollView, yan boşluklar) ya da geçici çıkış özelliğini manifest'e ekle (config plugin) | BAT/MOB |
| E-02 | 15+ | Edge-to-edge zorunlu (targetSdk 35+). API 36'da `windowOptOutEdgeToEdgeEnforcement` de devre dışı. Proje zaten `edgeToEdgeEnabled=true`. Üst boşluk `useTopInset`, alt boşluk sekme çubuğu (react-navigation) ve kart/onboarding için `SafeAreaView`. | K1 + K4 (YB-1 düzeltmesi, Pixel 7 jest gezinmesi) | `android/gradle.properties` `edgeToEdgeEnabled=true`; `src/hooks/use-top-inset.ts:11-13`; `src/card/CardRevealView.tsx:142` | V-13: 3 tuşlu gezinme (yarı saydam %80 çubuk) ve yatay (E-01) için sol/sağ boşluk; sekme ekranları yalnızca `top` alıyor | QA |
| E-03 | 16 | Predictive back: `predictiveBackGestureEnabled:false`, yani `enableOnBackInvokedCallback="false"`. API 36'da geçici çıkış olarak geçerli, API 37 hedeflenince kalkabilir. | K1 | `app.json:21`; birleşik manifest `:75`; Android 16 belgesi | 2027 hedef API geçişine not | MOB |
| E-04 | 14+ | Yazı ölçeği: kart `allowFontScaling={false}` (PNG sabit). Sekme etiketi 2.0'da bitişik (YB-4 açık). Android 14 doğrusal olmayan ölçeklemesinin RN'de uygulanıp uygulanmadığı doğrulanmadı. | K4 (font 2.0 turu) / K0 | `docs/emulator-tekrar-dogrulama.md` | V-14 (`settings put system font_scale 2.0`, API 34+) | QA |

### 1.5 Manifest, izinler, bileşenler, yedek (soru 5)

| ID | Sürüm | Bulgu | K | Kaynak | Öneri | Sahip |
|---|---|---|---|---|---|---|
| M-01 | tümü | Birleşik izinler (debug): `INTERNET`, `VIBRATE`, `RECEIVE_BOOT_COMPLETED`, `POST_NOTIFICATIONS`, `ACCESS_NETWORK_STATE`, `WAKE_LOCK`, `com.google.android.c2dm.permission.RECEIVE`, `BIND_GET_INSTALL_REFERRER_SERVICE` (expo-application → `installreferrer:2.2`), `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` (androidx, imza düzeyi), 13 launcher rozet izni (ShortcutBadger, expo-notifications). `SYSTEM_ALERT_WINDOW` yalnızca debug varyantında (release'te `tools:node="remove"`). Tehlikeli izin: yalnızca POST_NOTIFICATIONS. | K4-debug | birleşik manifest `:11-68`; `node_modules/expo-notifications/android/build.gradle:43-45`; `node_modules/expo-application/android/build.gradle:18` | Release profilinde `blockedPermissions`'a eklenebilir: rozet izinleri, `c2dm.permission.RECEIVE`, `BIND_GET_INSTALL_REFERRER_SERVICE` (kullanılmıyor). Önce V-17 ile release manifest, sonra karar | BAT/MOB |
| M-02 | tümü | FCM: `ExpoFirebaseMessagingService`, `FirebaseMessagingService`, `FirebaseInstanceIdReceiver` (exported, `c2dm.permission.SEND` korumalı, yalnızca GMS gönderebilir), `FirebaseInitProvider`, `ComponentDiscoveryService` (Installations + DataTransport). `google-services.json` yok: FirebaseApp başlatılmıyor (logcat "Default FirebaseApp failed to initialize", G-03). Push token yalnızca `PushTokenModule`/`TopicSubscriptionModule` çağrılınca isteniyor, uygulama çağırmıyor. | K1 + K4-debug | birleşik manifest `:149-238`; `node_modules/expo-notifications/.../tokens/PushTokenModule.kt:89` | "Ağ yok" iddiası için release'te PCAPdroid (V-18). Bileşenleri `tools:node="remove"` ile atmak mümkün ama FCM sınıfları kalır. Getirisi düşük, gerekmez | SEC |
| M-03 | 31+ | **`allowBackup=false` yetmeyebilir.** Resmi belge: "targetSdk 31+ uygulamalarda **bazı üreticilerin** cihazlarında `allowBackup=false` bulut yedeğini kapatır ama **cihazdan cihaza aktarımı kapatmaz**." `dataExtractionRules` (`<device-transfer>`) tanımlı değil. API 30 ve altında `allowBackup=false` ikisini de kapatır. | K1 | [autobackup](https://developer.android.com/guide/topics/data/autobackup); birleşik manifest `:72` (dataExtractionRules yok) | Ürün kararı: cihaz değiştiren kullanıcının geçmişi taşınsın mı? (a) Taşınmasın: config plugin ile `data_extraction_rules.xml` (`<cloud-backup>` ve `<device-transfer>` altında `root`/`database`/`sharedpref` için exclude) ve manifest'te `android:dataExtractionRules`. (b) Taşınsın: gizlilik metni "yedeklenmez" demesin. Samsung Smart Switch davranışı K5 | BAT → MOB/PRV |
| M-04 | tümü | Dışa açık bileşenler: yalnızca `MainActivity` (LAUNCHER + `haftik://` BROWSABLE), `FirebaseInstanceIdReceiver` (izin korumalı), `ProfileInstallReceiver` (`DUMP` korumalı). Diğer hepsi `exported=false`. `haftik://` her uygulama/web sayfası tarafından tetiklenebilir. Rota parametre doğrulaması K4'te geçti (K-08). | K4-debug + K4 | birleşik manifest `:96-117, 180-191, 266-284` | Yok. `decode-uri-component` DoS'u için bkz. D-02 | - |
| M-05 | tümü | FileProvider yolları: `SharingFileProvider` → `external-path "."` (tüm harici depolama kökü), `files-path`, `cache-path`. Provider `exported=false`, izin yalnızca paylaşılan URI için veriliyor. Geniş yol tanımı gereksiz ama erişim tanımsız URI'ye açılmıyor. | K1 | `node_modules/expo-sharing/android/src/main/res/xml/sharing_provider_paths.xml`; `node_modules/expo-sharing/.../SharingModule.kt:31-52` | Kabul (kütüphane varsayılanı) | - |
| M-06 | tümü | `expo.modules.updates.*` meta-data var ama `expo-updates` paketi yok: etkisiz. `usesCleartextTraffic=true` yalnızca debug varyantında. | K4-debug | birleşik manifest `:82-94`; `android/app/src/debug/AndroidManifest.xml` | V-17'de release'te `usesCleartextTraffic` olmadığını teyit et | REL |
| M-07 | Play | Hedef API: 31 Ağu 2026'dan itibaren yeni uygulama ve güncellemeler **API 36** hedeflemeli (uzatma 1 Kas 2026'ya kadar). Proje 36, uyumlu. 16 KB sayfa şartı (targetSdk 35+, 1 Kas 2025'ten beri): debug x86_64'te geçti, arm64 release'te tekrarla. | K1 + K4-debug | [target-sdk](https://developer.android.com/google/play/requirements/target-sdk); [page-sizes](https://developer.android.com/guide/practices/page-sizes) | V-17'de `zipalign -c -P 16` + `llvm-readelf -lW` (arm64-v8a) | REL |

### 1.6 Paylaşım ve geçici dosya (soru 6)

| ID | Sürüm | Bulgu | K | Kaynak | Öneri | Sahip |
|---|---|---|---|---|---|---|
| S-01 | tümü | **Erken silme yarışı.** `shareAsync`, seçici `startActivityForResult` ile açılıyor ve promise `OnActivityResult`'ta çözülüyor. Bu an hedef uygulamanın akışına bağlı: hedef kendi görevinde açılırsa sonuç hemen döner. Dosyayı sonradan/arka planda okuyan hedeflerde (Drive'a kaydet, Quick Share, bazı e-posta taslakları, Telegram) `finally` içindeki `deleteAsync` dosyayı hedef okumadan silebilir. FileProvider URI'si o zaman "dosya yok" verir. | K1 (**doğrulanmadı**) | `node_modules/expo-sharing/.../SharingModule.kt:39-52, 80-85`; `src/card/share.ts:51-66` | K4: emülatörde Gmail/Drive/Mesajlar hedefleriyle V-19. Doğrulanırsa: paylaşım sonrası anında silme yerine açılış süpürmesine ve/veya "N dakikadan eski" silmesine bırak (gizlilik kazancı küçük, dosya uygulamanın özel önbelleğinde) | MOB |
| S-02 | tümü | **PNG netliği cihaz yoğunluğuna bağlı.** view-shot görünümü kendi piksel boyutunda yakalar (360dp x yoğunluk), sonra `Bitmap.createScaledBitmap` ile 1080x1920'ye getirir. 420 dpi (2,625): 945x1680'den 1,14x büyütme. 320 dpi (2,0): 720x1280'den **1,5x büyütme, yumuşak metin**. 480 dpi ve üstünde net. Emülatördeki "1080x1920" ölçümü de büyütülmüş bir görüntüydü. | K1 | `node_modules/react-native-view-shot/.../ViewShot.java:611-612, 800-801`; `src/card/layout.ts:10-13`; `src/card/CardView.tsx:179-180` | V-20 (`wm density 320` + PNG karşılaştırma). Çözüm yönü: yakalanan görünümü `1080/PixelRatio.get()` dp genişlikte düzenlemek (ölçü katsayısı). Paylaşılan "wow anı" kalitesi için Önemli | MOB |
| S-03 | 24-29 | view-shot geçici dosyası, harici önbellekte daha çok boş alan varsa **harici önbelleğe** yazılıyor. `sweepSnapshotFiles` yalnızca `cacheDirectory`'yi (dahili) süpürüyor. Android 10 ve altında `Android/data/<pkg>` depolama izni olan uygulamalarca okunabilir. Emülatörde dosya dahili önbellekteydi (P-06). | K1 | `node_modules/react-native-view-shot/.../RNViewShotModule.java:176-198`; `src/card/temp-cleanup.ts:30-50` | `captureRef(..., {result:'base64'})` ile yakalayıp `cacheDirectory`'ye kendin yaz (tam kontrol) ya da harici önbelleği de süpür | MOB/SEC |
| S-04 | tümü | **Belge düzeltmesi:** CLAUDE.md ve `temp-cleanup.ts` başlığı "view-shot CleanTask açılışta ve kapanışta çalışır" diyor. Kaynakta CleanTask **yalnızca `invalidate()`** içinde (React bağlamı yıkılırken), kurucuda/başlatmada yok. Süreç öldürülünce çalışmaz. | K1 | `RNViewShotModule.java:48-51` | CLAUDE.md "Bilinen tuzaklar" S10 SEC I-1 notunu düzelt | MOB |
| S-05 | tümü | `dialogTitle` yalnızca seçici başlığı, hedefe metin taşımaz. Seçici niyeti yalnızca `EXTRA_STREAM` ve tip taşıyor, `EXTRA_TEXT` yok. K5 bağlantısı yalnızca PNG içindeki damgada. | K1 | `SharingModule.kt:39-42, 116-121` | Beklenen; mağaza bağlantısı metin olarak isteniyorsa RN `Share` veya ek `EXTRA_TEXT` gerekir (yeni kod, ayrı karar) | BAT |
| S-06 | tümü | Hedef davranışları: 1080x1920 (9:16), opak beyaz zemin (`CardView.tsx:181`), yani WhatsApp'ın JPEG'e çevirmesinde siyah köşe riski yok. WhatsApp görüntüyü yeniden sıkıştırır (küçük metin bozulabilir). Instagram Hikâye 9:16 ile uyumlu. Instagram seçicide "Hikâyeler" hedefi sunar ama davranışı sürümle değişir. | K1/K0 (hedef uygulama davranışı cihazda doğrulanmadı) | `docs/emulator-tekrar-dogrulama.md` (PNG chunk'ları) | K5: WhatsApp sohbet + Durum, Instagram Hikâye, Galeri (V-C3) | QA |
| S-07 | iOS | iOS: view-shot `NSTemporaryDirectory()/ReactNative/` altına yazar, expo-file-system bu dizini sunmaz. `UIActivityViewController` tamamlama işleyicisi paylaşım uzantısı bittikten sonra çağrılır, erken silme riski Android'den düşük. `dialogTitle` iOS'ta yok sayılır. | K1 | `src/card/temp-cleanup.ts` başlığı; expo-sharing iOS | S11 cihaz maddesi | MOB |

### 1.7 Mağaza ve politika (soru 7)

| ID | Platform | Bulgu | K | Kaynak | Öneri | Sahip |
|---|---|---|---|---|---|---|
| G-01 | Play | Health apps beyanı kapalı test dahil **tüm** uygulamalar için zorunlu. Kategorilerde "Sleep Management" (uyku düzenini izleme/iyileştirme) ve "Activity and Fitness" var. Haftik'te "Uyku" ve "Hareket" emoji seviyeleri var. Beyan S12 kararıyla uyumlu, dürüstçe doldurulacak. | K1 | [Health apps beyanı](https://support.google.com/googleplay/android-developer/answer/14738291) | Formda "uyku izleme özelliği var mı" sorusunu kelimesi kelimesine oku; S12 kararı (etiket kalır, beyan dürüst) geçerli | BAT/PRV |
| G-02 | Play | Data safety: yalnızca cihazda işlenen veri "toplama" sayılmaz. SDK davranışı da beyana dahil. Kullanıcının başlattığı paylaşım (paylaşım sayfası) "paylaşma" istisnasında. FCM başlatılmadığı sürece Firebase veri göndermez. Bu, release'te ağ gözlemiyle (V-18) K5'e çıkmalı. | K1 | [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469) | V-18 geçmeden formu kesin sayma (s12 rehberiyle aynı) | PRV/REL |
| G-03 | Play | İzin gerekçesi formu yalnızca hassas izinler için (exact alarm, konum vb.). Haftik'te yok. `POST_NOTIFICATIONS` normal çalışma zamanı izni, beyan gerektirmez. `USE_EXACT_ALARM`/`SCHEDULE_EXACT_ALARM` eklenmemeli (N-01). | K1 | alarm belgesi | Yok | - |
| G-04 | Play | Hedef yaş 18+ (Families dışı). Manifest ve SDK'larda reklam kimliği yok (`AD_ID` izni birleşik manifestte yok). | K4-debug | birleşik manifest | Formda "reklam kimliği kullanılmıyor" | PRV |
| G-05 | iOS | **CLAUDE.md düzeltmesi:** "`expo-notifications` plugin'i bilerek eklenmedi, `aps-environment` gelmez" kaydı yanlış. `@expo/prebuild-config`, `expo-notifications`'ı `versionedExpoSDKPackages` listesinden **otomatik** uyguluyor. Introspect çıktısı: `ios.entitlements = {"aps-environment":"development"}`. EAS iOS derlemesi App ID'de Push yeteneğini açar. Yerel bildirim için gereksiz ama zararı düşük (inceleme sorunu değil). | K1 (araç çıktısı) | `node_modules/@expo/prebuild-config/build/plugins/withDefaultPlugins.js:171-174`; `node_modules/expo-notifications/plugin/build/withNotificationsIOS.js:9-13`; introspect JSON | S11: kabul et ya da küçük bir config plugin ile yetkiyi sil; CLAUDE.md notunu düzelt | MOB/REL |
| G-06 | iOS | Introspect: `ITSAppUsesNonExemptEncryption` yok (her yüklemede ihracat uyumu sorusu), `NSAllowsArbitraryLoads: true` (uygulama ağ kullanmıyor), iPad desteği yok (iPhone uyumluluk kipi), SQLite `Documents/SQLite` altında, yani **iCloud yedeğine giriyor** (K7 açık). Gizlilik manifesti (required-reason API) EAS/prebuild çıktısında kontrol edilmeli. | K1 | introspect; `node_modules/expo-sqlite/ios/SQLiteModule.swift:24-28` | S11: `ios.config.usesNonExemptEncryption:false`; ATS'yi release'te daralt; K7 için native `NSURLIsExcludedFromBackupKey` plugin'i | MOB/REL/PRV |

### 1.8 Sürüm ve bağımlılıklar (soru 8)

| ID | Bulgu | K | Kaynak | Öneri | Sahip |
|---|---|---|---|---|---|
| D-01 | Kurulu ve en son yama: `expo` 57.0.24 → .25; `expo-notifications` .20 → .21 (CHANGELOG: "kullanıcıya dönük değişiklik yok"); `expo-router` .22 → .23; `expo-sharing` .21 → .22; `expo-linking` .10 → .11. `expo-file-system`, `expo-sqlite`, `safe-area-context` güncel. `react-native-view-shot` 5.1.1 var, expo-doctor işaretlemiyor. | K1 (`npm view` çıktısı, 2026-09-25) | npm registry; unpkg CHANGELOG | Yükseltme riski düşük, ama native modül yaması olduğu için **yeni native derleme** gerekir. En iyi zaman, zaten gerekecek preview APK derlemesinden ÖNCE (`npx expo install --check`). Sonra V-17 ile birlikte kısa K4 regresyonu | MOB |
| D-02 | `expo-router@57.0.23` hâlâ `query-string ^7.1.3` kullanıyor. Yani `decode-uri-component@0.2.2` DoS advisory'si bu yamayla **kapanmıyor**. | K1 (`npm view expo-router@57.0.23 dependencies`) | s10-ops-raporu §4 | Değişiklik yok. Etkisi kendine DoS (kötü niyetli `haftik://` bağlantısı); `overrides` denemesi ayrı iş | SEC |

## 2. İzin durum makinesi (Android 13+, targetSdk 36): gerçek dönüşler ve uygulama tepkisi

| Durum (OS) | Expo dönüşü (`status / granted / canAskAgain`) | Uygulama | K |
|---|---|---|---|
| Hiç sorulmadı | denied / false / true | İster (onboarding "İzin ver", Ayarlar anahtarı) | K1 + K4 |
| 1 kez "İzin verme" | denied / false / true (gerekçe gösterilebilir) | Tekrar ister (2. diyalog) | K4 (tekrar turu) |
| 2 kez "İzin verme" (kalıcı) | denied / false / false | İstemez, "Ayarları aç" | K4 |
| Diyalog kaydırılıp kapatıldı | **muhtemelen** denied / false / false (P-03) | İstemez. Sistem aslında sorabilir | K1, doğrulanmadı |
| Ayarlar'dan verildi | granted / true / - | Odak/öne gelişte okunur, plan kurulur | K4 (`pm grant` ile, UI yoluyla değil) |
| Verildikten sonra Ayarlar'dan kaldırıldı | denied / false / (eski bayrak: çoğunlukla true, kalıcı ret geçmişi varsa false, P-04) | Planlama durur, **mevcut alarmlar iptal edilmez** (`sync.ts:52-55`), teslimde sistem bildirimi bastırır | K1 |
| Android 12 ve altı, varsayılan | granted / true | Diyalog yok | K1 |
| Android 12 ve altı, kullanıcı kapattı | denied / false / false | "Ayarları aç" | K1 |

## 3. Riskler (pre-mortem: "6 ay sonra neden şikâyet geldi?")

1. "Hatırlatma geç ya da hiç gelmiyor". Kaynaklar: inexact pencere (N-02, 1 saate kadar), OEM öldürme/autostart (N-10), zorla durdurma (N-06), 7 gün açmayınca plan biter (tasarım gereği). Etki: D7 metriği düşer ve ürün hatası sanılır. Azaltma: mağaza/onboarding metninde "yaklaşık" dili, OEM cihaz testi (K5).
2. "Paylaştım, WhatsApp'ta/Drive'da görünmedi". Kaynak: S-01 erken silme. Etki doğrudan "wow anı"na. Azaltma: V-19 hemen, gerekirse silmeyi ertele.
3. "Kart bulanık". Kaynak: S-02 (düşük yoğunluklu ekranlar). Etki: paylaşılan görselin kalitesi.
4. "Tablette yan yatıyor, taşıyor". Kaynak: E-01 (Android 16, targetSdk 36). Etki: kullanıcıların küçük bir dilimi, ama Play büyük ekran kalite rozetini ve incelemeleri etkiler.
5. "Yeni telefona geçince verilerim geldi, ama gizlilik metni yedeklenmez diyordu". Kaynak: M-03. Etki: güven ve KVKK metin tutarlılığı.

Geri döndürülemez (tek yönlü) kapılar: bildirim kanalı önemi/sesi (N-08), paket adı (zaten kesin), `dataExtractionRules` politikası
(ilk sürümle yayılır; sonradan değişirse eski yedekler yine de oluşmuş olur).

## 4. Doğrulama planı

Ön koşul: `C:\hhk\haftik` kopyası robocopy ile güncel. Paket `com.batuhan.haftik`. `P=com.batuhan.haftik`. Mümkünse **release/preview**
derlemesi (`eas build --profile preview` APK). Bildirim ve manifest maddeleri debug'da da koşulabilir.

### A. Yalnızca emülatörle doğrulanabilir (K4). Önerilen komutlar

| # | Madde | Komut / adım | Beklenen |
|---|---|---|---|
| V-01 | P-01 regresyon | `adb shell pm clear $P`, onboarding "İzin ver", `adb shell dumpsys package $P \| grep POST_NOTIFICATIONS` | Diyalog çıkar; Allow ise `granted=true, USER_SET` |
| V-02 | P-02 (API 31/32 AVD) | Ayarlar'dan bildirimleri kapat, uygulamada anahtar | "Ayarları aç" görünür, diyalog yok |
| V-03 | P-03 kaydırma | `pm clear`, "İzin ver", diyalogda **geri tuşu** (`adb shell input keyevent 4`), Ayarlar sekmesi, sonra `adb shell run-as $P cat shared_prefs/expo.modules.permissions.asked.xml` | Belgeye göre izin durumu değişmez. Uygulama "Ayarları aç" gösteriyorsa ve anahtar istek yapmıyorsa P-03 doğrulanır |
| V-04 | P-04, L-04 | Kalıcı ret, `pm grant`, `adb shell pidof $P`, `pm revoke $P android.permission.POST_NOTIFICATIONS`, `pidof` | Süreç öldü mü (L-04); dönüşte `canAskAgain` değeri (P-04) |
| V-05 | N-09 (B-06) | 3 check-in, `adb root; adb shell date` ile Pazar 19:58, `dumpsys alarm \| grep -A6 $P`, `dumpsys notification --noredact \| grep -A3 hhk-reminders` | `card-<Pazar>` 20:00 civarı teslim |
| V-06 | N-06 | `adb shell am force-stop $P`, `dumpsys alarm \| grep -c $P` | Android 15: 0 (PendingIntent'ler iptal). Uygulamayı açınca yeniden kurulmalı |
| V-07 | N-05 (D-04) | `adb reboot` (yalnızca izinli oturumda), kilit aç, `dumpsys alarm` | Geleceğe ait alarmlar geri kurulur, geçmişte kalanlar yok |
| V-08 | N-03 (B-07) | Uygulama arka plandayken `adb shell cmd alarm set-timezone Europe/Berlin` (API 30+; yoksa Ayarlar > Tarih/saat), öne getir, `dumpsys alarm` | Alarm epoch'ları yeni TZ'de 21:00'a kaymalı. Kaymazsa Hermes TZ önbelleği şüphesi (yeniden başlatmadan sonra düzelirse kanıt) |
| V-09 | N-04 (B-09) | TZ Europe/Berlin, tarih 2026-10-23, plan kur, `dumpsys alarm` | 25 Ekim sonrası alarmlar hâlâ yerel 21:00 (UTC 20:00'ye döner) |
| V-10 | N-02 pencere | `adb shell dumpsys alarm` içinde uygulamanın `RTC_WAKEUP` kayıtları: `window=`, `whenElapsed`, `maxWhenElapsed` alanları; `adb shell dumpsys deviceidle force-idle` ile Doze | İzin verilen teslim penceresinin genişliği ölçülür (inexact kanıtı) |
| V-11 | N-07 | `adb shell am set-standby-bucket $P rare` (sonra `restricted`), 21:00'e sar | Rare: gelir. Restricted: günde 1 |
| V-12 | L-02 | `adb shell settings put global always_finish_activities 1`, yarım seçim/önizleme, ana ekran, geri dön; sonra `am kill $P` | Kayıp listesi; sonra ayarı 0'a döndür |
| V-13 | E-02 | `adb shell cmd overlay enable com.android.internal.systemui.navbar.threebutton` (geri dönüş: `...navbar.gestural`), tüm ekranlar | Sekme çubuğu/Paylaş gezinme çubuğunun altında kalmaz |
| V-14 | E-04 | API 34+ AVD, `adb shell settings put system font_scale 2.0` | Sekme etiketi (YB-4), ekran taşmaları |
| V-15 | E-01 | **API 36** Pixel Tablet ve Pixel Fold AVD; yatay/dikey, katla/aç | Yatayda Bugün/Hafta/Kart kullanılabilir mi; katlamada rota korunuyor mu (L-01) |
| V-16 | L-01 | `adb shell cmd uimode night yes` (yeniden yaratmamalı), `settings put system font_scale 1.3` (yeniden yaratır), `wm density 320` | Yalnızca fontScale/density rota sıfırlar |
| V-17 | M-01, M-06, M-07 | Preview APK: `aapt2 dump permissions app.apk`; `apkanalyzer manifest print app.apk`; `zipalign -c -P 16 -v 4 app.apk`; arm64 `.so` için `llvm-readelf -lW` | `SYSTEM_ALERT_WINDOW` ve `usesCleartextTraffic` yok, hizalama 0x4000 |
| V-18 | M-02, G-02 | Release APK + PCAPdroid (emülatörde de kurulabilir) ya da `adb shell dumpsys netstats detail \| grep -A3 <uid>`; açılış, check-in, kart, paylaşım, bildirim akışları | Uygulama UID'sinden **0 bayt**. `firebaseinstallations`/`fcm` bağlantısı yok |
| V-19 | S-01 | Google APIs'li AVD: kart paylaş → Gmail (taslak), Drive'a kaydet, Mesajlar; eşzamanlı `adb shell run-as $P ls -la cache` | Ek dosya hedefte görünür/yüklenir mi; `cache`'teki PNG'nin silindiği an |
| V-20 | S-02 | `wm density 320` ve 420, kartı paylaş, `run-as $P cat cache/ReactNative-snapshot-image*.png > kart.png` (seçici açıkken) | İki PNG'de metin kenar keskinliği karşılaştırması |
| V-21 | S-03 | Paylaşım sayfası açıkken `adb shell ls /sdcard/Android/data/$P/cache` | Dosya dahili mi harici mi |

### B. Gerçek cihaz / release gerektirir (K5). Emülatör sonucu yerine geçmez

| # | Madde | Neden emülatör yetmez |
|---|---|---|
| C-01 | 3 gün boyunca günlük hatırlatmanın gerçek teslim saati (cihaz cepte, ekran kapalı, Doze), en az 1 Pixel/stok ve 1 Samsung | Gerçek Doze, hareket sensörü, pil yönetimi |
| C-02 | Xiaomi/Redmi (HyperOS) + Oppo/Realme veya Huawei: reboot sonrası ve son uygulamalardan kaydırma sonrası hatırlatma | OEM autostart/öldürme politikaları (N-10) |
| C-03 | WhatsApp sohbet + Durum, Instagram Hikâye, Galeri/Fotoğraflar, Telegram: PNG görünür mü, sıkıştırma sonrası okunaklı mı, K5 metni taşınıyor mu | Hedef uygulamalar emülatörde yok (S-01, S-05, S-06) |
| C-04 | Cihazdan cihaza aktarım: Google "Verilerinizi kopyalayın" ve Samsung Smart Switch ile eski telefondan yeniye; Haftik geçmişi taşındı mı | Üretici bağımlı (M-03) |
| C-05 | Düşük yoğunluklu (xhdpi 320) gerçek cihazda PNG netliği | S-02 gerçek ekran algısı |
| C-06 | Kilit ekranı bildirim içeriği, FLAG_SECURE/son uygulamalar küçük resmi (P-09, G-10) | Emülatör `screencap`'i bayrağı atlayabilir |
| C-07 | Release derlemede ağ trafiği (V-18'in cihaz tekrarı) | "Üretimde ağ yok" iddiasının nihai kanıtı |
| C-08 | Reveal animasyon akıcılığı, 8 sn check-in kronometresi | Dokunmatik his |

### C. iOS (S11; Apple üyeliği gelince)

1. Sim/cihazda izin: ilk istek, ret sonrası `canAskAgain:false` (P-08).
2. `aps-environment` kararı (G-05); `usesNonExemptEncryption`; ATS release değeri (G-06).
3. iCloud yedek hariç tutma: `Documents/SQLite` için native plugin (G-06, K7).
4. Paylaşım: `UIActivityViewController`, Instagram Hikâye uzantısı, tmp dosya temizliği (S-07).
5. Saat dilimi değişimi: TimeInterval tetikleyicisi, açılışta yeniden planlama (N-03).

## 5. Belge düzeltmeleri (kod değil; CLAUDE.md "Bilinen tuzaklar")

| Kayıt | Gerçek | Kanıt |
|---|---|---|
| MOB/S8: "`expo-notifications` config plugin'i BİLEREK eklenmedi (iOS'ta `aps-environment` getirir)" | Plugin prebuild tarafından otomatik uygulanıyor; `aps-environment: development` zaten ekli | G-05 (introspect) |
| MOB/S10 SEC I-1: "modülün kendi CleanTask'ı ... modül örneği oluşurken ve kapanırken temizler" | Yalnızca `invalidate()`'te | S-04 |
| MOB/S8: "birkaç dakikalık sapma" | Belge 1 saate kadar izin veriyor (Doze/pil tasarrufu hariç) | N-01/N-02 |
| `wiring.ts` yorumu: "Android 13'te kanal yoksa diyalog çıkmayabilir" | Yalnızca targetSdk 32 ve altı için | P-07 |

## 6. Devir

```
Durum:        bitti (kaynak + doküman + debug derleme çıktısı analizi); emülatör/cihaz koşuları yapılmadı (talimat gereği)
Yapıldı:      bu dosya; expo config introspect (scratchpad), debug APK 16 KB hizalama + aapt2 badging (salt okunur)
Kanıt:        K1 ağırlıklı; manifest/izin/hizalama K4-debug; önceki emülatör K4 sonuçlarına atıf
Açık / risk:  P-03, S-01, S-02, E-01, M-03 doğrulanmadı (K1) -> V-03, V-19, V-20, V-15, C-04
Karar gerek:  N-02 (23:00 + inexact), N-08 (kanal sesi, tek yönlü), M-03 (cihazdan cihaza aktarım), E-01 (yatay/tablet),
              M-01 (fazla izinleri engelleme), S-05 (paylaşımda metin)
Sonraki:      qa-engineer/verifier -> V-01..V-21; mobile-engineer -> S-01/S-02/S-03, P-05, belge düzeltmeleri;
              release-manager -> D-01 yama (preview derlemeden önce), V-17/V-18; privacy-compliance-analyst -> M-03, G-01/G-02
```

## Kaynaklar

- [Google Play hedef API şartı](https://developer.android.com/google/play/requirements/target-sdk)
- [Play Console: hedef API seviyesi](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en)
- [Alarm planlama](https://developer.android.com/develop/background-work/services/alarms/schedule)
- [App Standby kovaları](https://developer.android.com/topic/performance/appstandby) ve [güç sınırları](https://developer.android.com/topic/performance/power/power-details)
- [Bildirim çalışma zamanı izni](https://developer.android.com/develop/ui/views/notifications/notification-permission)
- [Auto Backup / dataExtractionRules](https://developer.android.com/guide/topics/data/autobackup)
- [Android 15 davranış değişiklikleri (tümü)](https://developer.android.com/about/versions/15/behavior-changes-all) ve [targetSdk 35](https://developer.android.com/about/versions/15/behavior-changes-15)
- [Android 16 davranış değişiklikleri (targetSdk 36)](https://developer.android.com/about/versions/16/behavior-changes-16)
- [16 KB sayfa boyutu](https://developer.android.com/guide/practices/page-sizes) ve [Play duyurusu](https://android-developers.googleblog.com/2025/05/prepare-play-apps-for-devices-with-16kb-page-size.html)
- [Health apps beyanı](https://support.google.com/googleplay/android-developer/answer/14738291)
- [Data safety tanımları](https://support.google.com/googleplay/android-developer/answer/10787469)

# 22 - Platform gerçekleri v2 (Haftik v1.1 / v1.5) - 2026-09-28 (tamamlandı 2026-09-29)

Hazırlayan: mobile-platform-specialist (Principal, karar alanı: platform gerçekleri). Kod, `app.json`, emülatör DEĞİŞMEDİ; commit yok.
Önceki tur: `05-platform-gercekleri.md` (bu belge onu tekrar etmez, yalnızca yeni kanıt, karar ve v1.1/v1.5 etkisi ekler).
K ölçeği: `~/.claude/team/ortak-standartlar.md` (K1 kaynak/doküman, K2 birim, K4 emülatör, K4-rel = release derleme çıktısı, K5 cihaz).

## Özet

1. **İzinler (K4-rel, release APK `aapt2`):** INTERNET, ACCESS_NETWORK_STATE, WAKE_LOCK, c2dm, install referrer ve **16** rozet izni uygulamanın hiçbir yolunda kullanılmıyor (K1). "Ağ yok" sözünü mekanik yapmak için öneri: **release'e özel manifest plugin'iyle INTERNET'i kaldırmak (C)**; debug/Metro etkilenmez. WAKE_LOCK ilk build'de kalır (24 ile uzlaşma, 1.6).
2. **Yedek (SEC2-1):** `allowBackup=false` targetSdk 36'da D2D aktarımı garanti kapatmıyor; `dataExtractionRules` plugin'i 0.2.0'dan önce (tek yönlü kapı), emülatörde D2D test moduyla doğrulanabilir (1.5).
3. **R8:** ek keep kuralı beklenmiyor; risk koşulmamış yollar. 26'nın 20 satırına **7 ekleme** (reboot, güncellemede plan, API 24-30 exact yol, izin kaldırma regresyonu, kanal kapalı, C çıktıları, yedek kuralı) ve **yöntem düzeltmesi**: release APK'da `run-as` yok, önbellek kontrolü root'lu Google APIs imajı ister (2.4).
4. **Serileştirme tuzağı (K1):** okunamayan planlı bildirim kaydı sessizce atlanır ve `cancelAll` onu silemez; uygulama açılınca onarılır. R8'i ilk dış dağıtımdan önce aç.
5. **Paylaşım:** netlik (yoğunluğa bağlı büyütme), Türkçe büyük harf (`textTransform` yerel dile bağlı), emoji farkı, tarihsiz dosya adı ve Story güvenli bandı C düzeninin girdileri (3.4). Kare çıktı ikinci build'e.
6. **Bildirim:** Android 12+ "1 saate kadar" gecikme kabul; Pazar'da iki bildirim ters sırada gelebilir -> kart Pazar'ında günlük yok. **Kanal kapatılınca izin "granted" görünür** (K1), Ayarlar kanalı da okumalı. İki kanal kararı tek yönlü. Teslim edilmiş bildirimler silmede, Kaydet'ten sonra ve kart açılınca kaldırılmalı (4.4).
7. **Ekran:** 3 tuşlu gezinmede paylaşım seçicisi 912/914 dp (sığmaz, kaydırma şart); 360x780 sınıfı test matrisine girmeli. Açık tema kilidi `expo-system-ui` ile çalışır; Android 16 genişletilmiş koyu tema etkisi doğrulanmadı.
8. **Widget v2** (yerel RemoteViews en sağlam yol); v1.1 için **uygulama kısayolları** (0,5 gün). Play: exact alarm/pil muafiyeti/medya izni ekleme; yan yükleme doğrulaması Türkiye'de 2027.
9. **OEM:** emülatörde görülemez; dürüst metin + "Bildirim gelmiyor mu?" yardım satırı + deneme formunda marka sorusu.

Rapor boyutu brifteki ~25 KB sınırını aşıyor (~58 KB); bölüm 1-3 önceki turdan, tablo biçimi korunarak yazıldı. Hızlı okuma için bu özet ve bölüm 9 yeterli.

## 1. Merged manifest (release) çözümlemesi ve INTERNET kararı

**Kaynak (K4-rel):** `C:/hhk/haftik/android/app/build/outputs/apk/release/app-release.apk` (35,1 MB, R8 AÇIK derleme, `mapping.txt` mevcut; 12'nin bıraktığı çıktı), `aapt2 dump permissions` + `dump badging`, ve `outputs/logs/manifest-merger-release-report.txt` (her satırın hangi AAR'dan geldiği). Ölçüm bugün salt okunur yapıldı; derleme tekrarlanmadı. Sonuç: `targetSdkVersion 36`, `minSdk 24`, `versionCode 1`; `allowBackup="false"`; `usesCleartextTraffic` release'te YOK (05 M-06 kapandı); `SYSTEM_ALERT_WINDOW`, `READ/WRITE_EXTERNAL_STORAGE` `tools:node="remove"` ile düşmüş; `AD_ID` YOK.

### 1.1 İzin -> kaynak -> kaldırılabilir mi

| İzin (release APK) | Ekleyen (merger raporu) | Uygulama kullanıyor mu | Kaldırma yolu | Kaldırma riski |
|---|---|---|---|---|
| `INTERNET` | Ana manifest (Expo şablonu) + `expo.modules.filesystem:57.0.7` + `firebase-installations:18.0.0` + `play-services-cloud-messaging:17.2.0` + `transport-backend-cct:3.1.9` | **Hayır** (kod okuması: `src/` içinde `fetch`/`XMLHttpRequest`/`WebSocket` yok, `no-push.test.ts` yasak adlar; K1+K2) | `blockedPermissions` (tüm varyantlar) ya da yalnız release varyantına `tools:node="remove"` (config plugin), bkz. 1.3 | Debug/dev client'ta Metro soketi kırılır (yalnız tüm varyantlardan kaldırılırsa). Release'te bilinen tüketici yok; K4-rel ile doğrulanmalı |
| `ACCESS_NETWORK_STATE` | `firebase-messaging:25.0.1`, `firebase-installations`, `play-services-cloud-messaging`, `transport-backend-cct`, `transport-runtime` | Hayır | `blockedPermissions` | Bir kütüphane `ConnectivityManager` çağırırsa izin yokluğu `SecurityException` verir. Kurulu Expo/RN modüllerinin Kotlin/Java kaynağında `ConnectivityManager` **0 eşleşme** (grep, K1). Firebase bileşenleri başlatılmadığı için çağrılmaz (K1). K4-rel gerekli |
| `WAKE_LOCK` | `firebase-messaging`, `play-services-cloud-messaging` | Hayır. `expo-notifications` kaynağında `WakeLock`/`PowerManager` **0 eşleşme**; `RTC_WAKEUP` alarmı `onReceive` süresince sistem kilidiyle çalışır | `blockedPermissions` | Düşük; bildirim teslimi K4-rel'de (Doze dahil) yeniden görülmeli |
| `com.google.android.c2dm.permission.RECEIVE` | `firebase-messaging`, `play-services-cloud-messaging` | Hayır (push yok) | `blockedPermissions` | Yok (push kullanılmıyor). FCM servis bileşenleri ayrıca `tools:node="remove"` ile atılabilir, getirisi küçük (05 M-02) |
| `BIND_GET_INSTALL_REFERRER_SERVICE` | `com.android.installreferrer:installreferrer:2.2` (`expo-application` bağımlılığı, `expo-notifications` üzerinden transitif) | Hayır. Tek çağrı noktası `ApplicationModule.kt:65` `getInstallReferrerAsync`; uygulama çağırmıyor (K1) | `blockedPermissions` | Yok |
| 16 rozet izni (`com.sec`, `htc`, `sonyericsson`, `sonymobile`, `anddoes`, `majeur`, `huawei` x3, `READ_APP_BADGE`, `oppo` x2, `me.everything` x2) | `me.leolin:ShortcutBadger:1.1.22` (`expo-notifications/android/build.gradle:45`) | Hayır. Tek kullanım `BadgeHelper.setBadgeCount` (`setBadgeCountAsync`); uygulama rozet koymuyor (`shouldSetBadge:false`, `scheduler.ts:206`) | `blockedPermissions` (16 satır) | Yok; `applyCountOrThrow` try içinde (K1). 05'teki "13" ve 12'deki "~12" sayısı yanlış: release APK'da **16** |
| `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED` | `expo-notifications` (+ firebase-messaging) | **Evet** | Kalır | - |
| `VIBRATE` | Ana manifest (şablon) | Şu an hayır; v1.1 Kaydet haptiği (bkz. 7) kullanırsa evet | Kalır (haptik önerisiyle) | - |
| `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` | androidx.core (imza düzeyi, uygulamanın kendi izni) | Sistem içi | Kalır | Kaldırılmamalı (Android 13+ dinamik alıcılar) |

Ek bileşen gözlemi (K4-rel manifest): Firebase `FirebaseInitProvider`, `ComponentDiscoveryService`, DataTransport (`TransportBackendDiscovery`, `JobInfoSchedulerService`, `AlarmManagerSchedulerBroadcastReceiver`, **CCT backend** = Google'a log gönderen taşıma katmanı) APK'da duruyor. `google-services.json` yok -> `FirebaseApp` başlatılamıyor (09 turunda logcat "Default FirebaseApp failed to initialize"); DataTransport'u yalnız Firebase bileşenleri tetikler (K1, **ölçülmedi**). `queries` bloğunda `https` VIEW (expo-web-browser/linking kalıntısı), `OPEN_DOCUMENT_TREE`, `SEND` var: paket görünürlüğü, izin değil; `SEND` sorgusu paylaşım için gerekli.

### 1.2 "Üretimde ağ yok" sözü için gereken kanıt (merdiven)

1. **K1 (var):** kaynak okuması + `no-push.test.ts` + bu tablo.
2. **K4-rel (yapılabilir, emülatör):** release APK + `adb shell dumpsys netstats detail` / PCAPdroid (05 V-18) tam akış (açılış, onboarding, izin, check-in, kart, paylaşım, rapor, silme, bildirim teslimi, reboot). Beklenen: uygulama UID'sinden 0 bayt.
3. **Mekanik kanıt (en güçlüsü):** release'te `INTERNET` yok. İzin yoksa işletim sistemi soket açmayı reddeder (`EACCES`); yani söz "ölçtük, trafik görmedik"ten "yapamaz"a çıkar ve Play mağaza sayfasında izin listesi de bunu gösterir. Bu, `aapt2 dump permissions` çıktısıyla (1 satır) kanıtlanır.
4. **K5:** Batuhan'ın telefonunda preview APK, aynı akış (07 E5/E6).

Not: "INTERNET yok" iddiası paylaşılan PNG'nin hedef uygulamayla internete çıkmasını kapsamaz (kullanıcı eylemi; Data safety istisnası). Site metni bunu zaten ayırıyor.

### 1.3 INTERNET izni: seçenekler

| Seçenek | Nasıl | Artı | Eksi | Efor |
|---|---|---|---|---|
| A. Olduğu gibi bırak, ölç | V-18/E6 ağ gözlemi | Değişiklik yok | Söz "ölçüldü" düzeyinde kalır; her yeni bağımlılıkta tekrar ölçüm; mağazada INTERNET görünür | 0 |
| B. Profil bazlı `app.config.js` | `app.json` korunur; `app.config.js` `({config}) =>` içinde `process.env.HAFTIK_NO_NETWORK === '1'` ise `android.blockedPermissions`e `INTERNET`, `ACCESS_NETWORK_STATE`, `WAKE_LOCK`, c2dm, referrer, 16 rozet eklenir; `eas.json` `preview`/`production` profillerine `env: { HAFTIK_NO_NETWORK: "1" }` | Kod yok, yalnız yapılandırma; dev client etkilenmez | Yerel `assembleRelease` env unutulursa izin geri gelir (sessiz); EAS'ın profil `env`'ini config çözümlemesinde kullandığı **doğrula** | 0,25 gün + K4-rel |
| C. Release varyantına özel manifest (config plugin) | `withDangerousMod` ile `android/app/src/release/AndroidManifest.xml` yazılır, izinler `tools:node="remove"` | Her release derlemesinde mekanik (EAS, yerel, profil fark etmez); debug/Metro dokunulmaz | ~30 satır plugin kodu, prebuild testi | 0,5 gün + K4-rel |
| D. Tüm varyantlardan (`app.json` `blockedPermissions`) | Tek satır | En basit | Dev client/Metro kırılır (07 ve CLAUDE.md OPS/S10 notu) | - (önerilmez) |

**Öneri: C** (B kabul edilebilir yedek). Rozet/c2dm/referrer/`ACCESS_NETWORK_STATE`/`WAKE_LOCK` ise tüm varyantlarda kaldırılabilir (Metro'yu etkilemez; `WAKE_LOCK` için sıra 1.6'da): bunlar doğrudan `app.json` `blockedPermissions`e girebilir (tek build'de toplanmalı, 07 §5). Sıra: (1) mevcut haliyle K4-rel ağ ölçümü (referans), (2) C ile derle, `aapt2 dump permissions` = yalnız `VIBRATE`, `RECEIVE_BOOT_COMPLETED`, `POST_NOTIFICATIONS`, `WAKE_LOCK` (ilk build, 1.6), `DYNAMIC_RECEIVER...` (24'ün hedef listesiyle aynı), (3) R8 K4 turu (bölüm 2) aynı APK'da. Karar Batuhan'ın (9. bölüm S1).

### 1.4 Ağ ölçümü: emülatörde uygulanabilir yöntem (24 §1.3'ü tamamlar)

24 §1.3'teki S1-S4 statik adımları ve PCAPdroid planı geçerli; tekrar yazmıyorum. Ek K4 yolu (root/uygulama gerektirmez): `emulator -avd <AVD> -tcpdump C:\hhk\cap\haftik.pcap` ile emülatörü başlat, release APK'yı kur, 1.2'deki tam akışı koş, sonra pcap'te DNS sorgularını ve TLS SNI adlarını listele. Emülatörün kendi GMS trafiği karışır: önce uygulamasız 10 dk'lık **referans** yakala, sonra farkı oku; `firebaseinstallations.googleapis.com`, `firebaselogging*`, `exp.host` adları **0** olmalı. Uygulamaya özgü ayrım için ek kontrol: `adb shell dumpsys netstats detail` çıktısında uygulama UID'sinin (`dumpsys package com.batuhan.haftik | grep userId`) satırı 0 bayt olmalı. Seçenek C uygulandıysa ölçüm "yapamaz" kanıtını pekiştiren **ikincil** kanıt olur.

### 1.5 Yedek ve cihazdan cihaza aktarım (SEC2-1 ile tutarlı)

**Gerçek (K1, resmi belge):** targetSdk 31+ uygulamada `allowBackup="false"`, "**bazı üreticilerin** cihazlarında bulut yedeğini kapatır ama cihazdan cihaza aktarımı kapatmaz" ([autobackup](https://developer.android.com/identity/data/autobackup)). Release manifestte `dataExtractionRules` yok (K4-rel). Yani SQLite (`files/SQLite/`) ve expo-notifications'ın SharedPreferences planı yeni telefona **taşınabilir**. 24 "D2D açık" diyor, 05 "bazı üreticiler" diyordu: belge ikincisini söylüyor, ama sonuç aynı; söz ("telefon değişirse veri taşınmaz") bugün garanti değil.

**Önerilen yapılandırma (config plugin, tek build'de):** `res/xml/data_extraction_rules.xml`, hem `<cloud-backup>` hem `<device-transfer>` altında `root`, `file`, `database`, `sharedpref`, `external` ve `device_*` alan adları için `exclude`; `<application android:dataExtractionRules="@xml/data_extraction_rules">`. API 30 ve altı için `allowBackup=false` zaten ikisini kapatır. Kaynak manifestten başvurulduğu için `shrinkResources` atmaz (K1). Tek yönlü kapı (05 §3): ilk dış dağıtımdan (0.2.0) **önce** girmeli.

**Doğrulama:** (1) K4-rel: `aapt2 dump xmltree --file AndroidManifest.xml app-release.apk | grep dataExtraction` ve `aapt2 dump resources ... | grep data_extraction`. (2) K4 (GMS'li imaj, Android 12+): belgenin D2D test modu: `bmgr enable true`, `settings put secure backup_enable_d2d_test_mode 1`, `bmgr transport com.google.android.gms/.backup.migrate.service.D2dTransport`, `bmgr init ...`, `bmgr backupnow com.batuhan.haftik`; beklenen: yedeklenen uygulama verisi yok/boş; sonra test modu kapatılır ([testingbackup](https://developer.android.com/identity/data/testingbackup)). (3) K5: Samsung Smart Switch gibi OEM aktarımları kendi yolunu kullanabilir, **cihazda doğrulanmadı**. Karar: 9. bölüm S3.

### 1.6 Diğer raporlarla uzlaşma (açık çelişkiler)

| Konu | 24 / 05 diyor | Bu belge (kanıt) | Uzlaşma önerisi |
|---|---|---|---|
| `WAKE_LOCK` | 24 M2: engellenmemeli (minSdk 24'te bildirim servisi wake lock alabilir) | Merger raporu: tek ekleyenler `firebase-messaging` ve `play-services-cloud-messaging` (K4-rel, `manifest-merger-release-report.txt:830-833`). expo-notifications, expo-*, view-shot Kotlin/Java kaynağında `WakeLock`/`PowerManager`/`JobIntentService` 0 eşleşme (K1). `RTC_WAKEUP` alarmı alıcının `onReceive`'i boyunca sistem kilidiyle çalışır, uygulama izni gerekmez (K1) | **İlk build'de kalsın** (24 ile uyumlu, maliyeti yok; kullanıcıya görünen etkisi küçük). Kaldırma ikinci adım, yalnız R-3/R-4 ve Doze testi (4.5) geçerse. 1.1 tablosundaki "kaldırılabilir" satırı bu sıraya tabi |
| Rozet izni sayısı | 24: 17; 05: 13; 12: ~12 | `aapt2 dump permissions` release APK'da **16** satır (K4-rel, bugün sayıldı; `DYNAMIC_RECEIVER...` rozet değil) | `blockedPermissions` listesi 16 adla yazılır; S3 altın listesi aapt2 çıktısından türetilir, elle sayılmaz |
| Firebase bileşenlerini manifestten silmek | 05 M-02: getirisi düşük; 24 M4: sil | Seçenek C uygulanırsa (INTERNET yok) Firebase başlatılsa bile ağa çıkamaz; bileşen silme **isteğe bağlı hijyen**. C uygulanmazsa silme, "yapamaz" kanıtına en yakın ikinci yol | C seçilirse: yalnız c2dm/rozet/referrer/ACCESS_NETWORK_STATE engellensin, bileşen silme v2. C seçilmezse: 24 M4 uygulanır |
| Story güvenli alanı | 18 §2.8: üst 250 / alt 340 px | 3.2'deki alt %35 (~670 px) **reklam** CTA'sını da içeren birleşik öneriydi (ikincil kaynak) | Düzen 18'in organik bandını kullanır; unvan ve marka ayrıca 270-1500 px içinde kalsın (iki kaynağın kesişimi). K5 ile tek kez ölçülür |

## 2. R8 / shrink riski

**Durum:** 12, R8+shrink ile release derledi (44,46 -> 35,10 MB), açılış/onboarding/check-in smoke'u FATAL'sız geçti; bildirim, paylaşım, deep link, PNG, silme R8'de **denenmedi**. `android/` prebuild ürünü; bayraklar `android/app/build.gradle:69,116-119` `findProperty('android.enableMinifyInReleaseBuilds')` ile okunuyor, varsayılan kapalı.

### 2.1 Keep kuralı gerekir mi? (bağımlılık bazında)

| Bağımlılık | Mevcut koruma (K1 kaynak) | R8 mapping kanıtı (K4-rel, `outputs/mapping/release/mapping.txt`) | Ek kural | Kalan risk |
|---|---|---|---|---|
| `expo-modules-core` (tüm Expo modüllerinin köprüsü) | `expo-modules-core/android/proguard-rules.pro`: `@DoNotStrip`, `Record`, `Enumerable`, `SharedObject`, `Module` (`allowobfuscation`) | `SharingModule -> expo.modules.sharing.b` (adı değişti, izinli); `SharingOptions` (Record) adı korundu | Gerekmez | Kotlin tip dönüşümü (argüman `Map`/`List`/Record) yalnız çağrılınca görülür: her native çağrı yolu K4'te bir kez koşulmalı |
| `expo-notifications` | `proguard-rules.pro`: `-keep class expo.modules.notifications.** {*;}` | `NotificationRequest`, `DateTrigger` adları korundu | Gerekmez | **Java serileştirme:** planlı istekler SharedPreferences'ta `ObjectOutputStream` + Base64 (`Base64Serialization.kt`, `SharedPreferencesNotificationsStore.kt:37,54`). R8'siz derlemenin yazdığı kayıtları R8'li güncelleme okurken `serialVersionUID` farkı `InvalidClassException` verebilir (çıkarım, doğrulanmadı). Etki: güncelleme sonrası (`MY_PACKAGE_REPLACED`) yeniden kurulum başarısız, uygulama açılana kadar hatırlatma yok; açılış senkronu (`cancelAll` + yeniden kur) onarır. **Önlem: R8'i ilk dış dağıtımdan (arkadaş APK) ÖNCE aç**, çapraz-derleme verisi hiç oluşmasın |
| `expo-sqlite` | JNI sınıfları `@DoNotStrip` (`NativeDatabaseBinding.kt:12,14,74`, `SQLExceptions.kt:20-28`); C++ `findClassStatic("expo/modules/sqlite/NativeDatabaseBinding")` | `NativeDatabaseBinding` adı korundu | Gerekmez | Hata yolu (`SQLiteErrorException`, JNI'dan fırlatılan) nadiren koşar: K4'te bilerek hata üretmek zor, düşük risk |
| `react-native-view-shot` | New Arch codegen spec (`NativeRNViewShotSpec`), RN'in AAR tüketici kuralları; yansıma kullanımı 0 (grep) | `RNViewShotModule` adı korundu | Gerekmez | Yakalama + dosya yazma yolu K4'te |
| `expo-sharing`, `expo-file-system` (legacy) | Core kuralları; `SharingFileProvider` manifestte tam adla | `DeletingOptions` korundu | Gerekmez | FileProvider + URI izni K4'te |
| `expo-router` / deep link | Saf JS (Hermes bytecode R8'den etkilenmez); native taraf RN `IntentModule`/`expo-linking` | - | Gerekmez | `haftik://card/<Pzt>` soğuk + sıcak K4 |
| Firebase (transitif) | Kendi tüketici kuralları; `ComponentDiscovery` manifest meta-data ile | - | Gerekmez | 12 smoke: FATAL yok |
| `react-native-reanimated` | Şablon `app/proguard-rules.pro` keep satırı | - | Paket kaldırılırsa satır zararsız kalır | - |
| Kaynak küçültme | RN varlıkları `drawable/node_modules_*`, `raw/*inter*` R8'li APK'da **duruyor** (`aapt2 dump resources`); `.ttf` yolları kısaltılmış (`res/Kp.ttf`) ama kaynak tablosu adları korunmuş | 5.398 kaynak | Gerekmez | Yeni bildirim simgesi/`shortcuts.xml` gibi yalnız manifest'ten başvurulan kaynaklar korunur; yalnız JS'ten ada göre istenen yeni native kaynak eklenirse `res/raw/keep.xml` gerekir |

**Sonuç (K1 + K4-rel mapping):** R8 için ek keep kuralı **beklenmiyor**; risk "kural eksikliği" değil "koşulmamış yol". Kalıcı açma yolu: `expo-build-properties` config plugin'i (`android.enableMinifyInReleaseBuilds: true`, `android.enableShrinkResourcesInReleaseBuilds: true`; yalnız prebuild'de çalışır, çalışma zamanı kodu/ağ yok; `npx expo install` ile SDK uyumlu sürüm). Gerekirse aynı plugin'in `extraProguardRules` alanı kullanılır.

### 2.2 R8 sonrası K4 turu (release APK, `adb`; her satır bir kez)

| # | Akış | Neden R8'de ayrıca | Beklenen |
|---|---|---|---|
| R-1 | Soğuk açılış, onboarding, izin diyaloğu (izin ver / reddet / geri tuşu) | izin modülü Record dönüşleri | 12 smoke + V-03 davranışı aynı |
| R-2 | Check-in kaydet, Dün, düzenle | sqlite JNI | DB satırı (release'te `run-as` yok: uygulama içi görünümle doğrula) |
| R-3 | Bildirim planlama: `dumpsys alarm \| grep com.batuhan.haftik` 7 kayıt; teslim; dokunma | serileştirme + `DateTrigger` | 7 `RTC_WAKEUP`, bildirim teslim, `logcat` `InvalidClassException` yok |
| R-4 | `adb reboot` sonrası `dumpsys alarm` | `BOOT_COMPLETED` -> store okuması | Gelecek alarmlar geri kurulu |
| R-5 | Uygulama güncellemesi (`adb install -r` aynı imza, R8'li -> R8'li) | `MY_PACKAGE_REPLACED` | Alarmlar korunur |
| R-6 | Kart aç (Hafta ve `adb shell am start -d haftik://card/<Pzt>`), reveal, gizle/göster, Paylaş -> seçici | view-shot, sharing, FileProvider | PNG hedefte açılır; dönüşte önbellek temiz (release'te dosya listesi görülemez, 09'daki debug sonucu referans) |
| R-7 | Deneme raporu paylaş, "Tüm verilerimi sil" | file-system legacy, transaction | Rapor açılır; silme sonrası onboarding |
| R-8 | `logcat -b crash` ve `logcat \| grep -E "ClassNotFound|NoSuchMethod|InvalidClass|CodedException"` tüm tur boyunca | genel | 0 satır |

**Hata ayıklama izi:** R8 yığın izlerini karartır. Play, AAB'deki R8 eşleme dosyasını otomatik kullanır (AGP paketler; **doğrula** Console "Deobfuscation files"). Arkadaş APK'sı için `mapping.txt` her build'le saklanmalı: `eas.json` profilinde `buildArtifactPaths: ["android/app/build/outputs/mapping/release/mapping.txt"]` (**doğrula**: EAS alan adı/davranışı). Hermes JS yığını için ayrıca kaynak haritası gerekir (R8'den bağımsız).

### 2.3 Paket temizliği: platform riski (12 ve 08'e ek)

| Kalem | Platform gerçeği | Risk / kanıt |
|---|---|---|
| `react-native-reanimated` (1,54 MB .so) | `expo-router` ve `@expo/ui` peer'i isteğe bağlı; `src/` kullanımı 0 | Prebuild + tam K4 (sekme, stack geçişi, kart modalı). `worklets` `@expo/ui` üzerinden kalır |
| `react-native-gesture-handler` | JS paketine 0 bayt (12); `(main)` `Tabs` + native-stack kullanmıyor (K1) | Kaldırılırsa native .so da düşer; kaydırma/geri hareketi K4 |
| `react-native-web`, `react-dom` | Android paketine 0 bayt; native etkisi yok | Yalnız kurulum/audit yüzeyi; `web` hedefini (`app.json` `web`) bozar, ürün hedefi değil |
| Material Symbols 967 KB | `expo-router/native-tabs` iç import'u (12 §1.4) | Metro resolver yönlendirmesi; `expo export` önce/sonra + sekme ikonları K4 |
| `expo-application` / install referrer | `expo-notifications` bağımlılığı, kaldırılamaz | Yalnız izin engellenir (1.1) |

Kural: her kaldırma ayrı commit + `npx expo-doctor` + `expo prebuild --clean` + R-1..R-8. Tek build'de toplamak EAS kotasını korur (07 §3.1).


### 2.4 26'nın R-01..R-20 paketiyle karşılaştırma: eksikler ve yöntem düzeltmeleri

26 §3 paketi kapı olarak geçerlidir; 2.2'deki R-1..R-8 onun içinde kalır (R-1 ≈ R-01/R-02, R-2 ≈ R-03, R-3 ≈ R-02/R-05/R-06, R-6 ≈ R-08..R-10/R-12, R-7 ≈ R-11/R-14, R-8 ≈ R-19). **26'da olmayan, eklenmesi gereken satırlar:**

| # (öneri) | Akış | Neden | Yöntem / beklenen | K | Blokör |
|---|---|---|---|---|---|
| R-21 | **Yeniden başlatma** sonrası plan | `BOOT_COMPLETED` alıcısı SharedPreferences'taki serileştirilmiş istekleri okur (`ExpoSchedulingDelegate.kt:22-31`); R8 + serileştirme yalnız burada ve teslimde koşar | Planlı durumda `adb reboot`, kilit aç, uygulamayı AÇMADAN `dumpsys alarm \| grep com.batuhan.haftik`: gelecekteki kayıtlar geri kurulu | K4-rel | Evet |
| R-22 | **Güncelleme ile plan korunması** (R-04'e ek) | `MY_PACKAGE_REPLACED`; R8'siz yazılmış kaydı R8'li sürüm okuyamazsa `allNotificationRequests` onu **sessizce atlar** (`InvalidClassException` bir `IOException`, `SharedPreferencesNotificationsStore.kt` `mapNotNull` catch) ve `cancelAll` de o kaydı silemez; alarm çalınca `triggerNotification` kaydı siler, bildirim gelmez (K1). Uygulama açılınca aynı kimlikle yeniden yazılır, kendini onarır | Aynı imzayla `adb install -r` (önce R8'siz -> R8'li, sonra R8'li -> R8'li), uygulamayı açmadan `dumpsys alarm` + `logcat \| grep expo-notifications`. R8'siz -> R8'li geçişte kayıp görülürse "R8'i ilk dış dağıtımdan önce aç" kuralı yeterli, kod gerekmez | K4-rel | Evet (R8'li -> R8'li) |
| R-23 | Android 12 altı (API 24-30) **exact** yol | `setExactAndAllowWhileIdle` yalnız burada koşar (`ExpoSchedulingDelegate.kt:106-112`); minSdk 24 | API 28 veya 30 AVD'de release APK: planlama, teslim, dokunma. `dumpsys alarm` pencere alanı exact | K4-rel | Hayır (Önemli) |
| R-24 | **İzin kaldırma regresyonu** (Seçenek C, rozet/c2dm/referrer/`ACCESS_NETWORK_STATE` engellendiyse) | Engellenen izni çağıran gizli yol varsa yalnız çalışma anında `SecurityException` olur | R-01..R-14 aynı APK'da; R-19 grep kalıbına `SecurityException\|Permission Denial\|InvalidClassException\|EACCES` eklenir | K4-rel | Evet |
| R-25 | **Kanal kapalı** durumu | `getPermissionsAsync` yalnız uygulama düzeyi `areNotificationsEnabled()` okur (`NotificationPermissionsModule.kt:57,93`); kanal kapatılırsa "granted" görünür, bildirim hiç gelmez | Ayarlar > Bildirimler > "Hatırlatmalar" kapat; uygulama durumu ne gösteriyor? (4.2) | K4-rel | Hayır |
| R-26 | Yeni çıktılar (C yönü) | Kare PNG, yeni font (Baloo 2), büyük harf, sert gölge: `shrinkResources` + view-shot | 3.4 F-1..F-5 K4 satırları release APK'da | K4-rel | Evet (paylaşım wow anı) |
| R-27 | Yedek kuralları | 1.5 | `aapt2 xmltree` + D2D test modu | K4-rel/K4 | Evet (gizlilik sözü) |

**Yöntem düzeltmeleri (26'ya):** (1) R-09 ve R-14 "`cache`'te PNG/rapor yok" diyor; release APK `debuggable` olmadığından `run-as` **çalışmaz**. Bu kontrol yalnız `adb root` verilebilen **Google APIs** (Play Store'suz) imajda (`adb root; adb shell ls /data/data/com.batuhan.haftik/cache`) ya da ayrı `debuggable` bir release türeviyle yapılır; Play Store'lu imajda yapılamaz (K1, emülatör imaj türü). R-05 zaten root'lu imaj istiyor: aynı imaj kullanılsın. (2) R-09'daki dosya adı kalıbı, paylaşım dosyası yeniden adlandırılırsa (3.2, `Haftik-kart*.png`) güncellenmeli. (3) R-07 (bildirim simgesi) bugün jenerik daire (09 YB2-10); simge eklenirse yol 4.6'da.

## 3. Paylaşım: 9:16 ve kare, hedef uygulamalar, FileProvider, temizlik

### 3.1 Bugünkü zincir (K1 kaynak + önceki K4)

`CardView` (360x640 dp) -> `captureRef({width:1080,height:1920,format:'png'})` (`src/card/capture.ts:52-56`) -> view-shot önce **cihaz yoğunluğunda** yakalar, sonra 1080x1920'ye ölçekler (05 S-02: 320 dpi'da 1,5x büyütme) -> `cache/ReactNative-snapshot-image<N>.png` -> `expo-sharing` `ACTION_SEND` + `EXTRA_STREAM` + `setTypeAndNormalize('image/png')` + `FLAG_GRANT_READ_URI_PERMISSION` + seçicinin çözdüğü her pakete `grantUriPermission` (`SharingModule.kt:39-52,116-121`) -> `startActivityForResult`; dönüşte `deleteAsync` + açılış süpürmesi. 09 V-19: Messages/Drive/Print hedefi açıkken dosya duruyor, dönüşte siliniyor (K4). `EXTRA_TEXT` YOK, `ClipData` YOK.

### 3.2 Hedef uygulama gerçekleri (K5 doğrulanmadı, kaynak düzeyi belirtilmiş)

| Hedef | Ne olur | Kaynak / K | Tasarım sonucu |
|---|---|---|---|
| Instagram Hikâye (seçiciden "Hikâyeler") | 9:16 tam ekran; üstte profil/ad çubuğu, altta yanıt/gönder alanı PNG'nin üstüne biner. Meta'nın birleşik 9:16 güvenli alan önerisi (Mart 2026, ikincil kaynaklar): **üst %14 (~270 px), alt %35 (~670 px, reklam CTA'sı dahil), yanlar %6 (~65 px)** | ikincil (K0/K1); organik hikâyede alt örtü reklamdan küçüktür, **doğrula** K5 | Unvan ve satırlar y ~270-1500 px bandında. Bugünkü düzen: unvan y 144-420 px (üst örtünün altında kısmen kalır), damga y 1740-1860 px (alt örtünün içinde) (`src/card/layout.ts` x3). C yönü düzeni buna göre kurulmalı |
| WhatsApp Durum | Tam ekran, üstte ilerleme + profil, altta yanıt ve başlık (caption). Görsel yeniden sıkıştırılır (JPEG) | K0, doğrula K5 | Aynı güvenli bant; ince kontur ve küçük metin sıkıştırmada bozulur: 1080 genişlikte metin >= ~36 px (12 dp mantıksal), kontur >= 6 px (2 dp) önerisi (çıkarım) |
| WhatsApp sohbet | Balonda küçük resim; uzun (9:16) görseller balonda kırpılabilir/küçük görünür; açınca tam | K0 (10 §4: 0,23 ölçekte yalnız unvan okunur) | Kare (1:1) çıktının asıl gerekçesi. `EXTRA_TEXT` WhatsApp'ta görsele başlık olarak eklenir diye bilinir (K0) |
| Instagram akış / X / Telegram | Akış 1:1 ve 4:5 destekler; 9:16 kırpılır | K0 | Kare çıktı akışa da uyar |
| Galeri / Google Foto / Drive / Gmail / Quick Share | Dosya adı görünür: `ReactNative-snapshot-image7630...png` | K4 (12 §5.3 dosya adı) | Dosyayı paylaşmadan önce `cache/Haftik-kart.png` adına kopyala (tarih/kimlik YOK; kartta tarih yok kuralı dosya adı için de geçerli). Süpürme kalıbına eklenmeli |
| Android seçici (Sharesheet) | Görsel önizleme için `ClipData` ile URI verilmesi önerilir; `expo-sharing` `ClipData` koymuyor | K1 (developer.android.com/training/sharing/send); seçicide küçük resim görünüp görünmediği **K4'te gözlenmedi** | K4: seçicide küçük resim var mı? Yoksa "profesyonel his" kaybı küçük; yerel modülle çözülür (3.3) |
| Instagram Hikâye'ye doğrudan (`com.instagram.share.ADD_TO_STORY`) | Arka plan/çıkartma varlığı ile doğrudan hikâye editörü | Meta geliştirici uygulaması (Facebook App ID) şart (ikincil kaynaklar, K1) | v2'ye kadar önerilmez: Meta hesabı/uygulama kaydı "hesap yok" ilkesine ters düşmez ama bakım ve politika yükü getirir; 13 de kapsam dışı sayıyor |

### 3.3 Paylaşım mesajı (K5 bağlantısı) hedefe taşınmıyor: seçenekler

`dialogTitle` yalnız seçici başlığı (05 S-05, K1). Seçenekler: (a) **bugünkü gibi yalnız PNG içindeki damga** (sıfır maliyet; bağlantı tıklanamaz, ama her hedefte görünür); (b) `patch-package` ile `expo-sharing`e `EXTRA_TEXT` (bakım yükü, her Expo yamasında yeniden); (c) yerel Expo modülü `modules/haftik-share` (~60 satır Kotlin: `ACTION_SEND` + `EXTRA_STREAM` + `EXTRA_TEXT` + `ClipData` + mevcut `SharingFileProvider` yetkisi); (d) `react-native-share` (üçüncü taraf, büyük yüzey). Android belgesi `EXTRA_TEXT`+`EXTRA_STREAM` birlikteliğini tanımlamaz; hedef bazında davranış değişir (WhatsApp kullanır, Instagram yok sayar; K0). **Öneri: (a) v1.1'de kalsın; kısa alan adı damgada okunur olsun. (c) yalnız K5'te "bağlantı metni gerçekten tıklanıyor/isteniyor" sinyali gelirse.** 9:16 ve kare iki dosya ise (c) tek modülde `ACTION_SEND_MULTIPLE` de yapabilir ama çoğu hedef (Hikâye) çoklu kabul etmez: kullanıcı biçimi seçsin, tek dosya gitsin.

### 3.4 9:16 ve kare çıktı üretimi: platform riskleri

| # | Risk | Kanıt | Önlem |
|---|---|---|---|
| F-1 | **Yumuşak metin** (05 S-02): düzen 360 dp genişlikte, çıktı 1080 px; yoğunluk < 3,0 olan cihazda büyütme | K1 (`ViewShot.java:611-612,800-801`) | Yakalanan görünüm `W_dp = 1080 / PixelRatio.get()` genişlikte ve tüm ölçüler `k = W_dp/360` katsayısıyla çizilsin; `captureRef`e `width/height` verilmesin (ölçekleme yok). Kare için `W_dp` aynı, `H = W`. K4: `wm density 320/420/560` üç PNG'de metin kenarı |
| F-2 | Ekranda görünmeyen ikinci düzen (kare) yakalama | K1 (view-shot yalnız bağlı `View` çizer) | Kare görünümü ekran dışına (`position:absolute`, `left:-10000`) ya da önizleme içinde sekmeli çiz; `collapsable={false}`; `opacity:0` üst sarmalayıcıda olabilir, yakalanan kökte olmamalı (view-shot kökü doğrudan `draw` eder). `removeClippedSubviews` altında olmamalı. K4: iki PNG'nin piksel boyutu ve içeriği |
| F-3 | **Emoji her cihazda farklı çizilir** (Samsung kendi seti, Google Noto; Android 12 ve altında Noto bitmap/CBDT) ve büyük boyutta bitmap emoji bulanıklaşır | K1 (sistem emoji fontu, `CardView` emoji stili fontFamily almıyor, CLAUDE.md S7a) | C yönünde "çıkartma" büyük çizilecekse (~>130 px) ya kendi SVG/PNG çıkartma setini paketle (marka tutarlılığı, visual-designer) ya da emoji boyutunu <= ~120 px tut. K4: API 31 ve API 35 AVD'de aynı kartın PNG'si; K5: Samsung |
| F-4 | **Türkçe büyük harf:** RN Android `textTransform:'uppercase'` `uppercase(Locale.getDefault())` kullanır (`node_modules/react-native/ReactAndroid/.../text/TextTransform.kt:31`); cihaz dili Türkçe değilse `i -> I` (HAFTIK). Hermes `String.prototype.toUpperCase` de yerelden bağımsız | K1 | C'deki "HAFTİK", unvan çıkartması gibi büyük harfli metinler içerikte hazır büyük harfle yazılsın; `textTransform` ve `toUpperCase()` kullanılmasın. K4: `adb shell cmd locale set-app-locales` ya da sistem dili İngilizce ile kart |
| F-5 | Yeni font (C prototipi `Baloo 2` 800) | K1 (`14-.../kart-c-cikartma-albumu.html:9,50`) | `@expo-google-fonts/baloo-2` alt-yol import (Inter emsali, CLAUDE.md S7a); statik `.ttf`, ağ yok. Türkçe glif kapsamı (İ ı ş ğ Ş Ğ) **doğrula** (K0); tek ağırlık ~ yüzlerce KB; `allowFontScaling={false}` korunur |
| F-6 | Sert gölge/kontur (C) | K1 (RN Android `elevation` yumuşak gölge verir, "sert ofset gölge" vermez) | Sert gölgeyi ikinci bir ofset `View` (mürekkep rengi) ile çiz; `boxShadow` (RN 0.76+ New Arch) Android'de destekli ama PNG yakalamada K4 ile teyit. `transform: rotate` küçük açılar PNG'de kenar yumuşatmalı çizilir (sorun değil) |
| F-7 | Bellek: 1080x1920 ARGB ~8,3 MB, kare ~4,7 MB; iki yakalama art arda | K1 | Sorun değil; ikisini aynı anda tutma, biri paylaşılınca silinsin |
| F-8 | Önbellek temizliği iki dosya ve yeniden adlandırma ile | K1 (`src/card/temp-cleanup.ts` kalıbı `ReactNative-snapshot-image*.png`) | Süpürme kalıbına `Haftik-kart*.png` eklenmeli; 05 S-03 (harici önbellek) için `result:'base64'` ile yakalayıp `cacheDirectory`'ye kendin yazmak iki sorunu birlikte çözer |
| F-9 | Erken silme (05 S-01) | K4 kısmi (09 V-19: sorun görülmedi) | Paylaşım dönüşünde silme + açılışta "10 dk'dan eski" süpürme yeterli; Quick Share/Drive arka plan yüklemesi K5 |

**Boyut bütçesi:** 9:16 PNG 176 KB (12, düz renk). C yönü (desen/gölge) PNG'yi büyütür; WhatsApp zaten JPEG'e çevirir. PNG kalsın (kayıpsız, şeffaflık yok, opak zemin; 05 S-06). 1 MB'ı geçerse `format:'jpg', quality:0.92` düşünülür (K4 ile boyut ölç).


## 4. Bildirim: Doze, exact alarm, kanal, izin, tıklama yönlendirmesi, kaçırılan hafta

05 §1.2 (N-01..N-10) ve §2 (durum makinesi) geçerli; burada yalnız v1.1 kararlarına dokunan yeni gerçekler var.

### 4.1 Zamanlama gerçeği (özet, kaynaklı)

| Sürüm | Yol (K1, `ExpoSchedulingDelegate.kt:105-120`) | Kullanıcıya dürüst beklenti |
|---|---|---|
| API 24-30 | `setExactAndAllowWhileIdle` (izin gerekmez) | Dakikasında; Doze'da da çalar |
| API 31+ (izin yok, bizim durum) | `setAndAllowWhileIdle`, `RTC_WAKEUP` | Belge: tetikten sonra **1 saate kadar**; emülatörde ~82 sn ölçüldü (K4). Metinlerde "20:00 civarı", "akşam" dili |
| Doze (tümü) | "allow while idle" alarmları uygulama başına ~9 dk'da bir | Günde 1-2 bildirimde etkisiz |

`SCHEDULE_EXACT_ALARM`/`USE_EXACT_ALARM` eklenmemeli (05 N-01, G-03): Haftik alarm/takvim uygulaması değil, Play beyanı ve reddedilme riski getirir. Karar değişmedi.

**Pazar çakışması (yeni, K1):** Pazar'da `card-ready` (20:00, pencere 20:00-21:00) ve `daily` (varsayılan 21:00) ikisi de gecikmeli olabilir; iki bildirim birkaç dakika arayla ya da **ters sırada** gelebilir (20 "Pazar çift bildirim"i koddan çıkarmıştı, bu ayrıca sıra riski). Öneri (mobile-engineer, `notify-plan.ts`): kart planlanan Pazar'da `daily` üretilmez; `card-ready` metni "bugünü de işaretle" işini taşır (K3 akışı zaten bunu ister). K2 test: Pazar için plan tek öğe.

### 4.2 İzin durum makinesi: v1.1 değişikliklerine etkisi

1. **Bağlamlı izin (20 §3 önerisi, izin ilk Kaydet sonrasına):** platform açısından uygulanabilir, ama iki kural şart. (a) Sistem diyaloğundan önce **uygulama içi ön soru** ("Pazar akşamı kart hazır olunca haber verelim mi?" Evet / Şimdi değil). "Şimdi değil" işletim sistemi reddi harcamaz. İki sistem reddi sonrası `canAskAgain:false` olur ve bir daha sorulamaz (05 §2, K4): sistem diyaloğu yalnız "Evet"ten sonra açılır. (b) Android 12 ve altında izin varsayılan verilidir: ön soru "Evet" deyince diyaloğa gitmeden plan kurulur.
2. **Kanal kapalı, izin "granted" (yeni, K1):** `NotificationPermissionsModule.kt:57,93` yalnız uygulama düzeyi `areNotificationsEnabled()` ve uygulama önemini okur; kullanıcı yalnız "Hatırlatmalar" kanalını kapatırsa Ayarlar anahtarı "açık" görünür, bildirim hiç gelmez. Öneri: odak/`active`te `getNotificationChannelAsync('hhk-reminders')` okunup `importance === NONE` ise "Bildirim kanalı kapalı" + "Ayarları aç" gösterilsin. R-25 ile K4.
3. Diyalog dışına dokunma/geri tuşu (05 P-03) hâlâ **doğrulanmadı**; ön soru bu belirsizliğin etkisini de azaltır.

### 4.3 Kanal tasarımı (tek yönlü kapı, 0.2.0'dan önce)

Bugün tek kanal: `hhk-reminders`, ad "Hatırlatmalar", önem DEFAULT (`scheduler.ts:122-125`). Kanal önemi/sesi oluşturulduktan sonra uygulama tarafından değiştirilemez (05 N-08). Öneri: **iki kanal**: `daily` ("Günlük hatırlatma") ve `card-ready` ("Kart hazır"). Kullanıcı sistem ayarlarında günlük hatırlatmayı kapatıp kart bildirimini tutabilir; tek kanalda tek seçenek "hepsini kapat" olur (profesyonel beklenti; K1 Android kanal modeli). Önem DEFAULT kalsın (öne çıkan/heads-up yok, dark pattern yok). Eski kanal `deleteNotificationChannelAsync('hhk-reminders')` ile kaldırılır (bugün yalnız Batuhan'ın cihazında var). Karar: S4.

### 4.4 Tıklama yönlendirmesi (T3): native akış ve riskler

**Gerçek akış (K1):** bildirimin `PendingIntent`'i `NotificationForwarderActivity`'yi açar (`ExpoHandlingDelegate.kt:62-76`, activity trampolini; Android 12'nin servis/alıcı trampolini yasağına takılmaz), o da `getLaunchIntentForPackage` ile `MainActivity`'yi (`singleTask`) başlatır ve yanıtı JS'e iletir. Soğuk açılışta yanıt `getLastNotificationResponse()` ile, sıcakta dinleyiciyle okunur (21 §2f planı doğru).

| Risk | Kanıt | Önlem |
|---|---|---|
| Yerel bildirimde FCM dalı devreye girmez: `ExpoNotificationLifecycleListener` yalnız `google.message_id` taşıyan intent'i işler | K1 (`ExpoNotificationLifecycleListener.kt:29,66-68`) | Beklenen; yerel yol yalnız forwarder + `getLastNotificationResponse` |
| Bildirim gölgede kalır: "Tüm verilerimi sil" yalnız **planlıları** iptal eder, teslim edilmişleri silmez (`src/`te `dismissAll` 0 eşleşme, K1) | K1 | Silme akışına `dismissAllNotificationsAsync()`; kart açılınca o haftanın `card-ready` bildirimi, Kaydet'ten sonra o günün `daily` bildirimi `dismissNotificationAsync(id)` ile kalksın (kimlikler zaten deterministik: `card-<Pazar>`, `daily-<gün>`) |
| Eski bildirim, yeni gün/haftada dokunulur | K1 | 21 §2f'teki doğrulama (`week-param`) + uygun değilse Hafta; `daily` her zaman bugünün Bugün'ü |
| Onboarding bitmeden/silme sonrası dokunma | K1 | Mevcut kapı (`useOnboardingGate`) önce çalışmalı; yönlendirme kapıdan sonra |
| Süreç ölüyken dokunma (Android 15 "stopped" durumu değil, normal ölüm) | 09 #5 soğuk K4 | 26 R-06 soğuk + sıcak |

### 4.5 Kaçırılan hafta: platform açısından

- `BOOT_COMPLETED` sonrası geçmiş tetikler telafi edilmez (05 N-05); 7 günlük plan açılmayan uygulamada biter. Kaçırılan kartın tek güvenilir yolu **uygulama içi** (18 §2.7 yüzey 1-3). Bu, platform açısından da en sağlam seçim.
- İsteğe bağlı "Pazartesi öğlen" bildirimi (18 Q4) teknik olarak ucuz (aynı plan penceresi, kart açılınca `sync` iptal eder), ama inexact + OEM riskine ek bir bildirim demek. Öneri: 0.2.0'da yok; deneme verisi "kart kaçırılıyor" derse eklenir.
- Doze/Standby K4 turu (05 V-10/V-11) bu belgedeki R-21..R-23 ile aynı release APK'da koşulsun: `adb shell dumpsys deviceidle force-idle`, `am set-standby-bucket com.batuhan.haftik rare`, teslim gözlenir, sonra `dumpsys deviceidle unforce`.

### 4.6 Bildirim simgesi (C kimliği)

Bugün jenerik daire (09 YB2-10). `expo-notifications` config plugin'i doğrudan eklenirse iOS'a `aps-environment` yazar (`withNotificationsIOS.js:9-13`); zaten prebuild otomatik uyguluyor (05 G-05). Temiz yol: yerel küçük bir config plugin yalnız `withNotificationsAndroid`'i (`icon`, `color`) çağırır (`plugin/build/withNotificationsAndroid.js:180-185`); simge `expo.modules.notifications.default_notification_icon` meta-data'sıyla manifestten başvurulduğu için `shrinkResources` atmaz (K1). Simge: ikon 3'ün **tek renk, şeffaf zeminli** siluet sürümü (Android durum çubuğu yalnız alfa kanalını çizer), 24 dp ızgara (visual-designer). K4-rel: R-07.


## 5. Ekran: edge-to-edge, insets, tek ekran bütçesi, koyu mod, yazı ölçeği

### 5.1 Inset gerçekleri

| Ölçü | Değer | K | Sonuç |
|---|---|---|---|
| Durum çubuğu, 411x914 AVD (420 dpi, kamera kesiği) | **52 dp** (`[0,0][1080,136]` px) | K4 (11 A11Y-01) | 18 bütçesi bununla doğru hesaplı |
| Durum çubuğu, 360x640 AVD | ~37 dp | K4 (11) | - |
| Gerçek cihazlar | Kesik/çentik boyutuna göre ~24-50+ dp | K0 | Sabit sayı yazılmaz; `useTopInset()` (CLAUDE.md YB-1) |
| Alt: jest çubuğu / 3 tuş | ~24 dp / 48 dp; targetSdk 35+'da ikisinin de arkasına çizilir (edge-to-edge zorunlu, API 36'da çıkış yok) | K1 (05 E-02) | Bütçe **3 tuşla** da hesaplanmalı |

**18 §3.2 bütçesine 3 tuş etkisi (+24 dp, hesap K1):** Bugün 864 -> 888 (26 boş, sığar); Kart ekranı 848 -> 872 (sığar); **Paylaşım seçici 888 -> 912/914: 2 dp pay**, pratikte sığmaz. Öneri: seçici baştan `ScrollView` + sabit alt CTA ("Paylaş" her zaman görünür), kare biçim satırı eklense de eklenmese de. `checkin-single-screen-fit` benzeri test alt inset'i {24, 48} ile parametrelesin.

**Test matrisine eklenecek ara boy (yeni):** 360x780 dp (uzun-dar telefon sınıfı; aynı AVD'de `adb shell wm size 1080x2340` + `wm density 480`). 18'in 411x914 ve 360x640 hesapları arasında kalır; Bugün 864 dp gerektirdiği için bu boyda **sığmaz** ve 360x640 için tasarlanan kaydırma + alt solma ipucu devreye girmelidir. Bu sınıf cihazların yaygınlığı K0, ama düzen kuralı 411x914'ü tek hedef saymamalı.

**Kontrol yerleşimi kuralı (C yönü):** noktalı albüm zemini tam ekran çizilebilir (edge-to-edge güzel görünür), ama dokunulan her öğe `insets.top` altından ve `insets.bottom` üstünden başlar. Onboarding'deki ÖRNEK kart ve Albüm ızgarası kaydırılabiliyorsa içerik alt çubuğun arkasından geçebilir, son öğe `paddingBottom: insets.bottom + 16` alır.

### 5.2 Koyu mod ve "açık tema kilidi" (T6)

- `app.json` hâlâ `userInterfaceStyle: "automatic"` (26 çelişki iii). Kilit için `"light"` yeterli: `expo-system-ui` kurulu (`package.json:18`), bu değeri `strings.xml`'e yazar ve etkinlik açılışında `AppCompatDelegate.setDefaultNightMode(MODE_NIGHT_NO)` çağırır (K1: `expo-system-ui/plugin/build/withAndroidUserInterfaceStyle.js`, `android/.../SystemUI.kt:31`). Tema `Theme.AppCompat.DayNight.NoActionBar` kalır (`styles.xml`); belgeye göre DayNight türevi temalara klasik **Force Dark uygulanmaz** (K1, [dark theme](https://developer.android.com/develop/ui/views/theming/darktheme)).
- **Android 16 QPR2 "Genişletilmiş koyu tema"** (erişilebilirlik ayarı) koyu teması olmayan uygulamaları ters çevirebiliyor (ikincil kaynaklar, K0). Açık temaya kilitli DayNight uygulamasının bundan etkilenip etkilenmediği **doğrulanmadı**. K4: API 36.1 imajında ayar açık + `cmd uimode night yes`, Bugün/Kart/Albüm ekran görüntüsü ve **paylaşılan PNG** (view-shot yazılımsal çizim yapar; ters çevirmenin PNG'ye geçmemesi beklenir, K0).
- Kilitliyken `StatusBar style="auto"` koyu ikon seçer (açık zemin); C'nin koyu mor bir üst şeridi olursa ekran bazında `style="light"` gerekir.
- Kart PNG'si temadan bağımsız sabit renklerle çizilmeli (bugün öyle; C'de korunmalı), yoksa koyu moddaki kullanıcı farklı kart paylaşır.

### 5.3 Yazı ölçeği ve ekran boyutu

- Kart ve paylaşım çıktısı `allowFontScaling={false}` (PNG sabit, doğru). Albüm hücresi başlıkları, seçici satırları ve ön soru metni ölçeklenmeli; 2.0'da kesilme A11Y-06 sınıfıdır: `numberOfLines` yerine sarma.
- Yazı ölçeği ve ekran boyutu değişimi Activity'yi yeniden yaratır ve rotayı sıfırlar (05 L-01, `configChanges`'te `fontScale|density` yok). Albüm ve seçici durumu da kaybolur; kabul edilebilir, ama "seçici açıkken ayar değişti" senaryosu QA listesine girsin.
- API 36 + tablet/açık katlanabilir: yön kilidi yok sayılır (05 E-01). Albüm ızgarası yatayda sütun sayısını genişliğe göre seçmeli (`useWindowDimensions`), sabit 2 sütun değil.

## 6. Widget ve diğer platform yetenekleri; Play politika riskleri

### 6.1 Android ana ekran widget'ı: fizibilite

| Yol | Nasıl | Artı | Eksi / risk | Efor (K0) |
|---|---|---|---|---|
| (a) Yerel Kotlin `AppWidgetProvider` + `RemoteViews` (yerel Expo modülü + config plugin: alıcı, `appwidget-provider` XML, düzen XML) | Uygulama check-in/silmede küçük bir SharedPreferences kaydı yazar (hafta başlangıcı + 7 dolu/boş biti), widget onu okur | RN çalışma zamanı başlatmaz, en küçük APK etkisi, ağ yok | Kotlin + XML bakımı, Expo yükseltmelerinde plugin testi | 4-6 gün (21 Y2 ile uyumlu) |
| (b) `react-native-android-widget` (üçüncü taraf) | Widget JS'te tanımlanır, headless JS görevinde çizilir | JS ile yazılır | Her güncellemede arka planda RN/Hermes başlatır (pil, OEM arka plan kısıtı); SDK 57/New Arch uyumu ve ağ davranışı **doğrulanmadı** | 3-4 gün + doğrulama |
| (c) Jetpack Glance | (a) gibi, Compose ile | Modern API | Compose çalışma zamanı APK'ya eklenir (12 boyut bütçesi) | (a)'dan fazla |

**Platform gerçekleri (hepsi için):** `updatePeriodMillis` en az 30 dk (K1, AppWidgetProviderInfo); "bugün" halkası gece yarısı kaymalı: güncelleme uygulama açılışında + check-in'de + gece yarısına kurulan inexact alarmla (1 saate kadar gecikme; sabah açılışta düzelir). `ACTION_DATE_CHANGED` manifest alıcısına API 26+ örtük yayın kısıtıyla gelmeyebilir (**doğrula**). Widget ana ekranda herkese görünür: yalnız dolu gün noktası, emoji/seviye asla (13 I-5, 25 P-8). Widget deposu `deleteAllData`, `dataExtractionRules` ve 25 R-1 envanterine girer; silmede widget `AppWidgetManager.updateAppWidget` ile boş duruma çekilir. OEM: bazı başlatıcılar widget güncellemesini geciktirir (K0, K5). **Öneri: v2** (13/20/21 ile aynı); v1.1 için aynı ihtiyacı ucuz karşılayan uygulama kısayolları (7, P1).

### 6.2 Play politika riskleri (v1.1 değişiklikleriyle)

| Konu | Durum | Risk | Kaynak / K |
|---|---|---|---|
| Hedef API | 36 | Yok (31 Ağu 2026 şartı karşılanıyor) | 05 M-07, K1 |
| Exact alarm, pil optimizasyonu muafiyeti (`REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`) | Yok | **Eklenmemeli**: ikisi de kısıtlı kullanım politikası; hatırlatma uygulaması muafiyet gerekçesi sayılmaz (K1, 05 G-03) | 8. bölüm |
| "Galeriye kaydet" (öneri P3) | Yok | `expo-media-library` gibi paketler `READ_MEDIA_IMAGES` benzeri izin getirebilir -> Fotoğraf/Video izinleri politikası beyanı. İzinsiz yol: API 29+ `MediaStore` ile yalnız kendi görselini yazmak izin gerektirmez; API 24-28 `WRITE_EXTERNAL_STORAGE` ister ve biz onu **engelledik** | K1 (kapsamlı depolama); paketin manifesti eklenmeden önce okunmalı |
| Health apps beyanı | S12 kararı | Albüm/seçici metni "uyku takibi" iddiası taşımamalı | 05 G-01 |
| Data safety | "Toplama yok" hedefi | INTERNET kalırsa beyan K1 dayanaklı kalır (1.2) | 24 SEC2-2 |
| **Android geliştirici doğrulaması (yan yükleme)** | Arkadaş denemesi EAS APK ile | 30 Eyl 2026'da yalnız Brezilya, Endonezya, Singapur, Tayland; küresel yayılım **2027**. Türkiye'de 2026 denemesi etkilenmez. 2027'de: Play Console hesabı ile kayıt ya da kimliksiz "sınırlı dağıtım" hesabı (**20 cihaz**); `adb` kurulumu aynı kalır | [Android developer verification](https://developer.android.com/developer-verification/guides), K1 |
| 16 KB sayfa | x86_64 debug geçti | arm64 release'te tekrar (05 M-07) | K4-debug |



## 7. Yeni özellik önerileri (platform kaynaklı, taslak intent)

Hepsi yerel, izin eklemez (P5 hariç yeni bağımlılık yok), gizlilik sözüyle uyumlu. Dosya olarak intent açılmadı; karar Batuhan'ın.

| # | Öneri | Etki | Efor (K0) | Gizlilik / platform riski |
|---|---|---|---|---|
| P1 | Uygulama kısayolları (ikona uzun basış) | Bildirimsiz ikinci tetik, widget'ın ucuz öncüsü | 0,5 gün | Yok; deep link'ler zaten doğrulanıyor ve kapıdan geçiyor |
| P2 | Bildirim cilası: iki kanal + teslim edilmiş bildirimi kaldırma | "Profesyonel" his; bildirim kapatma yerine seçici susturma | 0,5-1 gün | Kanal kararı tek yönlü (4.3) |
| P3 | Galeriye kaydet (izinsiz) | Hikâye'yi sonra paylaşmak isteyene dosya; seçicide kare ve 9:16 | 1-1,5 gün | Kopya uygulama dışında kalır, "Tüm verilerimi sil" onu silemez: metin söylemeli |
| P4 | Son uygulamalar önizlemesini gizle (Android 13+) | Albüm geçmişi görünür olunca omuz üstü gizlilik | 0,25-0,5 gün | Ekran görüntüsünü engellemez (FLAG_SECURE değil) |
| P5 | Kaydet haptiği | Kaydet anı (18 §2.5) dokunsal onay | 0,25 gün | `expo-haptics` yeni bağımlılık: ağ kontrolü; `VIBRATE` zaten var |

**P1 taslak intent (`app-shortcuts`):** Bildirimi kapatan kullanıcının uygulamaya dönüş yolu yalnız ikon. Önerilen sonuç: ikona uzun basınca iki statik kısayol, "Bugünü işaretle" (`haftik://today`) ve "Kartım" (`haftik://week`). Config plugin `MainActivity`'ye `android.app.shortcuts` meta-data'sı ve `res/xml/shortcuts.xml` ekler, kod yolu değişmez. Ölçüt: K4'te başlatıcıda iki kısayol, onboarding bitmemişken kısayol onboarding'e gider. Kısıt: dinamik içerik (seviye, emoji) yok.

**P2 taslak intent (`notification-polish`):** Tek kanal kullanıcıya "hepsi ya da hiçbiri" seçeneği bırakıyor; teslim edilmiş bildirim iş bittikten sonra gölgede kalıyor. Önerilen sonuç: "Günlük hatırlatma" ve "Kart hazır" kanalları; Kaydet sonrası o günün, kart açılınca o haftanın bildirimi kaldırılır; silmede tüm teslim edilmişler kaldırılır; Ayarlar kanal kapalı durumunu gösterir (4.2). Ölçüt: R-25 ve 4.4 senaryoları K4'te. Kısıt: 0.2.0'dan önce, sonra kanal kimliği değişmez.

**P3 taslak intent (`save-to-gallery`):** Kartı hemen değil sonra paylaşmak isteyen kullanıcı bugün ekran görüntüsü almak zorunda. Önerilen sonuç: seçicide "Galeriye kaydet", API 29+ `MediaStore` ile `Pictures/Haftik/` altına, izin istemeden; API 24-28'de düğme gizli (paylaşım seçicisindeki "kaydet" hedefleri kalır). Yerel küçük modül; `expo-media-library` **kullanılmaz** (izin ve politika beyanı riski, 6.2). Ölçüt: API 29 ve 35'te dosya Galeri'de, manifestte yeni izin yok. Kısıt: dosya adı tarihsiz, gizli satırlar piksel olarak yok (24 "piksel-özdeş" kuralı).

**P4 taslak intent (`hide-recents-preview`):** Albüm geçmişi görünür olunca son uygulamalar ekranındaki küçük resim, telefonu eline alan birine kartları gösterir. Önerilen sonuç: Android 13+ `Activity.setRecentsScreenshotEnabled(false)` (config plugin ile `MainActivity`); ekran görüntüsü ve paylaşım etkilenmez. Ölçüt: K4'te son uygulamalarda boş önizleme, ekran görüntüsü alınabiliyor. Kısıt: Android 12 ve altında eşdeğeri yok, FLAG_SECURE önerilmez (24 N-9).

**P5 taslak intent (`save-haptic`):** Kaydet anı sessiz (18 özet 2). Önerilen sonuç: başarılı kayıtta tek, hafif dokunsal geri bildirim; sistemin "dokunma geri bildirimi" ayarına uyan API seçilir (Android'de `View.performHapticFeedback` tabanlı yol, SDK 57 `expo-haptics`'te adı **doğrulanmalı**). Ölçüt: sistem ayarı kapalıyken titreşim yok (K5, emülatörde hissedilemez). Kısıt: animasyon azaltma tercihinden bağımsız, ama tek darbe.

Widget: v2 (6.1). Instagram doğrudan Hikâye paylaşımı: önerilmez (3.2).

## 8. OEM pil kısıtları ve bildirim güvenilirliği

**Hepsi K0/K1-ikincil (dontkillmyapp.com gibi derlemeler), cihazda doğrulanmadı; emülatörde görülemez.**

| Üretici (yaygın arayüz) | Mekanizma | Haftik'e etkisi |
|---|---|---|
| Samsung (One UI) | "Uyuyan / derin uyuyan uygulamalar", uyarlanabilir pil | Günlük açılan kullanıcıda düşük; haftada bir açanlarda gecikme/kayıp |
| Xiaomi / Redmi / POCO (HyperOS, MIUI) | Otomatik başlatma varsayılan kapalı, pil tasarrufu kısıtları | `BOOT_COMPLETED` gelmeyebilir: yeniden başlatmadan sonra uygulama açılana kadar hatırlatma yok |
| Oppo / Realme / OnePlus (ColorOS/OxygenOS) | Arka planda dondurma, son uygulamalardan kaydırınca durdurma | Android 15'te "stopped" durumu tüm alarmları siler (05 N-06) |
| Huawei (EMUI/HarmonyOS) | Uygulama başlatma yönetimi; GMS yok | Yalnız APK kanalı; davranış en belirsiz |

**Yapılabilecekler (öneri sırası):**
1. **Dürüst beklenti** (maliyet 0): bildirim ve Ayarlar metninde "yaklaşık", "akşam"; "tam saatinde" yok.
2. **Kendi kendini onarma zaten var:** her öne gelişte `sync` planı yeniden kurar (05 L-05). Kullanıcı uygulamayı açtığı an sorun geçer; 7 günlük pencere bunu destekler.
3. **Ayarlar'da "Bildirim gelmiyor mu?" satırı** (0,5 gün, yeni bağımlılık yok): iki cümle açıklama + "Bildirim ayarlarını aç". `Linking.openSettings()` uygulama sayfasını açar; kanal ayarı için RN `Linking.sendIntent('android.settings.CHANNEL_NOTIFICATION_SETTINGS', [...])` (Android'e özel API, `react-native/Libraries/Linking/Linking.d.ts:48,54`; kanal ekstraları K4'te doğrulanmalı).
4. **Yapılmaması gerekenler:** pil optimizasyonu muafiyeti istemek (Play kısıtlı izin, 6.2), üreticiye özel otomatik başlatma ekranlarına sabit bileşen adıyla gitmek (sürümle değişir, kırılgan), ön plan servisi.
5. **Ölçüm (arkadaş denemesi):** uygulama içinde cihaz bilgisi toplanmaz. Geri bildirim formuna "telefon markan" ve "7 günde kaç akşam hatırlatma geldi" sorusu (support-specialist / data-analyst). K5 cihaz planına en az bir Samsung ve bir Xiaomi.

## 9. Batuhan'a sorular (seçenekli, öneri kalın)

| # | Soru | Seçenekler | Öneri |
|---|---|---|---|
| S1 | Release'te INTERNET izni | A bırak + ölç · B `app.config.js` + EAS env · C release manifesti plugin'i · D tüm varyantlardan | **C** (B yedek); 1.3 |
| S2 | `WAKE_LOCK` | (a) ilk build'de kalsın, testten sonra kaldır · (b) hemen kaldır · (c) hiç dokunma | **(a)**; 1.6 |
| S3 | Cihazdan cihaza aktarım (SEC2-1) | (a) `dataExtractionRules` ile kapat · (b) açık bırak, metni düzelt | **(a)**, 0.2.0'dan önce; 24 ile aynı |
| S4 | Bildirim kanalları | (a) iki kanal, DEFAULT, sesli · (b) iki kanal, sessiz · (c) tek kanal kalsın | **(a)**; ses kararı tek yönlü |
| S5 | Pazar'da günlük hatırlatma | (a) kart planlanan Pazar'da günlük yok · (b) ikisi de gelsin | **(a)**; 4.1 |
| S6 | Kare çıktı | (a) 0.2.0'da 9:16 + kare · (b) önce 9:16, kare K5 geri bildirimden sonra | **(b)**: F-1 netlik düzeltmesi önce, kare ikinci build |
| S7 | Paylaşım dosya adı | (a) `Haftik-kart.png` (tarihsiz) · (b) bugünkü `ReactNative-snapshot-image…` | **(a)** |
| S8 | Açık tema kilidi (T6) | (a) `userInterfaceStyle: light` + Android 16 genişletilmiş koyu tema K4 testi · (b) koyu tema tasarla | **(a)** v1.1; (b) v2 |
| S9 | P1 kısayollar / P3 galeriye kaydet / P4 son uygulamalar | her biri evet/hayır | **P1 ve P4 evet (ucuz)**; P3 deneme geri bildirimine göre |

## 10. Doğrulanamayanlar ve devir

**Doğrulanamayanlar (bu tur):** release APK'nın ağ trafiği (1.2-1.4, K4/K5 yok); D2D aktarımın gerçek davranışı ve OEM aktarım araçları (1.5); R8'siz -> R8'li güncellemede serileştirme kırılması (2.4 R-22, çıkarım); Instagram/WhatsApp Durum örtü alanları ve JPEG sıkıştırması (3.2, ikincil kaynak); seçicide küçük resim önizlemesi (3.2); Android 16 QPR2 genişletilmiş koyu temanın kilitli açık temaya ve PNG'ye etkisi (5.2); `ACTION_DATE_CHANGED` teslimi (6.1); `react-native-android-widget` uyumu (6.1); `expo-haptics` API adı (P5); `CHANNEL_NOTIFICATION_SETTINGS` ekstraları (8); tüm OEM davranışları (8). Bu turda emülatör ve derleme **çalıştırılmadı**; K4-rel iddiaları 2026-09-28 tarihli mevcut release APK'nın ve merger raporunun salt okunur incelemesidir (`aapt2 dump permissions` bugün yeniden koşuldu).

**Devir:**
- mobile-engineer: 1.3 (seçilen seçenek) + 1.5 plugin'i + 16 izinlik `blockedPermissions` tek build'de; 3.4 F-1/F-4/F-8; 4.1 Pazar planı; 4.2 kanal okuma; 4.4 bildirim kaldırma; 4.6 simge plugin'i; 5.1 seçici `ScrollView`.
- release-manager: 2.4 R-21..R-27 ve yöntem düzeltmeleri 26 §3'e; S3 altın izin listesi aapt2'den.
- qa-engineer / test-automation-engineer: R-21..R-25 adb betiği (`release-smoke.sh`); 360x780 ve 3 tuşlu gezinme matrisi; Doze/standby turu (4.5).
- security-reviewer / privacy-compliance-analyst: 1.5 metin etkisi, P3 "silinemeyen kopya" metni, 6.2 geliştirici doğrulaması.
- visual-designer: 4.6 tek renk bildirim simgesi, ikon 3 monokrom (tematik ikon, `app.json` `monochromeImage` eski ikonu taşıyor); 3.4 F-3 çıkartma/emoji boyutu.
- copywriter: "yaklaşık" dili (4.1, 8), ön soru metni (4.2), kanal adları (4.3), kısayol etiketleri (P1).

## Kaynaklar

- [Android Auto Backup](https://developer.android.com/identity/data/autobackup) · [Test backup and restore (D2D test modu)](https://developer.android.com/identity/data/testingbackup)
- [Dark theme / Force Dark](https://developer.android.com/develop/ui/views/theming/darktheme) · Android 16 QPR2 genişletilmiş koyu tema: [Android Police](https://www.androidpolice.com/android-16-qpr2-beta-1-forced-dark-mode/), [Android Authority](https://www.androidauthority.com/android-expanded-dark-mode-3580881/) (ikincil)
- [Android developer verification](https://developer.android.com/developer-verification/guides) · [Android Authority zaman çizelgesi](https://www.androidauthority.com/android-sideloading-changes-timeline-3679204/)
- Alarm, Doze, standby, hedef API, Health/Data safety kaynakları: 05 "Kaynaklar" bölümü.

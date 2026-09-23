# S10 OPS raporu (cihazsız kısım) — 2026-09-23

Kapsam: `plan.md` S10'un Android SDK/cihaz gerektirmeyen OPS maddeleri. Ortam: Windows, Android SDK/adb/Java/gradle yok, cihaz yok. Commit atılmadı, hesap girişi/kimlik/sır yok.

## Bulgu tablosu

| # | Konu | Sonuç | Durum |
|---|---|---|---|
| 1 | `eas.json` | Yazıldı (preview/production; `development` S10 SEC N-8'de kaldırıldı). `channel`/updates yok (OTA kapalı, E3). | Tamam |
| 2 | Dev menü üretim paketinde | **Yok** (kanıt aşağıda). `setDevNowOverride` üretimde boş `return` gövdeli stub'a, `isDevNowOverrideActive` `false`'a katlanmış. | Kanıtlandı |
| 3 | Manifest izinleri | INTERNET, SYSTEM_ALERT_WINDOW, VIBRATE şablondan; READ/WRITE_EXTERNAL_STORAGE `blockedPermissions` ile engellendi. Merged manifest doğrulaması yapılamadı. | Kısmen, merged kalan |
| 4 | Bağımlılık/ağ | Doğrudan 35 paket; uygulama kodunda ağ çağrısı yok; 15 moderate audit (2 kök advisory) | Bulgu: `decode-uri-component` üretim paketinde |
| 5 | Log taraması | `src/` içinde 2 `console.warn`, ikisi sabit metin, veri yok | Temiz |
| 6 | Ölü demo kodu | `src/app/explore.tsx` rotası ve demo bileşenleri üretim paketine giriyor (`explore` 4 geçiş, `SymbolView` 3 geçiş) | Silindi (S10 SEC N-2; bağımlılıklar kaldırıldı) |

## 1. eas.json

- `appVersionSource: remote` (sürüm kodunu EAS tutar), `production.autoIncrement: true`.
- `development` profili kaldırıldı (`expo-dev-client` bağımlılığı yok, çalışmazdı; dev client gerekirse ayrı karar). `preview`: internal, APK. `production`: app-bundle (AAB).
- Doğrulama: `.gitignore` zaten `android/`, `ios/`, `.env`, `.env.*`, `*.jks/.p8/.p12/.key/.mobileprovision` kapsıyordu; eksik olan `*.keystore`, `credentials.json`, `google-services.json`, `GoogleService-Info.plist`, `*.apk`, `*.aab` eklendi.
- Uyarı: `production` profilinde `android.package` hâlâ yer tutucu (`com.anonymous.hhkscaffold`). Play'de ilk yüklemeden sonra değiştirilemez; ilk `eas build`den ÖNCE Batuhan belirlemeli.

## 2. Üretim paketinde dev menü

Komutlar (çıktılar scratchpad'e alındı, repoda yok):
- `npx expo export --platform android` -> Hermes `.hbc` (3,1 MB), başarılı.
- `npx expo export --platform android --no-bytecode` -> okunabilir üretim JS'i.
- `npx expo export --platform android --no-bytecode --dev` -> **pozitif kontrol** (dev paketi).

Ikili/metin arama (UTF-8 ve UTF-16):

| Dize | dev paketi | üretim `.hbc` | üretim JS |
|---|---|---|---|
| `dev-time-menu` | 10 | 0 | 0 |
| `dev-time-helpers` | 2 | 0 | 0 |
| `currentWeekSunday2000` | 2 | 0 | 0 |
| `dev-time-menu-current` | 1 | 0 | 0 |
| `ilerlet` (menü metni) | 1 | 0 | 0 |
| `setDevNowOverride` | 6 | 1 | 1 (stub) |

Üretim JS'inde: `e.setDevNowOverride=function(t){return}, e.isDevNowOverrideActive=function(){return!1}` — yani `src/lib/now.ts`'in `__DEV__` korumaları derleme zamanında katlanıp `src/dev/*` hiç pakete girmiyor. `_layout.tsx`'teki `__DEV__` korumalı `require` deseni beklendiği gibi çalışıyor; kod değişikliği gerekmedi. Not: Türkçe menü metinleri dev JS'te `\u` kaçışlı olduğundan doğrudan aranamadı; ASCII işaretçiler (`dev-time-menu*`, `ilerlet`) yeterli kanıt.

## 3. AndroidManifest (prebuild, `--clean`, sonra `android/` bırakıldı)

`npx expo prebuild --platform android --no-install --clean` sonrası ana manifest:
- İzinler: `INTERNET`, `SYSTEM_ALERT_WINDOW`, `VIBRATE`; `READ/WRITE_EXTERNAL_STORAGE` artık `tools:node="remove"`.
- `allowBackup="false"` var. `haftik://` intent filter var (BROWSABLE+DEFAULT, tek activity, `exported=true` yalnızca MainActivity). `android:package`/`applicationId` hâlâ `com.anonymous.hhkscaffold`.
- `expo.modules.updates.ENABLED=false` meta-data'ları şablondan gelir; `expo-updates` `node_modules`'ta yok (inert, OTA kapalı).
- `android/` `.gitignore`'da (`git check-ignore` teyit), `git status`te görünmüyor.

INTERNET gerekçesi ve seçenekler:
- Ana manifestteki `INTERNET` şablondan (dev client/Metro için; dev client artık yok, izin kararı hâlâ Batuhan'ın). Ayrıca `expo-file-system` ve `expo-image` kütüphane manifestleri de ekler; `expo-notifications` bağımlılığı firebase-messaging kendi izinlerini (INTERNET, WAKE_LOCK, ACCESS_NETWORK_STATE vb.) getirebilir (kütüphane manifestinde bu izinler yok, gradle çözümlemesinde gelir; doğrulanamadı).
- Expo dokümanına göre `android.blockedPermissions` kütüphane manifestlerinden gelen izinleri de `tools:node="remove"` ile birleşik manifestten çıkarır ([app.json referansı](https://docs.expo.dev/versions/latest/config/app/)). Yani `["android.permission.INTERNET"]` teknik olarak mümkün.
- **Uygulanmadı, gerekçe:** app.json statik; bu izni engellemek `expo start` (Metro) geliştirme akışını bozar (`development` EAS profili artık yok). Çözüm `app.config.js` + profil bazlı env değişkeni (ek karmaşıklık) ve release'te INTERNET'siz davranış (firebase-messaging başlatması, expo-image, sqlite) cihazda doğrulanmadan risklidir. Öneri: cihaz oturumunda önce `preview` APK'da `aapt dump permissions` ile merged listeyi al; sonra `blockedPermissions` INTERNET'i yalnızca `preview/production` için dene ve uygulamayı elle çalıştır.
- Uygulandı: yalnızca READ/WRITE_EXTERNAL_STORAGE (maxSdk 32; uygulama sadece cache dizini + FileProvider kullanıyor, depolama iznine ihtiyaç yok). Risk düşük; merged doğrulama kalan iş.
- `SYSTEM_ALERT_WINDOW`: S10 SEC'te `blockedPermissions`'a EKLENDİ (taze prebuild'de ana manifestte `tools:node="remove"`; debug varyantı izni kendi manifestinde ekler, release etkilenmez). Önerilen ama uygulanmadı: `VIBRATE` (bildirim kanalı titreşimi için gerekebilir, kullanım netleşmeden dokunulmadı).
- `expo-notifications`: `ExpoFirebaseMessagingService` `exported=false`; `google-services.json` olmadığından FCM token alınmaz. Servisi manifestten kaldırmak (config plugin ile `tools:node="remove"`) mümkün olabilir ama özel plugin yazmayı gerektirir ve yerel bildirim yolunu etkileyebilir; **uygulanmadı**. Statik kanıt: paket, kalıcı kayıt bilgisi (`isEnabled`) yoksa (`getExpoPushTokenAsync` hiç çağrılmıyor) `exp.host` isteği yapmaz (`DevicePushTokenAutoRegistration.fx.js` okundu). `exp.host` dizeleri üretim paketinde ölü kütüphane koduyla duruyor (`getExpoPushTokenAsync` 3, `exp.host` 3 geçiş) — çağrılmıyor ama bundle'da; ağ kanıtı hâlâ cihazda gözlem ister.
- **Kalan: cihaz/SDK'li ortamda** merged manifest (`aapt dump permissions`/`apkanalyzer manifest print`) ve ağ trafiği gözlemi.

## 4. Bağımlılıklar ("ağa veri gönderiyor mu")

`npm ls --depth=0`: 35 doğrudan paket, hepsi çözülmüş, çakışma yok. Ağ değerlendirmesi (kaynak/üretim paketi taraması + `src/` importları; `src/`te `fetch/XMLHttpRequest/WebSocket` çağrısı yok):

| Paket | Ağ? | Not |
|---|---|---|
| expo, expo-constants, expo-font, expo-linking, expo-router, expo-splash-screen, expo-status-bar, expo-system-ui | Hayır (uygulama akışında) | Router/linking yalnızca deep link ayrıştırır |
| expo-sqlite, expo-sharing, react-native-view-shot | Hayır | Yerel |
| expo-file-system | Kütüphane indirme API'si var, biz kullanmıyoruz (yalnızca legacy yerel dosya) | Manifestine INTERNET ekler |
| **expo-notifications** | Şüpheli/dormant | Push token yolu `exp.host`; çağrılmıyor, kayıt yoksa otomatik yok; cihazda doğrulanmalı |
| expo-image, expo-web-browser, expo-symbols | Ürün kodunda kullanılmıyor | Yalnızca ölü demo dosyalarında (`external-link`, `collapsible`, `animated-icon`, `web-badge`); web-browser/expo-image kodu pakette yok, `SymbolView` var. Demo dosyaları silinince kaldırılabilir bağımlılıklar |
| react-native-reanimated, -worklets, -gesture-handler, -screens, -safe-area-context | Hayır | |
| @expo-google-fonts/inter | Hayır | Statik `.ttf` |
| react-dom, react-native-web | Hayır (Android paketinde yok) | Yalnızca web hedefi |
| react, react-native | RN çekirdeği ağ API'si sunar, biz kullanmıyoruz | |
| Dev: jest, jest-expo, @types/*, cross-env, eslint*, react-test-renderer, typescript | Pakete girmez | |

`npm audit --omit=dev`: 15 moderate, 0 high/critical (dev dahil audit de aynı 15). Kök advisory'ler yalnızca 2:
- `uuid` <14 (GHSA-w5hq-g745-h8pq), `xcode` üzerinden `@expo/config-plugins` (build-time; APK'ya girmez).
- **`decode-uri-component` 0.2.2 (GHSA-vcc3-ghjq-m6fr, exponansiyel çözme DoS)**, `expo-router` -> `query-string@7` üzerinden. **Üretim paketinde var** (`(%[a-f0-9]{2})+` düzenli ifadeleri bulundu). Etki: kötü niyetli bir `haftik://...?x=%..%..` bağlantısı uygulamayı donduracak (yalnızca kendine DoS; veri sızıntısı yok). Öneri: Expo SDK yamalı `expo-router` çıkarınca güncelle; acil ihtiyaçta `package.json` `overrides` ile 0.4.x denenebilir (kırılma riski var, test/Metro doğrulaması ister). `npm audit fix --force` YAPILMADI (Expo paketlerini sürüm düşürür).
- Önceki audit notu CLAUDE.md'de yoktu; bu ilk kayıttır.

Dependabot: `.github/dependabot.yml` zaten var (npm + github-actions, haftalık). Öneri (yazılmadı): Expo SDK 57 sürümlü paketler `expo install --fix` ile uyumlu tutulmalı, bu yüzden npm güncellemelerinde `groups`/`ignore` ile major sürüm PR'larını kapatmak (`update-types: version-update:semver-major`) gürültüyü azaltır.

## 5. Log taraması (`src/`)

| Yer | Çağrı | Veri? |
|---|---|---|
| `src/notify/sync.ts:73` | `console.warn('[notify] yeniden planlama basarisiz')` | Hayır (sabit metin, hata nesnesi geçilmiyor) |
| `src/notify/scheduler.ts:122` | `console.warn('[notify] bildirim planlanamadi')` | Hayır |

`console.log/error/debug`, `debugger`, analitik/hata SDK'sı yok. `Alert.alert` çağrıları (`report-confirm.ts`, `settings.tsx`) sabit metin; check-in/kart/yol içermiyor. Not: `expo-notifications` kütüphanesinin kendi `console.warn/error`'ları var (kütüphane içi, uygulama verisi taşımıyor).

## Kalan cihaz/SDK'li işler

1. Merged manifest izin listesi (`aapt dump permissions` / `apkanalyzer`) ve FCM servis/izin doğrulaması.
2. Release/preview APK'da ağ trafiği gözlemi (kart açma, paylaşma, bildirim akışları, uygulama açılışı).
3. `blockedPermissions` INTERNET denemesi (yukarıdaki plan) ve release'te çalıştığının elle doğrulanması.
4. `eas build --profile preview` çıktısıyla izin listesi; Play internal test yüklemesi.
5. K5 (paylaşım mesajı taşınıyor mu), önceki S6-S9 cihaz maddeleri (`CLAUDE.md`).

## Batuhan'ın yapacakları

1. `npm i -g eas-cli` (ya da `npx eas-cli`), `eas login` (Expo hesabı), `eas init` (proje ID'sini `app.json`'a yazar; Batuhan'ın hesabı gerekir).
2. **Paket adını belirle** (`com.<geliştirici>.haftik`), `app.json` `android.package`e yaz. Play'de ilk yüklemeden sonra değişmez.
3. `eas build --platform android --profile preview` (cihazda kur, ağ gözlemi), sonra `--profile production` (AAB). İlk build'de EAS keystore'u üretir/saklar; anahtarı yedekle (Play imza kurtarması için `eas credentials`).
4. Ölü demo dosyalarını silmeyi onayla (`src/app/explore.tsx`, `app-tabs*`, `animated-icon*`, `hint-row`, `web-badge`, `external-link`, `ui/collapsible`); silme sonrası `expo-image`/`expo-web-browser`/`expo-symbols` bağımlılıkları kaldırılabilir (ayrı onay, ayrı doğrulama).
5. Commit'ler (`eas.json`, `app.json`, `.gitignore`, bu rapor, plan/CLAUDE güncellemeleri) Batuhan'ın.

## Doğrulama çıktıları

`npm run typecheck` temiz; `npm run lint` temiz; `npm test`: 56 suite, 762 geçti, 3 atlandı (S8 TZ testleri, bilinen); `npx expo-doctor`: 21/21. Test dosyalarına dokunulmadı.

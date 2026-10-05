# Araç zinciri — Node, Expo, lint, test altyapısı

> `CLAUDE.md`'deki "Konuya göre oku" tablosundan gelindi: Node/Expo sürümü, lint/test kurulumu veya derleme
> ortamıyla ilgili bir şeye dokunuyorsan burayı oku. Kayıtlar `docs/inceleme-2026-09-25/08-muhendislik-tutarlilik.md`
> §1.4'ün taşıma kararına göre buraya alındı (metin korunur, yalnızca gruplanır).

## Node ve Expo sürümü

- (2026-09-22, MOB/S1) `npx create-expo-app` güncel kararlı SDK'sı **Expo SDK 57** (react-native 0.86.3,
  react 19.2.3). Varsayılan şablon web desteğiyle geliyordu (`react-native-web`, `react-dom`, `global.css`);
  bu paketler **2026-10-01'de kaldırıldı** (bkz. aşağıdaki "Web yığını" notu) — bu paragraf artık yalnızca
  tarihsel bağlam.
- (2026-09-22, MOB/S1) `expo-env.d.ts` yalnızca `expo start` ilk çalıştığında otomatik oluşur; cihaz/emülatör
  olmadan hiç `expo start` çalıştırılmadıysa elle oluşturulması gerekir (`.gitignore`'da zaten hariç).
- (2026-10-01, A5 kararı) Node **>=24.19.0** sabitlendi (`.nvmrc`, `package.json engines`). Daha önce repo
  testleri `node:sqlite`'ın Node 22.5+'ta geldiği gerekçesiyle ">= 22.13" yazıyordu; gerçek geliştirme makinesi
  hep Node 24 kullandığı için sabit alt sınır 24'e çekildi — `.nvmrc` kaynak alınır, iki yerde ayrı yazılmaz.
- (2026-09-22, MOB/S1 → 2026-10-01 güncellendi) `@types/jest` ve `react-test-renderer`, `jest-expo`/SDK 57 ve
  react'in tam sürümüyle (`19.2.3`) birebir eşleşecek şekilde **tam sürüm** (caret'siz) sabitlenir — varsayılan
  `npm install` en son `@types/jest@30`'u çekip `expo-doctor` uyarısı verir, farklı bir react-test-renderer
  minor/patch'i `ERESOLVE` peer uyuşmazlığı verir. `jest-expo` ve `@expo-google-fonts/inter` de aynı gerekçeyle
  tam sürüm (A5 kararıyla genişletildi).
- Expo paketlerinin SDK yama sürümüne uyup uymadığı `npx expo-doctor` ile kontrol edilir (beklenen: 21/21
  yeşil). Sapma olursa `npx expo install --fix` ile düzeltilir, elle tek tek sürüm yazılmaz (2026-10-01'de
  6 paket bu şekilde yama sürümüne çekildi, bkz. commit "S13: hijyen başlangıcı").

## eslint-config-expo tuzakları

- (2026-09-22, MOB/S1) `react-hooks/set-state-in-effect` kuralı, `src/hooks/use-color-scheme.web.ts`'teki
  (yalnızca web hedefi için) kasıtlı hidrasyon deseninde hata veriyordu — bu dosya **2026-10-01'de web yığınıyla
  birlikte kaldırıldı**, bu madde artık geçersiz.
- (2026-09-23, MOB/S6) Aynı kural, bir `useEffect` içinde async çağrıdan önce doğrudan `setState(false/null)`
  gibi bir "sıfırlama" çağrısını yasaklıyor. **Çözüm (disable değil, daha temiz):** ayrı bir boolean/`null`
  state yerine "hangi anahtar için veri yüklendi" bilgisini tutan bir state kullanılır (`loadedFor`), "yüklenmedi"
  durumu bu anahtarın güncel anahtarla eşleşmemesinden **türetilir** (bkz. `src/app/(main)/today.tsx`, `week.tsx`).
- (2026-09-23, MOB/S6) `react-hooks/refs`: `useRef(new Animated.Value(0)).current` ile render sırasında
  `.interpolate()` çağırmak "ref render sırasında okunuyor" diye yanlış pozitif verir (`Animated.Value` bir
  React ref değil, mutable bir animasyon nesnesi) — `src/components/locked-card-placeholder.tsx`'te satır içi
  `eslint-disable-next-line react-hooks/refs` + gerekçe yorumuyla geçildi. Kabul edilmiş kalıcı istisna.
- (2026-09-23, MOB/S6) React Compiler lint kuralları (`app.json` `experiments.reactCompiler: true`), RN
  `Animated` ve hidrasyon desenlerinde yanlış pozitif verebilir; önce kodla çöz (türetilmiş durum), disable son çare.

## Jest kurulumu

- (2026-09-23, MOB/S5) Jest'in varsayılan `testMatch`'i `__tests__/` altındaki **her** `.ts` dosyasını (yalnızca
  `*.test.ts` değil) bir suite sanır; paylaşılan test yardımcıları yanlışlıkla suite sayılmasın diye
  `package.json`'daki `jest.testPathIgnorePatterns`'a `<rootDir>/__tests__/helpers/` eklendi (`/node_modules/`
  varsayılanı da elle korunarak — bu alanı özelleştirmek Jest'in varsayılanının tamamının yerini alır).
- (2026-09-23, MOB/S6, **2026-10-01'de geçersiz**) `src/constants/theme.ts`'in web hedefi için `@/global.css`
  import etmesi Jest'i kırıyordu, `jest.moduleNameMapper`'a CSS mock eklenmişti. Web yığını kaldırıldığında
  (`react-dom`, `react-native-web`) bu import da kalktı; `css-mock.js` ve `moduleNameMapper` girdisi artık ölü
  kod — bir sonraki dokunulduğunda silinebilir, test kırmıyor diye bırakıldı.
- (2026-09-23, test) `react-test-renderer` ağacı `unmount()` edilmeden bırakılırsa ve bileşen
  `useNativeDriver: true` ile bir `Animated` zamanlayıcısı başlatmışsa, Jest süreci test dosyası bittikten
  **sonra** çöker (`ReferenceError: Jest environment has been torn down` → `TypeError:
  getNativeTagFromPublicInstance is not a function`). Testler "geçti" raporlanır ama tüm `npm test` süreci
  başarısız çıkış koduyla biter. **Çözüm:** `Animated` tetikleyen bir bileşeni render eden her testte
  `afterEach`te `act(() => tree.unmount())` ile temizle (bkz. `__tests__/card/CardRevealView.test.tsx`).
- (2026-09-23, test) `react-test-renderer`'ın `TestInstance`'ında (`findByProps(...)`'in döndürdüğü) `.toJSON()`
  **yok** (yalnızca kök `renderer.toJSON()`'da var). Bir alt ağacın render edilmiş metnini almak için
  `instance.props.children` ya da `instance.findAllByType(Text).map(n => n.props.children)` kullanılır
  (bkz. `__tests__/card/CardView.test.tsx` `textsIn` yardımcı fonksiyonu).

## Bağımlılık politikası

- Yeni paket = "ağa veri gönderiyor mu" kontrolü + bu dosyaya bir not eklenir. Expo paketleri `npx expo install`
  ile eklenir (SDK'yla uyumlu sürüm otomatik seçilir).
- Kalıcı yasaklar: `expo-updates`, analitik/çökme SDK'ları, push token API'leri (mekanik: `no-push.test.ts`,
  `src/` içinde `getExpoPushTokenAsync` vb. adları tarar).
- Font gibi büyük varlık paketlerinde alt yol importu kullanılır (`@expo-google-fonts/inter/400Regular`) —
  kök `index.js` tüm ağırlıkları (~6MB) `require` eder, subpath yalnızca ihtiyaç duyulanı bundle'a katar.
- (2026-09-23, OPS/S10) `npm audit --omit=dev`: 15 moderate, 0 high/critical. `decode-uri-component@0.2.2`
  (`expo-router` → `query-string@7`) üretim paketinde; etkisi kötü niyetli `haftik://` bağlantısıyla kendine
  DoS (veri sızıntısı yok). `npm audit fix --force` **yapma** (Expo paketlerini düşürür); Expo/expo-router
  yaması bekle ya da `overrides` dene + test et.

## Web yığını kaldırıldı (2026-10-01)

`react-dom`, `react-native-web`, `app.json`'daki `web` bloğu, `web` npm script'i ve `use-color-scheme.web.ts`
dosyası silindi — ürün yalnızca Android/iOS (spec'te web hiç yoktu, şablonun varsayılanıydı). Bir web hedefi
geri istenirse bu bir kapsam genişletmesidir, ayrı `intent.md` ister.

## Release derlemesi ve R8 (S18, 2026-10-02)

**Yerel release APK (EAS kotası harcamaz, ~2 dk):** `npx expo prebuild --platform android --no-install` (android/
klasörünü sıfırdan üretir, gitignore'da; `react-native.config.js` ve config plugin'leri burada işler), sonra
`android/` içinde `ANDROID_HOME="C:\Users\Pc\AppData\Local\Android\Sdk" ./gradlew assembleRelease
-PreactNativeArchitectures=x86_64`. Çıktı: `android/app/build/outputs/apk/release/app-release.apk` ve
`.../mapping/release/mapping.txt`. İzin kontrolü: `node scripts/check-apk-permissions.js <apk> <aapt2>`
(aapt2 `Sdk\build-tools\36.0.0\`). **mapping.txt her derlemeyle saklanmalı** (R8 yığın izlerini karartır);
şimdilik repo dışında `C:\dev\haftik-artifacts\s18\` (56 MB, commit'lenmez). EAS tarafı: `eas.json`
`buildArtifactPaths` alan adı/davranışı DOĞRULANMADI, doğrulanmadan eklenmedi (22 §2.2).

**Yapılandırma:** R8 ve kaynak küçültme `app.json` `expo-build-properties` ile (`android.enable
MinifyInReleaseBuilds`/`enableShrinkResourcesInReleaseBuilds`) — prebuild'de `gradle.properties`e yazılır,
preview ve production aynı yapılandırmayı kullanır. Ek keep kuralı GEREKMEDİ (22 §2.1 öngörüsü doğrulandı).

**react-native-reanimated:** uygulamada kullanılmıyor ama `react-native-drawer-layout`ın (expo-router
bağımlılığı) zorunlu peer'i olduğu için `package.json`dan çıkarsak da npm kurar ve RN autolinking native kodunu
derler (1,5 MB .so). Gerçek çıkarma: `react-native.config.js` `dependencies['react-native-reanimated'].platforms
= {android: null, ios: null}` (`libreanimated.so` APK'dan düştü). Geri alma: `react-native.config.js`i sil. Koruma:
`__tests__/infra/release-config.test.ts`.

**react-native-worklets (2026-10-05):** aynı yolla native derlemeden dışlandı. `expo-modules-core` bunu İSTEĞE BAĞLI peer sayar
ve `findProject(":react-native-worklets")` boşsa Gradle entegrasyonunu atlar (`android/build.gradle` satır 64-79, 227; Kotlin
kaynakları worklets sınıfı import etmez). `libworklets.so` (1,05 MB) APK'dan düştü. **JS tarafı pakette kalır** (42 dosya:
`@expo/ui` ve expo-router'ın statik import zinciri), açılışta çökmüyor. `package.json`daki doğrudan bağımlılık sürümü sabitlemek
için durur. Koruma: `__tests__/infra/native-exclusion.test.ts` (platforms null + `src/`te import yok).

**Boyut (x86_64 release):** R8'siz+reanimated'lı 44,48 MB -> R8+shrink+reanimated yok **31,98 MB**.
Sonrasında (S19-S22 kodu dahil) 33,57 MB; **worklets dışlanınca 32,46 MB** (2026-10-05, `libworklets.so` -1,05 MB).

**K4-rel sonuçları** (release APK, emülatör `haftik_pixel`, Android 15 google_apis x86_64, rootlu; `adb` ile):

| Akış (22 §2.2 / 26) | Sonuç |
|---|---|
| R-1 soğuk açılış, onboarding, izin diyaloğu (izin ver) | geçti; kanallar `daily`/`card-ready` cihazda |
| R-2 check-in kaydet | geçti (alarmlar 14 -> 12) |
| R-3 bildirim planı | geçti: `dumpsys alarm` kayıtları var, `InvalidClassException` yok |
| R-4/R-21 `adb reboot`, uygulamayı AÇMADAN | alarmlar geri kuruldu (14) |
| R-5/R-22 güncelleme: R8'siz -> R8'li ve R8'li -> R8'li (`adb install -r`, açmadan) | alarmlar korundu (14), `InvalidClass` yok |
| R-6 Pazar akışı: Hafta -> K3 ara ekran -> Kaydet -> kart reveal -> Paylaş -> önizleme -> sistem seçici -> iptal | geçti; cache'te PNG kalmadı (view-shot + FileProvider + R8) |
| R-7 deneme raporu seçicisi; "Tüm verilerimi sil" | geçti: onboarding'e dönüş, alarmlar 0, DB'de silinen veri yok (VACUUM) |
| R-8/R-24 tüm tur boyunca `FATAL`/`ClassNotFound`/`NoSuchMethod`/`InvalidClass`/`CodedException`/`SecurityException`/`EACCES` | 0 satır |

**Test hilesi (K4, kodsuz):** release'te dev menüsü yok; uygun hafta için DB'ye `adb root` + `adb pull` ile
`node:sqlite` üzerinden check-in eklenip geri itildi (`chown`/`restorecon`), emülatör saati `adb shell date
MMDDhhmmYYYY.ss` ile (`settings put global auto_time 0`) Pazar 20:05'e alındı; sonra `auto_time 1` geri açılır.

**Yapılmadı (S18 kapsamında kalan):** R-23 (API 24-30 exact alarm yolu, ayrı AVD), R-25 (kanal kapatma), R-26
(yeni C yönü çıktıları — henüz yok), R-27'nin D2D test modu, Doze/standby turu (22 §4.5), başarılı paylaşım hedefi
(emülatörde WhatsApp yok, 04 #4 K5), `shrinkResources` sonrası bildirim simgesi (henüz yok), AAB (`production`
profili `app-bundle`; yerel yalnız APK derlendi).

## Emülatör ve adb: Windows git-bash tuzakları ve K4 yöntemi (2026-10-02)

Hepsi S16b-S18 emülatör turlarında gerçekten yaşandı:

- **Emülatörü proje klasörünün içinden başlatma.** `emulator.exe` bir `cd android` altında başlatılırsa o dizini
  çalışma dizini olarak tutar; `expo prebuild` (`android/` silip yeniden üretir) ve `rm -rf android`
  `EBUSY: resource busy or locked` verir, prebuild yarım kalır ve `./gradlew` kaybolur. Emülatörü nötr bir
  dizinden (`cd /tmp`) başlat. Prebuild öncesi: `./gradlew --stop` ve kalan `java.exe`ları kontrol et.
- **adb yolları.** git-bash `/sdcard/...` gibi cihaz yollarını Windows yoluna çevirir: `export MSYS_NO_PATHCONV=1`.
  Bilgisayar tarafı dosya için Windows biçimi ver (`C:/dev/...`); `/c/...` adb'ye anlaşılmaz.
  `adb install`/`push`/`pull` bu yüzden `C:/...` ister.
- **Shell kaçışları.** `node -e "..."` ve çift tırnaklı heredoc içinde backtick komut olarak çalışır, `\r\n`/
  `\d` kaçışları bozulur (bir kez regex'i sessizce bozdu). Çok satırlı kodu `Write` ile dosyaya yaz ya da tek
  tırnaklı heredoc (`<<'EOF'`) kullan; dosyaya yazdıktan sonra test et.
- **`run-as` release APK'da çalışmaz** (debuggable değil): AVD `google_apis` (Play Store'suz) olmalı ve
  `adb root` kullanılır. AVD: `haftik_pixel`, Android 15, x86_64; release yalnızca x86_64 derlenir
  (`-PreactNativeArchitectures=x86_64`).

**K4 tur yöntemi (kodsuz, release APK'da):** ekranları `uiautomator dump` ile okuyup `resource-id`
(= `testID`) sınırlarından orta noktaya `input tap` atan küçük bir yardımcı (`/tmp/k4.sh`, repoda yok).
Uygun hafta için: `adb root`, uygulamayı `force-stop`, `files/SQLite/hhk.db`yi çek, `node:sqlite` ile
`checkin` satırı ekle, geri it (`chown <uid>:<uid>`, `restorecon`), saati `settings put global auto_time 0`
+ `date MMDDhhmmYYYY.ss` ile Pazar 20:05'e al, bitince `auto_time 1`. Bildirim/alarm kontrolü:
`dumpsys alarm | grep com.batuhan.haftik`; kanal: `dumpsys notification --noredact`; ağ yok kanıtı:
`/proc/<pid>/status` `Groups` satırında `inet` (3003) olmaması. Hata taraması:
`logcat -d | grep -E "FATAL EXCEPTION|ClassNotFound|NoSuchMethod|InvalidClass|CodedException|SecurityException|EACCES"`.

## ASCII yol problemi (2026-10-01'de kalıcı çözüldü)

**[ESKİ 2026-10-01: artık geçersiz, bkz. `tuzak-arsivi.md`]** Repo artık kalıcı olarak `C:\dev\haftik`'te
yaşıyor; Türkçe karakterli eski konum (`...\Desktop\Geliştirme için\...`) ve ASCII kopya/robocopy senkron
deseni tarihe kalktı. Yeni bir Windows makinesinde kurulum yaparken proje klasörünün yolu **baştan** ASCII ve
boşluksuz seçilmeli (bu dersin kendisi kalıcı, derleme pratiği değil).

## CI ve pre-commit

- `.github/workflows/ci.yml`: Node sürümü `.nvmrc`'den okunur, `permissions: contents: read` en dar kapsamda,
  adımlar typecheck → lint → test → `expo-doctor`.
- `.github/dependabot.yml`: Expo'ya kilitli paketler (`expo-*`, `react-native-*`, `react`, `@expo/*` vb.) tek
  bir `expo-sdk` grubunda PR açar (tek tek PR yanlış kombinasyonla `expo-doctor`'ı kırabilir); doğru yükseltme
  yolu her zaman `npx expo install --fix`. `jest-expo`/`react-test-renderer` otomatik güncellemeden hariç
  (yukarıdaki pinleme gerekçesiyle aynı).
- `.githooks/pre-commit` (A3 kararı): `npm run verify` (typecheck+lint+test) çalıştırır, ölçülen süre ~8,5
  saniye (10 sn sınırının altında). Kurulumu `package.json`'daki `"prepare": "git config core.hooksPath
  .githooks"` script'i `npm install` sırasında otomatik yapar.

## Sürüm ve kimlik kapısı: `scripts/check-release.js` (26 D3, 2026-10-05)

```bash
node scripts/check-release.js                     # hızlı, ağsız (her push/PR'da CI)
node scripts/check-release.js --tag v0.1.0        # + etiket = v+sürüm, yer tutucu sözcükler
node scripts/check-release.js --audit             # + npm audit (ağ)
node scripts/check-release.js --bundle            # + üretim paketinde dev menü/fikstür dizeleri (pozitif kontrollü, ~20 sn)
```

| | Denetim | Not |
|---|---|---|
| a | `app.json` sürümü = CHANGELOG üst başlığı (= etiket) | |
| b | kimlik kilidi: paket adı, ios bundle id, şema, slug, ad | değişirse betikteki `IDENTITY` bilinçli düzenlenir |
| c | `eas.json` preview ve production `autoIncrement` | |
| d | `com.anonymous`, `TASLAK`, `[mağaza bağlantısı]` (yalnız etiket koşusu) | 0.1.x UYARI (bilinen sınır, CHANGELOG), **0.2.0 ve sonrası KIRMIZI** (`PLACEHOLDER_FREE_FROM`) |
| e | `git ls-files`: keystore/jks/apk/aab/credentials.json/service-account/google-services yok | |
| f | `npm audit --omit=dev`: kabul edilmemiş high/critical yok | kabul listesi `scripts/audit-accepted.json` (yalnız küçülür; `approved:false` kapıyı KIRMIZI tutar) |
| g | üretim JS paketinde dev menü ve fikstür dizeleri yok | önce `--dev` paketinde dizelerin bulunabildiği doğrulanır (kör dedektör KIRMIZI) |

CI: `.github/workflows/ci.yml` hızlı modu her push/PR'da, `--audit --bundle`'ı yalnız `v*` etiketinde koşar. **İlk gerçek bulgu:** `--audit` iki
high advisory (node-forge, braces; yalnız `@expo/cli`, üretim paketinde yok) buldu; S10'daki "15 moderate, 0 high" artık geçerli değil
(advisory veritabanı değişti). Betik plandaki `.mjs` yerine `.js` (repodaki betikler CommonJS, Jest'ten `require` edilebilir).

# 12 - Performans ölçümü (K4 emülatör) - 2026-09-28

Hazırlayan: performance-engineer. Kapsam: yalnızca ÖLÇÜM. **Asıl repoda ve `C:\hhk\haftik\src` altında hiçbir kaynak dosya değiştirilmedi** (sonda `diff -rq src` boş). Ölçümler `C:\hhk\haftik` kopyasında yapıldı; kopyada yalnızca derleme çıktıları (`android/app/build/...`) oluştu.
Ham veriler: scratchpad `...\13e627d4-...\scratchpad\` (export-hbc, export-js, attr.json, release-apk-list.txt, release-r8-apk-list.txt, gfx-*.txt, meminfo-*.txt, series-*.txt, coldstart-*.txt, logcat-*coldstart.txt).

## Özet (12 satır)

1. **Ölçüm yolu:** dev client ile release derlemesi arasında 8 kat fark var. Asıl sayılar release'ten alındı; dev client sayıları "yalnızca bilgi". Release derlemesi kopya dizinde 2 dk 39 sn sürdü (`gradlew assembleRelease -PreactNativeArchitectures=x86_64`), emülatöre kurulup ölçüldü, sonra debug APK geri kuruldu.
2. **Soğuk açılış (Bugün, veri var), release:** `am start -W` TotalTime **medyan 493 ms** (n=10, 438-561, 1 aykırı 1390), Bugün içeriği görünene kadar **medyan 895 ms** (833-1005, 1 aykırı 1817). Dev client: 3811 ms / 4381 ms (n=5). Sıcak (HOT) başlatma 66-85 ms (dev).
3. **R8 (minify+shrink) denemesi:** APK 44,46 MB -> **35,10 MB (-9,4 MB, -%21)**, dex 43,4 -> 15,7 MB, açılış medyanı 493 -> 345 ms (n=6, ortam kayması payı var). Derleme/açılış/check-in smoke'u çalıştı, FATAL yok; tam K4 turu yapılmadı.
4. **JS paketi:** hbc 3,07 MB (`expo export`), APK içindeki `index.android.bundle` 2,49 MB. Bundle'da reanimated JS'i 0 bayt, react-native-web/react-dom 0 bayt, uygulama kodu ~92 KB (%5). worklets 92 KB + @expo/ui 67 KB, expo-router'ın Android yolundan giriyor (uygulama kodundan değil).
5. **Boşa giden varlık:** `MaterialSymbols_400Regular.ttf` **967 KB** (export'un %19'u; APK'da 430 KB sıkışık) `expo-router -> native-tabs -> expo-symbols` zincirinden geliyor, uygulama `Tabs` kullanıyor (native-tabs değil). Inter 3 dosya 1,03 MB (italic dahil).
6. **Günlük akış:** 4 emoji + Kaydet = **5 dokunuş, 0 ekran geçişi**. Kaydet dokunuşundan DB satırına 20-34 ms (dev). Uygulamanın kendi gecikmesi 8 sn bütçesinin çok altında. **Kaydet sonrası görsel geri bildirim hâlâ yok** (release'te 1,5 sn boyunca 14 örnek "aynı") - QA4-05 sürüyor.
7. **Akıcılık (release, temiz gfxinfo):** sekme geçişi 1285 kare, jank %0,23, p99 29 ms; kart reveal 76 kare, jank %1,3-4, p99 18-28 ms. Emülatör GPU'su host GPU çeviri katmanı, mutlak değerler cihazı temsil etmez.
8. **Bellek (release):** soğuk boşta PSS **120 MB**, 5 dk yoğun dokunuş döngüsünde 132 -> 170 MB (+37 MB, yavaşlayarak). Sızıntı KANITLANMADI (Activities=1, ViewRootImpl=1); uzun koşu/heap incelemesi gerekli. Dev client 328 -> 387 MB.
9. **Arka plan:** uygulamaya ait alarm 0 (izin yok), 6 sn boşta 0 kare çizimi, `useNow` tek `setTimeout` + AppState. Boşta CPU dev'de %2,0-2,4, release'te %1,5 (emülatör gürültüsü içerir).
10. **Kart PNG'si:** 1080x1920, 176.491 bayt (dev); Paylaş'tan paylaşım seçicisinin açılmasına 326 ms (dev), 90-146 ms (release, n=3).
11. **Bütçe (bölüm 6):** başlatma, bundle, kart, kare süresi tutuyor; **Kaydet geri bildirimi ve APK boyutu (R8 kapalıyken) aşıyor**. SQLite sorgu sayısı yalnızca kod okumasıyla sayıldı (K1), süreleri ÖLÇÜLMEDİ.
12. Ortam geri yüklendi: debug APK, `pm clear` (onboarding "Başla"), Metro :8081 ve `adb reverse` açık, animasyon ölçekleri/density/font/night dokunulmadı (1.0/420/1.0/no).

## 0. Ortam ve yöntem

| Alan | Değer |
|---|---|
| Emülatör | emulator-5554, `sdk_gphone64_x86_64`, Android 15 (API 35), 1080x2400 @ 420 dpi, 4 çekirdek, 2,5 GB RAM, 60 Hz |
| GPU | `GLES: Google (NVIDIA Corporation), Android Emulator OpenGL ES Translator (NVIDIA GeForce RTX 5070...)`, `debug.hwui.renderer=skiagl`. Yani yazılım render DEĞİL, host GPU'ya çevrilen komutlar. CPU da host hızında (x86_64 sanallaştırma). Gerçek düşük-orta ARM cihazdan belirgin hızlı, GPU tarafında ise çeviri katmanı ek gecikme koyuyor (gfxinfo'da `Slow issue draw commands`). |
| Uygulama | `com.batuhan.haftik`. **Dev client** (debug APK, Metro :8081, JS Metro'dan) ve **release** (`assembleRelease`, x86_64, R8 KAPALI, debug anahtarıyla imzalı, Hermes bytecode gömülü) ayrı ölçüldü. Ek olarak R8 AÇIK bir derleme (`-Pandroid.enableMinifyInReleaseBuilds=true -Pandroid.enableShrinkResourcesInReleaseBuilds=true`, dosya değiştirmeden). |
| Araçlar | `am start -W`, on-device kabuk betikleri (`screencap` + `md5sum`/PNG boyutu ile görsel değişim yoklaması, `date +%s%3N`), `dumpsys gfxinfo`, `dumpsys meminfo`, `/proc/PID/stat`, `expo export`, `unzip -v`, sourcemap ile paket bazlı bayt dökümü (`attr.js`). |
| Ölçüm çözünürlüğü | Görsel yoklama aralığı ~95-220 ms (screencap+md5 ~90 ms). "Dokunuş -> görsel değişim 110-230 ms" bir **alt sınır DEĞİL, ölçüm zemini**; uygulama gecikmesi bunun altında olabilir. |
| Tekrar | Açılış dev n=5+5, release n=10 (+6 R8). Diğerleri belirtilen sayıda. Ortam kayması: ölçümler ~3 saat aralıklı, tek makine. |
| Yan etki kontrolü | `screencap` döngüsü GPU/CPU'yu yükler: ilk kart reveal gfxinfo'su (döngüyle) jank %7,7-14,9 verdi, döngüsüz tekrarında %1,3-4. **Kare süresi ölçümü screencap olmadan yapılmalı**; aşağıdaki gfxinfo sayıları döngüsüzdür (aksi belirtilmedikçe). |

Kanıt seviyesi: hepsi **K4 (emülatör)**. Mutlak süreler ve kare oranları gerçek cihaz için K5 gerektirir (bölüm 8).

## 1. Paket / varlık boyutu

### 1.1 `expo export --platform android` (kopya dizin, çıktı scratchpad'e)

```
Android Bundled 12091ms node_modules\expo-router\entry.js (1426 modules)
_expo/static/js/android/entry-3c577fb7961dc1aaf66608746fac0a0e.hbc (3.1MB)
Assets (30): Inter_400Regular_Italic.ttf (346KB) Inter_400Regular.ttf (342KB) Inter_700Bold.ttf (344KB)
             MaterialSymbols_400Regular.ttf (967KB)  + expo-router png/xml (~20 KB toplam)
Toplam çıktı: 5.105.523 bayt (hbc 3.071.286 + fontlar 1.999.980 + diğer ~34 KB)
```

| Kalem | Bayt | Pay |
|---|---|---|
| hbc paketi | 3,07 MB | %60 |
| Material Symbols fontu | 0,97 MB | %19 |
| Inter (3 ağırlık: 400, 400 italic, 700) | 1,03 MB | %20 |
| expo-router png/xml | ~0,03 MB | %1 |

Not: bytecode'suz minify'lı JS 1.996.008 bayt. APK'ya gömülen `assets/index.android.bundle` **2.488.644 bayt** (export'un 3,07 MB'ından küçük; farkın nedeni ölçülmedi - iki yol farklı Hermes/Metro bayrakları kullanıyor olabilir, iddia edilmiyor).

### 1.2 JS paketi paket bazlı (sourcemap, `--no-bytecode`, minify'lı JS 1,76 MB atfedilen)

| Paket | Bayt | Pay | Not |
|---|---|---|---|
| react-native | 579.164 | %32,9 | çekirdek, kaldırılamaz |
| expo-router | 453.044 | %25,8 | react-navigation core 102 KB, elements 39, native 29, stack-utils 29, bottom-tabs 24, native-stack 23 |
| expo | 97.257 | %5,5 | |
| **react-native-worklets** | **92.625** | **%5,3** | uygulama kodu import etmiyor (bkz. 1.4) |
| uygulama (`src/`) | 91.666 | %5,2 | en büyüğü `content/tr.ts` 6,4 KB, `settings-view` 4,9 KB, `CardView` 4,4 KB |
| **@expo/ui** | **66.571** | %3,8 | jetpack-compose; expo-router android toolbar'ından |
| react-native-screens | 62.672 | %3,6 | |
| @react-native/virtualized-lists | 49.430 | %2,8 | |
| expo-notifications | 35.182 | %2,0 | |
| expo-sqlite | 21.284 | %1,2 | |
| **react-native-reanimated** | **0** | - | JS'i pakete GİRMİYOR |
| **react-native-web, react-dom, gesture-handler** | **0** | - | Android paketinde yok |

### 1.3 Gerçek APK (x86_64, `unzip -v`)

| Derleme | APK | dex (açık/sıkışık) | .so toplam | `index.android.bundle` |
|---|---|---|---|---|
| debug (eski, 09-24) | 80,6 MB (yalnız x86_64 libleri) | 54,1 / 21,1 MB | - | (Metro'dan) |
| **release, R8 kapalı** | **44,46 MB** | 43,4 / 15,4 MB | 22,6 MB | 2,49 MB |
| **release, R8+shrink açık** | **35,10 MB** | 15,7 / 6,3 MB | ~22,6 MB | 2,49 MB |

Release .so dökümü (R8 kapalı, x86_64): libreactnative 7,10 MB, libhermesvm 2,59 MB, libexpo-sqlite 1,88 MB, **libreanimated 1,54 MB**, libexpo-modules-core 1,45 MB, libc++_shared 1,25 MB, libreact_codegen_rnscreens 1,23 MB, **libworklets 1,06 MB**, libappmodules 1,02 MB, libzstd-kmp 0,82 MB. Fontlar APK'da `res/*.ttf`: Material 966.544 (430 KB sıkışık), Inter 3 x ~343 KB (~166 KB sıkışık).

Uyarı: arm64/AAB per-ABI indirme boyutu ayrı; burada yalnız x86_64 ölçüldü. .so'ların arm64 karşılıkları benzer büyüklükte olacaktır ama ÖLÇÜLMEDİ (K5/EAS `preview` çıktısı gerekir).

### 1.4 Kullanılmayan bağımlılıkların etkisi (ölçüm + tahmin ayrımı)

- `grep` ile `src/` içinde reanimated, worklets, react-native-web, react-dom, gesture-handler: **0 eşleşme** (uygulama kodu kullanmıyor). `package.json:20,22,23,27,28`.
- **reanimated:** JS pakette 0; ama native `libreanimated.so` **1,54 MB** (release) APK'da ve Java tarafı dex'te. Kaldırma kazancı ~1,5 MB + dex (tahmin, ÖLÇÜLMEDİ). Kaldırmanın yan etkisi: `expo-router` peer'ı `react-native-reanimated: "*"` (opsiyonel meta ile), `@expo/ui` da aynı; **derleme + K4 şart**.
- **worklets:** JS'e 92 KB (%5,3) ve native 1,06 MB. JS'e uygulamadan değil `@expo/ui` üzerinden giriyor (`node_modules/@expo/ui/src/State/optionalWorklets.ts`, "optional" require ama paket kuruluysa Metro pakete alıyor); `@expo/ui`'yi de expo-router android stack toolbar'ı çekiyor (`expo-router/build/layouts/stack-utils/toolbar/*.android.js`). Yalnız reanimated'ı kaldırmak worklets'i kaldırmaz.
- **react-native-web / react-dom:** Android paketine 0 bayt giriyor (ölçüldü). Kaldırmanın APK kazancı YOK; kazanç yalnızca kurulum/audit yüzeyi (08'deki TB-3).
- **Material Symbols 967 KB (asıl kayıp):** zincir `node_modules/expo-router/build/native-tabs/utils/materialIconConverter.android.js:5` -> `expo-symbols` -> `@expo-google-fonts/material-symbols`. Uygulama `Tabs` kullanıyor (`src/app/(main)/_layout.tsx:1,26`), native-tabs'a dokunmuyor; Metro expo-router'ın kendi iç import'unu ağaç-sallayamıyor.
- **Inter italic** (346 KB) `src/card/fonts.ts:29,40,53`: özet hapı için paketli (09'daki YB2-07 kapanmış). Maliyeti ~170 KB sıkışık; kabul edilebilir.
- **R8:** dex 43,4 -> 15,7 MB; en büyük tek kazanç (9,4 MB). `android/app/build.gradle:69,116-118` bayrakları `gradle.properties`'ten okuyor (varsayılan false). `android/` prebuild ürünü olduğundan kalıcı çözüm `app.json`/EAS tarafındadır (bölüm 7).

## 2. Başlatma

### 2.1 Sonuçlar (soğuk = `am force-stop`, 2 sn bekleme, `am start -W`; "içerik" = Bugün ekranının PNG'sinin boyut eşiğini geçmesi, ±0,2 sn)

| Derleme | Durum | n | TotalTime (ms) medyan [min-max] | Bugün içerik (ms) medyan [min-max] |
|---|---|---|---|---|
| dev client | onboarding ekranı | 5 | 3799 [3671-3930] | 4316 [4048-4453] |
| dev client | Bugün (veri var) | 5 | 3811 [3749-3843] | 4381 [4307-4400] |
| dev client | HOT (HOME sonrası) | 3 | 66-85 | - |
| **release (R8 kapalı)** | **Bugün (veri var)** | **10** | **493 [438-561; aykırı 1390]** | **895 [833-1005; aykırı 1817]** |
| release (R8 açık) | Bugün (veri var) | 6 | 345 [330-367] | 790 [753-846] |

Ham alıntı (release, R8 kapalı): `RESULT total=457 wait=459 shell_start_ms=475 content_ms=836 shots=2`.
Release ilk açılış (kurulumdan hemen sonra) 458/914 ms, `pm clear` sonrası R8 build ilk açılış 816 ms.
İlk açılış debug APK yeniden kurulumu sonrası 5650-6648 ms (dex derleme, kullanıcıyı ilgilendirmez).

### 2.2 Dev client ile release arasındaki fark (logcat zaman çizelgesi)

Dev client (`logcat-coldstart.txt`, t=0 process start): ReactHost +0,92 s, Metro varlık kontrolü +1,50 s, bundle'ı Metro'dan yükleme başlangıcı +2,3 s, `Running "main"` +3,33 s, `Displayed +3s735ms`. Yani ~1,7 s Metro paket indirme/JS değerlendirme + ~0,6 s Metro kontrol. **Dev client sayıları ürünü temsil etmez.**

Release (`logcat-release-coldstart.txt`, t=0 process start `Start proc`): `Loading JS Bundle` +0,31 s, `Running "main"` +0,43 s, `Displayed +522ms`. Ekranda önce **Expo varsayılan mavi (#208AEF) splash** (`app.json:37-42`, `assets/images/splash-icon.png`): kare serisi f1 (0,85 s) 35 KB = splash, f2 (1,05 s) Bugün içeriği. Yani `Running main` (0,43 s) ile Bugün içeriği (~0,9 s) arasında **~0,45 s** JS başlatma var: expo-router rota kurulumu, SQLite açılışı + `PRAGMA user_version`, iki ardışık onboarding kapısı okuması, bildirim senkronu, ilk render. Bu aralığın hangi kısmının ne olduğu ÖLÇÜLMEDİ (kaynak değiştirmeden zamanlama enstrümanı konulamadı).

### 2.3 Başlatma yolunda ertelenebilir olanlar (kod okuması, K1; kazanç ÖLÇÜLMEDİ)

- `src/app/_layout.tsx:33` `initAppDatabase()` render içinde, senkron açılış (`expo-sqlite` `openDatabaseSync`) + migrasyon kontrolü ilk render öncesi JS iş parçacığında.
- `src/app/_layout.tsx:38` `SplashScreen.hideAsync()` mount'ta hemen çağrılıyor; oysa ilk içerik `index.tsx:14-19` (gate -> `LoadingView` -> `Redirect`) -> `(main)/_layout.tsx:16` (ikinci kapı) -> `today.tsx:53-63` (üçüncü okuma) zincirinden sonra gelir. Ardışık üç async okuma ve iki `LoadingView` geçişi var.
- `src/app/_layout.tsx:53` açılışta `syncNotificationsNow()`: 7 SELECT + native izin/planlama çağrıları (bölüm 5.4).
- Kart fontları (`src/card/fonts.ts`) yalnız kart rotasında yükleniyor, açılış yolunda DEĞİL (doğru karar).

## 3. "8 saniyelik akış" (Bugün, check-in)

### 3.1 Adım ve dokunuş sayısı

| Akış | Dokunuş | Ekran geçişi |
|---|---|---|
| İlk kullanım: onboarding | 3 (Başla, Anladım devam, İzin ver / Şimdi değil) + izin verirse sistem diyaloğu +1 | 3 |
| Günlük check-in (Bugün, tek ekran) | **4 kategori + Kaydet = 5** | **0** |
| Dün'ü doldurmak | +1 ("‹ Dün") | 0 (aynı ekran) |
| Sekme geçişi (Hafta/Ayarlar) | 1 | 1 |

`docs/ux/ekran-akisi.md:157` "8 sn = 4 dokunuş + 1 Kaydet, ek onay yok" hedefi sayısal olarak karşılanıyor. Emoji kutusu düzeni 411x914dp'de tek ekrana sığıyor (kesilme yok).

### 3.2 Gecikmeler (adb `input tap`, gecikme çıkarıldı)

- 4 kategori dokunuşu + Kaydet **arka arkaya** (sıfır bekleme) enjekte edildi: 4 dokunuş 34-47 ms; 4 seçimin hepsi DB'ye doğru yazıldı (`3|3|1|2`, `3|1|3|2` doğrulandı). Yani hızlı dokunuş kaybolmuyor.
- **Kaydet dokunuşu -> DB satırı (dev):** 21-34 ms (`kaydet_tap_to_dbrow_poll_ms=21..34`), JS handler dokunuştan 15-26 ms sonra çalıştı.
- **Dokunuş -> görsel değişim** (seçili çerçeve, "· durgun" etiketi): dev 188-202 ms, release 114-229 ms (ölçüm zemini ~100-200 ms; bu bir üst sınır, gerçek gecikme daha düşük olabilir). Hedef <100 ms için bu yöntemle karar VERİLEMEZ (bölüm 6).
- **Sekme geçişi** (Bugün/Hafta/Ayarlar): ilk görsel değişim dev 117-226 ms, release 238-280 ms; "yerleşme" ~1,0 s her sekmede, ama bu **Material ripple animasyonu** (kare serisinde f1-f5 boyunca sekme çubuğundaki gri ripple; içerik f1 = 0,37 s'de değişmiş). İçeriği engellemiyor.
- **Hafta -> kilitli kutu -> kart rotası (dev, ilk kez):** dokunuştan sonra 1,5 sn'de hâlâ boş beyaz + spinner, 4,5 sn'de ara ekran (K3). İkinci girişte ara ekran 0,5-0,85 sn'de (slide geçişi sürerken) görünüyor. İlk girişteki gecikme dev'de gözlendi; release'te "kartın ilk açılışı" yalnız deep link ile ölçülebildi (bölüm 4.2).
- **Kaydet -> geri bildirim:** dev ve release'te **yok**. Release, 14 örnek, 1,58 sn boyunca: `+121ms same ... +1576ms same`. Kaydet düğmesi siyah kalıyor, metin/ilerleme/haptik yok. DB'de kayıt var. Kullanıcı "kaydedildi mi" diye yeniden basabilir. (QA4-05 / 09'daki bulgu; performans değil algı meselesi.)

### 3.3 8 sn bütçesinin dökümü (makine payı)

Release, soğuk açılıştan Bugün içeriğine ~0,9 s + 5 dokunuşun uygulama tarafı gecikmesi toplam <1 s (üst sınır) + Kaydet 0,03 s = **makine payı ≲ 2 sn**. Geri kalan ~6 sn insan süresi (dokunuş başına ~1 sn varsayımı); **insan kronometresi ölçülmedi (K5)**. Dev client'ta yalnız açılış 4,4 s ile bütçenin %55'ini yer; bu dev'e özgü.

## 4. Akıcılık (`dumpsys gfxinfo`, `reset` sonrası)

### 4.1 Sekme geçişi (10 döngü x 3 dokunuş, 0,7 sn aralık)

| Derleme | Kare | Jank (yeni ölçüt) | p50 | p90 | p95 | p99 | GPU p50/p90/p99 |
|---|---|---|---|---|---|---|---|
| dev | 1282 | 8 (%0,62) | 17 ms | 22 | 23 | 31 | 14/18/23 ms |
| **release** | **1285** | **3 (%0,23)** | 19 ms | 25 | 26 | **29** | 17/18/19-ms bandı |

Yorum: p50 17-19 ms, 60 Hz'de vsync sınırında (16,7 ms) - "legacy jank" %33-69 görünmesi bu yüzden anlamsız (emülatör karelerinin çoğu 17 ms). Yeni ölçütteki jank %0,2-0,6. GPU p50 14-17 ms yüksek: ripple animasyonunun büyük dairesi host GPU çevirisinde pahalı; JS/UI iş parçacığı `Slow UI thread` = 0 (release). Boşta 6 sn: Bugün, Hafta, Ayarlar'da **0 kare** (sürekli çizim yok, pil için iyi).

### 4.2 Kart reveal (K3 akışı: Kaydet -> kart; ve deep link)

- **Reveal animasyonu tasarımı:** `src/card/CardRevealView.tsx:52-53` `BLUR_FADE_MS = 400`, `CONTENT_REVEAL_MS = 1200`, ikisi de `useNativeDriver: true`. Ölçülen süre bununla tutarlı, animasyon darboğaz değil.
- Dev, Kaydet(Pazar) -> kart, kare serisi (screencap döngüsü açık): t=0 Kaydet, 0,56 s rota geçişi, 0,72 s boş kart çerçevesi (39 KB), 0,88-1,69 s reveal, 1,69 s içerik tam, 2,15 s son kare. Aynı koşulda gfxinfo: 78 kare, jank 6 (%7,7), p50 22, p90 34, p99 46 ms (screencap yükü karıştırıyor, kullanma).
- **Release, deep link `haftik://card/2026-09-28`, screencap serisiyle:** 0,44 s Bugün (intent teslimi), 0,65 s boş, 0,84 s başlıyor, 1,58 s tam, 1,9 s kararlı.
- **Release, temiz gfxinfo (screencap yok), 5 tekrar:** 76 kare her tekrarda, jank 2/76, 2/76, 2/76, 3/76, 1/76 (%1,3-3,9), p50 17-19, p90 17-21, p99 **18-28 ms**. Örnek: `Total frames rendered: 76 Janky frames: 2 (2.63%) 50th percentile: 17ms ... 99th percentile: 19ms`.
- Kaydırma: **uygulamada kaydırılabilir ekran yok** (Ayarlar'da swipe sonrası ekran birebir aynı, PNG boyutu eşit; Bugün/Hafta tek ekrana sığıyor). Kaydırma jank'ı ölçülecek bir yüzey yok. Font 2.0'da kaydırma çıkar mı bu turda ölçülmedi (11-erişilebilirlik ile birlikte bakılmalı).

### 4.3 Uzun dokunuş döngüsü (sekmeler + 4 emoji + Kaydet, 5 dk, 68-69 yineleme x 9 dokunuş)

| Derleme | Kare | Jank | p50 | p90 | p95 | p99 |
|---|---|---|---|---|---|---|
| dev | 12.242 | 437 (%3,57) | 17 | 19 | 21 | 23 ms |
| release | 12.408 | 467 (%3,76) | 17 | 25 | 26 | - |

Yalnız emoji seçimi + Kaydet döngüsü (release, 30 yineleme): 125 kare, p50 17, p95 18, **p99 18 ms**, `Slow UI thread: 0`; "jank %39" görünüyor ama `legacy 0`, kare süresi histogramı 20 ms üstünde HİÇ kare yok ve 125 kare gibi küçük örneklemde vsync/`Slow issue draw commands: 45` emülatör GPU çevirisine ait. **Bu sayıdan gerçek jank sonucu çıkarılmaz**; karar kare süresi dağılımına dayanıyor (p99 <=29 ms).

## 5. Bellek / pil / arka plan / PNG / SQLite

### 5.1 `dumpsys meminfo` (PSS, KB)

| Durum | Dev client | Release |
|---|---|---|
| Soğuk açılış, 12 sn boşta | **327.760** (Native Heap 172.124, Java 18.436, Code 39.028) | **119.717** (Native 40.548, Java 6.608, Code 50.768) |
| 5 dk döngüde t=4 s | 344.901 | 132.283 |
| t=66 s | 382.774 | 150.812 |
| t=128 s | 373.978 | 158.650 |
| t=190 s | 377.887 | 166.646 |
| t=251 s | 386.907 | 169.640 |
| Döngü sonrası | 384.751 (Native 200.492) | 164.489 (Native 51.956, Java 11.936) |
| `send-trim-memory RUNNING_CRITICAL` sonrası | 375.319 | 158.071 |
| Views / Activities | 171 / 1 | 167 / 1 |

Yorum: release dev'in ~%37'si. 5 dk yoğun dokunuşta +37-49 MB artış var ve artış hızı düşüyor (t=66 -> 251'de +19 MB); trim sonrası yalnızca -6/-9 MB geri geldi. Sızıntı **kanıtlanmadı** (Activities 1, ViewRootImpl 1, WebView 0; View sayısı 88->167, boşta yeniden 88'e dönüp dönmediği ölçülmedi). Hermes GC'nin tembelliği de aynı görünümü verir. Karar için: 30+ dk koşu ya da heap snapshot, gerçek cihazda K5.

### 5.2 CPU / uyandırma / zamanlayıcı

- `/proc/PID/stat` (utime+stime, 1 tick=10 ms), 30 sn boşta: dev ön plan 14+59=73 tick (%2,4), dev arka plan 13+47=60 tick (%2,0), **release ön plan 8+38=46 tick (%1,5)**. Release arka plan ölçülmedi. Emülatörde sistem tarafı (stime) baskın; dev client'ın Metro/inspector bağlantısı dev'i şişiriyor. Mutlak pil sonucu çıkarılamaz.
- `dumpsys alarm | grep -c com.batuhan.haftik` = **0** (bildirim izni verilmedi). İzin verildiğinde 7 alarm (09 turunda K4: `RTC_WAKEUP window=+1h`), `force-stop` sonrası 0.
- `useNow` (`src/lib/now.ts:85-114`): AppState `active` dinleyicisi + **tek** `setTimeout` (gece yarısı/Pazar 20:00'e kalan süre, her tetiklenişte yeniden kurulur), `unref`. Sürekli yoklama yok. Ön plandaki 0 kare çizimi de bunu doğruluyor.
- Uygulama kapalıyken (process ölü) JS çalışmaz; arka plan işi yalnızca planlanmış yerel bildirim alarmları (izinle). Yeniden başlatma: `RECEIVE_BOOT_COMPLETED` merged manifest'te var.

### 5.3 Kart PNG yakalama

- Dev, "Paylaş" -> önizleme -> "Bu haliyle paylaş" dokunuşundan paylaşım seçicisinin başlamasına (`START ... CHOOSER`): **326 ms**. Release (n=3): **146, 90, 89 ms** (`1790590809.134` seçici, `...808988` dokunuş).
- Dosya: `cache/ReactNative-snapshot-image7630648217881774873.png`, **176.491 bayt**, 1080x1920. Paylaşım seçicisinden geri dönünce `cache` içinde snapshot **0** (temizlik çalışıyor). Release'te dosya boyutu okunamadı (`run-as` debug'a özel).
- Yakalama ana hattı bloklamıyor: kare süreleri normal (`gfx-share.txt`: 155 kare, p50 18, p90 30 ms).

### 5.4 SQLite sorgu sayısı (KOD OKUMASI, K1; ölçülmedi)

Bu turda kaynağa enstrümantasyon eklemek yasaktı ("kod değiştirme"), bu yüzden sayılar statik. `expo-sqlite` **senkron** API'si (`src/data/db.ts:76-95` `getAllSync/getFirstSync/runSync`) JS iş parçacığında çalışır; hepsi tek satırlık/küçük tablolar.

| Olay | Sorgu | Kaynak |
|---|---|---|
| Soğuk açılış (dönen kullanıcı) | ~11: `PRAGMA user_version` 1 + bildirim senkronu `readNotifyState` 7 (`getAllSettings` 5 ayrı SELECT + `getCheckins` 1 + `hasAnyPriorCard` 1) + `index` kapısı 1 + `(main)` kapısı 1 + Bugün `getCheckins` 1 | `data/migrations.ts:124-125`, `notify/wiring.ts:14-30`, `data/setting-repo.ts:95-102`, `lib/onboarding-gate.ts:20`, `today.tsx:53` |
| AppState `active` her dönüş | +7 (bildirim senkronu) | `_layout.tsx:53-58` |
| Bugün'de Kaydet | ~9: upsert 1 + `trackEvent` 1 + bildirim senkronu 7 (+ plan değiştiyse `setNotificationIds` 1) | `checkin-repo.ts:38-58`, `today.tsx:82-98` |
| Hafta sekmesi (her odak) | 3 (`getCheckins`, `hasAnyPriorCard`, `getCard`) + `card_unlocked` için `hasEvent` 1 (+ ilk kez kayıt 1) | `week.tsx:44-53,66` |
| Ayarlar sekmesi | 5 (`getAllSettings`) | `settings.tsx:36-37` |

Süreler bilinmiyor; Bugün içeriği release'te 0,9 s'de göründüğü için toplam DB maliyeti bu sürenin içinde. Darboğaz olduğu KANITLANMADI, mikro-optimizasyon önerilmiyor (bölüm 7'de opsiyonel notu var).

### 5.5 Merged manifest (release APK, `aapt2 dump permissions`)

`INTERNET, VIBRATE, RECEIVE_BOOT_COMPLETED, POST_NOTIFICATIONS, ACCESS_NETWORK_STATE, WAKE_LOCK, com.google.android.c2dm.permission.RECEIVE` (FCM), `BIND_GET_INSTALL_REFERRER_SERVICE`, ve ~12 satıcı rozet (badge) izni (`com.sec/htc/sonymobile/huawei/...`). Bu boyut/izin yüzeyi konusu: "üretim derlemesinde ağ yok" iddiasına dair **INTERNET + ACCESS_NETWORK_STATE + c2dm RECEIVE + install referrer** merged manifest'te duruyor. Ağ trafiği ölçülmedi (V-18, K5). `privacy-compliance-analyst` ve `security-reviewer` ile paylaşılmalı. Bu izinleri kaldırmak `blockedPermissions`/`expo-notifications` yapılandırmasını ve bildirim davranışını etkiler; performans turunda dokunulmadı.

## 6. Bütçe önerisi ve durum

Bütçeler emülatör (host hızında CPU, host GPU çevirisi) için yazıldı; gerçek cihaz için K5 ölçümüyle %50-100 gevşetilmesi beklenir. Ölçüm yolu her satırda.

| Akış / metrik | Önerilen hedef | Ölçülen | Durum | Kanıt |
|---|---|---|---|---|
| Soğuk açılış, `am start -W` TotalTime (release) | <= 1,0 s emü / <= 2,0 s cihaz | 493 ms (R8: 345) | **Geçti (emü)** | bölüm 2.1, n=10 |
| Soğuk açılış -> Bugün içeriği (release) | <= 1,5 s emü / <= 2,5 s cihaz | 895 ms (R8: 790) | **Geçti (emü)** | 2.1, `coldstart-release-*.txt` |
| Sıcak açılış | <= 200 ms | 66-85 ms (dev) | Geçti | `warmstart-dev.txt` |
| Dev client açılışı | bütçe DEĞİL, bilgi | 3,8 s / 4,4 s | - | 2.1 |
| Günlük check-in dokunuş sayısı | <= 5, 0 geçiş | 5, 0 | **Geçti** | 3.1 |
| Dokunuş -> görsel yanıt | < 100 ms | ölçüm zemini 110-230 ms | **Doğrulanamadı** (yöntem yetersiz) | 3.2; ihtiyaç: yüksek hızlı kamera/`perfetto` cihazda |
| Kaydet -> kayıt (DB) | < 100 ms | 20-34 ms | Geçti | `flow2.txt` |
| **Kaydet -> görünür geri bildirim** | **<= 300 ms bir görsel değişim** | **yok (1,58 s boyunca değişim 0)** | **AŞTI** | `flow-release.txt` |
| Günlük akış makine payı (açılış+5 dokunuş) | <= 3 s | ≲ 2 s | Geçti (üst sınır tahmini) | 3.3; toplam 8 sn insan ölçümü K5 |
| Kart: Kaydet/dokunuş -> içerik tam | <= 2,0 s | ~1,6-1,9 s (release deep link), 1,7 s (dev K3) | Geçti, sınırda (çoğu animasyon: 1,6 s tasarım) | 4.2 |
| Kart: Paylaş -> seçici | <= 500 ms | 90-146 ms (release), 326 ms (dev) | Geçti | 5.3 |
| Kare süresi p99 (release) | <= 32 ms (2 kare) | 29 ms (sekme), 18-28 ms (kart) | **Geçti** | 4.1, 4.2 |
| Kare süresi p95 | <= 20 ms | 26 ms (sekme, ripple/GPU çevirisi), 18 ms (kart) | Sekmede aştı (emülatör GPU kaynaklı, K5 şart) | 4.1 |
| Jank oranı (yeni ölçüt) | <= %5 | %0,23 (sekme), %1,3-3,9 (kart) | **Geçti** | 4.1, 4.2 |
| JS paketi (hbc) | <= 3,5 MB | 2,49 MB (APK içi) / 3,07 MB (export) | **Geçti** | bölüm 1 |
| APK (per-ABI, x86_64) R8 kapalı | <= 40 MB | 44,46 MB | **AŞTI** | 1.3 |
| APK (per-ABI, x86_64) R8 açık | <= 40 MB | 35,10 MB | Geçti (R8 açılırsa; smoke yapıldı, tam K4 yok) | 1.3 |
| Varlık: kullanılmayan font | 0 KB | 967 KB Material Symbols | **AŞTI** | 1.4 |
| Bellek (release, PSS) | boşta <= 150 MB, 5 dk yoğun <= 250 MB | 120 MB / 170 MB | Geçti; büyüme eğilimi izlenmeli | 5.1 |
| Boşta çizim | 0 kare/sn | 0 kare / 6 sn | Geçti | 4.1 |
| Arka plan alarmı (izin yok) | 0 | 0 | Geçti | 5.2 |
| Boşta CPU (release) | <= %1 | %1,5 (emü gürültüsü) | Belirsiz | 5.2 |

## 7. Düzeltme önerileri (dosya:satır; bu turda hiçbiri uygulanmadı)

Öncelik sırası "ölçülmüş etki / karmaşıklık" oranına göre.

1. **[Ürün/algı, ucuz] Kaydet geri bildirimi.** `src/app/(main)/today.tsx:82-98` (`handleSave` başarı dalında UI değişmiyor), `src/components/checkin-form.tsx:99`. Kısa (150-250 ms, `useNativeDriver`) düğme durumu/onay ve haptik; sahte ilerleme çubuğu YOK. Hedef bütçe: bir görsel değişim <= 300 ms. Sahibi: mobile-engineer + copywriter (metin).
2. **[Boyut, en büyük tek kazanç] R8 + kaynak küçültme.** Ölçüm: -9,4 MB (44,46 -> 35,10 MB), açılış 493 -> 345 ms. `android/gradle.properties` prebuild ürünü olduğundan kalıcı yol: `app.json` `expo-build-properties` plugin'i (`android.enableMinifyInReleaseBuilds: true`, `enableShrinkResourcesInReleaseBuilds: true`) veya `eas.json` build profiline gradle bayrağı. Yeni bağımlılık ise "ağa veri gönderiyor mu" kontrolü yapılmalı (yerel gradle yapılandırması, çalışma zamanı ağ yüzeyi yok, ama doğrulanmalı). Risk: RN/Expo/notifications için R8 tersine yansıma kuralları; **tam K4 turu (bildirim planlama, paylaşım, deep link, kart PNG) yeniden koşulmalı**. Karar: tech-lead + mobile-platform-specialist + release-manager.
3. **[Boyut, ucuz] Material Symbols 967 KB.** `node_modules/expo-router/build/native-tabs/utils/materialIconConverter.android.js:5` -> `expo-symbols`. Uygulama native-tabs kullanmıyor (`src/app/(main)/_layout.tsx:26` `Tabs`). Deneme önerisi: `metro.config.js`'de `expo-symbols`'u Android için boş bir modüle yönlendiren resolver (sonuç `expo export` çıktısında 967 KB'ın kaybolmasıyla ölçülür; expo-router'ın iç import'u kırılırsa geri alınır). K1'de ucuz, K4 şart.
4. **[Boyut, orta] reanimated / worklets.** `package.json:23,28`. `src/` sıfır kullanım. Kazanç: reanimated `libreanimated.so` 1,54 MB + Java; worklets `libworklets.so` 1,06 MB + JS 92 KB ama worklets'i `@expo/ui` (expo-router) çekiyor. Önce yalnız reanimated'ı çıkarıp derleme + K4 (08'in "reanimated kaldırma K1 güvenli, K4 şart" notuyla uyumlu). Beklenen: ~1,5-2 MB.
5. **[Algılanan hız] Açılış boşluğu.** `src/app/_layout.tsx:38` splash'i erken gizliyor; `index.tsx:14-19` + `(main)/_layout.tsx:16` + `lib/onboarding-gate.ts:15-35` iki ayrı kapı okuması + `today.tsx:53-63` üçüncü okuma; `app.json:37-42` splash **Expo varsayılan mavi/şevron logosu** (marka değil, visual-designer). Öneri: kapı sonucunu tek yerde okuyup splash'i ilk gerçek ekran çizilince gizlemek. Kazanç ölçülmedi (release'te splash 0,5-1,0 s görünüyor); ölçüm-önce-sonra yapılmadan uygulanmamalı.
6. **[İzin/yüzey] Merged manifest.** Release APK'da `INTERNET`, `ACCESS_NETWORK_STATE`, `c2dm.RECEIVE`, install-referrer ve ~12 rozet izni (5.5). Performans dışı; `security-reviewer`/`privacy-compliance-analyst` ile.
7. **[Opsiyonel, kanıt yok] Ayar okuma sorgusu.** `src/data/setting-repo.ts:95-102` `getAllSettings` 5 ayrı SELECT, `notify/wiring.ts:14-30` her açılış/öne gelme/Kaydet'te çağrılıyor. Tek `SELECT key,value FROM setting` 4 sorgu tasarrufu sağlar. **Darboğaz kanıtlanmadan yapılmasını önermiyorum** (release Bugün 0,9 s, kod karmaşıklığı artırır).
8. **[İzleme] Bellek büyümesi.** 5 dk yoğun döngüde +37 MB (release). 30+ dk koşu + heap incelemesi; nedeni Hermes GC tembelliği mi gerçek bir tutma mı (ör. `useFocusEffect` yüklemesi, `Animated` unmount) ayrılmalı. `CardRevealView.tsx` unmount temizliği CLAUDE.md'de zaten bilinen tuzak.
9. **[Düşük] Sekme ripple'ı.** Tabs ripple'ı emülatörde GPU p50'yi 14-17 ms yapıyor; gerçek cihazda bakılmalı, önlem şimdi gerekmez.

Uygulama planı: (2) ve (3) `expo export`/`assembleRelease` ile önce/sonra sayısıyla doğrulanabilir; (5) için önce enstrüman (release'te zaman damgası) gerekir.

## 8. Doğrulanamayanlar (K5 / bu turda yapılmadı)

- **Gerçek cihaz (K5):** tüm mutlak süreler (açılış, kare süresi, bellek), düşük-orta segment ARM cihazda Hermes/JS hızı, arm64 boyutu, gerçek GPU, pil tüketimi (batterystats emülatörde anlamsız).
- **İnsan süresi:** 8 sn'lik günlük akışın kronometreyle uçtan uca ölçümü (kullanıcı katılımı).
- **Dokunuş yanıt gecikmesi <100 ms:** ölçüm yöntemi (screencap yoklaması) zemin ~100-200 ms; cihazda yüksek hızlı kamera veya Perfetto `input` izi gerekir.
- **SQLite sorgu SÜRELERİ ve sayısı:** yalnız statik sayım. Ölçmek için kaynağa geçici sayaç gerekir (bu turda yasaktı; bir sonraki turda `db.ts` sürücüsüne 5 satırlık geçici sarmalayıcı önerilir, kopya dizinde).
- **Açılış boşluğunun (0,43 s -> 0,9 s) alt kırılımı:** enstrümansız ölçülemedi.
- **R8 derlemesinin tam işlevsel doğrulaması:** yalnız açılış, onboarding, check-in, FATAL taraması yapıldı; bildirim planlama, paylaşım, deep link, kart PNG, silme akışı R8'de denenmedi.
- **Bellek sızıntısı sonucu**, uzun süreli arka plan davranışı (Doze), release arka plan CPU'su, ağ trafiği (V-18).
- **Font 2.0 / yapılandırma değişiminde kaydırma ve yeniden düzen performansı** (11-erişilebilirlik ile birleştirilmeli).

## 9. Tekrarlanabilirlik

- Release derleme: `cd C:\hhk\haftik\android; $env:ANDROID_HOME="C:\Users\Pc\AppData\Local\Android\Sdk"; ./gradlew.bat assembleRelease -PreactNativeArchitectures=x86_64` (R8 için `-Pandroid.enableMinifyInReleaseBuilds=true -Pandroid.enableShrinkResourcesInReleaseBuilds=true`). 2 dk 39 sn / 58 sn (önbellekli). Çıktı: `android/app/build/outputs/apk/release/app-release.apk` (kopya dizinde şu an R8'li sürüm duruyor).
- Boyut: `npx expo export --platform android --output-dir <tmp> --dump-assetmap`; paket bazlı döküm için `--no-bytecode --dump-sourcemap` + scratchpad'deki `attr.js`.
- Açılış: `tti.sh` (force-stop, 2 sn, `am start -W`, `screencap` boyut eşiği). Akış: `flow.sh`/`flow2.sh`, sekme: `nav.sh`, kare serisi: `series.sh`/`dl-series.sh`/`cold-series.sh`, döngü: `usage.sh`. Adb yolu: `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe`; Git Bash'te `MSYS_NO_PATHCONV=1` şart (yoksa `/sdcard` yolları bozulur).
- Ortam geri yüklemesi: debug APK kuruldu (`install -r -d`), `pm clear` (onboarding "Başla" ekranı), `/sdcard` betikleri silindi, Metro `packager-status:running`, `adb reverse tcp:8081` açık. Animasyon ölçekleri/density/font/uimode hiç değiştirilmedi (1.0/420/1.0/night no).

## Devir

```
Durum:        bitti (K4 emülatör ölçümü; kod DEĞİŞTİRİLMEDİ)
Geçti:        başlatma, bundle, kart reveal, kare süresi/jank, bellek (izleme ile), boşta çizim, alarm
Aştı:         Kaydet görsel geri bildirimi (yok), APK boyutu R8 kapalıyken (44,46 MB), kullanılmayan font (967 KB)
Öneriler:     R8+shrink (-9,4 MB, K4 turu şart) -> tech-lead/mobile-platform-specialist/release-manager
              expo-symbols fontu, reanimated -> mobile-engineer (önce/sonra `expo export` ile)
              Kaydet geri bildirimi -> mobile-engineer + copywriter; splash görseli -> visual-designer
              manifest izin yüzeyi (INTERNET, c2dm, referrer) -> security-reviewer, privacy-compliance-analyst
K5 gerek:     gerçek cihaz süreleri, kare süresi, arm64 boyutu, 8 sn insan ölçümü, uzun koşu belleği
Ortam:        debug APK + onboarding, Metro/adb reverse açık, ayarlar dokunulmadı
```

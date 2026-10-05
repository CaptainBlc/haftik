# Kart render — ölçü bütçesi, view-shot, font, C yönü sözleşmesi

> Kart bileşenlerine (`src/card/*`), kart ekranına ya da kart PNG'sine dokunuyorsan burayı oku.

## Ölçü bütçesi

- Kart **360x640 mantıksal**, **1080x1920 PNG**. Kart ekranında kart ölçeği yalnızca görünümdür
  (`computeCardDisplayScale`), PNG her zaman 360x640'tan yakalanır. Kapat/Paylaş mutlak konumlu değil, sabit
  üst/alt çubukta. Kart metinleri `allowFontScaling={false}` (PNG sistem yazı tipi ölçeğinden bağımsız).
- (2026-09-24, MOB) **Kart kesilmesi (BLG-04), düzeltildi:** `numberOfLines` yalnızca metni sınırlar, kapsayıcı
  yüksekliğini büyütmez; kart bölümleri sabit piksel olduğundan (48px özet) 2 satır + pill dolgusu sığmıyordu
  ve PNG'de de kesik çıkıyordu. Ölçüler `layout.ts`'te (`SummaryTextLayout`) ve testte "alan >= satır × yükseklik
  + dolgu" olarak bağlandı; toplam 640 korunur (mekanik: `card/layout.test.ts`, `card-layout-fixes.test.tsx`).
- 411x914dp'de tek ekrana sığma kuralı (Bugün ekranı dahil, kart ekranları değil) `docs/ux/ekran-akisi.md`'de;
  bütçeyi bozan bir değişiklik `checkin-single-screen-fit.test.tsx`'i kırar. Genişliğe bağlı `aspectRatio`
  yükseklik bütçesinde tuzaktır (emoji kutusu sabit 72dp yüksekliğe çevrildi).

## `captureCardPng` imza sapması

(2026-09-23, MOB/S7a, dokümante sapma) `react-native-view-shot` yalnızca zaten render edilmiş bir `View`'in
ref'ini yakalayabildiğinden, saf bir `CardSnapshot`'tan doğrudan PNG üretmenin RN'de yerleşik bir yolu yok.
Gerçek imza: `(ref: RefObject<ViewShotRef | null>) => Promise<string>` (bkz. `src/card/capture.ts` başlığı).

## view-shot'ın platform farkları

- **[GÜNCEL 2026-10-02, S16b — 04 #4, 24 §2.1, 22 F-8] Paylaşım dosyası sözleşmesi:** `captureCardPng`
  `result:'base64'` ile yakalar (view-shot kendi geçici dosyasını/harici önbellek seçimini hiç üretmez),
  PNG'yi adanmış `cacheDirectory/haftik-share/` dizinine SABİT, tarihsiz adla (`Haftik-kart.png`) yazar
  (`src/card/share-dir.ts`). `shareCard` ve `shareReport` paylaşım sonrası dosyayı **silmez**: Android seçici
  hedef uygulamayı başlatırken kapanıp promise'i çözebildiği için silmek hedefe boş/eksik görsel verebiliyordu.
  Temizlik: her yakalamada ve açılışta yaşa göre (> 1 saat, yaşı bilinmeyen de silinir), "Tüm verilerimi sil"de
  dizin komple. Deneme raporu da aynı dizinde (`deneme-raporu.txt`). Emülatörde doğrulandı (R8'li release):
  PNG 1080x1920, tEXt/eXIf yok, cache'te `ReactNative-snapshot-image*` kalmıyor, seçici açılıyor, eski dosya
  saat atlamasıyla yaşa göre süpürüldü, silme dizini kaldırıyor. **Açık (K5):** başarılı hedef seçiminde (WhatsApp)
  görselin eksiksiz gittiği gerçek cihazda hâlâ doğrulanmadı. `FileProvider` `cache-path path="."` alt dizinleri kapsar.
- (2026-09-23, MOB/S10 SEC I-1; hâlâ geçerli, eski kurulumlar için) `src/card/temp-cleanup.ts`
  `sweepSnapshotFiles()`: `cacheDirectory` altında yalnızca `ReactNative-snapshot-image*.png` siler
  (react-native-view-shot `TEMP_FILE_PREFIX`); açılışta ve `deleteAllData` sonunda çağrılır, en iyi çaba. S16b'den
  sonra yeni dosya üretilmez, yalnızca S16b öncesi sürümlerin kalıntıları içindir.
- **[KAPANDI 2026-10-02, S16b — yalnızca kodla; iOS cihazda doğrulanmadı]** Eskiden iOS'ta view-shot dosyayı
  `NSTemporaryDirectory()/ReactNative/` altına yazıyor, `expo-file-system` bu dizini sunmadığı için süpürülemiyordu.
  `captureCardPng` artık `result:'base64'` kullanır ve PNG'yi her iki platformda uygulamaya özel
  `cacheDirectory/haftik-share/` altına yazar; view-shot hiç geçici dosya üretmez. iOS'ta `cacheDirectory`ın aynı
  süpürme/silme kapsamına girdiği iOS yapısı gelince (TestFlight, K5) bir kez gözle doğrulanmalı.
- (2026-09-23, MOB/S7b) `expo-sharing`'in `shareAsync`'i tek dosya + `dialogTitle`/`mimeType`/`UTI` kabul eder;
  RN'in kendi `Share` API'sindeki `{url, message}` gibi ayrı bir "mesaj metni" **yok**. `dialogTitle` yalnızca
  Android+web'de paylaşım seçicisinin başlık çubuğunda görünür, hedef uygulamaya mesaj olarak taşınmaz; iOS'ta
  hiç kullanılmaz. Mağaza bağlantısının PNG'nin yanında gerçek bir paylaşım mesajı olarak taşınıp taşınmadığı
  cihazsız doğrulanamadı — bağlantı bundan bağımsız olarak kartın gömülü damgasında (`CARD_STAMP_TEXT`) zaten
  PNG'nin içinde basılı.
- **[ESKİ 2026-10-02: S16b'de kaldırıldı, bkz. yukarıdaki güncel sözleşme]** (2026-09-23, MOB/S7b) Paylaşılan PNG,
  `Sharing.shareAsync` TAMAMLANDIĞINDA `deleteAsync`'iyle siliniyordu. Hâlâ geçerli kalan kısım: SDK 57'de eski
  `deleteAsync(uri, opts)` tarzı fonksiyonlar yalnızca `expo-file-system/legacy` alt-yolunda — `src/card/share.ts`
  bilerek bu alt-yolu import eder (kod düz `file://` URI'leriyle çalışıyor); yeni `File` sınıfıyla legacy
  fonksiyonları karıştırma.

## Font paketleme

(2026-09-23, MOB/S7a) Google Fonts "Inter" (`@expo-google-fonts/inter`), yalnızca kullanılan ağırlıkların alt
yol (subpath) importuyla paketlendi — kök `index.js` tüm ağırlıkları (~6MB) `require` eder. Emoji paketlenmedi
(sistem emoji fontu; `CardView.tsx`'in `emoji` stili bilerek `fontFamily` almaz).

**Henüz uygulanmadı (S19 işi):** C yönü görsel sistemi Fraunces (başlık) + Inter (gövde) kullanıyor
(`docs/inceleme-2026-09-25/17-gorsel-sistem-v2.md`); yeni font paketi eklenirken aynı alt-yol importu deseni
izlenmeli ve "ağa veri gönderiyor mu" kontrolü (statik `.ttf`, ağ çağrısı yok) tekrarlanmalı.

## Blur yaklaşık, gerçek değil

(2026-09-23, MOB/S7a) `expo-blur` (veya benzeri) native bağımlılık eklenmedi; `CardRevealView.tsx` yalnızca
opaklık crossfade'i kullanır. Gerçek blur istenirse ayrı bir karar/iş.

## Unvan otomatik gizleme

(2026-09-23, MOB/S7b, spec güvenlik gereksinimi 3) Unvan ayrı bir aç/kapa satırı olarak **modellenmedi**.
`title.basedOnCategories`teki kategorilerden en az biri o an gizliyse, unvan satırlarla **aynı** mekanizmayla
`???` olarak çizilir (`src/card/title-visibility.ts` `shouldHideTitle`). "Farklı bir unvan göster" alternatifi
reddedildi — ikinci bir seçim mekanizması yok ve olsaydı bile `weekly_card`'ın "dondurulan kart bir daha
değişmez" garantisini ihlal ederdi.

**Güncelleme (2026-10-01, B1 — çekirdekten önce karar listesi):** Paylaşım unvanı mekanizması (I-2 intent)
bu kuralı değiştirmeyecek şekilde tasarlanacak — dondurulmuş, ayrı bir "paylaşım unvanı" + katı görüntü kuralı.
Ayrıntı: `docs/inceleme-2026-09-25/21-mimari-ve-efor.md` §2a (ayrıca bu raporun bulduğu çıkarım-sızıntısı riski
için `security-reviewer` turu S21'in girdi kapısı).

## C yönü: kart render sözleşmesi (karar 1, Batuhan; teknik seçim mimari §2b)

Mimari hangi tekniği seçerse seçsin, bu kurallar bozulmamalı (tam 8 madde ve her birinin testi:
`docs/inceleme-2026-09-25/28-muhendislik-standartlari-v2.md` §4.11'de):

1. **Yakalanan ağaç** (ViewShot'ın içi) yalnızca `View`/`Text`/`Image`/`transform` içerir. `elevation`,
   `shadow*`, `boxShadow`, blur ve gradyan paketi **kullanılmaz** — Android'de elevation gölgesi yazılım
   tuvaline çizilmez, PNG ekrandan farklı çıkar. C'nin sert gölgesi ofsetli dolu `View`'dur, kuralla uyumlu.
2. Veri taşımayan süsler (noktalı zemin, arka kâğıt, rozet) **sabit PNG** olur (döşeme/`resizeMode="repeat"`
   değil — ölçek/yuvarlama farkı riski).
3-8. (ayrıntı için 28 raporuna bakılmalı.)

### S19 bağımsız kısım (2026-10-05): altyapı hazır, `CardView` v2 henüz yok

P0 görsel oturumu ve F0-9 Story ölçümü kayıtlarda olmadığı için Batuhan "bağımsız kısımla başla" dedi.
Yapılanlar (hepsi K2; `npm run verify`: 94 suite / 1288 test yeşil, 3 atlandı):

| Madde | Dosya | Mekanik kontrol |
|---|---|---|
| Kart token'ları (renk, ton, eğim, gölge ofseti) | `src/card/tokens.ts` | `__tests__/constants/contrast.test.ts` |
| Kabuk token'ları, açık+koyu (ekrana bağlanması S23) | `src/constants/tokens.ts` | aynı test; 17 §2.2'deki oranlar birebir tutuyor |
| R-7 renk tek kaynak | `eslint.config.js` (`R7_LEGACY_FILES` yalnız küçülür) | `__tests__/infra/color-lint.test.ts` (sayı üst sınırı) |
| P-6 satır kimliği dondurma | `src/card/line-level.ts` (`parseLineId`) | `__tests__/domain/id-format.test.ts` (havuzun tamamı) |
| Fraunces 800 / 600i + Inter 500/700/800 | `src/card/fonts-v2.ts` (v1 `fonts.ts` yerinde) | `__tests__/card/fonts-v2.test.ts` (cmap'ten Türkçe glifler) |
| `<Sticker>` ilkeli, `rotatedBounds` | `src/card/Sticker.tsx`, `geometry.ts` | `sticker.test.tsx`, `geometry.test.ts` |
| R-15 madde 1, 3, 8 | — | `__tests__/card/render-contract.test.tsx` |
| R1 yakalama çerçevesi | `src/card/capture-frame.ts`, `CardView` `captureFrame` | `__tests__/card/capture-frame.test.tsx` |
| Fikstür galerisi verisi (6 kart) | `src/dev/card-fixtures.ts` | render-contract testi |

Notlar:
- Fraunces paketi (`@expo-google-fonts/fraunces@0.4.1`, 72 KB + 86 KB): bağımlılığı yok, kaynakta ağ çağrısı yok.
- `Sticker` prop adı bilerek `dropOffset` (RN'in yasaklı `shadowOffset` stil adıyla çakışmasın; grep tabanlı
  R-15 bunu yakaladı).
- R1: yalnız yakalama örneği (`card-preview-view`'daki ekran dışı `CardView`) çerçeveli; ekrandaki örnekler 360x640 dp.
  Çerçeve piksel olarak tam 1080x1920, kart merkez etrafında `1080/(360·PixelRatio)` ile büyür.
- Kalan R-15 maddeleri (2 PNG varlık, 4 v2 yerleşim bütçesi, 5 gizli satır 7 kural, 6 `LevelMark`, 7 font yedeği)
  `CardView` v2 ile eklenir.

**K4 sonucu — R1 çalışıyor (2026-10-05, emülatör `haftik_pixel`, release APK, çalışma ağacı `bc52dca` + S19 değişiklikleri):**
Aynı kart (aynı veri, tüm satırlar görünür), iki release APK: `captureFrame` kapalı ve açık; iki yoğunlukta
(`wm density 320` = 2,0x ve 420 = 2,625x). PNG'ler uygulamanın kendi "Bu haliyle paylaş" yolundan, cache'teki
`haftik-share/Haftik-kart.png`'den çekildi; hepsi 1080x1920. Ölçüt: yatay kenarların %10-%90 geçiş genişliği (px,
düşük = keskin), güçlü kenar sayısı (gradyan > 100) ve %99 gradyan.

| Yoğunluk | `captureFrame` | Kenar genişliği | Güçlü kenar | p99 gradyan | PNG boyutu |
|---|---|---|---|---|---|
| 2,0x (320) | kapalı | **2,27 px** | 5 488 | 134 | 236 KB |
| 2,0x (320) | **açık** | **1,11 px** | 17 696 | 221 | 140 KB |
| 2,625x (420) | kapalı | **1,81 px** | 10 968 | 163 | 225 KB |
| 2,625x (420) | **açık** | **1,13 px** | 17 429 | 219 | 142 KB |

- Kapalıyken keskinlik yoğunluğa bağlı (büyütme 1,5x → 2,27 px, 1,14x → 1,81 px); açıkken iki yoğunlukta da aynı
  (~1,1 px) ve PNG daha küçük (yumuşak kenar sıkıştırmayı bozuyordu). Gözle de görülüyor (`crop-title.png`: 2,0x'te
  başlık, üst kapalı, alt açık).
- Yerleşim aynı: koyu piksel sınır kutusu iki durumda ±1 px (kesilme/kayma yok); yedek ölçüm tekrarlanabilir
  (aynı koşulda iki yakalama bit-bit aynı sayıları verdi).
- Kanıt dosyaları repo dışında: `C:\dev\haftik-artifacts\s19\` (PNG'ler, `crop-title.png`, `sharp.js` ölçüm betiği, iki APK).
  Ölçüm betiği repoda yok; gerekirse `__tests__` dışına bir `scripts/` aracı olarak eklenebilir.
- Sınırlar: tek cihaz profili (emülatör, yazılım tuvali, `swiftshader`), 2,0x ve 2,625x; 3,0x+ ve gerçek cihaz (OEM
  render farkı) ölçülmedi. Kart henüz v1 (metin ağırlıklı); C yönünün kalın kenar/gölge/dönmüş çıkartma
  yüzeylerinde (v2) aynı ölçüm `CardView` v2 ile tekrarlanmalı (S19 "2,0x/2,625x kontur profili" maddesi).

**Bekleyen (P0/F0-9 sonucu):** L1 seviye işareti, gizli satır görünümü, Story bandı yerleşimi, `CardView` v2 ve
`layout.test.ts` değişikliği (ayrı onay gerekir).

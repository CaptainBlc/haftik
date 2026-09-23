# Haftalık Hayat Karnesi

> **Bu dosya kısmen şablondur.** Komutlar ve konvansiyonlar, S1 (araç zinciri)
> bitince gerçek komutlarla doldurulur. "Bilinen tuzaklar" gerçek hatalardan
> beslenerek büyür.
>
> Genel (projeden bağımsız) çalışma kuralları için: `~/.claude/CLAUDE.md`
> Kaynak belgeler: `intent/2026-09-20-haftalik-hayat-karti.md`, `spec.md`, `plan.md`

## Ürün özeti

Günlük ~8 saniyelik emoji check-in'inden, her pazar 20:00'de açılan
paylaşılabilir haftalık "karne" kartı üreten iOS + Android uygulaması.
v1: hesap/sunucu yok, veri yalnızca cihazda. Yığın: Expo (React Native) +
TypeScript + expo-sqlite. Android-first geliştirme.

## Commands

- Kurulum: `npm install`
- Çalıştır: `npx expo start` (Android: `npm run android`, iOS: `npm run ios` — K9 Apple üyeliği alınana kadar yalnızca EAS/simülatör yoluyla, gerçek cihaz S11)
- Test: `npm test` (`jest-expo` preset; `cross-env TZ=Europe/Istanbul` ile saat dilimi sabit; ayrıca `jest.setup.ts` aynı değeri ikinci güvence olarak ayarlar)
- Lint: `npm run lint` (`expo lint` → `eslint-config-expo`)
- Tip kontrolü: `npm run typecheck` (`tsc --noEmit`)
- Build: `<henüz tanımlanmadı — EAS build S10/S11'de; hesap girişi/kimlik bilgisi Batuhan'ın kendisi tarafından yapılır>`

**Not (S1, MOB):** Expo `create-expo-app` varsayılan (expo-router) şablonu router'ı
`src/app/` altına koyuyor (tsconfig `@/*` → `./src/*`); plan.md'nin taslak
dosya ağacındaki kök `app/` bir öneriydi ("Expo şablonunun varsayılanına
uyulur, Dilim 1'de kesinleşir" notuyla) — gerçek/son yapı `src/app/`'tır,
sonraki dilimler (S6+) buna göre yazar.

## Konvansiyonlar

`<henüz tanımlanmadı — S1'de doldurulacak. Şimdiden bilinenler: TypeScript
strict; domain katmanı (hafta/uygunluk/unvan) saf TS, Jest ile testlenir;
testlerde saat dilimi sabitlenir; kartta ham sayı/tutar/konum asla yok.>`

## Mimari

`<henüz tanımlanmadı — bkz. spec.md "Mimari genel bakış">`

## Bilinen tuzaklar

- (2026-09-21) Bu Windows makinesinde Node.js/npm ve Android araçları kurulu
  değildi; Expo işine başlamadan önce kurulmaları gerekir.
- (2026-09-22, OPS/S1 ön-araştırma) `expo-updates` güncel `create-expo-app`
  şablonlarında varsayılan olarak **eklenmiyor** — E3 kararı ("v1'de OTA
  kapalı") için elle bir "kapatma" adımına gerek yok, ama S1 sonunda
  `package.json`'da bu paketin bulunmadığı ve `app.json`'da bir `updates`
  bloğu olmadığı elle teyit edilmeli (bir starter/şablon bunu transitif
  bağımlılık olarak getirebilir).
- (2026-09-22, OPS/S1 ön-araştırma) Android'de `expo.android.allowBackup: false`
  (`app.json`) prebuild'de `AndroidManifest.xml`'e yazılır ve SQLite dosyası
  dahil tüm veriyi Auto Backup'tan hariç tutar — bu yol doğrulandı. **iOS
  tarafında `expo-sqlite` dosyasını iCloud yedeğinden hariç tutan hazır bir
  Expo `app.json` alanı/config plugin bulunamadı** (K7'nin iOS kısmı hâlâ
  açık; bkz. `plan.md` S1 doğrulama notu). Native config plugin gerekebilir,
  S1'de kesinleşmedi.
- (2026-09-22, MOB/S1) `npx create-expo-app` güncel kararlı SDK'sı **Expo
  SDK 57** (react-native 0.86.3, react 19.2.3). Varsayılan şablon web
  desteğiyle geliyor (`react-native-web`, `react-dom`, `global.css`,
  `*.module.css`); bunlar için tip bildirimleri yalnızca Expo CLI'nin ürettiği
  `expo-env.d.ts` dosyasıyla gelir (bu dosya normalde `expo start` ilk
  çalıştığında otomatik oluşur; cihaz/emülatör olmadan hiç `expo start`
  çalıştırılmadıysa elle oluşturulması gerekir — `.gitignore`'da zaten hariç).
- (2026-09-22, MOB/S1) `@types/jest`'i `jest-expo`/SDK 57'nin beklediği
  `29.5.14` sürümüne sabitledik (varsayılan `npm install jest-expo jest
  @types/jest` en son `@types/jest@30`'u çeker, bu `expo-doctor` uyarısı
  verir — "packages match versions required by installed Expo SDK" kontrolü).
  `react-test-renderer` da react'in tam sürümüyle (`19.2.3`) birebir
  eşleşecek şekilde sabitlendi; farklı bir minor/patch peer uyuşmazlığı
  (`ERESOLVE`) verir. `npx expo-doctor` S1 sonunda 21/21 yeşil.
- (2026-09-22, MOB/S1) `eslint-config-expo`'nun `react-hooks/set-state-in-effect`
  kuralı, şablonun kendi `src/hooks/use-color-scheme.web.ts` dosyasındaki
  (yalnızca web hedefi için) kasıtlı hidrasyon deseninde hata veriyor;
  satır içi `eslint-disable` ile belgelenip geçildi — bu web-only dosya,
  ürünün gerçek hedefi (Android/iOS, spec'te web yok) için işlevsel değil.
- (2026-09-22, MOB/S2) **Seviye eşikleri (`5/3`, `7/3`) literal ondalık
  (`1.67`/`2.33`) DEĞİL, tam kesir olarak yazılır** (`src/domain/score.ts`);
  aksi halde tam `5/3` ortalaması (ör. 3 günde `[1,2,2]`) sınırın yanlış
  tarafına düşer (spec S2 netleştirme #1). `computeLevel` karşılaştırması
  bu yüzden `average < 5/3` gibi hem eşiği hem ortalamayı **aynı işlemle**
  (integer bölme) üreten ifadelerle yazılmalı; `1.6666666666666667` gibi
  bir literal kopyalanırsa iki taraf artık bit-özdeş olmayabilir.
- (2026-09-22, MOB/S2, **DÜZELTİLDİ S3'te**) **Delta eşiği (±0,5)
  karşılaştırmasında floating-point riski:** S2'de yalnızca gözlemlenmiş,
  henüz test kırmamıştı. Bağımsız verifier incelemesi gerçek bir hata
  buldu: bu hafta 3 dolu gün `[2,2,3]` (avg tam `7/3`) ve geçen hafta 6
  dolu gün `[1,2,2,2,2,2]` (avg tam `11/6`) verildiğinde matematiksel fark
  tam `0,5` olmasına rağmen JS'de `7/3 - 11/6 = 0.5000000000000002`
  çıkıyor ve eski `diff > 0.5` karşılaştırması bunu yanlışlıkla `+1`
  (yükseldi) sayıyordu — spec S2 netleştirme #2 tam `±0,5`'in **sabit (0)**
  sayılmasını istiyor. Düzeltme: `src/domain/delta.ts`'e `EPSILON = 1e-9`
  eklendi, karşılaştırmalar `diff > 0.5 + EPSILON` / `diff < -0.5 - EPSILON`
  oldu. Epsilon değeri, payda en fazla 7 olan gerçek check-in ortalamaları
  arasındaki en küçük olası farktan (>= 1/42 ≈ 0,0238) çok küçük tutuldu ki
  gerçekten farklı iki eşik durumu yanlışlıkla birleştirilmesin.
  `__tests__/domain/delta.test.ts`'e bu tam senaryoyu `computeCategoryAverage`
  üzerinden gerçek check-in dizileriyle (literal `0.5` değil) doğrulayan
  regresyon testleri eklendi; ayrıca epsilonun çok üstünde gerçek kesirli
  farklarla (`avg 2` vs `avg 10/7`, fark ≈ ±0,571) `+1`/`-1` döndüğü de
  ayrıca test edildi.
- (2026-09-22, MOB/S3) **`buildCard` imzasına isteğe bağlı 5. parametre eklendi
  (spec'ten sapma, dokümante edilmiş):** spec'in dondurduğu imza
  `(weekCheckins, prevWeekCheckins, prevTitleId, weekStart)` satır/özet
  seçimindeki "ardışık haftada aynı varyant tekrarlanmaz" kuralını (spec
  "Satırlar") uçtan uca uygulamak için yetersiz — unvan için `prevTitleId`
  var ama kategori satırları ve özet için "önceki hafta hangi varyant
  seçilmişti" bilgisi taşınmıyor. `src/domain/buildCard.ts`'e geriye dönük
  uyumlu, **isteğe bağlı** bir `prevVariants?: { lines?: Partial<Record<
  Category, string>>; summary?: string | null }` parametresi eklendi;
  verilmezse (`undefined`) her kategori/özet için `prevVariantId: null`
  varsayılır ve `copy.ts` sessizce normal (tohum tabanlı) seçime düşer —
  hata fırlatmaz. **S5/S7'de gerçek kalıcı önceki-varyant izleme**
  (`weekly_card` tablosundan önceki haftanın satır/özet kimliklerini okuyup
  bu parametreye geçirmek) wiring'i yapılmalı; yapılmazsa satır/özet tekrar-
  önleme kuralı yalnızca `copy.ts`/`selectLine`/`selectSummary` birim
  seviyesinde doğrulanmış olur, gerçek üründe hiç devreye girmez. Bu, `plan.md`
  S5/S7 "Bitti kanıtı" gözden geçirilirken Batuhan'a hatırlatılmalı.
- (2026-09-23, MOB/S5) **`expo-sqlite` bu dilime kadar `package.json`'da hiç
  kurulu değildi** (spec/plan'da seçim olarak yazılıydı ama S1 iskeletine
  hiç eklenmemişti); S5'te `npx expo install expo-sqlite` ile SDK 57
  uyumlu sürüm (`~57.0.3`) eklendi, `app.json`'a config plugin'i otomatik
  işlendi. `npx expo-doctor` 21/21 yeşil kaldı.
- (2026-09-23, MOB/S5) **Repo testleri için `node:sqlite` (Node 22.5+
  yerleşik modül, bu makinede Node 24) seçildi — yeni bir npm bağımlılığı
  DEĞİL.** `better-sqlite3` gibi bir alternatif de olurdu ama ekstra native
  derleme bağımlılığı eklerdi; `node:sqlite` zaten kurulu, "ağa veri
  gönderiyor mu" kontrolü (CLAUDE.md güvenlik notu) tartışmasız geçer (ağ
  erişimi olan bir paket bile değil). **Kritik kısıt:** `node:sqlite`
  yalnızca `__tests__/helpers/node-sqlite-driver.ts` içinde import edilir,
  `src/data/*.ts`'e ASLA sızdırılmamalı — Metro (React Native bundler) bu
  Node çekirdek modülünü çözemez; `src/` altındaki herhangi bir dosyadan
  (doğrudan veya dolaylı) erişilirse gerçek `npx expo start`/EAS build
  "Unable to resolve module node:sqlite" ile kırılır. `src/data/db.ts`
  yalnızca `SqlDriver` arayüzünü ve gerçek `expo-sqlite` sürücüsünü taşır;
  test sürücüsü bilerek `src/` dışında tutuldu. Ayrıca `@types/node`'u
  tsconfig'in `types` dizisine eklemek yerine (React Native'in kendi
  `setTimeout` vb. global tipleriyle çakışma riski taşır) yalnızca
  kullanılan yüzeyi kapsayan elle yazılmış dar bir `.d.ts`
  (`__tests__/helpers/node-sqlite.d.ts`) tercih edildi.
- (2026-09-23, MOB/S5) **`weekly_card` şeması spec'in tablosuna iki ek
  sütun ekler (dokümante sapma):** `title_based_on_categories` ve
  `summary_id`. Spec'in "Veri modeli" tablosu yalnızca `title_id`/
  `title_text`/`summary_text` sayar, ama `src/domain/types.ts` (S2/S3'te
  dondurulmuş) `TitleResult.basedOnCategories: Category[]` ve
  `LineResult.id` (summary da bir `LineResult`) alanlarını zaten taşıyor —
  bu sütunlar olmadan `getCard`'ın `CardSnapshot`'ı eksiksiz geri vermesi
  (round-trip) imkânsız olurdu. Bir özellik değişikliği değil, zaten
  kilitli domain sözleşmesini karşılamak için gereken bir tamamlama
  (`src/data/migrations.ts` başındaki not).
- (2026-09-23, MOB/S5) Jest'in varsayılan `testMatch`'i `__tests__/` altındaki
  HER `.ts` dosyasını (yalnızca `*.test.ts` değil) bir test suite sanıyor;
  `__tests__/helpers/` altındaki paylaşılan test yardımcıları ("Your test
  suite must contain at least one test" hatasıyla) yanlışlıkla suite
  sayılmasın diye `package.json`'daki `jest.testPathIgnorePatterns`'a
  `<rootDir>/__tests__/helpers/` eklendi (`/node_modules/` varsayılanı da
  elle korunarak, çünkü bu alanı özelleştirmek Jest'in varsayılanının
  tamamının yerini alır).
- (2026-09-23, MOB/S5) Android yedekleme (K7) **doğrulandı, kanıtlandı:**
  `app.json`'a `android.allowBackup: false` eklendi, `npx expo prebuild
  --platform android` çalıştırıldı, üretilen `android/app/src/main/
  AndroidManifest.xml`'de `android:allowBackup="false"` grep ile teyit
  edildi. `android/` klasörü `.gitignore`'da zaten hariçti (kaynak
  kontrolüne girmez, her prebuild'de yeniden üretilir). iOS tarafı (K7'nin
  ikinci yarısı) hâlâ açık, S11'e kalıyor (yukarıdaki S1 notuyla aynı).
- (2026-09-23, MOB/S6) **Cihaz/emülatör bu ortamda yok — plan.md S6 "Bitti
  kanıtı"nın gerçek-cihaz/ekran-görüntüsü maddeleri karşılanamadı** (elle
  senaryo listesi + ekran görüntüleri, büyük yazı tipi/erişilebilirlik
  ölçeği kontrolü, "Bugün akışı ~8 sn" kronometre ölçümü). Karşılanan:
  kod yazımı, `npm run typecheck`/`npm run lint`/`npm test` (558/558 yeşil,
  491 S1-S5 + 67 yeni), `npx expo-doctor` (21/21). Bu madde bir sonraki
  gerçek cihaz oturumunda (S7/S11 civarı) kapatılmalı.
- (2026-09-23, MOB/S6) **`src/domain/week.ts`'e iki geriye dönük uyumlu ek
  dışa aktarım eklendi** (`buildCard.ts`'in S3'teki `prevVariants` ekiyle
  aynı desen): `toLocalDateString` (var olan özel `formatLocalDate`'i dışa
  açar) ve `addLocalDays` (var olan özel `addDays`+`parseLocalDate`'i
  birleştirip dışa açar). Var olan `getWeekState`/`getWeekStart`/
  `dedupeByLocalDate` imzaları/davranışı DEĞİŞMEDİ. Gerekçe: UI katmanının
  (S6) "bugün"ün `YYYY-MM-DD`'sini ve hafta aralığının son gününü bulması
  gerekiyor; bunu domain'in zaten test edilmiş, `toISOString()` tuzağından
  kaçınan tek kaynağını tekrar kullanmak, ikinci bir tarih aritmetiği
  yazıp aynı hatayı ikinci kez yapma riskinden daha güvenli. Yeni testler
  ayrı bir dosyada (`__tests__/domain/week.date-helpers.test.ts`) — S2'de
  dondurulan `week.test.ts`'e hiç dokunulmadı.
- (2026-09-23, MOB/S6) **Jest CSS mock eklendi.** `src/constants/theme.ts`
  yalnızca web hedefi için `@/global.css` import ediyor; S1-S5'te hiçbir
  test `ThemedText`/`ThemedView` (dolayısıyla `theme.ts`) render eden bir
  bileşen içermediğinden bu hiç tetiklenmemişti. S6'nın ilk bileşen testi
  "Unexpected token ':'" (CSS söz dizimi) ile patladı. Çözüm:
  `package.json`'daki `jest.moduleNameMapper`'a `"\\.css$":
  "<rootDir>/__tests__/helpers/css-mock.js"` eklendi (boş obje döndüren
  minimal mock); `css-mock.js` zaten var olan `testPathIgnorePatterns`
  (`__tests__/helpers/`) sayesinde ayrı bir test suite sayılmıyor.
- (2026-09-23, MOB/S6) **`eslint-config-expo`'nun React Compiler'a hazırlık
  kuralları** (`app.json`'daki `experiments.reactCompiler: true` ile
  ilişkili) iki yeni false-positive/katı uyarı üretti, ikisi de satır içi
  `eslint-disable` ile belgelenip geçildi (CLAUDE.md MOB/S1'deki
  `use-color-scheme.web.ts` emsaliyle aynı yaklaşım):
  1. `react-hooks/set-state-in-effect`: bir `useEffect` içinde async
     çağrıdan önce doğrudan `setState(false)`/`setState(null)` gibi bir
     "sıfırlama" çağrısını yasaklıyor. Çözüm (disable yerine, daha temiz):
     `src/app/(main)/today.tsx` ve `week.tsx`'te ayrı bir boolean/`null`
     state yerine "hangi anahtar (tarih/haftaStart) için veri yüklendi"
     bilgisini tutan bir state kullanıldı (`loadedFor`/`data.weekStart`),
     "yüklenmedi" durumu bu anahtarın güncel anahtarla eşleşmemesinden
     TÜRETİLDİ — senkron sıfırlama çağrısına hiç ihtiyaç kalmadı.
  2. `react-hooks/refs`: `useRef(new Animated.Value(0)).current` (standart
     RN `Animated` deseni) ile render sırasında `.interpolate()` çağırmak
     "ref render sırasında okunuyor" diye işaretleniyor —
     `src/components/locked-card-placeholder.tsx`'te bu bir yanlış
     pozitif (`Animated.Value` bir React ref değil, mutable bir animasyon
     nesnesi); satır içi `eslint-disable-next-line react-hooks/refs` +
     gerekçe yorumu ile geçildi.
- (2026-09-23, MOB/S6) **Expo şablonunun demo iskeleti (`src/app/explore.tsx`,
  `src/components/app-tabs*.tsx`, `animated-icon*`, `hint-row.tsx`,
  `web-badge.tsx`, `external-link.tsx`, `ui/collapsible.tsx`) koddan
  ÇIKARILAMADI** — bu oturumun sandbox izin sistemi dosya silme
  komutlarını ("Irreversible Local Destruction") engelledi. Bu dosyalar
  artık hiçbir üretim ekranından import edilmiyor (grep ile doğrulandı,
  yalnızca birbirlerine referans veriyorlar) ve typecheck/lint/test'i
  etkilemiyor, ama ölü kod olarak kalıyorlar; `src/app/explore.tsx` de
  expo-router'ın dosya tabanlı yönlendirmesi gereği hâlâ teknik olarak
  `/explore` rotasında erişilebilir (hiçbir yerden bağlantı verilmiyor).
  **Bir sonraki oturumda Batuhan'ın onayıyla elle silinmeli.**
- (2026-09-23, MOB/S6) **`(main)` rota grubunda `expo-router`'ın standart
  `Tabs` bileşeni kullanıldı, şablonun `expo-router/unstable-native-tabs`
  (`NativeTabs`) DEĞİL.** `app-tabs.tsx` (artık kullanılmayan demo)
  `NativeTabs`'ı platforma özel PNG ikon setleriyle (`tabIcons/home.png`
  vb.) kullanıyordu; bu hem "unstable" bir API hem de yeni ikon varlıkları
  gerektiriyordu. `Tabs` + emoji glif ikonları (📝/📊/⚙️) daha az varlık
  bağımlılığı ve daha öngörülebilir/test edilebilir davranış sağladı —
  kapsamda bir kayıp değil, S6'nın 3 ekranı (Bugün/Hafta/Ayarlar) için
  yeterli.
- (2026-09-23, MOB/S6) **Zaman simülasyonu iki parçaya ayrıldı:**
  `src/lib/now.ts` (her zaman var olan ürün kodu — `getNow()`/`useNow()`,
  yalnızca `__DEV__` altında etkili bir `setDevNowOverride`) ve
  `src/dev/dev-time-menu.tsx` (asıl panel UI'ı, gerçek geliştirici aracı).
  `src/app/_layout.tsx` panel bileşenini statik `import` DEĞİL, `__DEV__`
  korumalı `require()` ile yükler (`src/data/db.ts`'teki lazy-require
  deseniyle aynı) — üretim paketinin bu dalı hiç çözmemesi niyeti; **kesin
  üretim-paketi hariç tutma doğrulaması S10'un işi** (plan.md S6 notuyla
  birebir: "üretimde bulunmadığı S10'da doğrulanır").
- (2026-09-23, MOB/S6) **Hafta durumu ekranında `unlocked === true` iken
  kilitli kutuya dokunma gerçek kart açılışına GÖTÜRMEZ** — S7 (CardView +
  reveal akışı) henüz yok. `src/app/(main)/week.tsx` bu durumda yalnızca
  "Kart açılış akışı S7'de eklenecek" diyen bir `Alert` gösterir (plan.md
  S6 notu: "Pazar günü akışı (K3) bu dilimde yalnızca karar noktası olarak
  bırakılır"). `docs/ux/ekran-akisi.md` de `weekStatusHeadline`/
  `lockedBoxCaption`'ın `unlocked` durumundaki metnini tanımlamıyor
  (yalnızca iki kilitli alt-durumu tanımlıyor); S6'da seçilen "Kartın
  hazır!" / "Kartın hazır, açmak için dokun" metinleri `content/tr.ts`
  havuzunun bir parçası DEĞİL, gerekirse S7/UX onayıyla değiştirilebilir
  (bkz. `src/lib/week-status-copy.ts` dosya başı notu).
- (2026-09-23, MOB/S7a) **Yukarıdaki S6 notu artık geçersiz/eski:**
  `unlocked === true` iken kilitli kutuya dokunma artık gerçek kart açılış
  ekranına (`src/app/card/[weekStart].tsx`) yönlendirir; `Alert` kaldırıldı.
  K3 (Pazar çakışması) gerçek akışa bağlandı: `src/lib/card-flow.ts`
  (`needsTodayCheckinBeforeCard`) + `src/card/open-card.ts`
  (`openOrBuildCard`) + `src/components/sunday-checkin-required-view.tsx`
  (`docs/ux/pazar-akisi.md` "Ara ekran") + `today.tsx`teki
  `returnToCardWeekStart` query param'ıyla "Kaydet sonrası otomatik devam".
  Ayrıntı: `plan.md` S7a "Uygulama notu".
- (2026-09-23, MOB/S7a) **Font paketlendi: Google Fonts "Inter"
  (`@expo-google-fonts/inter`), yalnızca 3 ağırlık alt-yol (subpath)
  importuyla** (`@expo-google-fonts/inter/400Regular` vb.) — paketin kök
  `index.js`'i TÜM ağırlıkları (18 dosya, ~6MB `.ttf`) `require` eder;
  subpath import yalnızca ihtiyaç duyulan üç dosyayı bundle'a katar. Yeni
  bağımlılığın kendisi hiçbir dependency taşımıyor (ağa veri göndermeyen
  statik `.ttf` varlıkları), `npx expo-doctor` 21/21 yeşil kaldı. Emoji
  paketlenmedi (sistem emoji fontu; `CardView.tsx`'in `emoji` stili
  bilerek `fontFamily` almaz).
- (2026-09-23, MOB/S7a) **`captureCardPng` spec'ten sapan bir imza alıyor
  (dokümante, `src/card/capture.ts` başlığında ayrıntılı):**
  `react-native-view-shot` yalnızca zaten render edilmiş bir `View`in
  ref'ini yakalayabildiğinden, saf bir `CardSnapshot`tan (görev talimatının
  istediği tek parametreli imza) doğrudan PNG üretmenin RN'de yerleşik bir
  yolu yok. Gerçek imza S1 spike'ındaki (`captureCardSpike(ref)`) ile aynı
  desende: `(ref: RefObject<ViewShotRef | null>) => Promise<string>`.
  Spec'in `hiddenLines` parametresi bu dilimde (S7a) yok, S7b'nin işi.
- (2026-09-23, MOB/S7a) **`react-test-renderer` ağacı `unmount()`
  edilmeden bırakılırsa ve bileşen `useNativeDriver: true` ile bir
  `Animated` zamanlayıcısı başlatmışsa, Jest süreci test dosyası bittikten
  SONRA çöküyor** (`ReferenceError: ... Jest environment has been torn
  down`, ardından `TypeError:
  ReactNativePrivateInterface.getNativeTagFromPublicInstance is not a
  function` ile process crash — gözlemlendi, `CardRevealView` reveal
  animasyonuyla). Testler "geçti" raporlanmasına rağmen tüm `npm test`
  süreci başarısız çıkış koduyla sonlanabilir. Çözüm: `Animated` tetikleyen
  bir bileşeni render eden her testte ağacı `afterEach`te `act(() =>
  tree.unmount())` ile temizle (bileşenin `useEffect` `return () =>
  sequence.stop()` temizleyicisinin gerçekten çalışması için) — bkz.
  `__tests__/card/CardRevealView.test.tsx` dosya başı notu. Gelecekte
  `Animated` kullanan başka bir bileşen test edilirken bu tuzak tekrar
  aranmalı.
- (2026-09-23, MOB/S7a) **Blur→net geçiş yaklaşık uygulandı, gerçek blur
  DEĞİL:** `expo-blur` (veya benzeri) yeni bir native bağımlılık bu
  dilimde eklenmedi (kapsam dışı kaldı); `CardRevealView.tsx` yalnızca
  opaklık crossfade'i kullanır. Gerçek blur istenirse S10 cila dilimine
  bırakılabilir.
- (2026-09-23, MOB/S7a) **Cihaz/emülatör bu ortamda yok — `plan.md` S7a
  "Bitti kanıtı"nın gerçek-cihaz maddeleri karşılanamadı:** 3 farklı Android
  ekran boyutunda elle kontrol, gerçek PNG piksel/boyut doğrulaması,
  emoji'nin iki platformda (Apple/Google sistem fontu) gerçek görünümü,
  Türkçe karakterlerin gerçek cihazda net görünmesi, reveal animasyonunun
  dokunmatik "akıcılık" hissi. Karşılanan: kod yazımı, `npm run typecheck`/
  `npm run lint`/`npm test` (589/589 yeşil), `npx expo-doctor` (21/21). Bu
  madde bir sonraki gerçek cihaz oturumunda (S10/S11 civarı) kapatılmalı.
- (2026-09-23, MOB/S7b) **İki yeni bağımlılık eklendi: `expo-sharing`
  (`~57.0.21`) ve `expo-file-system` (`~57.0.7`, `npx expo install` ile
  `package.json`'a açıkça eklendi — daha önce yalnızca `expo` paketinin
  transitif bağımlılığı olarak `node_modules`'ta vardı, dolaylı/sürümsüz
  kullanım riskini önlemek için doğrudan bağımlılık yapıldı).
  **Ağa veri gönderiyor mu kontrolü (spec güvenlik gereksinimi 2):
  HAYIR** — ikisi de yalnızca yerel işletim sistemi API'lerine sarmalayıcı
  (paylaşım sayfası açma, yerel dosya okuma/yazma/silme); ağ isteği
  yapmazlar, üçüncü taraf sunucuya bağlanmazlar. `npx expo-doctor` 21/21
  yeşil kaldı. `app.json`'a `expo-sharing` config plugin'i otomatik
  eklendi (iOS paylaşım uzantısı desteği; kullanılmayan `ios`/`android`
  plugin seçenekleri varsayılan/boş bırakıldı, ek yapılandırma yapılmadı).
- (2026-09-23, MOB/S7b) **`expo-file-system` SDK 57'de yeni bir `File`/
  `Directory` sınıf tabanlı API'ye geçti; eski `deleteAsync(uri, opts)`
  tarzı fonksiyonlar artık yalnızca `expo-file-system/legacy` alt-yolunda.**
  `src/card/share.ts` bilerek `expo-file-system/legacy`yi import eder,
  çünkü `captureCardPng`/`shareCard` zaten düz `file://` string URI'leriyle
  çalışıyor (spec'in dondurduğu `shareCard(fileUri: string, ...)` imzası);
  yeni `File` sınıfına sarmaya gerek yok. İleride `expo-file-system`
  kullanan başka bir dosya eklenirse aynı legacy/yeni API ayrımına dikkat
  edilmeli — ikisini karıştırmak (ör. yeni API ile açılan bir `File`
  referansını legacy `deleteAsync`e string URI olarak geçirmeye çalışmak)
  çalışmayabilir.
- (2026-09-23, MOB/S7b) **`expo-sharing`in `shareAsync`'i tek bir dosya +
  `dialogTitle`/`mimeType`/`UTI` seçeneklerini kabul eder; RN'in kendi
  `Share` API'sindeki `{url, message}` ikilisi gibi ayrı bir "mesaj metni"
  YOK.** `dialogTitle` yalnızca Android+web'de paylaşım SEÇİCİSİNİN başlık
  çubuğunda görünür, hedef uygulamaya (WhatsApp vb.) gerçek bir mesaj
  olarak taşınmaz; iOS'ta hiç kullanılmaz. Sonuç: K5 (mağaza bağlantısı)
  metninin PNG'nin YANINDA gerçek bir paylaşım mesajı olarak taşınıp
  taşınmadığı bu ortamda (cihazsız) DOĞRULANAMADI — **plan.md S10/S11
  cihaz kontrol listesine açık madde olarak eklenmeli** (WhatsApp/Story/
  Galeri hedefinde gerçek davranış elle doğrulanmalı). Bağlantı, bu
  belirsizlikten bağımsız olarak kartın kendi gömülü damgasında
  (`CARD_STAMP_TEXT`) zaten PNG'nin içinde basılıdır.
- (2026-09-23, MOB/S7b) **Paylaşılan PNG'nin önbellekten temizlenme
  politikası (spec E10 açık noktası) kararlaştırıldı:** `shareCard`
  (`src/card/share.ts`), `Sharing.shareAsync` TAMAMLANDIĞINDA (kullanıcı
  bir hedef seçse de paylaşım sayfasını iptal etse de — ikisinde de
  promise çözülür) `expo-file-system/legacy`nin `deleteAsync`iyle geçici
  dosyayı siler; silme en iyi çabadır (hata sessizce yutulur, paylaşım
  akışını bozmaz). Bu, gerçek bir cihazda "paylaşım sonrası dosya
  gerçekten siliniyor mu" olarak da ayrıca doğrulanmalı (yalnızca mock'lu
  Jest testiyle kanıtlandı, bkz. `__tests__/card/share.test.ts`).
- (2026-09-23, MOB/S7b) **Unvan otomatik gizleme kararı (spec güvenlik
  gereksinimi 3: "unvan gizlenen kategoriden türetilmez"):** unvan ayrı
  bir aç/kapa satırı olarak MODELLENMEDİ. `title.basedOnCategories`teki
  kategorilerden en az biri o an gizliyse, unvan satırlarla AYNI mekanizma
  ile `???` olarak çizilir (`src/card/title-visibility.ts`
  `shouldHideTitle`). Alternatif ("farklı bir unvan göster") reddedildi:
  böyle bir ikinci seçim mekanizması yok ve olsaydı bile `weekly_card`in
  "dondurulan kart bir daha değişmez" garantisini ve `CardView`'in
  "yalnızca dondurulmuş alanlardan render eder" mimari sınırını ihlal
  ederdi.
- (2026-09-23, MOB/S7b) **`react-test-renderer`ın `TestInstance`
  (`findByProps(...)`in döndürdüğü) nesnesinde `.toJSON()` YOK** (yalnızca
  kök `renderer.toJSON()`da var) — bu S7b test yazımında birkaç kez yanlış
  kullanılıp `TypeError` ile fark edildi, düzeltildi. Bir alt ağacın render
  edilmiş metnini almak için ya `instance.props.children` (testID doğrudan
  metin taşıyan bileşendeyse) ya da `instance.findAllByType(Text).map(n =>
  n.props.children)` (testID bir sarmalayıcıdaysa) kullanılmalı — bkz.
  `__tests__/card/CardView.test.tsx`/`__tests__/components/card-preview-view.test.tsx`
  `textsIn` yardımcı fonksiyonu. Gelecekte benzer bir alt-ağaç metin
  denetimi yazılırken bu tuzak tekrar aranmamalı.
- (2026-09-23, MOB/S7b) **Cihaz/emülatör bu ortamda yok — `plan.md` S7b
  "Bitti kanıtı"nın gerçek-cihaz maddeleri karşılanamadı:** gerçek Android
  paylaşım sayfasının açılması, WhatsApp/galeri hedefinde PNG'nin doğru
  göründüğünün elle kontrolü, paylaşım mesajının (K5 bağlantısı) hedef
  uygulamaya gerçekten taşınıp taşınmadığı (yukarıdaki `dialogTitle` notu),
  paylaşım sonrası geçici dosyanın cihaz diskinden gerçekten silindiğinin
  doğrulanması. Karşılanan: kod yazımı, `npm run typecheck`/`npm run lint`/
  `npm test` (624/624 yeşil, 589 önceki + 35 yeni), `npx expo-doctor`
  (21/21). Bu maddeler bir sonraki gerçek cihaz oturumunda (S10/S11 civarı)
  kapatılmalı.
- (2026-09-23, MOB/S8) **`expo-notifications` (`~57.0.20`, S1'den beri
  `package.json`'da) "ağa veri gönderiyor mu" kontrolü — YALNIZCA YEREL
  planlama kullanılıyor, push yolu kullanılmıyor.** Paket kaynağında
  `fetch(`/`XMLHttpRequest` yalnızca `getExpoPushTokenAsync` ve
  `utils/updateDevicePushTokenAsync` (push token kaydı) içinde; biz bu API'leri
  ve `getDevicePushTokenAsync`/`addPushTokenListener`'ı hiç çağırmıyoruz
  (`__tests__/notify/no-push.test.ts` `src/` içinde yasak adları tarar).
  Doğrudan bağımlılıkları: `@expo/image-utils` (build-time), `abort-controller`,
  `badgin` (web rozeti), `expo-application`, `expo-constants`. `app.json`'a
  `expo-notifications` config plugin'i BİLEREK eklenmedi (iOS'ta `aps-environment`
  push yetkisi getirir; yerel bildirim için gerekmez). **Doğrulanmadı / S10:**
  kütüphanenin Android manifesti `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`
  (yeniden başlatmada planı korur, istenen) ve bir FCM servis bildirimi
  (`ExpoFirebaseMessagingService`) ekliyor; birleşik (merged) manifestte
  firebase-messaging'in ek izin/INTERNET getirip getirmediği gradle çıktısıyla
  S10 "üretim derlemesinde ağ yok" kanıtında incelenmeli (şablon zaten
  `INTERNET` izni koyuyor, bkz. üretilen `AndroidManifest.xml`).
- (2026-09-23, MOB/S8, SEC bulgusu 3) **`expo-notifications` FCM/Firebase tam
  kaydı.** Kütüphanenin Android manifesti şunları ekler: `POST_NOTIFICATIONS`
  (Android 13+ bildirim izni), `RECEIVE_BOOT_COMPLETED` (yeniden başlatmada
  planlı bildirimleri korur) ve bir FCM servisi
  (`ExpoFirebaseMessagingService`); `firebase-messaging` paketin içine gömülü
  (transitif) gelir, biz eklemedik/çağırmıyoruz. Projede `google-services.json`
  olmadığı için FCM token'ı alınmaz/uzak push çalışmaz — **bu sonuç yalnızca
  KOD OKUMASINDAN çıkarımdır, ölçülmüş kanıt değildir.** Kanıt S10'da alınacak:
  release prebuild'in birleşik (merged) AndroidManifest'i + cihazda ağ trafiği
  gözlemi (expo-notifications akışları boyunca FCM/token isteği yok). O zamana
  kadar "üretim derlemesinde ağ yok" iddiası bu paket için doğrulanmış sayılmaz.
- (2026-09-23, MOB/S8) **Android 12+ hatırlatma zamanı yaklaşık olabilir:**
  `SCHEDULE_EXACT_ALARM` izni bilerek eklenmedi (izin/mağaza riski); sistem
  bildirimi tam dakikasında değil, birkaç dakikalık sapmayla (Doze/pil
  yönetimi) teslim edebilir. Beklenen ve kabul edilen davranış; cihazda
  gecikme miktarı S10'da gözlenir.
- (2026-09-23, MOB/S8) **Jest içinde çalışma zamanında `process.env.TZ`
  değişimi etkili DEĞİL** (Node'un kendisinde etkili, ama Jest'in sandbox
  `process.env`i kopya olduğundan yerel saat dilimi değişmiyor; ayrıca
  `jest.setup.ts` TZ'yi Istanbul'a sabitliyor ve `npm test`, `cross-env
  TZ=Europe/Istanbul` ile başlıyor). `TZ=America/New_York npx jest ...` ile
  doğrudan çağırmak da DENENDİ ve etkili olmadı (T testleri yine atlandı).
  `notify-plan.test.ts` içindeki T-02..T-07 (New York/Berlin/DST) bu yüzden
  `it.skip` ile AÇIKÇA `skipped` raporlanır (sahte geçiş değil); gerçek
  doğrulama cihazda ya da testlerin ayrı bir TZ'siz başlatma altyapısıyla
  (ör. jest `globalSetup` ile TZ başlatma) yeniden düzenlenmesiyle yapılmalı.
  "TZ'li CI'da `TZ=America/New_York npm test`" önerisi geçersizdir.
- (2026-09-23, MOB/S8) `syncNotifications` tüm çağrıları modül içi tek
  kuyrukta seri çalıştırır ve DB okumasını kilidin İÇİNDE yapar (eşzamanlı
  açılış + check-in kaydında sonuç her zaman son veriye göre). Sync
  `onboardingDone` ve izin `granted` ile kapılıdır; arka plan sync ASLA izin
  istemez (yalnızca onboarding ve Ayarlar'daki aç anahtarı
  `requestPermissionAndSync` ile ister). `deleteAllData` bildirim iptal
  hatasını yutar, tabloları her durumda siler. **Silme yarışı düzeltmesi
  (SEC):** silme akışı da aynı kuyruğa alınır (`runDeleteExclusive`),
  `replaceAll` öncesi `onboardingDone` yeniden okunur, `skipped` dalı
  `cancelAll` çağırır. Deep link `weekStart` parametresi
  `src/lib/week-param.ts` ile doğrulanmadan `openOrBuildCard`/`saveCard`a
  ulaşamaz (`haftik://` şeması dışarıdan tetiklenebilir).
- (2026-09-23, MOB/S8) **Cihaz/emülatör yok — `plan.md` S8 "Bitti kanıtı"nın
  gerçek-cihaz maddeleri karşılanamadı** (bkz. plan.md S8 "Uygulama notu").
- (2026-09-23, MOB/S9) **Ölçüm sınırları (E1, kabul edilmiş):** `share_initiated`
  paylaşım sayfası AÇILDIĞI anı sayar (kullanıcı iptal etse de) => paylaşım
  **fazla** sayılır; ekran görüntüsü uygulamadan görünmez => **eksik** sayılır;
  örneklem küçük (20-30) => %25 eşiği "güçlü sinyal", kesin doğrulama değil. Bu
  üç sınır rapor metninde de yazar (`src/metrics/report.ts` `REPORT_KNOWN_LIMITS`).
- (2026-09-23, MOB/S9) **Hangi olay ne zaman sayılır (kararlar):** `check_in_saved`
  her başarılı kayıtta (aynı günü düzenlemek de sayılır; D7 bu olaydan değil
  `checkin` tablosundan hesaplanır); `card_unlocked` hafta başına EN FAZLA BİR
  KEZ (`trackEventOnce`, DB'de `hasEvent` ile dedupe; hafta ekranında kart
  ilk kez açılabilir görüldüğünde); `card_opened` kart ekranı her başarılı
  yüklendiğinde (tekrar açış da sayılır, rapor yalnızca `>= 1` kullanır);
  `share_initiated` `shareCard`dan hemen önce; `line_hidden` paylaşım
  başlatılırken dışarı çıkan karttaki gizli satır sayısı kadar kayıt (varsayılan
  gizli uyku/harcama dahil, yani tipik paylaşımda 2), **kategori adı yok**.
  Kancalar en iyi çabadır (`src/metrics/track.ts` try/catch, hata akışı bozmaz).
  `week.tsx`te `card_unlocked` effect'i erken `return`den ÖNCE durmak zorunda
  (hook sırası); `unlocked` orada `getWeekState`ten ikinci kez türetilir.
- (2026-09-23, MOB/S9) **D7 tanımı:** kurulum günü (`first_open_date`) = gün 1,
  gün 7 = +6 takvim günü. Gün 7'de dolu check-in varsa `yes` (gün bitmeden de
  kesin); yoksa bugün gün 7'den sonraysa `no`, değilse `pending` ("henüz
  ölçülemez"). Paylaşım oranı paydası kartı görenler (`card_opened >= 1`);
  "kart açan / kurulum" ve kartı hiç görmeyenler ayrı (`aggregateMetrics`,
  Batuhan'ın elle topladığı raporlar için; uygulamada birleştirme yok).
  `first_open_date`i onboarding'in yazdığı varsayılır; yoksa D7 `unknown`.
- (2026-09-23, MOB/S9) **Rapor içeriği yasak deseni:** rapor metninde emoji,
  takvim tarihi, epoch, kategori adı (İngilizce/Türkçe), kimlik yok (test
  taraması `__tests__/metrics/report.test.ts`). Rapora yeni alan eklerken bu
  taramayı bozma; tarih yerine gün ofseti kullan. Rapor `expo-file-system/legacy`
  ile önbelleğe yazılıp `expo-sharing` ile paylaşılır, sonra silinir; yeni
  bağımlılık yok, ağ çağrısı yok (statik + çalışma zamanı testi).
- (2026-09-23, MOB/S9) **Cihaz/emülatör bu ortamda yok — `plan.md` S9 "Bitti
  kanıtı"nın elle maddeleri karşılanamadı:** raporun Android paylaşım
  sayfasıyla gerçekten çıkması, "Tüm verilerimi sil"in cihazda `metric_event`'i
  boşaltması (yalnızca Jest'te kanıtlandı), olayların gerçek akışta doğru
  anlarda yazılması. Karşılanan: kod, `npm run typecheck`/`npm run lint`/
  `npm test` (749 geçti, 3 atlandı), `npx expo-doctor` (21/21). S10/S11 cihaz
  oturumunda kapatılmalı.

- (2026-09-23, MOB/S9, SEC) **Deep link ile uygunluk atlanamaz (I-1, düzeltildi):**
  `haftik://card/<Pazartesi>` doğrudan kart ekranını açabilir; bu yüzden
  `openOrBuildCard` çağıran katmana güvenmez, kayıtlı kart yoksa
  `getWeekState().unlocked` (dolu gün eşiği + Pazar 20:00) kendisi doğrular,
  uygun değilse `notReady` döner ve ekran `/week`e yönlendirir (kart yazılmaz,
  `card_opened` sayılmaz). `now` verilmezse `today`in gün sonu varsayılır
  (yalnızca eski çağrı imzası testleri için); ekran gerçek `now`ı geçer.
- (2026-09-23, MOB/S9, SEC) **Deneme raporu "anonim" DEĞİLDİR (I-3):** rapor
  içerik/kimlik/tarih taşımaz ama Batuhan raporu bilinen bir tanıdık grupta
  (WhatsApp/mesaj) alırsa göndereni kendi hesabıyla/takma adıyla
  birleştirilebilir. Metinlerde "anonim" yerine "kimlik/içerik içermez"
  yazılır; paylaşım öncesi onay Alert'i bunu kullanıcıya söyler (I-2).
- (2026-09-23, MOB/S9, SEC) **Rapor dosyası temizliği (N-1) ve silme
  transaction'ı (N-2):** `deneme-raporu.txt` uygulama açılışında ve
  `deleteAllData`ta idempotent silinir (`src/metrics/report-file.ts`);
  `cacheDirectory` null ise paylaşmadan hata verilir. `deleteAllData` dört
  DELETE'i tek `exec('BEGIN;...COMMIT;')` ile çalıştırır, hata olursa
  ROLLBACK (`SqlDriver` arayüzü değişmedi).
- (2026-09-23, MOB/S9, SEC) **Bilinçli kabul (kod değişmedi):** (N-3)
  `trackEventOnce` "var mı bak, yoksa yaz" iki adımlıdır, atomik değil;
  tek kullanıcılı, tek iş parçacıklı UI akışında yarış pratikte oluşmaz, en
  kötü ihtimalle `card_unlocked` iki kez sayılır (rapor "yaklaşık" okunur).
  (N-5) `metric_event.at` sütunu yazılıyor ama hiçbir hesap/rapor kullanmıyor
  (rapor tarih taşımaz kuralı gereği); ileride zaman bazlı analiz gerekirse
  ayrı intent ile ele alınır.

- (2026-09-23, K4) **Uygulama adı "Haftik" olarak seçildi** (Batuhan; adaylar
  `docs/uygulama-adi-onerileri*.md`). Uygulandı: `src/config/constants.ts`
  (`APP_DISPLAY_NAME`, kart damgası bundan türer), `app.json` (`name`,
  `slug: haftik`, `scheme: haftik`), deneme raporu başlığı, `CardView.test.tsx`
  damga beklentisi (bilinçli ad değişikliği, Batuhan onaylı).
  **Paket adı KESİNLEŞTİ (2026-09-23, Batuhan): `com.batuhan.haftik`**
  (`app.json` `android.package` + `ios.bundleIdentifier`). Play'de ilk
  yüklemeden sonra DEĞİŞTİRİLEMEZ; başka bir ad istenirse ilk yüklemeden
  (kapalı test dahil) önce yapılmalı. `docs/s10-*`/`docs/s12-*` belgelerindeki
  `com.anonymous.hhkscaffold` geçişleri tarihsel/eski durumdur.
  Mağaza/alan adı/sosyal medya/TÜRKPATENT çakışma kontrolü Batuhan'da (web
  taraması yetersiz).
- (2026-09-23, S12 kararları, Batuhan) (1) Check-in ekranındaki "Uyku" etiketi
  KALIR; Google Health apps beyanı dürüst doldurulur (hareket/uyku beyanı, tıbbi
  iddia yok), mağaza metni sağlık sözcüklerinden uzak durur. (2) Hedef yaş 18+
  (Families Policy dışı). Kapalı denemede paylaşım çağrısı iki dönemli: ilk
  dönem nötr (E1 %25 eşiğine yalnızca bu dönem sayılır), sonraki dönem "kartını
  paylaş" çağrılı. (3) Dağıtım: önce EAS `preview` APK ile arkadaş çevresi
  (Play hesabı ve politika URL'si şartı yok), gerçek cihaz testi ve ilk geri
  bildirimden sonra Play kapalı test (>=12 testçi, 14 gün). Belgelerin (spec/plan/PLAYBOOK başlıkları) "Haftalık Hayat
  Karnesi" çalışma adı tarihsel kayıt olarak bırakıldı.

- (2026-09-23, K8) **İçerik tonu geçişi yapıldı:** `src/domain/content/tr.ts`'te
  12 zayıf/yargılayıcı metin (9 unvan, 2 satır, 1 özet) Batuhan'ın "hepsini sen
  seç, uygula" talimatıyla değiştirildi; ayrıntı `docs/icerik-inceleme.md`
  başındaki güncelleme notunda. Öne çıkan hata: eski "Sakin Uykucu Münzevi"
  (uyku + sosyal ikisi düşük) düşük uykuyu "çok uyuyan" gibi anlatıyordu.
  Kalan 28 metin ilk taslak olarak duruyor; Batuhan'ın kendi gözden geçirmesi
  serbest. Tüm testler yeşil (762 geçti, 3 atlandı).

- (2026-09-23, OPS/S10 cihazsız) **`eas.json` yazıldı, EAS hesabı/build yok
  (Batuhan'ın işi).** Profiller: `preview`
  (APK, internal), `production` (AAB, `autoIncrement`); `appVersionSource:
  remote`; `channel`/updates YOK (E3). `.gitignore`'a `*.keystore`,
  `credentials.json`, `google-services.json`, `GoogleService-Info.plist`,
  `*.apk`, `*.aab` eklendi. Ayrıntı: `docs/s10-ops-raporu.md`.
- (2026-09-23, OPS/S10) **Dev menü üretim paketinde YOK (kanıtlandı):**
  `npx expo export --platform android` (hbc) ve `--no-bytecode` çıktılarında
  `dev-time-menu`/`dev-time-helpers`/`currentWeekSunday2000`/menü metni 0
  geçiş; `--dev` paketinde var (pozitif kontrol). `src/lib/now.ts` üretimde
  `setDevNowOverride=function(t){return}` / `isDevNowOverrideActive=()=>!1`
  stub'ına katlanıyor. `_layout.tsx`'teki `__DEV__` korumalı `require` deseni
  bozulmamalı; `src/dev/*`'i başka yerden statik import etme.
- (2026-09-23, OPS/S10) **Android izinleri:** ana manifest INTERNET,
  SYSTEM_ALERT_WINDOW, VIBRATE (Expo şablonu) taşır; `expo-file-system` ve
  `expo-image` kütüphane manifestleri de INTERNET ekler. `app.json`'a
  `android.blockedPermissions: [READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE]`
  eklendi (prebuild çıktısında `tools:node="remove"` görüldü; yalnızca cache +
  FileProvider kullanıldığı için güvenli). INTERNET'i engellemek Expo
  dokümanına göre mümkün (`blockedPermissions`) ama app.json statik olduğundan
  dev client (Metro) de kırılır; ancak preview APK'da merged manifest
  (`aapt dump permissions`) alındıktan ve release cihazda denendikten sonra,
  profil bazlı (`app.config.js`) yapılmalı. **Merged manifest ve FCM
  (`ExpoFirebaseMessagingService`, firebase-messaging izinleri) doğrulaması hâlâ
  SDK/cihaz ister.** `expo-notifications` `exp.host` push-token kodu üretim
  paketinde ölü kod olarak DURUYOR ama çağrılmıyor; kalıcı kayıt (`isEnabled`)
  yoksa otomatik kayıt istek yapmaz (kaynak okundu). `getExpoPushTokenAsync`
  ASLA çağrılmamalı.
- (2026-09-23, OPS/S10) **`npm audit --omit=dev`: 15 moderate, 0 high/critical**
  (2 kök advisory). `uuid` (xcode/config-plugins, build-time). **`decode-uri-
  component@0.2.2` (`expo-router` -> `query-string@7`) ÜRETİM paketinde**; etkisi
  kötü niyetli `haftik://` bağlantısıyla kendine DoS (veri sızıntısı yok).
  `npm audit fix --force` yapma (Expo paketlerini düşürür); Expo/expo-router
  yaması bekle veya `overrides` dene + test et.
- (2026-09-23, OPS/S10) **Ölü Expo demo kodu üretim paketine giriyor:**
  `src/app/explore.tsx` (expo-router rotası) ve bağlı demo bileşenleri
  bundle'da (`SymbolView`, `explore` dizeleri bulundu). `expo-image`,
  `expo-web-browser`, `expo-symbols` yalnızca bu demo dosyalarında kullanılıyor.
  Batuhan onayıyla silinip bağımlılıklar kaldırılmalı (S6 notundaki silme
  işiyle aynı).
- (2026-09-23, OPS/S10) **Log taraması:** `src/`te yalnızca 2 `console.warn`
  (`notify/sync.ts`, `notify/scheduler.ts`), ikisi sabit metin, veri yok;
  `console.log/error`, analitik/hata SDK'sı yok. Yeni `console.*` eklerken
  veri/hata nesnesi geçirme.

- (2026-09-23, MOB/S10 güvenlik düzeltmeleri) **`eas.json` `development`
  profili KALDIRILDI (N-8):** `developmentClient:true` idi ama `expo-dev-client`
  bağımlılığı yok, profil çalışmazdı. Kalan profiller `preview` (APK) ve
  `production` (AAB). Dev client gerekirse ayrı bir karar (bağımlılık + profil
  birlikte eklenir); yukarıdaki OPS notundaki "development profili" anlatımı
  eskidir.
- (2026-09-23, MOB/S10 SEC I-1) **Geçici kart PNG'si her dalda silinir ve
  süpürülür.** `shareCard`: `isAvailableAsync` kontrolü artık `try/finally`
  içinde. Yeni `src/card/temp-cleanup.ts` `sweepSnapshotFiles()`: `cacheDirectory`
  altında yalnızca `ReactNative-snapshot-image*.png` (react-native-view-shot
  `RNViewShotModule.java` `TEMP_FILE_PREFIX` + `createTempFile(..., ".png",
  cacheDir)`, node_modules'tan doğrulandı) dosyalarını siler; açılışta
  (`_layout.tsx`) ve `deleteAllData` sonunda çağrılır, en iyi çaba. **Sınırlar:**
  (1) iOS'ta view-shot dosyayı `NSTemporaryDirectory()/ReactNative/` altına yazar
  (`cacheDirectory` değil); expo-file-system bu dizini sunmadığı için iOS
  süpürmesi yapılamadı, S11 açık maddesi (paylaşım sonrası `deleteAsync` iOS'ta
  da geçerli). (2) Android view-shot harici cache'i seçebilir; `cacheDirectory`
  yalnızca dahili cache'tir, ama modülün kendi CleanTask'ı iki dizini de
  modül örneği oluşurken ve kapanırken temizler. Gerçek cihaz doğrulaması:
  manual-checklist P-08.
- (2026-09-23, MOB/S10 SEC N-4) **Onboarding kapısı `(main)/_layout.tsx`'e de
  eklendi:** kapı mantığı `src/lib/onboarding-gate.ts` (`useOnboardingGate`)
  içinde paylaşılıyor, `index.tsx` de aynı hook'u kullanır (çift mantık yok).
  Okuma hatası -> "needed" (onboarding'e), akış kilitlenmez. Böylece
  `haftik://today` / `haftik://week` onboarding'i atlayamaz. Checklist K-09.
- (2026-09-23, MOB/S10 SEC N-2) **Ölü Expo şablon kodu silindi (grep ile
  kanıtlandı, src/__tests__/spike/app.json'dan hiçbir referans yok):**
  `external-link.tsx`, `hint-row.tsx`, `web-badge.tsx`, `animated-icon.tsx`,
  `animated-icon.web.tsx`, `animated-icon.module.css`, `ui/collapsible.tsx`,
  kullanılmayan `assets/images/{tabIcons/*, expo-badge*.png, expo-logo.png,
  logo-glow.png, react-logo*.png, tutorial-web.png}`. `src/app/explore.tsx` ve
  `app-tabs*` zaten yoktu. `npm uninstall expo-web-browser expo-symbols
  expo-image` yapıldı (`expo-symbols` expo-router'ın kendi bağımlılığı olarak
  transitif kalır, beklenen). `react-native-reanimated`/`worklets` ve
  `react-dom`/`react-native-web` DOKUNULMADI (expo-router peer'leri; ürün
  kodunda reanimated artık kullanılmıyor, kaldırma ayrı karar). `app.json`
  plugins'inde bu paketler yoktu.
- (2026-09-23, MOB/S10 SEC I-2) **`SYSTEM_ALERT_WINDOW` `android.blockedPermissions`'a
  eklendi.** Taze `expo prebuild --clean` çıktısında ana manifestte
  `tools:node="remove"` görüldü; dev client olmadığından release etkilenmez
  (debug varyantı kendi `src/debug/AndroidManifest.xml`'inde izni ayrıca
  ekler, `expo run:android` debug'ı için sorun değil). `INTERNET` kararı
  hâlâ Batuhan'ın.
- (2026-09-23, S10 SEC) **Batuhan kararı bekleyenler (DEĞİŞTİRİLMEDİ):** I-3
  paket adı, I-5 gizlilik politikası/KVKK, I-6 Health apps beyanı, N-9 uygulama
  kilidi/FLAG_SECURE, INTERNET izni, N-7 placeholder migration sütunu.
- (2026-09-23, S12 hazırlık) `site/` (statik gizlilik + tanıtım) **TASLAK**;
  eslint/tsc/jest kapsamı dışındadır (yalnızca `.html/.css/.md`; oraya `.ts`/
  `.js` eklenirse tsconfig `include`'una girer, eklenmemeli). **Yayın kapısı K10**
  (KVKK/hukuki görüş); yer tutucular ve yayınlama adımları `site/README.md`'de.
  Metinde deneme raporu "anonim" değil, "kimlik/içerik yok, takma adlı olabilir".

## Doğrulama ("done" ne demek)

Bir görev bitmiş sayılmadan önce:

1. Testler gerçekten çalıştırılır ve **çıktısı gösterilir** — "geçti" demek yetmez.
2. Derleme/lint/tip kontrolü temiz olmalı.
3. Davranış değiştiyse gerçek ortamda (Android emülatör/cihaz) elle denenmeli.
4. Kart/bildirim işleri için `plan.md` "Kanıt" bölümündeki ilgili madde karşılanmalı.

**Test başarısız olursa testi değil kodu düzelt.** Test dosyalarını düzeltme
görevi sırasında değiştirmek yasaktır.

## Değişmez kurallar

- **Commit'i Batuhan atar.** Claude dosyayı yazar; Batuhan okur, düzeltir, commit'ler.
- Sır içeren dosyalar (`.env` vb.) commit edilmez — global hook mekanik olarak engeller.
- Yıkıcı git komutları öncesinde açık onay alınır — global hook mekanik olarak engeller.
- Uygulama plandan saparsa `plan.md` aynı commit içinde güncellenir.
- Kapsam genişletme talebi (analitik SDK, OTA, hesap, arkadaş karşılaştırma vb.)
  sessizce eklenmez; "ayrı bir intent.md mi olsun?" diye sorulur.
- Üretim derlemesinde ağ çağrısı yoktur; yeni bağımlılık eklerken "ağa veri
  gönderiyor mu" kontrol edilir (spec güvenlik gereksinimi 2).

## Paralel çalışma (git worktree)

Bağımsız, farklı dosyalara dokunan işler ayrı worktree'lerde yürütülebilir
(bkz. `plan.md` "Paralellik"). Pratik tavan: tek kişi için 2 oturum.

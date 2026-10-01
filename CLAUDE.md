# Haftik

> Genel (projeden bağımsız) çalışma kuralları için: `~/.claude/CLAUDE.md`
> Kaynak belgeler: `intent/2026-09-20-haftalik-hayat-karti.md`, `spec.md`, `plan.md`,
> tek yol haritası `docs/inceleme-2026-09-25/29-yol-haritasi.md`, kararlar `docs/kararlar/`.
> Bu dosya 2026-10-01'de ayıklandı (750 → ~230 satır); hiçbir kayıt silinmedi, konu
> dosyalarına (`docs/muhendislik/`) veya arşive (`docs/muhendislik/tuzak-arsivi.md`)
> taşındı. Taşıma kararı: `docs/inceleme-2026-09-25/28-muhendislik-standartlari-v2.md` §3.

## Ürün özeti

Günlük birkaç saniyelik emoji check-in'inden, her Pazar 20:00'de açılan paylaşılabilir
haftalık **"kart"** üreten Android + iOS uygulaması (çalışma adı "Haftalık Hayat
Karnesi"; kullanıcıya dönük her yüzeyde "karne" değil **"Kart"** denir, bkz.
`docs/kararlar/2026-10-01-taban-oncesi-kararlar-b.md` A15). v1: hesap/sunucu yok, veri
yalnızca cihazda. Yığın: Expo (React Native) + TypeScript + expo-sqlite.

- Uygulama adı: **Haftik** (`src/config/constants.ts` `APP_DISPLAY_NAME`, kart damgası
  bundan türer). Paket: `com.batuhan.haftik` (Android+iOS, tek yönlü kapı —
  Play/App Store'a ilk yüklemeden sonra değiştirilemez).
- iOS **koşullu değil artık**: Apple Developer Program hesabı Batuhan tarafından
  açılıyor, iOS Android ile paralel ilerliyor (`docs/kararlar/2026-10-01-kapsam-ios-
  dagitim.md`).

## Commands

- Kurulum: `npm ci` (lockfile'a sadık; `npm install` yalnızca bağımlılık değiştirirken)
- Çalıştır: `npx expo start` (Android: `npm run android`, iOS: `npm run ios`)
- Doğrulama (tek komut): `npm run verify` (typecheck + lint + test; pre-commit hook da
  bunu çalıştırır, ~8,5 sn)
- Test: `npm test` (TZ `cross-env` ile Europe/Istanbul sabit; `jest.setup.ts` ikinci
  güvence)
- Lint / tip: `npm run lint`, `npm run typecheck`
- Sağlık: `npx expo-doctor` (beklenen: 21/21 yeşil; sapma varsa `npx expo install --fix`)
- Build: `eas build -p android --profile preview` (APK) / `--profile production` (AAB) /
  `-p ios` (TestFlight). Hesap/kimlik bilgisi yalnızca Batuhan.
- Üretim paketi kontrolü: `npx expo export --platform android` sonra çıktıda
  `dev-time-menu` ve `currentWeekSunday2000` için grep: 0 eşleşme beklenir.

## Konvansiyonlar

> Her kural mümkünse onu uygulayan araçla birlikte yazılır. "(mekanik: X)" yoksa kural
> henüz insan hafızasına bağlıdır.

### Dil ve adlandırma
- Tanımlayıcılar İngilizce; yorum, UI metni ve belge Türkçe (UTF-8).
- Dosya adı kebab-case. Tarihsel istisnalar (yeniden adlandırılmaz): `src/card/CardView.tsx`,
  `src/card/CardRevealView.tsx`, `src/domain/buildCard.ts`.
- Import: dizinler arası `@/…`; aynı dizin içi `./…`.
- Hook, sarmaladığı modülün yanında yaşar (`useNow` → `lib/now`, `useOnboardingGate` →
  `lib/onboarding-gate`). `src/hooks/` yalnızca tema ve ekran geometrisi içindir.
- Kullanıcıya dönük her yüzeyde "Kart" (bkz. Ürün özeti); yeni metin/dosya "karne"
  kullanmamalı (mekanik: R-12, `npm run verify` kapsamında — henüz eklenmedi, S16a işi).

### Katmanlar ve bağımlılık yönü
- `src/domain`: saf TS. Yalnızca domain içinden import eder; react, react-native,
  expo-*, `node:*` yok. Saat her zaman `now: Date` parametresiyle gelir.
- `src/data`: yalnızca SQL (`SqlDriver`) + domain tipleri. UI, dosya sistemi ve bildirim
  bilmez (tek istisna, borç: `data/delete-all.ts`).
- `src/card`, `src/notify`, `src/metrics`: özellik modülleri; data + domain + lib kullanır.
- `src/components`: sunumdur; `src/data`'yı doğrudan import etmez (veri prop ile gelir).
- `src/app`: rota ve orkestrasyon.
- `src/dev`: yalnızca `src/app/_layout.tsx`'ten `if (__DEV__) require(...)` ile yüklenir;
  statik import yasak.
- `node:*` modülleri `src/` altında yasak (ayrıntı: `docs/muhendislik/veri-ve-migration.md`).

### Zaman ve tarih
- UI "şimdi"yi yalnızca `useNow()` (render) veya `getNow()` (olay/işleyici) ile alır;
  `new Date()`/`Date.now()` yalnızca `lib/now.ts` ve `data/*-repo.ts` damgalarında.
- Gün kimliği yerel `YYYY-MM-DD`: yalnızca `domain/week.ts`. `toISOString().slice(0,10)`
  yasak.
- Eşikler ve ortalamalar tam kesirle yazılır (`5/3`, `7/3`), literal ondalıkla değil;
  delta karşılaştırması `EPSILON = 1e-9` ile (`domain/delta.ts`).
- Uygunluk kuralının tek kaynağı `domain/week.ts` `getWeekState` (3/4 gün + Pazar 20:00).

### Veri
- Repo fonksiyonları async imzalıdır, sürücü senkrondur.
- Yazma: checkin/setting upsert (`ON CONFLICT`); `weekly_card` dondurulur, tekrar yazma
  no-op.
- Şema değişikliği yalnızca yeni numaralı migration ile (ayrıntı: `docs/muhendislik/
  veri-ve-migration.md`).

### Hata ve yan etki
- Birincil veri yazımı (check-in, kart) hata fırlatır; UI gösterir.
- Yan etkiler (bildirim planı, ölçüm, geçici dosya temizliği) en iyi çaba: hata yutulur,
  akış bozulmaz. Log en fazla sabit metinli `console.warn`; veri/hata nesnesi loglanmaz.
- Çift dokunuş koruması senkron olmalı (`useRef` bayrağı).

### Dış girdi (deep link, bildirim verisi, paylaşım dönüşü)
- Her rota parametresi kullanılmadan önce `lib/week-param.ts` ile doğrulanır.
- Güven sınırındaki fonksiyon çağıranın kontrol ettiğine güvenmez.
- `(main)` altındaki her ekran onboarding kapısının arkasındadır (`lib/onboarding-gate`).

### Silme ve temizlik
- Ayrıntı: `docs/muhendislik/veri-ve-migration.md` "Silme ve temizlik".

### UI düzeni
- Yeni ekran üst dolguyu `useTopInset()` (`src/hooks/use-top-inset.ts`) ile alır; kart
  ekranı `SafeAreaView` kullanır.
- Hedef 411x914dp'de tek ekrana sığma (mekanik: `checkin-single-screen-fit.test.tsx`).
- Kart ölçü bütçesi: `docs/muhendislik/kart-render.md`.
- Renk sabitleri `constants/theme.ts`'te (istisna: kart paleti, dev menüsü).

### Test
- Yerleşim: `__tests__/<src-dizini>/<modül>[.<senaryo>].test.ts(x)`.
- Veri katmanı gerçek SQLite ile test edilir (`setupTestDb`). Platform modülleri
  paylaşılan sahtelerle (`__tests__/helpers/fake-*.ts`) taklit edilir.
- Ortam yüzünden koşamayan test `it.skip` ile görünür atlanır, `// SKIP:` gerekçesiyle.

### Bağımlılık ve eslint-disable
- Ayrıntı: `docs/muhendislik/arac-zinciri.md`.
- Her `eslint-disable` tek satırlıktır (`-next-line`) ve `-- gerekçe` taşır.

### Kanıt raporlama
- Her "çalışıyor" iddiası K seviyesiyle yazılır (`~/.claude/team/ortak-standartlar.md`
  §2). K4/K5 kanıt belgesi başlığında commit SHA'sı yazar.

## Mimari

Tek mobil uygulama; sunucu/hesap/ağ yok (spec "Mimari genel bakış").

```
src/app/            expo-router rotaları: index (kapı), onboarding/*, (main)/{today,week,settings}, card/[weekStart]
src/domain/         saf TS: week, score, delta, titles, copy, buildCard, notify-plan, metrics-calc, content/*
src/data/           SQLite: db (SqlDriver), migrations, *-repo, init, delete-all
src/card/           kart özelliği: CardView/CardRevealView (UI), open-card (akış), capture/share/temp-cleanup (OS)
src/notify/         scheduler (expo-notifications adaptörü), sync (kuyruk), wiring (repo + scheduler bağlama)
src/metrics/        olay kancaları, deneme raporu, rapor dosyası
src/lib/            saf görünüm yardımcıları + now (zaman kaynağı) + onboarding-gate
src/components/     sunum bileşenleri
src/dev/            yalnızca __DEV__ zaman simülasyonu
src/config, src/constants   ad/URL yer tutucuları; tema, emoji ve etiketler
```

Bilinçli sapmalar (ayrıntı `plan.md` "Uygulama notu" ve ilgili `docs/muhendislik/*`
dosyası; hepsi belgelidir):
- `buildCard` 5. isteğe bağlı parametre `prevVariants` (S3; S7a'da wiring tamamlandı).
- `weekly_card`: `title_based_on_categories` + `summary_id` sütunları (S5, round-trip
  için) — `docs/muhendislik/veri-ve-migration.md`.
- `captureCardPng(ref)` imzası (view-shot yalnızca render edilmiş View yakalar) —
  `docs/muhendislik/kart-render.md`.
- Unvan ayrı gizlenmez; dayandığı kategori gizliyse `???` olur (S7b; S21'de paylaşım
  unvanıyla genişleyecek) — `docs/muhendislik/kart-render.md`.
- Tabs (NativeTabs değil); emoji sekme ikonları (S6).
- Kart açılışında K3 akışı: `open-card` → `needsTodayCheckin` → `today?returnToCardWeekStart`.
- Ölçüm olaylarının anları ve D7 tanımı: `plan.md` S9; şema genişletmesi
  `docs/muhendislik/veri-ve-migration.md`.

## Konuya göre oku

| Dokunduğun şey | Oku |
|---|---|
| Node/Expo sürümü, lint/test kurulumu, CI, pre-commit, bağımlılık | `docs/muhendislik/arac-zinciri.md` |
| Bildirim, izin (Android 13+, D2D, INTERNET), Doze/exact alarm | `docs/muhendislik/bildirim-ve-izin.md` |
| Kart bileşenleri, view-shot, font, PNG, C yönü render sözleşmesi | `docs/muhendislik/kart-render.md` |
| Şema/migration, `node:sqlite`, silme akışı, ölçüm tabloları | `docs/muhendislik/veri-ve-migration.md` |
| "Neden böyle yaptık" (artık geçersiz/tek seferlik kararlar) | `docs/muhendislik/tuzak-arsivi.md` |
| Genel yol haritası, hangi dilimde ne var | `docs/inceleme-2026-09-25/29-yol-haritasi.md` |
| Batuhan'ın onayladığı kararların kaydı | `docs/kararlar/` |

## Bilinen tuzaklar

Yalnızca **aktif ve araçla henüz yakalanmayan** tuzaklar; `(tarih, sınıf)` etiketiyle,
≤4 satır. Ayrıntı için yukarıdaki tablodan ilgili konu dosyasına bakın.

- (2026-09-24, S1-mock) Android 13+ hiç sorulmamış bildirim izni `denied+canAskAgain:true`
  döner, `undetermined` dönmez (sınıf 1'in referans örneği). → `bildirim-ve-izin.md`.
- (2026-09-23, S1-mock) `expo-file-system` SDK 57: eski fonksiyonlar yalnızca
  `/legacy`'de; yeni `File`/`Directory` API'siyle karıştırma.
- (2026-09-23, S1-mock) `expo-sharing` `dialogTitle` hedef uygulamaya mesaj olarak
  **taşınmaz** (iOS'ta hiç kullanılmaz).
- (2026-09-23, S2-zaman) Jest'te çalışma zamanında `process.env.TZ` değiştirmek
  etkisizdir; TZ yalnızca süreç başlarken (`cross-env`) belirlenir.
- (2026-09-23, S2-zaman) Android 12+ exact alarm izni yok: hatırlatma birkaç dakika
  gecikebilir (emülatörde ~82 sn). → `bildirim-ve-izin.md`.
- (2026-09-24, S2-zaman) Uygulama açıkken gün/hafta/Pazar 20:00 dönümü: `useNow`
  zamanlayıcı + `AppState`; yeni ekran "şimdi"yi kendisi hesaplamaz.
- (2026-09-24, S3-düzen) Android edge-to-edge: durum çubuğu altındaki dokunuşlar
  sisteme gider → `useTopInset`.
- (2026-09-24, S3-düzen) `numberOfLines` kapsayıcıyı büyütmez; sabit piksel bölümlere
  2. satır sığmaz. → `kart-render.md`.
- (2026-09-24, S3-düzen) Genişliğe bağlı `aspectRatio` yükseklik bütçesini patlatır
  (411x914 kuralı).
- (2026-09-23, S4-dış girdi) `haftik://` şeması dışarıdan tetiklenebilir; `card/` rotası
  `(main)` kapısının dışındadır.
- (2026-09-23, S5-temizlik) view-shot PNG'si iOS'ta `NSTemporaryDirectory` altına
  yazar; süpürme yalnızca Android'de (iOS yola girdi, bu artık aktif açık uç).
- (2026-09-23, S6-eşzamanlı) `trackEventOnce` atomik değildir (kabul edilmiş); bildirim
  senkronu ve silme tek kuyrukta.
- (2026-09-22, S7-araç) Varsayılan `@types/jest`/`react-test-renderer` sürümleri SDK ile
  uyuşmaz; tam sürüm tutulur (artık `package.json`'da, bkz. `arac-zinciri.md`).
- (2026-09-23, S7-araç) Jest varsayılan `testMatch`'i `__tests__` altındaki her `.ts`
  dosyasını suite sayar → `helpers/` hariç.
- (2026-09-23, test) `react-test-renderer`: `Animated` başlatan ağaç unmount
  edilmezse Jest süreci teardown sonrası çöker. → `arac-zinciri.md`.
- (2026-09-23, test) `TestInstance`'ta `.toJSON()` yok; alt ağaç metni için
  `findAllByType(Text)`.
- (2026-09-23, araç) `site/` içine `.ts`/`.js` koyma: tsconfig `**/*.ts` include'u onu
  da derler.
- (2026-09-22, araç) React Compiler lint kuralları (refs, set-state-in-effect) RN
  `Animated` desenlerinde yanlış pozitif verir; önce kodla çöz, disable son çare.

## Açık kararlar ve cihaz maddeleri

**Uygulandı (tarihiyle, kod/test var):** Node ≥24 + ölü kod/web yığını temizliği, CI/
dependabot/pre-commit, CLAUDE.md ayıklaması (hepsi 2026-10-01) · migration atomikliği T7 +
ölçüm şeması `metric_counter` v3 (A10) + N-7 not (A9) + kök ErrorBoundary (Ç29) — hepsi
2026-10-01, S14.

**Batuhan'ın onayladığı, henüz uygulanmamış kararlar** (Karar A 18/18 ve Karar B 14/14
tamam — tam liste ve gerekçe `docs/kararlar/`): açık tema kilidi (A11) · Pazar'da çift
bildirim düzeltmesi (A13) · seviye kelimeleri + içerik paketi (A14/A15) · Kritik-1 eşik
kuralı B (A8) · `now` zorunlu kılma (TB-10, A8 ile birlikte S15'te) · bildirim kanalları
sesli (A12) · INTERNET/izin temizliği + D2D kapatma (A16/A17) · R8 hem preview hem
production'da (A18) · paylaşım unvanı + security-reviewer görüşü (B1, S21'in girdi kapısı)
· seviye/font/ikon/haptik/K3-banner/Kaydet-sonrası/9:16/rakam-kuralı (B2-B10, S19-S23) ·
6 kişilik P0 görsel test oturumu (B12, S19'dan önce) · Maestro kurulumu (B14, çekirdek
kapısında).

**Hâlâ Batuhan'a kalan (henüz karar listesine girmedi):** N-9 uygulama kilidi/
FLAG_SECURE (öneri: yalnız son uygulamalar önizlemesini gizle), K5 mağaza bağlantısının
paylaşım hedefine gerçekten taşındığı (cihaz kanıtı), K10 KVKK/hukuki görüş, politika
URL'si ve yayın yeri, Play hesabı (13 Kasım 2023 öncesi var mı), Apple Developer hesabı,
Karar C (denemeden önce, 10 madde) ve D (ikinci yapı, 10 madde).

**Cihaz/release kanıtı bekleyen (K4/K5):** release merged manifest + ağ gözlemi
(`docs/kararlar/` A16 ile başladı, PCAPdroid ölçümü kaldı), iOS iCloud yedek hariç
tutma + temp PNG süpürme, TZ/DST testleri (şu an `it.skip`), Pazar bildirimi gerçek
teslim gecikmesi. Takip: `docs/manual-checklist.md`, `docs/inceleme-2026-09-25/
29-yol-haritasi.md` §6 (blokaj haritası).

## Doğrulama ("done" ne demek)

Bir görev bitmiş sayılmadan önce:

1. Testler gerçekten çalıştırılır ve **çıktısı gösterilir** — "geçti" demek yetmez.
2. Derleme/lint/tip kontrolü temiz olmalı (`npm run verify`).
3. Davranış değiştiyse gerçek ortamda (Android emülatör/cihaz) elle denenmeli.
4. Kart/bildirim işleri için `plan.md` "Kanıt" bölümündeki ilgili madde karşılanmalı.

**Test başarısız olursa testi değil kodu düzelt.** Test dosyalarını düzeltme görevi
sırasında değiştirmek yasaktır.

## Değişmez kurallar

- **Commit'i Batuhan atar.** Claude dosyayı yazar; Batuhan okur, düzeltir, commit'ler.
- Sır içeren dosyalar (`.env` vb.) commit edilmez — global hook mekanik olarak engeller.
- Yıkıcı git komutları öncesinde açık onay alınır — global hook mekanik olarak engeller.
- Uygulama plandan saparsa `plan.md` aynı commit içinde güncellenir.
- Kapsam genişletme talebi sessizce eklenmez; "ayrı bir intent.md mi olsun?" diye sorulur.
- Üretim derlemesinde ağ çağrısı yoktur; yeni bağımlılık eklerken "ağa veri gönderiyor
  mu" kontrol edilir (spec güvenlik gereksinimi 2).

## Paralel çalışma (git worktree)

Bağımsız, farklı dosyalara dokunan işler ayrı worktree'lerde yürütülebilir (bkz.
`plan.md` "Paralellik"). Pratik tavan: tek kişi için 2 oturum.

# Haftik

> Genel (projeden bağımsız) çalışma kuralları için: `~/.claude/CLAUDE.md`
> Kaynak belgeler: `intent/2026-09-20-haftalik-hayat-karti.md`, `spec.md`, `plan.md`,
> tek yol haritası `docs/inceleme-2026-09-25/29-yol-haritasi.md`, kararlar `docs/kararlar/`.
> **Açık işler (canlı liste): `docs/acik-isler.md`. Dilim günlüğü: `docs/muhendislik/
> uygulama-gunlugu.md`.** Bu dosya iki kez ayıklandı (2026-10-01: 750 → 249; 2026-10-02:
> 290 → ~200); hiçbir kayıt silinmedi, ayrıntı `docs/muhendislik/`, geçersizleşenler
> `tuzak-arsivi.md`'de. Kural: **CLAUDE.md yalnızca aktif kuralı taşır; "ne zaman ne
> yapıldı" günlüğe, "ne açık" `acik-isler.md`'ye gider.** (Karar: `28-muhendislik-
> standartlari-v2.md` §3.)

## Ürün özeti

Günlük birkaç saniyelik emoji check-in'inden, her Pazar 20:00'de açılan paylaşılabilir
haftalık **"kart"** üreten Android + iOS uygulaması (çalışma adı "Haftalık Hayat
Karnesi"; kullanıcıya dönük her yüzeyde "karne" değil **"Kart"** denir, bkz.
`docs/kararlar/2026-10-01-taban-oncesi-kararlar-b.md` A15). v1: hesap/sunucu yok, veri
yalnızca cihazda. Yığın: Expo (React Native) + TypeScript + expo-sqlite.

- Uygulama adı: **Haftik** (`src/config/constants.ts` `APP_DISPLAY_NAME`, kart damgası
  bundan türer). Paket: `com.batuhan.haftik` (Android+iOS, tek yönlü kapı —
  Play/App Store'a ilk yüklemeden sonra değiştirilemez).
- iOS Android ile paralel ilerliyor (`docs/kararlar/2026-10-01-kapsam-ios-dagitim.md`).

## Commands

- Kurulum: `npm ci` (lockfile'a sadık; `npm install` yalnızca bağımlılık değiştirirken)
- Çalıştır: `npx expo start` (Android: `npm run android`, iOS: `npm run ios`)
- Doğrulama (tek komut): `npm run verify` (typecheck + lint + test; pre-commit hook da
  bunu çalıştırır). Ayrı: `npm test` (TZ `cross-env` ile Europe/Istanbul sabit),
  `npm run lint`, `npm run typecheck`, `npx expo-doctor` (sapma: `npx expo install --fix`).
- Build (bulut): `eas build -p android --profile preview` (APK) / `--profile production`
  (AAB) / `-p ios` (TestFlight). Hesap/kimlik bilgisi yalnızca Batuhan.
- Build (yerel release APK, ~2 dk, EAS kotası harcamaz): `npx expo prebuild --platform
  android --no-install`, sonra `android/` içinde `ANDROID_HOME=… ./gradlew assembleRelease
  -PreactNativeArchitectures=x86_64`; izin kontrolü `node scripts/check-apk-permissions.js
  <apk> <aapt2>`. Ayrıntı ve tuzaklar: `docs/muhendislik/arac-zinciri.md`.
- Üretim paketi kontrolü: `npx expo export --platform android` sonra çıktıda
  `dev-time-menu` ve `currentWeekSunday2000` için grep: 0 eşleşme beklenir.

## Konvansiyonlar

> Her kural mümkünse onu uygulayan araçla birlikte yazılır. "(mekanik: X)" yoksa kural
> henüz insan hafızasına bağlıdır.

**Dil ve adlandırma:** tanımlayıcılar İngilizce; yorum, UI metni ve belge Türkçe (UTF-8).
Dosya adı kebab-case (tarihsel istisnalar: `src/card/CardView.tsx`, `CardRevealView.tsx`,
`src/domain/buildCard.ts`). Dizinler arası `@/…`, aynı dizin `./…`. Hook sarmaladığı modülün
yanında yaşar (`useNow` → `lib/now`, `useNotificationRouting` → `notify/notification-routing`);
`src/hooks/` yalnızca tema ve ekran geometrisi. Kullanıcıya dönük her yüzeyde "Kart", yeni
metin/dosya "karne" kullanmaz (mekanik: R-12 — henüz eklenmedi, S16a işi).

**Katmanlar** (yön: app → components/özellik modülleri → lib → data → domain):
- `src/domain`: saf TS; react/expo/`node:*` yok; saat `now: Date` parametresiyle gelir.
- `src/data`: yalnızca SQL (`SqlDriver`) + domain tipleri (tek istisna, borç: `delete-all.ts`
  dosya süpürmesini çağırır). `node:*` `src/` altında yasak (`veri-ve-migration.md`).
- `src/card`, `src/notify`, `src/metrics`: özellik modülleri. `src/components`: sunum, `data`'yı
  import etmez. `src/app`: rota ve orkestrasyon. `src/dev`: yalnızca `_layout.tsx`'ten
  `if (__DEV__) require(...)`; statik import yasak.
- `expo-notifications` yalnızca `notify/scheduler.ts`'te (tembel `require`); domain/data import
  edemez (mekanik: `__tests__/notify/no-push.test.ts`).

**Zaman ve tarih:** UI "şimdi"yi yalnızca `useNow()` (render) / `getNow()` (olay) ile alır;
`new Date()`/`Date.now()` yalnızca `lib/now.ts` ve `data/*-repo.ts` damgalarında. Gün kimliği
yerel `YYYY-MM-DD`, yalnızca `domain/week.ts` (`toISOString().slice(0,10)` yasak). Eşikler tam
kesirle (`5/3`, `7/3`), delta `EPSILON = 1e-9`. Uygunluğun tek kaynağı `getWeekState` (3/4 gün +
Pazar 20:00); eşik check-in geçmişinden türer, kartın varlığından DEĞİL (monotonluk, S15).

**Veri:** repo fonksiyonları async, sürücü senkron. checkin/setting upsert (`ON CONFLICT`);
`weekly_card` dondurulur, tekrar yazma no-op. Şema değişikliği yalnızca yeni numaralı
migration ile; yeni kalıcı tablo `delete-all.ts` listesine de girer (mekanik:
`delete-all.schema-contract.test.ts`). Ayrıntı: `veri-ve-migration.md`.

**Hata ve yan etki:** birincil yazım (check-in, kart) hata fırlatır, UI Alert gösterir; ekran
verisi okuma hatası `LoadErrorView` + "Tekrar dene" (sonsuz yükleme yok). Yan etkiler (bildirim
planı, ölçüm, dosya temizliği) en iyi çaba: hata yutulur. Log en fazla sabit metinli
`console.warn`, veri/hata nesnesi loglanmaz. Çift dokunuş koruması senkron (`useRef` bayrağı).

**Dış girdi:** her rota parametresi `lib/week-param.ts` ile doğrulanır; bildirim `data` yükü de
dış girdidir (yalnızca `resolveNotificationRoute` yorumlar); güven sınırındaki fonksiyon
çağıranın kontrolüne güvenmez; `(main)` altındaki her ekran onboarding kapısının arkasındadır.

**Silme ve temizlik:** paylaşım dosyaları yalnızca `cache/haftik-share/` altında, kimliksiz sabit
adla; paylaşım sonrası SİLİNMEZ, yaşa göre süpürülür (`src/card/share-dir.ts`). Ayrıntı:
`veri-ve-migration.md`, `kart-render.md`.

**UI düzeni:** yeni ekran üst dolguyu `useTopInset()` ile alır (kart ekranı `SafeAreaView`);
411x914dp'de tek ekrana sığma (mekanik: `checkin-single-screen-fit.test.tsx`); dokunma hedefi
>= 48 dp; animasyon "animasyonları kaldır" ayarına uyar. Renkler `constants/theme.ts`'te
(istisna: kart paleti, dev menüsü); uygulama açık temaya kilitli (A11). Kart ölçü bütçesi:
`kart-render.md`.

**Test:** `__tests__/<src-dizini>/<modül>[.<senaryo>].test.ts(x)`. Veri katmanı gerçek SQLite ile
(`setupTestDb`), platform modülleri paylaşılan sahtelerle (`__tests__/helpers/fake-*.ts`).
Koşamayan test `it.skip` + `// SKIP:` gerekçesiyle. Onaylı davranış değişikliği eski bir testi
kırarsa o test yeniden yazılır, gerekçe yorumda (sessiz gevşetme yok).

**Bağımlılık ve lint:** yeni bağımlılıkta "ağa veri gönderiyor mu" kontrolü yapılır ve belgeye
yazılır (`arac-zinciri.md`). Her `eslint-disable` tek satırlık (`-next-line`) ve gerekçeli.
Config plugin'leri `plugins/` altında; izin politikasının tek kaynağı
`plugins/permission-policy.js` (mekanik: `__tests__/plugins/`).

**Kanıt raporlama:** her "çalışıyor" iddiası K seviyesiyle yazılır (`~/.claude/team/
ortak-standartlar.md` §2); K4/K5 kanıt belgesi başlığında commit SHA'sı yazar.

## Mimari

Tek mobil uygulama; sunucu/hesap/ağ yok (spec "Mimari genel bakış"). Bilinçli sapmalar listesi:
`veri-ve-migration.md` "Mimari: bilinçli sapmalar".

```
src/app/            expo-router rotaları: index (kapı), onboarding/*, (main)/{today,week,settings}, card/[weekStart]
src/domain/         saf TS: week, score, delta, titles, copy, buildCard, notify-plan, metrics-calc, report-v2, content/*
src/data/           SQLite: db (SqlDriver), migrations, *-repo, init, delete-all
src/card/           kart: CardView/CardRevealView (UI), open-card (akış), capture/share/share-dir/temp-cleanup (OS)
src/notify/         scheduler (expo-notifications adaptörü), sync (kuyruk), wiring, notification-routing
src/metrics/        olay kancaları, deneme raporu (v2 + önizleme), rapor dosyası
src/lib/            saf görünüm yardımcıları + now + onboarding-gate + build-info
src/components/     sunum bileşenleri;  src/dev/ yalnızca __DEV__ zaman simülasyonu
src/config, src/constants   ad/URL yer tutucuları; tema, emoji ve etiketler
plugins/ + scripts/ config plugin'leri ve APK izin kontrolü; app.json + app.config.js (commit
gömme) + react-native.config.js (reanimated native dışlama) + eas.json
```

## Konuya göre oku

| Dokunduğun şey | Oku |
|---|---|
| Node/Expo sürümü, lint/test kurulumu, CI, bağımlılık, release/R8 derlemesi, emülatör/adb | `docs/muhendislik/arac-zinciri.md` |
| Bildirim, izin (Android 13+, D2D, INTERNET), Doze, kanal, tıklama yönlendirmesi, izin plugin'i | `docs/muhendislik/bildirim-ve-izin.md` |
| Kart bileşenleri, view-shot, font, PNG, paylaşım dosyası, C yönü render sözleşmesi | `docs/muhendislik/kart-render.md` |
| Şema/migration, `node:sqlite`, silme, ölçüm tabloları, deneme raporu v2, sürüm satırı | `docs/muhendislik/veri-ve-migration.md` |
| Ne açık, ne bekliyor, hangi cihaz kanıtı eksik | `docs/acik-isler.md` |
| Hangi dilimde ne yapıldı, K kanıtları (günlük) | `docs/muhendislik/uygulama-gunlugu.md` |
| "Neden böyle yaptık" (artık geçersiz kararlar) | `docs/muhendislik/tuzak-arsivi.md` |
| Yol haritası; onaylı kararlar | `docs/inceleme-2026-09-25/29-yol-haritasi.md`; `docs/kararlar/` |

## Bilinen tuzaklar

Yalnızca **aktif ve araçla henüz yakalanmayan** tuzaklar; tek satır `(tarih, sınıf) kural →
ayrıntı`. Geçersizleşenler `tuzak-arsivi.md`'ye taşınır.

- (2026-09-24, mock) Android 13+ hiç sorulmamış bildirim izni `denied+canAskAgain:true` döner;
  izin diyaloğu geri tuşuyla kapatılırsa `canAskAgain` yanlışlıkla `false` olur. → `bildirim-ve-izin.md`
- (2026-09-23, mock) `expo-file-system` SDK 57: eski fonksiyonlar yalnızca `/legacy`'de; yeni
  `File`/`Directory` API'siyle karıştırma. `expo-sharing` `dialogTitle` hedefe mesaj olarak taşınmaz.
- (2026-09-23, zaman) Jest'te çalışma zamanında `process.env.TZ` değiştirmek etkisiz (yalnızca
  `cross-env`). Android 12+ exact alarm izni yok: hatırlatma gecikebilir (~82 sn). → `bildirim-ve-izin.md`
- (2026-09-24, zaman) Gün/hafta/Pazar 20:00 dönümü: `useNow` zamanlayıcı + `AppState`; ekran "şimdi"yi
  kendisi hesaplamaz. `useFocusEffect`/`useCallback` bağımlılığına `Date` koyma (sonsuz render).
- (2026-09-24, düzen) Edge-to-edge: durum çubuğu altı sisteme gider → `useTopInset`. `numberOfLines`
  kapsayıcıyı büyütmez; genişliğe bağlı `aspectRatio` yükseklik bütçesini patlatır. → `kart-render.md`
- (2026-09-23, dış girdi) `haftik://` şeması dışarıdan tetiklenebilir; `card/` rotası `(main)` kapısının
  dışındadır. `trackEventOnce` atomik değil (kabul edilmiş); bildirim senkronu ve silme tek kuyrukta.
- (2026-09-23, test) `Animated` başlatan ağaç unmount edilmezse Jest teardown sonrası çöker; `TestInstance`'ta
  `.toJSON()` yok; `findAllByProps` bir `Pressable`'ın 3 katmanını eşleştirir (tekil `findByProps`).
  Jest `testMatch` `__tests__`'daki her `.ts`yi suite sayar → `helpers/` hariç. → `arac-zinciri.md`
- (2026-09-22, araç) React Compiler lint kuralları (refs, set-state-in-effect) `Animated` desenlerinde yanlış
  pozitif verir; önce kodla çöz. Ref'e render SIRASINDA yazmak da yasak. `site/` içine `.ts`/`.js` koyma.
- (2026-10-02, araç) Emülatörü `android/` içinden başlatma (dizini kilitler, `prebuild` `EBUSY`); git-bash+adb
  yol dönüşümü (`MSYS_NO_PATHCONV=1`, `C:/…`) ve `node -e`'de backtick; `run-as` release'te yok. → `arac-zinciri.md`
- (2026-10-02, araç) `react-native-reanimated`ı `package.json`dan çıkarmak native derlemeyi kaldırmaz
  (expo-router peer'i) → `react-native.config.js`. `android/` her prebuild'de sıfırlanır, elle değiştirilmez.

## Doğrulama ("done" ne demek)

Bir görev bitmiş sayılmadan önce:

1. Testler gerçekten çalıştırılır ve **çıktısı gösterilir** — "geçti" demek yetmez.
2. Derleme/lint/tip kontrolü temiz olmalı (`npm run verify`).
3. Davranış değiştiyse gerçek ortamda (Android emülatör/cihaz) elle denenmeli.
4. Kart/bildirim işleri için `plan.md` "Kanıt" bölümündeki ilgili madde karşılanmalı.

**Test başarısız olursa testi değil kodu düzelt.** Test dosyalarını düzeltme görevi
sırasında değiştirmek yasaktır (onaylı bir davranış değişikliğinin doğrudan sonucu olan,
yorumla işaretlenmiş güncellemeler hariç).

## Değişmez kurallar

- **Commit'i Batuhan atar.** Claude dosyayı yazar; Batuhan okur, düzeltir, commit'ler.
- Sır içeren dosyalar (`.env` vb.) commit edilmez; yıkıcı git komutları öncesinde açık onay
  alınır — ikisini de global hook mekanik olarak engeller.
- Uygulama plandan saparsa `plan.md` aynı commit içinde güncellenir.
- Kapsam genişletme talebi sessizce eklenmez; "ayrı bir intent.md mi olsun?" diye sorulur.
- Üretim derlemesinde ağ çağrısı yoktur (release'te `INTERNET` izni yok, mekanik:
  `scripts/check-apk-permissions.js`); yeni bağımlılık eklerken "ağa veri gönderiyor mu"
  kontrol edilir (spec güvenlik gereksinimi 2).
- Bağımsız, farklı dosyalara dokunan işler ayrı git worktree'lerde yürütülebilir (`plan.md`
  "Paralellik"); pratik tavan tek kişi için 2 oturum.

# 08 — Mühendislik tutarlılığı incelemesi (tech-lead, 2026-09-25)

## Özet (8 satır)

1. **CI hiç çalışmadı** (`.git/config`'te remote yok); çalışsaydı Node 20 yüzünden `node:sqlite` kullanan tüm veri testleri kırılırdı. İlk iş `.nvmrc` + `engines` + CI Node sürümü; remote açmak Batuhan'ın kararı.
2. **Emülatör kanıtları hiçbir commit'e bağlı değil:** 47 dosyalık (32 değişmiş + 15 izlenmeyen) commit'lenmemiş çalışma ağacı var, testler de git'i olmayan bir kopyada (`C:\hhk\haftik`) koşuldu. Önce commit, sonra her kanıt belgesine SHA.
3. Katman sınırları büyük ölçüde temiz (domain saf, `node:sqlite` src'ye sızmamış). Ama bu sınırlar bugün yalnızca yorumlarla ve "insan hatırlar" düzeyinde korunuyor; ilk erozyon da başladı (`data/delete-all.ts` → `card/`, `metrics/`). Öneri: sınır meta-testi.
4. `CLAUDE.md` "Bilinen tuzaklar" 78 kayıt ve yaklaşık 670 satır. İçinde 5 ayrı tür iç içe geçmiş (tuzak, konvansiyon, mimari karar, açık madde, tarihçe); 13 çelişki ve 17 eskimiş kayıt var. Aşağıdaki taslakla yaklaşık 22 aktif tuzağa iner, geri kalanı Konvansiyonlar ve Mimari'ye taşınır ya da arşive gider.
5. Hata sınıflarının 7'sinde de hâlâ açık örnek var. En pahalıları: (1) mock ≠ platform (elle yazılmış, gevşek `ExpoNotificationsLike` tipi; platform modülleri 16 ayrı yerde satır içinde mock'lanıyor), (2) zaman (TZ testleri yapısal olarak yanlış kurulmuş, ortam düzelse bile geçemezler).
6. Teknik borç: 23 kalem. "Şimdi öde" kararı yalnızca ilk preview APK'dan önce ucuz olanlara verildi: `reset-project.js`, spike, reanimated/worklets, Expo yama sürümleri, blok `eslint-disable`, Dependabot–Expo çakışması.
7. Kalıcı yol çözümü: projeyi ASCII bir yola (`C:\dev\haftik`) **taşımak** ve tek kopyaya inmek. Bugünkü `robocopy /MIR` düzeni, kopyada yapılan düzenlemeleri sessizce siliyor ve eski kod üzerinde K4 kanıtı üretme riski taşıyor.
8. Kanıt seviyesi: bu incelemenin tamamı **K1** (kod, belge ve `node_modules` kaynak okuma, grep). Bu oturumda komut çalıştırma aracı yoktu; `npm test` vb. koşulmadı.

---

## 0. Kapsam, yöntem, sınırlar

- **Okunanlar:** `CLAUDE.md` (proje + global), `spec.md`, `plan.md`, `REVIEW.md`, `evals/checklist.md`, `.claude/agents/verifier.md`, `package.json`, `package-lock.json` (seçili), `tsconfig.json`, `eslint.config.js`, `app.json`, `eas.json`, `jest.setup.ts`, `.github/*`, `.gitignore`, `.git/config`, `src/**` (tam dosya ağacı, import grafiği grep ile), `__tests__/**` (ağaç + seçili dosyalar), `spike/**`, `scripts/reset-project.js`, `docs/emulator-*.md`, `plan.md` S10–S12 notları, `~/.claude/team/ortak-standartlar.md`, Claude SDLC deposundaki spec/plan kopyaları, `C:\hhk\haftik` (varlık kontrolü), `node_modules/expo-router/package.json` ve `build/`, `node_modules/react-native/index.js`.
- **Çalıştırılmayanlar:** `npm test`, `npm run lint`, `npm run typecheck`, `npx expo-doctor`, `git log`. Test sayısı ve lint durumuyla ilgili bütün iddialar belgelerden alınmıştır, yani **K0**.
- **Kurallar:** Onaylı spec yeniden açılmadı. Mimari kararlar yeniden tartışılmadı; yalnızca tutarlılıklarına bakıldı. Bu dosya dışında hiçbir dosya değiştirilmedi.

---

## 1. `CLAUDE.md` ayıklama önerisi

### 1.1 Tanı

`## Bilinen tuzaklar` (satır 42–712) tek bir kronolojik günlük gibi büyümüş. Kayıtların türe göre dağılımı:

| Tür | Adet (yaklaşık) | Olması gereken yer |
|---|---|---|
| Gerçek, hâlâ geçerli tuzak ("bunu yaparsan kırılır") | 22 | Bilinen tuzaklar |
| Kural / konvansiyon ("hep böyle yaparız") | 20 | Konvansiyonlar |
| Mimari karar / bilinçli spec sapması | 10 | Mimari (kısa) + `plan.md` (ayrıntı zaten orada) |
| Açık madde / Batuhan kararı bekleyen | 8 | `## Açık kararlar ve cihaz maddeleri` (yeni, kısa) |
| Tarihçe / eskimiş ("cihaz yok", "silinemedi", "S6 notu") | 17 | `docs/tuzak-arsivi.md` (yeni; silinmez, "eski" etiketiyle taşınır, ortak standart 14) |

Asıl zarar yalnızca uzunluk değil, çelişki. Taze bağlamla gelen bir ajan (verifier) 670 satırı okuyup çelişen iki kayıttan yanlış olanı seçebilir. Bunun somut örnekleri aşağıdaki 1.3'te.

### 1.2 Önerilen yeni yapı

```
## Ürün özeti            (+ 2 satır: ad Haftik, paket com.batuhan.haftik, tek yönlü kapı)
## Commands              (güncel: npm ci, Node sürümü, expo-doctor, eas build, prod paket kontrolü, emülatör yolu)
## Konvansiyonlar        (1.5'teki taslak, ~70 satır; her kural mümkünse onu uygulayan test/araç adıyla)
## Mimari                (1.6'daki taslak, ~35 satır; ayrıntı plan.md'ye işaret eder)
## Bilinen tuzaklar      (yalnızca AKTİF, ~22 kayıt, kayıt başına en fazla 4 satır; tarih + sınıf etiketi)
## Açık kararlar ve cihaz maddeleri   (≤ 12 satır; ayrıntı plan.md / docs/manual-checklist.md)
## Doğrulama / Değişmez kurallar / Paralel çalışma   (aynen)
```

Arşiv: `docs/tuzak-arsivi.md`. Taşınan her kaydın başına `[ESKİ 2026-09-25: neden]` eklenir. Metin değiştirilmez, yalnızca etiketlenir.

**Tek kural (bu tartışma bir daha açılmasın diye):** Yeni bir kayıt eklerken önce sorulur: "Bu bir tuzak mı, kural mı, karar mı, açık madde mi?" Tuzak kaydı en fazla 4 satırdır ve varsa onu yakalayan testin adını taşır. Uzun gerekçe ilgili kaynak dosyanın başlığına ya da `plan.md` "Uygulama notu"na yazılır.

**Yanlış çıkarsa maliyet ve geri dönüş:** Ayıklama sırasında gerçekten geçerli bir tuzak yanlışlıkla arşive gidebilir. Arşiv silinmediği ve grep ile aranabildiği için maliyeti bir arama kadardır. Geri dönüş: kaydı arşivden geri kopyalamak.

### 1.3 Çelişkiler ve bayat iddialar (kanıtlı)

| # | Çelişki | Kanıt (K1) | Doğrusu |
|---|---|---|---|
| Ç-1 | S6 notu "demo iskeleti silinemedi, `/explore` erişilebilir"; OPS/S10 notu "ölü demo kodu üretim paketinde". Ama SEC N-2 notu "silindi" diyor. | `CLAUDE.md:215`, `:569` ↔ `:605`; `src/app/explore.tsx` yok (Glob) | Silindi. 215 ve 569 arşive. |
| Ç-2 | S6'daki "unlocked iken Alert" notu hâlâ duruyor. | `:244` ↔ `:255` | 244 arşive. 255'in yalnızca mimari özeti kalır. |
| Ç-3 | "Batuhan kararı bekleyenler: I-3 paket adı" ama K4 notu "Paket adı KESİNLEŞTİ". | `:623` ↔ `:505`; `app.json:12,28` | I-3 kapandı. Kalan açıklar: I-5, I-6, N-9, INTERNET, N-7. |
| Ç-4 | Birçok kayıt "expo-doctor 21/21 yeşil" diyor, sonraki kayıt "bugün 20/21". | `:66`, `:120`, `:264`, `:309` ↔ `:683` | Doğrusu 20/21. Sayı tuzak kaydında tutulmaz, Commands'ta "beklenen: tamamı yeşil" yazar. |
| Ç-5 | "`@types/jest` ve `react-test-renderer` birebir **sabitlendi**" deniyor, ama `package.json` şapka (`^`) kullanıyor. Kilit dosyası sabitliyor, `package.json` sabitlemiyor. Dependabot ya da `npm install` bu paketleri sessizce yükseltebilir. | `:66` ↔ `package.json:31,38` (`^29.5.14`, `^19.2.3`); `package-lock.json:3555,13267` | Ya tam sürüm yazılmalı (`"29.5.14"`, `"19.2.3"`) ya da not "lockfile ile sabit" olarak düzeltilmeli. Öneri: tam sürüm (TB-4 ile aynı commit). |
| Ç-6 | "`react-native-reanimated`/`worklets` ve `react-dom`/`react-native-web` expo-router peer'leri, dokunulmadı" deniyor. Oysa dördü de expo-router'da **isteğe bağlı** (optional) peer. Üstelik expo-router çalışma zamanında reanimated import etmiyor, yalnızca kendi test mock'larında geçiyor. | `:605` ↔ `node_modules/expo-router/package.json:99-117` (`optional: true`); `expo-router/build` içinde reanimated yalnızca `testing-library/mocks.js`'te | Kaldırılabilirler (bkz. TB-2, TB-3). Kanıt K1 düzeyinde; kaldırıldıktan sonra K4 smoke testi gerekir. |
| Ç-7 | Commands bölümü "`jest.setup.ts` aynı değeri ikinci güvence olarak ayarlar" diyor. S8 notu ise "Jest'te çalışma zamanında `process.env.TZ` değişimi etkili değil" diyor. S8 gözlemi doğruysa `jest.setup.ts:6` hiçbir şey yapmıyor ve "ikinci güvence" sahte bir güvence. | `CLAUDE.md:22` ↔ `:416`; `jest.setup.ts:6` | Asıl güvence `cross-env`. `jest.setup.ts` ayar yapmak yerine **doğrulama** yapmalı: TZ Istanbul değilse ve bilinçli bir TZ koşusu değilse hızlıca hata versin (TB-5). |
| Ç-8 | `node:sqlite` sızıntı kuralı "ASLA" diye yazılmış, `no-push.test.ts` başlığı da "node:sqlite src/ içine sızmamalı" diyor. Ama testin kendisi `node:sqlite`'ı **kontrol etmiyor**; yasak listesinde yalnızca push API adları var. | `:125`; `__tests__/notify/no-push.test.ts:3` ↔ `:19-24` | Kural bugün mekanik değil. Tek koruyan, verifier'ın elle yaptığı grep (`verifier.md:35`). Bkz. M-1 sınır testi. |
| Ç-9 | Commands "Build: henüz tanımlanmadı" diyor; `eas.json` ise S10'dan beri var. | `CLAUDE.md:28` ↔ `eas.json` | Commands güncellenmeli (1.4). |
| Ç-10 | CI yorumu "S1 tamamlanana kadar adım başarısız olabilir" diyor ve Node 20 kullanıyor. Veri testleri `node:sqlite` istiyor: Node 22.5'te bayrak arkasında, bayraksız kullanım 22.13/23.4 ve sonrasında (bu sürüm bilgisi K1, belleğe dayalı, doğrulanmalı). | `.github/workflows/ci.yml:5-7,26` ↔ `__tests__/helpers/node-sqlite-driver.ts:24` | CI bugünkü haliyle kırmızı olurdu. Bkz. §5.3. |
| Ç-11 | spec ve plan başlıkları "Bu dosya o onaylı halin bu depoya kopyasıdır" diyor. Oysa proje spec'inde S2, S3, S5 ve S8 netleştirme bölümleri var, Claude SDLC kopyasında yok. Plan'daki "Uygulama notu" sayısı: burada 12+, SDLC'de 0. | `spec.md:3,114,194,215,225` ↔ `Claude SDLC/spec-haftalik-hayat-karti.md` başlıkları | İki kopya ayrışmış. Kanonik kaynak ilan edilmeli (§5.2). |
| Ç-12 | plan S12 OPS notu "`ios.bundleIdentifier` yok, `site/` yok" diyor, ikisi de artık var. | `plan.md:270` ↔ `app.json:12`, `site/` | Nota "[güncel değil: 2026-09-23 sonrası çözüldü]" etiketi eklenmeli. |
| Ç-13 | Spike dosyası "S8 sonunda silinir ya da arşive kaldırılır" diyor, ama hâlâ duruyor ve testleri toplam test sayısına dahil. | `spike/notifications/scheduleSpike.ts:7-8`; `__tests__/spike/*` | TB-7. |

### 1.4 Kayıt kayıt karar tablosu (`CLAUDE.md` satır numarasıyla)

Kısaltmalar: **K** = Konvansiyonlar'a taşı · **T** = Bilinen tuzaklar'da kalsın (kısaltılarak) · **M** = Mimari'ye taşı · **A** = Açık kararlar/maddeler · **B** = Teknik borç (§4) · **E** = Eski, arşive · **+** = birleştir

| Satır | Konu | Karar | Not |
|---|---|---|---|
| 44 | Node/Android araçları kurulu değildi | E | Emülatör turu yapıldı. |
| 46 | expo-updates yok | K | Mekanik hale getirilir: bağımlılık politikası testi (M-6). |
| 52 + 160 | allowBackup Android kanıtlandı, iOS açık | T(Android kısa) + A(iOS) | İki kayıt teke iner. |
| 59 | SDK 57, `expo-env.d.ts` | T | 3 satıra iner. |
| 66 | @types/jest ve react-test-renderer sabitleme | T (düzeltilmiş) | Ç-5. |
| 73, 195 | eslint-disable gerekçeleri | K ("eslint-disable kaydı") | Bkz. TB-6. |
| 78 | Seviye eşikleri tam kesir (5/3, 7/3) | K (domain sayısal) | |
| 85 | Delta epsilon | K (kısa) | Tarihçe `delta.ts` başlığına. |
| 103 | `buildCard` 5. parametre | M (sapma listesinde tek satır) + E | S7a'da kapandı (`plan.md:201`). "Yapılmazsa..." uyarısı artık geçersiz. |
| 120 | expo-sqlite eksikti | E | |
| 125 | `node:sqlite` yalnızca testte | K + mekanik | Ç-8. |
| 142 | `weekly_card` iki ek sütun | M (sapma) | |
| 152, 186 | `testPathIgnorePatterns`, CSS mock | K (test) | CSS mock web kaldırılırsa E (TB-3). |
| 167, 301, 373, 439, 471 | "Cihaz/emülatör yok" | E | Yerine A'da tek satır: "Cihaz kanıtı durumu: `docs/manual-checklist.md` + `docs/emulator-*.md`". |
| 174 | `week.ts` dışa aktarımları | K (tarih aritmetiği tek kaynak) | |
| 215, 569 | Demo kodu silinemedi / pakette | E | Ç-1. |
| 226 | Tabs vs NativeTabs | M | |
| 235, 541 | Zaman simülasyonu, dev menü üretimde yok | K (dev/prod) + mekanik | CI'da paket taraması (§5.3). |
| 244 | S6 Alert | E | Ç-2. |
| 255 | K3 akışı | M (tek satır) | |
| 264 | Inter alt yol importu | K | |
| 273 | `captureCardPng` imzası | M (sapma) | |
| 281 | Animated unmount | T | Test tuzağı, gerçek ve tekrarlanabilir. |
| 296 | Blur yaklaşık | B (TB-22) | |
| 309 | expo-sharing ve file-system eklendi | K ("bağımlılık kaydı") | M-6 izin listesine. |
| 321 | file-system legacy/yeni API | T | |
| 332 | `dialogTitle` K5 mesajı taşımıyor | A (cihaz) | |
| 344, 491, 586, 660 | Temizlik: PNG, rapor dosyası, transaction, silme sonrası onboarding | K ("Silme ve temizlik", tek kural) + A (iOS temp dizini) | |
| 353 | Unvan gizleme kararı | M | |
| 363 | `TestInstance.toJSON` yok | T | |
| 383 + 400 | expo-notifications push yok, FCM | K (push yasağı, `no-push.test.ts`) + A (merged manifest, G-09) | İki kayıt teke iner. |
| 411 | Exact alarm yok, gecikme | T | Emülatörde ölçülen ~82 sn eklenir (`emulator-test-sonuclari.md` B-02). |
| 416 | Jest TZ | T (düzeltilmiş) + B (TB-5) | Ç-7. |
| 427 | Senkronizasyon kuyruğu, silme yarışı | K ("eşzamanlılık") | |
| 441, 446, 458 | Ölçüm sınırları, olay anları, D7 | M (ölçüm; tek satır, ayrıntı `plan.md` S9) | Bunlar tuzak değil, ürün tanımı. |
| 465 | Rapor yasak deseni | K (mekanik: `report.test.ts`) | |
| 479, 600 | Deep link uygunluğu, onboarding kapısı | K ("dış girdi") | |
| 486 | "Anonim" denmez | K (metin) | |
| 497 | N-3/N-5 bilinçli kabul | B (TB-15, TB-16) | |
| 505 | Haftik, paket adı | Ürün özeti'ne 2 satır | Ç-3. |
| 517 | S12 kararları | E (tekrar) | `plan.md:264`'te zaten var. |
| 527 | K8 içerik tonu | E | `docs/icerik-inceleme.md`. |
| 535, 580 | eas.json, development profili | Commands'a | 580 E. |
| 548, 617 | Android izinleri | A (INTERNET kararı, merged manifest) | |
| 563 | npm audit | B (TB-14) | |
| 575 | Log taraması | K | |
| 605 | Ölü kod silindi | E (tarihçe) | Reanimated cümlesi Ç-6 ile düzeltilir. |
| 623 | Batuhan kararı bekleyenler | A (güncellenmiş) | Ç-3. |
| 626 | `site/` tsconfig dışında | T | |
| 632 | Android 13 izin durumu | T (sınıf 1'in referans örneği) | |
| 644 | `useNow` canlı | K (zaman) | |
| 652 | Kart ölçü bütçesi | K (kart) | |
| 668 | Türkçe karakterli yol | T + §6 kalıcı çözüm | |
| 677 | B14 koyu mod | A | Tech-lead önerisi: (a) açık temaya kilitle (TB-21). |
| 683 | expo-doctor 20/21 | B (TB-4) | |
| 688 | `useTopInset` | K (UI) | |
| 695, 697 | Kilit dairesi, "Kartın açıldı" | E | UX belgesinde zaten var. |
| 700 | YB-6/YB-4 | A | |
| 705 | 411x914 tek ekran | K (UI) + mekanik (`checkin-single-screen-fit.test.tsx`) | |

### 1.5 Taslak metin: `## Commands` (değişecek satırlar)

```markdown
- Node: >= 22.13 (repo testleri `node:sqlite` kullanır; bu makinede Node 24). `.nvmrc` kaynak alınır.
- Kurulum: `npm ci` (lockfile'a sadık; `npm install` yalnızca bağımlılık değiştirirken)
- Çalıştır (emülatör): ASCII yoldaki çalışma kopyasından (bkz. Bilinen tuzaklar "Türkçe karakterli yol")
- Test: `npm test` (TZ `cross-env` ile Europe/Istanbul; bu tek güvencedir)
- Lint / tip: `npm run lint`, `npm run typecheck`
- Sağlık: `npx expo-doctor` (beklenen: tamamı yeşil; sapma "Teknik borç"a yazılır)
- Build: `eas build -p android --profile preview` (APK, iç dağıtım) / `--profile production` (AAB).
  Hesap/kimlik bilgisi yalnızca Batuhan. OTA yok (E3).
- Üretim paketi kontrolü: `npx expo export --platform android` sonra çıktıda `dev-time-menu` ve
  `currentWeekSunday2000` için grep: 0 eşleşme beklenir.
```

### 1.6 Taslak metin: `## Konvansiyonlar` (koddan çıkarıldı; her madde bugünkü kodla uyumlu)

```markdown
## Konvansiyonlar

> Her kural mümkünse onu uygulayan araçla birlikte yazılır. "(mekanik: X)" yoksa kural henüz insan hafızasına bağlıdır.

### Dil ve adlandırma
- Tanımlayıcılar İngilizce; yorum, UI metni ve belge Türkçe (UTF-8). src/data/* içindeki eski ASCII-Türkçe yorumlar olduğu gibi kalır.
- Dosya adı kebab-case. Tarihsel istisnalar (yeniden adlandırılmaz): src/card/CardView.tsx,
  src/card/CardRevealView.tsx, src/domain/buildCard.ts.
- Import: dizinler arası `@/…`; aynı dizin içi `./…`; `../` yalnızca src/domain/content -> src/domain.
- Hook, sarmaladığı modülün yanında yaşar (useNow -> lib/now, useOnboardingGate -> lib/onboarding-gate,
  useCardFonts -> card/fonts). src/hooks/ yalnızca tema ve ekran geometrisi içindir (use-theme, use-top-inset).

### Katmanlar ve bağımlılık yönü (mekanik: __tests__/infra/boundaries.test.ts — önerildi)
- src/domain: saf TS. Yalnızca domain içinden import eder; react, react-native, expo-*, node:* yok.
  Saat her zaman `now: Date` parametresiyle gelir.
- src/data: yalnızca SQL (SqlDriver) + domain tipleri. UI, dosya sistemi ve bildirim bilmez.
  (Tek istisna, borç: data/delete-all.ts.)
- src/card, src/notify, src/metrics: özellik modülleri; data + domain + lib kullanır.
- src/components: sunumdur; src/data'yı doğrudan import etmez (veri prop ile gelir).
- src/app: rota ve orkestrasyon; veri okur, özellik modüllerini çağırır.
- src/dev: yalnızca src/app/_layout.tsx'ten `if (__DEV__) require(...)` ile yüklenir; statik import yasak.
- `node:*` modülleri src/ altında yasak (Metro çözemez). Test sürücüsü: __tests__/helpers/node-sqlite-driver.ts.

### Zaman ve tarih
- UI "şimdi"yi yalnızca useNow() (render) veya getNow() (olay/işleyici) ile alır; `new Date()` / `Date.now()`
  src/ içinde yalnızca lib/now.ts ve data/*-repo.ts (created_at/generated_at/at damgaları) içinde geçer.
- Gün kimliği yerel `YYYY-MM-DD`: yalnızca domain/week.ts (toLocalDateString, addLocalDays, getWeekStart).
  `toISOString().slice(0,10)` yasak.
- Eşikler ve ortalamalar tam kesirle yazılır (5/3, 7/3), literal ondalıkla değil; delta karşılaştırması
  `EPSILON = 1e-9` ile yapılır (domain/delta.ts).
- Uygunluk kuralının tek kaynağı domain/week.ts getWeekState (3/4 gün + Pazar 20:00). Ekran veya akış bunu
  yeniden hesaplamaz, çağırır.

### Veri
- Repo fonksiyonları async imzalıdır, sürücü senkrondur; parametreler yalnızca pozisyonel `?`.
- Yazma: checkin/setting upsert (ON CONFLICT); weekly_card dondurulur, tekrar yazma no-op.
- Şema değişikliği yalnızca yeni numaralı migration ile yapılır; yayımlanmış migration düzenlenmez.
  v2 placeholder'dır ve numarası kalıcı olarak yakılmıştır; sonraki gerçek migration v3'tür.

### Hata ve yan etki
- Birincil veri yazımı (check-in, kart) hata fırlatır; UI bunu gösterir.
- Yan etkiler (bildirim planı, ölçüm olayı, geçici dosya temizliği) EN İYİ ÇABA: hata yutulur, akış bozulmaz.
  Log en fazla sabit metinli console.warn olabilir; veri ya da hata nesnesi loglanmaz.
- Çift dokunuş koruması senkron olmalı (useRef bayrağı); yalnızca useState ile yapılan koruma yeterli değildir.

### Dış girdi (deep link, bildirim verisi, paylaşım dönüşü)
- Her rota parametresi kullanılmadan önce lib/week-param.ts (veya aynı dosyadaki eşdeğeri) ile doğrulanır.
- Güven sınırındaki fonksiyon, çağıranın kontrol ettiğine güvenmez (openOrBuildCard uygunluğu kendisi doğrular).
- (main) altındaki her ekran onboarding kapısının arkasındadır (lib/onboarding-gate). Grup dışına yeni rota
  eklenirse kapı gerekip gerekmediği kararı dosya başına yazılır.

### Silme ve temizlik
- "Tüm verilerimi sil" = bildirim iptali (en iyi çaba) + 4 tablo tek transaction + rapor dosyası + kart PNG
  süpürme + router.replace('/'). Yeni bir kalıcı iz (dosya, ayar, önbellek) ekleyen herkes onu bu listeye ve
  delete-all testine ekler.
- Silme ve bildirim senkronu aynı kuyrukta çalışır (runDeleteExclusive).

### UI düzeni
- Yeni ekran üst dolguyu useTopInset() ile alır; kart ekranı SafeAreaView kullanır.
- Hedef 411x914dp'de tek ekrana sığma; dikey bütçe docs/ux/ekran-akisi.md'de
  (mekanik: checkin-single-screen-fit.test.tsx). Kaydırılan ekranlar ScrollView kullanır.
- Kart 360x640 mantıksal, 1080x1920 PNG; kart metinleri allowFontScaling={false}; ölçüler card/layout.ts'te
  (mekanik: card/layout.test.ts, card-layout-fixes.test.tsx).
- Renk sabitleri constants/theme.ts'te. İstisnalar: kart paleti (card/*) ve dev menüsü.

### Test
- Yerleşim: __tests__/<src-dizini>/<modül>[.<senaryo>].test.ts(x). Düzeltme turuna göre ad verilmez
  (ör. "card-layout-fixes"); ad test edilen modülü söyler.
- Veri katmanı gerçek SQLite ile test edilir (setupTestDb). Platform modülleri tek bir paylaşılan
  sahteyle (__tests__/helpers/fake-*.ts) taklit edilir; sahte, gerçek modül tipine `satisfies` ile bağlanır
  ve dönüş biçimi native kaynaktan okunur (K1).
- Animated başlatan bileşen testleri afterEach'te `act(() => tree.unmount())` çağırır.
- Ortam yüzünden koşamayan test `it.skip` ile görünür atlanır; atlama yanına `// SKIP:` gerekçesi yazılır.
- __tests__/helpers/ suite sayılmaz (testPathIgnorePatterns); CSS importları css-mock ile karşılanır.

### Bağımlılık
- Yeni paket = "ağa veri gönderiyor mu" kontrolü + bağımlılık izin listesine ekleme
  (mekanik: __tests__/infra/dependency-policy.test.ts — önerildi). Expo paketleri `npx expo install` ile eklenir.
- Kalıcı yasaklar: expo-updates, analitik/çökme SDK'ları, push token API'leri (mekanik: no-push.test.ts).
- Font gibi büyük varlık paketlerinde alt yol importu kullanılır (@expo-google-fonts/inter/400Regular).

### eslint-disable
- Her disable yalnızca tek satırlıktır (`-next-line`) ve `-- gerekçe` taşır. Dosya geneli `/* eslint-disable */` yasak.
- Kabul edilmiş kalıcı istisnalar: no-require-imports (dev menüsü, native modülün tembel yüklenmesi),
  exhaustive-deps (yalnızca mount'ta çalışan efekt, gerekçeli).

### Kanıt raporlama
- Her "çalışıyor" iddiası K seviyesiyle yazılır (ortak-standartlar §2). K4/K5 kanıt belgesi başlığında
  commit SHA'sı ve çalışma ağacının temiz olup olmadığı yazar.
```

### 1.7 Taslak metin: `## Mimari`

```markdown
## Mimari

Tek mobil uygulama; sunucu/hesap/ağ yok (spec "Mimari genel bakış"). Gerçek dizin haritası:

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

Bilinçli sapmalar (ayrıntı plan.md "Uygulama notu"; hepsi belgelidir):
- buildCard 5. isteğe bağlı parametre `prevVariants` (S3; S7a'da open-card ile bağlandı).
- weekly_card: title_based_on_categories + summary_id sütunları (S5, round-trip için).
- captureCardPng(ref) imzası (view-shot yalnızca render edilmiş View yakalar) (S7a).
- Unvan ayrı gizlenmez; dayandığı kategori gizliyse `???` olur (S7b).
- Tabs (NativeTabs değil); emoji sekme ikonları (S6).
- Kart açılışında K3 akışı: open-card -> needsTodayCheckin -> today?returnToCardWeekStart (S7a).
- Ölçüm olaylarının anları ve D7 tanımı: plan.md S9.
```

### 1.8 Taslak metin: `## Bilinen tuzaklar` (aktif çekirdek, yaklaşık 22 kayıt)

Her kayıt `(tarih, sınıf)` etiketiyle, en fazla 4 satır. Sınıf numaraları ortak standartlardaki 7 hata sınıfına karşılık gelir.

```markdown
- (09-24, S1-mock) Android 13+ hiç sorulmamış bildirim izni `denied + canAskAgain:true` döner, `undetermined`
  dönmez. Karar `granted`/`canAskAgain`e göre verilir. Test: notify/permission-android13.test.ts.
- (09-23, S1-mock) expo-file-system SDK 57: eski fonksiyonlar yalnızca `expo-file-system/legacy`de; yeni
  File/Directory API'siyle karıştırma.
- (09-23, S1-mock) expo-sharing `dialogTitle` hedef uygulamaya mesaj olarak TAŞINMAZ (iOS'ta hiç kullanılmaz).
- (09-23, S2-zaman) Jest'te çalışma zamanında process.env.TZ değiştirmek etkisizdir; TZ yalnızca süreç
  başlarken (cross-env) belirlenir. Test içinde TZ değiştirmeye dayanan test yazma.
- (09-23, S2-zaman) Android 12+ exact alarm izni yok: hatırlatma birkaç dakika gecikebilir (emülatörde ~82 sn).
- (09-24, S2-zaman) Uygulama açıkken gün/hafta/Pazar 20:00 dönümü: useNow zamanlayıcı + AppState; yeni ekran
  "şimdi"yi kendisi hesaplamaz.
- (09-24, S3-düzen) Android edge-to-edge: durum çubuğu altındaki dokunuşlar sisteme gider -> useTopInset.
- (09-24, S3-düzen) numberOfLines kapsayıcıyı büyütmez; sabit piksel bölümlere 2. satır sığmaz (BLG-04).
- (09-24, S3-düzen) Genişliğe bağlı aspectRatio yükseklik bütçesini patlatır (411x914 kuralı).
- (09-23, S4-dış girdi) `haftik://` şeması dışarıdan tetiklenebilir; card/ rotası (main) kapısının dışındadır.
- (09-23, S5-temizlik) view-shot PNG'si iOS'ta NSTemporaryDirectory altına yazar; süpürme yalnızca Android'de.
- (09-23, S6-eşzamanlı) trackEventOnce atomik değildir (kabul); bildirim senkronu ve silme tek kuyruktadır.
- (09-24, S7-araç) Türkçe karakterli/boşluklu proje yolu Gradle/RN derlemesini kırar (kalıcı çözüm: bkz. inceleme 08 §6).
- (09-22, S7-araç) Varsayılan `@types/jest` ve `react-test-renderer` sürümleri SDK 57 ile uyuşmaz; tam sürüm tutulur.
- (09-22, S7-araç) expo-env.d.ts yalnızca `expo start` ile üretilir; cihaz yoksa elle oluştur.
- (09-23, S7-araç) Jest varsayılan testMatch'i __tests__ altındaki her .ts dosyasını suite sayar -> helpers hariç.
- (09-23, S7-araç) Web-only `@/global.css` importu Jest'i kırar -> css-mock (web kaldırılınca geçersiz olur).
- (09-23, test) react-test-renderer: Animated başlatan ağaç unmount edilmezse Jest süreci teardown sonrası çöker.
- (09-23, test) TestInstance'ta .toJSON() yok; alt ağaç metni için findAllByType(Text).
- (09-23, test) node:sqlite yalnızca __tests__/helpers'ta; src'ye sızarsa Metro/EAS "Unable to resolve" ile kırılır.
- (09-23, araç) site/ içine .ts/.js koyma: tsconfig `**/*.ts` include'u onu da derler.
- (09-22, araç) React Compiler lint kuralları (refs, set-state-in-effect) RN Animated ve hidrasyon
  desenlerinde yanlış pozitif verir; önce kodla çöz (useAnimatedValue, türetilmiş durum), disable son çare.
```

### 1.9 Taslak metin: `## Açık kararlar ve cihaz maddeleri`

```markdown
- Batuhan kararı: INTERNET izni (profil bazlı engelleme), N-9 uygulama kilidi/FLAG_SECURE, I-5/I-6 (S12),
  N-7 placeholder migration (öneri: kalsın, v2 numarası yakıldı), B14 koyu mod (öneri: v1 açık temaya kilit),
  K5 mağaza bağlantısı, K9 Apple üyeliği, K10 KVKK görüşü.
- Cihaz/release kanıtı bekleyen: release merged manifest + FCM + ağ gözlemi (G-09), K5 mesajının
  paylaşım hedefine taşınması, iOS iCloud yedek hariç tutma ve temp PNG, TZ/DST (B-07..B-09), Pazar
  bildirimi teslimi (B-06), YB-4, YB-6, BLG-09/10/11. Takip: docs/manual-checklist.md.
```

---

## 2. Mimari sağlık

### 2.1 Gerçek bağımlılık yönü (K1, `src/**` import grep'i)

```
app ──> components, card, notify, metrics, lib, data, domain
components ──> card (yalnızca card-preview-view), metrics/track, lib, constants, hooks     [data: YOK, doğru]
card ──> data, domain, lib, config, constants
notify ──> data, domain, lib/now
metrics ──> data
lib ──> domain; lib/onboarding-gate ──> data
data ──> domain(type) ; data/delete-all ──> card/temp-cleanup, metrics/report-file      [TERS YÖN]
domain ──> yalnızca domain                                                              [temiz]
dev ──> lib/now, components, hooks; yalnızca _layout'tan __DEV__ require                [temiz]
```

Döngü görülmedi (`db.ts` ↔ `migrations.ts` arasındaki ilişki yalnızca tip importu, `migrations.ts:17`).

### 2.2 Bulgular

| # | Bulgu | Kanıt | Önem | Öneri | Yanlış çıkarsa maliyet ve geri dönüş |
|---|---|---|---|---|---|
| M-1 | **Sınır kuralları mekanik değil.** Domain saflığı, `node:sqlite` yasağı, `src/dev` izolasyonu ve components→data yasağı bugün doğru durumda, ama tek koruma yorumlar ve verifier'ın grep'i. `no-push.test.ts` yalnızca `expo-notifications` importuna ve push adlarına bakıyor. | `no-push.test.ts:19-44`; Ç-8 | Yüksek (erozyon başladı, M-2) | `__tests__/infra/boundaries.test.ts` eklenir. `no-push.test.ts` ile aynı desende (fs yürüyüşü + regex); yeni bağımlılık gerekmez. Kurallar: domain yalnızca domain; data'ya `@/(app\|components\|card\|notify\|metrics\|lib\|dev)` yasak (izin listesi: `delete-all.ts`); `src/**`'de `node:` ve `__tests__`/`spike` yasak; `@/dev/` yalnızca `_layout.tsx`'te; components'ta `@/data/` yasak. İzin listeleri yalnızca **küçülebilir** (ratchet). | Yanlış pozitif çıkarsa bir satır izin listesine eklenir. Regex çok sıkı tutulursa meşru bir import kırmızıya döner; geri dönüş testi skip'lemek değil, regex'i düzeltmek. Maliyet ~1-2 saat. |
| M-2 | **İlk ters bağımlılık:** `data/delete-all.ts` `card/temp-cleanup` ve `metrics/report-file`'ı import ediyor. Aynı fonksiyon bildirim iptalini ise enjeksiyonla alıyor, yani tek dosyada iki farklı desen var. | `src/data/delete-all.ts:20-21,25-27` | Orta | Şimdi yalnızca dondur (M-1 izin listesi). Taşıma sonra: "tüm verilerimi sil" bir orkestrasyon işidir ve `src/lib/delete-all-data.ts`'e taşınmalı; data/ yalnızca 4 DELETE'i yapan `clearAllTables()` fonksiyonunu tutar. | Taşıma, test importlarını (`delete-all*.test.ts`, 3 dosya) değiştirir. Bu yüzden ayrı bir refactor görevinde yapılmalı, düzeltme görevinde değil. Geri dönüş: `git revert`. |
| M-3 | **Güven sınırında isteğe bağlı saat.** `openOrBuildCard(weekStart, today, now?)`: `now` verilmezse `today 23:59:59` varsayılıyor. Pazar günü 20:00'den önce `now`'ı unutan bir çağıran kartı erken açar ve dondurur (tek yönlü kapı). `today` ile `now` aynı bilginin iki kaynağı ve birbirinden farklı olabilirler. | `src/card/open-card.ts:72-89` | Orta (bugün tek çağıran doğru; `[weekStart].tsx:55`) | `now: Date` zorunlu hale gelir, `today = toLocalDateString(now)` içeride türetilir. BLG-09 (bildirimden kart açma) intent'inden **önce** yapılmalı, çünkü ikinci çağıran o olacak. | Eski imzalı testler değişir (dosya başı notu "yalnızca eski çağrı imzası testleri için" diyor), bu yüzden ayrı refactor görevi. Yapılmazsa maliyet: yanlışlıkla dondurulmuş bir kart, ki bu geri alınamaz (kullanıcı verisi). |
| M-4 | **Tek zaman kaynağı sağlam** (`new Date()`/`Date.now()` yalnızca `lib/now.ts` ve repo damgalarında). `domain/clock.ts`'teki `Clock` arayüzü ise hiç kullanılmıyor: domain `now: Date` parametresini seçmiş. | grep: `Clock` yalnızca tanımında geçiyor | Düşük | `Clock` silinir (TB-13) ya da "kullanılmıyor" diye işaretlenir. Kural mekanik hale gelir: `new Date()` izin listesi (M-1 testine eklenir). | Maliyeti yok. |
| M-5 | **Dev/prod ayrımı doğru ama kanıtı tek seferlik.** S10'da `expo export` ile yapılan tarama bir kez koşuldu (K3). Birisi `src/dev/*`'i statik import ederse yeniden koşulmadıkça fark edilmez. | `CLAUDE.md:541`; `_layout.tsx:23-28` | Orta | (a) M-1 testi statik importu yakalar; (b) CI'a `expo export` + grep adımı eklenir (§5.3). | CI süresine ~1-2 dakika eklenir. Geri dönüş: adımı kaldırmak. |
| M-6 | **Bağımlılık politikası (spec güvenlik gereksinimi 2) insan hafızasına bağlı.** expo-updates yokluğu, analitik SDK yokluğu, "ağa veri gönderiyor mu" kaydı dağınık notlarda. | `CLAUDE.md:46,309,383` | Orta | `__tests__/infra/dependency-policy.test.ts`: `package.json` bağımlılıkları sabit bir izin listesine eşit olmalı; `expo-updates` ve bilinen analitik adları yasak; `app.json`'da `updates` yok, `allowBackup === false`, `blockedPermissions` üç izni içeriyor. Yeni paket eklendiğinde test kırmızıya döner ve bu, bilinçli kaydı zorlar. | Her bağımlılık değişikliğinde izin listesi bir satır güncellenir (bu kasıtlı bir sürtünme). Dependabot PR'ları da takılır; bu da istenen davranış. |
| M-7 | **Platform adaptör tipleri gevşek.** `ExpoNotificationsLike` elle yazılmış ve `granted?`, `canAskAgain?` alanları isteğe bağlı. Oysa gerçek API bunları her zaman döndürüyor. Sahte nesne, alan yokken bu gerçek dışı biçimi varsayılan olarak üretiyor (`fake-notifications.ts:33-35`). BLG-01 tam da bu boşluktan geçmişti. | `src/notify/scheduler.ts:37-39`; `__tests__/helpers/fake-notifications.ts:32-44` | Yüksek (sınıf 1) | Adaptör tipi gerçek modülden türetilir: `Pick<typeof import('expo-notifications'), 'getPermissionsAsync' \| ...>` ya da en azından dönüş tipleri `NotificationPermissionsStatus`. Sahte nesne `satisfies` ile bağlanır ve gerçek dışı biçim `tsc`'de derlenmez hale gelir. | Tip daraltması mevcut testlerin bir kısmını derleme hatasına düşürebilir (sahte nesnenin "alan yok" dalı). Bu hata istenen sonuçtur, ama test değişikliği gerektirdiği için ayrı bir görevdir. Geri dönüş: tipi eski haline getirmek. |
| M-8 | **Platform mock'ları dağınık.** Paylaşılan tek sahte `fake-notifications`. `expo-sharing` 4 dosyada, `expo-file-system/legacy` 5, `expo-router` 4, `react-native-view-shot` 2 dosyada ayrı ayrı satır içinde mock'lanıyor; her biri gerçek API'yi farklı varsayabilir. | grep: `jest.mock('expo-…'` 14 yer + `react-native-view-shot` 2 yer (spike dahil) | Orta | `__tests__/helpers/fakes/<modül>.ts` (her platform modülü için bir tane, başlığında native kaynak referansı). Meta-test: `jest.mock('expo-…', factory)` yalnızca izin listesindeki dosyalarda olabilir; liste yalnızca küçülür. | Göç kademeli yapılır, yeni test yeni deseni kullanır. Mekanizma yanlış çıkarsa meta-test kaldırılır; ürün koduna etkisi yok. |
| M-9 | **Çift dokunuş koruması üç farklı biçimde:** onboarding `useRef` (senkron, doğru), `today.tsx` `useState` saving, `card-preview-view` `useState` sharing. State ile yapılan koruma aynı kare içindeki ikinci dokunuşu kaçırabilir; sonuç `check_in_saved` olayının iki kez sayılması ve iki ayrı senkron. | `onboarding/notifications.tsx:32`; `today.tsx:86`; `card-preview-view.tsx:69` | Düşük | Paylaşılan `useSingleFlight()` hook'u (ref + state). Konvansiyon olarak yazılır (1.6). | Etki: ölçüm sayısında küçük şişme. Ertelenirse ek maliyet yok. |
| M-10 | **`lib/` iki farklı şeyi karıştırıyor** (saf yardımcılar ve IO yapan kancalar). `constants/` ile `config/constants.ts` isim çakışması var. UI metni en az 4 yere dağılmış (`domain/content/tr.ts`, `notification-texts.ts`, `constants/emoji.ts` etiketleri, `lib/week-status-copy.ts`, satır içi dizeler). | Dosya ağacı | Düşük | Taşıma yapılmaz; kural yazılır (1.6: "hook modülünün yanında"). Metin birleştirme ancak çok dil desteği (E8) gelirse yapılır. | Taşımanın maliyeti faydasından büyük. Bu kararın yanlış çıkması çok dil desteği gelince ortaya çıkar; o gün tek seferlik bir göç yapılır. |
| M-11 | **Testlere uyum için ürün koduna eklemeler:** `now.ts:114` `unref` (Jest süreci açık kalmasın), `setDriver(…, {skipMigrations})`, `wiring.Overrides`. Bağımlılık enjeksiyonu kabul edilebilir; `unref` ise bir test yan etkisini ürün koduna taşıyor. | Kaynak | Düşük | Kabul. Kural: "Test amaçlı ürün kancası dosya başında gerekçesiyle yazılır" (zaten öyle). | — |
| M-12 | **Rota kapsamı:** `card/[weekStart]` (main) kapısının dışında. Uygunluk kontrolü sayesinde bugün güvenli: veri yoksa `notReady` dönüp `/week`'e, oradan onboarding'e gidiyor. Ama kapı yapısal değil, yan etkiyle çalışıyor. | `_layout.tsx:68`; `open-card.ts:96` | Düşük | M-1 testine bir madde: `src/app` altındaki rota dosyaları ya `(main)/` içinde ya da izin listesinde (`index`, `onboarding/*`, `card/[weekStart]`). `useLocalSearchParams` kullanan her dosya `@/lib/week-param` import etmeli. | Yeni rota eklemek bilinçli bir satır gerektirir. Kasıtlı sürtünme. |

---

## 3. Hata sınıfı taraması (ortak standartlar, 7 sınıf)

Her sınıf için soru şu: projede hâlâ açık örnek var mı, ve önerilen mekanik kural o geçmiş olayı yakalar mıydı?

| Sınıf | Hâlâ açık örnek (kanıt) | Mekanik kural önerisi | "O olay yakalanır mıydı?" |
|---|---|---|---|
| **1. Mock ≠ platform** | (a) `ExpoNotificationsLike` gevşek tip + sahte nesnenin gerçek dışı varsayılanı (M-7). (b) 16 satır içi platform mock'u (M-8). (c) `dialogTitle`/K5, iOS temp dizini, merged manifest/FCM: yalnızca K1/K2 düzeyinde. (d) Spike testleri (`__tests__/spike/*`) mock'lu API kullanıyor ve toplam yeşil test sayısını şişiriyor. | Sahteler `satisfies` ile gerçek tipe bağlanır. Başlıkta native kaynak dosya yolu zorunlu olur (meta-test başlıkta `node_modules/` referansı arar). Satır içi `jest.mock('expo-…')` için izin listesi. Spike testleri silinir. | BLG-01: evet, büyük olasılıkla. `granted`/`canAskAgain` zorunlu olsaydı sahte nesne `{status}` tek başına döndüremezdi ve yazan kişi Android 13 dalını düşünmek zorunda kalırdı. Yine de emülatör (K4) şart kalır; kural yalnızca olasılığı düşürür. |
| **2. Zamana bağlı mantık** | (a) T-02..T-07 skip ediliyor. Ayrıca **yapısal olarak yanlış**: test içinde TZ değiştiriyorlar (`notify-plan.test.ts:309-319`). Süreç NY saat diliminde başlatılsa bile `tzEffective` true döner, test Istanbul beklentisiyle koşar ve **kırmızıya döner**. Yani ortam düzelse de geçemezler. (b) Emülatörde B-06..B-09 (Pazar bildirimi, TZ, DST) koşulmadı. (c) `openOrBuildCard` `now?` varsayılanı (M-3). (d) Ç-7: `jest.setup.ts` sahte güvence. | (1) TZ testleri süreç TZ'sine göre parametrelenir: `const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;` beklentiler buna göre seçilir, test içinde TZ değiştirilmez. (2) `npm run test:tz` = `cross-env TZ=America/New_York jest __tests__/domain` + `Europe/Berlin` (DST); CI'da ayrı iş. (3) `jest.setup.ts` ayar yerine doğrulama yapar: TZ Istanbul değilse ve `HHK_TZ_RUN` yoksa hata verir. (4) `new Date()` izin listesi (M-4). | BLG-03 (useNow): hayır, bu bir yaşam döngüsü eksikliğiydi. Onu sahte zamanlayıcılı `now-live.test.tsx` artık kapsıyor. TZ kuralı ise yurt dışındaki bir kullanıcının yaşayacağı "Pazar 20:00 yanlış anda" hatasını yakalar; bugün bu senaryonun hiç kanıtı yok. |
| **3. Düzen / ekran boyutu** | (a) B14 koyu mod: `locked-card-placeholder` ve `settings-view` içinde sabit renkler (5 hex). (b) YB-4 (font 2.0'da sekme çubuğu). (c) Tek ekrana sığma testi yalnızca Bugün ekranı için var; onboarding ekranları ve ara ekran için dikey bütçe testi yok. | (1) Hex renk izin listesi meta-testi (`theme.ts`, `card/*`, `dev/*` dışında hex yasak; mevcut 5 kullanım B14 kararına kadar izin listesinde). (2) `REVIEW.md`'ye "düzen değiştiyse 3 boyut ekran görüntüsü + bütçe" maddesi. (3) B14 için öneri: `userInterfaceStyle: "light"`. Tek satırlık değişiklik; test boyutunu yarıya indirir. | B14: evet, hex kuralı sabit rengi PR'da yakalardı. BLG-04 ve 4. kategorinin kesilmesi: ancak bütçe testi o ekran için yazılmışsa. Bu yüzden kural "ekran başına bütçe testi ya da ScrollView". |
| **4. Dışarıdan tetiklenebilir yüzey** | (a) `card/` rotası kapı dışında (M-12). (b) BLG-09 açık: bildirim tıklaması yönlendirmesi eklendiğinde `content.data` yeni bir dış girdi olacak. (c) `decode-uri-component` DoS (npm audit, `haftik://`). | (1) M-12 rota meta-testi. (2) `useLocalSearchParams` / `addNotificationResponseReceivedListener` kullanan dosya doğrulayıcı import etmek zorunda (meta-test). (3) BLG-09 intent'ine zorunlu madde: "bildirim verisi `week-param` ile doğrulanır". | `haftik://card/...` ile doğrudan kart yazılabilmesi (I-1): evet. Doğrulayıcı import kuralı, doğrulamasız bir `useLocalSearchParams` kullanımını kırmızıya çevirirdi. |
| **5. Temizlik kalıntısı** | (a) `spike/` + `__tests__/spike/` (Ç-13). (b) `scripts/reset-project.js` + `npm run reset-project`: şablon betiği `src/`'yi taşıyor ya da siliyor, **yıkıcı**. (c) Kullanılmayan kod: `Clock`, `getNotificationPermission` (src'de çağıranı yok), `metric_event.at`, placeholder sütun. (d) iOS temp PNG (S11). (e) Belgelerdeki bayat notlar (§1.3). | (1) "Silme ve temizlik" konvansiyonu ve delete-all testi: yeni kalıcı iz ekleyen kişi teste de ekler. (2) Kullanılmayan export taraması: `npx knip` yeni bir dev bağımlılığı getirir; önce elle bir kez, sonra karar. (3) Spike yaşam süresi kuralı: spike dosyası başında "silinme dilimi" yazar; o dilimin "Bitti kanıtı"na "spike silindi" maddesi eklenir. | Ölü demo kodunun paketlenmesi (OPS/S10): evet, bir export ve rota taraması yakalardı. Spike'ın kalması: dilim kontrol listesi kuralı yakalardı. |
| **6. Eşzamanlı yollar** | (a) `trackEventOnce` atomik değil (kabul edildi). (b) Çift dokunuş koruması tutarsız (M-9). (c) `openOrBuildCard`'da `getCard` → `await` → `saveCard` arası: iki eşzamanlı çağrıda ikisi de kartı üretir. `buildCard` deterministik ve `saveCard` no-op olduğu için sonuç aynı; risk düşük. (d) İki ayrı kuyruk var (`scheduler.enqueue` ve `sync.runExclusiveNotify`); bugün iç içe çağrı kilitlenme yaratmıyor ama bu durum belgelenmemiş. | (1) `useSingleFlight` kuralı. (2) `saveCard`'ı `INSERT … ON CONFLICT DO NOTHING` + `getCard` ile döndürmek (tek adım). (3) "Kuyruklar" başlığıyla `notify/sync.ts` dosya başına: hangi kuyruk neyi seri hale getiriyor, iç içe çağrı sırası. | Silme + arka plan senkron yarışı (SEC): kuyruk kuralı bunu zaten kapattı. (2) ve (3) yeni bir olay beklemeden alınan önlemler. |
| **7. Araç zinciri / yol** | (a) Türkçe yol ve robocopy çift kopya (§6). (b) CI Node 20 ↔ `node:sqlite` (Ç-10). (c) CI hiç koşmadı (remote yok). (d) Dependabot her Expo paketini ayrı ayrı yükseltir, SDK hizası bozulur. (e) `^` sürümleri (Ç-5). (f) expo-doctor 20/21. | (1) `.nvmrc` (24) + `package.json` `engines.node: ">=22.13"` + `.npmrc` `engine-strict=true`. Yanlış Node ile `npm ci` anında kırılır. (2) `__tests__/infra/toolchain.test.ts`'e Node sürüm assert'i. (3) `npm run android` öncesi `scripts/assert-ascii-path.js`: yol ASCII değil ya da boşluk içeriyorsa anlaşılır bir mesajla durur (Gradle'ın anlaşılmaz hatası yerine). (4) Dependabot'ta `groups` + `expo*`, `react-native*`, `react`, `@types/jest`, `react-test-renderer` için minor/major `ignore`; SDK hizası `npx expo install --check` ile aylık kontrol edilir. | Türkçe yol olayı: evet, assert betiği ilk `npm run android`'de açık bir mesajla dururdu (saatler yerine saniyeler). CI Node hatası: evet, `engine-strict` ilk `npm ci`'da yakalardı. |

**Retrospektif not:** Ortak standartlar 6. bölümün 8. maddesi ("sessizce geçen test sahte güvencedir") burada iki yeni biçimde görünüyor: (i) `jest.setup.ts`'in hiçbir şey yapmayan TZ ataması, (ii) spike testlerinin ürünü test etmeden yeşil sayıya katkı vermesi. Bu yüzden kural genişletilmeli: **"etkisiz güvence katmanı da sahte güvencedir"**. Bu genişletme `ortak-standartlar.md`'ye önerilir; o dosyaya ekleme kararı Batuhan'ındır.

---

## 4. Teknik borç listesi

Tanımlar: **Anapara** = ödeme maliyeti (iş). **Faiz** = ödenmezse her dönem ödenen maliyet ya da pahalanacak somut olay. **Karar** = şimdi (ilk preview APK dağıtımından önce) / sonra (tetik olayıyla) / asla (kabul).

| # | Kalem | Anapara | Faiz / pahalanacak olay | Karar | Gerekçe | Yanlış çıkarsa ve geri dönüş |
|---|---|---|---|---|---|---|
| TB-1 | v2 placeholder migration sütunu (`setting._v2_mechanism_proof_placeholder`, N-7) | A: 0. B: ~1 saat (prod listesinden çıkar, mekanizma testi test içi migration listesiyle) | Çalışma zamanı faizi yok. Kafa karışıklığı: sonraki migration'ın numarası. | **Asla (A), + kural: "v2 numarası yakıldı, sonraki v3"** | Sütun nullable ve kimse okumuyor. Emülatör cihazlarında `user_version=2` zaten var. B seçilirse o cihazlar gelecekteki gerçek v2'yi **atlar**, yani B tek başına yetmez, v3 kuralı yine gerekir. Sıkıcı olan kazanır. Karar Batuhan'ın (şema tek yönlü kapıdır); tech-lead önerisi A. | A yanlış çıkarsa: v3'te `ALTER TABLE setting DROP COLUMN` (SQLite 3.35+), ~30 dakika. B'ye ancak ilk APK dağıtımından **önce** geçilebilir; sonrasında yalnızca A mümkün. |
| TB-2 | `react-native-reanimated` + `react-native-worklets` (src'de 0 kullanım; expo-router çalışma zamanında import etmiyor) | ~30 dk + native yeniden derleme + K4 smoke | APK boyutu ve derleme süresi, native yüzey, Dependabot gürültüsü. İlk preview APK bir yeniden derleme noktası, sonradan yapılırsa ayrı bir derleme ve test döngüsü gerekir. | **Şimdi** (TB-4 ile aynı derleme) | Ç-6: K1 kanıtı var (optional peer). `react-native-gesture-handler` **kalır** (expo-router JS stack `GestureHandlerNative` kullanıyor). | Bir ekran kırılırsa `npx expo install react-native-reanimated react-native-worklets` + yeniden derleme, ~20 dakika. |
| TB-3 | Web desteği: `react-dom`, `react-native-web`, `app.json` `web` bloğu, `global.css`, `use-color-scheme.web.ts` (+eslint-disable), Jest css-mock | ~1 saat (yalnızca JS, native derleme gerekmez) | Test altyapısı ekleri (css-mock), lint istisnası, audit yüzeyi. Spec'te web yok. | **Sonra** (ilk temizlik dilimi) | Android paketine girmediği için faizi düşük. | Geri dönüş: `npx expo install react-dom react-native-web` + dosyaları git'ten geri almak. |
| TB-4 | expo-doctor 20/21 (5 Expo paketi bir yama geride) + `^` sürümler (Ç-5) | ~30 dk + derleme + K4 smoke | İlk APK'nın taban çizgisi "doctor yeşil" olmalı. Sonradan her yama yeni bir derleme ve test döngüsü demek. Hata raporlarında "hangi sürüm" belirsizliği. | **Şimdi** (TB-2 ile aynı commit/derleme) | Yamalar düşük riskli. Birlikte yapılınca tek derleme maliyeti ödenir. | Kilit dosyası revert edilir + yeniden derleme. |
| TB-5 | TZ testleri (T-02..T-07) skip + yapısal olarak yanlış + `jest.setup.ts` sahte güvence | ~2 saat (test dosyası yeniden yazımı + script + CI işi) | Hedef pazar TR (DST yok), bugün faiz düşük. Yurt dışı kullanıcı veya kapalı testte yurt dışındaki bir testçi: Pazar 20:00 yanlış anda. | **Sonra, Play kapalı testten önce** | Test yeniden yazımı "düzeltme görevi" değil, test altyapısı görevi. Ayrı intent gerekmez, ayrı görev gerekir. | Yanlış kurulursa CI'da gürültü olur. Geri dönüş: TZ işini CI'da `continue-on-error` yapmak. |
| TB-6 | 13 `eslint-disable`; bunlardan biri dosya geneli blok (`CardRevealView.tsx:83`, `enable` yok, gelecekteki kodu da kapsıyor) | Blok için ~30 dk: `useRef(new Animated.Value(0)).current` yerine `useAnimatedValue(0)` (RN 0.86'da var, `react-native/index.js:368`); iki `react-hooks/refs` disable'ı da kalkar (K1 hipotezi, lint ile doğrulanmalı) | Blok disable yeni ref hatalarını sessizce yutar (sınıf 8: sahte güvence). | **Şimdi** (blok + `reportUnusedDisableDirectives: "error"`), geri kalanı **asla** (gerekçeli ve meşru) | Ucuz, riski düşük; animasyon davranışı değişmez. | Lint yine uyarırsa tek satırlık `-next-line` disable'a dönülür. |
| TB-7 | `spike/` + `__tests__/spike/` | ~10 dk (silme, **Batuhan onayı**) | Mock'lu spike testleri yeşil sayıyı şişiriyor. `setNotificationHandler` modül yüklenirken ikinci kez çağrılıyor (spike içinde). Belge "S8 sonunda silinir" diyor. | **Şimdi** | Değeri git geçmişinde korunur (`captureCardPng`, `scheduler` zaten ürün kodu). | `git checkout <sha> -- spike __tests__/spike`. |
| TB-8 | `scripts/reset-project.js` + `npm run reset-project` | ~5 dk (silme, **Batuhan onayı**) | Bir ajan ya da yanlış bir tıklama `src/`'yi taşır ya da siler. Yıkıcı ve komut adı zararsız görünüyor. | **Şimdi** | Faizi düşük olasılıklı ama felaket boyutunda. Anaparası neredeyse sıfır. | Git geçmişinden geri alınır. |
| TB-9 | `data/delete-all.ts` ters bağımlılığı (M-2) | ~1 saat + 3 test importu | Yeni bir kalıcı iz eklendikçe data/ katmanı feature modüllerine daha çok bağlanır. | **Sonra** (şimdi M-1 ile dondur) | Önce sızıntıyı durdur (mekanik), sonra refactor. | — |
| TB-10 | `openOrBuildCard` `now?` + `today` çift kaynak (M-3) | ~1 saat + test imzaları | BLG-09 ya da ikinci bir çağıran eklendiğinde kartın erken dondurulma riski (geri alınamaz). | **Sonra, BLG-09 intent'inden önce (tetik)** | Bugün tek çağıran doğru. | — |
| TB-11 | Gevşek platform tipleri ve dağınık mock'lar (M-7, M-8) | Kural: 0. Göç: dosya başına ~15 dk | Her yeni platform özelliğinde yeni bir BLG-01 olasılığı. | **Kural şimdi, göç sonra** (dokunulan dosyada) | Ratchet yaklaşımı: yeni kod doğru desende yazılır, eski kod dokunuldukça göçer. | — |
| TB-12 | Çift dokunuş koruması üç biçimde (M-9) | ~45 dk | Ölçüm şişmesi (küçük). | **Sonra** | — | — |
| TB-13 | Kullanılmayan: `Clock`, `getNotificationPermission` | ~10 dk | Yanlış API kullanımına davet. `getNotificationPermission` `status` bazlı karar verir; BLG-01'in kök deseni buydu. | **Sonra** (ilk temizlik dilimi) | `getNotificationPermission` silinirse biri onu yanlışlıkla kullanıp BLG-01'i yeniden üretemez. | Git geçmişi. |
| TB-14 | npm audit: `decode-uri-component` (expo-router → query-string@7), 15 moderate | Bekle, ya da `overrides` + test | Kötü niyetli bir `haftik://` bağlantısıyla kendi kendine DoS; veri sızıntısı yok. | **Sonra** (Expo yaması; aylık kontrol) | `npm audit fix --force` **asla** (Expo paketlerini düşürür). | `overrides` denenir ve kırılırsa kaldırılır. |
| TB-15 | `metric_event.at` yazılıyor, okunmuyor (N-5) | — | Yok. | **Asla** | Zaman bazlı analiz gelirse zaten orada. | — |
| TB-16 | `trackEventOnce` atomik değil (N-3) | — | `card_unlocked` ana KPI'da (E1 paydası `card_opened`) kullanılmıyor. | **Asla** | KPI'ya girerse yeniden değerlendirilir. | — |
| TB-17 | Elle yazılmış 3 Node `.d.ts` (`__tests__/helpers/node-*.d.ts`) | ~1 saat (ayrı `tsconfig.test.json` + `@types/node`) | Her yeni Node API'si için bir `.d.ts` düzenlemesi. | **Asla** (4. dosya gerekirse yeniden değerlendirilir) | Bugün küçük ve kararlı. | — |
| TB-18 | Dosya adı tutarsızlığı (PascalCase/camelCase istisnalar) | ~30 dk + import güncellemeleri | Yok denecek kadar az. | **Asla**; kural yeni dosyalar içindir | Yeniden adlandırma Windows'ta büyük/küçük harf tuzağı taşır (`core.ignorecase=true`, `.git/config:7`). | — |
| TB-19 | `lib/` karışıklığı, `constants`/`config` çakışması (M-10) | ~1 saat | Düşük. | **Asla** (kuralla yönet) | — | — |
| TB-20 | UI metni 4+ yerde | ~3 saat | Yalnızca çok dil desteği (E8) gelirse. | **Sonra, tetik E8** | — | — |
| TB-21 | B14 koyu mod sabit renkleri | (a) 1 satır `app.json` + K4. (b) ~2 saat | Koyu modlu her testçide düşük kontrastlı bir ekran. Kapalı deneme bu kullanıcılarla başlar. | **Karar Batuhan'ın; öneri (a) şimdi** | Test boyutunu yarıya indirir, v1 için yeterli. | (b) sonra da yapılabilir, (a) geri alınabilir bir kapı. |
| TB-22 | Kart açılışında gerçek blur yerine yaklaşık blur | `expo-blur` + K4 | Ürün cilası. | **Asla** (ürün isterse ayrı karar) | — | — |
| TB-23 | Dependabot ↔ Expo SDK hizası | ~15 dk (`dependabot.yml`) | Remote açıldığı gün haftalık kırık PR'lar gelir. | **Şimdi** (remote açılmadan önce) | Ucuz; sınıf 7. | Dosya revert edilir. |

**İlk preview APK öncesi "şimdi" paketi** (tek derleme, tek K4 smoke): TB-2, TB-4, TB-6, TB-7, TB-8, TB-23 ve Batuhan onaylarsa TB-21(a). Toplam yaklaşık yarım gün.

---

## 5. Süreç

### 5.1 Repo yapısı ve `docs/` büyümesi

- `docs/` içinde şu an 14 üst düzey belge, `ux/` altında 4 belge ve yeni `inceleme-2026-09-25/` var. Belgeler tür olarak karışık: karar, kanıt, ürün, yayın.
- **Karar:** Eski belgeler **taşınmaz**. `CLAUDE.md`, `plan.md` ve verifier bu yollara başvuruyor; taşımak bağlantıları kırar (ikinci derece etki). Onun yerine:
  1. `docs/README.md` dizini: belge başına bir satır, türü (karar/kanıt/ürün/yayın) ve durumu (güncel/tarihsel).
  2. **Yeni** kanıt belgeleri `docs/kanit/YYYY-MM-DD-<konu>.md` biçiminde. Başlıkta commit SHA, çalışma ağacının temiz olup olmadığı, cihaz/emülatör ve derleme türü (debug/release) yazar.
  3. `docs/tuzak-arsivi.md` (1.2).
- **Yanlış çıkarsa:** Dizin güncel tutulmazsa belge bayatlar. Maliyeti düşük: dizin bir liste, yeni belge eklendikçe bir satır.

### 5.2 Belge zinciri senkronu (Claude SDLC ↔ haftik)

- **Durum (K1):** Kopyalar ayrışmış (Ç-11). SDLC spec'inde S2, S3, S5 ve S8 netleştirme bölümleri yok; SDLC plan'ında hiç "Uygulama notu" yok.
- **Karar (öneri):** 2026-09-22'den itibaren **haftik deposu kanonik**. SDLC'deki `spec-haftalik-hayat-karti.md` ve `plan-haftalik-hayat-karti.md` dosyalarının başına tek satır eklenir: "Donmuş onay kopyası (`f33af0d`). Güncel sürüm: haftik deposu `spec.md`/`plan.md`." İki yönlü senkron **yapılmaz**, çünkü iki kanonik kaynak = çift mantık. Proje `spec.md`/`plan.md` başlıklarındaki "kopyasıdır" ifadesi "onaylı halden türeyen canlı sürüm; netleştirmeler burada, onay noktası commit'tir" olarak değişir.
- SDLC deposunu düzenlemek Batuhan'ın işi (ayrı depo). Bu inceleme o depoya dokunmadı.
- **Yanlış çıkarsa:** Playbook'u okuyan biri SDLC kopyasını güncel sanar. Başlık satırı bu riski kapatır. Geri dönüş: başlığı kaldırmak.

### 5.3 CI: ne kanıtlıyor, ne kanıtlamıyor

**Bugün:** Hiçbir şey kanıtlamıyor. Remote yok (`.git/config`); CI bir kez bile koşmadı. Koşsaydı Node 20'de `node:sqlite` olmadığı için veri testleri kırılırdı. Dependabot da remote olmadan çalışmıyor.

**Önerilen minimum** (remote açılınca; remote açmak ve GitHub hesabı Batuhan'ın kararı):

```yaml
# ci.yml değişen kısımlar (öneri)
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'      # 24
          cache: 'npm'
      - run: npm ci                        # engine-strict ile yanlış Node'da burada kırılır
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test -- --ci
      - name: Üretim paketi — dev menü yok
        run: |
          npx expo export --platform android --output-dir dist-ci
          ! grep -rE "dev-time-menu|currentWeekSunday2000" dist-ci
  tz:
    # TB-5 yapıldıktan sonra açılır
    strategy: { matrix: { tz: [America/New_York, Europe/Berlin] } }
    steps: [..., { run: 'npx cross-env TZ=${{ matrix.tz }} HHK_TZ_RUN=1 jest __tests__/domain' }]
```

| CI kanıtlar (K2/K3) | CI kanıtlamaz (K4/K5 gerekir) |
|---|---|
| Tipler, lint, domain mantığı, gerçek SQLite ile veri katmanı, sınır ve politika meta-testleri, dev menünün üretim JS paketinde olmadığı | Native derleme, birleşik manifest ve izinler, bildirim teslimi, izin diyaloğu, paylaşım sayfası, dosya sisteminin gerçek yolları, ekran düzeni ve güvenli alan, release derlemesi farkları, ağ trafiği |

`expo-doctor` CI'a **eklenmez**. Ağ gerektiriyor ve Expo yama yayınladığı her gün kırmızıya döner; aylık elle çalıştırılır. **Yanlış çıkarsa:** CI dakika kotası dolar. Tek iş ve önbellekle bu olası değil. Geri dönüş: TZ işini kapatmak.

**Remote açılmazsa yerel eşdeğer:** `package.json`'a `"verify": "npm run typecheck && npm run lint && npm test"` eklenir. Batuhan commit'ten önce bir kez çalıştırır. Pre-commit hook **önerilmez**: 780+ test her commit'i yavaşlatır ve atlanmaya başlar.

### 5.4 Commit ve dal stratejisi (tek kişi)

- **Acil:** Çalışma ağacında 32 değiştirilmiş + 15 izlenmeyen dosya var (emülatör turu). Bu turun K4 kanıtları (`docs/emulator-tekrar-dogrulama.md`) hiçbir commit'e bağlanamıyor, üstelik git'i olmayan `C:\hhk\haftik` kopyasında üretildi. **Batuhan'ın ilk işi bunu commit'lemek.** Aynı dosyalar (`today.tsx`, `settings.tsx` vb.) birden fazla bulguya dokunduğu için bölmek pahalı. Öneri: tek commit, mesajda BLG/YB/B listesi. Bundan sonra daha küçük commit'ler.
- **Model:** `main` üzerinde doğrudan (trunk) çalışma, küçük commit'ler. Kısa ömürlü dal yalnızca üç durumda: (1) bağımlılık yükseltmesi (TB-2/TB-4), (2) proje taşıma (§6), (3) bir worktree ile paralel iş.
- **Commit mesajı:** `<dilim|bulgu>: <ne>`, ör. `S10/BLG-04: özet pill yüksekliği 56px`. Böylece `git log --grep BLG-04` bulgu → kod izini verir.
- **Kanıt ↔ commit bağı (kural):** Her K4/K5 belgesinin başlığında `Commit: <sha> (ağaç temiz: evet/hayır)` yazar. "Hayır" ise kanıt o commit'e değil, yerel bir duruma aittir ve böyle etiketlenir.
- **Yanlış çıkarsa:** Küçük commit disiplini aksarsa tek büyük commit olur. Maliyeti bisect yapılamaması; bugünkü durumdan kötü değil.

### 5.5 Sürüm etiketleri

- `app.json` `version: 1.0.0` (versionName). `eas.json` `appVersionSource: remote` ile versionCode'u EAS yönetir.
- Etiketler (annotated): dağıtılan her APK/AAB için `v1.0.0-preview.N` (arkadaş çevresi), `v1.0.0-closed.N` (Play kapalı test), `v1.0.0` (yayın). Etiket mesajında EAS build ID, versionCode ve profil yazar.
- Neden: bir testçi hata bildirdiğinde "hangi kod?" sorusunun tek cevabı olur. Deneme raporu (S9) sürüm taşımıyorsa, bu kullanıcının hangi APK'yı kullandığını gösteren tek iz budur.
- Etiket oluşturmak da bir git işlemi; Batuhan atar.

---

## 6. ASCII yol / araç zinciri: kalıcı çözüm

**Sorun (K4, emülatör turundan):** `C:\Users\Pc\Desktop\Geliştirme için\...` yolu hem Türkçe karakter (ş) hem boşluk içeriyor; Gradle/RN derlemesi burada kırılıyor. Bugünkü çözüm: `robocopy /MIR` ile `C:\hhk\haftik` kopyasına tek yönlü senkron.

**Bugünkü çözümün faizi (K1):**
1. `/MIR` hedefteki fazla dosyaları siler: kopyada yapılan her düzenleme (bir ajan ya da hızlı bir deneme) sessizce kaybolur.
2. `C:\hhk\haftik`'te `.git` yok (Glob). Emülatör kanıtları sürümsüz bir ağaç üzerinde.
3. Senkron unutulursa **eski kodda K4 kanıtı** üretilir. Bu en tehlikeli hata, çünkü kanıt merdiveninin kendisini bozar.
4. Her `package.json` değişikliğinde iki ayrı `npm ci` gerekir.

**Seçenekler:**

| Seçenek | Artı | Eksi / risk | Karar |
|---|---|---|---|
| A. Mevcut robocopy düzeni | Hiçbir şey taşınmaz | Yukarıdaki 4 faiz kalemi sürer | Red |
| **B. Repoyu `C:\dev\haftik`'e taşı (tek kopya)** | Tek gerçek kaynak. Kısa yol, Windows 260 karakter sınırına ve CMake `.cxx` yollarına da iyi gelir. Kanıt = commit. | Mutlak yol referansları güncellenmeli (`CLAUDE.md:668-676`, `verifier.md:39`, plan/docs'taki birkaç yer). Claude Code proje belleği ve oturum geçmişi yola göre tutulur (`~/.claude/projects/<kodlanmış-yol>`); yeni yolda sıfırdan başlar. `node_modules` ve `android/` yeniden üretilmeli. | **Öneri** |
| C. `subst H: "C:\Users\Pc\Desktop\Geliştirme için"` sanal sürücü | Dosya taşınmaz | Oturum başına yeniden kurulmalı (kalıcı değil). Java/Gradle'ın kanonik yolda `subst`'u çözüp çözmediği **doğrulanmadı (K0)**. İki farklı yol aynı depoyu gösterir; araçların önbellekleri karışabilir. | Yedek (B yapılamazsa, önce denenmeli) |
| D. Junction / symlink (`mklink /J`) | Kolay | Node `realpath` junction'ı çözer; Metro/Gradle büyük olasılıkla yine Unicode yolu görür (K0) | Red |
| E. Üst klasörü yeniden adlandır (`Geliştirme için` → `gelistirme`) | Tüm projeler düzelir | Diğer projelerdeki `venv`/`.venv` mutlak yollar taşır (`CMPE491_AI_Camera\venv`, `Leta_Takip\.venv`), bunlar kırılır. Yıkıcı etki alanı geniş. | Red |

**B için adımlar** (sıra önemli; her adımı Batuhan yürütür ya da onaylar):
1. Çalışma ağacını commit'le (§5.4). `git status` temiz olmalı.
2. Metro, emülatör derlemeleri, VS Code ve Explorer önizlemesi kapalı olmalı (Windows dosya kilitleri).
3. Klasörü `C:\dev\haftik` konumuna **taşı** (Explorer ile kes-yapıştır ya da `robocopy /MOVE /E`). `.git` ve izlenmeyen dosyalar birlikte gelir. `git clone` **önerilmez**: izlenmeyen dosyaları getirmez ve `origin`'i eski yola bağlar.
4. `node_modules/`, `android/`, `.expo/` sil; ardından `npm ci`, `npx expo prebuild --platform android --clean`.
5. `npm run verify` (typecheck, lint, test); `npm run android` ile emülatör smoke testi (Bugün → Kaydet → Hafta → Kart).
6. Belge güncellemeleri: `CLAUDE.md`'deki robocopy kaydı arşive gider, Commands'a yeni yol yazılır; `verifier.md:39`; ASCII yol assert betiği eklenir (sınıf 7 mekanik kuralı).
7. `C:\hhk\haftik` ve eski Desktop klasörü 2 hafta dokunulmadan kalır, sonra Batuhan'ın onayıyla silinir (yıkıcı işlem).
8. İsteğe bağlı: Claude Code proje belleği dosyaları varsa eski `~/.claude/projects/...` klasöründen yenisine elle kopyalanır.

**Maliyet:** yaklaşık 1-2 saat. **Yanlış çıkarsa** (yeni yolda beklenmedik bir araç sorunu çıkarsa): eski klasör 7. adım gereği yerinde durduğu için geri dönüş klasörü geri taşımak. Veri kaybı riski 1. adım sayesinde sıfır.

**Mekanik koruma** (hangi seçenek seçilirse seçilsin): `npm run android` ve `ios` betiklerinin başına `node scripts/assert-ascii-path.js` eklenir. Betik `process.cwd()` içinde ASCII dışı karakter ya da boşluk bulursa "Bu yolda Gradle kırılır; bkz. CLAUDE.md" mesajıyla çıkar. Böylece aynı hata bir daha aranmaz, araç yakalar.

---

## 7. Devir

```
Durum:        bitti (inceleme); hiçbir kod/belge değiştirilmedi, yalnızca bu dosya yazıldı
Yapıldı:      CLAUDE.md ayıklama taslağı (§1.4-1.9); mimari bulgular M-1..M-12; 7 sınıf taraması;
              TB-1..TB-23; süreç (docs, SDLC senkronu, CI, commit, etiket); ASCII yol kararı
Kanıt:        tamamı K1 (kaynak/belge/node_modules okuma + grep). Komut çalıştırılmadı; test/lint
              sayıları belgelerden alındı (K0)
Açık / risk:  (1) node:sqlite bayraksız sürümü (22.13) bellekten, doğrulanmalı. (2) useAnimatedValue ile
              react-hooks/refs yanlış pozitifinin kalkacağı hipotez; lint ile doğrulanmalı. (3) subst
              seçeneğinin Gradle ile çalışıp çalışmadığı K0. (4) reanimated kaldırma K1 güvenli, K4 şart
Karar gerek:  commit (emülatör turu), GitHub remote/CI, N-7 (öneri: kalsın, v2 yakıldı), B14 (öneri:
              açık tema), spike + reset-project silme onayı, proje taşıma (öneri: C:\dev\haftik),
              SDLC deposunda "donmuş kopya" başlığı, ortak-standartlar'a "etkisiz güvence" maddesi
Sonraki:      mobile-engineer -> "şimdi" paketi (TB-2/4/6/7/8/23) + boundaries/dependency-policy
              meta-testleri; qa-engineer -> TB-5 TZ test yeniden tasarımı ve sahte platform deseni (M-7/M-8);
              devops-engineer -> .nvmrc/engines/CI/Dependabot; Batuhan -> CLAUDE.md ayıklamasını
              bu taslaktan uygulama onayı
```

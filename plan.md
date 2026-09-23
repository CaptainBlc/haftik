# Plan: Haftalık Hayat Karnesi — Build aşaması uygulama planı
Kaynak: `spec-haftalik-hayat-karti.md` (ve `intent/2026-09-20-haftalik-hayat-karti.md`)
Status: accepted — Batuhan tarafından Claude SDLC deposunda onaylanıp commit'lendi (`f33af0d`, 2026-09-21/22). Bu dosya o onaylı halin bu depoya kopyasıdır.
Şablon: `plan.md` (başlıklar birebir korunmuştur; `plan.md` şablon olarak dokunulmadan kalır.)

> Bu plan yalnızca sıralar ve görünür kılar; mimari ve teknoloji kararları spec'tedir, burada
> yeniden açılmaz. Spec'te "plan aşamasında doğrulanacak" denen her şey aşağıda ilgili dilime
> bir görev olarak bağlanmıştır. Karar gerektiren noktalar "Kapı" (K1, K2 ...) olarak işaretlidir.
> Not (çözüldü, 2026-09-22): spec ve plan başlıklarındaki "Status: draft" metni, Claude SDLC
> deposundaki gerçek onay+commit'ten (`f33af0d`) sonra güncellenmemiş bayat bir metindi; "accepted"
> olarak düzeltildi. Bu depodaki `spec.md`/`plan.md` onaylı içeriğin kopyasıdır, taze onay bekleyen
> bir taslak değildir. Gerçek onay noktası her zaman commit'tir, bu başlık satırı değil.

## Context

**Neden:** Intent'in başarı ölçütü (4 haftalık kapalı denemede kartı gören kullanıcıların >= %25'i kartı
kendiliğinden paylaşır; ek gösterge D7 check-in oranı) ancak çalışan bir uygulamayla ölçülebilir. Spec
mimariyi kilitledi: **tek mobil uygulama, sunucu/hesap/ağ çağrısı yok**, Expo (React Native) + TypeScript,
cihazda SQLite, yerel bildirim, `react-native-view-shot` ile cihazda 9:16 PNG kart, sistem paylaşım sayfası.

**Spec'ten devralınan kararlar (yeniden tartışılmaz):**
- E1: Seçenek A (cihaz içi sayaçlar + kullanıcı tetikli deneme raporu); B ve C v1'de yok.
- E2: **Android-first.** Kod tabanı ortak; geliştirme ve iç test önce Android'de; iOS gerçek cihaz testi Apple üyeliğine bağlı ayrı kilometre taşı.
- E4(b): ilk kart eşiği >= 3 dolu gün, sonraki haftalar >= 4.
- Güvenlik madde 6: yedekten hariç tutma (Android yedeği kapalı, iOS'ta dosya iCloud yedeğinden hariç); Expo'daki tam yolu doğrulanana kadar "tamam" sayılmaz.
- Süre: 33-42 iş günü (planlama değeri ~38), tam zamanlı varsayımıyla 7-9 hafta; iş yükünün yarısı ayrılırsa 14-18 hafta.

**Kapsam sınırı:** Spec'in "Dahil değil (v2+)" listesi aynen geçerlidir. Bu plan hiçbir yeni özellik eklemez.
İş sırasında kapsam genişletme talebi gelirse (ör. geçmiş kartlar galerisi, analitik SDK'sı, OTA güncelleme
açılması) sessizce plana eklenmez; "bu kapsam dışı, ayrı bir intent.md mi olsun?" diye Batuhan'a sorulur.

### Kod nerede yaşayacak (KARAR: Batuhan — K1)

**Öneri: ayrı bir klasör ve ayrı bir git deposu: `C:\Users\Pc\Desktop\haftalik-hayat-karti`.**

Gerekçe:
1. `Claude SDLC` deposu playbook/dokümantasyon deposudur; kökündeki `CLAUDE.md`, `plan.md`, `spec.md`,
   `verifier.md` şablon ya da başka ürünlerin (SyncBoard vb.) belgeleridir. Uygulama kodu buraya girerse
   `CLAUDE.md` "Commands" bölümü hangi ürünün komutlarını taşıyacağını bilemez; `verifier` yanlış komutları çalıştırır.
2. Expo projesi kendi `node_modules`, `app.json`, `eas.json`, CI iş akışı ve Dependabot yapılandırmasını getirir;
   bunların playbook deposunun `ci.yml`/`dependabot.yml` şablonlarıyla çakışmaması gerekir.
3. Ürünün kendi commit geçmişi, kendi PR/inceleme izi ve (ileride) mağaza sürüm etiketleri olur; playbook deposunun geçmişi kirlenmez.
4. Playbook'un "her yeni ürün = new-product-bootstrap" kalıbıyla uyumludur.

Elenen alternatif: bu depoda alt klasör (`apps/haftalik-hayat-karti/`). Tek avantajı belge zincirinin
(intent -> spec -> plan) aynı yerde durması; bedeli yukarıdaki 1-3. Belge zinciri zaten bootstrap ile yeni depoya
kopyalanabilir (aşağıda). Karar Batuhan'ındır; başka bir yol/ad verirse plandaki yollar buna göre okunur.

**Yeni depoda `new-product-bootstrap` skill'i şunları kurar** (var olanın üzerine yazmaz; hiçbir şeyi commit etmez):
`CLAUDE.md` (proje adı başlıklı; Commands / Konvansiyonlar / Mimari `<henüz tanımlanmadı>`, Doğrulama ve
Değişmez kurallar dolu), `PLAYBOOK.md`, `intent/TEMPLATE.md`, `spec.md` ve `plan.md` (boş şablon), `REVIEW.md`,
`evals/README.md`, `evals/checklist.md` (E-1..E-7, proje adına uyarlı), `.gitignore` (`.env`, `.env.*`, bağımlılık klasörleri).
Skill'in **kurmadığı**, Dilim 1'de elle yapılacaklar: Expo iskeleti, `.github/workflows/ci.yml`, `.github/dependabot.yml`,
Expo'ya özgü `.gitignore` satırları ve **proje-özel `.claude/agents/verifier.md`** (skill adım 3'e göre bu tek istisnadır).

**Belge zinciri yeni depoya nasıl taşınır (öneri):** kaynak-gerçek Claude SDLC'de kalır; yeni depoya Dilim 1'de
`intent/2026-09-20-haftalik-hayat-karti.md`, onaylı spec (`spec.md` olarak) ve **bu planın onaylı hali `plan.md` olarak**
kopyalanır — çünkü `verifier` `plan.md`'yi oradan okuyacaktır. Kural sürer: uygulama plandan saparsa yeni depodaki
`plan.md` aynı commit içinde güncellenir. CLAUDE.md'nin Commands/Konvansiyonlar bölümleri Aşama 3'te (Dilim 1'in
sonunda, komutlar gerçekten çalışır hale gelince) yazılır; "Bilinen tuzaklar" gerçek hatalardan beslenir.

## Değişecek dosyalar

**Bu depoda (`Claude SDLC`):** yalnızca bu dosya: `plan-haftalik-hayat-karti.md` (yeni). `plan.md`, `spec.md`, `CLAUDE.md`,
`PLAYBOOK.md` değişmez.

**Yeni depoda (`haftalik-hayat-karti`), tümü yeni:** (klasör adları öneridir; Expo şablonunun varsayılanına uyulur, Dilim 1'de kesinleşir)

```
CLAUDE.md, PLAYBOOK.md, REVIEW.md, .gitignore          (bootstrap; CLAUDE.md komutları Dilim 1 sonunda dolar)
intent/, spec.md, plan.md, evals/                       (bootstrap + kopya belge zinciri)
.claude/agents/verifier.md                              (Dilim 1; komutlar CLAUDE.md'den okunur)
.github/workflows/ci.yml, .github/dependabot.yml       (Dilim 1: tsc --noEmit, ESLint, Jest)
app.json, eas.json, package.json, tsconfig.json         (SDK sürümü Dilim 1'de sabitlenir, expo-updates durumu doğrulanır)
app/                     expo-router ekranları: onboarding, bugun (check-in), hafta, kart, ayarlar   (Dilim 6-7)
src/domain/              types.ts, clock.ts, week.ts, score.ts, delta.ts, titles.ts, copy.ts,
                         notify-plan.ts, metrics-calc.ts     (saf TS; UI/SQLite/OS import etmez)  (Dilim 2-3, 8, 9)
src/content/tr.ts        kimlikli metin havuzu: unvanlar, satırlar, özet şablonları      (Dilim 3 iskelet, Dilim 4 içerik)
src/data/                db.ts, migrations.ts, checkin-repo.ts, card-repo.ts, setting-repo.ts,
                         metric-repo.ts, delete-all.ts        (Dilim 5, 9)
src/notify/              scheduler.ts       (yalnızca plan çıktısını expo-notifications'a uygular)  (Dilim 8)
src/card/                CardView.tsx, capture.ts, share.ts, hide-state.ts                (Dilim 7)
src/metrics/             events.ts, report.ts           (Dilim 9)
src/config/constants.ts  uygulama adı, mağaza URL'si YER TUTUCULARI — tek yerde (K4, K5)
src/dev/                 gizli zaman simülasyonu menüsü (yalnızca geliştirme derlemesinde)     (Dilim 6)
assets/                  paketlenmiş font, ikon, splash            (Dilim 7, 12)
__tests__/               domain birim testleri, repo entegrasyon testi, içerik denetim testleri
docs/ux/                 ui-ux-designer çıktısı: ekran akışı, emoji seti, kart yerleşimi, Pazar akışı    (U0)
docs/manual-checklist.md cihaz kontrol listesi (kart, bildirim, ağ)                         (Dilim 7, 8, 10, 11)
site/                    statik gizlilik politikası + akıllı mağaza bağlantısı sayfası        (Dilim 12)
```

**Mimari sözleşme ayrıntısı (spec "plan.md'de kesinleşir" dedi):** `getWeekState`, `buildCard`, `saveCheckin`,
`getCheckins`, `getCard`, `saveCard`, `deleteAllData`, `rescheduleAll`, `captureCardPng`, `shareCard` imzaları spec'teki
haliyle başlar; tip tanımları `src/domain/types.ts`'te Dilim 2'de dondurulur, sapma olursa `plan.md` aynı commit'te güncellenir.
Öneri (spec ile çelişmez, imza korunur): `rescheduleAll` içindeki karar mantığı saf bir `notify-plan.ts` fonksiyonuna ayrılır
(girdi: şimdi + hafta durumu + ayarlar; çıktı: tetikleyici listesi); `notify/scheduler.ts` yalnızca bu listeyi işletim sistemine yazar.
Böylece koşullu bildirim mantığı Jest'te, cihaz gerektirmeden test edilir.

## İşin sırası

Toplam **12 dilim + kodsuz bir UX ön adımı (U0)**. Etkin iş günü tahminleri spec E6 ile birebir tutar: dilimlerin
toplamı **33-42 gün**. Sıra, "bağımlılığı olmayan ve kendi başına test edilebilen adımlardan başla" kuralıdır:
domain -> veri -> UI -> kart/paylaşım -> bildirim -> ölçüm -> cihaz testi -> mağaza. Her dilimin sonunda:
(1) `verifier` taze bağlamla çalışır, çıktı gösterilir; (2) commit öncesi `/code-review` elle çalıştırılır (`REVIEW.md`);
(3) **commit'i Batuhan atar** ve `plan.md` işaretlenir. Test başarısızsa test değil kod düzeltilir.

Kısaltma: **MOB** = `mobile-engineer`, **ARC** = `software-architect`, **UX** = `ui-ux-designer`, **QA** = `qa-engineer`,
**SEC** = `security-reviewer`, **OPS** = `devops-engineer`. (Sunucu olmadığı için `backend-engineer` kullanılmaz; veri/domain işi MOB'dadır.)

| Dilim | Konu | Gün | Kümülatif |
|---|---|---|---|
| U0 | UX tasarım (kodsuz, S1-S3 ile paralel) | spec dışı, bkz. not | — |
| S1 | Repo, araç zinciri, erken teknik doğrulama | 3-4 | 3-4 |
| S2 | Domain A: hafta, uygunluk, seviye, delta | 2 | 5-6 |
| S3 | Domain B: unvan, satır seçimi (geçici içerikle) | 2-3 | 7-9 |
| S4 | İçerik yazımı (Claude taslak, Batuhan espri düzeltmesi) | 3 | 10-12 |
| S5 | Veri katmanı: SQLite, migration, silme, yedek ayarı | 2 | 12-14 |
| S6 | UI: onboarding, Bugün, hafta durumu, kilitli kart, ayarlar | 4-5 | 16-19 |
| S7 | Kart, gizleme, paylaşım | 5-7 | 21-26 |
| S8 | Bildirimler | 3-4 | 24-30 |
| S9 | Ölçüm sayaçları + deneme raporu | 1-2 | 25-32 |
| S10 | Android cihaz testi, cila, güvenlik son inceleme | 3 | 28-35 |
| S11 | iOS cihaz testi (Apple üyeliğine bağlı, koşullu) | 1-2 | 29-37 |
| S12 | Mağaza hazırlığı | 4-5 | 33-42 |

(Kümülatif sütun, S4 ile S5'i sıralı toplar; paralel çalışılsa da bu **efor** toplamıdır, tek kişinin inceleme yükü azalmaz.)

---

### U0 — UX tasarımı (kodsuz; S1-S3 ile aynı anda yürüyebilir)
- **Sorumlu:** UX. **Bağımlılık:** yok (yalnızca onaylı plan). **Tahmin:** spec E6'da ayrı kalem yok; UI (S6) ve kart (S7) bütçesine dahil sayıldı. Dahil değilse +1-1.5 gün ekle (Riskler'de varsayım).
- **Girdi:** spec (Ana akışlar, MVP kapsamı), E4(a), E13. **Çıktı:** `docs/ux/` — ekran akışı, **emoji seti** (4 kategori x 3 seçenek), kart 360x640 yerleşimi (unvan, 4 satır, değişim özeti, gömülü damga), kilitli kart yer tutucusu, gizleme önizleme ekranı, **Pazar günü "önce bugünü işaretle" akışı** (K3 için somut öneri, alternatifi 19:30 hatırlatma ile).
- **Bitti kanıtı:** Batuhan tasarımı okuyup onaylar (emoji seti, kart yerleşimi, Pazar akışı). Kanıt kod değil belgedir; E13'teki "UX çıktısıyla karşılaştırılmalı" notu bu adımla kapanır.
- **Neden erken:** S6/S7'nin girdisi; S1-S3'ün domain işiyle dosya çakışması yok (yalnızca `docs/ux/`).

### S1 — Repo, araç zinciri, erken teknik doğrulama (3-4 gün) — kapı: K1, K2
- **Sorumlu:** OPS (CI, EAS, bağımlılık) + MOB (Expo iskelet, spike) ; ARC gerekirse sürüm kararı için.
- **Bağımlılık:** plan onayı, **K1 (repo konumu)**, K2 (haftalık saat bilgisi, bloklamaz).
- **Yapılacaklar:**
  1. `new-product-bootstrap` çalıştır (yeni depoda). Belge zincirini kopyala (`intent/`, `spec.md`, onaylı `plan.md`).
  2. **`.claude/agents/verifier.md`'yi yeni depoda kur** (proje-özel; `CLAUDE.md` "Commands" ve "Doğrulama" bölümlerini ve `plan.md`'yi okuyacak şekilde). Bu, sonraki her dilimin "bitti" kapısıdır; kurulmadan S2 başlamaz.
  3. Expo (TS, expo-router) iskeleti; **güncel kararlı SDK sürümünü resmi dokümandan doğrulayıp sabitle** (spec bunu plan'a bıraktı); `tsconfig` strict; ESLint; `jest-expo`; Jest'te **saat dilimi sabitleme** (deterministik hafta testleri için).
  4. `ci.yml` (`tsc --noEmit`, ESLint, Jest) + `dependabot.yml`.
  5. **Doğrulamalar (spec'in "plan aşamasında doğrulanacak" listesi):** (a) EAS ücretsiz katman kotasının resmi dokümandan güncel değeri; (b) **`expo-updates`'in yapıya girip girmediği ve kapalı olduğu** (E3 varsayılan kapalı; açıksa ağ çağrısı yapar ve "ağ yok" gereksinimini bozar); (c) yedekten hariç tutma yolu: Android için app config'te yedek anahtarı ve prebuild çıktısındaki manifest, iOS için SQLite dosyasının iCloud yedeğinden hariç işaretlenmesinin Expo'daki gerçek yolu (kütüphane/config plugin/yerel kod) — **bulunamazsa K7'ye yükselt**.

     > **OPS ön-doğrulama notu (2026-09-22, WebSearch ile; resmi doküman erişimi olmadığından ikincil kaynaklarla çapraz doğrulandı — Expo hesabı açılınca `docs.expo.dev` üzerinden birebir teyit edilmeli):**
     > - **(a) EAS ücretsiz katman:** Free plan ayda **15 Android + 15 iOS build**, düşük öncelikli kuyruk (yoğun saatlerde 90+ dk bekleme olabilir), **45 dakika** build zaman aşımı, EAS Update **1.000 aylık aktif kullanıcıya** kadar ücretsiz, 100 GiB küresel CDN bant genişliği. Tek kişilik, ayda birkaç build ihtiyacı olan bu proje için yeterli görünüyor; ücretli plana geçme gerekçesi şimdilik yok. Kaynak: [Subscriptions, plans, and add-ons — Expo](https://docs.expo.dev/billing/plans/), çapraz teyit: [Expo pricing — Newly (EAS Build guide)](https://newly.app/guides/eas-build).
     > - **(b) `expo-updates` varsayılanı:** `npx create-expo-app` ile oluşturulan güncel şablonlarda `expo-updates` **varsayılan olarak paket listesine dahil değil**; OTA güncelleme istenirse elle kurulup yapılandırılması gerekiyor (bkz. [Install expo-updates in an existing project — Expo](https://docs.expo.dev/bare/installing-updates/), [EAS Update: Getting started — Expo](https://github.com/expo/expo/blob/main/docs/pages/eas-update/getting-started.mdx)). Sonuç: **E3 "v1'de kapalı" kararı ekstra bir kapatma adımı gerektirmiyor** — proje iskeleti kurulurken `expo-updates` paketi hiç eklenmezse (mobile-engineer'ın S1 iskeletinde bu paketi bilerek eklememesi yeterli) zaten devre dışı kalır. **Tek risk:** ileride başka bir bağımlılığın (ör. bir Expo şablonu/starter) `expo-updates`'i transitif olarak getirip getirmediği; S1 sonunda `package.json`'da bu paketin bulunmadığı ve `app.json`'da bir `updates` bloğu olmadığı elle teyit edilmeli (bu, CLAUDE.md "Bilinen tuzaklar"a not düşüldü).
     > - **(c) Yedekten hariç tutma — Android:** `app.json` içinde `expo.android.allowBackup: false` alanı var; bu, prebuild sırasında `AndroidManifest.xml`'e `android:allowBackup="false"` olarak yazılır (Expo'nun kendi config-plugin mod'u bunu üstlenir). Bu **tüm** uygulama verisini (SQLite dosyası dahil) Android Auto Backup'tan hariç tutar — spec'in istediğinden daha kapsamlı ama amaca uygun bir üst küme. Kaynak: [app.json / app.config.js — Expo (Configuration schema)](https://docs.expo.dev/versions/latest/config/app/). **iOS için ise resmi Expo dokümanında `expo-sqlite`'ın kendi veritabanı dosyasını iCloud yedeğinden hariç tutan hazır bir app.json alanı/config plugin seçeneği bulunamadı.** Native taraftaki mekanizma bilinen bir Apple API'si (`NSURLIsExcludedFromBackupKey` / `setResourceValue:forKey:error:` dosya özniteliği), ama Expo tarafında bunu SQLite dosyasına uygulayan hazır bir paket ya da `app.json` alanı görülmedi; muhtemel yol **özel bir config plugin yazıp `Info.plist`/native koda native modül veya `expo-build-properties` benzeri bir mekanizmayla dosya özniteliğini uygulamalıca akış içinde (app açılışında JS'ten dosya sistemine bu bayrağı basan bir native modül) set etmek** — bu S1'de doğrulanmadı, **belirsiz** kaldı. **K7'nin iOS kısmı açık bırakılıyor:** Android tarafı (allowBackup) S5'te doğrudan uygulanabilir durumda; iOS tarafı için S1'de kesin bir "Expo'da hazır yol" bulunamadı, bu nedenle plan'ın öngördüğü gibi K7 gate'i iOS için S10/S11'e kadar "doğrulanmadı" statüsünde kalmalı ve gerekirse Batuhan'a (native kod/config plugin maliyeti kabul edilir mi, yoksa iOS'ta bu garanti verilemez mi) geri dönülmeli.
  5b. **Kısa spike (~0,5 gün, Android):** 360x640 sabit bir `View`'i paketlenmiş fontla (ğ ş ı İ ö ü ç) 1080x1920 PNG'ye yakala; boş bir yerel bildirimi tarih tetikleyicili planla. Amaç: S7/S8'in en riskli varsayımlarını erken görmek. Sonuç atılır ya da S7'ye taşınır; ürün kodu değildir.
  6. Android geliştirme yolu (emülatör + gerçek cihaz, dev build) çalışır. CLAUDE.md Commands bölümü gerçek komutlarla doldurulur.
- **Girdi/çıktı dosyaları:** girdi = boş klasör + belge zinciri; çıktı = yukarıdaki "Değişecek dosyalar" kök yapısı, `verifier.md`, `ci.yml`, `dependabot.yml`, `CLAUDE.md` (dolu komutlar).
- **Bitti kanıtı:** `npm test` (boş ama çalışan Jest), `tsc --noEmit`, lint çıktıları gösterilir; CI ilk kez yeşil; Android'de boş uygulama açılır (ekran görüntüsü); spike PNG dosyası ve bildirim denemesi sonucu yazılı; (a)(b)(c) doğrulama notları `plan.md`'ye işlenir. `verifier` çalıştırılıp çıktısı gösterilir.
- **Paralel:** U0 ile paralel (dosya çakışması yok).

### S2 — Domain A: saat, hafta, uygunluk, seviye, delta (2 gün)
- **Sorumlu:** QA (önce **uç durum listesi**: hafta sınırları, uygunluk sınırları) sonra MOB (uygular). **Bağımlılık:** S1.
- **Girdi:** spec "Hesaplama kuralları". **Çıktı:** `src/domain/types.ts`, `clock.ts` (enjekte edilebilir saat), `week.ts` (`getWeekState`), `score.ts` (seviye eşikleri 1,67 / 2,33), `delta.ts` (+/-0,5; geçen hafta < 2 dolu gün ise NULL) ve `__tests__/domain/*`.
- **Kurallar:** domain UI/SQLite/OS import etmez; hafta Pazartesi-Pazar; "dolu gün" = dört kategori de seçili.
- **Bitti kanıtı:** Jest çıktısı gösterilir; testler şunları içerir: **Pazar 23:59 / Pazartesi 00:00**, yıl sonu, ay sonu; **uygunluk normal hafta 3 gün = uygun değil / 4 gün = uygun; ilk kartta 2 gün = değil / 3 gün = uygun**; Pazar 19:59 / 20:00 sınırı; uygun ama açılmamış geçen hafta kartı Pazartesi'den sonra açılabilir kalır; seviye eşiklerinin sınır değerleri (1,67 / 2,33 tam sınırı); delta NULL durumu. Test dosyaları sonradan "düzeltme" için değiştirilmez.
- **Paralel:** U0 ile.

### S3 — Domain B: unvan seçimi, satır/özet seçimi (2-3 gün)
- **Sorumlu:** MOB (kural motoru) + QA (kapsama testi tasarımı). **Bağımlılık:** S2.
- **Girdi:** spec "Unvan seçimi", "Satırlar", "Özet/değişim satırı", "Ton kuralı". **Çıktı:** `titles.ts` (öncelik sıralı kurallar; bir önceki haftanın unvanıyla aynıysa sıradaki eşleşen), `copy.ts` (`week_start` tabanlı sabit tohum; ardışık haftada aynı varyant yok), `content/tr.ts` **iskeleti ve geçici metinlerle** (30-40 kimlikli unvan yapısı, >= 36 satır yuvası, ~6 özet şablonu), `buildCard` birleştirmesi; testler.
- **Bitti kanıtı:** Jest çıktısı gösterilir: **81 seviye kombinasyonunun tamamı için (ve özel durumlarda) en az bir unvan döner, hiçbiri boş kalmaz**; aynı `week_start` ile `buildCard` iki kez çağrılınca özdeş; önceki hafta aynı unvan tekrar seçilmez; gizlenen kategoriden unvan türetilmez kuralı için gerekli veri yapısı (satır gizleme, unvan girdisini etkilemez) not edilir. **Metin denetim testleri (satır <= ~60 karakter, hiçbir metinde rakam yok) bu dilimde yazılır** ve geçici içerikle geçer; S4'te gerçek içerikle tekrar koşar.
- **Not:** Geçici içerik "gerçek" sayılmaz; kart ekranı (S7) S4 bitmeden de çizilebilir, ama paylaşıma hazır demek için S4 şart.

### S4 — İçerik yazımı (3 gün) — kapı: yok (K8 içerik onayı Batuhan)
- **Sorumlu:** MOB (Claude taslak, tutarlılık) + **Batuhan (espri düzeltmesi, insan girdisi)**; SEC yalnızca ton kuralı/sağlık iddiası taraması için.
- **Bağımlılık:** S3 (yapı ve testler). **Çıktı:** `content/tr.ts` gerçek metinlerle: 30-40 unvan (~12 temel + ~20-28 özel), >= 36 satır (kategori x seviye x >= 3 varyant), ~6 özet şablonu.
- **Bitti kanıtı:** S3'teki 81 kombinasyon, uzunluk ve rakam testleri gerçek içerikle **yeniden çalıştırılır, çıktı gösterilir**; Batuhan metni okuyup onaylar; ton denetimi: tanısız, tavsiyesiz, tıbbi/sağlık iddiası ve utandırma yok (el ile okuma, madde madde). Not: rakam testi yalnızca hane işaretini yakalar; "ham sayı yok" ruhu için sayı **sözcükleri** ve tutar/konum çağrışımları el ile taranır.
- **Paralel (worktree adayı #1, S5 ile):** yalnızca `src/content/` ve `__tests__/content/`'a dokunur.

### S5 — Veri katmanı (2 gün) — kapı: yedekleme doğrulaması (K7)
- **Sorumlu:** MOB. **Bağımlılık:** S2 (tipler). S3/S4'e bağımlı değil.
- **Girdi:** spec "Veri modeli". **Çıktı:** `data/` altında `db.ts`, `migrations.ts` (`PRAGMA user_version`, numaralı migration), `checkin-repo.ts`, `card-repo.ts` (`saveCard` yalnızca ilk açılışta; sonra değişmez), `setting-repo.ts`, `delete-all.ts` (dört tablo + planlı bildirim iptal kancası); tablolar `checkin`, `weekly_card`, `setting`, `metric_event` (metric tablosu burada oluşur, kullanımı S9'da). Yedekten hariç tutma yapılandırması **uygulanır**.
- **Bitti kanıtı:** repo entegrasyon testi çıktısı gösterilir: CHECK 1..3 kısıtı, günde tek satır (PRIMARY KEY), bugün/dün düzenleme penceresi, `weekly_card` ikinci kez yazılamaz, hafta aralığı sorgusu, "ilk kart" tespiti (`weekly_card` boş = ilk kart), `deleteAllData` dört tabloyu boşaltır, migration v1'den v2'ye örnek. **Yedekleme:** doğrulama yöntemi S1'de bulunan yolla gösterilir (prebuild manifest çıktısı + Android gerçek cihazda kanıt yöntemi); doğrulanana kadar S5 "tamam" sayılmaz. iOS tarafı yapılandırması kodda hazır ama gerçek doğrulama S11'e kalır (K9).
- **Teknik not:** Jest ortamında `expo-sqlite` yerel modül olduğundan entegrasyon testi için bir bellek-içi SQLite sürücüsü (repo'yu ince bir arayüz arkasında tutup test sürücüsü takmak) gerekebilir; seçimi MOB yapar, spec'te bir sapma değil bir test-altyapı ayrıntısıdır. Bkz. Riskler #6.
- **Paralel (worktree adayı #1, S4 ile):** yalnızca `src/data/` ve `__tests__/data/`.

### S6 — UI: onboarding, Bugün, hafta durumu, kilitli kart, ayarlar (4-5 gün) — kapı: U0 onayı
- **Sorumlu:** MOB (uygular) + UX (uyum kontrolü). **Bağımlılık:** S2, S5, U0.
- **Girdi:** `docs/ux/`, domain + repo. **Çıktı:** `app/` altında onboarding (veri cihazda kalır, telefon değişince taşınmaz metni — güvenlik madde 6; bildirim izni doğru anda), Bugün ekranı (4 kategori x 3 emoji, tek Kaydet, bugün/dün düzenleme), hafta durumu ("kart için X gün kaldı"), **bulanık kilitli kart (gerçek metin çizilmez, yer tutucu içerik)**, ayarlar (hatırlatma saati/aç-kapa, "Tüm verilerimi sil", gizlilik bağlantısı yer tutucusu; deneme raporu düğmesi S9'da). `src/dev/` gizli zaman simülasyonu menüsü (yalnızca geliştirme derlemesinde; üretimde bulunmadığı S10'da doğrulanır).
- **Bitti kanıtı:** Android cihaz/emülatörde elle senaryo listesi çıktısı (ekran görüntüleri): 4 gün doldur -> kilitli kart açılışı (debug menüsüyle Pazar 20:00'ye ilerleterek); ilk kart 3 gün; bugün/dün düzenleme, daha eski gün düzenlenemez; "Tüm verilerimi sil" sonrası ilk açılış durumu; kilitli kartta gerçek metin yok (ekran görüntüsü + bileşen testi); **büyük yazı tipi / erişilebilirlik ölçeğinde** uygulama ekranları elle kontrol (E13); Bugün akışı ~8 sn hedefi kronometreyle. Bileşen/ekran mantığı testleri (varsa) Jest çıktısıyla. `verifier` çıktısı.
- **Not:** Pazar günü akışı (K3) bu dilimde yalnızca "kart açılışı bugünü ister mi" karar noktası olarak bırakılır; kartın dondurulması S7'dedir. K3 kararı S6 başlamadan alınırsa S6'ya girer.

### S7 — Kart, kilitli kart, gizleme, paylaşım (5-7 gün) — kapı: K3 (E4a), K4 (E8, yer tutucuyla ilerlenebilir), K5 (E5, yer tutucuyla)
İki alt dilim; ayrı commit'ler:

**S7a — CardView + PNG yakalama + font + kartın açılışı/dondurulması (3-4 gün)**
- **Sorumlu:** MOB + UX (yerleşim), **Bağımlılık:** S3, S4 (içerik), S5, S6, U0, **K3 kararı** (kart ilk açılışta Pazar günü bugünkü check-in yoksa önce check-in ister; ya da 19:30 alternatifi).
- **Çıktı:** `src/card/CardView.tsx` (mantıksal 360x640, çıktı 1080x1920; **gömülü damga CardView'in içinde çizilir**, kullanıcı katmanı değil), `capture.ts` (`captureCardPng`), paketlenmiş font, kart açılış akışı (Pazar 20:00'den sonra + uygunlukta ilk açılışta `buildCard` -> `saveCard` ile dondur; aynı hafta tekrar açılınca aynı görsel).
- **Bitti kanıtı:** Android'de gerçek cihaz + emülatörde **en az 3 farklı ekran boyutu**: Türkçe karakter, taşma, emoji görünümü, PNG boyutu 1080x1920; aynı hafta iki kez açılan kartın görsel ve metin özdeşliği; içerik havuzu değiştirilse bile dondurulmuş eski kartın değişmediği entegrasyon testi çıktısı; ekran görüntüleri `docs/manual-checklist.md`'ye eklenir. **iOS'a özgü kod minimumda:** yalnızca yakalama/paylaşım kütüphanelerinin varsayılan davranışı; platforma özel dallanma (`Platform.OS`) her eklendiğinde plan'da not düşülür (E2 gereği). iOS görünümü S11'e kadar bilinmez (Riskler #2).
- **Uygulama notu (S7a tamamlandı, 2026-09-23, MOB) — kod dilimi bitti, cihaz doğrulaması S10/S11'e kalıyor:**
  - **Font seçimi:** Google Fonts "Inter" (`@expo-google-fonts/inter`, MIT/OFL), yalnızca 3 ağırlık alt-yol (subpath) importuyla eklendi (`400Regular`, `700Bold`, `400Regular_Italic`) — kök paket importu TÜM ağırlıkları (~6MB) bundle'a katar, subpath yalnızca ihtiyaç duyulanı katar. Yeni bağımlılık, ağa veri göndermez (yalnızca statik `.ttf` varlıkları), `npx expo-doctor` 21/21 yeşil kaldı. Emoji paketlenmedi (sistem emoji fontu kullanılır, `CardView.tsx`'in `emoji` stili bilerek `fontFamily` almaz).
  - **`captureCardPng` imza sapması (dokümante, `src/card/capture.ts` başlığında ayrıntılı):** `react-native-view-shot` yalnızca zaten render edilmiş bir View'in ref'ini yakalayabildiğinden, fonksiyon `(snapshot: CardSnapshot) => Promise<string>` yerine S1 spike'ındaki (`captureCardSpike(ref)`) ile aynı desende `(ref: RefObject<ViewShotRef | null>) => Promise<string>` alır. Spec'in `hiddenLines` parametresi bu dilimde yok, S7b'de eklenecek.
  - **Blur→net geçiş yaklaşık uygulandı:** `expo-blur` (veya benzeri) yeni bir native bağımlılık bu dilimde eklenmedi; `CardRevealView.tsx` gerçek gaussian blur yerine yalnızca opaklık crossfade'i kullanır (dokümante edilmiş, kasıtlı sadeleştirme). Gerçek blur istenirse S10 cila dilimine bırakılabilir.
  - **K3 (Pazar çakışması) gerçek akışa bağlandı:** `src/lib/card-flow.ts` (`needsTodayCheckinBeforeCard`) + `src/card/open-card.ts` (`openOrBuildCard`) + `src/app/card/[weekStart].tsx` + `src/components/sunday-checkin-required-view.tsx` (`docs/ux/pazar-akisi.md` "Ara ekran") + `today.tsx`teki `returnToCardWeekStart` ile "Kaydet sonrası otomatik devam". `week-status-copy.ts`teki `lockedBoxCaption` dördüncü bir duruma (`needsTodayCheckin`) kavuştu.
  - **`buildCard`in S3'te dokümante edilen `prevVariants` sapması kapandı:** `open-card.ts` artık önceki haftanın dondurulmuş kartını (`getCard(prevWeekStart)`) okuyup satır/özet tekrar-önleme zincirini gerçek veriyle besliyor (bkz. `buildCard.ts` başlığındaki güncellenmiş not).
  - **Karşılanamayanlar (cihaz gerektirir, bu ortamda yok):** 3 farklı Android ekran boyutunda elle kontrol, gerçek PNG piksel/boyut doğrulaması, emoji'nin iki platformda (Apple/Google sistem fontu) gerçek görünümü, Türkçe karakterlerin gerçek cihazda net görünmesi, reveal animasyonunun dokunmatik "akıcılık" hissi. `docs/manual-checklist.md`'ye S10'da işlenmeli.

**S7b — Satır gizleme, zorunlu önizleme, paylaşım, sızıntı denetimi (2-3 gün)**
- **Sorumlu:** MOB + **SEC (incelemeyi bu dilimde yapar; güvenlik madde 3)**. **Bağımlılık:** S7a; K4/K5 yer tutucu sabitleriyle (`src/config/constants.ts`).
- **Çıktı:** `hide-state.ts` + önizleme ekranı (her satırda tek dokunuşla göster/gizle; **uyku ve harcama varsayılan gizli**; gizleme yalnızca o paylaşım için, kalıcı değil); gizli satır `???` olarak çizilir ve gizlenen metin CardView'e hiç verilmez; `shareCard` (`expo-sharing` ile RN `Share`'in ikisi denenir, hangisi PNG + kısa metni Android'de doğru taşıyorsa seçilir, iOS teyidi S11'e); paylaşılan PNG'nin önbellekten temizlenme politikası (E10'daki açık nokta); paylaşımda kullanıcı adı/tarih/metadata yok.
- **Bitti kanıtı:** (1) bileşen testi: gizlenen satırın gerçek metni render ağacında **yok**; (2) PNG'de metadata/EXIF/tEXt parçası **yok** (bir araçla dosya incelenir, çıktı gösterilir); (3) uyku ve harcama varsayılan gizli, paylaşım sonrası gizleme durumu sıfırlanır (elle); (4) unvan gizlenen kategoriden türetilmez (S3'te veri yapısı hazırlandı; burada elle senaryo); (5) SEC bulguları yazılı; (6) Android'de paylaşım sayfası açılır, WhatsApp/galeri hedefinde PNG doğru görünür, paylaşım mesajındaki bağlantı yer tutucu (K5). `share_initiated` / `line_hidden` olay kancaları S9'a bırakılır.
- **Not:** Paylaşım oranı ölçütü gereği testçilere "paylaşın" yönlendirmesi yapılmaz (E1); bu karar kanıt dilimi değil, deneme protokolüdür, Kanıt bölümüne bkz.
- **Uygulama notu (S7b tamamlandı, 2026-09-23, MOB) — kod dilimi bitti, cihaz doğrulaması S10/S11'e kalıyor:**
  - **Yeni bağımlılıklar:** `expo-sharing` (RN `Share` denemesi elenmedi/ihtiyaç duyulmadı — `expo-sharing` tek başına PNG paylaşımını karşılıyor) + `expo-file-system` (paylaşılan PNG'nin temizliği için). İkisi de ağa veri göndermez, `npx expo-doctor` 21/21. Ayrıntı: `CLAUDE.md` "Bilinen tuzaklar" MOB/S7b.
  - **`captureCardPng`e `hiddenLines`/`hiddenCategories` parametresi EKLENMEDİ (spec'ten bilinçli sapma, `capture.ts` başlığında gerekçeli):** S7a'da `captureCardPng` zaten bir `CardView` render etmiyor, yalnızca önceden render edilmiş bir `View`in ref'ini yakalıyor. Gizleme kararı `CardView`in kendi `hiddenCategories` prop'una taşındı (render anında maskeleme); çağıran ekran (`CardPreviewView`) off-screen bir `<CardView hiddenCategories={...} ref={...} />` mount eder, `captureCardPng` onu olduğu gibi (zaten maskeli) yakalar. İki ayrı yerden "hangi kategori gizli" bilgisi taşımak yerine tek kaynak tercih edildi.
  - **Ekran 5 ayrı bir rota DEĞİL:** `src/app/card/[weekStart].tsx` yerel `mode` (`'reveal' | 'preview'`) state'iyle Ekran 4 (`CardRevealView`, artık "Paylaş" birincil butonu eklendi) ile Ekran 5'i (`src/components/card-preview-view.tsx`) sırayla gösterir — `openOrBuildCard`in ikinci kez tetiklenmesini önlemek için.
  - **İki ayrı görsel katman (`CardPreviewView` içinde, bilerek):** (1) her zaman gerçek metin gösteren bir "gözden geçirme listesi" (CardView DEĞİL, asla yakalanmaz) — görev talimatının "gizli satırın gerçek metni bu ekranda görünür" gereğini karşılar; (2) ekran dışına konumlandırılmış (`pointerEvents="none"`, ama mount'lu) gerçek `CardView` — paylaşım için TEK yakalama kaynağı, gizli kategoriler için gerçek metni hiç render etmez. Gerekçe: `ekran-akisi.md`'nin kilitli kart için savunduğu "ayrı iskelet bileşeni riski kökten yok eder" ilkesiyle aynı.
  - **Unvan otomatik gizleme kararı:** ayrı bir aç/kapa satırı değil; `basedOnCategories`teki bir kategori gizliyse unvan da satırlarla aynı mekanizmayla `???` olur (`src/card/title-visibility.ts`). Ayrıntılı gerekçe orada ve `CLAUDE.md`de.
  - **PNG temizleme politikası (E10):** `shareCard`, `Sharing.shareAsync` tamamlandığında (hedef seçildi veya iptal edildi, ikisi de aynı) geçici dosyayı `expo-file-system/legacy` ile siler (en iyi çaba). Gizleme durumu ise yalnızca paylaşım BAŞARIYLA tamamlandığında (hata değil) varsayılana sıfırlanır — hata durumunda kullanıcı seçimleri korunur, tekrar deneyebilir.
  - **Metadata/EXIF sızıntısı:** ekstra bir "temizleme" kodu eklenmedi (S7a'da zaten kanıtlandığı gibi `captureRef` hiç metadata eklemiyor); bu dilimde yeni bir doğrulama aracı/testi eklenmedi çünkü eklenecek bir şey yok — bkz. `capture.ts` başlığı. Cihazda üretilen gerçek bir PNG dosyasının EXIF/tEXt incelemesi (plan'ın istediği "bir araçla dosya incelenir" maddesi) **cihaz gerektirir, S10/S11'e kalıyor**.
  - **Karşılanamayanlar (cihaz gerektirir, bu ortamda yok):** gerçek Android paylaşım sayfasının açılması ve WhatsApp/galeri hedefinde PNG'nin görünümü, paylaşım mesajındaki K5 bağlantısının hedef uygulamaya gerçekten taşınıp taşınmadığı (`expo-sharing`in `dialogTitle`inin platform sınırları nedeniyle belirsiz, bkz. `share.ts` başlığı), geçici dosyanın cihaz diskinden gerçekten silindiğinin doğrulanması, gerçek PNG dosyasının EXIF/metadata incelemesi. `docs/manual-checklist.md`'ye S10'da işlenmeli.

- **SEC bulguları (S7b, 2026-09-23, security-reviewer — plan madde 5'in yazılı kanıtı):** Genel sonuç **temiz**, Important bulgu yok. Kontrol listesi: (1) gizli satır render ağacına girmiyor — `CardView.tsx` koşullu render, `CardView.test.tsx` `toJSON()` çıktısında gerçek metnin yokluğunu doğruluyor; (2) unvan otomatik gizleme `basedOnCategories`/`title-visibility.ts` ile doğru çalışıyor; (3) varsayılan gizli kategoriler (uyku+harcama) `hide-state.ts`'te doğru; (4) gizleme kalıcı değil, paylaşım/çıkış sonrası sıfırlanıyor (kaçış yolu yok); (5) `capture.ts`'te metadata/EXIF ekleyen bir kod yolu yok (view-shot varsayılanının ötesinde bir ekleme yapılmamış — gerçek dosya incelemesi S10/S11'e kalıyor, bu kod tarafı bulgusu); (6) paylaşım mesajı yalnızca sabit metin + K5 yer tutucusu, ham veri yok; (7) geçici dosya `expo-file-system` ile temizleniyor, yolun content-provider mı ham `file://` mi olduğu cihaz gerektirir (S10/S11); (8) `CardView.tsx` hâlâ `content/tr.ts` import etmiyor.
  **2 nit (Important değil, davranış değişikliği gerektirmez):** (a) `card-preview-view.tsx`'teki gözden geçirme listesinin `accessibilityLabel`'ı gizli satırlarda da gerçek metni taşıyor — bu, o listenin "kullanıcı ne sakladığını görsün" amacıyla bilinçli tasarlanmış olmasının doğal sonucu (asla PNG'ye yakalanmıyor), ekran okuyucu kullanan kullanıcı için bir farkındalık notu olarak kayda geçirildi; (b) özet şablonlarında (`content/tr.ts`) kategori adı/rakam yok, dolaylı sızıntı yok — teyit edildi.

### S8 — Bildirimler (3-4 gün) — kapı: K3 (Pazar çakışması bildirim saatlerini belirler)
- **Sorumlu:** MOB + QA (zaman/koşul senaryo listesi). **Bağımlılık:** S2, S5, S6; K3.
- **Çıktı:** `domain/notify-plan.ts` (saf), `notify/scheduler.ts`. Kurallar spec'ten: günlük hatırlatma her açılışta ve her check-in sonrası önümüzdeki **7 gün** için yeniden kurulur (bugün check-in yapıldıysa bugünkü atlanır, varsayılan 21:00, ayarlanabilir/kapatılabilir); **Pazar 20:00 "kart hazır" yalnızca dolu gün >= 4 olunca planlanır** (ilk kart için eşik 3 olduğundan, ilk kart bildirimi için eşik **3 olacak şekilde** kural QA ile netleştirilir; spec bu noktada yalnızca 4'ü söylüyor, bu bir belirsizlik olarak Riskler #7'de); saat dilimi/saat değişikliğinde her açılışta yeniden hesap; 7+ gün açılmazsa hatırlatmalar söner. Bildirim metinleri sabit ve veri seviyesi içermez (güvenlik madde 4).
- **Bitti kanıtı:** (1) Jest çıktısı: notify-plan senaryoları (bugün doldurulmuş, 3/4 gün eşiği, ilk kart, Pazar 20:00 ve 21:00 çakışma davranışı, kapalı hatırlatma, saat dilimi değişimi, 7 gün sönümlenme, bildirim metinlerinde veri yok); (2) **gerçek Android cihazda** elle: hatırlatma belirlenen saatte gelir (test için saat kısa ayarlanır), check-in sonrası bugünkü iptal, Pazar kartı bildirimi tetiklenir, "Tüm verilerimi sil" planlı bildirimleri iptal eder; (3) kilit ekranı görünümü (metin sabit); (4) izin reddedildiğinde uygulama çökmez ve ayarlar durumu gösterir. Emülatör yeterli sayılmaz. iOS gerçek cihaz S11. Sonuçlar `docs/manual-checklist.md`'ye.
- **Paralel:** S9 ile **koşullu** (bkz. Paralellik).
- **Uygulama notu (S8, 2026-09-23, MOB):** Kararlar `spec.md` "S8 netleştirmeleri"nde. Eşik `requiredDays` (ilk kart 3), yukarıdaki "4" ifadesi bunun yerine geçer. Dosyalar: `src/domain/notify-plan.ts` (saf), `src/domain/content/notification-texts.ts`, `src/notify/{scheduler,sync,wiring}.ts`; kancalar: `_layout.tsx` (açılış + AppState `active`), `today.tsx` (check-in), `card/[weekStart].tsx` (kart açılış/dondurma), `settings.tsx` (aç/kapa, saat, izin durumu, silme), `onboarding/notifications.tsx`. `delete-all.ts` iptal hatasını yutar (QA B-1). Sapma yok; `settings-view.tsx`'e isteğe bağlı `notificationPermission` prop'u eklendi (geriye dönük uyumlu). `spike/notifications/scheduleSpike.ts` (ve mevcut testi) dokunulmadan duruyor. **Karşılanamayanlar (cihaz yok):** gerçek Android cihazda saatinde gelme, check-in sonrası bugünkü iptal, Pazar kartı bildiriminin tetiklenmesi ve dokunma akışı, "sil" sonrası bekleyen yok, kilit ekranı görünümü, izin reddi -> Ayarlar durumu, pil tasarrufu gecikmesi. Ayrıca bu Windows makinesinde çalışma zamanında `process.env.TZ` değişimi etkili değil: senaryo T-02..T-07 (New York/Berlin/DST) Jest'te açıkça `skipped` raporlanıyor (`it.skip`; artık sahte geçiş değil) — cihazda doğrulanmalı (Jest içinde ortam değişkeniyle de etkinleşmiyor, bkz. `CLAUDE.md`). Hepsi `docs/manual-checklist.md`'ye S10'da işlenecek.
- **Kanıt (Jest):** notify-plan (eşik tablosu, sınırlar, kapalı hatırlatma, bozuk saat, yıl/ay sınırı, metinlerde veri yok), scheduler (idempotans, seri kuyruk, kanal sırası, tek hata), sync (kapılar, izin, eşzamanlılık), entegrasyon (gerçek repo + sahte expo-notifications, silme sonrası yeniden kurulmama), push API yasak taraması.
- **SEC bulguları (S8, 2026-09-23, security-reviewer):** Genel sonuç: **içerik/ağ duruşu temiz** (bildirim metinleri sabit ve veri içermiyor; kodda push token/uzak push yolu yok; yeni bağımlılık yok), **3 Important + nit'ler**; hepsi aşağıdaki durumla işlendi.
  1. *Important — silme ile eşzamanlı sync yarışı:* **düzeltildi.** `sync.ts` kapı+okuma+`replaceAll` aynı seri kuyrukta (`runExclusiveNotify`); "Tüm verilerimi sil" (`settings.tsx` -> `runDeleteExclusive`) aynı kuyruğa alındı; `replaceAll`dan önce `onboardingDone` yeniden okunuyor; `skipped` dalı `cancelAll` çağırıyor (iptal hatası olsa da sonraki açılışta temizlenir). Regresyon testi: `__tests__/notify/sync.test.ts` ("silme ile eşzamanlı sync yarışı").
  2. *Important — deep link `weekStart` doğrulaması:* **düzeltildi.** `src/lib/week-param.ts` (`isValidWeekStartParam`: biçim + gerçek tarih + Pazartesi + gelecek değil); `card/[weekStart].tsx` geçersizse `/week`e yönlendirir, `today.tsx` geçersiz `returnToCardWeekStart`ı yok sayar, `open-card.ts` savunma amaçlı reddeder (`saveCard`a ulaşmaz). Testler: `__tests__/lib/week-param.test.ts`, `__tests__/card/open-card.invalid-week.test.ts`.
  3. *Important — FCM/Firebase belirsizliği (belge):* **S10'a devredildi.** `CLAUDE.md` "Bilinen tuzaklar"a tam kayıt yazıldı; kanıt S10'da (birleşik manifest + cihazda ağ trafiği).
  4. *Nit — `data` payload'ında kullanılmayan `weekStart`:* **düzeltildi** (yalnızca `kind`). *Nit — `SCHEDULE_EXACT_ALARM` yok:* Android 12+'da hatırlatma yaklaşık zamanlı gelebilir; davranış notu `CLAUDE.md`de (kabul edildi).

### S9 — Ölçüm sayaçları + deneme raporu (1-2 gün) — kapı: yok (E1 Seçenek A karara bağlı)
- **Sorumlu:** MOB. **Bağımlılık:** S5 (tablo), S6, S7, S8 (olay kancalarının yerleşeceği akışlar).
- **Çıktı:** `metric-repo.ts`, `metrics/events.ts` (sabit küme: `card_unlocked`, `card_opened`, `share_initiated`, `line_hidden`, `check_in_saved`; içerik/değer/konum/cihaz kimliği taşımaz), `domain/metrics-calc.ts` (D7: kurulum günü = gün 1, gün 7'de dolu check-in var mı; payda tanımı), `metrics/report.ts` (kullanıcı tetikli düz metin/JSON, sistem paylaşım sayfasıyla; otomatik gönderim yok), ayarlarda "deneme raporu" düğmesi. Veri silme `metric_event`'i de temizler.
- **Bitti kanıtı:** Jest çıktısı: D7 hesabı (gün 1 tanımı, kenar günler), **"paylaşım oranı" paydası kartı görenler (`card_opened >= 1`)**, ayrıca "kart açan / kurulum" oranı ve kartı hiç görmeyenlerin ayrı raporlanması (E4-c); rapor içeriğinde emoji/içerik/kimlik yok (test); elle: Android'de rapor paylaşım sayfasıyla dışarı çıkar; "Tüm verilerimi sil" `metric_event`'i boşaltır. Bilinen sınır (paylaşım sayfası açıldı = fazla sayım, ekran görüntüsü = eksik sayım) rapor metninde ve `CLAUDE.md` "Bilinen tuzaklar"da yazılır.
- **Uygulama notu (S9, 2026-09-23, MOB):** Kod tamam; `metrics/events.ts` (sabit küme + doğrulama, kanonik tanım `data/metric-repo.ts`'te kaldı), `metrics/track.ts` (en iyi çaba kancalar: `trackEvent`, `trackEventOnce`, `trackShareInitiated`), `domain/metrics-calc.ts` (saf: D7, sayaçlar, `aggregateMetrics`), `metrics/report.ts` (düz metin + JSON, geçici dosya + `expo-sharing`, sonra silinir). Kancalar: `today.tsx` (`check_in_saved`), `week.tsx` (`card_unlocked`, hafta başına bir kez), `card/[weekStart].tsx` (`card_opened`), `card-preview-view.tsx` (`share_initiated` + gizli satır sayısı kadar `line_hidden`, kategorisiz). Ayarlarda "Deneme raporunu paylaş" düğmesi. `metric-repo.ts`'e geriye dönük uyumlu eklemeler: `hasEvent`, `recordEvent`te küme dışı ad reddi. `delete-all.ts` zaten `metric_event`'i siliyordu; testle kanıtlandı. Yeni bağımlılık YOK. Spec'e "S9 netleştirmeleri" eklendi (sapma yok).
  **Cihazda DOĞRULANMADI (S10/S11 cihaz listesine):** (1) rapor Android paylaşım sayfasıyla gerçekten açılıyor ve `.txt` hedefe (Mesajlar/WhatsApp/e-posta) okunur ulaşıyor mu, (2) "Tüm verilerimi sil" sonrası cihazda `metric_event` gerçekten boş mu (yalnızca Jest'te node:sqlite ile kanıtlandı), (3) `card_unlocked`/`card_opened`/`share_initiated` gerçek akışta beklenen anlarda yazılıyor mu, (4) paylaşım sonrası geçici rapor dosyası silindi mi.
  **SEC bulguları (S9, security-reviewer):** Genel sonuç: ağ çağrısı yok, rapor içeriği sınırı sağlam; 3 Important + nit'ler.
  - *I-1 deep link ile uygunluk atlanıyor:* **düzeltildi** — `openOrBuildCard(weekStart, today, now?)` kayıtlı kart yoksa `getWeekState().unlocked` kontrol eder, değilse `{status:'notReady'}` (kart/`saveCard`/`card_opened` yok); ekran `/week`e yönlendirir. Sıra: kayıtlı kart -> uygunluk -> K3. Testler: `__tests__/card/open-card.eligibility.test.ts`.
  - *I-2 rapor paylaşımı öncesi bilgilendirme yok:* **düzeltildi** — `src/metrics/report-confirm.ts` ([Vazgeç]/[Paylaş] Alert), `settings.tsx` buna bağlı; test `__tests__/components/settings-view.trial-report.test.tsx`.
  - *I-3 "anonim" ifadesi yanıltıcı:* **düzeltildi** — S9 metinlerinde/notlarında "kimlik/içerik içermez"; gönderen kimliğiyle birleştirilebilirlik notu `CLAUDE.md`de. (E1 Seçenek B başlığındaki "anonim sayaç uç noktası" ayrı bir karar konusu, dokunulmadı.)
  - *N-1 rapor dosyası kalıntısı / `cacheDirectory` null:* **düzeltildi** (`report-file.ts`; açılışta ve silmede temizlik; null ise hata). *N-2 delete-all tek transaction:* **düzeltildi** (`exec` çoklu deyim, hata olursa ROLLBACK). *N-3 `trackEventOnce` atomik değil, N-5 `metric_event.at` kullanılmıyor:* **kabul edildi** (bkz. `CLAUDE.md`).

### S10 — Android cihaz testi, cila, güvenlik son inceleme (3 gün) — kapı: K7 doğrulandı, K6 (E3) kararı işlendi
- **Sorumlu:** QA (test planı) + MOB (düzeltmeler) + SEC (son inceleme) + OPS (üretim derlemesi).
- **Bağımlılık:** S1-S9. **Çıktı:** `docs/manual-checklist.md` tam doldurulmuş; hata düzeltmeleri; **EAS ile Android üretim (release) derlemesi**; `CLAUDE.md` "Bilinen tuzaklar" güncellenir.
- **Yapılacaklar:** kart görseli 3 ekran boyutunda ikinci tur; bildirim güvenilirliği (agresif pil yönetimli bir üretici cihazı varsa dene; yoksa risk olarak kayda geç, E13); erişilebilirlik ölçeği; log'larda veri yok taraması; gizli debug menüsünün üretim derlemesinde bulunmadığının kontrolü; SEC güvenlik gereksinimleri 1-9 için madde madde denetim; `/code-review` ve `evals/checklist.md`; Dependabot/bağımlılık listesi gözden geçirme ("ağa veri gönderiyor mu").
- **Uygulama notu (OPS, cihazsız kısım, 2026-09-23):** `eas.json` yazıldı (development/preview APK, production AAB, `appVersionSource: remote`, OTA yok); `.gitignore` anahtar/`credentials.json`/`google-services.json`/`*.apk`/`*.aab` ile tamamlandı; `app.json`'a `android.blockedPermissions` (yalnızca READ/WRITE_EXTERNAL_STORAGE) eklendi. Dev menü/zaman simülasyonunun üretim JS'inde bulunmadığı `expo export` (hbc + no-bytecode) ile kanıtlandı. Merged manifest, FCM ve cihaz ağ gözlemi (a2, b) hâlâ **açık** (SDK/cihaz gerekir). INTERNET engelleme bilinçli uygulanmadı (dev client'ı bozar, cihazda doğrulanmalı). Bulgular ve Batuhan'ın adımları: `docs/s10-ops-raporu.md`.
- **Uygulama notu (güvenlik düzeltmeleri, 2026-09-23, MOB):** SEC raporu (`docs/s10-guvenlik-raporu.md`) bulguları: I-1 (`shareCard` try/finally + `src/card/temp-cleanup.ts` süpürme, açılış ve `deleteAllData`), I-4 (checklist `haftik://`, paket adı notu, yeni K-09/P-08/P-09/G-08/G-09/G-10), N-4 (`(main)` layout onboarding kapısı, `src/lib/onboarding-gate.ts`), N-8 (`eas.json` `development` profili kaldırıldı; artık yalnızca preview/production), N-2 (ölü şablon dosyaları + `expo-web-browser`/`expo-symbols`/`expo-image` bağımlılıkları kaldırıldı), I-2 kısmi (`SYSTEM_ALERT_WINDOW` `blockedPermissions`'a eklendi). Sapma: `eas.json` `development` profili OPS notunda vardı, kaldırıldı. **Batuhan kararı bekleyenler (değiştirilmedi):** I-3 paket adı, I-5/I-6 (S12), N-9 uygulama kilidi/FLAG_SECURE, `INTERNET` izni, N-7 placeholder migration sütunu. **Açık:** iOS geçici PNG süpürmesi (S11), release merged manifest ve cihaz kanıtları.
- **Bitti kanıtı:** Jest + `tsc` + lint tam çıktısı; **üretim derlemesinde ağ kullanımı yok**: (a) Android izin listesi/manifest çıktısı (INTERNET yalnızca gerekiyorsa ve gerekçesiyle), (a2) **release prebuild birleşik (merged) AndroidManifest + FCM doğrulaması** (`expo-notifications`in getirdiği `ExpoFirebaseMessagingService`/firebase-messaging'in ek izin/INTERNET ekleyip eklemediği; S8 SEC bulgusu 3), (b) release derlemesi gerçek cihazda ağ izleme aracıyla (**expo-notifications için de cihazda ağ trafiği gözlemi**: token kaydı/FCM isteği yok) (araç S10'da seçilir) kart açma/paylaşma/bildirim akışları boyunca dışarı istek yok, çıktı/ekran görüntüsü saklanır; yedekleme yapılandırmasının doğrulama kanıtı (K7); SEC raporu, açık Important bulgu yok; **kapalı deneme Android build'i** internal/closed test kanalına yüklenebilir durumda.

### S11 — iOS cihaz testi (1-2 gün, KOŞULLU) — kapı: K9 (Apple Developer üyeliği)
- **Sorumlu:** MOB + QA. **Bağımlılık:** S10 tamam **ve** Apple Developer Program üyeliği alınmış (spec: gerçek iPhone testi için ücretli üyelik; plan aşamasında Apple/Expo dokümanından doğrulanır).
- **Yapılacaklar:** EAS iOS dev/internal build; iOS'a özgü riskler: bildirim izni akışı ve zamanlama, paylaşım sayfasında PNG + metin, font (Türkçe karakter) ve emoji görünümü farkı (kabul edilebilir fark sayılıp not edilir), iCloud yedek hariç işareti (K7'nin iOS kısmı), veri silme, ekran boyutları.
- **Bitti kanıtı:** gerçek iPhone'da `docs/manual-checklist.md` iOS sütunu doldurulmuş; bildirim gerçek cihazda geldi; kart PNG'si iki platformda kıyas ekran görüntüleri; iOS yedek hariç tutma doğrulama notu; bulunan iOS'a özgü hatalar `Bilinen tuzaklar`a. **Üyelik alınmadıysa** bu dilim ve iOS mağaza gönderimi atlanır; ürün yalnızca Android'de denemeye çıkar (bilinçli, spec E2 kararı); toplam takvim iOS'suz **~1-2 gün** kısalır ve S12'nin iOS kısmı ertelenir.

### S12 — Mağaza hazırlığı (4-5 gün) — kapı: K4 (ad, KESİN), K5 (bağlantı, KESİN), K10 (KVKK görüşü)
> **Batuhan kararları (2026-09-23, plan sapması değil, kapı girdileri):** K4 ad = **Haftik**; paket adı = **`com.batuhan.haftik`** (Android + iOS, `app.json`'a işlendi; Play'de kalıcı); "Uyku" etiketi kalır, Health apps beyanı dürüst; hedef yaş 18+; kapalı denemede paylaşım çağrısı iki dönemli (ilk dönem nötr = %25 eşiğine sayılan, sonra çağrılı); dağıtım önce EAS `preview` APK (arkadaş çevresi), sonra Play kapalı test. **Hâlâ açık:** K5 (mağaza bağlantısı), K10 (KVKK görüşü ya da "kapalı deneme yalnızca arkadaş çevresi, hukuki görüş sonra" kararının yazılı işlenmesi), iletişim e-postası, ad çakışma kontrolü (mağaza/alan adı/sosyal medya/TÜRKPATENT), K9 (Apple üyeliği, iOS koşullu).
- **Sorumlu:** OPS (EAS gönderim, mağaza hesapları) + UX (ikon, ekran görüntüleri) + SEC (beyanlar, gizlilik metni) + Batuhan (hukuki görüş).
- **Bağımlılık:** S10 (Android) ve, iOS için, S11. **Çıktı:** `site/` (statik gizlilik politikası + akıllı mağaza bağlantısı; GitHub Pages/Cloudflare Pages), ikon/splash, mağaza ekran görüntüleri, listeler (kategori: "Lifestyle", tıbbi iddia yok — spec önerisi), Apple "Data Not Collected" / Google "veri toplanmıyor" beyanları (**Console'daki güncel tanımla doğrulanır**), Google "Health apps" beyan formunun kapsayıp kapsamadığı Play Console'da doğrulanır, sade aydınlatma metni, kart damgası ve `constants.ts`'e **kesin ad ve URL**'ler (yer tutucular gider; kartlar yeniden üretilir, ekran görüntüleri kesin adla), Google Play kapalı test kurulumu (>= 12 test kullanıcısı, 14 gün kesintisiz; E11).
- **Bitti kanıtı:** gizlilik politikası URL'si canlı ve mağaza formlarına girilmiş; mağaza beyan ekran görüntüleri; kesin ad/URL ile üretilmiş kartın PNG'sinde damga doğru; Android build closed test kanalında ve testçi davet akışı bir gerçek hesapla denenmiş; KVKK görüşü belgesi (varsa) klasöre eklenmiş **ya da** Batuhan'ın "kapalı deneme yalnızca arkadaş çevresi, hukuki görüş sonra" yönündeki açık kararı `plan.md`'ye işlenmiş. Mağaza inceleme beklemesi bu bitiş ölçütüne dahil değildir (Riskler).
- **Uygulama notu (site/, cihazsız hazırlık, 2026-09-23):** `site/` taslağı yazıldı (`index.html`, `gizlilik.html`, `404.html`, `style.css`, `README.md`): tek dosya CSS, dış istek/script/çerez yok, koyu/açık mod. Yer tutucular: `[iletişim e-postası]`, `[mağaza bağlantısı]`, `[tarih]`, `[sorumlu kişi/unvan]`. **Yayın kapısı K10;** metin hukuki görüş değildir. Gizlilik metni iOS yedekleme için "henüz kesin değil" der (S11'de güncellenmeli); deneme raporu "kimlik/içerik içermez, takma adlı olabilir" (anonim denmedi). Yayınlama adımları `site/README.md`'de. Kodda değişiklik yok; Ayarlar'daki "(yakında)" gizlilik bağlantısı canlı URL ile S12'de bağlanır.
- **Paralel (worktree adayı #2):** `site/`, mağaza metinleri ve ikon çalışması (kod dışı) S8-S10 ile aynı anda yürüyebilir; ancak kesin ad/URL kapıları (K4, K5, K10) açılmadan bitirilemez; ekran görüntüleri S10 sonrası alınır.
- **Uygulama notu (OPS rehberi, 2026-09-23):** `docs/s12-yayin-rehberi.md` yazıldı (yalnızca belge; kod/`app.json`/`eas.json` değişmedi, hesap/build/gönderim yapılmadı). İçerik: hesaplar (Play 25 USD tek sefer + kimlik doğrulama, kişisel hesapta 12 testçi/14 gün, EAS, Apple 99 USD/yıl koşullu), paket adı kararı, imzalama (EAS managed + Play App Signing, yedek), sıralı `eas` komutları, Play kapalı test formları ve kanıt listesi, iOS koşullu adımlar, dağıtım seçenekleri + karar tablosu, yayın kapı listesi. Açık: paket adı (ilk `eas build`den önce), `ios.bundleIdentifier` yok, `site/` yok, K5 yer tutucu; kurallar "doğrula" işaretli, Console ekranıyla teyit edilecek.

---

### Kapı (gate) noktaları

Batuhan'a bırakılan kararlar. "En geç" = o dilim başlamadan önce; karar verilmezse belirtilen varsayılanla ilerlenir (varsayılan yoksa dilim bekler).

| Kapı | Karar | En geç önce | Varsayılan (karar gelmezse) |
|---|---|---|---|
| **K0** | Bu planın onayı (Batuhan) | S1 | Yok; kod başlamaz |
| **K1** | Uygulama kodu için ayrı klasör/depo (öneri: `C:\Users\Pc\Desktop\haftalik-hayat-karti`) | S1 | Yok; S1 bekler |
| **K2** | Haftalık çalışma saati sayısı | (bloklamaz; takvimi belirler) | Takvim aralığı olarak verilir |
| **K3** | **E4(a): Pazar 21:00 hatırlatma / 20:00 kart çakışması** (spec önerisi: kart açılırken bugün işaretlenmediyse önce check-in; alternatif Pazar hatırlatmasını 19:30'a çekmek) | **S6 başlamadan (ideal) / S7a ve S8 başlamadan (zorunlu)** | Spec'teki öneri (önce check-in yönlendirmesi) |
| **K4** | **E8: uygulama adı** (kart damgası, mağaza kaydı, ikon) | S7a'da yerleşim önce (ideal); **S12 öncesi zorunlu** | Tek sabitte yer tutucu; S12'de kart ve görseller yeniden üretilir |
| **K5** | **E5: mağaza bağlantısı** (kısa URL / QR / akıllı yönlendirme sayfası; alan adı) | S7b'de paylaşım mesajı yer tutucusu; **S12 öncesi zorunlu** | Yer tutucu alan adı; kartta silinemeyen damga + paylaşım metnine bağlantı; kırpma garantisi yok |
| **K6** | **E3: OTA güncelleme (EAS Update)** açılsın mı | **S1'de yapılandırma açısından (kapalı doğrulanır); değişecekse S10 öncesi** | **Kapalı** (spec varsayılanı; ağ yok gereksinimi korunur). Açılırsa ayrı intent/spec düzeltmesi: "kod indirilir, veri değil" yorumu ve mağaza beyanı etkilenir |
| **K7** | **Yedekleme ayarının Expo'da doğrulanması** (Android yedek kapalı; iOS iCloud hariç işareti) | S1'de yol araştırılır; **S5'te uygulanır; S10 çıkışı için doğrulanmış olmalı** | "Tamam" sayılmaz; bulunamazsa Batuhan'a geri dönülür (spec kararı uygulanamıyorsa yeniden karar gerekir) |
| **K8** | S4 içeriği (espri, ton) | S4 sonu (paylaşıma hazır demek için) | Geçici içerikle S5-S6 yürür |
| **K9** | **Apple Developer üyeliği** (iOS gerçek cihaz testi; ne zaman alınacağı açık) | S11 | Alınmazsa S11 atlanır, iOS gönderimi ertelenir, deneme Android'de yapılır |
| **K10** | **KVKK hukuki görüş** (emoji beyanları özel nitelikli veri mi; cihazdaki veride geliştirici "veri sorumlusu" mu; aydınlatma/açık rıza/VERBİS) | **S12 (testçi dağıtımı ve mağaza gönderimi) öncesi**, spec'e göre kapalı deneme dışına çıkmadan önce mutlaka | Yalnızca Batuhan'ın kendi cihazı ve yakın çevre; üçüncü kişilere dağıtım yok |
| **K11** | Google "Health apps" beyan formu ve mağaza gizlilik beyanlarının güncel tanımı | S12 | Console'da doğrulanana kadar beyan "kesin" sayılmaz |

**Değişmeyen insan onay noktaları (spec'ten):** intent'i Batuhan commit'ler; spec'i Batuhan onaylar ve commit'ler; **bu planı Batuhan onaylar, ancak sonra kod yazılır**; **her commit'i Batuhan atar, Claude atmaz**. Sır içeren dosyalar (`.env` vb.) commit edilmez; yıkıcı git komutları öncesinde açık onay alınır (global hook'lar).
Her dilimin sonundaki commit öncesi sıra: `verifier` (çıktı gösterilir) -> `/code-review` -> Batuhan okur, düzeltir, commit'ler.

### Paralellik (git worktree adayları; tavan 2 oturum)

| Aday | Birlikte çalışan | Neden dosya çakışması yok | Not |
|---|---|---|---|
| **#1** | **S4 (içerik) ∥ S5 (veri katmanı)** | S4: `src/content/`, `__tests__/content/`; S5: `src/data/`, `__tests__/data/` | S4 Batuhan'ın espri düzeltme zamanını da bekler; S5 bu arada ilerler. `types.ts`'e ikisi de dokunmaz (S2'de donmuş) |
| **#2** | **U0 (UX) ∥ S1-S3** | U0: yalnızca `docs/ux/` | Belge işi; farklı oturum/kişi bağlamı |
| **#3** | **S12 hazırlık (site, metin, ikon) ∥ S8-S10** | S12: `site/`, `assets/` (ikon), mağaza metinleri | Kod dilimleriyle çakışmaz; K4/K5/K10 açık kalırsa bitmez; ekran görüntüleri S10 sonrası |
| **#4 (koşullu)** | **S8 (bildirim) ∥ S9 (ölçüm)** | S8: `notify/`, `domain/notify-plan.ts`; S9: `metrics/`, `data/metric-repo.ts`, `domain/metrics-calc.ts` | **Çakışma noktası:** ikisi de check-in kaydetme ve uygulama açılış akışına kanca koyar (`check_in_saved` / yeniden planlama). Yalnızca S9'un saf hesap ve rapor kısmı paralel; kancalar S8 birleştikten sonra sırayla. Kazanç küçük; öneri: **sıralı yürüt** |

**Paralel yapılmaz (aynı dosyalara dokunur):** S6 -> S7 (`app/` ekranları, kart açılışı), S7a -> S7b (`src/card/`), S2 -> S3 (`domain/`).
Aynı anda en fazla 2 worktree; ilk iki aday (#1, #2) zaten farklı safhalardadır, yani pratikte Batuhan'ın inceleme yükü hiçbir zaman ikiyi aşmaz.

## Riskler

**En riskli adımlar (spec'in E6 "daha zor kısımlar" ve karmaşıklık işaretiyle uyumlu):**

1. **Kart görseli iki platformda aynı görünmesi (S7a) — en riskli.** Risk: font, emoji ve taşma farkları; Android'de Türkçe karakter. Azaltma: S1'de erken spike; kart sabit mantıksal boyutta; font paketlenir; Android'de 3 ekran boyutu. **Elenen alternatifler:** Skia (statik kart için gereksiz karmaşıklık); sunucuda görsel üretimi (v1'de sunucu yok, gizlilik ilkesine aykırı); gerçek ekran görüntüsü (cihaz boyutuna bağımlı, gizli satır garantisi verilemez); Capacitor/canvas (iki platformda tutarsız).
2. **iOS'un geç keşfedilen riskleri (E2, S11).** Android-first kararı iOS hatalarını erkene çekemez; iOS'a özgü sürprizler (bildirim izni akışı, paylaşım yükü, font/emoji, yedek işareti) Apple üyeliğinden sonra çıkar. Azaltma: iOS'a özgü kodu minimumda tut, `Platform.OS` dalları plan'a not edilir; S11'de 1-2 gün + düzeltme payı; üst uç tahmindeki ~%15 tampon bunun bir kısmını karşılar. Üyelik hiç alınmazsa ürün Android-only denenir (intent Open question 2 "Android-only ilk sürüm" seçeneğiyle uyumlu). **Elenen:** iOS'u baştan zorunlu tutup Apple ücretini en başa çekmek (kart durumu netleşmedi; E2 kararı Android-first).
3. **Hafta/saat mantığı ve koşullu bildirim yeniden planlama (S2, S8).** Risk: Pazar 20:00 / 21:00, Pazartesi 00:00 sınırı, saat dilimi değişikliği. Azaltma: enjekte edilebilir saat, saf `notify-plan`, sabit saat dilimli Jest, debug zaman menüsü. **Elenen:** sunucu tarafı zamanlama (sunucu yok); ısrarcı sürekli yeniden bildirim (işletim sistemi bekleyen bildirim sınırı, spec 7 gün kuralı).
4. **Android'de bildirim güvenilirliği (S8, S10).** Agresif pil yönetimi olan üreticilerde gecikme/kayıp (E13). Kabul edilen kalan risk: D7/paylaşım düşüşü bildirim sorunundan mı ürün sorunundan mı ayrılamayabilir; deneme sonucunun yorumuna not düşülür. Ayrıca Android'de tam zamanlı alarm izni gereksinimi olup olmadığı S1 spike'ında ve S8'de kütüphane dokümanından **doğrulanmadı, doğrulanacak**.
5. **Yedekleme ayarının Expo'da uygulanabilirliği (K7).** Spec kararı ("yedekten hariç") uygulanamazsa ya da iOS'ta özel yerel kod/config plugin gerektirirse süre artar ve karar yeniden açılır. Azaltma: S1'de bulunur, S5'te uygulanır, S10'da doğrulanır; bulunamazsa Batuhan'a geri dönülür (kararı sessizce bozma).
6. **Jest ortamında SQLite entegrasyon testi (S5).** `expo-sqlite` yerel modüldür; test için bellek-içi sürücü/soyutlama gerekir. Risk: test sürücüsü ile cihaz sürücüsü arasında davranış farkı. Azaltma: repo ince arayüz arkasında; kritik kısıtlar (CHECK, PRIMARY KEY, migration) ayrıca cihazda elle doğrulanır.
7. **Spec'te belirsiz iki nokta (plan bunları bilerek işaretler, karar vermez):** (a) Pazar 20:00 "kart hazır" bildirimi spec'te "dolu gün 4'e ulaşınca" planlanıyor; ama ilk kart eşiği 3 (E4(b)); ilk kart için bildirim eşiğinin 3 olması mantıklı görünüyor, fakat spec'te açıkça yazmıyor — S8 başında QA ve Batuhan ile netleştirilir. (b) Aynı hafta kartı bir kez açılıp dondurulduğunda, kullanıcı daha sonra o hafta bir gün ekleyemez mi (Pazar akşamı 20:00'dan sonra Pazar günü)? K3'ün çözümü bunu belirler.
8. **Süre tahmini varsayıma bağlı (haftalık çalışma saati bilinmiyor; K2).** 33-42 iş günü (~38) efor tahminidir; **takvim süresi Batuhan'ın haftalık saatine göre ölçeklenir.** Spec'in kendi verdiği iki nokta: tam zamanlı 7-9 hafta, yarı zamanlı 14-18 hafta; doğrusal ölçekle haftada ~10 saat yaklaşık 28-36 hafta anlamına gelir (bu son sayı bir tahmin, spec'te yok). Tahmine **dahil olmayanlar:** mağaza inceleme beklemesi (Apple genelde günler, ret olasılığı), Google Play kapalı test süresi (14 gün, >= 12 testçi; E11), 4 haftalık deneme. U0'ın süresi spec'te ayrı sayılmamıştır; S6/S7 bütçesine dahil sayıldı, dahil değilse +1-1.5 gün. CLAUDE.md "Bilinen tuzaklar" boş olduğundan geçmiş sapma verisi yok; ~%15 tampon üst uçtadır. **İlk gerçek ölçüm S2 sonunda:** S1+S2'nin gerçek harcanan gün/saat kaydı tutulur ve tahmin yeniden kalibre edilir.
9. **Ölçüm yanlılıkları kabul edilmiş (E1):** paylaşım "fazla" (paylaşım sayfası açıldı) ve "eksik" (ekran görüntüsü) sayılır; %25 eşiği "güçlü sinyal", "kesin doğrulama" değil. Kod bunu çözmez; S9 raporunda ve deneme protokolünde yazılı olur.
10. **İçerik kalitesi (S4).** Esprili metin ürünün kendisi; Claude taslak, Batuhan düzeltir. Yetersizse tüm dilimler doğru çalışsa da paylaşım oranı düşer; bu risk ürün riskidir (E12), mühendislik ile azaltılamaz. Kapsam genişletmek çözüm değildir (intent).
11. **Bağımlılık güvenliği (her dilim).** Her yeni kütüphane eklenirken "ağa veri gönderiyor mu / reklam-analitik SDK'sı içeriyor mu" kontrolü yapılır; ilk kontrol S1'de, son kontrol S10'da. Üçüncü taraf çökme/analitik SDK'sı yok (E7): hatalar yalnızca testçi bildirimleri ve mağaza konsollarının toplu çökme raporundan görünür.

**Kapsam koruması:** Aşağıdakiler bu planın dışındadır; talep gelirse "ayrı intent.md mi?" diye sorulur: OTA güncelleme (K6 varsayılan kapalı), anonim sayaç sunucusu (E1 Seçenek B), Instagram Story derin entegrasyon, çok dilli destek, geçmiş kart galerisi, HealthKit/Health Connect, çökme raporlama SDK'sı, uygulama kilidi (spec güvenlik madde 5'te "isteğe bağlı" der; v1 MVP kapsamında listelenmemiştir, eklenip eklenmeyeceği Batuhan'a sorulacak bir kapsam noktasıdır).

## Kanıt (bu iş bitti diyeceğimiz ölçüt)

**Genel kural:** hiçbir dilim, testler gerçekten çalıştırılıp **çıktısı gösterilmeden** "bitti" sayılmaz; `tsc --noEmit`, lint ve Jest temiz olmalı; davranış değiştiyse gerçek ortamda (Android cihaz/emülatör) elle denenmeli; `verifier` dilim sonunda taze bağlamla çalışır (kurulumu S1'dedir). Test başarısızsa testi değil kodu düzelt.

### Spec "Kalite gereksinimleri" -> hangi dilimde kanıtlanır

| Gereksinim (spec) | Kanıtlandığı dilim | Nasıl |
|---|---|---|
| 81 seviye kombinasyonunun tamamı için unvan döner, hiçbiri boş kalmaz | **S3** (geçici içerik), **S4** (gerçek içerik, yeniden koşar), S10 (regresyon) | Jest çıktısı |
| Hafta sınırları: Pazar 23:59 / Pazartesi 00:00, yıl sonu, ay sonu | **S2** | Jest çıktısı (sabit saat dilimi) |
| Uygunluk sınırları: normal hafta 3 gün = değil / 4 gün = uygun; ilk kart 2 gün = değil / 3 gün = uygun | **S2** (domain), **S5** ("ilk kart" tespiti repo testi), **S6** (debug menüsüyle elle), **S8** (bildirim eşiği) | Jest + elle |
| Metinlerde rakam yasağı ve satır uzunluğu (~60 karakter) | **S3** (test yazılır), **S4** (gerçek metinle geçer + sayı sözcükleri el taraması) | Jest çıktısı + okuma |
| Üretim derlemesinde ağ kullanımı yok | **S1** (`expo-updates` kapalı, ilk bağımlılık denetimi), her dilimde yeni bağımlılık kontrolü, **S10** (izin listesi + gerçek cihazda ağ izleme) | Manifest çıktısı + ağ izleme kaydı |
| Kart görseli >= 3 ekran boyutunda ve iki platformda elle (Türkçe karakter, taşma, emoji) | **S7a** (Android 3 boyut), **S10** (ikinci tur), **S11** (iOS) | Ekran görüntüleri `docs/manual-checklist.md`'de |
| Bildirimler gerçek iOS ve Android cihazda | **S8** (Android gerçek cihaz), **S10** (OEM pil davranışı), **S11** (iOS gerçek cihaz) | Elle kontrol listesi; emülatör yeterli değil |
| Domain testleri geçmeden kart/bildirim işi bitmiş sayılmaz | **S2-S3 çıkışı, S7 ve S8 girişi** kapısı | `verifier` çıktısı S7/S8 başlamadan gösterilir |
| Repo entegrasyon testi | **S5** | Jest çıktısı |
| Uygulama ekranlarında erişilebilirlik/font ölçeği (E13) | **S6**, **S10** | Elle kontrol |

### Güvenlik gereksinimleri (spec'teki 1-9) -> dilim

| Madde | Dilim | Kanıt |
|---|---|---|
| 1 Veri yalnızca cihazda, sunucu/ağ yok | S1, S10 | Bağımlılık listesi + ağ izleme |
| 2 Üçüncü parti SDK yok, her yeni bağımlılık kontrolü | Her dilim, S10 | Kontrol notu `CLAUDE.md`/PR |
| 3 Kart: zorunlu önizleme, gizle/göster, uyku ve harcama varsayılan gizli, EXIF/metadata yok, unvan gizlenenden türetilmez | **S7b** (SEC incelemesi) | Bileşen testi + PNG metadata incelemesi + elle |
| 4 Bildirim metinleri veri seviyesi içermez | **S8** | Test + kilit ekranı |
| 5 Tüm veriyi sil, log'a veri yazılmaz (uygulama kilidi isteğe bağlı: kapsam sorusu) | S5 (silme), S6 (arayüz), S8 (bildirim iptali), S9 (metric_event), S10 (log taraması) | Repo testi + elle |
| 6 Yedekten hariç tutma (Android/iOS) | S1 (yol), S5 (uygulama), **S10 (Android kanıtı)**, **S11 (iOS kanıtı)** | Manifest/işaret doğrulaması, cihaz denemesi |
| 7 Sade aydınlatma metni + gizlilik politikası | S6 (onboarding metni), **S12** | Canlı URL |
| 8 Mağaza beyanı (Data Not Collected vb.), kategori "Lifestyle" | **S12** (K11) | Console ekran görüntüleri |
| 9 Analitik ileride eklenirse (varsayılan kapalı, açık onay) | Kapsam dışı; eklenirse ayrı intent | — |

### Ölçüm ve deney protokolü (kanıt değil, koşul)
- S9 raporu payda olarak kartı görenleri kullanır; "kart açan / kurulum" ayrı raporlanır.
- **Testçilere paylaşım yönlendirmesi yapılmaz** (E1 "kendiliğinden" şartı); bu, deneme protokolüne (S12 sonrası) yazılır.
- %25 eşiği "güçlü sinyal" olarak okunur; 20-30 kişilik örneklemde 5-8 paylaşıma denk gelir.

### Tüm iş "bitti" ölçütü (Build aşaması çıkışı)
1. S1-S10 dilimleri tamam; her birinin `verifier` çıktısı, Jest/`tsc`/lint çıktısı ve elle kontrol kayıtları mevcut.
2. Domain testleri (81 kombinasyon, hafta sınırları, uygunluk sınırları, metin denetimi) ve repo entegrasyon testi geçiyor; çıktıları gösterildi.
3. Android üretim derlemesi gerçek cihazda: check-in -> kart -> gizleme -> paylaşım -> bildirim akışı çalışıyor; ağ kullanımı yok.
4. SEC son incelemesinde açık Important bulgu yok; yedekleme kanıtı (K7) var.
5. S11 ve iOS gönderimi yalnızca K9 (Apple üyeliği) verilmişse; verilmediyse "iOS ertelendi" açıkça kayıtlı.
6. S12: gizlilik URL'si canlı, kesin ad ve bağlantı damgada, KVKK durumu (K10) belgelenmiş, kapalı test yayında.
7. Sonrası: 4 haftalık kapalı deneme (bu planın dışında) ve mağaza incelemesi.

---
**Onay noktası:** Plan Mode'da Claude üretir, **Batuhan onaylar.**
Onaydan sonra kod yazımı başlar. Bu dosya henüz commit edilmemiştir; **commit'i Batuhan atar.**

**Kural:** Uygulama planından saparsa, `plan.md` aynı commit içinde güncellenir (yeni depoda kopyası `plan.md` olarak yaşar; iki kopya ayrışırsa yeni depodaki geçerlidir ve bu dosya arşiv olur).

# 07 - Yayın kapıları (Release Manager incelemesi) - Haftik

Tarih: 2026-09-25. Rol: release-manager (Staff). Kapsam: yayın gözüyle salt okunur inceleme; kod, `app.json`, `eas.json` DEĞİŞTİRİLMEDİ; hesap/build/gönderim yapılmadı. Karar ve "GO" Batuhan'ındır.

Kanıt merdiveni (`~/.claude/team/ortak-standartlar.md`): K0 iddia, K1 kaynak/doküman okuma, K2 birim testi, K3 entegrasyon, K4 emülatör (bu projede hepsi **debug + Metro**), K5 gerçek cihaz veya **release/preview derlemesi**. Durum sözlüğü: **karşılandı** (kanıtlı), **kısmen**, **açık** (kanıt yok), **Batuhan kararı**.

Bu oturumda ben koştum (bugün): `npm run typecheck` temiz; `npm run lint` (`expo lint`) çıktısız/temiz; `npm test`: **71 suite, 863 geçti, 3 atlandı (S8 TZ T-02..07, bilinen), 0 kaldı** (K2). `git status`: **47 yol commit edilmemiş** (düzeltmeler + yeni testler + docs). Emülatör kapalı; K4 iddiaları `docs/emulator-*.md`'den alındı (kendim yeniden koşmadım).

Genel bulgu: **Release derlemesi (K5) kanıtı SIFIR.** Bugüne kadarki tüm cihaz kanıtı debug dev client'tan (`flags=[DEBUGGABLE...]`, Metro :8081, ASCII kopya `C:\hhk\haftik`). Yani ağ, dev menü yokluğu, merged manifest, izin listesi, targetSdk, boyut, release davranışı hâlâ "doğrulanmadı". Eldeki en güçlü release-özgü kanıt: `expo export` paket taraması (dev menü dizeleri 0 geçiş, `docs/s10-ops-raporu.md` bölüm 2; K4-eşdeğeri, APK değil).

---

## 1. Go/No-Go kapı listesi

### 1A. Hedef A: arkadaş APK (EAS `preview`, internal)

`preview` = `buildType: apk`, `developmentClient` yok, yani release varyantı (`__DEV__` false); G-serisi release kanıtları bu APK ile alınabilir (K5).

| # | Kapı | K | Durum | Kanıt dosyası / yer | Sahip |
|---|---|---|---|---|---|
| A1 | typecheck + lint + Jest yeşil | K2 | **karşılandı** | Bu oturum: yukarıdaki çıktılar. `expo-doctor` bugün koşulmadı; son bilinen 20/21 (Expo yama sürümleri geride, `CLAUDE.md` 09-24) | MOB/QA |
| A2 | Derleme kaynağı sabit: iş commit'li, build bir commit'ten | - | **açık** | 47 commit edilmemiş yol (git status). Kanıtın hangi sürüme ait olduğu belli olmaz | Batuhan (commit) |
| A3 | Kalıcı kimlik: paket adı `com.batuhan.haftik` (android + ios), şema `haftik`, ad Haftik tutarlı | K1 | **karşılandı (kimlik); Play tarafı açık** | `app.json`, `src/config/constants.ts`. Uyarı: yerel `android/` (gitignored) ESKİ prebuild (`applicationId 'com.anonymous.hhkscaffold'`); yayın kanıtı olarak kullanılamaz, EAS kendi üretir | Batuhan |
| A4 | Sürüm: `version 1.0.0`, `versionCode` EAS remote | K1 | **kısmen** | `eas.json`: `production.autoIncrement:true`, **`preview`te YOK**. `eas build:version:get` hiç koşulmadı. Aynı `versionCode`'lu ikinci APK'nın telefonda güncelleme olarak kurulup kurulmadığı doğrulanmadı (bkz. 3.3) | OPS |
| A5 | EAS hesabı + proje: `extra.eas.projectId` | - | **açık** | `app.json`te yok (`eas init` yapılmamış) | Batuhan |
| A6 | Preview APK alınmış, indirilebilir | K5 | **açık** | Build yok | Batuhan (`eas build`) |
| A7 | İmza: EAS managed keystore + indirilmiş yedek | - | **açık** | İlk build sonrası `eas credentials`; `.gitignore` `*.keystore`, `credentials.json` kapsıyor (K1). Not: `*.jks`, `*.key` de var | Batuhan |
| A8 | Dev menü release'te yok | K4 (paket) / K5 (APK) | **kısmen** | `docs/s10-ops-raporu.md` bölüm 2: hbc + no-bytecode 0 geçiş, dev paketi pozitif kontrol. APK üzerinde G-06 (gözle) açık | OPS/QA |
| A9 | Merged manifest / izin listesi / FCM / AD_ID | K5 | **açık** | G-03 yalnız debug'da yapıldı (INTERNET, VIBRATE, WAKE_LOCK, ACCESS_NETWORK_STATE, c2dm, ~10 launcher rozet izni; `emulator-test-sonuclari.md` G-03/BLG-10). Release merged (G-09) yok | OPS |
| A10 | Ağ gözlemi (G-01 uçak modu, G-02 PCAPdroid) | K5 | **açık** | Hiç yapılmadı. `expo-notifications` FCM/`exp.host` kodu pakette ölü kod (`s10-ops-raporu` bölüm 3) | Batuhan+OPS |
| A11 | Yedek kapalı (K7) | K1+K4 debug | **kısmen** | `allowBackup="false"` prebuild'de (K1); debug `flags`ta ALLOW_BACKUP yok (K4). Release'te G-05 açık | OPS |
| A12 | Emülatör turu (debug) ve Blokör düzeltmeleri | K4 | **kısmen** | BLG-01..05 düzeltme + yeniden doğrulama GEÇTİ (`emulator-tekrar-dogrulama.md`). Sonradan yapılan YB-1/2/3/5/7 + Bugün tek-ekran sığma düzeltmeleri yalnız K2 (`safe-area-and-lock`, `checkin-single-screen-fit` testleri); **emülatörde yeniden görülmedi** | MOB/QA |
| A13 | Gerçek cihaz turu (Blokör satırları) | K5 | **açık** | `manual-checklist.md` Sonuçlar tablosu boş; 0 satır gerçek cihazda | Batuhan |
| A14 | Bildirim zinciri: Pazar "Karnen hazır" teslimi (B-06), saat dilimi/DST (B-07..09), süreç kapalıyken teslim (D-01), pil (D-02/03), reboot (D-04) | K4/K5 | **açık** | B-06..09 ATLANDI (emülatörde adb root ile yapılabilirdi), D-02/03/05 emülatörde yapılamaz. Jest T-02..07 `skipped` (TZ) | Batuhan |
| A15 | Paylaşım gerçek hedefte (WhatsApp/Galeri), K5 mesaj taşınması, PNG'nin hedefte görünümü | K5 | **açık** | P-04 kısmi (paylaşım sayfası açıldı, hedef yok), P-05 emülatörde yapılamaz. Ürünün "wow anı" gerçek hedefte hiç görülmedi | Batuhan |
| A16 | Güvenlik raporu: açık Important yok | K1-K2 | **kısmen** | `s10-guvenlik-raporu.md`: I-1..I-4 kapandı; I-2 kısmi (INTERNET kararı + merged), I-5/I-6/N-7/N-9 Batuhan kararı; G-01/02/05/06 cihaz kanıtı bekliyor | SEC |
| A17 | Marka varlıkları: ikon, adaptive ikon, splash, bildirim simgesi | K1 | **açık (Önemli)** | `assets/images/icon.png` GÖRÜLDÜ: Expo şablon logosu; `splash-icon.png` (228x213) Expo şablon glifi, `#208AEF` zemin; `android-icon-*` ve `expo.icon` şablon tarihli (2026-09-22 12:41) ve `s12-magaza-icerigi.md` bölüm 3 "yer tutucu" der. Bildirim simgesi genel halka (BLG-11) | Batuhan/UX |
| A18 | Kart damgası `Haftik · [mağaza bağlantısı]` | K1 | **Batuhan kararı** | `constants.ts` `STORE_LINK_PLACEHOLDER`; her paylaşılan PNG'de köşeli parantezli yer tutucu görünür (emulator PNG'sinde doğrulandı) | Batuhan |
| A19 | Koyu tema (B14): `userInterfaceStyle: "automatic"` iken koyu modda kontrast/parlak kutular | K0 | **Batuhan kararı** | `CLAUDE.md` B14; koyu modda emülatör görüntüsü hiç alınmadı | Batuhan |
| A20 | Tek yönlü kapı: SQLite `MIGRATIONS` v2 = `_v2_mechanism_proof_placeholder` sütunu | K1 | **Batuhan kararı** | `src/data/migrations.ts:102-107`, SEC N-7. İlk harici kurulumdan sonra kaldırmak v3 geçişi ister | Batuhan |
| A21 | Aydınlatma/KVKK: "yalnızca yakın çevre, hukuki görüş sonra" kararı yazılı | - | **açık** | `plan.md` S12: "kararın yazılı işlenmesi" hâlâ açık; davet mesajı "veri sadece telefonunda" diyor, iddia A10'a bağlı | Batuhan |
| A22 | Ölçüm/E1 altyapısı (sayaçlar, D7, rapor) | K2-K3, K4 kısmi | **kısmen** | Jest yeşil; R-01/R-03 emülatörde GEÇTİ; R-02 hedefte `.txt` okunması cihazda açık | MOB/QA |
| A23 | Geri alma/yeniden dağıtım planı | - | **karşılandı (bu belge, bölüm 6)** | - | RM |
| A24 | "GO" | - | **Batuhan** | - | Batuhan |

**A kapı kararı (bugün): NO-GO.** Ama yol kısa: A2, A5-A7 (Batuhan aksiyonları) + yapılandırma kararları (bölüm 5) + tek preview build + Batuhan'ın kendi telefonunda tur. Önerilen kademe: **A0** yalnız Batuhan'ın telefonu (A8-A15 kanıtları) -> **A1** 3-5 yakın arkadaş (3-7 gün) -> genişleme yalnız Blokör açık değilse.

### 1B. Hedef B: Play kapalı test

Önkoşul: A0/A1 turu geçmiş (A6-A15 yeşil). Ek kapılar:

| # | Kapı | K | Durum | Kanıt / yer | Sahip |
|---|---|---|---|---|---|
| B1 | Play Console hesabı açık + kimlik doğrulaması bitti | - | **açık** | Hesap yok (25 USD tek sefer; kişisel; doğrulama günler sürebilir) | Batuhan |
| B2 | Production AAB alınmış, `versionCode` artmış, **targetSdk 36 kanıtlı** | K1 (kaynak) / K5 (AAB) | **kısmen** | Kaynak: `node_modules/react-native/gradle/libs.versions.toml` `targetSdk="36"`, `compileSdk="36"`, `minSdk="24"` (K1). AAB'de `targetSdkVersion` okunmadı (apkanalyzer/bundletool). Play şartı: bkz. 2.5 | OPS |
| B3 | Play App Signing + upload key yedeği | - | **açık** | Rehber `s12-yayin-rehberi.md` bölüm 2 (yazılı, uygulanmadı) | Batuhan |
| B4 | Gizlilik politikası URL'si canlı, yer tutucusuz | K1 | **açık** | `site/` taslak: `[iletişim e-postası]`, `[tarih]`, `[sorumlu kişi/unvan]`, `[mağaza bağlantısı]`, `noindex`, TASLAK banner'ları; barındırma/alan adı yok | Batuhan |
| B5 | K10 KVKK görüşü ya da yazılı "sonra" kararı (Play'de herkese açık kanal = kapalı deneme dışı, spec) | - | **Batuhan kararı** | `plan.md` K10; sitede sorumlu bölümü boş | Batuhan |
| B6 | Data safety formu | K1 | **kısmen** | Taslak `s10-guvenlik-raporu.md` bölüm 4 ("toplamıyor/paylaşmıyor"). Release ağ kanıtı (A10) ve AD_ID/merged (A9) olmadan "kesin" sayılmaz | SEC/Batuhan |
| B7 | Health apps beyanı | K0 | **Batuhan kararı (S12 kararı: dürüst beyan)** | Form içeriği henüz doldurulmadı; Console'da doğrulanacak | Batuhan |
| B8 | İçerik derecelendirme (IARC) + hedef kitle 18+ | K0 | **açık** | Beklenen cevaplar `s12-magaza-icerigi.md` bölüm 2 (tahmin) | Batuhan |
| B9 | Mağaza varlıkları: 512x512 ikon, 1024x500 öne çıkan grafik, >=2 (öneri 4-8) ekran görüntüsü, TR metinler | - | **açık** | `assets/` altında yalnız şablon ikon; ekran görüntüsü/grafik yok. Metinler taslak hazır (`s12-magaza-icerigi.md`, sayımlar komutla doğrulanmadı) | UX/Batuhan |
| B10 | K5 bağlantı damgada kesin, kartlar yeniden üretilmiş | K1 | **açık** | `STORE_LINK_PLACEHOLDER` | Batuhan |
| B11 | İletişim e-postası + destek | - | **açık** | Her yerde yer tutucu | Batuhan |
| B12 | Ad/marka çakışma kontrolü (Play, alan adı, sosyal, TÜRKPATENT) | - | **açık** | Yalnız genel web taraması yapılmış (`s12-magaza-icerigi.md`) | Batuhan |
| B13 | Uygulama içi gizlilik bağlantısı canlı URL'ye bağlı | K2 | **açık (kod değişikliği)** | `settings-view.tsx:168` "Gizlilik politikası (yakında)" | MOB (Batuhan onayıyla) |
| B14 | Testçi >= 12 opt-in (hedef 20), davet akışı bir gerçek hesapla uçtan uca | K5 | **açık** | Bkz. 3.4 | Batuhan |
| B15 | Kapalı test kanalında AAB "Available to testers" | K5 | **açık** | - | Batuhan |
| B16 | Mağaza metni <-> uygulama <-> site tutarlılığı imzalı | K1 | **kısmen** | Bölüm 4 (bulgular) | RM/SEC |
| B17 | 14 gün sayacı + üretim erişim başvurusu | K5 | **açık (sonraki aşama)** | - | Batuhan |

**B kapı kararı (bugün): NO-GO.** B1, B4, B9, B10, B11, B13 hiç başlamamış; süre belirleyicileri hesap doğrulama ve testçi bulma.

---

## 2. Blokörler (yayını durduracaklar)

Sınıf: **BLK-A** = arkadaş APK'sını durdurur, **BLK-B** = Play kapalı testi durdurur, **ÖNEMLİ** = durdurmaz ama kullanıcı yüzüne çıkar.

| # | Konu | Sınıf | Neden / kanıt | Çıkış ölçütü |
|---|---|---|---|---|
| 2.1 | **Release (K5) derlemesi hiç yok** | BLK-A | Ağ, merged manifest, dev menü, targetSdk, FCM, boyut yalnız kaynak/debug kanıtlı. Site ve davet mesajı "veri gönderilmez" iddiasını taşıyor | Preview APK + G-01/02/03/05/06/09 çıktıları saklanmış |
| 2.2 | **INTERNET izni kararı** | BLK-A (karar) | `app.json` `blockedPermissions` yalnız depolama + SYSTEM_ALERT_WINDOW; ana manifestte `INTERNET` şablondan; kütüphaneler de ekler. Site: "ağ isteği yapmaz". Öneri 4.1 | Karar + preview'da ölçüm |
| 2.3 | **Ürünün çekirdek akışı gerçek hedefte hiç görülmedi** (paylaşım -> WhatsApp/Galeri; Pazar kart bildirimi teslimi) | BLK-A | B-06/P-04/P-05 emülatörde yapılamadı/atlandı. E1 ölçütü tam bu akışa bağlı | A13-A15 gerçek cihazda geçmiş |
| 2.4 | **Kod commit'te değil** (47 yol) | BLK-A | Kanıt bir sürüme bağlanamaz; geri alma imkansız | Batuhan commit + tag |
| 2.5 | **targetSdk / Play güncel şartı** | BLK-B (kanıt) | Doğrulandı (WebSearch): **31 Ağustos 2026'dan beri yeni uygulama ve güncellemeler API 36 (Android 16) hedeflemeli** (uzatma en geç 1 Kasım 2026 talep edilebiliyordu; yeni uygulama için işine yaramaz). Bugün 25 Eylül: şart yürürlükte. RN 0.86 varsayılanı `targetSdk=36` (K1). AAB'de kanıtlanmalı | `bundletool`/`apkanalyzer` çıktısı: targetSdkVersion 36 |
| 2.6 | **Özgün ikon/splash yok** (Expo şablon logosu) | BLK-B, A'da ÖNEMLİ | `icon.png` şablon; Play 512 ikonu ve öne çıkan grafik zorunlu. Arkadaşlarda ana ekranda başka bir markanın logosu görünür | Özgün ikon (adaptive fg/bg/mono), splash, Play 512 |
| 2.7 | **Kart damgasında `[mağaza bağlantısı]`** | BLK-B, A'da Batuhan kararı | Her paylaşılan PNG'de yer tutucu; hem kırık görünür hem paylaşım oranını düşürür. Sabit tek yerde (`constants.ts`), ama `CardView.test.tsx` damga beklentisi de değişir (bilinçli ad/bağlantı değişikliği, Batuhan onayı) | Kesin kısa URL (site alan adı) ya da bilinçli geçici metin |
| 2.8 | **Gizlilik URL'si canlı değil** (+ K10) | BLK-B | `site/` taslak; alan adı/barındırma yok; Console'da zorunlu | Canlı URL, yer tutucusuz, TASLAK/noindex kaldırılmış |
| 2.9 | **Play hesabı + doğrulama** | BLK-B | Süre belirsizliği; başlatılmadı | Doğrulanmış hesap |
| 2.10 | **Store varlıkları** (ikon 512, grafik 1024x500, ekran görüntüleri) yok | BLK-B | - | Yüklenmiş |
| 2.11 | **Sürüm/imza süreci koşulmadı** | BLK-A | `projectId`, keystore, `versionCode` yok; `preview`te `autoIncrement` yok | `eas build:version:get` çıktısı + yedek keystore |
| 2.12 | **Tek yönlü kapı: migration v2 placeholder sütunu** | Karar (A'dan ÖNCE) | İlk harici kurulumdan sonra şema kalıcı | Kaldır (testlerle, dikkatli) ya da "kalsın" yazılı |
| 2.13 | **Koyu tema kararı** (`userInterfaceStyle`) | ÖNEMLİ, build'den ÖNCE karar | Native config; sonradan değişirse yeni build gerekir; koyu mod hiç görülmedi | Karar + (a) `light` ise tek satır |
| 2.14 | Bilinen açık, bloklamaz: YB-4 (font 2.0 sekme etiketi), YB-6 (config değişiminde rota sıfırlanır), BLG-09 (bildirime dokununca yönlendirme yok), BLG-11 (bildirim simgesi), B11 | ÖNEMLİ/Düşük | `emulator-*.md` | Kabul + `plan.md`'de "bilinen sınır" kaydı (belge + Batuhan onayı) |
| 2.15 | `decode-uri-component@0.2.2` üretim paketinde (deep link DoS, kendine) | Düşük | `s10-ops-raporu` bölüm 4 | Expo yaması ya da kabul kaydı |

---

## 3. EAS / Play akışının gerçekçi riskleri ve süre

### 3.1 Ortak: EAS
- **Kota/kuyruk:** ücretsiz katmanda aylık sınırlı build (Expo faturalama sayfasına göre 15 Android + 15 iOS/ay, düşük öncelikli kuyruk, 45 dk zaman aşımı; **doğrula: docs.expo.dev/billing/plans**). Kuyruk dakikalardan saatlere değişebilir. Yorum: her native yapılandırma değişimi yeni build demektir; kararları **tek seferde** ver (bölüm 5, madde 1-8), boş build harcama.
- **Türkçe yol:** bulut build etkilenmez (arşiv yüklenir); `eas build --local` yolu `Geliştirme için` yolunda kırılır (CLAUDE.md tuzağı). Yerel `assembleRelease` için ASCII kopya `C:\hhk\haftik` gerekir ve Android SDK/Java (Windows'ta EAS local desteklenmez, yerel Gradle gerekir).
- **Çalışma ağacı:** commit edilmemiş değişiklikle build alınırsa hangi kodun paketlendiği kanıtlanamaz; önce commit + etiket.
- **`eas init`** `app.json`'a `projectId` (ve `owner`) yazar: yeni bir commit'lik dosya değişikliği; slug `haftik` başka projede alınmışsa çakışır.
- **İlk build keystore sorusu:** "Generate a new keystore" Evet; ilk build'den sonra `eas credentials` ile yedek al. Yedek olmadan kaybedilirse Play App Signing (upload key sıfırlama) kurtarır, ama preview APK dağıtımında **güncelleme zinciri kırılır** (aynı imza şart).

### 3.2 Play hesabı ve ilk yükleme
- **Doğrulama süresi:** kimlik + telefon; rehber "2-5 iş günü" diyor (kaynak beyanı, doğrula: Console). Başarısız doğrulamada 25 USD iade edilmez. Türkiye'den ödeme için uluslararası kart gerekebilir. **Hesabı A turuyla paralel, şimdi aç** (kritik yol B'de bu).
- Kişisel hesaplarda ek olarak gerçek Android cihaz doğrulaması istenebiliyor (**doğrula**); Batuhan'ın kendi Android cihazı olmalı.
- **İlk yükleme:** elle Console (rehber Yol A). Paket adı bu an kalıcı bağlanır; A3 kapısı bunun önkoşulu. İlk kapalı test sürümü Google incelemesinden geçer (rehber: gün sürebilir; sabit bir SLA yok, **doğrula**).
- Play App Signing zorunlu: Play'den kurulan sürüm Google anahtarıyla imzalıdır, EAS'ın preview APK'sı upload anahtarıyla; **ikisi aynı telefonda birbirinin üstüne kurulamaz** (bkz. 3.5).
- Form sırası tuzağı: Data safety/Health/IARC/hedef kitle/reklam/gizlilik URL'si tamamlanmadan kapalı test sürümü gönderilemez. Gizlilik URL'si canlı olmadan yol tıkanır (2.8).

### 3.3 Sürüm sayacı
- `appVersionSource: remote`: `versionCode` EAS'ta. `preview` profilinde `autoIncrement` yok; aynı `versionCode`'lu ikinci APK'nın mevcut kurulumun üstüne güncelleme olarak kurulması sideload'da doğrulanmadı. Öneri: preview'a da `autoIncrement:true` (Play upload'ında `versionCode` her zaman öncekinden büyük olmak zorunda, boşa gitmesi zarar değil). **Sürüm numarasını build'den önce netleştir.**
- `expo.version` "1.0.0" kullanıcıya görünen ad; arkadaş APK'sı ve Play kapalı test aynı 1.0.0 kalabilir, ayrım `versionCode`la.

### 3.4 14 gün sayacı ve testçi bulma (küçük çevre)
Koşul (Google Console Help 14151465, WebSearch ile teyit): **13 Kasım 2023 sonrası açılan kişisel hesapta üretime çıkmadan >= 12 test kullanıcısı, kesintisiz 14 gün opt-in.** Yalnız davetli olmak yetmez, opt-in + kurulum sayılır. 2026 kaynakları ayrıca gerçek kullanım kontrolü (aktif etkileşim) anlatıyor; ikincil kaynak, **doğrula**. Kuruluş hesabında şart yok (D-U-N-S ister; bu ürün için orantısız).

Gerçekçi strateji:
1. **Hedef 20 opt-in** (12 + %40 tampon): birkaç kişi 14 gün içinde çıkar/atlar; sayaç bozulursa sıfırlanma riski var (Console göstergesi esas). Gerekirse 25-30 davet.
2. **Yalnız gerçek Android + gerçek Google hesabı** (spec E11). iPhone'lular sayılmaz. Bire bir WhatsApp daveti (`s12-magaza-icerigi.md` bölüm 4 mesaj taslakları hazır).
3. **Ana çevre 12'ye yetmezse:** aile, iş/okul çevresi, mevcut sosyal medya takipçisi (Türkçe). Karşılıklı test topluluklarıyla (tester-exchange grupları) kapatmak mümkün ama üç bedeli var: (a) E1 ölçümünü kirletir (tanımadık, 18+ doğrulanmamış kitle), (b) Gmail adresleri toplanır (KVKK ihtiyatı, rapor "kimlik içermez" ama adres listesi vardır), (c) tek seferlik açıp bırakan testçiler "aktif kullanım" beklentisini karşılamayabilir. **Ücretli test servislerini önermiyorum** (ürün Play'de gerçek kullanıcı kanıtı bekliyor; politika/itibar riski, doğrula).
4. **Sayaç kohortu ile E1 kohortunu ayır:** E1 (paylaşım oranı) tanıdık kitle + "kendiliğinden" şartı; Play sayacı için ek kişiler E1 payına yazılmaz (rapor almayın ya da ayrı etiketleyin).
5. **Zamanlama:** ilk kart eşiği 3 dolu gün; davetleri Pzt/Sal yap; 14 gün = iki Pazar (G7 nötr, G14 çağrılı).
6. Google Groups ile toplu yönetim mümkün; ekleme/çıkarma kolay, ama grup üyesi e-postalar Batuhan'a görünür (KVKK notu).

### 3.5 APK -> Play geçişi = VERİ KAYBI (yayın planını etkiler)
Veri yalnız cihazda, yedek kapalı, imzalar farklı: preview APK'lı bir testçi Play sürümünü kurmak için **önce kaldırmak zorunda** ve tüm check-in geçmişi silinir. Sonuçlar:
- Arkadaş APK'sıyla başlayan 20-30 kişilik kohortu sonradan Play'e taşırsan D7/E1 ölçümü sıfırlanır.
- **Öneri:** APK yalnızca **smoke turu** (Batuhan + 3-5 kişi, 3-7 gün) olarak kullanılsın; E1/Play kohortu doğrudan Play kapalı testinde başlasın (aynı 14 gün hem Play şartını hem E1 ilk iki haftasını kapsar). Bu, Batuhan'ın "önce APK, sonra Play" kararıyla çelişmez; yalnızca APK'nın ölçeğini sınırlar. Alternatif (APK'yı geniş dağıtmak) ölçümü Play geçişinde bilinçli kayıpla kabul etmek demektir.

### 3.6 Süre tahmini (varsayım: Batuhan haftada ~10 saat; Play süreleri Google'a bağlı, tahmin)
| Aşama | Süre | Not |
|---|---|---|
| Kararlar + tek seferlik yapılandırma + ikon/damga + commit | 2-4 gün | İkon/tasarım belirsiz kalem |
| EAS init + preview build (kuyruk dahil) | 0,5-1 gün | Kota/kuyruk riski |
| Batuhan'ın cihazında release turu (G-serisi + blokör satırlar) | 1-2 gün + D-05 için bir Pazar | Bildirim/Pazar zinciri takvime bağlı |
| 3-5 arkadaş smoke | 3-7 gün | Bir Pazar içermeli |
| **Play hesabı + doğrulama (paralel)** | 2-7 gün | Kritik yol B'de |
| Site canlı, formlar, ekran görüntüleri, K10 kararı | 3-5 gün | Cihazdan ekran görüntüsü release sonrası |
| Kapalı test ilk sürüm incelemesi | 1-7 gün | Google SLA'sı yok |
| 14 gün opt-in sayacı | 14 gün | Testçi bulunmuşsa; bulunamazsa uzar |
| Üretim erişimi başvurusu incelemesi + üretim yayını | ~1-2 hafta | Rehber ~7 gün diyor, **doğrula** |
| **Toplam A (APK smoke hazır)** | **~1-2 hafta** | |
| **Toplam B (üretim erişimine)** | **~6-8 hafta** GO'dan | Testçi bulma ve hesap doğrulama yayılmayı belirler |

---

## 4. Çapraz tutarlılık (mağaza metni <-> uygulama <-> izinler <-> site <-> app.json)

| # | Konu | Bulgu | Durum |
|---|---|---|---|
| 4.1 | **"Ağ yok / veri gönderilmez" iddiası** | `site/gizlilik.html` satır 35-36 ("ağ isteği yapmaz"), 65 ("internet üzerinden veri göndermez ve sunucudan veri almaz. Uzaktan güncelleme… kullanılmaz"), `site/index.html` 46 (sunucuya veri göndermez). Karşı kanıt: manifestte `INTERNET`, FCM servisleri, c2dm izni, `exp.host` ölü kod. Yalnız K1 (kod okuma + Jest yasak-ad taraması). Mağaza metni bu cümleyi BİLİNÇLİ yazmıyor (iyi). | **Site iddiası kanıtsız (K1).** Öneri: preview APK'da G-02 PCAPdroid kaydı + merged manifest alınsın. Sonuç temizse mevcut metin "ağ isteği yapmaz" olarak doğrulanmış olur; INTERNET'i `blockedPermissions` ile kapatmak (profil bazlı `app.config.js`) mekanik kanıt verir ama FCM/expo-notifications release'te INTERNET'siz davranışı cihazda ayrı test ister (`s10-ops-raporu` bölüm 3). Öneri: önce ölç, sonra karar. Site cümlelerini ancak ölçümden sonra kesin say |
| 4.2 | **"Uyku" etiketi vs mağaza metni** | Uygulamada `Uyku` (`src/constants/emoji.ts:14`, kare 2 ekran görüntüsü), mağaza metni "tempo, dinlenme, harcama, sosyallik" der; site sayfası "hareket, uyku, harcama, sosyallik" der. Batuhan kararı: etiket kalır, Health beyanı dürüst. | **Karar tutarlı.** Kalanlar: (a) Health apps formu Console'da doldurulup ekran görüntüsü alınmalı; (b) Data safety "sağlık verisi toplanmaz" ile Health apps "hareket/uyku beyanı" **çelişmez** çünkü Google'ın "toplama" tanımı cihaz dışına çıkmayı ister (doğrula: Console tanımı); (c) `s12-magaza-icerigi.md` bölüm 5 kontrol maddesi "uyku sözcüğü hiçbir mağaza metninde yok" ekran görüntüsü metinleriyle çelişir: kare 2'de ve uygulama içinde görünür (metin kuralı değil, beyan tutarlılığı) |
| 4.3 | **Ad ve kimlik** | `app.json` name/slug/scheme = Haftik/haftik/`haftik`; `constants.ts` `Haftik`; paket `com.batuhan.haftik`; Play adı taslağı 28 karakter. | **Tutarlı (K1).** Alan adı/mağaza/marka/TÜRKPATENT kontrolü **Batuhan'da, yapılmadı**; çakışırsa ad + site + damga + metin + (paket adı dahil değil, o kalıcı) değişir. Marka çakışırsa paket adı `com.batuhan.haftik` yine kalır (kimlik geliştirici alanında); yalnız görünen ad değişir |
| 4.4 | **Damga <-> paylaşım <-> site** | Kart damgası `[mağaza bağlantısı]`; site mağaza düğmeleri yer tutucu; Play kayıt URL'si paket adından türetilebilir (`play.google.com/store/apps/details?id=com.batuhan.haftik`), ama kapalı testte herkese açık değil, opt-in bağlantısı ayrıdır. | **Açık.** Öneri: damgada kısa, stabil bir alan adı/site URL'si (site mağaza sayfasına yönlendirir); mağaza yayına girince site güncellenir, kart yeniden derlemek gerekmez. Alan adı Batuhan'da |
| 4.5 | **Gizlilik politikası <-> uygulama** | Uygulama içi bağlantı "(yakında)" (`settings-view.tsx:168`); Console'a URL girilmeden kapalı test olmaz; Play politikası hassas veri işleyen uygulamalarda uygulama içinde de politika bağlantısı ister (**doğrula**). | **Açık (B13, kod değişikliği, yeni build).** Bunu preview build'e sığdırmak için 5. bölümdeki tek-build listesine ekle |
| 4.6 | **Data safety <-> merged manifest** | Taslak "toplanmıyor/paylaşılmıyor; reklam kimliği yok". Merged manifestte `com.google.android.gms.permission.AD_ID` çıkarsa (transitif bağımlılıktan) reklam kimliği beyanı ve çelişki oluşur; debug G-03 listesinde AD_ID görülmedi ama release'te bakılmalı. | **Açık (A9).** apkanalyzer/`aapt dump permissions` çıktısında AD_ID, c2dm ve launcher rozet izinleri (BLG-10) satır satır gözden geçir; gerekiyorsa `blockedPermissions`a ekle |
| 4.7 | **Deneme raporu dili** | Site "kimlik/içerik içermez, takma adlı olabilir" (anonim değil); uygulama Alert'i aynı; `settings-view` düğmesi tüm derlemelerde görünür (B12: "yalnızca preview'da göster" ürün kararı açık). Play kitlesine 'deneme raporu' düğmesi anlamsız kalabilir. | **Tutarlı; ürün kararı açık (Düşük).** Play production'da gizlemek ayrı karar |
| 4.8 | **Hedef yaş 18+** | Uygulama, site "çocuklara yönelik değil", mağaza metni. Karar S12'de yazılı. IARC/Hedef kitle formları henüz doldurulmadı. | **Tutarlı (K1); formlar açık** |
| 4.9 | **Bildirim açıklaması** | Site "yerel, push yok; sabit metin"; kod: `no-push.test.ts` (K2) + emülatör 82 sn gecikmeli teslim (K4). | **Tutarlı (K1-K4);** FCM ölü kod ölçümü A10'a bağlı |
| 4.10 | **iOS iddiaları** | Site: iOS yedek "kesinleşmemiş"; mağaza metni Android-only kapalı deneme. iOS Apple üyeliği yok. | **Tutarlı.** iOS metinleri/`ios.icon`/`supportsTablet`/gizlilik etiketi iOS gönderimine kadar yayın kapısı dışında |
| 4.11 | **Eski adlı/eski durumlu belgeler (yanıltıcı)** | `docs/manual-checklist.md` K-05/P-07/G-07: "Haftalık Hayat Karnesi" ad ve damga "Haftalık Hayat Karnesi · [mağaza bağlantısı]" (güncel: "Haftik · …"); başlık "59 madde" tablodaki gerçek sayıyla uyuşmuyor (emulator raporu 65 satır). `s12-magaza-icerigi.md` üst notu ve `s12-yayin-rehberi.md` bölüm 1.4/7 + "bulunan noktalar": paket adı yer tutucu, `site/` yok, `ios.bundleIdentifier` yok diyor (hepsi artık yanlış). | **Düşük ama risk:** Batuhan kılavuzu ikinci kaynakla çelişik okur. Belge güncellemesi (kod değil) önerilir |
| 4.12 | **Ekran görüntüsü kuralı** | Kare 2 "Uyku" etiketi görür; kare 5 (gizlilik) "yalnızca bu telefonda kalır" mağazaya ağ kanıtından SONRA girmeli; kartın damgası kesin ad/URL'li olmalı. | Bekleyen kalemler (B9/B10/A10) |

---

## 5. Release derlemesiyle yapılacak kanıt işleri (`preview` APK)

Sıra önemli: **önce ölç, sonra beyan**.

**Build öncesi tek-seferlik yapılandırma kararları (her biri yeni native build ister; hepsini bir build'de topla):**
1. `userInterfaceStyle` (B14): `light` mi, tema mı? 2. `INTERNET`/AD_ID/rozet izinleri (`blockedPermissions`) kararı: önce ölçüm için **mevcut haliyle** ilk preview'ı al, gerekirse ikinci build. 3. Bildirim simgesi/rengi (BLG-11) için `expo-notifications` config plugin'i gerekir; plugin push yetkisi getirir mi (`aps-environment` iOS) kontrol edilerek karar (mevcut karar: eklenmedi). 4. İkon, adaptive ikon, splash. 5. `extra.eas.projectId`/`owner` (`eas init`). 6. `preview` `autoIncrement`. 7. Damga sabiti. 8. N-7 migration temizliği. 9. Uygulama içi gizlilik bağlantısı (yalnız B için gerekirse sonraya kalabilir).

**Kanıt işleri (K5, her çıktı saklanır, `docs/` dışına ya da `docs/` altına yazma kararı Batuhan'ın):**
| # | İş | Komut / yöntem | Beklenen | Kapattığı kapı |
|---|---|---|---|---|
| E1 | **Merged manifest + izin listesi** | `apkanalyzer manifest print app.apk` ve `aapt dump permissions app.apk` (ya da `bundletool dump manifest` AAB için) | Şema `haftik`, `allowBackup=false`, `INTERNET` (gerekçeli ya da yok), READ/WRITE_EXTERNAL_STORAGE ve SYSTEM_ALERT_WINDOW yok, `AD_ID` yok, rozet/c2dm izinleri değerlendirilmiş; `hhkscaffold`/`expo-updates` yok | A9, 4.6 |
| E2 | **targetSdk / minSdk / versionCode** | `apkanalyzer manifest target-sdk app.apk` (ve AAB'de `bundletool`) | 36 / 24 / EAS değeri | B2, 2.5 |
| E3 | **Debuggable değil** | `adb shell dumpsys package com.batuhan.haftik` çıktısında `flags=[...]` satırı | `DEBUGGABLE` YOK, `ALLOW_BACKUP` YOK (G-05) | A11 |
| E4 | **Dev menü yokluğu** | Cihazda tüm ekranlar (G-06) + paket taraması tekrarı (G-08) | 🕒 yok, 0 geçiş | A8 |
| E5 | **Ağ: uçak modu tam akış** | G-01 | Tüm akış çalışır | A10 |
| E6 | **Ağ: PCAPdroid, yalnız Haftik, internet AÇIK, tam akış + bildirim beklenerek** | G-02, dışa aktar | Bağlantı sıfır (FCM/exp.host/analitik/güncelleme yok). Uygulama açılışı, ilk çalıştırma, bildirim planlama, paylaşım, rapor, silme dahil | A10, 4.1 |
| E7 | **İzin/veri kullanımı ekranları** | G-07 | Yalnız Bildirimler, ~0 B | A9 |
| E8 | **Log taraması (release)** | G-04 `adb logcat -c` ... `-d` | Kullanıcı verisi yok | A16 |
| E9 | **Boyut** | APK/AAB dosya boyutu + `apkanalyzer apk summary`; Hermes `.hbc` (OPS: 3,1 MB paket) | Kayıt (eşik yok; karar için not) | Bilgi |
| E10 | **Pazar/Bildirim zinciri** | B-02, B-04, B-06, B-07/08 (saat dilimi), D-01, D-04 | Zamanında/tek bildirim, süreç kapalıyken, reboot sonrası | A14 |
| E11 | **Paylaşım hedefleri** | P-04, P-05, P-06 (PNG metadata), P-08 | WhatsApp'ta net 9:16, gizli satır `???`, damga; mesaj taşınıp taşınmadığı yazılı | A15 |
| E12 | **Silme/yedek** | A-03, A-04, G-05 | Boş veri, bildirim dirilmez | A16 |
| E13 | **Koyu mod görüntüsü** (karar `light` değilse) | `adb shell cmd uimode night yes` + üç ekran | Kontrast kabul | 2.13 |
| E14 | **Rapor çıktısı hedefte** | R-02 | `.txt` okunur | A22 |
| E15 | **Sideload güncelleme davranışı** | Aynı `versionCode`'lu iki APK; ya da `autoIncrement`'li iki build üst üste | Güncelleme kurulumu veri korunarak çalışır | 3.3 |

Yerel `assembleRelease` yolu (opsiyonel, EAS kotasını harcamamak için): ASCII kopyada (`C:\hhk\haftik`) `npx expo prebuild --clean` + `cd android && gradlew assembleRelease`; **keystore ayrı sorun** (debug keystore ile imzalanır, yalnız izin/manifest/ağ kanıtı için geçerli; dağıtım APK'sı olarak değil). Bu, Android SDK/Java gerektirir (bu makinede kurulu olup olmadığı doğrulanmadı; emülatör var, yani SDK büyük olasılıkla var).

---

## 6. Sürüm, kanal stratejisi ve geri alma

### 6.1 Kanal sırası (riskle eşleşmiş)
0. **Batuhan'ın telefonu, preview APK** (E1-E15). 1. **3-5 yakın arkadaş, preview APK**, 3-7 gün, bir Pazar dahil; hedef: çökme/izin/bildirim/paylaşım sürprizleri, yorum toplama. 2. **Play kapalı test** (E1 kohortu + 14 gün sayacı; hedef 20). 3. **Üretim** (aşamalı yayın % kademeli). OTA/`expo-updates` yok (E3/K6), kill switch yok.
- Sürüm: `version 1.0.0`; `versionCode` EAS remote; her dağıtılan build için **git etiketi** (`v1.0.0-preview.N`, `v1.0.0-closed.N`) Batuhan atar; kanıtlar etikete bağlanır.
- Gate-to-gate: bir üst kanala geçiş için alt kanalda açık Blokör = 0 ve E1-E15 kayıtları var.

### 6.2 Geri alma planı (kill switch yok, bu yüzden "önceden" kurulur)
| Durum | Eylem | Not |
|---|---|---|
| Preview APK'da Blokör | Arkadaşlara "kaldır/kurma" mesajı, düzeltilmiş APK yeni `versionCode` ile | İmza aynı olmalı (keystore yedeği), yoksa kaldır-kur = veri kaybı |
| Kapalı testte Blokör | Console'da testi durdur / sürüm kaldır; testçilere mesaj; **aynı `versionCode` yeniden yüklenemez**, düzeltme daha yüksek `versionCode` | Eski ikiliyi geri yüklemek = eski koddan yeni `versionCode` ile derleme (etiketten) |
| Şema geri dönüşsüzlüğü | Kurulu kullanıcıda `user_version` v2; eski ikili v2 şemayı tanımaz olabilir. Kural: yama sürümlerinde şema değişikliği yok; şema değişen sürüm ayrı, yükseltme yolu K3 testli, **geri dönüş yolu yok** kabul | A20 (N-7) karar |
| Üretim | Aşamalı yayın (%5-10-25...), Play vitals eşiği; durdurma = yayını duraklat/halt | Çökme/ANR izlenmeli |
| Kalıcı kimlikler | Paket adı, imza (upload key), Play App Signing: geri dönüşsüz kapılar; A3/B3 kapanmadan Console'a yükleme YOK | Yedek keystore olmadan ilk yükleme yok |
| Yanlış beyan | Data safety/Health/politika yanlışı Console'da düzeltilir (geri alınabilir), ama yayınlanmış yanlış beyan itibar/politika riski; bu yüzden ölçümden SONRA beyan | 4.1 |

### 6.3 Yayın sonrası gözlem (24-72 saat)
- Sinyaller: Play Console Android vitals (çökme/ANR, testçi sayısı düşük olduğundan sınırlı), testçi WhatsApp mesajları, ilk Pazar 20:00 bildirimi teslim oranı, deneme raporları (`check_in_saved`, `card_opened`, `share_initiated`), yorumlar, opt-in sayısının 12 altına düşmesi.
- 0-24 saat: kurulum sayısı = opt-in? ilk çökme? bildirim izni reddi oranı. 24-72 saat: ilk check-in zinciri, hatırlatma teslimi, "Dün" düğmesi/güvenli alan sorunları (YB-1), OEM cihaz sürprizleri (cihaz modeli sor).
- Durdurma ölçütü (Batuhan'ın onayıyla): açılışta çökme, veri sızıntısı şüphesi, silme sonrası bildirim dirilmesi, paylaşımda gizli satırın görünmesi.

---

## 7. Batuhan karar / aksiyon listesi (tek liste, öncelik sırasıyla)

**Şimdi (build öncesi, bloklayıcı):**
1. **Commit at** (47 yol) ve `v1.0.0-preview.1` etiketle. Sonra build.
2. **N-7 (migration placeholder sütunu):** kaldırılsın mı (ilk harici kurulumdan ÖNCE, tek yönlü kapı)? Kalırsa "bilinen sınır" yaz.
3. **B14 koyu tema:** v1 yalnız açık tema (`userInterfaceStyle: "light"`) mı, yoksa renkler temadan mı türesin? (Öneri: v1 için `light`.)
4. **İkon + splash:** kimin tasarlayacağı ve ne zaman (A'da Önemli, B'de blokör). Şablon logoyla arkadaşlara gitmek istiyor musun?
5. **Kart damgası:** arkadaş APK'sında `[mağaza bağlantısı]` yerine ne yazsın (yalnız "Haftik" ya da site adresi)? Kalıcı çözüm: alan adı (madde 12).
6. **INTERNET/izin yaklaşımı:** önce mevcut haliyle preview + ölçüm, sonra karar (öneri) mi; yoksa baştan `blockedPermissions` denemesi mi.
7. **EAS:** hesap aç/giriş, `eas init` (projectId commit), `eas build --platform android --profile preview`, ilk keystore'u üret, `eas credentials` ile yedek indir, şifre yöneticisine koy. (Bütçe: ücretsiz katman yeterli, doğrula.)
8. **`preview` profiline `autoIncrement:true`** (öneri) onayı; `eas build:version:get` çıktısı.

**Aynı hafta (A turu):**
9. Preview APK ile **kendi telefonunda** E1-E15 + `manual-checklist.md` Blokör satırları; sonuçları doldur (Sonuçlar tablosu).
10. **K10 kararı:** "Yalnız yakın çevre, hukuki görüş sonra" cümlesini `plan.md`'ye yaz (A için yeter; B için hukuki görüş ya da aynı karar).
11. Davet mesajındaki "veri sadece telefonunda" cümlesini **G-02 sonucu geldikten sonra** gönder.
12. **Alan adı + site barındırma** (GitHub Pages/Cloudflare Pages), Haftik marka/TÜRKPATENT/Play/sosyal medya çakışma kontrolü, iletişim e-postası seçimi (yer tutucular).

**B için (şimdi başlat, paralel):**
13. **Play Console hesabı aç + kimlik doğrulama** (25 USD; kritik yol). Ödeme profili ve gerçek Android cihaz doğrulaması gerekiyorsa tamamla.
14. **Health apps beyanı, IARC, hedef kitle 18+, reklam=Hayır, Data safety** formlarını Console'da doldur (ekran görüntüsü al); Data safety'yi A10/E1 çıktısı temiz olduktan sonra kesinleştir.
15. **Testçi havuzu:** 20+ Android/Gmail kişi listesi (bire bir mesaj), E1 kohortu ile sayaç kohortunu ayır; ücretli test servisi kullanma (öneri).
16. **Mağaza varlıkları:** 512 ikon, 1024x500 grafik, 4-8 ekran görüntüsü (release APK'dan, demo veriyle, kesin adla).
17. **Site canlı:** yer tutucular, tarih, TASLAK/noindex kaldır; uygulama içi bağlantıyı bağlatmak için onay ver (kod değişikliği, yeni build).
18. **Belge temizliği** onayı (4.11): manifest-checklist adı ve S12 belgelerindeki eski "paket adı yer tutucu" ifadeleri.
19. İOS: Apple üyeliği alınana kadar hiçbir iOS işi yok (S11/S12 iOS kısmı); site/mağaza metinlerinde iOS iddiası tutma.

**"GO":** A için 1-11 + E1-E15 geçmiş + Blokör = 0 sonrası; B için ayrıca 12-18 sonrası.

---

## 8. Kaynaklar (WebSearch, 2026-09-25) ve "doğrula" işaretleri

- Play hedef API şartı (API 36 için 31 Ağustos 2026): [Target API level requirements for Google Play apps - Play Console Help](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en), [Meet Google Play's target API level requirement - Android Developers](https://developer.android.com/google/play/requirements/target-sdk). Ek okuma: [Google Play Requires Android 16 (API Level 36) by August 31, 2026 - DEV Community](https://dev.to/dainyjose/google-play-requires-android-16-api-level-36-by-august-31-2026-react-native-migration-guide-1d51).
- Kapalı test şartı (12 testçi/14 gün, kişisel hesap, 13 Kasım 2023 sonrası): [App testing requirements for new personal developer accounts - Play Console Help](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en); gerçek kullanım kontrolü iddiası ikincil kaynaklardan: [Google Play Closed Testing Requirements 2026 - Testers Community](https://www.testerscommunity.com/blog/google-play-closed-testing-requirements-2026) (doğrula).
- Geliştirici doğrulaması / sideload: [Android developer verification - Android Developers](https://developer.android.com/developer-verification), [Android Authority rollout notu](https://www.androidauthority.com/android-developer-verification-rollout-sideloading-flow-3653395/): Eylül 2026'da Brezilya, Endonezya, Singapur, Tayland; küresel 2027; doğrudan APK sideload ilk aşamada kapsam dışı; hobi/öğrenci için ID'siz sınırlı hesap planlanıyor. Türkiye ilk dalgada anılmıyor; 2027 sonrası arkadaş APK dağıtımı etkilenebilir (**doğrula**).
- EAS ücretsiz katman: [Subscriptions, plans, and add-ons - Expo documentation](https://docs.expo.dev/billing/plans/); aylık 15 Android + 15 iOS build ve düşük öncelikli kuyruk ikincil kaynaklardan (**doğrula**).
- Bu incelemede WebSearch ile doğrulanmayan ve "doğrula" işaretli kalanlar: Play hesap doğrulama süresi, ilk sürüm inceleme SLA'sı, üretim erişimi inceleme süresi, uygulama içi politika bağlantısı zorunluluğu, gerçek Android cihaz doğrulaması, Data safety "toplama" tanımının Health apps ile ilişkisi, `eas build` preview'da aynı `versionCode` güncellemesi.

## 9. Bu incelemenin sınırları

Emülatör kapalıydı; K4 iddiaları önceki belgelerden alındı. Release derlemesi, `eas`, `bundletool`/`apkanalyzer`, PCAPdroid çalıştırılmadı. İkon incelemesinde `icon.png` ve `splash-icon.png` görsel olarak okundu; `android-icon-*`/`expo.icon` şablon tarihinden ve belge notlarından çıkarıldı (görsel doğrulama yapılmadı). Kaynak kodda `targetSdk=36` kaynak okumasıdır (K1), AAB kanıtı değildir. Hukuki görüş değildir.

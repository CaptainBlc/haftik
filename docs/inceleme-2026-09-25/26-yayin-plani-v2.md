# 26 - Yayın planı v2 (release-manager, 2026-09-28)

Rol: release-manager (Staff). Kod, `eas.json`, `app.json`, `src/`, testler DEĞİŞTİRİLMEDİ; hesap/build/gönderim yapılmadı; commit yok. "GO" Batuhan'ındır.
Girdi: 16-ortak-brif, 07-yayin-kapilari (2026-09-25), 12-performans, 13-urun-vizyonu, s10-ops-raporu, s12-*, eas.json, app.json, CLAUDE.md.
Kararlar (yeniden açılmaz): sıra Taban -> Çekirdek -> arkadaş denemesi (EAS preview APK) -> ikinci yapı -> Play kapalı test; R8 taban işinde; ikon 3; "Kart" adlandırması.
K ölçeği: K1 kaynak/doküman, K2 birim, K4 emülatör (debug ya da elle release), K4-rel = release derleme çıktısı (emülatör), K5 gerçek cihaz veya EAS preview/production çıktısı.

> Durum: TAMAM (bölüm 0-8). Karar ve GO Batuhan'ındır.

## İçindekiler
0. Özet
1. Yayın kapıları güncel tablo (07'den), A4 versionCode sorunu, imza/keystore, APK dağıtım yöntemi
2. Sürüm planı (v0.x, changelog, geri alma, sürüm başına go/no-go)
3. R8 sonrası release regresyon paketi
4. Play kapalı test önkoşulları, zaman çizelgesi, maliyet
5. Profesyonel yayın disiplini eksikleri
6. Yeni özellik / iyileştirme önerileri (taslak intent)
7. Batuhan'a seçenekli sorular
8. Doğrulanamayanlar, devir, kaynaklar

## 0. Özet

1. **Durum:** 07'deki NO-GO sürüyor; ama iki şey değişti. (a) Yerel release derlemesi artık var (`C:\hhk\haftik\...\app-release.apk`, R8 açık, debug anahtarlı, 35,1 MB) ve ben onun üzerinde `aapt2 dump badging` koştum: **targetSdk 36, allowBackup=false, debuggable değil, AD_ID yok, INTERNET/ACCESS_NETWORK_STATE/c2dm.RECEIVE/install-referrer + ~12 rozet izni var** (K4-rel; EAS artefaktı değil). (b) Kararlar netleşti (sıra, R8, ikon 3, "Kart"). Değişmeyenler: **48 yol hâlâ commit'siz, hiç git etiketi yok, `git remote` boş (CI hiç koşmuyor, depo tek makinede)**, EAS/Play hesabı/keystore yok.
2. **A4 çözüldü (öneri):** Expo belgesine göre `preview` profili uzak sayaçtan sürümü **artırmadan okur**; yani bugünkü ayarla her arkadaş APK'sı aynı `versionCode`'ta (1) çıkar. Çare: `preview.autoIncrement: true` (bölüm 1.4). Değişiklik Batuhan onayıyla; ben dokunmadım.
3. **Sürüm planı:** `0.1.0` Taban (yalnız Batuhan) -> `0.2.0` Çekirdek (arkadaş) -> `0.3.0` İkinci yapı (aynı arkadaşlar) -> `0.9.0` Play kapalı test adayı -> `1.0.0` üretim. Geri alma = **ileri düzeltme** (düşük `versionCode` kurulamaz; şema yalnız-ekleyen olmalı).
4. **En sonuçlu çelişki (bölüm 8, S1):** 07 "APK yalnız 3-5 kişilik smoke olsun, E1 kohortu Play'de başlasın" diyordu; verilen sıra ise arkadaş denemesini (E1'i ölçen) APK ile, Play'i sonra koyuyor. APK -> Play geçişi imza farkı yüzünden **kaldır-yeniden kur = veri kaybı**. Üç seçenek Batuhan'a (bölüm 7, S5).
5. **Play kritik yolu** hesap + 14 gün + inceleme; kod değil. Hesabı **şimdi** açmak takvimi ~2-3 hafta kısaltır. Batuhan'ın 13 Kasım 2023 öncesi bir Play hesabı varsa 12 testçi/14 gün şartı hiç uygulanmaz (S1).
6. **Yeni yapılacaklar:** R8 için `expo-build-properties` (yeni bağımlılık, yalnız yapı zamanı), release smoke betiği, CI'da sürüm/kimlik kilidi, `CHANGELOG.md` + etiket + sürüm kaydı, uygulama içi sürüm bilgisi, hesapsız geri bildirim, kullanıcı-tetikli sorun raporu.
7. Sözcük çakışması: brif "Kart" diyor; `site/` (5), `src/` (4), `docs/manual-checklist.md` (9), `docs/s12-magaza-icerigi.md` (2) hâlâ "karne" içeriyor (bildirim "Karnen hazır" dahil). Arkadaş sürümünden (0.2.0) ve Play metninden önce copywriter geçişi kapı sayılmalı (K2: `grep`, bu turda sayıldı).

---

## 1. Yayın kapıları: güncel tablo

Kısaltmalar: **G** geçti (kanıtlı), **A** açık, **B** Batuhan'a bağlı (hesap/karar/aksiyon), **K** kısmen. K seviyesi: mevcut en güçlü kanıt. "07" = 2026-09-25 tablosu; yalnız değişenler ve yeni kalemler gerekçelendirilir.

### 1.1 07'den bu yana değişenler (delta)

| Konu | 07 | Şimdi | Kanıt |
|---|---|---|---|
| Release derlemesi kanıtı | sıfır | Yerel release APK var; targetSdk/versionCode/allowBackup/izin okundu | `aapt2 dump badging` + `xmltree` (bu tur), 12-performans bölüm 5.5. **EAS artefaktı ve gerçek imza değil** |
| Açılış/boyut | yok | soğuk açılış medyan 493 ms (R8: 345), APK 44,46 -> 35,10 MB (R8) | 12 bölüm 1-2 (K4-rel, emülatör) |
| Sıra ve kararlar | belirsiz | Taban -> Çekirdek -> arkadaş -> ikinci yapı -> Play; R8 tabanda; ikon 3; "Kart" | 16-ortak-brif |
| Commit | 47 yol | **48 yol**, etiket yok, **remote yok** | `git status`, `git tag`, `git remote -v` (bu tur) |
| Migration | N-7 placeholder v2 | 13: v2 numarası yakıldı, V2 (paylaşım unvanı) **v3** ekler; T7 atomiklik önce | 13 bölüm 5.0-5.1 |
| Sideload doğrulaması | "izlenmeli" | 30 Eylül 2026'da yalnız BR/ID/SG/TH; küresel 2027; ID'siz "limited distribution" (<=20 cihaz, ücretsiz) | Android Developers blog + Console yardım (bölüm 8 kaynaklar) |
| Play hedef API | API 36 (31 Ağu 2026) | Yürürlükte; yerel APK targetSdk **36** (K4-rel); AAB'de kanıtlanmadı | `aapt2` çıktısı |

### 1.2 Hedef A: arkadaş APK (EAS `preview`)

| # | Kapı | K | Durum | Not / çıkış |
|---|---|---|---|---|
| A1 | typecheck + lint + Jest + expo-doctor | K2 | **K** (07: 863 geçti; bugün yeniden koşmadım) | `expo-doctor` 20/21 (yama sürümleri geride, CLAUDE.md 09-24). **Taban'ın ilk işi:** `npx expo install --check` + tek seferde yükseltme; çekirdek geliştirme sürerken sürüm kaydırma |
| A2 | Temiz ağaç, commit + etiket | K1 | **B** | 48 yol. Hiçbir kanıt bir sürüme bağlanamıyor. **Ek risk:** remote yok, depo tek diskte |
| A3 | Kalıcı kimlik `com.batuhan.haftik`, şema `haftik` | K1+K4-rel | **G** | APK'da `package: com.batuhan.haftik` okundu |
| A4 | Sürüm sayacı | K1 | **A** | 1.4 |
| A5 | `eas init` (`projectId`, `owner`) | - | **B** | `app.json`'a yazılır, commit'lik |
| A6 | Preview APK EAS'tan alınmış | K5 | **B** | - |
| A7 | Keystore yedeği | - | **B** | 1.5 |
| A8 | Dev menü yok | K4 (paket) | **K** | S10 paket taraması geçti; APK üzerinde ekran ekran G-06 açık; bölüm 3 R-17 |
| A9 | Merged manifest / izinler | K4-rel | **K** | Okundu (yukarıda). Kalan: INTERNET/c2dm/install-referrer kararı (22 bölüm 1'e devir), EAS APK'sında tekrar |
| A10 | Ağ gözlemi (G-01/G-02) | K5 | **A** | Hiç yapılmadı. "Veri gönderilmez" iddiası (site, davet mesajı) buna bağlı: **ölçmeden bu cümleyi gönderme** |
| A11 | Yedek kapalı, debuggable değil | K4-rel | **G (yerel)** / **K (EAS)** | `allowBackup=false` okundu, `application-debuggable` yok |
| A12 | Emülatör turu (Blokör düzeltmeleri) | K4 | **K** | 07 A12 aynen; YB düzeltmeleri emülatörde yeniden görülmeli |
| A13 | Gerçek cihaz turu | K5 | **B** | Sonuçlar tablosu boş |
| A14 | Bildirim zinciri (Pazar, saat dilimi, reboot, kapalı süreç) | K4/K5 | **A** | Release'te dev zaman menüsü yok: bölüm 3 R-05 yöntemi |
| A15 | Paylaşım gerçek hedefte | K5 | **B** | Ürünün wow anı |
| A16 | Güvenlik: açık Important yok | K1-K2 | **K** | I-5/I-6/N-7/N-9 karar bekliyor |
| A17 | Özgün ikon/splash (ikon 3) | K1 | **A** | Karar verildi (16), varlık üretilmedi (V1). Şablon logoyla arkadaşa gitme |
| A18 | Kart damgası | K1 | **B** | T4: köşeli parantezli metin kalkmalı; kalıcı çözüm alan adı |
| A19 | Koyu tema kilidi (`userInterfaceStyle`) | K1 | **A** | `app.json` hâlâ `automatic`; T6 karar verilmiş sayılır ama uygulanmadı. **Native yapılandırma: build'den önce** |
| A20 | Migration N-7 / T7 atomiklik | K2 | **A** | Tek yönlü kapı: **ilk harici kurulumdan önce** (0.2.0'dan önce şart, 0.1.0 Batuhan'a özel) |
| A21 | Aydınlatma kararı (yakın çevre, hukuki görüş sonra) plan.md'de yazılı | - | **B** | - |
| A22 | Ölçüm/E1 altyapısı | K2-K3 | **K** | T8 (ölçüm tamamlama) taban işinde |
| A23 | **R8 (yeni)**: minify+shrink kalıcı yapılandırma + regresyon paketi | K4-rel | **A** | `expo-build-properties` yok (`package.json` grep); regresyon bölüm 3 |
| A24 | **Sürüm/etiket/CHANGELOG/sürüm kaydı (yeni)** | K1 | **A** | Bölüm 5 |
| A25 | **CI koşuyor mu (yeni)** | K1 | **A** | `.github/workflows/ci.yml` var, **remote yok** => hiç koşmadı |
| A26 | Geri alma provası (yeni) | K5 | **A** | Önceki APK'yı sakla + üstüne kurma provası (bölüm 2.4) |
| A27 | "GO" | - | **B** | - |

**Karar (bugün): NO-GO** (A2, A4-A7, A10, A13-A15, A17-A20, A23-A26). Taban çıkışı için gereken kapılar 2.3'te.

### 1.3 Hedef B: Play kapalı test (07'den özet, değişen yok)

B1 hesap **B** · B2 AAB + targetSdk 36 kanıtı **K** (yerel APK'da 36; AAB `bundletool dump manifest` ile) · B3 Play App Signing + upload key yedeği **B** · B4 gizlilik URL'si canlı **A** (`site/` TASLAK, yer tutuculu) · B5 KVKK kararı **B** · B6 Data Safety **K** (A10 ölçümüne bağlı) · B7 Health apps **B** · B8 IARC + 18+ **A** · B9 mağaza varlıkları **A** · B10 damgada kesin URL **A** · B11 iletişim e-postası **A** · B12 ad/marka çakışma **A** · B13 uygulama içi gizlilik bağlantısı (kod) **A** · B14 >=12 (hedef 20) testçi **A** · B15 AAB "Available to testers" **A** · B16 metin<->uygulama<->site tutarlılığı **K** ("Kart" geçişi eklendi, S7) · B17 14 gün sayacı **A**. Ayrıntı ve süre: bölüm 4.

### 1.4 A4: `preview` profilinde versionCode sorunu ve çözümü

**Bulgu (K1, Expo belgesi):** `appVersionSource: remote` iken `preview` profili uzak `versionCode`'u **okur, artırmaz**; artırma yalnız `autoIncrement` olan profilde olur; sayaç tüm profillerde **tek** ve ortaktır. Yerel APK `versionCode=1` gösteriyor (uzak sayaç başlangıcı). Bugünkü `eas.json`'la:

| Sonuç | Etki |
|---|---|
| Her arkadaş APK'sı (0.1.0, 0.2.0, 0.2.1, 0.3.0...) `versionCode=1` | Hangi build'in hangi telefonda olduğu `versionCode`la ayırt edilemez; hata bildiriminde "hangi sürüm" belirsiz |
| Aynı `versionCode`'lu APK'nın üstüne kurma | Android yalnız **düşük** kodu reddeder (`INSTALL_FAILED_VERSION_DOWNGRADE`); eşit kodun aynı imzayla güncelleme olarak kurulması genel olarak çalışır ama **bu projede doğrulanmadı (K0)** ve bazı OEM kurucuları tuhaflık çıkarabilir |
| İlk `production` build sayacı 2 yapar | Sonradan Play'den kurulan sürüm (kod 2) > eski preview APK (kod 1); ters yönde sideload = downgrade hatası (Batuhan'ın kendi telefonunda) |

**Çözüm (öneri, Batuhan onayı):** `eas.json` -> `"preview": { ..., "autoIncrement": true }`. Sayaç ortak olduğundan production sonrası kodlar da tek yönlü artar; boşluklar zararsız (Play yalnız "öncekinden büyük" ister). **Kural:** `eas build:version:set` ile sayacı asla geri çekme. **Kanıt (E15):** iki ardışık preview APK'yı emülatöre üst üste kur, `user_version`/check-in verisi korunuyor mu bak. `versionCode` ve kısa commit özeti uygulama içinde görünmeli (öneri R-1, bölüm 6), yoksa telefondaki sürümü sormanın yolu yok.

### 1.5 İmza ve keystore hijyeni

- **Tek keystore, tek kimlik.** EAS managed keystore uygulama kimliği başına tutulur; preview APK'sı ve production AAB aynı anahtarla imzalanır. Play'de bu anahtar **upload key** olur; asıl imzayı Google tutar (Play App Signing). Sonuç: preview APK ile Play'den kurulan sürümün imzası **farklıdır**, aynı telefonda üst üste kurulamaz.
- **İlk build'de:** "Generate a new keystore" = Evet. Hemen `eas credentials -p android` ile indir; **şifre yöneticisi + çevrimdışı ikinci kopya** (proje klasörü dışında; `.gitignore` `*.keystore/*.jks/credentials.json/*.key` kapsıyor, K1). Keystore şifresi/alias'ı yalnız Batuhan'ın yöneticisinde. Ben anahtar üretmem, saklamam.
- **Parmak izi kaydı (repoya girebilir, açık bilgi):** `keytool -printcert -jarfile app.apk` veya `apksigner verify --print-certs` çıktısındaki **SHA-256** `docs/surumler/imza-parmak-izi.md`'ye yazılır. **Her dağıtımdan önce** yeni APK'nın parmak izi kayıtla eşleşmeli; eşleşmezse Android güncellemeyi reddeder ("paket çakışması") ve arkadaşlarda veri kaybı gerekir.
- **Kayıp senaryosu:** preview zinciri için kurtarma yok: herkes kaldır-kur (veri kaybı). Play için upload key sıfırlama destek yoluyla mümkün (gün sürer, doğrula). Bu yüzden yedek, ilk arkadaş APK'sından **önce** alınır (kapı A7).
- **Hesap kurtarma:** Expo ve Google hesabında 2 adımlı doğrulama + kurtarma kodları çevrimdışı; Play hesabı = ürünün tek dağıtım kapısı.
- **`.gitignore` eksikleri (öneri):** `*service-account*.json`, `*.pepk`, `*.aab`/`*.apk` zaten var, `local.properties`, `eas-build-output/` (yerel indirmeler için ayrı klasör repo dışında olmalı).
- **Sideload doğrulama kaydı (2027 hazırlığı):** Android Developer Console'da paket adı + imza parmak izi kaydı gerekecek (Play kullanıcıları için otomatik); ID'siz "limited distribution" (<=20 cihaz) arkadaş APK'sı için uygun ve bu kohortla örtüşür. Ayrıntı ve tarihler "doğrula".

### 1.6 APK dağıtım yöntemi (arkadaşlar)

| Yöntem | Artı | Eksi | Öneri |
|---|---|---|---|
| **EAS internal distribution bağlantısı** (varsayılan: URL'yi bilen indirir, 32 karakterlik UUID, giriş yok) | En basit; QR; yeni build = yeni bağlantı | URL'yi bilen herkes indirir (**bağlantıyı sır say**, yalnız bire bir gönder; "yetkisiz erişim kapat" seçeneği arkadaşlara Expo hesabı ister, uygun değil); EAS'ta artefakt saklama süresi sınırlı olabilir (doğrula) | **Ana yol** |
| APK dosyasını yerel indirip Drive/Telegram ile göndermek | Sürüm dosyası elde kalır (geri alma) | WhatsApp .apk'yı engelleyebilir (doğrula); elle iş | **Her sürüm için yerel kopyayı da sakla** (repo dışı) |
| Firebase App Distribution vb. | Testçi yönetimi | Yeni üçüncü taraf hesap; kapsam dışı | Hayır |

**Arkadaş kurulum adımları (mesaj taslağına girer):** (1) bağlantıyı Android telefonda aç, (2) indir, (3) "bu kaynaktan yüklemeye izin ver" (tarayıcı/dosya yöneticisi için), (4) Play Protect uyarısı çıkarsa "Yine de yükle" (uygulama Play'de tanınmıyor; bu beklenen ve mesajda söylenir), (5) aç, bildirim izni sor, (6) Ayarlar'dan sürüm numarasını bana yaz (R-1 gelene dek kurulum mesajında "build N"). **Güncelleme:** yeni bağlantıdan kur, **üstüne** kurulur, veri korunur (E15 ile kanıtlanınca yazılır; kanıtsız "korunur" deme). **İmza tutarlılığı:** her build aynı keystore + parmak izi kontrolü (1.5). **Play Protect notu:** kullanıcı "kontrol için gönder"i seçerse APK Google'a gider: gizlilik sözü uygulamanın kendi davranışıdır, işletim sistemi eylemi değil; mesajda tek cümle.

---

## 2. Sürüm planı (v0.x)

### 2.1 Numaralandırma kuralı

- **`expo.version` (kullanıcıya görünen ad):** `0.MINOR.PATCH`. MINOR = kapsam adımı (Taban, Çekirdek, İkinci yapı), PATCH = yalnız Blokör/hata düzeltmesi. Play'e çıkan aday `0.9.x`, üretim `1.0.0`. (Seçenek ve gerekçe: S2.)
- **`versionCode` (makine kimliği):** EAS uzak sayacı, `preview` **ve** `production` `autoIncrement:true` (1.4). Anlamı yok, yalnız artar. Sürüm etiketi ikisini bağlar: `v0.2.0` etiketi = `versionCode N` (sürüm kaydında yazılı).
- **Şema sürümü (`PRAGMA user_version`)** uygulama sürümünden **ayrıdır**. Şema değişen her MINOR, sürüm kaydında "Veri ve şema notu" satırı taşır.
- **Etiket:** `v0.2.0` (annotated), Batuhan atar; her etiket bir EAS build kimliğine ve APK SHA-256'sına bağlanır. Aynı sürümün ikinci build'i yeni PATCH alır; **aynı etiketi yeniden kaydırma yok**.

### 2.2 Sürüm haritası

| Sürüm | İçerik (13'e göre) | Kanal / kitle | Şema | Not |
|---|---|---|---|---|
| **0.1.0** Taban | T1-T9 (kırık yollar, damga, içerik mantığı, T6 açık tema kilidi, T7 migration atomikliği, T8 ölçüm), **R8 + gereksiz paketlerin çıkarılması**, `preview.autoIncrement`, expo yama yükseltmesi | Preview APK; **yalnız Batuhan'ın telefonu (A0)** | v2 (N-7 placeholder hâlâ; T7 sonrası karar) | Kanıt sürümü: E1-E15 (07) + R8 regresyon (bölüm 3) burada koşulur. Arkadaşa gitmez |
| 0.1.x | Batuhan dogfood bulguları | aynı | aynı | - |
| **0.2.0** Çekirdek | V1 kimlik (kart C, ikon 3, splash, reveal), V2 paylaşım anı (paylaşım unvanı), V3 günlük an, V4 örnek kart; **"Kart" adlandırma geçişi**; kesin damga | Preview APK; **3-5 arkadaş, sonra 20-30** (E1 nötr dönem) | **v3** (paylaşım unvanı sütunu) | **İlk harici kurulum.** Tek yönlü kapılar bundan önce kapanır |
| 0.2.x | Yalnız Blokör düzeltmeleri; `release/0.2` dalı ilk ihtiyaçta etiketten açılır | aynı | v3 (değişmez) | Şema değişikliği YOK |
| **0.3.0** İkinci yapı | V5 içerik derinliği + kıyas anlatısı, V6 Karnelerim ("Kartlarım" adı adlandırma kararına bağlı), `archive_opened` sayacı | Aynı arkadaşlar, **E1 nötr dönem bittikten sonra** güncelleme | v3 (ek: yalnız-ekleyen olmalı) | Güncelleme sürtünmesi: kurulum mesajı + E15 kanıtı |
| **0.9.0** Play adayı | Yeni özellik yok: ikon/splash/damga URL/uygulama içi gizlilik bağlantısı/mağaza varlıkları; `production` profili AAB | Play kapalı test (>=12, hedef 20) | v3 | Paket adı ilk yüklemede kalıcı bağlanır |
| 0.9.x | Kapalı testte Blokör | aynı | aynı | Yeni `versionCode` |
| **1.0.0** | Üretim erişimi verildikten sonra | Play production, aşamalı (%5-10-25-50-100) | aynı | Ayrı GO |

**Kilit:** 0.2.0 öncesi geri dönüşsüz kararlar = koyu tema kilidi (native), paylaşım unvanı şeması (v3), damga metni, ikon (adaptive fg/bg/mono), "Kart" adı, T7. Bunlar 0.1.0 kanıt turundan sonra, 0.2.0 build'inden önce "kapalı" işaretlenir (kapı Ç-1, bölüm 2.3).

### 2.3 Her sürüm için go/no-go (K seviyeli; kanıtsız madde "açık")

**Ortak çekirdek (her preview/Play build'i):**

| # | Kapı | K |
|---|---|---|
| C1 | `npm run typecheck && npm run lint && npm test` yeşil, çıktı sürüm kaydına | K2 |
| C2 | `npx expo-doctor` 21/21 (yükseltme sonrası) | K1 |
| C3 | Ağaç temiz, etiket atılmış, remote'a itilmiş, build **etiketten** | K1 |
| C4 | `app.json` `version` = CHANGELOG üst başlığı = etiket; `versionCode` = `eas build:version:get` (build sonrası artmış) | K1 |
| C5 | Kimlik kilidi: `android.package=com.batuhan.haftik`, `scheme=haftik`; `com.anonymous`, `TASLAK`, `[mağaza bağlantısı]` (0.2.0'dan itibaren) kod/varlıkta yok | K1 |
| C6 | Artefakt SHA-256 + imza parmak izi kayıtla eşleşiyor | K5 |
| C7 | `aapt2 dump badging`: targetSdk 36, debuggable yok, izin listesi 1.2 A9 kararıyla aynı; `xmltree`: `allowBackup=false` | K4-rel/K5 |
| C8 | Bölüm 3 regresyon paketi (build'e uygun alt küme) geçti; logcat'te `FATAL/ClassNotFound/NoSuchMethod` yok | K4-rel/K5 |
| C9 | Önceki sürümün **üstüne kurma** ve veri korunumu | K5 |
| C10 | Sürüm kaydı + CHANGELOG + kullanıcı notu hazır; önceki APK'nın yerel kopyası saklı (geri alma) | K1 |
| C11 | Açık Blokör = 0; kalan Önemli'ler "bilinen sınır" olarak yazılı (belge + Batuhan onayı) | K1 |
| C12 | Bağımsız ikinci okuma: `code-reviewer` (fark) + `security-reviewer` (izin/veri farkı) raporu | K1 |

**Sürüme özel eklemeler:**

| Sürüm | Ek kapılar |
|---|---|
| **0.1.0** | R8 regresyon bölüm 3 tam paket (R-01..R-20) · E1-E15 (07) K5 · N-7 kararı yazılı · geri alma provası (0.1.0 -> 0.1.1 üstüne kurma) · A10 ağ gözlemi (davet mesajı cümlesi için) |
| **0.2.0** | Ç-1: kalıcı kararlar kapalı (2.2 "Kilit") · **v2 -> v3 yükseltme testi**: v2 veri tabanlı gerçek APK'dan (0.1.x) 0.2.0'a üstüne kurma, check-in ve kartlar korunmuş (K5), K3 migration testi · paylaşım unvanı oranı >=%90 K2 betiği · kartta yer tutucu yok (`[` içeren damga = No-Go) · özgün ikon 48 dp'de okunur (K5) · "Kart" geçişi: kullanıcıya dönük metinde `karne` grep sonucu kayıtlı · A14/A15 gerçek cihazda (Pazar bildirimi, WhatsApp) · A21 aydınlatma kararı yazılı · davet mesajı (A10 sonucuyla) |
| **0.2.x** | Yalnız Blokör; diff'te şema/izin/bağımlılık değişikliği YOK (C7 farkı boş) |
| **0.3.0** | Yeni içerik testleri (12 hafta simülasyonu) K2 · Kartlarım liste kuralı K2 (uygun olmayan hafta listelenmez) · yalnız-ekleyen migration ve 0.2.x'ten üstüne kurma · nötr dönem verisi kapanmış (E1 kohortu kirlenmez) |
| **0.9.0** | Bölüm 4 tüm önkoşullar · AAB `bundletool dump manifest`: targetSdk 36, izinler · Data Safety/Health/IARC ekran görüntüleri · gizlilik URL canlı (TASLAK/noindex yok) · uygulama içi gizlilik bağlantısı · Play App Signing kaydı + upload key yedeği doğrulandı |
| **1.0.0** | 14 gün sayacı tamam + üretim erişimi verildi · aşamalı yayın planı ve durdurma ölçütleri (2.4) · Android vitals izleme sahibi atanmış |

### 2.4 Geri alma planı

İlke: **geri alma = ileri düzeltme.** Kullanıcıda yüklü sürümü uzaktan çekemem (OTA yok, kill switch yok, E3/K6). Düşük `versionCode` kurulamaz; eski koddan geri dönüş yeni, **daha yüksek** `versionCode` ile yeniden derlemektir.

| Durum | Eylem | Ön koşul |
|---|---|---|
| Preview'da Blokör | Arkadaşlara "kullanma/güncelle" mesajı (şablon 2.5) -> düzeltme `0.x.(y+1)`; **kaldır-kur yalnız imza uyuşmazsa** | Aynı keystore (1.5), önceki APK yerelde |
| "Son iyi sürüm" kurtarma | Etiketten (`git checkout v0.2.0`) yeni PATCH numarasıyla yeniden derle -> daha yüksek `versionCode` | Etiket + sürüm kaydı |
| Şema | Migration'lar **yalnız-ekleyen** (yeni nullable sütun/tablo). `runMigrations` yalnız `version > user_version` olanları uygular; `user_version` **daha yüksekse sessizce hiçbir şey yapmaz** (`src/data/migrations.ts`, K1): eski ikili yeni şemayı açar; değişiklik yalnız-ekleyen ise çalışır, değilse bozulur. **Kural:** yıkıcı şema değişikliği yok; her MINOR için "eski kod bu şemada açılır" testi (K3) | Kural sürüm kaydında |
| R8 kaynaklı sorun | R8'i kapatan tek satırlık yapılandırma dönüşü (`expo-build-properties` bayrakları `false`) -> yeni PATCH | Fallback derlemesi 0.1.0'da bir kez denenmiş olmalı |
| Kapalı testte Blokör | Console'da sürümü duraklat/testi durdur; testçilere mesaj; düzeltme yeni `versionCode` | Aynı `versionCode` yeniden yüklenemez |
| Üretim | Aşamalı yayını **durdur** (halt), önceki iyi kodu yeni `versionCode` ile yeniden yayınla | Vitals eşik izleme |
| Kalıcı kimlik | Paket adı/imza geri alınamaz: **0.9.0 öncesi** kesin | 2.3, 0.9.0 |

**Durdurma ölçütü (Batuhan onayıyla):** açılışta çökme, silme sonrası bildirim dirilmesi, paylaşımda gizli satırın/unvanın görünmesi, veri sızıntısı şüphesi, migration hatası (veri kaybı). **Sinyaller:** arkadaş mesajları, ilk Pazar 20:00 teslimi, deneme raporu sayaçları, Play vitals (çökme/ANR), yorumlar; 24-72 saat penceresi 07 bölüm 6.3 ile aynı.

### 2.5 Changelog ve sürüm notu biçimleri

`CHANGELOG.md` (kök, Türkçe, Keep a Changelog benzeri). Şablon:

```
## [0.2.0] - <YYYY-MM-DD> (build N, kanal: preview)
### Eklendi / Değişti / Düzeltildi
- ...
### Bilinen sınırlar
- ... (belge + Batuhan onayı ile kabul)
### Veri ve şema notu
- user_version 2 -> 3; yalnız-ekleyen; eski koda dönüş: yeni PATCH derlemesi
### Kanıt
- Jest N geçti / emülatör turu / cihaz turu / merged manifest (dosya bağlantıları)
```

`docs/surumler/vX.Y.Z.md` sürüm kaydı: etiket, commit, EAS build kimliği, `versionCode`, APK SHA-256, imza parmak izi, kapı tablosu (2.3) doldurulmuş, sapmalar, geri alma hedefi (önceki etiket). **Arkadaş sürüm notu (WhatsApp, <=6 satır):** ne yeni (1-3 madde, jargonsuz), "üstüne kur, verilerin kalır" (E15 sonrası), ne denemeni istiyorum (tek şey), sorun olursa nasıl yazarsın, build numarası. **Play "Yenilikler" (tr-TR, <=500 karakter):** 2-3 madde, kullanıcı diliyle; sağlık sözcüğü kuralına uy (S12).

---

## 3. R8 sonrası yayın-öncesi regresyon paketi

**Neden ayrı paket:** 12'deki R8 denemesi yalnız açılış + onboarding + check-in + FATAL taraması yaptı; bildirim, paylaşım, deep link, kart PNG ve silme R8'de **denenmedi** (12 bölüm 8). R8'in tipik kırılma yolları: yansıma/JNI ile erişilen sınıfların atılması (expo-sqlite, react-native-view-shot, expo-sharing, expo-notifications servisleri), `getIdentifier` ile aranan kaynakların (bildirim simgesi) `shrinkResources` ile atılması, sıra dışı `NoSuchMethodError` yalnız çalışma anında çıkması. Bu yüzden paket **derleme değil davranış** doğrular.

**Yapılandırma (kalıcı, kod yolu değil):** R8 `android/gradle.properties`'te değil, `app.json` `expo-build-properties` eklentisiyle (`android.enableMinifyInReleaseBuilds`, `enableShrinkResourcesInReleaseBuilds`, gerekirse `extraProguardRules`) verilir; `android/` prebuild ürünüdür. **Yeni bağımlılık => "ağa veri gönderiyor mu" kontrolü:** eklenti yapı zamanı Gradle yapılandırması, çalışma zamanı kodu getirmez (bu kararı `npm ls`/paket içeriğiyle doğrula; ben eklemedim). Yansıma sorunu çıkarsa düzeltme **yalnız `extraProguardRules`** ile, üretilen `android/` ağacı düzenlenmez. R8 yapılandırmasını Taban'ın **ilk** işlerinden biri yap: sonraki tüm geliştirme R8'li derlemede sınanır, geç kalan bulgu pahalıdır.

**Test edilen ikili:** EAS `preview` APK'sı (universal; boyutunu kaydet, yerel x86_64 35,1 MB'tan büyük çıkabilir, doğrula) hem emülatörde (API 35, Google APIs) hem gerçek cihazda. Yerel Gradle derlemesi (ASCII yol `C:\hhk\haftik`) yalnız hızlı ön eleme; kapı kanıtı EAS artefaktıdır.

| # | Akış | Yöntem | Beklenen | K | R8 Blokörü |
|---|---|---|---|---|---|
| R-01 | Soğuk açılış (veri var) | `am start -W` x5, `force-stop` arası | ~12'deki 345-493 ms bandı; FATAL yok | K4-rel | Evet |
| R-02 | Onboarding + bildirim izni (Android 13+ `denied+canAskAgain`, reddet, sonra Ayarlar'dan ver) | Elle + `dumpsys alarm \| grep haftik` | İzin verilince 7 alarm, reddedilince 0 | K4-rel | Evet |
| R-03 | Check-in kaydı kalıcılığı (expo-sqlite JNI) | 4 dokunuş + Kaydet, `force-stop`, yeniden aç | Kayıt duruyor | K4-rel | Evet |
| R-04 | Migration yükseltmesi | Önceki APK + veri, yenisini üstüne kur | Veri tam, `user_version` beklenen, kartlar duruyor | K5 | Evet |
| R-05 | Pazar kartı zinciri (release'te dev zaman menüsü YOK) | Emülatör (root'lu Google APIs imajı): `adb root`, `settings put global auto_time 0`, sistem saatini Pazar 19:59'a al; gerçek cihazda: bir gerçek Pazar (D-05) | Kart 20:00'da açılabilir, bildirim teslim, dokununca kart (T3) | K4-rel + K5 | Evet |
| R-06 | Bildirim dokunma: soğuk ve sıcak | `am start` / bildirimden | Doğru rota (Bugün/Kart), çökme yok | K4-rel | Evet |
| R-07 | Bildirim simgesi/rengi görünür (`shrinkResources`) | Bildirim gölgesi ekran görüntüsü | Simge çizili (BLG-11 durumu neyse o; **kaybolmamış**) | K4-rel | Evet |
| R-08 | Kart açılışı ve reveal | Gerçek veriyle kart ekranı | İçerik tam, Inter yazı tipi, Türkçe karakterler | K4-rel | Evet |
| R-09 | Paylaş: view-shot -> PNG -> paylaşım seçicisi | Paylaş, seçici aç; hedef olarak gerçek cihazda WhatsApp/Galeri | Seçici açılır, PNG 1080x1920, gizli satır `???`/şerit, damga doğru; seçiciden dönünce `cache`'te `ReactNative-snapshot-image*.png` yok | K4-rel (seçici) + K5 (hedef) | Evet |
| R-10 | FileProvider / dosya erişimi | Paylaşım hedefi PNG'yi okuyabiliyor (izin hatası yok), `logcat` `FileProvider` hatası yok | Okunuyor | K5 | Evet |
| R-11 | Deneme raporu paylaşımı | Ayarlar -> rapor -> onay Alert -> seçici | `.txt` çıkar, sonra silinir, yasak desenler yok | K4-rel | Hayır (Önemli) |
| R-12 | Deep link geçerli | `adb shell am start -a android.intent.action.VIEW -d "haftik://card/<geçerli Pzt>"` (kart yok/uygun değil/var) | Uygun değilse Hafta'ya yönlenir, kart yazılmaz | K4-rel | Evet |
| R-13 | Deep link kötü girdi | `haftik://card/abc`, `.../2026-13-45`, `.../%E0%A4%A`, `haftik://today` (onboarding yok) | Çökme/donma yok, onboarding kapısı atlanmaz | K4-rel | Evet |
| R-14 | Tüm verilerimi sil | Ayarlar -> sil -> onaylar | Onboarding'e döner, `dumpsys alarm` 0, `cache` PNG/rapor yok, `metric_event` boş | K4-rel | Evet |
| R-15 | Yeniden kurulum/çalışma yaşam döngüsü | Ön plan -> arka plan -> `am kill` -> aç; ekran döndürme (portre kilitli) | Durum tutarlı; 3 sekme | K4-rel | Hayır |
| R-16 | Merged manifest + imza + debuggable | `aapt2 dump badging`, `xmltree`, `apksigner verify --print-certs`, `dumpsys package` `flags=` | 2.3 C5-C7 | K4-rel/K5 | Evet |
| R-17 | Dev menü/dev sızıntısı yok | Tüm ekranlar gezilir; `ilerlet` menüsü yok; `expo export` taraması 0 geçiş | 0 | K4-rel | Evet |
| R-18 | Ağ | Uçak modu tam akış (G-01); PCAPdroid tüm akış (G-02) | Bağlantı 0 (FCM/exp.host/analitik/güncelleme yok) | K5 | Evet (iddia) |
| R-19 | Log taraması | `adb logcat -c` ... akış ... `-d \| grep -E "FATAL\|ClassNotFound\|NoSuchMethod\|NoSuchField\|AbstractMethodError\|ProGuard\|R8"` | Boş; veri sızıntısı yok | K4-rel | Evet |
| R-20 | Ölçü karşılaştırması | APK boyutu, açılış medyanı, PSS (12 tablosu) | 12'deki bütçe içinde; R8 açık/kapalı farkı kayıtlı | K4-rel | Hayır |

**Çıkış ölçütü (R8 "GO"):** "R8 Blokörü" sütunundaki tüm satırlar geçti, `extraProguardRules` gerekiyorsa listesi + gerekçesi sürüm kaydında. **Herhangi bir satır başarısızsa:** önce kuralla düzelt, düzelmezse R8'i kapat (2.4 fallback) ve 0.1.0'ı R8'siz çıkar; R8 ayrı iş olarak kalır (boyut 44,5 MB ile <=40 MB bütçesini aşar, Play'de AAB ABI bölünmesiyle indirme boyutu zaten daha küçüktür, doğrula). **Not:** R8 sonrası Java yığın izleri okunmaz; EAS `preview` APK'sında `mapping.txt` saklanmaz (doğrula). Arkadaş çökme bildirimi için R-3 (bölüm 6) JS katmanını görünür kılar; native çökmeler için Play vitals yalnız Play kanalında var. **Mapping'i her production AAB'de sakla** (Play, AAB içindeki eşlemeyi otomatik alır, doğrula).

**Otomasyon devri:** R-01..R-14, R-16, R-17, R-19 adb kabuk betiği ile tek komutta çalıştırılabilir (`scripts/release-smoke.sh`, önerilen; `test-automation-engineer`); R-05, R-09 hedef kısmı, R-18 ve R-04 elle/gerçek cihaz. Betik çıktısı sürüm kaydına eklenir (K4-rel kanıt dosyası).

---

## 4. Play kapalı test: önkoşullar, çizelge, maliyet

### 4.1 Önkoşullar (kaynaklar bölüm 8; "doğrula" = Console ekranı esas)

| # | Önkoşul | Durum | Not |
|---|---|---|---|
| P1 | **Geliştirici hesabı.** Kişisel, tek seferlik 25 USD (yıllık değil); yasal ad, adres, e-posta, telefon, devlet kimliği, ödeme profili, 2 adımlı doğrulama; doğrulama günler sürebilir (2-5 iş günü kaynak beyanı, doğrula). Ödeme için uluslararası kart gerekebilir | **B** | **Kritik yol.** Şimdi başlat. Batuhan'ın **13 Kasım 2023 öncesi** bir kişisel hesabı varsa P2 uygulanmaz (S1) |
| P2 | **12 testçi x 14 gün kesintisiz opt-in** (13 Kasım 2023 sonrası açılan kişisel hesaplar; uygulama başına). 2026'da "gerçek kullanım" kontrolü anlatılıyor (ikincil kaynak, doğrula). Hedef 20 opt-in (12 + tampon). Sonra "üretim erişimi" başvurusu | **B** | Yalnız gerçek Android + gerçek Google hesabı. iPhone sayılmaz. Ücretli test servisi önerilmez |
| P3 | **Hedef API 36** (31 Ağustos 2026'dan beri yeni uygulama ve güncellemeler; uzatma en geç 1 Kasım 2026 ve yeni uygulama için işe yaramaz) | **K** | RN 0.86 varsayılanı 36; **yerel APK targetSdk 36 okundu (K4-rel)**; AAB'de `bundletool` ile kanıtlanacak |
| P4 | **Play App Signing** (zorunlu) + upload key yedeği | **B** | 1.5 |
| P5 | **Gizlilik politikası URL'si canlı, yer tutucusuz, noindex/TASLAK yok**; uygulama içi bağlantı (B13) | **A** | `site/` yayınlama: GitHub/Cloudflare Pages; alan adı isteğe bağlı ama damga için kalıcı URL şart (S8) |
| P6 | **Data Safety** ("toplanmıyor/paylaşılmıyor"), **reklam=Hayır, AD_ID beyanı=Yok** (APK'da AD_ID yok, K4-rel), **Health apps** (S12 kararı: dürüst beyan), **IARC**, **hedef kitle 18+**, uygulama erişimi (hesap yok) | **K/B** | Data Safety'yi A10 (ağ ölçümü) ve INTERNET kararından **sonra** kesinleştir |
| P7 | **Mağaza varlıkları:** 512x512 ikon (ikon 3), 1024x500 grafik, >=2 (öneri 6) ekran görüntüsü (release ikilisinden, kesin adla, kesin damgalı kartla), TR metinler ("Kart" diliyle, sağlık sözcüğü kuralı) | **A** | V1 sonrası üretilir |
| P8 | **İlk yükleme** elle Console'dan (rehber Yol A); paket adı kalıcı; `production` AAB, `versionCode` artmış | **B** | 0.9.0 |
| P9 | İletişim e-postası, ad/marka çakışma kontrolü (Play, alan adı, sosyal, TÜRKPATENT), KVKK "sonra" kararı yazılı | **B** | - |
| P10 | İlk kapalı test sürümü Google incelemesinden geçer (SLA yok, gün-hafta), sonra "Available to testers" | **-** | Süre tahmini bölüm 4.2 |
| P11 | **Alternatif (bilgi):** Play **internal** test kanalı (<=100 testçi, genellikle inceleme yok, 14 gün şartı yok) — ama uygulama içerik beyanları (gizlilik, Data Safety, IARC, hedef kitle) yayınlamadan önce tamamlanmalı ve hesap+paket adı gerekir. Arkadaş dağıtımı için APK yerine bu kanal, veri kaybını ve "bilinmeyen kaynak" sürtünmesini kaldırır (S5) | **-** | Batuhan'ın verdiği sıra APK; karar S5'te |

### 4.2 Zaman çizelgesi (tahmin, K0; bugün 2026-09-28, Pazartesi)

Varsayım: 13'teki faz eforları (Taban ~6, Çekirdek ~10, İkinci yapı ~5,5 iş günü, Claude destekli) ve Batuhan'ın hesap/deneme/onay işleri paralel. Play süreleri Google'a bağlı.

| Hafta | Tarih (yaklaşık) | Ana iş | Paralel (Batuhan) |
|---|---|---|---|
| H1 | 28 Eyl - 4 Eki | Faz 0: commit + remote + etiket `v0.0.0-pre`, kararlar (bölüm 7), Taban başlar (R8 yapılandırması ilk) | **Play hesabı başvurusu**, Expo hesabı, `eas init`, keystore yedeği planı |
| H2 | 5 - 11 Eki | Taban biter -> **0.1.0** preview -> Batuhan telefonu, E1-E15 + R8 regresyon | Alan adı / site barındırma kararı; iletişim e-postası |
| H3-H4 | 12 - 25 Eki | Çekirdek -> **0.2.0** (kapı Ç-1 sonrası) | Site metni "Kart" diliyle, Data Safety taslağı, ekran görüntüsü planı |
| H5 | 26 Eki - 1 Kas | 0.2.0 -> 3-5 arkadaş (**bir Pazar içermeli**: 1 Kasım) | Davet listesi 20-30 |
| H6-H8 | 2 - 22 Kas | Deneme: G7 nötr, G14 çağrılı paylaşım; **0.3.0** nötr dönem bitince (~H6-H7) | Play formları, mağaza varlıkları, site canlı |
| H9 | 23 - 29 Kas | **0.9.0** AAB -> Play kapalı test yüklemesi + inceleme (1-7 gün) | Testçi daveti (20+) |
| H10-H11 | 30 Kas - 13 Ara | 14 gün opt-in sayacı | Vitals/mesaj izleme; bulgu -> 0.9.x |
| H12-H13 | 14 - 27 Ara | Üretim erişimi başvurusu + inceleme (~1-2 hafta, doğrula) | - |
| H13+ | Ara sonu - Oca 2027 | **1.0.0** aşamalı yayın | Sideload doğrulaması 2027 (S9) yaklaşıyor |

**Hızlandırma seçeneği (karar sırasını bozmaz):** Play hesabı + formlar + site + varlıklar H1-H8'de hazırlanır; AAB yükleme tarihi 0.3.0'a kadar beklemek zorunda değil. Seçenek S4'te: 14 günlük sayaç için erken bir kapalı test sürümü (ör. 0.3.0) H7'de başlatılırsa üretim ~2-3 hafta erkene gelir; bedel: Play kohortu ayrı olmalı ve APK kohortuyla karışmamalı (E1 kirlenir).

### 4.3 Maliyet (doğrulananlar ve olmayanlar)

| Kalem | Tutar | Durum |
|---|---|---|
| Play geliştirici hesabı | **25 USD tek sefer** | Doğrulandı (WebSearch, çok kaynak; Console'da teyit) |
| EAS Build (Free) | 0 USD; **ayda 15 Android + 15 iOS build**, düşük öncelikli kuyruk | Doğrulandı (docs.expo.dev/billing/plans, WebSearch); Starter 19 USD/ay yalnız kuyruk/kredi için |
| Planlanan build sayısı | 0.1.0: 2-4 (R8 iterasyonu), 0.2.0: 2, 0.2.x: 1-2, 0.3.0: 1-2, 0.9.0 AAB: 1-2 => ~8-12 / ~2 ay | Ayda 15 sınırının altında; her native yapılandırma kararını **tek build'de topla** (07 3.1) |
| Yerel Gradle (ASCII yol) | 0 | Hızlı ön eleme için |
| Barındırma (GitHub/Cloudflare Pages) | 0 | Doğrulanmadı ama bilinen ücretsiz katman |
| Alan adı (isteğe bağlı) | Kayıt şirketine bağlı, yıllık; **tutar doğrulanmadı** | Damga kalıcı URL için önerilir |
| Apple Developer | 99 USD/yıl | **Bu plan dışı** (iOS koşullu) |
| Google "limited distribution" (2027 sideload için) | Ücretsiz, <=20 cihaz | Kaynakta; kayıt adımı doğrulanmalı |

---

## 5. Profesyonel yayın disiplini: eksikler ve öneriler

| # | Eksik (kanıt) | Öneri | Sahip | Öncelik |
|---|---|---|---|---|
| D1 | **Depo tek diskte**: `git remote -v` boş; 48 yol commit'siz; hiç etiket. Disk kaybı = ürün kaybı | Özel (private) uzak depo aç, `main` + etiketleri it. CI de ancak böyle koşar | Batuhan | Yüksek |
| D2 | **CI hiç koşmadı** (`ci.yml` var, remote yok). CI Node 20, yerel Node 24: sapma | Remote sonrası ilk koşuyu izle; Node sürümünü SDK 57 gereksinimiyle hizala (doğrula) | devops-engineer | Yüksek |
| D3 | **CI'da sürüm/kimlik doğrulaması yok** | `scripts/check-release.mjs` (yalnız yerel/CI, `src/` dışı): (a) `app.json` `version` = CHANGELOG üst başlığı; etiket push'unda etiket = `v`+version; (b) `android.package`/`scheme` kimlik kilidi; (c) `eas.json` `preview.autoIncrement=true`; (d) `com.anonymous`, `TASLAK`, `[mağaza bağlantısı]` (etiket koşusunda) bulunursa kırmızı; (e) `git ls-files` içinde `*.keystore/*.jks/*.apk/*.aab/credentials.json/service-account` yok; (f) `npm audit --omit=dev` high/critical = 0; (g) `expo export` paketinde dev menü dizeleri 0 (S10 kanıtını otomatikleştirir) | devops-engineer + test-automation-engineer | Orta |
| D4 | **Sürüm etiketi/CHANGELOG/sürüm kaydı yok** | 2.1 ve 2.5 şablonları; `docs/surumler/` klasörü | release-manager, Batuhan (etiket) | Yüksek |
| D5 | **Kilit dosyalar tanımsız** | Aşağıdaki "kilit listesi"; değişiklik = yayın kapısından geçer, PR/commit açıklamasında "KİLİT" etiketi | tech-lead | Orta |
| D6 | **Bağımlılık kayması riski**: Dependabot haftalık npm PR'ı, `expo-doctor` 20/21 | Deneme boyunca "dondurma": `dependabot.yml`'a `ignore` (expo*, react-native* minor/major) ya da `groups`; yükseltme yalnız sürüm arasında ve `npx expo install --check` ile | devops-engineer | Orta |
| D7 | **Geri alma hiç denenmedi** | 0.1.0 içinde prova: 0.1.0 -> 0.1.1 üstüne kurma + "son iyi sürümü yeni koddan yeniden derle" adım kaydı | release-manager | Yüksek |
| D8 | **Olay (incident) şablonu yok** | `docs/surumler/olay-sablonu.md`: belirti, etki alanı, karar (durdur/düzelt/kabul), arkadaş/testçi mesajı, kök neden, aynı hata sınıfı testi (tech-lead kuralı) | release-manager | Düşük |
| D9 | **İkinci okuma yok** (tek geliştirici) | C12: `code-reviewer` + `security-reviewer` agentları GO'dan önce; rapor sürüm kaydına | Batuhan (çağırır) | Orta |
| D10 | **Artefakt saklama** yok: EAS artefakt süresi sınırlı olabilir (doğrula) | Her dağıtılan APK/AAB + SHA-256 + `mapping.txt` (AAB varsa) repo dışı klasör; parmak izi kaydı repoda | Batuhan | Orta |
| D11 | **Hotfix dalı disiplini** | Etiketli sürümden sonra deneme boyunca `main` özellik işi taşıyorsa (0.3.0), hotfix `release/0.2` dalından (ilk ihtiyaçta etiketten açılır), `main`e cherry-pick; aksi hâlde dal açma (solo yükü) | tech-lead | Düşük |
| D12 | **Belge tutarlılığı**: "karne" (site 5, src 4, checklist 9, s12-mağaza 2); `manual-checklist.md` eski ad ve damga; `s12-yayin-rehberi.md` "paket adı yer tutucu / `site/` yok / `ios.bundleIdentifier` yok" (artık yanlış) | copywriter geçişi + belge güncellemesi 0.2.0 kapısı | copywriter, release-manager | Orta |
| D13 | **Sır/kimlik**: servis hesabı anahtarı deseni `.gitignore`'da yok | `*service-account*.json` ekle (öneri, ben dokunmadım) | Batuhan | Düşük |

**Kilit dosya/alan listesi (öneri):** `app.json` kimlik alanları (`android.package`, `ios.bundleIdentifier`, `scheme`, `slug`, `name`), `eas.json`, `package-lock.json` (yalnız bilinçli yükseltme), `src/data/migrations.ts` (**yalnız ekleme**, mevcut migration'a dokunma), `src/domain/content/tr.ts` `CONTENT_VERSION` (içerik değişince artar), `src/config/constants.ts` (damga/ad), `.github/workflows/ci.yml`, `docs/surumler/*` (geçmiş kayıtlar yazılmış sayılır), `.gitignore` (sır desenleri kaldırılmaz).

---

## 6. Yeni özellik ve iyileştirme önerileri (taslak intent; dosya oluşturulmadı)

Kural: kapsam sessizce genişletilmez; hepsi Batuhan kararıdır. Etki/efor: S <=1 gün, M 2-4 gün (K0). Gizlilik uyumu: yerel-only söz korunur.

| # | Öneri | Etki | Efor | Gizlilik | Önerilen zaman |
|---|---|---|---|---|---|
| R-1 | Uygulama içi **sürüm bilgisi** | Yüksek (her hata bildirimi buna bağlı) | S | Uyumlu | **0.1.0** |
| R-2 | **Hesapsız geri bildirim yolu** | Yüksek (deneme geri bildirimi tek kanal) | S | Uyumlu, e-posta uygulamayı kullanıcı gönderir | **0.1.0/0.2.0** |
| R-3 | **Sorun raporu paylaşımı** (kullanıcı-tetikli, kimliksiz) | Orta-yüksek (çökme görünürlüğü, SDK'sız) | M | Uyumlu koşullu | 0.2.0 sonrası (0.2.x/0.3.0) |
| R-4 | **Yenilikler** ekranı (güncelleme sonrası bir kez) | Orta (0.3.0 güncelleme sürtünmesi) | S | Uyumlu | 0.3.0 |
| R-5 | **Kanal etiketi** (`preview`/`closed`/`production`) deneme raporuna | Orta (E1 kohortu ile Play kohortunu ayırır) | S | Uyumlu | 0.2.0 |
| R-6 | **Yerel yedek/geri yükleme dosyası** (kullanıcı-tetikli) | Orta (telefon değişimi, APK -> Play geçişi) | M-L | Koşullu | v2 adayı |
| R-7 | **Release smoke betiği** (`scripts/release-smoke.sh`) | Yüksek (her build'de 10 dakikalık kanıt) | M | Uygulama dışı | Taban |

**R-1. Sürüm bilgisi.** Ayarlar'ın altına "Hakkında" satırı: sürüm adı, build numarası (`versionCode`), kanal, şema sürümü, kısa commit özeti; "kopyala" düğmesi. Sürüm/commit yapı zamanında gömülür (`eas.json` `env` veya `expo-constants`; `versionCode` için `expo-application` doğrudan bağımlılık olabilir, ağ kontrolü yapılır). Arkadaş "hangi sürümdeyim" sorusunu ve hata mesajındaki belirsizliği kapatır. Sınır: kimlik/cihaz benzersiz kimliği gösterilmez. Başarı ölçütü: her arkadaş mesajında build numarası var.

**R-2. Geri bildirim yolu.** Ayarlar'da "Geri bildirim gönder": kullanıcının kendi e-posta (`mailto:`) veya paylaşım (WhatsApp) uygulamasını, önceden doldurulmuş şablonla açar (sürüm, Android sürümü, cihaz modeli görünür ve düzenlenebilir; uygulama verisi eklenmez). Uygulama ağ isteği yapmaz; gönderen kullanıcının kendi uygulamasıdır. Hesap/sunucu yok. Kısıt: alıcı adres Batuhan kararı (yer tutucu); gizlilik politikasında "geri bildirim yolladığınızda adresiniz bana ulaşır" cümlesi. Başarı ölçütü: deneme geri bildirimlerinin >=%50'si bu yoldan gelir (Batuhan sayar).

**R-3. Sorun raporu.** Uygulama, yakalanan hataları ve önceki oturumun "beklenmedik kapanış" işaretini yerel bir halka tamponda (<=50 giriş, sabit hata kodları, gün ofseti, içerik yok) tutar; Ayarlar'dan kullanıcı isterse deneme raporundaki gibi metin dosyası olarak paylaşır (sürüm + kodlar). "Tüm verilerimi sil" tamponu da siler; rapor yasak-desen testi (tarih/kategori/kimlik yok) genişletilir. SDK yok; native çökme görünmez (Play vitals/`adb logcat` tamamlar). Kısıt: security-reviewer onayı; otomatik gönderim yok. Başarı ölçütü: bildirilen bir hata rapor kodundan yeniden üretilebilir.

**R-4. Yenilikler.** Güncellemeden sonraki ilk açılışta tek seferlik, kapatılabilir 3 satırlık "Yenilikler" kartı (statik içerik, `lastSeenVersion` ayarı). Kısıt: bildirim/rozet/yeniden gösterim yok, çağrı-eylem baskısı yok (etik). Başarı ölçütü: 0.3.0'dan sonra arkadaşların "yeni ne var" sorusu azalır.

**R-5. Kanal etiketi.** Derleme profiline göre (`eas.json` `env`) sabit bir kanal dizesi deneme raporunda görünür (kimlik değil). Play kohortu ile APK kohortunun raporları elle ayrıştırılır; E1 kohort kirlenmesi (07 3.4-4) önlenir. Kısıt: paylaşılan kart PNG'sine girmez.

**R-6. Yerel yedek/geri yükle.** Ayarlar'dan kullanıcı-tetikli dışa aktarma (tek dosya) ve içe aktarma; otomatik yedek (Auto Backup) kapalı kalır. Değer: telefon değişimi ve APK -> Play geçişinde veri kaybını çözer. Risk: içe aktarma güvenlik yüzeyi (doğrulama/şema/boyut sınırı), yeni bağımlılık (dosya seçici), dışa aktarılan dosyanın gizlilik sorumluluğu. Sözleri değiştirmez ("veri yalnızca cihazda" kullanıcı dosyayı göndermedikçe doğru). v2 adayı, product-owner + security-reviewer kararı.

**R-7. Release smoke betiği.** Bölüm 3'ün otomatikleştirilebilir satırları `adb` ile tek komut; çıktısı sürüm kaydına eklenir. `src/` dışında yaşar; test dosyası değişimi yok. `test-automation-engineer` ile.

**Değerlendirilip reddedilenler:** uzaktan yapılandırma/zorunlu güncelleme (ağ yok, gizlilik sözü); otomatik çökme SDK'sı (sözle çelişir); "deneme sürümü süre sonu kilidi" (veriyi kilitler, etik ve güven sorunu).

---

## 7. Batuhan'a seçenekli sorular

| # | Soru | Seçenekler | Öneri |
|---|---|---|---|
| S1 | **Daha önce Play Console hesabın var mı (13 Kasım 2023 öncesi)?** | (a) Var, eski -> 12 testçi/14 gün yok, Play çok hızlanır. (b) Yok/yeni -> plan aynen | Önce cevabı bil, takvim buna göre |
| S2 | **Sürüm adı stratejisi** | (a) `0.x` -> 0.9 (Play adayı) -> 1.0.0. (b) 1.0.0 sabit, yalnız `versionCode`. (c) 1.0.0-beta.N | **(a)**: dürüst, bilgi verir; `app.json`'da `version` 1.0.0 -> 0.1.0 (kod dışı yapılandırma, senin onayınla) |
| S3 | **Preview'a `autoIncrement:true` onayı** (`eas.json`, A4) | (a) Evet. (b) Hayır, sayacı elle yönet | **(a)** |
| S4 | **Play kapalı test ne zaman başlasın?** | (a) Verdiğin sıra: arkadaş denemesi + 0.3.0 sonrası (H9). (b) Sıra aynı ama 14 gün sayacı için ayrı Play kohortuyla H7'de erken başlat. | **(a)**; hesap/form/site/varlık hazırlığı yine paralel. (b) ancak Play kohortu APK kohortundan ayrıysa |
| S5 | **Arkadaş kohortu ölçeği ve kanalı** (APK -> Play = kaldır-yeniden kur = veri kaybı) | (a) APK yalnız 3-5 kişilik smoke; E1 kohortu doğrudan Play'de (07 önerisi). (b) APK ile 20-30 kişi E1 ölçümü, Play'e geçişte veri kaybı bilinçli kabul (bu kohortun ölçümü rapordan alınır). (c) Arkadaşlara APK yerine Play **internal** kanalı (<=100, 14 gün şartı yok; hesap + beyanlar ön koşul, paket adı erken kalıcı). | Verdiğin sıra (b). Ama en az sürtünme (c). Karar, hesabın ne zaman açılacağına bağlı; **S1 ve S4 ile birlikte karar ver** |
| S6 | **R8 başarısız olursa** | (a) Kapat, 0.1.0 R8'siz çık, R8 ayrı iş. (b) Blokla, çöz. | **(a)** bir kez denenmiş fallback ile; R8 kuralı çözülünce 0.1.x'te aç |
| S7 | **Kilit dosya listesi (bölüm 5) ve hotfix dalı disiplini** onayı | (a) Evet. (b) Sadeleştir (yalnız `migrations.ts` + kimlik) | **(a)** |
| S8 | **Kart damgasında ne yazsın (arkadaş sürümü)?** | (a) Yalnız "Haftik". (b) Kısa alan adı (satın alma gerek). (c) GitHub/Cloudflare Pages adresi | 0.2.0 için **(a)** veya (c); Play'e kadar (b) |
| S9 | **Sideload doğrulaması (2027)**: arkadaş APK'sı için ne yapalım? | (a) Bekle: 2027 başında yeniden bak. (b) Şimdi Android Developer Console'da paket + imza kaydet, ID'siz "limited distribution" dene. | **(a)**; Türkiye 30 Eylül 2026 dalgasında değil |
| S10 | **Yeni öneriler (bölüm 6)** | Hangileri: R-1, R-2 (öneri: Taban/Çekirdek), R-3, R-4, R-5, R-6 (v2), R-7 | R-1, R-2, R-5, R-7 evet; R-3 sonra; R-6 v2 |
| S11 | **Repo uzak depoya (özel)** | Evet / Hayır | **Evet**, ilk iş (D1) |

---

## 8. Doğrulanamayanlar, çelişkiler, devir

**Doğrulanamayan / bu turda yapılmadı:**
1. EAS artefaktı yok: imza parmak izi, universal APK boyutu, `mapping.txt` saklanıp saklanmadığı, artefakt saklama süresi, EAS'ın commit'siz değişiklikle davranışı **doğrulanmadı**.
2. Aynı `versionCode`'lu APK'nın güncelleme olarak kurulması ve `preview` autoIncrement etkisi: E15 ile kanıtlanmalı (K0).
3. Play: hesap doğrulama süresi, ilk sürüm inceleme süresi, üretim erişimi inceleme süresi (~1-2 hafta), "gerçek kullanım" kontrolü, sayaç işleyişi, uygulama içi gizlilik bağlantısı zorunluluğu: Console/resmî sayfada teyit edilecek. Google'ın internal test kanalında hangi beyanların yayın öncesi zorunlu olduğu ikincil kaynaklarda net değil.
4. Android Developer Console kayıt adımı, "limited distribution" ayrıntıları ve Türkiye için 2027 tarihleri.
5. `BIND_GET_INSTALL_REFERRER_SERVICE` izninin hangi bağımlılıktan geldiği ve Play Data Safety/politika etkisi: 22-platform-v2'ye devir. `c2dm.RECEIVE` ve INTERNET kararı da orada.
6. Bölüm 3'ün R-05 emülatör saat değiştirme yöntemi bu makinede denenmedi (imaj root'lu mu doğrulanmadı).
7. Efor/takvim (13, bölüm 4.2) K0 tahmindir; architect (21) doğrulaması bekleniyor. `21`, `22`, `23` belgeleri bu turda iskelet durumundaydı; bu plan onları okumadan yazıldı, sonuçları geldiğinde çelişki taraması gerekir.

**Çelişkiler (sessizce gömülmedi):** (i) 07 3.5 "APK yalnız smoke" vs verilen sıra (APK ile arkadaş denemesi + E1): S5. (ii) 13 K-3/K-4 "A yönü / karne" vs brif (C / "Kart"): brif geçerli sayıldı. (iii) 13 T6 "açık tema kilidi" kararlaştırılmış görünüyor, ama `app.json` hâlâ `automatic`: uygulanmadı. (iv) 12 R8 "yapılabilir" diyor, ama `expo-build-properties` yok: bu yeni bir bağımlılık (kapsam/onay).

**Devir:** devops-engineer (D1-D3, D6, EAS/CI, R8 yapılandırması), test-automation-engineer (R-7, bölüm 3 betik), mobile-platform-specialist (izin/FCM/install-referrer kararı, R-05 yöntemi), security-reviewer (R-3, R-6, izin farkı C12), privacy-compliance-analyst (Data Safety ↔ ölçüm sonrası), copywriter ("Kart" geçişi, sürüm notu şablonları), growth-strategist (kohort ayrımı, kurulum mesajı), tech-lead (kilit dosyalar, migration kuralı), Batuhan (S1-S11, hesaplar, keystore, etiket, remote, "GO").

**Kaynaklar (WebSearch, 2026-09-28):** [Android developer verification - Android Developers](https://developer.android.com/developer-verification) · [Understanding Android developer verification - Console Help](https://support.google.com/android-developer-console/answer/16561738?hl=en) · [Android sideloading timeline - Android Authority](https://www.androidauthority.com/android-sideloading-changes-timeline-3679204/) · [App testing requirements for new personal developer accounts - Play Console Help](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en) · [Target API level requirements - Play Console Help](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en) · [Subscriptions, plans, and add-ons - Expo](https://docs.expo.dev/billing/plans/) · [Internal distribution - Expo](https://docs.expo.dev/build/internal-distribution/) · [App version management - Expo](https://docs.expo.dev/build-reference/app-versions/) · [BuildProperties - Expo](https://docs.expo.dev/versions/latest/sdk/build-properties/) · [Set up an open, closed, or internal test - Play Console Help](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en) · ikincil: Testers Community / PrimeTestLab özetleri (doğrula).

**Kanıt ve sınırlar:** Bu turda değişen tek dosya bu rapordur. Kod, `eas.json`, `app.json`, `src/`, testler, emülatör, hesaplar değişmedi. Okuma amaçlı komutlar: `git status/tag/remote`, `aapt2 dump badging/xmltree` (yerel release APK, salt okunur). Hukuki görüş değildir.

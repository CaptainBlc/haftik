# 28 — Mühendislik standartları v2 (tech-lead, 2026-09-28)

> Durum: tamamlandı (öneri belgesi). Kod, `CLAUDE.md`, yapılandırma değişmedi; commit yok. 08'in devamıdır, onu tekrar etmez.

## Özet

1. **08'den bu yana mühendislik tabanında hiçbir şey değişmedi (K1):** CI hâlâ Node 20, `.nvmrc`/`engines` yok, `^`
   sürümler, spike ve `reset-project` duruyor, `ErrorBoundary` yok. Bu yüzden taban fazının ilk günü bunlara ayrılmalı.
2. **13 çelişkinin hepsi karara bağlandı** (§1). Dokuzunun ortak kökü aynı: zamanla değişen bir durum belgeye kalıcı cümle
   olarak yazılmış. Kural: belgeye durum değil, durumu ölçen aracın adı yazılır.
3. **Ç-6 değişti:** reanimated kaldırılır, worklets ayrı ve opsiyonel bir adım olur. 12'deki ölçüme göre worklets'i
   `@expo/ui` çekiyor; 08'in "ikisi de kaldırılabilir" iddiası buna göre düzeltildi.
4. **17 mekanik kontrol** (§2.1, R-1…R-17), çoğu yeni bağımlılık istemeyen ESLint kuralı. Her biri geçmiş bir olayla
   sınanmıştır ("o olay yakalanır mıydı?", §2.2). 04'ten üç yeni hata sınıfı çıktı: **sözleşme izi kopukluğu, kısmi
   başarısızlık, sessiz hata yolu**.
5. **`CLAUDE.md`:** yaklaşık 750 satır ≤ 250'ye iner. Yapı: kısa `CLAUDE.md` + `docs/muhendislik/` altında dört konu dosyası
   + arşiv. Taşıma dört soruluk bir algoritmayla yapılır; "hiçbir şey kaybolmadı" betikle kontrol edilir (§3).
6. **Kararların mühendislik karşılığı:** faz kapıları ölçülebilir hale getirildi (§4.8). R8 ve paket temizliği için
   tek-değişiklik-tek-commit sırası konuldu (§4.9). "Kart" adlandırmasına bekçi test eklendi (R-12, bugün `src/`'de 4
   "karne" geçişi var). C yönü için 8 maddelik **kart render sözleşmesi** yazıldı (§4.11).
7. 9 ders `ortak-standartlar.md`'ye (§5), 9 geliştirici verimliliği önerisi (§6), 10 seçenekli soru (§7).

## 0. Kapsam, yöntem, kanıt

- **Okunanlar:** 16 (brif), 08 (önceki tur, bu belge onun devamı; tekrar etmez), 04, 12, 13, 10 §3-4, 14/README, 21 ve 22
  (ikisi de bu tur yazılıyor, şu an iskelet), proje `CLAUDE.md`, `package.json`, `.github/workflows/ci.yml`,
  `.github/dependabot.yml`, `eslint.config.js`, `tsconfig.json`, `jest.setup.ts`, `__tests__/**` ağacı,
  `node_modules/eslint-config-expo/flat/utils/typescript.js`, `~/.claude/team/ortak-standartlar.md` başlıkları.
- **08'den bu yana değişmeyen durum (K1, dosya okuma):** CI hâlâ `node-version: '20'` (`ci.yml:26`); `.nvmrc`/`.npmrc` yok;
  `engines` yok; `@types/jest` `^29.5.14`, `react-test-renderer` `^19.2.3` (`package.json:31,38`); `jest.setup.ts:6` hâlâ TZ
  atıyor; `scripts/reset-project.js`, `spike/`, `__tests__/spike/` duruyor; Dependabot'ta `groups`/`ignore` yok;
  `__tests__/infra/` altında yalnızca `toolchain.test.ts` var; `src/` içinde `ErrorBoundary` 0 eşleşme.
- **Bu oturumda komut çalıştırma aracı yoktu.** Test/lint/typecheck koşulmadı. Test sayısı 04'ten alınmıştır (71 suite,
  863 geçti, 3 atlandı; K2 ama benim koşumum değil, K0).
- **Kurallar:** Onaylı spec ve Batuhan'ın 16'daki kararları yeniden açılmadı. Mimari seçim `software-architect`in (21 §2b,
  §2g); burada yalnızca **tutarlılık sözleşmesi** (her seçimin uyması gereken kural) yazıldı. Çakışırsa §8'de açıkça yazılır.

## 1. 08'deki 13 çelişkinin çözüm kararları

Biçim: **Karar** (bağlayıcı mühendislik kuralı) · **Gerekçe** · **Uygulayan** · **Doğrulama** (hangi araç/test yakalar).
"B:" ile başlayan kararlar Batuhan'ındır; tech-lead yalnızca önerir.

| # | Karar | Gerekçe | Uygulayan | Doğrulama |
|---|---|---|---|---|
| Ç-1 demo kodu "silinemedi" ↔ "silindi" | Silindi kabul; `CLAUDE.md` 215 ve 569 arşive `[ESKİ: N-2'de silindi]` etiketiyle | `src/app/explore.tsx` yok (08, Glob) | tech-lead (ayıklama, §3) | Rota meta-testi (§2, R-4): `src/app` altındaki her rota izin listesinde; yeni demo rotası kırmızı |
| Ç-2 S6 "unlocked'da Alert" | 244 arşive; 255 Mimari'de tek satır | S7a'da davranış değişti | tech-lead | Yok (belge); `week-route.test.tsx` davranışı zaten tutuyor |
| Ç-3 paket adı "bekliyor" ↔ "kesinleşti" | I-3 kapandı; "Açık kararlar" listesi yeniden yazılır (INTERNET, N-9, I-5, I-6, N-7, B14, K5, K9, K10) | `app.json` `com.batuhan.haftik` | tech-lead | Politika testi (R-6): `android.package === 'com.batuhan.haftik'` sabit; tek yönlü kapı olduğu için yanlışlıkla değişmesi kırmızı |
| Ç-4 doctor 21/21 ↔ 20/21 | Sayı tuzak kayıtlarında **tutulmaz**; Commands'ta "beklenen: tamamı yeşil, sapma Teknik borç'a". Güncel doğru: 20/21 (yama geride) | Zamanla değişen sayı belgeye yazılınca bayatlar (bu çelişkinin kökü) | mobile-engineer (`npx expo install --check`, taban derlemesinde) | Aylık bakım adımı (§4.3); CI'da **değil** (ağ ister, her Expo yamasında kırmızı olur) |
| Ç-5 "sabitlendi" ↔ `^` | Tam sürüm: `"@types/jest": "29.5.14"`, `"react-test-renderer": "19.2.3"`. Genel kural: **SDK'ya kilitli paketler `^` taşımaz** (Expo'nun `~`'si hariç) | Lockfile sabitler ama `npm install <x>` ve Dependabot `package.json` aralığına göre yükseltir | mobile-engineer (TB-4 commit'i) | Politika testi R-6: bu iki paketin sürüm dizgesi `^` ile başlamaz |
| Ç-6 reanimated/worklets "peer, dokunulmaz" | **12 ile düzeltilmiş karar:** reanimated kaldırılır (JS'e 0 bayt, `src/` 0 kullanım, native 1,54 MB). **worklets ayrı adım:** `@expo/ui` (expo-router Android toolbar) onu "optional" çekiyor (12 §1.4); kaldırılırsa stack başlıklı ekranlarda K4 ayrıca yapılır, kırılırsa geri eklenir | 08 "ikisi de kaldırılabilir" diyordu, 12 ölçümü worklets'in gerçek bir çekeni olduğunu gösterdi; iki kanıt çelişiyor, ölçüm kazanır | mobile-engineer (§4.9 sırası) | Önce/sonra `expo export` boyutu + release APK `unzip -v` (.so listesi); K4 smoke (bildirim, paylaşım, kart, deep link) |
| Ç-7 `jest.setup.ts` "ikinci güvence" | `jest.setup.ts` TZ **atamaz, doğrular**: `Intl...timeZone !== 'Europe/Istanbul'` ve `HHK_TZ_RUN` yoksa açık hata fırlatır. Commands: "tek güvence `cross-env`" | Etkisiz güvence katmanı sahte güvencedir (§5, ders 16) | qa-engineer (TB-5 ile) | `toolchain.test.ts` zaten `getTimezoneOffset() === -180` doğruluyor; setup'taki assert, `npx jest` ile `cross-env`siz koşuyu ilk satırda durdurur |
| Ç-8 `node:sqlite` "ASLA" ama test yok | ESLint `no-restricted-imports` (`src/**`: `node:*`, `**/__tests__/**`, `**/spike/**` yasak) | Kural bugün yalnızca verifier'ın elle grep'i | mobile-engineer | `npm run lint` kırmızı; ek olarak R-1 meta-testi (lint kapatılsa bile) |
| Ç-9 Build "tanımlanmadı" | Commands 08 §1.5 taslağıyla güncellenir (EAS `preview`/`production`, prod paket taraması) | `eas.json` S10'dan beri var | tech-lead (§3) | Yok (belge) |
| Ç-10 CI Node 20 | `.nvmrc` = `24`; `package.json` `engines.node: ">=24"`; `.npmrc` `engine-strict=true`; CI `node-version-file: .nvmrc` | Tek doğrulanmış ortam Node 24 (K2 koşuları). 08'deki `>=22.13` eşiği bellekten (K1-bellek); doğrulanmamış bir alt sınır yerine bilinen ortamı yaz (sıkıcı olan kazanır) | devops-engineer | Yanlış Node'da `npm ci` anında kırılır; `toolchain.test.ts`'e `process.versions.node` ana sürüm assert'i |
| Ç-11 spec/plan iki kopya ayrışmış | **haftik deposu kanonik.** SDLC kopyalarına "donmuş onay kopyası" başlığı (B: o depo Batuhan'ın); proje `spec.md`/`plan.md` başlığında "kopyasıdır" → "onaylı halden türeyen canlı sürüm" | İki kanonik kaynak = çift mantık | Batuhan (SDLC), tech-lead (proje başlıkları) | Yok (belge). Tek satır başlık, geri alınabilir |
| Ç-12 plan S12 OPS notu bayat | Nota `[güncel değil: 2026-09-23 sonrası çözüldü]` etiketi | Metin değiştirilmez, etiketlenir (ders 14) | tech-lead | Yok |
| Ç-13 spike "S8'de silinir" ama duruyor | `spike/` + `__tests__/spike/` silinir (B: silme onayı); ayrıca `reset-project` betiği ve npm script'i | Mock'lu spike testleri yeşil sayıyı şişiriyor; `reset-project` yıkıcı ve adı zararsız | mobile-engineer (Batuhan onayından sonra) | R-6 politika testi: `scripts.reset-project` yok, `spike/` dizini yok. Kural: spike dosyası başında "silinme dilimi" yazar, o dilimin Bitti kanıtında "spike silindi" maddesi |

**Ortak kök:** 13 çelişkinin 9'u aynı kalıptan: **zamanla değişen bir olgu (sayı, durum, "henüz yok") belgeye kalıcı cümle olarak
yazılmış.** Kural (§5, ders 17): belgeye durum değil, **durumu söyleyen aracın adı** yazılır ("doctor yeşil olmalı", "bkz.
`manual-checklist.md`"). Durum yazılacaksa tarih + "geçerlilik: X olana kadar" ile yazılır.

## 2. Hata sınıfı → mekanik kontrol

İlke: **ESLint** (editörde anında, dosya düzeyi) > **Jest meta-testi** (proje düzeyi: `package.json`, `app.json`, dosya ağacı)
> **CI adımı** (derleme çıktısı) > **PR kontrol listesi** (yalnızca makinenin göremediği). Yeni bağımlılık gerekmez:
`@typescript-eslint/eslint-plugin` zaten `eslint-config-expo` içinde (`flat/utils/typescript.js:1`); `no-restricted-imports`
ve `no-restricted-syntax` ESLint çekirdeğinde. İzin listeleri **yalnızca küçülür** (ratchet); bir satır eklemek bilinçli bir
PR konusu olur.

### 2.1 Mekanik kontrol kataloğu (R-1…R-17)

| ID | Kontrol | Araç | Taslak |
|---|---|---|---|
| R-1 | Katman sınırları | ESLint `no-restricted-imports`, dizin bazlı `files:` blokları | `src/domain/**`: `react*`, `expo-*`, `@/(data\|card\|notify\|metrics\|lib\|components\|app\|dev)/*`, `node:*` yasak. `src/data/**`: `@/(app\|components\|card\|notify\|metrics\|lib\|dev)/*` yasak (`delete-all.ts` istisna, TB-9'a kadar). `src/components/**`: `@/data/*` yasak. `src/**`: `node:*`, `**/__tests__/**`, `**/spike/**`, `@/dev/*` (statik) yasak |
| R-2 | Tek saat kaynağı | ESLint `no-restricted-syntax` | `NewExpression[callee.name='Date'][arguments.length=0]`, `Date.now()` ve `.toISOString()` → `src/**`'de hata; istisna `lib/now.ts`, `data/*-repo.ts` |
| R-3 | Yüzen promise | `@typescript-eslint/no-floating-promises`, `no-misused-promises` (tip bilgili: `parserOptions.projectService: true`, yalnız `src/**`) | Bilinçli "en iyi çaba" çağrısı `void x(); // en iyi çaba: <neden>` biçiminde yazılır |
| R-4 | Dış girdi ve rota kapsamı | Jest `__tests__/infra/routes.test.ts` | (a) `src/app` rota dosyaları ya `(main)/` altında ya izin listesinde (`index`, `onboarding/*`, `card/[weekStart]`). (b) `useLocalSearchParams`, `useGlobalSearchParams`, `addNotificationResponseReceivedListener`, `useLastNotificationResponse`, `Linking.` geçen dosya `@/lib/week-param`'ı import eder |
| R-5 | Sahte = gerçek biçim | TS + Jest meta-test | Adaptör tipleri gerçek modülden türetilir (M-7). Sahteler `__tests__/helpers/fakes/<modül>.ts`, `satisfies` ile bağlı, başlığında native kaynak yolu (`node_modules/.../*.kt`). `jest.mock('expo-…', factory)` yalnızca izin listesindeki dosyalarda |
| R-6 | Proje politikası | Jest `__tests__/infra/policy.test.ts` | `package.json` bağımlılıkları = izin listesi (her girdide "ağ kontrolü: tarih, kim"); yasaklar: `expo-updates`, analitik/çökme SDK'ları, `firebase*` JS; SDK-kilitli paketlerde `^` yok; `reset-project` yok; `engines` var. `app.json`: `updates` yok, `allowBackup:false`, `blockedPermissions` 3 izin, paket kimliği sabit. `eas.json`: `channel` yok |
| R-7 | Renk tek kaynak | ESLint `no-restricted-syntax` `Literal[value=/^#[0-9a-fA-F]{3,8}$/]` | İstisna: `constants/theme.ts`, `card/tokens.ts` (yeni, §4.11), `src/dev/**`. Bugünkü 5 ihlal B14/V1'e kadar satır bazlı izin listesinde |
| R-8 | Dikey bütçe | Test şablonu + PR maddesi | `checkin-single-screen-fit.test.tsx` şablon. Kural: her ekran ya bütçe testine ya `ScrollView`'a sahip. Onboarding ve K3 ara ekranında bugün ikisi de yok |
| R-9 | Silme kapsamı | Jest `delete-all.coverage.test.ts` | `migrations.ts`'teki her `CREATE TABLE` adı `deleteAllData`'nın temizlediği tablolar arasında. `src/**`'de `writeAsStringAsync\|copyAsync\|moveAsync\|new File(` geçen her dosya, temizliği test edilmiş dosyalar listesinde |
| R-10 | İzin durum makinesi | Tablo güdümlü test şablonu + meta-test | İzin tüketen her fonksiyon 4 durumla test edilir: `granted`, `denied+canAskAgain`, `denied+!canAskAgain`, `undetermined` (iOS). `getPermissionsAsync`/`requestPermissionsAsync` yalnızca `notify/scheduler.ts`'te geçer |
| R-11 | Migration disiplini | Jest | (a) Yayımlanmış migration SQL'inin hash'i fikstürde; değişirse kırmızı. (b) Her migration tek transaction, `user_version` aynı transaction'da; yarıda kesme simülasyonu (04 #3 yöntemi) test olur. (c) Her sürümden son sürüme yükseltme testi, gerçek SQLite |
| R-12 | "Kart" adlandırması | Jest `naming.test.ts` | Kullanıcıya dönük metin kaynaklarında `/karne/i` yalnızca izin listesindeki anahtarlarda (§4.10) |
| R-13 | Üretim paketi | CI / `npm run check:bundle` | `expo export --platform android` çıktısında `dev-time-menu`, `currentWeekSunday2000` = 0; yayın kapısında ek olarak `[mağaza bağlantısı]` = 0 |
| R-14 | Saat dilimi matrisi | `npm run test:tz` | TZ testleri süreç TZ'sine göre beklenti seçer, test içinde TZ değiştirmez; `cross-env TZ=America/New_York HHK_TZ_RUN=1 jest __tests__/domain __tests__/notify` + `Europe/Berlin` |
| R-15 | Kart render sözleşmesi | Jest (render ağacı) | §4.11'deki 6 madde |
| R-16 | `eslint-disable` hijyeni | ESLint `linterOptions.reportUnusedDisableDirectives: 'error'` + meta-test | `-next-line`/`-line` dışı disable ve `--` gerekçesiz disable yasak (TB-6'daki blok disable) |
| R-17 | Log | ESLint `no-console: ['error', {allow: ['warn']}]` + meta-test | `console.warn(` argümanı tek string literal |

### 2.2 Sınıf → kontrol → "o olay yakalanır mıydı?"

| Sınıf | Olay (kanıt) | Kontrol | Yakalanır mıydı? |
|---|---|---|---|
| 1 Mock ≠ platform | BLG-01 Android 13 izni (`CLAUDE.md` 09-24) | R-5, R-10 | Büyük olasılıkla evet: `canAskAgain` zorunlu tip + 4 durumlu tablo, `denied+canAskAgain` dalını yazdırırdı. K4 yine şart |
| 2 Zaman | T-02..T-07 yapısal yanlış (08 §3); `openOrBuildCard(now?)` (M-3); BLG-03 | R-2, R-14, Ç-7; `now` zorunlu (TB-10) | TZ: evet (matris). `now?`: tip zorunlu olunca evet. BLG-03: hayır (yaşam döngüsü; `now-live.test.tsx` artık kapsıyor) |
| 3 Düzen | 4. kategori kesildi; BLG-04; B14 sabit renk | R-7, R-8, R-15 + §6 görsel regresyon | B14: evet (R-7). Kesilme: yalnızca ekranın bütçe testi varsa |
| 4 Dış yüzey | I-1 deep link kart yazdırma; N-4 onboarding atlama | R-4, R-13 | I-1: evet (R-4b doğrulayıcı importu). N-4: evet (R-4a rota izin listesi) |
| 5 Temizlik | ölü demo kodu pakette; spike kaldı; PNG kalıntısı | R-6, R-9, R-13 | Demo rotası: evet (R-4a). Spike: evet (R-6). Yeni tablo/dosya: evet (R-9) |
| 6 Eşzamanlı | silme + senkron yarışı; çift dokunuş (M-9) | PR maddesi + `useSingleFlight` konvansiyonu | Kısmen: çift dokunuşun mekanik testi yok; `useSingleFlight` tek kaynak olunca incelemede görünür |
| 7 Araç zinciri | Türkçe yol; CI Node 20; `^` sürüm | Ç-10, `preandroid` ASCII assert (§4.7), R-6 | Evet, üçü de ilk komutta anlaşılır mesajla |

**Önerilen yeni sınıflar** (bu turda 04'ün bulgularından; ortak standartlara eklenmesi §5'te):

| Yeni sınıf | Olay | Kontrol | Yakalanır mıydı? |
|---|---|---|---|
| 8 **Sözleşme izi kopukluğu** (spec'te yazılı davranışın UI yolu/testi yok; ad ≠ anlam; test adı ≠ test gücü) | 04 #1 `hasAnyPriorCard` "önceki" değil "herhangi"; 04 #2 kaçırılan haftaya yol yok; 04 #5 "zinciri besler" testi bağlantıyı doğrulamıyor | (a) `evals/checklist.md`'de spec maddesi → test adı izlenebilirlik sütunu; (b) PR maddesi: "bu test, doğruladığını iddia ettiği satır silinirse kırılır mı?" (mutasyon akıl yürütmesi); (c) yüklem adları sözleşmeyi söyler (`hasCardOtherThan(week)`) | #2: evet, izlenebilirlik sütunu boş kalırdı. #5: evet, mutasyon sorusu. #1: kısmen (ad kuralı insan kararı) |
| 9 **Kısmi başarısızlık** (çok adımlı kalıcı yazım yarıda kalır) | 04 #3 migration kalıcı çökme | R-11b; kural: çok adımlı kalıcı yazım = tek transaction ya da idempotent | Evet, kesme simülasyonu testi doğrudan o olay |
| 10 **Sessiz hata yolu** (reddedilme yutulur, ekran sonsuz yükler) | 04 #7 `.then` zincirleri `catch`siz; `fonts.ts:55` hata kullanılmıyor; silme hatası sessiz | R-3; kök `ErrorBoundary` (§4.5); kural: her async yükleme `loading/error/data` üçlüsü | `.then`siz `catch`: evet (R-3 dört yeri de işaretlerdi). Font hatası: hayır (değer okunmuyor; PR maddesi) |

### 2.3 PR kontrol listesi (REVIEW.md'ye eklenecek 8 soru; makinenin göremedikleri)

1. Platform API'sine dokundun mu? Sahte, native kaynaktan okunan biçimi taşıyor mu (dosya yolu başlıkta)? K4 planı ne?
2. "Şimdi" veya takvime bağlı mı? Gece yarısı, Pazar 19:59/20:00, TZ matrisi düşünüldü mü?
3. Ekran düzeni değişti mi? 411x914 bütçe testi ya da `ScrollView`; font 2.0; koyu mod kararı.
4. Yeni rota, parametre, bildirim verisi, paylaşım dönüşü var mı? Doğrulayıcı ve kapı?
5. Yeni kalıcı iz (tablo, sütun, dosya, ayar) var mı? Silme listesi + migration kuralı?
6. Aynı işlem iki kez ya da eşzamanlı tetiklenebilir mi (çift dokunuş, odak, AppState)?
7. Yeni testin gücü: doğruladığı satırı silersem kırılır mı?
8. Hata yolu: kullanıcı ne görür? Sonsuz yükleme ihtimali var mı?

## 3. CLAUDE.md ayıklama planı (uygulanmadı)

08 §1.4 kayıt kayıt karar tablosunu (satır numarasıyla) ve §1.5-1.9 taslak metinlerini verdi; **onlar geçerli, burada
tekrarlanmaz.** Bu bölüm yalnızca 08'in açık bıraktığı üç şeyi karara bağlar: dosya yapısı, taşıma algoritması, bekçi.

### 3.1 Yapı kararı: "kısa CLAUDE.md + konu dosyaları", kayıt başına dosya değil

`CLAUDE.md` her ajanın bağlamına **otomatik** girer; `docs/` altındaki dosyalar girmez. Bu yüzden ayrım "önemli/önemsiz"
değil, **"her görevde gerekebilir mi?"** sorusuyla yapılır. Kayıt başına ayrı dosya (`docs/tuzaklar/*.md`) reddedildi:
78 küçük dosya aranmaz, okunmaz. Konu başına dosya seçildi. Bir ajan o konuya dokunduğunda yönlendirme tablosu onu oraya götürür.

| Bölüm (`CLAUDE.md`) | Bütçe | İçerik |
|---|---|---|
| Ürün özeti | ≤ 12 satır | + ad Haftik, paket `com.batuhan.haftik` (tek yönlü kapı), "Kart" terimi |
| Commands | ≤ 20 | 08 §1.5 + `verify`, `test:tz`, `check:bundle`, ASCII yol |
| Konvansiyonlar | ≤ 80 | 08 §1.6; her maddenin sonunda kontrol ID'si `(R-2)`; ID'siz madde = "henüz insan hafızası" |
| Mimari | ≤ 25 | 08 §1.7 |
| **Konuya göre oku** (yeni) | ≤ 12 | "Bildirim/izne dokunuyorsan → `docs/muhendislik/bildirim-ve-izin.md`" türü yönlendirmeler |
| Bilinen tuzaklar | ≤ 25 kayıt × ≤ 3 satır | Yalnızca **aktif ve araçla yakalanmayan** tuzak; `(tarih, sınıf)` etiketi + varsa test adı |
| Açık kararlar ve cihaz maddeleri | ≤ 12 | 08 §1.9, Ç-3 ile güncel |
| Doğrulama / Değişmez kurallar / Paralel | aynen | — |
| **Toplam** | **≤ ~250 satır** | bugün ~750 |

Yeni dosyalar (hepsi `docs/muhendislik/`): `bildirim-ve-izin.md` (BLG-01, FCM/push, exact alarm, sync kuyruğu),
`kart-render.md` (ölçü bütçesi, view-shot, font, PNG temizliği, §4.11 sözleşmesi), `veri-ve-migration.md` (şema sapmaları,
`node:sqlite`, §4.6), `arac-zinciri.md` (SDK sürüm sabitleri, ASCII yol, `expo-env.d.ts`, Jest ve React Compiler lint
tuzakları), `tuzak-arsivi.md` (tarihçe; her kaydın başında `[ESKİ 2026-MM-DD: neden]`, metin değişmez). Ölçüm olaylarının
tanımı zaten `plan.md` S9'da, yeni dosya açılmaz.

### 3.2 Taşıma algoritması (kayıt başına 4 soru, sırayla)

1. **Hâlâ doğru mu?** Hayır → `tuzak-arsivi.md` (08'deki 17 E + bu turdan Ç-1/2/3/12).
2. **Karar ya da bilinçli sapma mı?** Evet → Mimari'de tek satır; ayrıntı zaten `plan.md` "Uygulama notu"nda.
3. **Bir araç (R-x, test) yakalıyor mu?** Evet → Konvansiyonlar'da tek satır + ID; ayrıntı konu dosyasına.
4. **Bilmeden kod yazan kırar mı?** Evet → Bilinen tuzaklar (≤ 3 satır) + konu dosyasında ayrıntı. Hayır → yalnızca konu dosyası.

Bu turun ekleri: `hasAnyPriorCard` anlamı (sınıf 8, T1 düzelince Konvansiyon'a), migration atomikliği (R-11, Konvansiyon),
Node ≥ 24 (Commands), "Kart" terimi (Ürün özeti + R-12), R8 açıldıktan sonra "yansıma ile yüklenen sınıf → keep kuralı"
(Tuzak, ilk R8 kırılmasında doldurulur; önceden uydurulmaz).

### 3.3 Uygulama sırası ve "hiçbir şey kaybolmadı" kanıtı

1. Çalışma ağacı commit'lenir (Batuhan; 08 §5.4). Ayıklama ayrı ve tek commit olur: `docs: CLAUDE.md ayıklama (08/28)`.
2. Konu dosyaları ve arşiv **kopyalanarak** oluşturulur (metin değiştirilmez), sonra `CLAUDE.md` yeniden yazılır.
3. **Kayıp kontrolü (mekanik, scratchpad betiği):** eski "Bilinen tuzaklar" bölümündeki her dosya yolu ve backtick'li
   tanımlayıcı (`src/...`, `__tests__/...`, `useNow`, `canAskAgain` …) yeni `CLAUDE.md` ∪ `docs/muhendislik/*` içinde en az
   bir kez geçmeli. Eksik liste boş olmadan commit yok.
4. **Taze bağlam testi:** verifier yalnızca yeni `CLAUDE.md`'yi okuyup şu 5 soruyu cevaplar: `node:sqlite` nerede yasak?
   TZ nasıl sabit? Yeni tablo eklerken ne yapılır? Android 13 izni neden `undetermined` dönmez? Emülatör derlemesi hangi yoldan
   yapılır? Her cevap doğru dosyaya işaret etmeli.
5. Batuhan okur, commit'ler.

**Bekçi (opsiyonel, ucuz):** `__tests__/infra/claude-md-budget.test.ts`: "Bilinen tuzaklar" altında ≤ 25 madde, madde başına
≤ 4 satır. Aşılırsa kırmızı olur ve tech-lead ayıklaması tetiklenir (rol protokolü madde 6'nın mekanik hali). **Yanlış
çıkarsa:** belge yüzünden test kırmızısı rahatsız ederse sınır yükseltilir ya da test silinir; ürün koduna etkisi yok.
**Geri dönüş:** arşiv silinmediği için kaybolan bir kayıt grep ile bulunup geri kopyalanır.

## 4. Profesyonel mühendislik eksikleri ve bu turun kararlarının mühendislik karşılığı

### 4.1 CI

- **Durum (K1):** Remote yok, CI hiç koşmadı; koşsaydı Node 20 yüzünden kırmızı olurdu (Ç-10).
- **Karar (remote açılırsa, B):** tek iş: `node-version-file: .nvmrc` → `npm ci` → `typecheck` → `lint` → `test --ci` →
  `check:bundle` (R-13); ikinci iş `test:tz` matrisi (R-14, TB-5'ten sonra). `concurrency` ile eski koşu iptal. `expo-doctor`
  CI'a girmez (ağ ister, Expo her yama yayınladığında kırmızı olur; aylık bakımda koşulur).
- **Remote açılmazsa:** `npm run verify` = `typecheck && lint && test && check:bundle`. "Bitti" demenin önkoşulu olarak
  çıktısı gösterilir (global kural zaten bunu istiyor; şimdi tek komut).
- **Sınır:** CI en fazla K2/K3 kanıtlar. İzin, bildirim, paylaşım, manifest, düzen K4/K5 ister (08 §5.3 tablosu geçerli).

### 4.2 Pre-commit

- 08'deki "hook önerilmez" kararını **şartlı** güncelliyorum: tam Jest koşusu hook'a girmez, ama hızlı bir kapı faydalı.
  Öneri: bağımlılıksız `.githooks/pre-commit` (husky yok): `typecheck` + `lint` + `jest --findRelatedTests <staged>`.
  Etkinleştirme Batuhan'ın tek komutudur: `git config core.hooksPath .githooks`. Süre ölçülmedi; 10 saniyeyi aşarsa kaldırılır.
- Commit'i Batuhan attığı için hook onun iş akışını değiştirir → **B kararı** (§7 S-3).

### 4.3 Bağımlılık güncelleme politikası

| Sınıf | Paketler | Nasıl güncellenir | Ne zaman |
|---|---|---|---|
| A. SDK-kilitli | `expo*`, `react`, `react-native*`, `@types/react`, `jest-expo`, `@types/jest`, `react-test-renderer`, `eslint-config-expo`, `typescript` | **Yalnızca** `npx expo install --check` / `--fix` | Aylık bakım günü; SDK büyük sürümü (58) ayrı dilim + tam K4 |
| B. Diğer JS | font paketleri, `cross-env`, `eslint` | Dependabot, gruplu, yalnızca patch/minor | Aylık |
| C. Actions | `actions/*` | Dependabot | Aylık |

- `dependabot.yml`: A sınıfı `ignore` (tüm güncelleme türleri; Expo'nun seçtiği yama npm'deki en son yamayla aynı değildir),
  B ve C `groups` + `interval: monthly`. Remote açılmadan önce yapılır (TB-23).
- **Aylık bakım günü (5 komut):** `npx expo install --check`, `npx expo-doctor`, `npm audit --omit=dev` (asla `--force`),
  `npm outdated`, `npm run verify`. Sonuç commit mesajına yazılır. Bugünkü 20/21: taban derlemesinde R8 ile aynı K4'te kapanır.
- **Dağıtım dondurması:** Dağıtılacak APK'dan önceki 7 gün bağımlılık değişmez (release-manager kapısı).
- **Yeni paket:** R-6 izin listesine satır + "ağa veri gönderiyor mu" notu (kim, tarih, hangi dosyaya bakıldı) + doctor.

### 4.4 Test piramidi ve test-automation giriş noktaları

| Katman | Bugün (K1, dosya ağacı) | Eksik |
|---|---|---|
| L1 domain birim | `__tests__/domain/*` (saf, hızlı) | TZ matrisi (R-14) |
| L2 veri entegrasyonu | `__tests__/data/*`, gerçek SQLite (`node:sqlite`) | kesme simülasyonu, sürümden sürüme yükseltme (R-11) |
| L3 bileşen/rota | `react-test-renderer` + satır içi mock'lar | sahte deseni (R-5); test gücü (04 #5) |
| L4 mimari/politika | yalnızca `no-push.test.ts`, `toolchain.test.ts` | R-1…R-17 |
| L5 e2e emülatör | **yok** (elle adb turları, 09/12'deki betikler) | aşağıda |
| L6 cihaz | `docs/manual-checklist.md` | kanıt ↔ commit SHA bağı |

**test-automation-engineer için giriş noktaları:**
1. **Araç:** Maestro (okunur YAML, adb üzerinden). Kurulum sistem düzeyi (Java + CLI) → B onayı. Olmazsa 12'deki adb
   betikleri `scripts/e2e/` altına alınır. Windows'ta Maestro desteği bu oturumda doğrulanmadı (K0).
2. **Seçiciler:** Her etkileşimli öğe `testID` = `<ekran>-<öğe>[-<varyant>]` (ör. `today-save`, `today-category-sleep-2`) ve
   `accessibilityLabel` taşır. Mekanik: ESLint `no-restricted-syntax` ile `testID`'siz `Pressable` (ekiple kararlaştırılırsa).
3. **Zaman:** e2e, var olan dev menüsünü **UI'dan** kullanır. Zaman ayarlayan yeni bir deep link **açılmaz**; o, yeni bir
   dışarıdan tetiklenebilir yüzey olurdu (sınıf 4).
4. **Veri tohumu:** `src/dev/fixtures.ts` (yalnızca `__DEV__` altında `require`, R-13 üretim paketinde olmadığını doğrular).
   Senaryolar: 3 günlük ilk kart, kaçırılan hafta, 4 haftalık geçmiş.
5. **Altın akışlar (5):** onboarding (izin ver / verme) · check-in + Kaydet geri bildirimi · 3 günlük ilk kart → kapat →
   yeniden aç (04 #1 regresyonu) · kaçırılan hafta (04 #2) · silme → onboarding.
6. **Kanıt:** e2e yalnızca ASCII yoldaki, commit'lenmiş ağaçtan yapılan derlemede koşar; rapor başlığında SHA.

`react-test-renderer` React 19'da kullanımdan kaldırılmış durumda (K0, bellek; doğrulanmalı). Şimdi göç yok. Tetik: test
çıktısında kaldırma uyarısı ya da SDK 58. O gün `@testing-library/react-native`'e tek seferde göç edilir (TB-24).

### 4.5 Hata sınırı ve log politikası

- **Durum:** `src/`te `ErrorBoundary` yok (grep 0). Render içindeki `initAppDatabase()` hatası (04 #3) beyaz ekran ya da
  çökme demek. Dört ekranda `.then` zinciri `catch`siz (04 #7).
- **Karar:** (1) Kök `src/app/_layout.tsx` expo-router `ErrorBoundary` dışa aktarır: sabit metin ("Bir şey ters gitti,
  verilerin cihazda duruyor") ve "Tekrar dene". Hata ayrıntısı gösterilmez ve loglanmaz. Veri silmeyi **önermez**.
  (2) Ekran yüklemeleri tek hook'tan geçer (`useLoad` → `loading | error | ready`). Aynı kalıbın dört ekranda dört ayrı
  şekilde yazılması çift mantıktır. (3) R-3 ve R-17 aktif. (4) Çökme raporlama SDK'sı yok (gizlilik sözü). Testçi
  hatası için Ayarlar'da **sürüm satırı** (`expo-constants`, kurulu) gösterilir; hata raporu ile git etiketi böylece eşleşir.

### 4.6 Migration disiplini (R-11 ile birlikte)

1. **"Yayımlanmış"** = herhangi bir dağıtılmış APK'da (preview dahil) bulunan migration. Etiketle işaretlenir, sonra değişmez.
2. Her migration tek transaction: `BEGIN; …; PRAGMA user_version = N; COMMIT;` (`user_version` başlık sayfasında, transaction'a
   dahil olduğu varsayımı K0; R-11b kesme testi bunu kanıtlar).
3. v1.x'te yalnızca ekleme: `CREATE TABLE`, varsayılanlı/nullable `ADD COLUMN`. `DROP` ve `RENAME` ayrı karar ister.
4. v2 numarası yakıldı, sonraki gerçek migration v3 (N-7 kararı ne olursa olsun; 08 TB-1).
5. **Dondurulmuş veri toleransı:** `weekly_card` satırları sonsuza dek okunur. Yeni alan (ör. V2 paylaşım unvanı) eski
   satırda `NULL` olunca kart yine çizilir (şerit). v2 döneminden bir fikstür satırıyla test edilir.
6. Her yeni tablo, silme kapsamına girer (R-9).

### 4.7 ASCII yol ve derleme otomasyonu

- **Karar (öneri, B):** 08 §6'daki seçenek B'yi koruyorum: repo `C:\dev\haftik`'e taşınır, tek kopyada çalışılır. Yeni
  değerlendirilen F ("ASCII yolda `git clone`, git ile senkron") reddedildi. Her senkron bir commit ister, commit'i ise
  yalnızca Batuhan atar; bu sürtünme robocopy'den kötü.
- **Hangi seçenek seçilirse seçilsin:** `package.json`'a `"preandroid"` ve `"preios"` eklenir. npm bu betikleri
  `npm run android`'den önce kendiliğinden çalıştırır: `node scripts/assert-ascii-path.js`. Betik, yol ASCII değilse ya da
  boşluk içeriyorsa açık bir mesajla durur.
- **Taşıma ertelenirse** robocopy satırı `scripts/sync-ascii.ps1` betiğine sarılır. Betik önce `robocopy /L` (kuru koşu)
  çalıştırır ve hedefte kaynaktan yeni ya da fazla dosya varsa **durur**: bu, kopyada yapılmış bir düzenlemenin sessizce
  silinmesini engeller. Sonra hedefe `.sync-stamp.json` yazar (`git rev-parse HEAD`, `git status --porcelain` özeti, saat).
  K4 belgeleri bu damgayı alıntılar. Böylece "eski kodda K4" riski görünür hale gelir.

### 4.8 Faz kapıları: taban → çekirdek → ikinci yapı ("bitti" ölçülebilir)

| Kapı | Mühendislik çıkış ölçütü (hepsi çıktısıyla) |
|---|---|
| **Taban → ilk preview APK** | Çalışma ağacı commit'li · `verify` + `test:tz` yeşil · R-1, R-3, R-6, R-11, R-13 aktif · doctor yeşil · R8 açık release derlemesinde §4.9 K4 listesi · T1/T2/T3 K2 regresyon + K4 · migration atomik (T7, V2 şemasından önce şart) · etiket `v1.1.0-preview.1` |
| **Çekirdek (V1-V4) → arkadaş denemesi** | R-7, R-12, R-15 aktif · kart token'ları tek kaynak · kart fikstür galerisi (§6 İ-2) K4 ekran görüntüleri · `layout.test.ts` değişimi Batuhan onaylı · kontrast testi · APK ≤ 40 MB (x86_64, 12'deki bütçe) |
| **İkinci yapı (V5-V6)** | v3 migration: R-11 a/b/c + dondurulmuş veri toleransı · R-9 yeni iz kapsamı · **yükseltme yolu K4**: sürüm N kur, veri gir, N+1'i üstüne kur, veri ve kart duruyor (testçiler APK'yı üstüne kuracak) · preview `versionCode` artışı (07 A4, release-manager) |

### 4.9 R8 ve paket temizliği (karar 7)

Teknik seçimi architect verir (21 §2g). Tutarlılık kuralları:
1. **Sıra, her adım ayrı commit:** (i) yalnızca JS olanlar: `spike/`, `reset-project`, web yığını (`react-dom`,
   `react-native-web`, `app.json` `web`, `global.css`, css-mock, `use-color-scheme.web.ts`) → (ii) Expo yamaları → (iii)
   reanimated çıkar → (iv) R8 + shrink → (v) worklets (opsiyonel, Ç-6) → (vi) Material Symbols çözümleyici (opsiyonel).
   Her adımda `verify` + `expo export` boyutu. Native adımlar (ii-vi) **tek** release K4 turunu paylaşır. Kırılırsa commit
   bazında ikiye bölme (bisect) yapılır; önbellekli release derlemesi 58 sn sürüyor (12 §9).
2. **R8'e duyarlı K4 listesi:** bildirim planlama ve tetiklenme, paylaşım (FileProvider), view-shot PNG, SQLite açılış ve
   migration, font yükleme, deep link, sekme ve stack gezinmesi, silme.
3. R8 yalnızca `app.json` config plugin'i üzerinden açılır (ör. `expo-build-properties`). Keep kuralları gerekirse aynı yerden
   eklenir. `android/` elle düzenlenmez: prebuild ürünüdür, sonraki prebuild'de değişiklik kaybolur.
4. Her release derlemesinin `mapping.txt` dosyası saklanır. Yoksa testçi yığın izleri okunamaz (release-manager; EAS'teki
   ayrıntı K0).
5. Material Symbols çözümleyicisi expo-router'ın iç yoluna yapılmış bir yamadır ve kırılgandır. Yalnızca iki koşulla
   yapılır: bir boyut kontrolü (font geri gelirse kırmızı) ve her expo-router güncellemesinde yeniden doğrulama. Kazancı
   sıkıştırılmış 430 KB, önceliği düşük.

### 4.10 "Kart" adlandırması (karar 5)

- **Sözlük:** Kodda `card`, kullanıcıya dönük metinde "kart". Tablo adı (`weekly_card`) ve `package.json` `name`
  değişmez (kullanıcı görmez; yeniden adlandırmak Windows büyük/küçük harf tuzağı taşır). Sözlük `CLAUDE.md` Ürün
  özeti'nde 3 satır olarak durur.
- **Bugünkü "karne" geçişleri (K1, grep):** `src/` 4 yerde (`domain/content/tr.ts:193`, `notification-texts.ts:17`,
  `card-preview-view.tsx:57`, `onboarding/welcome.tsx:11`), `site/` 5 yerde, `docs/s12-magaza-icerigi.md` 2 yerde.
  Prototiplerde "HAFTA KARNESİ" etiketi var (14/README), copywriter gözden geçirir.
- **Mekanik:** R-12 bu üç kaynağı tarar. İzin listesi copywriter'ın ve Batuhan'ın onayladığı mizah geçişleridir, başlangıçta
  boştur. İçerik havuzu değişirse `CONTENT_VERSION` artar.

### 4.11 C yönü: kart render sözleşmesi (karar 1; teknik seçim 21 §2b)

Mimari hangi tekniği seçerse seçsin, bu 8 madde bozulmamalı. Her biri bir testle bağlanır (R-15):
1. **Yakalanan ağaç** (ViewShot'ın içi) yalnızca `View`, `Text`, `Image` ve `transform` içerir. `elevation`, `shadow*`,
   `boxShadow`, blur ve gradyan paketi kullanılmaz. Gerekçe: Android'de elevation gölgesi yazılım tuvaline çizilmez, PNG ile
   ekran farklı çıkar (K0, bellek; ilk fikstürde K4 ile doğrulanmalı). C'nin sert gölgesi zaten ofsetli dolu `View`'dur
   (14/README), yani kuralla uyumlu. 10 §3'teki `e1` gölgesi yalnızca yakalanan ağacın **dışındaki** kapta olabilir.
   Architect başka bir bileşen türü seçerse (ör. SVG), o tür bu listeye ancak view-shot PNG'sinde K4 ile doğrulandıktan
   sonra girer.
2. **Veri taşımayan süsler** (noktalı zemin, arka kâğıt, rozet) sabit PNG olur. Noktalı zemin döşeme yerine tek
   1080×1920 PNG'dir; böylece `resizeMode="repeat"`'in ölçek ve yuvarlama farkı riskine girilmez. Varlıklar `card/assets.ts`
   üzerinden tek kaynaktan yüklenir.
3. **Token'lar tek dosyada:** renk, kontur, gölge ofseti ve eğim açıları `src/card/tokens.ts`'tedir (R-7). Eğim rastgele
   değildir; varyasyon gerekiyorsa `weekStart` tohumundan deterministik üretilir. Dondurulmuş kart her açılışta aynı
   görünmelidir.
4. **Döndürülmüş öğenin sınır kutusu** `layout.ts`'te hesaplanır. Test, öğenin güvenli bant içinde kaldığını doğrular.
5. **Gizlilik:** Gizli satır kategori tonunu taşımaz (karar 4). Test: gizli satırın stilinde kategori ton token'ı yoktur,
   gerçek metin render ağacına girmez, yer tutucunun genişliği sabittir.
6. **Seviye gösterimi** (karar 6) tek saf fonksiyondan gelir: `card/level-visual.ts` (`level → {size, fill, shape}`). Test:
   üç seviye, renk dışında en az bir özellikte ayrışır.
7. **Font:** Baloo 2 yalnızca kullanılan ağırlıklarla, alt yol importuyla gelir (Inter emsali). Font yüklenemezse sistem
   fontu kullanılır ve kart yine çizilir (sınıf 10). Türkçe glifler K4 fikstürüyle kontrol edilir.
8. **Önizleme ile paylaşılan PNG aynı `CardView`'dur**, yalnızca ölçeklenir (V2/Z19). İki ayrı render yolu açılmaz; açılırsa
   çift mantık olur.

## 5. Ekip anayasasına önerilen dersler (ortak-standartlar.md'ye, uygulanmadı)

Bugün §6'da 15 ders var. Ekleme kararı Batuhan'ın. Her ders bir olaya bağlı:

16. **Etkisiz güvence katmanı da sahte güvencedir.** Hiçbir şey yapmayan güvence (ör. `jest.setup.ts`'teki TZ ataması) ve
    ürünü test etmeyen yeşil testler (spike) güven sayısını şişirir. Güvence katmanı ya **doğrular** ya kaldırılır. (Ç-7, Ç-13)
17. **Belgeye durum değil, durumu ölçen aracın adı yazılır.** "21/21 yeşil" bayatlar, "doctor yeşil olmalı" bayatlamaz.
    Durum yazmak şartsa tarih ve "geçerlilik: X olana kadar" notu eklenir. (13 çelişkinin 9'u)
18. **Kural = kontrol ID'si.** Konvansiyon maddesi onu yakalayan lint/test adıyla yazılır; ID'siz madde "insan hafızası"
    etiketi taşır. İzin listeleri yalnızca küçülür. (M-1, Ç-8)
19. **Kanıt commit'e bağlıdır.** K4/K5 yalnızca commit'lenmiş ve temiz bir ağaçtan yapılan derlemede üretilir; belge SHA'yı
    (ya da senkron damgasını) taşır. Damgasız kopyada üretilen kanıt "yerel durum" diye etiketlenir. (08 §5.4, §6)
20. **Sözleşme izi (yeni sınıf 8).** Spec'teki her davranış maddesinin bir UI yolu ve bir testi vardır. Test adındaki iddia
    "bu satırı silersem kırılır mı?" sorusuyla sınanır. Yüklem adı sözleşmeyi söyler. (04 #1, #2, #5)
21. **Kısmi başarısızlık (yeni sınıf 9).** Çok adımlı kalıcı yazım ya atomiktir ya idempotenttir; kesme simülasyonu bunun
    testidir. (04 #3)
22. **Hata yolu da bir akıştır (yeni sınıf 10).** Her async yüklemenin üç durumu vardır; yüzen promise lint'le yakalanır;
    kullanıcı sonsuz yükleme görmez. (04 #7)
23. **Dışarı çıkan artefakt ile ekran aynı render yolunu kullanır.** Yakalanan ağaçta platforma göre değişen efekt (gölge,
    blur) olmaz. (§4.11)
24. **Bağımlılık ve derleme değişikliklerinde her değişiklik ayrı bir commit'tir.** Native değişiklikler tek bir K4 turunu
    paylaşır; bu tur kırılırsa commit'ler arasında ikiye bölme (bisect) yapılır. (§4.9)

Ayrıca: "yeni bir dilimde en az iki sınıf için kontrol istenir" kuralında sınıf listesi 7'den 10'a çıkar.

## 6. Yeni özellik / iyileştirme önerileri (geliştirici verimliliği)

Hiçbiri kullanıcıya dönük kapsam değil. Hepsi yerel, ağsız; gizlilik sözüne dokunmuyor. Efor: S ≤ 1 gün, M 2-4 gün (K0).

| # | Öneri | Etki | Efor | Sahibi |
|---|---|---|---|---|
| İ-1 | **Mimari bekçi paketi** (R-1…R-17: ESLint blokları + `__tests__/infra/*`) | Yüksek: 7+3 sınıfın çoğu editörde yakalanır | M (~1,5 gün) | mobile-engineer + qa |
| İ-2 | **Kart fikstür galerisi + görsel regresyon**: `src/dev/card-gallery.tsx` (yalnızca `__DEV__`) sabit fikstürleri `CardView` ile çizer (normal, unvan gizli, uzun unvan, tümü düşük, tümü gizli, ilk kart, 3 seviye karışık, Türkçe glif stresi). Emülatörde view-shot PNG'si → `adb pull` → isteğe bağlı piksel farkı | Yüksek: C'nin eğik/katmanlı düzeni en kırılgan yer; visual-designer'a sabit inceleme yüzeyi | Galeri S, fark aracı M (dev bağımlılığı ister) | mobile-engineer + visual-designer |
| İ-3 | **Token tek kaynak**: `constants/theme.ts` + `card/tokens.ts` kanonik; `scripts/export-tokens.js` bunlardan HTML prototiplerinin CSS değişkenlerini üretir | Orta: prototip ile uygulama ayrışmaz | S | visual-designer + mobile-engineer |
| İ-4 | **`npm run release:check`**: R-13 + yer tutucu taraması + birleşik manifest izinlerinin izin listesiyle farkı (`aapt2 dump permissions`) + APK boyut bütçesi + R-6 | Yüksek: yayın kapısı elle hatırlanmaz | M | devops + release-manager |
| İ-5 | **e2e harness**: 5 altın akış (§4.4) | Yüksek: K4 tekrarı saatlerden dakikalara iner | M-L | test-automation-engineer |
| İ-6 | **Test builder'ları**: `aWeek({filled})`, `aFrozenCard()`, `withNow()` | Orta: test yazımı hızlanır, 04 #5 türü zayıf testler azalır | S | qa |
| İ-7 | **Karar kayıtları (ADR)**: `docs/kararlar/NNN-*.md` (Kart adı, C render, R8, yol taşıma, Node 24) | Orta: kararlar `CLAUDE.md`'yi şişirmez | S | tech-lead |
| İ-8 | **Sürüm satırı**: Ayarlar'da sürüm; deneme raporunda sürüm alanı (tarih değil) | Orta: testçi hatası doğru etikete bağlanır | S | mobile-engineer; rapor alanı için security onayı |
| İ-9 | **Performans betikleri repoda**: 12'deki `tti.sh`, `nav.sh` → `scripts/perf/`, `npm run perf:coldstart` | Orta: bütçe regresyonu tekrarlanabilir olur | S | performance-engineer |

**Taslak intent'ler** (dosya oluşturulmadı):

- **İ-1 Mimari bekçi:** Katman sınırı, saat kaynağı, dış girdi, silme kapsamı ve bağımlılık politikası bugün yorumlarla ve
  verifier'ın grep'iyle korunuyor. İlk ters bağımlılık da başladı bile. Bu kuralları ESLint'e ve `__tests__/infra/`
  meta-testlerine çevirmek, 13 çelişkinin ve 04'teki üç hata sınıfının tekrarını editörde yakalar. Yeni bağımlılık yok,
  ürün davranışı değişmez. Başarı: R-1…R-17 aktif ve her birinin yakaladığı geçmiş olay testte yeniden üretilmiş.
- **İ-2 Kart fikstür galerisi:** C yönü eğik öğeler, katmanlar ve kategori tonları getiriyor; düzen hatası en çok burada
  çıkacak. Dev menüsünden açılan bir galeri, sabit fikstürleri gerçek `CardView` ile çizer ve PNG olarak dışa verir. Üretim
  paketine girmediği R-13 ile kanıtlanır. Başarı: her kart değişikliğinde 8 fikstürün PNG'si inceleme belgesine girer.
- **İ-4 Yayın kapısı betiği:** Dev menüsünün, yer tutucu bağlantının, beklenmeyen izinlerin ve boyut aşımının denetimi
  bugün belgelerde dağınık ve tek seferlik. Tek bir `release:check` komutu, her preview/production derlemesinden önce bunları
  sırayla doğrular ve bir rapor üretir. Başarı: 07'deki otomatikleştirilebilir kapılar tek komutta.
- **İ-5 e2e harness:** Emülatör turları elle yapılıyor ve tekrarlanmıyor; 04 #1 gibi kritik yollar da K4'te yalnızca bir
  kez görüldü. Beş altın akışı, dev menüsü ve fikstürlerle koşan tekrarlanabilir akışlara çevirmek, her taban ve çekirdek
  kapısında regresyonu dakikalar içinde gösterir. Aracın (Maestro ya da adb betikleri) kurulumu Batuhan'ın onayına bağlı.

## 7. Batuhan'a sorular

| # | Soru | Seçenekler | Öneri |
|---|---|---|---|
| S-1 | Proje yolu | (a) `C:\dev\haftik`'e taşı · (b) robocopy + `sync-ascii.ps1` güvenlik betiği · (c) `subst` dene | (a) |
| S-2 | GitHub remote ve CI | (a) özel depo + CI · (b) yalnızca yerel `npm run verify` | (a); açılmazsa (b) zorunlu |
| S-3 | Pre-commit hook | (a) hızlı hook (typecheck, lint, ilgili testler; 10 sn'yi aşarsa kaldır) · (b) yok | (a) |
| S-4 | Node alt sınırı | (a) `>=24` (bilinen ortam) · (b) `>=22.13` | (a) |
| S-5 | Silme onayı | (a) `spike/` + `reset-project` + web yığını · (b) yalnızca ilk ikisi | (a) |
| S-6 | e2e aracı | (a) Maestro kurulumu (Java + CLI; boyut kurulumdan önce söylenir) · (b) adb betikleri, sonra Maestro | (b) taban için, çekirdek kapısında (a) |
| S-7 | `CLAUDE.md` ayıklaması ne zaman? | (a) çalışma ağacı commit'lendikten hemen sonra · (b) taban bittikten sonra | (a): taban işi yapan ajanlar temiz belgeyle başlasın |
| S-8 | "Karne" sözcüğü | (a) kullanıcı metninde hiç yok · (b) copywriter'ın listelediği mizah bağlamlarında izinli (R-12 izin listesi) | (b); karar 5 "gözden geçirilir" diyor |
| S-9 | Material Symbols çözümleyicisi (430 KB sıkışık) | (a) R8'den sonra, boyut bekçisiyle dene · (b) kabul et | (a) |
| S-10 | §5'teki 9 ders | (a) hepsi `ortak-standartlar.md`'ye · (b) yalnızca 16-19 · (c) hiçbiri | (a) |

## 8. Doğrulanamayanlar, çelişkiler ve devir

**Doğrulanamayanlar:** Bu oturumda komut çalıştırılmadı (tüm iddialar K1 ya da K0). Şunlar K0'dır: Android elevation
gölgesinin view-shot PNG'sinde çizilmemesi, `PRAGMA user_version`'ın transaction'a dahil olması (R-11b testi kanıtlar),
`react-test-renderer`'ın React 19'da kullanımdan kaldırılmış olması, Maestro'nun Windows desteği, hook süresi, EAS'te
`mapping.txt`'nin saklanması, GitHub'ın ücretsiz CI dakikası.

**Açıkça yazılan çelişkiler:**
1. **08 ↔ 12 (worklets):** 12'deki ölçüm kazanır, Ç-6 buna göre değişti.
2. **10 §3 `e1` elevation gölgesi ↔ render sözleşmesi madde 1:** Gölge yalnızca yakalanan ağacın dışındaki kapta olabilir.
3. **14 prototiplerindeki "HAFTA KARNESİ" ↔ karar 5:** Copywriter bakar; R-12 izin listesi karar verir.
4. **08 "pre-commit önerilmez" ↔ §4.2:** Şartlı hook önerisi. Gerekçe: tam test koşusu yerine yalnızca ilgili testler.
5. **08 `engines >=22.13` ↔ Ç-10 `>=24`:** Doğrulanmamış bir alt sınır yerine bilinen ortam seçildi.
6. **21 ve 22 hâlâ iskelet.** Architect'in 2b (render) ve 2g (R8) kararları §4.9 ve §4.11 ile çelişirse, sözleşme maddesi
   ya o karara göre güncellenir ya da çelişki Batuhan'a taşınır. Sessizce gömülmez.

```
Durum:        bitti (belge); kod, CLAUDE.md, yapılandırma değişmedi; yalnızca bu dosya yazıldı
Yapıldı:      Ç-1..Ç-13 kararları; R-1..R-17 mekanik kontrol kataloğu; 3 yeni hata sınıfı (8-10); CLAUDE.md yapı,
              algoritma ve kayıp kontrolü planı; CI/hook/bağımlılık/test piramidi/hata sınırı/migration/ASCII yol;
              faz kapıları; R8 sırası; Kart adlandırma bekçisi; C render sözleşmesi (8 madde); 9 ders; 9 öneri; 10 soru
Kanıt:        K1 (dosya okuma, grep); K0 maddeler §8'de listeli
Karar gerek:  S-1..S-10 (Batuhan)
Sonraki:      mobile-engineer -> §4.9 sırası + İ-1 (R-1, R-3, R-6, R-11 önce); devops-engineer -> .nvmrc, engines,
              ci.yml, dependabot, preandroid assert; qa-engineer -> R-14 TZ, R-5 sahte deseni, İ-6;
              test-automation-engineer -> §4.4 giriş noktaları, İ-5; software-architect -> 21 §2b/§2g'yi §4.11/§4.9
              sözleşmesiyle karşılaştır; copywriter -> "karne" listesi (R-12); tech-lead -> S-7 onayından sonra §3 ayıklaması
```

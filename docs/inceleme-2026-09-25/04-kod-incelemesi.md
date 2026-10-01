**GENEL SONUÇ: Domain katmanı ve bildirim/silme kuyruğu sağlam; ama UI-veri sınırında 2 KRİTİK sözleşme/doğruluk hatası var (ilk kartın yeniden açılamaması, kaçırılan haftanın kartına yol olmaması), 5 önemli bulgu, 1 tanesi kalıcı açılış döngüsü riski. Yayın öncesi ikisi de kapanmalı.**

Bağımsız kod incelemesi (Kod İnceleyici, Principal), 2026-09-25. Kod değiştirilmedi. Önceki incelemeler (CLAUDE.md tuzakları, docs/emulator-*.md) ipucu olarak okundu, her bulgu kodu kendim okuyarak kuruldu.
Çalıştırılanlar: `npm test` = 71 suite, 863 geçti, 3 atlandı (K2). `npm run typecheck` ve `npm run lint` temiz. Domain'i ayrıca düz Node'da (TS'ten derlenmiş kopya, scratchpad) sınır/DST girdileriyle çalıştırdım.

## Bulgu tablosu

| # | Önem | Bulgu | Yer |
|---|---|---|---|
| 1 | **Kritik** | Ilk kart tam 3 gün ile açıldıysa Hafta ekranı "Kartın için 1 gün daha lazım" der ve kart bir daha açılamaz | `week.tsx:56-85,90-97`, `card-repo.ts:135-139`, `week.ts:106` |
| 2 | **Kritik** | "Uygun ama açılmamış geçen hafta kartı süresiz açılabilir" sözleşmesinin hiçbir UI yolu yok | `week.tsx:29,53`, `_layout.tsx` (bildirim tıklama işleyicisi yok), `spec.md:181,248-250` |
| 3 | Önemli | Migration atomik değil: yarım kalan v1/v2 sonrası her açılışta "table already exists", uygulama kalıcı çöker | `migrations.ts:34-90,124-134`, `_layout.tsx:33` |
| 4 | Önemli | Paylaşım dosyası sistem seçicisi kapanır kapanmaz siliniyor; Android'de seçici, hedef uygulama dosyayı okumadan sonuç döndürür (olasılık, doğrulanamadı) | `share.ts:59-65`, `report.ts:121-131` |
| 5 | Önemli | Test gücü: prev-varyant/unvan bağlantısını (`open-card`) hiçbir test yakalayamaz; #1'i yakalayan test yok | `open-card.test.ts:97-115`, `week-route.test.tsx:33-36` |
| 6 | Önemli | DST/saat dilimi testleri Jest'te sessizce atlanıyor; TZ/DST kanıtı CI'da yok | `notify-plan.test.ts:296-297` |
| 7 | Önemli | Silme ve yükleme hatalarında geri bildirim yok (sonsuz LoadingView, yutulan reddedilme) | `settings.tsx:93-101`, `card/[weekStart].tsx:55`, `today.tsx:66,82-98`, `week.tsx:52` |
| 8 | Nit | Ölü kod/içerik (7 kalem) | aşağıda |
| 9 | Nit | Çift mantık (tarih ayrıştırma x5, sabit x2) ve katman ters bağımlılığı | aşağıda |
| 10 | Nit | Eskimiş/yanıltıcı yorumlar (5 kalem) | aşağıda |
| 11 | Nit | Küçük UX/yaşam döngüsü pürüzleri (6 kalem) | aşağıda |

## Kritik

### 1. İlk kart tam 3 günle üretildiyse kart kilitli görünür, yeniden açılamaz
- Kök neden: `hasAnyPriorCard()` (`card-repo.ts:135`) "tabloda herhangi bir kart var mı" der ve haftanın **kendi** kartını da sayar. `week.tsx:56-85` bunu `getWeekState`e verir; `week.ts:106` eşiği 3'ten 4'e çıkarır.
- Girdi: ilk kurulum haftası, dolu günler Cuma-Cumartesi-Pazar (3 gün, bugün Pazar dolu), Pazar 20:30, kart açılıp dondurulur.
- Beklenen: Hafta sekmesi "Kartın açıldı." + "Kartını tekrar görmek için dokun", kutu dokunulabilir.
- Gerçek (Node'da çalıştırıldı, `getWeekState`, aynı check-in'ler, sadece bayrak değişti):
  - kart öncesi `hasAnyPriorCard=false`: `requiredDays 3, thresholdMet true, unlocked true`
  - kart sonrası `hasAnyPriorCard=true`: `requiredDays 4, thresholdMet false, unlocked false`
  - sonuç: `weekStatusHeadline` ilk dalda "Kartın için 1 gün daha lazım." döner (`hasCard` bilgisi bu dalda hiç okunmaz, `week-status-copy.ts:32-35`), `handleLockedPress` `!unlocked` diye sessizce çıkar (`week.tsx:91-93`). Kullanıcı `Kapat` (`dismissTo('/week')`) sonrası kendi ilk kartını Pazartesi 00:00'a kadar göremez, tekrar paylaşamaz.
- Neden önemli: E4(b) kararı bu senaryoyu (Perşembe/Cuma kuran kullanıcı) bilinçli olarak hedefliyor; yani ilk "wow" anının en olası yolu bu. `card_unlocked` sayacı zaten yazıldığı için ölçüm bunu göstermez.
- Aynı sınıf: `open-card.ts:94` de global `hasAnyPriorCard()` kullanır. Geçmiş bir haftaya (3 gün, kart yok) daha sonraki bir haftanın kartı dondurulduktan sonra bakılırsa eşik 3'ten 4'e çıkar ve `notReady` döner. Bildirim tarafı (`wiring.ts:19`) da aynı bayrağı kullanır ("kart dondurma eşiği 3 -> 4 yapar" diye `card/[weekStart].tsx:62` bunu bilerek bekliyor); bildirim için zararsız, Hafta ekranı için yanlış.
- Düzeltme yönü: eşik için "bu haftadan farklı bir haftanın kartı var mı" (`week_start <> ?`) veya "bu haftanın kartı varsa `unlocked` say" kuralı; `week-status-copy`te `cardSeen` her dalın önüne alınmalı.

### 2. Kaçırılan haftanın kartına ulaşım yolu yok
- Sözleşme: `spec.md:181` ("uygun ama açılmamış geçen haftanın kartı açılabilir kalır... Süre sınırı yok"), `spec.md:248-250` (S2 #6), `plan.md:161` (Bitti kanıtı), `docs/ux/pazar-akisi.md` kenar durum #3 ("kullanıcı doğrudan reveal akışına gider").
- Kod: `week.tsx:29` `weekStart = getWeekStart(now)`, yani ekran yalnızca içinde bulunulan haftayı bilir; `data/` içinde "açılabilir geçmiş haftaları listele" fonksiyonu yok (`grep pastWeek|unopened|listOpenWeeks` boş). Kart rotasına giden tek iki itme: `week.tsx:96` (bu hafta) ve `today.tsx:93` (K3 dönüşü). Bildirim tıklama işleyicisi de yok (`addNotificationResponseReceivedListener|useLastNotificationResponse` boş).
- Senaryo: Pazar 21:00'de 4 gün dolu, kullanıcı telefona bakmadı. Pazartesi 08:00 Hafta sekmesi yeni haftayı ("Kartın için 4 gün daha lazım") gösterir; geçen haftanın kartı ürün içinden erişilemez, yalnızca `haftik://card/<pazartesi>` ile açılır.
- Domain ve `openOrBuildCard` bunu destekliyor (S2 #6 testleri geçer), eksik olan UI ve veri katmanı yolu. Bu, "kart hazır" bildirimi hiç okunmadığında da geçerli: 20:00 bildirimine dokunmak hiçbir kart rotasına gitmez, uygulamayı son kaldığı rotada açar.
- Düzeltme yönü: Hafta ekranında "Geçen hafta kartın hazır" satırı (en yakın açılmamış uygun hafta, `weekly_card` yok + `getWeekState(...).unlocked`), bildirim tıklamasında `/week` yönlendirmesi. Bu bir kapsam işi (ayrı intent) olabilir; ama sözleşmede yazılı olduğu için sessiz bırakılamaz.

## Önemli

### 3. Migration atomik değil, kalıcı açılış döngüsü
- `runMigrations` (`migrations.ts:124-134`): `migration.up` bitmeden `user_version` yazılmaz, ama `up` içinde 4 ayrı `exec` var ve hiçbiri `IF NOT EXISTS`/transaction kullanmaz; v2 `ALTER TABLE ... ADD COLUMN` da aynı.
- Kanıt (scratchpad, `node:sqlite`, gerçek `runMigrations` kodu, 2. `exec`ten sonra süreç ölümü simüle edildi): 1. açılış `SIMULATED KILL`, `user_version` 0; 2. ve 3. açılış `table checkin already exists`. Ürün tarafında `initAppDatabase()` render içinde çağrılıyor (`_layout.tsx:33`), yani her açılışta çökme; tek çıkış veri silme/yeniden kurulum.
- Olasılık düşük (mikrosaniye aralığı, disk dolu vb.), etki felaket. Bu tuzak ilk gerçek v3 migration'da (ör. çok adımlı bir değişiklik) çok daha olası hale gelir. Düzeltme yönü: her migration'ı `BEGIN...COMMIT` içinde ve `user_version`'ı aynı transaction'da yaz.
- Ek: v2 "placeholder" migration'ı (`_v2_mechanism_proof_placeholder`) üretim şemasına giriyor (N-7 zaten Batuhan kararında bekliyor).

### 4. Paylaşım dosyası erken siliniyor olabilir (doğrulanamadı)
- `expo-sharing` Android'de `shareAsync`, `startActivityForResult(chooser)` sonucunu `OnActivityResult`ta çözer (`node_modules/expo-sharing/android/.../SharingModule.kt`, "OnActivityResult"). Seçici bir hedef uygulama başlatırken kapanıp sonuç döndürdüğünden promise, hedef (ör. WhatsApp) `content://` URI'sini okumadan çözülebilir. `shareCard`in `finally`si (`share.ts:63-65`) ve `shareReport`in `finally`si (`report.ts:126-131`) o anda dosyayı siler.
- K4 kanıtı yalnızca iptal yolu için var (P-07: iptalde cache boş). Başarılı hedef seçimi doğrulanmadı (emülatörde WhatsApp yok; P-04). Yani "PNG hedefte boş/eksik gelir mi" bilinmiyor.
- Önerilen yön: sonuçta silmeyi bırak; dosyayı sonraki `shareCard`/açılış süpürmesinde (yaşa göre, örn. > 1 saat) sil. Bu zaten `sweepSnapshotFiles` ile yarı hazır. K5'te gerçek cihaz kontrolü şart.

### 5. Test gücü boşlukları
- `open-card.test.ts:97-115`: adı "tekrar-önleme zincirini gerçek dondurulmuş veriden besler" ama tek doğrulama `weekStart` eşitliği. `prevVariantsFrom`/`prevTitleId` bağlantısı silinse bile test geçer (mutasyon akıl yürütmesi, K1). `buildCard` içindeki parametre testi (`buildCard.test.ts:109-115`) bağlantıyı kanıtlamaz; bağlantı yalnızca `open-card.ts:104-117`te.
- `week-route.test.tsx:33-36`: `hasAnyPriorCard` hep `false`; #1 bu yüzden görünmez. Ayrıca `useFocusEffect` mock'u düz `useEffect` (gerçek odak/kayıp davranışı yok; kabul edilebilir ama not).
- `open-card.test.ts:42,83,105`: `if (result.status !== 'ready') return;` sessiz çıkış kalıbı; `expect(...).toBe('ready')` öncesinde var olduğu için zararsız ama tür daraltma için `throw` daha güvenli.

### 6. Saat dilimi testleri CI'da yok
- `notify-plan.test.ts:296-297`: T-02..T-07 `tzEffective()` yanlışsa `it.skip`, yani Jest çalışmasında 3 atlanmış test = DST/saat dilimi kanıtı yok (durum açık raporlanıyor, sahte geçiş değil).
- Ben aynı domain kodunu düz Node'da `process.env.TZ='America/New_York'` atayarak çalıştırdım (Node'da çalışıyor, Jest sandbox'ında değil): `getWeekState` 2026-03-08 (ileri saat) ve 2026-11-01 (geri saat) Pazar 19:59 -> kilitli, 20:00 -> açık; `addLocalDays('2026-03-07',2)`=03-09, `('2026-10-31',2)`=11-02; olmayan 02:30 yerel saati 03:30'a normalleşiyor. Yani domain doğru, ama kanıt kalıcı değil. Öneri: bu kontrolleri `child_process` ile ayrı Node sürecinde koşan bir test veya `jest globalSetup` altına al.

### 7. Hata geri bildirimi
- `settings.tsx:93-101`: `deleteAllData` fırlatırsa `router.replace('/')` çalışmaz, kullanıcıya hiçbir şey gösterilmez ve reddedilme yutulur; "verilerimi sil" gizlilik vaadinin başarısız yolu sessiz.
- `card/[weekStart].tsx:55`, `today.tsx:66`, `week.tsx:52`: `.then` zincirlerinde `catch` yok; `getCard` bozuk JSON'da (`card-repo.ts:57`) fırlatırsa ekran sonsuza dek `LoadingView`de kalır. `today.tsx:82-98` `handleSave` `finally`li ama `catch`siz.
- `card/fonts.ts:55`: `error` alınıp hiç kullanılmıyor; font yüklenemezse kart ekranı sonsuz yükleme.

## Nit / sadelik

**8. Ölü kod ve içerik**
- `src/domain/clock.ts` (`Clock` hiçbir yerde kullanılmıyor).
- `metrics-calc.aggregateMetrics` üretimde çağrılmıyor (yalnızca testler; Batuhan'ın elle toplama aracı olarak belgelenmiş).
- `hide-state.isCategoryHidden` üretimde kullanılmıyor.
- `setting.notification_ids` (`setting-repo.ts:86-92`): hiç yazılmıyor; planlama deterministik id + `cancelAll` kullanıyor.
- `title.basic.*.medium` (4 unvan, `tr.ts`): `basicTitleRule` yalnızca medium olmayan kategori seçer; 3 seviye x 81 kombinasyon x 3 gün sayısı (243 çağrı, Node) boyunca hiç üretilmedi. `bigLeapUp/bigDrop` da null delta ile ulaşılmaz (delta senaryosu, beklenen).
- `partialData` özet kovası (2 metin, `copy.ts:95`): `computeDelta` null kararını haftaya bağlı verir (bu hafta ortalaması hiç null değil, önceki hafta günü sayısı tüm kategoriler için aynı), yani deltalar ya hepsi null ya hiçbiri; `nullCount>0 && <4` ulaşılmaz.
- `CardRevealView.tsx:87,183`: `viewShotRef` hiç okunmuyor (yakalama yalnızca `CardPreviewView`de).
- `spike/` klasörü ve `__tests__/spike/*` (S1 kalıntısı), `react-dom`/`react-native-web`/`reanimated`/`worklets` (expo-router peer'i olarak belgeli).

**9. Çift mantık ve katman**
- Tarih ayrıştırma/doğrulama 5 yerde: `week.ts:25`, `notify-plan.ts:51`, `date-format.ts:28`, `week-param.ts:13`, `metrics-calc.ts:43-54`. `CARD_UNLOCK_HOUR` `dev-time-helpers.ts:15`te tekrarlı (belgeli).
- `data/delete-all.ts:20-21` `card/temp-cleanup` ve `metrics/report-file` import eder: veri katmanı dosya sistemi/UI yakın modüllere bağlı.
- `hasAnyPriorCard` adı yanıltıcı (#1'in kökü): "önceki" değil "herhangi".

**10. Eskimiş/yanıltıcı yorumlar**
- `onboarding/notifications.tsx:4-6` "notify/ modülü henüz yok".
- `settings.tsx:3` "deneme raporu düğmesi S9'da eklenecek" (var).
- `CardRevealView.tsx:22-24` "viewShotRef'i onRevealComplete ile dışarı açar" (açmıyor).
- `pazar-akisi.md` kenar durum #3: Pazartesi'den sonra Pazar'a check-in eklenemeyeceğini söyler; kod "Dün"e izin verir (`today.tsx`, dayOffset 1).
- Proje `CLAUDE.md` "Konvansiyonlar/Mimari: henüz tanımlanmadı" (S1'den kalma).

**11. Küçük pürüzler**
- Çift dokunuş: `today.tsx` ve `card-preview-view.tsx` yalnızca state ile korunur (`onboarding/notifications.tsx:32` `useRef` kullanıyor, tutarsız); aynı karede iki dokunuş `check_in_saved`/`share_initiated`/`line_hidden` sayaçlarını iki kez artırır.
- Ön plana her gelişte iki sync: `_layout.tsx:54-58` ve `settings.tsx:55-61` (Ayarlar açıksa); kuyruk seriyeleştiriyor, zararsız ama gereksiz `cancelAll`+7 planlama.
- `reminderTime='20:00'` Pazar günü 20:00 kart bildirimiyle aynı dakikaya düşer (iki bildirim).
- Seçiciyi iptal etmek "paylaşıldı" sayılır: gizleme seçimleri sıfırlanır, reveal animasyonu yeniden oynar (`card-preview-view.tsx:86-89`).
- Bildirim küçük simgesi yapılandırılmadı (`expo-notifications` plugin yok); Android'de gri kare çıkabilir. Doğrulanmadı (K4 turunda gözlem kaydı yok).
- Yer tutucu `[mağaza bağlantısı]` PNG damgasında ve seçici başlığında (`constants.ts:17`, `card-preview-view.tsx:57`); otomatik yayın kapısı yok (üretim derlemesinde bu dizeyi reddeden test/ kontrol yok).

## Temiz çıkanlar (kanıtla)
- **Seviye sınırları:** `[1,2,2]` ve `[1,1,2,2,2,2]` tam 5/3, `[2,2,3]` ve 6 günlük 14/6 tam 7/3 ortada (medium); n=1..7 için tüm tam sınır toplamları (n=3, s=5/7; n=6, s=10/14) medium (Node). `delta.ts` epsilon mantığı ve `7/3-11/6` durumu doğru.
- **Unvan motoru:** 81 kombinasyon x {3,4,7} gün = 243 çağrı, hiçbiri fırlatmadı; `prevTitleId` ile ilk farklı eşleşme seçiliyor, tek eşleşme varsa tekrar (belgeli).
- **Hafta/saat:** `getWeekState` Pazar 19:59/20:00 sınırı Istanbul ve (elle) New York DST günlerinde doğru; yıl/ay sonu haftası leksikografik karşılaştırması güvenli; `toISOString` kullanılmıyor.
- **Kart uygunluğu:** 4 gün / ilk kart 3 gün kuralı domain'de doğru (#1 sorunu domain'de değil, `hasAnyPriorCard` girdisinde). Deep link: `isValidWeekStartParam` biçim+takvim+Pazartesi+gelecek reddi; `openOrBuildCard` kendi başına uygunluk doğrular; `returnToCardWeekStart` de doğrulanıyor.
- **Eşzamanlılık:** `runExclusiveNotify` tek zincir + `runDeleteExclusive` silme/senkron yarışını kapatıyor, kuyruk içi tekrar giriş yok (kilitlenme yok); `sync` iki kez okuma ve `onboardingDone` kapısı doğru. `useNow` zamanlayıcı/AppState/abonelik temizliği doğru, `msUntilNextTick` sınırları test edilmiş, güncel değerler hep yeni `Date`.
- **Silme:** dört tablo tek transaction (+ROLLBACK), rapor/PNG süpürme, bildirim iptal hatası yutuluyor; `router.replace('/')` ile kapı yeniden okunuyor.
- **Mimari sınırlar (grep):** `node:sqlite` `src/`te yalnızca yorumda; domain'de platform/UI importu yok, `Date.now()` yok; `src/dev` yalnızca `__DEV__` korumalı `require` ile.
- **SQL/log:** tüm sorgular parametreli (`setUserVersion` sabit sayı); `console.*` yalnızca 2 sabit metin; `expo-notifications` push API'leri çağrılmıyor.
- **Bütünlük:** `typecheck` ve `lint` temiz; `saveCard` no-op ve senkron sürücüde check-then-insert atomik.

## Kapsam sınırı
- Cihaz/emülatör çalıştırılmadı (K4/K5 yok). Bulgu #4 platform davranışı: yalnızca `expo-sharing` Kotlin kaynağı okundu (K1), `expo-notifications`, `react-native-view-shot`, `expo-sqlite` native kaynakları yeniden okunmadı; izin durum makinesi belge ve mock testlerine göre değerlendirildi.
- Domain'i düz Node'a derleyip çalıştırdım; Hermes/RN zamanlayıcı ve `Date` ayrıştırma farkları (ör. `new Date('YYYY-MM-DDTHH:mm:ss')` yerel yorum) belge/spec bilgisine dayanıyor.
- Görsel düzen, erişilebilirlik ve içerik metinlerinin ton kalitesi yalnızca örneklendi (semantik tutarlılık: uyku/harcama satır ve unvanları okundu, çelişki bulunmadı).
- `site/`, `android/` üretilmiş çıktısı, `docs/s10-*` güvenlik raporunun derin doğrulaması ve mağaza/hukuk maddeleri kapsam dışı (security-reviewer, privacy-compliance-analyst).
- Güvenlik yüzeyi yüzeysel: deep link, log, SQL; derin analiz `security-reviewer`de.

# Tuzak arşivi — artık geçersiz veya tek seferlik kayıtlar

> Bu dosya **yönlendirme için okunmaz** — yalnızca "neden böyle yapmıştık" sorusuna geriye dönük cevap
> arandığında bakılır. Hiçbir kayıt silinmez, yalnızca buraya taşınır (`[ESKİ <tarih>: <neden>]` etiketiyle).
> Taşıma kararı: `docs/inceleme-2026-09-25/08-muhendislik-tutarlilik.md` §1.4 (sütun "E").

- **[ESKİ 2026-10-01: emülatör turu ve araç kurulumu çoktan yapıldı]** (2026-09-21) Bu Windows makinesinde
  Node.js/npm ve Android araçları kurulu değildi; Expo işine başlamadan önce kurulmaları gerekiyordu.

- **[ESKİ 2026-09-23 (S7a'da kapandı): `plan.md:201`]** (2026-09-22, MOB/S3) `buildCard` imzasına isteğe bağlı
  5. parametre (`prevVariants`) eklenmişti ve "S5/S7'de gerçek kalıcı önceki-varyant izleme wiring'i yapılmalı,
  yapılmazsa tekrar-önleme kuralı yalnızca birim seviyesinde doğrulanmış olur" uyarısı taşıyordu. S7a'da
  `open-card.ts` ile gerçek wiring yapıldı, uyarı artık geçersiz.

- **[ESKİ 2026-09-23 (S5'te kapandı)]** (2026-09-22) `expo-sqlite` o tarihe kadar `package.json`'da hiç kurulu
  değildi (spec/plan'da seçim olarak yazılıydı ama S1 iskeletine eklenmemişti). S5'te eklendi, 21/21 yeşil kaldı.

- **[ESKİ 2026-09-24+ (her dilimde tekrarlanan not, tek satıra indirildi)]** S6, S7a, S7b, S8, S9 dilimlerinin
  her birinde ayrı ayrı "Cihaz/emülatör bu ortamda yok, plan.md'nin Bitti kanıtı'nın gerçek-cihaz maddeleri
  karşılanamadı" notu vardı. Emülatör turu (2026-09-24) bu maddelerin çoğunu kapattı; kalan cihaz/gerçek-cihaz
  (K5) maddeleri artık `CLAUDE.md` "Açık kararlar ve cihaz maddeleri" bölümünde tek satırda toplanıyor.

- **[ESKİ 2026-09-23 (sandbox kısıtı kalktı, kod bugün gerçekten silindi)]** (2026-09-23, MOB/S6) Expo
  şablonunun demo iskeleti (`explore.tsx`, `app-tabs*`, `animated-icon*`, `hint-row.tsx`, `web-badge.tsx`,
  `external-link.tsx`, `ui/collapsible.tsx`) o oturumun sandbox izin sistemi yüzünden silinememişti.
  (2026-09-23, OPS/S10) Sonraki oturumda bu dosyalar (ve kullanılmayan `assets/images/{tabIcons/*, expo-badge*,
  expo-logo, logo-glow, react-logo*, tutorial-web}`) grep ile hiçbir referans kalmadığı doğrulanıp silindi;
  `npm uninstall expo-web-browser expo-symbols expo-image` yapıldı. `react-native-reanimated`/`worklets` ve
  `react-dom`/`react-native-web` o turda dokunulmamıştı — ikinci grup **2026-10-01'de** (bu turda) kaldırıldı,
  ilk grup (reanimated/worklets) hâlâ duruyor, kaldırma R8 dilimine (S18) bağlı ayrı bir karar
  (bkz. `docs/kararlar/2026-10-01-taban-oncesi-kararlar.md` A18 ve `29-yol-haritasi.md` Ç30).

- **[ESKİ 2026-09-23 (S7a'da gerçek akışa bağlandı)]** (2026-09-23, MOB/S6) Hafta durumu ekranında
  `unlocked === true` iken kilitli kutuya dokunma gerçek kart açılışına götürmüyordu, yalnızca "S7'de
  eklenecek" diyen bir `Alert` gösteriyordu. S7a'da `Alert` kaldırıldı, gerçek akışa bağlandı
  (`src/lib/card-flow.ts`, `src/card/open-card.ts`, `src/components/sunday-checkin-required-view.tsx`).

- **[ESKİ 2026-09-23: zaten `plan.md:264`'te var]** (2026-09-23, S12 kararları) Uyku etiketi, hedef yaş,
  dağıtım sırası kararları — tekrar kayıt, asıl kaynak `plan.md`.

- **[ESKİ 2026-09-23: zaten `docs/icerik-inceleme.md`'de var]** (2026-09-23, K8) İçerik tonu geçişi (12 metin)
  — ayrıntı o belgede, burada tekrarlanmaz.

- **[ESKİ 2026-09-23 (S10'da kaldırıldı)]** (2026-09-23, OPS/S10 ön not) `eas.json`'da `developmentClient:true`
  olan bir `development` profili vardı ama `expo-dev-client` bağımlılığı yoktu, profil çalışmazdı.
  (2026-09-23, MOB/S10 güvenlik düzeltmeleri) Bu profil kaldırıldı (N-8); kalan profiller `preview` ve
  `production`.

- **[ESKİ 2026-09-24 (B14 kararı artık verildi: A11, açık temaya kilit)]** `locked-card-placeholder.tsx`
  iskelet renkleri ve silme düğmesi tema dışı sabitti, koyu modda düşük kontrast (~3.9:1) oluşuyordu;
  "v1 yalnızca açık tema mı?" sorusu açıktı. 2026-10-01'de Batuhan A11 kararıyla "evet, `userInterfaceStyle:
  light`" dedi — S16b'de uygulanacak.

- **[ESKİ 2026-10-01: proje kalıcı olarak `C:\dev\haftik`'e taşındı]** (2026-09-24, MOB) Türkçe karakterli
  proje yolu (`...\Desktop\Geliştirme için\...`) Gradle/RN derlemesini kırıyordu; derleme ASCII yollu bir
  kopyadan (`C:\hhk\haftik`) yapılıp robocopy ile senkronlanıyordu. Bu desen artık kullanılmıyor — ayrıntı
  `docs/muhendislik/arac-zinciri.md` "ASCII yol problemi".

- **[ESKİ 2026-10-02: S16b'de kapandı, iOS yalnızca kodla]** (2026-09-23, S5-temizlik) view-shot PNG'si iOS'ta
  `NSTemporaryDirectory` altına yazıyor, süpürme yalnızca Android'deydi ("iOS yola girdi, aktif açık uç").
  S16b'de yakalama `result:'base64'` + adanmış `cacheDirectory/haftik-share/` dizinine geçti; iki platformda aynı
  süpürme/silme. Ayrıntı: `docs/muhendislik/kart-render.md`.

- **[ESKİ 2026-10-02: S16b'de yerini aldı]** (2026-09-23, MOB/S7b/S10) Paylaşılan kart PNG'si ve deneme raporu
  `shareAsync` bitince `finally`de siliniyordu (E10 kararı, S10 I-1). Hedef uygulama dosyayı okumadan çözülebildiği
  için silme boş görsel verebiliyordu (04 #4); artık silinmez, yaşa göre süpürülür. Ayrıntı: `kart-render.md`.

- **[ESKİ 2026-10-02: S17/S18 sonrası]** (2026-09-23, OPS/S10) `INTERNET`in `app.json` `blockedPermissions` ile tüm
  varyantlardan kaldırılması dev client/Metro'yu kırar (önerilmedi). Çözüldü: yalnız release varyantından plugin ile
  (`plugins/with-permission-policy.js`, S17). Ayrıntı: `docs/muhendislik/bildirim-ve-izin.md`.

# 01 — Ürün teşhisi: "yetersiz" semptomunun katmanlara ayrılması (Haftik)

Tarih: 2026-09-25. Yazan: product-owner (Principal, ürün kapsamı). Durum: **öneri — hiçbir madde "karar verildi" değildir;
kapsam kararları Batuhan'ındır (bölüm 5).** Kod/yapılandırma değiştirilmedi.

Okunan kaynaklar: `intent/2026-09-20-haftalik-hayat-karti.md`, `spec.md`, `plan.md`, `CLAUDE.md`, `docs/ux/*.md` (4 dosya),
`docs/emulator-test-sonuclari.md`, `docs/emulator-tekrar-dogrulama.md`, `docs/emulator-ux-incelemesi.md`,
`docs/icerik-inceleme.md`, `docs/s12-magaza-icerigi.md`, `src/domain/content/tr.ts`, `src/domain/titles.ts`,
`src/domain/copy.ts`, `src/app/**`, `src/components/**`, `src/card/**`, `src/metrics/report.ts`, `src/constants/*`, `app.json`.

Kanıt seviyeleri `~/.claude/team/ortak-standartlar.md` K0-K5 merdivenine göredir. **Bu belgede kullanıcı davranışına dair
hiçbir K5 kanıtı yok:** deneme başlamadı, tek kullanıcı sinyali Batuhan'ın emülatördeki ilk izlenimidir (K0, n=1).

---

## Özet

1. "Yetersiz" tek bir kusur değil; beş katmanın dördünde somut, kodla kanıtlanmış bir neden var. **Ürün "yanlış" değil
   (henüz sınanmadı), "eksik" (spec'in istediği iki akış uygulanmamış) ve "yetersiz" (deneyim/içerik/paylaşılan artefakt).**
2. En ağır bulgu dağıtım katmanında: **varsayılan ayarla paylaşılan kartta unvan çoğu hafta `???` çıkıyor** (elle hesap:
   düzgün dağılımda 81 kombinasyonun en fazla 16'sında unvan görünür; orta ağırlıklı varsayımda ~%40). Intent'in tek başarı
   ölçütü paylaşım oranı; paylaşılan şeyin kancası varsayılan olarak siliniyor.
3. İkinci ağır bulgu alışkanlık/akış katmanında: **wow anına giden iki yol kırık**: "Karnen hazır" bildirimi kartı açmıyor
   (BLG-09) ve Pazartesi 00:00'dan sonra geçen haftanın açılmamış kartına arayüzden yol yok (spec "açılabilir kalır" diyor).
4. Deneyim katmanı: uygulama Expo şablon teması/ikonuyla görünüyor; günlük tek eylem (Kaydet) hiçbir geri bildirim vermeden
   bitiyor; ilk oturumda kullanıcı ne alacağını hiç görmüyor (ilk karta ortalama ~5 gün).
5. Öneri: yeni özellik değil, **denemeden önce ~9 maddelik dar v1.1** (bölüm 4); "haftanın deseni", seri, galeri gibi
   genişlemeler ayrı `intent.md`. Arkadaş çevresi tek atımlık bir test havuzudur; bilinen baskılayıcılarla deneme harcanmamalı.

---

## 1. Gerçek vaat ve bugünkü gerçek durum

### 1.1 Vaat (intent'ten, değiştirilmeden)

- **İş (JTBD):** "Haftamı tek bakışta, kendime gülebileceğim ve paylaşmaya değer bir karta dönüştür; bunun için günde 10
  saniyeden fazla emek isteme." Referans: Spotify Wrapped'ın kişisel veri → paylaşılabilir kimlik mekaniği, haftalık.
- **Başarı ölçütü:** 4 haftalık kapalı denemede kartı görenlerin **>= %25'i kendiliğinden paylaşır**; ek gösterge D7.
  Eşik tutmazsa ürün ele alınır, kapsam genişletilmez (intent, E12).
- **Sözler (kısıt):** veri yalnızca cihazda, hesap/sunucu/analitik yok; kartta ham sayı/tarih yok; tanısız, tavsiyesiz ton.

**Değer zinciri:** edinme (davet/APK) → aktivasyon (ilk kart açıldı) → alışkanlık (4+ gün/hafta, her Pazar) → paylaşım
(kart dışarı çıkar, damga yeni kullanıcı getirir). Bu belgenin teşhisi: **kırık halkalar aktivasyon (kart yolu), alışkanlık
(ara ödül yok) ve paylaşım (artefakt/damga)**. Edinme denemede elle yapılacağı için şu an kritik değil.

### 1.2 Yaşantı: kullanıcı gerçekte ne görüyor (koddan ve QA K4 kayıtlarından)

| An | Kullanıcının gördüğü | Değer anı var mı? | Kanıt |
|---|---|---|---|
| **İlk 10 sn** | 3 metin-yalnız onboarding ekranı ("Her gün 8 saniye. Her pazar bir karne."), gizlilik cümlesi, bildirim izni. Görsel yok, örnek kart yok. Sonra 12 emojili gri kutulu form. | **Hayır.** Getiri yalnızca cümleyle vaat ediliyor. | `src/app/onboarding/welcome.tsx`, `src/components/onboarding-screen.tsx` (K1); QA o2/o3 (K4) |
| **İlk gün** | 4 emoji + Kaydet. Kaydet'ten sonra **hiçbir şey olmuyor**: onay yok, ilerleme yok, seçimler ekranda kalıyor. Hafta sekmesinde 1 nokta, "Kartın için 2 gün daha lazım.", gri iskelet + kilit. Ayarlar: anahtar, 4 saat çipi, sil. | Hayır. Günlük tek eylemin ödülü sıfır. | `src/app/(main)/today.tsx` `handleSave` (K1); `src/lib/week-status-copy.ts`; `locked-card-placeholder.tsx` |
| **İlk hafta (gün 2-6)** | 21:00 "Bugün nasıldı?" → 8 sn → sessizlik. Eşik dolunca başlık "Kartın hazırlanıyor." ve Pazar'a kadar değişmiyor. | Hayır. | `notification-texts.ts`, `week-status-copy.ts` (K1) |
| **İlk Pazar 20:00** | "Karnen hazır" bildirimi → dokununca uygulama **son açık ekranda** açılıyor (kart değil) → Hafta sekmesine git → kutuya dokun → (bugün boşsa) ara ekran → check-in → reveal (1,2 sn, yalnızca opaklık). Beyaz zemin, siyah metin kart; özet: "Bu ilk kartın, önceki haftayla kıyas henüz yok."; damga: "Haftik · [mağaza bağlantısı]". | **Evet, tek an** — ama yolu 3-5 dokunuş ve ilk kartın son cümlesi "yok" diyor. | BLG-09 (K4), `CardRevealView.tsx`, `CardView.tsx`, `tr.ts` firstCard (K1); QA k3/rv3 (K4) |
| **Paylaş** | Önizleme: uyku + harcama `???`; unvan bunlardan türediyse o da `???`. "Bu haliyle paylaş" → sistem sayfası; paylaşım metni hedefe taşınmıyor. | Paylaşılan artefakt çoğu hafta başlıksız ve yarı sansürlü. | `hide-state.ts`, `title-visibility.ts`, `card-preview-view.tsx` (K1); P-01/P-02 (K4) |
| **Pazar kaçırıldı** | Pazartesi 00:00'dan sonra Hafta ekranı yalnızca yeni haftayı gösterir; geçen haftanın kartına **arayüzden yol yok** (yalnızca deep link). | Kart fiilen kaybolur. | `src/app/(main)/week.tsx` (yalnızca `getWeekStart(now)`), `router.push` taraması (K1); checklist K-07 hiç koşulmadı |
| **İlk ay (hafta 2-4)** | Eşik 3 → 4 (açıklanmadan). Hafta 2'den itibaren kıyas özeti canlanır. Kategori/seviye başına 3 satır varyantı; dengeli bir kullanıcı ayda aynı cümleleri döngüde görür. Geçmiş kart yok (bilinçli, v2). | Kıyas yeni bir kanca ekler; derinlik ve sürpriz azalır. | `copy.ts`, `titles.ts` `selectTitle`, YB-8 (K1/K4) |

**İlk değere ulaşma süresi:** kurulum gününe göre 2-8 gün; kurulum günü düzgün dağılımda **ortalama ~5 gün** (Pzt 6, Sal 5,
Çar 4, Per 3, Cum 2, Cmt 8, Paz 7 gün; ilk kart eşiği 3 gün, E4b). Cumartesi/Pazar kuran ilk Pazar'ı kaçırır.

### 1.3 Kritik gözlem: değerlendirilen yüzey ≠ değer yüzeyi

Batuhan'ın emülatörde gördüğü ve QA'nın incelediği görüntüler **Bugün, Hafta, Ayarlar**: ürünün en az değerli üç yardımcı
ekranı. Ürünün tek wow anı (kart açılışı) organik akışta ancak 3+ gün ve Pazar 20:00 sonra görülür; emülatörde yalnızca dev
zaman menüsüyle. Dolayısıyla "yetersiz" yargısının bir kısmı **aktivasyon katmanının kendisinin semptomudur**: ilk oturumda
getiri görünmüyor. Bu, H0 hipotezi olarak sınanmalı (bölüm 3), çünkü sonucu hangi katmana öncelik verileceğini değiştirir.

---

## 2. Teşhis tablosu

Şiddet: **Blokör** (deneme başlamadan kapanmalı) / **Yüksek** (birincil metriği doğrudan baskılar) / **Orta** / **Düşük**.
"Sahibi" = kanıtı üretecek veya işi yapacak ajan; kapsam kararı her zaman Batuhan'ın.

| # | Katman | Bulgu | Kanıt (K seviyesi) | Şiddet | Öneri | Sahibi | Başarı ölçütü |
|---|---|---|---|---|---|---|---|
| T0 | (meta) | Yargı, kartın hiç görülmediği 3 yardımcı ekrana dayanıyor. | Görev tanımı + QA görüntü listesi (K0) | — | Önce H0'ı koş (15 dk). | qa-engineer (dev menüyle hafta hazırlığı) + Batuhan | Kart akışını gördükten sonra yargının hangi katmana kaydığı yazılı. |
| T1 | Değer | **Ayna etkisi:** kart, kullanıcının zaten seçtiği 4x3 beyanın ortalamasını geri söyler; Wrapped'ın "bilmediğin bir şeyi öğrenme" sürprizi yok. Değer tamamen espri + unvan (kimlik) + hafta 2'den itibaren kıyasa dayanıyor. | `spec.md` Veri modeli, `buildCard.ts`, intent Wrapped analojisi (K1 + K0 çıkarım) | Yüksek (yapısal) | v1.1'de değer önermesini **değiştirme**; denemede ölç (H4). "Haftanın deseni" gibi içgörü satırı ayrı intent adayı. | product-researcher, support-specialist (G8 soruları) | G8 sorusu "unvan/satırlar ne kadar 'sen'": yanıtların >= yarısı "benzer/çok". |
| T2 | Değer / aktivasyon | İlk oturumda getiri görünmüyor: metin-yalnız onboarding, gri iskelet; ilk karta ortalama ~5 gün. | `welcome.tsx`, `locked-card-placeholder.tsx`, `week.ts` eşik (K1); o2/o3/w1 (K4) | Yüksek | Onboarding'de ve kilitli kutuda **"ÖRNEK" damgalı statik örnek kart** (uydurma içerik, kullanıcı verisi değil). | ui-ux-designer, visual-designer, copywriter → mobile-engineer | 5 kişilik ilk oturum testi: >= 4/5 "Pazar ne alacağım?" sorusunu doğru anlatır; D7 (deneme). |
| T3 | Deneyim | **Şablon görünümü:** Expo varsayılan teması (siyah/beyaz/gri), Expo yer tutucu ikon ve splash (`#208AEF`, `#E6F4FE`), sekme ikonları emoji, marka rengi yok; kart beyaz zemin + siyah metin. | `src/constants/theme.ts`, `app.json`, `(main)/_layout.tsx`, `CardView.tsx` stilleri, `s12-magaza-icerigi.md` ikon notu (K1); UX B13 (K4) | Yüksek (algılanan kalite) | Zaman kutulu **minimal görsel kimlik**: ikon + splash + tek marka rengi + kart zemini/tipografi hiyerarşisi + sekme vektör ikonları. Kart içinde seviyeye göre renk kodu YOK kuralı korunur. | visual-designer (+ ui-ux-designer) | Batuhan + 5 kişi "bitmiş ürün mü, prototip mi?": >= 4/5 "bitmiş". |
| T4 | Deneyim / alışkanlık | **Günlük tek eylem sessiz bitiyor:** Kaydet sonrası onay, ilerleme, ses/haptik yok; seçimler ekranda kalıyor, kaydedildiği anlaşılmıyor. | `today.tsx` `handleSave` (K1) | Yüksek (düşük efor) | Kaydet sonrası görünür onay + haftalık ilerleme ("Kaydedildi. Kartına 1 gün kaldı." tonu, nokta dolumu). Yeni bağımlılık yok. | engagement-designer, copywriter → mobile-engineer | K4 ekran görüntüsü; deneme D7 >= Batuhan'ın önceden yazdığı hedef (S8). |
| T5 | Deneyim | Wow anının sunumu yarım: reveal yalnızca opaklık geçişi (blur yok), haptik yok, kartın kendisi düz; "zarf açma" niyeti tasarımda var, uygulamada zayıf. Akıcılık hiç cihazda ölçülmedi. | `CardRevealView.tsx` başlık notu (K1); K-03 "EMÜLATÖRDE YAPILAMAZ" | Orta | T3 kapsamında kart düzeni + reveal koreografisi; **yeni native bağımlılık eklemeden** önce mevcut araçlarla. | visual-designer, ui-ux-designer | Gerçek cihazda (K5) 5 kişi: "bunun ekran görüntüsünü alır mıydın?" >= 3/5 evet. |
| T6 | Deneyim / içerik (veri anlamı) | **Uyku ekseni iki anlamlı:** emojiler (uykulu yüz / huzurlu yüz / uyuyan yüz) ve seviye adları "kötü/idare/iyi" **kaliteyi** ve bir yargıyı anlatıyor (tasarım ilkesi "iyi/kötü değil, yoğunluk" ile çelişir); kart satırları ise **miktarı** anlatıyor ("Yastığın bu hafta seni pek göremedi"). "Uyuyan yüz = iyi uyku" okunuşu belirsiz. | `src/constants/emoji.ts`, `docs/ux/emoji-seti.md`, `kart-yerlesimi.md` renk ilkesi, `tr.ts` sleep satırları (K1) | Orta (ama zamanlaması kritik) | Tek anlam seç (öneri: miktar) ve emoji + etiket + satırları hizala. **Denemeden önce yapılmalı**: deneme başladıktan sonra değişirse toplanan beyanların anlamı karışır (tek yönlü kapı). "Uyku" etiketi kararı (S12) yeniden açılmaz. | copywriter + ui-ux-designer | 5 kişi 12 emojiyi doğru seviyeye eşler >= %90. |
| T7 | İçerik | **İlk kartın son cümlesi bir yokluk bildirimi:** "Bu ilk kartın, önceki haftayla kıyas henüz yok." — her kullanıcının ilk wow anı bununla kapanıyor. | `tr.ts` `SUMMARY_VARIANTS.firstCard` (K1); k3/rv3 ekran görüntüsü (K4) | Yüksek (en düşük efor) | İlk kart özetlerini **geri dönüş vaadine** çevir (ör. "gelecek pazar kıyas da açılıyor" tonu): içerik boşluğu alışkanlık kancasına dönüşür. | copywriter | İçerik testleri (<= 60 karakter, rakamsız) yeşil + Batuhan onayı; G8'de ilk kart geri bildirimi. |
| T8 | İçerik | **En sık görülen kart büyük olasılıkla en sönük kart:** orta seviye satırlarının 4'ü "dengeli" kökünü tekrar ediyor; "dördü de orta" unvanı "Ne Az Ne Çok Ustası". Ortalama alınan 3'lü ölçekte orta bant en olası seviye (varsayım). | `tr.ts` (K1); seviye dağılımı K0 | Orta-Yüksek | data-analyst sentetik + deneme verisinden seviye dağılımını çıkarır; copywriter önce en sık 5 unvan ve orta seviye satırlarına yüklenir. | data-analyst → copywriter | Orta seviye 12 satırda tekrar eden kök sözcük <= 1; en sık 5 unvan Batuhan onaylı. |
| T9 | İçerik / alışkanlık (ilk ay) | Derinlik ilk ayı taşımayabilir: kategori x seviye başına 3 varyant; unvan tekrar-önleme yalnızca başka bir kural eşleşirse çalışıyor. Paylaşım yorgunluğu ölçülmemiş (intent OQ4). | `copy.ts` `pickFromPool`, `titles.ts` `selectTitle` (K1) | Orta | v1.1'de dokunma (T7/T8 önce); deneme G8 → G15 farkına göre karar. | copywriter, data-analyst | G8 → G15 arası paylaşım oranı düşüşü ve "1. mi 2. hafta kartı mı daha iyiydi" yanıtı. |
| T10 | Alışkanlık / akış (spec uyumu) | **Kaçırılan Pazar = kayıp kart.** Hafta ekranı yalnızca içinde bulunulan haftayı yükler; geçen haftanın uygun ama açılmamış kartına arayüzden yol yok. Spec: "açılabilir kalır, süre sınırı yok". Wow anı fiilen Pazar 20:00-23:59 penceresine sıkışıyor. | `week.tsx` (`getWeekStart(now)`), kart rotasına yalnızca `week.tsx` ve `today.tsx` push ediyor (K1); `spec.md` Hesaplama kuralları; checklist K-07 "ATLANDI" | Yüksek | Hafta ekranında "Geçen haftanın kartı seni bekliyor" girişi. **Kapsam genişletmesi değil**, spec'te yazılı davranışın eksik arayüzü. | mobile-engineer (+ ui-ux-designer metin) | K-07 emülatörde (K4) geçer; rapora "uygun hafta / açılan kart" (T15). |
| T11 | Alışkanlık / akış | **"Karnen hazır" bildirimi kartı açmıyor:** dokunma uygulamayı son ekranda açıyor. `ekran-akisi.md` ve `pazar-akisi.md` bildirimi reveal tetikleyicisi olarak tanımlıyor. QA "Düşük, ayrı intent" dedi; ürün görüşü: **wow anının birincil tetikleyicisi, belgelenmiş akışın eksik uygulaması**. | BLG-09 (K4); `src/` içinde bildirim yanıt dinleyicisi yok (K1); `ekran-akisi.md` Reveal adım 1, `pazar-akisi.md` akış | Yüksek | Bildirime dokunma → kart ekranı (gerekirse K3 ara ekranı). Girdi `weekStart` doğrulaması mevcut kalıpla (`week-param.ts`). Pazar bildirimi teslimi (B-06) ilk kez koşulur. | mobile-engineer; qa-engineer (B-06) | Bildirim → en fazla 1 dokunuşla reveal ya da ara ekran (K4); B-06 geçer. |
| T12 | Alışkanlık | Hafta içinde geri dönme nedeni yok: noktalar + gri iskelet; eşik dolunca Pazar'a kadar sabit "Kartın hazırlanıyor."; eşik 3 → 4 geçişi açıklanmıyor. | `week-status-copy.ts` (K1); YB-8 (K4) | Orta | v1.1'de yalnızca T4'ün ilerleme dili; seri sayacı ve hafta ortası "ön izleme" **ayrı intent** (utandırma ve sürprizi bozma riski). | engagement-designer | D7; hafta başına ortalama dolu gün (deneme). |
| T13 | Dağıtım (paylaşılan artefakt) | **Varsayılan paylaşımda unvan çoğunlukla `???`.** Uyku + harcama varsayılan gizli; unvanın `basedOnCategories`'i bunlardan birini içerirse unvan da `???`. Elle sayım: düzgün seviye dağılımında 81 kombinasyonun **en fazla 16'sında** unvan görünür (~%20; delta/ilk kart kuralları bu sayıyı yalnızca düşürür); kategori başına P(orta)=0,6 bağımsız varsayımında ~%40 görünür ve bunun ~1/3'ü "Ne Az Ne Çok Ustası". Ek olarak her kartta 4 satırın 2'si `???`. Ekip bunu mağaza görseli seçerken fark etmiş ("unvan uyku/harcamadan türemeyen bir kategoriden gelmeli"), ürün sorunu olarak kayda geçmemiş. | `hide-state.ts`, `title-visibility.ts`, `titles.ts` (K1 + elle hesap, **K2 değil**); P-02 (K4); `s12-magaza-icerigi.md` "Kart seçimi" maddesi | Yüksek | Gereksinim (nasıl değil ne): **varsayılan paylaşımda >= %90 durumda okunur bir unvan; gizlenen kategori ifşa edilmez (spec güvenlik 3 korunur); dondurulmuş kart değişmez.** Önce oranı K2 ile ölç; mekanizma seçenekleri S2'de. | data-analyst / test-automation-engineer (oran scripti) → software-architect + security-reviewer (mekanizma) → copywriter (yedek unvanlar) | K2: 81 kombinasyon x varsayılan gizleme için görünür unvan oranı çıktısı; hedef >= %90. |
| T14 | Dağıtım | **Kart yer tutucu damga basıyor:** "Haftik · [mağaza bağlantısı]"; paylaşım metni hedef uygulamaya taşınmıyor (`expo-sharing` ayrı mesaj taşımaz); damga 11 px, %65 opak. Kartı gören birinin uygulamayı bulma yolu yok. | `src/config/constants.ts` (K1); K-05 (K4); `CLAUDE.md` MOB/S7b notu | **Blokör** (herhangi bir gerçek paylaşımdan önce) | K5 kararı (S3); APK denemesi için en azından temiz ad + (seçilirse) kısa alan adı. Denemenin viral döngüyü değil **paylaşım niyetini** ölçtüğü protokole yazılır. | growth-strategist + Batuhan (K5) | Paylaşılan PNG'de köşeli parantezli metin 0 (K4); damga telefon ekran görüntüsünde okunur. |
| T15 | Ölçüm bağı | Rapor kümülatif, haftalık kırılım yok; kartı hak edip hiç açmayan haftalar sayılmıyor (`card_unlocked` yalnızca Hafta ekranı görülünce yazılıyor); D7 için hedef yok. | `src/metrics/report.ts`, `week.tsx` (K1); `s12-magaza-icerigi.md` "Haftalık kırılım" | Orta | Rapora yerel tablolardan türetilen "uygun hafta sayısı / açılan kart sayısı" (yeni olay adı gerekmez); D7 hedefi sonuçtan önce yazılır (S8). | data-analyst | Deneme protokolü yazılı; rapor T10/T11'in etkisini ayırt edebiliyor. |
| T16 | Deneyim (bilinen, karar bekleyen) | Koyu modda tema dışı sabit renkler (B14). | `CLAUDE.md` B14 (K1) | Düşük | Açık temaya kilit (S6). | mobile-engineer | Koyu mod cihazında üç ekran (K4). |

**Katman özeti:** Değer: T1, T2 · Deneyim: T3, T4, T5, T6, T16 · İçerik: T7, T8, T9 · Alışkanlık/akış: T10, T11, T12 ·
Dağıtım: T13, T14 · Ölçüm: T15. "Özellik ekleyelim" çaresi bunların hiçbirinin birincil çaresi değil.

---

## 3. Sınanabilir hipotezler

Sıralama "kanıt bekleyen" ile "karar bekleyen" ayrımına göre (bölüm 4.3). Her hipotezde geçme/kalma çizgisi **önceden** yazılır.

| # | Hipotez | Nasıl sınanır | Kim kanıtlar | Geçer / kalır |
|---|---|---|---|---|
| **H0** | "Yetersiz" yargısının ana kaynağı kartın görülmemiş olması (aktivasyon), ürünün kendisi değil. | Dev menüyle 4 dolu günlük bir hafta hazırlanır; Batuhan reveal → önizleme → paylaşım akışını baştan sona yaşar; aynı soru tekrar sorulur: "hâlâ yetersiz mi, neresi?" | qa-engineer (hazırlık), Batuhan | Yargı yumuşarsa T2/T10/T11 öne; aynı kalırsa T1/T3/T8 (değer/içerik/görsel) öne. Her iki sonuç da v1.1 listesini değil **sırasını** değiştirir. |
| **H1** | Paylaşılan kartta unvanın görünür olması paylaşım niyetinin ana belirleyicisi. | (a) K2 scripti: varsayılan gizlemede görünür unvan oranı; (b) 5 kişiye aynı haftanın iki PNG'si (unvanlı / `???` unvanlı): "Story'ne koyar mıydın?" | data-analyst, growth-strategist | (a) oran < %50 ise T13 Yüksek kalır; (b) >= 3/5 unvanlıyı seçerse mekanizma v1.1'e girer. |
| **H2** | Kartı hak eden haftaların anlamlı bir kısmı, yol kırık olduğu için açılmadan kaybediliyor. | T15'teki "uygun hafta / açılan kart" oranı denemede; T10/T11 kapandıktan sonraki haftalarla karşılaştırma. | data-analyst | Uygun haftaların > %15'i açılmıyorsa akış sorunu ürün sorunu gibi okunuyor demektir; deneme yorumuna not düşülür. |
| **H3** | Kaydet sonrası görünür ilerleme D7'yi korur. (20-30 kişide A/B yapılamaz; yönsel sinyal.) | D7 mutlak değeri, Batuhan'ın önceden yazdığı hedefle; G9-G12 sohbetinde "kaydettiğini anladın mı?" | engagement-designer, support-specialist | D7 hedefin altındaysa alışkanlık katmanı ayrı intent'e (seri/ara ödül) aday olur. |
| **H4** | Kullanıcı kartı "beni anlatıyor" diye okuyor, "zaten bildiğim şey" diye değil (T1 ayna riski). | G8 mesajındaki üç soru + 5 kısa görüşme; "hangi satır seni güldürdü" sorusu. | product-researcher, support-specialist | Yarıdan fazlası "zaten biliyordum / sıradan" derse değer katmanı yeniden açılır (ayrı intent: içgörü satırı). |
| **H5** | Şablon görünümü algılanan kaliteyi düşürüyor; minimal görsel kimlik bunu kapatıyor. | Öncesi/sonrası ekran görüntüleriyle 5 kişi: "bitmiş ürün mü, prototip mi?" | visual-designer | Sonrasında >= 4/5 "bitmiş" değilse görsel iş zaman kutusu aşılmaz, içerik (T8) öne alınır. |

---

## 4. v1.1 dar iyileştirme paketi (öneri)

### 4.1 Kapsam bütçesi ve kurallar

- **Bütçe:** denemeden önce toplam efor tavanı **~5-7 iş günü** (göreli boyut ürün görüşüdür; süre tahmini software-architect
  doğrular). Tavan aşılırsa P8, sonra P7'nin ikon dışı kısmı ilk düşer.
- **Kural:** her madde hangi metriği hareket ettireceğini söyler; denemede o metrik hareket etmezse madde bir sonraki turda
  geri alınır veya sadeleştirilir.
- **Gizlilik sözü kontrolü:** aşağıdaki maddelerin hiçbiri ağ çağrısı, hesap, analitik SDK'sı veya yeni veri toplama getirmez;
  örnek kart statik uydurma metindir; unvan mekanizması cihazda çalışır. Yeni bağımlılık beklenmiyor (haptik/blur bilerek dışarıda).
- **Ne değildir:** yeni kategori, yeni ekran ailesi, yeni veri kaynağı değildir. Çoğu, spec'in zaten istediği davranışın
  tamamlanması veya mevcut ekranın cilasıdır.

### 4.2 Girer (öncelik sırasıyla)

| # | Madde | Katman / tablo | Tür | Göreli efor | Hareket ettireceği metrik | Neden bu sırada |
|---|---|---|---|---|---|---|
| P1 | Damga ve bağlantı temizliği (K5 kararına göre) | Dağıtım / T14 | Karar bekleyen, yayın kapısı | Küçük | Paylaşılan PNG'nin "bitmiş" görünmesi; ileride edinme | Blokör: köşeli parantezli bir kart bir kez paylaşılırsa geri alınamaz (kamuya açık artefakt). |
| P2 | "Karnen hazır" bildirimi → kart ekranı | Akış / T11 | Karar bekleyen (belgelenmiş akış) | Küçük-orta | Kart açan / kartı hak eden (H2) | Wow anının birincil tetikleyicisi. |
| P3 | Geçen haftanın açılmamış kartına Hafta ekranından yol | Akış / T10 | Karar bekleyen (spec uyumu) | Küçük-orta | Kart açan / kartı hak eden (H2) | Spec zaten istiyor; kapatmamanın gerekçesi yok. |
| P4 | Varsayılan paylaşımda okunur unvan (mekanizma S2'deki seçimle) | Dağıtım / T13 | **Kanıt bekleyen** (önce K2 oranı, H1) | Orta | Paylaşım oranı (birincil ölçüt) | Birincil metriğe en doğrudan etki; ama veri şeması dokunabilir, bu yüzden önce ölçüm, sonra architect + security incelemesi. |
| P5 | İçerik geçişi: ilk kart özetleri (T7), orta seviye satırlar + en sık 5 unvan (T8) | İçerik | Karar bekleyen (T7), kanıt destekli (T8) | Küçük | Paylaşım oranı; G8 "ne kadar sen" | Yalnızca `tr.ts`; en iyi etki/efor oranı. Mevcut testler (<= 60 karakter, rakamsız, 81/81) korunur. |
| P6 | Uyku ekseni netleştirmesi (emoji/etiket/satır hizası) | Deneyim-içerik / T6 | Karar bekleyen (S7) | Küçük | Beyan doğruluğu (dolaylı: kart isabeti) | Deneme başladıktan sonra değişirse veri anlamı karışır: tek yönlü kapıya dönüşmeden yap. |
| P7 | Kaydet sonrası onay + haftalık ilerleme dili; açık temaya kilit (B14) | Deneyim-alışkanlık / T4, T12, T16 | Karar bekleyen | Küçük | D7 (H3) | Günlük döngünün tek anı; "kaydedildi mi?" belirsizliği bir güven sorunu. |
| P8 | Minimal görsel kimlik: ikon, splash, tek marka rengi, kart zemini/tipografi, sekme vektör ikonları | Deneyim / T3, T5 | Kanıt destekli (H5), zaman kutulu | Orta | Algılanan kalite (H5); paylaşım oranı (dolaylı) | İkon zaten yayın için gerekli (şu an Expo yer tutucusu); geri kalanı zaman kutusuyla. |
| P9 | "ÖRNEK" damgalı örnek kart (onboarding + kilitli kutu) | Değer-aktivasyon / T2 | **Kanıt bekleyen** (H0 + 5 kişilik test) | Küçük-orta | D7, ilk oturum anlaşılırlığı | H0 "aktivasyon" derse girer; demezse ertelenir. |
| P10 | Ölçüm: rapora "uygun hafta / açılan kart"; D7 hedefinin yazılması | Ölçüm / T15 | Karar bekleyen | Küçük | (ölçüm) H2, H3'ü ayırt edebilmek | Deneme bir kez yapılır; neyin işe yaradığını ayıramayan bir deneme boşa gider. |

### 4.3 Kanıt bekleyen / karar bekleyen ayrımı

- **Karar bekleyen (deneme gerekmez, doğrudan yapılır):** P1, P2, P3, P5 (T7 kısmı), P6, P7, P10. Gerekçe: ya spec'te yazılı
  davranışın eksik uygulaması (P2, P3), ya yayın kapısı (P1), ya da doğru yönü belli, geri alınabilir küçük cila.
- **Kanıt bekleyen (önce ölç/dene):** P4 (K2 oranı + H1), P8'in ikon dışı kısmı (H5), P9 (H0 + 5 kişi), P5'in T8 kısmı
  (seviye dağılımı). Bu dördünün kanıtı 1-2 günde toplanabilir; denemeyi geciktirmemeli.

### 4.4 Bilerek girmez (v1.1'de)

| Madde | Neden şimdi değil |
|---|---|
| Geçmiş kartlar galerisi | Spec "Dahil değil"; alışkanlık sorunu galeri yokluğundan değil, hafta içi sessizlikten. → ayrı intent adayı. |
| Seri (streak) sayacı, hafta ortası kart "ön izlemesi" | Utandırma ("serin bozuldu") ve wow sürprizini bozma riski; H3 sonucu beklenir. → ayrı intent (engagement-designer). |
| "Haftanın deseni" gibi içgörü satırı (ör. en hareketli gün) | T1'e en güçlü çare adayı ama yeni içerik türü + kartta tarih/gün bilgisinin gizlilik değerlendirmesi gerekir. → ayrı intent (product-researcher + security-reviewer). |
| Yeni kategori (ruh hali), otomatik veri (Health Connect/HealthKit) | Spec "Dahil değil"; gizlilik sözü ve Health apps beyanı etkisi. |
| Gerçek blur (`expo-blur`), konfeti, ses, haptik kütüphanesi | Yeni native bağımlılık; T5 önce mevcut araçlarla denenir. |
| Instagram Story doğrudan paylaşım | Spec "Dahil değil"; kırılgan, ek kayıt ister. |
| Koyu mod cilası | Açık temaya kilit (P7) yeterli; kart zaten beyaz. |
| Hatırlatma saatlerini 20:00-23:00 dışına genişletme | Kanıt yok; talep gelirse değerlendirilir. |
| iOS (S11), BLG-10/11 (rozet izinleri, bildirim simgesi) | Mevcut plan kapılarında (K9, release manifest işi); bu teşhisle ilgisiz. Bildirim simgesi P8'in ikon işine eklenebilir. |
| Arkadaş karşılaştırma, hesap, OTA, analitik SDK | Spec ve intent kısıtları; tartışma dışı. |

### 4.5 Ayrı `intent.md` adayları (kapsam genişletmesi, Batuhan onayı olmadan açılmaz)

1. **Alışkanlık katmanı:** seri / hafta ortası ara ödül (H3 kalırsa).
2. **Değer katmanı:** "haftanın deseni" içgörü satırı (H4 kalırsa).
3. **Geçmiş kartlar galerisi** (deneme sonrası, yalnızca paylaşım yorgunluğu verisi olursa).

---

## 5. Batuhan'a sorular (seçenek + öneri)

**S1 — Sıra: v1.1 denemeden önce mi?**
(a) Önce v1.1 (P1-P10, ~5-7 gün), sonra gerçek cihaz turu, sonra APK denemesi. (b) Deneme hemen, v1.1 paralel ve hafta 2'den
itibaren. (c) Deneme hemen, değişiklik yok.
**Öneri: (a).** Arkadaş çevresi tek atımlık bir havuz: aynı 20-30 kişi ikinci kez "ilk kez" deneyemez. Bilinen üç paylaşım
baskılayıcısıyla (T13, T14, T11) ölçülen %25 sonucu "ürün tutmadı" diye okunur ama aslında "yol kırıktı" demektir.
Yanlışsa maliyet: ~1 hafta gecikme.

**S2 — Varsayılan paylaşımda unvan (T13) nasıl kurtarılsın?**
(a) Kart üretilirken, yalnızca varsayılan açık kategorilerden (hareket, sosyal) veya kategoriden bağımsız kurallardan türeyen
ikinci bir "paylaşım unvanı" da dondurulur; asıl unvan gizlenince o görünür. (b) Varsayılan gizliyi yalnızca harcama yap.
(c) `???` yerine esprili sabit bir başlık ("Gizli unvan" tonu). (d) Değiştirme.
**Öneri: önce K2 oranı; oran < %50 çıkarsa (a).** (a) güvenlik gereksinimi 3'ü ("unvan gizlenen kategoriden türetilmez")
korur, dondurma garantisini korur; ama `weekly_card`'a ek alan anlamına gelebilir, bu yüzden software-architect ve
security-reviewer incelemesi şart. (b) gizlilik sözünü değiştirir, önermiyorum. (c) en ucuz ama kancayı geri getirmez.

**S3 — Damga ve bağlantı (K5), APK denemesi için:**
(a) "Haftik" + kısa alan adı (statik `site/` sayfası; statik sayfa uygulamanın ağ çağrısı yapmadığı sözünü bozmaz).
(b) Yalnızca "Haftik". (c) Yer tutucu kalsın.
**Öneri: (a), alan adı yoksa (b).** (c) kabul edilemez: kamuya açık bir görselde yer tutucu kalıcı olur.

**S4 — Örnek kart (P9) onboarding'e girsin mi?**
(a) Evet, "ÖRNEK" damgalı, uydurma içerikle. (b) Hayır.
**Öneri: H0 sonucuna bağlı olarak (a).** Risk: kullanıcının örneği kendi kartı sanması (damga ile kapatılır) ve ilk gerçek
kartın sürprizini azaltması (örnek farklı bir unvan/ton kullanır).

**S5 — Görsel kimlik bütçesi (P8):**
(a) Minimal paket, zaman kutulu (~1-2 gün). (b) Tam görsel yeniden tasarım (ayrı intent). (c) Yalnızca ikon.
**Öneri: (a).** Şablon görünüm Batuhan'ın ilk izleniminin en görünür parçası ve ikon zaten yayın için zorunlu.

**S6 — B14 koyu mod:** (a) v1'de açık temaya kilit. (b) Renkleri temadan türet. **Öneri: (a)**; kart zaten beyaz, iş küçük.

**S7 — Uyku ekseni (P6):** (a) Miktar ("az/orta/çok"). (b) Kalite ("kötü/idare/iyi", bugünkü etiketler). **Öneri: (a):**
satırlar zaten miktarı anlatıyor ve "iyi/kötü değil, yoğunluk" ilkesiyle uyumlu. "Uyku" etiketi kararı (S12) yeniden açılmaz.
Emoji seçimi copywriter + ui-ux-designer'ın; Health apps beyanıyla tutarlılık security-reviewer'a sorulur.

**S8 — D7 hedefi (sonuçtan önce yazılmalı):** Intent hedef koymadı; `s12-magaza-icerigi.md` de koymadı. **Öneri (K0, kıyas
verisi yok): >= %40**, ya da senin seçeceğin bir sayı, deneme başlamadan `plan.md`'ye yazılı. Sonradan konan hedef ölçümü anlamsızlaştırır.

---

## 6. Varsayımlar, geri dönüş yolu, yanlış çıkarsa maliyet

| Karar/öneri | Varsayım | Geri dönüş | Yanlış çıkarsa maliyet |
|---|---|---|---|
| v1.1 denemeden önce (S1) | Bilinen baskılayıcılar paylaşımı anlamlı biçimde düşürüyor. | Tam: deneme istenen an başlatılabilir. | ~1 hafta gecikme; öğrenme hızı biraz düşer. |
| Unvan mekanizması (P4) | Unvan kartın ana kancası (intent'in "kişiye özel unvan" vurgusu, `icerik-inceleme.md` "asıl hook"). | Kısmi: ek alan eklemek kolay, sonra yok saymak kolay; yazılmış veri kalır (şemaya dokunduğu için yavaş düşün). | 1-2 gün efor + migration/test; eski kartlar etkilenmez. |
| Örnek kart (P9) | Getiriyi erken göstermek aktivasyonu artırır. | Tam. | Küçük efor; olası "sürpriz kaybı". |
| Uyku ekseni denemeden önce (P6) | Belirsiz emoji beyanı bozuyor. | Deneme başlayana kadar tam; sonra tek yönlü. | Küçük metin işi. |
| Görsel kimlik (P8) | Şablon görünüm algılanan kaliteyi düşürüyor. | Tam. | Zaman kutusu aşılırsa asıl işlerden (P4/P5) zaman çalar; bu yüzden en sona kondu. |
| Ayna etkisine (T1) v1.1'de dokunmamak | Değer sorunu varsa bile ancak deneme gösterir; önce bilinen kusurlar kapatılmalı. | Tam. | Deneme sonunda değer katmanı çıkarsa bir döngü (4 hafta) kaybedilmiş olur; bunu H4 soruları erken (G8) yakalar. |
| T13 oranı | Elle sayım doğru; seviyeler bağımsız. | — | Oran daha yüksek çıkarsa P4 küçülür veya düşer; bu yüzden P4 "kanıt bekleyen". |

**Pre-mortem — "3 ay sonra kimse kullanmıyorsa neden?"**
1. İlk kart geldi ama paylaşmaya değmedi: başlık `???`, iki satır `???`, beyaz şablon kart, son cümle "kıyas yok". → P1, P4, P5, P8 kapatır.
2. İnsanlar ilk Pazar'ı kaçırdı ya da bildirim kartı açmadı; kart gitti. → P2, P3 kapatır. **Bugün kapatılabilecek en ucuzu bu:** spec zaten istiyor.
3. İkinci haftadan sonra sürpriz kalmadı (ayna etkisi), ritüel söndü. → v1.1 kapatamaz; H4 erken uyarır; çare ayrı intent.

---

## 7. Bilinmeyenler / doğrulanamayanlar

1. **Ekran görüntüleri açılamadı:** `C:\Users\Pc\AppData\Local\Temp\claude\...\images\` ve `%TEMP%\qa3\` klasörleri bu ortamda yok
   (Glob/Read "does not exist"). Ekran yargıları koddan (K1) ve QA'nın K4 kayıtlarından (`emulator-*.md`) çıkarıldı; görüntülerle
   karşılaştırılmadı.
2. **Batuhan'ın "yetersiz" dediği somut noktalar yazılı değil** (K0). H0 bu yüzden ilk adım; mümkünse Batuhan 3 cümleyle "neyi
   yetersiz buldum" yazmalı.
3. **T13 oranı elle hesaplandı**, kodla koşturulmadı (K1). Delta ve ilk kart kuralları hesaba katılmadı (görünür oranı yalnızca
   düşürürler). Gerçek seviye dağılımı bilinmiyor.
4. **Gerçek cihazda hiçbir değer anı doğrulanmadı (K5 yok):** reveal akıcılığı (K-03), paylaşım hedeflerinde görünüm ve mesaj
   taşınması (P-04/P-05), Pazar bildiriminin teslimi (B-06 hiç koşulmadı), OEM pil davranışı, 8 sn kronometresi (C-04).
5. **Talep kanıtı hâlâ zayıf** (intent OQ2) ve haftalık paylaşım yorgunluğu ölçülmemiş (OQ4); bu belge ikisini de çözmez.
6. **Örneklem 20-30 kişi:** %25 eşiği "güçlü sinyal" (E1); H1-H5'in çoğu yönsel sinyal üretir, istatistiksel kanıt değil.
7. **Efor tahminleri göreli** (ürün görüşü); süre ve teknik uygulanabilirlik software-architect'in.
8. iOS tarafı (K9) ve KVKK görüşü (K10) bu teşhisin dışında; S12 kapıları geçerliliğini korur.

---

## 8. Devir

```
Durum:        bitti (teşhis); karar bekleyen maddeler Batuhan'da
Yapıldı:      - 16 satırlık katman teşhisi (bölüm 2), 6 hipotez (bölüm 3), 10 maddelik v1.1 önerisi + bütçe (bölüm 4)
              - Yeni bulgular: T13 unvan `???` oranı (titles.ts + hide-state.ts), T10 kaçırılan Pazar yolu yok
                (week.tsx), T11'in önceliğinin yükseltilmesi (BLG-09), T7 ilk kart özeti, T4 Kaydet sessizliği, T6 uyku ekseni
Kanıt:        K1 (kaynak okuma) + QA K4 kayıtları; kullanıcı davranışı K0 (n=1); T13 oranı elle hesap
Açık / risk:  ekran görüntüleri açılamadı; gerçek cihaz yok; seviye dağılımı bilinmiyor; efor tahmini architect'te
Karar gerek:  S1 (sıra), S2 (unvan mekanizması), S3 (damga/K5), S4 (örnek kart), S5 (görsel bütçe), S6 (B14), S7 (uyku ekseni),
              S8 (D7 hedefi)
Sonraki:      qa-engineer: H0 hazırlığı (dev menüyle 4 günlük hafta)
              data-analyst / test-automation-engineer: T13 oran scripti (K2), T15 rapor alanları
              software-architect + security-reviewer: P4 mekanizma ve efor (S2 kararından sonra)
              copywriter: P5, P6 taslağı; visual-designer: P8 zaman kutulu brief
              project-coordinator: Batuhan kararlarından sonra v1.1 sıralaması ve deneme takvimi
```

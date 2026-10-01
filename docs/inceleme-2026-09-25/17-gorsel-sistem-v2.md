# 17 — Görsel sistem v2: "Çıkartma albümü" (C), yetişkin sürüm (visual-designer, Staff)

> 2026-09-29. Kod, `assets/`, `app.json`, testler değişmedi; commit yok. Emülatöre dokunulmadı.
> Prototipler: `14-gorsel-prototipler/v2/index.html` (galeri). Kanıt seviyeleri K0-K5 (`ortak-standartlar.md`).
> Girdi: 16 (brif), 10, 14, 15, 11, 18 (UX v2), 19 (metin v2), 21 §2b (render tekniği), 22 taslakları (platform).

## 0. Özet

- **Fikir (tek cümle):** *"Haftan, derin mor bir albüm sayfasına yapıştırılmış kesim çıkartmalar."* Sıfatlar: esprili · derli toplu ·
  elle yapılmış · yargısız · sakin. Görsel oyuncu, yazı kuru (19 §1): yetişkin mizahı bu zıtlıktan çıkıyor.
- **Çocuksu riskin çözümü sekiz değişiklik:** elektrik moru yerine derin albüm moru (#3D2E7C). Siyah kalın kontur yerine beyaz
  kesim kenarı (gerçek die-cut çıkartma). Baloo 2 yerine Fraunces + Inter. Patlama rozeti ve pırıltılar yerine tek yuvarlak mühür.
  Yalnız iki eğik öğe (unvan −1,5°, mühür +8°). Sert gölge 3 px ve ton-içi (derin mor). Dört kategori tonu eşit parlaklıkta.
  Puan gibi okunan noktalar yerine konum işareti + kelime. Karşılaştırma tablosu `v2/index.html` başında.
- **Kategori tonları:** nane / lavanta / kayısı / gül. Göreli parlaklık 0,66–0,73 (eşit ağırlık), yalnız emoji diskinde kullanılıyor,
  seviyeyle değişmiyor. Gizli satır tonsuz; unvan çıkartması her zaman sarı. Metin kontrastları 5,39–17,97:1 (K1). Hepsi ≥ 4,5.
- **Seviye:** üç alternatif prototiplendi (konum / katman / boy). **Öneri L1 konum işareti.** L2 katman, albüm metaforunda
  "daha çok çıkartma = daha iyi koleksiyon" okunuyor ve puan riskini geri getiriyor.
- **Teslim edilenler:** kart v2 (4 durum + ÖRNEK + Story + 1:1 + %25/%50), Bugün (4 durum), Hafta (kilitli/yolda/açılabilir/açıldı + Albüm),
  1,4 sn "yapışma" reveal'ı (canlı + kareler), koyu tema, ikon 3 finali (1024, adaptive ön/arka, monochrome, splash, bildirim),
  Play tanıtım görseli ve 5 ekran görüntüsü şablonu.
- **Teknik uyum (21 §2b):** `react-native-svg` ve `expo-linear-gradient` **gerekmiyor**. Zemin, mühür, doku ve köşe kıvrımı
  PNG @4x. Sert gölge ofsetli `View`. `elevation`/`boxShadow` yok. R1 yakalama sarmalayıcısı var. **Tek sapma:** 21 Baloo 2
  varsayıyordu, ben Fraunces öneriyorum (§4 çelişki 1).
- **Önerdiğim yön:** C kararı değişmeden, **"C-yetişkin" = albüm dili + editoryal tipografi + tek imza (sarı unvan çıkartması
  ve mühür)**. Nedeni: çocuksu algı çıkartma fikrinden gelmiyordu. Kaynağı üç yüzey sinyaliydi (neon renk, karikatür kontur,
  yuvarlak font) ve üçü de fikre dokunmadan değişebiliyor.

## 1. Bu alandaki durum: profesyonel görünümü engelleyenler (öncelikli)

| # | Bulgu | Kanıt | Öncelik |
|---|---|---|---|
| P1 | Uygulamanın kendi rengi, fontu ve ikonu yok. `theme.ts` Expo şablonu; ikon/splash Expo'nun (`app.json:7,16-19,39`: `#E6F4FE`, `#208AEF`); iOS `assets/expo.icon` | 10 G1-G2 (K1), `app.json` okundu | Blokör (mağaza) |
| P2 | Kart beyaz bir Word belgesi gibi duruyor, imzası yok. `???` gizli durumu hata gibi okunuyor | 10 G5-G6 (K4) | Yüksek |
| P3 | C v1 prototipi çocuksu: #6D4AFF neon, 2,5 px siyah kontur, Baloo 2, pembe patlama, pırıltılar, 4 eğik öğe | `kart-c-cikartma-albumu.html` (K1), 14 README risk notu, Batuhan "amatör" geri bildirimi | Yüksek |
| P4 | Seviye noktaları (1-3) puan gibi okunuyor; uyku "kötü/iyi" yargı taşıyor | 18 §2.3, 19 §3.1, `emoji.ts:37-39` (K1) | Yüksek |
| P5 | Hafta ekranındaki gri iskelet + kilit "yükleniyor" gibi duruyor; ödül hissi yok | 10 G4 (K4) | Orta |
| P6 | Kaydet'e basınca geri bildirim yok; günlük tek eylemin ödülü yok | 10 G3, 09 #9 (K4) | Orta |
| P7 | Sabit renkler (`#D7263D`, `#D1D1D6`, `#8E8E93`); koyu modda parlak kutu (B14) ve 4,03:1 silme kontrastı (A11Y-05) | CLAUDE.md B14, 11 (K1/K4) | Orta |
| P8 | Sekme ikonları emoji; içerik ve gezinme aynı görsel katmanda | 10 G8 (K1) | Düşük |
| P9 | Mağaza grafiği yok; ekran görüntüleri için şablon yok | 10 §7 (K0) | Yayın öncesi |

## 2. Öneriler: görsel sistem v2

### 2.1 Tek fikir, sıfatlar, "çocuksu → yetişkin" kuralları

Yeni bir karar gerektiğinde şu kurallar uygulanır:
- **Gerçek nesne dili:** çıkartma = beyaz kesim kenarı + sert, ton-içi gölge. Karikatür konturu kullanılmaz.
- **Tek imza:** sarı unvan çıkartması + yuvarlak mühür. Başka süs eklenmez: pırıltı, konfeti, ünlem rozeti, ikinci vurgu rengi yok.
- **Eğim bütçesi:** en fazla iki eğik öğe. İçerikte ≤ ±1,5° (18 §2.9). Mühür dekoratif istisna (+8°).
- **Kabuk düz:** düğme, sekme, segment ve kutu eğik değil ve sert gölgesiz. Albüm dili kabukta üç küçük izle taşınır:
  ton diski, Fraunces başlık, sarı rozet.
- **Yazı kuru:** ünlem tek ("Kartın hazır!"), "Yaşasın" tonu yok (19).
- **Pre-mortem:** "Bir yıl sonra neden eskir?" En olası cevap: "çıkartma estetiği trend". Önlem: fikir nesnenin kendisi
  (albüm, kesim kenarı, mühür). Holografik, 3D ve gradyan trend efektleri kullanılmıyor.

### 2.2 Token tablosu ve kontrast (`src/constants/tokens.ts`'e birebir taşınır)

**Kart (tema bağımsız):** `album #3D2E7C` · `albumDeep #211850` (sert gölge) · `ink #17131F` · `paper #FFFDF8` ·
`sun #FFD84D` · `liner #E7E4EE` (arka kâğıt) · `muted #5E5870` · `onAlbum #EDE8FF` · `albumScreen #2F2463` (kart ekranı zemini).

**Kabuk:**

| Token | Açık | Koyu | Kullanım |
|---|---|---|---|
| `bg` | #F5F2EC | #17131F | Ekran zemini |
| `surface` | #FFFDF8 | #231D33 | Kutu, sekme, segment |
| `text` | #17131F | #F3EFFA | Metin |
| `muted` | #5E5870 | #B3ABC6 | İkincil metin |
| `accent` | #3D2E7C | #B7A8FF | Seçili çerçeve, Kaydet, aktif sekme |
| `onAccent` | #FFFDF8 | #17131F | Kaydet metni |
| `selFill` | #EAE5F7 | #3A2F63 | Seçili kutu, sekme hapı |
| `disBg` | #E7E4EE | #2C2540 | Pasif Kaydet |
| `line` | #DDD6E4 | #3A3350 | Dekoratif kenar |
| `danger` | #B42318 | #FF8A80 | Yalnız silme (A11Y-05'i kapatır) |
| `banner` | #FFF1B8 | #2E2744 + 4 dp `sun` şerit | K3 bandı |

**Kontrast (WCAG 2.x, elle hesap K1; `ton-sistemi.html` aynı değerleri canlı hesaplar):**
- Kart: ink/paper **17,97** · ink/sun **13,21** · ink/liner **14,56** · muted/liner **5,39** · muted/paper **6,65** ·
  paper/album **10,99** · onAlbum/album **9,35** (nokta dokusunun en açık pikselinde ≈9,0).
- Açık kabuk: ink/bg **16,35** · muted/bg **6,05** · accent/bg **10,00** (UI ≥3) · Kaydet paper/album **10,99** ·
  pasif Kaydet muted/disBg **5,39** · ink/selFill **14,83** · danger/bg **5,88**.
- Koyu kabuk: text/bg **16,13** · text/surface **14,32** · muted/surface **7,38** · accent/surface **7,77** ·
  ink/accent **8,75** · text/selFill **10,49** · muted/disBg **6,61** · danger/surface **7,10**.

**Boşluk:** 4'lük ızgara (4·8·12·16·24·32·48); ekran kenarı 24. **Yarıçap:** çip 8 · kutu/düğme 14-16 · çıkartma 14/18 · tam.
**Gölge:** kabukta yok. Kartta yalnız sert ofset: satır/balon (0, 3), unvan (3, 4) + 3 px kesim kenarı. Hepsi `albumDeep`.

### 2.3 Kategori tonları ve gizli kategori kuralı

| Kategori | Ton | Göreli parlaklık | ink üstünde |
|---|---|---|---|
| Hareket | nane #BFE8D2 | 0,734 | 13,65 |
| Uyku | lavanta #D6CEFF | 0,657 | 12,30 |
| Harcama | kayısı #FFD4B3 | 0,716 | 13,33 |
| Sosyal | gül #FFCADB | 0,686 | 12,81 |

- Ton **yalnız emoji diskinde** kullanılır: kartta 40 px disk, Bugün'de kutu içi disk ve başlıktaki 10 px nokta. Metin, çerçeve ve
  satır tonlanmaz (18 §2.9-3). Seviye 1-2-3'te ton aynı kalır. Kırmızı, onay yeşili ve alarm turuncusu yok.
- Gri tonlamada dört ton neredeyse aynı griye düşüyor. **Bu bilinçli:** kategori etiket ve emojiyle tanınır, ton ikinci ipucu.
  Renk körlüğü simülasyonu sayfada var (yaklaşık matrisler, ölçüm değil).
- **Sızmama kuralları** (7 madde, `ton-sistemi.html` §4):
  1. Gizli satır tonsuzdur: boş kesik disk ve nötr `liner` zemin.
  2. Gizli satırda emoji, seviye kelimesi ve seviye işareti render ağacına girmez.
  3. Gizli satırda tek sabit metin var: "Gizli çıkartma". Satır yüksekliği sabit 56.
  4. Unvan çıkartmasının rengi `basedOnCategories`'e bağlı değil.
  5. Zemin, balon, mühür ve bant hiçbir veriye bağlı değil.
  6. Kategori etiketi gizli satırda kalır (19 §3.6 ile aynı karar).
  7. Kare varyant ve seçici önizlemesi aynı kuralları uygular.
- **Test önerisi (K2):** gizli satır alt ağacında `tone.*` ve `LevelMark` bulunmamalı. Dört gizli satırın render ağacı,
  kategori etiketi dışında birebir eşit olmalı.

### 2.4 Seviye gösterimi (3 alternatif, `seviye.html`)

| | L1 Konum işareti (**öneri**) | L2 Çıkartma katmanı | L3 Rozet boyu |
|---|---|---|---|
| Görünüm | 40×12 ince cetvel, üç tık noktası, 12 px mürekkep düğme sol/orta/sağda | Diskin arkasında 1-3 kat | Disk 30/36/42 |
| Ne okunur | Yelpazede yer | Miktar yığını | Önem |
| Puan riski | Düşük; "orta = ideal" riski ölçülmeli | **Yüksek** (albüm = koleksiyon) | Orta-yüksek |
| %50'de | Okunur | Okunur | Zayıf |

- Üçünde de kelime birincil: "durgun / hafif / yoğun", uyku "kısa / orta / uzun", sosyal "sakin / orta / kalabalık" (19 §3.1).
  İşaret `importantForAccessibility="no"`, bilgi kelimede. Bugün ekranında işaret yok, kutu içindeki kelime yeterli.
- %25'te (WhatsApp) işaret de kelime de okunmuyor. Bu kabul edilebilir: o boyutta kart unvanı ve markayı taşır. Gizlilik açısından
  da zararsız.
- **Doğrulama (K5):** 5 kişiye "sağdaki daha mı iyi?" ve "orta en iyisi mi?" diye sorulur. Kabul ölçütü ikisinde de ≤ 1/5.
  Geçmezse yalnız kelime kalır.
- Domain değişikliği yok (21 §2e). Yeni bileşen `card/level-mark.tsx`, girdi `levelFromLineId`.

### 2.5 Tipografi

| Rol | Font / boyut / satır | Nerede |
|---|---|---|
| Unvan | Fraunces 800; 38/40 · 31/33 · 25/28 (≤18 · 19-26 · 27-36 karakter), en fazla 2 satır, harf aralığı −1,2% | Kart |
| Wordmark | Fraunces 800, 28 (kart) / 96 (mağaza) | Kart, mağaza |
| Ekran başlığı / tarih | Fraunces 800, 30/38 + italik 600 22 (ikincil) | Bugün, Hafta |
| Seviye kelimesi, özet, durum cümlesi | Fraunces 600 italik, 13 / 14,5/17 / 20/28 | Kart, Hafta |
| Satır metni | Inter 500, 12,5/16, en fazla 2 satır | Kart |
| Etiket (BÜYÜK HARF) | Inter 800, 9-10, harf aralığı .14-.18em | Kart, ekran |
| Gövde / düğme / sekme | Inter 500 14 / 700 16 / 600-800 12 | Kabuk |

- **Türkçe:** büyük harfli metinler kaynakta büyük yazılır ("HAFTİK", "GİZLİ", "HAFTANIN UNVANI"). `textTransform` ve
  `toUpperCase()` yasak. Gerekçe: RN Android cihaz yereline göre büyütür, sistem dili İngilizce olan cihazda sonuç "HAFTIK"
  olur (22 taslağı F-4, K1). Kural lint/grep testine çevrilmeli (tech-lead).
- **Font dosyaları:** Fraunces 800 ve Fraunces 600 Italic (`@expo-google-fonts/fraunces`, alt-yol importu). Inter 500, 700 ve
  800 (400 ve 400 italik çıkar). Net etki bir-iki `.ttf` (K0, ölçülmeli). Statik dosyalar tek bir optik boyutla (opsz) geliyor;
  38 px unvanda harf biçimi tarayıcıdakinden biraz farklı olabilir, cihazda karşılaştırılmalı (14 notu).

### 2.6 Kart v2 (360×640 → 1080×1920), Story, 1:1, ÖRNEK (`kart-v2.html`)

- **Yerleşim (K1 hesap):**
  - Bant 44-68.
  - Mühür 260-336 × 26-102, +8°, unvanın köşesine 14 px biner.
  - Unvan 24-336 × 88-204, −1,5° (köşeler ±4,1 px); metin alanı 280.
  - Satırlar 4×56 + 6 aralık: 218-460. Metin sütunu 228; 60 karakter ≈ 396 px < 2 satır (456).
  - Özet balonu 472-520 + kuyruk (532).
  - Altbilgi 560-600: wordmark + "HER PAZAR BİR KART".
- **Durumlar:** normal · varsayılan gizleme (unvan ve iki satır arka kâğıt, "Gizli çıkartma / bilerek saklandı", "GİZLİ" çipi) ·
  33 karakterlik "İ/ı" stres testi · hepsi düşük (sayfa boş ya da kırmızı görünmüyor).
- **Mühür:** textPath r 25 (çevre 157,1). Metin "HAFTİK · HAFTALIK KART ·", `textLength="150"` +
  `lengthAdjust="spacingAndGlyphs"` ile sabitlendi; font ne olursa olsun taşmıyor, 7 birim boşluk kalıyor. RN'de PNG olduğu için
  dinamik metin riski de yok.
- **Adlandırma:** bant "HAFTALIK KART", unvan etiketi "HAFTANIN UNVANI". İkisi de zamansız; kaçırılan hafta albümden sonra
  açıldığında da doğru kalıyor (18 §2.7). "Karne" geçmiyor (Karar 5).
- **ÖRNEK (19 §3.3):** bant "ÖRNEK", −14° sarı "ÖRNEK" şeridi (unvanı kapatmaz), havuzda olmayan unvan "Ara Sıra Maraton",
  seviye kelimesi ve işareti yok, iki gizli çıkartma (gizlemeyi baştan öğretir), dipnot "Bu kart yalnızca örnektir."
  Paylaşılamaz.
- **Story:** varsayılan üst ~250 / alt ~340 px (@1080; ikincil kaynak, K5'te doğrulanacak). Unvan, satırlar ve özet 88-532
  bandında kalıyor. Mühür ve altbilgi dekoratif, dışarıda kalabilir. Marka iki yerde (mühür + wordmark) olduğu için biri her
  katmanda görünür (§4 çelişki 4).
- **Kare 1:1 (360×360):** "unvan kartı". Bant, mühür, unvan ve dört mini çıkartma (etiket + kelime + işaret) var; satır metni ve
  özet yok. Sohbet balonu ve akış için. Aynı gizleme kuralları geçerli.
- **Küçük boyut:** %25'te sarı unvan bloğu, beyaz şeritler ve dört ton ayrışıyor. Unvan kelime olarak zor okunuyor, kare varyantın
  asıl gerekçesi bu. %50'de unvan 19 px ile okunuyor.

### 2.7 Ekranlar (Bugün, Hafta) ve koyu tema

- **Bugün (`ekran-bugun-v2.html`, 864 dp bütçe, 18 §3.2):**
  - Üst: "‹ Dün" hapı (36 görsel, 48 dokunma), "BUGÜN" etiketi + Fraunces tarih, hafta noktaları.
  - Hafta noktaları: dolu = accent + ✓, geçmiş boş = kesik halka, gelecek = ince halka, bugün = çift halka. Şekil farkı
    renksiz de okunur.
  - Kategori başlığı: ton noktası + ad + seçilince "· kelime" (Fraunces italik).
  - Kutu 72 dp: ton diski, 25 px emoji, 12 sp kelime.
  - Seçili = `selFill` + 2,5 dp çerçeve + köşe onay rozeti + kalın kelime. Pasif = disk %50. Basılı = 0,96. Odak = 2+2 dp halka.
  - Kaydet 56 dp: pasifken `liner` zemin, sonra "✓ Kaydedildi". K3 bandı 56 dp, düz.
- **Hafta (`ekran-hafta-v2.html`, 768 dp; bantla 824):**
  - Yuva kartın 0,6 ölçekli albüm sayfası (216×384). Kilit simgesi yok. Açılmamış durumda dinamik içerik yok (18 §1.3).
  - Kilitli: boş silüetler + "SIRADAKİ" bandı.
  - Yolda: unvan yeri arka kâğıtlı, köşesi kalkık.
  - Açılabilir: ters dönmüş çıkartma yaprağı (arka kâğıt + mühür + sarı köşe) ve 1,00→1,02 nabız.
  - Açıldı: gerçek kart 0,6 ölçekte.
  - Albüm (F1, ikinci yapı): hücrede unvan çıkartması + 4 disk + "No. 7 · 21-27 Eyl" (uygulama içinde sayı ve tarih serbest, PNG'de
    yok).
- **Koyu tema (`koyu-tema.html`):** kabuk ikinci token sütunuyla koyulaşıyor, **kart ve kart ekranı asla koyulaşmıyor**.
  Koyu zeminde kartın etrafına 1 px %10 beyaz kenar ekleniyor (yalnız ekranda, PNG'de yok). Koyu temada gölge yok.
  **Öneri:** v1.1'de açık temaya kilitle (UX 18 §2.9-7, B14 seçenek a). Token'lar koyu sütunuyla yazılsın ki (b) sonra
  S boyutunda bir iş olsun.

### 2.8 Hareket: Kaydet ve reveal

- **Kaydet:** 0 ms'de basılı 0,97. 80 ms'de "Kaydedildi" (120 ms çapraz geçiş). 120 ms'de bugünün noktası 1→1,25→1 (220 ms).
  200 ms'de ilerleme cümlesi gelir ve ekran okuyucuya duyurulur. 900 ms kilit (18 §2.5). Ses ve konfeti yok.
- **Reveal "yapışma" (`reveal-storyboard.html`, 1,4 sn):**
  - 0 ms: sayfa ve boş silüetler anında gelir (spinner ve beyaz boşluk yok).
  - 120-420 ms: unvan −5°→−1,5°, 1,06→0,992→1. Burada haptik 1.
  - 420-830 ms: dört satır, her biri 200 ms, 90 ms arayla.
  - 800-1000 ms: balon.
  - 1000-1240 ms: mühür 24°→6°→8°, 1,35→0,97→1 (overshoot %3). Burada haptik 2.
  - 1240-1400 ms: altbilgi ve Paylaş.
  - Yalnız `opacity`/`transform` ve `useNativeDriver: true`. Gölge `View`'u kendi opaklığıyla animasyonlanır.
  - Herhangi bir dokunuş son kareye atlar. PNG her zaman son kareden alınır.
  - Kareler canlı animasyonla **aynı keyframe tanımından** üretildi (duraklatılmış negatif gecikme).
- **Azaltılmış hareket:** tek 150 ms opaklık geçişi, haptik yok, Hafta nabzı yok (A11Y-04).
- **Performans:** 12 animasyonlu görünüm var. Kare düşüşü ölçülmedi, performance-engineer'a devir.

### 2.9 İkon, splash, bildirim, mağaza (`ikon-v2.html`, `magaza.html`)

- **İkon 3 finali (Batuhan kararı):** siyah 24 px kontur yerine beyaz kesim kenarı, pırıltı yok, zemin #3D2E7C, eğim −6°.
  - Geometri (108 ızgara): kenar 49 (rx 13,5), yüz 44 (rx 11), gölge (2,2; 2,6). En uzak nokta 31,7 < güvenli r 33 (K1).
  - 48 px'te h çizgisi ≈3,1 px, kenar ≈1,7 px.
  - Dosyalar: `ikon-v2-1024.svg`, `-adaptive-fg`, `-adaptive-bg` (öneri: görsel yerine `backgroundColor`), `-monochrome` (oyuk
    "h"), `-bildirim` (24 dp beyaz siluet), `-splash` (288 dp tuval, içerik r 88,8 < 96).
- **app.json önerisi:** `ikon-v2.html` §7'de birebir yazılı. Splash iki temada da #3D2E7C; adaptive `backgroundColor #3D2E7C`.
  Bildirim ikonunu bağlama yolu platform uzmanında (config plugin bilerek eklenmedi, CLAUDE.md S8).
- **Mağaza:**
  - Tanıtım görseli 1024×500: albüm zemini, "haftik" 96 px, iki cümle, iki eğik mini kart. Güvenli alan ~64/50 px.
  - Ekran görüntüsü şablonu 1080×1920 ×5: sarı bant, Fraunces başlık (son kelime italik sarı), beyaz kenarlı telefon çerçevesi.
  - Ölçüler ikincil kaynaklardan (K3). Başlıklar copywriter'ın.

### 2.10 RN aktarım planı (21 §2b ile tutarlı)

| Adım | İş | Dosya | Boy |
|---|---|---|---|
| 1 | Token'lar (kart + kabuk açık/koyu + tonlar); sabit renkleri kaldır (B14) | `src/constants/tokens.ts`, `theme.ts` | S |
| 2 | Fontlar: Fraunces 800 / 600i, Inter 500/700/800 alt-yol | `src/card/fonts.ts`, `_layout.tsx` | S |
| 3 | `<Sticker tilt edge shadow>` ilkeli: döndürülen dış `View`, içinde ofsetli `albumDeep` `View` ve üstte `paper` kenarlı yüz | `src/card/Sticker.tsx` | S |
| 4 | `CardView` v2 + `layout.ts` + `kart-yerlesimi.md` + düzen testi. Test döndürülmüş kutuları 360×640 içinde tutar; unvan kademesi 36 karakter sınırı | `src/card/*` | M-L |
| 5 | `LevelMark` (L1), gizli satır render testi | `src/card/level-mark.tsx` | S |
| 6 | Varlıklar @4x | `assets/card/` | S |
| 7 | Bugün/Hafta cilası, sekme ikonları | `category-picker`, `checkin-form`, `week-*`, `locked-card-placeholder` | M |
| 8 | Reveal + Kaydet anı + `useReducedMotion` | `CardRevealView.tsx`, `SaveConfirmation` | M |
| 9 | İkon/splash PNG'leri + `app.json` | `assets/images/*` | S |

- **Adım 6 varlık listesi:** `album-9x16` 1440×2560 (nokta + gren + üst ışık), `album-1x1` 1440², `seal` 304², `liner-tile`
  112², `peel-corner` 136², `tape-end`. Hepsi veri taşımaz.
- **Kısıtlar:**
  - Kartta `elevation`, `shadow*`, `boxShadow` ve `expo-blur` yok (21 R2).
  - Yakalama R1 sarmalayıcısıyla yapılır (1080/PixelRatio dp). "Paylaş" düğmesi görseller yüklenene kadar pasif kalır (R3).
  - Emoji 22 px, F-3 sınırının çok altında. Samsung ve Google emojisinin farkı K5'te görülür.
  - Kesik kenar (`borderStyle: dashed`) ile yarıçap birlikte Android'de K4'te bakılmalı. Sorun çıkarsa `liner` PNG'si kesik
    çizgiyi de taşır.
- **Testler:** `contrast.test.ts` token'lardan metin ≥4,5 ve UI ≥3 doğrular. Düzen bütçesi. Gizli satır ağacı. `textTransform`
  ve `toUpperCase` grep yasağı. İçerik lint'i: unvan ≤36 karakter.

### 2.11 Profesyonel görünüm denetim listesi (uygulama sonrası, protokol adım 8, K4)

1. Kart PNG'si 2,0x ve 2,625x emülatörde kenar keskinliğiyle yakalanmalı (R1).
2. Aynı karta %25 küçültülmüş bakıldığında unvan bloğu ve dört ton seçilebilmeli.
3. Gizli ve açık kartlar yan yana konunca gizli olan "hata" gibi okunmamalı (3 kişi).
4. Kart, ekran ve ikonun hiçbirinde Expo mavisi ya da sistem Roboto başlığı kalmamalı.
5. Kontrast oranları token testinde geçmeli.
6. Yazı ölçeği 2.0'da Bugün kutuları taşmamalı (`maxFontSizeMultiplier` 1,3).
7. Koyu modda (seçilirse) sabit renk kalmamalı.
8. Reveal azaltılmış harekette tek geçiş olmalı.
9. Uygulama ikonu 48 px'te gerçek başlatıcıda ayrışmalı.
10. Splash ile ilk ekran arasında beyaz parlama olmamalı.
11. Sistem dili İngilizce iken "HAFTİK" bozulmamalı.
12. 5 kişiye "bitmiş ürün mü?" sorulduğunda ≥4/5 evet (01 H5).

## 3. Yeni özellik önerileri (taslak intent; karar Batuhan'ın)

| # | Öneri | Etki | Efor | Gizlilik |
|---|---|---|---|---|
| G1 | Kendi çıkartma çizimleri (12 emoji yerine vektör set) | Yüksek (marka + platform tutarlılığı) | L | Uyumlu |
| G2 | Kilometre taşı mühürleri (1., 4., 10., 26. kart) | Orta | S | Uyumlu |
| G3 | Ay sayfası posteri (4 unvan çıkartması, paylaşılabilir) | Orta | M | Dikkat: paylaşım unvanı kuralı |
| G4 | Kart biçimi seçimi 9:16 / 1:1 (UX Q5'in görsel yarısı) | Orta | S-M | Uyumlu |

- **G1 taslak intent:** Kartta sistem emojisi kullanılıyor ve Samsung, Google ve Apple'da farklı çiziliyor (F-3). Aynı kart her
  telefonda başka görünüyor ve marka tutarlılığı kaybediliyor. 12 çıkartmalık (4 kategori × 3 seviye) kendi çizimi, OFL-uyumlu
  bir vektör set PNG @4x olarak paketlenir. Uygulama içi seçicide emoji kalabilir. Başarı ölçütü: kart PNG'si iki farklı OEM'de
  piksel düzeyinde aynı.
- **G2 taslak intent:** Uzun süre dönen kullanıcı için görünür ama baskısız bir iz yok. 1., 4., 10. ve 26. kartta mühür farklı bir
  varyantla basılır. Önceden hedef olarak gösterilmez, yalnız o reveal'da sürprizdir (18 §2.2-4). Sayı kartta yazmaz. Seri,
  kayıp ya da FOMO yok. Başarı ölçütü: 4. kartı açanların paylaşım oranı ilk karttan düşük değil.
- **G3 taslak intent:** 4 kart biriktiğinde albümden "Ay sayfası" üretilir: dört unvan çıkartması tek bir 9:16 posterde. Başka
  içerik taşımaz ve her unvan kendi haftasının paylaşım unvanı kuralına uyar (gizli kategoriden türeyen unvan gizli çıkar). Tarih
  ve sayı yok. Başarı ölçütü: albümü açanların ≥%15'i posteri paylaşır. Ön koşul Albüm (F1).
- **G4 taslak intent:** 9:16 kart sohbet balonunda küçük kalıyor (%25'te unvan okunmuyor). Paylaşım seçicisinde "Dikey / Kare"
  seçimi sunulur; kare varyantın görseli bu turda hazır (`kart-v2.html` K7/K8). Başarı ölçütü: kare seçimi ≥%20 ve toplam
  paylaşım oranı düşmüyor.

## 4. Bağımlılıklar, devir ve çelişkiler

**Devir:**
- **mobile-engineer:** §2.10.
- **copywriter:** Kilitli/hazır başlıkları ve "Kartın hazır, Çıkartmayı kaldırmak için dokun" onayı. Mağaza başlıkları.
  "HER PAZAR BİR KART". 19 §2.4'teki "Cüzdanın bu hafta soğuk kaldı / hiç soluklanmadı" metinleri prototipte kullanıldı, havuzda
  henüz yok.
- **ui-ux-designer:** Yuva durumları ve Albüm hücresi. Ayarlar v2 bu turda çizilmedi.
- **accessibility-auditor:** Ton diski dekoratif mi, konum işareti gizli mi. Koyu kontrastlar K4.
- **performance-engineer:** Reveal, nabız ve font boyutu ölçümü.
- **mobile-platform-specialist:** Bildirim ikonunu bağlama yolu, Android 12 splash ölçüsü, `dashed` + yarıçap davranışı.
- **tech-lead:** `textTransform` yasağının lint'e çevrilmesi.

**Çelişkiler (açıkça):**
1. **21 §2b: Baloo 2, italik yok.** Ben Fraunces 800 + 600 italik öneriyorum. Gerekçe: yuvarlak display font C'nin çocuksu
   algısının üç kaynağından biri. Maliyet: Baloo'nun iki dosyasına karşı Fraunces'in iki dosyası; Inter italik zaten çıkıyor.
   Karar Batuhan'ın (§5 S2).
2. **18 §2.9-2 (eğim ≤ ±1,5°):** unvan buna uydu (−2° → −1,5°). Mühür +8°: dekoratif istisna olarak öneriyorum.
3. **18 §2.9-7 (koyu tema yok):** koyu ekranlar yalnız seçenek maliyetini göstermek için çizildi; v1.1 önerim de açık temaya kilit.
4. **18 §2.8 (marka güvenli banda):** kartta marka iki yerde (mühür + wordmark) olduğu için ayrıca taşımıyorum. Taşımak satırları
   sıkıştırır (§5 S4).
5. **18 W5 (kart ekranı zemini = albüm):** ben bir ton koyusunu (#2F2463) öneriyorum. Kart kendi sayfasından ayrışsın ve PNG
   sınırı görünsün diye.

## 5. Batuhan'a sorular (seçenekli)

- **S1 Seviye gösterimi:** (a) L1 konum işareti *(öneri)* · (b) L2 katman · (c) L3 boy · (d) yalnız kelime.
- **S2 Kart fontu:** (a) Fraunces + Inter *(öneri, yetişkin)* · (b) Baloo 2 + Inter (21'in varsayımı, daha oyuncu).
- **S3 Koyu tema:** (a) v1.1'de açık temaya kilit, token'lar koyu sütunuyla hazır *(öneri)* · (b) şimdi koyu kabuk.
- **S4 Story'de marka:** (a) mühür + wordmark ikilisi yeter *(öneri)* · (b) wordmark güvenli banda taşınsın.
- **S5 Albümde gizli satırlar:** (a) albüm özeldir, tam gösterilsin *(öneri; paylaşılan PNG değil)* · (b) paylaşıldığı gibi
  gizli kalsın (albüm ekran görüntüsüne karşı).
- **S6 İkon:** (a) v2 finali (beyaz kenar, pırıltısız) *(öneri)* · (b) 14'teki ikon 3 olduğu gibi.
- **S7 Yeni özellikler:** G1-G4'ten hangileri intent'e dönüşsün? *(öneri: G4 çekirdekte, G2 arkadaş denemesinden sonra)*

## 6. Doğrulanamayanlar

- **Prototipler tarayıcıda gözle görülmedi.** Bu ortamda tarayıcı ya da ekran görüntüsü aracı yoktu. Koordinat, taşma ve bütçe
  hesapla denetlendi (K1). Bir kayma görülürse dosya ve öğe adıyla bildirilsin.
- Kontrastlar yalnız hesaplandı (K1); ekranda ve cihazda ölçülmedi (K4/K5).
- Fraunces'in statik Expo dosyasının optik boyutu ve Türkçe glif çizimi (İ ı ş ğ) cihazda görülmedi.
  `@expo-google-fonts/fraunces` paket adı ve alt-yol adları kurulumda doğrulanmalı (K0).
- İkonun gerçek başlatıcıda ve Play ızgarasında ayrışması, benzer "mor + sarı" ikon taraması, Android 12 splash maskesi ve
  bildirim ikonunun görünümü denenmedi.
- Play grafik ölçüleri ikincil kaynaklardan alındı (K3): [Choicely](https://www.choicely.com/tutorials/google-play-app-store-guidelines-screenshots-listings),
  [ScreenKit](https://screenkit.tools/specs/google-play-feature-graphic-size),
  [PlayAudit](https://playaudit.app/blog/google-play-listing-requirements). Play Console yardımından teyit edilmeli.
- Story güvenli alan oranları varsayım (15, 22 taslağı; K3). K5 hedef testi gerekli.
- View-shot'ın döndürülmüş `View`'ları, kesik kenarları ve PNG katmanlarını R1 sarmalayıcısıyla doğru yakaladığı denenmedi (21 R1-R3).
- Renk körlüğü simülasyonu yaklaşık matrislerle yapıldı, ölçüm değil. Seviye "puan" okuması ve "bitmiş ürün mü" testleri (K5)
  yapılmadı.

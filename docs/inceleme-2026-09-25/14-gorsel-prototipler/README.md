# 14 — Görsel prototipler (visual-designer, 3. tur)

> 2026-09-28. Batuhan'ın geri bildirimi: "resim insanın gözüne hitap etmiyor, çok amatör işi duruyor." 10-gorsel-kimlik.md
> yalnızca metin ve token tablosuydu. Bu turda **gözle değerlendirilebilen, çalışan HTML prototipleri** var.
> `src/`, `assets/`, `app.json` ve emülatöre dokunulmadı. Commit atılmadı. Yön ve ikon için son karar Batuhan'ın.

## Nasıl açılır

`index.html` dosyasını tarayıcıda açın (Chrome/Edge önerilir). Fontlar Google Fonts'tan yüklendiği için internet gerekir;
bağlantı yoksa sistem fontuna düşer ve görünüm bozulur. Emoji, Android'deki gibi **Noto Color Emoji** ile çizilir.
Galerideki kutular küçültülmüş hâldir. Kararı "tam sayfa" bağlantılarında, gerçek boyutta verin.

## Dosyalar

| Dosya | İçerik |
|---|---|
| `index.html` | Galeri: tüm prototipler yan yana, açık/koyu zemin anahtarı |
| `kart-a-muhurlu-karne.html` | **Yön A**: normal, unvan gizli, stres testi (uzun unvan, tümü düşük), %25 önizleme |
| `kart-b-pazar-gecesi.html` | **Yön B**: normal, unvan gizli, %25 önizleme |
| `kart-c-cikartma-albumu.html` | **Yön C**: normal, unvan gizli, %25 önizleme |
| `ekran-bugun.html` | Bugün (check-in) ekranı, A ve B; durum lejantı (normal/seçili/pasif/basılı/odak) |
| `ekran-hafta.html` | Hafta ekranı, kilitli ve açılabilir; A (zarf) ve B (küre) |
| `ikon.html` | 3 ikon alternatifi: adaptive ön/arka plan, güvenli alan, 3 maske, monochrome, 192/96/48/36 px, başlatıcı testi, Play kartı |
| `ikon-1-muhur.svg` | İkon 1 · Mühür (A) · 1024 ana dosya |
| `ikon-2-hafta-gulusu.svg` | İkon 2 · Hafta gülüşü (B) · 1024 |
| `ikon-3-cikartma.svg` | İkon 3 · Çıkartma h (C) · 1024 |

Kartlarda aynı içerik kullanıldı: unvan "Konforun Kalesi" (`title.combo.sleepHighMovementLow`), satırlar ve özet
`src/domain/content/tr.ts` havuzundan. Gizli örnekte varsayılan gizleme uygulandı: uyku ve harcama gizli, unvan uykudan
türediği için o da gizli (`title-visibility.ts` kuralı). Kartta tarih, ham sayı, tutar ya da konum yok. Hafta bilgisi yalnızca
sabit "Pazartesi — Pazar" metni (veri taşımıyor).

## Üç yön, tek paragraflık gerekçe

**A — Mühürlü karne.** Fikir: *"Haftan, krem kâğıda basılmış, mor mühürlü bir karne."* Ürünün adı ve vaadi zaten karne;
A bu metaforu ciddiyetin parodisiyle görselleştiriyor. Karne çift çizgili çerçevesi, köşe elmasları, bir guilloş şerit (resmî
belgelerdeki dalgalı güvenlik deseni) ve dev bir serif unvan kullanılıyor. Unvanın son kelimesi italik. "Genel görüş" başlıklı
özet de karne dilinden geliyor. İmza, kartın köşesine eğik basılmış **HAFTİK mührü**. Aynı mühür uygulama ikonu da oluyor.
Gizleme kararı hata gibi değil şaka gibi okunuyor, çünkü unvanın üstünde **düzeltme bandı** var: "bunu bilerek kapattım".
Renkler kâğıt, mürekkep ve tek bir mor. Seviye renkle değil kelime ve nokta sayısıyla gösteriliyor. Mood tracker kategorisindeki
pastel ve gradyan kalabalığından en çok ayrışan yön bu.

**B — Pazar gecesi.** Fikir: *"Kart, pazar akşamı ufukta doğan bir güneş gibi açılır."* Gece laciverti bir gradyan, ufukta
amber bir ışık ve sağ üstte parlayan tek bir küre var. Dev grotesk unvanın son kelimesi amber. Satırlar buzlu cam bir panelde.
İmza küre ve yedi noktalı "hafta gülüşü" logosu. Hafta ekranında kilitli kartın küresi ufkun altında bekliyor, pazar 20:00'de
doğuyor; bu yüzden açılış anının dramı en güçlü bu yönde. Riskleri şunlar: Spotify Wrapped benzeri "koyu gradyan poster"
estetiğine yakın ve kategoride sık görülen bir görünüm. PNG sıkıştırmasında gradyan bantlanma riski taşıyor. Beyaz sohbet
ekranında güçlü ama Story'de sıradan kalabilir.

**C — Çıkartma albümü.** Fikir: *"Her hafta albümüne yapıştırdığın bir çıkartma sayfası."* Mor, noktalı bir albüm zemini
üzerinde kalın siyah konturlu, bulanıksız sert gölgeli ve hafif eğik yapıştırılmış beyaz çıkartmalar var. Unvan sarı bir
çıkartma, marka pembe bir patlama rozeti, özet bir konuşma balonu. Gizli durum henüz yapıştırılmamış, arka kâğıdı görünen bir
çıkartma. Küçük önizlemede en çok göze batan yön bu. Riskleri: hedef kitle 18+ iken "çocuk uygulaması" algısı; eğik öğeler
arttıkça QA ve düzen testleri pahalılaşıyor; kontrollü tutulmazsa renk sayısı artıyor.

## Tasarım token'ları

Kontrast oranları WCAG 2.x göreli parlaklık formülüyle **elle hesaplandı (K1)**; ekranda ölçülmedi.

### A — Mühürlü karne (önerilen)

| Token | Değer | Kullanım | Kontrast |
|---|---|---|---|
| `paper` | `#F5EEDF` | Kart ve uygulama zemini | — |
| `surface` | `#FFFCF5` | Kutu, sekme çubuğu | — |
| `sunken` | `#ECE3D1` | Basılı kutu | — |
| `cell` | `#EBE0C9` | Kartta emoji dairesi | — |
| `ink` | `#1F1B16` | Metin, çerçeve, seviye noktaları | paper **14,8** · surface 16,7 · accentSoft 14,3 |
| `inkSoft` | `#6A6155` | Etiket, ikincil metin | paper **5,3** · surface 5,9 · zarf etiketi ≈4,9 |
| `violet` | `#4B32C3` | Mühür, seçili çerçeve, Kaydet, aktif sekme, etiketler | paper **7,1** · beyaz üstünde beyaz metin 8,3 · accentSoft 6,9 · bant 8,1 |
| `accentSoft` | `#ECE8FB` | Seçili kutu dolgusu | — |
| `line` | `#DDD0B8` | Kutu kenarı (dekoratif) | — |
| `rule` | `rgba(31,27,22,.32)` noktalı | Kart satır ayracı | dekoratif |
| `tape` | `#FFFDF7` → `#F8F4EB` | Düzeltme bandı | — |

| Tipografi | Font / boyut / satır | Ağırlık |
|---|---|---|
| Kart unvanı | Fraunces 54/53, harf aralığı -%2; 17-24 karakter: 44, 25+ karakter: 38 (en fazla 3 satır) | 800; son kelime 700 italik |
| Kart etiketleri ("HAFTA KARNESİ", "BU HAFTANIN UNVANI", "GENEL GÖRÜŞ") | Inter 10 ve 9, harf aralığı .3em / .24em | 800 / 700 |
| Kategori adı | Inter 9, harf aralığı .16em, `inkSoft` | 800 |
| Seviye kelimesi | Fraunces 12 italik | 600 |
| Satır metni | Inter 13/17, en fazla 2 satır | 400 |
| Özet | Fraunces 16/20 italik, en fazla 2 satır | 400 |
| Marka / bağlantı | Fraunces 24 / Inter 10,5/13,6 | 700 / 500 |
| Ekran tarihi / başlık | Fraunces 46 / 40 | 800 |
| Hafta durum satırı | Fraunces 20 italik | 500 |
| Kategori etiketi (ekran) | Inter 15/24 + seviye Fraunces 16 italik | 700 |
| Düğme / sekme | Inter 16 / 12 | 700 / 600 (aktif 800) |

Büyük harfli metinler kaynakta büyük yazılır (HAFTİK, GİZLİ). `textTransform` kullanılmaz (i → İ).

**Kart yerleşimi (360×640 mantıksal):** dış çerçeve 12 px içeride 1,5 px `ink`, iç çerçeve 16 px içeride 0,75 px %55,
köşelerde 9 px elmas · y 34 "HAFTA KARNESİ" · y 51 "Pazartesi — Pazar" · y 72-84 guilloş · y 100 unvan etiketi ·
y 119-225 unvan · y 237-242 çift mor çizgi · y 252-473 dört satır (54'er px, üst ve alt 1 px düz, aralar noktalı; emoji
dairesi 38 px, emoji 22 px) · y 484-539 özet · y 554-610 altbilgi (solda) · mühür 80 px, sağdan 22, alttan 16, -14°.
Yan kenar boşluğu 28. Kritik içerik 34-610 bandında.

**Boşluk / yarıçap / gölge:** 4'lük ızgara; ekran kenarı 24. Kutu ve düğme yarıçapı 14, çip tam yuvarlak, kart köşesiz
(PNG tam dolu). Gölgeler: kutu `0 1 0 %6`, Kaydet düğmesi mor ışık (`0 8 18 -8`), zarf `0 24 44 -18`. Başka gölge yok.

### B — Pazar gecesi

| Token | Değer | Kontrast (metnin arkasındaki en açık bölge ≈`#3D2F75`) |
|---|---|---|
| Gece gradyanı | `#0A0918` → `#120E2E` → `#22145A` (172°) | — |
| Işıklar | mor `rgba(125,92,255,.55)` sağ üst; amber `rgba(255,146,92,.40)` alt | — |
| Küre | `#FFE7C4` → `#FFB37A` → `#E4739C` → `#7D5CFF` | metin küreyle çakışmaz |
| `text` / `text2` | `#FFFFFF` / `#F4F0FF` | 11,3 |
| `muted` | `#C9C1EA` | 6,6 |
| `amber` | `#FFB36B` | 6,4 |
| `lilac` | `#A99BFF` | UI öğesi (seviye noktası, seçili çerçeve) |
| Cam | `rgba(255,255,255,.10→.04)`, kenar `rgba(255,255,255,.14)` | — |
| Uygulama zemini / sekme | `#0F0C24` / `#0E0B20` | pasif sekme `#C9C1EA` üstünde >10 |
| Düğme | `#6E50F5` → `#5236D6`, beyaz metin | 5,1 (en açık uçta) |

Tipografi: unvan Bricolage Grotesque 800, 56/51,5, harf aralığı -%3,5 (son kelime amber) · ekran tarihi 46 · marka 20 ·
diğer tüm metinler Inter (satır 13/17, özet 14/19 italik). Yerleşim: y 34 üst etiket · y 166 unvan etiketi · y 185-288 unvan ·
y 300-534 cam panel (4×58) · y 548-586 özet · y 598-620 altbilgi · küre 132 px (226, 30).

### C — Çıkartma albümü

| Token | Değer | Kontrast |
|---|---|---|
| `bg` | `#6D4AFF` + %16 beyaz nokta (13 px ızgara) | beyaz metin **5,2** (yalnızca ≥10,5 px kalın metin) |
| `ink` | `#15121F` (kontur 2,5 px, sert gölge 4-5 px) | beyaz 18,5 · sarı 14,3 · pembe 7,6 |
| `sun` | `#FFE347` | unvan çıkartması |
| `pop` | `#FF7AA8` | marka rozeti |
| `lav` | `#E9E3FF` | emoji rozeti (tüm kategorilerde aynı) |
| Arka kâğıt | `#E6EAF4` / `#D6DCEA` çizgili + kesik kontur | gizli durum |

Tipografi: unvan Baloo 2 800, 46/42 · marka 28 · özet Baloo 2 700, 15/18 · satır Inter 600, 12,5/16 · etiket Inter 800, 9,5.

## Renk ve anlam kuralları (üç yönde de)

- Kategoriye ya da seviyeye göre renk yok. Tüm satırlar aynı renkte.
- Seviye iki kodla gösteriliyor: kelime ("durgun") ve dolu nokta sayısı (1-3). **Risk:** noktalar bir puanlama
  (3 = daha iyi) gibi okunabilir. Harcama "çok" 3 nokta alıyor ve bu bir övgü değil. Noktalar yalnızca yoğunluk anlamı
  taşıyor. Bu okuma riskli bulunursa noktalar kaldırılıp yalnızca kelime bırakılır (copywriter + ui-ux-designer).
- Seçili durum dolgu, kalın çerçeve ve ✓ rozetiyle gösteriliyor; gri tonlamada da ayırt ediliyor. Hafta noktalarında
  dolu/boş/kaçırılmış ayrımı şekille yapılıyor (dolu + ✓ / düz halka / kesik halka).

## Hafta ekranı: bilinçli ürün kararı

"Açılabilir ama henüz açılmadı" durumunda **gerçek unvan ve satırlar hafta ekranında gösterilmiyor.** A'da kart zarftan
yalnızca sabit, veri taşımayan başlığı kadar çıkıyor. B'de küre doğuyor ama içerik buzlu kalıyor. Gerekçeler:
(1) sürpriz, kart ekranındaki açılış anında (reveal) kalsın; (2) önizleme için kartı hafta ekranında erkenden
oluşturup dondurmak (`openOrBuildCard`) gerekmesin. Kart görüldükten sonraki durumda ("Kartını tekrar görmek için dokun")
gerçek `CardView` küçük olarak gösterilebilir. Bu bir akış kararı; ui-ux-designer onayına sunulur.

## React Native'e aktarım notu

**package.json kontrolü (bugün):** `react-native-svg` **yok**, `expo-linear-gradient` **yok**, `expo-blur` **yok**.
Var olanlar: `@expo-google-fonts/inter` (400/400 italik/700 alt yolları kullanılıyor), `react-native-view-shot`,
`react-native-reanimated`. Önerim yeni SVG veya gradyan paketi eklemek değil. Kartın veri taşımayan bütün süsleri
**sabit PNG varlık** olarak üretilir; dinamik kısımlar düz `View`/`Text` ile yapılır. Böylece view-shot'ın yakaladığı şey
sade bir `Image` + `View` ağacı olur.

| Parça | RN'de nasıl | Yeni bağımlılık |
|---|---|---|
| Düz zemin, çerçeve, daire, seviye noktası, ayraç | `View` + `borderWidth`/`borderRadius` | yok |
| Noktalı/kesik çizgi | `borderStyle: 'dotted' / 'dashed'` (Android'de tek kenarlı noktalı çizgi sorunlu olabilir; olmazsa 1 px `View` ya da PNG şerit) | yok |
| A kâğıt dokusu, C nokta dokusu | Tekrarlanan PNG döşeme (`ImageBackground`, `resizeMode="repeat"`) ya da 1080×1920 tek PNG | yok |
| A mühür, guilloş, düzeltme bantları (genişlikleri sabit) | PNG @3x + `transform: rotate` | yok |
| B zemin (gradyan + küre + yıldız + ufuk ışığı) | Tek 1080×1920 PNG. Her kartta aynı, veri taşımıyor | yok (alternatif: `expo-linear-gradient`, kurulu değil) |
| B cam panel | Yarı saydam `View` + ince kenar. Bulanıklık zaten zemin PNG'sinde. `expo-blur`'un view-shot ile yakalanması **doğrulanmadı**, kartta kullanılmamalı | yok |
| Metin ışıması (B) | `textShadowColor` / `textShadowRadius` | yok |
| Renkli kutu ışıması (B'de seçili kutu, Kaydet) | RN'in `boxShadow` stili (New Architecture, RN ≥0.76). **Bu projede denenmedi.** Olmazsa arkaya yarı saydam `View` konur | yok |
| C sert gölge | Arkada 4-5 px kaydırılmış koyu `View` | yok |
| Son kelimenin italik/amber olması | İç içe `<Text>`; dondurulmuş unvan son boşluktan bölünür (yalnızca sunum) | yok |
| Unvan boyu | Karakter sayısına göre 3 kademe (54/44/38) + düzen testi. `adjustsFontSizeToFit`'e güvenilmez | yok |
| A zarf (Hafta) | PNG katmanları (arka, kapak, ön cep) + mühür PNG; açık durumda kartın üstü sabit bir parça, `CardView` değil | yok |
| Sekme ikonları | 10-gorsel-kimlik §9 kararı (`@expo/vector-icons` ya da PNG) | karara bağlı |
| **Fontlar** | A: `@expo-google-fonts/fraunces` · B: `@expo-google-fonts/bricolage-grotesque` · C: `@expo-google-fonts/baloo-2` · Inter için 500/600/800 alt yolları mevcut paketten | **YENİ (A/B/C için bir tane).** Yalnızca statik `.ttf` dosyaları; npm sayfasına göre MIT paket + OFL font. "Ağa veri gönderiyor mu" kontrolü kurulumda kaynak okunarak tekrarlanmalı |

Notlar:
- Bricolage Grotesque'in Expo paketi yalnızca statik ağırlıklarla geliyor (200-800), genişlik ekseni yok. Prototip de
  varsayılan genişlikle çizildi, yani RN'de aynı görünüm elde edilebilir. Fraunces değişken bir fonttur ve tarayıcı optik
  boyutu (opsz) puntoya göre otomatik seçer. Expo'nun statik dosyası tek bir optik boyutla gelir, bu yüzden 54 px unvanda
  harf formu biraz farklı çıkabilir. Cihazda karşılaştırılmalı.
- `mix-blend-mode` (mühürdeki mürekkep etkisi) RN'de kullanılmaz; PNG'nin alfa kanalı yeterli.
- Kart düzeni değiştiği için `src/card/layout.ts`, `__tests__/card/layout.test.ts` ve `docs/ux/kart-yerlesimi.md` birlikte
  güncellenmeli. Bu bir tasarım değişikliği (testi koda uydurmak değil) ve Batuhan onayı gerektiriyor.
- PNG'lerin kaynağı bu HTML'deki SVG'ler. Dışa aktarım tek seferlik (tarayıcı ekran görüntüsü ya da vektör araç) ve
  `assets/` altına mühendis onayıyla girer.
- Hareket: 10-gorsel-kimlik §5 geçerli. A için ek olarak kilit açılınca mühür iki yarıya ayrılır (180 ms, yalnızca
  `transform`); reveal'in son karesinde mühür yeniden basılır. Azaltılmış harekette tek bir 150 ms opaklık geçişi olur.

## Yeni metinler (copywriter onayı gerekli)

Prototiplerde kullanılan ve içerik havuzunda olmayan metinler: "BU HAFTANIN UNVANI", "GENEL GÖRÜŞ", "Her pazar yeni bir
karne", "PAZAR GECESİ", "GİZLİ", "Gizli çıkartma", "Kartını aç", "Kartın hazır" (B'deki rozet), "Haftanın emoji karnesi"
(Play kartı alt başlığı). Ayrıca uyku için mevcut seviye kelimesi "kötü", kartta yargı gibi okunuyor (A3 stres testi).
Kart üzerindeki seviye kelimeleri ayrıca gözden geçirilmeli.

## Bana göre en güçlü yön: A (Mühürlü karne) ve ikon 1 (Mühür)

1. **Tek fikir, ürünün adıyla aynı.** Karne metaforu unvanı, "genel görüş"ü, mührü, zarfı ve düzeltme bandını tek bir
   hikâyeye bağlıyor. B ve C güzel yüzeyler; A ise bir *dil*.
2. **Kategoride ayrışıyor.** Rakipler pastel ya da koyu gradyan kullanıyor. Krem kâğıt, serif ve mor mühür, Story'de ve
   sohbet akışında "bu nereden?" diye sorduran tek yön.
3. **Gizlilik esprisi.** Varsayılan gizlemede unvan çoğu kartta gizli olduğu için (bkz. 10, G6) gizli hâlin iyi görünmesi
   kritik. Düzeltme bandı gizlemeyi eksiklik gibi değil karakter gibi gösteriyor.
4. **Yargısız ve kalıcı.** Tek vurgu rengi, trend olmayan bir tipografi; bir yıl sonra eskimesi en az beklenen yön.
5. **En ucuz ve en güvenli uygulama.** Düz renkler, üç-dört PNG varlık ve tek bir yeni font paketi yetiyor. Kart ve ikon
   aynı mühürü taşıdığı için marka tutarlılığı kendiliğinden geliyor.

Zayıf yanı: yan yana konunca B ve C'den daha "sessiz" duruyor. Önlem olarak açılış anı (zarfın açılması, mührün basılması)
hareketle güçlendirilir. İstenirse yalnızca kart ekranının arka planında B'nin gece tonu kullanılabilir; paylaşılan PNG ise
kâğıt kalır.

## Doğrulanamayanlar (dürüst sınırlar)

- **Prototipleri kendim tarayıcıda görüntüleyemedim.** Bu ortamda tarayıcı ya da ekran görüntüsü aracı yoktu. Yerleşimi,
  çakışmaları ve taşmaları kodu okuyarak ve koordinatları hesaplayarak denetledim (K1). Gözle kontrol Batuhan'ın ekranında
  yapılacak. Bir taşma ya da kayma görülürse hangi dosya ve öğe olduğu bildirilsin.
- Kontrast oranları hesaplandı, ölçülmedi. Emülatörde ve gerçek cihazda ölçülmeli (K4/K5).
- Türkçe karakterler (İ, ş, ğ, ı) Fraunces, Bricolage Grotesque ve Baloo 2'nin Google Fonts latin-ext alt kümesinde
  bulunuyor (K3, katalog bilgisi). RN'deki statik dosyalarda cihazda görülmedi.
- İkonların gerçek başlatıcıda ve Play mağaza ızgarasında ayrışması, benzer mor mühür ya da gülen nokta ikonların olup
  olmadığı taranmadı. Yayından önce yapılmalı.
- Noto Color Emoji tarayıcıda Google Fonts'tan geliyor. Cihazdaki sürüm farklı olabilir; iOS'ta Apple emoji çizilir.
- RN'de `boxShadow`, `borderStyle: 'dotted'` ve view-shot'ın PNG `Image` katmanlarını yakalaması bu projede denenmedi.

# 10 — Görsel kimlik incelemesi (visual-designer, 2. dalga)

> 2026-09-28. Kod/yapılandırma/`assets/` değiştirilmedi. Marka ve ikonla ilgili son karar Batuhan'ındır.
> Kanıt seviyeleri: `ortak-standartlar.md` K0-K5.

## 1. Mevcut görsel dilin dürüst tespiti

Kaynak: `%TEMP%\qa4\` altındaki emülatör kareleri (K4, 1080x2400, 420 dpi) ve kaynak kod okuması (K1).

| # | Gözlem | Kanıt |
|---|---|---|
| G1 | **Uygulamanın kendine ait bir rengi yok.** `src/constants/theme.ts`, Expo şablonunun birebir aynısı (`#000/#fff`, `#F0F0F3`, `#60646C`). Tek "vurgu" saf siyah buton. Marka rengi ya da marka işareti yok. | `theme.ts` (K1); `s09`, `s01` (K4) |
| G2 | **İkon ve splash Expo'nun kendisi.** İkon mavi ızgara üzerinde Expo "^" işareti. Adaptive arka plan `#E6F4FE`, splash `#208AEF` üzerinde Expo sembolü. Yayını engelliyor. | `app.json`, `assets/images/icon.png` (K1) |
| G3 | **Bugün ekranı 12 eş ağırlıklı gri kutudan oluşuyor.** Seçili kutu biraz koyu gri ve 2px siyah çerçeveli; erişilebilir ama "form" hissi veriyor. Seçilmemiş emojiler soluk. Başlık sistem fontuyla (Roboto). Ekranın alt %20'si boş. Kaydet'e basınca hiçbir geri bildirim yok (QA #8). | `s09` (K4) |
| G4 | **Hafta ekranı en zayıf ekran.** Günler siyah dolu/boş dairelerle gösteriliyor. Kilitli kart gri bir iskelet (`#D1D1D6`/`#8E8E93`); ödül gibi değil, yükleniyor ekranı gibi duruyor. "Kartın hazır!" düz 17px metin. | `s13` (K4) |
| G5 | **Kart, yani asıl ürün, beyaz bir Word belgesine benziyor.** Beyaz zemin, 30px Inter Bold unvan, gri ayraçlı 4 satır, gri italik kutu (pill), 11px ve %65 opak damga. Hiyerarşi doğru ama *imza* yok: karttan renk ya da işaret silinse bir şey kaybolmuyor. Story'de ve beyaz sohbet ekranında kenarsız kayboluyor. | `s15`, `CardView.tsx` |
| G6 | **`???` durumu kartı öldürüyor.** Varsayılan gizlemede unvan kombinasyonların yalnızca %18,5-19,8'inde görünüyor. `???` ve `❔` birlikte "sır" gibi değil, "hata / eksik veri" gibi okunuyor. | `s43`, 09 #3 |
| G7 | **Önizleme kartın kendisi değil.** Önizleme ekranında Roboto ile yazılmış bir liste var, kullanıcı paylaşacağı görseli görmüyor. "< Geri" düğmesi durum çubuğundaki saatle çakışıyor. | `s19`, `s43` (K4) |
| G8 | **Font ve renk dağınık.** Kart Inter kullanıyor, kabuk sistem fontu. Tema dışında sabit yazılmış renkler var (B14): `#D7263D`, `#1C1C1E`, `#3c87f7`. Sekme ikonları emoji; emoji hem içerik hem gezinme için kullanılınca iki katman birbirine karışıyor. | grep `src/` (K1) |

**Teşhis:** Hiyerarşi (başlık > içerik > eylem) büyük ölçüde doğru. Eksik olan tek bir görsel fikir. Ürünün iki duygusal
anı (günlük kayıt ve Pazar açılışı) ve tek paylaşılabilir çıktısı (kart) görsel olarak nötr. Emoji güçlü ama etrafındaki
her şey gri olduğu için tasarımın parçası gibi değil, kutuya yapıştırılmış çıkartma gibi duruyor.

## 2. Marka fikri, sıfatlar, alternatif yönler

**Fikir (tek cümle):** *"Haftik, haftanı krem kâğıda basılmış, mühürlü bir karneye çevirir; not yok, emoji var."*
Zemin kâğıt (krem), metin mürekkep (sıcak siyah), tek vurgu mühür moru. İmza iki öğeden oluşur: yuvarlak **HAFTİK mührü**
ve **karne çerçevesi** (bir kalın, bir ince çizgi). Emoji'yle yarışan süs kullanılmaz.

**Sıfatlar:** sıcak · esprili · derli toplu · yarı resmî (karne ciddiyetinin parodisi) · yargısız.

**Neden mor:** Karne bağlamında kırmızı öğretmen düzeltmesini, yeşil "geçti"yi çağrıştırır; ikisi de yargıdır. Mavi hem
Expo şablonunun hem de rakiplerin çoğunun rengi. Mor bu üçünden ayrışıyor, ıslak mühür çağrışımı taşıyor ve iyi/kötü
anlamı yok.

**Referans (K3, taklit yok):** Daylio'nun "Year in Pixels" görünümü günleri ruh haline göre renklendiriyor; bu, bizim bilerek
yapmadığımız şey. Spotify Wrapped'ten yalnızca *mekanik* alınıyor: kişisel veriden paylaşılabilir bir kimlik/unvan
üretmek ve dikey poster biçimi. Görsel dili (neon gradyan, büyük sayılar) alınmıyor.

| Yön | Fikir | Artı | Risk | Maliyet |
|---|---|---|---|---|
| **A — Karne kâğıdı** (öneri) | Krem kâğıt, mürekkep, mor mühür, çift çizgi | Ürün adıyla ve karne fikriyle örtüşüyor; yargısız; trend kokmuyor | Çekingen çizilirse "sade" kalır, mühürün cesur olması gerekir | M |
| B — Pazar gecesi | Koyu mor-lacivert zemin, parlayan emoji | Açılış anı dramatik | Wrapped'e fazla yakın; WhatsApp önizlemesinde basık görünür | M |
| C — Çıkartma albümü | Pastel zemin, beyaz kenarlı emoji | Genç ve eğlenceli | React Native'de pahalı; çocuksu; zemin rengi haftaya göre değişirse örtük yargı taşır | L |

**Öneri: A.** B'nin iyi yanı (dramatik açılış), A'da reveal sırasında mührün "basılması" olarak kullanılıyor (Bölüm 5).
Bir yıl sonra neden yanlış görünebilir? En olası cevap "fazla nostaljik" olması. Önlem: kâğıt dokusu, leke ya da
gerçekçi gölge kullanmamak; yalnızca düz renk, çerçeve ve mühür.

## 3. Token tablosu, tipografi, boşluk/yarıçap/gölge

Kontrast oranları WCAG 2.x göreli parlaklık formülüyle elle hesaplandı (K1). Ekranda ölçülmedi. Kategoriye ya da seviyeye
göre renk **yok**.

| Token | Açık | Koyu | Kullanım | Kontrast (açık / koyu) |
|---|---|---|---|---|
| `bg` | `#FBF7EF` | `#16131F` | Ekran ve kart zemini | — |
| `surface` | `#FFFFFF` | `#221E2E` | Kutu, satır grubu, sekme çubuğu | — |
| `surfaceSunken` | `#F3EDE2` | `#1C1827` | Kilitli kart, özet kutusu, devre dışı | — |
| `text` | `#1E1A14` | `#F4EFE6` | Başlık, gövde | bg **16,2** / **16,0**; surface 17,3 / 14,2; sunken 14,9 |
| `textSecondary` | `#6B6358` | `#ADA597` | Etiket, açıklama | bg **5,5** / **7,5**; surface 5,9 / 6,7; sunken 5,1 |
| `accent` | `#4B32C3` | `#A99BFF` | Seçili çerçeve, birincil buton, mühür, aktif sekme | bg **7,7** / **7,7**; surface 8,3 / 6,8 |
| `onAccent` | `#FFFFFF` | `#16131F` | Birincil buton metni | accent üzerinde **8,3** / **7,7** |
| `accentSoft` | `#ECE8FB` | `#2F2752` | Seçili dolgu | text 14,4 / 12,0; accent 6,9 / 5,8 |
| `line` | `#E6DFD2` | `#332D42` | Ayraç (dekoratif) | — |
| `danger` | `#B42318` | `#FF8A80` | Yalnızca "Tüm verilerimi sil" | bg **6,2** / **8,0** |

**Kart her zaman açık temada (kâğıt) çizilir.** Paylaşılan PNG'nin görünümü kullanıcının koyu mod ayarına bağlı olmamalı.
B14 için "açık temaya kilitle" kararı verilirse koyu sütun ileride kullanılmak üzere kalır.

**Tipografi (Inter, OFL lisanslı).** Şu an paketli ağırlıklar: 400, 400 Italic ve 700. Öneri: yalnızca unvan için 800
ExtraBold eklemek. Kabuk da Inter'e geçmeli.

| Token | Boyut/satır | Ağırlık | Nerede |
|---|---|---|---|
| `display` | 32/38, `letterSpacing -0.4` | 800 | Kart unvanı (İ/Ş/Ğ için üstte ve altta en az 4px pay) |
| `title` | 28/34 | 700 | Ekran başlıkları |
| `heading` | 17/22 | 700 | Kategori ve bölüm etiketleri |
| `body` | 16/22 | 400 | Gövde (kart satırı 15/20 olarak kalır) |
| `caption` | 13/18 | 400 | Açıklama, seviye adı |
| `label` | 12/16, `letterSpacing +0.8` | 700 | Mühür, "HAFTA KARNESİ", "ÖRNEK". Büyük harf `toLocaleUpperCase('tr-TR')` ile yapılır (HAFTİK), `textTransform` ile değil |

**Boşluk:** 4'lük ızgara (`4 · 8 · 12 · 16 · 24 · 32 · 48`); ekran kenarı 24 (mevcut, dikey bütçe değişmez).
**Yarıçap:** `sm 8` (çip) · `md 14` (kutu, buton) · `lg 20` (kart kabı) · `full` (nokta, mühür).
**Gölge:** Varsayılan `e0`, gölgesiz. Tek istisna `e1`: yalnızca kart ekranındaki kart (Android `elevation 3`; iOS
`opacity 0.10`, `radius 12`, `y 4`). Koyu temada gölge yerine 1px `line` çerçeve. **Çizgi:** 1 / 2 / seçili durumda 2,5.

## 4. Kart kompozisyonu (360x640 → 1080x1920)

| Bölüm | y (mantıksal) | İçerik |
|---|---|---|
| Üst (56) | 0-56 | Çerçeve: dış çizgi 2px `accent`, kenardan 12px içeride; iç çizgi 1px `accent` %40, 17px içeride, köşe yarıçapı 14. y 30-46 arasında ortalı `label` "HAFTA KARNESİ" |
| Unvan (88) | 56-144 | `display`, en fazla 2 satır. Altında (y 150) 40px genişliğinde 2px `accent` kısa çizgi |
| Ara (16) | 144-160 | — |
| Satırlar (4×68) | 160-432 | 26px emoji, 40px çapında `surfaceSunken` bir dairenin içinde; her satırda **aynı** nötr daire. Metin 15/20 |
| Ara (20) | 432-452 | — |
| Özet (56) | 452-508 | `surfaceSunken` zeminli kutu (mevcut `SummaryTextLayout` ölçüleri) |
| Ara (8) | 508-516 | — |
| Altbilgi (76) | 516-592 | Solda "Haftik" (16/800) ve altında bağlantı (12px `textSecondary`, 5,5:1; bugünkü %65 opak 11px metinden daha okunur). Sağda **mühür**: 64px, -8° döndürülmüş, `accent` renkli çift halka, ortasında "HAFTİK / KARNE" |
| Alt (48) | 592-640 | Çerçeve payı |

- Zemin 360x640'ın tamamı kâğıt rengi; PNG'de saydam köşe yok. **Tarih ve hafta numarası yok** (spec güvenlik
  gereksinimi 3). Mühür `View` + `borderRadius` + `rotate` ile çizilir; `react-native-svg` kurulu değil, yeni bağımlılık
  gerekmiyor.
- `layout.ts` ve `layout.test.ts` beklentileri değişecek. Bu bir tasarım değişikliği; testi koda uydurmak değil. Batuhan
  onayıyla `kart-yerlesimi.md` ile birlikte güncellenmeli.
- **Story:** Kritik içerik (unvan, satırlar, özet) 168-1524px bandında. Altbilgi (1548-1776px) Story'nin yanıt çubuğunun
  altında kalabilir; bağlantı ikincil olduğu için kabul edilebilir (K3 rehber, ölçülmedi).
  **WhatsApp önizlemesi** (ölçek ≈0,23): unvan ≈22px ile okunur, satırlar okunmaz. Yani küçük önizlemede görünen yalnızca
  unvan, mühür ve mor çerçeve; bu yüzden unvanın görünür olması görsel açıdan da birinci öncelik.

**Unvan `???` olduğunda (S2 mekanizmasından bağımsız, yalnızca görsel katman).** Her seçenekte iki kural korunur: gerçek
metin render ağacına girmez ve yer tutucunun genişliği gerçek metnin uzunluğunu ele vermez (sabit genişlik).

| Seçenek | Görünüm | Değerlendirme | Maliyet |
|---|---|---|---|
| **V1 — Sansür şeridi** (öneri) | Unvan yerine sabit genişlikte (240 ve 160px) iki yuvarlak uçlu `text` rengi şerit ve üzerinde küçük bir `accent` "GİZLİ" etiketi. Gizli satırlar da aynı dilde: tek şerit (`textSecondary` %35) ve boş emoji dairesi | Hata gibi değil, "bilerek kapattım" gibi okunur. Karnede notu elle kapatma esprisine uyar | S |
| V2 — Markalı soru işareti | 56px/800 `accent` renkli `???`, altında "bu hafta sır" (metni copywriter yazar) | En ucuzu; ama hâlâ "eksik" hissi veriyor | S |
| V3 — Unvansız düzen | Unvan yerine görünür kategorilerin emojileri 48px boyutunda dizilir | Kart dolu görünür ama iki ayrı düzen iki kat QA demek | M |

**Öneri: V1, ürün tarafındaki S2(a) kararıyla birlikte.** V1 tek başına unvan kancasını geri getirmez, yalnızca `???`
anını çirkin olmaktan çıkarır. H1 testine V1'li bir PNG de eklenmeli.

## 5. Ekran cilası ve hareket

**Durumlar (tüm ekranlarda aynı).**

| Durum | Görünüm |
|---|---|
| Normal | `surface`, `md 14` yarıçap |
| Seçili | `accentSoft` dolgu, 2,5px `accent` çerçeve ve sağ üstte 18px ✓ rozeti. Seçili olduğu renk, şekil ve ikonla birlikte anlaşılır |
| Pasif (aynı satırda başka seçim var) | Emoji %50 opak. Devre dışı gibi görünmez |
| Basılı | 90 ms içinde `scale 0.96` |
| Devre dışı | `surfaceSunken` zemin ve `textSecondary` metin |
| Odak | 2px `accent` dış halka |

**Ekran bazında:**
- **Bugün:** Kutular 72dp olarak kalır. "Kaydet" `accent` renkli ve 52dp. Kaydettikten sonra buton "Kaydedildi" ve ✓
  gösterir, 1,2 sn sonra eski hâline döner (metni copywriter yazar).
- **Hafta:** Dolu günler 14px `accent` nokta, boş günler 1,5px `line` halka, bugün `accent` halka. Kilitli kart gri
  iskelet yerine **kartın minyatürü** olarak çizilir (kâğıt, çerçeve, mühür silueti, V1 şeritleri). Kilit açılınca mühür
  dolar ve nabız gibi atar.
- **Ayarlar:** Seçilmemiş saat çipleri bugün soluk ve devre dışı gibi görünüyor (`s06`). Metinleri `text` rengine
  çekilmeli. Switch rengi `accent`. Silme düğmesinde pembe dolgu yerine `surface` zemin, 1px `danger` çerçeve ve `danger`
  metin.
- **Onboarding:** Hafif eğik, "ÖRNEK" damgalı bir mini kart (S4 kararına bağlı).
- **Önizleme:** Liste yerine gerçek `CardView` küçültülmüş olarak gösterilir. Bu bir akış değişikliği; önce ui-ux-designer
  bakmalı.
- **Sekmeler:** Emoji yerine çizgi ikonlar kullanılır. Aktif sekme `accent` ve dolu ikon, pasif sekme `textSecondary`.

**Hareket.** Yalnızca `opacity` ve `transform` animasyonları, RN `Animated` ile ve `useNativeDriver: true`.

| An | Süre / easing | Azaltılmış hareket açıkken |
|---|---|---|
| Seçim rozeti | 160 ms, `out(back(1.4))`, 0.6'dan 1'e | 120 ms, yalnızca opaklık |
| Kaydet onayı | 180 ms giriş, 1,2 sn bekleme, 160 ms çıkış | Yalnızca opaklık |
| **Reveal** | Zemin anında kâğıt rengine geçer (bugünkü 0,36-0,80 sn'lik beyaz boşluk kalkar). Sonra kart 240 ms'de yukarı kayar (`out(cubic)`), unvan belirir, satırlar 80 ms arayla gelir, en son **mühür basılır**: 1.5'ten 1'e ölçek, -16°'den -8°'ye dönüş, 220 ms, `out(back(1.6))`. Toplam ≈1,3 sn | Tek bir 150 ms geçiş |
| Mühür nabzı (Hafta) | 1.00 → 1.04 → 1.00, 1400 ms, `inOut(sine)`, ekrandan çıkınca `stop()` | Hareket yok |

Azaltılmış hareket tercihi tek bir hook'tan okunur: `useReducedMotion` (`AccessibilityInfo`). PNG yakalaması son kareden
yapılır, animasyon sonucu etkilemez. CLAUDE.md'de yazan Animated/`unmount` tuzağı bu animasyonlar için de geçerli.

## 6. Uygulama ikonu, splash, küçük boyut okunurluğu

**Gerekçe:** İkon, kartın imzası olan mühürün kendisi. İçinde "H" harfi var ve H'nin orta çizgisi **gülümseme eğrisi**:
aynı işaret hem "Haftik"in baş harfi hem de bir emoji yüzü gibi okunuyor. Mor zemin üzerinde kâğıt rengi, düz vektör, gradyan
yok. Tamamı kendi çizimim, lisans sorunu yok.

**Adaptive ön plan** (108x108dp tuval; güvenli alan r=33 dp daire; çizimin dış sınırı r=31 → güvenli alanın içinde):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="432" height="432">
  <g transform="rotate(-8 54 54)" fill="none" stroke="#FBF7EF" stroke-linecap="round">
    <circle cx="54" cy="54" r="29" stroke-width="4"/>
    <circle cx="54" cy="54" r="23.5" stroke-width="1.5"/>
    <path d="M44 41V67M64 41V67" stroke-width="6"/>
    <path d="M44 52Q54 62 64 52" stroke-width="5"/>
  </g>
</svg>
```
- **Arka plan:** `<svg viewBox="0 0 108 108"><rect width="108" height="108" fill="#4B32C3"/></svg>`. Alternatif olarak
  `app.json` içinde `adaptiveIcon.backgroundColor: "#4B32C3"` verip arka plan görselini kaldırmak yeterli.
- **Monochrome:** Ön planla aynı SVG, yalnızca `stroke="#000000"` (Android saydamlığa göre tonlar).
- **Klasik ikon / iOS 1024 / Play 512** (tam kare, saydamlık yok): `viewBox="6 6 96 96"` ile, önce
  `<rect x="6" y="6" width="96" height="96" fill="#4B32C3"/>`, ardından ön plandaki `<g>` bloğu. Mühür kareyi ~%70 doldurur.
- **Splash:** `backgroundColor #FBF7EF`, görsel olarak `stroke #4B32C3` ile çizilmiş mühür, `imageWidth 120`. Koyu mod için
  `dark: { backgroundColor #16131F, mühür #A99BFF }`. Android 12+'nın dairesel maskesine sığıyor.
- **Küçük boyut (hesap, K1):** 48dp başlatıcıda 1 birim ≈ 0,67dp. H çizgisi ≈4dp, gülümseme ≈3,3dp, dış halka ≈2,7dp,
  iç halka ≈1dp. mdpi'de iç halka kaybolabilir; kaybolunca işaret tek halka ve H olarak kalır, kabul edilebilir.
  **Bildirim simgesi:** Bugün uygulama ikonu kullanıldığı için gri kare görünme riski var. Monochrome mührün beyaz bir
  96px PNG'si gerekiyor; `expo-notifications` eklentisi bilerek eklenmediği için yolu mobile-platform-specialist seçmeli.

## 7. Mağaza grafikleri

- **Tanıtım görseli (1024x500):** `bg` kâğıt zemin. Sol %55'te 120px mühür, "Haftik" (72px/800) ve slogan (32px,
  `textSecondary`; örn. "Her gün 8 saniye. Her pazar bir karne.", metni copywriter kesinleştirir). Sağda iki kart, -6° ve
  +4° eğik, ~180x320: biri unvanlı, biri V1 şeritli; içerik uydurma örnek. Metinler kenarlardan 50px içeride. Cihaz
  çerçevesi, "#1" gibi iddialar ve sağlık sözcükleri yok (S12).
- **Ekran görüntüleri (1080x1920 × 5):** Kâğıt zemin, üstte 420px'lik başlık alanı (64px/800), altında 24px yarıçaplı
  ekran görüntüsü. Sıra: 1) kart, 2) 8 saniyelik kayıt, 3) Pazar 20:00 kilidi, 4) gizle/önizle, 5) veri cihazda kalır.
  Görüntüler **Android'den** alınmalı (Noto emoji, açık lisans; Bölüm 9) ve geliştirici menüsüyle hazırlanmış uydurma
  veri kullanılmalı.

## 8. Uygulama önerisi (dosya bazında)

| Dosya | Değişiklik | Boy | Kim |
|---|---|---|---|
| `src/constants/theme.ts` | Bölüm 3 token'ları (mevcut anahtarlar korunur, `accent*`, `line`, `danger` eklenir) | S | mobile-engineer |
| `src/card/fonts.ts`, `src/app/_layout.tsx` | Inter kabuk genelinde yüklenir, 800 alt yoldan eklenir | S | mobile |
| `src/card/CardView.tsx`, `layout.ts` (+ `kart-yerlesimi.md`, `layout.test.ts`) | Kâğıt zemin, çerçeve, mühür, V1 şeritleri | M | mobile (Batuhan onayı) |
| `category-picker.tsx`, `checkin-form.tsx` | Seçili/pasif/basılı durumları, ✓ rozeti, Kaydet onayı | M | mobile + copywriter |
| `week-dots-row.tsx`, `locked-card-placeholder.tsx`, `week-status-view.tsx` | Noktalar, kartın minyatürü, sabit renklerin kaldırılması (B14) | M | mobile |
| `settings-view.tsx` | Çipler, switch, silme düğmesi | S | mobile |
| `CardRevealView.tsx` + yeni `useReducedMotion` | Anında kâğıt zemin, mühür animasyonu | S-M | mobile, ölçüm performance-engineer |
| `card-preview-view.tsx` | Gerçek `CardView` önizlemesi | M | önce ui-ux-designer |
| `src/app/(main)/_layout.tsx` | Vektör sekme ikonları (yeni bağımlılık kararı gerekiyor) | S | mobile |
| `assets/images/*`, `app.json` | Bölüm 6'daki SVG'lerin PNG'ye aktarılması (48, 96, 192, 432, 512, 1024), splash | S | mobile |

**Kontrast ön kontrolü:** `__tests__/constants/contrast.test.ts` token'lardan oranları hesaplayıp metin için ≥4,5, UI
öğeleri için ≥3 olduğunu doğrular (test-automation-engineer). **Kabul ölçütü:** 01'deki H5 testi, yani önceki/sonraki
görüntülerle 5 kişiye sorulan "bitmiş ürün mü?" sorusu.

## 9. Lisans

- **Inter:** SIL OFL 1.1, zaten paketli. OFL metni depoda (`LICENSES/`) ya da uygulamanın "Lisanslar" satırında yer almalı.
- **Sekme ikonları:** `@expo/vector-icons` projede **kurulu değil**. Seçenekler: (a) `npx expo install
  @expo/vector-icons` ile Ionicons (MIT; statik font, ağ erişimi yok, yine de kontrol edilmeli), (b) Bölüm 6'dakiyle aynı
  yöntemle çizilmiş 3 PNG ikon. **Öneri: (a).**
- **Emoji:** Uygulama içinde sistem fontu kullanılıyor, sorun yok. Mağaza görsellerinde Android Noto Color Emoji (OFL 1.1)
  kullanılmalı; Apple emoji görsellerinin pazarlamada kullanımı riskli.
- **İkon ve mühür** kendi çizimim. Spotify'a ait hiçbir varlık, renk ya da yazı tipi kullanılmıyor.

## 10. Doğrulanamayanlar

- Kontrast oranları yalnızca hesaplandı (K1). Emülatörde ve gerçek cihazda ölçülmedi (K4/K5). Koyu tema hiç görüntülenmedi.
- SVG'ler PNG'ye çevrilip 48/192/512px'te yan yana görüntülenmedi. İkonun mağazada ayrışıp ayrışmadığı ve benzer mor mühür
  ikonların olup olmadığı taranmadı. **Mağazaya çıkmadan önce yapılması şart.**
- Story ve WhatsApp güvenli alan oranları yaygın rehberlere dayanıyor (K3); gerçek hedef uygulamalarda denenmedi.
- Mühür animasyonunun ve nabzın gerçek cihazda kare düşürüp düşürmediği ölçülmedi (ölçümü performance-engineer yapmalı).
- Inter 800'ün paket boyutuna etkisi (~300 KB olduğu tahmin ediliyor) ölçülmedi.
- Tasarım henüz uygulanmadı, bu yüzden "uygulanan sonuç belirtimle uyuşuyor mu" denetimi yok (protokol adım 8).

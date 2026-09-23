# Kart Yerleşimi — 360x640 mantıksal (9:16), çıktı 1080x1920 (U0)

Kaynak: `spec.md` "Tasarım ilkeleri" (s.59-62), "Veri modeli > weekly_card"
(s.136-149), "MVP kapsamı" (s.280), `src/domain/types.ts` (`CardSnapshot`:
`title`, `lines` (4, Record<Category,...>), `deltas`, `summary`), `plan.md`
S7a. Tüm ölçüler mantıksal 360x640 birimde verilir; çıktı PNG'de **x3**
(1080x1920) ölçeklenir — font/kalınlık değerleri de aynı oranda büyür.

## Genel yerleşim (üstten alta)

```
360px genişlik
+------------------------------------------+  y=0
|                                          |
|              [ üst boşluk 48 ]           |
|                                          |
|              DENGELİ ADIMCI              |  <- unvan, y≈48-140
|                                          |
|  ──────────────────────────────────────  |
|  🚶  Ne maraton ne mola, tam ortası bir  |  <- satır 1: hareket
|      tempo.                              |     y≈164-236
|  ──────────────────────────────────────  |
|  😴  Yastığınla resmen kader birliği     |  <- satır 2: uyku
|      yaptınız.                           |     y≈236-308
|  ──────────────────────────────────────  |
|  💳  Ne cimri ne çılgın, tam kararında   |  <- satır 3: harcama
|      harcadın.                           |     y≈308-380
|  ──────────────────────────────────────  |
|  🎉  Bu hafta çevrende adeta bir         |  <- satır 4: sosyal
|      kutlama vardı.                      |     y≈380-452
|  ──────────────────────────────────────  |
|                                          |
|     ( Bu hafta çoğu kategori güçlü )     |  <- özet, y≈492-540
|                                          |
|                                          |
|  Haftalık Hayat Karnesi · [mağaza/QR]    |  <- damga, y≈580-620
+------------------------------------------+  y=640
640px yükseklik
```

## Bölüm bölüm ölçüler ve gerekçeler

| Bölüm | y aralığı (mantıksal) | Font/boyut | Gerekçe |
|---|---|---|---|
| Üst boşluk | 0-48 | — | Instagram Story gibi paylaşım hedeflerinde ekranın üst kısmı genelde sistem/uygulama arayüzüyle (kullanıcı adı, saat) örtüşür; kartın en üst satırı (unvan) bu bölgeye çok yakın basılırsa kırpılma/örtülme riski artar. |
| Unvan | 48-140 (92px) | 30px bold, ortalı, max 2 satır, satır yük. 36px | Kartın "hook"u ve en büyük fontu; reveal anında ilk okunan eleman (bkz. `ekran-akisi.md` "wow anı"). Büyük punto = ekran görüntüsünde küçük telefon ekranında bile okunur kalması. |
| Ayraç boşluk | 140-164 (24px) | — | Unvan ile satırları görsel olarak ayrı gruplar halinde okutmak için. |
| 4 kategori satırı | 164-452 (4x72px) | emoji 26px + metin 15px regular, satır yük. 20px, max 2 satır/hücre | Her satır: `[emoji][12px boşluk][metin]`, dikey ortalanmış; satır arası 1px, %12 opak ayraç çizgisi. 72px, 60 karakterlik bir metnin 2 satıra rahat sarılmasına yeter (bkz. aşağıdaki "60 karakter" notu). Sıra sabit: hareket→uyku→harcama→sosyal (spec `checkin` alan sırası ve `CATEGORIES` sabiti ile birebir), kullanıcı her kartta aynı sırayı öğrenir. |
| Ayraç boşluk | 452-492 (40px) | — | Satır bloğunu özet bloğundan ayırmak; özet farklı bir görsel ağırlıkta (aşağıda). |
| Özet | 492-540 (48px) | 16px italic, ortalı, max 2 satır, hafif dolgu (pill: köşe yarıçapı 12px, arka plan %8 opak vurgu tonu) | İtalik + hafif dolgu, özetin "yorum" olduğunu (tek tek satırlardan farklı bir sentez olduğunu) görsel olarak ayırır; kalın çizgi/çerçeve yerine yumuşak dolgu tercih edildi çünkü bu bir uyarı değil, hafif bir kapanış notu. |
| Boşluk | 540-580 (40px) | — | Damga, satır/özet metinlerine "yapışık" görünmesin diye. |
| Damga | 580-620 (40px) | 11px, %65 opaklık | Görünür ama baskın değil — marka görünürlüğü ile içerik dikkatinin dengesi (asıl paylaşılan şey unvan+satırlar, damga onun yanında sessiz bir imza). |
| Alt boşluk | 620-640 (20px) | — | Ekran/kırpma güvenlik payı. |

**60 karakterlik satır sınırı ile yerleşim uyumu:** `content/tr.ts` metin
havuzundaki satırlar spec kuralı gereği ≤60 karakter (birim testiyle
denetleniyor). 296px metin genişliğinde (360 - 2x32 kenar boşluğu), 15px
fontta bu iki satıra rahatça sığar (gözlemlenen gerçek içerik örnekleri —
ör. "Ne maraton ne mola, tam ortası bir tempo." — zaten 1-2 satırda kalıyor);
72px satır yüksekliği bu iki satırlık üst sınırı zaten hesaba katıyor, satır
taşması riski yok.

## Renk ve görsel dil kararları (gerekçeli)

- **Seviyeye göre renk kodlaması (kırmızı=düşük, yeşil=yüksek vb.) yok.**
  Çünkü spec açıkça "sıralı yoğunluk, iyi/kötü değil" diyor (s.107); renk
  kodlamak örtük bir "başarı/başarısızlık" okuması dayatır ve ton kuralını
  ("tanısız, tavsiyesiz") ihlal eder. Tüm satırlar aynı nötr renk paletinde.
- **Emoji, her satırın tek görsel ayırt edicisi.** Metin+emoji birlikte
  kategoriyi tanımlar; ayrıca bir kategori ikonu/etiketi (ör. "HAREKET"
  yazısı) eklenmedi çünkü emoji zaten check-in ekranından tanıdık, tekrar
  metin etiketi eklemek satır başına gereksiz yer kaplar.
- **Arka plan sade/tek tonlu (veya çok hafif tek renkli gradient), kategori
  başına farklı arka plan rengi yok.** Kategoriye özel renk bandı, "hangi
  kategori önemli/vurgulu" gibi yanlış bir hiyerarşi izlenimi verebilir;
  kart tek bir bütün olarak okunmalı.
- **Emoji seti kartta ve check-in ekranında birebir aynı** (bkz.
  `emoji-seti.md`) — kullanıcı check-in'de seçtiği sembolü kartta tekrar
  görüp "bu benim seçimim" bağlantısını anında kurar.

## Gizli satır durumu (görsel, `ekran-akisi.md` Ekran 5 ile bağlantılı)

Bir satır gizlendiğinde metin alanı `???` ile değişir, **satır yüksekliği
(72px) ve emoji aynı kalır** — yerleşim zıplamaz, yalnızca metin içeriği
değişir. Gerekçe: gizli/açık satırların karışık bir kartta tutarlı bir
"iskelet" görünümü koruması; kullanıcı hangi kategorilerin var olduğunu
(gizli olsa bile) hâlâ görür, yalnızca içeriği göremez.

## Gömülü damga + mağaza bağlantısı yeri (E5 ile bağlantılı)

- Damga metni **CardView'in içine gömülü çizilir** (spec: kullanıcının
  kapatabileceği bir katman değil); v1'de kesin ad/URL yok, yer tutucu:
  `Haftalık Hayat Karnesi · [mağaza bağlantısı]` (K4/K5 kapıları S12'de
  kesinleşince gerçek ad/URL ile değiştirilir, `src/config/constants.ts`
  tek kaynak).
- Tek konum (alt-orta) tercih edildi; ikinci bir köşe damgası (kırpma
  riskine karşı yedek) **eklenmedi** — değerlendirildi ama elendi: iki
  damga kartı kalabalıklaştırır ve spec zaten kırpılmaya karşı garanti
  vermiyor ("Kırpılmaya karşı garanti verilmez", E5); tek sade damga
  tercih edilen çözüm.
- Görsel içindeki metin **tıklanamaz** (PNG); bağlantı yalnızca paylaşım
  mesajının metninde (varsa) taşınır — bu bir ürün sınırı, tasarım hatası
  değil (E5).

## Kilitli kart yer tutucusu (küçültülmüş önizleme)

`ekran-akisi.md` Ekran 3'te kullanılan kutu, bu yerleşimin **aynı oranlı
(9:16) ama gerçek `CardView` olmayan** bir iskelet versiyonudur:

```
200x356 (≈%55 ölçek)
+----------------------+
| ░░░░░░░░░░░░░░░░░░░░ |  <- unvan yerine gri blok (genişlik ~%60, ortalı)
| ░░░░░░░░░░░░░░░░░░░░ |
|                      |
| ░░  ░░░░░░░░░░░░░░░  |  <- 4x satır: emoji-boyutunda daire + metin bloğu
| ░░  ░░░░░░░░░░░░░░░  |
| ░░  ░░░░░░░░░░░░░░░  |
| ░░  ░░░░░░░░░░░░░░░  |
|                      |
|    ░░░░░░░░░░░░      |  <- özet yerine kısa gri pill
|                      |
|         🔒           |
+----------------------+
```
- Gri blokların konumu/oranı gerçek yerleşimle (unvan/4 satır/özet) eşleşir
  ki kullanıcı "bir kart geliyor, şekli bu" bilgisini sezgisel olarak alsın
  — ama **hiçbir gerçek metin/emoji çizilmez**, tamamen ayrı, sabit bir
  bileşendir (bkz. `ekran-akisi.md` "Kilitli kart görsel dil özeti" —
  gerçek `CardView`'i render edip üstüne blur koymak yerine ayrı iskelet
  bileşeni, sızıntı riskini mimari olarak yok eder).
- Kilit ikonu ortada, kutunun geri kalanının üstünde hafif karartma
  (%20 siyah overlay) ile — "burada bir şey var ama erişemiyorsun" hissi.

## Elenen alternatifler (kısaca, gerekçeli)

- **Kategori başına renkli arka plan bandı:** elendi, "iyi/kötü" örtük
  hiyerarşi riski (yukarıda).
  **Konfeti/parlama efekti reveal'da:** elendi (bkz. `ekran-akisi.md`
  "dışarıda bırakılanlar") — sadelik, damga/metin dikkatini bölmesin.
- **İkinci köşe damgası:** elendi, kalabalıklaştırır, spec zaten kırpma
  garantisi vermiyor.
- **Kategori etiket metni (ör. "HAREKET" başlığı) her satırın üstünde:**
  elendi, emoji zaten check-in'den tanıdık; ekstra metin satır başına yer
  kaplar, 4 satırın toplam yüksekliğini artırıp unvan+özet için kalan alanı
  daraltır.

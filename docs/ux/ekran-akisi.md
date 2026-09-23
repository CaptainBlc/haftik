# Ekran Akışı — Haftalık Hayat Karnesi (U0)

Kaynak: `spec.md` ("Ana akışlar" s.39, "MVP kapsamı" s.273), `plan.md` (U0, s.130-135).
Bu dosya kodsuz bir tasarım çıktısıdır; metin wireframe'ler kutu/buton/metin
düzeyindedir, piksel doğruluğu iddiası taşımaz (piksel ayrıntısı için
`kart-yerlesimi.md`).

## Tek "wow anı" — v1'in merkezi

**Ne:** Pazar 20:00 sonrası, kullanıcı kilitli kartına dokunduğunda kartın
kilidinin açılıp unvanın+4 satırın+özetin sırayla (staggered) ortaya çıktığı
**kart açılış anı**. Kullanıcının ekran görüntüsü alıp paylaşacağı an tam
olarak budur — bir ayarlar menüsü, bir istatistik grafiği değil.

**Neden bu an, çünkü:**
- Haftanın tamamının tek bir "sonuç" a dönüştüğü tek nokta burası; check-in
  ekranı sıkıcı bir günlük görev, kart ekranı ödülü.
- Fiziksel bir karne/zarf açma ritüeline benzer aşamalı ortaya çıkış (aşağıda
  "Reveal animasyonu"), tek seferde her şeyi basmaktan daha akılda kalıcı ve
  "bunu ekran görüntüsü almaya değer" hissi yaratıyor.
- Haftada yalnızca bir kez olur (spec: kart dondurulur, tekrar açılınca aynı
  görsel) — nadir olduğu için özel kalır, enflasyon riski yok.

**Reveal animasyonu (gerekçeli):**
1. Kilitli kart yer tutucusuna dokunma (veya "kartın hazır" bildirimine
   dokunma) → (varsa Pazar check-in yönlendirmesi araya girer, bkz.
   `pazar-akisi.md`).
2. Yükleme/spinner **yok** — çünkü `buildCard` cihazda milisaniyeler sürer;
   yapay bir bekleme "wow" anını söndürür, gecikme hiçbir fayda sağlamaz.
3. Blur→net geçiş (~400ms crossfade): kilitli kartın bulanık hali netleşir.
   Çünkü kullanıcı bir önceki ekranda zaten "meraklandı", burada ödül anı
   görsel olarak da "netleşme" ile hissettirilir.
4. İçerik aşamalı belirir: önce unvan (fade+scale, ~150ms), sonra 4 satır
   sırayla (her biri ~80ms arayla, hareket→uyku→harcama→sosyal sırasıyla),
   en son özet satırı. Toplam ~1,2 sn. Çünkü tek seferde her şeyi basmak
   "liste okuma" hissi verir; aşamalı açılış "açılan bir zarf" hissi verir.
5. Herhangi bir dokunuşla animasyon anında tamamlanır (atlanabilir). Çünkü
   aynı haftanın kartını ikinci/üçüncü kez açan kullanıcıyı bekletmemek
   gerekir — "wow" yalnızca ilk görüşte değerlidir, tekrarında sürtünmeye
   dönüşmemeli.

## Ekran 1 — Onboarding (hedef: 10-15 sn, 3 dokunuş)

Gerekçe: her ekstra adım terk oranını artırır (görev talimatı); onboarding'de
"tur/carousel" yok, doğrudan değer önermesi + gerekli iki izin/uyarı + ilk
check-in'e geçiş.

**1a — Karşılama**
```
+-----------------------------------+
|                                   |
|        [ikon/wordmark]           |
|                                   |
|   Her gün 8 saniye. Her pazar     |
|   bir karne.                     |
|                                   |
|   Hareket, uyku, harcama, sosyal— |
|   haftanı emojiyle anlat, pazar   |
|   akşamı sonucu gör.             |
|                                   |
|         [   Başla   ]            |
+-----------------------------------+
```
Gerekçe: tek cümlelik değer önermesi + tek buton. Özellik listesi yok —
kullanıcı 3 saniyede "bu ne işe yarar" sorusuna cevap bulmalı.

**1b — Gizlilik güvencesi (tek ekran, doğru an)**
```
+-----------------------------------+
|   Verilerin yalnızca bu telefonda |
|   kalır.                         |
|                                   |
|   Hesap yok, bulut yok. Telefon   |
|   değişirse veri taşınmaz.        |
|                                   |
|      [  Anladım, devam  ]        |
+-----------------------------------+
```
Gerekçe: uyku/hareket gibi hassas kategoriler var (bkz. spec Güvenlik
gereksinimleri); güven mesajı ilk veri girmeden önce, tek satırda, teknik
jargon olmadan verilir. Ayrı bir "gizlilik politikası oku" adımı zorunlu
değildir (ayarlardan her zaman erişilebilir) — zorunlu tutulursa onboarding
uzar.

**1c — Bildirim izni (doğru an: hemen check-in öncesi, boş bir ekranda değil)**
```
+-----------------------------------+
|   Her gün hatırlatalım mı?        |
|                                   |
|   Akşam 21:00'de "bugünü işaretle"|
|   diye bir hatırlatma göndeririz. |
|   İstediğin an kapatabilirsin.    |
|                                   |
|   [  İzin ver  ]   [  Şimdi değil ]|
+-----------------------------------+
```
Gerekçe: sistem izin diyaloğu bağlamsız açılırsa reddedilme oranı yüksek
olur; burada "neden soruyoruz" önce metinle açıklanır, sonra sistem
diyaloğu tetiklenir. "Şimdi değil" akışı bozmaz, kullanıcı Ayarlar'dan
sonra açabilir.

**Onboarding sonu → doğrudan Ekran 2'ye (check-in) geçilir**, ayrı bir
"tebrikler, hazırsın" ekranı eklenmez (ekstra tıklama = ekstra terk).

## Ekran 2 — Bugün (günlük check-in, hedef ~8 sn)

```
+-----------------------------------+
| < 23 Eylül, Çarşamba              |
|                                   |
| Hareket                           |
|  [ 🐢 ]   [ 🚶 ]   [ 🏃 ]          |
|                                   |
| Uyku                              |
|  [ 😪 ]   [ 😌 ]   [ 😴 ]          |
|                                   |
| Harcama                           |
|  [ 🐷 ]   [ 💳 ]   [ 💸 ]          |
|                                   |
| Sosyal                            |
|  [ 👤 ]   [ 👥 ]   [ 🎉 ]          |
|                                   |
|         [    Kaydet    ]          |
+-----------------------------------+
```
- Kategori sırası spec/`types.ts` ile birebir: hareket → uyku → harcama →
  sosyal.
- Seçili emoji: kalın çerçeve + hafif dolgu rengi; diğer ikisi soluk. Seçim
  tek dokunuşla değişir (yanlış basınca yeniden dokunup düzeltilebilir).
- "Kaydet" dördü de seçilene kadar **devre dışı** (gri, dokunulamaz) —
  gerekçe: spec "kısmi kayıt yok, dört kategorinin dördü de seçilince dolu
  gün sayılır"; UI bu kuralı buton durumuyla önceden gösterir, kullanıcı
  Kaydet'e basıp "eksik" hatası almaz.
- Üstte `<` ile bugün/dün arası geçiş (spec: düzenleme penceresi bugün ve
  dün); daha eski gün için bu ok görünmez/pasif.
- Hedef 8 sn = 4 kategori dokunuşu + 1 Kaydet dokunuşu; ekstra onay diyaloğu
  yok (Kaydet = kesin kayıt, geri almak istenirse tekrar açıp değiştirilir).

## Ekran 3 — Hafta durumu (kilitli kart yer tutucusu dahil)

```
+-----------------------------------+
|  Bu hafta                         |
|  Pzt  Sal  Çar  Per  Cum  Cmt  Paz|
|  ●    ●    ●    ○    ○    ○    ○  |
|                                    |
|  Kartın için 1 gün daha lazım.     |
|                                    |
|  +---------------------------+    |
|  |  ░░░░░░░░░░░░░░░░░░░░░░░  |    |
|  |  ░░░░░░  🔒  ░░░░░░░░░░░  |    |
|  |  ░░░░░░░░░░░░░░░░░░░░░░░  |    |
|  |  ░░░░░░░░░░░░░░░░░░░░░░░  |    |
|  +---------------------------+    |
|      Pazar 20:00'de açılıyor      |
+-----------------------------------+
```
- Dolu gün göstergesi: 7 nokta (Pzt-Paz), dolu = koyu dolu daire, boş =
  boş çember. Basit ve tek bakışta okunur; sayı yerine görsel ilerleme.
- "Kartın için X gün daha lazım" metni `requiredDays - filledDays`'ten
  türetilir (ilk kartta eşik 3, sonrasında 4 — spec E4b).
- **Kilitli kart yer tutucusu**, gerçek kartla aynı 9:16 oranında küçültülmüş
  bir önizleme kutusu olarak gösterilir (ayrıntı: aşağıda ve
  `kart-yerlesimi.md`):
  - Bulanık/gri "iskelet" şekiller (unvan/satır/özet konumlarını taklit
    eden dolgu bloklar) — gerçek metin **hiç çizilmez** (spec: "yer tutucu
    içerikle; gerçek metin çizilmez"). Bu yalnızca görsel bir taahhüt değil,
    veri akışı seviyesinde de doğru: bu ekran `buildCard`'ı hiç çağırmaz.
  - Ortada kilit ikonu (🔒 yerine sabit bir vektör ikon kullanılabilir —
    bu ikon karta gömülmez, yalnızca uygulama arayüzü elemanıdır).
  - Alt satır: eşik dolu ama saat gelmediyse "Pazar 20:00'de açılıyor";
    eşik dolu değilse "Kartın için X gün daha lazım" (üstteki metinle aynı,
    tekrar burada da gösterilir çünkü kullanıcı doğrudan bu kutuya
    odaklanabilir).
- Kilitli kutuya dokunma: eşik+saat sağlanmadıysa **hiçbir şey açılmaz**
  (hafif bir "shake" geri bildirimi + aynı metin); sağlandıysa kart açılış
  akışı başlar (bkz. Ekran 4, `pazar-akisi.md`).

## Ekran 4 — Kart açılışı (Pazar 20:00 sonrası, uygunsa)

```
+-----------------------------------+
|  X                                 |
|                                     |
|        DENGELİ ADIMCI              |
|                                     |
|  🚶  Ne maraton ne mola, tam        |
|      ortası bir tempo.             |
|  😴  Yastığınla resmen kader        |
|      birliği yaptınız.             |
|  💳  Ne cimri ne çılgın, tam        |
|      kararında harcadın.           |
|  🎉  Bu hafta çevrende adeta        |
|      bir kutlama vardı.            |
|                                     |
|   [ Bu hafta çoğu kategori güçlü ] |
|                                     |
|  ─────────────────────────────     |
|  Haftalık Hayat Karnesi · [mağaza] |
|                                     |
|        [     Paylaş     ]          |
+-----------------------------------+
```
- Tam ekran, reveal animasyonuyla açılır (yukarı bkz.).
- Sol üstte `X` ile kapatma; kapatınca hafta durumu ekranına döner, kart
  daha sonra istenildiği kadar tekrar açılabilir (aynı hafta = aynı
  dondurulmuş içerik).
- "Paylaş" birincil eylem, alt barda tek buton — dikkat dağıtan ikinci bir
  buton (indir, kaydet vb.) v1'de yok (aşağıdaki "dışarıda bırakılanlar").
- Piksel/oran ayrıntısı: `kart-yerlesimi.md`.

## Ekran 5 — Gizleme önizleme (paylaşmadan önce zorunlu ara adım)

```
+-----------------------------------+
|  < Geri                            |
|  Paylaşmadan önce gözden geçir.    |
|                                     |
|        DENGELİ ADIMCI              |
|                                     |
|  🚶  Ne maraton ne mola...    👁    |
|  😴  ???                      🙈    |
|  💳  ???                      🙈    |
|  🎉  Bu hafta çevrende...     👁    |
|                                     |
|   [ Bu hafta çoğu kategori güçlü ] |
|                                     |
|        [   Bu haliyle paylaş   ]   |
+-----------------------------------+
```
- Her satırın sağında bir göz ikonu (açık/kapalı) — **bu UI ikonu karta
  gömülmez**, yalnızca uygulama arayüzü elemanıdır; karta gömülen 12 emoji
  seti (`emoji-seti.md`) ile karıştırılmamalı.
- **Varsayılan durum:** uyku ve harcama satırı **gizli** (`???`), hareket ve
  sosyal **açık** — spec güvenlik gereksinimi 3 ile birebir. Kullanıcı hiç
  dokunmasa bile bu varsayılanla paylaşabilir.
- Dokunma = aç/kapa; gizli satırın gerçek metni bu ekranda **görünür**
  (kullanıcı ne sakladığını bilsin), ama paylaşılacak PNG'de o satır sadece
  `???` olarak basılır ve gerçek metin PNG üretim çağrısına hiç verilmez
  (spec: "gizlenen metin dosyada bulunmaz" — `captureCardPng`'e gizli
  kategori kümesi parametre olarak geçilir, metin değil).
- Unvan gizlenemez ayrı bir satır olarak listelenmez (unvan tek satır
  değil, kartın başlığıdır); eğer unvan gizlenen bir kategoriden türetildiyse
  (`basedOnCategories`) bu S7'nin iş kuralı gereği otomatik olarak
  değişir/gizlenir — bu ekranda kullanıcıya ayrı bir eylem gerekmez, sistem
  kendiliğinden tutarlı davranır.
- Gizleme seçimleri **kalıcı değildir**: ekrandan her çıkışta (paylaşım
  tamamlandığında veya geri gidildiğinde) varsayılana sıfırlanır — spec
  "gizleme yalnızca o paylaşım içindir". Bunu ayrıca bir metinle
  belirtmiyoruz çünkü her paylaşımda zaten aynı varsayılanla karşılaşmak
  kullanıcı için kendini açıklayan bir davranış.
- "Bu haliyle paylaş" → sistem paylaşım sayfası (WhatsApp/Story/Galeri vb.)
  açılır.

## Ekran 6 — Paylaşım sonrası

Ayrı bir "teşekkürler" ekranı **yok** (gereksiz adım). Sistem paylaşım
sayfası kapanınca kullanıcı doğrudan Ekran 4'e (kart, "Paylaş" hâlâ
görünür — tekrar paylaşabilir) geri döner. Kart ekranından `X` ile Ekran
3'e (hafta durumu) dönülür.

## Kilitli kart görsel dil özeti

`kart-yerlesimi.md` ile aynı 360x640 oranını kullanır ama küçültülmüş
(~%55 ölçek, ~200x356 mantıksal) bir önizleme kutusu olarak; gerçek
`CardView` bileşeni **hiç render edilmez** — ayrı, sabit bir "iskelet"
bileşeni kullanılır. Gerekçe: gerçek bileşeni render edip üstüne blur
koymak, geliştirici hatasıyla gerçek metnin bir an için ekrana/ekran
görüntüsü API'sine sızma riski taşır; ayrı iskelet bileşeni bu riski kökten
yok eder.

## Bilinçli olarak v1'de dışarıda bırakılanlar (UX/ekran düzeyi)

(Spec'in "Dahil değil (v2+)" listesiyle tutarlı, burada ekran/etkileşim
düzeyine indirgenmiş hali — kapsam genişlemesin diye ayrıca listeleniyor.)

- Onboarding'de tur/carousel, özellik tanıtım ekranları — tek değer önerisi
  cümlesi yeterli.
- Kart ekranında ikinci bir eylem butonu (indir, favorile, düzenle) — tek
  birincil eylem "Paylaş".
- Geçmiş kartlar galerisi/geçmişe dönük gezinme ekranı.
- Kart şablonu/tema seçimi, renk özelleştirme.
- Reveal animasyonuna ses efekti veya haptic dışında ekstra görsel efekt
  (konfeti vb.) — sade kalması, damganın/metnin dikkat çekmesini korur.
- Sosyal karşılaştırma/skor tablosu ekranı.
- Kullanıcı adı/avatar/profil ekranı.
- Emoji setini kullanıcının özelleştirmesi.
- Bildirim izni reddedilirse tekrar tekrar hatırlatan ısrarcı diyaloglar.
- Widget/kilit ekranı bileşeni.

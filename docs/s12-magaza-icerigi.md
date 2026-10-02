# S12 Mağaza İçeriği ve Kapalı Deneme Dağıtım Planı (Haftik)

Tarih: 2026-09-23. Durum: **TASLAK, karar Batuhan'ın.** Bu belge yalnızca metin/plan içerir; kod, `app.json`, `eas.json`
ve mağaza konsolları DEĞİŞTİRİLMEDİ, hiçbir şey yayınlanmadı.

Kaynaklar: `docs/uygulama-adi-onerileri-2.md` (Haftik), `docs/s10-guvenlik-raporu.md` bölüm 4 ve I-5/I-6, `spec.md` (ton, MVP, E1, E5,
E11), `docs/ux/*.md`, `src/domain/content/tr.ts`, `plan.md` S12, `intent/2026-09-20-haftalik-hayat-karti.md`.

## Yer tutucular ve açık kapılar (önce bunu oku)

- `[mağaza bağlantısı]`: gerçek Play/App Store URL'si yok (K5). `[iletişim e-postası]`: Batuhan'ın seçeceği destek adresi (yazılmadı).
- `[gizlilik politikası URL'si]`, `[destek URL'si]`, `[pazarlama URL'si]`: `site/` canlıya alınınca doldurulur (henüz yok).
- Paket adı hâlâ yer tutucu (`com.anonymous.hhkscaffold`, SEC I-3); Play'de ilk yüklemeden sonra değişmez. **Bu belgedeki hiçbir mağaza
  girişi paket adı kesinleşmeden yapılmamalı.**
- Ad "Haftik" bu belgede kesin varsayıldı (`app.json` `name`), ama mağaza/alan adı/TÜRKPATENT çakışma taraması Batuhan'da
  (`uygulama-adi-onerileri-2.md` "kontrol listesi"). Çakışma çıkarsa tüm metinlerdeki ad değişir.
- Karakter sayıları: bu oturumda kabuk/komut çalıştırılamadı; **kısa alanlar (başlık, alt başlık, kısa açıklama, tanıtım metni, anahtar
  kelime, güncelleme notu) iki kez elle sayıldı**, uzun açıklamalar yaklaşık sayıldı (sınırın çok altında). Yayın öncesi aşağıdaki
  komutla doğrula (her alanı ayrı bir `.txt` dosyasına yapıştırıp):
  `node -e "const s=require('fs').readFileSync(process.argv[1],'utf8').replace(/\r?\n$/,'');console.log([...s].length)" dosya.txt`
  (`[...s].length` Unicode kod noktası sayar; Türkçe harflerde `.length` ile aynıdır, Play/Apple sayacı yine de son söz).

## 1. Mağaza listeleri

Metin kuralları (S10 raporu bölüm 4 + görev): metinde **ruh hali, uyku, sağlık, terapi, takip** sözcükleri, tıbbi/sağlık vaadi,
"en iyi/#1/top", başka marka adı ve platform adı (Instagram, WhatsApp, Spotify vb.) YOK. Kategoriler bu yüzden "tempo, dinlenme,
harcama, sosyallik" diye anılır. **Uyarı:** bu, mağaza metnini temizler ama uygulama içi etiket ve ekran görüntülerinde "Uyku" yazar
(bkz. bölüm 3 ve 5); metinde saklamak, Health apps beyanını (bölüm 2) hafifletmez.

### 1.1 Google Play (tr-TR)

| Alan | Sınır | Metin | Sayı |
|---|---|---|---|
| Uygulama adı | 30 | `Haftik: Haftalık Emoji Kartı` | 28 |
| Kısa açıklama | 80 | `Günde birkaç saniye emoji işaretle, Pazar 20:00'de haftalık kartını aç.` | 71 |
| Güncelleme notu (ilk sürüm) | 500 | `İlk sürüm: günlük emoji işaretleme, Pazar 20:00'de açılan haftalık kart, paylaşmadan önce satır gizleme ve isteğe bağlı günlük hatırlatma.` | 138 |
| Tam açıklama | 4000 | aşağıda | ≈1.450 (yaklaşık; komutla doğrula) |

**Tam açıklama (Play; ilk 2 satır kanca):**

```
Günde birkaç saniye, haftada bir kart.
Dört emoji seç; Pazar akşamı Haftik haftana bir unvan ve dört esprili cümle yazsın.

NASIL ÇALIŞIR
1. Her gün dört küçük soruya emojiyle cevap ver: tempon, dinlenmen, harcaman, sosyalliğin. Tek ekran, tek Kaydet.
2. Haftada en az 4 gün işaretlersen (ilk kartta 3 gün yeter) Pazar 20:00'de kartın açılır.
3. Kart 9:16 bir görsel: bir unvan, dört esprili satır ve geçen haftayla küçük bir kıyas.
4. İstersen paylaş. Paylaşmadan önce her satırı tek dokunuşla gizleyebilirsin; gizlediğin satır (ve bazen unvan) kartta "???" olur. İki satır varsayılan olarak gizli başlar.

VERİN TELEFONUNDA KALIR
Hesap yok, üyelik yok, reklam yok. Verilerin yalnızca bu telefonda tutulur; telefon değiştirirsen taşınmaz.
Ayarlardan tek dokunuşla tüm verilerini silebilirsin. Bildirimlerde cevapların değil, yalnızca sabit bir hatırlatma metni görünür.

TAVSİYE YOK, YARGI YOK
Haftik eğlence amaçlı, kısa bir haftalık özet sunar. Tavsiye vermez, yargılamaz, tıbbi bir değerlendirme yapmaz.

KISACA
• Günlük emoji işaretleme (birkaç saniye)
• Pazar 20:00'de açılan haftalık kart
• Satır satır gizle/göster, paylaşmadan önce önizleme
• İsteğe bağlı günlük hatırlatma (varsayılan 21:00, ayarlanabilir)
• Hesap yok, reklam yok, veri telefonunda
• Türkçe

Öneri ve sorular için: [iletişim e-postası]
```

Notlar:
- "Verilerin yalnızca bu telefonda tutulur" onboarding metniyle (`ekran-akisi.md` 1b) aynıdır. "Uygulama internet kullanmaz" cümlesi
  BİLİNÇLİ yazılmadı: `INTERNET` izni kararı açık (SEC I-2), release merged manifest ve cihaz ağ izleme (G-01/G-02/G-09) alınmadan
  bu iddia mağazaya girmemeli.
- "İki satır varsayılan olarak gizli başlar" spec güvenlik gereksinimi 3'ün (uyku + harcama) mağaza dilindeki hâlidir.
- Deneme raporu (kullanıcı tetikli, paylaşım sayfasıyla) mağaza metninde anılmaz; gizlilik politikasında yazılır (SEC bölüm 4).
- Paket adı/iletişim/URL yer tutucuları doldurulmadan gönderme.

### 1.2 App Store (tr) — YALNIZCA S11/K9 (Apple üyeliği) sonrası

| Alan | Sınır | Metin | Sayı |
|---|---|---|---|
| Ad | 30 | `Haftik: Haftalık Emoji Kartı` | 28 |
| Alt başlık | 30 | `Pazar akşamı haftalık kartın` | 28 |
| Tanıtım metni (Promotional Text) | 170 | `Günde birkaç saniye emoji işaretle, her Pazar 20:00'de haftana ait esprili bir kart aç ve istersen paylaş. Hesap yok, veri telefonunda.` | 135 |
| Anahtar kelimeler | 100 | `hafta,özet,unvan,esprili,paylaş,sosyal,günlük,eğlence,hatırlatıcı,rutin,ritüel,kart,emojiler,mizah` | 98 |
| Açıklama | 4000 | Play tam açıklaması, **birebir aynı** (metinde platform adı yok) | ≈1.450 |
| Destek URL'si | zorunlu | `[destek URL'si]` (iletişim: `[iletişim e-postası]`) | — |
| Pazarlama URL'si | isteğe bağlı | `[pazarlama URL'si]` | — |
| Gizlilik politikası URL'si | zorunlu | `[gizlilik politikası URL'si]` | — |

Anahtar kelime notları: virgülden sonra boşluk yok (Apple boşluk karakterini de sayar); ürün adı "Haftik" tekrarlanmadı; ad ve alt
başlıktaki sözcükler (emoji, haftalık, kartı) tekrar edilmedi; marka adı, "uyku/sağlık/takip" yok. Play'in
4000 sınırı Apple ile aynı; Apple açıklamasında sürüm notu ayrıca girilir (aynı 138 karakterlik metin kullanılabilir).

## 2. Kategori, derecelendirme, hedef kitle

### Kategori
- **Play:** Yaşam Tarzı (Lifestyle). **App Store:** Yaşam Tarzı (Lifestyle), ikincil kategori boş bırakılır (Sağlık ve Fitness seçilmez;
  HealthKit yok). Kaynak: spec güvenlik gereksinimi 8, SEC bölüm 4. Kategori önerisi kural değil; Console'da doğrulanır.

### İçerik derecelendirme anketi (Play, IARC) — beklenen cevaplar
Uygulama kategorisi anketi "Yardımcı program/Diğer" değil, "Sosyal/Yaşam tarzı" akışına düşer; soru adları Console'da değişebilir,
doğrulanacak.

| Soru grubu | Beklenen cevap | Gerekçe |
|---|---|---|
| Şiddet, kan, korku | Hayır | İçerik havuzu (`tr.ts`) esprili, şiddet yok |
| Cinsel içerik/çıplaklık | Hayır | Yok |
| Küfür/kaba dil | Hayır | Ton kuralı: utandırma yok, argo yok |
| Uyuşturucu/alkol/tütün gönderme veya tasvir | Hayır | Yok (sosyal satırlarında "kutlama", kaba gönderme yok) |
| Kumar/gerçek para oyunu | Hayır | "Harcama" bir kullanıcı beyanı seviyesidir, ödeme/kumar yok |
| Kullanıcı etkileşimi / kullanıcı üretimli içerik (UGC) | Hayır | Hesap, sohbet, yorum yok; paylaşım işletim sistemi paylaşım sayfasıyla |
| Konum paylaşımı | Hayır | Konum toplanmıyor |
| Kişisel bilgi paylaşımı/toplama | Hayır | Bkz. S10 raporu bölüm 4 |
| Uygulama içi satın alma/reklam | Hayır | v1'de yok |
| Dijital satın alma | Hayır | Yok |

Beklenen sonuç: en düşük yaş bandı (Herkes/3+ benzeri). Türkiye'ye özgü ek derecelendirme çıkabilir; **sonuç Console'da doğrulanır,
bu tablo tahmindir.** Apple: yeni yaş derecelendirme formu (13+/16+/18+ eklendi; "Tıbbi veya sağlıklı yaşam konuları" bölümü var,
[Apple duyurusu](https://developer.apple.com/news/?id=ks775ehf)) dürüst cevaplanır; uyku/hareket seviyesi beyan eden bir uygulama için
"wellness" sorusuna nasıl cevap verileceği **doğrulanacak** (yanlış "Yok" vermek de yanlış beyandır). Beklenen 4+; wellness cevabı
sonucu yükseltirse kabul edilir, mağaza metniyle oynanmaz.

### Hedef kitle yaşı: **18+ öner** (13+ değil)
Gerekçeler:
1. Ürün "genç yetişkin" çevresine (intent: Story paylaşan genç/yetişkin) yönelik; 18 altı için tasarlanmadı, test edilmedi.
2. Play'de hedef kitleye 13 altı bir yaş grubu girerse **Families Policy** kapsamı doğar (sertifikalı reklam SDK'sı, çocuk verisi
   kuralları, yaş ekranı vb.; [Play Console Help](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en)). 13-17
   seçmek de mağazada ek soru/beyan getirebilir; gereksiz yüzey.
3. KVKK sorusu (K10) açık: reşit olmayan kullanıcının beyan ettiği uyku/hareket bilgisi ek risk yaratır. 18+ bu belirsizliği
   kapatır; hukuki görüş sonrası 16+/13+ genişletilebilir (geri dönüşü kolay, tersi zor).
4. "Harcama" kategorisi ve kart paylaşım kültürü reşit olmayanlar için tartışmalı değil ama gerekli de değil; ilk doğrulama zaten 20-30
   kişilik yetişkin çevrede yapılacak.
Uygulama çocuklara yönelik değil; "Designed for Families/Kids" seçilmez; Apple'da "Made for Kids" seçilmez. Play'de hedef kitle
sorusunda yalnızca **18 ve üzeri** işaretlenir; çocukları çeken içerik (çizgi film, çocuk teması) yoktur ve kullanılmamalıdır.
Takas: 16-17 yaş grubu (paylaşım kültürünün güçlü olduğu kitle) bilinçli dışarıda; bu bir büyüme kaybıdır, ama v1 doğrulaması için kabul.

### Health apps beyanı (Play, SEC I-6) ve gizlilik beyanı
Karar Batuhan'ın, Console'da doğrulanacak. Öneri: kullanıcı beyanıyla hareket/uyku **seviyesi** toplandığı için formu dürüstçe doldur;
"tıbbi iddia yok, cihaz dışına çıkmıyor, teşhis/tedavi/ölçüm yapmıyor" notuyla. Data safety: bölüm 4 taslağı (S10 raporu). Bu belge
hukuki görüş değildir.

## 3. Ekran görüntüsü planı

### Teknik gereksinimler (WebSearch + resmî sayfalarla doğrulandı, 2026-09-23)

| | Google Play | App Store |
|---|---|---|
| Adet | Telefon: en az **2**, en çok **8** (Play sayfasına göre görünürlük için önerilen ≥4) | iPhone: **1-10** / boyut sınıfı |
| Biçim | JPEG veya 24-bit PNG, **alfa yok** | JPEG/PNG, alfa yok |
| Boyut | Kenar 320-3840 px, uzun kenar kısa kenarın en çok 2 katı; öneri **1080x1920** (9:16) | **6,9"**: 1320x2868, 1290x2796 veya 1260x2736 (portre). 6,5" (1284x2778 / 1242x2688) yalnızca 6,9" verilmediyse zorunlu |
| İçerik kuralı | Gerçek uygulamayı göster; metin/slogan görselin ~%20'sinden az; "İndir", "En iyi", "#1" yok; bildirim çubuğunu temizle | Gerçek uygulama ekranı; yanıltıcı içerik yok |
| Ek | Alt metin ≤140 karakter (erişilebilirlik, doğrulanacak) | Yerelleştirme başına ayrı set |
| Tablet | Uygulama tablet için beyan edilmiyorsa zorunlu değil; **doğrulanacak** (Console formu) | iPad desteği kapalıysa gerekmez (**doğrulanacak**, `app.json` `supportsTablet`) |

Kaynaklar: [Play Console Help: preview assets](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en),
[App Store Connect: screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/).
İkon 512x512 32-bit PNG (≤1024 KB), öne çıkan grafik 1024x500 JPEG/24-bit PNG (alfa yok) Play tarafında zorunludur (aynı Play sayfası).
App Store ekran görüntüsü yalnızca S11 (Apple üyeliği + iPhone/simülatör yolu) sonrası; Windows'ta iOS simülatörü yok, iOS seti o zamana ertelenir.

### Çekim kuralları (tüm kareler)
- **Gerçek uygulama çıktısı**, tasarım maketi değil (mağaza kuralı: gerçek deneyim). Çerçeveleme/yazı eklemesi ücretsiz araçla (Figma/Canva
  ücretsiz katman); bütçe gerekmez.
- **Demo veri:** temiz kurulum + uydurma check-in (gerçek kişisel veri yok). Emülatör/cihazda **kişisel hesap yok**, cihaz adı/saati
  düzenli, bildirim çubuğu temiz, sadece uygulama.
- **Zaman:** dev zaman menüsüyle (yalnızca dev derlemede; release'te yok, N-8) Pazar 20:00'den sonrası + bugünün check-in'i eklendi
  senaryosu (K3 ara ekranı çıkmadan reveal'a gidilsin). Hafta durumu karesi için Çarşamba/Perşembe simülasyonu.
- **Kart seçimi:** **uyku ve harcama satırları varsayılan gizli** (`???`) çekilir; bu yüzden unvan uyku/harcamadan türemeyen bir kategoriden
  gelmeli (yoksa unvan da `???` olur, `title-visibility`). Aday demo kombinasyonu: hareket ve sosyal yüksek → "Koşan Sosyalite" (kural
  öncelik sırası nedeniyle uygulamada **elle deneyerek doğrula**; çıkmazsa başka aday seç). Cihaz üretimi kartın kendisidir, elle metin
  düzenlenmez.
- **Kesin ad ve damga:** kartlar K4/K5 kesinleşince, kesin ad ve bağlantı damgada (`Haftik · [mağaza bağlantısı]`) görünecek şekilde
  **yeniden üretilir**; yer tutucu bağlantılı kare mağazaya girmez.
- **Emoji:** Android emülatör Noto Color Emoji çizer; Play için sorun değil. Karelerde emoji görünümü gerçek cihazda kontrol edilmeli
  (S7a açık cihaz maddesi).
- **Türkçe karakter** netliği ve satır taşması kontrolü (ğ ş ı İ ö ü ç) her karede.

### 6 kare (sıra önemli: 1. kare = wow anı; ilk 2-3 kare görünür)

| # | Ekran (kaynak) | Overlay cümlesi (kısa, iddiasız) | Demo veri / senaryo |
|---|---|---|---|
| 1 | **Kart** (`CardView`, paylaşılan hâl: uyku+harcama `???`) | "Pazar akşamı haftan tek kartta." | Pazar 20:00 sonrası; 5-6 dolu gün; hareket+sosyal yüksek; kart açılmış, damga görünür |
| 2 | **Bugün** check-in (Ekran 2) | "Günde birkaç saniye. Dört emoji, bir Kaydet." | Bugünün tarihi; dört emoji seçili, Kaydet aktif. **Etiketlerde "Uyku" yazar** (uygulama içi metin, bkz. bölüm 5 uyarısı) |
| 3 | **Hafta durumu + kilitli kart** (Ekran 3) | "Pazar 20:00'de kartın açılır." | Çarşamba/Perşembe simülasyonu; 3 dolu nokta; "Kartın için 1 gün daha lazım" |
| 4 | **Paylaşım önizlemesi** (Ekran 5) | "Paylaşmadan önce karar sen ver." | İki satır `???`, iki satır açık; göz ikonları görünür |
| 5 | **Onboarding gizlilik** (1b) veya Ayarlar "Tüm verilerimi sil" | "Veri yalnızca bu telefonda kalır." | Temiz ekran; ifade S10 doğrulamalarından (G-01/G-02) sonra mağazaya girer |
| 6 | **İkinci hafta kartı**: geçen haftayla kıyas özeti | "Her hafta yeni bir unvan." | Yeni demo haftası; farklı unvan; özet satırı "Karışık bir hafta..." benzeri (üretilen gerçek çıktı) |

Alt metin (erişilebilirlik) örneği kare 1: "Haftik haftalık kartı: bir unvan, dört esprili satır ve geçen haftayla kıyas." (≈85, ≤140).

### Öne çıkan grafik (Play, 1024x500) brief'i
- Biçim: JPEG/24-bit PNG, **alfa yok**, saf beyaz/koyu gri zemin yok; odak noktası ortada (kenarlar farklı cihazda kırpılabilir).
- Kompozisyon: solda büyük tek cümle **"Haftan, tek kartta."** (Play kuralı: "en iyi/#1/top", "indir" yok); sağda hafif eğik 9:16 gerçek kart
  (ekran 1, uyku/harcama `???`); iki yanda 3-4 emoji (kaplumbağa, yürüyen kişi, kredi kartı, parti düdüğü) küçük serpiştirilmiş.
- İkon/marka adı ikonu tekrar etmesin (Play önerisi). Metin alanı ≤%20 değil, ama az tutulur.
- Emoji kaynağı: **Apple emojileri grafikte kullanılamaz**; Noto Color Emoji (Google, açık lisans) veya kendi çizimin. Lisans metnini
  kullanmadan önce **doğrula** (Twemoji CC-BY 4.0 kaynak gösterimi ister; bu belge lisansı doğrulamadı).
- Kart ve kare metinlerinde kesin ad ve damga.

### İkon brief'i
- **Durum:** `assets/` altındaki ikon/splash dosyaları (`icon.png`, `android-icon-*.png`, `expo.icon`, `splash-icon.png`) Expo şablonundan
  gelen **yer tutucudur** (`app.json` adaptif arka plan `#E6F4FE`, splash `#208AEF` şablon değerleri); mağazaya girmez.
- Konsept: krem/ışık renkli 9:16 **kart silueti** içinde tek büyük, sade bir işaret (ör. gülen/kıvrık-göz yüz veya "H" harfi + küçük 7
  nokta = hafta göstergesi). Tek fikir, ince detay yok (küçük boyutta okunur olmalı).
- Renk önerisi (karar Batuhan'ın): zemin sıcak mercan `#FF6B57`, kart krem `#FFF6E9`, işaret koyu `#22223B`. Kart iç tasarımı nötr olduğundan
  (`kart-yerlesimi.md`: seviyeye göre renk kodu yok) ikon renkleri kartı bağlamaz, ayrı bir marka rengidir.
- **Adaptif ikon (Android):** ön plan 1024x1024 saydam PNG; görünür alan ~üçte iki daire (108 dp tuvalde 66 dp güvenli bölge, kritik öğe
  merkezde kalır, kenar 18 dp maskeye gider; Android belgesinden yeniden doğrula); arka plan düz renk (`backgroundColor`) veya sade dokusuz PNG;
  ikonda metin yok (harf marka işareti dışında).
- **Monokrom sürüm (Android 13 temalı ikon):** `monochromeImage`, tek renk (alfa kanallı siluet), kartın dış hattı + işaret; `app.json`
  bu alanı zaten kullanıyor (yer tutucu görsel değişecek).
- **Play mağaza ikonu:** 512x512, 32-bit PNG, ≤1024 KB; köşe yuvarlama/gölge **ekleme** (Play uygular), sıralama/ücret/kategori rozeti yok.
  **iOS ikonu:** 1024x1024, alfa yok, köşe yuvarlama yok (S11).
- Emoji-tarzı ama telifsiz: elle çizim vektör (Figma/Inkscape), Apple emojisi kullanma; açık lisanslı kaynak kullanılırsa lisans doğrulanır.
- Uygulama adı ile uyum: ikon "Haftik" harf işareti veya kart silueti; eski çalışma adı, marka adı, başka uygulamaya benzeyen form yok.

## 4. Launch / dağıtım planı (kapalı deneme, Android)

### Çerçeve
- **Amaç (intent + E1):** 4 haftalık kapalı denemede, kartı gören kullanıcıların ≥%25'i kartı **kendiliğinden** paylaşsın; ek gösterge D7
  check-in oranı. Örneklem 20-30 kişi → %25 ≈ 5-8 kişi: **"güçlü sinyal", kesin doğrulama değil** (E1). Bu belge ilk **14 günü** planlar;
  gün 15-28 aynı ritimle sürer.
- **Bütçe:** 0 (reklam yok). Play geliştirici kaydı (25 $ tek seferlik, intent) hesabı açık değilse önce o karar. Ücretli alternatif
  önerilmiyor; her adım organik (kişisel mesaj).
- **Kitle:** Türk genç yetişkin çevre, 20-30 kişi; **12 kişi eşiğinin üstünde tampon** gerekir, çünkü Google kişisel hesaplar için üretime
  çıkmadan önce **≥12 test kullanıcısının 14 gün kesintisiz kapalı testte** olmasını ister (spec E11; hesap tarihi bilinmiyor, Console'da doğrula).
- Testçiler **gerçek Android cihaz + gerçek Google hesabı** olmalı (E11). iOS yok (K9 kapısı): iPhone'lu arkadaşlar bu turda dışarıda.
- **Önkoşullar (sırayla):** paket adı (I-3) → kesin URL/ad (K4/K5) → gizlilik politikası URL'si + Data safety + Health apps beyanı (I-5/I-6/K11)
  → KVKK görüşü ya da Batuhan'ın "hukuki görüş sonra, yalnızca arkadaş çevresi" kararının `plan.md`'ye yazılması (K10) → Play kapalı test
  kanalı → davet. Alternatif: Play kapalı test kullanmadan APK ile arkadaşlara doğrudan dağıtım (politika/URL zorunluluğu daha hafif, SEC I-5),
  ama o zaman E11'in 14 günlük sayacı işlemez.
- Testçi e-posta adresi (Play test listesi için Gmail) yalnızca davet için alınır, amacı söylenir, deneme bitince listeden ve mesajlardan
  silinir (KVKK ihtiyatı; hukuki görüş değildir).

### Doğru kanal-kitle eşleşmesi (isim verilebilir yerler)

| Kanal | Kim | Neden uygun | Rol |
|---|---|---|---|
| **WhatsApp, bire bir mesaj** (grup toplu davet değil) | Yakın çevre, üniversite/iş arkadaşları | Türkiye'de günlük iletişim aracı; davet kişisel olunca kabul yüksek olur (**varsayım**, ölçülmedi); test bağlantısı ve geri bildirim aynı yerde | Davet, hatırlatma, geri bildirim |
| **Instagram Story** | Aynı kişilerin kendi takipçileri | Kart zaten **9:16**, Story'ye doğrudan uyuyor (`kart-yerlesimi.md`); ürünün paylaşım "wow" anı burada | Asıl paylaşım hedefi (organik yayılma) |
| **WhatsApp Durumu** | Kişi rehberi | Aynı 9:16 kart, ek iş yok; kapalı çevrede güvenli | İkinci paylaşım hedefi |
| **X** | Türkçe X'te hafta/rutin/uygulama paylaşan küçük çevre | Kart tek görsel + tek cümle ("Bu hafta unvanım: ...") ile tweet'e çevrilir; yakın çevreden bağımsız 2. tur sinyali | **G15 sonrası, isteğe bağlı**; kapalı test 14 gün tamamlanmadan dağıtım yok |

Doğal gündem uyumu (hipotez, kanıt yok): "Pazar akşamı" Türkiye'de zaten konuşulan bir ritim (yeni haftaya hazırlık, "pazar kasveti" tartışması);
kartın Pazar 20:00'de açılması buna oturur. Bu, kartın mağaza metnine girmez (ruh hali çağrışımı), yalnızca davet mesajının tonunda hafifçe
kullanılır ve ölçülene kadar "işe yarar" denmez. Karşı gündem riski: haftalık paylaşım yorgunluğu (intent açık soru 4).

**Paylaşılabilir "wow anı" cümlesi:** "Pazar 20:00'de kartına dokunuyorsun; haftan bir unvana ve dört esprili cümleye dönüşüyor."
Paylaşılan iç cümle: "Bu haftanın unvanı: [unvan]."

### İlk 14 gün takvimi (G1 = Pazartesi önerilir; G7 ve G14 Pazar)

| Gün | Eylem | Ölçü/not |
|---|---|---|
| G-3..G0 | 24-30 kişiyi belirle, tek tek WhatsApp'tan davet et (mesaj 1), Gmail adreslerini topla, Play kapalı test listesine ekle | Hedef: ≥18 kabul (tampon; 12 opt-in şartı için) |
| G1 (Pzt) | Test bağlantısını gönder (mesaj 2) | Kurulum sayısı (Console) |
| G2-G3 | Sessizlik; yalnızca sorun çıkarsa yanıtla | Uygulama hatırlatması kendisi çalışır |
| G4 (Per) | Hatırlatma (mesaj 3), sadece işaretlemeyenlere | D7 için 3 dolu gün hedefi (ilk kart eşiği 3) |
| G7 (Paz) | **Nötr** Pazar mesajı (mesaj 4): paylaşım yönlendirmesi yok | E1'in "kendiliğinden" şartı; ölçüm buradan sayılır |
| G8 (Pzt) | Geri bildirim + deneme raporu iste (mesaj 5) | Rapor #1 (tümü) |
| G9-G12 | Tek kısa sohbet: kart nasıldı, satır gizleme fark edildi mi; küçük kusur listesi | Triyaj (support-specialist) |
| G14 (Paz) | **Paylaş çağrılı** Pazar mesajı (mesaj 6): "yönlendirmeli" ölçüm, E1'e sayılmaz | Rapor #2 G15 |
| G15 (Pzt) | Rapor #2 + kısa anket (mesaj 7) | Sayaç farkı = 2. hafta |

### Mesaj taslakları (Türkçe, kişiye göre uyarlanacak; hepsi ton olarak abartısız)

**1. Davet (G-3..G0)**
```
Selam! Küçük bir uygulama yaptım, adı Haftik. Günde birkaç saniye emoji işaretliyorsun, Pazar 20:00'de haftana bir unvan ve esprili
cümleler çıkıyor. 2 haftalık denemeye 20-30 kişi arıyorum, sen de olur musun? Hesap yok, veri sadece telefonunda kalıyor.
Olursa Play Store'da kullandığın Gmail adresini yaz, test bağlantısını göndereyim (adresi sadece davet için kullanırım, sonra silerim).
```
**2. Kurulum (G1)**
```
Test bağlantısı: [mağaza bağlantısı]. Açıp "test kullanıcısı ol"a dokun, kur. İlk açılışta bildirim iznini ver (akşam 21:00 hatırlatma
gelir, ayarlardan kapatabilirsin). Bugünü işaretle, birkaç saniye sürer.
```
**3. Hatırlatma (G4, yalnızca işaretlemeyenlere)**
```
Haftik'te bu hafta şimdiye kadar [X] günün var. Pazar'a kartın açılması için 3 gün yetiyor (ilk kartta). Bugünü de eklersen olur, ekleyemezsen
sorun değil.
```
**4. Pazar, nötr (G7; paylaşım isteme YOK)**
```
Bugün Pazar, saat 20:00'den sonra Haftik'te kartın açılıyor. Açınca nasıl olduğunu bir cümleyle yazsan yeter.
```
**5. Geri bildirim + rapor (G8)**
```
Kart nasıldı? Üç soru: 1) Unvan/satırlar sana ne kadar "sen" geldi? 2) Paylaşmadan önce satır gizleme ekranını fark ettin mi? 3) En çok neye
takıldın? Bir de Ayarlar'dan "Deneme raporu"nu bana gönderebilir misin? Rapor sadece sayaç (kaç gün doldurdun, kart açıldı mı,
paylaşım başlattın mı) içeriyor; emoji, tarih veya kart metni yok. Göndermeden önce ne gideceğini zaten gösteriyor.
```
**6. Pazar, paylaş çağrılı (G14; E1'e SAYILMAZ)**
```
İkinci Pazar! Kartın açıldıysa beğendiysen Story'ne ya da WhatsApp durumuna atabilirsin; beğenmediysen atma, o da veri. Paylaşmadan önce
istediğin satırı gizleyebiliyorsun.
```
**7. Rapor + kapanış (G15)**
```
Teşekkürler! Son bir rica: Ayarlar > Deneme raporu'nu tekrar gönder, ve tek cümleyle "1. hafta kartı mı, 2. hafta kartı mı daha iyiydi?" de.
Uygulamayı kullanmaya devam edebilirsin, deneme sonunda haber veririm.
```

Mesajlarda "en iyi", marka karşılaştırması, sağlık/ruh hali vaadi yok; paylaşım isteği yalnızca mesaj 6'da ve E1 sayımından ayrı tutulur.
Yaklaşık 24 kişilik bir kitleye 24 bire bir mesaj gönderilecek: toplu/gruba spam yok (WhatsApp politikası ve samimiyet).

### Başarı ölçütleri ve deneme raporu toplama

- **Birincil (E1, "güçlü sinyal"):** `share_initiated ≥ 1` olanlar / `card_opened ≥ 1` olanlar ≥ **%25**. Yalnızca **G7-G8 dönemi (nötr)** payı sayılır;
  G14 çağrılı ölçüm ayrı raporlanır ve eşiğe eklenmez. Payda: kartı gören kullanıcılar (spec E1); "kart açan / kurulum" ayrı raporlanır.
- **İkincil:** D7 check-in oranı (gün 7'de dolu check-in `yes`; `pending`/`unknown` ayrı). **Eşik intent'te yok;** bu belge yenisini icat etmez,
  Batuhan bir hedef koymak isterse sonuçtan önce yazmalı.
- **Toplama yöntemi:** Kullanıcı tetikli deneme raporu (Ayarlar, onay diyaloğu, OS paylaşım sayfası) `.txt` olarak WhatsApp'tan Batuhan'a
  gelir; içerik yalnızca sayaç + gün sayısı, **kimlik/tarih/emoji/kategori yok**; gönderen tanıdık kişi olduğu için "anonim" değil, "kimlik/içerik
  içermez" diye adlandırılır (S9 I-3). Sunucu, analitik SDK'sı, otomatik gönderim yok (E1 Seçenek A).
  Batuhan elle bir tabloya işler (`domain/metrics-calc.ts` `aggregateMetrics` ile aynı sözlük).
- **Bilinen yanlılıklar (kabul edilmiş):** `share_initiated` paylaşım sayfası açılınca sayılır → paylaşımı **fazla** sayar (iptal dahil);
  ekran görüntüsü alıp paylaşma uygulamadan görünmez → **eksik** sayar; küçük örneklem; sosyal beğenirlik. Bu yüzden ek olarak rapor
  mesajında "paylaştın mı, nerede?" öz-bildirimi çapraz kontrol olarak sorulabilir (isteğe bağlı, kayıt tutulur).
- **Haftalık kırılım:** rapor haftalık ayrım taşıyor mu **doğrulanacak** (S9: rapor yalnızca sayaç özeti). Taşımıyorsa G8 raporu (1. hafta) ve
  G15 raporu (kümülatif) farkı ikinci haftadır; bu yüzden G8'de rapor almak zorunludur.
- Kapı: Console'da 12+ kişi 14 gün kesintisiz opt-in; testçi düşerse listede kalan sayıyı G7/G10'da kontrol et.

### Riskler
1. **Paylaşım yorgunluğu / talep kanıtı zayıf** (intent risk 2, 4): sonuç olumsuzsa ürün ele alınır, kapsam genişletilmez.
2. **E1 yanlılığı:** çağrılı Pazar mesajı (mesaj 6) ölçütü bozar; bu yüzden G7 ve G14 ayrı işlenir. Testçilere G1-G7 arasında paylaşım
   söylenmemeli.
3. **İlk kart eşiği:** Çarşamba+ kuran testçi 3 dolu günü tamamlayamaz (E4b); davetler mümkünse Pazartesi/Salı kurulumla zamanlanır.
4. **Bildirim güvenilirliği:** agresif pil yönetimli cihazlarda (E13) hatırlatma gelmeyebilir; D7/paylaşım düşüşü ürün sorunu gibi okunabilir.
   Testçi cihaz modelini sor (kimlik değil, model).
5. **Kitle sınırı:** arkadaş çevresi sosyal beğenirlik ve seçilim yanlılığı taşır; 2. tur (X, tanımadık kitle) ancak deneme sonrası.
6. **Mağaza/politika riskleri:** Health apps beyanı, yanlış Data safety, gizlilik URL'si eksikliği (SEC I-5/I-6), KVKK (K10). Bu kapılar açılmadan Play
   kapalı test davetleri gönderilmez.
7. **iOS'suzluk:** iPhone kullanan çevre dışarıda kalır; Story paylaşımı için iPhone ağırlıklı kitlenin payı **doğrulanmadı**, iddia edilmedi.
8. **Paylaşım mesajı taşıması:** `expo-sharing` ayrı bir mesaj metni taşımaz (CLAUDE.md S7b); mağaza bağlantısı yalnızca kartın gömülü damgasında
   garantilidir, WhatsApp'ta metin olarak düşmeyebilir (cihazda doğrula, S10/S11).
9. **Ekran görüntüsü ve uyku etiketi:** kare 2'de "Uyku" etiketi görünür (bölüm 5 uyarısı).

## 5. Mağaza yasağı / politika kontrol listesi

Yayın öncesi Batuhan işaretler (Google/Apple politika sayfalarını güncel haliyle tekrar oku; bu liste hukuki güvence değildir):

**Metin (başlık, alt başlık, kısa/tam açıklama, anahtar kelime, güncelleme notu, ekran/overlay metni)**
- [ ] "ruh hali", "uyku", "sağlık", "terapi", "takip" sözcükleri **hiçbir mağaza metninde** yok (aramayla doğrula; arama terimleri: `ruh`, `uyku`, `sağlık`, `terapi`, `takip`).
- [ ] Tıbbi/sağlık iddiası yok: teşhis, tedavi, iyileştirme, ölçüm, "daha iyi uyu", "stres", "depresyon", "kilo", "diyet" yok; tam açıklamada "tıbbi değerlendirme
      yapmaz" ifadesi var, yükseltme yok.
- [ ] Kanıtsız üstünlük yok: "en iyi", "#1", "top", "birinci", "tek", "en popüler", "milyonlarca" yok (Play grafik kuralı da bunu yasaklar).
- [ ] Başka marka/ünlü ad ve taklit izlenimi yok: "Wrapped"/"Spotify Wrapped", "Daylio", "Bearable", "Apple Fitness" gibi adlar metinde/görselde/anahtar
      kelimede yok; anahtar kelimelerde başka uygulama veya marka adı yok; Apple'da anahtar kelimede platform adı (Android) yok; Play'de "iPhone/App Store" yok.
- [ ] Platform/üçüncü taraf marka adı (Instagram, WhatsApp, Story) mağaza metninde yok (bu belgenin iç iletişim mesajlarında var, mağazada değil).
- [ ] "İndir", "şimdi indir", "ücretsiz" (fiyat vaadi), yıldız/ödül/yorum alıntısı, sıralama rozeti yok; Play'de emoji/BÜYÜK HARF spam yok; başlıkta
      "iyi", "ücretsiz", "yeni" gibi tanıtım sözcüğü yok.
- [ ] Veri iddiaları doğrulanmış: "yalnızca telefonda", "hesap/reklam yok" doğru ve gizlilik politikası + Data safety ile tutarlı; "internet kullanmaz" **yazılmadı**
      (SEC I-2, G-09 bitmeden yazılmaz).
- [ ] iOS tarafında "telefon değişince taşınmaz" ve "iCloud yedeğine girmez" iddiası iOS yedek hariç tutma (S11, K7 iOS yarısı) doğrulanmadan yayınlanmaz.
- [ ] Türkçe yazım/ton kontrolü; espri kimseyi/kesimi hedef almıyor; kart satırlarından alıntılanan örnekler `tr.ts` ile birebir.

**Görsel**
- [ ] Ekran görüntüleri gerçek uygulama, yanıltıcı sahne/cihaz maketi yok; kişisel veri, gerçek isim, gerçek e-posta/bildirim yok; kesin ad ve damga doğru.
- [ ] Play: "İndir" çağrısı yok, overlay metni görselin <%20'si, bildirim çubuğu temiz; öne çıkan grafikte alfa yok, "En iyi/#1" yok.
- [ ] İkon: Apple emojisi, marka logosu, sıralama/fiyat/kategori rozeti yok; emoji lisansı doğrulanmış.
- [ ] **Uyarı (açık):** kare 2 ve uygulama içi check-in ekranında "Uyku" etiketi var; bu, mağaza *metni* kuralının kapsamında değil ama Health apps
      beyanıyla tutarlı olmalı. Seçenekler: (a) olduğu gibi bırak ve beyanı dürüst doldur, (b) uygulama içi etiketi sonra "Dinlenme" gibi nötr yapma kararı
      (ürün kararı, bu belge kod değiştirmez). Karar Batuhan'ın.

**Beyan ve form**
- [ ] Kategori: Play Yaşam Tarzı, App Store Yaşam Tarzı; Sağlık ve Fitness seçili değil.
- [ ] IARC/Apple yaş anketi dürüst; hedef kitle 18+; Families/Kids seçili değil.
- [ ] Data safety / App Privacy: "toplanmıyor / Data Not Collected"; Console'un güncel tanımıyla doğrulandı (K11); Health apps beyanı kararı işlendi.
- [ ] Gizlilik politikası URL'si canlı; destek/iletişim adresi çalışıyor; paket adı kesin.

## Doğrulanacaklar (bu belge kanıtlamadı)

1. Tüm karakter sayıları Play Console / App Store Connect sayacıyla (ve yukarıdaki `node -e`) — bu oturumda komut çalıştırılamadı.
2. "Haftik" adının mağaza/alan adı/TÜRKPATENT çakışması (yalnızca genel web araması yapılmıştı).
3. Apple yaş anketinde "Tıbbi veya sağlıklı yaşam konuları" cevabı, Play Health apps formunun bu uygulamayı kapsayıp kapsamadığı.
4. Play tablet/iPad ekran görüntüsü zorunluluğu (uygulama tablet beyanına göre).
5. Emoji görsel lisansı (Noto/Twemoji/kendi çizim), Android adaptif ikon güvenli bölge ölçüleri (Android belgesi), `monochromeImage` alanı.
6. Deneme raporunda haftalık kırılım var mı; paylaşımdaki bağlantı metninin hedef uygulamaya taşınması (cihazda).
7. Demo kartın uygulama içinde "Koşan Sosyalite" (veya başka bir uyku/harcama dışı unvan) üretip üretmediği; yoksa başka kombinasyon.

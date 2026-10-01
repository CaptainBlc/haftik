# 15 - Rakip ve referans incelemesi: "görsel olarak çarpıcı ve paylaşılan" ürünler gerçekte ne yapıyor? (Haftik)

Tarih: 2026-09-28. Yazan: product-researcher. Durum: **tamamlandı (öneri; kapsam kararları Batuhan'ındır).** Kod/asset/emülatöre dokunulmadı, commit atılmadı.

Okunan iç belgeler: `CLAUDE.md`, `01-urun-teshis.md`, `03-alisganlik-dongusu.md`, `10-gorsel-kimlik.md`.

Kanıt notasyonu: **[B]** birincil (ürünün/şirketin kendi sayfası, mağaza sayfası, resmi blog/basın odası), **[İ]** ikincil (haber, tasarım basını, blog,
arama motoru özeti; sayı ise "doğrulanmadı" sayılır), **[D]** doğrulanamadı. Kaynaksız iddia yazılmaz; kaynaksız çıkarım "varsayım" diye işaretlenir.
Etki/efor puanları (bölüm 5) ve "bizde var" hükümleri (bölüm 4) kanıt merdiveninde **K0-K1**'dir (yargı + iç belge okuması); K4/K5 yoktur.

## 0. Özet (yönetici)

1. **"Fazla basit" tespiti kaynaklarla desteklenmiyor; "çıktı ve ödül anı sönük" tespiti destekleniyor.** Referansların en çok paylaşılanları girdide
   basit (Daylio: ikonla seç; Receiptify: tek akış, PNG indir); zenginlik **çıktıda ve ödül anında** kurulmuş. Girdi karmaşıklığı ise eleştiri konusu
   (Bearable "overwhelming", Finch "cluttered/decision fatigue"). Zenginleştirme = daha çok alan/kategori değil, daha zengin *karne kartı, açılış ve
   kaydet sonrası an*.
2. **Paylaşımı sürükleyen şey "kimlik"tir, veri değil.** Wrapped 2024, kişilik/oyun öğelerini kaldırıp "rapor gibi" hissettirince "boring/flop" tepkisi aldı;
   2025'te insan yapımı/retro yöne dönüp 24 saatte 200M+ etkileşimli kullanıcıya ve 500M+ paylaşıma ulaştı (Spotify beyanı, TechCrunch aktarımı) [İ].
   Bizde kimlik = unvan; **varsayılan paylaşımda çoğu hafta `???` (01 T13) olması bu bulguyla doğrudan çelişiyor.**
3. **Adımız ve metaforumuz bir risk taşıyor: "karne" = rapor.** Wrapped 2024'e yönelik "scrapbook değil report card" eleştirisi [İ] tam bu tuzağı gösteriyor.
   Karnenin *ciddiyetini parodi eden* (Receiptify'ın sahte fiş ayrıntıları gibi) bir dil kurulmalı; analitik his kurulmamalı.
4. **En güçlü solo-uyumlu vaka Receiptify** (tek metafor, sıfır emek, PNG; ilk aylarda 1M+ kullanım [B, kurucu/kurum beyanı]). Ama tek seferlik bir araçtı
   (alışkanlık kanıtı yok) ve Spotify API'sine bağlıydı [İ]. Aktarılabilen: *metafor + ayrıntı mizahı + tek dokunuşla PNG*. Aktarılamayan: alışkanlık.
5. **Story güvenli alanı (üst ~250 px, alt ~340 px; 1080x1920) 10-gorsel-kimlik kart düzeniyle çakışıyor görünüyor**: altbilgi + mühür alt bölgeye ~%86
   oranında giriyor [İ + hesap; cihazda ölçülmedi] (bölüm 2.15).
6. **Amatör görünümün 10 tipik nedeninin 10'u da bizde var** (bölüm 4); çoğu zaten 01/10'da teşhisli. Bu belgenin eklediği: referans karşılıkları ve
   **renk kararının yeniden açılması** (10 belgesi "kategoriye/seviyeye göre renk yok" diyor; incelenen ürünlerin hepsi rengi ana taşıyıcı yapıyor;
   yargısız yol = *kategori başına sabit ton, seviye = doluluk/boyut*; hipotez, 5 kişilik testle sınanmalı).
7. **Tavsiye (bölüm 9): şu koşulla devam** - zenginleştirme girdide değil, çıktı + ödül anında; yeni kategori/hesap/AI/seri yok; kapılar ölçülebilir (bölüm 8).

## 1. Yöntem ve sınırlar

- ~40 web araması/sayfa çekimi (Eylül 2026). Ürün başına dört soru: paylaşılan çıktının görsel dili, iç ekran hissi/ödül anı, uyarlanabilirlik, kopyalanmaması gerekenler.
- **Görsel çıktıların kendisine bakılmadı** (araç metin döndürüyor, görsel değil). Renk/tipografi/kompozisyon ifadeleri tasarım basını ve resmi
  yazılardan çıkarıldı; yani bir kartın "nasıl göründüğü" değil "nasıl tarif edildiği" kaydedildi. Kesin görsel kıyas için Batuhan/visual-designer'ın
  referans ekran görüntülerini doğrudan incelemesi gerekir.
- "Bizde var mı" hükümleri **ekran görüntüsünden değil** 01/10 belgelerinden (K1/K4 kayıtları) alındı; bu belgede emülatöre/cihaza bakılmadı.
- Google Play sayfaları araç tarafından çekilemedi; Play sayıları arama özetinden -> **doğrulanmadı**. App Store sayfaları çekildi [B].
- 403 / erişilemeyen: Yemeksepeti kurumsal sayfası, Headphonesty, SAGE makalesi -> yalnızca arama özeti [İ].
- İncelenen ürünlerin çoğu **kazananlardır** ve büyük ekip/ağ etkisine sahiptir; hayatta kalma yanlılığı bölüm 7'de ele alınıyor.
- "Bulunamadı" ifadesi "yok" demek değildir; arama motoru mağaza içi aramayı kanıtlamaz.

## 2. Ürün ürün inceleme

Her ürün: (1) paylaşılan çıktının görsel dili, (2) iç ekran hissi/ödül anı, (3) bize uyarlanabilir 3 somut fikir (yerel-only, hesapsız, emoji veri),
(4) kopyalanmaması gerekenler.

### 2.1 Spotify Wrapped

**(1) Paylaşılan çıktı.** Her "veri hikâyesi" kendi **paylaşım kartına** sahip; Spotify Messages'a veya sosyal ağlara doğrudan gönderilir [B: [Spotify 2025 UX](https://newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/)].
2024: özel yazı tipi *Spotify Mix* ana grafik öğe, "blood red / neon pink / canary yellow" palet, Bauhaus ve 1960'lardan geometrik şekiller, stop-motion hissi [İ: [Its Nice That](https://www.itsnicethat.com/features/spotify-wrapped-2024-graphic-design-041224), [Envato](https://elements.envato.com/learn/spotify-wrapped-2024)].
2025: palet daraltıldı (siyah, beyaz, yeşil, kırmızı), condensed italic + outline yazı, grunge doku, el çizimi karalama/doodle, "karmaşık grafik yerine sadelik" [İ: [Envato](https://elements.envato.com/learn/spotify-wrapped-design-aesthetic)].
Kompozisyon yorumu (ikincil): kartlar ekran görüntüsü düşünülerek en-boy, tipografi, kontrast açısından tasarlanmış; kullanıcı istatistiği açıklamak zorunda kalmıyor [İ: [UX Playbook](https://uxplaybook.org/articles/spotify-wrapped-ux-design-lessons), [SoundGuys](https://www.soundguys.com/spotify-wrapped-2025-149778/)].
**(2) İç his.** Sıralı hikâye akışı; 2025'te hız ayarı ve geri dönme kontrolleri; Listening Age, "Clubs" (altı dinleme tarzı), Top Song Quiz gibi *oyunlaştırılmış kimlik* öğeleri [B: newsroom].
Uygunluk eşiği: 30+ şarkı (>=30 sn) ve 5+ farklı sanatçı [B: newsroom] = bizim "3-4 dolu gün" eşiğinin karşılığı.
Sayıyı hikâyeye çevirme ("47.283 dakika" yerine "788 saat kendini bulmak") [İ: UX Playbook].
**Ölçek:** 2025'te ilk 24 saatte 200M+ etkileşimli kullanıcı (+%19), 500M+ paylaşım (+%41); 2024'te aynı eşiğe 62 saatte ulaşıldı [İ: [TechCrunch](https://techcrunch.com/2025/12/04/spotify-says-wrapped-2025-is-its-biggest-yet-with-200m-users-in-its-first-day), Spotify beyanı aktarımı; "engaged" ve "share" tanımı doğrulanmadı].
Not: UX Playbook'un "227M paylaşan / 2,3 milyar gösterim" rakamı Spotify'ın 24 saatlik rakamlarıyla tutarlı bir metrik değil -> **kullanılmadı, doğrulanmadı**.
**2024 tepkisi:** top genres ve "Sound Town"/aura gibi kişilik öğeleri kalktı, AI podcast ve "Listening Characters" (horoskop gibi, kullanıcıya özgü değil) eleştirildi; "scrapbook değil rapor gibi";
eleştiri gönderilerinden biri 108.000+ beğeni aldı [İ: [TechCrunch 2024](https://techcrunch.com/2024/12/04/spotify-users-are-disappointed-by-an-underwhelming-wrapped-this-year), [Forbes](https://www.forbes.com/sites/danidiplacido/2024/12/05/spotify-wrapped-2024-backlash-controversy-and-memes/)].
Neden paylaşıldığına dair akademik açıklamalar (benlik kavramı, sosyal karşılaştırma, aidiyet) **kuramsal**; Wrapped paylaşımını ölçen ampirik çalışma atıf verilmemiş [B/İ: [The Conversation](https://theconversation.com/spotify-wrapped-is-about-more-than-what-songs-you-listen-to-its-about-what-makes-you-you-245019)].

**(3) Bize uyarlanabilir 3 fikir.**
1. *Tek kartta tek fikir:* iki paylaşım kartı - "unvan kartı" (unvan + büyük mühür + emoji şeridi) ve "karne kartı" (tam düzen). Küçük önizlemede (WhatsApp) yalnızca unvan okunduğundan (10 belgesi) unvan kartı asıl paylaşım nesnesi olur.
2. *Üç vuruşlu açılış + atla/geri:* reveal'i unvan -> satırlar -> özet+mühür sıralı üç anda ver; "atla" (Wrapped'ın hız/geri kontrolünün yerel karşılığı). `Animated` yeterli, yeni bağımlılık yok.
3. *Kimlik öğesini artır, veriyi azalt:* "geçen haftaya göre" cümlesi bir "evrim" satırı olarak unvan bloğuna yaklaşsın. Wrapped 2024'te "Music Evolution" tuhaf/yanlış görününce zarar gördü; bizim delta kuralı deterministik, cümle *doğru* kalmalı.
**(4) Kopyalanmaması gerekenler.** AI üretimli anlatı (2024 tepkisi; bulut AI ayrıca gizlilik sözünü bozar), neon-gradyan + dev sayı dili, liderlik/karşılaştırma (Fan Leaderboard, hesap gerektirir), Spotify'a ait yazı tipi/renk/logo/"Wrapped" adı.

### 2.2 Strava (Year in Sport, haftalık özet)

**(1) Paylaşılan çıktı.** Tasarım sistemi "lines, dots, colour strips, circles, and typography"den; palet Strava'nın turuncu/gri/siyahını bırakıp yarış numarası ve spor giyimden esinlenen lacivert/zeytin yeşili [İ: [Its Nice That](https://www.itsnicethat.com/articles/manual-strava-year-in-sport-graphic-design-150321)].
Animasyonlar After Effects -> Lottie (JSON), iOS/Android'de tutarlı, 11 dilde; anlatı bölümler halinde, Instagram Story benzeri carousel [İ: aynı].
Paylaşım: tek tek görseller **veya özet görsel**; Instagram, Facebook, TikTok ve mesajlaşma; toplu dışa aktarma yok, galeriye kaydet var [B: [Strava Yardım](https://support.strava.com/en-us/articles/15401959-your-year-in-sport)].
**(2) İç his.** Yalnızca mobil uygulamada, "Progress" sekmesinde görsel kartlar serisi; 8 Aralık 2025 - 23 Ocak 2026 penceresi; en az 3 aktivite şartı [B: aynı] = ritüel tarihi + minimum veri eşiği kalıbı.
**Paywall:** 2025'te ilk kez yalnızca aboneler ($80/yıl) için; kullanıcı tepkisi olumsuz, Strava geri almadı [İ: [Slashdot](https://news.slashdot.org/story/25/12/19/2158235/strava-puts-popular-year-in-sport-recap-behind-an-80-paywall), [road.cc](https://road.cc/content/news/strava-year-sport-now-only-subscribers-317425)].

**(3) Fikirler.**
1. *İlkel şekillerden veri görseli:* 4 kategori = 4 sabit geometrik ilkel (çeyrek daire/çubuk/nokta); seviye = doluluk/boyut. Sayı yok, yargı yok, tanınır bir "Haftik deseni" (bölüm 5, fikir 7).
2. *"Özet + tek tek" paylaşım:* hem tam karne hem tek satırlık kart; gizli kategori ikincil kartta hiç üretilmez (gizlilik kuralı korunur, `???` sorunu azalır).
3. *Palet kaynağı = kullanılan nesne:* Strava yarış numarasından aldı; biz **okul karnesinden**: krem kâğıt, mürekkep, mühür moru (10 belgesiyle örtüşür; gerekçeli).
**(4) Kopyalama.** Paylaşım anını ücret duvarına koymak (tepki kanıtlı); yalnızca gerçek zamanlı sosyal grafikle anlamlı "kudos/antrenman partneri" öğeleri.

### 2.3 Daylio (Year in Pixels)

**(1) Paylaşılan çıktı.** "Every dot is a day"; her gün ruh haline göre renklenen bir yıl ızgarası, resim olarak dışa aktarılıp paylaşılır [B: [daylio.net](https://daylio.net/)].
Görselin ayrıntıları (renk sayısı, tipografi) doğrulanamadı [D]; çıktı bir *grafik*, kimlik/espri taşıyan bir *nesne* değil (çıkarım).
**(2) İç his.** İkon/emoji seçerek dakikalar içinde kayıt; özelleştirilebilir ikon veritabanı ve renk temaları, koyu mod, widget, PIN, VoiceOver ve azaltılmış hareket desteği [B: [App Store](https://apps.apple.com/us/app/daylio-journal-mood-tracker/id1194023242)].
Ölçek: sitede "20 milyon+ kullanıcı" iddiası (kendi beyanı) [B, doğrulanmadı]; App Store 4.8 / 62.000 puan [B]; Google Play 4.8 / ~393K yorum [İ, arama özeti]; Türkçe dahil çok dilli [İ].
Gelir: ücretsiz + abonelik (App Store'da 5 farklı IAP fiyatı, $4,99-$59,99) [B]. Ücretli duvar şikayetiyle doğan alternatif projeler [İ: [ChoosingTherapy](https://www.choosingtherapy.com/daylio-app-review/)].
**Doygunluk sonucu:** girdi katmanında (emoji + günlük) kategori doygun; Haftik'in ayrışma alanı *girdi* değil *haftalık esprili paylaşım nesnesi*.

**(3) Fikirler.**
1. *Ay/yıl mozaiği:* "piksel" fikrinin bizdeki karşılığı: haftalık karne = bir hücre; 4 haftada "ay karnesi", 52 haftada "yıl mozaiği" (galeri, ayrı intent; bölüm 5 fikir 10).
2. *Renk = sözlük ama yargısız:* Daylio'da renk ana kod. Bizde seviyeyi değil **kategoriyi** renklendirmek (bölüm 3, kural 3).
3. *Kişiselleştirilebilir tema:* kâğıt/mühür tonunu 3-4 hazır seçenekten seçme; paylaşımın "benim" hissini artırır, hesap gerektirmez (düşük öncelik).
**(4) Kopyalama.** "Kötü->iyi" renk gradyanı (yargı; 01 T6 ile aynı sorun), kullanıcıyı ön yüzde paywall'a iten akış.

### 2.4 Bearable

**(1) Paylaşılan çıktı.** Belirgin bir paylaşım kartı/görseli bulunamadı [D] (semptom/analiz odaklı ürün; paylaşımdan çok analiz çıkarımı, doğrulanmadı).
**(2) İç his.** Çok fazla izleme seçeneği "overwhelming", kurulum uzun, günde 2-3 check-in [İ: [ChoosingTherapy](https://www.choosingtherapy.com/bearable-app-review/)].
Ürünün kendisi bunu kabul ediyor: ana sayfayı özelleştir, semptomları kapat, "yalnızca en önemliyi izle, kalanı gizle" [B: [Bearable destek](https://bearable.app/support/common-questions/make-bearable-less-overwhelming/)].
**(3) Fikirler.** (a) *Progressive disclosure:* v1'i 4 kategoride tut; girdiyi büyütme. (b) *İlk 3 gün tek ekran akışı bozulmasın.* (c) *Seçici paylaşım bir erdem:* kartta gizle/göster zaten var; bunu mağaza/onboarding metninde "ne göstereceğine sen karar verirsin" diye anlat.
**(4) Kopyalama.** Yoğun ana sayfa, sağlık/semptom dili (S12 Health beyan sınırı), günde birden çok check-in.

### 2.5 Finch

**(1) Paylaşılan çıktı.** Ana çıktı kart değil; **evcil kuş/ev özelleştirmesi** kimlik nesnesi (yumurta rengi, isim, zamir, kıyafet/mobilya; "rainbow coins" ile) [İ: [WhistleOut](https://www.whistleout.com/CellPhones/Apps/finch-self-care-app-review), [Pratt IxD](https://ixd.prattsi.org/2026/02/design-critique-finch-self-care-pet-ios-app/)].
**(2) İç his.** Ceza yok, yumuşak dil; görev tamamlanınca kuşun ilerlemesi ve para ödülü; "steril alışkanlık takipçisi" hissinin tersi [İ]. Play: 4.9 / 623.766 puan, 10M+ indirme [İ, arama özeti, doğrulanmadı].
Eleştiri: Ayarlar/Quest ekranlarında karmaşa ve karar yorgunluğu [İ: Pratt]; bildirim yağmuru, "sağlıklı olmayı *sergiliyordum*", 4-6 ayda tükenme (tek yazar gözlemi) [İ: [Slate, Eylül 2026](https://slate.com/technology/2026/09/finch-app-self-care-wellness-review.html)]; Finch Plus $9,99/ay - $69,99/yıl [İ: Slate].
**(3) Fikirler.**
1. *Mühür = koleksiyon nesnesi:* kuş yerine mühür; her haftalık karne ile yerel bir "mühür koleksiyonu" büyür, kilometre taşlarında yeni desen açılır. Kayıp/ceza yok.
2. *Emoji "sahnesi":* haftanın emojilerinden küçük bir kompozisyon (4 emoji) kartın ek görseli olur; iç ekranda hafif nabız/hareket.
3. *Yumuşak dil sözleşmesi:* atlanan gün sessiz kalır; 03'teki "utandırma yok" ilkesi burada kanıt bulur (tükenme eleştirisi).
**(4) Kopyalama.** Para birimi/ekonomi ve mağaza; sürekli bildirim; arkadaş ilerlemesini görme (hesap); ücretli özelleştirme duvarı.

### 2.6 How We Feel

**(1) Paylaşılan çıktı.** Belirgin paylaşım kartı bulunamadı [D]; **renk kodlu duygu matrisi** (enerji x hoşluk eksenleri, 144 duygu kelimesi) ürünün ana görsel dili [İ: [Marc Brackett](https://marcbrackett.com/how-we-feel-app-3/), [New England Psychologist](https://www.nepsy.com/articles/leading-stories/yale-psychologists-launch-mood-meter-app/)].
**(2) İç his.** Ücretsiz; App Store 4.9 / 30K puan, Apple Editors' Choice; yorumcular "aesthetically pleasing", "visual effects" diyor; veri cihazda, araştırma paylaşımı isteğe bağlı [B: [App Store](https://apps.apple.com/us/app/how-we-feel/id1562706384)].
Yale Duygusal Zeka Merkezi + Pinterest kurucu ortağı Ben Silbermann desteği [İ].
**(3) Fikirler.**
1. *Renk = kategori sözlüğü:* kullanıcı renk-alan eşlemesini birkaç günde öğrenir; bizde 4 sabit kategori tonu (bölüm 3, kural 3).
2. *Onay ekranını bir "an" yap:* Kaydet -> renk yayılma/dolma (`Animated`) ve tek satır sıcak metin (03 Ö1 ile aynı; referansla destekli).
3. *Gizlilik sözünü görselleştir:* "veri cihazında" hafif ikonu onboarding/Ayarlar'da (HWF aynı taahhüdü vurguluyor).
**(4) Kopyalama.** 144 kelimelik sözlük (girdi karmaşıklığı), klinik iddia/Yale bağı, "duygu düzenleme stratejisi" tıbbi ton (S12).

### 2.7 Stoic

**(1) Paylaşılan çıktı.** Belirgin paylaşım kartı bulunamadı [D].
**(2) İç his.** Siyah-beyaz, "atmosferik", sakin estetik övgü alıyor; "Journey" ekranında içgörü ve duygu trendleri toplanıyor [İ: [Reflection](https://www.reflection.app/journaling-apps/stoic), [B: Stoic blog](https://www.getstoic.com/blog/stoic-journal-update-2025-18)].
Yaklaşım: felsefeye dayalı yapı (sabah hazırlık, akşam değerlendirme).
**(3) Fikirler.** (a) *Yüksek kontrast + tek vurgu* (bizde krem/mürekkep/mor): sakin ama kimlikli çerçeve. (b) *"Yolculuk/geçmiş" tek ekran:* birikimi göstermek (galeri intent'i). (c) *Ritüel dili:* "akşam karnesi" gibi doğal ritüel adı; 21:00 bildirim metin havuzu için (copywriter).
**(4) Kopyalama.** AI mentor/yorum katmanı, serbest yazı içeriği (bizde metin girişi yok; bulut yok).

### 2.8 Gyroscope

**(1) Paylaşılan çıktı.** Günlük/haftalık/aylık/yıllık raporlar otomatik üretilir, görsel olarak kaydedilir veya Instagram'da paylaşılır; kare kart düzeni ve "Health Score" [İ: [App Store](https://apps.apple.com/us/app/gyroscope/id1104085053), [TNW](https://thenextweb.com/apps/2016/10/06/best-life-tracking-gyroscope/) (2016, eski)].
**(2) İç his.** Kare kartlar, çok kaynaklı veriyi tek panoda birleştirme; entegrasyon ağırlıklı. Güncel görsel ayrıntı doğrulanamadı [D] (kaynaklar eski/özet).
**(3) Fikirler.** (a) *Kaydet/Paylaş, reveal sonunun tek belirgin eylemi olsun* (Gyroscope paylaşımı sayfa dibine koymuş). (b) *Kare (1:1) çıktı seçeneği* (WhatsApp sohbeti/profil). (c) *"Değişim" tek işaretle* (delta zaten var; renksiz/yargısız ok).
**(4) Kopyalama.** Tek bir "skor" (sayı + yargı; spec "kartta ham sayı yok"), çok entegrasyon, sağlık skoru iddiası.

### 2.9 Apple Fitness / Health özetleri

**(1) Paylaşılan çıktı.** Üç iç içe halka: kırmızı Move, yeşil Exercise, mavi Stand [B: [Apple Destek](https://support.apple.com/guide/watch/track-daily-activity-with-apple-watch-apd3bf6d85a6/watchos)]. Halka = anında tanınır *tek geometrik imza*.
Ödüller: kişisel rekor, seri, kilometre taşı; sınırlı sayıda özel ödül; Mesajlar için animasyonlu rozet/sticker [İ: [iDownloadBlog](https://www.idownloadblog.com/2025/04/14/apple-watch-activity-awards-10-years-celebration/)].
**(2) İç his.** "Weekly Summary": günlük ortalama ve haftalık toplam [B]. Halka kapanış hareket/ses/haptik ayrıntısı doğrulanamadı [D].
**(3) Fikirler.**
1. *Tek geometrik imza:* 4 kategori = dört çeyrek/dört yaprak "Haftik deseni" (bölüm 5, fikir 7); gizli kategori nötr çizilir (seviye sızmaz).
2. *Haftalık ilerleme halkası:* Hafta sekmesinde 7 nokta yanında "kart dolum halkası"; yalnızca dolu gün sayısına bağlı (içerik sızdırmaz).
3. *Çıkartma (sticker) olarak paylaşım:* şeffaf PNG unvan+mühür; Story'de yapıştırılabilir. **Uygulanabilirliği (Android/Instagram akışı) doğrulanmadı [D]**; sonra denenmeli.
**(4) Kopyalama.** "Halkaları kapat" baskısı ve uyarılar (kayıp korkusu), sınırlı süreli ödüller (FOMO), arkadaşla yarış (hesap).

### 2.10 Duolingo (seri, kilometre taşı, haftalık lig)

**(1) Paylaşılan çıktı.** Kilometre taşı kutlaması tam ekran hareketli sahne (Duo ankaya dönüşür; 7/30/100/365 günlerinde); tasarım ilkeleri: evrensellik, artırılmış kutlama, **uygulama içinden paylaşılabilir kart** [B: [Duolingo blog](https://blog.duolingo.com/streak-milestone-design-animation)]. (Kilometre taşı günlerinin sayısı ikincil özetten: [İ].)
**(2) İç his.** Anında geri bildirim, oyunlaştırma; "daha fazla kişi serisini koruyor" (sayısız, kendi beyanı) [B]. Streak Wager: +%14 D7 elde tutma [B: [Duolingo blog](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/)]; "Weekend Amulet": +%4 hafta sonrası dönüş, -%5 seri kaybı [B: aynı]. "Aşırı ders yapanlar bırakmaya daha yatkın" bulgusu [B: aynı] -> ölçülü tempo.
DAU'nun %50'den fazlasının 7 günden uzun serisi var (S-1 aktarımı) [İ, arama özeti, doğrulanmadı]; "7 günlük seri 2,4x geri dönüş" yaygın alıntı [İ, birincil doğrulanmadı].
**(3) Fikirler.**
1. *Kaydet anı = mikro-kutlama:* normal günde kısa "mühür basıldı" hissi (isteğe bağlı titreşim; RN yerleşik `Vibration`, yeni bağımlılık yok), kilometre taşında (1., 4., 10. karne) daha büyük.
2. *Kayıpsız ilerleme sayacı:* seri değil **toplam karne sayısı** (asla sıfırlanmaz); kilometre taşı = özel mühür varyantı.
3. *Paylaşım kartı uygulama içinde hazır:* Duolingo'da kutlama ekranı zaten paylaşılabilir kart; bizde reveal sonu = paylaşım önizlemesi, tek akış.
**(4) Kopyalama.** Streak Wager/harcama ile seriyi bahse koymak, seri kaybı korkusu, azalan-ürün mağazası, agresif bildirim. 03 belgesinin "günlük seri önerilmez" kararını bu inceleme **doğruluyor**: Duolingo'nun bile sürtünmeyi azaltmak için "opsiyonel araçlar" eklemesi, seri baskısının maliyetli olduğunu gösteriyor.

### 2.11 Letterboxd (Year in Review)

**(1) Paylaşılan çıktı.** Yıllık kişisel özet e-posta/web; topluluk özeti ayrı tarihte; illüstrasyonlu poster sanatı (Agata Nowicka'ya atıf) [B: [Letterboxd FAQ](https://letterboxd.com/journal/2025-letterboxd-year-in-review-faq/)]. Renk/tipografi ayrıntısı belgede yok [D].
**(2) İç his.** Şart: 2025'te en az 10 film; kişisel özet 2 Ocak, topluluk 12 Ocak (ritüel tarih); gizlilik üç düzey (Herkes / Yakın arkadaşlar / Özel) [B: aynı]. Pro/Patron: yıl boyu istatistik.
**(3) Fikirler.**
1. *İnsan yapımı illüstrasyon:* 12 temel unvan için el çizimi/kolaj küçük görsel (Wrapped 2025'in el çizimi yönü ve Letterboxd ile örtüşür); efor yüksek, ama en tanınabilir farklılık; başlangıç 4-6 unvan (ertelenen).
2. *Eşik + tarih ritüeli:* "ilk karne için 3 gün" (var) + "her Pazar 20:00" (var); Wrapped'ın "Aralık" hissini bizde **"Pazar 20:00" kimlik cümlesine** dönüştür (mağaza/onboarding metni).
3. *Görünürlük düzeyi:* gizle/göster var; paylaşım hedefini WhatsApp sohbet/Durum olarak da öner (2.15).
**(4) Kopyalama.** İstatistiği abonelik arkasına almak, herkese açık günlük tarihleri (kartta tarih yok kuralı).

### 2.12 Receiptify

**(1) Paylaşılan çıktı.** Şarkıları **fiş kalemleri** olarak gösteren, buruşuk gerçekçi fiş görseli; PNG indirilir [B: [STUDIO for Creative Inquiry](https://studioforcreativeinquiry.org/project/receiptify)]. Sahte sipariş numarası, toplam süre ve teşekkür mesajı gibi ayrıntılar [İ: arama özetleri, birincil sayfada ayrıntılı listelenmiyor]. Kurucu: Michelle Liu (CMU birinci sınıf öğrencisi, 2020) [B]; ilham: @AlbumReceipts hesabı [İ]. **İlk aylarda 1M+ kullanım** (kurucu/kurum beyanı, "kullanım" != aktif kullanıcı) [B].
**(2) İç his.** Uygulama yok; tek web akışı: hesabı bağla -> süre seç -> PNG. Ödül anı = sonuç görseli.
**Bağımlılık riski:** Spotify Web API kısıtları (27 Kasım 2024) Receiptify tarzı araçları etkiledi denmektedir; kapsam ve güncel durum doğrulanamadı [İ: [TechCrunch](https://techcrunch.com/2024/11/27/spotify-cuts-developer-access-to-several-of-its-recommendation-features/), [Music Ally](https://musically.com/2024/11/28/spotify-removes-features-from-web-api-citing-security-issues/)]; "tamamen kapandı" kanıtı yok.
**(3) Fikirler.**
1. *Karne ayrıntı mizahı:* Receiptify'daki "sahte sipariş no + teşekkür" gibi, karnede **uydurma resmi ayrıntılar**: "Öğretmen görüşü" (=özet), "Davranış", "Devam durumu" - not/rakam yok. Dikkat: spec "kartta ham sayı yok"; uydurma bir "belge no" bile içerik testlerinin rakam taramasını tetikleyebilir, önce kontrol. Türkiye'deki karne terimlerini kaynak aramadan biliyorum [D]; copywriter doğrulamalı.
2. *Tek dokunuşla PNG:* reveal sonunda tek "Kaydet/Paylaş".
3. *Ürün = biçim:* "Haftik = karne" metaforunu her yüzeye (splash, ikon, damga, bildirim) aynı dille taşı.
**(4) Kopyalama.** Üçüncü taraf API'ye dayanan veri (bizde yok, iyi), "tek atımlık" araç olmak (alışkanlık kanıtı yok).

### 2.13 BeReal

**(1) Paylaşılan çıktı.** Ham, filtresiz çift kamera fotoğrafı; görsel dil "kusurlu/otantik" [İ]. Kart/özet değil.
**(2) İç his.** Günlük rastgele bildirim + iki dakikalık pencere = aciliyet; 2022'de 73,5M kullanıcı zirvesi, sonra ~40M aylık aktif [İ: [Charle](https://www.charleagency.com/articles/bereal-statistics/), düşük güvenilirlik, doğrulanmadı]. Akademik çalışma: otantik olma baskısı, performatif davranış ve özellik şişmesi ilgiyi azalttı [İ: [SAGE](https://journals.sagepub.com/doi/10.1177/14614448251393921), makale çekilemedi, yalnızca özet].
**(3) Fikirler.** (a) *Ritüel penceresi ama baskısız:* Pazar 20:00 var; "tam o an paylaş" baskısı yok. (b) *Kusurlu/samimi ton:* karne metinlerinde "kusursuz" olmayan, öz-şakacı ton. (c) *Aynı anda herkese açılış hissi:* "Pazar 20:00" herkes için aynı saat = kolektif an (Türkiye tek saat dilimi; not: mevcut kural kart açılışı yerel saate göre).
**(4) Kopyalama.** Zorunlu zaman penceresi ve aciliyet baskısı, arkadaş grafiği, özellik şişmesi.

### 2.14 Locket Widget

**(1) Paylaşılan çıktı.** Ev ekranına gelen arkadaş fotoğrafı; aylık "recap" videoları; 20 arkadaş sınırı [İ: [App Store](https://apps.apple.com/us/app/locket-widget/id1600525061), [TechCrunch 2022](https://techcrunch.com/2022/01/11/locket-an-app-for-sharing-photos-to-friends-homescreens-hits-the-top-of-the-app-store/)].
**(2) İç his.** Widget = ürün yüzeyi; App Store'da 2022'de 3,4 puan: kullanıcılar widget'ı çalıştırmayı/onboarding'i anlamadı [İ: TechCrunch aktarımı, tarihli].
Büyüme: tek geliştirici hediye olarak yaptı, 80M indirme (doğrulanmadı), 26 yaratıcıyla ~298M TikTok görüntüleme [İ: [Substack](https://saba.substack.com/p/from-a-gift-for-his-girlfriend-to-d24), [Social Growth Engineers](https://www.socialgrowthengineers.com/lockets-26-creators-298m-views-free-hook-dataset)].
**(3) Fikirler.** (a) *Onboarding testi:* düşük puan onboarding kafa karışıklığından; bizim onboarding metin-yalnız (01 T2) -> "ÖRNEK" kart + tek görev. (b) *Android widget* (bugünkü işaretle/kart minyatürü): tekrar açma yüzeyi; **ayrı intent** (spec dışı). (c) *Aylık özet:* 4 hafta sonra "Ay karnesi" (galeri intent'inin küçük hali).
**(4) Kopyalama.** Arkadaş grafiği ve sunucu, ödenmiş yaratıcı ağı (attribution ölçümü gerektirir; gizlilik sözü), hesap.

### 2.15 Türkiye pazarı

- **Kanallar:** TÜİK 2026 verisi aktarımları: WhatsApp %90, YouTube %77,6, Instagram %71,1 kullanım; DataReportal: WhatsApp Türkiye'de 58,5M aylık aktif [İ: [Sözcü](https://www.sozcu.com.tr/ne-instagram-ne-x-ne-de-facebook-turkiye-nin-en-cok-kullanilan-uygulamasi-belli-oldu-p342804), [DataReportal](https://datareportal.com/reports/digital-2026-turkey); orijinal TÜİK tablosu çekilmedi -> doğrulanmadı].
  Sonuç: paylaşım hedefi yalnızca Instagram Story değil, **WhatsApp Durum ve sohbet**; kart hem 9:16 hem kare/önizleme dostu olmalı.
- **Yerel Wrapped kalıbı:** Yemeksepeti kullanıcıya özel eğlenceli "2025 Keyif Özeti" sundu [İ: arama özeti, kurumsal sayfa 403]; Spotify Türkiye 2025'te en çok dinlenen BLOK3, ilk 100 şarkının 98'i yerli [İ: [T24](https://t24.com.tr/gundem/spotify-wrapped-2025-yayinlandi-en-cok-blok-3-dinlendi,1280891)] -> yerel içerik/mizah kimlik unsuru.
- **Yerel rakipler (ruh hali takibi):** Play'de Türkçe listelenmiş çok sayıda uygulama (Mood Tracker Pro, Günlük Ruh Hali Takibi, MoodMate [İstanbul merkezli olduğu belirtilmiş], Ruh Hali Yardımcısı vb.) [İ: arama sonuçları]; **puan/indirme sayıları alınamadı [D]**. Paylaşılan haftalık esprili "karne" kartı sunan bir Türkçe ürün **bulunamadı** (bulunamadı != yok; mağaza içi arama yapılamadı). Daylio Türkçe destekli [İ] -> dil tek başına fark değil.
- **Fiyat duyarlılığı:** Türkiye'de abonelik/IAP ödeme alışkanlığı için güvenilir rakam bulunamadı [D]; yalnızca mobil oyun harcamasının 2024'te %28 arttığı (Sensor Tower aktarımı) [İ] - genel ödeme niyeti kanıtı değil.
- **Kültürel çapa ("karne"):** Okul karnesinin Türkiye'de tanıdık bir ritüel olduğu ve dilde mizahi kullanıldığı **varsayım** (arandı, kaynak bulunamadı) [D]; copywriter 5 kişilik kullanıcı diliyle doğrulamalı.
- **Story güvenli alanı:** 1080x1920'de üst ~250 px ve alt ~340 px metin/logo için boş bırakılmalı (yaygın Meta kılavuzu aktarımı) [İ: [Outfy](https://www.outfy.com/blog/instagram-safe-zone/), [Argil](https://www.argil.ai/blog/instagram-story-dimensions)]. 10-gorsel-kimlik düzeninde altbilgi (1548-1776 px) bu bölgenin **196/228 px'ini (~%86)** kaplıyor ve mühür de orada; unvan bloğu 168 px'te başlıyor, üst bölgeyle ~82 px çakışıyor. Cihazda ölçülmedi; birincil Meta belgesi doğrulanmadı. (Not: bu bölgeler kartı *izleyen* kişinin arayüzünün kapattığı yerlerdir.)

## 3. Çarpıcı paylaşım kartının 7 ortak kuralı

Kaynak: bölüm 2'deki ürünlerin ortak kalıbı. Kural = gözlem (kanıtlı) + Haftik'te durum (01/10 belgeleri) + ölçüt. **Bu kuralların paylaşım oranını nedensel olarak artırdığına dair ölçülmüş kanıt yok** (bölüm 8).

| # | Kural | Kanıt (ürün) | Haftik'te durum | Ölçüt |
|---|---|---|---|---|
| K1 | **Tek kart, tek mesaj; açıklama gerektirmez.** Her paylaşım nesnesi tek fikir taşır. | Wrapped: her hikâye kendi kartı [B]; Receiptify: tek metafor [B]; Strava: tek tek + özet görsel [B] | Karne kartında 6+ öğe (başlık, unvan, 4 satır, özet, damga, mühür). Tek nesnede yoğun; "unvan kartı" yok. | 5 kişi 3 sn bakar: "ne anlatıyor?" >= 4/5 unvanı söyler |
| K2 | **Kimlik > veri.** Kart "ne yaptın" değil "kimsin" der. | Wrapped Clubs/Listening Age [B]; 2024'te kimlik öğelerinin çıkarılması tepki aldı [İ]; Receiptify "sen busun" fişi | Unvan var, ama varsayılan paylaşımda çoğunlukla `???` (01 T13: <= 16/81 kombinasyon) | Görünür unvan oranı (01 K2 scripti) >= %90 |
| K3 | **Kısıtlı, cesur palet; renk ana taşıyıcı; bir imza yazı ağırlığı.** | Wrapped 2025: 4 renk + condensed italic [İ]; Strava: bib/apparel paleti [İ]; HWF ve Daylio: renk = anlam sözlüğü [B/İ] | Kâğıt+mor öneri iyi ama "çekingen" riski (10 belgesi de uyarıyor); renk anlam taşımıyor (kategori/seviye yasak) | 5 kişi "bitmiş mi?" >= 4/5; renk yargı çağrıştırıyor mu: <= 1/5 |
| K4 | **Tek tanınır imza şekil/metafor.** Bir bakışta marka. | Apple halkalar [B]; Receiptify fiş [B]; Daylio piksel ızgarası [B]; Strava çizgi-nokta-daire [İ] | Mühür var (öneri; uygulanmadı). Tek başına "yapıştırılmış rozet" olma riski; metafor kartın diline yayılmıyor | Kart PNG'sinde logo kapatılınca 5 kişiden >= 3'ü hâlâ "Haftik" der (varsayım: tanıma testi) |
| K5 | **Küçük önizlemede ve güvenli alanda okunur.** Dev tip, kritik içerik ortada. | Wrapped "ekran görüntüsü için tasarım" [İ]; Story 250/340 px bölgeleri [İ] | WhatsApp önizlemesinde yalnızca unvan okunuyor (10); altbilgi+mühür alt bölgede %86 (bölüm 2.15) | Gerçek Android'de Instagram Story + WhatsApp Durum ekran görüntüsü: mühür/unvan kırpılmıyor |
| K6 | **Açılış bir "an": sıralı, tempolu, kontrol kullanıcıda.** | Wrapped 2025 hız/geri kontrolü [B]; Strava bölümlü anlatı [İ]; Duolingo kutlama zamanlaması ("timing is everything") [B] | Reveal 1,2 sn yalnız opaklık (01 T5); atlama/tempo yok; mühür animasyonu 10'da önerilmiş, yok | Gerçek cihazda K-03 akıcılık; 5 kişi "ekran görüntüsü alır mıydın?" >= 3/5 |
| K7 | **Paylaşım sürtünmesiz, kullanıcı kontrollü; marka kartın parçası, filigran değil; paylaşım paywall'da değil.** | Duolingo kutlama = paylaşılabilir kart, uygulama içinde [B]; Strava tek/özet görsel, galeriye kaydet [B]; Letterboxd 3 görünürlük düzeyi [B]; Strava paywall tepkisi [İ] | Paylaşım 3 adım (kart -> önizleme -> paylaş); gizleme kontrolü var (iyi); damga yer tutucu (01 T14); paylaşım metni hedefe taşınmıyor | Kart ekranından paylaşım sayfasına <= 2 dokunuş; PNG'de köşeli parantez 0 |

## 4. Amatör görünümü yaratan 10 tipik hata (bizde hangileri var)

"Bizde var mı" hükmü 01/10 belgelerindeki teşhisten (K1/K4) alınmıştır; bu belgede ekran görüntüsüne bakılmadı. Referans karşılığı bölüm 2-3'ten.

| # | Tipik hata | Referanslarda tersi | Bizde? | Kanıt (iç belge) | İlk düzeltme |
|---|---|---|---|---|---|
| H1 | **Şablon tema, ikon ve splash** (platform varsayılanı) | Her referansın kendi paleti/işareti var (Strava bib paleti, Apple halkalar) | **VAR** | 10 G1, G2; 01 T3 | İkon + tek marka rengi + splash (10 Bölüm 6) |
| H2 | **Rengin görev taşımaması** (tek vurgu siyah, her şey gri) | HWF/Daylio/Strava renk = anlam veya kimlik [B/İ] | **VAR** | 10 G1, G3 | Vurgu rengi + kategori tonları (bölüm 5, fikir 8) |
| H3 | **Hiyerarşi var, imza yok** (kart beyaz belge) | Receiptify fiş, Apple halka, Daylio piksel | **VAR** | 10 G5 | Mühür + karne çerçevesi + belge ayrıntı mizahı (fikir 3) |
| H4 | **Eylemin ödülü yok** (Kaydet sonrası sessizlik) | Duolingo anında geri bildirim + haptik/animasyon [B/İ]; HWF ve Apple ödül anı | **VAR** | 01 T4; 03 §1 | Kaydet mikro-anı (fikir 1) |
| H5 | **Bekleme durumu "yükleniyor" gibi** (gri iskelet + kilit) | Strava/Letterboxd bekleme = ritüel tarih; Wrapped anticipation (özel logo varyantları) [İ] | **VAR** | 10 G4 | Kartın minyatürü + dolum halkası (fikir 7) |
| H6 | **Tipografi/ikon dili dağınık** (kart Inter, kabuk sistem; emoji sekme ikonları; sabit renkler) | Wrapped Spotify Mix; Strava tek sistem [İ] | **VAR** | 10 G8 | Inter kabuk genelinde + vektör sekme ikonları |
| H7 | **Yer tutucu/yarım metin dışarı çıkıyor** (`[mağaza bağlantısı]`, `???`) | Receiptify "teşekkür" satırı gibi bilinçli ayrıntı | **VAR** | 01 T14; 10 G6 | Damga temizliği; "sansür şeridi" (fikir 2) |
| H8 | **Boşluk/çakışma/güvenli alan** (alt %20 boş, geri düğmesi saatle çakışıyor; Story bölgeleri) | Wrapped en-boy/kontrast ekran görüntüsü için [İ] | **VAR** | 10 G3, G7; bölüm 2.15 | Üst güvenli alan (CLAUDE.md YB-1 çözüldü), kart altbilgisini 1580 px üstüne al |
| H9 | **Onboarding değeri göstermiyor** (metin-yalnız; ilk karta ~5 gün) | Locket'in düşük puanı onboarding kafa karışıklığı [İ]; Wrapped eşik metni | **VAR** | 01 T2 | "ÖRNEK" damgalı örnek kart (fikir 5) |
| H10 | **Hareketsiz/yarım his** (yalnız opaklık, haptik yok) | Duolingo/Apple/Wrapped hareket + tempo | **VAR** | 01 T5; 10 Bölüm 5 | Üç vuruşlu reveal + mühür basma (fikir 6) |

**Bizde olmayanlar (iyi):** girdi yoğunluğu/karar yorgunluğu (Bearable/Finch), bildirim yağmuru (günde <= 1, dolu günde sessiz - 03), ekonomi/para birimi, hesap. Bu, "fazla basit" hissinin bir kısmının **kasıtlı ve doğru** bir tasarım seçimi olduğunu gösterir; sorun basitlik değil, çıktı/ödül tarafının sönüklüğü.
**Ters yönde yeni hata riski:** 10 belgesindeki tüm öneriler uygulanırsa "fazla nostaljik/süslü" ve kart öğe sayısı artar (K1 ile çelişir). Düzeltme sırasında öğe sayısı sabit kalmalı: yeni öğe eklenirse eskisi çıkar.

## 5. Zenginleştirme için en güçlü 10 fikir (etki / efor / gizlilik uyumu)

**Puanlama:** Etki 1-5 (paylaşım oranı ve alışkanlığa beklenen katkı), Efor 1-5 (S=1, S-M=2, M=3, M-L=4, L=5), Oran = Etki/Efor. **Puanlar benim yargım (K0), ölçülmüş değil;** software-architect/visual-designer efor tahminini değiştirebilir.
Gizlilik uyumu: yerel-only, hesapsız, analitiksiz, kartta ham sayı/tarih yok, gizlenen kategori sızmaz. Tüm fikirler bu kısıtlarla **uyumlu** olarak tasarlandı; ayrı not gereken yerler sütunda.

| Sıra | Fikir | Kanıt bağı | Etki | Efor | Oran | Gizlilik / kapsam notu |
|---|---|---|---|---|---|---|
| 1 | **Kaydet mikro-anı:** "Kaydedildi" durumu, mühür basma hareketi, tek satır ilerleme cümlesi, isteğe bağlı titreşim (yerleşik `Vibration`). | Duolingo anında geri bildirim [B], HWF [B/İ]; 01 T4, 03 Ö1, 10 Bölüm 5 | 4 | 1 | 4,0 | Uyumlu. Plan sapması (`ekran-akisi.md`); 8 sn akışını uzatmamalı (kill KC2). Kart içeriğini sızdırmaz (yalnız gün sayısı). |
| 2 | **Karne belge mizahı:** kartta ve metinlerde uydurma resmi ayrıntılar ("Öğretmen görüşü", "Davranış", "Devam durumu", mühür, imza); parodi tonu, yargısız, not yok. | Receiptify [B/İ]; Wrapped 2024 "rapor gibi" eleştirisi [İ] | 4 | 2 | 2,0 | Uyumlu; **rakam yok** (spec/test); Türkçe karne terimleri doğrulanmalı [D]. Copywriter + visual-designer. |
| 3 | **"ÖRNEK" damgalı örnek kart** (onboarding + kilitli kutuda): uydurma içerik, kullanıcı verisi değil. | Locket onboarding kafa karışıklığı [İ]; Wrapped uygunluk eşiği [B]; 01 P9/T2 | 4 | 2 | 2,0 | Uyumlu. Risk: örneğin kendi kartı sanılması ve ilk sürprizin azalması (01 S4); damga + farklı ton ile kapatılır. |
| 4 | **Görünür unvan garantisi + `???` yerine "sansür şeridi"** (10 V1). | Wrapped 2024/2025 kimlik dersi [İ]; 01 T13; 10 Bölüm 4 | 5 | 3 | 1,7 | Mekanizma `weekly_card`'a dokunabilir; gizlenen kategori sızmamalı -> security-reviewer + software-architect (01 S2). Ürünün birincil kancası; kritik yol. |
| 5 | **Kategori başına sabit ton; seviye = doluluk/boyut** (renk yargı taşımaz). | HWF, Daylio, Strava [B/İ]; **10 belgesindeki "renk yok" kararıyla çelişir** | 3 | 2 | 1,5 | Uyumlu. Yargı algısı testi gerekir (KC5). visual-designer + ui-ux-designer kararı; kart öğe sayısını artırmaz. |
| 6 | **Kayıpsız kilometre taşı:** toplam karne sayacı (sıfırlanmaz) + 1./4./10./26. karne özel mühür varyantı. | Duolingo kilometre taşı mantığı [B], Apple ödüller [İ]; 03 Ö8 (seri yok) | 3 | 2 | 1,5 | Uyumlu, yeni sayaç `weekly_card` sayımından türetilir. Kartta "N. karne" gösterilecekse ham sayı kuralına uyup uymadığı kontrol edilmeli. Seri/utandırma yok. |
| 7 | **Paylaşım biçimleri:** unvan kartı + tam karne + kare (1:1); Story güvenli alan düzeltmesi (altbilgi/mühür 1580 px üstüne). | Wrapped/Strava tek+özet görsel [B]; WhatsApp %90 [İ]; Story bölgeleri [İ] | 4 | 3 | 1,3 | Aynı gizleme kuralları tüm biçimlerde; yeni biçim = yeni QA yüzeyi (10 V3 uyarısı). Story bölgeleri cihazda ölçülmeli. |
| 8 | **Üç vuruşlu reveal + "atla" + mühür basılır**; reduced-motion desteği. | Wrapped hız/geri [B]; Duolingo timing [B]; 10 Bölüm 5 | 4 | 3 | 1,3 | Uyumlu; yeni bağımlılık yok (`Animated`). Gerçek cihazda kare düşmesi ölçülmeli (KC4). |
| 9 | **"Haftik deseni":** 4 çeyrek/yaprak geometrik glif + Hafta sekmesinde kart dolum halkası (yalnız dolu gün sayısına bağlı). | Apple halkalar [B], Strava ilkel şekiller [İ] | 4 | 4 | 1,0 | **Sızıntı riski:** glif seviyeye göre çizilirse gizli kategorinin seviyesi görünür; gizli kategori nötr çizilmeli (security-reviewer). Sayı yok. |
| 10 | **Geçmiş karneler duvarı + ay/yıl mozaiği** (Daylio piksel fikri, ritüel yıl sonu paylaşımı). | Daylio [B], Wrapped ritüeli [B], Stoic Journey [B] | 4 | 5 | 0,8 | **Ayrı intent** (spec: galeri v2+; 01 §4.5). Tarih içermeyen mozaik tasarlanmalı; yıl sonu paylaşımı = uzun vadeli en yüksek kanca ama dağıtım/depolama kararı ister. |

**Sıra mantığı:** oran sıralaması; **kritik yol farklıdır:** #4 (unvan görünürlüğü) ve #7 (paylaşım biçimleri) paylaşım metriğini doğrudan etkilediği için, oranı düşük olsa da #1-#3 ile aynı pakette denemeden önce kapanmalı (01 S1 ile uyumlu).
**v1.1 kapsamına uyum:** #1, #2, #3, #4, #5, #8 01'in P-maddeleriyle örtüşür veya cilanın içindedir; **#6 küçük kapsam genişletmesi** (sayaç), **#9 ve #10 ayrı intent adayı** (Batuhan onayı).
**Ertelenen/elenen (5 satır):** el çizimi illüstrasyon seti (efor L; sonra), Android widget (spec dışı, ayrı intent), sticker paylaşımı (uygulanabilirlik doğrulanmadı), tema seçimi (düşük etki), AI anlatı/yorum (gizlilik + Wrapped 2024 dersi -> elendi).

## 6. Bizde olmaması gerekenler

| # | Kalıp | Kim yapıyor (kanıt) | Neden bizde yasak | Bozduğu kural |
|---|---|---|---|---|
| Y1 | **Kayıp korkusu serisi / seri bahsi** ("serin bozuldu", Streak Wager) | Duolingo [B]; Apple "halkaları kapat" [İ] | Utandırma; ürün tonu (tavsiyesiz, yargısız); tükenme kanıtı (Finch, Slate [İ]) | 03 Ö8; ürün tonu |
| Y2 | **FOMO / sınırlı süreli ödül** | Apple sınırlı sayıda ödül/Global Close Your Rings Day [İ] | Sahte aciliyet; "karne kaçırılmaz" baskısı | Etik (dark pattern yok) |
| Y3 | **Bildirim yağmuru / sık ping** | Finch [İ: Slate] | Günde <= 1, dolu günde sessiz, 7 gün sönümleme korunur | 03 tetik ilkesi |
| Y4 | **Sanal para birimi/ekonomi ve mağaza** | Finch [İ] | Ücretli özelleştirme duvarı = yeni monetizasyon kararı; gizlilikle ilgisiz ama kapsam dışı | Kapsam (intent) |
| Y5 | **Paylaşımı/istatistiği paywall arkasına almak** | Strava tepkisi [İ]; Letterboxd Pro [B] | Birincil ölçüt paylaşım oranı; duvar ölçümü bozar ve ürünün sosyal sözleşmesini | Intent E1 |
| Y6 | **Hesap, arkadaş grafiği, liderlik, arkadaş ilerlemesi** | Spotify Fan Leaderboard [B], Locket/BeReal [İ], Finch [İ] | Yerel-only; sunucu/hesap yok | Gizlilik sözü, spec |
| Y7 | **Bulut AI ile üretilmiş metin/yorum** | Wrapped 2024 AI podcast [İ], Stoic AI mentor [İ] | Veri cihazdan çıkar (gizlilik sözü); 2024 tepkisi "boş gözlem"; içerik yazarlığı bilinçli | Gizlilik sözü, `copy.ts` |
| Y8 | **Analitik/atıf SDK'sı, kişisel paylaşım bağlantısı, kimlikli QR** (büyüme için) | Locket'in TikTok/atıf ağı [İ] | Ağ çağrısı ve kimlik; "üretimde ağ yok" | Spec güvenlik 2 |
| Y9 | **Skor/sayı + yargı** (Health Score, ham dakika, kötü->iyi renk) | Gyroscope [İ], Daylio gradyanı [B/İ] | Kartta ham sayı yok; "iyi/kötü değil yoğunluk" | Spec kartta ham sayı; 01 T6 |
| Y10 | **Sağlık/klinik iddia** (Yale bağlantısı, tedavi/tanı dili, "sağlık skoru") | HWF, Bearable, Gyroscope [İ] | Health apps beyanı, S12 kararı; tıbbi iddia yok | S12, security/privacy-compliance |
| Y11 | **Zorunlu zaman penceresi/rastgele bildirim** | BeReal [İ] | Aciliyet baskısı; tükenme; ritüel = Pazar 20:00 sabit ve baskısız | 03 |
| Y12 | **Gizli kategoriyi görsel dilden sızdırmak** (glif/renk/boyut/şerit uzunluğu) | (bizim özgü risk) | Gizlenen kategori sızmaz; şerit genişliği sabit | Spec güvenlik 3; 10 Bölüm 4 |
| Y13 | **Kartta gerçek tarih/hafta numarası/ham sayı, paylaşımda bulut yükleme** | (bizim özgü) | Spec kartta ham sayı/tarih yok; paylaşım yalnız yerel sistem sayfası | Spec, intent |
| Y14 | **Deneme raporunu "anonim" diye anlatmak** | (bizde geçmiş hata) | Takma adla birleştirilebilir | CLAUDE.md MOB/S9 I-3 |

## 7. Hayatta kalma yanlılığı ve başarısız benzerler

**Kim görünür, kim değil:**
- İncelenen ürünlerin çoğu **büyük ekip, büyük veri ve ağ etkisi** sahibi kazananlardır (Spotify, Strava, Duolingo, Apple, Letterboxd). Onların "çarpıcılığı" tasarımdan mı, kitle/marka gücünden mi geliyor? **Ayrıştırılamadı**; hiçbir kaynak tasarım -> paylaşım nedenselliğini ölçmüyor (The Conversation makalesi ampirik çalışma atıf vermiyor [B]).
- **Solo/küçük ekip örnekleri:** Receiptify (tek öğrenci; 1M+ kullanım, ama tek seferlik ve API bağımlı [B/İ]), Locket (tek geliştirici; büyüme TikTok yaratıcı ağı ve sunucu grafiğiyle [İ]). Haftik'e en yakın olanı Receiptify; ondan alınan **alışkanlık değil biçimdir**.
- **Düşüşler/tepkiler (başarısızlığa en yakın kanıtlar):** Wrapped 2024 tepkisi (kişilik öğelerini silmek + AI) [İ]; Strava paywall tepkisi [İ]; BeReal zirveden ~%45 düşüş (doğrulanmadı) [İ]; Finch'te 4-6 ay tükenme gözlemi (tek yazar) [İ]; Bearable/Finch karmaşıklık şikayetleri [İ]; Locket 3,4 puan (onboarding) [İ]; Receiptify tarzı araçların Spotify API kısıtlarına takılması [İ]. Bunların hepsi "büyük ürünün kusuru"; **küçük benzerlerin ölümünü** gösteren veri bulamadım.
- **Aranıp bulunamayanlar:** haftalık esprili kart üreten bir mood uygulamasının başarısızlık öyküsü; Türkçe eşdeğer. **"Bulunamadı != yok"**: mağaza içi arama yapılamadı, arama motoru küçük ürünlerde zayıf (ekip dersi).
- **Doygunluk:** ruh hali/günlük takip kategorisi doygun (Daylio 4.8 / 62K puan [B], Google Play ~393K yorum [İ], Finch 623K [İ], HWF 30K [B], Bearable, çok sayıda Türkçe liste [İ]). **"Haftalık esprili paylaşım kartı" nişi bu aramada boş görünüyor**, ama boş olması talebin var olduğunu kanıtlamaz (01: talep kanıtı zayıf, intent OQ2).
- **Yanlış çıkabilecek senaryolar:** (a) sorun görsel değil değer (ayna etkisi, 01 T1); cila paylaşımı artırmaz; (b) Wrapped'ın paylaşım kitlesi Spotify'ın ağ etkisinden gelir, tasarımdan değil; (c) n = 20-30 arkadaş çevresi gürültülüdür (01 §7).

## 8. Kill criteria ve doğrulanamayanlar

### 8.1 Kill criteria (önerilen; ölçülebilir; kimse onaylamadı)

| # | Koşul | Eylem |
|---|---|---|
| KC1 | Yeni kart (mühür + belge ayrıntıları + görünür unvan/şerit) ile eski kartın aynı hafta PNG'sini 5 kişiye göster: "Story/WhatsApp Durum'a koyar mıydın?" - yeni sürüm >= 3/5 **ve** eskiden en az 1 kişi fazla değilse | Görsel yatırımı durdur; değer katmanına dön (01 T1/H4) |
| KC2 | Kaydet mikro-anı sonrası 8 sn hedefi, kronometrede >12 sn'ye çıkıyorsa (plan C-04) | Mikro-anı kısalt veya geri al |
| KC3 | Görsel/çıktı işi 2 iş gününü aşıyor (01 P8 zaman kutusu) | Kes; P4/P5 (unvan, içerik) önceliğe |
| KC4 | Reveal/mühür animasyonu gerçek cihazda kare düşürüyorsa (K-03) | Tek 150 ms geçişe dön (10 Bölüm 5 azaltılmış hareket varyantı) |
| KC5 | Kategori tonu testinde 5 kişiden >= 2'si "renk iyi/kötü çağrıştırıyor" derse | Renk = kategori kararını geri al; 10 belgesinin nötr tonuna dön |
| KC6 | Story/WhatsApp Durum'da gerçek cihaz testinde mühür/unvan kırpılıyor ve düzeltme sonrası da düzelmiyorsa | Biçimi 1:1/kare öncelikli yap |
| KC7 | E1 nötr dönemde (kartı görenlerin) paylaşım oranı < %25 **ve** KC1 geçtiyse | Sorun görsel değil; ürün "ele" kuralı (intent) ya da değer katmanı ayrı intent |

### 8.2 Doğrulanamayanlar

1. Referans ürünlerin paylaşılan çıktılarına **görsel olarak bakılmadı**; görsel dil metin kaynaklardan tarif edildi.
2. Google Play sayıları (Daylio ~393K, Finch 623.766 / 10M+) arama özetinden; Daylio'nun "20M+" kullanıcı iddiası kendi beyanı.
3. Spotify 200M/500M rakamlarındaki "engaged" ve "share" tanımı; UX Playbook'un 227M/2,3 milyar rakamı (kullanılmadı).
4. Duolingo S-1 "%50 DAU 7+ gün serisi" ve "2,4x" alıntıları birincil kaynaktan doğrulanmadı.
5. Daylio Year in Pixels görselinin ayrıntıları; Bearable/Stoic/HWF paylaşım kartı (bulunamadı != yok).
6. Apple halka kapanışı haptik/ses ayrıntısı; sticker paylaşımının Android/Instagram'da işleyişi.
7. Yemeksepeti "Keyif Özeti" ayrıntıları ve katılım/paylaşım rakamı (kurumsal sayfa 403).
8. TÜİK/DataReportal yüzdeleri haber aktarımıyla; orijinal tablo çekilmedi.
9. Türkiye'de abonelik/IAP ödeme alışkanlığı rakamı; Türkçe rakiplerin puan/indirme sayıları.
10. "Karne" kavramının Türkçe mizah/kültür çapası (aranıp kaynak bulunamadı; varsayım).
11. Story güvenli alanı (250/340 px) birincil Meta belgesinden doğrulanmadı; 10 belgesiyle çakışma hesabı cihazda ölçülmedi.
12. BeReal/Locket sayıları (73,5M, ~40M, 80M, 298M) düşük güvenilirlikli ikincil kaynak.
13. Receiptify'ın 2026 güncel durumu (API kısıtından etkilenme derecesi).
14. Bu belgedeki etki/efor puanları K0 yargıdır; "tasarım cilası paylaşım oranını artırır" iddiası hiçbir kaynakta nedensel olarak ölçülmemiştir.
15. "Bizde var" hükümleri 01/10 belgelerinden; bu turda emülatör/cihazda teyit edilmedi.

## 9. Tavsiye

**ŞU KOŞULLA DEVAM ET.** Zenginleştirme "yeni girdi/kategori" değil, **çıktı (kart) + ödül anı (Kaydet ve Pazar açılışı)** üzerinde yapılır. Kaynaklar, basitliğin sorun olmadığını (Daylio, Receiptify basit), asıl farkı çıktının kimlik/espri/imza taşımasının yarattığını gösteriyor. "Fazla basit" hissi büyük ölçüde 01'in teşhis ettiği eksik çıktı/ödül halkalarından geliyor; yeni özellik ekleyerek çözülmez (CLAUDE.md "kapsam değil bitirme").

**Koşullar (ölçülebilir):**
1. **Önce kanıt, sonra cila:** bölüm 5'teki #1-#5 tek bir zaman kutusunda (<= 2 iş günü görsel işi, KC3) uygulanır; **KC1 testi** (yeni vs eski PNG, 5 kişi, >= 3/5 ve eskiden en az +1) geçilmeden #7-#10'a geçilmez.
2. **`???` sorunu (#4) denemeden önce kapanır:** görünür unvan oranı >= %90 (01 T13 ölçütü). Bu, görsel iş değil, paylaşım kancası.
3. **Öğe sayısı sabit:** kartta yeni öğe eklenirse eskisi çıkar; kart 3 sn'de tek mesaj verir (K1 ölçütü >= 4/5).
4. **Kaydet mikro-anı 8 sn'yi uzatmaz** (KC2) ve kart içeriğini sızdırmaz.
5. **Renk kararı (#5) Batuhan/visual-designer tarafından açıkça yeniden açılır** ya da 10 belgesindeki nötr karar bilinçle korunur; her iki durumda KC5 testi yapılır.
6. Gerçek cihazda Story + WhatsApp Durum ekran görüntüsü (KC6) alınmadan "paylaşım biçimi tamam" denmez (platform davranışı K4/K5 ilkesi).

**Ayrı `intent.md` adayları (kapsam genişletme, Batuhan onayı olmadan açılmaz):** #10 geçmiş karneler duvarı + ay/yıl mozaiği, #9'un glif kısmı (görsel kimlik intent'i ile birlikte), Android widget, el çizimi illüstrasyon seti, sticker paylaşımı.

**Devir:**
- `visual-designer`: renk = kategori kararı ve karne belge dili (#2, #5), Story güvenli alan yerleşimi (altbilgi/mühür), "sansür şeridi".
- `copywriter`: karne belge mizahı metinleri, Türkçe karne terimi doğrulaması, kilometre taşı/kutlama cümleleri.
- `ui-ux-designer`: Kaydet mikro-anı, üç vuruşlu reveal, örnek kart.
- `security-reviewer` + `software-architect`: #4 mekanizma (görünür unvan) ve #9 glif sızıntı riski.
- `growth-strategist`: WhatsApp Durum/sohbet önceliği ve kare biçim; iki dönemli paylaşım çağrısıyla uyumu.
- `qa-engineer` / `test-automation-engineer`: KC1-KC6 testleri ve cihazda güvenli alan ölçümü.
- Batuhan'a: (a) renk kararı yeniden açılsın mı, (b) karne belge mizahı v1.1'e mi girsin, (c) paylaşım biçimlerinin (unvan kartı/kare) v1.1 mi ayrı intent mi olduğu.

Bu belgedeki dosya: `C:\Users\Pc\Desktop\Geliştirme için\haftalik-hayat-karti\docs\inceleme-2026-09-25\15-rakip-ve-referans.md`

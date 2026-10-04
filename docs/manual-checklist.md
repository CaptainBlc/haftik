# Elle test listesi (gerçek Android cihaz) - Haftalık Hayat Karnesi

Kaynak: `plan.md` S6-S10 "Bitti kanıtı" ve "Uygulama notu/SEC" bloklarındaki cihaz maddeleri, `CLAUDE.md` "Bilinen tuzaklar" (her "cihaz yok" notu), `evals/s8-bildirim-senaryolari.md` (cihaz gerektirenler), `docs/ux/*`.
Bu belge kod içermez. Emülatör bu liste için yeterli sayılmaz (bildirim, paylaşım, ağ, pil); tek istisna: ekran boyutu maddeleri.

**Nasıl kullanılır:** Sırayla ilerle. Her satırda `[ ] geçti` veya `[ ] kaldı` işaretle, tuhaf bir şey görürsen "Not"a yaz. Kalan her madde için en sonda "Bulgu kayıt şablonu"nu doldur. Test başarısız olursa testi/beklentiyi gevşetme; bulguyu yaz, düzeltme koda yapılır. `iOS (S11)` sütunu şimdilik boş kalır, Apple üyeliği (K9) alınınca gerçek iPhone'da doldurulur.

**Önem:** Blokör = düzelmeden deneme/mağaza yok. Önemli = düzelmeli ama akışı durdurmaz. Düşük = cila.

## Test ortamı kaydı (başlamadan doldur)

| Alan | Değer |
|---|---|
| Cihaz üreticisi/model | |
| Android sürümü | |
| Ekran boyutu/çözünürlük | |
| Derleme türü (dev / release APK) ve tarih | |
| Uygulama paket adı | `com.batuhan.haftik` (`app.json` android.package + ios.bundleIdentifier; Batuhan kararı 2026-09-23, kesin) Deep link şeması: `haftik://` (`app.json` `expo.scheme`) |
| Pil yönetimi agresif bir üretici mi (Xiaomi/Huawei/Oppo/Vivo/Samsung vb.)? | |

## Ortak tarifler (satırlarda "SA", "SB", "dev menü" diye geçer)

**Dev zaman menüsü (yalnızca dev derlemede; release'te olmaması G-06'da kontrol edilir).** Sağ altta yarı saydam yuvarlak bir saat düğmesi (🕒) durur. Dokununca "Zaman simülasyonu (yalnızca geliştirme)" paneli açılır. Panelin ikinci satırı şu biçimde: `Per 24.09.2026 14:05 (simüle)` veya `(gerçek)`. Düğmeler: `+1 gün`, `+1 saat`, `Bu haftanın Pazar 20:00'ine ilerlet`, `+1 hafta`, `Gerçek zamana dön`, `Kapat`. Kurallar:
- Zaman yalnızca İLERİ gider (geri düğmesi yok); tekrar denemek için "Gerçek zamana dön" + "Tüm verilerimi sil".
- Simüle tarihte kaydettiğin check-in'ler gerçek veritabanına yazılır. Bir senaryo bitince "Gerçek zamana dön" yap ve sonraki senaryoya temiz veriyle (Ayarlar > Tüm verilerimi sil) başla.
- Düğme sağ alttaki "Ayarlar" sekmesini kapatıyorsa sekmenin sol kenarına dokun ve bunu bulgu olarak yaz (Düşük).
- **Dev menü yalnızca uygulamanın kendi saatini değiştirir, telefonun saatini DEĞİL.** Bildirim testleri (bölüm 6) bu yüzden telefonun saatiyle yapılır (SB).

**SA - "ilk kart hazır, bugün Pazar 20:00 ve boş" durumu:**
1. Ayarlar > Tüm verilerimi sil > onayla. Onboarding'i geç (Başla, Anladım devam, İzin ver veya Şimdi değil).
2. 🕒 > `+1 gün`'e, panelin gün kısaltması `Pzt` olana kadar bas (bugün zaten Pzt ise hiç basma). Bu adımda check-in YAPMA. Kapat.
3. Bugün sekmesinde 4 kategoriden birer emoji seç > Kaydet (Pzt).
4. 🕒 > `+1 gün` > Kapat > aynı şekilde Kaydet (Sal). Bir kez daha (Çar). Toplam 3 dolu gün.
5. 🕒 > `Bu haftanın Pazar 20:00'ine ilerlet` > Kapat. Panel `Paz ... 20:00 (simüle)` göstermeli.
Sonuç: ilk kart eşiği (3 gün) tamam, saat gelmiş, Pazar'ın check-in'i boş.

**SB - telefon saatiyle bildirim testi:** Ayarlar > Sistem > Tarih ve saat > "Saati otomatik ayarla" ve gerekirse "Saat dilimini otomatik ayarla"yı kapat, elle tarih/saat/saat dilimi gir (menü adları üreticiye göre değişir). Test bitince ikisini de tekrar aç. Bu sırada dev panel `(gerçek)` olmalı. Saati değiştirdikten sonra uygulamayı öne getir (bildirim planı açılışta/öne gelişte yeniden kurulur). Hatırlatma saati seçenekleri yalnızca 20:00, 21:00, 22:00, 23:00 olduğundan telefon saatini seçilen saatten ~2 dk önceye kur (örn. 19:58). Android 12+'da bildirim tam dakikasında değil birkaç dk sapmayla gelebilir (bilinen ve kabul edilen davranış); sapmayı ölç ve yaz.

**Bilinen sınırlar (bulgu sayma):** kart açılışında gerçek blur yok, yalnızca saydamlık geçişi; "Gizlilik politikası" bağlantısı "(yakında)" yer tutucusu; kartın damgasında `[mağaza bağlantısı]` yer tutucusu (K5); bildirim zamanlaması yaklaşık; iOS bu turda yok.

---

## 1. Hazırlık / kurulum

| ID | Adımlar | Beklenen | Sonuç | Kapattığı plan maddesi | Önem | Not | iOS (S11) |
|---|---|---|---|---|---|---|---|
| H-01 | Telefonda geliştirici seçenekleri > USB hata ayıklama aç; USB ile bağla; bilgisayarda `npm run android`. | Uygulama telefonda açılır, kırmızı hata ekranı yok, ilk ekran karşılama ("Her gün 8 saniye. Her pazar bir karne."). | [ ] geçti [ ] kaldı | S1 (Android gerçek cihaz yolu), S6 | Blokör | | [ ] |
| H-02 | 🕒 düğmesine dokun. `+1 gün`'e bas, sonra `+1 saat`, sonra `Gerçek zamana dön`, sonra `Kapat`. | Panel açılır; her basışta tarih/saat satırı değişir ve `(simüle)` yazar; `Gerçek zamana dön` sonrası `(gerçek)`; Bugün ekranındaki tarih başlığı simüle güne göre güncellenir. | [ ] geçti [ ] kaldı | S6 (zaman simülasyonu menüsü) | Blokör (test aracı) | | [ ] |
| H-03 | Temiz kurulumda: Başla > "Verilerin yalnızca bu telefonda kalır." ekranında "Anladım, devam" > "Her gün hatırlatalım mı?" ekranında "İzin ver" > sistem izin diyaloğunda izin ver. Süreyi ve dokunuş sayısını not et. | Toplam 3 dokunuş (+ sistem diyaloğu), yaklaşık 10-15 sn; sonunda doğrudan Bugün (check-in) ekranı, ara "tebrikler" ekranı yok; metinler `docs/ux/ekran-akisi.md` Ekran 1 ile uyumlu, kırpılma yok. | [ ] geçti [ ] kaldı | S6 (onboarding), U0 | Önemli | | [ ] |

## 2. Check-in (Bugün ekranı)

| ID | Adımlar | Beklenen | Sonuç | Kapattığı plan maddesi | Önem | Not | iOS (S11) |
|---|---|---|---|---|---|---|---|
| C-01 | Bugün ekranında önce hiçbir şey seçmeden Kaydet'e bak; sonra 1, 2, 3 kategori seç, her seferinde Kaydet'e bak; dördüncüyü seç. Bir emojiyi seçtikten sonra aynı kategoride başka emojiye dokun. | Kaydet dördü de seçilene kadar pasif (gri, dokunulamaz); dördüncüde aktif; seçili emoji belirgin (kalın çerçeve), diğerleri soluk; seçim tek dokunuşla değişir. | [ ] geçti [ ] kaldı | S6 (Bugün ekranı) | Blokör | | [ ] |
| C-02 | 4 seçimi yap, Kaydet. Sonra uygulamayı son uygulamalardan kaydırıp tamamen kapat, tekrar aç, Bugün ekranına bak. | Kayıt sonrası hata yok; yeniden açınca aynı seçimler görünür (kalıcı); onboarding tekrar gelmez. | [ ] geçti [ ] kaldı | S5/S6 (SQLite kalıcılık, gerçek cihaz) | Blokör | | [ ] |
| C-03 | Bugün'de bir gün geri git (`<`); seç/Kaydet. Sonra 🕒 > `+1 gün` yap, Bugün ekranında `<` ile iki kez geri gitmeyi dene. | Bugün ve dün düzenlenebilir; bugünden 2 gün öncesine gidilemez (ok yok veya pasif); dün için kayıt sonradan Hafta ekranındaki noktaya yansır. | [ ] geçti [ ] kaldı | S6 ("bugün/dün düzenleme, daha eski gün düzenlenemez") | Önemli | | [ ] |
| C-04 | Kronometre hazırla. Bugün sekmesi açıkken başlat, 4 emoji + Kaydet biter bitmez durdur. 3 kez tekrarla (üç ayrı gün: 🕒 `+1 gün` ile). | Ortalama yaklaşık 8 sn veya altı; ekstra onay diyaloğu yok. Süreleri not'a yaz. | [ ] geçti [ ] kaldı | S6 ("Bugün akışı ~8 sn") | Önemli | | [ ] |
| C-05 | 🕒 ile `+1 gün` yap, Bugün ekranına dön. | Başlıktaki tarih/gün adı yeni güne geçer, seçimler boş gelir, Kaydet pasif. | [ ] geçti [ ] kaldı | S6 | Önemli | | [ ] |
| C-06 | Bugün ekranında 12 emojiye bak (hareket, uyku, harcama, sosyal x 3). Parmakla her birine rahat dokunabildiğini dene. | Hiçbir emoji kutu/soru işaretiyle (eksik glif) görünmez; her satırın 3 seçeneği ayırt edilir; dokunma alanı rahat (yanlış emojiye basma yok). | [ ] geçti [ ] kaldı | S7a (emoji görünümü, Google sistem fontu), S6 | Önemli | | [ ] |

## 3. Hafta ekranı

| ID | Adımlar | Beklenen | Sonuç | Kapattığı plan maddesi | Önem | Not | iOS (S11) |
|---|---|---|---|---|---|---|---|
| W-01 | Ayarlar > Tüm verilerimi sil > onboarding'i geç. Hafta sekmesine bak. | 7 nokta (Pzt-Paz) hepsi boş; "Kartın için 3 gün daha lazım." (ilk kart eşiği 3); altında bulanık kilitli kart kutusu ve gerçek metin yok. | [ ] geçti [ ] kaldı | S6 (silme sonrası ilk açılış, "kart için X gün"), S2 ilk kart eşiği | Blokör | | [ ] |
| W-02 | SA'nın 2. ve 4. adımlarını izleyerek gün gün ilerle; her check-in sonrası Hafta'ya bak (1 gün, 2 gün, 3 gün). | Nokta sayısı dolu gün kadar koyulaşır; 2 dolu günde "Kartın için 1 gün daha lazım."; 3 dolu günde "Kartın hazırlanıyor, Pazar 20:00'de açılacak." ve kutu altında "Pazar 20:00'de açılıyor". | [ ] geçti [ ] kaldı | S6 ("kart için X gün kaldı"), S2 | Blokör | | [ ] |
| W-03 | Kilitli haftada (Pazar 20:00'den önce) kilitli kutuya dokun; kutunun ekran görüntüsünü al, büyüterek bak. | Hiçbir şey açılmaz (hafif sallanma/aynı metin); ekran görüntüsünde okunabilir gerçek kart metni, unvan veya emoji YOK, yalnızca bulanık iskelet + kilit. | [ ] geçti [ ] kaldı | S6 ("kilitli kartta gerçek metin yok - ekran görüntüsü") | Blokör | | [ ] |
| W-04 | SA + kartı aç (K-02) + geri dön. Sonra 🕒 > `+1 hafta`; Hafta ekranına bak. | Yeni hafta 0 dolu; eşik artık 4: "Kartın için 4 gün daha lazım."; nokta sayısı sıfırlanmış. | [ ] geçti [ ] kaldı | S2 (ilk kart 3 / sonraki 4), S6 | Önemli | | [ ] |

## 4. Kart açılışı ve Pazar akışı (K3)

Önkoşul: SA yapılmış olmalı (Pazar 20:00, bugün boş).

| ID | Adımlar | Beklenen | Sonuç | Kapattığı plan maddesi | Önem | Not | iOS (S11) |
|---|---|---|---|---|---|---|---|
| K-01 | SA'dan sonra Hafta sekmesine bak, kilitli kutuya dokun. Ara ekranda "Geri" (sistem geri tuşu/jesti) yap ve Hafta'ya dön. | Kutu altında "Bugünü işaretlemeden kartın açılmaz"; dokununca ara ekran: "Kartını açmadan önce bugünü de ekleyelim." + tek düğme "Bugünü işaretle". Geri gidilebilir; Hafta'da kutu kilitli kalır ve aynı metin durur, kart oluşmaz. | [ ] geçti [ ] kaldı | S7a (K3 gerçek akış, `docs/ux/pazar-akisi.md`) | Blokör | | [ ] |
| K-02 | Ara ekrandan "Bugünü işaretle" > 4 emoji > Kaydet. | Kaydet'ten sonra ekstra dokunuş olmadan kart açılış ekranı başlar (otomatik devam); Bugün ekranına takılıp kalma yok. | [ ] geçti [ ] kaldı | S7a (K3 "Kaydet sonrası otomatik devam") | Blokör | | [ ] |
| K-03 | Açılış animasyonunu izle (mümkünse ekran kaydı al). | Yükleme çarkı yok; kart bulanıktan netleşir; sırayla unvan, hareket, uyku, harcama, sosyal satırları, en son özet belirir; toplam yaklaşık 1-1,5 sn; takılma/kare atlama yok. | [ ] geçti [ ] kaldı | S7a (reveal akıcılığı, dokunmatik his) | Önemli | | [ ] |
| K-04 | Animasyon sürerken ekrana dokun. Sonra `X` ile kapat, Hafta'ya dön, kartı tekrar aç; uygulamayı tamamen kapat-aç ve kartı bir kez daha aç. | Dokunuş animasyonu anında tamamlar; `X` Hafta'ya döner; her açılışta unvan, satırlar ve özet birebir aynı (dondurulmuş kart). | [ ] geçti [ ] kaldı | S7a (aynı hafta iki kez açılan kart özdeşliği) | Blokör | | [ ] |
| K-05 | Açık kartı 3 kez oku: (a) Türkçe karakterler (ç ğ ı İ ö ş ü, büyük harfli unvanda İ/Ş/Ğ), (b) taşma/kesilme, (c) emojiler, (d) alt damga, (e) rakam ve ton. Ekran görüntüsü al. | Harfler net, eksik/kutucuk yok, satırlar taşmıyor; emojiler sistem fontuyla düzgün; alt damgada "Haftalık Hayat Karnesi · [mağaza bağlantısı]" (yer tutucu, hata değil); kartta hiçbir rakam/tutar/konum/kategori adı yok; ton tavsiyesiz ve suçlamasız. | [ ] geçti [ ] kaldı | S7a (Türkçe karakter, taşma, emoji), S4 ton denetimi | Blokör | | [ ] |
| K-06 | Temiz veriyle 3 gün doldur (SA'nın 1-4. adımları), `Pazar 20:00'ine ilerlet`, ÖNCE Bugün'de Pazar için 4 emoji kaydet, sonra Hafta'dan kutuya dokun. | Ara ekran hiç görünmez; doğrudan kart açılış animasyonu. | [ ] geçti [ ] kaldı | S7a (K3 kenar durum 1) | Önemli | | [ ] |
| K-07 | SA'dan sonra kartı AÇMADAN 🕒 > `+1 gün` (Pzt 20:00). Hafta ekranında geçen haftanın kartına giden bir yol var mı bak; yoksa bilgisayardan: `npx uri-scheme open haftik://card/<geçen haftanın Pazartesi tarihi, YYYY-AA-GG> --android`. | Geçen hafta uygun ama açılmamış kart hâlâ açılabilir; ara ekran çıkmaz (bugün Pazar değil), doğrudan animasyon; kart bir kez dondurulur. | [ ] geçti [ ] kaldı | S7a (K3 kenar durum 3, `openOrBuildCard`), S2 | Önemli | | [ ] |
| K-08 | Bilgisayardan sırayla (temiz veri, 0 dolu gün): `haftik://card/abc`, `.../2026-09-22` (Salı), `.../2030-01-07` (gelecek), sonra bu haftanın Pazartesi'si (henüz uygun değil). Komut: `npx uri-scheme open <adres> --android`. | Hiçbiri çökmez; hepsi Hafta ekranına yönlendirir; hiçbir kart oluşmaz (uygun olmayan haftada kart görünmez, kilitli kalır). | [ ] geçti [ ] kaldı | S8 SEC-2 ve S9 SEC I-1 (deep link doğrulaması) | Blokör (güvenlik) | | [ ] |
| K-09 | Temiz veri / "Tüm verilerimi sil" sonrası, uygulama kapalıyken bilgisayardan sırayla: `npx uri-scheme open haftik://today --android`, sonra veriyi tekrar sil ve `haftik://week`. | İkisinde de onboarding karşılama ekranına yönlenir (Bugün/Hafta doğrudan açılmaz); onboarding bitince Bugün'e geçilir; `first_open_date` dolar. | [ ] geçti [ ] kaldı | S10 SEC N-4 (`(main)` layout onboarding kapısı) | Önemli | | [ ] |

## 5. Gizleme, önizleme, paylaşım

Önkoşul: açık bir kart (K-02 sonrası) ve "Paylaş" düğmesi.

| ID | Adımlar | Beklenen | Sonuç | Kapattığı plan maddesi | Önem | Not | iOS (S11) |
|---|---|---|---|---|---|---|---|
| P-01 | Kartta "Paylaş"a dokun. Önizleme ekranında hiçbir şeye dokunmadan satırlara bak, sonra her satırın göz ikonuna tek tek dokun. | Önizleme ("Paylaşmadan önce gözden geçir.") zorunlu ara adım; uyku ve harcama varsayılan gizli (`???`), hareket ve sosyal açık; dokununca aç/kapa değişir; gizli satırın gerçek metni bu gözden geçirme listesinde görünür. | [ ] geçti [ ] kaldı | S7b (uyku+harcama varsayılan gizli, tek dokunuşla göster/gizle) | Blokör | | [ ] |
| P-02 | Önizlemede kategorileri tek tek gizle/göster; unvanın ne zaman `???` olduğunu izle, hangi kategori(ler) gizliyken olduğunu Not'a yaz. | Unvan, kendisini doğuran kategoriden en az biri gizliyken de `???` olur; hiçbir kategori gizli değilken unvan görünür; ayrı bir "unvan" düğmesi yok. | [ ] geçti [ ] kaldı | S7b (unvan gizlenen kategoriden türetilmez, elle senaryo) | Önemli | | [ ] |
| P-03 | Varsayılanı değiştir (örn. uyku'yu aç), "Geri" ile çık, tekrar Paylaş'a gir. Sonra bir paylaşımı tamamla, kartta tekrar Paylaş'a gir. | Her ikisinde de önizleme yine uyku+harcama gizli varsayılanıyla açılır (gizleme kalıcı değil). | [ ] geçti [ ] kaldı | S7b (paylaşım sonrası gizleme sıfırlanır) | Önemli | | [ ] |
| P-04 | Varsayılan gizliyle "Bu haliyle paylaş" > sistem paylaşım sayfası. Hedef olarak WhatsApp'ta "kendine mesaj"/kendi sohbetin; gönderilen görüntüyü aç, büyüt. Ayrıca sayfayı bir kez iptal edip tekrar dene. | Paylaşım sayfası açılır; WhatsApp'ta PNG net ve dikey (9:16), gizli iki satır `???`, gerçek gizli metin hiçbir yerde okunmuyor, alt damga var; iptalde çökme yok, kart/önizleme ekranı sağlam (iptalden sonra gizleme durumu ne oluyorsa Not'a yaz). | [ ] geçti [ ] kaldı | S7b (paylaşım sayfası, WhatsApp/galeri hedefi) | Blokör | | [ ] |
| P-05 | P-04'te WhatsApp'a gelen mesajda PNG'nin YANINDA metin/bağlantı var mı bak; bir de Galeri/Google Fotoğraflar'a kaydet hedefini dene. | K5 belirsizliği: PNG ile ayrı bir mesaj/bağlantı taşınıyor mu? (`dialogTitle` hedefe mesaj olarak gitmeyebilir); sonucu Not'a yaz (taşınmıyorsa bulgu değil bilgi; bağlantı zaten kartın damgasında). Galeri'de görüntü bozulmadan görünür. | [ ] geçti [ ] kaldı | S7b (paylaşım mesajı/K5 bağlantı, belirsiz) | Önemli | | [ ] |
| P-06 | Paylaşılan PNG'yi bilgisayara al (WhatsApp Web'den indir, e-postayla kendine gönder veya USB ile Galeri klasöründen kopyala). Windows'ta dosyaya sağ tık > Özellikler > Ayrıntılar sekmesine bak; isteğe bağlı: `exiftool dosya.png`. | Boyut 1080 x 1920; kamera, GPS, yazılım adı, kullanıcı adı, telefon modeli gibi metadata yok (yalnızca boyut/bit derinliği gibi teknik alanlar). | [ ] geçti [ ] kaldı | S7a (PNG boyutu), S7b (EXIF/tEXt yok, dosya incelemesi) | Önemli | | [ ] |
| P-07 | Paylaşımdan (ve bir deneme raporu paylaşımından, R-02) önce ve sonra Ayarlar > Uygulamalar > Haftalık Hayat Karnesi > Depolama'da "Önbellek" boyutuna bak, mümkünse "Önbelleği temizle"den önce/sonra. Teknik yol (dev derleme): `adb shell run-as <paket> ls cache`. | Paylaşım tamamlanınca geçici PNG (ve rapor .txt) önbellekte kalmamış (adb ile `ReactNative-snapshot-image*.png` ve `deneme-raporu.txt` görünmemeli). | [ ] geçti [ ] kaldı | S7b (PNG temizleme politikası), S9 (N-1 rapor dosyası) | Önemli | | [ ] |
| P-08 | Paylaşım sayfası AÇIKKEN uygulamayı son uygulamalardan öldür; yeniden aç; sonra Ayarlar > Tüm verilerimi sil. Bilgisayardan: `adb shell run-as <paket adı> ls cache` (release'te `run-as` çalışmazsa Ayarlar > Depolama > Önbellek boyutuna bak). | Açılışta ve silme sonrası önbellekte `ReactNative-snapshot-image*.png` kalmaz (Android; iOS tmp süpürmesi S11). | [ ] geçti [ ] kaldı | S10 SEC I-1 (geçici PNG süpürme) | Önemli | | [ ] |
| P-09 | Paylaşım ÖNİZLEME ekranı açıkken ekran görüntüsü / ekran kaydı al. | Kaydın davranışını yaz (Android'de engellenmiyor, FLAG_SECURE yok; gizli satırın gerçek metni bu listede görünür). Karar (N-9) Batuhan'ın; sonuç "kabul edildi" ya da "engellenmeli" olarak Not'a yazılır. | [ ] geçti [ ] kaldı | S10 SEC N-9/N-10 (önizleme ekran görüntüsü) | Bilgi | | [ ] |

## 6. Bildirimler

Önkoşul: dev panel `(gerçek)`; saat testleri SB ile telefon saatiyle yapılır. Bildirim metinleri sabit: günlük metin haftanın gününe göre 4 sabit varyanttan biri ("Bugün nasıldı?", "Bugünün emojisi hangisi?", "Sayfa seni bekliyor.", "Günün emoji özeti zamanı."; S16a); kart "Haftanın kartı hazır / Bugünü de işaretlediysen kart seni bekliyor."

| ID | Adımlar | Beklenen | Sonuç | Kapattığı plan maddesi | Önem | Not | iOS (S11) |
|---|---|---|---|---|---|---|---|
| B-01 | (a) Temiz kurulumda onboarding'de "İzin ver" > sistem diyaloğunda "Reddet". (b) Ayarlar'a bak. (c) Ayarlar > Günlük hatırlatma anahtarını kapat-aç. (d) Telefon Ayarlar'ından bildirim iznini aç, uygulamayı öne getir. | (a) Çökme yok, Bugün ekranına geçer. (b) "Bildirim izni kapalı. Hatırlatma ve kart bildirimi için sistem ayarlarından izin verebilirsin." görünür. (c) Anahtar izin ister/durumu gösterir, çökme yok. (d) Sonraki açılışta hatırlatmalar kurulur (B-02 ile doğrula). | [ ] geçti [ ] kaldı | S8 ("izin reddedildiğinde çökmez, ayarlar durumu gösterir"; S-08/S-10) | Blokör | | [ ] |
| B-02 | SB: hatırlatma açık, saat 20:00 seçili, bugünün check-in'i BOŞ; telefon saatini 19:58 yap, uygulamayı öne getir, ekranı kilitle, bekle. Gelme dakikasını ve kaç bildirim geldiğini yaz. | Bugün nasıldı? bildirimi yaklaşık 20:00'de gelir (sapmayı yaz); tek bildirim, kopya yok; kilit ekranında metin sabit, içinde rakam/kategori/seviye yok. | [ ] geçti [ ] kaldı | S8 (saatinde gelme, kilit ekranı, N-01/X-01..04) | Blokör | | [ ] |
| B-03 | B-02'deki bildirime dokun (uygulama kapalı ve açıkken ayrı dene). | Uygulama açılır, çökme yok, Bugün/Hafta ekranlarına makul şekilde düşer. | [ ] geçti [ ] kaldı | S8 (dokunma akışı) | Önemli | | [ ] |
| B-04 | SB: saat 19:55, bugünün check-in'ini KAYDET; 20:00'yi bekle. Ertesi gün için telefon tarihini +1 gün yap (saat 19:55), uygulamayı öne getir ve bu kez check-in yapma, 20:00'yi bekle. | Bugün doluyken 20:00'de bildirim GELMEZ; ertesi gün boşken gelir (bugünkü iptal, yarınkiler korunur). | [ ] geçti [ ] kaldı | S8 ("check-in sonrası bugünkü iptal", N-02) | Blokör | | [ ] |
| B-05 | SB: saat 19:58, check-in boş. (a) Ayarlar'da Günlük hatırlatmayı kapat > 20:00'yi bekle. (b) Tekrar aç, saati 20:00 yerine 21:00 çipine değiştir > 20:00 ve 21:00'i bekle (saati 20:58'e alarak hızlandırabilirsin). | (a) Kapalıyken gelmez. (b) 20:00'de gelmez; 21:00'de gelir; eski saat için kalıntı bildirim yok. | [ ] geçti [ ] kaldı | S8 (aç/kapa, saat değişimi, S-02) | Önemli | | [ ] |
| B-06 | SB: temiz veri; telefon tarihini bir Pazartesi'ye kur (örn. bir sonraki Pzt), Pzt, Sal, Çar check-in'lerini her gün için tarihi +1 ilerleterek kaydet. Sonra tarihi o haftanın Pazar'ı 19:57'ye kur, uygulamayı öne getir, bekle. Bildirime dokun (bugün Pazar check-in'i boşken). | 20:00'de "Karnen hazır" gelir (3 dolu gün = ilk kart eşiği); dokununca Pazar check-in'i boş olduğundan "Bugünü de ekleyelim" ara ekranı, kayıttan sonra kart; bugün doluysa doğrudan kart. Çökme yok. | [ ] geçti [ ] kaldı | S8 (Pazar kartı bildirimi, dokunma akışı, C-08/C-13), S7a K3 | Blokör | | [ ] |
| B-07 | SB, saat dilimi Berlin (UTC+2) yap, saat 19:58, hatırlatma 20:00 seçili. Önce İstanbul'dayken uygulamayı aç (plan kurulsun), sonra saat dilimini Berlin'e değiştir, uygulamayı öne getir. | Bildirim Berlin yerel 20:00'de gelir ve tek gelir; İstanbul saatine göre olan eski bildirim (ayrıca) gelmez. | [ ] geçti [ ] kaldı | S8 (T-04, saat dilimi değişimi cihazda) | Önemli | | [ ] |
| B-08 | SB, saat dilimi New York yap, tarih o haftanın Pazar'ı 19:58 (3 dolu gün varken, B-06 kurulumu). | "Haftanın kartı hazır" New York yerel 20:00'de gelir; İstanbul'a göre "Pazartesi" ise yeni hafta sayılmaz (hafta yerel takvime göre). | [ ] geçti [ ] kaldı | S8 (T-02/T-03, Jest'te `skipped`) | Önemli | | [ ] |
| B-09 | SB, saat dilimi New York, tarih 31 Ekim 2026 (DST sonu 1 Kasım 2026), hatırlatma 21:00; iki gün boyunca tarih/saati ileri sararak 21:00'e kadar git. | Her gün TAM bir kez, yerel 21:00'de gelir; çift ya da eksik gün yok. (T-06/T-07 "yok olan/iki kez yaşanan saat" bildirim saatleri arayüzden seçilemediği için cihazda uygulanamaz, yalnızca kodda.) | [ ] geçti [ ] kaldı | S8 (T-05) | Düşük | | [ ] |

## 7. Ayarlar ve "Tüm verilerimi sil"

| ID | Adımlar | Beklenen | Sonuç | Kapattığı plan maddesi | Önem | Not | iOS (S11) |
|---|---|---|---|---|---|---|---|
| A-01 | Ayarlar sekmesine bak; 20:00/21:00/22:00/23:00 çiplerine dokun; "Gizlilik politikası (yakında)"ya dokun. | Öğeler: Günlük hatırlatma anahtarı, saat çipleri (varsayılan 21:00 seçili), Deneme raporunu paylaş, Gizlilik politikası (yakında), Tüm verilerimi sil. Seçim çipte görünür; anahtar kapalıyken çipler pasif; gizlilik bağlantısı çökmez. | [ ] geçti [ ] kaldı | S6 (ayarlar) | Önemli | | [ ] |
| A-02 | "Tüm verilerimi sil"e dokun; uyarı metnini oku, önce vazgeç. | Uyarı okunur ve düzgün görünür ("Bu işlem geri alınamaz. Emin misin?"), düğmeler dokunulabilir; vazgeçince hiçbir veri silinmez. | [ ] geçti [ ] kaldı | S6/S9 (Alert onay görünümü gerçek cihazda) | Önemli | | [ ] |
| A-03 | Bir kaç check-in + bir kart + bir paylaşım yapılmış durumdayken Sil'i onayla. Sonra uygulamayı tamamen kapat-aç. | İlk açılış durumu: onboarding'e döner; Bugün boş, Hafta 0 dolu ("3 gün daha lazım", ilk kart eşiği), kart yok, ayarlar varsayılan (21:00, hatırlatma açık); soğuk açılışta da hâlâ boş (dört tablo gerçekten temizlenmiş). Ayrıca Ayarlar'daki deneme raporunda tüm sayaçlar 0 (`metric_event` boş). | [ ] geçti [ ] kaldı | S5/S6 (silme), S9 N-2 (`exec` ile tek transaction gerçek expo-sqlite'da), S9 (metric_event cihazda boş) | Blokör | | [ ] |
| A-04 | SB: saat 19:55, hatırlatma 20:00, izin var; Sil'i onayla; onboarding'i BİTİRMEDEN bekle; sonra 20:00 ve 21:00'i geç. | Silme sonrası hiçbir bildirim gelmez (bekleyen bildirimler iptal, silinen ayarlar bildirimi diriltmedi). | [ ] geçti [ ] kaldı | S8 ("Tüm verilerimi sil planlı bildirimleri iptal eder", S-05/S-06) | Blokör (gizlilik) | | [ ] |

## 8. Deneme raporu

| ID | Adımlar | Beklenen | Sonuç | Kapattığı plan maddesi | Önem | Not | iOS (S11) |
|---|---|---|---|---|---|---|---|
| R-01 | Ayarlar > "Deneme raporunu paylaş". Açılan önizlemede raporun TAM metnini oku (S16b). Önce Vazgeç. | Önizlemede yalnızca sayaçlar ve gün sayısı, içerik/tarih/kimlik yok; Vazgeç hiçbir şey paylaşmaz/yazmaz. | [ ] geçti [ ] kaldı | S9 (SEC I-2 onay Alert'i) | Önemli | | [ ] |
| R-02 | Tekrar dene, Paylaş > sistem paylaşım sayfası > Mesajlar/WhatsApp/e-posta (kendine) hedefini seç; gelen dosyayı aç. | Paylaşım sayfası açılır; hedefte `.txt` okunur; içinde emoji, kart metni, takvim tarihi, kategori adı, kimlik yok; ölçüm sınırları (paylaşım fazla/ekran görüntüsü eksik sayılır) yazıyor. | [ ] geçti [ ] kaldı | S9 (rapor Android paylaşım sayfasıyla çıkar, .txt okunur) | Blokör | | [ ] |
| R-03 | Temiz veriyle bilinen bir akış yap: 3 check-in, 1 kart açma, 1 paylaşım (uyku+harcama gizli), sonra rapor al. | Raporda check-in ve kart açma sayıları yaptıklarınla tutarlı; paylaşım başlatma = 1; gizlenen satır = 2; aynı hafta kartı için "kart açıldı/açılabilir" sayaçları bir kez sayılıyor (tekrar açış `card_opened` sayısını artırabilir, not al). | [ ] geçti [ ] kaldı | S9 (olayların gerçek akışta beklenen anlarda yazılması) | Önemli | | [ ] |

## 9. Erişilebilirlik ve ekran boyutu

| ID | Adımlar | Beklenen | Sonuç | Kapattığı plan maddesi | Önem | Not | iOS (S11) |
|---|---|---|---|---|---|---|---|
| E-01 | Ayarlar > Ekran > "Ekran boyutu"nu sırayla Küçük, Varsayılan, Büyük yap (gerekirse ikinci/üçüncü bir cihaz veya farklı boyutlu emülatör de kullan). Her birinde Bugün, Hafta, Ayarlar, açık kart ve önizleme ekranlarına bak; kartı her boyutta paylaşıp PNG boyutuna bak. | Hiçbir ekranda taşma/kesilme yok; Kaydet ve Paylaş erişilebilir; kart aynı görünür; PNG hep 1080 x 1920 ve üç boyutta birebir aynı. | [ ] geçti [ ] kaldı | S7a (3 farklı ekran boyutu), S10 (kart 2. tur) | Blokör | | [ ] |
| E-02 | Ayarlar > Ekran > "Yazı tipi boyutu"nu en büyüğe al (varsa "Ekran boyutu" da büyük); tüm ekranları ve onboarding'i gez; kaydır. | Metinler kesilmez, düğmeler ekrandan çıkmaz (kaydırılabilir), Kaydet/Paylaş/Sil erişilebilir; üst üste binen metin yok. | [ ] geçti [ ] kaldı | S6 (büyük yazı tipi/E13), S10 (erişilebilirlik ölçeği) | Blokör | | [ ] |
| E-03 | TalkBack'i aç: Bugün'de bir emojiye, Kaydet'e (pasif ve aktif), Hafta'da kilitli kutuya, önizlemede gizli bir satıra dokun. | Emoji seçenekleri ve seçili durum anlamlı okunur; pasif Kaydet "devre dışı" olarak duyulur; kilitli kutu gerçek kart metnini okumaz; önizleme listesindeki gizli satırın gerçek metni okunabilir (bilinçli tasarım, SEC nit-a; yalnızca farkındalık için not al, bulgu sayma). | [ ] geçti [ ] kaldı | S6/S10 (erişilebilirlik), S7b SEC nit (a) | Önemli | | [ ] |

## 10. Gizlilik ve ağ

**Ağ gözlemi için basit yollar (araç seçimi S10'da yapılır; buradaki hepsi bilgisayarsız veya kolay):**
1. **Uçak modu / veri kapalı** (en kolay, aracı yok): tüm akış internetsiz çalışıyorsa uygulama ağa bağımlı değildir (ama sessiz giden istekleri kanıtlamaz).
2. **PCAPdroid** (Play Store'dan, root gerekmez): telefonda yerel VPN ile yalnızca bizim uygulamanın bağlantılarını listeler, dışa aktarır. Bu iş için en pratik seçenek; ekran görüntüsü kanıt olur.
3. **Android "Veri kullanımı"** ekranı (Ayarlar > Ağ ve internet > Veri kullanımı > uygulama): kaba kontrol, 0 B beklenir (gizli küçük istekleri yakalamayabilir).
4. **NetGuard / RethinkDNS** (güvenlik duvarı): uygulamayı ağdan engelleyip erişim denemesi kaydeder; engelliyken uygulama sorunsuz çalışıyorsa dolaylı kanıt.
5. **mitmproxy/Charles proxy** (Wi-Fi proxy): yalnızca HTTP(S) isteklerini gösterir, DNS/başka protokolleri kaçırır; en zahmetlisi. Wireshark+adb (elenen seçenek): kurulum ağır, bu iş için gerek yok.
Not: ağ kanıtı release APK ile alınır; dev derleme zaten bilgisayardaki Metro'ya bağlanır (ağ trafiği anlamsız).

| ID | Adımlar | Beklenen | Sonuç | Kapattığı plan maddesi | Önem | Not | iOS (S11) |
|---|---|---|---|---|---|---|---|
| G-01 | Release APK'yı kur. Wi-Fi ve mobil veriyi kapat (uçak modu). Tam akış: onboarding, check-in, kart, gizleme, paylaşım (yerel hedef), deneme raporu, bildirim, silme. | Hepsi internetsiz sorunsuz çalışır, hata/ağ uyarısı yok. | [ ] geçti [ ] kaldı | S10 ("üretim derlemesinde ağ kullanımı yok") | Blokör | | [ ] |
| G-02 | Release APK, PCAPdroid'de yalnızca bu uygulama seçili, kayıt açık; internet AÇIKKEN tam akışı (G-01 listesi + bildirimin gelmesini bekleyerek) çalıştır; kaydı dışa aktar/ekran görüntüsü al. | Uygulamadan dışarı HİÇ bağlantı/istek yok (özellikle FCM/Firebase, token kaydı, analitik, güncelleme kontrolü); kanıt saklanır. | [ ] geçti [ ] kaldı | S10 (b: ağ izleme; expo-notifications FCM/token isteği yok), S8 SEC-3 | Blokör | | [ ] |
| G-03 | Bilgisayardan: `adb shell dumpsys package com.batuhan.haftik` çıktısında "requested permissions" ve "Firebase/FCM" ile ilgili satırlara bak (sonucu `docs` dışında bir yere kaydet; gerekirse ajana yolla). | İstenen izinler yalnızca beklenenler (POST_NOTIFICATIONS, RECEIVE_BOOT_COMPLETED, INTERNET yalnızca gerekçesiyle); konum/kişi/kamera/mikrofon/depolama yok; FCM bileşeni var olsa bile G-02'de trafik yok. | [ ] geçti [ ] kaldı | S10 (a, a2: birleşik manifest + FCM doğrulaması) | Blokör | | [ ] |
| G-04 | Bilgisayardan: `adb logcat -c`, uygulamada release APK ile tam akışı yap (check-in, kart, paylaşım, silme), sonra `adb logcat -d` çıktısını uygulama paketi/etiketleri için tara. | Loglarda emoji seçimi, kart metni, unvan, tarih+kategori gibi kullanıcı verisi yok. | [ ] geçti [ ] kaldı | S10 ("log'larda veri yok taraması") | Önemli | | [ ] |
| G-05 | Bilgisayardan: `adb shell dumpsys package com.batuhan.haftik` çıktısında `flags=[ ... ]` satırına bak. | Listede `ALLOW_BACKUP` YOK (yedekten hariç). | [ ] geçti [ ] kaldı | S5/S10 (K7 Android cihaz kanıtı) | Blokör | | [ ] |
| G-06 | Release APK'da uygulamanın her ekranını gez; sağ alt köşeye bak; H-02'deki 🕒 düğmesini ara. | Zaman simülasyonu düğmesi/paneli yok. | [ ] geçti [ ] kaldı | S6/S10 (gizli debug menüsü üretimde yok) | Blokör | | [ ] |
| G-07 | Ayarlar > Uygulamalar > Haftalık Hayat Karnesi > İzinler ve Veri kullanımı ekranlarına bak (G-02 öncesi/sonrası). | İzinlerde yalnızca Bildirimler; konum/kişi/kamera/mikrofon istenmez; mobil/Wi-Fi veri kullanımı 0 B veya ihmal edilebilir. | [ ] geçti [ ] kaldı | S10 (izin listesi, ağ kaba kontrol) | Önemli | | [ ] |
| G-08 | Bilgisayardan, release paketi için: `npx expo export --platform android --no-bytecode`; çıktı JS'inde `dev-time-menu`, `dev-time-helpers`, `currentWeekSunday2000`, `ilerlet` dizelerini ara (pozitif kontrol: `--dev` ile aynı arama bulur). | Release paketinde bu dizeler 0 geçiş; `setDevNowOverride` yalnızca boş stub. | [ ] geçti [ ] kaldı | S10 SEC N-8 (dev menü üretimde yok) | Blokör | | [ ] |
| G-09 | Bilgisayardan: `npx expo prebuild --platform android --clean`, sonra `android/app/src/main/AndroidManifest.xml` VE birleşik manifest (`apkanalyzer manifest print` veya `aapt dump permissions` release APK/AAB üzerinde). | Şemalar `haftik`; `allowBackup="false"`; izinler beklenenler (INTERNET/SYSTEM_ALERT_WINDOW/VIBRATE kararı Batuhan'ın, I-2); READ/WRITE_EXTERNAL_STORAGE yok; eski `hhkscaffold`/`expo-updates` kalıntısı yok. Çıktı `docs/s10-guvenlik-raporu.md`'ye eklenir. | [ ] geçti [ ] kaldı | S10 SEC I-2 (merged manifest) | Blokör | | [ ] |
| G-10 | Bugün ekranında emoji seçiliyken Home'a bas ve "Son uygulamalar" (recents) küçük resmine bak. | Küçük resimde seçili emojilerin görünüp görünmediğini yaz. Karar (N-9: uygulama kilidi/FLAG_SECURE) Batuhan'ın; v1 dışıysa plan.md'ye yazılır. | [ ] geçti [ ] kaldı | S10 SEC N-9 (recents küçük resmi) | Bilgi | | [ ] |

## 11. Cihaz ve pil

| ID | Adımlar | Beklenen | Sonuç | Kapattığı plan maddesi | Önem | Not | iOS (S11) |
|---|---|---|---|---|---|---|---|
| D-01 | SB (B-02 kurulumu): ekranı kilitle VE uygulamayı son uygulamalardan kaydırarak tamamen kapat; 20:00'yi bekle. | Uygulama kapalıyken bile hatırlatma gelir (gelme sapmasını yaz). | [ ] geçti [ ] kaldı | S8 (planlı bildirimler, uygulama kapalı) | Blokör | | [ ] |
| D-02 | Pil tasarrufu modunu aç, D-01'i tekrarla. | Bildirim gelir; gecikme varsa süresini yaz (kabul edilen sapma sınırı: birkaç dk). | [ ] geçti [ ] kaldı | S8 (pil tasarrufu gecikmesi, E13) | Önemli | | [ ] |
| D-03 | Agresif pil yönetimli üretici cihazı varsa (Xiaomi/Huawei/Oppo/Vivo vb.) D-01'i varsayılan pil ayarlarıyla (uygulamaya özel muafiyet VERMEDEN) tekrarla. Cihaz yoksa "yok" yaz. | Bildirim gelir; gelmiyorsa bu bir risk bulgusu (E13, ayarlarda uygulama için pil muafiyeti gerektirir). Cihaz yoksa S10'da "risk olarak kayda geçildi" işaretle. | [ ] geçti [ ] kaldı [ ] cihaz yok | S10 (OEM pil davranışı, E13) | Önemli | | [ ] |
| D-04 | Hatırlatma 21:00 planlıyken (SB ile saat 20:55) telefonu yeniden başlat, uygulamayı AÇMA, 21:00'i bekle. | Yeniden başlatma sonrası planlı hatırlatma yine gelir (RECEIVE_BOOT_COMPLETED). | [ ] geçti [ ] kaldı | S8 (yeniden başlatmada plan korunur) | Önemli | | [ ] |
| D-05 | 2 gün gerçek hayat: telefon saati otomatik, dev panel `(gerçek)`, hatırlatma 21:00; uygulamayı normal kullan, günlük hatırlatmanın 21:00'de gelip gelmediğini ve gecikmesini yaz; hafta sonunda 3+ gün doldurmuşsan Pazar 20:00 "Karnen hazır"ı da izle. | Her akşam yaklaşık 21:00'de tek hatırlatma; check-in yapılmış günün hatırlatması gelmez; Pazar'da kart bildirimi. Sapma ve kaçan bildirimleri Not'a yaz. | [ ] geçti [ ] kaldı | S8/S10 (bildirim güvenilirliği), S12 öncesi güven | Önemli | | [ ] |

---

## Bulgu kayıt şablonu

Her "kaldı" ve her ilginç not için kopyala/doldur:

```
Bulgu no:            BLG-__
Madde ID:            (örn. K-05)
Önem:                Blokör / Önemli / Düşük
Cihaz / Android:     
Derleme:             dev / release, tarih
Adımlar:             1) ... 2) ...
Beklenen:            
Gözlenen:            
Tekrarlanabilirlik:  her seferinde / bazen (kaç denemede kaç kez)
Kanıt:               ekran görüntüsü/kayıt dosya adı, adb/PCAPdroid çıktısı
Şüpheli neden (varsa): 
Kapattığı plan maddesi: S_
Durum:               açık / düzeltildi (commit/tarih) / kabul edildi (gerekçe)
```
Gerçek bir hatadan çıkan ders varsa: `CLAUDE.md` "Bilinen tuzaklar"a bir madde ve `evals/checklist.md`'ye bir madde eklenir.

## Sonuçlar

Tarih: ______  Test eden: ______  Cihaz/Android: ______  Derleme: ______

| Bölüm | Toplam | Geçti | Kaldı | Atlandı/uygulanamadı |
|---|---|---|---|---|
| 1. Hazırlık/kurulum | 3 | | | |
| 2. Check-in | 6 | | | |
| 3. Hafta ekranı | 4 | | | |
| 4. Kart açılışı + K3 | 8 | | | |
| 5. Gizleme/önizleme/paylaşım | 7 | | | |
| 6. Bildirimler | 9 | | | |
| 7. Ayarlar/silme | 4 | | | |
| 8. Deneme raporu | 3 | | | |
| 9. Erişilebilirlik/ekran boyutu | 3 | | | |
| 10. Gizlilik/ağ | 7 | | | |
| 11. Cihaz/pil | 5 | | | |
| **Toplam** | **59** | | | |

Açık Blokör bulgu sayısı: ___    Açık Önemli: ___    Açık Düşük: ___
S10 kapı kararı (açık Blokör yok, ağ kanıtı G-02 var, K7 kanıtı G-05 var): [ ] geçti [ ] geçmedi
iOS sütunu: S11'de (K9 Apple üyeliği) doldurulacak; bu turda boş.

# 19 - Metin ve içerik v2 (Haftik) - 2026-09-29

Rol: Metin Yazarı / İçerik Editörü. Durum: **TAMAMLANDI (bölüm 1-8).** Kod, test, `app.json`, `tr.ts` DEĞİŞTİRİLMEDİ; yalnızca öneri metni. Son söz Batuhan'ın.
Zemin kararlar (16-ortak-brif): yön C çıkartma albümü · adlandırma "Kart" · seviye noktaları yeniden tasarlanıyor.
Karakter sınırı yöntemi: kabuk aracı yok; metinler bir tarama dosyasına yazılıp regex ile üst sınır denetlendi (`^.{N,}$`, Grep). Tabloda "en çok N" yazıyorsa N'yi aşan satır bulunmadığı **komutla** doğrulandı; tam sayı verilmedi. Yayın öncesi `node -e "console.log([...s].length)"` ile ikinci doğrulama şart (02 §5 emsali).

## 1. Ses ve ton rehberi v2

### 1.1 Beş sıfat (C: yetişkin, esprili çıkartma albümü)

1. **Kuru esprili.** Bağırmaz, ünlem yığmaz. Espri cümlenin sonunda, bir adım geriden gelir ("Dört. Kaydet'e kadar birkaç saniye.").
2. **Gözlemci, yargısız.** Ne olduğunu söyler (arttı/azaldı/aynı), iyi-kötü demez; kullanıcının niyetini, işini, evini, parasını, ruh halini varsaymaz.
3. **Albüm zanaatkârı.** Söz dağarcığı küçük ve elle yapılmış: kart, çıkartma, sayfa, albüm, yapıştı. Resmî dilin küçük parodisi ("Çıkartmalar iade edilmez.").
4. **Sıcak ama dik.** "Sen" der; ders vermez, küçümsemez, çocuk konuşmaz. Oyuncu olan görsel, yazı değil.
5. **Şeffaf.** İzin, veri, silme, hata metninde espri yok. Ne olduğunu ve ne yapılacağını düz söyler; söz verdiğini tutar.

**C'nin çocuksu görünme riskine yazı tarafının cevabı:** görsel dil oyuncu (kalın kontur, sert gölge, eğik çıkartma), **yazı kuru ve ciddi**. Zıtlık yetişkin mizahını üretir. Yazı da oyuncu olursa ("minik", "şipşirin", "yaşasın", ünlem/emoji yağmuru) ürün çocuk uygulamasına kayar (18+ hedefiyle çelişir).

### 1.2 Şaka payı yüzeye göre

| Yüzey | Şaka payı | Kural |
|---|---|---|
| Kart satırları, unvan | %100 | Tek espri, tek cümle; kategori imgesi yalnızca kendi satırında |
| Kart özeti | %60 | Kısa, kuru; kategori adı/imgesi yok |
| Kart dipnotu (öneri, 6.1) | %100 | Resmî dil parodisi |
| Onboarding, mağaza | %30 | Bir hafif cümle, gerisi net |
| Kaydet anı, bildirim | %40 | İlerleme ya da nazik espri; asla baskı |
| Hafta ekranı | %20 | Durum önce, espri sonra |
| İzin, silme, hata, gizlilik, ayarlar | %0 | Suçlamayan, çözüm veren düz cümle |

### 1.3 Yapılacak / yapılmayacak

| Yap | Yapma | Neden |
|---|---|---|
| "Adım sayarın anlatacak fazla şeyi yok." | "Hareketin çok düşük, biraz kalk." | Tavsiye/yargı |
| "Telefonun rehberi terledi." | "Harika bir hafta geçirdin!" | Övgü de yargıdır; ünlem |
| "Geçen haftaya göre çoğu şey yavaşladı." | "Bu hafta düşüşe geçtin." | Yön okuma; "düşüş" olumsuz |
| "Kaydedemedik. Bir kez daha dener misin?" | "Hata! Kayıt başarısız." | Teknik, suçlayıcı ton |
| "Bugün kaç emoji tutar? Dört." | "Serin bozulmasın, bugünü işaretle!" | Kayıp korkusu (dark pattern) |
| "Bildirim izni kapalı. Anahtarı açınca izin isteriz." | "İzin vermediğin için çalışmıyor." | Suçlama; çözüm yok |
| "Uyku: kısa" | "Uyku: kötü" | Miktar dili, kalite dili değil |
| "Gizli çıkartma: bilerek saklandı" | "???" | Gizleme hata gibi değil seçim gibi okunmalı |
| "Kart için 2 gün daha." | "Kartın için 2 gün daha lazım." | "Lazım" zorunluluk tonu |
| "Çıkartmalar iade edilmez." | "Yaşasın! Harikasın!!!" | Çocuksu, ünlem yığını |

### 1.4 Sözlük ve yasak kalıplar (güncel)

**Kullan:** kart (haftalık kart), çıkartma (unvan/satır çıkartması), sayfa, albüm, yapıştı/yapıştırıldı, işaretle, Kaydet, unvan, gizli, hafta.
**Kullanma (kullanıcıya dönük):** karne (bkz. bölüm 2), check-in (yabancı; "işaretle"), not/puan/skor, seri, başarı/kazandın, "lazım", "sonuç", "veri" (kullanıcıya "işaretlerin/kayıtların" de), "performans", "anonim".
**Kart havuzunda yasak (02 §1.4'ün üstüne, 4.2'de nihai liste):** kahraman, yıldız, şampiyon, cömert, cimri, tutumlu, çekingen, içine dönük, yalnız (etiket), yorgun/uykusuz/zinde/dinlenmiş, uykucu, "tam kararında/tam kıvamında", akıllıca, güzel, harika, süper, bravo, kusursuz, kumbaracı, "orta karar", "mod" (havuzda en çok 1), "kart" banka anlamında (bkz. 2.4).
**Kota (imge envanteri, havuz toplamı — mevcut + bu belgedeki yeni öneriler dahil, bkz. 4.3 "kota bakiyesi"):** "bu hafta"/zaman zarfı satırların **%0'ında** (4.1, zamansızlaştırma kararı — eski kota "%30" bu belgeyle **kaldırıldı**); "ne... ne..." hücre başına en çok 2; "vites" toplam en çok 2; "orta şekerli" 1; "kanepe" en çok 2; "cüzdan" en çok 5; "yastık/battaniye" birlikte en çok 4; rütbe soneki (Usta/Uzman/Şampiyon/Kahraman/Yıldız) 40+ unvanın en çok 4'ü; "resmen" en çok 1; "telefon rehberi" en çok 2.

### 1.5 Mizah mekanikleri (Türkçe) ve yetişkin çizgisi

Kullan: **nesneye kişileştirme** (rehber terledi, takvim yoruldu), **resmî dil parodisi** (iade edilmez, mahkemede kullanılamaz), **deyim kullanma/bozma** (orta şekerli, tatlı tuzlu, ne aç ne tok), **beklenti kırma** ("Dört."), **hafif abartı** (nefesi yetmedi).
Çizgi: (1) alay kullanıcıya değil nesneye gider (cüzdan, rehber, takvim, adım sayar); (2) borç, yoksulluk, yalnızlık, uyku bozukluğu, kaygı alanına girilmez; (3) bir cümle, bir espri; (4) kartta emoji yalnızca kategori emojisidir, metinde emoji yok; (5) tek ünlem: "Kartın hazır!".

### 1.6 Öneri: içerik lint testi (P5, bölüm 4.5'te genişletildi)

Elle denetim ölçeklenmez (havuz 40 -> ~180+, bölüm 4.3). Testler mevcut ve iyi (<=60, rakamsız, 81/81, dağılım); şunlar eklenirse ses kılavuzu **kendini uygular**: (a) yasak sözcük listesi (4.2), (b) kota sayacı (1.4), (c) "karne" araması, (d) **kategori sızıntısı**: unvan/özet metni, kendi `basedOnCategories`'i dışında kalan bir kategorinin imge sözlüğünden (yastık, uyku, cüzdan, harcama, adım, bacak, kanepe, telefon rehberi...) sözcük içermez, (e) özet metninde seviye sözcüğü yok (yoğun, hafif, kısa, uzun, sakin...), (f) **zaman zarfı araması** ("bu hafta", "geçen hafta", "bu sefer", "şu an" — kart havuzunda 0 geçiş; 4.1). Efor S (~0,5-1 gün, madde (f) eklenince), sahibi mobile-engineer + test-automation-engineer (test dosyasına ben dokunmadım).

## 2. "Kart / karne" adlandırma taraması

Tarama: `src/`, `docs/ux/`, `site/`, `docs/s12-magaza-icerigi.md`, `14-gorsel-prototipler/` (Grep, K1). Toplam 42 dosyada 220 geçiş; **kullanıcıya dönük olanlar** aşağıda. Tarihsel/çalışma adı olanlar 2.5'te ("dokunma").

### 2.1 Uygulama (src)

| Dosya:satır | Şu an | Öneri |
|---|---|---|
| `src/app/onboarding/welcome.tsx:11` | "Her gün 8 saniye. Her pazar bir karne." | "Günde dört emoji, Pazar akşamı bir kart." (ayrıca "8 saniye" ölçülmedi, kaldırılır) |
| `src/app/onboarding/welcome.tsx:13` | "...haftanı emojiyle anlat, pazar akşamı sonucu gör." | Bölüm 3.3 |
| `src/components/card-preview-view.tsx:57` | `Haftalık karnem hazır! ${STORE_LINK_PLACEHOLDER}` | "Haftalık kartım hazır!" (bağlantı gerçek olana kadar yer tutucu eklenmez) |
| `src/domain/content/tr.ts:193` | "İlk karnen bu, kıyaslayacak geçmiş hafta yok." | Bölüm 4.3/4.4 firstCard (geri dönene de yanlış çıkıyordu, 02 M-2) |
| `src/domain/content/notification-texts.ts:17` | "Karnen hazır" | "Haftanın kartı hazır" (bölüm 5.1) |
| `src/metrics/report.ts:74-75` | "Dolu check-in günü", "7. günde check-in" | "Dolu gün", "7. günde işaretleme" (rapor metni, Batuhan okur; "check-in" yabancı) |

### 2.2 Site ve mağaza

| Dosya:satır | Şu an | Öneri |
|---|---|---|
| `site/index.html:11` | `Haftik: haftalık hayat karnen` | "Haftik: haftalık emoji kartın" |
| `site/index.html:12` | "...emoji check-in'inden... haftalık karne kartı..." | "Günde birkaç saniyelik emoji işaretlemeden, her Pazar açılan paylaşılabilir haftalık kart. Hesap yok, veri yalnızca cihazında." |
| `site/index.html:28` | "Haftalık hayat karnen, birkaç saniyede." | "Haftanın kartı, birkaç saniyede." |
| `site/index.html:29` | "...haftanın esprili küçük bir karnesi hazır olur." | "...haftanın esprili küçük bir kartı hazır olur." |
| `site/gizlilik.html:74` | "...('Bugün nasıldı?' ve 'Karnen hazır')" | Alıntıyı kaldır ("Metinler sabittir ve senin verinden hiçbir şey içermez.") ya da yeni metinle güncelle (02 S-11) |
| `site/index.html:12`, `site/gizlilik.html:49,52,85` | "check-in" | "günlük işaret / işaretleme" |
| `docs/s12-magaza-icerigi.md:84` | anahtar kelime `karne` | Bölüm 5.3 (yerine `kart`) |
| `docs/s12-magaza-icerigi.md:36,59,81` | "check-in" (güncelleme notu, madde, App Store adı "Emoji Check-in") | Bölüm 5.3 |

### 2.3 UX belgeleri ve prototipler

| Dosya:satır | Şu an | Öneri |
|---|---|---|
| `docs/ux/ekran-akisi.md:55` | onboarding metin taslağı "bir karne." | 3.3 ile eşle |
| `docs/ux/ekran-akisi.md:221`, `docs/ux/kart-yerlesimi.md:36,93` | damga "Haftalık Hayat Karnesi · [mağaza]" | Bayat: kod zaten `Haftik · [..]` (`src/config/constants.ts:23`). Belgeyi koda ve 5.4'e (dipnot/damga) uydur |
| `docs/ux/ekran-akisi.md:1,18` | belge başlığı, "karne/zarf açma ritüeli" | Başlık tarihsel (dokunma); satır 18 tasarım niyeti, "kart/çıkartma sayfası" diye güncelle |
| `14-gorsel-prototipler/kart-c-cikartma-albumu.html:115,159` | bant "HAFTA KARNESİ" | **"HAFTANIN UNVANI"** (4.1 zamansızlaştırma kararıyla birlikte — "BU HAFTANIN" değil, tarih içermeyen "HAFTANIN") |
| `.../kart-c-cikartma-albumu.html:122,165` | patlama rozeti "KARNESİ" | "HAFTALIK" (rozet: HAFTİK / HAFTALIK) |
| `.../ekran-hafta.html:204,242,249` | "HAFTA KARNESİ" (zarf etiketi) | "HAFTA KARTI" (A yönü seçilmedi; C'ye taşınırsa çıkartma sözlüğü) |
| `.../ikon.html:149,176,203` | Play kartı alt başlığı "Haftanın emoji karnesi" | "Haftanın emoji kartı" |
| `13-urun-vizyonu.md` (31 geçiş) | "Karnelerim", "V1 Karne kimliği" | "Albüm" (bölüm 3.5). Belge içi, kullanıcıya dönük değil; ekran adı kararı Batuhan'da |
| `14-gorsel-prototipler/kart-a-muhurlu-karne.html:18,35,38,60,79,93,191,195` | dosya adı ve iç metin "Mühürlü karne", "HAFTA KARNESİ", "BU HAFTANIN UNVANI" | A yönü seçilmedi (Karar 1); dosya dokunulmuyor ama Batuhan bu prototipi referans alırsa aynı düzeltme (kart/HAFTANIN UNVANI) uygulanmalı |

### 2.4 "Kart" sesteşliği: banka kartı

Ürün adı "Kart" olunca havuzdaki **banka kartı** kullanımları çakışıyor ("Kartın Kahramanı" kartın kahramanı mı, banka kartı mı?):

| Dosya:satır | Şu an | Öneri |
|---|---|---|
| `src/domain/content/tr.ts:83` | unvan "Kartın Kahramanı" | "Cüzdan Mesaide" (02 §5.1) |
| `src/domain/content/tr.ts:135` | "Kartın bu hafta neredeyse hiç ısınmadı." | "Cüzdanın soğuk kaldı." (4.1 zamansız + sesteş düzeltmesi birlikte) |
| `src/domain/content/tr.ts:144` | "Kartın bu hafta epey mesai yaptı." | "Cüzdanın soluklanmaya vakit bulamadı." |
| `src/constants/emoji.ts:25` | orta harcama emojisi 💳 | Düşük öncelik: 💳 "kart" çağrışımı; ui-ux-designer'a devir (🧾/🛍 gibi bir alternatif) |

### 2.5 Dokunma (tarihsel / çalışma adı)

`CLAUDE.md` (3), `spec.md`, `plan.md`, `intent/`, `PLAYBOOK.md`, `REVIEW.md`, `evals/`, `docs/uygulama-adi-onerileri*.md`: "Haftalık Hayat Karnesi" çalışma adı; CLAUDE.md kararı (S12) gereği tarihsel kayıt. `docs/manual-checklist.md` (satır 47, 105, 116 ve uzun satırlar 81/99/114/175) ve `docs/emulator-test-sonuclari.md:22` **test beklentisi** olarak eski metni taşıyor: yeni metinler uygulanınca birlikte güncellenmeli (qa-engineer). `__tests__/card/share.test.ts:38,41` "Haftalık karnem hazır!" değerini **kendi içinde** literal olarak kullanıyor (kaynağa bağlı değil); değişiklik gerekmez ama tutarlılık için qa-engineer görebilir. `spike/notifications/scheduleSpike.ts:50` spike; dokunma.

## 3. Yeni mikro-metinler

Sayılar uygulama içinde serbest (13 K-6 seçenek a; Batuhan onayı bekliyor — bölüm 7 Q6). Kart PNG'sinde rakam **ve harfle yazılmış sayı** yok (bölüm 4.1'in zamansızlaştırma gerekçesiyle aynı ilke: kart içeriği, ne zaman/hangi bağlamda görüldüğünden bağımsız doğru kalmalı; "yedi gün" gibi bir ifade sonradan yanlış okunmaz ama gereksiz kesinlik taşır, kaçınılır).

### 3.1 Seviye kelimeleri (3 seviye x 4 kategori)

Sorun: uyku "kötü / idare / iyi" kalite dilidir (02 M-1); sosyal "yalnız" damgalayıcı, "ölçülü" normatif. Noktalar (1-3) kalkacağı için kelime tek başına taşıyıcı: miktar/yoğunluk söylemeli, iyi-kötü söylememeli.

| Kategori | 1 | 2 | 3 | Şu an | Not |
|---|---|---|---|---|---|
| Hareket | durgun | hafif | yoğun | aynı | Değişmez |
| Uyku (A) | kısa | orta | uzun | kötü/idare/iyi | Miktar; kart satırları zaten miktar dili ("seni pek göremedi") |
| Uyku (B) | az | orta | bol | | A tercih: "az/çok" harcamayla karışmaz |
| Harcama | az | orta | çok | aynı | Değişmez |
| Sosyal (A) | sakin | orta | kalabalık | yalnız/ölçülü/kalabalık | "yalnız" ve "ölçülü" gider |
| Sosyal (B) | tenha | orta | kalabalık | | "sakin" duygu, "tenha" ortam söyler; B daha nötr ama daha az günlük |

Kurallar: (1) "orta" üç kategoride ortak, normatif "dengeli/ölçülü/idare" yok. (2) Seviye kelimesi **özet ve unvan metninde geçmez** (kategori-nötr kalsın, 1.6-e). (3) Kartta kelime gösterilecekse küçük harf ve yalnız görünür satırda; gizli satır kelime taşımaz. (4) Erişilebilirlik etiketi "Uyku: kısa" biçimini korur. (5) `CATEGORY_LEVEL_LABELS_TR`'ye bağlı testler (a11y etiketi) mobile-engineer + qa-engineer tarafından güncellenir (02 §5.4 notu).
Not (ui-ux-designer): uyku emojileri 😪 😌 😴 kısa/orta/uzun yerine yorgunluk/huzur/uyku çağrışımı veriyor; miktar okunan bir set (ör. gece/ay temalı) düşünülebilir. Tavsiye değil, gözlem.

### 3.2 Kaydet anı geri bildirimi

Amaç: günlük tek eylemin ödülü (13 V3; 09 #9: Kaydet sonrası ekran değişmiyordu). **Tek satır, ~1,2 sn, ilerlemeden türeyen; seviye/kategori içeriği yok.** Durum seçimi saf fonksiyon; metin, `(hafta başlangıcı, gün)` tohumlu, aynı durumda ardışık iki gün aynı varyant çıkmaz (son kimlik saklanır, veri sızdırmaz). `{r}` = kalan gün sayısı (rakam). Hepsi en çok 52 karakter (`{r}` tek hane, komutla doğrulandı). Aynı metin ekran okuyucuya duyurulur (A11Y-07). **Not:** bu metinler kartın kendisi (PNG'ye giren dondurulmuş içerik) DEĞİL, geçici uygulama-içi arayüz metnidir; bu yüzden 4.1'deki "kart zamansızlaştırma" kuralına tabi değildir — "bugün", "{r} gün" gibi o anki duruma referans vermesi doğrudur.

| Durum (koşul) | Varyantlar |
|---|---|
| **A. İlk kayıt** (hiç kart/işaret yok) | "İlk gün sayfaya yapıştı." · "Başladık. Gerisi de birkaç saniye sürer." · "İlk gün tamam. Albüm açıldı." |
| **B. Eşik altı**, kalan `{r}` >= 2 | "Bugün de tamam. Kart için {r} gün daha." · "Yapıştı. Kart için {r} gün daha var." · "Kaydedildi. Sayfada {r} yer daha var." · "Bugün sayfaya girdi. {r} gün daha." |
| **C. Eşik altı**, kalan 1 | "Bir gün daha, kart için yeter." · "Yapıştı. Kart bir gün uzakta." · "Bugün tamam. Bir gün daha yeter." |
| **D. Eşik bu kayıtla doldu** (Pazar 20:00 öncesi) | "Yeterli gün doldu. Kart Pazar 20:00'de açılıyor." · "Kart için gereken gün tamam. Pazar akşamı görüşürüz." · "Gereken gün doldu; kalanı senin keyfin." · "Sayfa yeterince doldu. Kart Pazar akşamı hazır." |
| **E. Eşik sonrası ek gün** | "Bugün de sayfada. Kart Pazar'da hazır." · "Kaydedildi. Pazar 20:00'yi bekliyoruz." · "Yapıştı. Kart Pazar akşamı seni bekliyor." · "Bugün de eklendi. Kart Pazar 20:00'de." |
| **F. Tam hafta** (7/7, Pazar 20:00 öncesi) | "Yedi günün yedisi de sayfada." · "Bu hafta hiç boşluk kalmadı." · "Tam sayfa. Kart bu akşam 20:00'de." · "Sayfanın her köşesi dolu." |
| **G. Aynı günün kaydı güncellendi** | "Bugünün kaydı güncellendi." · "Değişiklik yapıştırıldı." · "Güncellendi. Son hali geçerli." · "Fikir değişti, kayıt da değişti." |
| **Y. Dün düzenlendi** | "Dün de sayfada." · "Dünkü yer de doldu." · "Dünkü kayıt tamam." |
| **H. Pazar 20:00 sonrası, K3 otomatik devam** | "Son gün de tamam. Kartın açılıyor." · "Bugün de sayfada. Kartına geçiyoruz." · "Yapıştı. Kart geliyor." |
| **I. Dönüş** (yeni haftanın ilk kaydı, önceki kayıttan >= 4 gün sonra; kaç gün geçtiği yazılmaz) | "Yeni sayfa, temiz başlangıç." · "Hoş geldin. Yeni sayfa açık." · "Bugünden devam. Sayfa yeni." |
| **X. Kayıt hatası** | "Kaydedemedik. Bir kez daha dener misin?" · "Bu sefer olmadı. Bir kez daha dener misin?" |

Denetim: (1) Koşulların hiçbiri seviye/kategori verisine bakmaz. (2) Ölçüt: "Kart Pazar 20:00'de açılıyor" yalnızca zaman koşulu henüz sağlanmamışken (D, E, F) doğru; H/I durumlarında söylenmez. (3) B'de "açılabilir" iddiası **bilerek yok** (gün sayısı dolsa da Pazar 20:00 beklenir; 09'daki yanıltıcı "hazırlanıyor" hatasının tekrarı olmasın). (4) Yasak: seri, kaçırma, "hâlâ", kayıp dili. (5) F1 "yedi" sayı: yalnızca uygulama içi (K-6a), PNG'ye girmez. (6) "Yapıştı/sayfa" en çok yarı varyantta; her cümle albüm dilini taşımak zorunda değil (kota).

### 3.3 Onboarding ve "ÖRNEK" kart

| Ekran | Şu an | Öneri |
|---|---|---|
| Karşılama başlığı | Her gün 8 saniye. Her pazar bir karne. | A: **Günde dört emoji, Pazar akşamı bir kart.** / B: Her gün birkaç saniye. Her Pazar bir kart. |
| Karşılama gövdesi | Hareket, uyku, harcama, sosyal: haftanı emojiyle anlat, pazar akşamı sonucu gör. | Hareket, uyku, harcama, sosyallik: haftanı emojiyle anlat. Pazar akşamı esprili bir kart açılır; paylaşmak istersen paylaşırsın. |
| Örnek başlığı (yeni) | | **Pazar akşamı böyle bir kart açılır.** |
| Örnek alt yazısı (yeni) | | Bu bir örnek; seninki kendi günlerinden çıkar. Uyku ve harcama başta gizli gelir, paylaşırken sen seçersin. |
| Gizlilik gövdesi | Hesap yok, bulut yok. Telefon değişirse veri taşınmaz. | Hesap yok, bulut yok. Telefonu değiştirirsen veriler yeni telefona geçmez. |
| İzin gövdesi | ...hatırlatma göndeririz. | Akşam 21:00'de küçük bir hatırlatma çıkar; bildirimde cevapların değil, sabit bir metin görünür. İstediğin an kapatabilirsin. |
| İzin sonrası (OS reddetti, yeni) | (yok) | Sorun değil. İstersen Ayarlar'dan sonra açabilirsin. |
| Yaş notu (yeni, 15 §5.1 önerisi) | (yok) | Onboarding gövdesine tek satır: "Haftik 18 yaş ve üzeri için hazırlandı." (bölüm 5.4'te mağaza beyanıyla eşleşir) |
| Düğmeler | Başla · Anladım, devam · İzin ver · Şimdi değil | Değişmez (suçlamasız) |

**ÖRNEK kart içeriği** (uydurma; gerçek havuzda yok; "ÖRNEK" damgası zorunlu, kartın hiçbir yeri gerçek veriden beslenmez; zamansız — bölüm 4.1 kuralına tabi):

| Alan | Metin | Not |
|---|---|---|
| Bant/damga | ÖRNEK | Gerçek kartın "HAFTANIN UNVANI" bandının yerine (4.1) |
| Unvan | Ara Sıra Maraton | Havuzda yok |
| Hareket | Adım sayar kendini maraton sandı. | Yoğun hücre üslubu, zamansız |
| Uyku, Harcama | Gizli çıkartma | Gizleme kavramı ilk 10 saniyede öğretilir |
| Sosyal | Telefonun rehberi hafifçe ısındı. | Zamansız |
| Özet | Geçen haftadan biraz daha hızlı geçti. | Kıyas cümlesi de gösterilir, "bu hafta" yok |
| Dipnot (6.1 kabul edilirse) | Bu kart yalnızca örnektir. | |

Denetim: örnekteki hiçbir metin gerçek kural motoruna bağlı değildir; hareket satırı "yoğun" hücrede, sosyal satırı "orta" hücrede yazılmış gibi okunur ama seviye kelimesi gösterilmez; kullanıcı örneği kendi kartı sanmasın diye üç önlem: damga, "Bu bir örnek" alt yazısı, gerçek havuzda bulunmayan unvan (V4 bitti-kanıtı).

### 3.4 Hafta ekranı durumları

Mevcut fonksiyonlar: `weekStatusHeadline` (ilerleme) + `lockedBoxCaption` (zaman/eylem), `src/lib/week-status-copy.ts` (okundu, K1). Ayrım korunur: başlık = durum, alt yazı = zaman ya da eylem. Rakam serbest (bu ekran kart PNG'si değil, 3.2 ile aynı istisna).

| Durum | Başlık | Alt yazı |
|---|---|---|
| Eşik altı (kalan `{r}`) | Kart için {r} gün daha. (şu an: "Kartın için X gün daha lazım.") | Pazar 20:00'de açılıyor |
| Eşik altı, kalan 1 | Kart için bir gün daha. | Pazar 20:00'de açılıyor |
| Eşik doldu, zaman gelmedi | Yeterli gün doldu. (şu an: "Kartın hazırlanıyor." yanıltıcı, 02 §4.2) | Kart Pazar 20:00'de açılıyor |
| Hazır, açılmamış | Kartın hazır! | Açmak için dokun |
| Pazar, bugün işaretlenmedi (K3) | Kartın hazır, bir adım kaldı. | Önce bugünü işaretle, sonra kart açılır. (şu an: "Bugünü işaretlemeden kartın açılmaz") |
| Kart açıldı | Kartın albümde. (şu an: "Kartın açıldı.") | Tekrar görmek için dokun |
| Geçen haftanın açılmamış kartı (13 T2, 18 §2.6) | Geçen haftanın kartı seni bekliyor. | Açmak için dokun |
| Hafta bitti, eşik yok | Bu hafta kart çıkmadı. | Yeni sayfa Pazartesi açılıyor. |
| Yeni hafta, gün yok | Yeni sayfa açık. | Kart için {r} gün daha. |

"Hafta bitti, eşik yok" metni **suçlamaz**: nedeni (az gün) söylemez, "çıkmadı" der; "kaçırdın" dili yok.
Pazar ara ekranı (`sunday-checkin-required-view.tsx:35,37`): başlık kalsın ("Kartını açmadan önce bugünü de ekleyelim."); gövde "Bugünün verisi olmadan hafta eksik sayılır." (tehdit tonu, "veri" jargonu) yerine **A:** "Pazar da haftanın parçası; kart bugünle tamamlanır." / **B:** "Sayfanın son köşesi boş; bugünü ekleyince kart açılır." (albüm sesi). Düğmeler: "Bugünü işaretle" / "Geri" kalsın.

### 3.5 Albüm (eski adıyla "Karnelerim") boş ve dolu durumlar

Ekran adı önerisi: **Albüm** (seçenekler: Kartlarım, Koleksiyon; bölüm 7 Q5). Albümde **boş sayfa gösterilmez** (kaçırılan hafta için "boş kart" yok; utandırma riski, 13 V6 kapsam dışı).

| Durum | Başlık | Alt yazı |
|---|---|---|
| Boş, kart henüz yok | Albümün henüz boş. | İlk kartın Pazar akşamı buraya yapışacak. |
| Boş, ilk kart hazır ama açılmadı | İlk kartın hazır. | Açınca albümde yerini alır. |
| Dolu (n kart) | Albüm | Albümde {n} kart var. (n=1: "Albümde bir kart var.") |
| Açılmayı bekleyen hafta (liste öğesi) | Açılmayı bekliyor | Açmak için dokun |
| Liste öğesi tarihi (uygulama içi) | Geçen hafta · İki hafta önce · 22-28 Eylül (eskilerde aralık) | Kartta tarih yok kuralı yalnız PNG için |
| Tekrar paylaş | Tekrar paylaş | Aynı önizleme ve varsayılan gizleme |
| Yükleme hatası | Albüm açılamadı. | Bir kez daha dener misin? |

Kırılmaz birikim (yalnız o kart açıldığı an, tek satır; sıfırlanma/kayıp dili yok): 1: "Albümün ilk sayfası hazır." · 4: "Dört kart. Albüm şekilleniyor." · 10: "On kart. Albüm artık kalın." · 26: "Yirmi altı kart. Yarım yıllık albüm." · 52: "Elli iki kart. Bir yıllık albüm." Bu kilometre taşları rozet/kutlama ekranı değil, satır; etik kontrolü engagement-designer'da (20). Bu satırlar uygulama-içi listede görünür, kartın kendisinde (PNG) DEĞİL; 4.1 kuralına tabi değil.

### 3.6 "Gizli çıkartma" durum metni

Kartın PNG'sinde **sabit metin** (veriden türemez, gizli içerik render ağacında yok). Prototipte C: unvan yerinde "Gizli çıkartma" + kilit; satırlarda "GİZLİ" rozeti.

| Yer | Metin | Not |
|---|---|---|
| Unvan çıkartması başlığı | Gizli çıkartma | Prototipte var |
| Unvan alt yazısı (yeni) | **bilerek saklandı** (A) · henüz yapıştırılmadı (B) · sahibi saklamayı seçti (C) | A önerilir: hata değil seçim; kartı izleyene "bug mı?" sorusunu kapatır. B albüm sesine yakın ama "eksik" gibi okunabilir |
| Gizli satır rozeti | GİZLİ | Prototipte var; kategori etiketi (UYKU) ile birlikte kalır (satır konumu zaten kategoriyi belli eder; ek sızıntı yok) |
| Önizleme açıklaması (uygulama içi) | Uyku ve harcama başta gizli gelir. Göz simgesiyle aç ya da kapat; gizlediğin satır kartta "gizli çıkartma" olur. | 02 §4.5 boşluğunu kapatır |
| Önizleme: unvan gizlenince (uygulama içi) | Unvan, gizli bir satırdan türediği için o da gizlendi. | Yalnız önizlemede (özel ekran); PNG'de bu cümle yok |
| Erişilebilirlik | "Uyku: gizli" | Kart okuyucu etiketinde de aynı |

### 3.7 Erişilebilirlik etiketleri ve 11'deki metin bulguları

| Bulgu / yer | Etiket / metin |
|---|---|
| A11Y-03 hatırlatma anahtarı | `accessibilityLabel`: "Günlük hatırlatma" (rol switch; durumu sistem okur) |
| A11Y-07 Kaydet sonrası duyuru | 3.2'deki gösterilen cümle aynen (`announceForAccessibility`) |
| A11Y-09 sekme | Etiketler: Bugün · Hafta · Albüm · Ayarlar; emoji simge ekran okuyucudan gizli |
| **A11Y-10** izin kapalı (`canAskAgain` doğru) | "Bildirim izni kapalı. Anahtarı açınca izin isteriz." (11'in önerdiği metin, kod: `settings-view.tsx`) |
| **A11Y-10** kalıcı ret (`canAskAgain` yanlış) | "Bildirimler sistem ayarlarından kapalı. Açmak için sistem ayarlarına git." + düğme "Sistem ayarlarını aç" (uygulamanın "Ayarlar" sekmesiyle karışmasın) |
| A11Y-12 kilitli kutu | Tek etiket: "{başlık} {alt yazı}" (ör. "Kart için 2 gün daha. Pazar 20:00'de açılıyor."); alt yazı ayrıca okunmaz; hazırken rol düğme: "Haftanın kartı hazır" |
| A11Y-13 kart | Kök etiket: "Haftanın kartı. Unvan: {unvan}. Hareket, durgun: {satır}. Uyku: gizli. Harcama: gizli. Sosyal, kalabalık: {satır}. Özet: {özet}." Emoji düğümü gizli |
| **A11Y-15** sistem Alert | Tek düğmede "Tamam" (OK değil); Geri tuşu ile kapanır (`cancelable:true`). Silme onayı 3.8 |
| Önizleme göz düğmesi | "Uyku satırı kartta görünsün" (switch, `checked` = görünür) yerine "göster/gizle" çifti; durum sesli okunur |
| Kaydet (pasif) | Etiket: "Kaydet, 3 kategori kaldı" |
| Reveal düğmeleri | "Animasyonu atla" kalsın · "Kapat" -> "Kartı kapat" · "Paylaş" + ipucu "Paylaşmadan önce satırları gizleyebilirsin" |

### 3.8 İzin, silme, hata metinleri

| Yer | Şu an | Öneri |
|---|---|---|
| Silme Alert başlık/gövde (`settings.tsx:88`) | Tüm verilerimi sil / Bu işlem geri alınamaz. Emin misin? | **Tüm verilerimi sil** / Günlük işaretlerin ve albümündeki tüm kartlar bu telefondan silinir. Geri alınamaz. |
| Silme düğmeleri | Vazgeç · Sil | Vazgeç · Hepsini sil |
| Silme sonrası (onboarding'e dönüşte tek satır) | (yok) | Veriler silindi. |
| Silme hatası | (yok) | Silme tamamlanamadı. Bir kez daha dener misin? |
| Gizlilik satırı (`settings-view.tsx:168`; `settings.tsx:112`) | "Gizlilik politikası (yakında)" + "yayına yakın eklenecek" | Politika URL'si yayına girene kadar satırı **gizle**; girince "Gizlilik politikası" (bağlantı açılamazsa: "Bağlantı açılamadı. İnternet bağlantını kontrol edip bir kez daha dener misin?") |
| Paylaşım hatası (`card-preview-view.tsx:91`) | Paylaşım başarısız oldu, tekrar dene. | Paylaşım açılamadı. Bir kez daha dener misin? |
| Kart/yükleme hatası (yeni) | (dönen spinner) | Kart açılamadı. Bir kez daha dener misin? · Yüklenemedi. Bir kez daha dener misin? + "Tekrar dene" |
| Rapor onayı | uzun, hukuki | Rapor yalnızca sayaçlar ve gün sayısı içerir; emoji, kart metni, tarih ya da kimlik yok. Kime göndereceğini sen seçersin. ("anonim" kelimesi yok, MOB/S9 I-3) |

## 4. İçerik derinliği

### 4.1 Zamansızlaştırma kararı (18-ux-akislar-v2.md §2.7 bulgusu — öncelik 1)

**Bulgu (K1, `18-ux-akislar-v2.md` özet madde 12 + §2.7):** kart satırları ve özet "bu hafta..." diyor (02 §2.7 envanteri: 29 geçiş — satır 25/36, özet 4/12). Kart artık yalnız "o an" açılmıyor: **Albüm** (3.5) haftalarca sonra tekrar açılabilir, **geçen haftanın kartı** (3.4, 18 §2.6) Pazartesi/Salı açılabilir, **tekrar paylaş** aylar sonra olabilir. Bu durumların hiçbirinde "bu hafta" doğru değildir — kart Ekim'de açılsa da içindeki "bu hafta" ifadesi okuyucuya (kartı paylaşılan yerde gören üçüncü kişiye) hangi haftadan bahsettiğini yanlış söyler ("bu hafta" = şu an, okuma anı; oysa kart *geçmiş* bir haftayı anlatır).

**Karar: kart içeriğinde (unvan, satır, özet, bant/damga) zaman zarfı YOK.** Çözüm yöntemi "geçen hafta"ya çevirmek değil (çünkü taze açılan kart için de "geçen hafta" yanlış olur — kart o haftanın *kendisidir*, ondan önceki hafta değil), **tamamen çıkarmaktır.** Türkçenin geçmiş zaman çekimi (-mış/-dı) zaten anlatıyı zamandan bağımsız, "her zaman doğru" bir gözlem cümlesine çeviriyor:

| Şu an ("bu hafta" ile) | Zamansız (öneri) | Neden çalışıyor |
|---|---|---|
| "Bacakların **bu hafta** izne çıkmış resmen." | "Bacakların izne çıkmış resmen." | "-mış" zaten "geçmişte olan bir şey"i anlatıyor; taze kartta da 3 ay sonra açılan kartta da doğru |
| "Cüzdanın **bu hafta** minik bir tatil yaptı." | "Cüzdanın minik bir tatil yaptı." | Aynı |
| "Bu hafta çoğu kategori geçen haftadan güçlüydü." | "Geçen haftaya göre çoğu şey hız kazandı." | "Geçen haftaya göre" kartın **kendi içindeki** iki hafta arasındaki kıyası anlatır (okuma anına göre değil); bu ifade her zaman doğru kalır |
| Bant "BU HAFTANIN UNVANI" | Bant "**HAFTANIN UNVANI**" | "Bu" kelimesi okuma anını işaret ediyordu; "haftanın" tek başına kartın kendi haftasını işaret eder |

**Kabul edilenler (yanlış değil, dokunulmaz):** "geçen haftaya göre" ifadesi kartın İÇ kıyasını anlatır (bu haftanın verisi vs. bir önceki haftanın verisi), okuma anına göre değil — bu yüzden özet metinlerindeki "geçen haftaya göre" **kalır**, yalnızca cümlenin başındaki/sonundaki "bu hafta" düşer (bkz. tablo). "Bir hafta" gibi belirsiz nicelik ifadeleri (örn. "Bir aradan sonra") de zamana göre değişmez, sorun değil.

**Uygulama kapsamı ve bedeli:**
- `src/domain/content/tr.ts`: 25 satır + 4 özet metninden "bu hafta" çıkarılır (kelimeyi silmek çoğu cümlede yeterli, birkaçında cümle yeniden kurulur — 4.4'te örnekler).
- Bant/damga metni (`14-gorsel-prototipler/kart-c-cikartma-albumu.html` ve gerçek `CardView` uygulaması) "HAFTA KARNESİ"/"BU HAFTANIN UNVANI" yerine **"HAFTANIN UNVANI"**.
- `CONTENT_VERSION` artırılır (1 -> 2); **dondurulmuş eski kartlar eski metinle kalır** (spec kuralı zaten böyle, 18 §2.7 kabul notuyla aynı).
- Test etkisi: mevcut `<=60`/rakamsız testleri bozulmaz; yeni "zaman zarfı arama" testi eklenmeli (1.6-f).
- Bu kural yalnız **kart (PNG) içeriğine** uygulanır; 3.2 (Kaydet anı), 3.4 (Hafta ekranı), 3.5 (Albüm listesi) gibi geçici/uygulama-içi arayüz metinleri "bugün", "{r} gün" gibi o anki duruma gönderme yapmaya **devam eder** (onlar dondurulmaz, her zaman güncel gösterilir).

### 4.2 Yasak sözcük listesi (nihai, birleşik — 25-gizlilik-v2.md §5.3 + 02-icerik-metin-denetimi.md §1.4)

Kart havuzunda (unvan/satır/özet) ve mağaza/site metninde **hiçbir yerde** geçmemeli. Test edilebilir olması için gövde (kök) yazıldı; ekler dahildir.

**A. Tıbbi/klinik dil (25-gizlilik-v2 §5.3, sağlık iddiası riski):** teşhis, tanı, tedavi, tavsiye (kullanıcıya doğrudan), hasta, depresyon, stres, anksiyete, kaygı bozukluğu, kilo, kalori, diyet, doktor, "yapmalısın"/"yapman gerek", uykusuz(luk), yorgun(luk) (durum iddiası olarak), zinde, dinlenmiş, tükenmiş.
**B. Yargı/damga (02 §1.4):** kahraman, yıldız, şampiyon, usta (rütbe olarak aşırı kullanım, kota 4), cömert, cimri, tutumlu, çekingen, içine dönük, yalnız (kişilik etiketi olarak — seviye kelimesi "sakin/tenha" ile karışmaz), tembel, kısıtlı, "tam kararında/tam kıvamında", akıllıca, kusursuz, "orta karar", performans, doz (tıbbi ödünç kelime).
**C. Boş övgü/çocuksu (1.1, C yönü riski):** güzel, harika, süper, bravo, mükemmel, yaşasın (tek başına ünlem olarak).
**D. Sesteş/istenmeyen çağrışım (02 §2.2, TDK kontrolü):** kumbaracı (eski "bombacı asker" anlamı), "kart" banka kartı bağlamında (2.4).
**E. Jargon/yabancı (kullanıcıya dönük metinde):** check-in, anonim, veri (kullanıcı bağlamında; "işaretlerin/kayıtların" kullan), performans, mod (kota 1).

**Test tasarımı önerisi (mobile-engineer + test-automation-engineer):** her kelime kökü için basit `includes`/regex taraması, `TITLE_TEXTS` + `LINE_VARIANTS` + `SUMMARY_VARIANTS` + `NOTIFICATION_TEXTS` + mağaza metni sabitleri üzerinde çalışır; "usta/yıldız/şampiyon/kahraman" gibi kota'lı (tamamen yasak değil, sayı sınırlı) kelimeler ayrı bir sayaç testiyle (1.4 kota tablosu) izlenir.

### 4.3 Havuz genişletme planı: ≥8 hafta tekrarsızlık hedefi

**Mevcut mekanizma (K1, `copy.ts`/`titles.ts`):** yalnızca **ardışık** haftada aynı varyant tekrarlanmaz (`prevVariants`, bkz. CLAUDE.md MOB/S3 notu). Havuz 3 varyantken bu, 3. haftada 1. haftanın metnini tekrar gösterebilir — kısa bir döngüde "hep aynı üç cümle" hissi verir (02 §2.7, L-3).

**Hedef:** her (kategori, seviye) hücresi ve her özet kovası en az **8 varyant** taşısın; bu, "son 7 haftada görülmeyen bir varyant seç" kuralıyla (basit bir genişletme, `prevVariants`'ın "son 1" yerine "son 7" tutması) sekiz haftalık bir pencerede hiç tekrar olmamasını **garantiler** (havuz boyutu = pencere boyutu). Unvan (tekil kombinasyon kuralları) için hedef daha düşük (≥3 varyant, çünkü bazı kombinasyonlar haftada bir değil ayda bir çıkabilir — 8 haftalık tekrarsızlık zorunlu değil, ama tekilliğin (02 L-3) giderilmesi zorunlu).

| Havuz | Şu an | 8 hafta hedefi | Gerekli yeni | Öncelik |
|---|---|---|---|---|
| Satırlar (hareket x3 seviye) | 9 (3/hücre) | 24 (8/hücre) | +15 | 2 |
| Satırlar (sosyal x3 seviye) | 9 | 24 | +15 | 2 |
| Satırlar (uyku x3, harcama x3) | 18 | 48 | +30 | 3 (paylaşımda görünmez, bkz. 02 §2.4, ama en zengin espri kaynağı) |
| Özet (canlı kovalar, 4.4'te 2 yeni kova ile birlikte) | 10 canlı + 2 ölü | 8 kova x 8 = 64 | +52 (kademeli, bkz. not) | 1 (her zaman görünür, kartın kalıcı içeriği) |
| Unvan (12 temel + 28 combo, tekil) | 40, tekil | her biri >= 3 | +80 (kademeli) | 4 (en düşük acil — paylaşımda çoğu zaten gizli, 02 §2.4) |
| **Toplam hedef yeni metin** | | | ~192 (kademeli, tek seferde değil) | |

**Gerçekçilik notu:** ~192 yeni metin tek turda yazılabilecek hacim değil (bu belge 4.4'te ~40 örnek verir, "ilk taslak"). Öneri: **kademeli genişletme** — önce en sık görülen ve en zayıf olan hücreler (orta seviye, 02 §2.3 "orta seviye 12 satırın yalnızca 3'ü tam iyi"), sonra paylaşımda görünen (hareket, sosyal), en son uyku/harcama (gizli olsa da reveal ekranında görülür) ve unvan varyantları. Her tur ayrı bir içerik PR'ı olabilir; `CONTENT_VERSION` her turda artmaz (yalnızca yapı/tip değişince, ör. yeni kova eklenince artması gerekir — varyant eklemek geriye dönük uyumludur, mevcut testler `>= 3`/`>= 2` diyor, `>= 8` yeni hedef testle sabitlenmeli).

### 4.4 En az 40 yeni örnek metin (zamansız, yasak sözcüksüz)

Aşağıdaki metinler **taslaktır**; 1.4'teki kota tablosuyla nihai ekleme sırasında çapraz kontrol edilmeli (bazı imgeler burada ilk kez kullanıldı — merdiven, battaniye, sepet, kasa — bazıları mevcut pool ile örtüşebilir; kesin sayım implementation sırasında yapılır, K1 kaynak taraması bu turda yapılmadı). Hepsi zamansız (4.1), <=46 karakter hedefi (unvan <=28), rakamsız, 4.2 yasak listesine göre kontrol edildi (elle, ikinci okuma yapılmadı — Batuhan/mühendis son gözle geçsin).

**Yeni unvan varyantları (10, mevcut temel/combo unvanlara 2. seçenek):**

| Kural | 2. varyant | Say. |
|---|---|---|
| basic.movement.low | Merdivenler Sana Küsmüş | 24 |
| basic.movement.high | Durağı Tanımaz Oldun | 20 |
| basic.sleep.low | Gece Vardiyası Sensin | 21 |
| basic.sleep.high | Battaniyenin Can Dostu | 22 |
| basic.spending.low | Cüzdanın Uzun İzni | 18 |
| basic.spending.high | Kasa Işıkları Sende Yanar | 25 |
| basic.social.low | Rehberin Tozlu Kaldı | 20 |
| basic.social.high | Takvimin Nefes Alamadı | 22 |
| combo.allFourHigh | Haftanın Her Köşesi Dolu | 24 |
| combo.bigLeapUp | Tempo Bir Basamak Çıktı | 23 |

**Yeni satır varyantları (20, zamansız, kategori x seviye dağılımlı — hareket ve sosyal öncelikli çünkü paylaşımda görünen bunlar, 02 §2.4):**

| Kategori.Seviye | Yeni varyantlar |
|---|---|
| movement.low | "Merdivenler rafa kalkmış gibiydi." · "Spor çantası kapıda beklemede kaldı." |
| movement.medium | "Adımların ne koşar ne durur, ortada gezindi." · "Bacaklar bir tempo tuttu, ne hızlı ne yavaş." |
| movement.high | "Ayakkabıların soluklanmaya vakit bulamadı." · "Adımların bir maraton provası gibiydi." |
| sleep.low | "Gece yarıları seni hep ayakta yakaladı." · "Battaniyenin altı sana hep geç açıldı." |
| sleep.medium | "Uykun ne erken bitti ne geç kalktı." · "Gece düzenin ortada bir yerde kaldı." |
| sleep.high | "Gece erken kapandı, sabah geç açıldı." · "Uyku hesabına hep para yatmış." |
| spending.low | "Cüzdan cebe sıkı sıkı yapışmış." · "Kasa fişleri seyrek uğradı." |
| spending.medium | "Harcamalar ne fazla taştı ne hiç akmadı." · "Alışveriş sepeti orta hızda dolup boşaldı." |
| spending.high | "Fişler art arda dizilmiş gibiydi." · "Kasa ışıkları senin için sık sık yandı." |
| social.low | "Telefon rehberin tozlanmaya başlamış." · "Sosyal takvim boş sayfalar göstermiş." |
| social.medium | "Sosyal hayatın ne kalabalık ne tenha, ortada kalmış." · "Çevrenle bağların ne sıkı ne gevşek kalmış." |
| social.high | "Takvimin baştan sona doluydu." · "Mesaj kutun hiç sessiz kalmadı." |

**Yeni özet kovaları (10, iki yeni kovayla birlikte — 4.6.3'te tip/koşul ayrıntısı):**

| Kova (yeni) | Varyantlar |
|---|---|
| streakFull (7/7 gün dolu, seviyeden bağımsız) | "Hafta boyunca tek bir gün bile boş kalmadı." · "Sayfanın her köşesi dolu, boşluk yok." |
| returning (önceki kart var, aradan >= 2 hafta geçmiş) | "Bir aradan sonra sayfa yeniden açıldı." · "Kaldığın yerden devam, kıyas yeniden başlıyor." |
| risingSlight (yalnız 1 kategori yükseldi) | "Bir şey hafiften hız kazandı, gerisi yerinde kaldı." · "Küçük bir ivme yakalanmış, çoğu şey aynı kalmış." |
| risingBig (>=3 kategori yükseldi) | "Vites birkaç kademe birden yükseldi." · "Çoğu şey aynı anda hızlanmış." |
| fallingSlight / fallingBig (aynı desen, düşen yönde) | "Bir şey hafiften yavaşlamış, gerisi yerinde kalmış." · "Vites birkaç kademe birden düşmüş." |

**Kota bakiyesi (bu 40 metin sonrası, tahmini):** "vites" 2/2 (kota dolu — 5.1'deki "Bir Vites Yukarı/Aşağı" önerisiyle çakışır, **ikisi birlikte kullanılamaz**, Batuhan'a soru bölüm 7 Q3); "cüzdan" +1 (mevcut 5 ile toplam kontrolü implementation'da); "yastık" hiç kullanılmadı (mevcut 4 kota dolu, bilerek "battaniye" ile çeşitlendirildi); "telefon rehberi" +2 (3.3 örnek kartla birlikte 3 olabilir, kota 2 — implementation'da biri düşürülmeli); "resmen" hiç kullanılmadı (mevcut 3, kota 1 — engineer mevcut 2'yi kaldırmalı, yeni eklemedim).

### 4.5 İçerik lint testi genişletmesi (1.6'nın somutlaştırılmışı)

| # | Kontrol | Kapsam | Efor |
|---|---|---|---|
| L1 | Yasak sözcük taraması (4.2) | Tüm statik havuzlar + mağaza sabiti | S |
| L2 | Kota sayacı (1.4) | Tüm statik havuzlar, eşik aşımında test kırılır | S |
| L3 | "karne" araması | `src/`, `docs/ux/`, `site/` (CI'da opsiyonel, tek seferlik temizlik sonrası kaldırılabilir) | XS |
| L4 | Kategori sızıntısı | Unvan/özet metni kendi `basedOnCategories` dışı bir kategorinin imge sözlüğünden sözcük içermez | M |
| L5 | Özette seviye sözcüğü yok | `SUMMARY_VARIANTS` içinde 3.1'deki seviye kelimeleri (yoğun/hafif/kısa/uzun/sakin/kalabalık vb.) 0 geçiş | S |
| L6 | Zaman zarfı taraması (4.1) | `TITLE_TEXTS` + `LINE_VARIANTS` + `SUMMARY_VARIANTS`'ta "bu hafta", "geçen hafta" (yalnız kartın kendi iç kıyası dışında), "bu sefer", "şu an" 0 geçiş — "geçen haftaya göre" kalıbı istisna (4.1) | S |
| L7 (yeni) | 8 hafta tekrarsızlık | Her hücre/kova varyant sayısı >= hedef (4.3); pencere simülasyonu (52 hafta zincirinde 8 haftalık kayan pencerede tekrar yok) | M |

Sahibi mobile-engineer + test-automation-engineer (test dosyasına ben dokunmadım); toplam efor ~1-1,5 gün (L4/L7 en pahalı).

## 5. Bildirim metni seti ve mağaza metni v2

### 5.1 Bildirim (sabit, veri içermez — spec güvenlik gereksinimi 4)

Mevcut (`src/domain/content/notification-texts.ts`, K1): iki sabit metin, hiç varyant yok — her gün aynı cümle "alışma" riski taşır (02 §4.6).

| Tür | Şu an | Öneri (v2) |
|---|---|---|
| `daily` başlık/gövde | "Bugün nasıldı?" / "Birkaç saniyede bugünü işaretleyebilirsin." | Havuz (aşağıda), gün-of-hafta tohumlu deterministik dönüş (veri sızdırmaz, saat/tarihe göre değil haftanın gününe göre sabit) |
| `card-ready` başlık/gövde | "Karnen hazır" / "Bu haftanın kartı seni bekliyor." | "Haftanın kartı hazır" / "Bugünü de işaretlediysen kart seni bekliyor." (K3 çelişkisini önceden söyler, 02 §4.3 "bildirim çelişkisi" notu) |

**`daily` havuzu (4 varyant, deterministik — hangi gün hangisi göründüğü sabit kalsın, "sürpriz" olmasın, alışkanlık tasarımı engagement-designer'ın alanı ama metin burada):**

| Varyant | Başlık | Gövde |
|---|---|---|
| 1 | Bugün nasıldı? | Birkaç saniyede bugünü işaretleyebilirsin. |
| 2 | Bugün hangi vitesteydin? | Dört emoji, birkaç saniye. |
| 3 | Sayfa seni bekliyor. | Bugünü işaretlemek birkaç saniye sürer. |
| 4 | Günün emoji özeti zamanı. | Dört soru, tek Kaydet. |

**Yeni tür önerisi (18 §2.6/M19, opsiyonel — Batuhan kararı, bölüm 7 Q7): `missed-card`** — geçen haftanın kartı hâlâ açılmamışsa Pazartesi öğlen tek seferlik bildirim (spec S8 "telafi yok" kuralını değiştirir, ayrı intent gerekir, bölüm 6 F-C4). Metin: başlık "Geçen haftanın kartı bekliyor." gövde "İstediğin an açabilirsin." Veri yok, sıklık artmaz (F4 kuralı).

Kanal adı "Hatırlatmalar": iyi, değişmesin.

### 5.2 Mağaza metni v2 (docs/s12-magaza-icerigi.md üzerine)

Değişiklik gerekçeleri: (1) "karne" -> "kart" (bölüm 2), (2) "check-in" -> "işaretle", (3) "8 saniye" ölçülmedi (S6 kronometre yok, CLAUDE.md), (4) "iki satır varsayılan gizli" iddiası unvanın da çoğu zaman gizlendiğini (02 §2.4, ~%80) söylemiyor — S-6 bulgusu düzeltilmeli.

| Alan | v1 (S12) | v2 öneri | Say. |
|---|---|---|---|
| Play uygulama adı | Haftik: Haftalık Emoji Kartı | Değişmez (zaten "kart") | 28 |
| Play kısa açıklama | Günde 8 sn emoji işaretle, Pazar 20:00'de paylaşılabilir haftalık kartını aç. | **Günde birkaç saniye emoji işaretle, Pazar 20:00'de haftalık kartını aç.** (ölçülmemiş "8 sn" iddiası düşer) | 65 |
| Play güncelleme notu | İlk sürüm: günlük emoji check-in... | İlk sürüm: günlük emoji işaretleme, Pazar 20:00'de açılan haftalık kart, paylaşmadan önce satır gizleme ve isteğe bağlı günlük hatırlatma. | ~130 |
| App Store adı | Haftik: Emoji Check-in | **Haftik: Haftalık Emoji Kartı** (Play ile tutarlı, "check-in" düşer) | 28 |
| App Store alt başlık | Pazar akşamı haftalık kartın | Değişmez | 28 |
| App Store tanıtım metni | Günde 8 saniye emoji işaretle... | Günde birkaç saniye emoji işaretle, her Pazar 20:00'de haftana ait esprili bir kart aç ve istersen paylaş. Hesap yok, veri telefonunda. | 128 |
| App Store anahtar kelime | ...karne,emojiler,mizah | ...**kart**,emojiler,mizah ("karne" çıkar, "kart" zaten "hafta" ile birlikte örtük; alan boşsa "albüm" eklenebilir) | ~95 |

**Tam açıklama (Play/App Store, v2 — "karne"/"check-in" temizliği + S-6 düzeltmesi + gizli unvan dürüstlüğü):**

```
Günde birkaç saniye, haftada bir kart.
Dört emoji seç; Pazar akşamı Haftik haftana bir unvan ve dört esprili cümle yazsın.

NASIL ÇALIŞIR
1. Her gün dört küçük soruya emojiyle cevap ver: tempon, dinlenmen, harcaman, sosyalliğin. Tek ekran, tek Kaydet.
2. Haftada en az 4 gün işaretlersen (ilk kartta 3 gün yeter) Pazar 20:00'de kartın açılır.
3. Kart 9:16 bir görsel: bir unvan, dört esprili satır ve geçen haftayla küçük bir kıyas.
4. İstersen paylaş. Paylaşmadan önce her satırı tek dokunuşla gizleyebilirsin; gizlediğin satır (ve bazen unvan) kartta "gizli çıkartma" olur. İki satır varsayılan olarak gizli başlar.

VERİN TELEFONUNDA KALIR
Hesap yok, üyelik yok, reklam yok. Verilerin yalnızca bu telefonda tutulur; telefon değiştirirsen taşınmaz.
Ayarlardan tek dokunuşla tüm verilerini silebilirsin. Bildirimlerde cevapların değil, yalnızca sabit bir hatırlatma metni görünür.

TAVSİYE YOK, YARGI YOK
Haftik eğlence amaçlı, kısa bir haftalık özet sunar. Tavsiye vermez, yargılamaz, tıbbi bir değerlendirme yapmaz. 18 yaş ve üzeri için hazırlandı.

KISACA
- Günlük emoji işaretleme (birkaç saniye)
- Pazar 20:00'de açılan haftalık kart
- Satır satır gizle/göster, paylaşmadan önce önizleme
- İsteğe bağlı günlük hatırlatma (varsayılan 21:00, ayarlanabilir)
- Hesap yok, reklam yok, veri telefonunda
- Türkçe

Öneri ve sorular için: [iletişim e-postası]
```

Bu metin, S12'nin R-1 (INTERNET/ağ beyanı) ve R-3 (gizlilik URL'si) kapılarına hâlâ bağlıdır — değişmedi, yalnızca kelime dağarcığı ve S-6/S-8 düzeltmeleri uygulandı. "Kayıt yok" ifadesi de S12 S-2 bulgusuna göre "üyelik yok" olarak netleştirildi.

## 6. Yeni özellik önerileri (taslak intent'li)

Kural (16-ortak-brif): her öneri 3-5 cümlelik taslak intent; dosya oluşturulmaz, Batuhan karar verir.

**F-C1. Kategori-nötr unvan genişlemesi.** Paylaşılan kartların ~%80'inde unvan "???" oluyor (02 §2.4, P-1) çünkü mevcut 40 unvanın çoğu uyku/harcama kategorisini adlandırıyor. Öneri: her unvana bir `revealsCategory: boolean` işareti eklenir; yalnızca kategori adlandıranlar gizlenir, kategori-nötr olanlar ("Tam Gaz Hafta", "Haftanın Her Köşesi Dolu") her zaman görünür kalır. Etki: paylaşılan kartlarda görünür unvan oranı tahmini ~%50'ye çıkar (02'nin el simülasyonu). Efor: içerik (mevcut unvanların ~yarısını kategori-nötr yeniden yazma) + veri modeli (`TITLE_TEXTS` işaretleme) + güvenlik incelemesi (nötr unvanın seviye ima edip etmediği). Devir: software-architect + security-reviewer (02 §2.4 seçenek A ile aynı, burada intent olarak formalize edildi).

**F-C2. Bildirim çeşitlendirme havuzu.** Günlük hatırlatma bugün tek sabit cümle (`notification-texts.ts`); 02 §4.6 ve bu belgenin 5.1'i 4 varyantlık bir havuz öneriyor, haftanın gününe göre deterministik dönen (veri sızdırmaz, rastgele değil). Amaç: yedi gün sonra sönümlenme (CLAUDE.md 03 Ö4-Ö5 gözlemi) hissini azaltmak, alışma riskini düşürmek. Efor: küçük (4 metin + `getDay()`-tabanlı seçim fonksiyonu, ~yarım gün). Devir: mobile-engineer (metin bu belgede hazır) + engagement-designer (alışkanlık etkisi onayı).

**F-C3. Yerelleştirme hazırlığı: kelime oyunu envanteri.** Ürün şu an tek dilli (Türkçe) ama gelecekte ikinci dil (İngilizce) gündeme gelirse, mevcut mizah mekaniklerinin büyük kısmı (deyim bozma: "orta şekerli"; sesteş: "kart"/banka kartı; kültürel referans: Türk kahvesi) doğrudan çevrilemez. Öneri: içerik havuzuna her metne bir `translatable: 'direct' | 'needs-rewrite' | 'culture-locked'` etiketi eklensin (yalnızca dokümantasyon, kod davranışını değiştirmez), böylece ileride yerelleştirme kararı verildiğinde hangi metinlerin yeniden yazılması gerektiği önceden bilinir. Efor: düşük (etiketleme, ~1 gün, kod değişikliği yok — yalnızca içerik meta verisi). Devir: mobile-engineer (veri yapısı) — Batuhan bu işin şu an gerekli olup olmadığına karar verir (16 "kapsam genişletme sessizce eklenmez" kuralı gereği ayrı intent).

**F-C4. "Geçen haftanın kartı bekliyor" tek seferlik bildirimi.** 18 §2.6/M19'da işaretlenen kapsam boşluğu (kaçırılan/açılmamış kart sessizce kalıyor); 5.1'de metin taslağı var. Spec'in "telafi yok" kuralını (S8) değiştirdiği için ayrı intent gerekir; kapsam: yalnızca Pazartesi öğlen tek bildirim, veri taşımaz, kart açılınca iptal edilir, tekrar ertelenmez. Efor: küçük-orta (zamanlama mantığı + 1 metin). Devir: mobile-platform-specialist + mobile-engineer (bildirim planlama mantığı) + copywriter (metin hazır).

## 7. Batuhan'a sorular (seçenekli)

1. **"Kart" adlandırması kesin mi?** Bölüm 2'deki tüm değişiklikleri onaylıyor musun, yoksa "karne" bilinçli bir göz kırpma olarak bazı yerlerde (ör. mağaza anahtar kelimesi) kalsın mı?
2. **Seviye kelimeleri:** Uyku için (A) kısa/orta/uzun mu (B) az/orta/bol mu? Sosyal için (A) sakin/orta/kalabalık mı (B) tenha/orta/kalabalık mı? (3.1)
3. **"Vites" imgesi çakışması:** 5.1'deki unvan önerisi ("Bir Vites Yukarı/Aşağı") ile 4.4'teki yeni özet metinleri ("Vites birkaç kademe birden yükseldi/düştü") aynı imgeyi kullanıyor, kota (1.4) ikisine birden izin vermiyor. Hangisi kalsın?
4. **"Gizli çıkartma" alt yazısı:** A "bilerek saklandı" / B "henüz yapıştırılmadı" / C "sahibi saklamayı seçti"? (3.6)
5. **Albüm ekranının adı:** Albüm / Kartlarım / Koleksiyon? (3.5)
6. **Rakam kuralı netleşiyor mu?** Uygulama-içi (Kaydet anı, Hafta ekranı) serbest kabul edildi (K-6a); kartın (PNG) kendisinde hem rakam hem harfle yazılmış sayı ("yedi gün") tamamen yasak mı, yoksa harfle yazılan kabul edilebilir mi? (bölüm 3, 4.1 girişi)
7. **"Geçen haftanın kartı bekliyor" bildirimi (F-C4) isteniyor mu?** Spec'in "telafi yok" kuralını değiştirir, ayrı intent gerektirir — öncelik sırasına girsin mi?
8. **"8 saniye" iddiası:** Gerçek cihazda kronometre ölçümü (S6 açık maddesi) yapılana kadar mağaza/onboarding metninde "birkaç saniye" mi kullanılsın, yoksa ölçüm önce mi yapılsın?
9. **Yasak sözcük listesi sertliği (4.2):** "ölçülü/dengeli" gibi tamamen yasaklanmayan ama aşırı kullanılan kelimeler (02 §2.7 imge envanteri) komple mi yasaklansın yoksa kota mı (ör. havuzda en çok 2) konsun?

## 8. Doğrulanmadı / sınırlar

- Bu belgedeki tüm karakter sayıları elle sayıldı (kabuk aracı bu oturumda kullanılmadı); ekleme öncesi `node -e "console.log([...s].length)"` ile doğrulanmalı (02 §5 emsali).
- 4.3'teki "192 yeni metin" hedefi bir üst-sınır tahminidir; gerçek kademeli plan mühendisle birlikte önceliklendirilmeli.
- 4.4'teki 40 örnek metnin kota tablosuyla (1.4) tam uyumu elle kontrol edildi, ikinci bir okuma/komutla taranmadı (bu turda K1 kaynak taraması `tr.ts` üzerinde tekrar çalıştırılmadı, yalnızca önceki turun 02 envanterine güvenildi).
- Türkçe ikinci okuma: yalnızca bu belgeyi yazan tarafından yapıldı; TDK/sesteş kontrolleri (ör. "kumbaracı") sözlükte ayrıca teyit edilmedi (02'den devralındı).
- Mizah öznel: her öneri seçenek + gerekçe olarak sunuldu, karar Batuhan'ındır. Kod, test, `app.json`, `tr.ts` DEĞİŞTİRİLMEDİ; uygulama mobile-engineer + qa-engineer'a devredilir.
- 8 haftalık tekrarsızlık algoritması (4.3, L7) yalnızca kavramsal olarak tarif edildi; gerçek `prevVariants`/`pickFromPool` genişletmesinin performans/karmaşıklık etkisi mobile-engineer tarafından değerlendirilmedi.

## Devir

- `mobile-engineer` + `qa-engineer`: bölüm 4 (havuz genişletme, yasak sözcük/kota testleri, zamansızlaştırma uygulaması, `CONTENT_VERSION` artışı), bölüm 5.1 (bildirim havuzu wiring'i), 3.1/3.6/3.7 (etiket ve erişilebilirlik metni bağlama).
- `visual-designer`: bant metni "HAFTANIN UNVANI" geçişi (14-gorsel-prototipler dosyalarında "KARNESİ" temizliği, 2.3), örnek kart görsel yerleşimi (3.3).
- `security-reviewer` + `software-architect`: F-C1 (kategori-nötr unvan, 02 §2.4 ile aynı karar noktası).
- `engagement-designer`: bölüm 5.1 bildirim havuzunun alışkanlık etkisi onayı, F-C2/F-C4 etik denetimi, 3.5 kilometre taşları etik kontrolü.
- `privacy-compliance-analyst` + `release-manager`: bölüm 5.2 mağaza metni v2, S12'nin R-1/R-3 kapıları hâlâ açık.
- `accessibility-auditor`: 3.7'deki metin önerilerinin gerçek etiketle eşleşip eşleşmediğinin ikinci turu (11'in bulgularına dayanır, kod değişmeden doğrulanamaz).
- Batuhan: bölüm 7'deki 9 soru; ses (1.2), "karne mi kart mı" kesinleşmesi, gizli unvan/satır alt yazısı, seviye kelimesi seçimi.

# 02 - İçerik / metin denetimi (Haftik) - 2026-09-25

Rol: Metin Yazarı / İçerik Editörü. Kapsam: kullanıcıya görünen TÜM metin (kart havuzu, kural motoru eşleşmesi, mikro-metin,
bildirim, mağaza, site). Bu belge yalnızca öneridir; kod, yapılandırma ve test DEĞİŞTİRİLMEDİ. Son söz Batuhan'ın.

## Özet (8 satır)

1. **En büyük içerik sorunu paylaşım anında:** varsayılan gizleme (uyku+harcama) yüzünden 81 seviye kombinasyonunun yaklaşık 65'inde
   (~%80) kartın en büyük yazısı olan **unvan "???" basılıyor** (el hesabı, bkz. 2.4). Paylaşılan kartta yalnızca hareket + sosyal satırı + özet kalıyor; özet havuzu ise en zayıf havuz.
2. **Ürünün kendi kuralını çiğneyen metinler var:** check-in düğmesi uyku için "kötü / idare / iyi" diyor (kural: "iyi/kötü değil"); "Neredeyse Kusursuz",
   "güzel bir yükseliş", "akıllıca bir seçimdi", "Zinde ve Dinlenmiş Kahraman" yargı/sağlık durumu dili taşıyor; mağaza metni ise "yargılamaz" diye söz veriyor.
3. **Mantık hataları:** "Dinlenme Modu..." (dördü düşük = uyku da düşük, çelişki), "çoğu kategori güçlüydü" (kural 1 yükselen + 3 sabitte de çıkıyor), "İlk karnen bu" (geçen hafta boş
   olan geri dönen kullanıcıda da çıkıyor), `partialData` özetleri hiç çıkmaz (ölü havuz), "Kumbaracı" sözcüğü TDK'da bombacı asker (istenmeyen çağrışım).
4. **Ses tutarsız:** kart sesi esprili-samimi, arayüz sesi kuru-işlevsel, izin/politika sesi resmi. Sözcük dağarcığı da dağınık: karne / kart / check-in; kart / banka kartı.
5. **Kalıp yorgunluğu:** 36 satırın 25'inde "bu hafta", orta seviye satırlarının 7/12'si "ne... ne...", 40 unvanın 13'ü "Usta/Uzman/Şampiyon/Kahraman/Yıldız", "mod" 5, "cüzdan" 5, "yastık" 4 kez.
6. **Blokajlar (herhangi bir dış dağıtımdan önce):** kart damgasında ve paylaşım mesajında `[mağaza bağlantısı]` yazıyor; Ayarlar'da "Gizlilik politikası (yakında)"; site "ağ isteği yapmaz" diyor (doğrulanmadı);
   "8 saniye" iddiası ölçülmedi.
7. **Öneri:** 12 unvan + 14 satır + 12 özet için aşağıda 2-3 alternatif (karakter sayılı); havuz 36 satır -> 60, özet 12 -> ~28, yeni durumlar: tam hafta, geri dönüş, yükselen/düşen ayrımı (bölüm 6).
8. **Doğrulanmadı:** karakter sayıları bu oturumda elle iki kez sayıldı (kabuk aracı yoktu; komut bölüm 5 başında); Türkçe ikinci okuma yalnızca benim; 2 satırlı unvan sığması cihazda ölçülmedi.

---

## 1. Ürünün mevcut sesi ve tutarsızlıklar

### 1.1 Gözlenen ses (metinlerden çıkarım)

| Yüzey | Ses | Örnek |
|---|---|---|
| Kart satırları | Samimi, kişileştirmeli, abartılı ("sen" hitabı) | "Adımların bu hafta grev ilan etti." |
| Kart unvanları | Ünvan/rütbe kalıbı, abartılı-övgülü | "Sessiz Serinin Sadık Ustası" |
| Kart özeti | Kuru, raporcu, yer yer değerlendirici | "Genel gidişat yukarı yönlü, güzel bir yükseliş." |
| Arayüz (hafta, check-in) | Kısa, işlevsel, nötr | "Kartın için 3 gün daha lazım." |
| Ara ekran / Alert'ler | Resmi-kurallı | "Bugünün verisi olmadan hafta eksik sayılır." |
| İzin / gizlilik | Güven verici ama "biz göndeririz" dili | "...hatırlatma göndeririz." |
| Mağaza | Üçüncü tekil, oyunbaz ("Haftik ... yazsın") + yasal dipnot tonu | "TAVSİYE YOK, YARGI YOK" |

### 1.2 Önerilen ses: 5 sıfat

1. **Samimi** - "sen" der, karşısındakiyle aynı hizada durur; ders vermez.
2. **Kuru esprili** - abartı, kişileştirme, deyim bozma; gülmeye çalışırken bağırmaz.
3. **Gözlemci** - ne olduğunu söyler (yoğunluk arttı/azaldı), iyi/kötü demez; niyeti ve durumu (yorgunluk, yalnızlık, cömertlik) varsaymaz.
4. **Kısa** - bir bakışta okunur; kart satırı tek nefes, arayüz metni tek cümle.
5. **Şeffaf** - veriyle, izinle, gizlilikle ilgili yerde espri yok; ne olduğunu düz söyler ve söz verdiğini tutar.

### 1.3 Söyler / söylemez

| Söyler | Söylemez |
|---|---|
| "Adımların bu hafta grev ilan etti." (gözlem + kişileştirme) | "Hareketin çok düşük, biraz kalk." (tavsiye/yargı) |
| "Bu hafta geçen haftadan daha dolu geçti." (yoğunluk) | "Güzel bir yükseliş!" / "Bu hafta çok iyiydin." (değer) |
| "Yastık seninle bu hafta ne soğuk ne sıcak." | "Uykusuz Kahraman" (durum/sağlık çıkarımı) |
| "Bugünü işaretlemeden kart açılmıyor." (kural, suçlamasız) | "Bugünü işaretlemedin, kart açılmaz." (suçlayıcı) |
| "Bildirim izni kapalı, hatırlatma gelmeyecek." | "Bildirim iznini vermediğin için çalışmıyor." |
| "Hesap yok, üyelik yok." (net) | "Hesap yok, kayıt yok." (kayıt = veri kaydı mı, üyelik mi?) |

### 1.4 Yasak / tercih kalıp listesi (öneri)

Yasak: "tam kararında / tam kıvamında" (orta = ideal ima eder), "orta karar" (Türkçede "vasat"), "akıllıca", "güzel", "güçlü/zayıf" (yoğunluk için), "kusursuz",
"performans", "cimri", "tembel", "kısıtlı", "çekingen", "içine dönük", "yalnız" (etiket olarak), "cömert" (harcama = cömertlik değil), "yorgun/uykusuz/zinde/dinlenmiş"
(durum iddiası), "uykucu" (çok uyuyan demek), "Kart" ile banka kartı kastetmek (üründe "kart" = haftalık kart), "karne" (okul notu çağrışımı, bkz. 1.5).
Tercih: yoğunluk fiilleri (arttı/azaldı/yavaşladı/hız kazandı), nesne kişileştirme (cüzdan, adım, yastık, telefon, takvim), yumuşak abartı, beklenti kırma, yerel deyim ("orta şekerli", "sessize almak", "bol keseden").

### 1.5 Sözcük dağarcığı tutarsızlıkları (karar Batuhan'ın)

| Kavram | Şu an | Sorun | Öneri |
|---|---|---|---|
| Haftalık çıktı | "karne" (onboarding başlığı, bildirim "Karnen hazır", paylaşım mesajı "Haftalık karnem hazır!", site), "kart" (ekranlar, bildirim gövdesi) | İki ad; "karne" okul notu/yargı çağrışımı taşır ("iyi/kötü değil" kuralıyla çelişir) | Tek ad: **kart**. "Karne" kalacaksa bilinçli bir göz kırpma olarak (Pazar akşamı okul kasveti) karar verilmeli |
| Günlük işlem | "işaretle" (arayüz), "check-in" (App Store adı, belgeler) | Yabancı sözcük | Kullanıcıya dönük her yerde "işaretle" |
| Banka kartı | "Kartın bu hafta neredeyse hiç ısınmadı", "Kartın Kahramanı" | Üründe "kart" haftalık karttır; karışıklık | Harcama metinlerinde "cüzdan"; "kart" yalnız haftalık kart |
| Uyku etiketi | Çip: "kötü/idare/iyi"; emoji: uykulu/huzurlu/uyuyan; satır: "yastığın seni göremedi" (miktar) | Kalite mi miktar mı belirsiz; "kötü/iyi" kuralı çiğniyor | Bkz. 2.1 ve 5.4 |

---

## 2. Mantık denetimi

### 2.1 Veri semantiği (kural motorundan)

- Seviye = ortalama (1-3 skala) eşikleri 5/3 ve 7/3: düşük (<5/3), orta, yüksek (>7/3). Sıralı yoğunluk, iyi/kötü değil (`score.ts`).
- Check-in düğmesi etiketleri (`constants/emoji.ts`): hareket durgun/hafif/yoğun; **uyku kötü/idare/iyi**; harcama az/orta/çok; sosyal **yalnız**/ölçülü/kalabalık.
- **Bulgu M-1 (kritik):** uyku için "kötü/iyi" kalite dilidir; emoji (uykulu/huzurlu/uyuyan) ve kart satırları miktar/zaman dilidir ("yastığın seni göremedi", "uyku bankasına bol para").
  Kullanıcı "kötü" seçip "Yastığın seni pek göremedi" okuyor; "iyi" seçip "Uyku bankasına bol para yatırdın" okuyor. Ürünün "iyi/kötü değil" kuralı en görünür yerde (düğme) ihlal ediliyor.
  "yalnız" da düşük sosyal için damgalayıcı bir etiket. Öneri: uyku **kısa / orta / uzun**, sosyal **sakin / orta / kalabalık** (5.4).

### 2.2 Unvan tablosu (40): ne zaman çıkar <-> ne söylüyor

Kural sırası `titles.ts`: allMedium -> 7/7 yüksek seri -> 7/7 düşük seri -> ilk kart (3 gün, >=2 yüksek) -> dördü yüksek -> dördü düşük -> 3Y+1D -> 3D+1Y -> büyük sıçrama (>=3 yükselen) -> büyük düşüş (>=3 düşen) -> 6 ikili aynı-yön çifti x2 -> 6 zıt-yön -> temel (hareket > uyku > harcama > sosyal öncelikli ilk uç kategori).
Sütun "Pay." = varsayılan paylaşımda (uyku+harcama gizli) unvan görünür mü: G = "???" olur, V = görünür, K = koşullu.
Sınıf: OK, M (mantık çelişkisi), Y (yargı), V (varsayım), S (sesteş/çağrışım), Z (zayıf/soğuk/kalıp).

| ID | Ne zaman çıkar | Metin | Pay. | Sınıf | Not |
|---|---|---|---|---|---|
| allMedium | dört kategori orta | Ne Az Ne Çok Ustası | V | OK/Z | Betimleyici; "usta" kalıbı |
| allFourHigh | dördü yüksek | Tam Gaz Hafta | G | OK | İyi; yargısız abartı |
| allFourLow | dördü düşük | Dinlenme Modu Sonuna Kadar Açık | G | **M**, Z | Uyku da düşük; "dinlenme" ile çelişir; "mod" tekrarı; 31 karakter, 2 satıra zor sığar |
| threeHighOneLow | 3 yüksek + 1 düşük | Neredeyse Kusursuz | G | **Y** | Düşük olan "kusur" oluyor; yoğunluk değer değil |
| threeLowOneHigh | 3 düşük + 1 yüksek | Tek Kişilik Ordu | G | OK | Olumlu çerçeve ama yargısız sayılır |
| sevenSevenHighStreak | 7/7 gün dolu + >=3 yüksek | Tam Hafta, Tam Performans | G | Y | "Performans" değerlendirme; 7/7 dolu = veri girişi, "yüksek" ayrı iki bilgiyi karıştırıyor |
| lowStreakSeven | 7/7 dolu + >=3 düşük | Sessiz Serinin Sadık Ustası | G | **M**, Z | "Sessiz seri" = düşük kategoriler harcama/uyku da olabilir; "seri" 7 günü mü sessizliği mi anlatıyor belirsiz |
| firstCardStrongStart | tam 3 dolu gün + >=2 yüksek | Daha İlk Haftadan Parlayan Yıldız | K | Y, Z | 33 karakter (2 satır riski); "parlayan" = yüksek iyi; "ilk hafta" değil "ilk kart" (kullanıcı sonradan kurduysa yanlış) |
| bigLeapUp | >=3 kategori yükseldi | Haftanın Sıçrama Şampiyonu | G | Y | Yükselme = kazanma ima eder |
| bigDrop | >=3 kategori düştü | Yumuşak İniş Uzmanı | G | V | "Yumuşak" varsayım; genel olarak kabul edilebilir |
| movementSleepBothHigh | hareket+uyku yüksek | Zinde ve Dinlenmiş Kahraman | G | **V/Y** | Sağlık durumu iddiası; "kahraman" x3 |
| movementSleepBothLow | hareket+uyku düşük | Düşük Pil Modu | G | V | "Yorgunsun" varsayımı; "mod" |
| spendingSocialBothHigh | harcama+sosyal yüksek | Parti ve Alışverişin Yıldızı | G | V, Z | "Alışveriş" varsayımı (kira/fatura da harcama); "yıldız" x3 |
| spendingSocialBothLow | harcama+sosyal düşük | Kumbaracı Ev Kuşu | G | **S** | "Kumbaracı" TDK'da eski bombacı asker; "ev" varsayımı |
| movementSpendingBothHigh | hareket+harcama yüksek | Enerjik Harcama Ustası | G | Z | Soğuk "X Ustası" |
| movementSpendingBothLow | hareket+harcama düşük | Sakin Bütçe Sakini | G | Z | Dil sürçmesi (Sakin/Sakini) |
| movementSocialBothHigh | hareket+sosyal yüksek | Koşan Sosyalite | V | OK/Z | "Sosyalite" = seçkin çevre çağrışımı; kabul edilebilir |
| movementSocialBothLow | hareket+sosyal düşük | Ev Modunda Bir Hafta | V | V, Z | "Ev" varsayımı; "mod" |
| sleepSpendingBothHigh | uyku+harcama yüksek | Rahat Uyuyan Cömert | G | **V** | Harcama yüksek = cömert değil |
| sleepSpendingBothLow | uyku+harcama düşük | Yorgun ve Tutumlu | G | V/Y | Yorgun varsayımı; tutumlu = erdem ima eder |
| sleepSocialBothHigh | uyku+sosyal yüksek | Dinlenmiş Sosyal Yıldız | G | V, Z | Durum iddiası; "yıldız" |
| sleepSocialBothLow | uyku+sosyal düşük | Sessiz Nöbetçi | G | OK/Z | "Nöbetçi" x2 ("Gece Nöbetçisi") |
| movementHighSleepLow | hareket yüksek, uyku düşük | Koşan Ama Uykusuz Kahraman | G | **V** | "Uykusuz" uyku bozukluğu çağrışımı; "Ama" ve "kahraman" kalıbı |
| sleepHighMovementLow | uyku yüksek, hareket düşük | Konforun Kalesi | G | OK | İyi |
| spendingHighSocialLow | harcama yüksek, sosyal düşük | Sessiz Ama Cömert | G | **V** | "Cömert" varsayımı |
| socialHighSpendingLow | sosyal yüksek, harcama düşük | Tutumlu Sosyalite | G | Z | Kabul edilebilir, sönük |
| movementHighSpendingLow | hareket yüksek, harcama düşük | Sporcu Cüzdan Koruyucusu | G | V | "Sporcu" varsayımı (hareket = spor değil) |
| sleepHighSocialLow | uyku yüksek, sosyal düşük | Yastıkla Baş Başa | G | OK+ | En iyilerden |
| basic.movement.low | hareket düşük (önceliği ilk) | Kanepe Filozofu | V | OK+ | En iyilerden ("kanepe" varsayımı hafif) |
| basic.movement.medium | hareket orta | Dengeli Adımcı | V | Z | "Dengeli" normatif hafif |
| basic.movement.high | hareket yüksek | Hareket Canavarı | V | Z | Klişe |
| basic.sleep.low | uyku düşük | Gece Nöbetçisi | G | OK | |
| basic.sleep.medium | uyku orta | Dengeli Uyuyucu | G | Z | "Uyuyucu" bozuk kalıp |
| basic.sleep.high | uyku yüksek | Yastık Şampiyonu | G | Y/Z | "Şampiyon" = çok uyumak başarı |
| basic.spending.low | harcama düşük | Cüzdan Koruyucusu | G | OK | |
| basic.spending.medium | harcama orta | Ölçülü Harcamacı | G | Y/Z | "Ölçülü" övgü; "harcamacı" bozuk kalıp |
| basic.spending.high | harcama yüksek | Kartın Kahramanı | G | **S/Y** | "Kart" hem haftalık kart hem banka kartı; "kahraman" |
| basic.social.low | sosyal düşük | Sessiz Mod Uzmanı | V | Z | "Mod" tekrarı |
| basic.social.medium | sosyal orta | Dengeli Sosyalite | V | Z | |
| basic.social.high | sosyal yüksek | Sosyal Kelebek | V | Z | Klişe ama zararsız |

Sonuç sayımı: 40 unvanın 1'i mantık çelişkisi (allFourLow) + 1 anlam kayması (lowStreakSeven), 6 yargı, 10 varsayım, 2 sesteş/çağrışım; iyi olanlar: Kanepe Filozofu, Yastıkla Baş Başa, Konforun Kalesi, Tam Gaz Hafta, Tek Kişilik Ordu.

### 2.3 Satır tablosu (36): hangi seviyede çıkar <-> ne söylüyor

Her satır kendi (kategori, seviye) hücresinde çıkar; seçim `week_start` tohumuyla, ardışık haftada aynı kimlik tekrarlanmaz. Sınıf kodları 2.2 ile aynı.

| ID | Metin | Sınıf | Not |
|---|---|---|---|
| mov.low.1 | Bacakların bu hafta izne çıkmış resmen. | OK | "resmen" x3 havuzda |
| mov.low.2 | Kanepe bu hafta seni pek bırakmadı. | V | Kanepe varsayımı, hafif |
| mov.low.3 | Adımların bu hafta grev ilan etti. | OK+ | |
| mov.med.1 | Ne maraton ne mola, tam ortası bir tempo. | OK | |
| mov.med.2 | Orta karar hareket, akıllıca bir seçimdi. | **Y/V** | "Orta karar" = vasat; "akıllıca" yargı + niyet varsayımı |
| mov.med.3 | Ne çok koştun ne hiç durdun, dengeliydin. | Z | "Ne...ne", "dengeliydin" dolgu |
| mov.high.1 | Bacakların bu hafta durmak bilmedi. | OK | |
| mov.high.2 | Enerjin taşmış, hareket resmen sende bu hafta. | Z, V | Anlam bulanık ("hareket sende"); enerji varsayımı |
| mov.high.3 | Adımların bu hafta hız sınırını zorladı. | OK | |
| sleep.low.1 | Yastığın bu hafta seni pek göremedi. | OK | Miktar okuması (bkz. M-1) |
| sleep.low.2 | Gece yarıları senin mesai saatin gibiydi. | V | Gece çalıştığını/uyanık kaldığını varsayar |
| sleep.low.3 | Uyku bu hafta sana biraz küstü galiba. | OK | Yumuşak |
| sleep.med.1 | Ne baykuş ne tarla kuşu, ortada bir haftaydın. | Z | Kronotip imgesi (ne zaman uyuyor), miktar değil |
| sleep.med.2 | Uykun ne az ne çok, dengeli geçti. | Z | |
| sleep.med.3 | Ilımlı bir uyku haftası geçirdin. | Z | Soğuk |
| sleep.high.1 | Yastığınla resmen kader birliği yaptınız. | OK | |
| sleep.high.2 | Bu hafta uyku konusunda zirvedeydin. | Z, Y | "konusunda" dolgu, başarı dili |
| sleep.high.3 | Uyku bankasına bol para yatırdın bu hafta. | OK+ | Sağlık dili yok; en iyi uyku satırı |
| spend.low.1 | Cüzdanın bu hafta minik bir tatil yaptı. | OK+ | |
| spend.low.2 | Kartın bu hafta neredeyse hiç ısınmadı. | OK, S | "Kart" karışıklığı |
| spend.low.3 | Bu hafta harcama konusunda çekingendin. | **V**, Z | "Çekingen" psikolojik varsayım |
| spend.med.1 | Ne cimri ne çılgın, tam kararında harcadın. | **Y** | "Cimri" aşağılayıcı; "tam kararında" ideal ima eder |
| spend.med.2 | Cüzdan bu hafta ölçülü bir tempo tuttu. | OK | "Tempo" x3 havuzda |
| spend.med.3 | Harcaman ne kısıtlı ne bol, dengeliydi. | Y, Z | "Kısıtlı" yoksulluk çağrışımı |
| spend.high.1 | Kartın bu hafta epey mesai yaptı. | OK, S | |
| spend.high.2 | Cüzdanın bu hafta hatırı sayılır bir tur attı. | Z | "Tur" bulanık |
| spend.high.3 | Bu hafta harcama konusunda cömert taraftaydın. | **V**, Z | Cömertlik varsayımı |
| social.low.1 | Sosyal takvimin bu hafta sakin kaldı. | OK | |
| social.low.2 | Sosyal hayatın bu hafta sessiz moddaydı. | OK | "Mod" x5 havuzda |
| social.low.3 | Bu hafta içine dönük bir hafta geçirdin. | **V** | Kişilik etiketi; "hafta" iki kez |
| social.med.1 | Ne kalabalık ne yalnız, ortada bir haftaydın. | OK | "Yalnız" kelimesi etiket olarak geçiyor |
| social.med.2 | Sosyallik dozun tam kıvamındaydı bu hafta. | Y | "Tam kıvamında" ideal ima eder; "doz" tıbbi ödünç |
| social.med.3 | Bu hafta sosyal hayatın dengeliydi. | Z | |
| social.high.1 | Bu hafta çevrende adeta bir kutlama vardı. | OK | |
| social.high.2 | Sosyal pilin bu hafta hiç bitmedi. | OK+ | Güncel, paylaşılır |
| social.high.3 | Bu hafta etrafın seninle şenlendi. | Z | |

Sayım: OK/OK+ 15, Z 10, V 6, Y 3, S 2 (kodlar örtüşebilir). **Orta seviye 12 satırın yalnızca 3'ü tam iyi** - en sık çıkacak seviye ("orta" aralığı 5/3-7/3 geniştir) aynı zamanda en zayıf havuz.

### 2.4 Paylaşım bulgusu: unvan çoğu kez "???" (P-1, kritik)

`CardView`/`shouldHideTitle`: unvanın `basedOnCategories`'inden biri gizliyse unvan "???" basılır; varsayılan gizli küme = {uyku, harcama}. `titles.ts` sırasını 81 seviye kombinasyonuna uyguladığımda (7/7, ilk kart, sıçrama, düşüş kuralları hariç):

| Sonuç | Kombinasyon sayısı |
|---|---|
| Unvan görünür (allMedium 1 + hareket-sosyal çifti 8 + hareket/sosyal temel 7) | 16 |
| Unvan "???" | 65 (~%80) |

7/7 seri, sıçrama ve düşüş kuralları hemen her zaman uyku/harcamayı içerdiğinden oran bundan iyi olmaz (yalnızca ilk kart kuralı bazen görünür). Gerçek dağılım bilinmiyor (orta seviye yaygınsa allMedium payı artar), ama en sık ikinci durum "tek uç kategori"
ve temel unvan önceliği hareket > uyku > harcama > sosyal olduğu için uyku/harcama tek uçsa unvan gizlenir. **Yani paylaşılan kartın çoğu: "???" başlık, bir hareket satırı, iki "???" satır, bir sosyal satır, özet.** Ekran görüntüsü paylaşılabilirlik testini büyük olasılıkla geçmez.
Ayrıca uyku/harcama satır havuzu (en iyi espriler: uyku bankası, cüzdan tatili) varsayılanda paylaşımda hiç görünmez; yalnızca kullanıcı reveal ekranında görür.

İçerik tarafı çözüm seçenekleri (uygulama ve gizlilik kararı Batuhan + mühendis + güvenlik; ben metin tarafını veriyorum):

- **A. Kategori-nötr unvan havuzu:** her unvana "kategoriyi ele veriyor mu" işareti (`revealsCategory`). "Tam Gaz Hafta", "Bir Vites Yukarı", "Sessiz Sedasız Bir Hafta" gibi unvanlar hiçbir kategoriyi adlandırmaz; yalnızca kategori adlandıranlar ("Yastıkla Baş Başa", "Cüzdan Koruyucusu") gizlenir. Tahmini görünür oran ~%50'ye çıkar. Kalan ipucu riski (nötr unvanın seviye ima etmesi) güvenlik incelemesine gider.
- **B. İkinci, "herkese açık" unvan:** kart üretilirken yalnızca hareket+sosyaldan bir `publicTitle` de dondurulur; gizli durumda "???" yerine o görünür. Dondurulmuş kart ilkesini bozmaz (ek alan), ama veri modeli değişir.
- **C. Varsayılanı değiştir:** unvan hiçbir zaman gizlenmesin, sadece uyku/harcama satırları gizlensin (unvan seviye özeti olduğundan tek başına ipucu zayıf). Gizlilik gereksinimi 3'ü değiştirir; ayrı intent gerekir.
- Hangisi seçilirse seçilsin: unvan + hareket + sosyal satırı + özet, tek başına **paylaşılabilir** olacak şekilde yazılmalıdır (bölüm 6, "herkese açık" öncelik sırası).

### 2.5 Özet tablosu (12): hangi delta durumunda çıkar <-> ne söylüyor

Delta: kategori başına +1 (fark > +0,5), -1 (fark < -0,5), 0, null (geçen hafta < 2 dolu gün). `classifySummaryBucket`:

| Kova | Ne zaman çıkar (gerçek) | Metinler | Bulgular |
|---|---|---|---|
| firstCard | dört delta null = **geçen hafta 2'den az dolu gün** | "İlk karnen bu, kıyaslayacak geçmiş hafta yok." / "Bu ilk kartın, önceki haftayla kıyas henüz yok." | **M-2:** geçen hafta boş olan geri dönen kullanıcıya da "ilk karnen" der (yanlış); ikinci metinde "henüz" ve "karne/kart" karışık |
| allStable | dört delta 0 | "Bu hafta her şey geçen haftayla aynı çizgide gitti." / "Değişim yok, geçen haftanın aynı temposundaydın." | "Her şey" fazla iddialı (fark <= 0,5 "aynı" değil, "yakın"); ikincisi soğuk |
| risingMajority | yükselen > düşen (**1 yükselen + 3 sabit de girer**) | "Bu hafta çoğu kategori geçen haftadan güçlüydü." / "Genel gidişat yukarı yönlü, güzel bir yükseliş." | **M-3:** "çoğu" yanlış olabilir; "güçlü" ve "güzel" değer dili; ikinci metin tautoloji |
| fallingMajority | düşen > yükselen (1 düşen + 3 sabit de girer) | "Bu hafta çoğu kategori geçen haftadan biraz düştü." / "Genel gidişat aşağı yönlü, sakin bir dinlenme haftası." | "Çoğu" aynı hata; ikincisi **varsayım** (dinlenme) - harcama düşmesi dinlenme değil; "düştü" olumsuz ima |
| balancedMixed | yükselen = düşen > 0 | "Karışık bir hafta, kimi yükseldi kimi düştü." / "Bu hafta terazi hem sağa hem sola salındı." | Doğru ve yargısız; ikincisi güzel |
| partialData | bazı deltalar null | "Bazı kategorilerde geçen haftayla kıyas henüz yok." / "Karşılaştırma için bazı kategoriler henüz ısınıyor." | **M-4:** `computeDelta` geçen hafta günü tüm kategoriler için aynı olduğundan deltalar ya hep null ya hiç null: **bu kova hiç çıkmaz (ölü havuz, 2 metin)**; mühendisle doğrulanmalı |

Özet kartta **her zaman görünür** (gizlenemez) ve tüm dört kategorinin yönünü taşır; bu yüzden paylaşımın kalıcı içeriği bu havuzdur.

### 2.6 Diğer mantık notları

- **L-1** `firstCardStrongStart` "tam 3 dolu gün" koşuluna bakıyor; eşik 3 yalnızca ilk kartta geçerli olduğundan pratikte doğru, ama "ilk hafta" değil "ilk kart" anlamındadır.
- **L-2** Aynı unvan üst üste gelmesin diye bir sonraki eşleşen seçilir: bu "en uygun" değil "sıradaki" unvandır; bazen temel unvana düşer. Kabul edilebilir, ama hangi unvan ikinci sırada çıkacak içerik tarafından da düşünülmeli (unvanlar birbirinin ikinci seçeneği olacak kadar yakın tonlu olmalı).
- **L-3** Unvanın tek metni var (varyant yok): aynı durumdaki kullanıcı iki hafta arayla aynı unvanı görebilir. Kural başına 2 varyant öneriliyor (bölüm 6).
- **L-4** `docs/icerik-inceleme.md` tabloları eski metinleri gösteriyor ("Sessizliğin Ustası", "Koşarken bile koşan biri gibiydin", "yalnızlığın tadını çıkarmışsın"); başlıktaki not güncel `tr.ts`'e işaret ediyor. `docs/ux/ekran-akisi.md` örnek kartı ve damga metni ("Haftalık Hayat Karnesi · [mağaza]") da eski.
- **L-5** İçerik havuzu değiştiğinde `CONTENT_VERSION` (şu an 1) artırılmalı; K8 ton geçişinde artırılmamış görünüyor. Dış dağıtımdan önce 2'ye alınmalı (dondurulmuş eski kartlar etkilenmez).

### 2.7 İmge envanteri (tekrar)

| İmge / kalıp | Adet | Yerler |
|---|---|---|
| "bu hafta" | 29 (satır 25/36, özet 4) | Her yerde; kart zaten haftalık, karakter yiyor |
| "Ne... ne..." | 7/12 orta satır + "Ne Az Ne Çok Ustası" | Orta seviye neredeyse hep aynı kalıp |
| "Dengeli / dengeliydi" | 7 | 3 unvan + 4 satır |
| Unvan sonek ailesi Usta/Uzman/Şampiyon/Kahraman/Yıldız | 13/40 | Rütbe kalıbı |
| "mod" | 5 | Dinlenme Modu, Düşük Pil Modu, Ev Modunda, Sessiz Mod Uzmanı, "sessiz moddaydı" |
| "sessiz" | 5 | 4 unvan + 1 satır |
| "cüzdan" | 5 | 2 unvan + 3 satır |
| "yastık" | 4 | 2 unvan + 2 satır |
| "resmen" | 3 | 3 satır |
| "mesai" | 2 | sleep.low.2, spend.high.1 |
| "kanepe" | 2 | başlık + satır (iyi) |
| "tempo" | 3 | mov.med.1, spend.med.2, allStable.2 |
| "cömert" | 3 | 2 unvan + 1 satır (hepsi varsayım) |
| "kahraman" | 3 / "yıldız" 3 / "nöbetçi" 2 | unvanlar |

Kalıp mekanikleri: kişileştirme iyi işliyor (grev, izin, küstü, tatil, sosyal pil); **deyim bozma neredeyse hiç yok, beklenti kırma az**; unvanların çoğu "sıfat + rütbe" tek mekanik.

---

## 3. Mizah kalitesi

### 3.1 Paylaşılabilirlik testi ("ekran görüntüsü olarak paylaşılır mı?")

Test: "Bunu ekran görüntüsü alan biri utanır mı, güler mi, anlatır mı?"

- **Geçer:** Kanepe Filozofu, Yastıkla Baş Başa, Konforun Kalesi, Tam Gaz Hafta, Tek Kişilik Ordu; "Adımların grev ilan etti", "Cüzdanın minik bir tatil yaptı", "Sosyal pilin bu hafta hiç bitmedi".
- **Utandırma riski (kim kırılır?):** "Tutumlu/kısıtlı/cimri" -> düşük gelirli kullanıcı; "içine dönük", "yalnız", "çekingen" -> sosyal olarak dışlanmış hisseden; "Uykusuz", "Yorgun", "Düşük Pil" -> uyku/enerji sorunu yaşayan; "Cömert" -> harcaması borç/zorunlu olan.
- **Paylaşılmaz (sıkıcı):** tüm "dengeli/ölçülü" orta satırlar, tüm özetler, "Ilımlı bir uyku haftası geçirdin.".
- **Paylaşımda anlam kaybı:** "???" başlık (2.4).

### 3.2 En iyi 5

1. **Kanepe Filozofu** (hareket düşük) - beklenti kırma + abartı; yargısız; kısa.
2. **Yastıkla Baş Başa** (uyku yüksek, sosyal düşük) - deyim oyunu, gözlem, kimseyi kırmaz.
3. **Cüzdanın bu hafta minik bir tatil yaptı.** - kişileştirme, suçlamasız.
4. **Adımların bu hafta grev ilan etti.** - abartı + kişileştirme, güncel ("grev").
5. **Uyku bankasına bol para yatırdın bu hafta.** - sağlık dili taşımayan metafor.
Kıl payı dışarıda: Konforun Kalesi, Tam Gaz Hafta, Sosyal pilin bu hafta hiç bitmedi.

### 3.3 En zayıf 10 (zarar sırasıyla: mantık > yargı/varsayım > soğuk)

| # | Metin | Neden |
|---|---|---|
| 1 | Dinlenme Modu Sonuna Kadar Açık | Mantık çelişkisi (uyku düşük ≠ dinlenme); "mod"; 31 karakter |
| 2 | Orta karar hareket, akıllıca bir seçimdi. | "Orta karar" vasat demek; "akıllıca" yargı + niyet varsayımı |
| 3 | Bu hafta çoğu kategori geçen haftadan güçlüydü. | Kural 1 yükselen + 3 sabitte de çıkar (yanlış "çoğu"); "güçlü" değer |
| 4 | Genel gidişat aşağı yönlü, sakin bir dinlenme haftası. | Düşüşü "dinlenme" ilan eder (varsayım); tautoloji |
| 5 | Neredeyse Kusursuz | Düşük olan kusur; yoğunluk değer değil |
| 6 | Zinde ve Dinlenmiş Kahraman | Sağlık durumu iddiası ("tıbbi değerlendirme yapmaz" sözüyle çelişir) |
| 7 | Bu hafta içine dönük bir hafta geçirdin. | Kişilik etiketi; "hafta" tekrarı |
| 8 | Bu hafta harcama konusunda çekingendin. | Psikolojik varsayım; "konusunda" dolgusu |
| 9 | Kumbaracı Ev Kuşu | "Kumbaracı" = eski bombacı asker (TDK); "ev" varsayımı |
| 10 | Ne cimri ne çılgın, tam kararında harcadın. | "Cimri" aşağılayıcı; "tam kararında" gizli tavsiye |
Sırada: "Kartın Kahramanı" (kart sesteşi), "Rahat Uyuyan Cömert", "İlk karnen bu" (geri dönene yanlış), tüm "dengeliydi" satırları.

---

## 4. Mikro-metin denetimi

Ölçüt: suçlamama, belirsizlik, uzunluk, yargısızlık, "neden + ne yapmalı" tek cümlede, izin reddi ile kalıcı ret farklı metin.

### 4.1 Onboarding

| Yer | Şu an | Sorun | Öneri |
|---|---|---|---|
| Karşılama başlığı | Her gün 8 saniye. Her pazar bir karne. | "8 saniye" ölçülmedi (S6 kronometre yok); "karne" vs "kart" | A: "Her gün birkaç saniye. Her pazar bir kart." (43) / B: "Günde dört emoji, Pazar akşamı bir kart." (39) |
| Karşılama gövdesi | Hareket, uyku, harcama, sosyal: haftanı emojiyle anlat, pazar akşamı sonucu gör. | "Sonucu gör" değerlendirme ima eder; esprili/paylaşılabilir kanca yok | A: "Dört emoji seç. Pazar akşamı haftan esprili bir kart olarak açılır." / B: "Haftanı emojiyle anlat; Pazar akşamı paylaşmalık bir kart çıksın." |
| Gizlilik gövdesi | Hesap yok, bulut yok. Telefon değişirse veri taşınmaz. | Olumsuz ve teknik; sonuç (kaybolur) açık değil | A: "Hesap yok, bulut yok. Telefonu değiştirirsen veriler yeni telefona geçmez." |
| İzin gövdesi | Akşam 21:00'de "bugünü işaretle" diye bir hatırlatma göndeririz. İstediğin an kapatabilirsin. | "Göndeririz" sunucu ima eder ("Hesap yok, bulut yok" ile çelişir) | A: "Akşam 21:00'de "bugünü işaretle" diye küçük bir hatırlatma çıkar. İstediğin an kapatabilirsin." |
| Düğmeler | İzin ver / Şimdi değil | İyi (suçlamasız) | Değişmesin |

### 4.2 Check-in ve hafta ekranı

| Yer | Şu an | Sorun | Öneri |
|---|---|---|---|
| Seviye etiketleri | uyku kötü/idare/iyi; sosyal yalnız/ölçülü/kalabalık | Yargı/damga (M-1) | Bkz. 5.4 |
| Kalan kategori ipucu | "2 kategori kaldı" | İyi | |
| Kaydet sonrası | Metin yok | **Boşluk:** kayıt başarısı için geri bildirim yok | "Kaydedildi." (kısa, 1-2 sn) |
| Kayıt/yükleme hatası | Metin yok (`try/finally`, hata yakalanmıyor; yükleme dönen spinner) | **Boşluk:** hata durumu sessiz | "Kaydedemedik. Bir kez daha dener misin?" |
| Hafta başlığı (eşik dolu, saat gelmedi) | "Kartın hazırlanıyor." | Yanıltıcı: hesaplanan bir şey yok, beklenen zaman var | A: "Yeterince gün doldu." / B: "Kartın için günlerin tamam." |
| Hafta alt yazısı (Pazar öncesi) | "Pazar 20:00'de açılıyor" | İyi | |
| Hafta alt yazısı (K3) | "Bugünü işaretlemeden kartın açılmaz" | Kural sesi, hafif azarlayıcı | A: "Önce bugünü işaretle, sonra kart açılır." (39) / B: "Kart, bugünü de işaretleyince açılıyor." |
| Kartın hazır | "Kartın hazır!" / "Kartın hazır, açmak için dokun" | İyi | |
| Geçen haftanın açılmamış kartı | Metin/ekran yok (`week.tsx` yalnızca güncel haftayı gösteriyor; spec "süre sınırı yok" diyor) | **Boşluk (doğrulanmalı):** kullanıcıyı kartına götüren bir metin yok | Mühendisle doğrulanacak; gerekirse "Geçen haftanın kartı seni bekliyor" |

### 4.3 Pazar ara ekranı (K3)

| Şu an | Sorun | Öneri |
|---|---|---|
| "Kartını açmadan önce bugünü de ekleyelim." | Kabul edilebilir ("ekleyelim" ortak dil) | Kalsın |
| "Bugünün verisi olmadan hafta eksik sayılır." | "Veri" jargon; "eksik sayılır" tehdit gibi | A: "Pazar da haftanın parçası; kart bugünle tamamlanır." / B: "Kart, haftanın son gününü de görsün." |
| "Bugünü işaretle" / "Geri" | İyi | |
Bildirim çelişkisi: 20:00 bildirimi "Karnen hazır" diyor, dokununca ara ekran çıkıyor (bugün işaretlenmemişse). Bkz. 4.6.

### 4.4 Ayarlar, izin, silme

| Yer | Şu an | Sorun | Öneri |
|---|---|---|---|
| İzin durumu | "Bildirim izni kapalı, hatırlatma çalışmaz." | Tek metin; reddedilebilir (tekrar sorulabilir) ile kalıcı ret ayırt edilmiyor | Tekrar sorulabilir: "Bildirim izni yok. Anahtarı açarsan bir kez daha soracağız." Kalıcı: "Bildirimler sistem ayarlarından kapalı. Açmak için sistem ayarlarına git." |
| İzin düğmesi | "Ayarları aç" | Uygulamanın kendi "Ayarlar" sekmesiyle karışır | "Sistem ayarlarını aç" |
| Gizlilik satırı | "Gizlilik politikası (yakında)" + Alert "Gizlilik politikası yayına yakın eklenecek." | Bitmemiş ürün hissi; Play zorunlu politika URL'si ister | Politika yayına girene kadar satırı gizle; girince "Gizlilik politikası" |
| Silme Alert | "Bu işlem geri alınamaz. Emin misin?" | Neyin silineceği yok | Başlık "Tüm verilerimi sil" / Gövde: "Check-in'lerin, kartların ve sayaçların bu telefondan silinir. Geri alınamaz." / Düğmeler: Vazgeç, Hepsini sil |
| Silme sonrası | Sessizce onboarding'e | Onay yok | Onboarding'e dönüşte tek satır: "Veriler silindi." |
| Deneme raporu | "Deneme raporunu paylaş" + açıklama | Deneme bittiğinde test artığı; açıklama iyi | Deneme sonrası gizlenmesi ürün kararı; metin kalsın |
| Rapor onayı | "Paylaşılacak şey yalnızca sayaçlar ve gün sayısıdır. İçerik (emoji, kart metni), tarih ya da kimlik bilgisi yoktur..." | Uzun, hukuki ton; içerik doğru | A: "Rapor yalnızca sayaçlar ve gün sayısı içerir; emoji, kart metni, tarih ya da kimlik yok. Kime göndereceğini sen seçersin." |
| Rapor hatası | "Rapor paylaşılamadı. Bir süre sonra tekrar deneyebilirsin." | İyi (suçlamasız) | |

### 4.5 Kart, önizleme, paylaşım

| Yer | Şu an | Sorun | Öneri |
|---|---|---|---|
| Önizleme başlığı | "Paylaşmadan önce gözden geçir." | İyi | |
| Varsayılan "???" açıklaması | Yok; göz/maymun simgeleri açıklamasız | **Boşluk:** iki satırın ve çoğu unvanın neden "???" olduğu anlatılmıyor; simge durum mu eylem mi belli değil | Başlığın altına: "Uyku ve harcama varsayılan olarak gizli; kartta ??? görünür. Göz simgesiyle aç/kapat." |
| Paylaşım hatası | "Paylaşım başarısız oldu, tekrar dene." | Biraz emir/kuru | "Paylaşım açılamadı. Bir kez daha dener misin?" |
| Damga | "Haftik · [mağaza bağlantısı]" | **Blokaj:** yer tutucu PNG'ye basılıyor | Gerçek bağlantı gelene kadar yalnızca "Haftik" |
| Paylaşım mesajı | "Haftalık karnem hazır! [mağaza bağlantısı]" | Yer tutucu; "karne" sözcüğü; ayrıca `expo-sharing` mesajı taşımıyor (CLAUDE.md S7b) | Bağlantı yoksa yalnızca "Haftalık kartım hazır!" |

### 4.6 Bildirim (sabit, veri içermez)

| Tür | Şu an | Sorun | Öneri (hepsi sabit, veri yok) |
|---|---|---|---|
| Günlük | "Bugün nasıldı?" / "Birkaç saniyede bugünü işaretleyebilirsin." | "Nasıldı" ruh hali sorusu gibi okunur (ürün ruh halini ölçmüyor); her gün aynı metin -> alışma | A: "Bugünü işaretleme vakti" / "Dört emoji, birkaç saniye." (22 / 27); B: "Bugün hangi vitesteydin?" / "Dört emojiyle anlat, gün kapansın." (23 / 34). Havuz olarak 3-4 çift, haftanın gününe göre sabit dönüş (deterministik, veri sızdırmaz); mühendis kararı |
| Kart hazır | "Karnen hazır" / "Bu haftanın kartı seni bekliyor." | "Hazır" diyor, ama bugün işaretlenmediyse ara ekran çıkıyor; "karne" | A: "Haftanın kartı hazır" / "Bugünü de işaretle, sonra açalım." (20 / 32); B: "Haftanın kartı hazır" / "Bugünü de işaretlediysen kart seni bekliyor." (20 / 44). Site gizlilik sayfası mevcut bildirim metinlerini alıntılıyor: değişirse güncellenmeli |
Kanal adı "Hatırlatmalar": iyi.

---

## 5. Alternatif metinler (seçenek + gerekçe; karar Batuhan'ın)

**Karakter sayımı hakkında:** bu oturumda kabuk aracı yoktu, `node -e` çalıştırılamadı. Her sayı harf harf, sonra kelime + boşluk toplamıyla **iki kez elle** sayıldı. Aşağıdaki komutla doğrulanmalı (kod noktası sayar, Türkçe harflerde `.length` ile aynı):

```
node -e "for (const s of process.argv.slice(1)) console.log([...s].length, s)" "Sessiz Sedasız Bir Hafta" "Bir Vites Yukarı"
```

Kart satırı sınırı 60; kartta 15 pt satır metni ~37 karakter/satır, 2 satıra kadar sığar: önerilerin hepsi <= 46. Unvan 30 pt kalın, 296 px, en çok 2 satır: **unvan hedefi <= 28 karakter, her satır <= 16-17 karakter** (cihazda ölçülmedi). Alternatiflerde rakam yok ("Üç/Bir/Dört" harfle yazılmıştır; testin `\d` denetimi geçer, ama "rakamsız" kuralının ruhuna yakın sayılır mı Batuhan'a sor).

### 5.1 Unvanlar

| ID | Şu an (say.) | Seçenek A (say.) | Seçenek B (say.) | Gerekçe |
|---|---|---|---|---|
| allFourLow | Dinlenme Modu Sonuna Kadar Açık (31) | **Sessiz Sedasız Bir Hafta** (24) | Radara Takılmayan Hafta (23) | Uyku düşükken "dinlenme" demez; deyim; "mod" biter |
| threeHighOneLow | Neredeyse Kusursuz (18) | **Neredeyse Tam Gaz** (17) | Üç Sahne, Bir Kulis (19) | "Kusur" ima etmez; "Tam Gaz Hafta" ile eş |
| sevenSevenHighStreak | Tam Hafta, Tam Performans (24) | **Pazartesiden Pazara Tam Gaz** (27) | Hiç Boş Bırakmayan Hafta (24) | "Performans" gider; hem 7 günü hem yüksekliği anlatır |
| lowStreakSeven | Sessiz Serinin Sadık Ustası (27) | **Yavaş Çekimde Bir Hafta** (23) | Sakin Ama Düzenli (18) | "Seri/sessiz" bulanıklığı biter; ikincisi 7 gün işaretlemeyi de över |
| firstCardStrongStart | Daha İlk Haftadan Parlayan Yıldız (33) | **İlk Haftadan Sahnede** (20) | Gürültülü Bir Giriş (19) | Kısa; "parlayan/yıldız" yükseği ödüllendirmez |
| bigLeapUp | Haftanın Sıçrama Şampiyonu (26) | **Bir Vites Yukarı** (16) | Geçen Haftayı Sollayan (22) | Yarışma dili yok, yoğunluk dili var |
| bigDrop | Yumuşak İniş Uzmanı (19) | **Bir Vites Aşağı** (15) | Yavaşlayan Hafta (16) | "Yumuşak/uzman" varsayımı yok; yukarıdakiyle simetrik |
| movementSleepBothHigh | Zinde ve Dinlenmiş Kahraman (27) | **Hem Koşan Hem Yatan** (19) | Adımı da Yastığı da Bol (23) | Sağlık durumu iddiası yok; "kahraman" x3'ten biri gider |
| movementSleepBothLow | Düşük Pil Modu (14) | **Kısa Gece, Sakin Adım** (21) | Enerji Tasarrufu Haftası (24) | "Yorgunsun" varsaymaz; "mod" gider |
| spendingSocialBothHigh | Parti ve Alışverişin Yıldızı (28) | **Parti Var, Poşet Var** (20) | Hem Sahnede Hem Kasada (22) | Alışveriş varsayımı hafifler; "yıldız" tekrarı biter |
| spendingSocialBothLow | Kumbaracı Ev Kuşu (17) | **Kapı da Cüzdan da Kapalı** (24) | Ev Kuşu, Cüzdan Kilitli (23) | "Kumbaracı" (bombacı asker) çağrışımı biter |
| movementSpendingBothHigh | Enerjik Harcama Ustası (22) | **Koşup Harcayan Hafta** (20) | Hızlı Adım, Hızlı Harcama (25) | Soğuk "usta" kalıbı gider |
| movementSpendingBothLow | Sakin Bütçe Sakini (18) | **Yavaş Adım, Kapalı Cüzdan** (25) | Ne Koşan Ne Harcayan (20) | Dil sürçmesi biter |
| sleepSpendingBothHigh | Rahat Uyuyan Cömert (19) | **Rahat Yatan, Rahat Harcayan** (27) | Bol Uyku, Bol Harcama (21) | "Cömert" varsayımı biter |
| sleepSpendingBothLow | Yorgun ve Tutumlu (17) | **Kısa Gece, Boş Sepet** (20) | Az Uyku, Az Harcama (19) | "Yorgun" ve "tutumlu" erdemi gider |
| sleepSocialBothHigh | Dinlenmiş Sosyal Yıldız (23) | **Yastıktan Kalabalığa** (20) | Önce Yastık Sonra Kalabalık (27) | Durum iddiası ve "yıldız" gider |
| movementSocialBothLow | Ev Modunda Bir Hafta (19) | **Kapıdan Az Çıkan Hafta** (22) | (mevcut kalabilir; "mod" tekrarı nedeniyle önerilir) | Yine hafif varsayım; hareket+sosyal düşükte en yakın gözlem |
| movementHighSleepLow | Koşan Ama Uykusuz Kahraman (27) | **Gece Kısa, Adım Uzun** (20) | Az Uyku, Çok Adım (17) | "Uykusuz" uyku bozukluğu çağrışımı biter |
| spendingHighSocialLow | Sessiz Ama Cömert (17) | **Sessiz Ama Hareketli Cüzdan** (27) | Az Kalabalık, Çok Cüzdan (24) | "Cömert" varsayımı biter; "Ama" kalıbı bir kez kalır |
| socialHighSpendingLow | Tutumlu Sosyalite (17) | **Kalabalıkta Cüzdan Cepte** (23) | (mevcut kabul edilebilir) | "Tutumlu" erdem ima eder |
| movementHighSpendingLow | Sporcu Cüzdan Koruyucusu (24) | **Adım Çok, Fiş Yok** (17) | Koşan, Harcamayan (16) | "Sporcu" varsayımı biter; fiş = esprili |
| basic.spending.high | Kartın Kahramanı (16) | **Cüzdan Mesaide** (14) | Bol Keseden Bir Hafta (21) | "Kart" sesteşi ve "kahraman" biter |
| basic.spending.medium | Ölçülü Harcamacı (16) | **Cüzdan Orta Hızda** (17) | Ara Vites Cüzdan (16) | "Ölçülü" övgü, "harcamacı" bozuk kalıp |
| basic.sleep.medium | Dengeli Uyuyucu (15) | **Ortada Bir Yastık** (18) | Tam Ortadan Uyuyan (18) | "Uyuyucu" bozuk kalıp |
| basic.sleep.high | Yastık Şampiyonu (16) | **Yastığın Sadık Dostu** (19) | (mevcut kalabilir) | Başarı dili yerine bağlılık |
| basic.movement.high | Hareket Canavarı (16) | **Koşu Bandı Kıskandı** (19) | Durmayan Adımlar (16) | Klişe yerine kişileştirme |
| basic.social.low | Sessiz Mod Uzmanı (17) | **Sessize Alınmış Hafta** (21) | Gürültüsüz Bir Hafta (20) | "Mod" biter, telefon esprisi kalır |

Not: "vites" imgesi 3 yerde önerildi (Bir Vites Yukarı/Aşağı, Ara Vites Cüzdan, bildirim B); Batuhan hangisini seçerse seçsin aynı imge 2 yerden fazla kullanılmasın. Aynı şekilde "Hem ... Hem ..." iki yerde ve "Kapalı" üç yerde geçiyor; seçim yapılırken envantere bakılmalı.

### 5.2 Satırlar (seviye/kategori değişmez; hepsi <= 46, rakamsız)

| ID | Şu an | Seçenek A (say.) | Seçenek B (say.) | Gerekçe |
|---|---|---|---|---|
| mov.med.2 | Orta karar hareket, akıllıca bir seçimdi. | **Hareketin bu hafta orta şekerli geçti.** (38) | Bacakların bu hafta vites değiştirmedi. (38) | "Orta karar/akıllıca" biter; "orta şekerli" yerel deyim |
| mov.med.3 | Ne çok koştun ne hiç durdun, dengeliydin. | **Ne çok koştun ne hiç durdun, arada yürüdün.** (43) | (bkz. A) | "Dengeliydin" dolgusu gider |
| mov.high.2 | Enerjin taşmış, hareket resmen sende bu hafta. | **Adım sayar bu hafta ter döktü.** (30) | Ayakkabıların bu hafta izin görmedi. (36) | Anlam netleşir; enerji varsayımı gider |
| sleep.low.2 | Gece yarıları senin mesai saatin gibiydi. | **Bu hafta gece yarıları seni yatakta bulamadı.** (45) | (mevcut kalabilir; mesai varsayımı hafif) | Çalışma varsayımı gider |
| sleep.med.3 | Ilımlı bir uyku haftası geçirdin. | **Yastıkla aranız bu hafta ne soğuk ne sıcak.** (43) | Uykun bu hafta tam ortadan geçti. (33) | Kişileştirme; soğukluk biter |
| sleep.high.2 | Bu hafta uyku konusunda zirvedeydin. | **Yastığın bu hafta senden hiç şikâyetçi olmadı.** (44) | Bu hafta uykuyla arandaki mesafe hiç açılmadı. (46) | "Zirve/konusunda" dolgusu gider |
| spend.low.3 | Bu hafta harcama konusunda çekingendin. | **Bu hafta cüzdana pek uğramadın.** (30) | Harcamalar bu hafta kapıdan bakıp geçti. (40) | "Çekingen" varsayımı gider |
| spend.med.1 | Ne cimri ne çılgın, tam kararında harcadın. | **Harcamalar bu hafta ortada bir yerde buluştu.** (45) | Cüzdan bu hafta yolun tam ortasından gitti. (42) | "Cimri" ve "tam kararında" gider |
| spend.med.3 | Harcaman ne kısıtlı ne bol, dengeliydi. | **Cüzdanın bu hafta gündelik tempoda çalıştı.** (43) | (bkz. spend.med.1 B) | "Kısıtlı" yoksulluk çağrışımı biter |
| spend.high.3 | Bu hafta harcama konusunda cömert taraftaydın. | **Cüzdanın bu hafta nefes almaya vakit bulamadı.** (46) | Harcamalar bu hafta ön sıraya oturdu. (37) | "Cömert" varsayımı biter |
| social.low.3 | Bu hafta içine dönük bir hafta geçirdin. | **Bu hafta telefonun rehberi biraz tozlandı.** (41) | Sosyal takvimin bu hafta beyaz sayfa gibiydi. (45) | Kişilik etiketi biter |
| social.med.2 | Sosyallik dozun tam kıvamındaydı bu hafta. | **Sosyal ses ayarın bu hafta ortadaydı.** (36) | (mevcut değil) | "Tam kıvamında" ve "doz" biter |
| social.high.3 | Bu hafta etrafın seninle şenlendi. | **Bu hafta takvimin senden çok yoruldu.** (36) | (mevcut kalabilir) | Daha canlı |

"Orta şekerli" (Türk kahvesi) tek bir kategoride kullanılmalı; diğer kategorilere yayılırsa yeni kalıp olur.

### 5.3 Özetler

| Kova | Şu an | Öneri (yeni; say.) | Gerekçe |
|---|---|---|---|
| firstCard (yeniden adlandır: "geçen hafta verisi yok") | İlk karnen bu, kıyaslayacak geçmiş hafta yok. | 1) **Kıyas yok, bu hafta senin başlangıç çizgin.** (44) 2) Geçen haftadan kıyaslık veri yok, bu hafta tertemiz. (53) 3) Karşılaştıracak geçen hafta yok, sayfa yeni açıldı. (51) | Geri dönene de doğru; "ilk karnen" iddiası yok |
| allStable | Bu hafta her şey geçen haftayla aynı çizgide gitti. | 1) **Geçen haftayla neredeyse aynı çizgidesin.** (40) 2) Bu hafta geçen haftanın fotokopisi gibi. (39) | "Her şey" iddiasından çıkar |
| risingMajority (yalnız "yükselen > düşen" için; bkz. 6.3'te ayrım) | Bu hafta çoğu kategori geçen haftadan güçlüydü. | 1) **Geçen haftaya göre bazı şeyler hız kazandı.** (41) 2) Bu hafta geçen haftadan daha dolu geçti. (40) 3) Bu hafta vites bir kademe yükseldi. (34) | "Çoğu" ve "güçlü/güzel" değer dili gider; 1 yükselenle de doğru |
| fallingMajority | Bu hafta çoğu kategori geçen haftadan biraz düştü. / ...sakin bir dinlenme haftası. | 1) **Geçen haftaya göre bazı şeyler yavaşladı.** (40) 2) Bu hafta geçen haftadan daha hafif geçti. (41) 3) Bu hafta vites bir kademe düştü. (32) | "Dinlenme" varsayımı ve "düştü" olumsuzluğu gider |
| balancedMixed | Karışık bir hafta, kimi yükseldi kimi düştü. / terazi | Değişmesin (doğru, yargısız) | |
| partialData | (ölü) | Yeni "dönüş" kovasına devir (6.3) | |

---

## 5.4 Etiketler (check-in düğmeleri, `CATEGORY_LEVEL_LABELS_TR`)

| Kategori | Şu an | Öneri | Not |
|---|---|---|---|
| Hareket | durgun / hafif / yoğun | Değişmesin | Yoğunluk dili, tamam |
| Uyku | kötü / idare / iyi | **kısa / orta / uzun** | Emoji (uykulu/huzurlu/uyuyan) ve kart satırları miktar anlatıyor; "iyi/kötü" kuralı düzelir. Alternatif: az / orta / bol |
| Harcama | az / orta / çok | Değişmesin | |
| Sosyal | yalnız / ölçülü / kalabalık | **sakin / orta / kalabalık** | "Yalnız" damgalayıcı; "ölçülü" normatif |
Erişilebilirlik etiketi ("Uyku: kısa") ve seçili seviye yazısı ("Uyku · kısa") otomatik uyar; testlerin bu sözcüklere bağlı olup olmadığı mühendis tarafından kontrol edilmeli (test dosyasına ben dokunmadım).

---

## 6. İçerik havuzu büyütme önerisi

### 6.1 Önceliklendirme mantığı

Varsayılan paylaşımda görünen: unvan (bazen), hareket satırı, sosyal satırı, özet. Reveal ekranında herkes 4 satırı görür. Sıra: (1) özet, (2) hareket + sosyal satırları, (3) kategori-nötr/görünür unvanlar, (4) uyku + harcama satırları, (5) yeni durumlar.

### 6.2 Hedef havuz

| Havuz | Şu an | Hedef | Yeni | Öncelik |
|---|---|---|---|---|
| Satırlar (hareket x3 seviye) | 9 | 15 (hücre başına 5) | +6 | 2 |
| Satırlar (sosyal x3 seviye) | 9 | 15 | +6 | 2 |
| Satırlar (uyku x3, harcama x3) | 18 | 30 | +12 | 4 |
| **Orta seviye hücreleri** (4 hücre) | 12 | 20 | (yukarıdakilere dahil) | En zayıf/en sık: önce yaz |
| Özet (canlı kovalar) | 10 canlı + 2 ölü | 8 kova x 3-4 = ~28 | +18 | 1 |
| Unvan (12 temel + allMedium) | 13, tekil | her biri 2 varyant | +13 | 3 |
| Kategori-nötr unvan | ~7 | ~16 | +9 | 3 (2.4-A seçilirse) |
| **Toplam yeni metin** | | | ~64 | |

### 6.3 Yeni durumlar (metin ihtiyacı + gereken veri)

| Durum | Koşul | Metin türü | Değişiklik gereği |
|---|---|---|---|
| Yükselen ayrımı | 1 yükselen vs "çoğu" | `risingSlight` / `risingBig` (>=3) ayrımı; aynısı düşen için | `classifySummaryBucket` + tip; **mantık düzeltmesi M-3** |
| Tam hafta | 7/7 gün dolu (seviyeden bağımsız) | Özet + 1-2 unvan: "Hiç boş bırakmayan hafta" | Var olan `checkinDays`; yeni kova |
| Geri dönüş | Geçen hafta < 2 gün, ama daha önce açılmış kart var | Özet: "Bir haftalık ara verildi, kıyas yeniden başlıyor" tonunda, suçlamasız | `hasAnyPriorCard` bilgisi `buildCard`'a taşınmalı (imza değişir) |
| İlk kart | Zaten var | 3 varyant | Metin |
| Seri (üst üste kartlı hafta) | Ardışık kart sayısı | Rakamsız: "Kartların üst üste dizildi." | `weekly_card`'dan sayım; ayrı intent önerilir (kapsam genişlemesi) |
| Aynı unvan tekrar (2 hafta arayla) | Unvan varyantı | Unvan varyantları çözer | `TITLE_VARIANTS` yapısı |
| Eşik haftası (yalnız gereken kadar gün) | 3 veya 4 dolu gün | **Önerilmez** (utandırma riski) | |
Suçlama riski taşıyan durumlar (az gün, kaçırılan hafta) için metin yazılmaz; yalnızca betimleyen ("kıyas yok") metin.

### 6.4 Testlerle uyum

Mevcut test kuralları (`__tests__/domain/copy.test.ts` + `titles.test.ts`, okundu, çalıştırılmadı): her (kategori, seviye) >= 3 varyant, her özet kovası >= 2 varyant, tüm statik metinler <= 60 ve rakamsız, üretilen metinlerde aynı denetim, 52 hafta zincirinde hiçbir varyant %70'i geçmez, ardışık haftada aynı varyant çıkmaz, 81/81 kapsama.

| Değişiklik | Testle uyum | Ek iş |
|---|---|---|
| Hücre başına 3 -> 5 satır | Uyumlu (`>= 3`, dağılım ve ardışık testleri genelleşir; `pickFromPool` daha çok varyantla daha az tekrar eder) | Yok |
| Mevcut satır/özet/unvan metnini değiştirme | Uyumlu (<=60, rakamsız) | `CONTENT_VERSION` 1 -> 2 |
| Yeni özet kovası (`streakFull`, `returning`, `risingSlight`...) | `SummaryBucket` tipi, `classifySummaryBucket` ve testleri güncellenmeli | mobile-engineer + qa-engineer (test dosyası benim değil) |
| `TITLE_VARIANTS` (unvana varyant) | 81/81 kapsama testi korunur; ardışık-tekrarsızlık için unvan seçimi `pickFromPool` benzeri olmalı; yeni dağılım testi | mobile-engineer + qa-engineer |
| `partialData` kovasını kaldırmak/yeniden kullanmak | "Her kova >= 2 varyant" testi kaldırılan kovayı bilmeli | qa-engineer |
| Kategori-nötr işareti / `publicTitle` | Domain sözleşmesi (`CardSnapshot`, `weekly_card` şeması) değişir; güvenlik gereksinimi 3 ile birlikte gözden geçirilmeli | software-architect + security-reviewer |
| Ardışık tekrarsızlık için satır kimliği | `prevVariants` wiring'i zaten `openOrBuildCard`'da; yalnız o yol çalışır | Yok |
Kapsama kaydı: yeni satırlar `lines()` yardımcısıyla `line.<kategori>.<seviye>.<n>` kimliği alır; `line-level.ts` seviyeyi kimlikten ayrıştırdığı için **kimlik biçimi bozulmamalı**.

---

## 7. Mağaza ve site metni tutarlılığı, politika riski

### 7.1 Tutarlılık

| # | Bulgu | Etki | Öneri |
|---|---|---|---|
| S-1 | Adlar: Play "Haftik: Haftalık Emoji Kartı", App Store "Haftik: Emoji Check-in", site başlığı "Haftik: haftalık hayat karnen", onboarding "karne", arayüz "kart", anahtar kelime "karne" | Üç ad, iki sözcük dağarcığı | 1.5'teki tek dağarcık; "check-in" yerine "işaretle" |
| S-2 | Mağaza "hesap yok, **kayıt yok**, reklam yok" | "Kayıt" = üyelik mi veri kaydı mı? Uygulama check-in kaydediyor | "Hesap yok, üyelik yok, reklam yok" |
| S-3 | Mağaza metni "yargılamaz" diyor; uygulamada uyku düğmesi "kötü/iyi", kartta "Neredeyse Kusursuz/güzel bir yükseliş" | Söz-ürün çelişkisi (yanıltıcı beyan riski) | 5.1-5.4 düzeltmeleri |
| S-4 | Mağaza "tıbbi değerlendirme yapmaz" derken kartta "Zinde ve Dinlenmiş", "Uykusuz", "Yorgun" | Sağlık durumu çıkarımı; Health apps beyanıyla tutarsızlık | Bu unvanları değiştir (5.1) |
| S-5 | Mağaza "uyku" yerine "dinlenmen" diyor; uygulama, ekran görüntüsü ve site "Uyku" diyor | Mağaza metni ile ekran görüntüsü uyuşmuyor | Belge zaten uyarıyor (S12 karar 1); seviye etiketi düzeltmesi (5.4) yargı riskini azaltır |
| S-6 | Mağaza/site "iki satır varsayılan gizli" diyor; unvanın da gizlenebildiği (çoğu kez "???" olduğu) hiçbir yerde yok | Beklenti sapması: kullanıcı "dört esprili satır" bekler | Tam açıklama ve site: "Gizlenen satırlar (ve ona bağlı unvan) kartta ??? görünür." |
| S-7 | "Her hafta yeni bir unvan" (kare 6) | Yalnız ardışık haftada garanti; tek metinli unvanlar tekrar edebilir | "Her hafta farklı bir unvan şansı" ya da unvan varyantları (6.2) |
| S-8 | "Günde 8 sn" (Play kısa açıklama), onboarding "8 saniye" | Ölçülmedi (S6 kronometre karşılanamadı) - kanıtsız iddia | Ölçene kadar "birkaç saniye". Kısa açıklama alternatifi: "Günde birkaç saniye emoji işaretle, Pazar 20:00'de paylaşılabilir haftalık kartını aç." (81; Play sınırı 80 - **aşıyor**, kısalt: "Birkaç saniye emoji işaretle, Pazar 20:00'de haftalık kartını aç." 65) |
| S-9 | Sitede örnek kart görseli yok | Ürünün tek "wow" varlığı sitede gösterilmiyor | Kart PNG'si (uyku/harcama "???") sitede ve ekran görüntüsü 1'de |
| S-10 | Tam açıklama başlıkları BÜYÜK HARF | Play "BÜYÜK HARF spam" denetimi kendi kontrol listesinde; düşük risk | Küçük harfli başlık |
| S-11 | Gizlilik sayfası bildirim metinlerini alıntılıyor ("Bugün nasıldı?", "Karnen hazır") | Metin değişirse sayfa eskir | Alıntıyı kaldır ya da bildirim değişince güncelle |

### 7.2 Politika/yanıltma riski

| # | Risk | Ağırlık | Not |
|---|---|---|---|
| R-1 | Site "**ağ isteği yapmaz**", "internet üzerinden veri göndermez ve sunucudan veri almaz" derken Android izinlerinde INTERNET var; FCM/merged manifest doğrulaması yok (CLAUDE.md OPS/S10); S12 belgesi kendisi "internet kullanmaz" cümlesini bilinçli yazmıyor | **Yüksek** (yanlış beyan, Data safety ile çelişki) | Doğrulama (G-01/G-02/G-09) bitene kadar: "Uygulama, kişisel verini bir sunucuya göndermeyecek şekilde tasarlandı; hesap, reklam ve analitik yok." |
| R-2 | Kart damgası/paylaşım mesajı `[mağaza bağlantısı]` | Yüksek (bozuk görünüm, PNG'de kalır) | 4.5 |
| R-3 | Settings "Gizlilik politikası (yakında)" + Alert | Yüksek (Play politika URL'si zorunlu) | 4.4 |
| R-4 | "Kayıt yok" belirsizliği | Orta | S-2 |
| R-5 | Kart dili ile "tıbbi değerlendirme yapmaz" vaadi | Orta | S-4 |
| R-6 | Health apps beyanı, 18+ (Batuhan S12 kararları işlendi) | Bilgi | Etiket düzeltmesi (5.4) beyanı hafifletmez ama "yargı yok" sözünü doğrular |
| R-7 | Anahtar kelime "karne" mağaza metninde kullanılmıyor, App Store anahtar listesinde var | Düşük | Sözcük dağarcığı kararına bağlı |
| R-8 | Marka/kişi taklidi | Yok | "Wrapped" gibi ad yok; yeni önerilerde de yok |

Yerel doğrulama (ikinci okuma) notu: Play kısa açıklama "Günde 8 sn ..." 77, App Store adı 22, alt başlık 28, anahtar kelime 99 belgedeki sayılarla el sayımımda tutuyor. Play başlığı "Haftik: Haftalık Emoji Kartı" 28 (limit 30).

---

## Doğrulanmadı / sınırlar

- Tüm karakter sayıları elle (2 kez) sayıldı; `node -e` çalıştırılamadı (bu oturumda kabuk aracı yok). Yayın öncesi 5. bölümdeki komutla toplu sayım şart.
- 2.4'teki "65/81" sayısı `titles.ts` kural sırasının el simülasyonudur (7/7, ilk kart, sıçrama/düşüş hariç); gerçek kullanıcı dağılımı bilinmiyor. Kısa bir sayım betiği (mühendis) kesinleştirir.
- "Partial data ölü" iddiası `computeDelta` kaynak okumasından; test ile kanıtlanmadı.
- "Geçen haftanın açılmamış kartı" akışı yalnızca `week.tsx` okumasına dayanıyor; başka bir giriş yolu olabilir.
- 2 satırlı unvan sığması ve "Pazartesiden Pazara Tam Gaz" gibi uzun sözcüklerin 296 px'e sığması cihazda ölçülmedi.
- Türkçe ikinci okuma: yalnızca bu denetimi yazan tarafından; "kumbaracı" TDK anlamı ve "orta karar" çağrışımı bilgiye dayanır (sözlükte teyit edilmedi).
- Mizah öznel: her öneri seçenek + gerekçe olarak sunuldu, karar Batuhan'ındır. Kod, test, `app.json`, `tr.ts` DEĞİŞTİRİLMEDİ; uygulama mobile-engineer + qa-engineer'a devredilir.

## Devir

- `mobile-engineer` + `qa-engineer`: 6.4 tablosu (yeni kovalar, `TITLE_VARIANTS`, `CONTENT_VERSION`, etiket değişikliği ve testleri, `partialData` doğrulaması, 65/81 sayım betiği).
- `ui-ux-designer`: önizleme ekranı açıklama satırı ve simge anlamı (4.5), hata/başarı geri bildirimi (4.2).
- `security-reviewer` + `software-architect`: 2.4 seçenek A/B/C (unvan gizleme ve gizlilik gereksinimi 3).
- `privacy-compliance-analyst` + `release-manager`: 7.2 R-1/R-3, site/mağaza cümleleri.
- Batuhan: ses (1.2), "karne mi kart mı" (1.5), 2.4'te hangi çözüm, hangi alternatifler, "8 saniye" iddiası.

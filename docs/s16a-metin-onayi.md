# S16a — Metin onayı (Batuhan için inceleme sayfası)

> Kapsam: seviye kelimeleri (A14), içerik paketi (A15: "Kart" adlandırması, zamansızlaştırma, "vites" rezervi,
> "8 saniye" -> "birkaç saniye"), 02'nin zayıf metinleri + M-2/M-3/M-4, banka kartı sesteşliği, bildirim metinleri,
> `CONTENT_VERSION` 2. Kaynak taslaklar: `docs/inceleme-2026-09-25/19-metin-ve-icerik-v2.md`, `02-icerik-metin-denetimi.md` §5.
> **Bu metinler copywriter taslağıdır; son söz Batuhan'ın.** Beğenmediğin satırı "Eski -> Yeni" tablosundan işaretle ya da
> doğrudan `src/domain/content/tr.ts` / `notification-texts.ts` içinde değiştir; `npm test` (içerik lint'i) kuralları
> (yasak sözcük, zaman zarfı, kota, uzunluk) kendiliğinden denetler.
> Commit'ten önce: bu belgeyi oku, değiştirmek istediklerini söyle ya da değiştir. Onayladıysan "Onay" satırını doldur.

**Onay:** ☒ Olduğu gibi onaylıyorum  ☐ Şu satırlar değişsin: —  (Batuhan, 2026-10-04; commit `0aea7ae` sonrası sohbette onaylandı)

## 1. Ne değişti, neden (kısa)

1. **Zamansızlaştırma:** kart içinde "bu hafta" yok. Kart Albüm'den, geçen haftanın kartı olarak ya da aylar sonra
   tekrar paylaşılabilir; "bu hafta" o zaman yanlış olur. Yalnızca kartın iç kıyası ("geçen haftaya göre") kaldı.
2. **Yargı/damga/tıbbi dil gitti:** kahraman, yıldız, şampiyon, usta, cömert, cimri, tutumlu, çekingen, yorgun,
   uykusuz, zinde, dinlenmiş, kusursuz, performans, "mod", "kumbaracı", "tam kıvamında" ... (yasak liste 19 §4.2).
3. **"Kart" sesteşliği:** "Kartın Kahramanı" ve "Kartın ... ısınmadı/mesai yaptı" gibi banka kartı okunan metinler gitti.
4. **Seviye kelimeleri:** uyku kötü/idare/iyi -> **kısa/orta/uzun**; sosyal yalnız/ölçülü/kalabalık -> **sakin/orta/kalabalık**.
5. **"Vites" imgesi** havuzdan çıktı (A15: yalnızca ileride eklenecek "büyük yükseliş/düşüş" özet kovalarında).
6. **Özetler** her tetiklenme durumunda doğru: "çoğu kategori" iddiası yok, geri dönen kullanıcıya "ilk kartın" denmiyor,
   değer dili (güçlü/güzel) ve seviye sözcükleri yok.
7. **Cüzdan 5, yastık/battaniye 4, kanepe 2** kotası içinde; "resmen" 1, "orta şekerli" 1, "telefon rehberi" 1.

## 2. Unvanlar (40) — Eski -> Yeni

| Kural | Eski | Yeni |
|---|---|---|
| combo.allMedium | Ne Az Ne Çok Ustası | Ne Az Ne Çok Haftası |
| combo.allFourHigh | Tam Gaz Hafta | Tam Gaz Hafta |
| combo.allFourLow | Dinlenme Modu Sonuna Kadar Açık | Sessiz Sedasız Bir Hafta |
| combo.threeHighOneLow | Neredeyse Kusursuz | Neredeyse Tam Gaz |
| combo.threeLowOneHigh | Tek Kişilik Ordu | Tek Kişilik Ordu |
| combo.sevenSevenHighStreak | Tam Hafta, Tam Performans | Hiç Boş Bırakmayan Hafta |
| combo.lowStreakSeven | Sessiz Serinin Sadık Ustası | Yavaş Çekimde Bir Hafta |
| combo.firstCardStrongStart | Daha İlk Haftadan Parlayan Yıldız | İlk Haftadan Sahnede |
| combo.bigLeapUp | Haftanın Sıçrama Şampiyonu | Geçen Haftayı Sollayan |
| combo.bigDrop | Yumuşak İniş Uzmanı | Yavaşlayan Hafta |
| combo.movementSleepBothHigh | Zinde ve Dinlenmiş Kahraman | Hem Koşan Hem Yatan |
| combo.movementSleepBothLow | Düşük Pil Modu | Kısa Gece, Sakin Adım |
| combo.spendingSocialBothHigh | Parti ve Alışverişin Yıldızı | Parti Var, Poşet Var |
| combo.spendingSocialBothLow | Kumbaracı Ev Kuşu | Kapı da Cüzdan da Kapalı |
| combo.movementSpendingBothHigh | Enerjik Harcama Ustası | Koşup Harcayan Hafta |
| combo.movementSpendingBothLow | Sakin Bütçe Sakini | Yavaş Adım, Kapalı Cüzdan |
| combo.movementSocialBothHigh | Koşan Sosyalite | Koşan Sosyalite |
| combo.movementSocialBothLow | Ev Modunda Bir Hafta | Kapıdan Az Çıkan Hafta |
| combo.sleepSpendingBothHigh | Rahat Uyuyan Cömert | Bol Uyku, Bol Harcama |
| combo.sleepSpendingBothLow | Yorgun ve Tutumlu | Kısa Gece, Boş Sepet |
| combo.sleepSocialBothHigh | Dinlenmiş Sosyal Yıldız | Yastıktan Kalabalığa |
| combo.sleepSocialBothLow | Sessiz Nöbetçi | Sessiz Nöbetçi |
| combo.movementHighSleepLow | Koşan Ama Uykusuz Kahraman | Gece Kısa, Adım Uzun |
| combo.sleepHighMovementLow | Konforun Kalesi | Konforun Kalesi |
| combo.spendingHighSocialLow | Sessiz Ama Cömert | Sessiz Ev, Hareketli Kasa |
| combo.socialHighSpendingLow | Tutumlu Sosyalite | Kalabalıkta Cüzdan Cepte |
| combo.movementHighSpendingLow | Sporcu Cüzdan Koruyucusu | Adım Çok, Fiş Yok |
| combo.sleepHighSocialLow | Yastıkla Baş Başa | Yastıkla Baş Başa |
| basic.movement.low | Kanepe Filozofu | Kanepe Filozofu |
| basic.movement.medium | Dengeli Adımcı | Dengeli Adımcı |
| basic.movement.high | Hareket Canavarı | Koşu Bandı Kıskandı |
| basic.sleep.low | Gece Nöbetçisi | Gece Nöbetçisi |
| basic.sleep.medium | Dengeli Uyuyucu | Ortada Bir Yastık |
| basic.sleep.high | Yastık Şampiyonu | Yastığın Sadık Dostu |
| basic.spending.low | Cüzdan Koruyucusu | Fişlerden Uzak Hafta |
| basic.spending.medium | Ölçülü Harcamacı | Cüzdan Orta Hızda |
| basic.spending.high | Kartın Kahramanı | Cüzdan Mesaide |
| basic.social.low | Sessiz Mod Uzmanı | Sessize Alınmış Hafta |
| basic.social.medium | Dengeli Sosyalite | Dengeli Sosyalite |
| basic.social.high | Sosyal Kelebek | Sosyal Kelebek |

## 3. Satırlar (36) — Eski -> Yeni (hepsinden "bu hafta" çıktı)

| Hücre | Eski | Yeni |
|---|---|---|
| hareket · durgun | Bacakların bu hafta izne çıkmış resmen. | Bacakların izne çıkmış resmen. |
| | Kanepe bu hafta seni pek bırakmadı. | Kanepe seni pek bırakmadı. |
| | Adımların bu hafta grev ilan etti. | Adımların grev ilan etti. |
| hareket · hafif | Ne maraton ne mola, tam ortası bir tempo. | (aynı) |
| | Orta karar hareket, akıllıca bir seçimdi. | Hareketin orta şekerli geçti. |
| | Ne çok koştun ne hiç durdun, dengeliydin. | Ne çok koştun ne hiç durdun, arada yürüdün. |
| hareket · yoğun | Bacakların bu hafta durmak bilmedi. | Bacakların durmak bilmedi. |
| | Enerjin taşmış, hareket resmen sende bu hafta. | Adım sayar ter döktü. |
| | Adımların bu hafta hız sınırını zorladı. | Adımların hız sınırını zorladı. |
| uyku · kısa | Yastığın bu hafta seni pek göremedi. | Gece yarıları seni yatakta bulamadı. |
| | Gece yarıları senin mesai saatin gibiydi. | Uyku sana biraz küstü galiba. |
| | Uyku bu hafta sana biraz küstü galiba. | Gece yarıları seni hep ayakta yakaladı. |
| uyku · orta | Ne baykuş ne tarla kuşu, ortada bir haftaydın. | (aynı) |
| | Uykun ne az ne çok, dengeli geçti. | Uykun ne erken bitti ne geç kalktı. |
| | Ilımlı bir uyku haftası geçirdin. | Uykun tam ortadan geçti. |
| uyku · uzun | Yastığınla resmen kader birliği yaptınız. | Uykunla arandaki mesafe hiç açılmadı. |
| | Bu hafta uyku konusunda zirvedeydin. | Gece erken kapandı, sabah geç açıldı. |
| | Uyku bankasına bol para yatırdın bu hafta. | Uyku hesabına hep para yatmış. |
| harcama · az | Cüzdanın bu hafta minik bir tatil yaptı. | Harcamalar kapıdan bakıp geçti. |
| | Kartın bu hafta neredeyse hiç ısınmadı. | Kasa fişleri seyrek uğradı. |
| | Bu hafta harcama konusunda çekingendin. | Alışveriş sepeti hep boş kaldı. |
| harcama · orta | Ne cimri ne çılgın, tam kararında harcadın. | Harcamalar ortada bir yerde buluştu. |
| | Cüzdan bu hafta ölçülü bir tempo tuttu. | Alışveriş sepeti orta hızda dolup boşaldı. |
| | Harcaman ne kısıtlı ne bol, dengeliydi. | Harcamalar ne fazla taştı ne hiç akmadı. |
| harcama · çok | Kartın bu hafta epey mesai yaptı. | Fişler art arda dizilmiş gibiydi. |
| | Cüzdanın bu hafta hatırı sayılır bir tur attı. | Kasa ışıkları senin için sık sık yandı. |
| | Bu hafta harcama konusunda cömert taraftaydın. | Harcamalar ön sıraya oturdu. |
| sosyal · sakin | Sosyal takvimin bu hafta sakin kaldı. | Telefon rehberin biraz tozlanmış. |
| | Sosyal hayatın bu hafta sessiz moddaydı. | Sosyal takvimin beyaz sayfa gibiydi. |
| | Bu hafta içine dönük bir hafta geçirdin. | Mesaj kutun uzun süre sessiz kaldı. |
| sosyal · orta | Ne kalabalık ne yalnız, ortada bir haftaydın. | Sosyal ses ayarın ortadaydı. |
| | Sosyallik dozun tam kıvamındaydı bu hafta. | Çevrenle bağların ne sıkı ne gevşekti. |
| | Bu hafta sosyal hayatın dengeliydi. | Ne kalabalık ne tenha, ortalama bir düzen. |
| sosyal · kalabalık | Bu hafta çevrende adeta bir kutlama vardı. | Takvimin senden çok yoruldu. |
| | Sosyal pilin bu hafta hiç bitmedi. | Mesaj kutun hiç sessiz kalmadı. |
| | Bu hafta etrafın seninle şenlendi. | Takvimin baştan sona doluydu. |

(Not: satır kimlikleri `line.<kategori>.<seviye>.<n>` aynı kaldı; her satır eski karşılığıyla aynı sırada. Yalnızca metinler değişti.)

## 4. Özetler (12) — Eski -> Yeni

| Kova | Eski | Yeni |
|---|---|---|
| firstCard | İlk karnen bu, kıyaslayacak geçmiş hafta yok. | Kıyaslayacak önceki hafta yok, sayfa yeni açıldı. |
| | Bu ilk kartın, önceki haftayla kıyas henüz yok. | Başlangıç çizgisi bu, kıyas sonraki haftalarda. |
| allStable | Bu hafta her şey geçen haftayla aynı çizgide gitti. | Geçen haftayla neredeyse aynı çizgidesin. |
| | Değişim yok, geçen haftanın aynı temposundaydın. | Geçen haftanın fotokopisi gibi bir hafta. |
| risingMajority | Bu hafta çoğu kategori geçen haftadan güçlüydü. | Geçen haftaya göre bazı şeyler hız kazandı. |
| | Genel gidişat yukarı yönlü, güzel bir yükseliş. | Geçen haftadan daha dolu bir hafta. |
| fallingMajority | Bu hafta çoğu kategori geçen haftadan biraz düştü. | Geçen haftaya göre bazı şeyler yavaşladı. |
| | Genel gidişat aşağı yönlü, sakin bir dinlenme haftası. | Geçen haftadan biraz daha yavaş akmış. |
| balancedMixed | Karışık bir hafta, kimi yükseldi kimi düştü. | (aynı) |
| | Bu hafta terazi hem sağa hem sola salındı. | Terazi hem sağa hem sola salındı. |
| partialData (ulaşılmaz kova, M-4) | Bazı kategorilerde geçen haftayla kıyas henüz yok. | Bazı alanlarda geçen haftayla kıyas yok. |
| | Karşılaştırma için bazı kategoriler henüz ısınıyor. | Bazı alanlarda kıyas için henüz erken. |

## 5. Diğer kullanıcıya dönük metinler

| Yer | Eski | Yeni |
|---|---|---|
| Check-in etiketleri: uyku | kötü / idare / iyi | **kısa / orta / uzun** |
| Check-in etiketleri: sosyal | yalnız / ölçülü / kalabalık | **sakin / orta / kalabalık** |
| Karşılama başlığı | Her gün 8 saniye. Her pazar bir karne. | Günde dört emoji, Pazar akşamı bir kart. |
| Karşılama gövdesi | Hareket, uyku, harcama, sosyal: haftanı emojiyle anlat, pazar akşamı sonucu gör. | Hareket, uyku, harcama, sosyallik: haftanı emojiyle anlat. Pazar akşamı esprili bir kart açılır; paylaşmak istersen paylaşırsın. |
| Paylaşım mesajı | Haftalık karnem hazır! | Haftalık kartım hazır! |
| Bildirim: kart hazır | Karnen hazır / Bu haftanın kartı seni bekliyor. | Haftanın kartı hazır / Bugünü de işaretlediysen kart seni bekliyor. |
| Bildirim: günlük (4 varyant, haftanın gününe göre sabit) | Bugün nasıldı? / Birkaç saniyede bugünü işaretleyebilirsin. (tek) | 1) Bugün nasıldı? · 2) Bugünün emojisi hangisi? · 3) Sayfa seni bekliyor. · 4) Günün emoji özeti zamanı. |
| Rapor metni (Batuhan okur) | "check-in" | "işaretleme" |
| Site başlığı/giriş | Haftalık hayat karnen / karne kartı / karnesi / Yaklaşık 8 saniye | Haftalık emoji kartın / Haftanın kartı / kartı / Birkaç saniye sürer |
| Mağaza (Play + App Store) | "8 sn/8 saniye", "check-in", anahtar kelime "karne", App Store adı "Emoji Check-in" | "birkaç saniye", "işaretleme", anahtar kelime "kart", App Store adı "Haftik: Haftalık Emoji Kartı" (karakter sayıları komutla doğrulandı) |
| Davet mesajı (s12) | Günde 8 saniye ... 8 saniye sürer | Günde birkaç saniye ... birkaç saniye sürer |

## 6. Senin kararını bekleyen noktalar

1. **Gizli çıkartma alt yazısı ("bilerek saklandı", A15):** kartta şu an gizli yer tutucu `???` (spec güvenlik gereksinimi).
   "Gizli çıkartma" görünümü C yönü çizimiyle (S19) gelecek; metin orada uygulanacak. Şimdi değiştirmedim.
2. **"Tam Gaz" iki unvanda** (allFourHigh, threeHighOneLow): kota yok ama tekrar hissi veriyorsa birini değiştirelim.
3. **Seviye kelimesi alternatifi:** sosyal için "sakin" yerine "tenha" (19 §3.1 B) daha nötr ama daha az günlük; uyku için
   "az/orta/bol" alternatifi var. Şimdilik A seçenekleri.
4. **Gizlilik sayfası (`site/gizlilik.html`)**: iki gerçek düzeltme yapıldı — bildirim örneği artık "Haftanın kartı hazır" ve
   "paylaşımdan sonra silinmeye çalışılır" cümlesi S16b gerçeğine uyduruldu ("en geç bir saat sonra, uygulama yeniden
   açıldığında ya da Tüm verilerimi sil dediğinde silinir"). Bu sayfa K10 (hukuki görüş) kapısındadır; hukuki görüş
   alınırken güncel hâliyle verilmeli.
5. **Onboarding gizlilik/izin gövdeleri değişmedi** (19 §3.3 önerileri: "Telefonu değiştirirsen veriler yeni telefona geçmez",
   izin metni, 18 yaş notu, ÖRNEK kart): "veri" sözcüğü ve yeni ekranlar S19+ kapsamında; istersen ayrı bir turda yaparım.
6. **`app.json` `version` hâlâ 1.0.0** (plandaki ilk dış sürüm 0.1.0).
7. **Dondurulmuş eski kartlar** (`content_version` 1) eski metinle kalır; yeni kartlar sürüm 2 ile üretilir.

# İçerik inceleme listesi (K8) — Haftik

Kaynak: `src/domain/content/tr.ts` (CONTENT_VERSION 1). Toplam: **40 unvan, 36 satır, 12 özet**.
Bu belge yalnızca okumayı kolaylaştırır.

> **Güncelleme (2026-09-23):** Aşağıdaki tablolar ilk taslağı gösterir. Ton notlarında işaretlenen 12 metin
> Batuhan'ın talimatıyla Claude'un seçtiği alternatiflerle `tr.ts`'te değiştirildi (9 unvan, 2 satır, 1 özet):
> Tek Kişilik Ordu, Kumbaracı Ev Kuşu, Sessiz Nöbetçi (eski "Sakin Uykucu Münzevi" uyku-düşük anlamını yanlış
> veriyordu), Yastıkla Baş Başa, Düşük Pil Modu, Ev Modunda Bir Hafta, Konforun Kalesi, Tam Gaz Hafta,
> Sessiz Mod Uzmanı; "Adımların bu hafta hız sınırını zorladı.", "Sosyal takvimin bu hafta sakin kaldı.",
> "Karşılaştırma için bazı kategoriler henüz ısınıyor." Kalan metinleri hâlâ düzeltebilirsin; güncel hâl
> için `src/domain/content/tr.ts` esas alınır.

## Nasıl düzelteceksin

- **"Senin metnin"** sütununa yeni metni yaz (boş bırakırsan mevcut kalır). `sil` yazarsan o metin kaldırılır ama kural/seviye başına en az 3 satır ve 12 temel unvan zorunlu olduğu için silmek yerine yenisini yaz.
- Belgeyi kaydedip "içerik hazır" de; ben `tr.ts`'e işler, testleri çalıştırırım.
- **Kurallar (testler denetler):** her metin en fazla 60 karakter, rakam yok. Unvan kartın en büyük yazısı (2 satıra kadar sığar). Ton: esprili, tanısız, tavsiyesiz, utandırmayan; sağlık/tıbbi iddia yok.
- Satırlar hafta hafta değişir: aynı kategori+seviye için 3 varyant, ardışık haftada aynısı gelmez.
- Kart yalnızca **seviyeyi** anlatır (düşük/orta/yüksek = "iyi/kötü" değil, yoğunluk); satırlar da bunu yansıtmalı.

## Ton notları (benim işaretlerim, katılmak zorunda değilsin)

- **Yargılayıcı okunabilecekler:** "Karanlıkta Parlayan Tek Yıldız" (diğer üçü karanlık demek), "Tutumlu Münzevi", "Sakin Uykucu Münzevi", "Yastık Aşığı Münzevi" ("münzevi" hafif dışlayıcı), "Yorgun Kanepe Sakini".
- **Varsayım yapanlar:** "Bu hafta yalnızlığın tadını çıkarmışsın" (yalnızlığı seçtiğini varsayıyor), "Sessizliğin Ustası".
- **Anlamı zayıf/anlaşılmaz:** "Koşarken bile koşan biri gibiydin", "Kısmi veriyle bir karşılaştırma, tam resim değil" (soğuk ve teknik), "Zirvenin Daimi Sakini".
- **Ad çakışması:** "Sessiz Kanepe Dostu" ile "Yorgun Kanepe Sakini" ve "Yastık Dostu, Kanepe Sakini" birbirine çok benziyor (üç ayrı kural, aynı kanepe esprisi).
- Unvanlar paylaşılan asıl "hook", en çok buraya vakit ayırmanı öneririm.

---

## 1. Unvanlar (40)

### 1a. Kombinasyon / özel kurallar (28, öncelik sırasıyla)

| ID | Ne zaman çıkar | Şimdiki metin | Senin metnin |
|---|---|---|---|
| title.combo.allMedium | dört kategori de orta | Ne Az Ne Çok Ustası | |
| title.combo.allFourHigh | dört kategori de yüksek | Zirvenin Daimi Sakini | |
| title.combo.allFourLow | dört kategori de düşük | Dinlenme Modu Sonuna Kadar Açık | |
| title.combo.threeHighOneLow | üçü yüksek, biri düşük | Neredeyse Kusursuz | |
| title.combo.threeLowOneHigh | üçü düşük, biri yüksek | Karanlıkta Parlayan Tek Yıldız | |
| title.combo.sevenSevenHighStreak | 7 günün 7'si dolu ve yüksek seri | Tam Hafta, Tam Performans | |
| title.combo.lowStreakSeven | 7 günlük düşük seri | Sessiz Serinin Sadık Ustası | |
| title.combo.firstCardStrongStart | ilk kart, güçlü başlangıç | Daha İlk Haftadan Parlayan Yıldız | |
| title.combo.bigLeapUp | geçen haftaya göre büyük sıçrama | Haftanın Sıçrama Şampiyonu | |
| title.combo.bigDrop | geçen haftaya göre büyük düşüş | Yumuşak İniş Uzmanı | |
| title.combo.movementSleepBothHigh | hareket + uyku yüksek | Zinde ve Dinlenmiş Kahraman | |
| title.combo.movementSleepBothLow | hareket + uyku düşük | Yorgun Kanepe Sakini | |
| title.combo.spendingSocialBothHigh | harcama + sosyal yüksek | Parti ve Alışverişin Yıldızı | |
| title.combo.spendingSocialBothLow | harcama + sosyal düşük | Tutumlu Münzevi | |
| title.combo.movementSpendingBothHigh | hareket + harcama yüksek | Enerjik Harcama Ustası | |
| title.combo.movementSpendingBothLow | hareket + harcama düşük | Sakin Bütçe Sakini | |
| title.combo.movementSocialBothHigh | hareket + sosyal yüksek | Koşan Sosyalite | |
| title.combo.movementSocialBothLow | hareket + sosyal düşük | Sessiz Kanepe Dostu | |
| title.combo.sleepSpendingBothHigh | uyku + harcama yüksek | Rahat Uyuyan Cömert | |
| title.combo.sleepSpendingBothLow | uyku + harcama düşük | Yorgun ve Tutumlu | |
| title.combo.sleepSocialBothHigh | uyku + sosyal yüksek | Dinlenmiş Sosyal Yıldız | |
| title.combo.sleepSocialBothLow | uyku + sosyal düşük | Sakin Uykucu Münzevi | |
| title.combo.movementHighSleepLow | hareket yüksek, uyku düşük | Koşan Ama Uykusuz Kahraman | |
| title.combo.sleepHighMovementLow | uyku yüksek, hareket düşük | Yastık Dostu, Kanepe Sakini | |
| title.combo.spendingHighSocialLow | harcama yüksek, sosyal düşük | Sessiz Ama Cömert | |
| title.combo.socialHighSpendingLow | sosyal yüksek, harcama düşük | Tutumlu Sosyalite | |
| title.combo.movementHighSpendingLow | hareket yüksek, harcama düşük | Sporcu Cüzdan Koruyucusu | |
| title.combo.sleepHighSocialLow | uyku yüksek, sosyal düşük | Yastık Aşığı Münzevi | |

> Not: "ne zaman çıkar" sütunu kural adından özetlendi; kesin eşikler `src/domain/titles.ts`'te.
> Yüksek/düşük = o haftanın ortalama seviyesi. Uyku ve harcama varsayılan olarak kartta gizli, bu unvanlar
> gizli bir kategoriye dayanıyorsa kart üzerinde otomatik `???` olur (paylaşımda ipucu vermez).

### 1b. Temel unvanlar (12, kural eşleşmezse garanti)

| ID | Şimdiki metin | Senin metnin |
|---|---|---|
| title.basic.movement.low | Kanepe Filozofu | |
| title.basic.movement.medium | Dengeli Adımcı | |
| title.basic.movement.high | Hareket Canavarı | |
| title.basic.sleep.low | Gece Nöbetçisi | |
| title.basic.sleep.medium | Dengeli Uyuyucu | |
| title.basic.sleep.high | Yastık Şampiyonu | |
| title.basic.spending.low | Cüzdan Koruyucusu | |
| title.basic.spending.medium | Ölçülü Harcamacı | |
| title.basic.spending.high | Kartın Kahramanı | |
| title.basic.social.low | Sessizliğin Ustası | |
| title.basic.social.medium | Dengeli Sosyalite | |
| title.basic.social.high | Sosyal Kelebek | |

---

## 2. Kategori satırları (36 = 4 kategori x 3 seviye x 3 varyant)

### Hareket

| ID | Metin | Senin metnin |
|---|---|---|
| line.movement.low.1 | Bacakların bu hafta izne çıkmış resmen. | |
| line.movement.low.2 | Kanepe bu hafta seni pek bırakmadı. | |
| line.movement.low.3 | Adımların bu hafta grev ilan etti. | |
| line.movement.medium.1 | Ne maraton ne mola, tam ortası bir tempo. | |
| line.movement.medium.2 | Orta karar hareket, akıllıca bir seçimdi. | |
| line.movement.medium.3 | Ne çok koştun ne hiç durdun, dengeliydin. | |
| line.movement.high.1 | Bacakların bu hafta durmak bilmedi. | |
| line.movement.high.2 | Enerjin taşmış, hareket resmen sende bu hafta. | |
| line.movement.high.3 | Koşarken bile koşan biri gibiydin. | |

### Uyku

| ID | Metin | Senin metnin |
|---|---|---|
| line.sleep.low.1 | Yastığın bu hafta seni pek göremedi. | |
| line.sleep.low.2 | Gece yarıları senin mesai saatin gibiydi. | |
| line.sleep.low.3 | Uyku bu hafta sana biraz küstü galiba. | |
| line.sleep.medium.1 | Ne baykuş ne tarla kuşu, ortada bir haftaydın. | |
| line.sleep.medium.2 | Uykun ne az ne çok, dengeli geçti. | |
| line.sleep.medium.3 | Ilımlı bir uyku haftası geçirdin. | |
| line.sleep.high.1 | Yastığınla resmen kader birliği yaptınız. | |
| line.sleep.high.2 | Bu hafta uyku konusunda zirvedeydin. | |
| line.sleep.high.3 | Uyku bankasına bol para yatırdın bu hafta. | |

### Harcama

| ID | Metin | Senin metnin |
|---|---|---|
| line.spending.low.1 | Cüzdanın bu hafta minik bir tatil yaptı. | |
| line.spending.low.2 | Kartın bu hafta neredeyse hiç ısınmadı. | |
| line.spending.low.3 | Bu hafta harcama konusunda çekingendin. | |
| line.spending.medium.1 | Ne cimri ne çılgın, tam kararında harcadın. | |
| line.spending.medium.2 | Cüzdan bu hafta ölçülü bir tempo tuttu. | |
| line.spending.medium.3 | Harcaman ne kısıtlı ne bol, dengeliydi. | |
| line.spending.high.1 | Kartın bu hafta epey mesai yaptı. | |
| line.spending.high.2 | Cüzdanın bu hafta hatırı sayılır bir tur attı. | |
| line.spending.high.3 | Bu hafta harcama konusunda cömert taraftaydın. | |

### Sosyal

| ID | Metin | Senin metnin |
|---|---|---|
| line.social.low.1 | Bu hafta yalnızlığın tadını çıkarmışsın. | |
| line.social.low.2 | Sosyal hayatın bu hafta sessiz moddaydı. | |
| line.social.low.3 | Bu hafta içine dönük bir hafta geçirdin. | |
| line.social.medium.1 | Ne kalabalık ne yalnız, ortada bir haftaydın. | |
| line.social.medium.2 | Sosyallik dozun tam kıvamındaydı bu hafta. | |
| line.social.medium.3 | Bu hafta sosyal hayatın dengeliydi. | |
| line.social.high.1 | Bu hafta çevrende adeta bir kutlama vardı. | |
| line.social.high.2 | Sosyal pilin bu hafta hiç bitmedi. | |
| line.social.high.3 | Bu hafta etrafın seninle şenlendi. | |

---

## 3. Değişim özetleri (12 = 6 durum x 2 varyant)

Kartın altındaki "geçen haftayla kıyas" cümlesi.

| ID | Ne zaman çıkar | Metin | Senin metnin |
|---|---|---|---|
| summary.firstCard.1 | ilk kart, kıyas yok | İlk karnen bu, kıyaslayacak geçmiş hafta yok. | |
| summary.firstCard.2 | ilk kart, kıyas yok | Bu ilk kartın, önceki haftayla kıyas henüz yok. | |
| summary.allStable.1 | hepsi geçen haftayla aynı | Bu hafta her şey geçen haftayla aynı çizgide gitti. | |
| summary.allStable.2 | hepsi geçen haftayla aynı | Değişim yok, geçen haftanın aynı temposundaydın. | |
| summary.risingMajority.1 | çoğu kategori yükseldi | Bu hafta çoğu kategori geçen haftadan güçlüydü. | |
| summary.risingMajority.2 | çoğu kategori yükseldi | Genel gidişat yukarı yönlü, güzel bir yükseliş. | |
| summary.fallingMajority.1 | çoğu kategori düştü | Bu hafta çoğu kategori geçen haftadan biraz düştü. | |
| summary.fallingMajority.2 | çoğu kategori düştü | Genel gidişat aşağı yönlü, sakin bir dinlenme haftası. | |
| summary.balancedMixed.1 | karışık | Karışık bir hafta, kimi yükseldi kimi düştü. | |
| summary.balancedMixed.2 | karışık | Bu hafta terazi hem sağa hem sola salındı. | |
| summary.partialData.1 | bazı kategorilerde kıyas yok | Bazı kategorilerde geçen haftayla kıyas henüz yok. | |
| summary.partialData.2 | bazı kategorilerde kıyas yok | Kısmi veriyle bir karşılaştırma, tam resim değil. | |

---

## Bittiğinde

1. "İçerik hazır" de. Ben doldurduğun hücreleri `tr.ts`'e işlerim.
2. İçerik testleri (≤60 karakter, rakam yok, kapsama 81/81, tekrar önleme) çalışır; kırılırsa hangi metnin hangi kuralı bozduğunu söylerim.
3. `plan.md` S4 "K8 kapısı" kapanır.

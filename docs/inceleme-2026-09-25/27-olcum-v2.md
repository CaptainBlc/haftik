# 27 — Ölçüm v2 (data-analyst, 2026-09-28)

> Ajan dosyayı yazmadı; içerik teslim raporundan kaydedildi (ana tablolar korundu, tekrar eden açıklamalar kısaltıldı). Kod/asset/test/emülatör değişmedi.
> Kanıt: K1 kod okuması · K2 birim testi (metrics testleri 40/40 ajan tarafından çalıştırıldı; Wilson/işaret testi hesapları node ile) · K4 emülatör (ikinci el: R-03, 09) · K0 yargı/varsayım.

## 0. Özet ve sınırlar

**Sınırlar (hep akılda):**
1. Gerçek kullanıcı verisi yok; "kullanıcı şunu yapar" cümleleri K0.
2. Örneklem 5, 12, 20-30 kademeleri: yalnızca büyük etkiler ve açık başarısızlıklar ayırt edilir; "kanıtlandı" denebilecek sonuç yok.
3. Paylaşım oranı paydası kartı görenler; paylaşım FAZLA (sayfa açıldı), ekran görüntüsü EKSİK sayılır.
4. Rapor kullanıcı tetikli: göndermeyenin verisi yok, büyük olasılıkla bırakanlar (yanıtsızlık yanlılığı).
5. Testçiler tanıdık çevre: sosyal beğenirlik yanlılığı.

**Ana bulgular:**
- Mevcut 5 olaylı ölçüm D7 ve "kartı görenlerde paylaşım" için doğru çalışıyor (K2 40/40; K4 R-03 sayaçları tutarlı).
- v1.5 kararlarını ölçmeye **yetmiyor**: hafta kırılımı, sürüm/kol etiketi, unvan görünürlüğü yok; `card_unlocked` arayüze bağımlı; `metric_event` CHECK kısıtı yüzünden yeni olay = migration.
- Öneri: olay eklemek yerine mümkün olduğunca **türetilmiş sayı** (`weekly_card`, `checkin`'den).
- Kuzey yıldızı: **İkinci Kart Oranı (İKO)**, tamamen `weekly_card` satır sayısından türer.
- 5 kişilik A/B deney değil **tercih testi**; bu 5 kişi E1 nötr dönem örnekleminin dışında olmalı.
- Play 12+ kişilik kapalı test bir kapıdır; E1 (%25) o veriyle doğrulanamaz, yalnızca "açıkça tutmuyor" denebilir.

## 1. Mevcut ölçüm denetimi

| Bileşen | Durum | Kanıt |
|---|---|---|
| 5 sabit olay + `trackEvent`/`trackEventOnce` | Çalışıyor | K2, K4 (R-03: `check_in_saved=4, card_unlocked=1, card_opened=3, share_initiated=1, line_hidden=2`) |
| D7 tanımı (`computeD7`), `pending`/`unknown` | Doğru, testli | K2 |
| Paylaşım oranı paydası `card_opened >= 1` | Doğru | K1, K2 |
| Rapor yasak-desen taraması | Var | K2 |
| Silme `metric_event`'i temizliyor | Var | K2 + 09 (K4) |

**Eksik/hatalı (öncelik sırasıyla):**

| # | Bulgu | Neden önemli | Öncelik |
|---|---|---|---|
| M-1 | **Yeni olay = tablo yeniden kurulumu.** `metric_event.name` 5 adlı CHECK taşıyor; SQLite'ta CHECK değiştirilemez; `runMigrations` migration + `user_version`'ı tek transaction'da yapmıyor (13 T7 açık) | Yarıda kalan migration uygulamayı kalıcı çökertir | Yüksek; T7 şart |
| M-2 | **`card_unlocked` arayüze bağımlı** (`week.tsx:70-78`, Hafta sekmesi odakta iken). Bildirim kartı doğrudan açacak (T3) → Hafta'yı hiç görmeyen `card_opened` üretir ama `card_unlocked` üretmez; teslim oranı 1'i aşabilir | Kaçırılan kart ölçümü güvenilmez | Yüksek |
| M-3 | **Hafta kırılımı yok.** `week_start` yazılıyor, rapor kullanmıyor; `at` hiç kullanılmıyor | Nötr dönem ile çağrılı dönem ayrıştırılamaz | Yüksek |
| M-4 | **Sürüm/kol etiketi yok** | Eski-yeni kart ve V5/V6 etkisi ayrıştırılamaz | Yüksek |
| M-5 | **Unvan görünürlüğü ölçülmüyor** (`shouldHideTitle` yalnızca çizimde hesaplanıyor) | Hedef ≥%90 sahada izlenemiyor | Orta |
| M-6 | `line_hidden` = ortalama gizli sayısı; varsayılana dokunuldu mu anlaşılmıyor | Gizleme davranışı görünmüyor | Orta |
| M-7 | D7: `first_open_date` onboarding bitişinde yazılıyor; geriye dönük "dün" girişi gün 7'yi doldurabilir; kesin-gün-7 katı | Yanlış-negatif/pozitif | Orta |
| M-8 | `aggregateMetrics` `pending`/`unknown` cihazları sessizce paydadan düşüyor | D7 olduğundan iyi görünebilir | Orta |
| M-9 | D1-D3 ve ilk kart günü yok | Aktivasyon teşhisi kör; türetilebilir | Orta |
| M-10 | Bildirim izni durumu/tıklaması yok | D7 düşüşünün nedeni ayırt edilemez | Orta |
| M-11 | `card_opened` her yüklemede artıyor (tekrar açış dahil); albümle anlamı bozulur | Haftalık yorum bozulur | Orta |
| M-12 | `trackEventOnce` atomik değil; `at` gereksiz; "sayaç" değil zaman damgalı satır | Küçük; veri minimizasyonu | Düşük |
| M-13 | Ölçüm kodunun K4 kanıtı yalnızca debug cihazında (`run-as`); preview/release'te doğrulama yolu raporun kendisi | K5 doğrulaması yok | Orta |
| M-14 | Dev zaman menüsü Batuhan cihazında sayaçları simüle ediyor | Dev menülü cihaz deneme dışı; deneme cihazları temiz kurulum | Düşük ama net kural |

### 1.3 D7 tanımı
**Kalsın:** kurulum günü = gün 1, gün 7 = +6 takvim günü; `yes/no/pending/unknown`. K-9 hedefi (≥%40) bu tanıma göre deneme başlamadan sabitlenir.
**İkincil (hedefsiz, türetilmiş):** D7-pencere (gün 6-8'de ≥1 dolu gün), Hafta-2 dönüşü (gün 8-14), hafta başına 4+ dolu gün alan hafta oranı.
**Okurken:** Cumartesi/Pazar kuranlar 7. günde henüz kart görmemiş olur; `yes` gün bitmeden kesin, `no` yalnızca gün 7'den sonra; `pending` ayrı sütun, paydaya girmez.

### 1.4 Payda tanımları
**Paylaşım oranı (E1):** pay = `share_initiated >= 1`, payda = `card_opened >= 1`, **yalnız nötr dönem raporları**. Yanlış okuma: payda kurulum sanılırsa düşük görünür; uzun süre kullanan cihazın şansı yüksek olur (ikincil: kart başına paylaşım); ekran görüntüsü eksik, sayfa açıldı fazla.

**Unvan görünürlüğü (hedef ≥%90) üç ayrı ölçü:**

| Ölçü | Tanım | Kaynak | Bugünkü değer |
|---|---|---|---|
| U1 (tasarım) | Varsayılan gizlemede unvanın görünür olduğu kombinasyon oranı (81 kombinasyon, dolu gün 3-7, delta durumları) | K2 betiği (09) | %18,5-19,8 (15-16/81) |
| U1w (ağırlıklı) | Günlük seçimler düzgün dağılırsa | K2 | %38-63 (gerçek dağılım bilinmiyor) |
| U2 (saha, türetilmiş) | Testçinin dondurulmuş kartlarında unvan varsayılan gizlemede görünenlerin oranı | `weekly_card.title_based_on_categories` | Bilinmiyor |
| U3 (davranış) | Paylaşılan PNG'de görünen unvan oranı | Yeni kimliksiz sayaç | Bilinmiyor |

Kural: ≥%90 hedefi **U1 ve U1w** için K2'de aranır. U2/U3 sahada yön ve regresyon alarmıdır. U2/U3 zayıf bir bit taşır → küçük-hücre bastırması + `security-reviewer` onayı.

## 2. Yeni metrik ağacı

### 2.1 Kuzey yıldızı: İkinci Kart Oranı (İKO)
= ilk kartını alalı **≥8 gün** geçmiş cihazlardan, ≥2 dondurulmuş kartı (`weekly_card` satırı) olanların oranı.
- Üç halkayı tek boolean'da toplar: check-in alışkanlığı, ödül teslimi, geri dönüş. Olay bağımlılığı sıfır.
- Payda dikkati: sağdan kırpma (8 gün geçmemişler paydaya girmez).
- Yanlış okuma: kart açılmadan kaçan hafta "kaybolur"; Cumartesi/Pazar kuranların 2. kartı 14-15. günde (Play'in 14 günlük penceresinde bazıları dışarıda).
- Hedef: kıyas verisi yok; öneri "≥%50 sinyal, <%25 alarm" (K0). E1 ve D7 **kapı** olarak kalır.

### 2.2 Metrik ağacı

| # | Metrik | Payda | Kaynak | Karar kuralı |
|---|---|---|---|---|
| NS | İKO | ilk karttan ≥8 gün geçmiş cihaz | `weekly_card` (türetilmiş) | K0 önerisi |
| M1 | Aktivasyon: ilk kartı alan | onboarding'i bitirmiş, ≥8 gün | `weekly_card` | <%50 → değer/onboarding sorunu |
| M2 | İlk kart günü (medyan) | ilk kartı alanlar | `generated_at` − `first_open_date` (gün ofseti) | Öncü gösterge |
| M3 | D7 + D7-pencere + Hafta-2 dönüşü | ölçülebilir cihaz | `checkin` + `first_open_date` | K-9 (≥%40, K0) |
| M4 | Alışkanlık: hafta başına 4+ dolu gün alan hafta oranı | kurulum haftası hariç haftalar | `checkin` (türetilmiş) | Günlük an (V3) etkisi burada aranır |
| M5 | Paylaşım (E1) | `card_opened>=1`, yalnız nötr dönem | `share_initiated` | Bölüm 3.4 |
| M6 | Kart teslimi: uygun haftada açılma ve gecikme kovası | eşiği geçen haftalar | `checkin` + `weekly_card` (`card_unlocked` yerine) | Kaçırılan >%20 → T2/T3 sorunu |
| M7 | Albüm kullanımı | ≥2 kartı olan cihaz | Yeni `album_opened` | ≥%40 (K0) |
| M8 | Bildirim kanalı: bildirimle açılan kart payı, izin durumu | açılan kart | Yeni `notif_opened` + izin enum'u | İzin reddi yüksekse D7 yorumuna not |
| G1 | Koruma: gizleme varsayılanı korunuyor mu | paylaşım sayısı | `share_hidden_n` histogramı | 0 gizli artıyorsa ürün riski |
| G2 | Koruma: Kaydet süresi (~8 sn hedef, >12 sn geri al) | - | Cihaz içinde ölçülemez; 5 kişilik oturumda elle kronometre | KC2 |

### 2.3 Olay şeması önerisi (kod yazılmadı)
**Depolama:** v3 migration'da `metric_event` yerine `metric_counter`:

| Sütun | Anlam |
|---|---|
| `name` | Sabit küme, TS'te doğrulanır; **DB'de CHECK yok** |
| `week_start` | Yerel hafta anahtarı (nullable); rapora asla çıkmaz, rapor hafta indeksine (1..8) çevirir |
| `dim` | Kapalı sözlükten tek değer |
| `build` | Uygulama sürüm etiketi |
| `n` | Sayaç; `UPSERT n=n+1` (atomik) |
| PK | (`name`, `week_start`, `dim`, `build`) |

`at` yok → "zaman damgalı satır" bulgusu da kapanır. Sıra: T7 (migration atomikliği) → v3 → gerekirse eski içerik `GROUP BY` ile kopyalanır. `delete-all.ts`'e yeni tablo girer (silme testi).

| Olay | `dim` | Sayım anı |
|---|---|---|
| `check_in_saved` | `today`, `yesterday` | Her başarılı kayıt |
| `card_opened` | `week_tab`, `notif`, `album`, `other` | Kart `ready` yüklendiğinde (M-11 çözülür) |
| `card_unlocked` | - | **Kullanımdan kaldırılır**; rapor türetilmiş uygun haftayı kullanır |
| `share_initiated` | `fmt` (`p916`,`sq11`), `src` (`reveal`,`album`) | Paylaşım sayfası açılmadan hemen önce |
| `share_hidden_n` (yeni, `line_hidden` yerine) | `0`..`4` | Paylaşım başına bir kez |
| `share_default_kept` (yeni) | `y`,`n` | Paylaşım başına bir kez |
| `share_title_shown` (yeni, V2 sonrası) | `main`,`share_title`,`strip` | Paylaşım başına bir kez (U3) |
| `share_fmt_switched` (yeni, biçim seçici gelirse) | - | Varsayılan biçim değiştiğinde |
| `album_opened` (yeni) | - | Albüm yüklendiğinde |
| `notif_opened` (yeni) | `card_ready`,`daily` | Bildirim dokunuşuyla açılışta (yerel dinleyici, ağ yok) |
| `card_feel` (isteğe bağlı) | `mirror`,`new`,`meh` | Kullanıcının tek dokunuşu (ayna etkisi H4) |

**Rapor zamanında türetilen (olay yok):** `cards_frozen`, uygun hafta sayısı, hafta başına dolu gün, D1-D3 bayrakları, `firstCardDay`, kart gecikme kovaları (aynı gün / 1-2 gün / 3+), izin enum'u, `cards_title_visible_default` (<3 kart ise `null`). Kaydet anı ve örnek kart için ayrı olay eklenmez (etkisi M3/M4 ve M1/M2'de aranır).

### 2.4 Gizlilik sözü kontrolü
Sorular: G1 içerik/seviye/emoji? G2 kategori? G3 tarih/epoch/saat? G4 kimlik? G5 birleşimle seviye çıkarımı? G6 ağ/bağımlılık? G7 silme kapsar mı? G8 kullanıcı tetikli ve önizlemede görünür mü?

Sonuç: `check_in_saved`, `card_opened`, `share_initiated`, `share_hidden_n`, `share_default_kept`, `album_opened`, `notif_opened`, izin enum'u, hafta indeksli diziler, gecikme kovası, `build` etiketi: **uyumlu**. **Koşullu:** `share_title_shown` (`strip` payı zayıf bir bit), `cards_title_visible_default` (<3 kart → `null`), `installWeekdayBucket` (yalnız gerekirse), `card_feel` (privacy-compliance-analyst görüşü). **Önerilmez:** saat dilimi/saat kovası. **Küçük-hücre bastırma:** 3'ten az kartla türetilen oran/bit `null`.

## 3. Deney tasarımı

### 3.1 Sıra (E1'i bozmadan; 23 ile hizalanmalı, çelişki varsa açık yazılır)

| Adım | Kim | Ne | E1'e sayılır mı |
|---|---|---|---|
| 0. Dogfooding (n=1) | Batuhan | Preview APK, temiz kurulum; olay sayılarını elle akışla karşılaştır (ölçüm kodunun K4/K5 doğrulaması) | Hayır |
| 1. Kart tercih testi | Deneme dışı 5 kişi | Bölüm 3.2 | Hayır (paylaşımı hazırlar) |
| 2. Dönem A (hafta 1, nötr) | Arkadaş çevresi | Tek yapı, paylaşım çağrısı yok | **Evet, tek dönem** |
| 3. Dönem B (hafta 2, nötr) | Aynı kişiler | Faz 3 (V5/V6) ya da mikro-an | Hayır |
| 4. Dönem C (hafta 3, çağrılı) | Aynı kişiler | "Kartını paylaş" çağrısı | Hayır (ayrı raporlanır) |
| 5. Dönem D (hafta 4) | Aynı kişiler | Serbest gözlem + geri bildirim | Hayır |
| 6. Play kapalı test (≥12, 14 gün) | Play testçileri | Bölüm 3.4 | Ayrı kohort |

### 3.2 5 kişilik tercih testi
Kişi-içi: aynı kişiye eski ve yeni kart (aynı veri, aynı gizleme durumu), nötr dosya adları, sıra dengelenir (3 eski-yeni, 2 yeni-eski), sohbet önizleme boyutunda ve tam boyutta gösterilir; her kart için cevap karşılaştırmadan önce kaydedilir.

**Sorular:** (1) 5 sn göster: "ne gördün?" (okunurluk) (2) "Hangi uygulamanın kartı?" (3) kart başına 1-5 "Story/Durum'a koyar mıydın?" (4) kart başına Çocuksu…Yetişkin (5) Yargılıyor…Yargılamıyor / Ciddi…Eğlenceli (6) zorunlu tercih + gerekçe (7) "İlk ne hissettin?" (8) "Paylaşmasan nedeni ne olurdu?"

**Ne kanıtlar:** 5/5 aynı yönde işaret testi p=0,031; 4/5 p=0,19; ≥3/5 tek başına anlamsız (fark yokken bile %50 olasılıkla ≥3/5). 15'teki KC1 "≥3/5" kuralı tek başına ayırt edici değil → "kill" koşulu olarak oku (≤1/5 yeniyi seçerse), "geç" için ≥4/5. Wilson %95: 5/5 [57,100]; 4/5 [38,96]; 3/5 [23,88].
**Kanıtlamaz:** gerçek paylaşım davranışı (niyet≠davranış), sosyal beğenirlik, temsil gücü, yeni kartın paylaşım oranını **artırdığı** (bu yönde ölçülmüş kaynak yok).

**Karar kuralı (C yönü kesin; sınanan olgunlaştırma yeterliliği):**

| Sonuç | Karar |
|---|---|
| ≥4/5 C'yi seçer + ≥4/5 orta/yetişkin ölçek + ≥4/5 unvanı/mührü okur | **Geç** |
| 3/5 seçer ya da çocuksu puanı 2/5'te | **Belirsiz:** ton/renk doygunluğu/kontur olgunlaştır, ikinci 5 kişi |
| ≤2/5 seçer ya da ≥3/5 "çocuksu" | **Dur ve olgunlaştır**; 8. soru girdi; ikinci turda da tutmazsa yön sorusu Batuhan'a döner |
| 5 sn'de unvan/mühür 2+ kişide okunmuyor | Küçük ölçekte okunurluk düzeltmesi |

### 3.3 Niteliksel sorular (nötr dönemde paylaş demeden; takma kod T01..T30)
- **Hafta 1:** ilk kartı ne zaman gördün, ne hissettin? "Zaten biliyordum" dedin mi (ayna etkisi H4)? Kimseye gösterdin mi, göstermediysen neden? Kaydet kaç sn sürdü, sıkıcı mıydı? Bildirimi aldın mı?
- **Hafta 2:** geçen haftadan farklı hissettirdi mi? İkinci kart tekrar mıydı? Atladığın gün nedeni?
- **Hafta 3 (çağrılı):** çağrı zorlama mı, doğal mı? Paylaştıysan nereye/tepki? Paylaşmadıysan neden (gizlilik, güzel değil, ilgisiz, utanç)?
- **Hafta 4:** bir ay sonra kullanır mıydın? En çok güldüren/sıkan kısım? Albüme baktın mı? Önerir miydin?
- Okuma: ≥3 kişide aynı tema = bulgu; tek anekdot bulgu değil.

### 3.4 Play kapalı test (≥12 kişi, 14 gün): ne söylenebilir
Sınırlar: en fazla 2 Pazar (testçi 0-2 kart görür); İKO paydası çoğunda sağlanmaz; 12 kişide rapor gönderen 6-8 olabilir.

E1 işlem karakteristiği (gözlenen ≥%25 kabul; K2 hesap):

| n | Gerçek %10 | %15 | %25 | %35 | Wilson alt sınırı ≥%25 için gereken k | "Açıkça tutmuyor" (üst sınır <%25) |
|---|---|---|---|---|---|---|
| 12 | 0,11 | 0,26 | 0,61 | 0,85 | 6 (%50) | 0 |
| 20 | 0,04 | 0,17 | 0,59 | 0,88 | 9 (%45) | ≤1 |
| 30 | 0,01 | 0,07 | 0,49 | 0,88 | 13 (%43) | ≤2 |

n=12'de k≥3 gerçek oran %15 iken bile %26 olasılıkla çıkar → zayıf kanıt. E1 Play verisiyle **doğrulanamaz**; yalnızca "açıkça tutmuyor" (n=12'de 0, n=20'de ≤1). D7: 7/12 → %58, Wilson [32,81]; K-9 (%40) ile ayırt edilemez.

**Söylenebilir:** akış bütünlüğü (yüksek güven, betimsel); M1/M2 dağılımı (orta); D7/hafta-2 yalnızca alt/üst sınırla (düşük); E1 yalnızca "açıkça tutmuyor/belirsiz"; albüm, izin dağılımı, gizleme varsayılanı betimsel (orta).
**Söylenemez:** "%25 tutuyor", "yeni kart paylaşımı artırdı", "içerik ayna etkisini geciktirdi", "D7 hedefe ulaştı".

## 4. Rapor v2 ve elle birleştirme

### 4.1 Rapor v2
Okunur metin + tek satır JSON; yeni: tam metni gösteren **önizleme ekranı** ([Vazgeç]/[Paylaş]).
```
{ "v": 2, "build": "c1-kart", "seq": 2, "day": 16, "perm": "granted|denied|unset",
  "d": { "d1d3": "110", "d7": "yes|no|pending|unknown", "d7w": "...", "w2": "...", "firstCardDay": 6 },
  "cards": { "frozen": 2, "eligibleWeeks": 2, "lateBuckets": [1,0,1], "titleVisibleDefault": null },
  "weeks": [ { "i": 1, "fill": 4, "opened": 1, "src": {"w":1,"n":0,"a":0,"o":0}, "share": 1 } ],
  "share": { "n": 1, "fmt": {"p916":1,"sq11":0}, "src": {"reveal":1,"album":0}, "hiddenN": [0,0,1,0,0], "defaultKept": 1, "strip": null, "switched": 0 },
  "album": 2, "notifOpened": {"card":1,"daily":3}, "cardFeel": {"mirror":0,"new":1,"meh":0} }
```
`seq` = yerel artan rapor sayacı (kopyaları ayırır, kimlik değil). Tarih/emoji/kategori/kimlik yok; küçük hücre `null`. Bilinen sınırlar metni genişler (fazla/eksik paylaşım, küçük örneklem, gönderilmeyen cihaz görünmez, `build` ile ayrılan sürümler, D7 `pending`). Yasak-desen testi hafta dizisi ve enum'ları da kapsar.

### 4.2 Bütünlük kuralları (hatalı rapor tabloya alınmaz)
1. `sum(hiddenN) == share.n` 2. `sum(share.fmt) == share.n` ve `sum(share.src) == share.n` 3. `cards.frozen <= sum(weeks[].opened)` 4. `cards.frozen <= cards.eligibleWeeks` 5. `weeks[].fill` 0-7 6. `d7=="yes"` iken `day>=7` ya da gün-7 dolu 7. `share.n>=1` ise `cards.frozen>=1`.

### 4.3 Batuhan'ın elle birleştirmesi
Tablo: satır = takma kodlu testçi (kod rapora yazılmaz). Kurallar: (1) aynı testçi, aynı dönem sonu için yalnızca son `seq` (2) `build` sütunu, karışık derlemeler ayrı (3) **iki katmanlı payda:** `N_toplam` (davet edilen) ve `N_rapor`; her oran için alt sınır (raporlamayanlar yapmadı) ve üst sınır (hepsi yaptı). Örnek: 12 testçi, 8 rapor, 5 D7 `yes` → raporlayanlarda %62; alt sınır 5/12=%42, üst 9/12=%75 → "en az %42, en çok %75" (4) `pending` ve ilk karttan <8 gün olanlar paydadan çıkar ama sayıları ayrı sütunda (5) formüller: Aktivasyon = (`frozen>=1`) / (onboarding bitirmiş, `day>=8`); İKO = (`frozen>=2`) / (`day - firstCardDay >= 8`); E1 = (nötr dönem `share.n>=1` ve `opened>=1`) / (nötr dönem `opened>=1`); kart başına paylaşım = Σ paylaşılan hafta / Σ açılan hafta; her orana Wilson %95 aralığı (6) her testçi için elle not: derleme, kurulum dönemi, telefon üreticisi (OEM pil, E13) (7) haftalık yorum: tablo + tek cümle karar + güven düzeyi. Birleştirme betiği (yerel, ağsız) test-automation/mobile-engineer işi.

## 5. Yeni özellik önerileri (ölçüm/içgörü; hepsi K0)

| # | Öneri | Etki | Efor | Gizlilik | Not |
|---|---|---|---|---|---|
| F1 | **Kart tepkisi tek dokunuş** (kapatınca haftada en fazla bir kez, atlanabilir: yansıttı / yeni gördüm / pek değil) | Yüksek (ayna etkisi H4'ü ilk kez ölçer) | S (0,5-1 gün) | Uyumlu (enum sayaç) | Yanıtlayanlar yanlı; israr yok |
| F2 | **Deneme modu (yalnız preview):** Pazartesi sabahı yerel hatırlatma + rapor önizleme; üretimde yok | Yüksek (yanıtsızlık yanlılığı) | S-M | Uyumlu (bayrak profil bazlı) | Rıza/aydınlatma gerekir |
| F3 | **Haftalık kişisel içgörü** (yalnız ekranda, PNG ve rapor dışında) | Orta | M | Kategori adlı içgörü rapora girmez | F1 verisi öncülü olmalı |
| F4 | Dev menüde canlı sayaç paneli (yalnız debug) | Ölçüm doğrulaması | S | Dev-only | K4 kanıtını kolaylaştırır |
| F5 | Cihaz içi trend özeti | Düşük-orta | M-L | Uyumlu ama "takip paneli"ne kayma riski | Önerilmez; F3 içinde bir cümle |

**Taslak intent'ler:** **I-M1 Kart tepkisi:** kartın "zaten biliyordum" mu "yeni öğrendim" mi dedirttiği bilinmiyor, içerik yatırımı buna bağlı; kapatılınca haftada en fazla bir kez, atlanabilir üç seçenekli tek dokunuş, yanıt yalnızca cihazda sayaç, rapora toplam olarak girer; başarı: ≥%50 yanıtta "yansıttı" payı belirgin yüksekse değer katmanı (13 I-4) açılır; içerik/kategori/tarih yok, israr/ödül/bildirim yok. **I-M2 Deneme modu:** gönderilmeyen rapor ölçümün en büyük kör noktası; yalnız deneme derlemesinde haftada bir yerel hatırlatma ve tam metin önizlemeli rapor ekranı; başarı: yanıt oranı ≥%70 (K0); hesap/sunucu/otomatik gönderim yok. **I-M3 Haftalık kişisel içgörü:** kart kullanıcıya bildiğini söylüyor; kart ekranında, PNG dışında tek satır türetilmiş içgörü; başarı: F1'de "yeni bir şey gördüm" payı artar; rapora/görsele girmez, yargı yok.

## 6. Batuhan'a sorular

| # | Soru | Seçenekler | Öneri |
|---|---|---|---|
| Q1 | Kuzey yıldızı | (a) İKO, E1/D7 kapı (b) Yalnız E1 (c) Yalnız D7 | **(a)** |
| Q2 | Sayaç depolama | (a) v3 `metric_counter` (T7 sonrası) (b) Mevcut tabloyu CHECK'siz yeniden kur (c) 5 olayla kal, yalnız türetilmiş alanlar | **(a)**; en ucuz kademe (c) olabilir, sonra (a) |
| Q3 | Rapor v2 kapsamı | (a) Hafta dizisi + sürüm etiketi + türetilmiş alanlar (b) Yalnız `build` + hafta dizisi (c) v1 | **(a)** |
| Q4 | Kart tercih testi | (a) Deneme dışı 5 kişi, E1'e girmez (b) Deneme içi | **(a)** |
| Q5 | Unvan görünürlüğü ölçümü | (a) K2 (U1/U1w) + Play'de U2, <3 kartta `null` (b) Sahada `share_title_shown` da (c) Hiç | **(a)** |
| Q6 | Kart tepkisi (F1) | (a) Deneme derlemesine ekle (b) Sonra (c) Hayır | **(a)** |
| Q7 | Deneme modu (F2) | (a) Preview profilinde (b) Elle WhatsApp hatırlatma | (b) ile başla, yanıt oranı düşerse (a) |
| Q8 | K-9 D7 hedefi | (a) %40, D7-pencere hedefsiz (b) Başka | **(a)**; deneme başlamadan `plan.md`'ye yaz |
| Q9 | Testçiden rapor istemek | (a) Kısa rıza metni (b) Sözlü | **(a)**; KVKK sorusu hukuki görüşe bağlı |
| Q10 | Kuzey yıldızı hedefi | Bir sayı ya da "hedefsiz, betimsel" | Deneme başlamadan yazılmalı |

## 7. Devir ve doğrulanamayanlar

**Devir:** security-reviewer → bölüm 2.4 koşullu satırlar · privacy-compliance-analyst → rapor kişisel veri mi, rıza metni, Data Safety · software-architect → v3 migration (`metric_counter`), T7 sırası · mobile-engineer + test-automation-engineer → olay sözleşme testleri, K4, birleştirme betiği · growth-strategist (23) → dönem takvimi hizalama · product-owner → Q1-Q10.

**Doğrulanamayanlar:** gerçek davranış verisi yok (tüm eşikler K0) · rapor v2'nin WhatsApp/mesajda okunur ulaşması ve boyutu (K5) · `metric_counter` yazımı için K4 yok (tasarım aşaması) · Play kohortunun gerçek katılım/yanıt oranı · 09'un U1 sayımı (15-16/81) yeniden çalıştırılmadı (ikinci el) · gerçek günlük seviye dağılımı · C'nin "çocuksu" okunma oranı · `expo-notifications` yanıt dinleyicisinin soğuk açılışta güvenilirliği (05/22 kapsamı).

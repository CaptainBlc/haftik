# 03 - Alışkanlık ve dönüş döngüsü incelemesi (Haftik)

Tarih: 2026-09-25. İnceleyen: alışkanlık ve etkileşim tasarımcısı (salt okunur; kod/yapılandırma değiştirilmedi).
Soru: **Kullanıcı yarın ve gelecek hafta neden geri gelir?**

Kanıt etiketleri: `[KOD]` kaynak okumasıyla doğrulandı (cihazda gözlenmedi), `[EMÜ]` emülatör raporlarında var
(`docs/emulator-*.md`), `[BELGE]` spec/UX belgesinde yazılı, `[VARSAYIM]` ölçüm yok. Hiçbir gerçek kullanıcı verisi yok
(kapalı deneme başlamadı); bu yüzden her "kullanıcı şunu yapar" cümlesi en fazla K0-K1'dir.

## Özet (8 satır)

1. Döngünün **eylem** halkası (8 sn, tek ekran) sağlam; **tetik** tek kanallı (21:00 aynı metin), **ödül** haftada bir, **yatırım** UI'da görünmez.
2. Günün ödülü sıfır: `Kaydet` sonrası ekranda hiçbir değişiklik/onay yok [KOD]; ilk kart için 3-8 gün ara ödülsüz beklenir.
3. En zayıf 3 halka: (a) günlük ödül/geri bildirim yok, (b) tetikten karta köprü kırık (bildirime dokunma yönlendirmez, Pazartesi'den sonra kaçırılan haftanın kartına UI girişi yok), (c) yatırım/koleksiyon yok (geçmiş kartlar görünmez, içerik havuzu ~3 haftada döner).
4. Mikro-an + Hafta'ya geçiş (S), bildirim tıklama yönlendirmesi (S-M), kaçırılan hafta girişi (S-M) mevcut spec/UX içinde kalır; en yüksek getiri/maliyet bunlardadır.
5. Ayrı `intent.md` ister: geçmiş kartlar koleksiyonu/hafta serisi, sabah "dün" bildirimi, widget, QR/bağlantılı davet, her türlü sunucu/arkadaş özelliği.
6. Saat aralığı 20:00-23:00 "sabah insanı" için değil, "bugünü" akşam işaretleme mantığı için tutarlı; asıl boşluk 18-19:00 ve 23:00 sonrası. Genişletme küçük ama ürün kararıdır.
7. Mevcut sayaçlar D7'yi ve kart-paylaşım oranını ölçer; ilk 3 gün, hafta bazlı kırılım, bildirim izni/tıklama ve "kaç günde ilk kart" ölçemez. Küçük, kimliksiz sayaç eklemek gerekir (spec S9 değişikliği, gizlilik sözü sürer).
8. Deney: E1'in nötr ilk haftasına dokunma; müdahale build'ini 2. döneme al, paylaşım çağrısını 3. döneme; n=20-30 olduğundan sonuç yalnızca "yön" olarak okunur.

---

## 1. Mevcut döngü haritası

```
TETİK ---------> EYLEM --------> ÖDÜL ---------------------> YATIRIM
21:00 bildirim   4 emoji+Kaydet  (a) Kaydet anı: yok          checkin satırları + weekly_card
(sabit metin)    ~8 sn           (b) 7 nokta ilerleme (Hafta)  (UI'da yalnız içinde bulunulan hafta)
Pazar 20:00                      (c) Pazar kartı (haftada 1)   "Kartını tekrar gör" yalnız bu hafta
"Karnen hazır"                   paylaşım (gönüllü)
```

| Halka | Ne var | Kanıt | Değerlendirme |
|---|---|---|---|
| **Tetik 1: günlük 21:00** | Yerel bildirim, 7 gün ileri pencere, açılış/check-in'de yeniden kurulur; bugün doluysa bugünkü atlanır; tek sabit metin ("Bugün nasıldı? / Birkaç saniyede bugünü işaretleyebilirsin.") | `notify-plan.ts`, `notification-texts.ts` [KOD]; `dumpsys alarm` emülatörde [EMÜ]; gerçek cihaz gecikmesi ve OEM pil yönetimi yok | Saygılı (veri yok, dolu günde susar, 7 gün sönümlenme) ama tek metin, tek saat, tek kanal. Tekrar yorgunluğu [VARSAYIM]. |
| **Tetik 2: Pazar 20:00 "Karnen hazır"** | Yalnızca `thresholdMet` iken, yalnızca içinde bulunulan haftanın Pazar'ı için planlanır; hatırlatma kapalıyken de planlanır | `notify-plan.ts` [KOD] | Wow anının tek dış tetiği. **Bildirime dokununca kartı açan bir yönlendirme yok**: `_layout.tsx`'te yanıt dinleyicisi yok; bildirim yükü yalnızca `{kind}` (spec S8 #7 `weekStart` da diyor). Uygulama son ekranında açılıyor (BLG-09) [EMÜ + KOD]. `pazar-akisi.md` "bildirime dokunarak" akışı varsayıyor [BELGE] ama çalışmıyor. |
| **Eylem** | Tek ekran, 4x3 emoji, Kaydet, dün/bugün; onboarding sonrası doğrudan check-in | `checkin-form.tsx`, tek ekrana sığma testi [KOD]; kronometre ölçümü yok (S6 açık madde) | En güçlü halka. ~8 sn hedefi hesap olarak makul, ölçülmedi. |
| **Ödül (günlük)** | Yok. `handleSave` yalnızca `saveCheckin` + sayaç + bildirim sync; forma "kaydedildi" durumu yok, buton etkin kalır, ekran aynı | `today.tsx`, `checkin-form.tsx` [KOD] | Kullanıcı Kaydet'in çalıştığını yalnızca Hafta sekmesine gidip noktayı görerek anlar. Alışkanlık halkasının "tatmin" adımı boş. |
| **Ödül (ara)** | Hafta sekmesi: 7 nokta + "Kartın için X gün daha lazım." + gri iskelet kart + "Pazar 20:00'de açılıyor" | `week-status-view.tsx`, `week-status-copy.ts` [KOD] | Beklenti kurar ama sekmeye kullanıcının kendisi gitmeli; metin "lazım" ile gereklilik tonunda (B12). Kartın içeriğine dair merak sinyali yok (iskelet bilerek boş; doğru). |
| **Ödül (haftalık)** | Reveal animasyonu, unvan + 4 satır + özet, paylaş | `CardRevealView`, `ekran-akisi.md` [KOD/BELGE]; akıcılık cihazda ölçülmedi (K-03) [EMÜ] | Tasarımı güçlü. Riskler: 40 unvan (12 temel + 28 kombinasyon), 36 satır (kategori x seviye x 3 varyant), ardışık tekrar yasağı. Bir kategori çoğu hafta aynı seviyedeyse aynı 3 cümle ~3 haftada döner [KOD hesabı, etkisi VARSAYIM]. |
| **Yatırım** | Dondurulmuş `weekly_card` + `checkin` satırları cihazda birikir; kart "geçen haftaya göre" delta taşır | `card-repo`, `week.tsx` `getCard(weekStart)` [KOD] | Birikim var, **görünürlük yok**: Hafta ekranı yalnızca içinde bulunulan haftayı gösterir; geçmiş kart listesi yok (v2+ olarak bilinçli dışarıda). Pazartesi'den sonra kaçırılmış haftanın kartına UI girişi yok (spec "açılabilir kalır" diyor, yalnızca deep link ile erişilir; K-07 emülatörde atlandı). |
| **Sosyal** | Paylaş sistem sayfasıyla; damga kartta gömülü | `share.ts`, S7b notları [KOD] | Damgadaki bağlantı yer tutucu (`[mağaza bağlantısı]`), paylaşım mesajı hedefe taşınmıyor olabilir (K5, cihazda doğrulanmadı). |

**Kanıtlı iyi şeyler (korunmalı):** dolu günde bildirim susar; bildirim metninde veri yok; 7 gün sonra kendiliğinden
sönümlenme (ısrar yok); K3 (Pazar bugünü-önce-işaretle) ve paylaşım öncesi zorunlu önizleme; izin durumunun
Android 13+ için gerçek davranışa göre ele alınması (BLG-01).

## 2. Kullanıcı deneyimi zaman çizelgesi (pre-mortem)

### İlk 3 gün
- **Gün 1 (kurulum):** Onboarding (3 dokunuş) -> izin -> doğrudan check-in. Kaydet sonrası **hiçbir şey olmaz**. Kullanıcı
  ürünün ne vereceğini yalnızca onboarding cümlesinden ("Pazar akşamı sonucu gör") bilir; ilk kartın kaç gün sonra geleceğini
  Hafta sekmesine giderse görür.
- **Gün 2-3:** Tek destek 21:00 aynı metin. "Şimdi değil" diyenler ve Android 13+ reddedenler için tetik yok; **kaç kişinin
  izin vermediği ölçülmüyor**. Bugün'ü işaretlemenin ödülü yok, kart uzak.
- **Bırakma nedeni hipotezi (K0):** "Ne verdiğini görmeden" 2-3 gün üst üste boş ödülle iş yapmak; bildirimi tek metin ve
  sıradan bulmak. Batuhan'ın "yetersiz" tespiti bu halkada en olası [VARSAYIM; kendi dogfooding gözlemi bu belgede yok].

### İlk hafta
İlk kartın gelmesi kurulum gününe bağlı (eşik 3 dolu gün, Pazar 20:00; `getWeekState`):

| Kurulum | İlk kart | Bekleme | Not |
|---|---|---|---|
| Pzt / Sal | Aynı Pazar | 6 / 5 gün | 3 günü doldurmak kolay |
| Çar / Per | Aynı Pazar | 4 / 3 gün | 5 / 4 günden 3'ü lazım |
| Cum | Aynı Pazar | 2 gün | Cum+Cmt+Paz'ın **üçü de** dolu olmalı, Pazar'da bugünü-önce-işaretle |
| Cmt / Paz | **Sonraki Pazar** | 8 / 7 gün | Ürünün ilk ödülü bir hafta geç; ara ödül de yok |

Ara ödül: **yok** (noktalar dışında). Bekleyen kullanıcı için "ne bekliyorum" hissi yalnızca bir iskelet ve "X gün daha lazım".

### İlk ay
- **Hafta 2-3:** Yeni kart, delta içerir ("geçen haftaya göre"). Kartların yeni olma hissi düşmeye başlar (3 varyant).
- **Hafta 4:** Geçmiş kartlar UI'da yok; "bir ay sonra ne biriktirdim?" sorusunun cevabı kullanıcıya gösterilmiyor (yalnızca son kart
  Pazar ekranında "tekrar gör").
- **Kaçırılan Pazar:** Pazartesi'den sonra o hafta kartı Hafta sekmesinde görünmez, bildirim yok. Kullanıcı ödülü (ve paylaşım
  fırsatını) fark etmeden kaybedebilir; ürünün tek "wow" anı haftada bir olduğu için bir kayıp = o haftanın tüm döngüsü boşa.
- **7+ gün uzak kalan:** Bildirimler sönümlenir; geri dönüş karşılaması yok (win-back yalnızca "uygulamayı kendisi açarsa" durumu).

## 3. En zayıf 3 halka

1. **Günlük ödül / geri bildirim (Ödül, günlük).** Kaydet anı ve sonrası boş [KOD]. Sıklık en yüksek eylem (günlük) için
   tatmin sıfır; haftalık kart tek başına 6-7 günlük boşluğu taşıyamaz (hipotez, K0). Bu halka "yetersiz" hissinin en olası kaynağı.
2. **Tetikten karta köprü (Tetik -> Ödül).** (i) Pazar bildirimi kartı açmıyor; (ii) kaçırılan haftanın kartına UI girişi yok;
   (iii) tek günlük bildirim metni. Wow anı bu zincirin sonunda; zincir kırılırsa ürünün en iyi parçası görülmüyor [KOD].
   Emülatörde BLG-09 "Düşük" işaretlendi; alışkanlık gözüyle **Yüksek** (tek dış tetiğin amacını boşa çıkarıyor).
3. **Yatırım / koleksiyon (Yatırım).** "Bir hafta sonra bu uygulama bana ne verir?" cevabı: bir kart. "Bir ay sonra?" cevabı:
   dört kartın **hiçbirine erişemiyorum**. Veri zaten cihazda dondurulmuş (`weekly_card`), yani kullanıcıya gösterilmeyen bir
   birikim var. İçerik havuzu sınırlı olduğundan (36 satır) koleksiyon olmadan yenilik de erimeye açık.

Sonraki (ikincil) zayıflıklar: tek saat aralığı, tek bildirim metni, izin reddi ölçülmüyor, paylaşımda uyku+harcama
varsayılan `???` olduğundan paylaşılan kartın yarısı boş görünmesi (paylaşım isteğini düşürebilir, K0), K5 bağlantısı.

## 4. Öneriler

Maliyet: **S** <= 1 gün, **M** 2-4 gün, **L** > 4 gün (AI destekli tek geliştirici; tahmin K0).
Her öneride etik testi: "bu, kullanıcının bilgilendirilmiş, hoşlanacağı davranışı mı artırıyor, yoksa zayıf anını mı sömürüyor?"

### Ö1. Kaydet sonrası "mikro-an" ve Hafta'ya geçiş
- **Fikir:** Kaydet sonrası ~1,5 sn'lik onay durumu (buton "Kaydedildi", hafif haptic) ve ardından Hafta sekmesine otomatik geçiş;
  bugünün noktası dolarken ilerleme tek cümleyle yansır. Cümle havuzu (8-10 varyant, ardışık tekrar yok, `copy.ts` tohum mantığıyla):
  "Bugün tamam. Kartın için 2 gün kaldı." / "Eşik doldu, kartın Pazar 20:00'de açılır." / "İlk gün tamam." / "Dünü de eklemiştin." Kullanıcının
  kendi ilerlemesinden türer (dolu gün, ilk gün, eşiğe ulaşma); **seviye/emoji/kategori içeriği yansımaz** (kilit ekranı ve wow sürprizi korunur).
- **Halka:** Ödül (günlük) + ilk 3 gün. Değişken ödülü gerçek veriyle bağlar (uydurma yok).
- **Gizlilik:** Uyumlu; ekran içi, cihazda, ağ yok.
- **Etik:** Sahte aciliyet yok, kayıp korkusu yok ("kaçırırsan" dili yasak); yalnızca ilerleme bildirimi. Atlanabilir/otomatik kapanır. Temiz.
- **Maliyet:** S (metin havuzu + form durumu + yönlendirme); `ekran-akisi.md` Ekran 2 güncellenir (plan sapması).
- **Ölçüt:** check-in/kurulum-günü yoğunluğu (`filledDays / dayNumber`), D7; hafta başına 4+ dolu gün oranı (yeni sayaç gerekir, bkz. bölüm 6).
- **Ajan:** `copywriter` (havuz), `ui-ux-designer` (durum/geçiş), `mobile-engineer` (uygulama).
- **Uyarı:** Kart içeriğini önceden sızdıran bir "ipucu" ödülü (ör. "bu hafta hareket yüksek gidiyor") **önerilmez**: wow anını tüketir ve
  içerik sızdırır.

### Ö2. Bildirime dokununca ilgili ekrana götürme (BLG-09 kapatma)
- **Fikir:** `card-ready` -> `/card/<weekStart>` (mevcut K3 ara ekranı ve `week-param` doğrulaması devreye girer), `daily` -> `/today`.
  Yük `{kind, weekStart}` (spec S8 #7'de zaten yazılı; kodda yalnızca `kind`).
- **Halka:** Tetik -> Ödül köprüsü.
- **Gizlilik:** Uyumlu (yerel yanıt dinleyicisi, push token'ı yok; `no-push.test.ts` taraması yasak adları kontrol eder, yeni dinleyici bunlara girmemeli).
- **Etik:** Temiz; kullanıcının zaten dokunduğu bildirimin vaat ettiği yere gitmesi.
- **Maliyet:** S-M (soğuk açılış + arka plan + onboarding kapısı ile etkileşim; `manual-checklist` B-03 yeniden koşulmalı).
- **Ölçüt:** Pazar 20:00 sonrası kart açan/kart hazır bildirimi alan; kart açma gecikmesi (yeni sayaç).
- **Ajan:** `mobile-engineer` + `mobile-platform-specialist` (soğuk/sıcak açılış), `qa-engineer`.
- **Kapsam:** Emülatör raporu "ayrı intent önerilir" demiş; `pazar-akisi.md` bu davranışı zaten varsaydığından yeni kapsam değil, mevcut belgenin
  uygulama açığı görüşündeyim. Karar `product-owner`/Batuhan'ın.

### Ö3. Kaçırılan haftanın kartına giriş
- **Fikir:** Hafta ekranında, `getCard` yok ve `getWeekState(geçenHafta).unlocked` iken "Geçen haftanın kartı hazır" kutusu
  (mevcut kilitli kart bileşeninin "hazır" durumu). İsteğe bağlı ikinci adım (spec değişikliği): **tek** Pazartesi öğlen bildirimi,
  yalnızca kart açılmamışsa, kart açılınca iptal.
- **Halka:** Ödül teslimi; yatırım görünürlüğü.
- **Gizlilik:** Uyumlu.
- **Etik:** Tek, iptal edilebilir, veri içermeyen bildirim; "kaçırdın" suçluluğu yok ("Geçen haftanın kartı seni bekliyor"). Bildirimsiz
  varyant (yalnızca UI girişi) her koşulda güvenli. Bildirimli varyant S8 "telafi yok" kuralını (netleştirme #5) değiştirir; kabul edilirse spec güncellenir.
- **Maliyet:** S-M (UI girişi); bildirim varyantı +S.
- **Ölçüt:** `card_unlocked` var ama `card_opened` yok oranı (kart teslim kaybı); Pazartesi'den sonra açılan kart sayısı (yeni sayaç).
- **Ajan:** `mobile-engineer`, `ui-ux-designer`; bildirim varyantı için `mobile-platform-specialist`.

### Ö4. Bildirim çeşitliliği, sıklık, sönümlenme, sessiz saat
- **Fikir:** (a) Günlük metin havuzu (6-8, ardışık tekrar yok, hepsi veri içermeyen; ton nötr-sıcak, "lazım/yap" emri yok). (b) Sıklık tavanı
  zaten günde <= 1 ve Pazar kartı hariç 7 gün: korunur. (c) Sessiz saat: 20-23 arası kullanıcı seçimi olduğundan ayrı bir "sessiz saat" gerekmez;
  gece 23:00 üstü kimseye bildirim planlanmıyor (korunmalı, aralık genişletilirse 23:30 üstü yasak). (d) Sönümlenme mevcut yapısal
  7 gün: korunur. Gün 5-7 penceresinde daha az baskılı metin alt havuzu ("İstersen bugünü 8 saniyede işaretle") tonu yumuşatır, sıklığı artırmaz.
- **Halka:** Tetik.
- **Gizlilik:** Uyumlu (sabit metin havuzu, veri yok; kilit ekranı).
- **Etik:** Sıklık artmıyor; sönümlenme ve kapatma yolu (Ayarlar anahtarı) dokunulmuyor. Temiz.
- **Maliyet:** S (içerik + seçim mantığı + spec S8 #7 "metinler sabit" netleştirmesi güncellenir).
- **Ölçüt:** 7. gün check-in, günlük dolu gün yoğunluğu; A/B olmadığından yalnızca dönemli karşılaştırma (bölüm 6).
- **Ajan:** `copywriter`, `mobile-engineer`.

### Ö5. Win-back ("yeni hafta hazır", utandırmayan geri dönüş)
- **Fikir:** 4+ gün boşluktan sonraki ilk açılışta (uygulama içi, bildirim değil) Bugün ekranında tek cümle: "Yeni bir hafta, temiz sayfa." Kaç gün
  geçtiği yazılmaz. Sönümlenmiş bildirimler açılışta yeniden kurulur (zaten öyle).
- **Halka:** Geri dönüş; ton.
- **Gizlilik:** Uyumlu. **Etik:** Utandırma/suçluluk yok; kapatmak için ekstra adım gerekmez (otomatik kaybolur).
- **Maliyet:** S. **Ölçüt:** 4+ gün boşluktan dönenlerin sonraki 7 günde dolu gün sayısı (kısıtlı; küçük n).
- **Ajan:** `copywriter`, `mobile-engineer`. Bildirimle win-back (7+ gün sonra) **önerilmez**: sönümlenme kararı "ısrar yok" ilkesidir.

### Ö6. Hatırlatma saati aralığı
- **Değerlendirme:** Yalnızca 20:00-23:00 (`REMINDER_TIME_PRESETS`, 4 çip) [KOD]. Çekirdek eylem "bugünü" işaretlemek olduğundan akşam saati
  mantıklı; sabah insanı için sorun "saat yok" değil "bugün henüz bitmedi". Gerçek boşluklar: 18:00-19:59 (işten çıkış, Pazar 20:00 kartıyla
  çakışmayan erken akşam) ve geceyi geç uyuyanlar (23:00 sonrası, "bugün" dün penceresine kayar). `notify-plan` HH:MM'i zaten genel kabul ediyor
  (`TIME_PATTERN`), yani sınır yalnızca arayüzde.
- **Öneri:** Kapalı denemede testçilere "hangi saat olurdu?" sor (bilgi topla); talep varsa çipleri 19:00-23:00'e genişlet (S). "Sabah, dünü işaretle" ayrı bir bildirim türü
  gerektirir -> bölüm 5 (ayrı intent). **Halka:** Tetik. **Etik:** Kullanıcı seçimi; sessizce saat değiştirme yok.
- **Ajan:** `product-owner` (karar), `mobile-engineer` (uygulama), `data-analyst` (sorunun kaydı).

### Ö7. Paylaşım sürtünmesi
- **Gözlem [KOD/BELGE]:** Paylaş -> önizleme (zorunlu) -> "Bu haliyle paylaş" -> sistem sayfası: 3 adım; uyku+harcama varsayılan `???`, unvan
  gizlenen kategoriye bağlıysa unvan da `???` (S7b). Güvenlik gereksinimi 3 gereği önizleme ve varsayılan gizleme **kalmalı**.
- **Fikir (güvenliği bozmadan):** (a) Önizlemeyi kart ekranıyla birleştirip adım sayısını 2'ye indir (aynı ekranda gizle/göster + Paylaş);
  (b) "???" satırlarını estetik/merak uyandıran görünüme getir (`visual-designer`); (c) "Hepsini göster" tek dokunuş (varsayılan gizli kalır).
  (d) Sosyal kanıt için damgada gerçek bağlantı (K5) ve isteğe bağlı QR: spec E5 seçeneği; gizlilik sözünü bozmaz ama mağaza URL'si ve karar bekler.
- **Halka:** Sosyal döngü / E1 birincil ölçütü. **Etik:** Paylaşımı gizleme varsayılanını gevşetme; suçluluk/sosyal baskı ("arkadaşların paylaştı") yok.
- **Maliyet:** M (birleştirme), S (görsel). **Ölçüt:** `share_initiated / card_opened`; `line_hidden` ortalaması.
- **Ajan:** `ui-ux-designer`, `visual-designer`, `growth-strategist`, `security-reviewer` (önizleme değişirse).
- **Not:** Paylaşım sürtünmesi sonucu E1'i doğrudan etkiler; müdahale zamanlaması için bölüm 6.

### Ö8. Seri mekaniği hakkında tutum
- Günlük seri sayacı **önerilmez**: kart eşiği haftada 4/7 (esnek), gün serisi kırıldığında utanç ve "0'dan başla" hissi yaratır, ürünün tonuyla
  (tavsiyesiz, yargısız) çelişir. Yerine kırılmayan bir birikim (kart koleksiyonu, Ö9) daha uygun.

## 5. Kapsam genişletme gerektirenler (ayrı `intent.md`, Batuhan kararı)

| Konu | Neden ayrı |
|---|---|
| **Geçmiş kartlar koleksiyonu ("Kartlarım"), hafta karnesi birikimi, n. kart sayacı, isteğe bağlı hafta serisi (kurtarma haklı)** | Spec "Dahil değil (v2+)": geçmiş kartlar galerisi; `ekran-akisi.md` "bilinçli dışarıda". Gizlilik sözüyle uyumlu (cihaz içi), ama yeni ekran/veri modeli. Yatırım halkasının asıl çözümü; en yüksek etkili ama bu yüzden ayrı karar. Tasarım notu: koleksiyon yalnızca artar (kırılma/kayıp yok), boş haftalar "boş kart" olarak gösterilmez. |
| Sabah "dünü işaretle" bildirimi / ikinci bildirim türü | Yeni bildirim kuralları (S8), sıklık üst sınırı gözden geçirilir |
| Home-screen/kilit ekranı widget'ı (check-in tetiği) | Spec: widget dışarıda; platform çalışması |
| QR/bağlantılı davet (kart üzerinden), mağaza URL'li damga | Spec E5 açık karar; mağaza/URL kararı |
| Arkadaş karşılaştırma, ortak kart, davet listesi, sıralama | Gizlilik sözünü zorlar (veri paylaşımı/sunucu) |
| Sunucu tabanlı/otomatik ölçüm (E1 Seçenek B), analitik SDK | Gizlilik sözü; Batuhan kararı |
| Bildirim dışında ek hatırlatma kanalı, e-posta vb. | Hesap/sunucu gerektirir |

Yeni `intent.md` gerektirmeyen ama spec/UX metnini güncelleyen (plan sapması + `product-owner` bilgilendirmesi): Ö1, Ö2, Ö3 (UI girişi), Ö4 (metin havuzu),
Ö5, Ö6 (çip aralığı), Ö7 (a-c), ölçüm sayaçları (spec S9 sabit küme genişler; Batuhan onayı, gizlilik sözü korunur).

## 6. Dönemli deney tasarımı ve ölçüm yeterliliği

### Mevcut sayaçlar neyi ölçer
| Hipotez | Mevcut ölçer | Yeterli mi? |
|---|---|---|
| D7 check-in var | `computeD7` (kurulum+6. gün dolu mu) | Evet (tanımlı, `pending/unknown` ayrı) |
| Kart açma oranı | `card_opened >= 1` / kurulum | Evet (kümülatif) |
| Kartı görenlerde paylaşım | `share_initiated >= 1` / `card_opened >= 1` | Evet (fazla/eksik sayım kabul edilmiş) |
| Check-in yoğunluğu | `filledDays / dayNumber` (Batuhan'ın elle hesabı) | Kaba; yeterli **yaklaşık** vekil |
| Ö1 mikro-an etkisi | D7 + yoğunluk | Dolaylı; hafta bazlı kırılım yok |
| Ö2 bildirim tıklama etkisi | Yok | **Yetersiz** |
| Ö3 kaçırılan kart | `card_unlocked` var/`card_opened` yok kümülatif | Kısmen (hangi hafta belli değil) |
| İlk 3 gün aktivasyon (D1-D3) | Yok (yalnızca D7) | **Yetersiz** |
| İlk kart gecikmesi (kurulum -> ilk kart günü) | Yok | **Yetersiz** |
| Bildirim izni durumu / saati | Yok | **Yetersiz** (D7 düşüşü bildirimsizlikten mi ürün mü ayırt edilemez, E13) |
| Hafta bazlı kırılım (H1 vs H2) | Rapor yalnızca kümülatif; `metric_event.at` yazılıyor ama hiçbir hesap kullanmıyor | **Yetersiz**; iki rapor farkı (G8/G15) ile kaba yaklaşım |

### Önerilen ek sayaçlar (kimliksiz; SDK/ağ yok; spec S9 değişikliği, `security-reviewer` + Batuhan onayı)
Rapor tarih/kimlik taşımamalı (S9 yasak deseni). Bu nedenle ham `at` yerine türetilmiş ofsetler:
1. `notif_permission_state` (granted/denied/undetermined; enum, tek değer).
2. `first_card_day_number` (kurulum gününe göre ilk `card_opened`'ın gün numarası).
3. `filled_days_by_week_index` (kurulumdan itibaren hafta 1..4 için dolu gün sayısı; tarih yok).
4. `card_opened_by_week_index` ve `share_initiated_by_week_index` (hafta 1..4 sayaçları).
5. `notification_opened_card_ready` / `notification_opened_daily` (bildirim tıklaması; Ö2 sonrası).
6. `card_opened_late` (Pazartesi'den sonra açılan kart sayısı; Ö3 sonrası).
7. D1-D3 doluluk bayrakları (gün 1, 2, 3'te check-in var mı).
Kaba saat bucket'ı (check-in saati 3'lü dilim) davranış izi taşıdığı için **önerilmez**, ya da ayrı gizlilik değerlendirmesi ister.

### Dönem planı (E1'i bozmadan)
Mevcut plan (G7 nötr E1, G14 çağrılı) iki dönemli. Müdahaleleri E1'e karıştırmamak için:
- **Dönem A (hafta 1, mevcut build, nötr):** E1 birincil ölçümü **yalnızca burada** sayılır. Bu dönemde davranışı etkileyen değişiklik yok.
- **Dönem B (hafta 2, müdahale build: Ö1 + Ö2 + Ö3 giriş, nötr):** Aynı testçiler, paylaşım çağrısı yok. E1'e **sayılmaz**; yalnızca alışkanlık ölçütleri (check-in yoğunluğu,
  kart açma, kaçırılan kart oranı).
- **Dönem C (hafta 3, çağrılı):** "Kartını paylaş" mesajı; ayrı raporlanır, E1'e sayılmaz (mevcut S12 kuralı).
- **Dönem D (hafta 4):** Serbest gözlem + geri bildirim; Ö4/Ö5/Ö7 adayları denemesiz kalır ya da B'ye eklenmişse ayrıştırılamaz (hangisinin etkisi bilinemez).
Tek seferde tek müdahale grubu (Ö1+Ö2+Ö3'ü bir paket sayarak) dışında ekleme yapma; paket içi etki ayrıştırılamaz, bu bilinçle kabul edilir.

### Ölçüt ve karar kuralı (öneri, kimse onaylamadı)
- Birincil (B'de): kurulumdan bağımsız **hafta başına dolu gün ortalaması** ve **hafta başına 4+ dolu gün alan kullanıcı oranı** (H1 -> H2 kişi içi karşılaştırma).
- İkincil: `card_opened / card_unlocked` (teslim oranı), D1-D3 doluluk, D7.
- Karar kuralı: en az 20 testçinin raporu varsa, **kişi içi** fark bakılır; kullanıcıların çoğunda (>= %60) hafta başına dolu gün artıyor/aynı kalıyor **ve** ortalama +0,5 gün
  veya üstü ise müdahale "işe yarar yönde sinyal" sayılır ve kalıcı yapılır (ayrıca maliyeti düşük olduğundan). Aksi halde zararsızsa bırakılır, geri alınmaz. Eşikler sezgiseldir (K0), örneklem
  20-30'da istatistiksel anlam taşımaz.
- **Karıştırıcılar (kabul):** ilk hafta/ilk kart etkisi (H1 zaten yeni), yenilik merakının düşmesi (H1'de yüksek, H2'de düşük olabilir), testçi seçilimi (arkadaş çevresi), sosyal
  beğenirlik, OEM pil yönetimi (bildirim gecikmesi), A/B kontrol grubunun olmaması. Bu yüzden H2'de "kötüleşme yok" savunulabilir, "iyileşti" iddiası savunulamaz.
- Kontrollü alternatif (n=24'ü ikiye bölmek) her kolda 12 kişi bırakır; anlamlı olamaz; önerilmez.

## 7. Doğrulanamayanlar

1. Gerçek cihazda bildirim gecikmesi ve OEM pil yönetimi (K4 `dumpsys` yalnızca emülatör; Doze'da 21:00'de tam dakika garantisi yok, `SCHEDULE_EXACT_ALARM` bilerek eklenmedi).
2. Bildirime **uygulama kapalıyken** dokunma davranışı (B-03 emülatörde kapalı durum denenmedi); BLG-09 yalnızca açık uygulamada görüldü.
3. "Kaydet sonrası hiçbir geri bildirim yok" iddiası **kod okumasına** dayanır; cihazda kronometre/gözlem yok.
4. Kaçırılan haftanın kartına UI girişi olmadığı iddiası `week.tsx` okumasıdır; K-07 (deep link ile geçen hafta) emülatörde atlandı.
5. Bırakma nedenleri (3. gün hipotezi) ve %25 eşiğinin doğruluğu; hiçbir gerçek kullanıcı verisi yok. Batuhan'ın "yetersiz" kararının hangi kısmı (günlük his mi, kart mı, paylaşım mı) bilinmiyor; kendi kullanımından hangi gün/an sıkıldığını yazması bu incelemenin en ucuz kanıtı olur.
6. İçerik havuzu tükenme süresi (~3 hafta) bir aritmetik çıkarımdır; kullanıcı seviyelerinin dağılımı ölçülmedi.
7. Paylaşım mesajı/bağlantı taşıması (K5), iOS davranışı (Apple üyeliği yok), emoji görünümü, reveal akışkanlığı (K-03).
8. Öneri etkileri ("D7'yi artırır" gibi) **K0**; yalnızca deneyle sınanabilir. Hiçbiri kanıtlanmış sayılmamalı.
9. Sayaç eklemenin spec S9 sabit küme ve mağaza "veri toplanmıyor" beyanıyla uyumu: cihaz içi kalıp rapor kullanıcı tetikli olduğundan uyumlu görünür; `security-reviewer` doğrulamalı.

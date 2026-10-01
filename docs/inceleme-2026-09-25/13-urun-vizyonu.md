# 13 — Ürün vizyonu: v1.5 planı (Haftik)

Tarih: 2026-09-28. Yazan: product-owner (Principal, karar alanı: ürün kapsamı). Durum: **öneri. Hiçbir madde "karar
verildi" değildir; kapsam, marka ve gizlilik sözüyle ilgili kararlar Batuhan'ındır (bölüm 6).** Kod, asset, yapılandırma ve
emülatöre dokunulmadı; commit yok. Yalnızca bu dosya yazıldı.

Okunan kaynaklar: `CLAUDE.md`, `intent/2026-09-20-haftalik-hayat-karti.md`, `spec.md` (MVP kapsamı, güvenlik gereksinimleri,
E1/E4), `plan.md` (başlıklar), `docs/inceleme-2026-09-25/01..10`. Bu belge 01'deki (aynı rolün) v1.1 teşhisinin **devamıdır**:
01 "denemeden önce neyi düzeltmeli" sorusunu cevapladı; bu belge "Batuhan'ın 'fazla basit ve amatör' yargısına karşı, dar
kapsamı bozmadan ürünü nasıl derinleştiririz" sorusunu cevaplar.

**Kanıt dili:** K0-K5 (`~/.claude/team/ortak-standartlar.md`). **Bu belgede kullanıcı davranışına dair hiçbir K5 kanıtı yok.**
Kapalı deneme başlamadı; "kullanıcı şunu yapar / bırakır" cümlelerinin hepsi **varsayımdır** ve öyle etiketlenmiştir. Kodla
kanıtlanmış bulgular (K1-K4) ilgili rapora bağlanır. Efor tahminleri ürün görüşüdür (K0); süreyi software-architect doğrular.

---

## Özet

1. **Teşhis:** Haftik "basit" değil. Çoğunlukla **eksik** (wow anına giden üç yol kırık: ilk kart yeniden açılamıyor, kaçırılan
   haftanın kartına yol yok, bildirim kartı açmıyor; hepsi K4) ve **yetersiz** (Expo şablon görünümü, "Word belgesi" kart,
   paylaşılan kartta unvan ~%80 `???`, sessiz Kaydet, yargı dili). Yalnızca bir yerde gerçekten **ince**: 4. haftayı taşıyacak
   birikim/derinlik yok (geçmiş kartlar görünmez, içerik ~3 haftada döner, kart kullanıcının zaten bildiğini söyler).
2. Bu yüzden v1.5 = **önce bitirme, sonra dar derinlik.** Yeni kategori, yeni veri kaynağı, sosyal katman, platform genişletme yok.
3. 21 zenginleştirme adayı RICE + risk düzeltmesiyle sıralandı (bölüm 4). 4 aday etik ya da tek yönlü kapı nedeniyle **hayır**
   (nadirlik, gün serisi, kategori seçimi, erken gerçek ilk kart); 7'si **v2**; kalan 10 aday 6 v1.5 maddesinde birleşti.
4. **Taban (v1.1, kapsam değil, ~6 gün):** 04/09'daki iki kritik hata, BLG-09, damga, içerik mantık/yargı geçişi, B14, migration
   atomikliği, ölçüm tamamlama, küçük akış hataları.
5. **v1.5 (6 madde, ~15,5 gün):** V1 Karne kimliği (görsel + mühür reveal), V2 Paylaşım anı (okunur unvan + önizleme = kart),
   V3 Günlük an, V4 İlk değer görünür (örnek kart), V5 İçerik derinliği + kıyas anlatısı, V6 Karnelerim (geçmiş kartlar, kırılmaz
   birikim).
6. **Toplam ~21-22 iş günü (aralık 19-25, K0).** Öneri: Taban + çekirdek (V1-V4, ~16 gün) denemeden önce; V5 + V6 "ikinci yapı"
   olarak denemenin nötr haftası bittikten sonra, kullanıcılar 2. kartlarını alırken.
7. Yeni intent gerektirenler: V6 (Karnelerim), V2 (paylaşım unvanı: veri modeli + güvenlik gereksinimi 3'ün uygulanma biçimi).
   Taslakları ve üç v2 intent başlığı bölüm 7'de.
8. Batuhan'a 10 kısa karar (bölüm 6); en kritikleri paketleme/sıra (K-1), unvan mekanizması (K-2), görsel yön ve "karne mi kart
   mı" (K-3, K-4: 02 ile 10 arasında çelişki var).

---

## 1. "Basit" mi, "yetersiz" mi? Dürüst cevap

**Kısa cevap: Haftik bugün "basit" değil; çoğunlukla "eksik" ve "yetersiz", tek bir yerde de gerçekten "ince".**

- **Basit** = az şey yapar ama yaptığını iyi yapar. Bu, hedeflenen durumdur (ortak ders: "kapsam değil bitirme"). Dört emoji +
  haftalık kart kapsamı doğru dar kapsamdır; özellik sayısı sorun değil.
- **Eksik** = söz verdiği akış çalışmıyor. **Yetersiz** = çalışıyor ama kalitesi vaat edilen duyguyu üretmiyor. **İnce** = dar
  kapsamın içinde bile, kullanıcıyı 3-4 hafta taşıyacak derinlik yok.

| Semptom ("basit/amatör" hissi) | Sınıf | Kanıt (rapor, K) | Özellik eklemek çare mi? |
|---|---|---|---|
| İlk kart (3 günle açıldıysa) kapatılınca bir daha açılamıyor; Hafta ekranı "1 gün daha lazım" diyor | **Eksik** (hata) | 04 #1, 09 #1 (K2 + K4) | Hayır, hata düzeltmesi |
| Kaçırılan Pazar = kayıp kart; "Karnen hazır" bildirimi kartı açmıyor | **Eksik** (spec'te yazılı, uygulanmamış) | 04 #2, 09 #2 ve #5 (K4) | Hayır |
| Uygulama Expo şablonu gibi görünüyor: ikon, splash, renk, gri kutular; kart "beyaz bir Word belgesi" | **Yetersiz** (deneyim) | 10 G1-G5 (K1 + K4) | Hayır, kimlik ve cila |
| Paylaşılan kartta unvan kombinasyonların ~%80'inde `???`; iki satır da `???` | **Yetersiz** (dağıtım) | 09 #3 (K2 sayım: 81'de 15-16 görünür), 02 §2.4 | Kısmen: mekanizma değişikliği gerekir |
| Kaydet'e basınca hiçbir şey olmuyor | **Yetersiz** (alışkanlık) | 09 #9 (K4), 03 zayıf halka 1 | Hayır, mikro an |
| Orta seviye satırlar sönük, yargı dili ("kötü/iyi", "Neredeyse Kusursuz"), mantık hataları | **Yetersiz** (içerik) | 02 §2-3 (K1) | Hayır, içerik geçişi |
| 4. haftada ne kalıyor? Geçmiş kartlar görünmez; satır havuzu ~3 haftada döner; unvanların tek metni var; kart kullanıcının zaten bildiğini söylüyor (ayna etkisi) | **İnce** (değer + yatırım) | 03 zayıf halka 3, 01 T1/T9, 02 L-3 (K1; etkisi K0) | **Evet, burada dar bir derinlik katmanı meşru** |

**Sonuç ve ağırlık (K0, ürün görüşü):** Batuhan'ın gördüğü "amatör" hissinin büyük kısmı ilk üç satırdan geliyor (kırık yollar +
şablon görünüm). Bunlar özellik eklenerek değil, **bitirilerek** kapanır. Ancak son satır gerçek: kapsam doğru dar olsa bile,
ürün bugün "ilk kart"a kadar tasarlanmış, "dördüncü kart"a kadar değil. v1.5'in işi bu yüzden iki parçalı:
(1) wow anını eksiksiz ve güzel yapmak, (2) **aynı wow anının etrafına** 4. haftayı taşıyacak ince bir birikim/derinlik katmanı
koymak. Yeni kategori, yeni veri kaynağı, sosyal katman, platform genişletme yok.

Not (01 H0): Batuhan'ın yargısı emülatörde çoğunlukla Bugün/Hafta/Ayarlar ekranlarına dayanıyor; kart akışı organik olarak 3+ gün
ve Pazar 20:00 sonra görülüyor. Kart akışını dev menüyle baştan sona yaşadıktan sonra yargının hangi satıra kaydığını 3 cümleyle
yazması, bu belgedeki sıralamayı teyit etmenin en ucuz yolu (15 dakika).

---

## 2. Teşhis: kullanıcı neden tatmin olmaz veya bırakır?

Değer zinciri: edinme → aktivasyon (ilk kart) → alışkanlık (4+ gün/hafta, her Pazar) → paylaşım. Aşağıdaki "bırakma nedeni"
sütunu **hipotezdir (K0)**; "ne yaşıyor" sütunu kod ve emülatör kanıtına dayanır.

### 2.1 İlk gün (ilk 10 saniye → ilk akşam)

| Ne yaşıyor | Kanıt | Neden tatmin olmaz / bırakır (hipotez) | Katman | Çare (bölüm 5) |
|---|---|---|---|---|
| Üç metin-yalnız onboarding ekranı; örnek kart yok, görsel yok | 01 §1.2, 10 G2 (K1/K4) | Getiriyi görmüyor; "Pazar ne alacağım?" sorusu cevapsız | Değer / aktivasyon | V4 |
| Expo ikonu, Expo splash, siyah-beyaz-gri kabuk, emoji sekmeler | 10 G1, G2, G8; 07 A17 | İlk izlenim "prototip"; güven ve özen algısı düşük | Deneyim | V1 |
| 12 eş ağırlıklı gri kutu; Kaydet'ten sonra ekran aynı kalıyor | 10 G3; 09 #9 (K4: 0,4 ve 2 sn karesi aynı) | "Kaydetti mi?" belirsizliği; günlük tek eylemin ödülü sıfır | Alışkanlık | V3 |
| Hafta sekmesinde gri iskelet + "Kartın için X gün daha lazım" | 10 G4; 02 §4.2 | Ödül değil "yükleniyor" ekranı; "lazım" gereklilik tonu | Deneyim / içerik | V1, V3 |
| Uyku düğmesi "kötü / idare / iyi", sosyal "yalnız" | 02 M-1 (K1) | Yargılanma hissi; mağaza "yargılamaz" diyor | İçerik | Taban T5 |

### 2.2 Yedinci gün

İlk kart kurulum gününe göre 2-8 gün sonra gelir (ortalama ~5 gün, 01 §1.2). **Cumartesi/Pazar kuranlar 7. günde henüz hiç kart
görmemiştir** (ilk kart 7-8. gün): D7 ölçümü tam bu kişilerde ödülsüz bir haftaya denk gelir.

| Ne yaşıyor | Kanıt | Neden tatmin olmaz / bırakır (hipotez) | Katman | Çare |
|---|---|---|---|---|
| Pazar 20:00 bildirimine dokunuyor, kart değil son ekran açılıyor | 09 #5 (K4) | Wow anına 3-5 dokunuş; tetik boşa gidiyor | Akış | Taban T3 |
| İlk kart 3 günle açıldıysa Kapat'tan sonra kart kilitli görünüyor, bir daha açılmıyor | 04 #1, 09 #1 (K4) | **Ürünün tek ödülü kayboluyor, uygulama bozuk görünüyor.** E4(b) bunu en olası ilk kart yolu yapıyor | Akış (hata) | Taban T1 |
| Pazar akşamı bakmadıysa Pazartesi kart yok | 04 #2, 09 #2 (K4) | Haftanın tüm döngüsü boşa | Akış | Taban T2 |
| Kart beyaz zemin, siyah metin, 11 px %65 opak damga, yer tutucu bağlantı | 10 G5; 07 A18 | Ekran görüntüsü almaya değmeyen artefakt | Deneyim / dağıtım | V1, Taban T4 |
| Son cümle "Bu ilk kartın, önceki haftayla kıyas henüz yok." | 09 #10 (K4); 01 T7 | İlk wow anı bir yokluk bildirimiyle kapanıyor | İçerik | Taban T5 |
| Paylaş'a basınca önizleme bir liste (kartın kendisi değil); unvan çoğunlukla `???`; "< Geri" durum çubuğunda tepkisiz | 10 G6-G7; 09 #4 ve genel tur (K4) | Paylaşılacak şey "hata" gibi görünüyor; paylaşım vazgeçiliyor | Dağıtım | V2 |

### 2.3 Dördüncü hafta

| Ne yaşıyor | Kanıt | Neden tatmin olmaz / bırakır (hipotez) | Katman | Çare |
|---|---|---|---|---|
| 3-4 kartı var ama hiçbirine erişemiyor; yalnızca bu haftanın kartı "tekrar gör" | 03 §1 "Yatırım" satırı (K1) | "Bir ay sonra ne biriktirdim?" cevabı yok; birikim görünmez | Alışkanlık (yatırım) | V6 |
| Satır havuzu kategori x seviye başına 3 varyant; orta seviye (en sık) en zayıf; unvanların tek metni var | 02 §2.3, L-3; 03 §1 (K1; ~3 hafta dönüş aritmetik çıkarım) | Sürpriz bitiyor; "aynı cümleler" | İçerik | V5 |
| Kart, kullanıcının zaten seçtiği 4x3 beyanı geri söylüyor | 01 T1 (K1 + K0 çıkarım) | "Zaten biliyordum" (ayna etkisi); Wrapped'ın "bilmediğini öğrenme" hissi yok | Değer | V5 (kıyas anlatısı); v2 I-4 |
| Kıyas özeti yalnızca kova düzeyinde ("çoğu kategori..."; 1 yükselen + 3 sabitte de "çoğu" diyor) | 02 §2.5 M-3 (K1) | Değişimin hikâyesi yok, bazen yanlış | İçerik | Taban T5 (mantık), V5 (anlatı) |
| Aynı 9:16 formatı her hafta aynı kanala | intent OQ4 (ölçülmemiş) | Paylaşım yorgunluğu (varsayım) | Dağıtım | v2 (I-3, kare format) |
| Bildirim her gün aynı metin; 7 gün sonra sönümleniyor (doğru), geri dönüşte karşılama yok | 03 Ö4-Ö5 (K1) | Alışma, sessiz kopuş | Alışkanlık | V3 |

**Teşhisin özü:** İlk gün ve 7. gün sorunları **bitirme** sorunudur (taban + V1-V4). 4. hafta sorunu **derinlik** sorunudur ve dar
kapsamın içinde çözülebilir: veri zaten cihazda dondurulmuş (`weekly_card`), yalnızca gösterilmiyor ve içerik havuzu ince (V5-V6).

---

## 3. Zenginleştirme adayları (21 aday)

Sütunlar: **Değer** = kullanıcı ne kazanır. **Gizlilik** = "veri yalnızca cihazda, hesap/sunucu/analitik yok, kartta ham
sayı/tarih yok, uyku+harcama varsayılan gizli, unvan gizlenen kategoriden türetilmez" sözünü bozuyor mu. **Efor** (solo, Claude
destekli): S <= 1 gün, M 2-4 gün, L > 4 gün (K0). **Çözdüğü bulgu** = inceleme raporu ve bulgu numarası.

| # | Aday | Değer | Gizlilik uyumu | Efor | Risk | Bağımlılık | Çözdüğü bulgu |
|---|---|---|---|---|---|---|---|
| Z1 | **Karnelerim** (geçmiş kartlar listesi; dokununca dondurulmuş kart; tekrar paylaş) | Birikim görünür; 4. hafta için dönüş nedeni; kaçırılan kartın doğal evi | Uyumlu (cihaz içi, zaten dondurulmuş veri). Yan etki: telefonu eline alan biri geçmişi görür (N-9 uygulama kilidi kararını hatırlatır) | M | Düşük; spec "Dahil değil (v2+)" → intent şart | Taban T1/T2 (uygunluk düzeltmesi), V1 (küçük kart görünümü) | 03 zayıf halka 3; 01 §4.5-3; 04 #2 (UI yolu) |
| Z2 | Unvan koleksiyonu ("topladığın unvanlar"; kilitli/eksik yuva gösterilmez) | Kimlik + hafif merak | Uyumlu (uygulama içi) | S (Z1 üstüne) | Orta: "hepsini topla" baskısı; eksik yuvalar gösterilirse kullanıcı uyku/harcama davranışını unvan için değiştirmeye itilir | Z1 | 03 zayıf halka 3; 02 L-3 |
| Z3 | Unvan nadirliği ("nadir" etiketi ya da yüzde) | Paylaşılabilir övünme anı | Veri gerekmez (81 kombinasyonun kural frekansından hesaplanır), ama "nadir" çoğunlukla uç seviyelerdir | S-M | **Yüksek etik risk:** nadir = az uyku, çok harcama gibi uçları ödüllendirir; yargısız ton sözüyle çelişir | Z2 | - |
| Z4 | Hafta hafta trend / mini grafik (4-8 hafta, kategori başına) | "Değişimi görme" | Uygulama içi uyumlu; karta asla girmemeli (tarih/ham seviye) | M-L (`react-native-svg` yok; View tabanlı çubuk ya da yeni bağımlılık) | Ürünü intent'in karşı konumlandığı "sıkıcı takip paneli"ne (Daylio, Bearable) çevirir; yukarı/aşağı okları yargı gibi okunur | Z1 | 01 T1 (kısmen) |
| Z5 | **"Önceki haftaya göre" anlatı** (hangi kategori hızlandı/yavaşladı; tek yükselen ile "çoğu" ayrımı) | Kıyasın hikâyesi; ayna etkisine kısmi çare | **Koşullu:** kartta gizli kategori adı/yönü **yazılamaz** (özet her zaman görünür, 02 §2.5). Kategori adlı anlatı yalnızca uygulama içinde (PNG dışında), kartta kategori-nötr | S-M | Gizli kategori yönünü sızdırma riski; security-reviewer bakmalı | V5 içerik geçişi | 02 M-3, §6.3; 01 T1 |
| Z6 | **İçerik derinliği** (satır 36 → ~60, özet 12 → ~28, unvana varyant, yeni kovalar: tam hafta, geri dönüş, hafif/büyük yükseliş) | Sürpriz 3 haftadan daha uzun sürer; en sık görülen orta kart canlanır | Uyumlu (statik havuz; rakamsız, <= 60 karakter kuralları korunur) | M | Düşük; `CONTENT_VERSION` 2; yeni kova = domain tipi + test değişikliği | Taban T5 (mantık düzeltmeleri önce) | 02 §6; 01 T8/T9; 03 §1 ödül satırı |
| Z7 | **Etik birikim** ("12. karnen"; kırılmaz, sıfırlanmaz) | Yatırım hissi; seri kaybı yok | Uyumlu; rakam yalnızca uygulama içinde, PNG'de değil | S (Z1 üstüne) | Düşük (03 Ö8 ile uyumlu: kırılmayan birikim) | Z1 | 03 Ö8, §5 |
| Z8 | Günlük seri sayacı (gün serisi) | Kısa vadeli dönüş dürtüsü | Uyumlu | S | **Etik risk:** kırılınca utanç, "0'dan başla"; eşik zaten esnek (4/7) | - | - (03 Ö8 açıkça önermiyor) |
| Z9 | Android ana ekran widget'ı (haftanın noktaları, "bugünü işaretle") | Bildirimsiz tetik | Ana ekranda görünür: seviye/emoji **asla**, yalnızca dolu gün noktası | L (yeni native modül/config plugin; iOS'ta WidgetKit + Apple üyeliği) | Platform/OEM davranışı; K5 şart; spec "Dahil değil" | mobile-platform-specialist incelemesi | 03 §5 |
| Z10 | Dönem karnesi (aylık / mevsimlik "Ay karnesi") | Kıtlık = daha değerli ikinci paylaşım anı; haftalık yorgunluğa panzehir | **Koşullu:** "Eylül karnesi" demek tarih ifşasıdır; ad tarihsiz olmalı ("Ay karnesi") | M-L (yeni kural motoru + içerik + kart düzeni) | 4 haftalık denemede en fazla bir kez görülür, ölçülemez | Z1, Z6 | intent OQ4 |
| Z11 | Kategori seçimi (4'ün yerine kullanıcının seçtiği set) | Kişisel uyum | Uyumlu ama Health apps beyanı değişebilir | L | **Tek yönlü kapı:** veri şeması, 81 kombinasyon kapsaması, tüm içerik havuzu x N; spec "Dahil değil" | - | - |
| Z12 | Kart stilleri / tema seçimi (2-3 zemin/çerçeve) | Kendini ifade; akışta çeşitlilik | Uyumlu; renk seviyeyi kodlamamalı | M | Erken aşamada marka tanınırlığını (mühür) sulandırır; QA x3 | V1 (tek kimlik önce) | 10 §2 (yön C riskleri) |
| Z13 | Paylaşım varyantı: kare 1:1 (sohbet/akış), 9:16 korunur | WhatsApp önizlemesinde okunurluk (10 §4: 0,23 ölçekte yalnızca unvan okunur) | Uyumlu; aynı gizleme kuralları | M | İki düzen = iki kat QA, K5 hedef testi | V1, V2 | 10 §4 |
| Z14 | **Örnek kart** ("ÖRNEK" damgalı, uydurma içerik) onboarding'de; kilitli kutu kartın minyatürü | Getiri ilk 10 saniyede görünür | Uyumlu (kullanıcı verisi okumaz) | S | Örneği kendi kartı sanma (damga kapatır); ilk gerçek kartın sürprizini azaltma (örnek farklı unvan kullanır) | V1 (yeni kart görünümü) | 01 T2, P9; 10 §5 |
| Z15 | Erken gerçek ilk kart (Pazar'ı beklemeden 3. dolu günün akşamı) | İlk değere süre ~5 günden ~3 güne | Uyumlu | M-L | **Tek yönlü kapı:** "bir hafta = bir kart" şeması (`weekly_card` hafta anahtarlı), Pazar ritüeli ve bildirim planı bozulur | - | 01 §1.2 (ilk değere süre) |
| Z16 | **Günlük an**: Kaydet onayı + ilerleme cümlesi havuzu + eşik anı + bildirim metin havuzu + utandırmayan geri dönüş satırı | Günlük eylemin tatmini; tetik çeşitliliği | Uyumlu: cümleler ilerlemeden türer, seviye/kategori içeriği sızmaz; bildirimde veri yok | S | Düşük (etik test: kayıp korkusu dili yasak) | - | 03 Ö1, Ö4, Ö5; 09 #9; 01 T4/T12 |
| Z17 | **Karne kimliği**: görsel kimlik (kâğıt, mürekkep, mor mühür), kart kompozisyonu, ikon/splash, ekran durumları, reveal'da "mühür basılması" (+ isteğe bağlı haptik) | Algılanan kalite; wow anının duygusu; paylaşılacak artefaktın imzası | Uyumlu; kategoriye/seviyeye göre renk yok (10 §3) | M-L | Zaman kutusu aşılabilir; `layout.test.ts` beklentileri bilinçli değişir (Batuhan onayı) | Batuhan: yön (A/B/C) ve "karne/kart" sözcüğü | 10 G1-G8; 01 T3/T5; 07 A17 |
| Z18 | **Paylaşılabilir unvan**: kart üretilirken yalnızca varsayılan açık kategorilerden ya da kategori-bağımsız kurallardan türeyen ikinci bir "paylaşım unvanı" da dondurulur; asıl unvan gizlenince o görünür. Kalan durumlarda `???` yerine "sansür şeridi" | Paylaşılan kartın kancası geri gelir | **Koşullu uyumlu:** güvenlik gereksinimi 3 korunur (gizlenen kategoriden türetilmez); veri modeli değişir | M | Şema (ek sütun, v3 migration; v2 numarası yakıldı, 08 TB-1); seviye ipucu riski → security-reviewer | Taban T7 (migration atomikliği) | 09 #3-4; 02 §2.4 (seçenek B); 10 G6; 01 T13 |
| Z19 | Önizleme = kartın kendisi (küçültülmüş gerçek `CardView`), paylaşım 3 adım → 2 adım | Ne paylaştığını görerek paylaşma | Uyumlu; zorunlu önizleme ve varsayılan gizleme korunur | M | Akış değişikliği; ui-ux-designer önce bakmalı | V1 | 10 G7; 03 Ö7; 09 önizleme "< Geri" |
| Z20 | "Haftanın deseni" içgörü satırı (ör. haftanın en hareketli günü) | Ayna etkisine en güçlü çare adayı: kullanıcının bilmediği bir şey | **Koşullu:** gün bilgisi davranış izidir; kartta tarih yok kuralıyla birlikte değerlendirilmeli | M | Yeni içerik türü; gizlilik incelemesi; H4 kanıtı yok | Z6 | 01 T1, H4 |
| Z21 | Hatırlatma saati aralığını genişletme (19:00-23:00) / sabah "dünü işaretle" | Farklı ritimdeki kullanıcı | Uyumlu | S / M | Talep kanıtı yok; 23:00 zaten gece yarısını aşabiliyor (05 N-02, 09 V-10: pencere +1 saat) | - | 03 Ö6 |

**Değerlendirme dışı (tartışma dışı kısıtlar):** arkadaş karşılaştırma, hesap/bulut yedek, sunucu tabanlı ölçüm, analitik SDK,
OTA, otomatik veri kaynağı (Health Connect/HealthKit), iOS öne alma, yeni kategori (ruh hali). Bunlar intent ve spec kısıtlarıdır.

---

## 4. Önceliklendirme (RICE + risk düzeltmesi)

### 4.1 Yöntem

- **R (Reach):** 4 haftalık kapalı denemede maddenin dokunduğu testçi payı (0-1). Örn. arşiv yalnızca 2+ kartı olanlara dokunur.
- **I (Impact):** iki birincil ölçüte (kartı görenlerde paylaşım oranı E1 >= %25; D7/haftalık dönüş) beklenen etki: 3 çok büyük,
  2 yüksek, 1 orta, 0,5 düşük, 0,25 çok düşük. Algılanan kalite dolaylı sayılır.
- **C (Confidence):** 0,8 sorun K4 kanıtlı ve çarenin yönü belli; 0,5 sorun K1-K4 kanıtlı, çarenin etkisi K0; 0,3 sorun ve çare K0;
  0,2 spekülatif.
- **E (Effort):** iş günü, solo + Claude (K0; architect doğrular).
- **Skor = R x I x C / E.** **Risk düzeltmesi:** geri dönüşsüz kapı (veri şeması, kamuya açık söz, ritüel yapısı) varsa x0,7 ve
  "yavaşlat" etiketi (architect + security incelemesi şart). **Etik kırmızı çizgi** (utandırma, kayıp korkusu, uç davranışı
  ödüllendirme) skor ne olursa olsun "hayır".
- RICE bir sıralama aracıdır, karar değil. Skordan sapılan her yerde gerekçe yazılıdır.

### 4.2 Tablo (son skora göre)

| Sıra | # | Aday | R | I | C | E | Ham | Risk | Son | Karar | Gerekçe |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Z16 | Günlük an | 1,0 | 1 | 0,5 | 1,25 | 0,40 | - | **0,40** | **v1.5 (V3)** | Her gün, her kullanıcı; K4 kanıtlı boşluk; ucuz |
| 2 | Z14 | Örnek kart + minyatür | 1,0 | 1 | 0,3 | 1,0 | 0,30 | - | **0,30** | **v1.5 (V4)**, kanıt bekleyen | İlk 10 saniye; H0 ve 5 kişilik testle teyit |
| 3 | Z7 | Etik birikim | 0,5 | 0,5 | 0,3 | 0,25 | 0,30 | - | **0,30** | **v1.5 (V6 içinde)** | Tek başına anlamsız; Z1'in üstünde neredeyse bedava |
| 4 | Z18 | Paylaşılabilir unvan | 0,7 | 3 | 0,5 | 2,5 | 0,42 | x0,7 (şema) | **0,29** | **v1.5 (V2)**, yavaşlat | Birincil ölçüte en doğrudan etki; şema nedeniyle önce ölçüm + inceleme |
| 5 | Z17 | Karne kimliği | 1,0 | 2 | 0,5 | 4,0 | 0,25 | - | **0,25** | **v1.5 (V1)** | Batuhan'ın en görünür şikâyeti; ikon yayın kapısı; paylaşılan PNG kamuya açık |
| 6 | Z19 | Önizleme = kart | 0,7 | 1 | 0,5 | 1,5 | 0,23 | - | **0,23** | **v1.5 (V2 içinde)** | Paylaşım anının parçası; ayrı madde değil |
| 7 | Z5 | Kıyas anlatısı | 0,6 | 0,5 | 0,5 | 0,75 | 0,20 | - | **0,20** | **v1.5 (V5 içinde)** | Kartta kategori-nötr kalmak şartıyla |
| 8 | Z6 | İçerik derinliği | 0,5 | 1 | 0,5 | 2,0 | 0,125 | - | **0,13** | **v1.5 (V5)** | 3-4. hafta; solo için en ucuz derinlik (metin) |
| 9 | Z1 | Karnelerim | 0,5 | 2 | 0,3 | 3,0 | 0,10 | - | **0,10** | **v1.5 (V6)**, stratejik, kesmede ilk düşen | Aşağıdaki not |
| 10 | Z2 | Unvan koleksiyonu (kilitli yuva yok) | 0,5 | 0,5 | 0,3 | 0,75 | 0,10 | - | 0,10 | V6'nın kesilebilir alt maddesi | Eksik yuva/nadirlik olmadan |
| 11 | Z21 | Saat aralığı / sabah bildirimi | 0,2 | 0,5 | 0,3 | 0,3 | 0,10 | - | 0,10 | **v2** | Talep kanıtı yok; denemede "hangi saat?" sorulur; N-02 önce |
| 12 | Z20 | Haftanın deseni | 0,7 | 1 | 0,3 | 3,0 | 0,07 | - | 0,07 | **v2** (I-4) | H4 "ayna etkisi" kalırsa; gizlilik incelemesi ister |
| 13 | Z13 | Kare 1:1 format | 0,5 | 0,5 | 0,3 | 2,0 | 0,04 | - | 0,04 | **v2** | Önce denemede "nereye paylaştın?" |
| 14 | Z10 | Dönem karnesi | 0,2 | 2 | 0,3 | 4,0 | 0,03 | - | 0,03 | **v2** (I-3) | 4 haftada ölçülemez; paylaşım yorgunluğu verisine bağlı |
| 15 | Z12 | Kart stilleri | 0,4 | 0,5 | 0,3 | 2,5 | 0,02 | - | 0,02 | **v2** | Önce tek güçlü kimlik tanınsın |
| 16 | Z4 | Trend grafik | 0,4 | 0,5 | 0,3 | 3,0 | 0,02 | - | 0,02 | **v2 ya da hiç** | "Takip paneli"ne kayma riski |
| 17 | Z9 | Android widget | 0,3 | 1 | 0,3 | 5,0 | 0,02 | - | 0,02 | **v2** (I-5) | L efor, K5 şart, iOS'ta ayrı iş |
| - | Z15 | Erken gerçek ilk kart | 0,6 | 1 | 0,3 | 3,0 | 0,06 | x0,7 | 0,04 | **Hayır** (bu biçimde) | "Bir hafta = bir kart" şeması ve Pazar ritüeli; yerine Z14 |
| - | Z11 | Kategori seçimi | 1,0 | 1 | 0,2 | 6,0 | 0,03 | x0,7 | 0,02 | **Hayır** | Tek yönlü kapı; içerik x N; spec dışı |
| - | Z3 | Unvan nadirliği | 0,5 | 1 | 0,3 | 1,0 | 0,15 | etik | 0 | **Hayır** | Uç uyku/harcamayı ödüllendirir |
| - | Z8 | Gün serisi | 1,0 | 0,5 | 0,3 | 0,75 | 0,20 | etik | 0 | **Hayır** | Kırılınca utanç; yerine kırılmayan birikim (Z7) |

Dağılım: **10 aday v1.5'e (6 maddede birleşik), 7 aday v2'ye, 4 aday hayır.**

**Not: Z1 (Karnelerim) neden skoruna rağmen v1.5'te?** RICE onu düşük puanlıyor, çünkü 4 haftalık denemede dokunduğu kişi az ve
etkisi K0. Yine de girmesinin üç gerekçesi var: (1) bölüm 1'deki tek "gerçekten ince" teşhisin (4. hafta, yatırım halkası) dar
kapsam içindeki tek cevabı; (2) yeni veri toplamaz, zaten dondurulmuş veriyi gösterir; (3) T2'nin (kaçırılan kart) kalıcı evi olur.
Ama birincil ölçütlere (E1, D7) doğrudan etkisi yok. Bu yüzden **kesme sırasında ilk düşen maddedir** ve deneme içindeki ikinci
yapıya konur (5.2). Z21 aynı skorda olduğu halde girmiyor: talep kanıtı yok ve çözülmemiş bir platform sorunu (N-02) taşıyor.

### 4.3 Kanıt bekleyen / karar bekleyen

- **Karar bekleyen (deneme gerekmez, yönü belli, geri alınabilir):** Taban (T1-T9), V3, V1'in kart + ikon + reveal kısmı,
  V5'in mantık düzeltme kısmı. V2'nin **sorunu** kanıtlı (K2 sayım), **mekanizması** karar bekliyor (K-2).
- **Kanıt bekleyen (önce ölç ya da denemede ölç):** V4 (H0 + 5 kişilik ilk oturum testi), V1'in ekran cilası (H5), V5'in derinlik
  kısmı (gerçek seviye dağılımı), V6 (alışkanlık etkisi; denemede `archive_opened` ile ölçülür), V2'nin kullanıcı etkisi (H1).

### 4.4 Toplam efor (K0, architect doğrulayacak)

| Paket | Efor (iş günü) |
|---|---|
| Faz 0: commit, H0, kararlar, 08 "şimdi" mühendislik paketi | ~0,5-1 (çoğu Batuhan) |
| Taban T1-T9 | ~6 (5-7) |
| Çekirdek v1.5: V1 + V2 + V3 + V4 | ~10 (9-12) |
| İkinci yapı: V5 + V6 | ~5,5 (5-6,5) |
| **Toplam** | **~21-22 (19-25)** |
| v2 / hayır maddeleri | 0 (yalnızca intent taslağı) |

---

## 5. Önerilen sürüm kapsamı (v1.5)

### 5.0 Taban (v1.1): kapsam değil, "eksik"i kapatma. v1.5'in önkoşulu

Bunlar yeni özellik değildir; spec'te yazılı davranışın tamamlanması veya hata düzeltmesidir. Intent gerektirmez; `plan.md`'ye
"uygulama notu" olarak işlenir.

| # | Ne | Kaynak | Efor | Bitti kanıtı (K) |
|---|---|---|---|---|
| T1 | İlk kartın yeniden açılamaması: eşik hesabında haftanın kendi kartı sayılmaz; kart varsa "Kartın açıldı / tekrar görmek için dokun" her dalın önünde | 04 #1, 09 #1 | 0,5 | K2 regresyon testi (3 günlük ilk kart → dondur → Hafta "Kartın açıldı"); K4: 09 #1 senaryosu GEÇER |
| T2 | Geçen haftanın uygun ama açılmamış kartına Hafta ekranından giriş ("Geçen haftanın kartı seni bekliyor") | 04 #2, 09 #2, spec:181 | 1 | K2 + K4: 09 #2 senaryosu ve checklist K-07 GEÇER |
| T3 | Bildirime dokunma: "Karnen hazır" → kart (gerekirse K3 ara ekranı), günlük → Bugün. Bildirim verisi `week-param` ile doğrulanır. Önce `openOrBuildCard`'da `now` zorunlu (08 TB-10) | 09 #5, 03 Ö2, 08 M-3 | 1,25 | K4 sıcak + soğuk açılış (09 #5 GEÇER); B-06 ilk kez koşulur |
| T4 | Damga ve paylaşım mesajı: K5 kararına göre; bağlantı yoksa yalnızca "Haftik" | 07 A18, 02 §4.5 | 0,25 | K4: PNG'de köşeli parantezli metin 0 |
| T5 | İçerik mantık/yargı geçişi: uyku "kısa/orta/uzun", sosyal "sakin/orta/kalabalık", 02'deki en zayıf 10, M-2/M-3/M-4, ilk kart özeti "başlangıç çizgisi" tonu; `CONTENT_VERSION` 2 | 02 §2-5, 01 T6/T7 | 1 | K2 içerik testleri yeşil + Batuhan'ın metin onayı |
| T6 | B14: v1 açık temaya kilit | 08 TB-21 | 0,1 | K4: koyu mod cihaz ayarında 3 ekran |
| T7 | Migration atomikliği (yarım kalan migration kalıcı çökme). **V2'nin şema değişikliğinden önce şart** | 04 #3 | 0,5 | K2 kesinti simülasyonu testi |
| T8 | Ölçüm tamamlama: haftalık kırılım, uygun hafta / açılan kart, ilk kart gün numarası, bildirim izni durumu (kimliksiz, tarihsiz) | 01 T15, 03 §6 | 0,75 | K2 rapor yasak desen testi yeşil; security-reviewer notu |
| T9 | Küçük akış hataları: önizleme "< Geri" tepkisiz, gizle/göster ~25 dp, V-03 izin diyaloğu geri tuşu, yükleme/silme hatasında geri bildirim | 09 genel tur ve #6, 04 #7 | 1 | K4 |

Önkoşul (ürün dışı, 08): çalışma ağacının commit'lenmesi ve 08'in "şimdi" paketi (TB-2/4/6/7/8/23).

### 5.1 v1.5 maddeleri (6)

Her maddede: ne, kapsam dışı, neden şimdi, bitti kanıtı taslağı (K seviyesiyle), metrik ve "hareket etmezse" kuralı, sahibi, efor,
bağımlılık.

#### V1. Karne kimliği (Z17)

- **Ne:** 10'daki A yönü (öneri) tek seferde: token'lar (kâğıt, mürekkep, mor mühür), Inter kabuk genelinde, kart kompozisyonu
  (çerçeve + mühür + okunur altbilgi), ikon / adaptive ikon / splash / bildirim simgesi, sekme çizgi ikonları, ekran durumları
  (seçili/basılı/pasif), Hafta'da gri iskelet yerine kartın minyatürü, reveal: zemin anında kâğıt rengi + satırlar sırayla + en son
  **mühür basılır** (~1,3 sn), azaltılmış hareket tercihi. Haptik isteğe bağlı (K-7).
- **Kapsam dışı:** tema/kart stili seçimi, koyu tema cilası, gerçek blur, konfeti, ses.
- **Neden şimdi:** ikon yayın kapısı (07 A17); her paylaşılan PNG kamuya açık bir artefakttır ve şablon görünümlü bir kart bir kez
  dolaşıma girerse geri alınamaz. Batuhan'ın "amatör" yargısının en görünür kaynağı.
- **Bitti kanıtı:** K2 kontrast testi (metin >= 4,5:1, UI >= 3:1), güncellenmiş `layout.test.ts` (Batuhan onaylı bilinçli değişiklik),
  hex renk izin listesi meta-testi · K4: 411x914 ve küçük ekranda 5 ekran görüntüsü + 1080x1920 PNG; azaltılmış hareket açıkken
  reveal tek geçiş · K5: preview APK'da başlatıcı ikonu 48 dp'de okunur; reveal gerçek cihazda akıcı (performance-engineer ölçümü)
  · Kullanıcı: H5, öncesi/sonrası görüntülerle 5 kişi, >= 4/5 "bitmiş ürün".
- **Metrik / kural:** H5; paylaşım oranı (dolaylı). H5 geçmezse görsel işe ek süre verilmez, içerik (V5) öne alınır.
- **Sahibi:** visual-designer (belirtim 10'da hazır) → mobile-engineer → performance-engineer → accessibility-auditor.
- **Efor:** ~4 gün. **Bağımlılık:** K-3, K-4, K-7 kararları.

#### V2. Paylaşım anı (Z18 + Z19)

- **Ne:** (a) Varsayılan paylaşımda okunur unvan: K-2 kararına göre mekanizma (öneri: dondurulan "paylaşım unvanı").
  (b) Gizli satır ve kalan gizli unvan durumları için "sansür şeridi" (sabit genişlik, gerçek metin render ağacına girmez; 10 §4 V1).
  (c) Önizleme = küçültülmüş gerçek kart; gizle/göster kartın üstünde; paylaşım 2 adım.
- **Kapsam dışı:** varsayılan gizlemeyi gevşetmek (uyku + harcama gizli kalır), Story'ye doğrudan entegrasyon, kare format.
- **Neden şimdi:** intent'in tek başarı ölçütü paylaşım oranı; ölçülen artefakt bugün kombinasyonların ~%80'inde başlıksız. Deneme
  bu haliyle yapılırsa "ürün tutmadı" ile "kanca silinmişti" ayırt edilemez.
- **Bitti kanıtı:** K2 sayım betiği (09'daki yöntem): 81 kombinasyon x dolu gün 3-7 x delta durumları, varsayılan gizlemede okunur
  unvan oranı **>= %90**, çıktı belgeye · K2: paylaşım unvanının `basedOnCategories`'i gizli kümeyle hiç kesişmez; gizli
  kategoriden türeyen hiçbir metin PNG render ağacında yok · K2: v3 migration + round-trip; alanı boş eski kartlarda şerit görünür
  · K4: dört örnek haftanın PNG'si, önizleme = kart, "< Geri" çalışır · K5: WhatsApp ve Story hedefinde görünüm (07 A15) ·
  Kullanıcı: H1, 5 kişiye unvanlı vs şeritli PNG, >= 3/5 unvanlıyı "paylaşırım" der · security-reviewer: açık Important yok.
- **Metrik / kural:** E1 (>= %25, yalnızca nötr dönem), `line_hidden` ortalaması. Unvan oranı >= %90 olduğu halde E1 < %25 ise sorun
  unvan değildir: değer katmanı (I-4) gündeme gelir; V2 geri alınmaz (geri almak zararlı).
- **Sahibi:** data-analyst / test-automation-engineer (betik) → software-architect + security-reviewer (mekanizma) → copywriter
  (paylaşım unvanı havuzu) → ui-ux-designer (önizleme) → mobile-engineer.
- **Efor:** ~3,5 gün. **Bağımlılık:** T7, V1 (şerit ve önizleme görünümü), K-2 kararı, intent I-2.

#### V3. Günlük an (Z16)

- **Ne:** Kaydet → "Kaydedildi" onayı (~1,2 sn) + ilerlemeden türeyen tek cümle (8-10 varyant, ardışık tekrar yok; "İlk gün tamam",
  "Eşik doldu, kartın Pazar 20:00'de açılır" tonu; seviye/kategori içeriği yok; geçiş biçimi ui-ux-designer'ın); eşik dolduğu an
  Hafta'da mühür dolar; günlük bildirim metin havuzu (3-4 çift, deterministik dönüş, veri yok); 4+ gün aradan sonra ilk açılışta tek
  satır "Yeni bir hafta, temiz sayfa" (kaç gün geçtiği yazılmaz).
- **Kapsam dışı:** gün serisi (Z8), kayıp korkusu dili, ek bildirim türü, sıklık artışı, kart içeriğini önceden sızdıran ipucu.
- **Neden şimdi:** günlük tek eylemin ödülü sıfır (K4) ve D7 denemenin ikinci ölçütü; en ucuz alışkanlık müdahalesi.
- **Bitti kanıtı:** K2: cümle havuzu testleri (ardışık tekrar yok, seviye/kategori sözcüğü yok, bildirim metinlerinde veri yok),
  senkron çift dokunuş koruması (08 M-9) · K4: Kaydet'ten 0,4 sn sonraki karede onay görünür (09 #9'un tersine dönmesi); azaltılmış
  hareket · Deneme: D7 >= Batuhan'ın önceden yazdığı hedef (K-9); hafta başına ortalama dolu gün.
- **Metrik / kural:** D7, hafta başına 4+ dolu gün oranı. D7 hedefin altında kalırsa madde kalır (zararsız), alışkanlık katmanı ayrı
  intent'e aday olur.
- **Sahibi:** engagement-designer + copywriter → mobile-engineer.
- **Efor:** ~1,5 gün. **Bağımlılık:** yok (V1 ile görünüm uyumu). Plan sapması: `ekran-akisi.md` Ekran 2, spec S8 #7.

#### V4. İlk değer görünür (Z14)

- **Ne:** Onboarding'de "ÖRNEK" damgalı, hafif eğik uydurma bir kart; kilitli kutuda gri iskelet yerine kartın minyatürü (kâğıt,
  çerçeve, mühür silueti, şeritler).
- **Kapsam dışı:** erken gerçek kart (Z15), örnek kartı paylaşma.
- **Neden şimdi:** ilk 10 saniyede getiri yok; ilk karta ortalama ~5 gün; Cumartesi/Pazar kuranlar 7-8 gün ödülsüz.
- **Bitti kanıtı:** K2: örnek kart bileşeni hiçbir repo/veri çağrısı yapmaz, "ÖRNEK" damgası render'da, örnek unvan gerçek havuzda
  yok · K4: onboarding ve Hafta ekran görüntüleri · Kullanıcı: 5 kişilik ilk oturum testi, >= 4/5 "Pazar ne alacağım?"ı doğru anlatır,
  0/5 örneği kendi kartı sanır.
- **Metrik / kural:** D1-D3 doluluk (T8), D7. 5 kişilik test geçmezse örnek onboarding'den çıkar, minyatür kalır.
- **Sahibi:** ui-ux-designer + visual-designer + copywriter → mobile-engineer.
- **Efor:** ~1 gün. **Bağımlılık:** V1. H0 "aktivasyon" derse önceliği yükselir.

#### V5. İçerik derinliği ve kıyas anlatısı (Z6 + Z5)

- **Ne:** 02 §6 hedef havuzu: satır 36 → ~60 (önce orta seviye ve varsayılan görünür hareket/sosyal), özet 12 → ~28 (yeni kovalar:
  tam hafta, geri dönüş, hafif/büyük yükseliş ve düşüş; ölü `partialData` kaldırılır), unvanlara ikinci varyant. Kıyas anlatısı:
  kartta kategori-nötr özet; kategori adlı tek cümle ("Hareket bir vites yukarı, gerisi aynı çizgide" tonu) **yalnızca kart ekranında,
  PNG dışında**.
- **Kapsam dışı:** içgörü satırı (Z20), yeni kategori, çok dil, dönem karnesi.
- **Neden şimdi:** içerik 3. haftada dönmeye başlar; denemenin 3-4. haftası tam bu pencere. Solo için en ucuz derinlik türü.
- **Bitti kanıtı:** K2 mevcut içerik testleri (<= 60, rakamsız, 81/81 kapsama, 52 haftada hiçbir varyant %70'i geçmez, ardışık tekrar
  yok) + yeni kova testleri + `CONTENT_VERSION` artışı · K2 yeni: 12 haftalık simülasyonda orta seviyede aynı satır en erken 4 hafta
  sonra tekrar eder (eşik öneri) · K2: PNG metninde kategori adı yalnızca görünür satırda geçer · K1: copywriter tablosu + her metne
  Batuhan onayı · Deneme: G15 "kart hâlâ şaşırtıyor mu" sorusunda >= yarısı evet; hafta 3-4 paylaşım oranı hafta 1-2'nin >= %70'i
  (eşik varsayım).
- **Metrik / kural:** hafta 3-4 kart açma ve paylaşım oranı. Tutmazsa değer katmanı (I-4) açılır.
- **Sahibi:** copywriter → data-analyst (seviye dağılımı) → mobile-engineer + qa-engineer (testler).
- **Efor:** ~2,5 gün. **Bağımlılık:** T5 önce; V2 paylaşım unvanı havuzuyla birlikte yazılır.

#### V6. Karnelerim (Z1 + Z7 + Z2 lite)

- **Ne:** Tek yeni ekran, Hafta ekranından girilir (yeni sekme yok): dondurulmuş kartların listesi (en yeni üstte, küçük kart
  görünümü), dokununca kart ekranı ve tekrar paylaşım (aynı önizleme ve varsayılan gizleme), kırılmaz birikim ("12. karnen"),
  uygun ama açılmamış haftalar "açılmayı bekliyor" olarak listede (T2'nin kalıcı evi). Kesilebilir alt madde: "topladığın unvanlar"
  (yalnızca kazanılanlar; eksik yuva, nadirlik, yüzde yok).
- **Kapsam dışı:** grafik/trend, aylık özet, arama/filtre, boş haftaları "boş kart" olarak göstermek, dışa aktarma.
- **Neden şimdi:** 4. hafta sorusunun dar kapsam içindeki tek cevabı; veri zaten var, yeni veri toplanmaz. Birincil ölçütlere doğrudan
  etkisi yok, bu yüzden **kesmede ilk düşen**.
- **Bitti kanıtı:** K2 (gerçek SQLite): liste yalnızca dondurulmuş kartları ve uygun açılmamış haftaları döner, uygun olmayanı asla;
  "Tüm verilerimi sil" sonrası boş · K2: tekrar paylaşımda varsayılan gizleme yeniden uygulanır · K4: dev menüyle 4 haftalık senaryo
  (kart, kaçırılan hafta, tekrar açma, tekrar paylaşma), yazı ölçeği 2,0 · Deneme: kartı >= 2 olan testçilerin >= %40'ı arşivi en az
  bir kez açar (yeni kimliksiz sayaç `archive_opened`; spec S9 değişikliği, security onayı).
- **Metrik / kural:** `archive_opened`, arşivden paylaşım. < %40 ise v2'de sadeleştirilir (liste kalır, unvan koleksiyonu çıkar).
- **Sahibi:** ui-ux-designer → mobile-engineer → qa-engineer; engagement-designer etik denetimi (koleksiyon baskısı).
- **Efor:** ~3 gün. **Bağımlılık:** T1, T2, V1, intent I-1, K-5/K-10 kararları.

### 5.2 Sıra, fazlar, kesme çizgisi (öneri: K-1 seçenek a)

| Faz | İçerik | Efor | Not |
|---|---|---|---|
| 0 | Commit, H0 (15 dk), bölüm 6 kararları, 08 "şimdi" paketi | ~0,5-1 | Çoğu Batuhan |
| 1 | Taban T1-T9 | ~6 | Bitince ilk preview APK ile **Batuhan kendi telefonunda dogfooding** (07'deki A0): gerçek haftalık ritüel, n=1 K5 |
| 2 | Çekirdek: V1 (kart + ikon + reveal) → V2 → V3 → V4 → V1 ekran cilası | ~10 | Sonra deneme (07 kademesi: 3-5 kişi, sonra genişleme) |
| 3 | İkinci yapı: V5 + V6 | ~5,5 | Denemenin ilk haftasında yapılır, **nötr dönem (E1) bittikten sonra** dağıtılır; testçi 2. kartını alırken arşiv ve derin havuz anlam kazanır |

- **Kesme sırası:** Faz 2 10 günü aşarsa önce V1 ekran cilası (kart, ikon, reveal kalır), sonra V4'ün onboarding örneği (minyatür
  kalır). Faz 3 aşarsa önce V6 unvan koleksiyonu, sonra V6'nın tamamı (v1.6).
- **Önkoşul (ikinci yapı):** `preview` profilinde versionCode artışı yok (07 A4); düzeltilmezse güncelleme APK'sı kurulamaz.
- **Kabul edilen karışıklık:** ikinci yapı çağrılı paylaşım dönemiyle çakışır; çağrılı dönem zaten E1'e sayılmaz (S12), V5/V6'nın etkisi
  bu dönemde ayrıştırılamaz. Birincil ölçüt (nötr dönem E1) etkilenmez.
- **Takvim (K0):** Faz 0-2 yaklaşık 3-3,5 hafta; Faz 3 deneme içinde.

### 5.3 Kapsam bütçesi: v1.5 ne DEĞİLDİR

- Yeni ekran en fazla 1 (Karnelerim), yeni sekme yok. Yeni veri toplama yok (yalnızca kimliksiz sayaç ekleri: T8 ve `archive_opened`).
  Yeni ağ yolu 0. Yeni bağımlılık en fazla 2 (vektör ikon, haptik), ikisi de "ağa veri gönderiyor mu" kontrolüyle.
- Her madde bir metriğe bağlı; hareket etmezse ne olacağı yazılı. v1.5'e yeni madde ancak listeden biri çıkarsa ya da ayrı intent
  açılırsa girer.
- Spec/plan güncellemeleri (plan sapması, aynı commit'te): V1 `kart-yerlesimi.md`; V3 `ekran-akisi.md` + spec S8 #7; V5 spec S2/S4 kova
  tanımları; V2 spec güvenlik 3'ün uygulanma biçimi + veri modeli; V6 spec "Dahil değil" listesinden "geçmiş kartlar galerisi"nin
  çıkması (yalnızca I-1 onaylanırsa).
- Intent kuralı korunur: deneme E1 eşiğini tutmazsa **kapsam genişletilmez**, ürün ele alınır. v2 listesi yalnızca eşik tutarsa açılır.

### 5.4 Pre-mortem: "v1.5 çıktı, 3 ay sonra kimse kullanmıyorsa neden?"

1. **Deneme 5 hafta gecikti, motivasyon düştü.** → Faz yapısı, A0 dogfooding, kesme sırası, ikinci yapının deneme içine konması.
2. **Güzelleşti ama kimse paylaşmadı.** → V2 oran hedefi + H1 ölçümü; E1 < %25 ise değer katmanı, özellik yığma yok.
3. **Paylaşım unvanı gizli bir kategoriyi ima etti** (ör. "Tek Kişilik Ordu" üç düşük kategoriyi sezdirir). → security-reviewer + K2
   kesişim testi; kategori-bağımsız kurallar da seviye ipucu açısından gözden geçirilir.
4. **Arşiv var ama kimse açmıyor.** → V6 kesilebilir, ölçütü yazılı.
5. **Görsel kimlik zaman kutusunu yedi.** → Kesme sırasının ilk adımı.
6. **Kart yine "zaten biliyordum" dedirtti (ayna etkisi).** → v1.5 bunu tam kapatmaz; H4 G8'de erken uyarır; çare I-4.

---

## 6. Batuhan'a sorulacak kararlar (kısa, seçenekli)

| # | Soru | Seçenekler | Öneri ve gerekçe |
|---|---|---|---|
| K-1 | Paketleme ve sıra | (a) Taban + çekirdek (V1-V4) denemeden önce, V5 + V6 deneme içinde ikinci yapı. (b) Hepsi denemeden önce (~1 hafta daha geç, ikinci güncelleme sürtünmesi yok). (c) Yalnızca taban, deneme hemen, v1.5 sonuca göre | **(a).** Arkadaş çevresi tek atımlık havuz; birincil ölçütleri etkileyen her şey önce, yalnızca 2. karttan sonra anlam kazananlar sonra. Yanlışsa maliyet: ~1 hafta ya da bir güncelleme sürtünmesi |
| K-2 | Paylaşılan kartta unvan | (a) Dondurulan "paylaşım unvanı" (yalnızca açık kategorilerden / kategori-bağımsız). (b) Kategori-nötr havuz + işaret (~%50 görünür). (c) Unvan hiç gizlenmez (güvenlik gereksinimi 3 değişir). (d) Yalnızca sansür şeridi | **(a).** Güvenlik gereksinimi 3 ve dondurma garantisi korunur; hedef >= %90. (c) kamuya açık gizlilik sözünü değiştirir, önermiyorum. (d) kancayı geri getirmez |
| K-3 | Görsel yön | A karne kâğıdı · B pazar gecesi · C çıkartma albümü | **A** (10'un önerisi): ürün fikriyle örtüşür, yargısız, RN'de ucuz |
| K-4 | Ürün sözcüğü | (a) "karne" her yerde (ritüel ve marka; parodi: "not yok, emoji var"). (b) "kart" her yerde (02'nin önerisi, yargı çağrışımı yok) | **(a), A seçilirse.** 02 "kart", 10 "karne kâğıdı" diyor: **çelişki**, tek karar gerekir. Karne, görsel kimliğin ve Pazar ritüelinin taşıyıcısı; yargı riski "not yok" ile karşılanır. Onboarding, bildirim, mağaza metni buna göre |
| K-5 | Karnelerim intent'i (I-1) | (a) v1.5 ikinci yapıda, lite. (b) Deneme sonrası. (c) Hiç | **(a).** 4. hafta teşhisinin tek dar cevabı; yeni veri toplamaz; kesmede ilk düşen |
| K-6 | "Kartta rakam yok" kuralı | (a) Yalnızca PNG için; uygulama içinde "12. karnen", "2 gün kaldı" serbest. (b) Her yerde rakamsız | **(a).** Kural paylaşılan artefaktın gizliliği içindi; uygulama içi ilerleme bugün de rakam kullanıyor |
| K-7 | Yeni bağımlılıklar | (a) `@expo/vector-icons` + `expo-haptics`. (b) Yalnızca ikon. (c) Hiçbiri (PNG ikon, haptik yok) | **(a)**, ikisi de "ağa veri" kontrolü ve bağımlılık kaydıyla; haptik yalnızca mühür ve Kaydet anında |
| K-8 | Zaman tavanı | (a) Çekirdek 10 iş günü, ikinci yapı 5,5; aşılırsa 5.2 kesme sırası. (b) Başka tavan | **(a).** Tavansız cila, "kapsam değil bitirme" dersinin tersi |
| K-9 | D7 hedefi (01 S8'den açık) | Bir sayı, deneme başlamadan `plan.md`'de | **>= %40** (K0, kıyas verisi yok); sonradan konan hedef ölçümü anlamsızlaştırır |
| K-10 | Karnelerim ve cihaz gizliliği | (a) Arşiv, kart ekranıyla aynı içeriği gösterir; uygulama kilidi (N-9) v1.5'te yok. (b) Arşivde uyku/harcama satırları varsayılan `???`, dokununca açılır | **(a).** Aynı içerik bugün kart ekranında görünüyor; (b) sürtünme ekler, kazanç küçük. N-9 kararı ayrı kalır |

---

## 7. Taslak intent başlıkları (dosya oluşturulmadı)

Kural: yeni özellik = yeni `intent/YYYY-MM-DD-slug.md`, Batuhan commit'ler. V1, V3, V4, V5 yeni özellik değildir (spec'in kapsadığı
ekranların cilası ve içerik); plan sapması olarak işlenir. İsterse Batuhan denetim izi için I-0 şemsiye intent'ini de açabilir.

**I-0 (isteğe bağlı, şemsiye) — `2026-09-28-v15-bitirme-ve-derinlik`.** Kapalı deneme öncesi ilk izlenim "amatör ve fazla basit"
bulundu; inceleme bunun çoğunlukla kırık akış, şablon görünüm ve içerik kalitesinden, 4. haftada da derinlik eksikliğinden geldiğini
gösterdi (01-10). Önerilen sonuç: wow anına giden yollar eksiksiz, kart ve kabuk tek bir görsel kimlikle, günlük eylem görünür bir
ödülle, içerik 4 haftayı taşıyacak derinlikte. Başarı ölçütü değişmez (E1 >= %25, D7 >= K-9 hedefi). Kısıt: yeni kategori, veri
kaynağı, ağ, hesap yok; yeni ekran en fazla bir.

**I-1 (v1.5, ikinci yapı) — `2026-09-28-karnelerim`.** Kullanıcı 4. haftada biriktirdiği karnelerin hiçbirini göremiyor; veri cihazda
dondurulmuş ama gösterilmiyor ve kaçırılan haftanın kartının da kalıcı bir evi yok. Önerilen sonuç: Hafta ekranından girilen tek bir
"Karnelerim" listesi, dokununca kart, tekrar paylaşım (aynı gizleme kuralları), kırılmaz birikim sayısı ve açılmayı bekleyen uygun
haftalar. Başarı ölçütü: kartı >= 2 olan testçilerin >= %40'ı arşivi en az bir kez açar. Kısıt: grafik, nadirlik, eksik yuva, boş hafta
kartı yok; yeni veri toplanmaz; spec "Dahil değil" listesi bu maddeyle güncellenir.

**I-2 (v1.5, çekirdek) — `2026-09-28-paylasim-unvani`.** Varsayılan gizlemeyle (uyku + harcama) paylaşılan kartta unvan 81 kombinasyonun
yalnızca 15-16'sında görünüyor (09, K2); paylaşılan artefaktın kancası çoğu hafta siliniyor. Önerilen sonuç: kart üretilirken yalnızca
varsayılan açık kategorilerden ya da kategori-bağımsız kurallardan türeyen ikinci bir unvan da dondurulur; asıl unvan gizlenince o
görünür, kalan durumlarda sansür şeridi. Başarı ölçütü: varsayılan gizlemede okunur unvan >= %90 (K2) ve H1'de >= 3/5. Kısıt: güvenlik
gereksinimi 3 ve "dondurulan kart değişmez" korunur; şema değişikliği v3 migration ile, architect + security incelemesinden sonra.

**I-3 (v2 adayı, deneme sonrası) — `ay-karnesi`.** Haftalık ritüelde paylaşım yorgunluğu ölçülmemiş (intent OQ4); Wrapped'ın gücü
kıtlıktan geliyor. Önerilen sonuç: dört haftada bir, dört karneden türeyen tarihsiz bir "Ay karnesi" (ay adı yok) ve kendi unvan havuzu.
Başarı ölçütü: ay karnesi paylaşım oranı haftalık karnenin son iki haftasındaki orandan yüksek. Kısıt: yalnızca deneme E1 eşiği
tutarsa ve hafta 3-4 paylaşım düşüşü verisi varsa açılır.

**I-4 (v2 adayı, H4'e bağlı) — `haftanin-deseni`.** Kart, kullanıcının zaten verdiği beyanı geri söylüyor (ayna etkisi, 01 T1);
"bilmediğini öğrenme" anı yok. Önerilen sonuç: haftanın içinden türeyen tek bir gözlem satırı (ör. hangi günlerin daha hareketli
geçtiği), gün adları tarih ifşa etmeyecek biçimde. Başarı ölçütü: G8/G15'te "zaten biliyordum" yanıtının yarının altına inmesi.
Kısıt: gün deseni davranış izidir; security-reviewer ve privacy-compliance-analyst incelemesi olmadan karta girmez.

**I-5 (v2 adayı) — `android-widget`.** Tek dış tetik bildirim; bildirim izni vermeyen ya da bildirimi kapatan kullanıcının günlük
hatırlatıcısı yok. Önerilen sonuç: ana ekranda haftanın dolu gün noktalarını gösteren ve Bugün ekranını açan küçük bir widget; seviye
ya da emoji asla. Başarı ölçütü: widget kullananlarda hafta başına dolu gün, kullanmayanlardan düşük olmaz (yönsel). Kısıt: yeni
native bağımlılık, OEM davranışı, K5 zorunlu; iOS ayrı iş.

---

## 8. Varsayımlar, bilinmeyenler, geri dönüş

| Varsayım | Doğrulayacak kanıt | Yanlışsa maliyet | Geri dönüş |
|---|---|---|---|
| "Amatör" hissinin ana kaynağı kırık yollar + şablon görünüm, özellik azlığı değil | H0 (Batuhan kart akışını yaşar, 3 cümle yazar) | V1/V4 sırası değişir; V5/V6 öne alınır | Tam (sıra değişikliği) |
| Okunur unvan paylaşımı artırır | H1 (5 kişi), E1 | ~3,5 gün + şema | Kısmi: sütun kalır, kullanılmayabilir (şema tek yönlü) |
| Günlük an D7'yi korur | D7, hafta başına dolu gün | ~1,5 gün | Tam |
| Arşiv 4. hafta dönüşünü artırır | `archive_opened` (K0 bugün) | ~3 gün | Tam (ekran kaldırılabilir; veri zaten vardı) |
| İçerik derinliği ayna etkisini geciktirir | G15 yanıtları, hafta 3-4 oranları | ~2,5 gün | Tam |
| İkinci yapı arkadaşlar tarafından kurulur | Kurulum sayısı (Batuhan'ın elle takibi) | V5/V6 deneme dışında kalır | Zarar yok |
| Efor tahminleri (toplam ~21-22 gün) | software-architect tahmini | Takvim kayar | Kesme sırası |

**Bilinmeyenler / doğrulanamayanlar**

1. Gerçek seviye dağılımı bilinmiyor; unvan oranları kombinasyon sayımıdır (K2), kullanıcı ağırlıklı değildir.
2. Bu belge için emülatör kareleri (`%TEMP%\qa4\`) açılmadı; görsel yargılar 09 ve 10 raporlarından alındı (K4 kaynaklı, ikinci el).
3. Release derlemesinde (K5) hiçbir değer anı görülmedi (07: release kanıtı sıfır); reveal akıcılığı, paylaşım hedeflerinde görünüm,
   Pazar bildirimi teslimi açık.
4. Talep kanıtı hâlâ zayıf (intent OQ2), haftalık paylaşım yorgunluğu ölçülmemiş (OQ4). v1.5 ikisini de çözmez; yalnızca denemenin
   doğru ürünü ölçmesini sağlar.
5. RICE girdileri (R, I, C) ürün görüşüdür; 20-30 kişilik denemede hipotezlerin çoğu yalnızca yönsel sinyal üretir.
6. Paylaşım unvanı mekanizmasının "seviye ipucu" riski (ör. kategori-bağımsız "üç düşük" kuralı) security-reviewer'ın değerlendirmesine
   bağlı; bu belge bunu çözmüş saymaz.

---

## 9. Devir

```
Durum:        bitti (ürün vizyonu ve v1.5 önerisi); kararlar Batuhan'da
Yapıldı:      - "basit / eksik / yetersiz / ince" ayrımıyla teşhis (bölüm 1) ve ilk gün / 7. gün / 4. hafta tabloları (bölüm 2)
              - 21 aday, gizlilik uyumu, efor, risk, bağımlılık, rapor bağı (bölüm 3)
              - RICE + risk düzeltmesi; 4 hayır, 7 v2, 10 aday 6 v1.5 maddesinde; toplam ~21-22 iş günü (bölüm 4)
              - Taban T1-T9 + V1-V6, her biri için bitti kanıtı (K seviyeli), metrik ve "hareket etmezse" kuralı (bölüm 5)
              - 10 karar sorusu (bölüm 6), 6 taslak intent başlığı (bölüm 7; dosya oluşturulmadı)
Kanıt:        K1 (rapor ve spec okuması) + raporlardaki K2/K4 bulguları; kullanıcı davranışı K0; efor K0
Açık / risk:  efor architect doğrulaması bekliyor; seviye dağılımı bilinmiyor; release (K5) kanıtı yok;
              02 ("kart") ile 10 ("karne kâğıdı") arasında sözcük çelişkisi (K-4)
Karar gerek:  K-1 sıra, K-2 unvan mekanizması, K-3 görsel yön, K-4 karne/kart, K-5 Karnelerim, K-6 rakam kuralı,
              K-7 bağımlılıklar, K-8 zaman tavanı, K-9 D7 hedefi, K-10 arşiv gizliliği
Sonraki:      Batuhan: commit + H0 (15 dk) + bölüm 6 kararları; onaylarsa I-1, I-2 (ve isteğe bağlı I-0) intent dosyaları
              software-architect: taban + v1.5 efor doğrulaması, V2 mekanizması (security-reviewer ile)
              project-coordinator: kararlardan sonra faz planı ve deneme takvimi (5.2)
              visual-designer → mobile-engineer: V1; copywriter: T5 + V5 + V2 havuzu; engagement-designer: V3 + V6 etik denetimi
              data-analyst: V2 oran betiği, T8 ve `archive_opened` sayaç tanımı
```

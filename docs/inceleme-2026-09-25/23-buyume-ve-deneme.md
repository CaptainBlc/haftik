# 23 - Büyüme, dağıtım ve arkadaş denemesi (growth-strategist, Staff)

Tarih: 2026-09-28. Durum: öneri; ücretli harcama, kamuya açık hesap/paylaşım, marka açıklaması ve tüm "GO" kararları Batuhan'ındır. Kod, `assets/`, `app.json`, testler, emülatör ve hesaplara dokunulmadı; hiçbir şey paylaşılmadı/yayınlanmadı. Bu turda kullanıcı davranışına dair K5 kanıtı yoktur; "kullanıcı şunu yapar" cümleleri K0 varsayımdır ve öyle etiketlidir.

Okunanlar: 16, 15, 13, 07, 14/README + `kart-c-cikartma-albumu.html` + `ikon-3-cikartma.svg`, `docs/s12-magaza-icerigi.md`, `docs/s12-yayin-rehberi.md`, `CLAUDE.md`. Web (2026-09-28): Play metadata politikası (support.google.com/googleplay/android-developer/answer/9898842), Play kapalı test şartı (answer/14151465), StatCounter Türkiye özeti (arama sonucu, sayfa okunmadı).

## 0. Özet

1. **Paylaşım kancası şu an kırık, ve C kartı bunu kendiliğinden çözmez.** Varsayılan gizlemede (uyku + harcama) unvan ~%80 kombinasyonda gizli (09/13 K2). C'nin "henüz yapıştırılmamış çıkartma" hâli bunu esprili gösterir ama kanca (kimlik) yine yoktur. İ-2 (paylaşım unvanı) büyümenin önkoşuludur; bunsuz deneme "ürün tutmadı" ile "kanca silinmişti"yi ayıramaz.
2. **En ucuz ve en bilgilendirici ilk adım uygulamasız bir kart testidir** (bölüm 2.2): eski kart PNG'si ile C prototipini 6 kişiye (iPhone'lular dahil) bu hafta göstermek, hiçbir yapı beklemez. Arkadaş havuzunu (tek atımlık) tüketmez.
3. **Üç ayrı kohortu karıştırma:** (a) P0 görsel testi (uygulamasız), (b) APK smoke (3-5 kişi, kalitatif), (c) Play kapalı test = E1 kohortu (hedef 20 opt-in, 14 gün = iki Pazar: nötr, sonra çağrılı). 07 3.5 haklı: APK kohortu Play'e imza farkıyla taşınamaz, veri silinir; bu yüzden APK'yı ölçek değil smoke olarak kullan. Batuhan'ın "önce APK sonra Play" kararıyla çelişmez, yalnız APK'nın ölçeğini sınırlar.
4. **Damga/bağlantı görüntü içinde tıklanamaz;** asıl dönüşüm yolu "gören kişi Play'de 'Haftik' arar". Bu yüzden ad benzersizliği + kısa, yazılabilir damga + iPhone alıcı sorunu (Android-only) ASO'dan daha önemlidir.
5. **Yeni özellik önerisi (bölüm 6), en yüksek oran:** "Yalnız unvan çıkartması" paylaşımı (gizlilik korkusunu ve `???` sorununu aynı anda azaltır), ikinci düğme olarak metin/bağlantı paylaşımı, Story güvenli alan düzeltmesi, sezon çerçeveleri, "Albüm" adlandırması. Davet, karşılaştırma, ödüllü paylaşım, izlenebilir bağlantı yok.
6. **Tutarsızlıklar (sessizce gömülmedi):** (a) C prototipinde kartın üstünde "HAFTA KARNESİ" ve rozette "KARNESİ" yazıyor, karar "Kart"; (b) 13 K-4 "karne" öneriyordu, 16 "Kart" dedi, 16 esas alındı; (c) `s12-magaza-icerigi.md` bazı yerlerde paket adını hâlâ yer tutucu diyor, oysa `39f6a19` ile `com.batuhan.haftik` kesin; (d) mağaza başlığı `Haftik: Haftalık Emoji Kartı` için belge "28" yazıyor, ben elle 27 saydım (komutla doğrula).

---

## 1. Wow anı ve paylaşım motivasyonu

### 1.1 Paylaşılan şey tam olarak ne?
Pazar 20:00'den sonra açılan, 360x640 (1080x1920 PNG) C kartı: mor noktalı albüm zemini, sarı unvan çıkartması (46 px Baloo), dört beyaz satır çıkartması (emoji rozeti + kelime + 1-3 nokta + tek cümle), konuşma balonu özet, pembe HAFTİK patlaması, altta "haftik" + damga. Ekran alıntısı sohbette küçülünce (0,23-0,25 ölçek) yalnızca unvan çıkartması ve mor zemin okunur (10 §4, 14). Yani **paylaşımın taşıyıcısı unvan çıkartmasıdır;** satırlar ikincil.

### 1.2 Neden paylaşılır? (5 motivasyon, hepsi K0 varsayım; P0/E1'de sınanır)
| # | Motivasyon | C kartında karşılığı | Güç |
|---|---|---|---|
| M1 | **Kimlik / sosyal para birimi:** "bu hafta ben buyum" (ironik unvan) | Sarı unvan çıkartması | Yüksek, ama yalnız unvan görünürse |
| M2 | **Mizah / gösteri:** başkasına yollanacak komik cümle | Satır çıkartmaları, balon özet | Orta; içerik kalitesi (02/T5) belirler |
| M3 | **Estetik / albüm hissi:** "güzel görünen şey" | Çıkartma sayfası, sert gölge | Orta-yüksek (C'nin gücü); "çocuksu" riski ile dengelenir |
| M4 | **Merak / gizem:** "gizli çıkartma bende kalsın" | Kesik çizgili, arka kâğıdı görünen çıkartma | Potansiyel; şu an "eksik" okunma riski taşıyor |
| M5 | **Eşzamanlılık:** Pazar 20:00 herkes için aynı saat; 3+ arkadaş Durum'da aynı mor kartı görürse "bu ne?" | Sabit ritüel saat | Küme etkisi varsayımı (bölüm 2.4) |

İzleyenin merak nedeni: kendi kartının nasıl çıkacağı ("bana ne çıkar?"). Bu, izleyenin **uygulamayı aramasını** sağlayan tek motor; bağlantı görselde tıklanamaz.

### 1.3 Türkiye'de kanal gerçeği
- WhatsApp %90, Instagram %71,1 kullanım (TÜİK aktarımı; 15 §2.15 [İ], orijinal tablo okunmadı). Paylaşım hedefi sırası varsayımı: WhatsApp Durum ve bire bir sohbet > Instagram Story > grup sohbeti > X. Ölçmeden sıralama iddia etmiyorum; deneme öz-bildirimi bunu sorar (bölüm 2.5).
- Android payı Türkiye'de >%85 (StatCounter özeti, arama çıktısı [İ], sayfa okunmadı). Sonuç: **iPhone'lu izleyici sorunu küçük ama gerçek** (tahmin ≤%15, K0); iPhone'lu biri kartı görüp indiremez. Damga "iPhone'a gelmedi" izlenimi vermemeli, site bunu açıkça yazmalı ("şimdilik Android"). Bekleme listesi/e-posta toplama yok (sunucu ve toplama yok kuralı).
- Android paylaşım sayfasında Instagram Hikaye ve WhatsApp Durum hedeflerinin görünüp görünmediği **doğrulanmadı** (arama bunu doğrulamadı). Manual-checklist P-04/P-05 gerçek cihazda yapılana kadar "Story'ye tek dokunuş" iddiası yazılmaz. Durum/Hikaye görünmezse yol "Galeriye kaydet, Hikaye'de galeriden ekle" olur ve sürtünme artar (bölüm 1.4 S6).

### 1.4 Paylaşmayı engelleyen sürtünmeler (öncelik sırasıyla)
| # | Sürtünme | Kanıt / K | Etki | Çare (bölüm) |
|---|---|---|---|---|
| S1 | **Unvan çoğu haftada gizli** (%80) | 09 K2 sayım | Kanca yok; paylaşan "yarım kart" atmak zorunda | I-2 paylaşım unvanı (13 V2); "yalnız unvan çıkartması" (6.1) |
| S2 | **Gizlilik korkusu:** uyku/harcama satırı "hayat tarzı" ifşası; ham sayı olmasa da | K0; P0 D3 sorusu ölçer | Varsayılan gizleme bunu azaltır ama gizli hâl "eksik" okunabilir | Gizli hâlin esprisi (C'nin gücü), unvan-yalnız paylaşım |
| S3 | **Biçim:** damga/altbilgi ve HAFTİK patlaması Story arayüz bölgesinde | Aşağıdaki hesap, K1 (cihazda ölçülmedi) | Marka ve özet kırpılır | 6.3 |
| S4 | **"Çocuksu" algısı (18+ kitle)** | 14/15 bilinen risk, K0 | Grup sohbetinde "cringe" korkusu | P0 E sorusu; olgunlaştırma (görsel ajan) |
| S5 | **Paylaşım 3 adım, önizleme kart değil liste** | 13 Z19, 09 K4 | Vazgeçme | 13 V2 (önizleme = kart) |
| S6 | **Hedefe taşınma belirsiz:** `expo-sharing` mesaj metnini taşımaz; Durum/Hikaye hedefi görünürlüğü | CLAUDE.md S7b, 07 A15 (K5 açık) | Bağlantı garantisiz | 6.2, cihaz testi |
| S7 | **Sosyal utangaçlık / "kendini pazarlama":** Türkiye'ye özgü olup olmadığı kanıtsız | K0 | Haftalık yorgunluk | P0 ve deneme "neden atmadın" kutuları |
| S8 | **Bağlantı sürtünmesi:** görselde tıklanamaz; iPhone alıcı kuramaz | K1 | Dönüşüm | Damga tasarımı (5.4) |

**Story güvenli alan hesabı (K1, Meta değeri birincil doğrulanmadı):** 1080x1920'de üst ~250 px, alt ~340 px kritik içerik için boş bırakılır (15 §2.15 [İ]). 360x640 mantıksal düzlemde bu üst ~83, alt ~113 birim eder, güvenli bant y≈83-527. Prototip `kart-c` konumları: HAFTİK patlaması top 10-102 (üst bölgede), "HAFTA KARNESİ" bandı top 26 ve hafta metni top 58 (üst bölgede), özet balonu top 508 (bölgeye girer), altbilgi `bottom:18` yani y≈590-622 (alt bölgede). **Marka ve damga en çok kırpılan yerlerde.** WhatsApp Durum'da da üstte ilerleme çubuğu/ad, altta yanıt çubuğu var (davranış doğrulanmadı). Devir: visual-designer (marka rozetini ve damgayı güvenli banda taşı; özeti 500 altına çekme).

---

## 2. Arkadaş denemesi planı

### 2.1 Üç aşama, üç ayrı soru
| Aşama | Ne | Kim | Soru | Uygulama gerekir mi | Süre |
|---|---|---|---|---|---|
| **P0** | Kart görseli A/B (eski vs C) | 6 kişi (asgari 5), iPhone/Android karışık, **E1 kohortunun dışından** | Yeni kart eskiden çekici mi, C çocuksu mu, unvan/gizli hâl işliyor mu? | Hayır (PNG) | Bu hafta, 20 dk/kişi |
| **S1** | APK smoke | Batuhan + 3-5 yakın | Çökme, bildirim, izin, paylaşım hedefi, ilk kart yolu | Evet (preview APK) | 3-7 gün, bir Pazar dahil |
| **E1** | Play kapalı test | 20 opt-in hedefi | Nötr Pazar paylaşım oranı (E1), D7, "kanca" | Evet (Play kapalı test) | 14 gün + 14 gün |

Neden P0 uygulamasız: (1) E1 için tek atımlık havuzu (20-30 kişi) tüketmez; (2) iPhone'lu arkadaşlar deneme dışı kaldığı için burada değerlidir; (3) 15 KC1/KC5, 13 H1/H5 ve C'nin "çocuksu" riski aynı oturumda sınanır; (4) kod beklemez. Sınırı: ölçülen şey HTML prototipin Chrome görüntüsüdür, React Native derlemesinin değil (döndürme, font, gölge farkları çıkabilir); uygulama sürümü çıkınca 3 kişilik kısa tekrar (aşağıda P1).

### 2.2 P0 protokolü (5-6 kişi, tek oturum)
**Materyal (4 görsel, 1080x1920):** Eski-görünür, Eski-gizli, C-görünür, C-gizli. Eski = uygulamadan gerçek kart PNG'si (emülatör çıktısı, Batuhan verir). C = `kart-c-cikartma-albumu.html` 3x ölçekli ekran görüntüsü. Aynı içerik (unvan, satırlar, özet). Yer tutucu damga "haftik" bırakılır; "[mağaza bağlantısı]" görünmemeli. **Sıra dengeleme:** 6 kişide 3'ü eski önce, 3'ü C önce (5 kişiyle tam denge olmaz; 6'yı öneririm).

**Kişi profili (aday tablosu):** 18-35 yaş; Türkçe; haftada en az 1 WhatsApp Durum/Instagram Story paylaşan (öz-bildirim); 2 ağır paylaşan (haftada 3+), 2 ara sıra, 1-2 nadir paylaşan/izleyen; tasarımcı/geliştirici yok (yanlılık); aile büyüğü/en yakın arkadaş yok (nazik-evet yanlılığı). Platform karışık. Ad tutulmaz, kod P1..P6.

**Akış ve soru listesi (Batuhan sorar, açık uçlu önce, ad/uygulama bilgisi sonda):**
1. **3 sn testi (K1):** görseli 3 sn göster, kapat. "Ne gördün? Bu ne? Unvanı hatırlıyor musun?" Kayıt: unvanı doğru söyledi mi (E/H).
2. **Sohbet simülasyonu:** görsel Batuhan'dan "bir arkadaşın atmış gibi" WhatsApp'a düşer (normal boyut, küçük önizleme). Kayıt: ilk tepki ve sorduğu ilk soru ("bu ne?", "nereden?", "sen mi yaptın?").
3. **Paylaşım niyeti:** "Bunu kendi Durumuna/Hikayene koyar mıydın?" (Evet/Belki/Hayır); hedef (Durum/Hikaye/grup/kişiye/hiç). Aynı soru dört görsel için.
4. **Engeller (çoktan seçmeli, birden fazla):** kimse ilgilenmez / kendimle ilgili şey ifşa ediyor / çocuksu / çirkin / anlamadılar / unvan bana uymuyor / zaten bildiğim şey / uğraşmam.
5. **C riski:** "Bu kart hangi yaşa hitap ediyor?" (açık); "yetişkin espri mi, çocuk oyunu mu?" (1-5); "iş arkadaşına atardın mı?".
6. **Gizli hâl:** "Bu 'gizli çıkartma' sana ne düşündürdü?" (açık); "bir şey mi saklıyor, şaka mı?"; "unvanlı ve gizli arasında hangisini atarsın?".
7. **Gizlilik:** "Bu kartı görünce kişi hakkında ne öğrenir?" (açık); "veriyi uygulama nereye gönderir sence?".
8. **Ad ve arama:** "Buna ne derdin: kart / karne / albüm / ne?" (önce açık, sonra seçenek); "Play'de bunu bulmak için ne yazardın?" (ASO kelime girdisi, bölüm 4).
9. **Davranış ölçüsü (24 saat):** "İstersen beğendiğini Durumuna koy, koyarsan ekran görüntüsünü at. Koymak zorunda değilsin." Kayıt: gerçekten koydu mu. **Niyet-davranış farkını** görmenin tek ucuz yolu; n=5-6'da yalnız yönsel.

**Toplama (hesapsız):** kâğıt/not defteri ya da yerel tablo; sütunlar: P-kodu, platform, paylaşım sıklığı bandı, görsel sırası, 1-9 cevapları, 24 saat davranışı. Ses kaydı yalnız açık izinle ve tutulmadan silinir. Bulut anket aracı gerekmez; kullanılırsa e-posta/ad toplanmaz. Tablo `docs/` dışında tutulabilir (kişisel not).

**Karar tablosu (ölçütler 15 KC1/KC5 ve 13 H1/H5 ile hizalı; eşikler önerilir, kimse onaylamadı):**
| Ölçü | Geçer | Sonuç |
|---|---|---|
| M1 unvanı doğru okur (3 sn, C-görünür) | >= 4/5 | Aksi: unvan boyutu/kontrast, kart öğe sayısı azalt |
| M2 C-görünür "koyarım" - Eski-görünür "koyarım" | C >= 3/5 **ve** eskiden en az +1 | Aksi: KC1 tetiklenir; görsel yatırım durur, değer katmanına dön (15 KC1) |
| M3 "çocuk oyunu" (5 üzerinden 4+ veya açık uçta çocuksu) | <= 1/6 | 2/6 uyarı: olgunlaştırma turu (kontur/renk/dil); >= 3/6: olgunlaştırma varyantı 2 hazırlanıp 3 kişiyle tekrar test edilir. **C seçimi sorgulanmaz;** tetiklenen şey görsel ajan işidir |
| M4 gerçekten koydu (24 saat, C) | >= 1/6 | 0/6 iken M2 geçtiyse: niyet abartısı, E1 beklentisi düşürülür |
| M5 unvanlı vs gizli: unvanlıyı seçen | >= 4/6 | Doğrular I-2 önceliğini; gizliyi eşit seçen >= 3/6 ise "gizli çıkartma" esprisi işliyor |
| M6 "kimse ilgilenmez / ifşa" en sık engel | tek engel >= 3/6 | O engele göre 6.1-6.2 önceliği |

**P1 (uygulama sürümü, 3 kişi, 10 dk):** RN'de yeniden yapılan gerçek PNG ile M1-M3'ü yeniden ölç; prototip-uygulama sapması varsa görsel ajana devret.

### 2.3 S1: APK smoke (3-5 kişi)
- Batuhan kendi telefonunda önce (07 A0: E1-E15). Sonra 3-5 yakın Android'li, bir Pazar dahil.
- Ölçüt: açılışta çökme yok, bildirim teslimi, ilk kart yolu (T1-T3), paylaşım sayfasında Durum/Hikaye hedefleri, PNG'nin hedefte görünümü (KC6). Bulgular support-specialist triyajına.
- **Bu kişilerin E1'e sayılması önerilmez** (n çok küçük, kalitatif). Kimlik/imza uyarısı: bu APK'yı Play'e taşımak veriyi siler (07 3.5); testçiye baştan söyle.
- Davet mesajındaki "veri sadece telefonunda" cümlesi G-02 ağ ölçümü temiz çıkmadan gönderilmez (07 §7 madde 11).

### 2.4 E1 kohortu ve iki dönemli paylaşım çağrısı takvimi
Kohort: Play kapalı test, hedef 20 opt-in (bölüm 3). Takvim, S12 mesaj şablonlarına (1-7) dayanır; farkları koyu.

| Gün | Eylem | Not / ölçü |
|---|---|---|
| G-7..G-1 | Davet dalgası 1 (bire bir, Pzt/Sal), opt-in takibi | 12+ opt-in ilk 48 saatte hedef |
| G1 (Pzt) | Kurulum mesajı (2), ilk check-in | İlk kart eşiği 3 dolu gün |
| G2-G3 | Sessizlik, yalnızca sorun yanıtı | **G3'te Console opt-in sayısı < 14 ise dalga 2 davet** |
| G4 (Per) | İşaretlemeyene hatırlatma (3) | D7 ön göstergesi |
| **G7 (Paz)** | **NÖTR Pazar (mesaj 4): paylaşım yönlendirmesi yok** | E1'e yalnız bu dönem sayılır; kart açılışından sonra paylaşan kalır |
| G8 (Pzt) | Rapor #1 + 3 soru (5) + **paylaşım yolu öz-bildirimi** | "Paylaştın mı? Nerede (Durum/Hikaye/sohbet/ekran görüntüsü/hiç)? Neden atmadın?" |
| G9-G12 | Tek kısa sohbet, triyaj | Ne fazla, ne az sorulur |
| **G14 (Paz)** | **ÇAĞRILI Pazar (mesaj 6)**: "beğendiysen Story'ne/Durumuna atabilirsin, atmazsan o da veri" | E1'e SAYILMAZ, ayrı raporlanır |
| G15 (Pzt) | Rapor #2 + kısa anket (7) | Nötr ve çağrılı farkı = çağrı etkisi (yönsel) |
| G16-G28 | Aynı ritim; 13'ün V5+V6 ikinci yapısı nötr dönem bittikten sonra dağıtılır | 3-4. hafta paylaşım oranı (13 V5 ölçütü) |

Ek kurallar:
- Çağrı dilinde baskı yok; paylaşmama meşru veri. Paylaşımı ödüllendirme (rozet, açılım) **yok**: E1'i kirletir ve teşvikli paylaşımdır (15 Y5/Y8).
- **Küme etkisi kararı:** M5 (eşzamanlı Pazar) sinyalini görmek için kohortu 2 arkadaş kümesi (her biri 5-6 kişi) + 8-10 dağınık kişi olarak kur ve her kişiye etiket koy (küme/dağınık, yalnız Batuhan'ın defterinde). Küme içi paylaşım birbirini tetikler ve E1'i şişirir; bu yüzden **E1'i iki ayrı oranla rapora yaz** (dağınıklar / kümeler). Etiketsiz karışım okunamaz.
- Cumhuriyet Bayramı haftasını (29 Ekim) kohort başlangıcı yapma; tatil ritmi D7'yi bozar (resmi takvim doğrula).
- Örnek takvim (K0): P0 bu hafta; taban+çekirdek ~3-3,5 hafta (13 §5.2); S1 Ekim sonu; E1 kohortu G1 = 2 Kasım 2026 (Pzt) olursa nötr Pazar 8 Kasım, çağrılı 15 Kasım, gün 28 = 29 Kasım. Yapı gecikirse takvim kayar, sıra korunur.

### 2.5 Ölçüm bağı ve sınırlar (data-analyst ile kalibre edilecek)
- E1 = `share_initiated >= 1` / `card_opened >= 1`, nötr dönem. **Fazla sayar** (paylaşım sayfası açılınca; iptal dahil) ve **eksik sayar** (ekran görüntüsü uygulamadan görünmez). Öz-bildirim sorusu (G8) bu iki hatayı çapraz kontrol eder; tablo: uygulama sayacı Evet/Hayır x öz-bildirim Evet/Hayır. Fark >%30 ise E1 "güçlü sinyal" dendiğinde ek not düşülür.
- **n=20-30 için okuma (Wilson %95, hesap):** 5/20 (%25) -> yaklaşık %11-47; 8/30 (%26,7) -> yaklaşık %14-45. Yani eşiği tutmak "doğrulama" değil "ürünü ele alma kuralı için yeterli işaret"tir; 0-2/20 net zayıf, 3-4/20 belirsiz, >=5/20 güçlü sinyal (intent'in %25 tanımı). Tek bir küme sonucu değiştirebilir (yukarıdaki etiket).
- Viral != gelir != alışkanlık: E1 yüksek çıkıp D7 düşükse ürün "gösteriş nesnesi" olur; ikisi birlikte okunur (K-9: D7 >= %40 önceden yazılı olmalı).
- Rapor "anonim" değil, "kimlik/içerik içermez, takma adlı olabilir" (CLAUDE.md S9 I-3). Haftalık kırılım T8 ile gelmeden G8 raporu zorunlu.

### 2.6 Kill / dur kuralları (deneme düzeyi, öneri)
| # | Koşul | Eylem |
|---|---|---|
| D1 | P0: M2 tutmuyor (C < 3/5 veya eskiden +1 yok) | Görsel yatırımı durdur, değer katmanı (I-4) tartış (15 KC1) |
| D2 | P0: >= 3/6 "çocuk oyunu" | C'yi kaldırma; olgunlaştırma varyantı + yeniden test (karar Batuhan'ın) |
| D3 | S1: açılışta çökme, veri sızıntısı şüphesi, gizli satırın PNG'de görünmesi, silme sonrası bildirim dirilmesi | Dağıtımı durdur (07 §6.3) |
| D4 | E1 nötr < %25 **ve** P0 M2 geçtiyse | Sorun görsel değil; kapsam genişletilmez, ürün ele alınır (intent, 15 KC7) |
| D5 | G3'te opt-in < 12 | Dalga 2; G7'de hâlâ < 12 ise Play şartı zaman kaybı, E1'i APK'da sürdür ama Play sayacını ayrı yönet (bölüm 3) |
| D6 | Gerçek cihazda Hikaye/Durum'da mühür/unvan kırpılıyor, düzeltme sonrası da düzelmiyor | Biçimi kare öncelikli yap (15 KC6) |

---

## 3. Play kapalı test: testçi bulma ve tempo

**Şart (Google Play Console Help 14151465, bugün arandı):** 13 Kasım 2023 sonrası açılan kişisel hesap, üretim öncesi >= 12 tester, kesintisiz 14 gün opt-in; gerçek cihaz + ayrı Google hesapları; 2026 itibarıyla gerçek kullanım kontrolü anlatılıyor (ikincil kaynak, doğrula). Kuruluş hesabı muaf ama D-U-N-S ister (07).

**Huni varsayımı (K0, ölçülerek güncellenecek):** 40 kişiye ulaş -> %60 kabul (24) -> %75 opt-in yapar (18) -> %90 kurar (16) -> %90 14 gün kalır (14-15). Yani **20 opt-in için ~40 kişiye ulaşmak gerekir.** Her adımı defterde say; tahmini G3'te gerçekle değiştir.

| Havuz | Tahmini kişi | Yanlılık / not |
|---|---|---|
| Yakın çevre (Android'li) | 12-15 | E1 nazik-evet yanlılığı |
| Aile/akraba/iş-okul | 5-8 | Bazıları aktif kullanmaz -> "genuine usage" riski |
| "Arkadaşının arkadaşı" (bire bir isteme, kişi kişi) | 8-10 | Küme etkisi verir; etiketle |
| Batuhan'ın kişisel Instagram/WhatsApp Durum duyurusu ("2 hafta Android deneme, günde 8 sn") | 5-10 | Batuhan'ın hesabı = onun kararı; Gmail toplamak KVKK ihtiyatı |
| Karşılıklı test grupları / ücretli servis | - | **Önermem** (07 3.4: E1 kirlenir, Gmail listesi, itibar/politika riski) |

**İkinci halka için mesaj ilkesi:** açık ve dürüst ("günde 8 sn, 2 hafta, Gmail'ini yalnız davet için kullanıp sonra silerim"), toplu gruba değil bire bir, baskısız. iPhone'lu olana "şimdilik Android" ve P0'a davet.

**14 gün tempo (Console kontrolü günlük, 2 dk):**
- G-7..G-1: dalga 1 daveti; opt-in bağlantısı "Become a tester" -> Play'den kur akışı **bir gerçek hesapla uçtan uca denenmiş** olmalı (S12 kanıt listesi).
- İlk 48 saatte 12 opt-in yoksa dalga 2 (sayaç 12'yi geçince işler).
- G4: yalnız işaretlemeyene tek hatırlatma. G7 ve G10: opt-in sayısı < 14 ise sessiz yeniden davet. G14 sonrası "üretim erişimi" başvurusu (Batuhan).
- Tester kaybı: sayaç bozulursa sıfırlanma riski var (07); tampon %40.
- Kohortu iki etiketle ayır: E1 kohortu (kendiliğinden paylaşım) ve "sayaç fazlası" (yalnız Play şartı için eklenenler); rapor alınıyorsa ayrı etiketle, E1 payına yazma.
- **Davet günü:** Pzt/Sal (ilk kart eşiği için Çarşamba+ kuran kart alamaz, 13 §2.2).

---

## 4. Mağaza listesi (ASO) stratejisi

### 4.0 Önce dürüst çerçeve
- **Kapalı test sürümü mağazada aranıp bulunmaz** (davetli bağlantı). ASO gerçekten üretim erişimi sonrasında (yaklaşık 6-8 hafta sonra, 07) devreye girer. Şimdi yapılacak: metni hazır tut, P0/E1'den kelime topla, ikon ayırt edilirliğini yayından önce çöz.
- **Gerçek dönüşüm yolu:** kart görselini gören biri "Haftik" adını Play'de aratır. Bu yüzden ilk sıradaki ASO işi **marka adı sorgusunda birinci sırada çıkmak ve ad çakışması olmamasıdır** (Batuhan'da: Play/alan adı/TÜRKPATENT taraması; henüz yapılmadı).
- Play metadata politikası (bugün okundu, answer/9898842): başlık 30 karakter, kısa açıklama 80; başlık/ikon/geliştirici adında emoji ve tekrarlı özel karakter yok; "best/#1/free" gibi performans-promosyon ifadeleri yok; anahtar kelime tekrarı/alakasız kelime yok; kimliksiz kullanıcı yorumu yok. Play'de ayrı anahtar kelime alanı yok; indekslenen alanlar başlık, kısa ve uzun açıklama (uygulanan kural).

### 4.1 Sağlık sözcüğü kısıtı: maliyeti ve kararı
Kategorinin en çok aranan terimleri ("ruh hali", "mood tracker", "günlük", "alışkanlık takibi") ekibin kuralıyla dışarıda ("ruh hali, uyku, sağlık, terapi, takip"). Değerlendirme (K0-K1):
- Bu, Play'in yasağı değil ekibin yayın-riski tercihi; Health apps beyanı zaten dürüst doldurulacak (S12 kararı).
- Maliyeti düşük: Haftik "mood tracker" değil, "paylaşılabilir haftalık kart". Bu terimlerle sıralanmak için Daylio (App Store 4,8 / 62K [B], Play ~393K yorum [İ]) ile yarışmak gerekirdi; yeni uygulama için umutsuz, ve beklenti uyumsuzluğu (içgörü/analiz bekleyen) 1 yıldız getirir.
- Sonuç: **kısıt korunur;** ASO'yu "kart / haftalık / emoji / Pazar / unvan / çıkartma" ekseninde kur. Kelimeler ürün yeteneğine uymalı.

### 4.2 Türkçe anahtar kelime aday tablosu (hepsi hipotez; P0 soru 8 ve Play arama kutusu önerileriyle doğrulanacak)
| Küme | Adaylar | Niyet uyumu | Kullanım |
|---|---|---|---|
| Marka | haftik | Kart görüp arayan | Başlığın ilk sözcüğü |
| İşlev | haftalık kart, haftalık özet, emoji kart, emoji ile hafta özeti, hafta unvanı | Yüksek | Başlık + kısa açıklama |
| Ritüel | Pazar akşamı, Pazar 20:00, haftalık ritüel | Orta (yeni dil) | Kısa açıklama, uzun açıklamanın ilk satırı |
| Paylaşım | Hikaye kartı, Durum kartı, paylaşılabilir | Orta | Uzun açıklama (platform adlarından kaçın, S12 kuralı) |
| Estetik | çıkartma, albüm | Orta (C'ye özgü; rakiplerde az) | Uzun açıklama, görseller |
| Riskli / uyumsuz | günlük, günlük tutma, alışkanlık takibi, rutin | Düşük-orta (beklenti uyumsuzluğu) | Başlığa girmez; uzun açıklamada en fazla bir kez "rutin" |
| Dışlanan (kural) | ruh hali, mood, uyku, sağlık, terapi, takip | - | Hiçbir mağaza metni |

Kelime doğrulama yöntemi (ücretsiz): Play arama kutusunda her aday için otomatik tamamlamayı kaydet (Batuhan'ın hesabında, kişisel bilgi olmadan), ilk 10 sonucun uygulamalarını not et (rakip yoğunluğu), P0 soru 8 cevaplarını sayım tablosuna ekle. Yalnız sıralama araçları ücretli; gerek yok.

### 4.3 Ad, kısa ve uzun açıklama yönü
- **Başlık (30):** mevcut `Haftik: Haftalık Emoji Kartı` (elle sayım 27; belge 28 diyor: komutla doğrula). "Emoji" kelimesini koru: günlük tutma beklentisini kırar. Alternatif `Haftik: Haftalık Kart` (21) daha temiz ama arama terimi kaybeder. Çıkartma/albüm başlığa girmez (ürün adı zaten bu hissi verir).
- **Kısa açıklama (80):** mevcut (elle 77) işlevsel ve doğru. İkinci aday (denenecek, Play "store listing experiments" yalnız yayınlanmış uygulamada; doğrula): `Günde 8 saniye, haftada bir kart: Pazar 20:00'de unvanını ve haftanı aç.` (elle ≈73). Karşılaştırma ölçütü: mağaza sayfası -> kurulum oranı (Console).
- **Uzun açıklama yönü (4000):** ilk iki satır kanca; **"Kart" tutarlı kullanılsın** (S12 metni zaten "kart"; kullanıcıya dönük "karne" kalmasın). Öneri: kancayı "unvan" üzerine kur ("Pazar akşamı haftana bir unvan çıkıyor"), "çıkartma albümü" metaforunu bir cümlede ver. `s12` metnindeki "gizlediğin satır ??? olur" C'de "henüz yapıştırılmamış çıkartma" olarak güncellenmeli (kart görseliyle tutarlılık). "Ağ yok / internet kullanmaz" cümlesi G-02 ölçümü temiz çıkana kadar girmez (07 4.1). "Veri telefonunda kalır" cümlesi mevcut yetenekle uyumlu.
- Yasak taraması: "en iyi/#1/ücretsiz/yeni" başlıkta yok; platform adı (Instagram, WhatsApp) metinde yok (S12 kuralı); kararlar `privacy-compliance-analyst` ve `release-manager` ile (H).

### 4.4 Ekran görüntüsü hikâyesi (C yönü; 6 kare, ilk 2-3 kare görünür)
Play: 2-8 kare, 1080x1920 önerilir, metin ~%20'den az, gerçek uygulama (S12 §3). Sıra:
1. **Kart (C), unvan GÖRÜNÜR.** Overlay: "Pazar akşamı haftan tek kartta." Not: prototipin "Konforun Kalesi"si uykudan türediği için varsayılan gizlemede gizli olur; demo kombinasyonunu I-2 (paylaşım unvanı) sonrası seç veya uyku/harcamadan türemeyen unvanı elle deneyerek bul (S12 §3).
2. **Kilitli çıkartma sayfası (Hafta).** "Pazar 20:00'de kartın açılır." (merak, ritüel)
3. **Bugün (8 sn).** "Dört emoji, bir Kaydet." ("Uyku" etiketi görünür, Health beyanı ile tutarlı olmalı)
4. **Gizli çıkartma paylaşım önizlemesi.** "Neyi göstereceğine sen karar verirsin."
5. **Albüm / geçmiş kartlar** (13 V6 varsa; yoksa ikinci hafta kartı farklı unvanla). "Her hafta bir çıkartma."
6. **Gizlilik.** "Veri yalnızca bu telefonda." Ağ ölçümünden sonra girer (07 4.12).
Öne çıkan grafik 1024x500: mor noktalı albüm zemini, tek cümle solda, eğik kart sağda; ikon adını tekrar etmemeli; emoji için Apple görselleri yok (S12).

### 4.5 İkon 3'ün mağazada ayırt edilirliği: tarama yöntemi (henüz yapılmadı; 14 README de bunu doğrulanamayan sayıyor)
İkon: #6D4AFF mor noktalı zemin, -8° eğik, beyaz kesim kenarlı sarı çıkartma, siyah kalın "h" + beyaz kıvılcım. Kaygılar (K0): mor zemin popüler mor ikonlarla (ör. Twitch, Discord/blurple, Viber tonları, mor alışkanlık/mood uygulamaları) yakın renk; ayrışma şeklinde (eğik sarı sticker) ve harf "h"de.
Yöntem (ücretsiz, 1-2 saat):
1. 12 sorgu: haftik, haftalık, emoji, günlük, ruh hali (yalnız araştırma amaçlı), mood, habit, alışkanlık, çıkartma, planner, karne, journal. Her sorgunun ilk 15 sonucunun ikonunu ekran görüntüsü yap, tek kontak sayfasına yerleştir.
2. Aynı sayfaya ikon 3'ü (ve alternatif olarak 1-2'yi) eşit boyutta koy; **48 dp** ve **başlatıcı ızgarası (5x6, 20 popüler Türk uygulaması ikonuyla)** simülasyonu üret.
3. **Gri tonlama** testi: renk kalkınca şekil ayırt ediliyor mu?
4. **5 saniye "tek farklı" testi:** 5 kişiye kontak sayfası, "hangisi bir uygulama, adı ne?" ve "hangisini önce fark ettin?".
5. Rozet/benzerlik listesi: mor zeminli ve sarı öğeli her ikon için not; **başlatıcıda ve Play'de "Haftik" adı ile birlikte** ayırt edilirliği değerlendirilir (ikon tek başına yarıştırılmaz, ad ikonun altında görünür).
Karar ölçütü: 48 dp'de sarı çıkartma silueti okunuyor ve 5'te >= 4'ü ikonu diğerlerinden ayırt ediyor; aksi halde zemin tonu değiştir (mor doygunluğu/yön) veya sticker boyutunu büyüt (görsel ajan). Android 13 temalı ikon (monochrome) sticker silueti olarak ayrıca kontrol edilir.

### 4.6 Politika riski taraması (ASO bağlamında)
Sağlık iddiası: yok (tam açıklama "tavsiye vermez, yargılamaz, tıbbi değerlendirme yapmaz"). Marka taklidi: "Wrapped/Spotify", rakip adları yok; "çıkartma albümü" jenerik. "Karne" kelimesi kullanıcıya dönük metinde bırakılmaz (karar); gerekirse yalnız anahtar-kelime aramasında ("karne" terimi mağaza dışı rakip aramada olabilir) kullanılmaz. Ekran görüntüsündeki "Uyku" etiketi için Health apps formu ve Data safety tutarlı (S12 §5 uyarısı, karar Batuhan'da).

---

## 5. Kanal-kitle eşleşmesi ve içerik takvimi (ücretsiz)

### 5.1 Sıra kuralı
Kapalı test sürümü **herkese açık bağlantıyla dağıtılamaz** (opt-in). Kamuya açık kanallar üretim erişiminden sonra anlamlı. Bu yüzden 5.2 tablosu iki dilimlidir: **Şimdi** (yakın çevre, uygulamasız P0) ve **Üretim sonrası**. Hesap açma/gönderi/kamuya açık paylaşım Batuhan'ındır (ben yapmam).

### 5.2 Kanal tablosu (kanal önce, mesaj sonra; kitle uyumu hipotezi K0)
| Kanal | Kitle (isimle) | Uyum nedeni | Ücretsiz yöntem | Dilim | Ölçüt / risk |
|---|---|---|---|---|---|
| **WhatsApp bire bir** | Yakın çevre, ikinci halka | Davet en yüksek güven; geri bildirim burada | Kişisel mesaj (S12 şablonları) | Şimdi | Kabul oranı huni (bölüm 3); toplu gruba atma yok |
| **WhatsApp Durum** | Rehber | 24 saat, bire bir merak; M5 küme etkisi | Kullanıcı kendi paylaşır (asıl kanal) | Şimdi (deneme) | Öz-bildirim "nerede paylaştın" |
| **Instagram Hikaye** | Aynı kişilerin takipçileri | 9:16 uyum, ama güvenli alan düzeltmesi şart | Kullanıcı paylaşır | Şimdi (deneme) | KC6 cihaz testi |
| **Instagram planner / bullet journal / sticker hesapları** (Türkçe, mikro: 3-30K takipçi) | "Sticker, planner, haftalık plan" kültürü | C'nin çıkartma albümü estetiği bu kitleyle örtüşür (hipotez) | Hediye/erken erişim DM'i; **ücret yok, içerik zorlaması yok**; "iş birliği/hediye" açıklaması gerekliyse yapılır (mevzuat doğrula) | Üretim sonrası | Yanıt oranı; hesabın kitle-yaş dağılımı bilinmiyor |
| **TikTok "pazar reset / haftalık rutin" üreticileri** (mikro) | "Sunday reset" formatı Türkçede de var (arama doğrulaması yapılmadı) | Pazar 20:00 ritüelini içerik biçimi yapar | Üreticiye DM, kendi kartını çekmesi | Üretim sonrası | Yaş kitlesi 18 altı taşabilir (mağaza 18+): kitleyi doğrula |
| **X** | Türkçe "unvanını yaz" kültürü, mizah hesapları | Tek görsel + tek cümle ("bu haftanın unvanı: ...") | Kullanıcı paylaşır; Batuhan tanıdık hesaplarla | G15 sonrası (S12) | Tanımadık kitle = ikinci tur sinyali; E1'e karışmaz |
| **Reddit (r/CasualTR, r/Turkey, r/androidapps)** | Türkçe genel + Android meraklı | Test çağrısı/geri bildirim; kural ve "tanıtım" etiketleri sub'a göre değişir | Şeffaf "yaptığım şeyi gösteriyorum, geri bildirim" gönderisi, ürün değil hikaye | Üretim sonrası veya yalnız geri bildirim için | **Sub kuralları okunmadı (site erişilemedi);** kural okumadan post yok. Yalnız tanıtım hesabı gibi görünme riski |
| **Forumlar** (Technopat, ShiftDelete vb.) | Android uygulama meraklıları | İlgili bölüm olması muhtemel | Bölüm kurallarına uygun tek gönderi | Üretim sonrası | Var/yok doğrulanmadı; ilgi kitlesi teknik, hedef kitle değil |
| **Ekşi Sözlük** | - | Ürün tanıtımı reklam sayılabilir, kural doğrulanmadı | **Önermem** | - | Organik başlık açılırsa izle |
| **Üniversite / kulüp / itiraf sayfaları** | 18+ öğrenci | Yoğun Durum kullanımı (hipotez) | Bire bir kulüp yöneticisine, grup spam yok | Üretim sonrası | Spam algısı; itiraf hesapları anonim, güven zayıf |
| **Webrazzi vb. girişim yayınları** | Girişimci/teknoloji | Hikâye ("tek geliştirici + yapay zekâ") | Basın notu (e-posta yer tutucu) | Üretim sonrası, isteğe bağlı | Talep kanıtı yok, kitle uyumsuz |

**Öncelik önerisi (kanıt yokken):** Şimdi: WhatsApp bire bir + Durum + Hikaye. Üretim sonrası: önce planner/sticker mikro üreticileri (estetik uyumu en güçlü hipotez), sonra X. Reddit ve forumu yalnız geri bildirim toplamak için, kural okuyarak.

### 5.3 Haftalık içerik takvimi (üretim sonrası, Batuhan'ın onayı ve hesabı gerekir)
Kaynak ilke: **gerçek kullanıcı kartı yalnız açık, ayrı izinle yeniden paylaşılır;** aksi halde ÖRNEK kartlar. Sabit ritim (Pazar 20:00 kimlik cümlesi):
- Pzt: "Yeni hafta, boş albüm sayfası" (ÖRNEK boş sayfa görseli).
- Çar: Bir unvanın hikâyesi (bir örnek unvan + esprili satır; havuzdan, tr.ts ile birebir).
- Cum: "Bu Pazar ne çıkacak?" (kilitli sayfa, merak).
- **Paz 20:00-22:00:** ÖRNEK kart veya izinli kullanıcı kartı; "bu haftanın unvanı" çağrısı (yanıtlarda insanlar kendi unvanını yazar, uygulamayı zorunlu tutmaz).
Ölçüt: kurulum (Console) ve mağaza sayfası görüntüleme; gönderi başına beğeni değil. Haftada 4 içerik solo için ağır: en fazla 2 (Cum + Paz).

### 5.4 Viral döngü etiği ve damga
- **İzin verilen döngü:** kartın kendisi (kimlik, mizah, merak), damga (ad + yazılabilir yönlendirme), kullanıcı kontrollü metin/bağlantı paylaşımı (6.2).
- **Yasak (15 Y5/Y8, ortak brif):** paylaşımı ödüllendirme, paylaşım paywall'ı, rehber/kişi yükleme, izlenebilir bağlantı/QR, atıf SDK'sı, "arkadaşların şunu paylaştı" (veri yok, hesap yok), seri/FOMO, damgayı kaldırılamaz büyüklükte yapmak.
- **Damga tasarımı:** yer tutucu `[mağaza bağlantısı]` kalkmalı (07 A18). Tıklanamayan görselde en işe yarar metin: `haftik` adı + "Play'de ara" (URL kısa ve benzersiz alan adı alınırsa `haftik.xxx`). iPhone alıcı için site cümlesi: "Şimdilik Android'de". Ad ve alan adı kararı Batuhan'da (seçenek sorusu Q3).
- Gizlilik sözüyle çatışma: paylaşımı ölçen tek şey yerel sayaç; hedef uygulama, alıcı, sayı bilinmez. Bu, ölçüm sınırını (bölüm 2.5) kabul etmek demek; sınırı aşmak için sunucu **eklenmez**.

---

## 6. Yeni özellik önerileri (büyüme açısından; her biri etki/efor/gizlilik, taslak intent, sessizce eklenmez)

Puanlar K0 yargı; efor solo+Claude iş günü (architect doğrular). "Gizlilik uyumu": yerel-only, kartta ham sayı/tarih/konum yok, gizli kategori sızmaz, ağ yok.

| # | Öneri | Etki | Efor | Gizlilik uyumu | Durum |
|---|---|---|---|---|---|
| 6.1 | **Yalnız unvan çıkartması** paylaşımı (üçüncü biçim; 1:1 ve şeffaf PNG seçeneği) | 5 | 2-3 (I-2'ye bağlı) | Uyumlu; en az bilgi ifşa eder (yalnız görünür unvan) | Öneri, ayrı intent |
| 6.2 | **İsteğe bağlı ikinci düğme:** "Metni/bağlantıyı paylaş" (RN yerleşik `Share`, yeni bağımlılık yok) | 3 | 0,5 | Uyumlu (kullanıcı tetikli, izlenmez) | Öneri, plan sapması |
| 6.3 | **Story/Durum güvenli alan düzeni** (marka rozeti ve damga y≈83-527 bandına; özeti yukarı) | 4 | 1 (visual + layout testi) | Uyumlu | Tasarım işi, karar gerek |
| 6.4 | **Gizli hâl alt yazı çeşitleri** ("Bu çıkartma bende kalsın" gibi 4-6 varyant, kategori içeriği yok) | 3 | 0,5 | Uyumlu, sızıntı yok | copywriter işi |
| 6.5 | **Sezon çerçeveleri** (kart çerçeve/çıkartma süsü, `f(weekStart)` saf fonksiyon; şema değişmez) | 3 | 3 | Uyumlu; FOMO yok (kaçırınca kayıp yok, eski kart değişmez) | v2 adayı, ayrı intent |
| 6.6 | **"Albüm" adlandırması** (13 V6 "Karnelerim" -> C metaforuyla "Albümüm"; sayfa = hafta) | 3 | 0 (ad kararı) | Uyumlu | Q6 kararı |
| 6.7 | **Yıl albümü / ay çıkartması** (52 veya 4 karttan türeyen, tarihsiz) | 4 (Aralık zirvesi, K0) | 5 | Uyumlu, yerel | v2 (13 I-3'ün genişlemesi) |
| 6.8 | Kilometre taşı çıkartması (1./4./10./26. kart) | 2 | 2 | Uyumlu, kayıpsız | 13 Z7'ye ek |
| 6.9 | Davet/karşılaştırma | - | - | Yasak (hesap/ağ gerektirir) | **Hayır** |

**Davet/karşılaştırma olmadan alternatif ilkesi:** sosyal etkileşimi uygulama içine değil **kartın kendisine** taşı (merak, kimlik, "sen ne çıktın?" yanıtı sohbette). Ölçüm: yalnız yerel sayaç.

### Taslak intent'ler (3-5 cümle; dosya oluşturulmadı)

**I-G1 `unvan-cikartmasi`.** Varsayılan gizlemede tam kart çoğu hafta unvansız ve "yarım" görünüyor; kimlik kancası paylaşımda yok (09/13). Önerilen sonuç: karttan ayrı, yalnızca görünür unvanı taşıyan tek çıkartma görseli (1:1 ve şeffaf PNG) paylaşılır; hiçbir satır, seviye, kategori içermez. Başarı ölçütü: nötr dönemde `share_initiated` payında unvan-çıkartma biçiminin oranı ve P0 M5. Kısıt: gizlenen kategoriden türeyen unvan asla; I-2 önkoşul; Instagram'da şeffaf PNG davranışı cihazda doğrulanmadan iddia edilmez.

**I-G2 `paylasim-metni`.** Görsel bağlantıyı taşımıyor, `expo-sharing` mesaj metni taşımıyor (CLAUDE.md S7b). Önerilen sonuç: paylaşım ekranında ikinci, isteğe bağlı düğme yalnız kısa metin ("Bu haftanın unvanı: X. Haftik") ve mağaza bağlantısını sistem paylaşım sayfasına verir. Başarı ölçütü: düğmenin kullanım oranı (yerel sayaç eklenirse `data-analyst`), aksi halde öz-bildirim. Kısıt: yeni bağımlılık yok, izleme yok, gizli unvan metne girmez.

**I-G3 `sezon-cerceveleri`.** Haftalık kartın yorgunluğu ölçülmedi (OQ4); mevsim/bayram çerçevesi ambient bir yenilik sağlar. Önerilen sonuç: kartın çerçevesi ve süsü, kartın hafta anahtarından saf fonksiyonla seçilen 4-6 çerçeveden biri olur; şema değişmez, eski kart aynı kalır. Başarı ölçütü: sezon haftalarında paylaşım oranı komşu haftalardan düşük olmaz (yönsel). Kısıt: "sınırlı süreli, kaçırma" dili yok; dini/siyasi hassas takvim yok; yalnız v2, E1 tutarsa.

Not: 6.3 ve 6.4 birer tasarım/metin işidir, intent gerektirmez (plan sapması).

---

## 7. Batuhan'a seçenekli sorular
| # | Soru | Seçenekler | Önerim |
|---|---|---|---|
| Q1 | P0 A/B oturumu: kim ve ne zaman? | (a) Bu hafta 6 kişi, E1 dışı ikinci halka + iPhone'lular. (b) E1 kohortundan 5 kişi. (c) Atla, doğrudan APK | **(a).** (b) havuzu tüketir; (c) C'nin çocuksu riskini ve unvan kancasını körlemesine deneme yapar |
| Q2 | APK'nın rolü | (a) 3-5 kişi smoke, E1 Play'de. (b) APK'yı 20+ kişiye geniş dağıt, E1'i orada ölç (Play'e geçişte veri silinir) | **(a)** (07 3.5) |
| Q3 | Damga ve ad | (a) Yalnız `haftik` + "Play'de ara". (b) Kısa alan adı al, damgada URL. (c) Bilinçli geçici metin | **(b) alan adı alınabiliyorsa, değilse (a).** Marka/TÜRKPATENT taraması önce (Batuhan) |
| Q4 | Paylaşım biçimleri | (a) 9:16 tek. (b) 9:16 + yalnız unvan çıkartması. (c) 9:16 + 1:1 tam kart | **(b)** (6.1) |
| Q5 | E1 kohortu yapısı | (a) 2 küme + dağınıklar, iki oranla rapor. (b) Yalnız dağınık kişiler (E1 daha temiz, n küçülür) | **(a)** etiketleyerek |
| Q6 | Arşiv adı | (a) "Karnelerim" (13). (b) "Albümüm" (C metaforu). (c) Nötr "Geçmiş kartlar" | **(b)** ama "Kart" kararıyla uyumu copywriter ile |
| Q7 | Kartta "HAFTA KARNESİ / KARNESİ" yazıları | (a) "Kart" olarak değiştir (karara uygun). (b) Marka mizahı olarak kalsın | **(a)** |
| Q8 | Herkese açık hesap (Instagram/X) | (a) Üretim sonrası açılır. (b) Şimdi ÖRNEK kartlarla açılır. (c) Hesap yok, yalnız kullanıcı paylaşımı | **(a) veya (c);** hesap açmak/kullanmak senin kararın |
| Q9 | Mikro-üretici (planner/sticker) iletişimi | (a) Üretim sonrası ücretsiz DM ile. (b) Hiç | **(a)**, açıklama yükümlülüğü doğrulanarak |
| Q10 | D7 hedefi (13 K-9) | Deneme başlamadan yazılı bir sayı | **>= %40** (K0) |

---

## 8. Doğrulanamayanlar ve devir
**Doğrulanamayan:** (1) Android paylaşım sayfasında WhatsApp Durum ve Instagram Hikaye hedeflerinin görünürlüğü (cihaz, K5). (2) Story/WhatsApp güvenli alan değerleri birincil Meta belgesiyle. (3) Türkiye Android payının tam değeri (StatCounter sayfası okunmadı; özet >%85). (4) Reddit/forum kuralları (Reddit erişilemedi), Ekşi kuralları. (5) "Sunday reset" ve planner/sticker kültürünün Türkçe boyutu ve mikro-üretici yaş dağılımı. (6) Huni oranları (%60/%75/%90/%90) tamamen varsayım. (7) Hediye/erken erişim için işbirliği açıklama mevzuatı. (8) Şeffaf PNG'nin Instagram'da korunması. (9) 2026 "gerçek kullanım" denetiminin ayrıntısı (ikincil kaynak). (10) Store listing experiments'in kapalı test/yeni uygulamada kullanılabilirliği. (11) Karakter sayıları elle sayıldı; bu ortamda komut çalıştırılamadı (`node -e` ile doğrula, S12 §Yer tutucular). (12) İkon benzerlik taraması yapılmadı, yalnız yöntem yazıldı. (13) Prototipler tarayıcıda görülmedi (14 README'deki sınır); C konumları koddan okundu. (14) Wilson aralıkları tarafımdan elle hesaplandı.

**Devir:** visual-designer (güvenli bant, olgunlaştırma, "KARNESİ" metinleri, ikon tarama) · copywriter (Q7, gizli hâl alt yazıları 6.4, ASO metni, davet mesajlarında "kart") · ui-ux-designer (paylaşım akışı, ikinci düğme, unvan çıkartması akışı) · data-analyst (öz-bildirim çapraz tablosu, iki oranlı E1 raporu, T8) · software-architect + security-reviewer (I-2, unvan çıkartması, 6.5 saf fonksiyon) · release-manager + privacy-compliance-analyst (metin taraması, Health beyanı, damga, ağ iddiası sırası) · qa-engineer (KC6 cihaz testi, P-04/P-05) · product-owner (6.x kapsam, Q6) · Batuhan (Q1-Q10, hesaplar, alan adı, ücretli hiçbir şey önerilmedi).

# 20 - Dönüş döngüsü v2: Albüm yönü (Haftik)

Tarih: 2026-09-28. Yazan: engagement-designer (Staff). Durum: **öneri; kapsam ve gizlilik kararları Batuhan'ındır.** Kod, asset, `app.json`, test, emülatöre dokunulmadı; commit yok.

Okunan: `16-ortak-brif`, `03`, `13`, `15`, `14-gorsel-prototipler/README` (yön C), `docs/ux/pazar-akisi.md`, `05-platform-gercekleri` (bildirim satırları), `src/domain/notify-plan.ts` (56-100).
Kanıt: `[KOD]` kaynak okuması · `[K4]` emülatör raporu (09) · `[BELGE]` spec/UX/inceleme raporu · `[K0]` hipotez. **Gerçek kullanıcı verisi yok; "kullanıcı şunu yapar" cümleleri K0'dır.** Efor: S <= 1 gün, M 2-4, L > 4 (K0).

**Terminoloji (kararlara uygun):** kullanıcıya dönük ad **"kart"** (haftalık kart). Kartların koleksiyonu **"Albüm"**; kartın içindeki görsel öğeler ve günün küçük işareti **"çıkartma"**; 4 kartlık grup **"cilt"**. "Sayfa" sözcüğü kullanıcı metninde geçmez (yalnız görsel metafor). Örnek metinler bu sözlüğü kullanır.

---

## 0. Özet

1. 03'ün üç zayıf halkası (günlük ödül yok `[K4]`, bildirim kartı açmıyor `[K4]`, yatırım görünmez `[KOD]`) C yönüyle değişmedi; C yönü yatırım halkasına **doğal bir taşıyıcı** (koleksiyon) ekliyor.
2. **Ödül merdiveni** (dört basamak): günün çıkartması -> haftalık kart -> 4 kartta cilt kapanışı -> 13/26/52. kart dönüm noktaları. Hepsi kullanıcının kendi verisinden ya da kendi sayısından türer; rastgele, nadir, sınırlı süreli ödül yok.
3. **Albüm = kırılmayan birikim:** kartlar **yapıştırma sırasıyla** numaralanır (takvim boşluğu görünmez); "üst üste", kaçırılan hafta sayısı, boş yuva, geri sayım yok; uygun kart süresiz bekler.
4. **Bildirim sayısı artmıyor.** Kaçırılan kart için yeni bildirim yerine mevcut günlük bildirimin metin varyantı. **Koddan yeni bulgu:** eşik aşılmış bir Pazar'da `card-ready` (20:00) ve `daily` (21:00) ikisi de planlanıyor (`notify-plan.ts:66-96`); check-in yoksa aynı akşam 2 bildirim `[KOD]`, cihazda gözlenmedi.
5. **Yeni risk:** yerel-only + albüm = telefon kaybında birikimin yok olması (`allowBackup:false`). Kullanıcı tetiklemeli, sunucusuz yedek dosyası (F10) gizlilik sözünü bozmadan cevap olabilir; karar Batuhan'ın.
6. 14 özellik önerisi (bölüm 5). En yüksek getiri/maliyet: F3 günün çıkartması, F12 bildirim seçici, F11 sessiz mod, F2 yapıştırma anı, F1 Albüm.
7. Ölçüm: n=20-30'da %95 güven aralığı **~±19 puan**; yalnızca büyük farklar "yön" sayılır (bölüm 4).

---

## 1. Döngü teşhisi ve ödül-dönüş haritası

"Tek değişiklik" = o anın kırık halkasını onaran en küçük müdahale.

| An | Tetik | Ödül | Yatırım | Kırılan halka | Tek değişiklik |
|---|---|---|---|---|---|
| **İlk gün** | Kullanıcının kendi kararı; izin diyaloğu onboarding 3. ekran `[BELGE]`; ilk bildirim ertesi akşam (bugün dolu ise atlanır) `[KOD]` | **Yok**: Kaydet sonrası ekran aynı `[K4: 09 #9]` | Görünmez | Ödül (günlük) | Kaydet mikro-anı: günün çıkartması yapışır + ilerleme cümlesi (3.1) |
| **7. gün** | 21:00 günlük (tek metin); Pzt-Çar kuranlarda Pazar 20:00 card-ready ama **dokununca kart açılmıyor** `[K4: BLG-09]` | Cmt/Paz kuranlar için kart yok (ilk kart 7-8. gün `[BELGE 03]`) | 1 kart; 3-gün-eşik hatası varsa kilitli görünür `[K4]` | Tetik->ödül köprüsü; geç kuranlarda gecikme | T3 (bildirim->kart) taban işi; geç kuranlar için dürüst beklenti + örnek kart (V4) |
| **4. hafta** | Aynı metin, aynı saat | Satır havuzu ~3 haftada dönüyor `[K0, 03]` | 3-4 kartın **hiçbirine erişilemiyor** `[KOD]` | Yatırım | Albüm (F1) + 4. kartta cilt kapanışı (F4) |
| **12. hafta** | 7 gün sessizlikte tetik yok (doğru) | "Zaten biliyordum" (ayna etkisi, 13 T1); yenilik bitmiş `[K0]` | 11-12 kart, görünürlük yok | Ödül tekrar yorgunluğu + yatırımın anlamı | Cilt özeti (tek kartta olmayan, kendi serisinden bilgi) + 13./26. kart işareti |

**Ödül merdiveni:**

| Frekans | Ödül | Veri kaynağı | Rastgele? |
|---|---|---|---|
| Günlük | Günün çıkartması (7 sabit şekil) + ilerleme cümlesi | Dolu gün sayısı, eşik durumu | Hayır (cümle havuzu ardışık tekrarsız) |
| Haftalık | Kart: unvan çıkartması yapışır, satırlar, özet balonu | Haftanın check-in'leri | Hayır (kural motoru) |
| 4 kartta bir | Cilt kapanışı: kapak + cilt özeti | Son 4 kartın unvanları/kıyasları | Hayır |
| 13 / 26 / 52 kart | Albüm kenarında kalıcı işaret | Toplam kart sayısı | Hayır (herkes aynı sayıda alır) |

**Pre-mortem (3. gün bırakma, `[K0]`):** Kaydet'in çalıştığını hissetmiyor; kartın ne getireceğini görmemiş; bildirim izni yok. Çareler: mikro-an, örnek kart (V4), izin bağlamı (3.4). Albüm ise hafta 4+ içindir; ilk üçünü aşmadan anlamsız.

---

## 2. Albüm mekaniği

### 2.1 Yapı
`Albüm` -> `Cilt` (4 kart) -> `Kart` (unvan çıkartması + 4 satır + özet balonu) -> `Çıkartma`. Hafta ekranındaki 7 gün şeridi 7 küçük çıkartma yuvasıdır: dolu gün = yapışmış çıkartma, boş gün = **düz halka, cezasız**. **Çelişki:** 14 README dolu/boş/**kaçırılmış (kesik halka)** ayrımı yapıyordu; albüm yönünde "kaçırılmış" durumunu kaldırmayı öneriyorum (suçlamasız).

### 2.2 Toplama hissi: nadirlik olmadan (13 kararı: nadirlik HAYIR)

| Araç | Nasıl çalışır | Risk |
|---|---|---|
| **Yapıştırma eylemi** | Reveal sonunda unvan çıkartması yapışır (tek haptik); kart Albüme "N. kart" olarak işlenir | Düşük |
| **Boşluksuz sıra** | Numara = yapıştırma sırası (kalıcı `album_seq` alanı); takvim boşluğu görünmez | Şema alanı (architect) |
| **Cilt kapanışı** | 4. kartla "1. cilt" kapanır: kapak dokusu + cilt özeti (2.4) | "Cildi bitir" baskısı: süre sınırı ve "N haftada" dili yok |
| **Dönüm noktaları** | 1., 4. (ilk cilt), 13., 26., 52. kartta kalıcı işaret; toplam sayıya bağlı, "üst üste" değil | Sayı = örtük hedef (R3) |
| **Olgusal "ilk kez"** | İlk kart, ilk kıyas (2. kart), ilk cilt | Düşük |
| **Cilt dokusu** | Cilt kapakları 6 dokudan sıralı döner, herkese aynı | Görsel iş |
| **"Yeni unvan" etiketi** (opsiyonel) | İlk kez alınan unvanda küçük işaret; yuva/yüzde/x-of-40 yok | **Orta** (R2); öneri: ilk sürümde yok |

### 2.3 Kırılmayan birikim ilkeleri
1. Sayaçlar yalnız artar; yalnızca kullanıcının "Tüm verilerimi sil" eylemi sıfırlar.
2. **"Üst üste", "kesintisiz", "X haftadır" ürünün hiçbir yüzeyinde geçmez.**
3. Uygun ama açılmamış kart süresiz bekler; eşik altı hafta hiçbir yüzeyde görünmez (boş kart/gri yuva yok).
4. Kart dondurulmuştur; Albüm yalnız okur. Tüm kartlar aynı boyda listelenir, son kart vurgulanmaz.
5. Sayılar (N. kart) yalnız uygulama içinde (K-6 a). PNG'de rakam: bölüm 6 Q7.

### 2.4 Geçmiş kartların değeri

| Ufuk | Albüm ne verir |
|---|---|
| 1 hafta | 1 kart, "ilk kart" işareti; sıradaki karta merak |
| 1 ay | İlk cilt. **Cilt özeti:** bu ciltte en sık unvan, hangi kategori öne çıktı/geriledi (kategori adlı cümle **yalnız uygulama içi**, PNG'de kategori-nötr). Tek kartın söylemediğini söyler: ayna etkisine karşı en somut çare `[K0]` |
| 3 ay | 13. kart işareti + "ilk kartın yan yana" (aynı gizleme kuralları) |
| 1 yıl | 52 kart: tarihsiz yıl duvarı (F8); yıl sonu ritüeli (Wrapped kalıbı, 15 §2.1) |

Cilt özeti kural tabanlı ve cihazdadır (AI yok; 15 Y7).

### 2.5 Kötüye kullanım ve kaygı riski (kalan risk: Y/O/D)

| # | Risk | Önlem | Kalan |
|---|---|---|---|
| R1 | Tamamlama baskısı ("cildi bitirmeliyim") | Süre sınırı, boş yuva, "üst üste" yok; boşluksuz numara | D |
| R2 | **Veriyi oynama (unvan avı):** güzel unvan için uyku/harcama beyanını değiştirmek; ürünün özü dürüst beyan | "Yeni unvan" etiketi yok, nadirlik yok, unvanlar sıralanmaz | O->D |
| R3 | Örtük seri (13/26/52 kesintisiz algılanır; 52'de "bitti") | Metinlerde ardışıklık yok; 52 sonrası aynı albüm sürer | D |
| R4 | **Paylaşımla ödül = metrik çıkar çatışması:** E1'i şişirir, onay arayışını sömürür | **Paylaşım hiçbir çıkartma/işaret kazandırmaz** | D |
| R5 | Sosyal karşılaştırma | Arkadaş grafiği yok; F7 ayrı intent, karşılaştırmasız | O (yalnız F7) |
| R6 | **Yerel-only güven borcu:** telefon kaybı = albüm kaybı | Ayarlar/onboarding'de dürüst cümle + F10 yedek dosyası | O (F10 yoksa) |
| R7 | Kaygı/takıntı (uyku/harcama izleyen kişi) | F11 sessiz mod; kartta ham sayı yok; gizleme varsayılan | D |
| R8 | Telefonu eline alan kişi tüm geçmişi görür | Kart ekranıyla aynı içerik (K-10 a); uygulama kilidi N-9 ayrı karar | O (bilinçli) |
| R9 | Çocuksu algı (C riski, 14/15) | Ton kuru ve zarif; puan/seviye atlama/rozet yağmuru yok; tek sarı vurgu | O (görsel iş) |
| R10 | Ödül enflasyonu | Yalnız 4 basamak; günlük mikro-an <= 2 sn | D |

**Kırmızı çizgiler:** sahte aciliyet/geri sayım, suçluluk ve özlem dili, gizli iptal, sürekli bildirim, nadirlik/sınırlı süreli ödül, paylaşıma bağlı ödül, eksik yuva sayacı, veri çıkışı yok. Her ödül bir olguya bağlı (uydurma yok).

---

## 3. Mikro-an, Pazar ritüeli, kaçırılan hafta, bildirim, yeniden-etkileşim

### 3.1 Kaydet mikro-anı
**Davranış:** Kaydet -> "Kaydedildi" (çift dokunuş korumalı, 08 M-9) -> günün çıkartması şeritte yuvasına yapışır (~250 ms) -> tek satır cümle ~1,5 sn -> sakin durum (düzenleme yolu açık). **Hafta'ya otomatik geçiş önerilmiyor** (03 Ö1'den bilinçli sapma): kullanıcıyı ekrandan atmak dün/bugün düzeltmeyi keser; şerit Bugün ekranında görünür olmalı (ui-ux-designer 411x914dp bütçesini doğrular). Haptik tek hafif vuruş (K-7 kararı). Reduced-motion: anlık değişim. Sessiz mod (F11): yalnız "Kaydedildi".

**Günün çıkartması:** 7 sabit şekil (haftanın gününe göre), içerik/seviye/kategori taşımaz, rastgele değil.

**Cümle havuzu (taslak; copywriter; ardışık tekrar yok):**

| Durum | Örnek |
|---|---|
| İlk gün | "İlk çıkartma yerinde." |
| Eşik altı | "Bugün de yerinde. İlk kart için 2 gün kaldı." |
| Eşik doldu | "Bu haftanın kartı hazırlanıyor. Pazar 20:00'de." |
| Eşik aşıldı | "Bugün de eklendi." / "Dünü de eklemiştin." |
| Düzenleme | "Güncellendi." |

Yasak: emir ("lazım/yap"), kayıp dili, seviye/kategori sözcüğü, kartı önceden sızdıran ipucu. Rakam yalnız kalan gün. Ölçüt: onay 0,4 sn karesinde görünür `[K4 testi]`; kronometrede >12 sn ise kısalt (13 KC2).

### 3.2 Pazar ritüeli (20:00)
```
20:00 bildirim --dokun--> [T3 yönlendirme]
  bugün işaretli değil -> K3 ara ekranı -> Kaydet -> otomatik reveal
  işaretli             -> reveal
Reveal (3 vuruş, "atla" var): çıkartma sayfası açılır -> satırlar yapışır -> unvan çıkartması yapışır (tek haptik)
Sonu: "Albümde 5. kartın." + [Paylaş] [Albümü aç]  (otomatik kaydedilir; "albüme ekle" adımı yok)
Opsiyonel (F5): "Bu haftaya tek kelime?" 12 sabit çip, atlanabilir, değerlendirme yok
```
Paylaşım baskısız (geri sayım, "paylaşmadın mı" yok). Kimlik cümlesi: "Pazar 20:00" (15 §2.11); kolektif his var, zorunlu pencere yok, kart süresiz bekler.
**Çakışma önerisi:** eşik aşılmış Pazar'da o günün `daily` bildirimi planlanmasın (card-ready zaten K3 ile bugünü işaretlemeye götürür). Spec S8 #5 değişir; hafta içi etkilenmez; eşik altı Pazar'da `daily` kalır. Yeni bildirimler check-in-önce mantığını bozmamalı (ekip dersi).

### 3.3 Kaçırılan hafta

| Durum | Görünen | Bildirim |
|---|---|---|
| Uygun, açılmadı, Pzt+ | Hafta'da "Bekleyen kart" (kilitli kutunun hazır hali); Albümde "bekleyen" rafı | **Ek bildirim yok.** O günkü `daily`'nin varyantı: "Geçen haftanın kartı hazır. Bugünü de işaretlersin." Sync her öne gelişte planı kurar `[BELGE 05 L-05]`; kart açılınca varyant kalkar |
| Birden çok bekleyen | Nötr yığın: "3 kart hazır" (kaç haftalık olduğu yok) | Aynı varyant |
| Eşik altı hafta | **Hiçbir şey** | Yok |

Geç açılan kartın numarası yapıştırma sırasına göre verilir; içerik hafta anahtarıyla dondurulmuştur. T1/T2 taban işleri ön koşul.

### 3.4 Bildirim stratejisi
Korunacak çerçeve (03/05): yerel bildirim, veri yok, dolu günde susar, 7 gün sönümlenme, kapatma yolu, `getExpoPushTokenAsync` asla çağrılmaz.

| Konu | Öneri |
|---|---|
| **Sayı üst sınırı** | Günde <= 1, haftada <= 7; yeni bildirim türü yok. Cilt/işaret/albüm için bildirim yok (yalnız uygulama içi) |
| **Hangisi silinir** | Öncelik: 1) `card-ready` 2) `daily` (varyantlı). Aynı gün çakışırsa 2 silinir |
| **Saat / sessiz saat** | Bugün 20:00-23:00. Öneri: 19:00-23:00 (S; talep kanıtı yok, denemede sor; N-02 önce). 23:00 sonrası planlama yok; Doze gecikmesi bilinen sınır |
| **İzin akışı (en büyük kaldıraç)** | İzin diyaloğunu onboarding'den **ilk Kaydet sonrasına** taşı ("Pazar 20:00'de kartın hazır olduğunu haber verelim mi?"). `[K0]`: bağlamlı isteme oranı artırır; kanıt yok, kohort testi. BLG-01 mantığı (canAskAgain) korunur; mobile-platform + qa K4 |
| **İzin sonrası ilk bildirim** | Ayrı ilk metin ("Albümün ilk günü geçti. Bugüne de yer var."), veri yok; sonra günlük havuz |
| **Günlük havuz** | 6-8 metin, ardışık tekrar yok, gün 5-7'de daha hafif alt havuz ("İstersen bugünü 8 saniyede işaretle."); spec S8 #7 güncellenir |
| **Kanal** | Ses/önem yayından önce karar (tek yönlü, N-08). Görüşüm: sessiz bildirim `[K0]`; platform doğrulaması gerekir |
| **Kapatma** | 3 durum (F12): Günlük+Pazar / Yalnız Pazar kartı / Hiç. "Hiç"te onay ve suçluluk metni yok |
| **Sönümlenme** | 7 gün sonra yenilenmez (mevcut); bildirimle win-back yok |

### 3.5 Yeniden-etkileşim (yalnız uygulama içi, suçlamasız)
Bildirim yok (7. günde sönmüş; tekrar çağırmak ısrardır). İlk açılışta Bugün'de tek satır, kendiliğinden kaybolur, kapatma gerekmez: 4+ gün ara "Yeni kart, yeni başlangıç."; 3+ hafta "Albüm olduğu yerde. Bugünden devam."; bekleyen kart varsa "Bekleyen kartların hazır." (kaç haftalık olduğu yazılmaz).
**Yasak:** "Özledik", "Seni bekledik", "X gündür yoksun", "Serin bozuldu", "Kaçırdın", ara süresini gösteren her sayı.

---

## 4. D7 / D28 hipotezleri ve ölçüm

### 4.1 Tanımlar
- **D7:** spec'teki (`computeD7`), değişmez. Hedef **>= %40** (13 K-9 önerisi, K0 keyfi; deneme öncesi yazılmalı).
- **D28 (öneri):** kurulum +21..+27. gün penceresinde >=1 check-in (haftalık ritüelde tek gün gürültülü; pencere tutma). Hedef **>= %25** (K0, D7'nin ~%60'ı; keyfi, deneme öncesi yazılmalı). Gün 28 gelmediyse `pending`.
- **H4K:** hafta indeksi 4'te uygun kartın açılma oranı (`card_opened / card_unlocked`, hafta 4).

### 4.2 Hipotezler (hepsi K0; karar kuralı 03 §6 ile aynı: kişi içi, yön)
| # | Hipotez | Ölçüt | Yön eşiği |
|---|---|---|---|
| H1 | Kaydet mikro-anı günlük eylemi korur/artırır | D1-D3 doluluk; hafta başına dolu gün (dönem A->B) | >=%60 kullanıcıda aynı/artış ve ort. +0,5 gün |
| H2 | Bağlamlı izin isteme izin oranını artırır | `notif_permission_state`; kohort karşılaştırması | +15 puan (yalnız yön) |
| H3 | Bildirim->kart köprüsü kart teslimini yükseltir | `card_opened / card_unlocked` | >= %80 |
| H4 | Albüm geçmiş değeri dönüş nedeni olur | Kartı >=2 olanların albümü açma oranı; eski kartı açma | >= %40 / >= %25 |
| H5 | Cilt kapanışı 4. haftada tutar | 4. kartı açanlar cilt özetini atlamadan görür; D28 | >= %50 |
| G1 | **Guardrail:** bildirim rahatsız etmiyor | Hatırlatma kapatma/izin geri alma | > %15 ise geri al |

### 4.3 Sayaçlar (kimliksiz, cihaz içi, rapor kullanıcı tetikli; S9 yasak deseni sürer)
| Sayaç | Durum |
|---|---|
| `check_in_saved`, `card_unlocked`, `card_opened`, `share_initiated`, `line_hidden`, D7 | Var |
| `notif_permission_state`, `first_card_day_number`, `filled_days_by_week_index` (1-4), `card_opened_by_week_index`, D1-D3 bayrakları | T8 önerisi (03 §6) |
| `permission_ask_context` (enum, build sabiti), `reminder_mode` (enum) | Yeni (bu belge) |
| `album_opened`, `album_old_card_opened`, `pending_card_opened` (Pzt+ açılış), `cilt_closed_seen` (0/1) | Yeni (bu belge) |

Hepsi adet/enum; tarih, saat dilimi, unvan, kategori, hangi kart ölçülmez. Rapor gizlilik testi korunur; security-reviewer + privacy-compliance onayı ("veri toplanmıyor" beyanıyla uyum) gerekir.

### 4.4 Belirsizlik ve dönem planı
- n=24, p=0,4: SE = sqrt(0,4*0,6/24) = 0,10 -> %95 **~±0,196**. 12'ye 12 bölünen kolda fark anlamsız (03 ile aynı sonuç). Yalnız **>= ~20 puan** fark "yön"; altı "belirsiz". Karıştırıcılar: yenilik etkisi, arkadaş çevresi seçilimi, OEM pil, kontrol yok.
- Dönemler (03/13 ile uyumlu): **A** nötr (E1 yalnız burada). **B** V3 + T1-T3 (mikro-an, köprü, kaçırılan giriş). **C** Albüm + cilt (ikinci yapı; çağrılı paylaşımla çakışır, ayrıştırılamaz kabul). **D** nitel. İzin-bağlam değişikliği yalnız **yeni kurulumlara** uygulanabilir (kohort); mevcut testçilere geri dönüp sorulamaz.
- Nitel (deneme sonu, 5 soru): (1) Albüm sana baskı yaptı mı? (hiç/biraz/evet) (2) Bir hafta kaçırınca ne hissettin? (3) Bildirimler: az/tam/çok. (4) Albümde bir ay sonra ne görmek isterdin? (5) Telefon kaybında albüm gitse ne yapardın?

---

## 5. Yeni özellik önerileri

Puan: **Etki** 1-5 (dönüş/alışkanlık, K0) · **Efor** S/M/L · **Gizlilik** U=uyumlu, K=koşullu, A=ayrı intent · **Etik** = kırmızı çizgi kontrolü (T=temiz, D=dikkat).

| # | Özellik | Etki | Efor | Gizlilik | Etik | Sıra |
|---|---|---|---|---|---|---|
| F1 | Albüm (geçmiş kartlar, bekleyen raf, kırılmaz sayaç) | 5 | M | U | T | İkinci yapı (V6) |
| F2 | Yapıştırma anı + "N. kart" (reveal finali) | 4 | S-M | U | T | V1 ile birlikte |
| F3 | Günün çıkartması (Kaydet mikro-anı) | 4 | S | U | T | **İlk** |
| F4 | Cilt kapanışı + cilt özeti | 4 | M | U | D (R3) | F1 sonrası |
| F5 | Haftanın kelimesi (Pazar, reveal sonrası, 12 sabit çip) | 3 | M | U | D (değerlendirme yok) | v2 |
| F6 | "Yeni kart anı" (Pzt ilk açılış, temiz başlangıç) | 3 | S | U | T | F3 ile |
| F7 | Arkadaşla kart takası (hesapsız, PNG) | 3 | L | A | D (R5) | Ayrı intent |
| F8 | Yıl duvarı / tarihsiz mozaik (52 kart) | 4 (uzun vade) | L | U | T | v2 |
| F9 | Android widget (günün çıkartması, yalnız dolu gün) | 3 | L | A | T | v2 (13 I-5) |
| F10 | Albüm yedek dosyası (kullanıcı tetiklemeli dışa/içe aktarma) | 4 | M | K | T | F1 ile ya da sonra |
| F11 | Sessiz mod (sayaç, cümle, haptik kapalı) | 3 | S | U | T (olumlu) | F3 ile |
| F12 | Bildirim yoğunluğu seçici (3 durum) + 19:00 saat | 3 | S | U | T (olumlu) | Taban yanı |
| F13 | Mevsim temalı cilt kapakları | 2 | M | K | D (tarih izi) | v2 |
| F14 | Unvan çıkartmasını tek başına paylaş (şeffaf PNG) | 4 | S-M | U | T (R4: ödül yok) | V2 yanı |

**Taslak intent'ler (3 cümle; dosya oluşturulmadı):**

- **F1 Albüm.** Kullanıcı 4. haftada biriktirdiği kartların hiçbirini göremiyor; kartlar dondurulmuş ama gösterilmiyor. Hafta ekranından girilen tek bir Albüm ekranı kartları yapıştırma sırasıyla listeler, dokununca kartı açar, bekleyen uygun kartları ayrı raf olarak gösterir; sayaçlar yalnız artar. Ölçüt: kartı >=2 olanların >=%40'ı albümü açar. *Etik kontrol:* yuva, nadirlik, "üst üste", kaçırılan hafta yok; boş hafta gösterilmez. (13 V6/I-1 ile birleşik ve "Karnelerim" adının yerini alır.)
- **F2 Yapıştırma anı.** Kart açılışının sonu bugün bir yokluk cümlesiyle bitiyor. Reveal'in son vuruşunda unvan çıkartması yapışır (tek haptik), "Albümde N. kartın." yazar; iki eylem: Paylaş, Albümü aç. Ölçüt: kart açma sonrası paylaşım oranı (E1 nötr dönemde müdahale yok). *Etik:* paylaşım ödülü yok, geri sayım yok.
- **F3 Günün çıkartması.** Günlük tek eylemin ödülü sıfır. Kaydet sonrası 7 sabit şekilden günün çıkartması şeride yapışır ve gerçek ilerlemeden türeyen tek cümle görünür; içerik/seviye sızmaz. Ölçüt: D1-D3 doluluk ve hafta başına dolu gün. *Etik:* kayıp dili yok, atlanabilir, 2 sn'yi geçmez.
- **F4 Cilt kapanışı.** Tek kart kullanıcının bildiğini geri söylüyor. 4. kartla cilt kapanır; kapak ve "bu ciltte" özeti (en sık unvan, öne çıkan/gerileyen kategori) gösterilir; kategori adları yalnız uygulama içinde, paylaşılan kapak kategori-nötr. Ölçüt: özeti atlamadan görenler, D28. *Etik:* süre sınırı ve "N haftada" dili yok; gizli kategori PNG'ye sızmaz (security-reviewer).
- **F5 Haftanın kelimesi.** Kart tamamen otomatik; kullanıcının kendi sesi yok. Pazar reveal'inden sonra 12 sabit kelimeden (ör. "yavaş", "yoğun", "toparlayan") biri isteğe bağlı seçilir ve Albümde karta işlenir. Ölçüt: seçme oranı, atlama oranı. *Etik:* niyet-sonuç kıyaslaması ve "başardın mı" yok; serbest metin yok (veri/moderasyon riski yok); kart öğe sayısı sabit kuralı gereği PNG'ye girmez.
- **F6 Yeni kart anı.** Geri dönen kullanıcıya suçlamasız karşılama yok. Pazartesi (veya 4+ gün aradan sonra) ilk açılışta Bugün'de tek satır "Yeni kart, yeni başlangıç." ve bekleyen kart varsa nötr bir işaret gösterilir. Ölçüt: aradan dönenlerin sonraki 7 günde dolu günü. *Etik:* ara süresi yazılmaz; kapatma gerektirmez.
- **F7 Kart takası.** Arkadaşlar kart paylaşıyor ama alan tarafta kalıcı bir yer yok. Alınan kart görüntüsü sistem paylaşımıyla Haftik'e gönderilip yalnız görüntü olarak yerel "Takas" rafında saklanır; veri ayrıştırılmaz, karşılaştırma/sıralama yok. Ölçüt: rafa eklenen görüntü sayısı. *Etik:* sosyal karşılaştırma riski; gelen görüntü yüzeyi (share-target, manifest, güvenlik) inceleme ister; kapsam genişletmesidir.
- **F8 Yıl duvarı.** 52. kartta Albümün bir yıllık özeti yok. Tarihsiz, unvan çıkartmalarından oluşan bir mozaik; paylaşılan sürüm yalnız gizleme kurallarına uygun çıkartmaları gösterir. Ölçüt: yıl duvarı paylaşımı. *Etik:* tarih/sayı yok, kapanış baskısı yok (2. yıl aynı albümde sürer).
- **F9 Widget.** Bildirimi kapatan ya da reddeden kullanıcının tetiği yok. Ana ekranda haftanın dolu gün çıkartmaları ve "Bugünü işaretle" bağlantısı; seviye/emoji asla. Ölçüt: widget kullananlarda hafta başına dolu gün (yönsel). *Etik:* temiz; native bağımlılık ve OEM riski, K5 şart.
- **F10 Yedek dosyası.** Yerel-only, albüm değerini telefon kaybına açık bırakıyor. Kullanıcı Ayarlar'dan tek dosya olarak dışa aktarır (sistem paylaşım sayfası) ve yeni cihazda içe aktarır; sunucu ve bulut yok, dosya açık metin olduğu için uyarı metni gösterilir. Ölçüt: dışa aktarma sayısı (kimliksiz). *Etik:* kullanıcı denetimli; `allowBackup:false` kararına dokunmaz; privacy-compliance beyanı gözden geçirir.
- **F11 Sessiz mod.** Bazı kullanıcılar için sayaç ve kutlama kaygı yaratabilir. Tek anahtar: mikro-an cümleleri, haptik, "N. kart" sayısı ve dönüm noktaları kapanır; işlev aynı kalır. Ölçüt: açık/kapalı oranı (`reminder_mode` benzeri enum). *Etik:* olumlu; anahtar Ayarlar'da tek dokunuş.
- **F12 Bildirim seçici.** Mevcut açma/kapama iki uçlu. Ayarlar'da Günlük+Pazar / Yalnız Pazar kartı / Hiç seçenekleri; saat çipleri 19:00-23:00'e genişler. Ölçüt: `reminder_mode` dağılımı, hatırlatma kapatma (guardrail G1). *Etik:* olumlu; "Hiç" için onay/suçluluk yok.
- **F13 Mevsim kapakları.** Cilt kapaklarına mevsim teması eklenebilir. Cihaz tarihinden kaba mevsim seçilir, yalnız doku olarak (isim/tarih yok). Ölçüt: yok (kozmetik). *Etik:* tarih izi PNG'ye doku olarak sızar; kart tarihsizliği ilkesiyle çelişebilir, Batuhan kararı.
- **F14 Tek çıkartma paylaşımı.** Paylaşılan tam kart çoğu uygulamada tek başına yükleniyor; unvan çıkartması kendi başına Story'ye yapıştırılabilir olsun. Unvan çıkartması şeffaf zeminli PNG olarak (aynı gizleme kuralları) sistem paylaşımına gider. Ölçüt: `share_initiated` türü (kart/çıkartma). *Etik:* paylaşım çıkartma kazandırmaz; şeffaf yakalamanın `react-native-view-shot` ile çalışıp çalışmadığı doğrulanmadı.

**Önerilen sıra (K0):** taban (T1-T3) -> F3 + F11 + F12 -> F2 (V1 ile) -> F14 -> F1 + F4 (+ F10) -> F6 -> v2: F5, F8, F9, F13; F7 ayrı intent.

---

## 6. Batuhan'a sorular

| # | Soru | Seçenekler | Öneri |
|---|---|---|---|
| Q1 | Ürün sözlüğü | (a) kart + Albüm + çıkartma + cilt; "sayfa" yok (b) "sayfa" da serbest | (a) |
| Q2 | Cilt uzunluğu | 4 kart / 8 / 13 | 4 (4 haftalık denemede görülebilir; 13'te dönüm noktası) |
| Q3 | Albüm numarası | (a) yapıştırma sırası (b) hafta sırası | (a) (boşluk ve geç kart sorunu yok; `album_seq` alanı) |
| Q4 | "Yeni unvan" etiketi | Ilk sürümde yok / var | Yok (unvan avı riski R2), denemede sor |
| Q5 | Pazar çakışması | (a) eşik aşılmış Pazar'da `daily` bastır (b) bugünkü hâl | (a) |
| Q6 | Bildirim izni ne zaman | (a) onboarding (bugün) (b) ilk Kaydet sonrası (c) Hafta'da ilk açılış | (b), yeni kurulum kohortu; mobile-platform doğrular |
| Q7 | Albüm sayıları PNG'de | (a) yalnız uygulama içi (b) cilt kapağında "N. cilt" gibi | (a) (K-6 a) |
| Q8 | Albüm girişi | (a) Hafta ekranından (yeni sekme yok, 13 bütçesi) (b) 4. sekme | (a) v1.5; C yönüyle ürünün kalbi olursa (b) yeniden değerlendir |
| Q9 | Yedek dosyası (F10) | v1.5'e / sonra / hayır | Albümle birlikte ya da hemen sonra; `allowBackup` ayrı karar |
| Q10 | Kaydet sonrası | (a) Bugün'de kal (b) Hafta'ya otomatik geç (03 Ö1) | (a) |
| Q11 | Arkadaş takası (F7) | Ayrı intent incele / hayır | Deneme sonrası; öncelik düşük |

---

## 7. Devir ve doğrulanamayanlar

**Devir:** `copywriter` (cümle havuzları, bildirim havuzu, win-back, yasak liste) · `visual-designer` (yuva/çıkartma dili, cilt kapağı, C'yi "yetişkin, zarif, esprili" olgunlaştırma, düz halka kararı) · `ui-ux-designer` (Kaydet durumu 411x914dp, Albüm ekranı, reveal 3 vuruş) · `software-architect` (`album_seq`, v3 migration) · `mobile-engineer` + `mobile-platform-specialist` (izin bağlamı, varyant, Pazar bastırma, kanal) · `data-analyst` (D28, sayaçlar, dönem planı) · `security-reviewer` + `privacy-compliance-analyst` (yeni sayaçlar, F10, F7, "veri toplanmıyor" beyanı) · `qa-engineer` (K4: izin akışı, bildirim varyantı, Pazar) · `product-owner` (spec "Dahil değil" listesi: geçmiş kartlar).

**Çelişkiler (açık):** (1) 03 Ö1 Hafta'ya otomatik geçiş vs benim "Bugün'de kal". (2) 14 README "kaçırılmış" halka durumu vs düz halka. (3) 13/15 "karne/Karnelerim" adı vs Batuhan'ın "kart" kararı: "Albüm". (4) 15 kilometre taşı 1/4/10/26 vs benim 1/4/13/26/52 (cilt uyumu).

**Doğrulanamayanlar:** (1) Pazar çift bildirim koddan çıkarıldı; cihazda gözlenmedi. (2) Bağlamlı izin isteme etkisi, mikro-an, albüm, cilt: tümü K0. (3) Notification varyantının Doze/OEM altında zamanında güncellenmesi. (4) Şeffaf PNG yakalama (F14) ve share-target (F7) teknik olurluğu. (5) Prototip C'yi gözle değerlendiremedim (README + token okuması); çocuksu algı görsel testle sınanmalı. (6) Kanal sessiz kararının Android davranışı. (7) Sayılar ve eşikler (D28 %25, %40, +15 puan) sezgiseldir. (8) Kaydet sonrası hissin yokluğu ve kaçırılan kart girişi `[K4]`/`[KOD]`; cihazda kronometre yok.

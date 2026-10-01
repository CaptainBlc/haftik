# 18 — UX akışları v2: denetim + Kart albümü + wireframe'ler (C yönü)

Tarih: 2026-09-28. Yazan: ui-ux-designer. Durum: **tamamlandı (öneri; kararlar Batuhan'ın).** Kod, asset, `app.json`, test ve emülatöre dokunulmadı; commit yok. Yalnız bu dosya yazıldı.

**Okunanlar:** `16-ortak-brif`, `docs/ux/*` (4 belge), `13`, `15`, `11`, `09`, `03`, `14-gorsel-prototipler` (README, kart-c, ekran-bugun, ekran-hafta), `week-status-copy.ts`, `onboarding/welcome.tsx`, `settings-view.tsx` (salt okuma).
**Kanıt dili:** K0-K5. Ekran/ölçü iddiaları 09/11'in K4'üne veya kod okumasına (K1) bağlıdır. "Kullanıcı şunu yapar" cümleleri K0 varsayımdır. Bu turda emülatöre bakılmadı; prototipler tarayıcıda görülmedi (HTML/CSS okundu, K1).
**Prototip boşluğu:** görevde geçen `kart-c/ekran-*.html` yok. `ekran-bugun.html` ve `ekran-hafta.html` yalnız **A ve B** kabuğunu çiziyor; **C kabuğu (Bugün/Hafta/Albüm) çizilmedi.** Aşağıdaki C ekranları `kart-c-cikartma-albumu.html` token'larından türetilmiş wireframe'dir; görsel karar `visual-designer`'ındır.
**Ölçü tabanı:** durum çubuğu inseti 411x914 AVD'de **52 dp** (`[0,0][1080,136]` px @420dpi, 11 A11Y-01, K4); 360x640'ta ~37 dp. `docs/ux/ekran-akisi.md` ~24 dp varsayıyordu; bütçeler burada 52 ile yeniden hesaplandı.

## Özet (12 madde)

1. **Sorun "eksik ekran" değil "eksik yol".** Wow anına giden üç yol kırık (ilk kart yeniden açılamıyor, kaçırılan hafta, bildirim). Hedef akışları bölüm 1.8, 2.6, 2.7'de. Pazar bildirimi → kart: bugün 6-8 dokunuş; hedef 1 (bugün dolu) / 6 (bugün boş).
2. **Kaydet anı sessiz.** En ucuz çare yeni ekran değil: "N kategori kaldı" ipucu satırı ve Kaydet düğmesi *aynı yerde* başarı durumuna döner (dikey bütçe +0 dp, ek dokunuş 0, engellemeyen ≤ 0,9 sn).
3. **Hafta'da "açılabilir durumda unvan göstermeme" kararı doğru, korunmalı.** Asıl gerekçe tasarımcınınkinden güçlü: K3 yüzünden Pazar check-in'i kartı değiştirebilir, erken gösterilen unvan sonradan *değişebilir* (1.3).
4. **Kart albümü** = Hafta ekranında ikinci segment ("Bu hafta | Albüm"), yeni sekme yok (13 kapsam bütçesiyle uyumlu). Kırılmaz sayaç, tek "sıradaki" yuva, boşluk/eksik gösterilmez, milestone önceden gösterilmez (2.2).
5. **Seviye noktaları → konum çizgisi.** Dolu-nokta *sayımı* "daha çok = daha iyi" okutur; tek işaretin üç *konumu* okutmaz. Kelime birincil kalır (2.3).
6. **Onboarding 3 ekran + "ÖRNEK" çıkartma kartı;** örnek kart kendi kendine "yapışır" (≤1,3 sn), ürünün vaadini ilk 5 sn'de gösterir (2.4).
7. **K3 ara ekranı → Bugün'de 56 dp banner.** Spec (s.194) "check-in ekranına yönlendirilir" der; ayrı ara ekran bir tasarım eklentisiydi. Bir ekran ve bir dokunuş kazanılır; bütçe 868/914 dp (2.6, 3.2).
8. **Paylaşım 3 adımdan 2'ye:** kart ekranından tek "Paylaşım seçici" (canlı küçük önizleme + 5 satır göster/gizle + biçim). Satır 48 dp (bugün 25x24). Önizlemede unvan *birebir* görünür (2.8).
9. **Yetişkin/zarif C için UX kuralı:** eğim ve sert gölge yalnız *içerikte* (çıkartma); kontroller (düğme, segment, toggle, sekme) düz ve standart (2.9). Prototip C hâlâ "KARNESİ" yazıyor (bant + rozet), Karar 5 ile çelişiyor.
10. **Sistem `Alert`'leri tek bir uygulama içi "onay sayfası"na** taşınmalı (İngilizce "OK", geri tuşu kapatmıyor, "SIL", silme kapsamı belirsiz; 11 A11Y-15).
11. **"Neden pasif" ilkesi iki yerde ihlal:** Ayarlar saat çipleri (opaklık .4, sebep yok) ve "Kart hazır" bildirimi için ayrı anahtar yok (1.7).
12. **Albüm yeni bir metin sorunu doğuruyor:** kart satırları "bu hafta..." diyor; kaçırılan/albümden tekrar paylaşılan kartta yanlış olur → içerik zamansızlaştırılmalı (2.7, devir: copywriter).

---

## 1. Mevcut akışların denetimi

Önem: **B** blokör, **Y** yüksek, **O** orta, **D** düşük. Kanıt K4 = 09/11 emülatör, K1 = kod/belge okuması.

### 1.1 Onboarding (Karşılama → Gizlilik → Bildirim → Bugün)

| # | Bulgu | Kanıt | Önem |
|---|---|---|---|
| 1 | Karşılama yalnız metin; getiri görünmüyor, "Pazar ne alacağım?" cevapsız. Metinde "Her pazar bir **karne**" (Karar 5: Kart) | `welcome.tsx`, 13 §2.1 (K1) | Y |
| 2 | Dokunuş: Başla, Anladım, İzin ver + sistem izni = 4. "Şimdi değil" yolu ek yük getirmiyor (iyi) | ekran-akisi.md, 09 s04 | D |
| 3 | Bildirim ekranı sabit "21:00" diyor; Ayarlar'da 20-23 çip var. Kullanıcı 21:00 hatırlatmasıyla Pazar 20:00 kartının ilişkisini bilmiyor | ekran-akisi 1c, settings-view (K1) | O |
| 4 | Gizlilik ekranı "Telefon değişirse veri taşınmaz" ile *kayıp bildirisi* olarak bitiyor, çare sunmuyor (bkz. F7 yedek dosyası) | ekran-akisi 1b | D |
| 5 | İzin diyaloğu geri tuşuyla kapatılınca kalıcı ret gibi davranıyor (`blocked=true`, "Ayarları aç") | 09 QA4-04 (K4) | Y (platform) |
| 6 | İlk Kaydet'ten sonra "ilk kartım ne zaman?" cevabı yok (Kaydet sessiz, 1.2) | 09 s10-11 | Y |
| 7 | İlerleme göstergesi (1/3) yok; geri gidiş davranışı belgelenmemiş | K0 (doğrulanmadı) | D |

Boş/hata: kapı okuma hatasında "needed"e düşer, akış kilitlenmez (iyi, CLAUDE.md N-4). Silme sonrası onboarding'e dönüş düzeltildi.

### 1.2 Bugün (Kaydet anı)

| # | Bulgu | Kanıt | Önem |
|---|---|---|---|
| 1 | **Kaydet sessiz:** 0,4 ve 2 sn sonraki kare öncekiyle aynı; kayıt yalnız DB'de | 09 QA4-05 (K4) | Y |
| 2 | Emoji kutularında seviye adı yok, yalnız seçilince başlıkta ("Hareket · hafif"). İlk kullanımda 😌 mi 😴 mi "uzun" tahmin ediliyor. Uyku etiketleri "kötü/idare/iyi" yargı taşıyor | emoji-seti.md, 02 M-1 (K1) | O |
| 3 | Aynı gün ikinci açılış (bugün zaten kayıtlı) durumu tanımsız: seçimler görünüyor mu, düğme ne diyor? | ekran-akisi Ekran 2 (K1) | O |
| 4 | Kayıt hatası (DB yazma) için ekran durumu tasarlanmamış | K0 | O |
| 5 | 360x640'ta Sosyal kesik, kaydırma ipucu yok | 11 A11Y-14 (K4) | O |
| 6 | Belge bütçesi 24 dp inset varsayıyor; gerçek 52 dp. Hafta noktaları satırı eklenirse hesap yeniden yapılmalı | 11 (K4), bölüm 3.2 | O |
| 7 | 2 günden eski gün için yol yok (spec böyle). Başlık hangi günü düzenlediğini yazıyor (iyi) | spec | - |

İyi: "N kategori kaldı" pasif nedeni; renksiz seçili durum (çerçeve + selected); 12 düğme etiketi "Hareket: yoğun"; tek ekrana sığma testi.

### 1.3 Hafta (kilitli / açılabilir / açıldı) ve "erken unvan" kararı

| # | Bulgu | Kanıt | Önem |
|---|---|---|---|
| 1 | **Kritik-1:** ilk kart (3 gün) açılıp Kapat'tan sonra Hafta "1 gün daha lazım" diyor, kutu dokunuşa yanıt vermiyor | 09 QA4-01 (K4) | **B** |
| 2 | Kart açıldıktan sonra kutu hâlâ gri iskelet + kilit; başlık "Kartın açıldı." ile çelişiyor | 09 YB2-06 (K4) | O |
| 3 | Kilitli durumda "lazım" gereklilik tonu; başlık + caption + noktalar + kutu = 4 mesaj (yinelenme B5'te giderildi) | 02 §4.2, week-status-copy (K1) | O |
| 4 | 0 dolu gün (ilk hafta) ve DB okuma hatası durumları tanımsız | ekran-akisi Ekran 3 (K1) | O |
| 5 | Hafta noktaları dokunulmaz; kullanıcı kendi günlerinin ne olduğunu göremiyor (F5) | K1 | D |

**"Erken unvan göstermeme" (tasarımcının bulduğu akış kararı) — değerlendirme: KORU.**
- *Çünkü K3:* Pazar günü kart **check-in sonrası** dondurulur. Bugün boşken hesaplanıp gösterilen unvan, Pazar kaydı eklenince değişebilir (7 günün 1/7'si ortalamayı eşik sınırında oynatabilir). "Gördüğüm unvan gitti" güven kaybıdır ve wow'u iki kez söndürür.
- *Çünkü tek an:* ödül reveal'da yaşanır; önizleme onu tüketir. *Çünkü mimari:* kilitli/açılabilir ekran `buildCard` çağırmaz; sızıntı yok.
- *Karşı argüman:* merak/beklenti düşer. Çare içerik değil **şekil**: C'de arka kâğıtlı yuva, köşesi kalkık çıkartma, sabit siluetler (unvan bloğu, 4 satır, balon). Kural: "açılabilir" durumda **hiçbir dinamik içerik** (emoji, kelime, seviye) çizilmez. Kart açıldıktan sonra (dondu, değişmez) küçük gerçek kart/unvan göstermek serbest.
- *Ölçüt (K0, denenmeli):* 5 kişi, "kartında ne olacağını tahmin ediyor musun?" ve "erken görmek isterdim" ≤ 2/5.

### 1.4 Kart açılışı (reveal)

| # | Bulgu | Kanıt | Önem |
|---|---|---|---|
| 1 | İlk açılışta 2-3 sn beyaz ekran + spinner (font/DB). `ekran-akisi.md` "spinner yok" der; gerçek farklı. Wow'un önünde bekleme | 09 YB2-08 (K4, debug) | Y |
| 2 | Reveal yalnız opaklık; azaltılmış hareketi yok sayıyor | 11 A11Y-04 (K4) | O |
| 3 | Deep link/bildirimle açılan kart ekranında geri tuşu uygulamadan çıkıyor (altta yığın yok) | 09 YB2-13 (K4) | O |
| 4 | "Bu kart albüme girdi" hissi yok (albüm henüz yok) | K1 | O |
| 5 | Kart ekranı emoji/satır ayrı düğümler, birleşik etiket yok | 11 A11Y-13 | O |

İyi: X üstte, Paylaş tek birincil eylem; tekrar açış aynı dondurulmuş içerik; kart PNG'si yazı ölçeğinden bağımsız.

### 1.5 Pazar K3 akışı

| # | Bulgu | Kanıt | Önem |
|---|---|---|---|
| 1 | Akış çalışıyor ("Kaydet = devam", ara ekran, geri tuşu serbest) | 09 madde 14 GEÇTİ (K4) | iyi |
| 2 | "Karnen hazır" bildirimi 20:00'de gider; bugün büyük olasılıkla boş → ara ekran *neredeyse her seferinde*. Belge bunu "sık senaryo" diye kabul ediyor: fazladan ekran + dokunuş | pazar-akisi kenar durum 2 | O |
| 3 | Ara ekran "Geri" 29x24 dp | 11 A11Y-08 | O |
| 4 | Bugün ekranına geçince kullanıcı *neden orada olduğunu* görmüyor; Kaydet sonrası kartın otomatik açılacağı duyurulmuyor (sürpriz, ama olumlu) | pazar-akisi (K1) | O |
| 5 | "Bugünün verisi olmadan hafta **eksik sayılır**" yargıya yakın | pazar-akisi | D (copy) |

### 1.6 Paylaşım (kart → önizleme → sistem sayfası)

| # | Bulgu | Kanıt | Önem |
|---|---|---|---|
| 1 | Varsayılan gizlemede unvan 81 kombinasyonun 15-16'sında görünür (`???` çoğu hafta) | 09 madde 4 (K2+K4) | **Y** (birincil metrik) |
| 2 | Önizleme kartın kendisi değil bir liste; kullanıcı neyi paylaşacağını *görmüyor* | 10 G7 | Y |
| 3 | "< Geri" durum çubuğunda: 4/4 dokunuş tepkisiz | 09 YB2-01, 11 A11Y-01 (K4) | Y |
| 4 | Göster/gizle 25x24 dp; 2.0'da satır metni kesiliyor | 11 A11Y-02, -06 | Y |
| 5 | Hedefe metin gitmiyor, PNG'de yer tutucu bağlantı | 09 YB2-12 | O |
| 6 | Biçim seçimi yok; Story güvenli alan (üst ~83, alt ~113 mantıksal px) prototip C'de kısmen ihlalli: bant y=26, rozet y=10-102, altbilgi y=596+ | 15 §2.15 [İ], kart-c (K1) | O |

İyi (korunur): zorunlu önizleme, varsayılan gizleme (uyku+harcama), gizlenen metnin *ekranda görünmesi* ("ne sakladığını bilsin"), seçimlerin kalıcı olmaması.

### 1.7 Ayarlar ve silme

| # | Bulgu | Kanıt | Önem |
|---|---|---|---|
| 1 | Tek "Günlük hatırlatma" anahtarı var; "Kart hazır" bildirimi hatırlatma kapalıyken de planlanıyor (03) ve ayrı kontrolü yok: rıza/kontrol boşluğu | 03, `settings-view.tsx` (K1) | Y |
| 2 | Saat çipleri kapalıyken opaklık .4, **sebep yazmıyor** ("neden pasif" ihlali) | `settings-view.tsx:231` (K1) | O |
| 3 | Anahtar etiketsiz, 46x27 dp; "Bildirim izni kapalı" çözüm sunmuyor | 11 A11Y-03, -10 | O |
| 4 | "Gizlilik politikası (yakında)" yarım ürün sinyali; üretimde ağ yokken URL de açılamaz | `settings-view.tsx:168` (K1) | O |
| 5 | "Deneme raporunu paylaş" deneme yapısına özgü; üretimde görünürlüğü karar | K1 | D |
| 6 | Silme: kırmızı metin 4.03:1; Alert "SIL" (İngilizce sistem dili), **kapsam yazmıyor**, geri tuşu kapatmıyor | 09 YB2-05, 11 A11Y-05, -15 | O |
| 7 | Düz liste, bölüm yok; 5+ öğede "Hatırlatma / Veriler / Hakkında" gruplaması gerekir | K1 | D |

İyi: silme tam temizlik yapıyor (tablolar, alarm, önbellek 0; 09 madde 13); silme sonrası onboarding.

### 1.8 Üç kırık yol (13) ve hedef akış

| Yol | Bugün (K4) | Dokunuş | Hedef | Dokunuş |
|---|---|---|---|---|
| **Yeniden açma** (ilk kart, 3 gün) | Kapat → Hafta "1 gün daha lazım", kutu ölü; yalnız deep link | ∞ | Hafta "Kartın açıldı" + küçük gerçek kart, dokun → kart (anında, animasyonsuz) | 1 |
| **Kaçırılan hafta** | Pazartesi: Hafta yeni haftayı gösteriyor; Bugün'de referans yok; bildirim yönlendirmiyor | ∞ (UI yolu yok) | Hafta banner + Albüm "Bekliyor" yuvası + Bugün'de Kaydet sonrası CTA | 2 (Hafta sekmesi + banner) |
| **Bildirim** | "Karnen hazır" son rotayı açar (Ayarlar/Hafta); soğuk açılışta Bugün | 2-8 | Doğrudan kart (bugün doluysa) veya Bugün + banner → Kaydet → kart | 1 / 6 |
| Deep link geri | Uygulamadan çıkar | - | Kart ekranı her zaman Hafta yığınının üstünde | - |

Dokunuş hesabı (bildirim, bugün boş): bugün = bildirim, kutu, "Bugünü işaretle", 4 emoji, Kaydet = **8**; hedef = bildirim, 4 emoji, Kaydet = **6**. Bugün dolu: bugün 2 (bildirim + kutu, son rota Hafta ise), hedef **1**.

### 1.9 "Neden pasif" taraması

Geçen: Kaydet ("N kategori kaldı"), kilitli kutu ("Pazar 20:00'de açılıyor"). Kalan: saat çipleri (1.7-2), Ayarlar anahtarı izin yokken kapalı çizilip *nasıl açılacağı* söylenmiyor (A11Y-10), Albüm "Bekliyor" yuvası (yeni; sebep yazmalı, 2.2), paylaşım seçicide "Unvan" satırı unvan değişince neden değiştiğini söylemeli (2.8).

---

## 2. Yeni akış tasarımı

### 2.0 İlkeler (bu bölümün sözleşmesi)

| İlke | Kural |
|---|---|
| Tek soru, tek eylem | Bugün: "Bugün nasıldı?" → Kaydet. Hafta: "Kartım ne durumda?" → hazırsa Aç. Albüm: "Ne biriktirdim?" → kartı aç. Kart: "Ne çıktı?" → Paylaş. Seçici: "Neyi göstereyim?" → Paylaş |
| Ödül eylemden **sonra** | Çağırıcı banner/CTA'lar eylem tamamlanınca gelir, önce değil (Bugün tek eylemi bozulmaz) |
| Dört durum | Her ekran ilk kullanım / günlük / dönüş / hata için tanımlı (3.5) |
| Kontroller düz | Eğim, sert gölge, kalın kontur yalnız *içerik* nesnelerinde; kontrol trafiği standart Material dilinde (2.9) |
| Renk yargı taşımaz | Kategori tonu kategoriyi ayırır, **seviyeyi asla**; hiçbir bilgi yalnız renkle verilmez |
| Etik sınır | Seri kaybı, FOMO, rekor/kıyas, eksik-yuva baskısı, bildirim yağmuru yok (2.2 listesi) |

### 2.1 Bilgi mimarisi

```
Sekmeler:   [ Bugün ]   [ Hafta ]   [ Ayarlar ]         (yeni sekme yok)
                           |
                   Segment: ( Bu hafta | Albüm )
                     |                    |
                     |                    +--> Kart ekranı (viewer)
                     +--> Kart ekranı (reveal, ilk açılış)
Kart ekranı --Paylaş--> Paylaşım seçici --Paylaş--> sistem sayfası
Onboarding (3) --> Bugün
```
Rota kuralı: `/card/[weekStart]` her zaman **Hafta yığınının üstündedir** (soğuk açılış/deep link/bildirimde yığın sentezlenir); Kapat/Geri → Hafta. Çünkü YB2-13'te geri tuşu uygulamadan çıkıyor.
*Neden segment, sekme değil:* 13'ün "yeni sekme yok" bütçesi; albüm haftaların doğal devamı ("bu hafta" albümün son sayfası); solo eforu düşük. *Alternatif:* 4. sekme "Albüm" (411/4 ≈ 102 dp, sığar; keşfi daha kolay). Q1.

### 2.2 Kart albümü

**Metafor:** her hafta albüme bir çıkartma yapışır. Bu hafta = albümün **henüz yapıştırılmamış** yuvası (C'nin gizli durumuyla aynı görsel dil: çizgili arka kâğıt + kesik kontur). Mor noktalı albüm zemini yalnız albüm/kart yüzeylerinde; yönlendirme kabuğu sade kalır (2.9).

**Segment "Albüm" içeriği (üstten alta):** sayaç satırı ("Albümünde **7** kart var.", uygulama içinde rakam serbest, K-6a), ızgara.

**Hücre (≈183x190 dp, 2 sütun):** sarı unvan çıkartması (gerçek metin, ≤2 satır, 16sp 800; yazı ölçeğinde 3 satıra uzar), altında mürekkep bant "No. 7" ve küçük tarih aralığı ("21-27 Eyl", uygulama içi; Q7). Hücre **ölçeklenmiş CardView değil**, ayrı bileşen (118 dp genişlikte 32px'lik unvan okunmaz). Tek dokunuş = kart ekranı (viewer: animasyonsuz, Paylaş açık). Erişilebilirlik etiketi: "No. 7, Konforun Kalesi, 21-27 Eylül. Kartı aç."

**Sıralama:** yeni üstte (en sık dokunulan üstte). **Numara** = dondurulmuş kart sırası (takvim değil): 7. kart = 7. kart; kaçırılan haftalar numara boşluğu yaratmaz.

**Durumlar:**

| Durum | Görünüm | Sebep metni |
|---|---|---|
| Hiç kart yok (yeni) | Tek kesik yuva + küçük ÖRNEK kartı + cümle | "İlk kartın, ilk pazarında buraya yapışır." |
| Bu hafta, eşik yok | Kesik yuva, "Sıradaki" bandı | "Pazar 20:00'de yapışır" |
| Bu hafta, eşik var | Kesik yuva, köşesi kalkık | aynı |
| Açılabilir, açılmamış (bu veya geçen hafta) | Kesik yuva + "Bekliyor" bandı, yumuşak nabız | "Yapıştırmak için dokun" |
| Dondurulmuş kart | Sarı unvan çıkartması | - |
| Yükleme | 4 iskelet yuva (spinner yok) | - |
| Hata | Tek satır + "Tekrar dene" (veri dokunulmaz) | "Albüm açılamadı." |
| Silme sonrası | "Yeni kullanıcı" durumu | - |

**Etik sınır (bağlayıcı liste):**
1. Sayaç yalnız artar; yalnız "Tüm verilerimi sil" sıfırlar (silme onayı bunu söyler).
2. Kaçırılan haftalar için boşluk, "kaçırdın", kırmızı, sayaç yok. Yalnız uygun ve açılmamış olanlar "Bekliyor" yuvası olarak görünür (birden fazlaysa hepsi, ama **sayı rozeti yok**).
3. **Tek** hayalet yuva ("sıradaki"); gelecek numaralı boş yuva ızgarası yok (Panini etkisi yok).
4. Milestone (1., 4., 10., 26. kart) yalnız ulaşıldığında **sürpriz** olarak, reveal'da ("Albümde ilk çıkartma" gibi) ve ikinci bir çıkartma varyantıyla; önceden hedef olarak gösterilmez.
5. Rekor, "en iyi hafta", nadirlik, yüzde, karşılaştırma yok. Albüm için bildirim yok.
6. Sayaç ve "No." **PNG'ye girmez** (kartta ham sayı yok kuralı).
7. Albümden çıkış sürtünmesiz; hiçbir yerde "albümünü kaybedeceksin" dili yok.

**Metrik:** `archive_opened` (13 V6): kartı ≥2 olanların ≥%40'ı.

### 2.3 Seviye gösterimi (Karar 6)

**Sorun:** 1-3 dolu nokta *sayım* olarak okunur; "3 nokta > 1 nokta" değer yargısıdır, harcama "çok" övgü değildir.
**Öneri: konum çizgisi.** 56x10 dp beyaz çubuk, 2,5 px mürekkep kontur; içinde tek 14 dp mürekkep dolu daire **sol / orta / sağ** konumda. Hiçbir şey dolmaz, birikmez. Kelime ("durgun / hafif / yoğun") birincil, çizgi ikincil.
- *Çünkü:* konum "spektrumda neredesin", dolgu "kaç puan aldın" der. Uçlar simetrik, orta "en iyi" değil.
- Kartta 3 nokta yerine, aynı yerde. Gizli satırda çizgi **hiç çizilmez** (mevcut sabit genişlikli gri çubuk kalır, sızıntı yok). Ekran okuyucu için çizgi gizli (`importantForAccessibility=no`); bilgi kelimede.
- Bugün ekranında ayrı çizgi yok (seçili emoji + kelime yeter).
- *Yedekler:* (B) emoji rozeti boyutu 40/46/52 dp; (C) yalnız kelime. Q2.
- **Test (K0 önerisi):** 5 kişi, "3. konumdaki daha iyi mi?" evet ≤ 1/5; taban çizgisi olarak eski noktalarla aynı soru.

### 2.4 Onboarding: "ÖRNEK" kart

Karşılama ekranı (3 ekran, 3 dokunuş korunur; yeni ekran yok): ekran metni + **eğik "ÖRNEK" bantlı küçük çıkartma kartı**.
- Kart otomatik oynar: t=0 arka kâğıtlı yuva → 300 ms unvan çıkartması yapışır → satırlar 90 ms arayla → balon → rozet (≤1,3 sn). Dokununca yeniden oynar. Azaltılmış harekette statik son kare.
- İçerik uydurma, gerçek havuzda olmayan unvan (copywriter); veri/repo çağrısı yok; **paylaşılamaz**; erişilebilirlik: "Örnek kart. Gerçek değil."
- Örneği kendi kartı sanma riski: "ÖRNEK" bandı + alt yazı "Böyle görünür. Seninkini pazar açarsın."
- Bütçe: kart yüksekliği ekrana göre 193-420 dp (3.2). 13'ün kesme kuralı: 5 kişilik testte 0/5 "kendi kartı sandı" ve ≥4/5 "Pazar ne alacağım?"ı anlatıyor; geçmezse örnek çıkar, minyatür kalır.
- Bildirim ekranında saat seçimi 3 çip (20:00 / **21:00** / 22:00) *aynı ekranda*, ek dokunuş gerektirmez (varsayılan seçili). Çünkü bugün kullanıcı saati bilmeden izin veriyor.

### 2.5 Kaydet mikro-anı (≤12 sn akışı bozmadan)

**Konum:** yeni ekran/diyalog yok. Mevcut iki yuva dönüşür: ipucu satırı ("2 kategori kaldı") → ilerleme cümlesi; Kaydet düğmesi → "Kaydedildi". Bugün ekranında hafta noktaları satırı varsa bugünün noktası dolar.

| t | Ne olur |
|---|---|
| 0 | Dokunma: düğme basılı (0,97), hafif haptik (K-7 izin verirse) |
| 80 ms | Etiket "Kaydedildi" + onay işareti (120 ms çapraz geçiş); düğme 900 ms kilitli (çift dokunuş koruması, 08 M-9) |
| 120 ms | Bugünün noktası dolar (1→1,25→1, 220 ms) |
| 200 ms | İpucu satırı ilerleme cümlesine döner; **aynı cümle** `announceForAccessibility` ile okunur (A11Y-07) |
| 900 ms | Kilit kalkar; yuva "sıradaki en iyi eylem"e döner (tablo) |

Toplam animasyon ≤ 0,9 sn ve **engellemez** (sekmeler açık). Akış süresi ≈ 8 sn + 0,9 sn animasyon (dokunuş sayısı değişmez). *Kill kriteri (15 KC2):* kronometreyle 5 turda >12 sn ise geri al/kısalt.

| Durum | Cümlenin amacı | Ek |
|---|---|---|
| İlk kayıt | "İlk gün tamam" + ilk kartın ne zaman | - |
| Normal gün | Kalan gün sayısı | - |
| **Eşik doldu** | "Kartın yolda, Pazar 20:00" | çift haptik; Hafta yuvası köşesi kalkar |
| Eşik sonrası fazladan gün | Sessiz "Kaydedildi" (ödülü şişirme) | - |
| Aynı gün düzenleme | "Güncellendi" | haptik yok, nokta animasyonu yok |
| Dün kaydı | "Dün de tamam" | dünün noktası |
| Pazar + K3 kaynağı | Mikro-an **yok**: doğrudan kart | - |

Yuva sonrası eylemi: varsayılan "Kaydedildi" (etkisiz bilgi). **Bekleyen geçen hafta kartı varsa** düğme yuvası "Geçen haftanın kartını aç" olur (ödül eylemden sonra; bütçe +0). Bir seçim değişirse yuva "Güncelle"ye döner.
*03 Ö1'den ayrım:* otomatik Hafta sekmesine geçiş **önerilmiyor**: kullanıcının kontrolünü alır, düzeltme fırsatını keser.
*Çünkü:* kart içeriğini sızdırmaz (cümleler yalnız gün sayısından türer).

### 2.6 Bildirimden karta geçiş

```
Bildirim dokun (uygulama kapalı / arkada / açık)
 |
 +- onboarding bitmedi? -> onboarding
 +- kind = daily ---------> Bugün
 +- kind = card-ready(weekStart) -> weekStart doğrula (week-param)
      +- uygun değil ------------> Hafta (Bu hafta) + tek satır bilgi
      +- kart var (dondurulmuş) -> Kart ekranı, viewer (animasyonsuz)
      +- uygun, Pazar, bugün boş -> Bugün + K3 banner
      |        Kaydet ---------> Kart ekranı, reveal (otomatik)
      +- uygun, bugün dolu -----> Kart ekranı, reveal
 Kart: Kapat -> Hafta (yığın: Bugün > Hafta > Kart)
```
- **K3 banner (Bugün üstü, 56 dp):** "Kartın hazır. Bugünü de işaretle, kart açılsın." Hafta noktaları satırının yerini alır (Pazar'da noktalar zaten ikincil). Geri tuşu serbest (pazar-akisi kararı korunur); geri gidilirse Hafta'da kilitli kutu altı "Bugünü işaretlemeden kartın açılmaz" (mevcut).
- Bildirim "Karne" değil **"Kart"** (Karar 5). Payload `{kind, weekStart}` (spec S8 #7'de yazılı, kodda yalnız `kind`).
- Bekleme: yuva/zemin rengi ile açılış (beyaz spinner yok): kart ekranı C mor noktalı zeminle *hemen* açılır, fontlar hazırlanırken boş yuva görünür.

### 2.7 Kaçırılan hafta yolu

Yüzeyler (sırayla, biri yeter): **(1)** Hafta > Bu hafta üstünde 64 dp banner "Geçen haftanın kartı seni bekliyor" (kart açılmamış + uygun); **(2)** Albüm'de "Bekliyor" yuvası; **(3)** Bugün'de Kaydet sonrası CTA yuvası (2.5); **(4)** *opsiyonel (Q4)* tek Pazartesi öğlen bildirimi, veri yok, kart açılınca iptal (03 Ö3; S8 "telafi yok" kuralını değiştirir).
- Tıklayınca normal reveal (K3 uygulanmaz: Pazartesi'de bugün ≠ Pazar).
- Birden çok bekleyen kart: banner yalnız en yeni; albümde hepsi yuva; sayaç yok.
- **Zamansız metin şartı:** kart satırları/özet "bu hafta..." diyor ("Kanepe **bu hafta** seni pek bırakmadı", "**Bu hafta** terazi..."; bant "BU HAFTANIN UNVANI"). Kaçırılan hafta açıldığında ve albümden haftalar sonra paylaşıldığında yanlış olur. Copywriter: havuz "o hafta"ya da zamansıza çevrilmeli; bant "HAFTANIN UNVANI" (kabul: içerik değişikliği `CONTENT_VERSION`; **dondurulmuş eski kartlar eski metinle kalır**, V5 ile birlikte karar).

### 2.8 Paylaşım seçici

Kart ekranında **Paylaş** → tam ekran seçici (bugünkü ayrı önizleme ekranının yerine).

```
Üst çubuk: [Geri]  Paylaş                     (inset altı, 48 dp)
Önizleme:  gerçek kart, ~%50 (180x320), varsayılan gizleme uygulanmış
Satırlar:  Unvan        <unvan metni / Gizli>        [Göster|Gizle]
           Hareket      [emoji] Göster               [Göster|Gizle]
           Uyku         [emoji] Gizli (varsayılan)   [Göster|Gizle]
           Harcama      [emoji] Gizli (varsayılan)   [Göster|Gizle]
           Sosyal       [emoji] Göster               [Göster|Gizle]
           (metin düğmesi)  Hepsini göster  /  Varsayılana dön
Biçim:     ( Dikey 9:16 | Kare )     <- kare gelene kadar gizli (Q5)
Paylaş     [ birincil ]     alt not: Gizlediğin metin dosyaya girmez.
```
- **Satır 48 dp, metinli anahtar** ("Göster"/"Gizle" yazar; renk tek başına anlam taşımaz). Önizlemedeki satıra dokunmak da aynı anahtarı çevirir (bonus, birincil yol değil).
- **Unvan (K-2 a):** önizleme her zaman *paylaşılacak unvanı* birebir gösterir. Uyku/Harcama gizliyken **paylaşım unvanı**; kullanıcı gizli bir kategoriyi gösterirse asıl unvan uygunsa önizleme güncellenir ve 2 sn'lik satır "Unvan güncellendi" (ekran okuyucuya da duyurulur). Çünkü sürpriz önizlemede olmalı, paylaştıktan sonra değil. "Unvanı gizle" = unvan çıkartması arka kâğıda döner.
- Yükleme: Paylaş → düğme "Hazırlanıyor" (≤1 sn), spinner yok. Hata: seçici üstünde satır "Kart hazırlanamadı. Tekrar dene." Paylaş aktif kalır.
- Çıkış: Geri = seçimler varsayılana sıfırlanır (spec). Sistem sayfası kapanınca seçicide kalınır (tekrar paylaşabilir).
- Story güvenli alanı: kritik içerik kartın **83-527 px** bandında olmalı (üst 250/alt 340 px @1080x1920 ÷3, 15 §2.15 [İ], K5 ile doğrulanacak). Prototip C'de bant/rozet üst bölgede, altbilgi alt bölgede: dekoratif olmaları kabul, *unvan ve marka* güvenli banda alınmalı (visual-designer).

### 2.9 C'yi "yetişkin, zarif, esprili" yapmak için UX kuralları

1. Eğim ve sert gölge yalnız içerik (unvan, satır, balon, albüm hücreleri); düğme, segment, toggle, sekme, banner **düz**, standart yüzeyde (güven: dokunma hedefi "oynamaz").
2. Eğim ≤ ±1,5° (prototipte -3° bant, -2° unvan); satır eğimleri ≤ ±0,8°.
3. Kabuk paleti: mor + mürekkep + beyaz + tek vurgu (sarı); pembe yalnız marka rozeti. Kategori tonu yalnız emoji rozeti zemini; satır/çerçeve/metin tonlanmaz.
4. Hareket: overshoot ≤ %8, konfeti/patlama yok; ses yok. Yapışma = 120 ms yaklaş + 1 sert gölge "oturma".
5. Metin sesi kuru-esprili; ünlem ve "Yaşasın" tonu yok (copywriter).
6. Mor zemin üstünde küçük/ince metin yok: beyaz ≥14sp 700 ya da metin sticker/pill içinde (prototipin 5,2:1 notu, nokta dokusu nedeniyle).
7. Dark mod v1'de yok (B14 açık temaya kilit; C zemini tema değiştirmez).
8. "KARNESİ" ifadeleri (kart bantı, rozet, onboarding, bildirim) → "Kart" (Karar 5); marka rozeti "HAFTİK" tek başına yeter.

---

## 3. Ekran ekran wireframe, bütçe, durumlar

Ölçüler dp, 411x914, inset 52 üst / 24 alt (gesture). ASCII yapı gösterir, piksel iddiası taşımaz.

### 3.1 Wireframe'ler

**W1 Onboarding 1 (Karşılama + ÖRNEK)**
```
[52 inset]
haftik (wordmark)                                   40
Her gün 8 saniye. Her pazar bir kart.               68
 +------ ÖRNEK (eğik bant) ------+
 |  [sarı unvan çıkartması]      |   kart 193-420 dp
 |  4 çıkartma satırı + balon    |   (ekrana göre)
 +-------------------------------+
Böyle görünür. Seninkini pazar açarsın.             20
Haftanı emojiyle anlat, pazar akşamı kartın.        40
[            Başla            ]  56, ≥48 dokunma
[24 nav inset]
```
**W2 Bugün (kaydetmeden / kaydettikten sonra)**
```
[52]  [‹ Dün]                       Bugün ›         48
BUGÜN · CUMA / 25 Eylül                               60
Pzt Sal Çar Per Cum Cmt Paz  (noktalar, dokunulmaz)   52
Hareket · hafif                                       24
[emoji+kelime] [emoji+kelime] [emoji+kelime]  72 (sabit)
... Uyku / Harcama / Sosyal  (her biri 104, aralar 12)
--- sabit alt ---
"2 kategori kaldı"  ->  "Bugün tamam. Kartın için 2 gün." 20 (+12)
[ Kaydet ]  ->  [ Kaydedildi ]                        56 (+8)
[Bugün] [Hafta] [Ayarlar]                             64 + 24
```
Emoji kutusu içinde 12sp seviye kelimesi (34 dp emoji + 4 + 14 = 52 < 72 ✓; kelime `maxFontSizeMultiplier` 1,3, erişilebilirlik etiketi tam).

**W2b Bugün, K3 banner varyantı** (Pazar, bugün boş)
```
[52] [‹ Dün]                                          48
BUGÜN · PAZAR / 27 Eylül                              60
+--------------------------------------------------+
| Kartın hazır. Bugünü de işaretle, kart açılsın.  |  56 (noktaların yerine)
+--------------------------------------------------+
... 4 kategori ... [Kaydet]  -> Kaydet = kartı aç (otomatik)
```
**W3 Hafta · Bu hafta (kilitli)**
```
[52]  HAFTA                                            64
      Bu hafta
( Bu hafta | Albüm )  segment, 48
Pzt Sal Çar Per Cum Cmt Paz  noktalar (dolu ✓ / boş / kesik)  52
"Kartın için 1 gün daha." (başlık, 28)
   +--------------------------+
   | (çizgili arka kâğıt yuva) |  216x384
   |   kesik kontur, kilit yok |
   |   [Sıradaki] bant         |
   +--------------------------+
Pazar 20:00'de yapışır (alt yazı, 24)
```
Durumlar (aynı çerçeve): **Eşik var, saat yok:** köşe kalkık, başlık "Kart yolda". **Açılabilir:** köşe kalkık + nabız + "Kartın hazır. Dokun."; **K3 (Pazar, bugün boş):** alt yazı "Bugünü işaretlemeden kartın açılmaz" + banner için Bugün'e yönlendiren dokunuş. **Açıldı:** yuvada küçük gerçek kart (dondurulmuş) + "Tekrar görmek için dokun". **Geçen hafta bekliyor:** başlığın üstünde 64 dp banner.

**W4 Hafta · Albüm**
```
[52]  HAFTA / Bu hafta                                  64
( Bu hafta | Albüm )                                    48
Albümünde 7 kart var.                                   32
+------------------+ +------------------+
| [sarı unvan]     | | [sarı unvan]     |  183x190 hücre
| No. 7 · 21-27 Eyl| | No. 6 · 14-20 Eyl|  (12 dp aralık)
+------------------+ +------------------+
+------------------+ +------------------+
| kesik yuva       | | [sarı unvan]     |
| Bekliyor · dokun | | No. 5            |
+------------------+ +------------------+
(3. satır kısmen görünür = kaydırma ipucu)
```
**W5 Kart ekranı (reveal / viewer)**
```
[52] [X Kapat 48x48]                                    48
   kart 360x640, 1:1 ölçek (küçük ekranda ölçeklenir)  640
   (zemin: mor noktalı albüm sayfası)
Albüme yapıştırıldı · No. 7  (yalnız ilk reveal)        20
[ Paylaş ]                                              56
```
**W6 Paylaşım seçici** — bölüm 2.8'deki blok.
**W7 Ayarlar v2**
```
Ayarlar (başlık)
-- HATIRLATMA --
Günlük hatırlatma                    [anahtar, satır tümü 48+ dokunma]
  Bildirim izni kapalı. Anahtarı açınca izin isteriz.   (duruma göre)
  Saat: (20:00)(21:00)(22:00)(23:00)   kapalıysa: "Hatırlatma kapalı"
Kart hazır olunca haber ver          [anahtar]      <- YENİ, ayrı
-- VERİLERİM --
Gizlilik ve veriler >    (uygulama içi sayfa, ağ yok)
Kayıtlarım: 12 gün · 3 kart           (bilgi satırı, isteğe bağlı F10)
-- DENEME -- (yalnız preview yapıda) Deneme raporunu paylaş
-- Tehlikeli alan --
[ Tüm verilerimi sil ]   -> onay sayfası (aşağıda)
```
Silme onay sayfası: başlık "Tüm veriler silinsin mi?", gövde "12 günlük kayıt ve 3 kart bu telefondan silinir. Geri alınamaz.", düğmeler **[Vazgeç]** (varsayılan odak) / [Sil] (koyu kırmızı ≥4.5:1, metin "Sil"). Geri tuşu = Vazgeç.

### 3.2 Dikey bütçe (411x914 ve 360x640)

| Ekran | Hesap (dp) | Toplam | Sonuç |
|---|---|---|---|
| Bugün (K1 hesap) | inset 52 + üst satır 48 + tarih 60 + noktalar 52 + 4x104 + 3x12 = 452 + ipucu 32 + Kaydet 64 + boşluk 16 + sekme 64 + gesture 24 | **864** | sığar (50 boş) |
| Bugün, K3 banner | noktalar (52) yerine banner 56 | **868** | sığar (46 boş) |
| Hafta · Bu hafta | 52 + başlık 64 + segment 48 + 12 + noktalar 52 + cümle 28 + 8 + yuva 384 + alt yazı 24 + 8 + sekme+gesture 88 | **768**; +64 banner = 832 | sığar |
| Hafta · Albüm | 52 + 64 + 48 + sayaç 32 = 196; pencere 914-196-88 = 630 | hücre pitch 202 → 3,1 satır | kaydırma ipucu doğal |
| Kart ekranı | 52 + üst çubuk 48 + kart 640 + etiket 20 + boşluk 8 + Paylaş 56 + 24 | **848** | kart 1:1 (66 boş) |
| Paylaşım seçici | 52 + 48 + önizleme 320 + 12 + 5x48 + 8 + Hepsini göster 48 + 8 + biçim 48 + 8 + Paylaş 56 + 16 + 24 | **888** (kare yokken 840) | sığar, **26 dp pay: dar**; satır eklenirse kaydırma |
| Onboarding 1 | sabit 356 (52+40+68+12+12+60+16+56+24+16) | kart ≤ 558, hedef 420 | sığar |

**360x640:** Bugün: sabit üst 145 (37+48+60; noktalar gizli), sabit alt 112 (ipucu+Kaydet+boşluk) + sekme/nav 112 → kategori penceresi **271 dp (2,6 kategori)**: kaydırma + alt kenar solma ipucu şart (A11Y-14). Hafta: yuva yüksekliği = kalan alan (≈298 dp, ölçek 0,47). Kart ekranı: mevcut ölçek 0,69 (PNG etkilenmez). Seçici: CTA sabit, geri kalanı kaydırılır; önizleme ≥%36 ölçek.

### 3.3 Durum tabloları (dört durum)

| Ekran | İlk kullanım | Günlük | Dönüş (uzun ara/gün değişimi) | Hata / izin reddi |
|---|---|---|---|---|
| Onboarding | ÖRNEK kart oynar | - | "Tüm veriler silindi." tek satır (silme sonrası) | İzin reddi: "Şimdi değil" ile devam, Ayarlar'dan açılır |
| Bugün | Boş, 4 kategori, "4 kategori kaldı" | Seçim → Kaydet → mikro-an | 4+ gün sonra tek satır "Yeni bir hafta, temiz sayfa." (kaç gün yazılmaz); gün dönümünde canlı güncelleme (BLG-03) | Kayıt hatası: ipucu satırı "Kaydedilemedi. Tekrar dene."; seçimler korunur, Kaydet aktif |
| Hafta · Bu hafta | 0 gün: "Bu hafta boş sayfa. İlk gününü işaretle." | Noktalar + yuva | Pazartesi: banner (geçen hafta bekliyor) | DB okuma hatası: yuva yerine "Hafta açılamadı. Tekrar dene." |
| Albüm | Kesik yuva + ÖRNEK | Kartlar + sıradaki yuva | "Bekliyor" yuvaları | Yükleme iskeleti; hata satırı |
| Kart | Reveal (bir kez) | Viewer, animasyonsuz | - | Yükleme uzarsa yuva görünür; kart hazırlanamazsa Hafta'ya dön + satır |
| Seçici | Varsayılan gizleme | Seçimler oturuma özel | - | PNG hatası: inline satır |
| Ayarlar | - | Anahtarlar | Bildirim izni yeniden okunur (odak/`active`) | İzin yok: sebep + çare metni (`canAskAgain`e göre) |

### 3.4 Mikro-etkileşim

| Öğe | Dokunma / basılı | Başarı | Hata | Azaltılmış hareket |
|---|---|---|---|---|
| Emoji kutusu | 0,96 ölçek, 60 ms | Seçili: 2,5 dp çerçeve + onay rozeti + dolgu (renksiz ayırt edilir) | - | ölçek yok |
| Kaydet | basılı 0,97; 900 ms kilit | "Kaydedildi" + nokta dolar + haptik | ipucu satırında hata metni | tek 150 ms opaklık, nokta animasyonsuz |
| Nokta (Hafta) | dokunulmaz (v1) | - | - | - |
| Kilitli/hazır yuva | Kilitli: kısa yatay sarsma yerine 2 sn alt yazı vurgusu (sarsma sebep açıklamaz); hazır: dokun → reveal | Reveal | - | sarsma/nabız yok, yalnız statik köşe |
| Albüm hücresi | basılı 0,98 | Kart ekranı | - | - |
| Reveal | Herhangi dokunuş = atla | Sıralı yapışma ≤1,4 sn, 2 haptik (unvan, rozet) | - | tek 150 ms opaklık |
| Göster/Gizle | anahtar metni anında | Önizlemede satır çizgili arka kâğıda döner (120 ms) | - | anında |
| Paylaş | "Hazırlanıyor" | Sistem sayfası | inline hata | - |
| Onay sayfası | Vazgeç odakta | Sil → onboarding | - | - |

### 3.5 Boş-durum ve hata metni ihtiyacı (copywriter'a devir)

Ton: kuru-esprili, yargısız, suçlamasız; "lazım/yap" emri ve "eksik/kaçırdın" yok; seviye/kategori içeriği sızdırmaz; kartta rakam/tarih yok, uygulama içinde serbest.

| ID | Yer | Durum | Kısıt |
|---|---|---|---|
| M1 | Onboarding 1 | Başlık + gövde ("karne" → "kart") | ≤2 satır başlık |
| M2 | Onboarding 1 | ÖRNEK alt yazısı | "Gerçek değil, örnek" anlaşılır |
| M3 | Örnek kart | Uydurma unvan + 4 satır + özet | Gerçek havuzda olmayan unvan; mizah |
| M4 | Onboarding 3 | Bildirim gerekçesi + saat çipleri | Saat neden soruluyor |
| M5 | Bugün | İpucu: N kategori kaldı (0-4) | Mevcut korunur |
| M6 | Bugün | Kaydet sonrası cümleler: ilk gün, normal (kalan 1/2/3), eşik doldu, fazladan gün, güncellendi, dün | 8-10 varyant, ardışık tekrar yok, seviye sızdırmaz |
| M7 | Bugün | Kayıt hatası | Çare içerir |
| M8 | Bugün | Dönüş satırı ("temiz sayfa") | Gün sayısı yok |
| M9 | Bugün | K3 banner | 1 cümle, tehdit yok |
| M10 | Hafta | Başlık durumları: 0 gün / eşik yok / eşik var / hazır / açıldı | "lazım" yok |
| M11 | Hafta | Yuva alt yazıları: sıradaki, Pazar 20:00, bugünü işaretle, bekliyor, tekrar gör | Sebep söyler |
| M12 | Hafta | Geçen hafta banner | Suçluluk yok |
| M13 | Albüm | Sayaç cümlesi (1 / n kart), boş durum, hata, "Bekliyor" | Rekor/kıyas dili yok |
| M14 | Kart | "Albüme yapıştırıldı · No. n", milestone cümleleri (1/4/10/26) | Sürpriz, hedef gibi değil |
| M15 | Seçici | Satır durumları, "Unvan güncellendi", "Gizlediğin metin dosyaya girmez", hata | Güven cümlesi |
| M16 | Ayarlar | İzin kapalı (canAskAgain true/false), saat çipleri kapalı sebebi, "Kart hazır olunca haber ver" | Çare + sebep |
| M17 | Ayarlar | Silme onayı (kapsam sayılı), "Tüm veriler silindi." | Geri alınamaz, dramatik değil |
| M18 | Ayarlar | Gizlilik ve veriler sayfası | Hukuki görüş değil; privacy-compliance-analyst ile |
| M19 | Bildirim | "Kart hazır", günlük havuz, (opsiyonel) geçen hafta, "1 saat sonra" eylem etiketi | Veri yok, "karne" yok |
| M20 | Kart içeriği | "bu hafta" zamansızlaştırma, "HAFTANIN UNVANI" bantı | V5 ile |
| M21 | Seviye kelimeleri | Uyku kısa/orta/uzun, sosyal sakin/orta/kalabalık (02 T5) | Yargı yok; emoji kutusu içi etiket |

---

## 4. Yeni özellik önerileri (UX)

Etki (Y/O/D) ve efor (S ≤1 gün, M 2-4, L >4; solo, K0). Gizlilik: yerel-only, ağ yok, kartta ham sayı/tarih yok korunur. "Intent" sütunu: yeni kapsamsa taslak; dosya açılmadı.

| # | Özellik | Etki | Efor | Gizlilik uyumu | Intent |
|---|---|---|---|---|---|
| F1 | **Kart albümü + kırılmaz sayaç** (bölüm 2.2; 13 V6/I-1'in C sürümü) | Y | M | Uyumlu; sayaç PNG'de yok | Evet |
| F2 | **Paylaşım seçici v2** (canlı önizleme, 5 satır, "Hepsini göster", biçim) | Y | M | Uyumlu; gizleme kuralları aynı | Evet (I-2 ile) |
| F3 | **Kare (1:1) biçim** ve isteğe "yalnız unvan çıkartması" biçimi | O | M | Uyumlu; her biçimde aynı gizleme + QA yüzeyi ikiye katlanır | Evet |
| F4 | **Bildirimde "1 saat sonra" eylemi** + "Kart hazır" için ayrı anahtar | O-Y | M (bildirim kategorileri) | Uyumlu; veri yok | Kısmen |
| F5 | **Gün noktalarından gün özeti** (noktaya dokun → o günün 4 emojisi, yalnız kendi girdin; dün/bugün düzenlenebilir) | O | S-M | Uyumlu; kart içeriğini önceden vermez (emoji girdisi, unvan/satır değil) | Hayır (plan sapması) |
| F6 | **Kart görüntüleyicide yatay geçiş + "Yeniden yapıştır"** (reveal'ı tekrar oynat) | D-O | S | Uyumlu | Hayır |
| F7 | **Taşınabilir yedek dosyası** (dışa/içe aktar, kullanıcı elle taşır) | O-Y | M-L | Dosya cihazdan yalnız kullanıcı eylemiyle çıkar; `allowBackup:false` kararıyla tutarlı ama tarih/içerik taşır: security + privacy incelemesi | Evet |
| F8 | **"Dün hâlâ açık" tek satırı** (sabah Bugün'de, dün boşsa; kapatılabilir, günde 1) | D-O | S | Uyumlu | Hayır; **etik riski var** (suçluluk), test şart |
| F9 | **Dokunsal geri bildirim + hareket tercihi** ayarı (sistem tercihine saygı; uygulama içi anahtar) | D | S | Uyumlu | Hayır (haptik bağımlılık K-7) |
| F10 | **"Verilerim" ekranı** (neler saklanıyor: X gün, Y kart; tek tek kart silme; uygulama içi gizlilik metni) | O-Y | S-M | Güveni artırır; KVKK metni hukuki görüş değil | Kısmen |

**Taslak intent'ler (3-5 cümle):**

**F1 `kart-albumu`.** Kullanıcı 4. haftada biriktirdiği kartları göremiyor; veri cihazda dondurulmuş ama gösterilmiyor. Hafta ekranında "Bu hafta | Albüm" segmentiyle çıkartma albümü: dondurulmuş kartlar unvan çıkartması olarak, uygun-açılmamış haftalar "Bekliyor" yuvası olarak, tek "sıradaki" yuva. Sayaç yalnız artar; boşluk, rekor, nadirlik, eksik yuva ve bildirim yok; sayı PNG'ye girmez. Başarı: kartı ≥2 olanların ≥%40'ı albümü açar.

**F2 `paylasim-secici`.** Paylaşım bugün üç adım, önizleme liste ve unvan çoğu hafta gizli. Tek seçici: canlı küçük kart, unvan + 4 kategori için 48 dp metinli anahtar, "Hepsini göster/Varsayılana dön", opsiyonel biçim. Uyku+harcama varsayılan gizli kalır; gizlenen metin dosyaya girmez; seçimler kalıcı değildir. Başarı: paylaşım oranı (E1) ve `line_hidden` ortalaması.

**F3 `paylasim-bicimleri`.** Türkiye'de paylaşım WhatsApp Durum ve sohbet ağırlıklı olabilir (15 §2.15, K0-İ); dikey kart sohbet önizlemesinde yalnız unvan okunur. Kare (1:1) biçim ve yalnız-unvan çıkartması, aynı gizleme ve güvenli alan kurallarıyla. Başarı: hedef başına (K5) kırpılma yok; kare biçimin seçilme oranı.

**F4 `bildirim-eylemi`.** Bildirim uygunsuz anda gelince kullanıcı kapatıp unutuyor (varsayım). Günlük bildirime tek "1 saat sonra" eylemi (bir kez; yeniden ertelenmez), Ayarlar'da "Kart hazır olunca haber ver" ayrı anahtarı. Veri içermez, sıklık artmaz. Başarı: hatırlatmadan sonra aynı gün dolu oranı.

**F7 `tasinabilir-yedek`.** Onboarding "Telefon değişirse veri taşınmaz" diyor; albüm birikimi arttıkça kayıp maliyeti büyüyor. Ayarlar'da kullanıcı tetikli dışa aktar (tek dosya, sistem paylaşım sayfası) ve içe aktar. Hesap/sunucu yok; dosya kullanıcının eline geçer, içerik ve tarih taşıdığı için uyarı ve onay şart. Başarı: kaybedilen veri şikâyeti azalır (denemede sorulur).

**F10 `verilerim`.** Gizlilik sözü şu an yalnız metinle veriliyor ve politika bağlantısı "yakında". Ayarlar'da "Gizlilik ve veriler" sayfası: neler saklanıyor, neler cihazdan çıkmıyor, kayıt/kart sayısı, tek kart silme. Ağ gerektirmez. Başarı: onboarding gizlilik ekranını geçenlerin Ayarlar'dan bu sayfaya girme oranı (ölçülmez; niteliksel geri bildirim).

*Reddedilenler (etik/kapsam):* gün serisi, "en iyi hafta" rekoru, unvan nadirliği, eksik yuva ızgarası, albüm için bildirim, kart sayacının kartta görünmesi.

---

## 5. 11-erisilebilirlik.md bulgularının UX'e etkisi

| Bulgu | UX kararı |
|---|---|
| A11Y-01 Geri durum çubuğunda (bir sınıf: YB-1, YB2-01) | **Tek `ScreenScaffold` kuralı:** her ekranda üst çubuk `top >= inset`, Geri/Kapat 48x48, başlık ortada. Albüm/kart/seçici/onboarding dahil. Ekran başına test "üst kontrol bounds.top >= inset" (tech-lead: aynı hata sınıfı 3. kez) |
| A11Y-02 Göster/Gizle 25x24 | Seçici satırları 48 dp metinli anahtar (2.8); önizleme dokunuşu yalnız bonus |
| A11Y-03 Anahtar etiketsiz/46x27 | Satırın tamamı dokunma alanı + `accessibilityLabel`; Ayarlar v2'de her anahtar için |
| A11Y-04 Azaltılmış hareket | Her mikro-etkileşimin tanımlı tek 150 ms opaklık varyantı (3.4); reveal, ÖRNEK kart, nabız, sarsma |
| A11Y-05 Silme kontrastı | Onay sayfasında koyu kırmızı ≥4.5:1, "Vazgeç" varsayılan odak |
| A11Y-06 2.0'da kesik | Kesme yok: seçici satırları sarar; önizleme kartı sabit, `accessibilityLabel` metnin tamamı |
| A11Y-07 Kaydet duyurusu | Mikro-an cümlesi `announceForAccessibility` ile aynı metni okur |
| A11Y-08 Ara ekran Geri 29x24 | Ara ekran kalkıyor (banner) |
| A11Y-09 Sekme 2.0 | Sekme etiketi `maxFontSizeMultiplier` 1,3; ikon adı "📝" okunmaz |
| A11Y-10, -15 Çare içermeyen metinler, İngilizce Alert | Tek uygulama içi onay/bilgi sayfası bileşeni; izin metinleri çare + sebep içerir |
| A11Y-12 Kilitli kutu çift okuma | Yuva tek etiket: "Bu haftanın çıkartması, kilitli. Pazar 20:00'de açılır." |
| A11Y-13 Kart etiketi | Kart ve albüm hücresi tek birleşik etiket; emoji gizli |
| A11Y-14 360x640 | Kaydırma ipucu (alt kenar solma), Kaydet/ipucu sabit |
| A11Y-16 Koyu mod | v1 açık tema (B14); C zemini tema-bağımsız |
| Emoji kutusu kelimesi | Kutu içi seviye kelimesi (1.2-2) hem tanınırlığı hem ekran okuyucuyu güçlendirir |

---

## 6. Bağımlılıklar, devir ve çelişkiler

**Devir**
- `visual-designer`: C kabuğu (Bugün/Hafta/Albüm/seçici/Ayarlar) çizilmeli (yok); konum çizgisi; albüm hücresi; "yetişkin C" kuralları (2.9); güvenli alan; "KARNESİ" temizliği; kategori tonu paleti.
- `copywriter`: M1-M21 (3.5); içerik zamansızlaştırma; uyku/sosyal seviye kelimeleri.
- `engagement-designer`: Kaydet cümle havuzu, milestone, albüm etik denetimi (2.2 listesi), F8 etik testi.
- `accessibility-auditor`: bölüm 5 çift kontrol; ScreenScaffold testi.
- `mobile-platform-specialist` + `mobile-engineer`: bildirim yanıt yönlendirme (soğuk/sıcak), F4 bildirim eylemi, rota yığını sentezi.
- `software-architect` + `security-reviewer`: paylaşım unvanı mekanizması (K-2 a), F7, albüm sayaç şemasız türetme (`weekly_card` sayımı).
- `performance-engineer`: kart ekranı ilk açılış beyaz/spinner (YB2-08), font ön yükleme.
- `test-automation-engineer`: üç kırık yol regresyonu, dokunuş sayısı senaryoları.
- `product-owner`: F1-F10 ve intent açılışı; `privacy-compliance-analyst`: M18, F7, F10.

**Çelişkiler (sessizce gömülmedi)**
1. **13 K-3 (A yönü önerisi) vs Batuhan'ın C kararı:** 13'teki "mühür basılır reveal" ve zarf/mühür dili C'de "çıkartma yapışır + rozet damgalanır"a dönüşür. 13 V1 içeriği C için yeniden yazılmalı.
2. **13 K-4 ("karne" her yerde) vs Karar 5 ("Kart"):** Karar 5 geçerli; 13 K-6 örneği "12. karnen" → "12. kart".
3. **03 Ö1 (Kaydet sonrası otomatik Hafta'ya geçiş) vs bu belge:** geçiş önerilmiyor (2.5).
4. **`pazar-akisi.md` (ayrı ara ekran) vs bu belge:** banner; spec s.194 metnine daha yakın. Belge güncellenir.
5. **`ekran-akisi.md` Ekran 5 "unvan ayrı satır değil":** K-2 (a) ve seçicide "Unvan" satırı bunu değiştirir; belge güncellenir.
6. **`ekran-akisi.md` ~24 dp inset:** gerçek 52 dp; bütçe tabloları güncellenir.
7. **13 kapsam bütçesi "yeni ekran en fazla 1":** albüm 1 ekran; seçici mevcut önizleme ekranının yerini alır; K3 ara ekranı kalkar (net ekran sayısı azalır).
8. **`docs/ux/kart-yerlesimi.md` "kategori başına renk yok":** Karar 4 ile geçersiz; belge güncellenir.
9. **13 Z13 (kare v2) vs görev (seçicide biçim):** seçici tasarımı kare için hazır, kare kendisi Q5.

---

## 7. Batuhan'a kısa sorular

1. **Albüm girişi.** (a) Hafta içinde "Bu hafta | Albüm" segmenti **(öneri: yeni sekme yok, 13'le uyumlu)** · (b) 4. sekme "Albüm" (keşif kolay, +1 sekme).
2. **Seviye gösterimi.** (a) Konum çizgisi **(öneri)** · (b) Emoji rozeti boyutu · (c) Yalnız kelime. (Karar 6 "geliştirilsin" dediği için (c) düşük öncelik.)
3. **Pazar K3.** (a) Ayrı ara ekran yerine Bugün'de banner **(öneri)** · (b) mevcut ara ekran kalsın.
4. **Kaçırılan hafta.** (a) Yalnız uygulama içi yollar **(öneri)** · (b) + tek Pazartesi öğlen bildirimi (suçluluksuz, iptal edilebilir; "telafi yok" kuralı değişir).
5. **Kare biçim.** (a) İlk sürümde seçicide · (b) v2, seçici tek biçimle çıksın **(öneri: 13 RICE'ıyla uyumlu, tasarım hazır)**.
6. **"Kart hazır" bildirimi.** (a) Ayarlar'da ayrı anahtar **(öneri: kontrol/rıza boşluğu)** · (b) tek anahtar kalsın.
7. **Albüm hücresinde tarih aralığı** ("21-27 Eyl", yalnız uygulama içi). (a) göster **(öneri: geçmiş kartı bulmak için)** · (b) yalnız "No.".
8. **Kaydet sonrası CTA yuvası:** bekleyen geçen hafta kartı varsa düğme "Geçen haftanın kartını aç"a dönsün mü? (a) evet **(öneri)** · (b) yalnız Hafta'da banner.

---

## 8. Doğrulanamayanlar

- Hiçbir prototip tarayıcıda görülmedi, emülatöre bakılmadı; kart/ekran oranları HTML/CSS ve 09/11 raporlarından (K1/K4 ikinci el). C kabuğu hiç çizilmemiş; bütün C ekranları türetmedir.
- Bütün dokunuş sayıları ve süreler hesap (K1) ya da 09'un K4 gözlemleri; kronometre ölçümü yok (S6 açık madde).
- Story güvenli alanı (üst 250 / alt 340 px) birincil Meta belgesinden doğrulanmadı [İ]; cihazda ölçülmedi (KC6).
- Konum çizgisinin "yargı taşımadığı", ÖRNEK kartın "kendi kartı sanılmadığı", erken unvan göstermenin "merakı düşürmediği" iddiaları K0 hipotezdir; 5'er kişilik testle sınanmalı.
- `expo-haptics` ve bildirim eylemleri (F4) bu ortamda denenmedi; platform davranışı K4/K5 ister.
- "Kart hazır" bildirimi için ayrı kontrolün bulunmadığı iddiası kod okumasına ve 03'e dayanır (yalnız tek anahtar görüldü, K1).
- Albüm hücresi, seçici ve K3 banner bütçeleri hesaptır; uygulandığında `checkin-single-screen-fit` benzeri testlerle ve 411x914 + 360x640 emülatörde yeniden ölçülmeli.
- Kaydet hata durumu ve "Bugün aynı gün ikinci açılış" davranışı için mevcut uygulamada gerçek davranış gözlenmedi (K0).

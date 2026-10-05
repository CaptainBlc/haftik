# P0 görsel oturum + F0-9 Story ölçümü: kontrol listesi

> 2026-10-05. Kaynak protokol: `docs/inceleme-2026-09-25/23-buyume-ve-deneme.md` §2.2, `27-olcum-v2.md` §3.2,
> karar B12 (`docs/kararlar/2026-10-01-cekirdekten-once-kararlar.md`), F0-8/F0-9 (`29-yol-haritasi.md` §3).
> Bu belge o protokollerin tek sayfalık, uygulanabilir özetidir. **Eşikler öneridir, kimse onaylamadı** (23 §2.2).
> **Neden şimdi:** S19'un geri kalanı (`CardView` v2, ~4,5 günlük yatırım) bu sonuca bağlı. Kod yazmadan önce
> en ucuz kanıt bu oturum. Kodlamadan sonra düzeltmek daha pahalı.

## Tek bakışta

| | |
|---|---|
| Kim | 6 kişi, **deneme (E1) kohortunun dışından**, iPhone'lular dahil. Kod: P1..P6, ad tutulmaz |
| Süre | kişi başı ~20 dk, yüz yüze ya da görüntülü, tek oturum |
| Uygulama gerekir mi | Hayır, yalnız PNG'ler. Telefon: kendi telefonun |
| Çıktı | Aşağıdaki sonuç tablosu + 24 saat sonra davranış sütunu |
| Sonra | Sonucu bana ver; karar tablosuna göre S19'u sürdürürüz, olgunlaştırırız ya da durdururuz |

## A. Hazırlık (oturumdan önce)

- [ ] **6 kişiyi seç.** Profil: 18-35 yaş, Türkçe, haftada en az 1 WhatsApp Durum/Instagram Story paylaşan
  (öz-bildirim). Dağılım: 2 ağır paylaşan (haftada 3+), 2 ara sıra, 1-2 nadir/izleyen. Tasarımcı/geliştirici yok
  (yanlılık), aile büyüğü ve en yakın arkadaş yok ("nazik evet" yanlılığı). Android/iPhone karışık.
- [ ] **Sıra dengeleme:** 3 kişi Eski önce, 3 kişi C önce. (5 kişiyle tam denge olmaz, bu yüzden 6.)
- [x] **Görseller hazır (2026-10-05):** `C:/dev/haftik-artifacts/p0/gosterilecek/g1.png ... g6.png` (nötr adlar).
  Hangi dosyanın ne olduğu, sıra dengeleme ve farklar: `docs/p0-materyal/README.md`. Eski ve C **aynı içerikte**
  (unvan "Adım Çok, Fiş Yok", aynı satırlar/özet/emojiler), damga "haftik" (mağaza bağlantısı yok). ÖRNEK kart ve L1
  seviye karşılaştırması da dahil. Küçük önizleme için ayrı dosya yok: görseli WhatsApp'a resim olarak gönder.
- [ ] Kayıt tablosu hazır (kâğıt ya da yerel tablo, `docs/` dışında): sütunlar bölüm D'de.
- [ ] Ses kaydı yalnız kişi açıkça izin verirse; tutulmadan silinir. Bulut anket aracı yok, e-posta/ad yok.
- [ ] Katılımcıya baştan söyle: doğru/yanlış cevap yok, ürünü değil görseli test ediyoruz, istediği an bırakabilir.

## B. Oturum akışı (Batuhan sorar; açık uçlu önce, ad/uygulama bilgisi sonda)

Her görsel için (Eski-görünür, Eski-gizli, C-görünür, C-gizli), katılımcının sırasına göre:

1. **3 sn testi:** görseli 3 sn göster, kapat. "Ne gördün? Bu ne? Unvanı hatırlıyor musun?" → **unvanı doğru söyledi mi (E/H)**.
2. **Sohbet simülasyonu:** görsel WhatsApp'a "bir arkadaşın atmış gibi" düşer (küçük önizleme). Kayıt: ilk tepki ve
   sorduğu ilk soru ("bu ne?", "nereden?", "sen mi yaptın?").
3. **Paylaşım niyeti:** "Bunu kendi Durumuna/Hikayene koyar mıydın?" Evet/Belki/Hayır; hedef (Durum/Hikaye/grup/kişi/hiç).
4. **Engeller (çoktan seçmeli, birden fazla):** kimse ilgilenmez · kendimle ilgili şey ifşa ediyor · çocuksu · çirkin ·
   anlamadılar · unvan bana uymuyor · zaten bildiğim şey · uğraşmam.

Sonra (tüm görseller bittikten sonra):

5. **C riski:** "Bu kart hangi yaşa hitap ediyor?" (açık). "Yetişkin espri mi, çocuk oyunu mu?" (1-5). "İş arkadaşına atar mıydın?"
6. **Gizli hâl:** "Bu 'gizli çıkartma' sana ne düşündürdü?" (açık). "Bir şey mi saklıyor, şaka mı?" "Unvanlı ve gizli arasında hangisini atarsın?"
7. **Gizlilik:** "Bu kartı görünce kişi hakkında ne öğrenir?" (açık). "Veriyi uygulama nereye gönderir sence?"
8. **Seviye işareti (L1):** `seviye.html`'i göster. "Sağdaki daha mı iyi?" (E/H). "Orta en iyisi mi?" (E/H).
   (Puan gibi okunuyor mu? Cevap "evet" çıkarsa yalnız kelime kalır.)
9. **ÖRNEK kart:** "Bu kart kime ait sence?" Kayıt: **kendi kartı sandı mı** (E/H). Paylaşılabilir sandı mı?
10. **Ad ve arama:** "Buna ne derdin: kart / karne / albüm / ne?" (önce açık, sonra seçenek). "Play'de bunu bulmak için ne yazardın?"
11. **24 saat davranışı (son soru):** "İstersen beğendiğini Durumuna koy, koyarsan ekran görüntüsünü at. Koymak zorunda değilsin."
    24 saat sonra bak: **gerçekten koydu mu**. Niyet ile davranış farkını gören tek ucuz yol; n=6'da yalnız yönsel.

## C. Karar tablosu (öneri; ölçütler 23 §2.2 ve 27 §3.2 ile hizalı)

| Ölçü | Geçer | Olmazsa |
|---|---|---|
| **M1** unvanı doğru okur (3 sn, C-görünür) | ≥ 4/5 (6 kişide ≥ 5/6'ya yakın) | unvan boyutu/kontrast, öğe sayısı azaltılır |
| **M2** "koyarım": C-görünür, Eski-görünür'den iyi | C ≥ 3/5 **ve** eskiden en az +1. Kill: C'yi seçen ≤ 1/6. "Geç": ≥ 4/6 | görsel yatırım durur, değer katmanına dönülür (15 KC1) |
| **M3** "çocuk oyunu" (4-5 ya da açık uçta "çocuksu") | ≤ 1/6 | 2/6 uyarı: olgunlaştırma turu. ≥ 3/6: olgunlaştırma varyantı + 3 kişiyle tekrar. **C seçimi sorgulanmaz** |
| **M4** gerçekten koydu (24 saat, C) | ≥ 1/6 | 0/6 iken M2 geçtiyse: niyet abartısı, E1 beklentisi düşer |
| **M5** unvanlıyı seçen (unvanlı vs gizli) | ≥ 4/6 | gizliyi eşit seçen ≥ 3/6 ise "gizli çıkartma" esprisi işliyor |
| **M6** en sık engel "kimse ilgilenmez / ifşa" | tek engel ≥ 3/6 ise | o engele göre içerik/gizlilik önceliği |
| **L1** "sağdaki daha mı iyi?" ve "orta en iyisi mi?" | ikisinde de ≤ 1/6 evet | geçmezse yalnız kelime kalır (B2) |
| **ÖRNEK** kendi kartı sanan | 0/6 (ya da ≤ 1/6, "ÖRNEK" şeridi güçlendirilir) | onboarding örneği yeniden çizilir |

Tek başına 3/5 anlamsız (fark yokken bile %50 olasılıkla çıkar); 5/5 aynı yönde p=0,031, 4/5 p=0,19. Bu yüzden
"kill" koşulu ve "geç" koşulu ayrı okunur, ortası "olgunlaştır ve tekrar sına".

## D. Kayıt tablosu (kişi başı bir satır)

| Sütun | Değer |
|---|---|
| P-kodu, platform (Android/iPhone), paylaşım sıklığı bandı (ağır/ara sıra/nadir) | |
| Görsel sırası (Eski önce / C önce) | |
| 3 sn: unvanı doğru söyledi (E/H) · Eski-görünür / C-görünür | |
| İlk soru (sohbet simülasyonu) | |
| Koyar mıydın (E/B/H) · Eski-görünür / Eski-gizli / C-görünür / C-gizli | |
| Seçilen engeller | |
| Yaş / çocuk-yetişkin (1-5) / iş arkadaşına atar mıydı | |
| Gizli hâl: ne düşündürdü / şaka mı saklama mı / unvanlı mı gizli mi | |
| Gizlilik: ne öğrenir / nereye gider sanıyor | |
| L1: sağdaki daha mı iyi (E/H) · orta en iyisi mi (E/H) | |
| ÖRNEK: kime ait (kendi kartı sandı E/H) | |
| Ad: açık cevap / seçenek / Play'de arama ifadesi | |
| 24 saat sonra gerçekten koydu mu (E/H) | |

## E. F0-9: Story/Durum bant ölçümü (10 dk, yalnız sen, kendi telefonunda)

Soru: Story/Durum editörü kartın hangi kısmını kapatıyor? (S19'un yerleşimini ve unvanın güvenli banda alınıp
alınmayacağını belirler, B4.)

- [ ] `kart-v2.html`'den **1080x1920** kart PNG'sini telefonuna al.
- [ ] **Instagram Hikâye** editörüne koy, **yayınlama**. Ekran görüntüsü al (üstteki profil/ilerleme çubuğu ve alttaki
  mesaj/CTA alanıyla birlikte).
- [ ] **WhatsApp Durum** editörüne koy, **yayınlama**. Ekran görüntüsü al (alttaki başlık/gönder alanı dahil).
- [ ] Her ekran görüntüsünde not al: üstten kaç piksel, alttan kaç piksel kapanıyor? Unvan, satırlar, özet,
  mühür, wordmark hangileri kapanıyor?
- [ ] Varsayım (ikincil kaynak, doğrulanacak): üst ~250, alt ~340 px (@1080). Ölçüm farklıysa bana ver.
- [ ] Karar: unvan ve satırlar güvenli bantta kalıyorsa mühür + wordmark yeter. Marka kapanıyorsa wordmark güvenli banda taşınır.

## F. Oturumdan sonra bana getir

- [ ] Doldurulmuş kayıt tablosu (kişisel not değil, kod + cevaplar yeterli).
- [ ] F0-9 ekran görüntüleri ve kapanan piksel notları.
- [ ] Senin kararın: **S19'a devam** / **olgunlaştırma turu** / **durdur** (karar tablosuna göre). Yazılı olarak
  `docs/kararlar/` altına işlerim.
- [ ] Ayrıca onay: `__tests__/card/layout.test.ts` değişikliği (v2 yerleşim için, ayrı etiketli test değişikliği görevi).

## Kapsam dışı

- Gerçek paylaşım oranı (E1) ve D7: Play kapalı test kohortunda ölçülür, bu oturum onların havuzunu tüketmez.
- Bu oturum HTML prototipin Chrome görüntüsünü ölçer, React Native derlemesini değil (döndürme, font, gölge farkı
  çıkabilir). Uygulama sürümü çıkınca 3 kişilik kısa tekrar var (P1 sonrası, M1-M3 yeniden).

# 29 — Tek yol haritası: Haftik v1.1 → v1.5 (project-coordinator, 2026-09-29)

> Durum: **öneri belgesi, Batuhan'a sunulacak.** Kod, `assets/`, `app.json`, testler, emülatör değişmedi; commit yok.
> Kararlar Batuhan'ındır; bu belge çelişkileri görünür kılar, bir öneri koyar ve tek bir iş sırası çıkarır.
> Kanıt dili K0-K5 (`~/.claude/team/ortak-standartlar.md`). Efor sayıları **K0** (tahmin), 21'in kalibrasyonuna dayanır.
> Kaynaklar: `01`-`28` ve `14-gorsel-prototipler/` (v1, v2). 16'daki kararlar yeniden açılmadı.

## 0. Özet

1. **Tek sıra:** Faz 0 (Batuhan eylemleri, 1-2 gün) → **Taban** 0.1.0 (S13-S18, ~14 gün) → **Çekirdek** 0.2.0
   (S19-S23, ~13,75 gün) → **Arkadaş denemesi** (APK, E1 ölçümü) → **İkinci yapı** 0.3.0 (S24-S25, ~7 gün) → Play 0.9.0 → 1.0.0.
2. **Efor:** 21'in dilim tablosuna öteki raporların getirdiği işler eklendi:
   - yeni S17 platform yapılandırması,
   - bildirim kanalları,
   - 6 Önemli erişilebilirlik bulgusu,
   - güvenli silme,
   - rapor v2.

   Sonuç: **medyan ~36 odaklı iş günü (kabaca 30-45, K0); denemeye kadar ~29** (21: ~24). Denemeyi ~24 güne çekmek
   için kesme sırası bölüm 3e'de.
3. **34 çelişki** tabloya döküldü (bölüm 2). 12'si kapandı ya da ekip içinde çözülüyor. 22'si Batuhan'a gidiyor, bunların
   11'i "önerimi uygula" türünden.
4. **Brifte "aynı fikirde" sanılan iki konu:**
   (a) **v3 migration'da gerçek bir çelişki var.** 21, CHECK'li tabloyu yeniden kurmayı öneriyor; 27 ise CHECK'siz yeni
   bir `metric_counter` tablosu. 28'in "v1.x'te yalnız ekleme" kuralı ile 26'nın geri alma kuralı 27'yi destekliyor (Ç15).
   (b) **WAKE_LOCK'ta sanıldığı gibi çelişki yok.** 24 aslında "engellenmemeli" diyor, 22 ile aynı sonuca varıyor (Ç3).
5. **En sonuçlu çelişki: E1 kohortu APK'da mı ölçülecek, Play'de mi?** Öneri **APK arkadaş kohortu** (Ç9).
   - E1'i Play'e bağlamak onu dört kapının arkasına kilitler: K10 hukuki görüşü, politika URL'si, Play hesabı ve inceleme.
   - 06 §8'deki geçici K10 kararı yalnız yakın çevre ve APK için geçerli.
   - 27'nin hesabına göre n=12 Play kohortu E1'i zaten doğrulayamaz.
6. **Açık gizlilik riski:** 21, unvanın ve özetin gizli kategoriyi **çıkarımla** sızdırdığını buldu. 24 bunu
   değerlendirmedi (iki rapor paralel yazıldı). Bu yüzden S21'e girmeden önce security-reviewer turu şart.
7. **Karar listesi:** ikinci dalgadaki **129 soru, 52 karara** indi (23'ü "önerimi uygula", 29'u onay şart). Taban
   başlamadan cevaplanması gereken 18 karar var; bunların 7'si tek onayla geçebilir.
8. **İlk iş paketi: S13 "Hijyen ve zemin"** (ürün kararı gerektirmez, ~1-1,5 gün). Önkoşulu Batuhan'ın commit'i ve
   repoyu taşıması. Kritik-1'in karar bekleyen düzeltmesi (A8), aynı gün ikinci worktree'de başlayabilir.
9. **Kapılar:**
   - ASCII yola taşıma her işi bekletir.
   - EAS hesabı 0.1.0'ı bekletir.
   - K10, politika URL'si ve Play hesabı **yalnız Play yolunu** bekletir, APK denemesini bekletmez.
   - Play hesabının 13 Kasım 2023'ten önce açılmış olması 12 testçi / 14 gün şartını kaldırır; takvim 2-3 hafta oynar.
10. **Erken kanıt:** cihaz ya da kişi gerektiren işler en başa alındı.
    - Birleşik 6 kişilik görsel oturum (P0).
    - Kendi telefonunda Story/Durum bandı ölçümü (10 dakika).
    - Emülatörde ağ referans ölçümü.
    - 0.1.0 ile Batuhan'ın telefonunda bir haftalık kullanım.

---

## 1. Kaynaklar ve yöntem

- **Okunanlar (tamamı):** 01-12 (ilk dalga), 13, 15, 16, 17-28 (ikinci dalga), 14 README ve v2 prototip listesi.
- **Omurga:** dilim iskeleti ve efor 21 §1, §3'ten; sürüm haritası ve kapılar 26 §2'den; mühendislik kuralları ve faz
  kapıları 28'den geliyor. Öteki raporlar bu omurganın üstüne eklendi. Her dilim satırında kaynak rapor numarası yazılı.
- **Çelişki çözme ilkesi:**
  - Ölçüm, çıkarımı yener.
  - Alanın sahibi yener. Görsel kararda visual-designer, platform gerçeğinde mobile-platform-specialist, mühendislik
    kuralında tech-lead.
  - Geri dönüşsüz kapıda daha muhafazakâr seçenek kazanır.
  - Kapsam genişletmede "ertele" kazanır.
  - Bu ilkelerle karar çıkmıyorsa konu Batuhan'a gider.
- **Bu belge karar vermez:** "Öneri" sütunu koordinatör önerisidir. "B-O" işaretli maddeler Batuhan'ın onayını ister.

## 2. Çelişki matrisi ve öneriler

Sahip kodları:
- **K**: kapandı (kanıt ya da önceki bir karar çözüyor).
- **E**: ekip içinde çözülür (sahip ajan yazılı).
- **B-Ö**: Batuhan'a gider; düşük riskli ve geri alınabilir, "önerimi uygula, sonra göster" uygun.
- **B-O**: Batuhan'ın onayı şart (geri dönüşsüz, kamuya açık söz, spec anlamı, hesap ya da harcama).

| # | Konu | Taraf A | Taraf B | Öneri ve gerekçe | Sahip |
|---|---|---|---|---|---|
| Ç1 | Kart fontu | 21 §2b, 22 F-5, 23: Baloo 2 | 17 §2.5: Fraunces 800/600i + Inter | **Fraunces + Inter**; Batuhan v2 prototipini onayladı. Inter ağırlıklarında da ayrışma var (21: 400/700 kalsın; 17: 500/700/800, 400 ve 400i çıksın): 17 uygulanır, boyut farkı `expo export` ile ölçülür | K (teyit: B3) |
| Ç2 | Koyu tema v1'de olsun mu | 17 koyu tema prototipini çizdi; 21 Y3 koyu temayı v2'ye koyuyor | 13 T6, 17 S3, 18 §2.9-7, 22 S8, 08 TB-21: v1.1 açık temaya kilitlensin | Gerçek bir çelişki yok. Öneri: `userInterfaceStyle: light`, token'lar koyu sütunuyla yazılsın; (b) seçeneği sonra S boyutunda bir iş olur. Android 16'nın genişletilmiş koyu teması K4'te denenir (22 §5.2) | B-Ö (A11) |
| Ç3 | WAKE_LOCK | Brifte "24 engelle" yazıyor, ama 24 M2 "**engellenmemeli**" diyor | 22 §1.6: kaldırılabilir, yine de ilk build'de kalsın | İki rapor da aynı sonuca varıyor: ilk build'de kalır. Kaldırmak ayrı bir adım olur, ancak Doze ve R-21/R-22 testleri geçerse | K |
| Ç4 | Rozet izni sayısı | 24: 17 · 05: 13 (debug) · 12/25: ~12 | 22: **16** (release APK, `aapt2`) | **16** esas alınır (K4-rel ölçümü). Kural: liste elle sayılmaz, `aapt2` çıktısından "altın liste" dosyası olarak üretilir | K |
| Ç5 | Firebase bileşenlerini manifestten silmek | 05 M-02: getirisi düşük | 24 S-2: sil | 22 §1.6'daki koşullu kural: release'ten INTERNET kalkarsa silmek v2'de yapılacak bir hijyen işi olur; kalkmazsa 24 M4 uygulanır | B-O (A16 içinde) |
| Ç6 | INTERNET izninin sırası | 07 §4.1, 25 S-1, 06: önce ölç, sonra karar ver | 24 S-1: engelle + bir kez ölç. 22 S1: release manifest plugin'i (C) | **Birleşik sıra:** (1) yerel release APK'da emülatörde referans ölçüm (22 §1.4; EAS kotası harcamaz), (2) C, (3) `aapt2` altın liste, (4) 0.1.0 ile cihazda PCAPdroid (K5). "Önce ölç" korunur ve 24'ün kaygılandığı ikinci EAS build'ine gerek kalmaz | B-O (A16) |
| Ç7 | Story güvenli bant | 18 §2.8, 23 §1.4, 15: üst 250 / alt 340 px (mantıksal 83-527) | 22 §1.6: Meta'nın birleşik önerisi üst 270 / alt 670 px (reklam CTA'sı dahil), kesişim olarak 270-1500 px | Brifte "05 vs 18" yazıyor ama 05 sayı vermiyor; asıl karşı taraf 22. 17'nin yerleşiminde özet balonu 1416-1596 px'e iniyor ve 22'nin bandını aşıyor. **Öneri:** unvan ve marka 22'nin muhafazakâr bandında dursun. Özetin yeri Batuhan'ın telefonunda yapılacak 10 dakikalık K5 ölçümüyle (F0-9) belirlensin | E (visual-designer) + F0-9 |
| Ç8 | Kritik-1'in düzeltme biçimi | 04 #1, 13 T1: eşikte haftanın kendi kartı sayılmasın (A, tek satır) | 21 §2f: eşik check-in geçmişinden türesin (B) | **B.** A, "kullanıcı eylemi bir haftayı yeniden kilitler" sınıfını kapatmıyor (21 §2f'deki iki haftalık senaryo). Monotonluk özellik testi iki seçenekte de şart. Spec'teki "ilk kart" tanımı değişir | B-O (A8) |
| Ç9 | E1 kohortu: APK mı, Play mi | 07 §3.5, 23 Q2: APK yalnız 3-5 kişilik smoke olsun, E1 Play'de ölçülsün | 26 S5: Batuhan'ın sırası geniş APK (b) ya da Play internal (c). 27 §3.1: dönemler arkadaş çevresinde; Play ayrı kohort ve n=12 E1'i doğrulayamaz. 06 §8: K10 geçici kararı yalnız APK ve yakın çevre için geçerli | **E1 = APK arkadaş kohortu** (15-25 kişi; S1 smoke'u 3-5 kişiyle ayrı ve önce). Play kapalı testi ayrı bir kayıt olur. APK'dan Play'e geçen testçi, veri kaybını bilerek onaylar. Gerekçe: E1'i Play'e bağlamak onu K10 hukuki görüşü, politika URL'si, Play hesabı ve incelemenin arkasına kilitler (3-6 hafta). İkinci yapı APK'dan APK'ya güncelleme olarak sorunsuz dağıtılır. İstisna: 13 Kasım 2023 öncesi bir Play hesabı varsa **ve** K10 hızlı çözülürse (c) yeniden değerlendirilir | B-O (C1) |
| Ç10 | "Karne/Kart" adlandırma geçişinin kapsamı | 13 K-4: "karne" her yerde (16'dan önce yazıldı). 28 S-8 (b): mizah bağlamlarında izin listesi olsun | 16 karar 5; 19 Q1, 25 S-12, 23 Q7: her yerde "Kart" | Kullanıcıya dönük **her yüzeyde "Kart"**: `src/`, `site/`, mağaza metni, bildirim, prototip bandı. R-12 bekçisinin izin listesi boş başlar. Mizah istisnasını copywriter önerir, Batuhan tek tek onaylar. Tarihsel belgelere dokunulmaz (19 §2.5) | B-Ö (A15) |
| Ç11 | Arşiv ekranının adı | 13: Karnelerim · 26: Kartlarım · 23: Albümüm | 17, 18, 19, 20: Albüm | **"Albüm"**: C metaforuyla ve "Kart" kararıyla uyumlu | B-O (D1) |
| Ç12 | Albümün giriş yeri | 18 §2.1 alternatifi: 4. sekme. Ayrıca 19 §3.7'nin A11Y-09 etiket listesinde "Albüm" bir sekme olarak geçiyor (19'un kendi içinde tutarsızlık) | 13 §5.3, 18 Q1, 20 Q8: Hafta ekranında "Bu hafta \| Albüm" segmenti | **Segment.** Gerekçe: 13'ün kapsam bütçesinde "yeni sekme yok" kuralı var. 19'daki etiket listesi düzeltilir | B-O (D1) |
| Ç13 | Seviye gösterimi | 17 §2.4: L1 konum işareti (40x12, 12 px düğme). Alternatifler: L2 katman, L3 boy | 18 §2.3: konum çizgisi (56x10, 14 dp). Aynı fikir, farklı ölçü | **L1 + kelime birincil**; ölçüleri 17 belirler (görsel sahip). P0'da "sağdaki daha mı iyi?" sorusuna ≤ 1/5 evet çıkmazsa yalnız kelime kalır. Domain değişmez (21 §2e) | B-Ö (B2) |
| Ç14 | "Vites" imgesi | 19 §5.1: unvan önerisi ("Bir Vites Yukarı") ve bildirim varyantı ("Bugün hangi vitesteydin?"); 13 V5 örneği | 19 §4.4: yeni özet kovaları; kotası 2 | Vites **özet kovalarında** (risingBig/fallingBig) kalsın. Unvan önerisi ve bildirim varyantı başka imgeye geçsin. Gerekçe: özet her kartta görünür ve kategori-nötr; imge en çok orada iş görür | B-Ö (A15) |
| Ç15 | `metric_event` CHECK kısıtının çözümü (v3) | 21 §2a, S-9 (a): tabloyu genişletilmiş CHECK listesiyle yeniden kur (DROP + RENAME) | 27 §2.3: yeni `metric_counter` tablosu; DB'de CHECK yok, UPSERT sayaç, `at` sütunu yok | **Brifin varsayımının aksine iki rapor aynı fikirde değil.** Ortak noktaları yalnızca "T7'den sonra v3". 28 §4.6 kural 3 (v1.x'te yalnız ekleme, DROP/RENAME ayrı karar) ve 26 §2.4 (eski ikili yeni şemayı açabilmeli) 27'yi destekliyor. **Öneri:** v3 = `CREATE TABLE metric_counter` + eski satırlar GROUP BY ile kopyalanır; `metric_event`'e yazım durur ama tablo **düşürülmez** (silme kapsamında kalır). Ad kümesi TS tipiyle ve sözleşme testiyle korunur. Spec S9'daki "CHECK" ifadesi değişir; 21 buna göre güncellenir | B-O (A10) |
| Ç16 | Migration numaraları | 13 V2, 25, 26 §2.2: paylaşım unvanı = v3 | 21: v3 = ölçüm (tabanda), v4 = paylaşım unvanı (çekirdekte) | **21'in numaralandırması.** 26'nın sürüm haritasındaki şema sütunu düzeltilir: 0.1.0 = v3, 0.2.0 = v4, 0.3.0 şema değişikliği yok | K |
| Ç17 | Albüm numarası | 20 Q3: kalıcı `album_seq` alanı | 18 §2.2: "dondurulmuş kart sırası". 21 §2c: şema değişikliği yok | **Türetilir** (`ORDER BY generated_at`), yeni sütun eklenmez. Gerekçe: her yeni kalıcı iz, silme, D2D ve politika yükü getirir (25 R-1) | E (architect) |
| Ç18 | Kilometre taşı numaraları | 17 G2, 18, 23: 1-4-10-26 · 19: +52 | 20: 1-4-13-26-52, "cilt" kavramıyla birlikte | Cilt kavramını yalnız 20 öneriyor → v1.5'e girmez. Taşlar **1, 4, 10, 26** (52 sonra eklenir); yalnız uygulama içinde bir satır olarak, PNG'de değil | B-Ö (D1) |
| Ç19 | "Sayfa" sözcüğü | 20: kullanıcı metninde geçmesin | 19 §3.2, §3.4: Kaydet ve Hafta metinlerinde yoğun kullanılıyor | 19'un kotasıyla (varyantların yarısından azında) **izinli**; tek anlamı "sayfa = hafta" | B-Ö (A15) |
| Ç20 | Eşiğin dolduğu andaki metin | 20 §3.1: "Kartın hazırlanıyor." | 19 §3.2, 02 §4.2: "hazırlanıyor" yanıltıcı | **19 kazanır** ("Yeterli gün doldu. Kart Pazar 20:00'de açılıyor.") | E (copywriter) |
| Ç21 | Kaydet mikro-anının görseli | 20 F3: "günün çıkartması" (7 sabit şekil) yapışır | 17 §2.8, 18 §2.5: bugünün noktası dolar | **17/18.** Bütçeye +0 dp, yeni varlık yok. 7 şekil v2 cilası olarak kalır | E (visual + engagement) |
| Ç22 | Bildirim izninin ne zaman isteneceği | 20 Q6: ilk Kaydet'ten sonra | Bugün onboarding'de. 18 §2.4: onboarding'e saat çipleri eklensin. 22 §4.2: nerede istenirse istensin ön-soru deseni şart | **v1.5'te onboarding'de kalsın**, 22'nin ön-soru deseni ve 18'in saat çipleri eklensin. Taşımanın etkisi n=20-30'da ölçülemez (27: ±19 puan) | B-Ö (B7) |
| Ç23 | Bildirim kanalları ve ses | 20 §3.4: sessiz kanal; F12 üç durumlu seçici | 22 S4: iki kanal, DEFAULT önem, sesli. 18 Q6: Ayarlar'da ayrı "Kart hazır" anahtarı | **İki kanal** (`daily`, `card-ready`), DEFAULT önem. Ayarlar'daki iki anahtar kanal modeliyle bire bir eşleşir; 20'nin üç durumlu seçicisi bunun üstüne gereksiz kalır. **Ses** kararı tek yönlü kapı (0.2.0'dan önce) | B-O (A12) |
| Ç24 | Pazar günü çift bildirim | 04 #11, 20 Q5, 22 §4.1: kartın açıldığı Pazar `daily` + `card-ready` ikisi de planlanıyor, ters sırada da gelebilir | Karşı görüş yok | Kart planlanan Pazar'da `daily` üretilmez. Spec S8 #5 değişir | B-Ö (A13) |
| Ç25 | Pazar K3 akışı | `pazar-akisi.md`: ayrı ara ekran. 19 §3.4 ve 20 ara ekran için metin yazıyor | 18 Q3: Bugün ekranında 56 dp banner | **Banner.** Spec s.194'e daha yakın, bir ekran eksilir, A11Y-08 kendiliğinden kalkar. 19'un gövde metni banner'a taşınır | B-Ö (B6) |
| Ç26 | Kare / ek paylaşım biçimi | 17 S7: G4 (kare) çekirdekte. 23 Q4: 9:16 + "yalnız unvan çıkartması" | 13 Z13, 18 Q5, 21 Y4, 22 S6: sonra | **v1.5'te yalnız 9:16.** Önce 22 F-1 netlik düzeltmesi gelir. İki biçim, QA yüzeyini ikiye katlar ve E1'in yorumunu karıştırır. Unvan çıkartması (23 I-G1, 20 F14) denemeden sonra ilk intent adayı | B-Ö (B9) |
| Ç27 | Yerel yedek / dışa aktarma | 20 Q9: Albümle birlikte. 18 F7: intent açılsın | 21 Y1, 24 S-6, 25 S-11, 26 R-6: v2 | **v2 intent.** 24'e göre en riskli yüzey bu. Onboarding ve politika metni D2D kararıyla birlikte dürüstçe yazılır | B-O (D3) |
| Ç28 | Albümde gizli satırlar | 25 S-10: varsayılan gizli, dokununca açılsın | 13 K-10, 17 S5: açık gösterilsin | **Açık** (albüm özel bir yüzey; aynı içerik bugün kart ekranında zaten görünüyor) + P4 ile son uygulamalar önizlemesi gizlenir. Uygulama kilidi v2 | B-O (D2) |
| Ç29 | ErrorBoundary'nin metni | 21 §2a: "(onaylı) Verileri silip baştan başla" | 28 §4.5: veri silmeyi **önermez** | Kök sınır yalnız "Tekrar dene" gösterir (28). Tekrarlayan migration hatasına özel ekran, 21'in silme seçeneğini yalnız çift onayla ve "Tüm verilerimi sil" metniyle taşıyabilir | E (tech-lead + architect) |
| Ç30 | Paket temizliği | 08 TB-2, 21: reanimated ve worklets birlikte çıksın. 22: gesture-handler da çıkarılabilir | 28 Ç-6: worklets'i `@expo/ui` çekiyor (12'nin ölçümü), ayrı ve opsiyonel adım. 08: gesture-handler kalır | **28'in sırası** (ölçüm kazanır). Gesture-handler kalır (expo-router JS stack'i kullanıyor) | K |
| Ç31 | R8'in zamanı | 26 §3: tabanın ilk işi | 21: S18, tabanın sonu. 22: ilk dış dağıtımdan önce | Yapılandırma S18'de, **S17 ile aynı release derlemesinde** ve 0.1.0'dan önce yapılır; 0.1.0 R8'li çıkar. 26'nın "erken yakala" kaygısı, S17/S18'i S15/S16 ile paralel bir şeritte yürütmekle karşılanır | K (koordinasyon) |
| Ç32 | 5 kişilik testlerin eşiği | 15 KC1, 23 M2: ≥ 3/5 ve eski karttan en az +1 | 27 §3.2: ≥ 3/5 ayırt edici değil; "geç" için ≥ 4/5, "dur" için ≤ 2/5 ya da ≥ 3/5 "çocuksu" | **27 kazanır** (istatistik gerekçeli). 23 P0, 27 §3.2, 13 H1/H5, 17 L1 testi, 18'in erken-unvan testi ve V4 örnek kart testi **tek bir 6 kişilik oturumda** birleştirilir (F0-8) | B-O (B12; kişileri Batuhan seçer) |
| Ç33 | "8 saniye" iddiası | 23 §4.3: kısa açıklama adayında ve davet mesajında "8 sn" | 02 S-8, 19 Q8: ölçülmedi → "birkaç saniye" | Kronometre ölçümü yapılana kadar **"birkaç saniye"** (yanıltıcı beyan riski) | B-Ö (A15) |
| Ç34 | Hafta noktalarında "kaçırılmış" gün | 14 README, 17 §2.7: geçmiş boş gün = kesik halka | 20 §2.1: düz halka (suçlamasız) | Şekil farkı erişilebilirlik için gerekli, ama "kaçırılmış" dili suçlayıcı. Karar visual ve engagement ortak; ölçüt: "renksiz ayırt edilir, suçlamaz" | E |

**Çelişki değil, açık boşluk:**
- **21 P-1 çıkarım sızıntısı:** unvan ve özet, gizli kategorinin "orta" seviyesini ima ediyor. 24 bunu değerlendirmedi.
  Security-reviewer'ın 21 §2a'yı okuyup karar vermesi, S21'in girdi kapısıdır. Beklemeden, hemen yapılabilecek bir hazırlık.
- **Sessiz test değişiklikleri:** 13, 17 ve 21, bazı test dosyalarının değişmesini öngörüyor: `layout.test.ts` (C düzeni),
  `week-route.test.tsx` mock'u (04 #5), TZ testlerinin yeniden tasarımı (TB-5), `CardView.test` damga beklentisi. Global kural
  gereği bunlar düzeltme görevinin içinde **yapılamaz**. Her biri ayrı etiketlenmiş bir "test değişikliği" görevi olarak
  Batuhan onayıyla yürür.

---

## 3. Tek öncelikli yol haritası

Sürüm = aşama (26 §2.2; şema sütunu Ç16'ya göre düzeltildi):

| Sürüm | Kapsam | Kitle | Şema |
|---|---|---|---|
| 0.1.0 | Taban | yalnız Batuhan | v3 |
| 0.2.0 | Çekirdek | arkadaş denemesi | v4 |
| 0.3.0 | İkinci yapı | aynı arkadaşlar | değişmez |
| 0.9.0 | Play kapalı test adayı | Play testçileri | — |
| 1.0.0 | Üretim | herkes | — |

### 3.0 Faz 0: Batuhan eylemleri (gün 0-2, kod yok)

| # | Eylem | Neden şimdi | Süre (K0) |
|---|---|---|---|
| F0-1 | Çalışma ağacını commit'le (48 yol) ve `v0.0.0-pre` etiketini at | Kanıtın commit SHA'sına bağlanması için şart (28 ders 19). Taşımanın ve worktree'lerin önkoşulu | 30 dk |
| F0-2 | Özel uzak depo aç; `main`'i ve etiketi it (A2) | Depo tek diskte (26 D1). CI ancak böyle koşar | 20 dk |
| F0-3 | Repoyu `C:\dev\haftik`'e taşı; `npm ci`, `npx expo prebuild --clean` (A1) | Robocopy'li kopyada "eski kodda K4" riski var (28 §4.7) | 1-2 saat |
| F0-4 | H0: dev menüsüyle kart akışını baştan sona yaşa, izlenimini 3 cümleyle yaz (13 §1) | "Amatör" yargısının hangi katmandan geldiğini teyit eder; S19-S23 önceliğini doğrular | 15 dk |
| F0-5 | 13 Kasım 2023'ten önce açılmış bir Play hesabın var mı? Yoksa başvuruyu başlat (26 S1, P1) | Play takvimini 2-3 hafta oynatır; kimlik doğrulaması günler sürer. APK yolunu etkilemez | 5 dk + başvuru |
| F0-6 | Expo hesabını aç; keystore yedeği için plan yap: şifre yöneticisi + çevrimdışı kopya (26 §1.5) | 0.1.0'ın kapısı | 30 dk |
| F0-7 | Karar paketi A'yı cevapla (bölüm 4; 18 madde, 7'si tek onayla) | S13-S18'in girdisi | 30-45 dk |
| F0-8 | Birleşik P0 görsel oturumu için 6 kişi seç: E1 kohortunun dışından, iPhone'lular dahil. Oturumu hafta 1-2'ye koy (B12) | C'ye yapılacak ~4,5 günlük yatırımdan (S19-S20) önce en ucuz kanıt | 20 dk/kişi |
| F0-9 | Story/Durum bandını ölç: v2 kart PNG'sini (`kart-v2.html`, 1080x1920) kendi telefonunda Instagram Hikâye ve WhatsApp Durum editörüne koy, **yayınlamadan** ekran görüntüsü al | Ç7'yi kapatır, S19'un yerleşimini belirler | 10 dk |

### 3.1 Kapıyı beklemeden hazırlık (ekip; kod yok, paralel yürür)

- **security-reviewer:** 21 §2a'daki çıkarım sızıntısı ve katı görüntü kuralı hakkında görüş yazar. S21'in kapısı budur.
- **copywriter:** S16a metin tablosunu tek bir onay belgesi olarak hazırlar (19 §2-§4, 02'nin en zayıf 10 metni).
  `tr.ts`'e işlenmez. Mağaza metni v2'yi (19 §5.2) güncel tutar.
- **privacy-compliance-analyst:** şunları hazırlar:
  - politika v2 (25 §3),
  - K10 geçici karar metni (06 §8'deki 9 koşul),
  - davet mesajı + kısa rıza metni,
  - hukuki görüş dosyası (06 §7 + 25 §7'deki 12-14. ek sorular).
- **test-automation-engineer:** `scripts/release-smoke.sh` (26 R-7, 22 R-21..R-27'deki yöntem düzeltmeleriyle).
- **visual-designer:** Ç7 sonucuna göre kart yerleşimi, @4x varlık listesi (17 §2.10 adım 6), ikon PNG setleri.
  P0 materyali: eski PNG + v2 PNG, aynı içerikle.
- **data-analyst:** rapor v2 alan listesi ve elle birleştirme tablosu şablonu (27 §4).
- **release-manager:** `CHANGELOG.md`, `docs/surumler/` şablonu, imza parmak izi kayıt dosyası.
- **Batuhan (isteğe bağlı):** avukat randevusu. K10, Play yolunun en uzun belirsiz kalemi; randevu şimdi alınırsa
  0.9.0 beklemez.

### 3a. Taban → 0.1.0 (yalnız Batuhan'ın telefonu)

| Dilim | İçerik (kaynak) | Efor | Bağımlılık / kapı | Bitti kanıtı | K | Şerit |
|---|---|---|---|---|---|---|
| **S13** Hijyen ve zemin | Bölüm 5'teki iş paketi. Node 24, tam sürüm sabitleme, TZ doğrulaması, ASCII yol denetimi, `verify` + `check:bundle`, R-6 politika testi, ESLint bekçileri, TB-6, dependabot, CI `permissions`, spike/reset silme, Expo yama yükseltmesi (08 TB-4..8/23; 28 §1-2; 24 N-3) | 1,5 | F0-1..3; A4, A5 | `npm run verify` çıktısı; doctor tamamen yeşil; yeni yolda SHA'lı emülatör duman testi | K2+K4 | A |
| **S13b** Belge ayıklama | `CLAUDE.md` ≤ 250 satıra iner, ayrıntı `docs/muhendislik/`'e taşınır (28 §3). Kayıp kontrol betiği, taze bağlam testi, ilk 3 karar kaydı (A7) | 0,5 | S13 commit'i; A6 | Eksik listesi boş; verifier 5 soruyu doğru cevaplar | K1 | B |
| **S14** Veri sağlamlığı | T7 atomik migration; R-11 (hash, kesinti simülasyonu, v2 fikstüründen yükseltme); v3 = `metric_counter` (Ç15); TB-10 (`now` zorunlu); kök ErrorBoundary + `useLoad` (Ç29); R-9 "her tablo silinir" sözleşme testi (04 #3, #7; 21 §2a; 27 §2.3; 24 §2.2; 25 R-1) | 1,5 | S13; A9, A10 | Kesintiden sonra 2. açılış temiz; v2 fikstürü → v3 round-trip; silmeden sonra `sqlite_master`'daki her tablo 0 satır | K2 | A |
| **S15** Yollar ve bildirim | T1 Kritik-1 (B) + monotonluk testi + "kart varsa" dalı. T2 `findOpenableWeeks` + Hafta banner'ı. T3 sabit rota tablosuyla bildirim yönlendirmesi: soğuk/sıcak açılış, tek sefer işleme, kart yığını Hafta'nın üstünde (YB2-13). İki kanal (Ç23), Pazar'da daily yok (Ç24), teslim edilmiş bildirimleri kaldırma (22 §4.4), V-03 geri tuşu düzeltmesi (04 #1-2; 09; 21 §2f; 22 §4; 24 §2.6) | 4 | S14; A8, A12, A13 | Monotonluk testi yeşil; 09 #1, #2, #5 sıcak ve soğuk açılışta GEÇER; Pazar planı tek öğe; kanal kapatma K4'te | K2+K4 | A |
| **S16a** İçerik ve adlandırma | Seviye kelimeleri; 02'nin en zayıf 10 metni + M-2/3/4; zamansızlaştırma; `src/`, `site/` ve mağaza belgesinde "Kart" taraması + R-12; banka kartı sesteşliği; bildirim metinleri; içerik lint'i L1/L3/L5/L6; `textTransform`/`toUpperCase` yasağı; damga "Haftik" (T4); CONTENT_VERSION 2 (19 §2-5; 13 T5; 17/22 F-4) | 1,5 | A14, A15; Batuhan'ın metin onayı | İçerik testleri ve lint yeşil; "karne" grep = 0; onay notu | K2 | B (`tr.ts`, `site/`) |
| **S16b** Pürüz, erişilebilirlik, güvenli silme | A11Y-01..06: önizleme ekranında Geri, 48 dp hedef, metin sarma (minimal düzeltme; kalıcı çözüm S21'deki seçici). A11Y-15: "Tamam". Silme ve yükleme hatalarında geri bildirim + VACUUM/`secure_delete` (24 F3, 21 P-5). Paylaşım dosyası: `cache/haftik-share/` dizini, tarihsiz `Haftik-kart.png`, yaşa göre süpürme (04 #4, 22 F-8, 24 §2.1). T6 açık tema kilidi. Sürüm satırı (26 R-1). Rapor v2 (27 §4.1) | 2,5 (+0,5 ops.) | S14 (`metric_counter`); A11 | 11'in 6 Önemli bulgusu emülatörde yeniden ölçülür; cihaz koyu moddayken 3 ekran; rapor yasak-desen testi yeşil | K2+K4 | A |
| **S17** Platform yapılandırması (yeni dilim; 21 bu numarayı boş bırakmıştı) | Önce referans: yerel release APK ile emülatörde ağ ölçümü (22 §1.4). Sonra: `dataExtractionRules` plugin'i; `blockedPermissions` (16 rozet + c2dm + referrer + ACCESS_NETWORK_STATE); INTERNET için release plugin'i C; altın izin listesi (22 §1; 24 §1; Ç4-Ç6) | 1,25 | S13; A16, A17 | `aapt2 dump permissions` altın listeyle aynı; `xmltree`'de dataExtraction; D2D test modunda yedek boş; referans ölçüm notu | K4-rel | B (`app.json`, `plugins/`) |
| **S18** Boyut / R8 | 28 §4.9 sırası: web yığını → reanimated → R8 + shrink (`expo-build-properties`, preview ve production) → worklets (ops.) → Material Symbols (ops.). `mapping.txt` saklanır. **Tek release K4 matrisi:** 26 R-01..R-20 + 22 R-21..R-27, root'lu Google APIs imajında (12; 21 §2g; 22 §2; 26 §3) | 1,25 | S17 ile aynı release derlemesi; taban kodu bitmiş olmalı; A18 | APK ≤ 40 MB (x86_64); logcat'te `ClassNotFound\|NoSuchMethod\|InvalidClass\|SecurityException` = 0; R-01..R-27 sonuç tablosu | K4-rel | B |
| **P1** 0.1.0 | EAS preview (`autoIncrement`), keystore yedeği + parmak izi kaydı, etiket, CHANGELOG, sürüm kaydı. Batuhan'ın telefonunda bir hafta (07 A0): E1-E15, PCAPdroid ile ağ gözlemi (G-02), gerçek bir Pazar | 0,75 + 1 takvim haftası | S18; F0-6; C7 | 26 §2.3'teki 0.1.0 kapıları; Pazar kartı gerçek cihazda açılır ve paylaşılır; geri alma provası (0.1.0 → 0.1.1) | K5 (n=1) | — |

P1 haftası çekirdekle çakışır: S19 bu hafta içinde başlar.

**Açık bulgu → dilim eşlemesi (hiçbir açık bulgu sessizce düşmedi):**

| Kaynak | Bulgu | Dilim |
|---|---|---|
| 04 #1 / 09 QA4-01 | Kritik-1 | S15 |
| 04 #2 / 09 QA4-02 | Kaçırılan haftaya yol yok | S15 (T2); kalıcı evi S25 |
| 04 #3, #7 | Migration atomik değil; hata geri bildirimi yok | S14, S16b |
| 04 #4 / 05 S-01, S-03 | Paylaşım dosyası erken silinebilir; harici önbellek | S16b |
| 04 #5 | Test gücü | S15 (yeni testler) + ayrı test değişikliği görevi |
| 04 #6 / 08 TB-5 | TZ testleri atlanıyor | 0.9.0 öncesi ayrı test görevi (R-14) |
| 04 #8-10 | Ölü kod, çift mantık, eski yorumlar | S13 (spike/reset); geri kalanı dosyaya dokunuldukça. `basic.*.medium` S21'de işe yarar; `partialData` S24'te kalkar |
| 04 #11 | Çift dokunuş, Pazar'da aynı dakika, iptal = paylaşıldı, bildirim simgesi, yer tutucu damga | S22, S15, S21, S20, S16a |
| 09 QA4-03..07 | Bildirim tıklaması, izin geri tuşu, sessiz Kaydet, `???` unvan, PNG yumuşaklığı | S15, S15, S22, S21, S19 (R1) |
| 09 YB2-01..03, 05 | Geri düğmesi, 25 dp hedef, anahtar etiketi, "SIL" | S16b (+ S23'teki onay sayfası) |
| 09 YB2-06..08 | Açılmış kartta iskelet, özet italiği, ilk açılışta beyaz ekran | S23, S19, S19 (R3) + P1'de ölçüm |
| 09 YB2-10, 11, 13 | Bildirim simgesi, bildirim yığılması, deep link'te geri tuşu | S20, S15 (kısmen; kalanı bilinen sınır), S15 |
| 09 YB2-12 | Hedef uygulamaya metin gitmiyor | Kabul (22 §3.3 a); bağlantı damgada |
| 11 A11Y-01..06 (Önemli) | Hedef boyu, etiket, hareket, kontrast, metin kesilmesi | S16b; 01/02/06'nın kalıcı çözümü S21 |
| 11 A11Y-07..16 (Düşük) | — | 07 S22 · 08 S23 (banner onu kaldırır) · 09, 11, 12, 14 S23 · 10, 15 S16b/S23 · 13 S19 · 16 S16b (A11) |
| 12 | Material Symbols, Inter italic, R8, Kaydet geri bildirimi | S18, S19, S18, S22 |
| 22 | Kanal kapalıyken "granted", 3 tuşlu gezinme, 360x780, Türkçe büyük harf, serileştirme tuzağı, D2D | S23, S23, S23, S16a, S18 (R-22), S17 |
| 24 SEC2-1/2/3, N-1/3/5/6 | D2D, ağ, rozet; VACUUM, CI izinleri, sessiz silme, FileProvider | S17; S16b, S13, S16b, S16b |
| 25 Y-1..Y-8 | Saklama süresi, CHECK, `line_hidden`, T8, rapor iletisi, R-1, site metni, Health | S25 + politika; S14; S14 (kategorisiz kalır); S16b; C3; S14 (R-9); hazırlık; D6 |
| 26 A4, D1-D13 | Sürüm sayacı, uzak depo, CI, CHANGELOG, dependabot, geri alma provası | C7, F0-2, S13, P1, S13, P1 |
| 27 M-1..M-14 | Ölçüm eksikleri | S14 (M-1 ve `metric_counter`); S16b (rapor v2 alanları); P1 (M-13); deneme kuralı (M-14: temiz kurulum) |
| 28 R-1..R-17 | Mekanik kontroller | S13 (R-1/2/3/6/13/16/17) · S14 (R-9/11) · S15 (R-4/10) · S16a (R-12) · S19 (R-7/15) · S23 (R-8) |
| 07 A17-A19 | İkon, damga, tema | S20, S16a, S16b |

**Taban çıkış kapısı (0.1.0; 28 §4.8 + 26 §2.3 birleşik):**
- Çalışma ağacı commit'li; `verify` yeşil; doctor yeşil.
- R-1, R-3, R-6, R-11, R-13 aktif.
- T1/T2/T3 için K2 regresyon + K4.
- T7 atomik.
- Altın izin listesi eşleşiyor; D2D kuralı yerinde.
- R-01..R-27 matrisinin blokör satırları geçti.
- EAS preview alındı, keystore yedeklendi, parmak izi kayıtlı, etiket `v0.1.0`.

### 3b. Çekirdek → 0.2.0 (arkadaş denemesi)

| Dilim | İçerik (kaynak) | Efor | Bağımlılık / kapı | Bitti kanıtı | K | Şerit |
|---|---|---|---|---|---|---|
| **S19** Kart v2 (yetişkin C) | Token'lar (kart + kabuk, açık ve koyu sütun); Fraunces 800/600i + Inter 500/700/800 (alt yol importu); `<Sticker>` ilkeli; `CardView` v2 (17 §2.6, Ç7 bandı); `LevelMark` L1; kategori tonları + gizli satırın 7 kuralı; R1 keskinlik sarmalayıcısı; R3 yükleme kapısı; @4x varlıklar; fikstür galerisi (İ-2); dönme bütçesi testi; render sözleşmesi R-15; R-7 renk lint'i; satır kimliği biçiminin dondurulması (21 P-6); `kart-yerlesimi.md` (17 §2; 21 §2b; 28 §4.11) | 3 | S16a; P0 sonucu; F0-9; `layout.test.ts` değişikliği için ayrı onay | Kontrast testi; gizli satır ağacı testi; 3 ekran boyu × 6 fikstür PNG'si; 2,0x ve 2,625x'te kontur profili; sistem dili İngilizceyken "HAFTİK" doğru | K2+K4 | A (B: S22) |
| **S20** Kimlik ve reveal | İkon v2 (1024, adaptive ön + `backgroundColor`, monochrome); splash; bildirim simgesi (yalnız `withNotificationsAndroid` çağıran yerel plugin); 1,4 sn "yapışma" reveal'ı; azaltılmış hareket; `expo-haptics` (7 adımlı ağ kontrolüyle) (17 §2.8-2.9; 22 §4.6; 24 §3) | 1,5 | S19; B3, B5 | 48 dp başlatıcı ekran görüntüsü; splash'ten sonra beyaz parlama yok; azaltılmış harekette tek geçiş; R-07 | K4 (+K5 akıcılık P2'de) | A |
| **S21** Paylaşım anı | Intent I-2. v4 (`share_title_*` sütunları). `selectShareTitle` (tip gereği uyku ve harcamayı göremez). Katı `resolveVisibleTitle`. Şerit metni: "Gizli çıkartma · bilerek saklandı". Paylaşım seçici (18 §2.8; `ScrollView` + sabit CTA, 22 §5.1). Önizleme = ölçeklenmiş `CardView` (28 §4.11-8). Özet sızıntısı kararı (21 P-1). Spec'e veri modeli tablosu (21 P-8) (13 V2; 21 §2a; 24 §2.1) | 4 | S14 (T7), S19; B1 + security görüşü | Non-interference özellik testi; varsayılan gizlemede okunur unvan %100; v2 → v4 round-trip; security'de açık Important 0 | K2+K4 (+K5 P2'de) | A (CardView ortak olduğu için sıralı) |
| **S22** Günlük an | Kaydet mikro-anı (17 §2.8, 18 §2.5); `progress-line` cümle havuzu (19 §3.2); `useSingleFlight` (M-9); ekran okuyucu duyurusu (A11Y-07); Kaydet sonrası CTA; dönüş satırı; daily bildirim havuzu (19 §5.1) | 1,5 | S15 (T1 eşiği); B8 | Kaydet'ten 0,4 sn sonraki karede onay görünür; tek uçuş testi; `check_in_saved` bir kez sayılır | K2+K4 | B |
| **S23** Kabuk ve ilk değer | V1b: Bugün ve Hafta durumları (17 §2.7; 18 W2-W3). Ayarlar v2: bölümler, iki bildirim anahtarı, kanal kapalı okuması (22 §4.2), onay sayfası bileşeni, gizlilik satırı gizli. `ScreenScaffold` + üst kontrol testi. Sekme ikonları. K3 banner'ı. Bütçe testleri: 411x914, 360x640, 360x780, 3 tuşlu gezinme. V4: onboarding'de ÖRNEK kart + Hafta yuvası. Onboarding metinleri + 18+ satırı. Ön-soru deseni (B7). (Ops.) kart tepkisi F1 (27) | 3,75 (+0,5 ops.) | S19, S22; B6, B7, B13 | 8 ekran × 411x914 + küçük ekran + yazı ölçeği 2,0; örnek kart hiçbir repo çağırmaz (K2) | K2+K4 | A |
| **P2** 0.2.0 | Tek yönlü kapılar kapalı (26 Ç-1: tema, v4, damga, ikon, "Kart", T7, kanallar, dataExtraction). 0.1.x'in üstüne kurulum (K5). İkon 48 dp'de okunur. Story/WhatsApp görünümü (A15), Pazar bildirimi (A14). K10 geçici kararı yazılı. Davet + rıza metni. RN'den alınan PNG ile 3 kişilik kısa tekrar testi (23 P1) | 0,25 + takvim | P1 bulguları kapalı; C1-C8 | 26 §2.3'teki 0.2.0 kapıları | K5 | — |

**Çekirdek kapısı (0.2.0):**
- Tek yönlü kararlar kapalı.
- P0 "geç" ya da olgunlaştırma turu tamam.
- Security'de açık Important yok.
- Unvan görünürlüğü %100 (K2).
- v2 → v4 yükseltmesi cihazda veri kaybetmiyor (K5).
- Kullanıcıya dönük metinde "karne" grep sonucu kayıtlı.
- APK ≤ 40 MB.
- D7 ve İKO hedefleri `plan.md`'de yazılı.
- Ağ ölçümü (G-02) temiz. Temiz değilse davet mesajındaki cümle ölçüm düzeyinde yazılır.

### 3c. Arkadaş denemesi (0.2.0, APK)

| Adım | Kim | Ne | E1'e sayılır mı | Kaynak |
|---|---|---|---|---|
| P0 (önceden; F0-8) | 6 kişi, E1 dışı | Eski ve v2 kart PNG'si. Ölçülenler: tercih, çocuksu ölçeği, 3 sn'de unvanı okuma, L1 "sağdaki daha mı iyi?", ÖRNEK kartı kendi kartı sanma, gizli hâl, 24 saatlik gerçek paylaşım | Hayır | 23 §2.2; 27 §3.2; 13 H1/H5; 17 §2.4; 18 §1.3 |
| S1 smoke | Batuhan + 3-5 Android'li yakın | 3-7 gün, bir Pazar dahil: çökme, izin, bildirim, paylaşım hedefleri | Hayır | 07 §6.1; 23 §2.3 |
| Dönem A (hafta 1) | 15-25 kişi (2 küme + dağınıklar, etiketli; 18+). Davet Pazartesi/Salı; 29 Ekim haftası başlangıç yapılmaz | Nötr; paylaşım çağrısı yok | **Evet (tek dönem)** | 23 §2.4; 27 §3.1 |
| Dönem B (hafta 2) | aynı | Nötr; 0.3.0 bu dönemin başında dağıtılır | Hayır | 13 §5.2; 26 |
| Dönem C (hafta 3) | aynı | Çağrılı paylaşım ("atmazsan o da veri") | Hayır; ayrı raporlanır | 23 |
| Dönem D (hafta 4) | aynı | Serbest kullanım; 5 nitel soru + telefon markası ve bildirim sorusu | Hayır | 20 §4.4; 22 §8 |

**Ölçüm kuralları:**
- E1 = nötr dönemde (paylaşım ≥ 1) / (kart açılışı ≥ 1). Öz-bildirimle çapraz tablo yapılır (23 §2.5). Kümeler ve
  dağınıklar için iki ayrı oran raporlanır.
- D7 ≥ %40 ve İKO hedefi, deneme başlamadan `plan.md`'ye yazılır (C2).
- Rapor v2 `seq` ve `build` alanlarını taşır. Elle birleştirme 27 §4.3'e göre yapılır: iki katmanlı payda, Wilson aralığı.
- Deneme cihazlarında dev menüsü olmaz; temiz kurulum şart (27 M-14).
- Okuma dili: 0-2/20 net zayıf, 3-4/20 belirsiz, ≥ 5/20 güçlü sinyal. "Kanıtlandı" denmez.

**Durdurma kuralları (23 §2.6, 15 KC ve 26 §2.4'ün birleşimi):**
- Dağıtım durur ve ileri düzeltme yapılır, eğer:
  - açılışta çökme varsa,
  - gizli bir satır ya da unvan PNG'de görünüyorsa,
  - silmeden sonra bildirim diriliyorsa,
  - migration veri kaybettiriyorsa.
- P0'da C "dur" eşiğindeyse → olgunlaştırma turu, ardından ikinci 5 kişi. S19'un yatırımı bu turla sınırlanır.
- E1 < %25 **ve** P0 geçmişse → kapsam genişletilmez, ürünün kendisi ele alınır (intent kuralı, 15 KC7).
- Story/Durum'da kırpılma düzeltmeden sonra da sürüyorsa → kare biçim öne alınır (15 KC6).

**Play'e geçiş (denemeden sonra):**
- 0.9.0 yeni özellik getirmez (26). İçeriği:
  - K10 hukuki görüşü ve canlı politika URL'si,
  - Play hesabı,
  - Data Safety (ağ ölçümünden sonra), Health apps, IARC, 18+,
  - mağaza varlıkları (17 `magaza.html`),
  - AAB + `bundletool` kontrolü.
- Play kohortu ayrı etiketlenir. APK'dan geçen gönüllülere "kaldır-kur, veri gider" önceden söylenir.
- 14 günlük kapalı test (şart geçerliyse) → üretim erişimi → 1.0.0 aşamalı yayın.

### 3d. İkinci yapı → 0.3.0

| Dilim | İçerik (kaynak) | Efor | Bağımlılık / kapı | Bitti kanıtı | K | Şerit |
|---|---|---|---|---|---|---|
| **S24** İçerik derinliği | Kademeli havuz genişletme (önce orta seviye + hareket/sosyal). Yeni özet kovaları (19 §4.4; ölü `partialData` çıkar). Unvanlara 2. varyant. 8 hafta tekrarsızlık (`prevVariants` son 7 hafta). Lint L2/L4/L7. Kıyas anlatısı yalnız kart ekranında, PNG dışında. CONTENT_VERSION 3 (13 V5; 19 §4; 02 §6) | 3 | S16a; copywriter turu + Batuhan'ın onayı | 12 haftalık simülasyonda tekrar testi; 81/81 kapsama; PNG'de kategori adı yalnız görünür satırda | K2 | B |
| **S25** Albüm | Intent I-1. Hafta segmenti. `AlbumCell` (FlatList, canlı render, PNG önbelleği yok). Türetilmiş numara. "Bekliyor" yuvaları. Viewer (reveal atlanır) + varsayılan gizlemeyle tekrar paylaşım. Salt okunur rota (`getCard`, parametre doğrulama; 24 §2.5). `album_opened` sayacı. Etik liste (18 §2.2). Kilometre taşı satırları. P4 son uygulamalar gizleme. Politikaya saklama cümlesi (13 V6; 18 §2.2; 20 §2; 21 §2c; 24; 25) | 3,5 (+0,4 P4) | S15 (T2), S19; D1, D2 | Gerçek SQLite: yalnız dondurulmuş ve uygun haftalar listelenir; silme sonrası boş; dev menüsüyle 4 haftalık senaryo; yazı ölçeği 2,0; son uygulamalarda önizleme boş | K2+K4 | A |
| **P3** 0.3.0 | Nötr dönem bitince aynı arkadaşlara dağıtılır; 0.2.x'in üstüne kurulum (K5); (ops.) Yenilikler kartı (26 R-4) | 0,25 | S24, S25 | 26 §2.3'teki 0.3.0 kapıları | K5 | — |

### 3e. Efor, kritik yol, paralellik, kesme sırası

| Aşama | 21 (dilim tablosu) | Bu plan (medyan, K0) | Farkın nedeni |
|---|---|---|---|
| Taban (S13-S18) | 10,5 | **14,0** | S17 yeni (+1,25); S15'e kanallar, Pazar ve teslim edilmiş bildirimler (+0,75); S13'e bekçi lint'leri ve R-6 (+0,5); S13b ayrı (+0,5); S16'ya a11y, güvenli silme, rapor v2 ve sürüm satırı (+0,25); S14'e R-9 (+0,25) |
| P1 | 0,75 | 0,75 | — |
| Çekirdek (S19-S23) | 13,5 | **13,75** | Ayarlar v2'de kanal okuması (+0,25). Kart tepkisi opsiyonel (+0,5) |
| P2 | 0,25 | 0,25 | — |
| **Denemeye kadar** | **~24,75** | **~28,75** | |
| İkinci yapı + P3 | 6,5 + 0,25 | **7,15** | P4 son uygulamalar gizleme (+0,4) |
| **Toplam** | **~31,5** | **~36** (opsiyonellerle ~37) | Aralık kabaca 30-45; architect doğrulamalı |

**Kritik yol:**
```
F0-1 commit -> F0-3 taşıma -> S13 -> S14 (T7, v3) -> S15 (T1-T3, kanallar) -> S16b -> [S17 + S18: tek release turu] -> P1 0.1.0
                                         \-> S16a (paralel) ---------------------------/
P1 haftası içinde: S19 -> S20 -> S21 (v4; security kapısı) -> S23 -> P2 0.2.0 -> S1 smoke -> Dönem A -> S24 || S25 -> P3 0.3.0
                     \-> S22 (paralel; S15'ten sonra)
Dış kapılar: EAS -> P1 | P0 + F0-9 -> S19 | I-2 + security -> S21 | K10 geçici kararı + davet/rıza + G-02 -> S1 ve A |
             K10 hukuki görüşü + politika URL'si + Play hesabı -> 0.9.0
```

**Paralellik (en fazla 2 worktree):**

| Dönem | Şerit A | Şerit B | Neden çakışmaz |
|---|---|---|---|
| Gün 1 | S13 | T1 hazırlığı (A8 onayı geldiyse) | Yapılandırma ve test altyapısı ↔ `domain/week.ts`, `data/card-repo.ts`. B, A birleşince rebase eder (S13 `package.json` ve `jest.setup` dosyalarına dokunuyor) |
| Taban | S14 → S15 → S16b | S13b → S16a → S17 → S18 (yapılandırma) | `src/data`, `src/notify` ve ekranlar ↔ `tr.ts`, `site/`, `app.json`, `plugins/`. Release K4 matrisi şeritler birleşince tek turda koşar |
| Çekirdek | S19 → S20 → S21 → S23 | S22 | `card/` ↔ `today`, `checkin-form` (21 §3) |
| İkinci yapı | S25 | S24 | Ekranlar ↔ içerik havuzu |

**Kesme sırası (denemeyi ~24 güne çekmek için; 21'in listesi + bu planın ekleri):**
1. V1b (S23) kısalır: yalnız token, font ve sekme ikonları kalır (−1,5).
2. V4'teki onboarding örneği çıkar, Hafta'daki minyatür kalır (−0,5).
3. Rapor v2 yalnız `build` + hafta dizisine iner (27 Q3 b) (−0,5).
4. INTERNET plugin'i 0.9.0'a ertelenir; APK aşamasında söz "ölçüldü" düzeyinde kalır (−0,5).
5. A11Y düşük öncelikli bulguları S23'e katılır, çünkü o ekranlar zaten yeniden yazılıyor (−0,5).
6. S13b belge ayıklaması çekirdekten sonraya kalır (−0,5).

Toplam ≈ −4 gün → denemeye kadar ~24,75.

**Asla kesilmeyenler:**
- T1-T3 ve T7.
- S17'nin tek yönlü kısımları: dataExtraction ve kanallar.
- R8.
- Kart, ikon ve reveal.
- Paylaşım unvanı.

**Takvim örneği (K0; Batuhan'ın haftalık kapasitesi bilinmiyor):**
- **Haftada ~5 odaklı gün varsayımıyla:**
  - 0.1.0 ≈ 20 Ekim; 0.2.0 ≈ 10-13 Kasım.
  - S1 smoke bir Pazar içerir; Dönem A ≈ 16 ya da 23 Kasım.
  - 0.3.0 ≈ Kasım sonu; Play 0.9.0 ≈ Aralık (K10'a bağlı); 1.0.0 ≈ Ocak 2027.
- **Haftada ~3 gün varsayımıyla:**
  - Her şey ~4-5 hafta kayar; Dönem A Aralık ortasına denk gelir.
  - Bu durumda kesme sırası uygulanır ve Dönem A yılbaşı haftasına getirilmez.

### 3f. Aynı commit'te işlenecek spec, plan ve test sapmaları

**spec:**
- S2 "ilk kart" eşiği (A8).
- Güvenlik gereksinimi 3'ün uygulanma biçimi + v4 veri modeli tablosu (B1; 21 P-8).
- S8 #5: Pazar'da daily yok (A13).
- S8 #7: bildirim verisi ve metin havuzu.
- S9 ölçüm: `metric_counter`, olay listesi, `card_unlocked`'ın kaldırılması (A10).
- "Dahil değil" listesinden geçmiş kartların çıkması (yalnız D1 ve I-1 onaylanırsa).

**docs/ux ve öteki belgeler:**
- `ekran-akisi.md`: 52 dp üst inset, Kaydet anı, onay sayfası.
- `pazar-akisi.md`: banner.
- `kart-yerlesimi.md`: "renk yok" kararı geçersiz, C düzeni.
- `docs/manual-checklist.md` ve `s12-*`: bayat ad ve paket adı ifadeleri (07 §4.11).

**plan.md:**
- S13-S25, bu belgedeki bitti kanıtlarıyla.
- K10 geçici kararı.
- D7 ve İKO hedefleri.
- decode-uri-component risk kabulü.

**Ayrı etiketli test değişikliği görevleri (her biri Batuhan onayıyla):**
- `layout.test.ts` (S19).
- `week-route.test.tsx` mock'unun güçlendirilmesi (04 #5).
- TZ testlerinin süreç TZ'sine göre yeniden tasarlanması (TB-5/R-14; Play'den önce).
- `CardView.test` damga beklentisi (S16a).

Yeni test eklemek bu kısıta girmez.

---

## 4. Batuhan karar listesi (deduplike)

**Sayım:** ikinci dalgadaki 13 raporda 129 soru var:
13 (10), 17 (7), 18 (8), 19 (9), 20 (11), 21 (10), 22 (9), 23 (10), 24 (10), 25 (14), 26 (11), 27 (10), 28 (10).
İlk dalganın (01, 06, 07) soruları ikinci dalgada yeniden sorulmuş; yalnız farklı olanlar eklendi.

**Sonuç: 52 karar.** Dağılım: A 18 · B 14 · C 10 · D 10. Türlere göre:
- **Ö (23 madde):** düşük riskli ve geri alınabilir. "Önerimi uygula, sonra göster" uygun; içerik tonu turu emsali var.
- **O (29 madde):** onay şart.

**Tek cevapla ilerleme yolu:** "Ö işaretlilerin hepsini öneriyle uygula" demek + O maddelerine tek tek cevap vermek.

**Zaten kapandı, yeniden sorulmaz:**
- Kart yönü C; ikon 3; iş sırası.
- Kategori tonu izinli; ad "Kart"; seviye noktaları yeniden tasarlanır; R8 tabanda.
- Paket adı `com.batuhan.haftik`; 18+; "Uyku" etiketi kalır; dağıtım önce APK.
- v2 prototipleri: albüm moru, Fraunces, beyaz kesim kenarı.
- 13 K-3 (A yönü) ve K-4 ("karne") 16 ile geçersiz oldu.

### A. Taban başlamadan (S13-S18'in girdisi) — 18 karar

| # | Karar | Birleştirilen sorular | Öneri | Tür |
|---|---|---|---|---|
| A1 | Proje yolu | 21 S-8; 28 S-1; 08 §6 | `C:\dev\haftik`'e taşı; robocopy biter | O (senin eylemin) |
| A2 | Uzak depo ve CI | 26 S11; 28 S-2 | Özel depo + CI (Node 24, `verify`) | O |
| A3 | Pre-commit hook | 28 S-3 | Hızlı hook (typecheck, lint, ilgili testler); 10 sn'yi aşarsa kaldırılır | O (senin iş akışın) |
| A4 | Silme onayı | 28 S-5; 08 TB-3/7/8 | `spike/`, `__tests__/spike/`, `reset-project` ve web yığını silinsin | O (silme) |
| A5 | Node ve sürüm sabitleme | 28 S-4; Ç-5 | Node ≥ 24; SDK'ya kilitli paketlerde `^` yok | Ö |
| A6 | `CLAUDE.md` ayıklaması ve ekip dersleri | 28 S-7, S-10 | Commit'ten hemen sonra ayıkla; 9 ders `ortak-standartlar.md`'ye (senin küresel dosyan) | O |
| A7 | Karar kaydı ve kilit dosyalar | 21 S-10; 28 İ-7; 26 S7 | `docs/kararlar/` + kilit dosya listesi + hotfix disiplini | Ö |
| A8 | Kritik-1 eşik kuralı | 21 S-1; 13 T1; 04 #1 | B: eşik check-in geçmişinden türesin (Ç8) | O (spec anlamı) |
| A9 | N-7 placeholder sütunu | 08 TB-1; 06 #10; 07 #2 | Kalsın; "v2 numarası yakıldı" kuralı | O (şema, tek yönlü) |
| A10 | v3 ölçüm şeması | 21 S-9; 27 Q2 | Ekleme biçiminde `metric_counter`; ad kümesi TS'te korunur (Ç15) | O (spec S9) |
| A11 | Açık tema kilidi | B14; 17 S3; 22 S8; 07 #3; 13 T6 | `light` + token'larda koyu sütun | Ö |
| A12 | Bildirim kanalları | 22 S4; 18 Q6; 20 F12 | İki kanal, DEFAULT önem; Ayarlar'da iki anahtar. **Ses açık mı sessiz mi, sen seç** (22: sesli; 20: sessiz) | O (tek yönlü) |
| A13 | Pazar'da günlük bildirim | 20 Q5; 22 S5; 04 #11 | Kart Pazar'ında daily yok | Ö |
| A14 | Seviye kelimeleri | 19 Q2; 02 M-1 | Uyku: kısa/orta/uzun · Sosyal: sakin/orta/kalabalık | Ö |
| A15 | İçerik paketi | 19 Q1/Q3/Q4/Q8/Q9; 28 S-8; 25 S-12; 23 Q7 | Her yüzeyde "Kart" (izin listesi boş başlar); vites özette; "sayfa" kotalı; "birkaç saniye"; yasak sözcüklerde kota; zamansızlaştırma; gizli çıkartma alt yazısı "bilerek saklandı" | Ö (uygula, göster) |
| A16 | İnternet ve izin temizliği | 24 S-1/S-2/S-4; 22 S1/S2; 25 S-1/S-2; 06 #1-2; 07 #6 | Ç6 sırası: ölç → release'e özel INTERNET kaldırma (C) → altın liste. Rozet, c2dm, referrer ve ACCESS_NETWORK_STATE engellensin. WAKE_LOCK ilk build'de kalsın. Firebase bileşenlerini silmek koşullu (Ç5) | O (gizlilik sözünün dili) |
| A17 | Cihazdan cihaza aktarım | 24 S-3; 22 S3 | `dataExtractionRules` ile kapat, 0.2.0'dan önce | O (tek yönlü + söz) |
| A18 | R8 kapsamı | 21 S-7; 26 S6; 28 S-9 | preview + production. Başarısız olursa 0.1.0 R8'siz çıkar ama 0.2.0'dan önce çözülür (22'deki serileştirme tuzağı). Material Symbols opsiyonel | Ö |

### B. Çekirdekten önce — 14 karar

| # | Karar | Birleştirilen sorular | Öneri | Tür |
|---|---|---|---|---|
| B1 | Paylaşım unvanı | 13 K-2; 21 S-2/S-3; 19 F-C1; intent I-2 | Dondurulmuş paylaşım unvanı (a) + katı görüntü kuralı + eski kartlarda şerit. Security görüşü şart. I-2 intent'ini sen commit'lersin | O (gizlilik sözü, intent) |
| B2 | Seviye gösterimi | 17 S1; 18 Q2 | L1 + kelime; P0'da "daha iyi" okuması ≤ 1/5 | Ö |
| B3 | Font ve ikon teyidi | 17 S2/S6; 21 S-6 | Fraunces + Inter; ikon v2 finali (beyaz kenar, pırıltısız). v2 onayının bunları kapsadığını teyit et | Ö |
| B4 | Story'de marka | 17 S4; 23 §1.4 | Mühür + wordmark yeter; F0-9 aksini gösterirse güvenli banda taşınır | Ö |
| B5 | Haptik | 21 S-5; 13 K-7; 22 P5 | Evet (Kaydet ve yapışma anında); sistem ayarına uyar | Ö |
| B6 | Pazar K3 | 18 Q3 | Bugün ekranında banner | Ö |
| B7 | Bildirim izni | 20 Q6; 22 §4.2; 18 §2.4 | Onboarding'de kalsın + ön-soru + saat çipleri | Ö |
| B8 | Kaydet sonrası | 18 Q8; 20 Q10 | Bugün'de kal; bekleyen kart varsa düğme "Geçen haftanın kartını aç" olsun | Ö |
| B9 | Ek biçimler | 17 S7; 18 Q5; 22 S6; 23 Q4 | v1.5'te yalnız 9:16 | Ö |
| B10 | Rakam kuralı | 13 K-6; 19 Q6; 20 Q7 | PNG'de rakam da harfle yazılmış sayı da yok; uygulama içinde serbest | Ö |
| B11 | Efor tavanı | 21 S-4; 13 K-8 | Denemeye kadar ~29 günü kabul et, aşılırsa 3e'deki kesme sırası; ya da baştan ~24 güne kes | O (takvim) |
| B12 | Birleşik P0 oturumu | 23 Q1; 27 Q4; 13 H1/H5 | 6 kişi, E1 dışından, 27'nin eşikleriyle, S19'dan önce | O (kişiler) |
| B13 | Küçük eklemeler | 26 S10 (R-1/R-2/R-5); 27 Q6; 21 P-7 | Evet: sürüm satırı, `build`/kanal etiketi. Geri bildirim yolu C8'deki adrese bağlı. Kart tepkisi F1 opsiyonel. Sonraya: kısayollar, galeriye kaydet, sorun raporu | Ö |
| B14 | e2e aracı | 28 S-6 | Tabanda adb betikleri; Maestro kurulumu (Java + CLI) çekirdek kapısında | O (sistem kurulumu) |

### C. Denemeden önce (0.2.0 kapısı) — 10 karar

| # | Karar | Birleştirilen sorular | Öneri | Tür |
|---|---|---|---|---|
| C1 | Kohort ve kanal | 26 S5; 23 Q2/Q5; 07 §3.5 | Ç9: E1, APK arkadaş kohortunda (15-25 kişi, küme ve dağınık etiketli); S1 smoke ayrı; Play ayrı kayıt | O |
| C2 | Hedefler | 13 K-9; 23 Q10; 27 Q1/Q8/Q10 | D7 ≥ %40; İKO kuzey yıldızı (≥ %50 sinyal, < %25 alarm, betimsel okunur). Deneme öncesinde `plan.md`'ye yazılır | O |
| C3 | Rapor v2 ve rıza | 27 Q3/Q9; 25 S-4; 06 #7 | Hafta dizisi + `build` + türetilmiş alanlar; kısa yazılı rıza; raporlar denemeden 30 gün sonra silinir | O |
| C4 | Deneme raporu Play'de olsun mu | 25 S-3; 06 #3; 07 §4.7 | C: yalnız preview derlemesinde; Play paketinde kod bulunmaz | O (mağaza beyanı) |
| C5 | K10 | 25 S-8/S-14; 06 §8; 07 #10 | APK denemesi için 06 §8'in 9 koşuluyla tarihli bir karar `plan.md`'ye yazılır; hukuki görüş Play kapalı testten önce alınır | O (hukuki) |
| C6 | Damga, alan adı, politika yeri | 26 S8; 23 Q3; 25 S-13; 07 #5/#12 | 0.2.0'da damgada yalnız "haftik" (APK döneminde "Play'de ara" yazısı yanlış olur). Play'den önce kısa bir alan adı + Cloudflare/GitHub Pages | O (satın alma) |
| C7 | Sürüm adı ve sayaç | 26 S2/S3; 07 #8 | `0.x` → 0.9 → 1.0.0; preview'da `autoIncrement: true` | Ö |
| C8 | Yayıncı adı ve iletişim | 25 S-7; 06 #9; 26 R-2 | Kişisel Gmail yerine ayrı bir adres | O |
| C9 | decode-uri-component açığı | 24 S-8; 08 TB-14 | Risk kabulü + `plan.md` kaydı; `npm audit fix --force` yapılmaz | O (risk kabulü) |
| C10 | Deneme modu | 27 Q7 | Elle WhatsApp hatırlatmasıyla başla; yanıtlar düşerse preview'a hatırlatıcı eklenir | Ö |

### D. İkinci yapı ve sonrası (bugün cevap gerekmez) — 10 karar

| # | Karar | Birleştirilen sorular | Öneri | Tür |
|---|---|---|---|---|
| D1 | Albüm paketi | 13 K-5; 18 Q1/Q7; 19 Q5; 20 Q2/Q3/Q4/Q8; 23 Q6; 25 S-9; intent I-1 | Ad "Albüm"; Hafta segmenti; türetilmiş numara; tarih aralığı yalnız uygulama içinde; cilt yok; kilometre taşları 1/4/10/26; "yeni unvan" etiketi yok; süresiz saklama | O (intent) |
| D2 | Albüm gizliliği | 13 K-10; 17 S5; 25 S-10; 24 S-5; 22 S9 | Gizli satırlar albümde açık + son uygulamalar önizlemesi gizli (P4). Uygulama kilidi v2'de; FLAG_SECURE yok | O (gizlilik) |
| D3 | Yerel yedek / dışa aktarma | 24 S-6; 25 S-11; 20 Q9; 21 Y1 | v2 intent'i (ilk aday) | O |
| D4 | Widget | 24 S-7; 13 I-5; 22 §6 | v2 | Ö |
| D5 | Play takvimi | 26 S4 | Denemeden ve 0.3.0'dan sonra; hesap, form ve varlık hazırlığı paralel yürür | O |
| D6 | Health apps ve yaş | 25 S-5/S-6; 06 #4-5 | Activity + Sleep kutuları işaretlenir; yaş kapısı yok, onboarding'de 18+ satırı | O (mağaza beyanı) |
| D7 | Kaçırılan hafta bildirimi | 18 Q4; 19 Q7; 22 §4.5 | Yok; yalnız uygulama içi yollar | Ö |
| D8 | Sideload doğrulaması (2027) | 26 S9 | 2027 başında yeniden bakılır | Ö |
| D9 | Herkese açık hesap ve içerik üreticileri | 23 Q8/Q9 | Üretim erişiminden sonra | O (senin hesabın) |
| D10 | v2 intent havuzu | 17 G1-G4; 20 F5/F7/F8/F13; 23 §6; 22 P1/P3; 13 I-3/I-4; 27 F3 | Deneme E1 eşiğini tutarsa açılır (intent kuralı). İlk sıradakiler: unvan çıkartması, yerel yedek, kısayollar | Ö |

---

## 5. İlk somut iş paketi: İP-1 = S13 "Hijyen ve zemin"

**Neden bu dilim:**
1. Sonraki bütün K4 kanıtlarının güvenilirliği buna bağlı: commit'li ağaç ve ASCII yol.
2. Ürün kararı gerektirmez; yalnız A4 ve A5 onayları yeter.
3. "Kanıt commit'e bağlı" dersini ilk günden uygular.
4. İkinci worktree'yi açar. En değerli düzeltme olan Kritik-1, A8 kararına bağlı olduğu için İP-2 olarak paralel koşar.

**Önkoşul (Batuhan):** F0-1 (commit + etiket), F0-3 (taşıma), A4 ve A5 onayları.

**Kapsam (içinde):**
1. Node sürümü:
   - `.nvmrc` = 24
   - `package.json` `engines.node: ">=24"`
   - `.npmrc` `engine-strict=true`
   - CI: `node-version-file: .nvmrc` ve `permissions: contents: read` (24 N-3)
2. Tam sürüm sabitleme: `"@types/jest": "29.5.14"`, `"react-test-renderer": "19.2.3"` (Ç-5).
3. `jest.setup.ts` TZ'yi atamaz, doğrular: Istanbul değilse ve bilinçli bir TZ koşusu değilse açık hata verir (Ç-7).
4. `scripts/assert-ascii-path.js` + `preandroid`/`preios` betikleri (28 §4.7).
5. `npm run verify` = typecheck && lint && test && `check:bundle`. `check:bundle` (R-13), `expo export` çıktısında dev
   menüsü dizelerinin 0 olduğunu denetler.
6. `__tests__/infra/policy.test.ts` (R-6'nın alt kümesi). Denetlediği kurallar:
   - paket kimliği sabit,
   - `expo-updates` yok, `reset-project` yok,
   - SDK'ya kilitli paketlerde `^` yok,
   - `allowBackup: false` ve `blockedPermissions` var,
   - `eas.json`'da `channel` yok,
   - `engines` tanımlı.
7. ESLint:
   - `reportUnusedDisableDirectives: 'error'` (R-16);
   - TB-6'daki blok disable kalkar (`useAnimatedValue`);
   - `no-console` yalnız `warn`'a izin verir (R-17);
   - `src/**`'de `node:*`, `__tests__`, `spike` ve statik `@/dev` importları yasak (R-1'in ilk kısmı; domain katman
     kuralları S14'te).
8. `dependabot.yml`: SDK sınıfı `ignore`; öteki paketler gruplu ve aylık (TB-23).
9. A4 onayıyla silinecekler: `spike/`, `__tests__/spike/`, `scripts/reset-project.js` ve npm script'i. Web yığını ayrı
   commit olarak S18'in (i) adımına kalır.
10. Expo yama yükseltmesi (`npx expo install --check`, TB-4): ayrı commit; yeni yolda `prebuild --clean` + debug derleme.

**Kapsam dışı:** ürün davranışı, `CLAUDE.md` ayıklaması (S13b), web yığını (S18), R8, migration.

**Kabul kriterleri (hepsi çıktısıyla gösterilir):**
- **K1:**
  - Çalışma `C:\dev\haftik`'te ve `git status` temiz; kanıt notunda son commit SHA'sı var.
  - `npx expo-doctor` tamamen yeşil.
  - Türkçe karakterli bir yolda `npm run android` çalıştırılınca assert betiği açık bir mesajla durur (el koşusu
    çıktısı ya da betiğin birim testi).
- **K2:**
  - `npm run verify`: typecheck 0 hata, lint 0 hata ve 0 kullanılmayan disable, testlerin tamamı geçer, `check:bundle`
    0 geçiş. Spike testleri silindiği için test sayısı düşer; fark açıklanır.
  - `policy.test.ts` yeşil. Ayrıca bir kez bilerek bozulur (ör. geçici bir `^`), kırmızıya döndüğü gösterilir, sonra
    geri alınır. Bu, testin gücünün kanıtıdır.
  - `jest`, `cross-env` olmadan çalıştırılınca ilk satırda açık bir TZ hatası verir.
- **K4:** yeni yolda debug derleme ile emülatörde duman testi:
  - Akış: onboarding → check-in → Hafta → dev menüsüyle Pazar 20:00 → kart → paylaşım seçicisi açılır.
  - Logcat'te FATAL = 0.
  - Kanıt başlığında commit SHA'sı yazılı.

**Efor ve sahip:**
- Efor: ~1-1,5 gün.
- Sahip: mobile-engineer; CI ve dependabot için devops-engineer.
- Bağımsız doğrulama: proje verifier'ı.

**Risk:** Expo yama yükseltmesi native farklılık getirebilir. Bu yüzden ayrı commit olarak yapılır; kırılırsa kilit
dosyası geri alınır (08 TB-4'teki geri dönüş yolu).

**İP-2 (paralel; A8 cevaplanınca başlar): Kritik-1 düzeltmesi (S15'in T1 kısmı, B seçeneği).**
- İş: saf `hasQualifiedWeekBefore` fonksiyonu + 3 çağıran (`week.tsx`, `open-card.ts`, `wiring.ts`) + `week-status-copy`'de
  "kart varsa" dalı. Efor ~0,75 gün.
- Kabul kriterleri:
  - 3 günlük ilk kart → Kapat → Hafta "Kartın açıldı." der ve dokununca kart açılır (K4 ekran görüntüsü; 09 #1'in tekrarı).
  - Rastgele check-in ve kart açma dizilerinde, bir kez açılmış bir hafta asla yeniden kilitlenmez (K2 özellik testi,
    ≥ 1000 dizi).
  - Mevcut testler **değiştirilmeden** yeşil kalır.
- Birleştirme: S13 birleştikten sonra rebase edilir.

---

## 6. Blokaj / kapı haritası

| # | Kapı | Kimde | Neyi bekletir | Neyi bekletmez | Kapıyı beklemeden hazırlık | En geç |
|---|---|---|---|---|---|---|
| 1 | Commit + uzak depo (F0-1/2) | Batuhan | S13 ve sonrasındaki her iş | Hazırlık belgeleri | — | Gün 0 |
| 2 | ASCII yola taşıma (F0-3, A1) | Batuhan | Güvenilir K4 kanıtı, worktree'ler, S13 | Kod yazımı (robocopy ile sürebilir, ama önerilmez) | Taşıma ertelenirse 28 §4.7'deki `sync-ascii.ps1` güvenlik betiği | Gün 0-1 |
| 3 | Karar paketi A | Batuhan | İlgili dilimler: A8 → T1 · A10 → S14 (v3) · A12/A13 → S15 · A16/A17 → S17 | S13'ün tamamı (A4 ve A5 dışında karar istemez) | Ö maddeleri tek onayla geçer | S14 başlangıcı |
| 4 | EAS hesabı, `eas init`, keystore yedeği | Batuhan | P1 (0.1.0) | Taban geliştirmesi; yerel release APK ile K4-rel | release-smoke betiği; parmak izi kayıt şablonu | S18 bitişi |
| 5 | P0 oturumu + F0-9 Story ölçümü | Batuhan (kişiler, telefon) | S19'un yerleşimi ve büyük yatırımı | Taban | v2 PNG materyali hazır | S19 başlangıcı (~hafta 3) |
| 6 | I-2 intent'i + security görüşü | Batuhan + security-reviewer | S21 | S19, S20, S22 | 21 §2a tasarımı hazır; security turu hemen yapılabilir | S21 başlangıcı |
| 7 | K10 geçici kararı + davet/rıza metni + G-02 ağ ölçümü (K5) | Batuhan | S1 smoke ve Dönem A davetleri | Geliştirmenin tamamı | 06 §8 ve 25 §3.3 metinleri hazır | P2 |
| 8 | Alan adı | Batuhan (satın alma) | Kalıcı damga URL'si ve politika URL'si (0.9.0) | 0.2.0 ("haftik" yeterli) | Marka, TÜRKPATENT ve Play ad taraması | 0.9.0 |
| 9 | Play hesabı (13 Kasım 2023 sorusu) + kimlik doğrulaması | Batuhan | 0.9.0 ve Play takvimi | APK denemesinin tamamı | Formlar, mağaza metni v2 (19 §5.2), mağaza görselleri (17 `magaza.html`) | Hesap şimdi açılırsa Play hazırlığı deneme sırasında biter |
| 10 | Canlı politika URL'si | Batuhan (+ K10) | Play (Console beyanları her kanal için), uygulama içi bağlantı | APK denemesi (Ayarlar'daki satır gizlenir) | Politika v2 metni (25 §3) | 0.9.0 |
| 11 | K10 hukuki görüşü | Batuhan + avukat | Play kapalı test (06 §8; 25 S-8) | APK denemesi (geçici kararla) | Soru dosyası (06 §7 + 25 ekleri); randevu şimdi alınabilir | 0.9.0; takvimin en uzun belirsiz kalemi |
| 12 | Intent I-1 (Albüm) | Batuhan | S25 | S24 | 13 §7; 18 ve 20'deki taslaklar | S25 başlangıcı |
| 13 | Apple üyeliği (K9) | Batuhan | iOS'un tamamı | v1.5 planının tamamı (Android-first) | — | Plan dışı |

**Özet:** 0.2.0'a kadar hiçbir hesap ya da hukuk kapısı kritik yolda değil. Kritik yolda Batuhan'dan beklenenler şunlar:
- F0-1..3 (commit, uzak depo, taşıma),
- karar paketi A,
- EAS hesabı,
- P0 oturumu.

K10, politika URL'si, alan adı ve Play hesabı yalnız Play yolunu (0.9.0) bekletir. Hazırlıkları şimdiden paralel yürür.

---

## 7. Doğrulanamayanlar ve devir

**Doğrulanamayanlar:**
- Bu belge için hiçbir komut çalıştırılmadı. İddiaların tamamı kaynak raporlardan (K1, ikinci el). Raporlardaki
  K4/K4-rel bulguları yeniden üretilmedi.
- Efor tahminleri K0. 21'in kalibrasyonu tek bir projenin verisine dayanıyor. Benim eklediğim işler (S17, S15 ve S16'ya
  eklenenler) kaba tahmin; architect doğrulamalı.
- Takvim Batuhan'ın haftalık kapasitesine bağlı ve bu kapasite bilinmiyor.
- Prototipler bu turda görülmedi. v2 onayının ikon finalini de kapsayıp kapsamadığı teyit edilmeli (B3).
- P0 ve K5 eşikleri 27'den alındı; n=6'da sonuç yalnız yönseldir.
- Şu bilgiler ikincil kaynaklardan (22, 26) geliyor; Console'da ya da cihazda doğrulanmalı: Play'in 13 Kasım 2023 kuralı,
  sideload doğrulama takvimi, Story güvenli alan değerleri.

**Devir:**
```
Durum:        bitti (öneri); kod/spec/plan/app.json değişmedi; yalnızca bu dosya yazıldı
Yapıldı:      26 belge okundu; 34 çelişki (12 kapandı ya da ekip içinde, 22'si Batuhan'a);
              S13-S25 + yeni S17 dilim planı, bitti kanıtları ve K seviyeleriyle;
              129 soru -> 52 karar (23 Ö, 29 O); ilk iş paketi (S13 + paralel Kritik-1); 13 kapı
Kanıt:        K1 (belge okuması); efor K0
Karar gerek:  Bölüm 4: önce A grubu (18 karar) ve F0 eylemleri
Sonraki:      Batuhan: F0-1..F0-9 + karar paketi A
              mobile-engineer (+ devops-engineer): İP-1 S13; A8 gelince İP-2 (Kritik-1)
              security-reviewer: 21 §2a çıkarım sızıntısı görüşü (S21 kapısı)
              software-architect: Ç15 (metric_counter ekleme biçimi); eklenen eforun doğrulanması; 21 v3 bölümünün güncellenmesi
              release-manager: 26'nın şema sütunu (Ç16); R-21..R-27'nin 26 §3'e eklenmesi
              copywriter / visual-designer / privacy-compliance-analyst / test-automation-engineer / data-analyst:
                bölüm 3.1'deki hazırlıklar
              project-coordinator: onaylar gelince S13-S25'i bitti kanıtlarıyla plan.md'ye işlemek
```

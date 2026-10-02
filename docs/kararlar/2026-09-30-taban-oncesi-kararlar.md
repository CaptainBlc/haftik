# 2026-09-30 — Taban öncesi kararlar (Karar A, Ö grubu)

Onaylayan: Batuhan. Kaynak: `docs/inceleme-2026-09-25/29-yol-haritasi.md` §4.A.
Durum: **kararlar kilitlendi.** Kod uygulaması henüz yapılmadı — Faz 0 (commit + `C:\dev\haftik`'e taşıma) bitince
ilgili S13-S18 dilimi içinde, testleriyle birlikte uygulanacak. Aşağıdaki her madde uygulandığında bu dosyaya
"Uygulandı: <tarih>, <commit/dilim>" notu düşülür.

## A5 — Node ve sürüm sabitleme
Node ≥24. SDK'ya (Expo 57) kilitli paketlerde `^`/`~` yerine tam sürüm. `.nvmrc` ve `package.json engines` eklenir.
Uygulanacağı dilim: **S13**. Kaynak: 28-muhendislik-standartlari-v2.md §4 S-4.

## A7 — Karar kaydı ve kilit dosyalar
Bu klasörün kendisi. Kilit dosya listesi yukarıda (`README.md`). Hotfix disiplini: acil bir düzeltme bu süreci
atlarsa, atlandığı gerekçesiyle birlikte buraya sonradan eklenir (sessiz istisna yok).
Uygulandı: 2026-09-30 (bu commit).

## A11 — Açık tema kilidi
v1.1'de yalnızca açık tema (`app.json` → `userInterfaceStyle: "light"`). Token tablosunda koyu sütun **tanımlı
kalır** (17-gorsel-sistem-v2.md'nin koyu tema çalışması atılmaz, yalnızca v1.1'de devreye alınmaz) — v1.2+'ta
ayrı, S boyutunda bir işle açılabilir.
Uygulanacağı dilim: **S16b**. Kaynak: 13-urun-vizyonu.md T6; 22-platform-v2.md S8.
**Uygulandı: 2026-10-02 (S16b).** `app.json` `userInterfaceStyle: "light"` (`expo-system-ui` zaten kurulu).
Koyu moddaki cihazda 3 ekranın emülatörde yeniden gözlemi (K4) ve Android 16 "genişletilmiş koyu tema"
etkileşimi (22 §5.2) hâlâ açık.

## A13 — Pazar'da çift bildirim
Kartın planlandığı Pazar günü `daily` (günlük hatırlatma) bildirimi **üretilmez**, yalnızca `card-ready`
planlanır. Spec S8 madde 5 bu şekilde güncellenir.
Uygulanacağı dilim: **S15**. Kaynak: 20-donus-dongusu-v2.md Q5; 22-platform-v2.md §4.1; 04-kod-incelemesi.md #11.
**Uygulandı: 2026-10-01 (S15).** `src/domain/notify-plan.ts` `planNotifications`: `state`/`sunday` döngüden
önce hesaplanıyor, `cardWillFireThisSunday && date === sunday` ise o gün `daily` atlanıyor. Etkilenen testler
güncellendi (`notify-plan.test.ts` C-08/C-12-13/C-19 — eskiden bu üç test tam da düzeltilen hatayı "doğru"
diye doğruluyordu, şimdi düzeltilmiş davranışı doğruluyor). `npm run verify`: 73 suite / 873 test yeşil.

## A14 — Seviye kelimeleri
- Uyku: kısa / orta / uzun
- Sosyal: sakin / orta / kalabalık
- (Hareket ve Harcama'nın mevcut kelimeleri — durgun/hafif/yoğun, az/orta/çok — değişmiyor.)
Uygulanacağı dilim: **S16a**. Kaynak: 19-metin-ve-icerik-v2.md §Q2; 02-icerik-metin-denetimi.md M-1.

## A15 — İçerik paketi
- Kullanıcıya dönük her yüzeyde **"Kart"** (karne değil): `src/`, `site/`, mağaza metni, bildirim, prototip bandı.
  "Karne" izin listesi boş başlar; mizah bağlamında istisna istenirse copywriter önerir, tek tek onaylanır.
  Tarihsel belgelere (PLAYBOOK, eski intent'ler) dokunulmaz.
- "Vites" imgesi yalnızca özet kovalarında (risingBig/fallingBig) kalır; unvan önerisi ve bildirim varyantı başka
  imgeye geçer.
- "Sayfa" sözcüğü kotalı kullanılabilir (varyantların yarısından azında), tek anlamı "sayfa = hafta".
- Mağaza/davet metninde "8 saniye" iddiası kronometreyle ölçülene kadar **"birkaç saniye"** olarak yazılır.
- Zamansızlaştırma: kart içeriğinde "bu hafta" gibi zaman zarfı kullanılmaz (kaçırılan haftada veya albümden
  paylaşımda yanlış olur); "HAFTANIN UNVANI" bandı zaman zarfı almaz.
- Gizli çıkartma alt yazısı: "bilerek saklandı" tonu.
Uygulanacağı dilim: **S16a**. Kaynak: 19-metin-ve-icerik-v2.md §Q1/Q3/Q4/Q8/Q9; 25-gizlilik-v2.md S-12;
23-buyume-ve-deneme.md Q7.

## A18 — R8 kapsamı
R8/shrink hem `preview` hem `production` profilinde denenir (`expo-build-properties`). Başarısız olursa 0.1.0
R8'siz çıkar, ama 0.2.0'dan önce mutlaka çözülür (22-platform-v2.md'deki serileştirme tuzağına dikkat). Material
Symbols fontunun kaldırılması isteğe bağlı, ayrı bir adım.
Uygulanacağı dilim: **S18**. Kaynak: 21-mimari-ve-efor.md S-7; 26-yayin-plani-v2.md S6; 28-muhendislik-standartlari-v2.md S-9.
**Uygulandı: 2026-10-02 (S18), R8 İLK DENEMEDE ÇALIŞTI.** `app.json` `expo-build-properties`
(`enableMinifyInReleaseBuilds` + `enableShrinkResourcesInReleaseBuilds`), `react-native-reanimated`
package.json'dan çıkarıldı + `react-native.config.js` ile native derlemeden dışlandı. Ek keep kuralı gerekmedi.
Release x86_64 APK **44,48 -> 31,98 MB** (hedef <= 40). Ayrıntı ve K4 sonuç tablosu:
`docs/muhendislik/arac-zinciri.md` "Release derlemesi ve R8 (S18)". Material Symbols ve `react-native-worklets`
kaldırılmadı (isteğe bağlı, ayrı adım; worklets `expo-modules-core` bağımlılığı).

---

## Bekleyen (O grubu, henüz cevaplanmadı)
A1, A2, A3, A4, A6, A8, A9, A10, A12, A16, A17 — bkz. `29-yol-haritasi.md` §4.A. Bunlar S13-S18'in bazı
maddelerinin önkoşulu; taban tam bitmeden hepsi cevaplanmalı.

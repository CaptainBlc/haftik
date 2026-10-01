# 21 — Mimari ve efor (software-architect, Principal, 2026-09-28)

> Kod, spec, plan, app.json değişmedi. Commit yok. Emülatör/derleme çalıştırılmadı: bu belgedeki bütün iddialar **K1**
> (kaynak ve `node_modules` okuma) ya da **K0** (çıkarım, bellek) düzeyindedir, satır sonunda belirtilir. Kararlar (C yönü,
> kategori rengi, seviye yeniden tasarımı, "Kart", R8, sıra) 16'dan alındı ve yeniden açılmadı.

## Özet

1. **Efor:** 13'teki 21-22 gün, bugünkü kararlarla **gerçekçi değil**. Bağımsız tahminim **medyan ~30 odaklı iş günü, güvenli
   aralık (P80) ~35, tam aralık 25-41**. Denemeye kadar olan kısım (F0 + Taban + Çekirdek + APK hazırlığı) **medyan ~24 gün
   (20-33)**, 13'te ~17 gün. Farkın dört kaynağı var: C yönü A'dan pahalı (+3), R8/paket temizliği tabana girdi (+1,25), K4
   doğrulama turları gerçekçi sayıldı (+1,5), paylaşım önizlemesi ve ikinci yapı biraz büyüdü (+1,5).
2. **Kritik-1 (`hasAnyPriorCard`):** Önerim sorgu yamasından fazlası. Eşiği karttan değil **check-in geçmişinden** türetiyorum
   ("3 günlük eşik yalnızca 3+ dolu günü olan ilk haftaya uygulanır"). Bu hâlde açılabilir bir hafta, bir kart açıldığı için bir
   daha kilitlenmez. Bu bir spec anlam değişikliği; karar Batuhan'ın (S-1).
3. **Paylaşım unvanı:** Ayrı bir seçici, **tipleriyle gizli kategorileri hiç göremeyecek** biçimde kurulur. Bu sayede
   varsayılan gizlemede unvanın okunur olması inşa gereği %100 olur. Sonuç `weekly_card`'a v4 migration ile üç sütun olarak
   dondurulur. **Yan bulgu (K1):** Bugünkü unvan kuralı gizli kategoriyi *çıkarımla* sızdırıyor (bölüm 2a). security-reviewer'a
   devredildi.
4. **C render tekniği:** Yeni native bağımlılık gerekmiyor. Sert gölge ofsetli bir `View` ile, noktalı zemin tek bir PNG ile,
   patlama rozeti PNG ile yapılır. **İki gerçek yakalama riski var (K1, view-shot kaynağı):** (i) PNG, yoğunluğa bağlı olarak
   büyütülüyor, yani kalın konturlar bulanıklaşır; (ii) çizim yazılım tuvalinde yapıldığı için `elevation`/`boxShadow`
   yakalanmayabilir. İkisinin de çaresi tasarımda.
5. Seviye gösterimi için **domain değişikliği gerekmiyor**. Seviye, dondurulmuş satır kimliğinden çözülüyor. Ancak satır kimliği
   biçimi bu yüzden **tek yönlü bir kapı** hâline geliyor.
6. Önerilen dilimler **S13-S25** (bölüm 3). Her dilimin bir "bitti kanıtı" ve K seviyesi var. En kritik önkoşul zinciri:
   T7 atomik migration → v3 → v4 paylaşım unvanı.

---

## 1. Efor tahmininin bağımsız doğrulaması

**Kalibrasyon kanıtı (K1, `CLAUDE.md` tarihleri):** S1-S10 kodu yaklaşık 2 takvim gününde yazıldı (09-22 → 09-23). Ertesi günkü
emülatör turu (09-24) ise 10'dan fazla platform hatası buldu (BLG-01, -03, -04, YB-1…). Bu projede **kod yazmak darboğaz değil**.
Darboğazlar K4 doğrulama turu (ASCII kopyaya senkron, yeniden derleme, dev menüsüyle zaman yolculuğu, ekran görüntüsü), Batuhan'ın
onay ve zevk turları ve platform sürprizleri. Bu yüzden tahmin "odaklı iş günü = kod + K4 + onay" olarak verildi. Platform ya da
görsel ağırlıklı kalemlere 1,5-2x, saf domain kalemlerine 1x uygulandı (ajan tanımındaki kalibrasyon).

| # | Kalem | 13 | Benim (medyan / aralık) | Farkın nedeni ve risk |
|---|---|---|---|---|
| F0 | Commit, ASCII yola taşıma (08 §6), 08 "şimdi" paketi, `.nvmrc`/`verify`, CLAUDE.md ayıklama | 0,5-1 | **1 / 0,75-1,5** | Taşıma ve yeniden `prebuild` 2 saat. Ayıklama yarım gün. Risk düşük |
| T1 | Kritik-1 (öneri B, 2f) | 0,5 | **0,75 / 0,5-1** | 3 çağıran + monotonluk özellik testi + K4 09#1 |
| T2 | Kaçırılan hafta girişi | 1 | **1 / 0,75-1,5** | Saf `findOpenableWeeks`. V6 bunu yeniden kullanır |
| T3 | Bildirim yönlendirme (+TB-10 `now` zorunlu) | 1,25 | **1,5 / 1,25-2** | Soğuk açılışta router hazır olma sorunu, eski planlı bildirimlerde `weekStart` yok. K4 için gerçek bildirimin tetiklenmesi gerekiyor. **Platform riski** |
| T4 | Damga | 0,25 | **0,1** | C kartında damga zaten yeniden çiziliyor, S19'a katıldı |
| T5 | İçerik mantık/yargı + "Kart" adlandırma taraması | 1 | **1,25 / 0,75-1,5** | Kodu küçük. Süreyi metin onay turu belirliyor |
| T6 | Açık temaya kilit | 0,1 | 0,1 | — |
| T7 | Atomik migration | 0,5 | **0,5 / 0,5-0,75** | Kesinti simülasyonu testi zaten 04'te yazıldı |
| T8 | Ölçüm tamamlama | 0,75 | **1 / 0,75-1,25** | **Gözden kaçmış:** `metric_event.name` CHECK kısıtı yeni olay adını reddediyor. SQLite CHECK'i değiştiremediği için tablo yeniden kurulmalı (v3, 2a) |
| T9 | Küçük akış hataları + hata geri bildirimi | 1 | **1 / 1-1,5** | — |
| T10 | **Yeni:** paylaşım dosyası erken silinmesi (04 #4): yaşa göre süpürme | 0 | **0,4 / 0,25-0,5** | K5 (WhatsApp) doğrulaması ayrıca gerekli |
| T11 | **Yeni:** R8 + shrink + reanimated/worklets/web + Material Symbols | 0 | **1,25 / 1-2** | Yalnız yapılandırma değişiyor. Maliyetin asıl kısmı release'te tam K4 matrisi (2g) |
| | **Taban toplamı (F0 dahil)** | ~6,5-7 | **~9,9 (8-14)** | |
| V1a | Kart v2 (C) + ikon/adaptive/splash/bildirim simgesi + "yapıştırma" reveal | 4 (V1) | **4,5 / 3,5-6** | Sticker ilkeli, dönme bütçesi testi, yakalama keskinliği, varlık üretimi. **En riskli kalem** (zevk turu) |
| V1b | Kabuk: 8 ekran + sekme ikonları + durumlar | (V1 içinde) | **2,5 / 2-3,5** | Kesmede ilk düşen |
| V2 | Paylaşım unvanı + önizleme = kart + şerit | 3,5 | **4 / 3,5-5** | v4 migration, özellik testleri, security turu |
| V3 | Kaydet anı | 1,5 | **1,5 / 1,25-2** | `expo-haptics` seçilirse native yeniden derleme |
| V4 | Örnek kart + minyatür | 1 | **1 / 0,75-1,5** | V1a'nın bileşenini yeniden kullanır |
| | **Çekirdek toplamı** | ~10 | **~13,5 (11-18)** | |
| P | Deneme APK'sı: versionCode (07 A4), preview derlemesi, Batuhan cihazında K5 duman testi | — | **0,75 / 0,5-1** | EAS hesabı Batuhan'da |
| V5 | İçerik derinliği + kıyas anlatısı | 2,5 | **3 / 2,5-3,5** | Yeni özet kovaları domain testleri ister |
| V6 | Karnelerim | 3 | **3,5 / 3-4,5** | Hafif küçük resim bileşeni, reveal atlama, `archive_opened` |
| | **İkinci yapı toplamı** | 5,5 | **~6,5 (5,5-8)** | |
| | **GENEL** | **21-22** | **~30 (25-41), P80 ~35** | |

**En riskli 4 kalem:** V1a (zevk ve yeniden iş döngüsü), T3 (soğuk açılış yönlendirmesi, gerçek bildirim), T11 (R8'in yansıma
kuralları: kırık bir yol ancak release'te görünür), V2 (security-reviewer turu, çıkarım sızıntısı tartışması).

**Çekirdeğin tek kişiyle sürdürülebilirliği.** C, bakımı en pahalı yön: eğik öğeler, 4 kategori tonu, her çıkartmanın normal ve
gizli hâli. Maliyeti sabit tutmak için dört kural öneriyorum:

1. Bütün süsler ya **statik PNG** ya da **düz `View`**. SVG veya gradyan kütüphanesi yok.
2. Dönme, ofset ve renk değerleri tek bir `card/tokens.ts` tablosunda. Ekran kodunda sihirli sayı yok.
3. `layout.test.ts` her çıkartmanın **döndürülmüş köşelerinin** 360x640 içinde ve 8 dp güvenli payda kaldığını hesaplar.
4. Yalnızca `__DEV__`'de açılan bir **kart fikstür galerisi** (6 stres kartı: en uzun unvan, hepsi gizli, hepsi düşük, eski kart
   ve paylaşım unvanı boş, 3 günlük ilk kart, 7/7). Görsel QA dakikalara iner. 0,5 gün, S19'un içinde.

Bu dört kural uygulanırsa yeni bir içerik ya da stil değişikliği tek dosyaya dokunur. Uygulanmazsa her görsel düzeltme 3-5 dosyaya
ve bir K4 turuna yayılır (K0).

**Denemeyi 20 günde tutmak istenirse (kesme sırası):** önce V1b kısaltılır (yalnızca token, font ve sekme ikonları kalır, -1,5),
sonra V4'teki onboarding örneği çıkarılır (minyatür kalır, -0,5), sonra T8 bölünür (yalnızca izin durumu ve ilk kart gün numarası
kalır, -0,5). R8 bu listede yok, çünkü taban kararı.

---

## 2. Teknik tasarımlar

### 2a. Paylaşım unvanı (V2) ve migration disiplini

**Bugünkü sızıntı (K1, `titles.ts:96-101, 305-314`, `title-visibility.ts`).** Kural "unvan, gizlenen kategoriden
*türetilmez*" diyor. `basedOnCategories` üzerinden harfiyen uygulanıyor, ama unvan **gizli kategoriyi çıkarımla** ele veriyor:

- `title.basic.spending.X`, `basicTitleRule`'daki sabit öncelik yüzünden "hareket = orta **ve uyku = orta**" demektir. Uyku gizli
  olduğu hâlde unvan görünür kalır.
- `title.basic.social.X` üç kategorinin de orta olduğunu söyler. Varsayılan gizlemede (uyku + harcama) iki gizli kategorinin
  seviyesini açık eder.
- `allFourMedium` (`basedOnCategories: []`) her zaman görünür ve dört kategorinin de orta olduğunu söyler.
- Hiçbir kombinasyon kuralının eşleşmemesi de bilgi taşır (örneğin `basic.movement.high`, "uyku düşük değil" demektir).

Sızan en kötü bilgi "orta" seviyesi, yani etkisi sınırlı. Ama bu bir gizlilik sözünün mekanik ihlali. **security-reviewer'a
devredildi.** Aynı sınıf özet cümlesinde de var: özet dört deltadan türüyor ve gizli kategorilerin yönünü toplu olarak yansıtıyor
(02 §2.5 ile aynı).

**Tasarım: yapısal girişim-sızmazlık (non-interference).**

```ts
// domain/share-title.ts  (saf)
export const SHARE_SCOPE = ['movement', 'social'] as const;   // = CATEGORIES − varsayılan gizli
type ScopeCat = (typeof SHARE_SCOPE)[number];
export function selectShareTitle(p: {
  levels: Record<ScopeCat, Level>;          // tip gereği uyku/harcamayı GÖREMEZ
  deltas: Record<ScopeCat, Delta>;
  checkinDays: number;
  prevShareTitleId: string | null;
}): TitleResult & { scope: Category[] }
```

- **Kapsam:** 9 seviye kombinasyonu × gün sayısı. Havuzda mevcut metinler kullanılabilir: `movementSocialBothHigh/Low`,
  `basic.movement.*`, `basic.social.*`. Bunların içinde 04'ün "hiç üretilmiyor" dediği dört `basic.*.medium` unvanı da var, yani
  ölü içerik yeniden işe yarar. Üstüne copywriter'dan `share.*` varyantları eklenir. Okunur unvan oranı varsayılan gizlemede
  **tasarım gereği %100** (hedef ≥ %90).
- **Görüntü kuralı** tek fonksiyonda toplanır, `CardView` ve önizleme aynı fonksiyonu çağırır (bugün iki yerde
  `shouldHideTitle` var): `resolveVisibleTitle(snapshot, hidden)`.
  - `hidden` boşsa → asıl unvan.
  - `hidden`, paylaşım unvanının kapsamıyla kesişmiyorsa → paylaşım unvanı.
  - Diğer durumlarda → **sansür şeridi**, metin render ağacına girmez.

  Katı hâliyle, bir kategori bile gizliyken asıl unvan **hiç** gösterilmez; yukarıdaki çıkarım sızıntısı da böylece kapanır.
  Gevşek seçenek (bugünkü `basedOnCategories` kuralını korumak) sızıntıyı sürdürür. S-2 sorusu.
- **Testler (K2):**
  - Özellik testi: 81 kombinasyon × 3-7 gün × delta durumları için uyku ve harcama değiştirildiğinde paylaşım unvanı **değişmez**.
    Bu, non-interference'ın mekanik kanıtıdır.
  - 16 gizleme alt kümesinin hepsinde `resolveVisibleTitle` kuralı sağlanır.
  - Sayım betiği varsayılan gizlemede %100 verir.
- **Şema (v4):** `ALTER TABLE weekly_card ADD COLUMN share_title_id TEXT; … share_title_text TEXT; … share_title_scope TEXT;`
  Son sütun JSON tutar. Üçü de NULL olabilir. Eski kartlarda değer NULL'dır ve şerit gösterilir.
  - **Geriye doldurma yapılmaz:** dondurulmuş kart değişmez. Harici kullanıcı olmadığı için maliyet yok (S-3).
  - `CardSnapshot.shareTitle: (TitleResult & {scope}) | null` eklenir, `CONTENT_VERSION` artar.
  - Kapsam kartla birlikte saklanır. İleride varsayılan gizleme değişirse eski kartlar kendi kuralıyla doğru çizilir.
- **Dondurma garantisi korunur:** iki unvan da `buildCard` anında seçilir. Render hiçbir şeyi yeniden çözümlemez.

**Migration disiplini (T7 + v3 + v4):**

```ts
for (const m of pending) {
  driver.exec('BEGIN IMMEDIATE;');
  try { m.up(driver); driver.setUserVersion(m.version); driver.exec('COMMIT;'); }
  catch (e) { try { driver.exec('ROLLBACK;'); } catch {} throw e; }
}
```

- SQLite'ta DDL işlemseldir. `user_version` başlık sayfasında durduğu için onun da işlem içinde geri alınması beklenir, ama bu
  **K0**'dır ve 04'ün `node:sqlite` kesinti testiyle kanıtlanmalıdır. Migration'ın içinde `BEGIN`/`COMMIT` yasaktır (meta-test).
- **v3 = `metric_event` yeniden kurulumu.** Adımlar: yeni tablo (CHECK listesinde T8 adları ve `archive_opened` önceden yer alır)
  → `INSERT … SELECT` → `DROP` → `RENAME`. Test: yeniden kurulumdan sonra eklenen satırın id'si eski en büyük id'den büyük olmalı
  (AUTOINCREMENT dizisi, K0).
- **v4 = paylaşım unvanı sütunları.** v2 numarası yakılmış kalır (TB-1).
- **Yükseltme fikstürü:** `__tests__/fixtures/db-v2.sql` (bugünkü şema + örnek veri). Her yeni migration "v2 fikstürü → en son
  sürüm → round-trip" testinden geçer. K4 karşılığı: eski APK kurulu → veri gir → yeni APK'yı üstüne kur. **Aynı imza anahtarı
  gerekir:** yerel debug imzası ile EAS imzası birbirinin üstüne kurulamaz.
- **Açılışta hata durumu:** migration fırlatırsa bugün render çöküyor (`_layout.tsx:33`). Kök `ErrorBoundary` şu ekranı gösterir:
  "Veriler güncellenemedi · Tekrar dene · (onaylı) Verileri silip baştan başla".

### 2b. Kart v2 (C) render tekniği

| Öğe | Teknik | Yeni bağımlılık |
|---|---|---|
| Mor zemin + 13 px nokta ızgarası + üst ışık | **Tek PNG** (1080×1920, varlık), `Image` `absoluteFill`. Döşeme (`resizeMode="repeat"`) ölçekleme sırasında örtüşme (aliasing) riski taşır | yok |
| Kalın kontur | `borderWidth: 2.5`, `borderColor: ink`, `borderRadius` | yok |
| **Sert gölge** | `<Sticker>` ilkeli: döndürülen dış `View` içinde ofsetli (4-5 dp) mürekkep dolgulu bir `View` ve üstünde yüz `View`'u. Gölge çıkartmayla birlikte döner. **`elevation`/`shadow*`/`boxShadow` kartta yasak** (aşağıda R2) | yok |
| Eğik yapıştırma | `transform: [{rotate}]`, değerler `tokens.ts`'te. Döndürülmüş kutu bütçe testi (bölüm 1) | yok |
| Gizli "arka kâğıt" | Kesik kontur (`borderStyle: 'dashed'`) + çizgili doku PNG'si, `overflow: hidden` ile kırpılır. Android'de kesik çizgi ile köşe yarıçapının birlikte çizimi K4'te görülmeli | yok |
| Patlama rozeti (HAFTİK), kıvılcım, kilit | **PNG @3x/@4x** (veri taşımayan marka varlığı). Kaynak 14'teki SVG'ler | yok |
| Konuşma balonu kuyruğu | 45° döndürülmüş kare, iki kenar çizgili (`View`) | yok |
| Kategori tonu | Kategori başına 4 açık yüz rengi. Mürekkep metinle kontrast ≥ 4,5 (K2 kontrast testi). **Seviyeye bağlı değil.** Gizli satır ton almaz, nötr arka kâğıtla çizilir | yok |
| Fontlar | `@expo-google-fonts/baloo-2` (800, 700; alt yol importu). Inter 400/700 kalır. **C'de italik yok:** Inter italic (346 KB) çıkar, net boyut etkisi yaklaşık sıfır (K0, ölçülmeli) | **1 paket** (statik ttf; ağ kontrolü kurulumda kaynak okunarak yapılır) |

**`react-native-svg` / `expo-linear-gradient` gerekli değil.** SVG'nin tek artısı her yoğunlukta keskinlik ve dinamik metin. Aynı
keskinlik R1 çaresiyle PNG'ye de gelir. SVG native bir modül, bir R8 kural yüzeyi ve view-shot ile uyumu test edilmesi gereken bir
katman ekler (K0). Karar noktası: ikon sayısı 10'u geçerse ya da unvanda eğri yol üstünde metin istenirse yeniden açılır.
`expo-blur` kartta kullanılmaz.

**View-shot yakalama riskleri (kaynak: `node_modules/react-native-view-shot/android/.../ViewShot.java`):**

- **R1 Yoğunluğa bağlı bulanıklık (K1, `:611-663, :800-801`).** Görünüm kendi piksel boyutunda çiziliyor, sonra
  `createScaledBitmap` ile 1080×1920'ye ölçekleniyor. 2,625x yoğunluklu bir cihazda 945 px → 1080 px (×1,14), 2,0x cihazda
  720 px → 1080 px (×1,5) büyütme var. Kalın konturlar ve metin yumuşar. Bugünkü beyaz kartta fark edilmiyordu, C'nin sert
  kenarlarında görünür olur.
  - **Çare:** yakalanan kök, `1080 / PixelRatio.get()` dp genişliğinde bir sarmalayıcı olur. İçindeki `CardView`'e
    `scale = 1080 / (360 · PixelRatio)` dönüşümü, sol-üst köken telafisiyle uygulanır. Ebeveyn `draw()` çocuğu matrisle çizdiği
    için metin ve kenarlar hedef çözünürlükte rasterleşir (K0: Android yazılım tuvali davranışı).
  - PNG varlıklar @4x verilir.
  - **K4 kanıtı:** 2,0x ve 2,625x emülatörde PNG'de kontur kenarının piksel profili.
- **R2 Yazılım tuvali (K1, `:367, :582-600`).** Yakalama bitmap destekli bir `Canvas` üstünde yapılıyor, yarı saydam gruplar
  yazılım katmanına zorlanıyor. `elevation` gölgesi donanım RenderNode'unda çizildiği için PNG'de büyük olasılıkla çıkmaz. RN'in
  `boxShadow` stilinin yazılım tuvalinde çizilip çizilmediği bilinmiyor (K0). Çare zaten tabloda: gölge = ofsetli `View`.
  Bölüm opaklığı (`sectionOpacity`) yakalama örneğinde 1 kalmalı (bugün öyle).
- **R3 Görsel yükleme zamanlaması (K0).** Zemin ve rozet PNG'leri kod çözülmeden yakalanırsa katman eksik çıkar.
  - "Bu haliyle paylaş" düğmesi, kart görsellerinin hepsinden `onLoadEnd` gelene kadar pasif kalır (sayaç).
  - Yakalamadan sonra bir güvence daha: PNG boyutu, bilinen boş-zemin eşiğinden büyük olmalı.
- **R4 Kenar kırpması.** Döndürülen öğeler 360×640 dışına taşarsa kırpılır. Önlem: bölüm 1'deki bütçe testi.
- **R5 Dosya boyutu ve yeniden sıkıştırma (K0).** Nokta dokusu ve renkler PNG'yi bugünkü 176 KB'ın birkaç katına çıkarabilir.
  WhatsApp ve Story JPEG'e çevirir; nokta ızgarasında hare (moiré) oluşabilir. K5 hedef testi (07 A15) bu maddeyi de kapsar.

**Boyut ve R8 etkisi:** Yeni native kod yok. Artışlar PNG varlıklar (tahminen 100-300 KB, K0) ve Baloo 2. Çıkan İnter italic ve
Material Symbols (967 KB, 12 §1.4) bunu fazlasıyla karşılar. R8 kuralı gerektiren yeni bir şey eklenmiyor.

### 2c. Karnelerim (V6) veri modeli ve sorgu maliyeti

- **Şema değişikliği yok.** `weekly_card` zaten tam anlık görüntü ve `week_start TEXT PRIMARY KEY` örtük dizin sağlıyor.
- **Liste sorgusu:** `SELECT week_start, title_text, share_title_text, line_*_id, checkin_days FROM weekly_card ORDER BY
  week_start DESC`. Yılda en fazla 52 satır, tek sorgu, O(n). Ölçülmedi ama milisaniye altı olması beklenir (K0).
- **"Açılmayı bekleyen" haftalar:** T2'nin saf `findOpenableWeeks({checkins, cardWeekStarts, now})` fonksiyonu. Tüm
  `checkin.local_date` değerleri okunur (yılda ≤ 366 satır) ve haftalara domain'de gruplanır. **SQL'de hafta aritmetiği
  yapılmaz**, çünkü tarih mantığının tek kaynağı `week.ts`. Birikim sayısı ("12. kartın") = liste uzunluğu, ayrı sorgu gerekmez.
- **Küçük resim:** listede tam `CardView` çizilmez (kart başına ~40+ native görünüm ve görseller). Hafif bir `CardThumb`
  kullanılır: unvan çıkartması, 4 emoji rozeti, ~10 görünüm. `FlatList` ile. Küçük resim K-10 kararına uyar (kart ekranıyla aynı
  içerik).
- **Yeniden açma:** `card/[weekStart]?from=archive` parametresi doğrulanır. Reveal atlanır, statik kart gösterilir, paylaşım
  aynı varsayılan gizlemeyle yapılır.
- **Ölçüm:** `archive_opened` için v3 zaten hazır olur.
- **Silme yolu:** yeni kalıcı iz yok. Mevcut 4 tablo silmesi yeterli.

### 2d. Kaydet mikro-anı (V3)

- **Senkron tek uçuş koruması:** paylaşılan `useSingleFlight` hook'u (M-9), `today.tsx` ve önizleme birlikte kullanır.
- **Başarı durumu:** `savedToken` state'i → `SaveConfirmation` bileşeni. `useNativeDriver` ile opaklık ve ölçek, ~1,2 sn.
  Düğme sırası: "Kaydet" → "✓ Kaydedildi" → "Güncelle". Azaltılmış hareket ayarı açıksa (`AccessibilityInfo`) tek opaklık geçişi.
- **İlerleme cümlesi:** saf `domain/progress-line.ts`, `(filledDays, requiredDays, isSunday, prevLineId) → LineResult`.
  Eşik bilgisi T1'in yeni kuralından gelir (**önkoşul T1**). Son cümle kimliği
  `setting.last_progress_line_id`'de tutulur; silme yolu zaten `setting` tablosunu boşaltıyor.
- **Haptik (isteğe bağlı, S-5):** `expo-haptics`. Ağ yok, `VIBRATE` izni manifestte zaten var (12 §5.5). Yeni native modül
  olduğu için R8 duman testi tekrarlanır.
- **Bildirim metin havuzu:** `notify-plan` gün indeksine göre deterministik seçer. Metinde veri yok.
- **Test:** sahte zamanlayıcıyla K2 (onay görünür, ikinci dokunuş yutulur, `check_in_saved` bir kez sayılır). K4: Kaydet'ten
  0,4 sn sonraki karede onay görünür (12 §3.2 ölçüm yöntemiyle).

### 2e. Seviye gösterimi: domain değişikliği gerekli mi?

**Hayır (K1).** Seviye, dondurulmuş `line.<kategori>.<seviye>.<n>` kimliğinden çözülüyor (`card/line-level.ts`). `CardSnapshot`
ve şema değişmez. Değişiklik yalnızca üç yerde:

1. Sunum: `card/level-mark.tsx`. Doluluk, boyut ya da şekil; renk tek başına anlam taşımaz.
2. İçerik: kategoriye özgü seviye sözcükleri (uyku kısa/orta/uzun). Bu T5'in işi ve `constants/emoji.ts` etiket tablosunda.
3. Erişilebilirlik: `accessibilityLabel` sözcüğü taşır.

**Tek yönlü kapı uyarısı:** satır kimliği biçimi artık eski kartların görselini belirleyen kalıcı bir sözleşme. V5'te kimlik
biçimi değişirse eski kartların seviyesi çözülemez ve `levelFromLineId` hata fırlatır. Kural: kimlik biçimi dondurulur. Test:
havuzdaki bütün kimlikler ve v2 fikstüründeki kimlikler ayrıştırılabilmeli. **Gizli satırda `LevelMark` render edilmez**
(render ağacı testi).

### 2f. Kırık üç yol ve Kritik-1

**Kök neden (K1, 04 #1 teyit):** `hasAnyPriorCard()` (`card-repo.ts:135`) haftanın **kendi** kartını da sayıyor. Kart
dondurulunca eşik 3'ten 4'e çıkıyor ve `unlocked` false'a dönüyor. Daha derindeki kusur şu: **uygunluk, kullanıcının bir
eylemiyle geriye doğru değişebiliyor.** Aynı sınıfın ikinci örneği `open-card.ts:94`.

| Seçenek | Kural | Artı | Eksi |
|---|---|---|---|
| A | `hasCardBefore(ws)`: `week_start < ?` | 1 satır, spec'e harfiyen uyar | Kilit hâlâ eyleme bağlı. İki "3 günlük" hafta açılmadan beklerken önce eskisi açılırsa yenisi yeniden kilitlenir (nadir) |
| **B (öneri)** | **Eşik, check-in geçmişinden türetilir:** `requiredDays = 3` yalnızca 3+ dolu günü olan **ilk** haftada, sonrasında 4. Saf `hasQualifiedWeekBefore(dates, ws)` | Kart açmak hiçbir haftanın durumunu değiştirmez. Uygunluk artık kartlara bağlı değil, bildirim planı da aynı fonksiyonu kullanır. Geçmiş haftalar "Dün" düzenlemesi dışında değişmez, yani özellik testi kurulabilir | Spec anlamı "ilk kart" → "ilk nitelikli hafta" olur. `getWeekState` imzası değişir (belgelenmiş sapma) |

B için gereken değişiklikler: `getWeekState({…, hasQualifiedWeekBefore})`, üç çağıran (`week.tsx`, `open-card.ts`, `wiring.ts`)
ve veri tarafında `SELECT local_date FROM checkin WHERE local_date < ?`. Buna ek olarak `week-status-copy`'de "kart varsa önce
'Kartın açıldı'" dalı, anahtar hangi seçenek seçilirse seçilsin kalır.

**Monotonluk özellik testi (K2):** rastgele check-in ve kart açma dizilerinde, bir kez `unlocked` olmuş hafta asla yeniden
kilitlenmez. Bu test Kritik-1'i yakalardı.

**T2, kaçırılan hafta:** Hafta ekranı `findOpenableWeeks`'in en yeni sonucunu "Geçen haftanın kartı seni bekliyor" çıkartmasıyla
gösterir. Rota mevcut `card/[weekStart]`, uygunluğu `openOrBuildCard` kendisi doğrular.

**T3, bildirim yönlendirmesi:**

1. `scheduler.ts:140` bugün yalnızca `data: {kind}` koyuyor. `card-ready` için `weekStart` de eklenir (plan öğesinde zaten var).
2. Kökte `useNotificationRouting()`:
   - Açılışta `getLastNotificationResponse()`, sonra `addNotificationResponseReceivedListener` (ikisi de SDK 57 d.ts'inde var, K1).
   - Her yanıt bir kez işlenir; işlendikten sonra `clearLastNotificationResponse()` çağrılır.
   - Yönlendirme, router hazır olduktan sonra yapılır (`useRootNavigationState().key`, K0).
3. Bildirim verisi bir dış girdi sayılır:
   - `kind` izin listesinde olmalı, `weekStart` için `isValidWeekStartParam` çalışır.
   - `daily` → `/today`, `card-ready` → `/card/<ws>`.
   - **Güncellemeden önce planlanmış bildirimlerde `weekStart` yoktur** → `/week` açılır; T2 kartı zaten gösterir.
4. **Önkoşul TB-10:** `openOrBuildCard(weekStart, now)`, `now` zorunlu olur (08 M-3).
5. **K4:** sıcak ve soğuk açılış (`am force-stop` sonra bildirime dokunma). Bildirim ya gerçek saat penceresinde ya da hatırlatma
   saati +2 dk'ya alınarak tetiklenir.

### 2g. R8/shrink ve paket temizliği (T11)

**Ne yapılır:**

- `expo-build-properties` eklenir: yalnızca derleme zamanı çalışan bir config plugin, çalışma zamanında kodu yok. Küçültme ve
  kaynak küçültme açılır. Anahtar adları kurulumda paket belgesinden doğrulanmalı (K0). 12'deki gradle bayrakları da bunu
  destekliyor.
- `react-native-reanimated` + `react-native-worklets` kaldırılır (src'de kullanımı 0, expo-router'da optional peer, 08 Ç-6).
  `react-dom` + `react-native-web` + web bloğu + css-mock kaldırılır (TB-3; APK kazancı 0 ama yüzey küçülür).
- Material Symbols için `metro.config.js`'te Android'e özel bir resolver, `expo-symbols`'u boş modüle yönlendirir.
- `gesture-handler` **kalır**.

**Beklenen kazanım:** R8 ile -9,4 MB (ölçüldü, 12), reanimated/worklets ile ~1,5-2,5 MB (tahmin), font ile 0,97 MB.

**Riskler:**

- R8 yansıma kuralları: Expo modules, expo-notifications, expo-sqlite ve view-shot'ın tüketici kurallarına güveniliyor (K0).
- Material Symbols resolver'ı: expo-router, `native-tabs`'ı açılışta değerlendirirse boş modül çöker. Geri dönüş: resolver'ı
  kaldırmak.
- Çökme raporu olmadığı için bir testçinin ilettiği yığın izi ancak `mapping.txt` ile okunur. EAS artefaktı saklanmalı.

**Test planı (release + R8, K4; tam liste 12 §8 ve 09):**

1. Soğuk açılış ve onboarding. Android 13+ izin diyaloğu ve `canAskAgain` dalı.
2. `dumpsys alarm` 7 kayıt gösterir. Hatırlatma +2 dk'ya alınır ve bildirim gelir.
3. Cihaz ayarından elle Pazar 20:05'e geçilir (release'te dev menüsü yok, root gerekmez). Kart açılır, reveal, önizleme,
   paylaşım (Dosyalar/Mesajlar hedefi).
4. Deep link, bildirimden kart (T3), "Tüm verilerimi sil", rapor paylaşımı.
5. Öldür ve yeniden aç: veri kalıcı mı.
6. **Yükseltme:** önceki APK'nın üstüne kurulum, migration v3/v4.
7. `logcat` içinde `ClassNotFound|NoSuchMethod|NoSuchField` sayısı 0.
8. `aapt2 dump permissions` karşılaştırması. APK boyutu, `expo export`'ta Material Symbols 0 bayt.

Yeni bir native bağımlılık eklendiğinde (haptik, Baloo 2 değil) 1-3. adımlar tekrarlanır.

---

## 3. Bağımlılık ve sıra grafiği, dilim listesi

```
S13 Hijyen ──┬─> S14 Veri ──┬─> S15 Yollar ──> S16 İçerik+pürüz ──> S18 R8/boyut ══> [preview APK #1, Batuhan K5]
             │   (T7,v3,     │   (T1 B,T2,T3)   (T5,T6,T9,T10,T8)      (T11)
             │    TB-10)     └────────────────────────────────────────┐
             └─> S19 Kart v2 (C) ──┬─> S20 Kimlik+reveal ─┐            │
                                   ├─> S21 Paylaşım anı (v4) <─────────┘ (T7 şart; intent I-2 + security)
                                   └─> S23 Kabuk + ilk değer (V1b,V4)
                 S15 ─────────────────> S22 Günlük an (T1 eşiği) ══> [preview APK #2 → deneme]
                 S15(T2) + S19 ───────> S25 Karnelerim (intent I-1)
                 S16(T5) ─────────────> S24 İçerik derinliği
```

**Paralellik (08 kuralına göre en fazla 2 worktree):** S16 (içerik, `tr.ts`) ile S14 (veri) birbirinin dosyasına dokunmaz. Aynı
şekilde S19 (`card/`) ile S22 (`today`, `checkin-form`). S21 ve S19 aynı `CardView`'e dokunduğu için sırayla yapılır.

| Dilim | İçerik | Efor | Bitti kanıtı | K |
|---|---|---|---|---|
| **S13** Hijyen | Commit, `C:\dev\haftik` taşıma, 08 "şimdi" paketi (TB-2/4/6/7/8/23), `.nvmrc`/`engines`/`verify`, CLAUDE.md ayıklama, `assert-ascii-path` | 1 | `npm run verify` çıktısı, `expo-doctor` hepsi yeşil, yeni yolda emülatör duman testi | K2+K4 |
| **S14** Veri sağlamlığı | T7 atomik migration, v3 `metric_event` yeniden kurulumu, TB-10 `now` zorunlu, v2 yükseltme fikstürü, kök `ErrorBoundary` | 1,25 | Kesinti simülasyonu: 2. açılış temiz. Fikstür → v3 round-trip. Id sürekliliği testi | K2 (+K4 yükseltme) |
| **S15** Yollar | T1 (B), T2, T3 | 3,25 | Monotonluk özellik testi. 09 #1, #2, #5 senaryoları GEÇER (sıcak ve soğuk). Bildirim verisi doğrulama testi | K2+K4 |
| **S16** İçerik ve pürüz | T5 + "Kart" taraması, T6, T9, T10, T8 | 3,75 | İçerik testleri, rapor yasak desen testi, Batuhan metin onayı, koyu mod ayarında 3 ekran, önizleme "< Geri" | K2+K4 |
| **S18** Boyut | T11 | 1,25 | 2g matrisi. APK önce/sonra (≤ 40 MB x86_64). Material Symbols 0 bayt. `logcat` temiz | K4 (release) |
| — | **Preview APK #1**: Batuhan kendi telefonunda bir hafta | 0,5 | Pazar kartı gerçek cihazda açılır ve paylaşılır | K5 (n=1) |
| **S19** Kart v2 | Token, Baloo 2, `<Sticker>`, `CardView` v2, `LevelMark`, kategori tonu, gizli arka kâğıt, R1 yakalama keskinliği, R3 yükleme kapısı, fikstür galerisi, dönme bütçesi testi, `kart-yerlesimi.md` | 3 | Kontrast ve bütçe testleri. 3 ekran boyutunda 6 fikstürün PNG'si. 2,0x/2,625x kontur profili. **`layout.test.ts` değişikliği Batuhan onaylı** | K2+K4 |
| **S20** Kimlik ve reveal | İkon, adaptive, monochrome, splash, bildirim küçük simgesi, "yapıştırma" reveal, azaltılmış hareket, (haptik) | 1,5 | 48 dp başlatıcı ekran görüntüsü, gri kare yok. Azaltılmış harekette tek geçiş | K4 (+K5 akıcılık) |
| **S21** Paylaşım anı | 2a tamamı: v4, seçici, `resolveVisibleTitle`, şerit, önizleme = küçültülmüş kart | 4 | Non-interference özellik testi, %100 sayım çıktısı, v4 round-trip, security-reviewer'da açık Important kalmamış olmalı. WhatsApp/Story görünümü | K2+K4+K5 |
| **S22** Günlük an | 2d | 1,5 | 0,4 sn karesinde onay görünür. Tek uçuş testi | K2+K4 |
| **S23** Kabuk + ilk değer | V1b, V4 | 3,5 | 8 ekran × 411x914 + küçük ekran + yazı ölçeği 2,0. Örnek kart hiçbir repo çağırmaz | K2+K4 |
| — | **Preview APK #2** (versionCode artar) → deneme | 0,25 | Yükseltme kurulumu veri kaybetmez | K5 |
| **S24** İçerik derinliği | V5 | 3 | 12 haftalık simülasyon tekrar testi, `CONTENT_VERSION` 3 | K2 |
| **S25** Karnelerim | 2c | 3,5 | Gerçek SQLite: yalnız dondurulmuş ve uygun haftalar listelenir, silme sonrası boş. Dev menüsüyle 4 haftalık senaryo | K2+K4 |

S17 numarası bilerek boş bırakıldı; T8, S16'nın içinde. Dilim toplamı ~31 gün: bölüm 1'deki medyan (~30,6) ile S14'e eklenen
yükseltme fikstürü ve `ErrorBoundary` için +0,75 gün.

---

## 4. Teknik borç ve "profesyonel yazılım" tespitleri

08'deki TB-1..23 ve M-1..12 **tamamen geçerli**, burada tekrarlanmıyor. Aşağıdakiler ek bulgular ya da 08'e mimari açıdan
getirdiğim öncelik.

| # | Tespit | Kanıt | Öneri | Ne zaman |
|---|---|---|---|---|
| P-1 | **Gizli kategori çıkarım sızıntısı** (unvan ve özet) | 2a, K1 | Non-interference ilkesi ve özellik testi; kural spec güvenlik gereksinimi 3'e yazılır | S21 |
| P-2 | **CHECK kısıtları "değiştirilemez kapı":** `metric_event.name` listesi her yeni olayda tablo yeniden kurulumu ister | `migrations.ts:83-85` | v3'te gelecekteki olay adları önceden eklenir. Kural: yeni CHECK yazmadan önce "bu küme büyüyecek mi" sorusu | S14 |
| P-3 | **Migration yükseltme testi yok.** Bugünkü testler her zaman boş veritabanıyla başlıyor | `db.ts:116-121` | Sürüm başına SQL fikstürü + yükseltme testi. K4'te APK-üstüne-APK kurulumu (aynı anahtarla) | S14 |
| P-4 | **Hata sınırı yok.** Migration ve `getCard` JSON hatasında çökme ya da sonsuz yükleme | 04 #7, `_layout.tsx:33` | expo-router'da rota başına `ErrorBoundary` dışa aktarımı: kök ve kart rotası. Türkçe, veri içermeyen metin | S14 |
| P-5 | **Silinen veri dosyada kalabilir (K0).** `DELETE` sayfaları sıfırlamaz. WAL ve serbest sayfalarda adli kurtarma mümkün | `delete-all.ts:41-48` | Silmeden sonra `VACUUM` (ya da `PRAGMA secure_delete=ON`). expo-sqlite günlük modu doğrulanmalı. Gizlilik sözünün kanıtı → security-reviewer | S16 |
| P-6 | **Satır kimliği biçimi sessiz bir sözleşme** | 2e | Biçim dondurulur, ayrıştırma testi eklenir | S19 |
| P-7 | **Sürüm görünürlüğü:** testçi hata bildirdiğinde "hangi APK?" sorusunun cevabı yok | 08 §5.5 | Ayarlar'da `version (versionCode)`. Aynı bilgi deneme raporuna da girer; kimlik değil, security onayıyla | S16 |
| P-8 | **Şema ↔ domain eşleme tablosu spec'te yok** (ekibin dersi, `weekly_card` ek sütunları) | CLAUDE.md MOB/S5 | `spec.md` Veri modeli'ne `CardSnapshot` alanı → sütun tablosu. v4 ile birlikte güncellenir | S21 |
| P-9 | **Görsel regresyon yalnızca göz kontrolüne bağlı** | — | Fikstür galerisi + `adb screencap` ile referans PNG'ler (test-automation-engineer, Maestro akışı). Jest'te native render olmadığı için K4 düzeyinde | S19'dan sonra |
| P-10 | **CI yok, remote yok** (08 §5.3) | `.git/config` | Remote açılana kadar `npm run verify` her commit öncesi zorunlu. Remote açılınca 08'deki iş akışı. `expo export` + dev menü taraması CI'da | S13 |
| P-11 | **CLAUDE.md "Bilinen tuzaklar" ~670 satır.** Taze bağlamlı ajan yanlış kaydı seçebilir | 08 §1 | 08'in taslağı aynen uygulanır. Tuzak kaydı ≤ 4 satır ve onu yakalayan testin adını taşır | S13 |
| P-12 | **Karar kaydı (ADR) dağınık:** kararlar CLAUDE.md, plan "Uygulama notu" ve dosya başlıklarında | — | `docs/kararlar/NNN-*.md` (seçenek, seçilen, elenen, geri dönüş, tetik sinyali). İlk üçü: Kritik-1 B, paylaşım unvanı, R8 | S13 |

---

## 5. Yeni özellik önerileri (teknik fizibilite ve efor)

Hepsi **taslak intent**tir. Dosya oluşturulmadı, karar Batuhan'ın. v1.5 kapsamına değil deneme sonrasına önerilir.

| # | Özellik | Fizibilite (K0/K1) | Efor | Gizlilik | Öneri |
|---|---|---|---|---|---|
| Y1 | **Yerel yedek / dışa aktarma** (sürümlü JSON, paylaşım sayfasıyla dışa; `expo-document-picker` ile içe) | Yüksek. İçe aktarma bir dış girdi, şema doğrulaması şart | M (2-3 gün) | Uyumlu: kullanıcı başlatır, ağ yok. `allowBackup:false` duruşunu tamamlar, telefon değiştirenin verisi kaybolmaz | **v2'nin ilk adayı** |
| Y2 | Android widget (hafta noktaları, Bugün'e dokunma) | Orta. Kotlin/Glance config plugin ya da 3. taraf kütüphane; veri check-in sırasında SharedPreferences'a yazılır | L (4-6) | Yalnızca nokta, seviye yok | v2 (13 I-5) |
| Y3 | Koyu tema (C'nin mor albüm sayfası buna doğal uyar) | Yüksek. Token katmanı S19'da kurulursa ucuz | M (2) | Nötr | v2. v1'de açık temaya kilit (T6) |
| Y4 | Kare 1:1 kart biçimi | Yüksek. `<Sticker>` ve token tablosuyla ikinci bir yerleşim tablosu | M (2-3) | Aynı gizleme kuralları | v2, denemedeki "nereye paylaştın?" cevabına bağlı |
| Y5 | Bildirimde "1 saat sonra hatırlat" eylemi | Orta. Bildirim kategorileri + arka plan yanıtı, OEM riski | M (1,5-2) | Veri yok | v2, talep kanıtı gelirse |
| Y6 | Uygulama kilidi (biyometrik) | Yüksek. `expo-local-authentication` | M (1,5) | Karnelerim'le değeri artar. **FLAG_SECURE önerilmez:** ekran görüntüsü de bir paylaşım kanalı | N-9 kararına bağlı |

**Y1 taslak intent (`yerel-yedek`):** Kullanıcı telefon değiştirdiğinde ya da uygulamayı sildiğinde bütün geçmişi ve kartları
kaybediyor, çünkü yedekleme bilerek kapalı ve hesap yok. Önerilen sonuç: Ayarlar'dan tek dokunuşla sürümlü bir yedek dosyası
paylaşım sayfasıyla dışa verilir, yeni cihazda içe alınır; dondurulmuş kartlar olduğu gibi geri gelir. Başarı ölçütü: yedek → sil
→ geri yükle turunda veri kaybı sıfır (K2 + K4). Kısıt: ağ yok, şifreleme ayrı karar, içe aktarma bir dış girdi sayılır ve
security-reviewer bakar.

**Y2 taslak intent (`android-widget`):** 13 I-5 ile aynı, burada tekrarlanmıyor. Ek teknik not: widget verisi check-in yazımında
güncellenir ve "Tüm verilerimi sil" widget verisini de temizler (silme yolu sözleşmesi).

---

## 6. Batuhan'a sorular (seçenekli)

| # | Soru | Seçenekler | Öneri |
|---|---|---|---|
| S-1 | 3 günlük ilk kart eşiği neye bağlı olsun? | (A) Kart açılmış mı (`week_start < ?`). (B) Check-in geçmişi: yalnızca 3+ günlü ilk hafta | **B.** Kart açmak hiçbir haftayı yeniden kilitleyemez. Spec'te "ilk kart" tanımı güncellenir |
| S-2 | Bir kategori gizliyken asıl unvan görünebilir mi? | (a) Katı: hiçbir kategori gizli değilse asıl unvan, varsayılan gizlemede her zaman paylaşım unvanı. (b) Bugünkü `basedOnCategories` kuralı | **(a).** (b) çıkarımla sızdırıyor (2a). Karar security-reviewer'ın görüşüyle birlikte |
| S-3 | Paylaşım unvanı olmayan eski kartlar | (a) Şerit. (b) Mevcut havuzla geriye doldurma | **(a).** Dondurulmuş kart değişmez; harici kullanıcı yok |
| S-4 | Tahmini kabul: denemeye kadar ~24 gün | (a) Kabul. (b) ~20 güne kes (V1b kısaltılır, V4 örneği çıkar, T8 bölünür) | Takvim baskısı varsa **(b)**; kart, ikon ve reveal kesilmez |
| S-5 | `expo-haptics` | (a) Evet (Kaydet ve yapıştırma anında). (b) Hayır | (a). Ağ yok, izin zaten var |
| S-6 | Font | (a) Baloo 2 (800/700) eklensin, Inter italic çıksın. (b) Yalnızca Inter | (a). C'nin kimliği bu fonta dayanıyor; net boyut etkisi yaklaşık sıfır |
| S-7 | R8 hangi profillerde? | (a) `preview` ve `production` ikisinde. (b) Yalnızca `production` | **(a).** Test edilen APK, dağıtılan APK olsun |
| S-8 | Proje yolu | (a) `C:\dev\haftik`'e taşı (08). (b) robocopy devam | **(a).** K4 kanıtının eski kodda üretilmesi riskini kapatır |
| S-9 | `metric_event` CHECK | (a) v3'te genişletilmiş listeyle yeniden kur. (b) CHECK'i kaldır, TS + test ile koru | (a). Spec CHECK istiyor; yeniden kurulum tek sefer |
| S-10 | Karar kaydı klasörü (P-12) | Evet / hayır | Evet; üç karar hemen yazılır |

---

## 7. Doğrulanamayanlar ve devir

**Doğrulanamayanlar:**

- Hiçbir derleme, test ya da emülatör çalıştırılmadı.
- R1 ve R2 view-shot Java kaynağından (K1). "Ebeveyn dönüşümüyle keskin rasterleşme" ve "`elevation`/`boxShadow` yazılım
  tuvalinde çizilmez" iddiaları K0, K4 şart.
- `user_version`'ın işlem içinde geri alınması, AUTOINCREMENT dizisinin `RENAME` sonrası sürmesi ve expo-sqlite günlük modu K0,
  testle kanıtlanmalı.
- `expo-build-properties` anahtar adları, Baloo 2 dosya boyutu, PNG varlık boyutu ve kart PNG'sinin yeni boyutu K0.
- Efor K0: tarih kalibrasyonu K1, ama tek projenin verisi.
- Çıkarım sızıntısının pratik önemi (hangi seviyenin ne kadar hassas olduğu) security-reviewer'ın değerlendirmesi.

**Devir:**

```
Durum:        bitti (öneri); kod/spec/plan değişmedi
Karar gerek:  S-1..S-10 (Batuhan); I-1, I-2 intent'leri (13 §7)
security-reviewer:     2a çıkarım sızıntısı (unvan + özet), P-5 silme kalıntısı, bildirim verisi girdi doğrulaması
mobile-platform-spec.: R1/R2 view-shot davranışı, T3 soğuk açılış, R8 kuralları
visual-designer:       C varlıkları @4x PNG, 4 kategori tonu (kontrast), LevelMark şekil dili
copywriter:            paylaşım unvanı havuzu (movement+social kapsamı), ilerleme cümleleri
qa / test-automation:  monotonluk ve non-interference özellik testleri, 2g release matrisi, fikstür galerisi + screencap referansları
project-coordinator:   S13-S25 takvimi, kesme sırası (bölüm 1)
```

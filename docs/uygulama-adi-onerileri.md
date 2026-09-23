# Uygulama adı önerileri (K4, spec E8)

Tarih: 2026-09-23. Durum: ÖNERİ, karar Batuhan'ın. Bu belge kod/yapılandırma değiştirmez.

Bağlam: Türkiye, Türkçe, esprili/tanısız/tavsiyesiz ton, Pazar 20:00'de açılan
paylaşılabilir haftalık kart. Kartın gömülü damgası `Ad · mağaza bağlantısı`
biçiminde, kartın altında 11px yazılır (`docs/ux/kart-yerlesimi.md`); ad ne
kadar kısaysa bağlantıya o kadar yer kalır. Çalışma adı "Haftalık Hayat
Karnesi" 22 karakter ve mağaza başlığı için gereksiz uzun.

## Değerlendirme ölçütleri

1. Türkçe karakter riski (ı/İ büyük-küçük harf dönüşümü, ş/ğ/ç/ö/ü'nün paket adı, alan adı, arama ve URL'de ASCII'ye düşmesi).
2. Mağaza başlığı en fazla 30 karakter (Google Play ve App Store), ideali 15 altı.
3. 11px damgada okunurluk (kısa, ayırt edilebilir harfler).
4. Telaffuz, akılda kalma, "karne" kavramının sağladığı hazır espri.
5. Sağlık/tıbbi çağrışımı yok (mağaza sağlık politikası riski; ad "ruh hali", "uyku", "terapi", "sağlık" vb. içermez).
6. Gerçek bir marka/kişiyi taklit etmez.

## Aday listesi

Çakışma taraması yalnızca genel web araması ile yapıldı (aşağıdaki "Sınırlar"
bölümüne bakın). "Bulunmadı" = aramada aynı adlı uygulama çıkmadı, "yok" demek değildir.

| # | Ad | Karakter | TR karakter | Gerekçe | Risk / çakışma taraması |
|---|---|---|---|---|---|
| 1 | **Pazar Karnesi** | 13 | Yok (tamamı ASCII) | Kartın Pazar 20:00 ritüelini adın içine koyar; "Pazar akşamı" hissi + okul karnesi esprisi; paylaşırken "Pazar Karnem geldi" diye cümleye girer. | Ad, açılış gününe bağlar (gün ileride değişirse eskir). Launcher etiketinde 13 karakter kısalabilir. Aynı adlı uygulama bulunmadı; "Pazar-App" adlı ilgisiz bir pazar yeri uygulaması var, ad farklı. |
| 2 | **Karnem** | 6 | Yok | En kısa ve en sahiplenilebilir ("işte karnem"); damgada en çok yer bırakır. | "Karne" kelimesi eğitim uygulamalarıyla dolu; mağaza aramasında okul/e-Okul sonuçlarıyla yarışır. Tam adı "Karnem" olan uygulama bulunmadı, ama "Gdz Enerji Karnem", "LGS Deneme Karnem", "Bilgiyolu Karnem" gibi ek sözcüklü olanlar var (kısa ad tek başına bulunmuşsa çakışma sayılır, mağazada elle bakılmalı). Play'de tam "Karne" adlı bir uygulama var (`com.visionia.karne`), "Karnem"e yakın. |
| 3 | **Karne Günü** | 10 | ü | Kısa, "karne günü" ritüel çağrışımı (heyecan + biraz tedirginlik); Pazar'a bağlı değil, esnek. | ü paket adı/alan adında `karnegunu` olur (okunuşta sorun yok). Bulunmadı. Genel tarama sonuçları tamamen alakasız çıktı (emoji uygulamaları), yani tarama zayıf. |
| 4 | **Hafta Karnesi** | 14 | Yok | Ne yaptığını tek bakışta anlatır (ASO için iyi). | Tanımlayıcı/jenerik, marka olarak zayıf ve tescil için zor. MEB'in okul "etkinlik haftası" haberleriyle karışabilir. Aynı adlı uygulama bulunmadı. |
| 5 | **Karne Pazarı** | 13 | ı (PAZARI/pazarı büyük harf dönüşümü) | "Pazar" sözcük oyunu (gün + pazar yeri); akılda kalır. | Ticaret/alışveriş çağrışımı ("pazar yeri"), yanlış beklenti; ı harfi, alan adı ve arama için `karnepazari` yazımına düşer. Bulunmadı. |
| 6 | **Haftanın Notu** | 13 | ı | Doğal Türkçe kalıp, samimi; "not" hem okul notu hem gözlem. | ı riski; "Not defteri" uygulamaları arasında kaybolur (arama sonucu not alma uygulamalarıyla doluydu). Bulunmadı. |
| 7 | **Pazar Notu** | 10 | Yok | Kısa, ASCII, ritüel + not. | Not defteri uygulamalarıyla karışabilir; Pazar'a bağlı. Bulunmadı. |
| 8 | **Notlu Hafta** | 11 | Yok | "Notlu" hem not almış hem dikkat çekici anlamıyla espriye açık. | Anlam belirsiz (yeni kullanıcı ne olduğunu çıkaramaz). Bulunmadı. |
| 9 | **Karnelik** | 8 | Yok | Kısa, özgün, marka olabilecek uydurma kalıp. | "Karnelik" günlük dilde yerleşik değil; ne olduğunu anlatmaz, akılda kalması için tanıtım gerekir. Bulunmadı. |
| 10 | **Haftalık Karne** | 14 | ı, k | Çalışma adının kısaltılmış hali; geçişi en kolay olanı. | Jenerik, tescil zayıf; "Karne" alt-küme çakışması (aday 2). Bulunmadı. |
| 11 | **Karne** (ELENDİ) | 5 | Yok | En kısa. | Play'de aynı adlı uygulama var ("Karne", `com.visionia.karne`, yakın kişiler arası paylaşımlı defter); kolay çakışma. Tavsiye edilmez. |
| 12 | **Pekiyi** (ELENDİ) | 6 | Yok | Eski notlandırmadaki en yüksek not; esprili ("Pekiyi aldım"). | Google Play ve App Store'da "Pekiyi" adlı sınav sonucu uygulaması var (`com.mmr.pekiyi`). Elendi. |

Elenen tüm adlarda "sağlık/tıbbi" çağrışımı yok. "Zayıf Geçti" gibi
alternatifler de düşünüldü ama "zayıf" beden ölçüsü çağrışımı yapabileceği için
listeye alınmadı.

## Sıralama: en iyi 3

1. **Pazar Karnesi.** Ürünün tek "wow anı" olan Pazar 20:00 kartını adın içine
   koyuyor, ASCII olduğu için paket adı/alan adı/URL/arama tarafında sıfır
   dönüşüm riski taşıyor, taramada çakışma çıkmadı. Kabul edilen risk: gün adı
   ürün davranışına bağlanır (Pazar dışına çıkılırsa ad eskir; v1'de gün sabit).
2. **Karnem.** En kısa, damgada en çok yer bırakan, sahiplenilebilir ad. Risk:
   mağaza aramasında eğitim uygulamalarıyla yarışır; bu yüzden alt başlık
   ("Haftalık emoji karnesi") zorunlu tamamlayıcıdır. "Karnem" tek başına çıktısı
   ek sözcüksüz olarak mağazada elle kontrol edilmeden seçilmemeli.
3. **Karne Günü.** Kısa, ritüeli anlatıyor, Pazar'a bağlı değil. Tek
   dezavantajı ü harfi ve (aday 1'e göre) daha az doğrudan "haftalık" hissi.

Kısa yol: Pazar Karnesi'ni ilk tercih olarak mağazada/alan adında kontrol et,
temizse seç; değilse Karnem, sonra Karne Günü.

## Sınırlar (bu tarama neyi kanıtlamaz)

- Yalnızca genel web araması (WebSearch) yapıldı. Mağaza içi arama, gizli/yayından
  kalkmış uygulamalar, Instagram/X/TikTok hesap adları, alan adı ve marka
  tescili SORGULANAMADI. "Bulunmadı" sonucu "serbest" demek değildir.
- Kesin marka/alan adı tescil sorgusu bu ortamda yapılamaz; hukuki bir güvence
  değildir.

### Batuhan'ın kendisinin kontrol etmesi gereken kısa liste

1. Google Play ve App Store (TR) içinde seçilen adı tam ad ve yazım varyantlarıyla ara (Türkçe karaktersiz/karakterli).
2. Alan adı: `.com`, `.com.tr`, `.app` (kart damgası için kısa bağlantı gerekir, E5).
3. Instagram, X, TikTok'ta kullanıcı adı boşta mı.
4. TÜRKPATENT marka sorgusu (Sınıf 9 yazılım/mobil uygulama, Sınıf 42; "benzer" adlar dahil).
5. Google'da ad + "uygulama" araması (ilk sayfada rakip/marka var mı).
6. Play Console'da uygulama adı eklenirken "ad kullanılıyor" uyarısı çıkmıyor mu (Play, yayın öncesi aynı ada izin verebilir ama tescil sahipleri şikayet edebilir).

## Paket adı (bundle id) için önerilen biçim

- Biçim: `com.<geliştirici>.<ad>`, tamamı küçük harf ASCII, tire/alt çizgi/Türkçe karakter yok.
  Örnek (Pazar Karnesi seçilirse): `com.<geliştirici>.pazarkarnesi`.
- `<geliştirici>` için Batuhan seçer (kendi adı, bir takma ad ya da sahip olduğu bir alan adının tersi). Şu anki `com.anonymous.hhkscaffold` yer tutucudur, yayınlanmamalıdır.
- Android'de `android.package` ve iOS'ta `ios.bundleIdentifier` aynı olsun. Şu an `app.json`'da `ios.bundleIdentifier` tanımlı değil.
- Uyarı: Play'de paket adı ilk yüklemeden sonra DEĞİŞTİRİLEMEZ. Ad kesinleşmeden ilk yükleme (kapalı test dahil) yapılmamalı; geliştirici kimliği de kalıcı olur.

## Slogan / alt başlık önerileri

Sınırlar: Play başlık 30, kısa açıklama 80; App Store ad 30, alt başlık 30 karakter.
Mağaza metnini "ruh hali", "uyku", "sağlık", "terapi", "takip" gibi sözcüklerden
uzak tut (ürünün kategorisi Yaşam Tarzı/Eğlence seçilmeli, Sağlık ve Fitness
değil; bu bir öneridir, `security-reviewer`/mağaza formu aşamasında doğrulanmalı).

- Başlık: `Pazar Karnesi` (13). Alternatif ASO başlığı: `Pazar Karnesi: Haftalık Karne` (29).
- Alt başlık (App Store, 30): `Haftanın karnesi Pazar açılır` (29). Kısa alternatif: `Haftana not ver, paylaş` (23).
- Play kısa açıklama (80): `Günde 8 saniyelik emoji check-in, Pazar 20:00'de paylaşılabilir haftalık karne.` (79 karakter, 80 sınırının altında; Play'e girmeden önce sayaçla doğrula.)
- Ton örneği (esprili, tanısız): "Haftan nasıl geçti? Karne Pazar akşamı açılır."

## Ad seçilince değişecek yerler

Bu liste, dosyaları okuyarak hazırlandı; bu oturumda kod aranamadığı için
"Haftalık Hayat Karnesi" geçen diğer yerleri (testler, bildirim metinleri,
`spike/`, dokümanlar) ayrıca arayıp kontrol etmek gerekir.

1. `src/config/constants.ts`: `APP_DISPLAY_NAME` (tek kaynak); `CARD_STAMP_TEXT` bundan türer. `STORE_LINK_PLACEHOLDER` K5 ile ayrıca kesinleşir. Adı değiştirince damga testleri/kart görüntüsü yeniden gözden geçirilmeli (değişmesi gereken beklenen metinler test dosyalarında literal olarak duruyorsa Batuhan onayıyla güncellenir, kural: testi kırıp kodu değil, kasıtlı ad değişikliğinde test beklentisi güncellemesi ayrı onay ister).
2. `app.json`:
   - `expo.name`: mağaza/launcher etiketi (şu an `hhk-scaffold`); 13 karakter launcher'da kısalabilir, gerekirse cihazda kontrol et.
   - `expo.slug`: `pazar-karnesi` (ASCII, tire serbest).
   - `expo.scheme`: `pazarkarnesi` (şu an `hhkscaffold`).
   - `expo.android.package`: `com.<geliştirici>.pazarkarnesi` (şu an `com.anonymous.hhkscaffold`).
   - `expo.ios.bundleIdentifier`: aynı değer (şu an yok, eklenecek).
3. `package.json` `name` alanı (kozmetik, mağazaya yansımaz) ve `android/` (yeniden üretilir: `npx expo prebuild --clean`; `android/` kaynak kontrolünde değil).
4. Kart damgası: kod olarak (1) ile gelir; `docs/ux/kart-yerlesimi.md` satır 93-95'teki yer tutucu metin, `CLAUDE.md` başlığı/ürün özeti, `spec.md` E8, `plan.md` K4 kapısı belge güncellemesi olarak kalır.
5. Mağaza kayıtları (Play Console + App Store Connect) adı, alt başlığı ve gizlilik metnindeki ürün adını içerir; K5 (bağlantı) ile birlikte S12 öncesi kesinleşmeli.

## Özet

- 12 aday tarandı; 2'si mağazada aynı adlı uygulama bulunduğu için elendi (Karne, Pekiyi).
- Öneri sırası: 1) Pazar Karnesi, 2) Karnem, 3) Karne Günü.
- Çakışma taraması yalnızca genel web aramasıydı; mağaza, alan adı, sosyal medya ve TÜRKPATENT kontrolü Batuhan'a bırakıldı.
- Paket adı önerisi `com.<geliştirici>.pazarkarnesi` (ASCII); Play'de sonradan değiştirilemez.
- Ad seçilince: `src/config/constants.ts`, `app.json` (name/slug/scheme/package/bundleIdentifier), sonra belgeler.

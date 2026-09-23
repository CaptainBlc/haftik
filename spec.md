# Spec: Haftalık Hayat Karnesi
Kaynak: `intent/2026-09-20-haftalik-hayat-karti.md`
Status: accepted — Batuhan tarafından Claude SDLC deposunda onaylanıp commit'lendi (`f33af0d`, 2026-09-21/22). Bu dosya o onaylı halin bu depoya kopyasıdır.
Şablon: `spec.md` (başlıklar birebir korunmuştur; `spec.md` şablon olarak dokunulmadan kalır.)

> Bu spec, intent'teki "Open questions 1" kararına (günlük emoji check-in,
> otomatik kaynak yok, iOS+Android tek kod tabanı) dayanır. Çelişen veya
> belirsiz noktalar en altta "İşaretlenmiş endişeler" başlığındadır; bazıları
> **mimariyi doğrudan etkilediği** için oradaki maddelere numarayla atıf var (E1, E2 ...).

## Mimari genel bakış

**Tek bir mobil uygulama. Sunucu yok, hesap yok, bulut yok.** Tüm veri ve tüm
hesaplama cihazda. "Modüler monolit" burada tek uygulama içi modül ayrımı demektir;
mikroservis gündemde bile değil.

```
+---------------------------- Mobil uygulama (Expo / React Native, TS) ----------------------------+
|                                                                                                   |
|  UI katmanı (ekranlar)                                                                            |
|   Onboarding | Bugün (check-in) | Hafta durumu / Kilitli kart | Kart ekranı | Ayarlar             |
|        |                |                    |                      |                              |
|  -------------------------------- Domain katmanı (saf TypeScript, UI/OS bilmez) ---------------   |
|   clock.ts      (enjekte edilebilir saat)     week.ts   (hafta sınırları, uygunluk kuralı)        |
|   score.ts      (hafta ortalaması -> seviye)  delta.ts  (geçen haftaya göre değişim)              |
|   titles.ts     (unvan seçimi, 30-40 havuz)   copy.ts   (satır/özet metin seçimi)                 |
|        |                                                                                          |
|  -------------------------------- Altyapı adaptörleri (OS'e dokunan tek yer) ----------------    |
|   data/      SQLite repo + migration (expo-sqlite)                                                |
|   notify/    yerel bildirim planlayıcı (expo-notifications)                                       |
|   card/      CardView (sabit 9:16) -> PNG yakalama (react-native-view-shot) -> paylaşım sayfası   |
|   metrics/   cihaz içi sayaçlar + "deneme raporu" dışa aktarma                                    |
+---------------------------------------------------------------------------------------------------+
        |                                   |                                   |
   Cihaz SQLite dosyası           İşletim sistemi bildirim         İşletim sistemi paylaşım sayfası
   (tek veri deposu)              zamanlayıcısı                    (WhatsApp / Story / vb.)
```

**Ana akışlar**

1. **Check-in:** Kullanıcı "Bugün" ekranında 4 kategoriyi (hareket, uyku, harcama, sosyal),
   her biri 3 emoji seçenekten birini seçerek işaretler, Kaydet. Hedef: ~8 sn. -> `checkin` satırı yazılır
   -> bildirim planlayıcı yeniden çalışır.
2. **Hafta durumu:** Bu haftanın (Pzt-Paz) dolu gün sayısı, "kart için X gün daha" göstergesi.
   Uygunluk kuralı: haftada >= 4 dolu gün; **kullanıcının ilk kartı için >= 3 dolu gün** (karar: 2026-09-21).
3. **Kart açılışı:** Pazar 20:00'den sonra ve uygunsa kart ilk açıldığında domain katmanı haftayı hesaplar
   (unvan + 4 satır + değişim), sonucu `weekly_card` tablosuna **dondurur**, kart ekranı bunu çizer.
   Uygun değilse veya 20:00 gelmediyse bulanık kilitli kart (yer tutucu içerikle; gerçek metin çizilmez).
4. **Paylaşım:** Her satırın yanında tek dokunuşluk "gizle" (satır "???" olur). Paylaş -> CardView sabit
   1080x1920 PNG'ye yakalanır -> işletim sisteminin paylaşım sayfası açılır. Gizli satır bitmap'te
   "???" olarak düzleşir; gizlenen metin dosyada bulunmaz.
5. **Bildirim:** (a) günlük hatırlatma, varsayılan 21:00; (b) Pazar 20:00 "kartın hazır" — yalnızca
   uygunluk sağlandıysa planlanır (bkz. Veri modeli > Bildirim planlama kuralları).

**Tasarım ilkeleri**
- Domain katmanı saf fonksiyonlardır: saat dışarıdan verilir (`Clock`), UI/SQLite/OS import etmez. Sebep:
  "Pazar 20:00" ve "hafta sonu" mantığı gerçek saatle test edilemez; enjekte saat + gizli debug menüsüyle
  (yalnızca geliştirme derlemesinde) zaman simüle edilir.
- Kart, tek bir sabit boyutlu (mantıksal 360x640, çıktı 1080x1920) bileşendir; cihaz ekran boyutundan
  bağımsız üretilir. Gerçek ekran görüntüsü değil, yakalanmış görsel dosyasıdır.
- Kartın **silinemeyen damgası** CardView'in içine gömülü çizilir (kullanıcının kapatabileceği bir
  katman değil). Kırpılmaya karşı garanti verilmez (E5).

**Karmaşıklık işareti (süre tahminine yansıtıldı).** Ürünün büyük kısmı CRUD/UI olduğundan AI-hızlandırma
orada yüksek (5-10x). Ama şu üç parça "karmaşık iş mantığı / platform tuhaflığı" sınıfında ve çarpan
1.5-2x'e düşer: (1) hafta/saat mantığı + koşullu bildirim yeniden planlama, (2) cihazda görsel üretimi
ve iki platformda aynı görünmesi, (3) iOS'un Windows'tan dolaylı geliştirilmesi (E2).

## Teknoloji yığını

| Katman | Seçim | Neden |
|---|---|---|
| Mobil çatı (Frontend) | **Expo (React Native) + TypeScript**, güncel kararlı SDK (plan.md'de sürüm sabitlenecek). Yönlendirme: expo-router (Expo şablonunun varsayılanı). Durum yönetimi: React state + repo katmanı, ek kütüphane yok | Tek kod tabanı iki mağazayı hedefler. **EAS Build ile iOS derlemesi Mac olmadan bulutta yapılır**; Windows'ta geliştirme akışı resmi olarak desteklenir. Claude Code'un en çok bildiği ekosistemlerden biri (TS + React), AI-hızlandırma çarpanı burada en yüksek. Uygulama ~5 ekran; ağır kütüphane gerekmez. |
| Kart görseli | **react-native-view-shot** (bir View'i PNG'ye yakalar) + paketlenmiş font | Sıkıcı ve yaygın çözüm; kart normal RN bileşeni olarak yazıldığı için tasarım değişikliği kod değişikliği kadar ucuz. Font paketlenir (Türkçe karakterler ğ ş ı İ ö ü ç desteği doğrulanacak; iki platformda aynı yazı tipi). Elenen: Skia (gereksiz karmaşıklık; kart statik), sunucuda görsel üretimi (v1'de sunucu yok, gizlilik ilkesine aykırı). |
| Paylaşım | Yakalanan PNG + işletim sistemi paylaşım sayfası (`expo-sharing` veya RN `Share`; plan'da hangisinin PNG + metin başlığını iki platformda doğru taşıdığı denenecek) | Intent "sistem paylaşım sayfası" diyor. Instagram Story'ye doğrudan derin entegrasyon (Facebook App ID, özel URL şemaları) v1'e sokulmaz: kırılgan ve ekstra kayıt gerektirir. Kullanıcı sistem sayfasından Story'yi zaten seçebilir. |
| Bildirim | **expo-notifications** (yalnızca yerel bildirim; push yok) | Sunucusuz çalışan tek seçenek zaten yerel bildirim. Tarih tetikleyicili ("date") bildirimler her açılışta/check-in'de yeniden planlanır (bkz. Veri modeli). Uzak push token'ı alınmaz -> veri toplamama ilkesiyle uyumlu. |
| Backend | **Yok** | v1'de hesap/sunucu/bulut yok kararı. Bu bir eksiklik değil, gizlilik ve maliyet kararıdır: KVKK yüzeyi, işletme yükü ve saldırı yüzeyi sıfıra yakın. Ölçüm ihtiyacı için sunucu eklenmedi; alternatifi E3'te. |
| Veritabanı | **SQLite, cihazda (`expo-sqlite`)**, `PRAGMA user_version` ile numaralı migration | Veri çok küçük (yılda ~365 satır) ama ilişkisel/tarihsel sorgu (hafta aralığı, geçen hafta karşılaştırma) ve şema değişikliği (v2'de kategori eklenebilir) gerekecek; SQLite bunu tek dosyada ve kanıtlanmış biçimde çözer. Elenen: AsyncStorage/MMKV (düz anahtar-değer; hafta sorguları ve şema evrimi için elle kod yazdırır), WatermelonDB/Realm (senkronizasyon yok, gereksiz), Firebase/Supabase (v1 kararına aykırı). |
| Barındırma / dağıtım | **EAS Build** (bulutta iOS+Android derleme) -> App Store + Google Play. Çalışma zamanı sunucusu yok. İsteğe bağlı: **tek statik sayfa** (GitHub Pages / Cloudflare Pages) yalnızca gizlilik politikası URL'si ve akıllı mağaza bağlantısı için (E5) | EAS, Mac gereksinimini ortadan kaldıran kararlı yol; ücretsiz katman kotası (aylık sınırlı iOS/Android build; güncel rakam plan aşamasında dokümandan doğrulanacak) tek kişilik geliştirme için yeterli görünüyor. Mağazalar gizlilik politikası URL'si istiyor; bunun için sunucu değil statik dosya yeter. |
| Test | **Jest (jest-expo)**: domain katmanı için birim testleri; SQLite repo'su için entegrasyon testi; kart/bildirim için elle cihaz kontrol listesi | Testin değer kattığı yer domain mantığı (hafta sınırı, uygunluk, unvan kapsama). Kart görünümü ve bildirim işletim sistemi davranışı otomatikleştirmeye değmez; manuel liste `plan.md`'de. E2E araçları (Detox/Maestro) v1'de yok: kurulum maliyeti kazancı aşar. |
| CI / kalite | GitHub Actions: `tsc --noEmit`, ESLint, Jest (playbook'un `ci.yml` şablonuna oturur; AI yok, ücretsiz) + Dependabot | Playbook'ta zaten planlı; bağımlılık güvenliği için Dependabot şart (Aşama 6). |
| İçerik (metin) | Kod içinde tip güvenli TS modülü (`content/tr.ts`), her metin kimlikli | Metin kartın ürünüdür; kimlikli olması unvan/satır çeşitlilik ve kapsama testlerini mümkün kılar. Çok dilli desteğe (E8) sonradan geçişi kolaylaştırır. |

**Elenen alternatifler (kısa)**
- **Flutter:** Yetkin ve mantıklı ikinci seçenek; Windows'ta geliştirilebilir, iOS için Codemagic gibi bulut derleme gerekir. Elenme nedeni: EAS + TS/React ekosisteminin AI-destekli akışta daha az sürtünmesi ve görsel yakalama/bildirim kütüphanelerinin daha olgun olması; Dart öğrenme maliyeti. Kesin bir üstünlük değil, bilinçli bir tercih.
- **Native (Swift + Kotlin):** İki kod tabanı + iOS için Mac zorunluluğu; kısıtlarla doğrudan çelişir.
- **Kotlin Multiplatform / .NET MAUI:** iOS tarafı Mac'e bağımlı veya ekosistem/AI desteği zayıf.
- **PWA:** Mağaza hedefiyle çelişir; iOS'ta yerel bildirim ve dosya paylaşımı güvenilir değil.
- **Capacitor:** Web tabanlı kart yakalama (canvas) iki platformda tutarsız ve ek WebView katmanı getirir.

## Veri modeli

Tek kaynak: cihazdaki SQLite dosyası. Tüm zamanlar **yerel saat dilimine göre** tutulur; gün kimliği
`YYYY-MM-DD` (yerel takvim günü). **Hafta = Pazartesi-Pazar** (Türkiye hedef pazarı; E9'da not).

### Tablo: `checkin` (günde en fazla 1 satır)
| Alan | Tip | Kısıt / açıklama |
|---|---|---|
| `local_date` | TEXT | PRIMARY KEY, `YYYY-MM-DD` |
| `movement` | INTEGER | NOT NULL, CHECK 1..3 |
| `sleep` | INTEGER | NOT NULL, CHECK 1..3 |
| `spending` | INTEGER | NOT NULL, CHECK 1..3 |
| `social` | INTEGER | NOT NULL, CHECK 1..3 |
| `created_at` | INTEGER | NOT NULL, epoch ms |
| `updated_at` | INTEGER | NOT NULL, epoch ms |

- Değer anlamı: her kategori için **sıralı yoğunluk** 1=düşük, 2=orta, 3=yüksek (iyi/kötü değil). Emoji seti
  UX çıktısıyla netleşir; örnek: hareket (durgun / hafif / yoğun), uyku (kötü / idare / iyi),
  harcama (az / orta / çok), sosyal (yalnız / ölçülü / kalabalık). Yorumlamayı metin motoru yapar.
- **Bir gün, ancak dört kategorinin dördü de seçilince "dolu gün" sayılır** (kısmi kayıt yok). Böylece
  ortalama/uygunluk hesabı belirsiz kalmaz ve ekran tek "Kaydet" adımıdır.
- Düzenleme penceresi: bugün ve dün (gece yarısından sonra işaretleyen kullanıcı için). Daha eski kayıt v1'de düzenlenmez.

### Veri katmanı — netleştirmeler (S5, 2026-09-23, qa-engineer bulgularına yanıt)

1. **Düzenleme penceresi hangi katmanda uygulanır:** `saveCheckin(c: Checkin): Promise<void>` imzası
   dondurulmuş ve `now` parametresi almıyor — repo bunu bilerek **uygulamaz**. "Bugün/dün" kısıtı
   **UI/uygulama katmanının** sorumluluğudur (S6/S7): arayüz yalnızca bugün ve dünün kaydını düzenleme
   arayüzü sunar, daha eski bir `local_date`'e hiç `saveCheckin` çağırmaz. Repo katmanı, herhangi bir
   `local_date`'e sınırsız upsert yapan saf bir depo olarak kalır; bu bilinçli bir tasarım, eksiklik
   değil. S5'in testi bunu **pozitif** doğrular: repo, 2+ gün önceki bir `local_date`'i de kabul eder.
2. **`saveCard` ikinci çağrısı — KARAR: no-op.** Aynı `week_start` için `saveCard` ikinci kez
   çağrılırsa, çağrı sessizce hiçbir şey yapmaz (var olan kayıt korunur, hata fırlatılmaz). Gerekçe:
   "sonra değişmez" garantisini gerçekten koruyan tek davranış budur (overwrite garantiyi bozar);
   hata fırlatmak her çağıran yeri try/catch'e zorlar ve tek yazımlık bir anlık görüntü için gereksiz
   sertliktir.
3. **`delta_movement/sleep/spending/social` için SQLite CHECK eklenir:** her biri
   `CHECK (value IN (-1,0,1) OR value IS NULL)` — çekirdek şema tablosunda ayrıca yazılmamıştı, bu
   bir netleştirme, spec değişikliği değil.
4. **v1→v2 migration örneği:** Henüz gerçek bir v2 özelliği yok. S5, migration **mekanizmasını**
   (numaralı migration dizisi, `PRAGMA user_version` takibi, var olan veriyi koruma) kanıtlamak için
   zararsız, kullanılmayan bir placeholder migration yazar (ör. boş/nullable bir sütun ekleme) —
   gerçek bir ürün özelliği icat etmez, yalnızca mekanizmanın çalıştığını ve mevcut satırları
   bozmadığını gösterir. Yorumla açıkça "mekanizma kanıtı, gerçek özellik değil" diye işaretlenir.

### Tablo: `weekly_card` (kart açıldığında oluşan değişmez anlık görüntü)
| Alan | Tip | Açıklama |
|---|---|---|
| `week_start` | TEXT | PRIMARY KEY, haftanın Pazartesi tarihi |
| `generated_at` | INTEGER | Kartın ilk açıldığı an (epoch ms) |
| `checkin_days` | INTEGER | Kartı üreten dolu gün sayısı (>= 4; ilk kartta >= 3) |
| `title_id` / `title_text` | TEXT | Seçilen unvan (kimlik + o anki metin) |
| `line_movement/sleep/spending/social` | TEXT (kimlik) + metin | Seçilen satırlar; metin dondurulur |
| `delta_*` (4 alan) | INTEGER NULL | -1 / 0 / +1; geçen hafta yeterli veri yoksa NULL |
| `summary_text` | TEXT | Değişim özet satırı |
| `content_version` | INTEGER | Metin havuzu sürümü |

Neden dondurulur: metin havuzu güncellense de eski kart değişmesin; aynı hafta kart tekrar açıldığında
aynı görsel çıkar (paylaşımın tekrarlanabilirliği).

### Tablo: `setting` (anahtar-değer)
`reminder_enabled` (varsayılan true), `reminder_time` (HH:MM, varsayılan `21:00`), `onboarding_done`,
`first_open_date`, `notification_ids` (iptal için).

### Tablo: `metric_event` (cihaz içi, kimliksiz sayaç; bkz. E3)
`id`, `name` (sabit küme: `card_unlocked`, `card_opened`, `share_initiated`, `line_hidden`, `check_in_saved`),
`week_start` (nullable), `at` (epoch ms). **İçerik/değer/konum/cihaz kimliği taşımaz.** Kullanıcı verisi
silinince bu tablo da silinir.

**S9 netleştirmeleri (2026-09-23; spec'ten sapma yok, belirsizlikleri kapatır):**
1. `line_hidden` yalnızca sayaçtır; **kategori adı kaydedilmez**. Paylaşım başlatılırken dışarı çıkan
   karttaki gizli satır sayısı kadar kayıt yazılır (varsayılan gizliler dahil).
2. Sayım anları: `check_in_saved` her başarılı kayıt; `card_unlocked` hafta başına en fazla bir kez
   (hafta ekranı, DB'de dedupe); `card_opened` kart ekranı her başarılı yüklendiğinde; `share_initiated`
   paylaşım sayfası açılmadan hemen önce (iptal dahil => fazla sayım).
3. D7: gün 7 = kurulum günü + 6 takvim günü. Gün 7'de dolu check-in varsa `yes`; yoksa bugün gün 7'den
   sonraysa `no`, değilse `pending` ("henüz ölçülemez"). Kurulum tarihi yoksa `unknown`.
4. Paylaşım oranı paydası = `card_opened >= 1` olanlar; kartı hiç görmeyenler ve "kart açan / kurulum"
   ayrı raporlanır (`domain/metrics-calc.ts` `aggregateMetrics`, Batuhan'ın elle topladığı raporlar için).
5. Deneme raporu yalnızca sayaç + gün sayısı taşır (tarih/emoji/kategori/kimlik yok), dosya olarak
   yazılıp sistem paylaşım sayfasıyla çıkar, sonra silinir; bilinen sınırlar rapor metninde yazar.
6. (SEC I-1) Kart açılışı deep link'ten de gelebilir: kayıtlı kart yoksa uygunluk (`getWeekState().unlocked`)
   `openOrBuildCard`ta da doğrulanır; uygun değilse kart üretilmez/dondurulmaz, `card_opened` sayılmaz,
   kullanıcı hafta ekranına yönlendirilir. Kayıtlı kartın yeniden açılışı serbesttir.
7. (SEC I-2/I-3) Rapor paylaşılmadan önce ne gideceğini söyleyen onay diyaloğu çıkar ([Vazgeç]/[Paylaş]).
   Rapor "anonim" değil, "kimlik/içerik içermez" olarak tanımlanır; gönderen kimliğiyle birleştirilebilir.

### Hesaplama kuralları (domain katmanı)

- **Uygunluk:** `dolu_gün_sayısı(hafta) >= 4` (kullanıcının `weekly_card` tablosunda hiç kaydı yoksa, yani ilk kartta, `>= 3`) **ve** şimdi >= Pazar 20:00 (yerel) -> kart açılabilir. İlk kart, "ilk kart / karşılaştırma yok" varyantını zaten kullanır (delta NULL). Hafta bittiğinde (Pazartesi 00:00'dan sonra)
  uygun ama açılmamış geçen haftanın kartı açılabilir kalır (kullanıcı Pazar akşamı telefona bakmamış olabilir). Süre sınırı yok.
- **Kategori seviyesi:** haftalık ortalama -> düşük (< 1,67), orta (1,67-2,33), yüksek (> 2,33).
- **Değişim (delta):** kategori bazında bu hafta seviye ortalaması ile geçen hafta karşılaştırılır (+/-0,5 üstü = yükseldi/düştü, aksi sabit).
  Geçen hafta < 2 dolu gün ise delta NULL; kartta "ilk kart / karşılaştırma yok" varyantı gösterilir.
- **Unvan seçimi:** 30-40 kimlikli unvan havuzu, iki tür:
  (a) ~12 **temel unvan**: 4 kategori x 3 seviye (baskın/uç kategoriye göre) — bunlar **kapsama garantisidir**;
  (b) ~20-28 **kombinasyon/özel unvan**: örn. dört kategori ortada, yüksek tutarlılık (7/7 gün), iki kategori birlikte uçta, geçen haftaya göre büyük sıçrama.
  Kurallar öncelik sırasıyla değerlendirilir, ilk eşleşen kazanır; **bir önceki haftanın unvanıyla aynıysa** sıradaki eşleşen seçilir (tekrar sıkıcılığı).
  **Zorunlu birim testi:** dört kategorinin tüm 81 seviye kombinasyonu için (ve özel durumlarda) en az bir unvan döner; hiçbiri boş kalmaz.
- **Satırlar:** kategori x seviye x >= 3 metin varyantı (>= 36 satır). Varyant seçimi `week_start` tabanlı sabit tohumla yapılır (aynı hafta = aynı kart).
  Ardışık haftada aynı varyant tekrarlanmaz. Bir satır **en fazla ~60 karakter** (birim testi kontrol eder; taşma sorununu kaynağında önler).
- **Özet/değişim satırı:** yükselen/düşen/sabit kategori sayısına göre ~6 şablon. Ham sayı/tutar/konum hiçbir metinde geçmez (birim testi: metinlerde rakam yasağı).

### Unvan seçimi — netleştirmeler (S3, 2026-09-22, qa-engineer bulgularına yanıt)

QA'nın S3 uç durum incelemesi bir kritik belirsizlik ve bir veri sözleşmesi boşluğu buldu. Kararlar:

1. **"Baskın/uç kategori" tanımı (KRİTİK):** Kural motoru **öncelik sıralı** çalışır, ilk eşleşen kazanır:
   a. Önce **kombinasyon/özel kurallar** denenir — "dört kategori ortada" (4'ü de `medium`) dahil, tüm 20-28 özel kural burada. "Dört kategori ortada" durumu **her zaman** bir özel kuralla yakalanır, temel unvana hiç düşmez.
   b. Hiçbiri eşleşmezse **temel unvanlara** (12'lik havuz) düşülür: bu, **en az bir kategorinin seviyesi `medium` değil (yani `low` veya `high`)** olduğu anlamına gelir ("uç" = medium'dan sapma). Birden fazla kategori aynı anda uçtaysa (ve hiçbir özel kural bunu yakalamadıysa) **sabit öncelik sırasıyla** (`movement > sleep > spending > social`) ilk uç kategori seçilir, o kategori+seviye temel unvanı döner.
   c. Temel unvan havuzu tam olarak bunun için var: adım (a) hiçbir şeyi yakalamasa bile, en az bir kategori `medium` değilse adım (b) her zaman bir sonuç üretir; hepsi `medium` ise zaten adım (a)'daki "dört kategori ortada" kuralı yakalamış olur. **81 kombinasyonun tamamı bu iki adımla garanti altındadır.**
2. **Fallback zincirinin sonu:** "sıradaki eşleşen" araması hiçbir **farklı** unvan bulamazsa (yani eşleşen kural sayısı zaten 1 ve o da `prevTitleId`'ye eşitse), **orijinal eşleşen aynen tekrar döner** — boş dönmek veya hata fırlatmak yerine tekrar tercih edilir. Bu durumun pratikte ne kadar sık olduğu S4'te içerik havuzu büyüdükçe azalır.
3. **Veri sözleşmesi eklentisi:** `selectTitle`/`buildCard` sonucuna **`basedOnCategories: Category[]`** alanı eklenir — temel unvan (adım b) için tam 1 eleman (o kategori), kombinasyon kuralları için ilgili 2+ kategori, "dört kategori ortada" gibi hiçbir tek/çift kategoriye özgü olmayan kurallar için boş dizi `[]`. S7, kartta bir kategori gizlendiğinde `basedOnCategories`'in o kategoriyi içerip içermediğini kontrol edip unvanı da gizleyecek/değiştirecek (S7'nin işi, S3 yalnızca veriyi sağlar).
4. **"Büyük sıçrama" ve dağılım/çakışma toleransı gibi içerik-özel eşikler S4'e bırakılır** — S3'te kural motorunun mekanizması (öncelik sıralı, ilk eşleşen, garanti fallback, tekrar-önleme) ve **placeholder** birkaç kombinasyon kuralıyla + 12 temel unvanla 81/81 kapsama testi geçer; S4 gerçek 20-28 kuralı ekler, kapsama testi bozulmamalı (bkz. önerilen eval maddesi E-9).
- **Ton kuralı (içerik):** esprili, tanısız, tavsiyesiz. Tıbbi/sağlık iddiası, ruh sağlığı tanısı ve utandırma yok (mağaza sağlık politikası ve KVKK duruşu için de güvenli taraf).

### Bildirim planlama kuralları
- Sunucu olmadığı için bildirimler önceden, yerel olarak planlanır; koşullu mantık **yeniden planlama** ile çözülür:
  - **Günlük hatırlatma:** her uygulama açılışında ve her check-in sonrası, önümüzdeki **7 gün** için tarih tetikleyicili bildirimler yeniden kurulur; bugün check-in yapıldıysa bugünkü atlanır. Kullanıcı uygulamayı 7+ gün açmazsa hatırlatmalar kendiliğinden sönümlenir (bilinçli: ısrarcı olmamak, işletim sistemi bekleyen bildirim sınırının altında kalmak).
  - **Pazar 20:00 "kart hazır":** dolu gün sayısı 4'e ulaştığı anda o haftanın Pazar 20:00'si için planlanır; 4'ün altındaysa planlanmaz.
  - Zaman dilimi/saat değişikliği: her açılışta yeniden hesaplanır.
- **Pazar çakışması (E4):** varsayılan hatırlatma 21:00, kart 20:00. Bu spec'te karar: Pazar günü kart ilk açılırken bugün henüz işaretlenmediyse
  kullanıcı önce check-in ekranına yönlendirilir ("bugünü de ekle, sonra kart açılsın"); kart, check-in sonrası dondurulur. Batuhan onayı gerekir.

### Bildirim planlama — S8 netleştirmeleri (2026-09-23, qa-engineer senaryo belgesi `evals/s8-bildirim-senaryolari.md`)

1. **Pazar 20:00 "kart hazır" eşiği** yukarıdaki "4" yerine `getWeekState(...).requiredDays`'tir (ilk kart 3, sonrası 4); `notify-plan` eşiği yeniden yazmaz, `thresholdMet` kullanır (`timeMet` değil; bildirim zaten Pazar 20:00'yi hedefler).
2. **Hatırlatma kapalıyken** kart bildirimi yine planlanır (aç/kapa yalnızca "günlük hatırlatma"dır).
3. **`lastOpenAt` girdisi yok:** 7 günlük pencere her yeniden planlamada `now`'a göre kurulur; sönümlenme yapısaldır.
4. **Bozuk `reminderTime`** (biçim `HH:MM` değilse) 21:00 varsayılanına düşer; sessizce bildirimsiz kalınmaz.
5. **Geçmiş, açılmamış hafta için bildirim yok:** yalnızca içinde bulunulan haftanın Pazar'ı; `fireAt <= now` olan hiçbir bildirim planlanmaz (telafi yok).
6. **Yeniden planlama tetikleyicileri:** uygulama açılışı/öne gelme, check-in kaydı, **kart kaydı** (`hasAnyPriorCard` eşiği 3'ten 4'e çevirir), hatırlatma aç/kapa, saat değişimi, izin verildi. "Tüm verilerimi sil" yalnızca iptal eder; iptal en iyi çabadır (hata tablo silmeyi engellemez). Yeniden planlama `onboardingDone` ve bildirim izniyle kapılıdır (silme sonrası `reminderEnabled` varsayılanı `true` olduğundan bu kapı olmadan bildirim yeniden kurulurdu).
7. Bildirim `data` yükü yalnızca `{kind, weekStart}`; metinler sabit (`src/domain/content/notification-texts.ts`).

### Hesaplama kuralları — netleştirmeler (S2, 2026-09-22, qa-engineer bulgularına yanıt)

QA'nın S2 uç durum incelemesi 6 belirsizlik buldu; hiçbiri kullanıcıya görünen ürün davranışını
değiştirmiyor, hepsi saf uygulama netleştirmesi. Kararlar:

1. **Seviye eşikleri (KRİTİK):** `1,67` ve `2,33`, **`5/3` ve `7/3` kesirlerinin yuvarlanmış
   gösterimidir** (1-3 aralığının üç eşit parçaya bölünmesi: `1 + 2/3` ve `1 + 4/3`). Kod bu **tam
   kesirleri** kullanır, literal ondalık `1.67`/`2.33` değil — aksi halde tam `5/3` ortalaması (3
   günde `[1,2,2]` gibi, özellikle ilk kartın 3 günlük eşiğinde ulaşılabilir) yanlış sınıflanır.
   Sınır dahil olduğu taraf **orta**: ortalama `< 5/3` → düşük, `5/3 <= ortalama <= 7/3` → orta,
   `> 7/3` → yüksek.
2. **Delta büyüklüğü:** "seviye ortalaması" ifadesi **ham sayısal ortalamayı** (1-3 skalası) ifade
   eder, düşük/orta/yüksek etiketini değil. Fark kesin `+0,5`/`-0,5` ise **sabit (0)** sayılır (spec
   "üstü" = kesin üstü demek).
3. **"Geçen hafta" tanımı:** her zaman **takvimsel bir önceki Pazartesi-Pazar haftası**, kullanıcının
   en son veri girdiği hafta değil. Atlanan haftalarda bu doğal olarak "< 2 dolu gün → delta NULL"
   kuralını tetikler.
4. **"İlk kart" bilgisi:** `getWeekState` girdisi olarak ayrı bir `hasAnyPriorCard: boolean`
   parametresi alır (çağıran, `weekly_card` tablosunun boş olup olmadığına bakarak hesaplar). Domain
   katmanı SQLite'a dokunmaz, bu bilgiyi dışarıdan alır.
5. **`unlocked` tek alana indirildi:** `WeekState` iki ayrı belirsiz alan yerine `filledDays`,
   `requiredDays` (3 veya 4), `thresholdMet`, `timeMet`, `unlocked` (`thresholdMet && timeMet`)
   alanlarını taşır. UI'ın "kart için X gün kaldı" göstergesi `requiredDays - filledDays` ile kurulur.
6. **Geçmiş açılmamış haftalar:** `getWeekState`, `weekStart`'ı **parametre olarak alır** (yalnızca
   `now`'dan türetilen "içinde bulunulan hafta" değil) — böylece geçmiş, açılmamış bir hafta için de
   çağrılabilir. Birden fazla açık geçmiş haftayı bulup listelemek veri katmanının işidir (S5); domain
   yalnızca "bu belirli hafta şu an açılabilir mi" sorusuna cevap verir.
7. **Aynı `local_date`'e iki check-in:** Domain, `checkins` dizisini kendi içinde `local_date`'e göre
   filtreler/tekilleştirir (savunmacı); veri katmanının `PRIMARY KEY` kısıtı zaten bunu normalde
   engeller, bu ek bir garanti katmanıdır.

### Silme
Ayarlar'da "Tüm verilerimi sil": dört tabloyu boşaltır ve planlı bildirimleri iptal eder. (Yasal gerekçesi ve kapsamı security-reviewer'ın değerlendirmesine tabi.)

## API sözleşmesi

**Sunucu yoktur; uygulama hiçbir ağ çağrısı yapmaz. Bu nedenle HTTP uç noktası, istek/yanıt şeması, kimlik doğrulama tokenı yoktur.**
Bu, doğrulanabilir bir gereksinimdir: üretim derlemesinde ağ kullanımı olmamalı (Android'de INTERNET izni gerektiği kadar; plan'da izin listesi kontrolü ve manuel ağ izleme testi yer alır).

Bunun yerine iki tür **iç sözleşme** vardır.

**1) Modül sınırı sözleşmeleri (TypeScript imzaları, plan.md'de kesinleşir)**

> **Not (S2/S3 sonrası güncel imzalar):** Aşağıdaki iki satır, ilk yazıldıklarından beri S2 ve S3
> netleştirmeleriyle güncellendi/genişledi (bkz. "Hesaplama kuralları — netleştirmeler" bölümleri).
> `getWeekState` artık `weekStart` ve `hasAnyPriorCard`'ı ayrı parametre olarak alıyor (geçmiş
> haftaları sorgulayabilmek ve ilk-kart eşiğini bilmek için). `buildCard`'a S3'te **isteğe bağlı,
> geriye dönük uyumlu** 5. parametre (`prevVariants`) eklendi — satır/özet tekrar-önleme zincirini
> taşımak için; verilmezse eski 4-parametreli davranış aynen sürer. Gerçek kod bu blok değil,
> `src/domain/*.ts`'dir; burası yalnızca sözleşmenin özetidir.

```ts
// domain (saf, yan etkisiz)
getWeekState(params: { weekStart: string; now: Date; checkins: Checkin[]; hasAnyPriorCard: boolean }): WeekState
buildCard(weekCheckins: Checkin[], prevWeekCheckins: Checkin[], prevTitleId: string | null, weekStart: string, prevVariants?: PrevCardVariants): CardSnapshot

// data (SQLite repo)
saveCheckin(c: Checkin): Promise<void>
getCheckins(fromDate: string, toDate: string): Promise<Checkin[]>
getCard(weekStart: string): Promise<CardSnapshot | null>
saveCard(c: CardSnapshot): Promise<void>       // yalnızca ilk açılışta; sonra değişmez
deleteAllData(): Promise<void>

// notify
rescheduleAll(now: Date, state: WeekState, settings: Settings): Promise<void>

// card
captureCardPng(snapshot: CardSnapshot, hiddenLines: Set<'movement'|'sleep'|'spending'|'social'>): Promise<string /* dosya URI'si */>
shareCard(fileUri: string, message?: string): Promise<void>
```

**2) İşletim sistemine çıkan yüzeyler**
- **Paylaşım yükü:** 1080x1920 PNG + isteğe bağlı kısa metin (uygulama adı + bağlantı; E5). Gizli satırlar bitmap'te "???".
- **Yerel bildirim yükleri:** yalnızca sabit metin ("Bugünü işaretle" / "Karnen hazır"). İçinde veri değeri yok (kilit ekranında görünür).
- **Deneme raporu (E3):** kullanıcı tetikli; sayaç özeti içeren düz metin/JSON, paylaşım sayfasıyla kullanıcının seçtiği yere gider. Otomatik gönderim yok.

## MVP kapsamı

**Dahil:**
- Onboarding (kısa; bildirim izni istemi doğru anda; veri cihazda kalır mesajı)
- Günlük check-in: 4 kategori x 3 emoji seçenek, tek ekran, tek "Kaydet" (~8 sn hedef); bugün/dün düzenleme
- Hafta durumu: dolu gün göstergesi, "kart için X gün kaldı", **bulanık kilitli kart** (yer tutucu içerik)
- Pazar 20:00 sonrası kart açılışı: uygunluk >= 4 dolu gün (ilk kartta >= 3)
- Kart: 9:16, cihazda üretilen PNG; tepede unvan (30-40'lık yazılı havuz, davranıştan türetilir), 4 esprili satır (kategori başına 1), geçen haftaya göre değişim, gömülü uygulama damgası + mağaza bağlantısı
- **Satır gizleme:** paylaşmadan önce zorunlu önizleme; her satırda tek dokunuşla göster/gizle, gizli satır "???" olur; **uyku ve harcama satırları varsayılan gizli** gelir (güvenlik gereksinimi 3); gizleme yalnızca o paylaşım içindir (kalıcı değil)
- Sistem paylaşım sayfası ile paylaşım
- Yerel bildirim: günlük hatırlatma (varsayılan 21:00, ayarlanabilir/kapatılabilir) + Pazar kartı bildirimi
- Ayarlar: hatırlatma saati/aç-kapa, "Tüm verilerimi sil", gizlilik politikası bağlantısı, deneme raporu
- Cihaz içi kimliksiz ölçüm sayaçları (E3)
- Türkçe metin (E8)
- Testler: domain birim testleri (hafta sınırı, uygunluk, unvan kapsama, metin sınırları), repo entegrasyon testi, cihaz kontrol listesi
- Mağaza hazırlığı: ikon, ekran görüntüleri, gizlilik politikası (statik sayfa), listeler, iki mağazaya gönderim

**Dahil değil (v2+):**
- HealthKit / Health Connect / banka ve harcama entegrasyonları (otomatik veri kaynağı; iOS+Apple Health yönü v2 adayı)
- Ruh hali (5. kategori) ve kategori sayısını artırma
- Hesap, giriş, bulut yedekleme/senkronizasyon, çoklu cihaz
- Arkadaş karşılaştırma, sosyal özellikler, sıralama
- Geçmiş grafikleri, geçmiş kartlar galerisi, aylık/yıllık özet ("Wrapped" modu)
- Ödeme, abonelik, reklam, gelir hedefi
- Widget, kilit ekranı bileşenleri, Apple Watch / Wear OS
- Uygulama içi analitik SDK'sı, çökme raporlama SDK'sı, uzaktan yapılandırma (E3, E7)
- Instagram Story'ye doğrudan derin entegrasyon (yalnızca sistem paylaşım sayfası)
- Çok dilli destek (metin altyapısı hazır, çeviri v1 dışı), tema/özelleştirme, kart şablon seçenekleri
- Eski günlerin toplu düzenlenmesi (bugün ve dün dışında)
- Karanlık mod cilası (sistem varsayılanı ötesinde özel iş yok)
- Bildirim zengini içerik, kişiselleştirilmiş hatırlatma saati önerileri

## Güvenlik ve kalite gereksinimleri

**Durum: `security-reviewer` incelemesi yapıldı (2026-09-21) ve aşağıya işlendi.** Reviewer hukuki
danışman değildir; KVKK ile ilgili "belirsiz" işaretli noktalar için hukuki görüş gerekir (bkz. G-Açık).
Ürün kullanıcı beyanıyla uyku/hareket bilgisi tutar; **tasarımda ihtiyatlı davranılıp özel nitelikli
(sağlık) veri gibi ele alınır.**

**Temel ilke: cihaz içi veri.**
- Tüm kullanıcı verisi yalnızca cihazdaki SQLite dosyasında tutulur; v1'de hiçbir sunucuya, buluta, üçüncü taraf servise gönderilmez.
- Uygulama hesap, e-posta, telefon, reklam kimliği, konum veya cihaz kimliği toplamaz.
- Üçüncü taraf analitik/reklam/çökme SDK'sı eklenmez (bağımlılık eklerken bu kontrol edilir).
- Kart, ham değer taşımayan türetilmiş bir görseldir; üretim cihazda yapılır. Paylaşım yalnızca kullanıcı tetiklemesiyle olur.
- Kullanıcı istediği an tüm verisini silebilir.

**Güvenlik gereksinimleri (security-reviewer bulguları)**
1. Veri yalnızca cihazda; sunucu, hesap, ağ çağrısı yok. (Kesin)
2. Üçüncü parti SDK yok ya da denetlenmiş ve sürümü sabit; mağaza beyanı bununla tutarlı olmalı. Her yeni bağımlılık eklenirken "ağa veri gönderiyor mu" kontrol edilir.
3. **Paylaşım kartı (Important):** "ham veri yok" yeterli değil, unvan da seviyeyi ifşa eder. Paylaşmadan önce zorunlu önizleme; kategori bazlı göster/gizle; **uyku ve harcama satırları paylaşımda varsayılan gizli**; unvan gizlenen kategoriden türetilmez; kartta kullanıcı adı, tarih ve metadata/EXIF yok.
4. Bildirim metinleri veri seviyesi içermez (kilit ekranı).
5. Uygulama içi "tüm veriyi sil"; log'a veri yazılmaz; uygulama kilidi isteğe bağlı.
6. Yedekleme: **KARAR (2026-09-21, Batuhan): yedekten hariç tutulur** ("veri cihazdan çıkmaz" vaadiyle tutarlı; telefon değişince veri taşınmaz, sıfırdan başlanır). Android'de uygulama yedeği kapatılır, iOS'ta veri dosyası iCloud yedeğinden hariç işaretlenir; **her iki yapılandırmanın Expo'daki tam yolu plan aşamasında doğrulanacak**, doğrulanana kadar "tamam" sayılmaz. Onboarding/gizlilik metninde "veri yalnızca bu telefonda, telefon değişince taşınmaz" açıkça yazılır.
7. Sade aydınlatma metni + gizlilik politikası yazılır (mağazalar zaten ister).
8. Mağaza beyanı: veri cihaz dışına çıkmadığı için Apple "Data Not Collected", Google "veri toplanmıyor" beklenir; **Console'daki güncel tanım doğrulanacak.** Kategori olarak "Health & Fitness" yerine "Lifestyle" ve tıbbi iddia yok (öneri, kural değil).
9. Analitik ileride eklenirse: varsayılan kapalı ve açık onaylı, emoji verisi hiçbir koşulda gönderilmez, reklam kimliği yok, mağaza beyanı ve aydınlatma önce güncellenir, yurt dışı aktarım (KVKK m.9) değerlendirilir.

**G-Açık (hukuki/karar bekleyenler)**
- KVKK: beyan edilen emoji seçimleri özel nitelikli veri sayılır mı; veri yalnızca cihazdaysa geliştirici "veri sorumlusu" olur mu; aydınlatma/açık rıza/VERBİS yükümlülüğü var mı. **Belirsiz, hukuki danışmanlık gerekir.** Kapalı deneme dışına çıkmadan önce çözülmeli.
- Google "Health apps" beyan formunun bu uygulamayı kapsayıp kapsamadığı: Play Console'dan doğrulanacak.
- ~~G-Açık-1: Yedekleme kararı~~ **Karara bağlandı** (madde 6).

E10'daki sorular bu bulgularla büyük ölçüde yanıtlandı; kalanlar yukarıdaki "G-Açık" listesindedir.

**Kalite gereksinimleri (güvenlik dışı)**
- Domain katmanı testleri geçmeden kart/bildirim işi bitmiş sayılmaz; çıktı gösterilir (CLAUDE.md "Doğrulama").
- Zorunlu testler: 81 kombinasyon unvan kapsaması; hafta sınırları (Pazar 23:59 / Pazartesi 00:00, yıl sonu, ay sonu); uygunluk sınırları (normal hafta 3 gün = uygun değil / 4 gün = uygun; ilk kartta 2 gün = değil / 3 gün = uygun); metinlerde rakam ve uzunluk denetimi.
- Kart görseli en az 3 farklı ekran boyutunda ve iki platformda elle kontrol edilir (Türkçe karakter, taşma, emoji görünümü).
- Bildirimler gerçek iOS ve Android cihazda doğrulanır; emülatör yeterli sayılmaz.
- Üretim derlemesinde ağ kullanımı olmadığı doğrulanır.

## İşaretlenmiş endişeler

**Öncelik sırası: E1-E4 mimariyi veya takvimi doğrudan etkiler; Batuhan kararı bekler.**

**E1. Ana ölçüm analitiksiz nasıl ölçülür? (en kritik) — KARAR (2026-09-21, Batuhan): Seçenek A** (cihaz içi sayaçlar + kullanıcı tetikli deneme raporu). Seçenek B ve C v1'de yok; B ancak Batuhan'ın ayrı, açık kararıyla eklenir. Aşağıdaki sınırlar (paylaşım fazla/eksik sayımı, küçük örneklem) kabul edilmiştir; %25 eşiği "kesin doğrulama" değil "güçlü sinyal" olarak okunur.
Başarı ölçütleri: 7. günde check-in yapan oran ve kartı paylaşanların oranı (hedef %25). Ama "sunucu/hesap/analitik yok".
- Seçenek A (önerilen, spec'te MVP'ye alındı): **cihaz içi sayaçlar + kullanıcı tetikli "deneme raporu"**. Kapalı denemedeki testçiler ayarlardan raporu (yalnızca sayaç özeti: kurulum günü, dolu gün sayısı, D7 check-in var/yok, kart açıldı mı, paylaşım başlatıldı mı, kaç satır gizlendi) paylaşım sayfasıyla Batuhan'a yollar. Kimlik/içerik içermez (ancak gönderen, tanıdık bir grupta kendi adıyla/takma adıyla birleştirilebilir; "anonim" değildir). Ölçek 20-30 kişiyse elle toplamak yeterli.
- Seçenek B: kimliksiz anonim sayaç uç noktası (tek sunucu fonksiyonu). Ölçümü otomatikleştirir ama "v1'de sunucu yok" kararını bozar ve gizlilik beyanını değiştirir. **Batuhan kararı olmadan eklenmez.**
- Seçenek C: yalnızca mağaza konsolu (kurulum, saklama). Check-in ve paylaşımı ölçmez; tek başına yetmez.
- **Ölçümün kendi sınırları (dürüstçe):**
  - "Paylaştı" doğrudan gözlenemez. İşletim sistemi paylaşım sayfasından geri dönen sonuç güvenilir değil (özellikle Android; hedef uygulama bilinmez). En iyi ölçüm **"paylaşım sayfası açıldı"**, bu da paylaşımı **fazla** sayar.
  - Intent'in kendisi "ekran görüntüsü alıp Story'de paylaşma" davranışını varsayıyor. Ekran görüntüsü uygulamadan görünmez (dinleyici API'leri platforma göre kısıtlı/izin gerektirir) -> paylaşım oranı **eksik** ölçülür. İki yanlılık zıt yönde; net etkisi bilinmez.
  - "Kendiliğinden" şartı: denemede testçilere paylaşmaları söylenirse ölçüt bozulur. Testçilere paylaşım için yönlendirme yapılmamalı; ancak bu, "sosyal beğenirlik" yanlılığını ortadan kaldırmaz.
  - Örneklem küçük (20-30 kişi): %25 eşiği 5-8 paylaşıma denk gelir; istatistiksel gürültü büyük. Eşik "kesin doğrulama" değil "güçlü sinyal" olarak okunmalı.
  - **Payda tanımı netleştirilmeli:** "paylaşanların oranı" = kartı **gören** (`card_opened >= 1`) kullanıcılar içinde paylaşımı başlatanlar mı, yoksa tüm kurulumlar içinde mi? Intent "kartı gören" diyor; spec bunu benimser. Kartı hiç görmeyenler (aşağıdaki E4-c) ayrıca raporlanır, yoksa ürün başarısızlığı "kart beğenilmedi" gibi okunabilir.
  - D7 tanımı: kurulum günü = gün 1; gün 7'de (yerel takvim) dolu check-in var mı. Cihaz içinde `first_open_date` + `checkin` ile hesaplanır.
- Sayaç olayları `metric_event` tablosunda; içerik taşımaz.

**E2. iOS "Mac olmadan" mümkün mü? Apple hesabı çelişkisi — KARAR (2026-09-21, Batuhan): Android-first.** Kod tabanı ortak kalır; geliştirme ve iç test önce Android'de yapılır, iOS gerçek cihaz testi Apple üyeliği alındığında yapılır (üyelik zamanı hâlâ açık, kart durumuna bağlı). `plan.md` Android-first test dizilimini içermeli ve iOS'a özgü riskleri (bildirim, paylaşım, font, emoji görünümü) erkene çekmenin yollarını (örn. iOS'a özgü kodu minimumda tutmak) belirtmeli.
Derleme (EAS) Mac gerektirmez; **ama gerçek iPhone'da çalıştırmak/test etmek ücretli Apple Developer Program üyeliği (99 $/yıl) gerektirir** (bilinen kural; plan aşamasında Expo/Apple dokümanından doğrulanacak). iOS simülatörü Windows'ta çalışmaz. Intent ise "kart durumu netleşmedi" diyor ve yayın kararını ertiyor. Sonuç: kart olmadan iOS tarafı fiilen **test edilemez**, yani "iOS+Android tek kod tabanı" kararı ilk günden Apple ödemesine bağlı. Geliştirme Android'de (emülatör/cihaz) ilerleyebilir; iOS'a özgü riskler (bildirim, paylaşım, font, emoji görünümü) geç keşfedilir. **Karar gerekli:** Apple üyeliği ne zaman alınacak? Öneri: kod tabanı ortak kalsın, plan.md'de Android-first iç test dizilimi olsun.

**E3. Sunucusuzluk ile ölçüm/içerik güncelleme çelişkisi**
Metin havuzunun (espri) deneme sırasında iyileştirilmesi değerli olur; uygulama güncellemesi mağaza incelemesi gerektirir (özellikle iOS). OTA güncelleme (EAS Update) bunu çözer ama bir bulut bileşenidir; "bulut yok" kararının **yorumu** gerekir (veri değil kod indirilir). Varsayılan: **v1'de kapalı**. Batuhan onaylarsa plan'a girer.

**E4. Kart akışı iç çelişkileri**
- (a) **Pazar 21:00 hatırlatma vs 20:00 kart:** Kullanıcı Pazar akşamı 4. günü 21:00 hatırlatmadan sonra doldurabilir; kart daha önce açılmışsa o günün verisi kartta olmaz. Spec'te çözüm: Pazar günü kart açılışında bugünkü check-in yoksa önce check-in istenir (Veri modeli > Bildirim kuralları). Alternatif: Pazar hatırlatmasını 19:30'a çekmek. UX ajanıyla uyum ve Batuhan onayı gerekir.
- (b) **İlk hafta / orta hafta kurulumu — KARAR (2026-09-21, Batuhan): ilk kart için eşik >= 3 gün** (sonraki haftalar >= 4). Gerekçe: Perşembe/Cuma kuran kullanıcı 4 günü dolduramaz ve ilk "wow" anı 1-2 hafta gecikir. Kalan not: Cuma akşamı kuran biri Cumartesi+Pazar ile en fazla 3 gün doldurabilir (Cuma dahil), yani sınırda; Cumartesi kuran ilk Pazar'da uygun olamaz, ikinci haftaya kalır. Bu kabul edilen bir kenar durumdur.
- (c) Kartı hiç görmeyenler paylaşım oranı paydasına girmez; ayrıca "kart açan / kurulum" oranı raporlanmalı (E1).

**E5. "Mağaza bağlantısı" kartta nasıl çalışır?**
Görüntü içindeki metin tıklanmaz. Ayrıca yayın olmadan gerçek mağaza URL'si yok (Apple/Google kart durumu belirsiz). Seçenekler: kısa metin URL + paylaşım mesajına bağlantı (WhatsApp'ta çalışır, Instagram Story paylaşım sayfasında metin çoğu zaman düşer) + isteğe bağlı QR kodu. İki mağazaya tek bağlantı için "akıllı yönlendirme" statik sayfası gerekir (kod gerektirir, ama sunucu değil). Denemeden önce yer tutucu alan adı kullanılacak; hangisi kararlaştırılmadı.
Ayrıca "silinemeyen damga" yalnızca uygulama içinde silinemez; kullanıcı görseli kırpabilir. Bu bir gereksinim değil bir sınırdır.

**E6. Süre tahmini ve belirsizlik**
Tahmin (etkin iş günü): kurulum/araç zinciri 3-4; domain katmanı 4-5; içerik yazımı 3 (Claude taslak, Batuhan espri düzeltmesi); veri katmanı 2; check-in/hafta/onboarding/ayarlar UI 4-5; kart + kilitli kart + gizleme + paylaşım 5-7; bildirimler 3-4; ölçüm sayaçları 1-2; iki platformda cihaz testi/cila 4-5; mağaza hazırlığı 4-5. **Toplam 33-42 iş günü, planlama değeri ~38** (tam zamanlı 7-9 hafta; iş yükünün yarısı ayrılırsa 14-18 hafta = 2-4 ay sınırının üst ucu). Batuhan'ın haftalık uygun saat sayısı bilinmiyor; **tahmin bu varsayıma bağlı**. Mağaza inceleme beklemesi (Apple genelde günler, ret olasılığı var) ve Google Play kapalı test süresi (E11) bu toplama dahil değildir; denemenin 4 haftası da dahil değildir. CLAUDE.md "Bilinen tuzaklar" boş olduğundan geçmiş sapma verisi yok; buna karşılık üst uç tahmine ~%15 tampon eklendi. Daha zor kısımlar (hafta/bildirim mantığı, görsel tutarlılık, iOS dolaylı test) çarpanı 1.5-2x'e düşürür; CRUD/UI kısımlar hızlı ilerler, tahmin dengelenmiştir.

**E7. Sunucusuz ürünün hata görünürlüğü**
Çökme raporu SDK'sı eklenmedi (veri toplamama ilkesi). Sonuç: cihazdaki hatalar yalnızca mağaza konsollarının toplu çökme raporlarından ve testçi bildirimlerinden görülür. Kapalı denemede küçük örneklemle bu yeterli olabilir; ölçeklenirse yeniden bakılmalı.

**E8. Dil / ad / pazar (intent Open questions 5, 6, 7 hâlâ açık)**
Türkçe espriler çeviriyle yürümez; v1 yalnızca Türkçe, hedef Türkiye. Uygulama adı belirlenmedi (kartta damga ve mağaza kaydı için gerekli; ad sonradan değişirse kart damgası ve URL'leri etkilenir). Rakip sayıları (ör. Fitness Wrapped 43 yorum) mağaza sayfalarında elle doğrulanmadı; intent bunu spec öncesi istemişti, bu spec **doğrulamadı**.

**E9. Türkiye pazarı notları**
Hafta Pazartesi başlar (Türkiye), farklı yerel ayarlı kullanıcılarda tartışmalı olabilir; v1'de sabit. Türkiye'de Android payı yüksektir (oran bu spec'te doğrulanmadı); ilk deneme ağırlıkla Android çıkabilir, iOS dolaylı test riski (E2) buna göre önceliklendirilir.

**E10. Gizlilik/güvenlik konusunda `security-reviewer`'a bırakılan açık noktalar (karar verilmedi)**
- "Veri yalnızca cihazda" iddiası ile **işletim sistemi yedeklemesi** çelişebilir: Android Auto Backup ve iCloud yedeği varsayılan olarak uygulama verisini buluta kopyalayabilir. Yedekten hariç tutma kararı (veri yeni telefona taşınamaz vs. bulut yedeği) verilmedi.
- Uyku/hareket beyanı sağlık verisi sayılır mı; yalnızca cihazda kalan veri yükümlülüğü değiştirir mi (intent Open question 3).
- Apple/Google gizlilik beyan formlarının doğru cevapları.
- Bildirim metinleri kilit ekranında görünür (sabit metin, veri yok; yine de değerlendirilmeli); uygulama geçiş ekranı önizlemesi.
- "Tüm verilerimi sil"in kapsamı (deneme raporu, paylaşılmış görseller dahil değil).
- Paylaşılan PNG cihaz önbelleğinde kalıyor; temizleme politikası.

**E11. Google Play kapalı test şartı**
Kişisel geliştirici hesapları (13 Kasım 2023 sonrası açılmış) için üretime çıkmadan önce **>= 12 test kullanıcısının 14 gün kesintisiz kapalı testte olması** gerekir (Play Console yardım sayfasından doğrulandı; kaynak aşağıda). Batuhan'ın hesabının ne zaman açıldığı bilinmiyor. Bu, 4 haftalık kapalı denemeyle **doğal olarak örtüşür** (12+ testçi zaten hedef), ama Google'ın kontrol ettiği gerçek kullanım kriterlerine dikkat edilmeli. Testçiler gerçek cihaz ve gerçek Google hesabı olmalı.

**E12. Ürün riski (mimari değil, bilinçli kabul)**
Intent'te kabul edilen riskler aynen geçerli: talep kanıtı zayıf, haftalık ritüelde paylaşım yorgunluğu ölçülmemiş, tüketici gelir tavanı düşük. Kapsam genişletme eşik tutmazsa yasak (intent).

**E13. Küçük belirsizlikler**
- Intent dosyasının `Status:` satırı hâlâ `draft` yazıyor, ama intent commit'lenmiş (`feab3e1`). Batuhan durumu `accepted` yapmak isteyebilir.
- Görev tanımındaki UX ajanı çıktısına ayrı bir dosya olarak erişilemedi; ekran/emoji/kart yerleşim ayrıntıları için yalnızca sabit kararlar kullanıldı. Emoji seti ve kart yerleşimi UX çıktısıyla karşılaştırılmalı.
- Emoji görünümü iki platformda farklıdır (Apple ve Android sistem emojileri); kartta emoji kullanılacaksa iki tarafta görünüm elle doğrulanacak, kabul edilebilir fark sayılacak.
- Ekran boyutu/font ölçeği erişilebilirlik ayarlarında bozulan yerleşim: kart sabit boyutlu olduğu için etkilenmez, uygulama ekranları için plan'da test maddesi.
- Bildirim güvenilirliği: bazı Android üreticilerinde (agresif pil yönetimi) zamanlanmış yerel bildirim gecikebilir veya kaybolabilir; ölçümde D7/paylaşım düşüşü bildirim sorunundan mı ürün sorunundan mı ayırt edilemeyebilir.

---
**Kaynaklar (doğrulanan)**
- Google Play kapalı test şartı: [App testing requirements for new personal developer accounts - Play Console Help](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- EAS ücretsiz katman kotası (üçüncü taraf özet; plan aşamasında resmi dokümandan doğrulanmalı): [Subscriptions, plans, and add-ons - Expo documentation](https://docs.expo.dev/billing/plans/)

**Onay noktası:** Claude yazar, **Batuhan onaylar ve commit'ler.**
Commit, Build aşamasını başlatır. Bu dosya henüz commit edilmemiştir. `security-reviewer` bulguları eklendi. E1, E2, E4(b) ve yedekleme kararları 2026-09-21'de verildi. Onaydan önce kalan açıklar: E3 (OTA güncelleme, varsayılan kapalı), E4(a) (Pazar 21:00 hatırlatma / 20:00 kart çakışması), E5 (mağaza bağlantısı), E8 (uygulama adı) ve G-Açık'taki KVKK sorusu (kapalı deneme dışına çıkmadan çözülmeli).

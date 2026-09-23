# Emoji Seti — 4 kategori x 3 seviye (U0)

Kaynak: `spec.md` "Veri modeli > checkin tablosu" (s.107-109, örnek: hareket
durgun/hafif/yoğun, uyku kötü/idare/iyi, harcama az/orta/çok, sosyal
yalnız/ölçülü/kalabalık), `plan.md` U0 çıktı listesi.

## Seçim ilkeleri (gerekçeli)

1. **Yalnızca Unicode 6.0-7.0 (2010-2014) taban emoji, ZWJ dizisi yok, cilt
   tonu/cinsiyet varyantı yok.** Çünkü bu sürümler hem Android hem iOS'ta
   yıllardır en geniş ve en tutarlı desteğe sahip; kart bir kez üretilip
   PNG'ye donduğu için (spec: cihazda yakalanır, sonra değişmez) render
   anındaki küçük bir font farkı bile kalıcı bir görsel kusura dönüşür.
   Karmaşık ZWJ dizileri (ör. çok kişili "aile" emojileri) bazı eski
   sistem fontlarında "kutucuk+ayrı emoji" olarak parçalanıp yanlış
   görünebilir — bu risk tamamen elenmiştir.
2. **Değer sırası (1=düşük, 2=orta, 3=yüksek) her kategoride soldan sağa,
   "az yoğun → çok yoğun" okunacak şekilde.** Çünkü spec: "sıralı yoğunluk,
   iyi/kötü değil" — emoji seçimi de bunu yansıtmalı, üçüncü seçenek
   "ödül/doğru cevap" gibi hissettirilmemeli (ör. hiçbir seviyede yeşil
   tik/kırmızı çarpı gibi örtük bir "doğru/yanlış" imgesi kullanılmadı).
3. **Ton: hafif esprili, günlük dilde tanıdık.** Domuz kumbarası (az
   harcama) veya kaplumbağa (durgun hareket) gibi seçimler "tanısız,
   tavsiyesiz" ton kuralıyla (spec) uyumlu — sağlık/performans yargısı
   içermeyen, gündelik metafor.

## Emoji seti

| Kategori | Seviye 1 (düşük) | Seviye 2 (orta) | Seviye 3 (yüksek) |
|---|---|---|---|
| Hareket | 🐢 kaplumbağa | 🚶 yürüyen kişi | 🏃 koşan kişi |
| Uyku | 😪 uykulu yüz | 😌 huzurlu yüz | 😴 uyuyan yüz (ZZZ) |
| Harcama | 🐷 domuz (kumbara) | 💳 kredi kartı | 💸 uçan para |
| Sosyal | 👤 tek kişi silüeti | 👥 iki kişi silüeti | 🎉 parti düdüğü |

Spec'in `checkin` tablosundaki `movement/sleep/spending/social` alanlarının
1/2/3 değerleriyle birebir eşleşir; kartta ve check-in ekranında aynı emoji
kullanılır (tek kaynak, iki yerde ayrı ikon seti yok).

## Neden bu 12 tanesi (kategori bazlı gerekçe)

- **Hareket — 🐢 / 🚶 / 🏃:** aynı "canlı, yürüyen" ailesinden üç adım;
  kullanıcı üç seçeneği yan yana gördüğünde aralarındaki artan yoğunluğu
  şekilden bile anlar (duruş → yürüyüş → koşu), metne gerek kalmadan sezgisel.
- **Uyku — 😪 / 😌 / 😴:** yüz ifadesi ailesi (`face`), Unicode 6.0-6.1,
  hiçbiri tıbbi/klinik bir görüntü taşımıyor (spec: sağlık iddiası yasak);
  "kötü gece" ile "iyi gece"yi yüz ifadesiyle ayırt etmek, ikon aramaktan
  daha hızlı okunur.
- **Harcama — 🐷 / 💳 / 💸:** kumbara→kart→uçan para sıralaması parasal
  yoğunluğu görsel olarak da artan bir metaforla taşıyor; 💸 (uçan para)
  "çok harcadım" espirisiyle ton kuralına uygun, utandırıcı değil.
- **Sosyal — 👤 / 👥 / 🎉:** kişi sayısının artışı (1→2→kalabalık/kutlama)
  doğrudan "yalnız/ölçülü/kalabalık" tanımını görselleştiriyor; 🎉 spesifik
  bir aktiviteye (ör. bar, konser) işaret etmediği için genel kalıyor.

## Kaçınılan alternatifler (kısaca)

- Cinsiyetli/cilt tonlu "koşan adam/kadın" varyantları (`🏃‍♂️`, `🏃‍♀️`) —
  ZWJ + modifier riski, ayrıca cinsiyet seçimi ürünün konusu değil.
- Sağlık temalı ikonlar (💊, 🩺, ⚕️) uyku/hareket için — "tıbbi iddia yok"
  kuralını çiğneme riski, kesinlikle kullanılmadı.
- Para birimi sembolleri (💶, 💴 gibi bölgesel) — Türkiye pazarı (spec E9)
  için anlamsız/yanıltıcı, evrensel 💳/💸/🐷 tercih edildi.
- Meditasyon/yoga figürü (🧘) sosyal-düşük için — sosyal ile karıştırılabilir
  bir "sakinlik" çağrışımı taşıyor, "yalnız" anlamını 👤 kadar net vermiyor.

## Platform doğrulama notu (S7'ye devir)

Bu seçim tasarım kararıdır; spec E13 zaten not düşüyor: "emoji görünümü iki
platformda farklıdır, kartta kullanılacaksa iki tarafta görünüm elle
doğrulanacak, kabul edilebilir fark sayılacak." `plan.md` S7a bu 12
emojinin Android+iOS gerçek cihazlarında (Apple/Google sistem fontlarında)
görsel karşılaştırmasını yapmalı; büyük bir uyumsuzluk çıkarsa (ör. bir
emoji bir platformda tamamen farklı bir simgeye render oluyorsa) bu dosyaya
geri dönülüp değiştirilmeli.

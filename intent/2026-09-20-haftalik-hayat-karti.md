# Intent: Haftalık Hayat Karnesi (paylaşılabilir haftalık kart)
Author: Batuhan. Status: draft.

## Problem
İnsanlar kendi haftalarını (hareket, uyku, harcama, sosyallik) hiçbir zaman
tek bakışta, eğlenceli ve paylaşmaya değer bir biçimde görmüyor. Var olan
araçlar ya sıkıcı takip panelleri (Daylio, Bearable, Gyroscope) ya da
yalnızca tek kaynaktan (Apple Fitness) beslenen özetler. Spotify Wrapped'ın
kanıtladığı gibi, kişinin kendi verisi kendine gülebileceği, ekran görüntüsü
alıp Story'de paylaşacağı bir karta dönüştüğünde organik dağıtım doğuyor;
ama bu mekanik yılda bir kez ve yalnızca müzik için var. Batuhan bunu kendi
hayatında da kullanacak (dogfooding) ve viral potansiyeli olan, iki mobil
mağazada yer alabilecek bir ürün olarak deniyor.

## Proposed outcome
- Kullanıcı haftada en az 4 gün, günlük yaklaşık 10 saniyeden kısa bir
  etkileşimle veri verir (veya veri otomatik gelir).
- Her pazar akşamı, kullanıcı tek ekranlık, 9:16 formatında bir "haftalık
  karne" kartı açar: kişiye özel bir unvan, birkaç satırlık esprili özet,
  geçen haftaya göre değişim. Ham sayı/tutar/konum kartta görünmez.
- Kullanıcı kartı tek dokunuşla Story/WhatsApp'a paylaşır; kartta uygulamaya
  geri götüren bir damga bulunur.
- **Başarı ölçütü (ürün-pazar sinyali):** 4 haftalık kapalı denemede, kartı
  gören kullanıcıların en az **%25'i** kartı kendiliğinden paylaşır. Ek
  gösterge: 7. günde check-in yapan kullanıcı oranı. Bu eşik tutmazsa ürün
  ele alınır, kapsam genişletilmez.

## Affected users and systems
- **Kullanıcı:** Türkiye ağırlıklı, akıllı telefon kullanan, sosyal medyada
  Story paylaşan genç/yetişkin bireyler. Batuhan ilk kullanıcı.
- **Sistemler:** iOS ve Android mobil uygulama (mağaza hedefi: App Store +
  Google Play); cihaz içi kart görseli üretimi; yerel bildirim; işletim
  sisteminin paylaşım sayfası. Sunucu/hesap sistemi v1 için gerekmeyebilir.
- **Hassas alan:** Uyku/hareket bilgisi KVKK'da özel nitelikli sağlık verisi
  sayılabilir; Apple ve Google sağlık verisi politikaları geçerli.

## Constraints
- **Kapsam dar:** tek iş (haftalık kart), tek "wow anı". Arkadaş
  karşılaştırma, hesap sistemi, ödeme, geçmiş grafikleri, aylık/yıllık özet
  v1 dışı.
- **Geliştirici:** Tek kişi, Windows, Claude Code ile. iOS derlemesi için Mac
  gerekmemeli (bulut derleme). Cross-platform tek kod tabanı hedeflenir.
- **Mağaza yayını:** Apple Developer (99 $/yıl) ve Google Play (25 $ tek
  seferlik) kart gerektirir; kart durumu netleşmedi, tasarım/geliştirme
  bundan bağımsız ilerler, yayın kararı sonra verilir.
- **Gizlilik:** Kartta ham sağlık/harcama verisi olmaz; kart cihazda üretilir;
  minimum veri toplama ilkesi geçerli.
- **Gelir:** Tüketici mağazalarında uygulamaların ~%81'i ayda 1.000 $'ı
  geçemiyor; bu bilinen bir risk olarak kabul edildi (Batuhan tüketici rotasını
  bilinçli seçti), v1'de gelir hedefi yok, amaç doğrulama.
- **İnsan onay noktaları:** intent.md ve spec.md'yi Batuhan commit'ler; plan
  onaylanmadan kod yazılmaz.

## Open questions
1. ~~**Veri kaynağı çelişkisi**~~ **KARARA BAĞLANDI (2026-09-20, Batuhan):**
   v1 = günlük emoji check-in (günde ~8 sn, 4 kategori), otomatik kaynak
   yok, iOS + Android tek kod tabanı. Gerekçe: 4 kategoriyi tek yolla
   kapsar, sağlık izni istemez (KVKK/mağaza yükü düşük), iki mağaza hedefiyle
   uyumlu. Kabul edilen risk: kullanıcı haftada 4 gün doldurmayabilir; bu,
   7. gün check-in oranıyla ölçülecek. (Rakip taraması iOS-only + Apple
   Health önermişti; bu yön v2 adayı olarak saklandı.)
2. **Talep kanıtı zayıf:** En yakın rakip (Fitness Wrapped) yalnızca 43
   yorumlu; boşluk fırsat mı talep yokluğu mu belli değil. Kapalı deneme
   yapılmadan önce hangi minimum yatırımla test edeceğiz (örn. Android-only
   veya iOS-only ilk sürüm mü)?
3. **KVKK:** Kullanıcının beyanıyla girdiği uyku/hareket emojileri özel
   nitelikli sağlık verisi sayılır mı? Veri yalnızca cihazda kalırsa yükümlülük
   değişir mi? (`security-reviewer` değerlendirmeli.)
4. **Haftalık ritüel dayanıklılığı:** Wrapped yıllık kıtlıkla çalışıyor;
   haftalık versiyonda paylaşım yorgunluğu ölçülmüş veri bulunamadı. %25
   eşiği ve 4 haftalık deneme süresi doğru kalibrasyon mu?
5. **Uygulama adı ve dil:** Türkçe esprili ton Türkiye dışına taşınabilir mi,
   hedef sadece Türkiye mi?
6. **Mağaza kartı:** Apple/Google kaydı için ödeme kartı durumu (tasarımdan
   sonra netleşecek).
7. Rakip taraması sayıları mağaza sayfalarında elle doğrulanmadı; spec
   aşamasından önce doğrulanmalı.

---
**Dosya adı kuralı:** `intent/YYYY-MM-DD-kisa-slug.md`
(ASCII, küçük harf, tire ile ayrılmış — Türkçe karakter kullanma)

**Onay noktası:** Bu dosyayı Claude yazar, **Batuhan commit'ler.**
Commit, Design aşamasını başlatan olaydır.

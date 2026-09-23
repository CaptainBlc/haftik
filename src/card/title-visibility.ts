/**
 * Unvan otomatik gizleme kararı (spec güvenlik gereksinimi 3: "unvan
 * gizlenen kategoriden türetilmez"; spec S3 netleştirme #3'ün ürettiği
 * `TitleResult.basedOnCategories` verisi; `docs/ux/ekran-akisi.md` "Ekran 5":
 * "eğer unvan gizlenen bir kategoriden türetildiyse ... bu S7'nin iş kuralı
 * gereği otomatik olarak değişir/gizlenir").
 *
 * **Tasarım kararı (bu dilimde, S7b, alınmıştır — gerekçe):** unvan, kartta
 * kullanıcının aç/kapa dokunabileceği ayrı bir satır DEĞİLDİR
 * (`ekran-akisi.md`: "unvan gizlenemez ayrı bir satır olarak listelenmez").
 * Unvan metni zaten `buildCard` tarafından dondurulmuş `title.text`tir;
 * "değişmesi" farklı/alternatif bir unvan render etmek OLAMAZ — böyle bir
 * ikinci unvan seçme mekanizması yok, olsaydı bile "dondurulan kart bir daha
 * değişmez" garantisini (spec "Veri modeli > weekly_card") bozardı ve
 * `CardView`'in "yalnızca dondurulmuş alanlardan render eder, içerik
 * havuzunu tekrar çözümlemez" mimari sınırını ihlal ederdi (bkz.
 * `CardView.tsx` başlığı). Bu yüzden en basit ve tutarlı çözüm: satırlarla
 * AYNI mekanizma — `basedOnCategories`teki kategorilerden en az biri şu an
 * gizliyse, unvan da (satırlar gibi) `???` olarak çizilir; hiçbiri gizli
 * değilse gerçek unvan metni görünür.
 *
 * `basedOnCategories === []` olan genel kurallar (ör. "dört kategori
 * ortada", spec S3 netleştirme #3) hiçbir tek/çift kategoriye özgü
 * olmadığından bu kuralın kapsamı dışındadır — hiçbir gizleme eyleminden
 * etkilenmez, her zaman görünür kalır (boş kümenin `.some(...)` sonucu
 * zaten her zaman `false`, ayrı bir özel durum kodu gerekmez).
 */
import type { Category } from '@/domain/types';

export function shouldHideTitle(
  basedOnCategories: readonly Category[],
  hiddenCategories: ReadonlySet<Category>
): boolean {
  return basedOnCategories.some((category) => hiddenCategories.has(category));
}

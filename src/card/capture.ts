/**
 * PNG yakalama (spec "API sözleşmesi" > `captureCardPng`; S1 spike'ının
 * [`spike/view-shot/CardCaptureSpike.tsx`] gerçek koda taşınmış hali,
 * `plan.md` S1 madde 5b).
 *
 * **İmza sapması (dokümante edilmiş):** görev talimatı `captureCardPng(
 * snapshot: CardSnapshot): Promise<string>` şeklinde tek parametreli bir
 * imza istiyor, ama `react-native-view-shot` yalnızca ağaca zaten monte
 * edilmiş (render edilmiş) bir `View`in ref'ini yakalayabilir — saf bir
 * `CardSnapshot` değerinden, hiç render etmeden doğrudan PNG üretmenin
 * React Native'de yerleşik bir yolu yok. Bu yüzden burası, S1 spike'ındaki
 * `captureCardSpike(ref)` ile aynı desende bir `ViewShotRef` alır: çağıran
 * taraf (kart açılış ekranı) önce `<CardView ref={viewShotRef}
 * snapshot={snapshot} />`'ı render eder, sonra bu fonksiyonu çağırır.
 *
 * **S7b kararı — `hiddenLines`/`hiddenCategories` parametresi buraya
 * EKLENMEDİ (bilinçli, dokümante edilmiş):** spec'in `captureCardPng(
 * snapshot, hiddenLines)` imzası, `snapshot`'ı fonksiyonun kendisinin render
 * ettiği bir dünya varsayıyordu. Ama S7a'da yukarıdaki sapma nedeniyle bu
 * fonksiyon zaten bir `CardView` render ETMİYOR, yalnızca ÖNCEDEN render
 * edilmiş bir `View`in piksellerini yakalıyor. Bu tasarımda gizleme kararı
 * zaten çağıran ekranın (`src/components/card-preview-view.tsx`) `<CardView
 * hiddenCategories={...} ref={viewShotRef} />` ile RENDER ANINDA verdiği bir
 * karardır — o View "???" ile render edilmişse, `captureCardPng` onu olduğu
 * gibi (zaten maskeli) yakalar. Buraya ikinci bir `hiddenCategories`
 * parametresi eklemek gereksiz/çelişkili olurdu (iki ayrı kaynaktan
 * "hangi kategoriler gizli" bilgisi taşımak, tutarsızlık riski yaratır).
 * Tek kaynak `CardView`in prop'udur; bkz. o dosyanın başlığı.
 */
import type { RefObject } from 'react';
import { captureRef } from 'react-native-view-shot';
import type { ViewShotRef } from 'react-native-view-shot';

import { CARD_OUTPUT_HEIGHT, CARD_OUTPUT_WIDTH } from './layout';

/**
 * Zaten render edilmiş bir `CardView`in (`ViewShot` ref'i) 1080x1920 PNG'ye
 * yakalanmış dosya URI'sini döndürür.
 *
 * **Metadata/EXIF/kullanıcı adı/tarih PNG'ye gömülmez** (güvenlik
 * gereksinimi 3): `captureRef` yalnızca View ağacının görsel piksellerini
 * yakalar, hiçbir ek meta veri eklemez/okumaz; `CardView` zaten yalnızca
 * dondurulmuş metin/emoji çizdiği için (bkz. `CardView.tsx` başlığı)
 * yakalanan görüntüde kullanıcı kimliği, cihaz bilgisi veya sistem saati
 * gibi bir şey hiç yer almaz — ekstra bir "meta veri temizleme" adımına
 * gerek yoktur, çünkü zaten hiç eklenmemiştir.
 */
export async function captureCardPng(ref: RefObject<ViewShotRef | null>): Promise<string> {
  if (!ref.current) {
    throw new Error('captureCardPng: ref henüz bağlı değil (CardView mount olmamış).');
  }
  return captureRef(ref, {
    width: CARD_OUTPUT_WIDTH,
    height: CARD_OUTPUT_HEIGHT,
    format: 'png',
    quality: 1,
  });
}

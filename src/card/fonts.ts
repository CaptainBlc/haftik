/**
 * Kart metni için paketlenmiş font (`plan.md` S7a bağımlılığı; Riskler #1
 * "Kart görseli iki platformda aynı görünmesi" gerekçesi: "font paketlenir"
 * — Türkçe karakterlerin (ğ ş ı İ ö ü ç) ve iki platformda tutarlı
 * görünmenin sistem fontuna güvenilerek sağlanamaması, bkz. spec "Teknoloji
 * yığını > Kart görseli").
 *
 * **Emoji paketlenmez:** yalnızca metin fontu paketlidir; emoji için
 * sistem emoji fontu kullanılır (görev talimatı). `CardView.tsx`'te emoji
 * `Text`'lerine bu font ailesi hiç uygulanmaz (bkz. o dosyadaki `emoji`
 * stili — bilerek `fontFamily` almaz).
 *
 * **Font seçimi — Google Fonts "Inter":** geniş Latin Extended kapsamı
 * (Türkçe ğ ş ı İ ö ü ç dahil), MIT/OFL lisanslı, `@expo-google-fonts/inter`
 * ile hazır `.ttf` paketleri halinde gelir (`expo-font` üzerinden yüklenir
 * — S1 spike'ının [`spike/view-shot/CardCaptureSpike.tsx`] sistem fontuyla
 * kanıtladığı `react-native-view-shot` + font yükleme API'sinin gerçek,
 * paketlenmiş bir fontla çalışan hali).
 *
 * **Bilerek alt-yol (subpath) importu, kök paket importu DEĞİL:**
 * `@expo-google-fonts/inter`'ın kök `index.js`'i TÜM ağırlıkları (18 dosya,
 * ~6MB `.ttf`) `require` eder; yalnızca üç ağırlık (Regular/Bold/Italic)
 * gerektiğinden `@expo-google-fonts/inter/400Regular` gibi alt-yol
 * importları kullanılır — bu, yalnızca ihtiyaç duyulan üç `.ttf` dosyasının
 * pakete dahil edilmesini sağlar (paketin kendi belgelerinin önerdiği
 * kullanım biçimi).
 */
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_400Regular_Italic } from '@expo-google-fonts/inter/400Regular_Italic';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';

/**
 * `CardView.tsx`'in kullandığı sabit font ailesi adları. Tek kaynak: kart
 * dışında bu isimler başka hiçbir dosyada literal olarak tekrarlanmaz.
 */
export const CARD_FONT_FAMILY = {
  regular: 'Inter_400Regular',
  bold: 'Inter_700Bold',
  italic: 'Inter_400Regular_Italic',
} as const;

/**
 * Kart ekranının fontları yüklenene kadar `[false, null]`, yüklendikten
 * sonra `[true, null]` (veya hata varsa `[false, Error]`) döner. Kart
 * ekranı (`src/app/card/[weekStart].tsx`) `CardView`'i bu `true` olmadan
 * render etmez (aksi halde bir an için sistem fontuna düşebilir).
 */
export function useCardFonts(): [boolean, Error | null] {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_400Regular_Italic,
  });
  return [loaded, error ?? null];
}

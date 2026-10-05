/**
 * Kart v2 fontları (B3 onaylı: Fraunces + Inter; 17 §2.5). Fraunces 800 (unvan, wordmark, başlık),
 * Fraunces 600 italik (seviye kelimesi, özet), Inter 500/700/800 (satır, etiket, düğme).
 *
 * **Geçiş notu (S19):** `fonts.ts` (v1: Inter 400/700/400i) `CardView` v1 için yerinde duruyor.
 * `CardView` v2 geldiğinde bu dosya `fonts.ts`'in yerini alır, Inter 400/400i çıkar (17 §2.5) ve
 * `__tests__/card/fonts.test.ts` onaylı bir test değişikliğiyle güncellenir.
 *
 * Bilerek alt-yol importu (kök paket tüm ağırlıkları paketler). Paket kaynağı okundu: yalnızca statik
 * `.ttf` varlığı, bağımlılığı yok, ağ çağrısı yok (CLAUDE.md "ağa veri gönderiyor mu" kontrolü).
 * Türkçe glifler (İ ı Ş ş Ğ ğ Ö ö Ü ü Ç ç) `__tests__/card/fonts-v2.test.ts` ile dosyada doğrulanır.
 */
import { Fraunces_600SemiBold_Italic } from '@expo-google-fonts/fraunces/600SemiBold_Italic';
import { Fraunces_800ExtraBold } from '@expo-google-fonts/fraunces/800ExtraBold';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import { useFonts } from 'expo-font';

/** `expo-font`a verilen anahtarlarla birebir aynı adlar (yanlış ad sessizce sistem fontuna düşer). */
export const CARD_V2_FONT_FAMILY = {
  displayBold: 'Fraunces_800ExtraBold',
  displayItalic: 'Fraunces_600SemiBold_Italic',
  textMedium: 'Inter_500Medium',
  textBold: 'Inter_700Bold',
  textHeavy: 'Inter_800ExtraBold',
} as const;

export function useCardFontsV2(): [boolean, Error | null] {
  const [loaded, error] = useFonts({
    Fraunces_800ExtraBold,
    Fraunces_600SemiBold_Italic,
    Inter_500Medium,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  return [loaded, error ?? null];
}

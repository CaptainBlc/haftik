/**
 * `CARD_FONT_FAMILY` sabitleri — `CardView.tsx`nin `fontFamily` stillerinde
 * kullandığı adların, `useCardFonts`in `expo-font`a verdiği anahtarlarla
 * birebir eşleştiğini doğrular (yanlış eşleşme, cihazda sessizce sistem
 * fontuna düşmeye yol açar, hata fırlatmaz — bu yüzden statik bir denetim
 * değerlidir).
 *
 * `useCardFonts` hook'unun kendisi (gerçek font dosyası yükleme) bu ortamda
 * (native modül yok) anlamlı biçimde test edilemez; gerçek font
 * yüklenmesinin doğrulanması cihazda yapılır (bkz. görev özeti "karşılanamadı"
 * listesi).
 */
import { CARD_FONT_FAMILY } from '@/card/fonts';

describe('CARD_FONT_FAMILY', () => {
  it('regular/bold/italic için Inter ailesinin gerçek font adlarını taşır', () => {
    expect(CARD_FONT_FAMILY).toEqual({
      regular: 'Inter_400Regular',
      bold: 'Inter_700Bold',
      italic: 'Inter_400Regular_Italic',
    });
  });
});

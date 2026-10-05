/**
 * S19 (B3, 17 §2.5): kart v2 fontlarının adları ve Türkçe glif kapsaması. Glifler `.ttf` dosyasının
 * `cmap` tablosundan okunur (K2); gerçek cihazdaki çizim (opsz farkı, kerning) K4'te ayrıca bakılır.
 */
import * as path from 'node:path';

import { CARD_V2_FONT_FAMILY } from '@/card/fonts-v2';

import { readCmapCodePoints } from '../helpers/ttf-cmap';

const pkg = (name: string, weight: string, file: string) =>
  path.join(__dirname, '..', '..', 'node_modules', '@expo-google-fonts', name, weight, file);

const FILES: Record<keyof typeof CARD_V2_FONT_FAMILY, string> = {
  displayBold: pkg('fraunces', '800ExtraBold', 'Fraunces_800ExtraBold.ttf'),
  displayItalic: pkg('fraunces', '600SemiBold_Italic', 'Fraunces_600SemiBold_Italic.ttf'),
  textMedium: pkg('inter', '500Medium', 'Inter_500Medium.ttf'),
  textBold: pkg('inter', '700Bold', 'Inter_700Bold.ttf'),
  textHeavy: pkg('inter', '800ExtraBold', 'Inter_800ExtraBold.ttf'),
};

const TURKISH = 'İıŞşĞğÖöÜüÇç';
const MARKS = '·—“”’…%×';
const BASICS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?:;-()';

describe('CARD_V2_FONT_FAMILY', () => {
  it('ad = paketin dışa aktardığı anahtar (yanlış ad sessizce sistem fontuna düşer)', () => {
    expect(CARD_V2_FONT_FAMILY).toEqual({
      displayBold: 'Fraunces_800ExtraBold',
      displayItalic: 'Fraunces_600SemiBold_Italic',
      textMedium: 'Inter_500Medium',
      textBold: 'Inter_700Bold',
      textHeavy: 'Inter_800ExtraBold',
    });
    for (const [key, family] of Object.entries(CARD_V2_FONT_FAMILY)) {
      expect(path.basename(FILES[key as keyof typeof FILES], '.ttf')).toBe(family);
    }
  });
});

describe.each(Object.entries(FILES))('%s font dosyası', (key, file) => {
  const cps = readCmapCodePoints(file);

  it('okuyucu gerçekten ayırt ediyor (pozitif kontrol): CJK ve emoji yok, küme boş değil', () => {
    expect(cps.has(0x4e2d)).toBe(false);
    expect(cps.has(0x1f600)).toBe(false);
    expect(cps.size).toBeGreaterThan(100);
    expect(cps.size).toBeLessThan(20000);
  });

  it('Türkçe harflerin hepsini (İ ı Ş ş Ğ ğ Ö ö Ü ü Ç ç) çizebilir', () => {
    const missing = [...TURKISH].filter((ch) => !cps.has(ch.codePointAt(0)!));
    expect({ key, missing }).toEqual({ key, missing: [] });
  });

  it('Latin temel harfler, rakamlar ve noktalama tamam', () => {
    const missing = [...BASICS].filter((ch) => !cps.has(ch.codePointAt(0)!));
    expect({ key, missing }).toEqual({ key, missing: [] });
  });

  it('kartta kullanılan işaretler (· — “ ” ’ … % ×) tamam', () => {
    const missing = [...MARKS].filter((ch) => !cps.has(ch.codePointAt(0)!));
    expect({ key, missing }).toEqual({ key, missing: [] });
  });
});

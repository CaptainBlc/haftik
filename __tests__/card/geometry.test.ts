/** S19, R4 / R-15 madde 4: döndürülmüş öğenin sınır kutusu ve güvenli bant. */
import { fitsWithin, rotatedBounds } from '@/card/geometry';
import { CARD_LOGICAL_HEIGHT, CARD_LOGICAL_WIDTH } from '@/card/layout';
import { CARD_TILT } from '@/card/tokens';

const CARD = { x: 0, y: 0, width: CARD_LOGICAL_WIDTH, height: CARD_LOGICAL_HEIGHT };

describe('rotatedBounds', () => {
  it('0 derecede kutu aynı kalır', () => {
    expect(rotatedBounds({ x: 10, y: 20, width: 100, height: 50 }, 0)).toEqual({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    });
  });

  it('90 derecede genişlik ve yükseklik yer değiştirir, merkez sabit', () => {
    const b = rotatedBounds({ x: 0, y: 0, width: 100, height: 40 }, 90);
    expect(b.width).toBeCloseTo(40, 9);
    expect(b.height).toBeCloseTo(100, 9);
    expect(b.x + b.width / 2).toBeCloseTo(50, 9);
    expect(b.y + b.height / 2).toBeCloseTo(20, 9);
  });

  it('işaret fark etmez (−1,5° ve +1,5° aynı kutuyu verir)', () => {
    const a = rotatedBounds({ x: 24, y: 88, width: 312, height: 116 }, -1.5);
    const b = rotatedBounds({ x: 24, y: 88, width: 312, height: 116 }, 1.5);
    expect(a).toEqual(b);
  });

  it('17 §2.6: 312x116 unvan −1,5° döndürülünce köşeler yaklaşık ±4,1 px kayar', () => {
    const b = rotatedBounds({ x: 24, y: 88, width: 312, height: 116 }, CARD_TILT.title);
    expect((b.height - 116) / 2).toBeCloseTo(4.1, 0);
  });
});

describe('fitsWithin', () => {
  it('içeride, kenarda (marjinli/marjinsiz) ve dışarıda doğru karar verir', () => {
    expect(fitsWithin({ x: 0, y: 0, width: 360, height: 640 }, CARD)).toBe(true);
    expect(fitsWithin({ x: -0.5, y: 0, width: 360, height: 640 }, CARD)).toBe(false);
    expect(fitsWithin({ x: 10, y: 10, width: 100, height: 100 }, CARD, 10)).toBe(true);
    expect(fitsWithin({ x: 9, y: 10, width: 100, height: 100 }, CARD, 10)).toBe(false);
  });
});

describe('eğim bütçesi (token değerleri)', () => {
  it('eğik token listesi sabit: unvan, mühür ve yalnız ÖRNEK kartında görünen şerit (normal kartta en fazla iki eğik öğe)', () => {
    const tilted = Object.entries(CARD_TILT)
      .filter(([, deg]) => (deg as number) !== 0)
      .map(([name]) => name)
      .sort();
    expect(tilted).toEqual(['sampleStamp', 'seal', 'title']);
    expect(tilted.filter((n) => n !== 'sampleStamp')).toHaveLength(2);
  });

  it('içerik eğimi ±1,5° içinde; dekoratif mühür +8° (17 §2.1 istisna)', () => {
    expect(Math.abs(CARD_TILT.title)).toBeLessThanOrEqual(1.5);
    expect(CARD_TILT.seal).toBe(8);
  });

  it('unvan (24-336 x 88-204) ve mühür (260-336 x 26-102) eğimle de kartın içinde ve 8 dp güvenli bantta', () => {
    const title = rotatedBounds({ x: 24, y: 88, width: 312, height: 116 }, CARD_TILT.title);
    const seal = rotatedBounds({ x: 260, y: 26, width: 76, height: 76 }, CARD_TILT.seal);
    expect(fitsWithin(title, CARD, 8)).toBe(true);
    expect(fitsWithin(seal, CARD, 8)).toBe(true);
  });
});

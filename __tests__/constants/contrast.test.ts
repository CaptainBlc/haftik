/**
 * S19 (17 §2.2-2.3, 28 §4.11): token'lardan kontrast doğrulaması. Metin >= 4,5, arayüz öğesi >= 3.
 * Belgedeki elle hesaplanmış (K1) değerler küçük bir toleransla da sabitlenir; token değişirse
 * burası kırılır ve belge/token birlikte güncellenir.
 */
import { CARD_COLORS, CATEGORY_TONES } from '@/card/tokens';
import { SHELL_TOKENS } from '@/constants/tokens';

import { contrast, luminance } from '../helpers/contrast';

const TEXT_MIN = 4.5;
const UI_MIN = 3;

describe('kart token kontrastı', () => {
  const c = CARD_COLORS;

  it('belgedeki kart oranları (17 §2.2) tutuyor', () => {
    expect(contrast(c.ink, c.paper)).toBeCloseTo(17.97, 1);
    expect(contrast(c.ink, c.sun)).toBeCloseTo(13.21, 1);
    expect(contrast(c.ink, c.liner)).toBeCloseTo(14.56, 1);
    expect(contrast(c.muted, c.liner)).toBeCloseTo(5.39, 1);
    expect(contrast(c.muted, c.paper)).toBeCloseTo(6.65, 1);
    expect(contrast(c.paper, c.album)).toBeCloseTo(10.99, 1);
    expect(contrast(c.onAlbum, c.album)).toBeCloseTo(9.35, 1);
  });

  it('kart metin çiftlerinin hepsi >= 4,5', () => {
    const pairs: [string, string][] = [
      [c.ink, c.paper],
      [c.ink, c.sun],
      [c.ink, c.liner],
      [c.muted, c.liner],
      [c.muted, c.paper],
      [c.paper, c.album],
      [c.onAlbum, c.album],
    ];
    for (const [fg, bg] of pairs) expect(contrast(fg, bg)).toBeGreaterThanOrEqual(TEXT_MIN);
  });

  it('her kategori tonunun üstünde mürekkep metni >= 4,5 (emoji diski etiketi)', () => {
    for (const tone of Object.values(CATEGORY_TONES)) {
      expect(contrast(c.ink, tone)).toBeGreaterThanOrEqual(TEXT_MIN);
    }
    expect(contrast(c.ink, CATEGORY_TONES.movement)).toBeCloseTo(13.65, 1);
    expect(contrast(c.ink, CATEGORY_TONES.sleep)).toBeCloseTo(12.3, 1);
  });

  it('kategori tonları eşit ağırlıkta: göreli parlaklık 0,65-0,74 bandında', () => {
    for (const tone of Object.values(CATEGORY_TONES)) {
      expect(luminance(tone)).toBeGreaterThan(0.65);
      expect(luminance(tone)).toBeLessThan(0.74);
    }
  });

  it('kart ekranı zemini (albumScreen) albümden daha koyu', () => {
    expect(contrast(c.albumScreen, c.ink)).toBeLessThan(contrast(c.album, c.ink));
  });
});

describe.each(['light', 'dark'] as const)('kabuk token kontrastı (%s)', (mode) => {
  const t = SHELL_TOKENS[mode];

  it('metin çiftleri >= 4,5', () => {
    expect(contrast(t.text, t.bg)).toBeGreaterThanOrEqual(TEXT_MIN);
    expect(contrast(t.text, t.surface)).toBeGreaterThanOrEqual(TEXT_MIN);
    expect(contrast(t.muted, t.bg)).toBeGreaterThanOrEqual(TEXT_MIN);
    expect(contrast(t.muted, t.surface)).toBeGreaterThanOrEqual(TEXT_MIN);
    expect(contrast(t.onAccent, t.accent)).toBeGreaterThanOrEqual(TEXT_MIN);
    expect(contrast(t.muted, t.disBg)).toBeGreaterThanOrEqual(TEXT_MIN);
    expect(contrast(t.text, t.selFill)).toBeGreaterThanOrEqual(TEXT_MIN);
    expect(contrast(t.danger, t.bg)).toBeGreaterThanOrEqual(TEXT_MIN);
    expect(contrast(t.danger, t.surface)).toBeGreaterThanOrEqual(TEXT_MIN);
  });

  it('arayüz öğesi çiftleri >= 3 (seçili çerçeve/aktif sekme)', () => {
    expect(contrast(t.accent, t.bg)).toBeGreaterThanOrEqual(UI_MIN);
    expect(contrast(t.accent, t.surface)).toBeGreaterThanOrEqual(UI_MIN);
  });
});

describe('kabuk: belgedeki sabit oranlar', () => {
  it('açık: text/bg 16,35 · accent/bg 10,00 · danger/bg 5,88', () => {
    const t = SHELL_TOKENS.light;
    expect(contrast(t.text, t.bg)).toBeCloseTo(16.35, 1);
    expect(contrast(t.accent, t.bg)).toBeCloseTo(10.0, 1);
    expect(contrast(t.danger, t.bg)).toBeCloseTo(5.88, 1);
  });

  it('koyu: text/bg 16,13 · muted/surface 7,38 · danger/surface 7,10', () => {
    const t = SHELL_TOKENS.dark;
    expect(contrast(t.text, t.bg)).toBeCloseTo(16.13, 1);
    expect(contrast(t.muted, t.surface)).toBeCloseTo(7.38, 1);
    expect(contrast(t.danger, t.surface)).toBeCloseTo(7.1, 1);
  });
});

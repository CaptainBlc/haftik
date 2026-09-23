/**
 * `title-visibility.ts` — unvan otomatik gizleme kararı (spec güvenlik
 * gereksinimi 3: "unvan gizlenen kategoriden türetilmez"; `plan.md` S7b).
 * Bkz. `src/card/title-visibility.ts` başlığındaki gerekçe.
 */
import { shouldHideTitle } from '@/card/title-visibility';

describe('shouldHideTitle', () => {
  it('temel unvan (tek kategoriye dayalı): o kategori gizliyse true döner', () => {
    expect(shouldHideTitle(['movement'], new Set(['movement']))).toBe(true);
  });

  it('temel unvan: o kategori gizli değilse false döner', () => {
    expect(shouldHideTitle(['movement'], new Set(['sleep', 'spending']))).toBe(false);
  });

  it('kombinasyon unvanı (2+ kategori): kategorilerden YALNIZCA biri gizli olsa bile true döner', () => {
    expect(shouldHideTitle(['movement', 'social'], new Set(['social']))).toBe(true);
  });

  it('kombinasyon unvanı: kategorilerin hiçbiri gizli değilse false döner', () => {
    expect(shouldHideTitle(['movement', 'social'], new Set(['sleep', 'spending']))).toBe(false);
  });

  it('genel kural (basedOnCategories boş, ör. "dört kategori ortada"): hiçbir gizleme eyleminden etkilenmez', () => {
    expect(shouldHideTitle([], new Set(['movement', 'sleep', 'spending', 'social']))).toBe(false);
  });

  it('hiçbir kategori gizli değilse (boş hidden küme) her zaman false döner', () => {
    expect(shouldHideTitle(['movement'], new Set())).toBe(false);
  });
});

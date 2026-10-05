/** Rapor v2 `share_default_kept`: gizli küme varsayılanla (uyku + harcama) birebir aynı mı? */
import {
  defaultHiddenCategories,
  isDefaultHiddenSet,
  toggleHiddenCategory,
} from '@/card/hide-state';
import type { Category } from '@/domain/types';

describe('isDefaultHiddenSet', () => {
  it('varsayılan küme: evet', () => {
    expect(isDefaultHiddenSet(defaultHiddenCategories())).toBe(true);
  });

  it('boş küme (hiçbir şey gizli değil): hayır', () => {
    expect(isDefaultHiddenSet(new Set<Category>())).toBe(false);
  });

  it('eksik (yalnız uyku) ya da fazla (üç satır) gizli: hayır', () => {
    expect(isDefaultHiddenSet(new Set<Category>(['sleep']))).toBe(false);
    expect(isDefaultHiddenSet(new Set<Category>(['sleep', 'spending', 'social']))).toBe(false);
  });

  it('aynı sayıda ama farklı kategoriler gizli: hayır', () => {
    expect(isDefaultHiddenSet(new Set<Category>(['movement', 'social']))).toBe(false);
  });

  it('kullanıcı bir satırı açıp tekrar gizlerse yine varsayılan (son durum önemli)', () => {
    let hidden: ReadonlySet<Category> = defaultHiddenCategories();
    hidden = toggleHiddenCategory(hidden, 'sleep');
    expect(isDefaultHiddenSet(hidden)).toBe(false);
    hidden = toggleHiddenCategory(hidden, 'sleep');
    expect(isDefaultHiddenSet(hidden)).toBe(true);
  });
});

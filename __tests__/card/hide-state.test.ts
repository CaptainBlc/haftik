/**
 * `hide-state.ts` — saf durum yönetimi (spec güvenlik gereksinimi 3;
 * `plan.md` S7b). Bkz. `src/card/hide-state.ts` başlığı.
 */
import {
  DEFAULT_HIDDEN_CATEGORIES,
  defaultHiddenCategories,
  isCategoryHidden,
  toggleHiddenCategory,
} from '@/card/hide-state';

describe('defaultHiddenCategories', () => {
  it('yalnızca uyku ve harcama gizli olarak başlar (spec güvenlik gereksinimi 3)', () => {
    const hidden = defaultHiddenCategories();
    expect(hidden.has('sleep')).toBe(true);
    expect(hidden.has('spending')).toBe(true);
    expect(hidden.has('movement')).toBe(false);
    expect(hidden.has('social')).toBe(false);
    expect(hidden.size).toBe(2);
  });

  it('DEFAULT_HIDDEN_CATEGORIES ile tutarlıdır', () => {
    expect(new Set(DEFAULT_HIDDEN_CATEGORIES)).toEqual(defaultHiddenCategories());
  });

  it('her çağrıda bağımsız bir Set döner (paylaşılan mutable referans yok)', () => {
    const a = defaultHiddenCategories();
    const b = defaultHiddenCategories();
    a.delete('sleep');
    expect(b.has('sleep')).toBe(true);
  });
});

describe('toggleHiddenCategory', () => {
  it('gizli bir kategoriyi açar (kümeden çıkarır)', () => {
    const hidden = defaultHiddenCategories();
    const next = toggleHiddenCategory(hidden, 'sleep');
    expect(next.has('sleep')).toBe(false);
    expect(next.has('spending')).toBe(true);
  });

  it('açık bir kategoriyi gizler (kümeye ekler)', () => {
    const hidden = defaultHiddenCategories();
    const next = toggleHiddenCategory(hidden, 'movement');
    expect(next.has('movement')).toBe(true);
  });

  it('girdi kümesini mutate ETMEZ, yeni bir Set döner', () => {
    const hidden = defaultHiddenCategories();
    const next = toggleHiddenCategory(hidden, 'movement');
    expect(hidden.has('movement')).toBe(false);
    expect(next).not.toBe(hidden);
  });
});

describe('isCategoryHidden', () => {
  it('kümedeki kategori için true, dışındaki için false döner', () => {
    const hidden = defaultHiddenCategories();
    expect(isCategoryHidden(hidden, 'sleep')).toBe(true);
    expect(isCategoryHidden(hidden, 'movement')).toBe(false);
  });
});

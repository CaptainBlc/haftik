/**
 * Bugün ekranının (Ekran 2) saf seçim mantığı. Görev talimatının açıkça
 * istediği kabul kriteri: "4 kategori seçilmeden Kaydet disabled" —
 * `isSelectionComplete` bu kararın kaynağıdır (bkz. `checkin-form.test.tsx`
 * için bileşen seviyesi karşılığı).
 */
import { checkinToSelection, isSelectionComplete, selectionToCheckin } from '@/lib/checkin-form';
import type { Checkin } from '@/domain/types';

describe('isSelectionComplete', () => {
  it('boş seçimde false döner', () => {
    expect(isSelectionComplete({})).toBe(false);
  });

  it('3/4 kategori seçiliyken false döner', () => {
    expect(isSelectionComplete({ movement: 1, sleep: 2, spending: 3 })).toBe(false);
  });

  it('4/4 kategori seçiliyken true döner', () => {
    expect(isSelectionComplete({ movement: 1, sleep: 2, spending: 3, social: 1 })).toBe(true);
  });

  it('sırayla tek tek eklenince yalnızca dördüncüde true olur', () => {
    let selection = {};
    expect(isSelectionComplete(selection)).toBe(false);
    selection = { ...selection, movement: 1 };
    expect(isSelectionComplete(selection)).toBe(false);
    selection = { ...selection, sleep: 3 };
    expect(isSelectionComplete(selection)).toBe(false);
    selection = { ...selection, spending: 2 };
    expect(isSelectionComplete(selection)).toBe(false);
    selection = { ...selection, social: 3 };
    expect(isSelectionComplete(selection)).toBe(true);
  });
});

describe('selectionToCheckin', () => {
  it('tamamlanmış seçimi Checkin nesnesine çevirir', () => {
    const checkin = selectionToCheckin('2026-09-23', {
      movement: 1,
      sleep: 2,
      spending: 3,
      social: 1,
    });
    expect(checkin).toEqual<Checkin>({
      localDate: '2026-09-23',
      movement: 1,
      sleep: 2,
      spending: 3,
      social: 1,
    });
  });
});

describe('checkinToSelection', () => {
  it('null verilirse boş seçim döner (yeni gün)', () => {
    expect(checkinToSelection(null)).toEqual({});
  });

  it('var olan Checkin verilirse dört alanı da seçime çevirir (düzenleme)', () => {
    const checkin: Checkin = {
      localDate: '2026-09-22',
      movement: 2,
      sleep: 3,
      spending: 1,
      social: 2,
    };
    expect(checkinToSelection(checkin)).toEqual({
      movement: 2,
      sleep: 3,
      spending: 1,
      social: 2,
    });
  });
});

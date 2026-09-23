import { isValidWeekStartParam } from '@/lib/week-param';

// 2026-09-23 Çarşamba; bu haftanın Pazartesi'si 2026-09-21.
const TODAY = '2026-09-23';

describe('isValidWeekStartParam', () => {
  it('geçerli geçmiş Pazartesi', () => {
    expect(isValidWeekStartParam('2026-09-14', TODAY)).toBe(true);
  });

  it('bu haftanın Pazartesi si geçerli', () => {
    expect(isValidWeekStartParam('2026-09-21', TODAY)).toBe(true);
  });

  it('geçersiz format', () => {
    for (const v of ['abc', '2026-9-14', '2026/09/14', '20260914', '2026-09-14x', '', undefined, 5]) {
      expect(isValidWeekStartParam(v, TODAY)).toBe(false);
    }
  });

  it('geçersiz takvim tarihi', () => {
    expect(isValidWeekStartParam('2026-02-31', TODAY)).toBe(false);
    expect(isValidWeekStartParam('2026-13-01', TODAY)).toBe(false);
  });

  it('Pazartesi olmayan gün', () => {
    expect(isValidWeekStartParam('2026-09-15', TODAY)).toBe(false);
    expect(isValidWeekStartParam('2026-09-20', TODAY)).toBe(false);
  });

  it('gelecek hafta', () => {
    expect(isValidWeekStartParam('2026-09-28', TODAY)).toBe(false);
    expect(isValidWeekStartParam('2030-01-07', TODAY)).toBe(false);
  });

  it('bozuk today güvenli reddeder', () => {
    expect(isValidWeekStartParam('2026-09-14', 'x')).toBe(false);
  });
});

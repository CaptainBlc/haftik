/**
 * `src/lib/now.ts` — dev override mekanizması. `__DEV__` global'i jest-expo
 * ortamında `true`dur (geliştirme derlemesi davranışı test edilir);
 * üretimde `__DEV__ === false` olduğunda no-op olması yalnızca kod
 * okumasıyla doğrulanabilir (statik `if (__DEV__)` korumaları), ayrıca bkz.
 * `src/dev/dev-time-menu.tsx` ve `_layout.tsx`'teki `require()` koruması.
 */
import { getNow, isDevNowOverrideActive, setDevNowOverride } from '@/lib/now';

describe('getNow / setDevNowOverride', () => {
  afterEach(() => {
    setDevNowOverride(null);
  });

  it('override yokken gerçek zamana yakın bir Date döner', () => {
    const before = Date.now();
    const now = getNow();
    const after = Date.now();
    expect(now.getTime()).toBeGreaterThanOrEqual(before);
    expect(now.getTime()).toBeLessThanOrEqual(after);
    expect(isDevNowOverrideActive()).toBe(false);
  });

  it('override ayarlanınca getNow o tarihi döner', () => {
    const fixed = new Date(2026, 8, 27, 20, 0);
    setDevNowOverride(fixed);
    expect(getNow()).toBe(fixed);
    expect(isDevNowOverrideActive()).toBe(true);
  });

  it('null ile override kaldırılır, gerçek zamana döner', () => {
    setDevNowOverride(new Date(2026, 8, 27, 20, 0));
    setDevNowOverride(null);
    expect(isDevNowOverrideActive()).toBe(false);
  });
});

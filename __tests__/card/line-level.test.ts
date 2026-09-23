import { levelFromLineId } from '@/card/line-level';

describe('levelFromLineId', () => {
  it('düşük/orta/yüksek seviyeleri gerçek content/tr.ts id biçiminden ayrıştırır', () => {
    expect(levelFromLineId('line.movement.low.1')).toBe('low');
    expect(levelFromLineId('line.sleep.medium.2')).toBe('medium');
    expect(levelFromLineId('line.social.high.3')).toBe('high');
  });

  it('beklenmeyen bir biçim için hata fırlatır', () => {
    expect(() => levelFromLineId('baska-bir-sey')).toThrow(/beklenmeyen id biçimi/);
    expect(() => levelFromLineId('line.movement.extreme.1')).toThrow(/beklenmeyen id biçimi/);
  });
});

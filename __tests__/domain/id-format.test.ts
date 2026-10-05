/**
 * S19 / P-6 (21 §2e): kimlik biçimleri sessiz bir sözleşmedir; `weekly_card` satırlarında kalıcıdır.
 * Bu test içerik havuzunun TAMAMINI dondurulmuş ayrıştırıcıdan geçirir. Biçim değişirse (ör. havuza
 * farklı kimlikli bir satır eklenirse) burası kırılır; çözüm migration + CONTENT_VERSION artışıdır.
 */
import { levelFromLineId, parseLineId } from '@/card/line-level';
import { LINE_VARIANTS, SUMMARY_VARIANTS, TITLE_TEXTS } from '@/domain/content/tr';
import { CATEGORIES } from '@/domain/types';
import type { Level } from '@/domain/types';

const LEVELS: Level[] = ['low', 'medium', 'high'];

describe('satır kimliği biçimi (dondurulmuş)', () => {
  it('havuzdaki HER satır kimliği ayrıştırılır ve kategori/seviyesi havuz konumuyla aynıdır', () => {
    let seen = 0;
    for (const category of CATEGORIES) {
      for (const level of LEVELS) {
        LINE_VARIANTS[category][level].forEach((line, index) => {
          const parsed = parseLineId(line.id);
          expect(parsed).toEqual({ category, level, variant: index + 1 });
          seen += 1;
        });
      }
    }
    expect(seen).toBeGreaterThanOrEqual(36);
  });

  it('kimlikler havuzda benzersizdir', () => {
    const ids = CATEGORIES.flatMap((c) => LEVELS.flatMap((l) => LINE_VARIANTS[c][l].map((x) => x.id)));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('kesin biçim: önek, ek parça, sıfır/negatif/ondalık varyant ve bilinmeyen kategori reddedilir', () => {
    for (const bad of [
      'line.movement.low',
      'line.movement.low.1.x',
      'xline.movement.low.1',
      'line.movement.low.0',
      'line.movement.low.01',
      'line.movement.low.-1',
      'line.movement.low.1.5',
      'line.food.low.1',
      'line.movement.extreme.1',
      'line.Movement.low.1',
      'line.movement.low.1\n',
      '',
    ]) {
      expect(parseLineId(bad)).toBeNull();
    }
  });

  it('noktanın yerine başka karakter geçen kimlik reddedilir (kaçışsız regex tuzağı)', () => {
    expect(parseLineId('line-movement-low-1')).toBeNull();
    expect(parseLineId('lineXmovementXlowX1')).toBeNull();
  });

  it('levelFromLineId parseLineId ile aynı kararı verir; reddedilende fırlatır', () => {
    expect(levelFromLineId('line.sleep.high.2')).toBe('high');
    expect(() => levelFromLineId('line.sleep.high.0')).toThrow(/beklenmeyen id biçimi/);
  });
});

describe('özet ve unvan kimlik biçimleri (dondurulmuş)', () => {
  it('özet kimlikleri `summary.<kova>.<n>` ve kova, bulunduğu anahtarla aynı', () => {
    for (const [bucket, items] of Object.entries(SUMMARY_VARIANTS)) {
      items.forEach((item, index) => {
        expect(item.id).toBe(`summary.${bucket}.${index + 1}`);
      });
    }
  });

  it('unvan anahtarları `title.basic.<kategori>.<seviye>` ya da `title.combo.<ad>` biçimindedir', () => {
    const basic = /^title\.basic\.(movement|sleep|spending|social)\.(low|medium|high)$/;
    const combo = /^title\.combo\.[a-z][A-Za-z]*$/;
    for (const key of Object.keys(TITLE_TEXTS)) {
      expect(basic.test(key) || combo.test(key)).toBe(true);
    }
    // 12 temel unvan her zaman var (kategori x seviye).
    for (const c of CATEGORIES) {
      for (const l of LEVELS) expect(TITLE_TEXTS[`title.basic.${c}.${l}`]).toBeDefined();
    }
  });
});

/**
 * S3 domain testleri: unvan seçimi (spec "Hesaplama kuralları" > "Unvan
 * seçimi" + S3 netleştirmeleri).
 */
import { selectTitle } from '../../src/domain/titles';
import { CATEGORIES } from '../../src/domain/types';
import type { Category, Delta, Level } from '../../src/domain/types';
import { TITLE_TEXTS } from '../../src/domain/content/tr';

const LEVELS: Level[] = ['low', 'medium', 'high'];

const ALL_NULL_DELTAS: Record<Category, Delta> = {
  movement: null,
  sleep: null,
  spending: null,
  social: null,
};

const MIXED_DELTAS: Record<Category, Delta> = {
  movement: 1,
  sleep: -1,
  spending: 0,
  social: 1,
};

/** 81 kombinasyonun TAMAMI: gerçek kartezyen çarpım (4 kategori x 3 seviye). */
function allLevelCombinations(): Record<Category, Level>[] {
  const combos: Record<Category, Level>[] = [];
  for (const movement of LEVELS) {
    for (const sleep of LEVELS) {
      for (const spending of LEVELS) {
        for (const social of LEVELS) {
          combos.push({ movement, sleep, spending, social });
        }
      }
    }
  }
  return combos;
}

const COMBOS = allLevelCombinations();

describe('selectTitle — test altyapısı gerçek kartezyen çarpım kuruyor', () => {
  it('tam 81 benzersiz kombinasyon üretildi (4^3... hayır: 3^4 = 81)', () => {
    expect(COMBOS.length).toBe(81);
    const unique = new Set(COMBOS.map((c) => JSON.stringify(c)));
    expect(unique.size).toBe(81);
  });
});

describe('selectTitle — 81 seviye kombinasyonunun tamamı için kapsama garantisi', () => {
  const scenarios: { label: string; checkinDays: number; deltas: Record<Category, Delta> }[] = [
    { label: 'checkinDays=4 (nötr), deltas=ilk kart (hepsi null)', checkinDays: 4, deltas: ALL_NULL_DELTAS },
    { label: 'checkinDays=4 (nötr), deltas=karışık', checkinDays: 4, deltas: MIXED_DELTAS },
    { label: 'checkinDays=7, deltas=ilk kart (hepsi null)', checkinDays: 7, deltas: ALL_NULL_DELTAS },
    { label: 'checkinDays=7, deltas=karışık', checkinDays: 7, deltas: MIXED_DELTAS },
  ];

  for (const scenario of scenarios) {
    describe(scenario.label, () => {
      it.each(COMBOS.map((levels) => [JSON.stringify(levels), levels] as const))(
        'levels=%s için boş dönmez, id/text dolu, basedOnCategories tutarlı',
        (_label, levels) => {
          const result = selectTitle({
            levels,
            checkinDays: scenario.checkinDays,
            deltas: scenario.deltas,
            prevTitleId: null,
          });

          expect(result).toBeTruthy();
          expect(typeof result.id).toBe('string');
          expect(result.id.length).toBeGreaterThan(0);
          expect(typeof result.text).toBe('string');
          expect(result.text.length).toBeGreaterThan(0);
          expect(Array.isArray(result.basedOnCategories)).toBe(true);

          const allMedium = CATEGORIES.every((category) => levels[category] === 'medium');
          if (allMedium) {
            // "dört kategori ortada" her zaman bir özel kuralla yakalanır,
            // temel unvana hiç düşmez (S3 netleştirme #1.a) -> genel kural,
            // basedOnCategories boş.
            expect(result.id).toBe('title.combo.allMedium');
            expect(result.basedOnCategories).toEqual([]);
          }

          if (result.basedOnCategories.length === 1) {
            // Temel unvan seçildiyse: o kategori kesinlikle uçtadır (medium değil).
            const [category] = result.basedOnCategories;
            expect(levels[category]).not.toBe('medium');
          }

          if (result.basedOnCategories.length >= 2) {
            // Kombinasyon kuralı: her referans verilen kategori gerçekten var olmalı.
            for (const category of result.basedOnCategories) {
              expect(CATEGORIES).toContain(category);
            }
          }
        }
      );
    });
  }
});

describe('selectTitle — fallback zinciri (bir önceki haftayla aynı unvan tekrar etmez)', () => {
  it('prevTitleId ilk eşleşenden farklıysa direkt ilk eşleşen (kombinasyon) döner', () => {
    const levels: Record<Category, Level> = {
      movement: 'high',
      sleep: 'high',
      spending: 'medium',
      social: 'medium',
    };
    const result = selectTitle({
      levels,
      checkinDays: 4,
      deltas: ALL_NULL_DELTAS,
      prevTitleId: 'baska-bir-unvan-kimligi',
    });
    expect(result.id).toBe('title.combo.movementSleepBothHigh');
  });

  it('prevTitleId ilk eşleşenle aynıysa, listede sıradaki farklı eşleşen (temel unvan) döner', () => {
    // movement+sleep ikisi de high -> hem kombinasyon kuralı hem de temel
    // unvan (movement en yüksek öncelikli uç kategori) eşleşir.
    const levels: Record<Category, Level> = {
      movement: 'high',
      sleep: 'high',
      spending: 'medium',
      social: 'medium',
    };
    const first = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(first.id).toBe('title.combo.movementSleepBothHigh');

    const next = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: first.id });
    expect(next.id).not.toBe(first.id);
    expect(next.id).toBe('title.basic.movement.high');
  });

  it('eşleşen kural yalnızca 1 taneyse ve prevTitleId ona eşitse, orijinal eşleşen AYNEN tekrar döner', () => {
    // Yalnızca 'social' uçta (high), diğerleri medium -> hiçbir placeholder
    // kombinasyon kuralı tetiklenmez, tek eşleşen temel unvan olur.
    const levels: Record<Category, Level> = {
      movement: 'medium',
      sleep: 'medium',
      spending: 'medium',
      social: 'high',
    };
    const first = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(first.id).toBe('title.basic.social.high');

    const repeated = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: first.id });
    expect(repeated).toEqual(first); // boş/hata değil, orijinal aynen tekrar
  });

  it('"dört kategori ortada" durumunda tek eşleşen vardır; prevTitleId aynıysa yine kendisi döner', () => {
    const levels: Record<Category, Level> = {
      movement: 'medium',
      sleep: 'medium',
      spending: 'medium',
      social: 'medium',
    };
    const first = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(first.id).toBe('title.combo.allMedium');
    const repeated = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: first.id });
    expect(repeated).toEqual(first);
  });
});

describe('selectTitle — çağrı sırası bağımsızlığı (paylaşılan mutable state yok)', () => {
  it('farklı girdilerle iç içe/karışık sırada çağrılmak sonucu değiştirmez', () => {
    const levelsA: Record<Category, Level> = {
      movement: 'low',
      sleep: 'medium',
      spending: 'medium',
      social: 'medium',
    };
    const levelsB: Record<Category, Level> = {
      movement: 'medium',
      sleep: 'medium',
      spending: 'medium',
      social: 'medium',
    };

    const a1 = selectTitle({ levels: levelsA, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    const b1 = selectTitle({ levels: levelsB, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    const a2 = selectTitle({ levels: levelsA, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    const b2 = selectTitle({ levels: levelsB, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });

    expect(a2).toEqual(a1);
    expect(b2).toEqual(b1);
    expect(b1.id).toBe('title.combo.allMedium');
    expect(a1.id).toBe('title.basic.movement.low');
  });

  it('aynı girdiyle tekrar tekrar çağrıldığında (weekStart yok, saf fonksiyon) her zaman özdeş sonuç', () => {
    const levels: Record<Category, Level> = {
      movement: 'high',
      sleep: 'low',
      spending: 'high',
      social: 'low',
    };
    const results = Array.from({ length: 5 }, () =>
      selectTitle({ levels, checkinDays: 4, deltas: MIXED_DELTAS, prevTitleId: null })
    );
    for (const result of results) {
      expect(result).toEqual(results[0]);
    }
  });
});

describe('selectTitle — eksik/bozuk levels girdisinde fail-fast', () => {
  it('bir kategori tamamen eksikse hata fırlatır (sessiz undefined değil)', () => {
    const badLevels = {
      movement: 'high',
      sleep: 'medium',
      spending: 'medium',
      // social eksik
    } as unknown as Record<Category, Level>;

    expect(() =>
      selectTitle({ levels: badLevels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null })
    ).toThrow();
  });

  it('geçersiz bir seviye string değeri verilirse hata fırlatır', () => {
    const badLevels = {
      movement: 'extreme',
      sleep: 'medium',
      spending: 'medium',
      social: 'medium',
    } as unknown as Record<Category, Level>;

    expect(() =>
      selectTitle({ levels: badLevels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null })
    ).toThrow();
  });

  it('levels tamamen undefined ise hata fırlatır', () => {
    expect(() =>
      selectTitle({
        levels: undefined as unknown as Record<Category, Level>,
        checkinDays: 4,
        deltas: ALL_NULL_DELTAS,
        prevTitleId: null,
      })
    ).toThrow();
  });
});

describe('selectTitle — S4: 24 yeni kombinasyon kuralının her biri en az bir senaryoda tetiklenir', () => {
  const medium: Record<Category, Level> = {
    movement: 'medium',
    sleep: 'medium',
    spending: 'medium',
    social: 'medium',
  };

  function levelsWith(overrides: Partial<Record<Category, Level>>): Record<Category, Level> {
    return { ...medium, ...overrides };
  }

  it('dört kategori de yüksek -> title.combo.allFourHigh', () => {
    const levels = levelsWith({ movement: 'high', sleep: 'high', spending: 'high', social: 'high' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.allFourHigh');
    expect(result.basedOnCategories.sort()).toEqual(CATEGORIES.slice().sort());
  });

  it('dört kategori de düşük -> title.combo.allFourLow', () => {
    const levels = levelsWith({ movement: 'low', sleep: 'low', spending: 'low', social: 'low' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.allFourLow');
  });

  it('üç kategori yüksek, bir kategori düşük -> title.combo.threeHighOneLow', () => {
    const levels = levelsWith({ movement: 'high', sleep: 'high', spending: 'high', social: 'low' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.threeHighOneLow');
  });

  it('üç kategori düşük, bir kategori yüksek -> title.combo.threeLowOneHigh', () => {
    const levels = levelsWith({ movement: 'low', sleep: 'low', spending: 'low', social: 'high' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.threeLowOneHigh');
  });

  it('7/7 gün ve >= 3 kategori yüksek (biri medium) -> title.combo.sevenSevenHighStreak', () => {
    const levels = levelsWith({ movement: 'high', sleep: 'high', spending: 'high' });
    const result = selectTitle({ levels, checkinDays: 7, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.sevenSevenHighStreak');
  });

  it('7/7 gün ve >= 3 kategori düşük -> title.combo.lowStreakSeven', () => {
    const levels = levelsWith({ movement: 'low', sleep: 'low', spending: 'low' });
    const result = selectTitle({ levels, checkinDays: 7, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.lowStreakSeven');
  });

  it('ilk kart eşiği (3 gün) ve >= 2 kategori yüksek -> title.combo.firstCardStrongStart', () => {
    const levels = levelsWith({ movement: 'high', sleep: 'high' });
    const result = selectTitle({ levels, checkinDays: 3, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.firstCardStrongStart');
  });

  it('>= 3 kategori yükseldi (delta) -> title.combo.bigLeapUp', () => {
    const levels = levelsWith({ social: 'low' });
    const deltas: Record<Category, Delta> = { movement: 1, sleep: 1, spending: 1, social: 0 };
    const result = selectTitle({ levels, checkinDays: 4, deltas, prevTitleId: null });
    expect(result.id).toBe('title.combo.bigLeapUp');
  });

  it('>= 3 kategori geriledi (delta) -> title.combo.bigDrop', () => {
    const levels = levelsWith({ social: 'low' });
    const deltas: Record<Category, Delta> = { movement: -1, sleep: -1, spending: -1, social: 0 };
    const result = selectTitle({ levels, checkinDays: 4, deltas, prevTitleId: null });
    expect(result.id).toBe('title.combo.bigDrop');
  });

  it('harcama + sosyal ikisi de yüksek -> title.combo.spendingSocialBothHigh', () => {
    const levels = levelsWith({ spending: 'high', social: 'high' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.spendingSocialBothHigh');
  });

  it('harcama + sosyal ikisi de düşük -> title.combo.spendingSocialBothLow', () => {
    const levels = levelsWith({ spending: 'low', social: 'low' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.spendingSocialBothLow');
  });

  it('hareket + harcama ikisi de yüksek -> title.combo.movementSpendingBothHigh', () => {
    const levels = levelsWith({ movement: 'high', spending: 'high' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.movementSpendingBothHigh');
  });

  it('hareket + harcama ikisi de düşük -> title.combo.movementSpendingBothLow', () => {
    const levels = levelsWith({ movement: 'low', spending: 'low' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.movementSpendingBothLow');
  });

  it('hareket + sosyal ikisi de yüksek -> title.combo.movementSocialBothHigh', () => {
    const levels = levelsWith({ movement: 'high', social: 'high' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.movementSocialBothHigh');
  });

  it('hareket + sosyal ikisi de düşük -> title.combo.movementSocialBothLow', () => {
    const levels = levelsWith({ movement: 'low', social: 'low' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.movementSocialBothLow');
  });

  it('uyku + harcama ikisi de yüksek -> title.combo.sleepSpendingBothHigh', () => {
    const levels = levelsWith({ sleep: 'high', spending: 'high' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.sleepSpendingBothHigh');
  });

  it('uyku + harcama ikisi de düşük -> title.combo.sleepSpendingBothLow', () => {
    const levels = levelsWith({ sleep: 'low', spending: 'low' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.sleepSpendingBothLow');
  });

  it('uyku + sosyal ikisi de yüksek -> title.combo.sleepSocialBothHigh', () => {
    const levels = levelsWith({ sleep: 'high', social: 'high' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.sleepSocialBothHigh');
  });

  it('uyku + sosyal ikisi de düşük -> title.combo.sleepSocialBothLow', () => {
    const levels = levelsWith({ sleep: 'low', social: 'low' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.sleepSocialBothLow');
  });

  it('hareket yüksek, uyku düşük (zıt uçta) -> title.combo.movementHighSleepLow', () => {
    const levels = levelsWith({ movement: 'high', sleep: 'low' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.movementHighSleepLow');
  });

  it('uyku yüksek, hareket düşük (zıt uçta) -> title.combo.sleepHighMovementLow', () => {
    const levels = levelsWith({ sleep: 'high', movement: 'low' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.sleepHighMovementLow');
  });

  it('harcama yüksek, sosyal düşük (zıt uçta) -> title.combo.spendingHighSocialLow', () => {
    const levels = levelsWith({ spending: 'high', social: 'low' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.spendingHighSocialLow');
  });

  it('sosyal yüksek, harcama düşük (zıt uçta) -> title.combo.socialHighSpendingLow', () => {
    const levels = levelsWith({ social: 'high', spending: 'low' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.socialHighSpendingLow');
  });

  it('hareket yüksek, harcama düşük (zıt uçta) -> title.combo.movementHighSpendingLow', () => {
    const levels = levelsWith({ movement: 'high', spending: 'low' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.movementHighSpendingLow');
  });

  it('uyku yüksek, sosyal düşük (zıt uçta) -> title.combo.sleepHighSocialLow', () => {
    const levels = levelsWith({ sleep: 'high', social: 'low' });
    const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
    expect(result.id).toBe('title.combo.sleepHighSocialLow');
  });
});

describe('Unvan metinleri — ton/uzunluk/rakam denetimi (spec + S3 görev tanımı)', () => {
  it('statik unvan metin havuzundaki her metin <= 60 karakter ve rakam içermez', () => {
    for (const [id, text] of Object.entries(TITLE_TEXTS)) {
      expect(text.length).toBeLessThanOrEqual(60);
      expect(text).not.toMatch(/[0-9]/);
      // Boş metin de kabul edilmez.
      expect(text.trim().length).toBeGreaterThan(0);
      void id;
    }
  });

  it('81 kombinasyonun tamamının ürettiği nihai unvan metni de kurala uyar', () => {
    for (const levels of COMBOS) {
      const result = selectTitle({ levels, checkinDays: 4, deltas: ALL_NULL_DELTAS, prevTitleId: null });
      expect(result.text.length).toBeLessThanOrEqual(60);
      expect(result.text).not.toMatch(/[0-9]/);
    }
  });
});

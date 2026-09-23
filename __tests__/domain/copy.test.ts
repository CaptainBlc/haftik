/**
 * S3 domain testleri: satır (kategori) ve özet/değişim satırı seçimi (spec
 * "Hesaplama kuralları" > "Satırlar" / "Özet/değişim satırı").
 */
import { selectLine, selectSummary, classifySummaryBucket } from '../../src/domain/copy';
import { CATEGORIES } from '../../src/domain/types';
import type { Category, Delta, Level } from '../../src/domain/types';
import { LINE_VARIANTS, SUMMARY_VARIANTS } from '../../src/domain/content/tr';
import type { SummaryBucket } from '../../src/domain/content/tr';

const LEVELS: Level[] = ['low', 'medium', 'high'];

/** 7 gün aralıklarla artan, birbirinden farklı `weekStart` dizisi üretir. */
function weekStartChain(startIsoDate: string, count: number): string[] {
  const result: string[] = [];
  const cursor = new Date(`${startIsoDate}T00:00:00`);
  for (let i = 0; i < count; i += 1) {
    result.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 7);
  }
  return result;
}

describe('selectLine — havuz kapsaması ve temel sözleşme', () => {
  it('her (kategori, seviye) çifti için havuzda en az 3 varyant var (spec: >= 3 varyant)', () => {
    for (const category of CATEGORIES) {
      for (const level of LEVELS) {
        expect(LINE_VARIANTS[category][level].length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('döndürülen satır, ilgili (kategori, seviye) havuzuna ait bir kimliktir', () => {
    const result = selectLine({ category: 'movement', level: 'high', weekStart: '2026-09-21', prevVariantId: null });
    const ids = LINE_VARIANTS.movement.high.map((v) => v.id);
    expect(ids).toContain(result.id);
  });
});

describe('selectLine — week_start determinizmi', () => {
  it('aynı girdiyle iki kez çağrılınca özdeş sonuç döner', () => {
    const params = { category: 'sleep' as Category, level: 'low' as Level, weekStart: '2026-09-14', prevVariantId: null };
    const first = selectLine(params);
    const second = selectLine(params);
    expect(second).toEqual(first);
  });
});

describe('selectLine — ardışık hafta aynı varyant tekrarlanmaz', () => {
  it('bir önceki haftanın seçtiği varyant kimliği verilirse, bu hafta farklı bir varyant döner', () => {
    const weekStart1 = '2026-01-05';
    const weekStart2 = '2026-01-12'; // bir sonraki hafta (7 gün sonra)

    const first = selectLine({ category: 'spending', level: 'medium', weekStart: weekStart1, prevVariantId: null });
    const second = selectLine({
      category: 'spending',
      level: 'medium',
      weekStart: weekStart2,
      prevVariantId: first.id,
    });

    expect(second.id).not.toBe(first.id);
  });

  it('bu garanti tüm (kategori, seviye) havuzları için ardışık her hafta çiftinde geçerli', () => {
    const weekStarts = weekStartChain('2025-01-06', 10);
    for (const category of CATEGORIES) {
      for (const level of LEVELS) {
        let prevId: string | null = null;
        for (const weekStart of weekStarts) {
          const result = selectLine({ category, level, weekStart, prevVariantId: prevId });
          if (prevId !== null) {
            expect(result.id).not.toBe(prevId);
          }
          prevId = result.id;
        }
      }
    }
  });
});

describe('selectLine — farklı seviyeden gelen prevVariantId sessizce yok sayılır', () => {
  it('prevVariantId başka bir havuzdan geliyorsa (ör. önceki hafta farklı seviyedeydi) normal seçime düşülür', () => {
    const weekStart = '2026-03-02';
    const foreignVariantId = LINE_VARIANTS.movement.low[0].id; // 'high' havuzuna ait değil

    const withForeignPrev = selectLine({
      category: 'movement',
      level: 'high',
      weekStart,
      prevVariantId: foreignVariantId,
    });
    const withoutPrev = selectLine({ category: 'movement', level: 'high', weekStart, prevVariantId: null });

    // Yabancı havuzdan gelen prevVariantId'nin hiçbir etkisi olmamalı: normal
    // (tohum tabanlı) seçimle birebir aynı sonuç.
    expect(withForeignPrev).toEqual(withoutPrev);
  });
});

describe('selectLine — havuzda tek varyant kalırsa (kaydıracak yer yok) sessizce mevcut seçime düşülür', () => {
  it('havuz uzunluğu 1 olsaydı hata fırlatmak yerine aynı varyantı tekrar döndürürdü (mantık kanıtı)', () => {
    // Gerçek içerik havuzlarının tümü >= 3 varyant içerir (spec zorunluluğu);
    // "tek varyant" durumunu üretim havuzuyla üretemeyiz. Burada
    // `pickFromPool` davranışını `selectLine` üzerinden dolaylı doğruluyoruz:
    // aynı weekStart + aynı prevVariantId ile tekrar çağrıldığında (kaydırma
    // sonrası da olsa) sonuç yine deterministiktir ve hata fırlatmaz.
    const weekStart = '2026-05-11';
    const result1 = selectLine({ category: 'social', level: 'high', weekStart, prevVariantId: null });
    expect(() =>
      selectLine({ category: 'social', level: 'high', weekStart, prevVariantId: result1.id })
    ).not.toThrow();
  });
});

describe('selectLine — dağılım testi (52 ardışık hafta, tek varyant hakimiyet kurmaz)', () => {
  it("52 haftalık zincirde (kategori: movement, seviye: high) hiçbir varyant %70'i geçmez", () => {
    const weekStarts = weekStartChain('2024-01-01', 52);
    let prevId: string | null = null;
    const counts: Record<string, number> = {};

    for (const weekStart of weekStarts) {
      const result = selectLine({ category: 'movement', level: 'high', weekStart, prevVariantId: prevId });
      counts[result.id] = (counts[result.id] ?? 0) + 1;
      prevId = result.id;
    }

    const maxShare = Math.max(...Object.values(counts)) / weekStarts.length;
    expect(maxShare).toBeLessThanOrEqual(0.7);
    // Havuzda >= 3 varyant olduğundan, ideal durumda en az 2 farklı kimlik gözlenmeli.
    expect(Object.keys(counts).length).toBeGreaterThanOrEqual(2);
  });
});

describe('classifySummaryBucket — deltalardan şablon türü çıkarımı', () => {
  const build = (values: [Delta, Delta, Delta, Delta]): Record<Category, Delta> => ({
    movement: values[0],
    sleep: values[1],
    spending: values[2],
    social: values[3],
  });

  it('hepsi null -> firstCard', () => {
    expect(classifySummaryBucket(build([null, null, null, null]))).toBe('firstCard');
  });

  it('bazıları null, bazıları değil -> partialData', () => {
    expect(classifySummaryBucket(build([null, 1, 0, -1]))).toBe('partialData');
  });

  it('hepsi 0 -> allStable', () => {
    expect(classifySummaryBucket(build([0, 0, 0, 0]))).toBe('allStable');
  });

  it('yükselen > düşen -> risingMajority', () => {
    expect(classifySummaryBucket(build([1, 1, 1, 0]))).toBe('risingMajority');
  });

  it('düşen > yükselen -> fallingMajority', () => {
    expect(classifySummaryBucket(build([-1, -1, -1, 0]))).toBe('fallingMajority');
  });

  it('yükselen == düşen (ve > 0) -> balancedMixed', () => {
    expect(classifySummaryBucket(build([1, -1, 1, -1]))).toBe('balancedMixed');
  });
});

describe('selectSummary — sözleşme, determinizm ve tekrar-önleme', () => {
  const allNull = { movement: null, sleep: null, spending: null, social: null } as Record<Category, Delta>;

  it('döndürülen özet, ilgili bucket havuzuna ait bir kimliktir', () => {
    const result = selectSummary({ deltas: allNull, weekStart: '2026-09-21', prevVariantId: null });
    const ids = SUMMARY_VARIANTS.firstCard.map((v) => v.id);
    expect(ids).toContain(result.id);
  });

  it('aynı girdiyle iki kez çağrılınca özdeş sonuç döner (week_start determinizmi)', () => {
    const params = { deltas: allNull, weekStart: '2026-04-06', prevVariantId: null };
    expect(selectSummary(params)).toEqual(selectSummary(params));
  });

  it('her şablon havuzunda en az 2 varyant var (tekrar-önleme test edilebilir olsun diye)', () => {
    const buckets = Object.keys(SUMMARY_VARIANTS) as SummaryBucket[];
    expect(buckets.length).toBeGreaterThanOrEqual(6);
    for (const bucket of buckets) {
      expect(SUMMARY_VARIANTS[bucket].length).toBeGreaterThanOrEqual(2);
    }
  });

  it('ardışık hafta aynı bucket için farklı varyant döner', () => {
    const first = selectSummary({ deltas: allNull, weekStart: '2026-02-02', prevVariantId: null });
    const second = selectSummary({ deltas: allNull, weekStart: '2026-02-09', prevVariantId: first.id });
    expect(second.id).not.toBe(first.id);
  });
});

describe('Satır/özet metinleri — ton/uzunluk/rakam denetimi', () => {
  it('tüm statik satır varyantları <= 60 karakter ve rakam içermez', () => {
    for (const category of CATEGORIES) {
      for (const level of LEVELS) {
        for (const variant of LINE_VARIANTS[category][level]) {
          expect(variant.text.length).toBeLessThanOrEqual(60);
          expect(variant.text).not.toMatch(/[0-9]/);
        }
      }
    }
  });

  it('tüm statik özet varyantları <= 60 karakter ve rakam içermez', () => {
    for (const bucket of Object.keys(SUMMARY_VARIANTS) as SummaryBucket[]) {
      for (const variant of SUMMARY_VARIANTS[bucket]) {
        expect(variant.text.length).toBeLessThanOrEqual(60);
        expect(variant.text).not.toMatch(/[0-9]/);
      }
    }
  });

  it('üretilen nihai satır/özet metinleri (52 haftalık zincir üzerinden) de kurala uyar', () => {
    const weekStarts = weekStartChain('2023-06-05', 52);
    let prevLineId: string | null = null;
    let prevSummaryId: string | null = null;
    for (const weekStart of weekStarts) {
      const line = selectLine({ category: 'sleep', level: 'high', weekStart, prevVariantId: prevLineId });
      expect(line.text.length).toBeLessThanOrEqual(60);
      expect(line.text).not.toMatch(/[0-9]/);
      prevLineId = line.id;

      const summary = selectSummary({
        deltas: { movement: 1, sleep: 0, spending: -1, social: 1 },
        weekStart,
        prevVariantId: prevSummaryId,
      });
      expect(summary.text.length).toBeLessThanOrEqual(60);
      expect(summary.text).not.toMatch(/[0-9]/);
      prevSummaryId = summary.id;
    }
  });
});

describe('selectLine / selectSummary — eksik/bozuk havuz durumunda fail-fast', () => {
  it('geçersiz bir level değeriyle çağrılırsa hata fırlatır (sessiz undefined değil)', () => {
    expect(() =>
      selectLine({
        category: 'movement',
        level: 'extreme' as unknown as Level,
        weekStart: '2026-09-21',
        prevVariantId: null,
      })
    ).toThrow();
  });
});

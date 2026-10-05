/**
 * Kart fikstürleri (28 §6 İ-2: "kart fikstür galerisi"): `CardView`/yakalama/düzen testlerinin ve
 * K4 ekran görüntülerinin ortak girdisi. Geliştirici aracıdır (`src/dev`), ürün koduna import edilmez.
 *
 * Gerçek havuz metinlerinden kurulur (içerik değişirse fikstür de onu izler); uç durumlar için
 * `synthetic: true` işaretli, havuzda OLMAYAN metinler vardır (36 karakter sınırı, Türkçe i/İ).
 * Hepsi dondurulmuş `CardSnapshot`'tır; gizleme `hidden` ile ayrıca verilir (kart gizlemeyi
 * render anında uygular, anlık görüntüye yazmaz).
 */
import { LINE_VARIANTS, SUMMARY_VARIANTS, TITLE_TEXTS, CONTENT_VERSION } from '@/domain/content/tr';
import { CATEGORIES } from '@/domain/types';
import type { CardSnapshot, Category, Delta, Level } from '@/domain/types';

export interface CardFixture {
  name: string;
  /** Havuzda olmayan, uç durum için yazılmış metin içerir. */
  synthetic: boolean;
  snapshot: CardSnapshot;
  /** `CardView hiddenCategories` olarak verilecek küme. */
  hidden: readonly Category[];
}

function pickLine(category: Category, level: Level, variant = 0) {
  const line = LINE_VARIANTS[category][level][variant];
  return { id: line.id, text: line.text };
}

function build(
  levels: Record<Category, Level>,
  opts: {
    titleKey: string;
    basedOn: Category[];
    title?: string;
    lineText?: Partial<Record<Category, string>>;
    summaryKey?: keyof typeof SUMMARY_VARIANTS;
    deltas?: Record<Category, Delta>;
  }
): CardSnapshot {
  const lines = Object.fromEntries(
    CATEGORIES.map((c) => {
      const line = pickLine(c, levels[c]);
      return [c, { id: line.id, text: opts.lineText?.[c] ?? line.text }];
    })
  ) as CardSnapshot['lines'];
  const summary = SUMMARY_VARIANTS[opts.summaryKey ?? 'allStable'][0];
  return {
    weekStart: '2026-09-21',
    checkinDays: 6,
    title: { id: opts.titleKey, text: opts.title ?? TITLE_TEXTS[opts.titleKey], basedOnCategories: opts.basedOn },
    lines,
    deltas: opts.deltas ?? { movement: 0, sleep: 0, spending: 0, social: 0 },
    summary: { id: summary.id, text: summary.text },
    contentVersion: CONTENT_VERSION,
  };
}

const MIXED: Record<Category, Level> = { movement: 'high', sleep: 'medium', spending: 'low', social: 'medium' };
const ALL_LOW: Record<Category, Level> = { movement: 'low', sleep: 'low', spending: 'low', social: 'low' };
const ALL_HIGH: Record<Category, Level> = { movement: 'high', sleep: 'high', spending: 'high', social: 'high' };

export const CARD_FIXTURES: readonly CardFixture[] = [
  {
    name: 'normal',
    synthetic: false,
    snapshot: build(MIXED, {
      titleKey: 'title.combo.movementHighSpendingLow',
      basedOn: ['movement', 'spending'],
      summaryKey: 'risingMajority',
      deltas: { movement: 1, sleep: 0, spending: 0, social: 0 },
    }),
    hidden: [],
  },
  {
    name: 'hepsi-dusuk',
    synthetic: false,
    snapshot: build(ALL_LOW, { titleKey: 'title.combo.allFourLow', basedOn: [...CATEGORIES], summaryKey: 'fallingMajority' }),
    hidden: [],
  },
  {
    name: 'hepsi-yuksek',
    synthetic: false,
    snapshot: build(ALL_HIGH, { titleKey: 'title.combo.allFourHigh', basedOn: [...CATEGORIES] }),
    hidden: [],
  },
  {
    name: 'varsayilan-gizli',
    synthetic: false,
    snapshot: build(MIXED, {
      titleKey: 'title.combo.movementHighSpendingLow',
      basedOn: ['movement', 'spending'],
    }),
    // Varsayılan gizleme: uyku + harcama (harcama unvanı da gizletir).
    hidden: ['sleep', 'spending'],
  },
  {
    name: 'en-uzun-metin',
    synthetic: true,
    snapshot: build(MIXED, {
      titleKey: 'title.combo.stress36',
      basedOn: ['movement'],
      title: 'Uzun Bir Pazarın Gürültülü Çocukları',
      lineText: {
        movement: 'Adımların haftanın her günü kapıyı çaldı, hatta bazı geceler fazla mesaiye bile kaldı.',
        sleep: 'Yastığa kavuşma saatin haftanın başından sonuna kadar hiç şaşmadan hep aynı kaldı.',
      },
      summaryKey: 'firstCard',
    }),
    hidden: [],
  },
  {
    name: 'turkce-i-stresi',
    synthetic: true,
    snapshot: build(MIXED, {
      titleKey: 'title.combo.stressTr',
      basedOn: ['sleep'],
      title: 'İşıl İşıl Çığ Gibi Ölçüsüz',
      lineText: { social: 'Işık, ıslık, İzmir, ığdır: ı ile İ yan yana.' },
    }),
    hidden: [],
  },
];

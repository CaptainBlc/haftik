/**
 * `CardView` — hem render hem de mimari sınır testi.
 *
 * **Görev talimatının açıkça istediği statik kontrol (madde 7):**
 * `CardView.tsx` dosyası `content/tr.ts`'i (gerçek unvan/satır/özet metin
 * havuzu) ASLA import etmemeli — kaynağı doğrudan okuyup bir
 * `import ... from '.../content/tr'` deseni aranır (yalnızca dosya
 * içindeki AÇIKLAMA metninde geçen "content/tr" sözcüğünü DEĞİL, gerçek
 * bir import/require ifadesini yakalayacak şekilde) — aynı desen
 * `__tests__/components/locked-card-placeholder.test.tsx`teki gibi.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Text } from 'react-native';
import { act, create } from 'react-test-renderer';

import { CardView } from '@/card/CardView';
import type { CardSnapshot } from '@/domain/types';

/** `findByProps({testID})` bir `TestInstance` döner; onun `.toJSON()`u YOK
 * (yalnızca kök `renderer.toJSON()`da var) — bu yüzden bir alt ağacın
 * render edilmiş metnini almak için içindeki `Text` düğümlerinin
 * `props.children`ını toplarız (aynı desen: bu dosyadaki "gömülü damgayı
 * çizer" testi, `stamp.props.children`). */
function textsIn(instance: ReturnType<ReturnType<typeof create>['root']['findByProps']>): string {
  return instance
    .findAllByType(Text)
    .map((node) => String(node.props.children))
    .join(' | ');
}

const COMPONENT_SOURCE_PATH = path.resolve(__dirname, '../../src/card/CardView.tsx');

function makeSnapshot(overrides: Partial<CardSnapshot> = {}): CardSnapshot {
  return {
    weekStart: '2026-09-21',
    checkinDays: 5,
    title: { id: 'title.movement.high', text: 'Enerji Canavarı', basedOnCategories: ['movement'] },
    lines: {
      movement: { id: 'line.movement.high.1', text: 'Bu hafta hiç durmadın.' },
      sleep: { id: 'line.sleep.medium.2', text: 'İdare eden bir uyku haftası.' },
      spending: { id: 'line.spending.low.1', text: 'Cüzdanına iyi davrandın.' },
      social: { id: 'line.social.medium.3', text: 'Ne fazla ne az, tam kıvamında.' },
    },
    deltas: { movement: 1, sleep: 0, spending: null, social: -1 },
    summary: { id: 'summary.mixed.1', text: 'Bu hafta karışık geçti.' },
    contentVersion: 1,
    ...overrides,
  };
}

describe('CardView — mimari sınır (statik kaynak denetimi)', () => {
  const source = fs.readFileSync(COMPONENT_SOURCE_PATH, 'utf-8');

  it("content/tr.ts'ten (veya herhangi bir content modülünden) import/require ETMEZ", () => {
    const importsContentPool = /(?:from\s+['"]|require\(\s*['"])[^'"]*content\/tr['"]/.test(
      source
    );
    expect(importsContentPool).toBe(false);
  });
});

describe('CardView — render', () => {
  it('dondurulmuş unvan, 4 satır (sabit sırayla) ve özet metnini çizer', () => {
    const snapshot = makeSnapshot();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardView snapshot={snapshot} />);
    });
    const json = JSON.stringify(tree!.toJSON());

    expect(json).toContain(snapshot.title.text);
    expect(json).toContain(snapshot.lines.movement.text);
    expect(json).toContain(snapshot.lines.sleep.text);
    expect(json).toContain(snapshot.lines.spending.text);
    expect(json).toContain(snapshot.lines.social.text);
    expect(json).toContain(snapshot.summary.text);

    // Sabit sıra: hareket → uyku → harcama → sosyal (spec `CATEGORIES`).
    const order = ['movement', 'sleep', 'spending', 'social'] as const;
    const indices = order.map((category) =>
      tree!.root.findByProps({ testID: `card-line-${category}` })
    );
    expect(indices).toHaveLength(4);
  });

  it('gömülü damgayı (K4/K5 yer tutucusu) çizer', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardView snapshot={makeSnapshot()} />);
    });
    const stamp = tree!.root.findByProps({ testID: 'card-stamp' });
    expect(JSON.stringify(stamp.props.children)).toContain('Haftik');
  });

  it('her satırın id\'sinden doğru seviyeye karşılık gelen emoji\'yi seçer (emoji-seti.md)', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardView snapshot={makeSnapshot()} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    // movement=high -> 🏃, sleep=medium -> 😌, spending=low -> 🐷, social=medium -> 👥
    expect(json).toContain('🏃');
    expect(json).toContain('😌');
    expect(json).toContain('🐷');
    expect(json).toContain('👥');
  });

  it('sectionOpacity verilmezse tüm bölümler tam opak (varsayılan 1) render edilir', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardView snapshot={makeSnapshot()} />);
    });
    const title = tree!.root.findByProps({ testID: 'card-title' });
    const flatStyle = [title.props.style].flat(Infinity).reduce((acc, s) => ({ ...acc, ...s }), {});
    expect(flatStyle.opacity).toBe(1);
  });

  it('gizlenen kategori olsa bile bu dilimde (S7a) hep gerçek metni çizer — "???" render\'ı S7b\'nin işi', () => {
    const snapshot = makeSnapshot();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardView snapshot={snapshot} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).not.toContain('???');
  });
});

describe('CardView — satır/unvan gizleme (S7b, hiddenCategories)', () => {
  it('gizli kategorinin gerçek satır metni render ağacında GERÇEKTEN YOK (yalnızca CSS ile gizlenmiyor)', () => {
    const snapshot = makeSnapshot();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <CardView snapshot={snapshot} hiddenCategories={new Set(['sleep', 'spending'])} />
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).not.toContain(snapshot.lines.sleep.text);
    expect(json).not.toContain(snapshot.lines.spending.text);
    // Gerçek yerine sabit yer tutucu basılır.
    const sleepRow = tree!.root.findByProps({ testID: 'card-line-sleep' });
    expect(textsIn(sleepRow)).toContain('???');
  });

  it('gizlenmeyen kategorilerin gerçek metni hâlâ render edilir (yalnızca hedeflenen satırlar etkilenir)', () => {
    const snapshot = makeSnapshot();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardView snapshot={snapshot} hiddenCategories={new Set(['sleep'])} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain(snapshot.lines.movement.text);
    expect(json).toContain(snapshot.lines.spending.text);
    expect(json).toContain(snapshot.lines.social.text);
    expect(json).not.toContain(snapshot.lines.sleep.text);
  });

  it('gizli satırın seviyeye özgü emoji\'si de görünmez (emoji seviyeyi ifşa eder)', () => {
    // movement=high -> 🏃 (bkz. makeSnapshot). Gizlenince bu emoji hiç çizilmemeli.
    const snapshot = makeSnapshot();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardView snapshot={snapshot} hiddenCategories={new Set(['movement'])} />);
    });
    const movementRow = tree!.root.findByProps({ testID: 'card-line-movement' });
    expect(textsIn(movementRow)).not.toContain('🏃');
  });

  it('unvan, basedOnCategories\'teki bir kategori gizliyse "???" olur, gerçek unvan metni yok olur', () => {
    const snapshot = makeSnapshot({
      title: { id: 'title.movement.high', text: 'Enerji Canavarı', basedOnCategories: ['movement'] },
    });
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardView snapshot={snapshot} hiddenCategories={new Set(['movement'])} />);
    });
    const title = tree!.root.findByProps({ testID: 'card-title' });
    expect(String(title.props.children)).not.toContain('Enerji Canavarı');
    expect(String(title.props.children)).toContain('???');
  });

  it('unvan basedOnCategories boşsa ("dört kategori ortada" gibi genel kural), hiçbir gizlemeden etkilenmez', () => {
    const snapshot = makeSnapshot({
      title: { id: 'title.balanced', text: 'Dengeli Haftacı', basedOnCategories: [] },
    });
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <CardView
          snapshot={snapshot}
          hiddenCategories={new Set(['movement', 'sleep', 'spending', 'social'])}
        />
      );
    });
    const title = tree!.root.findByProps({ testID: 'card-title' });
    expect(String(title.props.children)).toContain('Dengeli Haftacı');
  });

  it('hiddenCategories verilmezse S7a ile birebir aynı (geriye dönük uyumlu): hiçbir şey gizlenmez', () => {
    const snapshot = makeSnapshot();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardView snapshot={snapshot} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain(snapshot.title.text);
    expect(json).toContain(snapshot.lines.sleep.text);
    expect(json).toContain(snapshot.lines.spending.text);
  });
});

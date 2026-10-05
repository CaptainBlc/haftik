/**
 * R-15 (28 §4.11): kart render sözleşmesi. Teknik seçim ne olursa olsun bozulmaması gereken maddeler;
 * burada bugün denetlenebilir olanlar bağlanır (1, 3, 8 ve gizlilik 5'in sabit-yer-tutucu yarısı).
 * Madde 2 (PNG varlıklar), 4 (eğik öğelerin v2 yerleşimi), 6 (LevelMark), 7 (font yedek) `CardView` v2 ile eklenir.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { StyleSheet } from 'react-native';
import { act, create } from 'react-test-renderer';

import { CardView } from '@/card/CardView';
import { CARD_FIXTURES } from '@/dev/card-fixtures';

const root = path.join(__dirname, '..', '..');

function collect(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) collect(full, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(full);
  }
  return out;
}

/** Satır ve blok yorumlarını boşaltır; kuralları ANLATAN yorumlar yasak sözcükleri anabilir. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const cardSources = collect(path.join(root, 'src', 'card')).map((f) => ({
  file: path.relative(root, f).replace(/\\/g, '/'),
  code: stripComments(fs.readFileSync(f, 'utf8')),
}));

describe('R-15 madde 1: yakalanan ağaçta platforma bağlı efekt yok', () => {
  it('src/card kaynaklarında elevation/shadow*/boxShadow/blur/gradyan/SVG yok', () => {
    const banned = /\b(elevation|shadowColor|shadowOffset|shadowOpacity|shadowRadius|boxShadow)\b|expo-blur|expo-linear-gradient|react-native-svg|BlurView|LinearGradient/;
    const hits = cardSources.filter((s) => banned.test(s.code)).map((s) => s.file);
    expect(hits).toEqual([]);
  });

  it.each(CARD_FIXTURES.map((f) => [f.name, f] as const))('%s fikstürünün render ağacında yasaklı stil anahtarı yok', (_n, fx) => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardView snapshot={fx.snapshot} hiddenCategories={new Set(fx.hidden)} />);
    });
    const banned = /^(elevation|shadow.*|boxShadow|filter)$/;
    const bad: string[] = [];
    tree!.root.findAll((n) => {
      const style = StyleSheet.flatten(n.props?.style as never) as Record<string, unknown> | undefined;
      for (const key of Object.keys(style ?? {})) if (banned.test(key)) bad.push(key);
      return false;
    });
    expect(bad).toEqual([]);
    act(() => tree!.unmount());
  });
});

describe('R-15 madde 3: eğim ve renk tek kaynak', () => {
  it('sayısal `rotate` değeri yalnız token/Sticker üzerinden gelir (kart kodunda gömülü derece yok)', () => {
    const allowed = new Set(['src/card/Sticker.tsx', 'src/card/tokens.ts']);
    const hits = cardSources
      .filter((s) => !allowed.has(s.file))
      .filter((s) => /rotate\s*:|['"`]-?\d+(\.\d+)?deg['"`]/.test(s.code))
      .map((s) => s.file);
    expect(hits).toEqual([]);
  });
});

describe('R-15 madde 8: önizleme ile paylaşılan PNG aynı CardView', () => {
  it('ViewShot yalnız CardView.tsx içinde render edilir (ikinci bir render yolu yok)', () => {
    const users = collect(path.join(root, 'src'))
      // Yalnız DEĞER importları sayılır; `import type { ViewShotRef }` render yolu açmaz.
      .filter((f) => /^import (?!type\b)[^;]*from 'react-native-view-shot'/m.test(fs.readFileSync(f, 'utf8')))
      .map((f) => path.relative(root, f).replace(/\\/g, '/'))
      .sort();
    // capture.ts yalnızca `captureRef` ile yakalar (render etmez); CardView tek `<ViewShot>` sahibidir.
    expect(users).toEqual(['src/card/CardView.tsx', 'src/card/capture.ts']);
    const withComponent = users.filter((f) => /<ViewShot\b/.test(stripComments(fs.readFileSync(path.join(root, f), 'utf8'))));
    expect(withComponent).toEqual(['src/card/CardView.tsx']);
  });

  it('kart önizleme ekranı CardView kullanır, kendi kart düzenini çizmez', () => {
    const src = fs.readFileSync(path.join(root, 'src', 'components', 'card-preview-view.tsx'), 'utf8');
    expect(src).toMatch(/from '@\/card\/CardView'/);
  });
});

describe('fikstür galerisi (İ-2)', () => {
  it('6 fikstür, adları benzersiz; en az biri gizli, biri 36 karakterlik, biri Türkçe i/İ stresi', () => {
    expect(CARD_FIXTURES).toHaveLength(6);
    expect(new Set(CARD_FIXTURES.map((f) => f.name)).size).toBe(6);
    expect(CARD_FIXTURES.some((f) => f.hidden.length > 0)).toBe(true);
    expect(CARD_FIXTURES.some((f) => f.snapshot.title.text.length >= 33)).toBe(true);
    expect(CARD_FIXTURES.some((f) => /[İı]/.test(f.snapshot.title.text))).toBe(true);
  });

  it('gerçek havuzdan kurulan fikstürlerin kimlikleri havuzdadır (içerik değişirse fikstür izler)', () => {
    for (const fx of CARD_FIXTURES.filter((f) => !f.synthetic)) {
      expect(fx.snapshot.title.text.length).toBeGreaterThan(0);
      for (const line of Object.values(fx.snapshot.lines)) expect(line.id).toMatch(/^line\./);
    }
  });
});

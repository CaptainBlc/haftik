/**
 * R-7 (28 §3): renk tek kaynak. ESLint kuralı `eslint.config.js`'tedir; bu test iki şeyi bağlar:
 * (1) eski ihlal listesi YALNIZCA küçülür (dosya başına literal sayısı bir üst sınırdır),
 * (2) izinli/eski liste dışındaki hiçbir `src/` dosyasında hex literal yoktur
 *     (ESLint'in atladığı/kapatıldığı durumlara karşı ikinci güvence).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.join(__dirname, '..', '..');
const HEX = /(['"])#[0-9a-fA-F]{3,8}\1/g;

/** S19 başlangıcındaki sayılar (üst sınır). Azalırsa burası da azaltılır; artamaz. */
const LEGACY_MAX: Record<string, number> = {
  'src/app/_layout.tsx': 9,
  'src/card/CardRevealView.tsx': 2,
  'src/card/CardView.tsx': 2,
  'src/components/locked-card-placeholder.tsx': 3,
  'src/components/settings-view.tsx': 2,
  'src/components/themed-text.tsx': 1,
};

function listFrom(config: string, name: string): string[] {
  const block = /\/\/ R7-BEGIN([\s\S]*?)\/\/ R7-END/.exec(config)?.[1] ?? '';
  const m = new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`).exec(block);
  if (!m) throw new Error(`eslint.config.js içinde ${name} bulunamadı`);
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
}

function collect(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) collect(full, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(full);
  }
  return out;
}

const config = fs.readFileSync(path.join(root, 'eslint.config.js'), 'utf8');
const allowed = listFrom(config, 'R7_ALLOWED_FILES');
const legacy = listFrom(config, 'R7_LEGACY_FILES');
const rel = (f: string) => path.relative(root, f).replace(/\\/g, '/');
const count = (f: string) => (fs.readFileSync(f, 'utf8').match(HEX) ?? []).length;

describe('R-7 renk tek kaynak', () => {
  it('eski ihlal listesi test sınırlarıyla aynı dosyalardır ve literal sayısı artmamıştır', () => {
    expect([...legacy].sort()).toEqual(Object.keys(LEGACY_MAX).sort());
    for (const f of legacy) {
      expect(count(path.join(root, f))).toBeLessThanOrEqual(LEGACY_MAX[f]);
    }
  });

  it('listede olup artık ihlali kalmayan dosya yok (liste küçülmeli)', () => {
    for (const f of legacy) {
      expect({ file: f, literals: count(path.join(root, f)) }).not.toEqual({ file: f, literals: 0 });
    }
  });

  it('izinli ve eski liste dışındaki src/ dosyalarında hex literal yok', () => {
    const skip = (f: string) =>
      allowed.some((a) => (a.endsWith('/**') ? f.startsWith(a.slice(0, -2)) : f === a)) || legacy.includes(f);
    const offenders = collect(path.join(root, 'src'))
      .map(rel)
      .filter((f) => !skip(f))
      .filter((f) => count(path.join(root, f)) > 0);
    expect(offenders).toEqual([]);
  });

  it('kart token dosyası var ve izinli listede', () => {
    expect(allowed).toContain('src/card/tokens.ts');
    expect(allowed).toContain('src/constants/tokens.ts');
  });
});

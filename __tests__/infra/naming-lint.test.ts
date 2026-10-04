/**
 * S16a: adlandırma ve metin-kod lint'i.
 * - R-12 / L3 (A15): kullanıcıya dönük yüzeylerde ("src/", "site/", mağaza belgesi)
 *   "karne" yok; her yerde "Kart".
 * - "8 saniye" iddiası ölçülene kadar "birkaç saniye" (A15, kronometre ölçümü yok).
 * - `textTransform` / `toUpperCase` yasağı: Türkçe i/İ büyük harf dönüşümü hatalıdır
 *   (`'i'.toUpperCase() === 'I'`), büyük harf gerekiyorsa metin elle büyük yazılır.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.join(__dirname, '..', '..');

function collect(dir: string, exts: RegExp, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, exts, out);
    else if (exts.test(entry.name)) out.push(full);
  }
  return out;
}

const srcFiles = collect(path.join(root, 'src'), /\.(ts|tsx)$/);
const siteFiles = collect(path.join(root, 'site'), /\.(html|md)$/);
const storeDoc = path.join(root, 'docs', 's12-magaza-icerigi.md');
const userFacing = [...srcFiles, ...siteFiles, storeDoc];

describe('R-12 / L3: "karne" kullanıcıya dönük yüzeylerde yok', () => {
  it('src/, site/ ve mağaza belgesinde "karne" geçmez', () => {
    expect(userFacing.length).toBeGreaterThan(20);
    const hits = userFacing.filter((f) => /karne/i.test(fs.readFileSync(f, 'utf8')));
    expect(hits.map((f) => f.replace(root, ''))).toEqual([]);
  });
});

describe('"8 saniye" iddiası', () => {
  it('site ve mağaza belgesinde ölçülmemiş "8 saniye / 8 sn" iddiası yok', () => {
    const hits = [...siteFiles, storeDoc].filter((f) =>
      /(?<!\d)8 (saniye|sn)\b/i.test(fs.readFileSync(f, 'utf8'))
    );
    expect(hits.map((f) => f.replace(root, ''))).toEqual([]);
  });

  it('src/ kullanıcı metinlerinde "8 saniye" yok', () => {
    const hits = srcFiles.filter((f) => /(?<!\d)8 (saniye|sn)\b/i.test(fs.readFileSync(f, 'utf8')));
    expect(hits.map((f) => f.replace(root, ''))).toEqual([]);
  });
});

describe('Türkçe büyük harf tuzağı', () => {
  it('src/ içinde textTransform ve toUpperCase/toLocaleUpperCase kullanılmaz', () => {
    const hits = srcFiles.filter((f) =>
      /textTransform|\.toUpperCase\(|\.toLocaleUpperCase\(/.test(fs.readFileSync(f, 'utf8'))
    );
    expect(hits.map((f) => f.replace(root, ''))).toEqual([]);
  });
});

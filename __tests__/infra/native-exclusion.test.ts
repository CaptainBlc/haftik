/**
 * Kullanılmayan native modüllerin derlemeden dışlanması (`react-native.config.js`): reanimated (S18) ve worklets
 * (2026-10-05). Gerçek kanıt release APK'dadır (`libreanimated.so`/`libworklets.so` yok, K4); bu test yapılandırmanın
 * ve "uygulama bunları kullanmıyor" varsayımının bozulmamasını bağlar.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.join(__dirname, '..', '..');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const config = require(path.join(root, 'react-native.config.js')) as {
  dependencies: Record<string, { platforms: Record<string, unknown> }>;
};

function collect(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) collect(full, out);
    else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) out.push(full);
  }
  return out;
}

describe.each(['react-native-reanimated', 'react-native-worklets'])('%s native derlemeden dışlı', (name) => {
  it('Android ve iOS için platforms null', () => {
    expect(config.dependencies[name].platforms.android).toBeNull();
    expect(config.dependencies[name].platforms.ios).toBeNull();
  });

  it('src/ içinde import/require yok (kullanılmıyor; kullanılırsa önce dışlama kaldırılmalı)', () => {
    const importRe = new RegExp(`(from\\s+|require\\()['"]${name}`);
    const hits = collect(path.join(root, 'src'))
      .filter((f) => importRe.test(fs.readFileSync(f, 'utf8')))
      .map((f) => f.replace(root, ''));
    expect(hits).toEqual([]);
  });
});

describe('worklets bağımlılığı', () => {
  it('package.json doğrudan bağımlılığı sürümü sabitler (Expo uyumu); dışlama onu kaldırmaz', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>;
    };
    expect(pkg.dependencies['react-native-worklets']).toMatch(/^\d+\.\d+\.\d+$/); // sabit, aralık değil
  });
});

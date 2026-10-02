/**
 * S18 (A18): release yapılandırması geri alınmasın diye mekanik koruma.
 * Gerçek kanıt release APK'dadır (boyut, `libreanimated.so` yok, R8 matrisi;
 * CLAUDE.md "S18" notu) — burada yalnızca yapılandırma sözleşmesi korunur.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.join(__dirname, '..', '..');
const appJson = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

describe('release yapılandırması (A18 / S18)', () => {
  it('R8 + kaynak küçültme expo-build-properties ile açık (preview ve production aynı yapılandırmayı kullanır)', () => {
    const entry = (appJson.expo.plugins as unknown[]).find(
      (p) => Array.isArray(p) && p[0] === 'expo-build-properties'
    ) as [string, { android: Record<string, boolean> }] | undefined;
    expect(entry).toBeDefined();
    expect(entry![1].android.enableMinifyInReleaseBuilds).toBe(true);
    expect(entry![1].android.enableShrinkResourcesInReleaseBuilds).toBe(true);
  });

  it('react-native-reanimated package.json bağımlılığı değil ve native derlemeden dışlanmış', () => {
    expect(pkg.dependencies['react-native-reanimated']).toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const config = require(path.join(root, 'react-native.config.js'));
    expect(config.dependencies['react-native-reanimated'].platforms.android).toBeNull();
  });

  it('react-native-worklets KALIR (expo-modules-core bağımlılığı)', () => {
    expect(pkg.dependencies['react-native-worklets']).toBeDefined();
  });

  it('expo-build-properties paketi kurulu ve yalnızca prebuild/config plugin olarak kullanılıyor (src/ içinde import yok)', () => {
    expect(pkg.dependencies['expo-build-properties']).toBeDefined();
    const files: string[] = [];
    (function walk(dir: string) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(e.name)) files.push(full);
      }
    })(path.join(root, 'src'));
    for (const f of files) {
      expect(fs.readFileSync(f, 'utf8')).not.toMatch(/expo-build-properties|react-native-reanimated/);
    }
  });
});

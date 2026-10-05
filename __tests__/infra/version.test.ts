/**
 * Sürüm tutarlılığı (26 R-1; S19 sonrası `0.1.0`): kullanıcıya görünen sürüm `app.json`'dadır (`expo-constants` okur),
 * `package.json` ve `package-lock.json` kökü onunla aynı olmalı (ayrışırsa hata bildirimindeki "hangi sürüm" belirsizleşir).
 * Sürüm planı: `0.x` -> 0.9.0 (Play kapalı test) -> 1.0.0 (26 §1.3); `1.0.0` yalnız bilinçli bir kararla gelir.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.join(__dirname, '..', '..');
const readJson = (f: string) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));

const appVersion: string = readJson('app.json').expo.version;
const pkgVersion: string = readJson('package.json').version;
const lock = readJson('package-lock.json') as { version: string; packages: Record<string, { version?: string }> };

describe('sürüm', () => {
  it('app.json sürümü MAJOR.MINOR.PATCH biçiminde ve 0.x (1.0.0 yalnız bilinçli kararla)', () => {
    expect(appVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(Number(appVersion.split('.')[0])).toBe(0);
  });

  it('package.json ve package-lock.json kökü app.json ile aynı sürümde', () => {
    expect(pkgVersion).toBe(appVersion);
    expect(lock.version).toBe(appVersion);
    expect(lock.packages[''].version).toBe(appVersion);
  });
});

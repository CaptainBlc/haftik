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

describe('CHANGELOG.md (26 §2.5, D3)', () => {
  const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
  const headings = [...changelog.matchAll(/^## \[(\d+\.\d+\.\d+)\]/gm)].map((m) => m[1]);

  it('en üstteki sürüm başlığı app.json sürümüyle aynı', () => {
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]).toBe(appVersion);
  });

  it('sürüm başlıkları tekrarsız ve yeniden eskiye sıralı', () => {
    expect(new Set(headings).size).toBe(headings.length);
    const toNum = (v: string) => v.split('.').reduce((acc, n) => acc * 1000 + Number(n), 0);
    const nums = headings.map(toNum);
    expect([...nums].sort((a, b) => b - a)).toEqual(nums);
  });

  it('en üstteki sürüm şablondaki zorunlu bölümleri taşır', () => {
    const top = changelog.split(/^## \[/m)[1];
    for (const section of ['### Eklendi', '### Değişti', '### Düzeltildi', '### Bilinen sınırlar', '### Veri ve şema notu', '### Kanıt']) {
      expect(top).toContain(section);
    }
  });

  it('yer tutucu sözcükler yok ("TASLAK", eski paket adı, mağaza bağlantısı yer tutucusu)', () => {
    expect(changelog).not.toMatch(/TASLAK|com\.anonymous|\[mağaza bağlantısı\]/);
  });
});

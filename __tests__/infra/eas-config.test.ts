/**
 * `eas.json` sözleşmesi (26 §1.4, A4; Karar C7 / S3 onayı 2026-10-05): `appVersionSource: remote` iken yalnız `autoIncrement` olan
 * profil uzak `versionCode` sayacını artırır; sayaç tüm profillerde ortaktır. `preview` artırmazsa her arkadaş APK'sı aynı
 * `versionCode`'la (1) çıkar ve "hangi build hangi telefonda" ayırt edilemez. OTA kapalı (E3): kanal/güncelleme yok.
 * Gerçek EAS davranışı (sayaç artışı, imza) hesapla doğrulanır (P1); bu test yapılandırmanın bozulmamasını bağlar.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.join(__dirname, '..', '..');
const eas = JSON.parse(fs.readFileSync(path.join(root, 'eas.json'), 'utf8')) as {
  cli: { appVersionSource?: string };
  build: Record<
    string,
    { autoIncrement?: boolean; distribution?: string; channel?: string; env?: Record<string, string>; android?: { buildType?: string } }
  >;
};

describe('eas.json', () => {
  it('sürüm kaynağı uzak sayaç', () => {
    expect(eas.cli.appVersionSource).toBe('remote');
  });

  it.each(['preview', 'production'])('%s profili versionCode sayacını artırır (autoIncrement: true)', (profile) => {
    expect(eas.build[profile].autoIncrement).toBe(true);
  });

  it('yalnız preview ve production profilleri var (kullanılmayan "development" yok, N-8)', () => {
    expect(Object.keys(eas.build).sort()).toEqual(['preview', 'production']);
  });

  it('preview APK (internal), production AAB; kanal etiketleri ayrı', () => {
    expect(eas.build.preview.android?.buildType).toBe('apk');
    expect(eas.build.preview.distribution).toBe('internal');
    expect(eas.build.production.android?.buildType).toBe('app-bundle');
    expect(eas.build.preview.env?.EXPO_PUBLIC_BUILD_CHANNEL).toBe('preview');
    expect(eas.build.production.env?.EXPO_PUBLIC_BUILD_CHANNEL).toBe('production');
  });

  it('OTA kapalı (E3): hiçbir profilde `channel` yok', () => {
    for (const profile of Object.values(eas.build)) expect(profile.channel).toBeUndefined();
  });
});

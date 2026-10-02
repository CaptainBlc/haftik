/**
 * S16b (26 R-1): sürüm satırı biçimi ve kaynakları. Kimlik/cihaz bilgisi yok.
 */
import { formatBuildInfo, getBuildInfo, getBuildInfoText } from '@/lib/build-info';
import { setupTestDb } from '../helpers/setup-test-db';

jest.mock('expo-application', () => ({
  __esModule: true,
  nativeBuildVersion: '12',
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '0.1.0', extra: { commit: 'abc1234' } } },
}));

describe('formatBuildInfo', () => {
  it('iki satır: sürüm+build, sonra kanal · commit · şema', () => {
    expect(
      formatBuildInfo({ version: '0.1.0', build: '12', channel: 'preview', commit: 'abc1234', schema: '3' })
    ).toBe('Sürüm 0.1.0 (build 12)\npreview · abc1234 · şema 3');
  });
});

describe('getBuildInfo', () => {
  setupTestDb();
  const original = process.env.EXPO_PUBLIC_BUILD_CHANNEL;
  afterEach(() => {
    if (original === undefined) delete process.env.EXPO_PUBLIC_BUILD_CHANNEL;
    else process.env.EXPO_PUBLIC_BUILD_CHANNEL = original;
  });

  it('sürüm adı, build numarası, commit ve DB şema sürümü kaynaklarından okunur', () => {
    process.env.EXPO_PUBLIC_BUILD_CHANNEL = 'preview';
    const info = getBuildInfo();
    expect(info.version).toBe('0.1.0');
    expect(info.build).toBe('12');
    expect(info.channel).toBe('preview');
    expect(info.commit).toBe('abc1234');
    expect(Number(info.schema)).toBeGreaterThanOrEqual(3); // migration v3 (A10)
  });

  it('kanal tanımsızsa dev', () => {
    delete process.env.EXPO_PUBLIC_BUILD_CHANNEL;
    expect(getBuildInfo().channel).toBe('dev');
  });

  it('metinde kimlik/cihaz izi yok (yalnızca sürüm, build, kanal, commit, şema)', () => {
    const text = getBuildInfoText();
    expect(text).not.toMatch(/deviceId|userId|uuid|email|@|android\s?id|model/i);
    expect(text.split('\n')).toHaveLength(2);
  });
});

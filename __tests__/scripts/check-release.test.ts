/**
 * `scripts/check-release.js` (26 D3): her denetimin saf mantığı, sınır değerleri ve gerçek repoda hızlı modun temiz geçmesi.
 * Bu betik CI'da koşar; yanlış-yeşil (bir denetimin sessizce işlevsiz kalması) en tehlikeli hatadır, bu yüzden her kural
 * hem "geçer" hem "kırılır" yönüyle sınanır.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const cr = require('../../scripts/check-release') as {
  IDENTITY: Record<string, string>;
  PLACEHOLDER_FREE_FROM: string;
  DEV_MARKERS: string[];
  checkVersion: (p: { appVersion: string; changelogText: string; tag?: string }) => R;
  checkIdentity: (a: unknown) => R;
  checkAutoIncrement: (e: unknown) => R;
  checkPlaceholders: (p: { files: { path: string; text: string }[]; version: string; tag?: string }) => R;
  checkTrackedFiles: (f: string[]) => R;
  parseAudit: (t: string, accepted?: Accepted[]) => R;
  checkBundle: (p: { productionText: string; controlText?: string }) => R;
  parseArgs: (argv: string[], env?: Record<string, string>) => { tag?: string; audit: boolean; bundle: boolean };
  runChecks: (o: { tag?: string; audit: boolean; bundle: boolean }) => R[];
  format: (r: R[]) => string;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('node:fs') as { readFileSync: (p: string, e: string) => string };
/* eslint-enable @typescript-eslint/no-require-imports */

type R = { id: string; name: string; status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP'; detail: string };
type Accepted = { id: string; package?: string; approved?: boolean };

const CL = '# Haftik\n\n## [0.1.0] - Yayın öncesi\n### Eklendi\n\n## [0.0.9] - eski\n';

describe('(a) sürüm', () => {
  it('app.json = CHANGELOG üst başlığı: geçer; etiket verilirse v+sürüm olmalı', () => {
    expect(cr.checkVersion({ appVersion: '0.1.0', changelogText: CL }).status).toBe('PASS');
    expect(cr.checkVersion({ appVersion: '0.1.0', changelogText: CL, tag: 'v0.1.0' }).status).toBe('PASS');
  });

  it('kırılır: sürüm uyuşmazlığı, başlık yok, yanlış etiket (v eksik / farklı sürüm), geçersiz biçim', () => {
    expect(cr.checkVersion({ appVersion: '0.2.0', changelogText: CL }).status).toBe('FAIL');
    expect(cr.checkVersion({ appVersion: '0.1.0', changelogText: '# Haftik\nbaşlık yok' }).status).toBe('FAIL');
    expect(cr.checkVersion({ appVersion: '0.1.0', changelogText: CL, tag: '0.1.0' }).status).toBe('FAIL');
    expect(cr.checkVersion({ appVersion: '0.1.0', changelogText: CL, tag: 'v0.1.1' }).status).toBe('FAIL');
    expect(cr.checkVersion({ appVersion: '1.0', changelogText: CL }).status).toBe('FAIL');
  });

  it('yalnız EN ÜSTTEKİ başlık sayılır (eski bir başlık eşleşse bile)', () => {
    expect(cr.checkVersion({ appVersion: '0.0.9', changelogText: CL }).status).toBe('FAIL');
  });
});

describe('(b) kimlik kilidi', () => {
  const good = () => ({
    expo: {
      name: 'Haftik',
      slug: 'haftik',
      scheme: 'haftik',
      android: { package: 'com.batuhan.haftik' },
      ios: { bundleIdentifier: 'com.batuhan.haftik' },
    },
  });

  it('doğru kimlik geçer', () => {
    expect(cr.checkIdentity(good()).status).toBe('PASS');
  });

  it.each([
    ['name', (a: any) => (a.expo.name = 'Baska')],
    ['slug', (a: any) => (a.expo.slug = 'baska')],
    ['scheme', (a: any) => (a.expo.scheme = 'baska')],
    ['androidPackage', (a: any) => (a.expo.android.package = 'com.anonymous.haftik')],
    ['iosBundleIdentifier', (a: any) => (a.expo.ios.bundleIdentifier = 'com.baska.haftik')],
  ])('%s değişirse kırılır ve alan adı bildirilir', (field, mutate) => {
    const a = good();
    mutate(a);
    const r = cr.checkIdentity(a);
    expect(r.status).toBe('FAIL');
    expect(r.detail).toContain(field);
  });

  it('alan hiç yoksa (ios/android bloğu silinmiş) kırılır, çökmez', () => {
    expect(cr.checkIdentity({ expo: { name: 'Haftik', slug: 'haftik', scheme: 'haftik' } }).status).toBe('FAIL');
    expect(cr.checkIdentity({}).status).toBe('FAIL');
  });
});

describe('(c) eas.json autoIncrement', () => {
  it('preview ve production true: geçer; biri eksik/false: kırılır ve profil adı bildirilir', () => {
    expect(cr.checkAutoIncrement({ build: { preview: { autoIncrement: true }, production: { autoIncrement: true } } }).status).toBe('PASS');
    const noPreview = cr.checkAutoIncrement({ build: { preview: {}, production: { autoIncrement: true } } });
    expect(noPreview.status).toBe('FAIL');
    expect(noPreview.detail).toContain('preview');
    expect(cr.checkAutoIncrement({ build: { preview: { autoIncrement: true }, production: { autoIncrement: false } } }).detail).toContain('production');
    expect(cr.checkAutoIncrement({}).status).toBe('FAIL');
    expect(cr.checkAutoIncrement({ build: { preview: { autoIncrement: 'true' }, production: { autoIncrement: true } } }).status).toBe('FAIL'); // string "true" kabul edilmez
  });
});

describe('(d) yer tutucu sözcükler', () => {
  const f = (path: string, text: string) => ({ path, text });

  it('etiket yoksa atlanır (hızlı modda kırmızı üretmez)', () => {
    expect(cr.checkPlaceholders({ files: [f('src/x.ts', 'com.anonymous')], version: '0.2.0' }).status).toBe('SKIP');
  });

  it('SINIR: 0.1.x için UYARI, 0.2.0 ve sonrası KIRMIZI', () => {
    const files = [f('src/config/constants.ts', "'[mağaza bağlantısı]'")];
    expect(cr.checkPlaceholders({ files, version: '0.1.0', tag: 'v0.1.0' }).status).toBe('WARN');
    expect(cr.checkPlaceholders({ files, version: '0.1.9', tag: 'v0.1.9' }).status).toBe('WARN');
    expect(cr.checkPlaceholders({ files, version: cr.PLACEHOLDER_FREE_FROM, tag: 'x' }).status).toBe('FAIL');
    expect(cr.checkPlaceholders({ files, version: '0.9.0', tag: 'x' }).status).toBe('FAIL');
    expect(cr.checkPlaceholders({ files, version: '1.0.0', tag: 'x' }).status).toBe('FAIL');
    expect(cr.checkPlaceholders({ files, version: '0.10.0', tag: 'x' }).status).toBe('FAIL'); // 0.10 > 0.2 (sayısal karşılaştırma)
  });

  it('kapsam: com.anonymous mağaza belgesinde aranmaz (tarihsel), TASLAK ve bağlantı yer tutucusu orada da aranır', () => {
    const store = 'docs/s12-magaza-icerigi.md';
    expect(cr.checkPlaceholders({ files: [f(store, 'com.anonymous.eski')], version: '0.2.0', tag: 'x' }).status).toBe('PASS');
    expect(cr.checkPlaceholders({ files: [f(store, 'TASLAK')], version: '0.2.0', tag: 'x' }).status).toBe('FAIL');
    expect(cr.checkPlaceholders({ files: [f(store, '[mağaza bağlantısı]')], version: '0.2.0', tag: 'x' }).status).toBe('FAIL');
  });

  it('gönderilmeyen belgeler (docs/, CHANGELOG, scripts) taranmaz', () => {
    const files = [f('docs/baska.md', 'TASLAK com.anonymous'), f('CHANGELOG.md', 'TASLAK'), f('scripts/x.js', '[mağaza bağlantısı]')];
    expect(cr.checkPlaceholders({ files, version: '0.2.0', tag: 'x' }).status).toBe('PASS');
  });

  it('gönderilen yerlerde (app.json, eas.json, package.json, src/, site/) her üç sözcük yakalanır', () => {
    for (const p of ['app.json', 'eas.json', 'package.json', 'src/a.ts', 'site/index.html']) {
      for (const w of ['com.anonymous', 'TASLAK', '[mağaza bağlantısı]']) {
        expect(cr.checkPlaceholders({ files: [f(p, `x ${w} y`)], version: '0.2.0', tag: 'x' }).status).toBe('FAIL');
      }
    }
  });
});

describe('(e) izlenen duyarlı dosyalar', () => {
  it.each([
    'android/app/release.keystore',
    'upload.jks',
    'build/app-release.apk',
    'build/app-release.aab',
    'credentials.json',
    'config/credentials.json',
    'secrets/play-service-account.json',
    'android/app/google-services.json',
    'ios/GoogleService-Info.plist',
  ])('%s yakalanır', (file) => {
    expect(cr.checkTrackedFiles(['package.json', file]).status).toBe('FAIL');
  });

  it('benzer ama masum adlar yakalanmaz (yanlış-kırmızı yok)', () => {
    expect(
      cr.checkTrackedFiles([
        'scripts/check-apk-permissions.js',
        'docs/apk-notlari.md',
        'src/lib/aab-notu.ts',
        'docs/credentials-yonetimi.md',
        'package.json',
      ]).status
    ).toBe('PASS');
  });
});

describe('(f) npm audit', () => {
  const advisory = (name: string, ghsa: string, severity: string) => ({
    source: 1,
    name,
    severity,
    title: `${name} sorunu`,
    url: `https://github.com/advisories/${ghsa}`,
    range: '<=1.0.0',
  });
  const audit = (vulns: Record<string, unknown>, high = 1) =>
    JSON.stringify({ vulnerabilities: vulns, metadata: { vulnerabilities: { critical: 0, high, moderate: 2, low: 0 } } });

  it('hiç high/critical yok (yalnız moderate): geçer', () => {
    const t = audit({ x: { name: 'x', via: [advisory('x', 'GHSA-aaaa-bbbb-cccc', 'moderate')] } }, 0);
    expect(cr.parseAudit(t, []).status).toBe('PASS');
  });

  it('kabul listesinde olmayan high: kırmızı; onay bekleyen (approved:false): kırmızı; onaylı: uyarı', () => {
    const t = audit({ forge: { name: 'node-forge', via: [advisory('node-forge', 'GHSA-86w9-cpqp-85rv', 'high')] } });
    expect(cr.parseAudit(t, []).status).toBe('FAIL');
    const pending = cr.parseAudit(t, [{ id: 'GHSA-86w9-cpqp-85rv', approved: false }]);
    expect(pending.status).toBe('FAIL');
    expect(pending.detail).toContain('onayı bekliyor');
    const approved = cr.parseAudit(t, [{ id: 'GHSA-86w9-cpqp-85rv', approved: true }]);
    expect(approved.status).toBe('WARN');
    expect(approved.detail).toContain('kabul edilmiş');
  });

  it('bir advisory birden çok pakette görünse de tek sayılır; bir tanesi kabul dışıysa yine kırmızı', () => {
    const a = advisory('braces', 'GHSA-vfj7-8cjw-p6xm', 'high');
    const b = advisory('forge', 'GHSA-new-new-new', 'critical');
    const t = audit({ p1: { name: 'p1', via: [a] }, p2: { name: 'p2', via: [a, 'p1'] }, p3: { name: 'p3', via: [b] } });
    const r = cr.parseAudit(t, [{ id: 'GHSA-vfj7-8cjw-p6xm', approved: true }]);
    expect(r.status).toBe('FAIL');
    expect(r.detail).toContain('GHSA-new-new-new');
    expect(r.detail).not.toContain('GHSA-vfj7-8cjw-p6xm'); // onaylı olan kırmızı gerekçede geçmez
  });

  it('bozuk JSON ya da metadata yoksa kırmızı (sessiz yeşil yok)', () => {
    expect(cr.parseAudit('npm ERR!', []).status).toBe('FAIL');
    expect(cr.parseAudit('{}', []).status).toBe('FAIL');
  });

  it('gerçek kabul listesi: biçim, benzersiz GHSA kimlikleri, her kayıtta neden ve kanıt, liste yalnız küçülür (<= 2)', () => {
    const data = JSON.parse(fs.readFileSync(`${__dirname}/../../scripts/audit-accepted.json`, 'utf8')) as { accepted: Record<string, unknown>[] };
    expect(data.accepted.length).toBeLessThanOrEqual(2);
    const ids = data.accepted.map((a) => a.id as string);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of data.accepted) {
      expect(String(a.id)).toMatch(/^GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/);
      expect(typeof a.approved).toBe('boolean');
      expect(String(a.package ?? '').length).toBeGreaterThan(2); // paket adı kısa olabilir
      for (const k of ['scope', 'evidence']) expect(String(a[k] ?? '').length).toBeGreaterThan(20); // neden ve kanıt yazılı olmalı
    }
  });
});

describe('(g) paket dizeleri', () => {
  const dev = `x ${'dev-time-menu'} y`;
  it('temiz üretim paketi + pozitif kontrol (dev paketinde bulunur): geçer', () => {
    expect(cr.checkBundle({ productionText: 'her şey temiz', controlText: dev }).status).toBe('PASS');
  });

  it('üretimde herhangi bir dize varsa kırılır ve hangisi olduğu yazılır', () => {
    for (const m of cr.DEV_MARKERS) {
      const r = cr.checkBundle({ productionText: `a ${m} b`, controlText: dev });
      expect(r.status).toBe('FAIL');
      expect(r.detail).toContain(m);
    }
  });

  it('pozitif kontrol başarısızsa (dev paketinde de yok) dedektör kör sayılır: kırmızı, temiz görünse bile', () => {
    const r = cr.checkBundle({ productionText: 'temiz', controlText: 'bu pakette hiçbir işaret yok' });
    expect(r.status).toBe('FAIL');
    expect(r.detail).toContain('kör');
  });
});

describe('CI bağlantısı (.github/workflows/ci.yml)', () => {
  const ci = fs.readFileSync(`${__dirname}/../../.github/workflows/ci.yml`, 'utf8');

  it('her push/PR\'da hızlı mod koşar', () => {
    expect(ci).toMatch(/run: node scripts\/check-release\.js\s*$/m);
  });

  it('etiket (v*) push\'unda tetiklenir ve yalnız o durumda --audit --bundle koşar', () => {
    expect(ci).toMatch(/tags:\s*\['v\*'\]/);
    expect(ci).toMatch(/if: startsWith\(github\.ref, 'refs\/tags\/v'\)\s*\n\s*run: node scripts\/check-release\.js --audit --bundle/);
  });
});

describe('parseArgs ve çıktı', () => {
  it('--tag, --audit, --bundle; etiket GitHub ortamından da alınır, dal ref\'inden alınmaz', () => {
    expect(cr.parseArgs(['n', 's', '--tag', 'v0.1.0', '--audit', '--bundle'])).toEqual({ tag: 'v0.1.0', audit: true, bundle: true });
    expect(cr.parseArgs(['n', 's'])).toEqual({ tag: undefined, audit: false, bundle: false });
    expect(cr.parseArgs(['n', 's'], { GITHUB_REF_TYPE: 'tag', GITHUB_REF_NAME: 'v0.2.0' }).tag).toBe('v0.2.0');
    expect(cr.parseArgs(['n', 's'], { GITHUB_REF_TYPE: 'branch', GITHUB_REF_NAME: 'main' }).tag).toBeUndefined();
  });

  it('çıktı: kırmızı varsa SONUÇ KIRMIZI, yoksa temiz', () => {
    const base: R = { id: 'a', name: 'n', status: 'PASS', detail: '' };
    expect(cr.format([base, { ...base, status: 'WARN' }])).toContain('SONUÇ: temiz');
    expect(cr.format([base, { ...base, status: 'FAIL', detail: 'x' }])).toContain('SONUÇ: KIRMIZI (1');
  });
});

describe('gerçek repo (hızlı mod)', () => {
  it('app.json/CHANGELOG/eas.json/kimlik denetimleri bugünkü repoda yeşil; hiçbir denetim KIRMIZI değil', () => {
    const results = cr.runChecks({ tag: undefined, audit: false, bundle: false });
    const red = results.filter((r) => r.status === 'FAIL' && !r.detail.includes('git ls-files çalışmadı'));
    expect(red).toEqual([]);
    expect(results.find((r) => r.id === 'a')?.status).toBe('PASS');
    expect(results.find((r) => r.id === 'b')?.status).toBe('PASS');
    expect(results.find((r) => r.id === 'c')?.status).toBe('PASS');
    expect(results.find((r) => r.id === 'd')?.status).toBe('SKIP');
  });

  it('etiket koşusu bugünkü repoda (0.1.0) yer tutucuları UYARI olarak verir, kırmızı vermez', () => {
    const results = cr.runChecks({ tag: 'v0.1.0', audit: false, bundle: false });
    expect(results.find((r) => r.id === 'a')?.status).toBe('PASS');
    expect(results.find((r) => r.id === 'd')?.status).toBe('WARN');
  });
});

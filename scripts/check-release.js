#!/usr/bin/env node
/**
 * Sürüm ve kimlik kapısı (26-yayin-plani-v2.md D3). YEREL ve CI için; uygulama koduna (`src/`) girmez.
 * Plan `.mjs` dedi; bu repoda betikler CommonJS (`scripts/*.js`) ve Jest'ten doğrudan `require` edilebiliyor, bu yüzden `.js`.
 *
 *   node scripts/check-release.js                       hızlı denetimler (ağsız, saniyeler): her push/PR'da
 *   node scripts/check-release.js --tag v0.1.0          + etiket = `v`+version, yer tutucu sözcük denetimi (etiket koşusu)
 *   node scripts/check-release.js --audit               + `npm audit --omit=dev` high/critical = 0 (AĞ gerekir)
 *   node scripts/check-release.js --bundle              + `expo export` paketinde dev menü dizeleri 0 (dakikalar; pozitif kontrollü)
 *   (bayraklar birleşebilir; etiket CI'da `GITHUB_REF_TYPE=tag` + `GITHUB_REF_NAME` ile de otomatik alınır)
 *
 * Denetimler (harf = 26 D3):
 *  (a) `app.json` `version` = CHANGELOG üst başlığı; etiket koşusunda etiket = `v`+version
 *  (b) kimlik kilidi: `android.package`, `ios.bundleIdentifier`, `scheme`, `slug`, `name` (Play'de ilk yüklemeden sonra DEĞİŞMEZ)
 *  (c) `eas.json` `preview.autoIncrement` ve `production.autoIncrement` = true
 *  (d) `com.anonymous`, `TASLAK`, `[mağaza bağlantısı]` (yalnız etiket koşusunda): `PLACEHOLDER_FREE_FROM` (0.2.0) ve sonrası KIRMIZI,
 *      0.1.x için UYARI (0.1.0 yalnız Batuhan'ın telefonu; CHANGELOG "Bilinen sınırlar" bunu açıkça yazar)
 *  (e) `git ls-files` içinde keystore/jks/apk/aab/credentials.json/service-account/google-services dosyası yok
 *  (f) `npm audit --omit=dev`: kabul edilmemiş high/critical = 0 (`--audit`; kabul listesi `scripts/audit-accepted.json`)
 *  (g) üretim paketinde dev menü ve fikstür dizeleri yok (`--bundle`; önce `--dev` paketinde bulunabildiği doğrulanır)
 *
 * Çıkış kodu: 0 = kırmızı yok (uyarı olabilir), 1 = en az bir kırmızı.
 */
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');

/** Kimlik kilidi: bunları değiştirmek BİLİNÇLİ bir karardır (Play'de ilk yüklemeden sonra geri alınamaz). */
const IDENTITY = {
  name: 'Haftik',
  slug: 'haftik',
  scheme: 'haftik',
  androidPackage: 'com.batuhan.haftik',
  iosBundleIdentifier: 'com.batuhan.haftik',
};

/** Yer tutucu sözcük kuralı bu sürümden itibaren KIRMIZI (26 §2.2: kesin damga 0.2.0 öncesi). */
const PLACEHOLDER_FREE_FROM = '0.2.0';

const PLACEHOLDER_WORDS = [
  { word: 'com.anonymous', scope: 'shipped' },
  { word: 'TASLAK', scope: 'shippedAndStore' },
  { word: '[mağaza bağlantısı]', scope: 'shippedAndStore' },
];

const SENSITIVE_FILE = /\.(keystore|jks|apk|aab)$|(^|\/)credentials\.json$|service-account|google-services\.json$|GoogleService-Info\.plist$/i;

/** Üretim paketinde ASLA bulunmaması gereken dizeler (S10 kanıtı + fikstür verisi). */
const DEV_MARKERS = ['dev-time-menu', 'dev-time-helpers', 'currentWeekSunday2000', 'Zaman simülasyonu (yalnızca geliştirme)', 'turkce-i-stresi'];

const ok = (id, name, detail = '') => ({ id, name, status: 'PASS', detail });
const fail = (id, name, detail) => ({ id, name, status: 'FAIL', detail });
const warn = (id, name, detail) => ({ id, name, status: 'WARN', detail });
const skip = (id, name, detail) => ({ id, name, status: 'SKIP', detail });

function versionKey(v) {
  return String(v)
    .split('.')
    .reduce((acc, n) => acc * 1000 + Number(n), 0);
}

// ---------------------------------------------------------------- (a)
function checkVersion({ appVersion, changelogText, tag }) {
  const id = 'a';
  const name = 'Sürüm: app.json = CHANGELOG üst başlığı' + (tag ? ' = etiket' : '');
  if (!/^\d+\.\d+\.\d+$/.test(String(appVersion))) return fail(id, name, `app.json sürümü MAJOR.MINOR.PATCH değil: "${appVersion}"`);
  const top = (/^## \[(\d+\.\d+\.\d+)\]/m.exec(changelogText || '') || [])[1];
  if (!top) return fail(id, name, 'CHANGELOG.md içinde "## [x.y.z]" sürüm başlığı yok');
  if (top !== appVersion) return fail(id, name, `CHANGELOG üst başlığı ${top}, app.json ${appVersion}`);
  if (tag && tag !== `v${appVersion}`) return fail(id, name, `etiket "${tag}", beklenen "v${appVersion}"`);
  return ok(id, name, `${appVersion}${tag ? ` (${tag})` : ''}`);
}

// ---------------------------------------------------------------- (b)
function checkIdentity(appJson) {
  const id = 'b';
  const name = 'Kimlik kilidi (paket adı, şema, slug, ad)';
  const expo = (appJson && appJson.expo) || {};
  const actual = {
    name: expo.name,
    slug: expo.slug,
    scheme: expo.scheme,
    androidPackage: expo.android && expo.android.package,
    iosBundleIdentifier: expo.ios && expo.ios.bundleIdentifier,
  };
  const diffs = Object.keys(IDENTITY)
    .filter((k) => actual[k] !== IDENTITY[k])
    .map((k) => `${k}: "${actual[k]}" (beklenen "${IDENTITY[k]}")`);
  return diffs.length ? fail(id, name, diffs.join('; ')) : ok(id, name, IDENTITY.androidPackage);
}

// ---------------------------------------------------------------- (c)
function checkAutoIncrement(eas) {
  const id = 'c';
  const name = 'eas.json: preview ve production autoIncrement';
  const build = (eas && eas.build) || {};
  const bad = ['preview', 'production'].filter((p) => !(build[p] && build[p].autoIncrement === true));
  return bad.length ? fail(id, name, `autoIncrement true değil: ${bad.join(', ')}`) : ok(id, name);
}

// ---------------------------------------------------------------- (d)
/** `files`: [{ path (göreli, / ayraçlı), text }]. `shipped`: config + src + site; store: s12 mağaza belgesi. */
function isShipped(p) {
  return p === 'app.json' || p === 'eas.json' || p === 'package.json' || p.startsWith('src/') || p.startsWith('site/');
}
function isStore(p) {
  return p === 'docs/s12-magaza-icerigi.md';
}

function checkPlaceholders({ files, version, tag }) {
  const id = 'd';
  const name = 'Yer tutucu sözcük yok (com.anonymous, TASLAK, [mağaza bağlantısı])';
  if (!tag) return skip(id, name, 'yalnız etiket koşusunda (--tag)');
  const hits = [];
  for (const { word, scope } of PLACEHOLDER_WORDS) {
    const inScope = (p) => isShipped(p) || (scope === 'shippedAndStore' && isStore(p));
    const where = files.filter((f) => inScope(f.path) && f.text.includes(word)).map((f) => f.path);
    if (where.length) hits.push({ word, where });
  }
  if (hits.length === 0) return ok(id, name);
  const detail = hits.map((h) => `${h.word}: ${h.where.slice(0, 4).join(', ')}${h.where.length > 4 ? ` (+${h.where.length - 4})` : ''}`).join(' | ');
  if (versionKey(version) >= versionKey(PLACEHOLDER_FREE_FROM)) return fail(id, name, `${version} >= ${PLACEHOLDER_FREE_FROM}: ${detail}`);
  return warn(id, name, `${version} < ${PLACEHOLDER_FREE_FROM}, bilinen sınır (CHANGELOG): ${detail}`);
}

// ---------------------------------------------------------------- (e)
function checkTrackedFiles(trackedFiles) {
  const id = 'e';
  const name = 'Repoda anahtar/derleme/kimlik bilgisi dosyası yok (git ls-files)';
  const bad = trackedFiles.filter((f) => SENSITIVE_FILE.test(f));
  return bad.length ? fail(id, name, bad.join(', ')) : ok(id, name, `${trackedFiles.length} izlenen dosya`);
}

// ---------------------------------------------------------------- (f)
/** `npm audit --json` çıktısından high/critical ADVISORY'leri (GHSA kimliğiyle, tekilleştirilmiş) çıkarır. */
function severeAdvisories(data) {
  const byId = new Map();
  for (const vuln of Object.values(data.vulnerabilities || {})) {
    for (const via of vuln.via || []) {
      if (typeof via === 'string' || !via.url) continue;
      if (via.severity !== 'high' && via.severity !== 'critical') continue;
      const id = (/GHSA-[a-z0-9-]+/i.exec(via.url) || [via.url])[0];
      if (!byId.has(id)) byId.set(id, { id, name: via.name, severity: via.severity, title: via.title || '' });
    }
  }
  return Array.from(byId.values());
}

/**
 * `accepted`: `scripts/audit-accepted.json` kayıtları. `approved: true` olanlar UYARI (kabul edilmiş, görünür);
 * `approved: false` (onay bekliyor) ve listede olmayan her high/critical KIRMIZI.
 */
function parseAudit(jsonText, accepted = []) {
  const id = 'f';
  const name = 'npm audit (üretim bağımlılıkları): kabul edilmemiş high/critical yok';
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    return fail(id, name, '`npm audit --json` çıktısı ayrıştırılamadı');
  }
  const v = (data.metadata && data.metadata.vulnerabilities) || null;
  if (!v) return fail(id, name, 'çıktıda metadata.vulnerabilities yok (ağ/kayıt defteri hatası olabilir)');
  const counts = `critical ${v.critical || 0}, high ${v.high || 0}, moderate ${v.moderate || 0}, low ${v.low || 0} paket`;
  const advisories = severeAdvisories(data);
  const acceptedById = new Map(accepted.map((a) => [a.id, a]));
  const approved = advisories.filter((a) => acceptedById.get(a.id) && acceptedById.get(a.id).approved === true);
  const pending = advisories.filter((a) => acceptedById.get(a.id) && acceptedById.get(a.id).approved !== true);
  const unknown = advisories.filter((a) => !acceptedById.get(a.id));
  const label = (a) => `${a.id} (${a.name})`;
  if (unknown.length || pending.length) {
    const parts = [];
    if (unknown.length) parts.push(`kabul listesinde YOK: ${unknown.map(label).join(', ')}`);
    if (pending.length) parts.push(`Batuhan onayı bekliyor: ${pending.map(label).join(', ')}`);
    return fail(id, name, `${parts.join(' | ')} [${counts}]`);
  }
  if (approved.length) return warn(id, name, `kabul edilmiş: ${approved.map(label).join(', ')} [${counts}]`);
  return ok(id, name, counts);
}

// ---------------------------------------------------------------- (g)
function checkBundle({ productionText, controlText }) {
  const id = 'g';
  const name = 'Üretim paketinde dev menü/fikstür dizeleri yok';
  const found = (text) => DEV_MARKERS.filter((m) => text.includes(m));
  if (controlText !== undefined) {
    const control = found(controlText);
    if (control.length === 0) return fail(id, name, 'pozitif kontrol başarısız: --dev paketinde dev dizeleri bulunamadı (dedektör kör)');
  }
  const hits = found(productionText);
  return hits.length ? fail(id, name, `üretim paketinde bulundu: ${hits.join(', ')}`) : ok(id, name, `${DEV_MARKERS.length} dize yok`);
}

// ---------------------------------------------------------------- toplayıcılar (gerçek dosya sistemi)
function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walk(full, out);
    } else if (/\.(ts|tsx|js|jsx|json|md|html|css|txt)$/i.test(e.name)) {
      out.push(full);
    }
  }
  return out;
}

function collectFiles() {
  const rels = ['app.json', 'eas.json', 'package.json', 'docs/s12-magaza-icerigi.md'];
  const all = rels.filter((r) => fs.existsSync(path.join(ROOT, r))).map((r) => path.join(ROOT, r));
  for (const d of ['src', 'site']) if (fs.existsSync(path.join(ROOT, d))) walk(path.join(ROOT, d), all);
  return all.map((f) => ({ path: path.relative(ROOT, f).split(path.sep).join('/'), text: fs.readFileSync(f, 'utf8') }));
}

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  });
}

function loadAccepted() {
  try {
    return readJson('scripts/audit-accepted.json').accepted || [];
  } catch {
    return [];
  }
}

function gitTrackedFiles() {
  return run('git', ['ls-files'], { shell: false }).split(/\r?\n/).filter(Boolean);
}

function runAudit() {
  try {
    return run('npm', ['audit', '--omit=dev', '--json']);
  } catch (e) {
    // `npm audit` açık bulgu varken sıfır olmayan kodla çıkar ama JSON'u stdout'a yazar.
    if (e && typeof e.stdout === 'string' && e.stdout.trim().startsWith('{')) return e.stdout;
    throw e;
  }
}

function exportBundleText(dev) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'haftik-export-'));
  try {
    const args = ['expo', 'export', '--platform', 'android', '--no-bytecode', '--output-dir', out];
    if (dev) args.push('--dev');
    run('npx', args, { env: { ...process.env, CI: '1' } });
    const jsDir = path.join(out, '_expo', 'static', 'js', 'android');
    return fs
      .readdirSync(jsDir)
      .filter((f) => f.endsWith('.js'))
      .map((f) => fs.readFileSync(path.join(jsDir, f), 'utf8'))
      .join('\n');
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
}

function parseArgs(argv, env = {}) {
  const args = argv.slice(2);
  const flag = (n) => args.includes(n);
  const val = (n) => {
    const i = args.indexOf(n);
    return i >= 0 ? args[i + 1] : undefined;
  };
  let tag = val('--tag');
  if (!tag && env.GITHUB_REF_TYPE === 'tag' && env.GITHUB_REF_NAME) tag = env.GITHUB_REF_NAME;
  return { tag, audit: flag('--audit'), bundle: flag('--bundle') };
}

function runChecks(opts) {
  const { tag, audit, bundle } = opts;
  const appJson = readJson('app.json');
  const eas = readJson('eas.json');
  const changelogText = fs.existsSync(path.join(ROOT, 'CHANGELOG.md')) ? fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8') : '';
  const results = [];
  results.push(checkVersion({ appVersion: appJson.expo.version, changelogText, tag }));
  results.push(checkIdentity(appJson));
  results.push(checkAutoIncrement(eas));
  results.push(checkPlaceholders({ files: collectFiles(), version: appJson.expo.version, tag }));
  try {
    results.push(checkTrackedFiles(gitTrackedFiles()));
  } catch (e) {
    results.push(fail('e', 'Repoda anahtar/derleme/kimlik bilgisi dosyası yok (git ls-files)', `git ls-files çalışmadı: ${e.message.split('\n')[0]}`));
  }
  if (audit) {
    try {
      results.push(parseAudit(runAudit(), loadAccepted()));
    } catch (e) {
      results.push(fail('f', 'npm audit (üretim bağımlılıkları): high/critical = 0', `npm audit çalışmadı: ${String(e.message).split('\n')[0]}`));
    }
  } else {
    results.push(skip('f', 'npm audit (üretim bağımlılıkları)', '--audit ile (ağ gerekir)'));
  }
  if (bundle) {
    try {
      const controlText = exportBundleText(true);
      const productionText = exportBundleText(false);
      results.push(checkBundle({ productionText, controlText }));
    } catch (e) {
      results.push(fail('g', 'Üretim paketinde dev menü/fikstür dizeleri yok', `expo export çalışmadı: ${String(e.message).split('\n')[0]}`));
    }
  } else {
    results.push(skip('g', 'Üretim paketinde dev menü/fikstür dizeleri', '--bundle ile (dakikalar sürer)'));
  }
  return results;
}

function format(results) {
  const icon = { PASS: 'GEÇTİ', FAIL: 'KIRMIZI', WARN: 'UYARI', SKIP: 'ATLANDI' };
  const lines = results.map((r) => `[${icon[r.status]}] (${r.id}) ${r.name}${r.detail ? `: ${r.detail}` : ''}`);
  const failed = results.filter((r) => r.status === 'FAIL').length;
  lines.push('', failed ? `SONUÇ: KIRMIZI (${failed} denetim başarısız)` : 'SONUÇ: temiz (kırmızı yok)');
  return lines.join('\n');
}

function main(argv, env) {
  const results = runChecks(parseArgs(argv, env));
  process.stdout.write(format(results) + '\n');
  return results.some((r) => r.status === 'FAIL') ? 1 : 0;
}

module.exports = {
  IDENTITY,
  PLACEHOLDER_FREE_FROM,
  DEV_MARKERS,
  checkVersion,
  checkIdentity,
  checkAutoIncrement,
  checkPlaceholders,
  checkTrackedFiles,
  parseAudit,
  severeAdvisories,
  checkBundle,
  parseArgs,
  format,
  runChecks,
};

if (require.main === module) {
  process.exit(main(process.argv, process.env));
}

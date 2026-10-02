/**
 * S16b (26 R-1, sürüm bilgisi): `app.json` temel yapılandırmadır; bu dosya yalnızca
 * YAPI ZAMANINDA kısa commit özetini `extra.commit` olarak gömer (Ayarlar'daki
 * sürüm satırı okur, `src/lib/build-info.ts`). Başka hiçbir şey değiştirmez.
 *
 * Kaynak sırası: EAS build (`EAS_BUILD_GIT_COMMIT_HASH`), sonra yerel `git rev-parse`;
 * ikisi de yoksa `null` ("-" gösterilir). Yapı zamanında çalışır, ağ isteği yok,
 * çalışma zamanı koduna girmez (yalnızca düz bir dize gömülür).
 */
const { execFileSync } = require('node:child_process');

function shortCommit() {
  const fromEas = process.env.EAS_BUILD_GIT_COMMIT_HASH;
  if (fromEas) {
    return fromEas.slice(0, 7);
  }
  try {
    return execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

module.exports = ({ config }) => ({
  ...config,
  extra: { ...(config.extra ?? {}), commit: shortCommit() },
});

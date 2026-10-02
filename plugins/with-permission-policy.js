/**
 * A16 (S17): (1) tüm varyantlarda gereksiz izinleri `blockedPermissions`e
 * ekler, (2) `INTERNET`i YALNIZCA release varyantından kaldırır
 * (`android/app/src/release/AndroidManifest.xml`, `tools:node="remove"`),
 * böylece "üretimde ağ yok" sözü "ölçtük"ten "işletim sistemi soket açtırmaz"a
 * çıkar; debug/Metro etkilenmez. Seçenek C (22 §1.3): EAS, yerel
 * `assembleRelease`, profil fark etmeksizin mekanik.
 */
const fs = require('node:fs');
const path = require('node:path');
const { withDangerousMod } = require('expo/config-plugins');

const { ALWAYS_BLOCKED_PERMISSIONS, RELEASE_ONLY_REMOVED_PERMISSIONS } = require('./permission-policy');

function releaseManifestXml() {
  const lines = RELEASE_ONLY_REMOVED_PERMISSIONS.map(
    (name) => `  <uses-permission android:name="${name}" tools:node="remove" />`
  );
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<manifest xmlns:android="http://schemas.android.com/apk/res/android"',
    '    xmlns:tools="http://schemas.android.com/tools">',
    ...lines,
    '</manifest>',
    '',
  ].join('\n');
}

function withPermissionPolicy(config) {
  config.android = config.android ?? {};
  config.android.blockedPermissions = Array.from(
    new Set([...(config.android.blockedPermissions ?? []), ...ALWAYS_BLOCKED_PERMISSIONS])
  );

  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const dir = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'release');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'AndroidManifest.xml'), releaseManifestXml());
      return cfg;
    },
  ]);
}

module.exports = withPermissionPolicy;
module.exports.releaseManifestXml = releaseManifestXml;

/**
 * A17 (S17): `allowBackup:false` yalnızca BULUT yedeğini kapatır; cihazdan
 * cihaza aktarım (D2D) hâlâ açıktı. `dataExtractionRules` ile hem
 * `<cloud-backup>` hem `<device-transfer>` altında tüm alanlar hariç tutulur.
 * Onboarding/site metnindeki "telefon değişirse veri taşınmaz" sözü böylece
 * doğru olur. 0.2.0'dan ÖNCE (geri dönüşü zor yapılandırma kararı).
 */
const fs = require('node:fs');
const path = require('node:path');
const { AndroidConfig, withAndroidManifest, withDangerousMod } = require('expo/config-plugins');

const DOMAINS = [
  'root',
  'file',
  'database',
  'sharedpref',
  'external',
  'device_root',
  'device_file',
  'device_database',
  'device_sharedpref',
];

function dataExtractionRulesXml() {
  const excludes = DOMAINS.map((d) => `    <exclude domain="${d}" path="." />`).join('\n');
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<data-extraction-rules>',
    '  <cloud-backup>',
    excludes,
    '  </cloud-backup>',
    '  <device-transfer>',
    excludes,
    '  </device-transfer>',
    '</data-extraction-rules>',
    '',
  ].join('\n');
}

function withDataExtractionRules(config) {
  config = withAndroidManifest(config, (cfg) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    app.$['android:dataExtractionRules'] = '@xml/data_extraction_rules';
    return cfg;
  });
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const dir = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'data_extraction_rules.xml'), dataExtractionRulesXml());
      return cfg;
    },
  ]);
}

module.exports = withDataExtractionRules;
module.exports.dataExtractionRulesXml = dataExtractionRulesXml;
module.exports.DOMAINS = DOMAINS;

#!/usr/bin/env node
/**
 * Release APK'nın izinlerini "altın liste" ile mekanik karşılaştırır (A16, S17).
 *
 *   node scripts/check-apk-permissions.js <apk> [aapt2-yolu]
 *   node scripts/check-apk-permissions.js --file <aapt2-cikti.txt> [applicationId]
 *
 * Çıkış kodu 0 = eşleşti, 1 = fark var. İzin sayımı elle yapılmaz.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const { diffAgainstGolden, parseAaptPermissions } = require('../plugins/permission-policy');

const DEFAULT_APPLICATION_ID = 'com.batuhan.haftik';

function main(argv) {
  let text;
  let applicationId = DEFAULT_APPLICATION_ID;
  if (argv[0] === '--file') {
    text = fs.readFileSync(argv[1], 'utf8');
    applicationId = argv[2] ?? applicationId;
  } else if (argv[0]) {
    const aapt2 = argv[1] ?? 'aapt2';
    text = execFileSync(aapt2, ['dump', 'permissions', argv[0]], { encoding: 'utf8' });
  } else {
    console.error('Kullanım: check-apk-permissions.js <apk> [aapt2] | --file <cikti.txt> [applicationId]');
    return 2;
  }
  const result = diffAgainstGolden(parseAaptPermissions(text), applicationId);
  if (result.ok) {
    console.log('OK: izinler altın listeyle birebir aynı.');
    return 0;
  }
  if (result.missing.length) console.error('EKSİK:\n  ' + result.missing.join('\n  '));
  if (result.unexpected.length) console.error('BEKLENMEYEN:\n  ' + result.unexpected.join('\n  '));
  return 1;
}

process.exitCode = main(process.argv.slice(2));

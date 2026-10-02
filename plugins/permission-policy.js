/**
 * Android izin politikasının TEK kaynağı (A16, S17; `docs/inceleme-2026-09-25/
 * 22-platform-v2.md` §1). Hem config plugin'i (`with-permission-policy.js`)
 * hem de test/kontrol betiği (`scripts/check-apk-permissions.js`) buradan okur;
 * liste elle sayılmaz, release APK'nın `aapt2 dump permissions` çıktısıyla
 * mekanik karşılaştırılır (Ç4: rozet izni sayısı 16, ölçüldü).
 */

/** Tüm varyantlarda kaldırılan izinler (Metro/dev client'ı etkilemez). */
const ALWAYS_BLOCKED_PERMISSIONS = [
  // S10: yalnızca cache + FileProvider kullanılıyor, harici depolama/overlay yok.
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.SYSTEM_ALERT_WINDOW',
  // A16: ağ durumu okunmuyor (K4-rel ile doğrulanacak: SecurityException yok).
  'android.permission.ACCESS_NETWORK_STATE',
  // A16: push kullanılmıyor.
  'com.google.android.c2dm.permission.RECEIVE',
  // A16: install referrer okunmuyor (`getInstallReferrerAsync` çağrılmıyor).
  'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE',
  // A16: `me.leolin:ShortcutBadger` (expo-notifications) 16 rozet izni; uygulama rozet koymuyor.
  'com.sec.android.provider.badge.permission.READ',
  'com.sec.android.provider.badge.permission.WRITE',
  'com.htc.launcher.permission.READ_SETTINGS',
  'com.htc.launcher.permission.UPDATE_SHORTCUT',
  'com.sonyericsson.home.permission.BROADCAST_BADGE',
  'com.sonymobile.home.permission.PROVIDER_INSERT_BADGE',
  'com.anddoes.launcher.permission.UPDATE_COUNT',
  'com.majeur.launcher.permission.UPDATE_BADGE',
  'com.huawei.android.launcher.permission.CHANGE_BADGE',
  'com.huawei.android.launcher.permission.READ_SETTINGS',
  'com.huawei.android.launcher.permission.WRITE_SETTINGS',
  'android.permission.READ_APP_BADGE',
  'com.oppo.launcher.permission.READ_SETTINGS',
  'com.oppo.launcher.permission.WRITE_SETTINGS',
  'me.everything.badger.permission.BADGE_COUNT_READ',
  'me.everything.badger.permission.BADGE_COUNT_WRITE',
];

/**
 * YALNIZCA release varyantından kaldırılır (debug/Metro soketi `INTERNET`
 * ister). Ç6 sırası: önce emülatörde referans ölçüm, sonra bu kaldırma.
 */
const RELEASE_ONLY_REMOVED_PERMISSIONS = ['android.permission.INTERNET'];

/**
 * Release APK'da beklenen TAM izin listesi ("altın liste"). `WAKE_LOCK` ilk
 * build'de bilerek kalır (22 §1.6; kaldırma Doze/teslim testlerinden sonra).
 * `{applicationId}` yer tutucusu paket adıyla değiştirilir.
 */
const GOLDEN_RELEASE_PERMISSIONS = [
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.RECEIVE_BOOT_COMPLETED',
  'android.permission.VIBRATE',
  'android.permission.WAKE_LOCK',
  '{applicationId}.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION',
];

module.exports = {
  ALWAYS_BLOCKED_PERMISSIONS,
  RELEASE_ONLY_REMOVED_PERMISSIONS,
  GOLDEN_RELEASE_PERMISSIONS,
};

/** aapt2 `dump permissions` çıktısından izin adlarını çıkarır (uses-permission: name='...'). */
function parseAaptPermissions(text) {
  const names = [];
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*uses-permission(?:-sdk-\d+)?:\s*name='([^']+)'/.exec(line);
    if (m) names.push(m[1]);
  }
  return names;
}

/**
 * Release APK izinlerini altın listeyle karşılaştırır.
 * @returns {{ ok: boolean, missing: string[], unexpected: string[] }}
 */
function diffAgainstGolden(actualNames, applicationId) {
  const golden = GOLDEN_RELEASE_PERMISSIONS.map((p) => p.replace('{applicationId}', applicationId));
  const actual = new Set(actualNames);
  const missing = golden.filter((p) => !actual.has(p));
  const unexpected = [...actual].filter((p) => !golden.includes(p)).sort();
  return { ok: missing.length === 0 && unexpected.length === 0, missing, unexpected };
}

module.exports.parseAaptPermissions = parseAaptPermissions;
module.exports.diffAgainstGolden = diffAgainstGolden;

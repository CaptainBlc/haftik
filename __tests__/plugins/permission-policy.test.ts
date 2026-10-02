/**
 * A16/A17 (S17): izin politikası ve yedek/aktarım kuralları config plugin'leri.
 * Gerçek `expo prebuild` çıktısı elle doğrulandı (CLAUDE.md "S17" notu); burada
 * politika verisi ve üretilen XML sözleşmesi mekanik olarak korunur.
 */
const policy = jest.requireActual('../../plugins/permission-policy');
const withPermissionPolicy = jest.requireActual('../../plugins/with-permission-policy');
const withDataExtractionRules = jest.requireActual('../../plugins/with-data-extraction-rules');

const APP_ID = 'com.batuhan.haftik';

describe('izin politikası (A16)', () => {
  it('16 rozet izni + c2dm + referrer + ACCESS_NETWORK_STATE engellenir (Ç4: 16 ölçüldü)', () => {
    const blocked: string[] = policy.ALWAYS_BLOCKED_PERMISSIONS;
    const badge = blocked.filter(
      (p) =>
        /badge|launcher\.permission|home\.permission|READ_APP_BADGE/i.test(p) &&
        !p.startsWith('android.permission.SYSTEM_ALERT')
    );
    expect(badge).toHaveLength(16);
    expect(blocked).toContain('com.google.android.c2dm.permission.RECEIVE');
    expect(blocked).toContain(
      'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE'
    );
    expect(blocked).toContain('android.permission.ACCESS_NETWORK_STATE');
    expect(new Set(blocked).size).toBe(blocked.length);
  });

  it('INTERNET tüm varyantlardan DEĞİL yalnızca releaseten kaldırılır (Metro/debug kırılmasın)', () => {
    expect(policy.ALWAYS_BLOCKED_PERMISSIONS).not.toContain('android.permission.INTERNET');
    expect(policy.RELEASE_ONLY_REMOVED_PERMISSIONS).toEqual(['android.permission.INTERNET']);
    const xml: string = withPermissionPolicy.releaseManifestXml();
    expect(xml).toContain(
      '<uses-permission android:name="android.permission.INTERNET" tools:node="remove" />'
    );
    expect(xml).toContain('xmlns:tools="http://schemas.android.com/tools"');
  });

  it('WAKE_LOCK ilk buildde kalır (22 §1.6): ne engelli ne altın listeden çıkarılmış', () => {
    expect(policy.ALWAYS_BLOCKED_PERMISSIONS).not.toContain('android.permission.WAKE_LOCK');
    expect(policy.GOLDEN_RELEASE_PERMISSIONS).toContain('android.permission.WAKE_LOCK');
  });

  it('uygulamanın gerçekten kullandığı izinler altın listede ve engelli değil', () => {
    for (const needed of [
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.RECEIVE_BOOT_COMPLETED',
    ]) {
      expect(policy.GOLDEN_RELEASE_PERMISSIONS).toContain(needed);
      expect(policy.ALWAYS_BLOCKED_PERMISSIONS).not.toContain(needed);
    }
  });

  it('altın liste ile engel listesi çakışmaz, altın listede INTERNET yok', () => {
    for (const p of policy.GOLDEN_RELEASE_PERMISSIONS) {
      expect(policy.ALWAYS_BLOCKED_PERMISSIONS).not.toContain(p);
    }
    expect(policy.GOLDEN_RELEASE_PERMISSIONS).not.toContain('android.permission.INTERNET');
  });

  it('plugin mevcut blockedPermissions değerlerini korur, tekrarsız birleştirir', () => {
    const config = withPermissionPolicy({
      android: { blockedPermissions: ['android.permission.SYSTEM_ALERT_WINDOW', 'x.custom'] },
    });
    const list: string[] = config.android.blockedPermissions;
    expect(list).toContain('x.custom');
    expect(list.filter((p) => p === 'android.permission.SYSTEM_ALERT_WINDOW')).toHaveLength(1);
    expect(list).toContain('com.sec.android.provider.badge.permission.READ');
  });
});

describe('altın liste karşılaştırması (aapt2 çıktısı)', () => {
  const ok = [
    'package: com.batuhan.haftik',
    "uses-permission: name='android.permission.POST_NOTIFICATIONS'",
    "uses-permission: name='android.permission.RECEIVE_BOOT_COMPLETED'",
    "uses-permission: name='android.permission.VIBRATE'",
    "uses-permission: name='android.permission.WAKE_LOCK'",
    `uses-permission: name='${APP_ID}.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'`,
  ].join('\n');

  it('birebir eşleşince ok', () => {
    const result = policy.diffAgainstGolden(policy.parseAaptPermissions(ok), APP_ID);
    expect(result).toEqual({ ok: true, missing: [], unexpected: [] });
  });

  it('INTERNET geri gelirse yakalanır', () => {
    const bad = ok + "\nuses-permission: name='android.permission.INTERNET'";
    const result = policy.diffAgainstGolden(policy.parseAaptPermissions(bad), APP_ID);
    expect(result.ok).toBe(false);
    expect(result.unexpected).toEqual(['android.permission.INTERNET']);
  });

  it('eksik izin yakalanır', () => {
    const bad = ok.replace("uses-permission: name='android.permission.VIBRATE'\n", '');
    const result = policy.diffAgainstGolden(policy.parseAaptPermissions(bad), APP_ID);
    expect(result.missing).toEqual(['android.permission.VIBRATE']);
  });
});

describe('cihazdan cihaza aktarım kapatma (A17)', () => {
  const xml: string = withDataExtractionRules.dataExtractionRulesXml();

  it('hem cloud-backup hem device-transfer altında TÜM alanlar hariç tutulur', () => {
    const cloud = /<cloud-backup>([\s\S]*?)<\/cloud-backup>/.exec(xml)![1];
    const device = /<device-transfer>([\s\S]*?)<\/device-transfer>/.exec(xml)![1];
    for (const domain of withDataExtractionRules.DOMAINS) {
      expect(cloud).toContain(`<exclude domain="${domain}" path="." />`);
      expect(device).toContain(`<exclude domain="${domain}" path="." />`);
    }
  });

  it('hiç include yok (hiçbir veri taşınmaz)', () => {
    expect(xml).not.toContain('<include');
  });

  it('veritabanı ve ayar dosyalarını kapsayan alanlar listede', () => {
    for (const d of ['file', 'database', 'sharedpref', 'root']) {
      expect(withDataExtractionRules.DOMAINS).toContain(d);
    }
  });
});

/**
 * X-06: uzak push / token API'leri src/ içinde geçmez (yalnızca YEREL planlama).
 * Ayrıca `node:sqlite` src/ içine sızmamalı (CLAUDE.md S5 tuzağı).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

function collect(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('yalnızca yerel bildirim', () => {
  const files = collect(path.join(__dirname, '..', '..', 'src'));
  const banned = [
    'getExpoPushTokenAsync',
    'getDevicePushTokenAsync',
    'addPushTokenListener',
    'registerForPushNotificationsAsync',
  ];

  it('yasak push API adları src/ içinde yok', () => {
    expect(files.length).toBeGreaterThan(10);
    for (const f of files) {
      const text = fs.readFileSync(f, 'utf8');
      for (const name of banned) {
        expect({ file: f, name, found: text.includes(name) }).toEqual({
          file: f,
          name,
          found: false,
        });
      }
    }
  });

  it('domain/ ve data/ expo-notifications import etmez; notify-plan saf', () => {
    for (const f of files.filter((p) => /[\\/](domain|data)[\\/]/.test(p))) {
      expect(fs.readFileSync(f, 'utf8')).not.toMatch(/from 'expo-notifications'|require\('expo-notifications'\)/);
    }
  });
});

/**
 * Savunma amaçlı doğrulama: geçersiz/ileri tarihli `weekStart` (deep link)
 * `saveCard`a hiç ulaşmaz, hiçbir kalıcı kart yazılmaz.
 */
import { getCard } from '@/data/card-repo';
import { getDriver } from '@/data/db';
import { openOrBuildCard } from '@/card/open-card';

import { setupTestDb } from '../helpers/setup-test-db';

describe('openOrBuildCard geçersiz weekStart', () => {
  setupTestDb();

  const bad = ['abc', '2026-02-31', '2026-09-15' /* Salı */, '2026-09-28' /* gelecek hafta */];

  it.each(bad)('%s reddedilir ve kart yazılmaz', async (weekStart) => {
    await expect(openOrBuildCard(weekStart, '2026-09-25')).rejects.toThrow('invalid weekStart');
    const rows = getDriver().all('SELECT * FROM weekly_card;') as unknown[];
    expect(rows).toHaveLength(0);
    expect(await getCard(weekStart)).toBeNull();
  });
});

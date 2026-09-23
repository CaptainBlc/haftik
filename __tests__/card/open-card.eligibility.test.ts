/**
 * I-1 (S9 SEC): deep link ile uygunluk atlanamaz. Kayıtlı kart yoksa ve hafta
 * uygun değilse (dolu gün < eşik ve/veya Pazar 20:00 öncesi) kart üretilmez,
 * saveCard/`metric_event` yazılmaz; kayıtlı kart yeniden açılabilir.
 */
import { getCard } from '@/data/card-repo';
import { saveCheckin } from '@/data/checkin-repo';
import { getDriver } from '@/data/db';
import { openOrBuildCard } from '@/card/open-card';

import { setupTestDb } from '../helpers/setup-test-db';

async function fill(dates: string[]) {
  for (const d of dates) {
    // eslint-disable-next-line no-await-in-loop
    await saveCheckin({ localDate: d, movement: 2, sleep: 2, spending: 2, social: 2 });
  }
}
const WEEK = '2026-09-14'; // Pzt; Pazar 2026-09-20
const FIVE = ['2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18'];

function rows(table: string) {
  return getDriver().all(`SELECT * FROM ${table};`) as unknown[];
}

describe('openOrBuildCard uygunluk (deep link)', () => {
  setupTestDb();

  it('dolu gün eşiğin altındaysa (2 < 3) notReady; kart ve olay yazılmaz', async () => {
    await fill(FIVE.slice(0, 2));
    const r = await openOrBuildCard(WEEK, '2026-09-22', new Date(2026, 8, 22, 12));
    expect(r).toEqual({ status: 'notReady' });
    expect(rows('weekly_card')).toHaveLength(0);
    expect(rows('metric_event')).toHaveLength(0);
    expect(await getCard(WEEK)).toBeNull();
  });

  it('Pazar 20:00 öncesi (eşik tamam) notReady', async () => {
    await fill(FIVE);
    const r = await openOrBuildCard(WEEK, '2026-09-20', new Date(2026, 8, 20, 19, 59));
    expect(r).toEqual({ status: 'notReady' });
    expect(rows('weekly_card')).toHaveLength(0);
  });

  it('Pazar 20:00 sonrası ve eşik tamam: normal üretim', async () => {
    await fill([...FIVE, '2026-09-20']); // bugünün (Pazar) check-in'i var: K3 devreye girmez
    const r = await openOrBuildCard(WEEK, '2026-09-20', new Date(2026, 8, 20, 20, 0));
    expect(r.status).toBe('ready');
    expect(rows('weekly_card')).toHaveLength(1);
  });

  it('kayıtlı kart uygunluk kontrolüne takılmadan yeniden açılır', async () => {
    await fill(FIVE);
    const first = await openOrBuildCard(WEEK, '2026-09-22', new Date(2026, 8, 22, 12));
    expect(first.status).toBe('ready');
    // Erken saat ve eksik veriyle bile (now=Salı sabahı değil, hafta içi) kayıtlı kart döner.
    const again = await openOrBuildCard(WEEK, '2026-09-16', new Date(2026, 8, 16, 8));
    expect(again).toEqual(first);
  });
});

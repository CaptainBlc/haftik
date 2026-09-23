/** S8 QA B-1: bildirim iptal kancası hata verse bile tablolar silinir. */
import { getDriver } from '@/data/db';
import { saveCheckin } from '@/data/checkin-repo';
import { setReminderEnabled } from '@/data/setting-repo';
import { deleteAllData } from '@/data/delete-all';
import { setupTestDb } from '../helpers/setup-test-db';

function count(table: string): number {
  return getDriver().get<{ c: number }>(`SELECT COUNT(*) as c FROM ${table}`)?.c ?? 0;
}

describe('delete-all: iptal kancası hatası', () => {
  setupTestDb();

  beforeEach(async () => {
    await saveCheckin({ localDate: '2026-09-21', movement: 1, sleep: 1, spending: 1, social: 1 });
    await setReminderEnabled(false);
  });

  it('kanca senkron fırlatırsa tablolar yine silinir', async () => {
    await expect(
      deleteAllData(() => {
        throw new Error('sync fail');
      })
    ).resolves.toBeUndefined();
    expect(count('checkin')).toBe(0);
    expect(count('setting')).toBe(0);
  });

  it('kanca async reddederse tablolar yine silinir', async () => {
    await expect(deleteAllData(() => Promise.reject(new Error('async fail')))).resolves.toBeUndefined();
    expect(count('checkin')).toBe(0);
    expect(count('weekly_card')).toBe(0);
    expect(count('metric_event')).toBe(0);
  });
});

import { deleteAllData } from '@/data/delete-all';
import { saveCheckin } from '@/data/checkin-repo';
import { saveCard } from '@/data/card-repo';
import { setReminderEnabled, getReminderEnabled } from '@/data/setting-repo';
import { recordEvent } from '@/data/metric-repo';
import { incrementCounter } from '@/data/metric-counter-repo';
import { getDriver } from '@/data/db';
import { setupTestDb } from '../helpers/setup-test-db';

function countRows(table: string): number {
  const driver = getDriver();
  const row = driver.get<{ c: number }>(`SELECT COUNT(*) as c FROM ${table}`);
  return row?.c ?? 0;
}

describe('delete-all', () => {
  setupTestDb();

  it('dolu bes tabloyu da bosaltir (A10: metric_counter de dahil)', async () => {
    await saveCheckin({ localDate: '2026-09-21', movement: 1, sleep: 1, spending: 1, social: 1 });
    await saveCard({
      weekStart: '2026-09-21',
      checkinDays: 4,
      title: { id: 't', text: 't', basedOnCategories: [] },
      lines: {
        movement: { id: 'm', text: 'm' },
        sleep: { id: 's', text: 's' },
        spending: { id: 'sp', text: 'sp' },
        social: { id: 'so', text: 'so' },
      },
      deltas: { movement: null, sleep: null, spending: null, social: null },
      summary: { id: 'su', text: 'su' },
      contentVersion: 1,
    });
    await setReminderEnabled(false);
    await recordEvent('card_opened', '2026-09-21');
    await incrementCounter({ name: 'test_event', weekStart: '2026-09-21' });

    expect(countRows('checkin')).toBe(1);
    expect(countRows('weekly_card')).toBe(1);
    expect(countRows('setting')).toBe(1);
    expect(countRows('metric_event')).toBe(1);
    expect(countRows('metric_counter')).toBe(1);

    const cancel = jest.fn();
    await deleteAllData(cancel);

    expect(countRows('checkin')).toBe(0);
    expect(countRows('weekly_card')).toBe(0);
    expect(countRows('setting')).toBe(0);
    expect(countRows('metric_event')).toBe(0);
    expect(countRows('metric_counter')).toBe(0);
  });

  it('callback tam 1 kez cagrilir', async () => {
    const cancel = jest.fn();
    await deleteAllData(cancel);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('tum tablolar zaten bosken de calisir ve callback yine cagrilir', async () => {
    const cancel = jest.fn();
    await expect(deleteAllData(cancel)).resolves.toBeUndefined();
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(countRows('checkin')).toBe(0);
  });

  it('senkron (Promise dondurmeyen) bir callback ile de calisir', async () => {
    let called = false;
    const cancel = (): void => {
      called = true;
    };
    await deleteAllData(cancel);
    expect(called).toBe(true);
  });

  it('async (Promise donduren) bir callback ile de calisir ve beklenir', async () => {
    const order: string[] = [];
    const cancel = async (): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      order.push('cancel-done');
    };
    await saveCheckin({ localDate: '2026-09-21', movement: 1, sleep: 1, spending: 1, social: 1 });
    await deleteAllData(cancel);
    order.push('delete-all-returned');

    expect(order).toEqual(['cancel-done', 'delete-all-returned']);
    expect(countRows('checkin')).toBe(0);
  });

  it("silme sonrasi getSetting varsayilanlara doner (setting tablosu tamamen bosaltildigi icin)", async () => {
    await setReminderEnabled(false);
    await deleteAllData(() => {});

    expect(await getReminderEnabled()).toBe(true);
  });
});

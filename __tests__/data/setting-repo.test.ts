import {
  getAllSettings,
  getReminderEnabled,
  setReminderEnabled,
  getReminderTime,
  setReminderTime,
  getOnboardingDone,
  setOnboardingDone,
  getFirstOpenDate,
  setFirstOpenDate,
  getNotificationIds,
  setNotificationIds,
  DEFAULT_SETTINGS,
} from '@/data/setting-repo';
import { setupTestDb } from '../helpers/setup-test-db';

describe('setting-repo', () => {
  setupTestDb();

  it('hicbir ayar yazilmadan varsayilanlari doner', async () => {
    expect(await getAllSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('varsayilan reminder_enabled true, reminder_time 21:00, onboarding_done false, first_open_date null, notification_ids []', async () => {
    expect(await getReminderEnabled()).toBe(true);
    expect(await getReminderTime()).toBe('21:00');
    expect(await getOnboardingDone()).toBe(false);
    expect(await getFirstOpenDate()).toBeNull();
    expect(await getNotificationIds()).toEqual([]);
  });

  it('setReminderEnabled/getReminderEnabled roundtrip', async () => {
    await setReminderEnabled(false);
    expect(await getReminderEnabled()).toBe(false);
    await setReminderEnabled(true);
    expect(await getReminderEnabled()).toBe(true);
  });

  it('setReminderTime/getReminderTime roundtrip', async () => {
    await setReminderTime('07:30');
    expect(await getReminderTime()).toBe('07:30');
  });

  it('setOnboardingDone/getOnboardingDone roundtrip', async () => {
    await setOnboardingDone(true);
    expect(await getOnboardingDone()).toBe(true);
  });

  it('setFirstOpenDate/getFirstOpenDate roundtrip (null dahil)', async () => {
    await setFirstOpenDate('2026-09-21');
    expect(await getFirstOpenDate()).toBe('2026-09-21');
    await setFirstOpenDate(null);
    expect(await getFirstOpenDate()).toBeNull();
  });

  it('setNotificationIds/getNotificationIds roundtrip (dizi, bos dizi dahil)', async () => {
    await setNotificationIds(['abc-123', 'def-456']);
    expect(await getNotificationIds()).toEqual(['abc-123', 'def-456']);
    await setNotificationIds([]);
    expect(await getNotificationIds()).toEqual([]);
  });

  it('ayni anahtara ikinci yazma UPSERT yapar (satir cogalmaz)', async () => {
    await setReminderTime('08:00');
    await setReminderTime('09:00');
    expect(await getReminderTime()).toBe('09:00');
  });

  it('getAllSettings kismen ayarlanmis durumda dogru birlesimi doner', async () => {
    await setReminderEnabled(false);
    await setOnboardingDone(true);

    expect(await getAllSettings()).toEqual({
      reminderEnabled: false,
      reminderTime: '21:00',
      onboardingDone: true,
      firstOpenDate: null,
      notificationIds: [],
    });
  });
});

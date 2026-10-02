/**
 * `setting` tablosu (anahtar-deger) icin repo (spec "Veri modeli" >
 * `setting`, `plan.md` S5). Her deger `JSON.stringify` ile TEXT olarak
 * saklanir (boolean/string/string[]/null tek tipte tutulabilsin diye);
 * satir yoksa asagidaki varsayilan doner, hata firlatilmaz.
 */
import { getDriver } from './db';

export interface Settings {
  reminderEnabled: boolean;
  /** `HH:MM`, 24 saat. */
  reminderTime: string;
  onboardingDone: boolean;
  /** `YYYY-MM-DD`, ilk acilis gunu; henuz kaydedilmediyse `null`. */
  firstOpenDate: string | null;
  /** Iptal icin planli bildirim kimlikleri. */
  notificationIds: string[];
}

export const DEFAULT_SETTINGS: Readonly<Settings> = {
  reminderEnabled: true,
  reminderTime: '21:00',
  onboardingDone: false,
  firstOpenDate: null,
  notificationIds: [],
};

type SettingKey =
  | 'reminder_enabled'
  | 'reminder_time'
  | 'onboarding_done'
  | 'first_open_date'
  | 'notification_ids'
  | 'report_seq';

interface SettingRow {
  value: string;
}

function readValue<T>(key: SettingKey, fallback: T): T {
  const driver = getDriver();
  const row = driver.get<SettingRow>('SELECT value FROM setting WHERE key = ?', [key]);
  if (!row) {
    return fallback;
  }
  return JSON.parse(row.value) as T;
}

function writeValue<T>(key: SettingKey, value: T): void {
  const driver = getDriver();
  driver.run(
    `
    INSERT INTO setting (key, value) VALUES (?, ?)
    ON CONFLICT (key) DO UPDATE SET value = excluded.value
    `,
    [key, JSON.stringify(value)]
  );
}

export async function getReminderEnabled(): Promise<boolean> {
  return readValue('reminder_enabled', DEFAULT_SETTINGS.reminderEnabled);
}

export async function setReminderEnabled(value: boolean): Promise<void> {
  writeValue('reminder_enabled', value);
}

export async function getReminderTime(): Promise<string> {
  return readValue('reminder_time', DEFAULT_SETTINGS.reminderTime);
}

export async function setReminderTime(value: string): Promise<void> {
  writeValue('reminder_time', value);
}

export async function getOnboardingDone(): Promise<boolean> {
  return readValue('onboarding_done', DEFAULT_SETTINGS.onboardingDone);
}

export async function setOnboardingDone(value: boolean): Promise<void> {
  writeValue('onboarding_done', value);
}

export async function getFirstOpenDate(): Promise<string | null> {
  return readValue('first_open_date', DEFAULT_SETTINGS.firstOpenDate);
}

export async function setFirstOpenDate(value: string | null): Promise<void> {
  writeValue('first_open_date', value);
}

export async function getNotificationIds(): Promise<string[]> {
  return readValue('notification_ids', DEFAULT_SETTINGS.notificationIds);
}

export async function setNotificationIds(value: string[]): Promise<void> {
  writeValue('notification_ids', value);
}

/**
 * Deneme raporunun yerel artan sayaci (S16b, 27 §4.1 `seq`): ayni cihazin rapor
 * kopyalarini ayirir, kimlik DEGILDIR. Son PAYLASILAN raporun numarasi; hic
 * paylasilmadiysa 0. "Tum verilerimi sil" `setting` tablosunu bosalttigindan sifirlanir.
 */
export async function getReportSeq(): Promise<number> {
  return readValue('report_seq', 0);
}

export async function setReportSeq(value: number): Promise<void> {
  writeValue('report_seq', value);
}

/** Tum ayarlari tek nesnede dondurur (eksik anahtarlar icin varsayilan). */
export async function getAllSettings(): Promise<Settings> {
  return {
    reminderEnabled: await getReminderEnabled(),
    reminderTime: await getReminderTime(),
    onboardingDone: await getOnboardingDone(),
    firstOpenDate: await getFirstOpenDate(),
    notificationIds: await getNotificationIds(),
  };
}

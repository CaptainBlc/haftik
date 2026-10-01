/**
 * Ayarlar rotası: izin akışı (BLG-01/B8), Ayarlar'ı aç, odak/AppState ile izni
 * yeniden okuma, silme sonrası onboarding'e dönüş (BLG-05).
 */
import React from 'react';
import { Alert, AppState, Linking } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import SettingsScreen from '@/app/(main)/settings';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  // Odak efekti: mount'ta bir kez çalışır (gerçekte sekme odağına gelince).
  useFocusEffect: (cb: () => void | (() => void)) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    jest.requireActual('react').useEffect(cb, [cb]);
  },
}));

const mockGetAllSettings = jest.fn();
const mockSetReminderEnabled = jest.fn(async (_value: boolean) => undefined);
jest.mock('@/data/setting-repo', () => ({
  getAllSettings: () => mockGetAllSettings(),
  setReminderEnabled: (v: boolean) => mockSetReminderEnabled(v),
  setReminderTime: jest.fn(async () => undefined),
}));

const mockDeleteAllData = jest.fn(async (cancel: () => Promise<void>) => {
  await cancel();
});
jest.mock('@/data/delete-all', () => ({
  deleteAllData: (c: () => Promise<void>) => mockDeleteAllData(c),
}));

jest.mock('@/metrics/report-confirm', () => ({ confirmAndShareTrialReport: jest.fn() }));

const mockGetPermState = jest.fn();
const mockRequestAndSync = jest.fn();
const mockSync = jest.fn(async () => ({ status: 'granted' }));
const mockCancelAll = jest.fn(async () => undefined);
jest.mock('@/notify/wiring', () => ({
  getNotificationPermissionState: () => mockGetPermState(),
  requestPermissionAndSync: () => mockRequestAndSync(),
  syncNotificationsNow: () => mockSync(),
  cancelAllNotifications: () => mockCancelAll(),
  runDeleteExclusive: (task: () => Promise<void>) => task(),
}));

const DENIED_ASKABLE = { status: 'denied', granted: false, canAskAgain: true };
const DENIED_FINAL = { status: 'denied', granted: false, canAskAgain: false };
const GRANTED = { status: 'granted', granted: true, canAskAgain: false };

let tree: ReactTestRenderer | undefined;

async function render() {
  await act(async () => {
    tree = create(<SettingsScreen />);
  });
  return tree as ReactTestRenderer;
}

const sw = () => tree!.root.findByProps({ testID: 'reminder-enabled-switch' });

beforeEach(() => {
  mockGetAllSettings.mockResolvedValue({
    reminderEnabled: true,
    reminderTime: '21:00',
    onboardingDone: true,
    firstOpenDate: '2026-09-20',
    notificationIds: [],
  });
});

afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('Ayarlar rotası: bildirim izni', () => {
  it('yeni kurulum (denied + canAskAgain): anahtar KAPALI görünür, çelişki yok', async () => {
    mockGetPermState.mockResolvedValue(DENIED_ASKABLE);
    await render();
    expect(sw().props.value).toBe(false);
  });

  it('anahtarı açınca izin İSTENİR (Android 13+ denied+canAskAgain) ve durum yeniden okunur', async () => {
    mockGetPermState.mockResolvedValue(DENIED_ASKABLE);
    mockRequestAndSync.mockImplementation(async () => {
      mockGetPermState.mockResolvedValue(GRANTED);
      return 'granted';
    });
    await render();
    await act(async () => {
      await sw().props.onValueChange(true);
    });
    expect(mockSetReminderEnabled).toHaveBeenCalledWith(true);
    expect(mockRequestAndSync).toHaveBeenCalledTimes(1);
    expect(sw().props.value).toBe(true);
  });

  it('istek reddedilirse (kalıcı ret) anahtar kapalı kalır ve "Ayarları aç" görünür', async () => {
    mockGetPermState.mockResolvedValue(DENIED_ASKABLE);
    mockRequestAndSync.mockImplementation(async () => {
      mockGetPermState.mockResolvedValue(DENIED_FINAL);
      return 'denied';
    });
    await render();
    expect(tree!.root.findAllByProps({ testID: 'open-system-settings' })).toHaveLength(0);
    await act(async () => {
      await sw().props.onValueChange(true);
    });
    expect(sw().props.value).toBe(false);
    expect(tree!.root.findAllByProps({ testID: 'open-system-settings' }).length).toBeGreaterThan(0);
  });

  it('"Ayarları aç" Linking.openSettings çağırır', async () => {
    mockGetPermState.mockResolvedValue(DENIED_FINAL);
    const open = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    await render();
    await act(async () => {
      tree!.root.findByProps({ testID: 'open-system-settings' }).props.onPress();
    });
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("uygulama öne gelince (AppState 'active') izin yeniden okunur; verildiyse anahtar açılır ve plan kurulur", async () => {
    let handler: ((s: string) => void) | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _t: string,
      cb: (s: string) => void
    ) => {
      handler = cb;
      return { remove: jest.fn() };
    }) as never);
    mockGetPermState.mockResolvedValue(DENIED_FINAL);
    await render();
    expect(sw().props.value).toBe(false);

    // Kullanıcı sistem ayarlarından izni verip döndü.
    mockGetPermState.mockResolvedValue(GRANTED);
    mockSync.mockClear();
    await act(async () => {
      handler?.('active');
    });
    expect(sw().props.value).toBe(true);
    expect(mockSync).toHaveBeenCalled();
    expect(tree!.root.findAllByProps({ testID: 'notification-permission-denied' })).toHaveLength(0);
  });

  it('kapatma: izin istenmez, yalnızca yeniden planlanır', async () => {
    mockGetPermState.mockResolvedValue(GRANTED);
    await render();
    mockSync.mockClear();
    await act(async () => {
      await sw().props.onValueChange(false);
    });
    expect(mockRequestAndSync).not.toHaveBeenCalled();
    expect(mockSetReminderEnabled).toHaveBeenCalledWith(false);
    expect(mockSync).toHaveBeenCalled();
  });
});

describe('Ayarlar rotası: silme sonrası (BLG-05)', () => {
  async function pressDeleteAndConfirm() {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await act(async () => {
      tree!.root.findByProps({ testID: 'delete-all-button' }).props.onPress();
    });
    const buttons = alert.mock.calls[0][2] as { text: string; onPress?: () => Promise<void> }[];
    await act(async () => {
      await buttons.find((b) => b.text === 'Sil')!.onPress!();
    });
  }

  it('silme sonrası router "/"a (onboarding kapısı) yönlendirilir', async () => {
    mockGetPermState.mockResolvedValue(GRANTED);
    await render();
    await pressDeleteAndConfirm();
    expect(mockDeleteAllData).toHaveBeenCalledTimes(1);
    expect(mockCancelAll).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('Vazgeç: silme ve yönlendirme yok', async () => {
    mockGetPermState.mockResolvedValue(GRANTED);
    await render();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await act(async () => {
      tree!.root.findByProps({ testID: 'delete-all-button' }).props.onPress();
    });
    const buttons = alert.mock.calls[0][2] as { text: string }[];
    expect(buttons.find((b) => b.text === 'Vazgeç')).toBeDefined();
    expect(mockDeleteAllData).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('gizlilik uyarısında dahili plan kodu ("S12") görünmez', async () => {
    mockGetPermState.mockResolvedValue(GRANTED);
    await render();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await act(async () => {
      tree!.root.findByProps({ testID: 'privacy-link' }).props.onPress();
    });
    expect(JSON.stringify(alert.mock.calls[0])).not.toMatch(/S\d+/);
  });
});

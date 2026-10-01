/**
 * BLG-05: "Tüm verilerimi sil" sonrası onboarding yeniden çalışır. Gerçek
 * (bellek-içi) DB + gerçek repo; kapı hook'u ve açılış ekranı (index) yarışsız:
 * okuma bitmeden yönlendirme yok, varsayılan "done" değil.
 */
import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import Index from '@/app/index';
import NotificationsScreen from '@/app/onboarding/notifications';
import { deleteAllData } from '@/data/delete-all';
import {
  getFirstOpenDate,
  getOnboardingDone,
  setFirstOpenDate,
  setOnboardingDone,
} from '@/data/setting-repo';
import { useOnboardingGate, type OnboardingGate } from '@/lib/onboarding-gate';
import { setupTestDb } from '../helpers/setup-test-db';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  Redirect: ({ href }: { href: string }) => {
    const { Text } = jest.requireActual('react-native');
    return jest.requireActual('react').createElement(Text, { testID: 'redirect' }, href);
  },
}));

const mockRequestAndSync = jest.fn(async () => 'granted');
const mockSync = jest.fn(async () => ({ status: 'granted' }));
jest.mock('@/notify/wiring', () => ({
  requestPermissionAndSync: () => mockRequestAndSync(),
  syncNotificationsNow: () => mockSync(),
}));

let tree: ReactTestRenderer | undefined;

function GateProbe({ onGate }: { onGate: (g: OnboardingGate) => void }) {
  onGate(useOnboardingGate());
  return null;
}

afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
  jest.clearAllMocks();
});

describe('silme sonrası onboarding', () => {
  setupTestDb();

  it('deleteAllData onboardingDone ve firstOpenDate\'i siler', async () => {
    await setOnboardingDone(true);
    await setFirstOpenDate('2026-09-20');
    await deleteAllData(async () => undefined);
    expect(await getOnboardingDone()).toBe(false);
    expect(await getFirstOpenDate()).toBeNull();
  });

  it('kapı: ilk durum "loading"; silme öncesi "done", silme sonrası yeni mount "needed"', async () => {
    await setOnboardingDone(true);
    const seen: OnboardingGate[] = [];
    await act(async () => {
      tree = create(<GateProbe onGate={(g) => seen.push(g)} />);
    });
    expect(seen[0]).toBe('loading'); // okuma bitmeden asla "done" varsayılmaz
    expect(seen[seen.length - 1]).toBe('done');
    act(() => tree?.unmount());

    await deleteAllData(async () => undefined);

    const after: OnboardingGate[] = [];
    await act(async () => {
      tree = create(<GateProbe onGate={(g) => after.push(g)} />);
    });
    expect(after[0]).toBe('loading');
    expect(after[after.length - 1]).toBe('needed');
  });

  it('açılış ekranı (index): okuma bitene kadar yönlendirmez, silinmiş veride onboarding\'e gider', async () => {
    await setOnboardingDone(true);
    await deleteAllData(async () => undefined);
    await act(async () => {
      tree = create(<Index />);
    });
    expect(tree!.root.findByProps({ testID: 'redirect' }).props.children).toBe(
      '/onboarding/welcome'
    );
  });

  it('temiz veri (hiç ayar yok): onboarding gerekli, Bugün\'e atlanmaz', async () => {
    await act(async () => {
      tree = create(<Index />);
    });
    expect(tree!.root.findByProps({ testID: 'redirect' }).props.children).not.toBe('/today');
  });

  it('onboarding tekrar tamamlanınca first_open_date ve onboardingDone yeniden yazılır', async () => {
    await setOnboardingDone(true);
    await setFirstOpenDate('2026-09-20');
    await deleteAllData(async () => undefined);

    await act(async () => {
      tree = create(<NotificationsScreen />);
    });
    await act(async () => {
      await tree!.root.findByProps({ testID: 'onboarding-notifications-skip' }).props.onPress();
    });
    expect(await getOnboardingDone()).toBe(true);
    expect(await getFirstOpenDate()).not.toBeNull();
    expect(mockReplace).toHaveBeenCalledWith('/today');
  });

  it('"İzin ver" çift dokunuşu izin akışını ve yönlendirmeyi yalnızca BİR kez çalıştırır', async () => {
    await act(async () => {
      tree = create(<NotificationsScreen />);
    });
    const allow = tree!.root.findByProps({ testID: 'onboarding-notifications-allow' });
    await act(async () => {
      const first = allow.props.onPress();
      const second = allow.props.onPress();
      await Promise.all([first, second]);
    });
    expect(mockRequestAndSync).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });
});

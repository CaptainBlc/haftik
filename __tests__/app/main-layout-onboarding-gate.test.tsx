/** S10 N-4: `(main)` layout'u onboarding kapısı (derin bağlantı atlaması). */
import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import MainLayout from '@/app/(main)/_layout';

const mockGetOnboardingDone = jest.fn();
jest.mock('@/data/setting-repo', () => ({
  getOnboardingDone: () => mockGetOnboardingDone(),
}));

jest.mock('expo-router', () => {
  const { Text } = jest.requireActual('react-native');
  const R = jest.requireActual('react');
  const Tabs = ({ children }: { children?: React.ReactNode }) =>
    R.createElement(Text, { testID: 'tabs' }, children);
  Tabs.Screen = () => null;
  return {
    __esModule: true,
    Tabs,
    Redirect: ({ href }: { href: string }) =>
      R.createElement(Text, { testID: 'redirect' }, href),
  };
});

let tree: ReactTestRenderer | undefined;

async function render(): Promise<ReactTestRenderer> {
  await act(async () => {
    tree = create(<MainLayout />);
  });
  return tree as ReactTestRenderer;
}

afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
  jest.clearAllMocks();
});

describe('(main) layout onboarding kapısı', () => {
  it('onboardingDone false -> onboarding\'e yönlendirir, ekran render edilmez', async () => {
    mockGetOnboardingDone.mockResolvedValue(false);
    const t = await render();
    expect(t.root.findByProps({ testID: 'redirect' }).props.children).toBe('/onboarding/welcome');
    expect(t.root.findAllByProps({ testID: 'tabs' })).toHaveLength(0);
  });

  it('onboardingDone true -> sekmeleri gösterir, yönlendirme yok', async () => {
    mockGetOnboardingDone.mockResolvedValue(true);
    const t = await render();
    expect(t.root.findAllByProps({ testID: 'tabs' }).length).toBeGreaterThan(0);
    expect(t.root.findAllByProps({ testID: 'redirect' })).toHaveLength(0);
  });

  it('okuma hatası akışı kilitlemez: güvenli varsayılan onboarding', async () => {
    mockGetOnboardingDone.mockRejectedValue(new Error('db yok'));
    const t = await render();
    expect(t.root.findByProps({ testID: 'redirect' }).props.children).toBe('/onboarding/welcome');
  });
});

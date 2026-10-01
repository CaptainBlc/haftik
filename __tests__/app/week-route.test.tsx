/**
 * BLG-02: Hafta ekranı sekme odağına her gelişinde veriyi yeniden yükler
 * (Bugün'de kaydedilen check-in'ler bayat kalmaz).
 */
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import WeekScreen from '@/app/(main)/week';
import type { Checkin } from '@/domain/types';

let mockFocusCallbacks: (() => void | (() => void))[] = [];
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  // Gerçek davranışı taklit: odağa gelince çalıştır; test `triggerFocus` ile tekrar tetikler.
  useFocusEffect: (cb: () => void | (() => void)) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    jest.requireActual('react').useEffect(() => {
      mockFocusCallbacks.push(cb);
      const cleanup = cb();
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }, [cb]);
  },
}));

const mockGetCheckins = jest.fn();
jest.mock('@/data/checkin-repo', () => ({
  getCheckins: (...a: unknown[]) => mockGetCheckins(...a),
  // Kritik-1 düzeltmesi (A8): week.tsx artık hasAnyPriorCard() yerine
  // check-in geçmişini okuyor (getCheckinsBefore) ve hasQualifiedWeekBefore
  // ile hesaplıyor. Boş dizi = eski `hasAnyPriorCard: false` ile aynı senaryo
  // (eşik 3 kalır) — bu testin beklentileri bu yüzden değişmedi.
  getCheckinsBefore: jest.fn(async () => []),
}));
jest.mock('@/data/card-repo', () => ({
  getCard: jest.fn(async () => null),
}));
jest.mock('@/metrics/track', () => ({ trackEventOnce: jest.fn(async () => undefined) }));

// Salı 23 Eylül 2026 12:00 (hafta başı 2026-09-21).
jest.mock('@/lib/now', () => ({ useNow: () => new Date(2026, 8, 23, 12, 0, 0) }));

const day = (d: string): Checkin => ({ localDate: d, movement: 2, sleep: 2, spending: 2, social: 2 });

let tree: ReactTestRenderer | undefined;

function headline(): string {
  return String(tree!.root.findByProps({ testID: 'week-status-headline' }).props.children);
}

afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
  mockFocusCallbacks = [];
  jest.clearAllMocks();
});

describe('Hafta ekranı: odakta yeniden yükleme', () => {
  it('sekme yeniden odaklanınca yeni check-in\'ler görünür ("2 gün daha" -> "hazırlanıyor")', async () => {
    mockGetCheckins.mockResolvedValue([day('2026-09-21')]);
    await act(async () => {
      tree = create(<WeekScreen />);
    });
    expect(headline()).toBe('Kartın için 2 gün daha lazım.');
    const callsAfterMount = mockGetCheckins.mock.calls.length;

    // Kullanıcı Bugün'de 2 gün daha kaydetti, Hafta sekmesine döndü (odak).
    mockGetCheckins.mockResolvedValue([day('2026-09-21'), day('2026-09-22'), day('2026-09-23')]);
    await act(async () => {
      mockFocusCallbacks[mockFocusCallbacks.length - 1]();
    });
    expect(mockGetCheckins.mock.calls.length).toBeGreaterThan(callsAfterMount);
    expect(headline()).toBe('Kartın hazırlanıyor.');
  });

  it('odak efekti kayıtlı: ekran useFocusEffect kullanıyor', async () => {
    mockGetCheckins.mockResolvedValue([]);
    await act(async () => {
      tree = create(<WeekScreen />);
    });
    expect(mockFocusCallbacks.length).toBeGreaterThan(0);
  });

  it('yeniden yükleme sırasında ekran yükleme ekranına düşmez (eski veri görünür kalır)', async () => {
    mockGetCheckins.mockResolvedValue([day('2026-09-21')]);
    await act(async () => {
      tree = create(<WeekScreen />);
    });
    let resolve: (v: Checkin[]) => void = () => {};
    mockGetCheckins.mockReturnValue(new Promise<Checkin[]>((r) => (resolve = r)));
    await act(async () => {
      mockFocusCallbacks[mockFocusCallbacks.length - 1]();
    });
    expect(headline()).toBe('Kartın için 2 gün daha lazım.');
    await act(async () => {
      resolve([day('2026-09-21'), day('2026-09-22')]);
    });
    expect(headline()).toBe('Kartın için 1 gün daha lazım.');
  });
});

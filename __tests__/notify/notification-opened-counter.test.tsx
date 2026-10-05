/**
 * Rapor v2 `notif_opened` sayacı: bildirime dokunarak açılışta (soğuk ve sıcak) yalnız izin listesindeki türler
 * sayılır; bilinmeyen/eksik `data` (dış girdi) sayılmaz ve yönlendirmeyi etkilemez.
 */
import { act, create } from 'react-test-renderer';

import { notificationOpenedDim, useNotificationRouting } from '@/notify/notification-routing';
import { createScheduler, type NotificationScheduler } from '@/notify/scheduler';
import { createFakeNotifications, type FakeNotifications } from '../helpers/fake-notifications';

let mockNavState: { key: string | null } | undefined = { key: 'root' };
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRootNavigationState: () => mockNavState,
}));
jest.mock('@/lib/now', () => ({ getNow: () => new Date(2026, 8, 23, 12, 0, 0) }));
const mockTrackCounter = jest.fn(async () => true);
jest.mock('@/metrics/track', () => ({ trackCounter: (...a: unknown[]) => mockTrackCounter(...(a as [])) }));

function Host({ scheduler }: { scheduler: NotificationScheduler }) {
  useNotificationRouting({ scheduler });
  return null;
}

let fake: FakeNotifications;
let scheduler: NotificationScheduler;
let tree: ReturnType<typeof create> | undefined;

beforeEach(() => {
  mockNavState = { key: 'root' };
  fake = createFakeNotifications();
  scheduler = createScheduler({ notifications: fake, platform: 'android' });
});
afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
  jest.clearAllMocks();
});

describe('notificationOpenedDim', () => {
  it('daily -> daily, card-ready -> card_ready; başka her şey null', () => {
    expect(notificationOpenedDim({ kind: 'daily' })).toBe('daily');
    expect(notificationOpenedDim({ kind: 'card-ready', weekStart: '2026-09-14' })).toBe('card_ready');
    expect(notificationOpenedDim({ kind: 'weekly' })).toBeNull();
    expect(notificationOpenedDim({ kind: 5 })).toBeNull();
    expect(notificationOpenedDim({})).toBeNull();
    expect(notificationOpenedDim(undefined)).toBeNull();
    expect(notificationOpenedDim({ kind: 'constructor' })).toBeNull();
  });
});

describe('useNotificationRouting: notif_opened sayacı', () => {
  it('soğuk açılış (bekleyen yanıt): bir kez sayılır ve doğru rotaya gider', async () => {
    fake.lastResponse = { notification: { request: { content: { data: { kind: 'daily' } } } } };
    await act(async () => {
      tree = create(<Host scheduler={scheduler} />);
    });
    expect(mockTrackCounter).toHaveBeenCalledTimes(1);
    expect(mockTrackCounter).toHaveBeenCalledWith('notif_opened', { dim: 'daily' });
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/today' });
  });

  it('sıcak açılış: kart-hazır dokunuşu card_ready olarak sayılır', async () => {
    await act(async () => {
      tree = create(<Host scheduler={scheduler} />);
    });
    expect(mockTrackCounter).not.toHaveBeenCalled();
    await act(async () => {
      fake.emitResponse({ kind: 'card-ready', weekStart: '2026-09-14' });
    });
    expect(mockTrackCounter).toHaveBeenCalledTimes(1);
    expect(mockTrackCounter).toHaveBeenCalledWith('notif_opened', { dim: 'card_ready' });
  });

  it('bilinmeyen tür: sayılmaz, ama güvenli varsayılana (/week) yönlendirilir', async () => {
    fake.lastResponse = { notification: { request: { content: { data: { kind: 'bilinmeyen' } } } } };
    await act(async () => {
      tree = create(<Host scheduler={scheduler} />);
    });
    expect(mockTrackCounter).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/week' });
  });

  it('sayaç yazımı başarısız olsa bile yönlendirme çalışır', async () => {
    mockTrackCounter.mockRejectedValueOnce(new Error('db'));
    fake.lastResponse = { notification: { request: { content: { data: { kind: 'daily' } } } } };
    await act(async () => {
      tree = create(<Host scheduler={scheduler} />);
    });
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/today' });
  });
});

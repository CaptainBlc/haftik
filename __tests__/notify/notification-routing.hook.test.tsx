/**
 * T3, bildirim yönlendirmesi: `useNotificationRouting` bağlama katmanı.
 * Gerçek davranış yalnızca emülatör/cihazda (K4) tam doğrulanır; burada
 * sahte scheduler + sahte `expo-router` ile "doğru rotaya, doğru zamanda,
 * bir kez" sözleşmesi test edilir.
 */
import { act, create } from 'react-test-renderer';

import { useNotificationRouting } from '@/notify/notification-routing';
import { createScheduler, type NotificationScheduler } from '@/notify/scheduler';
import { createFakeNotifications, type FakeNotifications } from '../helpers/fake-notifications';

let mockNavState: { key: string | null } | undefined = { key: 'root' };
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRootNavigationState: () => mockNavState,
}));

// Çarşamba 23 Eylül 2026 12:00 (hafta başı 2026-09-21).
jest.mock('@/lib/now', () => ({ getNow: () => new Date(2026, 8, 23, 12, 0, 0) }));

function TestHost({ scheduler }: { scheduler: NotificationScheduler }) {
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

describe('useNotificationRouting', () => {
  it('soğuk açılış: mount sırasında bekleyen yanıt varsa doğru rotaya gider ve yanıtı temizler', async () => {
    fake.lastResponse = { notification: { request: { content: { data: { kind: 'daily' } } } } };
    await act(async () => {
      tree = create(<TestHost scheduler={scheduler} />);
    });
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/today' });
    expect(fake.clearCount).toBe(1);
  });

  it('soğuk açılışta bekleyen yanıt yoksa hiçbir şey yapmaz', async () => {
    await act(async () => {
      tree = create(<TestHost scheduler={scheduler} />);
    });
    expect(mockPush).not.toHaveBeenCalled();
    expect(fake.clearCount).toBe(0);
  });

  it('sıcak açılış: uygulama açıkken gelen yanıt card-ready + weekStart ile /card rotasına gider', async () => {
    await act(async () => {
      tree = create(<TestHost scheduler={scheduler} />);
    });
    await act(async () => {
      fake.emitResponse({ kind: 'card-ready', weekStart: '2026-09-07' });
    });
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/card/[weekStart]',
      params: { weekStart: '2026-09-07' },
    });
    expect(fake.clearCount).toBe(1);
  });

  it('router hazır olana kadar (navigationState.key null) yönlendirme ERTELENİR', async () => {
    mockNavState = { key: null };
    fake.lastResponse = { notification: { request: { content: { data: { kind: 'daily' } } } } };
    await act(async () => {
      tree = create(<TestHost scheduler={scheduler} />);
    });
    expect(mockPush).not.toHaveBeenCalled();
    // Yanıt yine de "işlendi" sayılır (temizlendi) -- yönlendirme ayrı bir efektte bekler.
    expect(fake.clearCount).toBe(1);

    // Router hazır olunca (yeniden render tetiklenir) ertelenen rotaya gider.
    mockNavState = { key: 'root' };
    await act(async () => {
      tree!.update(<TestHost scheduler={scheduler} />);
    });
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/today' });
  });

  it('bilinmeyen/geçersiz data -> /week (güvenli varsayılan)', async () => {
    await act(async () => {
      tree = create(<TestHost scheduler={scheduler} />);
    });
    await act(async () => {
      fake.emitResponse({ kind: 'card-ready' }); // weekStart yok -- eski planlanmış bildirim.
    });
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/week' });
  });
});

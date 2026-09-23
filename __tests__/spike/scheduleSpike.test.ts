/**
 * S1 spike testi (bkz. `spike/notifications/scheduleSpike.ts`).
 *
 * Gerçek cihaz yok; `expo-notifications` native modülü mock'lanıyor. Amaç:
 * (1) izin akışının doğru sırayla çağrılması, (2) `scheduleNotificationAsync`
 * çağrısının tarih tetikleyicili (`SchedulableTriggerInputTypes.DATE`) doğru
 * şekilde kurulması. Gerçek cihazda bildirimin gelişi S8'de elle doğrulanır
 * (plan.md S8 "Bitti kanıtı"), emülatör yeterli sayılmaz.
 */
import { scheduleDateNotificationSpike } from '../../spike/notifications/scheduleSpike';

jest.mock('expo-notifications', () => ({
  __esModule: true,
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(async () => 'fake-notification-id'),
  // jest.mock fabrikası dışarıdaki değişkenlere erişemez; sabiti burada,
  // gerçek `SchedulableTriggerInputTypes.DATE = 'date'` değeriyle birebir
  // eşleşecek şekilde satır içi tanımlıyoruz.
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

describe('S1 spike: yerel bildirim planlama (expo-notifications)', () => {
  it('izin zaten verilmişse tekrar istemez ve bildirimi tarih tetikleyicili planlar', async () => {
    const Notifications = jest.requireMock('expo-notifications') as {
      getPermissionsAsync: jest.Mock;
      requestPermissionsAsync: jest.Mock;
      scheduleNotificationAsync: jest.Mock;
    };

    const triggerDate = new Date('2026-09-27T17:00:00.000Z'); // Pazar 20:00 Europe/Istanbul
    const id = await scheduleDateNotificationSpike(triggerDate);

    expect(id).toBe('fake-notification-id');
    expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.any(String),
          body: expect.any(String),
        }),
        trigger: {
          type: 'date',
          date: triggerDate,
        },
      })
    );
  });

  it('izin reddedilirse hata fırlatır (çökme yok — spec güvenlik gereksinimi)', async () => {
    const Notifications = jest.requireMock('expo-notifications') as {
      getPermissionsAsync: jest.Mock;
      requestPermissionsAsync: jest.Mock;
    };
    Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    Notifications.requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

    await expect(scheduleDateNotificationSpike(new Date())).rejects.toThrow(/izin/i);
  });
});

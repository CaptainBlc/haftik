/**
 * S16a (19 §5.1): bildirim metni seçimi deterministik ve veri sızdırmaz.
 */
import {
  DAILY_NOTIFICATION_VARIANTS,
  NOTIFICATION_TEXTS,
  getNotificationText,
} from '../../src/domain/content/notification-texts';

describe('getNotificationText', () => {
  it('daily: aynı haftanın günü için hep aynı varyant (deterministik)', () => {
    const monday = new Date(2026, 8, 21, 21, 0);
    const nextMonday = new Date(2026, 8, 28, 21, 0);
    expect(getNotificationText('daily', monday)).toEqual(getNotificationText('daily', nextMonday));
  });

  it('daily: haftanın günleri havuzdaki varyantlar arasında döner, 4+ farklı gün 4 varyantı da kullanır', () => {
    const seen = new Set<string>();
    for (let d = 20; d < 27; d++) {
      seen.add(getNotificationText('daily', new Date(2026, 8, d, 21, 0)).title);
    }
    expect(seen.size).toBe(DAILY_NOTIFICATION_VARIANTS.length);
  });

  it('daily: seçim yerel haftanın gününe göre (Date.getDay() % 4)', () => {
    const sunday = new Date(2026, 8, 27, 21, 0); // getDay() === 0
    expect(getNotificationText('daily', sunday)).toEqual(DAILY_NOTIFICATION_VARIANTS[0]);
    const thursday = new Date(2026, 8, 24, 21, 0); // getDay() === 4 -> 4 % 4 = 0
    expect(getNotificationText('daily', thursday)).toEqual(DAILY_NOTIFICATION_VARIANTS[0]);
    const friday = new Date(2026, 8, 25, 21, 0); // 5 % 4 = 1
    expect(getNotificationText('daily', friday)).toEqual(DAILY_NOTIFICATION_VARIANTS[1]);
  });

  it('card-ready: sabit tek metin; zamandan bağımsız', () => {
    expect(getNotificationText('card-ready', new Date(2026, 8, 27, 20, 0))).toEqual(
      NOTIFICATION_TEXTS['card-ready']
    );
    expect(getNotificationText('card-ready', new Date(2026, 9, 4, 20, 0))).toEqual(
      NOTIFICATION_TEXTS['card-ready']
    );
  });

  it('card-ready metni "kart"ı söyler ve K3 akışını (bugünü de işaretle) önceden belirtir', () => {
    const { title, body } = NOTIFICATION_TEXTS['card-ready'];
    expect(title).toContain('kartı');
    expect(body).toMatch(/işaretle/);
  });
});

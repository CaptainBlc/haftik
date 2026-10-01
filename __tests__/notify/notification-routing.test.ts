/**
 * T3, bildirim yönlendirmesi: `resolveNotificationRoute` sabit rota tablosu
 * (`21-mimari-ve-efor.md` §2f). Bildirim verisi dış girdi sayılır.
 */
import { resolveNotificationRoute } from '@/notify/notification-routing';

const TODAY = '2026-09-23'; // Çarşamba, hafta başı 2026-09-21.

describe('resolveNotificationRoute', () => {
  it('kind yoksa -> /week (güvenli varsayılan)', () => {
    expect(resolveNotificationRoute(undefined, TODAY)).toEqual({ pathname: '/week' });
    expect(resolveNotificationRoute({}, TODAY)).toEqual({ pathname: '/week' });
  });

  it('bilinmeyen kind -> /week', () => {
    expect(resolveNotificationRoute({ kind: 'something-else' }, TODAY)).toEqual({ pathname: '/week' });
  });

  it('kind sayı/obje gibi string olmayan bir değerse -> /week', () => {
    expect(resolveNotificationRoute({ kind: 42 }, TODAY)).toEqual({ pathname: '/week' });
  });

  it('daily -> /today (weekStart olsa bile göz ardı edilir)', () => {
    expect(resolveNotificationRoute({ kind: 'daily' }, TODAY)).toEqual({ pathname: '/today' });
    expect(resolveNotificationRoute({ kind: 'daily', weekStart: '2026-09-07' }, TODAY)).toEqual({
      pathname: '/today',
    });
  });

  it('card-ready + geçerli (geçmiş) weekStart -> /card/<weekStart>', () => {
    expect(resolveNotificationRoute({ kind: 'card-ready', weekStart: '2026-09-07' }, TODAY)).toEqual({
      pathname: '/card/[weekStart]',
      params: { weekStart: '2026-09-07' },
    });
  });

  it('card-ready + weekStart yok (güncellemeden önce planlanmış bildirim) -> /week', () => {
    expect(resolveNotificationRoute({ kind: 'card-ready' }, TODAY)).toEqual({ pathname: '/week' });
  });

  it('card-ready + geçersiz biçimli weekStart -> /week', () => {
    expect(resolveNotificationRoute({ kind: 'card-ready', weekStart: 'not-a-date' }, TODAY)).toEqual({
      pathname: '/week',
    });
  });

  it('card-ready + Pazartesi olmayan weekStart -> /week (isValidWeekStartParam reddeder)', () => {
    expect(resolveNotificationRoute({ kind: 'card-ready', weekStart: '2026-09-08' }, TODAY)).toEqual({
      pathname: '/week',
    });
  });

  it('card-ready + gelecekteki weekStart -> /week (dış girdi, güvenmez)', () => {
    expect(resolveNotificationRoute({ kind: 'card-ready', weekStart: '2026-10-05' }, TODAY)).toEqual({
      pathname: '/week',
    });
  });

  it('card-ready + bugünün haftası -> /card/<weekStart> (bu hafta de geçerli bir rota)', () => {
    expect(resolveNotificationRoute({ kind: 'card-ready', weekStart: '2026-09-21' }, TODAY)).toEqual({
      pathname: '/card/[weekStart]',
      params: { weekStart: '2026-09-21' },
    });
  });
});

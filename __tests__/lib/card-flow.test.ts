import { needsTodayCheckinBeforeCard } from '@/lib/card-flow';

describe('needsTodayCheckinBeforeCard (K3, spec E4a / docs/ux/pazar-akisi.md)', () => {
  it("bugün bu haftanın Pazar'ı ve bugünün check-in'i yoksa true döner", () => {
    expect(
      needsTodayCheckinBeforeCard({
        weekStart: '2026-09-14', // Pazartesi
        today: '2026-09-20', // o haftanın Pazar'ı
        checkins: [{ localDate: '2026-09-19' }],
      })
    ).toBe(true);
  });

  it("bugün bu haftanın Pazar'ı ama bugünün check-in'i varsa false döner", () => {
    expect(
      needsTodayCheckinBeforeCard({
        weekStart: '2026-09-14',
        today: '2026-09-20',
        checkins: [{ localDate: '2026-09-20' }],
      })
    ).toBe(false);
  });

  it("bugün bu haftanın Pazar'ı değilse (ör. Pazartesi'den sonra, geçmiş açık hafta) her zaman false döner", () => {
    expect(
      needsTodayCheckinBeforeCard({
        weekStart: '2026-09-14',
        today: '2026-09-21', // ertesi Pazartesi
        checkins: [],
      })
    ).toBe(false);
  });

  it('hiç check-in yokken de Pazar değilse false döner (yönlendirme yalnızca Pazar gününe özel)', () => {
    expect(
      needsTodayCheckinBeforeCard({
        weekStart: '2026-09-14',
        today: '2026-09-16', // Çarşamba
        checkins: [],
      })
    ).toBe(false);
  });
});

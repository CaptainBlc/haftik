/**
 * TB-10 (08 M-3): `openOrBuildCard(weekStart, now)` — `now` zorunlu ve zamanın TEK kaynağı.
 * Bu dosyadaki `@ts-expect-error` satırları derleme zamanı korumasıdır: imza gevşetilirse
 * ("now?" ya da eski `today: string` ikinci parametresi) satır artık hata vermez ve `tsc --noEmit`
 * "Unused '@ts-expect-error' directive" ile kırılır. Fonksiyon gövdesi çalıştırılmaz.
 */
import { openOrBuildCard } from '@/card/open-card';

/** Hiçbir zaman çağrılmaz; yalnız tip denetimi içindir. */
export function _typeGuards(): void {
  // @ts-expect-error `now` zorunlu: tek argümanla çağrı derlenmemeli.
  void openOrBuildCard('2026-09-14');
  // @ts-expect-error ikinci parametre artık `today: string` değil, `now: Date`.
  void openOrBuildCard('2026-09-14', '2026-09-25');
  // Geçerli çağrı derlenir.
  void openOrBuildCard('2026-09-14', new Date(2026, 8, 25, 12));
}

describe('openOrBuildCard imzası (TB-10)', () => {
  it('işlev tam 2 parametre bekler (weekStart, now)', () => {
    expect(openOrBuildCard.length).toBe(2);
  });

  it('tip korumaları dosyada duruyor (derleme zamanı denetimi tsc ile yapılır)', () => {
    expect(typeof _typeGuards).toBe('function');
  });
});

/**
 * Bugün ekranının boş durumundaki "Yeni bir hafta, temiz sayfa." satırının saf koşulu (S22; 18 §3 tablo).
 * Hiçbir veriye değil yalnızca check-in TARİHLERİNE bakar (seviye/kategori girdisi yok).
 *
 * Gösterilir ancak ve ancak: bu hafta (Pzt..bugün) hiç kayıt yok, bugün için de yok, ve önceki haftalarda bir kayıt var
 * (ilk kullanımda gösterilmez) ve o son kayıt bugünden en az `RETURN_GAP_DAYS` (4) gün önce. Böylece "yeni hafta"
 * iddiası yanlış olamaz: aynı haftada zaten girişi olan kullanıcıya gösterilmez.
 */
import { getWeekStart } from '@/domain/week';
import { RETURN_GAP_DAYS } from '@/lib/save-feedback';

function parse(localDate: string): Date {
  const [y, m, d] = localDate.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

export function shouldShowFreshWeekLine(params: { today: string; checkinDates: readonly string[] }): boolean {
  const { today, checkinDates } = params;
  const weekStart = getWeekStart(parse(today));
  if (checkinDates.some((d) => d >= weekStart && d <= today)) {
    return false; // bu haftada (bugün dahil) zaten giriş var
  }
  const previous = checkinDates.filter((d) => d < weekStart).sort().pop();
  if (!previous) {
    return false; // hiç geçmiş yok: ilk kullanım
  }
  return daysBetween(previous, today) >= RETURN_GAP_DAYS;
}

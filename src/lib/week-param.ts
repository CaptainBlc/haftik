/**
 * Dışarıdan (deep link `haftik://card/...`, query param) gelebilen
 * `weekStart` değerinin saf doğrulayıcısı. Kalıcı yazıma (`saveCard`)
 * ulaşmadan önce her giriş noktasında kullanılır.
 *
 * Geçerli: `YYYY-MM-DD` biçimi + gerçek takvim tarihi + Pazartesi
 * (`getWeekStart(x) === x`) + bu haftadan ileri değil.
 */
import { getWeekStart } from '@/domain/week';

const FORMAT = /^\d{4}-\d{2}-\d{2}$/;

function parseStrict(value: string): Date | null {
  if (!FORMAT.test(value)) {
    return null;
  }
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}

/** @param today Bugünün yerel tarihi, `YYYY-MM-DD` (`toLocalDateString(now)`). */
export function isValidWeekStartParam(value: unknown, today: string): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  const date = parseStrict(value);
  const todayDate = parseStrict(today);
  if (!date || !todayDate) {
    return false;
  }
  if (getWeekStart(date) !== value) {
    return false;
  }
  // ISO `YYYY-MM-DD` biçimi sözlüksel olarak da kronolojiktir.
  return value <= getWeekStart(todayDate);
}

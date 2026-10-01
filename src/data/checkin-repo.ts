/**
 * `checkin` tablosu icin repo (spec "Veri modeli" > `checkin`, "API
 * sozlesmesi", `plan.md` S5).
 *
 * **Duzenleme penceresi (bugun/dun) burada UYGULANMAZ** (spec S5
 * netlestirme #1): `saveCheckin` imzasi dondurulmus ve `now` parametresi
 * almiyor. "Bugun/dun" kisiti UI/uygulama katmaninin (S6/S7) sorumlulugu;
 * bu repo herhangi bir `localDate`'e sinirsiz upsert yapan saf bir depodur
 * -- bu bilincli bir tasarim, eksiklik degil.
 */
import { getDriver } from './db';
import type { Checkin } from '@/domain/types';

interface CheckinRow {
  local_date: string;
  movement: number;
  sleep: number;
  spending: number;
  social: number;
}

function rowToCheckin(row: CheckinRow): Checkin {
  return {
    localDate: row.local_date,
    movement: row.movement as Checkin['movement'],
    sleep: row.sleep as Checkin['sleep'],
    spending: row.spending as Checkin['spending'],
    social: row.social as Checkin['social'],
  };
}

/**
 * `c.localDate` icin upsert yapar (PRIMARY KEY = `local_date`, spec "her gun
 * en fazla 1 satir"). Ilk kayitta `created_at` = `updated_at` = simdiki an;
 * sonraki cagrilarda yalnizca deger sutunlari ve `updated_at` guncellenir,
 * `created_at` korunur. Herhangi bir tarih kisiti uygulamaz (yukaridaki not).
 */
export async function saveCheckin(c: Checkin): Promise<void> {
  const driver = getDriver();
  const now = Date.now();

  driver.run(
    `
    INSERT INTO checkin (local_date, movement, sleep, spending, social, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (local_date) DO UPDATE SET
      movement = excluded.movement,
      sleep = excluded.sleep,
      spending = excluded.spending,
      social = excluded.social,
      updated_at = excluded.updated_at
    `,
    [c.localDate, c.movement, c.sleep, c.spending, c.social, now, now]
  );
}

/**
 * `fromDate` <= `localDate` <= `toDate` (her ikisi de dahil, `YYYY-MM-DD`
 * lexicographic karsilastirma) araligindaki tum kayitlari, tarihe gore
 * artan sirada dondurur.
 */
export async function getCheckins(fromDate: string, toDate: string): Promise<Checkin[]> {
  const driver = getDriver();
  const rows = driver.all<CheckinRow>(
    `SELECT local_date, movement, sleep, spending, social
     FROM checkin
     WHERE local_date >= ? AND local_date <= ?
     ORDER BY local_date ASC`,
    [fromDate, toDate]
  );
  return rows.map(rowToCheckin);
}

/**
 * `localDate < beforeDate` olan tüm kayıtları döndürür (Kritik-1 düzeltmesi,
 * `domain/week.ts` `hasQualifiedWeekBefore` için — bkz. `docs/kararlar/
 * 2026-10-01-cekirdekten-once-kararlar.md` A8). Tarih sınırı yok; bir
 * kullanıcının tüm geçmişi büyüse de (aylarca kullanım) satır sayısı küçük
 * kalır (günde en fazla 1 satır), bu yüzden tek sorguda tüm geçmişi çekmek
 * v1.5 ölçeğinde performans sorunu yaratmaz.
 */
export async function getCheckinsBefore(beforeDate: string): Promise<Checkin[]> {
  const driver = getDriver();
  const rows = driver.all<CheckinRow>(
    `SELECT local_date, movement, sleep, spending, social
     FROM checkin
     WHERE local_date < ?
     ORDER BY local_date ASC`,
    [beforeDate]
  );
  return rows.map(rowToCheckin);
}

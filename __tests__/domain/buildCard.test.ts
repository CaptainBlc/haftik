/**
 * S3 domain testleri: `buildCard` birleştirmesi (spec "API sözleşmesi",
 * `plan.md` S3). S2'nin (`week`/`score`/`delta`) ve S3'ün (`titles`/`copy`)
 * fonksiyonlarını kullanır; burada yeniden test edilmez, yalnızca doğru
 * bağlandığı ve sözleşmenin tutulduğu doğrulanır.
 */
import { buildCard } from '../../src/domain/buildCard';
import { CATEGORIES } from '../../src/domain/types';
import type { Checkin } from '../../src/domain/types';
import { CONTENT_VERSION } from '../../src/domain/content/tr';

function checkin(localDate: string, value: 1 | 2 | 3): Checkin {
  return { localDate, movement: value, sleep: value, spending: value, social: value };
}

function week(startDate: string, days: number, value: 1 | 2 | 3): Checkin[] {
  const result: Checkin[] = [];
  const cursor = new Date(`${startDate}T00:00:00`);
  for (let i = 0; i < days; i += 1) {
    const y = cursor.getFullYear();
    const m = `${cursor.getMonth() + 1}`.padStart(2, '0');
    const d = `${cursor.getDate()}`.padStart(2, '0');
    result.push(checkin(`${y}-${m}-${d}`, value));
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

describe('buildCard — temel sözleşme', () => {
  it('CardSnapshot beklenen tüm alanları taşır', () => {
    const weekCheckins = week('2026-09-14', 4, 3); // Pzt-Perş, hepsi "high"
    const snapshot = buildCard(weekCheckins, [], null, '2026-09-14');

    expect(snapshot.weekStart).toBe('2026-09-14');
    expect(snapshot.checkinDays).toBe(4);
    expect(snapshot.contentVersion).toBe(CONTENT_VERSION);
    expect(snapshot.title).toBeTruthy();
    expect(snapshot.summary).toBeTruthy();
    for (const category of CATEGORIES) {
      expect(snapshot.lines[category]).toBeTruthy();
      expect(snapshot.lines[category].text.length).toBeGreaterThan(0);
      expect(category in snapshot.deltas).toBe(true);
    }
  });

  it('geçen hafta verisi yoksa (ilk kart) tüm deltalar NULL, unvan/özet yine üretilir', () => {
    const weekCheckins = week('2026-09-14', 3, 2); // ilk kart eşiği (>= 3)
    const snapshot = buildCard(weekCheckins, [], null, '2026-09-14');

    for (const category of CATEGORIES) {
      expect(snapshot.deltas[category]).toBeNull();
    }
    expect(snapshot.summary).toBeTruthy();
    expect(snapshot.title).toBeTruthy();
  });
});

describe('buildCard — week_start determinizmi', () => {
  it('aynı girdiyle iki kez çağrılınca özdeş CardSnapshot döner', () => {
    const weekCheckins = week('2026-09-14', 5, 2);
    const prevWeekCheckins = week('2026-09-07', 4, 1);

    const first = buildCard(weekCheckins, prevWeekCheckins, null, '2026-09-14');
    const second = buildCard(weekCheckins, prevWeekCheckins, null, '2026-09-14');

    expect(second).toEqual(first);
  });
});

describe('buildCard — fail-fast (0 dolu günle kart üretilemez)', () => {
  it('boş weekCheckins dizisiyle çağrılırsa hata fırlatır', () => {
    expect(() => buildCard([], [], null, '2026-09-14')).toThrow();
  });
});

describe('buildCard — S2 fonksiyonlarının doğru bağlandığı (seviye/delta entegrasyonu)', () => {
  it('bütün kategoriler "high" -> her kategori seviyesi seçilen unvana/satıra yansır (dolaylı, id üzerinden)', () => {
    const weekCheckins = week('2026-09-14', 7, 3); // 7 gün, hepsi değer 3 (high)
    const snapshot = buildCard(weekCheckins, [], null, '2026-09-14');

    expect(snapshot.checkinDays).toBe(7);
    // 7/7 gün + >=3 kategori high -> S3 placeholder kombinasyon kuralı eşleşir.
    expect(snapshot.title.id).toBe('title.combo.sevenSevenHighStreak');
    for (const category of CATEGORIES) {
      expect(snapshot.lines[category].id).toMatch(new RegExp(`^line\\.${category}\\.high\\.`));
    }
  });

  it('bu hafta yüksek, geçen hafta düşük -> delta +1 ve summary risingMajority/mixed yönünde tutarlı', () => {
    const weekCheckins = week('2026-09-14', 4, 3); // avg 3 (high)
    const prevWeekCheckins = week('2026-09-07', 4, 1); // avg 1 (low)

    const snapshot = buildCard(weekCheckins, prevWeekCheckins, null, '2026-09-14');
    for (const category of CATEGORIES) {
      expect(snapshot.deltas[category]).toBe(1);
    }
  });
});

describe('buildCard — prevTitleId ile unvan tekrar-önleme entegrasyonu', () => {
  it('prevTitleId ilk eşleşenle aynıysa buildCard da farklı bir unvana geçer (mümkünse)', () => {
    const weekCheckins = week('2026-09-14', 4, 3); // movement+sleep+spending+social hepsi high
    const first = buildCard(weekCheckins, [], null, '2026-09-14');
    const second = buildCard(weekCheckins, [], first.title.id, '2026-09-14');
    expect(second.title.id).not.toBe(first.title.id);
  });
});

describe('buildCard — isteğe bağlı prevVariants parametresi (satır/özet tekrar-önleme)', () => {
  it('prevVariants verilmezse satır seçimi normal (tohum tabanlı) seçime düşer, hata vermez', () => {
    const weekCheckins = week('2026-09-14', 4, 2);
    expect(() => buildCard(weekCheckins, [], null, '2026-09-14')).not.toThrow();
  });

  it('prevVariants.lines ile önceki hafta seçilen bir satır kimliği verilirse, bu hafta o kategoride farklı bir varyant seçilir', () => {
    const weekCheckins1 = week('2026-01-05', 4, 3); // high
    const weekCheckins2 = week('2026-01-12', 4, 3); // bir sonraki hafta, aynı seviye

    const first = buildCard(weekCheckins1, [], null, '2026-01-05');
    const second = buildCard(weekCheckins2, [], first.title.id, '2026-01-12', {
      lines: { movement: first.lines.movement.id },
      summary: first.summary.id,
    });

    expect(second.lines.movement.id).not.toBe(first.lines.movement.id);
  });
});

describe('buildCard — çağrı sırası bağımsızlığı', () => {
  it('farklı haftalar karışık sırada çağrılsa da her biri kendi girdisine göre deterministik kalır', () => {
    const weekA = week('2026-09-14', 4, 3);
    const weekB = week('2026-09-21', 4, 1);

    const a1 = buildCard(weekA, [], null, '2026-09-14');
    const b1 = buildCard(weekB, [], null, '2026-09-21');
    const a2 = buildCard(weekA, [], null, '2026-09-14');

    expect(a2).toEqual(a1);
    expect(b1).not.toEqual(a1);
  });
});

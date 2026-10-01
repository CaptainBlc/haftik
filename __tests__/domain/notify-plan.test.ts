/**
 * S8 — notify-plan (saf). Senaryo kimlikleri `evals/s8-bildirim-senaryolari.md`.
 * Ortak varsayım: TZ Europe/Istanbul, hatırlatma 21:00, hafta Pzt 2026-09-21..Paz 2026-09-27.
 */
import { NOTIFICATION_TEXTS } from '@/domain/content/notification-texts';
import { planNotifications, type PlannedNotification } from '@/domain/notify-plan';
import type { Checkin } from '@/domain/types';
import { getWeekState } from '@/domain/week';

function ci(localDate: string): Checkin {
  return { localDate, movement: 2, sleep: 2, spending: 2, social: 2 };
}

/** Hafta içinde ardışık `n` dolu gün (Pzt'den başlayarak). */
function filled(n: number, weekStartDay = 21, month = '09'): Checkin[] {
  return Array.from({ length: n }, (_, i) => ci(`2026-${month}-${String(weekStartDay + i).padStart(2, '0')}`));
}

const at = (s: string) => new Date(s); // yerel (Istanbul) çözümlenir

function plan(
  now: Date,
  opts: {
    checkins?: Checkin[];
    enabled?: boolean;
    time?: string;
    prior?: boolean;
  } = {}
): PlannedNotification[] {
  return planNotifications({
    now,
    checkins: opts.checkins ?? [],
    settings: { reminderEnabled: opts.enabled ?? true, reminderTime: opts.time ?? '21:00' },
    // Kritik-1 düzeltmesi (A8): eski `hasAnyPriorCard` parametre adı
    // `hasQualifiedWeekBefore` oldu (bkz. domain/week.ts); bu testteki
    // `opts.prior` anlamı/senaryoları değişmedi, yalnızca anahtar adı.
    hasQualifiedWeekBefore: opts.prior ?? true,
  });
}

const daily = (p: PlannedNotification[]) => p.filter((n) => n.kind === 'daily');
const cards = (p: PlannedNotification[]) => p.filter((n) => n.kind === 'card-ready');
const hhmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

describe('günlük hatırlatma', () => {
  it('N-01: bugün boş -> 7 gün, her biri 21:00', () => {
    const d = daily(plan(at('2026-09-23T12:00:00')));
    expect(d.map((n) => n.id)).toEqual([
      'daily-2026-09-23',
      'daily-2026-09-24',
      'daily-2026-09-25',
      'daily-2026-09-26',
      'daily-2026-09-27',
      'daily-2026-09-28',
      'daily-2026-09-29',
    ]);
    d.forEach((n) => expect(hhmm(n.fireAt)).toBe('21:00'));
  });

  it('N-02: bugün dolu -> bugün atlanır (6)', () => {
    const d = daily(plan(at('2026-09-23T12:00:00'), { checkins: [ci('2026-09-23')] }));
    expect(d).toHaveLength(6);
    expect(d[0].id).toBe('daily-2026-09-24');
  });

  it('N-03/N-04: 20:59:59 dahil, 21:00:00 hariç (eşitlik = geçmiş)', () => {
    expect(daily(plan(at('2026-09-23T20:59:59')))).toHaveLength(7);
    const d = daily(plan(at('2026-09-23T21:00:00')));
    expect(d).toHaveLength(6);
    expect(d[0].id).toBe('daily-2026-09-24');
  });

  it('N-05: 22:30 -> bugün yok, telafi yok', () => {
    const d = daily(plan(at('2026-09-23T22:30:00')));
    expect(d).toHaveLength(6);
    expect(d.some((n) => n.id === 'daily-2026-09-23')).toBe(false);
  });

  it('N-06: kapalıysa günlük yok', () => {
    expect(daily(plan(at('2026-09-23T12:00:00'), { enabled: false }))).toHaveLength(0);
  });

  it.each(['20:00', '07:30', '23:59'])('N-07: saat %s', (time) => {
    const d = daily(plan(at('2026-09-23T06:00:00'), { time }));
    expect(d).toHaveLength(7);
    d.forEach((n) => expect(hhmm(n.fireAt)).toBe(time));
  });

  it('N-07: 00:00 -> bugün geçmiş, 09-24 00:00 başlar', () => {
    const d = daily(plan(at('2026-09-23T12:00:00'), { time: '00:00' }));
    expect(d[0].id).toBe('daily-2026-09-24');
    expect(hhmm(d[0].fireAt)).toBe('00:00');
  });

  it.each(['', '25:99', '9:5', 'abc'])('N-08: bozuk saat %p -> 21:00', (time) => {
    const d = daily(plan(at('2026-09-23T12:00:00'), { time }));
    expect(d).toHaveLength(7);
    d.forEach((n) => expect(hhmm(n.fireAt)).toBe('21:00'));
  });

  it('N-09: deterministik (aynı girdi, aynı çıktı)', () => {
    const now = at('2026-09-23T12:00:00');
    const a = plan(now, { checkins: filled(4) });
    expect(plan(now, { checkins: filled(4) })).toEqual(a);
    expect(plan(now, { checkins: filled(4) })).toEqual(a);
  });

  it('N-10: check-in eklenince yalnızca bugün düşer, kalan id aynı', () => {
    const now = at('2026-09-23T12:00:00');
    const before = daily(plan(now)).map((n) => n.id);
    const after = daily(plan(now, { checkins: [ci('2026-09-23')] })).map((n) => n.id);
    expect(after).toEqual(before.filter((id) => id !== 'daily-2026-09-23'));
  });

  it('N-11: yalnızca BUGÜN dolu atlar (dün dolu, bugün boş -> bugün planlı)', () => {
    const d = daily(plan(at('2026-09-23T12:00:00'), { checkins: [ci('2026-09-22')] }));
    expect(d[0].id).toBe('daily-2026-09-23');
  });

  it('N-12: sönümlenme: gün 0 planı, gün 6 21:00 sonrası hiçbir bildirim kalmaz', () => {
    const p = plan(at('2026-09-23T12:00:00'));
    const last = Math.max(...p.map((n) => n.fireAt.getTime()));
    expect(last).toBeLessThanOrEqual(at('2026-09-29T21:00:00').getTime());
    // gün 8'de (yeniden plan yok) bekleyen plan öğesi geçmişte kalır
    const day8 = at('2026-10-01T12:00:00').getTime();
    expect(p.filter((n) => n.fireAt.getTime() > day8)).toHaveLength(0);
    expect(daily(p).length).toBeLessThanOrEqual(7);
  });

  it('N-13: toplam <= 8, fireAt artan sıralı', () => {
    const p = plan(at('2026-09-23T12:00:00'), { checkins: filled(5) });
    expect(p.length).toBeLessThanOrEqual(8);
    const times = p.map((n) => n.fireAt.getTime());
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });
});

describe('Pazar 20:00 kart hazır ve eşik', () => {
  const wed = at('2026-09-23T12:00:00');

  it('C-01..C-04: eşik 3 (ilk kart) / 4 (sonrası)', () => {
    expect(cards(plan(wed, { checkins: filled(3), prior: false }))).toHaveLength(1);
    expect(cards(plan(wed, { checkins: filled(2), prior: false }))).toHaveLength(0);
    expect(cards(plan(wed, { checkins: filled(3), prior: true }))).toHaveLength(0);
    const c = cards(plan(wed, { checkins: filled(4), prior: true }));
    expect(c).toHaveLength(1);
    expect(c[0].id).toBe('card-2026-09-27');
    expect(hhmm(c[0].fireAt)).toBe('20:00');
    expect(c[0].fireAt.getDate()).toBe(27);
  });

  it('C-05: tablo: C var <=> dolu >= (prior ? 4 : 3) ve getWeekState.thresholdMet ile eşit', () => {
    for (const prior of [false, true]) {
      for (let n = 0; n <= 7; n++) {
        const checkins = filled(n);
        const has = cards(plan(wed, { checkins, prior })).length === 1;
        expect(has).toBe(n >= (prior ? 4 : 3));
        expect(has).toBe(
          getWeekState({ weekStart: '2026-09-21', now: wed, checkins, hasQualifiedWeekBefore: prior })
            .thresholdMet
        );
      }
    }
  });

  it('C-06: Perşembe 22:00 4. gün kaydedildi -> C planlanır', () => {
    const now = at('2026-09-24T22:00:00');
    expect(cards(plan(now, { checkins: filled(3) }))).toHaveLength(0);
    expect(cards(plan(now, { checkins: filled(4) }))).toHaveLength(1);
  });

  it('C-07/C-09: Cmt 23:59:59 ve Paz 19:59:59 -> C var', () => {
    expect(cards(plan(at('2026-09-26T23:59:59'), { checkins: filled(4) }))).toHaveLength(1);
    expect(cards(plan(at('2026-09-27T19:59:59'), { checkins: filled(4) }))).toHaveLength(1);
  });

  it('C-08 (A13 ile güncellendi, 2026-10-01): Pazar 10:00 -> yalnız C 20:00, aynı gün D YOK, D Pzt..Cmt hafta 09-28', () => {
    // Eski davranış (artık yanlış kabul edildi): kartın planlandığı Pazar'da
    // hem card-ready (20:00) hem daily (21:00) planlanıyordu — aynı akşam,
    // Doze/pil yönetimi yüzünden ters sırada bile gelebiliyordu
    // (04-kod-incelemesi.md #11, Ç24). A13 kararı: o gün daily YOK.
    const p = plan(at('2026-09-27T10:00:00'), { checkins: filled(4) });
    expect(cards(p)).toHaveLength(1);
    expect(cards(p)[0].weekStart).toBe('2026-09-21');
    const ids = daily(p).map((n) => n.id);
    expect(ids).toEqual([
      // 'daily-2026-09-27' artık YOK (A13): o gün yalnız card-ready var.
      'daily-2026-09-28',
      'daily-2026-09-29',
      'daily-2026-09-30',
      'daily-2026-10-01',
      'daily-2026-10-02',
      'daily-2026-10-03',
    ]);
  });

  it('C-10: Pazar 20:00:00 ve 20:30 -> C yok', () => {
    expect(cards(plan(at('2026-09-27T20:00:00'), { checkins: filled(4) }))).toHaveLength(0);
    expect(cards(plan(at('2026-09-27T20:30:00'), { checkins: filled(4) }))).toHaveLength(0);
  });

  it('C-11: Pazar 15:00, 3 dolu (prior) -> C yok; bugün kaydedilince C var, Paz D atlanır', () => {
    const now = at('2026-09-27T15:00:00');
    expect(cards(plan(now, { checkins: filled(3) }))).toHaveLength(0);
    const after = plan(now, { checkins: [...filled(3), ci('2026-09-27')] });
    expect(cards(after)).toHaveLength(1);
    expect(daily(after).some((n) => n.id === 'daily-2026-09-27')).toBe(false);
  });

  it('C-12/C-13 (A13 ile güncellendi, 2026-10-01): kartın planlandığı Pazar\'da daily hiç yok, hatırlatma saati ne olursa olsun', () => {
    // Eski davranış: aynı gün hem card hem daily planlanıyor, hatta saatleri
    // çakışabiliyordu (ör. ikisi de 20:00). Ç24/A13: o gün daily hiç kurulmaz,
    // bu yüzden artık bir "çakışma" senaryosu YOK -- bunu ispatlıyoruz.
    const now = at('2026-09-27T15:00:00');
    const p19 = plan(now, { checkins: filled(4), time: '19:00' });
    expect(p19.some((n) => n.id === 'daily-2026-09-27')).toBe(false);
    expect(cards(p19)).toHaveLength(1);
    const p20 = plan(now, { checkins: filled(4), time: '20:00' });
    expect(p20.some((n) => n.id === 'daily-2026-09-27')).toBe(false);
    expect(cards(p20)).toHaveLength(1);
  });

  it.each(['20:01', '19:59', '20:30', '22:00'])('C-14: C saati hatırlatma (%s) saatinden bağımsız', (time) => {
    const c = cards(plan(at('2026-09-27T15:00:00'), { checkins: filled(4), time }));
    expect(hhmm(c[0].fireAt)).toBe('20:00');
  });

  it('K-1: hatırlatma kapalıyken C yine planlanır', () => {
    const p = plan(wed, { checkins: filled(4), enabled: false });
    expect(daily(p)).toHaveLength(0);
    expect(cards(p)).toHaveLength(1);
  });

  it('C-15/C-16: Pazartesi 00:00 -> yeni hafta, geçmiş hafta için bildirim yok; sınırda boşluk/çift yok', () => {
    const checkins = filled(4);
    expect(cards(plan(at('2026-09-27T23:59:59'), { checkins }))).toHaveLength(0);
    const mon = plan(at('2026-09-28T00:00:00'), { checkins });
    expect(cards(mon)).toHaveLength(0);
  });

  it('C-17: önceki haftanın günü sayıya girmez', () => {
    const checkins = [ci('2026-09-20'), ci('2026-09-21'), ci('2026-09-22'), ci('2026-09-23')];
    expect(cards(plan(wed, { checkins }))).toHaveLength(0); // 3 bu hafta < 4
  });

  it('C-18: aynı localDate iki kayıt tek gün sayılır', () => {
    const checkins = [ci('2026-09-21'), ci('2026-09-21'), ci('2026-09-22'), ci('2026-09-23')];
    expect(cards(plan(wed, { checkins }))).toHaveLength(0);
  });

  it('C-19: yıl/ay sınırı: hafta Pzt 12-28 .. Paz 2027-01-03', () => {
    const now = at('2026-12-31T12:00:00');
    const checkins = ['2026-12-28', '2026-12-29', '2026-12-30'].map(ci);
    const p = plan(now, { checkins, prior: false });
    expect(cards(p)[0].id).toBe('card-2027-01-03');
    // A13 (2026-10-01): kartın planlandığı 'daily-2027-01-03' artık listede yok.
    expect(daily(p).map((n) => n.id)).toEqual([
      'daily-2026-12-31',
      'daily-2027-01-01',
      'daily-2027-01-02',
      'daily-2027-01-04',
      'daily-2027-01-05',
      'daily-2027-01-06',
    ]);
    const month = daily(plan(at('2026-09-29T12:00:00'))).map((n) => n.id);
    expect(month).toContain('daily-2026-09-30');
    expect(month).toContain('daily-2026-10-01');
  });

  it('C-20: eşik düştüğünde yeni planda C yok', () => {
    expect(cards(plan(wed, { checkins: filled(4) }))).toHaveLength(1);
    expect(cards(plan(wed, { checkins: filled(3) }))).toHaveLength(0);
  });

  it('H-01: hasAnyPriorCard değişince 3 dolu günde C kalkar', () => {
    expect(cards(plan(wed, { checkins: filled(3), prior: false }))).toHaveLength(1);
    expect(cards(plan(wed, { checkins: filled(3), prior: true }))).toHaveLength(0);
  });
});

describe('saat dilimi / DST', () => {
  const originalTZ = process.env.TZ;
  afterEach(() => {
    process.env.TZ = originalTZ;
  });

  function tzEffective(tz: string): boolean {
    const before = process.env.TZ;
    process.env.TZ = tz;
    // 2026-07-01T12:00Z: New York UTC-4 => 08:00; Istanbul 15:00.
    const expected: Record<string, number> = { 'America/New_York': 8, 'Europe/Berlin': 14 };
    const ok = new Date('2026-07-01T12:00:00Z').getHours() === expected[tz];
    if (before === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = before;
    }
    return ok;
  }

  // Çalışma zamanı TZ değişimi etkili değilse test "geçti" DEĞİL "skipped"
  // raporlanır (sahte geçiş yok).
  const itNY = tzEffective('America/New_York') ? it : it.skip;
  const itBerlin = tzEffective('Europe/Berlin') ? it : it.skip;

  it('T-01: Istanbul 7 gün, her D arası tam 24 saat', () => {
    const d = daily(plan(at('2026-09-23T12:00:00')));
    for (let i = 1; i < d.length; i++) {
      expect(d[i].fireAt.getTime() - d[i - 1].fireAt.getTime()).toBe(24 * 3600 * 1000);
    }
  });

  itNY('T-02/T-03: aynı an, farklı bölge (çalışma zamanı TZ değişimi etkiliyse)', () => {
    const checkins = filled(4);
    const instant1 = new Date('2026-09-27T16:59:00Z');
    process.env.TZ = 'Europe/Istanbul';
    const ist = cards(plan(instant1, { checkins }));
    process.env.TZ = 'America/New_York';
    const ny = cards(plan(instant1, { checkins }));
    expect(ist).toHaveLength(1);
    expect(ny).toHaveLength(1);
    expect(ist[0].fireAt.toISOString()).toBe('2026-09-27T17:00:00.000Z');
    expect(ny[0].fireAt.toISOString()).toBe('2026-09-28T00:00:00.000Z');

    const instant2 = new Date('2026-09-27T22:30:00Z');
    process.env.TZ = 'Europe/Istanbul';
    expect(cards(plan(instant2, { checkins }))).toHaveLength(0);
    process.env.TZ = 'America/New_York';
    expect(cards(plan(instant2, { checkins }))).toHaveLength(1);
  });

  itBerlin('T-04: cihaz saat dilimi değişince D yeni yerel 21:00, id aynı', () => {
    process.env.TZ = 'Europe/Istanbul';
    const now = new Date('2026-09-23T09:00:00Z');
    const a = daily(plan(now));
    process.env.TZ = 'Europe/Berlin';
    const b = daily(plan(now));
    expect(b.map((n) => n.id)).toEqual(a.map((n) => n.id));
    expect(b[0].fireAt.toISOString()).toBe('2026-09-23T19:00:00.000Z');
    expect(a[0].fireAt.toISOString()).toBe('2026-09-23T18:00:00.000Z');
  });

  itNY('T-05..T-07: New York DST günlerinde gün başına tam 1 bildirim, çökmez', () => {
    process.env.TZ = 'America/New_York';
    const fall = daily(plan(new Date(2026, 10, 1 - 3, 12, 0), {}));
    expect(new Set(fall.map((n) => n.id)).size).toBe(fall.length);
    expect(fall).toHaveLength(7);
    const springNow = new Date(2026, 2, 7, 12, 0);
    const spring = daily(plan(springNow, { time: '02:30' }));
    const dst = spring.filter((n) => n.id === 'daily-2026-03-08');
    expect(dst).toHaveLength(1);
    const ambiguous = daily(plan(new Date(2026, 10, 1 - 1, 12, 0), { time: '01:30' })).filter(
      (n) => n.id === 'daily-2026-11-01'
    );
    expect(ambiguous).toHaveLength(1);
  });

  it('T-09: geçersiz now -> []', () => {
    expect(plan(new Date(NaN))).toEqual([]);
  });
});

describe('metin içeriği (güvenlik gereksinimi 4)', () => {
  const all = Object.values(NOTIFICATION_TEXTS).flatMap((t) => [t.title, t.body]);

  it('X-01: rakam, seviye, kategori adı yok', () => {
    for (const text of all) {
      expect(text).not.toMatch(/\d/);
      expect(text.toLowerCase()).not.toMatch(
        /düşük|orta|yüksek|uyku|mod\b|enerji|harcama|hareket|sosyal|seri|kaç gün|unvan/
      );
    }
  });

  it('X-04: kart metni yalnızca "hazır" düzeyinde', () => {
    expect(NOTIFICATION_TEXTS['card-ready'].title.toLowerCase()).toContain('hazır');
  });

  it('X-02/X-03: plan çıktısı girdiden bağımsız yalnızca kind + weekStart taşır', () => {
    const p = plan(at('2026-09-23T12:00:00'), { checkins: filled(4) });
    for (const n of p) {
      expect(Object.keys(n).sort()).toEqual(['fireAt', 'id', 'kind', 'weekStart']);
    }
  });
});

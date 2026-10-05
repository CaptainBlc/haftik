/**
 * S22: Kaydet anı türünü seçen saf karar (18 §2.5, 19 §3.2). Hafta: Pzt 2026-09-28 .. Paz 2026-10-04.
 * Eşik: ilk kartta 3, nitelikli bir hafta geçtikten sonra 4 (`getWeekState`).
 */
import { decideSaveFeedback, getSaveFeedback, type SaveFeedbackInput } from '@/lib/save-feedback';
import type { Checkin } from '@/domain/types';

const MON = '2026-09-28';

function ci(localDate: string): Checkin {
  return { localDate, movement: 2, sleep: 2, spending: 2, social: 2 };
}

/** Bu haftaya `dates` günlerini yazılmış hâlde kurar. */
function input(over: Partial<SaveFeedbackInput> & { dates: string[]; savedDate: string }): SaveFeedbackInput {
  const { dates, savedDate, ...rest } = over;
  const after = dates.map(ci);
  const before = after.filter((c) => c.localDate !== savedDate || rest.wasEdit);
  return {
    savedDate,
    today: savedDate,
    wasEdit: false,
    fromK3: false,
    historyBefore: before,
    checkinsAfter: after,
    now: new Date(`${savedDate}T10:00:00`),
    ...rest,
  };
}

describe('decideSaveFeedback', () => {
  it('A: tüm geçmişte ilk kayıt', () => {
    const d = decideSaveFeedback(input({ dates: [MON], savedDate: MON }));
    expect(d.kind).toBe('first');
  });

  it('C: ilk kart (3 gerekli), 2 dolu -> kalan 1', () => {
    const r = decideSaveFeedback(input({ dates: ['2026-09-28', '2026-09-29'], savedDate: '2026-09-29' }));
    expect(r).toMatchObject({ kind: 'oneLeft', remaining: 1 });
  });

  it('B ve C: nitelikli hafta sonrası eşik 4; kalan >= 2 ise below, kalan 1 ise oneLeft', () => {
    // Geçmişte 3 dolu günlü bir hafta var -> bu hafta 4 gün gerekir.
    const prior = ['2026-09-21', '2026-09-22', '2026-09-23'];
    const mk = (dates: string[], savedDate: string) => decideSaveFeedback(input({ dates: [...prior, ...dates], savedDate }));
    expect(mk(['2026-09-28', '2026-09-29'], '2026-09-29')).toMatchObject({ kind: 'below', remaining: 2 });
    expect(mk(['2026-09-28', '2026-09-29', '2026-09-30'], '2026-09-30')).toMatchObject({ kind: 'oneLeft', remaining: 1 });
  });

  it('D: eşik bu kayıtla doldu (ilk kart, 3. gün)', () => {
    const r = decideSaveFeedback(input({ dates: ['2026-09-28', '2026-09-29', '2026-09-30'], savedDate: '2026-09-30' }));
    expect(r.kind).toBe('thresholdReached');
    expect(r.weekState.thresholdMet).toBe(true);
  });

  it('E: eşik sonrası ek gün (ilk kart, 4. gün)', () => {
    const r = decideSaveFeedback(
      input({ dates: ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01'], savedDate: '2026-10-01' })
    );
    expect(r.kind).toBe('extraDay');
  });

  it('F: 7/7, Pazar 20:00 öncesi', () => {
    const dates = ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'];
    const r = decideSaveFeedback(input({ dates, savedDate: '2026-10-04', now: new Date('2026-10-04T15:00:00') }));
    expect(r.kind).toBe('fullWeek');
  });

  it('Pazar 20:00 SONRASI normal kayıt gelecek kart iddiası taşımaz: neutral', () => {
    const dates = ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-04'];
    const r = decideSaveFeedback(input({ dates, savedDate: '2026-10-04', now: new Date('2026-10-04T21:00:00') }));
    expect(r.kind).toBe('neutral');
  });

  it('G: aynı günün kaydı güncellendi (diğer koşullardan önce)', () => {
    const r = decideSaveFeedback(input({ dates: ['2026-09-28', '2026-09-29'], savedDate: '2026-09-29', wasEdit: true }));
    expect(r.kind).toBe('updated');
  });

  it('Y: dünün kaydı', () => {
    const r = decideSaveFeedback(
      input({ dates: ['2026-09-28', '2026-09-29'], savedDate: '2026-09-28', today: '2026-09-29' })
    );
    expect(r.kind).toBe('yesterday');
  });

  it('H: K3 devamı her şeyden önce gelir', () => {
    const r = decideSaveFeedback(input({ dates: ['2026-10-04'], savedDate: '2026-10-04', fromK3: true }));
    expect(r.kind).toBe('sundayK3');
  });

  it('I: 4+ gün aradan sonra yeni haftanın ilk kaydı -> return', () => {
    // Son kayıt 2026-09-24 (Per), bugün Pzt 2026-09-28 = 4 gün sonra, haftanın ilk kaydı.
    const r = decideSaveFeedback({
      savedDate: '2026-09-28',
      today: '2026-09-28',
      wasEdit: false,
      fromK3: false,
      historyBefore: [{ localDate: '2026-09-22' }, { localDate: '2026-09-24' }],
      checkinsAfter: ['2026-09-22', '2026-09-24', '2026-09-28'].map(ci),
      now: new Date('2026-09-28T10:00:00'),
    });
    expect(r.kind).toBe('return');
  });

  it('I değil: 3 gün aradan sonra (eşik 4) ya da haftanın ilk kaydı değilse', () => {
    const base = {
      today: '2026-09-28',
      wasEdit: false,
      fromK3: false,
      now: new Date('2026-09-28T10:00:00'),
    };
    const threeDays = decideSaveFeedback({
      ...base,
      savedDate: '2026-09-28',
      historyBefore: [{ localDate: '2026-09-25' }],
      checkinsAfter: ['2026-09-25', '2026-09-28'].map(ci),
    });
    expect(threeDays.kind).not.toBe('return');
    const secondOfWeek = decideSaveFeedback({
      ...base,
      today: '2026-09-29',
      savedDate: '2026-09-29',
      now: new Date('2026-09-29T10:00:00'),
      historyBefore: [{ localDate: '2026-09-20' }, { localDate: '2026-09-28' }],
      checkinsAfter: ['2026-09-20', '2026-09-28', '2026-09-29'].map(ci),
    });
    expect(secondOfWeek.kind).not.toBe('return');
  });

  it('seviye/kategori değerleri karara etki etmez (aynı günler, farklı emojiler: aynı tür)', () => {
    const a = ['2026-09-28', '2026-09-29', '2026-09-30'];
    const low = a.map((d) => ({ ...ci(d), movement: 1 as const, sleep: 1 as const }));
    const high = a.map((d) => ({ ...ci(d), movement: 3 as const, spending: 3 as const }));
    const run = (rows: Checkin[]) =>
      decideSaveFeedback({
        savedDate: '2026-09-30',
        today: '2026-09-30',
        wasEdit: false,
        fromK3: false,
        historyBefore: rows.slice(0, 2),
        checkinsAfter: rows,
        now: new Date('2026-09-30T10:00:00'),
      }).kind;
    expect(run(low)).toBe(run(high));
  });
});

describe('getSaveFeedback', () => {
  it('B için kalan gün metne işlenir, {r} kalmaz', () => {
    const prior = ['2026-09-21', '2026-09-22', '2026-09-23'];
    const { kind, text } = getSaveFeedback(
      input({ dates: [...prior, '2026-09-28', '2026-09-29'], savedDate: '2026-09-29' })
    );
    expect(kind).toBe('below');
    expect(text).not.toContain('{r}');
    expect(text).toMatch(/2/);
  });
});

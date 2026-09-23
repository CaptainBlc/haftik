import { getCard, saveCard, hasAnyPriorCard } from '@/data/card-repo';
import { getDriver } from '@/data/db';
import type { CardSnapshot } from '@/domain/types';
import { setupTestDb } from '../helpers/setup-test-db';

function makeCard(overrides: Partial<CardSnapshot> = {}): CardSnapshot {
  return {
    weekStart: '2026-09-21',
    checkinDays: 5,
    title: { id: 'title.movement.high', text: 'Enerji canavari', basedOnCategories: ['movement'] },
    lines: {
      movement: { id: 'movement.high.1', text: 'Bu hafta hic durmadin.' },
      sleep: { id: 'sleep.medium.1', text: 'Idare eden bir uyku haftasi.' },
      spending: { id: 'spending.low.1', text: 'Cuzdanina iyi davrandin.' },
      social: { id: 'social.medium.1', text: 'Ne fazla ne az, tam kivaminda.' },
    },
    deltas: { movement: 1, sleep: 0, spending: null, social: -1 },
    summary: { id: 'summary.mixed.1', text: 'Bu hafta karisik gecti.' },
    contentVersion: 1,
    ...overrides,
  };
}

describe('card-repo', () => {
  setupTestDb();

  it('bir kart kaydeder ve geri okur (title.basedOnCategories dahil eksiksiz round-trip)', async () => {
    const card = makeCard();
    await saveCard(card);

    const loaded = await getCard('2026-09-21');
    expect(loaded).toEqual(card);
  });

  it('hic kart yoksa null doner', async () => {
    const loaded = await getCard('2026-09-21');
    expect(loaded).toBeNull();
  });

  it('saveCard ikinci cagrisi NO-OP: var olan kayit degismez, hata firlatmaz (spec S5 netlestirme #2)', async () => {
    const first = makeCard({ title: { id: 't1', text: 'Ilk metin', basedOnCategories: [] } });
    await saveCard(first);

    const second = makeCard({ title: { id: 't2', text: 'Ikinci (farkli) metin', basedOnCategories: ['sleep'] } });
    await expect(saveCard(second)).resolves.toBeUndefined();

    const loaded = await getCard('2026-09-21');
    expect(loaded?.title).toEqual({ id: 't1', text: 'Ilk metin', basedOnCategories: [] });
  });

  it('saveCard degismezligi: icerik havuzu "degisse" bile (baska bir CardSnapshot ile tekrar cagrilsa) dondurulmus kart aynen kalir', async () => {
    const original = makeCard();
    await saveCard(original);

    // Ayni hafta icin tamamen farkli bir snapshot ile tekrar dene (ornegin
    // content_version yukseltilmis olsaydi ne olurdu senaryosu).
    await saveCard(makeCard({ contentVersion: 2, summary: { id: 'x', text: 'y', }, }));

    const loaded = await getCard('2026-09-21');
    expect(loaded).toEqual(original);
  });

  it('generated_at yalnizca ilk kayitta uretilir (no-op cagrida degismez) -- dolayli olarak zaman gecince satir sayisi 1 kalir', async () => {
    await saveCard(makeCard());
    await saveCard(makeCard());

    const driver = getDriver();
    const count = driver.get<{ c: number }>(
      'SELECT COUNT(*) as c FROM weekly_card WHERE week_start = ?',
      ['2026-09-21']
    );
    expect(count?.c).toBe(1);
  });

  it('farkli weekStart icin ayri kayitlar tutulur (PRIMARY KEY week_start)', async () => {
    await saveCard(makeCard({ weekStart: '2026-09-14' }));
    await saveCard(makeCard({ weekStart: '2026-09-21' }));

    expect(await getCard('2026-09-14')).not.toBeNull();
    expect(await getCard('2026-09-21')).not.toBeNull();
  });

  it('delta NULL degerini dogru sekilde saklar ve geri okur', async () => {
    await saveCard(makeCard({ deltas: { movement: null, sleep: null, spending: null, social: null } }));
    const loaded = await getCard('2026-09-21');
    expect(loaded?.deltas).toEqual({ movement: null, sleep: null, spending: null, social: null });
  });

  it('weekly_card.delta_* icin SQLite CHECK kisiti (-1,0,1,NULL disi reddedilir, spec S5 netlestirme #3)', () => {
    const driver = getDriver();
    expect(() =>
      driver.run(
        `INSERT INTO weekly_card (
          week_start, generated_at, checkin_days, title_id, title_text, title_based_on_categories,
          line_movement_id, line_movement_text, line_sleep_id, line_sleep_text,
          line_spending_id, line_spending_text, line_social_id, line_social_text,
          delta_movement, delta_sleep, delta_spending, delta_social,
          summary_id, summary_text, content_version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          '2026-09-21', 1000, 5, 't', 't', '[]',
          'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l',
          2, 0, 0, 0, // delta_movement = 2 -> CHECK ihlali
          's', 's', 1,
        ]
      )
    ).toThrow();
  });

  it('hasAnyPriorCard bosken false doner', async () => {
    expect(await hasAnyPriorCard()).toBe(false);
  });

  it('hasAnyPriorCard bir kart kaydedildikten sonra true doner', async () => {
    await saveCard(makeCard());
    expect(await hasAnyPriorCard()).toBe(true);
  });
});

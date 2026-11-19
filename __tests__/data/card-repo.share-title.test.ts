/**
 * Paylaşım unvanı/özeti kalıcılığı (v4; karar kaydı `docs/kararlar/2026-11-19-paylasim-unvani-tasarim.md`):
 * round-trip, v3 -> v4 yükseltme (eski kart bozulmaz, geriye doldurma yok), kesintide geri alma,
 * bozuk veride güvenli yön.
 */
import { getCard, saveCard } from '@/data/card-repo';
import { getDriver, resetDriver, setDriver } from '@/data/db';
import { applyMigrations, MIGRATIONS, runMigrations } from '@/data/migrations';
import type { CardSnapshot } from '@/domain/types';
import { createNodeSqliteDriver } from '../helpers/node-sqlite-driver';
import { setupTestDb } from '../helpers/setup-test-db';

function makeCard(overrides: Partial<CardSnapshot> = {}): CardSnapshot {
  return {
    weekStart: '2026-11-02',
    checkinDays: 5,
    title: { id: 'title.basic.social.high', text: 'Sosyal Kelebek', basedOnCategories: ['social'] },
    lines: {
      movement: { id: 'movement.high.1', text: 'm' },
      sleep: { id: 'sleep.medium.1', text: 's' },
      spending: { id: 'spending.low.1', text: 'p' },
      social: { id: 'social.medium.1', text: 'o' },
    },
    deltas: { movement: 1, sleep: 0, spending: null, social: -1 },
    summary: { id: 'summary.balancedMixed.1', text: 'Karışık' },
    contentVersion: 3,
    ...overrides,
  };
}

describe('card-repo: paylaşım unvanı/özeti', () => {
  setupTestDb();

  it('paylaşım unvanı ve özeti round-trip: kapsam unvan ve özet için ortak saklanır', async () => {
    const card = makeCard({
      shareTitle: { id: 'title.combo.movementSocialBothHigh', text: 'Koşan Sosyalite', scope: ['movement', 'social'] },
      shareSummary: { id: 'summary.risingMajority.1', text: 'Hız kazandı', scope: ['movement', 'social'] },
    });
    await saveCard(card);
    expect(await getCard('2026-11-02')).toEqual(card);
  });

  it('paylaşım alanı olmayan kart (v4 öncesi şekli) okununca anahtarlar HİÇ eklenmez; SQL NULL yazılır', async () => {
    await saveCard(makeCard());
    const loaded = await getCard('2026-11-02');
    expect(loaded).not.toHaveProperty('shareTitle');
    expect(loaded).not.toHaveProperty('shareSummary');

    const row = getDriver().get<Record<string, unknown>>(
      'SELECT share_title_id, share_title_text, share_title_scope, share_summary_id, share_summary_text FROM weekly_card'
    );
    expect(row).toEqual({
      share_title_id: null,
      share_title_text: null,
      share_title_scope: null, // JSON "null" dizesi değil, gerçek NULL
      share_summary_id: null,
      share_summary_text: null,
    });
  });

  it('yalnız özet varsa kapsam özetin kapsamından yazılır', async () => {
    const card = makeCard({
      shareSummary: { id: 'summary.allStable.1', text: 'Sabit', scope: ['movement', 'social'] },
    });
    await saveCard(card);
    const loaded = await getCard('2026-11-02');
    expect(loaded?.shareSummary).toEqual(card.shareSummary);
    expect(loaded).not.toHaveProperty('shareTitle');
  });

  it.each([
    ['bozuk JSON', '{not json'],
    ['dizi değil', '"movement"'],
    ['boş dizi', '[]'],
    ['bilinmeyen kategori', '["movement","hacker"]'],
    ['JSON null dizesi', 'null'],
  ])('bozuk kapsam (%s): paylaşım alanları "yok" sayılır, çökmez, unvan ASLA görünür olmaz', async (_name, scope) => {
    await saveCard(
      makeCard({
        shareTitle: { id: 'title.combo.movementSocialBothHigh', text: 'Koşan Sosyalite', scope: ['movement', 'social'] },
        shareSummary: { id: 'summary.risingMajority.1', text: 'Hız kazandı', scope: ['movement', 'social'] },
      })
    );
    getDriver().run('UPDATE weekly_card SET share_title_scope = ?', [scope]);
    const loaded = await getCard('2026-11-02');
    expect(loaded).not.toBeNull();
    expect(loaded).not.toHaveProperty('shareTitle');
    expect(loaded).not.toHaveProperty('shareSummary');
  });
});

describe('migration v4: v3 -> v4 yükseltme', () => {
  afterEach(() => {
    resetDriver();
  });

  const v3 = MIGRATIONS.filter((m) => m.version <= 3);

  function insertLegacyCard(): void {
    getDriver().run(
      `INSERT INTO weekly_card (
         week_start, generated_at, checkin_days, title_id, title_text, title_based_on_categories,
         line_movement_id, line_movement_text, line_sleep_id, line_sleep_text,
         line_spending_id, line_spending_text, line_social_id, line_social_text,
         delta_movement, delta_sleep, delta_spending, delta_social,
         summary_id, summary_text, content_version
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['2026-10-26', 1, 4, 'title.basic.movement.high', 'Koşu Bandı Kıskandı', '["movement"]',
        'a', 'a', 'b', 'b', 'c', 'c', 'd', 'd', 1, 0, 0, 0, 'summary.allStable.1', 'x', 2]
    );
  }

  it('v3 fikstüründen v4: eski kart bozulmadan okunur, paylaşım alanı YOK (geriye doldurma yapılmaz)', async () => {
    setDriver(createNodeSqliteDriver(), { skipMigrations: true });
    applyMigrations(getDriver(), v3);
    expect(getDriver().getUserVersion()).toBe(3);
    insertLegacyCard();

    runMigrations(getDriver());
    expect(getDriver().getUserVersion()).toBe(4);

    const columns = getDriver()
      .all<{ name: string }>('PRAGMA table_info(weekly_card)')
      .map((c) => c.name);
    expect(columns).toEqual(
      expect.arrayContaining([
        'share_title_id', 'share_title_text', 'share_title_scope', 'share_summary_id', 'share_summary_text',
      ])
    );

    const card = await getCard('2026-10-26');
    expect(card?.title.text).toBe('Koşu Bandı Kıskandı');
    expect(card).not.toHaveProperty('shareTitle');
    expect(card).not.toHaveProperty('shareSummary');
  });

  it('kesinti: v4 yarıda patlarsa ROLLBACK, user_version 3 kalır ve hiçbir sütun kalıcı olmaz', () => {
    setDriver(createNodeSqliteDriver(), { skipMigrations: true });
    const driver = getDriver();
    applyMigrations(driver, v3);

    const broken = {
      version: 4,
      description: 'bozuk v4 (kesinti simülasyonu)',
      up: (d: typeof driver) => {
        d.exec('ALTER TABLE weekly_card ADD COLUMN share_title_id TEXT;');
        d.exec('ALTER TABLE weekly_card ADD COLUMN share_title_text TEXT;');
        throw new Error('kesinti');
      },
    };
    expect(() => applyMigrations(driver, [...v3, broken])).toThrow('kesinti');
    expect(driver.getUserVersion()).toBe(3);
    const columns = driver.all<{ name: string }>('PRAGMA table_info(weekly_card)').map((c) => c.name);
    expect(columns).not.toContain('share_title_id');
    expect(columns).not.toContain('share_title_text');

    // Gerçek v4 temiz yeniden çalışır.
    runMigrations(driver);
    expect(driver.getUserVersion()).toBe(4);
  });

  it('v4 idempotent: ikinci runMigrations hata fırlatmaz', () => {
    setDriver(createNodeSqliteDriver(), { skipMigrations: true });
    runMigrations(getDriver());
    expect(() => runMigrations(getDriver())).not.toThrow();
    expect(getDriver().getUserVersion()).toBe(4);
  });
});

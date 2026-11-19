/**
 * Paylaşım unvanı/özeti kural ve görüntü testleri (S21; karar kaydı
 * `docs/kararlar/2026-11-19-paylasim-unvani-tasarim.md`). Girişim-sızmazlığın kendisi:
 * `share-title.noninterference.test.ts`.
 */
import { TITLE_TEXTS } from '@/domain/content/tr';
import {
  SHARE_SCOPE,
  resolveVisibleSummary,
  resolveVisibleTitle,
  selectShareSummary,
  selectShareTitle,
} from '@/domain/share-title';
import type { CardSnapshot, Category, Delta, Level } from '@/domain/types';
import { CATEGORIES } from '@/domain/types';

const LEVELS: readonly Level[] = ['low', 'medium', 'high'];
const NO_DELTAS = { movement: null, social: null } as const;

function title(
  movement: Level,
  social: Level,
  extra: { checkinDays?: number; deltas?: Record<'movement' | 'social', Delta>; prev?: string | null } = {}
) {
  return selectShareTitle({
    levels: { movement, social },
    deltas: extra.deltas ?? NO_DELTAS,
    checkinDays: extra.checkinDays ?? 4,
    prevShareTitleId: extra.prev ?? null,
  });
}

describe('selectShareTitle: taban (9 durum, hareket x sosyal)', () => {
  const EXPECTED: Record<string, string> = {
    'high.high': 'title.combo.movementSocialBothHigh',
    'high.medium': 'title.basic.movement.high',
    'high.low': 'title.combo.movementHighSocialLow',
    'medium.high': 'title.basic.social.high',
    'medium.medium': 'title.basic.movement.medium',
    'medium.low': 'title.basic.social.low',
    'low.high': 'title.combo.socialHighMovementLow',
    'low.medium': 'title.basic.movement.low',
    'low.low': 'title.combo.movementSocialBothLow',
  };

  it.each(Object.entries(EXPECTED))('%s -> %s', (key, id) => {
    const [m, s] = key.split('.') as [Level, Level];
    const result = title(m, s);
    expect(result.id).toBe(id);
    expect(result.text).toBe(TITLE_TEXTS[id]);
  });

  it('9 durumun hepsi bir unvan üretir (boşluk yok) ve kapsam her zaman [movement, social]', () => {
    for (const m of LEVELS) {
      for (const s of LEVELS) {
        const result = title(m, s);
        expect(result.text.length).toBeGreaterThan(0);
        expect(result.scope).toEqual(['movement', 'social']);
      }
    }
  });

  it('onaylı iki yeni metin (Batuhan, 2026-11-19)', () => {
    expect(TITLE_TEXTS['title.combo.movementHighSocialLow']).toBe('Kulaklıkla Koşan Hafta');
    expect(TITLE_TEXTS['title.combo.socialHighMovementLow']).toBe('Az Adım, Çok Muhabbet');
  });

  it('orta-orta hücresi iki unvanlı havuzdur: ardışık haftada rotasyon', () => {
    const first = title('medium', 'medium');
    const second = title('medium', 'medium', { prev: first.id });
    expect(second.id).not.toBe(first.id);
    expect(new Set([first.id, second.id])).toEqual(
      new Set(['title.basic.movement.medium', 'title.basic.social.medium'])
    );
  });

  it('tek unvanlı hücrede geçen haftayla aynıysa yine aynısı döner (boş dönmez, hata fırlatmaz)', () => {
    const first = title('high', 'high');
    expect(title('high', 'high', { prev: first.id }).id).toBe(first.id);
  });
});

describe('selectShareTitle: öncelik sıralı özel kurallar (Karar 4)', () => {
  it('7/7 gün ve ikisi de yüksek -> Hiç Boş Bırakmayan Hafta', () => {
    expect(title('high', 'high', { checkinDays: 7 }).id).toBe('title.combo.sevenSevenHighStreak');
  });

  it('7/7 gün ve ikisi de düşük -> Yavaş Çekimde Bir Hafta', () => {
    expect(title('low', 'low', { checkinDays: 7 }).id).toBe('title.combo.lowStreakSeven');
  });

  it('3 gün ve ikisi de yüksek -> İlk Haftadan Sahnede', () => {
    expect(title('high', 'high', { checkinDays: 3 }).id).toBe('title.combo.firstCardStrongStart');
  });

  it('ikisi de yükseldi -> Geçen Haftayı Sollayan; ikisi de geriledi -> Yavaşlayan Hafta', () => {
    expect(title('medium', 'medium', { deltas: { movement: 1, social: 1 } }).id).toBe('title.combo.bigLeapUp');
    expect(title('medium', 'medium', { deltas: { movement: -1, social: -1 } }).id).toBe('title.combo.bigDrop');
  });

  it('yalnız biri yükselince/gerileyince özel kural tetiklenmez', () => {
    expect(title('medium', 'medium', { deltas: { movement: 1, social: 0 } }).id).not.toBe('title.combo.bigLeapUp');
    expect(title('medium', 'medium', { deltas: { movement: -1, social: null } }).id).not.toBe('title.combo.bigDrop');
  });

  it('öncelik: gün kuralı delta kuralından önce gelir', () => {
    const result = title('high', 'high', { checkinDays: 7, deltas: { movement: 1, social: 1 } });
    expect(result.id).toBe('title.combo.sevenSevenHighStreak');
  });

  it('geçen haftakiyle aynıysa sıradaki eşleşen seçilir (alternatif metin yazmadan çeşitlilik)', () => {
    const first = title('high', 'high', { checkinDays: 7, deltas: { movement: 1, social: 1 } });
    const second = title('high', 'high', {
      checkinDays: 7,
      deltas: { movement: 1, social: 1 },
      prev: first.id,
    });
    expect(second.id).toBe('title.combo.bigLeapUp');
  });

  it('geçersiz seviye açık hata fırlatır (sessiz undefined değil)', () => {
    expect(() =>
      selectShareTitle({
        levels: { movement: 'high', social: undefined as unknown as Level },
        deltas: NO_DELTAS,
        checkinDays: 4,
        prevShareTitleId: null,
      })
    ).toThrow(/levels\.social/);
  });

  it('seçilen her unvan kimliği içerik havuzunda vardır', () => {
    for (const m of LEVELS) {
      for (const s of LEVELS) {
        for (const days of [3, 4, 7]) {
          for (const d of [-1, 0, 1] as const) {
            const result = title(m, s, { checkinDays: days, deltas: { movement: d, social: d } });
            expect(TITLE_TEXTS[result.id]).toBe(result.text);
          }
        }
      }
    }
  });
});

describe('selectShareSummary: yalnız kapsam-içi deltalar, mevcut metinler', () => {
  const sum = (movement: Delta, social: Delta, prev: string | null = null) =>
    selectShareSummary({ deltas: { movement, social }, weekStart: '2026-11-02', prevVariantId: prev });

  it.each([
    [null, null, 'summary.firstCard.'],
    [0, 0, 'summary.allStable.'],
    [1, 0, 'summary.risingMajority.'],
    [1, 1, 'summary.risingMajority.'],
    [-1, 0, 'summary.fallingMajority.'],
    [-1, -1, 'summary.fallingMajority.'],
    [1, -1, 'summary.balancedMixed.'],
    [1, null, 'summary.partialData.'],
  ] as const)('movement=%s social=%s -> %s*', (m, s, prefix) => {
    const result = sum(m, s);
    expect(result.id.startsWith(prefix)).toBe(true);
    expect(result.scope).toEqual(['movement', 'social']);
  });

  it('aynı hafta aynı girdi = aynı sonuç (deterministik), ardışık haftada aynı varyant tekrarlanmaz', () => {
    const first = sum(0, 0);
    expect(sum(0, 0)).toEqual(first);
    expect(sum(0, 0, first.id).id).not.toBe(first.id);
  });
});

describe('resolveVisibleTitle / resolveVisibleSummary: katı görüntü kuralı (Karar 2)', () => {
  const snapshot = {
    title: { id: 'title.basic.social.high', text: 'Sosyal Kelebek', basedOnCategories: ['social'] as Category[] },
    shareTitle: { id: 'title.combo.movementSocialBothHigh', text: 'Koşan Sosyalite', scope: ['movement', 'social'] as Category[] },
    summary: { id: 'summary.allStable.1', text: 'Ana özet' },
    shareSummary: { id: 'summary.risingMajority.1', text: 'Paylaşım özeti', scope: ['movement', 'social'] as Category[] },
  } satisfies Pick<CardSnapshot, 'title' | 'shareTitle' | 'summary' | 'shareSummary'>;

  /** Dört kategorinin 16 gizleme alt kümesi. */
  const SUBSETS: ReadonlySet<Category>[] = Array.from({ length: 16 }, (_, mask) =>
    new Set(CATEGORIES.filter((_c, i) => (mask >> i) & 1))
  );

  it('16 alt kümenin hepsinde üç kural sağlanır (unvan)', () => {
    for (const hidden of SUBSETS) {
      const result = resolveVisibleTitle(snapshot, hidden);
      const touchesScope = SHARE_SCOPE.some((c) => hidden.has(c));
      if (hidden.size === 0) {
        expect(result).toEqual({ kind: 'main', id: snapshot.title.id, text: snapshot.title.text });
      } else if (!touchesScope) {
        expect(result).toEqual({ kind: 'share', id: snapshot.shareTitle.id, text: snapshot.shareTitle.text });
      } else {
        expect(result).toEqual({ kind: 'ribbon' });
      }
    }
  });

  it('16 alt kümenin hepsinde aynı kurallar özet için de geçerli', () => {
    for (const hidden of SUBSETS) {
      const result = resolveVisibleSummary(snapshot, hidden);
      const touchesScope = SHARE_SCOPE.some((c) => hidden.has(c));
      if (hidden.size === 0) {
        expect(result.kind).toBe('main');
      } else if (!touchesScope) {
        expect(result.kind).toBe('share');
      } else {
        expect(result).toEqual({ kind: 'hidden' });
      }
    }
  });

  it('bir kategori bile gizliyken ASIL unvan ve ASIL özet hiç görünmez', () => {
    for (const hidden of SUBSETS.filter((h) => h.size > 0)) {
      expect(resolveVisibleTitle(snapshot, hidden)).not.toMatchObject({ kind: 'main' });
      expect(resolveVisibleSummary(snapshot, hidden)).not.toMatchObject({ kind: 'main' });
    }
  });

  it('varsayılan gizlemede (uyku + harcama) paylaşım unvanı %100 okunur', () => {
    const hidden = new Set<Category>(['sleep', 'spending']);
    expect(resolveVisibleTitle(snapshot, hidden).kind).toBe('share');
  });

  it('eski kart (paylaşım alanları yok/null): hiçbir şey gizli değilse asıl, aksi halde şerit (S-3)', () => {
    const old = { title: snapshot.title, summary: snapshot.summary };
    expect(resolveVisibleTitle(old, new Set()).kind).toBe('main');
    expect(resolveVisibleTitle(old, new Set<Category>(['sleep']))).toEqual({ kind: 'ribbon' });
    expect(resolveVisibleTitle({ ...old, shareTitle: null }, new Set<Category>(['sleep']))).toEqual({ kind: 'ribbon' });
    expect(resolveVisibleSummary({ ...old, shareSummary: null }, new Set<Category>(['sleep']))).toEqual({ kind: 'hidden' });
  });
});

/**
 * Girişim-sızmazlık (non-interference) özellik testi (S21; karar kaydı
 * `docs/kararlar/2026-11-19-paylasim-unvani-tasarim.md`, `21-mimari-ve-efor.md` §2a):
 * hareket+sosyal (bu hafta, geçen hafta, gün sayısı) sabitken uyku ve harcama — hem bu haftaki
 * değerleri hem geçen haftaki değerleri — değişse de paylaşım unvanı ve paylaşım özeti DEĞİŞMEZ.
 * Gerçek `buildCard` üzerinden çalışır (yalnızca `selectShareTitle` değil), yani kablolamayı da kanıtlar.
 *
 * Pozitif kontrol: aynı süpürmede ASIL unvan/özet uyku/harcamaya göre değişir; test boş değildir.
 */
import { buildCard } from '@/domain/buildCard';
import type { CategoryValue, Checkin } from '@/domain/types';

const WEEK_START = '2026-11-02'; // Pazartesi
const PREV_WEEK_START = '2026-10-26';
const VALUES: readonly CategoryValue[] = [1, 2, 3];

type Vals = { movement: CategoryValue; sleep: CategoryValue; spending: CategoryValue; social: CategoryValue };

function dayString(base: string, offset: number): string {
  const [y, m, d] = base.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + offset));
  return date.toISOString().slice(0, 10);
}

function week(base: string, days: number, v: Vals): Checkin[] {
  return Array.from({ length: days }, (_, i) => ({ localDate: dayString(base, i), ...v }));
}

describe('paylaşım unvanı/özeti: uyku ve harcama sonucu değiştiremez', () => {
  it('hareket+sosyal sabitken uyku/harcama (bu hafta + geçen hafta) süpürülür', () => {
    let calls = 0;
    const mainTitleIds = new Set<string>();
    const mainSummaryIds = new Set<string>();

    for (const movement of VALUES) {
      for (const social of VALUES) {
        for (const days of [3, 4, 7]) {
          // Geçen hafta: yok, ya da hareket+sosyal için 9 kombinasyon.
          const prevScopes: (null | { pm: CategoryValue; ps: CategoryValue })[] = [null];
          for (const pm of VALUES) for (const ps of VALUES) prevScopes.push({ pm, ps });

          for (const prevScope of prevScopes) {
            let baselineShareTitle: unknown = undefined;
            let baselineShareSummary: unknown = undefined;

            for (const sleep of VALUES) {
              for (const spending of VALUES) {
                for (const prevSleep of VALUES) {
                  for (const prevSpending of VALUES) {
                    const prevWeek = prevScope
                      ? week(PREV_WEEK_START, 4, {
                          movement: prevScope.pm,
                          social: prevScope.ps,
                          sleep: prevSleep,
                          spending: prevSpending,
                        })
                      : [];
                    const card = buildCard(
                      week(WEEK_START, days, { movement, social, sleep, spending }),
                      prevWeek,
                      null,
                      WEEK_START
                    );
                    calls += 1;
                    mainTitleIds.add(card.title.id);
                    mainSummaryIds.add(card.summary.id);

                    if (baselineShareTitle === undefined) {
                      baselineShareTitle = card.shareTitle;
                      baselineShareSummary = card.shareSummary;
                    }
                    expect(card.shareTitle).toEqual(baselineShareTitle);
                    expect(card.shareSummary).toEqual(baselineShareSummary);
                  }
                }
              }
            }
          }
        }
      }
    }

    // 3 x 3 x 3 gün x 10 geçen-hafta x 81 = 21.870 kart.
    expect(calls).toBe(21870);
    // Pozitif kontrol: ana unvan/özet gerçekten çeşitli (süpürme boş değil).
    expect(mainTitleIds.size).toBeGreaterThan(10);
    expect(mainSummaryIds.size).toBeGreaterThan(3);
  });

  it('pozitif kontrol: uyku/harcama ASIL unvanı değiştirir, paylaşım unvanını değiştirmez', () => {
    const a = buildCard(week(WEEK_START, 4, { movement: 2, social: 2, sleep: 1, spending: 2 }), [], null, WEEK_START);
    const b = buildCard(week(WEEK_START, 4, { movement: 2, social: 2, sleep: 3, spending: 2 }), [], null, WEEK_START);
    expect(a.title.id).not.toBe(b.title.id);
    expect(a.shareTitle).toEqual(b.shareTitle);
  });

  it('pozitif kontrol: geçen haftaki uyku/harcama ASIL özeti değiştirir, paylaşım özetini değiştirmez', () => {
    const thisWeek = week(WEEK_START, 4, { movement: 2, social: 2, sleep: 2, spending: 2 });
    const steady = week(PREV_WEEK_START, 4, { movement: 2, social: 2, sleep: 2, spending: 2 });
    const moved = week(PREV_WEEK_START, 4, { movement: 2, social: 2, sleep: 3, spending: 1 });
    const a = buildCard(thisWeek, steady, null, WEEK_START);
    const b = buildCard(thisWeek, moved, null, WEEK_START);
    expect(a.summary.id).not.toBe(b.summary.id);
    expect(a.shareSummary).toEqual(b.shareSummary);
  });
});

describe('varsayılan gizlemede okunur unvan oranı', () => {
  it('81 seviye kombinasyonunun hepsinde paylaşım unvanı vardır (%100; bugünkü ana unvan %20)', () => {
    let withShareTitle = 0;
    let total = 0;
    for (const movement of VALUES) for (const sleep of VALUES) for (const spending of VALUES) for (const social of VALUES) {
      const card = buildCard(week(WEEK_START, 4, { movement, sleep, spending, social }), [], null, WEEK_START);
      total += 1;
      if (card.shareTitle && card.shareTitle.text.length > 0) withShareTitle += 1;
    }
    expect(total).toBe(81);
    expect(withShareTitle).toBe(81);
  });
});

describe('buildCard: ardışık hafta tekrar önleme paylaşım alanlarını da taşır', () => {
  it('prevVariants.shareTitle verilince orta-orta hücresi rotasyon yapar', () => {
    const mk = (prev?: string) =>
      buildCard(week(WEEK_START, 4, { movement: 2, sleep: 2, spending: 2, social: 2 }), [], null, WEEK_START, prev ? { shareTitle: prev } : undefined);
    const first = mk();
    const second = mk(first.shareTitle!.id);
    expect(second.shareTitle!.id).not.toBe(first.shareTitle!.id);
  });
});

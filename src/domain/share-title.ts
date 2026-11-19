/**
 * Paylaşım unvanı ve paylaşım özeti (S21, karar kaydı
 * `docs/kararlar/2026-11-19-paylasim-unvani-tasarim.md`; `21-mimari-ve-efor.md` §2a). Saf TypeScript.
 *
 * **Neden var:** ana unvan/özet dört kategoriden türer ve varsayılan gizlemede (uyku + harcama)
 * gizli kategoriler hakkında çıkarım sızdırır (ölçüm: karar kaydı "Ölçüm"). Paylaşım unvanı ve
 * özeti yalnızca `SHARE_SCOPE` kategorilerinden (hareket + sosyal) türer. **Yapısal
 * girişim-sızmazlık:** fonksiyon girdisi yalnızca kapsam-içi kategorileri tanımlar ve yalnızca o
 * anahtarları okur; çağıran dört kategorinin hepsini geçse bile uyku/harcama sonuca giremez
 * (kanıt: `__tests__/domain/share-title.noninterference.test.ts`).
 *
 * **Kural seti (Karar 4):** ana unvandaki gibi öncelik sıralı; her kural yalnızca kapsam-içi
 * seviye/delta ve gün sayısına bakar, kategori-bağımsız mevcut metinleri yeniden kullanır. Eşleşen
 * kurallar arasından geçen haftakinden farklı olan ilki seçilir (alternatif metin gerekmez).
 *
 * **Görüntü kuralı (Karar 2, katı):** `resolveVisibleTitle` / `resolveVisibleSummary` tek yerde toplanır;
 * `CardView` ve önizleme aynısını çağırmalıdır (UI bağlantısı S19/S21 UI'sında).
 */
import type {
  CardSnapshot,
  Category,
  Delta,
  Level,
  LineResult,
  ShareSummaryResult,
  ShareTitleResult,
} from './types';
import { TITLE_TEXTS } from './content/tr';
import { classifyDeltaValues, selectSummaryForBucket } from './copy';

/** Varsayılan gizli kategorilerin (uyku, harcama) tümleyeni. Değiştirmek yeni karar + migration gerektirir. */
export const SHARE_SCOPE = ['movement', 'social'] as const satisfies readonly Category[];
export type ShareCategory = (typeof SHARE_SCOPE)[number];

export interface SelectShareTitleParams {
  /** Tip gereği uyku/harcama YOK. */
  levels: Record<ShareCategory, Level>;
  deltas: Record<ShareCategory, Delta>;
  checkinDays: number;
  /** Bir önceki haftanın paylaşım unvanı kimliği; `null` = yok/bilinmiyor. */
  prevShareTitleId: string | null;
}

const VALID_LEVELS: readonly Level[] = ['low', 'medium', 'high'];

function requireValidLevels(levels: Record<ShareCategory, Level>): void {
  for (const category of SHARE_SCOPE) {
    const level = levels?.[category];
    if (!VALID_LEVELS.includes(level as Level)) {
      throw new Error(
        `selectShareTitle: levels.${category} geçersiz veya eksik (alınan: ${JSON.stringify(level)}).`
      );
    }
  }
}

function titleText(id: string): string {
  const text = TITLE_TEXTS[id];
  if (!text) {
    throw new Error(`selectShareTitle: içerik havuzunda '${id}' kimlikli metin bulunamadı.`);
  }
  return text;
}

/** Öncelik sıralı özel kurallar: eşleşirse unvan kimliği, eşleşmezse `null`. */
type ShareRule = (p: SelectShareTitleParams) => string | null;

const bothAre = (p: SelectShareTitleParams, level: Level): boolean =>
  p.levels.movement === level && p.levels.social === level;

const SHARE_RULES: readonly ShareRule[] = [
  // 7/7 gün ve ikisi de yüksek.
  (p) => (p.checkinDays === 7 && bothAre(p, 'high') ? 'title.combo.sevenSevenHighStreak' : null),
  // 7/7 gün ve ikisi de düşük.
  (p) => (p.checkinDays === 7 && bothAre(p, 'low') ? 'title.combo.lowStreakSeven' : null),
  // İlk kartın eşiği (3 gün) ve ikisi de yüksek.
  (p) => (p.checkinDays === 3 && bothAre(p, 'high') ? 'title.combo.firstCardStrongStart' : null),
  // Geçen haftaya göre ikisi de yükseldi.
  (p) => (p.deltas.movement === 1 && p.deltas.social === 1 ? 'title.combo.bigLeapUp' : null),
  // Geçen haftaya göre ikisi de geriledi.
  (p) => (p.deltas.movement === -1 && p.deltas.social === -1 ? 'title.combo.bigDrop' : null),
];

/**
 * Taban unvanlar: hareket x sosyal 3x3. Her hücre bir DİZİdir: tek eleman olabilir, birden çoksa
 * ardışık haftada rotasyon sağlar ve sonradan alternatif eklemek yalnızca içerik değişikliğidir.
 * Yedi hücre mevcut metni yeniden kullanır; iki karışık-uç hücre yeni metindir (Karar 3).
 */
const BASE_TITLES: Record<Level, Record<Level, readonly string[]>> = {
  // [hareket][sosyal]
  high: {
    high: ['title.combo.movementSocialBothHigh'],
    medium: ['title.basic.movement.high'],
    low: ['title.combo.movementHighSocialLow'],
  },
  medium: {
    high: ['title.basic.social.high'],
    // Ana motorun hiç üretmediği iki "dengeli" temel unvan; burada rotasyon havuzu.
    medium: ['title.basic.movement.medium', 'title.basic.social.medium'],
    low: ['title.basic.social.low'],
  },
  low: {
    high: ['title.combo.socialHighMovementLow'],
    medium: ['title.basic.movement.low'],
    low: ['title.combo.movementSocialBothLow'],
  },
};

/**
 * Paylaşım unvanı seçer. Öncelik sıralı özel kurallar ve taban havuzu birlikte eşleşme listesi
 * verir; geçen haftakinden farklı olan ilk eşleşen kazanır, yoksa ilk eşleşen tekrar döner.
 */
export function selectShareTitle(params: SelectShareTitleParams): ShareTitleResult {
  requireValidLevels(params.levels);

  const matches: string[] = [];
  for (const rule of SHARE_RULES) {
    const id = rule(params);
    if (id) {
      matches.push(id);
    }
  }
  matches.push(...BASE_TITLES[params.levels.movement][params.levels.social]);

  const id = matches.find((candidate) => candidate !== params.prevShareTitleId) ?? matches[0];
  return { id, text: titleText(id), scope: [...SHARE_SCOPE] };
}

export interface SelectShareSummaryParams {
  /** Tip gereği uyku/harcama YOK. */
  deltas: Record<ShareCategory, Delta>;
  weekStart: string;
  prevVariantId: string | null;
}

/**
 * Paylaşım özeti: ana özetin sınıflandırması ve metin havuzu, ama YALNIZCA kapsam-içi deltalar üzerinden
 * (Karar 5). Yeni metin yok.
 */
export function selectShareSummary(params: SelectShareSummaryParams): ShareSummaryResult {
  const values = SHARE_SCOPE.map((category) => params.deltas[category]);
  const line: LineResult = selectSummaryForBucket(
    classifyDeltaValues(values),
    params.weekStart,
    params.prevVariantId
  );
  return { id: line.id, text: line.text, scope: [...SHARE_SCOPE] };
}

// ---------------------------------------------------------------------------
// Görüntü kuralı (Karar 2, katı) — CardView ve önizleme AYNI fonksiyonu çağırır.
// ---------------------------------------------------------------------------

export type VisibleTitle =
  | { kind: 'main'; id: string; text: string }
  | { kind: 'share'; id: string; text: string }
  | { kind: 'ribbon' };

export type VisibleSummary =
  | { kind: 'main'; id: string; text: string }
  | { kind: 'share'; id: string; text: string }
  | { kind: 'hidden' };

function intersects(scope: readonly Category[], hidden: ReadonlySet<Category>): boolean {
  return scope.some((category) => hidden.has(category));
}

/**
 * 1. `hidden` boşsa asıl unvan. 2. `hidden`, paylaşım unvanının kapsamıyla kesişmiyorsa paylaşım
 * unvanı. 3. Diğer her durumda (paylaşım unvanı yok/NULL dahil) şerit: unvan metni render ağacına
 * GİRMEZ. Bir kategori bile gizliyken asıl unvan hiç gösterilmez.
 */
export function resolveVisibleTitle(
  snapshot: Pick<CardSnapshot, 'title' | 'shareTitle'>,
  hidden: ReadonlySet<Category>
): VisibleTitle {
  if (hidden.size === 0) {
    return { kind: 'main', id: snapshot.title.id, text: snapshot.title.text };
  }
  const share = snapshot.shareTitle;
  if (share && !intersects(share.scope, hidden)) {
    return { kind: 'share', id: share.id, text: share.text };
  }
  return { kind: 'ribbon' };
}

/** `resolveVisibleTitle`ın özet karşılığı; aynı üç kural, son durumda değişim satırı gizli. */
export function resolveVisibleSummary(
  snapshot: Pick<CardSnapshot, 'summary' | 'shareSummary'>,
  hidden: ReadonlySet<Category>
): VisibleSummary {
  if (hidden.size === 0) {
    return { kind: 'main', id: snapshot.summary.id, text: snapshot.summary.text };
  }
  const share = snapshot.shareSummary;
  if (share && !intersects(share.scope, hidden)) {
    return { kind: 'share', id: share.id, text: share.text };
  }
  return { kind: 'hidden' };
}

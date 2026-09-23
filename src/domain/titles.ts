/**
 * Unvan seçimi (spec "Hesaplama kuralları" > "Unvan seçimi" ve S3
 * netleştirmeleri, `plan.md` S3/S4). Saf TypeScript: UI/SQLite/OS import etmez.
 *
 * Kural motoru **öncelik sıralı** çalışır (spec S3 netleştirme #1):
 *   (a) önce kombinasyon/özel kurallar denenir (S4: 28 gerçek kural) — "dört
 *       kategori ortada" dahil;
 *   (b) hiçbiri eşleşmezse 12'lik temel unvan havuzuna düşülür: en az bir
 *       kategori `medium` değilse, sabit öncelik (`movement > sleep >
 *       spending > social`) ile ilk uç kategori seçilir.
 * Bu iki adım 81 seviye kombinasyonunun tamamını garanti eder (S3
 * netleştirme #1.c): hepsi `medium` ise (a)'daki "dört kategori ortada"
 * kuralı zaten yakalamış olur; en az biri `medium` değilse (b) her zaman
 * bir sonuç üretir.
 *
 * **S4 notu:** kombinasyon kural sayısı S3'ün 4 placeholder'ından 28'e
 * çıkarıldı (spec'in "~20-28" aralığının üst ucu). Kurallar şu sırayla
 * denenir: gün/seri temelli (7 günlük seri, ilk kartın güçlü başlangıcı) ->
 * dörtlü uç -> üçlü uç -> büyük sıçrama (delta) -> ikili aynı-yön -> ikili
 * zıt-yön. Gün/seri kuralları en başta çünkü "tam hafta boyunca kesintisiz"
 * sinyali, salt seviye dağılımından (ör. "dördü de yüksek") daha özel ve
 * daha çarpıcı bir başarıdır; bu sıra olmasaydı 7/7 gün + dördü de yüksek
 * durumunda daha genel "dördü de yüksek" unvanı kazanırdı.
 */
import { CATEGORIES } from './types';
import type { Category, Delta, Level, TitleResult } from './types';
import { TITLE_TEXTS } from './content/tr';

export interface SelectTitleParams {
  levels: Record<Category, Level>;
  checkinDays: number;
  deltas: Record<Category, Delta>;
  /** Bir önceki haftanın unvan kimliği; `null` = önceki hafta yok/bilinmiyor. */
  prevTitleId: string | null;
}

type TitleRule = (params: SelectTitleParams) => TitleResult | null;

const VALID_LEVELS: readonly Level[] = ['low', 'medium', 'high'];

/**
 * Girdi doğrulaması (fail-fast): `levels` dört kategorinin dördünü de
 * geçerli bir `Level` değeriyle içermelidir. Eksik/bozuk girdi sessizce
 * `undefined` üretip ilerlemek yerine açık hata fırlatır — bu, unvan
 * kural motorunun 81 kombinasyon garantisini sessizce bozan bir çağıran
 * hatasını erken yakalamak içindir.
 */
function requireValidLevels(levels: Record<Category, Level>): void {
  for (const category of CATEGORIES) {
    const level = levels?.[category];
    if (!VALID_LEVELS.includes(level as Level)) {
      throw new Error(
        `selectTitle: levels.${category} geçersiz veya eksik (alınan: ${JSON.stringify(
          level
        )}). Dört kategorinin dördü de 'low' | 'medium' | 'high' olmalı.`
      );
    }
  }
}

function titleText(id: string): string {
  const text = TITLE_TEXTS[id];
  if (!text) {
    // Kod hatası (içerik havuzunda eksik kimlik) — çağıranın verisi değil,
    // bu dosyanın kendi kural/içerik tutarsızlığı. Sessizce boş metin
    // dönmek yerine erken patlar.
    throw new Error(`selectTitle: içerik havuzunda '${id}' kimlikli metin bulunamadı.`);
  }
  return text;
}

// ---------------------------------------------------------------------------
// Küçük yardımcılar (rakam işi/level sayımı okunabilirlik için).
// ---------------------------------------------------------------------------

function categoriesWithLevel(levels: Record<Category, Level>, level: Level): Category[] {
  return CATEGORIES.filter((category) => levels[category] === level);
}

function categoriesWithDelta(deltas: Record<Category, Delta>, delta: Delta): Category[] {
  return CATEGORIES.filter((category) => deltas[category] === delta);
}

function combo(id: string, basedOnCategories: Category[]): TitleResult {
  return { id, text: titleText(id), basedOnCategories };
}

// ---------------------------------------------------------------------------
// (a) Kombinasyon/özel kurallar — öncelik sıralı, gerçek içerik (S4).
// Sıra: gün/seri temelli -> dörtlü uç -> üçlü uç -> büyük sıçrama (delta) ->
// ikili aynı-yön -> ikili zıt-yön. Gün/seri en başta (bkz. dosya başı not).
// ---------------------------------------------------------------------------

/** "Dört kategori ortada" — spec'in her zaman bir özel kuralla yakalanmasını
 * istediği durum (S3 netleştirme #1.a); temel unvana asla düşmez. */
const allFourMediumRule: TitleRule = ({ levels }) => {
  if (CATEGORIES.every((category) => levels[category] === 'medium')) {
    return combo('title.combo.allMedium', []);
  }
  return null;
};

/** Dört kategorinin dördü de yüksek. */
const allFourHighRule: TitleRule = ({ levels }) => {
  const high = categoriesWithLevel(levels, 'high');
  if (high.length === 4) {
    return combo('title.combo.allFourHigh', high);
  }
  return null;
};

/** Dört kategorinin dördü de düşük. */
const allFourLowRule: TitleRule = ({ levels }) => {
  const low = categoriesWithLevel(levels, 'low');
  if (low.length === 4) {
    return combo('title.combo.allFourLow', low);
  }
  return null;
};

/** Tam olarak üç kategori yüksek, bir kategori düşük. */
const threeHighOneLowRule: TitleRule = ({ levels }) => {
  const high = categoriesWithLevel(levels, 'high');
  const low = categoriesWithLevel(levels, 'low');
  if (high.length === 3 && low.length === 1) {
    return combo('title.combo.threeHighOneLow', [...high, ...low]);
  }
  return null;
};

/** Tam olarak üç kategori düşük, bir kategori yüksek. */
const threeLowOneHighRule: TitleRule = ({ levels }) => {
  const low = categoriesWithLevel(levels, 'low');
  const high = categoriesWithLevel(levels, 'high');
  if (low.length === 3 && high.length === 1) {
    return combo('title.combo.threeLowOneHigh', [...low, ...high]);
  }
  return null;
};

/** Yüksek tutarlılık: hafta tam dolu (7/7 gün) ve çoğu (>= 3) kategori yüksek. */
const sevenSevenHighStreakRule: TitleRule = ({ levels, checkinDays }) => {
  if (checkinDays !== 7) {
    return null;
  }
  const high = categoriesWithLevel(levels, 'high');
  if (high.length >= 3) {
    return combo('title.combo.sevenSevenHighStreak', high);
  }
  return null;
};

/** Hafta tam dolu (7/7 gün) ama çoğu (>= 3) kategori düşük: sakin ama kesintisiz. */
const lowStreakSevenRule: TitleRule = ({ levels, checkinDays }) => {
  if (checkinDays !== 7) {
    return null;
  }
  const low = categoriesWithLevel(levels, 'low');
  if (low.length >= 3) {
    return combo('title.combo.lowStreakSeven', low);
  }
  return null;
};

/** İlk kartın eşiği (3 dolu gün) ile bile en az iki kategori yüksek. */
const firstCardStrongStartRule: TitleRule = ({ levels, checkinDays }) => {
  if (checkinDays !== 3) {
    return null;
  }
  const high = categoriesWithLevel(levels, 'high');
  if (high.length >= 2) {
    return combo('title.combo.firstCardStrongStart', high);
  }
  return null;
};

/** Geçen haftaya göre büyük sıçrama: en az üç kategori yükseldi. */
const bigLeapUpRule: TitleRule = ({ deltas }) => {
  const rising = categoriesWithDelta(deltas, 1);
  if (rising.length >= 3) {
    return combo('title.combo.bigLeapUp', rising);
  }
  return null;
};

/** Geçen haftaya göre büyük düşüş: en az üç kategori geriledi. */
const bigDropRule: TitleRule = ({ deltas }) => {
  const falling = categoriesWithDelta(deltas, -1);
  if (falling.length >= 3) {
    return combo('title.combo.bigDrop', falling);
  }
  return null;
};

/** İki kategori birlikte aynı uçta — "her ikisi de yüksek/düşük" kuralları. */
function bothLevelRule(id: string, a: Category, b: Category, level: Level): TitleRule {
  return ({ levels }) => {
    if (levels[a] === level && levels[b] === level) {
      return combo(id, [a, b]);
    }
    return null;
  };
}

const movementSleepBothHighRule = bothLevelRule('title.combo.movementSleepBothHigh', 'movement', 'sleep', 'high');
const movementSleepBothLowRule = bothLevelRule('title.combo.movementSleepBothLow', 'movement', 'sleep', 'low');
const spendingSocialBothHighRule = bothLevelRule('title.combo.spendingSocialBothHigh', 'spending', 'social', 'high');
const spendingSocialBothLowRule = bothLevelRule('title.combo.spendingSocialBothLow', 'spending', 'social', 'low');
const movementSpendingBothHighRule = bothLevelRule(
  'title.combo.movementSpendingBothHigh',
  'movement',
  'spending',
  'high'
);
const movementSpendingBothLowRule = bothLevelRule(
  'title.combo.movementSpendingBothLow',
  'movement',
  'spending',
  'low'
);
const movementSocialBothHighRule = bothLevelRule('title.combo.movementSocialBothHigh', 'movement', 'social', 'high');
const movementSocialBothLowRule = bothLevelRule('title.combo.movementSocialBothLow', 'movement', 'social', 'low');
const sleepSpendingBothHighRule = bothLevelRule('title.combo.sleepSpendingBothHigh', 'sleep', 'spending', 'high');
const sleepSpendingBothLowRule = bothLevelRule('title.combo.sleepSpendingBothLow', 'sleep', 'spending', 'low');
const sleepSocialBothHighRule = bothLevelRule('title.combo.sleepSocialBothHigh', 'sleep', 'social', 'high');
const sleepSocialBothLowRule = bothLevelRule('title.combo.sleepSocialBothLow', 'sleep', 'social', 'low');

/** İki kategori zıt uçta — biri yüksek, biri düşük. */
function oppositeLevelRule(id: string, high: Category, low: Category): TitleRule {
  return ({ levels }) => {
    if (levels[high] === 'high' && levels[low] === 'low') {
      return combo(id, [high, low]);
    }
    return null;
  };
}

const movementHighSleepLowRule = oppositeLevelRule('title.combo.movementHighSleepLow', 'movement', 'sleep');
const sleepHighMovementLowRule = oppositeLevelRule('title.combo.sleepHighMovementLow', 'sleep', 'movement');
const spendingHighSocialLowRule = oppositeLevelRule('title.combo.spendingHighSocialLow', 'spending', 'social');
const socialHighSpendingLowRule = oppositeLevelRule('title.combo.socialHighSpendingLow', 'social', 'spending');
const movementHighSpendingLowRule = oppositeLevelRule('title.combo.movementHighSpendingLow', 'movement', 'spending');
const sleepHighSocialLowRule = oppositeLevelRule('title.combo.sleepHighSocialLow', 'sleep', 'social');

/**
 * Öncelik sıralı kombinasyon/özel kural listesi (28 kural, S4). Sıra
 * önemlidir: dizideki ilk eşleşen "birincil" adaydır; sıradaki eşleşenler
 * fallback zincirinde (bkz. `selectTitle`) kullanılır. Seviye tabanlı
 * kurallarda (ör. "dördü de yüksek" vs "ikisi de yüksek") daha dar bir
 * kombinasyonu daha geniş bir alt-kümesini de yakalayabilecek bir kuraldan
 * önce sıralamak, daha spesifik unvanın öncelikli seçilmesini sağlar —
 * bu gerçek bir alt-küme ilişkisidir.
 *
 * Gün/seri temelli kurallar (`sevenSevenHighStreakRule`, `lowStreakSevenRule`,
 * `firstCardStrongStartRule`) bunun DIŞINDA: bunlar `checkinDays`'e bakar,
 * seviye dağılımının alt-kümesi değildir — "7 gün kesintisiz" ile "dördü de
 * yüksek" birbirini içermeyen, kesişebilen iki ayrı koşuldur. Bunların
 * dörtlü/üçlü uç kurallarından önce gelmesi bir editoryal/ürün tercihidir
 * (S4: "tam hafta kesintisiz" sinyali salt seviye dağılımından daha özel bir
 * başarı sayılır), mantıksal bir zorunluluk değil — sırayı değiştirirsen
 * `__tests__/domain/buildCard.test.ts`'teki "7 gün + dördü de yüksek"
 * senaryosunun hangi unvanı beklediğini de güncellemen gerekir.
 */
const COMBO_RULES: readonly TitleRule[] = [
  allFourMediumRule,
  sevenSevenHighStreakRule,
  lowStreakSevenRule,
  firstCardStrongStartRule,
  allFourHighRule,
  allFourLowRule,
  threeHighOneLowRule,
  threeLowOneHighRule,
  bigLeapUpRule,
  bigDropRule,
  movementSleepBothHighRule,
  movementSleepBothLowRule,
  spendingSocialBothHighRule,
  spendingSocialBothLowRule,
  movementSpendingBothHighRule,
  movementSpendingBothLowRule,
  movementSocialBothHighRule,
  movementSocialBothLowRule,
  sleepSpendingBothHighRule,
  sleepSpendingBothLowRule,
  sleepSocialBothHighRule,
  sleepSocialBothLowRule,
  movementHighSleepLowRule,
  sleepHighMovementLowRule,
  spendingHighSocialLowRule,
  socialHighSpendingLowRule,
  movementHighSpendingLowRule,
  sleepHighSocialLowRule,
];

// ---------------------------------------------------------------------------
// (b) Temel unvanlar — 4 kategori x 3 seviye, kapsama garantisi.
// ---------------------------------------------------------------------------

/**
 * En az bir kategori `medium` değilse (yani `low`/`high`), sabit öncelik
 * (`movement > sleep > spending > social`) ile ilk uç kategoriyi seçer ve o
 * kategori+seviyeye karşılık gelen temel unvanı döner. Hepsi `medium` ise
 * `null` döner (bu durumu zaten `allFourMediumRule` yakalamış olmalı).
 */
function basicTitleRule(params: SelectTitleParams): TitleResult | null {
  const { levels } = params;
  const extremeCategory = CATEGORIES.find((category) => levels[category] !== 'medium');
  if (!extremeCategory) {
    return null;
  }
  const level = levels[extremeCategory];
  const id = `title.basic.${extremeCategory}.${level}`;
  return { id, text: titleText(id), basedOnCategories: [extremeCategory] };
}

/**
 * Bütün öncelik sıralı kuralları (önce kombinasyon, sonra temel) çalıştırıp
 * eşleşen TÜM sonuçları sırayla döner (fallback zinciri için). Boş dönmesi
 * teorik olarak imkansızdır (S3 netleştirme #1.c).
 */
function collectAllMatches(params: SelectTitleParams): TitleResult[] {
  const matches: TitleResult[] = [];
  for (const rule of COMBO_RULES) {
    const result = rule(params);
    if (result) {
      matches.push(result);
    }
  }
  const basic = basicTitleRule(params);
  if (basic) {
    matches.push(basic);
  }
  return matches;
}

/**
 * Unvan seçer. Öncelik sıralı kuralların **ilk eşleşeni** kazanır; ancak
 * bu, bir önceki haftanın unvanıyla (`prevTitleId`) aynıysa, aynı sıralı
 * listede **sıradaki eşleşen** seçilir (tekrar sıkıcılığı, spec "Hesaplama
 * kuralları"). Hiçbir farklı unvan bulunamazsa (S3 netleştirme #2) orijinal
 * eşleşen aynen tekrar döner — boş dönmez, hata fırlatmaz.
 */
export function selectTitle(params: SelectTitleParams): TitleResult {
  requireValidLevels(params.levels);

  const matches = collectAllMatches(params);
  if (matches.length === 0) {
    // Ulaşılamaz olması gereken savunmacı dal (S3 netleştirme #1.c): en az
    // bir kategori medium değilse (b) her zaman üretir; hepsi medium ise
    // (a)'daki allFourMediumRule zaten yakalar.
    throw new Error(
      `selectTitle: hiçbir kural eşleşmedi (81 kombinasyon garantisi ihlal edildi) — levels: ${JSON.stringify(
        params.levels
      )}`
    );
  }

  const firstDifferent = matches.find((match) => match.id !== params.prevTitleId);
  return firstDifferent ?? matches[0];
}

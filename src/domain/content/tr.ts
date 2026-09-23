/**
 * Türkçe metin havuzu (spec "İçerik (metin)" + "Ton kuralı"): kod içinde tip
 * güvenli, her metin kimlikli.
 *
 * **S4 taslağı (bu depoda ilk gerçek içerik).** `plan.md` S4'e göre bu, MOB
 * tarafından yazılmış **düzenlenebilir bir taslaktır**; espri/ton son hâlini
 * Batuhan verir (`plan.md` S4: "Sorumlu: MOB (taslak) + Batuhan (espri
 * düzeltmesi, insan girdisi)"). Kural motorunun mekanizması (öncelik sıralı,
 * ilk eşleşen, garanti fallback, tekrar-önleme) S3'te 81/81 kapsama
 * testiyle zaten kanıtlanmıştı; S4 yalnızca metni ve kombinasyon kural
 * sayısını (4 placeholder -> 28 gerçek kural) büyütür.
 *
 * Ton kuralı (spec): esprili, tanısız, tavsiyesiz. Tıbbi/sağlık iddiası, ruh
 * sağlığı tanısı ve utandırma yok. Ayrıca (spec "Hesaplama kuralları" +
 * S3 görev tanımı): her metin **<= 60 karakter**, **rakam yok** (birim testi
 * bunu hem bu statik havuzda hem üretilen nihai metinde denetler).
 */
import type { Category, Level, LineResult } from '../types';

/** `weekly_card.content_version` — bu havuzun sürümü (spec "Veri modeli"). */
export const CONTENT_VERSION = 1;

// ---------------------------------------------------------------------------
// Unvanlar (title) — 28 kombinasyon/özel kural + 12 temel unvan.
// ---------------------------------------------------------------------------

/**
 * Kimlik -> metin. Unvanların (satırların aksine) haftadan haftaya birden
 * çok varyantı yoktur; tek sabit metin, kural eşleşmesiyle seçilir.
 */
export const TITLE_TEXTS: Record<string, string> = {
  // --- (a) Kombinasyon/özel kurallar (28, `src/domain/titles.ts`'teki sırayla) ---

  // Dörtlü uç durumlar
  'title.combo.allMedium': 'Ne Az Ne Çok Ustası',
  'title.combo.allFourHigh': 'Tam Gaz Hafta',
  'title.combo.allFourLow': 'Dinlenme Modu Sonuna Kadar Açık',

  // Üçlü uç durumlar
  'title.combo.threeHighOneLow': 'Neredeyse Kusursuz',
  'title.combo.threeLowOneHigh': 'Tek Kişilik Ordu',

  // Gün/seri temelli
  'title.combo.sevenSevenHighStreak': 'Tam Hafta, Tam Performans',
  'title.combo.lowStreakSeven': 'Sessiz Serinin Sadık Ustası',
  'title.combo.firstCardStrongStart': 'Daha İlk Haftadan Parlayan Yıldız',

  // Geçen haftaya göre büyük değişim
  'title.combo.bigLeapUp': 'Haftanın Sıçrama Şampiyonu',
  'title.combo.bigDrop': 'Yumuşak İniş Uzmanı',

  // İkili aynı-yön kombinasyonları
  'title.combo.movementSleepBothHigh': 'Zinde ve Dinlenmiş Kahraman',
  'title.combo.movementSleepBothLow': 'Düşük Pil Modu',
  'title.combo.spendingSocialBothHigh': 'Parti ve Alışverişin Yıldızı',
  'title.combo.spendingSocialBothLow': 'Kumbaracı Ev Kuşu',
  'title.combo.movementSpendingBothHigh': 'Enerjik Harcama Ustası',
  'title.combo.movementSpendingBothLow': 'Sakin Bütçe Sakini',
  'title.combo.movementSocialBothHigh': 'Koşan Sosyalite',
  'title.combo.movementSocialBothLow': 'Ev Modunda Bir Hafta',
  'title.combo.sleepSpendingBothHigh': 'Rahat Uyuyan Cömert',
  'title.combo.sleepSpendingBothLow': 'Yorgun ve Tutumlu',
  'title.combo.sleepSocialBothHigh': 'Dinlenmiş Sosyal Yıldız',
  'title.combo.sleepSocialBothLow': 'Sessiz Nöbetçi',

  // İkili zıt-yön kombinasyonları
  'title.combo.movementHighSleepLow': 'Koşan Ama Uykusuz Kahraman',
  'title.combo.sleepHighMovementLow': 'Konforun Kalesi',
  'title.combo.spendingHighSocialLow': 'Sessiz Ama Cömert',
  'title.combo.socialHighSpendingLow': 'Tutumlu Sosyalite',
  'title.combo.movementHighSpendingLow': 'Sporcu Cüzdan Koruyucusu',
  'title.combo.sleepHighSocialLow': 'Yastıkla Baş Başa',

  // --- (b) Temel unvanlar: 4 kategori x 3 seviye (kapsama garantisi) ---
  'title.basic.movement.low': 'Kanepe Filozofu',
  'title.basic.movement.medium': 'Dengeli Adımcı',
  'title.basic.movement.high': 'Hareket Canavarı',
  'title.basic.sleep.low': 'Gece Nöbetçisi',
  'title.basic.sleep.medium': 'Dengeli Uyuyucu',
  'title.basic.sleep.high': 'Yastık Şampiyonu',
  'title.basic.spending.low': 'Cüzdan Koruyucusu',
  'title.basic.spending.medium': 'Ölçülü Harcamacı',
  'title.basic.spending.high': 'Kartın Kahramanı',
  'title.basic.social.low': 'Sessiz Mod Uzmanı',
  'title.basic.social.medium': 'Dengeli Sosyalite',
  'title.basic.social.high': 'Sosyal Kelebek',
};

// ---------------------------------------------------------------------------
// Satırlar (line) — kategori x seviye x >= 3 varyant (>= 36 satır).
// ---------------------------------------------------------------------------

function lines(category: Category, level: Level, texts: string[]): LineResult[] {
  return texts.map((text, index) => ({ id: `line.${category}.${level}.${index + 1}`, text }));
}

export const LINE_VARIANTS: Record<Category, Record<Level, LineResult[]>> = {
  movement: {
    low: lines('movement', 'low', [
      'Bacakların bu hafta izne çıkmış resmen.',
      'Kanepe bu hafta seni pek bırakmadı.',
      'Adımların bu hafta grev ilan etti.',
    ]),
    medium: lines('movement', 'medium', [
      'Ne maraton ne mola, tam ortası bir tempo.',
      'Orta karar hareket, akıllıca bir seçimdi.',
      'Ne çok koştun ne hiç durdun, dengeliydin.',
    ]),
    high: lines('movement', 'high', [
      'Bacakların bu hafta durmak bilmedi.',
      'Enerjin taşmış, hareket resmen sende bu hafta.',
      'Adımların bu hafta hız sınırını zorladı.',
    ]),
  },
  sleep: {
    low: lines('sleep', 'low', [
      'Yastığın bu hafta seni pek göremedi.',
      'Gece yarıları senin mesai saatin gibiydi.',
      'Uyku bu hafta sana biraz küstü galiba.',
    ]),
    medium: lines('sleep', 'medium', [
      'Ne baykuş ne tarla kuşu, ortada bir haftaydın.',
      'Uykun ne az ne çok, dengeli geçti.',
      'Ilımlı bir uyku haftası geçirdin.',
    ]),
    high: lines('sleep', 'high', [
      'Yastığınla resmen kader birliği yaptınız.',
      'Bu hafta uyku konusunda zirvedeydin.',
      'Uyku bankasına bol para yatırdın bu hafta.',
    ]),
  },
  spending: {
    low: lines('spending', 'low', [
      'Cüzdanın bu hafta minik bir tatil yaptı.',
      'Kartın bu hafta neredeyse hiç ısınmadı.',
      'Bu hafta harcama konusunda çekingendin.',
    ]),
    medium: lines('spending', 'medium', [
      'Ne cimri ne çılgın, tam kararında harcadın.',
      'Cüzdan bu hafta ölçülü bir tempo tuttu.',
      'Harcaman ne kısıtlı ne bol, dengeliydi.',
    ]),
    high: lines('spending', 'high', [
      'Kartın bu hafta epey mesai yaptı.',
      'Cüzdanın bu hafta hatırı sayılır bir tur attı.',
      'Bu hafta harcama konusunda cömert taraftaydın.',
    ]),
  },
  social: {
    low: lines('social', 'low', [
      'Sosyal takvimin bu hafta sakin kaldı.',
      'Sosyal hayatın bu hafta sessiz moddaydı.',
      'Bu hafta içine dönük bir hafta geçirdin.',
    ]),
    medium: lines('social', 'medium', [
      'Ne kalabalık ne yalnız, ortada bir haftaydın.',
      'Sosyallik dozun tam kıvamındaydı bu hafta.',
      'Bu hafta sosyal hayatın dengeliydi.',
    ]),
    high: lines('social', 'high', [
      'Bu hafta çevrende adeta bir kutlama vardı.',
      'Sosyal pilin bu hafta hiç bitmedi.',
      'Bu hafta etrafın seninle şenlendi.',
    ]),
  },
};

// ---------------------------------------------------------------------------
// Özet/değişim şablonları (~6, spec "Özet/değişim satırı").
// ---------------------------------------------------------------------------

/**
 * Değişim özetinin şablon türü. `copy.ts#classifySummaryBucket` deltalardan
 * bu türü hesaplar. Eşiklerin içerik-özel inceliği (ör. "büyük sıçrama")
 * unvan tarafında (`title.combo.bigLeapUp` / `title.combo.bigDrop`) ayrıca
 * ele alınır; burada yalnızca yükselen/düşen/sabit kategori sayısına göre
 * kaba sınıflandırma var.
 */
export type SummaryBucket =
  | 'firstCard'
  | 'allStable'
  | 'risingMajority'
  | 'fallingMajority'
  | 'balancedMixed'
  | 'partialData';

function summaryLines(bucket: SummaryBucket, texts: string[]): LineResult[] {
  return texts.map((text, index) => ({ id: `summary.${bucket}.${index + 1}`, text }));
}

export const SUMMARY_VARIANTS: Record<SummaryBucket, LineResult[]> = {
  firstCard: summaryLines('firstCard', [
    'İlk karnen bu, kıyaslayacak geçmiş hafta yok.',
    'Bu ilk kartın, önceki haftayla kıyas henüz yok.',
  ]),
  allStable: summaryLines('allStable', [
    'Bu hafta her şey geçen haftayla aynı çizgide gitti.',
    'Değişim yok, geçen haftanın aynı temposundaydın.',
  ]),
  risingMajority: summaryLines('risingMajority', [
    'Bu hafta çoğu kategori geçen haftadan güçlüydü.',
    'Genel gidişat yukarı yönlü, güzel bir yükseliş.',
  ]),
  fallingMajority: summaryLines('fallingMajority', [
    'Bu hafta çoğu kategori geçen haftadan biraz düştü.',
    'Genel gidişat aşağı yönlü, sakin bir dinlenme haftası.',
  ]),
  balancedMixed: summaryLines('balancedMixed', [
    'Karışık bir hafta, kimi yükseldi kimi düştü.',
    'Bu hafta terazi hem sağa hem sola salındı.',
  ]),
  partialData: summaryLines('partialData', [
    'Bazı kategorilerde geçen haftayla kıyas henüz yok.',
    'Karşılaştırma için bazı kategoriler henüz ısınıyor.',
  ]),
};

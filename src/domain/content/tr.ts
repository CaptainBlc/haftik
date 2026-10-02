/**
 * Türkçe metin havuzu (spec "İçerik (metin)" + "Ton kuralı"): kod içinde tip
 * güvenli, her metin kimlikli.
 *
 * **S16a (2026-10-03, `docs/inceleme-2026-09-25/19-metin-ve-icerik-v2.md` +
 * `02-icerik-metin-denetimi.md` §5; kararlar A14/A15) — `CONTENT_VERSION` 2:**
 * - Zamansızlaştırma (19 §4.1): kart içeriğinde ZAMAN ZARFI YOK ("bu hafta" vb.).
 *   Kart Albüm'den/geçen haftanın kartı olarak sonradan açılabilir; "bu hafta"
 *   okuma anını işaret edip yanlış olur. Yalnızca kartın İÇ kıyası ("geçen
 *   haftaya göre") kalır.
 * - Yargı/damga/rütbe/tıbbi dil ve "kart" sesteşliği (banka kartı) temizlendi
 *   (19 §4.2 yasak liste; mekanik: `__tests__/domain/content-lint.test.ts`).
 * - "Vites" imgesi yalnızca ileride eklenecek risingBig/fallingBig özet
 *   kovalarına ayrıldı (A15); şimdi havuzda hiç yok.
 * - Metinler copywriter taslağıdır; **son söz Batuhan'ın** (onay: `docs/
 *   s16a-metin-onayi.md`). Eski dondurulmuş kartlar eski metinle (sürüm 1) kalır.
 *
 * Ton kuralı (spec): esprili, tanısız, tavsiyesiz. Tıbbi/sağlık iddiası, ruh
 * sağlığı tanısı ve utandırma yok. Ayrıca her metin **<= 60 karakter**,
 * **rakam yok** (birim testi bunu hem bu statik havuzda hem üretilen nihai
 * metinde denetler). Satırlar hedef <= 46, unvan <= 28 karakter.
 */
import type { Category, Level, LineResult } from '../types';

/** `weekly_card.content_version` — bu havuzun sürümü (spec "Veri modeli"). */
export const CONTENT_VERSION = 2;

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
  'title.combo.allMedium': 'Ne Az Ne Çok Haftası',
  'title.combo.allFourHigh': 'Tam Gaz Hafta',
  'title.combo.allFourLow': 'Sessiz Sedasız Bir Hafta',

  // Üçlü uç durumlar
  'title.combo.threeHighOneLow': 'Neredeyse Tam Gaz',
  'title.combo.threeLowOneHigh': 'Tek Kişilik Ordu',

  // Gün/seri temelli
  'title.combo.sevenSevenHighStreak': 'Hiç Boş Bırakmayan Hafta',
  'title.combo.lowStreakSeven': 'Yavaş Çekimde Bir Hafta',
  'title.combo.firstCardStrongStart': 'İlk Haftadan Sahnede',

  // Geçen haftaya göre büyük değişim
  'title.combo.bigLeapUp': 'Geçen Haftayı Sollayan',
  'title.combo.bigDrop': 'Yavaşlayan Hafta',

  // İkili aynı-yön kombinasyonları
  'title.combo.movementSleepBothHigh': 'Hem Koşan Hem Yatan',
  'title.combo.movementSleepBothLow': 'Kısa Gece, Sakin Adım',
  'title.combo.spendingSocialBothHigh': 'Parti Var, Poşet Var',
  'title.combo.spendingSocialBothLow': 'Kapı da Cüzdan da Kapalı',
  'title.combo.movementSpendingBothHigh': 'Koşup Harcayan Hafta',
  'title.combo.movementSpendingBothLow': 'Yavaş Adım, Kapalı Cüzdan',
  'title.combo.movementSocialBothHigh': 'Koşan Sosyalite',
  'title.combo.movementSocialBothLow': 'Kapıdan Az Çıkan Hafta',
  'title.combo.sleepSpendingBothHigh': 'Bol Uyku, Bol Harcama',
  'title.combo.sleepSpendingBothLow': 'Kısa Gece, Boş Sepet',
  'title.combo.sleepSocialBothHigh': 'Yastıktan Kalabalığa',
  'title.combo.sleepSocialBothLow': 'Sessiz Nöbetçi',

  // İkili zıt-yön kombinasyonları
  'title.combo.movementHighSleepLow': 'Gece Kısa, Adım Uzun',
  'title.combo.sleepHighMovementLow': 'Konforun Kalesi',
  'title.combo.spendingHighSocialLow': 'Sessiz Ev, Hareketli Kasa',
  'title.combo.socialHighSpendingLow': 'Kalabalıkta Cüzdan Cepte',
  'title.combo.movementHighSpendingLow': 'Adım Çok, Fiş Yok',
  'title.combo.sleepHighSocialLow': 'Yastıkla Baş Başa',

  // --- (b) Temel unvanlar: 4 kategori x 3 seviye (kapsama garantisi) ---
  'title.basic.movement.low': 'Kanepe Filozofu',
  'title.basic.movement.medium': 'Dengeli Adımcı',
  'title.basic.movement.high': 'Koşu Bandı Kıskandı',
  'title.basic.sleep.low': 'Gece Nöbetçisi',
  'title.basic.sleep.medium': 'Ortada Bir Yastık',
  'title.basic.sleep.high': 'Yastığın Sadık Dostu',
  'title.basic.spending.low': 'Fişlerden Uzak Hafta',
  'title.basic.spending.medium': 'Cüzdan Orta Hızda',
  'title.basic.spending.high': 'Cüzdan Mesaide',
  'title.basic.social.low': 'Sessize Alınmış Hafta',
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
      'Bacakların izne çıkmış resmen.',
      'Kanepe seni pek bırakmadı.',
      'Adımların grev ilan etti.',
    ]),
    medium: lines('movement', 'medium', [
      'Ne maraton ne mola, tam ortası bir tempo.',
      'Hareketin orta şekerli geçti.',
      'Ne çok koştun ne hiç durdun, arada yürüdün.',
    ]),
    high: lines('movement', 'high', [
      'Bacakların durmak bilmedi.',
      'Adım sayar ter döktü.',
      'Adımların hız sınırını zorladı.',
    ]),
  },
  sleep: {
    low: lines('sleep', 'low', [
      'Gece yarıları seni yatakta bulamadı.',
      'Uyku sana biraz küstü galiba.',
      'Gece yarıları seni hep ayakta yakaladı.',
    ]),
    medium: lines('sleep', 'medium', [
      'Ne baykuş ne tarla kuşu, ortada bir haftaydın.',
      'Uykun ne erken bitti ne geç kalktı.',
      'Uykun tam ortadan geçti.',
    ]),
    high: lines('sleep', 'high', [
      'Uykunla arandaki mesafe hiç açılmadı.',
      'Gece erken kapandı, sabah geç açıldı.',
      'Uyku hesabına hep para yatmış.',
    ]),
  },
  spending: {
    low: lines('spending', 'low', [
      'Harcamalar kapıdan bakıp geçti.',
      'Kasa fişleri seyrek uğradı.',
      'Alışveriş sepeti hep boş kaldı.',
    ]),
    medium: lines('spending', 'medium', [
      'Harcamalar ortada bir yerde buluştu.',
      'Alışveriş sepeti orta hızda dolup boşaldı.',
      'Harcamalar ne fazla taştı ne hiç akmadı.',
    ]),
    high: lines('spending', 'high', [
      'Fişler art arda dizilmiş gibiydi.',
      'Kasa ışıkları senin için sık sık yandı.',
      'Harcamalar ön sıraya oturdu.',
    ]),
  },
  social: {
    low: lines('social', 'low', [
      'Telefon rehberin biraz tozlanmış.',
      'Sosyal takvimin beyaz sayfa gibiydi.',
      'Mesaj kutun uzun süre sessiz kaldı.',
    ]),
    medium: lines('social', 'medium', [
      'Sosyal ses ayarın ortadaydı.',
      'Çevrenle bağların ne sıkı ne gevşekti.',
      'Ne kalabalık ne tenha, ortalama bir düzen.',
    ]),
    high: lines('social', 'high', [
      'Takvimin senden çok yoruldu.',
      'Mesaj kutun hiç sessiz kalmadı.',
      'Takvimin baştan sona doluydu.',
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
 *
 * **S16a notu (02 M-2/M-3/M-4):** metinler, kovanın GERÇEKTE tetiklendiği her
 * duruma doğru kalacak şekilde yazıldı: "çoğu" iddiası yok (bir yükselen + üç
 * sabit de `risingMajority`ye girer), geri dönen kullanıcıya "ilk kartın"
 * denmez, değer dili (güçlü/güzel) ve seviye sözcükleri (özette yasak, L5) yok.
 * `partialData` kovası fiilen ulaşılmaz (M-4); `computeDelta` mantığı
 * değiştirilmedi, kova yeni özet kovalarına (S19+) devredilecek.
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
    'Kıyaslayacak önceki hafta yok, sayfa yeni açıldı.',
    'Başlangıç çizgisi bu, kıyas sonraki haftalarda.',
  ]),
  allStable: summaryLines('allStable', [
    'Geçen haftayla neredeyse aynı çizgidesin.',
    'Geçen haftanın fotokopisi gibi bir hafta.',
  ]),
  risingMajority: summaryLines('risingMajority', [
    'Geçen haftaya göre bazı şeyler hız kazandı.',
    'Geçen haftadan daha dolu bir hafta.',
  ]),
  fallingMajority: summaryLines('fallingMajority', [
    'Geçen haftaya göre bazı şeyler yavaşladı.',
    'Geçen haftadan biraz daha yavaş akmış.',
  ]),
  balancedMixed: summaryLines('balancedMixed', [
    'Karışık bir hafta, kimi yükseldi kimi düştü.',
    'Terazi hem sağa hem sola salındı.',
  ]),
  partialData: summaryLines('partialData', [
    'Bazı alanlarda geçen haftayla kıyas yok.',
    'Bazı alanlarda kıyas için henüz erken.',
  ]),
};

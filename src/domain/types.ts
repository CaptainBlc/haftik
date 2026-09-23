/**
 * Domain katmanı (Aşama 3, S2) — saf TypeScript tipleri.
 *
 * Bu dosya ve `src/domain/` altındaki diğer dosyalar UI/SQLite/OS import
 * etmez (bkz. `spec.md` "Tasarım ilkeleri", `plan.md` S2). Saat dışarıdan
 * (`now: Date` parametresiyle) verilir; testler `TZ=Europe/Istanbul`
 * sabitlemesiyle deterministiktir (bkz. `jest.setup.ts`, `package.json`).
 */

/** Bir kategorideki sıralı yoğunluk: 1=düşük, 2=orta, 3=yüksek (iyi/kötü değil). */
export type CategoryValue = 1 | 2 | 3;

/** Dört sabit check-in kategorisi (spec "Veri modeli" > `checkin` tablosu). */
export type Category = 'movement' | 'sleep' | 'spending' | 'social';

/**
 * Bir günün check-in kaydı. Kısmi kayıt yoktur: `Checkin` tipi zaten dört
 * kategorinin de dolu olduğu, "dolu gün" sayılan bir günü temsil eder
 * (spec: "Bir gün, ancak dört kategorinin dördü de seçilince 'dolu gün'
 * sayılır"). Kısmi/eksik günler bu tipte hiç temsil edilmez; veri katmanı
 * yalnızca dört kategorisi de dolu olan günleri `Checkin` olarak üretir.
 */
export interface Checkin {
  /** `YYYY-MM-DD`, yerel takvim günü. */
  localDate: string;
  movement: CategoryValue;
  sleep: CategoryValue;
  spending: CategoryValue;
  social: CategoryValue;
}

/** Haftalık kategori ortalamasından türetilen seviye (spec "Hesaplama kuralları"). */
export type Level = 'low' | 'medium' | 'high';

/**
 * Geçen haftaya göre değişim yönü. `null` = geçen hafta karşılaştırma için
 * yeterli veri yok ("ilk kart / karşılaştırma yok" varyantı gösterilir).
 */
export type Delta = -1 | 0 | 1 | null;

/**
 * Belirli bir haftanın (Pazartesi-Pazar) durumu. `unlocked` tek bir alana
 * indirilmiştir (spec S2 netleştirme #5): `thresholdMet && timeMet`.
 */
export interface WeekState {
  /** Haftanın Pazartesi tarihi, `YYYY-MM-DD` (yerel). */
  weekStart: string;
  /** Bu hafta içindeki tekilleştirilmiş dolu gün sayısı. */
  filledDays: number;
  /** Uygunluk için gereken dolu gün sayısı: ilk kartta 3, sonrasında 4. */
  requiredDays: number;
  /** `filledDays >= requiredDays`. */
  thresholdMet: boolean;
  /** Şimdi, bu haftanın Pazar 20:00'sine (yerel) ulaşmış veya geçmiş mi. */
  timeMet: boolean;
  /** `thresholdMet && timeMet` — kart açılabilir mi. */
  unlocked: boolean;
}

/**
 * Dört kategorinin sabit değerlendirme sırası (spec S3 netleştirme #1.b:
 * "sabit öncelik movement > sleep > spending > social"). Birden fazla
 * dosyada (unvan kural motoru, kart birleştirme) aynı sırayla iterasyon
 * gerektiğinden burada tek yerde tanımlanır.
 */
export const CATEGORIES: readonly Category[] = ['movement', 'sleep', 'spending', 'social'];

/**
 * Bir unvan/satır/özet seçiminin sonucu: kimlik + o anki metin. Kimlikli
 * olması (spec "İçerik (metin)") unvan/satır çeşitlilik ve kapsama
 * testlerini mümkün kılar; metin dondurulacağı için (`weekly_card`) ayrıca
 * saklanır.
 */
export interface LineResult {
  id: string;
  text: string;
}

/**
 * Unvan seçiminin sonucu (spec S3 netleştirme #3): `basedOnCategories`
 * S7'nin "kartta bir kategori gizlendiğinde unvanı da gizle/değiştir"
 * kararı için veri sağlar (S7'nin işi, S3 yalnızca veriyi üretir).
 * - Temel unvan (S3 netleştirme #1.b): tam 1 eleman (o kategori).
 * - Kombinasyon kuralı: ilgili 2+ kategori.
 * - Hiçbir tek/çift kategoriye özgü olmayan genel kural (ör. "dört
 *   kategori ortada"): boş dizi `[]`.
 */
export interface TitleResult {
  id: string;
  text: string;
  basedOnCategories: Category[];
}

/**
 * Kart açıldığında `weekly_card` tablosuna dondurulacak anlık görüntü
 * (spec "Veri modeli" > `weekly_card`). `buildCard`'ın saf çıktısıdır;
 * `generated_at` gibi gerçek zamana bağlı alanlar burada YOKTUR — onlar
 * veri katmanında, kart ilk kez kalıcı hale getirilirken eklenir (`buildCard`
 * saf bir fonksiyondur, `now` parametresi almaz).
 */
export interface CardSnapshot {
  /** Haftanın Pazartesi tarihi, `YYYY-MM-DD` (yerel). */
  weekStart: string;
  /** Kartı üreten (tekilleştirilmiş) dolu gün sayısı. */
  checkinDays: number;
  title: TitleResult;
  lines: Record<Category, LineResult>;
  deltas: Record<Category, Delta>;
  summary: LineResult;
  /** Metin havuzu sürümü (spec "Veri modeli" > `weekly_card.content_version`). */
  contentVersion: number;
}

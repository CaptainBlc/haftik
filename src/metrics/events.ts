/**
 * Ölçüm olayları — sabit küme (spec "Tablo: metric_event", E1 Seçenek A,
 * `plan.md` S9). Kanonik tanım `src/data/metric-repo.ts`'te kalır (S5'ten);
 * bu dosya S9'un genel API'sidir (yeniden dışa aktarım + doğrulama).
 *
 * **Olay yalnızca ad + hafta (nullable) + zaman damgası taşır.** İçerik,
 * değer, konum, cihaz kimliği ve **kategori adı taşımaz**: `line_hidden`
 * yalnızca bir sayaçtır, hangi satırın gizlendiği kaydedilmez.
 *
 * Sayım kuralları (S9 kararı, ayrıntı `CLAUDE.md` "Bilinen tuzaklar"):
 * - `check_in_saved`: her başarılı kayıt (aynı günü düzenleyip tekrar
 *   kaydetmek de sayılır; D7 bu olaydan değil `checkin` tablosundan hesaplanır).
 * - `card_unlocked`: hafta başına EN FAZLA BİR KEZ (hafta ekranında kart
 *   ilk kez açılabilir görüldüğünde; `trackEventOnce`).
 * - `card_opened`: kart açılış ekranı her başarılı yüklendiğinde (tekrar açış
 *   da sayılır; rapor yalnızca `>= 1` ile ilgilenir).
 * - `share_initiated`: paylaşım sayfası açılmadan hemen önce (kullanıcı
 *   iptal etse de sayılır => paylaşım FAZLA sayılır).
 * - `line_hidden`: paylaşım başlatılırken dışarı çıkan karttaki gizli satır
 *   sayısı kadar kayıt (varsayılan gizliler dahil); kategori bilgisi yok.
 */
import { METRIC_EVENT_NAMES, type MetricEventName } from '@/data/metric-repo';

export { METRIC_EVENT_NAMES };
export type { MetricEventName };

export function isMetricEventName(value: unknown): value is MetricEventName {
  return typeof value === 'string' && (METRIC_EVENT_NAMES as readonly string[]).includes(value);
}

/**
 * `metric_counter` (v3) sayaçları: sabit ad kümesi + her ad için kapalı `dim` sözlüğü (27 §2.3). DB'de
 * CHECK yok, doğrulama burada. Yeni sayaç eklemek bu tabloya satır eklemekten ibarettir (migration yok).
 * Hepsi kimliksiz, içeriksiz, kategorisiz sayaçlardır (27 §2.4 "uyumlu" sınıfı).
 */
export const COUNTER_DIMS = {
  /** Paylaşım başına gizlenen satır sayısı (0..4). */
  share_hidden_n: ['0', '1', '2', '3', '4'],
  /** Varsayılan gizleme (uyku + harcama) değiştirilmeden mi paylaşıldı? y/n. */
  share_default_kept: ['y', 'n'],
  /** Bildirime dokunarak uygulama açıldı. Yalnız tür: kart-hazır ya da günlük. */
  notif_opened: ['card_ready', 'daily'],
} as const;

export type MetricCounterName = keyof typeof COUNTER_DIMS;

export function isCounterEvent(name: unknown, dim: unknown): name is MetricCounterName {
  return (
    typeof name === 'string' &&
    typeof dim === 'string' &&
    Object.prototype.hasOwnProperty.call(COUNTER_DIMS, name) &&
    (COUNTER_DIMS[name as MetricCounterName] as readonly string[]).includes(dim)
  );
}

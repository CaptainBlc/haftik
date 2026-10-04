/**
 * Bildirim metinleri (spec güvenlik gereksinimi 4, `plan.md` S8): sabit,
 * girdiden bağımsız. Rakam, seviye (düşük/orta/yüksek), kategori adı veya
 * kaç gün kaldığı ipucu İÇERMEZ; tavsiyesiz, tanısız, suçlayıcı olmayan ton.
 * Plan çıktısı yalnızca `kind` taşır, metni scheduler bu dosyadan çözer.
 *
 * **S16a (19 §5.1, A15):** eski adlandırma yerine "Haftanın kartı hazır"
 * (kullanıcıya dönük her yüzeyde "Kart"); `card-ready` metni K3 akışını (bugünü de işaretle)
 * önceden söyler. `daily` için 4 varyantlı havuz: hangi günde hangisi çıkacağı
 * haftanın gününe göre SABİT (deterministik, "sürpriz"/alışkanlık tasarımı yok,
 * veri sızdırmaz). "Vites" imgesi bildirimde kullanılmaz (A15). Metin taslağı
 * copywriter'ındır, son söz Batuhan'ın (`docs/s16a-metin-onayi.md`).
 */
export type NotificationKind = 'daily' | 'card-ready';

export interface NotificationText {
  readonly title: string;
  readonly body: string;
}

/** `daily` havuzu: sıra sabit, `getNotificationText` haftanın gününe göre seçer. */
export const DAILY_NOTIFICATION_VARIANTS: readonly NotificationText[] = [
  { title: 'Bugün nasıldı?', body: 'Birkaç saniyede bugünü işaretleyebilirsin.' },
  { title: 'Bugünün emojisi hangisi?', body: 'Dört emoji, birkaç saniye.' },
  { title: 'Sayfa seni bekliyor.', body: 'Bugünü işaretlemek birkaç saniye sürer.' },
  { title: 'Günün emoji özeti zamanı.', body: 'Dört soru, tek Kaydet.' },
];

export const NOTIFICATION_TEXTS: Readonly<Record<NotificationKind, NotificationText>> = {
  daily: DAILY_NOTIFICATION_VARIANTS[0],
  'card-ready': {
    title: 'Haftanın kartı hazır',
    body: 'Bugünü de işaretlediysen kart seni bekliyor.',
  },
};

/**
 * Bildirimin metnini döndürür. `daily`: `fireAt`in yerel haftanın günü
 * (`Date.getDay()`) havuz uzunluğuna bölünerek seçilir (deterministik).
 */
export function getNotificationText(kind: NotificationKind, fireAt: Date): NotificationText {
  if (kind === 'daily') {
    return DAILY_NOTIFICATION_VARIANTS[fireAt.getDay() % DAILY_NOTIFICATION_VARIANTS.length];
  }
  return NOTIFICATION_TEXTS[kind];
}

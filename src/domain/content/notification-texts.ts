/**
 * Bildirim metinleri (spec güvenlik gereksinimi 4, `plan.md` S8): sabit,
 * girdiden bağımsız. Rakam, seviye (düşük/orta/yüksek), kategori adı veya
 * kaç gün kaldığı ipucu İÇERMEZ; tavsiyesiz, tanısız, suçlayıcı olmayan ton.
 * Plan çıktısı yalnızca `kind` taşır, metni scheduler bu tablodan çözer.
 */
export type NotificationKind = 'daily' | 'card-ready';

export const NOTIFICATION_TEXTS: Readonly<
  Record<NotificationKind, { readonly title: string; readonly body: string }>
> = {
  daily: {
    title: 'Bugün nasıldı?',
    body: 'Birkaç saniyede bugünü işaretleyebilirsin.',
  },
  'card-ready': {
    title: 'Karnen hazır',
    body: 'Bu haftanın kartı seni bekliyor.',
  },
};

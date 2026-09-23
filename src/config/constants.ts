/**
 * K4 (uygulama adı, spec E8) / K5 (mağaza bağlantısı, spec E5) için tek
 * kaynak yer tutucular (`plan.md` "Değişecek dosyalar":
 * "src/config/constants.ts  uygulama adı, mağaza URL'si YER TUTUCULARI —
 * tek yerde (K4, K5)"; kapı tablosu: K4/K5 "S12 öncesi zorunlu").
 *
 * `CardView`'in gömülü damgası (`docs/ux/kart-yerlesimi.md` "Gömülü damga
 * + mağaza bağlantısı yeri") burayı okur. S12'de K4/K5 kesinleşince yalnızca
 * bu dosya güncellenir — kart yeniden üretilir, başka hiçbir dosyada bu
 * değerler literal olarak tekrarlanmaz (tek kaynak).
 */

/** K4 — uygulama adı: "Haftik" (Batuhan seçimi, 2026-09-23; mağaza/alan adı/TÜRKPATENT kontrolü Batuhan'da). */
export const APP_DISPLAY_NAME = 'Haftik';

/** K5 — mağaza bağlantısı (kesinleşene kadar yer tutucu, spec E5 hâlâ açık). */
export const STORE_LINK_PLACEHOLDER = '[mağaza bağlantısı]';

/**
 * Kartın alt-orta gömülü damga metni (`kart-yerlesimi.md` satır 93-95
 * biçimi: `Haftik · [mağaza bağlantısı]`).
 */
export const CARD_STAMP_TEXT = `${APP_DISPLAY_NAME} · ${STORE_LINK_PLACEHOLDER}`;

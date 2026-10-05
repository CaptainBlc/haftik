/**
 * Kaydet anı geri bildirimi cümleleri (S22; `19-metin-ve-icerik-v2.md` §3.2, `18-ux-akislar-v2.md` §2.5).
 * **Taslak: metin onayı Batuhan'da** (`docs/s22-metin-onayi.md`).
 *
 * Bu metinler kartın kendisi (PNG'ye giren dondurulmuş içerik) DEĞİLDİR; geçici uygulama içi arayüz
 * metnidir. Bu yüzden "bugün", "{r} gün" gibi o anki duruma gönderme yapabilir ve rakam serbesttir
 * (karar B10: rakam kuralı yalnız PNG için). Kurallar (testle bağlı, `save-feedback-texts.test.ts`):
 * - Hiçbir koşul seviye/kategori verisine bakmaz; cümleler yalnız gün sayısı ve zamandan türer.
 * - "Kart Pazar 20:00'de açılıyor" türü iddia yalnızca zaman koşulu henüz sağlanmamışken (D, E, F) kurulur.
 * - Yasak: seri, kaçırma, "hâlâ", kayıp dili. En çok 52 karakter (`{r}` tek hane).
 */
export type SaveFeedbackKind =
  | 'first' // A: ilk kayıt
  | 'below' // B: eşik altı, kalan >= 2
  | 'oneLeft' // C: eşik altı, kalan 1
  | 'thresholdReached' // D: eşik bu kayıtla doldu
  | 'extraDay' // E: eşik sonrası ek gün
  | 'fullWeek' // F: 7/7 (Pazar 20:00 öncesi)
  | 'updated' // G: aynı günün kaydı güncellendi
  | 'yesterday' // Y: dünün kaydı
  | 'sundayK3' // H: Pazar 20:00 sonrası, kart akışına otomatik devam
  | 'return' // I: dönüş (yeni haftanın ilk kaydı, >= 4 gün aradan sonra)
  | 'neutral'; // yedek: zaman penceresi geçmiş ya da başka koşul; ödülü şişirmeyen sade onay

/** `{r}` = kart için kalan gün sayısı. */
export const SAVE_FEEDBACK_TEXTS: Readonly<Record<SaveFeedbackKind, readonly string[]>> = {
  first: ['İlk gün sayfaya yapıştı.', 'Başladık. Gerisi de birkaç saniye sürer.', 'İlk gün tamam. Albüm açıldı.'],
  below: [
    'Bugün de tamam. Kart için {r} gün daha.',
    'Yapıştı. Kart için {r} gün daha var.',
    'Kaydedildi. Sayfada {r} yer daha var.',
    'Bugün sayfaya girdi. {r} gün daha.',
  ],
  oneLeft: ['Bir gün daha, kart için yeter.', 'Yapıştı. Kart bir gün uzakta.', 'Bugün tamam. Bir gün daha yeter.'],
  thresholdReached: [
    "Yeterli gün doldu. Kart Pazar 20:00'de açılıyor.",
    'Kart için gereken gün tamam. Pazar akşamı görüşürüz.',
    'Gereken gün doldu; kalanı senin keyfin.',
    'Sayfa yeterince doldu. Kart Pazar akşamı hazır.',
  ],
  extraDay: [
    "Bugün de sayfada. Kart Pazar'da hazır.",
    "Kaydedildi. Pazar 20:00'yi bekliyoruz.",
    'Yapıştı. Kart Pazar akşamı seni bekliyor.',
    "Bugün de eklendi. Kart Pazar 20:00'de.",
  ],
  fullWeek: [
    'Yedi günün yedisi de sayfada.',
    'Bu hafta hiç boşluk kalmadı.',
    "Tam sayfa. Kart bu akşam 20:00'de.",
    'Sayfanın her köşesi dolu.',
  ],
  updated: [
    'Bugünün kaydı güncellendi.',
    'Değişiklik yapıştırıldı.',
    'Güncellendi. Son hali geçerli.',
    'Fikir değişti, kayıt da değişti.',
  ],
  yesterday: ['Dün de sayfada.', 'Dünkü yer de doldu.', 'Dünkü kayıt tamam.'],
  sundayK3: ['Son gün de tamam. Kartın açılıyor.', 'Bugün de sayfada. Kartına geçiyoruz.', 'Yapıştı. Kart geliyor.'],
  return: ['Yeni sayfa, temiz başlangıç.', 'Hoş geldin. Yeni sayfa açık.', 'Bugünden devam. Sayfa yeni.'],
  neutral: ['Kaydedildi.'],
};

/** Yalnız "Pazar 20:00" gibi gelecekteki bir kart zamanı iddia edebilen türler (19 §3.2 denetim 2). */
export const SAVE_FEEDBACK_FUTURE_CLAIM_KINDS: readonly SaveFeedbackKind[] = ['thresholdReached', 'extraDay', 'fullWeek'];

/** Kayıt başarısız (X). Şimdilik `today.tsx`'teki uyarı kutusu kullanılıyor; metin onay bekliyor. */
export const SAVE_FEEDBACK_ERROR_TEXTS: readonly string[] = [
  'Kaydedemedik. Bir kez daha dener misin?',
  'Bu sefer olmadı. Bir kez daha dener misin?',
];

function dayNumber(localDate: string): number {
  const [y, m, d] = localDate.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/**
 * Cümleyi seçer. Seçim kaydedilen günün gün numarasına bağlıdır (deterministik; durum saklanmaz,
 * veri sızdırmaz): aynı türde ardışık iki gün hiçbir zaman aynı varyantı almaz, çünkü ardışık gün
 * numaraları havuz uzunluğuna (>= 2) bölününce farklı kalır. Tek varyantlı havuz bu kuralın dışındadır.
 */
export function getSaveFeedbackText(kind: SaveFeedbackKind, localDate: string, remaining = 0): string {
  const pool = SAVE_FEEDBACK_TEXTS[kind];
  const text = pool[dayNumber(localDate) % pool.length];
  return text.replace('{r}', String(remaining));
}

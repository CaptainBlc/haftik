/**
 * Paylaşım dosyaları için ADANMIŞ önbellek dizini (S16b; `docs/inceleme-2026-09-25/
 * 24-guvenlik-v2.md` §2.1, `22-platform-v2.md` F-8, `04-kod-incelemesi.md` #4).
 *
 * - **Sabit, kimliksiz dosya adı** (`Haftik-kart.png`): tarih/hafta adı taşımaz,
 *   "kartta tarih yok" kuralı dosya adından delinmez. Her paylaşım aynı adın
 *   üzerine yazar, yani birikme olmaz.
 * - **Silme `finally`de DEĞİL:** `expo-sharing` seçici hedef uygulamayı
 *   başlatırken çözülebilir, hedef `content://` URI'sini okumadan dosya silinirse
 *   boş/eksik görsel gider (04 #4). Bunun yerine dizin açılışta ve sonraki
 *   paylaşımda YAŞA GÖRE (varsayılan > 1 saat), "Tüm verilerimi sil"de tamamen
 *   süpürülür. Kalıntı penceresi uygulamaya özel dahili önbellekte kalır.
 * - Hepsi en iyi çabadır; hiçbir hata akışı bozmaz.
 *
 * `expo-file-system/legacy` yalnızca yerel OS API'sidir (ağ isteği yok).
 */
import * as FileSystem from 'expo-file-system/legacy';

export const SHARE_DIR_NAME = 'haftik-share';
export const SHARE_FILE_NAME = 'Haftik-kart.png';
/** Süpürmede dosyanın bu yaştan eskisi silinir. */
export const SHARE_MAX_AGE_MS = 60 * 60 * 1000;

/** Dizin URI'si (sonda `/`). Önbellek yoksa hata fırlatır: paylaşmadan çıkılır. */
export function getShareDirUri(): string {
  const base = FileSystem.cacheDirectory;
  if (!base) {
    throw new Error('share-dir: önbellek dizini bulunamadı.');
  }
  return `${base}${SHARE_DIR_NAME}/`;
}

export function getShareFileUri(fileName: string = SHARE_FILE_NAME): string {
  return `${getShareDirUri()}${fileName}`;
}

/** Dizini oluşturur (varsa no-op). Önbellek yoksa hata fırlatır. */
export async function ensureShareDir(): Promise<void> {
  await FileSystem.makeDirectoryAsync(getShareDirUri(), { intermediates: true });
}

/**
 * Dizindeki `maxAgeMs`ten eski dosyaları siler (yaşı bilinmeyen dosya da
 * silinir, gizlilik tarafında kalmak için). Dizin yoksa no-op.
 */
export async function sweepShareDir(
  maxAgeMs: number = SHARE_MAX_AGE_MS,
  nowMs: number = Date.now()
): Promise<void> {
  try {
    const dir = getShareDirUri();
    const names = await FileSystem.readDirectoryAsync(dir);
    for (const name of names) {
      try {
        const info = await FileSystem.getInfoAsync(`${dir}${name}`);
        const modifiedMs = info.exists && 'modificationTime' in info ? info.modificationTime * 1000 : null;
        if (modifiedMs === null || nowMs - modifiedMs > maxAgeMs) {
          await FileSystem.deleteAsync(`${dir}${name}`, { idempotent: true });
        }
      } catch {
        // en iyi çaba
      }
    }
  } catch {
    // dizin yok / önbellek yok: sorun değil
  }
}

/** "Tüm verilerimi sil": dizin ve içindeki her şey. */
export async function deleteShareDir(): Promise<void> {
  try {
    await FileSystem.deleteAsync(getShareDirUri(), { idempotent: true });
  } catch {
    // en iyi çaba
  }
}

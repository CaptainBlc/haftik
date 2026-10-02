/**
 * Deneme raporunun geçici dosyası (N-1, S9 SEC): yol tek yerde tanımlanır,
 * uygulama açılışında ve "Tüm verilerimi sil" akışında idempotent silinir
 * (ör. paylaşım sırasında uygulama öldürüldüyse kalan rapor dosyası).
 * Yalnızca yerel `expo-file-system/legacy`; ağ isteği yok.
 */
import * as FileSystem from 'expo-file-system/legacy';

import { getShareFileUri } from '@/card/share-dir';

export const REPORT_FILE_NAME = 'deneme-raporu.txt';

/**
 * S16b: rapor da adanmış paylaşım dizininde (`haftik-share/`) durur, böylece
 * tek süpürme/silme kapsamı olur. Önbellek dizini yoksa hata fırlatır.
 */
export function getReportFileUri(): string {
  return getShareFileUri(REPORT_FILE_NAME);
}

/** En iyi çaba, idempotent temizlik; hiçbir hata dışarı sızmaz. */
export async function deleteReportFile(): Promise<void> {
  try {
    await FileSystem.deleteAsync(getReportFileUri(), { idempotent: true });
  } catch {
    // en iyi çaba
  }
  // S16b öncesi sürümlerin önbellek köküne yazdığı eski konum (varsa).
  try {
    const base = FileSystem.cacheDirectory;
    if (base) {
      await FileSystem.deleteAsync(`${base}${REPORT_FILE_NAME}`, { idempotent: true });
    }
  } catch {
    // en iyi çaba
  }
}

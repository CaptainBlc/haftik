/**
 * Deneme raporunun geçici dosyası (N-1, S9 SEC): yol tek yerde tanımlanır,
 * uygulama açılışında ve "Tüm verilerimi sil" akışında idempotent silinir
 * (ör. paylaşım sırasında uygulama öldürüldüyse kalan rapor dosyası).
 * Yalnızca yerel `expo-file-system/legacy`; ağ isteği yok.
 */
import * as FileSystem from 'expo-file-system/legacy';

export const REPORT_FILE_NAME = 'deneme-raporu.txt';

/** Önbellek dizini yoksa boş string ile SESSİZCE devam etmek yerine hata fırlatır. */
export function getReportFileUri(): string {
  const dir = FileSystem.cacheDirectory;
  if (!dir) {
    throw new Error('report-file: önbellek dizini bulunamadı.');
  }
  return `${dir}${REPORT_FILE_NAME}`;
}

/** En iyi çaba, idempotent temizlik; hiçbir hata dışarı sızmaz. */
export async function deleteReportFile(): Promise<void> {
  try {
    await FileSystem.deleteAsync(getReportFileUri(), { idempotent: true });
  } catch {
    // en iyi çaba
  }
}

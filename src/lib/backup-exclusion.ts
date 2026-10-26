/**
 * iOS: veritabanı klasörünü (`Documents/SQLite`) iCloud/iTunes yedeğinden hariç
 * tutar. Android'de karşılığı `plugins/with-data-extraction-rules.js` (A17):
 * "telefon değişirse veri taşınmaz" sözü iki platformda da doğru olsun diye.
 *
 * DB dosyası oluşmadan ÖNCE çağrılır (`_layout.tsx`); klasördeki işaret içindeki
 * dosyaları da kapsar. Native modül (`modules/haftik-backup`) yalnızca iOS'ta
 * vardır; Android ve Jest'te `null` döner ve çağrı no-op'tur. En iyi çaba:
 * hata uygulamayı düşürmez, sabit metinli uyarı verir.
 */
import { requireOptionalNativeModule } from 'expo-modules-core';

type HaftikBackupModule = {
  excludeDirectoryFromBackup(path: string): boolean;
};

let attempted = false;

/**
 * Idempotent: yalnızca ilk çağrıda dener (Fast Refresh/yeniden render güvenli).
 * @returns işaret konduysa `true`; native modül yoksa (Android/Jest), hata olursa
 * ya da daha önce denendiyse `false`.
 */
export function excludeDatabaseDirFromBackup(): boolean {
  if (attempted) {
    return false;
  }
  attempted = true;
  try {
    const native = requireOptionalNativeModule<HaftikBackupModule>('HaftikBackup');
    if (!native) {
      return false;
    }
    // Lazy: native modülü olmayan ortamda expo-sqlite hiç yüklenmez.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { defaultDatabaseDirectory } = require('expo-sqlite') as typeof import('expo-sqlite');
    if (!defaultDatabaseDirectory) {
      return false;
    }
    const ok = native.excludeDirectoryFromBackup(defaultDatabaseDirectory);
    if (!ok) {
      console.warn('Yedek hariç tutma işareti konamadı');
    }
    return ok;
  } catch {
    console.warn('Yedek hariç tutma çağrısı başarısız');
    return false;
  }
}

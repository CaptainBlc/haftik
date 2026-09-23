/**
 * Kalan geçici kart PNG'lerini süpürme (S10 SEC I-1). Paylaşım sayfası açıkken
 * uygulama öldürülürse `shareCard`in `finally`si çalışmaz; bu süpürme açılışta
 * ve "Tüm verilerimi sil"de en iyi çabayla bu kalıntıları temizler.
 *
 * **Desen kaynağı (react-native-view-shot, node_modules'tan doğrulandı):**
 * Android `RNViewShotModule.java`: `TEMP_FILE_PREFIX = "ReactNative-snapshot-image"`,
 * `File.createTempFile(prefix, ".png", cacheDir)` -> dosya adı
 * `ReactNative-snapshot-image<rastgele>.png`, dizin `context.getCacheDir()`
 * (= `FileSystem.cacheDirectory`; bu modül harici cache'e yazmayı da seçebilir,
 * o dizine bu API ile erişilemez, ama modülün kendi CleanTask'ı hem açılışta hem
 * kapanışta onu da temizler). iOS `RNViewShot.mm`: dosyalar `NSTemporaryDirectory()/ReactNative/`
 * altında (`RCTTempFilePath`), yani `cacheDirectory` DEĞİL; expo-file-system
 * bu dizini sunmadığı için iOS süpürmesi burada yapılamaz (S11 açık maddesi;
 * iOS tmp'yi işletim sistemi kendisi temizler, paylaşım sonrası `shareCard`
 * dosyayı zaten siler).
 *
 * Yalnızca bu desene uyan dosyalar silinir; başka dosyaya dokunulmaz.
 */
import * as FileSystem from 'expo-file-system/legacy';

export const SNAPSHOT_FILE_PREFIX = 'ReactNative-snapshot-image';
export const SNAPSHOT_FILE_EXT = '.png';

export function isSnapshotFileName(name: string): boolean {
  return name.startsWith(SNAPSHOT_FILE_PREFIX) && name.endsWith(SNAPSHOT_FILE_EXT);
}

/** En iyi çaba, idempotent; hiçbir hata dışarı sızmaz. */
export async function sweepSnapshotFiles(): Promise<void> {
  try {
    const dir = FileSystem.cacheDirectory;
    if (!dir) {
      return;
    }
    const names = await FileSystem.readDirectoryAsync(dir);
    for (const name of names) {
      if (!isSnapshotFileName(name)) {
        continue;
      }
      try {
        await FileSystem.deleteAsync(`${dir}${name}`, { idempotent: true });
      } catch {
        // en iyi çaba
      }
    }
  } catch {
    // en iyi çaba
  }
}

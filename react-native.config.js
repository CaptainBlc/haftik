/**
 * S18 (28 §4.9, A18) + worklets temizliği (2026-10-05): kullanılmayan native modüller derlemeden dışlanır.
 *
 * - `react-native-reanimated`: uygulamada hiç kullanılmıyor (`src/`te import yok); yalnızca
 *   `react-native-drawer-layout`ın (expo-router bağımlılığı) zorunlu peer'i olarak node_modules'ta kalıyor.
 *   package.json'dan çıkarmak yetmez (npm peer'i yine kurar, RN autolinking yine derler); native kod
 *   (1,54 MB .so) buradan derleme dışı bırakılır.
 * - `react-native-worklets`: uygulamada kullanılmıyor (reanimated'ın ve `@expo/ui`nin peer'i, `expo-modules-core`un
 *   İSTEĞE BAĞLI peer'i). `expo-modules-core` Gradle'ı `findProject(":react-native-worklets")` boşsa entegrasyonu
 *   atlar (`build.gradle` satır 64-79, 227). Dışlama: `libworklets.so` (1,05 MB) APK'dan düştü, release APK
 *   33,57 -> 32,46 MB. JS tarafı (`react-native-worklets` paketi) pakette kalır ve açılışta çökmez (K4: açılış,
 *   sekmeler, kart reveal, paylaşım, rapor, bildirim planı). package.json'daki doğrudan bağımlılık SÜRÜMÜ SABİTLEMEK
 *   için durur (Expo uyumu; `expo-doctor`).
 *
 * Geri alma: ilgili satırı ya da bu dosyayı sil. Doğrulama: release APK'da `libreanimated.so` ve `libworklets.so`
 * olmamalı; uygulama açılışta, sekme/stack/kart modalı geçişlerinde ve bildirim planlamasında çökmemeli.
 * Koruma: `__tests__/infra/release-config.test.ts`, `__tests__/infra/native-exclusion.test.ts`.
 */
module.exports = {
  dependencies: {
    'react-native-reanimated': {
      platforms: { android: null, ios: null },
    },
    'react-native-worklets': {
      platforms: { android: null, ios: null },
    },
  },
};

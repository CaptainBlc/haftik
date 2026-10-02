/**
 * S18 (28 §4.9, A18): `react-native-reanimated` uygulamada hiç kullanılmıyor
 * (`src/`te import yok); yalnızca `react-native-drawer-layout`ın (expo-router
 * bağımlılığı) zorunlu peer'i olarak node_modules'ta kalıyor. package.json'dan
 * çıkarmak yetmez (npm peer'i yine kurar, RN autolinking yine derler); native
 * kod (1,54 MB .so) buradan derleme dışı bırakılır. `react-native-worklets`
 * `expo-modules-core`un bağımlılığı olduğundan KALIR.
 *
 * Geri alma: bu dosyayı sil. Doğrulama: release APK'da `libreanimated.so`
 * olmamalı, uygulama sekme/stack/kart modalı geçişlerinde çökmemeli.
 */
module.exports = {
  dependencies: {
    'react-native-reanimated': {
      platforms: { android: null, ios: null },
    },
  },
};

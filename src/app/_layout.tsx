import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sweepSnapshotFiles } from '@/card/temp-cleanup';
import { initAppDatabase } from '@/data/init';
import { deleteReportFile } from '@/metrics/report-file';
import { configureNotificationHandler } from '@/notify/scheduler';
import { syncNotificationsNow } from '@/notify/wiring';

SplashScreen.preventAutoHideAsync();

/**
 * Zaman simülasyon paneli (`plan.md` S6) yalnızca geliştirme derlemesinde
 * yüklenir. Bilerek statik `import` DEĞİL, `__DEV__` korumalı `require()`
 * kullanılır (`src/data/db.ts`'teki lazy-require deseniyle aynı) — amaç,
 * üretim paketleyicisinin bu dalı ideal olarak hiç çözmemesi/taşımaması;
 * kesin üretim paketi doğrulaması S10'un işidir (bkz. `src/dev/dev-time-menu.tsx`
 * dosya başı notu).
 */
let DevTimeMenu: React.ComponentType | null = null;
if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  DevTimeMenu = (require('@/dev/dev-time-menu') as typeof import('@/dev/dev-time-menu'))
    .DevTimeMenu;
}

export default function RootLayout() {
  // Idempotent (bkz. `data/init.ts`): her render'da güvenle tekrar
  // çağrılabilir, yalnızca ilk çağrıda gerçekten sürücü kurar.
  initAppDatabase();

  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
    // N-1: önceki oturumdan kalmış geçici deneme raporu dosyası (en iyi çaba).
    void deleteReportFile();
    // S10 I-1: paylaşım sırasında öldürülmüş oturumdan kalan geçici kart PNG'leri.
    void sweepSnapshotFiles();
  }, []);

  // S8: açılışta ve öne gelişte bildirimleri yeniden planla (saat dilimi/izin
  // değişimi de böylece yakalanır). Hata akışı bozmaz.
  useEffect(() => {
    try {
      configureNotificationHandler();
    } catch {
      // native modül yoksa sessizce geç
    }
    void syncNotificationsNow();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void syncNotificationsNow();
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="card/[weekStart]" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
      {/* YB-1: açık zeminde koyu, koyu zeminde açık durum çubuğu ikonları (JS'te, native derleme gerekmez). */}
      <StatusBar style="auto" />
      {DevTimeMenu ? <DevTimeMenu /> : null}
    </ThemeProvider>
  );
}

/**
 * Kök hata sınırı (S14 "veri sağlamlığı", Ç29 kararı — bkz.
 * `docs/kararlar/2026-10-01-cekirdekten-once-kararlar.md` ve
 * `docs/inceleme-2026-09-25/28-muhendislik-standartlari-v2.md` §4.5).
 * `expo-router`'ın "aynı route dosyasından `ErrorBoundary` dışa aktarımı"
 * sözleşmesini kullanır (bkz. `node_modules/expo-router/build/views/
 * ErrorBoundary.d.ts`): bu dosyanın (`_layout.tsx`) render'ında fırlayan
 * HER hatayı yakalar — en önemlisi `initAppDatabase()`'in render sırasında
 * (yukarıda, `useEffect` DIŞINDA) senkron çağrılması, yani bir migration
 * hatası (ör. T7'nin koruyamadığı bir disk/izin hatası) burada yakalanır.
 *
 * **Kasıtlı olarak yalnızca "Tekrar dene" gösterir, veri silme SEÇENEĞİ
 * SUNMAZ** (tech-lead kararı, Ç29): `retry()` bileşeni yeniden mount eder,
 * `initAppDatabase`'in `initialized` bayrağı hâlâ `false` olduğundan
 * `setDriver`/`runMigrations` baştan (T7 sayesinde temiz bir sürümden)
 * yeniden dener. Kalıcı bir hata (ör. bozuk disk) için veri silme yolu
 * ayrı, çift onaylı bir karar olur — şimdi eklenmedi.
 */
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  const colorScheme = useColorScheme();
  const palette = colorScheme === 'dark' ? darkPalette : lightPalette;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: palette.text }]}>Bir şeyler ters gitti.</Text>
        <Text style={[styles.message, { color: palette.textSecondary }]}>
          Uygulama açılırken bir hata oluştu. Verilerin cihazında duruyor; tekrar denemek
          genellikle sorunu çözer.
        </Text>
        <Text
          testID="root-error-boundary-detail"
          style={[styles.detail, { color: palette.textSecondary }]}
        >
          {error.message}
        </Text>
        <Pressable
          testID="root-error-boundary-retry"
          onPress={retry}
          style={[styles.button, { backgroundColor: palette.accent }]}
        >
          <Text style={styles.buttonText}>Tekrar dene</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const lightPalette = {
  background: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#60646C',
  accent: '#208AEF',
} as const;

const darkPalette = {
  background: '#000000',
  text: '#FFFFFF',
  textSecondary: '#B0B4BA',
  accent: '#208AEF',
} as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  message: {
    fontSize: 15,
    lineHeight: 21,
  },
  detail: {
    fontSize: 12,
    opacity: 0.7,
  },
  button: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, useColorScheme } from 'react-native';

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
      {DevTimeMenu ? <DevTimeMenu /> : null}
    </ThemeProvider>
  );
}

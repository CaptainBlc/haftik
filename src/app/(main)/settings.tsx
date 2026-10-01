/**
 * Ayarlar ekranı — rota katmanı (`spec.md` "MVP kapsamı", `plan.md` S6:
 * "deneme raporu düğmesi S9'da eklenecek"). Onay diyaloğu ve gerçek
 * gizlilik bağlantısı burada (Alert ile) ele alınır; `SettingsView` saf
 * kalır.
 */
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, Linking } from 'react-native';

import { LoadingView } from '@/components/loading-view';
import { SettingsView } from '@/components/settings-view';
import { deleteAllData } from '@/data/delete-all';
import {
  getAllSettings,
  setReminderEnabled,
  setReminderTime,
  type Settings,
} from '@/data/setting-repo';
import { getNow } from '@/lib/now';
import { confirmAndShareTrialReport } from '@/metrics/report-confirm';
import type { PermissionState } from '@/notify/scheduler';
import {
  cancelAllNotifications,
  getNotificationPermissionState,
  requestPermissionAndSync,
  runDeleteExclusive,
  syncNotificationsNow,
} from '@/notify/wiring';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [permission, setPermission] = useState<PermissionState | null>(null);

  useEffect(() => {
    getAllSettings().then(setSettings);
  }, []);

  // B8: izin sistem ayarlarından değişmiş olabilir; sekme odağa gelince ve
  // uygulama öne gelince (AppState 'active') yeniden oku. İzin yeni verildiyse
  // plan da kurulsun (sync izin kapılıdır, izin İSTEMEZ).
  const refreshPermission = useCallback(() => {
    void getNotificationPermissionState().then((next) => {
      setPermission(next);
      if (next.granted) {
        void syncNotificationsNow();
      }
    });
  }, []);

  useFocusEffect(refreshPermission);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshPermission();
      }
    });
    return () => subscription.remove();
  }, [refreshPermission]);

  if (!settings) {
    return <LoadingView />;
  }

  async function handleToggleReminder(value: boolean) {
    setSettings((prev) => (prev ? { ...prev, reminderEnabled: value } : prev));
    await setReminderEnabled(value);
    if (value) {
      // Kullanıcı akışı: izin yok ve sistem tekrar sorabiliyorsa burada istenir
      // (Android 13+: `denied` + `canAskAgain`, BLG-01); reddedilirse anahtar
      // kapalı görünür ve durum satırı gösterilir, çökmez.
      await requestPermissionAndSync();
      setPermission(await getNotificationPermissionState());
    } else {
      await syncNotificationsNow();
    }
  }

  async function handleChangeTime(value: string) {
    setSettings((prev) => (prev ? { ...prev, reminderTime: value } : prev));
    await setReminderTime(value);
    await syncNotificationsNow();
  }

  function handleDeleteAllPress() {
    Alert.alert('Tüm verilerimi sil', 'Bu işlem geri alınamaz. Emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          // Sıra: iptal önce (en iyi çaba), tablo silme sonra (bkz.
          // `delete-all.ts`). Silme sonrası `onboardingDone=false` olduğundan
          // tetiklenen sync no-op'tur, bildirim yeniden kurulmaz (S8).
          await runDeleteExclusive(() => deleteAllData(() => cancelAllNotifications()));
          // BLG-05: silinen veriyle ana ekranlarda kalınmaz; onboarding kapısı
          // ('/' -> useOnboardingGate) yeniden okur ve onboarding tekrar çalışır.
          router.replace('/');
        },
      },
    ]);
  }

  function handleTrialReport() {
    // Kullanıcı tetikli (S9); önce ne gideceği gösterilir (I-2), otomatik gönderim yok.
    confirmAndShareTrialReport(() => getNow());
  }

  function handlePrivacyPress() {
    Alert.alert('Gizlilik politikası', 'Gizlilik politikası yayına yakın eklenecek.');
  }

  return (
    <SettingsView
      reminderEnabled={settings.reminderEnabled}
      reminderTime={settings.reminderTime}
      onToggleReminder={handleToggleReminder}
      onChangeTime={handleChangeTime}
      onDeleteAll={handleDeleteAllPress}
      onPrivacyPress={handlePrivacyPress}
      onTrialReport={handleTrialReport}
      notificationPermission={permission?.status ?? null}
      canAskAgain={permission ? permission.canAskAgain : true}
      onOpenSystemSettings={() => {
        void Linking.openSettings();
      }}
    />
  );
}

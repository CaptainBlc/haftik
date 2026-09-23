/**
 * Ayarlar ekranı — rota katmanı (`spec.md` "MVP kapsamı", `plan.md` S6:
 * "deneme raporu düğmesi S9'da eklenecek"). Onay diyaloğu ve gerçek
 * gizlilik bağlantısı burada (Alert ile) ele alınır; `SettingsView` saf
 * kalır.
 */
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

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
import type { PermissionStatus } from '@/notify/scheduler';
import {
  cancelAllNotifications,
  getNotificationPermission,
  requestPermissionAndSync,
  runDeleteExclusive,
  syncNotificationsNow,
} from '@/notify/wiring';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [permission, setPermission] = useState<PermissionStatus | null>(null);

  useEffect(() => {
    getAllSettings().then(setSettings);
    getNotificationPermission().then(setPermission);
  }, []);

  if (!settings) {
    return <LoadingView />;
  }

  async function handleToggleReminder(value: boolean) {
    setSettings((prev) => (prev ? { ...prev, reminderEnabled: value } : prev));
    await setReminderEnabled(value);
    if (value) {
      // Kullanıcı akışı: izin henüz sorulmadıysa burada istenir; reddedilirse
      // çökmeden durum satırı gösterilir.
      setPermission(await requestPermissionAndSync());
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
          const fresh = await getAllSettings();
          setSettings(fresh);
        },
      },
    ]);
  }

  function handleTrialReport() {
    // Kullanıcı tetikli (S9); önce ne gideceği gösterilir (I-2), otomatik gönderim yok.
    confirmAndShareTrialReport(() => getNow());
  }

  function handlePrivacyPress() {
    Alert.alert('Gizlilik politikası', "Bağlantı S12'de eklenecek.");
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
      notificationPermission={permission}
    />
  );
}

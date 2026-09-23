/**
 * Ayarlar ekranı — sunum bileşeni (`spec.md` "MVP kapsamı": "hatırlatma
 * saati/aç-kapa, 'Tüm verilerimi sil', gizlilik politikası bağlantısı,
 * deneme raporu"; S9'da `onTrialReport` prop'uyla eklendi, verilmezse düğme yok).
 *
 * Onay diyaloğu (silme öncesi) ve gerçek gizlilik bağlantısı bu bileşenin
 * DIŞINDA, çağıran rotada (`src/app/(main)/settings.tsx`) ele alınır — bu
 * bileşen `Alert`/navigasyona dokunmaz, yalnızca callback'leri tetikler
 * (testlenebilirlik için).
 */
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Basit önayarlar; serbest metin saat girişi yerine (geçersiz HH:MM riski yok). */
export const REMINDER_TIME_PRESETS = ['20:00', '21:00', '22:00', '23:00'] as const;

export interface SettingsViewProps {
  reminderEnabled: boolean;
  reminderTime: string;
  onToggleReminder: (value: boolean) => void;
  onChangeTime: (value: string) => void;
  onDeleteAll: () => void;
  onPrivacyPress: () => void;
  /** S8: bildirim izni durumu; `denied` ise bilgi satırı gösterilir (isteğe bağlı, geriye dönük uyumlu). */
  notificationPermission?: 'granted' | 'denied' | 'undetermined' | null;
  /** S9: "Deneme raporu" düğmesi; verilmezse düğme gösterilmez (geriye dönük uyumlu). */
  onTrialReport?: () => void;
}

export function SettingsView({
  reminderEnabled,
  reminderTime,
  onToggleReminder,
  onChangeTime,
  onDeleteAll,
  onPrivacyPress,
  notificationPermission,
  onTrialReport,
}: SettingsViewProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.heading}>
        Ayarlar
      </ThemedText>

      <View style={styles.row}>
        <ThemedText>Günlük hatırlatma</ThemedText>
        <Switch
          testID="reminder-enabled-switch"
          value={reminderEnabled}
          onValueChange={onToggleReminder}
        />
      </View>

      {notificationPermission === 'denied' ? (
        <ThemedText testID="notification-permission-denied" type="small" themeColor="textSecondary">
          Bildirim izni kapalı. Hatırlatma ve kart bildirimi için sistem ayarlarından izin
          verebilirsin.
        </ThemedText>
      ) : null}

      <View style={styles.section}>
        <ThemedText type="small">Hatırlatma saati</ThemedText>
        <View style={styles.presetsRow}>
          {REMINDER_TIME_PRESETS.map((preset) => {
            const selected = preset === reminderTime;
            return (
              <Pressable
                key={preset}
                testID={`reminder-time-${preset}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                disabled={!reminderEnabled}
                onPress={() => onChangeTime(preset)}
                style={[
                  styles.presetChip,
                  { backgroundColor: theme.backgroundElement },
                  selected && { backgroundColor: theme.backgroundSelected },
                  !reminderEnabled && styles.presetChipDisabled,
                ]}>
                <ThemedText>{preset}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {onTrialReport ? (
        <View style={styles.section}>
          <Pressable
            testID="trial-report-button"
            accessibilityRole="button"
            onPress={onTrialReport}
            style={[styles.presetChip, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText>Deneme raporunu paylaş</ThemedText>
          </Pressable>
          <ThemedText type="small" themeColor="textSecondary">
            Yalnızca sayaçlar içerir (kart metni, tarih ve kimlik yok). Kendin seçtiğin yere
            gider; kendiliğinden hiçbir yere gönderilmez.
          </ThemedText>
        </View>
      ) : null}

      <Pressable
        testID="privacy-link"
        accessibilityRole="link"
        onPress={onPrivacyPress}
        style={styles.linkRow}>
        <ThemedText themeColor="textSecondary">Gizlilik politikası (yakında)</ThemedText>
      </Pressable>

      <Pressable
        testID="delete-all-button"
        accessibilityRole="button"
        onPress={onDeleteAll}
        style={styles.deleteButton}>
        <ThemedText type="smallBold" style={styles.deleteLabel}>
          Tüm verilerimi sil
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  heading: {
    fontSize: 28,
    lineHeight: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: {
    gap: Spacing.two,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  presetChip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  presetChipDisabled: {
    opacity: 0.4,
  },
  linkRow: {
    paddingVertical: Spacing.two,
  },
  deleteButton: {
    marginTop: 'auto',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: '#D7263D22',
    alignItems: 'center',
  },
  deleteLabel: {
    color: '#D7263D',
  },
});

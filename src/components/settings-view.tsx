/**
 * Ayarlar ekranı — sunum bileşeni (`spec.md` "MVP kapsamı": "hatırlatma
 * saati/aç-kapa, 'Tüm verilerimi sil', gizlilik politikası bağlantısı,
 * deneme raporu"; S9'da `onTrialReport` prop'uyla eklendi, verilmezse düğme yok).
 *
 * Onay diyaloğu (silme öncesi) ve gerçek gizlilik bağlantısı bu bileşenin
 * DIŞINDA, çağıran rotada (`src/app/(main)/settings.tsx`) ele alınır — bu
 * bileşen `Alert`/navigasyona dokunmaz, yalnızca callback'leri tetikler
 * (testlenebilirlik için).
 *
 * Emülatör bulguları: izin yokken anahtar KAPALI çizilir (B8), seçili saat
 * çipi çerçeveli (B9), hedefler >= 48dp ve içerik kaydırılabilir (B10),
 * çipler sarılır (BLG-08).
 */
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTopInset } from '@/hooks/use-top-inset';
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
  /**
   * S8: bildirim izni durumu (isteğe bağlı, geriye dönük uyumlu). İzin
   * biliniyor ve `granted` DEĞİLSE anahtar KAPALI çizilir (emülatör UX B8:
   * "anahtar açık + izin kapalı" çelişkisi); `null`/verilmezse izin
   * bilinmiyor sayılır ve anahtar kullanıcı tercihini gösterir.
   */
  notificationPermission?: 'granted' | 'denied' | 'undetermined' | null;
  /** İzin yokken sistem tekrar sorabiliyor mu (varsayılan: evet). Hayır ise "Ayarları aç" gösterilir. */
  canAskAgain?: boolean;
  /** "Ayarları aç" düğmesi (`Linking.openSettings`); yalnızca kalıcı ret durumunda gösterilir. */
  onOpenSystemSettings?: () => void;
  /** S9: "Deneme raporu" düğmesi; verilmezse düğme gösterilmez (geriye dönük uyumlu). */
  onTrialReport?: () => void;
  /**
   * S16b (26 R-1): sürüm satırı (çok satırlı düz metin, `lib/build-info.ts`). Seçilebilir
   * (uzun basıp kopyalanır); verilmezse gösterilmez (geriye dönük uyumlu).
   */
  buildInfo?: string;
}

export function SettingsView({
  reminderEnabled,
  reminderTime,
  onToggleReminder,
  onChangeTime,
  onDeleteAll,
  onPrivacyPress,
  notificationPermission,
  canAskAgain = true,
  onOpenSystemSettings,
  onTrialReport,
  buildInfo,
}: SettingsViewProps) {
  const theme = useTheme();
  const topInset = useTopInset();
  const permissionMissing =
    notificationPermission !== null &&
    notificationPermission !== undefined &&
    notificationPermission !== 'granted';
  // İzin yokken hatırlatma fiilen kapalıdır: anahtar ve saat çipleri buna göre.
  const effectiveEnabled = reminderEnabled && !permissionMissing;

  return (
    <ThemedView style={[styles.flex, { paddingTop: topInset }]}>
      <ScrollView testID="settings-scroll" contentContainerStyle={styles.container}>
        <ThemedText type="title" style={styles.heading}>
          Ayarlar
        </ThemedText>

        <View style={styles.row}>
          <ThemedText>Günlük hatırlatma</ThemedText>
          <Switch
            testID="reminder-enabled-switch"
            // A11Y-03: ekran okuyucu etiketi + 48dp'ye tamamlanan dokunma alanı.
            accessibilityLabel="Günlük hatırlatma"
            hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
            value={effectiveEnabled}
            onValueChange={onToggleReminder}
          />
        </View>

        {permissionMissing ? (
          <View style={styles.section}>
            <ThemedText
              testID="notification-permission-denied"
              type="small"
              themeColor="textSecondary">
              Bildirim izni kapalı, hatırlatma çalışmaz.
            </ThemedText>
            {!canAskAgain && onOpenSystemSettings ? (
              <Pressable
                testID="open-system-settings"
                accessibilityRole="button"
                onPress={onOpenSystemSettings}
                style={[
                  styles.presetChip,
                  styles.chipBase,
                  styles.alignStart,
                  { backgroundColor: theme.backgroundElement },
                ]}>
                <ThemedText>Ayarları aç</ThemedText>
              </Pressable>
            ) : null}
          </View>
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
                  disabled={!effectiveEnabled}
                  onPress={() => onChangeTime(preset)}
                  style={[
                    styles.presetChip,
                    styles.chipBase,
                    { backgroundColor: theme.backgroundElement },
                    // B9: seçili durum yalnızca zeminle değil çerçeveyle de (Bugün ekranıyla aynı dil).
                    selected && {
                      backgroundColor: theme.backgroundSelected,
                      borderColor: theme.text,
                    },
                    !effectiveEnabled && styles.presetChipDisabled,
                  ]}>
                  <ThemedText type={selected ? 'smallBold' : 'small'} style={styles.chipLabel}>
                    {preset}
                  </ThemedText>
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
              style={[
                styles.presetChip,
                styles.chipBase,
                { backgroundColor: theme.backgroundElement },
              ]}>
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

        {buildInfo ? (
          <ThemedText testID="build-info" type="small" themeColor="textSecondary" selectable>
            {buildInfo}
          </ThemedText>
        ) : null}

        <Pressable
          testID="delete-all-button"
          accessibilityRole="button"
          onPress={onDeleteAll}
          style={styles.deleteButton}>
          <ThemedText type="smallBold" style={styles.deleteLabel}>
            Tüm verilerimi sil
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    // flexGrow: içerik kısaysa "Sil" düğmesi `marginTop: 'auto'` ile en alta iner,
    // uzunsa (büyük yazı) kaydırılır.
    flexGrow: 1,
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
    minHeight: 48,
  },
  section: {
    gap: Spacing.two,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', // büyük yazı tipinde çipler ekran dışına taşmasın (QA BLG-08)
    gap: Spacing.two,
  },
  presetChip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  chipBase: {
    minHeight: 48, // B10: dokunma hedefi >= 48dp
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent', // seçili/seçilmemiş aynı ölçü, yerleşim kaymaz
  },
  alignStart: {
    alignSelf: 'flex-start',
  },
  chipLabel: {
    fontSize: 16,
  },
  presetChipDisabled: {
    opacity: 0.4,
  },
  linkRow: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: Spacing.two,
  },
  deleteButton: {
    marginTop: 'auto',
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: '#D7263D22',
    alignItems: 'center',
  },
  deleteLabel: {
    // A11Y-05: #D7263D açık zeminde 4.03:1 idi; #B3142B 5.46:1 (WCAG 1.4.3).
    // Uygulama açık temaya kilitli (A11), tek renk yeterli.
    color: '#B3142B',
  },
});

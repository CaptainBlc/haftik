/**
 * Bugün ekranı (Ekran 2, `docs/ux/ekran-akisi.md`) — sunum bileşeni.
 * Veri/router'a dokunmaz; tarih etiketi, geçiş yetkileri ve seçim durumu
 * dışarıdan (`src/app/(main)/today.tsx`) verilir.
 */
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CategoryPicker } from '@/components/category-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Category, CategoryValue } from '@/domain/types';
import { isSelectionComplete, type CategorySelection } from '@/lib/checkin-form';

export interface CheckinFormProps {
  dateLabel: string;
  canGoToYesterday: boolean;
  canGoToToday: boolean;
  onGoToYesterday: () => void;
  onGoToToday: () => void;
  selection: CategorySelection;
  onSelect: (category: Category, value: CategoryValue) => void;
  onSave: () => void;
  /** Veri henüz yüklenirken veya kayıt sırasında Kaydet'i de ayrıca kapatır. */
  disabledExtra?: boolean;
}

export function CheckinForm({
  dateLabel,
  canGoToYesterday,
  canGoToToday,
  onGoToYesterday,
  onGoToToday,
  selection,
  onSelect,
  onSave,
  disabledExtra = false,
}: CheckinFormProps) {
  const theme = useTheme();
  const complete = isSelectionComplete(selection);
  const saveDisabled = !complete || disabledExtra;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          testID="date-nav-back"
          accessibilityRole="button"
          disabled={!canGoToYesterday}
          onPress={onGoToYesterday}
          style={styles.navButton}>
          <ThemedText style={!canGoToYesterday && styles.navButtonDisabled}>{'<'}</ThemedText>
        </Pressable>
        <ThemedText type="subtitle" style={styles.dateLabel}>
          {dateLabel}
        </ThemedText>
        <Pressable
          testID="date-nav-forward"
          accessibilityRole="button"
          disabled={!canGoToToday}
          onPress={onGoToToday}
          style={styles.navButton}>
          <ThemedText style={!canGoToToday && styles.navButtonDisabled}>{'>'}</ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CategoryPicker selection={selection} onSelect={onSelect} />
      </ScrollView>

      <Pressable
        testID="save-button"
        accessibilityRole="button"
        accessibilityState={{ disabled: saveDisabled }}
        disabled={saveDisabled}
        onPress={onSave}
        style={[
          styles.saveButton,
          { backgroundColor: saveDisabled ? theme.backgroundElement : theme.text },
        ]}>
        <ThemedText
          type="smallBold"
          style={{ color: saveDisabled ? theme.textSecondary : theme.background }}>
          Kaydet
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateLabel: {
    textAlign: 'center',
  },
  navButton: {
    padding: Spacing.two,
    minWidth: 32,
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0,
  },
  scrollContent: {
    gap: Spacing.three,
  },
  saveButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
});

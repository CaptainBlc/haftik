/**
 * 4 kategori x 3 emoji seçim ızgarası (`docs/ux/ekran-akisi.md` Ekran 2).
 * Sıra sabit: hareket → uyku → harcama → sosyal (`CATEGORIES`,
 * `docs/ux/emoji-seti.md`). Saf, veri/router bağımsız — dışarıdan seçim
 * durumu ve `onSelect` callback'i alır.
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CATEGORY_EMOJI, CATEGORY_LABELS_TR, CATEGORY_VALUES } from '@/constants/emoji';
import { CATEGORIES } from '@/domain/types';
import type { Category, CategoryValue } from '@/domain/types';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CategorySelection } from '@/lib/checkin-form';

export interface CategoryPickerProps {
  selection: CategorySelection;
  onSelect: (category: Category, value: CategoryValue) => void;
}

export function CategoryPicker({ selection, onSelect }: CategoryPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {CATEGORIES.map((category) => (
        <View key={category} style={styles.categoryBlock}>
          <ThemedText type="smallBold">{CATEGORY_LABELS_TR[category]}</ThemedText>
          <View style={styles.optionsRow}>
            {CATEGORY_VALUES.map((value) => {
              const selected = selection[category] === value;
              return (
                <Pressable
                  key={value}
                  testID={`category-${category}-${value}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => onSelect(category, value)}
                  style={[
                    styles.option,
                    { backgroundColor: theme.backgroundElement },
                    selected && { backgroundColor: theme.backgroundSelected, borderColor: theme.text },
                  ]}>
                  <ThemedText style={[styles.emoji, !selected && styles.emojiDim]}>
                    {CATEGORY_EMOJI[category][value]}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  categoryBlock: {
    gap: Spacing.two,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  option: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emoji: {
    fontSize: 28,
  },
  emojiDim: {
    opacity: 0.5,
  },
});

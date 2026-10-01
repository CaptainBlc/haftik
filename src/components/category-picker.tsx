/**
 * 4 kategori x 3 emoji seçim ızgarası (`docs/ux/ekran-akisi.md` Ekran 2).
 * Sıra sabit: hareket → uyku → harcama → sosyal (`CATEGORIES`,
 * `docs/ux/emoji-seti.md`). Saf, veri/router bağımsız — dışarıdan seçim
 * durumu ve `onSelect` callback'i alır.
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  CATEGORY_EMOJI,
  CATEGORY_LABELS_TR,
  CATEGORY_LEVEL_LABELS_TR,
  CATEGORY_VALUES,
} from '@/constants/emoji';
import { CATEGORIES } from '@/domain/types';
import type { Category, CategoryValue } from '@/domain/types';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CategorySelection } from '@/lib/checkin-form';

/** Emoji kutusu yüksekliği, dp (>= 48 dokunma hedefi; bkz. docs/ux/ekran-akisi.md Ekran 2). */
export const TILE_HEIGHT = 72;

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
          <View style={styles.labelRow}>
            <ThemedText type="smallBold">{CATEGORY_LABELS_TR[category]}</ThemedText>
            {selection[category] !== undefined ? (
              <ThemedText
                type="small"
                themeColor="textSecondary"
                testID={`category-${category}-level`}>
                {'· '}
                {CATEGORY_LEVEL_LABELS_TR[category][selection[category] as CategoryValue]}
              </ThemedText>
            ) : null}
          </View>
          <View style={styles.optionsRow}>
            {CATEGORY_VALUES.map((value) => {
              const selected = selection[category] === value;
              // B1: soluklaştırma yalnızca bu kategoride bir seçim VARKEN, seçilmeyenlere.
              const dimmed = selection[category] !== undefined && !selected;
              return (
                <Pressable
                  key={value}
                  testID={`category-${category}-${value}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${CATEGORY_LABELS_TR[category]}: ${CATEGORY_LEVEL_LABELS_TR[category][value]}`}
                  accessibilityState={{ selected }}
                  onPress={() => onSelect(category, value)}
                  style={[
                    styles.option,
                    { backgroundColor: theme.backgroundElement },
                    selected && { backgroundColor: theme.backgroundSelected, borderColor: theme.text },
                  ]}>
                  <ThemedText
                    maxFontSizeMultiplier={1.2}
                    style={[styles.emoji, dimmed && styles.emojiDim]}>
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
    gap: Spacing.two + Spacing.one, // 12
  },
  categoryBlock: {
    gap: Spacing.one,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  option: {
    flex: 1,
    // Sabit yükseklik (aspectRatio değil): 411dp genişlikte kare kutu ~110dp olup 4. kategoriyi
    // ekranın dışına itiyordu. 72dp >= 48dp dokunma hedefi; 4 kategori tek ekrana sığar.
    height: TILE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emoji: {
    fontSize: 40, // 72dp kutuda okunur; font ölçeği maxFontSizeMultiplier={1.2} ile sınırlı
    lineHeight: 48,
  },
  emojiDim: {
    opacity: 0.5,
  },
});

/**
 * 7 nokta ilerleme göstergesi (Ekran 3, `docs/ux/ekran-akisi.md`): Pzt-Paz,
 * dolu = koyu daire, boş = boş çember.
 */
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { WeekDot } from '@/lib/week-dots';

export interface WeekDotsRowProps {
  dots: readonly WeekDot[];
}

export function WeekDotsRow({ dots }: WeekDotsRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.row} testID="week-dots-row">
      {dots.map((dot) => (
        <View key={dot.localDate} style={styles.column}>
          <ThemedText type="small">{dot.label}</ThemedText>
          <View
            testID={`week-dot-${dot.localDate}`}
            style={[
              styles.dot,
              { borderColor: theme.text },
              dot.filled && { backgroundColor: theme.text },
              dot.isToday && styles.today,
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  today: {
    borderStyle: 'dashed',
  },
});

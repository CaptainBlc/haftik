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
        <View
          key={dot.localDate}
          style={styles.column}
          accessible
          accessibilityLabel={`${dot.label}${dot.isToday ? ', bugün' : ''}, ${
            dot.filled ? 'dolu' : 'dolu değil'
          }`}>
          <ThemedText type={dot.isToday ? 'smallBold' : 'small'}>{dot.label}</ThemedText>
          {/* B7: bugün, dolu ya da boş olsun, dış halkayla ayırt edilir. */}
          <View
            testID={`week-ring-${dot.localDate}`}
            style={[styles.ring, dot.isToday && { borderColor: theme.text }]}>
            <View
              testID={`week-dot-${dot.localDate}`}
              style={[
                styles.dot,
                { borderColor: theme.text },
                dot.filled && { backgroundColor: theme.text },
                dot.isToday && !dot.filled && styles.today,
              ]}
            />
          </View>
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
  ring: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  today: {
    borderStyle: 'dashed',
  },
});

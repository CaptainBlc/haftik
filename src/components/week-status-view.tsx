/**
 * Hafta durumu ekranı (Ekran 3, `docs/ux/ekran-akisi.md`) — sunum bileşeni.
 * Veri/router'a dokunmaz; `src/app/(main)/week.tsx` verileri çekip bu
 * bileşene saf props olarak geçirir.
 */
import { StyleSheet } from 'react-native';

import { LockedCardPlaceholder } from '@/components/locked-card-placeholder';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WeekDotsRow } from '@/components/week-dots-row';
import { Spacing } from '@/constants/theme';
import type { WeekDot } from '@/lib/week-dots';

export interface WeekStatusViewProps {
  dots: readonly WeekDot[];
  headline: string;
  caption: string;
  unlocked: boolean;
  onLockedPress: () => void;
}

export function WeekStatusView({
  dots,
  headline,
  caption,
  unlocked,
  onLockedPress,
}: WeekStatusViewProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.heading}>
        Bu hafta
      </ThemedText>

      <WeekDotsRow dots={dots} />

      <ThemedText testID="week-status-headline" style={styles.headline}>
        {headline}
      </ThemedText>

      <LockedCardPlaceholder caption={caption} unlocked={unlocked} onPress={onLockedPress} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.four,
    alignItems: 'stretch',
  },
  heading: {
    fontSize: 28,
    lineHeight: 32,
  },
  headline: {
    textAlign: 'center',
  },
});

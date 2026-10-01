/**
 * Hafta durumu ekranı (Ekran 3, `docs/ux/ekran-akisi.md`) — sunum bileşeni.
 * Veri/router'a dokunmaz; `src/app/(main)/week.tsx` verileri çekip bu
 * bileşene saf props olarak geçirir.
 */
import { ScrollView, StyleSheet } from 'react-native';

import { LockedCardPlaceholder } from '@/components/locked-card-placeholder';
import { MissedWeekBanner } from '@/components/missed-week-banner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WeekDotsRow } from '@/components/week-dots-row';
import { Spacing } from '@/constants/theme';
import { useTopInset } from '@/hooks/use-top-inset';
import type { WeekDot } from '@/lib/week-dots';

export interface WeekStatusViewProps {
  dots: readonly WeekDot[];
  headline: string;
  caption: string;
  unlocked: boolean;
  onLockedPress: () => void;
  /** T2: en yeni "açılmayı bekleyen" (uygun ama kartı kaydedilmemiş) hafta — yoksa `null`. */
  missedWeek?: string | null;
  onMissedWeekPress?: () => void;
}

export function WeekStatusView({
  dots,
  headline,
  caption,
  unlocked,
  onLockedPress,
  missedWeek,
  onMissedWeekPress,
}: WeekStatusViewProps) {
  const topInset = useTopInset();

  return (
    <ThemedView style={[styles.flex, { paddingTop: topInset }]}>
      {/* B10: büyük yazı tipinde / küçük ekranda içerik kesilmesin, kaydırılabilsin. */}
      <ScrollView testID="week-scroll" contentContainerStyle={styles.container}>
        {missedWeek && onMissedWeekPress && <MissedWeekBanner onPress={onMissedWeekPress} />}

        <ThemedText type="title" style={styles.heading}>
          Bu hafta
        </ThemedText>

        <WeekDotsRow dots={dots} />

        <ThemedText testID="week-status-headline" style={styles.headline}>
          {headline}
        </ThemedText>

        <LockedCardPlaceholder caption={caption} unlocked={unlocked} onPress={onLockedPress} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
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

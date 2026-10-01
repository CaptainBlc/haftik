/**
 * T2, kaçırılan hafta yolu — Hafta ekranı banner'ı (`18-ux-akislar-v2.md`
 * §2.7 yüzey (1): "Hafta > Bu hafta üstünde 64 dp banner"). Yalnızca en
 * yeni bekleyen hafta için gösterilir (üst katman — `src/app/(main)/week.tsx`
 * — `findOpenableWeeks`in sonucundan tek bir `weekStart` seçip buraya geçirir);
 * birden fazla bekleyen kart varsa diğerlerinin kalıcı evi S25 Albüm'dür.
 */
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export interface MissedWeekBannerProps {
  onPress: () => void;
}

export function MissedWeekBanner({ onPress }: MissedWeekBannerProps) {
  return (
    <Pressable
      testID="missed-week-banner"
      accessibilityRole="button"
      accessibilityLabel="Geçen haftanın kartı seni bekliyor"
      onPress={onPress}>
      <ThemedView type="backgroundSelected" style={styles.banner}>
        <ThemedText type="smallBold">Geçen haftanın kartı seni bekliyor</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 64,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/**
 * Yükleme hatası ekranı (04 #7, S16b): bir ekranın verisi okunamazsa
 * (`.then` zincirinde `catch` yoktu) kullanıcı sonsuza dek `LoadingView`de
 * kalıyordu. Burada kısa bir mesaj + "Tekrar dene" sunulur.
 */
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTopInset } from '@/hooks/use-top-inset';

export interface LoadErrorViewProps {
  onRetry: () => void;
}

export function LoadErrorView({ onRetry }: LoadErrorViewProps) {
  const topInset = useTopInset();
  return (
    <ThemedView style={[styles.container, { paddingTop: topInset }]}>
      <ThemedText testID="load-error-message" style={styles.message}>
        Yüklenemedi.
      </ThemedText>
      <Pressable
        testID="load-error-retry"
        accessibilityRole="button"
        onPress={onRetry}
        style={styles.button}>
        <ThemedText type="smallBold">Tekrar dene</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  message: {
    textAlign: 'center',
  },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
});

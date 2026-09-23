import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';

/** Veri yüklenirken gösterilen minimal bekleme ekranı (spinner). */
export function LoadingView() {
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator testID="loading-indicator" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

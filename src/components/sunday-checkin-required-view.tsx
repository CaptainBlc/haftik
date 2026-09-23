/**
 * Ara ekran "Bugünü de ekleyelim" (K3, `docs/ux/pazar-akisi.md` "Ara ekran").
 * Kart, Pazar günü bugünün check-in'i olmadan asla dondurulmaz; bu ekran
 * kullanıcıyı check-in'e yönlendiren tek eylemi sunar.
 *
 * **Geri tuşu/gesture bilerek engellenmez** (`pazar-akisi.md`: "spec'in
 * zorunlu kıldığı şey 'kartın bugünsüz dondurulmaması', ekranın kendisi
 * değil") — bu bileşen kendi başına bir engelleme yapmaz, yalnızca
 * `onBack` prop'unu çağıran bir buton sunar; router seviyesinde ayrıca bir
 * geri-engelleme eklenmemiştir.
 */
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface SundayCheckinRequiredViewProps {
  onMarkToday: () => void;
  onBack: () => void;
}

export function SundayCheckinRequiredView({
  onMarkToday,
  onBack,
}: SundayCheckinRequiredViewProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.heading}>
        Kartını açmadan önce bugünü de ekleyelim.
      </ThemedText>
      <ThemedText style={styles.body}>Bugünün verisi olmadan hafta eksik sayılır.</ThemedText>

      <Pressable
        testID="mark-today-button"
        accessibilityRole="button"
        onPress={onMarkToday}
        style={[styles.button, { backgroundColor: theme.text }]}>
        <ThemedText type="smallBold" style={{ color: theme.background }}>
          Bugünü işaretle
        </ThemedText>
      </Pressable>

      <Pressable testID="sunday-required-back" accessibilityRole="button" onPress={onBack}>
        <ThemedText themeColor="textSecondary">Geri</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  heading: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
  },
  button: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
});

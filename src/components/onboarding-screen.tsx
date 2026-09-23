/**
 * Onboarding ekranlarının (1a/1b/1c, `docs/ux/ekran-akisi.md`) ortak
 * iskeleti: başlık + gövde metni + bir veya iki buton. "Tur/carousel yok"
 * kararına uygun olarak sade tutulur (gerekçe: ekran-akisi.md).
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface OnboardingAction {
  label: string;
  onPress: () => void;
  /** İkincil eylem (ör. "Şimdi değil") soluk/az vurgulu çizilir. */
  variant?: 'primary' | 'secondary';
  testID?: string;
}

export interface OnboardingScreenProps {
  title: string;
  body: string;
  actions: OnboardingAction[];
}

export function OnboardingScreen({ title, body, actions }: OnboardingScreenProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText style={styles.body}>{body}</ThemedText>
        </View>

        <View style={styles.actions}>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              testID={action.testID}
              accessibilityRole="button"
              onPress={action.onPress}
              style={[
                styles.button,
                {
                  backgroundColor:
                    (action.variant ?? 'primary') === 'primary'
                      ? theme.text
                      : theme.backgroundElement,
                },
              ]}>
              <ThemedText
                type="smallBold"
                style={{
                  color:
                    (action.variant ?? 'primary') === 'primary' ? theme.background : theme.text,
                }}>
                {action.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.five,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
  },
  actions: {
    gap: Spacing.two,
  },
  button: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
});

import { Stack } from 'expo-router';

/** Onboarding'in 3 ekranı (1a/1b/1c, `docs/ux/ekran-akisi.md`) art arda. */
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

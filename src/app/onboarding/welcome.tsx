/** Ekran 1a — Karşılama (`docs/ux/ekran-akisi.md`, metin birebir). */
import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding-screen';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <OnboardingScreen
      title="Her gün 8 saniye. Her pazar bir karne."
      body={
        'Hareket, uyku, harcama, sosyal: haftanı emojiyle anlat, pazar akşamı sonucu gör.'
      }
      actions={[
        {
          label: 'Başla',
          onPress: () => router.push('/onboarding/privacy'),
          testID: 'onboarding-welcome-start',
        },
      ]}
    />
  );
}

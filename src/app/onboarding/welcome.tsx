/** Ekran 1a — Karşılama (`docs/ux/ekran-akisi.md`, metin birebir). */
import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding-screen';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <OnboardingScreen
      title="Günde dört emoji, Pazar akşamı bir kart."
      body={
        'Hareket, uyku, harcama, sosyallik: haftanı emojiyle anlat. ' +
        'Pazar akşamı esprili bir kart açılır; paylaşmak istersen paylaşırsın.'
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

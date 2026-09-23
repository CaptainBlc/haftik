/**
 * Ekran 1b — Gizlilik güvencesi (`docs/ux/ekran-akisi.md`, metin birebir;
 * spec güvenlik gereksinimi 6: "veri yalnızca bu telefonda, telefon
 * değişince taşınmaz" onboarding metninde açıkça yazılır).
 */
import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding-screen';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <OnboardingScreen
      title="Verilerin yalnızca bu telefonda kalır."
      body="Hesap yok, bulut yok. Telefon değişirse veri taşınmaz."
      actions={[
        {
          label: 'Anladım, devam',
          onPress: () => router.push('/onboarding/notifications'),
          testID: 'onboarding-privacy-continue',
        },
      ]}
    />
  );
}

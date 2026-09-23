/**
 * Açılış geçidi: onboarding tamamlanmışsa doğrudan Bugün ekranına, değilse
 * onboarding'e yönlendirir (`docs/ux/ekran-akisi.md`: "Onboarding sonu →
 * doğrudan Ekran 2'ye geçilir"). Kapı mantığı `(main)/_layout.tsx` ile
 * paylaşılır (`src/lib/onboarding-gate.ts`).
 */
import { Redirect } from 'expo-router';

import { LoadingView } from '@/components/loading-view';
import { ONBOARDING_ROUTE, useOnboardingGate } from '@/lib/onboarding-gate';

export default function Index() {
  const gate = useOnboardingGate();

  if (gate === 'loading') {
    return <LoadingView />;
  }

  return <Redirect href={gate === 'done' ? '/today' : ONBOARDING_ROUTE} />;
}

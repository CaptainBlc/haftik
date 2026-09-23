/**
 * Onboarding kapısı (S10 SEC N-4): `/` ve `(main)` layout'u aynı mantığı
 * paylaşır; böylece `haftik://today` / `haftik://week` derin bağlantıları
 * onboarding'i atlayamaz. Okuma hatası kilitlemez: güvenli varsayılan
 * "onboarding gerekli"dir.
 */
import { useEffect, useState } from 'react';

import { getOnboardingDone } from '@/data/setting-repo';

export type OnboardingGate = 'loading' | 'done' | 'needed';

export const ONBOARDING_ROUTE = '/onboarding/welcome' as const;

export function useOnboardingGate(): OnboardingGate {
  const [gate, setGate] = useState<OnboardingGate>('loading');

  useEffect(() => {
    let cancelled = false;
    getOnboardingDone()
      .then((done) => (done ? 'done' : 'needed'))
      .catch(() => 'needed' as const)
      .then((next) => {
        if (!cancelled) {
          setGate(next);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return gate;
}

/** Onboarding ekranlarının (1a/1b/1c) ortak iskeleti. */
import { act, create } from 'react-test-renderer';

import { OnboardingScreen } from '@/components/onboarding-screen';

describe('OnboardingScreen', () => {
  it('başlık ve gövde metnini birebir çizer', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <OnboardingScreen
          title="Verilerin yalnızca bu telefonda kalır."
          body="Hesap yok, bulut yok. Telefon değişirse veri taşınmaz."
          actions={[{ label: 'Anladım, devam', onPress: () => {}, testID: 'continue' }]}
        />
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Verilerin yalnızca bu telefonda kalır.');
    expect(json).toContain('Hesap yok, bulut yok. Telefon değişirse veri taşınmaz.');
  });

  it('birden fazla eylem (ör. "İzin ver" / "Şimdi değil") ayrı ayrı tetiklenebilir', () => {
    const onAllow = jest.fn();
    const onSkip = jest.fn();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <OnboardingScreen
          title="Her gün hatırlatalım mı?"
          body="..."
          actions={[
            { label: 'İzin ver', onPress: onAllow, testID: 'allow' },
            { label: 'Şimdi değil', onPress: onSkip, variant: 'secondary', testID: 'skip' },
          ]}
        />
      );
    });
    act(() => {
      tree!.root.findByProps({ testID: 'skip' }).props.onPress();
    });
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onAllow).not.toHaveBeenCalled();
  });
});

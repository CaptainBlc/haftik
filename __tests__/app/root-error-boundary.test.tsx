/**
 * Kök `ErrorBoundary` dışa aktarımı testi (S14, bkz. `src/app/_layout.tsx`
 * dosya başı yorumu). `expo-router`'ın route dosyasından `ErrorBoundary`
 * export etme sözleşmesini kullanır; burada yalnızca bileşenin kendisi
 * (gerçek bir hata fırlatma senaryosu değil) test edilir — hata mesajını
 * gösterdiği ve "Tekrar dene" düğmesinin `retry`'yi çağırdığı.
 */
import { act, create } from 'react-test-renderer';

import { ErrorBoundary } from '@/app/_layout';

describe('ErrorBoundary (kök hata sınırı)', () => {
  it('hata mesajını gösterir', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<ErrorBoundary error={new Error('migration basarisiz (test)')} retry={() => {}} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Bir şeyler ters gitti.');
    expect(json).toContain('migration basarisiz (test)');

    act(() => {
      tree!.unmount();
    });
  });

  it('"Tekrar dene" basılınca retry tam 1 kez çağrılır', () => {
    const retry = jest.fn();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<ErrorBoundary error={new Error('hata')} retry={retry} />);
    });

    act(() => {
      tree!.root.findByProps({ testID: 'root-error-boundary-retry' }).props.onPress();
    });

    expect(retry).toHaveBeenCalledTimes(1);

    act(() => {
      tree!.unmount();
    });
  });

  it('veri silme seçeneği SUNMAZ (Ç29 kararı — yalnızca Tekrar dene)', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<ErrorBoundary error={new Error('hata')} retry={() => {}} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).not.toContain('Tüm verilerimi sil');
    expect(json.toLowerCase()).not.toContain('sil');

    act(() => {
      tree!.unmount();
    });
  });
});

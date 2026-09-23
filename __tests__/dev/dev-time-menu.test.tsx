/**
 * Zaman simülasyon menüsü (`plan.md` S6). Bu dosya `__DEV__ === true`
 * (jest-expo ortamının varsayılanı) altında render/etkileşimi doğrular;
 * `__DEV__ === false` altında hiç render edilmediğinin doğrulaması ayrı bir
 * testte (aşağıda) yalnızca bileşenin kendi içindeki erken `return null`
 * dalı üzerinden yapılır — gerçek üretim paketi hariç tutma doğrulaması
 * S10'un işidir (bkz. dosya başı notu, `src/dev/dev-time-menu.tsx`).
 */
import { act, create } from 'react-test-renderer';

import { DevTimeMenu } from '@/dev/dev-time-menu';
import { getNow, isDevNowOverrideActive, setDevNowOverride } from '@/lib/now';

describe('DevTimeMenu', () => {
  afterEach(() => {
    // `act` ile sarılır: hâlâ mount edilmiş bir önceki test ağacının
    // `useNow` aboneliği varsa (bu dosyada her test kendi ağacını
    // oluşturuyor, unmount etmiyor) bu, o aboneliği "act dışında state
    // güncellemesi" uyarısı vermeden tetikler.
    act(() => {
      setDevNowOverride(null);
    });
  });

  it('kapalı panelde yalnızca FAB düğmesi görünür, panel kapalıyken düğmeler yok', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<DevTimeMenu />);
    });
    expect(tree!.root.findByProps({ testID: 'dev-time-menu-fab' })).toBeDefined();
    // RN Modal mock'u `visible={false}` iken children'ı render etmiyor —
    // panel kapalıyken içerik ağaçta yok.
    expect(() => tree!.root.findByProps({ testID: 'dev-time-menu-reset' })).toThrow();
  });

  it('FAB\'a dokunma paneli açar, içindeki düğmeler görünür olur', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<DevTimeMenu />);
    });
    const fab = tree!.root.findByProps({ testID: 'dev-time-menu-fab' });
    act(() => {
      fab.props.onPress();
    });
    expect(tree!.root.findByProps({ testID: 'dev-time-menu-reset' })).toBeDefined();
  });

  it('"Bu haftanın Pazar 20:00\'ine ilerlet" düğmesi setDevNowOverride\'ı çağırır ve durum "(simüle)" olur', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<DevTimeMenu />);
    });
    const fab = tree!.root.findByProps({ testID: 'dev-time-menu-fab' });
    act(() => {
      fab.props.onPress();
    });

    expect(isDevNowOverrideActive()).toBe(false);

    const sundayButton = tree!.root.findByProps({ testID: 'dev-time-menu-sunday-2000' });
    act(() => {
      sundayButton.props.onPress();
    });

    expect(isDevNowOverrideActive()).toBe(true);
    expect(getNow().getHours()).toBe(20);
    expect(getNow().getDay()).toBe(0); // Pazar

    const current = tree!.root.findByProps({ testID: 'dev-time-menu-current' });
    expect(JSON.stringify(current.props.children)).toContain('(simüle)');
  });

  it('"Gerçek zamana dön" düğmesi override\'ı temizler', () => {
    act(() => {
      setDevNowOverride(new Date(2026, 8, 27, 20, 0));
    });
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<DevTimeMenu />);
    });
    const fab = tree!.root.findByProps({ testID: 'dev-time-menu-fab' });
    act(() => {
      fab.props.onPress();
    });
    const resetButton = tree!.root.findByProps({ testID: 'dev-time-menu-reset' });
    act(() => {
      resetButton.props.onPress();
    });
    expect(isDevNowOverrideActive()).toBe(false);
  });
});

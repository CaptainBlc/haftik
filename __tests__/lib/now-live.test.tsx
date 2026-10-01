/**
 * QA BLG-03: `useNow` gerçek zamanla güncellenir (gece yarısı / Pazar 20:00
 * zamanlayıcısı + AppState 'active'); dev override davranışı korunur.
 */
import { act, create } from 'react-test-renderer';
import { AppState } from 'react-native';

import { getNow, msUntilNextTick, setDevNowOverride, useNow } from '@/lib/now';

function Probe({ onValue }: { onValue: (d: Date) => void }) {
  onValue(useNow());
  return null;
}

describe('msUntilNextTick', () => {
  it('hafta içi: bir sonraki yerel gece yarısı (+tampon)', () => {
    const now = new Date(2026, 8, 23, 23, 0, 0); // Çarşamba 23:00
    expect(msUntilNextTick(now)).toBe(60 * 60 * 1000 + 500);
  });

  it('Pazar 20:00 öncesi: gece yarısından ÖNCE gelen kart açılış anı', () => {
    const now = new Date(2026, 8, 27, 19, 0, 0); // Pazar 19:00
    expect(msUntilNextTick(now)).toBe(60 * 60 * 1000 + 500);
  });

  it('Pazar 20:00 sonrası: gece yarısı', () => {
    const now = new Date(2026, 8, 27, 21, 0, 0);
    expect(msUntilNextTick(now)).toBe(3 * 60 * 60 * 1000 + 500);
  });

  it('haftanın ortasında Pazar 20:00 uzaktaysa gece yarısı seçilir', () => {
    const now = new Date(2026, 8, 24, 10, 0, 0); // Perşembe 10:00
    expect(msUntilNextTick(now)).toBe(14 * 60 * 60 * 1000 + 500);
  });

  it('tam gece yarısında bile en az 1 sn bekler (sonsuz döngü yok)', () => {
    const now = new Date(2026, 8, 24, 23, 59, 59, 999);
    expect(msUntilNextTick(now)).toBeGreaterThanOrEqual(1000);
  });
});

describe('useNow (canlı zaman)', () => {
  let tree: ReturnType<typeof create> | undefined;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      tree?.unmount();
    });
    tree = undefined;
    act(() => {
      setDevNowOverride(null);
    });
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('gece yarısı geçince gün değişir (ekran açıkken)', () => {
    jest.setSystemTime(new Date(2026, 8, 24, 23, 59, 0));
    const seen: Date[] = [];
    act(() => {
      tree = create(<Probe onValue={(d) => seen.push(d)} />);
    });
    expect(seen[seen.length - 1].getDate()).toBe(24);

    act(() => {
      jest.advanceTimersByTime(61 * 1000);
    });
    const last = seen[seen.length - 1];
    expect(last.getDate()).toBe(25);
    expect(last.getHours()).toBe(0);
  });

  it('zamanlayıcı tetiklendikten sonra bir sonraki gece yarısı için yeniden kurulur', () => {
    jest.setSystemTime(new Date(2026, 8, 24, 23, 59, 30));
    const seen: Date[] = [];
    act(() => {
      tree = create(<Probe onValue={(d) => seen.push(d)} />);
    });
    act(() => {
      jest.advanceTimersByTime(31 * 1000);
    });
    expect(seen[seen.length - 1].getDate()).toBe(25);
    act(() => {
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);
    });
    expect(seen[seen.length - 1].getDate()).toBe(26);
  });

  it("uygulama öne gelince (AppState 'active') zaman yenilenir", () => {
    jest.setSystemTime(new Date(2026, 8, 24, 12, 0, 0));
    let handler: ((s: string) => void) | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _type: string,
      cb: (s: string) => void
    ) => {
      handler = cb;
      return { remove: jest.fn() };
    }) as never);
    const seen: Date[] = [];
    act(() => {
      tree = create(<Probe onValue={(d) => seen.push(d)} />);
    });
    expect(seen[seen.length - 1].getDate()).toBe(24);

    // Arka planda süre geçti (zamanlayıcı donmuştu): saat sistem düzeyinde ilerledi.
    jest.setSystemTime(new Date(2026, 8, 26, 8, 0, 0));
    act(() => {
      handler?.('active');
    });
    expect(seen[seen.length - 1].getDate()).toBe(26);
  });

  it("'background' durumunda yenileme yapılmaz", () => {
    jest.setSystemTime(new Date(2026, 8, 24, 12, 0, 0));
    let handler: ((s: string) => void) | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _type: string,
      cb: (s: string) => void
    ) => {
      handler = cb;
      return { remove: jest.fn() };
    }) as never);
    const seen: Date[] = [];
    act(() => {
      tree = create(<Probe onValue={(d) => seen.push(d)} />);
    });
    const count = seen.length;
    jest.setSystemTime(new Date(2026, 8, 26, 8, 0, 0));
    act(() => {
      handler?.('background');
    });
    expect(seen.length).toBe(count);
  });

  it('dev override aktifken zaman ilerlese de override korunur (dev menü davranışı değişmez)', () => {
    jest.setSystemTime(new Date(2026, 8, 24, 23, 59, 0));
    const fixed = new Date(2026, 8, 27, 20, 0, 0);
    const seen: Date[] = [];
    act(() => {
      tree = create(<Probe onValue={(d) => seen.push(d)} />);
    });
    act(() => {
      setDevNowOverride(fixed);
    });
    expect(seen[seen.length - 1]).toBe(fixed);
    act(() => {
      jest.advanceTimersByTime(2 * 60 * 1000);
    });
    expect(seen[seen.length - 1]).toBe(fixed);
    expect(getNow()).toBe(fixed);
  });

  it('unmount zamanlayıcı ve dinleyiciyi temizler', () => {
    jest.setSystemTime(new Date(2026, 8, 24, 12, 0, 0));
    const remove = jest.fn();
    jest.spyOn(AppState, 'addEventListener').mockImplementation((() => ({ remove })) as never);
    act(() => {
      tree = create(<Probe onValue={() => {}} />);
    });
    act(() => {
      tree?.unmount();
    });
    tree = undefined;
    expect(remove).toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });
});

/** S22 (M-9): çift dokunuş koruması. */
import { act, create } from 'react-test-renderer';

import { useSingleFlight } from '@/lib/use-single-flight';

type Api = ReturnType<typeof useSingleFlight>;

function mount(lockMs: number) {
  const api: { current: Api | null } = { current: null };
  function Probe() {
    api.current = useSingleFlight(lockMs);
    return null;
  }
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<Probe />);
  });
  return { api: api as { current: Api }, unmount: () => act(() => tree!.unmount()) };
}

describe('useSingleFlight', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('aynı anda gelen iki çağrıdan yalnızca biri çalışır (render beklenmeden)', async () => {
    const { api, unmount } = mount(0);
    const action = jest.fn(() => Promise.resolve('ok'));
    let results: { ran: boolean }[] = [];
    await act(async () => {
      // İkisi de aynı senkron blokta: state henüz güncellenmeden.
      const a = api.current.run(action);
      const b = api.current.run(action);
      results = await Promise.all([a, b]);
    });
    expect(action).toHaveBeenCalledTimes(1);
    expect(results.map((r) => r.ran)).toEqual([true, false]);
    unmount();
  });

  it('eylem bitince (lockMs 0) kilit açılır ve ikinci çağrı çalışır', async () => {
    const { api, unmount } = mount(0);
    const action = jest.fn(() => Promise.resolve(1));
    await act(async () => {
      await api.current.run(action);
    });
    await act(async () => {
      await api.current.run(action);
    });
    expect(action).toHaveBeenCalledTimes(2);
    unmount();
  });

  it('lockMs: eylem erken bitse de süre dolana kadar yeni çağrı reddedilir, sonra kabul edilir', async () => {
    const { api, unmount } = mount(900);
    const action = jest.fn(() => Promise.resolve(1));
    await act(async () => {
      await api.current.run(action);
    });
    expect(api.current.busy).toBe(true);

    let early: { ran: boolean } | undefined;
    await act(async () => {
      jest.advanceTimersByTime(500);
      early = await api.current.run(action);
    });
    expect(early!.ran).toBe(false);
    expect(action).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(api.current.busy).toBe(false);
    await act(async () => {
      await api.current.run(action);
    });
    expect(action).toHaveBeenCalledTimes(2);
    unmount();
  });

  it('eylem hata fırlatsa da kilit açılır (takılı kalmaz) ve hata çağırana iletilir', async () => {
    const { api, unmount } = mount(0);
    await act(async () => {
      await expect(api.current.run(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
    });
    expect(api.current.busy).toBe(false);
    const action = jest.fn(() => Promise.resolve(1));
    await act(async () => {
      await api.current.run(action);
    });
    expect(action).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('lockMs 900 iken bile HATA sonrası kilit hemen açılır (kullanıcı beklemeden yeniden dener)', async () => {
    const { api, unmount } = mount(900);
    await act(async () => {
      await expect(api.current.run(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
    });
    expect(api.current.busy).toBe(false);
    const action = jest.fn(() => Promise.resolve(1));
    await act(async () => {
      await api.current.run(action);
    });
    expect(action).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('bileşen kapanınca bekleyen zamanlayıcı temizlenir (sızıntı yok)', async () => {
    const { api, unmount } = mount(900);
    await act(async () => {
      await api.current.run(() => Promise.resolve(1));
    });
    // React'in kendi zamanlayıcıları da sayılır; kapanışta bizim kilit zamanlayıcımız tam 1 azaltmalı.
    const before = jest.getTimerCount();
    expect(before).toBeGreaterThan(0);
    unmount();
    expect(jest.getTimerCount()).toBe(before - 1);
  });
});

/**
 * BLG-02: Hafta ekranı sekme odağına her gelişinde veriyi yeniden yükler
 * (Bugün'de kaydedilen check-in'ler bayat kalmaz).
 */
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import WeekScreen from '@/app/(main)/week';
import type { Checkin } from '@/domain/types';

let mockFocusCallbacks: (() => void | (() => void))[] = [];
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  // Gerçek davranışı taklit: odağa gelince çalıştır; test `triggerFocus` ile tekrar tetikler.
  useFocusEffect: (cb: () => void | (() => void)) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    jest.requireActual('react').useEffect(() => {
      mockFocusCallbacks.push(cb);
      const cleanup = cb();
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }, [cb]);
  },
}));

const mockGetCheckins = jest.fn();
const mockGetAllCheckins = jest.fn();
jest.mock('@/data/checkin-repo', () => ({
  getCheckins: (...a: unknown[]) => mockGetCheckins(...a),
  // Kritik-1 düzeltmesi (A8): week.tsx artık hasAnyPriorCard() yerine
  // check-in geçmişini okuyor (getCheckinsBefore) ve hasQualifiedWeekBefore
  // ile hesaplıyor. Boş dizi = eski `hasAnyPriorCard: false` ile aynı senaryo
  // (eşik 3 kalır) — bu testin beklentileri bu yüzden değişmedi.
  getCheckinsBefore: jest.fn(async () => []),
  // T2, kaçırılan hafta: `findOpenableWeeks` girdisi; varsayılan boş dizi =
  // hiçbir aday yok, banner görünmez (mevcut testlerin beklentileri bu
  // yüzden değişmedi). Ayrı senaryolar aşağıdaki "T2" describe bloğunda.
  getAllCheckins: (...a: unknown[]) => mockGetAllCheckins(...a),
}));
const mockGetCardWeekStarts = jest.fn();
jest.mock('@/data/card-repo', () => ({
  getCard: jest.fn(async () => null),
  getCardWeekStarts: (...a: unknown[]) => mockGetCardWeekStarts(...a),
}));
jest.mock('@/metrics/track', () => ({ trackEventOnce: jest.fn(async () => undefined) }));

// Salı 23 Eylül 2026 12:00 (hafta başı 2026-09-21).
jest.mock('@/lib/now', () => ({ useNow: () => new Date(2026, 8, 23, 12, 0, 0) }));

const day = (d: string): Checkin => ({ localDate: d, movement: 2, sleep: 2, spending: 2, social: 2 });

let tree: ReactTestRenderer | undefined;

function headline(): string {
  return String(tree!.root.findByProps({ testID: 'week-status-headline' }).props.children);
}

beforeEach(() => {
  // Var olan testler zaten her senaryoda kendi değerini set ediyor; burada
  // yalnızca "hiç set edilmezse undefined dönüp çöker" riskini önleyen
  // güvenli varsayılan. T2: varsayılan olarak hiçbir bekleyen hafta yok.
  mockGetCheckins.mockResolvedValue([]);
  mockGetAllCheckins.mockResolvedValue([]);
  mockGetCardWeekStarts.mockResolvedValue([]);
});

afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
  mockFocusCallbacks = [];
  jest.clearAllMocks();
});

describe('Hafta ekranı: odakta yeniden yükleme', () => {
  it('sekme yeniden odaklanınca yeni check-in\'ler görünür ("2 gün daha" -> "hazırlanıyor")', async () => {
    mockGetCheckins.mockResolvedValue([day('2026-09-21')]);
    await act(async () => {
      tree = create(<WeekScreen />);
    });
    expect(headline()).toBe('Kartın için 2 gün daha lazım.');
    const callsAfterMount = mockGetCheckins.mock.calls.length;

    // Kullanıcı Bugün'de 2 gün daha kaydetti, Hafta sekmesine döndü (odak).
    mockGetCheckins.mockResolvedValue([day('2026-09-21'), day('2026-09-22'), day('2026-09-23')]);
    await act(async () => {
      mockFocusCallbacks[mockFocusCallbacks.length - 1]();
    });
    expect(mockGetCheckins.mock.calls.length).toBeGreaterThan(callsAfterMount);
    expect(headline()).toBe('Kartın hazırlanıyor.');
  });

  it('odak efekti kayıtlı: ekran useFocusEffect kullanıyor', async () => {
    mockGetCheckins.mockResolvedValue([]);
    await act(async () => {
      tree = create(<WeekScreen />);
    });
    expect(mockFocusCallbacks.length).toBeGreaterThan(0);
  });

  it('yeniden yükleme sırasında ekran yükleme ekranına düşmez (eski veri görünür kalır)', async () => {
    mockGetCheckins.mockResolvedValue([day('2026-09-21')]);
    await act(async () => {
      tree = create(<WeekScreen />);
    });
    let resolve: (v: Checkin[]) => void = () => {};
    mockGetCheckins.mockReturnValue(new Promise<Checkin[]>((r) => (resolve = r)));
    await act(async () => {
      mockFocusCallbacks[mockFocusCallbacks.length - 1]();
    });
    expect(headline()).toBe('Kartın için 2 gün daha lazım.');
    await act(async () => {
      resolve([day('2026-09-21'), day('2026-09-22')]);
    });
    expect(headline()).toBe('Kartın için 1 gün daha lazım.');
  });
});

describe('T2: kaçırılan hafta banner\'ı', () => {
  // `findAllByProps` Pressable'ın kompozit+host katmanlarının HEPSİNİ
  // eşleştirir (bkz. `week-status-view.test.tsx`teki week-dot-* notu ve
  // aynı tuzak); `findByProps` (tekil) yalnızca en dıştaki Pressable'ı
  // döner ve 0 eşleşmede fırlatır — varlık/yokluk burada bu yüzden try/catch
  // ile kontrol edilir.
  function missedWeekBanner() {
    try {
      return tree!.root.findByProps({ testID: 'missed-week-banner' });
    } catch {
      return null;
    }
  }

  it('bekleyen hafta yoksa banner görünmez', async () => {
    mockGetAllCheckins.mockResolvedValue([]);
    mockGetCardWeekStarts.mockResolvedValue([]);
    await act(async () => {
      tree = create(<WeekScreen />);
    });
    expect(missedWeekBanner()).toBeNull();
  });

  it('uygun ama kartı kaydedilmemiş geçmiş bir hafta varsa banner görünür', async () => {
    // Hafta 2026-09-07 (Pzt-Çrş 3 dolu gün): kendi eşiği 3 (önce nitelikli
    // hafta yok), Pazar'ı (2026-09-13) 20:00 "şimdi"den (2026-09-23) önce ->
    // unlocked. Kartı kaydedilmemiş (cardWeekStarts boş) -> açılmayı bekliyor.
    mockGetAllCheckins.mockResolvedValue([day('2026-09-07'), day('2026-09-08'), day('2026-09-09')]);
    mockGetCardWeekStarts.mockResolvedValue([]);
    await act(async () => {
      tree = create(<WeekScreen />);
    });
    expect(missedWeekBanner()).not.toBeNull();
  });

  it('o haftanın kartı zaten kaydedilmişse banner görünmez', async () => {
    mockGetAllCheckins.mockResolvedValue([day('2026-09-07'), day('2026-09-08'), day('2026-09-09')]);
    mockGetCardWeekStarts.mockResolvedValue(['2026-09-07']);
    await act(async () => {
      tree = create(<WeekScreen />);
    });
    expect(missedWeekBanner()).toBeNull();
  });

  it('birden fazla bekleyen hafta varsa yalnızca EN YENİSİ için banner gösterilir, dokununca ona gider', async () => {
    mockGetAllCheckins.mockResolvedValue([
      // Hafta 2026-09-07: 3 gün (kendi eşiği 3, önce nitelikli hafta yok).
      day('2026-09-07'),
      day('2026-09-08'),
      day('2026-09-09'),
      // Hafta 2026-09-14: 4 gün (önceki nitelikli hafta var artık, eşik 4).
      day('2026-09-14'),
      day('2026-09-15'),
      day('2026-09-16'),
      day('2026-09-17'),
    ]);
    mockGetCardWeekStarts.mockResolvedValue([]);
    await act(async () => {
      tree = create(<WeekScreen />);
    });
    expect(missedWeekBanner()).not.toBeNull();

    await act(async () => {
      missedWeekBanner()!.props.onPress();
    });
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/card/[weekStart]',
      params: { weekStart: '2026-09-14' },
    });
  });
});

describe('S16b (04 #7): okuma hatası', () => {
  it('veri okunamazsa sonsuz yükleme yerine hata ekranı çıkar, "Tekrar dene" yeniden yükler', async () => {
    mockGetCheckins.mockRejectedValueOnce(new Error('bozuk veri'));
    await act(async () => {
      tree = create(<WeekScreen />);
    });
    const retry = tree!.root.findByProps({ testID: 'load-error-retry' });
    expect(tree!.root.findAllByProps({ testID: 'week-status-headline' })).toHaveLength(0);

    mockGetCheckins.mockResolvedValue([day('2026-09-21')]);
    await act(async () => {
      retry.props.onPress();
    });
    expect(headline()).toBe('Kartın için 2 gün daha lazım.');
  });
});

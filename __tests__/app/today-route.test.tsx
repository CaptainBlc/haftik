/**
 * S22: Bugün ekranının Kaydet anı (18 §2.5, 19 §3.2): ilerleme cümlesi, "Kaydedildi/Güncelle" yuvası,
 * tek uçuş (çift dokunuş), ekran okuyucu duyurusu, bekleyen geçen hafta kartı (B8), K3 devamı.
 * Saat: Salı 29 Eylül 2026 12:00 (hafta başı 2026-09-28); bu bir ilk-kart haftasıdır (eşik 3).
 */
import { AccessibilityInfo, Alert } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import TodayScreen from '@/app/(main)/today';
import { FRESH_WEEK_TEXT, SAVE_FEEDBACK_ERROR_TEXTS, SAVE_FEEDBACK_TEXTS } from '@/domain/content/save-feedback-texts';
import type { Checkin } from '@/domain/types';

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockParams: Record<string, string | undefined> = {};
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useLocalSearchParams: () => mockParams,
}));

const mockGetCheckins = jest.fn();
const mockGetAllCheckins = jest.fn();
const mockSaveCheckin = jest.fn();
jest.mock('@/data/checkin-repo', () => ({
  getCheckins: (...a: unknown[]) => mockGetCheckins(...a),
  getAllCheckins: (...a: unknown[]) => mockGetAllCheckins(...a),
  saveCheckin: (...a: unknown[]) => mockSaveCheckin(...a),
}));
const mockGetCardWeekStarts = jest.fn();
jest.mock('@/data/card-repo', () => ({ getCardWeekStarts: (...a: unknown[]) => mockGetCardWeekStarts(...a) }));
const mockTrack = jest.fn();
jest.mock('@/metrics/track', () => ({ trackEvent: (...a: unknown[]) => mockTrack(...a) }));
jest.mock('@/notify/wiring', () => ({
  syncNotificationsNow: jest.fn(async () => undefined),
  dismissDailyNotification: jest.fn(async () => undefined),
}));
jest.mock('@/lib/now', () => {
  const fixed = new Date(2026, 8, 29, 12, 0, 0);
  return { useNow: () => fixed, getNow: () => fixed };
});

const day = (d: string): Checkin => ({ localDate: d, movement: 2, sleep: 2, spending: 2, social: 2 });

let tree: ReactTestRenderer | undefined;
let announce: jest.SpyInstance;

async function mount() {
  await act(async () => {
    tree = create(<TodayScreen />);
  });
}

const byId = (id: string) => tree!.root.findByProps({ testID: id });
const text = (id: string) => String(byId(id).props.children);

async function pick(selection: [string, number][]) {
  for (const [cat, val] of selection) {
    await act(async () => {
      byId(`category-${cat}-${val}`).props.onPress();
    });
  }
}
const ALL_PICKS: [string, number][] = [
  ['movement', 3],
  ['sleep', 2],
  ['spending', 1],
  ['social', 2],
];

function buttonLabel(): string {
  return byId('save-button').findAllByType(require('react-native').Text)[0].props.children as string;
}

async function pressSave() {
  await act(async () => {
    byId('save-button').props.onPress();
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  mockParams = {};
  mockPush.mockReset();
  mockReplace.mockReset();
  mockTrack.mockReset();
  mockSaveCheckin.mockReset().mockResolvedValue(undefined);
  mockGetCheckins.mockReset().mockResolvedValue([]);
  mockGetAllCheckins.mockReset().mockResolvedValue([]);
  mockGetCardWeekStarts.mockReset().mockResolvedValue([]);
  announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
  // RN'in jest kurulumu bu işlevi zaten bir jest.fn() yapıyor: spyOn aynı fn'yi döndürür ve çağrı geçmişi
  // `restoreAllMocks`la silinmez. Testler arası sızmasın diye elle temizlenir.
  announce.mockClear();
});

afterEach(async () => {
  if (tree) {
    await act(async () => tree!.unmount());
    tree = undefined;
  }
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('Bugün: Kaydet anı', () => {
  it('kayıt yok: Kaydet pasif; dört kategori seçilince aktif', async () => {
    await mount();
    expect(buttonLabel()).toBe('Kaydet');
    expect(byId('save-button').props.disabled).toBe(true);
    await pick(ALL_PICKS);
    expect(byId('save-button').props.disabled).toBe(false);
  });

  it('Kaydet: bir kez yazar, "Kaydedildi" olur, ilerleme cümlesi gelir ve aynen duyurulur', async () => {
    mockGetAllCheckins.mockResolvedValue([]);
    await mount();
    await pick(ALL_PICKS);
    await pressSave();

    expect(mockSaveCheckin).toHaveBeenCalledTimes(1);
    expect(mockSaveCheckin).toHaveBeenCalledWith(
      expect.objectContaining({ localDate: '2026-09-29', movement: 3, sleep: 2, spending: 1, social: 2 })
    );
    // Tüm geçmişte ilk kayıt -> A türü.
    expect(SAVE_FEEDBACK_TEXTS.first).toContain(text('save-hint'));
    expect(buttonLabel()).toBe('✓ Kaydedildi');
    expect(byId('save-button').props.disabled).toBe(true);
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith(text('save-hint'));
    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith('check_in_saved');
  });

  it('çift dokunuş: iki onPress aynı anda gelse de yalnızca bir kayıt ve bir olay', async () => {
    await mount();
    await pick(ALL_PICKS);
    await act(async () => {
      const press = byId('save-button').props.onPress;
      press();
      press();
    });
    expect(mockSaveCheckin).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledTimes(1);
  });

  it('kayıttan sonra seçim değişirse yuva "Güncelle"ye döner, cümle kalkar; kaydedince "güncellendi" cümlesi', async () => {
    mockGetAllCheckins.mockResolvedValue([]);
    await mount();
    await pick(ALL_PICKS);
    await pressSave();
    await act(async () => {
      jest.advanceTimersByTime(900); // kilit kalkar
    });

    await pick([['movement', 1]]);
    expect(buttonLabel()).toBe('Güncelle');
    expect(byId('save-button').props.disabled).toBe(false);
    expect(text('save-hint').trim()).toBe(''); // normal ipucu (seçim tam)

    // Güncelleme: bu kez DB'de bugün için kayıt var -> wasEdit.
    mockGetAllCheckins.mockResolvedValue([day('2026-09-29')]);
    await pressSave();
    expect(mockSaveCheckin).toHaveBeenCalledTimes(2);
    expect(SAVE_FEEDBACK_TEXTS.updated).toContain(text('save-hint'));
    expect(announce).toHaveBeenCalledTimes(2);
  });

  it('kayıtlı gün açılınca yuva "Kaydedildi" (pasif), cümle yok, duyuru yok', async () => {
    mockGetCheckins.mockResolvedValue([{ ...day('2026-09-29'), movement: 3, sleep: 2, spending: 1, social: 2 }]);
    await mount();
    expect(buttonLabel()).toBe('✓ Kaydedildi');
    expect(byId('save-button').props.disabled).toBe(true);
    expect(text('save-hint').trim()).toBe('');
    expect(announce).not.toHaveBeenCalled();
  });

  it('kayıt hatası (X): uyarı kutusu yok, cümle ipucu satırında ve duyurulur; seçim korunur, kilit hemen açılır', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    mockSaveCheckin.mockRejectedValueOnce(new Error('disk'));
    await mount();
    await pick(ALL_PICKS);
    await pressSave();
    expect(alert).not.toHaveBeenCalled();
    expect(SAVE_FEEDBACK_ERROR_TEXTS).toContain(text('save-hint'));
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith(text('save-hint'));
    expect(mockTrack).not.toHaveBeenCalled();
    expect(byId('save-button').props.disabled).toBe(false); // seçim ve Kaydet yerinde
    expect(buttonLabel()).toBe('Kaydet');

    await pressSave(); // 900 ms beklemeden tekrar
    expect(mockSaveCheckin).toHaveBeenCalledTimes(2);
    expect(buttonLabel()).toBe('✓ Kaydedildi');
    expect(SAVE_FEEDBACK_ERROR_TEXTS).not.toContain(text('save-hint')); // hata kalktı, ilerleme cümlesi geldi
  });

  it('hata cümlesi, seçim değişince kalkar ve normal ipucuna dönülür', async () => {
    mockSaveCheckin.mockRejectedValueOnce(new Error('disk'));
    await mount();
    await pick(ALL_PICKS);
    await pressSave();
    expect(SAVE_FEEDBACK_ERROR_TEXTS).toContain(text('save-hint'));
    await pick([['movement', 1]]);
    expect(text('save-hint').trim()).toBe('');
  });

  it('K3: kart akışından gelindiyse kayıttan sonra kart ekranına geçer (cümle "sundayK3" türünden)', async () => {
    mockParams = { returnToCardWeekStart: '2026-09-28' };
    await mount();
    await pick(ALL_PICKS);
    await pressSave();
    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/card/[weekStart]', params: { weekStart: '2026-09-28' } });
  });
});

describe('Bugün: bekleyen geçen hafta kartı (B8)', () => {
  const lastWeek = ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24'].map(day); // 4 gün: uygun

  it('kayıtlı durumda yuva "Geçen haftanın kartını aç" olur ve kart ekranına götürür', async () => {
    mockGetAllCheckins.mockResolvedValue(lastWeek);
    mockGetCheckins.mockResolvedValue([{ ...day('2026-09-29'), movement: 3, sleep: 2, spending: 1, social: 2 }]);
    await mount();
    expect(buttonLabel()).toBe('Geçen haftanın kartını aç');
    expect(byId('save-button').props.disabled).toBe(false);
    await act(async () => {
      byId('save-button').props.onPress();
    });
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/card/[weekStart]', params: { weekStart: '2026-09-21' } });
    expect(mockSaveCheckin).not.toHaveBeenCalled();
  });

  it('kayıt sırasındaki 900 ms kilitte "Kaydedildi", kilit kalkınca kart yuvası gelir', async () => {
    mockGetAllCheckins.mockResolvedValue(lastWeek);
    await mount();
    await pick(ALL_PICKS);
    await pressSave();
    expect(buttonLabel()).toBe('✓ Kaydedildi');
    await act(async () => {
      jest.advanceTimersByTime(900);
    });
    expect(buttonLabel()).toBe('Geçen haftanın kartını aç');
  });

  it('kartı zaten açılmış hafta önerilmez; kayıt yoksa yuva "Kaydet" kalır', async () => {
    mockGetAllCheckins.mockResolvedValue(lastWeek);
    mockGetCardWeekStarts.mockResolvedValue(['2026-09-21']);
    mockGetCheckins.mockResolvedValue([{ ...day('2026-09-29'), movement: 3, sleep: 2, spending: 1, social: 2 }]);
    await mount();
    expect(buttonLabel()).toBe('✓ Kaydedildi');
  });

  it('dünü düzenlerken öneri yok (yuva yalnızca bugünün yuvasıdır)', async () => {
    mockGetAllCheckins.mockResolvedValue(lastWeek);
    mockGetCheckins.mockResolvedValue([{ ...day('2026-09-28'), movement: 3, sleep: 2, spending: 1, social: 2 }]);
    await mount();
    await act(async () => {
      byId('date-nav-back').props.onPress();
    });
    expect(buttonLabel()).not.toBe('Geçen haftanın kartını aç');
  });

  it('bekleyen kart okunamazsa (hata) sessizce yok sayılır, ekran bozulmaz', async () => {
    mockGetCardWeekStarts.mockRejectedValue(new Error('x'));
    await mount();
    expect(buttonLabel()).toBe('Kaydet');
  });
});

describe('Bugün: boş durum satırı ("Yeni bir hafta, temiz sayfa.")', () => {
  // Saat: Sal 2026-09-29, hafta başı 2026-09-28. Önceki hafta kayıtları: 09-21..09-23 (son kayıt 6 gün önce).
  const older = ['2026-09-21', '2026-09-22', '2026-09-23'].map(day);
  const hint = () => text('save-hint');

  it('uzun aradan sonra, hiçbir şey seçilmemişken "4 kategori kaldı" yerine görünür', async () => {
    mockGetAllCheckins.mockResolvedValue(older);
    await mount();
    expect(hint()).toBe(FRESH_WEEK_TEXT);
  });

  it('ilk seçimle normal ipucuna döner ("3 kategori kaldı")', async () => {
    mockGetAllCheckins.mockResolvedValue(older);
    await mount();
    await pick([['movement', 3]]);
    expect(hint()).toBe('3 kategori kaldı');
  });

  it('geçmiş yoksa (ilk kullanım), bu hafta kayıt varsa ya da aralık < 4 gün ise görünmez', async () => {
    await mount(); // geçmiş yok
    expect(hint()).toBe('4 kategori kaldı');
    await act(async () => tree!.unmount());

    mockGetAllCheckins.mockResolvedValue([...older, day('2026-09-28')]); // bu hafta kayıt var
    await mount();
    expect(hint()).toBe('4 kategori kaldı');
    await act(async () => tree!.unmount());

    mockGetAllCheckins.mockResolvedValue([day('2026-09-26')]); // Cmt -> Sal: 3 gün
    await mount();
    expect(hint()).toBe('4 kategori kaldı');
  });

  it('bugünün kaydı varsa görünmez; dünü düzenlerken de görünmez', async () => {
    mockGetAllCheckins.mockResolvedValue(older);
    mockGetCheckins.mockResolvedValue([{ ...day('2026-09-29'), movement: 3, sleep: 2, spending: 1, social: 2 }]);
    await mount();
    expect(hint().trim()).toBe('');

    await act(async () => tree!.unmount());
    mockGetCheckins.mockResolvedValue([]);
    await mount();
    expect(hint()).toBe(FRESH_WEEK_TEXT);
    await act(async () => {
      byId('date-nav-back').props.onPress();
    });
    expect(hint()).toBe('4 kategori kaldı'); // dün için "yeni hafta" iddiası yok
  });
});

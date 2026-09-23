/** Ayarlar "Deneme raporu" düğmesi + paylaşım öncesi onay akışı (S9, I-2). */
import { Alert } from 'react-native';
import { act, create } from 'react-test-renderer';

import { SettingsView } from '@/components/settings-view';
import { confirmAndShareTrialReport } from '@/metrics/report-confirm';
import { shareReport } from '@/metrics/report';

jest.mock('@/metrics/report', () => ({ shareReport: jest.fn(async () => undefined) }));

function renderSettings(onTrialReport?: () => void) {
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(
      <SettingsView
        reminderEnabled
        reminderTime="21:00"
        onToggleReminder={jest.fn()}
        onChangeTime={jest.fn()}
        onDeleteAll={jest.fn()}
        onPrivacyPress={jest.fn()}
        onTrialReport={onTrialReport}
      />
    );
  });
  return tree!;
}

afterEach(() => jest.clearAllMocks());

describe('SettingsView deneme raporu düğmesi', () => {
  it('onTrialReport verilmezse düğme yok', () => {
    const tree = renderSettings();
    expect(tree.root.findAllByProps({ testID: 'trial-report-button' })).toHaveLength(0);
  });

  it('verilirse görünür ve dokununca çağrılır', () => {
    const onTrialReport = jest.fn();
    const tree = renderSettings(onTrialReport);
    const button = tree.root.findByProps({ testID: 'trial-report-button' });
    act(() => {
      button.props.onPress();
    });
    expect(onTrialReport).toHaveBeenCalledTimes(1);
  });
});

describe('deneme raporu onay Alert akışı', () => {
  function openAlert() {
    const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    confirmAndShareTrialReport(() => new Date(2026, 8, 10));
    const [title, message, buttons] = spy.mock.calls[0];
    return { spy, title, message: message as string, buttons: buttons! };
  }

  it('paylaşımdan önce ne gideceğini söyler ve henüz paylaşmaz', () => {
    const { message, buttons } = openAlert();
    expect(message).toMatch(/sayaç/);
    expect(message).toMatch(/gün sayısı/);
    expect(message).toMatch(/kimlik/);
    expect(message).toMatch(/sen seçersin/);
    expect(message).not.toMatch(/anonim/i);
    expect(buttons.map((b) => b.text)).toEqual(['Vazgeç', 'Paylaş']);
    expect(shareReport).not.toHaveBeenCalled();
  });

  it('Vazgeç paylaşım başlatmaz', async () => {
    const { buttons } = openAlert();
    await act(async () => {
      await buttons[0].onPress?.();
    });
    expect(shareReport).not.toHaveBeenCalled();
  });

  it('Paylaş paylaşımı başlatır', async () => {
    const { buttons } = openAlert();
    await act(async () => {
      await buttons[1].onPress?.();
    });
    expect(shareReport).toHaveBeenCalledTimes(1);
  });

  it('paylaşım hata verirse ikinci bir bilgi Alert\'i gösterilir, çökmez', async () => {
    (shareReport as jest.Mock).mockRejectedValueOnce(new Error('x'));
    const { spy, buttons } = openAlert();
    await act(async () => {
      await buttons[1].onPress?.();
    });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

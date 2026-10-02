/** Ayarlar ekranı — sunum bileşeni. */
import { act, create } from 'react-test-renderer';

import { SettingsView } from '@/components/settings-view';

function renderSettings(props?: Partial<React.ComponentProps<typeof SettingsView>>) {
  const onToggleReminder = jest.fn();
  const onChangeTime = jest.fn();
  const onDeleteAll = jest.fn();
  const onPrivacyPress = jest.fn();
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(
      <SettingsView
        reminderEnabled
        reminderTime="21:00"
        onToggleReminder={onToggleReminder}
        onChangeTime={onChangeTime}
        onDeleteAll={onDeleteAll}
        onPrivacyPress={onPrivacyPress}
        {...props}
      />
    );
  });
  return { tree: tree!, onToggleReminder, onChangeTime, onDeleteAll, onPrivacyPress };
}

describe('SettingsView', () => {
  it('S16b (26 R-1): buildInfo verilirse sürüm satırı seçilebilir metin olarak gösterilir, verilmezse yok', () => {
    const text = 'Sürüm 0.1.0 (build 12)\npreview · abc1234 · şema 3';
    const withInfo = renderSettings({ buildInfo: text }).tree.root.findByProps({ testID: 'build-info' });
    expect(withInfo.props.children).toBe(text);
    expect(withInfo.props.selectable).toBe(true);
    const without = renderSettings().tree.root.findAllByProps({ testID: 'build-info' });
    expect(without).toHaveLength(0);
  });

  it('hatırlatma anahtarını değiştirmek onToggleReminder\'ı çağırır', () => {
    const { tree, onToggleReminder } = renderSettings();
    const toggle = tree.root.findByProps({ testID: 'reminder-enabled-switch' });
    act(() => {
      toggle.props.onValueChange(false);
    });
    expect(onToggleReminder).toHaveBeenCalledWith(false);
  });

  it('bir saat önayarına dokunmak onChangeTime\'ı doğru değerle çağırır', () => {
    const { tree, onChangeTime } = renderSettings();
    const preset = tree.root.findByProps({ testID: 'reminder-time-22:00' });
    act(() => {
      preset.props.onPress();
    });
    expect(onChangeTime).toHaveBeenCalledWith('22:00');
  });

  it('hatırlatma kapalıyken saat önayarları disabled olur', () => {
    const { tree } = renderSettings({ reminderEnabled: false });
    const preset = tree.root.findByProps({ testID: 'reminder-time-21:00' });
    expect(preset.props.disabled).toBe(true);
  });

  it('"Tüm verilerimi sil" dokunması doğrudan onDeleteAll çağırır (onay Alert\'i çağıran rotada)', () => {
    const { tree, onDeleteAll } = renderSettings();
    const deleteButton = tree.root.findByProps({ testID: 'delete-all-button' });
    act(() => {
      deleteButton.props.onPress();
    });
    expect(onDeleteAll).toHaveBeenCalledTimes(1);
  });

  it('gizlilik bağlantısına dokunma onPrivacyPress\'i çağırır', () => {
    const { tree, onPrivacyPress } = renderSettings();
    const link = tree.root.findByProps({ testID: 'privacy-link' });
    act(() => {
      link.props.onPress();
    });
    expect(onPrivacyPress).toHaveBeenCalledTimes(1);
  });

  it('"deneme raporu" düğmesi bu ekranda YOK (S9\'a bırakıldı, plan.md S6 notu)', () => {
    const { tree } = renderSettings();
    const json = JSON.stringify(tree.toJSON());
    expect(json).not.toMatch(/deneme raporu/i);
  });
});

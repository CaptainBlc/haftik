/** B8: izin yokken anahtar KAPALI görünür; kalıcı retse "Ayarları aç"; metin tavsiyesiz. */
import { StyleSheet } from 'react-native';
import { act, create } from 'react-test-renderer';

import { SettingsView } from '@/components/settings-view';

function render(props: Partial<React.ComponentProps<typeof SettingsView>>) {
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
        {...props}
      />
    );
  });
  return tree!;
}

const sw = (t: ReturnType<typeof create>) =>
  t.root.findByProps({ testID: 'reminder-enabled-switch' });
const has = (t: ReturnType<typeof create>, id: string) => t.root.findAllByProps({ testID: id }).length > 0;

describe('SettingsView izin durumu (B8)', () => {
  it('izin verilmemişse (denied) tercih açık olsa bile anahtar KAPALI', () => {
    const t = render({ notificationPermission: 'denied' });
    expect(sw(t).props.value).toBe(false);
  });

  it('undetermined de izin yok sayılır: anahtar KAPALI', () => {
    const t = render({ notificationPermission: 'undetermined' });
    expect(sw(t).props.value).toBe(false);
  });

  it('izin verilmişse anahtar tercihi gösterir', () => {
    expect(sw(render({ notificationPermission: 'granted' })).props.value).toBe(true);
    expect(sw(render({ notificationPermission: 'granted', reminderEnabled: false })).props.value).toBe(false);
  });

  it('izin bilinmiyorsa (null/verilmedi) anahtar tercihi gösterir', () => {
    expect(sw(render({ notificationPermission: null })).props.value).toBe(true);
    expect(sw(render({})).props.value).toBe(true);
  });

  it('izin yokken saat çipleri devre dışı', () => {
    const t = render({ notificationPermission: 'denied' });
    expect(t.root.findByProps({ testID: 'reminder-time-21:00' }).props.disabled).toBe(true);
  });

  it('izin yokken anahtara dokunma onToggleReminder(true) çağırır (izin isteme akışı)', () => {
    const onToggleReminder = jest.fn();
    const t = render({ notificationPermission: 'denied', onToggleReminder });
    act(() => {
      sw(t).props.onValueChange(true);
    });
    expect(onToggleReminder).toHaveBeenCalledWith(true);
  });

  it('kalıcı ret (canAskAgain false): "Ayarları aç" düğmesi görünür ve callback çağrılır', () => {
    const onOpenSystemSettings = jest.fn();
    const t = render({
      notificationPermission: 'denied',
      canAskAgain: false,
      onOpenSystemSettings,
    });
    expect(has(t, 'open-system-settings')).toBe(true);
    act(() => {
      t.root.findByProps({ testID: 'open-system-settings' }).props.onPress();
    });
    expect(onOpenSystemSettings).toHaveBeenCalledTimes(1);
  });

  it('tekrar sorulabiliyorsa "Ayarları aç" gösterilmez (anahtar diyaloğu açar)', () => {
    const t = render({
      notificationPermission: 'denied',
      canAskAgain: true,
      onOpenSystemSettings: jest.fn(),
    });
    expect(has(t, 'open-system-settings')).toBe(false);
    expect(has(t, 'notification-permission-denied')).toBe(true);
  });

  it('izin verilmişse uyarı satırı ve "Ayarları aç" yok', () => {
    const t = render({ notificationPermission: 'granted', canAskAgain: false, onOpenSystemSettings: jest.fn() });
    expect(has(t, 'notification-permission-denied')).toBe(false);
    expect(has(t, 'open-system-settings')).toBe(false);
  });

  it('uyarı metni dürüst ve tavsiyesiz ("verebilirsin" yok)', () => {
    const t = render({ notificationPermission: 'denied' });
    const text = String(t.root.findByProps({ testID: 'notification-permission-denied' }).props.children);
    expect(text).toBe('Bildirim izni kapalı, hatırlatma çalışmaz.');
    expect(text).not.toMatch(/verebilirsin|yapmalısın|önerilir/i);
  });
});

describe('SettingsView yerleşim (B9, B10, BLG-08)', () => {
  it('içerik ScrollView içinde', () => {
    const t = render({});
    expect(t.root.findAllByProps({ testID: 'settings-scroll' }).length).toBeGreaterThan(0);
  });

  it('saat çipleri sarılır (flexWrap: wrap)', () => {
    const t = render({});
    const chip = t.root.findByProps({ testID: 'reminder-time-20:00' });
    const row = chip.parent!.parent!;
    const flat = StyleSheet.flatten(row.props.style);
    expect(flat.flexWrap).toBe('wrap');
  });

  it('seçili çip çerçeve rengi alır, seçilmeyen şeffaf çerçeveli (aynı ölçü); hedef >= 48', () => {
    const t = render({ reminderTime: '22:00' });
    const sel = StyleSheet.flatten(t.root.findByProps({ testID: 'reminder-time-22:00' }).props.style);
    const other = StyleSheet.flatten(t.root.findByProps({ testID: 'reminder-time-21:00' }).props.style);
    expect(sel.borderWidth).toBe(2);
    expect(other.borderWidth).toBe(2);
    expect(other.borderColor).toBe('transparent');
    expect(sel.borderColor).not.toBe('transparent');
    expect(sel.minHeight).toBeGreaterThanOrEqual(48);
  });

  it('gizlilik ve silme hedefleri >= 48dp', () => {
    const t = render({});
    const link = StyleSheet.flatten(t.root.findByProps({ testID: 'privacy-link' }).props.style);
    const del = StyleSheet.flatten(t.root.findByProps({ testID: 'delete-all-button' }).props.style);
    expect(link.minHeight).toBeGreaterThanOrEqual(48);
    expect(del.minHeight).toBeGreaterThanOrEqual(48);
  });
});

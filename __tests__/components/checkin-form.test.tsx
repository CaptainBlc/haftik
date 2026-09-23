/**
 * Bugün ekranının (Ekran 2) sunum bileşeni. Görevin açıkça istediği kabul
 * kriteri: "4 kategori seçilmeden Kaydet disabled".
 */
import { act, create } from 'react-test-renderer';

import { CheckinForm } from '@/components/checkin-form';
import type { CategorySelection } from '@/lib/checkin-form';

function renderForm(selection: CategorySelection, extra?: { disabledExtra?: boolean }) {
  const onSave = jest.fn();
  const onGoToYesterday = jest.fn();
  const onGoToToday = jest.fn();
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(
      <CheckinForm
        dateLabel="23 Eylül, Çarşamba"
        canGoToYesterday
        canGoToToday={false}
        onGoToYesterday={onGoToYesterday}
        onGoToToday={onGoToToday}
        selection={selection}
        onSelect={() => {}}
        onSave={onSave}
        disabledExtra={extra?.disabledExtra}
      />
    );
  });
  return { tree: tree!, onSave, onGoToYesterday, onGoToToday };
}

describe('CheckinForm — Kaydet disabled kuralı', () => {
  it('hiçbir kategori seçilmemişken Kaydet disabled', () => {
    const { tree } = renderForm({});
    const button = tree.root.findByProps({ testID: 'save-button' });
    expect(button.props.disabled).toBe(true);
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('3/4 kategori seçiliyken hâlâ disabled', () => {
    const { tree } = renderForm({ movement: 1, sleep: 2, spending: 3 });
    const button = tree.root.findByProps({ testID: 'save-button' });
    expect(button.props.disabled).toBe(true);
  });

  it('4/4 kategori seçiliyken aktif olur (disabled: false)', () => {
    const { tree } = renderForm({ movement: 1, sleep: 2, spending: 3, social: 1 });
    const button = tree.root.findByProps({ testID: 'save-button' });
    expect(button.props.disabled).toBe(false);
  });

  it('4/4 seçiliyken dokunma onSave\'i çağırır', () => {
    const { tree, onSave } = renderForm({ movement: 1, sleep: 2, spending: 3, social: 1 });
    const button = tree.root.findByProps({ testID: 'save-button' });
    act(() => {
      button.props.onPress();
    });
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('4/4 seçili olsa bile disabledExtra (ör. kaydediliyor) true ise disabled kalır', () => {
    const { tree } = renderForm(
      { movement: 1, sleep: 2, spending: 3, social: 1 },
      { disabledExtra: true }
    );
    const button = tree.root.findByProps({ testID: 'save-button' });
    expect(button.props.disabled).toBe(true);
  });
});

describe('CheckinForm — bugün/dün geçişi', () => {
  it('canGoToYesterday false iken geri okun devre dışı', () => {
    const onSave = jest.fn();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <CheckinForm
          dateLabel="22 Eylül, Salı"
          canGoToYesterday={false}
          canGoToToday
          onGoToYesterday={() => {}}
          onGoToToday={() => {}}
          selection={{}}
          onSelect={() => {}}
          onSave={onSave}
        />
      );
    });
    const back = tree!.root.findByProps({ testID: 'date-nav-back' });
    const forward = tree!.root.findByProps({ testID: 'date-nav-forward' });
    expect(back.props.disabled).toBe(true);
    expect(forward.props.disabled).toBe(false);
  });
});

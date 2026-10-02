/**
 * Ayarlar "Deneme raporu" düğmesi (S9) ve rapor ÖNİZLEMESİ (S16b, 27 §4.1; I-2:
 * paylaşımdan önce ne gideceği tam metinle gösterilir). Eski Alert onayı kaldırıldı.
 */
import { act, create } from 'react-test-renderer';

import { ReportPreviewView, REPORT_PREVIEW_INTRO } from '@/components/report-preview-view';
import { SettingsView } from '@/components/settings-view';

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

describe('ReportPreviewView (tam metin önizleme)', () => {
  const TEXT = 'Haftik - deneme raporu (v2)\n\nBuild: 0.1.0+12 (preview), rapor no: 1';

  function renderPreview(over: Partial<React.ComponentProps<typeof ReportPreviewView>> = {}) {
    const onCancel = jest.fn();
    const onShare = jest.fn();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <ReportPreviewView
          visible
          text={TEXT}
          sharing={false}
          error={null}
          onCancel={onCancel}
          onShare={onShare}
          {...over}
        />
      );
    });
    return { tree: tree!, onCancel, onShare };
  }

  it('raporun TAM metnini seçilebilir olarak gösterir', () => {
    const { tree } = renderPreview();
    const el = tree.root.findByProps({ testID: 'report-preview-text' });
    expect(el.props.children).toBe(TEXT);
    expect(el.props.selectable).toBe(true);
  });

  it('paylaşımdan önce ne gideceğini söyler ve "anonim" demez (I-3)', () => {
    expect(REPORT_PREVIEW_INTRO).toMatch(/sayaç/);
    expect(REPORT_PREVIEW_INTRO).toMatch(/gün sayısı/);
    expect(REPORT_PREVIEW_INTRO).toMatch(/kimlik/);
    expect(REPORT_PREVIEW_INTRO).toMatch(/sen seçersin/);
    expect(REPORT_PREVIEW_INTRO).not.toMatch(/anonim/i);
  });

  it('Vazgeç yalnızca onCancel çağırır, Paylaş yalnızca onShare', () => {
    const { tree, onCancel, onShare } = renderPreview();
    act(() => {
      tree.root.findByProps({ testID: 'report-preview-cancel' }).props.onPress();
    });
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onShare).not.toHaveBeenCalled();
    act(() => {
      tree.root.findByProps({ testID: 'report-preview-share' }).props.onPress();
    });
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('paylaşım sürerken Paylaş pasif, hata varsa gösterilir', () => {
    const { tree } = renderPreview({ sharing: true, error: 'Rapor paylaşılamadı.' });
    expect(tree.root.findByProps({ testID: 'report-preview-share' }).props.disabled).toBe(true);
    expect(tree.root.findByProps({ testID: 'report-preview-error' }).props.children).toBe(
      'Rapor paylaşılamadı.'
    );
  });
});

/**
 * `CardPreviewView` — Ekran 5 (`docs/ux/ekran-akisi.md`, spec güvenlik
 * gereksinimi 3; `plan.md` S7b). `@/card/capture` ve `@/card/share`
 * mock'lanır (gerçek cihaz/native modül gerektirmez, aynı desen:
 * `__tests__/card/CardRevealView.test.tsx`, `__tests__/card/capture.test.ts`).
 */
import { Text } from 'react-native';
import { act, create } from 'react-test-renderer';

import { CardPreviewView } from '@/components/card-preview-view';
import type { CardSnapshot } from '@/domain/types';

jest.mock('@/card/capture', () => ({
  __esModule: true,
  captureCardPng: jest.fn(async () => 'file:///fake/card.png'),
}));

jest.mock('@/card/share', () => ({
  __esModule: true,
  shareCard: jest.fn(async () => undefined),
}));

/** `findByProps({testID})`ın döndürdüğü `TestInstance`nın `.toJSON()`u YOK
 * (yalnızca kök `renderer.toJSON()`da var) — bir alt ağacın render edilmiş
 * metnini almak için içindeki `Text` düğümlerinin `props.children`ını
 * toplarız (aynı desen: `__tests__/card/CardView.test.tsx` `textsIn`). */
function textsIn(instance: ReturnType<ReturnType<typeof create>['root']['findByProps']>): string {
  return instance
    .findAllByType(Text)
    .map((node) => String(node.props.children))
    .join(' | ');
}

function makeSnapshot(overrides: Partial<CardSnapshot> = {}): CardSnapshot {
  return {
    weekStart: '2026-09-21',
    checkinDays: 5,
    title: { id: 'title.movement.high', text: 'Enerji Canavarı', basedOnCategories: ['movement'] },
    lines: {
      movement: { id: 'line.movement.high.1', text: 'Bu hafta hiç durmadın.' },
      sleep: { id: 'line.sleep.medium.2', text: 'İdare eden bir uyku haftası.' },
      spending: { id: 'line.spending.low.1', text: 'Cüzdanına iyi davrandın.' },
      social: { id: 'line.social.medium.3', text: 'Ne fazla ne az, tam kıvamında.' },
    },
    deltas: { movement: 1, sleep: 0, spending: null, social: -1 },
    summary: { id: 'summary.mixed.1', text: 'Bu hafta karışık geçti.' },
    contentVersion: 1,
    ...overrides,
  };
}

describe('CardPreviewView — gözden geçirme listesi', () => {
  it('varsayılan: uyku ve harcama satırı KAPALI göz ikonuyla, hareket ve sosyal AÇIK göz ikonuyla başlar', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <CardPreviewView snapshot={makeSnapshot()} onBack={() => {}} onShared={() => {}} />
      );
    });
    expect(textsIn(tree!.root.findByProps({ testID: 'card-preview-toggle-sleep' }))).toContain('🙈');
    expect(textsIn(tree!.root.findByProps({ testID: 'card-preview-toggle-spending' }))).toContain(
      '🙈'
    );
    expect(textsIn(tree!.root.findByProps({ testID: 'card-preview-toggle-movement' }))).toContain(
      '👁'
    );
    expect(textsIn(tree!.root.findByProps({ testID: 'card-preview-toggle-social' }))).toContain(
      '👁'
    );
  });

  it('gizli (varsayılan) satırların gerçek metni BU ekranda hâlâ kullanıcıya görünür ("ne sakladığını bilsin")', () => {
    const snapshot = makeSnapshot();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardPreviewView snapshot={snapshot} onBack={() => {}} onShared={() => {}} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    // sleep/spending varsayılan gizli OLMASINA rağmen gerçek metin ekranda var.
    expect(json).toContain(snapshot.lines.sleep.text);
    expect(json).toContain(snapshot.lines.spending.text);
    expect(json).toContain(snapshot.lines.movement.text);
    expect(json).toContain(snapshot.lines.social.text);
  });

  it('göz ikonuna dokunmak o satırın aç/kapa durumunu değiştirir', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <CardPreviewView snapshot={makeSnapshot()} onBack={() => {}} onShared={() => {}} />
      );
    });
    act(() => {
      tree!.root.findByProps({ testID: 'card-preview-toggle-movement' }).props.onPress();
    });
    expect(textsIn(tree!.root.findByProps({ testID: 'card-preview-toggle-movement' }))).toContain(
      '🙈'
    );

    act(() => {
      tree!.root.findByProps({ testID: 'card-preview-toggle-sleep' }).props.onPress();
    });
    expect(textsIn(tree!.root.findByProps({ testID: 'card-preview-toggle-sleep' }))).toContain('👁');
  });

  it('unvan, basedOnCategories\'teki kategori canlı olarak gizlenince (varsayılan hariç bir kategori) "???" olur', () => {
    // Unvan movement kategorisine dayalı; movement varsayılan AÇIK, o yüzden
    // önce gerçek unvan görünür; movement'ı gizleyince "???" olmalı.
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <CardPreviewView snapshot={makeSnapshot()} onBack={() => {}} onShared={() => {}} />
      );
    });
    expect(String(tree!.root.findByProps({ testID: 'card-preview-title' }).props.children)).toBe(
      'Enerji Canavarı'
    );

    act(() => {
      tree!.root.findByProps({ testID: 'card-preview-toggle-movement' }).props.onPress();
    });
    const title = tree!.root.findByProps({ testID: 'card-preview-title' });
    expect(String(title.props.children)).toBe('???');
  });

  it('"< Geri" onBack\'i çağırır', () => {
    const onBack = jest.fn();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(<CardPreviewView snapshot={makeSnapshot()} onBack={onBack} onShared={() => {}} />);
    });
    act(() => {
      tree!.root.findByProps({ testID: 'card-preview-back' }).props.onPress();
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

describe('CardPreviewView — paylaşım akışı', () => {
  it('"Bu haliyle paylaş": captureCardPng ve shareCard\'ı sırayla çağırır, sonra gizleme varsayılana SIFIRLANIR ve onShared çağrılır', async () => {
    const { captureCardPng } = jest.requireMock('@/card/capture') as { captureCardPng: jest.Mock };
    const { shareCard } = jest.requireMock('@/card/share') as { shareCard: jest.Mock };
    const onShared = jest.fn();

    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <CardPreviewView snapshot={makeSnapshot()} onBack={() => {}} onShared={onShared} />
      );
    });

    // Kullanıcı bir kategoriyi daha gizler (varsayılandan sapar).
    act(() => {
      tree!.root.findByProps({ testID: 'card-preview-toggle-movement' }).props.onPress();
    });
    expect(textsIn(tree!.root.findByProps({ testID: 'card-preview-toggle-movement' }))).toContain(
      '🙈'
    );

    await act(async () => {
      await tree!.root.findByProps({ testID: 'card-preview-share' }).props.onPress();
    });

    expect(captureCardPng).toHaveBeenCalledTimes(1);
    expect(shareCard).toHaveBeenCalledTimes(1);
    // K5 yer tutucusunu içeren kısa bir metinle çağrılır (görev talimatı madde 5).
    expect(shareCard).toHaveBeenCalledWith('file:///fake/card.png', expect.any(String));
    expect(shareCard.mock.calls[0][1]).toContain('[mağaza bağlantısı]');

    // Paylaşım sonrası: varsayılana sıfırlanmış olmalı (movement tekrar açık, sleep/spending tekrar kapalı).
    expect(textsIn(tree!.root.findByProps({ testID: 'card-preview-toggle-movement' }))).toContain(
      '👁'
    );
    expect(textsIn(tree!.root.findByProps({ testID: 'card-preview-toggle-sleep' }))).toContain('🙈');
    expect(onShared).toHaveBeenCalledTimes(1);
  });

  it('yakalama sırasında görünmez (off-screen) CardView\'e her zaman GÜNCEL hiddenCategories geçirilir', async () => {
    // Bu, capture anındaki maskelemenin ekrandaki toggle durumuyla birebir
    // aynı olduğunu (WYSIWYG) dolaylı doğrular: captureCardPng zaten ref
    // üzerinden çalıştığından burada yalnızca çağrıldığını doğruluyoruz;
    // CardView'in maskeleme mantığı `__tests__/card/CardView.test.tsx`te
    // ayrıca ve doğrudan test edilir.
    const { captureCardPng } = jest.requireMock('@/card/capture') as { captureCardPng: jest.Mock };
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <CardPreviewView snapshot={makeSnapshot()} onBack={() => {}} onShared={() => {}} />
      );
    });
    await act(async () => {
      await tree!.root.findByProps({ testID: 'card-preview-share' }).props.onPress();
    });
    expect(captureCardPng).toHaveBeenCalledWith(expect.objectContaining({ current: expect.anything() }));
  });

  it('paylaşım hata fırlatırsa hata mesajı gösterilir ve gizleme durumu KORUNUR (sıfırlanmaz)', async () => {
    const { shareCard } = jest.requireMock('@/card/share') as { shareCard: jest.Mock };
    shareCard.mockRejectedValueOnce(new Error('paylaşım iptal'));
    const onShared = jest.fn();

    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <CardPreviewView snapshot={makeSnapshot()} onBack={() => {}} onShared={onShared} />
      );
    });
    act(() => {
      tree!.root.findByProps({ testID: 'card-preview-toggle-movement' }).props.onPress();
    });

    await act(async () => {
      await tree!.root.findByProps({ testID: 'card-preview-share' }).props.onPress();
    });

    expect(tree!.root.findByProps({ testID: 'card-preview-error' })).toBeTruthy();
    // Hata durumunda kullanıcının seçimleri korunur (movement hâlâ gizli).
    expect(textsIn(tree!.root.findByProps({ testID: 'card-preview-toggle-movement' }))).toContain(
      '🙈'
    );
    expect(onShared).not.toHaveBeenCalled();
  });
});

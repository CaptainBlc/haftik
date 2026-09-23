/**
 * `CardRevealView` — reveal akışının React katmanı (`docs/ux/ekran-akisi.md`
 * "Reveal animasyonu"). Gerçek animasyon zamanlaması/hissi cihazda
 * doğrulanır (bkz. görev özeti "karşılanamadı" listesi); burada yalnızca
 * (1) `CardView`in doğru veriyle render edildiği, (2) atlama (skip)
 * davranışının `onRevealComplete`'i çağırdığı, (3) kapatma butonunun
 * `onClose`'u çağırdığı test edilir.
 *
 * **Her testten sonra ağacı `unmount()` etmek ZORUNLU:** bileşen mount'ta
 * gerçek bir `Animated.sequence` başlatır (~1,6sn); `unmount()` edilmezse
 * `useEffect` temizleme fonksiyonu (`sequence.stop()`) hiç çalışmaz ve
 * zamanlayıcı, Jest ortamı test dosyası bittikten sonra kapanınca
 * `ReferenceError: ... Jest environment has been torn down` ile çöker
 * (gözlemlendi, bu yüzden burada bilerek `afterEach` ile temizleniyor).
 */
import { act, create } from 'react-test-renderer';

import { CardRevealView } from '@/card/CardRevealView';
import type { CardSnapshot } from '@/domain/types';

function makeSnapshot(): CardSnapshot {
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
  };
}

describe('CardRevealView', () => {
  let tree: ReturnType<typeof create> | undefined;

  afterEach(() => {
    if (tree) {
      act(() => {
        tree!.unmount();
      });
      tree = undefined;
    }
  });

  it('CardView\'i dondurulmuş kart verisiyle render eder', () => {
    const snapshot = makeSnapshot();
    act(() => {
      tree = create(<CardRevealView snapshot={snapshot} onClose={() => {}} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain(snapshot.title.text);
    expect(json).toContain(snapshot.summary.text);
  });

  it('ekrana dokunma (skip overlay) animasyonu atlar ve onRevealComplete\'i çağırır', () => {
    const onRevealComplete = jest.fn();
    act(() => {
      tree = create(
        <CardRevealView
          snapshot={makeSnapshot()}
          onClose={() => {}}
          onRevealComplete={onRevealComplete}
        />
      );
    });
    const overlay = tree!.root.findByProps({ testID: 'card-reveal-skip-overlay' });
    act(() => {
      overlay.props.onPress();
    });
    expect(onRevealComplete).toHaveBeenCalledTimes(1);
  });

  it('"X" kapatma butonu onClose\'u çağırır', () => {
    const onClose = jest.fn();
    act(() => {
      tree = create(<CardRevealView snapshot={makeSnapshot()} onClose={onClose} />);
    });
    const close = tree!.root.findByProps({ testID: 'card-reveal-close' });
    act(() => {
      close.props.onPress();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('"Paylaş" butonu reveal tamamlanmadan (animasyon sırasında) GÖRÜNMEZ', () => {
    act(() => {
      tree = create(
        <CardRevealView snapshot={makeSnapshot()} onClose={() => {}} onShare={() => {}} />
      );
    });
    expect(() => tree!.root.findByProps({ testID: 'card-reveal-share' })).toThrow();
  });

  it('reveal tamamlanınca (skip ile) "Paylaş" butonu görünür ve dokununca onShare\'i çağırır', () => {
    const onShare = jest.fn();
    act(() => {
      tree = create(
        <CardRevealView snapshot={makeSnapshot()} onClose={() => {}} onShare={onShare} />
      );
    });
    const overlay = tree!.root.findByProps({ testID: 'card-reveal-skip-overlay' });
    act(() => {
      overlay.props.onPress();
    });
    const share = tree!.root.findByProps({ testID: 'card-reveal-share' });
    act(() => {
      share.props.onPress();
    });
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('onShare verilmezse reveal tamamlansa da "Paylaş" butonu render edilmez', () => {
    act(() => {
      tree = create(<CardRevealView snapshot={makeSnapshot()} onClose={() => {}} />);
    });
    const overlay = tree!.root.findByProps({ testID: 'card-reveal-skip-overlay' });
    act(() => {
      overlay.props.onPress();
    });
    expect(() => tree!.root.findByProps({ testID: 'card-reveal-share' })).toThrow();
  });

  it('skip sonrası tekrar dokununca onRevealComplete ikinci kez çağrılmaz (overlay kaldırılır)', () => {
    const onRevealComplete = jest.fn();
    act(() => {
      tree = create(
        <CardRevealView
          snapshot={makeSnapshot()}
          onClose={() => {}}
          onRevealComplete={onRevealComplete}
        />
      );
    });
    const overlay = tree!.root.findByProps({ testID: 'card-reveal-skip-overlay' });
    act(() => {
      overlay.props.onPress();
    });
    expect(() => tree!.root.findByProps({ testID: 'card-reveal-skip-overlay' })).toThrow();
    expect(onRevealComplete).toHaveBeenCalledTimes(1);
  });
});

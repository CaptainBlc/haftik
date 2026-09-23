/**
 * Kilitli kart yer tutucusu — hem render hem de mimari sınır testi.
 *
 * **Görev talimatının açıkça istediği statik kontrol:** bu bileşen dosyası
 * `content/tr.ts`'i (gerçek unvan/satır/özet metin havuzu) ASLA import
 * etmemeli — kaynağı doğrudan okuyup bir `import ... from '.../content/tr'`
 * deseni aranır (yalnızca dosya içindeki AÇIKLAMA metninde geçen "content/tr"
 * sözcüğünü DEĞİL, gerçek bir import/require ifadesini yakalayacak şekilde).
 */
import fs from 'node:fs';
import path from 'node:path';
import { act, create } from 'react-test-renderer';

import { LockedCardPlaceholder } from '@/components/locked-card-placeholder';

const COMPONENT_SOURCE_PATH = path.resolve(
  __dirname,
  '../../src/components/locked-card-placeholder.tsx'
);

describe('LockedCardPlaceholder — mimari sınır (statik kaynak denetimi)', () => {
  const source = fs.readFileSync(COMPONENT_SOURCE_PATH, 'utf-8');

  it('content/tr.ts\'ten (veya herhangi bir content modülünden) import/require ETMEZ', () => {
    const importsContentPool = /(?:from\s+['"]|require\(\s*['"])[^'"]*content\/tr['"]/.test(
      source
    );
    expect(importsContentPool).toBe(false);
  });

  it('CardView\'i (S7, gerçek kart bileşeni) import etmez', () => {
    const importsCardView = /(?:from\s+['"]|require\(\s*['"])[^'"]*CardView['"]/.test(source);
    expect(importsCardView).toBe(false);
  });
});

describe('LockedCardPlaceholder — render', () => {
  it('yalnızca sağlanan caption metnini çizer, başka gerçek metin/emoji yok', () => {
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <LockedCardPlaceholder caption="Kartın için 1 gün daha lazım." unlocked={false} onPress={() => {}} />
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Kartın için 1 gün daha lazım.');
    // Kilit ikonu (uygulama arayüzü elemanı, karta gömülmez) dışında 12
    // check-in emojisinden hiçbiri (`docs/ux/emoji-seti.md`) burada olmamalı.
    expect(json).not.toMatch(/[🐢🚶🏃😪😌😴🐷💳💸👤👥🎉]/u);
  });

  it('kilitliyken dokunma onPress\'i yine de çağırır (üst katman "hiçbir şey açılmaz" kararını verir)', () => {
    const onPress = jest.fn();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <LockedCardPlaceholder caption="Pazar 20:00'de açılıyor" unlocked={false} onPress={onPress} />
      );
    });
    const pressable = tree!.root.findByProps({ testID: 'locked-card-placeholder' });
    act(() => {
      pressable.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('unlocked iken de aynı şekilde onPress çağrılır', () => {
    const onPress = jest.fn();
    let tree: ReturnType<typeof create> | undefined;
    act(() => {
      tree = create(
        <LockedCardPlaceholder caption="Kartın hazır, açmak için dokun" unlocked onPress={onPress} />
      );
    });
    const pressable = tree!.root.findByProps({ testID: 'locked-card-placeholder' });
    act(() => {
      pressable.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

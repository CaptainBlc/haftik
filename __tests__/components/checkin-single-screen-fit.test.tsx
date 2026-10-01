/**
 * Regresyon: 411x914dp'de 4 kategori + Kaydet tek ekrana sığmalı (ekran-akisi.md Ekran 2).
 * Yerleşim motoru Jest'te yok; dikey bütçe stil sabitlerinden hesaplanır.
 */
import { StyleSheet } from 'react-native';
import { act, create } from 'react-test-renderer';

import { TILE_HEIGHT } from '@/components/category-picker';
import { CheckinForm } from '@/components/checkin-form';

function render() {
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(
      <CheckinForm
        dateLabel="23 Eylül, Çarşamba"
        canGoToYesterday
        canGoToToday={false}
        onGoToYesterday={() => {}}
        onGoToToday={() => {}}
        selection={{}}
        onSelect={() => {}}
        onSave={() => {}}
      />
    );
  });
  return tree!;
}

describe('Bugün ekranı tek ekrana sığma (411x914dp)', () => {
  it('emoji kutusu sabit yükseklikte, 48dp hedefin üstünde, kare değil', () => {
    const t = render();
    const tile = t.root.findByProps({ testID: 'category-social-3' });
    const style = StyleSheet.flatten(tile.props.style);
    expect(style.height).toBe(TILE_HEIGHT);
    expect(style.aspectRatio).toBeUndefined();
    expect(TILE_HEIGHT).toBeGreaterThanOrEqual(48);
    expect(TILE_HEIGHT).toBeLessThanOrEqual(76);
  });

  it('dikey bütçe 914dp - durum çubuğu 24 - sekme çubuğu 80 içinde kalır', () => {
    const t = render();
    const back = StyleSheet.flatten(t.root.findByProps({ testID: 'date-nav-back' }).props.style);
    expect(back.minHeight).toBeGreaterThanOrEqual(48);
    const date = StyleSheet.flatten(t.root.findByProps({ testID: 'date-label' }).props.style);
    const save = StyleSheet.flatten(t.root.findByProps({ testID: 'save-button' }).props.style);
    const dateH = 20 + (date.lineHeight as number);
    const categories = 4 * (20 + 4 + TILE_HEIGHT) + 3 * 12;
    const total =
      24 /* durum çubuğu */ + 8 + 48 + 8 + dateH + 8 + categories + 8 + 20 + 8 +
      (save.minHeight as number) + 16;
    expect(total).toBeLessThanOrEqual(914 - 80);
  });
});

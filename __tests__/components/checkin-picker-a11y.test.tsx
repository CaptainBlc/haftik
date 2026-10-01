/** Emülatör UX B1/B2/B3/B4. */
import { StyleSheet } from 'react-native';
import { act, create } from 'react-test-renderer';

import { CategoryPicker } from '@/components/category-picker';
import { CheckinForm } from '@/components/checkin-form';
import { CATEGORY_LEVEL_LABELS_TR } from '@/constants/emoji';
import { CATEGORIES } from '@/domain/types';
import type { CategorySelection } from '@/lib/checkin-form';

function emojiOpacity(tree: ReturnType<typeof create>, testID: string): number | undefined {
  const option = tree.root.findByProps({ testID });
  const emoji = option.findAll(
    (n) => n.props.style !== undefined && StyleSheet.flatten(n.props.style)?.fontSize === 40
  )[0];
  return StyleSheet.flatten(emoji.props.style).opacity as number | undefined;
}

function renderPicker(selection: CategorySelection) {
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<CategoryPicker selection={selection} onSelect={() => {}} />);
  });
  return tree!;
}

describe('CategoryPicker B1: soluklaştırma yalnızca seçim varken', () => {
  it('hiç seçim yokken tüm emojiler tam opaklık', () => {
    const t = renderPicker({});
    for (const c of CATEGORIES) {
      for (const v of [1, 2, 3]) {
        expect(emojiOpacity(t, `category-${c}-${v}`)).toBeUndefined();
      }
    }
  });

  it('bir kategoride seçim varsa yalnızca O kategorinin seçilmeyenleri soluk', () => {
    const t = renderPicker({ movement: 2 });
    expect(emojiOpacity(t, 'category-movement-2')).toBeUndefined();
    expect(emojiOpacity(t, 'category-movement-1')).toBe(0.5);
    expect(emojiOpacity(t, 'category-movement-3')).toBe(0.5);
    // diğer kategoriler etkilenmez
    expect(emojiOpacity(t, 'category-sleep-1')).toBeUndefined();
  });
});

describe('CategoryPicker B2: erişilebilirlik etiketi ve seviye adı', () => {
  it('her düğme "Kategori: seviye" etiketi taşır', () => {
    const t = renderPicker({});
    const label = (id: string) => t.root.findByProps({ testID: id }).props.accessibilityLabel;
    expect(label('category-movement-1')).toBe('Hareket: durgun');
    expect(label('category-movement-2')).toBe('Hareket: hafif');
    expect(label('category-movement-3')).toBe('Hareket: yoğun');
    expect(label('category-social-3')).toBe('Sosyal: kalabalık');
  });

  it('12 seviye adı tanımlı ve kategori içinde benzersiz', () => {
    for (const c of CATEGORIES) {
      const names = Object.values(CATEGORY_LEVEL_LABELS_TR[c]);
      expect(names).toHaveLength(3);
      expect(new Set(names).size).toBe(3);
    }
  });

  it('seçili seviyenin adı kategori başlığının yanında görünür', () => {
    const t = renderPicker({ sleep: 3 });
    const children = t.root.findByProps({ testID: 'category-sleep-level' }).props.children;
    expect([].concat(children).join('')).toContain(CATEGORY_LEVEL_LABELS_TR.sleep[3]);
    expect(t.root.findAllByProps({ testID: 'category-movement-level' })).toHaveLength(0);
  });

  it('emoji boyutu büyütüldü (>= 36)', () => {
    const t = renderPicker({});
    const option = t.root.findByProps({ testID: 'category-movement-1' });
    const sizes = option
      .findAll((n) => n.props.style !== undefined)
      .map((n) => StyleSheet.flatten(n.props.style)?.fontSize)
      .filter((s): s is number => typeof s === 'number');
    expect(Math.max(...sizes)).toBeGreaterThanOrEqual(36);
  });
});

function renderForm(selection: CategorySelection, canGoToYesterday = true, canGoToToday = false) {
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(
      <CheckinForm
        dateLabel="23 Eylül, Çarşamba"
        canGoToYesterday={canGoToYesterday}
        canGoToToday={canGoToToday}
        onGoToYesterday={() => {}}
        onGoToToday={() => {}}
        selection={selection}
        onSelect={() => {}}
        onSave={() => {}}
      />
    );
  });
  return tree!;
}

const hint = (t: ReturnType<typeof create>) =>
  String(t.root.findByProps({ testID: 'save-hint' }).props.children);

describe('CheckinForm B3: "N kategori kaldı" ipucu', () => {
  it('0/4: "4 kategori kaldı"', () => {
    expect(hint(renderForm({}))).toBe('4 kategori kaldı');
  });
  it('2/4: "2 kategori kaldı"', () => {
    expect(hint(renderForm({ movement: 1, sleep: 2 }))).toBe('2 kategori kaldı');
  });
  it('3/4: "1 kategori kaldı"', () => {
    expect(hint(renderForm({ movement: 1, sleep: 2, spending: 3 }))).toBe('1 kategori kaldı');
  });
  it('4/4: ipucu boş (yalnızca yer tutar)', () => {
    expect(hint(renderForm({ movement: 1, sleep: 2, spending: 3, social: 1 })).trim()).toBe('');
  });
  it('tavsiyesiz: emir/uyarı kelimesi yok', () => {
    expect(hint(renderForm({}))).not.toMatch(/lütfen|mutlaka|zorunlu|yapmalısın/i);
  });
});

describe('CheckinForm B4: Dün/Bugün geçişi', () => {
  it('geri düğmesi açık etiketli ("Dünü düzenle"), >= 48dp', () => {
    const t = renderForm({});
    const back = t.root.findByProps({ testID: 'date-nav-back' });
    expect(back.props.accessibilityLabel).toBe('Dünü düzenle');
    const flat = StyleSheet.flatten(back.props.style);
    expect(flat.minHeight).toBeGreaterThanOrEqual(48);
    expect(flat.minWidth).toBeGreaterThanOrEqual(48);
    const forward = t.root.findByProps({ testID: 'date-nav-forward' });
    expect(forward.props.accessibilityLabel).toBe('Bugüne dön');
  });

  it('başlık hangi günün düzenlendiğini yazar: bugün -> "Bugün", dün -> "Dün"', () => {
    const today = renderForm({}, true, false).root.findByProps({ testID: 'day-caption' });
    const yesterday = renderForm({}, false, true).root.findByProps({ testID: 'day-caption' });
    expect(String(today.props.children)).toBe('Bugün');
    expect(String(yesterday.props.children)).toBe('Dün');
  });

  it('etiketsiz tek karakterli "<" düğmesi kalmadı', () => {
    const t = renderForm({});
    const json = JSON.stringify(t.toJSON());
    expect(json).toContain('‹ Dün');
    expect(json).not.toContain('"<"');
  });
});

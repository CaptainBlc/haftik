/**
 * Bugün ekranı (Ekran 2, `docs/ux/ekran-akisi.md`) — sunum bileşeni.
 * Veri/router'a dokunmaz; tarih etiketi, geçiş yetkileri ve seçim durumu
 * dışarıdan (`src/app/(main)/today.tsx`) verilir.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CategoryPicker } from '@/components/category-picker';
import { CrossFade } from '@/components/cross-fade';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTopInset } from '@/hooks/use-top-inset';
import { useTheme } from '@/hooks/use-theme';
import type { Category, CategoryValue } from '@/domain/types';
import { CATEGORIES } from '@/domain/types';
import { isSelectionComplete, isSameSelection, type CategorySelection } from '@/lib/checkin-form';

export interface CheckinFormProps {
  dateLabel: string;
  canGoToYesterday: boolean;
  canGoToToday: boolean;
  onGoToYesterday: () => void;
  onGoToToday: () => void;
  selection: CategorySelection;
  onSelect: (category: Category, value: CategoryValue) => void;
  onSave: () => void;
  /** Veri henüz yüklenirken veya kayıt sırasında Kaydet'i de ayrıca kapatır. */
  disabledExtra?: boolean;
  /**
   * S22: kayıtlı hâl. Verilirse (`null` = bu gün için kayıt yok) düğme yuvası durumlu olur: seçim kayıtlıyla
   * aynıysa "Kaydedildi" (etkisiz bilgi), değiştiyse "Güncelle". Verilmezse eski davranış: her zaman "Kaydet".
   */
  savedSelection?: CategorySelection | null;
  /** S22: Kaydet'ten sonraki ilerleme cümlesi; `id` her kayıtta artar (aynı metin tekrar duyurulabilsin). */
  feedback?: { id: number; text: string } | null;
  /**
   * S22 (X): kayıt başarısız oldu. Cümle ipucu satırında görünür (seçimler korunur, Kaydet aktif kalır) ve
   * ekran okuyucuya okunur. Seçim değişince ya da yeni kayıt denenince üst katman bunu temizler.
   */
  saveError?: { id: number; text: string } | null;
  /**
   * S22: boş durum ipucu (ör. uzun aradan sonra yeni hafta). Yalnız HİÇ kategori seçilmemişken "4 kategori kaldı"nın yerine
   * görünür; ilk seçimle normal ipucuna döner.
   */
  emptyHint?: string | null;
  /**
   * S22 (B8): kayıtlı durumdayken bekleyen geçen hafta kartı varsa düğme yuvası "Geçen haftanın kartını aç"
   * olur (ödül, eylemden sonra; dikey bütçe +0).
   */
  onOpenPendingCard?: (() => void) | null;
}

/** Düğme yuvasının sabit etiketleri (S22). */
export const SAVE_BUTTON_LABELS = {
  save: 'Kaydet',
  saved: '✓ Kaydedildi',
  update: 'Güncelle',
  openPendingCard: 'Geçen haftanın kartını aç',
} as const;

export function CheckinForm({
  dateLabel,
  canGoToYesterday,
  canGoToToday,
  onGoToYesterday,
  onGoToToday,
  selection,
  onSelect,
  onSave,
  disabledExtra = false,
  savedSelection,
  feedback = null,
  saveError = null,
  emptyHint = null,
  onOpenPendingCard = null,
}: CheckinFormProps) {
  const theme = useTheme();
  const topInset = useTopInset();
  const [pressed, setPressed] = useState(false);
  const complete = isSelectionComplete(selection);
  const remaining = CATEGORIES.filter((category) => selection[category] === undefined).length;
  const hasSaved = savedSelection !== undefined && savedSelection !== null;
  const unchanged = hasSaved && isSameSelection(selection, savedSelection);
  const showPendingCard = unchanged && onOpenPendingCard !== null && !disabledExtra;
  const saveDisabled = !complete || disabledExtra || unchanged;
  const buttonDisabled = showPendingCard ? false : saveDisabled;
  const buttonLabel = showPendingCard
    ? SAVE_BUTTON_LABELS.openPendingCard
    : hasSaved
      ? unchanged
        ? SAVE_BUTTON_LABELS.saved
        : SAVE_BUTTON_LABELS.update
      : SAVE_BUTTON_LABELS.save;
  // Hata her şeyden önce gelir; ilerleme cümlesi yalnız kayıtlı hâl değişmeden görünür (seçim değişince
  // normal ipucuna döner).
  const showFeedback = feedback !== null && unchanged;
  const hintText = saveError
    ? saveError.text
    : showFeedback
      ? feedback.text
      : complete
        ? ' '
        : remaining === CATEGORIES.length && emptyHint
          ? emptyHint
          : `${remaining} kategori kaldı`;
  const announceKey = saveError ? `e${saveError.id}` : showFeedback ? `f${feedback.id}` : null;
  const announceText = saveError ? saveError.text : showFeedback ? feedback.text : null;

  // A11Y-07: gösterilen cümle ekran okuyucuya AYNEN okunur (kayıt/hata başına bir kez).
  useEffect(() => {
    if (announceKey !== null && announceText) {
      AccessibilityInfo.announceForAccessibility(announceText);
    }
  }, [announceKey, announceText]);
  // Hangi günün düzenlendiği başlıkta açıkça yazar (yanlış güne kayıt riski, B4).
  const dayCaption = canGoToToday ? 'Dün' : 'Bugün';

  return (
    <ThemedView style={[styles.container, { paddingTop: Spacing.two + topInset }]}>
      <View style={styles.header}>
        <Pressable
          testID="date-nav-back"
          accessibilityRole="button"
          accessibilityLabel="Dünü düzenle"
          disabled={!canGoToYesterday}
          onPress={onGoToYesterday}
          style={[styles.navButton, !canGoToYesterday && styles.navButtonDisabled]}>
          <ThemedText type="smallBold">{'‹ Dün'}</ThemedText>
        </Pressable>
        <Pressable
          testID="date-nav-forward"
          accessibilityRole="button"
          accessibilityLabel="Bugüne dön"
          disabled={!canGoToToday}
          onPress={onGoToToday}
          style={[styles.navButton, !canGoToToday && styles.navButtonDisabled]}>
          <ThemedText type="smallBold">{'Bugün ›'}</ThemedText>
        </Pressable>
      </View>

      <View>
        <ThemedText type="small" themeColor="textSecondary" testID="day-caption">
          {dayCaption}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.dateLabel} testID="date-label">
          {dateLabel}
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CategoryPicker selection={selection} onSelect={onSelect} />
      </ScrollView>

      <ThemedText
        type="small"
        themeColor="textSecondary"
        testID="save-hint"
        style={styles.saveHint}>
        {hintText}
      </ThemedText>

      <Pressable
        testID="save-button"
        accessibilityRole="button"
        accessibilityState={{ disabled: buttonDisabled }}
        disabled={buttonDisabled}
        onPress={showPendingCard ? (onOpenPendingCard ?? undefined) : onSave}
        // Basılı 0,97 (17 §2.8). Stil dizisi statik kalır: `checkin-single-screen-fit` testi `style`ı düzleştirir.
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={[
          styles.saveButton,
          { backgroundColor: buttonDisabled ? theme.backgroundElement : theme.text },
          pressed && !buttonDisabled && styles.saveButtonPressed,
        ]}>
        <CrossFade changeKey={buttonLabel}>
          <ThemedText
            type="smallBold"
            style={{ color: buttonDisabled ? theme.textSecondary : theme.background }}>
            {buttonLabel}
          </ThemedText>
        </CrossFade>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateLabel: {
    textAlign: 'left',
    fontSize: 24, // subtitle (32) bir kademe küçük: dikey yer tasarrufu
    lineHeight: 30,
  },
  navButton: {
    paddingHorizontal: Spacing.three,
    minWidth: 48,
    minHeight: 48, // B4: dokunma hedefi >= 48dp
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveHint: {
    textAlign: 'center',
  },
  navButtonDisabled: {
    opacity: 0,
  },
  scrollContent: {
    gap: Spacing.two,
  },
  saveButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  saveButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
});

/**
 * Gizleme önizleme ekranı — Ekran 5 (`docs/ux/ekran-akisi.md`), spec güvenlik
 * gereksinimi 3'ün ("paylaşmadan önce zorunlu önizleme; kategori bazlı
 * göster/gizle") UI karşılığı. `plan.md` S7b.
 *
 * **İki AYRI görsel katman, bilerek (mimari karar):**
 * 1. **Gözden geçirme listesi** (bu bileşenin asıl gövdesi): her kategori
 *    için gerçek emoji + gerçek satır metni + göz ikonu (aç/kapa) gösterir.
 *    Görev talimatı: "gizli satırın gerçek metni BU ekranda kullanıcıya
 *    görünür (ne sakladığını bilsin)". Bu liste `CardView` DEĞİLDİR, sıradan
 *    metin satırlarıdır — hiçbir zaman `ViewShot`/`captureRef` ile
 *    yakalanmaz, ekrana asla PNG olarak basılmaz.
 * 2. **Yakalama kaynağı** (ekranın en altında, `pointerEvents="none"` ve
 *    ekran dışına konumlandırılmış — görünmez ama mount'lu): gerçek
 *    `CardView`, `hiddenCategories={hidden}` prop'uyla. Bu, "Bu haliyle
 *    paylaş" tetiklendiğinde `captureCardPng` ile yakalanan TEK kaynaktır;
 *    gizli kategoriler için gerçek metni HİÇ render etmez (bkz.
 *    `CardView.tsx` başlığı) — paylaşılan PNG'de her zaman "???" basılı
 *    kalır, kullanıcının bu ekranda gördüğü gerçek metinden bağımsız olarak.
 * Bu ayrım, `ekran-akisi.md`'nin kilitli kart için savunduğu "gerçek
 * bileşeni render edip üstüne bir şey bindirmek risklidir, ayrı bileşen bu
 * riski kökten yok eder" ilkesiyle aynı gerekçeyle seçildi.
 *
 * **Unvan:** ayrı bir aç/kapa satırı değildir (`ekran-akisi.md`). Bu ekranda
 * unvan, `shouldHideTitle` ile CANLI olarak hesaplanıp gösterilir — yani
 * kullanıcı bir kategoriyi gizlediğinde, unvan o kategoriden türetilmişse
 * BURADA DA anında `???`'a döner (paylaşılacak PNG ile birebir aynı sonucu
 * önceden gösterir, sürpriz olmaz).
 *
 * **Gizleme kalıcı değildir** (`ekran-akisi.md`): paylaşım TAMAMLANDIĞINDA
 * (`shareCard` başarıyla döndüğünde) `hiddenCategories` varsayılana
 * sıfırlanır. Ayrıca bu bileşenin kendisi de her mount'ta taze bir
 * varsayılan kümeyle başlar (`useState(defaultHiddenCategories)`), yani
 * ekrandan çıkıp tekrar girmek de aynı garantiyi doğal olarak verir.
 */
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { ViewShotRef } from 'react-native-view-shot';

import { captureCardPng } from '@/card/capture';
import { CardView } from '@/card/CardView';
import { defaultHiddenCategories, toggleHiddenCategory } from '@/card/hide-state';
import { LEVEL_TO_VALUE, levelFromLineId } from '@/card/line-level';
import { shareCard } from '@/card/share';
import { shouldHideTitle } from '@/card/title-visibility';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { STORE_LINK_PLACEHOLDER } from '@/config/constants';
import { CATEGORY_EMOJI, CATEGORY_LABELS_TR } from '@/constants/emoji';
import { Spacing } from '@/constants/theme';
import { CATEGORIES } from '@/domain/types';
import type { Category, CardSnapshot } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';
import { useTopInset } from '@/hooks/use-top-inset';
import { trackShareInitiated } from '@/metrics/track';

/** K5 yer tutucusunu içeren kısa paylaşım metni (görev talimatı madde 5). */
const SHARE_MESSAGE = `Haftalık kartım hazır! ${STORE_LINK_PLACEHOLDER}`;

export interface CardPreviewViewProps {
  snapshot: CardSnapshot;
  onBack: () => void;
  /** Paylaşım başarıyla tamamlandığında (gizleme sıfırlandıktan sonra) çağrılır. */
  onShared: () => void;
}

export function CardPreviewView({ snapshot, onBack, onShared }: CardPreviewViewProps) {
  const theme = useTheme();
  const topInset = useTopInset();
  const [hidden, setHidden] = useState<Set<Category>>(defaultHiddenCategories);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewShotRef = useRef<ViewShotRef>(null);

  const titleHidden = shouldHideTitle(snapshot.title.basedOnCategories, hidden);

  function handleToggle(category: Category) {
    setHidden((current) => toggleHiddenCategory(current, category));
  }

  async function handleShare() {
    setError(null);
    setSharing(true);
    try {
      const uri = await captureCardPng(viewShotRef);
      // S9: paylaşım sayfası açılmadan hemen önce (en iyi çaba; kategori adı yok).
      void trackShareInitiated(snapshot.weekStart, hidden.size);
      await shareCard(uri, SHARE_MESSAGE);
      // Spec: gizleme yalnızca o paylaşım içindir — tamamlanınca sıfırlanır.
      setHidden(defaultHiddenCategories());
      onShared();
    } catch {
      setError('Paylaşım başarısız oldu, tekrar dene.');
    } finally {
      setSharing(false);
    }
  }

  return (
    // A11Y-01: üst güvenli alan (durum çubuğu) altından başlar, Geri ölü bölgeye düşmez.
    <ThemedView style={[styles.container, { paddingTop: Spacing.four + topInset }]}>
      <Pressable
        testID="card-preview-back"
        accessibilityRole="button"
        onPress={onBack}
        style={styles.backButton}>
        <ThemedText themeColor="textSecondary">{'< Geri'}</ThemedText>
      </Pressable>

      <ThemedText type="subtitle" style={styles.heading}>
        Paylaşmadan önce gözden geçir.
      </ThemedText>

      <ThemedText testID="card-preview-title" type="title" style={styles.title} numberOfLines={2}>
        {titleHidden ? '???' : snapshot.title.text}
      </ThemedText>

      <View style={styles.rows}>
        {CATEGORIES.map((category) => {
          const isHidden = hidden.has(category);
          const line = snapshot.lines[category];
          const emoji = CATEGORY_EMOJI[category][LEVEL_TO_VALUE[levelFromLineId(line.id)]];
          return (
            <View key={category} testID={`card-preview-row-${category}`} style={styles.row}>
              <ThemedText style={styles.rowEmoji}>{emoji}</ThemedText>
              <ThemedText
                // A11Y-06: yazı 2.0'da paylaşılacak metin kesilmesin (numberOfLines yok, sarar).
                style={[styles.rowText, isHidden && { color: theme.textSecondary }]}
                accessibilityLabel={`${CATEGORY_LABELS_TR[category]}: ${line.text}`}>
                {line.text}
              </ThemedText>
              <Pressable
                testID={`card-preview-toggle-${category}`}
                accessibilityRole="button"
                accessibilityLabel={
                  isHidden
                    ? `${CATEGORY_LABELS_TR[category]} satırını göster`
                    : `${CATEGORY_LABELS_TR[category]} satırını gizle`
                }
                onPress={() => handleToggle(category)}
                hitSlop={Spacing.two}
                style={styles.toggleButton}>
                <ThemedText style={styles.eyeIcon}>{isHidden ? '🙈' : '👁'}</ThemedText>
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={styles.summaryPill}>
        <ThemedText style={styles.summaryText}>{snapshot.summary.text}</ThemedText>
      </View>

      {error && (
        <ThemedText testID="card-preview-error" themeColor="textSecondary" style={styles.error}>
          {error}
        </ThemedText>
      )}

      <Pressable
        testID="card-preview-share"
        accessibilityRole="button"
        accessibilityState={{ disabled: sharing }}
        disabled={sharing}
        onPress={handleShare}
        style={[styles.shareButton, { backgroundColor: theme.text, opacity: sharing ? 0.6 : 1 }]}>
        <ThemedText type="smallBold" style={{ color: theme.background }}>
          {sharing ? 'Hazırlanıyor…' : 'Bu haliyle paylaş'}
        </ThemedText>
      </Pressable>

      {/*
       * Yakalama kaynağı (bkz. dosya başlığı madde 2). Ekran dışına
       * konumlandırıldı ama `display: none` DEĞİL — `react-native-view-shot`
       * bir View'i yakalayabilmek için o View'in gerçekten layout edilmiş
       * (mount'lu) olmasını gerektirir.
       */}
      <View style={styles.captureSource} pointerEvents="none">
        <CardView ref={viewShotRef} snapshot={snapshot} hiddenCategories={hidden} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  heading: {
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
  },
  rows: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 48, // A11Y-02
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 48, // A11Y-01
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  toggleButton: {
    minWidth: 48, // A11Y-02: Material/WCAG 2.5.8 dokunma hedefi
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowEmoji: {
    fontSize: 22,
  },
  rowText: {
    flex: 1,
  },
  eyeIcon: {
    fontSize: 20,
  },
  summaryPill: {
    alignSelf: 'center',
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  summaryText: {
    fontStyle: 'italic',
  },
  error: {
    textAlign: 'center',
  },
  shareButton: {
    marginTop: 'auto',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  captureSource: {
    position: 'absolute',
    top: -10000,
    left: 0,
  },
});

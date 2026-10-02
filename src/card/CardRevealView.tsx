/**
 * Kart açılışı reveal akışı — v1'in tek "wow anı"
 * (`docs/ux/ekran-akisi.md` "Tek 'wow anı'" + "Reveal animasyonu").
 * `CardSnapshot`'ı props olarak alır, saf `CardView`'i (S7a) aşamalı bir
 * animasyonla gösterir.
 *
 * Adımlar (dokümanla birebir):
 * 1. Yükleme/spinner yok (`buildCard` cihazda milisaniyeler sürer).
 * 2. Blur→net geçiş (~400ms crossfade).
 * 3. İçerik aşamalı belirir: unvan (~150ms) → 4 satır sırayla (~80ms
 *    arayla, hareket→uyku→harcama→sosyal) → özet. Toplam ~1,2sn.
 * 4. Herhangi bir dokunuşla animasyon anında tamamlanır (atlanabilir).
 *
 * **Bilinçli yaklaşım notu (blur→net):** doküman gerçek bir gaussian blur
 * tarif ediyor; bu depoda `expo-blur` (veya benzeri) bir bağımlılık yok ve
 * bu dilimde (S7a) eklenmedi — yeni bir native bağımlılık kararı görev
 * kapsamı dışında kaldı. Bunun yerine yalnızca opaklık ile bir crossfade
 * YAKLAŞIK olarak taklit edilir; gerçek blur efekti istenirse S10 (Android
 * cihaz testi, cila) dilimine bırakılabilir (bkz. `plan.md` S7a notu).
 *
 * PNG yakalama (`capture.ts`) her zaman TAM opaklıkla (animasyon
 * tamamlandıktan/atlandıktan sonra) yapılmalıdır — bu bileşenin kendisi
 * yakalamayı tetiklemez, yalnızca `viewShotRef`'i `onRevealComplete` ile
 * dışarı açar.
 *
 * **"Paylaş" birincil eylemi (Ekran 4, `ekran-akisi.md`; S7b'de eklendi):**
 * yalnızca reveal tamamlandıktan (`revealed === true`) sonra görünür —
 * animasyon sırasında dikkat dağıtmaması için (aynı "wow anı önce, eylem
 * sonra" ilkesi). Dokunulunca bu bileşen KENDİSİ paylaşım yapmaz/yakalama
 * tetiklemez; yalnızca `onShare`'i çağırır — asıl gizleme önizlemesi ve
 * yakalama akışı `src/components/card-preview-view.tsx`tedir (Ekran 5),
 * çağıran ekran (`src/app/card/[weekStart].tsx`) `onShare` ile oraya geçer.
 */
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ViewShotRef } from 'react-native-view-shot';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { CardSnapshot } from '@/domain/types';

import { CardView } from './CardView';
import {
  CARD_LOGICAL_HEIGHT,
  CARD_LOGICAL_WIDTH,
  CARD_SCREEN_BOTTOM_BAR,
  CARD_SCREEN_TOP_BAR,
  computeCardDisplayScale,
} from './layout';

const BLUR_FADE_MS = 400;
const CONTENT_REVEAL_MS = 1200;

export interface CardRevealViewProps {
  snapshot: CardSnapshot;
  onClose: () => void;
  /** Reveal animasyonu tamamlandığında (doğal bitiş veya atlama) çağrılır. */
  onRevealComplete?: () => void;
  /**
   * "Paylaş" butonuna dokununca çağrılır (yalnızca `revealed` iken buton
   * görünür). Verilmezse buton hiç render edilmez (ör. ileride bu bileşenin
   * paylaşımsız bir bağlamda kullanılması ihtimaline karşı).
   */
  onShare?: () => void;
}

export function CardRevealView({
  snapshot,
  onClose,
  onRevealComplete,
  onShare,
}: CardRevealViewProps) {
  // `Animated.Value`/`CompositeAnimation` standart RN `Animated` API'sinin
  // mutable nesneleridir; `useRef` yalnızca referanslarını sabit tutar.
  // (Eskiden burada `react-hooks/refs` yanlış pozitifi için dosya geneli
  // disable vardı; A11Y-04 değişikliğinden sonra kural bu bileşende hata
  // vermiyor ve disable "kullanılmayan direktif" uyarısı verdiği için
  // kaldırıldı. Yanlış pozitif geri gelirse bkz. CLAUDE.md MOB/S6.)
  const blurFade = useRef(new Animated.Value(0)).current;
  const contentProgress = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const viewShotRef = useRef<ViewShotRef>(null);
  const [revealed, setRevealed] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const scale = computeCardDisplayScale(windowWidth, windowHeight);
  const scaledWidth = Math.round(CARD_LOGICAL_WIDTH * scale);
  const scaledHeight = Math.round(CARD_LOGICAL_HEIGHT * scale);

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.timing(blurFade, {
        toValue: 1,
        duration: BLUR_FADE_MS,
        useNativeDriver: true,
      }),
      Animated.timing(contentProgress, {
        toValue: 1,
        duration: CONTENT_REVEAL_MS,
        useNativeDriver: true,
      }),
    ]);
    animationRef.current = sequence;
    sequence.start(({ finished }) => {
      if (finished) {
        setRevealed(true);
        onRevealComplete?.();
      }
    });
    // A11Y-04 (WCAG 2.3.3): sistem "animasyonları kaldır" tercihi açıksa
    // reveal atlanır (kart doğrudan nihai hâliyle gösterilir).
    let unmounted = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduce) => {
        if (reduce && !unmounted) {
          handleSkip();
        }
      })
      .catch(() => undefined);
    return () => {
      unmounted = true;
      sequence.stop();
    };
    // Yalnızca mount'ta bir kez başlatılır; `blurFade`/`contentProgress`
    // `useRef` ile sabit tutulan `Animated.Value`lerdir, tekrar tetiklenmez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSkip() {
    if (revealed) {
      return;
    }
    animationRef.current?.stop();
    blurFade.setValue(1);
    contentProgress.setValue(1);
    setRevealed(true);
    onRevealComplete?.();
  }

  function sectionOpacity(start: number, end: number) {
    return contentProgress.interpolate({
      inputRange: [start, end],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      {!revealed && (
        <Pressable
          testID="card-reveal-skip-overlay"
          style={StyleSheet.absoluteFill}
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel="Animasyonu atla"
        />
      )}

      {/* Üst çubuk: Kapat kartla/unvanla çakışmaz (QA BLG-07). */}
      <View style={styles.topBar}>
        <Pressable
          testID="card-reveal-close"
          accessibilityRole="button"
          accessibilityLabel="Kapat"
          onPress={onClose}
          style={styles.closeButton}>
          <ThemedText style={styles.closeText}>✕</ThemedText>
        </Pressable>
      </View>

      <View style={styles.center}>
        <Animated.View
          testID="card-scale-wrapper"
          style={[
            styles.cardWrapper,
            { width: scaledWidth, height: scaledHeight, opacity: blurFade },
          ]}>
          {/* Kart hep 360x640 mantıksal çizilir; ekran küçükse yalnızca görünüm ölçeklenir. */}
          <View
            style={[
              styles.cardScaler,
              {
                left: (scaledWidth - CARD_LOGICAL_WIDTH) / 2,
                top: (scaledHeight - CARD_LOGICAL_HEIGHT) / 2,
                transform: [{ scale }],
              },
            ]}>
            <CardView
              ref={viewShotRef}
              snapshot={snapshot}
              sectionOpacity={{
                title: sectionOpacity(0, 0.15),
                movement: sectionOpacity(0.1, 0.25),
                sleep: sectionOpacity(0.22, 0.37),
                spending: sectionOpacity(0.34, 0.49),
                social: sectionOpacity(0.46, 0.61),
                summary: sectionOpacity(0.6, 0.75),
              }}
            />
          </View>
        </Animated.View>
      </View>

      {/* Alt çubuk: Paylaş sabit alanda, özetle/damgayla çakışmaz; yer, buton görünmeden de ayrılır. */}
      <View style={styles.bottomBar}>
        {revealed && onShare && (
          <Pressable
            testID="card-reveal-share"
            accessibilityRole="button"
            onPress={onShare}
            style={styles.shareButton}>
            <ThemedText type="smallBold" style={styles.shareButtonText}>
              Paylaş
            </ThemedText>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    height: CARD_SCREEN_TOP_BAR,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    height: CARD_SCREEN_BOTTOM_BAR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  cardScaler: {
    position: 'absolute',
    width: CARD_LOGICAL_WIDTH,
    height: CARD_LOGICAL_HEIGHT,
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 22,
  },
  shareButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.two,
    backgroundColor: '#1C1C1E',
  },
  shareButtonText: {
    color: '#FFFFFF',
  },
});

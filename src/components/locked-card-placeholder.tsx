/**
 * Kilitli kart yer tutucusu (Ekran 3, `docs/ux/ekran-akisi.md` + gerçek
 * ölçüler `docs/ux/kart-yerlesimi.md` "Kilitli kart yer tutucusu").
 *
 * **KRİTİK güvenlik/mimari kısıt (spec: "yer tutucu içerikle; gerçek metin
 * çizilmez", `kart-yerlesimi.md`: "ayrı, sabit bir iskelet bileşeni"):** bu
 * dosya gerçek `CardView`'i (S7) hiç render etmez, `src/domain/content/tr.ts`'i
 * hiç import etmez ve hiçbir gerçek unvan/satır/emoji metni çizmez — yalnızca
 * sabit gri "iskelet" bloklar + kilit ikonu. Bu, denetlenebilir bir
 * mimari sınırdır (bkz. `__tests__/components/locked-card-placeholder.test.tsx`:
 * bu dosyanın kaynağında `content/tr` veya `CardView` geçmediğini statik
 * olarak doğrular).
 */
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export interface LockedCardPlaceholderProps {
  /** Kutunun altındaki kısa durum metni (bkz. `src/lib/week-status-copy.ts`). */
  caption: string;
  /** `WeekState.unlocked` — açık ise dokunma farklı davranır (üst katman kararı). */
  unlocked: boolean;
  onPress: () => void;
}

/**
 * ~200x356, gerçek kartla aynı 9:16 oranında, ~%55 ölçek (bkz. `kart-yerlesimi.md`).
 * Kısa ekranda / büyük yazıda ekran yüksekliğinin ~%40'ıyla sınırlanır (B10),
 * oran korunur.
 */
const PLACEHOLDER_MAX_HEIGHT = 356;

export function placeholderSize(windowHeight: number): { width: number; height: number } {
  const height = Math.min(PLACEHOLDER_MAX_HEIGHT, Math.round(windowHeight * 0.4));
  return { width: Math.round((height * 9) / 16), height };
}

export function LockedCardPlaceholder({ caption, unlocked, onPress }: LockedCardPlaceholderProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const { height: windowHeight } = useWindowDimensions();
  const size = placeholderSize(windowHeight);

  function handlePress() {
    if (!unlocked) {
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 1, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
    onPress();
  }

  // `react-hooks/refs`, `useRef(new Animated.Value(0)).current` deseninin
  // (standart RN Animated kullanımı — bkz. React Native'in kendi
  // dokümantasyonu) render sırasında `.interpolate()` çağrılmasını "ref
  // render sırasında okunuyor" diye işaretliyor; bu React Compiler'a hazırlık
  // amaçlı yeni bir kural ve `Animated.Value`, normal bir React ref DEĞİL
  // (mutable bir animasyon nesnesi, `useRef` yalnızca referansını sabit
  // tutmak için kullanılıyor) — yanlış pozitif. Aynı gerekçeyle CLAUDE.md
  // "Bilinen tuzaklar"a not düşüldü (bkz. MOB/S6).
  // eslint-disable-next-line react-hooks/refs
  const translateX = shakeAnim.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] });

  return (
    <View style={styles.wrapper}>
      <Pressable
        testID="locked-card-placeholder"
        accessibilityRole="button"
        accessibilityLabel={caption}
        onPress={handlePress}>
        <Animated.View style={[styles.card, size, { transform: [{ translateX }] }]}>
          {/* Unvan yerine gri blok */}
          <View style={styles.titleBlock} />

          {/* 4x satır: emoji-boyutunda daire + metin bloğu (gerçek metin YOK) */}
          <View style={styles.linesBlock}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.lineRow}>
                <View style={styles.lineDot} />
                <View style={styles.lineBar} />
              </View>
            ))}
          </View>

          {/* Özet yerine kısa gri pill */}
          <View style={styles.summaryPill} />

          {/* B6/YB-2: kilit akış içinde, özet pill'i ile damga arasında (kart-yerlesimi.md çizimi);
              satır çubuklarıyla örtüşmez. */}
          <View testID="locked-card-lock" style={styles.lockCircle} pointerEvents="none">
            <ThemedText style={styles.lockIcon}>{'🔒'}</ThemedText>
          </View>

          {/* Damga yerine kısa gri blok (gerçek kartla aynı dikey dağılım) */}
          <View style={styles.stampBlock} />
        </Animated.View>
      </Pressable>
      <ThemedText type="small" style={styles.caption} testID="locked-card-caption">
        {caption}
      </ThemedText>
    </View>
  );
}

const SKELETON_COLOR = '#8E8E93';

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  card: {
    borderRadius: Spacing.two,
    backgroundColor: '#D1D1D6',
    padding: Spacing.three,
    justifyContent: 'space-between', // iskelet kartın tüm yüksekliğine dağılır
  },
  titleBlock: {
    alignSelf: 'center',
    width: '60%',
    height: 18,
    borderRadius: 4,
    backgroundColor: SKELETON_COLOR,
  },
  linesBlock: {
    gap: Spacing.two,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  lineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: SKELETON_COLOR,
  },
  lineBar: {
    flex: 1,
    height: 12,
    borderRadius: 4,
    backgroundColor: SKELETON_COLOR,
  },
  summaryPill: {
    alignSelf: 'center',
    width: '50%',
    height: 14,
    borderRadius: 8,
    backgroundColor: SKELETON_COLOR,
  },
  stampBlock: {
    alignSelf: 'center',
    width: '40%',
    height: 10,
    borderRadius: 4,
    backgroundColor: SKELETON_COLOR,
  },
  lockCircle: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFFCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 32,
  },
  caption: {
    textAlign: 'center',
  },
});

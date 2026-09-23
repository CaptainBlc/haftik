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
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export interface LockedCardPlaceholderProps {
  /** Kutunun altındaki kısa durum metni (bkz. `src/lib/week-status-copy.ts`). */
  caption: string;
  /** `WeekState.unlocked` — açık ise dokunma farklı davranır (üst katman kararı). */
  unlocked: boolean;
  onPress: () => void;
}

/** ~200x356, gerçek kartla aynı 9:16 oranında, ~%55 ölçek (bkz. `kart-yerlesimi.md`). */
const PLACEHOLDER_WIDTH = 200;
const PLACEHOLDER_HEIGHT = 356;

export function LockedCardPlaceholder({ caption, unlocked, onPress }: LockedCardPlaceholderProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current;

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
        <Animated.View style={[styles.card, { transform: [{ translateX }] }]}>
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

          <View style={styles.lockOverlay}>
            <ThemedText style={styles.lockIcon}>{'\u{1F512}'}</ThemedText>
          </View>
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
    width: PLACEHOLDER_WIDTH,
    height: PLACEHOLDER_HEIGHT,
    borderRadius: Spacing.two,
    backgroundColor: '#D1D1D6',
    padding: Spacing.three,
    gap: Spacing.three,
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
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000033',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
  },
  lockIcon: {
    fontSize: 32,
  },
  caption: {
    textAlign: 'center',
  },
});

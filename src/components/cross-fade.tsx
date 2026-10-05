/**
 * Kısa opaklık geçişi (S22; 17 §2.8: Kaydet'te etiket "Kaydedildi"ye 120 ms'de geçer). `changeKey` değişince
 * içerik 0'dan 1'e açılır; ilk çizimde animasyon yoktur. Yalnız `opacity` ve `useNativeDriver: true`: hareket
 * içermediği için azaltılmış hareket ayarında da aynen çalışır (A11Y-04'ün istediği "tek opaklık geçişi").
 *
 * `Animated.Value` `useState` ile tutulur (render sırasında ref okuma/yazma yok; React Compiler kuralları).
 * Bileşen kapanırken animasyon durdurulur: `Animated` zamanlayıcısı kapanmamış bir test ağacında Jest süreci
 * dosya bittikten sonra çökebilir (bkz. CLAUDE.md S7a tuzağı).
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated } from 'react-native';

export function CrossFade({
  changeKey,
  duration = 120,
  children,
}: {
  changeKey: string;
  duration?: number;
  children: ReactNode;
}) {
  const [opacity] = useState(() => new Animated.Value(1));
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    opacity.setValue(0);
    const animation = Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [changeKey, duration, opacity]);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

/**
 * `<Sticker>`: kesim çıkartması ilkeli (17 §2.10 adım 3, 21 §2b). Gerçek nesne dili: beyaz kesim
 * kenarı + sert, ton-içi gölge. Yapı (R-15 madde 1: yakalanan ağaçta yalnız `View`/`Text`/`Image`):
 *
 *   dış View (boyut + `transform: rotate`)         <- gölge de çıkartmayla birlikte döner
 *     ├─ gölge View (mutlak, ofsetli, `albumDeep`)  <- `elevation`/`shadow*`/`boxShadow` YOK
 *     └─ yüz View (`paper` kenarlı, dolgulu)        <- çocuklar burada
 *
 * Eğim `CARD_TILT` token'larından gelir; rastgele değer verilmez (dondurulmuş kart her açılışta aynı
 * görünür). Saf sunum: veri bilmez, kategori tonu yalnız çağıranın verdiği `faceColor` ile gelir.
 */
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { CARD_COLORS, CARD_CUT_EDGE } from './tokens';

export interface StickerProps {
  /** Derece, saat yönü pozitif. Varsayılan 0 (eğik değil). */
  tilt?: number;
  /** Sert gölge ofseti (dp); verilmezse gölge yok. */
  dropOffset?: { x: number; y: number };
  /** Beyaz kesim kenarı kalınlığı; 0 = kenarsız. */
  edge?: number;
  radius?: number;
  faceColor?: string;
  /** Dış kutunun boyutu/konumu (width, height, position, margin…). */
  style?: StyleProp<ViewStyle>;
  /** Yüz içindeki yerleşim (padding, flexDirection…). */
  faceStyle?: StyleProp<ViewStyle>;
  testID?: string;
  children?: ReactNode;
}

export function Sticker({
  tilt = 0,
  dropOffset,
  edge = CARD_CUT_EDGE,
  radius = 14,
  faceColor = CARD_COLORS.paper,
  style,
  faceStyle,
  testID,
  children,
}: StickerProps) {
  return (
    <View
      testID={testID}
      style={[tilt !== 0 && { transform: [{ rotate: `${tilt}deg` }] }, style]}>
      {dropOffset ? (
        <View
          testID={testID ? `${testID}-shadow` : undefined}
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              left: dropOffset.x,
              top: dropOffset.y,
              right: -dropOffset.x,
              bottom: -dropOffset.y,
              borderRadius: radius,
              backgroundColor: CARD_COLORS.albumDeep,
            },
          ]}
        />
      ) : null}
      <View
        testID={testID ? `${testID}-face` : undefined}
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: radius, backgroundColor: faceColor, borderWidth: edge, borderColor: CARD_COLORS.paper },
          faceStyle,
        ]}>
        {children}
      </View>
    </View>
  );
}

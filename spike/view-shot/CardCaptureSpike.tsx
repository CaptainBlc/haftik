/**
 * SPIKE — ürün kodu değil.
 *
 * plan.md S1 madde 5b: 360x640 mantıksal boyutlu sabit bir View'i, Türkçe
 * karakterler (ğ ş ı İ ö ü ç) içerecek şekilde, paketlenmiş/sistem fontuyla
 * 1080x1920 PNG'ye yakalayabiliyor muyuz sorusunu erken görmek için yazıldı.
 *
 * Not: burada gerçek bir paketlenmiş font (ör. `expo-font` ile yüklenmiş özel
 * bir .ttf) KULLANILMIYOR — yalnızca sistem fontu ile API'nin doğru
 * kurulduğunu kanıtlıyoruz. Font paketleme ve iki platformda tutarlılık
 * (react-native-view-shot + expo-font) gerçek çalışması S7a'da yapılır; bu
 * dosya S7a'da gerçek `src/card/CardView.tsx`'e taşınır ya da atılır.
 *
 * Gerçek cihaz/emülatör bu ortamda yok; bu bileşenin render ağacı
 * `__tests__/spike/CardCaptureSpike.test.tsx`'te react-test-renderer ile
 * kontrol ediliyor, gerçek PNG üretimi (native modül) mock'lanıyor.
 */
import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ViewShot, { captureRef, type ViewShotRef } from 'react-native-view-shot';

// Kart mantıksal boyutu (spec "Mimari genel bakış"): 360x640, çıktı 1080x1920 (3x).
export const CARD_LOGICAL_WIDTH = 360;
export const CARD_LOGICAL_HEIGHT = 640;
export const CARD_OUTPUT_WIDTH = 1080;
export const CARD_OUTPUT_HEIGHT = 1920;

export const CardCaptureSpike = forwardRef<ViewShotRef>(function CardCaptureSpike(_props, ref) {
  return (
    <ViewShot ref={ref} options={{ format: 'png' }}>
      <View style={styles.card}>
        <Text style={styles.text}>ğ ş ı İ ö ü ç</Text>
      </View>
    </ViewShot>
  );
});

const styles = StyleSheet.create({
  card: {
    width: CARD_LOGICAL_WIDTH,
    height: CARD_LOGICAL_HEIGHT,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 28,
    color: '#111111',
  },
});

/**
 * Kartı 1080x1920 PNG olarak yakalar. Gerçek `captureCardPng` sözleşmesi
 * (spec "API sözleşmesi") S7a'da `src/card/capture.ts`'e taşınır.
 */
export async function captureCardSpike(ref: React.RefObject<ViewShotRef | null>): Promise<string> {
  if (!ref.current) {
    throw new Error('CardCaptureSpike ref henüz bağlı değil.');
  }
  return captureRef(ref, {
    width: CARD_OUTPUT_WIDTH,
    height: CARD_OUTPUT_HEIGHT,
    format: 'png',
    quality: 1,
  });
}

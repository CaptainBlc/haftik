/**
 * R1 (21 §2b): yoğunluğa bağlı bulanıklık çaresi. `react-native-view-shot` (Android) görünümü KENDİ piksel
 * boyutunda çizip sonra `createScaledBitmap` ile 1080x1920'ye büyütür; 2,625x cihazda 945 px -> 1080 px
 * (x1,14), 2,0x cihazda 720 px -> 1080 px (x1,5) bir büyütme olur ve metin/kenar yumuşar.
 *
 * Çare: yakalanan kök, piksel olarak TAM 1080x1920 eden bir çerçevedir (`1080/PixelRatio` dp genişlik);
 * kart (360x640 dp) bu çerçevenin içinde merkez etrafında `scale = 1080 / (360 * PixelRatio)` ile
 * büyütülür. Ebeveyn `draw()` çocuğu matrisle çizdiğinden metin ve kenar hedef çözünürlükte rasterleşir
 * (K0: Android yazılım tuvali davranışı; K4: `docs/muhendislik/kart-render.md` ölçümü). Yakalama sonrası
 * ölçekleme gerekmez, çünkü çerçeve zaten hedef boyuttadır.
 *
 * Yalnız YAKALAMA örneği için kullanılır; ekrandaki `CardView` 360x640 dp kalır (`computeCardDisplayScale`).
 */
import { CARD_LOGICAL_HEIGHT, CARD_LOGICAL_WIDTH, CARD_OUTPUT_HEIGHT, CARD_OUTPUT_WIDTH } from './layout';

export interface CaptureFrame {
  /** Çerçevenin dp ölçüsü: piksel olarak tam 1080x1920 eder. */
  widthDp: number;
  heightDp: number;
  /** Kartın merkez-etrafı büyütme oranı (en-boy oranı 9:16 korunur, tek değer). */
  scale: number;
  /** Kartın çerçeve içindeki sol-üst konumu (dp), merkezi çerçeve merkeziyle çakıştırır. */
  offsetX: number;
  offsetY: number;
}

export function computeCaptureFrame(pixelRatio: number): CaptureFrame {
  if (!(pixelRatio > 0) || !Number.isFinite(pixelRatio)) {
    throw new Error(`computeCaptureFrame: geçersiz PixelRatio '${pixelRatio}'`);
  }
  const widthDp = CARD_OUTPUT_WIDTH / pixelRatio;
  const heightDp = CARD_OUTPUT_HEIGHT / pixelRatio;
  // 1080/360 == 1920/640 == 3: tek ölçek iki ekseni de doldurur.
  const scale = widthDp / CARD_LOGICAL_WIDTH;
  return {
    widthDp,
    heightDp,
    scale,
    offsetX: (widthDp - CARD_LOGICAL_WIDTH) / 2,
    offsetY: (heightDp - CARD_LOGICAL_HEIGHT) / 2,
  };
}

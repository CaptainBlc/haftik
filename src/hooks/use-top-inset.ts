import { useContext } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

/**
 * Üst güvenli alan (durum çubuğu/çentik) yüksekliği, dp. Edge-to-edge Android'de
 * içerik durum çubuğunun altına inmezse dokunuşlar yutulur (QA YB-1).
 * `useSafeAreaInsets` sağlayıcı yokken fırlatır; bu kanca bağlamı doğrudan okur
 * ve sağlayıcı yoksa (yalın birim testleri) 0 döner. Uygulamada expo-router
 * kökte `SafeAreaProvider` sağlar.
 */
export function useTopInset(): number {
  return useContext(SafeAreaInsetsContext)?.top ?? 0;
}

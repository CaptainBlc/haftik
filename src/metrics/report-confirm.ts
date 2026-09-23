/**
 * Deneme raporu paylaşım onayı (I-2, S9 SEC): paylaşım sayfasından ÖNCE
 * kullanıcıya ne gideceği söylenir; [Vazgeç] hiçbir şey yazmaz/paylaşmaz.
 * Ton tavsiyesiz: yalnızca bilgi verir. Alert dosya (`settings.tsx` deseni:
 * onay diyaloğu rotada/ince katmanda, `SettingsView` saf kalır).
 */
import { Alert } from 'react-native';

import { shareReport } from './report';

export const TRIAL_REPORT_CONFIRM_TITLE = 'Deneme raporu';
export const TRIAL_REPORT_CONFIRM_MESSAGE =
  'Paylaşılacak şey yalnızca sayaçlar ve gün sayısıdır. İçerik (emoji, kart metni), tarih ya da kimlik bilgisi yoktur. ' +
  'Raporu kime göndereceğini paylaşım sayfasında sen seçersin; kendiliğinden hiçbir yere gitmez.';

export function confirmAndShareTrialReport(getNow: () => Date): void {
  Alert.alert(TRIAL_REPORT_CONFIRM_TITLE, TRIAL_REPORT_CONFIRM_MESSAGE, [
    { text: 'Vazgeç', style: 'cancel' },
    {
      text: 'Paylaş',
      onPress: async () => {
        try {
          await shareReport(getNow());
        } catch {
          Alert.alert(
            TRIAL_REPORT_CONFIRM_TITLE,
            'Rapor paylaşılamadı. Bir süre sonra tekrar deneyebilirsin.'
          );
        }
      },
    },
  ]);
}

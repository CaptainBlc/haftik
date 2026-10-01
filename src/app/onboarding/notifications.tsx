/**
 * Ekran 1c — Bildirim izni (`docs/ux/ekran-akisi.md`, metin birebir).
 * "İzin ver" sistem izin diyaloğunu tetikler (`expo-notifications`); asıl
 * bildirim PLANLAMASI (günlük hatırlatma + Pazar kartı) `notify/` modülünün
 * işidir (`plan.md` S8, henüz yok) — bu ekran yalnızca izni ister, hiçbir
 * bildirim planlamaz. "Şimdi değil" akışı bozmaz (spec: kullanıcı Ayarlar'dan
 * sonra açabilir).
 */
import { useRouter } from 'expo-router';
import { useRef } from 'react';

import { OnboardingScreen } from '@/components/onboarding-screen';
import { getFirstOpenDate, setFirstOpenDate, setOnboardingDone } from '@/data/setting-repo';
import { toLocalDateString } from '@/domain/week';
import { getNow } from '@/lib/now';
import { requestPermissionAndSync, syncNotificationsNow } from '@/notify/wiring';

async function completeOnboarding(router: ReturnType<typeof useRouter>): Promise<void> {
  const existingFirstOpenDate = await getFirstOpenDate();
  if (!existingFirstOpenDate) {
    await setFirstOpenDate(toLocalDateString(getNow()));
  }
  await setOnboardingDone(true);
  // onboardingDone kapısı artık açık: izin varsa planı kur (yoksa no-op).
  await syncNotificationsNow();
  router.replace('/today');
}

export default function NotificationsScreen() {
  const router = useRouter();
  // Çift dokunuş korunması: akış (izin isteği + onboardingDone + yönlendirme) bir kez çalışır.
  const busy = useRef(false);

  async function handleAllow() {
    if (busy.current) {
      return;
    }
    busy.current = true;
    try {
      await requestPermissionAndSync();
    } catch {
      // İzin isteği başarısız olsa bile (ör. simülatör/izin diyaloğu yok)
      // onboarding akışı kesilmemeli — kullanıcı sonra Ayarlar'dan tekrar
      // deneyebilir (spec: "İstediğin an kapatabilirsin").
    }
    await finish();
  }

  async function finish() {
    try {
      await completeOnboarding(router);
    } catch (error) {
      busy.current = false; // yazma başarısızsa kullanıcı yeniden deneyebilsin
      throw error;
    }
  }

  async function handleNotNow() {
    if (busy.current) {
      return;
    }
    busy.current = true;
    await finish();
  }

  return (
    <OnboardingScreen
      title="Her gün hatırlatalım mı?"
      body={
        'Akşam 21:00\'de "bugünü işaretle" diye bir hatırlatma göndeririz. ' +
        'İstediğin an kapatabilirsin.'
      }
      actions={[
        { label: 'İzin ver', onPress: handleAllow, testID: 'onboarding-notifications-allow' },
        {
          label: 'Şimdi değil',
          onPress: handleNotNow,
          variant: 'secondary',
          testID: 'onboarding-notifications-skip',
        },
      ]}
    />
  );
}

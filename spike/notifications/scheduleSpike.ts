/**
 * SPIKE — ürün kodu değil.
 *
 * plan.md S1 madde 5b: "boş bir yerel bildirimi tarih tetikleyicili planla"
 * riskini erken görmek için yazıldı. Buradaki API kullanımı doğrulanınca
 * gerçek mantık (yeniden planlama kuralları, izin akışı, bildirim metinleri)
 * S8'de `src/notify/scheduler.ts` ve `src/domain/notify-plan.ts`'e taşınır;
 * bu dosyanın kendisi S8 sonunda silinir ya da arşive kaldırılır.
 *
 * Gerçek cihaz/emülatör bu ortamda mevcut değil; bu yüzden burada sadece
 * expo-notifications API'sinin doğru kurulduğunu ve derlendiğini kanıtlıyoruz
 * (bkz. `__tests__/spike/scheduleSpike.test.ts` — native modül mock'lanarak
 * çağrı şekli doğrulanıyor). Gerçek cihazda bildirim gelişi S8'de elle
 * doğrulanacak (plan.md S8 "Bitti kanıtı").
 */
import * as Notifications from 'expo-notifications';

/**
 * Uygulama ön planda iken bildirimin nasıl gösterileceğini belirler.
 * (S8'de gerçek kurallara göre genişletilecek; spike'ta yalnızca varsayılan.)
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Verilen tarihte tetiklenecek, sabit metinli (veri seviyesi taşımayan) bir
 * yerel bildirim planlar. Spec güvenlik gereksinimi 4: bildirim metinleri
 * veri seviyesi içermez — bu yüzden burada da yalnızca sabit başlık/gövde var.
 *
 * @returns planlanan bildirimin kimliği (iptal için S8'de kullanılacak)
 */
export async function scheduleDateNotificationSpike(triggerDate: Date): Promise<string> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const request = await Notifications.requestPermissionsAsync();
    if (request.status !== 'granted') {
      throw new Error('Bildirim izni verilmedi (spike: izin reddi S8 akışında ele alınacak).');
    }
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Bugünü işaretle',
      body: 'Karnen hazır olmadan önce günü kaydet.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

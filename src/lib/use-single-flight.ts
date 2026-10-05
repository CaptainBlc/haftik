/**
 * `useSingleFlight` (S22; 08 M-9): bir async eylemin aynı anda yalnızca BİR kez çalışmasını garanti eder.
 * Çift dokunuş, `setState` henüz yeniden çizilmeden ikinci `onPress`'i tetikleyebilir; bu yüzden koruma
 * state'e değil `ref`'e bağlıdır (yalnız olay işleyicisinde yazılır, render sırasında değil).
 *
 * `lockMs`: eylem BAŞARIYLA erken bitse bile, başlangıçtan itibaren bu süre dolana kadar kilit açılmaz
 * (Kaydet'te 900 ms: "Kaydedildi" anı görünsün, çift dokunuş araya girmesin; 18 §2.5). Eylem hata verirse
 * kilit hemen açılır (kullanıcı yeniden deneyebilsin). `busy`, düğmeyi pasif göstermek içindir. Bileşen
 * kapanırsa bekleyen zamanlayıcı temizlenir.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export function useSingleFlight(lockMs = 0) {
  const inFlight = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  const run = useCallback(
    async <T>(action: () => Promise<T>): Promise<{ ran: boolean; value?: T }> => {
      if (inFlight.current) {
        return { ran: false };
      }
      inFlight.current = true;
      setBusy(true);
      const startedAt = Date.now();
      const release = () => {
        inFlight.current = false;
        setBusy(false);
      };
      let value: T;
      try {
        value = await action();
      } catch (error) {
        release();
        throw error;
      }
      const wait = Math.max(0, lockMs - (Date.now() - startedAt));
      if (wait === 0) {
        release();
      } else {
        timer.current = setTimeout(release, wait);
      }
      return { ran: true, value };
    },
    [lockMs]
  );

  return { run, busy };
}

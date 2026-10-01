/**
 * Uygulama çapında kullanılan "şimdi" kaynağı (spec "Tasarım ilkeleri":
 * domain saat dışarıdan alır; bu dosya UI katmanının o saati nereden
 * aldığını tanımlar — `plan.md` S6 "`src/dev/` gizli zaman simülasyonu
 * menüsü").
 *
 * **Bilerek `src/dev/` DIŞINDA:** bu dosyanın kendisi normal ürün kodudur ve
 * her ekranın (Bugün, Hafta durumu) "şimdi"yi okumak için kullanması
 * gerekir — üretimde de. Yalnızca geliştirme derlemesinde bir override
 * ayarlanabilir (`setDevNowOverride`), ve bunu çağıran tek yer
 * `src/dev/dev-time-menu.tsx`'tir (o dosya `__DEV__` olmadan hiç
 * render/import edilmez, bkz. `src/app/_layout.tsx`). Üretimde
 * `setDevNowOverride` çağrılamaz bile (panel yok) ama yine de burada da
 * `__DEV__` koruması var — ikinci, bağımsız bir güvence katmanı.
 */
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { CARD_UNLOCK_HOUR } from '@/domain/week';

type Listener = () => void;

let overrideNow: Date | null = null;
const listeners = new Set<Listener>();

/** Gerçek `Date`, yalnızca dev derlemesinde aktif bir override varsa onu döner. */
export function getNow(): Date {
  if (__DEV__ && overrideNow) {
    return overrideNow;
  }
  return new Date();
}

/**
 * Yalnızca geliştirme derlemesinde etkilidir (`__DEV__` koruması). `null`
 * verilirse gerçek zamana döner. Dinleyicileri (bkz. `useNow`) senkron
 * olarak bilgilendirir.
 */
export function setDevNowOverride(date: Date | null): void {
  if (!__DEV__) {
    return;
  }
  overrideNow = date;
  listeners.forEach((listener) => listener());
}

/** Dev panelinin "şu an simüle mi gerçek mi" göstergesi için. */
export function isDevNowOverrideActive(): boolean {
  return __DEV__ && overrideNow !== null;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Zamanlayıcı tam sınırda uyanıp bir önceki saniyede kalmasın diye küçük tampon. */
const TICK_BUFFER_MS = 500;
const MIN_TICK_MS = 1000;

/**
 * Bir sonraki "önemli an"a kadar süre (ms): ertesi gün 00:00 (gün/hafta
 * dönümü) ve bu haftanın Pazar 20:00'i (kart açılışı) — hangisi önce ise.
 * Saniye saniye güncelleme yok; ekran açıkken yalnızca bu iki an yakalanır
 * (QA BLG-03). Yerel saat kullanır (DST'de `Date` kurucuları doğru çözer).
 */
export function msUntilNextTick(now: Date): number {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  let target = new Date(y, m, d + 1, 0, 0, 0, 0).getTime();
  const daysToSunday = (7 - now.getDay()) % 7;
  const unlock = new Date(y, m, d + daysToSunday, CARD_UNLOCK_HOUR, 0, 0, 0).getTime();
  if (unlock > now.getTime() && unlock < target) {
    target = unlock;
  }
  return Math.max(MIN_TICK_MS, target - now.getTime() + TICK_BUFFER_MS);
}

/**
 * Bileşeni "şimdi" değiştiğinde yeniden render eden hook. Güncellenme:
 * (1) dev panelinden override değişince, (2) uygulama öne gelince
 * (`AppState` 'active'), (3) gece yarısı / Pazar 20:00'de bir zamanlayıcıyla
 * (her tetiklenişte yeniden kurulur). Dev override aktifken `getNow()` aynı
 * nesneyi döndürdüğünden zamanlayıcı/öne gelme fazladan render üretmez ve dev
 * menü davranışı değişmez (zamanlayıcı süresi gerçek saate göre hesaplanır).
 */
export function useNow(): Date {
  const [value, setValue] = useState<Date>(() => getNow());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    return subscribe(() => setValue(getNow()));
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setValue(getNow());
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setValue(getNow());
      setTick((t) => t + 1);
    }, msUntilNextTick(new Date()));
    // Node/Jest'te (unmount edilmemiş test ağaçları) uzun zamanlayıcı süreci
    // açık tutmasın; React Native'de `unref` yoktur, no-op.
    (timer as unknown as { unref?: () => void }).unref?.();
    return () => clearTimeout(timer);
  }, [tick]);

  return value;
}

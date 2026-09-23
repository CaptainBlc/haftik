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

/**
 * Bileşeni, dev panelinden zaman değiştiğinde yeniden render eden hook.
 * Üretimde (override hiç değişmediğinden) pratikte hiç tetiklenmez; her
 * render'da gerçek `Date.now()`'a otomatik "tick" YAPMAZ — ekranlar zaten
 * odak/veri değişiminde yeniden render olur, saniye saniye güncellenen bir
 * saat bu ürünün kapsamında değil (basit tutuldu, bkz. görev talimatı
 * "basit bir context/store").
 */
export function useNow(): Date {
  const [value, setValue] = useState<Date>(() => getNow());

  useEffect(() => {
    return subscribe(() => setValue(getNow()));
  }, []);

  return value;
}

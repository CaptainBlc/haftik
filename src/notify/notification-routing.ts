/**
 * T3, bildirim tıklaması yönlendirmesi (`docs/inceleme-2026-09-25/
 * 21-mimari-ve-efor.md` §2f "T3, bildirim yönlendirmesi"). İki parça:
 *
 * - `resolveNotificationRoute` — saf, test edilen "sabit rota tablosu":
 *   bildirimin `data` yükünden (dış girdi sayılır, `scheduler.ts`
 *   `replaceAll`in koyduğu şekle GÜVENİLMEZ, burada yeniden doğrulanır)
 *   bir rota çıkarır.
 * - `useNotificationRouting` — ince React bağlama katmanı: soğuk açılış
 *   (`scheduler.getLastResponse()`) ve sıcak açılış
 *   (`scheduler.onResponseReceived`) için aynı çözümü kullanır, her yanıtı
 *   bir kez işler (`clearLastResponse()` ile), yönlendirmeyi router hazır
 *   olana kadar (`useRootNavigationState().key`) erteler.
 */
import { useEffect, useRef } from 'react';
import { useRootNavigationState, useRouter } from 'expo-router';

import type { NotificationKind } from '@/domain/content/notification-texts';
import { toLocalDateString } from '@/domain/week';
import { getNow } from '@/lib/now';
import { isValidWeekStartParam } from '@/lib/week-param';
import { trackCounter } from '@/metrics/track';
import { getDefaultScheduler, type NotificationScheduler } from './scheduler';

const VALID_KINDS: readonly NotificationKind[] = ['daily', 'card-ready'];

export type NotificationRoute =
  | { pathname: '/today' }
  | { pathname: '/week' }
  | { pathname: '/card/[weekStart]'; params: { weekStart: string } };

/**
 * `data`den sabit bir rota çıkarır:
 * - `kind` izin listesinde değilse (bilinmeyen/eksik) -> `/week` (güvenli varsayılan).
 * - `daily` -> `/today`.
 * - `card-ready` + geçerli `weekStart` -> `/card/<weekStart>`.
 * - `card-ready` ama `weekStart` yok/geçersiz (güncellemeden ÖNCE planlanmış
 *   bildirimlerde `weekStart` yoktu) -> `/week` (T2 banner'ı en yeni
 *   bekleyen haftayı zaten gösterir).
 */
export function resolveNotificationRoute(
  data: Record<string, unknown> | undefined,
  today: string
): NotificationRoute {
  const kind = data && typeof data.kind === 'string' ? data.kind : null;
  if (!kind || !VALID_KINDS.includes(kind as NotificationKind)) {
    return { pathname: '/week' };
  }
  if (kind === 'daily') {
    return { pathname: '/today' };
  }
  const weekStart = data?.weekStart;
  if (isValidWeekStartParam(weekStart, today)) {
    return { pathname: '/card/[weekStart]', params: { weekStart } };
  }
  return { pathname: '/week' };
}

/** `data.kind` -> `notif_opened` boyutu; bilinmeyen/eksik tür için `null` (sayılmaz). */
export function notificationOpenedDim(data: Record<string, unknown> | undefined): 'card_ready' | 'daily' | null {
  const kind = data && typeof data.kind === 'string' ? data.kind : null;
  if (kind === 'daily') return 'daily';
  if (kind === 'card-ready') return 'card_ready';
  return null;
}

/**
 * Kökte (`_layout.tsx`) bir kez çağrılır. Glue kod; gerçek davranış yalnızca
 * emülatör/cihazda (K4) doğrulanabilir — `resolveNotificationRoute` test
 * edilen kısımdır.
 *
 * **`useState` değil `useRef` kullanılır** (`react-hooks/set-state-in-effect`
 * kuralı — bkz. CLAUDE.md MOB/S6 "`loadedFor` deseni"yle aynı aile): bekleyen
 * rota ve navigasyonun hazır olup olmadığı, render'ı tetiklemesi gerekmeyen
 * iki ref'te tutulur; `navReadyRef` yalnızca bir EFEKT içinde yazılır (ref'e
 * render SIRASINDA yazmak `react-hooks/refs` kuralını ihlal eder). "Mount'ta
 * bir kez kurulan" dinleyici efekti ile "navigasyon hazır oldu" efekti
 * arasında bayatlamış durum riski yok: `useRouter()` `expo-router`'ın modül
 * seviyesi tekil nesnesini döndürür (bkz.
 * `node_modules/expo-router/build/hooks/useRouter.js`), bu yüzden mount-anı
 * kapanışındaki `router` referansı da her zaman geçerlidir.
 */
export function useNotificationRouting(overrides: { scheduler?: NotificationScheduler } = {}): void {
  const scheduler = overrides.scheduler ?? getDefaultScheduler();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const pendingRouteRef = useRef<NotificationRoute | null>(null);
  const navReadyRef = useRef(false);

  function flush() {
    if (pendingRouteRef.current && navReadyRef.current) {
      router.push(pendingRouteRef.current);
      pendingRouteRef.current = null;
    }
  }

  useEffect(() => {
    let cancelled = false;
    function handle(data: Record<string, unknown>) {
      const today = toLocalDateString(getNow());
      pendingRouteRef.current = resolveNotificationRoute(data, today);
      // S22/rapor v2: bildirimle açılış sayacı. Yalnız izin listesindeki tür sayılır (dış girdi:
      // `data` bilinmeyen/eksikse hiçbir şey yazılmaz); en iyi çaba, yönlendirmeyi etkilemez.
      const opened = notificationOpenedDim(data);
      if (opened) {
        trackCounter('notif_opened', { dim: opened }).catch(() => undefined);
      }
      // Bir kez işlenir: hemen temizlenir, aynı yanıt bir daha işlenmez
      // (ör. uygulama tekrar öne gelince). En iyi çaba, hata akışı bozmaz.
      scheduler.clearLastResponse().catch(() => undefined);
      flush();
    }

    scheduler
      .getLastResponse()
      .then((response) => {
        if (!cancelled && response) {
          handle(response.data);
        }
      })
      .catch(() => undefined);

    const subscription = scheduler.onResponseReceived((response) => handle(response.data));
    return () => {
      cancelled = true;
      subscription.remove();
    };
    // `scheduler`/`flush` bilerek dependency değil: `getDefaultScheduler()`
    // modül seviyesinde tekil örneği döner (scheduler.ts), kimliği render'lar
    // arasında zaten sabit; `flush` yalnızca stabil ref'lere ve stabil
    // `router`a dokunur (yukarıdaki not).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    navReadyRef.current = Boolean(navigationState?.key);
    flush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationState?.key]);
}

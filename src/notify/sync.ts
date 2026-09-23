/**
 * Yeniden planlama orkestratörü (`plan.md` S8). Saf enjeksiyon: repo
 * okuyucuları ve scheduler dışarıdan gelir (gerçek bağlama `wiring.ts`).
 *
 * Kapılar: `onboardingDone` false ise no-op (silme sonrası bildirim
 * dirilmesin, QA B-3); izin `granted` değilse hiçbir şey planlanmaz ve
 * izin İSTENMEZ (izin yalnızca kullanıcı akışından istenir). Tüm çağrılar
 * modül içi tek kuyrukta seri çalışır; okuma kilidin içinde yapıldığından
 * sonuç her zaman en son veriye göre kurulur.
 */
import { planNotifications } from '@/domain/notify-plan';
import type { Checkin } from '@/domain/types';
import type { NotificationScheduler, PermissionStatus } from './scheduler';

export interface NotifyState {
  checkins: Checkin[];
  settings: { reminderEnabled: boolean; reminderTime: string; onboardingDone: boolean };
  hasAnyPriorCard: boolean;
}

export interface SyncDeps {
  scheduler: NotificationScheduler;
  now: () => Date;
  readState: (now: Date) => Promise<NotifyState>;
}

export type SyncResult = { status: PermissionStatus | 'skipped' };

let chain: Promise<unknown> = Promise.resolve();

/**
 * Sync kuyruğuna (kapı + okuma + replaceAll ile aynı seri zincir) bir iş
 * ekler. "Tüm verilerimi sil" akışı bunun içinde çalışır: bekleyen/çalışan
 * bir sync silmeyle iç içe geçip bildirimleri eski ayarlarla geri kuramaz.
 */
export function runExclusiveNotify<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task);
  chain = run.catch(() => undefined);
  return run;
}

async function runSync(deps: SyncDeps): Promise<SyncResult> {
  try {
    const now = deps.now();
    const first = await deps.readState(now);
    if (!first.settings.onboardingDone) {
      // Silinmiş/onboarding'i bitmemiş: önceki iptal hata vermiş olsa bile
      // bekleyen bildirim kalmasın (en iyi çaba).
      await deps.scheduler.cancelAll().catch(() => undefined);
      return { status: 'skipped' };
    }
    const permission = await deps.scheduler.getPermission();
    if (permission !== 'granted') {
      return { status: permission };
    }
    await deps.scheduler.ensureChannel();
    // Savunma amaçlı yeniden okuma: izin/kanal beklerken veri silinmiş olabilir.
    const state = await deps.readState(now);
    if (!state.settings.onboardingDone) {
      await deps.scheduler.cancelAll().catch(() => undefined);
      return { status: 'skipped' };
    }
    const plan = planNotifications({
      now,
      checkins: state.checkins,
      settings: state.settings,
      hasAnyPriorCard: state.hasAnyPriorCard,
    });
    await deps.scheduler.replaceAll(plan);
    return { status: 'granted' };
  } catch {
    // Bildirim hatası uygulamayı bozmaz; bir sonraki açılışta düzelir. Veri loglanmaz.
    console.warn('[notify] yeniden planlama basarisiz');
    return { status: 'skipped' };
  }
}

export function syncNotifications(deps: SyncDeps): Promise<SyncResult> {
  return runExclusiveNotify(() => runSync(deps));
}

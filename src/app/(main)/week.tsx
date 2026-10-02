/**
 * Hafta durumu ekranı (Ekran 3, `docs/ux/ekran-akisi.md`) — rota katmanı.
 *
 * **S7a'da tamamlandı:** `plan.md` S6 notunun bıraktığı "kilitli kutu
 * `unlocked` iken dokunma gerçek kart açılışına GÖTÜRMEZ" kısıtı burada
 * kaldırıldı — kutuya dokunma artık gerçek kart açılış ekranına
 * (`src/app/card/[weekStart].tsx`) yönlendirir. K3 (Pazar çakışması) kontrolü
 * doğrudan orada (`openOrBuildCard` → `needsTodayCheckinBeforeCard`)
 * yapılır; bu dosya yalnızca navigasyonu tetikler.
 */
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { LoadErrorView } from '@/components/load-error-view';
import { LoadingView } from '@/components/loading-view';
import { WeekStatusView } from '@/components/week-status-view';
import { getCard, getCardWeekStarts } from '@/data/card-repo';
import { getAllCheckins, getCheckins, getCheckinsBefore } from '@/data/checkin-repo';
import type { Checkin } from '@/domain/types';
import {
  addLocalDays,
  findOpenableWeeks,
  getWeekStart,
  getWeekState,
  hasQualifiedWeekBefore,
  toLocalDateString,
} from '@/domain/week';
import { needsTodayCheckinBeforeCard } from '@/lib/card-flow';
import { computeWeekDots } from '@/lib/week-dots';
import { lockedBoxCaption, weekStatusHeadline } from '@/lib/week-status-copy';
import { useNow } from '@/lib/now';
import { trackEventOnce } from '@/metrics/track';

export default function WeekScreen() {
  const router = useRouter();
  const now = useNow();
  const weekStart = useMemo(() => getWeekStart(now), [now]);
  const weekEnd = useMemo(() => addLocalDays(weekStart, 6), [weekStart]);

  /**
   * `weekStart`e göre son yüklenen veri (bir çift `null` state yerine) —
   * `data?.weekStart !== weekStart` iken "henüz yüklenmedi" demektir.
   * Bilerek bu şekilde: `react-hooks/set-state-in-effect` kuralı, effect
   * gövdesinde async çağrıdan önce doğrudan `setState(null)` çağrılarını
   * (cascading render riski) engelliyor; bu desen o senkron sıfırlamaya
   * hiç ihtiyaç bırakmıyor (bkz. `today.tsx`'teki aynı desen).
   */
  const [data, setData] = useState<{
    weekStart: string;
    checkins: Checkin[];
    qualifiedBefore: boolean;
    hasCard: boolean;
    missedWeek: string | null;
  } | null>(null);
  // S16b (04 #7): okuma hatasında sonsuz yükleme yerine hata ekranı + yeniden deneme.
  const [attempt, setAttempt] = useState(0);
  const [failedAttempt, setFailedAttempt] = useState<number | null>(null);

  // BLG-02: sekme odağa her gelişinde yeniden yükle (Bugün'de kaydedilen
  // check-in'ler bayat kalmasın). Hafta değişince de (weekStart/weekEnd) yeniden kurulur.
  // Kritik-1 düzeltmesi (A8): `hasAnyPriorCard()` yerine check-in geçmişi
  // okunur (`getCheckinsBefore`), eşik artık kartların varlığına bağlı değil
  // (bkz. `domain/week.ts` `hasQualifiedWeekBefore` dosya başı yorumu).
  // T2, kaçırılan hafta: `getAllCheckins`/`getCardWeekStarts` + `findOpenableWeeks`
  // ile "açılmayı bekleyen" en yeni haftayı (varsa, `weekStart` hariç) bulur.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([
        getCheckins(weekStart, weekEnd),
        getCheckinsBefore(weekStart),
        getCard(weekStart),
        getAllCheckins(),
        getCardWeekStarts(),
      ]).then(([c, priorCheckins, card, allCheckins, cardWeekStarts]) => {
        if (cancelled) {
          return;
        }
        const openable = findOpenableWeeks({
          checkins: allCheckins,
          cardWeekStarts,
          now,
        }).filter((ws) => ws !== weekStart);
        setData({
          weekStart,
          checkins: c,
          qualifiedBefore: hasQualifiedWeekBefore(priorCheckins, weekStart),
          hasCard: card !== null,
          missedWeek: openable.length > 0 ? openable[openable.length - 1] : null,
        });
      }).catch(() => {
        if (!cancelled) {
          setFailedAttempt(attempt);
        }
      });
      return () => {
        cancelled = true;
      };
      // `now` bilerek dependency değil (bkz. `card/[weekStart].tsx`teki aynı
      // desen): yalnızca `weekStart`/`weekEnd` değişince veya odağa her
      // gelişte yeniden kurulur. Dahil etmek, her render'da YENİ bir `Date`
      // nesnesi dönen çağıranlarla (ör. bu ekranın testindeki `useNow` sahtesi)
      // sonsuz render döngüsüne yol açar — gerçek `useNow()` kimliği yalnızca
      // gerçek "an"larda değiştirdiğinden üründe sorun yaşanmaz.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weekStart, weekEnd, attempt])
  );

  // S9: kart bu hafta ilk kez açılabilir görüldüğünde bir kez say (hafta başına tek kayıt, DB'de dedupe).
  // Hook, erken `return`'den ÖNCE olmalı (hook sırası sabit kalsın).
  const unlockedNow =
    data !== null &&
    data.weekStart === weekStart &&
    getWeekState({
      weekStart,
      now,
      checkins: data.checkins,
      hasQualifiedWeekBefore: data.qualifiedBefore,
    }).unlocked;
  useEffect(() => {
    if (unlockedNow) {
      void trackEventOnce('card_unlocked', weekStart);
    }
  }, [unlockedNow, weekStart]);

  if (!data || data.weekStart !== weekStart) {
    if (failedAttempt === attempt) {
      return <LoadErrorView onRetry={() => setAttempt((a) => a + 1)} />;
    }
    return <LoadingView />;
  }

  const { checkins, qualifiedBefore, hasCard, missedWeek } = data;
  const weekState = getWeekState({
    weekStart,
    now,
    checkins,
    hasQualifiedWeekBefore: qualifiedBefore,
  });
  const today = toLocalDateString(now);
  const dots = computeWeekDots(weekStart, checkins, today);
  const needsTodayCheckin = needsTodayCheckinBeforeCard({ weekStart, today, checkins });

  function handleLockedPress() {
    // Kritik-1 güvenlik ağı: kart zaten varsa (ör. eski bir uygulama
    // sürümünde farklı hesaplanmış olabilir) gezinme hiçbir zaman
    // `weekState.unlocked`e bağlı kalmaz — kullanıcı kendi açılmış kartına
    // asla erişemez duruma düşmemeli.
    if (!weekState.unlocked && !hasCard) {
      // Kilitliyken dokunma: hiçbir şey açılmaz (spec/ekran-akisi.md);
      // görsel "shake" geri bildirimi `LockedCardPlaceholder` içinde.
      return;
    }
    router.push({ pathname: '/card/[weekStart]', params: { weekStart } });
  }

  function handleMissedWeekPress() {
    if (!missedWeek) {
      return;
    }
    // T2: normal reveal (18-ux-akisi.md §2.7 — K3 burada uygulanmaz,
    // Pazartesi'de bugün ≠ Pazar). Uygunluk `openOrBuildCard` içinde
    // kendisi yeniden doğrulanır (card/[weekStart].tsx), bu yalnızca navigasyon.
    router.push({ pathname: '/card/[weekStart]', params: { weekStart: missedWeek } });
  }

  return (
    <WeekStatusView
      dots={dots}
      headline={weekStatusHeadline(weekState, hasCard)}
      caption={lockedBoxCaption(weekState, needsTodayCheckin, hasCard)}
      unlocked={weekState.unlocked}
      onLockedPress={handleLockedPress}
      missedWeek={missedWeek}
      onMissedWeekPress={handleMissedWeekPress}
    />
  );
}

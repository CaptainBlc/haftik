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

import { LoadingView } from '@/components/loading-view';
import { WeekStatusView } from '@/components/week-status-view';
import { getCard } from '@/data/card-repo';
import { getCheckins, getCheckinsBefore } from '@/data/checkin-repo';
import type { Checkin } from '@/domain/types';
import {
  addLocalDays,
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
  } | null>(null);

  // BLG-02: sekme odağa her gelişinde yeniden yükle (Bugün'de kaydedilen
  // check-in'ler bayat kalmasın). Hafta değişince de (weekStart/weekEnd) yeniden kurulur.
  // Kritik-1 düzeltmesi (A8): `hasAnyPriorCard()` yerine check-in geçmişi
  // okunur (`getCheckinsBefore`), eşik artık kartların varlığına bağlı değil
  // (bkz. `domain/week.ts` `hasQualifiedWeekBefore` dosya başı yorumu).
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([
        getCheckins(weekStart, weekEnd),
        getCheckinsBefore(weekStart),
        getCard(weekStart),
      ]).then(([c, priorCheckins, card]) => {
        if (cancelled) {
          return;
        }
        setData({
          weekStart,
          checkins: c,
          qualifiedBefore: hasQualifiedWeekBefore(priorCheckins, weekStart),
          hasCard: card !== null,
        });
      });
      return () => {
        cancelled = true;
      };
    }, [weekStart, weekEnd])
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
    return <LoadingView />;
  }

  const { checkins, qualifiedBefore, hasCard } = data;
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

  return (
    <WeekStatusView
      dots={dots}
      headline={weekStatusHeadline(weekState, hasCard)}
      caption={lockedBoxCaption(weekState, needsTodayCheckin, hasCard)}
      unlocked={weekState.unlocked}
      onLockedPress={handleLockedPress}
    />
  );
}

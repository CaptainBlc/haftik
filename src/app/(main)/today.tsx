/**
 * Bugün ekranı (Ekran 2, `docs/ux/ekran-akisi.md`) — rota katmanı. Veri ve
 * zamanı çekip sunum bileşenine (`CheckinForm`) props olarak geçirir.
 *
 * **K3 "Kaydet sonrası otomatik devam" (`docs/ux/pazar-akisi.md`):** bu
 * ekran `returnToCardWeekStart` query param'ıyla (kart açılış ekranının
 * "Bugünü de ekleyelim" ara ekranından, bkz. `src/app/card/[weekStart].tsx`)
 * tetiklenmişse, Kaydet başarılı olduğunda normal davranışına EK olarak
 * doğrudan o haftanın kart açılış ekranına geri döner — ekstra bir "şimdi
 * kartı aç" dokunuşu istenmez (pazar-akisi.md: "Kaydet'ten sonra ayrı bir
 * tıklama istemek, çözülmüş bir sorunu tekrar kullanıcıya sormak olur").
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { CheckinForm } from '@/components/checkin-form';
import { LoadErrorView } from '@/components/load-error-view';
import { LoadingView } from '@/components/loading-view';
import { getCheckins, saveCheckin } from '@/data/checkin-repo';
import type { Category, CategoryValue } from '@/domain/types';
import { addLocalDays, toLocalDateString } from '@/domain/week';
import {
  checkinToSelection,
  isSelectionComplete,
  selectionToCheckin,
  type CategorySelection,
} from '@/lib/checkin-form';
import { formatTurkishDateLabel } from '@/lib/date-format';
import { useNow } from '@/lib/now';
import { isValidWeekStartParam } from '@/lib/week-param';
import { trackEvent } from '@/metrics/track';
import { dismissDailyNotification, syncNotificationsNow } from '@/notify/wiring';

export default function TodayScreen() {
  const router = useRouter();
  const { returnToCardWeekStart } = useLocalSearchParams<{ returnToCardWeekStart?: string }>();
  const now = useNow();
  const today = useMemo(() => toLocalDateString(now), [now]);
  /**
   * 0 = bugün, 1 = dün (spec: düzenleme penceresi yalnızca bugün/dün). Seçim,
   * seçildiği "bugün"e bağlı tutulur: gün değişince (BLG-03) otomatik bugüne
   * döner, eski güne göre "dün" kalmaz.
   */
  const [offsetState, setOffsetState] = useState<{ day: string; offset: 0 | 1 }>({
    day: '',
    offset: 0,
  });
  const dayOffset: 0 | 1 = offsetState.day === today ? offsetState.offset : 0;
  const setDayOffset = (offset: 0 | 1) => setOffsetState({ day: today, offset });
  const selectedDate = useMemo(() => addLocalDays(today, -dayOffset), [today, dayOffset]);

  const [selection, setSelection] = useState<CategorySelection>({});
  /**
   * Hangi tarih için veri yüklendiğini tutar (bir `loaded: boolean` yerine)
   * — `loadedFor !== selectedDate` iken "henüz yüklenmedi" anlamına gelir.
   * Bilerek bu şekilde: `react-hooks/set-state-in-effect` kuralı, effect
   * gövdesinde async çağrıdan ÖNCE doğrudan bir `setState(false)` çağrısını
   * (cascading render riski) engelliyor; bu desen o senkron sıfırlama
   * çağrısına hiç ihtiyaç bırakmıyor.
   */
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // S16b (04 #7): okuma hatasında sonsuz yükleme yerine hata ekranı + yeniden deneme.
  const [attempt, setAttempt] = useState(0);
  const [failedAttempt, setFailedAttempt] = useState<number | null>(null);
  const loaded = loadedFor === selectedDate;

  useEffect(() => {
    let cancelled = false;
    getCheckins(selectedDate, selectedDate)
      .then((rows) => {
        if (cancelled) {
          return;
        }
        setSelection(checkinToSelection(rows[0] ?? null));
        setLoadedFor(selectedDate);
      })
      .catch(() => {
        if (!cancelled) {
          setFailedAttempt(attempt);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate, attempt]);

  function handleSelect(category: Category, value: CategoryValue) {
    setSelection((prev) => ({ ...prev, [category]: value }));
  }

  async function handleSave() {
    if (!isSelectionComplete(selection)) {
      return;
    }
    setSaving(true);
    try {
      await saveCheckin(selectionToCheckin(selectedDate, selection));
      void trackEvent('check_in_saved'); // S9: en iyi çaba, akışı bozmaz
      // Bugünkü hatırlatmayı iptal / kart eşiğini yeniden değerlendir (S8).
      void syncNotificationsNow();
      // 22 §4.4: teslim edilmiş olsa bile o günün hatırlatması gölgede kalmasın.
      void dismissDailyNotification(selectedDate);
      if (isValidWeekStartParam(returnToCardWeekStart, today)) {
        router.replace({ pathname: '/card/[weekStart]', params: { weekStart: returnToCardWeekStart } });
      }
    } catch {
      // S16b (04 #7): kayıt hatası sessiz kalmasın; seçim ekranda korunur, tekrar denenebilir.
      Alert.alert('Kaydedilemedi', 'Bugünün kaydı yapılamadı. Lütfen tekrar dene.');
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    if (failedAttempt === attempt) {
      return <LoadErrorView onRetry={() => setAttempt((a) => a + 1)} />;
    }
    return <LoadingView />;
  }

  return (
    <CheckinForm
      dateLabel={formatTurkishDateLabel(selectedDate)}
      canGoToYesterday={dayOffset === 0}
      canGoToToday={dayOffset === 1}
      onGoToYesterday={() => setDayOffset(1)}
      onGoToToday={() => setDayOffset(0)}
      selection={selection}
      onSelect={handleSelect}
      onSave={handleSave}
      disabledExtra={saving}
    />
  );
}

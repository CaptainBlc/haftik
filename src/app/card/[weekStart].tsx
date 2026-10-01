/**
 * Kart açılış ekranı (Ekran 4, `docs/ux/ekran-akisi.md`; Pazar çakışması
 * K3 için `docs/ux/pazar-akisi.md`) — rota katmanı. Hafta durumu ekranındaki
 * kilitli kart kutusuna (`unlocked === true` iken) dokununca buraya gelinir.
 *
 * **Ekran 4 → Ekran 5 geçişi (S7b):** ayrı bir rota AÇILMAZ — bu ekran,
 * `mode` (`'reveal' | 'preview'`) yerel state'iyle Ekran 4 (`CardRevealView`)
 * ile Ekran 5'i (`CardPreviewView`) sırayla gösterir. Ayrı bir dinamik rota
 * (`card/[weekStart]/preview`) yerine bu tercih edildi: her iki ekran da
 * aynı `CardSnapshot`'ı kullanır, ayrı bir rotaya geçmek `weekStart`i tekrar
 * parse edip `openOrBuildCard`i tekrar (gereksiz) tetikleme riski taşırdı.
 * Paylaşım tamamlanınca (`onShared`) Ekran 6 kuralı gereği (`ekran-akisi.md`:
 * "kullanıcı doğrudan Ekran 4'e ... geri döner, 'Paylaş' hâlâ görünür")
 * `mode` yeniden `'reveal'`e döner — ayrı bir "teşekkürler" ekranı yok.
 */
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { CardRevealView } from '@/card/CardRevealView';
import { useCardFonts } from '@/card/fonts';
import { openOrBuildCard, type OpenCardResult } from '@/card/open-card';
import { CardPreviewView } from '@/components/card-preview-view';
import { LoadingView } from '@/components/loading-view';
import { SundayCheckinRequiredView } from '@/components/sunday-checkin-required-view';
import { toLocalDateString } from '@/domain/week';
import { useNow } from '@/lib/now';
import { isValidWeekStartParam } from '@/lib/week-param';
import { trackEvent } from '@/metrics/track';
import { dismissCardNotification, syncNotificationsNow } from '@/notify/wiring';

export default function CardScreen() {
  const { weekStart } = useLocalSearchParams<{ weekStart: string }>();
  const router = useRouter();
  const now = useNow();
  const [fontsLoaded] = useCardFonts();

  /**
   * `weekStart`e göre son yüklenen sonuç (bir çift `null` state yerine) —
   * aynı desenin `week.tsx`/`today.tsx`teki gerekçesi burada da geçerli
   * (`react-hooks/set-state-in-effect`, cascading render riskinden kaçınma).
   */
  const [result, setResult] = useState<{ forWeekStart: string; value: OpenCardResult } | null>(
    null
  );
  const [mode, setMode] = useState<'reveal' | 'preview'>('reveal');

  const validWeekStart = isValidWeekStartParam(weekStart, toLocalDateString(now));

  useEffect(() => {
    if (!validWeekStart || !weekStart) {
      return;
    }
    const today = toLocalDateString(now);
    let cancelled = false;
    openOrBuildCard(weekStart, today, now).then((value) => {
      if (cancelled) {
        return;
      }
      setResult({ forWeekStart: weekStart, value });
      if (value.status === 'ready') {
        void trackEvent('card_opened', weekStart); // S9: en iyi çaba
        // (2026-10-01 güncellendi) Kart artık eşiği (hasQualifiedWeekBefore,
        // bkz. Kritik-1/A8) DEĞİŞTİRMEZ -- check-in geçmişine bakar, kart
        // varlığına değil. Yine de yeniden planlanır: kullanıcı kartı
        // Doze/pil gecikmesi yüzünden bildirim gelmeden önce manuel açtıysa,
        // artık gereksiz kalan "kart hazır" bildirimi kuyruktan düşsün diye
        // (replaceAll idempotent, `planNotifications` geçmiş fireAt'leri zaten elemez).
        void syncNotificationsNow();
        // 22 §4.4: kart artık açıldı, o haftanın card-ready bildirimi
        // teslim edilmiş olsa bile gölgede kalmasın.
        void dismissCardNotification(weekStart);
      }
    });
    return () => {
      cancelled = true;
    };
    // `now` bilerek dependency değil: bu ekran açıldıktan sonra (ör. dev
    // zaman menüsünden) `now` değişse bile aynı hafta için tekrar
    // build/getCard tetiklenmesin — yalnızca `weekStart` değişince yeniden
    // değerlendirilir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  if (!validWeekStart) {
    // Dış kaynaklı (deep link) geçersiz/ileri tarihli parametre: kart yazılmaz.
    return <Redirect href="/week" />;
  }

  if (!weekStart || !fontsLoaded || !result || result.forWeekStart !== weekStart) {
    return <LoadingView />;
  }

  if (result.value.status === 'notReady') {
    // Deep link ile uygun olmayan hafta (I-1): kart üretilmez/sayılmaz, hafta ekranına.
    return <Redirect href="/week" />;
  }

  if (result.value.status === 'needsTodayCheckin') {
    return (
      <SundayCheckinRequiredView
        onMarkToday={() =>
          router.push({ pathname: '/today', params: { returnToCardWeekStart: weekStart } })
        }
        onBack={() => router.back()}
      />
    );
  }

  if (mode === 'preview') {
    return (
      <CardPreviewView
        snapshot={result.value.card}
        onBack={() => setMode('reveal')}
        onShared={() => setMode('reveal')}
      />
    );
  }

  return (
    <CardRevealView
      snapshot={result.value.card}
      // BLG-06: çıkış her zaman Hafta ekranına; `back()` yığında kalan "Bugünü
      // işaretle" ara ekranına düşerdi (ara ekran yalnızca ilk açma girişiminde).
      onClose={() => router.dismissTo('/week')}
      onShare={() => setMode('preview')}
    />
  );
}

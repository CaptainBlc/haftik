/**
 * Zaman simülasyon menüsü (`plan.md` S6: "`src/dev/` gizli zaman simülasyonu
 * menüsü; yalnızca geliştirme derlemesinde"). Bu dosya ürün kodu DEĞİLDİR,
 * bir geliştirici aracıdır — cihaz/emülatör olmadan "Pazar 20:00'e
 * ilerlet" gibi senaryoları kod seviyesinde test edebilmek için.
 *
 * **Bu dosya yalnızca `src/app/_layout.tsx`'te `__DEV__` korumalı bir
 * `require()` ile (statik `import` DEĞİL) yüklenir** — bkz. o dosyadaki not.
 * Üretim derlemesinde render edilmediğinin/bulunmadığının nihai doğrulaması
 * S10'un işidir (`plan.md` S6 notu); bu dosya kendi başına yalnızca çalışma
 * zamanı `__DEV__` korumasını taşır (ikinci, bağımsız güvence katmanı,
 * `src/lib/now.ts`'teki `setDevNowOverride` korumasıyla aynı desende).
 */
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { addDays, addHours, currentWeekSunday2000 } from '@/dev/dev-time-helpers';
import { getNow, isDevNowOverrideActive, setDevNowOverride, useNow } from '@/lib/now';

function formatDisplay(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const weekday = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][date.getDay()];
  return `${weekday} ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function DevTimeMenu() {
  const [open, setOpen] = useState(false);
  const now = useNow();

  if (!__DEV__) {
    // İkinci güvence: bu bileşen yanlışlıkla üretime sızsa bile hiçbir şey
    // render etmez (bkz. dosya başı notu).
    return null;
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Zaman simülasyonu (yalnızca geliştirme)"
        testID="dev-time-menu-fab"
        onPress={() => setOpen(true)}
        style={styles.fab}>
        <ThemedText style={styles.fabLabel}>{'\u{1F552}'}</ThemedText>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.panel}>
            <ThemedText type="smallBold" style={styles.panelText}>
              Zaman simülasyonu (yalnızca geliştirme)
            </ThemedText>
            <ThemedText type="small" style={styles.panelText} testID="dev-time-menu-current">
              {formatDisplay(now)} {isDevNowOverrideActive() ? '(simüle)' : '(gerçek)'}
            </ThemedText>

            <Pressable
              testID="dev-time-menu-plus-1-day"
              style={styles.action}
              onPress={() => setDevNowOverride(addDays(getNow(), 1))}>
              <ThemedText style={styles.panelText}>+1 gün</ThemedText>
            </Pressable>

            <Pressable
              testID="dev-time-menu-plus-1-hour"
              style={styles.action}
              onPress={() => setDevNowOverride(addHours(getNow(), 1))}>
              <ThemedText style={styles.panelText}>+1 saat</ThemedText>
            </Pressable>

            <Pressable
              testID="dev-time-menu-sunday-2000"
              style={styles.action}
              onPress={() => setDevNowOverride(currentWeekSunday2000(getNow()))}>
              <ThemedText style={styles.panelText}>Bu haftanın Pazar 20:00&apos;ine ilerlet</ThemedText>
            </Pressable>

            <Pressable
              testID="dev-time-menu-plus-1-week"
              style={styles.action}
              onPress={() => setDevNowOverride(addDays(getNow(), 7))}>
              <ThemedText style={styles.panelText}>+1 hafta</ThemedText>
            </Pressable>

            <Pressable
              testID="dev-time-menu-reset"
              style={styles.action}
              onPress={() => setDevNowOverride(null)}>
              <ThemedText style={styles.panelText}>Gerçek zamana dön</ThemedText>
            </Pressable>

            <Pressable
              testID="dev-time-menu-close"
              style={[styles.action, styles.closeAction]}
              onPress={() => setOpen(false)}>
              <ThemedText type="smallBold" style={styles.panelText}>
                Kapat
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00000099',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  fabLabel: {
    fontSize: 20,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    width: '85%',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  action: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#2c2c2e',
  },
  closeAction: {
    backgroundColor: '#3a3a3c',
  },
  panelText: {
    color: '#ffffff',
  },
});

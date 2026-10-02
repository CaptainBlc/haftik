/**
 * Deneme raporu önizlemesi (S16b, 27 §4.1): kullanıcı paylaşmadan ÖNCE raporun
 * TAM metnini görür ([Vazgeç] hiçbir şey yazmaz/paylaşmaz). Metin seçilebilir.
 * Modal olarak Ayarlar ekranından açılır (ayrı bir rota/deep link yüzeyi YOK).
 * Sunum bileşeni: veri/paylaşım rota katmanındadır (`src/app/(main)/settings.tsx`).
 */
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTopInset } from '@/hooks/use-top-inset';

export const REPORT_PREVIEW_INTRO =
  'Paylaşılacak şey yalnızca sayaçlar ve gün sayısıdır. İçerik (emoji, kart metni), tarih ya da kimlik bilgisi yoktur. ' +
  'Raporu kime göndereceğini paylaşım sayfasında sen seçersin; kendiliğinden hiçbir yere gitmez.';

export interface ReportPreviewViewProps {
  visible: boolean;
  text: string;
  sharing: boolean;
  error: string | null;
  onCancel: () => void;
  onShare: () => void;
}

export function ReportPreviewView({
  visible,
  text,
  sharing,
  error,
  onCancel,
  onShare,
}: ReportPreviewViewProps) {
  const theme = useTheme();
  const topInset = useTopInset();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <ThemedView style={[styles.flex, { paddingTop: topInset }]}>
        <ScrollView testID="report-preview-scroll" contentContainerStyle={styles.container}>
          <ThemedText type="subtitle">Deneme raporu</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" testID="report-preview-intro">
            {REPORT_PREVIEW_INTRO}
          </ThemedText>
          <ThemedText testID="report-preview-text" type="small" selectable style={styles.reportText}>
            {text}
          </ThemedText>
          {error ? (
            <ThemedText testID="report-preview-error" themeColor="textSecondary">
              {error}
            </ThemedText>
          ) : null}
        </ScrollView>
        <View style={styles.actions}>
          <Pressable
            testID="report-preview-cancel"
            accessibilityRole="button"
            onPress={onCancel}
            style={[styles.button, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold">Vazgeç</ThemedText>
          </Pressable>
          <Pressable
            testID="report-preview-share"
            accessibilityRole="button"
            accessibilityState={{ disabled: sharing }}
            disabled={sharing}
            onPress={onShare}
            style={[styles.button, { backgroundColor: theme.text, opacity: sharing ? 0.6 : 1 }]}>
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              {sharing ? 'Hazırlanıyor…' : 'Paylaş'}
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: Spacing.four, gap: Spacing.three },
  reportText: { fontVariant: ['tabular-nums'] },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

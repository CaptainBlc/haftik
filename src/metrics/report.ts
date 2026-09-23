/**
 * Deneme raporu (spec E3/E1 Seçenek A, `plan.md` S9). KULLANICI TETİKLİ:
 * yalnızca ayarlardaki düğme çağırır; otomatik gönderim ve ağ çağrısı YOK.
 * Rapor, sistem paylaşım sayfasıyla kullanıcının seçtiği yere gider.
 *
 * **İçerik sınırı:** yalnızca sayaçlar + gün sayıları (kurulumdan bu yana
 * kaçıncı gün, dolu gün sayısı). Emoji, kart metni, kategori adı, takvim
 * tarihi, epoch zamanı, cihaz/kullanıcı kimliği YOK — rapor içerik/kimlik taşımaz
 * (yine de gönderen, rapora ekleyeceği mesajla ya da tanıdık bir grupta kendi
 * adıyla/takma adıyla birleştirilebilir; "anonim" değildir). Test:
 * `__tests__/metrics/report.test.ts` yasak desen taraması.
 *
 * **Geçici dosya:** paylaşım için önbelleğe yazılır, paylaşım tamamlanınca
 * (iptal dahil) en iyi çabayla silinir (`src/card/share.ts` ile aynı politika).
 * `expo-file-system/legacy` ve `expo-sharing` yalnızca yerel OS API'leridir,
 * ağ isteği yapmaz.
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { getCheckins } from '@/data/checkin-repo';
import { getAllEvents } from '@/data/metric-repo';
import { getFirstOpenDate } from '@/data/setting-repo';
import { computeDeviceMetrics, type DeviceMetrics } from '@/domain/metrics-calc';
import { toLocalDateString } from '@/domain/week';

import { getReportFileUri } from './report-file';

export const REPORT_SCHEMA_VERSION = 1;

/** Rapor metninde yazan bilinen sınırlar (spec E1). */
export const REPORT_KNOWN_LIMITS: readonly string[] = [
  'Paylaşım sayacı "paylaşım sayfası açıldı" anını sayar; kullanıcı sayfayı kapatsa da sayılır, yani paylaşım FAZLA sayılır.',
  'Ekran görüntüsüyle yapılan paylaşımlar uygulamadan görünmez, yani paylaşım EKSİK sayılır.',
  'Örneklem küçük (20-30 kişi); oranlar kesin doğrulama değil, yalnızca güçlü sinyal olarak okunmalı.',
];

export interface ReportPayload {
  schemaVersion: number;
  dayNumber: number | null;
  filledDays: number;
  d7: DeviceMetrics['d7'];
  counts: DeviceMetrics['counts'];
  cardSeen: boolean;
  sharedGivenSeen: boolean | null;
}

export function buildReportPayload(metrics: DeviceMetrics): ReportPayload {
  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    dayNumber: metrics.dayNumber,
    filledDays: metrics.filledDays,
    d7: metrics.d7,
    counts: { ...metrics.counts },
    cardSeen: metrics.cardSeen,
    sharedGivenSeen: metrics.sharedGivenSeen,
  };
}

const D7_TEXT: Record<DeviceMetrics['d7'], string> = {
  yes: 'var',
  no: 'yok',
  pending: 'henüz ölçülemez (7. gün gelmedi/bitmedi)',
  unknown: 'bilinmiyor',
};

/** Düz metin + makine okunur JSON (aynı dosyada). */
export function formatReportText(payload: ReportPayload): string {
  const c = payload.counts;
  const lines = [
    'Haftik - deneme raporu',
    '',
    `Kurulumdan bu yana gün: ${payload.dayNumber ?? 'bilinmiyor'}`,
    `Dolu check-in günü: ${payload.filledDays}`,
    `7. günde check-in: ${D7_TEXT[payload.d7]}`,
    `Kart açıldı mı: ${payload.cardSeen ? 'evet' : 'hayır (kartı hiç görmedi)'}`,
    `Kartı gördükten sonra paylaşım başlattı mı: ${
      payload.sharedGivenSeen === null ? 'ölçülemez (kartı görmedi)' : payload.sharedGivenSeen ? 'evet' : 'hayır'
    }`,
    '',
    `Sayaçlar: check_in_saved=${c.check_in_saved}, card_unlocked=${c.card_unlocked}, card_opened=${c.card_opened}, share_initiated=${c.share_initiated}, line_hidden=${c.line_hidden}`,
    '',
    'Bilinen sınırlar:',
    ...REPORT_KNOWN_LIMITS.map((l) => `- ${l}`),
    '',
    'Bu rapor yalnızca sayaç özeti içerir; içerik, kimlik ve tarih yoktur.',
    '',
    JSON.stringify(payload),
  ];
  return lines.join('\n');
}

/** Yerel veriden bu cihazın metriklerini hesaplar (yalnızca okuma). */
export async function collectDeviceMetrics(now: Date): Promise<DeviceMetrics> {
  const [events, firstOpenDate, checkins] = await Promise.all([
    getAllEvents(),
    getFirstOpenDate(),
    getCheckins('0000-01-01', '9999-12-31'),
  ]);
  return computeDeviceMetrics({
    events,
    firstOpenDate,
    checkinDates: checkins.map((c) => c.localDate),
    today: toLocalDateString(now),
  });
}

export async function buildReportText(now: Date): Promise<string> {
  return formatReportText(buildReportPayload(await collectDeviceMetrics(now)));
}

/** Kullanıcı tetikli: raporu geçici dosyaya yazar, sistem paylaşım sayfasını açar, sonra siler. */
export async function shareReport(now: Date): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('shareReport: bu cihazda paylaşım kullanılamıyor.');
  }
  const uri = getReportFileUri(); // önbellek yoksa hata: paylaşmadan çık
  const text = await buildReportText(now);
  await FileSystem.writeAsStringAsync(uri, text);
  try {
    await Sharing.shareAsync(uri, {
      mimeType: 'text/plain',
      dialogTitle: 'Deneme raporu',
    });
  } finally {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {
      // en iyi çaba temizlik
    }
  }
}

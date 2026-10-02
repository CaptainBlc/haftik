/**
 * Deneme raporu v2 (spec E3/E1 Seçenek A, `plan.md` S9; S16b'de v2'ye geçti,
 * şema ve sapmalar `src/domain/report-v2.ts` başlığında). KULLANICI TETİKLİ:
 * yalnızca ayarlardaki düğme çağırır, tam metin ÖNİZLEME ekranında gösterilir
 * (`components/report-preview-view.tsx`), kullanıcı [Paylaş] derse gider;
 * otomatik gönderim ve ağ çağrısı YOK. Rapor, sistem paylaşım sayfasıyla
 * kullanıcının seçtiği yere gider.
 *
 * **İçerik sınırı:** yalnızca sayaçlar + gün sayıları + haftanın SIRA numarası.
 * Emoji, kart metni, kategori adı, takvim tarihi, epoch zamanı, cihaz/kullanıcı
 * kimliği YOK — rapor içerik/kimlik taşımaz (yine de gönderen, rapora ekleyeceği
 * mesajla ya da tanıdık bir grupta kendi adıyla/takma adıyla birleştirilebilir;
 * "anonim" değildir). `seq` yerel artan bir sayaçtır (aynı cihazın kopyalarını
 * ayırır, kimlik değildir). Test: `__tests__/metrics/report.test.ts` yasak desen taraması.
 *
 * **Geçici dosya:** adanmış `haftik-share/` dizinine yazılır, paylaşım sonrası
 * SİLİNMEZ (hedef uygulama okuyor olabilir, 04 #4); açılışta/"Tüm verilerimi
 * sil"de temizlenir. `expo-file-system/legacy` ve `expo-sharing` yalnızca yerel
 * OS API'leridir, ağ isteği yapmaz.
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { ensureShareDir } from '@/card/share-dir';
import { getCardWeekStarts } from '@/data/card-repo';
import { getAllCheckins } from '@/data/checkin-repo';
import { getAllEvents } from '@/data/metric-repo';
import { getFirstOpenDate, getReportSeq, setReportSeq } from '@/data/setting-repo';
import {
  buildReportV2,
  REPORT_V2_VERSION,
  validateReportV2,
  type ReportPerm,
  type ReportV2,
} from '@/domain/report-v2';
import { getBuildInfo } from '@/lib/build-info';
import { getNotificationPermissionState } from '@/notify/wiring';

import { getReportFileUri } from './report-file';

export const REPORT_SCHEMA_VERSION = REPORT_V2_VERSION;

/** Rapor metninde yazan bilinen sınırlar (spec E1; S16b'de 27 §4.1 ile genişledi). */
export const REPORT_KNOWN_LIMITS: readonly string[] = [
  'Paylaşım sayacı "paylaşım sayfası açıldı" anını sayar; kullanıcı sayfayı kapatsa da sayılır, yani paylaşım FAZLA sayılır.',
  'Ekran görüntüsüyle yapılan paylaşımlar uygulamadan görünmez, yani paylaşım EKSİK sayılır.',
  'Örneklem küçük (20-30 kişi); oranlar kesin doğrulama değil, yalnızca güçlü sinyal olarak okunmalı.',
  'Raporu göndermeyen cihazlar görünmez; farklı build/kanallar ayrı okunmalı.',
  '7. gün "henüz ölçülemez" ise o cihaz D7 paydasına girmez.',
];

const D7_TEXT: Record<ReportV2['d']['d7'], string> = {
  yes: 'var',
  no: 'yok',
  pending: 'henüz ölçülemez (7. gün gelmedi/bitmedi)',
  unknown: 'bilinmiyor',
};

const PERM_TEXT: Record<ReportPerm, string> = {
  granted: 'verildi',
  denied: 'reddedildi',
  unset: 'sorulmadı/belirsiz',
};

/** Düz metin + makine okunur tek satır JSON (aynı dosyada). */
export function formatReportText(report: ReportV2): string {
  const lines = [
    'Haftik - deneme raporu (v2)',
    '',
    `Build: ${report.build} (${report.ch}), rapor no: ${report.seq}`,
    `Kurulumdan bu yana gün: ${report.day ?? 'bilinmiyor'}`,
    `İlk 3 günde işaretleme (1 var, 0 yok, - gelmedi): ${report.d.d1d3 ?? 'bilinmiyor'}`,
    `7. günde işaretleme: ${D7_TEXT[report.d.d7]}`,
    `Bildirim izni: ${PERM_TEXT[report.perm]}`,
    `Kart: ${report.cards.frozen} açıldı, ${report.cards.eligibleWeeks} hafta uygun` +
      (report.d.firstCardDay === null ? ' (kart henüz açılmadı)' : `, ilk kart ${report.d.firstCardDay}. günde`),
    `Paylaşım başlatma: ${report.share.n}, gizlenen satır: ${report.share.hiddenTotal}`,
    '',
    'Haftalar (sıra no, dolu gün, kart açıldı mı, paylaşım):',
    ...(report.weeks.length === 0
      ? ['- yok']
      : report.weeks.map((w) => `- ${w.i}: dolu ${w.fill}, açıldı ${w.opened ? 'evet' : 'hayır'}, paylaşım ${w.share}`)),
    '',
    'Bilinen sınırlar:',
    ...REPORT_KNOWN_LIMITS.map((l) => `- ${l}`),
    '',
    'Bu rapor yalnızca sayaç özeti içerir; içerik, kimlik ve tarih yoktur.',
    '',
    JSON.stringify(report),
  ];
  return lines.join('\n');
}

export interface PreparedReport {
  report: ReportV2;
  text: string;
  /** Bütünlük kuralı ihlalleri (27 §4.2); boş = tutarlı. */
  violations: string[];
}

function toPerm(state: { granted: boolean; canAskAgain: boolean }): ReportPerm {
  if (state.granted) return 'granted';
  // Android 13+ hiç sorulmamış izni `denied` + `canAskAgain:true` döndürür (BLG-01): belirsiz.
  return state.canAskAgain ? 'unset' : 'denied';
}

/** Yerel veriden raporu kurar (yalnızca okuma; `seq` ÖNİZLEME için bir sonraki sayıdır, yazılmaz). */
export async function prepareReport(now: Date): Promise<PreparedReport> {
  const [events, firstOpenDate, checkins, cardWeekStarts, permState, lastSeq] = await Promise.all([
    getAllEvents(),
    getFirstOpenDate(),
    getAllCheckins(),
    getCardWeekStarts(),
    getNotificationPermissionState(),
    getReportSeq(),
  ]);
  const info = getBuildInfo();
  const report = buildReportV2({
    now,
    build: `${info.version}+${info.build}`,
    channel: info.channel,
    seq: lastSeq + 1,
    perm: toPerm(permState),
    firstOpenDate,
    checkins,
    cardWeekStarts,
    events: events.map((e) => ({ name: e.name, weekStart: e.weekStart, at: e.at })),
  });
  return { report, text: formatReportText(report), violations: validateReportV2(report) };
}

export async function buildReportText(now: Date): Promise<string> {
  return (await prepareReport(now)).text;
}

/**
 * Kullanıcı tetikli ve ÖNİZLEMEDEN SONRA: önizlemede gösterilen metnin AYNISINI
 * adanmış dizine yazar, `seq`i kalıcılaştırır ve sistem paylaşım sayfasını açar.
 * Dosya silinmez (bkz. dosya başlığı).
 */
export async function sharePreparedReport(prepared: PreparedReport): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('shareReport: bu cihazda paylaşım kullanılamıyor.');
  }
  const uri = getReportFileUri(); // önbellek yoksa hata: paylaşmadan çık
  await ensureShareDir();
  await FileSystem.writeAsStringAsync(uri, prepared.text);
  await setReportSeq(prepared.report.seq);
  await Sharing.shareAsync(uri, {
    mimeType: 'text/plain',
    dialogTitle: 'Deneme raporu',
  });
}

/** Önizlemesiz kısayol (testler ve eski çağrılar): hazırlar ve paylaşır. */
export async function shareReport(now: Date): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('shareReport: bu cihazda paylaşım kullanılamıyor.');
  }
  getReportFileUri(); // önbellek yoksa hazırlıktan önce hata
  await sharePreparedReport(await prepareReport(now));
}

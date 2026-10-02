import * as fs from 'node:fs';
import * as path from 'node:path';

import { saveCheckin } from '@/data/checkin-repo';
import { setFirstOpenDate } from '@/data/setting-repo';
import {
  REPORT_KNOWN_LIMITS,
  buildReportText,
  prepareReport,
  sharePreparedReport,
  shareReport,
} from '@/metrics/report';
import { trackEvent, trackShareInitiated } from '@/metrics/track';
import { setupTestDb } from '../helpers/setup-test-db';

const mockPermState = jest.fn(async () => ({
  status: 'undetermined' as const,
  granted: false,
  canAskAgain: true,
}));
jest.mock('@/notify/wiring', () => ({
  getNotificationPermissionState: () => mockPermState(),
}));

jest.mock('expo-sharing', () => ({
  __esModule: true,
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-file-system/legacy', () => ({
  __esModule: true,
  cacheDirectory: 'file:///cache/',
  makeDirectoryAsync: jest.fn(async () => undefined),
  writeAsStringAsync: jest.fn(async () => undefined),
  deleteAsync: jest.fn(async () => undefined),
}));

function mocks() {
  return {
    Sharing: jest.requireMock('expo-sharing') as { isAvailableAsync: jest.Mock; shareAsync: jest.Mock },
    FS: jest.requireMock('expo-file-system/legacy') as {
      writeAsStringAsync: jest.Mock;
      deleteAsync: jest.Mock;
    },
  };
}

const NOW = new Date(2026, 8, 10, 12, 0, 0); // yerel 2026-09-10

async function seed() {
  await setFirstOpenDate('2026-09-01');
  await saveCheckin({ localDate: '2026-09-01', movement: 1, sleep: 2, spending: 3, social: 1 });
  await saveCheckin({ localDate: '2026-09-07', movement: 3, sleep: 3, spending: 3, social: 3 });
  await trackEvent('check_in_saved');
  await trackEvent('card_unlocked', '2026-09-07');
  await trackEvent('card_opened', '2026-09-07');
  await trackShareInitiated('2026-09-07', 2);
}

afterEach(() => jest.clearAllMocks());

describe('deneme raporu içeriği', () => {
  setupTestDb();

  // S16b: v2 (27 §4.1). Eski v1 alanları (filledDays/counts/cardSeen) hafta tablosu,
  // kart ve paylaşım özetine taşındı; bu testler yeni şemayı korur.
  it('v2: gün, ilk 3 gün deseni, D7, hafta tablosu ve paylaşım sayaçlarını doğru yansıtır', async () => {
    await seed();
    const text = await buildReportText(NOW);
    expect(text).toContain('Kurulumdan bu yana gün: 10');
    expect(text).toContain('7. günde check-in: var');
    expect(text).toContain('Paylaşım başlatma: 1, gizlenen satır: 2');
    const json = JSON.parse(text.split('\n').pop() as string);
    expect(json.v).toBe(2);
    expect(json.day).toBe(10);
    expect(json.d.d7).toBe('yes');
    expect(json.d.d1d3).toBe('100'); // 1. gün dolu, 2-3. gün boş
    // Olay zamanı gerçek saatten (Date.now) gelir, NOW sabit: yalnızca sayı olduğu ve
    // tarih sızdırmadığı doğrulanır (gün ofseti hesabı domain testinde, report-v2.test.ts).
    expect(typeof json.d.firstCardDay).toBe('number');
    expect(json.share).toEqual({ n: 1, hiddenTotal: 2 });
    // 2 check-in, iki ayrı haftada: sıra no 1 ve 2, tarih YOK.
    expect(json.weeks).toEqual([
      { i: 1, fill: 1, opened: 0, share: 0 },
      { i: 2, fill: 1, opened: 1, share: 1 },
    ]);
  });

  it('seq: ön izleme bir sonraki sayıyı gösterir, paylaşılınca kalıcılaşır (sonra artar)', async () => {
    const first = await prepareReport(NOW);
    expect(first.report.seq).toBe(1);
    expect((await prepareReport(NOW)).report.seq).toBe(1); // önizleme yazmaz
    await sharePreparedReport(first);
    expect((await prepareReport(NOW)).report.seq).toBe(2);
  });

  it('önizlenen metin paylaşılan dosyayla BİREBİR aynıdır', async () => {
    const { FS } = mocks();
    const prepared = await prepareReport(NOW);
    await sharePreparedReport(prepared);
    expect(FS.writeAsStringAsync.mock.calls[0][1]).toBe(prepared.text);
  });

  it('kartı hiç açmayan kullanıcı ayrı işaretlenir', async () => {
    await setFirstOpenDate('2026-09-01');
    const text = await buildReportText(NOW);
    expect(text).toContain('kart henüz açılmadı');
    const json = JSON.parse(text.split('\n').pop() as string);
    expect(json.d.firstCardDay).toBeNull();
  });

  it('bilinen sınırlar (fazla/eksik sayım, küçük örneklem) rapor metninde yazar', async () => {
    const text = await buildReportText(NOW);
    for (const limit of REPORT_KNOWN_LIMITS) {
      expect(text).toContain(limit);
    }
    expect(text).toMatch(/FAZLA sayılır/);
    expect(text).toMatch(/EKSİK sayılır/);
    expect(text).toMatch(/Örneklem küçük/);
  });

  it('yasak desen taraması: emoji, tarih, epoch, kategori adı, kimlik yok', async () => {
    await seed();
    const text = await buildReportText(NOW);
    expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(text).not.toMatch(/\d{4}-\d{2}-\d{2}/); // takvim tarihi
    expect(text).not.toMatch(/\d{10,}/); // epoch ms/s
    expect(text).not.toMatch(/movement|sleep|spending|social|hareket|uyku|harcama|sosyal/i);
    expect(text).not.toMatch(/deviceId|userId|uuid|email|@/i);
  });

  it('payload yalnızca beklenen v2 alanlarını taşır (kimlik/tarih alanı yok)', async () => {
    const { report } = await prepareReport(NOW);
    expect(Object.keys(report).sort()).toEqual(
      ['build', 'cards', 'ch', 'd', 'day', 'perm', 'seq', 'share', 'v', 'weeks'].sort()
    );
    expect(Object.keys(report.d).sort()).toEqual(['d1d3', 'd7', 'firstCardDay']);
    expect(Object.keys(report.cards).sort()).toEqual(['eligibleWeeks', 'frozen']);
    expect(Object.keys(report.share).sort()).toEqual(['hiddenTotal', 'n']);
  });

  it('perm: verildi -> granted; kalıcı ret -> denied; hiç sorulmamış/Android 13+ denied+canAskAgain -> unset', async () => {
    mockPermState.mockResolvedValueOnce({ status: 'granted' as never, granted: true, canAskAgain: false });
    expect((await prepareReport(NOW)).report.perm).toBe('granted');
    mockPermState.mockResolvedValueOnce({ status: 'denied' as never, granted: false, canAskAgain: false });
    expect((await prepareReport(NOW)).report.perm).toBe('denied');
    mockPermState.mockResolvedValueOnce({ status: 'denied' as never, granted: false, canAskAgain: true });
    expect((await prepareReport(NOW)).report.perm).toBe('unset');
    expect((await prepareReport(NOW)).report.perm).toBe('unset'); // varsayılan: undetermined
  });
});

describe('deneme raporu paylaşımı (kullanıcı tetikli, ağsız)', () => {
  setupTestDb();

  it('adanmış paylaşım dizinine yazar ve paylaşım sayfasını açar; paylaşım sonrası SİLMEZ (S16b, 04 #4)', async () => {
    await seed();
    const { Sharing, FS } = mocks();
    await shareReport(NOW);
    expect(FS.writeAsStringAsync).toHaveBeenCalledTimes(1);
    const [uri, contents] = FS.writeAsStringAsync.mock.calls[0];
    expect(uri).toBe('file:///cache/haftik-share/deneme-raporu.txt');
    expect(contents).toContain('deneme raporu');
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      uri,
      expect.objectContaining({ mimeType: 'text/plain' })
    );
    // Eskiden finally'de siliniyordu; hedef uygulama okumadan silinebildiği için kaldırıldı.
    expect(FS.deleteAsync).not.toHaveBeenCalled();
  });

  it('paylaşım kullanılamıyorsa hata fırlatır ve dosya yazılmaz', async () => {
    const { Sharing, FS } = mocks();
    Sharing.isAvailableAsync.mockResolvedValueOnce(false);
    await expect(shareReport(NOW)).rejects.toThrow();
    expect(FS.writeAsStringAsync).not.toHaveBeenCalled();
  });

  it('paylaşım hata verirse hata yayılır; dosya silinmez (temizlik açılış/silme süpürmesine bırakılır)', async () => {
    const { Sharing, FS } = mocks();
    Sharing.shareAsync.mockRejectedValueOnce(new Error('x'));
    await expect(shareReport(NOW)).rejects.toThrow();
    expect(FS.deleteAsync).not.toHaveBeenCalled();
  });

  it('ağ çağrısı yapmaz (fetch / XMLHttpRequest çağrılmaz)', async () => {
    await seed();
    const g = globalThis as unknown as { fetch?: unknown; XMLHttpRequest?: unknown };
    const origFetch = g.fetch;
    const origXhr = g.XMLHttpRequest;
    const fetchSpy = jest.fn();
    const xhrSpy = jest.fn();
    g.fetch = fetchSpy;
    g.XMLHttpRequest = xhrSpy;
    try {
      await shareReport(NOW);
    } finally {
      g.fetch = origFetch;
      g.XMLHttpRequest = origXhr;
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSpy).not.toHaveBeenCalled();
  });
});

describe('statik ağ taraması', () => {
  it('src/metrics ve domain/metrics-calc ağ API/kütüphanesi içermez; node:sqlite sızmaz', () => {
    const root = path.join(__dirname, '..', '..', 'src');
    const files = [
      ...fs
        .readdirSync(path.join(root, 'metrics'), { withFileTypes: true })
        .map((e) => path.join(root, 'metrics', e.name)),
      path.join(root, 'domain', 'metrics-calc.ts'),
    ];
    expect(files.length).toBeGreaterThanOrEqual(4);
    for (const f of files) {
      const text = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      expect({ f, hit: /\bfetch\s*\(|XMLHttpRequest|WebSocket|axios|https?:\/\/|node:sqlite/.test(text) }).toEqual({
        f,
        hit: false,
      });
    }
  });
});

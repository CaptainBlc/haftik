import * as fs from 'node:fs';
import * as path from 'node:path';

import { saveCheckin } from '@/data/checkin-repo';
import { setFirstOpenDate } from '@/data/setting-repo';
import { computeDeviceMetrics } from '@/domain/metrics-calc';
import {
  REPORT_KNOWN_LIMITS,
  buildReportPayload,
  buildReportText,
  formatReportText,
  shareReport,
} from '@/metrics/report';
import { trackEvent, trackShareInitiated } from '@/metrics/track';
import { setupTestDb } from '../helpers/setup-test-db';

jest.mock('expo-sharing', () => ({
  __esModule: true,
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-file-system/legacy', () => ({
  __esModule: true,
  cacheDirectory: 'file:///cache/',
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

  it('sayaçları, D7 ve dolu gün sayısını doğru yansıtır', async () => {
    await seed();
    const text = await buildReportText(NOW);
    expect(text).toContain('Dolu check-in günü: 2');
    expect(text).toContain('7. günde check-in: var');
    expect(text).toContain('Kart açıldı mı: evet');
    expect(text).toContain('check_in_saved=1');
    expect(text).toContain('card_opened=1');
    expect(text).toContain('share_initiated=1');
    expect(text).toContain('line_hidden=2');
    const json = JSON.parse(text.split('\n').pop() as string);
    expect(json.filledDays).toBe(2);
    expect(json.d7).toBe('yes');
    expect(json.dayNumber).toBe(10);
  });

  it('kartı hiç görmeyen kullanıcı ayrı işaretlenir', async () => {
    await setFirstOpenDate('2026-09-01');
    const text = await buildReportText(NOW);
    expect(text).toContain('hayır (kartı hiç görmedi)');
    expect(text).toContain('ölçülemez (kartı görmedi)');
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

  it('payload yalnızca beklenen alanları taşır', async () => {
    const payload = buildReportPayload(
      computeDeviceMetrics({ events: [], firstOpenDate: '2026-09-01', checkinDates: [], today: '2026-09-02' })
    );
    expect(Object.keys(payload).sort()).toEqual(
      ['cardSeen', 'counts', 'd7', 'dayNumber', 'filledDays', 'schemaVersion', 'sharedGivenSeen'].sort()
    );
    expect(() => formatReportText(payload)).not.toThrow();
  });
});

describe('deneme raporu paylaşımı (kullanıcı tetikli, ağsız)', () => {
  setupTestDb();

  it('geçici dosyaya yazar, paylaşım sayfasını açar, sonra siler', async () => {
    await seed();
    const { Sharing, FS } = mocks();
    await shareReport(NOW);
    expect(FS.writeAsStringAsync).toHaveBeenCalledTimes(1);
    const [uri, contents] = FS.writeAsStringAsync.mock.calls[0];
    expect(uri).toBe('file:///cache/deneme-raporu.txt');
    expect(contents).toContain('deneme raporu');
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      uri,
      expect.objectContaining({ mimeType: 'text/plain' })
    );
    expect(FS.deleteAsync).toHaveBeenCalledWith(uri, expect.objectContaining({ idempotent: true }));
  });

  it('paylaşım kullanılamıyorsa hata fırlatır ve dosya yazılmaz', async () => {
    const { Sharing, FS } = mocks();
    Sharing.isAvailableAsync.mockResolvedValueOnce(false);
    await expect(shareReport(NOW)).rejects.toThrow();
    expect(FS.writeAsStringAsync).not.toHaveBeenCalled();
  });

  it('paylaşım hata verse de geçici dosya silinmeye çalışılır', async () => {
    const { Sharing, FS } = mocks();
    Sharing.shareAsync.mockRejectedValueOnce(new Error('x'));
    await expect(shareReport(NOW)).rejects.toThrow();
    expect(FS.deleteAsync).toHaveBeenCalled();
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

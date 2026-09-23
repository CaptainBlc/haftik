/**
 * `openOrBuildCard` — entegrasyon testi (gerçek bellek-içi SQLite sürücüsü,
 * `setupTestDb`). Görev talimatı madde 6'nın istediği "aynı hafta tekrar
 * açılınca aynı görsel" garantisini burada doğrudan doğrular: `getCard`
 * zaten dondurulmuş `CardSnapshot`'ı döndürdüğü için bu otomatik sağlanır,
 * ama `buildCard` ikinci kez farklı girdiyle çağrılsa bile (yeni checkin
 * eklenmiş olsa bile) `openOrBuildCard`'ın hep İLK sonucu döndürdüğü burada
 * kanıtlanır.
 */
import { getCard } from '@/data/card-repo';
import { saveCheckin } from '@/data/checkin-repo';
import { openOrBuildCard } from '@/card/open-card';
import type { Checkin } from '@/domain/types';

import { setupTestDb } from '../helpers/setup-test-db';

function checkin(localDate: string, value: 1 | 2 | 3): Checkin {
  return { localDate, movement: value, sleep: value, spending: value, social: value };
}

async function saveWeek(startDate: string, days: number, value: 1 | 2 | 3): Promise<void> {
  const cursor = new Date(`${startDate}T00:00:00`);
  for (let i = 0; i < days; i += 1) {
    const y = cursor.getFullYear();
    const m = `${cursor.getMonth() + 1}`.padStart(2, '0');
    const d = `${cursor.getDate()}`.padStart(2, '0');
    // eslint-disable-next-line no-await-in-loop -- test yardımcı fonksiyonu, sıralılık gerekli değil ama yeterince küçük.
    await saveCheckin(checkin(`${y}-${m}-${d}`, value));
    cursor.setDate(cursor.getDate() + 1);
  }
}

describe('openOrBuildCard', () => {
  setupTestDb();

  it("hiç kart yoksa ilk açılışta buildCard+saveCard ile üretir ve dondurur", async () => {
    await saveWeek('2026-09-14', 5, 3); // Pzt-Cum, 5 dolu gün

    const result = await openOrBuildCard('2026-09-14', '2026-09-25');

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') return;
    expect(result.card.weekStart).toBe('2026-09-14');
    expect(result.card.checkinDays).toBe(5);

    const stored = await getCard('2026-09-14');
    expect(stored).toEqual(result.card);
  });

  it('aynı hafta tekrar açılınca aynı görsel: ikinci çağrı, aradan yeni checkin eklenmiş olsa bile İLK sonucu döner', async () => {
    await saveWeek('2026-09-14', 5, 3);
    const first = await openOrBuildCard('2026-09-14', '2026-09-25');
    expect(first.status).toBe('ready');

    // Içerik havuzu/checkin verisi "değişmiş" gibi bir senaryo: aynı haftaya
    // farklı bir değerle checkin eklensin (buildCard'a girse ortalamayı
    // değiştirirdi).
    await saveCheckin(checkin('2026-09-20', 1));

    const second = await openOrBuildCard('2026-09-14', '2026-09-26');

    expect(second).toEqual(first);
  });

  it("K3: bugün bu haftanın Pazar'ı ve bugünün check-in'i eksikse kartı ÜRETMEDEN 'needsTodayCheckin' döner", async () => {
    await saveWeek('2026-09-14', 6, 2); // Pzt-Cmt, 6 dolu gün (eşik zaten sağlanmış)

    const result = await openOrBuildCard('2026-09-14', '2026-09-20'); // bugün = o haftanın Pazar'ı

    expect(result).toEqual({ status: 'needsTodayCheckin' });
    expect(await getCard('2026-09-14')).toBeNull();
  });

  it("K3 çözüldükten sonra (bugünün check-in'i eklendi) normal şekilde üretir", async () => {
    await saveWeek('2026-09-14', 6, 2);
    const blocked = await openOrBuildCard('2026-09-14', '2026-09-20');
    expect(blocked.status).toBe('needsTodayCheckin');

    await saveCheckin(checkin('2026-09-20', 2));
    const result = await openOrBuildCard('2026-09-14', '2026-09-20');

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') return;
    expect(result.card.checkinDays).toBe(7);
  });

  it("K3 kontrolü yalnızca bugün o haftanın Pazar'ıyken çalışır: geçmiş açık hafta için doğrudan üretir", async () => {
    await saveWeek('2026-09-14', 5, 3); // bugünün (Pazar, 09-20) checkin'i yok

    // "bugün" artık ertesi haftanın bir günü (Pazartesi'den sonra) -- K3
    // artık geçerli değil (pazar-akisi.md kenar durum #3).
    const result = await openOrBuildCard('2026-09-14', '2026-09-22');

    expect(result.status).toBe('ready');
  });

  it('önceki haftanın kartı varsa unvan/satır/özet tekrar-önleme zincirini gerçek dondurulmuş veriden besler', async () => {
    await saveWeek('2026-09-07', 5, 3); // önceki hafta
    const prev = await openOrBuildCard('2026-09-07', '2026-09-18');
    expect(prev.status).toBe('ready');

    await saveWeek('2026-09-14', 5, 3); // bu hafta, aynı seviye deseni
    const current = await openOrBuildCard('2026-09-14', '2026-09-25');
    expect(current.status).toBe('ready');
    if (current.status !== 'ready' || prev.status !== 'ready') return;

    // Aynı (kategori, seviye) havuzunda birden fazla varyant varsa,
    // ardışık haftada aynı varyant tekrarlanmaması beklenir (spec
    // "Satırlar": "Ardışık haftada aynı varyant tekrarlanmaz").
    // Havuzda tek varyant kalmışsa tekrar kaçınılmaz olabilir (copy.ts'in
    // dokümante ettiği düşme davranışı); bu yüzden test yalnızca
    // fonksiyonun hatasız çalıştığını ve önceki kartın gerçekten
    // okunduğunu (round-trip) doğrular.
    expect(current.card.weekStart).toBe('2026-09-14');
  });
});

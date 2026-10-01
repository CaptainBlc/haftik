/**
 * T2, kaçırılan hafta yolu (bkz. `docs/kararlar/2026-09-30-taban-oncesi-
 * kararlar.md` roadmap S15 ve `docs/inceleme-2026-09-25/21-mimari-ve-efor.md`
 * §2c/§T2). `week.test.ts`e (S2'de dondurulmuş) EKLENMEDİ — yeni, bağımsız
 * bir dosya.
 */
import { findOpenableWeeks } from '../../src/domain/week';
import type { Checkin } from '../../src/domain/types';

function checkin(localDate: string): Checkin {
  return { localDate, movement: 2, sleep: 2, spending: 2, social: 2 };
}

const NOW = new Date('2026-09-23T12:00:00'); // Çarşamba, hafta başı 2026-09-21.

describe('findOpenableWeeks', () => {
  it('hiç check-in yoksa boş dizi döner', () => {
    expect(findOpenableWeeks({ checkins: [], cardWeekStarts: [], now: NOW })).toEqual([]);
  });

  it('uygun (eşik + zaman) ama kartı kaydedilmemiş haftayı bulur', () => {
    const checkins = ['2026-09-07', '2026-09-08', '2026-09-09'].map(checkin);
    const result = findOpenableWeeks({ checkins, cardWeekStarts: [], now: NOW });
    expect(result).toEqual(['2026-09-07']);
  });

  it('eşiği karşılamayan (yalnız 2 dolu gün) haftayı DÖNDÜRMEZ', () => {
    const checkins = ['2026-09-07', '2026-09-08'].map(checkin);
    const result = findOpenableWeeks({ checkins, cardWeekStarts: [], now: NOW });
    expect(result).toEqual([]);
  });

  it('zamanı gelmemiş (Pazar 20:00 henüz geçmemiş) haftayı DÖNDÜRMEZ', () => {
    // 2026-09-21 haftasının Pazar'ı (2026-09-27 20:00) "şimdi"den (2026-09-23) sonra.
    const checkins = ['2026-09-21', '2026-09-22', '2026-09-23'].map(checkin);
    const result = findOpenableWeeks({ checkins, cardWeekStarts: [], now: NOW });
    expect(result).toEqual([]);
  });

  it('kartı zaten kaydedilmiş haftayı DÖNDÜRMEZ (cardWeekStarts filtresi)', () => {
    const checkins = ['2026-09-07', '2026-09-08', '2026-09-09'].map(checkin);
    const result = findOpenableWeeks({
      checkins,
      cardWeekStarts: ['2026-09-07'],
      now: NOW,
    });
    expect(result).toEqual([]);
  });

  it('birden fazla uygun hafta varsa hepsini ARTAN sırada döner', () => {
    const checkins = [
      '2026-09-07', '2026-09-08', '2026-09-09', // Hafta 1: 3 gün (eşik 3).
      '2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', // Hafta 2: 4 gün (eşik artık 4).
    ].map(checkin);
    const result = findOpenableWeeks({ checkins, cardWeekStarts: [], now: NOW });
    expect(result).toEqual(['2026-09-07', '2026-09-14']);
  });

  it('ikinci haftada eşik 4e çıktığı için yalnızca 3 dolu günle o hafta uygun SAYILMAZ', () => {
    const checkins = [
      '2026-09-07', '2026-09-08', '2026-09-09', // Hafta 1: nitelikli (eşik 3 ile).
      '2026-09-14', '2026-09-15', '2026-09-16', // Hafta 2: yalnız 3 gün, ama eşik artık 4.
    ].map(checkin);
    const result = findOpenableWeeks({ checkins, cardWeekStarts: [], now: NOW });
    expect(result).toEqual(['2026-09-07']);
  });

  it('aynı güne ait yinelenen check-in kayıtları tekilleştirilir (dedupeByLocalDate)', () => {
    const checkins = [
      checkin('2026-09-07'),
      checkin('2026-09-07'), // aynı gün ikinci kez
      checkin('2026-09-08'),
      checkin('2026-09-09'),
    ];
    const result = findOpenableWeeks({ checkins, cardWeekStarts: [], now: NOW });
    expect(result).toEqual(['2026-09-07']);
  });
});

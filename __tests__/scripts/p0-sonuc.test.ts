/**
 * P0 sonuç hesaplayıcı (`scripts/p0-sonuc.js`): CSV ayrıştırma, doğrulama ve karar tablosu eşikleri.
 * Eşikler `docs/p0-gorsel-oturum-kontrol-listesi.md` bölüm C ile birebir olmalı.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const p0 = require('../../scripts/p0-sonuc') as {
  COLUMNS: string[];
  parseCsv: (t: string) => { rows: Record<string, string>[]; errors: string[] };
  validateRows: (r: Record<string, string>[]) => string[];
  analyze: (r: Record<string, string>[]) => {
    n: number;
    oneri: string;
    measures: { id: string; durum: string; deger: string; not: string }[];
  };
  formatMarkdown: (r: unknown, p: string[], e: string[]) => string;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('node:fs') as { readFileSync: (p: string, enc: string) => string };

type Row = Record<string, string>;

const base = (over: Partial<Row> = {}): Row => ({
  kod: 'P1',
  platform: 'android',
  sikiklik: 'ara',
  sira: 'E',
  unvan_eski: 'E',
  unvan_c: 'E',
  koyar_eski_gorunur: 'H',
  koyar_eski_gizli: 'H',
  koyar_c_gorunur: 'E',
  koyar_c_gizli: 'B',
  cocuk_c: '2',
  cocuksu_acik: 'H',
  gizli_secim: 'unvanli',
  engel: 'ilgisiz',
  l1_sagdaki_iyi: 'H',
  l1_orta_en_iyi: 'H',
  ornek_kendi: 'H',
  gercek_koydu: 'E',
  __line: '2',
  ...over,
});

const six = (over: (i: number) => Partial<Row> = () => ({})): Row[] =>
  [1, 2, 3, 4, 5, 6].map((i) => base({ kod: `P${i}`, __line: String(i + 1), ...over(i) }));

const byId = (rows: Row[]) => Object.fromEntries(p0.analyze(rows).measures.map((m) => [m.id, m]));

describe('şablon', () => {
  it('kayıt şablonunun başlığı betiğin beklediği sütunlarla aynı, aynı sırada', () => {
    const text = fs.readFileSync(`${__dirname}/../../docs/p0-materyal/kayit-sablonu.csv`, 'utf8');
    const { rows, errors } = p0.parseCsv(text);
    expect(errors).toEqual([]);
    expect(rows).toEqual([]); // başlık var, veri yok
    const header = text.split(/\r?\n/).find((l) => l.startsWith('kod,')) as string;
    expect(header.split(',')).toEqual(p0.COLUMNS);
  });
});

describe('parseCsv / validateRows', () => {
  it('yorum ve boş satırlar atlanır, ; ve , ayırıcı kabul edilir', () => {
    const csv = ['# yorum', '', p0.COLUMNS.join(';'), p0.COLUMNS.map((c) => (c === 'kod' ? 'P1' : 'E')).join(';')].join('\n');
    const { rows, errors } = p0.parseCsv(csv);
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0].kod).toBe('P1');
  });

  it('eksik sütun bildirilir', () => {
    expect(p0.parseCsv('kod,platform\nP1,android').errors.some((e) => e.includes('unvan_c'))).toBe(true);
  });

  it('geçersiz değerler ve yinelenen kod yakalanır', () => {
    const rows = [base({ kod: 'P1' }), base({ kod: 'P1', koyar_c_gorunur: 'X', cocuk_c: '9', gizli_secim: 'belki' })];
    const problems = p0.validateRows(rows);
    expect(problems.some((p) => p.includes('kod yinelenmiş'))).toBe(true);
    expect(problems.some((p) => p.includes('koyar_c_gorunur'))).toBe(true);
    expect(problems.some((p) => p.includes('cocuk_c'))).toBe(true);
    expect(problems.some((p) => p.includes('gizli_secim'))).toBe(true);
  });

  it('tutarlı veri sorun üretmez; gercek_koydu boş olabilir', () => {
    expect(p0.validateRows(six())).toEqual([]);
    expect(p0.validateRows(six(() => ({ gercek_koydu: '' })))).toEqual([]);
  });
});

describe('karar eşikleri', () => {
  it('"geç" senaryosu: C belirgin tercih, çocuksu yok, unvan okunuyor -> GEÇ', () => {
    const r = p0.analyze(six());
    expect(r.oneri).toMatch(/^GEÇ/);
    const m = byId(six());
    expect(m.M1.durum).toBe('geçer');
    expect(m.M2.durum).toBe('geçer');
    expect(m.M3.durum).toBe('geçer');
    expect(m.M5.durum).toBe('geçer');
    expect(m.L1.durum).toBe('geçer');
  });

  it('M1: 5/6 geçer, 4/6 kalır (>= %80)', () => {
    expect(byId(six((i) => ({ unvan_c: i === 1 ? 'H' : 'E' }))).M1.durum).toBe('geçer');
    expect(byId(six((i) => ({ unvan_c: i <= 2 ? 'H' : 'E' }))).M1.durum).toBe('kalır');
  });

  it('SINIR değerleri (eşiğin bir birim kaymasını yakalamak için)', () => {
    const ten = (n: number) => byId(Array.from({ length: 10 }, (_v, i) => base({ kod: `P${i + 1}`, __line: String(i + 2), unvan_c: i < n ? 'E' : 'H' }))).M1.durum;
    expect(ten(8)).toBe('geçer'); // %80 sınırı
    expect(ten(7)).toBe('kalır'); // %70: 0,7 eşiğiyle yanlışlıkla geçerdi
    // M2: C'yi tercih eden TAM 2 kişi: kill değil (<= 1), uyarı.
    const two = six((i) => ({ koyar_c_gorunur: i <= 2 ? 'E' : 'H', koyar_eski_gorunur: 'H' }));
    expect(byId(two).M2.durum).toBe('uyarı');
    // M2: C'ye "evet" diyen TAM 2 kişi (diğerleri "belki"): herkes C'yi tercih ediyor ama evet sayısı 3'ün altında -> geçmez.
    const maybe = six((i) => ({ koyar_c_gorunur: i <= 2 ? 'E' : 'B', koyar_eski_gorunur: 'H' }));
    expect(byId(maybe).M2.durum).toBe('uyarı');
    // ve 3 evet ile geçer
    const three = six((i) => ({ koyar_c_gorunur: i <= 3 ? 'E' : 'B', koyar_eski_gorunur: 'H' }));
    expect(byId(three).M2.durum).toBe('geçer');
  });

  it('M2 kill: C\'yi tercih eden <= 1 -> KILL ve öneri DUR', () => {
    const rows = six((i) => ({ koyar_c_gorunur: i === 1 ? 'E' : 'H', koyar_eski_gorunur: 'H' }));
    const m = byId(rows);
    expect(m.M2.durum).toBe('kalır');
    expect(m.M2.not).toMatch(/KILL/);
    expect(p0.analyze(rows).oneri).toMatch(/^DUR/);
  });

  it('M2: 3 kişi C\'yi seçmiş ama 4\'ü yok -> geçer değil, uyarı (belirsiz)', () => {
    const rows = six((i) => ({ koyar_c_gorunur: i <= 3 ? 'E' : 'H', koyar_eski_gorunur: 'H' }));
    expect(byId(rows).M2.durum).toBe('uyarı');
    expect(p0.analyze(rows).oneri).toMatch(/^BELİRSİZ/);
  });

  it('M2: C evet >= 3 ama Eski ile aynı sayıda evet (fark yok) -> geçmez', () => {
    const rows = six((i) => ({ koyar_c_gorunur: i <= 4 ? 'E' : 'H', koyar_eski_gorunur: i <= 4 ? 'E' : 'H' }));
    expect(byId(rows).M2.durum).not.toBe('geçer');
  });

  it('M3: 1 geçer, 2 uyarı, 3 kalır; açık uçta "çocuksu" ya da puan >= 4 sayılır', () => {
    const k = (n: number, how: 'puan' | 'acik') =>
      byId(
        six((i) => (i <= n ? (how === 'puan' ? { cocuk_c: '4' } : { cocuksu_acik: 'E' }) : {}))
      ).M3.durum;
    expect(k(1, 'puan')).toBe('geçer');
    expect(k(2, 'acik')).toBe('uyarı');
    expect(k(3, 'puan')).toBe('kalır');
    // aynı kişi iki yoldan da sayılsa tek sayılır
    expect(byId(six((i) => (i === 1 ? { cocuk_c: '5', cocuksu_acik: 'E' } : {}))).M3.deger).toBe('1/6');
    expect(p0.analyze(six((i) => (i <= 3 ? { cocuk_c: '5' } : {}))).oneri).toMatch(/^DUR/);
  });

  it('M4: bakılmadıysa "henüz bakılmadı" (bilgi); 0 koydu uyarı; >= 1 geçer', () => {
    expect(byId(six(() => ({ gercek_koydu: '' }))).M4.durum).toBe('bilgi');
    expect(byId(six(() => ({ gercek_koydu: 'H' }))).M4.durum).toBe('uyarı');
    expect(byId(six((i) => ({ gercek_koydu: i === 1 ? 'E' : 'H' }))).M4.durum).toBe('geçer');
  });

  it('M5: unvanlı >= 4/6 geçer; gizli >= 3 notu düşer', () => {
    expect(byId(six((i) => ({ gizli_secim: i <= 4 ? 'unvanli' : 'gizli' }))).M5.durum).toBe('geçer');
    const m = byId(six((i) => ({ gizli_secim: i <= 3 ? 'unvanli' : 'gizli' }))).M5;
    expect(m.durum).toBe('uyarı');
    expect(m.not).toMatch(/esprisi işliyor/);
  });

  it('M6: tek engel >= 3/6 uyarı, dağılım notta', () => {
    const m = byId(six((i) => ({ engel: i <= 3 ? 'ifsa' : 'cirkin' }))).M6;
    expect(m.durum).toBe('uyarı');
    expect(m.deger).toContain('ifsa');
    expect(m.not).toContain('ifsa 3');
    expect(byId(six((i) => ({ engel: ['a', 'b', 'c', 'd', 'e', 'f'][i - 1] }))).M6.durum).toBe('bilgi');
  });

  it('L1: iki soruda da <= 1 evet geçer; biri 2 ise kalır (yalnız kelime kalır)', () => {
    expect(byId(six((i) => ({ l1_sagdaki_iyi: i === 1 ? 'E' : 'H', l1_orta_en_iyi: i === 2 ? 'E' : 'H' }))).L1.durum).toBe('geçer');
    const bad = byId(six((i) => ({ l1_sagdaki_iyi: i <= 2 ? 'E' : 'H' }))).L1;
    expect(bad.durum).toBe('kalır');
    expect(bad.not).toMatch(/yalnız kelime/);
  });

  it('ÖRNEK: 0 geçer, 1 uyarı, 2 kalır', () => {
    const k = (n: number) => byId(six((i) => ({ ornek_kendi: i <= n ? 'E' : 'H' }))).ÖRNEK.durum;
    expect([k(0), k(1), k(2)]).toEqual(['geçer', 'uyarı', 'kalır']);
  });
});

describe('çıktı', () => {
  it('5 kişiden azsa uyarı; veri sorunları listelenir; öneri başlığı vardır', () => {
    const rows = six().slice(0, 4);
    const md = p0.formatMarkdown(p0.analyze(rows), ['satır 2 (P1): cocuk_c 1-5 olmalı'], []);
    expect(md).toContain('5 kişiden az');
    expect(md).toContain('Veri sorunları');
    expect(md).toContain('## Öneri:');
    expect(md).toContain('karar değil, karar girdisidir');
  });

  it('katılımcı kodu dışında kimlik alanı yok (sütun listesi)', () => {
    expect(p0.COLUMNS.filter((c) => /ad|isim|telefon|mail|email|numara/i.test(c) && c !== 'kod')).toEqual([]);
  });
});

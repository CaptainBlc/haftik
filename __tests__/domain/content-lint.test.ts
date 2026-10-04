/**
 * İçerik lint testi (S16a; `docs/inceleme-2026-09-25/19-metin-ve-icerik-v2.md`
 * §4.5: L1 yasak sözcük, L5 özette seviye sözcüğü yok, L6 zaman zarfı; ayrıca
 * kota ve "vites" kuralı, A15). Ses kılavuzunun KENDİNİ UYGULAMASI: havuza yeni
 * metin eklenince bu test, elle denetimin kaçıracağı ihlali yakalar.
 */
import {
  DAILY_NOTIFICATION_VARIANTS,
  NOTIFICATION_TEXTS,
} from '../../src/domain/content/notification-texts';
import { LINE_VARIANTS, SUMMARY_VARIANTS, TITLE_TEXTS } from '../../src/domain/content/tr';

const lower = (s: string) => s.toLocaleLowerCase('tr');

const titles = Object.entries(TITLE_TEXTS).map(([id, text]) => ({ id, text }));
const lines = Object.values(LINE_VARIANTS).flatMap((levels) =>
  Object.values(levels).flatMap((variants) => variants)
);
const summaries = Object.values(SUMMARY_VARIANTS).flatMap((variants) => variants);

/** Kart (PNG) içeriği: unvan + satır + özet. */
const cardPool = [...titles, ...lines, ...summaries];

/** Kullanıcıya dönük statik bildirim metinleri. */
const notificationPool = [
  ...DAILY_NOTIFICATION_VARIANTS.flatMap((t, i) => [
    { id: `notif.daily.${i}.title`, text: t.title },
    { id: `notif.daily.${i}.body`, text: t.body },
  ]),
  { id: 'notif.card-ready.title', text: NOTIFICATION_TEXTS['card-ready'].title },
  { id: 'notif.card-ready.body', text: NOTIFICATION_TEXTS['card-ready'].body },
];

const everything = [...cardPool, ...notificationPool];

/** Ek alabilen kökler: "kahraman", "kahramanı", "kahramanlık" ... */
const FORBIDDEN_PREFIX = [
  // A. tıbbi/klinik
  'teşhis', 'tedavi', 'tavsiye', 'hasta', 'depresyon', 'stres', 'anksiyete', 'kalori', 'diyet',
  'doktor', 'yapmalısın', 'yapman gerek', 'uykusuz', 'yorgun', 'zinde', 'dinlenmiş', 'tükenmiş',
  // B. yargı/damga
  'kahraman', 'yıldız', 'şampiyon', 'cömert', 'cimri', 'tutumlu', 'çekingen', 'içine dönük',
  'yalnız', 'tembel', 'kısıtlı', 'tam kararında', 'tam kıvamında', 'akıllıca', 'kusursuz',
  'orta karar', 'performans',
  // C. boş övgü / çocuksu
  'güzel', 'harika', 'süper', 'bravo', 'mükemmel', 'yaşasın',
  // D. sesteş/istenmeyen çağrışım
  'kumbaracı',
  // E. jargon
  'check-in', 'anonim',
];

/** Ek almayan (tam sözcük) yasaklar. */
const FORBIDDEN_WORD = ['tanı', 'kilo', 'doz', 'mod', 'veri'];

const startsWord = (root: string) => new RegExp(`(?<![\\p{L}])${root}`, 'u');
const wholeWord = (word: string) => new RegExp(`(?<![\\p{L}])${word}(?![\\p{L}])`, 'u');

describe('L1: yasak sözcük taraması (19 §4.2)', () => {
  it.each(everything.map((e) => [e.id, e.text]))('%s: yasak sözcük yok', (_id, text) => {
    const t = lower(text);
    for (const root of FORBIDDEN_PREFIX) {
      expect({ text, root, found: startsWord(root).test(t) }).toEqual({ text, root, found: false });
    }
    for (const word of FORBIDDEN_WORD) {
      expect({ text, word, found: wholeWord(word).test(t) }).toEqual({ text, word, found: false });
    }
  });

  it('kart havuzunda "kart" sözcüğü geçmez (banka kartı sesteşliği, 19 §2.4)', () => {
    for (const { id, text } of cardPool) {
      expect({ id, found: /(?<![\p{L}])kart/u.test(lower(text)) }).toEqual({ id, found: false });
    }
  });
});

describe('L5: özet metninde seviye sözcüğü yok (19 §3.1)', () => {
  const LEVEL_WORDS = [
    'durgun', 'hafif', 'yoğun', 'kısa', 'orta', 'uzun', 'az', 'çok', 'bol', 'sakin', 'tenha', 'kalabalık',
  ];
  it.each(summaries.map((s) => [s.id, s.text]))('%s: seviye sözcüğü yok', (_id, text) => {
    const t = lower(text);
    for (const word of LEVEL_WORDS) {
      expect({ text, word, found: wholeWord(word).test(t) }).toEqual({ text, word, found: false });
    }
  });
});

describe('L6: zaman zarfı taraması (19 §4.1, zamansızlaştırma)', () => {
  const ADVERBS = ['bu hafta', 'bu sefer', 'şu an', 'bugünlerde'];
  it.each(cardPool.map((e) => [e.id, e.text]))('%s: zaman zarfı yok', (_id, text) => {
    const t = lower(text);
    for (const adverb of ADVERBS) {
      expect({ text, adverb, found: t.includes(adverb) }).toEqual({ text, adverb, found: false });
    }
    // "geçen hafta" yalnızca kartın İÇ kıyası olarak serbest (geçen haftaya göre/yla/dan/nın/yı).
    expect({ text, bare: /geçen hafta(?!ya göre|yla|dan|nın|yı)/.test(t) }).toEqual({ text, bare: false });
  });
});

describe('sınırlar ve biçim', () => {
  it('kart havuzu: her metin <= 60 karakter ve rakamsız; unvan <= 28; satır <= 46', () => {
    for (const { text } of cardPool) {
      expect([...text].length).toBeLessThanOrEqual(60);
      expect(text).not.toMatch(/\d/);
    }
    for (const { text } of titles) expect([...text].length).toBeLessThanOrEqual(28);
    for (const { text } of lines) expect([...text].length).toBeLessThanOrEqual(46);
  });

  it('bildirim metinleri rakamsız', () => {
    for (const { text } of notificationPool) expect(text).not.toMatch(/\d/);
  });
});

describe('imge kotaları (19 §1.4, A15)', () => {
  const count = (re: RegExp) => cardPool.filter(({ text }) => re.test(lower(text))).length;

  it('"vites" kart havuzunda ve bildirimde YOK (A15: yalnızca ileride eklenecek risingBig/fallingBig kovalarında)', () => {
    for (const { text } of everything) expect(lower(text)).not.toContain('vites');
  });

  it('cüzdan en çok 5, yastık/battaniye birlikte en çok 4, kanepe en çok 2', () => {
    expect(count(/cüzdan/)).toBeLessThanOrEqual(5);
    expect(count(/yastı|battaniye/)).toBeLessThanOrEqual(4);
    expect(count(/kanepe/)).toBeLessThanOrEqual(2);
  });

  it('"resmen" en çok 1, "orta şekerli" en çok 1, "telefon rehberi" en çok 2', () => {
    expect(count(/resmen/)).toBeLessThanOrEqual(1);
    expect(count(/orta şekerli/)).toBeLessThanOrEqual(1);
    expect(count(/telefon rehberi/)).toBeLessThanOrEqual(2);
  });

  it('rütbe soneki (usta/uzman/şampiyon/kahraman/yıldız) 40 unvanın en çok 4\'ünde', () => {
    const ranked = titles.filter(({ text }) => /(?<![\p{L}])(usta|uzman|şampiyon|kahraman|yıldız)/u.test(lower(text)));
    expect(ranked.length).toBeLessThanOrEqual(4);
  });

  it('bir (kategori, seviye) hücresinde "ne ... ne ..." en çok 2 satırda', () => {
    for (const [category, levels] of Object.entries(LINE_VARIANTS)) {
      for (const [level, variants] of Object.entries(levels)) {
        const n = variants.filter((v) => /(?<![\p{L}])ne .*(?<![\p{L}])ne /u.test(lower(v.text))).length;
        expect({ category, level, n: Math.min(n, 3) }).toEqual({ category, level, n: Math.min(n, 2) });
      }
    }
  });
});

describe('daily bildirim havuzu', () => {
  it('4 varyant var ve başlıkları birbirinden farklı', () => {
    expect(DAILY_NOTIFICATION_VARIANTS).toHaveLength(4);
    expect(new Set(DAILY_NOTIFICATION_VARIANTS.map((v) => v.title)).size).toBe(4);
  });
});

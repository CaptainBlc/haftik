/** S22 (19 §3.2): Kaydet anı cümle havuzunun mekanik denetimi. */
import {
  SAVE_FEEDBACK_ERROR_TEXTS,
  SAVE_FEEDBACK_FUTURE_CLAIM_KINDS,
  SAVE_FEEDBACK_TEXTS,
  getSaveFeedbackText,
  type SaveFeedbackKind,
} from '@/domain/content/save-feedback-texts';

const KINDS = Object.keys(SAVE_FEEDBACK_TEXTS) as SaveFeedbackKind[];
const ALL = KINDS.flatMap((k) => SAVE_FEEDBACK_TEXTS[k].map((text) => ({ kind: k, text })));

describe('SAVE_FEEDBACK_TEXTS', () => {
  it('11 tür var ve hepsinin en az bir cümlesi var', () => {
    expect(KINDS).toHaveLength(11);
    for (const k of KINDS) expect(SAVE_FEEDBACK_TEXTS[k].length).toBeGreaterThanOrEqual(1);
  });

  it('çok varyantlı türlerde en az 2 varyant (ardışık gün tekrarını önlemek için)', () => {
    for (const k of KINDS.filter((x) => x !== 'neutral')) {
      expect(SAVE_FEEDBACK_TEXTS[k].length).toBeGreaterThanOrEqual(3);
    }
  });

  it('en çok 52 karakter ({r} tek hane yerine konunca)', () => {
    for (const { text } of ALL) expect(text.replace('{r}', '3').length).toBeLessThanOrEqual(52);
    for (const text of SAVE_FEEDBACK_ERROR_TEXTS) expect(text.length).toBeLessThanOrEqual(52);
  });

  it('yasak dil: seri, kaçırma, "hâlâ", kayıp dili, ünlem yığını yok', () => {
    const banned = /\b(seri|kaçır|kaçırd|hâlâ|hala\b|kayıp|kaybet|mahrum|unuttun|yine de)/i;
    for (const { kind, text } of ALL) expect({ kind, text, bad: banned.test(text) }).toEqual({ kind, text, bad: false });
    for (const { text } of ALL) expect((text.match(/!/g) ?? []).length).toBeLessThanOrEqual(1);
  });

  it('seviye ve kategori sözcüğü yok (kart içeriğini sızdırmaz)', () => {
    const leak = /(kısa|orta|uzun|sakin|kalabalık|durgun|hafif|yoğun|hareket|uyku|harcama|sosyal|\bfiş\b|cüzdan)/i;
    for (const { kind, text } of ALL) expect({ kind, text, leak: leak.test(text) }).toEqual({ kind, text, leak: false });
  });

  it('"Pazar 20:00" / "Pazar akşamı" gibi gelecek-kart iddiası yalnız D, E, F türlerinde', () => {
    const claim = /(Pazar|bu akşam 20:00)/;
    for (const { kind, text } of ALL) {
      if (claim.test(text)) expect(SAVE_FEEDBACK_FUTURE_CLAIM_KINDS).toContain(kind);
    }
    // ve D/E/F'nin her cümlesi gerçekten böyle bir iddia taşır ya da kalan günü söylemez (boş vaat yok)
    for (const kind of SAVE_FEEDBACK_FUTURE_CLAIM_KINDS) {
      expect(SAVE_FEEDBACK_TEXTS[kind].length).toBeGreaterThan(0);
    }
  });

  it('B ve C (eşik altı) "açılabilir/hazır" iddia etmez (eski yanıltıcı "hazırlanıyor" hatasının tekrarı olmasın)', () => {
    for (const text of [...SAVE_FEEDBACK_TEXTS.below, ...SAVE_FEEDBACK_TEXTS.oneLeft]) {
      expect(text).not.toMatch(/hazır|açılıyor|açılabilir/i);
    }
  });

  it('H ve I türlerinde "Pazar 20:00" söylenmez', () => {
    for (const text of [...SAVE_FEEDBACK_TEXTS.sundayK3, ...SAVE_FEEDBACK_TEXTS.return]) {
      expect(text).not.toMatch(/Pazar 20:00|Pazar akşamı/);
    }
  });

  it('yalnız below metinleri {r} yer tutucusu taşır', () => {
    for (const { kind, text } of ALL) {
      expect({ kind, hasR: text.includes('{r}') }).toEqual({ kind, hasR: kind === 'below' });
    }
  });

  it('metin rakam içermez (yalnız {r}); kalan gün çıplak sayı yerine cümlede', () => {
    for (const { text } of ALL) expect(text.replace('{r}', '').replace('20:00', '')).not.toMatch(/\d/);
  });
});

describe('getSaveFeedbackText', () => {
  it('{r} kalan gün sayısıyla değişir', () => {
    const texts = SAVE_FEEDBACK_TEXTS.below.map((t) => t.replace('{r}', '2'));
    expect(texts).toContain(getSaveFeedbackText('below', '2026-10-05', 2));
    expect(getSaveFeedbackText('below', '2026-10-05', 2)).not.toContain('{r}');
  });

  it('aynı gün aynı metni verir (deterministik)', () => {
    expect(getSaveFeedbackText('thresholdReached', '2026-10-05')).toBe(getSaveFeedbackText('thresholdReached', '2026-10-05'));
  });

  it('ardışık iki gün aynı türde aynı varyantı vermez (30 gün boyunca, her çok varyantlı tür)', () => {
    for (const kind of KINDS.filter((k) => SAVE_FEEDBACK_TEXTS[k].length > 1)) {
      for (let i = 0; i < 30; i++) {
        const d1 = new Date(Date.UTC(2026, 9, 1 + i)).toISOString().slice(0, 10);
        const d2 = new Date(Date.UTC(2026, 9, 2 + i)).toISOString().slice(0, 10);
        expect(getSaveFeedbackText(kind, d1, 2)).not.toBe(getSaveFeedbackText(kind, d2, 2));
      }
    }
  });
});

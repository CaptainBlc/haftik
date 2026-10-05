/**
 * Kart v2 (C-yetişkin, "çıkartma albümü") token'ları — kartın TEK renk/eğim/gölge
 * kaynağıdır (28 §4.11 madde 3, R-7). Değerler `docs/inceleme-2026-09-25/17-gorsel-sistem-v2.md`
 * §2.2-2.3'ten birebir; kart tema bağımsızdır (koyu temada da koyulaşmaz).
 *
 * Kurallar (R-15, `__tests__/card/render-contract.test.ts`):
 * - Kart ağacında `elevation`/`shadow*`/`boxShadow` yok; sert gölge = ofsetli `albumDeep` `View`.
 * - Eğim rastgele değildir: yalnız bu dosyadaki sabitler (en fazla iki eğik öğe: unvan + mühür).
 * - Kategori tonu YALNIZCA emoji diskinde kullanılır, seviyeye bağlı değildir; gizli satır ton
 *   almaz (`CARD_COLORS.liner` nötr zemin) ve unvan çıkartması hiçbir zaman kategori tonu taşımaz.
 */
import type { Category } from '@/domain/types';

export const CARD_COLORS = {
  /** Albüm sayfası (kart zemini). */
  album: '#3D2E7C',
  /** Sert gölgenin ve koyu albüm vurgularının rengi. */
  albumDeep: '#211850',
  /** Metin mürekkebi. */
  ink: '#17131F',
  /** Çıkartma yüzü ve beyaz kesim kenarı. */
  paper: '#FFFDF8',
  /** Tek imza vurgusu: unvan çıkartması ve mühür. */
  sun: '#FFD84D',
  /** Arka kâğıt (gizli satır, nötr zemin). */
  liner: '#E7E4EE',
  /** İkincil metin. */
  muted: '#5E5870',
  /** Albüm zemini üstündeki açık metin. */
  onAlbum: '#EDE8FF',
  /** Kart ekranının (kartın DIŞINDAKİ) zemini; kartı kendi sayfasından ayırır. */
  albumScreen: '#2F2463',
} as const;

/** Kategori tonları: eşit parlaklık (0,66-0,73), yalnız emoji diskinde. */
export const CATEGORY_TONES: Record<Category, string> = {
  movement: '#BFE8D2',
  sleep: '#D6CEFF',
  spending: '#FFD4B3',
  social: '#FFCADB',
};

/** Eğim bütçesi: en fazla iki eğik öğe (unvan, mühür). Derece, saat yönü pozitif. */
export const CARD_TILT = {
  title: -1.5,
  seal: 8,
  /** ÖRNEK şeridi (yalnız örnek kartta). */
  sampleStamp: -14,
} as const;

/** Sert gölge ofsetleri (dp, mantıksal 360x640); renk hep `albumDeep`. */
export const CARD_SHADOW_OFFSET = {
  row: { x: 0, y: 3 },
  title: { x: 3, y: 4 },
} as const;

/** Beyaz kesim kenarı kalınlığı (unvan çıkartması). */
export const CARD_CUT_EDGE = 3;

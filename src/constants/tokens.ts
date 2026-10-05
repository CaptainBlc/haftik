/**
 * Kabuk (ekranlar) token'ları, açık ve koyu sütun — 17 §2.2. S19'da yalnız tanımlanır ve
 * kontrast testine bağlanır; ekranlara bağlanması S23'tür (V1b). v1.1'de uygulama açık temaya
 * kilitlidir (`app.json` `userInterfaceStyle: light`, B14 seçenek a); koyu sütun, (b) seçilirse
 * işin S boyutunda kalması için şimdiden yazılıdır.
 *
 * R-7: bu dosya hex literal için izinli yerlerden biridir (`eslint.config.js`).
 */
export interface ShellTokens {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  onAccent: string;
  selFill: string;
  disBg: string;
  line: string;
  danger: string;
  banner: string;
}

export const SHELL_TOKENS: { light: ShellTokens; dark: ShellTokens } = {
  light: {
    bg: '#F5F2EC',
    surface: '#FFFDF8',
    text: '#17131F',
    muted: '#5E5870',
    accent: '#3D2E7C',
    onAccent: '#FFFDF8',
    selFill: '#EAE5F7',
    disBg: '#E7E4EE',
    line: '#DDD6E4',
    danger: '#B42318',
    banner: '#FFF1B8',
  },
  dark: {
    bg: '#17131F',
    surface: '#231D33',
    text: '#F3EFFA',
    muted: '#B3ABC6',
    accent: '#B7A8FF',
    onAccent: '#17131F',
    selFill: '#3A2F63',
    disBg: '#2C2540',
    line: '#3A3350',
    danger: '#FF8A80',
    banner: '#2E2744',
  },
};

/** 4'lük ızgara (17 §2.2); ekran kenarı 24. */
export const SHELL_SPACING = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32, xxxl: 48 } as const;
export const SHELL_RADIUS = { chip: 8, box: 14, button: 16, sticker: 18 } as const;

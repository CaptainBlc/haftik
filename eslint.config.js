// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

/**
 * R-7 (28 §3): renk tek kaynaktır — `src/` içinde `#RRGGBB` string literal'i yasak.
 * İzinli yerler: token dosyaları ve geliştirici aracı.
 * R7_LEGACY_FILES, S19 öncesinden kalan ihlalleri taşıyan dosyalardır; liste YALNIZCA küçülür
 * (`__tests__/infra/color-lint.test.ts` bu listeyi ve dosya başına literal sayısını bir üst sınır
 * olarak sabitler). Bir dosya token'lara geçince buradan ve testteki sınırdan silinir.
 * Test bu iki listeyi aşağıdaki BEGIN/END işaretleri arasından okur; biçimi bozma.
 */
// R7-BEGIN
const R7_ALLOWED_FILES = [
  'src/constants/theme.ts',
  'src/constants/tokens.ts',
  'src/card/tokens.ts',
  'src/dev/**',
];
const R7_LEGACY_FILES = [
  'src/app/_layout.tsx',
  'src/card/CardRevealView.tsx',
  'src/card/CardView.tsx',
  'src/components/locked-card-placeholder.tsx',
  'src/components/settings-view.tsx',
  'src/components/themed-text.tsx',
];
// R7-END

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [...R7_ALLOWED_FILES, ...R7_LEGACY_FILES],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
          message: "R-7: renk literal'i yasak; src/card/tokens.ts veya src/constants/tokens.ts kullan.",
        },
      ],
    },
  },
]);

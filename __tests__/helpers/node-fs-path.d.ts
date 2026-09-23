/**
 * `node:fs` / `node:path` / `__dirname` icin kucuk, elle yazilmis, KAPSAMI
 * DAR ambient bildirimler -- yalnizca
 * `locked-card-placeholder.test.tsx`'in statik kaynak denetiminin kullandigi
 * yuzeyi kapsar. Ayni gerekce ve aynı desen `node-sqlite.d.ts` ile (bkz. o
 * dosya): tam `@types/node` paketine (tsconfig `types` dizisine `"node"`
 * eklemeye) bilerek yaslanmiyoruz, React Native/DOM global tipleriyle
 * catisma riski almamak icin.
 */
declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf-8' | 'utf8'): string;
}

declare module 'node:path' {
  export function resolve(...segments: string[]): string;
}

declare var __dirname: string;

/**
 * S19: ikili dosya okuma (`readFileSync(path)` -> Buffer benzeri) ve iki `node:path` işlevi için dar
 * ambient bildirimler (`ttf-cmap.ts`, `render-contract`, `color-lint`). Aynı gerekçe: tam `@types/node`
 * eklenmez (`node-fs-path.d.ts`). Diğer bildirimlerle birleşir (overload).
 */
declare module 'node:fs' {
  export interface BufferLike {
    readUInt16BE(offset: number): number;
    readUInt32BE(offset: number): number;
    toString(encoding: 'ascii', start: number, end: number): string;
  }
  export function readFileSync(path: string): BufferLike;
}

declare module 'node:path' {
  export function relative(from: string, to: string): string;
  export function basename(path: string, ext?: string): string;
}

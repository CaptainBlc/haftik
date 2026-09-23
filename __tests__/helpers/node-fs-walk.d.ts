/** no-push.test.ts icin ek dar bildirimler (node-fs-path.d.ts ile birlesir). */
declare module 'node:fs' {
  export interface DirEntryLike {
    name: string;
    isDirectory(): boolean;
  }
  export function readdirSync(path: string, options: { withFileTypes: true }): DirEntryLike[];
}

declare module 'node:path' {
  export function join(...segments: string[]): string;
}

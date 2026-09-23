/**
 * `node:sqlite` icin kucuk, elle yazilmis, KAPSAMI DAR bir ambient modul
 * bildirimi -- yalnizca `node-sqlite-driver.ts`'in kullandigi yuzeyi
 * kapsar. Bilerek tam `@types/node` paketine yaslanmiyoruz: proje
 * `tsconfig.json`'da `"types": ["jest"]` ile global tip ekini kisitli
 * tutuyor (bkz. proje CLAUDE.md); `@types/node`'u global olarak eklemek
 * (tsconfig `types` dizisine `"node"` eklemek) `setTimeout` donus tipi gibi
 * React Native/DOM ile catisabilecek global ambient tipler getirebilirdi.
 * Bu dosya o riski almadan, yalnizca ihtiyacimiz olan minimal yuzeyi
 * tanimlar.
 */
declare module 'node:sqlite' {
  export interface StatementResultingChanges {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  export class StatementSync {
    run(...params: unknown[]): StatementResultingChanges;
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }

  export class DatabaseSync {
    constructor(location: string, options?: Record<string, unknown>);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}

/**
 * Asgari TTF `cmap` okuyucusu (yalnızca testler): bir `.ttf` dosyasının hangi Unicode kod
 * noktalarını çizebildiğini söyler. Biçim 4 (BMP) ve biçim 12 desteklenir; yeterli kapsama
 * "glif eksik, sistem fontuna düşer" sınıfını K2'de yakalamak içindir.
 */
import * as fs from 'node:fs';

export function readCmapCodePoints(file: string): Set<number> {
  const buf = fs.readFileSync(file);
  const numTables = buf.readUInt16BE(4);
  let cmapOffset = -1;
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    if (buf.toString('ascii', rec, rec + 4) === 'cmap') cmapOffset = buf.readUInt32BE(rec + 8);
  }
  if (cmapOffset < 0) throw new Error(`${file}: cmap tablosu yok`);

  const count = buf.readUInt16BE(cmapOffset + 2);
  const out = new Set<number>();
  for (let i = 0; i < count; i++) {
    const sub = cmapOffset + buf.readUInt32BE(cmapOffset + 4 + i * 8 + 4);
    const format = buf.readUInt16BE(sub);
    if (format === 4) {
      const segX2 = buf.readUInt16BE(sub + 6);
      const endBase = sub + 14;
      const startBase = endBase + segX2 + 2;
      for (let s = 0; s < segX2 / 2; s++) {
        const end = buf.readUInt16BE(endBase + s * 2);
        const start = buf.readUInt16BE(startBase + s * 2);
        if (start === 0xffff) continue;
        for (let cp = start; cp <= end; cp++) out.add(cp);
      }
    } else if (format === 12) {
      const groups = buf.readUInt32BE(sub + 12);
      for (let g = 0; g < groups; g++) {
        const gs = sub + 16 + g * 12;
        const start = buf.readUInt32BE(gs);
        const end = buf.readUInt32BE(gs + 4);
        for (let cp = start; cp <= end && cp - start < 70000; cp++) out.add(cp);
      }
    }
  }
  return out;
}

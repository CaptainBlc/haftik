/**
 * Döndürülmüş öğenin sınır kutusu (R4: kart sınırından taşan eğik öğe PNG'de kırpılır; 28 §4.11 madde 4).
 * Dönüş öğenin merkezi etrafındadır (`transform: rotate` varsayılanı), kutu merkezi sabit kalır.
 */

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** `box`'ı merkezi etrafında `degrees` (saat yönü pozitif) döndürünce çevreleyen eksen hizalı kutu. */
export function rotatedBounds(box: Box, degrees: number): Box {
  const rad = (Math.abs(degrees) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const width = box.width * cos + box.height * sin;
  const height = box.width * sin + box.height * cos;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  return { x: cx - width / 2, y: cy - height / 2, width, height };
}

/** `inner`, `outer` kutusunun `margin` kadar içinde mi (eşitlik dahil, 1e-9 kayan nokta payıyla)? */
export function fitsWithin(inner: Box, outer: Box, margin = 0): boolean {
  const eps = 1e-9;
  return (
    inner.x >= outer.x + margin - eps &&
    inner.y >= outer.y + margin - eps &&
    inner.x + inner.width <= outer.x + outer.width - margin + eps &&
    inner.y + inner.height <= outer.y + outer.height - margin + eps
  );
}

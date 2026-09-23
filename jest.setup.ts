// S1 (araç zinciri): testlerde deterministik hafta/gün hesapları için saat
// dilimini sabitler. Asıl kaynak `package.json`'daki `test` betiğindeki
// `cross-env TZ=Europe/Istanbul` (Windows/Linux/macOS'ta tutarlı çalışır);
// burası ikinci bir güvence katmanıdır (ör. bu dosya import edilmeden jest
// çalıştırılırsa bile aynı saat dilimi kullanılır).
process.env.TZ = 'Europe/Istanbul';

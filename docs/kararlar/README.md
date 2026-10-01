# Karar kaydı

Bu klasör, geri dönüşü zor veya kamuya açık sözler doğuran kararların tarihli kaydını tutar
(bkz. `docs/inceleme-2026-09-25/28-muhendislik-standartlari-v2.md` §3, öneri İ-7; `docs/inceleme-2026-09-25/29-yol-haritasi.md` A7).
Amaç: "neden böyle yaptık" sorusunun cevabını, kararı veren oturumun bağlamı kaybolduktan sonra da bulunabilir kılmak.

Her karar kaydı: tarih, karar, gerekçe, kimin onayladığı (Batuhan), etkilenen dosyalar/dilimler, geri alma maliyeti.

## Kilit dosyalar
Aşağıdaki dosyalarda bir değişiklik, burada karşılık gelen kararın da güncellenmesini gerektirir (kararsız sessiz sapma yasak):
- `app.json` (paket adı, izinler, tema, versionCode stratejisi) → ilgili karar kaydına bağlanır.
- `src/data/migrations.ts` (şema sürümü) → migration numarası kararına bağlanır.
- `src/domain/content/tr.ts` (içerik havuzu, `CONTENT_VERSION`) → içerik paketi kararına bağlanır.
- `eas.json` (build profilleri, R8/shrink bayrakları) → R8 kapsamı kararına bağlanır.

## İçindekiler
- [2026-09-30-taban-oncesi-kararlar.md](2026-09-30-taban-oncesi-kararlar.md) — Karar A, Ö grubu (7 madde)
- [2026-10-01-taban-oncesi-kararlar-b.md](2026-10-01-taban-oncesi-kararlar-b.md) — Karar A, O grubu (11 madde) — **Karar A tamamlandı: 18/18**

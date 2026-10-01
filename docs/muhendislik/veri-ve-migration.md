# Veri ve migration — şema, node:sqlite, silme

> `src/data/*`'e, şema/migration'a veya silme akışına dokunuyorsan burayı oku.

## Dosyalar

Şema ve migration: `src/data/migrations.ts`. Ölçüm: `src/metrics/report.ts`,
`src/metrics/track.ts`, `src/metrics/report-file.ts`. İçerik havuzu (ölçüm yasak-deseni
taraması bunu da kapsar): `src/domain/content/tr.ts`.

## `node:sqlite` izolasyonu

(2026-09-23, MOB/S5) Repo testleri için `node:sqlite` (Node 22.5+ yerleşik modül) seçildi — yeni bir npm
bağımlılığı **değil**. `better-sqlite3` gibi bir alternatif ekstra native derleme bağımlılığı eklerdi;
`node:sqlite` zaten kurulu, ağ erişimi olan bir paket bile değil. **Kritik kısıt:** `node:sqlite` yalnızca
`__tests__/helpers/node-sqlite-driver.ts` içinde import edilir, `src/data/*.ts`'e **asla** sızdırılmamalı —
Metro bu Node çekirdek modülünü çözemez; `src/` altındaki herhangi bir dosyadan (doğrudan/dolaylı) erişilirse
gerçek `npx expo start`/EAS build "Unable to resolve module node:sqlite" ile kırılır. `src/data/db.ts` yalnızca
`SqlDriver` arayüzünü ve gerçek `expo-sqlite` sürücüsünü taşır. `@types/node` tsconfig `types`'a eklenmedi
(RN'in kendi global tipleriyle çakışma riski); yalnızca kullanılan yüzeyi kapsayan dar bir
`.d.ts` (`__tests__/helpers/node-sqlite.d.ts`) tercih edildi.

## Şema sapmaları (dokümante)

- (2026-09-23, MOB/S5) `weekly_card` şeması spec'in tablosuna iki ek sütun ekler: `title_based_on_categories`
  ve `summary_id`. Spec'in "Veri modeli" tablosu yalnızca `title_id`/`title_text`/`summary_text` sayar, ama
  `src/domain/types.ts` (S2/S3'te dondurulmuş) `TitleResult.basedOnCategories` ve `LineResult.id` alanlarını
  zaten taşıyor — bu sütunlar olmadan `getCard`'ın `CardSnapshot`'ı eksiksiz geri vermesi (round-trip) imkânsız
  olurdu. Özellik değişikliği değil, zaten kilitli domain sözleşmesini karşılamak için gereken tamamlama.
- (A9 kararı, 2026-10-01) N-7 placeholder sütunu (v2 migration'da) **kalır**, dokunulmaz. "Bu sıra numarası
  yakıldı, tekrar kullanılmasın" kuralı: `v2` bir placeholder'dır, sonraki gerçek migration `v3`'tür.

## Migration atomikliği (T7, A10 kararı — **uygulandı 2026-10-01, S14**)

Şema değişikliği yalnızca yeni numaralı migration ile yapılır; yayımlanmış migration düzenlenmez.
**T7:** `runMigrations`/`applyMigrations` (`src/data/migrations.ts`) her migration'ı kendi `BEGIN;`/`COMMIT;`
işleminde çalıştırır; `migration.up(driver)` ve ardından gelen `setUserVersion` aynı işlemin parçasıdır. Hata
olursa `ROLLBACK` — hem şema hem `user_version` migration öncesi durumuna döner, bir sonraki açılışta migration
baştan (aynı sürümden) yeniden dener. Test: `__tests__/data/migrations.test.ts` "T7: atomiklik (kesinti
simülasyonu)" — kasıtlı yarıda kesilen bir migration'ın hiçbir izi kalmadığını ve "düzeltilip yeniden denemenin"
başarıyla tamamlandığını kanıtlar.

Ölçüm şeması genişletmesi (`metric_event`'in CHECK kısıtı yeni olay adı eklemeyi engelliyordu): **ekleme
biçiminde** yeni bir `metric_counter` tablosu (v3, `src/data/migrations.ts`), CHECK kısıtı yok, `UPSERT`
sayaç (`src/data/metric-counter-repo.ts` — `incrementCounter`/`getCounter`/`getAllCounters`, **henüz hiçbir
akışa bağlanmadı**, ilk gerçek kullanım S19+'ta ad kümesini daraltacak). `week_start`/`dim`/`build` bilerek
`NOT NULL DEFAULT ''` (nullable değil) — SQLite'ta composite PRIMARY KEY otomatik NOT NULL olmaz, NULL'lı bir
PK sütunu UPSERT'in güvendiği tekilliği sessizce kırabilirdi. Eski `metric_event` tablosu **silinmez** (silme
kapsamında kalmaya devam eder — `delete-all.ts` güncellendi), yalnızca yeni yazım bu tabloya gidecek. Ad kümesi
TS tipiyle ve sözleşme testiyle korunur (`__tests__/data/metric-counter-repo.test.ts`). Ayrıntı ve gerekçe:
`docs/kararlar/2026-10-01-taban-oncesi-kararlar-b.md` A10; teknik tasarım `docs/inceleme-2026-09-25/
21-mimari-ve-efor.md` §2a ve `27-olcum-v2.md` §2.3 (iki rapor arasındaki fark çözüldü, bkz.
`29-yol-haritasi.md` Ç15). Spec S9'daki "CHECK" ifadesi henüz güncellenmedi (ayrı, küçük belge işi).

**R-9 sözleşme testi (`__tests__/data/delete-all.schema-contract.test.ts`):** tablo adlarını elle listelemez,
`sqlite_master`'ı sorgular; `deleteAllData` sonrası bulduğu HER tablonun 0 satır olduğunu doğrular. Yeni bir
kalıcı tablo eklenip `delete-all.ts`'e eklenmesi unutulursa bu test kırılır.

**TB-10 (`openOrBuildCard`'da `now` zorunlu kılma) bilerek ertelendi:** kendi önceliği düşük ("bugün tek
çağıran doğru, tetik BLG-09/ikinci çağıran eklendiğinde" — `08-muhendislik-tutarlilik.md` TB-10), ve Kritik-1
düzeltmesi (S15, A8 kararı) zaten aynı fonksiyona dokunacak — ikisi birlikte yapılmak daha az çakışma yaratır.

## Kök ErrorBoundary (Ç29 kararı — **uygulandı 2026-10-01, S14**)

`src/app/_layout.tsx`'ten `export function ErrorBoundary({ error, retry })` — `expo-router`'ın route dosyası
sözleşmesi (bkz. `node_modules/expo-router/build/views/ErrorBoundary.d.ts`), aynı dosyanın render'ında fırlayan
her hatayı (en önemlisi `initAppDatabase()`'in render sırasında senkron çağrılması — bir migration hatası
burada yakalanır) kapar. **Kasıtlı olarak yalnızca "Tekrar dene" gösterir, veri silme seçeneği sunmaz**
(tech-lead kararı): `retry()` bileşeni yeniden mount eder, `initAppDatabase`'in `initialized` bayrağı hâlâ
`false` olduğundan migration T7 sayesinde temiz bir sürümden yeniden dener. Kalıcı bir hata için veri silme
yolu ayrı, çift onaylı bir karar olur — şimdi eklenmedi. Test: `__tests__/app/root-error-boundary.test.tsx`.
Genel `useLoad` hook'u (async effect hataları için "render'da fırlat" deseni) henüz eklenmedi — ratchet
yaklaşımı: ilk ihtiyaç duyan ekran eklenince yazılır.

## Silme ve temizlik

"Tüm verilerimi sil" = bildirim iptali (en iyi çaba) + 4 tablo (gelecekte `metric_counter` dahil) tek
transaction + rapor dosyası + kart PNG süpürme + `router.replace('/')`. Yeni bir kalıcı iz (dosya, ayar,
önbellek, yeni tablo) ekleyen herkes onu bu listeye ve `delete-all` testine ekler — bu kural ihlal edilirse
"Tüm verilerimi sil" sözü çürür (bkz. `docs/inceleme-2026-09-25/25-gizlilik-v2.md` kural R-1).

- (2026-09-23, MOB/S9, SEC) Rapor dosyası temizliği ve silme transaction'ı: `deneme-raporu.txt` uygulama
  açılışında ve `deleteAllData`'da idempotent silinir (`src/metrics/report-file.ts`); `cacheDirectory` null ise
  paylaşmadan hata verilir. `deleteAllData` dört DELETE'i tek `exec('BEGIN;...COMMIT;')` ile çalıştırır, hata
  olursa ROLLBACK.
- Silme ve bildirim senkronu **aynı kuyrukta** çalışır (`runDeleteExclusive`) — ayrıntı
  `docs/muhendislik/bildirim-ve-izin.md`.

## Bilinçli kabul edilen küçük riskler (kod değişmedi)

- (2026-09-23, MOB/S9, SEC, N-3) `trackEventOnce` "var mı bak, yoksa yaz" iki adımlıdır, atomik değil; tek
  kullanıcılı/tek iş parçacıklı UI akışında yarış pratikte oluşmaz, en kötü ihtimalle bir olay iki kez sayılır
  (rapor "yaklaşık" okunur).
- (N-5) `metric_event.at` sütunu yazılıyor ama hiçbir hesap/rapor kullanmıyor (rapor tarih taşımaz kuralı
  gereği). Yeni `metric_counter` tasarımında `at` sütunu hiç yok (bilinçli, bkz. yukarıdaki A10 notu).

## Deneme raporu "anonim" değildir

(2026-09-23, MOB/S9, SEC, I-3) Rapor içerik/kimlik/tarih taşımaz ama Batuhan raporu bilinen bir tanıdık grupta
(WhatsApp/mesaj) alırsa göndereni kendi hesabıyla/takma adıyla birleştirebilir. Metinlerde "anonim" yerine
"kimlik/içerik içermez, takma adlı olabilir" yazılır.

## Deep link ile uygunluk atlanamaz

(2026-09-23, MOB/S9, SEC, I-1) `haftik://card/<Pazartesi>` doğrudan kart ekranını açabilir; bu yüzden
`openOrBuildCard` çağıran katmana güvenmez, kayıtlı kart yoksa `getWeekState().unlocked` (dolu gün eşiği +
Pazar 20:00) kendisi doğrular, uygun değilse `notReady` döner ve ekran `/week`e yönlendirir (kart yazılmaz,
`card_opened` sayılmaz). Deep link `weekStart` parametresi `src/lib/week-param.ts` ile doğrulanmadan
`openOrBuildCard`/`saveCard`a ulaşamaz.

## Rapor içeriği yasak deseni

(2026-09-23, MOB/S9) Rapor metninde emoji, takvim tarihi, epoch, kategori adı (İngilizce/Türkçe), kimlik yok
(mekanik: `__tests__/metrics/report.test.ts`). Rapora yeni alan eklerken bu taramayı bozma; tarih yerine gün
ofseti kullan.

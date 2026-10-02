# 2026-10-01 — Taban öncesi kararlar (Karar A, O grubu)

Onaylayan: Batuhan (tek tek, AskUserQuestion ile). Kaynak: `docs/inceleme-2026-09-25/29-yol-haritasi.md` §4.A.
Karar A artık **18/18 tamam** (bkz. `2026-09-30-taban-oncesi-kararlar.md` — Ö grubu, 7 madde).
Durum: kararlar kilitlendi, kod uygulaması henüz yapılmadı. Her madde uygulandığında bu dosyaya
"Uygulandı: <tarih>, <commit/dilim>" notu düşülür.

## A1 — Proje yolu
`C:\dev\haftik`'e taşınacak (robocopy + git history korunarak). Batuhan'ın kendi eylemi (Faz 0, F0-3).
Sonraki tüm emülatör (K4) kanıtları bu yolda üretilir.

## A2 — Uzak depo ve CI
Özel (private) GitHub deposu açılacak, `main` ve etiketler oraya itilecek. CI: Node 24, `npm run verify`
push'ta otomatik çalışır. Batuhan'ın kendi eylemi (Faz 0, F0-2) + **S13** içinde CI dosyası.

## A3 — Pre-commit hook
Hızlı hook eklenir (typecheck + lint + ilgili testler). 10 saniyeyi aşarsa kaldırılır.
Uygulanacağı dilim: **S13**.

## A4 — Ölü kod silme
`spike/`, `__tests__/spike/`, `reset-project.js` ve web yığını (react-native-web, react-dom, ilgili
bağımlılıklar) **tamamı** silinir — grep ile hiçbir yerden referans verilmediği doğrulandı (08-TB-3/7/8).
Uygulanacağı dilim: **S13**.

## A6 — CLAUDE.md ayıklaması
Commit'ten (A1/A2) hemen sonra yapılır — taban biterken değil, en başta. 750 satır → 250'nin altına;
ayrıntı `docs/muhendislik/`'e taşınır, hiçbir ders silinmez. 9 ekip dersi `~/.claude/team/ortak-standartlar.md`'ye
eklenir. Uygulanacağı dilim: **S13b**, A2'den hemen sonra.

## A8 — Kritik-1 eşik kuralı
**Çözüm B** onaylandı: eşik, kartın kendisinden değil check-in geçmişinden türer; kart açmak hiçbir haftayı
yeniden kilitleyemez. Spec'teki "ilk kart" tanımı buna göre güncellenir. Monotonluk özellik testi eklenir.
Uygulanacağı dilim: **S15** (T1).
**Uygulandı: 2026-10-01 (S15, T1).** `src/domain/week.ts` — yeni saf fonksiyon `hasQualifiedWeekBefore`,
`getWeekState`'in `hasAnyPriorCard` parametresi `hasQualifiedWeekBefore` oldu (dokümante edilmiş imza değişikliği).
`src/data/checkin-repo.ts` — yeni `getCheckinsBefore`. Üç çağıran güncellendi: `week.tsx` (+ `handleLockedPress`'e
`hasCard` güvenlik ağı), `open-card.ts`, `notify/wiring.ts` (+ `notify/sync.ts`, `domain/notify-plan.ts`).
`src/lib/week-status-copy.ts`: `cardSeen` artık `thresholdMet`/`timeMet`'ten ÖNCE kontrol ediliyor (ikinci
güvenlik ağı). `card-repo.ts`'teki artık ölü `hasAnyPriorCard()` kaldırıldı. Monotonluk özellik testi:
`__tests__/domain/week.monotonic.test.ts` (yeni dosya; dondurulmuş `week.test.ts`'e dokunulmadı, yalnızca
içindeki `hasAnyPriorCard:` anahtarları mekanik olarak `hasQualifiedWeekBefore:` ismine yeniden adlandırıldı —
A8'in açıkça onaylanan, dokümante edilmiş sonucu). Ayrıca etkilenen test dosyaları: `notify-plan.test.ts`,
`sync.test.ts`, `week-route.test.tsx` (mock güncellemesi), `card-repo.test.ts` (ölü kod testleri silindi),
`wiring.test.ts` (B-2 testi artık DÜZELTİLMİŞ davranışı doğruluyor). `npm run verify`: 73 suite / 873 test yeşil.

## A9 — Eski placeholder sütunu (N-7)
Kalır, dokunulmaz. Şemaya "bu sıra numarası yakıldı, tekrar kullanılmasın" notu düşülür.
Uygulanacağı dilim: **S14** (not olarak; kod değişikliği yok).
**Uygulandı: 2026-10-01** (`src/data/migrations.ts` migration v3 yorumu — "v2 numarası yakıldı" kuralı not düşüldü).

## A10 — Ölçüm şeması (v3)
**Ekleme biçiminde** `metric_counter` tablosu eklenir (CHECK kısıtı yok, `UPSERT` sayaç). Eski `metric_event`
tablosu **silinmez** (silme kapsamında kalmaya devam eder), yalnızca yeni yazım durur. Ad kümesi TS tipiyle
ve sözleşme testiyle korunur. Spec S9'daki "CHECK" ifadesi güncellenir.
**Uygulandı: 2026-10-01** (S14) — `src/data/migrations.ts` (v3 migration, `week_start`/`dim`/`build` bilerek
`NOT NULL DEFAULT ''`, NULL'lı composite PK tuzağından kaçınmak için), `src/data/metric-counter-repo.ts`
(henüz hiçbir akışa bağlanmadı, S19+'ta ilk gerçek olay eklenince ad kümesi daralır). Testler:
`__tests__/data/migrations.test.ts` (kesinti simülasyonu + v2→v3 round-trip), `__tests__/data/
metric-counter-repo.test.ts`. T7 (migration atomikliği, BEGIN/COMMIT + rollback) aynı değişiklikte yapıldı.
`delete-all.ts` güncellendi, R-9 sözleşme testi eklendi (`__tests__/data/delete-all.schema-contract.test.ts`
— `sqlite_master`'ı mekanik tarar, yeni tablo eklenip silme listesine eklenmezse kırılır). Spec S9'daki CHECK
ifadesi henüz güncellenmedi (dokümantasyon işi, ayrı not).
Uygulanacağı dilim: **S14**.

## A12 — Bildirim kanalı sesi
**Sesli** (DEFAULT önem, sistem bildirim sesi). İki kanal: `daily` (günlük hatırlatma), `card-ready` (kart hazır).
Kullanıcı sistem ayarından değiştirebilir. Uygulanacağı dilim: **S15/S23** (kanal tanımı S15, Ayarlar'daki
anahtarlar S23).
**Kanal tanımı uygulandı: 2026-10-01 (S15).** `src/notify/scheduler.ts`: `NOTIFICATION_CHANNEL_IDS`
(`daily`, `card-ready`), isimler "Günlük hatırlatma"/"Kart hazır", `AndroidImportance.DEFAULT`,
`sound: 'default'`. `ensureChannel()` ikisini de oluşturur, eski tek kanalı (`hhk-reminders`) en
iyi çabayla siler. `replaceAll` her bildirimi kendi `kind`ine ait kanala planlar. Ayarlar'daki
ayrı "Kart hazır" anahtarı hâlâ S23'e kalıyor (bu turda yalnızca kanal tanımı yapıldı).

## A16 — İnternet ve izin temizliği
**Önerilen sıra onaylandı:**
1. Yerel release APK ile emülatörde referans ağ ölçümü (EAS kotası harcamadan).
2. INTERNET izni **yalnız release derlemesinden** config plugin ile kaldırılır (debug/Metro etkilenmez).
3. Gereksiz izinler engellenir: rozet izinleri (~16), `c2dm.permission.RECEIVE` (koşullu), install referrer,
   `ACCESS_NETWORK_STATE`. `WAKE_LOCK` ilk build'de kalır (ikisi de rapor aynı sonuca varıyor).
4. `aapt2 dump permissions` çıktısından "altın izin listesi" dosyası üretilir, gelecekte elle sayılmaz.
Uygulanacağı dilim: **S17** (yeni dilim).
**Uygulandı: 2026-10-02 (S17).** `plugins/permission-policy.js` (tek kaynak, altın liste dahil),
`plugins/with-permission-policy.js` (22 izin `blockedPermissions`, `INTERNET` yalnız release overlay'den
kaldırılır), `scripts/check-apk-permissions.js`. **K4-rel kanıtı (yerel release APK, x86_64):**
`aapt2 dump permissions` = yalnız VIBRATE, RECEIVE_BOOT_COMPLETED, POST_NOTIFICATIONS, WAKE_LOCK,
`<appId>.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` (script `OK`, çıkış 0). Mekanik "ağ yok" kanıtı: emülatörde
çalışan sürecin `Groups` satırında `inet` gid'i (3003) YOK (yeni APK: 9997 20210 50210), kontrol olarak eski
INTERNET'li release APK'da VAR (3003 9997 20211 50211). Release APK emülatörde açılıyor, onboarding + izin
diyaloğu çalışıyor, logcat'te `FATAL`/`SecurityException` yok. **Atlanan adım:** Ç6'nın (1) "kaldırmadan ÖNCE
referans ağ ölçümü" (pcap) yapılmadı; kaldırma zaten `inet` gid ile mekanik kanıtlandığı için ikincil kanıt
olarak kaldı (22 §1.4). Kalan: 0.1.0 ile gerçek cihazda PCAPdroid (K5); R-01..R-27 tam matris S18'de.

## A17 — Cihazdan cihaza aktarım
**Gerçekten kapatılacak**: `dataExtractionRules` eklentisi ile Android D2D aktarımı (bulut yedeği zaten
`allowBackup:false` ile kapalıydı, ama cihazdan cihaza — kablolu/kablosuz — açık kalmıştı). Onboarding ve
site metnindeki "telefon değişirse veri taşınmaz" sözü artık doğru olacak. 0.2.0'dan önce, geri dönüşü zor
bir yapılandırma kararı. Uygulanacağı dilim: **S17**.
**Uygulandı: 2026-10-02 (S17).** `plugins/with-data-extraction-rules.js`. K4-rel: release APK manifestinde
`android:dataExtractionRules=@xml/data_extraction_rules` (aapt2 xmltree) ve kaynak pakette (`aapt2 dump
resources`). **Kalan:** GMS'li imajda D2D test modu (`bmgr`, 22 §1.5) ve OEM aktarım araçları (K5) henüz
denenmedi — onboarding/site metnindeki "telefon değişirse veri taşınmaz" sözü bu doğrulamadan sonra tam kanıtlı sayılır.

---

## Karar A tamamlandı: 18/18

| Grup | Madde sayısı | Durum |
|---|---|---|
| Ö (düşük riskli) | 7 | ✅ Onaylandı (`2026-09-30-taban-oncesi-kararlar.md`) |
| O (onay şart) | 11 | ✅ Onaylandı (bu dosya) |

Sıradaki karar grupları: **B** (çekirdekten önce, 14 madde), **C** (denemeden önce, 10 madde),
**D** (ikinci yapı ve sonrası, 10 madde) — bkz. `29-yol-haritasi.md` §4.B/C/D. Bugün cevap gerekmiyor.

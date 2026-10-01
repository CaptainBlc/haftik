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

## A9 — Eski placeholder sütunu (N-7)
Kalır, dokunulmaz. Şemaya "bu sıra numarası yakıldı, tekrar kullanılmasın" notu düşülür.
Uygulanacağı dilim: **S14** (not olarak; kod değişikliği yok).

## A10 — Ölçüm şeması (v3)
**Ekleme biçiminde** `metric_counter` tablosu eklenir (CHECK kısıtı yok, `UPSERT` sayaç). Eski `metric_event`
tablosu **silinmez** (silme kapsamında kalmaya devam eder), yalnızca yeni yazım durur. Ad kümesi TS tipiyle
ve sözleşme testiyle korunur. Spec S9'daki "CHECK" ifadesi güncellenir.
Uygulanacağı dilim: **S14**.

## A12 — Bildirim kanalı sesi
**Sesli** (DEFAULT önem, sistem bildirim sesi). İki kanal: `daily` (günlük hatırlatma), `card-ready` (kart hazır).
Kullanıcı sistem ayarından değiştirebilir. Uygulanacağı dilim: **S15/S23** (kanal tanımı S15, Ayarlar'daki
anahtarlar S23).

## A16 — İnternet ve izin temizliği
**Önerilen sıra onaylandı:**
1. Yerel release APK ile emülatörde referans ağ ölçümü (EAS kotası harcamadan).
2. INTERNET izni **yalnız release derlemesinden** config plugin ile kaldırılır (debug/Metro etkilenmez).
3. Gereksiz izinler engellenir: rozet izinleri (~16), `c2dm.permission.RECEIVE` (koşullu), install referrer,
   `ACCESS_NETWORK_STATE`. `WAKE_LOCK` ilk build'de kalır (ikisi de rapor aynı sonuca varıyor).
4. `aapt2 dump permissions` çıktısından "altın izin listesi" dosyası üretilir, gelecekte elle sayılmaz.
Uygulanacağı dilim: **S17** (yeni dilim).

## A17 — Cihazdan cihaza aktarım
**Gerçekten kapatılacak**: `dataExtractionRules` eklentisi ile Android D2D aktarımı (bulut yedeği zaten
`allowBackup:false` ile kapalıydı, ama cihazdan cihaza — kablolu/kablosuz — açık kalmıştı). Onboarding ve
site metnindeki "telefon değişirse veri taşınmaz" sözü artık doğru olacak. 0.2.0'dan önce, geri dönüşü zor
bir yapılandırma kararı. Uygulanacağı dilim: **S17**.

---

## Karar A tamamlandı: 18/18

| Grup | Madde sayısı | Durum |
|---|---|---|
| Ö (düşük riskli) | 7 | ✅ Onaylandı (`2026-09-30-taban-oncesi-kararlar.md`) |
| O (onay şart) | 11 | ✅ Onaylandı (bu dosya) |

Sıradaki karar grupları: **B** (çekirdekten önce, 14 madde), **C** (denemeden önce, 10 madde),
**D** (ikinci yapı ve sonrası, 10 madde) — bkz. `29-yol-haritasi.md` §4.B/C/D. Bugün cevap gerekmiyor.

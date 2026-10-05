# Uygulama günlüğü (taban dilimleri S13-S18)

> CLAUDE.md'nin "Açık kararlar ve cihaz maddeleri" bölümünden **2026-10-02'de taşındı** (CLAUDE.md
> ayıklaması #2): hiçbir kayıt silinmedi, yalnızca "ne zaman ne yapıldı" günlüğü burada tutulur.
> CLAUDE.md yalnızca **aktif kuralları ve açık işleri** taşır. Yeni bir dilim bitince buraya
> (tarihiyle, K seviyesiyle) eklenir; CLAUDE.md'ye yalnızca durum satırı güncellenir.
> Karar kayıtları: `docs/kararlar/`; konu ayrıntıları: `docs/muhendislik/`.

## Günlük (kronolojik, taşındığı hâliyle)

**Uygulandı (tarihiyle, kod/test var):** Node ≥24 + ölü kod/web yığını temizliği, CI/
dependabot/pre-commit, CLAUDE.md ayıklaması (hepsi 2026-10-01, S13) · migration atomikliği T7 +
ölçüm şeması `metric_counter` v3 (A10) + N-7 not (A9) + kök ErrorBoundary (Ç29) (2026-10-01, S14)
· **S15 Yollar ve bildirim TAMAMLANDI** (2026-10-01): T1 Kritik-1 eşik kuralı B + monotonluk testi
(A8) + Pazar'da çift bildirim düzeltmesi (A13); T2 kaçırılan hafta yolu (`findOpenableWeeks` + Hafta
banner'ı); T3 bildirim tıklaması yönlendirmesi (sabit rota tablosu, soğuk/sıcak açılış); A12 iki
bildirim kanalı tanımı (sesli, DEFAULT önem); V-03 izin diyaloğu geri tuşu düzeltmesi; 22 §4.4
teslim edilmiş bildirimleri kaldırma. Ayrıntı ve iki React hooks lint tuzağı (sonsuz render,
render-sırasında ref yazımı): `docs/muhendislik/bildirim-ve-izin.md`. Kararlar:
`docs/kararlar/2026-09-30-taban-oncesi-kararlar.md` (A13) ve `2026-10-01-taban-oncesi-kararlar-b.md`
(A8, A12). `now` zorunlu kılma (TB-10) S14/S15 T1/S15 T3 boyunca üç kez bilerek ERTELENDİ (hiçbiri
gerektirmedi; sıradaki `open-card.ts` dokunuşunda ele alınabilir). K4 (sıcak/soğuk açılış emülatör
kanıtı) bu ortamda YOK. `npm run verify`: 77 suite / 924 test yeşil, 3 atlandı.
· **S16b TAMAMLANDI** (2026-10-02): T6 açık tema kilidi (A11); güvenli silme (VACUUM +
wal_checkpoint, secure_delete); silme/kayıt/yükleme hatası geri bildirimi (Silinemedi,
Kaydedilemedi, LoadErrorView); A11Y-01..06 + 15; paylaşım dosyası adanmış haftik-share/ dizininde
sabit tarihsiz Haftik-kart.png, paylaşım sonrası SİLİNMEZ (04 #4), yaşa göre süpürme + silmede dizin
komple; sürüm satırı (Ayarlar, build/kanal/commit/şema); rapor v2 + tam metin önizleme (Modal) +
seq. Ayrıntı: docs/muhendislik/{kart-render,veri-ve-migration}.md. K4-rel (R8li release, emülatör):
sürüm satırı, rapor önizleme/paylaşım seçici, kart PNG 1080x1920 (metadata yok), saat atlamasıyla
yaşa göre süpürme, silmede dizin gitti. KALAN: K5 başarılı paylaşım hedefi (WhatsApp), koyu moddaki
cihazda 3 ekran (K4), 6 Önemli A11Y bulgusunun yeniden ölçümü, rapor v2 eksik alanlar (S19+
olayları) ve v2 birleştirme betiği. Batuhan onayı bekleyen yeni metinler (copywriter): Silinemedi /
Kaydedilemedi / Yüklenemedi + Tekrar dene, rapor önizleme girişi.
· **S17 Platform yapılandırması** (2026-10-02): `plugins/` altında 3 config plugin (`permission-policy`
tek kaynak + `with-permission-policy` + `with-data-extraction-rules`), `scripts/check-apk-permissions.js`.
Release APK izinleri altın listeyle birebir (INTERNET release'ten kalktı, debug/Metro'da duruyor), süreçte
`inet` gid'i yok (mekanik kanıt; kontrol APK'da var), `dataExtractionRules` APK'da, A12 kanalları cihazda
doğrulandı. Ayrıntı: `docs/muhendislik/bildirim-ve-izin.md`. **Kalan (cihaz):** D2D test modu (`bmgr`),
OEM aktarım (K5), 0.1.0'da PCAPdroid. Yerel release derlemesi: `android/` içinde `ANDROID_HOME=
C:\Users\Pc\AppData\Local\Android\Sdk ./gradlew assembleRelease -PreactNativeArchitectures=x86_64` (~2 dk).
· **S18 Boyut/R8** (2026-10-02): R8 + kaynak küçültme `expo-build-properties` ile açık (ilk denemede çalıştı, ek
keep kuralı gerekmedi), `react-native-reanimated` package.json'dan çıkarıldı VE `react-native.config.js` ile native
derlemeden dışlandı (npm peer'i zaten kuruyordu). Release x86_64 APK 44,48 -> **31,98 MB**; izinler hâlâ altın liste.
K4-rel (R-1..R-8, R-21/22, R-24): açılış, check-in, bildirim planı, reboot ve güncelleme (R8'siz->R8'li dahil)
sonrası alarmlar korundu, Pazar kart akışı + paylaşım seçicisi + rapor + silme çalıştı, hata satırı 0. Ayrıntı ve
yapılmayanlar (R-23 API<31, R-25, Doze, başarılı paylaşım hedefi, AAB): `docs/muhendislik/arac-zinciri.md`.
`mapping.txt` her release'te saklanmalı (`C:\dev\haftik-artifacts\`, repo dışı); EAS `buildArtifactPaths` doğrulanmadı.
`npm run verify`: 79 suite / 944 test yeşil.
- **S16a İçerik ve adlandırma** (2026-10-03; metin onayı Batuhan'da, bkz. `docs/s16a-metin-onayi.md`): `src/domain/content/tr.ts`
  `CONTENT_VERSION` 2 — 40 unvan, 36 satır, 12 özet metni yeniden yazıldı (zamansızlaştırma: kartta "bu hafta" yok, yalnızca iç
  kıyas "geçen haftaya göre"; yargı/damga/tıbbi dil, "mod", "kumbaracı", banka kartı sesteşliği ve "vites" temizlendi;
  02 M-2/M-3/M-4 metinleri her tetiklenme durumunda doğru). Seviye kelimeleri (A14): uyku kısa/orta/uzun, sosyal
  sakin/orta/kalabalık. `notification-texts.ts`: `card-ready` "Haftanın kartı hazır", `daily` 4 varyantlı havuz,
  `getNotificationText` haftanın gününe göre deterministik. Karşılama, paylaşım mesajı, rapor metni, site ve mağaza
  belgesi (8 saniye -> birkaç saniye, check-in -> işaretleme, "karne" -> "kart", App Store adı "Haftik: Haftalık Emoji
  Kartı"). Mekanik: `__tests__/domain/content-lint.test.ts` (L1 yasak sözcük, L5 özette seviye sözcüğü yok, L6 zaman
  zarfı, uzunluk, imge kotaları, "vites" 0), `__tests__/infra/naming-lint.test.ts` (R-12/L3 "karne" 0, "8 saniye" yok,
  `textTransform`/`toUpperCase` yasağı). T4 damga: kart damgası zaten `Haftik · [mağaza bağlantısı]`; "HAFTANIN UNVANI" bandı
  C yönü çizimiyle (S19) gelecek. Kapsam dışı bırakılan: gizli çıkartma alt yazısı (S19), karşılama dışındaki onboarding
  metinleri/ÖRNEK kart/18 yaş notu (19 §3.3), havuz genişletme (~190 yeni metin, 19 §4.3) ve L2/L4/L7 lint'leri. Site gizlilik
  sayfasında iki gerçek düzeltme (bildirim örneği, paylaşım dosyası silme cümlesi; K10 kapısı). `npm run verify`: 86 suite /
  1203 test yeşil, 3 atlandı (K2; emülatör K4 yapılmadı).
- **S19 Kart v2 — bağımsız kısım** (2026-10-05; kısmi, P0/F0-9 kapısı açık): token'lar (kart + kabuk açık/koyu), R-7 renk
  lint'i (eski ihlaller küçülen izin listesinde), P-6 satır kimliği dondurma, Fraunces+Inter v2 fontları (glif kapsaması
  `.ttf` cmap'inden), `<Sticker>`, döndürülmüş kutu geometrisi, R-15 madde 1/3/8, R1 yakalama çerçevesi
  (`CardView captureFrame`), 6 kartlık fikstür verisi. `CardView` v2, `LevelMark`, gizli satır görünümü, Story bandı ve
  `layout.test.ts` değişikliği P0 sonucuna ve Batuhan'ın onayına bağlı, yapılmadı. R1 K4 yapıldı (2026-10-05): kenar geçişi 2,0x'te 2,27 -> 1,11 px, 2,625x'te 1,81 -> 1,13 px; ayrıntı kart-render.md.
  Ayrıntı: `docs/muhendislik/kart-render.md`. `npm run verify`: 94 suite / 1288 test yeşil, 3 atlandı.
- **S22 Günlük an — kısmi** (2026-10-05; metin onayı Batuhan'da, `docs/s22-metin-onayi.md`): Kaydet mikro-anı. Ekrana
  yeni diyalog yok; mevcut iki yuva dönüşüyor. İpucu satırı kayıttan sonra ilerleme cümlesine döner (11 tür, A-I + yedek;
  `src/domain/content/save-feedback-texts.ts`, karar `src/lib/save-feedback.ts`, yalnız gün sayısı ve zamandan türer,
  seviye/kategori girdisi yok), aynı cümle `announceForAccessibility` ile okunur (A11Y-07). Düğme yuvası durumlu:
  Kaydet -> ✓ Kaydedildi -> (seçim değişirse) Güncelle; bekleyen geçen hafta kartı varsa kilit kalkınca "Geçen haftanın
  kartını aç" (B8). `useSingleFlight` (M-9): ref tabanlı tek uçuş + 900 ms kilit, hatada kilit hemen açılır. Basılı 0,97.
  `check_in_saved` çift dokunuşta bir kez sayılır. **K4 (release APK, emülatör):** 0,4-0,6 sn'deki karede cümle ve
  "✓ Kaydedildi" görünüyor; kilitten sonra yuva kart düğmesine dönüyor ve kart açılıyor; iki hızlı dokunuş DB'de yalnız
  1 `check_in_saved` bıraktı (3 kayıt = 3 olay); `FATAL`/`InvalidClass`/`SecurityException` 0 satır. **Yapılmadı:** haptik
  (`expo-haptics` S20), bugünün noktasının dolması (Bugün'de nokta satırı henüz yok, S23), 120 ms çapraz geçiş,
  kayıt hatası cümlesi (X; S16b metin onayına bağlı), "4+ gün sonra Yeni bir hafta, temiz sayfa" boş durum satırı,
  Pazar K3'te mikro-an yok kuralı (K3'te ekran zaten kart ekranına geçiyor). Ekran okuyucu duyurusu yalnız K2 (TalkBack K4/K5 yok).
  `npm run verify`: 98 suite / 1333 test yeşil, 3 atlandı.

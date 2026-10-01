# 24 — Güvenlik v2: saldırı yüzeyi, gizlilik sözünün kanıtı, yeni yapı (Haftik)

**GENEL SONUÇ: Kodda veri sızıntısı, ağ çağrısı veya sır yok (K1). Ama gizlilik sözünün iki cümlesi bugün kanıtsız ya da yanlış olabilir: "ağ yok" (release manifestte INTERNET + dormant Firebase yığını, ölçüm yok) ve "telefon değişirse veri taşınmaz" (targetSdk 36'da `allowBackup=false` cihazdan cihaza aktarımı kapatmıyor). İkisi de ucuz yapılandırma işiyle kapanır. Yeni yüzeyler içinde en riskli olan yerel dışa/içe aktarma; v1.5'e girmemeli.**

Tarih: 2026-09-28. Hazırlayan: security-reviewer (Principal). Kod, `app.json`, test ve emülatöre dokunulmadı; commit yok.
Karar Batuhan'ındır. Bu belge hukuki görüş değildir.

**Kanıt dili:** K1 = kaynak/doküman okuması; **K1-rel** = yerel release derlemesinin ara çıktısının okunması
(`C:\hhk\haftik\android\app\build\intermediates\packaged_manifests\release\processReleaseManifestForPackage\AndroidManifest.xml`,
12-performansın 2026-09-28 derlemesi, güncel `app.json` ile, debug anahtarı, EAS değil). K2 birim testi, K4 emülatör, K5 cihaz/preview APK.
Bu turda komut çalıştırma aracım yoktu: **`npm audit` yeniden koşulamadı** (bölüm 3).

## Özet

1. **SEC2-1 (Important, yeni):** D2D aktarım açık (M7). Onboarding ve site metni buna göre yanlış olabilir. Seçenek: `dataExtractionRules` ile kapat ya da metni düzelt.
2. **SEC2-2 (Important):** "Ağ yok" hâlâ K1. Release manifestte INTERNET, ACCESS_NETWORK_STATE, c2dm + exported FCM alıcısı, FirebaseInitProvider, Installations ve datatransport var. Yeni kanıt: derlemede `google_app_id` yok, yani Firebase başlatılmıyor (K1-rel, çıkarım). Öneri: release profilinde INTERNET'i engelle (mekanik garanti), Firebase bileşenlerini manifestten sil, bir kez PCAPdroid ile ölç (1.3).
3. **SEC2-3 (Nit→Önemli):** 17 rozet izni + install referrer gereksiz; engellenmeli.
4. **Açık S10 kalemleri:** silme hatası sessiz (04 #7, Important), migration atomik değil (04 #3; yeni şemadan önce şart), N-1/N-3/N-6/N-7/N-9.
5. **Yeni yüzeyler (2):** paylaşım biçimlerinde "gizli yuva piksel-özdeş" kuralı ve tarihsiz dosya adı; Karnelerim için "her tablo silinir" sözleşme testi; bildirim tıklaması yalnız sabit rota tablosuyla; widget ve dışa aktarma v2.
6. **Bağımlılık (3):** `decode-uri-component` advisory'si artık CVE-2026-45822; düzeltme 0.5.0 ve yalnız ESM, `overrides` işe yaramaz; risk kabulü + izleme. SVG/gradient/font paketleri için 7 adımlı ağ kontrolü.
7. **N-9 (4):** global FLAG_SECURE önermiyorum (kart ekran görüntüsünü de engeller). Öneri: yalnız son uygulamalar küçük resmini gizle (Android 13+ `setRecentsScreenshotEnabled(false)`); uygulama kilidi v2, isteğe bağlı.

## 1. Güncel güvenlik durumu

### 1.1 Release merged manifest: satır satır (K1-rel)

| # | Öğe (satır) | Kaynağı | Risk | Kaldırma yolu | Kanıt / açık |
|---|---|---|---|---|---|
| M1 | `INTERNET` (l.11) | Expo şablonu + `expo-file-system` + firebase | "Ağ yok" sözünü mekanik olarak kanıtsız bırakır. Kod ağ çağırmıyor (K1) | Yalnız `preview`/`production` profilinde `blockedPermissions` (`app.config.js` + EAS env). Metro/dev için izin kalır | K1-rel var, K5 ölçüm yok |
| M2 | `ACCESS_NETWORK_STATE` (l.37), `WAKE_LOCK` (l.38) | firebase-messaging / expo-notifications | Düşük (normal izin, veri yok) | ACCESS_NETWORK_STATE engellenebilir. **WAKE_LOCK engellenmemeli:** minSdk 24'te bildirim servisi wake lock alırsa `SecurityException` riski (doğrulanmadı) | K1-rel |
| M3 | `c2dm.permission.RECEIVE` (l.39) + `FirebaseInstanceIdReceiver` **exported** (l.173-184) | firebase-messaging (expo-notifications `build.gradle:43`) | Uzak push kabul yüzeyi. Alıcı `c2dm.SEND` izniyle korunuyor (yalnız Google Play Hizmetleri gönderebilir), kötü niyetli uygulama tetikleyemez. FCM token'ı yok, uzak push fiilen çalışmaz | `blockedPermissions` + config plugin'le `tools:node="remove"` (M4 ile birlikte) | K1-rel |
| M4 | `FirebaseInitProvider` (l.226, her süreç başlangıcında çalışır), `ComponentDiscoveryService` (Messaging, **Installations**, **datatransport**, l.197-219), datatransport servis/alıcıları (l.279-294) | firebase-messaging'in transitif bağımlılıkları | Data Safety "Device or other IDs" ve "ağ yok" sözü açısından asıl soru. **Yeni kanıt (K1-rel):** derleme ara çıktılarında `google_app_id`/`gcm_defaultSenderId` kaynağı **yok** (grep, `values*.xml`, 0 eşleşme). Bu durumda FirebaseApp otomatik başlatılmaz; Installations/FCM/datatransport çalışmaz. Çıkarım, ölçüm değil | Config plugin'le bu bileşenleri manifestten silmek. Firebase zaten başlatılmadığı için çalışma zamanı etkisi beklenmez; yine de bildirim planlama, teslim, reboot, dokunma K4'te yeniden koşulur. Gradle'da firebase'i dışlamak **uygun değil** (expo-notifications Kotlin kodu sınıflara bağlı, derleme kırılır) | K1-rel; K5 (PCAPdroid) açık |
| M5 | `BIND_GET_INSTALL_REFERRER_SERVICE` (l.46) | `expo-application` (`build.gradle:18`, installreferrer 2.2), expo-notifications'ın bağımlılığı | Düşük: uygulama referrer API'sini çağırmıyor; Play'e yerel IPC. Gereksiz "kurulum kaynağı" yeteneği | `blockedPermissions` | K1 |
| M6 | 17 satıcı rozet izni (l.52-67) | `ShortcutBadger` (expo-notifications `build.gradle:45`) | Düşük-orta: en az yetki ilkesine aykırı; Huawei/OPPO `launcher...READ_SETTINGS` başlatıcı ayarlarını okuma yetkisi. Uygulama rozet kullanmıyor (`scheduler.ts:206` `shouldSetBadge:false`). Mağaza izin listesinde gürültü | Hepsi `blockedPermissions`'a; K4: bildirim gösterimi bozulmuyor mu | K1-rel; kaldırmanın çalışma zamanı etkisi doğrulanmadı |
| M7 | `allowBackup="false"` (l.71), **`dataExtractionRules` yok** | `app.json:22` | **SEC2-1.** targetSdk 36'da (l.9) `allowBackup=false` yalnız bulut yedeğini kapatır; **cihazdan cihaza (D2D) aktarım açık kalır** ([Android Auto Backup](https://developer.android.com/identity/data/autobackup), [`<application>`](https://developer.android.com/guide/topics/manifest/application-element)). "Telefon değişirse veri taşınmaz" (`onboarding/privacy.tsx:16`) ve "yedekten hariç" (`site/gizlilik.html:69`) yeni telefona aktarımda yanlış çıkabilir | (a) Config plugin: `res/xml/data_extraction_rules.xml`, `<cloud-backup>` ve `<device-transfer>` altında tüm alanlar `exclude` + manifest özniteliği; ya da (b) metni düzelt | K1 (manifest + doküman). K5: iki cihazla D2D ya da Android'in `bmgr` D2D test yolu (komut doğrulanmalı) |
| M8 | `expo.modules.updates.*` meta-data (l.80-91) | Prebuild'in yerleşik updates eklentisi | Etkisiz: `expo-updates` `node_modules`'ta yok, `ENABLED=false` | Gerek yok (E3) | K1-rel + K1 |
| M9 | Dışa açık bileşenler | — | `MainActivity` (launcher + `haftik` şeması, BROWSABLE: **bir web sayfasındaki bağlantı da tetikler**), M3 alıcısı, `ProfileInstallReceiver` (`DUMP` izniyle korunur). Başka exported bileşen yok; iki FileProvider `exported=false` | — | K1-rel |
| M10 | FileProvider yolları | `expo-sharing` `sharing_provider_paths.xml`: `external-path .`, `files-path .`, `cache-path .` | Grant yalnız uygulama bir URI'yi paylaşınca verilir. **`files-path .` SQLite dosyasını da kapsar**: yanlış yol `shareAsync`'e giderse tüm geçmiş çıkar. Bugün yol yalnız view-shot çıktısı ve rapor dosyası (K1) | Kural: `shareAsync`'e yalnız uygulamanın ürettiği, adanmış `cache/haftik-share/` altındaki dosya; dış kaynaklı yol asla | K1 (N-6 devam) |
| M11 | `queries` (l.14-33) | Şablon + expo-file-system + expo-sharing | Düşük (paket görünürlüğü) | Gerek yok | K1-rel |
| M12 | `versionCode 1`, targetSdk 36, minSdk 24, `debuggable` yok | — | Release doğru. Preview'da `autoIncrement` yok (07 A4) | — | K1-rel |

**Hedef izin listesi (release):** `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `VIBRATE`, `WAKE_LOCK`,
`DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` (imza düzeyi, AndroidX). Bu liste "altın dosya" olarak saklanıp her preview'da
karşılaştırılır (1.3, S3).

### 1.2 S10 açık kalemleri ve önceki turların güvenliğe dokunan bulguları

| Kalem | Bugünkü durum | Öneri | Önem |
|---|---|---|---|
| I-2 INTERNET + merged | Merged manifest artık var (1.1); karar ve ağ ölçümü açık | M1 + 1.3 | Important |
| I-5 politika/KVKK, I-6 Health | Değişmedi (06'da hazırlık) | privacy-compliance-analyst, Batuhan | Batuhan |
| N-1 `VACUUM`/`secure_delete` yok | Açık; Karnelerim ile silinen geçmiş büyür | Silme sonunda `VACUUM`; açılışta `PRAGMA secure_delete=ON`; WAL ise `wal_checkpoint(TRUNCATE)` (expo-sqlite varsayılan günlük modu doğrulanmadı) | Nit, ucuz |
| N-3 CI `permissions:` | Açık (`ci.yml`'de blok yok) | `permissions: contents: read` | Nit |
| N-5 / 04 #7 silme hatası sessiz | Açık (`settings.tsx:93-101`) | Başarı/hata geri bildirimi (F3). **Gizlilik sözünün başarısız yolu sessiz** | Important |
| N-6 FileProvider geniş | Açık (M10) | Adanmış paylaşım dizini | Nit; dışa aktarma gelirse Important |
| N-7 placeholder sütun | Açık | İlk harici kurulumdan önce karar | Batuhan |
| N-9 kilit/FLAG_SECURE | Açık | Bölüm 4 | Batuhan |
| 04 #3 migration atomik değil | Açık; V2 ve Karnelerim yeni migration getirir | T7 yeni şemadan **önce** | Important (bütünlük) |
| 04 #4 paylaşım dosyası erken silinebilir | Açık, K5 yok | 2.1: yaşa göre süpürme | Önemli (işlev); güvenlikçe kabul edilebilir |
| TB-14 `decode-uri-component` | Durum değişti (bölüm 3) | Risk kabulü + izleme | Düşük |
| G17 bildirim kilit ekranı | Sabit metin, `data:{kind}` (`scheduler.ts:135-147`) | Değişiklik gerekmez | Kabul |

Temiz çıkan (yeniden doğrulandı, K1): `src/`te `fetch`/XHR/WebSocket yok; SQL parametreli; `week-param.ts` biçim + takvim +
Pazartesi + gelecek reddi; `openOrBuildCard` uygunluğu kendi doğrular (`open-card.ts:78,96`); `returnToCardWeekStart` doğrulanıyor
(`today.tsx:92`); deep link ile onboarding'e yeniden girmek `first_open_date`i ezmiyor (`onboarding/notifications.tsx:19-22`).

### 1.3 "Üretimde ağ çağrısı yok" iddiasının kanıt planı

Bugün **K1**. Site ve davet metni cümleyi kesin dille taşıyor; ölçülmeden "kanıtlı" denmemeli (06 G1, 07 4.1 ile aynı).

**Statik (her preview/production öncesi):**

| # | Yöntem | Beklenen | K |
|---|---|---|---|
| S1 | Meta-test (`no-push.test.ts`'in genişletilmişi): `src/`te `fetch(`, `XMLHttpRequest`, `WebSocket`, `EventSource`, push token API'leri, uzak URI'li `useFonts`/`loadAsync`, `SvgUri`, `http(s)://` literal (gizlilik URL'si izin listesinde) yasak | 0 eşleşme | K2 |
| S2 | `npx expo export --platform android --no-bytecode` çıktısında `https?://` host listesi, izin listesiyle fark (bilinen ölü kod: `exp.host`) | Yeni host 0 | K1-rel |
| S3 | `aapt2 dump permissions` + `apkanalyzer manifest print`, 1.1 altın listesiyle fark | Fark 0 | K1-rel |
| S4 | `gradlew :app:dependencies --configuration releaseRuntimeClasspath`: firebase/analytics/crashlytics/measurement grupları | Beklenen dışı yok | K1-rel |

**Çalışma zamanı (preview APK):**

| # | Yöntem | Ne kanıtlar | K |
|---|---|---|---|
| R1 | Emülatör: `dumpsys package com.batuhan.haftik` → `userId`; akış öncesi/sonrası `dumpsys netstats detail`'de o UID'nin baytları | Uygulama trafiği 0 bayt (UID ile sistemden ayrılır) | K4 |
| R2 | Gerçek cihaz, **PCAPdroid** (root'suz, yalnız Haftik filtresi): temiz kurulum → onboarding → izin → check-in → planlı bildirim beklenir → Pazar kartı (cihaz saati ileri) → paylaş → rapor → sil → yeniden başlat. pcap `docs/` dışına saklanır | Bağlantı 0 (FCM, `firebaseinstallations.googleapis.com`, `exp.host`, DNS dahil) | K5 |
| R3 | Uçak modu tam akış (G-01) | İşlev ağsız çalışır (ağ yokluğunu kanıtlamaz) | K5 |
| R4 | Uygulama bilgisi > veri kullanımı (G-07) | 0 B | K5 |
| R5 | **INTERNET engelli derlemede** `dumpsys package` `grantedPermissions`'ta INTERNET yok | Uygulama soket açamaz: **mekanik** garanti | K1-rel + K4 |

**Karar kuralı:** R5 uygulanırsa site "uygulama internet izni istemez" diyebilir ve kullanıcı bunu kendi telefonunda doğrular;
R2 bir kez doğrulama olarak yapılır. R5 yoksa site cümlesi R2 geçene kadar "sunucuya veri göndermez; ölçüm ayrıca teyit
edilecek" düzeyinde kalır. Gizlilik bağlantısı (B13) INTERNET gerektirmez: `Linking.openURL` tarayıcıyı açar, isteği tarayıcı yapar.

## 2. Yeni yüzeyler için tehdit modeli

**Varlıklar:** check-in geçmişi (uyku/harcama: sağlığa/finansa yakın beyan), dondurulmuş kartlar (gizli satırlar dahil),
`metric_event` (zaman damgalı), geçici PNG/rapor/dışa aktarma dosyaları.
**Saldırganlar:** A1 kilidi açık telefonu eline alan / omuz üstünden bakan; A2 cihazdaki kötü niyetli uygulama (root'suz: deep
link, intent, paylaşım hedefi, erişilebilirlik servisi); A3 paylaşılan dosyanın alıcısı ve onun iletip sakladığı yerler;
A4 cihaz dışı kopya (D2D, yedek); A5 tedarik zinciri (bağımlılık); A6 geliştirici tarafı (deneme raporları).
Kapsam dışı: root'lu cihaz, adli kopya, erişilebilirlik servisine izin verilmiş kötü yazılım (ekrandaki her metni okur;
FLAG_SECURE de korumaz).

### 2.1 Paylaşım biçimleri (9:16, kare, çıkartma PNG, "galeriye kaydet")

| Tehdit (STRIDE) | Senaryo | Kontrol | Kanıt |
|---|---|---|---|
| Bilgi ifşası (A3) | Kategori rengi/çıkartma boyutu gizli satırın seviyesini sızdırır (brif karar 4: kategori rengi serbest, seviye doluluk/boyutla) | **Gizli yuva kuralı:** gizli kategori için seviye taşıyan hiçbir prop render ağacına girmez; yuva şekli/boyutu/rengi seviyeden bağımsız. Unvan: güvenlik gereksinimi 3 her biçimde | K2: her biçim için "gizli kategori seviye 1 ve 3 iken PNG'nin o bölgesi piksel-özdeş" testi (render ağacı + K4 PNG karşılaştırması) |
| Bilgi ifşası (A3) | Dosya adı tarih taşır (`haftik-2026-09-21.png`) → "kartta tarih yok" kuralı dosya adından delinir; PNG `tEXt`/EXIF | Sabit, kimliksiz ad (`haftik-kart.png`); metadata yok | K2 (ad üreticisi), K5 P-06 |
| Bilgi ifşası (A1/A4) | Yeni biçimler yeni geçici dosya adları üretir, `ReactNative-snapshot-image*` süpürme deseni onları kaçırır | Tüm paylaşım dosyaları adanmış `cacheDirectory/haftik-share/` altına; süpürme **dizini** temizler (desene değil) | K2 + K4 (P-08) |
| Hizmet/işlev | 04 #4: `finally` dosyayı hedef okumadan silebilir | Silmeyi `finally`'den çıkar; açılışta, sonraki paylaşımda ve "Tüm verilerimi sil"de süpür. Kalıntı penceresi uygulamaya özel cache'te; kabul edilebilir | K5 (WhatsApp hedefi) |
| Bilgi ifşası (A4) | "Galeriye kaydet" paylaşılan depolamaya yazar: "Tüm verilerimi sil" kapsamı dışı, medya izni ister | **Önermiyorum:** paylaşım sayfası zaten "Fotoğraflara/Dosyalara kaydet" hedefini sunar; yeni izin ve silinemez kopya yok | — |

### 2.2 Albüm / Karnelerim (yerel geçmiş)

Yeni veri toplanmaz; ama geçmiş **görünür ve tekrar paylaşılabilir** olur. A1 riski artar (bölüm 4).
- Tekrar paylaşımda varsayılan gizleme yeniden uygulanır (13 V6 ile aynı); eski gizleme seçimi saklanmaz.
- Liste küçük resimleri **canlı render** edilir; PNG küçük resim önbelleği yazılmaz. Yazılırsa `haftik-share/` gibi adanmış dizin
  ve silme kapsamı.
- `archive_opened` sayacı kimliksiz ve tarihsiz; rapor yasak-desen testi korunur.
- **Silme kapsamı genişliyor; kalıntı envanteri:** SQLite tabloları (yeni sütun/tablo dahil) + `-wal`/`-shm`, paylaşım dizini,
  `deneme-raporu.txt`, planlı bildirimler, (widget gelirse) widget deposu, (dışa aktarma gelirse) dışa aktarma dosyaları.
  Uygulamanın silemedikleri: paylaşılmış PNG/rapor, alıcıdaki kopyalar, son uygulamalar küçük resmi, bildirim geçmişi. Silme
  onay metni bu ikinci listeyi bir cümleyle söylemeli.
- **Hata sınıfını teste çevir:** "yeni tablo eklendi, silmeye eklenmedi" sınıfı için sözleşme testi: gerçek SQLite'ta
  `sqlite_master`taki **her** kullanıcı tablosu `deleteAllData` sonrası 0 satır. Böylece yeni tablo unutulursa test kırılır (K2).

### 2.3 Widget (v2 adayı)

- Ana ekran kilit açıkken görünür; bazı cihazlarda kilit ekranı/hub widget'ı olabilir (doğrulanmadı). İçerik yalnız dolu gün
  noktası, seviye/emoji **asla** (13 Z9 ile uyumlu).
- Widget verisi ayrı bir depoya yazılır (SharedPreferences / iOS App Group): **silme kapsamına ve D2D hariç tutmaya eklenmeli**;
  iOS App Group iCloud yedek sorunu ayrıca.
- `AppWidgetProvider` alıcısı zorunlu olarak exported: ekstraları güvenilmez say, yalnız yenile. Tıklama `PendingIntent`'i
  `FLAG_IMMUTABLE`, açık (explicit), sabit rotaya.
- Üçüncü taraf widget kütüphanesi = A5 riski (bölüm 3 yöntemi). **Öneri: v2.**

### 2.4 Yerel dışa aktarma / yedek / içe aktarma (v2 adayı; en riskli yüzey)

Güçlü ürün gerekçesi var: preview APK'dan Play'e geçişte veri kaybı (07 3.5) ve telefon değişimi. Ama:
- **Dışa aktarma dosyası = tüm geçmiş** (sağlığa yakın). Bir kez çıkınca silinemez; indirme klasöründe/Drive'da kalır.
  Kontroller: yalnız kullanıcı tetikler, ne içerdiğini söyleyen onay, adanmış dizin + süpürme, tarihsiz dosya adı, isteğe bağlı
  parola şifrelemesi v2 (yeni kripto bağımlılığı ister).
- **İçe aktarma = güvenilmez girdi ayrıştırıcısı.** JSON + sürüm alanı; bilinmeyen alan red; boyut ve satır sınırı; tarih
  geçerli ve ileri değil, değer 1..3; tek transaction, ya hep ya hiç; önizleme + onay; **ham `.db` içe aktarma yok** (saldırgan
  kontrollü SQLite dosyası ayrı bir risk sınıfı); dosyadan SQL çalıştırma yok. İçe aktarılan `weekly_card` satırları
  dondurulmuş kart garantisini deler: öneri yalnız check-in'leri al, kartları yeniden üret.
- Giriş yolu: uygulama içi dosya seçici. **Dosya türü için yeni intent-filter açma** (başka uygulamaların tetikleyebileceği yeni
  exported yüzey olur).
- Metin etkisi: "telefon değişirse veri taşınmaz" cümlesi "kendin taşıyabilirsin" olur; SEC2-1 kararıyla birlikte yazılmalı.

### 2.5 Deep link (kart/albüm parametreleri)

Bugünkü rotalar: `haftik://`, `/today`, `/week`, `/settings`, `/card/<Pazartesi>`, `/onboarding/*`. BROWSABLE olduğu için bir web
bağlantısı da tetikler (M9).
- `card/<w>`: uygun ve açılmamış bir haftada **dışarıdan tetiklenen kalıcı yazım** (kart dondurulur) mümkün. Veri sızmaz, kullanıcı
  zaten alacaktı; yan etki reveal anının tüketilmesi ve `card_opened` şişmesi (S9'da bilinen). Kabul, ama T2 ile geçmiş hafta
  kartlarına ürün içi yol açılınca aynı doğrulama zinciri korunmalı.
- Albüm rotası (`/album`, `/album/<w>`) **salt okunur** olmalı: parametre `week-param` ile doğrulanır, albüm hiçbir zaman kart
  üretmez (`openOrBuildCard` değil, `getCard`).
- Parametre ekleme kuralı: her yeni query param için tür + izin listesi; bilinmeyen parametre yok sayılır; hiçbir parametre dosya
  yolu, URL veya SQL parçası olarak kullanılmaz.
- `/onboarding/*` onboarding bitmişken de açılıyor; zararsız (kullanıcı dokunuşu gerekir, `first_open_date` korunur). Nit: bitmişse
  `/today`'e yönlendir.
- `decode-uri-component` kendine DoS'u expo-router ayrıştırmasında, bizim koddan önce oluşur; uygulama tarafında azaltma yok (bölüm 3).

### 2.6 Bildirim tıklaması yönlendirmesi (T3)

- Yönlendirme **yalnız sabit tablodan:** `kind` izin listesi (`daily` → `/today`, `card` → `/week` ya da doğrulanmış kart rotası).
  Bildirim verisindeki `url`/`path` alanı asla `router.push`'a verilmez (Expo dokümanındaki `data.url` örüntüsü burada yasak).
- `weekStart` taşınacaksa `week-param` ile doğrulanır; uygunluk yine `openOrBuildCard` içinde kontrol edilir.
- Uzak push bileşenleri silinmezse (M3/M4) ve ileride `google-services.json` eklenirse, uzaktan gelen bir yanıt da aynı işleyiciye
  düşer: işleyici yalnız yerel tetikleyicili (`trigger` türü tarih) bildirimleri işlemeli.
- Soğuk açılışta `getLastNotificationResponse` aynı yanıtı iki kez işleyebilir: kimliğe göre tek sefer.

### 2.7 R8 küçültme: risk / fayda (güvenlik açısı)

- **Fayda:** ölü Java/Kotlin kodu çıkar, paket küçülür (12: -9,4 MB). Karartma güvenlik kontrolü **değildir**. R8 JS paketine
  dokunmaz (`exp.host` ölü kodu kalır) ve manifestte tanımlı Firebase bileşenlerini **silmez**; ağ sorusunu çözmez.
- **Risk:** yansımayla yüklenen sınıfların atılması; güvenlik açısından en kötüsü **sessiz** kırılmalar: bildirim iptali
  (`cancelAll`) çalışmaz ve silme sonrası bildirim "dirilir", boot alıcısı çöker, FileProvider yolu bozulur ve paylaşım/süpürme
  sessizce başarısız olur.
- **R8 derlemesinde güvenlik regresyon listesi (K4):** silme → planlı bildirim sayısı 0 (`dumpsys alarm`); paylaşım + iptal +
  uygulamayı öldürme → cache'te PNG 0; deep link geçersiz/ileri/geçerli; reboot sonrası plan; rapor dosyası silinir.
- `mapping.txt` sır değildir ama sürüm etiketiyle saklanır; depoya eklenmesi gerekmez.

## 3. Bağımlılık denetimi

**`npm audit`:** bu turda çalıştırılamadı (komut aracı yok). Son kayıt S10 (2026-09-23): `--omit=dev` 15 moderate, 0
high/critical, iki kök advisory. Kilit dosyası değişmedi: `decode-uri-component` 0.2.2, `query-string` 7.1.3, `uuid` 7.0.3,
`xcode` 3.0.1 (`package-lock.json`, K1). **devops-engineer:** `npm audit --omit=dev --json` çıktısını 21/24 ile birlikte kaydetsin.

| Advisory | Yeni bilgi | Üretimde erişilebilir mi | Öneri |
|---|---|---|---|
| `decode-uri-component` ([GHSA-vcc3-ghjq-m6fr / CVE-2026-45822](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr)) | Etkilenen ≤0.4.2, düzeltme **0.5.0 ve yalnız ESM**; `query-string@7` CJS olduğu için `overrides` ile 0.5.0'a zorlamak `parse`'ı kırar. Expo tarafında açık konu var ([expo#49943](https://github.com/expo/expo/issues/49943)) | **Evet:** `haftik://` bağlantısıyla (web sayfasından da) uygulamayı donduran kendine DoS; veri sızıntısı yok | Risk kabulü + her SDK yamasında kontrol. `overrides` ya da `npm audit fix --force` **yapma**. `patch-package` yalnız DoS gerçek kullanıcıda görülürse |
| `uuid` (xcode → config-plugins) | — | Hayır (build-time) | Kabul |

**Yeni paketler (SVG, gradient, font, ikon, haptik) için ağ/telemetri kontrol yöntemi** (her paket için bağımlılık kaydına yazılır):
1. `npx expo install <paket>` (SDK uyumlu sürüm; `package-lock` ile sabit).
2. `npm view <paket> dependencies scripts`: `postinstall`/`preinstall` betiği var mı (tedarik zinciri).
3. Kaynak taraması: `node_modules/<paket>` JS'inde `fetch(`, `XMLHttpRequest`, `WebSocket`; `android/` içinde `HttpURLConnection`,
   `OkHttp`, `URL(`; `ios/` içinde `NSURLSession`/`URLSession`; telemetri alan adları.
4. **Ağ yetenekli API'yi yasakla:** `react-native-svg` `SvgUri` ve uzak `href` ağdan indirir, yalnız yerel XML/bileşen kullanılır;
   `expo-font` yalnız `require()` edilen yerel dosya; `@expo-google-fonts/*` statik `.ttf` (uzak yükleme yok). S1 meta-testi bunu korur.
5. Paket sonrası fark: S2 (JS host), S3 (merged manifest: yeni izin var mı), S4 (native bağımlılık).
6. Lisans/bakım: MIT/Apache/OFL, bakımcı, son sürüm tarihi.
7. `expo-doctor` ve R8'li derlemede K4 duman testi.

Aday değerlendirmesi (K1, kaynak bu turda okunmadı, doğrulanmalı): `react-native-svg` yerel kullanımda ağsız, `SvgUri` hariç;
`expo-linear-gradient` yerel çizim; `expo-haptics` yalnız `VIBRATE` (zaten var); `@expo/vector-icons` statik font.

## 4. Uygulama kilidi / FLAG_SECURE / son uygulamalar / ekran kaydı (N-9)

| Seçenek | Ne yapar | Artı | Eksi | Öneri |
|---|---|---|---|---|
| a. Hiçbir şey | — | Sıfır iş | Son uygulamalar küçük resminde Bugün ekranının seçili emojileri görünür (A1) | — |
| b. Yalnız son uygulamalar küçük resmi | Android 13+ `Activity.setRecentsScreenshotEnabled(false)` (MainActivity, küçük config plugin); iOS'ta `inactive` iken gizlilik örtüsü | Ekran görüntüsü serbest kalır: **kart ekran görüntüsü ürünün paylaşım yoludur** (S9: ekran görüntüsü eksik sayılan paylaşım) | Android 12 ve altı kapsanmaz; Android'de JS örtüsü küçük resim anında yetişmeyebilir (güvenilmez) | **Önerilen** (S, K4: `KEYCODE_APP_SWITCH` + screencap) |
| c. Global FLAG_SECURE (`expo-screen-capture`) | Ekran görüntüsü, kayıt, küçük resim engellenir | En güçlü | **Kart ekran görüntüsünü de engeller**, paylaşım ölçümünü bozar; yeni bağımlılık | Önermiyorum |
| d. Yalnız Karnelerim/Bugün'de FLAG_SECURE | Ekran bazlı | Kart ekranı serbest | Tutarsız his; ekran geçişinde bayrak yarışları | Önermiyorum |
| e. Uygulama kilidi (cihaz kimlik doğrulaması, isteğe bağlı, varsayılan kapalı) | `expo-local-authentication` | Karnelerim sonrası A1'e karşı gerçek önlem | Yeni bağımlılık + `USE_BIOMETRIC`; kilit şifreleme değildir | **v2**, denemede istenirse |

Ekran kaydı: kayıt/yansıtma kullanıcı onayı (MediaProjection) ister; A2 onaysız kaydedemez. Erişilebilirlik servisi ekranı
FLAG_SECURE'dan bağımsız okur. Bu ürün için ek önlem gerekmez. Bildirimler sabit metin; kilit ekranında veri yok.

## 5. Yeni özellik önerileri (güvenlik/gizlilik ilkesiyle uyumlu)

| # | Öneri | Etki | Efor | Gizlilik uyumu |
|---|---|---|---|---|
| F1 | **Doğrulanabilir gizlilik:** release'te INTERNET yok + Ayarlar'da "Verilerin nerede?" bölümü (ne saklanıyor, kaç kayıt, silme kapsamı, "bu uygulama internet izni istemez, telefonunun izinler ekranından kontrol edebilirsin") | Yüksek: "yerel-only" sözü kullanıcının kendi telefonunda sınanabilir, rakiplerden ayrışır | S-M (config + tek bölüm) | Tam; rakam yalnız uygulama içinde |
| F2 | **Paylaşım öncesi gizlilik özeti** (önizlemede tek satır: "Uyku ve harcama gizli · tarih yok · konum yok") + gizli yuva piksel-özdeş testi | Orta: paylaşım güveni | S | Tam |
| F3 | **Güvenli silme + sonuç ekranı:** transaction + `VACUUM` + `secure_delete` + paylaşım dizini süpürme; "Silindi" onayı, hata olursa açık mesaj; "uygulamanın silemedikleri" cümlesi | Orta: gizlilik sözünün başarısız yolu kapanır (04 #7) | S | Tam |
| F4 | **Son uygulamalar gizliliği** (4b) | Düşük-orta | S | Tam |
| F5 | Yerel dışa/içe aktarma (2.4 kurallarıyla) | Yüksek (APK→Play, telefon değişimi) | M-L | Koşullu; v2 |
| F6 | Uygulama kilidi (4e) | Orta (Karnelerim sonrası) | M | Tam; v2 |

**Taslak intent'ler (dosya oluşturulmadı):**

- **`2026-09-28-dogrulanabilir-gizlilik` (F1+F3, v1.1 taban adayı).** Haftik "veri cihazda, ağ yok" diyor ama bu bugün yalnız kod
  okumasına dayanıyor; release manifestte internet izni ve kullanılmayan Firebase bileşenleri var, silme hatası sessiz.
  Önerilen sonuç: yayın derlemesinde internet izni ve uzak push bileşenleri kaldırılır, veri başka telefona kendiliğinden
  taşınmaz, Ayarlar'da kullanıcı neyin nerede durduğunu ve silmenin neyi kapsadığını görür. Başarı ölçütü: merged manifest altın
  listeyle özdeş, PCAPdroid 0 bağlantı, silme sonrası tüm tablolar boş ve kullanıcıya sonuç gösterilir. Kısıt: yeni bağımlılık
  yok; dev derlemesi Metro için internet iznini korur.
- **`yerel-tasima` (F5, v2).** Deneme APK'sından Play'e geçen ya da telefon değiştiren kullanıcı tüm geçmişini kaybediyor.
  Önerilen sonuç: kullanıcı tetikli, sürümlü bir dışa aktarma dosyası ve yalnız check-in'leri alan, katı doğrulamalı içe
  aktarma; kartlar yeniden üretilir. Başarı ölçütü: geçiş yapan testçilerin veri kaybı 0; içe aktarma bulanık/bozuk dosya
  testlerinde hiç kısmi yazım yapmaz. Kısıt: ham veritabanı içe aktarma yok, yeni intent-filter yok, security-reviewer onayı.

## 6. Batuhan'a seçenekli sorular

| # | Soru | Seçenekler | Öneri |
|---|---|---|---|
| S-1 | INTERNET izni | (a) kalsın, ölç, beyanı ölçüme göre yaz; (b) preview/production'da engelle (`app.config.js` + EAS env), dev'de kalsın; (c) her yerde engelle | **(b):** tek mekanik kanıt; dev akışı bozulmaz |
| S-2 | Firebase bileşenleri (FCM alıcısı, InitProvider, Installations, datatransport) | (a) dormant bırak, ölçümle beyan et; (b) config plugin ile manifestten sil, bildirim K4 regresyonu | **(b)** |
| S-3 | Cihazdan cihaza aktarım (SEC2-1) | (a) `dataExtractionRules` ile kapat, "taşınmaz" metni doğru kalır; (b) açık bırak, metni "bulut yedeğine girmez, telefon-telefon aktarımında taşınabilir" yap | **(a) şimdi** (spec güvenlik 6 ile tutarlı, ucuz); taşıma ihtiyacı F5 ile bilinçli çözülür |
| S-4 | 17 rozet + install referrer izni | (a) engelle; (b) kalsın | **(a)**, K4 bildirim testiyle |
| S-5 | N-9 | (a) hiçbir şey; (b) yalnız son uygulamalar küçük resmi; (c) global FLAG_SECURE; (e) isteğe bağlı kilit | **(b)** şimdi, (e) v2 |
| S-6 | Dışa/içe aktarma | (a) v1.5'te yok, v2 intent; (b) yalnız dışa aktarma; (c) ikisi | **(a)** |
| S-7 | Widget | (a) v2; (b) v1.5 | **(a)** |
| S-8 | `decode-uri-component` | (a) risk kabulü + SDK yamasında kontrol; (b) patch-package | **(a)**, `plan.md`'ye kabul kaydı |
| S-9 | "Galeriye kaydet" düğmesi | (a) yok, paylaşım sayfası yeter; (b) ekle (medya izni) | **(a)** |
| S-10 | R8 | (a) tabanda aç + 2.7 regresyon listesi; (b) ertele | **(a)** (12 ve brif karar 7 ile uyumlu) |

## 7. Devir ve doğrulanamayanlar

**Devir:**
- mobile-platform-specialist (22): M4/M6/M7 için config plugin tasarımı; `WAKE_LOCK`'un gerçekten gerekip gerekmediği; `setRecentsScreenshotEnabled`; D2D test komutu.
- mobile-engineer: F3 (silme geri bildirimi), 2.1 adanmış paylaşım dizini, 2.6 sabit rota tablosu, S1 meta-testi.
- software-architect (21): V2/V6 migration'ları T7'den sonra; albüm salt okunur; silme sözleşme testi.
- test-automation-engineer: gizli yuva piksel-özdeş testi; 2.7 R8 güvenlik regresyonu.
- devops-engineer: `npm audit --json`, S2-S4 betikleri, altın izin listesi, CI `permissions:`.
- privacy-compliance-analyst: SEC2-1'in site/onboarding metnine etkisi; S-1/S-2 sonucuna göre Data Safety; F1 metni.
- release-manager: 1.3 R1-R5'in preview kapısına eklenmesi (07 E1/E6 ile birleşir).

**Çelişki kaydı:** 07 4.1 "önce ölç, sonra karar" diyor; ben S-1(b)'yi (engelle + bir kez ölç) öneriyorum. Çelişki sıra
meselesi: ilk preview mevcut haliyle ölçülebilir, ikinci preview engellenmiş olur. İki build kotası Batuhan'ın kararı.

**Doğrulanamayanlar (bu tur):**
- `npm audit` güncel çıktısı (araç yok); aday paketlerin kaynağı okunmadı.
- Ağ trafiği (R1-R5): hiçbiri koşulmadı. "Firebase başlatılmaz" yalnız `google_app_id` yokluğundan çıkarım.
- İncelenen manifest yerel release derlemesi; EAS preview APK'sı değil (aynı `app.json` ile özdeş olması beklenir, ölçülmedi).
- D2D aktarımın bu uygulamada gerçekten gerçekleştiği (K5 yok); rozet/referrer izinleri engellenince çalışma zamanı davranışı.
- expo-sqlite'ın varsayılan günlük modu (WAL mı), silinen baytların dosyada kalıp kalmadığı.
- `setRecentsScreenshotEnabled` davranışının OEM başlatıcılarında tutarlılığı; widget kilit ekranı görünürlüğü.

Kaynaklar: [Android Auto Backup](https://developer.android.com/identity/data/autobackup) · [`<application>` öğesi](https://developer.android.com/guide/topics/manifest/application-element) · [GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) · [expo/expo#49943](https://github.com/expo/expo/issues/49943)

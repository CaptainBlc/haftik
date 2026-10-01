# Emülatör test sonuçları - Haftik (`docs/manual-checklist.md`, 59 madde)

## Ortam

| Alan | Değer |
|---|---|
| Emülatör | AVD `haftik_pixel` (emulator-5554), Pixel 7, x86_64, Android 15 (userdebug, `adb root` açık) |
| Ekran | 1080x2400 @ 420 dpi (testte 720x1280@320, 1080x2400@540 ve font_scale 1.3/2.0 denendi, sonunda hepsi sıfırlandı) |
| Derleme | **DEBUG** (`flags=[DEBUGGABLE ...]`), Metro CI modu (:8081), dev client; paket `com.batuhan.haftik`, şema `haftik://` |
| Kaynak | Derleme, ASCII yollu geçici kopyadan (`C:\hhk\haftik`); asıl repodaki sonraki değişiklikler emülatörde YOKTUR. Bulgu "şüpheli dosya" yolları asıl repoya göredir (salt okunur incelendi). |
| Saat/TZ | Emülatör saat dilimi GMT (uygulama Europe/Istanbul varsayan testlerle yazılmış; kod yerel TZ kullanıyor, sorun değil). Bildirim testleri için `adb root` ile `date` ayarlandı; sonda host saatine döndürüldü, `auto_time`/`auto_time_zone` tekrar 1. |
| Dev uyarısı | Her açılışta LogBox: "Cannot connect to Expo CLI" (hot reload/CLI socket kapalı; ortam kaynaklı, bulgu değil). Sağ alttaki yüzen saat düğmesi (bilinen) alt sekmenin "Ayarlar" etiketini kapatıyor (Düşük, bkz. BLG-12). |
| Yöntem | adb + uiautomator dump + screencap; DB `run-as ... cat files/SQLite/hhk.db` ile çekilip `node:sqlite` ile okundu; alarmlar `dumpsys alarm`; bildirimler `dumpsys notification`. Ekran görüntüleri: `%TEMP%\qa-shots`. |
| Yapılmayanlar | Kod DEĞİŞTİRİLMEDİ. Test dosyalarına dokunulmadı. Emülatör kapatılmadı, uygulama açık bırakıldı. |

Not: Karar sözlüğü: GEÇTİ / KALDI / EMÜLATÖRDE YAPILAMAZ / RELEASE'TE DOĞRULANACAK / ATLANDI (emülatörde yapılabilir ama bu turda zaman nedeniyle koşulmadı).

## Sonuç tablosu

| ID | Sonuç | Kanıt / not |
|---|---|---|
| H-01 | GEÇTİ | Debug APK açılıyor; ilk ekran "Her gün 8 saniye. Her pazar bir karne." (c2.png); RedBox yok (yalnızca ortam kaynaklı LogBox uyarısı). |
| H-02 | GEÇTİ | Panel açılıyor: düğmeler `+1 gün`, `+1 saat`, `Bu haftanın Pazar 20:00'ine ilerlet`, `+1 hafta`, `Gerçek zamana dön`, `Kapat`; satır "Cmt 26.09.2026 11:27 (simüle)" (d2.png); Bugün başlığı simüle güne geçiyor. |
| H-03 | KALDI | Onboarding 3 dokunuş, metinler doğru (o2/o3.png) AMA "İzin ver" sonrası sistem izin diyaloğu HİÇ çıkmıyor: BLG-01. |
| C-01 | GEÇTİ | Kaydet 0-3 seçimde `enabled=false`, 4. seçimde `enabled=true` (uiautomator); seçili kutu kalın çerçeveli, diğerleri soluk; aynı kategoride tek dokunuşla değişiyor (cin5.png). |
| C-02 | GEÇTİ | Kayıt DB'ye yazılıyor (`checkin` satırı, movement=2 sleep=1 spending=1 social=1); `force-stop` + yeniden açılış sonrası veri okunuyor (Hafta 3 dolu gün gösteriyor), onboarding tekrar gelmedi. |
| C-03 | GEÇTİ | `<` yalnızca 1 gün geri gidiyor, ikinci basışta "23 Eylül, Çarşamba"da kalıyor ve `<` kayboluyor (c03b.png). Dün için kayıt Hafta noktalarına yansıdı. |
| C-04 | EMÜLATÖRDE YAPILAMAZ | İnsan kronometresi gerek. Gözlem: 4 emoji + Kaydet arası ek onay diyaloğu yok. |
| C-05 | GEÇTİ (dolaylı) | `+1 gün` sonrası başlık yeni gün (26 Eylül Cumartesi), her gün ayrı `checkin` satırı olarak kaydedildi (DB: 09-24/25/26). Boş seçim ekranı doğrudan izlenmedi ama günler arası kayıt karışmadı. NOT: gerçek saat ilerlemesinde başlık yenilenmiyor, bkz. BLG-03. |
| C-06 | GEÇTİ | 12 emojinin hepsi Noto Color Emoji ile çiziliyor, kutu/tofu yok; dokunma alanı 304x304 px (~100dp). |
| W-01 | GEÇTİ (kısmi) | Silinmiş/yeni veriyle 0 dolu hali doğrudan görülmedi; 1 dolu günde "Kartın için 2 gün daha lazım." (eşik 3 doğru, w1.png). Yeni hafta: 0 nokta, "4 gün daha" (w4b.png). Kilitli kutuda gerçek metin yok. |
| W-02 | KALDI | Hafta ekranı açıldıktan sonra yapılan check-in'leri YANSITMIYOR (3 dolu gün varken "2 gün daha lazım" kalıyor, w2/w4.png). Taze açılışta doğru: 3 gün = "Kartın hazırlanıyor, Pazar 20:00'de açılacak." + "Pazar 20:00'de açılıyor" (k4c.png). BLG-02. |
| W-03 | GEÇTİ | Kilitli kutu: yalnızca gri iskelet + kilit (w3.png), dokununca hiçbir şey açılmıyor, gerçek metin/unvan/emoji yok. |
| W-04 | GEÇTİ | `+1 hafta`: 0 dolu, "Kartın için 4 gün daha lazım.", noktalar sıfır (w4b.png). |
| K-01 | GEÇTİ | Pazar 20:00 + bugün boş: "Bugünü işaretlemeden kartın açılmaz"; ara ekran "Kartını açmadan önce bugünü de ekleyelim." + "Bugünü işaretle" + Geri (k2.png); Geri ile Hafta'ya dönüldü, kutu kilitli, kart oluşmadı. (Yan bulgu: BLG-06.) |
| K-02 | GEÇTİ | 4 emoji + Kaydet sonrası ek dokunuş olmadan kart açılış ekranı (rv3.png); DB'de `weekly_card` + `card_opened` oluştu. |
| K-03 | EMÜLATÖRDE YAPILAMAZ | Çarpıcı geçiş var (rv1.png: kart boş/saydam, önceki ekran kayıyor; rv3'te tam görünüm) fakat 1-1,5 sn'lik akıcılık/kare atlama "his"i cihazda değerlendirilmeli. |
| K-04 | KALDI | Kart içeriği DB'de dondurulmuş, yeniden açılışta aynı (`generated_at` değişmedi). AMA `X` Hafta'ya değil, "Bugünü işaretle" ara ekranına düşüyor (bugün zaten dolu iken): BLG-06. |
| K-05 | KALDI | Türkçe karakterler/emoji/damga (`Haftik · [mağaza bağlantısı]`) temiz. Özet hapı ("Bu ilk kartın, önceki haftayla kıyas henüz yok.") 2 satıra sarınca 2. satır KESİLİYOR, hem ekranda (rv3.png) hem paylaşılan PNG'de (card.png): BLG-04. |
| K-06 | GEÇTİ | Önce Pazar için Bugün'de kaydedildi, sonra Hafta > kutu: ara ekran yok, doğrudan kart (k6b.png). |
| K-07 | ATLANDI | Zaman nedeniyle koşulmadı (deep link ile geçen hafta kartı; K-08'deki doğrulama mantığı kısmen kapsıyor). |
| K-08 | GEÇTİ | `haftik://card/abc`, `/2026-09-22` (Salı), `/2030-01-07`, `/2026-09-28` (gelecek hafta), `/2026-09-14` (geçmiş, verisiz), `/../../etc`, `/2026-13-45`: hiçbiri çökmedi (logcat'te FATAL/RedBox yok), hepsi Hafta ekranına yönlendirdi, yeni `weekly_card` oluşmadı (DB'de yalnız 2026-09-21). |
| K-09 | GEÇTİ | Veri silinmişken `haftik://today`, `/week`, `/settings` (açık ve soğuk süreçte) onboarding "Başla" ekranında kaldı. |
| P-01 | GEÇTİ | "Paylaşmadan önce gözden geçir." zorunlu ara adım; uyku+harcama varsayılan gizli (🙈), hareket+sosyal açık (👁); dokununca aç/kapa (pv1.png). |
| P-02 | GEÇTİ | Hareket gizlenince unvan `???` oldu (pv2.png; unvan yalnız hareketten türüyor); tekrar açınca geri geldi; ayrı unvan düğmesi yok. |
| P-03 | GEÇTİ (kısmi) | Uyku açılıp Geri ile çıkıp tekrar girince varsayılan (uyku+harcama gizli) geri geldi. Paylaşım tamamlandıktan sonraki durum test edilemedi (hedef uygulama yok). |
| P-04 | GEÇTİ (kısmi) | Sistem paylaşım sayfası açıldı (`ChooserActivityLauncher`, önizleme küçük resmi); iptalde çökme yok, kart ekranı sağlam. PNG dosyası incelendi: 2 gizli satır `???`+❓, gerçek gizli metin yok, alt damga var. WhatsApp hedefi emülatörde yok: gerçek hedefte cihazda doğrulanmalı. |
| P-05 | EMÜLATÖRDE YAPILAMAZ | WhatsApp/Galeri hedefi yok; K5 mesaj taşınıyor mu cihazda bakılmalı. |
| P-06 | GEÇTİ | `run-as` ile çekilen `ReactNative-snapshot-image*.png`: 1080x1920, 8 bit RGBA; chunk'lar yalnızca IHDR, sRGB, sBIT, IDAT, IEND (tEXt/iTXt/eXIf/GPS yok). |
| P-07 | GEÇTİ | Paylaşım sayfası açıkken cache'te 1 PNG; sayfa iptal edilince 0 (`ls cache`). Deneme raporu: iptalden sonra `deneme-raporu.txt` yok. |
| P-08 | GEÇTİ | Paylaşım sayfası açıkken `force-stop`: PNG cache'te kaldı (beklenen); yeniden açılışta süpürüldü (`ls cache` boş). Silme sonrası cache kontrolü ayrıca yapılmadı ama açılış süpürmesi kanıtlı. |
| P-09 | GEÇTİ (bilgi) | Önizleme ekranının ekran görüntüsü engellenmiyor (adb screencap çalıştı: pv1.png; gizli satırın gerçek metni listede görünür). FLAG_SECURE yok; karar N-9 Batuhan'ın. Emülatör screencap'i uygulama bayrağını atlayabilir; gerçek cihazda ayrıca denenmeli. |
| B-01 | KALDI | (a) Sistem izin diyaloğu hiç açılmıyor: BLG-01. (b) Ayarlar'da "Bildirim izni kapalı..." metni doğru ama sistem ayarlarına giden bir düğme yok. (c) Anahtar aç-kapa çökmüyor. (d) `pm grant` + öne getirme: plan otomatik kuruldu (0 -> 6 alarm) GEÇTİ. |
| B-02 | GEÇTİ (emülatör) | Saat 20:58'e alındı, hatırlatma 21:00: 1 bildirim ("Bugün nasıldı?" / "Birkaç saniyede bugünü işaretleyebilirsin.", kanal `hhk-reminders`), teslim 21:01:22 (~82 sn geç: SCHEDULE_EXACT_ALARM yok, beklenen). Kopya yok. Kilit ekranı görünümü bu turda bakılmadı; içerik sabit metin. |
| B-03 | GEÇTİ (bulgu var) | Bildirime dokununca uygulama açılıyor, çökme yok; bildirim tepsiden kalkıyor. Ama hiçbir yönlendirme yok, uygulama en son bulunduğu ekranda (Ayarlar) açıldı: BLG-09. Uygulama kapalıyken dokunma denenmedi. |
| B-04 | GEÇTİ (emülatör) | Bugünün check-in'i kaydedilince bugünün 21:00 alarmı plandan düştü (7 -> 6, `dumpsys alarm`), 21:00 sonrası bildirim gelmedi. Ertesi gün boşken gelmesi B-02 ile aynı mekanizma. |
| B-05 | GEÇTİ (plan düzeyi) | Anahtar kapalı: alarm 0; açık: 6; saat 21:00 -> 22:00 -> 21:00: eski saatten kalıntı alarm yok (`al` çıktısı). Gerçek teslimde "kapalıyken gelmez" ayrıca beklenmedi. |
| B-06 | ATLANDI | Pazar kart bildirimi teslimi koşulmadı (adb root ile yapılabilir). |
| B-07 | ATLANDI | Saat dilimi değişimi (adb root ile yapılabilir) koşulmadı. |
| B-08 | ATLANDI | Aynı. |
| B-09 | ATLANDI | Aynı (DST). |
| A-01 | GEÇTİ | Günlük hatırlatma anahtarı, 20/21/22/23 çipleri (21:00 varsayılan seçili), Deneme raporunu paylaş, Gizlilik politikası (yakında), Tüm verilerimi sil görünüyor; çip seçimi alarm saatini değiştiriyor. |
| A-02 | GEÇTİ | Alert "Bu işlem geri alınamaz. Emin misin?" (dl1.png), Vazgeç'te DB değişmedi. |
| A-03 | KALDI | DB'de 4 tablo boşalıyor, alarmlar 7 -> 0, iOS dışı OK. AMA silme sonrası uygulama onboarding'e dönmüyor; kullanıcı Ayarlar'da kalıyor, ekranda eski state (anahtar açık) kalıyor, sonra yapılan check-in `onboarding_done=false` iken kaydediliyor, bildirim planı kurulmuyor (alarm 0), `first_open_date` yok, `metric_event` yazılmaya devam ediyor: BLG-05. Soğuk açılışta onboarding'e dönüyor. |
| A-04 | GEÇTİ (kısmi) | Silmeden sonra tüm alarmlar iptal (0), yeniden kurulmadı. 20:00/21:00'in geçmesi beklenmedi. |
| R-01 | GEÇTİ | Alert metni: sayaç + gün sayısı, içerik/tarih/kimlik yok; Vazgeç'te paylaşım sayfası açılmadı. |
| R-02 | GEÇTİ (kısmi) | Paylaşım sayfası açıldı; dosya `cache/deneme-raporu.txt` okundu: emoji/kart metni/takvim tarihi/kategori adı/kimlik yok (yalnız sayaç adları `check_in_saved` vb. sayaç anahtarı), ölçüm sınırları yazıyor. Hedef uygulamada okunması cihazda. |
| R-03 | GEÇTİ | 4 check-in, 1 kart, 1 paylaşım (2 satır gizli) sonrası rapor: `check_in_saved=4, card_unlocked=1, card_opened=3 (3 kez açtım), share_initiated=1, line_hidden=2`; tutarlı. |
| E-01 | KALDI | 720x1280@320 ve 1080x2400@540'ta kart ekranında `X` (Kapat) unvanla üst üste biniyor, küçük ekranda `Paylaş` düğmesi özet hapının üstüne biniyor (sz1_card.png, sz2_card.png): BLG-07. Bugün ekranı dar ekranda kaydırılıyor, Kaydet erişilebilir (sz1_today.png). PNG boyutu yalnız varsayılan ekranda ölçüldü (1080x1920); ekran boyutu değişince aynı kalıyor mu bakılmadı. |
| E-02 | KALDI | font_scale 2.0: kart satırları "…" ile kesiliyor, özet kesik (fs_card.png); Ayarlar'da 23:00 çipi ekran dışına taşıyor, alt sekme etiketleri ikonla iç içe (fs_set.png): BLG-08. font_scale 1.3'te Kaydet/Sil erişilebilir, 23:00 çipi ekran içinde. |
| E-03 | ATLANDI | TalkBack açılmadı. Gözlem (a11y ağacı): emoji düğmelerinin `content-desc`i yalnızca emoji karakteri (metin adı/seçili durum yok, TalkBack'te "kaplumbağa" vb. okunur ama "Hareket, seçili" bilgisi taşınmıyor olabilir); pasif Kaydet `enabled=false`; önizlemede "X satırını gizle/göster" etiketleri var (iyi). |
| G-01 | RELEASE'TE DOĞRULANACAK | Release APK yok. |
| G-02 | RELEASE'TE DOĞRULANACAK | Release APK + PCAPdroid gerek. Debug'da uygulama Metro'ya bağlanıyor (ağ trafiği anlamsız). |
| G-03 | GEÇTİ (debug) | `requested permissions`: POST_NOTIFICATIONS, RECEIVE_BOOT_COMPLETED, INTERNET, VIBRATE, WAKE_LOCK, ACCESS_NETWORK_STATE, SYSTEM_ALERT_WINDOW (debug manifesti), `com.google.android.c2dm.permission.RECEIVE` ve çok sayıda 3. parti launcher rozet izni (sonymobile/oppo/huawei/samsung/everything.me/anddoes) ; konum/kişi/kamera/mikrofon/depolama YOK. FCM bileşenleri manifestte var: `FirebaseMessagingService`, `ExpoFirebaseMessagingService`, `FirebaseInstanceIdReceiver` (logcat: "Default FirebaseApp failed to initialize... no default options" = FCM kapalı). Release birleşik manifest ayrıca bakılmalı: BLG-10. |
| G-04 | GEÇTİ (debug) | ~13.8k satırlık `logcat -b all` içinde kart metni, unvan, kategori/değer, `check_in`, `weekly_card`, kişisel emoji izi YOK; ReactNativeJS yalnızca "Running main" ve ortam uyarısı. Not: pencere bu oturumdan kalan buffer'la sınırlı, release ile yenilenmeli. |
| G-05 | GEÇTİ (debug) | `flags=[ DEBUGGABLE HAS_CODE ALLOW_CLEAR_USER_DATA ]`, ALLOW_BACKUP yok. Release'te ayrıca doğrulanmalı. |
| G-06 | RELEASE'TE DOĞRULANACAK | Debug'da 🕒 menüsü beklenen şekilde VAR. |
| G-07 | RELEASE'TE DOĞRULANACAK | Sistem ayarları UI'ı bakılmadı; izinler G-03'te. |
| G-08 | RELEASE'TE DOĞRULANACAK | `expo export` bu oturumda çalıştırılmadı (kod/kopya değiştirmeme kuralı; çıktı dizini yazar). |
| G-09 | RELEASE'TE DOĞRULANACAK | `expo prebuild --clean` çalıştırılmadı. |
| G-10 | ATLANDI | Recents küçük resmi bakılmadı (Bilgi). |
| D-01 | GEÇTİ (kısmi) | `am kill` sonrası süreç yok, 7 alarm `dumpsys alarm`'da duruyor (alarm OS düzeyinde). Süreç kapalıyken bildirimin teslimi ayrıca beklenmedi. |
| D-02 | EMÜLATÖRDE YAPILAMAZ | Pil tasarrufu davranışı gerçek cihazda. |
| D-03 | EMÜLATÖRDE YAPILAMAZ | OEM cihaz yok. |
| D-04 | ATLANDI | Emülatör yeniden başlatılmadı (kapatma/yeniden başlatma yasak kapsamında). `RECEIVE_BOOT_COMPLETED` manifestte var. |
| D-05 | EMÜLATÖRDE YAPILAMAZ | 2 günlük gerçek kullanım. |

Özet sayım (tabloda 65 satır var; checklist başlığı "59" diyor ama bölüm 5 ve 10'da 9 ve 10 satır bulunuyor, bölüm toplamları tablosu 7 ve 7 yazıyor, checklist'in kendi sayımı güncellenmeli):
- GEÇTİ: 37 (birçoğu "kısmi/dolaylı/debug" notlu)
- KALDI: 8 (H-03, W-02, K-04, K-05, B-01, A-03, E-01, E-02)
- EMÜLATÖRDE YAPILAMAZ: 6 (C-04, K-03, P-05, D-02, D-03, D-05)
- RELEASE'TE DOĞRULANACAK: 6 (G-01, G-02, G-06, G-07, G-08, G-09; G-03/G-04/G-05 debug'da geçti, release'te yenilenecek)
- ATLANDI (emülatörde yapılabilir, koşulmadı): 8 (K-07, B-06, B-07, B-08, B-09, E-03, G-10, D-04)

Açık bulgular: Blokör 5 (BLG-01..05), Önemli 3 (BLG-06..08), Düşük 4 (BLG-09..12).

## Bulgular

### BLG-01 - Blokör - Yeni kurulumda bildirim izin diyaloğu hiç çıkmıyor
- Madde: H-03, B-01 (ve tüm bildirim zinciri).
- Adımlar: `pm clear` (veya `pm revoke ... POST_NOTIFICATIONS`) > uygulamayı aç > Başla > Anladım, devam > "İzin ver". Sonra Ayarlar'da anahtarı aç-kapa.
- Beklenen: Android 13+ sistem izin diyaloğu.
- Gerçek: Diyalog hiç gelmiyor, doğrudan Bugün'e geçiliyor. `dumpsys package`: `POST_NOTIFICATIONS: granted=false` ve `USER_SET` bayrağı yok; logcat'te izin denetleyicisi aktivitesi başlamıyor. Ayarlar "Bildirim izni kapalı..." (yani `denied`) gösteriyor; anahtar açılıp kapanınca yine istek yok. Sonuç: kullanıcı hiçbir zaman bildirim alamaz, sistem ayarlarına gitmesi için düğme de yok. `pm grant` sonrası her şey çalışıyor (plan kuruluyor, bildirim geliyor), yani sorun yalnızca izin isteme yolunda.
- Şüpheli neden (kod okuma): `src/notify/wiring.ts` `requestPermissionAndSync` yalnızca `status === 'undetermined'` iken `requestPermission()` çağırıyor. Ama Android'de `expo-notifications` `getPermissionsAsync`, izin henüz sorulmamışken de `denied` döndürüyor: `node_modules/expo-notifications/android/.../NotificationPermissionsModule.kt` API33 dalında `areAllDenied -> DENIED` ve `!areEnabled -> DENIED` (izin verilmemişse `areNotificationsEnabled()` false) `UNDETERMINED`den önce geliyor. Yani `undetermined` Android 13+'da hiç dönmüyor, istek dalına girilmiyor. Ek olarak `ensureChannel()` yalnızca izin `granted` iken çağrılıyor; Android 13'te kanal yokken de diyalog gösterilmeyebilir (expo dokümanı). Düzeltme yönü: Android'de `status !== 'granted' && canAskAgain` iken istemek + istekten önce kanalı oluşturmak. Jest testleri bunu yakalamıyor çünkü scheduler mock'luyor.
- Kanıt: `pm clear` çıktısı + `dumpsys package` (granted=false), c/o `p1.png`, `st1.png`, `st2.png`, logcat'te izin aktivitesi yok.

### BLG-02 - Blokör - Hafta ekranı aynı hafta içindeki yeni check-in'leri göstermiyor (bayat veri)
- Madde: W-02 (etkiler K-01/K-02 akışlarını).
- Adımlar: Hafta sekmesini bir kez aç (1 dolu gün: "2 gün daha lazım"); Bugün'de 2 gün daha kaydet (DB'de 3 dolu gün); Hafta'ya dön.
- Beklenen: 3 nokta dolu, "Kartın hazırlanıyor, Pazar 20:00'de açılacak.".
- Gerçek: "Kartın için 2 gün daha lazım." kalıyor (w2.png/w4.png); kart açıldıktan sonra da Hafta eski metni ("Bugünü işaretlemeden kartın açılmaz") gösteriyor. Uygulama yeniden başlatılınca doğru.
- Şüpheli dosya: `src/app/(main)/week.tsx` (satır ~46-57) veriyi yalnızca `[weekStart, weekEnd]` değişince yüklüyor; sekme odağa gelince yeniden yükleme yok (`useFocusEffect` yok).
- Kanıt: `dbq` çıktısı 3 `checkin`, ekran görüntüsü `w4.png`.

### BLG-03 - Blokör - "Bugün"/"şimdi" uygulama açıkken güncellenmiyor (gün/hafta dönümü)
- Madde: C-05 (dolaylı), etkiler K-01/K-02/B-serisi.
- Adımlar: Uygulama açıkken (veya arka planda) sistem saatini bir sonraki güne al (`adb root` + `date`), uygulamayı öne getir, Bugün'de emoji seçip Kaydet.
- Beklenen: Başlık yeni gün, kayıt yeni güne.
- Gerçek: Başlık "24 Eylül, Perşembe" kaldı, kayıt eski güne yazıldı (`checkin` 2026-09-24 satırı `updated_at` güncellendi, 2026-09-26 satırı oluşmadı) (z2.png). Gerçek kullanımda uygulama bellekte kalırsa ertesi gün yanlış güne yazar; Pazar 20:00 kart açılışı da ekran açıkken belirmez.
- Şüpheli dosya: `src/lib/now.ts` `useNow` (yalnızca dev override dinliyor; gerçek zaman tiki/AppState `active` dinleyicisi yok); `src/app/(main)/today.tsx`, `week.tsx`.
- Kanıt: `dbq` çıktısı, `z2.png`.

### BLG-04 - Blokör (K-05 Blokör) - Kart özet hapı 2. satırı kesiliyor (ekranda ve paylaşılan PNG'de)
- Madde: K-05, P-06.
- Adımlar: İlk kartı aç (özet "Bu ilk kartın, önceki haftayla kıyas henüz yok.").
- Beklenen: Özet tam görünür.
- Gerçek: `numberOfLines={2}` var ama hap yüksekliği tek satıra göre; ikinci satırın ("henüz yok.") üst yarısı görünüyor (rv3.png). Aynı kesik paylaşılan 1080x1920 PNG'de de var (card.png).
- Şüpheli dosya: `src/card/CardView.tsx` (`summaryWrapper`/`summaryPill` yüksekliği `CardLayout.summaryHeight`), `src/card/` düzen sabitleri.
- Kanıt: `%TEMP%\qa-shots\card.png`, `rv3.png`.

### BLG-05 - Blokör (A-03 Blokör) - "Tüm verilerimi sil" sonrası uygulama onboarding'e dönmüyor, tutarsız durumda kalıyor
- Madde: A-03.
- Adımlar: Ayarlar > Tüm verilerimi sil > Sil. Sonra Bugün'de check-in yap.
- Beklenen: İlk açılış durumu (onboarding), bildirim izinleri/planı yeniden kurulur.
- Gerçek: Ekran Ayarlar'da kalıyor (anahtar hâlâ "açık"), veri tabloları boş (`setting` boş); ardından yapılan check-in `onboarding_done` yokken kaydediliyor, `dumpsys alarm` 0 (bildirim planı kurulmuyor), `first_open_date` yok (D7 "unknown" olur), `metric_event` yazılıyor. Soğuk açılışta onboarding'e dönüyor.
- Şüpheli dosya: `src/app/(main)/settings.tsx` (satır ~68-73 yalnızca `getAllSettings` ile state yeniliyor, `router.replace('/onboarding/welcome')` yok).
- Kanıt: dl2.png, `dbq` (`setting []`, sonra tek check-in), alarm sayısı 0.

### BLG-06 - Önemli - Kart ekranından `X` ile çıkınca gereksiz "Bugünü işaretle" ara ekranı
- Madde: K-04.
- Adımlar: Pazar 20:00'te bugün boşken Hafta > kutu > ara ekran > Bugünü işaretle > kaydet > kart açılır > `X`.
- Beklenen: Hafta ekranı.
- Gerçek: "Kartını açmadan önce bugünü de ekleyelim." ara ekranına dönülüyor (bugün zaten dolu); Geri ile Hafta'ya çıkılıyor. Hafta metni de bayat (BLG-02).
- Şüpheli dosya: `src/app/card/[weekStart].tsx` (`router.back()`), `src/app/(main)/today.tsx` (`router.replace` sonrası geri yığını; ara ekran yığında kalıyor).

### BLG-07 - Önemli - Dar/küçük ekranda kart ekranında bindirme (X ve Paylaş)
- Madde: E-01.
- Adımlar: `wm size 720x1280`+`density 320` veya `density 540`; `haftik://card/2026-09-21`.
- Gerçek: `X` unvanın üstüne biniyor; küçük ekranda `Paylaş` düğmesi özet hapını ve damgayı örtüyor (sz1_card.png, sz2_card.png).
- Şüpheli dosya: `src/app/card/[weekStart].tsx`, `src/card/CardView.tsx` (mutlak konumlu kapat/paylaş, sabit kart yüksekliği).

### BLG-08 - Önemli - Büyük yazı tipinde (2.0) kesilme/taşma
- Madde: E-02.
- Gerçek: Kart satırları "..." ile kesiliyor (fs_card.png), Ayarlar'da 23:00 çipi ekrandan taşıyor (sarma yok), alt sekme etiketi ikonla çakışıyor (fs_set.png). 1.3'te sorun yok.
- Şüpheli dosya: `src/components/settings-view.tsx` (çip satırı `flexWrap` yok), `src/card/CardView.tsx` (`numberOfLines`, sabit satır yüksekliği). Paylaşılan PNG'nin kullanıcı yazı tipi ölçeğinden bağımsız üretilip üretilmediği ayrıca doğrulanmalı.

### BLG-09 - Düşük - Bildirime dokunma hiçbir yere yönlendirmiyor
- Madde: B-03. Kodda `addNotificationResponseReceivedListener`/`useLastNotificationResponse` yok; uygulama son ekranında açılıyor (günlük -> Bugün, kart -> Hafta beklenir).

### BLG-10 - Düşük - Birleşik manifestte 3. parti launcher rozet izinleri ve c2dm izni
- Madde: G-03. `com.sonyericsson.home.permission.BROADCAST_BADGE`, `me.everything.badger.*`, `com.anddoes.launcher.*`, `com.oppo.launcher.*`, `com.huawei.android.launcher.*`, `com.sec.android.provider.badge.*`, `com.google.android.c2dm.permission.RECEIVE` isteniyor (expo-notifications rozet/FCM bağımlılıkları). Mağaza izin formu/gizlilik anlatımı ve `blockedPermissions` ihtiyacı değerlendirilmeli; release birleşik manifest (G-09) ile karşılaştırılmalı.

### BLG-11 - Düşük - Bildirim küçük simgesi genel halka
- Madde: B-02 (nt2.png): "Haftik" bildirimi varsayılan beyaz halka simgesiyle geliyor (özel monokrom simge yok).

### BLG-12 - Düşük (bilinen) - Dev saat düğmesi "Ayarlar" sekme etiketini örtüyor
- Yalnızca debug; checklist'te zaten Düşük/bilinen.

### Gözlem (bulgu sayılmadı)
- Dev zaman simülasyonu, bildirim planına da sızıyor: dev menüde simüle tarih varken alarmlar simüle tarihlere kuruluyor (`getNow` kullanıldığı için; yalnız debug).
- 2 kez (`date` geriye alındıktan / `pm clear` sonrası) uygulama temiz veriyle açılıp onboarding'i atlayıp doğrudan Bugün'e geçti (`onboarding_done=true`, `first_open_date` yazılı) ve 3 tekrarda yeniden üretilemedi; muhtemelen bende eşzamanlı `input tap` yarışı. Cihazda "temiz kurulum > onboarding" tekrar denenmeli.
- Kart açılışında ilk denemede sistem geri gösterge `Cannot connect to Expo CLI` (ortam).

## Emülatörde yapılamayan / cihazda kalanlar

- Dokunmatik "his"/akıcılık: K-03 (reveal), C-04 (8 sn kronometre).
- Gerçek paylaşım hedefleri: P-04 (WhatsApp), P-05 (mesaj/bağlantı taşınması, Galeri), R-02 (raporun hedefte okunması), P-03'ün "paylaşım sonrası" yarısı.
- Pil/OEM: D-02, D-03, D-05; yeniden başlatma D-04 (ATLANDI, `RECEIVE_BOOT_COMPLETED` manifestte var).
- Release derlemesi: G-01, G-02 (ağ izleme/PCAPdroid), G-06, G-07, G-08, G-09; G-03/G-04/G-05 debug'da geçti, release'te tekrarlanmalı.
- TalkBack: E-03 (koşulmadı); ekran görüntüsü davranışı ve recents küçük resmi: P-09/G-10 gerçek cihazda.
- Koşulmayan ama emülatörde (adb root ile) yapılabilir: K-07, B-06 (Pazar kart bildirimi), B-07/B-08/B-09 (saat dilimi/DST), A-04'ün gerçek teslim kısmı, D-01'in süreç kapalıyken teslim kısmı.
- Bildirim teslimi ~82 sn gecikti (inexact alarm); gerçek cihazda Doze/pil ile sapma ölçülmeli.

## Düzeltme durumu (2026-09-24, MOB)

Kod düzeltmeleri asıl repoya yazıldı; emülatörde YENİDEN doğrulanmadı (yeniden derleme + Metro gerekir, Batuhan yapacak). "Düzeltildi" = kod + Jest testi; cihaz kanıtı bekler. Doğrulama: `npm run typecheck`, `npm run lint`, `npm test` (69 suite: 854 geçti, 3 atlandı, 0 kaldı; typecheck ve lint temiz; expo-doctor 20/21, bkz. CLAUDE.md).

| Madde | Durum | Nasıl |
|---|---|---|
| BLG-01 (izin diyaloğu yok) | Düzeltildi | Kaynak doğrulandı (`NotificationPermissionsModule.kt`): API 33+ hiç sorulmamış izin `denied` + `canAskAgain: true` döner, `undetermined` dönmez. `requestPermissionAndSync` artık `granted`/`canAskAgain`e göre karar verir (`scheduler.getPermissionState`), istekten önce kanalı oluşturur, kalıcı retse istek yapmaz. Test: `__tests__/notify/permission-android13.test.ts`. |
| BLG-02 (Hafta bayat) | Düzeltildi | `week.tsx` yüklemeyi `useFocusEffect` içine aldı (odakta yeniden yükler, eski veri yeniden yükleme sırasında görünür kalır). Test: `__tests__/app/week-route.test.tsx`. `today.tsx` bilerek odakta yeniden YÜKLEMEZ (yarım seçim kaybolurdu). |
| BLG-03 (`useNow` güncellenmiyor) | Düzeltildi | `useNow`: AppState `active` + gece yarısı / Pazar 20:00 zamanlayıcısı (`msUntilNextTick`, tetiklenince yeniden kurulur); dev override aynı nesneyi döndüğünden dev menü davranışı değişmedi. `today.tsx` "dün" seçimi gün değişince bugüne döner. Test: `__tests__/lib/now-live.test.tsx` (sahte zamanlayıcı). |
| BLG-04 (özet 2. satır kesik) | Düzeltildi | `summaryHeight` 48 -> 56, `gapAfterSummary` 40 -> 32 (toplam 640 korundu), satır yüksekliği 20 + pill dolgusu 6; `adjustsFontSizeToFit` güvencesi. En uzun özet ile test. PNG'de gerçek piksel doğrulaması cihazda. Test: `__tests__/card/card-layout-fixes.test.tsx`. |
| BLG-05 (silme sonrası onboarding yok) | Düzeltildi | `settings.tsx` silme sonrası `router.replace('/')`; onboarding kapısı yeni mount'ta DB'yi okur (`onboardingDone` silindiği testle doğrulandı). Onboarding "İzin ver"/"Şimdi değil" çift dokunuşa karşı korundu. "Temiz veriyle onboarding atlandı" yeniden üretilemedi; kod incelemesinde yarış/varsayılan "done" bulunmadı (kapı `loading` ile başlar, okuma bitmeden yönlendirmez, hata -> onboarding); büyük olasılıkla eşzamanlı `input tap` idi, çift dokunuş koruması eklendi. Test: `__tests__/app/onboarding-after-delete.test.tsx`. |
| BLG-06 (X ile gereksiz ara ekran) | Düzeltildi | Kart ekranı Kapat: `router.dismissTo('/week')`. Ara ekran yalnızca ilk açma girişiminde kalır. Cihazda yığın davranışı doğrulanmalı. |
| BLG-07 (dar ekranda X/Paylaş çakışması) | Düzeltildi | `CardRevealView`: SafeArea + sabit üst çubuk (Kapat, 48dp) + sabit alt çubuk (Paylaş) + kart `computeCardDisplayScale` ile kısa/dar ekranda küçülür (yalnızca görünüm; PNG hep 360x640). Test: `card-layout-fixes.test.tsx`. Cihazda 720x1280@320 ve 1080x2400@540 yeniden denenmeli. |
| BLG-08 (font 2.0) | Düzeltildi | `CardView` tüm metinlerde `allowFontScaling={false}` (PNG cihaz ayarından bağımsız); Ayarlar çipleri `flexWrap`; Hafta/Ayarlar `ScrollView`. Sekme etiketi ikonla iç içe: sekme çubuğu sistem bileşeni, açık (emülatörde 2.0'da tekrar bakılmalı). |
| BLG-09 (bildirime dokunma yönlendirmiyor) | Açık | Bu tur kapsam dışı (yeni davranış: bildirim yanıt dinleyicisi). Ayrı intent önerilir. |
| BLG-10 (launcher rozet/c2dm izinleri) | Açık | Release merged manifest (G-09) ile birlikte değerlendirilecek. |
| BLG-11 (bildirim küçük simgesi) | Açık | Özel monokrom simge varlığı gerekir; S10/S12 cila. |
| BLG-12 (dev düğmesi sekme etiketini örtüyor) | Düzeltildi | `dev-time-menu.tsx` düğmesi `bottom: 110` (sekme çubuğunun üstü); yalnızca dev, üretim paketinde olmama korunur (`src/dev/*` statik import yok). |
| B1 (tümü soluk) | Düzeltildi | Soluklaştırma yalnızca o kategoride seçim varken. Test: `checkin-picker-a11y.test.tsx`. |
| B2 (seviye etiketi/erişilebilirlik) | Düzeltildi | `CATEGORY_LEVEL_LABELS_TR` (spec sözcükleri); `accessibilityLabel` "Hareket: hafif"; seçili seviyenin adı başlıkta; emoji 28 -> 40. |
| B3 (Kaydet neden pasif) | Düzeltildi | "N kategori kaldı" ipucu (tavsiyesiz). |
| B4 (`<` küçük/etiketsiz) | Düzeltildi | "‹ Dün" / "Bugün ›" >= 48dp, etiketli; başlıkta "Bugün"/"Dün" + tarih. `ekran-akisi.md` güncellendi (belgelendi). |
| B5 (aynı cümle iki kez) | Düzeltildi | Başlık = ilerleme, kutu altı = zaman; "Kartın hazırlanıyor." kısaldı. `week-status-copy.ts`, `ekran-akisi.md`; `week-status-copy.test.ts` 2 beklenti bilinçli güncellendi + tekrar olmadığını doğrulayan test eklendi. |
| B6 (kilit/pill örtüşmesi) | Düzeltildi | İskelet dikeyde dağıtıldı, alt damga bloğu, kilit 56dp daire zeminde. |
| B7 (bugün noktası) | Düzeltildi | 24dp nokta, bugün için dış halka (dolu/boş), kalın gün etiketi, erişilebilirlik etiketi. |
| B8 (anahtar açık + izin kapalı) | Düzeltildi | Anahtar izin yokken KAPALI; dokununca izin istenir; kalıcı retse "Ayarları aç" (`Linking.openSettings`); odak + AppState `active`te izin yeniden okunur ve verildiyse plan kurulur. Metin: "Bildirim izni kapalı, hatırlatma çalışmaz." Testler: `settings-view.permission.test.tsx`, `settings-route.test.tsx`. |
| B9 (seçili çip kontrastı) | Düzeltildi | Seçili çip 2px çerçeve + kalın yazı. |
| B10 (48dp / ScrollView) | Düzeltildi | Çip, bağlantı, sil, Kaydet, Dün/Bugün, Kapat, Paylaş >= 48dp; Hafta ve Ayarlar `ScrollView`; kilitli iskelet yüksekliği ekrana göre sınırlı. |
| B11 (boş alan) | Açık | Düşük, kapsam dışı (isteğe bağlı cila). |
| B12 ("S12" metni) | Düzeltildi | "Gizlilik politikası yayına yakın eklenecek." Deneme raporu düğmesinin yalnızca preview'da gösterilmesi ürün kararı, açık. |
| B13 (sekme kontrastı) | Düzeltildi | `tabBarInactiveTintColor: theme.textSecondary`, aktif `theme.text`. Emoji ikonlar tint almaz (vektör ikon S10 cila). |
| B14 (koyu mod) | Karar bekliyor | Kod DEĞİŞMEDİ; CLAUDE.md "Bilinen tuzaklar"da not (v1 yalnızca açık tema mı?). |
| YB-1 (Dün düğmesi durum çubuğu altında; ikonlar görünmüyor) | Düzeltildi | `useTopInset` ile Bugün/Hafta/Ayarlar/ara ekran üst dolgusu; `StatusBar style="auto"`. Test: `__tests__/components/safe-area-and-lock.test.tsx`. Cihazda doğrulanmalı (JS değişikliği, Metro yeterli). |
| YB-2 / B6 (kilit 4. çubuğa biniyor) | Düzeltildi | Kilit akışta, pill ile damga arasında. Test aynı dosyada. |
| YB-3 ("sosyal—") | Düzeltildi | "sosyal: haftanı". |
| YB-4 (font 2.0 sekme çubuğu) | Açık | Sistem sekme çubuğu; Düşük. |
| YB-5 (dev düğmesi Kaydet'i örtüyor) | Düzeltildi | Dev düğmesi başlık altı sağ kenara taşındı. |
| YB-6 (yapılandırma değişiminde rota sıfırlanır) | Bilgi | CLAUDE.md'ye not; kod değişmedi. |
| YB-7 (Hafta "Kartın hazır!" kalıyor) | Düzeltildi | Kayıtlı kart varsa "Kartın açıldı." + "Kartını tekrar görmek için dokun". `week-route.test.tsx` mock'una `getCard` eklendi (minimum). |
| Gözlem: dev zaman -> bildirim planı | Bilgi | Yalnız debug; değişmedi. |

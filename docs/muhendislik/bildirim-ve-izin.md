# Bildirim ve izin — Android platform gerçekleri

> Bildirim planlama, izin durumu, Doze/exact alarm veya izin/manifest temizliğine dokunuyorsan burayı oku.

## Android 13+ bildirim izni durum makinesi

(2026-09-24, MOB, emülatör turu) `expo-notifications` (`NotificationPermissionsModule.kt`, API 33+), henüz hiç
sorulmamış izni `status: 'undetermined'` **DEĞİL**, `denied` + `canAskAgain: true` döndürür (`areAllDenied`/
`!areEnabled` dalları `UNDETERMINED`'dan önce gelir). "Yalnızca `undetermined` iken iste" mantığı bu yüzden
diyaloğu hiç göstermiyordu (BLG-01, düzeltildi). Karar artık `granted` ve `canAskAgain`e göre verilir:

- İzin yok + `canAskAgain` → kanalı oluştur, isteği yap.
- `canAskAgain: false` → istek **yok**, yalnızca "Ayarları aç".
- Ayarlar anahtarı izin yokken kapalı çizilir; izin odakta ve `AppState` `active`'teyken yeniden okunur.

Mock'lu Jest testleri bu farkı yakalamaz — `fake-notifications.ts`'e `canAskAgain` alanı eklendi, gerçek durum
`__tests__/notify/permission-android13.test.ts`'te taklit edilir. (Kaynak: `scheduler.getPermissionState`,
`wiring.requestPermissionAndSync`.)

## FCM / Firebase tam kaydı

(2026-09-23, MOB/S8, SEC bulgusu 3) `expo-notifications`'ın Android manifesti şunları ekler: `POST_NOTIFICATIONS`,
`RECEIVE_BOOT_COMPLETED` (yeniden başlatmada planı korur, istenen davranış) ve bir FCM servisi
(`ExpoFirebaseMessagingService`); `firebase-messaging` pakete gömülü gelir, biz eklemedik/çağırmıyoruz.
`google-services.json` olmadığı için FCM token alınmaz/uzak push çalışmaz — **bu yalnızca kod okumasından
çıkarımdı**, ölçülmüş kanıt değildi. Doğrudan bağımlılıkları: `@expo/image-utils`, `abort-controller`, `badgin`,
`expo-application`, `expo-constants`. `expo-notifications` config plugin'i **bilerek** eklenmedi (iOS'ta
`aps-environment` push yetkisi getirir, yerel bildirim için gerekmez).

**Güncelleme (2026-10-01, A16/A17 kararları):** release APK'nın birleşik manifesti emülatörde ölçüldü
(`docs/inceleme-2026-09-25/12-performans.md`, `22-platform-v2.md`): `INTERNET`, `ACCESS_NETWORK_STATE`,
`com.google.android.c2dm.permission.RECEIVE`, `BIND_GET_INSTALL_REFERRER_SERVICE` ve ~16 satıcı rozet izni var,
`AD_ID` yok. Karar: önce emülatörde referans ağ ölçümü, sonra INTERNET izni **yalnız release derlemesinden**
config plugin ile kaldırılır (debug/Metro etkilenmez), rozet/c2dm/referrer/`ACCESS_NETWORK_STATE` engellenir,
`WAKE_LOCK` ilk build'de kalır (bildirim planlaması için gerekli olabilir, iki rapor da aynı sonuca vardı).
`aapt2 dump permissions` çıktısından "altın izin listesi" üretilip elle sayım yerine mekanik karşılaştırma
yapılır. Ayrıntı ve gerekçe: `docs/kararlar/2026-10-01-taban-oncesi-kararlar-b.md` A16.

**Uygulandı (2026-10-02, S17), kod tarafı:** üç dosya `plugins/` altında, `app.json` `plugins` listesinde.
- `plugins/permission-policy.js`: izin politikasının TEK kaynağı (`ALWAYS_BLOCKED_PERMISSIONS` = depolama +
  `SYSTEM_ALERT_WINDOW` + `ACCESS_NETWORK_STATE` + c2dm + referrer + 16 rozet izni; `RELEASE_ONLY_REMOVED_PERMISSIONS`
  = `INTERNET`; `GOLDEN_RELEASE_PERMISSIONS` = yalnız `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `VIBRATE`,
  `WAKE_LOCK`, `<applicationId>.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`). İzin adları release merge raporundan
  (`manifest-merger-release-report.txt`) alındı, elle yazılmadı.
- `plugins/with-permission-policy.js`: `blockedPermissions`i birleştirir (app.json'daki mevcutlar korunur) ve
  `android/app/src/release/AndroidManifest.xml` içine `INTERNET` için `tools:node="remove"` yazar. Sonuç: debug/
  Metro etkilenmez, EAS/yerel/profil fark etmeksizin her release mekanik olarak ağ iznisiz (22 §1.3 seçenek C).
- `plugins/with-data-extraction-rules.js`: A17, bkz. aşağıda.
- `scripts/check-apk-permissions.js`: `node scripts/check-apk-permissions.js <apk> <aapt2>` release APK'nın
  `aapt2 dump permissions` çıktısını altın listeyle karşılaştırır (çıkış kodu 0/1); izin elle sayılmaz. Testler:
  `__tests__/plugins/permission-policy.test.ts` (politika verisi + XML sözleşmesi + altın liste karşılaştırması).
- `WAKE_LOCK` bilerek KALDI (22 §1.6): kaldırma ikinci adım, yalnız Doze/teslim testinden sonra.
- `expo prebuild` çıktısı elle doğrulandı: release overlay'de `INTERNET` remove, ana manifestte 22 engelli izin
  `tools:node="remove"`, `<application android:dataExtractionRules="@xml/data_extraction_rules">`.
  Not: prebuild `android/` klasörünü sıfırdan üretir (gitignore'da); yerel release derlemesi için
  `ANDROID_HOME` verilmeli (`C:\Users\Pc\AppData\Local\Android\Sdk`).

## Cihazdan cihaza aktarım (A17 kararı)

`allowBackup:false` yalnızca **bulut** yedeğini kapatır. Android'in cihazdan cihaza aktarımı (kablolu/kablosuz,
D2D) bu veriyi gerçekte taşıyabilir — onboarding ve site metnindeki "telefon değişirse veri taşınmaz" sözü bu
yüzden kanıtsızdı. Karar: `dataExtractionRules` ile D2D de gerçekten kapatılacak (0.2.0'dan önce, S17).

**Uygulandı (2026-10-02, S17):** `plugins/with-data-extraction-rules.js` `res/xml/data_extraction_rules.xml`
yazar (hem `<cloud-backup>` hem `<device-transfer>` altında `root`, `file`, `database`, `sharedpref`, `external`
ve `device_*` alanları `exclude`, hiç `include` yok) ve manifestte `android:dataExtractionRules` ayarlar. Kaynak
manifestten başvurulduğu için `shrinkResources` atmaz. **Cihaz kanıtı kalan:** `aapt2 dump xmltree` ile
manifestte görünmesi (release APK) + GMS'li imajda D2D test modu (`bmgr`, 22 §1.5) + OEM aktarım araçları (K5).

## Exact alarm ve gecikme

(2026-09-23, MOB/S8) `SCHEDULE_EXACT_ALARM` izni bilerek eklenmedi (izin/mağaza riski); sistem bildirimi tam
dakikasında değil, birkaç dakikalık sapmayla (Doze/pil yönetimi) teslim edebilir. Emülatörde ölçülen gecikme
~82 saniye (`docs/inceleme-2026-09-25/09-emulator-dogrulama.md` B-02) — beklenen ve kabul edilen davranış.

## Bildirim kanalları (A12 kararı)

İki kanal: `daily` (günlük hatırlatma), `card-ready` (kart hazır) — **sesli**, DEFAULT önem (kullanıcı sistem
ayarından değiştirebilir). Kartın planlandığı Pazar günü `daily` **üretilmez**, yalnızca `card-ready` planlanır
(A13 kararı; önceden ikisi de planlanıp ters sırada gelebiliyordu, 04-kod-incelemesi.md #11). Ayarlar'da iki
ayrı anahtar bu kanal modeliyle birebir eşleşir.

**Kanal tanımı uygulandı (2026-10-01, S15):** `src/notify/scheduler.ts` `NOTIFICATION_CHANNEL_IDS`
(`daily`, `card-ready`), isimler "Günlük hatırlatma"/"Kart hazır", `AndroidImportance.DEFAULT`, `sound:
'default'`. `ensureChannel()` ikisini de oluşturur ve eski tek kanalı (`hhk-reminders`) en iyi çabayla
(`deleteNotificationChannelAsync`, hata yutulur) siler. `replaceAll` her bildirimi `item.kind`ine ait
kanala planlar. Ayarlar'daki ayrı "Kart hazır" anahtarı (UI) hâlâ **S23**'e kalıyor — bu turda yalnızca
kanal/planlama tarafı yapıldı.

## Kaçırılan hafta yolu (T2, 2026-10-01 S15)

Saf `findOpenableWeeks({checkins, cardWeekStarts, now})` (`src/domain/week.ts`): check-in'leri haftalara
gruplar (SQL'de hafta aritmetiği yapılmaz, tek kaynak `week.ts`), hem uygun (`getWeekState().unlocked`) hem
kartı kaydedilmemiş haftaları artan sırada döner. Yeni repo fonksiyonları `getAllCheckins`/`getCardWeekStarts`.
Hafta ekranında `MissedWeekBanner` ("Geçen haftanın kartı seni bekliyor"), yalnız en yeni bekleyen hafta
(mevcut hafta hariç tutulur); dokununca normal `card/[weekStart]` reveal'i (K3 uygulanmaz). Birden fazla
bekleyen haftanın kalıcı evi **S25 Albüm** (aynı fonksiyon orada da kullanılacak).

**Tuzak:** `useFocusEffect`in `useCallback` bağımlılık dizisine `now` (bir `Date` nesnesi) EKLENMEMELİ —
kimliği her çağrıda değişen bir `useNow()` sahtesiyle (ör. test mock'u `() => new Date(...)`) sonsuz render
döngüsüne yol açar (`useCallback` her render'da yeni referans üretir → efekt yeniden kurulur → `setData` →
yeniden render → ...). `now` kapanışta (closure) bırakılır, `eslint-disable-next-line
react-hooks/exhaustive-deps` ile — aynı desen zaten `card/[weekStart].tsx`te vardı.

## Bildirim tıklaması yönlendirmesi (T3, 2026-10-01 S15)

`scheduler.ts` `replaceAll`, `card-ready` bildirimine `data.weekStart` ekler (`daily` eklemez, rotası zaten
sabit `/today`). Saf `resolveNotificationRoute(data, today)` (`src/notify/notification-routing.ts`) sabit rota
tablosunu uygular: bilinmeyen/eksik `kind` → `/week`, `daily` → `/today`, `card-ready` + geçerli `weekStart`
→ `/card/<weekStart>`, `card-ready` + eksik/geçersiz `weekStart` (güncellemeden önce planlanmış bildirim) →
`/week` (T2 banner'ı zaten gösterir). Bildirim verisi **dış girdi** sayılır, `isValidWeekStartParam` ile
yeniden doğrulanır (kendi değerine güvenilmez). `useNotificationRouting()` kökte (`_layout.tsx`) bir kez
çağrılır; soğuk açılış (`scheduler.getLastResponse()`) ve sıcak açılış (`scheduler.onResponseReceived`) aynı
çözümü kullanır, her yanıt `clearLastResponse()` ile bir kez işlenir, navigasyon `useRootNavigationState().key`
hazır olana kadar ertelenir. `getLastResponse`/`onResponseReceived`/`clearLastResponse` var olan DI deseniyle
(`NotificationScheduler`) eklendi, `expo-notifications` yine yalnızca `scheduler.ts`te (tembel require) çözülür.

**Tuzak (iki ayrı lint hatası, art arda):** bekleyen rota ve "navigasyon hazır mı" `useState` ile tutulursa
`react-hooks/set-state-in-effect` hatası (efekt içinde senkron `setState`); `useRef`'e geçip ref'e RENDER
SIRASINDA yazmak bu sefer `react-hooks/refs` hatası verir (ref yazımı yalnızca efekt/event handler içinde
olmalı). Çözüm: iki ref (`pendingRouteRef`, `navReadyRef`), ikisi de yalnızca bir EFEKT içinde yazılır.
`useRouter()` expo-router'da modül seviyeli bir tekil döndürdüğü için (`node_modules/expo-router/build/
hooks/useRouter.js`) mount-anı kapanışındaki `router` referansı da güvenle sabit kalır.

**Önkoşul ertelendi:** TB-10 (`openOrBuildCard`'da `now`'ı zorunlu kılma) üçüncü kez bilerek ERTELENDİ — T3 onu
gerektirmedi. **K4 kanıtı yok**: sıcak/soğuk açılışta gerçek yönlendirme (`am force-stop` sonra bildirime
dokunma) bu ortamda doğrulanamadı, sonraki cihaz oturumuna kalıyor.

## V-03: izin diyaloğu geri tuşuyla kapatma (düzeltildi, 2026-10-01 S15)

`05-platform-gercekleri.md` P-03/V-03, emülatörde tekrar üretilmişti: Android 13+ izin diyaloğu **geri
tuşuyla** kapatılırsa Expo'nun kendi `blocked` bayrağı `true` yazıyor ve `canAskAgain` yanlışlıkla `false`
dönüyor — ama OS bayrağı `USER_SET`/`USER_FIXED` DEĞİL, yani sistem aslında tekrar sorabilir. Eski kod
`canAskAgain: false` iken isteği hiç yapmıyordu (yalnızca "Ayarları aç" gösteriyordu), bu da kullanıcıyı
aslında kurtarılabilir bir durumda gereksiz yere ayarlara yönlendiriyordu. **Düzeltme:**
`wiring.ts` `requestPermissionAndSync`, `canAskAgain` ne olursa olsun `!state.granted` iken isteği dener —
gerçekten kalıcı reddedilmişse istek zararsızdır (sistem diyalog göstermeden sessizce `DENIED` döner, Android
belgesi). UI `canAskAgain: false` iken "Ayarları aç"ı göstermeye devam eder (bu, tek seferlik "harçsız"
deneme buna EK bir güvence ağıdır, yerini almaz). Test: `__tests__/notify/permission-android13.test.ts`
("V-03" başlıklı iki test — kurtarma senaryosu ve gerçek kalıcı ret senaryosu).

## Teslim edilmiş bildirimleri kaldırma (22 §4.4, 2026-10-01 S15)

`cancelAllScheduledNotificationsAsync`/`cancelAll` yalnızca HENÜZ TETİKLENMEMİŞ planlı bildirimleri etkiler;
bildirim merkezinde zaten görünen (teslim edilmiş) bir bildirimi KALDIRMAZ — "Tüm verilerimi sil" sonrası ya
da kart/check-in işi bittikten sonra eski bir bildirim gölgede kalabiliyordu. `scheduler.ts`'e
`dismiss(id)`/`dismissAll()` eklendi (`expo-notifications`'ın `dismissNotificationAsync`/
`dismissAllNotificationsAsync`'i, en iyi çaba, hata yutulur). Üç bağlanma noktası:

1. **Silme:** `wiring.ts` `cancelAllNotifications` artık `cancelAll()` VE `dismissAll()`'u birlikte çağırır.
2. **Kart açılışı:** `card/[weekStart].tsx`, kart hazır olduğunda `dismissCardNotification(weekStart)` çağırır
   (o haftanın `card-<Pazar>` bildirimi, deterministik id).
3. **Check-in kaydı:** `today.tsx` `handleSave`, kaydedilen günün (`selectedDate` — bugün ya da dün olabilir,
   düzenleme penceresi) `daily-<gün>` bildirimini `dismissDailyNotification(date)` ile kaldırır.

Kimlik biçiminin tek kaynağı `domain/notify-plan.ts`teki `dailyNotificationId`/`cardNotificationId` saf
fonksiyonları (`planNotifications` da aynısını kullanır) — iki yerde ayrı yazılan şablonların bir gün
birbirinden sapması riskine karşı.

## Senkronizasyon kuyruğu

(2026-09-23, MOB/S8) `syncNotifications` tüm çağrıları modül içi tek kuyrukta seri çalıştırır ve DB okumasını
kilidin içinde yapar (eşzamanlı açılış + check-in kaydında sonuç her zaman son veriye göre). Sync
`onboardingDone` ve izin `granted` ile kapılıdır; arka plan sync **asla** izin istemez (yalnızca onboarding ve
Ayarlar'daki aç anahtarı `requestPermissionAndSync` ile ister). `deleteAllData` bildirim iptal hatasını yutar,
tabloları her durumda siler. Silme akışı da aynı kuyruğa alınır (`runDeleteExclusive`), `replaceAll` öncesi
`onboardingDone` yeniden okunur, `skipped` dalı `cancelAll` çağırır.

## Push yasağı

`expo-notifications` yalnızca **yerel** planlama kullanır, push yolu kullanılmaz. Paket kaynağında
`fetch`/`XMLHttpRequest` yalnızca `getExpoPushTokenAsync` ve push token kaydı içinde geçer; bu API'ler ve
`getDevicePushToken`/`addPushTokenListener` hiçbir yerde çağrılmaz — `__tests__/notify/no-push.test.ts`
`src/` içinde bu adları tarar (mekanik, 0 eşleşme beklenir). `getExpoPushTokenAsync` **asla** çağrılmamalı.

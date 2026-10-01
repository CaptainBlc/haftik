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

## Cihazdan cihaza aktarım (A17 kararı)

`allowBackup:false` yalnızca **bulut** yedeğini kapatır. Android'in cihazdan cihaza aktarımı (kablolu/kablosuz,
D2D) bu veriyi gerçekte taşıyabilir — onboarding ve site metnindeki "telefon değişirse veri taşınmaz" sözü bu
yüzden kanıtsızdı. Karar: `dataExtractionRules` ile D2D de gerçekten kapatılacak (0.2.0'dan önce, S17).

## Exact alarm ve gecikme

(2026-09-23, MOB/S8) `SCHEDULE_EXACT_ALARM` izni bilerek eklenmedi (izin/mağaza riski); sistem bildirimi tam
dakikasında değil, birkaç dakikalık sapmayla (Doze/pil yönetimi) teslim edebilir. Emülatörde ölçülen gecikme
~82 saniye (`docs/inceleme-2026-09-25/09-emulator-dogrulama.md` B-02) — beklenen ve kabul edilen davranış.

## Bildirim kanalları (A12 kararı)

İki kanal: `daily` (günlük hatırlatma), `card-ready` (kart hazır) — **sesli**, DEFAULT önem (kullanıcı sistem
ayarından değiştirebilir). Kartın planlandığı Pazar günü `daily` **üretilmez**, yalnızca `card-ready` planlanır
(A13 kararı; önceden ikisi de planlanıp ters sırada gelebiliyordu, 04-kod-incelemesi.md #11). Ayarlar'da iki
ayrı anahtar bu kanal modeliyle birebir eşleşir.

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

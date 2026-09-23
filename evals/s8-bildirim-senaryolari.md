# S8 — Bildirim test/uç durum senaryoları (uygulamadan ÖNCE)

Kaynak: `plan.md` S8, `spec.md` "Bildirim planlama kuralları", `docs/ux/pazar-akisi.md`,
`src/domain/week.ts`, `src/data/setting-repo.ts`, `src/data/delete-all.ts`.
Bu belge test tasarımıdır; kod yok. Testi geçirmek için test gevşetilmez, kod düzeltilir.

## 0. Karar: Pazar "kart hazır" eşiği

Eşik = `getWeekState(...).requiredDays` (ilk kart 3, sonrası 4). Bildirim kuralı `thresholdMet`'i
kullanır, `timeMet`'i DEĞİL (bildirim zaten Pazar 20:00'yi hedefler). Eşik mantığı `notify-plan`
içinde yeniden yazılmaz, `getWeekState` çağrılır (tek kaynak).
Bu karar `spec.md` s.192 ("4'e ulaştığı anda") ve `plan.md` S8 metnine AYNI commit'te işlenmeli.

## 1. Önerilen saf fonksiyon imzası

```ts
planNotifications({
  now: Date,                       // enjekte; Date.now() yok
  checkins: Checkin[],             // tüm/son N gün; fonksiyon kendi haftasını süzer
  settings: { reminderEnabled: boolean; reminderTime: string /* HH:MM */ },
  hasAnyPriorCard: boolean,
}): PlannedNotification[]         // { id, kind: 'daily'|'card-ready', fireAt: Date }
```
- `id`: deterministik. `daily-YYYY-MM-DD`, `card-YYYY-MM-DD` (o haftanın Pazar'ı). Rastgele/sayaç yok.
- "Bugün dolu mu" ayrı parametre OLMASIN, `checkins` içinden türetilir (iki doğruluk kaynağı çelişemez).
- `lastOpenAt` girdisi ÖNERİLMEZ: yeniden planlama zaten açılış/check-in anında `now` ile yapılır, 7 günlük
  pencere `now`'a göre kurulduğu için sönümlenme yapısal olarak sağlanır. Ayrı girdi, ikinci bir kaynak olur.
- Hafta: `getWeekStart(now)` (Pazar için -6 gün tuzağına dikkat). Çıktı `fireAt` artan sıralı.
- Pencere: bugün .. bugün+6 (7 takvim günü). `fireAt <= now` olan hiçbir bildirim planlanmaz (eşitlik dahil).

## 2. Senaryo tabloları

Ortak varsayım (aksi belirtilmedikçe): TZ Europe/Istanbul, hatırlatma açık 21:00, hafta = Pzt 2026-09-21 .. Paz 2026-09-27,
`hasAnyPriorCard=true`. `D` = günlük hatırlatma, `C` = kart hazır (Paz 20:00). Tarihler 2026, saatler yerel.

### 2.1 Günlük hatırlatma

| # | now | Girdi | Beklenen |
|---|---|---|---|
| N-01 | Çar 09-23 12:00 | bugün boş | D: 09-23..09-29, her biri 21:00 (tam 7) |
| N-02 | Çar 12:00 | bugün dolu | D: 09-24..09-29 (6; bugün atlanır) |
| N-03 | Çar 20:59:59 | bugün boş | 09-23 21:00 DAHİL (7) |
| N-04 | Çar 21:00:00 | bugün boş | 09-23 HARİÇ (eşitlik = geçmiş), 6 adet |
| N-05 | Çar 22:30 | bugün boş | bugün planlanmaz, "telafi" bildirimi yok, 6 adet |
| N-06 | Çar 12:00 | reminderEnabled=false | hiç D yok |
| N-07 | Çar 12:00 | reminderTime "20:00" / "07:30" / "23:59" | tüm D'ler o saatte; "00:00" için bugün geçmiş, 09-24 00:00'dan başlar |
| N-08 | Çar 12:00 | reminderTime bozuk ("", "25:99", "9:5", "abc") | çökmez; 21:00 varsayılanına düşer (bkz. karar K-3) |
| N-09 | Çar 12:00 | 3 kez ardışık çağrı, aynı girdi | üç çıktı birebir eşit (saf, deterministik) |
| N-10 | Çar 12:00 | bugün boş -> check-in eklendi -> yeniden plan | D 09-23 çıktıdan düşer, kalanlar aynı id |
| N-11 | dün için check-in eklendi (düzenleme penceresi) | bugün boş | bugün hâlâ planlı (yalnızca BUGÜN dolu atlar) |
| N-12 | Sönümlenme simülasyonu: gün 0'da plan, sahte saatle gün 8'e ilerlet, uygulama açılmadı | - | gün 6 21:00'dan sonra bekleyen/tetiklenen bildirim yok; toplam D <= 7 |
| N-13 | herhangi | herhangi | toplam bildirim <= 8 (7 D + 1 C), OS sınırının çok altında |

### 2.2 Pazar 20:00 "kart hazır" ve eşik (`requiredDays`)

| # | now | Girdi | Beklenen |
|---|---|---|---|
| C-01 | Çar 09-23 | hasPrior=false, 3 dolu gün | C var (09-27 20:00) |
| C-02 | Çar | hasPrior=false, 2 dolu | C yok |
| C-03 | Çar | hasPrior=true, 3 dolu | C yok |
| C-04 | Çar | hasPrior=true, 4 dolu | C var |
| C-05 | Tablo testi | hasPrior {f,t} x dolu gün 0..7 | C var <=> dolu >= (hasPrior?4:3); `getWeekState.thresholdMet` ile birebir eşit |
| C-06 | Perş 09-24 22:00 | 4. gün az önce kaydedildi | C planlanır (check-in sonrası yeniden plan) |
| C-07 | Cmt 09-26 23:59:59 | 4 dolu | C var |
| C-08 | Paz 09-27 10:00 | 4 dolu (bugün boş) | C 20:00 + D Paz 21:00 İKİSİ DE (K3); D Pzt..Cmt 09-28..10-03; hafta = 09-21 (Pazar'da `weekStart` 09-28 olmamalı) |
| C-09 | Paz 19:59:59 | 4 dolu | C var |
| C-10 | Paz 20:00:00 ve 20:30 | 4 dolu | C yok (geçmiş; kullanıcı zaten uygulamada, akış pazar-akisi.md) |
| C-11 | Paz 15:00 | 3 dolu, hasPrior=true, bugün boş -> bugün kaydedildi | önce C yok, sonra 4. gün olduğu için C var; Paz D'si atlanır (bugün dolu) |
| C-12 | Paz 18:00 | hatırlatma 19:00 | D 19:00 + C 20:00, ikisi de |
| C-13 | Paz 15:00 | hatırlatma 20:00 tam | aynı anda iki bildirim, farklı id, biri diğerini ezmez |
| C-14 | Paz 15:00 | hatırlatma 20:01 / 19:59 / 20:30 / 22:00 | C hatırlatma saatinden bağımsız 20:00; D kullanıcının saatinde |
| C-15 | Pzt 09-28 00:00:00 | önceki hafta uygun ama açılmamış | yeni hafta 0 dolu: C yok. Geçmiş açılmamış hafta için bildirim YOK (karar K-4) |
| C-16 | Paz 23:59:59 vs Pzt 00:00:00 | - | ilki: C yok (geçmiş), ikincisi: yeni hafta. Hafta sınırı çift sayım/boşluk yok |
| C-17 | Çar | check-in'lerin bir kısmı önceki haftaya ait (Paz 09-20) | önceki haftanın günü sayıya girmez (süzme testi) |
| C-18 | Çar | aynı `localDate` iki kayıt | tek gün sayılır (`dedupeByLocalDate`) |
| C-19 | Çar 2026-12-30 | yıl sınırı: hafta Pzt 12-28 .. Paz 2027-01-03 | C id `card-2027-01-03`, D'ler yıl/ay taşmasında doğru tarihli (ay sınırı 09-30/10-01 dahil) |
| C-20 | eşik sonradan düştü: ilk plan 4 dolu -> yeniden plan girdisi 3 dolu | - | çıktıda C yok; eski C, replaceAll ile silinir (bayat bildirim kalmaz) |

hasAnyPriorCard değişimi (kritik, bildirimi bayatlatır):

| # | Sıra | Beklenen |
|---|---|---|
| H-01 | 1. hafta 3 gün, kart açılmadı, 2. hafta Çar 3 dolu: hasPrior=false -> C var. Perş kullanıcı 1. haftanın kartını açar (weekly_card yazılır, hasPrior=true) | yeniden plan ŞART; 2. hafta 3 < 4 olduğundan C kalkar. Tetikleyici olarak "kart dondurulunca" da plan çağrılmalı (bkz. bulgu B-2) |
| H-02 | Aynı, ama yeniden plan tetiklenmedi | Pazar 20:00'de "kart hazır" gelir ama kart kilitli: dokunma çökmez, kilitli kutuya düşer (manuel + bileşen testi) |
| H-03 | "Tüm verilerimi sil" sonrası hasPrior=false'a döner | hiçbir bildirim kalmaz (bkz. 2.5) |

### 2.3 Saat dilimi / DST / saat oynamaları

Jest TZ sabit (`Europe/Istanbul`); başka TZ testleri `process.env.TZ` ile yalnızca ilgili test bloğunda değişir
ve geri alınır. Windows'ta çalışma zamanında TZ değişiminin etkili olduğu İLK önce küçük bir sınama testiyle doğrulanmalı
(çalışmazsa bu satırlar cihaz/elle listesine kayar; testi silmek değil, riski yazmak gerekir).

| # | Durum | Beklenen |
|---|---|---|
| T-01 | Istanbul (UTC+3 sabit), 7 gün penceresi | her D arası tam 24 saat; DST yok |
| T-02 | Aynı an 2026-09-27T16:59Z: Istanbul Paz 19:59, New York Paz 12:59 | ikisinde de C var, her biri KENDİ yerel 20:00'sinde |
| T-03 | Aynı an 2026-09-27T22:30Z: Istanbul Pzt 01:30 (yeni hafta), New York Paz 18:30 | Istanbul: C yok; New York: eşik varsa C var (hafta yerel takvime göre) |
| T-04 | Istanbul'da plan, sonra cihaz Berlin'e (CEST UTC+2) geçti, uygulama açıldı | yeniden plan D'leri yerel 21:00'e (=19:00Z) taşır; id'ler aynı olduğundan çift bildirim OLUŞMAZ |
| T-05 | New York DST sonu 2026-11-01 (25 saatlik gün) penceresi içinde | 7 D, her biri yerel hatırlatma saatinde; günler arası fark 24/25 saat olabilir; çift ya da eksik gün yok |
| T-06 | New York DST başı 2026-03-08, hatırlatma 02:30 (yok olan saat) | çökmez, o gün için TAM 1 bildirim (kayarak 03:30) |
| T-07 | New York 2026-11-01, hatırlatma 01:30 (iki kez yaşanan saat) | o gün için TAM 1 bildirim, çökmez |
| T-08 | Kullanıcı cihaz saatini geri/ileri aldı | yeniden plan yeni `now`'a göre; sonuç saf ve idempotent |
| T-09 | `now` geçersiz (`new Date(NaN)`) | çökmez, `[]` |

### 2.4 Metin içeriği (güvenlik gereksinimi 4)

Metinler `content/` altında sabit sabitlerdir; plan çıktısı yalnızca `kind` taşır, metni scheduler kind'dan çözer.

| # | Kontrol | Beklenen |
|---|---|---|
| X-01 | Tüm bildirim başlık/gövde metinleri | rakam yok, "düşük/orta/yüksek" yok, kategori adları yok (uyku, mod, enerji, harcama vb.), emoji-seviyesi yok |
| X-02 | Aynı kind için farklı girdiler (0..7 dolu gün, farklı seviye) | metin birebir aynı (girdiye bağımlı değil) |
| X-03 | Bildirim `data` yükü | yalnızca `{kind, weekStart}`; sayı/seviye/check-in içeriği yok |
| X-04 | C metni | "kartın hazır" düzeyinde; unvan/seviye/kaç gün kaldı ipucu yok |
| X-05 | Ton | tavsiyesiz, tanısız, suçlayıcı olmayan ("seri bozuldu" gibi ifade yok) |
| X-06 | Statik tarama testi | `getExpoPushTokenAsync`, `getDevicePushTokenAsync`, `addPushTokenListener`, `registerForPushNotificationsAsync` `src/` içinde geçmez |

### 2.5 İdempotans, silme, izin, hata (scheduler + orkestratör, sahte scheduler ile)

| # | Durum | Beklenen |
|---|---|---|
| S-01 | Aynı planla `replaceAll` 3 kez | `listPending` her seferinde aynı; kopya yok |
| S-02 | Girdi değişti (check-in eklendi) | eski bekleyenlerden plan dışında kalan hiçbiri kalmaz (önce hepsini iptal et sonra kur) |
| S-03 | İki `sync` eşzamanlı (açılış + check-in kaydı aynı anda) | seri çalışır, sonuç SON çağrının planı; karışık/yarım durum yok; kopya yok |
| S-04 | Sync sırasında iptalden sonra çökme | bir sonraki açılışta düzelir; çift bildirim değil, en kötü durum "geçici boş" |
| S-05 | "Tüm verilerimi sil" | `cancelAll` çağrılır, `listPending` boş; sonra tablolar boş |
| S-06 | Silme sonrası aynı oturumda tetiklenen sync (ekran odak efekti) | bildirim yeniden KURULMAZ: `onboardingDone=false` iken sync no-op (silme ayarları varsayılana döndürür, `reminderEnabled` varsayılanı true olduğundan aksi hâlde bildirim dirilir) |
| S-07 | `cancelAll` hata fırlatırsa silme | veri silme yine de yapılır (bkz. bulgu B-1) |
| S-08 | İzin `denied` | çökmez, `schedule*` çağrılmaz, sonuç `{status:'denied'}`, Ayarlar "izin kapalı" gösterir |
| S-09 | İzin `undetermined` | arka plan sync izin İSTEMEZ (yalnızca onboarding/ayar anahtarı akışı ister) |
| S-10 | İzin sonradan sistem ayarlarından açıldı, uygulama öne geldi | sonraki açılış sync'i planı kurar |
| S-11 | Native `schedule` hatası (tek bildirim) | yakalanır, kalan bildirimler kurulmaya devam eder, uygulama çökmez, hata veri içermeden loglanır |
| S-12 | Android kanal yok | `ensureChannel()` ilk planlamadan ÖNCE çağrılır (8.0+ kanalsız bildirim düşer); test: çağrı sırası |
| S-13 | Sabit id ile ikinci `schedule` | aynı id ezilir (mock sözleşmesi bunu modellemeli), kopya oluşmaz |

Tetikleyici kümesi (her biri için "sync çağrıldı" testi): uygulama açılışı/öne gelme, check-in kaydı, kart
dondurma (bkz. H-01), hatırlatma aç/kapa, hatırlatma saati değişimi, izin verildi. Silme yalnızca `cancelAll`.

## 3. Scheduler için mock'lanabilir sözleşme (öneri, `notify/scheduler.ts`)

```ts
export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface NotificationScheduler {
  getPermission(): Promise<PermissionStatus>;
  requestPermission(): Promise<PermissionStatus>;        // yalnızca kullanıcı akışından
  ensureChannel(): Promise<void>;                        // Android; iOS'ta no-op
  replaceAll(plan: PlannedNotification[]): Promise<{ scheduled: number; failed: number }>;
  cancelAll(): Promise<void>;
  listPending(): Promise<{ id: string; kind: string; fireAt: Date }[]>;  // test / dev menü
}

export function createScheduler(deps: { notifications: ExpoNotificationsLike }): NotificationScheduler;
export async function syncNotifications(deps: {
  scheduler: NotificationScheduler; now: () => Date; /* repo okuyucular */
}): Promise<{ status: PermissionStatus | 'skipped' }>;    // gate: onboardingDone + izin
```
- `replaceAll` = önce `cancelAllScheduledNotificationsAsync()`, sonra deterministik `identifier` ile
  `scheduleNotificationAsync` (tarih tetikleyici). Uygulamanın başka bildirimi yok, bu yüzden "hepsini iptal" güvenli.
  `setting.notification_ids` doğruluk kaynağı yapılmasın (silmede zaten temizleniyor); gerekiyorsa yalnızca bilgilendirme.
- `replaceAll` içinde tek kilit/kuyruk (son çağrı kazanır).
- Testte `FakeScheduler`/sahte `notifications` modülü: bekleyen listesi id ile Map (aynı id ezilir), sahte saatle tetikleme,
  hata enjeksiyonu (`denied`, `schedule` reject). `expo-notifications` yalnızca `createScheduler` içinde import edilir;
  `domain/` ve `data/` içine sızmaz (`node:sqlite` emsaliyle aynı kural).
- `deleteAllData(() => scheduler.cancelAll())` mevcut kanca imzasına uyar.

## 4. `expo-notifications` — "ağa veri gönderiyor mu" kontrol notu

Hedef: yalnızca YEREL planlama. Uzak push, Expo push token'ı, FCM/APNs kaydı kullanılmaz.
- Yasak API'ler: `getExpoPushTokenAsync`, `getDevicePushTokenAsync`, `addPushTokenListener`, push kayıt akışı (X-06 statik test).
- Kurulum: `npx expo install expo-notifications`; sonrasında `npm ls`/lockfile ile dolaylı bağımlılıklar listelenir,
  paket kaynağında `fetch(`/`XMLHttpRequest`/`http` taraması yapılır, sonuç `CLAUDE.md` "Bilinen tuzaklar"a yazılır (S7b emsali).
- DOĞRULANMAMIŞ, varsayılmayacak: kütüphanenin config plugin'i/manifesti Android'de push ile ilgili bileşen/izin
  (FCM servisi, `RECEIVE_BOOT_COMPLETED`, olası INTERNET/c2dm) ve iOS'ta `aps-environment` yetkisi ekleyebilir.
  `npx expo prebuild` sonrası birleşik `AndroidManifest.xml` ve iOS entitlements çıktısı incelenir; gereksiz izin
  `app.json` `android.blockedPermissions` ile çıkarılır. Bu, S10 "üretim derlemesinde ağ yok" kanıtının (a) maddesine girer.
- Android'de tam zamanlı alarm (Android 12+ exact alarm) izni ve pil yönetimi cihaz testine kalır: hatırlatma dakikalarca
  kayabilir; "belirlenen saatte gelir" kanıtı gerçek cihazda ölçülür (E13 riski).

## 5. Elle/cihaz maddeleri (emülatör yeterli değil, plan.md S8 kanıtı)

Hatırlatma saati kısa ayarlanıp gelir; check-in sonrası bugünkü iptal; C tetiklenir ve dokunma akışı
(`unlocked` ve bugün boşsa ara ekran, kilitliyse kilitli kutu); "Tüm verilerimi sil" sonrası bekleyen yok;
kilit ekranı metni sabit; izin reddi -> Ayarlar durumu; saat dilimi değişince yeniden plan; pil tasarrufu modunda gecikme notu.

## 6. Kararlar ve bulgular

Kararlar (varsayılan önerilenle yazıldı, Batuhan onayı gerekirse `intent`/`plan` güncellenir):
- K-1: hatırlatma kapalıyken C yine planlanır (aç/kapa "günlük hatırlatma"dır; C ürünün ödülü). Ayar etiketi bunu yansıtmalı. Ürün kararı; test her iki değere parametrik yazılabilir.
- K-2: `lastOpenAt` parametresi yok (bölüm 1).
- K-3: bozuk `reminderTime` -> 21:00'e düş, sessizce bildirimsiz kalma.
- K-4: yalnızca içinde bulunulan haftanın Pazar'ı için C; geçmiş açılmamış hafta için bildirim yok.

Bulgular:
- B-1 (gizlilik, yüksek): `src/data/delete-all.ts` `await Promise.resolve(cancelNotifications())` yapıyor ve try/catch yok; kanca
  hata fırlatırsa dört tablo HİÇ silinmez. Silme, bildirim hatasından bağımsız tamamlanmalı (hata yakalanıp bildirilir, veri silinir). S-07 bunu kilitler.
- B-2 (doğruluk): mevcut spec tetikleyicileri "açılış + check-in". Kart dondurma da `hasAnyPriorCard`'ı değiştirip eşiği 3->4 yapar (H-01); tetikleyiciye eklenmeli.
- B-3 (doğruluk): silme sonrası `setting` boşalınca `reminderEnabled` varsayılanı `true` olur; sync `onboardingDone`/izin ile kapılanmazsa bildirim yeniden kurulur (S-06).
- B-4: `plan.md`/`spec.md`'deki "4" ifadesi `requiredDays` kararıyla güncellenmeli (Bölüm 0). Mevcut `evals/checklist.md`'ye C-05, H-01, S-06, B-1 maddeleri eklenmeli.

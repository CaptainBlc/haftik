# 09 - Emülatör doğrulaması (K4) - 2026-09-26

Hazırlayan: QA (Principal). Baştan incelemenin 2. dalgası. Amaç, 01/04/05 belgelerindeki K1/K2 iddialarını gerçek ortamda
yeniden üretmek. Kod ve repo DEĞİŞTİRİLMEDİ. Yalnızca bu dosya yazıldı. Geçici script'ler ve ekran görüntüleri `%TEMP%\qa4\` altında.

## Özet (10 satır)

1. **Kritik-1 TEKRAR ÜRETİLDİ.** İlk kart 3 günle açılıp donduruldu. `Kapat` sonrası Hafta ekranı "Kartın için 1 gün daha lazım." / "Yeterli gün dolunca açılır" diyor, kutuya dokunmak hiçbir şey yapmıyor. Kart yalnızca deep link ile açılabiliyor.
2. **Kritik-2 TEKRAR ÜRETİLDİ.** Pazartesi, geçen haftanın uygun ama açılmamış kartına Hafta'dan, Bugün'den ya da bildirimden yol yok. `haftik://card/<geçen Pzt>` açıyor ve donduruyor. Uygunluk kontrolü doğru: uygun olmayan hafta Hafta ekranına yönleniyor.
3. **Unvan görünürlüğü:** varsayılan gizlemeyle (uyku+harcama) 81 kombinasyonun **15'inde (3 gün)** ya da **16'sında (4-7 gün)** unvan görünüyor, yani %18,5-19,8. Günlük seçimler düzgün dağılırsa ağırlıklı oran %38-63. Emülatörde 4 örnek görüldü: 2'si görünür, 2'si `???`.
4. **BLG-09 TEKRAR ÜRETİLDİ.** "Bugün nasıldı?" ve "Karnen hazır" bildirimine dokunmak uygulamayı son rotada açıyor (Ayarlar / Hafta). Kart ekranına gidilmiyor. Süreç ölüyse açılış Bugün'e düşüyor.
5. **V-03 TEKRAR ÜRETİLDİ.** İzin diyaloğu geri tuşuyla bir kez kapatılınca Expo `blocked=true` yazıyor. OS bayrağı USER_SET/USER_FIXED değil, yani sistem tekrar sorabilir. Buna rağmen uygulama "Ayarları aç" gösteriyor ve anahtar diyalog açmıyor.
6. **V-19 KISMEN.** Messages, Drive ve Print hedeflerinde hedef açıkken PNG önbellekte duruyor, Haftik'e dönünce siliniyor. "Dosya yok" hatası görülmedi. Dosyayı arka planda okuyan hedefler (hesaplı Drive yüklemesi, Quick Share) YAPILAMAZ.
7. **V-20:** PNG her iki yoğunlukta 1080x1920. 320 dpi'de kenar yumuşaması ölçülebilir (ara-gri/koyu piksel oranı 0,95'ten 1,54'e) ama metin okunur (Düşük).
8. **Kaydet sonrası hiçbir geri bildirim yok** (0,4 ve 2 sn sonraki kareler aynı, kayıt DB'de var). İlk kart özeti tam görünüyor. Reveal, dokunuştan son kareye ~1,5 sn sürüyor (ilk açılışta öncesinde 2-3 sn beyaz spinner var).
9. Genel tur: FATAL 0, RedBox 0, logcat'te kullanıcı içeriği 0. Silme akışı tam temizliyor. **Yeni Önemli bulgu:** önizleme ekranındaki "< Geri" durum çubuğunun içinde kalıyor, 4 denemede 4'ü de tepkisiz (YB-1 sınıfı). Ayrıca gizle/göster düğmeleri ~25 dp.
10. Sayım (18 kontrol): **11 GEÇTİ / 7 KALDI / 2 YAPILAMAZ / 9 ATLANDI.** Ortam geri yüklendi. Emülatör ve Metro açık.

## Ortam

| Alan | Değer |
|---|---|
| Emülatör | emulator-5554, Pixel 7 AVD `haftik_pixel`, Android 15 (API 35), 1080x2400 @ 420 dpi, sistem dili İngilizce, emülatör saat dilimi GMT |
| Uygulama | `com.batuhan.haftik` debug dev client. JS Metro'dan geliyor (`C:\hhk\haftik`, :8081, `packager-status:running`) |
| Zaman | Uygulama içi dev menü (`src/dev/dev-time-menu.tsx`: "+1 gün", "Bu haftanın Pazar 20:00'ine ilerlet", "Gerçek zamana dön"). Bildirim testi için `adb root` + `date` + `auto_time 0` |
| Veri | Başlangıçta `pm clear`. Sonda yine `pm clear` (izin de sıfırlandı), uygulama onboarding "Başla" ekranında |
| Geri yükleme | Saat host UTC ile eşitlendi (`Sat Sep 26 10:12:26 GMT` = host `10:12:27 UTC`), `auto_time=1`, `auto_time_zone=1`, `adb unroot`, `wm size` 1080x2400, `wm density` 420, `font_scale` 1.0, `adb reverse tcp:8081` |
| Yardımcılar | `%TEMP%\qa4\h.sh` (shot/dump/tap/sql), `transpile.js` + `count.js` (unvan sayımı), `sharp.js` (PNG keskinliği), `rvstat.js` (reveal kareleri) |

Kanıt ölçeği: K4 = emülatör gözlemi (ekran görüntüsü, `uiautomator dump`, `dumpsys`, `run-as sqlite3`, logcat). Unvan sayımı K2 niteliğinde: gerçek `src/domain/titles.ts` TypeScript derleyicisiyle CJS'e çevrilip Node'da çalıştırıldı.

## Madde tablosu

| # | Madde | Sonuç | Kanıt (K4) |
|---|---|---|---|
| 1 | Kritik-1: ilk kart (3 gün) sonrası Hafta kilitli, kart yeniden açılamıyor | **TEKRAR ÜRETİLDİ → KALDI** | Cum/Cmt/Paz check-in, Paz 20:00: "Kartın hazır!" (s13). Kart açıldı, `weekly_card` = `2026-09-21 / 3 gün / firstCardStrongStart`. `Kapat` sonrası "Kartın için 1 gün daha lazım." + "Yeterli gün dolunca açılır" (s16). Bugün→Hafta sonrası aynı. Kutuya dokunuş: odak MainActivity'de kaldı, ekran değişmedi (s17). `haftik://card/2026-09-21` kartı açıyor (s18) |
| 2 | Kritik-2a: kaçırılan haftanın kartına arayüz yolu | **TEKRAR ÜRETİLDİ → KALDI** | Hafta 2: Pzt-Per 4 gün, Paz 20:00'de kart açılmadı (s28 "Kartın hazır!"). +1 gün, Pzt 5 Eki: Hafta "Kartın için 4 gün daha lazım." (s29). Bugün ekranında kart/hafta referansı 0 (dump grep). Bildirim de karta gitmiyor (madde 5) |
| 3 | Kritik-2b: deep link uygunluk kontrolü | **GEÇTİ** | `haftik://card/2026-09-28` (uygun, açılmamış): kart açıldı ve donduruldu, `2026-09-28 / 4 / bigDrop` (s30). Silme sonrası aynı link (0 gün, uygun değil): Hafta ekranına yönlendi, `weekly_card`'a yazılmadı, `card_opened` yalnızca 10-05 için var |
| 4 | Varsayılan paylaşımda unvan görünürlüğü | **TEKRAR ÜRETİLDİ → KALDI** (ürün hedefi) | Sayım aşağıda. Emülatör: `firstCardStrongStart` [hareket,sosyal] görünür (s19, PNG). `bigDrop` [hareket,harcama,sosyal] önizlemede `???` (s31). `allMedium` [] kartta görünür (rv6). `movementHighSleepLow` [hareket,uyku] önizlemede `???`, "Uyku satırını göster" ile unvan beliriyor, gizleyince tekrar `???` (s43, s44) |
| 5 | BLG-09: bildirim tıklaması | **TEKRAR ÜRETİLDİ → KALDI** | Sıcak: uygulama Ayarlar'da iken `daily-2026-09-27` bildirimine dokunuldu, Ayarlar açıldı (s35). `card-2026-10-04` "Karnen hazır" bildirimine dokunuldu, son rota olan Hafta açıldı, kart açılmadı (s39). Soğuk (`am kill` sonrası alıcı süreci başlattı): Bugün açıldı (s36) |
| 6 | V-03: diyaloğu geri tuşuyla kapatma | **TEKRAR ÜRETİLDİ → KALDI** | Madde 1'deki temiz kurulumda "İzin ver" ile `GrantPermissionsActivity` açıldı (s04), sonra `keyevent 4`. Sonuç: `POST_NOTIFICATIONS: granted=false, flags=[USER_SENSITIVE_*]` (USER_SET/USER_FIXED yok). `expo.modules.permissions.asked.xml`: `blocked:android.permission.POST_NOTIFICATIONS=true`. Ayarlar: "Bildirim izni kapalı..." + "Ayarları aç" (s06). Anahtara dokunuş diyalog açmadı (odak MainActivity, s08) |
| 7a | V-19: hedef açıkken dosyanın durması (Messages, Drive, Print) | **GEÇTİ** | Önbellekteki `ReactNative-snapshot-image*.png` Messages taslak ekranı (s23, ek görünür), Drive "Upload to Drive" (s26) ve Print önizlemesi (s27, kart tam çizili) boyunca 1 adet. Haftik'e dönüşten sonra 0 |
| 7b | V-19: dosyayı sonradan/arka planda okuyan hedef | **YAPILAMAZ** | Drive hesap istiyor ("Sign into or create a Google account"), Quick Share yakın cihaz istiyor, Messages uygulaması hesap kurulum ekranına düştüğü için taslağın kalıcılığı görülemedi. K5/Google hesaplı AVD gerekiyor |
| 8 | V-20: PNG boyutu ve 320/420 dpi netliği | **KISMEN → KALDI (Düşük)** | Her iki PNG 1080x1920 (IHDR okundu). Satır metninde ara-gri/koyu piksel oranı 420 dpi'de 0,951, 320 dpi'de 1,542. Gradyan 14,44'ten 13,79'a. Kırpılıp 2x büyütülmüş karşılaştırmada 320 dpi hafif yumuşak ama okunur (`card-420dpi-crop.png`, `card-320dpi-crop.png`) |
| 9 | Kaydet anlık geri bildirimi | **TEKRAR ÜRETİLDİ → KALDI** | Kaydet'ten 0,4 sn (s10) ve 2 sn (s11) sonra ekran kaydetmeden öncekiyle (s09) aynı: seçimler duruyor, onay yok, ilerleme yok. DB'de satır var (`2026-09-25|3|2|2|3`) |
| 10 | İlk kart özeti görünümü | **GEÇTİ** (ton ayrı) | Gerçek metin "Bu ilk kartın, önceki haftayla kıyas henüz yok." (`summary.firstCard.2`). Görev notundaki "İlk karnen bu..." değil. Kartta 2 satır tam, kesilme yok (s15), PNG'de de aynı. Not: özet hapı italik sistem yazı tipinde, kartın geri kalanı Inter |
| 11 | Reveal süresi / ilk izlenim | **GEÇTİ (ölçüldü)** | İkinci açılışta cihaz içi zaman damgalı screencap: 0,18 sn Hafta, 0,36-0,80 sn beyaz, 0,94 sn başlık ve satırlar yukarıdan aşağı belirmeye başlıyor (rv6, 1,09 sn), 1,54 sn'den sonra sabit. İlk açılışta host kareleri boyunca (≥2-3 sn) beyaz ekran + spinner (s14-0..3). Debug derleme, release'te yeniden ölçülmeli |
| 12 | Genel tur: çökme / RedBox | **GEÇTİ** | `logcat -b all` 35270 satır: `FATAL EXCEPTION` 0, `E ReactNativeJS` 0, RedBox 0. Yalnızca dev-client uyarıları var (bkz. YB2-09) |
| 13 | Silme akışı | **GEÇTİ** | "Tüm verilerimi sil", "SIL" (s40): onboarding "Başla" ekranı (s41). `checkin/weekly_card/metric_event/setting` = 0/0/0/0, alarm 0, önbellekte snapshot/rapor 0, sunulmuş bildirim 0. Tekrar onboarding (izin verilmişken "İzin ver" diyalogsuz geçti): alarm 7, `first_open_date` yazıldı |
| 14 | K3 ara ekran ve otomatik devam | **GEÇTİ** | Paz 20:00, bugün boş: "Kartını açmadan önce bugünü de ekleyelim." (s42). "Bugünü işaretle", Bugün (11 Eki), Kaydet, doğrudan kart ekranı (`movementHighSleepLow`) |
| 15 | "Kartını tekrar görmek için dokun" (4 günden fazla hafta) | **GEÇTİ** | Hafta 3 (5 gün, hepsi orta): kart açıldı → Kapat → "Kartın açıldı." + "Kartını tekrar görmek için dokun" (s33). Bugün→Hafta→dokun: kart yeniden açıldı ("Ne Az Ne Çok Ustası"). Bu durum ilk kartta Kritik-1 yüzünden hiç görülemiyor |
| 16 | V-06: force-stop | **GEÇTİ** (belgelenen davranış) | `dumpsys alarm` uygulama alarmı: 7, `am force-stop` sonrası 0, uygulama açılınca yine 7 |
| 17 | V-10: inexact pencere | **GEÇTİ** (ölçüldü) | Her hatırlatma `RTC_WAKEUP ... window=+1h0m0s0ms`, `maxWhenElapsed = whenElapsed + 1s`. N-02'deki "1 saate kadar" iddiası K4'te teyit edildi |
| 18 | Logcat'te kullanıcı içeriği | **GEÇTİ** | Unvan/satır/bildirim metinleri, `weekly_card`, `\bcheckin\b` araması: 0 eşleşme |

### Sayım

- **GEÇTİ: 11** (3, 7a, 10, 11, 12, 13, 14, 15, 16, 17, 18)
- **KALDI: 7** (1, 2, 4, 5, 6, 8, 9)
- **YAPILAMAZ: 2** (7b: hesap/yakın cihaz yok; Messages taslağının kalıcılığı: uygulama hesap kurulumu istiyor)
- **ATLANDI: 9** (yapılabilirdi, koşulmadı): V-04 (bayat blocked bayrağı + süreç ölümü), V-08/V-09 (TZ değişimi/DST), V-12 (always_finish_activities), V-13 (3 tuşlu gezinme), V-15 (API 36 tablet/katlanabilir; AVD yok), B14 koyu mod, en uzun özet cümlesi, "Karnen hazır" bildirimine Ayarlar rotasından dokunma (Hafta rotasından yapıldı, mantık aynı), V-21 (harici önbellek)

## Unvan görünürlüğü sayımı (madde 4)

Yöntem: `src/domain/titles.ts`, `types.ts` ve `content/tr.ts`, projenin kendi `typescript` paketiyle CJS'e çevrildi. 81 seviye kombinasyonu x `checkinDays` {3..7} x delta {hepsi null, hepsi 0} için `selectTitle` çalıştırıldı (`prevTitleId=null`). Unvan görünür sayılma koşulu: `basedOnCategories` içinde `sleep` ve `spending` yok (`title-visibility.ts shouldHideTitle`, `hide-state.ts DEFAULT_HIDDEN_CATEGORIES`).

| Gün | Görünür / 81 | Ağırlıklı: günlük değer 1/2/3 eşit olasılık | Ağırlıklı: orta ağırlıklı (0,2/0,6/0,2) |
|---|---|---|---|
| 3 | 15 (%18,5) | %51,6 | %71,2 |
| 4 | 16 (%19,8) | %42,8 | %61,0 |
| 5 | 16 (%19,8) | %37,7 | %53,4 |
| 6 | 16 (%19,8) | %62,9 | %81,1 |
| 7 | 16 (%19,8) | %57,7 | %76,1 |

Delta (null ya da 0) sonucu değiştirmedi. Ağırlıklı oranları yükselten neredeyse tek şey `allMedium` (hepsi orta). Ortalama seviye olasılığı gün sayısıyla değiştiği için oran tekdüze değil. 4 günde görünen unvanlar: `movementSocialBothLow` 4, `movementSocialBothHigh` 4, `basic.movement.low` 3, `basic.movement.high` 2, `allMedium`, `basic.social.low`, `basic.social.high`. Yani yalnızca hareket/sosyal tabanlı unvanlar ve "hepsi orta" görünüyor. "Hepsi yüksek", "hepsi düşük", "3 yüksek 1 düşük", "uyku yüksek" (`Yastık Şampiyonu`) ve tüm uyku/harcama kombinasyonları varsayılan paylaşımda `???` kalıyor. 01-urun-teshis.md'nin "en fazla 16/81" tahmini doğru. "Orta ağırlıklı ~%40" tahmini, gün sayısına ve dağılım varsayımına göre %38-81 arasında değişiyor. Asıl belirleyici, gerçek kullanıcıların ne kadar "orta" seçtiği; bu deneme verisiyle ölçülmeli.

## Bulgular (yeniden üretilen)

### QA4-01 = Kritik-1: ilk kart sonrası kart kilitli görünüyor ve yeniden açılamıyor. Önem: **Blokör** (ilk wow anı ve paylaşım yolu)
- Adımlar: `pm clear`, onboarding (izin geri tuşuyla kapatıldı), Bugün, "‹ Dün" (25 Eyl Cuma) check-in, Bugün (26 Cmt) check-in, dev menü "+1 gün" (27 Paz) check-in, "Bu haftanın Pazar 20:00'ine ilerlet", Hafta ("Kartın hazır!"), kutuya dokun, kart, ✕, Hafta.
- Beklenen: "Kartın açıldı." + "Kartını tekrar görmek için dokun", kutu kartı açar.
- Gerçek: "Kartın için 1 gün daha lazım." + "Yeterli gün dolunca açılır", dokunuş etkisiz. Paylaşmadan kapatan kullanıcı kartına Pazartesi'ye kadar da, sonrasında da (QA4-02) arayüzden dönemez.
- Şüpheli: `src/data/card-repo.ts:135` (`hasAnyPriorCard` haftanın kendi kartını sayıyor), `src/app/(main)/week.tsx:54,60,85,91-93`, `src/domain/week.ts:106`, `src/lib/week-status-copy.ts:34` (`cardSeen` bu dalda okunmuyor). Aynı sınıf: `src/card/open-card.ts:94`.
- Logcat: hata yok (sessiz mantık hatası).
- Regresyon önerisi (otomasyon): 3 günlük ilk hafta → kart → Kapat → Hafta başlığı ve dokunuş. `week-route.test.tsx`'teki `hasAnyPriorCard` mock'u `true` + `getCard` dolu varyantıyla bu durumu yakalamalı.

### QA4-02 = Kritik-2: geçen haftanın uygun kartına arayüz yolu yok. Önem: **Önemli** (spec sözleşmesi, bildirimi kaçıran kullanıcı)
- Adımlar: hafta 2'de 4 gün, Paz 20:00'de kart açılmadan "+1 gün".
- Gerçek: Hafta yeni haftayı gösteriyor ("4 gün daha lazım"), Bugün'de bir şey yok. Kart yalnızca `haftik://card/2026-09-28` ile açılıyor (dondurma doğru: `bigDrop`, özet "çoğu kategori geçen haftadan biraz düştü").
- Şüpheli: `src/app/(main)/week.tsx:29` (yalnızca `getWeekStart(now)`), `src/app/_layout.tsx` (bildirim yanıt dinleyicisi yok: `src` içinde `addNotificationResponseReceivedListener|useLastNotificationResponse|getLastNotificationResponse` 0 eşleşme).

### QA4-03 = BLG-09: bildirim tıklaması hedefsiz. Önem: **Önemli**
- Adımlar: `pm grant POST_NOTIFICATIONS`, `adb root`, `settings put global auto_time 0`, `date 0927220026.30` (inexact pencerenin sonrası). Bildirim `tag=daily-2026-09-27`, kanal `hhk-reminders`, `contentIntent=startActivity`. Uygulama Ayarlar sekmesindeyken ana ekran, bildirim perdesi, dokun. Sonra `date 1004200526.00` ile `card-2026-10-04` "Karnen hazır / Bu haftanın kartı seni bekliyor." bildirimi, uygulama Hafta sekmesindeyken dokun.
- Beklenen: hatırlatma → Bugün, "Karnen hazır" → kart (ya da en azından Hafta).
- Gerçek: iki bildirim de son rotayı öne getiriyor (Ayarlar / Hafta). Süreç ölüyse (`am kill`) varsayılan açılış (Bugün).
- Logcat (dev client, çökme yok): `E unknown:ReactHost: ReactNoCrashSoftException: raiseSoftException(onNewIntent(...)): Tried to access onNewIntent while context is not ready`.
- Şüpheli: `src/app/_layout.tsx` (yanıt işleyicisi yok), `src/notify/scheduler.ts` (bildirim `data`'sında rota yok; kontrol edilmeli).

### QA4-04 = V-03 / P-03: tek kaydırıp kapatma kalıcı ret gibi davranıyor. Önem: **Önemli** (hatırlatma = D7 kaldıracı)
- Adımlar: temiz kurulum, onboarding "İzin ver", sistem diyaloğu, `input keyevent 4`, Ayarlar.
- Gerçek: OS durumu "sorulabilir" (bayrak yok), Expo durumu `blocked=true`, yani `canAskAgain:false`. Uygulama "Ayarları aç" gösteriyor, anahtar istek yapmıyor.
- Beklenen (Android belgesi): kaydırıp kapatma izin durumunu değiştirmez, uygulama tekrar sorabilmeli.
- Şüpheli: `node_modules/expo-modules-core/.../PermissionsService.kt:73-86` (kaynak), uygulama tarafında `src/notify/wiring.ts:62` (`canAskAgain` false iken deneme yok). 05'teki öneri geçerli: `canAskAgain:false` iken de bir kez istek denemek zararsız (kalıcı retse sistem diyalog göstermeden DENIED döner).

### QA4-05 = Kaydet sessiz. Önem: **Önemli** (ürün, T4)
- Kaydet'e basınca ekran, basmadan önceki kareyle birebir aynı. Tek fark DB'de. Kullanıcı "kaydedildi mi?" diye yeniden basabilir.
- Şüpheli: `src/app/(main)/today.tsx:82-98` (`handleSave` başarı durumunda UI değiştirmiyor).

### QA4-06 = Varsayılan paylaşımda unvan çoğunlukla `???`. Önem: **Önemli** (ürün, T13; birincil metrik)
- Yukarıdaki sayım ve emülatör örnekleri. Şüpheli: `src/card/hide-state.ts` (`DEFAULT_HIDDEN_CATEGORIES`), `src/card/title-visibility.ts`, `src/domain/titles.ts:264-293` (kuralların çoğu uyku/harcama içeriyor).

### QA4-07 = V-20 / S-02: düşük yoğunlukta PNG yumuşak. Önem: **Düşük**
- 320 dpi'de ara-gri kenar pikselleri ~%62 artıyor. Metin okunur ama keskinlik düşüyor. WhatsApp'ın yeniden sıkıştırmasıyla birleşince K5'te bakılmalı (C-05).

## Yeni bulgular (bu turda ilk kez)

| ID | Önem | Bulgu | Kanıt | Şüpheli yer |
|---|---|---|---|---|
| YB2-01 | **Önemli** | Paylaşım önizlemesinde "< Geri" durum çubuğunun içinde (`[63,63][1017,126]`, çubuk 0-136 px). (110,95) ve (110,100)'e 4 dokunuş: 4'ü de tepkisiz. Kullanıcı yalnızca sistem geri tuşuyla çıkabiliyor. YB-1'in aynı sınıfı, bu ekranda `useTopInset` uygulanmamış. Ayrıca metin saatin üstüne biniyor | s19 (saat "9:51" ile "< Geri" üst üste) | `src/components/card-preview-view.tsx:99-101`, `:178-182` (`container` yalnızca `padding: Spacing.four`) |
| YB2-02 | Önemli (a11y) | Önizlemedeki gizle/göster düğmeleri 66x63 px ≈ 25x24 dp. `hitSlop` 8 ile ~41 dp, 48 dp'nin altında. Yanlış satıra dokunmak kolay: bu turda "Uyku" yerine iki kez "Harcama" değişti | dump bounds `[951,647][1017,710]` | `src/components/card-preview-view.tsx:126-134` → accessibility-auditor |
| YB2-03 | Düşük (a11y) | Ayarlar'daki "Günlük hatırlatma" `Switch`'inin erişilebilirlik etiketi yok (`NAF="true"`, text/desc boş). TalkBack yalnızca "anahtar, kapalı" okur | `ui.xml` `reminder-enabled-switch` | `src/components/settings-view.tsx:78-82` |
| YB2-04 | Düşük (yalnız debug) | Dev saat düğmesi (top: inset+72) Ayarlar'da hatırlatma anahtarının büyük kısmını, Hafta'da "Paz" etiketini, kartta sağ üst köşeyi örtüyor. Anahtara ilk dokunuş menüyü açtı | s07, s33 | `src/dev/dev-time-menu.tsx:46,111-123` |
| YB2-05 | Düşük | Silme onayında düğme "SIL" (İngilizce sistem dilinde AlertDialog büyük harfe çeviriyor, `Sil` "SIL" oluyor, Türkçe İ kayboluyor). Türkçe yerelde "SİL" olması beklenir, TR cihazda doğrulanmalı | s40 | `src/app/(main)/settings.tsx:91` |
| YB2-06 | Düşük (UX) | Kart açıldıktan sonra Hafta kutusu hâlâ gri iskelet + kilit simgesi. Başlık "Kartın açıldı." ile görsel çelişiyor | s33 | `src/components/locked-card-placeholder.tsx` → ui-ux/visual |
| YB2-07 | Düşük (görsel) | Kart özet hapı, kartın geri kalanından (Inter) farklı bir italik sistem yazı tipiyle çiziliyor (Inter'in italiği paketlenmemiş). PNG'de de aynı | card-420dpi.png | `src/card/CardView.tsx` özet stili → visual-designer |
| YB2-08 | Bilgi | İlk kart açılışında 2-3 sn boş beyaz ekran + spinner (font/DB). İkinci açılışta ~0,8 sn. "Wow" anının önünde bekleme var. Release'te ölçülmeli (performance-engineer) | s14-0..3, rv0-4 | `src/card/fonts.ts`, `src/app/card/[weekStart].tsx` |
| YB2-09 | Bilgi (debug) | Bildirim/intent ile ön plana gelişte dev-client uyarıları: "Cannot connect to Expo CLI ... URL: 10.0.2.2:8081" ve `ReactNoCrashSoftException onNewIntent`. Çökme yok, release'te yok sayılır | logcat-all-1.txt | dev client |
| YB2-10 | Bilgi | Bildirim küçük simgesi jenerik içi boş daire (04'teki "gri kare olabilir" tahmini: gri kare değil ama marka simgesi de değil) | s37 | `app.json` (expo-notifications `icon` yok) |
| YB2-11 | Bilgi | Saat ileri atlayınca kaçırılan 5 günün "Bugün nasıldı?" bildirimi aynı anda yığıldı (inexact + geçmiş tetikler). Metin "Bugün" diyor ama bildirimler geçmiş günlere ait. Gerçekte uzun Doze/uyku sonrası benzer yığılma olabilir (yeniden başlatmada silinir, N-05) | s37 (grup "6") | `src/domain/notify-plan.ts` |
| YB2-12 | Bilgi | Paylaşımda hedefe metin gitmiyor: Messages taslağında yalnızca görsel var, metin alanı boş ("Add text"). S-05 K4'te teyit edildi. PNG damgası hâlâ `[mağaza bağlantısı]` | s23, s15 | `src/card/share.ts`, `src/config/constants.ts:17` |
| YB2-13 | Bilgi | Deep link ile doğrudan açılan kart ekranında geri tuşu uygulamadan çıkıyor (altta yığın yok) | test sırasında ana ekrana düşüldü | expo-router kök yığını |

Doğrulama notu (bulgu değil): simüle zamanla gelecek günlere check-in yazıldığı için bazı günlerde check-in olmasına rağmen hatırlatma ya da zaten dondurulmuş haftaya "Karnen hazır" planlandı. Gerçek kullanımda gelecek gün doldurulamadığından ürün etkisi yok.

## Ekran görüntüleri ve ham kanıt (`%TEMP%\qa4\`, `C:\Users\Pc\AppData\Local\Temp\qa4\`)

| Dosya | İçerik |
|---|---|
| `s01-open.png`, `s02-onb2.png`, `s03-onb3.png` | Onboarding 3 ekran |
| `s04-permdialog.png`, `s05-after-back.png` | İzin diyaloğu, geri tuşu sonrası Bugün |
| `s06-settings-after-back.png`, `s07-switch-after-back.png`, `s08-switch-tap2.png` | V-03: "Ayarları aç", FAB anahtarı örtüyor, anahtar diyalog açmıyor |
| `s09-fri-before-save.png`, `s10-fri-after-save-0s.png`, `s11-fri-after-save-2s.png` | Kaydet öncesi/sonrası (fark yok) |
| `s12-week-sun-before.png`, `s13-week-sun2000.png` | Hafta: 1 gün daha / Kartın hazır |
| `s14-reveal-0..3.png`, `s15-card-final.png` | İlk açılış (spinner) ve ilk kart |
| `s16-week-after-card.png`, `s17-week-tap-locked.png`, `s18-deeplink-own-card.png` | **Kritik-1** |
| `s19-preview.png` | Önizleme ("< Geri" durum çubuğunda, YB2-01) |
| `s20-chooser.png`, `s21-messages.png`, `s22-msg-select.png`, `s23-msg-compose.png`, `s24-after-msg-back.png`, `s25-msg-list.png` | Paylaşım → Messages |
| `s26-drive.png`, `s27-print.png` | Drive (hesap duvarı), Print önizleme |
| `s28-week2-sun2000.png`, `s29-week3-monday.png`, `s30-deeplink-lastweek.png`, `s31-preview-week2.png` | **Kritik-2**, `bigDrop` `???` |
| `s32-oops.png` | Test hatası (geri tuşu uygulamadan çıktı, dokunuşlar başlatıcıya gitti). Uygulama bulgusu değil |
| `s33-week3-after-open.png` | "Kartın açıldı / tekrar görmek için dokun" |
| `s34-shade.png`, `s35-after-notif-tap.png`, `s36-notif-cold.png`, `s37-shade-card.png`, `s38-shade-expanded.png`, `s39-after-card-notif.png` | **BLG-09** |
| `s40-delete-confirm.png`, `s41-after-delete.png` | Silme |
| `s42-k3-interstitial.png`, `s43-preview-week4.png`, `s44-preview-sleep-shown.png` | K3 ara ekran, `movementHighSleepLow` `???` / uyku gösterilince görünür |
| `card-420dpi.png`, `card-320dpi.png`, `card-420dpi-crop.png`, `card-320dpi-crop.png` | Paylaşılan PNG'ler (1080x1920) ve 2x kırpımlar |
| `rv\rv0..14.png` | Reveal zaman damgalı kareler (0,18-2,28 sn) |
| `logcat-all-1.txt` | `logcat -d -b all` (35270 satır) |
| `count.js`, `transpile.js`, `domain\` | Unvan sayımı (yeniden çalıştırma: `node transpile.js <repo> domain && node count.js`) |

## Doğrulanamayanlar / sonraki adım

- **K5 gerekiyor:** WhatsApp/Instagram/Galeri hedefleri, arka planda okuyan hedeflerde erken silme (hesaplı Drive, Quick Share), Türkçe yerelde "SİL", OEM pil yönetimi, dokunmatik his, release derlemede reveal süresi ve ağ gözlemi (V-18).
- **Emülatörde yapılabilir ama bu turda ATLANDI:** V-04, V-08/V-09, V-12, V-13, V-15 (API 36 tablet/katlanabilir AVD yok), V-21, B14 koyu mod, en uzun özet cümlesi.
- **Düzeltme sonrası aynı senaryoyla yeniden doğrulanacaklar:** QA4-01 (3 günlük ilk kart → Kapat → Hafta → dokun), QA4-03 (Ayarlar rotasındayken "Karnen hazır"), QA4-04 (geri tuşu → Ayarlar anahtarı diyalog açmalı), YB2-01 (önizlemede "< Geri" 5/5 dokunuş). Komşu akışlar: K3 ara ekran, "tekrar gör" (4 günden fazla), deep link uygunluk.
- **Otomasyona aktarılacaklar (test-automation-engineer):** QA4-01, QA4-02 (deep link hariç arayüz yolu), YB2-01 dokunma hedefi, silme sonrası sayım sıfırlama.

## Devir

```
Durum:        bitti (K4 emülatör turu); 18 kontrol: 11 GEÇTİ / 7 KALDI / 2 YAPILAMAZ / 9 ATLANDI
Blokör:       QA4-01 (ilk kart yeniden açılamıyor) -> mobile-engineer
Önemli:       QA4-02, QA4-03 (akış, ayrı intent olabilir -> product-owner), QA4-04 (izin), QA4-05/06 (ürün),
              YB2-01 (önizleme Geri, YB-1 sınıfı -> tech-lead: "her ekran useTopInset" kuralı/testi), YB2-02 (a11y)
Karar gerek:  unvan görünürlüğü mekanizması (01 S2), bildirim tıklama hedefi, Kaydet onayı (P7)
Ortam:        saat host UTC ile eşit + auto_time=1, unroot, wm/font sıfır, uygulama pm clear (onboarding),
              emülatör ve Metro açık
```

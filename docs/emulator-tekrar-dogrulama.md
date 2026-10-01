# Emülatör tekrar doğrulama - Haftik (düzeltmeler sonrası)

## Ortam

| Alan | Değer |
|---|---|
| Emülatör | emulator-5554, Pixel 7, Android 15, 1080x2400@420, sistem dili İngilizce (izin diyaloğu "Allow / Don't allow") |
| Derleme | Debug dev client `com.batuhan.haftik`; düzeltilmiş JS Metro'dan (`C:\hhk\haftik`, :8081) |
| Saat | Test için `adb root` + `date` ile 24->25 ve 27->28 Eylül gece yarısı geçirildi; sonda host saatine eşitlendi (`Thu Sep 24 12:39 GMT` = host 15:39 TSS), `auto_time`/`auto_time_zone` = 1 |
| Sıfırlama | `wm size/density reset` (1080x2400@420), `font_scale 1.0`, dev saat override "Gerçek zamana dön". Emülatör ve Metro açık, uygulama onboarding tamamlanmış, temiz veri (izin verilmemiş, Bugün ekranı 24 Eylül) |
| Kod | DEĞİŞTİRİLMEDİ, test dosyalarına dokunulmadı |
| Ekran görüntüleri | `%TEMP%\qa-shots2` |

Not: Yeni onboarding/`pm clear` senaryolarında eşzamanlı dokunuş olmadı (her dokunuştan sonra 2 sn); "onboarding atlandı" tekrarlanmadı.

## Sonuç tablosu

| Madde | Sonuç | Kanıt |
|---|---|---|
| BLG-01 diyalog | GEÇTİ | Temiz kurulumda "İzin ver" sonrası `mCurrentFocus=...permissioncontroller...GrantPermissionsActivity`, "Allow Haftik to send you notifications?" (Allow / Don't allow) |
| BLG-01 izin ver | GEÇTİ | Allow sonrası `POST_NOTIFICATIONS: granted=true, USER_SET`; `dumpsys alarm` 7 hatırlatma alarmı; bugün check-in kaydedilince 6'ya düştü |
| BLG-01 reddet | GEÇTİ | Yeni `pm clear`, "Don't allow": `granted=false`, alarm 0, çökme yok (logcat FATAL 0). Ayarlar'da anahtar kapalı, "Bildirim izni kapalı, hatırlatma çalışmaz."; anahtara dokunca ikinci diyalog, 2. redde "Ayarları aç" düğmesi belirdi (kalıcı ret dalı) |
| BLG-01 ayarlardan izin | GEÇTİ | "Ayarları aç" `com.android.settings` açtı; `pm grant` + geri: not ve düğme kayboldu, alarm 0 -> 7 (AppState active izin yeniden okundu, plan kuruldu) |
| B8 | GEÇTİ | İzin yokken anahtar kapalı (dn1.png), saat çipleri `enabled=false`, metin dürüst |
| BLG-02 | GEÇTİ | Hafta açıkken Bugün'de kayıt: 3 gün daha -> 2 -> 1 -> "Kartın hazırlanıyor." her seferinde Hafta'ya dönünce anında güncel (noktalar da). Not: kart varsa eşik 4 gün (kod: `requiredDays = hasAnyPriorCard ? 4 : 3`, spec'e uygun) |
| BLG-03 | GEÇTİ | Uygulama açıkken saat 23:58:30'a alınıp uygulama öne getirildi, 00:00:04'te Bugün başlığı "24 Eylül" -> "25 Eylül, Cuma"; 27->28 geçişinde "28 Eylül, Pazartesi" + boş form; kayıt yeni güne yazıldı, Hafta yeni haftada yalnız Pzt "bugün, dolu". Ayrıca saat host'a döndürülünce öne gelmede başlık "24 Eylül"e döndü |
| BLG-04 | GEÇTİ | K3 akışı (3 gün + Pazar 20:00 dev menü, bugün boş -> ara ekran -> kayıt -> kart). Kartta özet "Bu ilk kartın, önceki haftayla kıyas henüz yok." 2 satırda tam görünür (k3.png). Paylaşılan PNG (`run-as cache/ReactNative-snapshot-image*.png`, 184672 B): 1080x1920, chunk'lar IHDR,sRGB,sBIT,IDAT,IEND (metadata yok); Read ile açıldı: özet 2 satır tam, damga görünür, gizli 2 satır `???` + soru işareti. Not: en uzun özet cümlesi (`tr.ts`) ayrıca denenmedi, yalnız ilk-kart özeti |
| BLG-05 | GEÇTİ | "Tüm verilerimi sil" -> SIL: doğrudan onboarding "Başla"; alarm 0; cache'te snapshot/deneme dosyası 0. Onboarding + izin sonrası alarm planı 7 kuruldu, check-in sonrası 6. Deneme raporu: "Kurulumdan bu yana gün: 1", `dayNumber:1`, sayaçlar sıfırdan (`check_in_saved=1`): first_open_date yazılıyor |
| Kart X | GEÇTİ | Kart ekranında Kapat -> Hafta ("Bu hafta", "Kartın hazır, açmak için dokun"); "Bugünü işaretle" ara ekranı çıkmadı |
| Dar ekran 720x1280@320 | GEÇTİ | Kapat sol üstte, kart küçülmüş, Paylaş kartın altında; çakışma yok (n3.png) |
| Geniş ekran 1080x2400@540 | GEÇTİ | Kapat/Paylaş/kart çakışmıyor (m1.png). Yalnız dev saat düğmesi (debug) damganın bir kısmını örtüyor |
| Font 2.0 kart | GEÇTİ | Kart satırları/unvan/özet değişmedi, kesilme yok (f1.png) |
| Font 2.0 Ayarlar | GEÇTİ | 23:00 çipi ikinci satıra sarıldı, ekran içinde (f2.png). Alt sekme etiketleri hâlâ ikonla neredeyse bitişik ve ev çubuğu "Hafta" etiketine değiyor (Düşük, bkz. yeni bulgular) |
| B1 | GEÇTİ | Seçim yokken tüm emojiler canlı (o4.png); yalnız seçim yapılan kategoride diğer ikisi soluk |
| B2 | GEÇTİ | `content-desc`: "Hareket: durgun/hafif/yoğun", "Uyku: kötü/idare/iyi", "Harcama: az...", "Sosyal: yalnız/ölçülü/kalabalık"; seçilince başlıkta "Uyku · idare" |
| B3 | GEÇTİ | Kaydet pasifken "4 kategori kaldı" / "1 kategori kaldı" |
| B4 | KALDI (kısmi) | Etiket ve başlık iyi ("‹ Dün", "Bugün/Dün", "Bugüne dön"). Ama dokunma hedefi fiilen çalışmıyor: bkz. YB-1. `input tap` etiketin ortasında (148,126) hiç tepki vermedi; y>=140 çalıştı |
| B5 | GEÇTİ | Başlık "Kartın için 3 gün daha lazım." + kutu altı "Pazar 20:00'de açılıyor" (tek kez) |
| B6 | KALDI (kısmi) | Kilit ikonu artık kendi dairesinde (56dp), ama daire iskeletin 4. satır çubuğunun üstüne biniyor (w2.png); alt "pill" ile örtüşme yok |
| B7 | GEÇTİ | Bugünün noktası hem boş (kesikli halka, kalın etiket) hem dolu (dış halkalı) belirgin (w0b.png, w2.png) |
| B9 | GEÇTİ | Seçili saat çipi 2px çerçeve + kalın yazı (f2.png, dn1.png) |
| B12 | GEÇTİ | Ayarlar'da "Gizlilik politikası (yakında)"; `src` UI dizelerinde "S12" yok |
| Dev saat düğmesi | GEÇTİ (kısmi) | Artık "Ayarlar" etiketini örtmüyor; ama Bugün'de Kaydet düğmesinin sağ ucunu ve kart damgasını örtüyor (yalnız debug) |
| REG deep link K-08 | GEÇTİ | `card/abc`, `2026-09-22`, `2030-01-07`, `2026-10-05`, `2026-09-14`, `2026-09-28` (bu hafta, uygun değil), `2026-13-45`, `../../etc`: hepsi Hafta; DB'de `weekly_card=0`, `metric_event=0`, FATAL 0 |
| REG onboarding kapısı | GEÇTİ | `pm clear` sonrası `haftik://today`, `/week`, `/settings`: "Başla" ekranı kaldı |
| REG PNG metadata | GEÇTİ | Yukarıdaki chunk listesi |
| REG deneme raporu | GEÇTİ | İçerik/tarih/kimlik yok, "anonim" kelimesi yok; paylaşım iptalinden sonra `cache/deneme-raporu.txt` 0 |
| REG cache kalıntısı | GEÇTİ | Paylaşım sayfası açıkken cache'te 1 PNG, sayfa iptal edilince 0; silme sonrası 0 |
| REG logcat | GEÇTİ | `logcat -b all` 14763 satır: kart metni/unvan/kategori/`checkin`/`weekly_card` eşleşmesi 0; FATAL/RedBox 0 |

## Yeni bulgular

- YB-1 (Önemli) Bugün ekranında "‹ Dün" / "Bugün ›" düğmesinin üst yarısı sistem durum çubuğunun altında kalıyor. Bu emülatörde durum çubuğu `[0,0][1080,136]` (52dp), ekran başlığı ise y=63'ten başlıyor: düğmenin kutusu [63,63][234,189] ama etiket ortası (y~126) çubuğun içinde, o bölgeye dokunuş yutuluyor (5 tekrarda 0 tepki; y=140/150/160'ta çalıştı). Ayrıca durum çubuğu saati/ikonları Bugün/Hafta/Ayarlar'da görünmüyor (beyaz metin beyaz zeminde; kart ekranında açık gri zeminde görünüyor, k3.png). Kod: `Dün` düğmesinin/ekran başlıklarının üst boşluğu `useSafeAreaInsets().top` almalı (Bugün, Hafta, Ayarlar), durum çubuğu stili koyu ikon olmalı. Gerçek cihazda (çentikli/normal) tekrar bakılmalı ama Pixel 7 gerçekçi bir profil; kullanıcı gerçek cihazda "Dün" düğmesine ilk denemede basamayabilir.
- YB-2 (Düşük) B6 kalan: kilit dairesi iskeletin 4. satır çubuğunu keserek üstünde duruyor. Kilidi çubukların altına/üstüne ayırmak gerekir.
- YB-3 (Düşük) Onboarding metni: "Hareket, uyku, harcama, sosyal— haftanı emojiyle anlat" (`sosyal—` tireden önce/sonra boşluk yok, kendi bildirdiğin yazım). Metin: "sosyal, haftanı" ya da " — " yazılmalı.
- YB-4 (Düşük) Font 2.0: sekme çubuğunda ikon ile etiket neredeyse bitişik ve sistem hareket çubuğu "Hafta" etiketine değiyor.
- YB-5 (Düşük, dev) Dev saat düğmesi (bottom:110) Bugün'de Kaydet'in sağ ucunu örtüyor (44dp daire Kaydet'in üstüne biniyor). Yalnız debug; bottom değeri artırılmalı ya da sekmenin üstünde ama içerik alanının dışına alınmalı.
- YB-6 (Bilgi) `wm density/size` değişimi uygulamayı Bugün ekranına döndürüyor (yapılandırma değişiminde rota sıfırlanıyor); kartı yeniden açmak gerekti. Gerçek kullanımda font/ekran boyutu değişimi nadir; gerekirse Bilgi.
- YB-7 (Bilgi) İlk kart sonrası Hafta ekranında kart açılmış olsa da başlık "Kartın hazır!" ve kutu "Kartın hazır, açmak için dokun" kalıyor (kart zaten görüldü). Kabul edilebilir, ürün kararı.
- YB-8 (Bilgi) Kart kimliği yokken kutu altı başlıklar arası fark: bilgi olarak, kartı gördükten sonra eşik 4 gün olduğu için "3 gün daha lazım" yerine ilk hafta 3, sonra 4; metinde eşik değişikliği açıklanmıyor.

## Kalanlar (emülatörde doğrulanamaz / yapılmadı)

- En uzun özet cümlesiyle kart (yalnız ilk-kart özeti denendi; `adjustsFontSizeToFit` güvencesi cihazda gerçek uzun özetle denenmeli).
- Dokunmatik "his", paylaşım hedefleri (WhatsApp/galeri), pil/OEM, release derlemesi (G-01/02/06/07/08/09), TalkBack, BLG-09/10/11 (açık, kapsam dışı).
- Saat dilimi/DST testleri (B-07..B-09) ve Pazar kart bildirimi teslimi bu turda da koşulmadı.

## Özet

- Toplam 31 madde: 28 GEÇTİ, 2 KALDI (B4 dokunma hedefi, B6 kısmi), 1 kısmi GEÇTİ (dev düğme).
- Önceki Blokörler (BLG-01..05): 5/5 GEÇTİ. Kalan Blokör yok.
- Önemli seviyede yeni bulgu: YB-1 (durum çubuğu altında kalan "Dün" düğmesi; B4 hedefini fiilen çürütüyor).
- BLG-06/07/08 (Önemli): GEÇTİ (kart X, dar/geniş ekran, font 2.0).
- Regresyon: hepsi GEÇTİ, RedBox/FATAL yok, logcat'te kişisel veri yok.
- Emülatör ayarları sıfırlandı; emülatör ve Metro açık bırakıldı.

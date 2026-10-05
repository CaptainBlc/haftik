# Haftik: değişiklik günlüğü

Biçim: Keep a Changelog benzeri, Türkçe. Kural: en üstteki sürüm başlığı `app.json` `version` ile aynıdır
(`__tests__/infra/version.test.ts` bunu denetler); sürüm etiketi `v` + sürüm. Her sürümün ayrıntılı kaydı
(etiket, commit, EAS build kimliği, `versionCode`, APK SHA-256, imza parmak izi) `docs/surumler/vX.Y.Z.md`'de tutulacak.

## [0.1.0] - Yayın öncesi (tarih, build numarası ve `versionCode` etiket günü yazılır; kanal: preview)

İlk sürüm. **Yalnız Batuhan'ın kendi telefonu** (kanıt sürümü); arkadaşlara gitmez. Yalnız Android APK.

### Eklendi
- **Günlük işaretleme:** hareket, uyku, harcama ve sosyal, her biri üç emojiden biri; dördü de seçilince Kaydet açılır.
  Bugün ya da dün düzenlenebilir.
- **Haftalık Kart:** Pazar 20:00'de, yeterli günü olan haftanın kartı açılır (unvan, dört satır, özet). Kaçırılan haftanın kartı
  sonradan açılabilir (Hafta ekranında banner, Bugün'de "Geçen haftanın kartını aç").
- **Paylaşım:** önizlemede satır gizleme (uyku ve harcama varsayılan gizli; unvan gizli bir satırdan türediyse o da gizli),
  1080x1920 PNG olarak sistem paylaşım sayfasıyla. Gizli satırın metni dosyaya hiç yazılmaz.
- **Hatırlatmalar:** günlük hatırlatma ve "kart hazır" bildirimi, iki ayrı bildirim kanalı; bildirime dokunmak doğrudan ilgili
  ekranı açar (soğuk ve sıcak açılış). Bildirimde içerik, rakam ya da seviye yok.
- **Kaydet anı:** ilerleme cümlesi ("Bugün sayfaya girdi. 3 gün daha."), "✓ Kaydedildi" / "Güncelle" durumu, hata cümlesi,
  çift dokunuş koruması, uzun aradan sonra "Yeni bir hafta, temiz sayfa." satırı. Ekran okuyucuya aynı cümle okunur.
- **Ayarlar:** hatırlatma saati ve izin durumu, sürüm satırı (sürüm, build, kanal, commit, şema), deneme raporu, "Tüm verilerimi sil".
- **Deneme raporu (v2):** kullanıcı tetikli, tam metin önizlemeli, otomatik gönderim yok. Yalnız sayaçlar ve gün sayıları (gün, ilk
  3 gün deseni, D7, hafta tablosu, kart/paylaşım sayıları, paylaşım başına gizlenen satır, varsayılan gizlemenin korunması,
  bildirimle açılış, kart gecikmesi). İçerik, kategori, tarih ve kimlik yok. Birleştirme için `scripts/merge-reports.js`.

### Değişti
- **Metinler (içerik sürümü 2):** kart metinleri zamansız ("bu hafta" yok), yargı ve damga dili temizlendi. Seviye kelimeleri: uyku
  kısa/orta/uzun, sosyal sakin/orta/kalabalık. Kullanıcıya dönük her yerde "Kart"; "8 saniye" iddiası "birkaç saniye".
- **Tema:** uygulama açık temaya kilitli (koyu mod yok).
- **Kart PNG netliği:** yakalama çerçevesi, 2,0x ve 2,625x yoğunlukta kenar geçişi 2,27 / 1,81 px'ten yaklaşık 1,1 px'e indi.
- **Paket:** R8 ve kaynak küçültme açık; kullanılmayan `react-native-reanimated` ve `react-native-worklets` native derlemeden dışarıda.
  Release x86_64 APK 44,5 MB'tan 32,5 MB'a indi.

### Düzeltildi
- **Eşik kuralı (Kritik-1):** bir hafta için kart açmak, aynı haftayı yeniden kilitleyip eşiği 3'ten 4'e çıkarmıyor artık; eşik yalnız
  check-in geçmişinden türer (monotonluk testli).
- **Bildirim:** Pazar'da çift bildirim; izin diyaloğu geri tuşuyla kapatılınca takılma; Android 13+ izin diyaloğunun hiç
  gösterilmemesi; teslim edilmiş bildirimlerin silme ve kart açılışından sonra ekranda kalması.
- **Veri:** migration yarıda kalırsa uygulamayı kalıcı çökertiyordu, artık atomik; kök hata ekranı; "Tüm verilerimi sil" artık
  silinen veriyi dosyadan da temizler (VACUUM) ve silme sonrası onboarding'e döner.
- **Ekranlar:** üst güvenli alandaki dokunuşlar, dördüncü kategorinin kesilmesi, kart özetinin kesilmesi, gün/hafta dönümünün
  uygulama açıkken kaçırılması, yükleme/kayıt hatalarının sessiz kalması.
- **Paylaşım:** paylaşım dosyası hedef uygulama okurken silinebiliyordu; artık adanmış dizinde, tarihsiz adla, yaşa göre temizlenir.

### Güvenlik ve gizlilik
- Release'te `INTERNET` izni yok (süreçte `inet` grubu yok); izin listesi altın listeyle birebir
  (`scripts/check-apk-permissions.js`).
- Bulut yedeği ve cihazdan cihaza aktarım yapılandırmada kapalı (`allowBackup=false`, `dataExtractionRules`): telefon değişirse veri
  taşınmaz. Cihazdan cihaza aktarımın gerçek davranış kanıtı (`bmgr` test modu) henüz yok.
- Dışarıdan gelen bağlantı ve bildirim verisi (hafta parametresi, bildirim türü) doğrulanır; uygunluk dışı kart bağlantıyla açılamaz.
- Ölçüm yalnız cihazda sayaçlardır; rapor kullanıcı paylaşmadan hiçbir yere gitmez.

### Bilinen sınırlar
- Yalnız Android; iOS derlemesi ve cihaz kanıtı yok.
- Hatırlatma saati yaklaşık: Android 12+'ta tam alarm izni bilerek istenmedi, bildirim birkaç dakika kayabilir.
- Paylaşılan karta mağaza bağlantısı yer tutucusu basılır (kesin damga ve bağlantı 0.2.0 öncesi); paylaşım hedefine yalnız görsel gider.
- Kart görünümü sade/şablon; yeni görsel kimlik (kart, ikon, splash) 0.2.0 kapsamında.
- Gerçek cihaz kanıtları alınmadı: başarılı paylaşım hedefi (WhatsApp), Doze/standby, koyu mod, erişilebilirlik yeniden ölçümü,
  bildirim dokunuşunun cihazda sayılması (`notif_opened`).
- Saat dilimi / yaz saati testleri (3 adet) süreç saatine bağlı olduğu için atlanıyor (`it.skip`); Play'den önce yeniden tasarlanacak.
- Gizlilik politikası ve KVKK hukuki görüşü yayın kapısında (Play kapalı test öncesi); bu sürümde dış kullanıcı yok.

### Veri ve şema notu
- `user_version` 3 (migration'lar atomik, yalnız-ekleyen). `metric_counter` tablosu bu sürümde ilk kez akışlara bağlandı.
- İlk dış sürüm olduğu için eski bir sürümden yükseltme yolu yok. Geliştirme sırasında kurulmuş eski kurulumlarda sayaçlar
  önceki paylaşımları saymaz ve rapor bütünlük kuralını bozabilir: **temiz kurulum önerilir**.
- Eski koda dönüş: yeni bir PATCH derlemesi (şema geriye dönük açılmaz).

### Kanıt
- `npm run verify` (typecheck, lint, test): 110 suite / 1458 test yeşil, 3 atlandı (yayın öncesi son sayı etiket günü yeniden alınır). `npx expo-doctor`: 21/21.
- Release APK (x86_64, 32,46 MB): emülatörde (Android 15, Google APIs) açılış, check-in, kart, paylaşım önizlemesi, rapor, silme ve
  bildirim planı turu; hata taraması temiz. Kayıtlar: `docs/muhendislik/uygulama-gunlugu.md`, `docs/muhendislik/arac-zinciri.md`.
- **Henüz yok:** EAS build ve imza, gerçek cihaz turu (E1-E15), PCAPdroid ağ gözlemi, geri alma provası (0.1.0 -> 0.1.1 üstüne kurma).

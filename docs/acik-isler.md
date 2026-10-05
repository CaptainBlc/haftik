# Açık işler (canlı liste)

> CLAUDE.md "Durum ve açık işler" bölümünden **2026-10-02'de taşındı**; güncel tutulan tek yer burası.
> Bir iş bitince buradan silinir ve `docs/muhendislik/uygulama-gunlugu.md`'ye (tarihiyle, K kanıtıyla)
> yazılır. Tamamlanan dilimlerin günlüğü orada; karar kayıtları `docs/kararlar/`'da.

## Sıradaki

S16a bitti (metin onayı 2026-10-04, `docs/s16a-metin-onayi.md`) → P1 0.1.0 (hesaplar Batuhan'da) → çekirdek (S19+).
Taban dilimleri bitti: S13, S14, S15, S16b, S17, S18 (`npm run verify`: 98 suite / 1333 test yeşil, 2026-10-05).
**S22 kısmi (2026-10-05):** Kaydet anı bitti, hata cümlesi ve geçiş dahil. Kalan: haptik (S20), bugünün noktası (S23), "Yeni bir hafta, temiz sayfa" satırı (metin onayı: `docs/s22-metin-onayi.md` son bölüm).
**S19 kısmi (2026-10-05):** bağımsız altyapı bitti (token, R-7, P-6, fontlar, Sticker, R-15, R1 çerçevesi, fikstürler;
`docs/muhendislik/kart-render.md`). `CardView` v2 için **P0 görsel oturum sonucu, F0-9 Story ölçümü ve `layout.test.ts`
değişikliği onayı** bekleniyor (kontrol listesi: `docs/p0-gorsel-oturum-kontrol-listesi.md`; görseller hazır: `docs/p0-materyal/README.md`). R1 K4 tamam (2,0x ve 2,625x, kenar 2,27/1,81 -> ~1,1 px); v2 kontur profili `CardView` v2 ile tekrarlanacak.

## Batuhan'ın onayladığı, henüz uygulanmamış kararlar

Karar A 18/18 ve Karar B 14/14 tamam — tam liste ve gerekçe `docs/kararlar/`:
- Ayarlar'daki ayrı "Kart hazır" anahtarı (A12'nin UI tarafı, S23)
- paylaşım unvanı + security-reviewer görüşü (B1, S21'in girdi kapısı)
- seviye/font/ikon/haptik/K3-banner/Kaydet-sonrası/9:16/rakam-kuralı (B2-B10, S19-S23)
- 6 kişilik P0 görsel test oturumu (B12, S19'dan önce)
- Maestro kurulumu (B14, çekirdek kapısında)

## Batuhan'dan bekleyen

- **P0 görsel oturum + F0-9** (`CardView` v2 kapısı): `docs/p0-gorsel-oturum-kontrol-listesi.md`.
- **Metin onayı** (S16b'den, geçici): "Silinemedi", "Yüklenemedi" + "Tekrar dene", rapor önizleme girişi.
  ("Kaydedilemedi" uyarı kutusu Bugün'de kalktı, yerini S22'nin onaylı hata cümlesi aldı.)
- `app.json` `version` hâlâ `1.0.0`; plandaki ilk dış sürüm 0.1.0 (release-manager/Batuhan).
- S16a'dan devreden: gizli çıkartma alt yazısı ("bilerek saklandı") S19 çizimiyle; onboarding'in kalan metinleri/ÖRNEK kart/18 yaş notu (19 §3.3) ve havuz genişletme (19 §4.3, ~190 metin) ayrı turlar; gizlilik sayfası düzeltmeleri K10 hukuki görüşüne güncel hâliyle verilecek.
- Karar C (denemeden önce, 10 madde) ve D (ikinci yapı, 10 madde).
- N-9 uygulama kilidi/FLAG_SECURE (öneri: yalnız son uygulamalar önizlemesini gizle).
- K10 KVKK/hukuki görüş, politika URL'si ve yayın yeri.
- Hesaplar: Expo, Play (13 Kasım 2023 öncesi var mı), Apple Developer.

## Cihaz/release kanıtı bekleyen (K4/K5)

- D2D test modu (`bmgr`) + OEM aktarım (A17'nin "veri taşınmaz" sözünü tam kanıtlar).
- 0.1.0'da PCAPdroid ağ gözlemi (INTERNET izni release'te yok, mekanik kanıt var; bu ikincil).
- Başarılı paylaşım hedefinde (WhatsApp) görselin eksiksiz gittiği; K5 mağaza bağlantısının hedefe taşındığı.
- Koyu moddaki cihazda 3 ekran ve 6 Önemli A11Y bulgusunun yeniden ölçümü (A11 sonrası).
- Bildirim tıklaması sıcak/soğuk açılış (09 #1/#2/#5; kod/K2 testiyle doğrulandı, cihaz kanıtı kaldı).
- API<31 exact alarm (R-23), kanal kapatma (R-25), Doze/standby turu; Pazar bildirimi gerçek teslim gecikmesi.
- TZ/DST testleri (şu an `it.skip`).
- iOS tümü: iCloud yedek hariç tutma, `cacheDirectory` süpürme, TestFlight turu.
- AAB + EAS `mapping.txt` saklama (`buildArtifactPaths` alan adı doğrulanmadı; yerelde
  `C:\dev\haftik-artifacts\`).
- Takip: `docs/manual-checklist.md`, `docs/inceleme-2026-09-25/29-yol-haritasi.md` §6 (blokaj haritası).

## Bilinen teknik borçlar

- Rapor v2 kalan alanlar (ilgili özellik gelince, `docs/muhendislik/olcum-ve-rapor.md`): `fmt`/`src`/`switched` (biçim seçici), `album`,
  `cardFeel`, `strip`; `titleVisibleDefault` (küçük hücre bastırması + security-reviewer onayı). Eski v1 toplayıcı
  (`metrics-calc.aggregateMetrics`) artık `scripts/merge-reports.js` ile örtüşüyor (yalnız testte kullanılıyor); silmek ayrı onay.
- Rapor v2: privacy-compliance-analyst'e bildirim (rapor içeriği genişledi, politika/Data Safety cümlesi); `notif_opened` cihaz kanıtı.
- Material Symbols yazı tipi (967 KB, APK'da `res/*.ttf`): expo-router'ın statik import zincirinden gelir (`native-tabs` -> `expo-symbols` ve
  `@expo/ui`, 80 dosya); kullanmıyoruz ama Metro ağaç budamadığı için pakete giriyor. Çıkarmak Metro `resolveRequest` ile Expo iç
  modüllerini boşaltmak demektir (açılışta çökme riski, doğrulanmadı) ve kazanç ~%3; **bilerek yapılmadı** (2026-10-05). APK bütçesi
  (40 MB) sıkışırsa yeniden bak.
- `data/delete-all.ts` katman istisnası (kart/rapor dosyası süpürmesini çağırır).
- Ayarlar'daki sürüm satırında ayrı "kopyala" düğmesi yok (seçilebilir metin; `expo-clipboard` eklenmedi).

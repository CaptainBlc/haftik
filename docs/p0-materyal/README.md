# P0 görsel oturumu materyali

> 2026-10-05. Oturum protokolü ve kontrol listesi: `docs/p0-gorsel-oturum-kontrol-listesi.md`.
> PNG'ler repoda DEĞİL: `C:\dev\haftik-artifacts\p0\gosterilecek\` (ikili dosya, commit'lenmez). Burada yalnız
> üretici betik ve anahtar var.

## Katılımcıya gösterilecek dosyalar (nötr adlar)

| Dosya | Ne | Boyut |
|---|---|---|
| `g1.png` | **C, görünür** (yön C, yetişkin sürüm) | 1080x1920 |
| `g2.png` | **Eski, gizli** (uygulamanın bugünkü kartı, varsayılan gizleme: uyku + harcama, unvan `???`) | 1080x1920 |
| `g3.png` | **C, gizli** (aynı gizleme: uyku + harcama + unvan) | 1080x1920 |
| `g4.png` | **Eski, görünür** (bugünkü kart, tüm satırlar açık) | 1080x1920 |
| `g5.png` | **ÖRNEK kart** (onboarding'de gösterilecek; "ÖRNEK" bantlı, iki gizli çıkartma) | 1080x1920 |
| `g6.png` | **Seviye işareti (L1)**: aynı kategori, üç seviye yan yana ("sağdaki daha mı iyi?", "orta en iyisi mi?") | 1080x708 |

**Sıra dengeleme (6 kişi, 3 + 3):**
- *Eski önce* grubu (3 kişi): `g4`, `g2`, sonra `g1`, `g3`.
- *C önce* grubu (3 kişi): `g1`, `g3`, sonra `g4`, `g2`.
- Sonra herkese `g6` (L1) ve `g5` (ÖRNEK), protokolün 8. ve 9. adımı.
- F0-9 (Story/Durum ölçümü) için kaynak: `g1.png`.

Dosya adlarının ne olduğunu katılımcıya söyleme; sohbet simülasyonunda dosyayı "resim" olarak gönder (belge
olarak değil), tam boyutta bakışı telefonun galerisinde göster.

## İçerik eşitliği ve farklar

- **Aynı içerik:** unvan "Adım Çok, Fiş Yok", dört satır, özet ("Kıyaslayacak önceki hafta yok, sayfa yeni açıldı."),
  emojiler (🏃 😌 🐷 👥), damga/marka "haftik" (mağaza bağlantısı görünmez).
- **Eski (g2, g4):** gerçek uygulamadan, release APK, emülatör, R1 yakalama çerçevesiyle (keskin). Damga için
  `CARD_STAMP_TEXT` geçici olarak "haftik" yapılıp derlendi, sabit hemen geri alındı (repoda değişiklik yok).
- **C (g1, g3, g5):** `docs/inceleme-2026-09-25/14-gorsel-prototipler/v2/kart-v2.html` prototipinin CSS ve kurucu
  kodu birebir; Edge headless, 3x. Fraunces/Inter v2 için paketlediğimiz `.ttf` dosyaları, emoji uygulamadaki Eski kartla
  aynı (Android'in Noto Color Emoji'si). **Bu bir React Native derlemesi DEĞİL**: döndürme, font ve gölge farkı olabilir;
  S19 sonrası RN çıktısıyla 3 kişilik tekrar testi var (23 §2.2 P1).
- **Yalnız C'de bulunan, tasarım gereği:** seviye kelimeleri ve L1 işareti (Eski kartta seviye göstergesi yok),
  "HAFTALIK KART" bandı, mühür, "HER PAZAR BİR KART" alt yazısı.
- **Gözlem (düzeltilmedi):** unvan "Adım Çok, Fiş Yok" statik Fraunces 800 ile 38 px'te iki satıra bölünüyor
  ("Yok" tek başına ikinci satırda); tasarım kademesi (≤18 karakter) bunu 1 satır varsayıyordu. P0'da kaydet: unvan
  okunurluğu etkileniyor mu (M1). Düzeltme CardView v2'de (unvan kademesi/boyut).
- **Gizli C'deki "bilerek saklandı" alt yazısı** S16a'dan devreden açık metin maddesi (`docs/acik-isler.md`); P0'da
  gizli hâlin okunuşu (soru 6) bu metinle ölçülür.
- WhatsApp görseli JPEG'e çevirir; C'nin nokta dokusunda hare (moiré) olabilir (21 §2b R5). Bu bilinçli olarak testin parçası:
  gerçek koşulda nasıl göründüğüne bak.

## Yeniden üretme

```bash
# 1) Yazı tipleri (repo node_modules'tan) ve emoji fontu (emülatörden: adb pull /system/fonts/NotoColorEmoji.ttf)
#    şu klasöre konur: C:\dev\haftik-artifacts\p0\fonts\
#    Fraunces_800ExtraBold, Fraunces_600SemiBold_Italic, Inter_500Medium, Inter_700Bold, Inter_800ExtraBold, NotoColorEmoji
# 2) HTML'i üret
node docs/p0-materyal/make-c-cards.js C:/dev/haftik-artifacts/p0
# 3) Render (Edge headless, 3x -> 1080x1920)
msedge --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=3 --window-size=360,640 \
  --allow-file-access-from-files --virtual-time-budget=4000 \
  --screenshot=c-normal.png "file:///C:/dev/haftik-artifacts/p0/kart-c.html?k=normal"
# k = normal | gizli | ornek | seviye
```

Eski kartlar: `haftik://card/<Pazartesi>` ile aç, "Paylaş", varsayılan gizlemeyle paylaş (`g2`), sonra uyku ve harcamayı
göster ve paylaş (`g4`); PNG `cache/haftik-share/Haftik-kart.png` dosyasından `adb pull` ile alınır.

# Pazar Akışı — "önce bugünü işaretle" (K3 çözümü)

Kaynak: `spec.md` "Bildirim planlama kuralları > Pazar çakışması (E4)"
(s.194-195): *"Pazar günü kart ilk açılırken bugün henüz işaretlenmediyse
kullanıcı önce check-in ekranına yönlendirilir ('bugünü de ekle, sonra kart
açılsın'); kart, check-in sonrası dondurulur."* Bu spec'te zaten karara
bağlanmış bir karar (E4a, K3 varsayılanı = bu öneri); bu dosya onu somut
ekran akışına döker, yeniden açmaz.

## Neden bu çakışma var

- Varsayılan günlük hatırlatma: **21:00**.
- Kart açılışı: **Pazar 20:00'den sonra** (eşik sağlanmışsa).
- Sonuç: kullanıcı çoğu Pazar, kartını hatırlatmadan **önce** açmaya
  çalışabilir — o anda günün (Pazar) check-in'i büyük olasılıkla henüz
  yok. Alternatif çözüm (Pazar hatırlatmasını 19:30'a çekmek) spec'te
  değerlendirilip **elenmedi ama seçilmedi**; K3 varsayılanı check-in
  yönlendirmesidir, bu doküman onu uygular.

## Akış (adım adım)

```
[Kullanıcı kart açmayı tetikler]
   - hafta durumu ekranındaki kilitli kart kutusuna dokunarak, VEYA
   - "kartın hazır" bildirimine dokunarak
        |
        v
[Sistem kontrolü: eşik + saat sağlanıyor mu? (WeekState.unlocked)]
        |
   +----+----+
   | hayır   |----> kilitli kart kutusuna geri, mesaj değişmez
   +----+----+       ("X gün lazım" / "20:00'de açılıyor")
        |
       evet
        |
        v
[Sistem kontrolü: bugünün (Pazar) check-in kaydı var mı?]
        |
   +----+-----------------------------+
   | var                        yok    |
   v                                   v
[Kart reveal akışı]          [Ara ekran: "Bugünü de ekleyelim"]
(bkz. ekran-akisi.md               |
 "wow anı")                        v
                           [Check-in ekranı: 4 kategori + Kaydet]
                                    |
                                 Kaydet
                                    |
                                    v
                          [Otomatik devam: Kart reveal akışı]
                          (ekstra dokunuş YOK — Kaydet aynı zamanda
                           "devam et" işlevi görür)
```

## Ara ekran — "Bugünü de ekleyelim"

```
+-----------------------------------+
|                                     |
|   Kartını açmadan önce bugünü de   |
|   ekleyelim.                       |
|                                     |
|   Bugünün verisi olmadan hafta     |
|   eksik sayılır.                   |
|                                     |
|       [   Bugünü işaretle   ]      |
|                                     |
|              (geri)                |
+-----------------------------------+
```
- Tek buton, tek eylem: "Bugünü işaretle" → doğrudan check-in ekranına
  gider (Ekran 2, `ekran-akisi.md`), o ekranda normal 4 kategori + Kaydet
  akışı aynen çalışır.
- Metin **tavsiyesiz, tanısız** (ton kuralı): "eksik sayılır" nötr bir
  bilgi cümlesi, "kötü gidiyorsun" gibi bir yargı içermiyor.
- **Geri tuşu/gesture engellenmez.** Gerekçe: spec'in zorunlu kıldığı şey
  "kartın bugünsüz dondurulmaması", ekranın kendisi değil — kullanıcıyı
  fiziksel olarak hapsetmek (geri tuşunu devre dışı bırakmak) hem
  Android/iOS platform beklentilerine aykırı hem de gereksiz bir sürtünme.
  Kullanıcı geri giderse hafta durumu ekranına döner; kilitli kart kutusu
  **kilitli kalır** (spec: bugünsüz dondurulmaz) ve altındaki metin
  "Bugünü işaretlemeden kartın açılmaz" olarak güncellenir — böylece
  sistem davranışı (zorunlu check-in) korunur, ama arayüz kullanıcıyı
  zorla kilitlemez.

## Kaydet sonrası otomatik devam

Check-in ekranındaki "Kaydet" butonu, bu akıştan tetiklenmişse **normal
davranışına ek olarak** doğrudan kart reveal akışını başlatır (ekstra
"şimdi kartı aç" butonu eklenmez). Gerekçe: kullanıcı zaten "kartımı
açmak istiyorum" niyetiyle buraya geldi; Kaydet'ten sonra ayrı bir tıklama
istemek, çözülmüş bir sorunu tekrar kullanıcıya sormak olur.

## Kenar durumlar

1. **Kullanıcı Pazar 20:00'den önce, hafta zaten 4+ dolu günle uygunsa ve
   bugünü de doldurmuşsa:** direkt reveal, ara ekran hiç görünmez (normal
   akış, çakışma yok).
2. **Kullanıcı "kartın hazır" bildirimine (20:00'de gönderilen) hemen
   dokunursa:** bugünün check-in'i büyük olasılıkla henüz yok (bildirim
   tam o an gitti) → ara ekran neredeyse her zaman devreye girer. Bu
   **beklenen ve sık** bir senaryodur, hata değildir; ara ekran metni bu
   yüzden nötr ve hızlı (tek buton, tek cümle) tutuldu.
3. **Kullanıcı Pazar 23:59'a kadar hiç check-in yapmazsa:** kilitli kart
   kutusu o gün boyunca "Bugünü işaretlemeden kartın açılmaz" mesajıyla
   kilitli kalır; Pazartesi 00:00'dan sonra spec'in "geçmiş açık hafta"
   kuralı devreye girer — o zaman artık "bugün" Pazartesi olduğundan,
   geçen haftanın Pazar'ı için check-in eklenemez (düzenleme penceresi
   bugün/dün ile sınırlı, spec s.112) ve geçmiş hafta o günü **eksik**
   olarak dondurulur (spec: "uygun ama açılmamış geçen haftanın kartı
   açılabilir kalır... süre sınırı yok" — ama artık Pazar'ı ekleme şansı
   kalmadığı için o haftaki delta/ortalama Pazar verisi olmadan hesaplanır).
   Bu durumda ara ekran **artık gösterilmez** (bugün Pazartesi, "bugünü
   işaretle" mantığı yalnızca Pazar gününe özel) — kullanıcı doğrudan
   reveal akışına gider.
4. **Eşik marjinal durumda bile (ör. tam 4 dolu gün, bugün hariç zaten
   sağlanmış) kart yine bugünsüz dondurulmaz.** Spec kararı koşulsuzdur:
   Pazar günü her kart açma denemesinde bugün boşsa yönlendirme yapılır —
   böylece o haftanın Pazar verisi mümkün olduğunca karta dahil edilir
   (spec'in "kart, check-in sonrası dondurulur" ifadesinin amacı budur).
5. **Kullanıcı ara ekrana birden fazla kez gelirse (geri gidip tekrar
   dokunursa):** her seferinde aynı kontrol tekrar çalışır, durum
   değişmediyse aynı ara ekran tekrar gösterilir — idempotent, özel bir
   "tekrar" durumu yönetimi gerekmez.

## Neden alternatif (Pazar hatırlatmasını 19:30'a çekmek) burada uygulanmadı

Spec bu alternatifi not düşüyor ama varsayılan olarak seçmiyor; K3 kapısı
"varsayılan: spec'teki öneri" diyor. Bu tasarım o varsayılanı uygular.
19:30 alternatifinin UX açısından zayıf yanı: hatırlatma saatini
kullanıcı ayarlardan değiştirebiliyor (spec MVP: "hatırlatma saati/aç-kapa
ayarlanabilir") — kullanıcı saati 20:00'den sonraya taşırsa çakışma yine
oluşur; check-in-önce-yönlendirme çözümü ise kullanıcının hatırlatma
saatinden **bağımsız** her zaman doğru çalışır. Bu yüzden burada tercih
edilen yaklaşım daha sağlam; alternatif Batuhan onayı gerektirdiği için
spec'te açık bırakılmıştı, K3 kapısında varsayılan zaten bu yönde.

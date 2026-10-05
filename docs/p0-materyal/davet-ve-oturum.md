# P0 oturumu: davet taslağı ve oturum günü kartı

> 2026-10-05. **Taslaktır; göndermek senin işin** (benim adıma kimseye mesaj atılmaz). Protokol: `docs/p0-gorsel-oturum-kontrol-listesi.md`.
> Görseller: `docs/p0-materyal/README.md` (`g1..g6`). Sonuç hesabı: `node scripts/p0-sonuc.js kayit.csv`.

## 1. Davet mesajı (bire bir, toplu gruba değil)

> Selam! Bir uygulama üzerinde çalışıyorum ve ona bakacak taze gözlere ihtiyacım var. Uygulamayı kurman gerekmiyor:
> sana birkaç görsel göstereceğim ve ne düşündüğünü soracağım, toplam 15-20 dakika. Doğru ya da yanlış cevap yok,
> görseli test ediyoruz, seni değil. Adın hiçbir yere yazılmaz (sana bir kod veriyorum, P1 gibi). İstediğin an
> bırakabilirsin. Sonunda "beğendiğini istersen Durumuna koy" diyeceğim, koymak zorunda değilsin; ertesi gün bir kez
> "koydun mu?" diye soracağım. Müsait olduğun bir gün var mı?

Notlar: "ilginç bir uygulama" gibi övücü bir ifade kullanma; ne olduğunu anlatma (ön yargı oluşturur). Aile büyüğü ve en
yakın arkadaş yerine "nazik evet" demeyecek, tasarımcı/geliştirici olmayan kişiler; en az 1-2 iPhone'lu. 6 kişiyi
**E1 (deneme) kohortunun dışından** seç; E1 havuzunu tüketme.

Ses kaydı alacaksan önce izin iste, kayıt tutulmadan silinir. Kimlik/isim yazma; yalnız P1..P6.

## 2. Oturum günü (kişi başı 15-20 dk)

1. Görsel sırası (kişiye göre, `README.md`): **Eski önce** grubu `g4, g2, g1, g3`; **C önce** grubu `g1, g3, g4, g2`.
   Önce ÜÇ KİŞİ bir grupta, ÜÇ KİŞİ ötekinde (CSV `sira`: E / C).
2. Her görsel için sırayla: **3 sn göster, kapat** ("ne gördün? unvanı hatırlıyor musun?"), sonra **WhatsApp'a resim olarak gönder**
   ve ilk tepkisini/ilk sorusunu not et, sonra "Durumuna/Hikayene koyar mıydın?" (E / B / H).
3. Dört görselden sonra: yaş/çocuk-yetişkin (1-5), **açık uçlu** "bu kart kime hitap ediyor?" (kendiliğinden "çocuksu" derse `cocuksu_acik`=E;
   **sen o kelimeyi söyleme**), "iş arkadaşına atar mıydın?", gizli hâl (ne düşündürdü, şaka mı saklama mı, unvanlı mı gizli mi),
   gizlilik (ne öğrenir, veri nereye gider sanıyor), ana engel (tek sözcük).
4. `g6` göster: "sağdaki daha mı iyi?" (E/H), "orta en iyisi mi?" (E/H). `g5` göster: "bu kart kime ait?" (kendi kartı sandıysa E).
5. Ad: "buna ne derdin: kart / karne / albüm / ne?" (önce açık uçlu). "Play'de aratsan ne yazardın?"
6. Son: "Beğendiğini Durumuna koy, koyarsan ekran görüntüsünü at. Koymak zorunda değilsin."
7. **24 saat sonra tek mesaj:** "Koydun mu?" (CSV `gercek_koydu` E/H). Israr etme.

Tarafsızlık: ölçek uçlarını ikisini de say (yetişkin espri ... çocuk oyunu); bir görseli "yeni/eski/tasarımlı" diye tanıtma; tercih
sorulmadan önce cevapları kaydet; kişi sorarsa "hangisi daha çok hoşuna gitti" gibi sor, hangisinin hangisi olduğunu söyleme.

## 3. Kayıt ve sonuç

```bash
# docs/p0-materyal/kayit-sablonu.csv'yi repo DIŞINA kopyala (kişisel not), kişi başı bir satır doldur
node scripts/p0-sonuc.js C:/dev/haftik-artifacts/p0/kayit.csv
```

Çıktı bir **öneri**dir (GEÇ / BELİRSİZ / DUR ve olgunlaştır) ve her ölçüyü eşiğiyle gösterir. **Not (M2):** "C'yi tercih eden"
ayrı bir zorunlu-tercih sorusundan değil, kişinin iki GÖRÜNÜR kartta verdiği "koyarım" puanlarından türetilir (E=2, B=1, H=0;
C'ninki Eski'ninkinden yüksekse C'yi tercih etmiş sayılır). İstersen oturumun sonuna "ikisinden birini seçmen gerekse?" sorusunu da
ekle ve bana söyle, sütun olarak eklerim. Kararı sen verirsin; sonuç tablosunu
ve kararını bana ver, `docs/kararlar/`'a işlerim. Eşikler önerilen değerlerdir (23 §2.2), kimse onaylamadı; onaylıyorsan söyle.

## 4. F0-9 (Story/Durum bandı), aynı gün, 10 dk

`g1.png`'yi telefonuna al, Instagram Hikâye ve WhatsApp Durum editörüne koy, **yayınlamadan** ekran görüntüsü al. Üstten/alttan kaç
piksel kapandığını ve hangi öğelerin (unvan, satırlar, özet, mühür, "haftik") kapandığını yaz (kontrol listesi bölüm E).

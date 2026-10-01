# 16 — Ortak brif: Haftik v1.1 / v1.5 (2026-09-28)

Bu belge, bu turda çalışan tüm ajanların ortak zeminidir. Önce bunu, sonra kendi alanına ait raporları oku.

## Batuhan'ın kararları (kesin, yeniden açma)

1. **Kart yönü: C "Çıkartma albümü"** (noktalı albüm sayfası, kalın kontur, sert gölge, sarı unvan çıkartması, gizli durumda "henüz yapıştırılmamış çıkartma"). Prototip: `14-gorsel-prototipler/kart-c-cikartma-albumu.html`. Tasarımcının önerisi A idi; Batuhan C'yi seçti. Bilinen risk (15/14 raporlarında): hedef kitle 18+, çocuksu görünme riski. **Görev: C'yi "yetişkin, zarif, esprili çıkartma albümü" olarak olgunlaştırmak**, seçimi sorgulamak değil.
2. **İkon: 3 (çıkartma)** — `14-gorsel-prototipler/ikon-3-cikartma.svg`.
3. **İş sırası:** Taban (hata/spec eksikleri) → Çekirdek (kimlik, paylaşım anı, Kaydet anı, örnek kart) → arkadaş denemesi → ikinci yapı (içerik derinliği, Karnelerim). `13-urun-vizyonu.md` bölüm sıralaması geçerli.
4. **Kategori başına renk/ton İZİNLİ** (önceki "renk yok" kararı kalktı). Seviye renk ile değil doluluk/boyut/şekil ile anlatılır (renk tek başına anlam taşımaz). Gizli kategori görsel dil ile sızmamalı.
5. **Adlandırma: "Kart"** (haftalık kart). "Karne" ifadesi kullanıcıya dönük metinde tutarlı biçimde gözden geçirilir; belge mizahı gerekiyorsa ürün adıyla uyumlu kalır.
6. **Seviye noktaları GELİŞTİRİLECEK** (kaldırılmayacak): 1-3 dolu nokta "puan/daha iyi" gibi okunmamalı; yeni bir seviye gösterimi tasarla (ör. çıkartma boyutu/doluluk/şekil).
7. **R8 küçültme + gereksiz paketlerin çıkarılması taban işine girer** (`12-performans.md`).
8. **Ekibin tamamı %100 kullanılacak:** "daha profesyonel bir iş" görünümü için her alanda geliştirilmesi gereken yerleri tespit et VE yeni özellik öner (kendi uzmanlık alanından).

## Sabit kısıtlar (bozulamaz)

- Yerel-only: hesap/sunucu/analitik yok; gizlilik sözü. Üretimde ağ çağrısı yok (INTERNET izni ve firebase/c2dm meselesi ayrı ele alınır).
- Android-first (iOS koşullu); Expo SDK 57/RN/TS/expo-router/expo-sqlite; solo geliştirici (efor gerçekçi olsun).
- Kartta ham sayı/tutar/konum/tarih yok; renk tek başına anlam taşımaz; metin kontrastı ≥4.5:1; hedef ≥48dp; 411x914dp tek ekran bütçesi (CLAUDE.md).
- Dark pattern yok: seri kaybı korkusu, FOMO, bildirim yağmuru, paywall'lı paylaşım yok.
- Kapsam genişletme sessizce eklenmez: yeni özellik önerisi **taslak intent (3-5 cümle)** ile gelir. Dosya olarak intent oluşturma, Batuhan karar verir.
- Kanıt: her iddia K0-K5 etiketli; "doğrulanamadı" açıkça yazılır. Uydurma kaynak/sayı yok.

## Okunacaklar (sırayla)

`CLAUDE.md` (Bilinen tuzaklar) · `13-urun-vizyonu.md` · `15-rakip-ve-referans.md` · `14-gorsel-prototipler/README.md` ve kart-c/ekran-*.html · `10-gorsel-kimlik.md` · `11-erisilebilirlik.md` · `12-performans.md` · alanına göre 01–09.

## Çıktı kuralları

- Kendi alanına ait rapor: `docs/inceleme-2026-09-25/` altında, verilen dosya adıyla. Önce iskelet, sonra bölüm bölüm doldur (kesinti/rate-limit koruması).
- Bu turda **kod (`src/`), `assets/`, `app.json`, testler değişmez**; emülatöre dokunulmaz (yalnız belirtilen ajan hariç). Commit yok.
- Rapor yapısı: (1) Bu alandaki durum: profesyonel görünümü engelleyen/eksik yerler (kanıtlı, öncelikli); (2) C yönüne ve kararlara göre somut öneriler (uygulanabilir: dosya/ekran/ölçü/metin); (3) **yeni özellik önerileri** (etki/efor/gizlilik uyumu, taslak intent); (4) bağımlılıklar ve diğer ajanlara devir; (5) Batuhan'a sorulacak kısa, seçenekli sorular; (6) doğrulanamayanlar.
- Aşırı uzatma: kendi raporun ≤ ~25 KB. Kimseyle çelişirsen çelişkiyi açıkça yaz, sessizce gömme.

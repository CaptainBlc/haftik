# 2026-10-01 — Çekirdekten önce kararlar (Karar B, 14/14)

Onaylayan: Batuhan. Kaynak: `docs/inceleme-2026-09-25/29-yol-haritasi.md` §4.B.
Durum: kararlar kilitlendi. Uygulama S19-S23 (Çekirdek fazı) içinde, testleriyle birlikte yapılacak.

## Ö grubu (düşük riskli, tek onayla)

- **B2 — Seviye gösterimi:** L1 (konum işareti) + kelime birincil. P0 oturumunda "sağdaki daha mı iyi?"
  sorusuna ≤1/5 evet çıkarsa yalnız kelime kalır. Domain değişmez. → S19.
- **B3 — Font ve ikon:** Fraunces + Inter (kart), ikon v2 finali (beyaz kesim kenarı, pırıltısız). v2 onayı
  bunları zaten kapsıyor. → S19/S20.
- **B4 — Story'de marka:** Mühür + wordmark yeterli; B12'deki P0/F0-9 ölçümü aksini gösterirse güvenli banda
  taşınır. → S19.
- **B5 — Haptik:** Evet, Kaydet ve kart açılış ("yapışma") anında; sistem ayarına (azaltılmış hareket/haptik
  kapalıysa) uyar. → S20/S22.
- **B6 — Pazar K3:** Ayrı ara ekran yerine Bugün ekranında 56dp banner. `pazar-akisi.md` buna göre güncellenir,
  A11Y-08 kendiliğinden kalkar. → S23.
- **B7 — Bildirim izni isteme zamanı:** Onboarding'de kalır; ön-soru deseni ve saat çipleri eklenir. → S23.
- **B8 — Kaydet sonrası:** Bugün ekranında kalınır (otomatik Hafta'ya geçiş yok); bekleyen açılmamış kart
  varsa düğme "Geçen haftanın kartını aç" olur. → S22/S23.
- **B9 — Ek paylaşım biçimleri:** v1.5'te yalnızca 9:16. Kare ve "yalnız unvan çıkartması" denemeden sonraki
  ilk intent adayı. → S21.
- **B10 — Rakam kuralı:** Paylaşılan PNG'de rakam da harfle yazılmış sayı da yok; uygulama içinde (yalnız
  ekranda, PNG'ye hiç girmeden) serbest. → S19/S23.
- **B13 — Küçük eklemeler:** Evet — uygulama içi sürüm satırı, `build`/kanal etiketi (rapor v2). Hesapsız
  geri bildirim yolu iletişim adresine bağlı (C8 kararı bekliyor). Kart tepkisi (F1) opsiyonel. Sonraya
  bırakılanlar: uygulama kısayolları, galeriye kaydet, kullanıcı tetikli sorun raporu. → S16b/S23.

## O grubu (onay alındı)

### B1 — Paylaşım unvanı
**Evet, eklensin.** Kartın yanında, yalnızca hareket+sosyal kategorilerine dayanan, dondurulmuş ayrı bir
"paylaşım unvanı" (I-2 intent). Eski kartlarda (yeni sütun boşken) sansür şeridi gösterilir, geriye doldurma
yapılmaz. Varsayılan gizlemede okunur unvan oranı tasarım gereği **%100** olur (bugün ~%19). **Şart:**
security-reviewer bu mekanizmaya (ve 21. raporun bulduğu çıkarım-sızıntısı riskine) S21 başlamadan önce görüş
verir — bu, S21'in girdi kapısı. I-2 intent dosyasını Batuhan kendisi commit'ler.
→ S21 (`docs/muhendislik/kart-render.md` "Unvan otomatik gizleme" notu güncellenecek).

### B11 — Efor tavanı
**~29 günü kabul et, kesme yapma.** Mimari raporunun ilk tahmini (~24 gün) diğer raporların eklediği işleri
(S17 platform yapılandırması, bildirim kanalları, 6 Önemli erişilebilirlik bulgusu, güvenli silme, rapor v2)
saymıyordu. Roadmap'teki 6 adımlık kesme sırası (§3e) şimdilik **kullanılmayacak** — hiçbir madde atlanmıyor,
takvim buna göre ~29 odaklı iş günü olarak planlanıyor.

### B12 — Birleşik P0 görsel test oturumu
**Bu hafta ayarlanacak.** 6 kişi, E1 deneme kohortunun dışından, iPhone'lular dahil. Ölçülenler: tercih
(eski vs C kartı), çocuksu/yetişkin ölçeği, 3 saniyede unvanı okuma, L1 seviye göstergesinin okunurluğu,
ÖRNEK kartı kendi kartı sanma riski, gizli hâlin okunuşu, 24 saatlik gerçek paylaşım niyeti. S19 (kart v2
kodlaması) başlamadan önce yapılması gerekiyor — kodlamadan sonra düzeltmek daha pahalı. Kaynak protokol:
`docs/inceleme-2026-09-25/23-buyume-ve-deneme.md` §2.2, `27-olcum-v2.md` §3.2 (kill/geç kuralları).

### B14 — e2e test aracı
**Evet, çekirdek kapısında (S19 sonrası) Maestro kurulsun.** Taban fazda (S13-S18) yalnızca adb betikleriyle
devam edilir — kurulum maliyeti (Java + CLI) şimdi gerekmiyor. Maestro, manuel QA bulgularını tekrar çalışan
testlere çevirir (onboarding, check-in, kart, paylaşım, silme, bildirim akışları).

---

## Karar B tamamlandı: 14/14

Sıradaki gruplar: **C** (denemeden önce, 10 madde — Play hesabı, dağıtım, ASO), **D** (ikinci yapı ve sonrası,
10 madde — bugün cevap gerekmez). Bkz. `docs/inceleme-2026-09-25/29-yol-haritasi.md` §4.C/D.

# 11 — Erişilebilirlik denetimi (emülatör, K4) — 2026-09-28

> Yazan: `accessibility-auditor`. Ajan dosyayı kendisi yazmadı (yönerge çakışması iddiası); metin, ajanın teslim raporundan olduğu gibi bu dosyaya kaydedildi.
> Kanıt dosyaları: `C:\Users\Pc\AppData\Local\Temp\a11y\` (ekran görüntüleri ve dump'lar; geçici klasör, kalıcı değil).
> Ölçümler dp = px/2.625 (420 dpi) veya px/2 (320 dpi).

## Özet

1. Sayım (19 kontrol): **8 GEÇTİ / 8 KALDI / 3 YAPILAMAZ.**
2. Blokör yok. **Önemli 6:** A11Y-01 önizleme "< Geri" durum çubuğunda ölü; A11Y-02 gizle/göster 25x24dp; A11Y-03 hatırlatma anahtarı etiketsiz ve 46x27dp; A11Y-04 reveal animasyonu azaltılmış hareketi yok sayıyor; A11Y-05 "Tüm verilerimi sil" kontrastı 4.03:1; A11Y-06 yazı 2.0'da önizleme satırları "…" ile kesiliyor.
3. Düşük: 10 madde (A11Y-07..16).
4. İyi çalışanlar: emoji düğmeleri "Hareket: yoğun" diyor; seçili durum çerçeve + selected ile veriliyor; 1.3x'te taşma yok; koyu mod büyük ölçüde tema duyarlı; kart PNG'si ölçekten bağımsız.
5. YAPILAMAZ: TalkBack konuşma çıktısı (kuruldu ve açıldı, adb ile gezinme/konuşma gözlenemedi; yalnız a11y ağacı okundu), Türkçe yerelde "SİL", `canAskAgain:false` iken "Ayarları aç" durumu.
6. Ortam geri alındı (wm reset, density 420, font_scale 1.0, night no, animasyon ölçekleri 1.0, TalkBack kapalı, uygulama `pm clear` ile temiz onboarding, emülatör + Metro açık).
7. Sistem kaynaklı not (bulgu değil): `pm revoke` uygulama sürecini öldürdü, dev zaman geçersiz kılması sıfırlandı.

## Ekran envanteri
Onboarding 3 ekran (butonlar 347x52dp, `desc`=etiket; GEÇTİ). Bugün (boş/yarım/tam, Kaydet pasif/aktif), Hafta (kilitli, "Kartın hazır!", "Kartın açıldı."), Ayarlar (izin var/yok), Pazar ara ekranı, Kart reveal, Önizleme, silme/gizlilik/deneme raporu Alert'leri denendi. Bugün, Hafta, Ayarlar, Kart: 1.0/1.3/2.0 ve açık/koyu; 360x640 ve 411x914. **Bakılmayanlar:** Önizleme 1.3'te ve koyu temada 360x640'ta; Pazar ara ekranı yalnız 1.0/açık.

## Bulgular

### Önemli

**A11Y-01 — Önizlemede "< Geri" durum çubuğunun içinde (YB2-01 güncel kodda teyit).**
- Kanıt: dump `card-preview-back [63,63][1017,126]`, durum çubuğu `[0,0][1080,136]`. y=60–130 dokunuşları ekrandan çıkarmadı (`p1.png`, `t1.xml`). 360x640'ta (durum çubuğu 0..73px, Geri `[48,48][672,96]`) y=60 ölü, y=88 çalışıyor (`s360-prev.png`). Metin saat yazısının üstüne biniyor; 2.0'da `[63,63][1017,158]` ve yine binik (`p20.png`).
- Kural: WCAG 2.5.8, Material edge-to-edge inset. Aynı sınıf YB-1.
- Düzeltme: `src/components/card-preview-view.tsx` `container` stiline `paddingTop: Spacing.four + useTopInset()`, Geri'ye `minHeight: 48` ve yatay padding.
- Test önerisi: `checkin-single-screen-fit` gibi "üst kontrol bounds.top >= inset".

**A11Y-02 — Önizlemede gizle/göster düğmeleri 25x24dp (2.0'da 43x36dp).**
- Kanıt: `card-preview-toggle-*` `[951,595][1017,658]` (`p1.xml`); 360x640'ta da 25x24dp.
- Kural: Material 48dp, WCAG 2.5.8.
- Düzeltme: `card-preview-view.tsx` toggle Pressable'a `minWidth/minHeight: 48` + `hitSlop`, satıra `minHeight: 48`.

**A11Y-03 — Hatırlatma `Switch`'i etiketsiz, hedef 46x27dp.**
- Kanıt: `reminder-enabled-switch text="" desc=""`, `[895,373][1017,444]` (`08-settings-noperm.xml`; 2.0'da 46x35dp). TalkBack yalnız "anahtar, kapalı" okur.
- Kural: WCAG 4.1.2, 1.3.1, 2.5.8.
- Düzeltme: `src/components/settings-view.tsx` `accessibilityLabel="Günlük hatırlatma"` + satırın dokunma alanı 48dp (`hitSlop`).

**A11Y-04 — Reveal animasyonu azaltılmış hareket tercihini yok sayıyor.**
- Kanıt: animator/transition/window scale = 0 iken kart hâlâ ~1,5 sn aşamalı beliriyor (`rvA5.png`). Kodda `AccessibilityInfo`/`isReduceMotion*` araması: 0 sonuç.
- Hafifletici: dokunuşla atlanabilir ("Animasyonu atla"), süre <5 sn.
- Kural: WCAG 2.3.3 (AAA), Material "Remove animations".
- Düzeltme: `src/card/CardRevealView.tsx`: `AccessibilityInfo.isReduceMotionEnabled()` true ise animasyonu başlatmadan `handleSkip()`. `locked-card-placeholder.tsx` sallama animasyonu için de aynısı.

**A11Y-05 — "Tüm verilerimi sil" metin kontrastı 4.03:1 (açık), 3.93:1 (koyu).**
- Kanıt: `#D7263D` üstünde `#D7263D22` (beyaz üstünde `#FAE2E5`), 14sp kalın (büyük metin sayılmaz). Sabit renk, temaya bağlı değil.
- Kural: WCAG 1.4.3 (4.5:1).
- Düzeltme: `settings-view.tsx` `deleteLabel`: açıkta `#B3142B` (5.46:1), koyuda `#FF6B7D` (6.72:1), `useTheme` tabanlı.

**A11Y-06 — Yazı 2.0'da önizleme satırları kesiliyor.**
- Kanıt: `p20.png`: "…ne hiç durdun, deng…", "…ortada bir haf…". Kullanıcı paylaşacağı metni tam göremiyor.
- Kural: WCAG 1.4.4, 1.4.10.
- Düzeltme: `card-preview-view.tsx` `rowText` üzerinden `numberOfLines={2}` kaldır.

### Düşük

- **A11Y-07** Kaydet sonrası ekran okuyucuya duyuru yok (QA4-05 a11y yönü). `accessibilityLiveRegion`/`announceForAccessibility` 0. Düzeltme: `today.tsx` `handleSave` başarıda `AccessibilityInfo.announceForAccessibility('Kaydedildi')`. (WCAG 4.1.3)
- **A11Y-08** Pazar ara ekranında "Geri" 29x24dp (`k3.xml`). Düzeltme: `sunday-checkin-required-view.tsx` `minHeight/minWidth: 48`.
- **A11Y-09** Sekme çubuğu 2.0'da etiket ikonla üst üste, gesture çubuğunun altında (YB-4, `f20-week.png`); tab öğeleri `desc="📝, Bugün"` (emoji adı gürültü). Düzeltme: `(main)/_layout.tsx` `tabBarLabelStyle` `maxFontSizeMultiplier` (1.3), `TabIcon`'a `accessibilityElementsHidden`.
- **A11Y-10** Bildirim izni kapalı metni çözüm sunmuyor ("Bildirim izni kapalı, hatırlatma çalışmaz."). `canAskAgain:true` iken anahtarın izin isteyeceği söylenmiyor. Düzeltme: "Bildirim izni kapalı. Anahtarı açınca izin isteriz." (`settings-view.tsx`; copywriter).
- **A11Y-11** Başlıklar ekran okuyucuda heading değil (`accessibilityRole="header"` kodda 0). Düzeltme: `themed-text.tsx` `title`/`subtitle` tiplerine rol ekle.
- **A11Y-12** Kilitli kutu: etiket = alt yazı, ikisi de okunuyor (çift okuma); "Kartın hazır!" başlığı altında "Bugünü işaretlemeden kartın açılmaz" + gri iskelet + kilit karışık mesaj (YB2-06 ile aynı). Düzeltme: `locked-card-placeholder.tsx` alt yazıya `importantForAccessibility="no"`, etikete durum ekle.
- **A11Y-13** Kart reveal ekranında emoji ve satırlar ayrı düğümler, kategori etiketi yok (`c20-reveal.xml`). Düzeltme: `CardView.tsx` kök `accessible` + birleşik `accessibilityLabel`, emoji `no-hide-descendants`. (Önizleme satırları doğru etiketli.)
- **A11Y-14** 360x640'ta Bugün'de Sosyal kategorisi kesik, kaydırma ipucu yok (`s360-a.png`); Ayarlar'da Sil katlama altında. Kart bu ekranda 0,69 ölçekle çiziliyor (PNG etkilenmez).
- **A11Y-15** Sistem `Alert`: "Gizlilik politikası" varsayılan düğme "OK" (İngilizce); Geri tuşu Alert'i kapatmıyor (`cancelable` yok); silme onayı ne silineceğini söylemiyor. Düzeltme: `settings.tsx` `Alert.alert(..., [{text:'Tamam'}], {cancelable:true})`; onaya "Tüm check-in'lerin ve kartların silinir." (copywriter)
- **A11Y-16** Koyu mod kalanları: Hafta iskeleti (`#D1D1D6`) siyah zeminde parlak kutu (`n-week.png`); "Paylaş" düğmesi `#1C1C1E` siyah üstünde sınırsız (1.23:1; metin 17:1 okunur); seçilmemiş kutu sınırı 1.14:1 (açık) / 1.32:1 (koyu) ama emoji tanımlıyor; pasif çip metni 3.03:1 (devre dışı, WCAG muaf). (visual-designer)

## Kontrol tablosu

| # | Kontrol | Sonuç |
|---|---|---|
| 1 | Emoji düğmeleri kategori+seviye etiketi (12/12) | GEÇTİ |
| 2 | Seçili durum renksiz (selected + 2dp çerçeve) | GEÇTİ |
| 3 | Pasif Kaydet nedeni ("N kategori kaldı") | GEÇTİ (kısmen) |
| 4 | Ayarlar anahtarı etiketi | KALDI (03) |
| 5 | Hedef ≥48dp | KALDI (01, 02, 03, 08) |
| 6 | Metin kontrastı | KALDI (05) |
| 7 | Koyu mod (6 ekran) | GEÇTİ (16 kalıntı) |
| 8 | Yazı 1.3x | GEÇTİ |
| 9 | Yazı 2.0x | KALDI (06, 09) |
| 10 | 360x640 | GEÇTİ (14) |
| 11 | 411x914 | GEÇTİ |
| 12 | Durum çubuğu altı dokunulamayan bölge | KALDI (01) |
| 13 | Durum renksiz ayırt edilebilir | GEÇTİ |
| 14 | Azaltılmış hareket | KALDI (04) |
| 15 | Sade dil, izin/hata metinleri çözüm içeriyor | KALDI (10, 15) |
| 16 | Okuma sırası/başlık/kart etiketi | KALDI (11, 13) |
| 17 | TalkBack konuşma çıktısı | YAPILAMAZ |
| 18 | Türkçe yerelde "SİL" | YAPILAMAZ |
| 19 | `canAskAgain:false` "Ayarları aç" durumu | YAPILAMAZ |

## İyi çalışanlar
- Bugün: 12 emoji düğmesi ve dört kategori tek ekranda (411x914); 2.0'da Kaydet erişilebilir.
- Haftalık noktalar: "Pzt, bugün, dolu" etiketi; bugünün halkası ve dolu/boş farkı renksiz.
- Ayarlar 2.0'da çipler sarılıyor, hedefler 48dp üstünde.
- Kart PNG'si 2.0'da sabit (tasarım gereği), Kapat/Paylaş ölçekli.
- Üst güvenli alan (`useTopInset`) Bugün/Hafta/Ayarlar/Pazar ekranında uygulanmış.

## Devir
- mobile-engineer: A11Y-01..08, 10, 11, 13, 15.
- visual-designer: 05, 16. copywriter: 10, 15.
- test-automation-engineer: 01 (üst kontrol bounds testi), 02/03/08 (≥48dp ve etiket testi), 05 (kontrast oranı), 04 (reduce-motion mock).

## Doğrulanamayanlar
TalkBack'in gerçek konuşma çıktısı (yalnız a11y ağacı okundu), Türkçe yerel, `canAskAgain:false` durumu. Bulgu düzeltmeleri henüz uygulanmadı; uygulandığında emülatörde yeniden ölçülmeli.

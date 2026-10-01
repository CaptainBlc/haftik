# Emülatör UX incelemesi (Pixel 7, Android 15, debug build)

Tarih: 2026-09-24. Kapsam: 3 ekran görüntüsü (1 Bugün, 2 Hafta, 3 Ayarlar). Salt okunur inceleme; kod değiştirilmedi.
Kaynaklar: `docs/ux/ekran-akisi.md`, `spec.md` "Tasarım ilkeleri", ilgili `src/components/*`, `src/lib/week-status-copy.ts`, `src/app/(main)/settings.tsx`.

Sınırlar: koyu mod ve büyük yazı tipi görüntülerde yok; bunlar kod okumasından çıkarımdır, doğrulanmadı. Renk değerleri `src/constants/theme.ts`'ten (açık: `backgroundElement #F0F0F3`, `backgroundSelected #E0E1E6`, `textSecondary #60646C`).

Not (dev derlemesi): Sağ alttaki yüzen saat düğmesi (`src/dev/dev-time-menu.tsx`, `right:16 bottom:16`) sekme çubuğundaki "Ayarlar" etiketi/ikonunu örtüyor (3 görüntüde de). Üretimde yok, sorun sayılmadı. Ancak bu yüzden Ayarlar sekmesinin dokunma hedefi ve etiketi emülatörde gerçekte test edilemiyor; sekme çubuğu testinde düğme geçici olarak kaydırılmalı ya da fab `bottom` değeri sekme çubuğu yüksekliğinin (~80) üstüne alınmalı.

## Bulgular

### B1. Hiçbir seçim yokken 12 emoji birden soluk (opaklık 0.5) görünüyor — Önemli
- Görüntü 1: Tüm kutular gri zemin + soluk emoji. Ekran "pasif/yüklenmemiş" gibi okunuyor; ilk 3 saniyede "buraya dokun" sinyali yok. Sosyal satırındaki 👤 👥 silüetleri mavi-gri, soluk halde neredeyse ikon-yer tutucu gibi.
- Çelişki: `ekran-akisi.md` Ekran 2: "Seçili emoji: kalın çerçeve + hafif dolgu; **diğer ikisi** soluk". Yani soluklaştırma bir seçim yapıldıktan sonra kardeşlere uygulanmalı. Kod ise `!selected` her zaman soluklaştırıyor.
- Öneri: `category-picker.tsx`: `emojiDim` yalnızca `selection[category] != null && !selected` iken uygulansın. Seçim yokken tam opaklık. Seçili durum: çerçeve (`theme.text`, 2px) zaten güçlü; fark `backgroundSelected` (#E0E1E6) ile `#F0F0F3` arasında çok küçük olduğundan ayırt etmeyi çerçeve taşıyor. Dolguya ek olarak seçili kutuda çerçeve kalınlığını koru (iyi), istenirse küçük bir onay işareti eklenebilir (renk körlüğü/çok açık ekran için).

### B2. Emojilerin seviyesi (az/orta/çok) etiketsiz; erişilebilirlik adı yok — Önemli
- Görüntü 1: Her satırda 3 emoji var, hangisinin "düşük/orta/yüksek" olduğu yalnızca emojinin sezgisinden çıkıyor. 😪/😌/😴 ve 👤/👥/🎉 sırası açık değil; 🐢→🚶→🏃 ve 🐷→💳→💸 daha okunur. Ayrıca 28px emoji ~115dp kutunun içinde küçük kalıyor (boş kutu alanı çok).
- Erişilebilirlik: `Pressable`lara `accessibilityLabel` verilmemiş; TalkBack yalnızca emoji adını okur ("kaplumbağa"), kategori ve seviye söylenmez. `accessibilityState.selected` var (iyi).
- Öneri: `category-picker.tsx`: `accessibilityLabel={`${CATEGORY_LABELS_TR[category]}: ${seviyeAdi}`}` (seviye adları `constants/emoji.ts`'e sabit eklenir; ör. "sakin / orta / hareketli"). Görsel olarak seçili emojinin altına ya da satır etiketinin yanına seçili seviyenin kısa adı gösterilebilir ("Hareket · orta"), ton esprili kalabilir. Emoji boyutunu 28 → ~36-40 yap (kutu 115dp).
- Not: Bu, `emoji-seti.md` anlam eşlemesiyle birlikte S10/S12 cila kararına girer; yeni bir özellik değil, mevcut ekranın okunabilirliği.

### B3. "Kaydet" pasifken nedeni söylenmiyor — Önemli
- Görüntü 1: Gri, düz pasif buton. Kullanıcı 4 kategorinin de gerektiğini bilmiyor olabilir; ilk açılışta "neden basılmıyor" sürtünmesi (8 sn hedefi).
- `ekran-akisi.md`: "Kaydet dördü de seçilene kadar devre dışı — UI kuralı buton durumuyla önceden gösterir". Yalnızca gri renk bu kuralı anlatmaya yetmiyor.
- Öneri: `checkin-form.tsx`: butonun üstüne/etiketine dinamik ipucu: seçim yokken "Dört kategoriyi de seç", 2/4 iken "2 kategori kaldı"; tamamlanınca "Kaydet". Ya da buton etiketi "Kaydet (2/4)". Eksik kategori etiketlerini ayrıca vurgulamaya gerek yok (kısmi kayıt yok kuralı zaten butonda).
- Tam ekran yüksekliği ~915 dp'de ScrollView'e gerek kalmadan sığıyor; ama küçük ekranda (5" / 640dp) kaydırma gerekecek ve Kaydet ScrollView dışında sabit olduğu için doğru (iyi). Yine de büyük yazı tipinde ızgara + sabit buton yüksekliği taşabilir (bkz. B10).

### B4. Başlıktaki `<` hem çok küçük hem etiketsiz; "geri" gibi okunuyor — Önemli
- Görüntü 1: Küçük (~10dp) `<`, başlığın soluna yapışık, sekme kökünde "geri" gibi görünüyor. Aslında "dün"e geçiş (`ekran-akisi.md`: "`<` ile bugün/dün arası"). Dünü düzenleme özelliği ekranda keşfedilemiyor.
- Dokunma hedefi: `navButton` `padding: 8, minWidth: 32` + tek karakter, yükseklik ~40dp, genişlik ~32dp; 48x48dp altında. `accessibilityLabel` yok (TalkBack "küçüktür işareti" der).
- Öneri: `checkin-form.tsx`: `<`/`>`'yi ikon/`‹ Dün` şeklinde kısa etiketle değiştir; `minWidth:48, minHeight:48`, `hitSlop`; `accessibilityLabel="Önceki gün (dün)"` / `"Bugüne dön"`. Başlığa görünür bağlam ekle: bugünkü tarihte "Bugün · 24 Eylül, Perşembe", dünkü tarihte "Dün · 23 Eylül, Çarşamba" (yanlış güne kayıt riskini de düşürür; dün ile bugün arasında görsel ayrım şu an yalnızca tarih metni).
- Başlık `subtitle` boyutunda ve 3 sütunlu satırda sığıyor; "30 Eylül, Çarşamba" en uzun durum, büyük yazı tipinde iki satıra sarmalı (numberOfLines belirtilmemiş, sorun değil ama yükseklik oynar).

### B5. Hafta ekranında "Kartın için 3 gün daha lazım." iki kez — Önemli
- Görüntü 2: Noktaların altında ve kilitli kutunun altında birebir aynı cümle (`weekStatusHeadline` ve `lockedBoxCaption`, `src/lib/week-status-copy.ts` ikisi de aynı dizgeyi döndürüyor).
- Belge: `ekran-akisi.md` Ekran 3 tekrarı bilerek istiyor ("üstteki metinle aynı, tekrar burada da gösterilir"), yani kod belgeye uyuyor; ama pratikte gereksiz ve gürültülü, "yer tutucu" hissini zayıflatıyor. Belge güncellemesi gerekir (plan sapması olarak `plan.md`/`ekran-akisi.md` aynı commit'te).
- Öneri (tercih sırası): (a) Kutu altı başlığı yerine ilerlemeyi anlatan tek farklı satır: "3 gün daha, sonra kartın açılır" ya da ton uygun esprili "Kartın seni bekliyor. 3 gün daha." üstte, altta ise "Pazar 20:00'de açılır" (sabit, zaman bilgisi). (b) Alt satırı kaldır, kilit kutusuna `accessibilityLabel` olarak metin kalsın. Üst metin `weekStatusHeadline`, alt `lockedBoxCaption` olarak ayrışsın. Testler `week-status-copy` metin beklediği için test güncellemesi ayrı görev.

### B6. Kilit ikonu iskeletle örtüşüyor ve ortada değil hissi veriyor — Düşük
- Görüntü 2: 🔒 kartın geometrik ortasında (y≈372) ama iskeletteki özet pill'i (y≈355) ile üst üste biniyor; ikonun üst kısmı pill'e değiyor. Kutunun alt ~%35'i boş gri; iskelet üst yarıya sıkışık, yer tutucu "yarım" görünüyor (gerçek kart 9:16'da unvan üstte, 4 satır, özet, damga; iskelette damga bloğu yok).
- Emoji kilit sistem fontunda 🔒 sarı/altın ve gri kartla renk uyumsuz; `ekran-akisi.md` "sabit bir vektör ikon kullanılabilir" diyor.
- Öneri: `locked-card-placeholder.tsx`: iskeleti dikey dağıt (satırlar arası boşluk artır ya da `justifyContent: 'space-between'`, alt kısma damga bloğu ekle) ve kilidi bir daire zemin içinde (beyaz %80, 56dp) iskeletin üstünde ortala; böylece pill ile çakışma "bilinçli katman" gibi görünür. Emoji yerine vektör ikon (`@expo/vector-icons` zaten expo ile gelir, kontrol et) tercih et.

### B7. Bugünün nokta göstergesi (kesikli çember) zor seçiliyor ve dolu-gün ile çakışıyor — Önemli
- Görüntü 2: "Per" 24 Eylül bugün, boş kesikli çember; 20dp çapta, 1.5px kesikli kenar, diğer boş noktalardan neredeyse ayırt edilemiyor. Gün etiketi "Per" vurgulanmıyor. (Pzt-Çar 3 gün boş: kullanıcı dünkü günleri doldurmamış; emülatör ilk kullanım, beklenen.)
- Kod: `week-dots-row.tsx` `today` yalnızca `borderStyle: 'dashed'`; nokta dolu (`filled`) ise dolu koyu daire kesikliliği görünmez, yani bugün dolduysa bugün işareti kaybolur. Etiket: "Pzt/Sal/…" `type="small"` boyutunda, ~12sp.
- Öneri: bugünü kesikliye ek olarak gün etiketini kalın yap (`smallBold`) ve noktanın altına küçük bir işaret/halka (`outline` 2px ekstra dış çember); dolu+bugün için dolu daire çevresinde dış halka. `accessibilityLabel` ver: "Perşembe, bugün, dolu değil". Noktaları 24-28dp yap; şimdi 7 nokta arası boşluk geniş, yer var. Dokunma hedefi gerekmiyor (dokunulmuyor).
- Ayrıca: geçmiş boş günler ile gelecek günler aynı boş çember; geçmiş kaçırılmış günlerin "dolabilir" (dün) ayrımı yok. Şimdilik kabul edilebilir (kapsam: geçmiş galeri yok).

### B8. Ayarlar: anahtar açıkken "Bildirim izni kapalı" — çelişki — Blokör (kullanıcı güvenini bozan, çalışmayan bir özelliği "açık" gösteriyor)
- Görüntü 3: "Günlük hatırlatma" anahtarı AÇIK (yeşil-teal), hemen altında "Bildirim izni kapalı. Hatırlatma ve kart bildirimi için sistem ayarlarından izin verebilirsin." Saat seçici de etkin görünüyor. Yani UI "hatırlatma açık, saat 21:00" diyor ama hiçbir bildirim gelmeyecek. Kart bildirimi (wow anının tetikleyicisi) de gelmez → v1'in merkez akışı sessizce kırılıyor.
- Kod nedeni: `settings.tsx` izni yalnızca mount'ta okuyor (`getNotificationPermission().then(setPermission)`), kullanıcı sistem ayarlarından izin verip dönünce güncellenmez; anahtar ise `settings.reminderEnabled` (kullanıcı tercihi) ile bağlı, izinden bağımsız. Android 13+ (Pixel 7 / Android 15) ilk kez `POST_NOTIFICATIONS` diyaloğunu reddetmiş ya da onboarding'de "Şimdi değil" denmiş olabilir; emülatörde bu durum mümkün.
- Öneri:
  1. `settings-view.tsx`: `notificationPermission === 'denied'` iken anahtarın etkin görünen değeri `reminderEnabled && permission === 'granted'`; yani izin yokken anahtar KAPALI görünsün (ya da anahtar yerine durum: "Kapalı, izin gerekli"). Saat çipleri zaten `!reminderEnabled` ile pasifleşiyor, aynı koşula bağla.
  2. Uyarı metnini eyleme dönüştür: metnin yanına "Ayarları aç" düğmesi (`Linking.openSettings()`), metin: "Bildirim izni kapalı, hatırlatma çalışmaz." Kullanıcıya "verebilirsin" yerine net sonuç ve tek dokunuşla çözüm.
  3. `settings.tsx`: `AppState` `active` olayında (ya da `useFocusEffect`) izni yeniden oku; anahtar açılınca izin istenip hâlâ `denied` ise anahtarı geri kapat.
  4. Ayrıca `denied` (kalıcı) ile `undetermined` (henüz sorulmadı) metni ayrışmalı; ikincisinde anahtar açılınca sistem diyaloğu zaten çıkar.
- Gerekçe: "Tanısız/tavsiyesiz ton" ile çelişmez, ama metin "verebilirsin" tavsiye tonunda ve çözümü kullanıcıya yıkıyor.

### B9. Saat seçicide seçili durum neredeyse görünmez — Önemli
- Görüntü 3: 21:00 çipi hafifçe daha koyu (#E0E1E6 vs #F0F0F3), yaklaşık 1.1:1 kontrast farkı, çerçeve/kalın yazı/işaret yok; renk farkı düşük ışıkta ya da yanlış renk profilinde kaybolur. `accessibilityState.selected` var ama görsel eşleniği zayıf.
- Bugün ekranındaki emoji seçimi çerçeve kullanıyor; iki ekran arasında tutarsız seçili dili.
- Öneri: `settings-view.tsx`: seçili çipe `borderWidth: 2, borderColor: theme.text` (Bugün ekranıyla aynı) + `smallBold` yazı; seçili olmayanlar 2px şeffaf çerçeve (yerleşim kaymasın). Dokunma yüksekliği: çip `paddingVertical: 8` + 16sp yazı ≈ 40dp; `minHeight: 48` ver. 4 çip 360dp genişlikte sığıyor; büyük yazıda 4'lü satır taşabilir, `flexWrap: 'wrap'` ekle.
- Ayrıca saat seçenekleri (20-23) yalnızca akşam; kullanıcı 19:00 veya 08:00 isterse yok; bu kapsam kararı, sorun değil.

### B10. Dokunma hedefleri ve büyük yazı tipi riski — Önemli
- Anahtar (`Switch`) satırı yatay `Spacing.four` içinde ~48dp; sorun yok. Alt sekmeler standart (≥48dp), iyi.
- Küçük hedefler: Bugün `<`/`>` (B4), saat çipleri ~40dp (B9), "Gizlilik politikası" satırı `paddingVertical:8` + 16sp ≈ 40dp, "Deneme raporunu paylaş" çipi ~40dp (görüntüde ~40dp, tam genişlik olduğundan yatayda sorun yok). Hepsine `minHeight: 48`.
- Büyük yazı (fontScale 1.3-2.0, doğrulanmadı): (1) Bugün başlığı `subtitle` 32sp iki satıra sarar, `<`/`>` ile hizalama bozulur. (2) Saat çipleri 4'lü tek satır taşar (B9). (3) Hafta noktaları etiketleri (Pzt…Paz, ~12sp) 7 sütunda 360dp/7 ≈ 50dp genişlikte "Pzt" 2x'te taşmaya yakın. (4) Kilitli kart iskeleti sabit 200x356 (`PLACEHOLDER_*`): yazı büyüyünce alt metin ve sekme çubuğu arası daralır; ekran `ScrollView` değil (`week-status-view.tsx` `ThemedView`), küçük ekran + büyük yazıda taşma/kesilme riski. Ayarlar da `ScrollView` değil; "Tüm verilerimi sil" `marginTop:'auto'` ile en alta itiliyor, büyük yazıda içerik yığılırsa buton ekran dışına çıkar.
- Öneri: `week-status-view.tsx` ve `settings-view.tsx` içeriğini `ScrollView`'a al (`contentContainerStyle: { flexGrow: 1 }`; `marginTop:'auto'` çalışmaya devam eder). Ayrıca `PLACEHOLDER_WIDTH`/HEIGHT yüksekliğini `useWindowDimensions` ile sınırla (`min(356, ekranYüksekliği*0.4)`).

### B11. Boş alan kullanımı: Hafta ve Ayarlar ekranlarında büyük boş orta bölge — Düşük
- Görüntü 2: Kartın altında ~270dp boş; içerik üst yarıda toplanmış. Görüntü 3: Gizlilik satırı ile Sil düğmesi arasında ~300dp boşluk. Bugün ekranında ise Sosyal satırı ile Kaydet arasında ~50dp boşluk (kabul edilebilir, yalnızca 915dp yüksek ekranda).
- Hafta ekranı için: v1 wow anı kartın açılışı; kilitli kart sayfanın odağı olmalı. Kart 200dp genişlikte 406dp ekranın yarısı; ortalanıp büyütülebilir (genişlik = ekranın %60'ı, 9:16 oranı korunarak) ya da dikey ortalanır. Bu, B10 ile birlikte responsive boyut kararıdır.
- Ayarlar: Sil düğmesini alta itmek bilinçli (yanlış dokunmayı azaltır, iyi); ama bölümlere (Hatırlatma / Veri / Hakkında) küçük başlıklar koyup görsel gruplama yapmak boşluğu anlamlı kılar. Önceliği düşük.

### B12. Ayarlar metinleri ve ton — Düşük
- Görüntü 3: "Gizlilik politikası (yakında)" gri, düz metin; bağlantıya benzemiyor, dokununca Alert "Bağlantı S12'de eklenecek." (`settings.tsx` satır 85) çıkıyor. Dahili plan dilimi kodunu ("S12") kullanıcıya gösteriyor, "yakında" da dürüst ama Google Play kapalı testi için politika URL'si zorunlu (bkz. CLAUDE.md S12 kararları). Öneri: Alert metnini "Gizlilik politikası yayına yakın eklenecek." ya da benzeri kullanıcı dilinde yaz; sürüm öncesi bağlantı şart (K10 kapısı).
- "Deneme raporunu paylaş" düğmesi son kullanıcıya kapalı testte anlamlı, ama üretim (herkese açık) sürümde geliştirici/arkadaş-deneme özelliği olarak kalırsa kafa karıştırır; ürün kararı: yalnızca kapalı test/preview APK'da göster. Açıklama metni "Yalnızca sayaçlar içerir (kart metni, tarih ve kimlik yok)" iyi, dürüst ve tanısız; korunmalı ("anonim" denmemesi doğru, bkz. CLAUDE.md I-3).
- Başlık dili tutarlı (sen dili, kısa). Ton esprili değil, düz-nötr: check-in ekranında esprili dil beklenmiyor (esprili ton kart içeriğine ait), sorun sayılmaz. Ancak Hafta ekranının "Kartın için 3 gün daha lazım." metni "lazım" ile emir/gereklilik tonunda; "Kartın için 3 gün daha var" (B5 önerisiyle birlikte) daha sıcak olur.

### B13. Tab çubuğu: emoji ikonlar + küçük etiketler, inaktif etiket kontrastı — Düşük
- Görüntü 1-3: Etiketler ~10-11sp, inaktif etiket gri (#8E8E93 benzeri) beyaz zeminde ≈3:1 (AA normal metin 4.5:1'in altında). İkonlar sistem emoji fontuyla (📝 📊 ⚙️) renkli; aktif/inaktif ayrımı (tint) emojide uygulanmıyor, yalnızca etiket rengi değişiyor ("Bugün" mavi). Aktif sekme rengi (iOS mavisi `#3C87F7` benzeri) ile Switch teal/yeşil ve silme kırmızısı üç ayrı vurgu rengi; tek bir marka rengi yok.
- Öneri: `(main)/_layout.tsx` `tabBarInactiveTintColor: theme.textSecondary` (#60646C, ≈5.7:1) ve marka vurgu rengi tek olsun (`Switch` `trackColor`/`thumbColor` ile aynı); ikonlar vektör ikon setine geçirilirse tint uygulanır (S10 cila). Öncelik düşük.

### B14. Koyu mod (kodda incelendi, görüntüde yok) — Önemli (doğrulanmadı)
- `locked-card-placeholder.tsx`: `#D1D1D6` zemin ve `#8E8E93` iskelet renkleri sabit, tema dışı; koyu modda siyah ekranda parlak açık-gri kutu olur (göz yorar, "wow" öncesi beklenti hissini bozar) ama okunaklı. Aynı dosyada kilit ikonu arka planı `#00000033`. `settings-view.tsx` silme düğmesi `#D7263D22`/`#D7263D`: koyu zeminde kırmızı yazı kontrastı ~3.9:1 (AA altı) olabilir. `week-dots-row.tsx` `theme.text` kullanıyor, koyu modda otomatik uyumlu (iyi). Emoji opaklık 0.5 koyu zeminde ek soluk olur (B1 ile birlikte ele alınmalı).
- Öneri: iskelet renklerini `theme` üzerinden (`backgroundElement`/`backgroundSelected`/`textSecondary`) türet; koyu modda silme etiketi için `#FF6B7D` gibi açık ton. Emülatörde `adb shell cmd uimode night yes` ile üç ekran yeniden görüntülenmeli.

## İyi çalışanlar

1. **Bugün ekranının yapısı 8 sn hedefine uygun:** 4 kategori x 3 seçenek, tek ekran, kaydırmasız (915dp'de), tek birincil eylem, kategori sırası belgeyle birebir; Kaydet dört seçim tamamlanmadan kapalı olduğundan kısmi kayıt kuralı arayüzle güvence altında.
2. **Hafta noktaları ve kilitli kart iskeleti ilkeyi koruyor:** gerçek metin/emoji hiç çizilmiyor (yalnızca gri bloklar), noktalar tek bakışta ilerleme veriyor, gizlilik/wow anı mimarisi (spec güvenlik: "yer tutucu içerikle") ekranda da görünür biçimde uygulanmış.
3. **Ayarlar sade ve dürüst:** deneme raporu açıklaması "kendiliğinden hiçbir yere gönderilmez" ile veriyi netçe anlatıyor; "Tüm verilerimi sil" kırmızı, ayrı ve en altta (yanlış dokunmaya karşı mesafeli), silme için onay Alert'i var.
4. **Seçili emoji için çerçeve dili ve `accessibilityState.selected`:** görsel farkın ana taşıyıcısı 2px koyu çerçeve, renk tek başına taşımıyor (renk körlüğü dostu); benzer desen saat çiplerinde de uygulanırsa (B9) tutarlı olur. Türkçe karakterler (Ş, ğ, ç, İ) doğru ve net render ediliyor, tarih biçimi doğal ("24 Eylül, Perşembe").

## Özet öncelik listesi

| # | Bulgu | Önem |
|---|---|---|
| B8 | Anahtar açık ama bildirim izni kapalı; çözüm düğmesi yok, izin yeniden okunmuyor | Blokör |
| B1 | Seçim yokken tüm emojiler soluk (belgeye aykırı) | Önemli |
| B2 | Seviye etiketi/erişilebilirlik adı yok, emoji küçük | Önemli |
| B3 | Kaydet neden pasif söylenmiyor | Önemli |
| B4 | `<` küçük, etiketsiz, "geri" gibi; dün/bugün belirsiz | Önemli |
| B5 | Aynı cümle iki kez (Hafta) | Önemli |
| B7 | Bugün noktası ayırt edilemiyor; dolu olunca kayboluyor | Önemli |
| B9 | Saat çipi seçili durumu çok zayıf | Önemli |
| B10 | Hedef <48dp, ScrollView yok, büyük yazı riski | Önemli |
| B14 | Koyu mod sabit renkler (doğrulanmadı) | Önemli |
| B6, B11, B12, B13 | Kilit örtüşmesi, boş alan, "S12" metni, tab kontrastı | Düşük |

Önerilen sıra: B8 (güven/wow akışı), B1+B3+B4 (check-in ilk izlenim, tek dosya grubu: `category-picker.tsx`, `checkin-form.tsx`), B5+B7 (hafta), B9+B10 (ayarlar/genel), sonra koyu mod ve cila. Ekran görüntüsü: koyu mod, fontScale 1.5 ve izin verilmiş durum için ikinci tur çekilmeli. Bu değişiklikler plan sapması sayılırsa `plan.md`/`docs/ux/ekran-akisi.md` aynı commit'te güncellenmeli.

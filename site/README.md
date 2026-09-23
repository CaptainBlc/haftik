# site/ (Haftik statik sayfaları)

**TASLAK — K10 (KVKK/hukuki görüş) kapısı açılmadan yayınlanmaz. Hukuki görüş değildir.**

Dosyalar: `index.html` (tanıtım + mağaza düğmeleri), `gizlilik.html` (gizlilik/aydınlatma),
`404.html`, `style.css`. Dış font/CDN/script, çerez ve izleyici yok. Uygulama kodundan
bağımsızdır; eslint/tsc/jest bu klasörü taramaz (içinde `.ts`/`.js` dosyası yok; eklenmemeli).

## Yer tutucular (yayından önce doldurulur)

- `[iletişim e-postası]` (Batuhan'ın kişisel adresi yazılmadı)
- `[mağaza bağlantısı]` (Google Play ve App Store; `index.html`)
- `[tarih]` (yürürlük tarihi; `gizlilik.html`)
- `[sorumlu kişi/unvan]` (KVKK veri sorumlusu bilgisi Batuhan/hukuk tarafından tamamlanacak)
- iOS yedekleme cümlesi: iOS kararı (K7 iOS yarısı, S11) kesinleşince güncellenir.
- Yayından önce `<meta name="robots" content="noindex">` ve dosya başı TASLAK yorumları/uyarı kutuları kaldırılır.

## Yayınlama (hesap gerektiren adımları Batuhan yapar)

1. GitHub Pages: depoyu (ya da yalnızca `site/`'ı içeren ayrı bir depoyu) GitHub'a it; Settings > Pages'te kaynağı seç.
2. `site/` alt klasör olarak yayınlanamaz (yalnızca kök ya da `/docs`); bu yüzden `site/` içeriğini ayrı bir depoya ya da `gh-pages` dalına koy.
3. Cloudflare Pages: Workers & Pages > Create > Pages > depoyu bağla; build komutu boş, çıktı dizini `site`.
4. Özel alan adı (K5) her iki serviste de panelden bağlanır; HTTPS otomatik açılır.
5. Kök dışı yolda (`kullanici.github.io/depo/`) yayınlanırsa `404.html`'deki `/style.css` ve `/` bağlantıları göreli yapılmalı.
6. Yayın sonrası gizlilik URL'sini Play Console / App Store Connect formlarına ve uygulama Ayarlar bağlantısına gir.
7. Cihazda ağ izleme (G-01/G-02) ve iOS yedek (S11) doğrulanmadan politikadaki ilgili cümleler "kesin" sayılmaz.

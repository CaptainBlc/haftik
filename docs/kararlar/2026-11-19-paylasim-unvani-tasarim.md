# 2026-11-19 — Paylaşım unvanı: tasarım kararları ve çıkarım analizi (S21 girdi kapısı)

Onaylayan: Batuhan (oturum seçimleri, 2026-11-19). Önceki kayıt: B1 (`2026-10-01-cekirdekten-once-kararlar.md`):
"paylaşım unvanı evet; security-reviewer görüşü S21 başlamadan önce şart." Tasarım kaynağı:
`docs/inceleme-2026-09-25/21-mimari-ve-efor.md` §2a, S-2, S-3; `13-urun-vizyonu.md` Z18.

**Durum (2026-11-19):** tasarım kararları VERİLDİ (Karar 0-5, iki yeni metin onaylandı). Domain + veri katmanı
**kodlandı ve test edildi** (K2): `src/domain/share-title.ts`, migration v4, repo, `buildCard`. **UI bağlanmadı**
(S19/P0'a bağlı). Güvenlik kapısı (Karar 0) **yarım**: analiz adımı bu belgedir (K1 + K2); bağımsız inceleme adımı
(kod bitti, **henüz yapılmadı**) burada işaretlenecek. Bu belge bir security-reviewer görüşü DEĞİLDİR.

Kanıt (K2): `__tests__/domain/share-title.test.ts` (kurallar, 16 gizleme alt kümesi), `share-title.noninterference.test.ts`
(21.870 kart, uyku/harcama bu hafta + geçen hafta süpürülür; mutasyon kontrolüyle sızıntıyı yakaladığı gösterildi),
`__tests__/data/card-repo.share-title.test.ts` (round-trip, v3 → v4, kesintide ROLLBACK, bozuk kapsam). Varsayılan
gizlemede paylaşım unvanı 81/81 (bugünkü ana unvan %20).

## Karar 0 — Güvenlik kapısı nasıl karşılanır: B (analiz + bağımsız inceleme)
- Adım 1 (bu belge): tehdit modeli ve mevcut sızıntının ölçümü. **Tamam.**
- Adım 2: kod bitince temiz bağlamlı bağımsız inceleme (verifier / code-review). **Bekliyor.** Bulgu çıkarsa kapı
  açık sayılır; "açık Important = 0" S21 çıkış ölçütü olarak kalır (21 §S21).
- Elenenler: (A) yalnız analiz: bağımsız göz yok. (C) kapıyı kaldırmak: şartı atlamak.
- Sınır: gerçek bir güvenlik uzmanı değildir; K10 (hukuki görüş) gibi uzman gerektiren konular bununla kapanmaz.

## Karar 1 — Kapsam: hareket + sosyal
Paylaşım unvanı yalnızca `movement` ve `social` kategorilerinin seviyesine (ve ileride bu iki kategorinin
deltasına) bağlıdır. `SHARE_SCOPE = CATEGORIES − varsayılan gizli (sleep, spending)`. Fonksiyon girdisi tip gereği
uyku ve harcamayı **taşımaz** (yapısal girişim-sızmazlık, 21 §2a).
- Elenenler: yalnız hareket (3 durum, kanca zayıf); yalnız gün sayısı (sızıntı sıfır ama kimlik yok); kullanıcı
  seçsin (yeni UI, kapsam genişlemesi).
- Sonuç: varsayılan gizlemede okunur unvan oranı tasarım gereği %100 (bugün %20, aşağıda). Kullanıcı hareketi ya da
  sosyali gizlerse unvan yerine şerit çıkar (bu kullanıcının kendi seçimidir, sızıntı değildir).
- Mevcut metinle karşılanan: 9 seviye durumundan 7'si (hareket×sosyal: yüksek-yüksek, düşük-düşük, hareket yüksek/düşük
  + sosyal orta, sosyal yüksek/düşük + hareket orta, orta-orta). Karşılığı olmayan 2 durum: hareket yüksek + sosyal
  düşük ve tersi (K1, `titles.ts`/`content/tr.ts` okuması). İçerik kararı: Karar 3.

## Karar 2 — Görüntü kuralı: katı (S-2 a)
`resolveVisibleTitle(snapshot, hidden)` tek fonksiyondur, `CardView` ve önizleme aynısını çağırır:
1. `hidden` boşsa → asıl unvan.
2. `hidden` paylaşım unvanının kapsamıyla kesişmiyorsa → paylaşım unvanı.
3. Diğer her durumda (paylaşım unvanı yok/NULL dahil) → sansür şeridi; unvan metni render ağacına GİRMEZ.
Bir kategori bile gizliyken asıl unvan hiç gösterilmez. Eski kartlar (yeni sütun NULL) şerit gösterir, geriye
doldurma yapılmaz (S-3 a).
- Elenenler: (b) bugünkü `basedOnCategories` kuralı (ölçülen sızıntıyı sürdürür). (c) "güvenli unvan listesi":
  taramada sızıntısız görünen unvan yok, liste boş olur ve pratikte (a)'ya çöker.

## Ölçüm (K2): bugünkü kuralın sızıntısı
Yöntem: 81 seviye kombinasyonu × `selectTitle` (gerçek kural motoru) × varsayılan gizleme (uyku + harcama).
Bir görünen unvan, ön-görüntüsündeki (uyku, harcama) çiftlerinin 9'unun tamamını içermiyorsa gizli kategori
hakkında bilgi verir sayıldı. Varsayımlar: tüm deltalar 0, `checkinDays` 4 ve 7 (ikisinde de sonuç aynı). Delta ve
seri kuralları devreye girince oranlar küçük oynar; asıl kanıt non-interference testi olacak (aşağıda).

| Ölçü | Sonuç |
|---|---|
| Okunur unvan (varsayılan gizleme) | 16/81 = %20 (B1 belgesindeki ~%19 ile tutarlı) |
| Görünen benzersiz unvan | 7 |
| Bunlardan gizli kategori hakkında bilgi veren | 7 (16/16 kombinasyon) |

Örnekler (ön-görüntüdeki uyku/harcama çifti sayısı / 9): "Sosyal Kelebek" 1/9 (hareket, uyku, harcama hep orta);
"Sessize Alınmış Hafta" 1/9; "Ne Az Ne Çok Haftası" 1/9 (`basedOnCategories: []` olduğu için her zaman görünür);
"Koşu Bandı Kıskandı" 1/9; "Kanepe Filozofu" 2/9; "Koşan Sosyalite" ve "Kapıdan Az Çıkan Hafta" 4/9
(kural sırası: `movementSleepBothHigh` ve `movementSpendingBothHigh` bunlardan önce denendiği için uyku ve
harcama "yüksek" değildir).

## Tehdit modeli
- **Varlık:** gizlenen kategorilerin (varsayılan uyku + harcama) seviyesi.
- **Saldırgan:** paylaşılan PNG'yi gören alıcı; kural motorunu/öncelik sırasını bilen (kaynak kodu açıksa mümkün)
  ya da zamanla aynı kullanıcının birden çok kartını gören biri.
- **Kanallar:**
  1. Unvan metni (ölçüldü, yukarıda). Çözüm: Karar 1 + 2.
  2. Özet cümlesi: dört deltanın toplu kovasından (`classifySummaryBucket`) türüyor; metinler kategori-nötr ama
     "çoğu yükseldi" gibi toplu yön gizli kategorileri kısmen yansıtır. **BU KARARIN KAPSAMI DIŞINDA, AÇIK**
     (21 P-1, sonraki tur). Şu an "kabul edildi" DEĞİL, "karara bağlanmadı".
  3. Şeridin varlığı: hangi kategorilerin gizli olduğu zaten kullanıcının kendi eylemi; ek sızıntı sayılmaz.
  4. Satır sıralaması/sayısı: sabit, veri taşımaz (kontrol edilecek, test kapsamında).
  5. Zaman içinde tekrar: paylaşım unvanı yalnızca hareket+sosyal'e bağlı olduğundan, bir kullanıcının kartları
     uyku/harcama hakkında yeni bilgi vermez (non-interference'ın doğrudan sonucu).
- **Yan etki:** `scope` kartla birlikte dondurulur; ileride varsayılan gizleme değişirse eski kartlar kendi
  kapsamlarıyla doğru çizilir.

## Zorunlu kanıtlar (S21 çıkış ölçütü)
- Non-interference özellik testi: hareket+sosyal sabitken uyku ve harcama (81 kombinasyon × gün sayısı × delta)
  değişse de paylaşım unvanı DEĞİŞMEZ.
- `resolveVisibleTitle`: 16 gizleme alt kümesinin hepsinde yukarıdaki üç kural sağlanır.
- Sayım: varsayılan gizlemede okunur unvan %100 (bugün %20).
- v3 → v4 yükseltme (fikstürden round-trip), kesintide ROLLBACK, `delete-all` sonrası kalıntı yok.
- Bağımsız inceleme (Karar 0, adım 2): açık Important = 0.

## Planlanan etki (henüz yazılmadı)
`src/domain/share-title.ts` (yeni, saf; unvan + özet seçicileri), `src/domain/types.ts` (`CardSnapshot.shareTitle`), `src/domain/buildCard.ts`,
`src/domain/content/tr.ts` (`CONTENT_VERSION`), `src/data/migrations.ts` (v4: `share_title_id/text/scope` + `share_summary_id/text`, hepsi
NULL olabilir), `src/data/card-repo.ts`, `src/card/title-visibility.ts` (→ `resolveVisibleTitle`),
`spec.md` veri modeli (sütun tablosu, P-8), `plan.md` (sapma), `docs/muhendislik/kart-render.md`
("Unvan otomatik gizleme" notu). Yeni tablo yok, `delete-all` listesi değişmez (sütunlar `weekly_card`'da).

## Karar 3 — İçerik: mevcut metin + 2 boşluk metni (B)
Yeni metin yalnızca iki boşluk durumu için: hareket yüksek + sosyal düşük, hareket düşük + sosyal yüksek. İki metin
**kullanıcı onayından geçer** (S16a deseni) ve `content-lint` kurallarına uyar (unvan <= 28 karakter, rakamsız, yasak
kök yok, imge kotaları). Mekanizma havuzu DİZİ olarak tutar: sonradan alternatif eklemek yalnızca içerik değişikliğidir
(`CONTENT_VERSION` artar, dondurulmuş kartlara dokunmaz). Elenenler: A (0 metin, boşlukta yanlış okunan unvan),
C (+9 alternatif, onay yükü, tekrarın gerçek sorun olup olmadığı E1 verisiyle belli olur), D (tam `share.*` havuzu).

## Karar 4 — Çeşitlilik: kapsam-içi delta + gün sayısı, katmanlı kural (c)
Tam matris (~81 hücre) her hücre için metin gerektireceğinden Karar 3 ile çelişirdi; çözüm, ana unvandaki gibi
**öncelik sıralı katmanlı kural** ve kategori-bağımsız mevcut metinlerin yeniden kullanımı. Her kural yalnızca
hareket+sosyal seviyesine/deltasına ve gün sayısına bakar (uyku/harcamayı tip gereği göremez):

| Öncelik | Kural | Metin |
|---|---|---|
| 1 | 7/7 gün ve hareket+sosyal ikisi de yüksek | Hiç Boş Bırakmayan Hafta |
| 2 | 7/7 gün ve ikisi de düşük | Yavaş Çekimde Bir Hafta |
| 3 | 3 gün ve ikisi de yüksek | İlk Haftadan Sahnede |
| 4 | ikisi de yükseldi | Geçen Haftayı Sollayan |
| 5 | ikisi de geriledi | Yavaşlayan Hafta |
| 6 | 9 seviye durumu (taban) | 7 mevcut + 2 yeni (Karar 3) |

Eşleşen kurallar arasından "geçen haftakinden farklı olan ilk eşleşen" seçilir (`prevShareTitleId`), bu da alternatif
metin yazmadan haftalar arası çeşitlilik sağlar. Dikkat: ana unvanda "dört kategoriden >= 3" aranırken burada "iki
kategorinin ikisi" aranır; bu kurallar daha sık tetiklenir (sıklık ölçülmedi, K0). Beş kuralın hepsi dahil edildi;
"Yavaşlayan Hafta"nın paylaşım kancası olarak zayıf olabileceği ve "yargısız dil" ilkesiyle gerilimli olduğu bilinerek
(öneri 4 kuraldı, Batuhan 5'i seçti). E1 verisiyle gözden geçirilir.

## Karar 5 — Özet cümlesi sızıntısı (P-1): kapsamlı paylaşım özeti (S2)
Ölçüm (K2, 81 delta kombinasyonu × `classifySummaryBucket`, gizli = uyku + harcama):

| Kova | Kombinasyon | (uyku, harcama) çifti | Anlamı |
|---|---|---|---|
| allStable | 1 | 1/9 | dört kategori sabit: uyku ve harcamanın sabit olduğu KESİN |
| risingMajority | 31 | 8/9 | yalnızca "ikisi birden düştü" dışlanır |
| fallingMajority | 31 | 8/9 | yalnızca "ikisi birden yükseldi" dışlanır |
| balancedMixed | 18 | 9/9 | sızıntı yok |

Karar: unvanla aynı tasarım. Kart üretilirken hareket+sosyal deltalarından ikinci bir özet (`share_summary_*`)
dondurulur; `resolveVisibleSummary(snapshot, hidden)` aynı üç kuralı izler (hiçbiri gizli değilse asıl özet; gizli
kapsamla kesişmiyorsa paylaşım özeti; aksi halde ya da NULL ise değişim satırı gizli). **Yeni metin yok:** mevcut
dört kovanın (allStable, risingMajority, fallingMajority, balancedMixed) metinleri iki kategori üzerinden yeniden
kullanılır; `firstCard` aynen. Elenenler: S1 (oldugu gibi, `allStable` kesin sızıntı, spec'ten bilinçli sapma
kaydı gerekirdi), S3 (gizlemede sabit nötr cümle, paylaşılan kartlarda "geçen haftaya göre" vaadi kaybolur).
Şema: v4'e iki ek nullable sütun (`share_summary_id`, `share_summary_text`); kapsam sütunu (`share_title_scope`)
ikisi için ortaktır.

## Sonraki turlara bırakılan
1. ~~İki yeni boşluk metni için kullanıcı onayı~~ — onaylandı: "Kulaklıkla Koşan Hafta", "Az Adım, Çok Muhabbet".
2. UI (paylaşım seçici, şerit, önizleme = ölçeklenmiş `CardView`): S19 `CardView` v2'ye, yani P0 ve F0-9'a bağlı.
3. Bağımsız inceleme (Karar 0, adım 2): kod bittikten sonra.

## Geri alma maliyeti
Düşük. v4 yalnızca nullable `ADD COLUMN`, veri kaybı yok; eski kod yeni sütunları yok sayar. B1'e göre ürün
tarafında geri alma zararlıdır (kanca kaybolur), P0 sonucu bunu değiştirmez.

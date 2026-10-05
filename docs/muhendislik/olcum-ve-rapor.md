# Ölçüm, deneme raporu v2 ve birleştirme

> Kaynak tasarım: `docs/inceleme-2026-09-25/27-olcum-v2.md` (§2.3 olay şeması, §2.4 gizlilik sözü, §4 rapor ve birleştirme).
> Bu belge kodun BUGÜNKÜ durumunu anlatır; tasarımdan sapmalar açıkça yazılı.

## Ne ölçülüyor (hepsi cihazda, ağ yok)

| Depo | Ne | Nerede yazılır |
|---|---|---|
| `metric_event` (v1, eski) | `check_in_saved`, `card_unlocked`, `card_opened`, `share_initiated`, `line_hidden` (ad + hafta + zaman) | `src/metrics/track.ts` `trackEvent`/`trackEventOnce` |
| `metric_counter` (v3) | Ad + hafta + `dim` + `build` + `n` (UPSERT). CHECK yok, kapalı sözlük TS'te: `src/metrics/events.ts` `COUNTER_DIMS` | `trackCounter` |

`metric_counter` sayaçları (rapor v2 genişletmesi, 2026-10-05):

| Sayaç | `dim` | Ne zaman |
|---|---|---|
| `share_hidden_n` | `0`..`4` | Her paylaşım için BİR kez: kaç satır gizli paylaşıldı (`trackShareInitiated`) |
| `share_default_kept` | `y`, `n` | Her paylaşım için BİR kez: gizleme varsayılan (uyku + harcama) kaldı mı (`isDefaultHiddenSet`) |
| `notif_opened` | `card_ready`, `daily` | Bildirime dokunarak açılışta, soğuk ve sıcak (`useNotificationRouting`; yalnız izin listesindeki tür) |

`line_hidden` ve `share_initiated` eski tabloda yazılmaya DEVAM eder (geriye dönük uyum, `share.hiddenTotal`).
`build` boyutu şimdilik boş yazılır (rapor `build`'i raporun kendisindedir; bütünlük kuralı karışık sürümü yakalar).
Hepsi `delete-all.ts` ile silinir (`metric_counter` zaten listede). Hiçbiri kategori, seviye, emoji, tarih ya da kimlik taşımaz.

## Rapor v2 alanları

`src/domain/report-v2.ts` (saf, parametreli), `src/metrics/report.ts` (okuma + metin). Kullanıcı tetikli, tam metin önizlemeli,
otomatik gönderim yok. Alan listesi ve açıklamaları `report-v2.ts` başlığında. Bu genişletmeyle gelenler hep **isteğe bağlı**
alandır (alan yok = o sürüm ölçmüyordu; betik "bilinmiyor" sayar):

- `share.hiddenN` (5 elemanlı histogram), `share.defaultKept`, `notifOpened {card, daily}`
- `cards.lateBuckets` [aynı gün, 1-2 gün, 3+ gün]: **türetilmiş**, olay yok. Kartın üretim anı ile o haftanın Pazar günü arasındaki
  gün farkı; yalnız kova sayısı girer, tarih/epoch girmez.

**Hâlâ yok** (ilgili özellik yok ya da onay bekliyor): `fmt`/`src`/`switched` (biçim seçici), `album`, `cardFeel`, `strip`
(paylaşım unvanı) ve `titleVisibleDefault` (27 §2.4 "koşullu": <3 kartta null + security-reviewer onayı).

**Bütünlük kuralları** (27 §4.2; `validateReportV2`): 3-7 her zaman; `sum(hiddenN)==share.n`, `defaultKept<=share.n`,
`sum(lateBuckets)==frozen` yalnız alan varsa. Kural 2 (`fmt`/`src` toplamları) o alanlar gelince eklenir.
Not: uygulama ihlali kullanıcıya göstermez; asıl denetim birleştirme betiğindedir.

**Bilinen davranış:** sayaçlar kuruldan önceki paylaşımları saymaz. Bu sürüme yükselen ve daha önce paylaşım yapmış bir cihazın
raporunda `sum(hiddenN) < share.n` çıkar ve betik onu tabloya almaz. Deneme cihazları için kural zaten "temiz kurulum" (M-14).

## Birleştirme betiği (Batuhan'ın elle toplaması, 27 §4.3)

`scripts/merge-reports.js`: yerel, ağsız, bağımlılıksız.

```bash
node scripts/merge-reports.js <klasör> [--invited N] [--neutral A,B]
```

- Klasörde her `.txt`/`.json` bir rapor mesajıdır (uygulamanın paylaştığı metin; içindeki `{"v":2,...}` satırı okunur).
  Dosya adı `<testçi>_<dönem>[_...]`: `T01_A.txt`, `T01_B_2.txt`. Testçi kodu raporda YOK, yalnız dosya adında; bu klasörü repoda tutma.
- Aynı testçi + dönem + build için yalnızca **son `seq`**; farklı `build`'ler **ayrı tablo**; bütünlük kuralı bozan rapor tabloya
  alınmaz, nedeniyle listelenir; okunamayan dosyalar ayrı listelenir.
- Hesaplar: Aktivasyon (kart ≥1 / gün ≥8), İKO (kart ≥2 / ilk karttan ≥8 gün), D7 (evet / ölçülebilir; `--invited` verilirse
  "en az X, en çok Y" sınırı), E1 (yalnız `--neutral` dönemleri: paylaşan / kartı açan), kart başına paylaşım, varsayılan gizleme
  korunma oranı, gizleme histogramı, kart gecikmesi, bildirimle açılış, izin dağılımı, paydadan çıkanlar. Her orana Wilson %95.
- `validate()` betikte `validateReportV2`'nin birebir kopyasıdır. Kayma riskine karşı `__tests__/scripts/merge-reports.test.ts`
  ikisini bir sınır-değer matrisiyle karşılaştırır (her kuralda ±1 birim; kural kaydırma mutasyonlarıyla doğrulandı).
- D7 üst sınırında `N_rapor`, o build grubundaki testçi sayısıdır; başka build'de raporlayanlar "yapmış olabilir" sayılır (muhafazakâr).

## Gizlilik sözü kontrolü (27 §2.4)

Yeni alanların hepsi "uyumlu" sınıftadır (sayaç/enum/kova): `share_hidden_n`, `share_default_kept`, `notif_opened`, gecikme kovası.
`__tests__/metrics/report.test.ts` izin listesi testi ve yasak-desen taraması (tarih, epoch, kategori adı, kimlik) yeni alanları da
kapsar; üretim anı yalnız kova olarak çıkar (`report-v2.counters.test.ts`). **privacy-compliance-analyst'e bildirilecek:** rapor
içeriği genişledi (yine yalnız sayaç), Data Safety/politika metnindeki "rapor içeriği" cümlesi gözden geçirilmeli.

## K4 (2026-10-05, release APK, emülatör)

İki paylaşım (biri varsayılan gizleme, biri uyku açık): DB'de `share_hidden_n` dim 2 ve 1, `share_default_kept` y ve n birer kez;
önizlemede "Paylaşım başına gizlenen satır (0-4): 0 / 1 / 1 / 0 / 0; varsayılan gizleme korunan: 1", kart gecikmesi 0 / 1 / 0
(kart Pazar'dan 1 gün sonra açılmıştı), bildirimle açılış 0 / 0. `FATAL`/`SecurityException` yok. **Yapılmadı:** `notif_opened`'ın
cihazda gerçek bir bildirim dokunuşuyla sayıldığı (K2'de kanıtlı; soğuk/sıcak açılış cihaz kanıtı 09 #1/#2/#5 ile birlikte duruyor).

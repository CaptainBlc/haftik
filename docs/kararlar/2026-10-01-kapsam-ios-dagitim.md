# 2026-10-01 — Kapsam kararı: iOS eklendi, dağıtım yöntemi

Onaylayan: Batuhan. Önceki kayıt: `~/.claude/CLAUDE.md` ve proje `CLAUDE.md`'sinde "iOS koşullu (Apple üyeliği
yok)" notu vardı — bu not artık **geçersiz**, iOS yola girdi.

## Karar 1 — iOS platformu ekleniyor
Apple Developer Program hesabı Batuhan tarafından açılacak (yıllık 99 USD, kendi Apple ID/kartıyla — Claude
hesap açamaz, ödeme yapamaz). Hesap açılınca EAS'a bağlanacak, iOS build'i Android ile **paralel** ilerleyecek
(Android'i beklemeyecek). TestFlight harici test davetleriyle dağıtılacak.
**Etki:** `app.json`'daki `ios.bundleIdentifier` (`com.batuhan.haftik`) zaten vardı, değişmedi. iOS'a özel açık
kalemler (CLAUDE.md'deki "K7'nin iOS kısmı", iCloud yedek hariç tutma, `PrivacyInfo.xcprivacy`) artık aktif
hale geldi — Taban/Çekirdek fazlarına iOS doğrulaması eklenmeli (ayrı bir karar/dilim ekleme gerekecek,
`29-yol-haritasi.md` bu kapsam değişikliğini henüz yansıtmıyor).

## Karar 2 — Dağıtım kapsamı: geniş ama davetli
"Herkese denetelim" = **gerçek mağaza yayını değil**, link ile paylaşılan Android APK + iOS TestFlight davetleri.
Mağaza incelemesi, gizlilik politikası URL'si ve K10 hukuki görüş bu aşamada **şart değil** — bunlar yalnızca
gerçek Play Store / App Store yayınını (0.9.0+) bekletiyor, şu anki geniş davetli dağıtımı bekletmiyor.
TestFlight'ın kendi (hafif) incelemesi olabilir — bu, build hazır olunca ayrıca doğrulanacak.

## Karar 3 — Sıra korunuyor
Roadmap'teki "önce kritik hataları düzelt, sonra dağıt" sırası **değişmedi**: Taban (S13-S18) → Çekirdek
(S19-S23) → geniş davetli dağıtım (APK + TestFlight). Mevcut haliyle (kırık kart akışı, eski görsel) dağıtım
yapılmayacak.

## Sonraki adım
`29-yol-haritasi.md`'ye iOS paralel izi eklenmeli (software-architect/release-manager işi, Batuhan'ın Apple
hesabı açılınca). Şimdilik Android tarafında S13'e başlanabilir; iOS izi Apple hesabı açılır açılmaz devreye
girer.

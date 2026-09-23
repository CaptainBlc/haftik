# Review talimatları (Aşama 5) — Haftalık Hayat Karnesi

Anlamlı bir değişikliği commit'lemeden önce `/code-review` bu dosyadaki
ölçütlere göre elle çalıştırılır (ücretsiz, abonelikle çalışır).

## Geçişler

Her bulgu hangi geçişe ait olduğuyla etiketlenir:

**1. Bugs** — mantık hataları, hafta sınırı/saat dilimi hataları, ele alınmayan
uç durumlar, sessiz regresyonlar.

**2. Security** — global `security-review` skill'indeki maddeler ve `spec.md`
güvenlik gereksinimleri: kartta ham veri/metadata, ağ çağrısı, yeni üçüncü
parti SDK, loglarda kullanıcı verisi, yedekleme ayarı.

**3. Compliance** — değişiklik `spec.md`, `plan.md` ve `CLAUDE.md`'deki
kararlarla tutarlı mı? Plandan sapıldıysa `plan.md` güncellenmiş mi?

## "Important" ne demek

Davranışı bozan, veri sızdıran (kart dahil) ya da `spec.md`/`plan.md`/`CLAUDE.md`'deki
bir kararı ihlal eden bulgu. Stil/isimlendirme/biçim **nit**'tir.

## Nit sınırı

Bir incelemede en fazla **5 nit** raporlanır; gerisi sayı olarak özetlenir.

## Raporlanmayacaklar

Üretilmiş dosyalar (lock dosyaları, prebuild çıktıları), bağımlılık klasörleri,
CI'ın zaten otomatik kontrol ettiği şeyler (lint kuralları).

**Important bulgular commit'ten önce çözülür. Son karar Batuhan'ındır.**

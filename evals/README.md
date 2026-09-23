# Eval seti (Aşama 4: Test) — Haftalık Hayat Karnesi

`CLAUDE.md`, skill'ler, hook'lar ve agent tanımları Claude'un davranışını
yönlendiren **yapılandırmadır**; kod gibi bozulabilir. Bu set bunu yakalar.

## Ne zaman çalıştırılır

Şunlardan biri değiştiğinde: proje/global `CLAUDE.md`, `.claude/agents/`,
`~/.claude/skills/`, `~/.claude/hooks/`.

## Nasıl çalıştırılır (manuel, ücretsiz)

1. Yeni bir Claude Code oturumu aç.
2. `checklist.md`'deki görevleri sırayla iste.
3. Her "Beklenen davranış" karşılanıyor mu kontrol et.
4. Karşılanmıyorsa ilgili yapılandırmayı düzelt, tekrar dene.

## Yeni madde ne zaman eklenir

**Her gerçek hata bir eval maddesine dönüşür.** Claude aynı yanlışı ikinci kez
yaptıysa düzeltme `CLAUDE.md`'ye yazılır **ve** buraya bir madde eklenir.

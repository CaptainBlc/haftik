# AI-Native SDLC — Haftalık Hayat Karnesi kurulum haritası

Bu depo, playbook'un **tek kişilik, ücretsiz** uygulamasını izler. Kaynak
playbook deposu: `Claude SDLC` (ayrıntılı açıklamalar orada).

```
fikir → intent.md → spec.md → plan.md → kod → inceleme → (sorun) → yeni intent.md → ...
```

**İnsan onay noktaları (atlanmaz):** intent → Batuhan commit'ler; spec → Batuhan
onaylar+commit'ler; plan → Batuhan onaylar, sonra kod; her commit → Batuhan atar.

| Aşama | Dosya | Durum |
|---|---|---|
| 1 Plan | `intent/2026-09-20-haftalik-hayat-karti.md` | ✅ Onaylı, commit'li (Claude SDLC'de) |
| 2 Design | `spec.md` (onaylı kopya) | ✅ Onaylı |
| 3 Build | `plan.md` (onaylı kopya), `CLAUDE.md` | 🟡 Plan onaylı; CLAUDE.md komutları S1'de dolacak |
| 4 Test | `.claude/agents/verifier.md`, `evals/` | 🟡 verifier hazır, komutlar S1'de bağlanacak |
| 5 Deploy | `REVIEW.md`, `.github/workflows/ci.yml` | 🔲 ci.yml S1'de |
| 6 Maintain | `.github/dependabot.yml` | 🔲 S1'de |
| — | Skill'ler (`write-intent`, `security-review`), agent ekibi, hook'lar | ✅ Hazır (global, `~/.claude` altında) |

**Belge zinciri kuralı:** Kaynak-gerçek `Claude SDLC` deposundadır. Bu depodaki
`spec.md` ve `plan.md` onaylı kopyalardır; uygulama plandan saparsa **buradaki**
`plan.md` aynı commit içinde güncellenir.

Genel kurallar: `~/.claude/CLAUDE.md`.

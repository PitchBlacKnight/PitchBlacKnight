# mikelrosenthal.com — Version History

## v1.0 — 2026-05-19
**Tag:** `v1.0`
**Commit:** `21aec23`

Initial versioned release. Includes:
- 7-card Design Systems section with PDF slide thumbnails (16:9, full-slide display)
- UX / Web Design / Branding project grids with modal lightboxes
- TransUnion, TrueCredit, GE Edison, Sure/Prism, BCBS FIBER, Avant Pathfinder, Avant Marketing design system cards
- BCBS FIBER card thumbnail updated to "What matters most to you?" enrollment screen (bc-10.jpg)
- ORIGIN section (five-beat story timeline)
- Wisdom section (14 rotating quotes with prev/next nav)
- Hero overlay effect + 156-GIF motion reel

---

## How to roll back to a version

```bash
cd /Users/mikelrosenthal/PitchBlacKnight/ASSETS/sites/me-main
git checkout v1.0          # view that version
git checkout main          # return to latest
```

To deploy a specific version:
```bash
git checkout v1.0
vercel --prod --yes
git checkout main
```

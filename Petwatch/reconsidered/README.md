# PetWatch, reconsidered

The second pass at the Goji Labs PetWatch product design exercise, built outside the
original four-hour timebox, on purpose. The timed original lives one directory up and
stays untouched.

The thesis: a schedule transfers information; this product transfers the owner's
context and confidence to the person caring for their animal, at the moment it's
useful. One scenario carries everything: Hex, a black cat on prescribed insulin, and
Sam, a nervous friend house-sitting.

## Layout

- `domain/` — the care moment domain core: append-only event log, derived status,
  injectable clock. No DOM. 14 unit tests state the product rules.
- `prototype/` — the working prototype: watcher's evening, due/snooze, guided care,
  help, completion, owner's view, on a controllable clock.
- `casestudy/` — the editorial case study, seven chapters organized around decisions.
- `tokens.css` — the design system. One file, two surfaces (notebook shell, product).
- `build.mjs` — the one build script. Outputs self-contained pages to `dist/` and
  body-fragment variants to `dist/artifacts/` for claude.ai artifact publishing.
- `NOT-BUILDING.md` — the standing scope guardrail. Read it before adding anything.

## Commands

```
node --test domain/                      # product rules as tests
npx -y --package typescript@5.6.3 tsc \
  --allowJs --checkJs --noEmit --target es2022 --module es2022 \
  domain/caremoment.js prototype/app.js  # typecheck
npx -y prettier@3.3.3 --write "domain/*.js" prototype/app.js build.mjs
node build.mjs                           # build dist/
python3 -m http.server 8824              # then open /prototype/ or /dist/
```

`node build.mjs --casestudy-url=... --prototype-url=...` bakes cross-links for the
artifact variants.

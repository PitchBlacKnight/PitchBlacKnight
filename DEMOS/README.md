# DEMOS — the interview demo dashboard

One review hub for every live demo: PetWatch, Pathfinder 2.0 (playground,
recipes, stage), the Keystone agent pipeline, the Tokens Out Figma plugin,
and the interview kit.

## Where it lives

Its **own** Vercel project: `pbk-demos` (scope `pitchblacknight`), at
https://pbk-demos.vercel.app. It shares nothing with `mikelrosenthal-site`
(mikelrosenthal.com) or `pitchblacknight-website` (pitchblacknight.com) and
cannot affect them. Every page is noindexed (meta tag + X-Robots-Tag header
in `vercel.json`).

## Layout

- `index.html` — the dashboard. Cards link out to already-deployed demos
  (petwatch-exercise.vercel.app, pbk-guide.vercel.app) and in to `pathfinder/`.
- `pathfinder/` — static copy of `CLAUDE CODE/pathfinder-2.0` (css, js, tokens,
  fonts, playground, recipes, stage). The source of truth stays in
  `CLAUDE CODE/pathfinder-2.0`; re-run the rsync in `publish.sh` comments or
  copy manually after edits there.

## Publish

```bash
./publish.sh
```

The script refuses to run if this folder is ever linked to a project that owns
a live domain (same guard pattern as `interview-kit/publish.sh`).

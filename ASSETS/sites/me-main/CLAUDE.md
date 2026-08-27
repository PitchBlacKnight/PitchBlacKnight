# ⛔ THIS FOLDER MUST NEVER DEPLOY TO mikelrosenthal.com

**This is the ARCHIVED older site design** (PBK Studio — sidebar nav, big
`MIKEL ROSENTHAL` type, `images/hero-geo.gif` Penrose triangle).
It is kept for reference and for its long-form case studies. It is **not** the
live site and must never be published to the live domain.

## The rule

- **Do NOT run `vercel`, `vercel --prod`, `vercel link`, or `vercel deploy` in this folder.**
- **Do NOT restore** anything from `_quarantined-vercel-links/`. Those are three
  old links to the Vercel project `mikelrosenthal-site`, which owns the live domain.
- **Do NOT delete or unlock `.vercel`.** It is a locked *file* (not a directory),
  placed there so the Vercel CLI physically cannot create its link directory here.
  Read it — it explains itself.

## Why this exists

This folder was linked to `mikelrosenthal-site` (the project that owns
mikelrosenthal.com). Every `vercel --prod` run here published this old design
over the live site. It happened repeatedly on Aug 5 2026 — the link was disabled
once, re-created, and used again within the hour — and again on Aug 6 2026, when a
fresh `.vercel/` link appeared at 09:04 and the old design went live at ~09:15.
Each time, the owner lost his current site and had to have it restored.

### The actual culprit

`CLAUDE CODE/interview-kit/publish.sh` rsync'd the interview kit into
`me-main/guide/` and then ran, verbatim:

```bash
cd "$SITE" && vercel link --project mikelrosenthal-site --yes
cd "$SITE" && vercel --prod --yes      # $SITE = this folder
```

So **publishing the interview kit re-created the link and republished this old
homepage over mikelrosenthal.com.** That is why disabling the link never held —
the next publish recreated it on purpose. The guide only ever reached the web as
a passenger on this folder's deploys.

`ASSETS/deploy-sites.sh me` was the second path: it deployed this folder and,
when the link was missing, printed `vercel link --project mikelrosenthal-site` —
instructions to recreate the exact link that caused the problem.

Both were fixed on 2026-08-06. The interview kit now has its own Vercel project
(`pbk-guide`) and deploys from `CLAUDE CODE/interview-kit`; `deploy-sites.sh me`
now deploys `~/Sites/mikelrosenthal-site`.

`me-main/guide/` is now a **stale copy** — nothing publishes from it. Edit the
kit at `CLAUDE CODE/interview-kit/` instead.

## Guards now in place (2026-08-06)

| Guard | Effect |
|---|---|
| `.vercel` is a `chflags uchg` locked file | `vercel link` / `vercel --prod` fail here — cannot create `.vercel/` |
| `_quarantined-vercel-links/` | The three old project links, moved out of the way |
| `deploy-sites.sh me` → `~/Sites/mikelrosenthal-site` | The script can no longer publish this folder |
| `interview-kit/publish.sh` → project `pbk-guide` | The guide no longer rides on this folder's deploys, and refuses to run if ever linked to `mikelrosenthal-site` |

## The live site

mikelrosenthal.com deploys **only** from:

```
/Users/mikelrosenthal/Sites/mikelrosenthal-site   (branch: main, tag: v2.0-final)
```

That repo's design is *"Complex software, made beautiful, built to scale."* — a
single-page site with a percentage preloader and six design-system case-file
modals. If mikelrosenthal.com is showing the sidebar/`hero-geo` design instead,
this folder was deployed by mistake. Recovery:

```bash
cd ~/Sites/mikelrosenthal-site && git checkout main && vercel --prod --yes --scope pitchblacknight
```

Sanity check — the live page should be ~202,678 bytes and titled
*"Mikel Rosenthal — Senior Product Designer"*. If it is ~195,254 bytes and titled
*"PBK Studio"*, this archive is live and needs to be replaced.

## Working here is fine

Editing, reading, and serving this folder locally is fine — it is a useful
archive, especially its expanded case studies (`pathfinder.html`,
`bcbs-fiber.html`, `ge-edison.html`, `surepeople-prism.html`,
`transunion-tucm.html`, `avant-marketing.html`). Those are also copied into the
live repo under `_reference/expanded-case-studies/` for blending work.
Just never publish from here.

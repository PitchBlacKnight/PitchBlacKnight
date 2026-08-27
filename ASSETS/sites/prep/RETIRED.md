# ⛔ RETIRED — 2026-08-06

This folder is a **stale, older copy of the interview kit**. It is superseded and
must not be edited or deployed.

## Where the interview kit actually lives

| | |
|---|---|
| Source | `~/PitchBlacKnight/CLAUDE CODE/interview-kit` |
| URL | https://guide.mikelrosenthal.com |
| Vercel project | `pbk-guide` |
| Deploy | `~/PitchBlacKnight/ASSETS/deploy-sites.sh guide` |

## What was here

An earlier snapshot of the same kit. Its `keystone/` directory is the old name
for the kit's `pathfinder/` — same structure, same files. A full comparison on
2026-08-06 found **nothing unique** in this folder, so nothing was lost by
retiring it.

It was published to the Vercel project `pbk-prep` at `prep.pitchblacknight.com`,
which never resolved — the DNS record was never created — and at
`pbk-prep.vercel.app`.

## What was done

- The Vercel link was moved to `_quarantined-vercel-link/`.
- `.vercel` is now a **file**, not a directory, so the CLI cannot re-link here.
- The `prep` target was removed from `deploy-sites.sh`.

Kept only as a historical snapshot. Edit `CLAUDE CODE/interview-kit/` instead.

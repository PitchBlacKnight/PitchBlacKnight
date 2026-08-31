# PitchBlacKnight

ART / MUSIC / WORK

## Live sites: do not break these

Two production domains deploy from sources in or beside this repo. Both were
verified byte-for-byte against production on 2026-08-30.

| Domain | Deploys from | Vercel project |
|---|---|---|
| pitchblacknight.com | `PBK V3/` (in this repo) | `pitchblacknight-website` |
| mikelrosenthal.com | `~/Sites/mikelrosenthal-site` (outside this repo) | `mikelrosenthal-site` |
| home.pitchblacknight.com | `ASSETS/deploy/` | `deploy` |

Deploy only through the master script, which checks each folder is linked to the
right Vercel project and refuses to publish an empty directory over a live site:

```bash
./ASSETS/deploy-sites.sh pbk    # pitchblacknight.com
./ASSETS/deploy-sites.sh me     # mikelrosenthal.com
./ASSETS/deploy-sites.sh home   # home.pitchblacknight.com
```

Run `./ASSETS/deploy-sites.sh` with no argument to list every site and microsite.

Two traps worth remembering, both already fixed in the script:

- `ASSETS/sites/me-main/` is an archived older design of mikelrosenthal.com.
  Deploying it publishes the wrong site over the live domain.
- pitchblacknight.com takes its domain from a production deploy automatically.
  Never `vercel alias set` it, and never point `ASSETS/deploy` at it.

## Layout

| Path | What it is |
|---|---|
| `PBK V3/` | Live pitchblacknight.com source, plus client microsites |
| `ASSETS/` | Deploy roots, site archives, images, the master deploy script |
| `CLAUDE CODE/` | Interview kit, Pathfinder demo, resumes, working notes |
| `DEMOS/` | Process and method pages |
| `Petwatch/` | PetWatch exercise, prototype, and built output |
| `RESUMES/` | Resume and evidence-sheet materials |
| `VOICE/` | Speech-capture rig and the tellcheck draft checker |
| `knowledge/` | Learning hub and reference pages |
| `project/` | Figma Make project data |
| `hq-3da70b/` | Interview HQ, noindexed |

## Repo hygiene

Claude Code agent worktrees are full checkouts and grow fast. Ten of them
reached 12 GB before the 2026-08-30 cleanup. They are gitignored now, but they
still consume disk. Check and clear them periodically:

```bash
git worktree list
```

Lossless audio masters live outside this repo in `~/PBK-AUDIO-MASTERS/`.
The repo carries MP3 renditions only, and a master cannot be rebuilt from an MP3.

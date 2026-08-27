# ⚠️ DO NOT DEPLOY FROM THIS FOLDER

This is the **archive / legacy** version of mikelrosenthal.com.

Its Vercel link pointed at the SAME project as the live site
(`mikelrosenthal-site`, prj_k9ipt…), so running `vercel --prod` here
**overwrote the live site with this old design** — repeatedly, on
Aug 5 and again on Aug 6 2026.

## It is now physically blocked (2026-08-06)

- `.vercel` is a locked **file**, not a directory — the Vercel CLI cannot create
  its link directory here. Do not delete it or run `chflags nouchg` on it.
- The three old link directories were moved to `_quarantined-vercel-links/`.
  Do not restore them.
- `ASSETS/deploy-sites.sh me` now deploys `~/Sites/mikelrosenthal-site`.

## The live site lives here instead

```
/Users/mikelrosenthal/Sites/mikelrosenthal-site
```

Deploy it either way:

```bash
~/PitchBlacKnight/ASSETS/deploy-sites.sh me
```

```bash
cd ~/Sites/mikelrosenthal-site && vercel --prod --yes --scope pitchblacknight
```

Keep this folder for reference and imagery only.

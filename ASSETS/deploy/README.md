# PitchBlacKnight — pitchblacknight.com

**Mikel Rosenthal** · Polymath · Fluxus Artist · iatric_MX

---

## Deploy to Vercel (Step-by-Step)

### Option A — Drag & Drop (Fastest, no GitHub needed)
1. Go to [vercel.com](https://vercel.com) and sign in (or create a free account)
2. On your dashboard click **"Add New → Project"**
3. Choose **"Deploy without Git"** or drag this entire `deploy/` folder onto the page
4. Vercel detects it as a static site automatically
5. Click **Deploy** — you'll have a live URL in under 60 seconds

### Option B — Via GitHub (Recommended for ongoing updates)
1. Create a new repo on [github.com](https://github.com) named `pitchblacknight`
2. Push the contents of this `deploy/` folder as the root of that repo
3. On Vercel, click **"Add New → Project"** and import your GitHub repo
4. Vercel auto-detects static HTML — click **Deploy**
5. Every time you push to GitHub, Vercel auto-redeploys

---

## Connecting pitchblacknight.com (IONOS DNS)

Once Vercel gives you a deployment URL, do this in IONOS:

1. Log into [ionos.com](https://ionos.com) → **Domains & SSL** → **DNS**
2. Select `pitchblacknight.com`
3. Add these records:

| Type  | Host | Value                    | TTL  |
|-------|------|--------------------------|------|
| CNAME | www  | cname.vercel-dns.com     | 3600 |
| A     | @    | 76.76.21.21              | 3600 |

4. In Vercel, go to your project → **Settings → Domains**
5. Add `pitchblacknight.com` and `www.pitchblacknight.com`
6. Vercel will verify DNS — usually takes 10–30 minutes, up to 48 hours

---

## Updating Daily Content

Edit `content.json` and change the `daily` block:
- `date` — today's date (YYYY-MM-DD)
- `wisdom` — your wisdom of the day
- `perspective` — your perspective
- `journal` — journal entry
- `poetry` — poem (use \n for line breaks)
- `music.embed_url` — paste your SoundCloud embed URL when ready
- `free_offering` — what you're offering free today

---

## File Structure

```
deploy/
├── index.html        ← the entire website (single file)
├── content.json      ← all daily content (edit this regularly)
├── README.md         ← this file
├── images/           ← all your photos and logos
│   └── logos/
└── video/
    └── Dark Eye.mp4
```

---

*Built with Figma Make · Deployed via Vercel · Domain via IONOS*

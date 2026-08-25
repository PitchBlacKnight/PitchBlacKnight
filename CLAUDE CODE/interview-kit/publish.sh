#!/usr/bin/env bash
# Publish the interview kit to its OWN Vercel project — pbk-guide.
#
# ── HISTORY / WHY THIS LOOKS LIKE THIS ────────────────────────────────────
# Until 2026-08-06 this script rsync'd the kit into
#   ~/PitchBlacKnight/ASSETS/sites/me-main/guide/
# and then ran:
#   vercel link --project mikelrosenthal-site --yes
#   vercel --prod --yes
# me-main is the ARCHIVED older mikelrosenthal.com design. So every publish of
# the interview kit re-linked that archive to the live project and republished
# the OLD homepage over mikelrosenthal.com. That is what kept "swapping the
# site back" — disabling the link never held, because this script recreated it
# by design on the next publish.
#
# The kit now deploys to its own isolated project. It shares nothing with
# mikelrosenthal.com and cannot affect it.
# ──────────────────────────────────────────────────────────────────────────
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
PROJECT="pbk-guide"
SCOPE="pitchblacknight"

# ── Guard: never publish to the project that owns mikelrosenthal.com ──
LINKED=$(python3 -c "import json;print(json.load(open('$SRC/.vercel/project.json'))['projectName'])" 2>/dev/null || echo "")
if [ "$LINKED" != "$PROJECT" ]; then
  if [ "$LINKED" = "mikelrosenthal-site" ]; then
    echo "⛔ REFUSING TO PUBLISH: this folder is linked to 'mikelrosenthal-site',"
    echo "   the project that owns the live domain. Publishing would overwrite"
    echo "   mikelrosenthal.com with whatever is in this folder."
  else
    echo "⛔ Linked to '${LINKED:-nothing}', expected '$PROJECT'."
  fi
  echo "   Fix: vercel link --project $PROJECT --scope $SCOPE --yes"
  exit 1
fi

# ── Re-apply noindex meta to any new pages. The X-Robots-Tag header in
#    vercel.json already covers this at the HTTP level; this protects the
#    files if one is ever opened or shared standalone. ──
python3 - "$SRC" <<'PY'
import glob, os, sys
d = sys.argv[1]
tag = ('<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">\n'
       '<meta name="referrer" content="no-referrer">')
n = 0
pages = glob.glob(os.path.join(d, '*.html')) + glob.glob(os.path.join(d, 'pathfinder/docs/*.html'))
for f in pages:
    s = open(f, encoding='utf8').read()
    if 'noindex' in s:
        continue
    if '<meta charset="utf-8">' in s:
        s = s.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + tag, 1)
    elif '<head>' in s:
        s = s.replace('<head>', '<head>\n' + tag, 1)
    else:
        continue
    open(f, 'w', encoding='utf8').write(s)
    n += 1
print(f"  noindex applied to {n} new page(s)")
PY

echo "→ Publishing interview kit to $PROJECT ..."
cd "$SRC" && vercel --prod --yes --scope "$SCOPE"

echo ""
echo "  ✓ https://guide.mikelrosenthal.com"
echo "    (also https://pbk-guide.vercel.app)"
echo ""
echo "    Note: guide.mikelrosenthal.com is a SUBDOMAIN only. It is served by"
echo "    project 'pbk-guide' — mikelrosenthal.com itself is project"
echo "    'mikelrosenthal-site' and is untouched by this script."

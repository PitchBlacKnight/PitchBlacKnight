#!/usr/bin/env bash
# Publish the demo dashboard to its OWN Vercel project — pbk-demos.
#
# Same guard pattern as interview-kit/publish.sh: this folder must never be
# linked to 'mikelrosenthal-site' (owns mikelrosenthal.com) or
# 'pitchblacknight-website' (owns pitchblacknight.com). Publishing from a
# wrongly-linked folder would overwrite a live domain with this dashboard.
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
PROJECT="pbk-demos"
SCOPE="pitchblacknight"

LINKED=$(python3 -c "import json;print(json.load(open('$SRC/.vercel/project.json'))['projectName'])" 2>/dev/null || echo "")
if [ "$LINKED" != "$PROJECT" ]; then
  case "$LINKED" in
    mikelrosenthal-site|pitchblacknight-website|deploy)
      echo "⛔ REFUSING TO PUBLISH: this folder is linked to '$LINKED', which owns"
      echo "   a live domain. Publishing would overwrite that site."
      ;;
    *)
      echo "⛔ Linked to '${LINKED:-nothing}', expected '$PROJECT'."
      ;;
  esac
  echo "   Fix: vercel link --project $PROJECT --scope $SCOPE --yes"
  exit 1
fi

cd "$SRC"
vercel --prod --yes --scope "$SCOPE"

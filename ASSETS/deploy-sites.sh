#!/bin/bash
# ══════════════════════════════════════════════════════════
#  MASTER DEPLOY SCRIPT — PitchBlacKnight Sites
#  Usage: ./deploy-sites.sh <site>
#
#  Each site is LOCKED to its own Vercel project + subdomain.
#  Client projects are completely isolated — touching one
#  can never break another.
# ══════════════════════════════════════════════════════════

ASSETS="$(cd "$(dirname "$0")" && pwd)"

# mikelrosenthal.com lives OUTSIDE this repo. sites/me-main/ is the archived
# older design; deploying it publishes the wrong site over the live domain.
ME_SITE="$HOME/Sites/mikelrosenthal-site"

# The interview kit is its own project (pbk-guide). It formerly published via
# sites/me-main/guide, which is how the live homepage kept getting reverted.
GUIDE_SITE="$HOME/PitchBlacKnight/CLAUDE CODE/interview-kit"

echo ""
echo "  ┌─────────────────────────────────────────────────────────────────┐"
echo "  │  PBK SITES                                                      │"
echo "  ├────────────┬────────────────────────────────────────────────────┤"
echo "  │  pbk       │  pitchblacknight.com        (deploy/)              │"
echo "  │  me        │  mikelrosenthal.com  (~/Sites/mikelrosenthal-site) │"
echo "  │  me-alt    │  me-alt.pitchblacknight.com (sites/me-alt/)        │"
echo "  │  guide     │  guide.mikelrosenthal.com   (interview-kit/)       │"
echo "  │  lindsey   │  lindseybingaman.com        (sites/lindsey-main/)  │"
echo "  ├────────────┼────────────────────────────────────────────────────┤"
echo "  │  CLIENT MICROSITES (each fully isolated)                        │"
echo "  │  david     │  david.pitchblacknight.com  (sites/david/)         │"
echo "  │  bert      │  bert.pitchblacknight.com   (sites/bert/)          │"
echo "  │  socomcm   │  socomcm.pitchblacknight.com (sites/socomcm/)      │"
echo "  │  fccw      │  fccw.pitchblacknight.com   (sites/fccw/)          │"
echo "  │  fccw2     │  fccw2.pitchblacknight.com  (sites/fccw2/)         │"
echo "  │  serenity  │  serenity.pitchblacknight.com (sites/serenity/)    │"
echo "  │  240ccr    │  240ccr.pitchblacknight.com (sites/240ccr/)        │"
echo "  └────────────┴────────────────────────────────────────────────────┘"
echo ""

# ── Safety check helper ───────────────────────────────────
check_project() {
  DIR="$1"; EXPECTED="$2"
  ACTUAL=$(cat "$DIR/.vercel/project.json" | python3 -c "import sys,json; print(json.load(sys.stdin)['projectName'])")
  if [ "$ACTUAL" != "$EXPECTED" ]; then
    echo "⛔ ERROR: $DIR is linked to '$ACTUAL', not '$EXPECTED'."
    echo "   Run: vercel link --project $EXPECTED --scope pitchblacknight --yes"
    exit 1
  fi
  check_not_empty "$DIR"
}

# ── Refuse to publish an empty folder over a live site ─────
# Several source folders have been emptied over time (e.g. sites/lindsey-main
# holds only .gitignore and .vercel). Deploying one replaces the live site with
# nothing. Found 2026-08-06; this stops it.
check_not_empty() {
  DIR="$1"
  if [ ! -s "$DIR/index.html" ]; then
    echo "⛔ REFUSING TO DEPLOY: $DIR has no usable index.html."
    echo "   Publishing it would replace the live site with an empty deployment."
    echo "   Restore the source into that folder first, then re-run."
    exit 1
  fi
}

case "$1" in

  pbk)
    check_project "$ASSETS/deploy" "deploy"
    echo "→ Deploying pitchblacknight.com..."
    cd "$ASSETS/deploy" && vercel --prod --yes
    DEPLOY_URL=$(cd "$ASSETS/deploy" && vercel ls --scope pitchblacknight 2>&1 | grep "● Ready" | head -1 | awk '{print $3}')
    if [ -n "$DEPLOY_URL" ]; then
      vercel alias set "$DEPLOY_URL" pitchblacknight.com --scope pitchblacknight --yes 2>/dev/null || true
      echo "  ✓ pitchblacknight.com → $DEPLOY_URL"
    fi
    ;;

  me)
    if [ ! -d "$ME_SITE" ]; then
      echo "⛔ ERROR: $ME_SITE not found."
      echo "   mikelrosenthal.com deploys ONLY from that repo — never from"
      echo "   $ASSETS/sites/me-main (archived older design)."
      exit 1
    fi
    check_project "$ME_SITE" "mikelrosenthal-site"
    echo "→ Deploying mikelrosenthal.com from $ME_SITE ..."
    cd "$ME_SITE" && vercel --prod --yes --scope pitchblacknight
    ;;

  guide)
    # The interview kit. Lives outside ASSETS, in its own Vercel project.
    # It used to publish through sites/me-main, which overwrote mikelrosenthal.com.
    exec "$GUIDE_SITE/publish.sh"
    ;;

  prep)
    echo "⛔ 'prep' is RETIRED (2026-08-06)."
    echo "   sites/prep/ was an older copy of the interview kit and is no longer"
    echo "   deployable. Use the kit instead:"
    echo "     $0 guide      → https://guide.mikelrosenthal.com"
    exit 1
    ;;

  me-alt)
    check_project "$ASSETS/sites/me-alt" "mikelrosenthal-alt"
    echo "→ Deploying me-alt.pitchblacknight.com..."
    cd "$ASSETS/sites/me-alt" && vercel --prod --yes
    ;;

  lindsey)
    check_project "$ASSETS/sites/lindsey-main" "lindsey-bingaman"
    echo "→ Deploying lindseybingaman.com..."
    cd "$ASSETS/sites/lindsey-main" && vercel --prod --yes
    ;;

  # ── CLIENT MICROSITES ──────────────────────────────────

  david)
    check_project "$ASSETS/sites/david" "pbk-david"
    echo "→ Deploying david.pitchblacknight.com..."
    cd "$ASSETS/sites/david" && vercel --prod --yes
    ;;

  bert)
    check_project "$ASSETS/sites/bert" "pbk-bert"
    echo "→ Deploying bert.pitchblacknight.com..."
    cd "$ASSETS/sites/bert" && vercel --prod --yes
    ;;

  socomcm)
    check_project "$ASSETS/sites/socomcm" "pbk-socomcm"
    echo "→ Deploying socomcm.pitchblacknight.com..."
    cd "$ASSETS/sites/socomcm" && vercel --prod --yes
    ;;

  fccw)
    check_project "$ASSETS/sites/fccw" "pbk-fccw"
    echo "→ Deploying fccw.pitchblacknight.com..."
    cd "$ASSETS/sites/fccw" && vercel --prod --yes
    ;;

  fccw2)
    check_project "$ASSETS/sites/fccw2" "pbk-fccw2"
    echo "→ Deploying fccw2.pitchblacknight.com..."
    cd "$ASSETS/sites/fccw2" && vercel --prod --yes
    ;;

  serenity)
    check_project "$ASSETS/sites/serenity" "pbk-serenity"
    echo "→ Deploying serenity.pitchblacknight.com..."
    cd "$ASSETS/sites/serenity" && vercel --prod --yes
    ;;

  240ccr)
    check_project "$ASSETS/sites/240ccr" "pbk-240ccr"
    echo "→ Deploying 240ccr.pitchblacknight.com..."
    cd "$ASSETS/sites/240ccr" && vercel --prod --yes
    ;;

  *)
    echo "Usage: $0 [pbk|me|me-alt|guide|lindsey|david|bert|socomcm|fccw|fccw2|serenity|240ccr]"
    exit 1
    ;;
esac

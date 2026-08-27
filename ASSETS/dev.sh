#!/bin/bash
# ══════════════════════════════════════════════════════════
#  LOCAL DEV SERVER — PitchBlacKnight Sites
#  Usage: ./dev.sh <site>
#
#  Each site runs on its own port for easy side-by-side work.
# ══════════════════════════════════════════════════════════

ASSETS="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  ┌─────────────────────────────────────────────────────────────────────┐"
echo "  │  PBK LOCAL DEV                                                      │"
echo "  ├────────────┬────────────────────────────────────────────────────────┤"
echo "  │  pbk       │  localhost:3000   (deploy/)                            │"
echo "  │  me        │  localhost:3001   (~/Sites/mikelrosenthal-site)        │"
echo "  │  me-archive│  localhost:3011   (sites/me-main/ — OLD, never deploy) │"
echo "  │  lindsey   │  localhost:3002   (sites/lindsey-main/)                │"
echo "  │  david     │  localhost:3003   (sites/david/)                       │"
echo "  │  bert      │  localhost:3004   (sites/bert/)                        │"
echo "  │  socomcm   │  localhost:3005   (sites/socomcm/)                     │"
echo "  │  fccw      │  localhost:3006   (sites/fccw/)                        │"
echo "  │  fccw2     │  localhost:3007   (sites/fccw2/)                       │"
echo "  │  240ccr    │  localhost:3008   (sites/240ccr/)                      │"
echo "  └────────────┴────────────────────────────────────────────────────────┘"
echo ""

declare -A PORTS=(
  [pbk]=3000
  [me]=3001
  [me-archive]=3011
  [lindsey]=3002
  [david]=3003
  [bert]=3004
  [socomcm]=3005
  [fccw]=3006
  [fccw2]=3007
  [240ccr]=3008
)

declare -A DIRS=(
  [pbk]="$ASSETS/deploy"
  [me]="$HOME/Sites/mikelrosenthal-site"
  [me-archive]="$ASSETS/sites/me-main"
  [lindsey]="$ASSETS/sites/lindsey-main"
  [david]="$ASSETS/sites/david"
  [bert]="$ASSETS/sites/bert"
  [socomcm]="$ASSETS/sites/socomcm"
  [fccw]="$ASSETS/sites/fccw"
  [fccw2]="$ASSETS/sites/fccw2"
  [240ccr]="$ASSETS/sites/240ccr"
)

case "$1" in
  pbk|me|lindsey|david|bert|socomcm|fccw|fccw2|240ccr)
    PORT="${PORTS[$1]}"
    DIR="${DIRS[$1]}"
    echo "→ Starting $1 at http://localhost:$PORT"
    echo "  Press Ctrl+C to stop."
    echo ""
    cd "$DIR" && vercel dev --listen "$PORT" --yes
    ;;
  all)
    echo "→ Starting all sites..."
    for site in pbk me lindsey david bert socomcm fccw fccw2 240ccr; do
      PORT="${PORTS[$site]}"
      DIR="${DIRS[$site]}"
      echo "  $site → http://localhost:$PORT"
      cd "$DIR" && vercel dev --listen "$PORT" --yes &>/dev/null &
    done
    echo ""
    echo "All sites running. Press Ctrl+C to stop all."
    wait
    ;;
  *)
    echo "Usage: $0 [pbk|me|lindsey|david|bert|socomcm|fccw|fccw2|240ccr|all]"
    exit 1
    ;;
esac

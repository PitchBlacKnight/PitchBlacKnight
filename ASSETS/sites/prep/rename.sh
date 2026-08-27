#!/usr/bin/env bash
# Rename the demo design system so Claude speaks their language, not mine.
#
#   ./rename.sh "Atlas" "TheirCompany" "Senior Design Systems Designer"
#
#   $1  system name   (required)  — replaces "Keystone" and the ks- class prefix
#   $2  company name  (optional)  — fills [COMPANY] in the dashboard
#   $3  role title    (optional)
#
# Rewrites the skill and the dashboard, then re-zips. Re-upload the new zip
# to claude.ai afterwards. Run it once — it is not idempotent.

set -euo pipefail
cd "$(dirname "$0")"

SYS="${1:?usage: ./rename.sh \"SystemName\" [\"Company\"] [\"Role\"]}"
CO="${2:-}"
ROLE="${3:-}"

SLUG="$(printf '%s' "$SYS" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:]')"
[ -n "$SLUG" ] || { echo "system name must contain letters or numbers"; exit 1; }

if [ ! -d "skill/keystone-ds" ]; then
  echo "skill/keystone-ds not found — already renamed? Nothing to do."; exit 1
fi

echo "→ system:  Keystone   →  $SYS"
echo "→ classes: ks-*       →  ${SLUG}-*"
echo "→ tokens:  --ks-*     →  --${SLUG}-*"

# --- skill -------------------------------------------------------------------
find skill -type f -name '*.md' -print0 | while IFS= read -r -d '' f; do
  sed -i '' \
    -e "s/Keystone/${SYS}/g" \
    -e "s/keystone/${SLUG}/g" \
    -e "s/--ks-/--${SLUG}-/g" \
    -e "s/\bks-/${SLUG}-/g" \
    "$f"
done
mv "skill/keystone-ds" "skill/${SLUG}-ds"

# --- dashboard ---------------------------------------------------------------
# every "ks-" in index.html is a component class — verified, safe to replace globally
sed -i '' \
  -e "s/ks-/${SLUG}-/g" \
  -e "s/Keystone/${SYS}/g" \
  index.html

[ -n "$CO" ]   && sed -i '' -e "s/^  company: \"[^\"]*\"/  company: \"${CO}\"/" index.html
[ -n "$ROLE" ] && sed -i '' -e "s/^  role:    \"[^\"]*\"/  role:    \"${ROLE}\"/" index.html

# --- repackage ---------------------------------------------------------------
rm -f keystone-ds.zip "${SLUG}-ds.zip"
( cd skill && zip -qr "../${SLUG}-ds.zip" "${SLUG}-ds" -x '.*' -x '__MACOSX/*' )

echo
echo "✓ ${SLUG}-ds.zip is ready."
echo "  Re-upload it: claude.ai → Customize → Skills → + → Create skill"

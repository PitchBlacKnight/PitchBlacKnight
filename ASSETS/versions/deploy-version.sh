#!/bin/bash
# Usage: ./deploy-version.sh v1
# Copies the chosen version to deploy/index.html and pushes to Vercel

VERSIONS_DIR="$(dirname "$0")"
DEPLOY_DIR="$VERSIONS_DIR/../deploy"

echo ""
echo "Available versions:"
echo "  v1  — GIF overlay / dark gold  (the original with GIFs in every section)"
echo "  v2g — Grand unified bento      (full content, 1400 lines)"
echo "  v2  — Bento dark teal          (7 tiles, teal accents)"
echo "  v3  — Bento 7-tile dark        (Bebas Neue, cool palette)"
echo "  v4  — Bento colored vivid      (cobalt/crimson/amber/plum/coral)
  v5  — Grand Unified            (ALL content merged, 156 GIFs, music + art + work + services)"
echo ""

case "$1" in
  v1)  SRC="$VERSIONS_DIR/v1-gif-overlay-dark-gold.html" ;;
  v2g) SRC="$VERSIONS_DIR/v2-grand-unified-bento.html" ;;
  v2)  SRC="$VERSIONS_DIR/v2-bento-dark-teal.html" ;;
  v3)  SRC="$VERSIONS_DIR/v3-bento-7tile-dark.html" ;;
  v4)  SRC="$VERSIONS_DIR/v4-bento-colored-vivid.html" ;;
  v5)  SRC="$VERSIONS_DIR/v5-grand-unified.html" ;;
  *)
    echo "Usage: $0 [v1|v2g|v2|v3|v4]"
    exit 1
    ;;
esac

echo "→ Deploying $1 to home.pitchblacknight.com..."
cp "$SRC" "$DEPLOY_DIR/index.html"
cd "$DEPLOY_DIR" && vercel --prod --yes

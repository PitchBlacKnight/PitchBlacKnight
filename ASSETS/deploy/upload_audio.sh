#!/bin/zsh
SUPABASE_URL="https://cauzutgwdhfconnjpsfv.supabase.co"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhdXp1dGd3ZGhmY29ubmpwc2Z2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg5MDczOSwiZXhwIjoyMDg3NDY2NzM5fQ.IXnbTBI6NWQ7jcA_qMoBXfl-_nq2by_HoLrk7gZaK5w"
AUDIO_DIR="/Users/mikelrosenthal/PitchBlacKnight/ASSETS/deploy/audio"
SUCCESS=0
FAIL=0

upload_file() {
  local file="$1"
  local filename=$(basename "$file")
  local encoded=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$filename'))")
  result=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "$SUPABASE_URL/storage/v1/object/audio/$encoded" \
    -H "Authorization: Bearer $KEY" \
    -H "Content-Type: audio/mpeg" \
    -H "x-upsert: true" \
    --data-binary "@$file")
  if [[ "$result" == "200" || "$result" == "201" ]]; then
    echo "✅ $filename"
  else
    echo "❌ $filename (HTTP $result)"
  fi
}

echo "Starting upload of $(ls $AUDIO_DIR/*.mp3 | wc -l | tr -d ' ') files..."
echo ""

for f in "$AUDIO_DIR"/*.mp3; do
  upload_file "$f" &
  # limit to 5 parallel uploads at a time
  while [[ $(jobs -r | wc -l) -ge 5 ]]; do sleep 0.5; done
done

wait
echo ""
echo "All uploads complete."

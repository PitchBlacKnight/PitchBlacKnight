#!/bin/bash
# Transcribe everything in raw/ and rebuild the voiceprint.
# Nothing leaves this machine.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

shopt -s nullglob nocaseglob
found=0
for f in raw/*.{m4a,mp3,wav,aiff,aif,caf,mov,mp4}; do
  found=1
  base="$(basename "${f%.*}")"
  out="transcripts/${base}.txt"
  if [ -f "$out" ]; then
    echo "skip  $base (already transcribed)"
    continue
  fi
  echo "wav   $base"
  ffmpeg -y -loglevel error -i "$f" -ac 1 -ar 16000 "/tmp/voice_$base.wav"
  echo "asr   $base"
  ./bin/transcribe "/tmp/voice_$base.wav" "$out"
  rm -f "/tmp/voice_$base.wav"
done

if [ "$found" -eq 0 ]; then
  echo "No audio in raw/. Drop your recordings there first."
fi

python3 bin/analyze.py transcripts voiceprint
echo
echo "Read: VOICE/transcripts/  (your actual words)"
echo "Then: VOICE/voiceprint/voiceprint.md  (the measurements)"

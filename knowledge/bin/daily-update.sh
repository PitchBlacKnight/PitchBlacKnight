#!/bin/bash
# Daily knowledge update. Invoked by launchd (com.pbk.knowledge-daily) on weekday mornings.
# Run by hand any time:  knowledge/bin/daily-update.sh

set -uo pipefail

ROOT="/Users/mikelrosenthal/PitchBlacKnight"
KB="$ROOT/knowledge"
LOG="$KB/bin/daily.log"
CLAUDE="/opt/homebrew/bin/claude"

# launchd hands us a minimal PATH; Homebrew and node need to be findable.
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

echo "───────────────────────────────────────────" >> "$LOG"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] starting"     >> "$LOG"

if [ ! -x "$CLAUDE" ]; then
  echo "[$(date '+%H:%M:%S')] FAIL: claude not found at $CLAUDE" >> "$LOG"
  exit 1
fi

cd "$ROOT" || exit 1

# Skip weekends — the curriculum is Mon–Fri.
DOW=$(date +%u)   # 1=Mon … 7=Sun
if [ "$DOW" -gt 5 ]; then
  echo "[$(date '+%H:%M:%S')] weekend, skipping" >> "$LOG"
  exit 0
fi

# Don't regenerate if today's unit already exists (e.g. laptop woke late and launchd retried).
if [ -f "$KB/daily/$(date +%F).md" ]; then
  echo "[$(date '+%H:%M:%S')] $(date +%F).md already exists, skipping" >> "$LOG"
  exit 0
fi

"$CLAUDE" -p "$(cat "$KB/bin/daily-prompt.md")" \
  --permission-mode acceptEdits \
  >> "$LOG" 2>&1

STATUS=$?
echo "[$(date '+%Y-%m-%d %H:%M:%S')] finished (exit $STATUS)" >> "$LOG"

# Keep the log from growing without bound.
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG")" -gt 4000 ]; then
  tail -n 1500 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi

exit $STATUS

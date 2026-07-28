# Knowledge

A daily learning system. 15 minutes each weekday, aimed at one outcome: **everything on the resume is something you can do cold.**

## Every morning

Open the dashboard. Do the brief (3 min), the drill (9 min), the recall (3 min). Type anything worth remembering under **Notes** in today's file in `daily/`. That's it.

The drill always produces an artifact. If a morning produces nothing you could show someone, it didn't count — and the agent will score it as missed.

## What runs on its own

A launchd agent fires `bin/daily-update.sh` weekdays at 6:07am. It runs Claude Code headless, which:

1. Scores yesterday (done or missed — never backfills)
2. Checks Figma, Figma Make, MCP, Claude Code and accessibility sources for real changes
3. Writes today's unit into `daily/`
4. Updates the spaced-repetition queue
5. Rebuilds `dashboard.html` and republishes it to the same Artifact URL
6. Commits inside `knowledge/` only

If the Mac is asleep at 6:07, launchd runs it at the next wake. Weekends are skipped.

## Layout

```
curriculum.md          The 8-week arc. Two tracks.
dashboard.html         Generated. Don't hand-edit — edit state and rebuild.
daily/YYYY-MM-DD.md    One unit per weekday. Your notes go here.
notes/                 Your artifacts. This folder is the real evidence.
state/claims.json      Every resume claim + honest confidence 0–5.
state/queue.json       Spaced repetition: 1 → 3 → 7 → 16 → 35 days.
state/progress.json    Streak, week/day, history, artifact URL.
bin/                   Generator, daily prompt, runner, launchd plist.
```

## The one rule that makes it work

**Only you raise a confidence score.** The agent can lower one if you say you struggled, but it can never raise one. A dashboard full of 5s you can't defend is worse than no dashboard — it would let you walk into an interview believing something untrue.

## Commands

Rebuild the dashboard after editing state by hand:

```bash
python3 knowledge/bin/build_dashboard.py
```

Run a full daily update now, without waiting for the morning:

```bash
knowledge/bin/daily-update.sh
```

Install the schedule (once):

```bash
cp knowledge/bin/com.pbk.knowledge-daily.plist ~/Library/LaunchAgents/ && launchctl load ~/Library/LaunchAgents/com.pbk.knowledge-daily.plist
```

Check it's registered, or stop it:

```bash
launchctl list | grep knowledge-daily
```

```bash
launchctl unload ~/Library/LaunchAgents/com.pbk.knowledge-daily.plist
```

Logs are in `bin/daily.log` (gitignored).

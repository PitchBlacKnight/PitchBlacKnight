# VOICE

A rig for measuring how you actually talk, so you can tell the difference
between your writing and the writing you have been handed.

Everything runs on this machine. The transcriber is Apple's on-device Speech
model, the analysis is stdlib Python. No audio, no transcript, and no draft is
sent anywhere. `raw/`, `transcripts/`, `voiceprint/` and `drafts/` are gitignored.

## Use

1. Read `prompts/PROTOCOL.md`. The rules there matter more than the code.
2. Record with Voice Memos. One file per prompt. Do not re-record.
3. Drop the `.m4a` files into `raw/`.
4. `./bin/run.sh`
5. Read `transcripts/` first, cold, before you read anything I measured.
6. Check any draft: `python3 bin/tellcheck.py drafts/whatever.md`

## What each piece does

- `bin/transcribe` - on-device speech to text (Swift, macOS 26 Speech framework)
- `bin/analyze.py` - counts rhythm, openers, habits, hedges, borrowed vocabulary
- `bin/tellcheck.py` - holds a draft against the voiceprint and flags the gaps
- `bin/run.sh` - does all of it

## One honest limitation

Apple's transcriber cleans as it goes. It punctuates, and it drops most filler
("um", "uh", false starts). So the sentence structure, word choice, and phrasing
in `transcripts/` are real, but the disfluency counts run low. If you want the
true unsmoothed record, listen back once with the transcript open and pencil the
restarts back in by hand. That pass is worth doing at least once. The places you
stop and restart are the places you are thinking rather than reciting.

If you would rather have a machine do it, `brew install whisper-cpp` transcribes
more literally and is also fully offline.

## What this deliberately does not do

It does not write in your voice. Nothing here generates a sentence for you.
The primary artifact is the transcript, which is you talking. Everything else is
a ruler held up against it.

# Not building

Every implementation slice in this repo must trace to a numbered case-study decision.
If a slice has no chapter, it has no reason to exist. This file is the standing scope
guardrail for humans and agents alike.

## Out of scope, permanently (for this exercise)

- Auth, registration, password reset. Acknowledged in one line in the case study.
- Pet CRUD and multi-pet management. One pet: Hex.
- Weekly calendar view. The stay is the frame, not the week (deliberate reinterpretation, stated in ch. 2).
- Invite flows beyond a one-line acknowledgment of v1's honest-refusal design.
- Real notifications, backend, persistence, or sync. The event log models sync; nothing implements it.
- Multi-watcher UI. The domain supports it (event log); the interface shows one scripted
  "already done" moment and nothing more.
- Snooze limits or escalation logic beyond "contact the owner." No invented medical windows.
- Any medical content whatsoever. All care instructions are attributed to owner/vet, verbatim, fictional.
- A watcher-facing AI assistant. AI never speaks at the moment of care.
- Gamification: points, streaks, confetti, celebration animations.
- A design-system documentation site. One token file (`tokens.css`) is the system.
- A second visual direction page. One direction, chosen, reasoning in a margin note.
- Per-second live countdown (mm:ss). Coarse calm time language; precision only in the final minutes.
- A `MISSED` state. Past-due is `DUE` with elapsed time. Verdicts belong to the owner's
  preferences, not the system.

## Rules for agents

1. Read this file before writing code.
2. Do not add features to demonstrate capability. Restraint is a scored criterion.
3. Domain layer (`domain/`) never touches the DOM. Presentation state never enters the event log.
4. If an implementation spike answers a product question, keep the finding, delete the spike.

// PetWatch Reconsidered, care moment domain core.
//
// Source of truth is an append-only event log per care moment. Status is
// derived from (moment, log, now), never stored. This one primitive carries
// attribution, the double-completion guard, the owner's summary view, and a
// future multi-watcher merge story without any sync infrastructure.
//
// Time: the demo passes plain ms timestamps, but every timestamp is understood
// to be anchored to the pet's household clock, not the viewer's. The owner
// crossing timezones must never move 7:15pm insulin. (Case study, ch. 6.)
//
// No DOM access in this file. Presentation state never enters the log.

/** @typedef {'upcoming'|'soon'|'due'|'snoozed'|'in_progress'|'needs_help'|'completed'} Status */

/**
 * @typedef {Object} CareMoment
 * @property {string} id
 * @property {string} title
 * @property {number} dueAt        ms, household clock
 * @property {'quick'|'guided'} depth   owner-authored, never inferred
 * @property {{src: string, body: string, stop?: string}[]} [steps]  guided only; owner/vet supplied
 * @property {string} [source]     attribution line, e.g. "From Mikel and Dr. Alvarez"
 * @property {string} [note]       owner context, e.g. the treat
 */

/**
 * @typedef {Object} CareEvent
 * @property {'snoozed'|'started'|'step_done'|'help_requested'|'help_resolved'|'completed'|'noted_already_done'} type
 * @property {number} at   ms, household clock
 * @property {string} by   person name/id
 * @property {number} [until]  snoozed only
 * @property {number} [step]   step_done only (index)
 */

export const SOON_WINDOW_MS = 15 * 60 * 1000;

/** Latest event of a given type, or null. @param {CareEvent[]} log */
const last = (log, type) => {
  for (let i = log.length - 1; i >= 0; i--) if (log[i].type === type) return log[i];
  return null;
};

/** @param {CareEvent[]} log @returns {CareEvent|null} */
export const completion = (log) => last(log, 'completed');

/** Active snooze target, or null. Latest snooze wins. @param {CareEvent[]} log */
export function snoozedUntil(log, now) {
  const s = last(log, 'snoozed');
  return s && s.until != null && s.until > now ? s.until : null;
}

/**
 * Derive status. Order of precedence encodes the product's judgments:
 * completion is final; asking for help suspends the flow without erasing
 * progress; an expired snooze is simply DUE again; past-due is DUE with
 * elapsed time, never a MISSED verdict.
 * @param {CareMoment} moment @param {CareEvent[]} log @param {number} now
 * @returns {Status}
 */
export function deriveStatus(moment, log, now) {
  if (completion(log)) return 'completed';
  const help = last(log, 'help_requested');
  const helpResolved = last(log, 'help_resolved');
  const started = last(log, 'started');
  // Resuming care supersedes an open help flag: picking the flow back up is
  // itself the resolution. (Surfaced by the reducer tests, case study, ch. 6.)
  const helpOpen =
    help && (!helpResolved || helpResolved.at < help.at) && (!started || started.at < help.at);
  if (helpOpen) return 'needs_help';
  if (started) return 'in_progress';
  if (snoozedUntil(log, now)) return 'snoozed';
  if (now >= moment.dueAt) return 'due';
  if (now >= moment.dueAt - SOON_WINDOW_MS) return 'soon';
  return 'upcoming';
}

/** Transitions the log will accept from each derived status. */
const ALLOWED = {
  upcoming: ['started'], // starting early is allowed; snoozing the far future is noise
  soon: ['started', 'snoozed'],
  due: ['started', 'snoozed', 'help_requested'],
  snoozed: ['started', 'snoozed', 'help_requested'],
  in_progress: ['step_done', 'help_requested', 'completed'],
  needs_help: ['help_resolved', 'started', 'completed'],
  completed: [],
};

/**
 * Append an event, validating the transition against derived status.
 * Returns a NEW log. Throws on an illegal transition so tests state the
 * product rules explicitly.
 * @param {CareMoment} moment @param {CareEvent[]} log @param {CareEvent} event
 * @returns {CareEvent[]}
 */
export function append(moment, log, event) {
  const status = deriveStatus(moment, log, event.at);
  const ok = ALLOWED[status] || [];
  if (!ok.includes(event.type)) {
    throw new Error(`illegal transition: ${event.type} while ${status} (${moment.id})`);
  }
  return [...log, event];
}

/**
 * The double-completion guard. A second completion attempt never appends a
 * second `completed`; it records `noted_already_done` and returns the prior
 * completion so the interface can say "Already done. Mikel, 7:05 AM."
 * @param {CareMoment} moment @param {CareEvent[]} log
 * @param {{by:string, at:number}} attempt
 * @returns {{log: CareEvent[], alreadyDone: CareEvent|null}}
 */
export function attemptComplete(moment, log, { by, at }) {
  const prior = completion(log);
  const noted = /** @type {CareEvent} */ ({ type: 'noted_already_done', by, at });
  if (prior) {
    return { log: [...log, noted], alreadyDone: prior };
  }
  const status = deriveStatus(moment, log, at);
  const started = /** @type {CareEvent} */ ({ type: 'started', by, at });
  const completed = /** @type {CareEvent} */ ({ type: 'completed', by, at });
  // A quick task can complete in one tap without a `started` event.
  const next =
    status === 'in_progress' || status === 'needs_help'
      ? append(moment, log, completed)
      : [...log, started, completed];
  return { log: next, alreadyDone: null };
}

/**
 * Calm time language. Coarse at distance, precise only inside the final
 * minutes. Never a ticking mm:ss. (Case study, ch. 4.)
 * @param {CareMoment} moment @param {CareEvent[]} log @param {number} now
 * @param {(ms:number)=>string} fmtClock  e.g. 7:15 PM, injected by the shell
 */
export function timePhrase(moment, log, now, fmtClock) {
  const status = deriveStatus(moment, log, now);
  if (status === 'completed') {
    const c = completion(log);
    return `Done at ${fmtClock(c.at)}`;
  }
  if (status === 'snoozed') return `I’ll remind you at ${fmtClock(snoozedUntil(log, now))}`;
  const diff = moment.dueAt - now;
  const min = Math.round(Math.abs(diff) / 60000);
  if (status === 'due') return min < 1 ? 'Now' : `Due ${min} min ago`;
  if (min <= 15) return `In about ${Math.max(1, min)} minutes`;
  if (min <= 90) return `At ${fmtClock(moment.dueAt)}, in about ${Math.round(min / 5) * 5} minutes`;
  return `At ${fmtClock(moment.dueAt)}`;
}

/**
 * The owner's surface: outcomes, not behavior. Completed / upcoming counts
 * and the last care line. Snoozes, step timings, and help taps are absent by
 * design, that is the surveillance line. (Case study, ch. 5 and 7.)
 * @param {{moment: CareMoment, log: CareEvent[]}[]} entries @param {number} now
 */
export function ownerSummary(entries, now) {
  const done = [];
  let open = 0;
  for (const { moment, log } of entries) {
    const c = completion(log);
    if (c) done.push({ title: moment.title, at: c.at, by: c.by });
    else open++;
  }
  done.sort((a, b) => a.at - b.at);
  const lastCare = done.length ? done[done.length - 1] : null;
  return { done, open, lastCare, allGood: entries.length > 0 && open === 0 };
}

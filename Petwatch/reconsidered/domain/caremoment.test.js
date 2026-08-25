// Product questions in executable form. Each test is a rule the case study
// defends; if a rule changes, the test changes with the chapter.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveStatus,
  append,
  attemptComplete,
  snoozedUntil,
  timePhrase,
  ownerSummary,
} from './caremoment.js';

const MIN = 60000;
const T0 = 10 * 60 * MIN; // arbitrary epoch for a demo day
const insulin = {
  id: 'insulin-pm',
  title: 'Hex’s insulin',
  dueAt: T0 + 120 * MIN,
  depth: 'guided',
};
const water = { id: 'water', title: 'Refresh water', dueAt: T0 + 30 * MIN, depth: 'quick' };
const clock = (ms) => `t+${Math.round((ms - T0) / MIN)}m`;

test('clock alone moves upcoming → soon → due', () => {
  assert.equal(deriveStatus(insulin, [], insulin.dueAt - 60 * MIN), 'upcoming');
  assert.equal(deriveStatus(insulin, [], insulin.dueAt - 10 * MIN), 'soon');
  assert.equal(deriveStatus(insulin, [], insulin.dueAt), 'due');
});

test('past-due stays DUE, there is no MISSED verdict', () => {
  assert.equal(deriveStatus(insulin, [], insulin.dueAt + 45 * MIN), 'due');
  assert.match(timePhrase(insulin, [], insulin.dueAt + 20 * MIN, clock), /Due 20 min ago/);
});

test('snooze holds, then returns to DUE on expiry', () => {
  const at = insulin.dueAt + MIN;
  const log = append(insulin, [], { type: 'snoozed', at, by: 'Sam', until: at + 10 * MIN });
  assert.equal(deriveStatus(insulin, log, at + 5 * MIN), 'snoozed');
  assert.equal(snoozedUntil(log, at + 5 * MIN), at + 10 * MIN);
  assert.equal(deriveStatus(insulin, log, at + 11 * MIN), 'due');
});

test('repeated snoozing is allowed and the latest wins', () => {
  const at = insulin.dueAt;
  let log = append(insulin, [], { type: 'snoozed', at, by: 'Sam', until: at + 5 * MIN });
  log = append(insulin, log, {
    type: 'snoozed',
    at: at + 5 * MIN,
    by: 'Sam',
    until: at + 15 * MIN,
  });
  assert.equal(snoozedUntil(log, at + 6 * MIN), at + 15 * MIN);
});

test('snoozed moment can still be started early', () => {
  const at = insulin.dueAt;
  let log = append(insulin, [], { type: 'snoozed', at, by: 'Sam', until: at + 10 * MIN });
  log = append(insulin, log, { type: 'started', at: at + 2 * MIN, by: 'Sam' });
  assert.equal(deriveStatus(insulin, log, at + 3 * MIN), 'in_progress');
});

test('guided flow: start → steps → complete, with attribution', () => {
  const at = insulin.dueAt;
  let log = append(insulin, [], { type: 'started', at, by: 'Sam' });
  log = append(insulin, log, { type: 'step_done', step: 0, at: at + MIN, by: 'Sam' });
  const r = attemptComplete(insulin, log, { by: 'Sam', at: at + 4 * MIN });
  assert.equal(r.alreadyDone, null);
  assert.equal(deriveStatus(insulin, r.log, at + 5 * MIN), 'completed');
});

test('help is reachable from DUE and IN_PROGRESS, and is not terminal', () => {
  const at = insulin.dueAt;
  let log = append(insulin, [], { type: 'help_requested', at, by: 'Sam' });
  assert.equal(deriveStatus(insulin, log, at), 'needs_help');
  log = append(insulin, log, { type: 'started', at: at + 3 * MIN, by: 'Sam' });
  assert.equal(deriveStatus(insulin, log, at + 3 * MIN), 'in_progress');
  const r = attemptComplete(insulin, log, { by: 'Sam', at: at + 6 * MIN });
  assert.equal(deriveStatus(insulin, r.log, at + 7 * MIN), 'completed');
});

test('asking for help mid-care preserves progress', () => {
  const at = insulin.dueAt;
  let log = append(insulin, [], { type: 'started', at, by: 'Sam' });
  log = append(insulin, log, { type: 'step_done', step: 0, at: at + MIN, by: 'Sam' });
  log = append(insulin, log, { type: 'help_requested', at: at + 2 * MIN, by: 'Sam' });
  assert.equal(deriveStatus(insulin, log, at + 2 * MIN), 'needs_help');
  assert.ok(log.some((e) => e.type === 'step_done')); // nothing erased
});

test('double-completion guard: second attempt reports, never re-completes', () => {
  const first = attemptComplete(water, [], { by: 'Mikel', at: water.dueAt });
  const second = attemptComplete(water, first.log, { by: 'Sam', at: water.dueAt + 60 * MIN });
  assert.ok(second.alreadyDone);
  assert.equal(second.alreadyDone.by, 'Mikel');
  assert.equal(second.log.filter((e) => e.type === 'completed').length, 1);
  assert.equal(second.log.at(-1).type, 'noted_already_done');
});

test('completion is final: no snooze or start afterwards', () => {
  const { log } = attemptComplete(water, [], { by: 'Sam', at: water.dueAt });
  assert.throws(() =>
    append(water, log, {
      type: 'snoozed',
      at: water.dueAt + MIN,
      by: 'Sam',
      until: water.dueAt + 9 * MIN,
    }),
  );
  assert.throws(() => append(water, log, { type: 'started', at: water.dueAt + MIN, by: 'Sam' }));
});

test('quick task completes in one tap without a prior started event', () => {
  const { log } = attemptComplete(water, [], { by: 'Sam', at: water.dueAt + MIN });
  assert.equal(deriveStatus(water, log, water.dueAt + 2 * MIN), 'completed');
});

test('snoozing the far future is rejected as noise', () => {
  assert.throws(() =>
    append(insulin, [], {
      type: 'snoozed',
      at: insulin.dueAt - 60 * MIN,
      by: 'Sam',
      until: insulin.dueAt,
    }),
  );
});

test('calm time language: coarse at distance, precise near, never mm:ss', () => {
  assert.match(timePhrase(insulin, [], insulin.dueAt - 4 * 60 * MIN, clock), /^At t\+120m$/);
  assert.match(timePhrase(insulin, [], insulin.dueAt - 60 * MIN, clock), /in about 60 minutes/);
  assert.match(timePhrase(insulin, [], insulin.dueAt - 6 * MIN, clock), /In about 6 minutes/);
  assert.equal(timePhrase(insulin, [], insulin.dueAt, clock), 'Now');
});

test('owner summary shows outcomes, never snoozes or help taps', () => {
  const at = insulin.dueAt;
  let insulinLog = append(insulin, [], { type: 'snoozed', at, by: 'Sam', until: at + 10 * MIN });
  insulinLog = append(insulin, insulinLog, { type: 'started', at: at + 10 * MIN, by: 'Sam' });
  insulinLog = attemptComplete(insulin, insulinLog, { by: 'Sam', at: at + 14 * MIN }).log;
  const waterLog = [];
  const s = ownerSummary(
    [
      { moment: insulin, log: insulinLog },
      { moment: water, log: waterLog },
    ],
    at + 20 * MIN,
  );
  assert.equal(s.open, 1);
  assert.equal(s.allGood, false);
  assert.equal(s.lastCare.by, 'Sam');
  assert.equal(s.lastCare.title, 'Hex’s insulin');
  assert.ok(!JSON.stringify(s).includes('snooze')); // structurally absent
});

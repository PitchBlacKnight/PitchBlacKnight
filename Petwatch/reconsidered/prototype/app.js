// PetWatch Reconsidered, prototype presentation layer.
// Domain rules live in ../domain/caremoment.js and never touch the DOM.
// Presentation state (which sheet is open, toast timers, guided step index)
// lives here and never enters the event log.
import {
  deriveStatus,
  append,
  attemptComplete,
  snoozedUntil,
  timePhrase,
  ownerSummary,
} from '../domain/caremoment.js';

/* ----- fixtures: one stay, one cat, one nervous friend ----- */
const MIN = 60000;
const HOUR = 60 * MIN;
const at = (h, m = 0) => h * HOUR + m * MIN;

const WATCHER = 'Sam';
const OWNER = 'Mikel';

/** @type {import('../domain/caremoment.js').CareMoment[]} */
const MOMENTS = [
  {
    id: 'breakfast',
    title: 'Breakfast',
    dueAt: at(7, 0),
    depth: 'quick',
    note: 'Half a scoop, the small bowl. He will yell for more. Hold firm.',
  },
  {
    id: 'insulin-am',
    title: 'Hex’s morning insulin',
    dueAt: at(7, 15),
    depth: 'guided',
    note: 'After breakfast, never before.',
  },
  {
    id: 'dinner',
    title: 'Dinner',
    dueAt: at(18, 0),
    depth: 'quick',
    note: 'Same half scoop. Insulin comes after, he needs food first.',
  },
  {
    id: 'water',
    title: 'Refresh water',
    dueAt: at(18, 30),
    depth: 'quick',
    note: 'Rinse the bowl, cold water. He won’t drink day-old.',
  },
  {
    id: 'insulin-pm',
    title: 'Hex’s evening insulin',
    dueAt: at(19, 15),
    depth: 'guided',
    note: 'The routine Mikel showed you on Sunday.',
    source: 'From Mikel and Dr. Alvarez, Larchmont Veterinary',
    steps: [
      {
        src: 'From Mikel',
        body: 'Get a <strong>Churu treat</strong> from the fridge door and open it. Hex comes to the sound, let him start on it on the counter.',
      },
      {
        src: 'From Mikel and Dr. Alvarez',
        body: 'Check his dinner bowl. <strong>Insulin goes after he’s eaten.</strong>',
        stop: 'If he hasn’t touched his food, stop here and text Mikel. That’s the plan, not a failure.',
      },
      {
        src: 'From Dr. Alvarez',
        body: 'The pen is in the <strong>red pouch</strong>, top shelf of the fridge. The dose is already set on the dial, <strong>don’t change it</strong>.',
      },
      {
        src: 'From Mikel',
        body: 'While he’s on the treat, follow the <strong>injection card in the pouch</strong>, the same steps Mikel walked you through on Sunday.',
      },
      {
        src: 'From Mikel',
        body: 'Cap back on, pouch back in the fridge. Give him the rest of the treat. <strong>That’s it.</strong>',
      },
    ],
  },
];

const KNOW = [
  {
    k: 'RUNNER',
    tone: 'warm',
    v: '<strong>Watch exterior doors.</strong> Hex is quick and quiet when he sees a gap, check where he is before you open the front door.',
  },
  {
    k: 'HIDES',
    tone: 'calm',
    v: 'If you can’t find him: <strong>under the bed, left side</strong>, behind the storage box. He’s not lost.',
  },
  {
    k: 'YES',
    tone: 'calm',
    v: '<strong>Churu treats, fridge door.</strong> His yes to anything, including the parts of the evening he likes less.',
  },
  {
    k: 'DOORS',
    tone: 'calm',
    v: 'The <strong>balcony door stays shut</strong>. He’s allowed everywhere else.',
  },
];

const CONTACTS = [
  { name: 'Mikel', detail: 'He’d rather get a text than a surprise', action: 'Text' },
  { name: 'Dr. Alvarez, Larchmont Veterinary', detail: 'Open until 8:00 PM', action: 'Call' },
  { name: 'VEG on Sepulveda', detail: '24-hour emergency', action: 'Call' },
];

/* ----- state ----- */
const logs = new Map(MOMENTS.map((m) => [m.id, []]));
const START = at(17, 45);
let now = START;

// Mikel handled the morning before his flight; the guard demo depends on it.
function seedMorning() {
  logs.set('breakfast', attemptComplete(byId('breakfast'), [], { by: OWNER, at: at(7, 5) }).log);
  logs.set('insulin-am', attemptComplete(byId('insulin-am'), [], { by: OWNER, at: at(7, 12) }).log);
}
const byId = (id) => MOMENTS.find((m) => m.id === id);
const statusOf = (m) => deriveStatus(m, logs.get(m.id), now);

const ui = {
  owner: false,
  view: 'home', // home | guided | relief
  guidedId: null,
  guidedStep: 0,
  sheet: null, // {type:'due'|'know'|'help'|'already', ...}
  knowOpen: true, // first open of the session: Know Hex starts expanded
  reliefOf: null,
  toast: null,
};
let prevStatus = new Map();
let toastTimer = null;

/* ----- helpers ----- */
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => s; // fixture strings are trusted markup written in this file

function fmtClock(ms) {
  const mins = Math.round(ms / MIN) % (24 * 60);
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const half = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${half}`;
}
const fmtShort = (ms) => fmtClock(ms).replace(/ (AM|PM)/, '');

function announce(text) {
  $('#live').textContent = text;
}

function toast(text, undoFn) {
  ui.toast = { text, undoFn };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    ui.toast = null;
    render();
  }, 6000);
  render();
}

function hexAvatar(size) {
  return `<img class="avatar" src="../assets/hex-face.jpg" width="${size}" height="${size}"
    alt="Hex, a black cat with green eyes">`;
}

/* ----- clock ----- */
function setClock(next) {
  const before = new Map(MOMENTS.map((m) => [m.id, statusOf(m)]));
  now = next;
  $('#clock-display').textContent = fmtClock(now);
  $('#sb-time').textContent = fmtShort(now);
  // a moment newly arriving at DUE presents itself once, calmly
  for (const m of MOMENTS) {
    const was = before.get(m.id);
    const is = statusOf(m);
    if (is === 'due' && was !== 'due' && ui.view === 'home' && !ui.owner) {
      ui.sheet = { type: 'due', id: m.id };
      announce(`It’s time for ${m.title}.`);
    } else if (is === 'soon' && was === 'upcoming') {
      announce(`${m.title} is coming up in about 15 minutes.`);
    }
  }
  render();
}

function nextTarget() {
  let best = null;
  for (const m of MOMENTS) {
    const s = statusOf(m);
    if (s === 'completed') continue;
    const t = snoozedUntil(logs.get(m.id), now) ?? m.dueAt;
    if (t > now && (best === null || t < best)) best = t;
  }
  return best;
}

/* ----- actions ----- */
function doSnooze(id, minutes) {
  const m = byId(id);
  const until = now + minutes * MIN;
  logs.set(m.id, append(m, logs.get(m.id), { type: 'snoozed', at: now, by: WATCHER, until }));
  ui.sheet = null;
  announce(`Snoozed. I’ll remind you at ${fmtClock(until)}.`);
  toast(`No problem. I’ll remind you again at ${fmtClock(until)}.`);
}

function doQuickComplete(id) {
  const m = byId(id);
  const before = logs.get(m.id);
  const r = attemptComplete(m, before, { by: WATCHER, at: now });
  logs.set(m.id, r.log);
  if (r.alreadyDone) {
    ui.sheet = { type: 'already', id, prior: r.alreadyDone };
    render();
    return;
  }
  ui.sheet = null;
  announce(`${m.title} done.`);
  toast(`${m.title}, done at ${fmtClock(now)}.`, () => {
    logs.set(m.id, before);
    announce(`${m.title} restored.`);
  });
}

function startGuided(id) {
  const m = byId(id);
  logs.set(m.id, append(m, logs.get(m.id), { type: 'started', at: now, by: WATCHER }));
  ui.view = 'guided';
  ui.guidedId = id;
  ui.guidedStep = -1; // -1 = the reassurance intro
  ui.sheet = null;
  render();
  $('#screen').focus();
}

function guidedNext() {
  const m = byId(ui.guidedId);
  if (ui.guidedStep >= 0) {
    logs.set(
      m.id,
      append(m, logs.get(m.id), { type: 'step_done', step: ui.guidedStep, at: now, by: WATCHER }),
    );
  }
  if (ui.guidedStep < m.steps.length - 1) {
    ui.guidedStep += 1;
    render();
  } else {
    const r = attemptComplete(m, logs.get(m.id), { by: WATCHER, at: now });
    logs.set(m.id, r.log);
    ui.view = 'relief';
    ui.reliefOf = m.id;
    announce(`${m.title} completed. Mikel can see that it’s done.`);
    render();
  }
}

function openHelp(from) {
  const id = ui.guidedId ?? ui.sheet?.id;
  if (id) {
    const m = byId(id);
    try {
      logs.set(m.id, append(m, logs.get(m.id), { type: 'help_requested', at: now, by: WATCHER }));
    } catch {
      /* already in a state where help is implicit (e.g. soon), the sheet still opens */
    }
  }
  ui.sheet = { type: 'help', from, id };
  render();
}

function closeHelp() {
  const { from, id } = ui.sheet;
  if (id) {
    const m = byId(id);
    if (deriveStatus(m, logs.get(m.id), now) === 'needs_help') {
      logs.set(m.id, append(m, logs.get(m.id), { type: 'help_resolved', at: now, by: WATCHER }));
    }
  }
  ui.sheet = from === 'due' && id ? { type: 'due', id } : null;
  render();
}

/* ----- renderers ----- */
let openSheetKey = null;
function render() {
  const screen = $('#screen');
  if (ui.owner) screen.innerHTML = renderOwner();
  else if (ui.view === 'guided') screen.innerHTML = renderGuided();
  else if (ui.view === 'relief') screen.innerHTML = renderRelief();
  else screen.innerHTML = renderHome();
  const sheetOpen = !!ui.sheet && !ui.owner;
  $('#overlay').innerHTML = sheetOpen ? renderSheet() : '';
  // Sheets are modal within the phone: the screen behind the scrim goes
  // inert, and focus moves into a newly opened (or swapped) sheet.
  screen.toggleAttribute('inert', sheetOpen);
  const key = sheetOpen ? `${ui.sheet.type}:${ui.sheet.id ?? ''}` : null;
  if (key && key !== openSheetKey) $('#overlay .sheet button')?.focus();
  openSheetKey = key;
  $('#toast-slot').innerHTML = ui.toast
    ? `<div class="toast">${ui.toast.text}${ui.toast.undoFn ? '<button type="button" data-act="undo">Undo</button>' : ''}</div>`
    : '';
}

function greeting() {
  const h = Math.floor(now / HOUR) % 24;
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
}

function renderHome() {
  const open = MOMENTS.filter((m) => statusOf(m) !== 'completed').sort((a, b) => a.dueAt - b.dueAt);
  const done = MOMENTS.filter((m) => statusOf(m) === 'completed').sort(
    (a, b) =>
      logs.get(a.id).find((e) => e.type === 'completed').at -
      logs.get(b.id).find((e) => e.type === 'completed').at,
  );
  const next = open.find((m) => statusOf(m) === 'due') || open[0];
  const later = open.filter((m) => m !== next);

  return `
    <h2 class="greet">${greeting()}, ${WATCHER}.</h2>
    <p class="greet-sub">Day 1 of 5 with Hex · Mikel is traveling</p>

    <div class="pethead" data-note="runner">
      ${hexAvatar(46)}
      <div>
        <div class="pname">Hexadecimal</div>
        <div class="pmeta">“Hex” · black cat · 4</div>
      </div>
      <button type="button" class="chip-runner" data-act="know" aria-label="Runner, Hex bolts through open doors. Open Know Hex.">⚡ RUNNER</button>
    </div>

    ${next ? renderNextCard(next) : ''}

    ${
      later.length
        ? `
      <h3 class="sec-label">Later today <span class="rule"></span></h3>
      <ul class="mlist">${later.map((m) => renderRow(m)).join('')}</ul>`
        : ''
    }

    ${
      done.length
        ? `
      <h3 class="sec-label">Done <span class="rule"></span></h3>
      <ul class="mlist">${done.map((m) => renderRow(m)).join('')}</ul>`
        : ''
    }

    <h3 class="sec-label">Know Hex <span class="rule"></span></h3>
    <details class="know" ${ui.knowOpen ? 'open' : ''} data-note="runner">
      <summary>The things Mikel knows without thinking <span class="hint">always here</span></summary>
      ${KNOW.map(
        (k) => `
        <div class="know-item">
          <span class="k ${k.tone === 'calm' ? 'calm' : ''}">${k.k}</span>
          <span class="v">${k.v}</span>
        </div>`,
      ).join('')}
      <div class="know-item">
        <span class="k calm">HELP</span>
        <span class="v">Unsure about anything? <strong>Text Mikel.</strong> He’d rather get ten texts than one surprise.</span>
      </div>
    </details>`;
}

function renderNextCard(m) {
  const s = statusOf(m);
  const phrase = timePhrase(m, logs.get(m.id), now, fmtClock);
  const quiet = s === 'upcoming';
  const actions =
    s === 'due'
      ? m.depth === 'guided'
        ? `<button type="button" class="btn btn-primary" data-act="start" data-id="${m.id}">Start care</button>
           <button type="button" class="btn" data-act="due-sheet" data-id="${m.id}">Snooze…</button>`
        : `<button type="button" class="btn btn-primary" data-act="complete" data-id="${m.id}">Mark done</button>
           <button type="button" class="btn" data-act="due-sheet" data-id="${m.id}">Snooze…</button>`
      : s === 'snoozed'
        ? `<button type="button" class="btn" data-act="${m.depth === 'guided' ? 'start' : 'complete'}" data-id="${m.id}">Do it now</button>`
        : '';
  return `
    <div class="next-card ${s === 'due' ? 'is-due' : ''} ${quiet ? 'is-quiet' : ''}" data-note="time">
      <div class="when">${s === 'due' ? 'NOW · ' : ''}${phrase}</div>
      <h3>${m.title}</h3>
      <div class="cnote">${m.note}</div>
      ${actions ? `<div class="actions" data-note="snooze">${actions}</div>` : ''}
    </div>`;
}

function renderRow(m) {
  const s = statusOf(m);
  if (s === 'completed') {
    const c = logs.get(m.id).find((e) => e.type === 'completed');
    return `<li class="mrow is-done">
      <button type="button" class="checkbtn is-done" data-act="complete" data-id="${m.id}" aria-label="${m.title}, already done by ${c.by}">✓</button>
      <div><div class="tt">${m.title}</div>
      <div class="ts">${fmtClock(c.at)} · <span class="by">${c.by}</span></div></div>
    </li>`;
  }
  return `<li class="mrow">
    <button type="button" class="checkbtn" data-act="${m.depth === 'guided' ? 'start' : 'complete'}" data-id="${m.id}" aria-label="Mark ${m.title} done">✓</button>
    <div><div class="tt">${m.title}</div>
    <div class="ts">${timePhrase(m, logs.get(m.id), now, fmtClock)}</div></div>
  </li>`;
}

function renderSheet() {
  const s = ui.sheet;
  if (s.type === 'due') {
    const m = byId(s.id);
    const guided = m.depth === 'guided';
    return `<div class="scrim" data-act="dismiss-scrim">
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-h" data-stop>
        <div class="grab"></div>
        <h3 id="sheet-h">It’s time for ${m.title}.</h3>
        <p class="sub">${m.note}</p>
        ${m.source ? `<p class="sub" style="margin-top:8px" data-note="source"><em>${m.source}</em></p>` : ''}
        <div class="actions">
          <button type="button" class="btn btn-primary" data-act="${guided ? 'start' : 'complete'}" data-id="${m.id}">${guided ? 'Start care' : 'Mark done'}</button>
          <div class="microlabel" data-note="snooze">Can’t right now? I’ll hold it.</div>
          <div class="snoozerow">
            <button type="button" class="btn" data-act="snooze" data-id="${m.id}" data-min="5">5 min</button>
            <button type="button" class="btn" data-act="snooze" data-id="${m.id}" data-min="10">10 min</button>
            <button type="button" class="btn" data-act="snooze" data-id="${m.id}" data-min="15">15 min</button>
          </div>
          ${guided ? `<button type="button" class="btn-quiet" data-act="help" data-from="due">Something isn’t right</button>` : ''}
        </div>
      </div></div>`;
  }
  if (s.type === 'know') {
    return `<div class="scrim" data-act="dismiss-scrim">
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-h" data-stop>
        <div class="grab"></div>
        <h3 id="sheet-h">Know Hex</h3>
        <p class="sub">The things Mikel knows without thinking. Always one tap away, never an interruption.</p>
        <div style="margin-top:14px">
        ${KNOW.map(
          (k) => `
          <div class="know-item">
            <span class="k ${k.tone === 'calm' ? 'calm' : ''}">${k.k}</span>
            <span class="v">${k.v}</span>
          </div>`,
        ).join('')}
        </div>
        <div class="actions"><button type="button" class="btn" data-act="dismiss">Got it</button></div>
      </div></div>`;
  }
  if (s.type === 'help') {
    return `<div class="scrim">
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-h" data-stop data-note="help">
        <div class="grab"></div>
        <h3 id="sheet-h">Asking is the right move.</h3>
        <p class="sub">If Hex seems off, don’t guess. Nothing here resets, your progress is exactly where you left it.</p>
        <div style="margin-top:14px">
          ${CONTACTS.map(
            (c) => `
            <div class="know-item">
              <span class="k calm">${c.action.toUpperCase()}</span>
              <span class="v"><strong>${c.name}</strong><br>${c.detail}</span>
            </div>`,
          ).join('')}
        </div>
        <div class="actions">
          <button type="button" class="btn btn-primary" data-act="fake-text">Text Mikel</button>
          <button type="button" class="btn" data-act="close-help">Back to ${ui.view === 'guided' ? 'care' : 'the moment'}</button>
        </div>
      </div></div>`;
  }
  if (s.type === 'already') {
    const m = byId(s.id);
    return `<div class="scrim" data-act="dismiss-scrim">
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-h" data-stop>
        <div class="grab"></div>
        <h3 id="sheet-h">Already done.</h3>
        <p class="sub"><strong>${m.title}</strong>, ${s.prior.by} took care of it at ${fmtClock(s.prior.at)}. Nothing was recorded twice; ${m.title.toLowerCase().includes('insulin') ? 'the guard exists so a pet is never medicated twice.' : 'the record stays single and attributed.'}</p>
        <div class="actions"><button type="button" class="btn" data-act="dismiss">Good to know</button></div>
      </div></div>`;
  }
  return '';
}

function renderGuided() {
  const m = byId(ui.guidedId);
  const total = m.steps.length;
  const i = ui.guidedStep;
  const intro = i === -1;
  const step = intro ? null : m.steps[i];
  return `<div class="guided">
    <div class="ghead">
      <button type="button" class="back" data-act="exit-guided">← Not now</button>
      <span class="gcrumb">${intro ? 'GUIDED CARE' : `STEP ${i + 1} OF ${total}`}</span>
    </div>
    <h2>${m.title}</h2>
    <p class="reassure">${intro ? 'You’ve got this. Hex knows the routine even when it’s new to you.' : ''}</p>
    ${
      intro
        ? `<div class="stepcard" data-note="source">
          <span class="src">${m.source}</span>
          <div class="body">Five short steps, one at a time. These are Mikel’s and the vet’s words, PetWatch doesn’t write care instructions.</div>
        </div>`
        : `<div class="stepcard" ${step.stop ? `data-note="stop"` : `data-note="source"`}>
          <span class="src">${step.src}</span>
          <div class="body">${step.body}</div>
          ${step.stop ? `<div class="stopnote">${step.stop}</div>` : ''}
        </div>`
    }
    <div class="dots" aria-hidden="true">${Array.from({ length: total }, (_, d) => `<i class="${!intro && d <= i ? 'on' : ''}"></i>`).join('')}</div>
    <div class="gactions">
      <button type="button" class="btn btn-primary" data-act="guided-next">
        ${intro ? 'Begin' : i === total - 1 ? 'Done, Hex is all set' : 'Done, next'}
      </button>
    </div>
    <div class="gfoot" data-note="help">
      <button type="button" class="btn-quiet" data-act="help" data-from="guided">Something isn’t right</button>
    </div>
  </div>`;
}

function renderRelief() {
  const m = byId(ui.reliefOf);
  const c = logs.get(m.id).find((e) => e.type === 'completed');
  return `<div class="relief" data-note="relief">
    <div class="ring" aria-hidden="true">✓</div>
    <h2>All taken care of.</h2>
    <div class="what"><strong>${m.title}</strong></div>
    <div class="meta">${fmtClock(c.at)} · Completed by ${c.by}</div>
    <p class="owner-sees">Mikel can see that it’s done.</p>
    <div style="margin-top:30px">
      <button type="button" class="btn" data-act="go-home">Back to the evening</button>
    </div>
  </div>`;
}

function renderOwner() {
  const entries = MOMENTS.map((m) => ({ moment: m, log: logs.get(m.id) }));
  const s = ownerSummary(entries, now);
  return `
    <div class="ownerband" data-note="ownergran">MIKEL’S VIEW · 1:45 AM in Lisbon · Hex’s schedule stays on the household clock</div>
    <h2 class="allgood">${s.allGood ? 'Hex is all good.' : s.open === 1 ? 'One thing left today.' : `${s.open} things left today.`}</h2>
    <p class="o-sub">Sam has it covered. You’ll see each moment here as it’s done.</p>
    <div>
      ${MOMENTS.map((m) => {
        const c = logs.get(m.id).find((e) => e.type === 'completed');
        return `<div class="orow">
          <span class="tt">${m.title}</span>
          <span class="st ${c ? 'done' : ''}">${c ? `Completed ${fmtClock(c.at)} · ${c.by}` : `at ${fmtClock(m.dueAt)}`}</span>
        </div>`;
      }).join('')}
    </div>
    ${s.lastCare ? `<p class="lastcare">Last care: <strong>${s.lastCare.title}</strong> at ${fmtClock(s.lastCare.at)} by ${s.lastCare.by}</p>` : ''}
    <p class="o-fine" data-note="ownergran">This view shows outcomes only. Snoozes, steps, and timing between them belong to Sam, and Sam knows exactly what you can see.</p>`;
}

/* ----- events ----- */
document.addEventListener('click', (e) => {
  const target = /** @type {HTMLElement} */ (e.target);
  const t = /** @type {HTMLElement|null} */ (
    target.closest('[data-act], [data-tick], [data-try], [data-spot]')
  );
  if (!t) return;

  if (t.dataset.tick) return setClock(now + Number(t.dataset.tick) * MIN);
  if (t.dataset.try) return runScript(t.dataset.try);
  if (t.dataset.spot) return toggleNote(t);

  const act = t.dataset.act;
  const id = t.dataset.id;
  switch (act) {
    case 'complete':
      doQuickComplete(id);
      break;
    case 'start':
      startGuided(id);
      break;
    case 'snooze':
      doSnooze(id, Number(t.dataset.min));
      break;
    case 'due-sheet':
      ui.sheet = { type: 'due', id };
      render();
      break;
    case 'know':
      ui.sheet = { type: 'know' };
      render();
      break;
    case 'help':
      openHelp(t.dataset.from);
      break;
    case 'close-help':
      closeHelp();
      break;
    case 'fake-text':
      ui.sheet = null;
      toast('Message to Mikel drafted, the prototype stops here on purpose.');
      break;
    case 'guided-next':
      guidedNext();
      break;
    case 'exit-guided':
      // leaving guided keeps progress; the moment stays in progress on home
      ui.view = 'home';
      ui.guidedId = null;
      render();
      break;
    case 'go-home':
      ui.view = 'home';
      ui.knowOpen = false;
      render();
      break;
    case 'dismiss':
      ui.sheet = null;
      render();
      break;
    case 'dismiss-scrim':
      if (e.target === t) {
        ui.sheet = null;
        render();
      }
      break;
    case 'undo':
      if (ui.toast?.undoFn) ui.toast.undoFn();
      ui.toast = null;
      clearTimeout(toastTimer);
      render();
      break;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && ui.sheet) {
    if (ui.sheet.type === 'help') closeHelp();
    else {
      ui.sheet = null;
      render();
    }
  }
});

$('#jump-next').addEventListener('click', () => {
  const t = nextTarget();
  setClock(t ?? now + 15 * MIN);
});
$('#reset-day').addEventListener('click', () => {
  MOMENTS.forEach((m) => logs.set(m.id, []));
  seedMorning();
  Object.assign(ui, {
    view: 'home',
    sheet: null,
    guidedId: null,
    reliefOf: null,
    toast: null,
    knowOpen: true,
  });
  setClock(START);
});
$('#owner-toggle').addEventListener('click', (e) => {
  ui.owner = !ui.owner;
  e.currentTarget.setAttribute('aria-pressed', String(ui.owner));
  ui.sheet = null;
  render();
});

/* scripted demo moments */
function runScript(name) {
  if (ui.owner) {
    ui.owner = false;
    $('#owner-toggle').setAttribute('aria-pressed', 'false');
  }
  ui.view = 'home';
  ui.sheet = null;
  ui.knowOpen = false;
  if (name === 'dinner') {
    if (statusOf(byId('dinner')) === 'completed') $('#reset-day').click();
    setClock(at(18, 0));
  } else if (name === 'already') {
    render();
    doQuickComplete('breakfast');
  } else if (name === 'insulin') {
    if (statusOf(byId('insulin-pm')) === 'completed') $('#reset-day').click();
    settleEvening();
    setClock(Math.max(now, at(19, 15)));
  } else if (name === 'help') {
    if (statusOf(byId('insulin-pm')) === 'completed') $('#reset-day').click();
    settleEvening();
    if (now < at(19, 15)) setClock(at(19, 15));
    startGuided('insulin-pm');
    ui.guidedStep = 0;
    render();
  }
}

// Jumping straight to 7:15 shouldn't leave the story littered with overdue
// chores: Sam handled dinner and water on time before the insulin moment.
function settleEvening() {
  const settled = [
    { id: 'dinner', doneAt: at(18, 5) },
    { id: 'water', doneAt: at(18, 32) },
  ];
  for (const { id, doneAt } of settled) {
    if (statusOf(byId(id)) !== 'completed') {
      logs.set(id, attemptComplete(byId(id), logs.get(id), { by: WATCHER, at: doneAt }).log);
    }
  }
}

/* design-note spotlights */
let spotTimer = null;
function toggleNote(btn) {
  const open = btn.getAttribute('aria-expanded') === 'true';
  document
    .querySelectorAll('.notes [aria-expanded="true"]')
    .forEach((b) => b.setAttribute('aria-expanded', 'false'));
  document.querySelectorAll('.spot').forEach((el) => el.classList.remove('spot'));
  clearTimeout(spotTimer);
  if (!open) {
    btn.setAttribute('aria-expanded', 'true');
    const targets = document.querySelectorAll(btn.dataset.spot);
    targets.forEach((el) => el.classList.add('spot'));
    spotTimer = setTimeout(
      () => document.querySelectorAll('.spot').forEach((el) => el.classList.remove('spot')),
      4000,
    );
  }
}

/* ----- go ----- */
seedMorning();
setClock(START);

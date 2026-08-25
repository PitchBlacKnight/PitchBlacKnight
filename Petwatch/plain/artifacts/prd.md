# PetWatch - Product Definition, v1

**Status:** Draft for team review
**Author:** Mikel Rosenthal (Product Design)
**Reviewers needed:** Product strategy, TPM, Eng lead, QA
**Last updated:** Day 1

---

## 1. The problem, stated honestly

Someone leaves town. They love an animal that cannot be left alone. They ask a
person they trust to step in.

Both people are uncomfortable. The owner is anxious and absent - they cannot see
what is happening, and the thing they care about cannot tell them. The sitter is
uncertain and exposed - they have been handed responsibility for something
irreplaceable, with instructions that are usually a text message, a note on the
counter, or a half-remembered conversation at the door.

**PetWatch exists to take those instructions off the counter and put them somewhere
both people can trust.**

## 2. The gap in the current scope

The user stories as written describe a complete, sensible app: accounts, pets,
schedules, invitations. Nothing in them contradicts anything else, and a team
could build them exactly as written without hitting a single problem.

It also cannot be completed. Read the Care Schedule stories in sequence:

> *"…so sitters know exactly what to do."*
> *"…I want to view the pet's care schedule clearly so I can follow or manage the routine."*

The owner writes the schedule. The sitter reads it. **And that's where it ends -
nobody can ever mark a task as done, and no news ever travels back to the owner.**
Read every story again: the word "done" never appears.

This has three consequences, in increasing order of severity:

1. **The owner doesn't get what they actually came for.** Nobody wants a schedule.
   They want to stop worrying. A schedule with no way to confirm anything happened
   doesn't calm an anxious person down - it hands them an itemized list of things
   to worry about.

2. **The sitter doesn't get what they need either.** Their private worry isn't
   "what do I do" - it's "what if I get it wrong and they blame me." Being able to
   show a record of everything they did is protection, and right now the app gives
   them no way to create one.

3. **It is genuinely unsafe.** The brief allows several sitters for one pet, and
   lists medication as a type of task. Picture it: two sitters, one read-only
   schedule, and a dog that gets a pill twice a day. Neither sitter can see that
   the other already gave it. That's not a missing feature - that's a vet visit
   waiting to happen.

### The proposal

Add the ability to **mark a task done**, and a **shared log of what's been done**.
In engineering terms this is tiny - a checkbox, a time, and a name. But it changes
what the product *is*:

| | Without completion | With completion |
|---|---|---|
| What the owner gets | A copy of their own instructions | Evidence |
| What the sitter gets | A list of obligations | A record of having done it |
| What happens with 2 sitters | Ambiguity, duplicate care | "Sam fed Kenji at 7:12am" |
| Product category | Schedule viewer | Trust instrument |

**Everything else in this document follows from that decision.**

### The honest counter-argument

Checking off tasks can feel like being watched. The sitter is doing the owner a
*favor* - they're not an employee. If the app makes a friend feel monitored, it
damages the very friendship it depends on.

I do not think this kills the feature, but I hold it loosely, and it is the first
thing I would put in front of real users (see `research-plan.md`, Assumption A1).
The design response is under Key flows: completion is framed as **the sitter's record**,
never as the owner's oversight. Language and defaults carry that distinction. If
research says otherwise, the fallback is a passive log - the sitter sees the
checklist, the owner sees only "last activity 7:12am" - and we lose very little
engineering work.

---

## 3. Users and jobs

"Owner" and "watcher" (the brief's word for a pet sitter) are relationships to a pet, not account types. The same
person is routinely both. The design must never make someone feel they are in the
wrong "mode."

**The owner - away, anxious, not in control**
- Hand over everything a competent stranger would need, without a 20-minute phone call
- Know it is being done, without having to ask and feel like a nag
- Retain the ability to see and revoke who has access

**The sitter - willing, uncertain, doing a favor**
- Know exactly what is needed *right now*, without reading a manual
- Not get it wrong
- Be able to show that they did it
- Not be surprised by something the owner forgot to mention

**Design consequence:** For the sitter, the app is one screen - *what do I do
now.* Everything else is setup. The information architecture should reflect that
the sitter's session is 40 seconds long and happens standing up, one-handed,
possibly holding a leash.

---

## 4. Scope

### In - v1

| Area | Included |
|---|---|
| Auth | Email + password registration, login, password reset by email link |
| Pets | Create, edit, remove; name, species, breed, age, notes, photo |
| Routines | Recurring care tasks: title, type, time of day, days of week, instructions |
| Views | Today and This Week; filter by pet |
| **Completion** | **Mark a task done; who did it and when; optional note** |
| **Activity** | **Chronological record of completions per pet** |
| Sitters | Invite a registered user by email; accept via emailed link; list sitters; revoke |
| Timezone | Every task time resolves to the *pet's* timezone |

### Out - v1, with reasons

| Excluded | Why |
|---|---|
| Inviting unregistered users | Explicit constraint in the brief. See The registration constraint - I think it is the biggest risk in the product, and I have designed the least-damaging version rather than quietly overriding it. |
| Payments, marketplace, vetting | This is trusted people, not hired strangers. Not Rover. Different product, different trust model. |
| In-app messaging | These two people already text each other. Rebuilding messaging is expensive and loses to iMessage. |
| Arbitrary recurrence (RRULE) | "Every other Tuesday," "3rd Thursday" - real routines are daily or weekly. Days-of-week covers the cases we can name. Revisit only with evidence. |
| Native push notifications | v1 is web + email. Push is the top of the v1.1 list because it is what makes reminders actually work. |
| Households, co-owners | A pet has one owner in v1. Multi-owner is a permissions model, not a feature, and it deserves its own design pass. |
| Vet records, weight, medical history | Adjacent product. Would double the data model for a job nobody described. |
| Ratings, public profiles | Actively harmful here. Rating your sister is not a thing. |

### Explicit non-goal

**We are not building a marketplace, and no v1 decision should be made "so it's
easier to add payments later."** If that becomes the strategy, it changes the
trust model, the identity requirements, and the liability surface, and it should
be a deliberate re-scope rather than an accumulation of hedges.

---

## 5. Data model

Six entities. The shape matters because two decisions in it save meaningful
engineering time.

```
User          id · email · password_hash · name · avatar_url · timezone

Pet           id · owner_id → User · name · species · breed · birthdate
              notes · photo_url · timezone            ← note: the PET has a timezone

Membership    id · pet_id → Pet · user_id → User
              role: owner | sitter
              status: active | revoked
              created_at · revoked_at
              ↑ this table is the whole "roles are per-pet" mechanic

CareTask      id · pet_id → Pet · title · type: feed|walk|meds|play|other
              time_of_day · days_of_week[0-6] · instructions
              created_by → User · active: bool

Completion    id · care_task_id → CareTask · occurrence_date
              completed_by → User · completed_at · note · photo_url
              UNIQUE (care_task_id, occurrence_date)   ← prevents double-completion

Invite        id · pet_id → Pet · inviter_id → User · invitee_email
              invitee_user_id → User · token · status: pending|accepted|revoked|expired
              sent_at · expires_at
```

**Decision 1 - store the rule, not a year of reminders.** "Feed at 7am, every day"
is saved exactly once, as a rule. When someone opens the app, it does quick math -
"it's Tuesday the 4th, so today's list is..." - instead of looking up pre-made
entries. The only things ever written down permanently are tasks people actually
completed.

The obvious alternative is to fill a database with every future feeding - which
means a nightly job to top the list up, cleanup work every time an owner edits the
routine, and a whole family of bugs where the stored list and the actual rule
disagree. Skipping all that is the single biggest time-saver in this design, and
users can't tell the difference.

**Decision 2 - the time zone belongs to the pet, not the person.** The owner lands
in Lisbon; the dog is still in Los Angeles. "Feed at 7am" has to mean 7am *where
the dog is*, always. Get this wrong and the bug shows up on day one of someone's
first real trip - the exact moment the app most needs to be trusted. It costs one
extra field to get right today, and a painful repair job to fix later.

**Decision 3 - the database itself refuses a duplicate.** One task, one day, one
completion: the database is physically incapable of recording "insulin given"
twice for the same evening. The screens warn people too - but the real safeguard
lives at the bottom layer, where no glitch or race between two phones can beat it.

---

## 6. Key flows and the decisions inside them

### 6.1 Today - the product's center of gravity

The sitter's entire relationship with PetWatch is this screen. It opens to
**Today**, not to a dashboard, not to a pet list.

- Tasks in chronological order, grouped **Now / Later today / Done**
- Each row: time, pet, task, and a large completion target
- Overdue tasks surface at the top with a quiet marker - *never* red alarm
  styling. The sitter is a volunteer; a hostile interface punishes a person
  doing a favor. Urgency is communicated by position, not by alarm.
- Completion is one tap, optimistic, and immediately reversible for 5 minutes.
  Undo is not a confirmation dialog - dialogs before an action punish the 99%
  who meant it. Reversal after the fact costs the 1% nothing.

**Framing decision:** the completion control reads as *"I did this"* - first
person, the sitter's own record. Nowhere does the owner-facing language say
"verified" or "confirmed by." The activity feed reads *"Sam fed Kenji · 7:12am"* -
a factual record, not a compliance report. This is the design answer to the
surveillance risk raised earlier.

### 6.2 The double-completion guard

Two sitters, one task. Sitter B opens the app and the task already shows as
done, attributed. If B taps it anyway - race condition, stale screen - the write
fails on the unique constraint and B sees:

> **Already done.** Sam marked this complete at 7:12am.

Not an error. A fact, delivered calmly. For a medication task this is the most
important interaction in the product.

### 6.3 Week view

Same data, seven columns. Its job is different: it answers *"what am I signed up
for"* rather than *"what do I do now."* Density over immediacy. Filter by pet
persists across both views - it is a property of the session, not the screen.

### 6.4 Setting up a routine - the owner's real work

This is the highest-effort moment in the product and the one most likely to be
abandoned. Two decisions:

- **Templates by species.** Choosing "dog" pre-loads a plausible routine -
  breakfast, walk, dinner - as *editable suggestions*, not commitments. Most
  owners want to correct a draft, not face an empty state. This is the cheapest
  activation lever available and it costs a fixture file.
- **Instructions are a first-class field, not a footnote.** The valuable content
  is never "Feed 7am" - it is *"half a cup of the green bag, NOT the blue bag,
  she'll tell you otherwise and she's lying."* That is the sentence that prevents
  the 11pm phone call. The field is generous, and the placeholder teaches by
  example.

### 6.5 Inviting a sitter - and the constraint

Per the brief, the invitee must already have a PetWatch account. The flow:

1. Owner enters an email
2. **Registered** → invite sent, appears as *Pending* on the pet
3. Invitee gets an email, clicks the link, sees what they are accepting - which
   pet, whose, what routine - and accepts. Membership created.
4. **Not registered** → see The registration constraint

Accepting is a real decision with real content, so the accept screen shows the
commitment (2 tasks a day, Mar 3–9) rather than a bare "Accept?" button.

### 6.6 Visibility and revoking

The owner sees every sitter per pet, their status, and when they last did
something. Revoking is immediate and does not ask the owner to justify it.

**Revoked sitters keep their history.** Their completions remain in the activity
record, still attributed. The record of what happened to the animal is the owner's,
and it must not develop holes when a relationship ends. The sitter simply loses
access going forward.

---

## 7. The registration constraint - biggest risk in the product

> *"The invitee must already have a PetWatch account - inviting unregistered
> users is not supported."*

I want to be direct: **the person most likely to watch your pet is your neighbor,
your mother, or your friend, and they have never heard of PetWatch.** The
constraint means the product's core loop terminates at exactly the moment of
highest intent - the owner is packing, they have decided to use the tool, and the
tool tells them the person they chose is not eligible.

I am not overriding the constraint. It is a stated requirement, it may reflect
technical or product reasoning I do not have, and rewriting requirements I was
handed is not my call to make unilaterally. So v1 respects it - and I have designed
the least-damaging version of it, plus the evidence that would let us revisit it.

**v1 behavior (respects the constraint):** No invite record is created. No email
is sent to a non-user. Instead the owner sees an honest state and a way forward
that uses a channel they already have:

> **Dana isn't on PetWatch yet.**
> Invites only work for people with an account. Send them this, and once
> they've signed up you can invite them.
> `[ Copy message ]`  → *"Hey - I'm using PetWatch to set up Kenji's care
> while I'm away. Can you make an account at petwatch.app? Takes a minute,
> then I'll send you the details."*

The owner does the sending, through their own text message. We have not invited an
unregistered user; we have refused gracefully and handed the owner a rope.

**The counter that settles this:** every attempt against an unregistered
email is logged. If that number is a meaningful share of invite attempts - my
guess is it will be large - we have an evidence-based case to revisit, and I would
bring it to product strategy in week one of post-launch rather than arguing it
now, in a document, without data.

**The v1.1 design if the data supports it:** the invite email doubles as a signup
link, and the invitation auto-accepts on account creation. Roughly two days of
work. See `backlog.md`, PW-31.

---

## 8. Edge cases

Written here rather than discovered in QA. I would walk this list with the QA
engineer during ticket refinement so acceptance criteria are written once.

**Invites**
- Invite to someone already sitting → nothing breaks; show them as already added, no duplicate
- Invite to yourself → blocked with a plain message
- Invite link opened while logged into a different account → email mismatch guard, offer account switch
- Invite link opened twice → "already accepted" state, not an error
- Invite link expired (7 days) → offer to request a new one
- Invite pending when the pet is deleted → invalidated silently
- Token is single-use, bound to the invitee email, 7-day expiry

**Completion**
- Two sitters complete simultaneously → unique constraint; loser sees the already-done guard
- Completing a past day → allowed within 48h, recorded as "logged late" with the real timestamp
- Completing a future day → blocked; the control is not offered
- Undo window → 5 minutes, then the record is permanent
- Task edited after completions exist → past completions retain the title they were completed under
- Task deleted → soft delete; completions survive in the activity record

**Access**
- Revoked sitter with the app open → next action fails cleanly to a "no longer have access" state, not a crash
- Revoked then re-invited → new membership, prior history intact
- Owner deletes a pet with active sitters → confirmation naming the consequences; memberships cascade
- Owner is also the only sitter → fully supported, no empty-state weirdness

**Time**
- DST transition → tasks are wall-clock local to the pet; 7am stays 7am
- Owner and sitter in different timezones → both see the pet's time, labeled
- Task at 00:00 or 23:59 → does not leak into an adjacent day

**Auth**
- Password reset for an unknown email → generic success message; never confirm whether an account exists
- Reset link single-use, 1-hour expiry

---

## 9. Success metrics

**North star - % of scheduled care events confirmed complete during an active
watch period.** This is the closest available proxy for the thing we actually
sell: the owner's confidence that their animal is fine.

| Stage | Measure | Target for v1 |
|---|---|---|
| Activation | Owner adds a pet, at least 1 routine task and 1 sitter within 7 days | 40% of new owners |
| Core value | A watch period ends with 80% or more of tasks confirmed | 60% of watch periods |
| Sitter activation | Sitter completes their first task within 24h of accepting | 70% |
| Retention | Owner starts a second watch period within 90 days | 35% |

**The honesty checks - numbers that tell us if we're fooling ourselves**

- **Batch-completion rate:** % of tasks marked done in a single burst at the end of
  the day. If sitters are ticking twelve boxes at 11pm, the record is fiction, the
  owner's confidence is unearned, and our north star is measuring compliance
  theater. I would watch this more closely than the north star itself.
- **Time to first completion** for a new sitter - a friction detector.
- **Invite attempts against unregistered emails** - the evidence for reopening the registration constraint.
- **Support contacts mentioning "didn't know / wasn't told"** - the qualitative
  signal that the instructions field is failing.

---

## 10. Open questions for the team

Ordered by how much they would change the design.

1. **Product strategy:** Is the long-term intent a trusted-circle utility or a
   two-sided marketplace? Every trust decision in v1 branches here.
2. **Product strategy / Legal:** Is the registration constraint a technical
   limitation, a spam-surface decision, or a strategic one? The right v1.1
   response differs for each.
3. **Eng:** Confirm the derived-occurrence model in Data model is compatible with how you
   want to build the Today query before I go further on the schedule editor.
4. **TPM:** Web-first, or is a native shell in scope? It changes the notification
   design substantially and I would rather know before I design reminders.
5. **QA:** Do we have a defensible position on medication tasks? I would like us
   to decide deliberately whether we carry explicit disclaimers, rather than
   discovering the question at launch.
6. **Design/Eng:** Photo uploads - pet photos are in scope, completion photos are
   not. Confirm we are standing up image handling once, in v1, so adding
   completion photos in v1.1 is a UI change rather than an infrastructure project.

# SignalSafe

Submission workspace for the USAII Global AI Hackathon 2026.

## Current concept

`SignalSafe` is a privacy-first family safety dashboard for parents of kids 10 and under.

It is meant to feel closer to a lighter, home-friendly version of a device supervision tool than a one-off AI checker:

- messages, browsing, app changes, contact requests, bedtime rules, and travel checks can all be handled from one parent view
- most analysis stays on the child device
- parents get short redacted incident packets instead of a full transcript archive
- AI triage explains why something was flagged, what context mattered, and what the parent should do next
- a parent can check in, pause an app, approve or block a contact, tighten a rule, or bring in another adult when something looks wrong

The product tries to sit between two bad extremes: seeing nothing at all and reading everything.

## Demo shape

- `Alerts`: selectable incidents, AI reasoning, lifecycle state, redacted evidence, and calm parent actions
- `Daily activity`: current device state, safe zones, routines, and the day timeline
- `Controls`: family roles, live rules, approval queues, device integrity, and privacy boundaries
- `Setup`: install kits and a realistic onboarding path for tablets and phones

## Repo layout

- `web/`: Next.js demo application
- `LICENSE`: project license
- `PROJECT_STATUS.md`: current project state and next build targets
- `RUNLOG.md`: session log

## Local development

```bash
cd web
npm install
npm run dev
```

## Validation

The current build has been verified with:

```bash
npm run lint
npm run build
npm run snapshot:html
```

The HTML deliverable is regenerated at [signalsafe_snapshot.html](C:/Users/adity/competition-ops/usaii-hackathon/deliverables/signalsafe_snapshot.html) after each snapshot run.

## Near-term priorities

1. Record the submission video around the end-to-end incident story.
2. Add a few more stateful parent workflows so approvals and controls feel even more live in demo.
3. Prepare submission assets: screenshots, demo script, and final Devpost copy.

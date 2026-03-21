# SignalSafe

Submission workspace for the USAII Global AI Hackathon 2026.

## Current concept

`SignalSafe` is a privacy-first family safety dashboard for parents of kids 10 and under.

It is meant to feel closer to a lighter, home-friendly version of a device supervision tool than a one-off AI checker:

- messages, browsing, app changes, contact requests, bedtime rules, and travel checks can all be watched from one parent view
- most analysis stays on the child device
- parents get short alerts and summaries instead of a full transcript archive
- a parent can check in, pause an app, tighten a rule, or bring in another adult when something looks wrong

The product tries to sit between two bad extremes: seeing nothing at all and reading everything.

## Demo shape

- `Alerts`: risky messages and parent response actions
- `Daily activity`: current device state, blocked events, and the day timeline
- `Privacy & rules`: family contacts, household rules, and what can leave the device
- `Setup`: install kits and the first-run setup flow for tablets and phones

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
```

## Near-term priorities

1. Tighten the demo story for judges and record the submission video.
2. Add more realistic deployment and guardian-policy interactions.
3. Prepare submission assets: README polish, screenshots, and demo script.

# SignalSafe Guardian Network

Submission workspace for the USAII Global AI Hackathon 2026.

## Current concept

`SignalSafe Guardian Network` is a privacy-respecting safety system for parents of kids 10 and under.

Instead of asking parents to paste random chat blobs into a generic analyzer, the product is framed as a deployable family safety network:

- a child device runs local scanning on approved messaging surfaces
- risky interactions are collapsed into redacted incident packets
- a guardian console shows routing, acknowledgement state, escalation, and app-level response actions
- full transcript access stays local by default unless a parent explicitly unlocks more detail

The core product claim is not just detection. It is trustworthy escalation design for younger children.

## Demo shape

- `Guardian fleet`: multiple child devices with different install profiles
- `Incident command`: parent dashboard with alert queue, redacted evidence, and response actions
- `Family policy`: guardian roster, privacy boundaries, escalation timing, and configurable family controls
- `Responsible AI`: explicit human-in-the-loop, data-minimization, and false-positive containment story
- `Deployment path`: install kits for Apple family devices, Android family phones, and school-safe tablets

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

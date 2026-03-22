# Role 5: Staff Engineer / System Designer

Using the prior review files as design inputs.

## Architecture summary
A minimal believable pipeline:
- local event ingestion on the child device
- on-device classifier assigns signals, score, confidence, severity, and whether the event qualifies for dignity mode
- packet generator creates a redacted guardian payload and route plan
- guardian console stores incident state, guarded reveal state, route state, acknowledgement state, follow-up outcomes, and audit records
- policy engine applies routines, safe zones, approval rules, and integrity state to incident handling

## Incident lifecycle
Detected -> Redacted -> Queued -> Viewed -> Acknowledged -> Actioned -> Resolved

Optional side branches:
- Guarded reveal requested -> revealed -> reveal closed
- Coverage degraded -> guardian notified -> confidence in monitoring reduced

## State model
- incidentState by alert id
- routeState by alert id
- revealState by alert id
- followUpOutcome by alert id
- approvalState by approval item id
- integrityState by child id
- auditEntries as append-only log for sensitive and guardian actions
- dignityMode boolean in controls

## Data model changes
Add to alert payload:
- detectedAt
- incidentStage
- routeStatus
- escalationDeadline
- dignityModeEligible
- revealAvailable
- revealSummary
- policyContext

Add UI-side state:
- incident state machine map
- reveal map with opened/closed timestamps
- audit entry types for view, reveal, acknowledge, escalate, approve, block, rule change, resolve

## Top engineering tasks ranked by impact
1. Build a front-end incident state machine derived from guardian actions.
2. Add guarded reveal with audit logging and privacy-boundary state changes.
3. Make confidence and dignity mode change available actions and route behavior.
4. Add integrity degradation that changes coverage claims and creates a visible alert.
5. Expand the audit log into a proper guardian transparency trail rather than simple action notes.

import { NextResponse } from "next/server";

type Severity = "info" | "watch" | "alert" | "critical";
type RouteStatus = "armed" | "fallback" | "idle";
type IncidentStage = "Detected" | "Redacted" | "Queued" | "Viewed" | "Acknowledged" | "Actioned" | "Resolved";

type EventRecord = {
  id: string;
  app: string;
  at: string;
  text: string;
};

type TacticRule = {
  id:
    | "secrecy"
    | "isolation"
    | "urgency"
    | "gifting"
    | "location"
    | "age-gap"
    | "boundary-push";
  label: string;
  weight: number;
  severity: Severity;
  patterns: RegExp[];
  explanation: string;
};

const tacticRules: TacticRule[] = [
  {
    id: "secrecy",
    label: "Secrecy pressure",
    weight: 18,
    severity: "critical",
    explanation: "The speaker is trying to hide the interaction from a guardian.",
    patterns: [/don't tell/i, /dont tell/i, /keep this secret/i, /between us/i, /your parents don't see/i],
  },
  {
    id: "isolation",
    label: "Isolation from support",
    weight: 14,
    severity: "watch",
    explanation: "The speaker frames adults or trusted people as blockers.",
    patterns: [/adults always ruin/i, /don't involve/i, /dont involve/i, /just trust me/i, /your dad/i],
  },
  {
    id: "urgency",
    label: "Urgency and pressure",
    weight: 12,
    severity: "watch",
    explanation: "The speaker wants an immediate response before the child can pause.",
    patterns: [/reply right now/i, /reply now/i, /hurry/i, /before i leave/i],
  },
  {
    id: "gifting",
    label: "Reward leverage",
    weight: 15,
    severity: "watch",
    explanation: "A reward or purchase is being offered in exchange for access or behavior.",
    patterns: [/gift/i, /robux/i, /buy you/i, /reward/i, /send you money/i],
  },
  {
    id: "location",
    label: "Location request",
    weight: 16,
    severity: "critical",
    explanation: "The speaker is asking for school, address, or meeting details.",
    patterns: [/where do you live/i, /meet me/i, /school/i, /address/i, /come alone/i],
  },
  {
    id: "age-gap",
    label: "Age-gap cue",
    weight: 14,
    severity: "watch",
    explanation: "The speaker uses maturity language to normalize a power imbalance.",
    patterns: [/mature than other kids/i, /mature for your age/i, /other kids/i],
  },
  {
    id: "boundary-push",
    label: "Boundary push",
    weight: 18,
    severity: "critical",
    explanation: "The speaker asks for private images or pushes the chat to a less protected channel.",
    patterns: [/private picture/i, /photo first/i, /telegram/i, /voice alone/i],
  },
];

function dedupe<T>(values: T[]) {
  return [...new Set(values)];
}

function redact(hit: string) {
  const trimmed = hit.trim();
  if (trimmed.length <= 10) {
    return trimmed;
  }

  return `${trimmed.slice(0, 6)}…${trimmed.slice(-4)}`;
}

function severityFromScore(score: number): Severity {
  if (score >= 55) {
    return "critical";
  }
  if (score >= 40) {
    return "alert";
  }
  if (score >= 22) {
    return "watch";
  }
  return "info";
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    childName?: string;
    childAge?: number;
    events?: EventRecord[];
  };

  const childName = body.childName?.trim() ?? "Child";
  const events = body.events ?? [];

  const alerts = events
    .map((event) => {
      const matchedRules = tacticRules
        .map((rule) => {
          const hits = dedupe(
            rule.patterns
              .flatMap((pattern) => event.text.match(pattern) ?? [])
              .map((match) => redact(match)),
          );

          return hits.length > 0 ? { rule, hits } : null;
        })
        .filter((item): item is { rule: TacticRule; hits: string[] } => item !== null);

      if (matchedRules.length === 0) {
        return null;
      }

      const score = matchedRules.reduce((sum, item) => sum + item.rule.weight, 0);
      const severity = severityFromScore(score);
      const evidence = matchedRules.flatMap((item) => item.hits);
      const matchedTactics = matchedRules.map((item) => item.rule.label);
      const contextSignals = dedupe(
        [
          event.app.includes("Messenger") ? "New contact channel" : null,
          event.app.includes("Roblox") || event.app.includes("Minecraft") ? "Gaming chat" : null,
          event.at.includes("PM") ? "Evening hours" : null,
          matchedRules.length > 1 ? "Multiple signals in one event" : null,
        ].filter((value): value is string => value !== null),
      );

      const actionPlan =
        severity === "critical"
          ? [
              "Check in with the child now.",
              "Pause the app until an adult reviews the contact.",
              "Ask the backup adult to review if the first parent misses the alert.",
            ]
          : severity === "alert"
            ? [
                "Check in with the child soon.",
                "Approve or block the contact before the chat continues.",
                "Tighten the rule if the same pattern shows up again.",
              ]
            : [
                "Review the short summary with the child later.",
                "Watch for repeated contact or repeat reward pressure.",
                "Adjust app rules if the same pattern keeps showing up.",
              ];

      const dignityModeEligible =
        severity === "watch" ||
        (severity === "alert" &&
          !matchedRules.some((item) => ["secrecy", "location", "boundary-push"].includes(item.rule.id)) &&
          score < 50);

      const recommendedAction =
        dignityModeEligible
          ? "Start with a calm check-in. Keep the incident redacted unless the pattern repeats or grows stronger."
          : severity === "critical"
            ? "Pause the app and check in with the child now."
            : severity === "alert"
              ? "Review the contact and decide whether to block or tighten the rule."
              : "Keep watching unless the same behavior repeats.";

      const explanation =
        severity === "critical"
          ? "This event combines high-risk signals that should reach a parent quickly, but the parent still makes the final call."
          : severity === "alert"
            ? "This event may not need an immediate lock, but it carries enough risk that a parent should review it while context is fresh."
            : "This event is being kept in view because it may become risky if the same pattern repeats.";

      const confidence = severity === "critical" ? 94 : severity === "alert" ? 82 : severity === "watch" ? 68 : 52;
      const routeStatus: RouteStatus = severity === "critical" ? "fallback" : severity === "alert" ? "armed" : "idle";
      const incidentStage: IncidentStage = severity === "critical" || severity === "alert" ? "Queued" : "Redacted";
      const escalationDeadline =
        severity === "critical" ? "Escalate in 5 min" : severity === "alert" ? "Review in 20 min" : "Digest only";
      const policyContext = dedupe(
        [
          event.at.includes("PM") ? "Evening routine active" : null,
          event.app.includes("Messenger") ? "New-contact hold is active" : null,
          event.app.includes("Chrome") ? "Browser shield filtered the page before sync" : null,
          event.app.includes("Roblox") || event.app.includes("Minecraft") ? "Gaming-chat rules applied before escalation" : null,
        ].filter((value): value is string => value !== null),
      );
      const revealSummary =
        dignityModeEligible
          ? "Low-confidence or context-sensitive case. Keep the packet redacted unless the pattern repeats."
          : "A deeper reveal is available, but only after a guardian explicitly unlocks it.";

      return {
        id: event.id,
        severity,
        title:
          severity === "critical"
            ? "Immediate guardian review recommended"
            : "Interaction needs parent review",
        score,
        summary: `${event.app} triggered ${matchedTactics.join(", ")} and should be routed through the parent console.`,
        evidence,
        channels:
          severity === "critical"
            ? ["Push now", "SMS in 5 min", "Backup adult in 10 min"]
            : severity === "alert"
              ? ["Push now", "Dashboard queue", "Email backup"]
              : ["Dashboard queue", "Daily digest"],
        actionPlan,
        app: event.app,
        matchedTactics,
        contextSignals,
        recommendedAction,
        explanation,
        confidence,
        detectedAt: event.at,
        incidentStage,
        routeStatus,
        escalationDeadline,
        dignityModeEligible,
        revealSummary,
        policyContext,
      };
    })
    .filter((alert): alert is NonNullable<typeof alert> => alert !== null)
    .sort((a, b) => b.score - a.score);

  const overallScore = alerts.reduce((sum, alert) => sum + alert.score, 0);
  const overallRisk = severityFromScore(overallScore);
  const queuedAlerts = alerts.filter((alert) => alert.severity !== "info").length;

  const deliveryPlan =
    overallRisk === "critical"
      ? {
          primary: "Primary guardian push is armed immediately with the child name, app, and redacted evidence packet.",
          backup: "Fallback SMS activates after 5 minutes if the guardian has not acknowledged the incident.",
          escalation: "A second guardian and summary email receive the packet after 10 minutes or on manual escalation.",
        }
      : {
          primary: "The guardian app feed receives the incident in the active review queue.",
          backup: "Email backup stores the review packet for later follow-up.",
          escalation: "Escalation stays idle unless the same tactic repeats on the same device.",
        };

  const response = {
    childName,
    overallRisk,
    overallScore,
    statusLine:
      alerts.length > 0
        ? `${alerts.length} alert${alerts.length > 1 ? "s" : ""} need guardian review.`
        : "No guardian intervention is recommended right now.",
    guardianDigest:
      alerts.length > 0
        ? `${childName}'s device produced ${alerts.length} redacted incident packet${alerts.length > 1 ? "s" : ""}. Full chat text stayed local; the parent console only received the minimum evidence needed to react quickly.`
        : `${childName}'s recent activity stayed below the guardian threshold. No alert packet was routed off-device.`,
    alerts,
    privacyNotes: [
      "Raw text remains on-device unless a guardian unlocks more detail.",
      "Only redacted phrase fragments and risk metadata sync to the console.",
      "Guardian actions and escalation state are logged for family coordination.",
    ],
    dashboardStats: {
      processed: String(events.length),
      flagged: String(alerts.length),
      redacted: String(alerts.reduce((sum, alert) => sum + alert.evidence.length, 0)),
      queued: String(queuedAlerts),
    },
    deliveryPlan,
    recommendation:
      overallRisk === "critical"
        ? "For younger kids, the safest default is to notify the primary guardian immediately, keep the full transcript on-device, and make escalation fast if the first alert is missed."
        : overallRisk === "alert"
          ? "Keep the evidence packet narrow, put the event in front of a parent quickly, and let the adult decide the next step."
          : "Keep the evidence packet narrow and give the parent context without normalizing full-time transcript surveillance.",
  };

  return NextResponse.json(response);
}

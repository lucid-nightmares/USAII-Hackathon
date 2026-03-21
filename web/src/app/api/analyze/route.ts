import { NextResponse } from "next/server";

type Severity = "info" | "watch" | "critical";

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
  if (score >= 25) {
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
      const actionPlan =
        severity === "critical"
          ? [
              "Open a calm guardian check-in immediately.",
              "Confirm whether the child should stop using the app for now.",
              "Escalate to the backup guardian if the primary misses the acknowledgement window.",
            ]
          : [
              "Review the redacted evidence with context from the child.",
              "Watch for repeated contact or repeated reward pressure.",
              "Adjust the app policy or contact permissions if the pattern continues.",
            ];

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
            ? ["Push now", "SMS in 5 min", "Backup guardian in 10 min"]
            : ["Push digest", "Email summary"],
        actionPlan,
        app: event.app,
        matchedTactics,
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
        ? "For younger kids, the safest default is to notify the primary guardian immediately, preserve the transcript locally, and make escalation fast if the first alert is missed."
        : "Keep the evidence packet narrow and give the parent context without normalizing full-time transcript surveillance.",
  };

  return NextResponse.json(response);
}

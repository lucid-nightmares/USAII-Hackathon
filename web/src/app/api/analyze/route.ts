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
    patterns: [/don't tell/i, /keep this secret/i, /between us/i, /your parents don't see/i],
  },
  {
    id: "isolation",
    label: "Isolation from support",
    weight: 14,
    severity: "watch",
    explanation: "The speaker frames adults or trusted people as blockers.",
    patterns: [/adults always ruin/i, /don't involve/i, /just trust me/i, /your dad/i],
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
      const tacticNames = matchedRules.map((item) => item.rule.label.toLowerCase());

      return {
        id: event.id,
        severity,
        title:
          severity === "critical"
            ? "Immediate guardian check recommended"
            : "Review this interaction",
        score,
        summary: `${event.app} triggered ${tacticNames.join(", ")} in a way that merits guardian review.`,
        evidence,
        channels:
          severity === "critical"
            ? ["Push now", "SMS in 5 min", "Second guardian in 10 min"]
            : ["Push digest", "Email summary"],
        actionPlan:
          severity === "critical"
            ? [
                "Open the child check-in flow immediately.",
                "Confirm whether the app should be locked temporarily.",
                "Review the app-specific safety setting and report if needed.",
              ]
            : [
                "Review the conversation summary.",
                "Ask a calm follow-up question.",
                "Watch for repeated behavior from the same app or contact.",
              ],
        app: event.app,
      };
    })
    .filter((alert): alert is NonNullable<typeof alert> => alert !== null)
    .sort((a, b) => b.score - a.score);

  const overallScore = alerts.reduce((sum, alert) => sum + alert.score, 0);
  const overallRisk = severityFromScore(overallScore);

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
        ? `${childName}'s device found ${alerts.length} risky interaction${alerts.length > 1 ? "s" : ""}. Raw text stayed local; only redacted phrases and incident summaries were sent to the dashboard.`
        : `${childName}'s device scanned recent activity and found no incidents that crossed the guardian threshold.`,
    alerts,
    privacyNotes: [
      "Raw text stays on-device by default.",
      "Only redacted evidence snippets are synced to guardians.",
      "Parents can require explicit unlock before viewing additional context.",
    ],
    dashboardStats: {
      processed: String(events.length),
      flagged: String(alerts.length),
      redacted: String(alerts.reduce((sum, alert) => sum + alert.evidence.length, 0)),
      queued: String(alerts.filter((alert) => alert.severity !== "info").length),
    },
    deliveryPlan:
      overallRisk === "critical"
        ? {
            primary: "Push the alert instantly to the primary guardian app.",
            backup: "Send SMS if the push is not acknowledged in 5 minutes.",
            escalation: "Route the incident to a second guardian and email a summary packet.",
          }
        : {
            primary: "Bundle the alert into the guardian app feed.",
            backup: "Email the summary for later review.",
            escalation: "Escalate only if the same pattern repeats.",
          },
  };

  return NextResponse.json(response);
}

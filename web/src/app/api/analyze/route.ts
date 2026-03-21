import { NextResponse } from "next/server";

type TacticId =
  | "secrecy"
  | "isolation"
  | "urgency"
  | "gifting"
  | "location"
  | "age-gap"
  | "boundary-push";

type Tactic = {
  id: TacticId;
  label: string;
  weight: number;
  hits: string[];
  explanation: string;
};

type Highlight = {
  phrase: string;
  tacticId: TacticId;
  severity: "watch" | "act-now";
};

const tacticRules: Array<{
  id: TacticId;
  label: string;
  weight: number;
  explanation: string;
  patterns: RegExp[];
}> = [
  {
    id: "secrecy",
    label: "Secrecy pressure",
    weight: 18,
    explanation:
      "The speaker is trying to hide the conversation from trusted adults or friends.",
    patterns: [/don't tell/i, /keep this secret/i, /between us/i, /don't let .* see/i],
  },
  {
    id: "isolation",
    label: "Isolation from support",
    weight: 14,
    explanation:
      "The speaker frames other people as obstacles so the target relies only on them.",
    patterns: [/your parents .* ruin/i, /adults always ruin/i, /don't involve/i, /just trust me/i],
  },
  {
    id: "urgency",
    label: "Urgency and pressure",
    weight: 12,
    explanation:
      "The speaker wants a rushed answer before the target can slow down or ask for help.",
    patterns: [/reply now/i, /right now/i, /hurry/i, /before i head out/i, /don't make me wait/i],
  },
  {
    id: "gifting",
    label: "Reward leverage",
    weight: 15,
    explanation:
      "A gift, purchase, or reward is being used to influence private behavior.",
    patterns: [/buy you/i, /i'll get you/i, /send you money/i, /reward/i, /gift/i],
  },
  {
    id: "location",
    label: "Location or meeting request",
    weight: 16,
    explanation:
      "The speaker is asking for a meeting, address, schedule, or school/location details.",
    patterns: [/where do you live/i, /send your address/i, /meet me/i, /come alone/i, /what school/i],
  },
  {
    id: "age-gap",
    label: "Age-gap grooming cue",
    weight: 14,
    explanation:
      "Language like 'mature for your age' can be used to normalize a power imbalance.",
    patterns: [/mature than kids your age/i, /mature for your age/i, /not like other kids/i],
  },
  {
    id: "boundary-push",
    label: "Boundary push",
    weight: 18,
    explanation:
      "The speaker escalates intimacy or asks for private images or a channel change.",
    patterns: [/private picture/i, /photo first/i, /add me on telegram/i, /move .* app/i, /video call alone/i],
  },
];

const trustSignals = [
  { label: "Clear purpose", patterns: [/class tomorrow/i, /slides/i, /project/i, /assignment/i] },
  { label: "No secrecy framing", patterns: [/everyone on the team/i, /teacher/i, /group chat/i] },
  { label: "Time-bounded collaboration", patterns: [/before class/i, /tonight/i, /tomorrow/i] },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function dedupe<T>(values: T[]) {
  return [...new Set(values)];
}

function analyze(text: string) {
  const content = text.trim();
  const tactics: Tactic[] = [];
  const highlights: Highlight[] = [];

  for (const rule of tacticRules) {
    const hits = dedupe(
      rule.patterns
        .flatMap((pattern) => {
          const matches = content.match(pattern);
          return matches ?? [];
        })
        .map((match) => match.trim()),
    );

    if (!hits.length) {
      continue;
    }

    tactics.push({
      id: rule.id,
      label: rule.label,
      weight: rule.weight,
      hits,
      explanation: rule.explanation,
    });

    for (const hit of hits) {
      highlights.push({
        phrase: hit,
        tacticId: rule.id,
        severity: rule.weight >= 16 ? "act-now" : "watch",
      });
    }
  }

  const positiveSignals = trustSignals
    .filter((signal) => signal.patterns.some((pattern) => pattern.test(content)))
    .map((signal) => signal.label);

  const rawScore = tactics.reduce((sum, item) => sum + item.weight, 0) - positiveSignals.length * 6;
  const score = clamp(Math.round(rawScore + Math.min(content.length / 14, 10)), 2, 96);

  let level: "low" | "moderate" | "high" = "low";
  if (score >= 58) {
    level = "high";
  } else if (score >= 28) {
    level = "moderate";
  }

  const summary =
    tactics.length === 0
      ? "The current snippet looks task-focused and does not show strong manipulation cues in this ruleset."
      : `SignalSafe found ${tactics.length} tactic${tactics.length > 1 ? "s" : ""} that change the safety profile of the conversation.`;

  const nextSteps =
    level === "high"
      ? [
          "Stop the conversation before sharing more information.",
          "Save screenshots or message links for evidence.",
          "Tell a trusted adult, counselor, or moderator as soon as possible.",
          "Use report and block tools on the platform.",
        ]
      : level === "moderate"
        ? [
            "Keep the conversation on-platform and do not move to a private app.",
            "Do not trade photos, rewards, or personal details.",
            "Ask a trusted person for a second read before replying.",
            "Set a direct boundary if the tone keeps escalating.",
          ]
        : [
            "Keep basic online safety habits in place.",
            "Stay focused on the original topic of the conversation.",
            "If the tone shifts toward secrecy or pressure, re-check the conversation.",
          ];

  const saferReply =
    level === "high"
      ? "I'm not moving this chat or sharing anything private. I'm ending the conversation and checking with a trusted adult."
      : level === "moderate"
        ? "I want to keep this conversation here and stay on the original topic. I'm not sharing private details or photos."
        : "That works. Let's keep this about the school task and use the regular class channel.";

  const timeline =
    tactics.length === 0
      ? [
          { label: "Signal check", body: "The conversation stays anchored to a normal task or shared purpose." },
          { label: "Trust read", body: "No secrecy, no reward trade, and no pressure to move off-platform." },
          { label: "Coaching result", body: "Maintain normal online safety habits and watch for future escalation." },
        ]
      : [
          { label: "Entry point", body: `The first strong cue is ${tactics[0].label.toLowerCase()}, which changes how the message should be read.` },
          { label: "Escalation", body: `${tactics.length > 1 ? "Additional tactics stack on top of each other" : "The tactic itself is enough to raise concern"} and increase the safety risk.` },
          { label: "Intervention", body: "The product translates those cues into a calmer response and a practical next move." },
        ];

  return {
    score,
    level,
    summary,
    tactics,
    nextSteps,
    saferReply,
    trustSignals:
      positiveSignals.length > 0
        ? positiveSignals
        : ["Clear purpose is not established yet", "No reliable adult context visible", "No explicit boundary from the target yet"],
    highlights,
    timeline,
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as { text?: string };
  const text = body.text?.trim() ?? "";

  if (!text) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  return NextResponse.json(analyze(text));
}

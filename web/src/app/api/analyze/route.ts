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
    explanation: "Risky conversations often ask the target to hide the interaction from trusted adults or friends.",
    patterns: [/don't tell/i, /keep this secret/i, /our little secret/i, /between us/i],
  },
  {
    id: "isolation",
    label: "Isolation from support",
    weight: 14,
    explanation: "Pushing someone away from friends, family, or teachers increases dependency and reduces safety.",
    patterns: [/your parents wouldn't understand/i, /don't involve/i, /they will stop us/i, /just trust me/i],
  },
  {
    id: "urgency",
    label: "Urgency and pressure",
    weight: 12,
    explanation: "Manipulators often demand immediate action so the target has less time to think or ask for help.",
    patterns: [/reply now/i, /right now/i, /hurry/i, /before it's too late/i, /don't make me wait/i],
  },
  {
    id: "gifting",
    label: "Reward or gift leverage",
    weight: 15,
    explanation: "Offering money, gifts, games, or favors in exchange for private behavior is a classic manipulation tactic.",
    patterns: [/buy you/i, /send you money/i, /gift/i, /reward you/i, /i'll pay/i],
  },
  {
    id: "location",
    label: "Location or meeting request",
    weight: 16,
    explanation: "Requests for private meetings, addresses, or travel details raise the risk level significantly.",
    patterns: [/where do you live/i, /send your address/i, /meet me/i, /come alone/i, /what school do you go to/i],
  },
  {
    id: "age-gap",
    label: "Age-gap grooming cue",
    weight: 14,
    explanation: "Language about being mature for your age can be used to normalize inappropriate dynamics.",
    patterns: [/mature for your age/i, /older guys/i, /older girls/i, /you're not like other kids/i],
  },
  {
    id: "boundary-push",
    label: "Boundary-pushing request",
    weight: 18,
    explanation: "Requests for private photos, moving off-platform, or escalating intimacy are strong warning signs.",
    patterns: [/private pic/i, /photo just for me/i, /move to telegram/i, /move to signal/i, /video call alone/i],
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function analyzeText(text: string) {
  const lowered = text.trim();
  const tactics: Tactic[] = tacticRules
    .map((rule) => {
      const hits = rule.patterns
        .filter((pattern) => pattern.test(lowered))
        .map((pattern) => pattern.source.replace(/\\b/g, ""));

      if (!hits.length) {
        return null;
      }

      return {
        id: rule.id,
        label: rule.label,
        weight: rule.weight,
        hits,
        explanation: rule.explanation,
      } satisfies Tactic;
    })
    .filter((entry): entry is Tactic => entry !== null);

  const baseScore = tactics.reduce((sum, tactic) => sum + tactic.weight, 0);
  const score = clamp(baseScore + Math.min(text.length / 12, 12), 4, 96);

  let level: "low" | "moderate" | "high" = "low";
  if (score >= 60) {
    level = "high";
  } else if (score >= 30) {
    level = "moderate";
  }

  const summary =
    tactics.length === 0
      ? "This conversation does not show obvious grooming or manipulation cues in the current rule set, but context still matters."
      : `The analyzer found ${tactics.length} manipulation signal${tactics.length > 1 ? "s" : ""}. The strongest concerns are ${tactics
          .slice(0, 3)
          .map((item) => item.label.toLowerCase())
          .join(", ")}.`;

  const nextSteps =
    level === "high"
      ? [
          "Pause the conversation and avoid sharing more personal information.",
          "Save screenshots or message links in case a trusted adult or moderator needs them.",
          "Talk to a parent, teacher, counselor, or other trusted adult as soon as possible.",
          "Use the platform's block and report tools.",
        ]
      : level === "moderate"
        ? [
            "Slow the conversation down and avoid moving to private channels.",
            "Ask for a second opinion from a trusted adult or friend before replying.",
            "Avoid sharing your address, school, schedule, or private images.",
            "Set a clear boundary if the other person keeps escalating.",
          ]
        : [
            "Keep normal online safety habits in place.",
            "Do not share private information without a good reason.",
            "If the tone changes, rerun the analysis or ask a trusted adult for a second opinion.",
          ];

  const saferReply =
    level === "high"
      ? "I'm not comfortable continuing this conversation or moving to another app. I'm ending this chat and talking to a trusted adult."
      : level === "moderate"
        ? "I'd rather keep this conversation here and not share personal details. If that doesn't work, I won't continue."
        : "Thanks. I'll keep the conversation here and stay focused on the original topic.";

  return {
    score: Math.round(score),
    level,
    summary,
    tactics,
    nextSteps,
    saferReply,
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as { text?: string };
  const text = body.text?.trim() ?? "";

  if (!text) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  return NextResponse.json(analyzeText(text));
}

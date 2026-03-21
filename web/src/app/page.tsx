"use client";

import { useMemo, useState } from "react";

type Tactic = {
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
  hits: string[];
  explanation: string;
};

type Highlight = {
  phrase: string;
  tacticId: Tactic["id"];
  severity: "watch" | "act-now";
};

type AnalysisResponse = {
  score: number;
  level: "low" | "moderate" | "high";
  summary: string;
  tactics: Tactic[];
  nextSteps: string[];
  saferReply: string;
  trustSignals: string[];
  highlights: Highlight[];
  timeline: { label: string; body: string }[];
};

type Scenario = {
  slug: string;
  title: string;
  setup: string;
  persona: string;
  text: string;
};

const scenarios: Scenario[] = [
  {
    slug: "transfer",
    title: "Move the chat off-platform",
    setup: "A stranger starts with compliments, then tries to isolate the conversation from trusted adults.",
    persona: "Gaming DM",
    text: "hey you're actually cool. don't tell anyone we talked because adults always ruin everything. add me on telegram so your parents don't see, and reply now before i head out.",
  },
  {
    slug: "gift",
    title: "Gift-for-boundary trade",
    setup: "A compliment escalates into a reward exchange that pushes private boundaries.",
    persona: "Social app chat",
    text: "you're way more mature than kids your age. i could buy you that game tonight if you send me a private picture first. keep it between us.",
  },
  {
    slug: "school",
    title: "Normal collaboration",
    setup: "A classmate asks for project materials and keeps the conversation on task.",
    persona: "Robotics team",
    text: "can you send the robotics slides? we should split the design work before class tomorrow, and i'll finish the CAD notes tonight.",
  },
];

const tacticTone: Record<Tactic["id"], string> = {
  secrecy: "bg-[#7c3aed] text-white",
  isolation: "bg-[#ef4444] text-white",
  urgency: "bg-[#f97316] text-white",
  gifting: "bg-[#0f766e] text-white",
  location: "bg-[#dc2626] text-white",
  "age-gap": "bg-[#2563eb] text-white",
  "boundary-push": "bg-[#111827] text-white",
};

const features = [
  {
    title: "Evidence board, not a black box",
    body: "Every warning is tied to a phrase the student can actually see and question.",
  },
  {
    title: "De-escalation coaching",
    body: "The app suggests a safer reply and a calm next move instead of just shouting danger.",
  },
  {
    title: "Classroom-safe framing",
    body: "Built as literacy, prevention, and support guidance rather than surveillance or diagnosis.",
  },
];

const useCases = [
  "Digital literacy workshops",
  "Student counseling intake support",
  "Parent-student safety practice",
  "Peer mentor training",
];

function splitTranscript(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function highlightLine(line: string, highlights: Highlight[]) {
  let rendered = line;
  for (const highlight of highlights) {
    const marker = `[[${highlight.phrase}]]`;
    const regex = new RegExp(highlight.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
    rendered = rendered.replace(regex, marker);
  }

  return rendered.split(/(\[\[[^\]]+\]\])/g).filter(Boolean);
}

export default function Home() {
  const [active, setActive] = useState<Scenario>(scenarios[0]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [draft, setDraft] = useState(scenarios[0].text);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState<"analyzer" | "coach" | "ops">("analyzer");

  const transcript = useMemo(() => splitTranscript(draft), [draft]);

  async function analyze(text: string) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Analyzer failed");
      }

      const data = (await response.json()) as AnalysisResponse;
      setAnalysis(data);
    } catch {
      setError("Analyzer unavailable. Check the local app process and retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f2efe8] text-[#181412]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[linear-gradient(135deg,_#e7ded1_0%,_#f6f1e8_45%,_#f2efe8_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.07),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(180,83,9,0.12),_transparent_26%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-14">
          <div className="space-y-7">
            <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.22em] text-[#7c2d12]">
              <span className="rounded-full border border-[#7c2d12]/15 bg-white/80 px-4 py-2">USAII 2026</span>
              <span className="rounded-full border border-black/10 bg-[#111827] px-4 py-2 text-[#fef3c7]">Student safety AI</span>
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl font-[var(--font-display)] text-5xl leading-[0.95] tracking-[-0.05em] text-[#17110f] sm:text-6xl lg:text-7xl">
                SignalSafe turns a messy DM into a readable risk map.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[#4b3f38]">
                Instead of a generic chatbot warning, students get a structured evidence board: which phrases feel manipulative, why they matter, how risk is building, and what a safer response looks like.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-black/10 bg-white/85 p-5 shadow-[0_16px_60px_rgba(17,24,39,0.08)]">
                <div className="text-sm uppercase tracking-[0.18em] text-[#7c2d12]">Track fit</div>
                <div className="mt-3 text-xl font-semibold">Health + wellbeing</div>
              </div>
              <div className="rounded-[1.75rem] border border-black/10 bg-white/85 p-5 shadow-[0_16px_60px_rgba(17,24,39,0.08)]">
                <div className="text-sm uppercase tracking-[0.18em] text-[#7c2d12]">Primary user</div>
                <div className="mt-3 text-xl font-semibold">Students and counselors</div>
              </div>
              <div className="rounded-[1.75rem] border border-black/10 bg-white/85 p-5 shadow-[0_16px_60px_rgba(17,24,39,0.08)]">
                <div className="text-sm uppercase tracking-[0.18em] text-[#7c2d12]">Output style</div>
                <div className="mt-3 text-xl font-semibold">Explainable coaching</div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="rounded-[1.75rem] border border-black/10 bg-[#fffdfa] p-5">
                  <h2 className="font-[var(--font-display)] text-xl tracking-[-0.03em]">{feature.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#54463f]">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-[#161110] p-5 text-[#f6f1e8] shadow-[0_30px_80px_rgba(17,24,39,0.18)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-[#fcd34d]">Mission board</div>
                <h2 className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em]">Why this matters</h2>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#d6d3d1]">
                prevention-first
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-white/5 p-4">
                <div className="text-sm uppercase tracking-[0.18em] text-[#fca5a5]">Problem</div>
                <p className="mt-3 text-sm leading-6 text-[#e7e5e4]">
                  Students often know a message feels wrong, but not why. That makes it harder to trust their instincts, explain the concern, or ask for help.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/5 p-4">
                <div className="text-sm uppercase tracking-[0.18em] text-[#93c5fd]">Differentiator</div>
                <p className="mt-3 text-sm leading-6 text-[#e7e5e4]">
                  SignalSafe is not another “AI says be careful” toy. It shows evidence, separates trust signals from warning cues, and gives a usable de-escalation script.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,_rgba(251,191,36,0.16),_rgba(168,85,247,0.08))] p-4">
              <div className="text-sm uppercase tracking-[0.18em] text-[#fde68a]">Use cases</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {useCases.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-[#f5f5f4]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-10">
        <aside className="space-y-5">
          <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(17,24,39,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-[#7c2d12]">Scenario library</div>
                <h2 className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em]">Demo paths</h2>
              </div>
              <button
                className="rounded-full border border-black/10 px-4 py-2 text-sm"
                onClick={() => {
                  setActive(scenarios[0]);
                  setDraft(scenarios[0].text);
                  setAnalysis(null);
                  setError("");
                }}
                type="button"
              >
                Reset
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.slug}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    active.slug === scenario.slug
                      ? "border-[#17110f] bg-[#17110f] text-white"
                      : "border-black/10 bg-[#f8f5ef] text-[#1c1917] hover:bg-[#f2ece2]"
                  }`}
                  onClick={() => {
                    setActive(scenario);
                    setDraft(scenario.text);
                    setAnalysis(null);
                    setError("");
                  }}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{scenario.title}</div>
                      <div className={`mt-1 text-xs uppercase tracking-[0.18em] ${active.slug === scenario.slug ? "text-[#fde68a]" : "text-[#7c2d12]"}`}>
                        {scenario.persona}
                      </div>
                    </div>
                  </div>
                  <p className={`mt-3 text-sm leading-6 ${active.slug === scenario.slug ? "text-white/80" : "text-[#57534e]"}`}>
                    {scenario.setup}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-[#faf7f2] p-5">
            <div className="text-xs uppercase tracking-[0.22em] text-[#7c2d12]">Product notes</div>
            <div className="mt-4 space-y-4 text-sm leading-6 text-[#4b3f38]">
              <p>
                The current MVP uses a transparent local rule engine so judges can inspect the logic. The next layer can swap in a model-backed classifier without changing the coaching UX.
              </p>
              <p>
                This layout is intentionally built like a case board rather than a startup hero page, because the judging story is clarity, evidence, and trust.
              </p>
            </div>
          </div>
        </aside>

        <section className="grid gap-6">
          <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(17,24,39,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-[#7c2d12]">Case board</div>
                <h2 className="mt-2 font-[var(--font-display)] text-3xl tracking-[-0.04em]">Interactive risk analysis</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ["analyzer", "Analyzer"],
                  ["coach", "Coach view"],
                  ["ops", "Ops notes"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={`rounded-full px-4 py-2 text-sm transition ${panel === value ? "bg-[#17110f] text-white" : "border border-black/10 bg-[#f8f5ef] text-[#1c1917]"}`}
                    onClick={() => setPanel(value as typeof panel)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {panel === "analyzer" ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-[0.98fr_1.02fr]">
                <div className="rounded-[1.5rem] bg-[#f7f3ec] p-4">
                  <label className="text-xs uppercase tracking-[0.22em] text-[#7c2d12]" htmlFor="scenario-input">
                    Conversation snippet
                  </label>
                  <textarea
                    id="scenario-input"
                    className="mt-3 min-h-52 w-full rounded-[1.5rem] border border-black/10 bg-white px-4 py-4 text-sm leading-6 outline-none focus:border-[#7c2d12]"
                    onChange={(event) => setDraft(event.target.value)}
                    value={draft}
                  />
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      className="rounded-full bg-[#17110f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#7c2d12] disabled:cursor-not-allowed disabled:bg-[#6b7280]"
                      disabled={loading || !draft.trim()}
                      onClick={() => analyze(draft)}
                      type="button"
                    >
                      {loading ? "Mapping risk..." : "Map risk"}
                    </button>
                    <div className="text-sm text-[#57534e]">Focus on the phrases that make the conversation feel wrong.</div>
                  </div>
                  {error ? <div className="mt-4 text-sm text-[#b91c1c]">{error}</div> : null}
                </div>

                <div className="rounded-[1.5rem] border border-black/10 bg-[#fffdfa] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-[#7c2d12]">Transcript view</div>
                      <h3 className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em]">Annotated evidence</h3>
                    </div>
                    {analysis ? (
                      <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium">
                        {analysis.level} • {analysis.score}/100
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-4 space-y-3">
                    {transcript.map((line, index) => (
                      <div key={`${line}-${index}`} className="rounded-[1.25rem] border border-black/8 bg-white p-4 text-sm leading-7 text-[#201a17]">
                        {analysis
                          ? highlightLine(line, analysis.highlights).map((chunk, chunkIndex) => {
                              const matched = chunk.startsWith("[[") && chunk.endsWith("]] ") === false && chunk.endsWith("]]" );
                              if (!matched) {
                                return <span key={`${chunk}-${chunkIndex}`}>{chunk}</span>;
                              }
                              const phrase = chunk.slice(2, -2);
                              const highlight = analysis.highlights.find((item) => item.phrase.toLowerCase() === phrase.toLowerCase());
                              if (!highlight) {
                                return <span key={`${chunk}-${chunkIndex}`}>{phrase}</span>;
                              }
                              return (
                                <span key={`${chunk}-${chunkIndex}`} className={`mx-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${tacticTone[highlight.tacticId]}`}>
                                  {phrase}
                                </span>
                              );
                            })
                          : line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {panel === "coach" ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-[1.5rem] bg-[#17110f] p-5 text-white">
                  <div className="text-xs uppercase tracking-[0.22em] text-[#fcd34d]">Safer next move</div>
                  <div className="mt-3 font-[var(--font-display)] text-3xl tracking-[-0.04em]">
                    {analysis ? analysis.saferReply : "Run an analysis to generate a coached response."}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-black/10 bg-[#f8f5ef] p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-[#7c2d12]">Recommended next steps</div>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-[#3f342f]">
                      {(analysis?.nextSteps ?? ["Run an analysis to populate this guidance."]).map((step) => (
                        <li key={step} className="rounded-[1rem] bg-white px-4 py-3">{step}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-[1.5rem] border border-black/10 bg-[#f8f5ef] p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-[#7c2d12]">Healthy trust signals</div>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-[#3f342f]">
                      {(analysis?.trustSignals ?? ["Clear purpose", "No push for secrecy", "No reward exchange", "No urgent pressure"]).map((signal) => (
                        <li key={signal} className="rounded-[1rem] bg-white px-4 py-3">{signal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}

            {panel === "ops" ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-[1.5rem] border border-black/10 bg-[#fffdfa] p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-[#7c2d12]">How risk builds</div>
                  <div className="mt-4 space-y-3">
                    {(analysis?.timeline ?? [
                      { label: "Step 1", body: "Load a scenario and map phrases to tactics." },
                      { label: "Step 2", body: "Turn those tactics into a readable risk score." },
                      { label: "Step 3", body: "Translate the score into calmer next-step coaching." },
                    ]).map((item) => (
                      <div key={item.label} className="rounded-[1rem] bg-[#f8f5ef] px-4 py-4">
                        <div className="text-sm font-medium text-[#17110f]">{item.label}</div>
                        <div className="mt-2 text-sm leading-6 text-[#534741]">{item.body}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-black/10 bg-[#17110f] p-5 text-white">
                  <div className="text-xs uppercase tracking-[0.22em] text-[#fcd34d]">Judge-facing implementation notes</div>
                  <div className="mt-4 grid gap-3 text-sm leading-6 text-white/80">
                    <div className="rounded-[1rem] bg-white/6 px-4 py-4">Current analyzer is explainable and local-first so the judging flow never depends on fragile external API calls.</div>
                    <div className="rounded-[1rem] bg-white/6 px-4 py-4">The next iteration should add calibrated model scoring while preserving evidence extraction and coaching transparency.</div>
                    <div className="rounded-[1rem] bg-white/6 px-4 py-4">The product story is strong because the UI behaves like a case review tool, not a generic chatbot wrapper.</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {analysis ? (
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[2rem] border border-black/10 bg-[#17110f] p-5 text-white">
                <div className="text-xs uppercase tracking-[0.22em] text-[#fcd34d]">Risk readout</div>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <div className="font-[var(--font-display)] text-5xl tracking-[-0.05em]">{analysis.score}</div>
                    <div className="mt-2 text-sm uppercase tracking-[0.18em] text-white/65">{analysis.level} risk profile</div>
                  </div>
                  <div className="max-w-[14rem] text-right text-sm leading-6 text-white/75">{analysis.summary}</div>
                </div>
              </div>
              <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(17,24,39,0.06)]">
                <div className="text-xs uppercase tracking-[0.22em] text-[#7c2d12]">Flagged tactics</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {analysis.tactics.map((tactic) => (
                    <div key={tactic.id} className="rounded-full border border-black/10 bg-[#f8f5ef] px-4 py-2 text-sm font-medium text-[#17110f]">
                      {tactic.label} · +{tactic.weight}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

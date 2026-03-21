"use client";

import { useState } from "react";

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

type AnalysisResponse = {
  score: number;
  level: "low" | "moderate" | "high";
  summary: string;
  tactics: Tactic[];
  nextSteps: string[];
  saferReply: string;
};

const examples = [
  {
    title: "Pressure to move off-platform",
    text: "Don't tell anyone we talked. Add me on Telegram so your parents don't see. I need you to reply now before I get busy.",
  },
  {
    title: "Boundary-testing compliment spiral",
    text: "You're way more mature than kids your age. I could buy you that game if you send me a private picture first.",
  },
  {
    title: "Harmless school collaboration",
    text: "Can you send the robotics slides? We should split the work before class tomorrow.",
  },
];

const metrics = [
  { label: "Student tracks", value: "High school + college" },
  { label: "Prize signal", value: "US $15,000+" },
  { label: "Format", value: "Virtual, global, team-friendly" },
];

const pillars = [
  {
    title: "Explainable safety scoring",
    body: "Flags manipulative tactics like secrecy, urgency, gift leverage, and isolation instead of producing a black-box answer.",
  },
  {
    title: "Practice, not panic",
    body: "Turns concerning conversations into coaching: what to notice, what to say next, and who to involve.",
  },
  {
    title: "Responsible by default",
    body: "No surveillance framing, no diagnosis, no pretending to replace trusted adults or professionals.",
  },
];

export default function Home() {
  const [scenario, setScenario] = useState(examples[0].text);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAnalysis(input: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = (await response.json()) as AnalysisResponse;
      setAnalysis(data);
    } catch {
      setError("The local analyzer did not respond. Check the dev server and retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_26%),linear-gradient(135deg,_#0f172a_0%,_#14213d_42%,_#3b0764_100%)] text-slate-50">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-8 sm:px-10 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/15 bg-white/6 px-5 py-3 text-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-300/20 px-3 py-1 font-medium text-emerald-100">
              USAII Hackathon concept
            </span>
            <span className="text-slate-200/85">
              SignalSafe: explainable AI coaching for online safety
            </span>
          </div>
          <div className="text-slate-200/75">Built for student safety, literacy, and prevention.</div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">
                AI for health, wellbeing, and safer communities
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Help students recognize risky online behavior before it becomes harm.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-200/85">
                SignalSafe analyzes a conversation, highlights manipulation tactics in plain language, and coaches the user toward safer next steps. It is designed as a prevention and education tool, not a surveillance product.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-3xl border border-white/10 bg-white/8 p-5 shadow-[0_14px_60px_rgba(8,15,36,0.32)] backdrop-blur"
                >
                  <div className="text-sm text-cyan-100/75">{metric.label}</div>
                  <div className="mt-3 text-xl font-medium text-white">{metric.value}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-3xl border border-white/10 bg-slate-950/30 p-5 backdrop-blur"
                >
                  <h2 className="text-lg font-medium text-white">{pillar.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-200/80">{pillar.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-[0_24px_80px_rgba(5,10,30,0.45)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-fuchsia-200/70">
                  Live demo
                </div>
                <h2 className="mt-2 text-2xl font-medium text-white">Conversation analyzer</h2>
              </div>
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
                onClick={() => {
                  setScenario(examples[0].text);
                  setAnalysis(null);
                  setError("");
                }}
                type="button"
              >
                Reset
              </button>
            </div>

            <div className="grid gap-3">
              {examples.map((example) => (
                <button
                  key={example.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-300/45 hover:bg-white/8"
                  onClick={() => setScenario(example.text)}
                  type="button"
                >
                  <div className="text-sm font-medium text-white">{example.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-200/75">{example.text}</div>
                </button>
              ))}
            </div>

            <label className="mt-5 block text-sm font-medium text-slate-100" htmlFor="scenario">
              Paste a conversation snippet
            </label>
            <textarea
              id="scenario"
              className="mt-3 min-h-44 w-full rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-4 text-sm leading-6 text-slate-50 outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-300/45"
              onChange={(event) => setScenario(event.target.value)}
              placeholder="Paste DMs, texts, or a fictional scenario here."
              value={scenario}
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-cyan-300/60"
                disabled={loading || !scenario.trim()}
                onClick={() => runAnalysis(scenario)}
                type="button"
              >
                {loading ? "Analyzing..." : "Run safety analysis"}
              </button>
              <span className="text-sm text-slate-300/75">
                Local demo logic today; can be upgraded to a model-backed version later.
              </span>
            </div>

            {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

            {analysis ? (
              <div className="mt-6 space-y-4 rounded-[1.75rem] border border-cyan-200/15 bg-black/25 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm uppercase tracking-[0.2em] text-slate-300/70">
                      Risk level
                    </div>
                    <div className="mt-1 text-3xl font-semibold text-white">{analysis.level}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-right">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-300/70">
                      Score
                    </div>
                    <div className="text-2xl font-semibold text-cyan-200">{analysis.score}/100</div>
                  </div>
                </div>

                <p className="text-sm leading-6 text-slate-200/85">{analysis.summary}</p>

                <div className="grid gap-3">
                  {analysis.tactics.map((tactic) => (
                    <div
                      key={tactic.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-medium text-white">{tactic.label}</h3>
                        <span className="rounded-full bg-fuchsia-200/15 px-3 py-1 text-xs uppercase tracking-[0.16em] text-fuchsia-100">
                          +{tactic.weight}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-200/80">
                        {tactic.explanation}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tactic.hits.map((hit) => (
                          <span
                            key={hit}
                            className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs text-slate-200"
                          >
                            {hit}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200/12 bg-emerald-300/8 p-4">
                    <h3 className="text-sm uppercase tracking-[0.2em] text-emerald-100/80">
                      Safer response coach
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-100/90">
                      {analysis.saferReply}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-sm uppercase tracking-[0.2em] text-slate-200/80">
                      Recommended next steps
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-100/90">
                      {analysis.nextSteps.map((step) => (
                        <li key={step}>• {step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[1.75rem] border border-dashed border-white/12 bg-black/15 p-5 text-sm leading-6 text-slate-300/75">
                Run the analyzer to see explainable safety signals, a coaching summary, and recommended next steps.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";

type Severity = "info" | "watch" | "critical";

type ChildProfile = {
  id: string;
  name: string;
  age: number;
  status: string;
  lastSync: string;
  apps: string[];
  mode: string;
};

type EventRecord = {
  id: string;
  app: string;
  at: string;
  text: string;
};

type AlertCard = {
  id: string;
  severity: Severity;
  title: string;
  score: number;
  summary: string;
  evidence: string[];
  channels: string[];
  actionPlan: string[];
  app: string;
};

type DeliveryPlan = {
  primary: string;
  backup: string;
  escalation: string;
};

type AnalysisResponse = {
  childName: string;
  overallRisk: Severity;
  overallScore: number;
  statusLine: string;
  guardianDigest: string;
  alerts: AlertCard[];
  privacyNotes: string[];
  dashboardStats: {
    processed: string;
    flagged: string;
    redacted: string;
    queued: string;
  };
  deliveryPlan: DeliveryPlan;
};

type ActionEntry = {
  id: string;
  at: string;
  alertTitle: string;
  action: string;
  outcome: string;
};

const children: ChildProfile[] = [
  {
    id: "maya",
    name: "Maya",
    age: 10,
    status: "Protected",
    lastSync: "2 min ago",
    apps: ["YouTube Kids", "Messenger Kids", "Roblox"],
    mode: "On-device scan + guardian digest",
  },
  {
    id: "leo",
    name: "Leo",
    age: 8,
    status: "Watching",
    lastSync: "5 min ago",
    apps: ["Minecraft chat", "Family tablet browser"],
    mode: "Sensitive phrases only",
  },
  {
    id: "nina",
    name: "Nina",
    age: 6,
    status: "Quiet hours",
    lastSync: "11 min ago",
    apps: ["School tablet", "Reading app"],
    mode: "School-safe whitelist",
  },
];

const eventLibrary: Record<string, EventRecord[]> = {
  maya: [
    {
      id: "m1",
      app: "Messenger Kids",
      at: "7:42 PM",
      text: "dont tell your mom we talked. add me on telegram and reply right now before i leave.",
    },
    {
      id: "m2",
      app: "Roblox",
      at: "7:39 PM",
      text: "you're way more mature than other kids. i can gift you robux if you send a private picture first.",
    },
    {
      id: "m3",
      app: "YouTube Kids",
      at: "7:34 PM",
      text: "normal gameplay comment stream, no direct message risk in this clip.",
    },
  ],
  leo: [
    {
      id: "l1",
      app: "Minecraft chat",
      at: "6:15 PM",
      text: "come to the private server and dont involve your dad because adults ruin it.",
    },
    {
      id: "l2",
      app: "Browser",
      at: "6:10 PM",
      text: "where do you live? i can send a reward if you join voice alone.",
    },
  ],
  nina: [
    {
      id: "n1",
      app: "Reading app",
      at: "4:02 PM",
      text: "great job finishing your reading quest. your teacher can see your progress.",
    },
    {
      id: "n2",
      app: "School tablet",
      at: "3:54 PM",
      text: "please submit the coloring worksheet before class tomorrow.",
    },
  ],
};

const architecture = [
  {
    title: "On-device first",
    body: "The child device scans message fragments locally and only ships redacted incident summaries upstream.",
  },
  {
    title: "Guardian control center",
    body: "Parents configure channels, quiet hours, emergency escalation, and safe-contact routing from one dashboard.",
  },
  {
    title: "Immediate escalation",
    body: "Critical incidents create a push alert first, then SMS/email fallback if the guardian does not acknowledge.",
  },
];

const controls = [
  "Redact raw conversation text by default",
  "Send only phrase-level evidence unless a guardian unlocks more detail",
  "Respect school hours and app-level whitelists",
  "Escalate to a second guardian if the primary does not respond in 5 minutes",
];

const severityTone: Record<Severity, string> = {
  info: "bg-[#d1fae5] text-[#065f46] border-[#6ee7b7]",
  watch: "bg-[#fef3c7] text-[#92400e] border-[#fbbf24]",
  critical: "bg-[#fee2e2] text-[#991b1b] border-[#f87171]",
};

export default function Home() {
  const [activeChild, setActiveChild] = useState(children[0]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"dashboard" | "policy" | "deploy">("dashboard");
  const [actionLog, setActionLog] = useState<ActionEntry[]>([]);
  const [acknowledged, setAcknowledged] = useState<string[]>([]);

  const activeEvents = useMemo(() => eventLibrary[activeChild.id], [activeChild]);

  async function runGuardianScan(child: ChildProfile) {
    setLoading(true);
    setError("");
    setAcknowledged([]);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: child.name,
          childAge: child.age,
          events: eventLibrary[child.id],
        }),
      });

      if (!response.ok) {
        throw new Error("Scan failed");
      }

      const data = (await response.json()) as AnalysisResponse;
      setAnalysis(data);
      setActionLog((current) => [
        {
          id: crypto.randomUUID(),
          at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          alertTitle: `${child.name} scan`,
          action: "Device scan completed",
          outcome: data.statusLine,
        },
        ...current,
      ]);
    } catch {
      setError("Guardian scan unavailable. Check the local app process and retry.");
    } finally {
      setLoading(false);
    }
  }

  function handleAlertAction(alert: AlertCard, action: "Acknowledge" | "Call child" | "Lock app" | "Escalate") {
    if (action === "Acknowledge") {
      setAcknowledged((current) => (current.includes(alert.id) ? current : [alert.id, ...current]));
    }

    const outcomeMap = {
      Acknowledge: "Primary guardian confirmed receipt and paused fallback SMS.",
      "Call child": "Guardian check-in call initiated from the dashboard.",
      "Lock app": `Temporary lock requested for ${alert.app}.`,
      Escalate: "Escalation packet sent to the second guardian and email backup.",
    } as const;

    setActionLog((current) => [
      {
        id: crypto.randomUUID(),
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        alertTitle: alert.title,
        action,
        outcome: outcomeMap[action],
      },
      ...current,
    ]);
  }

  return (
    <main className="min-h-screen bg-[#eef2f7] text-[#111827]">
      <section className="border-b border-[#d7dee9] bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_55%,_#334155_100%)] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-14">
          <div className="space-y-7">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-[#cbd5e1]">
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2">Guardian deployment concept</span>
              <span className="rounded-full border border-[#38bdf8]/30 bg-[#082f49] px-4 py-2 text-[#bae6fd]">privacy-respecting by default</span>
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl font-[var(--font-display)] text-5xl leading-[0.94] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                SignalSafe becomes a parent console, not a text box toy.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[#dbe4f0]">
                The child device scans locally, collapses risky interactions into redacted alerts, and gives parents an immediate dashboard with escalation channels, acknowledgement flow, and evidence summaries without exposing every private conversation.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.2em] text-[#bae6fd]">Audience</div>
                <div className="mt-3 text-xl font-semibold">Parents of kids 10 and under</div>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.2em] text-[#bae6fd]">Core promise</div>
                <div className="mt-3 text-xl font-semibold">Detect early, alert fast, keep context private</div>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.2em] text-[#bae6fd]">Alerting</div>
                <div className="mt-3 text-xl font-semibold">Push, SMS, email fallback</div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_26px_90px_rgba(15,23,42,0.28)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-[#93c5fd]">System architecture</div>
                <h2 className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em]">Privacy-respecting alert loop</h2>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#e2e8f0]">
                local-first
              </div>
            </div>
            <div className="mt-5 grid gap-4">
              {architecture.map((item) => (
                <div key={item.title} className="rounded-[1.5rem] bg-black/18 p-4">
                  <div className="font-[var(--font-display)] text-xl">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-[#dbe4f0]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:px-10 lg:grid-cols-[0.82fr_1.18fr] lg:px-12 lg:py-10">
        <aside className="space-y-5">
          <div className="rounded-[2rem] border border-[#d7dee9] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Child devices</div>
                <h2 className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em]">Guardian fleet</h2>
              </div>
              <button
                className="rounded-full border border-[#cbd5e1] px-4 py-2 text-sm"
                onClick={() => runGuardianScan(activeChild)}
                type="button"
              >
                {loading ? "Scanning..." : "Run scan"}
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {children.map((child) => (
                <button
                  key={child.id}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    activeChild.id === child.id
                      ? "border-[#0f172a] bg-[#0f172a] text-white"
                      : "border-[#d7dee9] bg-[#f8fafc] hover:bg-[#f1f5f9]"
                  }`}
                  onClick={() => {
                    setActiveChild(child);
                    setAnalysis(null);
                    setError("");
                  }}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{child.name}, age {child.age}</div>
                      <div className={`mt-1 text-xs uppercase tracking-[0.18em] ${activeChild.id === child.id ? "text-[#93c5fd]" : "text-[#0f766e]"}`}>
                        {child.status}
                      </div>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-xs ${activeChild.id === child.id ? "bg-white/10" : "bg-[#e2e8f0]"}`}>
                      {child.lastSync}
                    </div>
                  </div>
                  <div className={`mt-3 text-sm leading-6 ${activeChild.id === child.id ? "text-white/78" : "text-[#475569]"}`}>
                    {child.mode}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {child.apps.map((app) => (
                      <span
                        key={app}
                        className={`rounded-full px-3 py-1 text-xs ${activeChild.id === child.id ? "border border-white/10 bg-white/6" : "bg-white border border-[#d7dee9]"}`}
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d7dee9] bg-[#f8fafc] p-5">
            <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Privacy controls</div>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-[#475569]">
              {controls.map((item) => (
                <div key={item} className="rounded-[1rem] border border-white bg-white px-4 py-4">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="grid gap-6">
          <div className="rounded-[2rem] border border-[#d7dee9] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Guardian console</div>
                <h2 className="mt-2 font-[var(--font-display)] text-3xl tracking-[-0.04em]">Parent dashboard</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ["dashboard", "Alert center"],
                  ["policy", "Policy studio"],
                  ["deploy", "Deployment"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={`rounded-full px-4 py-2 text-sm transition ${tab === value ? "bg-[#0f172a] text-white" : "border border-[#d7dee9] bg-[#f8fafc] text-[#0f172a]"}`}
                    onClick={() => setTab(value as typeof tab)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {tab === "dashboard" ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
                <div className="space-y-4">
                  <div className="rounded-[1.5rem] bg-[#0f172a] p-5 text-white">
                    <div className="text-xs uppercase tracking-[0.22em] text-[#93c5fd]">Selected child</div>
                    <div className="mt-3 font-[var(--font-display)] text-4xl tracking-[-0.05em]">{activeChild.name}</div>
                    <div className="mt-2 text-sm text-[#cbd5e1]">Age {activeChild.age} • last sync {activeChild.lastSync}</div>
                    <div className="mt-4 text-sm leading-6 text-[#dbe4f0]">
                      {analysis?.guardianDigest ?? "Run a scan to produce a guardian digest, alert queue, and delivery plan."}
                    </div>
                    {analysis ? (
                      <div className={`mt-4 inline-flex rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${severityTone[analysis.overallRisk]}`}>
                        {analysis.statusLine}
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[1.5rem] border border-[#d7dee9] bg-[#f8fafc] p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Recent device activity</div>
                    <div className="mt-4 space-y-3">
                      {activeEvents.map((event) => (
                        <div key={event.id} className="rounded-[1rem] border border-white bg-white px-4 py-4">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <div className="font-medium text-[#111827]">{event.app}</div>
                            <div className="text-[#64748b]">{event.at}</div>
                          </div>
                          <div className="mt-2 text-sm leading-6 text-[#475569]">{event.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-5">
                  <div className="grid gap-4 md:grid-cols-4">
                    <StatCard label="Events scanned" value={analysis?.dashboardStats.processed ?? activeEvents.length.toString()} tone="slate" />
                    <StatCard label="Flagged" value={analysis?.dashboardStats.flagged ?? "0"} tone="amber" />
                    <StatCard label="Redacted snippets" value={analysis?.dashboardStats.redacted ?? "0"} tone="emerald" />
                    <StatCard label="Queued alerts" value={analysis?.dashboardStats.queued ?? "0"} tone="rose" />
                  </div>

                  <div className="rounded-[1.5rem] border border-[#d7dee9] bg-[#fffdfa] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Immediate notifications</div>
                        <h3 className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em]">Delivery plan</h3>
                      </div>
                      {analysis ? (
                        <span className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] ${severityTone[analysis.overallRisk]}`}>
                          {analysis.overallRisk}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <PlanCard title="Primary" body={analysis?.deliveryPlan.primary ?? "Push notification to the primary guardian app."} />
                      <PlanCard title="Fallback" body={analysis?.deliveryPlan.backup ?? "SMS fallback after missed acknowledgement."} />
                      <PlanCard title="Escalation" body={analysis?.deliveryPlan.escalation ?? "Second guardian + email bundle if still unresolved."} />
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-[#d7dee9] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Alert center</div>
                        <h3 className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em]">Incident queue</h3>
                      </div>
                      {error ? <div className="text-sm text-[#b91c1c]">{error}</div> : null}
                    </div>
                    <div className="mt-4 grid gap-4">
                      {(analysis?.alerts ?? []).length > 0 ? (
                        analysis?.alerts.map((alert) => {
                          const isAcknowledged = acknowledged.includes(alert.id);
                          return (
                            <div key={alert.id} className="rounded-[1.5rem] border border-[#e5e7eb] bg-[#f8fafc] p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-[#111827]">{alert.title}</div>
                                  <div className="mt-1 text-sm text-[#64748b]">{alert.app} • score {alert.score}</div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {isAcknowledged ? (
                                    <span className="rounded-full border border-[#86efac] bg-[#dcfce7] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#166534]">
                                      acknowledged
                                    </span>
                                  ) : null}
                                  <div className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] ${severityTone[alert.severity]}`}>
                                    {alert.severity}
                                  </div>
                                </div>
                              </div>
                              <p className="mt-3 text-sm leading-6 text-[#475569]">{alert.summary}</p>
                              <div className="mt-4 grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                                <div>
                                  <div className="text-xs uppercase tracking-[0.18em] text-[#0f766e]">Redacted evidence</div>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {alert.evidence.map((item) => (
                                      <span key={item} className="rounded-full border border-[#d7dee9] bg-white px-3 py-2 text-xs text-[#334155]">
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-[0.18em] text-[#0f766e]">Action plan</div>
                                  <ul className="mt-2 space-y-2 text-sm leading-6 text-[#334155]">
                                    {alert.actionPlan.map((step) => (
                                      <li key={step}>• {step}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {alert.channels.map((channel) => (
                                  <span key={channel} className="rounded-full bg-[#0f172a] px-3 py-2 text-xs text-white">
                                    {channel}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {(["Acknowledge", "Call child", "Lock app", "Escalate"] as const).map((action) => (
                                  <button
                                    key={action}
                                    className="rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-sm text-[#111827] transition hover:bg-[#f1f5f9]"
                                    onClick={() => handleAlertAction(alert, action)}
                                    type="button"
                                  >
                                    {action}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-[1.5rem] border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-6 text-sm leading-6 text-[#64748b]">
                          Run a guardian scan to populate alert cards, evidence summaries, and escalation steps.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "policy" ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <PolicyPanel
                  title="Alert thresholds"
                  items={[
                    "Critical if secrecy + off-platform move appear together",
                    "Watch if reward leverage appears without a location request",
                    "Suppress low-risk classroom workflows during school hours",
                  ]}
                />
                <PolicyPanel
                  title="Guardian routing"
                  items={[
                    "Primary guardian gets push instantly",
                    "SMS fallback after 5 minutes without acknowledgement",
                    "Second guardian escalation after 10 minutes on critical incidents",
                  ]}
                />
                <PolicyPanel
                  title="Child privacy defaults"
                  items={[
                    "Raw text stays local unless the guardian requests an unlock",
                    "Only phrase-level evidence leaves the device",
                    "App-level allowlists reduce unnecessary scanning",
                  ]}
                />
                <PolicyPanel
                  title="Parent response workflow"
                  items={[
                    "Acknowledge alert",
                    "Review redacted evidence",
                    "Choose call / message / lock device / escalate",
                  ]}
                />
              </div>
            ) : null}

            {tab === "deploy" ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-[1.5rem] border border-[#d7dee9] bg-[#f8fafc] p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Deployment flow</div>
                  <ol className="mt-4 space-y-3 text-sm leading-6 text-[#334155]">
                    <li>1. Parent installs the child app or profile on the kid device.</li>
                    <li>2. Device runs local scanning on approved messaging surfaces.</li>
                    <li>3. Only redacted incident packets sync to the guardian dashboard.</li>
                    <li>4. Push alert fires immediately for critical incidents.</li>
                    <li>5. Parent acknowledges, reviews, and escalates if needed.</li>
                  </ol>
                </div>
                <div className="rounded-[1.5rem] border border-[#d7dee9] bg-[#0f172a] p-5 text-white">
                  <div className="text-xs uppercase tracking-[0.22em] text-[#93c5fd]">Why judges should care</div>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-[#dbe4f0]">
                    <p>This is a deployable family safety product concept, not a one-off classifier demo.</p>
                    <p>The privacy model is concrete: local scanning, redacted sync, explicit guardian routing.</p>
                    <p>The dashboard now includes acknowledgement and response logging, so the alerting flow behaves like an actual product operation.</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-[#d7dee9] bg-[#0f172a] p-5 text-white">
              <div className="text-xs uppercase tracking-[0.22em] text-[#93c5fd]">Response log</div>
              <div className="mt-3 font-[var(--font-display)] text-3xl tracking-[-0.04em]">Guardian action timeline</div>
              <div className="mt-4 space-y-3">
                {actionLog.length > 0 ? (
                  actionLog.map((entry) => (
                    <div key={entry.id} className="rounded-[1rem] bg-white/6 px-4 py-4">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="font-medium">{entry.action}</div>
                        <div className="text-[#94a3b8]">{entry.at}</div>
                      </div>
                      <div className="mt-2 text-sm text-[#e2e8f0]">{entry.alertTitle}</div>
                      <div className="mt-1 text-sm leading-6 text-[#cbd5e1]">{entry.outcome}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1rem] bg-white/6 px-4 py-4 text-sm text-[#cbd5e1]">
                    Scan a device or act on an alert to populate the guardian response timeline.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#d7dee9] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Trust boundary</div>
              <div className="mt-3 font-[var(--font-display)] text-3xl tracking-[-0.04em] text-[#111827]">What leaves the child device</div>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-[#334155]">
                <div className="rounded-[1rem] border border-[#d7dee9] bg-[#f8fafc] px-4 py-4">Risk score and severity classification</div>
                <div className="rounded-[1rem] border border-[#d7dee9] bg-[#f8fafc] px-4 py-4">Redacted evidence phrases instead of full messages</div>
                <div className="rounded-[1rem] border border-[#d7dee9] bg-[#f8fafc] px-4 py-4">App name and timestamp for guardian triage</div>
                <div className="rounded-[1rem] border border-[#d7dee9] bg-[#f8fafc] px-4 py-4">Acknowledgement and escalation state for guardian coordination</div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "slate" | "amber" | "emerald" | "rose";
}) {
  const toneMap = {
    slate: "bg-[#e2e8f0] text-[#0f172a]",
    amber: "bg-[#fef3c7] text-[#92400e]",
    emerald: "bg-[#d1fae5] text-[#065f46]",
    rose: "bg-[#fee2e2] text-[#991b1b]",
  } as const;

  return (
    <div className="rounded-[1.5rem] border border-[#d7dee9] bg-[#f8fafc] p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-[#64748b]">{label}</div>
      <div className={`mt-3 inline-flex rounded-full px-4 py-2 text-2xl font-semibold ${toneMap[tone]}`}>
        {value}
      </div>
    </div>
  );
}

function PlanCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[#d7dee9] bg-[#f8fafc] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[#0f766e]">{title}</div>
      <div className="mt-3 text-sm leading-6 text-[#334155]">{body}</div>
    </div>
  );
}

function PolicyPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[1.5rem] border border-[#d7dee9] bg-[#f8fafc] p-5">
      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">{title}</div>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-[#334155]">
        {items.map((item) => (
          <li key={item} className="rounded-[1rem] border border-white bg-white px-4 py-4">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

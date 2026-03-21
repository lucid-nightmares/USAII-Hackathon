"use client";

import { useMemo, useState } from "react";

type Severity = "info" | "watch" | "critical";
type RouteStatus = "armed" | "fallback" | "idle";

type ChildProfile = {
  id: string;
  name: string;
  age: number;
  status: string;
  checkIn: string;
  device: string;
  coverage: string;
  apps: string[];
  installState: string;
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
  matchedTactics: string[];
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
  recommendation: string;
};

type ActionEntry = {
  id: string;
  at: string;
  alertTitle: string;
  action: string;
  outcome: string;
};

type GuardianRoute = {
  label: string;
  detail: string;
  status: RouteStatus;
};

type InstallKit = {
  id: string;
  name: string;
  format: string;
  setupTime: string;
  audience: string;
  promise: string;
};

type PolicyModule = {
  title: string;
  summary: string;
  chips: string[];
};

const children: ChildProfile[] = [
  {
    id: "maya",
    name: "Maya",
    age: 10,
    status: "Two active alerts",
    checkIn: "2 min ago",
    device: "iPad mini + Messenger Kids",
    coverage: "on-device scan + redacted sync",
    apps: ["Messenger Kids", "Roblox", "YouTube Kids"],
    installState: "Guardian kit active",
  },
  {
    id: "leo",
    name: "Leo",
    age: 8,
    status: "Watchlisted contact pattern",
    checkIn: "5 min ago",
    device: "Android family phone",
    coverage: "sensitive phrase watch",
    apps: ["Minecraft chat", "Chrome supervised", "Google Messages"],
    installState: "School hours profile",
  },
  {
    id: "nina",
    name: "Nina",
    age: 6,
    status: "No live concerns",
    checkIn: "11 min ago",
    device: "School tablet",
    coverage: "whitelist only",
    apps: ["School tablet", "Reading app", "Family browser"],
    installState: "Quiet-hours profile",
  },
];

const eventsByChild: Record<string, EventRecord[]> = {
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
      app: "Chrome supervised",
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

const installKits: InstallKit[] = [
  {
    id: "ipad",
    name: "Apple family kit",
    format: "child profile",
    setupTime: "4 min",
    audience: "shared iPad / iPhone",
    promise: "Installs a local safety profile, approved app list, and guardian push route without exposing the child transcript.",
  },
  {
    id: "android",
    name: "Android family agent",
    format: "guardian companion",
    setupTime: "6 min",
    audience: "first device phone users",
    promise: "Adds supervised messaging surfaces, risk scanning, and one-tap parent escalation for critical incidents.",
  },
  {
    id: "school",
    name: "School-safe tablet mode",
    format: "restricted profile",
    setupTime: "3 min",
    audience: "classroom or homework tablets",
    promise: "Keeps scanning restricted to approved apps and suppresses low-risk academic workflows during school hours.",
  },
];

const policyModules: PolicyModule[] = [
  {
    title: "Immediate intervention",
    summary: "Critical secrecy plus off-platform movement triggers push, fallback SMS, and second guardian escalation automatically.",
    chips: ["5 min SMS delay", "10 min backup guardian", "device lock allowed"],
  },
  {
    title: "Child privacy boundary",
    summary: "The dashboard receives risk packets, timestamps, apps, and redacted phrase fragments. Full transcript unlock stays opt-in.",
    chips: ["redacted evidence", "local transcript only", "guardian unlock gate"],
  },
  {
    title: "Family rules",
    summary: "Parents can tune school-hour suppression, allowed contacts, protected apps, and how aggressively the system escalates.",
    chips: ["school hours", "trusted adults", "app allowlists"],
  },
];

const severityTone: Record<Severity, string> = {
  info: "border-[#93c5fd] bg-[#e0f2fe] text-[#0c4a6e]",
  watch: "border-[#facc15] bg-[#fef3c7] text-[#854d0e]",
  critical: "border-[#fb7185] bg-[#ffe4e6] text-[#9f1239]",
};

const routeTone: Record<RouteStatus, string> = {
  armed: "border-[#0f766e] bg-[#ccfbf1] text-[#115e59]",
  fallback: "border-[#c2410c] bg-[#ffedd5] text-[#9a3412]",
  idle: "border-[#cbd5e1] bg-[#f8fafc] text-[#475569]",
};

export default function Home() {
  const [activeChildId, setActiveChildId] = useState(children[0].id);
  const [tab, setTab] = useState<"command" | "family" | "deploy">("command");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLog, setActionLog] = useState<ActionEntry[]>([]);
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const [selectedKit, setSelectedKit] = useState(installKits[0].id);

  const activeChild = children.find((child) => child.id === activeChildId) ?? children[0];
  const activeEvents = useMemo(() => eventsByChild[activeChild.id] ?? [], [activeChild.id]);

  const notificationRoutes: GuardianRoute[] = useMemo(() => {
    if (!analysis) {
      return [
        {
          label: "Primary guardian push",
          detail: "Arms as soon as a child device uploads a redacted incident packet.",
          status: "armed",
        },
        {
          label: "Fallback SMS",
          detail: "Waits for acknowledgement before activating.",
          status: "idle",
        },
        {
          label: "Second guardian + email",
          detail: "Escalates only for repeat or critical patterns.",
          status: "idle",
        },
      ];
    }

    return [
      {
        label: "Primary guardian push",
        detail: analysis.deliveryPlan.primary,
        status: "armed",
      },
      {
        label: "Fallback SMS",
        detail: analysis.deliveryPlan.backup,
        status: analysis.overallRisk === "critical" ? "fallback" : "idle",
      },
      {
        label: "Second guardian + email",
        detail: analysis.deliveryPlan.escalation,
        status: analysis.overallRisk === "critical" ? "fallback" : "idle",
      },
    ];
  }, [analysis]);

  async function runGuardianScan() {
    setLoading(true);
    setError("");
    setAcknowledged([]);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: activeChild.name,
          childAge: activeChild.age,
          events: activeEvents,
        }),
      });

      if (!response.ok) {
        throw new Error("Guardian scan failed");
      }

      const payload = (await response.json()) as AnalysisResponse;
      setAnalysis(payload);
      appendAction(`${activeChild.name} scan`, "Device scan completed", payload.statusLine);
    } catch {
      setError("Guardian scan unavailable. Check the local app process and retry.");
    } finally {
      setLoading(false);
    }
  }

  function appendAction(alertTitle: string, action: string, outcome: string) {
    setActionLog((current) => [
      {
        id: crypto.randomUUID(),
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        alertTitle,
        action,
        outcome,
      },
      ...current,
    ]);
  }

  function handleAlertAction(alert: AlertCard, action: "Acknowledge" | "Call child" | "Lock app" | "Escalate") {
    if (action === "Acknowledge") {
      setAcknowledged((current) => (current.includes(alert.id) ? current : [alert.id, ...current]));
    }

    const outcomeMap = {
      Acknowledge: "Fallback SMS paused. Guardian has the incident in-hand.",
      "Call child": `Check-in call opened for ${activeChild.name} with the alert context attached.`,
      "Lock app": `${alert.app} moved into temporary restricted mode pending guardian review.`,
      Escalate: "Secondary guardian and email backup received the incident packet.",
    } as const;

    appendAction(alert.title, action, outcomeMap[action]);
  }

  const topAlert = analysis?.alerts[0] ?? null;
  const activeKit = installKits.find((kit) => kit.id === selectedKit) ?? installKits[0];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#edf3fb_0%,_#f8fafc_45%,_#eef4ef_100%)] text-[#0f172a]">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_#10243f_0%,_#16355b_42%,_#1f6f78_100%)] text-white shadow-[0_35px_120px_rgba(15,23,42,0.2)]">
          <div className="grid gap-8 px-6 py-7 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-9">
            <div className="space-y-7">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-[#bfdbfe]">
                <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2">guardian ops console</span>
                <span className="rounded-full border border-[#99f6e4]/20 bg-[#0f3b4d] px-4 py-2 text-[#ccfbf1]">built for kids 10 and under</span>
              </div>
              <div className="space-y-5">
                <h1 className="max-w-4xl font-[var(--font-display)] text-5xl leading-[0.94] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                  A family safety network that acts before the parent misses the warning.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-[#dbeafe]">
                  SignalSafe Guardian Network treats child safety like an operations problem. Child devices scan locally, emit redacted incident packets, and route the right alert to the right parent with a real response workflow instead of dumping every message into a surveillance inbox.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <HeroCard label="Local-first" value="Redacted packets only" />
                <HeroCard label="Guardian response" value="Push, SMS, backup guardian" />
                <HeroCard label="Deployment" value="Install kits for tablets and phones" />
              </div>
            </div>
            <div className="rounded-[1.8rem] border border-white/12 bg-white/8 p-5 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/12 pb-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#a7f3d0]">Tonight’s command brief</div>
                  <div className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.04em]">Family overview</div>
                </div>
                <button
                  className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/16"
                  onClick={runGuardianScan}
                  type="button"
                >
                  {loading ? "Scanning..." : `Scan ${activeChild.name}`}
                </button>
              </div>
              <div className="mt-5 grid gap-4">
                <BriefingLine label="Selected child" value={`${activeChild.name}, age ${activeChild.age}`} />
                <BriefingLine label="Device" value={activeChild.device} />
                <BriefingLine label="Coverage" value={activeChild.coverage} />
                <BriefingLine label="Status" value={analysis?.statusLine ?? activeChild.status} />
              </div>
              <div className="mt-5 rounded-[1.4rem] bg-[#082032] px-4 py-4 text-sm leading-6 text-[#dbeafe]">
                {analysis?.guardianDigest ?? "Run a scan to populate incident command, notification routing, and the parent response queue."}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {notificationRoutes.map((route) => (
                  <span
                    key={route.label}
                    className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] ${routeTone[route.status]}`}
                  >
                    {route.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="rounded-[1.8rem] border border-[#dbe4ef] bg-white p-5 shadow-[0_20px_65px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Guardian fleet</div>
                  <h2 className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em]">Child devices</h2>
                </div>
                <div className="rounded-full bg-[#e0f2fe] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#075985]">
                  {children.length} active
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {children.map((child) => {
                  const active = child.id === activeChild.id;
                  return (
                    <button
                      key={child.id}
                      className={`rounded-[1.4rem] border p-4 text-left transition ${
                        active
                          ? "border-[#10243f] bg-[#10243f] text-white"
                          : "border-[#dbe4ef] bg-[#f8fafc] hover:bg-[#f1f5f9]"
                      }`}
                      onClick={() => {
                        setActiveChildId(child.id);
                        setAnalysis(null);
                        setError("");
                      }}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{child.name}</div>
                          <div className={`mt-1 text-xs uppercase tracking-[0.18em] ${active ? "text-[#99f6e4]" : "text-[#0f766e]"}`}>
                            {child.status}
                          </div>
                        </div>
                        <div className={`rounded-full px-3 py-1 text-xs ${active ? "bg-white/10" : "bg-white"}`}>
                          {child.checkIn}
                        </div>
                      </div>
                      <div className={`mt-3 text-sm leading-6 ${active ? "text-white/80" : "text-[#475569]"}`}>
                        {child.device}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {child.apps.map((app) => (
                          <span
                            key={app}
                            className={`rounded-full border px-3 py-1 text-xs ${active ? "border-white/10 bg-white/8" : "border-[#dbe4ef] bg-white"}`}
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-[#dbe4ef] bg-[#f8fbff] p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Install kits</div>
              <div className="mt-4 grid gap-3">
                {installKits.map((kit) => (
                  <button
                    key={kit.id}
                    className={`rounded-[1.2rem] border px-4 py-4 text-left transition ${
                      selectedKit === kit.id
                        ? "border-[#0f172a] bg-[#0f172a] text-white"
                        : "border-[#dbe4ef] bg-white text-[#0f172a]"
                    }`}
                    onClick={() => setSelectedKit(kit.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{kit.name}</div>
                      <div className={`rounded-full px-3 py-1 text-xs ${selectedKit === kit.id ? "bg-white/10" : "bg-[#eef2ff] text-[#4338ca]"}`}>
                        {kit.setupTime}
                      </div>
                    </div>
                    <div className={`mt-2 text-sm ${selectedKit === kit.id ? "text-white/72" : "text-[#64748b]"}`}>
                      {kit.audience}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="grid gap-6">
            <div className="rounded-[1.8rem] border border-[#dbe4ef] bg-white p-5 shadow-[0_20px_65px_rgba(15,23,42,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5edf6] pb-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">SignalSafe console</div>
                  <h2 className="mt-2 font-[var(--font-display)] text-3xl tracking-[-0.04em]">Parent command center</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["command", "Incident command"],
                    ["family", "Family policy"],
                    ["deploy", "Deployment path"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      className={`rounded-full px-4 py-2 text-sm transition ${tab === value ? "bg-[#10243f] text-white" : "border border-[#dbe4ef] bg-[#f8fafc] text-[#10243f]"}`}
                      onClick={() => setTab(value as typeof tab)}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {tab === "command" ? (
                <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-5">
                    <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_100%)] p-5 text-white">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">Incident commander</div>
                          <div className="mt-2 font-[var(--font-display)] text-4xl tracking-[-0.05em]">{activeChild.name}</div>
                          <div className="mt-2 text-sm text-[#cbd5e1]">{activeChild.installState} • last device packet {activeChild.checkIn}</div>
                        </div>
                        {analysis ? (
                          <span className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] ${severityTone[analysis.overallRisk]}`}>
                            {analysis.overallRisk}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <StatCard label="Events scanned" value={analysis?.dashboardStats.processed ?? activeEvents.length.toString()} tone="slate" />
                        <StatCard label="Queued alerts" value={analysis?.dashboardStats.queued ?? "0"} tone="rose" />
                        <StatCard label="Redacted evidence" value={analysis?.dashboardStats.redacted ?? "0"} tone="emerald" />
                        <StatCard label="Risk score" value={analysis?.overallScore ?? 0} tone="amber" />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#f8fafc] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Notification routes</div>
                          <h3 className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em]">Who gets notified now</h3>
                        </div>
                        <div className="rounded-full bg-white px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#475569]">
                          real-time plan
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {notificationRoutes.map((route) => (
                          <div key={route.label} className="rounded-[1.2rem] border border-white bg-white px-4 py-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-medium text-[#0f172a]">{route.label}</div>
                              <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${routeTone[route.status]}`}>
                                {route.status}
                              </span>
                            </div>
                            <div className="mt-2 text-sm leading-6 text-[#475569]">{route.detail}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#fffdf7] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Priority queue</div>
                          <h3 className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em]">Immediate guardian actions</h3>
                        </div>
                        {topAlert ? (
                          <div className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] ${severityTone[topAlert.severity]}`}>
                            top issue
                          </div>
                        ) : null}
                      </div>
                      {error ? <div className="mt-4 rounded-[1rem] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#9f1239]">{error}</div> : null}
                      <div className="mt-4 grid gap-4">
                        {analysis?.alerts.length ? (
                          analysis.alerts.map((alert) => {
                            const isAcknowledged = acknowledged.includes(alert.id);
                            return (
                              <div key={alert.id} className="rounded-[1.4rem] border border-[#eadfd3] bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-[var(--font-display)] text-2xl tracking-[-0.03em] text-[#0f172a]">{alert.title}</h4>
                                      <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${severityTone[alert.severity]}`}>
                                        {alert.severity}
                                      </span>
                                      {isAcknowledged ? (
                                        <span className="rounded-full border border-[#0f766e] bg-[#ccfbf1] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#115e59]">
                                          acknowledged
                                        </span>
                                      ) : null}
                                    </div>
                                    <div className="mt-2 text-sm leading-6 text-[#475569]">{alert.summary}</div>
                                  </div>
                                  <div className="rounded-[1rem] bg-[#f8fafc] px-4 py-3 text-right">
                                    <div className="text-xs uppercase tracking-[0.18em] text-[#64748b]">App</div>
                                    <div className="mt-1 font-medium text-[#0f172a]">{alert.app}</div>
                                    <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[#64748b]">Score {alert.score}</div>
                                  </div>
                                </div>
                                <div className="mt-4 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
                                  <SignalPanel title="Why it triggered" items={alert.matchedTactics} />
                                  <SignalPanel title="Redacted evidence" items={alert.evidence} mono />
                                </div>
                                <div className="mt-4 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
                                  <SignalPanel title="Alert path" items={alert.channels} />
                                  <SignalPanel title="Recommended parent steps" items={alert.actionPlan} />
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {(["Acknowledge", "Call child", "Lock app", "Escalate"] as const).map((action) => (
                                    <button
                                      key={action}
                                      className="rounded-full border border-[#dbe4ef] bg-[#f8fafc] px-4 py-2 text-sm text-[#0f172a] transition hover:bg-[#edf2f7]"
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
                          <div className="rounded-[1.4rem] border border-dashed border-[#dbe4ef] bg-[#f8fafc] p-6 text-sm leading-6 text-[#64748b]">
                            Run a guardian scan to convert device activity into a redacted parent queue with real notification routes.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-white p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Recent child-side activity</div>
                      <div className="mt-4 grid gap-3">
                        {activeEvents.map((event) => (
                          <div key={event.id} className="rounded-[1.2rem] border border-[#e5edf6] bg-[#f8fafc] px-4 py-4">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <div className="font-medium text-[#0f172a]">{event.app}</div>
                              <div className="text-[#64748b]">{event.at}</div>
                            </div>
                            <div className="mt-2 text-sm leading-6 text-[#475569]">{event.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === "family" ? (
                <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="space-y-5">
                    {policyModules.map((module) => (
                      <div key={module.title} className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#f8fafc] p-5">
                        <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Policy module</div>
                        <div className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em] text-[#0f172a]">{module.title}</div>
                        <div className="mt-3 text-sm leading-6 text-[#475569]">{module.summary}</div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {module.chips.map((chip) => (
                            <span key={chip} className="rounded-full border border-[#dbe4ef] bg-white px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#334155]">
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[linear-gradient(135deg,_#fff7ed_0%,_#eff6ff_100%)] p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Guardian roster</div>
                      <div className="mt-3 grid gap-3">
                        <RosterCard name="Aditya" role="Primary guardian" note="Push immediately, can lock apps, receives all critical packets." />
                        <RosterCard name="Backup family contact" role="Secondary guardian" note="SMS + email escalation if primary misses the acknowledgement window." />
                        <RosterCard name="Teacher-safe channel" role="Optional support contact" note="School-safe summary only, disabled outside school incidents." />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#10243f] p-5 text-white">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">Trust boundary</div>
                      <div className="mt-3 font-[var(--font-display)] text-3xl tracking-[-0.04em]">What can leave the child device</div>
                      <div className="mt-4 grid gap-3 text-sm leading-6 text-[#dbeafe]">
                        <BoundaryLine text="Risk score, app name, and timestamp for triage" />
                        <BoundaryLine text="Phrase fragments only after on-device redaction" />
                        <BoundaryLine text="Guardian acknowledgement and escalation state" />
                        <BoundaryLine text="No raw transcript sync unless a parent explicitly unlocks more context" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === "deploy" ? (
                <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-5">
                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#f8fafc] p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Selected install kit</div>
                      <div className="mt-2 font-[var(--font-display)] text-3xl tracking-[-0.04em] text-[#0f172a]">{activeKit.name}</div>
                      <div className="mt-3 text-sm leading-6 text-[#475569]">{activeKit.promise}</div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <DeployStat label="Format" value={activeKit.format} />
                        <DeployStat label="Setup time" value={activeKit.setupTime} />
                        <DeployStat label="Target" value={activeKit.audience} />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-white p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Deployment map</div>
                      <ol className="mt-4 space-y-3 text-sm leading-6 text-[#334155]">
                        <li>1. Parent installs the child profile or family agent from the guardian phone.</li>
                        <li>2. The device registers approved messaging surfaces and local scanning rules.</li>
                        <li>3. Raw child messages stay local; only redacted incident packets sync upward.</li>
                        <li>4. Push reaches the primary guardian immediately when the threshold is crossed.</li>
                        <li>5. Missed acknowledgement moves the incident into SMS, backup guardian, and email fallback.</li>
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#fffdfa] p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Judge story</div>
                      <div className="mt-2 font-[var(--font-display)] text-3xl tracking-[-0.04em] text-[#0f172a]">Why this feels like a product, not a classifier demo</div>
                      <div className="mt-4 grid gap-3 text-sm leading-6 text-[#475569]">
                        <StoryCard title="Real deployment surface" body="Parents install a child profile or family agent instead of pasting message blobs into a toy form." />
                        <StoryCard title="Real alert operations" body="The parent sees routing, acknowledgement, escalation windows, and app-level response choices." />
                        <StoryCard title="Real privacy posture" body="The product is explicit about what never leaves the child device and why guardians only receive the minimum required incident packet." />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#10243f] p-5 text-white">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">Submission angle</div>
                      <div className="mt-3 text-sm leading-7 text-[#dbeafe]">
                        Position SignalSafe as a privacy-preserving guardian network for younger children, where the AI layer exists to reduce harm without normalizing total parental surveillance. The core story is trustworthy escalation design.
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[1.8rem] border border-[#dbe4ef] bg-[#10243f] p-5 text-white">
                <div className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">Action timeline</div>
                <div className="mt-2 font-[var(--font-display)] text-3xl tracking-[-0.04em]">Parent response log</div>
                <div className="mt-4 space-y-3">
                  {actionLog.length ? (
                    actionLog.map((entry) => (
                      <div key={entry.id} className="rounded-[1.2rem] bg-white/7 px-4 py-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <div className="font-medium">{entry.action}</div>
                          <div className="text-[#94a3b8]">{entry.at}</div>
                        </div>
                        <div className="mt-2 text-sm text-[#e2e8f0]">{entry.alertTitle}</div>
                        <div className="mt-1 text-sm leading-6 text-[#cbd5e1]">{entry.outcome}</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.2rem] bg-white/7 px-4 py-4 text-sm text-[#cbd5e1]">
                      Run a scan or act on an alert to build the guardian response timeline.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-[#dbe4ef] bg-white p-5 shadow-[0_20px_65px_rgba(15,23,42,0.06)]">
                <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Parent install story</div>
                <div className="mt-2 font-[var(--font-display)] text-3xl tracking-[-0.04em] text-[#0f172a]">How a family would actually use this</div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <FamilyStep number="01" title="Pick the right install kit" body="Choose Apple family kit, Android family agent, or school-safe tablet mode based on the child’s device." />
                  <FamilyStep number="02" title="Assign guardian routes" body="Decide who gets immediate push, who gets fallback SMS, and whether a second adult should receive critical incidents." />
                  <FamilyStep number="03" title="Tune privacy defaults" body="Keep raw transcripts local, allow only redacted phrase fragments, and define the unlock path for serious incidents." />
                  <FamilyStep number="04" title="Respond without panic" body="Use the response queue to acknowledge, call the child, temporarily lock an app, or escalate to another guardian." />
                </div>
                <div className="mt-5 rounded-[1.2rem] border border-[#dbe4ef] bg-[#f8fafc] px-4 py-4 text-sm leading-6 text-[#475569]">
                  {analysis?.recommendation ?? "The system is tuned for calm escalation: alert the parent immediately when needed, but keep the evidence packet intentionally narrow until a guardian decides more context is necessary."}
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function HeroCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/7 p-4 backdrop-blur">
      <div className="text-xs uppercase tracking-[0.18em] text-[#93c5fd]">{label}</div>
      <div className="mt-3 text-xl font-semibold">{value}</div>
    </div>
  );
}

function BriefingLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.1rem] bg-black/15 px-4 py-3 text-sm">
      <span className="text-[#93c5fd]">{label}</span>
      <span className="text-right text-[#e2e8f0]">{value}</span>
    </div>
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
    slate: "bg-white text-[#0f172a]",
    amber: "bg-[#fef3c7] text-[#854d0e]",
    emerald: "bg-[#d1fae5] text-[#065f46]",
    rose: "bg-[#ffe4e6] text-[#9f1239]",
  } as const;

  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-white/8 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[#93c5fd]">{label}</div>
      <div className={`mt-3 inline-flex rounded-full px-4 py-2 text-2xl font-semibold ${toneMap[tone]}`}>
        {value}
      </div>
    </div>
  );
}

function SignalPanel({ title, items, mono }: { title: string; items: string[]; mono?: boolean }) {
  return (
    <div className="rounded-[1.2rem] border border-[#e5edf6] bg-[#f8fafc] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[#64748b]">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full border border-white bg-white px-3 py-2 text-sm ${mono ? "font-mono" : ""}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function RosterCard({ name, role, note }: { name: string; role: string; note: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[#dbe4ef] bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium text-[#0f172a]">{name}</div>
        <div className="rounded-full bg-[#ecfeff] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#0f766e]">{role}</div>
      </div>
      <div className="mt-2 text-sm leading-6 text-[#475569]">{note}</div>
    </div>
  );
}

function BoundaryLine({ text }: { text: string }) {
  return <div className="rounded-[1.1rem] bg-white/6 px-4 py-4">{text}</div>;
}

function DeployStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-white bg-white px-4 py-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[#64748b]">{label}</div>
      <div className="mt-2 text-sm font-medium text-[#0f172a]">{value}</div>
    </div>
  );
}

function StoryCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[#e5edf6] bg-white px-4 py-4">
      <div className="font-medium text-[#0f172a]">{title}</div>
      <div className="mt-2 text-sm leading-6 text-[#475569]">{body}</div>
    </div>
  );
}

function FamilyStep({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[#e5edf6] bg-[#f8fafc] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[#0f766e]">Step {number}</div>
      <div className="mt-2 font-medium text-[#0f172a]">{title}</div>
      <div className="mt-2 text-sm leading-6 text-[#475569]">{body}</div>
    </div>
  );
}

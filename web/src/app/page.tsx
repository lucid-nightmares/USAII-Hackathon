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

type LiveSignal = {
  title: string;
  value: string;
  note: string;
};

type TimelineEntry = {
  time: string;
  title: string;
  note: string;
  tone: "neutral" | "watch" | "alert";
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

const liveSignalsByChild: Record<string, LiveSignal[]> = {
  maya: [
    {
      title: "Current app",
      value: "Messenger Kids",
      note: "Direct messages are being watched for secrecy, gifts, and off-app moves.",
    },
    {
      title: "Location",
      value: "Home",
      note: "Inside the family safe zone. No travel alert is active.",
    },
    {
      title: "Focus mode",
      value: "Homework off",
      note: "Entertainment apps are allowed until 8:30 PM.",
    },
    {
      title: "New contacts",
      value: "1 pending",
      note: "Any first-time contact stays read-only until a parent approves it.",
    },
  ],
  leo: [
    {
      title: "Current app",
      value: "Minecraft chat",
      note: "Chat is open, but voice invites are blocked after school hours.",
    },
    {
      title: "Location",
      value: "Grandma's house",
      note: "Matches today's allowed places.",
    },
    {
      title: "Focus mode",
      value: "School shield on",
      note: "Search and video suggestions stay filtered until 6 PM.",
    },
    {
      title: "New contacts",
      value: "0 pending",
      note: "No one new has tried to message Leo today.",
    },
  ],
  nina: [
    {
      title: "Current app",
      value: "Reading app",
      note: "Only school and reading apps are currently available.",
    },
    {
      title: "Location",
      value: "School",
      note: "Travel alerts are muted during class hours.",
    },
    {
      title: "Focus mode",
      value: "Quiet hours on",
      note: "Games and browsers stay hidden until a parent opens them.",
    },
    {
      title: "New contacts",
      value: "0 pending",
      note: "No outside messaging is enabled on this device.",
    },
  ],
};

const timelineByChild: Record<string, TimelineEntry[]> = {
  maya: [
    {
      time: "7:42 PM",
      title: "Messenger Kids alert",
      note: "A new contact tried to move the conversation off the app and asked Maya not to tell a parent.",
      tone: "alert",
    },
    {
      time: "7:39 PM",
      title: "Roblox reward pressure",
      note: "A player offered Robux in exchange for a private picture, so the app is ready to be paused.",
      tone: "alert",
    },
    {
      time: "7:11 PM",
      title: "Bedtime reminder queued",
      note: "The tablet will switch to reading-only mode at 8:30 PM.",
      tone: "neutral",
    },
    {
      time: "6:50 PM",
      title: "New contact hold",
      note: "A first-time contact can send one message, but cannot start a call or add Maya elsewhere.",
      tone: "watch",
    },
  ],
  leo: [
    {
      time: "6:15 PM",
      title: "Private server invite",
      note: "Minecraft chat suggested moving Leo into a private server without involving an adult.",
      tone: "watch",
    },
    {
      time: "5:30 PM",
      title: "Bus ride home",
      note: "Location check-in arrived automatically when Leo left school.",
      tone: "neutral",
    },
    {
      time: "4:10 PM",
      title: "Search filter blocked",
      note: "Chrome blocked a mature video search and logged the topic instead of the full page.",
      tone: "watch",
    },
  ],
  nina: [
    {
      time: "4:02 PM",
      title: "Reading streak complete",
      note: "No safety issue. Nina finished her reading goal and the dashboard marked the device as calm.",
      tone: "neutral",
    },
    {
      time: "3:54 PM",
      title: "Classroom assignment",
      note: "School tablet traffic stayed inside approved class apps.",
      tone: "neutral",
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
  const [tab, setTab] = useState<"alerts" | "activity" | "privacy" | "setup">("alerts");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLog, setActionLog] = useState<ActionEntry[]>([]);
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const [selectedKit, setSelectedKit] = useState(installKits[0].id);
  const [smsDelay, setSmsDelay] = useState<"3 min" | "5 min" | "10 min">("5 min");
  const [transcriptMode, setTranscriptMode] = useState<"Redacted only" | "Guardian unlock required">("Redacted only");
  const [schoolShield, setSchoolShield] = useState<"On" | "Off">("On");
  const [deviceLock, setDeviceLock] = useState<"Allowed" | "Manual only">("Allowed");

  const activeChild = children.find((child) => child.id === activeChildId) ?? children[0];
  const activeEvents = useMemo(() => eventsByChild[activeChild.id] ?? [], [activeChild.id]);
  const activeSignals = useMemo(() => liveSignalsByChild[activeChild.id] ?? [], [activeChild.id]);
  const activeTimeline = useMemo(() => timelineByChild[activeChild.id] ?? [], [activeChild.id]);

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
                <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2">family safety center</span>
                <span className="rounded-full border border-[#99f6e4]/20 bg-[#0f3b4d] px-4 py-2 text-[#ccfbf1]">built for kids 10 and under</span>
              </div>
              <div className="space-y-5">
                <h1 className="max-w-4xl font-[var(--font-display)] text-5xl leading-[0.94] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                  A calmer way to watch a child’s device without turning family life into surveillance.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-[#dbeafe]">
                  SignalSafe gives parents one place to handle alerts, screen time, browsing, new contacts, travel checks, and bedtime rules. Most of the heavy lifting stays on the child’s device, so parents only see a short summary when something actually needs attention.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <HeroCard label="On the device" value="Full messages stay local unless a rule is tripped" />
                <HeroCard label="For parents" value="Fast alerts, check-ins, pause controls" />
                <HeroCard label="Beyond chat" value="Apps, browsing, travel, bedtime, contacts" />
              </div>
            </div>
            <div className="rounded-[1.8rem] border border-white/12 bg-white/8 p-5 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/12 pb-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#a7f3d0]">Family snapshot</div>
                  <div className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.04em]">What needs a parent right now</div>
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
                {analysis?.guardianDigest ?? "Run a device check to fill the alert list, update the parent queue, and refresh the current-device summary."}
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
                  <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">SignalSafe home</div>
                  <h2 className="mt-2 font-[var(--font-display)] text-3xl tracking-[-0.04em]">Parent dashboard</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["alerts", "Alerts"],
                    ["activity", "Daily activity"],
                    ["privacy", "Privacy & rules"],
                    ["setup", "Setup"],
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

              {tab === "alerts" ? (
                <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-5">
                    <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_100%)] p-5 text-white">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">Live watch</div>
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
                          <h3 className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em]">Who gets the alert</h3>
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
                          <h3 className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em]">Things you can do right now</h3>
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
                            Run a device check to turn live activity into a short parent queue instead of a raw transcript dump.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-white p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Live device picture</div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {activeSignals.map((signal) => (
                          <div key={signal.title} className="rounded-[1.2rem] border border-[#e5edf6] bg-[#f8fafc] px-4 py-4">
                            <div className="text-xs uppercase tracking-[0.18em] text-[#64748b]">{signal.title}</div>
                            <div className="mt-2 font-medium text-[#0f172a]">{signal.value}</div>
                            <div className="mt-2 text-sm leading-6 text-[#475569]">{signal.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === "activity" ? (
                <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="space-y-5">
                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#f8fafc] p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Today at a glance</div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {activeSignals.map((signal) => (
                          <div key={signal.title} className="rounded-[1.2rem] border border-white bg-white px-4 py-4">
                            <div className="text-xs uppercase tracking-[0.18em] text-[#64748b]">{signal.title}</div>
                            <div className="mt-2 font-medium text-[#0f172a]">{signal.value}</div>
                            <div className="mt-2 text-sm leading-6 text-[#475569]">{signal.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-white p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Daily timeline</div>
                      <div className="mt-4 space-y-3">
                        {activeTimeline.map((entry) => (
                          <TimelineCard key={`${entry.time}-${entry.title}`} entry={entry} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[linear-gradient(135deg,_#fff7ed_0%,_#eff6ff_100%)] p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Contact and app gates</div>
                      <div className="mt-3 grid gap-3">
                        <StoryCard title="New contacts" body="New people can send one message, but calls, links, and off-app invites stay blocked until a parent approves them." />
                        <StoryCard title="Browsing" body="Search and browsing are filtered by age, and blocked topics are logged as a topic label rather than a full page history." />
                        <StoryCard title="Bedtime" body="Devices can slide into reading-only or homework-only modes automatically, without exposing every tap a child makes." />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-white p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Recent risky snippets</div>
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

              {tab === "privacy" ? (
                <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="space-y-5">
                    {policyModules.map((module) => (
                      <div key={module.title} className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#f8fafc] p-5">
                        <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">House rule</div>
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
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Family contacts</div>
                      <div className="mt-3 grid gap-3">
                        <RosterCard name="Aditya" role="Primary parent" note={`Gets every urgent alert first and ${deviceLock === "Allowed" ? "can pause apps remotely" : "reviews before pausing apps"}.`} />
                        <RosterCard name="Backup family contact" role="Backup adult" note={`Gets SMS and email after ${smsDelay.toLowerCase()} if the first parent misses the alert.`} />
                        <RosterCard name="Teacher-safe channel" role="School contact" note={`School-only summaries are ${schoolShield === "On" ? "available" : "turned off"} during class hours.`} />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-white p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Parent controls</div>
                      <div className="mt-4 grid gap-4">
                        <ControlGroup
                          label="Fallback text delay"
                          value={smsDelay}
                          options={["3 min", "5 min", "10 min"]}
                          onChange={(value) => setSmsDelay(value as "3 min" | "5 min" | "10 min")}
                        />
                        <ControlGroup
                          label="What parents can open"
                          value={transcriptMode}
                          options={["Redacted only", "Guardian unlock required"]}
                          onChange={(value) => setTranscriptMode(value as "Redacted only" | "Guardian unlock required")}
                        />
                        <ControlGroup
                          label="School shield"
                          value={schoolShield}
                          options={["On", "Off"]}
                          onChange={(value) => setSchoolShield(value as "On" | "Off")}
                        />
                        <ControlGroup
                          label="Remote pause"
                          value={deviceLock}
                          options={["Allowed", "Manual only"]}
                          onChange={(value) => setDeviceLock(value as "Allowed" | "Manual only")}
                        />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#10243f] p-5 text-white">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">What leaves the device</div>
                      <div className="mt-4 grid gap-3 text-sm leading-6 text-[#dbeafe]">
                        <BoundaryLine text="App name, time, and risk level so a parent can react quickly" />
                        <BoundaryLine text="Small redacted phrase fragments instead of full message history" />
                        <BoundaryLine text="Parent acknowledgement and follow-up state so adults stay in sync" />
                        <BoundaryLine text={transcriptMode === "Redacted only" ? "Full transcripts never sync out by default." : "A parent still has to explicitly unlock more context."} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === "setup" ? (
                <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-5">
                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#f8fafc] p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Selected setup kit</div>
                      <div className="mt-2 font-[var(--font-display)] text-3xl tracking-[-0.04em] text-[#0f172a]">{activeKit.name}</div>
                      <div className="mt-3 text-sm leading-6 text-[#475569]">{activeKit.promise}</div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <DeployStat label="Format" value={activeKit.format} />
                        <DeployStat label="Setup time" value={activeKit.setupTime} />
                        <DeployStat label="Best for" value={activeKit.audience} />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-white p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">How setup works</div>
                      <ol className="mt-4 space-y-3 text-sm leading-6 text-[#334155]">
                        <li>1. A parent installs the child profile from their own phone.</li>
                        <li>2. The device turns on age-based browsing, message, and contact rules.</li>
                        <li>3. Everyday activity stays on the device unless a rule is tripped.</li>
                        <li>4. Parents get a short alert with just enough detail to act quickly.</li>
                        <li>5. If no adult responds, the alert can move into text and backup-adult follow-up after {smsDelay.toLowerCase()}.</li>
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#fffdfa] p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">What parents get on day one</div>
                      <div className="mt-4 grid gap-3 text-sm leading-6 text-[#475569]">
                        <StoryCard title="Alert feed" body="A short list of the things that really need a parent, not a giant scroll of every message and website." />
                        <StoryCard title="Daily activity" body="A simple daily timeline covering browsing blocks, location check-ins, contact requests, bedtime mode, and risky messages." />
                        <StoryCard title="Remote help" body="Parents can call, pause an app, change a rule, or ask another adult to step in without taking over the whole device." />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#10243f] p-5 text-white">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">Why this is different</div>
                      <div className="mt-3 text-sm leading-7 text-[#dbeafe]">
                        Most family safety tools force a parent to choose between full surveillance and almost no visibility. SignalSafe sits in the middle: broad device awareness, narrow evidence, and quick parent action when something starts going wrong.
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
                  <FamilyStep number="03" title="Tune privacy defaults" body={`Current mode: ${transcriptMode}. Parents get narrow evidence packets first and unlock more only if they choose to.`} />
                  <FamilyStep number="04" title="Respond without panic" body={`Use the response queue to acknowledge, call the child, ${deviceLock === "Allowed" ? "temporarily lock an app" : "review before locking any app"}, or escalate to another guardian.`} />
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

function TimelineCard({ entry }: { entry: TimelineEntry }) {
  const toneMap = {
    neutral: "border-[#dbe4ef] bg-[#f8fafc] text-[#334155]",
    watch: "border-[#fde68a] bg-[#fffbeb] text-[#854d0e]",
    alert: "border-[#fecdd3] bg-[#fff1f2] text-[#9f1239]",
  } as const;

  return (
    <div className={`rounded-[1.2rem] border px-4 py-4 ${toneMap[entry.tone]}`}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="font-medium">{entry.title}</div>
        <div>{entry.time}</div>
      </div>
      <div className="mt-2 text-sm leading-6">{entry.note}</div>
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

function ControlGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[1.2rem] border border-[#e5edf6] bg-[#f8fafc] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[#64748b]">{label}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            className={`rounded-full border px-3 py-2 text-sm transition ${value === option ? "border-[#10243f] bg-[#10243f] text-white" : "border-[#dbe4ef] bg-white text-[#10243f]"}`}
            onClick={() => onChange(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

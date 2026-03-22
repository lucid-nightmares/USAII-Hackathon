"use client";

import { useMemo, useState } from "react";

type Severity = "info" | "watch" | "alert" | "critical";
type RouteStatus = "armed" | "fallback" | "idle";
type IncidentStage = "Detected" | "Redacted" | "Queued" | "Viewed" | "Acknowledged" | "Actioned" | "Resolved";
type RevealState = "hidden" | "revealed";

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
  contextSignals: string[];
  recommendedAction: string;
  explanation: string;
  confidence: number;
  detectedAt: string;
  incidentStage: IncidentStage;
  routeStatus: RouteStatus;
  escalationDeadline: string;
  dignityModeEligible: boolean;
  revealSummary: string;
  policyContext: string[];
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
  kind: "system" | "guardian" | "privacy" | "policy";
  privacyImpact: string;
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

type ApprovalItem = {
  id: string;
  kind: "Contact" | "App install";
  title: string;
  detail: string;
  decisionWindow: string;
  severity: Severity;
};

type SafeZone = {
  name: string;
  status: "inside" | "expected" | "watch";
  note: string;
};

type RoutineRule = {
  window: string;
  title: string;
  note: string;
};

type IntegritySignal = {
  title: string;
  note: string;
  status: "healthy" | "watch";
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

const approvalsByChild: Record<string, ApprovalItem[]> = {
  maya: [
    {
      id: "a1",
      kind: "Contact",
      title: "Jordan requested to keep messaging Maya",
      detail: "First-time contact on Messenger Kids. Links, calls, and off-app moves remain blocked until a parent decides.",
      decisionWindow: "Needs decision in 15 min",
      severity: "alert",
    },
    {
      id: "a2",
      kind: "App install",
      title: "Roblox private server helper",
      detail: "A sidecar tool requested install after the reward-pressure incident. SignalSafe held the install locally.",
      decisionWindow: "Held on device",
      severity: "watch",
    },
  ],
  leo: [
    {
      id: "a3",
      kind: "Contact",
      title: "New Minecraft friend invite",
      detail: "Can send one text message only. Voice and private server invites stay blocked until approved.",
      decisionWindow: "Expires after bedtime",
      severity: "watch",
    },
  ],
  nina: [],
};

const safeZonesByChild: Record<string, SafeZone[]> = {
  maya: [
    { name: "Home", status: "inside", note: "Arrival confirmed at 4:16 PM." },
    { name: "School", status: "expected", note: "Weekday safe zone with silent school-hour check-ins." },
    { name: "Grandma's house", status: "expected", note: "Approved for weekends and backup pickup." },
  ],
  leo: [
    { name: "Grandma's house", status: "inside", note: "Current location matches the after-school plan." },
    { name: "School", status: "expected", note: "Automatic departure ping at 3:11 PM." },
    { name: "Soccer field", status: "expected", note: "Allowed during practice window only." },
  ],
  nina: [
    { name: "School", status: "inside", note: "Classroom tablet activity matches the school-safe profile." },
    { name: "Home", status: "expected", note: "After-school route alert will arm at dismissal." },
  ],
};

const routinesByChild: Record<string, RoutineRule[]> = {
  maya: [
    { window: "7:00 AM - 3:00 PM", title: "School shield", note: "School-safe apps only, educational links suppressed from parent alerts." },
    { window: "3:00 PM - 8:30 PM", title: "Play and chat window", note: "Messaging allowed, but new contacts and off-app moves stay gated." },
    { window: "8:30 PM onward", title: "Bedtime mode", note: "Entertainment apps pause and only calm check-in tools remain." },
  ],
  leo: [
    { window: "7:30 AM - 2:45 PM", title: "Class mode", note: "Search and browsing stay inside approved school content." },
    { window: "3:00 PM - 7:30 PM", title: "After-school mode", note: "Games allowed, but private servers and voice invites require approval." },
    { window: "7:30 PM onward", title: "Quiet hours", note: "Internet pause is available without exposing a full activity log." },
  ],
  nina: [
    { window: "School hours", title: "Reading-first profile", note: "Only reading and teacher-approved apps stay visible." },
    { window: "Evening", title: "Family mode", note: "Device stays in a low-distraction profile with no outside messaging." },
  ],
};

const integritySignalsByChild: Record<string, IntegritySignal[]> = {
  maya: [
    { title: "Child profile active", note: "Local scanner and redacted sync both checked in this hour.", status: "healthy" },
    { title: "Install hold working", note: "Unapproved helper app stayed blocked pending review.", status: "healthy" },
    { title: "No transcript export", note: "Full message history remains local under the current privacy mode.", status: "healthy" },
  ],
  leo: [
    { title: "School shield intact", note: "No class-hour overrides were requested today.", status: "healthy" },
    { title: "Voice invite block triggered", note: "A private-server escalation was stopped before voice handoff.", status: "watch" },
  ],
  nina: [
    { title: "Whitelist only", note: "Only approved school and reading apps are visible on the tablet.", status: "healthy" },
    { title: "Outside messaging disabled", note: "No contact requests can reach the device until a parent changes the profile.", status: "healthy" },
  ],
};

const severityTone: Record<Severity, string> = {
  info: "border-[#93c5fd] bg-[#e0f2fe] text-[#0c4a6e]",
  watch: "border-[#facc15] bg-[#fef3c7] text-[#854d0e]",
  alert: "border-[#fb923c] bg-[#ffedd5] text-[#9a3412]",
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
  const [selectedAlertId, setSelectedAlertId] = useState("");
  const [selectedKit, setSelectedKit] = useState(installKits[0].id);
  const [approvalState, setApprovalState] = useState<Record<string, "pending" | "approved" | "blocked">>({});
  const [incidentStage, setIncidentStage] = useState<Record<string, IncidentStage>>({});
  const [routeState, setRouteState] = useState<Record<string, RouteStatus>>({});
  const [revealState, setRevealState] = useState<Record<string, RevealState>>({});
  const [followUpOutcome, setFollowUpOutcome] = useState<Record<string, string>>({});
  const [dignityMode, setDignityMode] = useState<"On" | "Off">("On");
  const [integrityState, setIntegrityState] = useState<Record<string, "healthy" | "degraded">>({
    maya: "healthy",
    leo: "healthy",
    nina: "healthy",
  });
  const [smsDelay, setSmsDelay] = useState<"3 min" | "5 min" | "10 min">("5 min");
  const [transcriptMode, setTranscriptMode] = useState<"Redacted only" | "Guardian unlock required">("Guardian unlock required");
  const [schoolShield, setSchoolShield] = useState<"On" | "Off">("On");
  const [deviceLock, setDeviceLock] = useState<"Allowed" | "Manual only">("Allowed");

  const activeChild = children.find((child) => child.id === activeChildId) ?? children[0];
  const activeEvents = useMemo(() => eventsByChild[activeChild.id] ?? [], [activeChild.id]);
  const activeSignals = useMemo(() => liveSignalsByChild[activeChild.id] ?? [], [activeChild.id]);
  const activeTimeline = useMemo(() => timelineByChild[activeChild.id] ?? [], [activeChild.id]);

  const selectedRouteStatus = selectedAlertId ? routeState[selectedAlertId] : undefined;

  const notificationRoutes: GuardianRoute[] = useMemo(() => {
    if (!analysis || !selectedAlertId) {
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
        detail: integrityState[activeChild.id] === "degraded" ? "Coverage is degraded, so fallback SMS stays armed until protection is restored." : analysis.deliveryPlan.backup,
        status: selectedRouteStatus === "fallback" ? "fallback" : "idle",
      },
      {
        label: "Second guardian + email",
        detail: analysis.deliveryPlan.escalation,
        status: selectedRouteStatus === "fallback" ? "fallback" : "idle",
      },
    ];
  }, [activeChild.id, analysis, integrityState, selectedAlertId, selectedRouteStatus]);

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
      setSelectedAlertId(payload.alerts[0]?.id ?? "");
      setIncidentStage(Object.fromEntries(payload.alerts.map((alert) => [alert.id, alert.incidentStage])));
      setRouteState(Object.fromEntries(payload.alerts.map((alert) => [alert.id, alert.routeStatus])));
      setRevealState(Object.fromEntries(payload.alerts.map((alert) => [alert.id, "hidden"])));
      setFollowUpOutcome({});
      appendAction(`${activeChild.name} scan`, "Device scan completed", payload.statusLine, "system", "No additional child data left the device beyond the redacted incident packet.");
    } catch {
      setError("Guardian scan unavailable. Check the local app process and retry.");
    } finally {
      setLoading(false);
    }
  }

  function appendAction(
    alertTitle: string,
    action: string,
    outcome: string,
    kind: ActionEntry["kind"],
    privacyImpact: string,
  ) {
    setActionLog((current) => [
      {
        id: crypto.randomUUID(),
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        alertTitle,
        action,
        outcome,
        kind,
        privacyImpact,
      },
      ...current,
    ]);
  }

  function handleRevealRequest(alert: AlertCard) {
    if (transcriptMode === "Redacted only") {
      appendAction(alert.title, "Reveal blocked by family policy", "The family policy kept the full message on-device. The guardian stayed on the redacted packet.", "privacy", "No additional child data left the device.");
      return;
    }

    setRevealState((current) => ({ ...current, [alert.id]: "revealed" }));
    setIncidentStage((current) => ({ ...current, [alert.id]: current[alert.id] === "Resolved" ? "Resolved" : "Viewed" }));
    appendAction(alert.title, "Guarded reveal opened", "A short on-device excerpt was shown to the guardian for review and logged in the family transparency trail.", "privacy", "Additional child message content was exposed to the guardian after an explicit reveal action.");
  }

  function handleRevealClose(alert: AlertCard) {
    setRevealState((current) => ({ ...current, [alert.id]: "hidden" }));
    appendAction(alert.title, "Guarded reveal closed", "The incident returned to redacted-only mode after review.", "privacy", "No further child data remained visible after the reveal was closed.");
  }

  function handleAlertAction(
    alert: AlertCard,
    action: "Mark seen" | "Check in with child" | "Pause app" | "Approve or block contact" | "Ask backup adult to review" | "Resolve follow-up",
  ) {
    const dignityProtected = dignityMode === "On" && alert.dignityModeEligible;

    if (action === "Pause app" && dignityProtected) {
      appendAction(alert.title, "Pause app blocked by dignity mode", "This incident stayed in a conversation-first lane because the signal is not strong enough to justify a restrictive action.", "policy", "No additional child data left the device.");
      return;
    }

    if (action === "Ask backup adult to review" && dignityProtected) {
      appendAction(alert.title, "Backup review held", "Dignity mode kept the incident with the primary guardian until risk increases or repeats.", "policy", "No additional child data left the device.");
      return;
    }

    if (action === "Mark seen") {
      setAcknowledged((current) => (current.includes(alert.id) ? current : [alert.id, ...current]));
      setIncidentStage((current) => ({ ...current, [alert.id]: "Acknowledged" }));
      setRouteState((current) => ({ ...current, [alert.id]: "idle" }));
    }

    if (action === "Check in with child") {
      setIncidentStage((current) => ({ ...current, [alert.id]: "Actioned" }));
      setRouteState((current) => ({ ...current, [alert.id]: "idle" }));
      setFollowUpOutcome((current) => ({
        ...current,
        [alert.id]: dignityProtected
          ? "Child dignity mode kept this incident in a conversation-first lane."
          : "Parent check-in is underway while the child stays in the normal routine.",
      }));
    }

    if (action === "Pause app") {
      setIncidentStage((current) => ({ ...current, [alert.id]: "Actioned" }));
      setRouteState((current) => ({ ...current, [alert.id]: "idle" }));
      setFollowUpOutcome((current) => ({ ...current, [alert.id]: `${alert.app} is paused while a guardian reviews the contact.` }));
    }

    if (action === "Approve or block contact") {
      setIncidentStage((current) => ({ ...current, [alert.id]: "Actioned" }));
      setRouteState((current) => ({ ...current, [alert.id]: "idle" }));
      setFollowUpOutcome((current) => ({ ...current, [alert.id]: "The contact is now waiting on a guardian decision in the approval queue." }));
    }

    if (action === "Ask backup adult to review") {
      setIncidentStage((current) => ({ ...current, [alert.id]: "Actioned" }));
      setRouteState((current) => ({ ...current, [alert.id]: "fallback" }));
      setFollowUpOutcome((current) => ({ ...current, [alert.id]: "Backup adult review has been armed because the parent wants a second set of eyes." }));
    }

    if (action === "Resolve follow-up") {
      setIncidentStage((current) => ({ ...current, [alert.id]: "Resolved" }));
      setRouteState((current) => ({ ...current, [alert.id]: "idle" }));
      setFollowUpOutcome((current) => ({ ...current, [alert.id]: "The incident is closed after guardian follow-up and the child returned to the normal profile." }));
    }

    const outcomeMap = {
      "Mark seen": "The alert stays open, but fallback routing pauses while the parent reviews it.",
      "Check in with child": dignityProtected ? `A calm parent check-in started for ${activeChild.name}. Dignity mode kept the response non-punitive.` : `A calm parent check-in has started for ${activeChild.name}.`,
      "Pause app": `${alert.app} is paused until a parent clears it.`,
      "Approve or block contact": "The contact gate is open for a parent decision.",
      "Ask backup adult to review": "The backup adult received the incident packet and current route state.",
      "Resolve follow-up": "The incident is now resolved and archived in the guardian transparency trail.",
    } as const;

    appendAction(
      alert.title,
      action,
      outcomeMap[action],
      action === "Mark seen" ? "guardian" : action === "Resolve follow-up" ? "guardian" : "guardian",
      action === "Check in with child" || action === "Mark seen"
        ? "No additional child data left the device."
        : action === "Pause app"
          ? "No additional child data left the device. A rule change was sent to the child profile."
          : action === "Approve or block contact"
            ? "No additional child data left the device. The contact decision was synced to the child profile."
            : action === "Ask backup adult to review"
              ? "The redacted incident packet was shared with the backup adult, not the full transcript."
              : "No additional child data left the device beyond the current redacted packet."
    );
  }

  function handleApprovalDecision(item: ApprovalItem, decision: "approved" | "blocked") {
    setApprovalState((current) => ({ ...current, [item.id]: decision }));
    appendAction(
      item.title,
      decision === "approved" ? "Approve contact or app" : "Block contact or app",
      decision === "approved" ? "The child device can continue under the updated family rule." : "The request stays blocked and the child keeps the safer default policy.",
      "policy",
      "No additional child data left the device. The approval decision updated the family policy only."
    );
  }

  function toggleIntegrityState() {
    const next = integrityState[activeChild.id] === "healthy" ? "degraded" : "healthy";
    setIntegrityState((current) => ({ ...current, [activeChild.id]: next }));
    appendAction(
      `${activeChild.name} device integrity`,
      next === "degraded" ? "Coverage degraded" : "Coverage restored",
      next === "degraded"
        ? "The local scanner lost coverage for one protected surface, so fallback routing stays more cautious until coverage is restored."
        : "The local scanner is healthy again and normal confidence routing has resumed.",
      "system",
      "No additional child data left the device. Only coverage status changed."
    );
  }

  const topAlert = analysis?.alerts[0] ?? null;
  const selectedAlert = analysis?.alerts.find((alert) => alert.id === selectedAlertId) ?? topAlert ?? null;
  const activeKit = installKits.find((kit) => kit.id === selectedKit) ?? installKits[0];
  const openAlerts = analysis?.alerts.length ?? 0;
  const awaitingAcknowledgement = Math.max(openAlerts - acknowledged.length, 0);
  const blockedInvitesToday = (analysis?.alerts.filter((alert) => alert.matchedTactics.some((item) => item.toLowerCase().includes("secrecy") || item.toLowerCase().includes("boundary") || item.toLowerCase().includes("location"))).length ?? 0) + 1;
  const newContactsPending = activeSignals.find((signal) => signal.title === "New contacts")?.value ?? "0 pending";
  const selectedEvent = selectedAlert ? activeEvents.find((event) => event.id === selectedAlert.id) ?? null : null;
  const approvalQueue = approvalsByChild[activeChild.id] ?? [];
  const pendingApprovalCount = approvalQueue.filter((item) => (approvalState[item.id] ?? "pending") === "pending").length;
  const safeZones = safeZonesByChild[activeChild.id] ?? [];
  const routines = routinesByChild[activeChild.id] ?? [];
  const integritySignals = integritySignalsByChild[activeChild.id] ?? [];
  const selectedStage = selectedAlert ? incidentStage[selectedAlert.id] ?? selectedAlert.incidentStage : "Redacted";
  const selectedRevealState = selectedAlert ? revealState[selectedAlert.id] ?? "hidden" : "hidden";
  const selectedRoute = selectedAlert ? routeState[selectedAlert.id] ?? selectedAlert.routeStatus : "idle";
  const selectedOutcome = selectedAlert ? followUpOutcome[selectedAlert.id] ?? "No guardian follow-up has been recorded yet." : "Run a scan to create an incident follow-up trail.";
  const integrityStatus = integrityState[activeChild.id];
  const displayCoverage = integrityStatus === "degraded" ? `${activeChild.coverage} • degraded` : activeChild.coverage;
  const dignityProtected = selectedAlert ? dignityMode === "On" && selectedAlert.dignityModeEligible : false;

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
                  On-device safety scanning with redacted alerts and fast parent action, without default full-device surveillance.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-[#dbeafe]">
                  SignalSafe scans messages, app moves, contact requests, and routine device signals locally. Parents only receive a narrow incident packet when something needs a calm decision.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <HeroCard label="On-device scan" value="Full messages, browsing, and app context stay local first" />
                <HeroCard label="Parent packet" value="App, risk label, redacted snippet, next step" />
                <HeroCard label="Fast response" value="Check in, pause, route, or tighten rules in seconds" />
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
                <BriefingLine label="Coverage" value={displayCoverage} />
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
                        setSelectedAlertId("");
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
                    ["privacy", "Controls"],
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
                <div className="mt-5 grid gap-5">
                  <div className="grid gap-4 md:grid-cols-5">
                    <MetricTile label="Active devices" value={children.length.toString()} note="All child profiles reporting" tone="slate" />
                    <MetricTile label="Open alerts" value={openAlerts.toString()} note="Need a parent look" tone="rose" />
                    <MetricTile label="Awaiting acknowledgement" value={awaitingAcknowledgement.toString()} note="Fallback routing still armed" tone="amber" />
                    <MetricTile label="Blocked off-app invites today" value={blockedInvitesToday.toString()} note="Stopped before another app handoff" tone="orange" />
                    <MetricTile label="New contacts pending" value={newContactsPending} note="Parent approval required" tone="emerald" />
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
                    <div className="space-y-5">
                      <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_100%)] p-5 text-white">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">Focused incident</div>
                            <div className="mt-2 font-[var(--font-display)] text-4xl tracking-[-0.05em]">{activeChild.name}</div>
                            <div className="mt-2 text-sm text-[#cbd5e1]">{activeChild.installState} • last device packet {activeChild.checkIn}</div>
                          </div>
                          {selectedAlert ? (
                            <span className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] ${severityTone[selectedAlert.severity]}`}>
                              {selectedAlert.severity}
                            </span>
                          ) : analysis ? (
                            <span className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] ${severityTone[analysis.overallRisk]}`}>
                              {analysis.overallRisk}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-4 text-sm leading-6 text-[#dbeafe]">
                          {integrityStatus === "degraded"
                            ? `Coverage is degraded on ${activeChild.name}'s device. SignalSafe is keeping fallback routing armed until the local scanner is healthy again.`
                            : selectedAlert?.explanation ?? analysis?.guardianDigest ?? "Run a device check to load one incident all the way from local scan to parent action."}
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-white p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Alert queue</div>
                            <h3 className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em]">Pick an incident to inspect</h3>
                          </div>
                          <div className="rounded-full bg-[#f8fafc] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#475569]">
                            {openAlerts} open
                          </div>
                        </div>
                        {error ? <div className="mt-4 rounded-[1rem] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#9f1239]">{error}</div> : null}
                        <div className="mt-4 grid gap-3">
                          {analysis?.alerts.length ? (
                            analysis.alerts.map((alert) => {
                              const isAcknowledged = acknowledged.includes(alert.id);
                              const isSelected = selectedAlert?.id === alert.id;
                              return (
                                <button
                                  key={alert.id}
                                  className={`rounded-[1.3rem] border p-4 text-left transition ${isSelected ? "border-[#10243f] bg-[#10243f] text-white" : "border-[#e5edf6] bg-[#f8fafc] hover:bg-[#f1f5f9]"}`}
                                  onClick={() => setSelectedAlertId(alert.id)}
                                  type="button"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${isSelected ? "border-white/20 bg-white/10 text-white" : severityTone[alert.severity]}`}>
                                          {alert.severity}
                                        </span>
                                        {isAcknowledged ? (
                                          <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${isSelected ? "border-[#99f6e4]/30 bg-[#0f766e]/40 text-[#ccfbf1]" : "border-[#0f766e] bg-[#ccfbf1] text-[#115e59]"}`}>
                                            seen
                                          </span>
                                        ) : null}
                                      </div>
                                      <div className="mt-3 font-[var(--font-display)] text-2xl tracking-[-0.03em]">{alert.title}</div>
                                      <div className={`mt-2 text-sm leading-6 ${isSelected ? "text-white/78" : "text-[#475569]"}`}>{alert.summary}</div>
                                    </div>
                                    <div className={`rounded-[1rem] px-4 py-3 text-right ${isSelected ? "bg-white/10" : "bg-white"}`}>
                                      <div className={`text-xs uppercase tracking-[0.18em] ${isSelected ? "text-white/65" : "text-[#64748b]"}`}>Confidence</div>
                                      <div className="mt-1 font-semibold">{alert.confidence}%</div>
                                      <div className={`mt-2 text-xs uppercase tracking-[0.18em] ${isSelected ? "text-white/65" : "text-[#64748b]"}`}>{alert.app}</div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })
                          ) : (
                            <div className="rounded-[1.4rem] border border-dashed border-[#dbe4ef] bg-[#f8fafc] p-6 text-sm leading-6 text-[#64748b]">
                              Run a device check to build a short list of incidents instead of a full transcript feed.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#f8fafc] p-5">
                        <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">False-positive containment</div>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <ContainmentCard title="School-safe chat ignored" body="Routine classroom messages stay collapsed while school shield is on." />
                          <ContainmentCard title="Educational links ignored" body="Homework and reading links do not create parent alerts by default." />
                          <ContainmentCard title="Low-risk gaming chatter collapsed" body="Normal gameplay chatter stays local unless it adds secrecy, off-app moves, or pressure." />
                          <ContainmentCard title="Harmless events filtered" body="Bedtime reminders, safe-zone travel, and approved contacts stay in the daily view, not the alert queue." />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#fffdf7] p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Selected incident</div>
                            <h3 className="mt-2 font-[var(--font-display)] text-3xl tracking-[-0.04em] text-[#0f172a]">{selectedAlert?.title ?? "No incident selected yet"}</h3>
                          </div>
                          {selectedAlert ? <SeverityPill severity={selectedAlert.severity} /> : null}
                        </div>

                        {selectedAlert ? (
                          <div className="mt-5 grid gap-5">
                            <div className="grid gap-3 md:grid-cols-4">
                              <DetailTile label="Child" value={activeChild.name} />
                              <DetailTile label="App" value={selectedAlert.app} />
                              <DetailTile label="Time" value={selectedEvent?.at ?? activeChild.checkIn} />
                              <DetailTile label="Suggested next step" value={dignityProtected ? "Start with a calm check-in. Restrictive actions stay off until the signal grows stronger." : selectedAlert.recommendedAction} />
                            </div>

                            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                              <ReasoningPanel alert={selectedAlert} />
                              <div className="space-y-4">
                                <LifecycleStrip currentStep={selectedStage} />
                                <div className="rounded-[1.25rem] border border-[#e5edf6] bg-[#f8fafc] p-4">
                                  <div className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Who gets the alert</div>
                                  <div className="mt-3 grid gap-3">
                                    {notificationRoutes.map((route) => (
                                      <div key={route.label} className="rounded-[1rem] border border-white bg-white px-4 py-4">
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
                            </div>

                            <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                              <PrivacyComparisonCard
                                onDeviceText={selectedEvent?.text ?? "Full content stays on the child device until a parent explicitly unlocks more context."}
                                alert={selectedAlert}
                                childName={activeChild.name}
                                revealState={selectedRevealState}
                                transcriptMode={transcriptMode}
                                onReveal={() => handleRevealRequest(selectedAlert)}
                                onCloseReveal={() => handleRevealClose(selectedAlert)}
                              />
                              <div className="rounded-[1.25rem] border border-[#e5edf6] bg-[#f8fafc] p-4">
                                <div className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Parent actions</div>
                                {dignityProtected ? (
                                  <div className="mt-3 rounded-[1rem] border border-[#99f6e4] bg-[#ecfdf5] px-4 py-4 text-sm leading-6 text-[#065f46]">
                                    Child dignity mode is active. This incident stays in a check-in-first lane until risk becomes stronger or repeated.
                                  </div>
                                ) : null}
                                <div className="mt-3 grid gap-3">
                                  {([
                                    "Mark seen",
                                    "Check in with child",
                                    "Pause app",
                                    "Approve or block contact",
                                    "Ask backup adult to review",
                                    "Resolve follow-up",
                                  ] as const).map((action) => {
                                    const disabled = dignityProtected && (action === "Pause app" || action === "Ask backup adult to review");
                                    return (
                                      <button
                                        key={action}
                                        className={`rounded-full border px-4 py-3 text-left text-sm transition ${disabled ? "border-[#dbe4ef] bg-[#f1f5f9] text-[#94a3b8]" : "border-[#dbe4ef] bg-white text-[#0f172a] hover:bg-[#f1f5f9]"}`}
                                        disabled={disabled}
                                        onClick={() => handleAlertAction(selectedAlert, action)}
                                        type="button"
                                      >
                                        {action}
                                      </button>
                                    );
                                  })}
                                </div>
                                <div className="mt-4 rounded-[1rem] border border-white bg-white px-4 py-4 text-sm leading-6 text-[#475569]">
                                  <div className="text-[11px] uppercase tracking-[0.16em] text-[#64748b]">Follow-up outcome</div>
                                  <div className="mt-2 text-[#0f172a]">{selectedOutcome}</div>
                                  <div className="mt-2 text-xs text-[#64748b]">Current route state: {selectedRoute}. Escalation window: {selectedAlert.escalationDeadline}.</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 rounded-[1.4rem] border border-dashed border-[#dbe4ef] bg-[#f8fafc] p-6 text-sm leading-6 text-[#64748b]">
                            Run a device check to load one incident all the way from local scan to parent response.
                          </div>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                        <DifferentiationCard />
                        <TrustBoundaryCard />
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
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Location and routine checks</div>
                      <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                        <div className="space-y-3">
                          {safeZones.map((zone) => (
                            <div key={zone.name} className="rounded-[1.2rem] border border-[#e5edf6] bg-[#f8fafc] px-4 py-4">
                              <div className="flex items-center justify-between gap-3">
                                <div className="font-medium text-[#0f172a]">{zone.name}</div>
                                <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${zone.status === "inside" ? "border-[#99f6e4] bg-[#ecfdf5] text-[#065f46]" : zone.status === "watch" ? "border-[#fdba74] bg-[#fff7ed] text-[#9a3412]" : "border-[#dbe4ef] bg-white text-[#475569]"}`}>
                                  {zone.status}
                                </span>
                              </div>
                              <div className="mt-2 text-sm leading-6 text-[#475569]">{zone.note}</div>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-3">
                          {routines.map((rule) => (
                            <div key={`${rule.window}-${rule.title}`} className="rounded-[1.2rem] border border-[#e5edf6] bg-[#f8fafc] px-4 py-4">
                              <div className="text-[11px] uppercase tracking-[0.16em] text-[#64748b]">{rule.window}</div>
                              <div className="mt-2 font-medium text-[#0f172a]">{rule.title}</div>
                              <div className="mt-2 text-sm leading-6 text-[#475569]">{rule.note}</div>
                            </div>
                          ))}
                        </div>
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
                        <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Control module</div>
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
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Guardian roles</div>
                      <div className="mt-3 grid gap-3">
                        <RosterCard name="Aditya" role="Primary parent" note={`Gets every urgent alert first and ${deviceLock === "Allowed" ? "can pause apps remotely" : "reviews before pausing apps"}.`} />
                        <RosterCard name="Backup family contact" role="Backup adult" note={`Gets SMS and email after ${smsDelay.toLowerCase()} if the first parent misses the alert.`} />
                        <RosterCard name="Teacher-safe channel" role="School contact" note={`School-only summaries are ${schoolShield === "On" ? "available" : "turned off"} during class hours.`} />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-white p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Live controls</div>
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
                        <ControlGroup
                          label="Child dignity mode"
                          value={dignityMode}
                          options={["On", "Off"]}
                          onChange={(value) => setDignityMode(value as "On" | "Off")}
                        />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#fffdf7] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Approval queue</div>
                          <div className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em] text-[#0f172a]">Contacts and installs waiting on a parent</div>
                        </div>
                        <div className="rounded-full bg-white px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#475569]">{pendingApprovalCount} pending</div>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {approvalQueue.length ? (
                          approvalQueue.map((item) => {
                            const decision = approvalState[item.id] ?? "pending";
                            return (
                              <div key={item.id} className="rounded-[1.2rem] border border-[#e5edf6] bg-white px-4 py-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="rounded-full border border-[#dbe4ef] bg-[#f8fafc] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#475569]">{item.kind}</span>
                                      <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${severityTone[item.severity]}`}>{item.severity}</span>
                                      <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${decision === "approved" ? "border-[#99f6e4] bg-[#ecfdf5] text-[#065f46]" : decision === "blocked" ? "border-[#fecdd3] bg-[#fff1f2] text-[#9f1239]" : "border-[#dbe4ef] bg-white text-[#475569]"}`}>{decision}</span>
                                    </div>
                                    <div className="mt-3 font-medium text-[#0f172a]">{item.title}</div>
                                  </div>
                                  <div className="text-right text-[11px] uppercase tracking-[0.16em] text-[#64748b]">{item.decisionWindow}</div>
                                </div>
                                <div className="mt-2 text-sm leading-6 text-[#475569]">{item.detail}</div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button type="button" onClick={() => handleApprovalDecision(item, "approved")} className="rounded-full border border-[#0f766e] bg-[#0f766e] px-3 py-2 text-sm text-white">Approve</button>
                                  <button type="button" onClick={() => handleApprovalDecision(item, "blocked")} className="rounded-full border border-[#dbe4ef] bg-white px-3 py-2 text-sm text-[#0f172a]">Block</button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="rounded-[1.2rem] border border-dashed border-[#dbe4ef] bg-white px-4 py-4 text-sm leading-6 text-[#64748b]">
                            No contacts or app installs are waiting on a parent right now.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#10243f] p-5 text-white">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">Responsible AI boundary</div>
                      <div className="mt-4 grid gap-3 text-sm leading-6 text-[#dbeafe]">
                        <BoundaryLine text="High-stakes actions still wait for a parent or backup adult review." />
                        <BoundaryLine text="False positives stay suppressed through school-safe, educational, and low-risk gaming filters." />
                        <BoundaryLine text="Parents receive app, time, severity, route state, and short redacted evidence instead of full transcripts." />
                        <BoundaryLine text={transcriptMode === "Redacted only" ? "Full transcripts do not leave the device by default." : "A parent must deliberately unlock more context before deeper review."} />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-white p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">Device integrity</div>
                          <div className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em] text-[#0f172a]">Coverage trust</div>
                        </div>
                        <button
                          type="button"
                          onClick={toggleIntegrityState}
                          className="rounded-full border border-[#dbe4ef] bg-[#f8fafc] px-4 py-2 text-sm text-[#0f172a]"
                        >
                          {integrityStatus === "healthy" ? "Simulate degraded coverage" : "Restore full coverage"}
                        </button>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {integritySignals.map((signal) => (
                          <div key={signal.title} className="rounded-[1.2rem] border border-[#e5edf6] bg-[#f8fafc] px-4 py-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-medium text-[#0f172a]">{signal.title}</div>
                              <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${(signal.status === "healthy" && integrityStatus === "healthy") ? "border-[#99f6e4] bg-[#ecfdf5] text-[#065f46]" : "border-[#fde68a] bg-[#fffbeb] text-[#92400e]"}`}>
                                {signal.status === "healthy" && integrityStatus === "healthy" ? "healthy" : "watch"}
                              </span>
                            </div>
                            <div className="mt-2 text-sm leading-6 text-[#475569]">{integrityStatus === "degraded" ? `${signal.note} Coverage is currently degraded, so SignalSafe is holding a more cautious route plan.` : signal.note}</div>
                          </div>
                        ))}
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
                        <li>1. A parent installs the child profile and picks approved apps for that child.</li>
                        <li>2. The family assigns guardian roles, backup adults, and school-safe contacts.</li>
                        <li>3. Redacted alerts, approval queues, and escalation timing are turned on.</li>
                        <li>4. Everyday activity stays on the device unless a rule or unusual pattern is tripped.</li>
                        <li>5. Parents get a short incident packet with app, time, severity, and a redacted phrase fragment.</li>
                        <li>6. If no adult responds, the alert moves into text and backup-adult follow-up after {smsDelay.toLowerCase()}.</li>
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[1.5rem] border border-[#dbe4ef] bg-[#fffdfa] p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#0f766e]">What parents get on day one</div>
                      <div className="mt-4 grid gap-3 text-sm leading-6 text-[#475569]">
                        <StoryCard title="Alert feed" body="A short list of the things that really need a parent, not a giant scroll of every message and website." />
                        <StoryCard title="Approval queue" body="New contacts and app installs stay held locally until a parent approves or blocks them." />
                        <StoryCard title="Daily activity" body="A compact timeline covering browsing blocks, location check-ins, bedtime mode, and risky messages." />
                        <StoryCard title="Remote help" body="Parents can check in, pause an app, change a rule, or ask another adult to step in without taking over the whole device." />
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
                <div className="text-xs uppercase tracking-[0.22em] text-[#7dd3fc]">Guardian transparency trail</div>
                <div className="mt-2 font-[var(--font-display)] text-3xl tracking-[-0.04em]">What guardians and the system actually did</div>
                <div className="mt-4 space-y-3">
                  {actionLog.length ? (
                    actionLog.map((entry) => (
                      <div key={entry.id} className="rounded-[1.2rem] bg-white/7 px-4 py-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <div className="font-medium">{entry.action}</div>
                          <div className="text-[#94a3b8]">{entry.at}</div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#cbd5e1]">
                          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">{entry.kind}</span>
                          <span>{entry.alertTitle}</span>
                        </div>
                        <div className="mt-2 text-sm leading-6 text-[#e2e8f0]">{entry.outcome}</div>
                        <div className="mt-2 rounded-[0.9rem] bg-black/20 px-3 py-3 text-sm leading-6 text-[#cbd5e1]">{entry.privacyImpact}</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.2rem] bg-white/7 px-4 py-4 text-sm text-[#cbd5e1]">
                      Run a scan or act on an alert to build the guardian transparency trail.
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

function MetricTile({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: "slate" | "rose" | "amber" | "orange" | "emerald";
}) {
  const toneMap = {
    slate: "border-[#dbe4ef] bg-white text-[#0f172a]",
    rose: "border-[#fecdd3] bg-[#fff1f2] text-[#9f1239]",
    amber: "border-[#fde68a] bg-[#fffbeb] text-[#92400e]",
    orange: "border-[#fdba74] bg-[#fff7ed] text-[#9a3412]",
    emerald: "border-[#99f6e4] bg-[#ecfdf5] text-[#065f46]",
  } as const;

  return (
    <div className={`rounded-[1.35rem] border p-4 ${toneMap[tone]}`}>
      <div className="text-[11px] uppercase tracking-[0.18em] opacity-70">{label}</div>
      <div className="mt-3 font-[var(--font-display)] text-3xl tracking-[-0.04em]">{value}</div>
      <div className="mt-2 text-sm leading-6 opacity-80">{note}</div>
    </div>
  );
}

function SeverityPill({ severity }: { severity: Severity }) {
  return (
    <span className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] ${severityTone[severity]}`}>
      {severity}
    </span>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-[#e5edf6] bg-white px-4 py-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[#64748b]">{label}</div>
      <div className="mt-2 text-sm font-medium leading-6 text-[#0f172a]">{value}</div>
    </div>
  );
}

function ReasoningPanel({ alert }: { alert: AlertCard }) {
  return (
    <div className="rounded-[1.25rem] border border-[#dbe4ef] bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[#0f766e]">Why this was flagged</div>
          <div className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em] text-[#0f172a]">Interpretable AI triage</div>
        </div>
        <div className="rounded-full border border-[#dbe4ef] bg-[#f8fafc] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#334155]">
          {alert.confidence}% confidence
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SignalPanel title="Detected patterns" items={alert.matchedTactics} />
        <SignalPanel title="Secondary context" items={alert.contextSignals.length ? alert.contextSignals : ["No extra context needed"]} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SignalPanel title="Policy context" items={alert.policyContext.length ? alert.policyContext : ["No active policy changed the route"]} />
        <SignalPanel title="Redacted evidence" items={alert.evidence.length ? alert.evidence : [alert.revealSummary]} mono />
      </div>

      <div className="mt-4 rounded-[1.1rem] border border-[#e5edf6] bg-[#f8fafc] px-4 py-4 text-sm leading-6 text-[#334155]">
        <span className="font-medium text-[#0f172a]">Why it matters:</span> {alert.explanation}
      </div>

      <div className="mt-4 rounded-[1.1rem] border border-[#dbe4ef] bg-[linear-gradient(135deg,_#eff6ff_0%,_#f8fafc_100%)] px-4 py-4 text-sm leading-6 text-[#334155]">
        <div className="text-[11px] uppercase tracking-[0.18em] text-[#64748b]">Recommended parent action</div>
        <div className="mt-2 font-medium text-[#0f172a]">{alert.recommendedAction}</div>
      </div>
    </div>
  );
}

function LifecycleStrip({ currentStep }: { currentStep: string }) {
  const steps = ["Detected", "Redacted", "Queued", "Viewed", "Acknowledged", "Actioned", "Resolved"];
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="rounded-[1.25rem] border border-[#dbe4ef] bg-white p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Incident lifecycle</div>
      <div className="mt-4 grid gap-2 md:grid-cols-5">
        {steps.map((step, index) => {
          const active = index <= currentIndex;
          const current = step === currentStep;
          return (
            <div
              key={step}
              className={`rounded-[1rem] border px-3 py-3 text-center text-xs uppercase tracking-[0.16em] ${
                current
                  ? "border-[#10243f] bg-[#10243f] text-white"
                  : active
                    ? "border-[#99f6e4] bg-[#ecfdf5] text-[#065f46]"
                    : "border-[#e5edf6] bg-[#f8fafc] text-[#64748b]"
              }`}
            >
              {step}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PrivacyComparisonCard({
  onDeviceText,
  alert,
  childName,
  revealState,
  transcriptMode,
  onReveal,
  onCloseReveal,
}: {
  onDeviceText: string;
  alert: AlertCard;
  childName: string;
  revealState: RevealState;
  transcriptMode: "Redacted only" | "Guardian unlock required";
  onReveal: () => void;
  onCloseReveal: () => void;
}) {
  const showReveal = revealState === "revealed";

  return (
    <div className="rounded-[1.25rem] border border-[#dbe4ef] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[#0f766e]">Privacy boundary</div>
          <div className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.03em] text-[#0f172a]">Raw on device, narrow packet for parents</div>
        </div>
        <span className="rounded-full border border-[#dbe4ef] bg-[#f8fafc] px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-[#334155]">
          {showReveal ? "guarded reveal open" : transcriptMode}
        </span>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[1.1rem] border border-[#dbe4ef] bg-[#f8fafc] p-4">
          <div className="text-[11px] uppercase tracking-[0.16em] text-[#64748b]">On-device message</div>
          <div className="mt-3 rounded-[0.9rem] bg-white px-4 py-4 text-sm leading-6 text-[#334155]">
            {showReveal ? onDeviceText : alert.revealSummary}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={showReveal ? onCloseReveal : onReveal} className="rounded-full border border-[#10243f] bg-[#10243f] px-3 py-2 text-sm text-white">
              {showReveal ? "Close reveal" : transcriptMode === "Redacted only" ? "Request reveal blocked by policy" : "Request guarded reveal"}
            </button>
          </div>
          <div className="mt-3 text-xs leading-5 text-[#64748b]">Full content stays on {childName}&apos;s device unless a guardian deliberately opens a guarded reveal. That action is logged in the family transparency trail.</div>
        </div>
        <div className="rounded-[1.1rem] border border-[#dbe4ef] bg-[#fffdf7] p-4">
          <div className="text-[11px] uppercase tracking-[0.16em] text-[#64748b]">Parent-visible packet</div>
          <div className="mt-3 grid gap-3 text-sm leading-6 text-[#334155]">
            <div><span className="font-medium text-[#0f172a]">App:</span> {alert.app}</div>
            <div><span className="font-medium text-[#0f172a]">Risk:</span> {alert.severity}</div>
            <div><span className="font-medium text-[#0f172a]">Redacted snippet:</span> {alert.evidence[0] ?? "Redacted fragment only"}</div>
            <div><span className="font-medium text-[#0f172a]">Route:</span> {alert.routeStatus}</div>
            <div><span className="font-medium text-[#0f172a]">Recommendation:</span> {alert.recommendedAction}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContainmentCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.1rem] border border-[#dbe4ef] bg-white px-4 py-4">
      <div className="font-medium text-[#0f172a]">{title}</div>
      <div className="mt-2 text-sm leading-6 text-[#475569]">{body}</div>
    </div>
  );
}

function DifferentiationCard() {
  return (
    <div className="rounded-[1.25rem] border border-[#dbe4ef] bg-[linear-gradient(135deg,_#10243f_0%,_#16355b_100%)] p-5 text-white">
      <div className="text-xs uppercase tracking-[0.18em] text-[#7dd3fc]">Why this is different</div>
      <div className="mt-3 font-[var(--font-display)] text-2xl tracking-[-0.03em]">Not full surveillance. Not blind trust.</div>
      <div className="mt-3 text-sm leading-7 text-[#dbeafe]">
        SignalSafe keeps most activity on the child device, compresses risk into a redacted packet, and gives parents just enough evidence to act without building a permanent transcript archive.
      </div>
    </div>
  );
}

function TrustBoundaryCard() {
  return (
    <div className="rounded-[1.25rem] border border-[#dbe4ef] bg-[#f8fafc] p-5">
      <div className="text-xs uppercase tracking-[0.18em] text-[#0f766e]">Trust boundary</div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1rem] border border-white bg-white px-4 py-4">
          <div className="text-[11px] uppercase tracking-[0.16em] text-[#64748b]">Stays on device</div>
          <div className="mt-3 space-y-2 text-sm leading-6 text-[#334155]">
            <div>Full message content</div>
            <div>Most browsing and app activity</div>
            <div>Routine school-safe traffic</div>
          </div>
        </div>
        <div className="rounded-[1rem] border border-white bg-white px-4 py-4">
          <div className="text-[11px] uppercase tracking-[0.16em] text-[#64748b]">Can leave the device</div>
          <div className="mt-3 space-y-2 text-sm leading-6 text-[#334155]">
            <div>App name and risk label</div>
            <div>Timestamp and route state</div>
            <div>Redacted phrase fragment and acknowledgement state</div>
          </div>
        </div>
      </div>
    </div>
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

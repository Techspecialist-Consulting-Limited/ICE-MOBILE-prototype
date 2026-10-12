"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  BellRing,
  CalendarDays,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  ContactRound,
  ExternalLink,
  FileText,
  Flame,
  HardHat,
  History,
  Home,
  Images,
  Info,
  LocateFixed,
  LoaderCircle,
  MapPin,
  Newspaper,
  Phone,
  Plus,
  Radio,
  ShieldCheck,
  Siren,
  Stethoscope,
  Trash2,
  UserRound,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";

type Tab = "home" | "alerts" | "report" | "feed" | "profile";
type Screen =
  | "loginWelcome"
  | "home"
  | "categories"
  | "quickCategories"
  | "quickReportDetails"
  | "quickReportDetail"
  | "reportDetails"
  | "reportLocation"
  | "reportEvidence"
  | "reportReview"
  | "reportSubmitting"
  | "reportSuccess"
  | "reportFailure"
  | "reports"
  | "reportsEmpty"
  | "reportsUnavailable"
  | "reportDetail"
  | "reportHistory"
  | "sosActivate"
  | "sosSending"
  | "sosSent"
  | "sosCancelled"
  | "sosUnavailable"
  | "sosNotDelivered"
  | "sosStatusUnavailable"
  | "alerts"
  | "alertsEmpty"
  | "alertsUnavailable"
  | "alertDetail"
  | "alertAcknowledged"
  | "notifications"
  | "notificationsEmpty"
  | "notificationsUnavailable"
  | "notificationDetail"
  | "feed"
  | "feedEmpty"
  | "feedUnavailable"
  | "feedDetail"
  | "profile"
  | "contacts"
  | "contactEdit"
  | "signIn"
  | "signInLoading";

type IncidentCategory = {
  id: string;
  label: string;
  icon: typeof Flame;
  color: string;
};

type IncidentDraft = {
  category: string;
  summary: string;
  description: string;
  location: string;
  locationSource: "manual" | "demo" | "";
  dateTime: string;
  evidence: ReportEvidence[];
  linkedQuickReportKey?: string;
};

type ReportEvidence = {
  id: string;
  file: File;
  preview?: string;
};

type Report = {
  id: string;
  category: string;
  summary: string;
  description: string;
  location: string;
  dateTime: string;
  status: "Submitted" | "In progress" | "Resolved";
  history: string[];
  evidence: string[];
};

type QuickReport = {
  key: string;
  reference?: string;
  categoryId: string;
  category: string;
  createdAt: string;
  reporterName: string;
  location?: string;
  sendStatus: "sending" | "sent" | "failed";
  detailStatus: "not_started" | "incomplete" | "completed";
  summary: string;
  description: string;
  dateTime: string;
  evidence: { key: string; name: string; type: string; previewUrl?: string }[];
};

type Alert = {
  id: string;
  title: string;
  description: string;
  priority: "Critical" | "Advisory" | "Informational";
  time: string;
  requiresAcknowledgement: boolean;
  acknowledged: boolean;
};

type FeedItem = {
  id: string;
  title: string;
  source: string;
  time: string;
  description: string;
  classification: "Shareable" | "Internal Only" | "Restricted";
};

type EmergencyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: "Primary" | "Secondary" | "Tertiary";
};

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "report", label: "Report", icon: ClipboardList },
  { id: "feed", label: "Feed", icon: Radio },
  { id: "profile", label: "Profile", icon: UserRound },
];

const categories: IncidentCategory[] = [
  { id: "fire", label: "Fire", icon: Flame, color: "#e73c2b" },
  { id: "medical", label: "Medical", icon: Stethoscope, color: "#07844d" },
  { id: "security", label: "Security", icon: ShieldCheck, color: "#07844d" },
  { id: "accident", label: "Accident", icon: Car, color: "#ee9900" },
  { id: "workplace", label: "Workplace hazard", icon: HardHat, color: "#e99b00" },
  { id: "other", label: "Other", icon: CircleHelp, color: "#52675b" },
];

const initialAlerts: Alert[] = [
  {
    id: "alert-flood",
    title: "Heavy flooding reported nearby",
    description: "Riverside access road affected. Use the west entrance and follow Security guidance.",
    priority: "Critical",
    time: "Today, 09:31",
    requiresAcknowledgement: true,
    acknowledged: false,
  },
  {
    id: "alert-road",
    title: "Restricted access to east lobby",
    description: "Maintenance activity is affecting access to the east lobby. Please use the main entrance.",
    priority: "Advisory",
    time: "Today, 08:15",
    requiresAcknowledgement: false,
    acknowledged: false,
  },
  {
    id: "alert-update",
    title: "Routine security update",
    description: "A routine security update for staff. No action is required.",
    priority: "Informational",
    time: "Yesterday, 16:20",
    requiresAcknowledgement: false,
    acknowledged: false,
  },
];

const initialFeed: FeedItem[] = [
  {
    id: "feed-weather",
    title: "Weather advisory update",
    source: "Nigerian Meteorological Agency (NiMet)",
    time: "Today, 08:20",
    description: "Heavy rainfall is expected across parts of Abuja today. Follow official updates and allow additional time for travel.",
    classification: "Shareable",
  },
  {
    id: "feed-traffic",
    title: "Increase in traffic around HQ",
    source: "NSIA Security",
    time: "Yesterday, 17:10",
    description: "Traffic is heavier than usual near the main entrance. Consider allowing additional travel time.",
    classification: "Internal Only",
  },
  {
    id: "feed-health",
    title: "Health advisory: seasonal flu",
    source: "Federal Ministry of Health",
    time: "04 Oct 2026, 12:00",
    description: "Seasonal health guidance and prevention information for staff.",
    classification: "Shareable",
  },
  {
    id: "feed-security",
    title: "General security information",
    source: "Department of State Services",
    time: "03 Oct 2026, 09:00",
    description: "General security information shared for awareness.",
    classification: "Restricted",
  },
];

const initialReports: Report[] = [
  {
    id: "INC-2026-000145",
    category: "Medical",
    summary: "Medical Emergency",
    description: "Assistance requested in the east lobby.",
    location: "East lobby, Abuja HQ",
    dateTime: "05 Oct 2026, 09:41",
    status: "Submitted",
    history: ["Submitted · 05 Oct 2026, 09:41"],
    evidence: [],
  },
  {
    id: "INC-2026-000132",
    category: "Security",
    summary: "Security concern",
    description: "Strange activity noticed near the west gate.",
    location: "West gate, Abuja HQ",
    dateTime: "03 Oct 2026, 14:20",
    status: "In progress",
    history: ["Submitted · 03 Oct 2026, 14:20", "In progress · 03 Oct 2026, 14:26"],
    evidence: [],
  },
  {
    id: "INC-2026-000121",
    category: "Accident",
    summary: "Minor vehicle incident",
    description: "A minor vehicle incident was reported in the car park.",
    location: "Abuja HQ car park",
    dateTime: "28 Sep 2026, 11:15",
    status: "Resolved",
    history: ["Submitted · 28 Sep 2026, 11:15", "Resolved · 28 Sep 2026, 11:38"],
    evidence: [],
  },
];

const initialContacts: EmergencyContact[] = [
  { id: "contact-1", name: "Amina Yusuf", relationship: "Primary contact", phone: "+234 801 234 5678", priority: "Primary" },
  { id: "contact-2", name: "Chidi Okafor", relationship: "Secondary contact", phone: "+234 802 345 6789", priority: "Secondary" },
];

const emptyDraft: IncidentDraft = {
  category: "",
  summary: "",
  description: "",
  location: "",
  locationSource: "",
  dateTime: "",
  evidence: [],
};

const screenTitles: Partial<Record<Screen, string>> = {
  categories: "Report an incident",
  quickCategories: "Quick report",
  quickReportDetails: "Add details to report",
  quickReportDetail: "Quick report status",
  reportDetails: "Report an incident",
  reportLocation: "Report an incident",
  reportEvidence: "Report an incident",
  reportReview: "Review your report",
  reportSubmitting: "Submitting report",
  reportSuccess: "Report submitted",
  reportFailure: "Submission unavailable",
  reports: "My reports",
  reportsEmpty: "My reports",
  reportsUnavailable: "My reports",
  reportDetail: "Report details",
  reportHistory: "Status history",
  sosActivate: "Personal emergency alert",
  sosSending: "Sending request",
  sosSent: "Request preview",
  sosCancelled: "Request cancelled",
  sosUnavailable: "Location unavailable",
  sosNotDelivered: "Request not delivered",
  sosStatusUnavailable: "Status unavailable",
  alerts: "Alerts",
  alertsEmpty: "Alerts",
  alertsUnavailable: "Alerts",
  alertDetail: "Alert details",
  alertAcknowledged: "Acknowledgement saved",
  notifications: "Notifications",
  notificationsEmpty: "Notifications",
  notificationsUnavailable: "Notifications",
  notificationDetail: "Notification",
  feed: "Security feed",
  feedEmpty: "Security feed",
  feedUnavailable: "Security feed",
  feedDetail: "Feed details",
  profile: "Profile",
  contacts: "Emergency contacts",
  contactEdit: "Emergency contact",
};

function categoryFor(id: string) {
  const normalized = id.trim().toLowerCase();
  return categories.find((category) => category.id === normalized || category.label.toLowerCase() === normalized) ?? categories[categories.length - 1];
}

function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
  autoFocus = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}) {
  const styles = {
    primary: "bg-[#087443] text-white hover:bg-[#075e36] active:bg-[#064c2c]",
    secondary: "border border-[#dfe7e0] bg-white text-[#1d2d24] hover:bg-[#f2f7f3]",
    quiet: "bg-[#edf6f0] text-[#087443] hover:bg-[#e3f0e7]",
    danger: "bg-[#d92d20] text-white hover:bg-[#bd271c]",
  }[variant];
  return (
    <button type={type} disabled={disabled} autoFocus={autoFocus} onClick={onClick} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}>
      {children}
    </button>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-[#e1e8e2] bg-white p-4 ${className}`}>{children}</section>;
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-[#24352b]">
        {label}{required && <span className="ml-1 text-[#c03228]">*</span>}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-[#b42318]">{error}</span> : hint ? <span className="mt-1 block text-xs text-[#66736b]">{hint}</span> : null}
    </label>
  );
}

function inputClass(error = false) {
  return `w-full rounded-xl border ${error ? "border-[#d92d20]" : "border-[#dfe7e0]"} bg-white px-3 py-3 text-sm text-[#18231d] placeholder:text-[#94a099] focus:border-[#087443] focus:outline-none focus:ring-2 focus:ring-[#087443]/15`;
}

function ScreenHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#edf1ed] px-4">
      <button onClick={onBack} aria-label="Go back" className="flex h-10 w-10 items-center justify-start text-[#35463c]">
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="truncate px-2 text-center text-sm font-semibold text-[#17271e]">{title}</h1>
      <span className="h-10 w-10" aria-hidden="true" />
    </div>
  );
}

function StatusPill({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "amber" | "red" | "gray" | "blue" }) {
  const tones = {
    green: "bg-[#e5f5e9] text-[#087443]",
    amber: "bg-[#fff3d9] text-[#98610a]",
    red: "bg-[#ffebe9] text-[#b42318]",
    gray: "bg-[#eef1ef] text-[#58655d]",
    blue: "bg-[#eaf2ff] text-[#245aa6]",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

function Stepper({ step }: { step: number }) {
  const names = ["Category", "Details", "Location", "Evidence"];
  return (
    <div className="mb-4 flex items-start" aria-label={`Step ${step} of ${names.length}`}>
      {names.map((name, index) => {
        const number = index + 1;
        const current = number === step;
        const done = number < step;
        return (
          <div key={name} className="relative flex flex-1 flex-col items-center">
            {index < names.length - 1 && <span className={`absolute left-1/2 top-3 h-px w-full ${done ? "bg-[#087443]" : "bg-[#dfe7e0]"}`} />}
            <span className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${current || done ? "bg-[#087443] text-white" : "bg-[#edf1ed] text-[#728077]"}`}>
              {done ? <Check className="h-3.5 w-3.5" /> : number}
            </span>
            <span className={`mt-1 text-[10px] ${current ? "font-semibold text-[#087443]" : "text-[#78847c]"}`}>{name}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ICEApp() {
  const [screen, setScreen] = useState<Screen>("loginWelcome");
  const [screenStack, setScreenStack] = useState<Screen[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [draft, setDraft] = useState<IncidentDraft>(emptyDraft);
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});
  const [reports, setReports] = useState(initialReports);
  const [quickReports, setQuickReports] = useState<QuickReport[]>([]);
  const [selectedQuickReportKey, setSelectedQuickReportKey] = useState<string | null>(null);
  const [dismissedQuickReportKey, setDismissedQuickReportKey] = useState<string | null>(null);
  const [quickDetailsErrors, setQuickDetailsErrors] = useState<Record<string, string>>({});
  const [quickDetailsSaving, setQuickDetailsSaving] = useState(false);
  const [quickCategoryChoiceId, setQuickCategoryChoiceId] = useState<string | null>(null);
  const quickSendLock = useRef(false);
  const quickSaveLock = useRef(false);
  const [quickEvidenceObjectUrls] = useState(() => new Set<string>());
  const quickEventSequence = useRef(0);
  const quickReferenceSequence = useRef(0);
  const [selectedReportId, setSelectedReportId] = useState(initialReports[0].id);
  const [reportFilter, setReportFilter] = useState("All");
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedAlertId, setSelectedAlertId] = useState(initialAlerts[0].id);
  const [alertAcknowledgementOrigin, setAlertAcknowledgementOrigin] = useState<"alerts" | "notifications">("alerts");
  const [notificationsRead, setNotificationsRead] = useState<string[]>([]);
  const [selectedNotificationKind, setSelectedNotificationKind] = useState<"alert" | "report">("alert");
  const [feed] = useState(initialFeed);
  const [selectedFeedId, setSelectedFeedId] = useState(initialFeed[0].id);
  const [contacts, setContacts] = useState(initialContacts);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactDraft, setContactDraft] = useState({ name: "", relationship: "", phone: "", priority: "Tertiary" as EmergencyContact["priority"] });
  const [contactError, setContactError] = useState("");
  const [showFirstLoginWelcome, setShowFirstLoginWelcome] = useState(false);
  const [sosHasLocation, setSosHasLocation] = useState(true);
  const [sosAcknowledged, setSosAcknowledged] = useState(false);
  const [demoSosStatus, setDemoSosStatus] = useState("Awaiting primary contact acknowledgement");

  useEffect(() => () => {
    quickEvidenceObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [quickEvidenceObjectUrls]);

  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0];
  const selectedQuickReport = quickReports.find((report) => report.key === selectedQuickReportKey);
  const currentQuickReport = quickReports[0];
  const latestSentQuickReport = quickReports.find((report) => report.sendStatus === "sent");
  const selectedAlert = alerts.find((alert) => alert.id === selectedAlertId) ?? alerts[0];
  const selectedFeed = feed.find((item) => item.id === selectedFeedId) ?? feed[0];
  const unreadCount = useMemo(() => Math.max(0, 2 - notificationsRead.length), [notificationsRead.length]);

  function go(next: Screen, tab?: Tab) {
    setScreenStack((previous) => [...previous, screen]);
    setScreen(next);
    if (tab) setActiveTab(tab);
  }

  function replace(next: Screen) {
    setScreen(next);
  }

  function back() {
    if (screenStack.length === 0) {
      setScreen("home");
      setActiveTab("home");
      return;
    }
    setScreen(screenStack[screenStack.length - 1]);
    setScreenStack(screenStack.slice(0, -1));
  }

  function openTab(tab: Tab) {
    setScreenStack([]);
    setActiveTab(tab);
    if (tab === "report") {
      setDraft({ ...emptyDraft, dateTime: toLocalDateTime(new Date().toISOString()) });
      setDraftErrors({});
    }
    const target: Record<Tab, Screen> = {
      home: "home",
      alerts: "alerts",
      report: "categories",
      feed: "feed",
      profile: "profile",
    };
    setScreen(target[tab]);
  }

  function startReport(category = "", linkedQuickReport?: QuickReport) {
    setQuickCategoryChoiceId(null);
    setDraft({
      ...emptyDraft,
      category,
      summary: linkedQuickReport?.summary ?? "",
      description: linkedQuickReport?.description ?? "",
      location: linkedQuickReport?.location ?? "",
      locationSource: linkedQuickReport?.location ? "demo" : "",
      dateTime: linkedQuickReport?.dateTime || toLocalDateTime(linkedQuickReport?.createdAt ?? new Date().toISOString()),
      evidence: linkedQuickReport?.evidence.map((item) => ({
        id: item.key,
        file: new File([], item.name, { type: item.type }),
        preview: item.previewUrl,
      })) ?? [],
      linkedQuickReportKey: linkedQuickReport?.key,
    });
    setDraftErrors({});
    go(category ? "reportDetails" : "categories", "report");
  }

  function continueWithCategory() {
    if (!draft.category) {
      setDraftErrors({ category: "Select an incident category." });
      return;
    }
    setDraftErrors((previous) => {
      const next = { ...previous };
      delete next.category;
      return next;
    });
    go("reportDetails");
  }

  function requestQuickReportChoice(categoryId: string) {
    if (quickSendLock.current) return;
    setQuickCategoryChoiceId(categoryFor(categoryId).id);
  }

  function confirmQuickReportSend() {
    if (!quickCategoryChoiceId) return;
    const categoryId = quickCategoryChoiceId;
    setQuickCategoryChoiceId(null);
    startQuickReport(categoryId);
    if (screen === "quickCategories") {
      setScreenStack([]);
      setScreen("home");
      setActiveTab("home");
    }
  }

  function chooseQuickReportDetails() {
    if (!quickCategoryChoiceId) return;
    startReport(quickCategoryChoiceId);
  }

  function startQuickReport(categoryId: string, retryKey?: string) {
    if (quickSendLock.current) return;
    const previousAttempt = retryKey ? quickReports.find((report) => report.key === retryKey) : undefined;
    const category = categoryFor(categoryId);
    const quickReport: QuickReport = previousAttempt
      ? { ...previousAttempt, sendStatus: "sending" }
      : {
          key: `quick-${Date.now()}-${++quickEventSequence.current}`,
          categoryId: category.id,
          category: category.label,
          createdAt: new Date().toISOString(),
          reporterName: "Mike",
          location: undefined,
          sendStatus: "sending",
          detailStatus: "not_started",
          summary: "",
          description: "",
          dateTime: toLocalDateTime(new Date().toISOString()),
          evidence: [],
        };
    quickSendLock.current = true;
    setQuickReports((previous) => previousAttempt
      ? previous.map((report) => report.key === quickReport.key ? quickReport : report)
      : [quickReport, ...previous]);
    setDismissedQuickReportKey(null);
    window.setTimeout(() => {
      const failed = !navigator.onLine;
      const sequence = failed ? undefined : ++quickReferenceSequence.current;
      const now = new Date(quickReport.createdAt);
      const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      setQuickReports((previous) => previous.map((report) => report.key === quickReport.key
        ? {
            ...report,
            sendStatus: failed ? "failed" : "sent",
            reference: failed ? undefined : `QR-${date}-${String(sequence).padStart(3, "0")}`,
          }
        : report));
      quickSendLock.current = false;
    }, 650);
  }

  function patchQuickReport(key: string, values: Partial<QuickReport>) {
    setQuickReports((previous) => previous.map((report) => report.key === key ? { ...report, ...values } : report));
    setQuickDetailsErrors((previous) => {
      const next = { ...previous };
      for (const field of Object.keys(values)) delete next[field];
      return next;
    });
  }

  function validateQuickReportDetails(report: QuickReport) {
    const errors: Record<string, string> = {};
    if (!report.categoryId) errors.categoryId = "Select an incident category.";
    if (!report.summary.trim()) errors.summary = "Enter a short incident summary.";
    if (!report.description.trim()) errors.description = "Add a description of what happened.";
    if (!report.location?.trim()) errors.location = "Enter the incident location.";
    if (!report.dateTime) errors.dateTime = "Select the incident date and time.";
    setQuickDetailsErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function saveQuickReportDetails(report: QuickReport) {
    if (quickSaveLock.current || !validateQuickReportDetails(report)) return;
    quickSaveLock.current = true;
    setQuickDetailsSaving(true);
    window.setTimeout(() => {
      setQuickReports((previous) => previous.map((item) => item.key === report.key
        ? { ...item, category: categoryFor(item.categoryId).label, detailStatus: "completed" }
        : item));
      setDismissedQuickReportKey(null);
      setQuickDetailsSaving(false);
      quickSaveLock.current = false;
      setScreenStack([]);
      setScreen("home");
      setActiveTab("home");
    }, 350);
  }

  function patchDraft(values: Partial<IncidentDraft>) {
    setDraft((previous) => ({ ...previous, ...values }));
    setDraftErrors((previous) => {
      const next = { ...previous };
      delete next.form;
      for (const key of Object.keys(values)) delete next[key];
      return next;
    });
  }

  function validateReportDetails() {
    const errors: Record<string, string> = {};
    if (!draft.category) errors.category = "Select an incident category.";
    if (!draft.summary.trim()) errors.summary = "Enter a short incident summary.";
    if (!draft.description.trim()) errors.description = "Add a description of what happened.";
    setDraftErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateLocation() {
    const errors: Record<string, string> = {};
    if (!draft.location.trim()) errors.location = "Enter the incident location.";
    if (!draft.dateTime || Number.isNaN(new Date(draft.dateTime).getTime())) errors.dateTime = "Enter a valid incident date and time.";
    setDraftErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function finishReport(fail = false) {
    if (fail) {
      go("reportFailure");
      return;
    }
    go("reportSubmitting");
    window.setTimeout(() => {
      if (draft.linkedQuickReportKey) {
        const linkedQuickReport = quickReports.find((report) => report.key === draft.linkedQuickReportKey);
        if (!linkedQuickReport?.reference) {
          setDraftErrors({ form: "The linked quick report is no longer available. Your details are still in this draft." });
          setScreen("reportReview");
          return;
        }
        setQuickReports((previous) => previous.map((report) => report.key === draft.linkedQuickReportKey
          ? {
              ...report,
              categoryId: categoryFor(draft.category).id,
              category: categoryFor(draft.category).label,
              summary: draft.summary.trim(),
              description: draft.description.trim(),
              location: draft.location.trim(),
              dateTime: draft.dateTime,
              evidence: draft.evidence.map(({ id, file, preview }) => ({ key: id, name: file.name, type: file.type, previewUrl: preview })),
              detailStatus: "completed",
            }
          : report));
        setDismissedQuickReportKey(null);
        setScreenStack([]);
        setScreen("home");
        setActiveTab("home");
        return;
      }
      const latestSequence = reports.reduce((latest, report) => {
        const match = /^INC-2026-(\d{6})$/.exec(report.id);
        return match ? Math.max(latest, Number(match[1])) : latest;
      }, 145);
      const sequence = latestSequence + 1;
      const newReport: Report = {
        id: `INC-2026-${String(sequence).padStart(6, "0")}`,
        category: categoryFor(draft.category).label,
        summary: draft.summary.trim(),
        description: draft.description.trim(),
        location: draft.location.trim(),
        dateTime: new Date(draft.dateTime).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        status: "Submitted",
        history: ["Submitted · just now"],
        evidence: draft.evidence.map(({ file }) => file.name),
      };
      setReports((previous) => [newReport, ...previous]);
      setSelectedReportId(newReport.id);
      setScreen("reportSuccess");
    }, 850);
  }

  function sendMockSos(continueWithoutLocation = false) {
    if (!sosHasLocation && !continueWithoutLocation) {
      go("sosUnavailable");
      return;
    }
    setSosAcknowledged(false);
    setDemoSosStatus("Awaiting primary contact acknowledgement");
    go("sosSending");
    window.setTimeout(() => setScreen("sosSent"), 950);
  }

  function acknowledgeAlert(alert: Alert, origin: "alerts" | "notifications" = "alerts") {
    setAlerts((previous) => previous.map((item) => item.id === alert.id ? { ...item, acknowledged: true } : item));
    setAlertAcknowledgementOrigin(origin);
    replace("alertAcknowledged");
  }

  function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contactDraft.name.trim() || !contactDraft.relationship.trim() || !contactDraft.phone.trim()) {
      setContactError("Complete the name, relationship, and phone number.");
      return;
    }
    if (!/^\+?[0-9 ()-]{7,20}$/.test(contactDraft.phone.trim())) {
      setContactError("Enter a valid phone number.");
      return;
    }
    if (contacts.some((contact) => contact.id !== editingContactId && contact.priority === contactDraft.priority)) {
      setContactError(`A ${contactDraft.priority.toLowerCase()} contact already exists. Edit that contact or choose a different priority.`);
      return;
    }
    const saved: EmergencyContact = {
      ...contactDraft,
      id: editingContactId ?? `contact-${Date.now()}`,
      name: contactDraft.name.trim(),
      relationship: contactDraft.relationship.trim(),
      phone: contactDraft.phone.trim(),
    };
    setContacts((previous) => editingContactId ? previous.map((contact) => contact.id === editingContactId ? saved : contact) : [...previous, saved]);
    setContactError("");
    back();
  }

  function editContact(contact?: EmergencyContact) {
    setEditingContactId(contact?.id ?? null);
    setContactDraft(contact
      ? { name: contact.name, relationship: contact.relationship, phone: contact.phone, priority: contact.priority }
      : { name: "", relationship: "", phone: "", priority: contacts.some((item) => item.priority === "Tertiary") ? "Secondary" : "Tertiary" });
    setContactError("");
    go("contactEdit");
  }

  function openSignIn() {
    setScreen("signIn");
  }

  function simulateSignIn() {
    setScreen("signInLoading");
    window.setTimeout(() => {
      setScreenStack([]);
      setActiveTab("home");
      setScreen("home");
      setShowFirstLoginWelcome(true);
    }, 700);
  }

  function markNotificationRead(id: string, kind: "alert" | "report", targetId: string) {
    setNotificationsRead((previous) => previous.includes(id) ? previous : [...previous, id]);
    setSelectedNotificationKind(kind);
    if (kind === "alert") setSelectedAlertId(targetId);
    else setSelectedReportId(targetId);
    go("notificationDetail");
  }

  const title = screenTitles[screen];
  const isLoginScreen = ["loginWelcome", "signIn", "signInLoading"].includes(screen);
  const showNav = !["sosActivate", "sosSending", "sosSent", "sosCancelled", "sosUnavailable", "sosNotDelivered", "sosStatusUnavailable", "reportSubmitting", "loginWelcome", "signIn", "signInLoading"].includes(screen);

  return (
    <main className="ice-stage flex min-h-[100dvh] items-center justify-center bg-[#e9ece9] p-0 sm:p-5">
      <div className="ice-phone relative flex h-[100dvh] min-h-[640px] w-full max-w-[390px] flex-col overflow-hidden bg-[#f8faf8] shadow-[0_24px_70px_rgba(25,42,31,0.15)] sm:h-[min(900px,calc(100dvh-2.5rem))] sm:min-h-[700px] sm:rounded-[36px] sm:border sm:border-[#dfe7e0]">
        {!isLoginScreen && <PhoneTopBar unreadCount={unreadCount} />}
        {title && !isLoginScreen && <ScreenHeader title={title} onBack={back} />}
        <div className={`ice-content min-h-0 flex-1 overflow-y-auto overscroll-contain ${isLoginScreen ? "" : "px-4 pb-4"}`}>
          {screen === "loginWelcome" && <LoginWelcomeScreen onLogin={openSignIn} />}
          {screen === "signIn" && <MicrosoftSignInScreen onBack={() => setScreen("loginWelcome")} onContinue={simulateSignIn} />}
          {screen === "signInLoading" && <LoadingScreen icon={<ShieldCheck />} title="Signing in to ICE" detail="Prototype sign-in only. No account or credentials are being verified." />}
          {screen === "home" && (
            <HomeScreen
              unreadCount={unreadCount}
              alerts={alerts}
              reports={reports}
              quickReport={currentQuickReport}
              latestSentQuickReport={latestSentQuickReport}
              isQuickReportDismissed={dismissedQuickReportKey === latestSentQuickReport?.key}
              isQuickReportSending={currentQuickReport?.sendStatus === "sending"}
              onNotifications={() => go("notifications", "alerts")}
              onAlert={() => { setSelectedAlertId(alerts[0].id); go("alertDetail", "alerts"); }}
              onReport={() => startReport()}
              onCategory={requestQuickReportChoice}
              onShowMore={() => go("quickCategories", "home")}
              onContacts={() => go("contacts")}
              onSOS={() => { setSosHasLocation(true); setSosAcknowledged(false); go("sosActivate"); }}
              onReports={() => go("reports", "report")}
              onQuickRetry={(key) => startQuickReport(currentQuickReport?.categoryId ?? "", key)}
              onTrackQuickReport={(report) => { setSelectedQuickReportKey(report.key); go("quickReportDetail", "home"); }}
              onAddQuickDetails={(report) => startReport(report.categoryId, report)}
              onDismissQuickReport={() => { if (latestSentQuickReport) setDismissedQuickReportKey(latestSentQuickReport.key); }}
            />
          )}
          {screen === "categories" && <CategoryScreen selected={draft.category} error={draftErrors.category} onSelect={(id) => patchDraft({ category: id })} onContinue={continueWithCategory} />}
          {screen === "quickCategories" && <CategoryScreen quick onSelect={(id) => {
            requestQuickReportChoice(id);
          }} />}
          {screen === "quickReportDetails" && selectedQuickReport && <QuickReportDetailsScreen report={selectedQuickReport} errors={quickDetailsErrors} saving={quickDetailsSaving} objectUrls={quickEvidenceObjectUrls} onChange={(values) => patchQuickReport(selectedQuickReport.key, values)} onSave={() => saveQuickReportDetails(selectedQuickReport)} onCancel={back} />}
          {screen === "quickReportDetail" && selectedQuickReport && <QuickReportStatusScreen report={selectedQuickReport} onAddDetails={() => startReport(selectedQuickReport.categoryId, selectedQuickReport)} onHome={() => openTab("home")} />}
          {screen === "reportDetails" && <ReportDetailsScreen draft={draft} errors={draftErrors} onChange={patchDraft} onChooseCategory={() => go("categories")} onBack={back} onNext={() => validateReportDetails() && go("reportLocation")} />}
          {screen === "reportLocation" && <LocationScreen draft={draft} errors={draftErrors} onChange={patchDraft} onNext={() => validateLocation() && go("reportEvidence")} onBack={back} />}
          {screen === "reportEvidence" && <EvidenceScreen draft={draft} onChange={patchDraft} onNext={() => go("reportReview")} />}
          {screen === "reportReview" && <ReviewScreen draft={draft} errors={draftErrors} onEdit={(target) => go(target)} onSubmit={() => finishReport()} onSimulateFailure={() => finishReport(true)} />}
          {screen === "reportSubmitting" && <LoadingScreen icon={<ClipboardList />} title="Sending your report" detail="This is a local prototype submission. No report is being sent to a live NSIA service." />}
          {screen === "reportSuccess" && <ReportResultScreen report={selectedReport} onReports={() => go("reports", "report")} onHome={() => openTab("home")} />}
          {screen === "reportFailure" && <ReportFailureScreen onReview={back} />}
          {screen === "reports" && <ReportsScreen reports={reports} filter={reportFilter} onFilter={setReportFilter} onSelect={(report) => { setSelectedReportId(report.id); go("reportDetail"); }} onCreate={() => startReport()} onPreviewEmpty={() => go("reportsEmpty")} onPreviewUnavailable={() => go("reportsUnavailable")} />}
          {screen === "reportsEmpty" && <OutcomeScreen icon={<FileText />} tone="gray" title="No reports yet" description="When you submit an incident report, it will appear here." button="Open reports" onClick={back} />}
          {screen === "reportsUnavailable" && <OutcomeScreen icon={<AlertTriangle />} tone="amber" title="Reports unavailable" description="The report list cannot be loaded in this preview state. Your locally held form data remains unchanged." button="Retry reports" onClick={back} />}
          {screen === "reportDetail" && selectedReport && <ReportDetailScreen report={selectedReport} onHistory={() => go("reportHistory")} />}
          {screen === "reportHistory" && selectedReport && <HistoryScreen report={selectedReport} />}
          {screen === "sosActivate" && <SosActivationScreen contacts={contacts} hasLocation={sosHasLocation} onLocationChange={setSosHasLocation} onSend={sendMockSos} onCancel={() => go("sosCancelled")} />}
          {screen === "sosSending" && <LoadingScreen icon={<Siren />} title="Sending request" detail="Demonstration only. A real emergency contact is not being notified." />}
          {screen === "sosSent" && <SosSentScreen contacts={contacts} acknowledged={sosAcknowledged} status={demoSosStatus} onAcknowledge={() => { setSosAcknowledged(true); setDemoSosStatus("Primary contact acknowledgement simulated"); }} onSimulateNoAck={() => setDemoSosStatus("No acknowledgement simulated · secondary escalation can be reviewed")} onSecondary={() => setDemoSosStatus("Secondary contact step previewed only")} onFailure={() => go("sosNotDelivered")} onStatusUnavailable={() => go("sosStatusUnavailable")} onHome={() => openTab("home")} />}
          {screen === "sosCancelled" && <OutcomeScreen icon={<X />} tone="gray" title="SOS cancelled" description="The demo request was cancelled before sending. No emergency contact was notified." button="Back to Home" onClick={() => openTab("home")} />}
          {screen === "sosUnavailable" && <OutcomeScreen icon={<MapPin />} tone="amber" title="Location unavailable" description="The demo could not find a location. You can retry location capture or continue without attaching location to the demo request." button="Try location again" onClick={() => replace("sosActivate")} secondaryAction={() => sendMockSos(true)} secondaryLabel="Continue without location" />}
          {screen === "sosNotDelivered" && <OutcomeScreen icon={<AlertTriangle />} tone="amber" title="Request not delivered" description="The delivery-failure state is being previewed. No contact or service was reached." button="Try request again" onClick={() => replace("sosActivate")} secondaryAction={() => openTab("home")} secondaryLabel="Back to Home" />}
          {screen === "sosStatusUnavailable" && <OutcomeScreen icon={<CircleHelp />} tone="gray" title="Status unavailable" description="The demo cannot retrieve a current contact acknowledgement status." button="Return to request" onClick={back} secondaryAction={() => openTab("home")} secondaryLabel="Back to Home" />}
          {screen === "alerts" && <AlertsScreen alerts={alerts} onSelect={(alert) => { setSelectedAlertId(alert.id); go("alertDetail"); }} onPreviewEmpty={() => go("alertsEmpty")} onPreviewUnavailable={() => go("alertsUnavailable")} />}
          {screen === "alertsEmpty" && <OutcomeScreen icon={<Bell />} tone="gray" title="No active alerts" description="There are no active alerts to display in this preview state." button="Back to alerts" onClick={back} />}
          {screen === "alertsUnavailable" && <OutcomeScreen icon={<AlertTriangle />} tone="amber" title="Alerts unavailable" description="The alert list is unavailable in this preview state. Try again to return to the list." button="Retry alerts" onClick={back} />}
          {screen === "alertDetail" && selectedAlert && <AlertDetailScreen alert={selectedAlert} onAcknowledge={() => acknowledgeAlert(selectedAlert)} />}
          {screen === "alertAcknowledged" && <OutcomeScreen icon={<Check />} tone="green" title="Acknowledgement saved" description="Your acknowledgement is saved in this local demo only." button={alertAcknowledgementOrigin === "notifications" ? "Back to notifications" : "Back to alerts"} onClick={back} />}
          {screen === "notifications" && <NotificationsScreen read={notificationsRead} reports={reports} onSelect={(id, kind, targetId) => markNotificationRead(id, kind, targetId)} onPreviewEmpty={() => go("notificationsEmpty")} onPreviewUnavailable={() => go("notificationsUnavailable")} />}
          {screen === "notificationsEmpty" && <OutcomeScreen icon={<Bell />} tone="gray" title="No notifications" description="New alerts and report updates will appear here." button="Back to notifications" onClick={back} />}
          {screen === "notificationsUnavailable" && <OutcomeScreen icon={<AlertTriangle />} tone="amber" title="Notifications unavailable" description="Notification history could not be loaded in this preview state." button="Retry notifications" onClick={back} />}
          {screen === "notificationDetail" && (selectedNotificationKind === "alert" && selectedAlert
            ? <AlertDetailScreen alert={selectedAlert} onAcknowledge={() => acknowledgeAlert(selectedAlert, "notifications")} />
            : selectedReport && <ReportDetailScreen report={selectedReport} onHistory={() => go("reportHistory")} />)}
          {screen === "feed" && <FeedScreen items={feed} onSelect={(item) => { setSelectedFeedId(item.id); go("feedDetail"); }} onPreviewEmpty={() => go("feedEmpty")} onPreviewUnavailable={() => go("feedUnavailable")} />}
          {screen === "feedEmpty" && <OutcomeScreen icon={<Newspaper />} tone="gray" title="No feed updates" description="There are no feed items in this preview state." button="Back to feed" onClick={back} />}
          {screen === "feedUnavailable" && <OutcomeScreen icon={<AlertTriangle />} tone="amber" title="Security feed unavailable" description="Feed items could not be loaded in this preview state." button="Retry feed" onClick={back} />}
          {screen === "feedDetail" && selectedFeed && <FeedDetailScreen item={selectedFeed} />}
          {screen === "profile" && <ProfileScreen onContacts={() => go("contacts")} onNotifications={() => go("notifications", "alerts")} />}
          {screen === "contacts" && <ContactsScreen contacts={contacts} onAdd={() => editContact()} onEdit={editContact} onDelete={(id) => setContacts((previous) => previous.filter((contact) => contact.id !== id))} />}
          {screen === "contactEdit" && <ContactForm draft={contactDraft} error={contactError} editing={Boolean(editingContactId)} onChange={setContactDraft} onSave={saveContact} onCancel={back} />}
        </div>
        {showNav && <BottomNav activeTab={activeTab} onChange={openTab} unreadCount={unreadCount} />}
        {showFirstLoginWelcome && <FirstLoginWelcomeModal onDismiss={() => setShowFirstLoginWelcome(false)} />}
        {quickCategoryChoiceId && (
          <QuickReportChoiceDialog
            category={categoryFor(quickCategoryChoiceId)}
            onClose={() => setQuickCategoryChoiceId(null)}
            onSendNow={confirmQuickReportSend}
            onSendWithDetails={chooseQuickReportDetails}
          />
        )}
      </div>
    </main>
  );
}

function PhoneTopBar({ unreadCount }: { unreadCount: number }) {
  return (
    <div className="flex h-10 shrink-0 items-center justify-between px-5 pt-1 text-[13px] font-semibold text-[#1c2822]">
      <span>9:41</span>
      <div className="flex items-center gap-2 text-[11px]" aria-hidden="true">
        <span className="flex h-3 items-end gap-[2px]"><i className="h-1 w-1 rounded-sm bg-current" /><i className="h-1.5 w-1 rounded-sm bg-current" /><i className="h-2 w-1 rounded-sm bg-current" /><i className="h-3 w-1 rounded-sm bg-current" /></span>
        <span className="text-[10px]">◉</span>
        <span className="relative h-3 w-5 rounded-[4px] border border-current"><i className="absolute inset-y-[2px] left-[2px] w-3 rounded-[2px] bg-current" /></span>
      </div>
      {unreadCount > 0 && <span className="sr-only">{unreadCount} unread notifications</span>}
    </div>
  );
}

function BottomNav({ activeTab, onChange, unreadCount }: { activeTab: Tab; onChange: (tab: Tab) => void; unreadCount: number }) {
  return (
    <nav aria-label="Main navigation" className="flex h-[76px] shrink-0 items-center justify-around border-t border-[#e4ebe5] bg-[#f8faf8] px-1 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button key={id} onClick={() => onChange(id)} aria-current={active ? "page" : undefined} className={`relative flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] ${active ? "font-semibold text-[#087443]" : "text-[#607067]"}`}>
            <span className={`flex h-7 w-9 items-center justify-center rounded-full ${active ? "bg-[#dff1e4]" : ""}`}><Icon className="h-5 w-5" strokeWidth={active ? 2.3 : 1.8} /></span>
            <span>{label}</span>
            {id === "alerts" && unreadCount > 0 && <span className="absolute right-2 top-0 h-2 w-2 rounded-full bg-[#d92d20] ring-2 ring-[#f8faf8]" />}
          </button>
        );
      })}
    </nav>
  );
}

function HomeScreen({
  unreadCount,
  alerts,
  reports,
  quickReport,
  latestSentQuickReport,
  isQuickReportDismissed,
  isQuickReportSending,
  onNotifications,
  onAlert,
  onReport,
  onCategory,
  onShowMore,
  onContacts,
  onSOS,
  onReports,
  onQuickRetry,
  onTrackQuickReport,
  onAddQuickDetails,
  onDismissQuickReport,
}: {
  unreadCount: number;
  alerts: Alert[];
  reports: Report[];
  quickReport?: QuickReport;
  latestSentQuickReport?: QuickReport;
  isQuickReportDismissed: boolean;
  isQuickReportSending: boolean;
  onNotifications: () => void;
  onAlert: () => void;
  onReport: () => void;
  onCategory: (id: string) => void;
  onShowMore: () => void;
  onContacts: () => void;
  onSOS: () => void;
  onReports: () => void;
  onQuickRetry: (key: string) => void;
  onTrackQuickReport: (report: QuickReport) => void;
  onAddQuickDetails: (report: QuickReport) => void;
  onDismissQuickReport: () => void;
}) {
  const activeAlert = alerts.find((alert) => alert.priority === "Critical" && !alert.acknowledged);
  const latestReport = reports[0];
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b9e8c6] text-base font-semibold text-[#0c5934]">M</div>
          <div><p className="text-[13px] font-medium text-[#1d2d24]">Greetings, Mike.</p><p className="text-[11px] text-[#66736b]">We&apos;re here for you.</p></div>
        </div>
        <button onClick={onNotifications} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#24352b] hover:bg-[#edf5ee]">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#d92d20]" />}
        </button>
      </header>

      {activeAlert ? (
        <button onClick={onAlert} className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-[#f0e2c9] bg-[#fff8e9] p-3 text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffedc8] text-[#b7791f]"><Radio className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold text-[#27332b]">{activeAlert.title}</span><span className="mt-0.5 block text-[11px] text-[#69766d]">Riverside access road affected.</span></span>
          <ChevronRight className="h-4 w-4 text-[#946010]" />
        </button>
      ) : (
        <div className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-[#e3ede5] bg-[#eff7f0] px-3 py-3 text-[12px] text-[#294337]">
          <Radio className="h-5 w-5 text-[#0b7243]" /><span className="flex-1">Stay aware. Stay safe.</span><span className="h-[3px] w-20 rounded-full bg-[#cfe3d4]"><span className="block h-full w-1/3 rounded-full bg-[#0b7243]" /></span>
        </div>
      )}

      {quickReport && (quickReport.sendStatus !== "sent" || !isQuickReportDismissed) && (
        <QuickReportHomePanel
          report={quickReport}
          onRetry={() => onQuickRetry(quickReport.key)}
          onTrack={() => onTrackQuickReport(quickReport)}
          onAddDetails={() => onAddQuickDetails(quickReport)}
          onDismiss={onDismissQuickReport}
        />
      )}

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#1d2d24]">Recent activity</h2>
        <button onClick={onReports} className="text-[11px] font-semibold text-[#087443]">View all <span aria-hidden="true">→</span></button>
      </div>
      {latestSentQuickReport ? (
        <button onClick={() => onTrackQuickReport(latestSentQuickReport)} className="mb-5 flex items-center gap-3 rounded-2xl border border-[#e1e8e2] bg-white p-3 text-left">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0f6f1]" style={{ color: categoryFor(latestSentQuickReport.categoryId).color }}>
            {(() => { const Icon = categoryFor(latestSentQuickReport.categoryId).icon; return <Icon className="h-5 w-5" />; })()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-x-2 text-[10px] text-[#66736b]">
              <StatusPill>{latestSentQuickReport.detailStatus === "completed" ? "Details added" : "Quick report sent"}</StatusPill>
              <span>{new Date(latestSentQuickReport.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
            </span>
            <span className="mt-1 block truncate text-[13px] font-medium text-[#1c2b22]">{latestSentQuickReport.summary || `${latestSentQuickReport.category} quick report`}</span>
            <span className="block text-[10px] text-[#718078]">{latestSentQuickReport.reference}</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#647269]" />
        </button>
      ) : latestReport ? (
        <button onClick={onReports} className="mb-5 flex items-center gap-3 rounded-2xl border border-[#e1e8e2] bg-white p-3 text-left">
          <FileText className="h-5 w-5 shrink-0 text-[#2c6547]" />
          <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-x-2 text-[10px] text-[#66736b]"><StatusPill>{latestReport.status}</StatusPill><span>09:41</span><span>·</span><span>{latestReport.location.split(",")[0]}</span></span><span className="mt-1 block truncate text-[13px] font-medium text-[#1c2b22]">{latestReport.summary}</span><span className="block text-[10px] text-[#718078]">{latestReport.id}</span></span>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#647269]" />
        </button>
      ) : <p className="mb-5 rounded-2xl border border-dashed border-[#dfe7e0] p-4 text-center text-xs text-[#718078]">Your recent reports will appear here.</p>}

      <div className="mb-3">
        <h2 className="text-[15px] font-semibold text-[#1d2d24]">Report an incident</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {categories.slice(0, 4).map(({ id, label, icon: Icon, color }) => (
          <button key={id} onClick={() => onCategory(id)} disabled={isQuickReportSending} className="flex min-h-[82px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#edf1ed] bg-[#f1f7f2] text-[#1d2d24] transition-colors hover:bg-[#e8f2ea] disabled:cursor-wait disabled:opacity-60">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80" style={{ color }}><Icon className="h-5 w-5" strokeWidth={2.4} /></span>
            <span className="text-[12px] font-medium">{label}</span>
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-center">
        <button onClick={onShowMore} className="flex min-h-11 items-center gap-1 px-3 text-[11px] font-semibold text-[#087443]">Show more <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" /></button>
      </div>
      <div className="mt-3 mb-2 flex items-center justify-between gap-1 py-1">
        <button onClick={onContacts} aria-label="Emergency Contacts" className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-0 py-2 text-[#29463a] hover:text-[#087443]">
          <ContactRound aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-[#32634b]" />
          <span className="flex min-w-0 flex-col items-start leading-tight"><span className="text-[11px] font-medium">Contacts</span><span className="text-[10px] text-[#66736b]">Emergency</span></span>
        </button>
        <div className="sos-halo shrink-0">
          <button onClick={onSOS} aria-label="Activate personal emergency alert" className="sos-action relative z-10 flex flex-col items-center justify-center gap-0.5 rounded-full bg-[#df2929] text-white transition-transform active:scale-[0.97]">
            <Siren aria-hidden="true" className="h-7 w-7 stroke-[1.8]" /><span className="text-[15px] font-semibold leading-none tracking-wide">SOS</span>
          </button>
        </div>
        <button onClick={onReport} aria-label="Report with details" className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-0 py-2 text-[#1d2d24] hover:text-[#087443]">
          <ClipboardList className="h-[18px] w-[18px] shrink-0 text-[#32634b]" /><span className="flex flex-col items-start leading-tight"><span className="text-[11px] font-semibold">Report</span><span className="whitespace-nowrap text-[9px] text-[#66736b]">with details</span></span>
        </button>
      </div>
    </div>
  );
}

function QuickReportChoiceDialog({
  category,
  onClose,
  onSendNow,
  onSendWithDetails,
}: {
  category: IncidentCategory;
  onClose: () => void;
  onSendNow: () => void;
  onSendWithDetails: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const firstAction = dialog?.querySelector<HTMLButtonElement>("button");
    firstAction?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const actions = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
      const first = actions[0];
      const last = actions[actions.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#14231a]/45 p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-report-choice-title"
        aria-describedby="quick-report-choice-description"
        className="relative w-full max-w-[320px] rounded-2xl border border-[#e1e8e2] bg-[#fbfcfb] p-5 shadow-[0_20px_60px_rgba(20,35,26,0.24)]"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f1f7f2]" style={{ color: category.color }}>
            <category.icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0 pt-0.5">
            <h2 id="quick-report-choice-title" className="text-sm font-semibold text-[#1d2d24]">Report {category.label}</h2>
            <p id="quick-report-choice-description" className="mt-1 text-xs leading-5 text-[#66736b]">Choose how you want to continue.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-2">
          <Button onClick={onSendNow} className="w-full">Send now</Button>
          <Button onClick={onSendWithDetails} variant="secondary" className="w-full">Send with details</Button>
          <button onClick={onClose} className="min-h-11 rounded-xl px-4 text-xs font-medium text-[#66736b] hover:bg-[#f0f4f1]">Cancel</button>
        </div>
        <button onClick={onClose} aria-label="Close report options" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-[#65736a] hover:bg-[#edf3ee]">
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
}

function QuickReportHomePanel({
  report,
  onRetry,
  onTrack,
  onAddDetails,
  onDismiss,
}: {
  report: QuickReport;
  onRetry: () => void;
  onTrack: () => void;
  onAddDetails: () => void;
  onDismiss: () => void;
}) {
  if (report.sendStatus === "sending") {
    return (
      <section role="status" aria-live="polite" className="mb-4 flex items-center gap-3 rounded-2xl border border-[#dbe8df] bg-white p-3">
        <LoaderCircle aria-hidden="true" className="h-5 w-5 shrink-0 animate-spin text-[#087443]" />
        <span className="min-w-0"><span className="block text-xs font-semibold text-[#203127]">Sending quick {report.category.toLowerCase()} report…</span><span className="mt-0.5 block text-[10px] text-[#718078]">Preparing your report.</span></span>
      </section>
    );
  }

  if (report.sendStatus === "failed") {
    return (
      <section role="alert" className="mb-4 rounded-2xl border border-[#f0e2c9] bg-[#fffaf0] p-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#a96800]" />
          <div className="min-w-0 flex-1"><h3 className="text-xs font-semibold text-[#4b3b22]">Quick report could not be sent</h3><p className="mt-0.5 text-[10px] leading-4 text-[#75664f]">The demo could not complete this send. No report reference was created.</p></div>
          <button onClick={onRetry} className="flex min-h-11 shrink-0 items-center rounded-lg px-2 text-xs font-semibold text-[#087443] hover:bg-white" aria-label={`Retry quick ${report.category.toLowerCase()} report`}>Retry</button>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Quick report sent" className="mb-4 rounded-2xl border border-[#dcebdd] bg-[#f0f8f0] p-3">
      <div className="flex items-start gap-2.5">
        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#087443]" />
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-semibold text-[#135b39]">{report.detailStatus === "completed" ? "Quick report details saved" : "Quick report sent"}</h3>
          <p className="mt-0.5 text-[11px] text-[#35483b]">{report.category}{report.location ? " · Location attached" : " · Location not available"}</p>
          <p className="mt-0.5 break-all text-[10px] text-[#66736b]">Reference: {report.reference}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button onClick={onTrack} className="flex min-h-10 items-center justify-center rounded-lg bg-[#087443] px-3 text-[11px] font-semibold text-white hover:bg-[#075e36]">Track report</button>
            {report.detailStatus !== "completed" && <button onClick={onAddDetails} className="flex min-h-10 items-center justify-center rounded-lg border border-[#d5e5d7] bg-white px-3 text-[11px] font-semibold text-[#087443] hover:bg-[#f7fbf7]">Add details</button>}
          </div>
        </div>
        <button onClick={onDismiss} aria-label="Dismiss quick report confirmation" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#65736a] hover:bg-white"><X className="h-4 w-4" /></button>
      </div>
    </section>
  );
}

function toLocalDateTime(value: string) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function QuickReportDetailsScreen({
  report,
  errors,
  saving,
  objectUrls,
  onChange,
  onSave,
  onCancel,
}: {
  report: QuickReport;
  errors: Record<string, string>;
  saving: boolean;
  objectUrls: Set<string>;
  onChange: (values: Partial<QuickReport>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [evidenceError, setEvidenceError] = useState("");

  function addEvidence(event: ChangeEvent<HTMLInputElement>) {
    const remaining = Math.max(0, 5 - report.evidence.length);
    const selectedFiles = Array.from(event.target.files ?? []);
    const files = selectedFiles.slice(0, remaining);
    if (selectedFiles.length > remaining) setEvidenceError("You can attach up to 5 files.");
    else setEvidenceError("");
    const additions = files.map((file, index) => {
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
      if (previewUrl) objectUrls.add(previewUrl);
      return { key: `${Date.now()}-${index}`, name: file.name, type: file.type, previewUrl };
    });
    onChange({ evidence: [...report.evidence, ...additions], detailStatus: "incomplete" });
    event.target.value = "";
  }

  return (
    <form className="space-y-3.5 py-4" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      <Panel className="flex items-start gap-2.5 bg-[#eff8f0] p-3">
        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#087443]" />
        <div className="min-w-0"><p className="text-xs font-semibold text-[#135b39]">Quick report sent · {report.category}</p><p className="mt-0.5 break-all text-[10px] text-[#627268]">Reference: {report.reference}</p></div>
      </Panel>
      <Field label="Category" required error={errors.categoryId}>
        <select value={report.categoryId} onChange={(event) => { const nextCategory = categoryFor(event.target.value); onChange({ categoryId: nextCategory.id, category: nextCategory.label, detailStatus: "incomplete" }); }} className={inputClass(Boolean(errors.categoryId))}>
          {categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </Field>
      <Field label="Summary" required error={errors.summary} hint={`${report.summary.length}/100`}>
        <input value={report.summary} onChange={(event) => onChange({ summary: event.target.value.slice(0, 100), detailStatus: "incomplete" })} placeholder="e.g. Smoke in east lobby" className={inputClass(Boolean(errors.summary))} maxLength={100} />
      </Field>
      <Field label="Description" required error={errors.description} hint={`${report.description.length}/500`}>
        <textarea value={report.description} onChange={(event) => onChange({ description: event.target.value.slice(0, 500), detailStatus: "incomplete" })} placeholder="Describe what happened and any relevant observations…" className={`${inputClass(Boolean(errors.description))} min-h-[112px] resize-y`} maxLength={500} />
      </Field>
      <Field label="Location" required error={errors.location} hint="Enter a building, floor, or nearby landmark.">
        <input value={report.location ?? ""} onChange={(event) => onChange({ location: event.target.value, detailStatus: "incomplete" })} placeholder="Incident location" className={inputClass(Boolean(errors.location))} />
      </Field>
      <Field label="Date and time" required error={errors.dateTime}>
        <input type="datetime-local" value={report.dateTime} onChange={(event) => onChange({ dateTime: event.target.value, detailStatus: "incomplete" })} className={inputClass(Boolean(errors.dateTime))} />
      </Field>
      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-[#24352b]">Evidence <span className="font-normal text-[#748077]">(optional)</span></p>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#dfe7e0] bg-white px-2 text-xs font-medium text-[#31443a] hover:bg-[#f1f8f2]">
            <Camera aria-hidden="true" className="h-4 w-4 text-[#087443]" />Camera
            <input className="sr-only" type="file" accept="image/*,video/*" capture="environment" onChange={addEvidence} disabled={report.evidence.length >= 5} aria-label="Add evidence using camera" />
          </label>
          <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#dfe7e0] bg-white px-2 text-xs font-medium text-[#31443a] hover:bg-[#f1f8f2]">
            <Images aria-hidden="true" className="h-4 w-4 text-[#087443]" />Gallery
            <input className="sr-only" type="file" accept="image/*,video/*" multiple onChange={addEvidence} disabled={report.evidence.length >= 5} aria-label="Choose evidence from gallery" />
          </label>
        </div>
        <p className="text-[10px] text-[#748077]">Up to 5 files. Evidence is optional.</p>
        {evidenceError && <p role="alert" className="text-xs text-[#b42318]">{evidenceError}</p>}
        {report.evidence.map((file) => (
          <div key={file.key} className="flex min-h-11 items-center gap-2 rounded-xl border border-[#e1e8e2] bg-white px-2.5">
            {file.previewUrl ? <Image unoptimized src={file.previewUrl} width={36} height={36} alt={`Preview of ${file.name}`} className="h-9 w-9 shrink-0 rounded-md object-cover" /> : file.type.startsWith("video/") ? <Video className="h-4 w-4 shrink-0 text-[#087443]" /> : <Camera className="h-4 w-4 shrink-0 text-[#087443]" />}
            <span className="min-w-0 flex-1 truncate text-[11px] text-[#33443a]">{file.name}</span>
            <button type="button" onClick={() => {
              if (file.previewUrl) {
                URL.revokeObjectURL(file.previewUrl);
                objectUrls.delete(file.previewUrl);
              }
              onChange({ evidence: report.evidence.filter((item) => item.key !== file.key), detailStatus: "incomplete" });
            }} aria-label={`Remove ${file.name}`} className="flex h-9 w-9 items-center justify-center rounded-full text-[#65736a] hover:bg-[#f2f7f3]"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <Button type="submit" disabled={saving} className="w-full">{saving ? <><LoaderCircle className="h-4 w-4 animate-spin" />Saving details…</> : "Save details"}</Button>
      <Button type="button" variant="quiet" onClick={onCancel} disabled={saving} className="w-full">Cancel</Button>
    </form>
  );
}

function QuickReportStatusScreen({ report, onAddDetails, onHome }: { report: QuickReport; onAddDetails: () => void; onHome: () => void }) {
  const category = categoryFor(report.categoryId);
  const Icon = category.icon;
  return (
    <div className="space-y-3 py-4">
      <Panel className="flex items-start gap-3 bg-[#f0f8f0]">
        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#087443]" />
        <div><p className="text-sm font-semibold text-[#135b39]">Quick report sent</p><p className="mt-1 text-xs text-[#53645a]">This status is held in the local demonstration.</p></div>
      </Panel>
      <Panel className="space-y-4">
        <div><p className="text-[10px] text-[#718078]">Reference</p><p className="mt-1 break-all text-sm font-semibold text-[#26372c]">{report.reference}</p></div>
        <DetailRow icon={<Icon />} label="Category" value={report.category} />
        <DetailRow icon={<CalendarDays />} label="Reported" value={new Date(report.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
        <DetailRow icon={<UserRound />} label="Reported by" value={report.reporterName} />
        <DetailRow icon={<MapPin />} label="Location" value={report.location || "Not available"} />
        {report.dateTime && <DetailRow icon={<CalendarDays />} label="Incident date and time" value={new Date(report.dateTime).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} />}
        <DetailRow icon={<FileText />} label="Details" value={report.detailStatus === "completed" ? report.summary : "Not added yet"} />
        <StatusPill>{report.detailStatus === "completed" ? "Details added" : "Quick report sent"}</StatusPill>
      </Panel>
      {report.detailStatus !== "completed" && <Button onClick={onAddDetails} className="w-full">Add details</Button>}
      <Button onClick={onHome} variant="quiet" className="w-full">Back to Home</Button>
    </div>
  );
}

function CategoryScreen({
  onSelect,
  onContinue,
  selected = "",
  error,
  quick = false,
}: {
  onSelect: (id: string) => void;
  onContinue?: () => void;
  selected?: string;
  error?: string;
  quick?: boolean;
}) {
  return (
    <div className="space-y-4 py-4">
      <div><p className="text-sm font-semibold text-[#1d2d24]">{quick ? "Select a quick-report category" : "What do you need to report?"}</p><p className="mt-1 text-xs text-[#66736b]">{quick ? "Tap a category to send without typing." : "Choose the category that best describes what happened."}</p></div>
      {!quick && <Stepper step={1} />}
      <div className="space-y-2">
        {(quick ? categories.slice(4) : categories).map(({ id, label, icon: Icon, color }) => {
          const isSelected = selected === id;
          return (
            <button key={id} type="button" onClick={() => onSelect(id)} aria-pressed={!quick ? isSelected : undefined} className={`flex min-h-[58px] w-full items-center gap-3 rounded-xl border px-3 text-left transition-colors ${isSelected ? "border-[#71bd84] bg-[#f0f8f1]" : "border-[#e3ebe4] bg-white hover:border-[#b9d8c0] hover:bg-[#f7faf7]"}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[#087443]" style={{ color }}><Icon aria-hidden="true" className="h-5 w-5" /></span>
              <span className="flex-1 text-sm font-medium text-[#24352b]">{label}</span>
              {isSelected && !quick ? <Check aria-label="Selected" className="h-5 w-5 shrink-0 text-[#087443]" /> : <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[#647269]" />}
            </button>
          );
        })}
      </div>
      {error && <p role="alert" className="text-xs text-[#b42318]">{error}</p>}
      {!quick && <Button onClick={onContinue} disabled={!selected} className="w-full">Continue <ChevronRight className="h-4 w-4" /></Button>}
      {!quick && <Panel className="flex items-start gap-2.5 bg-[#f2f8f3] p-3 text-xs text-[#52645a]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#087443]" /><p>Incident reports are stored as local demonstration data in this prototype.</p></Panel>}
    </div>
  );
}

function ReportDetailsScreen({
  draft,
  errors,
  onChange,
  onChooseCategory,
  onBack,
  onNext,
}: {
  draft: IncidentDraft;
  errors: Record<string, string>;
  onChange: (values: Partial<IncidentDraft>) => void;
  onChooseCategory: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const selected = categoryFor(draft.category);
  return (
    <div className="space-y-4 py-4">
      <Stepper step={2} />
      <button onClick={onChooseCategory} className="flex w-full items-center gap-3 rounded-xl border border-[#e1e8e2] bg-white p-3 text-left">
        <selected.icon className="h-5 w-5" style={{ color: selected.color }} />
        <span className="flex-1"><span className="block text-[10px] text-[#758178]">Category</span><span className="text-sm font-semibold text-[#203127]">{selected.label}</span></span>
        <span className="text-[11px] font-semibold text-[#087443]">Change</span>
      </button>
      <Field label="Summary" required error={errors.summary}>
        <input value={draft.summary} onChange={(event) => onChange({ summary: event.target.value })} placeholder="e.g. Smoke detected in east lobby" className={inputClass(Boolean(errors.summary))} />
      </Field>
      <Field label="Description" required error={errors.description}>
        <textarea value={draft.description} onChange={(event) => onChange({ description: event.target.value })} placeholder="Describe what happened and what you observed." className={`${inputClass(Boolean(errors.description))} min-h-[112px] resize-y`} />
      </Field>
      {errors.form && <p role="alert" className="text-xs text-[#b42318]">{errors.form}</p>}
      <Button onClick={onNext} className="w-full">Continue <ChevronRight className="h-4 w-4" /></Button>
      <Button variant="quiet" onClick={onBack} className="w-full">Back</Button>
    </div>
  );
}

function LocationScreen({
  draft,
  errors,
  onChange,
  onNext,
  onBack,
}: {
  draft: IncidentDraft;
  errors: Record<string, string>;
  onChange: (values: Partial<IncidentDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4 py-4">
      <Stepper step={3} />
      <div>
        <p className="text-sm font-semibold text-[#1d2d24]">Location <span className="text-[#c03228]">*</span></p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onChange({ location: "East lobby, Abuja HQ", locationSource: "demo" })} aria-pressed={draft.locationSource === "demo"} className={`flex min-h-[56px] items-center justify-center gap-2 rounded-xl border px-2 text-center text-xs font-semibold ${draft.locationSource === "demo" ? "border-[#71bd84] bg-[#f0f8f1] text-[#087443]" : "border-[#dfe7e0] bg-white text-[#33443a] hover:bg-[#f5f9f5]"}`}>
            <LocateFixed className="h-4 w-4 shrink-0" />Use current location
          </button>
          <button type="button" onClick={() => onChange({ locationSource: "manual" })} aria-pressed={draft.locationSource === "manual"} className={`flex min-h-[56px] items-center justify-center gap-2 rounded-xl border px-2 text-center text-xs font-semibold ${draft.locationSource === "manual" ? "border-[#71bd84] bg-[#f0f8f1] text-[#087443]" : "border-[#dfe7e0] bg-white text-[#33443a] hover:bg-[#f5f9f5]"}`}>
            <MapPin className="h-4 w-4 shrink-0" />Enter manually
          </button>
        </div>
      </div>
      {draft.locationSource === "demo" && <p role="status" className="rounded-xl bg-[#f1f7f2] px-3 py-2 text-[11px] leading-4 text-[#53645a]">Demo location selected. This does not access your device location.</p>}
      <Field label="Selected location" required error={errors.location} hint="You can edit this location before continuing.">
        <div className="relative">
          <MapPin aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#087443]" />
          <input value={draft.location} onChange={(event) => onChange({ location: event.target.value, locationSource: "manual" })} placeholder="Building, floor, or nearby landmark" className={`${inputClass(Boolean(errors.location))} pl-10`} />
        </div>
      </Field>
      <Field label="Date & time" required error={errors.dateTime}>
        <input type="datetime-local" value={draft.dateTime} onChange={(event) => onChange({ dateTime: event.target.value })} className={inputClass(Boolean(errors.dateTime))} />
      </Field>
      <Button onClick={onNext} className="w-full">Continue <ChevronRight className="h-4 w-4" /></Button>
      <Button variant="quiet" onClick={onBack} className="w-full">Back</Button>
    </div>
  );
}

function EvidenceScreen({
  draft,
  onChange,
  onNext,
}: {
  draft: IncidentDraft;
  onChange: (values: Partial<IncidentDraft>) => void;
  onNext: () => void;
}) {
  const [evidenceError, setEvidenceError] = useState("");

  async function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selectedFiles.length === 0) return;
    const accepted = selectedFiles.filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"));
    if (accepted.length !== selectedFiles.length) setEvidenceError("Choose image or video files only.");
    else setEvidenceError("");
    if (accepted.length === 0) return;
    const additions = await Promise.all(accepted.map(async (file, index): Promise<ReportEvidence> => {
      let preview: string | undefined;
      if (file.type.startsWith("image/")) {
        try {
          preview = await readEvidencePreview(file);
        } catch {
          setEvidenceError(`Could not preview ${file.name}. The file was kept without a preview.`);
        }
      }
      return { id: `${Date.now()}-${index}-${file.name}`, file, preview };
    }));
    onChange({ evidence: [...draft.evidence, ...additions] });
  }

  return (
    <div className="space-y-4 py-4">
      <Stepper step={4} />
      <div><p className="text-sm font-semibold text-[#1d2d24]">Add evidence, if safe.</p><p className="mt-1 text-xs text-[#66736b]">Photos or videos can support your report. This step is optional.</p></div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Camera, label: "Camera" },
          { icon: Images, label: "Gallery" },
        ].map(({ icon: Icon, label }) => (
          <label key={label} className="flex min-h-[72px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-[#e1e8e2] bg-white text-center text-xs font-medium text-[#31443a] hover:bg-[#f1f8f2]">
            <Icon className="h-5 w-5 text-[#087443]" />{label}
            <input className="sr-only" type="file" accept="image/*,video/*" capture={label === "Camera" ? "environment" : undefined} multiple={label === "Gallery"} onChange={addFiles} aria-label={`Add evidence from ${label.toLowerCase()}`} />
          </label>
        ))}
      </div>
      <p className="text-[11px] text-[#748077]">Selected files remain in this local draft; they are not uploaded.</p>
      {evidenceError && <p role="alert" className="text-xs text-[#b42318]">{evidenceError}</p>}
      {draft.evidence.length > 0 && (
        <div className="space-y-2">
          {draft.evidence.map(({ id, file, preview }) => (
            <div key={id} className="flex min-h-[64px] items-center gap-3 rounded-xl border border-[#e1e8e2] bg-white p-2">
              {preview ? <Image unoptimized src={preview} width={52} height={52} alt={`Preview of ${file.name}`} className="h-[52px] w-[52px] shrink-0 rounded-lg object-cover" /> : <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg bg-[#edf5ef] text-[#087443]">{file.type.startsWith("video/") ? <Video className="h-5 w-5" /> : <Camera className="h-5 w-5" />}</span>}
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-[#33443a]">{file.name}</span><span className="mt-0.5 block text-[10px] text-[#748077]">{file.type.startsWith("video/") ? "Video" : "Image"} · {formatFileSize(file.size)}</span></span>
              <button type="button" onClick={() => onChange({ evidence: draft.evidence.filter((item) => item.id !== id) })} aria-label={`Remove ${file.name}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#65736a] hover:bg-[#f2f7f3]"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
      <Button onClick={onNext} className="w-full">Continue <ChevronRight className="h-4 w-4" /></Button>
      <Button variant="quiet" onClick={onNext} className="w-full">Skip for now</Button>
    </div>
  );
}

function readEvidencePreview(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Image preview was not available."));
    reader.onerror = () => reject(new Error("Image preview could not be read."));
    reader.readAsDataURL(file);
  });
}

function formatFileSize(size: number) {
  if (size < 1_000_000) return `${Math.max(1, Math.round(size / 1_000))} KB`;
  return `${(size / 1_000_000).toFixed(1)} MB`;
}

function ReviewScreen({
  draft,
  errors,
  onEdit,
  onSubmit,
  onSimulateFailure,
}: {
  draft: IncidentDraft;
  errors: Record<string, string>;
  onEdit: (target: Screen) => void;
  onSubmit: () => void;
  onSimulateFailure: () => void;
}) {
  const category = categoryFor(draft.category);
  const date = draft.dateTime ? new Date(draft.dateTime).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Not provided";
  const rows: { label: string; value: ReactNode; step: Screen; icon: typeof FileText }[] = [
    { label: "Category", value: category.label, step: "categories", icon: category.icon },
    { label: "Summary", value: draft.summary || "Not provided", step: "reportDetails", icon: FileText },
    { label: "Description", value: draft.description || "Not provided", step: "reportDetails", icon: Info },
    { label: "Location", value: draft.location || "Not provided", step: "reportLocation", icon: MapPin },
    { label: "Date and time", value: date, step: "reportLocation", icon: CalendarDays },
    { label: "Evidence", value: draft.evidence.length ? `${draft.evidence.length} item${draft.evidence.length === 1 ? "" : "s"}` : "None added", step: "reportEvidence", icon: Images },
  ];
  return (
    <div className="space-y-3 py-4">
      <p className="text-sm font-semibold text-[#203127]">Review your report</p>
      {errors.form && <p role="alert" className="rounded-xl border border-[#f0d5d1] bg-[#fff6f5] p-3 text-xs text-[#b42318]">{errors.form}</p>}
      {rows.map(({ label, value, step, icon: Icon }) => (
        <Panel key={label} className="flex items-start gap-3 p-3">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#087443]" />
          <div className="min-w-0 flex-1"><p className="text-[10px] text-[#748077]">{label}</p><p className="mt-0.5 whitespace-pre-wrap break-words text-xs text-[#24352b]">{value}</p></div>
          <button onClick={() => onEdit(step)} className="text-[11px] font-semibold text-[#087443]">Edit</button>
        </Panel>
      ))}
      <p className="flex items-start gap-2 rounded-xl bg-[#f1f7f2] p-3 text-[11px] text-[#53645a]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#087443]" />Prototype only. Submitting creates a local demo report; it is not sent to a live NSIA service.</p>
      <Button onClick={onSubmit} className="w-full">Submit report</Button>
      <button onClick={onSimulateFailure} className="w-full py-2 text-xs text-[#66736b] underline decoration-dotted underline-offset-2">Preview the unavailable state</button>
    </div>
  );
}

function LoadingScreen({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-[#e3f3e7] text-[#087443]">{icon}</span>
      <h2 className="mt-5 text-lg font-semibold text-[#1d2d24]">{title}</h2>
      <p className="mt-2 max-w-[280px] text-xs leading-5 text-[#66736b]">{detail}</p>
    </div>
  );
}

function ReportResultScreen({ report, onReports, onHome }: { report: Report; onReports: () => void; onHome: () => void }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <span className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#dff4e4] text-[#087443]"><CheckCircle2 className="h-10 w-10" /></span>
      <h2 className="mt-4 text-lg font-semibold text-[#1d2d24]">Report submitted</h2>
      <p className="mt-1 text-xs text-[#66736b]">Thank you for helping keep everyone safe.</p>
      <Panel className="mt-6 w-full text-left">
        <p className="text-[10px] text-[#718078]">Reference number</p>
        <p className="mt-1 text-sm font-semibold text-[#26372c]">{report.id}</p>
        <div className="mt-4 border-t border-[#e7ece8] pt-3"><p className="text-[10px] text-[#718078]">Current status</p><div className="mt-1 flex items-center gap-2"><StatusPill>{report.status}</StatusPill><span className="text-[10px] text-[#718078]">{report.dateTime}</span></div></div>
      </Panel>
      <p className="mt-3 text-[10px] text-[#77837a]">Demo report saved locally. It was not sent to a live service.</p>
      <Button onClick={onReports} className="mt-5 w-full">View my reports</Button>
      <Button onClick={onHome} variant="quiet" className="mt-2 w-full">Back to Home</Button>
    </div>
  );
}

function ReportFailureScreen({ onReview }: { onReview: () => void }) {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff0dc] text-[#a96800]"><AlertTriangle className="h-8 w-8" /></span>
      <h2 className="mt-4 text-lg font-semibold text-[#1d2d24]">Submission unavailable</h2>
      <p className="mt-2 text-xs leading-5 text-[#66736b]">The demo could not submit the report. Your entered details are still available to review.</p>
      <Button onClick={onReview} variant="quiet" className="mt-6 w-full">Return to review</Button>
    </div>
  );
}

function ReportsScreen({
  reports,
  filter,
  onFilter,
  onSelect,
  onCreate,
  onPreviewEmpty,
  onPreviewUnavailable,
}: {
  reports: Report[];
  filter: string;
  onFilter: (filter: string) => void;
  onSelect: (report: Report) => void;
  onCreate: () => void;
  onPreviewEmpty: () => void;
  onPreviewUnavailable: () => void;
}) {
  const filters = ["All", "Submitted", "In progress", "Resolved"];
  const visible = filter === "All" ? reports : reports.filter((report) => report.status === filter);
  return (
    <div className="space-y-4 py-4">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {filters.map((item) => <button key={item} onClick={() => onFilter(item)} className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium ${filter === item ? "bg-[#087443] text-white" : "bg-[#eef2ef] text-[#526158]"}`}>{item}</button>)}
      </div>
      {visible.length ? (
        <div className="space-y-2.5">
          {visible.map((report) => {
            const category = categoryFor(report.category.toLowerCase());
            const Icon = category.icon;
            const tone = report.status === "Resolved" ? "green" : report.status === "In progress" ? "amber" : "gray";
            return <button key={report.id} onClick={() => onSelect(report)} className="flex w-full items-center gap-3 rounded-2xl border border-[#e1e8e2] bg-white p-3 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f6f1]" style={{ color: category.color }}><Icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-[#203127]">{report.summary}</span><span className="mt-0.5 block text-[10px] text-[#718078]">{report.id}</span><span className="mt-2 flex items-center gap-2"><StatusPill tone={tone}>{report.status}</StatusPill><span className="text-[9px] text-[#77837a]">{report.dateTime}</span></span></span><ChevronRight className="h-4 w-4 shrink-0 text-[#718078]" />
            </button>;
          })}
        </div>
      ) : <div className="py-10 text-center"><FileText className="mx-auto h-8 w-8 text-[#91a097]" /><p className="mt-3 text-sm font-semibold text-[#35463c]">No reports yet</p><p className="mt-1 text-xs text-[#718078]">Reports you submit will appear here.</p></div>}
      {!visible.length && reports.length === 0 && <Panel className="text-xs text-[#65736a]">Reports are unavailable right now. Try again later.</Panel>}
      <Button onClick={onCreate} variant="quiet" className="w-full"><Plus className="h-4 w-4" />Create a report</Button>
      <p className="text-center text-[10px] text-[#829087]">Demonstration reports are stored in local app state.</p>
      <div className="flex justify-center gap-4"><button onClick={onPreviewEmpty} className="text-[10px] text-[#748077] underline decoration-dotted underline-offset-2">Preview empty state</button><button onClick={onPreviewUnavailable} className="text-[10px] text-[#748077] underline decoration-dotted underline-offset-2">Preview unavailable state</button></div>
    </div>
  );
}

function ReportDetailScreen({ report, onHistory }: { report: Report; onHistory: () => void }) {
  const category = categoryFor(report.category.toLowerCase());
  const Icon = category.icon;
  return (
    <div className="space-y-3 py-4">
      <StatusPill>{report.status}</StatusPill>
      <div><h2 className="text-base font-semibold text-[#203127]">{report.id}</h2><p className="mt-1 text-[11px] text-[#758178]">{report.dateTime}</p></div>
      <Panel className="space-y-4">
        <DetailRow icon={<Icon />} label="Category" value={report.category} />
        <DetailRow icon={<FileText />} label="Summary" value={report.summary} />
        <DetailRow icon={<Info />} label="Description" value={report.description} />
        <DetailRow icon={<MapPin />} label="Location" value={report.location} />
        <DetailRow icon={<CalendarDays />} label="Date and time" value={report.dateTime} />
        {report.evidence.length > 0 && <DetailRow icon={<Images />} label="Evidence" value={report.evidence.join(", ")} />}
      </Panel>
      <Button variant="secondary" onClick={onHistory} className="w-full"><History className="h-4 w-4" />View status history</Button>
      <p className="text-center text-[10px] text-[#829087]">This report is illustrative local demo data.</p>
    </div>
  );
}

function HistoryScreen({ report }: { report: Report }) {
  return (
    <div className="space-y-4 py-4">
      <p className="text-xs text-[#66736b]">Status updates for <span className="font-semibold text-[#35463c]">{report.id}</span></p>
      <div className="space-y-0">
        {report.history.map((event, index) => <div key={`${event}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
          {index !== report.history.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px bg-[#dfe7e0]" />}
          <span className="relative z-10 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#e1f2e5] text-[#087443]"><Check className="h-3 w-3" /></span>
          <p className="text-xs text-[#33443a]">{event}</p>
        </div>)}
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex gap-3"><span className="mt-0.5 text-[#087443] [&>svg]:h-4 [&>svg]:w-4">{icon}</span><span className="min-w-0"><span className="block text-[10px] text-[#758178]">{label}</span><span className="mt-0.5 block break-words text-xs text-[#26372c]">{value}</span></span></div>;
}

function AlertsScreen({ alerts, onSelect, onPreviewEmpty, onPreviewUnavailable }: { alerts: Alert[]; onSelect: (alert: Alert) => void; onPreviewEmpty: () => void; onPreviewUnavailable: () => void }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Critical", "Advisory", "Informational"];
  const visible = filter === "All" ? alerts : alerts.filter((alert) => alert.priority === filter);
  return (
    <div className="space-y-4 py-4">
      <div className="flex gap-1 overflow-x-auto pb-1">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium ${filter === item ? "bg-[#087443] text-white" : "bg-[#eef2ef] text-[#526158]"}`}>{item}</button>)}</div>
      {visible.map((alert) => {
        const tone = alert.priority === "Critical" ? "red" : alert.priority === "Advisory" ? "amber" : "blue";
        const Icon = alert.priority === "Critical" ? AlertTriangle : alert.priority === "Advisory" ? BellRing : ShieldCheck;
        return <button key={alert.id} onClick={() => onSelect(alert)} className="flex w-full items-start gap-3 rounded-2xl border border-[#e1e8e2] bg-white p-3 text-left">
          <span className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${tone === "red" ? "bg-[#fff0ed] text-[#c53124]" : tone === "amber" ? "bg-[#fff5df] text-[#ad720d]" : "bg-[#edf5ff] text-[#3470a8]"}`}><Icon className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><StatusPill tone={tone}>{alert.priority}</StatusPill>{alert.acknowledged && <StatusPill>Acknowledged</StatusPill>}{alert.requiresAcknowledgement && !alert.acknowledged && <span className="text-[9px] font-medium text-[#a75e00]">Acknowledgement required</span>}</span><span className="mt-2 block text-xs font-semibold text-[#24352b]">{alert.title}</span><span className="mt-1 block text-[10px] text-[#718078]">{alert.time}</span></span><ChevronRight className="mt-2 h-4 w-4 shrink-0 text-[#718078]" />
        </button>;
      })}
      {visible.length === 0 && <p className="py-12 text-center text-xs text-[#748077]">No alerts in this category.</p>}
      <p className="text-center text-[10px] text-[#829087]">Illustrative alerts for this local prototype.</p>
      <div className="flex justify-center gap-4"><button onClick={onPreviewEmpty} className="text-[10px] text-[#748077] underline decoration-dotted underline-offset-2">Preview no active alerts</button><button onClick={onPreviewUnavailable} className="text-[10px] text-[#748077] underline decoration-dotted underline-offset-2">Preview unavailable</button></div>
    </div>
  );
}

function AlertDetailScreen({ alert, onAcknowledge }: { alert: Alert; onAcknowledge: () => void }) {
  const tone = alert.priority === "Critical" ? "red" : alert.priority === "Advisory" ? "amber" : "blue";
  return (
    <div className="space-y-4 py-4">
      <StatusPill tone={tone}>{alert.priority}</StatusPill>
      <div><h2 className="text-lg font-semibold leading-snug text-[#1d2d24]">{alert.title}</h2><p className="mt-1 text-[11px] text-[#758178]">{alert.time}</p></div>
      <Panel><p className="text-sm leading-6 text-[#394a40]">{alert.description}</p></Panel>
      {alert.requiresAcknowledgement ? alert.acknowledged
        ? <p className="rounded-xl bg-[#edf7ef] p-3 text-xs text-[#087443]">You acknowledged this alert in the local demo.</p>
        : <Panel className="bg-[#fff8e9]"><p className="text-xs font-semibold text-[#795413]">This alert requires acknowledgement.</p><p className="mt-1 text-[11px] text-[#856b3d]">Acknowledging is recorded locally for demonstration only.</p></Panel>
        : <p className="rounded-xl bg-[#f3f6f4] p-3 text-xs text-[#647269]">No acknowledgement is required for this alert.</p>}
      {alert.requiresAcknowledgement && !alert.acknowledged && <Button onClick={onAcknowledge} className="w-full">Acknowledge</Button>}
      <p className="text-center text-[10px] text-[#829087]">Mock alert. Follow verified NSIA channels for live information.</p>
    </div>
  );
}

function NotificationsScreen({
  read,
  reports,
  onSelect,
  onPreviewEmpty,
  onPreviewUnavailable,
}: {
  read: string[];
  reports: Report[];
  onSelect: (id: string, kind: "alert" | "report", targetId: string) => void;
  onPreviewEmpty: () => void;
  onPreviewUnavailable: () => void;
}) {
  const items = [
    { id: "note-alert-flood", targetId: "alert-flood", kind: "alert" as const, title: "Heavy flooding reported nearby", meta: "New alert · Today, 09:31", icon: AlertTriangle },
    { id: "note-report", targetId: reports[0]?.id, kind: "report" as const, title: "Incident update", meta: `Your report ${reports[0]?.id ?? ""} · Yesterday`, icon: FileText },
  ];
  return (
    <div className="space-y-2.5 py-4">
      {items.map(({ id, targetId, kind, title, meta, icon: Icon }) => <button key={id} onClick={() => targetId && onSelect(id, kind, targetId)} className="flex w-full items-center gap-3 rounded-2xl border border-[#e1e8e2] bg-white p-3 text-left">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eff6f0] text-[#087443]"><Icon className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-[#24352b]">{title}</span><span className="mt-1 block text-[10px] text-[#758178]">{meta}</span></span>{read.includes(id) ? <Check className="h-4 w-4 text-[#829087]" /> : <span className="h-2 w-2 rounded-full bg-[#087443]" />}
      </button>)}
      <p className="pt-2 text-center text-[10px] text-[#829087]">Notification history is local illustrative data.</p>
      <div className="flex justify-center gap-4"><button onClick={onPreviewEmpty} className="text-[10px] text-[#748077] underline decoration-dotted underline-offset-2">Preview empty state</button><button onClick={onPreviewUnavailable} className="text-[10px] text-[#748077] underline decoration-dotted underline-offset-2">Preview unavailable</button></div>
    </div>
  );
}

function FeedScreen({ items, onSelect, onPreviewEmpty, onPreviewUnavailable }: { items: FeedItem[]; onSelect: (item: FeedItem) => void; onPreviewEmpty: () => void; onPreviewUnavailable: () => void }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Security", "Safety", "Health"];
  const visible = filter === "All" ? items : items.filter((item) => {
    const content = `${item.title} ${item.source} ${item.description}`.toLowerCase();
    return filter === "Security" ? content.includes("security") || item.classification !== "Shareable"
      : filter === "Health" ? content.includes("health") || content.includes("weather")
      : content.includes("safety") || content.includes("weather") || content.includes("traffic");
  });
  return (
    <div className="space-y-3 py-4">
      <div className="flex gap-2 overflow-x-auto pb-1">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium ${filter === item ? "bg-[#087443] text-white" : "bg-[#eef2ef] text-[#526158]"}`}>{item}</button>)}</div>
      {visible.map((item) => <button key={item.id} onClick={() => onSelect(item)} className="w-full rounded-2xl border border-[#e1e8e2] bg-white p-3 text-left">
        <div className="flex items-start gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf5ef] text-[#087443]"><Newspaper className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-[#24352b]">{item.title}</span><span className="mt-1 block text-[10px] text-[#748077]">{item.source} · {item.time}</span></span><ChevronRight className="h-4 w-4 text-[#718078]" /></div>
        <span className="mt-3 block pl-12 text-[11px] leading-4 text-[#5e6c63]">{item.description}</span>
        <span className="mt-2 block pl-12 text-[9px] font-medium text-[#087443]">{item.classification}</span>
      </button>)}
      {visible.length === 0 && <p className="py-12 text-center text-xs text-[#748077]">No feed items in this category.</p>}
      <p className="text-center text-[10px] text-[#829087]">Illustrative content. This feed is not live.</p>
      <div className="flex justify-center gap-4"><button onClick={onPreviewEmpty} className="text-[10px] text-[#748077] underline decoration-dotted underline-offset-2">Preview empty state</button><button onClick={onPreviewUnavailable} className="text-[10px] text-[#748077] underline decoration-dotted underline-offset-2">Preview unavailable</button></div>
    </div>
  );
}

function FeedDetailScreen({ item }: { item: FeedItem }) {
  const [shareFeedback, setShareFeedback] = useState("");

  async function shareItem() {
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text: item.description });
        setShareFeedback("Share sheet opened.");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${item.title}\n${item.description}`);
        setShareFeedback("Feed item copied to clipboard.");
      } else {
        setShareFeedback("Sharing is unavailable in this browser.");
      }
    } catch {
      setShareFeedback("Sharing was cancelled or unavailable. The item has not been shared.");
    }
  }

  return (
    <div className="space-y-4 py-4">
      <StatusPill tone={item.classification === "Shareable" ? "green" : "gray"}>{item.classification}</StatusPill>
      <h2 className="text-lg font-semibold leading-snug text-[#203127]">{item.title}</h2>
      <p className="text-[11px] text-[#748077]">{item.source} · {item.time}</p>
      <div className="flex h-40 items-center justify-center rounded-2xl bg-[#e9f1eb] text-[#6d8074]"><Radio className="h-8 w-8" /></div>
      <Panel><p className="text-sm leading-6 text-[#3e5045]">{item.description}</p></Panel>
      {item.classification === "Shareable" && <><Button variant="secondary" onClick={shareItem} className="w-full"><ExternalLink className="h-4 w-4" />Share externally</Button>{shareFeedback && <p role="status" className="text-center text-[11px] text-[#66736b]">{shareFeedback}</p>}</>}
      <p className="text-center text-[10px] text-[#829087]">Source information is illustrative; no live publisher connection is configured.</p>
    </div>
  );
}

function SosActivationScreen({
  contacts,
  hasLocation,
  onLocationChange,
  onSend,
  onCancel,
}: {
  contacts: EmergencyContact[];
  hasLocation: boolean;
  onLocationChange: (value: boolean) => void;
  onSend: () => void;
  onCancel: () => void;
}) {
  const primary = contacts.find((contact) => contact.priority === "Primary");
  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-col items-center rounded-2xl bg-[#fff4f2] px-4 py-6 text-center">
        <div className="sos-halo !w-[132px]">
          <div className="sos-action relative z-10 flex flex-col items-center justify-center gap-0.5 rounded-full bg-[#df2929] text-white shadow-sm">
            <Siren className="h-7 w-7" /><span className="text-[15px] font-semibold">SOS</span>
          </div>
        </div>
        <h2 className="mt-5 text-lg font-semibold text-[#b3261e]">Personal emergency alert</h2>
        <p className="mt-1 max-w-[260px] text-xs leading-5 text-[#68756c]">This prototype will demonstrate a contact-notification request. No emergency services are contacted.</p>
      </div>
      <Panel className="space-y-3">
        <p className="text-xs font-semibold text-[#26372c]">Before you continue</p>
        <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f5eb] text-[#087443]"><UserRound className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-[10px] text-[#758178]">Primary emergency contact</span><span className="text-xs font-medium text-[#26372c]">{primary?.name ?? "No primary contact configured"}</span></span></div>
        <div className="flex items-center gap-3"><span className={`flex h-8 w-8 items-center justify-center rounded-full ${hasLocation ? "bg-[#e8f5eb] text-[#087443]" : "bg-[#fff5df] text-[#a96800]"}`}><MapPin className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-[10px] text-[#758178]">Location</span><span className="text-xs font-medium text-[#26372c]">{hasLocation ? "Demo location available" : "Unavailable"}</span></span></div>
        <button onClick={() => onLocationChange(!hasLocation)} className="text-left text-[11px] font-semibold text-[#087443]">{hasLocation ? "Simulate unavailable location" : "Use demo location"}</button>
      </Panel>
      <Button variant="danger" onClick={onSend} className="w-full"><Siren className="h-4 w-4" />Send demo request</Button>
      <Button variant="secondary" onClick={onCancel} className="w-full">Cancel</Button>
      <p className="text-center text-[10px] text-[#829087]">No hold duration or escalation timer is assumed. This is a manual demo interaction.</p>
    </div>
  );
}

function SosSentScreen({
  contacts,
  acknowledged,
  status,
  onAcknowledge,
  onSimulateNoAck,
  onSecondary,
  onFailure,
  onStatusUnavailable,
  onHome,
}: {
  contacts: EmergencyContact[];
  acknowledged: boolean;
  status: string;
  onAcknowledge: () => void;
  onSimulateNoAck: () => void;
  onSecondary: () => void;
  onFailure: () => void;
  onStatusUnavailable: () => void;
  onHome: () => void;
}) {
  const primary = contacts.find((contact) => contact.priority === "Primary");
  const secondary = contacts.find((contact) => contact.priority === "Secondary");
  return (
    <div className="space-y-4 py-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#dff4e4] text-[#087443]"><CheckCircle2 className="h-10 w-10" /></span>
        <h2 className="mt-4 text-lg font-semibold text-[#1d2d24]">Demo request recorded</h2>
        <p className="mt-1 text-xs text-[#66736b]">This local preview does not notify a real emergency contact.</p>
      </div>
      <Panel className="space-y-3">
        <p className="text-xs font-semibold text-[#26372c]">Demo request status</p>
        <p className="rounded-lg bg-[#eff8f0] p-2.5 text-[11px] text-[#315540]">{status}</p>
        <ContactStatus name={primary?.name ?? "Primary contact not set"} status={primary ? acknowledged ? "Acknowledgement simulated" : "Notification step simulated only" : "No primary contact configured"} done={acknowledged} />
        {secondary && <ContactStatus name={secondary.name} status={status.includes("No acknowledgement") ? "Secondary step available" : "Not contacted"} done={false} />}
        <p className="border-t border-[#e5ebe6] pt-3 text-[10px] leading-4 text-[#6a786f]">No emergency services have been contacted. No assistance dispatch is claimed.</p>
      </Panel>
      {!acknowledged && <div className="space-y-2"><Button onClick={onAcknowledge} className="w-full">Simulate primary acknowledgement</Button><Button onClick={onSimulateNoAck} variant="secondary" className="w-full">Preview no-acknowledgement status</Button>{status.includes("No acknowledgement") && secondary && <Button onClick={onSecondary} variant="quiet" className="w-full">Preview secondary contact step</Button>}</div>}
      <div className="grid grid-cols-2 gap-2"><button onClick={onFailure} className="rounded-lg border border-[#e1e8e2] p-2 text-[10px] text-[#58665d]">Preview not delivered</button><button onClick={onStatusUnavailable} className="rounded-lg border border-[#e1e8e2] p-2 text-[10px] text-[#58665d]">Preview status unavailable</button></div>
      <Button onClick={onHome} variant="secondary" className="w-full">Back to Home</Button>
    </div>
  );
}

function ContactStatus({ name, status, done }: { name: string; status: string; done: boolean }) {
  return <div className="flex items-center gap-2.5"><span className={`flex h-7 w-7 items-center justify-center rounded-full ${done ? "bg-[#def2e3] text-[#087443]" : "bg-[#f0f3f1] text-[#76837a]"}`}>{done ? <Check className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}</span><span className="min-w-0 flex-1"><span className="block text-[11px] font-medium text-[#26372c]">{name}</span><span className="block text-[10px] text-[#718078]">{status}</span></span></div>;
}

function OutcomeScreen({
  icon,
  tone,
  title,
  description,
  button,
  onClick,
  secondaryAction,
  secondaryLabel,
}: {
  icon: ReactNode;
  tone: "green" | "amber" | "gray";
  title: string;
  description: string;
  button: string;
  onClick: () => void;
  secondaryAction?: () => void;
  secondaryLabel?: string;
}) {
  const toneStyles = { green: "bg-[#dff4e4] text-[#087443]", amber: "bg-[#fff3d9] text-[#a96800]", gray: "bg-[#eef1ef] text-[#67746c]" };
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center px-4 text-center">
      <span className={`flex h-16 w-16 items-center justify-center rounded-full ${toneStyles[tone]}`}>{icon}</span>
      <h2 className="mt-4 text-lg font-semibold text-[#1d2d24]">{title}</h2>
      <p className="mt-2 text-xs leading-5 text-[#66736b]">{description}</p>
      <Button onClick={onClick} className="mt-6 w-full">{button}</Button>
      {secondaryAction && <Button onClick={secondaryAction} variant="secondary" className="mt-2 w-full">{secondaryLabel}</Button>}
    </div>
  );
}

function ProfileScreen({ onContacts, onNotifications }: { onContacts: () => void; onNotifications: () => void }) {
  return (
    <div className="space-y-4 py-4">
      <Panel className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b9e8c6] text-lg font-semibold text-[#0c5934]">M</span>
        <span><span className="block text-sm font-semibold text-[#1e3025]">Mike Kanu</span><span className="text-[11px] text-[#6d7b72]">mike.kanu@nsia.example</span></span>
      </Panel>
      <div className="overflow-hidden rounded-2xl border border-[#e1e8e2] bg-white">
        <div className="flex items-center gap-3 border-b border-[#edf1ed] p-3"><UserRound className="h-[18px] w-[18px] text-[#3d5a49]" /><span><span className="block text-xs font-medium text-[#26372c]">Personal information</span><span className="mt-0.5 block text-[10px] text-[#758178]">NSIA staff member</span></span></div>
        <button onClick={onContacts} className="flex w-full items-center gap-3 border-b border-[#edf1ed] p-3 text-left">
          <Phone className="h-[18px] w-[18px] text-[#3d5a49]" /><span className="min-w-0 flex-1"><span className="block text-xs font-medium text-[#26372c]">Emergency contacts</span><span className="mt-0.5 block text-[10px] text-[#758178]">Manage your contacts</span></span><ChevronRight className="h-4 w-4 text-[#819087]" />
        </button>
        <button onClick={onNotifications} className="flex w-full items-center gap-3 border-b border-[#edf1ed] p-3 text-left">
          <Bell className="h-[18px] w-[18px] text-[#3d5a49]" /><span className="min-w-0 flex-1"><span className="block text-xs font-medium text-[#26372c]">Notifications</span><span className="mt-0.5 block text-[10px] text-[#758178]">View notification history</span></span><ChevronRight className="h-4 w-4 text-[#819087]" />
        </button>
        <div className="flex items-center gap-3 p-3"><Info className="h-[18px] w-[18px] text-[#3d5a49]" /><span><span className="block text-xs font-medium text-[#26372c]">App settings</span><span className="mt-0.5 block text-[10px] text-[#758178]">ICE 2.0 · Prototype</span></span></div>
      </div>
      <p className="text-center text-[10px] text-[#829087]">Prototype profile. No production identity session is active.</p>
    </div>
  );
}

function ContactsScreen({
  contacts,
  onAdd,
  onEdit,
  onDelete,
}: {
  contacts: EmergencyContact[];
  onAdd: () => void;
  onEdit: (contact: EmergencyContact) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-3 py-4">
      <Panel className="flex items-start gap-2.5 bg-[#eff8f0] p-3 text-[11px] leading-4 text-[#52645a]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#087443]" /><p>Emergency contacts are stored in this prototype session. Contacts do not need an ICE account.</p></Panel>
      {contacts.map((contact) => <Panel key={contact.id} className="flex items-center gap-3 p-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f5eb] text-[#087443]"><UserRound className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-[#26372c]">{contact.name}</span><StatusPill>{contact.priority}</StatusPill></span><span className="mt-1 block text-[10px] text-[#758178]">{contact.relationship}</span><span className="mt-1 block text-[10px] text-[#526158]">{contact.phone}</span></span>
        <span className="flex flex-col gap-1"><button onClick={() => onEdit(contact)} aria-label={`Edit ${contact.name}`} className="p-2 text-[#54705e]"><FileText className="h-4 w-4" /></button><button onClick={() => onDelete(contact.id)} aria-label={`Remove ${contact.name}`} className="p-2 text-[#8a5d56]"><Trash2 className="h-4 w-4" /></button></span>
      </Panel>)}
      {contacts.length === 0 && <p className="py-8 text-center text-xs text-[#718078]">No emergency contacts added.</p>}
      {contacts.length < 3 ? <Button onClick={onAdd} className="w-full"><Plus className="h-4 w-4" />Add emergency contact</Button> : <p className="text-center text-[10px] text-[#758178]">The optional tertiary contact is configured.</p>}
    </div>
  );
}

function ContactForm({
  draft,
  error,
  editing,
  onChange,
  onSave,
  onCancel,
}: {
  draft: { name: string; relationship: string; phone: string; priority: EmergencyContact["priority"] };
  error: string;
  editing: boolean;
  onChange: (draft: { name: string; relationship: string; phone: string; priority: EmergencyContact["priority"] }) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSave} className="space-y-4 py-4">
      <Field label="Name" required><input value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} className={inputClass()} placeholder="Full name" /></Field>
      <Field label="Relationship" required><input value={draft.relationship} onChange={(event) => onChange({ ...draft, relationship: event.target.value })} className={inputClass()} placeholder="e.g. Family member" /></Field>
      <Field label="Phone number" required hint="Include country code when available."><input type="tel" value={draft.phone} onChange={(event) => onChange({ ...draft, phone: event.target.value })} className={inputClass()} placeholder="+234 801 234 5678" /></Field>
      <Field label="Contact priority" required>
        <select value={draft.priority} onChange={(event) => onChange({ ...draft, priority: event.target.value as EmergencyContact["priority"] })} className={inputClass()}>
          <option>Primary</option><option>Secondary</option><option>Tertiary</option>
        </select>
      </Field>
      {error && <p role="alert" className="text-xs text-[#b42318]">{error}</p>}
      <Button type="submit" className="w-full">{editing ? "Save changes" : "Add contact"}</Button>
      <Button variant="secondary" onClick={onCancel} className="w-full">Cancel</Button>
    </form>
  );
}

function LoginWelcomeScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <section
      className="relative flex min-h-full flex-col justify-between overflow-hidden bg-cover bg-center px-6 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(28px+env(safe-area-inset-top))] text-white"
      style={{ backgroundImage: "url('/images/bg%20image%20nsia.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/5 to-black/70" aria-hidden="true" />
      <div className="relative z-10 flex justify-center">
        <Image
          src="/images/ice-logo-removed-bg.png"
          alt="ICE"
          width={144}
          height={144}
          priority
          className="h-auto w-[min(144px,40vw)] object-contain"
        />
      </div>
      <div className="relative z-10 pb-3">
        <h1 className="max-w-[320px] text-[32px] font-bold leading-[1.12] tracking-[-0.04em]">In Case of Emergency</h1>
        <p className="mt-3 max-w-[330px] text-[15px] leading-6 text-white/95">ICE helps you report incidents, receive important alerts, and access security information.</p>
        <button
          onClick={onLogin}
          className="mt-7 flex h-14 w-full items-center justify-center rounded-2xl bg-[#08743d] px-5 text-[16px] font-semibold text-white shadow-lg shadow-black/15 transition-colors hover:bg-[#006838] focus-visible:outline-white"
        >
          Login to ICE
        </button>
        <p className="mt-3 text-center text-xs text-white/85">Access using your NSIA organizational account</p>
      </div>
    </section>
  );
}

function MicrosoftSignInScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <section className="flex min-h-full flex-col bg-[#f8faf8] px-6 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(20px+env(safe-area-inset-top))]">
      <button onClick={onBack} aria-label="Back to welcome" className="flex h-11 w-11 items-center justify-center rounded-full text-[#294435] hover:bg-[#edf2ee]">
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
        <Image
          src="/images/ice-logo-removed-bg.png"
          alt="ICE"
          width={88}
          height={88}
          className="h-auto w-[88px] object-contain"
        />
        <h1 className="mt-10 text-[26px] font-semibold tracking-[-0.03em] text-[#18231d]">Sign in with Microsoft</h1>
        <p className="mt-3 max-w-[300px] text-[15px] leading-6 text-[#66736b]">Use your NSIA organizational account to continue to ICE.</p>
        <button
          onClick={onContinue}
          className="mt-8 flex min-h-[56px] w-full items-center gap-3 rounded-2xl border border-[#dce5de] bg-white px-4 text-left text-[15px] font-semibold text-[#26372c] shadow-sm transition-colors hover:bg-[#f7faf7]"
        >
          <MicrosoftMark />
          <span className="flex-1 text-center">Sign in with Microsoft</span>
          <ChevronRight className="h-4 w-4 text-[#718078]" />
        </button>
        <p className="mt-5 max-w-[300px] text-[12px] leading-5 text-[#718078]">Prototype sign-in only. No organizational account is being authenticated.</p>
      </div>
      <p className="px-2 text-center text-[13px] leading-5 text-[#66736b]">Only authorized NSIA staff can access ICE.</p>
    </section>
  );
}

function MicrosoftMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0">
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M13 1h10v10H13z" />
      <path fill="#00a4ef" d="M1 13h10v10H1z" />
      <path fill="#ffb900" d="M13 13h10v10H13z" />
    </svg>
  );
}

function FirstLoginWelcomeModal({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#14231a]/60 px-5 py-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-login-title"
        aria-describedby="first-login-description"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onDismiss();
          } else if (event.key === "Tab") {
            event.preventDefault();
            event.currentTarget.querySelector("button")?.focus();
          }
        }}
        className="w-full max-w-[340px] rounded-[26px] bg-white p-6 text-center shadow-[0_18px_60px_rgba(0,0,0,0.2)]"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f5eb] text-[#08743d]">
          <ShieldCheck className="h-7 w-7" />
        </span>
        <h2 id="first-login-title" className="mt-5 text-xl font-semibold text-[#18231d]">Welcome to ICE</h2>
        <p id="first-login-description" className="mt-3 text-sm leading-6 text-[#66736b]">Your safety matters. Report incidents, stay informed with important alerts, and access trusted security information—all in one place.</p>
        <Button autoFocus onClick={onDismiss} className="mt-6 w-full">Get started</Button>
      </section>
    </div>
  );
}

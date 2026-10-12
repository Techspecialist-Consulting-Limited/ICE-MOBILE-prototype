"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  BellRing,
  Building2,
  CalendarDays,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  ContactRound,
  Dna,
  Droplet,
  ExternalLink,
  FileText,
  Flame,
  HardHat,
  History,
  Home,
  Images,
  Info,
  LockKeyhole,
  LocateFixed,
  LoaderCircle,
  MapPin,
  Mail,
  Newspaper,
  Pencil,
  Phone,
  Plus,
  Radio,
  RotateCcw,
  Search,
  Settings,
  Send,
  Smartphone,
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

type Tab = "home" | "alerts" | "notifications" | "report" | "profile";
type Screen =
  | "home"
  | "categories"
  | "quickCategories"
  | "quickReportDetails"
  | "quickReportDetail"
  | "quickReportHistory"
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
  | "supplementaryInformation"
  | "supplementSubmitting"
  | "supplementSuccess"
  | "supplementFailure"
  | "sosSending"
  | "sosOutcome"
  | "sosSent"
  | "sosHistory"
  | "sosHistoryDetail"
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
  | "editProfile"
  | "settings"
  | "notificationSettings"
  | "permissions"
  | "settingsInfo"
  | "contacts"
  | "contactEdit"
  | "signIn"
  | "signInLoading"
  | "firstLoginWelcome";

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
  createdAt: string;
  category: string;
  summary: string;
  description: string;
  location: string;
  dateTime: string;
  status: "Submitted" | "In progress" | "Resolved";
  history: string[];
  evidence: string[];
  supplementaryInformation: { id: string; text: string; createdAt: string; attachments?: string[] }[];
};

type ReportListEntry = Pick<Report, "id" | "createdAt" | "category" | "summary" | "location" | "dateTime" | "status"> & {
  quickReportKey?: string;
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
  timeline: QuickReportTimelineEvent[];
};

type QuickReportTimelineEvent = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: "complete" | "in_progress" | "failed";
};

type Alert = {
  id: string;
  reference: string;
  title: string;
  description: string;
  category: "Safety" | "Access" | "Security";
  priority: "Critical" | "Advisory" | "Informational";
  time: string;
  source: string;
  affectedArea: string;
  classification: "Internal Only" | "Restricted" | "Shareable";
  requiresAcknowledgement: boolean;
  acknowledged: boolean;
  acknowledgedAt?: string;
};

type NotificationItem = {
  id: string;
  category: "System" | "Account" | "Reports";
  title: string;
  summary: string;
  createdAt: string;
  relatedReportId?: string;
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

type SosEvent = {
  reference: string;
  createdAt: string;
  location: string;
  acknowledged: boolean;
};

type StaffProfile = {
  fullName: string;
  employeeId: string;
  department: string;
  role: string;
  organizationEmail: string;
  phone: string;
  personalEmail: string;
  bloodGroup: string;
  genotype: string;
  gender: string;
  dateOfBirth: string;
  emergencyMedicalNotes: string;
  profilePhoto?: string;
};

type NotificationPreferences = {
  incidentUpdates: boolean;
  safetyInformation: boolean;
};

type PushPermission = "checking" | "granted" | "denied" | "default" | "unavailable";

const initialStaffProfile: StaffProfile = {
  fullName: "Mike Kanu",
  employeeId: "NSIA-OP-0145",
  department: "Operations",
  role: "Operations Officer",
  organizationEmail: "mike.kanu@nsia.example",
  phone: "+234 805 550 0145",
  personalEmail: "mike.kanu@gmail.com",
  bloodGroup: "",
  genotype: "",
  gender: "",
  dateOfBirth: "",
  emergencyMedicalNotes: "",
};

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "report", label: "Reports", icon: ClipboardList },
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
    reference: "ALT-2026-0001",
    title: "Heavy flooding reported nearby",
    description: "Riverside access road affected. Use the west entrance and follow Security guidance.",
    category: "Safety",
    priority: "Critical",
    time: "Today, 09:31",
    source: "NSIA Security",
    affectedArea: "Riverside access road",
    classification: "Internal Only",
    requiresAcknowledgement: true,
    acknowledged: false,
  },
  {
    id: "alert-road",
    reference: "ALT-2026-0002",
    title: "Restricted access to east lobby",
    description: "Maintenance activity is affecting access to the east lobby. Please use the main entrance.",
    category: "Access",
    priority: "Advisory",
    time: "Today, 08:15",
    source: "NSIA Facilities",
    affectedArea: "East lobby",
    classification: "Internal Only",
    requiresAcknowledgement: false,
    acknowledged: false,
  },
  {
    id: "alert-update",
    reference: "ALT-2026-0003",
    title: "Routine security update",
    description: "A routine security update for staff. No action is required.",
    category: "Security",
    priority: "Informational",
    time: "Yesterday, 16:20",
    source: "NSIA Security",
    affectedArea: "All locations",
    classification: "Restricted",
    requiresAcknowledgement: false,
    acknowledged: false,
  },
];

const initialSystemNotifications: NotificationItem[] = [
  {
    id: "note-system-maintenance",
    category: "System",
    title: "Scheduled system maintenance",
    summary: "Some app services may be temporarily unavailable during scheduled maintenance.",
    createdAt: "2026-10-12T06:45:00.000Z",
  },
  {
    id: "note-account-security",
    category: "Account",
    title: "Account security reminder",
    summary: "Keep your organization sign-in details private and report unexpected access prompts.",
    createdAt: "2026-10-11T11:10:00.000Z",
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
  quickReportHistory: "Quick Report Timeline",
  reportDetails: "Report an incident",
  reportLocation: "Report an incident",
  reportEvidence: "Report an incident",
  reportReview: "Review your report",
  reportSubmitting: "Submitting report",
  reportSuccess: "Report submitted",
  reportFailure: "Submission unavailable",
  reports: "My Reports",
  reportsUnavailable: "My Reports",
  reportDetail: "Report Details",
  reportHistory: "Report Timeline",
  supplementaryInformation: "Supplementary Information",
  supplementSubmitting: "Sending information",
  supplementSuccess: "Information added",
  supplementFailure: "Submission unavailable",
  sosSending: "Processing alert",
  sosOutcome: "SOS request activated",
  sosSent: "SOS contact status",
  sosHistory: "SOS History",
  sosHistoryDetail: "SOS Request Status",
  alerts: "Alerts",
  alertsEmpty: "Alerts",
  alertsUnavailable: "Alerts",
  alertDetail: "Alert details",
  alertAcknowledged: "Alert acknowledged",
  notifications: "Notifications",
  notificationsEmpty: "Notifications",
  notificationsUnavailable: "Notifications",
  notificationDetail: "Notification",
  feed: "Security feed",
  feedEmpty: "Security feed",
  feedUnavailable: "Security feed",
  feedDetail: "Feed details",
  profile: "Profile",
  editProfile: "Edit profile",
  settings: "Settings",
  notificationSettings: "Notification settings",
  permissions: "Permissions",
  settingsInfo: "Settings",
  contacts: "Emergency contacts",
  contactEdit: "Emergency contact",
};

function categoryFor(id: string) {
  const normalized = id.trim().toLowerCase();
  return categories.find((category) => category.id === normalized || category.label.toLowerCase() === normalized) ?? categories[categories.length - 1];
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
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

function ScreenHeader({ title, onBack, showBack = true }: { title: string; onBack: () => void; showBack?: boolean }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#edf1ed] px-4">
      {showBack
        ? <button onClick={onBack} aria-label="Go back" className="flex h-10 w-10 items-center justify-start text-[#35463c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087443]"><ArrowLeft className="h-5 w-5" /></button>
        : <span className="h-10 w-10" aria-hidden="true" />}
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
  const [screen, setScreen] = useState<Screen>("signIn");
  const [screenStack, setScreenStack] = useState<Screen[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [draft, setDraft] = useState<IncidentDraft>(emptyDraft);
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});
  const [reports, setReports] = useState<Report[]>([]);
  const [quickReports, setQuickReports] = useState<QuickReport[]>([]);
  const [selectedQuickReportKey, setSelectedQuickReportKey] = useState<string | null>(null);
  const [quickDetailsErrors, setQuickDetailsErrors] = useState<Record<string, string>>({});
  const [quickDetailsSaving, setQuickDetailsSaving] = useState(false);
  const [quickCategoryChoiceId, setQuickCategoryChoiceId] = useState<string | null>(null);
  const quickSendLock = useRef(false);
  const quickSaveLock = useRef(false);
  const [quickEvidenceObjectUrls] = useState(() => new Set<string>());
  const quickEventSequence = useRef(0);
  const quickReferenceSequence = useRef(0);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [reportFilter, setReportFilter] = useState("All");
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedAlertId, setSelectedAlertId] = useState(initialAlerts[0].id);
  const [notificationsRead, setNotificationsRead] = useState<string[]>([]);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [feed] = useState(initialFeed);
  const [selectedFeedId, setSelectedFeedId] = useState(initialFeed[0].id);
  const [contacts, setContacts] = useState(initialContacts);
  const [staffProfile, setStaffProfile] = useState(initialStaffProfile);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    incidentUpdates: true,
    safetyInformation: true,
  });
  const [settingsInfo, setSettingsInfo] = useState({ title: "", description: "" });
  const [profileSaved, setProfileSaved] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactDraft, setContactDraft] = useState({ name: "", relationship: "", phone: "", priority: "Tertiary" as EmergencyContact["priority"] });
  const [contactError, setContactError] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [supplementText, setSupplementText] = useState("");
  const [supplementFiles, setSupplementFiles] = useState<File[]>([]);
  const [supplementError, setSupplementError] = useState("");
  const [supplementFailurePreview, setSupplementFailurePreview] = useState(false);
  const [supplementSaving, setSupplementSaving] = useState(false);
  const supplementSendLock = useRef(false);
  const [sosHistory, setSosHistory] = useState<SosEvent[]>([]);
  const [selectedSosReference, setSelectedSosReference] = useState<string | null>(null);
  const sosActivationLock = useRef(false);
  const sosEventSequence = useRef(0);
  const [sosHoldProgress, setSosHoldProgress] = useState(0);
  const sosHoldTimeoutRef = useRef<number | null>(null);
  const sosHoldFrameRef = useRef<number | null>(null);

  useEffect(() => () => {
    quickEvidenceObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [quickEvidenceObjectUrls]);

  useEffect(() => () => {
    if (sosHoldTimeoutRef.current !== null) window.clearTimeout(sosHoldTimeoutRef.current);
    if (sosHoldFrameRef.current !== null) cancelAnimationFrame(sosHoldFrameRef.current);
  }, []);

  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0];
  const selectedQuickReport = quickReports.find((report) => report.key === selectedQuickReportKey);
  const currentQuickReport = quickReports[0];
  const latestSentQuickReport = quickReports.find((report) => report.sendStatus === "sent");
  const selectedAlert = alerts.find((alert) => alert.id === selectedAlertId) ?? alerts[0];
  const selectedFeed = feed.find((item) => item.id === selectedFeedId) ?? feed[0];
  const latestSosEvent = sosHistory[0];
  const selectedSosEvent = sosHistory.find((item) => item.reference === selectedSosReference) ?? latestSosEvent;
  const notificationItems = useMemo<NotificationItem[]>(() => [
    ...initialSystemNotifications,
    ...reports.map((report) => ({
      id: `note-report-${report.id}`,
      category: "Reports" as const,
      title: `Report ${report.status.toLowerCase()}`,
      summary: `${report.id} · ${report.category} · ${report.summary}`,
      createdAt: report.createdAt,
      relatedReportId: report.id,
    })),
  ], [reports]);
  const selectedNotification = notificationItems.find((item) => item.id === selectedNotificationId);
  const unreadCount = useMemo(
    () => notificationItems.filter((item) => !notificationsRead.includes(item.id)).length,
    [notificationItems, notificationsRead],
  );
  const alertsRequiringAcknowledgement = alerts.filter((alert) => alert.requiresAcknowledgement && !alert.acknowledged).length;

  function go(next: Screen, tab?: Tab) {
    setScreenStack((previous) => [...previous, screen]);
    setScreen(next);
    if (tab) setActiveTab(tab);
  }

  function back() {
    if (screenStack.length === 0) {
      setScreen("home");
      setActiveTab("home");
      return;
    }
    const previousScreen = screenStack[screenStack.length - 1];
    if (["alerts", "alertsEmpty", "alertsUnavailable", "alertDetail", "alertAcknowledged"].includes(previousScreen)) {
      setActiveTab("alerts");
    } else if (["notifications", "notificationsEmpty", "notificationsUnavailable", "notificationDetail"].includes(previousScreen)) {
      setActiveTab("notifications");
    }
    setScreen(previousScreen);
    setScreenStack(screenStack.slice(0, -1));
  }

  function openTab(tab: Tab) {
    setScreenStack([]);
    setActiveTab(tab);
    const target: Record<Tab, Screen> = {
      home: "home",
      alerts: "alerts",
      notifications: "notifications",
      report: "reports",
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
      ? {
          ...previousAttempt,
          sendStatus: "sending",
          timeline: [...(previousAttempt.timeline ?? []), {
            id: `quick-timeline-${Date.now()}-retry`,
            title: "Retry started",
            description: "Retrying the same quick-report event.",
            createdAt: new Date().toISOString(),
            status: "in_progress",
          }],
        }
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
          timeline: [],
        };
    quickSendLock.current = true;
    setQuickReports((previous) => previousAttempt
      ? previous.map((report) => report.key === quickReport.key ? quickReport : report)
      : [quickReport, ...previous]);
    window.setTimeout(() => {
      const failed = !navigator.onLine;
      const sequence = failed ? undefined : ++quickReferenceSequence.current;
      const now = new Date(quickReport.createdAt);
      const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      const completedAt = new Date().toISOString();
      setQuickReports((previous) => previous.map((report) => report.key === quickReport.key
        ? {
            ...report,
            sendStatus: failed ? "failed" : "sent",
            reference: failed ? report.reference : report.reference ?? `QR-${date}-${String(sequence).padStart(3, "0")}`,
            timeline: [...(report.timeline ?? []), {
              id: `quick-timeline-${Date.now()}-result`,
              title: failed ? "Submission failed" : "Quick report sent",
              description: failed
                ? "The local submission could not be completed. Retry to attempt this same event again."
                : "The quick report was recorded in this local demonstration.",
              createdAt: completedAt,
              status: failed ? "failed" : "complete",
            }],
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
      const completedAt = new Date().toISOString();
      setQuickReports((previous) => previous.map((item) => item.key === report.key
        ? {
            ...item,
            category: categoryFor(item.categoryId).label,
            detailStatus: "completed",
            timeline: [...(item.timeline ?? []), {
              id: `quick-timeline-${Date.now()}-details`,
              title: "Incident details added",
              description: "Additional incident information was added to this quick report.",
              createdAt: completedAt,
              status: "complete",
            }],
          }
        : item));
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
              timeline: [...(report.timeline ?? []), {
                id: `quick-timeline-${Date.now()}-details`,
                title: "Incident details added",
                description: "Additional incident information was added to this quick report.",
                createdAt: new Date().toISOString(),
                status: "complete",
              }],
            }
          : report));
        setScreenStack([]);
        setScreen("home");
        setActiveTab("home");
        return;
      }
      const latestSequence = reports.reduce((latest, report) => {
        const match = /^INC-2026-(\d{6})$/.exec(report.id);
        return match ? Math.max(latest, Number(match[1])) : latest;
      }, 0);
      const sequence = latestSequence + 1;
      const newReport: Report = {
        id: `INC-2026-${String(sequence).padStart(6, "0")}`,
        createdAt: new Date().toISOString(),
        category: categoryFor(draft.category).label,
        summary: draft.summary.trim(),
        description: draft.description.trim(),
        location: draft.location.trim(),
        dateTime: new Date(draft.dateTime).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        status: "Submitted",
        history: ["Submitted · just now"],
        evidence: draft.evidence.map(({ file }) => file.name),
        supplementaryInformation: [],
      };
      setReports((previous) => [newReport, ...previous]);
      setSelectedReportId(newReport.id);
      setScreen("reportSuccess");
    }, 850);
  }

  function activateSos() {
    if (sosActivationLock.current) return;
    if (latestSosEvent && !latestSosEvent.acknowledged) {
      setSelectedSosReference(latestSosEvent.reference);
      setScreenStack([]);
      setScreen("sosOutcome");
      return;
    }
    const createdAt = new Date().toISOString();
    const date = createdAt.slice(0, 10).replaceAll("-", "");
    const reference = `SOS-${date}-${String(++sosEventSequence.current).padStart(3, "0")}`;
    const event: SosEvent = {
      reference,
      createdAt,
      location: "Requesting device location…",
      acknowledged: false,
    };
    sosActivationLock.current = true;
    setSosHistory((previous) => [event, ...previous]);
    setSelectedSosReference(reference);
    setScreenStack([]);
    setScreen("sosSending");

    const resolveLocation = new Promise<string>((resolve) => {
      if (!("geolocation" in navigator)) {
        resolve("Location unavailable on this device");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          resolve(`Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)} (±${Math.round(accuracy)}m)`);
        },
        (error) => {
          resolve(error.code === error.PERMISSION_DENIED ? "Location permission denied" : "Location unavailable");
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
      );
    });
    const minimumDelay = new Promise<void>((resolve) => { window.setTimeout(resolve, 900); });

    Promise.all([resolveLocation, minimumDelay]).then(([location]) => {
      setSosHistory((previous) => previous.map((item) => item.reference === reference ? { ...item, location } : item));
      setScreen("sosOutcome");
      sosActivationLock.current = false;
    });
  }

  function acknowledgeSos(reference: string) {
    setSosHistory((previous) => previous.map((item) => item.reference === reference ? { ...item, acknowledged: true } : item));
  }

  function cancelSosHold() {
    if (sosHoldTimeoutRef.current !== null) {
      window.clearTimeout(sosHoldTimeoutRef.current);
      sosHoldTimeoutRef.current = null;
    }
    if (sosHoldFrameRef.current !== null) {
      cancelAnimationFrame(sosHoldFrameRef.current);
      sosHoldFrameRef.current = null;
    }
    setSosHoldProgress(0);
  }

  function startSosHold() {
    if (sosHoldTimeoutRef.current !== null) return;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startedAt;
      setSosHoldProgress(Math.min(1, elapsed / SOS_HOLD_DURATION));
      if (elapsed < SOS_HOLD_DURATION) sosHoldFrameRef.current = requestAnimationFrame(tick);
    };
    sosHoldFrameRef.current = requestAnimationFrame(tick);
    sosHoldTimeoutRef.current = window.setTimeout(() => {
      sosHoldTimeoutRef.current = null;
      if (sosHoldFrameRef.current !== null) {
        cancelAnimationFrame(sosHoldFrameRef.current);
        sosHoldFrameRef.current = null;
      }
      setSosHoldProgress(0);
      activateSos();
    }, SOS_HOLD_DURATION);
  }

  function acknowledgeAlert(alert: Alert) {
    if (alert.acknowledged) return;
    setAlerts((previous) => previous.map((item) => item.id === alert.id ? { ...item, acknowledged: true, acknowledgedAt: new Date().toISOString() } : item));
    go("alertAcknowledged", "alerts");
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

  function simulateSignIn() {
    setScreen("signInLoading");
    window.setTimeout(() => {
      setScreenStack([]);
      setActiveTab("home");
      setScreen("firstLoginWelcome");
    }, 700);
  }

  function completeFirstLoginWelcome() {
    setScreenStack([]);
    setActiveTab("home");
    setScreen("home");
  }

  function submitSupplementaryInformation() {
    const text = supplementText.trim();
    if (!text) {
      setSupplementError("Enter the additional information before sending.");
      return;
    }
    if (supplementSendLock.current || !selectedReport) return;
    setSupplementError("");
    supplementSendLock.current = true;
    setSupplementSaving(true);
    setScreen("supplementSubmitting");
    window.setTimeout(() => {
      if (supplementFailurePreview) {
        setSupplementFailurePreview(false);
        setSupplementSaving(false);
        supplementSendLock.current = false;
        setScreen("supplementFailure");
        return;
      }
      const entry = { id: `supp-${Date.now()}`, text, createdAt: new Date().toISOString(), attachments: supplementFiles.map((file) => file.name) };
      setReports((previous) => previous.map((report) => report.id === selectedReport.id
        ? { ...report, supplementaryInformation: [...report.supplementaryInformation, entry] }
        : report));
      setSupplementText("");
      setSupplementFiles([]);
      setSupplementFailurePreview(false);
      setSupplementSaving(false);
      supplementSendLock.current = false;
      setScreen("supplementSuccess");
    }, 500);
  }

  function restartSession() {
    if (window.confirm("Start a fresh session? This clears reports and any changes made during this session.")) {
      window.location.reload();
    }
  }

  function openSettingsInfo(title: string, description: string) {
    setSettingsInfo({ title, description });
    go("settingsInfo");
  }

  function saveStaffProfile(nextProfile: StaffProfile) {
    setStaffProfile(nextProfile);
    setProfileSaved(true);
    setScreenStack([]);
    setActiveTab("profile");
    setScreen("profile");
  }

  function markNotificationRead(item: NotificationItem) {
    setSelectedNotificationId(item.id);
    setNotificationsRead((previous) => previous.includes(item.id) ? previous : [...previous, item.id]);
    if (item.relatedReportId) setSelectedReportId(item.relatedReportId);
    go("notificationDetail", "notifications");
  }

  const title = screen === "settingsInfo" ? settingsInfo.title : screenTitles[screen];
  const isLoginScreen = ["signIn", "signInLoading", "firstLoginWelcome"].includes(screen);
  const showNav = !["sosSending", "reportSubmitting", "signIn", "signInLoading", "firstLoginWelcome", "supplementSubmitting"].includes(screen);

  return (
    <main className="ice-stage flex min-h-[100dvh] items-center justify-center bg-[#e9ece9] p-0 sm:p-5">
      <div className="ice-phone relative flex h-[100dvh] min-h-[640px] w-full max-w-[390px] flex-col overflow-hidden bg-[#f8faf8] shadow-[0_24px_70px_rgba(25,42,31,0.15)] sm:h-[min(900px,calc(100dvh-2.5rem))] sm:min-h-[700px] sm:rounded-[36px] sm:border sm:border-[#dfe7e0]">
        {!isLoginScreen && <PhoneTopBar unreadCount={unreadCount} />}
        {title && !isLoginScreen && <ScreenHeader title={title} onBack={back} showBack={screen !== "profile"} />}
        <div className={`ice-content min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain ${isLoginScreen ? "" : "px-4 pb-4"}`}>
          {screen === "signIn" && <MicrosoftSignInScreen onContinue={simulateSignIn} />}
          {screen === "signInLoading" && <LoadingScreen icon={<ShieldCheck />} title="Signing in to ICE" detail="Sign-in is a visual flow only. No account or credentials are being verified." />}
          {screen === "firstLoginWelcome" && <FirstLoginWelcomeScreen onContinue={completeFirstLoginWelcome} />}
          {screen === "home" && (
            <HomeScreen
              unreadCount={unreadCount}
              alerts={alerts}
              reports={reports}
              quickReport={currentQuickReport}
              latestSentQuickReport={latestSentQuickReport}
              isQuickReportSending={currentQuickReport?.sendStatus === "sending"}
              onNotifications={() => go("notifications", "notifications")}
              onAlert={() => { setSelectedAlertId(alerts[0].id); go("alertDetail", "alerts"); }}
              onReport={() => startReport()}
              onCategory={requestQuickReportChoice}
              onShowMore={() => go("quickCategories", "home")}
              onContacts={() => go("contacts")}
              onReports={() => go("reports", "report")}
              onQuickRetry={(key) => startQuickReport(currentQuickReport?.categoryId ?? "", key)}
              onTrackQuickReport={(report) => { setSelectedQuickReportKey(report.key); go("quickReportDetail", "home"); }}
            />
          )}
          {screen === "categories" && <CategoryScreen selected={draft.category} error={draftErrors.category} onSelect={(id) => patchDraft({ category: id })} onContinue={continueWithCategory} />}
          {screen === "quickCategories" && <CategoryScreen quick onSelect={(id) => {
            requestQuickReportChoice(id);
          }} />}
          {screen === "quickReportDetails" && selectedQuickReport && <QuickReportDetailsScreen report={selectedQuickReport} errors={quickDetailsErrors} saving={quickDetailsSaving} objectUrls={quickEvidenceObjectUrls} onChange={(values) => patchQuickReport(selectedQuickReport.key, values)} onSave={() => saveQuickReportDetails(selectedQuickReport)} onCancel={back} />}
          {screen === "quickReportDetail" && selectedQuickReport && <QuickReportStatusScreen
            report={selectedQuickReport}
            onAddDetails={() => startReport(selectedQuickReport.categoryId, selectedQuickReport)}
            onRetry={() => startQuickReport(selectedQuickReport.categoryId, selectedQuickReport.key)}
            onHistory={() => go("quickReportHistory")}
          />}
          {screen === "quickReportHistory" && selectedQuickReport && <QuickReportHistoryScreen report={selectedQuickReport} onBack={back} />}
          {screen === "reportDetails" && <ReportDetailsScreen draft={draft} errors={draftErrors} onChange={patchDraft} onChooseCategory={() => go("categories")} onBack={back} onNext={() => validateReportDetails() && go("reportLocation")} />}
          {screen === "reportLocation" && <LocationScreen draft={draft} errors={draftErrors} onChange={patchDraft} onNext={() => validateLocation() && go("reportEvidence")} onBack={back} />}
          {screen === "reportEvidence" && <EvidenceScreen draft={draft} onChange={patchDraft} onNext={() => go("reportReview")} />}
          {screen === "reportReview" && <ReviewScreen draft={draft} errors={draftErrors} onEdit={(target) => go(target)} onSubmit={() => finishReport()} onSimulateFailure={() => finishReport(true)} />}
          {screen === "reportSubmitting" && <LoadingScreen icon={<ClipboardList />} title="Sending your report" detail="Saving this report in the local demonstration." />}
          {screen === "reportSuccess" && <ReportResultScreen report={selectedReport} onReports={() => go("reports", "report")} onHome={() => openTab("home")} />}
          {screen === "reportFailure" && <ReportFailureScreen onReview={back} />}
          {screen === "reports" && <ReportsScreen reports={reports} quickReports={quickReports} filter={reportFilter} search={reportSearch} onSearch={setReportSearch} onFilter={setReportFilter} onSelect={(entry) => {
            if (entry.quickReportKey) {
              setSelectedQuickReportKey(entry.quickReportKey);
              go("quickReportDetail");
            } else {
              setSelectedReportId(entry.id);
              go("reportDetail");
            }
          }} onCreate={() => startReport()} onPreviewUnavailable={() => go("reportsUnavailable")} />}
          {screen === "reportsEmpty" && <OutcomeScreen icon={<FileText />} tone="gray" title="No reports yet" description="When you submit an incident report, it will appear here." button="Open reports" onClick={back} />}
          {screen === "reportsUnavailable" && <OutcomeScreen icon={<AlertTriangle />} tone="amber" title="Reports unavailable" description="The report list cannot be loaded in this preview state. Your locally held form data remains unchanged." button="Retry reports" onClick={back} />}
          {screen === "reportDetail" && selectedReport && <ReportDetailScreen report={selectedReport} onHistory={() => go("reportHistory")} onSupplement={() => { setSupplementText(""); setSupplementFiles([]); setSupplementError(""); setSupplementFailurePreview(false); go("supplementaryInformation"); }} />}
          {screen === "reportHistory" && selectedReport && <HistoryScreen report={selectedReport} onBack={back} />}
          {screen === "supplementaryInformation" && selectedReport && <SupplementaryInformationScreen report={selectedReport} text={supplementText} files={supplementFiles} error={supplementError} saving={supplementSaving} onChange={(value) => { setSupplementText(value); if (value.trim()) setSupplementError(""); }} onFilesChange={setSupplementFiles} onSubmit={submitSupplementaryInformation} onCancel={back} onPreviewFailure={() => setSupplementFailurePreview(true)} />}
          {screen === "supplementSubmitting" && <LoadingScreen icon={<Send />} title="Sending supplementary information" detail="Saving this update in the local demonstration." />}
          {screen === "supplementSuccess" && <SupplementarySuccessScreen report={selectedReport} onReport={() => { setScreenStack(["reports"]); setScreen("reportDetail"); setActiveTab("report"); }} />}
          {screen === "supplementFailure" && <OutcomeScreen icon={<AlertTriangle />} tone="amber" title="Information not sent" description="The update could not be saved. Your text is still available to retry." button="Try again" onClick={() => setScreen("supplementaryInformation")} secondaryAction={() => { setScreenStack(["reports"]); setScreen("reportDetail"); setActiveTab("report"); }} secondaryLabel="Back to report" />}
          {screen === "sosSending" && selectedSosEvent && <SosProcessingScreen event={selectedSosEvent} />}
          {screen === "sosOutcome" && selectedSosEvent && <SosOutcomeScreen event={selectedSosEvent} onStatus={() => go("sosSent")} onHome={() => openTab("home")} />}
          {screen === "sosSent" && selectedSosEvent && <SosSentScreen event={selectedSosEvent} contacts={contacts} onAcknowledge={() => acknowledgeSos(selectedSosEvent.reference)} onHome={() => openTab("home")} />}
          {screen === "sosHistory" && <SosHistoryScreen history={sosHistory} onSelect={(event) => { setSelectedSosReference(event.reference); go("sosHistoryDetail"); }} />}
          {screen === "sosHistoryDetail" && selectedSosEvent && <SosSentScreen event={selectedSosEvent} contacts={contacts} onAcknowledge={() => acknowledgeSos(selectedSosEvent.reference)} onHome={back} homeLabel="Back to history" />}
          {screen === "alerts" && <AlertsScreen alerts={alerts} onSelect={(alert) => { setSelectedAlertId(alert.id); go("alertDetail", "alerts"); }} onPreviewEmpty={() => go("alertsEmpty", "alerts")} onPreviewUnavailable={() => go("alertsUnavailable", "alerts")} />}
          {screen === "alertsEmpty" && <OutcomeScreen icon={<Bell />} tone="gray" title="No active alerts" description="There are no active alerts to display in this preview state." button="Back to alerts" onClick={back} />}
          {screen === "alertsUnavailable" && <OutcomeScreen icon={<AlertTriangle />} tone="amber" title="Alerts unavailable" description="The alert list is unavailable in this preview state. Try again to return to the list." button="Retry alerts" onClick={back} />}
          {screen === "alertDetail" && selectedAlert && <AlertDetailScreen alert={selectedAlert} onAcknowledge={() => acknowledgeAlert(selectedAlert)} />}
          {screen === "alertAcknowledged" && selectedAlert && <AlertAcknowledgedScreen alert={selectedAlert} onBack={back} />}
          {screen === "notifications" && <NotificationsScreen items={notificationItems} read={notificationsRead} onSelect={markNotificationRead} onPreviewEmpty={() => go("notificationsEmpty", "notifications")} onPreviewUnavailable={() => go("notificationsUnavailable", "notifications")} />}
          {screen === "notificationsEmpty" && <OutcomeScreen icon={<Bell />} tone="gray" title="No notifications" description="System notices and updates about your reports will appear here." button="Back to notifications" onClick={back} />}
          {screen === "notificationsUnavailable" && <OutcomeScreen icon={<AlertTriangle />} tone="amber" title="Notifications unavailable" description="Notification history could not be loaded in this preview state." button="Retry notifications" onClick={back} />}
          {screen === "notificationDetail" && selectedNotification && <NotificationDetailScreen
            item={selectedNotification}
            isRead={notificationsRead.includes(selectedNotification.id)}
            relatedReport={selectedNotification.relatedReportId ? reports.find((report) => report.id === selectedNotification.relatedReportId) : undefined}
            hasRelatedReport={Boolean(selectedNotification.relatedReportId)}
            onViewReport={() => {
              if (!selectedNotification.relatedReportId || !reports.some((report) => report.id === selectedNotification.relatedReportId)) return;
              setSelectedReportId(selectedNotification.relatedReportId);
              go("reportDetail", "report");
            }}
          />}
          {screen === "notificationDetail" && !selectedNotification && <OutcomeScreen icon={<Bell />} tone="gray" title="Notification unavailable" description="This notification is not available in the current session." button="Back to notifications" onClick={back} />}
          {screen === "feed" && <FeedScreen items={feed} onSelect={(item) => { setSelectedFeedId(item.id); go("feedDetail"); }} onPreviewEmpty={() => go("feedEmpty")} onPreviewUnavailable={() => go("feedUnavailable")} />}
          {screen === "feedEmpty" && <OutcomeScreen icon={<Newspaper />} tone="gray" title="No feed updates" description="There are no feed items in this preview state." button="Back to feed" onClick={back} />}
          {screen === "feedUnavailable" && <OutcomeScreen icon={<AlertTriangle />} tone="amber" title="Security feed unavailable" description="Feed items could not be loaded in this preview state." button="Retry feed" onClick={back} />}
          {screen === "feedDetail" && selectedFeed && <FeedDetailScreen item={selectedFeed} />}
          {screen === "profile" && <ProfileScreen
            profile={staffProfile}
            contactCount={contacts.length}
            sosHistoryCount={sosHistory.length}
            saved={profileSaved}
            onDismissSaved={() => setProfileSaved(false)}
            onContacts={() => go("contacts")}
            onEdit={() => { setProfileSaved(false); go("editProfile"); }}
            onSosHistory={() => go("sosHistory")}
            onSettings={() => go("settings")}
            onRestartSession={restartSession}
          />}
          {screen === "editProfile" && <EditProfileScreen profile={staffProfile} onCancel={back} onSave={saveStaffProfile} />}
          {screen === "settings" && <SettingsScreen
            onNotifications={() => go("notificationSettings")}
            onPermissions={() => go("permissions")}
            onOpenInfo={openSettingsInfo}
          />}
          {screen === "notificationSettings" && <NotificationSettingsScreen
            preferences={notificationPreferences}
            onChange={setNotificationPreferences}
          />}
          {screen === "permissions" && <PermissionsScreen />}
          {screen === "settingsInfo" && <SettingsInfoScreen description={settingsInfo.description} />}
          {screen === "contacts" && <ContactsScreen contacts={contacts} onAdd={() => editContact()} onEdit={editContact} onDelete={(id) => setContacts((previous) => previous.filter((contact) => contact.id !== id))} />}
          {screen === "contactEdit" && <ContactForm draft={contactDraft} error={contactError} editing={Boolean(editingContactId)} onChange={setContactDraft} onSave={saveContact} onCancel={back} />}
        </div>
        {showNav && <BottomNav activeTab={activeTab} onChange={openTab} alertActionCount={alertsRequiringAcknowledgement} holdProgress={sosHoldProgress} onHoldStart={startSosHold} onHoldEnd={cancelSosHold} />}
        {sosHoldProgress > 0 && <SosHoldOverlay progress={sosHoldProgress} />}
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

const SOS_HOLD_DURATION = 2000;
const SOS_RING_CIRCUMFERENCE = 2 * Math.PI * 33;
const SOS_OVERLAY_RING_CIRCUMFERENCE = 2 * Math.PI * 54;

function SosHoldOverlay({ progress }: { progress: number }) {
  const remainingSeconds = Math.max(1, Math.ceil((SOS_HOLD_DURATION * (1 - progress)) / 1000));
  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-[#0b1f16]/40 px-6 text-center">
      <div aria-hidden="true" className="relative flex h-32 w-32 items-center justify-center">
        <svg viewBox="0 0 120 120" className="absolute h-32 w-32 -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={SOS_OVERLAY_RING_CIRCUMFERENCE}
            strokeDashoffset={SOS_OVERLAY_RING_CIRCUMFERENCE * (1 - progress)}
          />
        </svg>
        <span className="text-5xl font-bold text-white">{remainingSeconds}</span>
      </div>
      <div aria-hidden="true">
        <p className="text-sm font-semibold text-white">Keep holding to send SOS</p>
        <p className="mt-1 text-xs text-white/80">Release to cancel</p>
      </div>
      <p role="status" aria-live="assertive" className="sr-only">Holding SOS button. {remainingSeconds} second{remainingSeconds === 1 ? "" : "s"} remaining.</p>
    </div>
  );
}

function BottomNav({
  activeTab,
  onChange,
  alertActionCount,
  holdProgress,
  onHoldStart,
  onHoldEnd,
}: {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
  alertActionCount: number;
  holdProgress: number;
  onHoldStart: () => void;
  onHoldEnd: () => void;
}) {
  const holding = holdProgress > 0;

  return (
    <nav aria-label="Main navigation" className="relative z-20 h-[calc(104px+env(safe-area-inset-bottom))] w-full shrink-0">
      <svg aria-hidden="true" viewBox="0 0 390 104" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[104px] w-full" style={{ filter: "drop-shadow(0 -3px 7px rgba(27, 49, 36, 0.10))" }}>
        <path d="M0 20C0 8 8 0 20 0H136C164 0 169 7 180 27C186 39 189 49 195 49C201 49 204 39 210 27C221 7 226 0 254 0H370C382 0 390 8 390 20V104H0Z" fill="#fbfcfb" stroke="#e4ebe5" strokeWidth="1" />
      </svg>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[env(safe-area-inset-bottom)] bg-[#fbfcfb]" />
      <div className="relative z-10 grid h-full grid-cols-6 items-end px-1 pb-[max(9px,env(safe-area-inset-bottom))]">
        {tabs.slice(0, 2).map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => onChange(id)} aria-current={active ? "page" : undefined} className={`relative z-10 flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[9px] ${active ? "font-semibold text-[#087443]" : "text-[#435348]"}`}>
              <span className={`flex h-8 w-10 items-center justify-center rounded-full ${active ? "bg-[#dff1e4]" : ""}`}><Icon className="h-[21px] w-[21px]" strokeWidth={active ? 2.2 : 1.8} /></span>
              <span className="whitespace-nowrap leading-none">{label}</span>
              {id === "alerts" && alertActionCount > 0 && <span className="absolute right-[12px] top-[2px] h-2 w-2 rounded-full bg-[#d92d20] ring-2 ring-[#fbfcfb]" />}
            </button>
          );
        })}
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        {tabs.slice(2).map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => onChange(id)} aria-current={active ? "page" : undefined} className={`relative z-10 flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[9px] ${active ? "font-semibold text-[#087443]" : "text-[#435348]"}`}>
              <span className={`flex h-8 w-10 items-center justify-center rounded-full ${active ? "bg-[#dff1e4]" : ""}`}><Icon className="h-[21px] w-[21px]" strokeWidth={active ? 2.2 : 1.8} /></span>
              <span className="whitespace-nowrap leading-none">{label}</span>
            </button>
          );
        })}
      </div>
      <div className="sos-halo pointer-events-none !absolute !left-1/2 !top-[-10px] !z-20 !w-[104px] -translate-x-1/2">
        <div className="relative flex items-center justify-center">
          <svg aria-hidden="true" viewBox="0 0 72 72" className={`pointer-events-none absolute h-[76px] w-[76px] -rotate-90 ${holding ? "" : "opacity-0"}`}>
            <circle cx="36" cy="36" r="33" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="4" />
            <circle
              cx="36" cy="36" r="33" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={SOS_RING_CIRCUMFERENCE}
              strokeDashoffset={SOS_RING_CIRCUMFERENCE * (1 - holdProgress)}
            />
          </svg>
          <button
            onPointerDown={onHoldStart}
            onPointerUp={onHoldEnd}
            onPointerLeave={onHoldEnd}
            onPointerCancel={onHoldEnd}
            onContextMenu={(event) => event.preventDefault()}
            onKeyDown={(event) => { if ((event.key === " " || event.key === "Enter") && !event.repeat) { event.preventDefault(); onHoldStart(); } }}
            onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") onHoldEnd(); }}
            aria-label="SOS. Press and hold for 2 seconds to send a personal emergency alert."
            style={{ touchAction: "none" }}
            className="sos-action pointer-events-auto relative z-10 flex !w-[66px] select-none flex-col items-center justify-center gap-0.5 rounded-full bg-[#df2929] text-white shadow-[0_3px_10px_rgba(155,32,32,0.2)] transition-transform active:scale-[0.97]"
          >
            <Siren className="h-6 w-6 stroke-[1.8]" />
            <span className="text-[11px] font-semibold leading-none tracking-wide">{holding ? "Hold…" : "SOS"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

function HomeScreen({
  unreadCount,
  alerts,
  reports,
  quickReport,
  latestSentQuickReport,
  isQuickReportSending,
  onNotifications,
  onAlert,
  onReport,
  onCategory,
  onShowMore,
  onContacts,
  onReports,
  onQuickRetry,
  onTrackQuickReport,
}: {
  unreadCount: number;
  alerts: Alert[];
  reports: Report[];
  quickReport?: QuickReport;
  latestSentQuickReport?: QuickReport;
  isQuickReportSending: boolean;
  onNotifications: () => void;
  onAlert: () => void;
  onReport: () => void;
  onCategory: (id: string) => void;
  onShowMore: () => void;
  onContacts: () => void;
  onReports: () => void;
  onQuickRetry: (key: string) => void;
  onTrackQuickReport: (report: QuickReport) => void;
}) {
  const activeAlert = alerts.find((alert) => alert.priority === "Critical" && !alert.acknowledged);
  const latestReport = reports[0];
  const latestQuickReport = latestSentQuickReport;
  const showQuickReportAsLatest = Boolean(latestQuickReport
    && (!latestReport || Date.parse(latestQuickReport.createdAt) >= Date.parse(latestReport.createdAt)));
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

      {quickReport && quickReport.sendStatus !== "sent" && (
        <QuickReportHomePanel
          report={quickReport}
          onRetry={() => onQuickRetry(quickReport.key)}
        />
      )}

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#1d2d24]">Recent activity</h2>
        <button onClick={onReports} className="text-[11px] font-semibold text-[#087443]">View all <span aria-hidden="true">→</span></button>
      </div>
      {showQuickReportAsLatest && latestQuickReport ? (
        <button onClick={() => onTrackQuickReport(latestQuickReport)} className="mb-5 flex items-center gap-3 rounded-2xl border border-[#e1e8e2] bg-white p-3 text-left">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0f6f1]" style={{ color: categoryFor(latestQuickReport.categoryId).color }}>
            {(() => { const Icon = categoryFor(latestQuickReport.categoryId).icon; return <Icon className="h-5 w-5" />; })()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-x-2 text-[10px] text-[#66736b]">
              <StatusPill>{latestQuickReport.detailStatus === "completed" ? "Details added" : "Quick report sent"}</StatusPill>
              <span>{new Date(latestQuickReport.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
            </span>
            <span className="mt-1 block truncate text-[13px] font-medium text-[#1c2b22]">{latestQuickReport.summary || `${latestQuickReport.category} quick report`}</span>
            <span className="block text-[10px] text-[#718078]">{latestQuickReport.reference}</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#647269]" />
        </button>
      ) : latestReport ? (
        <button onClick={onReports} className="mb-5 flex items-center gap-3 rounded-2xl border border-[#e1e8e2] bg-white p-3 text-left">
          <FileText className="h-5 w-5 shrink-0 text-[#2c6547]" />
          <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-x-2 text-[10px] text-[#66736b]"><StatusPill>{latestReport.status}</StatusPill><span>{latestReport.dateTime}</span><span>·</span><span>{latestReport.location.split(",")[0]}</span></span><span className="mt-1 block truncate text-[13px] font-medium text-[#1c2b22]">{latestReport.summary}</span><span className="block text-[10px] text-[#718078]">{latestReport.id}</span></span>
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
}: {
  report: QuickReport;
  onRetry: () => void;
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

  return null;
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

function QuickReportStatusScreen({ report, onAddDetails, onRetry, onHistory }: { report: QuickReport; onAddDetails: () => void; onRetry: () => void; onHistory: () => void }) {
  const category = categoryFor(report.categoryId);
  const Icon = category.icon;
  const isFailed = report.sendStatus === "failed";
  const isSending = report.sendStatus === "sending";
  return (
    <div className="space-y-3 py-4">
      <Panel className={`flex items-start gap-3 ${isFailed ? "bg-[#fff6f4]" : "bg-[#f0f8f0]"}`}>
        {isFailed
          ? <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#b42318]" />
          : isSending
            ? <LoaderCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-[#087443]" />
            : <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#087443]" />}
        <div>
          <p className={`text-sm font-semibold ${isFailed ? "text-[#9f271f]" : "text-[#135b39]"}`}>{isFailed ? "Quick report not sent" : isSending ? "Quick report sending" : "Quick report sent"}</p>
          <p className="mt-1 text-xs text-[#53645a]">{isFailed ? "The local submission failed. Retry the same report to try again." : "This status is held in the local demonstration."}</p>
        </div>
      </Panel>
      <Panel className="space-y-4">
        <div><p className="text-[10px] text-[#718078]">Reference</p><p className="mt-1 break-all text-sm font-semibold text-[#26372c]">{report.reference || "Not assigned"}</p></div>
        <DetailRow icon={<Icon />} label="Category" value={report.category} />
        <DetailRow icon={<CalendarDays />} label="Reported" value={new Date(report.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
        <DetailRow icon={<UserRound />} label="Reported by" value={report.reporterName} />
        <DetailRow icon={<MapPin />} label="Location" value={report.location || "Not available"} />
        {report.dateTime && <DetailRow icon={<CalendarDays />} label="Incident date and time" value={new Date(report.dateTime).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} />}
        <DetailRow icon={<FileText />} label="Details" value={report.detailStatus === "completed" ? report.summary : "Not added yet"} />
        <StatusPill tone={isFailed ? "red" : isSending ? "amber" : "green"}>{isFailed ? "Not sent" : isSending ? "Sending" : report.detailStatus === "completed" ? "Details added" : "Quick report sent"}</StatusPill>
      </Panel>
      <Button onClick={onHistory} className="w-full">View timeline <ChevronRight className="h-4 w-4" /></Button>
      {isFailed && <Button onClick={onRetry} variant="secondary" className="w-full">Retry same quick report</Button>}
      {!isFailed && report.detailStatus !== "completed" && <Button onClick={onAddDetails} variant="secondary" className="w-full">Add details</Button>}
    </div>
  );
}

function QuickReportHistoryScreen({ report, onBack }: { report: QuickReport; onBack: () => void }) {
  const category = categoryFor(report.categoryId);
  const Icon = category.icon;
  const isFailed = report.sendStatus === "failed";
  const isSending = report.sendStatus === "sending";
  const statusLabel = isFailed ? "Not sent" : isSending ? "Sending" : report.detailStatus === "completed" ? "Details added" : "Quick report sent";
  const stages = ["Submitted", "Received", "Under Review", "Assigned", "In Progress", "Resolved"] as const;
  const history = report.sendStatus === "sent"
    ? [`Submitted · ${new Date(report.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`]
    : [];
  const completedStages = new Set(history
    .map((event) => stages.find((stage) => event.toLowerCase().startsWith(stage.toLowerCase())))
    .filter((stage): stage is typeof stages[number] => Boolean(stage)));
  return (
    <div className="space-y-4 py-3">
      <section className="flex items-start gap-3 rounded-2xl border border-[#e1e8e2] bg-white p-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: category.color }} />
        <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold text-[#18231d]">{report.summary || `${report.category} quick report`}</p><p className="mt-1 break-all text-xs text-[#66736b]">{report.reference || "Not assigned"}</p><div className="mt-2"><StatusPill tone={isFailed ? "red" : isSending ? "amber" : "green"}>{statusLabel}</StatusPill></div></div>
      </section>
      <section aria-label="Quick report status timeline">
        {stages.map((stage, index) => {
          const isComplete = completedStages.has(stage);
          const event = history.find((item) => item.toLowerCase().startsWith(stage.toLowerCase()));
          return <div key={stage} className="relative flex gap-3 pb-5 last:pb-0">
            {index < stages.length - 1 && <span className={`absolute left-[9px] top-5 h-full w-px ${isComplete ? "bg-[#087443]" : "bg-[#dfe7e0]"}`} aria-hidden="true" />}
            <span className={`relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isComplete ? "bg-[#087443] text-white" : "border-2 border-[#cbd5ce] bg-white text-[#718078]"}`}>{isComplete ? <Check className="h-3 w-3" /> : null}</span>
            <div className="min-w-0 flex-1 rounded-xl border border-[#e1e8e2] bg-white p-3">
              <p className="text-xs font-semibold text-[#26372c]">{stage}</p>
              <p className="mt-1 text-xs text-[#66736b]">{event ? event.split("·").slice(1).join("·").trim() || "Confirmed" : "Not started"}</p>
            </div>
          </div>;
        })}
      </section>
      <p className="text-xs leading-5 text-[#66736b]">Only confirmed status updates appear here. Stages without a confirmed update remain not started.</p>
      <Button variant="quiet" onClick={onBack} className="w-full">Back to report</Button>
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
      {!quick && <Panel className="flex items-start gap-2.5 bg-[#f2f8f3] p-3 text-xs text-[#52645a]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#087443]" /><p>Incident reports are stored as local demonstration data in this app.</p></Panel>}
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
      <p className="flex items-start gap-2 rounded-xl bg-[#f1f7f2] p-3 text-[11px] text-[#53645a]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#087443]" />Submitting creates a local demo report; it is not sent to a live NSIA service.</p>
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
  quickReports,
  filter,
  search,
  onSearch,
  onFilter,
  onSelect,
  onCreate,
  onPreviewUnavailable,
}: {
  reports: Report[];
  quickReports: QuickReport[];
  filter: string;
  search: string;
  onSearch: (value: string) => void;
  onFilter: (filter: string) => void;
  onSelect: (report: ReportListEntry) => void;
  onCreate: () => void;
  onPreviewUnavailable: () => void;
}) {
  const filters = ["All", "Active", "Resolved"];
  const query = search.trim().toLowerCase();
  const entries: ReportListEntry[] = [
    ...reports.map(({ id, createdAt, category, summary, location, dateTime, status }) => ({
      id,
      createdAt,
      category,
      summary,
      location,
      dateTime,
      status,
    })),
    ...quickReports
      .filter((report): report is QuickReport & { reference: string } => report.sendStatus === "sent" && Boolean(report.reference))
      .map((report) => ({
        id: report.reference,
        createdAt: report.createdAt,
        category: report.category,
        summary: report.summary || `${report.category} quick report`,
        location: report.location ?? "",
        dateTime: new Date(report.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        status: "Submitted" as const,
        quickReportKey: report.key,
      })),
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const visible = entries.filter((report) => {
    const matchesFilter = filter === "All"
      || (filter === "Active" && report.status !== "Resolved")
      || report.status === filter;
    const matchesQuery = !query || [report.category, report.summary, report.id, report.location]
      .some((value) => value.toLowerCase().includes(query));
    return matchesFilter && matchesQuery;
  });
  return (
    <div className="space-y-3 py-3">
      <div><h2 className="text-sm font-semibold text-[#18231d]">My Reports</h2><p className="mt-1 text-xs text-[#66736b]">Track incidents you&apos;ve submitted.</p></div>
      <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#e1e8e2] bg-white px-3 focus-within:border-[#087443] focus-within:ring-2 focus-within:ring-[#087443]/15">
        <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-[#66736b]" />
        <input value={search} onChange={(event) => onSearch(event.target.value)} aria-label="Search reports by type, reference, or location" placeholder="Search reports" className="min-w-0 flex-1 bg-transparent text-xs text-[#18231d] outline-none placeholder:text-[#89958d]" />
      </label>
      <div className="flex gap-2" aria-label="Filter reports">
        {filters.map((item) => <button key={item} onClick={() => onFilter(item)} aria-pressed={filter === item} className={`min-h-9 rounded-full px-3 text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087443] ${filter === item ? "bg-[#087443] text-white" : "bg-[#edf5ef] text-[#526158]"}`}>{item}{item === "All" ? ` (${entries.length})` : item === "Active" ? ` (${entries.filter((report) => report.status !== "Resolved").length})` : ` (${entries.filter((report) => report.status === "Resolved").length})`}</button>)}
      </div>
      {visible.length ? (
        <section aria-label="Submitted reports" className="overflow-hidden rounded-2xl border border-[#e1e8e2] bg-white">
          {visible.map((report, index) => {
            const category = categoryFor(report.category.toLowerCase());
            const Icon = category.icon;
            const tone = report.status === "Resolved" ? "green" : report.status === "In progress" ? "amber" : "blue";
            return <button key={report.quickReportKey ?? report.id} onClick={() => onSelect(report)} className={`flex min-h-[84px] w-full items-center gap-3 p-3 text-left hover:bg-[#f8faf8] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#087443] ${index ? "border-t border-[#edf1ed]" : ""}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f6f1]" style={{ color: category.color }}><Icon className="h-5 w-5" strokeWidth={1.8} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1"><StatusPill tone={tone}>{report.status}</StatusPill><span className="text-[11px] text-[#66736b]">{report.dateTime}</span></span>
                <span className="mt-1 block break-words text-[13px] font-semibold text-[#18231d]">{report.summary}</span>
                <span className="mt-0.5 block break-all text-[11px] text-[#66736b]">{report.id}{report.location ? ` · ${report.location}` : ""}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#819087]" />
            </button>;
          })}
        </section>
      ) : <div className="rounded-2xl border border-dashed border-[#dfe7e0] px-4 py-8 text-center">
        <FileText className="mx-auto h-7 w-7 text-[#829087]" />
        <p className="mt-3 text-sm font-semibold text-[#35463c]">{entries.length ? "No matching reports" : "No reports yet"}</p>
        <p className="mt-1 text-xs text-[#718078]">{entries.length ? "Try a different search or filter." : "Reports you submit will appear here."}</p>
      </div>}
      <Button onClick={onCreate} variant="quiet" className="w-full"><Plus className="h-4 w-4" />Report an incident</Button>
      <p className="text-center text-[11px] text-[#829087]">Your reports are stored in this local session.</p>
      <button onClick={onPreviewUnavailable} className="mx-auto block min-h-10 px-2 text-[11px] text-[#748077] underline decoration-dotted underline-offset-2 focus-visible:outline-2 focus-visible:outline-[#087443]">Preview unavailable state</button>
    </div>
  );
}

function ReportDetailScreen({ report, onHistory, onSupplement }: { report: Report; onHistory: () => void; onSupplement: () => void }) {
  const category = categoryFor(report.category.toLowerCase());
  const Icon = category.icon;
  const tone = report.status === "Resolved" ? "green" : report.status === "In progress" ? "amber" : "blue";
  return (
    <div className="space-y-3 py-3">
      <section className="rounded-2xl border border-[#e1e8e2] bg-white p-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0f6f1]" style={{ color: category.color }}><Icon className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1"><h2 className="break-words text-sm font-semibold text-[#18231d]">{report.summary}</h2><p className="mt-1 break-all text-xs text-[#66736b]">{report.id}</p><p className="mt-1 text-xs text-[#66736b]">Submitted {report.dateTime}</p></div>
          <StatusPill tone={tone}>{report.status}</StatusPill>
        </div>
      </section>
      <Panel className="space-y-4">
        <DetailRow icon={<Icon />} label="Category" value={report.category} />
        <DetailRow icon={<MapPin />} label="Location" value={report.location || "Not provided"} />
        <DetailRow icon={<Info />} label="Description" value={report.description} />
        <DetailRow icon={<CalendarDays />} label="Incident date and time" value={report.dateTime} />
        {report.evidence.length > 0 && <DetailRow icon={<Images />} label="Evidence" value={report.evidence.join(", ")} />}
        {report.history.length > 1 && <DetailRow icon={<History />} label="Latest status update" value={report.history[report.history.length - 1]} />}
      </Panel>
      {report.supplementaryInformation.length > 0 && <section className="space-y-2">
        <h3 className="text-xs font-semibold text-[#35463c]">Supplementary information</h3>
        {report.supplementaryInformation.map((entry) => <Panel key={entry.id} className="p-3">
          <p className="whitespace-pre-wrap break-words text-xs leading-5 text-[#26372c]">{entry.text}</p>
          {(entry.attachments ?? []).length > 0 && <p className="mt-2 text-[11px] text-[#52645a]">Attachments: {(entry.attachments ?? []).join(", ")}</p>}
          <p className="mt-2 text-[11px] text-[#718078]">Added {new Date(entry.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        </Panel>)}
      </section>}
      <Button onClick={onHistory} className="w-full">View full timeline <ChevronRight className="h-4 w-4" /></Button>
      <Button variant="quiet" onClick={onSupplement} className="w-full"><Plus className="h-4 w-4" />Add supplementary information</Button>
      <p className="text-center text-[11px] text-[#829087]">Report details are saved in this local session.</p>
    </div>
  );
}

function HistoryScreen({ report, onBack }: { report: Report; onBack: () => void }) {
  const category = categoryFor(report.category.toLowerCase());
  const Icon = category.icon;
  const stages = ["Submitted", "Received", "Under Review", "Assigned", "In Progress", "Resolved"] as const;
  const completedStages = new Set(report.history
    .map((event) => stages.find((stage) => event.toLowerCase().startsWith(stage.toLowerCase())))
    .filter((stage): stage is typeof stages[number] => Boolean(stage)));
  return (
    <div className="space-y-4 py-3">
      <section className="flex items-start gap-3 rounded-2xl border border-[#e1e8e2] bg-white p-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: category.color }} />
        <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold text-[#18231d]">{report.summary}</p><p className="mt-1 break-all text-xs text-[#66736b]">{report.id}</p><div className="mt-2"><StatusPill>{report.status}</StatusPill></div></div>
      </section>
      <section aria-label="Report status timeline">
        {stages.map((stage, index) => {
          const isComplete = completedStages.has(stage);
          const event = report.history.find((item) => item.toLowerCase().startsWith(stage.toLowerCase()));
          return <div key={stage} className="relative flex gap-3 pb-5 last:pb-0">
            {index < stages.length - 1 && <span className={`absolute left-[9px] top-5 h-full w-px ${isComplete ? "bg-[#087443]" : "bg-[#dfe7e0]"}`} aria-hidden="true" />}
            <span className={`relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isComplete ? "bg-[#087443] text-white" : "border-2 border-[#cbd5ce] bg-white text-[#718078]"}`}>{isComplete ? <Check className="h-3 w-3" /> : null}</span>
            <div className="min-w-0 flex-1 rounded-xl border border-[#e1e8e2] bg-white p-3">
              <p className="text-xs font-semibold text-[#26372c]">{stage}</p>
              <p className="mt-1 text-xs text-[#66736b]">{event ? event.split("·").slice(1).join("·").trim() || "Confirmed" : "Not started"}</p>
            </div>
          </div>;
        })}
      </section>
      <p className="text-xs leading-5 text-[#66736b]">Only confirmed status updates appear here. Stages without a confirmed update remain not started.</p>
      <Button variant="quiet" onClick={onBack} className="w-full">Back to report</Button>
    </div>
  );
}

function SupplementaryInformationScreen({
  report,
  text,
  files,
  error,
  saving,
  onChange,
  onFilesChange,
  onSubmit,
  onCancel,
  onPreviewFailure,
}: {
  report: Report;
  text: string;
  files: File[];
  error: string;
  saving: boolean;
  onChange: (text: string) => void;
  onFilesChange: (files: File[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onPreviewFailure: () => void;
}) {
  const [attachmentError, setAttachmentError] = useState("");

  function selectAttachments(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const oversizedFile = selectedFiles.find((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFile) {
      setAttachmentError(`${oversizedFile.name} exceeds the 10 MB per-file limit.`);
      event.target.value = "";
      return;
    }
    setAttachmentError("");
    onFilesChange([...files, ...selectedFiles]);
    event.target.value = "";
  }

  return (
    <div className="space-y-3 py-3">
      <section className="rounded-2xl border border-[#e1e8e2] bg-white p-3">
        <div className="flex items-start gap-2.5">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#087443]" />
          <div className="min-w-0">
            <p className="break-all text-xs font-semibold text-[#087443]">{report.id}</p>
            <p className="mt-1 break-words text-[11px] text-[#52645a]">{report.category} · {report.dateTime}</p>
            {report.location && <p className="mt-0.5 break-words text-[11px] text-[#718078]">{report.location}</p>}
          </div>
        </div>
      </section>
      <div>
        <h2 className="text-base font-semibold text-[#18231d]">Add useful information.</h2>
        <p className="mt-1 text-xs leading-5 text-[#66736b]">This is added to the existing report; it won&apos;t replace the original details.</p>
      </div>
      <Field label="Additional information" required error={error}>
        <textarea value={text} onChange={(event) => onChange(event.target.value.slice(0, 500))} maxLength={500} rows={5} placeholder="Add relevant details or updates…" className={`${inputClass(Boolean(error))} min-h-32 resize-y`} />
      </Field>
      <p className="text-right text-[11px] text-[#718078]">{text.length}/500</p>
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#26372c]">Add attachment (optional)</p>
        <label className="flex min-h-20 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-[#cfdad1] bg-white px-3 py-4 text-xs text-[#52645a] hover:bg-[#f8fbf8]">
          <Images className="h-5 w-5 shrink-0 text-[#087443]" />
          <span>Tap to choose a file<br /><span className="text-[10px] text-[#718078]">Photos, videos, or documents · Max 10 MB per file</span></span>
          <input className="sr-only" type="file" accept="image/*,video/*,.pdf,.doc,.docx,.txt" multiple onChange={selectAttachments} disabled={saving} aria-label="Choose supplementary attachments" />
        </label>
        {files.map((file, index) => <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex min-h-10 items-center gap-2 rounded-lg border border-[#e1e8e2] bg-white px-3">
          <FileText className="h-4 w-4 shrink-0 text-[#087443]" />
          <span className="min-w-0 flex-1 truncate text-[11px] text-[#33443a]">{file.name}</span>
          <button type="button" onClick={() => onFilesChange(files.filter((_, fileIndex) => fileIndex !== index))} disabled={saving} aria-label={`Remove ${file.name}`} className="flex h-9 w-9 items-center justify-center rounded-full text-[#65736a] hover:bg-[#f2f7f3] disabled:opacity-50"><X className="h-4 w-4" /></button>
        </div>)}
        {attachmentError && <p role="alert" className="text-xs text-[#b42318]">{attachmentError}</p>}
      </div>
      <p className="flex items-start gap-2 text-xs leading-5 text-[#52645a]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#087443]" />Share only relevant information. Avoid unnecessary sensitive personal or medical details.</p>
      <p className="text-xs text-[#66736b]">Saved locally in this demonstration; attachments are not uploaded to a live service.</p>
      <div className="space-y-2 pt-1">
        <Button onClick={onSubmit} disabled={saving} className="w-full">{saving ? <><LoaderCircle className="h-4 w-4 animate-spin" />Sending…</> : "Send supplementary information"}</Button>
        <Button variant="secondary" onClick={onCancel} disabled={saving} className="w-full">Cancel</Button>
      </div>
      <button type="button" onClick={onPreviewFailure} disabled={saving} className="mx-auto block min-h-10 px-2 text-[11px] text-[#748077] underline decoration-dotted underline-offset-2 focus-visible:outline-2 focus-visible:outline-[#087443]">Preview submission failure</button>
    </div>
  );
}

function SupplementarySuccessScreen({ report, onReport }: { report?: Report; onReport: () => void }) {
  return (
    <div className="flex min-h-[440px] flex-col items-center justify-center py-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dff4e4] text-[#087443]"><CheckCircle2 className="h-9 w-9" /></span>
      <h2 className="mt-4 text-lg font-semibold text-[#18231d]">Information added</h2>
      <p className="mt-2 text-xs leading-5 text-[#66736b]">The update has been added to {report?.id ?? "your report"} in this local session.</p>
      <Button onClick={onReport} className="mt-6 w-full">Back to report details</Button>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex gap-3"><span className="mt-0.5 text-[#087443] [&>svg]:h-4 [&>svg]:w-4">{icon}</span><span className="min-w-0"><span className="block text-[10px] text-[#758178]">{label}</span><span className="mt-0.5 block break-words text-xs text-[#26372c]">{value}</span></span></div>;
}

function AlertsScreen({ alerts, onSelect, onPreviewEmpty, onPreviewUnavailable }: { alerts: Alert[]; onSelect: (alert: Alert) => void; onPreviewEmpty: () => void; onPreviewUnavailable: () => void }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filters = ["All", "Safety", "Access", "Security"];
  const query = search.trim().toLowerCase();
  const visible = alerts.filter((alert) => (
    (filter === "All" || alert.category === filter)
    && (!query || `${alert.title} ${alert.reference} ${alert.affectedArea} ${alert.description}`.toLowerCase().includes(query))
  ));
  return (
    <div className="space-y-3 py-3">
      <div><h2 className="text-sm font-semibold text-[#203127]">Admin-issued safety alerts</h2><p className="mt-1 text-[11px] text-[#748077]">Updates published by your organisation.</p></div>
      <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#dfe7e0] bg-white px-3 text-[#6d7a71] focus-within:border-[#087443] focus-within:ring-2 focus-within:ring-[#087443]/15">
        <Search className="h-4 w-4 shrink-0" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search alerts or locations" className="min-w-0 flex-1 bg-transparent text-xs text-[#18231d] outline-none placeholder:text-[#94a099]" />
      </label>
      <div className="flex gap-1 overflow-x-auto pb-1" role="group" aria-label="Filter alerts by category">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} aria-pressed={filter === item} className={`min-h-10 shrink-0 rounded-full px-3 text-[10px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087443] ${filter === item ? "bg-[#087443] text-white" : "bg-[#eef2ef] text-[#526158]"}`}>{item}</button>)}</div>
      <div className="divide-y divide-[#e8ede9] overflow-hidden rounded-2xl border border-[#e1e8e2] bg-white">
        {visible.map((alert) => {
          const tone = alert.priority === "Critical" ? "red" : alert.priority === "Advisory" ? "amber" : "blue";
          const Icon = alert.priority === "Critical" ? AlertTriangle : alert.priority === "Advisory" ? BellRing : ShieldCheck;
          return <button key={alert.id} onClick={() => onSelect(alert)} className="flex min-h-[76px] w-full items-center gap-3 px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#087443]">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone === "red" ? "bg-[#fff0ed] text-[#c53124]" : tone === "amber" ? "bg-[#fff5df] text-[#ad720d]" : "bg-[#edf5ff] text-[#3470a8]"}`}><Icon className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-1.5"><span className="text-[9px] font-semibold text-[#087443]">{alert.category}</span><span aria-hidden="true" className="text-[9px] text-[#a1aaa4]">·</span><span className={`text-[9px] font-medium ${tone === "red" ? "text-[#b3261e]" : tone === "amber" ? "text-[#98610a]" : "text-[#3470a8]"}`}>{alert.priority}</span>{alert.requiresAcknowledgement && !alert.acknowledged && <span className="text-[9px] font-medium text-[#a75e00]">· Action required</span>}</span><span className="mt-1 block truncate text-xs font-semibold text-[#24352b]">{alert.title}</span><span className="mt-0.5 block truncate text-[10px] text-[#718078]">{alert.affectedArea} · {alert.time}</span></span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#718078]" />
          </button>;
        })}
        {visible.length === 0 && <p className="px-4 py-10 text-center text-xs text-[#748077]">No alerts match this search or category.</p>}
      </div>
      <p className="text-center text-[10px] text-[#829087]">Illustrative alerts; not a live organisation feed.</p>
      <div className="flex justify-center gap-4"><button onClick={onPreviewEmpty} className="min-h-10 px-2 text-[10px] text-[#748077] underline decoration-dotted underline-offset-2">Preview no active alerts</button><button onClick={onPreviewUnavailable} className="min-h-10 px-2 text-[10px] text-[#748077] underline decoration-dotted underline-offset-2">Preview unavailable</button></div>
    </div>
  );
}

function AlertDetailScreen({ alert, onAcknowledge }: { alert: Alert; onAcknowledge: () => void }) {
  const tone = alert.priority === "Critical" ? "red" : alert.priority === "Advisory" ? "amber" : "blue";
  const [shareFeedback, setShareFeedback] = useState("");

  async function shareAlert() {
    try {
      if (navigator.share) {
        await navigator.share({ title: alert.title, text: `${alert.description}\n${alert.affectedArea}` });
        setShareFeedback("Share sheet opened.");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${alert.title}\n${alert.description}\n${alert.affectedArea}`);
        setShareFeedback("Alert details copied to clipboard.");
      } else {
        setShareFeedback("Sharing is unavailable in this browser.");
      }
    } catch {
      setShareFeedback("Sharing was cancelled or unavailable. The alert has not been shared.");
    }
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-wrap items-center gap-2"><StatusPill tone={tone}>{alert.priority}</StatusPill><StatusPill>{alert.category}</StatusPill></div>
      <div><h2 className="text-lg font-semibold leading-snug text-[#1d2d24]">{alert.title}</h2><p className="mt-1 text-[11px] text-[#758178]">{alert.time} · {alert.reference}</p></div>
      <Panel className="space-y-3">
        <DetailRow icon={<MapPin />} label="Affected area" value={alert.affectedArea} />
        <DetailRow icon={<ShieldCheck />} label="Issued by" value={alert.source} />
        <div className="border-t border-[#edf1ed] pt-3"><p className="text-sm leading-6 text-[#394a40]">{alert.description}</p></div>
      </Panel>
      <div className="flex items-start gap-2 rounded-xl bg-[#f3f6f4] p-3"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#087443]" /><p className="text-xs leading-5 text-[#526158]">Sharing classification: {alert.classification}.</p></div>
      {alert.requiresAcknowledgement ? alert.acknowledged
        ? <p className="rounded-xl bg-[#edf7ef] p-3 text-xs text-[#087443]">Acknowledged in this session{alert.acknowledgedAt ? ` · ${new Date(alert.acknowledgedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}` : ""}.</p>
        : <Panel className="bg-[#fff8e9]"><p className="text-xs font-semibold text-[#795413]">This alert requires acknowledgement.</p><p className="mt-1 text-[11px] text-[#856b3d]">Acknowledgement is recorded in this app session only.</p></Panel>
        : <p className="rounded-xl bg-[#f3f6f4] p-3 text-xs text-[#647269]">No acknowledgement is required for this alert.</p>}
      {alert.requiresAcknowledgement && !alert.acknowledged && <Button onClick={onAcknowledge} className="w-full">Acknowledge alert</Button>}
      {alert.classification === "Shareable" && <><Button variant="secondary" onClick={shareAlert} className="w-full"><ExternalLink className="h-4 w-4" />Share alert</Button>{shareFeedback && <p role="status" className="text-center text-[11px] text-[#66736b]">{shareFeedback}</p>}</>}
      <p className="text-center text-[10px] text-[#829087]">Illustrative organisation alert. Follow verified channels for live information.</p>
    </div>
  );
}

function AlertAcknowledgedScreen({ alert, onBack }: { alert: Alert; onBack: () => void }) {
  return (
    <div className="flex min-h-[440px] flex-col items-center justify-center py-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dff4e4] text-[#087443]"><CheckCircle2 className="h-9 w-9" /></span>
      <h2 className="mt-4 text-lg font-semibold text-[#18231d]">Alert acknowledged</h2>
      <p className="mt-2 max-w-[280px] text-xs leading-5 text-[#66736b]">{alert.title}</p>
      <p className="mt-1 text-[10px] text-[#829087]">Acknowledged in this session{alert.acknowledgedAt ? ` · ${new Date(alert.acknowledgedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}` : ""}.</p>
      <Button onClick={onBack} className="mt-6 w-full">Back to alert details</Button>
    </div>
  );
}

function NotificationsScreen({ items, read, onSelect, onPreviewEmpty, onPreviewUnavailable }: {
  items: NotificationItem[];
  read: string[];
  onSelect: (item: NotificationItem) => void;
  onPreviewEmpty: () => void;
  onPreviewUnavailable: () => void;
}) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filters = ["All", "Reports", "System", "Account"];
  const query = search.trim().toLowerCase();
  const visible = items.filter((item) => (
    (filter === "All" || item.category === filter)
    && (!query || `${item.title} ${item.summary} ${item.category}`.toLowerCase().includes(query))
  ));
  const sortedItems = [...visible].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  return (
    <div className="space-y-3 py-3">
      <div><h2 className="text-sm font-semibold text-[#203127]">System notifications</h2><p className="mt-1 text-[11px] text-[#748077]">System notices and updates about your activity.</p></div>
      <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#dfe7e0] bg-white px-3 text-[#6d7a71] focus-within:border-[#087443] focus-within:ring-2 focus-within:ring-[#087443]/15">
        <Search className="h-4 w-4 shrink-0" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notifications" className="min-w-0 flex-1 bg-transparent text-xs text-[#18231d] outline-none placeholder:text-[#94a099]" />
      </label>
      <div className="flex gap-1 overflow-x-auto pb-1" role="group" aria-label="Filter notifications by category">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} aria-pressed={filter === item} className={`min-h-10 shrink-0 rounded-full px-3 text-[10px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087443] ${filter === item ? "bg-[#087443] text-white" : "bg-[#eef2ef] text-[#526158]"}`}>{item}</button>)}</div>
      <div className="divide-y divide-[#e8ede9] overflow-hidden rounded-2xl border border-[#e1e8e2] bg-white">
        {sortedItems.map((item) => {
          const isRead = read.includes(item.id);
          const Icon = item.category === "Reports" ? FileText : item.category === "Account" ? UserRound : Bell;
          return <button key={item.id} onClick={() => onSelect(item)} className="flex min-h-[76px] w-full items-center gap-3 px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#087443]">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.category === "Reports" ? "bg-[#edf5ef] text-[#087443]" : "bg-[#f0f4f8] text-[#536b82]"}`}><Icon className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="text-[9px] font-semibold text-[#087443]">{item.category}</span>{!isRead && <span className="rounded-full bg-[#e6f4e9] px-1.5 py-0.5 text-[8px] font-medium text-[#087443]">Unread</span>}</span><span className="mt-1 block truncate text-xs font-semibold text-[#24352b]">{item.title}</span><span className="mt-0.5 block truncate text-[10px] text-[#718078]">{item.summary}</span><span className="mt-0.5 block text-[9px] text-[#8a968e]">{formatNotificationTime(item.createdAt)}</span></span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#718078]" />
          </button>;
        })}
        {sortedItems.length === 0 && <p className="px-4 py-10 text-center text-xs text-[#748077]">{items.length ? "No notifications match this search or category." : "No system notifications yet."}</p>}
      </div>
      <p className="text-center text-[10px] text-[#829087]">Illustrative system notices; report updates use this session&apos;s report data.</p>
      <div className="flex justify-center gap-4"><button onClick={onPreviewEmpty} className="min-h-10 px-2 text-[10px] text-[#748077] underline decoration-dotted underline-offset-2">Preview empty state</button><button onClick={onPreviewUnavailable} className="min-h-10 px-2 text-[10px] text-[#748077] underline decoration-dotted underline-offset-2">Preview unavailable</button></div>
    </div>
  );
}

function NotificationDetailScreen({ item, isRead, relatedReport, hasRelatedReport, onViewReport }: {
  item: NotificationItem;
  isRead: boolean;
  relatedReport?: Report;
  hasRelatedReport: boolean;
  onViewReport: () => void;
}) {
  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-wrap items-center gap-2"><StatusPill>{item.category}</StatusPill><StatusPill tone={isRead ? "gray" : "blue"}>{isRead ? "Read" : "Unread"}</StatusPill></div>
      <div><h2 className="text-lg font-semibold leading-snug text-[#1d2d24]">{item.title}</h2><p className="mt-1 text-[11px] text-[#758178]">{formatNotificationTime(item.createdAt)}</p></div>
      <Panel><p className="text-sm leading-6 text-[#394a40]">{item.summary}</p></Panel>
      {item.category === "Reports" && relatedReport && <Panel className="space-y-3">
        <p className="text-xs font-semibold text-[#26372c]">Related report</p>
        <DetailRow icon={<FileText />} label="Reference" value={relatedReport.id} />
        <DetailRow icon={<ClipboardList />} label="Category" value={relatedReport.category} />
        <DetailRow icon={<CheckCircle2 />} label="Current status" value={relatedReport.status} />
        <DetailRow icon={<CalendarDays />} label="Submitted" value={relatedReport.dateTime} />
        {relatedReport.location && <DetailRow icon={<MapPin />} label="Location" value={relatedReport.location} />}
      </Panel>}
      {hasRelatedReport && !relatedReport && <p role="status" className="rounded-xl bg-[#fff8e9] p-3 text-xs leading-5 text-[#795413]">The related report is not available in this session, so it cannot be opened.</p>}
      {item.category === "Reports" && relatedReport && <Button onClick={onViewReport} className="w-full">View report<ChevronRight className="h-4 w-4" /></Button>}
      <p className="text-center text-[10px] text-[#829087]">Notification details are held in this app session.</p>
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


function SosProcessingScreen({ event }: { event: SosEvent }) {
  const locationReady = event.location.startsWith("Lat ");
  return (
    <div className="space-y-5 py-5">
      <section className="flex flex-col items-center rounded-2xl bg-[#f3f8f4] px-4 py-5 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#087443]"><LoaderCircle aria-hidden="true" className="h-8 w-8 animate-spin motion-reduce:animate-none" /></span>
        <h2 className="mt-4 text-lg font-semibold text-[#203127]">Processing SOS request</h2>
        <p className="mt-1 max-w-[280px] text-xs leading-5 text-[#68756c]">Recording this request in the current app session.</p>
      </section>
      <Panel className="space-y-4">
        <p className="text-xs font-semibold text-[#26372c]">Activation progress</p>
        <ContactStatus name="Local SOS event" status={`Recorded · ${event.reference}`} done />
        <ContactStatus name="Event location" status={event.location} done={locationReady} />
        <ContactStatus name="Contact notification" status="Not sent in this local preview" done={false} />
      </Panel>
      <p role="status" className="rounded-xl bg-[#edf5ef] p-3 text-center text-[11px] leading-5 text-[#526158]">Keep this screen available while the local activation result is prepared. No contact notification is being sent.</p>
    </div>
  );
}

function SosOutcomeScreen({ event, onStatus, onHome }: { event: SosEvent; onStatus: () => void; onHome: () => void }) {
  return (
    <div className="space-y-4 py-5">
      <section className="flex flex-col items-center text-center">
        <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#dff4e4] text-[#087443]"><CheckCircle2 className="h-9 w-9" /></span>
        <h2 className="mt-4 text-lg font-semibold text-[#1d2d24]">SOS request activated</h2>
        <p className="mt-1 max-w-[290px] text-xs leading-5 text-[#66736b]">The request was recorded in this app session. This local preview did not notify contacts.</p>
      </section>
      <Panel className="space-y-3">
        <p className="text-xs font-semibold text-[#26372c]">Request details</p>
        <DetailRow icon={<FileText />} label="Local reference" value={event.reference} />
        <DetailRow icon={<CalendarDays />} label="Recorded" value={new Date(event.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
        <DetailRow icon={<MapPin />} label="Event location" value={event.location} />
        <p className="rounded-lg bg-[#f5f7f5] p-2.5 text-[11px] leading-4 text-[#526158]">Contact notification: not sent in this preview.</p>
      </Panel>
      <Button onClick={onStatus} className="w-full">View SOS status<ChevronRight className="h-4 w-4" /></Button>
      <Button onClick={onHome} variant="secondary" className="w-full">Return to Home</Button>
    </div>
  );
}

function SosSentScreen({
  event,
  contacts,
  onAcknowledge,
  onHome,
  homeLabel = "Back to Home",
}: {
  event: SosEvent;
  contacts: EmergencyContact[];
  onAcknowledge: () => void;
  onHome: () => void;
  homeLabel?: string;
}) {
  const acknowledged = event.acknowledged;
  const primary = contacts.find((contact) => contact.priority === "Primary");
  const secondary = contacts.find((contact) => contact.priority === "Secondary");

  useEffect(() => {
    if (acknowledged) return;
    const timer = window.setTimeout(onAcknowledge, 4000);
    return () => window.clearTimeout(timer);
  }, [acknowledged, onAcknowledge]);

  return (
    <div className="space-y-4 py-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#dff4e4] text-[#087443]"><CheckCircle2 className="h-10 w-10" /></span>
        <h2 className="mt-4 text-lg font-semibold text-[#1d2d24]">Contact notification status</h2>
        <p className="mt-1 text-xs text-[#66736b]">Request recorded locally; no contact notification was sent.</p>
      </div>
      <Panel className="space-y-3">
        <p className="text-xs font-semibold text-[#26372c]">Emergency event</p>
        <DetailRow icon={<FileText />} label="Local reference" value={event.reference} />
        <DetailRow icon={<CalendarDays />} label="Recorded" value={new Date(event.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
        <DetailRow icon={<MapPin />} label="Event location" value={event.location} />
        <ContactStatus
          name={primary?.name ?? "Primary contact not set"}
          status={primary ? acknowledged ? "Acknowledged" : "Awaiting acknowledgement…" : "No primary contact configured"}
          done={acknowledged}
        />
        {secondary && <ContactStatus name={secondary.name} status="Not notified" done={false} />}
        <p className="border-t border-[#e5ebe6] pt-3 text-[10px] leading-4 text-[#6a786f]">No emergency services have been contacted. No assistance dispatch is claimed.</p>
      </Panel>
      <Button onClick={onHome} variant="secondary" className="w-full">{homeLabel}</Button>
    </div>
  );
}

function SosHistoryScreen({ history, onSelect }: { history: SosEvent[]; onSelect: (event: SosEvent) => void }) {
  return (
    <div className="space-y-3 py-3">
      <div><h2 className="text-sm font-semibold text-[#18231d]">SOS history</h2><p className="mt-1 text-xs text-[#66736b]">Personal emergency alerts sent from this device.</p></div>
      {history.length ? (
        <section aria-label="SOS requests" className="overflow-hidden rounded-2xl border border-[#e1e8e2] bg-white">
          {history.map((event, index) => (
            <button key={event.reference} onClick={() => onSelect(event)} className={`flex min-h-[76px] w-full items-center gap-3 p-3 text-left hover:bg-[#f8faf8] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#087443] ${index ? "border-t border-[#edf1ed]" : ""}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff0ed] text-[#c53124]"><Siren className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1"><StatusPill tone={event.acknowledged ? "green" : "amber"}>{event.acknowledged ? "Acknowledged" : "Awaiting acknowledgement"}</StatusPill></span>
                <span className="mt-1 block break-all text-[13px] font-semibold text-[#18231d]">{event.reference}</span>
                <span className="mt-0.5 block break-words text-[11px] text-[#66736b]">{new Date(event.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} · {event.location}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#819087]" />
            </button>
          ))}
        </section>
      ) : <div className="rounded-2xl border border-dashed border-[#dfe7e0] px-4 py-8 text-center">
        <Siren className="mx-auto h-7 w-7 text-[#829087]" />
        <p className="mt-3 text-sm font-semibold text-[#35463c]">No SOS requests yet</p>
        <p className="mt-1 text-xs text-[#718078]">Personal emergency alerts you send will appear here.</p>
      </div>}
      <p className="text-center text-[11px] text-[#829087]">SOS history is held in this app session only.</p>
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

function ProfileScreen({
  profile,
  contactCount,
  sosHistoryCount,
  saved,
  onDismissSaved,
  onContacts,
  onEdit,
  onSosHistory,
  onSettings,
  onRestartSession,
}: {
  profile: StaffProfile;
  contactCount: number;
  sosHistoryCount: number;
  saved: boolean;
  onDismissSaved: () => void;
  onContacts: () => void;
  onEdit: () => void;
  onSosHistory: () => void;
  onSettings: () => void;
  onRestartSession: () => void;
}) {
  const initials = profile.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <div className="space-y-3 py-3">
      {saved && <div role="status" className="flex items-center justify-between rounded-xl border border-[#d9ebdd] bg-[#eff8f0] px-3 py-2 text-xs text-[#20583a]">
        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Profile details saved for this session.</span>
        <button onClick={onDismissSaved} aria-label="Dismiss saved message" className="rounded p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087443]"><X className="h-4 w-4" /></button>
      </div>}
      <section className="rounded-2xl border border-[#e1e8e2] bg-white p-4">
        <div className="flex min-w-0 items-center gap-3">
          {profile.profilePhoto
            ? <Image unoptimized src={profile.profilePhoto} alt={`${profile.fullName} profile`} width={56} height={56} className="h-14 w-14 shrink-0 rounded-full object-cover" />
            : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e8f5eb] text-lg font-semibold text-[#087443]">{initials || <UserRound className="h-6 w-6" />}</span>}
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-[#18231d]">{profile.fullName}</h2>
            <p className="mt-0.5 text-xs text-[#66736b]">{profile.role} · {profile.department}</p>
            <p className="mt-1 break-all text-xs text-[#66736b]">{profile.organizationEmail}</p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 border-t border-[#edf1ed] pt-3 text-xs text-[#52645a]">
          <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#087443]" />
          <span>Example staff information. Organization details are managed by NSIA and are read-only.</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#edf1ed] pt-3">
          <div className="min-w-0"><p className="text-[11px] text-[#66736b]">Employee ID</p><p className="mt-0.5 truncate text-xs font-medium text-[#26372c]">{profile.employeeId}</p></div>
          <div className="min-w-0"><p className="text-[11px] text-[#66736b]">Department</p><p className="mt-0.5 truncate text-xs font-medium text-[#26372c]">{profile.department}</p></div>
        </div>
      </section>
      <section aria-label="Profile actions" className="overflow-hidden rounded-2xl border border-[#e1e8e2] bg-white">
        <ProfileAction icon={ContactRound} title="Emergency contacts" description={contactCount > 0 ? `${contactCount} contacts on file` : "Complete your emergency contacts"} onClick={onContacts} />
        <ProfileAction icon={Pencil} title="Edit profile" description="Update personal contact details" onClick={onEdit} />
        <ProfileAction icon={Siren} title="SOS history" description={sosHistoryCount > 0 ? `${sosHistoryCount} request${sosHistoryCount === 1 ? "" : "s"} sent` : "No SOS requests yet"} onClick={onSosHistory} />
        <ProfileAction icon={Settings} title="Settings" description="Preferences, permissions and app information" onClick={onSettings} last />
      </section>
      <button onClick={onRestartSession} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#eff7e9] px-4 py-2.5 text-sm font-semibold text-[#087443] hover:bg-[#e7f2df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087443]">
        <RotateCcw className="h-4 w-4" />Start fresh session
      </button>
      <p className="text-center text-[11px] text-[#829087]">Example profile for demonstration.</p>
    </div>
  );
}

function ProfileAction({
  icon: Icon,
  title,
  description,
  onClick,
  last = false,
}: {
  icon: typeof Home;
  title: string;
  description: string;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <button onClick={onClick} className={`flex min-h-[64px] w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#f8faf8] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#087443] ${last ? "" : "border-b border-[#edf1ed]"}`}>
      <Icon className="h-5 w-5 shrink-0 text-[#087443]" strokeWidth={1.9} />
      <span className="min-w-0 flex-1"><span className="block text-[13px] font-medium text-[#18231d]">{title}</span><span className="mt-0.5 block truncate text-xs text-[#66736b]">{description}</span></span>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#819087]" />
    </button>
  );
}

function EditProfileScreen({
  profile,
  onCancel,
  onSave,
}: {
  profile: StaffProfile;
  onCancel: () => void;
  onSave: (profile: StaffProfile) => void;
}) {
  const [phone, setPhone] = useState(profile.phone);
  const [personalEmail, setPersonalEmail] = useState(profile.personalEmail);
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup ?? "");
  const [genotype, setGenotype] = useState(profile.genotype ?? "");
  const [gender, setGender] = useState(profile.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth ?? "");
  const [emergencyMedicalNotes, setEmergencyMedicalNotes] = useState(profile.emergencyMedicalNotes ?? "");
  const [profilePhoto, setProfilePhoto] = useState(profile.profilePhoto ?? "");
  const [errors, setErrors] = useState<{ phone?: string; personalEmail?: string; profilePhoto?: string }>({});
  const [saving, setSaving] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const isDirty = phone !== profile.phone
    || personalEmail !== profile.personalEmail
    || bloodGroup !== (profile.bloodGroup ?? "")
    || genotype !== (profile.genotype ?? "")
    || gender !== (profile.gender ?? "")
    || dateOfBirth !== (profile.dateOfBirth ?? "")
    || emergencyMedicalNotes !== (profile.emergencyMedicalNotes ?? "")
    || profilePhoto !== (profile.profilePhoto ?? "");
  const initials = profile.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  function cancel() {
    if (isDirty && !window.confirm("Discard your unsaved profile changes?")) return;
    onCancel();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: { phone?: string; personalEmail?: string } = {};
    if (!phone.trim()) nextErrors.phone = "Enter a phone number.";
    else if (!/^\+?[0-9 ()-]{7,20}$/.test(phone.trim())) nextErrors.phone = "Enter a valid phone number.";
    if (personalEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail.trim())) {
      nextErrors.personalEmail = "Enter a valid email address.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    window.setTimeout(() => onSave({
      ...profile,
      phone: phone.trim(),
      personalEmail: personalEmail.trim(),
      bloodGroup,
      genotype,
      gender,
      dateOfBirth,
      emergencyMedicalNotes: emergencyMedicalNotes.trim(),
      profilePhoto: profilePhoto || undefined,
    }), 350);
  }

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((previous) => ({ ...previous, profilePhoto: "Choose an image file." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({ ...previous, profilePhoto: "Choose an image smaller than 5 MB." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setErrors((previous) => ({ ...previous, profilePhoto: "The selected image could not be loaded." }));
        return;
      }
      setProfilePhoto(reader.result);
      setErrors((previous) => ({ ...previous, profilePhoto: undefined }));
    };
    reader.onerror = () => {
      setErrors((previous) => ({ ...previous, profilePhoto: "The selected image could not be loaded." }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={submit} className="space-y-3 py-3">
      <section className="flex items-center gap-4 rounded-2xl border border-[#e1e8e2] bg-white p-3.5">
        <div className="shrink-0">
          {profilePhoto
            ? <Image unoptimized src={profilePhoto} alt={`${profile.fullName} profile`} width={88} height={88} className="h-[88px] w-[88px] rounded-full object-cover" />
            : <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#e8edf1] text-xl font-semibold text-[#087443]">{initials || <UserRound className="h-7 w-7" />}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-[#19342f]">Profile photo</h2>
          <p className="mt-1 text-xs text-[#718078]">Use a clear photo of yourself.</p>
          <input ref={photoInput} type="file" accept="image/*" className="sr-only" onChange={selectPhoto} aria-label="Choose profile photo" />
          <button type="button" onClick={() => photoInput.current?.click()} disabled={saving} className="mt-2.5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#eff8e9] px-3.5 text-xs font-semibold text-[#087443] hover:bg-[#e6f3dc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087443]">
            <Camera className="h-4 w-4" />Change photo
          </button>
          {errors.profilePhoto && <p role="alert" className="mt-1 text-[11px] text-[#b42318]">{errors.profilePhoto}</p>}
        </div>
      </section>
      <section className="rounded-2xl bg-[#f0f7ec] p-3.5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#087443]"><LockKeyhole className="h-5 w-5" /></span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#19342f]">Organization details</h2>
            <p className="mt-0.5 text-xs leading-4 text-[#718078]">Managed by NSIA; contact your administrator to update these details.</p>
          </div>
        </div>
        <div className="mt-3 rounded-2xl bg-white/80 px-3.5">
          <ReadOnlyProfileField label="Full name" value={profile.fullName} />
          <ReadOnlyProfileField label="Employee ID" value={profile.employeeId} />
          <ReadOnlyProfileField label="Department" value={profile.department} />
          <ReadOnlyProfileField label="Role" value={profile.role} />
          <ReadOnlyProfileField label="Work email" value={profile.organizationEmail} />
        </div>
      </section>
      <section className="space-y-3 rounded-2xl border border-[#e1e8e2] bg-white p-3.5">
        <h2 className="flex items-center gap-2.5 text-sm font-semibold text-[#19342f]"><UserRound className="h-5 w-5 text-[#087443]" />Personal and emergency information</h2>
        <ProfileInputField label="Phone number" required error={errors.phone} icon={Phone}>
          <input type="tel" autoComplete="tel" value={phone} onChange={(event) => { setPhone(event.target.value); setErrors((previous) => ({ ...previous, phone: undefined })); }} className={profileInputClass(Boolean(errors.phone))} />
        </ProfileInputField>
        <ProfileInputField label="Personal email (optional)" error={errors.personalEmail} icon={Mail}>
          <input type="email" autoComplete="email" value={personalEmail} onChange={(event) => { setPersonalEmail(event.target.value); setErrors((previous) => ({ ...previous, personalEmail: undefined })); }} className={profileInputClass(Boolean(errors.personalEmail))} />
        </ProfileInputField>
        <div className="grid grid-cols-2 gap-2.5">
          <ProfileInputField label="Blood group" icon={Droplet}>
            <select value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)} className={profileInputClass()}>
              <option value="">Select blood group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((value) => <option key={value}>{value}</option>)}
            </select>
          </ProfileInputField>
          <ProfileInputField label="Genotype" icon={Dna}>
            <select value={genotype} onChange={(event) => setGenotype(event.target.value)} className={profileInputClass()}>
              <option value="">Select genotype</option>
              {["AA", "AS", "SS", "AC", "SC"].map((value) => <option key={value}>{value}</option>)}
            </select>
          </ProfileInputField>
          <ProfileInputField label="Gender" icon={UserRound}>
            <select value={gender} onChange={(event) => setGender(event.target.value)} className={profileInputClass()}>
              <option value="">Select gender</option>
              {["Female", "Male", "Prefer not to say"].map((value) => <option key={value}>{value}</option>)}
            </select>
          </ProfileInputField>
          <ProfileInputField label="Date of birth" icon={CalendarDays}>
            <input type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} className={profileInputClass()} />
          </ProfileInputField>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#24352b]">Emergency medical notes (optional)</span>
          <span className="relative block">
            <FileText className="absolute left-3 top-3.5 h-4 w-4 text-[#52645a]" />
            <textarea value={emergencyMedicalNotes} onChange={(event) => setEmergencyMedicalNotes(event.target.value.slice(0, 500))} maxLength={500} rows={3} placeholder="Only include information relevant to emergency care." className={`${profileInputClass()} min-h-[84px] resize-y py-3 pl-10`} />
          </span>
          <span className="mt-1 block text-right text-[10px] text-[#718078]">{emergencyMedicalNotes.length}/500</span>
        </label>
        <p className="text-[10px] leading-4 text-[#718078]">Personal and medical details are held only in this app session.</p>
        <div className="space-y-2 border-t border-[#edf1ed] pt-3">
          <Button type="submit" disabled={saving} className="w-full rounded-xl bg-[#087443]">{saving ? <><LoaderCircle className="h-4 w-4 animate-spin" />Saving changes</> : "Save changes"}</Button>
          <Button variant="quiet" onClick={cancel} disabled={saving} className="w-full">Cancel</Button>
        </div>
      </section>
    </form>
  );
}

function ReadOnlyProfileField({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] items-center gap-3 border-b border-[#e9eeea] py-2.5 last:border-b-0">
    <span className="text-xs text-[#66736b]">{label}</span>
    <span className="min-w-0 break-all text-xs font-medium text-[#35463c]">{value}</span>
  </div>;
}

function ProfileInputField({ label, required, error, icon: Icon, children }: {
  label: string;
  required?: boolean;
  error?: string;
  icon: typeof Home;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[13px] font-medium text-[#24352b]">{label}{required && <span className="ml-1 text-[#c03228]">*</span>}</span>
      <span className="relative block">
        <Icon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#52645a]" />
        {children}
      </span>
      {error && <span role="alert" className="mt-1 block text-xs text-[#b42318]">{error}</span>}
    </label>
  );
}

function profileInputClass(error = false) {
  return `h-[50px] w-full min-w-0 rounded-xl border ${error ? "border-[#d92d20]" : "border-[#dfe7e0]"} bg-white py-2.5 pl-10 pr-2 text-xs text-[#35463c] placeholder:text-[#a0aaa3] focus:border-[#087443] focus:outline-none focus:ring-2 focus:ring-[#087443]/15`;
}

function SettingsScreen({
  onNotifications,
  onPermissions,
  onOpenInfo,
}: {
  onNotifications: () => void;
  onPermissions: () => void;
  onOpenInfo: (title: string, description: string) => void;
}) {
  return (
    <div className="space-y-4 py-3">
      <section aria-label="Settings" className="overflow-hidden rounded-2xl border border-[#e1e8e2] bg-white">
        <ProfileAction icon={Bell} title="Notification settings" description="Manage alert and update preferences" onClick={onNotifications} />
        <ProfileAction icon={ShieldCheck} title="Permissions" description="Location, camera and device access" onClick={onPermissions} />
        <ProfileAction icon={FileText} title="Privacy & terms" description="How ICE uses your information" onClick={() => onOpenInfo("Privacy & terms", "Privacy information and terms are not available in this app yet.")} />
        <ProfileAction icon={CircleHelp} title="Help & support" description="Guidance and contact information" onClick={() => onOpenInfo("Help & support", "Help and support information is not available in this app yet.")} />
        <ProfileAction icon={LockKeyhole} title="Security & sign-in" description="Organization account and session" onClick={() => onOpenInfo("Security & sign-in", "Account security options are not available in this app yet. Sign-in is currently a visual flow only.")} last />
      </section>
      <section className="rounded-2xl border border-[#e1e8e2] bg-white p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#35463c]"><Info className="h-4 w-4 text-[#087443]" />App information</div>
        <div className="mt-3 flex items-center justify-between text-xs"><span className="text-[#66736b]">Application</span><span className="font-medium text-[#35463c]">ICE</span></div>
        <div className="mt-2 flex items-center justify-between text-xs"><span className="text-[#66736b]">Version</span><span className="font-medium text-[#35463c]">2.0</span></div>
      </section>
    </div>
  );
}

function NotificationSettingsScreen({
  preferences,
  onChange,
}: {
  preferences: NotificationPreferences;
  onChange: (preferences: NotificationPreferences) => void;
}) {
  const [pushPermission, setPushPermission] = useState<PushPermission>("checking");
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);

  useEffect(() => {
    const updatePermission = () => {
      if (!("Notification" in window)) {
        setPushPermission("unavailable");
        return;
      }
      setPushPermission(window.Notification.permission);
    };
    const timer = window.setTimeout(updatePermission, 0);
    window.addEventListener("focus", updatePermission);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", updatePermission);
    };
  }, []);

  const pushStatus: Record<PushPermission, string> = {
    checking: "Checking device permission",
    granted: "Allowed by browser",
    denied: "Blocked by browser",
    default: "Not yet allowed",
    unavailable: "Not available in this browser",
  };

  return (
    <div className="space-y-4 py-3">
      <p className="text-sm font-semibold text-[#18231d]">Choose how ICE keeps you informed</p>
      <section className="overflow-hidden rounded-2xl border border-[#e1e8e2] bg-white">
        <div className="border-b border-[#edf1ed] bg-[#fffaf1] p-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#b42318]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h2 className="text-[13px] font-semibold text-[#18231d]">Critical safety alerts</h2><StatusPill tone="amber">Required</StatusPill></div>
              <p className="mt-1 text-xs leading-4 text-[#66736b]">High-risk alerts remain enabled under organization policy.</p>
            </div>
            <LockKeyhole aria-label="Required and locked" className="mt-0.5 h-4 w-4 shrink-0 text-[#66736b]" />
          </div>
        </div>
        <NotificationToggleRow title="Incident updates" description="Updates on your reports and ongoing situations." checked={preferences.incidentUpdates} onChange={(checked) => onChange({ ...preferences, incidentUpdates: checked })} />
        <NotificationToggleRow title="General safety information" description="Safety tips and awareness messages." checked={preferences.safetyInformation} onChange={(checked) => onChange({ ...preferences, safetyInformation: checked })} />
        <div className="flex items-center gap-3 border-t border-[#edf1ed] p-3">
          <BellRing className="h-5 w-5 shrink-0 text-[#087443]" />
          <div className="min-w-0 flex-1"><p className="text-[13px] font-medium text-[#18231d]">System notices</p><p className="mt-0.5 text-xs text-[#66736b]">Important app updates and service announcements.</p></div>
          <span className="text-xs font-medium text-[#087443]">On</span>
        </div>
      </section>
      <section className="rounded-2xl border border-[#e1e8e2] bg-white p-3">
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[#087443]" />
          <div className="min-w-0 flex-1">
            <h2 className="text-[13px] font-semibold text-[#18231d]">Device push notifications</h2>
            <p className="mt-1 text-xs text-[#66736b]">{pushStatus[pushPermission]}</p>
          </div>
          {pushPermission === "granted" && <CheckCircle2 aria-label="Permission allowed" className="h-4 w-4 shrink-0 text-[#087443]" />}
        </div>
        <p className="mt-2 text-xs leading-4 text-[#66736b]">Your device or browser controls this permission. ICE push delivery is not configured here.</p>
        <button type="button" aria-expanded={showPermissionHelp} onClick={() => setShowPermissionHelp((value) => !value)} className="mt-2 min-h-10 rounded-lg px-2 text-xs font-semibold text-[#087443] hover:bg-[#f1f7f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087443]">
          {showPermissionHelp ? "Hide permission help" : "How to change device permission"}
        </button>
        {showPermissionHelp && <p className="rounded-lg bg-[#f1f7f2] p-2.5 text-xs leading-4 text-[#52645a]">Open this site&apos;s settings from your browser or device notification controls to change permission. This app cannot change operating-system settings.</p>}
      </section>
      <p className="flex items-start gap-2 text-xs leading-4 text-[#52645a]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#087443]" />Critical safety alerts are required and cannot be turned off here.</p>
    </div>
  );
}

function NotificationToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-[68px] cursor-pointer items-center gap-3 border-b border-[#edf1ed] p-3 last:border-b-0">
      <span className="min-w-0 flex-1"><span className="block text-[13px] font-medium text-[#18231d]">{title}</span><span className="mt-0.5 block text-xs leading-4 text-[#66736b]">{description}</span></span>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} aria-label={title} className="peer sr-only" />
      <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-[#cbd4cd] transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-[#087443] peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#087443]" />
    </label>
  );
}

function PermissionsScreen() {
  const [locationPermission, setLocationPermission] = useState<"checking" | "granted" | "denied" | "prompt" | "unavailable">("checking");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (!navigator.permissions) {
        setLocationPermission("unavailable");
        return;
      }
      void navigator.permissions.query({ name: "geolocation" })
        .then((permission) => {
          if (active) setLocationPermission(permission.state);
        })
        .catch(() => {
          if (active) setLocationPermission("unavailable");
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const locationStatus: Record<typeof locationPermission, string> = {
    checking: "Checking browser permission",
    granted: "Allowed in browser",
    denied: "Blocked in browser",
    prompt: "Not yet allowed",
    unavailable: "Browser permission status unavailable",
  };

  return (
    <div className="space-y-3 py-3">
      <section className="rounded-2xl border border-[#e1e8e2] bg-white p-4">
        <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#087443]" /><h2 className="text-sm font-semibold text-[#18231d]">Device permissions</h2></div>
        <div className="mt-4 flex items-center gap-3 border-t border-[#edf1ed] pt-3">
          <MapPin className="h-5 w-5 shrink-0 text-[#087443]" />
          <div className="min-w-0 flex-1"><p className="text-[13px] font-medium text-[#18231d]">Location</p><p aria-live="polite" className="mt-0.5 text-xs text-[#66736b]">{locationStatus[locationPermission]}</p></div>
        </div>
        <p className="mt-2 pl-8 text-xs leading-4 text-[#66736b]">ICE currently uses a demonstration location and does not request your location.</p>
        <p className="mt-3 text-xs leading-5 text-[#66736b]">Permissions are controlled by your browser or device. ICE does not currently request location or camera access.</p>
        <p className="mt-2 text-xs leading-5 text-[#66736b]">You can review or change permissions in your browser&apos;s site settings.</p>
      </section>
    </div>
  );
}

function SettingsInfoScreen({ description }: { description: string }) {
  return (
    <div className="py-3">
      <section className="rounded-2xl border border-[#e1e8e2] bg-white p-4">
        <p className="text-sm leading-6 text-[#52645a]">{description}</p>
      </section>
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
      <Panel className="flex items-start gap-2.5 bg-[#eff8f0] p-3 text-[11px] leading-4 text-[#52645a]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#087443]" /><p>Emergency contacts are stored in this app session. Contacts do not need an ICE account.</p></Panel>
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

function FirstLoginWelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="relative isolate flex min-h-full flex-col items-center justify-center overflow-hidden px-6 py-10 text-center text-white">
      <div aria-hidden="true" className="absolute -inset-3 -z-20 bg-cover bg-center blur-[8px]" style={{ backgroundImage: "url('/images/bg%20image%20nsia.png')" }} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-[#062b1d]/70 via-[#063b27]/75 to-[#031b12]/90" />
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm">
        <ShieldCheck aria-hidden="true" className="h-10 w-10" strokeWidth={1.7} />
      </span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-white/85">ICE · NSIA</p>
      <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-white">Welcome, Mike!</h1>
      <p className="mt-3 max-w-[300px] text-sm leading-6 text-white/90">Your ICE workspace is ready. View safety alerts, report incidents, and manage your emergency contacts here.</p>
      <Button onClick={onContinue} className="mt-8 w-full border border-white/20 bg-white !text-[#087443] hover:bg-[#f2f7f3]">
        Continue to ICE<ChevronRight className="h-4 w-4" />
      </Button>
    </section>
  );
}

function MicrosoftSignInScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <section
      className="relative flex min-h-full flex-col justify-between overflow-hidden bg-cover bg-center px-6 pb-[calc(16px+env(safe-area-inset-bottom))] pt-[calc(28px+env(safe-area-inset-top))] text-white"
      style={{ backgroundImage: "url('/images/bg%20image%20nsia.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#062b1d]/45 via-[#063b27]/55 to-[#031b12]/90" aria-hidden="true" />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-8 text-center">
        <Image
          src="/images/ice-logo-removed-bg.png"
          alt="ICE"
          width={88}
          height={88}
          priority
          className="h-auto w-[min(120px,32vw)] object-contain"
        />
        <h1 className="mt-8 text-[28px] font-semibold tracking-[-0.03em] text-white">Sign in to ICE</h1>
        <p className="mt-3 max-w-[300px] text-sm leading-6 text-white/90">Continue with your NSIA organizational account.</p>
        <button
          onClick={onContinue}
          className="mt-8 flex min-h-[56px] w-full items-center gap-3 rounded-2xl bg-white px-4 text-left text-[15px] font-semibold text-[#26372c] shadow-lg shadow-black/20 transition-colors hover:bg-[#f2f7f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <MicrosoftMark />
          <span className="flex-1 text-center">Continue with Microsoft</span>
          <ChevronRight className="h-4 w-4 text-[#718078]" />
        </button>
        <p className="mt-5 max-w-[300px] text-xs leading-5 text-white/85">Sign-in is a visual flow only. No organizational account is being authenticated.</p>
      </div>
      <p className="relative z-10 pt-3 text-center text-xs font-medium tracking-wide text-white/90">Powered by Techspecialist</p>
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

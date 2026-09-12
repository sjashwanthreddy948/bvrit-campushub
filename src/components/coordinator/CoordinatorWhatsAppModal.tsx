"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Send,
  Smartphone,
  Users,
  RotateCcw,
  Building,
} from "lucide-react";
import {
  createWhatsAppShareUrl,
  buildCoordinatorBroadcastWhatsAppReminder,
  buildCoordinatorSectionWhatsAppReminder,
} from "@/lib/share/whatsapp";
import { OpportunityCoordinatorData } from "@/lib/coordinator/actions";
import {
  COLLEGE_DEPARTMENTS,
  ALL_COLLEGE_SECTIONS,
} from "@/lib/coordinator/constants";

export interface CoordinatorWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: OpportunityCoordinatorData | null;
  initialSectionKey?: string; // e.g. "all" or "CSE-A"
}

export function CoordinatorWhatsAppModal({
  isOpen,
  onClose,
  opportunity,
  initialSectionKey = "all",
}: CoordinatorWhatsAppModalProps) {
  const [targetMode, setTargetMode] = React.useState<"broadcast" | "section">(
    initialSectionKey === "all" ? "broadcast" : "section"
  );
  const [selectedDept, setSelectedDept] = React.useState<string>("CSE");
  const [selectedSection, setSelectedSection] = React.useState<string>(
    initialSectionKey === "all" ? "CSE-A" : initialSectionKey
  );
  const [customText, setCustomText] = React.useState<string>("");
  const [isEdited, setIsEdited] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Sync state when modal opens or initialSectionKey changes
  React.useEffect(() => {
    if (isOpen) {
      if (initialSectionKey === "all") {
        setTargetMode("broadcast");
      } else {
        setTargetMode("section");
        setSelectedSection(initialSectionKey);
        const dept = initialSectionKey.split("-")[0];
        if (COLLEGE_DEPARTMENTS.some((d) => d.code === dept)) {
          setSelectedDept(dept);
        }
      }
      setIsEdited(false);
      setCustomText("");
    }
  }, [isOpen, initialSectionKey]);

  // Compute live breakdown based on current selection
  const liveStats = React.useMemo(() => {
    if (!opportunity) {
      return { total: 0, applied: 0, notApplied: 0, rate: 0 };
    }

    if (targetMode === "broadcast") {
      return {
        total: opportunity.totalEligible,
        applied: opportunity.totalApplied,
        notApplied: opportunity.totalNotApplied,
        rate: opportunity.overallParticipationRate,
      };
    }

    const sec = opportunity.sections[selectedSection];
    if (sec) {
      return {
        total: sec.totalStudents,
        applied: sec.appliedCount,
        notApplied: sec.notAppliedCount,
        rate: sec.participationRate,
      };
    }

    return { total: 0, applied: 0, notApplied: 0, rate: 0 };
  }, [opportunity, targetMode, selectedSection]);

  // Generate appropriate reminder template
  const defaultText = React.useMemo(() => {
    if (!opportunity) return "";
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://campushub.edu";

    if (targetMode === "broadcast") {
      return buildCoordinatorBroadcastWhatsAppReminder({
        opportunity,
        totalEligible: opportunity.totalEligible,
        totalApplied: opportunity.totalApplied,
        totalNotApplied: opportunity.totalNotApplied,
        overallParticipationRate: opportunity.overallParticipationRate,
        origin,
      });
    }

    const secBreakdown = opportunity.sections[selectedSection] || {
      sectionName: selectedSection,
      totalStudents: opportunity.totalEligible,
      appliedCount: opportunity.totalApplied,
      notAppliedCount: opportunity.totalNotApplied,
      participationRate: opportunity.overallParticipationRate,
      appliedStudents: [],
      notAppliedStudents: [],
    };

    return buildCoordinatorSectionWhatsAppReminder({
      opportunity,
      sectionKey: selectedSection,
      breakdown: secBreakdown,
      origin,
    });
  }, [opportunity, targetMode, selectedSection]);

  // Final text to share
  const activeText = isEdited ? customText : defaultText;

  const handleCopy = () => {
    if (typeof window !== "undefined" && activeText) {
      navigator.clipboard.writeText(activeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!activeText) return;
    const url = createWhatsAppShareUrl(activeText);
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    onClose();
  };

  const handleResetText = () => {
    setIsEdited(false);
    setCustomText("");
  };

  if (!opportunity) return null;

  // Filter sections for the selected department
  const activeDeptConfig = COLLEGE_DEPARTMENTS.find((d) => d.code === selectedDept);
  const currentDeptSections = activeDeptConfig ? activeDeptConfig.sections : ALL_COLLEGE_SECTIONS;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="TPO WhatsApp Reminder Dispatch"
      description={`Broadcast to all eligible branches or target specific class cohorts for ${opportunity.company}.`}
      size="lg"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            className="min-h-[44px]"
          >
            {copied ? "Copied to Clipboard!" : "Copy Reminder Text"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              className="min-h-[44px]"
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleOpenWhatsApp}
              leftIcon={<Send className="h-4 w-4" />}
              rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white min-h-[44px] shadow-sm font-semibold"
            >
              Open in WhatsApp
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Drive Header Chip */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                {opportunity.company}
              </span>
              <Badge variant={opportunity.type === "internship" ? "purple" : "blue"} size="sm">
                {opportunity.type}
              </Badge>
              <Badge
                variant={
                  opportunity.daysRemaining <= 1
                    ? "danger"
                    : opportunity.daysRemaining <= 3
                    ? "warning"
                    : "secondary"
                }
                size="sm"
              >
                {opportunity.daysRemaining <= 1 ? "Closing Tomorrow" : `Due in ${opportunity.daysRemaining} days`}
              </Badge>
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {opportunity.title}
            </p>
          </div>

          <div className="text-right shrink-0">
            {opportunity.stipend || opportunity.package ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                💰 {opportunity.stipend || opportunity.package}
              </span>
            ) : null}
            <span className="text-[11px] text-slate-500">BVRIT Placement Cell</span>
          </div>
        </div>

        {/* 1. Target Audience Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              Target Audience
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              {targetMode === "broadcast"
                ? "Sends to CR groups of all eligible branches"
                : `Targeting section: ${selectedSection}`}
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setTargetMode("broadcast");
                setIsEdited(false);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer ${
                targetMode === "broadcast"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>All Eligible Branches (Broadcast)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTargetMode("section");
                setIsEdited(false);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer ${
                targetMode === "section"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Building className="h-3.5 w-3.5" />
              <span>Specific Section (CR &amp; Cohort)</span>
            </button>
          </div>
        </div>

        {/* 2. Specific Section Selector (when targetMode === "section") */}
        {targetMode === "section" && (
          <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3">
            {/* Department Filter Tabs */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                1. Select Branch / Department:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLLEGE_DEPARTMENTS.map((dept) => (
                  <button
                    key={dept.code}
                    type="button"
                    onClick={() => {
                      setSelectedDept(dept.code);
                      const firstSec = dept.sections[0] || "CSE-A";
                      setSelectedSection(firstSec);
                      setIsEdited(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedDept === dept.code
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400"
                    }`}
                  >
                    {dept.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Pills for Selected Department */}
            <div className="space-y-1.5 pt-1 border-t border-blue-100 dark:border-blue-900/40">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                2. Select Section in {selectedDept}:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {currentDeptSections.map((secKey) => {
                  const secData = opportunity.sections[secKey];
                  const isSelected = selectedSection === secKey;
                  const applied = secData ? secData.appliedCount : 0;
                  const total = secData ? secData.totalStudents : 8;

                  return (
                    <button
                      key={secKey}
                      type="button"
                      onClick={() => {
                        setSelectedSection(secKey);
                        setIsEdited(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400"
                          : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-emerald-400"
                      }`}
                    >
                      <span>{secKey}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                          isSelected
                            ? "bg-emerald-700 text-emerald-100"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {applied}/{total}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. Live Turnout Status Banner */}
        <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-emerald-900 dark:text-emerald-300 block truncate">
                {targetMode === "broadcast"
                  ? "All 27 College Sections (BVRIT Broadcaster)"
                  : `Class Cohort: Section ${selectedSection}`}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                {liveStats.applied} Registered • {liveStats.notApplied} Pending ({liveStats.rate}% Participation)
              </span>
            </div>
          </div>

          <Badge variant="success" size="sm" className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-300">
            {liveStats.applied}/{liveStats.total}
          </Badge>
        </div>

        {/* 4. WhatsApp Message Preview & Edit Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-slate-400" />
              <span>Prepared WhatsApp Broadcast Message</span>
            </label>
            {isEdited && (
              <button
                type="button"
                onClick={handleResetText}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Reset Template
              </button>
            )}
          </div>

          <textarea
            rows={9}
            value={activeText}
            onChange={(e) => {
              setCustomText(e.target.value);
              setIsEdited(true);
            }}
            placeholder="Prepared WhatsApp message..."
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner resize-y"
          />

          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>ℹ️</span> You can edit or add notes above before clicking &quot;Open in WhatsApp&quot;.
          </p>
        </div>
      </div>
    </Modal>
  );
}

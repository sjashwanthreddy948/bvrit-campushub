"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Building,
  Plus,
  Search,
  Filter,
  Share2,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  Send,
  Sparkles,
  MapPin,
  Briefcase,
} from "lucide-react";
import {
  PlacementActivity,
  PlacementActivityType,
  PlacementActivityStatus,
  ALL_ACTIVITY_TYPES,
  ALL_ACTIVITY_STATUSES,
} from "@/lib/placements/types";
import {
  getAllPlacementActivitiesAction,
  createPlacementActivityAction,
  updatePlacementActivityAction,
  deletePlacementActivityAction,
  generatePlacementActivityWhatsAppAction,
} from "@/lib/placements/actions";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export function TpoActivitiesManager() {
  const [activities, setActivities] = React.useState<PlacementActivity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [successBanner, setSuccessBanner] = React.useState<string | null>(null);

  // Form Fields
  const [companyName, setCompanyName] = React.useState("");
  const [companyLogo, setCompanyLogo] = React.useState("");
  const [companyWebsite, setCompanyWebsite] = React.useState("");
  const [role, setRole] = React.useState("");
  const [employmentType, setEmploymentType] = React.useState<"Full-Time" | "Internship" | "Internship + PPO">("Full-Time");
  const [packageCtc, setPackageCtc] = React.useState("");
  const [stipend, setStipend] = React.useState("");
  const [location, setLocation] = React.useState("Hyderabad, Telangana");
  const [workMode, setWorkMode] = React.useState<"On-site" | "Hybrid" | "Remote">("Hybrid");
  const [eligibleDepartments, setEligibleDepartments] = React.useState("CSE, CSM, CSD, AIDS, ECE");
  const [eligibleYears, setEligibleYears] = React.useState("3, 4");
  const [minCgpa, setMinCgpa] = React.useState("7.5");
  const [otherRequirements, setOtherRequirements] = React.useState("");
  const [requiredSkills, setRequiredSkills] = React.useState("Python, DSA, SQL");
  const [preferredSkills, setPreferredSkills] = React.useState("");
  const [activityType, setActivityType] = React.useState<PlacementActivityType>("Company Visit / Placement Drive");
  const [activityDate, setActivityDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = React.useState("10:00 AM");
  const [endTime, setEndTime] = React.useState("05:00 PM");
  const [venue, setVenue] = React.useState("BVRIT Main Auditorium");
  const [meetingLink, setMeetingLink] = React.useState("");
  const [instructions, setInstructions] = React.useState("Arrive on time with college ID card and 2 resume copies.");
  const [registrationLink, setRegistrationLink] = React.useState("");

  // WhatsApp Broadcast Modal State
  const [whatsAppModalOpen, setWhatsAppModalOpen] = React.useState(false);
  const [broadcastText, setBroadcastText] = React.useState("");
  const [broadcastUrl, setBroadcastUrl] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPlacementActivitiesAction();
      setActivities(data);
    } catch (err) {
      console.error("Failed to load placement activities:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenWhatsAppModal = async (actId: string) => {
    try {
      const res = await generatePlacementActivityWhatsAppAction(actId);
      if (res.success && res.text && res.encodedUrl) {
        setBroadcastText(res.text);
        setBroadcastUrl(res.encodedUrl);
        setCopied(false);
        setWhatsAppModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to generate WhatsApp broadcast:", err);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(broadcastText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleStatusChange = async (actId: string, newStatus: PlacementActivityStatus) => {
    try {
      const res = await updatePlacementActivityAction(actId, { status: newStatus });
      if (res.success) {
        setActivities((prev) =>
          prev.map((a) => (a.id === actId ? { ...a, status: newStatus } : a))
        );
        setSuccessBanner(`Updated activity status to "${newStatus}"`);
        setTimeout(() => setSuccessBanner(null), 5000);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDeleteActivity = async (actId: string) => {
    if (!confirm("Are you sure you want to delete this placement activity?")) return;
    try {
      const res = await deletePlacementActivityAction(actId);
      if (res.success) {
        setActivities((prev) => prev.filter((a) => a.id !== actId));
      }
    } catch (err) {
      console.error("Failed to delete activity:", err);
    }
  };

  const handleSaveActivity = async (targetStatus: "Draft" | "Published") => {
    setCreateError(null);

    if (!companyName.trim()) {
      setCreateError("Company Name is required.");
      return;
    }
    if (!role.trim()) {
      setCreateError("Role Title is required.");
      return;
    }
    if (!activityDate) {
      setCreateError("Activity Date is required.");
      return;
    }
    if (!startTime.trim()) {
      setCreateError("Start Time is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const depts = eligibleDepartments
        ? eligibleDepartments.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
        : ["ALL"];
      const years = eligibleYears
        ? eligibleYears.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n))
        : [3, 4];
      const reqSkills = requiredSkills
        ? requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
        : ["Problem Solving"];
      const prefSkills = preferredSkills
        ? preferredSkills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const res = await createPlacementActivityAction({
        companyName: companyName.trim(),
        companyLogo: companyLogo.trim() || undefined,
        companyWebsite: companyWebsite.trim() || undefined,
        role: role.trim(),
        employmentType,
        packageCtc: packageCtc.trim() || undefined,
        stipend: stipend.trim() || undefined,
        location: location.trim() || "Hyderabad, Telangana",
        workMode,
        eligibleDepartments: depts,
        eligibleYears: years,
        minCgpa: parseFloat(minCgpa) || 7.0,
        otherRequirements: otherRequirements.trim() || undefined,
        requiredSkills: reqSkills,
        preferredSkills: prefSkills,
        importantPreparationSkills: reqSkills.slice(0, 3),
        activityType,
        date: activityDate,
        startTime: startTime.trim(),
        endTime: endTime.trim() || undefined,
        venue: venue.trim() || "Main Auditorium",
        meetingLink: meetingLink.trim() || undefined,
        selectionRounds: ["Written Assessment", "Technical Interview", "HR Discussion"],
        instructions: instructions.trim() || "Please verify official placement eligibility requirements before participating.",
        attachments: [],
        registrationLink: registrationLink.trim() || undefined,
        status: targetStatus,
        createdBy: "coord-tpo",
      });

      if (!res.success || !res.activity) {
        setCreateError(res.error || "Failed to save placement activity.");
        setIsSubmitting(false);
        return;
      }

      setShowCreateModal(false);
      resetForm();
      setSuccessBanner(
        targetStatus === "Published"
          ? `Successfully published "${res.activity.companyName} — ${res.activity.role}"! It is now live on the Student Dashboard.`
          : `Saved "${res.activity.companyName}" as Draft. It remains hidden from students until published.`
      );
      await loadData();
      setTimeout(() => setSuccessBanner(null), 8000);
    } catch (err: any) {
      console.error("Failed to save activity:", err);
      setCreateError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCompanyName("");
    setCompanyLogo("");
    setCompanyWebsite("");
    setRole("");
    setPackageCtc("");
    setStipend("");
    setRegistrationLink("");
    setMeetingLink("");
    setCreateError(null);
  };

  const filtered = activities.filter((act) => {
    const matchesSearch =
      act.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.venue.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || act.status === statusFilter;
    const matchesType = typeFilter === "all" || act.activityType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: PlacementActivityStatus) => {
    switch (status) {
      case "Published":
      case "Updated":
        return <Badge variant="success">{status}</Badge>;
      case "Draft":
        return <Badge variant="secondary">Draft (Hidden)</Badge>;
      case "Cancelled":
        return <Badge variant="danger">Cancelled</Badge>;
      case "Completed":
        return <Badge variant="purple">Completed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Success Notification */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Control Bar: Search, Filters, and New Activity Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search companies, roles, venues..."
              className="pl-9 h-10 rounded-xl text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1B1C22] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50"
          >
            <option value="all">All Statuses ({ALL_ACTIVITY_STATUSES.length})</option>
            {ALL_ACTIVITY_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1B1C22] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 hidden md:block"
          >
            <option value="all">All Types</option>
            {ALL_ACTIVITY_TYPES.map((tp) => (
              <option key={tp} value={tp}>
                {tp}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>New Placement Activity</span>
        </Button>
      </div>

      {/* Activities Listing */}
      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">
          Loading official placement schedules...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500 border border-dashed rounded-2xl">
          No placement activities found matching your criteria.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((act) => {
            const isToday = act.date === new Date().toISOString().slice(0, 10);
            const formattedDate = new Date(act.date).toLocaleDateString("en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            return (
              <Card
                key={act.id}
                className={`border-slate-200 dark:border-slate-800 hover:border-[#F59E0B]/60 transition-all ${
                  isToday ? "ring-1 ring-[#F59E0B]/40 bg-[#FFF5F4]/10 dark:bg-[#231A1B]/10" : ""
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#2A2B33] border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-base text-slate-700 dark:text-slate-200 shrink-0 overflow-hidden">
                      {act.companyLogo ? (
                        <img
                          src={act.companyLogo}
                          alt={act.companyName}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        act.companyName.slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100 truncate">
                          {act.companyName}
                        </h4>
                        {isToday && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#F59E0B] text-white">
                            Today
                          </span>
                        )}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {act.activityType}
                        </span>
                        {getStatusBadge(act.status)}
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {act.role} {act.packageCtc && `• ${act.packageCtc}`}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#F59E0B]">
                          <Clock className="h-3.5 w-3.5" /> {formattedDate} at {act.startTime}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {act.venue}
                        </span>
                        <span>
                          🎓 {act.eligibleDepartments.join(", ")} ({act.minCgpa.toFixed(1)}+ CGPA)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Control */}
                  <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
                    {/* Status Dropdown */}
                    <select
                      value={act.status}
                      onChange={(e) =>
                        handleStatusChange(act.id, e.target.value as PlacementActivityStatus)
                      }
                      className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1B1C22] text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      {ALL_ACTIVITY_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>

                    {/* WhatsApp Announcement */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenWhatsAppModal(act.id)}
                      className="rounded-xl text-xs gap-1 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </Button>

                    {/* View Details Link */}
                    <Link href={`/placements/activities/${act.id}`}>
                      <Button size="sm" variant="outline" className="rounded-xl text-xs">
                        View
                      </Button>
                    </Link>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteActivity(act.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete activity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE PLACEMENT ACTIVITY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#1B1C22] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  New Placement Activity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Schedule company drives, assessments, or interviews for student dashboard awareness
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveActivity("Published");
              }}
              className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto"
            >
              {createError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* 1. Company Information */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Company Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Company Name *</label>
                    <Input
                      required
                      placeholder="e.g. Microsoft / Cisco"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Company Website</label>
                    <Input
                      placeholder="https://careers.company.com"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Opportunity Details */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Opportunity Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Role Title *</label>
                    <Input
                      required
                      placeholder="e.g. Software Engineer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Employment Type</label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1B1C22] text-xs font-semibold"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Internship">Internship</option>
                      <option value="Internship + PPO">Internship + PPO</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Package CTC</label>
                    <Input
                      placeholder="e.g. ₹24.00 LPA"
                      value={packageCtc}
                      onChange={(e) => setPackageCtc(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Stipend (if applicable)</label>
                    <Input
                      placeholder="e.g. ₹80,000 / month"
                      value={stipend}
                      onChange={(e) => setStipend(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Activity & Schedule */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Activity Schedule
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Activity Type *</label>
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value as PlacementActivityType)}
                      className="w-full h-9 px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1B1C22] text-xs font-semibold"
                    >
                      {ALL_ACTIVITY_TYPES.map((tp) => (
                        <option key={tp} value={tp}>
                          {tp}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Date *</label>
                    <Input
                      type="date"
                      required
                      value={activityDate}
                      onChange={(e) => setActivityDate(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Start Time *</label>
                    <Input
                      required
                      placeholder="e.g. 10:00 AM"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Venue *</label>
                    <Input
                      placeholder="e.g. BVRIT Main Auditorium / Online"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Meeting / Portal Link</label>
                    <Input
                      placeholder="https://teams.microsoft.com/..."
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Eligibility & Skills */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Eligibility &amp; Skills
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Eligible Branches</label>
                    <Input
                      placeholder="CSE, CSM, CSD, AIDS, ECE"
                      value={eligibleDepartments}
                      onChange={(e) => setEligibleDepartments(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Eligible Years</label>
                    <Input
                      placeholder="3, 4"
                      value={eligibleYears}
                      onChange={(e) => setEligibleYears(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Min CGPA</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={minCgpa}
                      onChange={(e) => setMinCgpa(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Required Skills (Comma-separated)</label>
                    <Input
                      placeholder="Python, DSA, SQL"
                      value={requiredSkills}
                      onChange={(e) => setRequiredSkills(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Preferred Skills</label>
                    <Input
                      placeholder="Cloud, System Architecture"
                      value={preferredSkills}
                      onChange={(e) => setPreferredSkills(e.target.value)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Instructions & Links */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Instructions
                </span>
                <div>
                  <label className="block font-semibold mb-1">Official Instructions for Students</label>
                  <Input
                    placeholder="Arrive on time with college ID card..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
              </div>

              {/* Submit Buttons: Save as Draft vs Publish */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveActivity("Draft")}
                    disabled={isSubmitting}
                    className="rounded-xl text-xs font-semibold"
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold"
                  >
                    Publish Activity
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP BROADCAST MODAL */}
      {whatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1B1C22] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <Share2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    WhatsApp-Ready Announcement
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review and broadcast to departmental CRs or class WhatsApp groups
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsAppModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#202129] border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed text-slate-800 dark:text-slate-200">
                {broadcastText}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyText}
                  className="rounded-xl text-xs gap-1.5"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied to Clipboard!" : "Copy Text"}</span>
                </Button>

                <a href={broadcastUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Open in WhatsApp</span>
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

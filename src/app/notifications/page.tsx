"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Clock,
  Briefcase,
  Bookmark,
  Send,
  FileText,
  BookOpen,
  Megaphone,
  Check,
  CheckCheck,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Calendar,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/notifications/actions";
import {
  NotificationItem,
  GroupedNotifications,
  NotificationType,
} from "@/lib/notifications/types";

export default function NotificationsPage() {
  const router = useRouter();
  const [data, setData] = React.useState<GroupedNotifications | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const loadNotifications = React.useCallback(async () => {
    try {
      const res = await getUserNotifications();
      setData(res);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    setActionLoading(id);
    try {
      const res = await markNotificationAsRead(id);
      setData((prev) => {
        if (!prev) return prev;
        const markList = (list: NotificationItem[]) =>
          list.map((item) => (item.id === id ? { ...item, isRead: true } : item));

        return {
          ...prev,
          today: markList(prev.today),
          yesterday: markList(prev.yesterday),
          earlier: markList(prev.earlier),
          unreadCount: res.unreadCount,
        };
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading("all");
    try {
      await markAllNotificationsAsRead();
      setData((prev) => {
        if (!prev) return prev;
        const markAll = (list: NotificationItem[]) =>
          list.map((item) => ({ ...item, isRead: true }));

        return {
          ...prev,
          today: markAll(prev.today),
          yesterday: markAll(prev.yesterday),
          earlier: markAll(prev.earlier),
          unreadCount: 0,
        };
      });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      // Mark read in background
      markNotificationAsRead(item.id).catch(console.error);
    }
    router.push(item.link);
  };

  const matchesFilter = (item: NotificationItem) => {
    if (filter === "unread" && item.isRead) return false;
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    return true;
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "saved_opportunity_deadline":
        return <Bookmark className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />;
      case "opportunity_deadline":
        return <Clock className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />;
      case "application_status":
        return <Send className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />;
      case "circular":
        return <FileText className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />;
      case "assignment_reminder":
        return <BookOpen className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />;
      case "campus_announcement":
        return <Megaphone className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Bell className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getTypeBadge = (item: NotificationItem) => {
    switch (item.type) {
      case "saved_opportunity_deadline":
        return (
          <Badge variant="warning" size="sm">
            Saved Opportunity • Deadline
          </Badge>
        );
      case "opportunity_deadline":
        return (
          <Badge
            variant={item.urgencyStage === "today" ? "danger" : "warning"}
            size="sm"
          >
            {item.urgencyStage === "today"
              ? "Deadline Today"
              : item.urgencyStage === "tomorrow"
              ? "Due Tomorrow"
              : "Deadline Approaching"}
          </Badge>
        );
      case "application_status":
        return (
          <Badge variant="purple" size="sm">
            Application Status
          </Badge>
        );
      case "circular":
        return (
          <Badge variant="blue" size="sm">
            College Circular
          </Badge>
        );
      case "assignment_reminder":
        return (
          <Badge variant="success" size="sm">
            Assignment Reminder
          </Badge>
        );
      case "campus_announcement":
        return (
          <Badge variant="secondary" size="sm">
            Announcement
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="sm">
            Alert
          </Badge>
        );
    }
  };

  const formatNotificationTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderGroup = (title: string, items: NotificationItem[]) => {
    const visibleItems = items.filter(matchesFilter);
    if (visibleItems.length === 0) return null;

    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title} ({visibleItems.length})
          </h2>
        </div>

        <div className="space-y-2">
          {visibleItems.map((item) => {
            const isUnread = !item.isRead;
            const isSavedOpp = item.type === "saved_opportunity_deadline";

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group relative rounded-xl border p-3.5 sm:p-4 transition-all cursor-pointer select-none ${
                  isUnread
                    ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-xs hover:border-blue-300"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Type Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSavedOpp
                        ? "bg-amber-100 dark:bg-amber-950/60"
                        : item.type === "opportunity_deadline"
                        ? "bg-red-100 dark:bg-red-950/60"
                        : item.type === "application_status"
                        ? "bg-purple-100 dark:bg-purple-950/60"
                        : item.type === "assignment_reminder"
                        ? "bg-emerald-100 dark:bg-emerald-950/60"
                        : item.type === "circular"
                        ? "bg-blue-100 dark:bg-blue-950/60"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    {getTypeIcon(item.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getTypeBadge(item)}
                        {isUnread && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            New
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {formatNotificationTime(item.createdAt)}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-semibold truncate ${
                        isUnread
                          ? "text-slate-950 dark:text-white"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isSavedOpp
                          ? "text-amber-800 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900/40 mt-1"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {item.message}
                    </p>

                    {/* Bottom Actions Row */}
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline inline-flex items-center gap-1">
                        View details <ChevronRight className="h-3.5 w-3.5" />
                      </span>

                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(e, item.id)}
                          disabled={actionLoading === item.id}
                          className="text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors min-h-[32px] inline-flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading || !data) {
    return (
      <DashboardShell role="student" userName="Student">
        <LoadingState message="Loading your notification and deadline center..." />
      </DashboardShell>
    );
  }

  const filteredToday = data.today.filter(matchesFilter);
  const filteredYesterday = data.yesterday.filter(matchesFilter);
  const filteredEarlier = data.earlier.filter(matchesFilter);
  const totalVisible =
    filteredToday.length + filteredYesterday.length + filteredEarlier.length;

  return (
    <DashboardShell
      role="student"
      userName="Alex Johnson"
      unreadNotifications={data.unreadCount}
    >
      {/* Header */}
      <PageHeader
        title="Deadline & Notification Center"
        description="Track urgent deadlines, saved opportunity reminders, circulars, and application updates."
        badge={
          <Badge variant={data.unreadCount > 0 ? "blue" : "secondary"}>
            {data.unreadCount} Unread
          </Badge>
        }
        action={
          data.unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={actionLoading === "all"}
              leftIcon={<CheckCheck className="h-4 w-4" />}
            >
              {actionLoading === "all" ? "Marking..." : "Mark all as read"}
            </Button>
          ) : undefined
        }
      />

      {/* Filter Tabs & Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        {/* Read / Unread tab */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All ({data.totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] flex items-center gap-1.5 ${
              filter === "unread"
                ? "bg-blue-600 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Unread Only
            {data.unreadCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filter === "unread"
                    ? "bg-white text-blue-600"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                }`}
              >
                {data.unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Type Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-medium text-slate-400 shrink-0 hidden md:inline-block">
            Filter:
          </span>
          {[
            { id: "all", label: "All" },
            { id: "saved_opportunity_deadline", label: "Saved Opps" },
            { id: "opportunity_deadline", label: "Deadlines" },
            { id: "application_status", label: "Applications" },
            { id: "circular", label: "Circulars" },
            { id: "assignment_reminder", label: "Assignments" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTypeFilter(tab.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors min-h-[30px] ${
                typeFilter === tab.id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Grouped by Today, Yesterday, Earlier */}
      <div className="space-y-6">
        {totalVisible === 0 ? (
          <EmptyState
            icon={<Bell className="h-8 w-8 text-slate-400" />}
            title={filter === "unread" ? "All caught up!" : "No notifications found"}
            description={
              filter === "unread"
                ? "You have reviewed all your deadline alerts and notifications."
                : "No notifications match your current filter."
            }
            action={
              filter === "unread" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  View All Notifications
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {renderGroup("Today", data.today)}
            {renderGroup("Yesterday", data.yesterday)}
            {renderGroup("Earlier", data.earlier)}
          </>
        )}
      </div>
    </DashboardShell>
  );
}

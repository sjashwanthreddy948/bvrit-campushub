"use client";

import * as React from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WhatsAppShareModal } from "@/components/ui/WhatsAppShareModal";
import {
  generateOpportunityReminderText,
  generateAssignmentReminderText,
} from "@/lib/share/whatsapp";
import { Opportunity } from "@/types/database";
import { OpportunityCardData } from "@/lib/opportunities/actions";
import { AssignmentItem } from "@/lib/assignments/actions";

export interface WhatsAppReminderButtonProps {
  type: "opportunity" | "assignment";
  opportunity?: Partial<OpportunityCardData | Opportunity> & {
    title: string;
    company?: string;
    [key: string]: any;
  };
  assignment?: Partial<AssignmentItem> & {
    title: string;
    [key: string]: any;
  };
  variant?: "outline" | "ghost" | "primary" | "secondary" | "icon";
  size?: "sm" | "md";
  label?: string;
  className?: string;
}

export function WhatsAppReminderButton({
  type,
  opportunity,
  assignment,
  variant = "outline",
  size = "sm",
  label = "Send Reminder",
  className = "",
}: WhatsAppReminderButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [reminderText, setReminderText] = React.useState("");
  const [modalTitle, setModalTitle] = React.useState("Send WhatsApp Reminder");
  const [badgeLabel, setBadgeLabel] = React.useState<string | undefined>(undefined);

  const handlePrepareReminder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const origin = typeof window !== "undefined" ? window.location.origin : "https://campushub.edu";

    if (type === "opportunity" && opportunity) {
      const oppUrl = `${origin}/opportunities/${opportunity.id || ""}`;
      const text = generateOpportunityReminderText({
        title: opportunity.title,
        company: opportunity.company || "Campus Recruiter",
        type: opportunity.type,
        eligibility: opportunity.eligibility,
        deadline: opportunity.deadline,
        stipend: opportunity.stipend,
        package: opportunity.package,
        location: opportunity.location,
        work_mode: opportunity.work_mode,
        skills: opportunity.skills,
        url: oppUrl,
      });

      setReminderText(text);
      setModalTitle(`WhatsApp Reminder: ${opportunity.company || ""} - ${opportunity.title}`);
      setBadgeLabel(opportunity.type ? `${opportunity.type.toUpperCase()}` : "OPPORTUNITY");
      setIsOpen(true);
    } else if (type === "assignment" && assignment) {
      const campushubUrl = `${origin}/assignments`;
      const text = generateAssignmentReminderText({
        title: assignment.title,
        subject_code: assignment.subject_code,
        subject_name: assignment.subject_name,
        faculty_name: assignment.faculty_name,
        deadline: assignment.deadline,
        max_marks: assignment.max_marks,
        description: assignment.description,
        submissionUrl: assignment.submission_url || "https://vedicai.student.edwisely.com/",
        attachment_url: assignment.attachment_url,
        campushubUrl,
      });

      setReminderText(text);
      setModalTitle(`WhatsApp Reminder: ${assignment.subject_code || "Assignment"} - ${assignment.title}`);
      setBadgeLabel(assignment.subject_code || "ASSIGNMENT");
      setIsOpen(true);
    }
  };

  if (variant === "icon") {
    return (
      <>
        <button
          type="button"
          onClick={handlePrepareReminder}
          title={label}
          aria-label={label}
          className={`inline-flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-300 transition-colors cursor-pointer min-h-[36px] min-w-[36px] ${className}`}
        >
          <MessageCircle className="h-4 w-4" />
        </button>

        <WhatsAppShareModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={modalTitle}
          subtitle="Review and send this reminder to your WhatsApp class group, batch cohort, or friends."
          shareText={reminderText}
          badgeLabel={badgeLabel}
        />
      </>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant={variant === "primary" ? "primary" : variant === "secondary" ? "secondary" : "outline"}
        size={size}
        onClick={handlePrepareReminder}
        leftIcon={<MessageCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
        className={`hover:border-emerald-300 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60 min-h-[38px] ${className}`}
      >
        <span>{label}</span>
      </Button>

      <WhatsAppShareModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={modalTitle}
        subtitle="Review and send this reminder to your WhatsApp class group, batch cohort, or friends."
        shareText={reminderText}
        badgeLabel={badgeLabel}
      />
    </>
  );
}

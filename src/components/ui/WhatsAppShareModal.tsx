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
  ShieldCheck,
  Send,
  Smartphone,
} from "lucide-react";
import { createWhatsAppShareUrl } from "@/lib/share/whatsapp";

export interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  shareText: string;
  badgeLabel?: string;
}

export function WhatsAppShareModal({
  isOpen,
  onClose,
  title = "Send WhatsApp Reminder",
  subtitle = "Ready-to-send text prepared for your classmates, cohort groups, or study circles.",
  shareText,
  badgeLabel,
}: WhatsAppShareModalProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    const url = createWhatsAppShareUrl(shareText);
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={subtitle}
      size="md"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            className="min-h-[44px]"
          >
            {copied ? "Copied to Clipboard!" : "Copy Text"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleOpenWhatsApp}
              leftIcon={<Send className="h-4 w-4" />}
              rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-h-[44px]"
            >
              Open WhatsApp
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3.5">
        {/* Header Ribbon with WhatsApp Branding */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <MessageCircle className="h-3.5 w-3.5" />
            </div>
            <span>WhatsApp Ready Reminder</span>
          </div>
          {badgeLabel && (
            <Badge variant="success" size="sm" className="bg-emerald-100 text-emerald-800 border-emerald-300">
              {badgeLabel}
            </Badge>
          )}
        </div>

        {/* WhatsApp Message Preview Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-slate-400" />
              <span>Prepared Message Preview</span>
            </label>
            <span className="text-[11px] text-muted-foreground">Formatted with WhatsApp bolding</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-[13px] font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto select-all shadow-inner">
            {shareText}
          </div>
        </div>

        {/* Informative Note */}
        <div className="p-3 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            Tapping <strong>&quot;Open WhatsApp&quot;</strong> launches WhatsApp Web or your phone&apos;s WhatsApp app with this text already filled in. You can choose any contact, study group, or class cohort to send it to.
          </p>
        </div>
      </div>
    </Modal>
  );
}

"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card / Bottom Sheet on mobile */}
      <div
        className={cn(
          "relative z-10 w-full max-h-[88vh] sm:max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden",
          sizeClasses[size]
        )}
      >
        {/* Mobile drag handle visual */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="pr-4">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            {description && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg inline-flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-4 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

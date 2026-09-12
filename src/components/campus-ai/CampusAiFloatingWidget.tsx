"use client";

import * as React from "react";
import { Sparkles, X, MessageSquare, Bot } from "lucide-react";
import { CampusAiChat } from "./CampusAiChat";

export function CampusAiFloatingWidget() {
  const [isOpen, setIsOpen] = React.useState(false);

  // Close with escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Ask CampusHub AI about BVRIT Narsapur"
          className="group relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 min-h-[44px]"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            {isOpen ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          </div>
          <div className="flex flex-col items-start pr-1">
            <span className="text-xs font-bold leading-tight flex items-center gap-1">
              Ask BVRIT AI
            </span>
            <span className="text-[9px] text-blue-100 hidden sm:inline leading-tight">
              Campus Intelligence
            </span>
          </div>

          {/* Pulsing indicator when closed */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-white dark:border-slate-900" />
            </span>
          )}
        </button>
      </div>

      {/* Floating Chat Window Modal / Popup */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[480px] z-50 flex items-end sm:items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Mobile full backdrop */}
          <div
            className="sm:hidden fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-h-[85vh] sm:max-h-[640px] bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col">
            {/* Top Close Control Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100/90 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Bot className="h-4 w-4 text-blue-600" />
                <span>BVRIT Narsapur Campus AI</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Embedded Chat */}
            <div className="flex-1 overflow-hidden">
              <CampusAiChat compact={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

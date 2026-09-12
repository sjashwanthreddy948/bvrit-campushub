import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  message?: string;
  className?: string;
  variant?: "spinner" | "skeleton";
}

export function LoadingState({
  message = "Loading...",
  className,
  variant = "spinner",
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3.5 w-full animate-pulse", className)}>
        <div className="h-7 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl w-1/3" />
        <div className="h-24 bg-white/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl w-full" />
        <div className="h-24 bg-white/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl w-full" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center w-full min-h-[160px] rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center mb-3 shadow-xs">
        <Loader2 className="h-6 w-6 animate-spin text-[#F59E0B]" />
      </div>
      <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
}

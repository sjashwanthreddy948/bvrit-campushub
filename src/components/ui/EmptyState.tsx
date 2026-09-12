import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300/80 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xs w-full min-w-0 relative overflow-hidden",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/15 to-teal-500/10 dark:from-amber-500/25 dark:to-teal-500/15 text-[#F59E0B] border border-amber-500/30 flex items-center justify-center mb-4 shadow-xs">
        {icon || <FolderOpen className="h-6 w-6" />}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

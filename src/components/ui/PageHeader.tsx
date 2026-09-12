import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200 dark:border-slate-800 w-full min-w-0",
        className
      )}
    >
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
            {title}
          </h1>
          {badge && <span className="shrink-0">{badge}</span>}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap pt-1 sm:pt-0">
          {action}
        </div>
      )}
    </div>
  );
}

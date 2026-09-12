"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface PillTagProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
  variant?: "default" | "amber" | "powder" | "outline";
  size?: "sm" | "md";
}

export function PillTag({
  label,
  children,
  icon,
  active = false,
  variant = "default",
  size = "md",
  className,
  onClick,
  ...props
}: PillTagProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full border font-semibold select-none transition-all duration-200 cursor-pointer shadow-2xs";

  const variants = {
    default: active
      ? "bg-blue-600 text-white border-blue-600 shadow-2xs font-bold"
      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-slate-800",
    amber:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100",
    powder:
      "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/60 hover:bg-blue-100",
    outline:
      "bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-600 hover:text-blue-600",
  };

  const sizes = {
    sm: "px-3 py-1 text-[11px] gap-1.5 min-h-[30px]",
    md: "px-4 py-1.5 text-xs sm:text-sm gap-2 min-h-[36px]",
  };

  return (
    <div
      role="button"
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children || label}</span>
    </div>
  );
}

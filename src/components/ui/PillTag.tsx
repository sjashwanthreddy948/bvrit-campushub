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
      ? "bg-[#F59E0B] text-white border-[#F59E0B] shadow-xs"
      : "bg-white dark:bg-[#1B1C22] text-[#1A1D20] dark:text-[#F4EBE9] border-[#1A1D20]/20 dark:border-white/15 hover:border-[#F59E0B] hover:text-[#F59E0B] hover:bg-[#FFF7F6] dark:hover:bg-[#24252E]",
    amber:
      "bg-[#FFF0EE] text-[#F59E0B] border-[#F59E0B]/40 hover:bg-[#F59E0B] hover:text-white hover:border-[#F59E0B]",
    powder:
      "bg-[#EBF7FA] text-[#1A5B69] border-[#BEE3ED] hover:bg-[#BEE3ED] hover:text-[#10434E]",
    outline:
      "bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-[#F59E0B] hover:text-[#F59E0B]",
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

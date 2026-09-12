import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "purple"
    | "blue"
    | "coral"
    | "powder"
    | "capsule"
    | "amber"
    | "bvrit";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700",
    secondary:
      "bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200/60 dark:border-slate-800",
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    danger:
      "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800",
    purple:
      "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    blue:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    amber:
      "bg-[#FEF3C7] text-[#92400E] dark:bg-[#78350F]/40 dark:text-[#FDE68A] border-[#F59E0B]/40 font-bold",
    bvrit:
      "bg-[#CCFBF1] text-[#0F766E] dark:bg-[#134E4A]/50 dark:text-[#5EEAD4] border-[#14B8A6]/40 font-bold",
    coral:
      "bg-[#FEF3C7] text-[#92400E] dark:bg-[#78350F]/40 dark:text-[#FDE68A] border-[#F59E0B]/40 font-bold",
    powder:
      "bg-[#CCFBF1] text-[#0F766E] dark:bg-[#134E4A]/40 dark:text-[#5EEAD4] border-[#14B8A6]/40",
    capsule:
      "bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] border-slate-300 dark:border-slate-700 shadow-2xs font-semibold",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-[11px] font-medium leading-none",
    md: "px-3 py-1 text-xs font-semibold leading-none",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border shrink-0 transition-colors select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

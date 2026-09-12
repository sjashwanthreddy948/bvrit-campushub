import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "coral" | "powder" | "pill" | "blue" | "amber" | "bvrit" | "glass" | "amber-glow";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    // Touch targets: minimum 44px height on mobile for standard sizes
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none";

    const variants = {
      primary:
        "bg-[#F59E0B] text-[#0F172A] font-extrabold hover:bg-[#D97706] hover:text-white active:bg-[#B45309] shadow-xs",
      "amber-glow":
        "liquid-btn-amber shadow-md hover:shadow-lg active:scale-[0.97]",
      glass:
        "liquid-btn-glass",
      coral:
        "bg-[#F59E0B] text-[#0F172A] font-extrabold hover:bg-[#D97706] hover:text-white active:bg-[#B45309] shadow-xs",
      amber:
        "bg-[#F59E0B] text-[#0F172A] font-extrabold hover:bg-[#D97706] hover:text-white active:bg-[#B45309] shadow-xs",
      bvrit:
        "bg-[#0D9488] text-white font-bold hover:bg-[#0F766E] active:bg-[#115E59] shadow-xs",
      powder:
        "bg-[#CCFBF1] text-[#0F766E] hover:bg-[#99F6E4] active:bg-[#5EEAD4] shadow-xs",
      pill:
        "rounded-full border border-slate-900/15 dark:border-white/15 bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#F59E0B] hover:text-[#D97706] hover:bg-[#FEF3C7] dark:hover:bg-[#1E293B] shadow-2xs font-bold",
      blue:
        "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm",
      secondary:
        "bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-slate-800 font-semibold",
      outline:
        "border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xs text-slate-800 dark:text-slate-200 hover:border-[#F59E0B] hover:text-[#D97706] dark:hover:border-[#FBBF24] dark:hover:text-[#FBBF24] hover:bg-white dark:hover:bg-[#111827]",
      ghost:
        "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-[#FEF3C7] dark:hover:bg-[#1E293B] hover:text-[#D97706] dark:hover:text-[#FBBF24]",
      danger:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
    };

    const sizes = {
      sm: "h-9 min-h-[36px] px-3.5 text-xs sm:text-sm gap-1.5",
      md: "h-11 min-h-[44px] px-4.5 text-sm gap-2", // 44px min touch target
      lg: "h-12 min-h-[48px] px-6 text-base gap-2.5",
      icon: "h-11 w-11 min-h-[44px] min-w-[44px] p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

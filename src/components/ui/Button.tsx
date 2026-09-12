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
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none";

    const variants = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-xs font-semibold",
      "amber-glow":
        "liquid-btn-amber shadow-sm hover:shadow-md active:scale-[0.97]",
      glass:
        "liquid-btn-glass",
      coral:
        "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-xs font-semibold",
      amber:
        "bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 shadow-xs",
      bvrit:
        "bg-[#1E40AF] text-white font-bold hover:bg-[#1D4ED8] active:bg-[#1E3A8A] shadow-xs",
      powder:
        "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 shadow-xs",
      pill:
        "rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-blue-600 hover:text-blue-600 shadow-2xs font-semibold",
      blue:
        "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-xs",
      secondary:
        "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold",
      outline:
        "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs",
      ghost:
        "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
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

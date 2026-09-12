import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full h-11 min-h-[44px] rounded-xl border bg-white/90 dark:bg-[#111827]/80 backdrop-blur-md px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 focus:border-[#F59E0B] transition-all shadow-2xs",
              leftIcon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300/80 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-slate-400 dark:text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

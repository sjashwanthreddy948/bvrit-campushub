import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          rows={rows}
          ref={ref}
          className={cn(
            "w-full rounded-lg border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-y min-h-[88px]",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-slate-300 dark:border-slate-700",
            className
          )}
          {...props}
        />
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

Textarea.displayName = "Textarea";

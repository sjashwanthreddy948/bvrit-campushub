import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 sm:p-10 text-center rounded-2xl border border-rose-500/20 dark:border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/25 backdrop-blur-xl w-full min-w-0 shadow-xs",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center mb-3.5 shadow-xs">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="liquid-glass border-slate-300 dark:border-slate-700 hover:border-rose-400">
          Try Again
        </Button>
      )}
    </div>
  );
}

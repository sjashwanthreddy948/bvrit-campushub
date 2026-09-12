import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "liquid" | "spotlight";
}

export function Card({
  className,
  children,
  variant = "default",
  ...props
}: CardProps) {
  const variantStyles = {
    default: "border-[#F0E4E2] dark:border-[#2B2C35] bg-white dark:bg-[#1B1C22] shadow-xs",
    liquid: "liquid-glass-card",
    spotlight: "liquid-spotlight-card",
  };

  return (
    <div
      className={cn(
        "w-full rounded-2xl border transition-all overflow-hidden",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-4 sm:p-5 pb-2 sm:pb-3 flex flex-col space-y-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base sm:text-lg font-bold tracking-tight text-[#1A1D20] dark:text-[#F4EBE9]",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-4 sm:p-5 pt-0 sm:pt-0 text-sm text-slate-700 dark:text-slate-300", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-4 sm:p-5 pt-2 sm:pt-3 border-t border-[#F0E4E2] dark:border-[#2B2C35] flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

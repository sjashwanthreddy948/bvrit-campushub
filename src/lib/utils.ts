import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) return `${Math.abs(diffInDays)}d ago`;
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Tomorrow";
  return `In ${diffInDays} days`;
}

export function getWhatsAppShareUrl(title: string, role: string, company: string, url: string): string {
  const text = `*New Opportunity on CampusHub!*\n\n*${title}*\nRole: ${role}\nCompany: ${company}\n\nApply or view details here:\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

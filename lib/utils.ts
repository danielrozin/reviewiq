import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-trust-green";
  if (score >= 60) return "text-yellow-500";
  return "text-trust-red";
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-trust-green";
  if (score >= 60) return "bg-yellow-500";
  return "bg-trust-red";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Great";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 50) return "Mixed";
  return "Poor";
}

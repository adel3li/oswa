import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DAY_MS = 86_400_000;

export function getTodayIndex(poolLength: number): number {
  return Math.floor(Date.now() / DAY_MS) % poolLength;
}

export function getUtcDayNumber(): number {
  return Math.floor(Date.now() / DAY_MS);
}

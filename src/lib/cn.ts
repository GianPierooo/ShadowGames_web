import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Utilidad para componer className con merge inteligente de Tailwind. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

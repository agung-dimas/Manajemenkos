import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseCurrency(val: unknown): number {
  if (val === null || val === undefined) return 0
  if (typeof val === "number") return val
  const str = String(val).trim()
  if (!str) return 0
  const clean = str.replace(/\./g, "").replace(/,/g, ".")
  const num = parseFloat(clean)
  return isNaN(num) ? 0 : num
}

export function formatRupiah(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === "") return "Rp 0"
  const num = typeof val === "string" ? parseCurrency(val) : val
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num)
}


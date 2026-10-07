"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MonthStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
  id?: string
}

/**
 * Input jumlah bulan sewa (bebas, tanpa paket).
 * Tombol - / + dan input angka langsung.
 */
export function MonthStepper({
  value,
  onChange,
  min = 1,
  max = 24,
  disabled,
  className,
  id,
}: MonthStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min))

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border bg-background overflow-hidden h-10",
        disabled && "opacity-60",
        className
      )}
    >
      <button
        type="button"
        aria-label="Kurangi bulan"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className="h-full px-3 text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(clamp(parseInt(e.target.value, 10)))}
        className="h-full w-14 border-x bg-transparent text-center text-sm font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Tambah bulan"
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className="h-full px-3 text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
      <span className="px-3 text-xs font-medium text-muted-foreground border-l h-full flex items-center bg-muted/30">
        Bulan
      </span>
    </div>
  )
}

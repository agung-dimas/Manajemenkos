"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface RupiahInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  value?: string | number
  defaultValue?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onValueChange?: (numericValue: number, rawValue: string) => void
  prefix?: string
  showPrefix?: boolean
  containerClassName?: string
}

/**
 * Format string/angka menjadi format ribuan dengan titik (contoh: 1500000 -> "1.500.000")
 */
export function formatRupiahDots(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === "") return ""
  const clean = val.toString().replace(/\D/g, "")
  if (!clean) return ""
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

/**
 * Mengambil angka murni dari string format rupiah (contoh: "1.500.000" -> 1500000)
 */
export function parseRupiahDots(val: string | number | null | undefined): number {
  if (val === null || val === undefined || val === "") return 0
  const clean = val.toString().replace(/\D/g, "")
  return clean ? parseInt(clean, 10) : 0
}

export const RupiahInput = React.forwardRef<HTMLInputElement, RupiahInputProps>(
  (
    {
      name,
      id,
      value,
      defaultValue,
      onChange,
      onValueChange,
      prefix = "Rp",
      showPrefix = true,
      className,
      containerClassName,
      placeholder = "0",
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined

    // Inisialisasi display value
    const initialRaw = isControlled
      ? value?.toString().replace(/\D/g, "") || ""
      : defaultValue !== undefined
      ? defaultValue.toString().replace(/\D/g, "") || ""
      : ""

    const [displayVal, setDisplayVal] = React.useState<string>(() =>
      formatRupiahDots(initialRaw)
    )
    const [rawVal, setRawVal] = React.useState<string>(initialRaw)

    const inputRef = React.useRef<HTMLInputElement | null>(null)

    // Sinkronisasi saat controlled value berubah dari parent
    React.useEffect(() => {
      if (isControlled) {
        const clean = value !== null && value !== undefined ? value.toString().replace(/\D/g, "") : ""
        setRawVal(clean)
        setDisplayVal(formatRupiahDots(clean))
      }
    }, [isControlled, value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputEl = e.target
      const currentVal = inputEl.value
      const cursorPos = inputEl.selectionStart || 0

      // Hitung berapa digit angka sebelum posisi kursor saat ini
      const digitsBeforeCursor = currentVal.slice(0, cursorPos).replace(/\D/g, "").length

      // Ambil angka murni saja
      const cleaned = currentVal.replace(/\D/g, "")
      const formatted = formatRupiahDots(cleaned)

      if (!isControlled) {
        setRawVal(cleaned)
        setDisplayVal(formatted)
      } else {
        // Pada controlled, update display dulu agar responsif seketika
        setDisplayVal(formatted)
      }

      // Berikan callback ke parent
      if (onValueChange) {
        onValueChange(cleaned ? parseInt(cleaned, 10) : 0, cleaned)
      }

      if (onChange) {
        // Buat event tiruan dengan e.target.value berisi raw numeric string
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            name: name || id || "",
            value: cleaned,
          },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }

      // Preservasi posisi kursor agar tidak melompat ke akhir input
      requestAnimationFrame(() => {
        if (!inputEl) return
        if (digitsBeforeCursor === 0) {
          inputEl.setSelectionRange(0, 0)
          return
        }

        let countedDigits = 0
        let newCursorPos = formatted.length

        for (let i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted[i])) {
            countedDigits++
          }
          if (countedDigits === digitsBeforeCursor) {
            newCursorPos = i + 1
            break
          }
        }

        inputEl.setSelectionRange(newCursorPos, newCursorPos)
      })
    }

    // Gabungkan ref dari luar dan ref lokal
    const setRefs = React.useCallback(
      (element: HTMLInputElement | null) => {
        inputRef.current = element
        if (typeof ref === "function") {
          ref(element)
        } else if (ref) {
          ;(ref as React.MutableRefObject<HTMLInputElement | null>).current = element
        }
      },
      [ref]
    )

    return (
      <div className={cn("relative flex items-center w-full", containerClassName)}>
        {showPrefix && prefix && (
          <span className="absolute left-3 text-xs font-semibold text-muted-foreground select-none pointer-events-none">
            {prefix}
          </span>
        )}

        <input
          {...props}
          ref={setRefs}
          id={id}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={displayVal}
          onChange={handleInputChange}
          placeholder={placeholder}
          data-slot="rupiah-input"
          className={cn(
            "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
            showPrefix && prefix ? "pl-9 pr-3" : "px-2.5",
            className
          )}
        />

        {/* Input hidden untuk native HTML Form submission agar nilai yang terkirim selalu angka murni */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={rawVal}
            disabled={disabled}
          />
        )}
      </div>
    )
  }
)

RupiahInput.displayName = "RupiahInput"

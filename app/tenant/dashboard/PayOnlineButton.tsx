"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2, ArrowUpRight, Sparkles } from "lucide-react"
import { createPaymentCheckout } from "@/src/actions/pakasir.action"
import { MonthStepper } from "@/components/ui/month-stepper"

interface PayOnlineButtonProps {
  paymentId: string
  amount: number
  monthlyPrice?: number
  initialMonths?: number
  allowCustomMonths?: boolean
  className?: string
}

export function PayOnlineButton({
  paymentId,
  amount,
  monthlyPrice,
  initialMonths = 1,
  allowCustomMonths = false,
  className,
}: PayOnlineButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMonths, setSelectedMonths] = useState<number>(initialMonths || 1)

  const effectivePrice = monthlyPrice || amount
  const displayAmount = allowCustomMonths
    ? effectivePrice * selectedMonths
    : amount

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handlePay = async () => {
    setIsLoading(true)
    try {
      const res = await createPaymentCheckout(
        paymentId,
        allowCustomMonths ? selectedMonths : undefined
      )
      if (res.success && res.paymentLink) {
        // Arahkan penghuni ke halaman pembayaran Pakasir
        window.location.href = res.paymentLink
      } else {
        alert(res.error || "Gagal membuka halaman pembayaran. Silakan hubungi admin.")
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memproses pembayaran online.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3 w-full">
      {allowCustomMonths && (
        <div className="p-3 rounded-lg border bg-background/80 dark:bg-zinc-900/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Mau Bayar Langsung Berapa Bulan?
            </span>
            <span className="text-[11px] text-muted-foreground">
              Tarif {formatRupiah(effectivePrice)}/bln
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t">
            <MonthStepper
              value={selectedMonths}
              onChange={setSelectedMonths}
              min={1}
              max={12}
            />
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-muted-foreground block">Total Tagihan Baru:</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatRupiah(displayAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={handlePay}
        disabled={isLoading}
        className={`w-full gap-2 font-semibold shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white ${className || ""}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Menghubungkan ke Pakasir...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            <span>
              Bayar Online Sekarang ({formatRupiah(displayAmount)})
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
          </>
        )}
      </Button>
    </div>
  )
}

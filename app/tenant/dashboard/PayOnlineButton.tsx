"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2, ArrowUpRight } from "lucide-react"
import { createPaymentCheckout } from "@/src/actions/pakasir.action"

interface PayOnlineButtonProps {
  paymentId: string
  amount: number
  className?: string
}

export function PayOnlineButton({ paymentId, amount, className }: PayOnlineButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePay = async () => {
    setIsLoading(true)
    try {
      const res = await createPaymentCheckout(paymentId)
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
    <Button
      type="button"
      onClick={handlePay}
      disabled={isLoading}
      className={`gap-2 font-semibold shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white ${className || ""}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Menghubungkan ke Pakasir...</span>
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          <span>Bayar Online Sekarang (QRIS / VA)</span>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
        </>
      )}
    </Button>
  )
}

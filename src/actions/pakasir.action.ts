"use server"

import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
import { createPakasirTransaction, type CreateTransactionResult } from "@/src/lib/pakasir"
import { verifyTenantSession } from "@/src/lib/tenant-auth"
import { getPeriodLabel } from "@/src/lib/period"

const MAX_MONTHS = 12

export async function createPaymentCheckout(
  paymentId: string,
  months?: number
): Promise<CreateTransactionResult> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        tenant: {
          include: { room: true }
        }
      }
    })

    if (!payment) {
      return { success: false, error: "Tagihan tidak ditemukan" }
    }

    if (payment.status === "LUNAS") {
      return { success: false, error: "Tagihan ini sudah lunas" }
    }

    let activePayment = payment

    // Jika penghuni memilih jumlah bulan sendiri saat checkout
    if (months !== undefined) {
      // Pastikan yang mengubah adalah penghuni pemilik tagihan
      const cookieStore = await cookies()
      const sessionTenantId = verifyTenantSession(cookieStore.get("tenant_session")?.value)
      if (!sessionTenantId || sessionTenantId !== payment.tenantId) {
        return { success: false, error: "Sesi tidak valid. Silakan login ulang." }
      }

      const requestedMonths = Math.floor(Number(months))
      if (!Number.isFinite(requestedMonths) || requestedMonths < 1 || requestedMonths > MAX_MONTHS) {
        return { success: false, error: `Jumlah bulan harus antara 1 sampai ${MAX_MONTHS}.` }
      }

      const currentMonths = payment.durationMonth || 1
      if (requestedMonths !== currentMonths) {
        // Tagihan yang sudah dicicil tidak bisa diubah jumlah bulannya
        if ((payment.paidAmount || 0) > 0) {
          return {
            success: false,
            error: "Tagihan ini sudah memiliki cicilan masuk, jumlah bulan tidak dapat diubah. Silakan hubungi admin."
          }
        }

        const joinDay = new Date(payment.tenant.joinDate).getDate() || 1
        const newAmount = payment.tenant.room.price * requestedMonths
        const newPeriodLabel = getPeriodLabel(payment.month, payment.year, requestedMonths, joinDay)

        // Order ID baru agar tidak bentrok dengan transaksi Pakasir lama yang nominalnya berbeda
        const randomString = Math.random().toString(36).substring(2, 6).toUpperCase()
        const monthStr = payment.month.toString().padStart(2, "0")
        const newInvoiceNumber = `INV-${payment.year}${monthStr}-${randomString}`

        activePayment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            durationMonth: requestedMonths,
            amount: newAmount,
            periodLabel: newPeriodLabel,
            invoiceNumber: newInvoiceNumber,
            invoiceUrl: null
          },
          include: {
            tenant: {
              include: { room: true }
            }
          }
        })
      }
    }

    // Hitung sisa tagihan jika ada cicilan
    const remainingAmount = Math.max(0, activePayment.amount - (activePayment.paidAmount || 0))

    if (remainingAmount <= 0) {
      return { success: false, error: "Tidak ada sisa tagihan yang harus dibayar" }
    }

    // Buat order ID unik untuk Pakasir (menggunakan invoiceNumber atau payment.id)
    const orderId = activePayment.invoiceNumber || `BILL-${activePayment.id.substring(0, 8).toUpperCase()}`

    // Simpan orderId ke database jika invoiceNumber masih kosong agar sinkron
    if (!activePayment.invoiceNumber) {
      await prisma.payment.update({
        where: { id: activePayment.id },
        data: { invoiceNumber: orderId }
      })
    }

    const res = await createPakasirTransaction({
      orderId,
      amount: remainingAmount,
      method: "payment_link"
    })

    return res
  } catch (err: any) {
    console.error("Gagal memulai pembayaran online Pakasir:", err)
    return { success: false, error: err.message || "Terjadi kesalahan internal" }
  }
}

export async function getPakasirStatus() {
  const slug = process.env.PAKASIR_SLUG
  const apiKey = process.env.PAKASIR_API_KEY
  return {
    configured: Boolean(slug && apiKey),
    slug: slug || "-",
    mode: (slug && apiKey) ? "LIVE" : "SIMULATED",
    message: (slug && apiKey)
      ? `Pakasir API v2 aktif dengan project slug: ${slug}. Penghuni dapat langsung membayar via QRIS & Virtual Account di portal.`
      : "Kredensial Pakasir belum diatur di .env. Sistem berjalan dalam mode simulasi pengujian."
  }
}

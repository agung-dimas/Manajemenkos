"use server"

import prisma from "@/lib/prisma"
import { createPakasirTransaction, type CreateTransactionResult } from "@/src/lib/pakasir"

export async function createPaymentCheckout(paymentId: string): Promise<CreateTransactionResult> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        tenant: true
      }
    })

    if (!payment) {
      return { success: false, error: "Tagihan tidak ditemukan" }
    }

    if (payment.status === "LUNAS") {
      return { success: false, error: "Tagihan ini sudah lunas" }
    }

    // Hitung sisa tagihan jika ada cicilan
    const remainingAmount = Math.max(0, payment.amount - (payment.paidAmount || 0))

    if (remainingAmount <= 0) {
      return { success: false, error: "Tidak ada sisa tagihan yang harus dibayar" }
    }

    // Buat order ID unik untuk Pakasir (menggunakan invoiceNumber atau payment.id)
    const orderId = payment.invoiceNumber || `BILL-${payment.id.substring(0, 8).toUpperCase()}`

    // Simpan orderId ke database jika invoiceNumber masih kosong agar sinkron
    if (!payment.invoiceNumber) {
      await prisma.payment.update({
        where: { id: payment.id },
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

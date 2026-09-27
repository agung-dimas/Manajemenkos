import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/src/lib/supabase/server"
import { generateReceiptPDF } from "@/src/lib/receipt"
import { sendReceiptEmail } from "@/src/lib/email"
import { sendWhatsAppMessage } from "@/src/lib/whatsapp"
import { MONTHS } from "@/src/lib/period"

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAKASIR_WEBHOOK_SECRET
    const incomingSecret = req.headers.get("x-secret")

    // Verifikasi keamanan webhook jika secret dikonfigurasi di .env
    if (secret && incomingSecret && secret !== incomingSecret) {
      console.warn("[PAKASIR WEBHOOK] Secret header tidak cocok!")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    console.log("[PAKASIR WEBHOOK RECEIVED]:", body)

    const { order_id, status } = body

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 })
    }

    // Hanya proses jika status transaksi adalah completed
    if (status !== "completed") {
      return NextResponse.json({ message: `Ignored status: ${status}` }, { status: 200 })
    }

    // 1. Ekstrak pola order_id
    const cleanOrderId = String(order_id).trim()
    const rawUuidPrefix = cleanOrderId.replace(/^BILL-/i, "")

    // Cari payment berdasarkan invoiceNumber, id persis, atau id yang diawali prefix UUID
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { invoiceNumber: { equals: cleanOrderId, mode: "insensitive" } },
          { id: cleanOrderId },
          { id: { startsWith: rawUuidPrefix, mode: "insensitive" } },
          { id: { startsWith: rawUuidPrefix.toLowerCase() } }
        ]
      },
      include: {
        tenant: {
          include: { room: true }
        }
      }
    })

    if (!payment) {
      console.error(`[PAKASIR WEBHOOK] Tagihan dengan order_id '${order_id}' tidak ditemukan di database.`)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Jika pembayaran sudah berstatus LUNAS sebelumnya, hindari duplikasi
    if (payment.status === "LUNAS") {
      return NextResponse.json({ message: "Payment already settled" }, { status: 200 })
    }

    const paymentDate = body.completed_at ? new Date(body.completed_at) : new Date()

    // 1. Update status pembayaran menjadi LUNAS
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "LUNAS",
        paidAmount: payment.amount,
        paymentDate,
        method: "Pakasir (Online)",
      }
    })

    // 2. Buat Kuitansi PDF resmi
    const periodText = payment.periodLabel || `${MONTHS[payment.month - 1]} ${payment.year}`
    try {
      const pdfBuffer = generateReceiptPDF({
        paymentId: payment.id,
        tenantName: payment.tenant.name,
        roomNumber: payment.tenant.room.number,
        monthName: MONTHS[payment.month - 1],
        year: payment.year,
        periodLabel: periodText,
        amount: payment.amount,
        paymentDate,
        method: "Pakasir (Online)"
      })

      const supabase = await createClient()
      const receiptPath = `receipts/receipt-${payment.id}.pdf`

      const { data: uploadData } = await supabase.storage
        .from("payments")
        .upload(receiptPath, pdfBuffer, {
          contentType: "application/pdf",
          duplex: "half"
        })

      let receiptUrl = undefined
      if (uploadData) {
        const { data: publicData } = supabase.storage.from("payments").getPublicUrl(uploadData.path)
        receiptUrl = publicData.publicUrl

        await prisma.payment.update({
          where: { id: payment.id },
          data: { proofUrl: receiptUrl }
        })
      }

      // 3. Kirim Kuitansi PDF ke Email Penghuni via Resend
      if (payment.tenant.email) {
        await sendReceiptEmail({
          to: payment.tenant.email,
          tenantName: payment.tenant.name,
          roomNumber: payment.tenant.room.number,
          period: periodText,
          amount: payment.amount,
          paymentDate,
          method: "Pakasir (Online)",
          receiptPdfBuffer: pdfBuffer,
          receiptUrl
        })
      }

      // 4. Kirim Konfirmasi WhatsApp sebagai backup
      if (payment.tenant.phone) {
        const formattedAmount = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0
        }).format(payment.amount)

        const message = `Halo ${payment.tenant.name},\n\nPembayaran online sewa kost Anda untuk periode *${periodText}* sebesar *${formattedAmount}* telah BERHASIL diverifikasi melalui Pakasir dan berstatus *LUNAS*.\n\nBerikut kuitansi digital resmi pembayaran Anda. Terima kasih.`
        await sendWhatsAppMessage(payment.tenant.phone, message, receiptUrl)
      }
    } catch (err) {
      console.error("[PAKASIR WEBHOOK] Error saat generate / kirim kuitansi:", err)
    }

    return NextResponse.json({
      success: true,
      message: "Transaksi Pakasir berhasil diselesaikan",
      orderId: payment.id
    })
  } catch (err: any) {
    console.error("[PAKASIR WEBHOOK ERROR]:", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}

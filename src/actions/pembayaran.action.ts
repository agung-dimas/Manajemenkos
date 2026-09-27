"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"
import prisma from "@/lib/prisma"
import { PaymentStatus } from "@prisma/client"
import { sendWhatsAppMessage } from "@/src/lib/whatsapp"
import { generateReceiptPDF } from "@/src/lib/receipt"
import { getPeriodLabel } from "@/src/lib/period"
import { sendReceiptEmail, sendInvoiceEmail, sendInstallmentReceiptEmail } from "@/src/lib/email"

// Array helper untuk mengubah angka bulan menjadi nama bulan
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

export async function addPayment(formData: FormData) {
  const tenantId = formData.get("tenantId") as string
  const month = parseInt(formData.get("month") as string)
  const year = parseInt(formData.get("year") as string)
  const durationMonth = parseInt(formData.get("durationMonth") as string) || 1
  const periodLabel = (formData.get("periodLabel") as string) || getPeriodLabel(month, year, durationMonth)
  const amount = parseFloat(formData.get("amount") as string)
  const paymentDateStr = formData.get("paymentDate") as string
  const method = formData.get("method") as string
  const status = formData.get("status") as PaymentStatus
  
  const proofFile = formData.get("proofUrl") as File
  let proofUrl = null

  // Upload bukti transfer jika ada file yang diunggah
  if (proofFile && proofFile.size > 0) {
    const supabase = await createClient()
    const fileExt = proofFile.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const arrayBuffer = await proofFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from("payments")
      .upload(fileName, buffer, {
        contentType: proofFile.type || "image/jpeg",
        duplex: 'half'
      })
    
    if (!error && data) {
      const { data: publicData } = supabase.storage.from("payments").getPublicUrl(data.path)
      proofUrl = publicData.publicUrl
    }
  }

  // Ambil detail penghuni untuk cetak kuitansi & pengiriman WA
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { room: true }
  })

  // Simpan data pembayaran ke database
  const payment = await prisma.payment.create({
    data: {
      tenantId,
      month,
      year,
      durationMonth,
      periodLabel,
      amount,
      paymentDate: paymentDateStr ? new Date(paymentDateStr) : null,
      method,
      status,
      proofUrl,
    }
  })

  // Jika status lunas, buat kuitansi PDF dan kirim WhatsApp otomatis
  if (status === "LUNAS" && tenant) {
    try {
      const pdfBuffer = generateReceiptPDF({
        paymentId: payment.id,
        tenantName: tenant.name,
        roomNumber: tenant.room.number,
        monthName: MONTHS[month - 1],
        year,
        periodLabel: payment.periodLabel || periodLabel,
        amount,
        paymentDate: payment.paymentDate,
        method
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
      }

      // 1. Kirim Email Notifikasi & Kuitansi PDF via Resend
      if (tenant.email) {
        await sendReceiptEmail({
          to: tenant.email,
          tenantName: tenant.name,
          roomNumber: tenant.room.number,
          period: payment.periodLabel || periodLabel,
          amount,
          paymentDate: payment.paymentDate,
          method,
          receiptPdfBuffer: pdfBuffer,
          receiptUrl
        })
      }

      // 2. Kirim pesan WhatsApp (sebagai backup)
      if (tenant.phone) {
        const formattedAmount = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)
        const message = `Halo ${tenant.name},\n\nPembayaran sewa kost Anda untuk periode *${periodLabel}* sebesar *${formattedAmount}* telah BERHASIL divalidasi dan dinyatakan *LUNAS*.\n\nBerikut terlampir bukti kuitansi digital pembayaran resmi Anda. Terima kasih.`
        
        await sendWhatsAppMessage(tenant.phone, message, receiptUrl)
      }
    } catch (err) {
      console.error("Gagal mengirim kuitansi otomatis:", err)
    }
  }

  revalidatePath("/dashboard/pembayaran")
  redirect("/dashboard/pembayaran")
}

export async function removePayment(id: string) {
  await prisma.payment.delete({ where: { id } })
  revalidatePath("/dashboard/pembayaran")
}

export async function markAsPaid(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { tenant: { include: { room: true } } }
  })

  if (!payment) throw new Error("Payment not found")

  const updatedPayment = await prisma.payment.update({
    where: { id },
    data: {
      status: "LUNAS",
      paymentDate: new Date(),
      method: "Manual"
    }
  })

  // Generate kuitansi PDF dan kirim WhatsApp
  try {
    const periodText = payment.periodLabel || `${MONTHS[payment.month - 1]} ${payment.year}`
    const pdfBuffer = generateReceiptPDF({
      paymentId: payment.id,
      tenantName: payment.tenant.name,
      roomNumber: payment.tenant.room.number,
      monthName: MONTHS[payment.month - 1],
      year: payment.year,
      periodLabel: periodText,
      amount: payment.amount,
      paymentDate: updatedPayment.paymentDate,
      method: updatedPayment.method
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
        where: { id },
        data: { proofUrl: receiptUrl }
      })
    }

    // 1. Kirim Email Kuitansi Resmi via Resend
    if (payment.tenant.email) {
      await sendReceiptEmail({
        to: payment.tenant.email,
        tenantName: payment.tenant.name,
        roomNumber: payment.tenant.room.number,
        period: periodText,
        amount: payment.amount,
        paymentDate: updatedPayment.paymentDate,
        method: updatedPayment.method,
        receiptPdfBuffer: pdfBuffer,
        receiptUrl
      })
    }

    // 2. Kirim pesan WhatsApp (sebagai backup)
    if (payment.tenant.phone) {
      const formattedAmount = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(payment.amount)
      const message = `Halo ${payment.tenant.name},\n\nPembayaran sewa kost Anda untuk periode *${periodText}* sebesar *${formattedAmount}* telah BERHASIL divalidasi dan dinyatakan *LUNAS*.\n\nBerikut terlampir bukti kuitansi digital pembayaran resmi Anda. Terima kasih.`
      
      await sendWhatsAppMessage(payment.tenant.phone, message, receiptUrl)
    }
  } catch (err) {
    console.error("Gagal mengirim kuitansi otomatis:", err)
  }

  revalidatePath("/dashboard/pembayaran")
}

export async function resendInvoice(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { tenant: { include: { room: true } } }
  })

  if (!payment || !payment.invoiceUrl) throw new Error("Invoice tidak ditemukan")

  try {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 3)
    const formattedAmount = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(payment.amount)
    
    // Asumsi due date adalah tanggal joinDay (hanya untuk pesan teks, karena ini pengiriman ulang)
    const dueDateStr = `Bulan ini` // Simplified for resend
    
    const periodText = payment.periodLabel || `${MONTHS[payment.month - 1]} ${payment.year}`
    const message = `Halo *${payment.tenant.name}*,\n\nBerikut adalah pengiriman ulang *Tagihan Pembayaran Kost Resmi* Anda untuk periode *${periodText}*.\n\nNo. Invoice: *${payment.invoiceNumber || '-'}*\nTotal Tagihan: *${formattedAmount}*\n\nSilakan lakukan pembayaran transfer ke rekening penampung resmi kost dan berikan konfirmasi apabila sudah mentransfer.\n\nTerima kasih.`
    
    // 1. Kirim Email Tagihan via Resend
    if (payment.tenant.email) {
      await sendInvoiceEmail({
        to: payment.tenant.email,
        tenantName: payment.tenant.name,
        roomNumber: payment.tenant.room.number,
        period: periodText,
        amount: payment.amount,
        dueDate: targetDate,
        invoiceNumber: payment.invoiceNumber || "INV-MANUAL",
        invoiceUrl: payment.invoiceUrl
      })
    }

    // 2. Kirim pesan WhatsApp (sebagai backup)
    let res = { success: false }
    if (payment.tenant.phone) {
      res = await sendWhatsAppMessage(payment.tenant.phone, message, payment.invoiceUrl)
    }

    if (res.success || payment.tenant.email) {
      await prisma.payment.update({
        where: { id },
        data: {
          invoiceSentAt: new Date(),
          status: payment.status === "BELUM_BAYAR" ? "TERKIRIM" : payment.status
        }
      })
    }
  } catch (err) {
    console.error("Gagal mengirim ulang tagihan:", err)
  }

  revalidatePath("/dashboard/pembayaran")
}

export async function addInstallment(formData: FormData) {
  const paymentId = formData.get("paymentId") as string
  const amount = parseFloat(formData.get("amount") as string)
  const method = formData.get("method") as string
  const proofFile = formData.get("proofUrl") as File

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { tenant: { include: { room: true } } }
  })

  if (!payment) throw new Error("Payment not found")

  let proofUrl = null

  if (proofFile && proofFile.size > 0) {
    const supabase = await createClient()
    const fileExt = proofFile.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const arrayBuffer = await proofFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from("payments")
      .upload(fileName, buffer, {
        contentType: proofFile.type || "image/jpeg",
        duplex: 'half'
      })
    
    if (!error && data) {
      const { data: publicData } = supabase.storage.from("payments").getPublicUrl(data.path)
      proofUrl = publicData.publicUrl
    }
  }

  const newPaidAmount = payment.paidAmount + amount
  const isLunas = newPaidAmount >= payment.amount
  const newStatus = isLunas ? "LUNAS" : "SEBAGIAN"
  const remainingBalance = Math.max(0, payment.amount - newPaidAmount)

  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      paidAmount: newPaidAmount,
      status: newStatus,
      paymentDate: isLunas ? new Date() : payment.paymentDate,
      proofUrl: isLunas && proofUrl ? proofUrl : payment.proofUrl, // Gunakan bukti terakhir sbg bukti utama jika lunas
    }
  })

  // Simpan record cicilan
  const installment = await prisma.paymentInstallment.create({
    data: {
      paymentId,
      amount,
      method,
      proofUrl
    }
  })

  // Buat PDF Kuitansi Cicilan
  try {
    const periodText = payment.periodLabel || `${MONTHS[payment.month - 1]} ${payment.year}`
    const pdfBuffer = generateReceiptPDF({
      paymentId: payment.id,
      tenantName: payment.tenant.name,
      roomNumber: payment.tenant.room.number,
      monthName: MONTHS[payment.month - 1],
      year: payment.year,
      periodLabel: periodText,
      amount: payment.amount,
      paymentDate: new Date(),
      method: method,
      installmentAmount: amount,
      remainingBalance: remainingBalance
    })

    const supabase = await createClient()
    const receiptPath = `receipts/installment-${installment.id}.pdf`
    
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

      await prisma.paymentInstallment.update({
        where: { id: installment.id },
        data: { receiptUrl: receiptUrl }
      })
    }

    // 1. Kirim Email Kuitansi Cicilan via Resend
    if (payment.tenant.email) {
      await sendInstallmentReceiptEmail({
        to: payment.tenant.email,
        tenantName: payment.tenant.name,
        roomNumber: payment.tenant.room.number,
        period: periodText,
        amount,
        remainingBalance,
        isLunas,
        receiptPdfBuffer: pdfBuffer,
        receiptUrl
      })
    }

    // 2. Kirim pesan WhatsApp (sebagai backup)
    if (payment.tenant.phone) {
      const formattedInstallment = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)
      const formattedRemaining = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(remainingBalance)
      
      const message = isLunas 
        ? `Halo *${payment.tenant.name}*,\n\nSetoran cicilan terakhir Anda sebesar *${formattedInstallment}* untuk periode *${periodText}* telah diterima.\n\nTagihan Anda kini telah dinyatakan *LUNAS*. Terlampir bukti kuitansi resminya. Terima kasih.`
        : `Halo *${payment.tenant.name}*,\n\nSetoran cicilan Anda sebesar *${formattedInstallment}* untuk periode *${periodText}* telah diterima.\n\nSisa tagihan yang harus dibayar adalah *${formattedRemaining}*. Terlampir bukti kuitansi cicilannya. Terima kasih.`
      
      await sendWhatsAppMessage(payment.tenant.phone, message, receiptUrl)
    }
  } catch (err) {
    console.error("Gagal mengirim kuitansi cicilan otomatis:", err)
  }

  revalidatePath("/dashboard/pembayaran")
}

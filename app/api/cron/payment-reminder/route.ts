import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendWhatsAppMessage } from "@/src/lib/whatsapp"
import { generateInvoicePDF } from "@/src/lib/invoice"
import { createClient } from "@/src/lib/supabase/server"
import { sendInvoiceEmail } from "@/src/lib/email"
import { getPeriodLabel } from "@/src/lib/period"

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

export async function GET() {
  try {
    const getDayInJakarta = (date: Date) => {
      const formatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric'
      })
      return parseInt(formatter.format(date))
    }

    // 1. Hitung tanggal jatuh tempo target (Hari ini + 3 Hari)
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 3)
    
    const targetDay = getDayInJakarta(targetDate)
    const targetMonth = targetDate.getMonth() + 1 // 1-12
    const targetYear = targetDate.getFullYear()

    // 2. Ambil semua penghuni yang aktif
    const activeTenants = await prisma.tenant.findMany({
      where: { status: "AKTIF" },
      include: { room: true }
    })

    const remindersSent = []

    // Supabase client untuk upload invoice (Direct Client)
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
    )

    // 3. Filter penghuni yang jatuh temponya adalah targetDay
    for (const tenant of activeTenants) {
      const joinDay = getDayInJakarta(new Date(tenant.joinDate))
      
      // Jika hari join sama dengan hari target H-3
      if (joinDay === targetDay) {
        // 1. Periksa apakah bulan target sudah tercakup dalam pembayaran LUNAS (misal sewa 3 bulan, 6 bulan, dll)
        const paidPayments = await prisma.payment.findMany({
          where: {
            tenantId: tenant.id,
            status: "LUNAS"
          }
        })

        const isCovered = paidPayments.some(p => {
          const startIndex = (p.year * 12) + (p.month - 1)
          const duration = p.durationMonth || 1
          const endIndex = startIndex + duration
          const checkIndex = (targetYear * 12) + (targetMonth - 1)
          return checkIndex >= startIndex && checkIndex < endIndex
        })

        if (isCovered) {
          // Periode ini sudah lunas dibayar di muka
          continue
        }

        // 2. Periksa apakah tagihan invoice untuk bulan target ini sudah pernah dibuat sebelumnya
        const existingPayment = await prisma.payment.findFirst({
          where: {
            tenantId: tenant.id,
            month: targetMonth,
            year: targetYear
          }
        })

        // Jika belum ada invoice/payment record
        if (!existingPayment) {
          // Cari paket durasi sewa terakhir penghuni (default 6 bulan)
          const lastPayment = await prisma.payment.findFirst({
            where: { tenantId: tenant.id },
            orderBy: { createdAt: "desc" }
          })
          const durationMonth = lastPayment?.durationMonth || 6
          const billAmount = tenant.room.price * durationMonth
          const periodLabel = getPeriodLabel(targetMonth, targetYear, durationMonth)

          // Buat nomor invoice
          const randomString = Math.random().toString(36).substring(2, 6).toUpperCase()
          const monthStr = targetMonth.toString().padStart(2, '0')
          const invoiceNumber = `INV-${targetYear}${monthStr}-${randomString}`

          // Simpan data pembayaran ke database dengan status BELUM_BAYAR (termasuk invoiceNumber)
          const newPayment = await prisma.payment.create({
            data: {
              tenantId: tenant.id,
              month: targetMonth,
              year: targetYear,
              durationMonth,
              periodLabel,
              amount: billAmount,
              status: "BELUM_BAYAR", // Status awal
              invoiceNumber: invoiceNumber,
            }
          })

          const formattedAmount = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
          }).format(billAmount)

          const dueDateStr = `${targetDay} ${MONTHS[targetMonth - 1]} ${targetYear}`
          
          // Generate PDF Tagihan
          const pdfBuffer = generateInvoicePDF({
            invoiceNumber: invoiceNumber,
            tenantName: tenant.name,
            roomNumber: tenant.room.number,
            monthName: MONTHS[targetMonth - 1],
            year: targetYear,
            amount: billAmount,
            dueDate: targetDate
          })

          const invoicePath = `invoices/${invoiceNumber}.pdf`
          
          // Upload PDF ke Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("payments")
            .upload(invoicePath, pdfBuffer, {
              contentType: "application/pdf",
              duplex: "half"
            })

          if (uploadError) {
             console.error("Gagal upload PDF Invoice ke Supabase:", uploadError);
          }

          let invoiceUrl = null
          if (uploadData) {
            const { data: publicData } = supabase.storage.from("payments").getPublicUrl(uploadData.path)
            invoiceUrl = publicData.publicUrl
          }

          // 1. Kirim Email Tagihan Resmi via Resend
          if (tenant.email) {
            await sendInvoiceEmail({
              to: tenant.email,
              tenantName: tenant.name,
              roomNumber: tenant.room.number,
              period: periodLabel,
              amount: billAmount,
              dueDate: targetDate,
              invoiceNumber,
              invoicePdfBuffer: pdfBuffer,
              invoiceUrl: invoiceUrl || undefined
            })
          }

          // 2. Kirim pesan WA (sebagai backup)
          if (tenant.phone) {
            let message = `Halo *${tenant.name}*,\n\nBerikut adalah *Tagihan Pembayaran Kost Resmi* Anda untuk periode *${periodLabel}*.\n\nNo. Invoice: *${invoiceNumber}*\nTotal Tagihan: *${formattedAmount}*\nJatuh Tempo: *${dueDateStr}*\n\nSilakan lakukan pembayaran transfer ke rekening penampung resmi kost dan berikan konfirmasi apabila sudah mentransfer.\n\nKeterlambatan pembayaran dapat dikenakan denda sesuai dengan peraturan yang berlaku. Terima kasih.`
            
            if (invoiceUrl) {
               message += `\n\nLink Dokumen Tagihan (PDF): ${invoiceUrl}`;
            }

            // Lampirkan PDF ke pesan Fonnte menggunakan parameter url (atau file)
            // Fonnte API uses 'file' for sending files in some versions, or 'url'
            const res = await sendWhatsAppMessage(tenant.phone, message, invoiceUrl || undefined)
            
            // Update database bahwa invoice telah terkirim
            if (res.success) {
              await prisma.payment.update({
                where: { id: newPayment.id },
                data: {
                  invoiceUrl: invoiceUrl,
                  invoiceSentAt: new Date(),
                  status: "TERKIRIM" // Mengubah status menjadi TERKIRIM
                }
              })
            } else {
               await prisma.payment.update({
                where: { id: newPayment.id },
                data: {
                  invoiceUrl: invoiceUrl
                }
              })
            }

            remindersSent.push({
              tenantId: tenant.id,
              name: tenant.name,
              phone: tenant.phone,
              success: res.success,
              error: res.error || null,
              invoiceNumber: invoiceNumber
            })
          } else {
             // Update database dengan invoice url
             await prisma.payment.update({
                where: { id: newPayment.id },
                data: {
                  invoiceUrl: invoiceUrl
                }
              })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Proses pengiriman tagihan selesai",
      targetDate: targetDate.toISOString().split("T")[0],
      remindersSentCount: remindersSent.length,
      details: remindersSent
    })

  } catch (err: any) {
    console.error("Gagal menjalankan cron tagihan:", err)
    return NextResponse.json({
      success: false,
      error: err.message || "Terjadi kesalahan server internal"
    }, { status: 500 })
  }
}

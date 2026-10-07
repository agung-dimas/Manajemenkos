import prisma from "@/lib/prisma"
import { getReminderSettings } from "@/src/actions/settings.action"
import { sendWhatsAppMessage } from "@/src/lib/whatsapp"
import { generateInvoicePDF } from "@/src/lib/invoice"
import { sendInvoiceEmail } from "@/src/lib/email"
import { getPeriodLabel } from "@/src/lib/period"

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

export interface ReminderProcessResult {
  tenantId: string
  tenantName: string
  roomNumber: string
  email: string | null
  phone: string | null
  invoiceNumber: string
  amount: number
  periodLabel: string
  dueDate: string
  daysLeft: number
  emailSent: boolean
  waSent: boolean
  reason?: string
}

export async function processPaymentReminders(options?: {
  force?: boolean
  checkHour?: boolean
}) {
  const settings = await getReminderSettings()
  const force = options?.force ?? false
  const checkHour = options?.checkHour ?? false

  // Format tanggal & jam saat ini di WIB (Jakarta)
  const now = new Date()
  const jakartaDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now) // "YYYY-MM-DD"

  const currentWibHour = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hour12: false
    }).format(now),
    10
  )

  // Jika checkHour diaktifkan dan bukan force:
  // Verifikasi apakah jam saat ini sudah sesuai dengan jam di pengaturan
  if (checkHour && !force) {
    if (currentWibHour !== settings.reminderHour) {
      return {
        success: true,
        executed: false,
        skipped: true,
        currentHourWib: currentWibHour,
        scheduledHourWib: settings.reminderHour,
        message: `Bukan jadwal pengiriman. Saat ini pukul ${currentWibHour.toString().padStart(2, "0")}:00 WIB, sedangkan jadwal pengingat diatur untuk pukul ${settings.reminderHour.toString().padStart(2, "0")}:00 WIB.`,
        processedCount: 0,
        settings,
        results: []
      }
    }
  }

  const today = new Date(`${jakartaDateStr}T00:00:00+07:00`)

  // Inisialisasi Supabase storage
  const { createClient } = await import("@supabase/supabase-js")
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
  )

  const activeTenants = await prisma.tenant.findMany({
    where: { status: "AKTIF" },
    include: {
      room: true,
      payments: {
        orderBy: { createdAt: "desc" }
      }
    }
  })

  const results: ReminderProcessResult[] = []

  for (const tenant of activeTenants) {
    if (!tenant.room) continue

    const joinDateObj = new Date(tenant.joinDate)
    const joinDay = !isNaN(joinDateObj.getTime()) ? joinDateObj.getDate() : 1

    // 1. Cek apakah ada tagihan yang belum lunas (BELUM_BAYAR, TERKIRIM, SEBAGIAN, TERLAMBAT)
    //    TERLAMBAT ikut dihitung agar sistem tidak membuat tagihan ganda untuk periode yang sama.
    const unpaidPayment = tenant.payments.find(
      (p) =>
        p.status === "BELUM_BAYAR" ||
        p.status === "TERKIRIM" ||
        p.status === "SEBAGIAN" ||
        p.status === "TERLAMBAT"
    )

    let targetPayment = unpaidPayment
    let targetMonth: number
    let targetYear: number
    let dueDate: Date

    if (targetPayment) {
      targetMonth = targetPayment.month
      targetYear = targetPayment.year
      dueDate = new Date(targetYear, targetMonth - 1, joinDay)
    } else {
      // 2. Jika tidak ada tagihan belum lunas, hitung periode tagihan berikutnya berdasarkan pembayaran lunas terakhir
      const paidPayments = tenant.payments.filter((p) => p.status === "LUNAS")

      let nextMonth = today.getMonth() + 1
      let nextYear = today.getFullYear()

      if (paidPayments.length > 0) {
        // Ambil pembayaran dengan masa akhir sewa terjauh
        let maxEndIndex = 0
        let latestDuration = 1

        for (const p of paidPayments) {
          const startIndex = p.year * 12 + (p.month - 1)
          const duration = p.durationMonth || 1
          const endIndex = startIndex + duration
          if (endIndex > maxEndIndex) {
            maxEndIndex = endIndex
            latestDuration = duration
          }
        }

        const currentMonthIndex = today.getFullYear() * 12 + today.getMonth()

        // Jika periode lunas masih berlaku di masa depan, lewati
        if (maxEndIndex > currentMonthIndex + 1) {
          continue
        }

        nextYear = Math.floor(maxEndIndex / 12)
        nextMonth = (maxEndIndex % 12) + 1
      }

      targetMonth = nextMonth
      targetYear = nextYear
      dueDate = new Date(targetYear, targetMonth - 1, joinDay)
    }

    // Hitung selisih hari antara Jatuh Tempo dan Hari Ini
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Periksa status keterlambatan jika lewat jatuh tempo
    if (diffDays < 0 && targetPayment && targetPayment.status !== "TERLAMBAT") {
      await prisma.payment.update({
        where: { id: targetPayment.id },
        data: { status: "TERLAMBAT" }
      })
      targetPayment.status = "TERLAMBAT"
    }

    // Kondisi pengingat:
    // 1. Tagihan mendekati jatuh tempo (rentang H-(settings.reminderDaysBefore) sampai H-0)
    // 2. ATAU tagihan sudah lewat jatuh tempo (TERLAMBAT / diffDays < 0) jika autoDailyReminder aktif!
    const isDueSoon = diffDays >= 0 && diffDays <= settings.reminderDaysBefore
    const isOverdue = diffDays < 0 && settings.autoDailyReminder
    const shouldRemind = isDueSoon || isOverdue

    if (!shouldRemind && !force) {
      continue
    }

    // Cek apakah hari ini sudah pernah dikirim pengingat (kecuali dipaksa / force)
    if (targetPayment && targetPayment.invoiceSentAt && !force) {
      const lastSentStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(new Date(targetPayment.invoiceSentAt))

      // Jika sudah dikirim pada tanggal yang sama hari ini, jangan kirim berulang di hari yang sama
      if (lastSentStr === jakartaDateStr) {
        continue
      }

      // Jika autoDailyReminder dinonaktifkan dan bukan tepat di H-reminderDaysBefore, lewati
      if (!settings.autoDailyReminder && diffDays !== settings.reminderDaysBefore) {
        continue
      }
    }

    // Buat tagihan baru jika belum ada.
    // Sistem bulanan: tagihan otomatis selalu 1 bulan (harga kamar x 1).
    // Penghuni bebas mengubah jumlah bulan saat checkout di portal, atau ibu kost mencatat manual.
    if (!targetPayment) {
      const durationMonth = 1
      const billAmount = tenant.room.price * durationMonth
      const periodLabel = getPeriodLabel(targetMonth, targetYear, durationMonth, joinDay)

      const randomString = Math.random().toString(36).substring(2, 6).toUpperCase()
      const monthStr = targetMonth.toString().padStart(2, "0")
      const invoiceNumber = `INV-${targetYear}${monthStr}-${randomString}`

      targetPayment = await prisma.payment.create({
        data: {
          tenantId: tenant.id,
          month: targetMonth,
          year: targetYear,
          durationMonth,
          periodLabel,
          amount: billAmount,
          status: "BELUM_BAYAR",
          invoiceNumber
        }
      })
    }

    // Persiapkan data pengiriman
    const billAmount = targetPayment.amount - targetPayment.paidAmount
    const periodLabel = targetPayment.periodLabel || `${MONTHS[targetMonth - 1]} ${targetYear}`
    const invoiceNumber = targetPayment.invoiceNumber || `INV-${targetPayment.id.slice(0, 8).toUpperCase()}`

    const dueDateStr = `${joinDay} ${MONTHS[targetMonth - 1]} ${targetYear}`
    const formattedAmount = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(billAmount)

    // Generate PDF Tagihan
    let invoiceUrl = targetPayment.invoiceUrl
    let pdfBuffer: Buffer | null = null

    try {
      pdfBuffer = generateInvoicePDF({
        invoiceNumber,
        tenantName: tenant.name,
        roomNumber: tenant.room.number,
        monthName: MONTHS[targetMonth - 1],
        year: targetYear,
        amount: billAmount,
        dueDate
      })

      if (!invoiceUrl && pdfBuffer) {
        const invoicePath = `invoices/${invoiceNumber}.pdf`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("payments")
          .upload(invoicePath, pdfBuffer, {
            contentType: "application/pdf",
            duplex: "half"
          })

        if (!uploadError && uploadData) {
          const { data: publicData } = supabase.storage.from("payments").getPublicUrl(uploadData.path)
          invoiceUrl = publicData.publicUrl
        }
      }
    } catch (pdfErr) {
      console.error("Gagal generate/upload PDF tagihan:", pdfErr)
    }

    let emailSent = false
    let waSent = false

    // Kirim Email via Resend
    if (tenant.email && settings.emailReminderActive) {
      try {
        const emailRes = await sendInvoiceEmail({
          to: tenant.email,
          tenantName: tenant.name,
          roomNumber: tenant.room.number,
          period: periodLabel,
          amount: billAmount,
          dueDate,
          invoiceNumber,
          invoicePdfBuffer: pdfBuffer || undefined,
          invoiceUrl: invoiceUrl || undefined
        })
        emailSent = emailRes.success
      } catch (e) {
        console.error("Gagal kirim email reminder:", e)
      }
    }

    // Kirim WhatsApp
    if (tenant.phone && settings.whatsappReminderActive) {
      try {
        const daysNotice =
          diffDays === 0
            ? "⚠️ *HARI INI ADALAH HARI TERAKHIR JATUH TEMPO*"
            : `⏳ *Jatuh tempo tersisa ${diffDays} hari lagi* (${dueDateStr})`

        let message = `Halo *${tenant.name}*,\n\nIni adalah pengingat tagihan sewa kost untuk *Kamar ${tenant.room.number}* periode *${periodLabel}*.\n\n${daysNotice}\n\nNo. Invoice: *${invoiceNumber}*\nTotal Tagihan: *${formattedAmount}*\n\nSilakan selesaikan pembayaran ke rekening resmi kost sebelum tanggal jatuh tempo berakhir. Terima kasih!`

        if (invoiceUrl) {
          message += `\n\n📄 Unduh Dokumen Tagihan (PDF): ${invoiceUrl}`
        }

        const waRes = await sendWhatsAppMessage(tenant.phone, message, invoiceUrl || undefined)
        waSent = waRes.success
      } catch (e) {
        console.error("Gagal kirim WA reminder:", e)
      }
    }

    // Update status payment dan waktu pengiriman terakhir
    await prisma.payment.update({
      where: { id: targetPayment.id },
      data: {
        invoiceUrl: invoiceUrl || targetPayment.invoiceUrl,
        invoiceSentAt: new Date(),
        status: targetPayment.status === "BELUM_BAYAR" ? "TERKIRIM" : targetPayment.status
      }
    })

    results.push({
      tenantId: tenant.id,
      tenantName: tenant.name,
      roomNumber: tenant.room.number,
      email: tenant.email,
      phone: tenant.phone,
      invoiceNumber,
      amount: billAmount,
      periodLabel,
      dueDate: dueDateStr,
      daysLeft: diffDays,
      emailSent,
      waSent
    })
  }

  return {
    success: true,
    processedCount: results.length,
    settings,
    results
  }
}

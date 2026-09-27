"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"
import prisma from "@/lib/prisma"
import { hashPassword } from "@/src/lib/tenant-auth"

// Fungsi helper kecil untuk upload agar kode tidak berulang
async function uploadFile(file: File, bucket: string) {
  if (!file || file.size === 0) return null
  const supabase = await createClient()
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: file.type || "image/jpeg",
      duplex: 'half'
    })
  if (error || !data) return null
  
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return publicData.publicUrl
}

import { generateReceiptPDF } from "@/src/lib/receipt"
import { getPeriodLabel, getPeriodDateRange, MONTHS } from "@/src/lib/period"
import { sendReceiptEmail } from "@/src/lib/email"
import { sendWhatsAppMessage } from "@/src/lib/whatsapp"

export async function addTenant(formData: FormData) {
  const name = formData.get("name") as string
  const nik = formData.get("nik") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const passwordRaw = formData.get("password") as string
  const gender = formData.get("gender") as string
  const address = formData.get("address") as string
  const roomId = formData.get("roomId") as string
  const joinDateStr = formData.get("joinDate") as string

  // Data Pembayaran Awal (Prinsip Bayar Dulu Baru Nempatin)
  const durationMonth = parseInt(formData.get("durationMonth") as string) || 1
  const amount = parseFloat(formData.get("amount") as string) || 0
  const method = (formData.get("method") as string) || "Tunai"
  const periodLabelCustom = formData.get("periodLabel") as string

  const ktpFile = formData.get("ktpPhoto") as File
  const photoFile = formData.get("photo") as File
  const proofFile = formData.get("proofUrl") as File

  const ktpUrl = await uploadFile(ktpFile, "tenants")
  const photoUrl = await uploadFile(photoFile, "tenants")
  const proofUrl = await uploadFile(proofFile, "payments")

  const passwordHashed = passwordRaw ? hashPassword(passwordRaw.trim()) : null
  const joinDate = joinDateStr ? new Date(joinDateStr) : new Date()
  const startMonth = joinDate.getMonth() + 1
  const startYear = joinDate.getFullYear()
  const periodLabel = periodLabelCustom || getPeriodDateRange(joinDate, durationMonth).label

  // Menggunakan Transaction: Buat Penghuni + Update Status Kamar + Catat Pembayaran Perdana
  const result = await prisma.$transaction(async (tx) => {
    // 1. Buat data Penghuni
    const newTenant = await tx.tenant.create({
      data: {
        name, nik, phone, email,
        password: passwordHashed,
        gender, address, roomId,
        joinDate,
        ktpPhoto: ktpUrl,
        photo: photoUrl,
      },
      include: { room: true }
    })

    // 2. Tandai Kamar menjadi TERISI
    await tx.room.update({
      where: { id: roomId },
      data: { status: "TERISI" }
    })

    // 3. Catat Pembayaran Sewa Perdana LUNAS (Bayar Dulu Baru Nempatin)
    let initialPayment = null
    if (amount > 0) {
      initialPayment = await tx.payment.create({
        data: {
          tenantId: newTenant.id,
          month: startMonth,
          year: startYear,
          durationMonth,
          periodLabel,
          amount,
          paymentDate: new Date(),
          method,
          status: "LUNAS",
          proofUrl: proofUrl || null
        }
      })
    }

    return { tenant: newTenant, payment: initialPayment }
  })

  // 4. Generate Kuitansi PDF & Kirim Notifikasi Email / WA jika ada pembayaran
  if (result.payment) {
    try {
      const pdfBuffer = generateReceiptPDF({
        paymentId: result.payment.id,
        tenantName: result.tenant.name,
        roomNumber: result.tenant.room.number,
        monthName: MONTHS[startMonth - 1],
        year: startYear,
        periodLabel,
        amount,
        paymentDate: result.payment.paymentDate,
        method
      })

      const supabase = await createClient()
      const receiptPath = `receipts/receipt-${result.payment.id}.pdf`

      const { data: uploadData } = await supabase.storage
        .from("payments")
        .upload(receiptPath, pdfBuffer, {
          contentType: "application/pdf",
          duplex: "half"
        })

      let receiptUrl = proofUrl || undefined
      if (uploadData) {
        const { data: publicData } = supabase.storage.from("payments").getPublicUrl(uploadData.path)
        receiptUrl = publicData.publicUrl

        await prisma.payment.update({
          where: { id: result.payment.id },
          data: { proofUrl: receiptUrl }
        })
      }

      // Kirim Email Kuitansi via Resend
      if (result.tenant.email) {
        await sendReceiptEmail({
          to: result.tenant.email,
          tenantName: result.tenant.name,
          roomNumber: result.tenant.room.number,
          period: periodLabel,
          amount,
          paymentDate: result.payment.paymentDate,
          method,
          receiptPdfBuffer: pdfBuffer,
          receiptUrl
        })
      }

      // Kirim WhatsApp (Backup)
      if (result.tenant.phone) {
        const formattedAmount = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)
        const message = `Halo ${result.tenant.name},\n\nSelamat datang di *KOST BU WATI*! Pembayaran sewa perdana Anda untuk periode *${periodLabel}* sebesar *${formattedAmount}* telah LUNAS.\n\nKuitansi digital resmi telah terlampir. Anda kini resmi dapat menempati Kamar ${result.tenant.room.number}. Terima kasih.`
        await sendWhatsAppMessage(result.tenant.phone, message, receiptUrl)
      }
    } catch (err) {
      console.error("Gagal mengirim kuitansi pembayaran perdana:", err)
    }
  }

  // Revalidate halaman terkait
  revalidatePath("/dashboard/penghuni")
  revalidatePath("/dashboard/kamar")
  revalidatePath("/dashboard/pembayaran")
  redirect("/dashboard/penghuni")
}

export async function removeTenant(formData: FormData) {
  const id = formData.get("id") as string
  const roomId = formData.get("roomId") as string

  // Hapus semua cicilan dan pembayaran terkait, lalu hapus Penghuni & kosongkan kamar
  await prisma.$transaction(async (tx) => {
    // 1. Cari semua payment milik tenant ini
    const payments = await tx.payment.findMany({
      where: { tenantId: id },
      select: { id: true }
    })
    const paymentIds = payments.map(p => p.id)

    // 2. Hapus installment jika ada
    if (paymentIds.length > 0) {
      await tx.paymentInstallment.deleteMany({
        where: { paymentId: { in: paymentIds } }
      })
      await tx.payment.deleteMany({
        where: { id: { in: paymentIds } }
      })
    }

    // 3. Hapus tenant
    await tx.tenant.delete({ where: { id } })

    // 4. Update status kamar
    if (roomId) {
      await tx.room.update({ where: { id: roomId }, data: { status: "KOSONG" } })
    }
  })
  
  revalidatePath("/dashboard/penghuni")
  revalidatePath("/dashboard/kamar")
  revalidatePath("/dashboard/pembayaran")
}

export async function checkoutTenant(formData: FormData) {
  const id = formData.get("id") as string
  const roomId = formData.get("roomId") as string
  const leaveDateStr = formData.get("leaveDate") as string
  
  const leaveDate = leaveDateStr ? new Date(leaveDateStr) : new Date()

  // Ubah status Penghuni jadi TIDAK_AKTIF dan kosongkan Kamar
  await prisma.$transaction([
    prisma.tenant.update({
      where: { id },
      data: {
        status: "TIDAK_AKTIF",
        leaveDate: leaveDate
      }
    }),
    prisma.room.update({ 
      where: { id: roomId }, 
      data: { status: "KOSONG" } 
    })
  ])

  revalidatePath("/dashboard/penghuni")
  revalidatePath("/dashboard/kamar")
}

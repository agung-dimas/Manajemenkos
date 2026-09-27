"use server"

import { sendEmail } from "@/src/lib/email"

export async function getResendStatus() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return {
      configured: false,
      mode: "SIMULATED",
      message: "API Key Resend belum diatur di .env. Notifikasi berjalan dalam mode simulasi."
    }
  }

  return {
    configured: true,
    mode: "LIVE",
    from: process.env.RESEND_FROM || "KOST BU WATI <onboarding@resend.dev>",
    message: "Resend Email API siap digunakan. Kuitansi & invoice akan dikirim ke email penghuni."
  }
}

export async function sendTestEmail(targetEmail: string) {
  if (!targetEmail || !targetEmail.includes("@")) {
    return { success: false, error: "Alamat email penerima tidak valid" }
  }

  const html = `
    <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 520px; border: 1px solid #e2e8f0; border-radius: 12px; margin: 0 auto; background: #ffffff;">
      <h2 style="color: #4f46e5; margin-top: 0; font-size: 20px;">Uji Coba Notifikasi Email Berhasil! 🎉</h2>
      <p style="font-size: 14px; line-height: 1.6;">Halo,</p>
      <p style="font-size: 14px; line-height: 1.6;">Ini adalah email konfirmasi uji coba dari sistem <strong>KOST BU WATI</strong> melalui <strong>Resend API</strong>.</p>
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #e2e8f0;">
        <p style="font-size: 13px; font-weight: 600; margin: 0 0 8px; color: #334155;">Fitur Notifikasi Aktif:</p>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
          <li>Kuitansi Pembayaran Lunas (PDF)</li>
          <li>Invoice Tagihan Jatuh Tempo (H-3)</li>
          <li>Tanda Terima Pembayaran Cicilan Sewa</li>
        </ul>
      </div>
      <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">Dikirim otomatis oleh Sistem Manajemen KOST BU WATI</p>
    </div>
  `

  return await sendEmail({
    to: targetEmail,
    subject: "Uji Coba Notifikasi Resend - KOST BU WATI",
    html
  })
}

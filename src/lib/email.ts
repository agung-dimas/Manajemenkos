/**
 * Email Notification Service using Resend API
 */

interface EmailAttachment {
  filename: string
  content: string // Base64 string
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailParams): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM || "KOST BU WATI <onboarding@resend.dev>"

  // Mode Simulasi jika API Key belum dipasang
  if (!apiKey) {
    console.log(`\n--- [RESEND EMAIL SIMULATION] ---`)
    console.log(`Penerima : ${to}`)
    console.log(`Subjek   : ${subject}`)
    console.log(`Lampiran : ${attachments?.map(a => a.filename).join(", ") || "Tidak ada"}`)
    console.log(`---------------------------------\n`)
    return { success: true, data: { detail: "Mode simulasi berhasil (API Key belum diatur)" } }
  }

  try {
    const payload: any = {
      from,
      to: [to],
      subject,
      html,
    }

    if (attachments && attachments.length > 0) {
      payload.attachments = attachments
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (response.ok) {
      console.log(`[RESEND] Email berhasil dikirim ke: ${to} (ID: ${result.id})`)
      return { success: true, data: result }
    } else {
      console.error(`[RESEND ERROR] Gagal mengirim ke ${to}:`, result)
      return { success: false, error: result.message || "Gagal mengirim email via Resend" }
    }
  } catch (err: any) {
    console.error("[RESEND EXCEPTION] Error jaringan:", err)
    return { success: false, error: err.message || "Terjadi kesalahan koneksi ke Resend" }
  }
}

// ---------------------------------------------------------------------------
// 1. Template Email Kuitansi Pembayaran Lunas
// ---------------------------------------------------------------------------
export async function sendReceiptEmail(params: {
  to: string
  tenantName: string
  roomNumber: string
  period: string
  amount: number
  paymentDate: Date | null
  method: string | null
  receiptPdfBuffer?: Buffer
  receiptUrl?: string
}) {
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(params.amount)

  const dateStr = params.paymentDate
    ? new Date(params.paymentDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "-"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0 0 4px; font-size: 24px; letter-spacing: -0.5px; }
        .header p { margin: 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 28px 24px; }
        .badge { display: inline-block; background-color: #dcfce7; color: #15803d; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px; }
        .table-info { width: 100%; border-collapse: collapse; margin: 16px 0 24px; }
        .table-info td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .table-info td:first-child { color: #64748b; width: 40%; }
        .table-info td:last-child { font-weight: 600; text-align: right; }
        .total-box { background: #f8fafc; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px; border: 1px dashed #cbd5e1; }
        .total-box .nominal { font-size: 26px; font-weight: 800; color: #4f46e5; margin-top: 4px; }
        .btn { display: inline-block; background-color: #4f46e5; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 20px 24px 28px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>KOST BU WATI</h1>
          <p>Kuitansi Digital Pembayaran Resmi</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <span class="badge">✓ PEMBAYARAN LUNAS</span>
          </div>
          <p>Halo <strong>${params.tenantName}</strong>,</p>
          <p>Terima kasih! Pembayaran sewa kost Anda telah berhasil kami terima dan dinyatakan <strong>LUNAS</strong>. Berikut rincian pembayaran Anda:</p>
          
          <table class="table-info">
            <tr>
              <td>Kamar</td>
              <td>Kamar ${params.roomNumber}</td>
            </tr>
            <tr>
              <td>Periode Sewa</td>
              <td>${params.period}</td>
            </tr>
            <tr>
              <td>Metode Pembayaran</td>
              <td>${params.method || "Transfer Bank"}</td>
            </tr>
            <tr>
              <td>Tanggal Pelunasan</td>
              <td>${dateStr}</td>
            </tr>
          </table>

          <div class="total-box">
            <div style="font-size: 12px; color: #64748b; font-weight: 500;">TOTAL DIBAYARKAN</div>
            <div class="nominal">${formattedAmount}</div>
          </div>

          ${params.receiptUrl ? `
            <div style="text-align: center; margin-top: 20px;">
              <a href="${params.receiptUrl}" target="_blank" class="btn">Unduh Kuitansi PDF</a>
            </div>
          ` : ""}
          <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 14px;">Dokumen bukti kuitansi resmi dalam format PDF juga telah dilampirkan pada email ini.</p>
        </div>
        <div class="footer">
          <p>KOST BU WATI — Sistem Manajemen Kost Terpadu</p>
          <p>Email ini dikirim secara otomatis. Simpan email ini sebagai bukti transaksi resmi Anda.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const attachments: EmailAttachment[] = []
  if (params.receiptPdfBuffer) {
    attachments.push({
      filename: `Kuitansi-Sewa-${params.tenantName.replace(/\s+/g, "_")}.pdf`,
      content: params.receiptPdfBuffer.toString("base64")
    })
  }

  return await sendEmail({
    to: params.to,
    subject: `[Kuitansi Lunas] Pembayaran Kost Periode ${params.period} - Kamar ${params.roomNumber}`,
    html,
    attachments: attachments.length > 0 ? attachments : undefined
  })
}

// ---------------------------------------------------------------------------
// 2. Template Email Tagihan Sewa (Invoice)
// ---------------------------------------------------------------------------
export async function sendInvoiceEmail(params: {
  to: string
  tenantName: string
  roomNumber: string
  period: string
  amount: number
  dueDate: Date
  invoiceNumber: string
  invoicePdfBuffer?: Buffer
  invoiceUrl?: string
}) {
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(params.amount)

  const dueDateStr = new Date(params.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #1e293b, #334155); color: white; padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0 0 4px; font-size: 24px; }
        .header p { margin: 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 28px 24px; }
        .table-info { width: 100%; border-collapse: collapse; margin: 16px 0 24px; }
        .table-info td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .table-info td:first-child { color: #64748b; width: 40%; }
        .table-info td:last-child { font-weight: 600; text-align: right; }
        .total-box { background: #fef2f2; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px; border: 1px dashed #fca5a5; }
        .total-box .nominal { font-size: 26px; font-weight: 800; color: #dc2626; margin-top: 4px; }
        .btn { display: inline-block; background-color: #4f46e5; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 20px 24px 28px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>KOST BU WATI</h1>
          <p>Surat Tagihan Pembayaran Sewa Kost</p>
        </div>
        <div class="content">
          <p>Halo <strong>${params.tenantName}</strong>,</p>
          <p>Berikut kami sampaikan rincian tagihan sewa kost Anda untuk periode mendatang:</p>
          
          <table class="table-info">
            <tr>
              <td>Nomor Invoice</td>
              <td>${params.invoiceNumber}</td>
            </tr>
            <tr>
              <td>Kamar</td>
              <td>Kamar ${params.roomNumber}</td>
            </tr>
            <tr>
              <td>Periode Sewa</td>
              <td>${params.period}</td>
            </tr>
            <tr>
              <td>Jatuh Tempo</td>
              <td style="color: #dc2626;">${dueDateStr}</td>
            </tr>
          </table>

          <div class="total-box">
            <div style="font-size: 12px; color: #991b1b; font-weight: 500;">TOTAL TAGIHAN</div>
            <div class="nominal">${formattedAmount}</div>
          </div>

          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            Silakan melakukan pembayaran transfer ke rekening resmi kost dan konfirmasikan pembayaran Anda kepada pengelola kost. Terima kasih atas kerja samanya.
          </p>

          ${params.invoiceUrl ? `
            <div style="text-align: center; margin-top: 20px;">
              <a href="${params.invoiceUrl}" target="_blank" class="btn">Lihat Dokumen Tagihan (PDF)</a>
            </div>
          ` : ""}
        </div>
        <div class="footer">
          <p>KOST BU WATI — Sistem Manajemen Kost Terpadu</p>
          <p>Email ini dikirim secara otomatis sebagai pengingat tagihan sewa Anda.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const attachments: EmailAttachment[] = []
  if (params.invoicePdfBuffer) {
    attachments.push({
      filename: `Invoice-${params.invoiceNumber}.pdf`,
      content: params.invoicePdfBuffer.toString("base64")
    })
  }

  return await sendEmail({
    to: params.to,
    subject: `[Tagihan Sewa] Invoice ${params.invoiceNumber} - Periode ${params.period} (Kamar ${params.roomNumber})`,
    html,
    attachments: attachments.length > 0 ? attachments : undefined
  })
}

// ---------------------------------------------------------------------------
// 3. Template Email Cicilan Pembayaran
// ---------------------------------------------------------------------------
export async function sendInstallmentReceiptEmail(params: {
  to: string
  tenantName: string
  roomNumber: string
  period: string
  amount: number
  remainingBalance: number
  isLunas: boolean
  receiptPdfBuffer?: Buffer
  receiptUrl?: string
}) {
  const formattedAmount = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(params.amount)
  const formattedRemaining = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(params.remainingBalance)

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; padding: 24px; text-align: center; }
        .content { padding: 24px; font-size: 14px; }
        .box { background: #f8fafc; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e2e8f0; }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 16px 24px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2 style="margin:0;">KOST BU WATI</h2>
          <p style="margin:4px 0 0; font-size:13px;">Kuitansi Setoran Cicilan Sewa</p>
        </div>
        <div class="content">
          <p>Halo <strong>${params.tenantName}</strong>,</p>
          <p>Setoran pembayaran cicilan Anda untuk <strong>Kamar ${params.roomNumber} (Periode ${params.period})</strong> telah berhasil kami terima.</p>
          
          <div class="box">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
              <span>Nominal Cicilan Diterima:</span>
              <strong style="color:#059669;">${formattedAmount}</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span>Sisa Tagihan:</span>
              <strong style="color:${params.isLunas ? '#059669' : '#dc2626'};">${params.isLunas ? 'LUNAS (Rp 0)' : formattedRemaining}</strong>
            </div>
          </div>

          <p style="font-size:12px; color:#64748b;">Kuitansi resmi PDF telah terlampir pada email ini.</p>
        </div>
        <div class="footer">
          KOST BU WATI — Sistem Manajemen Kost Terpadu
        </div>
      </div>
    </body>
    </html>
  `

  const attachments: EmailAttachment[] = []
  if (params.receiptPdfBuffer) {
    attachments.push({
      filename: `Kuitansi-Cicilan-${params.tenantName.replace(/\s+/g, "_")}.pdf`,
      content: params.receiptPdfBuffer.toString("base64")
    })
  }

  return await sendEmail({
    to: params.to,
    subject: `[Kuitansi Cicilan] Setoran Sewa Kamar ${params.roomNumber} (${params.period})`,
    html,
    attachments: attachments.length > 0 ? attachments : undefined
  })
}

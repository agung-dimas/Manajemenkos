import { jsPDF } from "jspdf"

interface ReceiptData {
  paymentId: string
  tenantName: string
  roomNumber: string
  monthName: string
  year: number
  periodLabel?: string
  amount: number
  paymentDate: Date | null
  method: string | null
  installmentAmount?: number // Jika ini kuitansi cicilan
  remainingBalance?: number  // Sisa tagihan
}

export function generateReceiptPDF(data: ReceiptData): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a6" // A6 size is perfect for quick digital receipts
  })

  // Colors
  const primaryColor = [79, 70, 229] // Indigo
  const textColor = [39, 39, 42] // Zinc 800
  const lightTextColor = [113, 113, 122] // Zinc 500

  // 1. Header & Title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text("KOST BUWATI", 10, 15)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2])
  doc.text("Kuitansi Digital Pembayaran Kost", 10, 20)

  // Divider line
  doc.setDrawColor(228, 228, 231) // Zinc 200
  doc.line(10, 24, 95, 24)

  const isInstallment = data.installmentAmount !== undefined && data.remainingBalance !== undefined

  // 2. Receipt Details
  doc.setFontSize(7)
  doc.text(`KUITANSI NO : INV-${data.paymentId.substring(0, 8).toUpperCase()}`, 10, 29)
  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
  doc.text(`TANGGAL CETAK: ${printDate}`, 10, 33)

  // 3. Billing Info Box
  doc.setFillColor(244, 244, 245) // Zinc 100 background
  doc.roundedRect(10, 38, 85, 52, 2, 2, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text("RINCIAN PEMBAYARAN", 14, 44)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  
  doc.text("Nama Penghuni", 14, 50)
  doc.text(`: ${data.tenantName}`, 38, 50)

  doc.text("Nomor Kamar", 14, 55)
  doc.text(`: Kamar ${data.roomNumber}`, 38, 55)

  doc.text("Periode Sewa", 14, 60)
  doc.text(`: ${data.periodLabel || `${data.monthName} ${data.year}`}`, 38, 60)

  doc.text("Metode Bayar", 14, 65)
  doc.text(`: ${data.method || "Transfer Bank"}`, 38, 65)

  doc.text("Tanggal Bayar", 14, 70)
  const payDateStr = data.paymentDate 
    ? new Date(data.paymentDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "-"
  doc.text(`: ${payDateStr}`, 38, 70)

  doc.text("Tagihan Pokok", 14, 75)
  const totalAmountStr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(data.amount)
  doc.text(`: ${totalAmountStr}`, 38, 75)

  doc.text("Status", 14, 80)
  doc.setFont("helvetica", "bold")
  if (isInstallment && data.remainingBalance! > 0) {
    doc.setTextColor(234, 88, 12) // Orange for partial
    doc.text(": SEBAGIAN (CICILAN)", 38, 80)
  } else {
    doc.setTextColor(22, 163, 74) // Green for LUNAS
    doc.text(": LUNAS", 38, 80)
  }

  if (isInstallment) {
    doc.setFont("helvetica", "normal")
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text("Sisa Tagihan", 14, 85)
    doc.setTextColor(220, 38, 38) // Red for debt
    const debtStr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(data.remainingBalance!)
    doc.text(`: ${debtStr}`, 38, 85)
  }

  // 4. Amount Summary
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text(isInstallment ? "NOMINAL SETORAN:" : "TOTAL BAYAR:", 10, 98)
  
  const displayAmount = isInstallment ? data.installmentAmount! : data.amount
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(displayAmount)
  
  doc.setFontSize(12)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text(formattedAmount, 50, 98)

  // Divider
  doc.setDrawColor(228, 228, 231)
  doc.line(10, 105, 95, 105)

  // 5. Footer Notes
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2])
  doc.text("Kuitansi ini diterbitkan secara otomatis dan sah sebagai bukti", 10, 110)
  doc.text("pembayaran uang kost bulanan Anda.", 10, 114)
  doc.text("Terima kasih atas kerja samanya!", 10, 120)

  // Return binary buffer
  const pdfArrayBuffer = doc.output("arraybuffer")
  return Buffer.from(pdfArrayBuffer)
}

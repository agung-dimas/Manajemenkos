import { jsPDF } from "jspdf"

interface InvoiceData {
  invoiceNumber: string
  tenantName: string
  roomNumber: string
  monthName: string
  year: number
  periodLabel?: string
  amount: number
  dueDate: Date
}

export function generateInvoicePDF(data: InvoiceData): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a6" // A6 size is perfect for quick digital receipts
  })

  // Colors
  const primaryColor = [220, 38, 38] // Red-600 for invoices/billing
  const textColor = [39, 39, 42] // Zinc 800
  const lightTextColor = [113, 113, 122] // Zinc 500

  // Header / Nama Kost
  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.setTextColor(30, 41, 59) // slate-800
  doc.text("KOST BUWATI", 10, 15)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2])
  doc.text("Tagihan Pembayaran Kost", 10, 20)

  // Divider line
  doc.setDrawColor(228, 228, 231) // Zinc 200
  doc.line(10, 24, 95, 24)

  // 2. Receipt Details
  doc.setFontSize(7)
  doc.text(`INVOICE NO : ${data.invoiceNumber.toUpperCase()}`, 10, 29)
  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
  doc.text(`TANGGAL CETAK: ${printDate}`, 10, 33)

  // 3. Billing Info Box
  doc.setFillColor(244, 244, 245) // Zinc 100 background
  doc.roundedRect(10, 38, 85, 48, 2, 2, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text("RINCIAN TAGIHAN", 14, 44)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  
  doc.text("Nama Penghuni", 14, 50)
  doc.text(`: ${data.tenantName}`, 38, 50)

  doc.text("Nomor Kamar", 14, 55)
  doc.text(`: Kamar ${data.roomNumber}`, 38, 55)

  doc.text("Periode Sewa", 14, 60)
  doc.text(`: ${data.periodLabel || `${data.monthName} ${data.year}`}`, 38, 60)

  doc.text("Jatuh Tempo", 14, 65)
  const dueDateStr = new Date(data.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  doc.text(`: ${dueDateStr}`, 38, 65)

  doc.text("Status", 14, 75)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(220, 38, 38) // Red
  doc.text(": BELUM BAYAR", 38, 75)

  // 4. Amount Summary
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text("TOTAL TAGIHAN:", 10, 95)
  
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(data.amount)
  
  doc.setFontSize(12)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text(formattedAmount, 42, 95)

  // Divider
  doc.setDrawColor(228, 228, 231)
  doc.line(10, 102, 95, 102)

  // 5. Footer Notes
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2])
  doc.text("Silakan lakukan pembayaran sebelum tanggal jatuh tempo", 10, 108)
  doc.text("melalui transfer ke rekening resmi kost.", 10, 112)
  doc.text("Harap konfirmasi setelah melakukan transfer.", 10, 116)
  doc.text("Abaikan tagihan ini jika Anda sudah membayar.", 10, 120)

  // Return binary buffer
  const pdfArrayBuffer = doc.output("arraybuffer")
  return Buffer.from(pdfArrayBuffer)
}

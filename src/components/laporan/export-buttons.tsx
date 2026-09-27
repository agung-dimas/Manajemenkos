"use client"

import { Button } from "@/components/ui/button"
import { FileText, FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Definisikan tipe data sederhana agar TypeScript tidak protes
interface ExportButtonsProps {
  data: any[]
}

export function ExportButtons({ data }: ExportButtonsProps) {
  // Format ulang data dari database agar rapi saat dicetak
  const formattedData = data.map((item, index) => ({
    No: index + 1,
    Penghuni: item.tenant.name,
    Kamar: item.tenant.room.number,
    Periode: item.periodLabel || `${item.month}/${item.year}`,
    Nominal: item.amount,
    Status: item.status,
    TanggalBayar: item.paymentDate ? new Date(item.paymentDate).toLocaleDateString("id-ID") : "-"
  }))

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Pembayaran")
    XLSX.writeFile(workbook, "Laporan_Pembayaran_Kost.xlsx")
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    
    // Judul PDF
    doc.setFontSize(16)
    doc.text("Laporan Pembayaran KOST BUWATI", 14, 15)
    doc.setFontSize(10)
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22)

    // Setup Kolom & Baris untuk Autotable
    const tableColumn = ["No", "Penghuni", "Kamar", "Periode", "Nominal", "Status", "Tgl Bayar"]
    const tableRows = formattedData.map(item => [
      item.No, 
      item.Penghuni, 
      item.Kamar, 
      item.Periode,
      new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(item.Nominal as number),
      item.Status, 
      item.TanggalBayar
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    })

    doc.save("Laporan_Pembayaran_Kost.pdf")
  }

  return (
    <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
      <Button onClick={exportExcel} variant="outline" className="w-full sm:w-auto text-emerald-600 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950">
        <FileSpreadsheet className="mr-2 h-4 w-4 shrink-0" /> Export Excel
      </Button>
      <Button onClick={exportPDF} variant="outline" className="w-full sm:w-auto text-rose-600 border-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950">
        <FileText className="mr-2 h-4 w-4 shrink-0" /> Export PDF
      </Button>
    </div>
  )
}

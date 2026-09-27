import Link from "next/link"
import { getActiveTenants } from "@/src/repositories/pembayaran.repo"
import { FormTambahPembayaran } from "@/src/components/pembayaran/form-tambah-pembayaran"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default async function TambahPembayaranPage() {
  const tenants = await getActiveTenants()
  const currentMonth = new Date().getMonth() + 1 // 1-12
  const currentYear = new Date().getFullYear()

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pembayaran">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catat Pembayaran Baru</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dukung sewa bulanan, 3 bulan, 6 bulan, tahunan, atau jumlah bulan kustom.
          </p>
        </div>
      </div>

      <FormTambahPembayaran
        tenants={tenants as any}
        initialMonth={currentMonth}
        initialYear={currentYear}
      />
    </div>
  )
}

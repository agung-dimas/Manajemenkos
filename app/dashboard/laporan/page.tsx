import { getLaporanPembayaran } from "@/src/repositories/laporan.repo"
import { ExportButtons } from "@/src/components/laporan/export-buttons"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function LaporanPage() {
  // Ambil data di server
  const data = await getLaporanPembayaran()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Pembayaran</h1>
          <p className="text-muted-foreground">Unduh rekapitulasi data ke format PDF atau Excel.</p>
        </div>
        
        {/* Tombol Export yang telah kita buat */}
        <ExportButtons data={data} />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Penghuni (Kamar)</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Bayar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  Data belum tersedia.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.tenant.name} ({item.tenant.room.number})
                  </TableCell>
                  <TableCell>{item.periodLabel || `${item.month}/${item.year}`}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(item.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === "LUNAS" ? "default" : "destructive"}>
                      {item.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.paymentDate ? format(new Date(item.paymentDate), "dd MMM yyyy") : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {data.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Data belum tersedia.
          </Card>
        ) : (
          data.map((item: any) => (
            <Card key={item.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-base block">{item.tenant.name}</span>
                  <span className="text-sm text-muted-foreground">Kamar {item.tenant.room.number}</span>
                </div>
                <Badge variant={item.status === "LUNAS" ? "default" : "destructive"}>
                  {item.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Periode:</span>
                  <span className="text-foreground">{item.periodLabel || `${item.month}/${item.year}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nominal:</span>
                  <span className="font-semibold text-foreground">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal Bayar:</span>
                  <span className="text-foreground">{item.paymentDate ? format(new Date(item.paymentDate), "dd MMM yyyy") : "-"}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

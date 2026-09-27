import Link from "next/link"
import { addExpense } from "@/src/actions/pengeluaran.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft } from "lucide-react"

export default function TambahPengeluaranPage() {
  const currentDate = new Date().toISOString().split("T")[0]

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pengeluaran">
          <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Catat Pengeluaran Baru</h1>
      </div>

      <form action={addExpense} className="space-y-6 bg-card p-6 border rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nama Pengeluaran</Label>
            <Input id="title" name="title" placeholder="Contoh: Pembayaran Token Listrik" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select name="category" defaultValue="Listrik">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Listrik">Listrik</SelectItem>
                <SelectItem value="Air">Air (PDAM)</SelectItem>
                <SelectItem value="Gaji">Gaji Petugas</SelectItem>
                <SelectItem value="Perbaikan">Perbaikan & Pemeliharaan</SelectItem>
                <SelectItem value="WiFi">Internet / WiFi</SelectItem>
                <SelectItem value="Lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Nominal Pengeluaran (Rp)</Label>
            <Input id="amount" name="amount" type="number" placeholder="Misal: 500000" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal Pengeluaran</Label>
            <Input id="date" name="date" type="date" defaultValue={currentDate} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi / Catatan Tambahan (Opsional)</Label>
          <Textarea id="description" name="description" placeholder="Catatan opsional..." />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Link href="/dashboard/pengeluaran" className="w-full sm:w-auto">
            <Button variant="outline" type="button" className="w-full">Batal</Button>
          </Link>
          <Button type="submit" className="w-full sm:w-auto">Simpan Pengeluaran</Button>
        </div>
      </form>
    </div>
  )
}

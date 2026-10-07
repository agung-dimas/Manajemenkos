import Link from "next/link"
import { addRoom } from "@/src/actions/kamar.action"
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"
import { Input } from "@/components/ui/input"
import { RupiahInput } from "@/components/ui/rupiah-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft } from "lucide-react"
import { FasilitasSelector } from "@/components/kamar/FasilitasSelector"

export default function TambahKamarPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/kamar">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Tambah Kamar Baru</h1>
      </div>

      <form action={addRoom} className="space-y-6 bg-card p-6 border rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="number">Nomor Kamar</Label>
            <Input id="number" name="number" placeholder="Contoh: A-101" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="floor">Lantai</Label>
            <Input id="floor" name="floor" type="number" min="1" defaultValue="1" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Harga Sewa (Per Bulan)</Label>
            <RupiahInput id="price" name="price" placeholder="1.500.000" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status Kamar</Label>
            <Select name="status" defaultValue="KOSONG">
              <SelectTrigger>
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KOSONG">Kosong</SelectItem>
                <SelectItem value="TERISI">Terisi</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="size">Ukuran Kamar (Opsional)</Label>
            <Input id="size" name="size" placeholder="Contoh: 3x4 meter" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="photo">Foto Kamar (Opsional)</Label>
            <Input id="photo" name="photo" type="file" accept="image/*" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea id="description" name="description" placeholder="Catatan tambahan tentang kamar ini..." />
        </div>

        {/* Fasilitas & Inventaris Kamar */}
        <FasilitasSelector />

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Link href="/dashboard/kamar" className="w-full sm:w-auto">
            <Button variant="outline" type="button" className="w-full">Batal</Button>
          </Link>
          <SubmitButton pendingText="Menyimpan Kamar..." className="w-full sm:w-auto">Simpan Kamar</SubmitButton>
        </div>
      </form>
    </div>
  )
}

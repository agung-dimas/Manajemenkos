import Link from "next/link"
import { getRoomById } from "@/src/repositories/kamar.repo"
import { editRoom } from "@/src/actions/kamar.action"
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"
import { Input } from "@/components/ui/input"
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
import { redirect } from "next/navigation"
import { FasilitasSelector } from "@/components/kamar/FasilitasSelector"

interface EditKamarPageProps {
  params: Promise<{ id: string }>
}

export default async function EditKamarPage({ params }: EditKamarPageProps) {
  const { id } = await params
  const room = await getRoomById(id)

  if (!room) {
    redirect("/dashboard/kamar")
  }

  // Bind the action to pass the room's ID automatically
  const editRoomWithId = editRoom.bind(null, id)

  const initialFacilities = (room as any).facilities?.map((f: any) => f.name) || []

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/kamar">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Ubah Data Kamar</h1>
      </div>

      <form action={editRoomWithId} className="space-y-6 bg-card p-6 border rounded-lg shadow-sm">
        <input type="hidden" name="existingPhoto" value={room.photos?.[0] || ""} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="number">Nomor Kamar</Label>
            <Input id="number" name="number" defaultValue={room.number} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="floor">Lantai</Label>
            <Input id="floor" name="floor" type="number" min="1" defaultValue={room.floor} required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Harga Sewa (Per Bulan)</Label>
            <Input id="price" name="price" type="number" defaultValue={room.price} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status Kamar</Label>
            <Select name="status" defaultValue={room.status}>
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
            <Input id="size" name="size" defaultValue={room.size || ""} placeholder="Contoh: 3x4 meter" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="photo">Foto Kamar (Ubah Baru)</Label>
            <Input id="photo" name="photo" type="file" accept="image/*" />
            {room.photos?.[0] && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                Foto saat ini: <a href={room.photos[0]} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Lihat Foto</a>
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea id="description" name="description" defaultValue={room.description || ""} placeholder="Catatan tambahan tentang kamar ini..." />
        </div>

        {/* Fasilitas & Inventaris Kamar */}
        <FasilitasSelector initialFacilities={initialFacilities} />

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Link href="/dashboard/kamar" className="w-full sm:w-auto">
            <Button variant="outline" type="button" className="w-full">Batal</Button>
          </Link>
          <SubmitButton pendingText="Menyimpan Perubahan..." className="w-full sm:w-auto">Simpan Perubahan</SubmitButton>
        </div>
      </form>
    </div>
  )
}

import Link from "next/link"
import { getAllRooms } from "@/src/repositories/kamar.repo"
import { removeRoom } from "@/src/actions/kamar.action"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Pencil, Eye } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export default async function KamarPage() {
  const rooms = await getAllRooms()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Kamar</h1>
          <p className="text-muted-foreground">Kelola daftar kamar kost Anda di sini.</p>
        </div>
        <Link href="/dashboard/kamar/tambah" className="w-full sm:w-auto">
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Tambah Kamar
          </Button>
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Kamar</TableHead>
              <TableHead>Lantai</TableHead>
              <TableHead className="min-w-[220px]">Fasilitas & Inventaris</TableHead>
              <TableHead>Harga/Bulan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  Belum ada data kamar.
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room: any) => (
                <TableRow key={room.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <Link
                      href={`/dashboard/kamar/${room.id}`}
                      className="font-semibold text-primary hover:underline inline-flex items-center gap-1.5 group"
                    >
                      <span>Kamar {room.number}</span>
                      <Eye className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </Link>
                  </TableCell>
                  <TableCell>Lantai {room.floor}</TableCell>
                  <TableCell>
                    {room.facilities && room.facilities.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[280px]">
                        {room.facilities.slice(0, 3).map((f: any) => (
                          <Badge
                            key={f.id}
                            variant="secondary"
                            className="text-[11px] font-normal px-2 py-0.5 bg-muted/60"
                          >
                            {f.name}
                          </Badge>
                        ))}
                        {room.facilities.length > 3 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
                            +{room.facilities.length - 3} lainnya
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Standar / Kosong</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(room.price)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={room.status === "KOSONG" ? "outline" : room.status === "TERISI" ? "default" : "destructive"}>
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1.5">
                    <Link href={`/dashboard/kamar/${room.id}`}>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" title="Lihat Detail Kamar">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/kamar/edit/${room.id}`}>
                      <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600" title="Ubah Kamar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <form action={removeRoom.bind(null, room.id)}>
                      <Button type="submit" variant="ghost" size="icon" className="text-red-500 hover:text-red-600" title="Hapus Kamar">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {rooms.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Belum ada data kamar.
          </Card>
        ) : (
          rooms.map((room: any) => (
            <Card key={room.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Link
                  href={`/dashboard/kamar/${room.id}`}
                  className="font-bold text-lg text-primary hover:underline flex items-center gap-1.5"
                >
                  <span>Kamar {room.number}</span>
                  <Eye className="h-4 w-4" />
                </Link>
                <Badge variant={room.status === "KOSONG" ? "outline" : room.status === "TERISI" ? "default" : "destructive"}>
                  {room.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Lantai {room.floor}</span>
                <span className="font-semibold text-foreground">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(room.price)}/bln
                </span>
              </div>

              {/* Fasilitas di Mobile Card */}
              {room.facilities && room.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
                  {room.facilities.map((f: any) => (
                    <Badge key={f.id} variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-muted/60">
                      {f.name}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex justify-end border-t border-border/50 pt-2 gap-2">
                <Link href={`/dashboard/kamar/${room.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 h-8">
                    <Eye className="h-4 w-4" />
                    <span>Detail</span>
                  </Button>
                </Link>
                <Link href={`/dashboard/kamar/edit/${room.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 h-8 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-950/30">
                    <Pencil className="h-4 w-4" />
                    <span>Ubah</span>
                  </Button>
                </Link>
                <form action={removeRoom.bind(null, room.id)}>
                  <Button type="submit" variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 h-8">
                    <Trash2 className="h-4 w-4" />
                    <span>Hapus</span>
                  </Button>
                </form>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

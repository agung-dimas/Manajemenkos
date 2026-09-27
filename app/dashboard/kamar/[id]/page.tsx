import Link from "next/link"
import { notFound } from "next/navigation"
import { getRoomDetail } from "@/src/repositories/kamar.repo"
import { removeRoom } from "@/src/actions/kamar.action"
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChevronLeft,
  Pencil,
  Trash2,
  UserPlus,
  Building,
  Maximize2,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  CreditCard,
  FileText,
  DoorOpen,
  Image as ImageIcon
} from "lucide-react"
import { FacilityIcon } from "@/components/kamar/FacilityIcon"
import { getIconForFacility } from "@/src/lib/facilities"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

interface KamarDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function KamarDetailPage({ params }: KamarDetailPageProps) {
  const { id } = await params
  const room = await getRoomDetail(id)

  if (!room) {
    notFound()
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val || 0)
  }

  // Cari penghuni yang saat ini berstatus AKTIF di kamar ini
  const activeTenant = room.tenants?.find((t: any) => t.status === "AKTIF") || null
  const pastTenants = room.tenants?.filter((t: any) => t.status === "TIDAK_AKTIF") || []

  return (
    <div className="space-y-6 max-w-5xl pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/kamar">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Kamar {room.number}</h1>
              <Badge
                variant={room.status === "KOSONG" ? "outline" : room.status === "TERISI" ? "default" : "destructive"}
                className="text-xs px-2.5 py-0.5"
              >
                {room.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lantai {room.floor} • KOST BU WATI
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {room.status === "KOSONG" && (
            <Link href={`/dashboard/penghuni/tambah?roomId=${room.id}`}>
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                <UserPlus className="h-4 w-4" />
                <span>Daftarkan Penghuni</span>
              </Button>
            </Link>
          )}
          <Link href={`/dashboard/kamar/edit/${room.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-4 w-4 text-blue-500" />
              <span>Ubah Kamar</span>
            </Button>
          </Link>
          <form action={removeRoom.bind(null, room.id)}>
            <SubmitButton
              variant="outline"
              size="sm"
              pendingText=""
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50"
            >
              <Trash2 className="h-4 w-4" />
            </SubmitButton>
          </form>
        </div>
      </div>

      {/* GRID INFORMASI UTAMA & HARGA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Harga & Paket Sewa */}
        <Card className="border-primary/20 bg-linear-to-br from-card to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Tarif Sewa Kamar</span>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {formatRupiah(room.price)}
              </div>
              <p className="text-xs text-muted-foreground">per bulan (Dasar kalkulasi)</p>
            </div>
            <div className="border-t pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Paket 6 Bulan:</span>
                <span className="font-semibold text-foreground">{formatRupiah(room.price * 6)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Paket 12 Bulan (1 Thn):</span>
                <span className="font-semibold text-foreground">{formatRupiah(room.price * 12)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spesifikasi Fisik Kamar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Spesifikasi Kamar</span>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <DoorOpen className="h-4 w-4" /> Posisi Lantai:
              </span>
              <span className="font-semibold">Lantai {room.floor}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Maximize2 className="h-4 w-4" /> Luas / Dimensi:
              </span>
              <span className="font-semibold">{room.size || "3x4 meter (Standar)"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Kondisi / Status:</span>
              <Badge variant={room.status === "KOSONG" ? "outline" : room.status === "TERISI" ? "default" : "destructive"}>
                {room.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Catatan / Deskripsi Kamar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Catatan & Keterangan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {room.description ? (
              <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                {room.description}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Tidak ada catatan khusus untuk kamar ini.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FASILITAS & INVENTARIS KAMAR */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Fasilitas & Inventaris Kamar
            </CardTitle>
            <Badge variant="secondary" className="text-xs font-normal">
              {room.facilities?.length || 0} Barang Disediakan
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {room.facilities && room.facilities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {room.facilities.map((facility: any) => {
                const iconName = facility.icon || getIconForFacility(facility.name)
                return (
                  <div
                    key={facility.id}
                    className="flex items-center gap-2.5 p-3 rounded-lg border bg-card hover:bg-accent/40 transition-colors shadow-2xs"
                  >
                    <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
                      <FacilityIcon name={iconName} className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-foreground truncate">
                      {facility.name}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                Belum ada fasilitas khusus atau inventaris yang ditambahkan ke kamar ini.
              </p>
              <Link href={`/dashboard/kamar/edit/${room.id}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  + Tambahkan Fasilitas & Inventaris
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FOTO KAMAR JIKA ADA */}
      {room.photos && room.photos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Foto Kamar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {room.photos.map((photoUrl: string, idx: number) => (
                <a
                  key={idx}
                  href={photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block overflow-hidden rounded-xl border bg-muted aspect-4/3"
                >
                  <img
                    src={photoUrl}
                    alt={`Kamar ${room.number} foto ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                    Buka Ukuran Penuh
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PENGHUNI SAAT INI / STATUS PENGHUNI */}
      <Card>
        <CardHeader className="pb-3 border-b bg-muted/10">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            Informasi Penghuni Kamar
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {activeTenant ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/20 border">
                <div>
                  <p className="text-xs text-muted-foreground">Nama Penghuni</p>
                  <p className="font-semibold text-sm text-foreground mt-0.5">{activeTenant.name}</p>
                  <p className="text-xs text-muted-foreground">NIK: {activeTenant.nik}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Kontak / WhatsApp</p>
                  <p className="font-medium text-sm text-foreground mt-0.5 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    <a
                      href={`https://wa.me/${activeTenant.phone.replace(/^0/, "62")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 hover:underline"
                    >
                      {activeTenant.phone}
                    </a>
                  </p>
                  {activeTenant.email && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                      <Mail className="h-3 w-3" /> {activeTenant.email}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal Masuk</p>
                  <p className="font-medium text-sm text-foreground mt-0.5 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {format(new Date(activeTenant.joinDate), "dd MMM yyyy", { locale: idLocale })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rencana Keluar</p>
                  <p className="font-medium text-sm text-foreground mt-0.5">
                    {activeTenant.leaveDate
                      ? format(new Date(activeTenant.leaveDate), "dd MMM yyyy", { locale: idLocale })
                      : "Belum ditentukan"}
                  </p>
                </div>
              </div>

              {/* Riwayat Pembayaran Terakhir Penghuni Ini */}
              {activeTenant.payments && activeTenant.payments.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Riwayat Pembayaran Terbaru
                  </h4>
                  <div className="rounded-lg border overflow-hidden">
                    <div className="grid grid-cols-4 bg-muted/50 p-2.5 text-xs font-semibold text-muted-foreground border-b">
                      <span>Periode / Keterangan</span>
                      <span>Jumlah</span>
                      <span>Metode</span>
                      <span className="text-right">Status</span>
                    </div>
                    {activeTenant.payments.map((p: any) => (
                      <div key={p.id} className="grid grid-cols-4 p-2.5 text-xs border-b last:border-b-0 items-center">
                        <span className="font-medium text-foreground">{p.periodLabel || `Bulan ${p.month}/${p.year}`}</span>
                        <span>{formatRupiah(p.amount)}</span>
                        <span className="text-muted-foreground">{p.method || "-"}</span>
                        <div className="text-right">
                          <Badge
                            variant={p.status === "LUNAS" ? "default" : "destructive"}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {p.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <DoorOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Kamar ini Kosong</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                  Saat ini tidak ada penyewa aktif di kamar {room.number}. Anda dapat mendaftarkan penghuni baru sekarang.
                </p>
              </div>
              <Link href={`/dashboard/penghuni/tambah?roomId=${room.id}`}>
                <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <UserPlus className="h-4 w-4" /> Daftarkan Penghuni ke Kamar Ini
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

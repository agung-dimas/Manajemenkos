"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FacilityIcon } from "@/components/kamar/FacilityIcon"
import { getIconForFacility } from "@/src/lib/facilities"
import { ReservationModal, RoomDetail } from "./ReservationModal"
import {
  DoorOpen,
  Maximize2,
  CalendarCheck,
  CheckCircle2,
  Filter,
  Layers,
  Sparkles,
  Lock
} from "lucide-react"

interface RoomCatalogProps {
  rooms: RoomDetail[]
  adminPhone?: string
}

export function RoomCatalog({ rooms, adminPhone }: RoomCatalogProps) {
  const [statusFilter, setStatusFilter] = useState<"ALL" | "KOSONG" | "TERISI">("ALL")
  const [floorFilter, setFloorFilter] = useState<number | "ALL">("ALL")
  const [selectedRoom, setSelectedRoom] = useState<RoomDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val || 0)
  }

  // Filter Logic
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Status filter
      if (statusFilter !== "ALL" && room.status !== statusFilter) {
        return false
      }
      // Floor filter
      if (floorFilter !== "ALL" && room.floor !== floorFilter) {
        return false
      }
      return true
    })
  }, [rooms, statusFilter, floorFilter])

  const counts = useMemo(() => {
    const total = rooms.length
    const kosong = rooms.filter((r) => r.status === "KOSONG").length
    const terisi = rooms.filter((r) => r.status === "TERISI").length
    return { total, kosong, terisi }
  }, [rooms])

  const handleOpenReservation = (room: RoomDetail) => {
    setSelectedRoom(room)
    setIsModalOpen(true)
  }

  return (
    <section id="katalog-kamar" className="py-16 sm:py-20 lg:py-24 border-t border-border bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Ketersediaan Real-Time</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Katalog Kamar & Ketersediaan
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Pilih kamar sesuai kenyamanan dan bujet Anda. Semua kamar terpelihara bersih dan siap huni.
            </p>
          </div>

          {/* Status Counter Indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold bg-card p-2 rounded-xl border border-border shadow-2xs self-start md:self-auto">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {counts.kosong} Kamar Kosong
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">
              {counts.terisi} Terisi
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border shadow-xs">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Status:
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === "ALL"
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              }`}
            >
              Semua ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("KOSONG")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === "KOSONG"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              }`}
            >
              Kamar Kosong ({counts.kosong})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("TERISI")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === "TERISI"
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              }`}
            >
              Terisi ({counts.terisi})
            </button>
          </div>

          {/* Floor Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
              <Layers className="h-3 w-3" /> Lantai:
            </span>
            <button
              type="button"
              onClick={() => setFloorFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                floorFilter === "ALL"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFloorFilter(1)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                floorFilter === 1
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              }`}
            >
              Lantai 1
            </button>
            <button
              type="button"
              onClick={() => setFloorFilter(2)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                floorFilter === 2
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              }`}
            >
              Lantai 2
            </button>
          </div>
        </div>

        {/* Room Grid (Responsive 1/2/3 Columns) */}
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const isAvailable = room.status === "KOSONG"
              const photo =
                room.photos && room.photos.length > 0
                  ? room.photos[0]
                  : "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"

              return (
                <div
                  key={room.id}
                  className={`group rounded-2xl border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col ${
                    isAvailable
                      ? "border-border hover:border-emerald-300 dark:hover:border-emerald-800"
                      : "border-border/60 opacity-90"
                  }`}
                >
                  {/* Photo Container */}
                  <div className="relative aspect-16/10 overflow-hidden bg-muted">
                    <img
                      src={photo}
                      alt={`Foto Kamar ${room.number}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Status Badge Overlay */}
                    <div className="absolute top-3 left-3">
                      {isAvailable ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/95 text-white text-xs font-bold shadow-md backdrop-blur-xs">
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                          Kamar Kosong
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/90 text-white text-xs font-semibold shadow-md backdrop-blur-xs">
                          <Lock className="h-3 w-3" />
                          Terisi
                        </span>
                      )}
                    </div>

                    {/* Floor Pill */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
                      Lantai {room.floor}
                    </div>

                    {/* Price Ribbon */}
                    <div className="absolute bottom-3 right-3 bg-background/95 backdrop-blur-md border border-border/80 px-3 py-1 rounded-xl shadow-xs">
                      <span className="text-sm font-extrabold text-foreground">
                        {formatRupiah(room.price)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal"> /bln</span>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground">
                          Kamar {room.number}
                        </h3>
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <Maximize2 className="h-3 w-3 text-emerald-600" />
                          {room.size || "3x4 meter"}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {room.description ||
                          "Kamar bersih dan nyaman dengan sirkulasi udara baik serta pencahayaan alami optimal."}
                      </p>

                      {/* Facilities preview chips */}
                      {room.facilities && room.facilities.length > 0 && (
                        <div className="pt-2 border-t border-border/60">
                          <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                            Fasilitas Kamar:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {room.facilities.slice(0, 4).map((f) => {
                              const iconName = f.icon || getIconForFacility(f.name)
                              return (
                                <span
                                  key={f.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/50 border border-border/70 text-[11px] text-muted-foreground"
                                >
                                  <FacilityIcon name={iconName} className="h-3 w-3 text-emerald-600" />
                                  <span>{f.name}</span>
                                </span>
                              )
                            })}
                            {room.facilities.length > 4 && (
                              <span className="text-[10px] text-muted-foreground self-center px-1 font-medium">
                                +{room.facilities.length - 4} lainnya
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-3 border-t border-border/60">
                      {isAvailable ? (
                        <Button
                          onClick={() => handleOpenReservation(room)}
                          className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-xs"
                        >
                          <CalendarCheck className="h-3.5 w-3.5" />
                          Reservasi Kamar {room.number}
                        </Button>
                      ) : (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/40 cursor-not-allowed border-dashed"
                        >
                          Kamar Sedang Penuh
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 rounded-2xl border border-dashed text-center bg-card space-y-2">
            <DoorOpen className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-foreground text-base">Tidak ada kamar yang sesuai filter</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Coba ubah filter status atau lantai untuk melihat kamar lainnya yang tersedia.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter("ALL")
                setFloorFilter("ALL")
              }}
              className="mt-2 text-xs rounded-xl"
            >
              Reset Filter
            </Button>
          </div>
        )}

      </div>

      {/* Interactive Reservation Modal */}
      <ReservationModal
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        adminPhone={adminPhone}
      />
    </section>
  )
}

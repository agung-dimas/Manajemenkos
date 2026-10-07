"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  X,
  Calendar,
  Phone,
  User,
  MessageSquare,
  Building2,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Sparkles
} from "lucide-react"

export interface RoomDetail {
  id: string
  number: string
  floor: number
  price: number
  status: "KOSONG" | "TERISI" | "MAINTENANCE"
  size?: string | null
  description?: string | null
  photos: string[]
  facilities: { id: string; name: string; icon?: string | null }[]
}

interface ReservationModalProps {
  room: RoomDetail | null
  isOpen: boolean
  onClose: () => void
  adminPhone?: string
}

export function ReservationModal({
  room,
  isOpen,
  onClose,
  adminPhone = "6282278557501"
}: ReservationModalProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [moveInDate, setMoveInDate] = useState("")
  const [notes, setNotes] = useState("")
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen || !room) return null

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val || 0)
  }

  const defaultPhoto =
    room.photos && room.photos.length > 0
      ? room.photos[0]
      : "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault()

    const formattedPrice = formatRupiah(room.price)
    const cleanAdminPhone = adminPhone.replace(/[^0-9]/g, "").replace(/^0/, "62")

    const textMessage = `Halo Pengelola Kost Bu Wati,\n\nSaya tertarik untuk reservasi / survey kamar berikut:\n` +
      `• Unit: Kamar ${room.number} (Lantai ${room.floor})\n` +
      `• Tarif Sewa: ${formattedPrice} / bulan\n` +
      `• Ukuran: ${room.size || "3x4 meter"}\n\n` +
      `Informasi Calon Penghuni:\n` +
      `• Nama: ${name || "-"}\n` +
      `• No. WhatsApp: ${phone || "-"}\n` +
      `• Rencana Masuk: ${moveInDate || "-"}\n` +
      (notes ? `• Catatan / Pertanyaan: ${notes}\n\n` : `\n`) +
      `Mohon info ketersediaan dan jadwal untuk survey lokasi. Terima kasih!`

    const encoded = encodeURIComponent(textMessage)
    const waUrl = `https://wa.me/${cleanAdminPhone}?text=${encoded}`

    setSubmitted(true)
    window.open(waUrl, "_blank")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Reservasi Kamar {room.number}
              </h2>
              <p className="text-xs text-muted-foreground">
                Lantai {room.floor} • Kost Bu Wati
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Room Summary Card */}
          <div className="flex flex-col sm:flex-row gap-4 p-3.5 rounded-xl border border-border bg-muted/30">
            <img
              src={defaultPhoto}
              alt={`Foto Kamar ${room.number}`}
              className="w-full sm:w-28 h-28 object-cover rounded-lg shrink-0 border border-border"
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-base text-foreground">
                  Kamar {room.number}
                </span>
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px]">
                  Tersedia
                </Badge>
              </div>

              <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                {formatRupiah(room.price)}
                <span className="text-xs font-normal text-muted-foreground"> / bulan</span>
              </div>

              <p className="text-xs text-muted-foreground">
                Dimensi: <strong>{room.size || "3x4 meter"}</strong> • Posisi: Lantai {room.floor}
              </p>

              {room.facilities && room.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {room.facilities.slice(0, 4).map((f) => (
                    <span
                      key={f.id}
                      className="px-2 py-0.5 rounded-md bg-background border text-[10px] text-muted-foreground"
                    >
                      {f.name}
                    </span>
                  ))}
                  {room.facilities.length > 4 && (
                    <span className="text-[10px] text-muted-foreground self-center">
                      +{room.facilities.length - 4} lainnya
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reservation Form */}
          <form onSubmit={handleSendWhatsApp} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tenantName" className="text-xs font-semibold flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-600" />
                Nama Lengkap Calon Penghuni
              </Label>
              <Input
                id="tenantName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Dimas Pratama"
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tenantPhone" className="text-xs font-semibold flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  Nomor WhatsApp / HP
                </Label>
                <Input
                  id="tenantPhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="moveInDate" className="text-xs font-semibold flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  Rencana Tanggal Masuk
                </Label>
                <Input
                  id="moveInDate"
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                Catatan / Kebutuhan Khusus (Opsional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Bawa motor 1, ingin survey hari Sabtu siang..."
                className="text-xs resize-none h-16"
              />
            </div>

            {/* Information Notice */}
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Proses Reservasi Bebas Biaya Awal
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300/90">
                Pesan WhatsApp akan terformat otomatis untuk diajukan ke pengelola Kost Bu Wati. Anda dapat survey kamar terlebih dahulu sebelum melakukan pembayaran sewa.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-9 text-xs rounded-xl"
              >
                Tutup
              </Button>
              <Button
                type="submit"
                className="h-9 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-xs"
              >
                Kirim Reservasi via WhatsApp
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

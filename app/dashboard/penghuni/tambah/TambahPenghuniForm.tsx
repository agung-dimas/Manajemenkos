"use client"

import { useState, useTransition, useMemo } from "react"
import Link from "next/link"
import { addTenant } from "@/src/actions/penghuni.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, CreditCard, ShieldCheck, Loader2, Sparkles, Building, Calendar, Receipt } from "lucide-react"
import { getPeriodLabel, getPeriodDateRange } from "@/src/lib/period"
import { FacilityIcon } from "@/components/kamar/FacilityIcon"
import { getIconForFacility } from "@/src/lib/facilities"

interface Room {
  id: string
  number: string
  price: number
  facilities?: { id: string; name: string; icon?: string | null }[]
}

interface TambahPenghuniFormProps {
  availableRooms: Room[]
}

export function TambahPenghuniForm({ availableRooms }: TambahPenghuniFormProps) {
  const [isPending, startTransition] = useTransition()

  // Selection state
  const [selectedRoomId, setSelectedRoomId] = useState<string>(availableRooms[0]?.id || "")
  const [joinDate, setJoinDate] = useState<string>(() => new Date().toISOString().split("T")[0])
  const [durationMonth, setDurationMonth] = useState<number>(6)
  const [customDuration, setCustomDuration] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("Tunai")
  const [customAmount, setCustomAmount] = useState<string>("")

  // Selected room details
  const selectedRoom = useMemo(() => {
    return availableRooms.find(r => r.id === selectedRoomId)
  }, [availableRooms, selectedRoomId])

  // Active duration
  const activeDuration = durationMonth === -1
    ? (parseInt(customDuration) || 1)
    : durationMonth

  // Base room price
  const basePrice = selectedRoom ? selectedRoom.price : 0

  // Calculated total amount
  const calculatedTotal = basePrice * activeDuration
  const displayAmount = customAmount !== "" ? parseFloat(customAmount) : calculatedTotal

  // Calculate period label dengan rentang tanggal presisi
  const periodLabel = useMemo(() => {
    if (!joinDate) return "-"
    const range = getPeriodDateRange(joinDate, activeDuration)
    return range.label
  }, [joinDate, activeDuration])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val || 0)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/penghuni">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pendaftaran Penghuni Baru</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sistem KOST BU WATI menerapkan prinsip <strong className="text-primary font-semibold">100% Bayar di Muka</strong> (Sewa di Muka).
          </p>
        </div>
      </div>

      <form
        action={(formData) => {
          // Pass calculated duration and periodLabel
          formData.set("durationMonth", activeDuration.toString())
          formData.set("amount", displayAmount.toString())
          formData.set("method", paymentMethod)
          formData.set("periodLabel", periodLabel)
          startTransition(() => {
            addTenant(formData)
          })
        }}
        className="space-y-6 bg-card p-6 sm:p-8 border rounded-xl shadow-sm"
      >
        {/* BAGIAN 1: DATA IDENTITAS PENGHUNI */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
              Data Pribadi Penghuni
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" placeholder="Nama sesuai KTP" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nik">NIK (Nomor KTP) <span className="text-red-500">*</span></Label>
              <Input id="nik" name="nik" type="number" placeholder="16 digit NIK" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">No. HP / WhatsApp <span className="text-red-500">*</span></Label>
              <Input id="phone" name="phone" placeholder="08xxxxxxxxxx" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Penghuni <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contoh@gmail.com"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Kuitansi resmi PDF akan otomatis dikirimkan ke email ini.
              </p>
            </div>
          </div>

          {/* Akun Login Portal */}
          <div className="space-y-2 rounded-lg border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <Label htmlFor="password" className="text-sm font-semibold text-indigo-950 dark:text-indigo-200">
                Password Akun Login Portal Penghuni <span className="text-red-500">*</span>
              </Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Tentukan password masuk portal..."
              required
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Penghuni dapat langsung login ke portal dengan email dan password ini untuk melihat tagihan, riwayat sewa, dan kuitansi digital.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Jenis Kelamin</Label>
              <Select name="gender" defaultValue="Pria">
                <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pria">Pria</SelectItem>
                  <SelectItem value="Wanita">Wanita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Alamat Asal Sesuai KTP <span className="text-red-500">*</span></Label>
              <Input id="address" name="address" placeholder="Kota / Alamat asal" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ktpPhoto">Upload Foto KTP (Opsional)</Label>
              <Input id="ktpPhoto" name="ktpPhoto" type="file" accept="image/*" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Foto Profil Penghuni (Opsional)</Label>
              <Input id="photo" name="photo" type="file" accept="image/*" />
            </div>
          </div>
        </div>

        {/* BAGIAN 2: KAMAR & TANGGAL MASUK */}
        <div className="space-y-4 pt-2">
          <div className="border-b pb-2">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
              Pilihan Kamar & Tanggal Masuk
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roomId">Pilih Kamar (Kamar Kosong) <span className="text-red-500">*</span></Label>
              <Select
                name="roomId"
                value={selectedRoomId}
                onValueChange={(val) => {
                  setSelectedRoomId(val)
                  setCustomAmount("") // Reset custom amount on room change
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kamar" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.length === 0 ? (
                    <SelectItem value="none" disabled>Tidak ada kamar kosong</SelectItem>
                  ) : (
                    availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Kamar {room.number} — {formatCurrency(room.price)} / bulan
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinDate">Tanggal Masuk (Mulai Sewa) <span className="text-red-500">*</span></Label>
              <Input
                id="joinDate"
                name="joinDate"
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Rincian Fasilitas & Inventaris Kamar Terpilih */}
          {selectedRoom && (
            <div className="rounded-lg border bg-muted/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Rincian Fasilitas & Inventaris Kamar {selectedRoom.number}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {selectedRoom.facilities?.length || 0} barang disediakan
                </span>
              </div>
              {selectedRoom.facilities && selectedRoom.facilities.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedRoom.facilities.map((f) => {
                    const iconName = f.icon || getIconForFacility(f.name)
                    return (
                      <span
                        key={f.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-background border text-foreground shadow-xs"
                      >
                        <FacilityIcon name={iconName} className="h-3.5 w-3.5 text-primary" />
                        {f.name}
                      </span>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic pt-0.5">
                  Kamar ini menggunakan fasilitas standar bawaan.
                </p>
              )}
            </div>
          )}
        </div>

        {/* BAGIAN 3: PEMBAYARAN PERDANA (BAYAR DULU BARU NEMPATIN) */}
        <div className="space-y-4 pt-2">
          <div className="border-b pb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">3</span>
              Pembayaran Sewa Perdana (Bayar di Muka)
            </h2>
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Langsung Lunas
            </span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
            <Receipt className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <p className="leading-relaxed">
              Sesuai sistem <strong>Pembayaran Di Muka</strong>, pembayaran sewa awal ini langsung dicatat sebagai <strong>LUNAS</strong>. Kuitansi digital resmi PDF akan otomatis diterbitkan dan dikirimkan ke email penghuni.
            </p>
          </div>

          {/* Pilihan Durasi Sewa */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Pilihan Paket Durasi Sewa</Label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {[
                { label: "6 Bulan", sub: "Paket Setengah Tahun", value: 6 },
                { label: "12 Bulan", sub: "Paket 1 Tahun Penuh", value: 12 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setDurationMonth(opt.value)
                    setCustomAmount("")
                  }}
                  className={`p-3.5 text-left rounded-xl border transition-all ${durationMonth === opt.value
                    ? "border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20"
                    : "border-border/80 bg-background hover:bg-muted text-muted-foreground"
                    }`}
                >
                  <div className="font-bold text-sm text-foreground">{opt.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>


          {/* Rincian Periode & Metode Pembayaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Periode Sewa Yang Dicakup</Label>
              <div className="h-10 px-3 py-2 bg-muted/40 border rounded-md text-xs font-semibold flex items-center text-foreground">
                <Calendar className="h-3.5 w-3.5 mr-2 text-primary" />
                {periodLabel}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Metode Pembayaran</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="method">
                  <SelectValue placeholder="Pilih Metode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tunai">Tunai (Cash di Tempat)</SelectItem>
                  <SelectItem value="Transfer BCA">Transfer Bank BCA</SelectItem>
                  <SelectItem value="Transfer Bank Lain">Transfer Bank Lain (Mandiri/BRI/BNI)</SelectItem>
                  <SelectItem value="QRIS">QRIS / E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Total Tagihan & Upload Bukti */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Total Pembayaran Sewa Awal</Label>
                <span className="text-[11px] text-muted-foreground">
                  ({formatCurrency(basePrice)} × {activeDuration} bln)
                </span>
              </div>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={displayAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                required
                className="font-bold text-base text-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proofUrl">Bukti Transfer / Pembayaran (Opsional)</Label>
              <Input
                id="proofUrl"
                name="proofUrl"
                type="file"
                accept="image/*,application/pdf"
              />
              <p className="text-[11px] text-muted-foreground">
                Jika pembayaran dilakukan via transfer, unggah bukti struk di sini.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Link href="/dashboard/penghuni" className="w-full sm:w-auto">
            <Button variant="outline" type="button" className="w-full" disabled={isPending}>
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isPending || availableRooms.length === 0}
            className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mendaftarkan & Menerbitkan Kuitansi...
              </>
            ) : (
              <>
                <Receipt className="h-4 w-4" />
                Daftarkan Penghuni & Catat Pembayaran Lunas
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

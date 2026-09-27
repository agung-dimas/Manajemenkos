"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { addPayment } from "@/src/actions/pembayaran.action"
import { getPeriodLabel, MONTHS } from "@/src/lib/period"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, CreditCard, Sparkles, Loader2 } from "lucide-react"

interface TenantWithRoom {
  id: string
  name: string
  room: {
    number: string
    price: number
  }
}

interface FormTambahPembayaranProps {
  tenants: TenantWithRoom[]
  initialMonth: number
  initialYear: number
}

const DURATION_PRESETS = [
  { label: "6 Bulan (Paket Setengah Tahun)", value: "6", months: 6 },
  { label: "12 Bulan (Paket 1 Tahun)", value: "12", months: 12 },
  { label: "1 Bulan (Bulanan)", value: "1", months: 1 },
  { label: "3 Bulan (Triwulan)", value: "3", months: 3 },
  { label: "Kustom (Jumlah Bulan)", value: "custom", months: 6 },
]

export function FormTambahPembayaran({
  tenants,
  initialMonth,
  initialYear,
}: FormTambahPembayaranProps) {
  const [selectedTenantId, setSelectedTenantId] = useState<string>("")
  const [month, setMonth] = useState<number>(initialMonth)
  const [year, setYear] = useState<number>(initialYear)
  const [durationPreset, setDurationPreset] = useState<string>("6")
  const [customMonths, setCustomMonths] = useState<number>(6)
  const [amount, setAmount] = useState<number | string>("")
  const [isPending, startTransition] = useTransition()

  // Ambil data tenant yang dipilih
  const selectedTenant = tenants.find((t) => t.id === selectedTenantId)
  const roomPrice = selectedTenant?.room.price || 0

  // Hitung jumlah bulan efektif
  const effectiveDuration = durationPreset === "custom" ? Math.max(1, customMonths || 1) : parseInt(durationPreset, 10)

  // Label periode sewa yang dihitung secara dinamis
  const previewPeriod = getPeriodLabel(month, year, effectiveDuration)

  // Auto-hitung harga ketika tenant atau durasi berubah
  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId)
    const t = tenants.find((x) => x.id === tenantId)
    if (t) {
      setAmount(t.room.price * effectiveDuration)
    }
  }

  const handleDurationPresetChange = (val: string) => {
    setDurationPreset(val)
    const dur = val === "custom" ? Math.max(1, customMonths || 1) : parseInt(val, 10)
    if (roomPrice > 0) {
      setAmount(roomPrice * dur)
    }
  }

  const handleCustomMonthsChange = (val: number) => {
    const validVal = Math.max(1, val || 1)
    setCustomMonths(validVal)
    if (roomPrice > 0) {
      setAmount(roomPrice * validVal)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    // Pastikan durationMonth dan periodLabel terisi dengan nilai kalkulasi
    formData.set("durationMonth", effectiveDuration.toString())
    formData.set("periodLabel", previewPeriod)

    startTransition(async () => {
      await addPayment(formData)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 border rounded-xl shadow-sm">
      {/* Hidden input untuk menyimpan periodLabel dan durationMonth */}
      <input type="hidden" name="durationMonth" value={effectiveDuration} />
      <input type="hidden" name="periodLabel" value={previewPeriod} />

      {/* 1. Pilih Penghuni */}
      <div className="space-y-2">
        <Label htmlFor="tenantId" className="text-sm font-semibold">
          Pilih Penghuni & Kamar
        </Label>
        <Select name="tenantId" value={selectedTenantId} onValueChange={handleTenantChange} required>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Pilih Penghuni Kost..." />
          </SelectTrigger>
          <SelectContent>
            {tenants.map((tenant) => (
              <SelectItem key={tenant.id} value={tenant.id}>
                {tenant.name} — Kamar {tenant.room.number} ({formatCurrency(tenant.room.price)}/bln)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2. Pengaturan Periode & Durasi Sewa */}
      <div className="rounded-xl border border-indigo-100 dark:border-indigo-950/50 bg-gradient-to-br from-indigo-50/50 via-background to-sky-50/30 dark:from-indigo-950/20 dark:via-background dark:to-sky-950/10 p-4 space-y-4">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold text-sm">
          <Calendar className="h-4 w-4" />
          <span>Periode & Durasi Sewa</span>
          <Badge variant="secondary" className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
            Dapat Disesuaikan
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="month" className="text-xs font-medium">Bulan Mulai</Label>
            <Select
              name="month"
              value={month.toString()}
              onValueChange={(val) => setMonth(parseInt(val, 10))}
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year" className="text-xs font-medium">Tahun</Label>
            <Input
              id="year"
              name="year"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10) || initialYear)}
              className="bg-background"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Paket Durasi Sewa</Label>
            <Select value={durationPreset} onValueChange={handleDurationPresetChange}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Input Kustom Bulan jika memilih Opsi Kustom */}
        {durationPreset === "custom" && (
          <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Label htmlFor="customMonths" className="text-xs font-medium shrink-0">
              Berapa Bulan Sewa Sekaligus?
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="customMonths"
                type="number"
                min={1}
                max={60}
                value={customMonths}
                onChange={(e) => handleCustomMonthsChange(parseInt(e.target.value, 10) || 1)}
                className="w-24 bg-background"
              />
              <span className="text-xs text-muted-foreground">Bulan</span>
            </div>
          </div>
        )}

        {/* Banner Preview Periode & Kalkulasi Otomatis */}
        <div className="p-3 bg-white/80 dark:bg-zinc-900/80 border border-indigo-200/80 dark:border-indigo-800/50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground font-medium">Preview Periode Pembayaran:</span>
            <div className="text-sm font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {previewPeriod}
            </div>
          </div>

          {selectedTenant && (
            <div className="text-left sm:text-right space-y-0.5">
              <span className="text-muted-foreground">Hitungan Tarif Kamar:</span>
              <div className="font-semibold text-foreground">
                {formatCurrency(roomPrice)} x {effectiveDuration} Bulan ={" "}
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {formatCurrency(roomPrice * effectiveDuration)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Nominal & Status Pembayaran */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="amount" className="text-sm font-semibold">
              Total Nominal Tagihan (Rp)
            </Label>
            {roomPrice > 0 && (
              <button
                type="button"
                onClick={() => setAmount(roomPrice * effectiveDuration)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset Hitungan Otomatis
              </button>
            )}
          </div>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Misal: 1500000"
            required
            className="text-base font-semibold"
          />
          <p className="text-[11px] text-muted-foreground">
            Nominal terisi otomatis sesuai durasi sewa, namun tetap dapat Anda ubah manual jika ada potongan/tambahan.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-semibold">
            Status Pembayaran
          </Label>
          <Select name="status" defaultValue="LUNAS">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LUNAS">Lunas</SelectItem>
              <SelectItem value="BELUM_BAYAR">Belum Bayar (Kirim Tagihan)</SelectItem>
              <SelectItem value="TERLAMBAT">Terlambat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 4. Tanggal & Metode Bayar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="paymentDate" className="text-sm font-semibold">
            Tanggal Bayar (Opsional)
          </Label>
          <Input id="paymentDate" name="paymentDate" type="date" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="method" className="text-sm font-semibold">
            Metode Pembayaran
          </Label>
          <Select name="method" defaultValue="Transfer Bank">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
              <SelectItem value="Cash">Tunai (Cash)</SelectItem>
              <SelectItem value="E-Wallet">E-Wallet (Dana / Gopay / OVO)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 5. Bukti Transfer */}
      <div className="space-y-2">
        <Label htmlFor="proofUrl" className="text-sm font-semibold">
          Upload Bukti Transfer / Resi (Opsional)
        </Label>
        <Input id="proofUrl" name="proofUrl" type="file" accept="image/*" />
      </div>

      {/* Tombol Simpan & Batal */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3 border-t">
        <Link href="/dashboard/pembayaran">
          <Button type="button" variant="outline" className="w-full sm:w-auto">
            Batal
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={isPending || !selectedTenantId}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan Pembayaran...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Simpan Pembayaran
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

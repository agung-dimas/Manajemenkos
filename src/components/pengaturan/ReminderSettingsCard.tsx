"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Clock,
  Calendar,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  MessageSquare,
  Sparkles,
  ExternalLink
} from "lucide-react"
import {
  getReminderSettings,
  saveReminderSettings,
  triggerReminderTest,
  ReminderSettings
} from "@/src/actions/settings.action"
import Link from "next/link"

export function ReminderSettingsCard() {
  const [settings, setSettings] = useState<ReminderSettings>({
    reminderDaysBefore: 3,
    reminderHour: 8,
    autoDailyReminder: true,
    emailReminderActive: true,
    whatsappReminderActive: true
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Testing state
  const [isTesting, setIsTesting] = useState(false)
  const [forceTest, setForceTest] = useState(true)
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getReminderSettings()
        setSettings(data)
      } catch (err) {
        console.error("Gagal memuat pengaturan pengingat:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const res = await saveReminderSettings(settings)
      if (res.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        alert("Gagal menyimpan: " + (res.error || "Terjadi kesalahan"))
      }
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRunTest = async () => {
    setIsTesting(true)
    setTestResult(null)
    try {
      const res = await triggerReminderTest(forceTest)
      setTestResult(res)
    } catch (err: any) {
      alert("Gagal menjalankan uji coba: " + err.message)
    } finally {
      setIsTesting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Memuat pengaturan pengingat...</span>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. KARTU PENGATURAN CUSTOM JATUH TEMPO */}
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="bg-muted/10 border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Bell className="h-5 w-5 text-primary" />
                Pengaturan Pengingat Jatuh Tempo & Email Otomatis
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Atur jadwal jam pengiriman, hari mulai pengingat (H-berapa), dan frekuensi pengiriman tagihan otomatis.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-primary border-primary/30 hidden sm:inline-flex">
              Vercel Cron & Resend Ready
            </Badge>
          </div>
        </CardHeader>

        <form onSubmit={handleSave}>
          <CardContent className="pt-6 space-y-5">
            {saveSuccess && (
              <div className="flex items-center gap-2 p-3 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Pengaturan pengingat berhasil disimpan ke database!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mulai H-Berapa */}
              <div className="space-y-2">
                <Label htmlFor="daysBefore" className="text-sm font-semibold flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  Mulai Mengingatkan (H- Berapa Hari)
                </Label>
                <Select
                  value={settings.reminderDaysBefore.toString()}
                  onValueChange={(val) => setSettings({ ...settings, reminderDaysBefore: parseInt(val) })}
                >
                  <SelectTrigger id="daysBefore" className="h-10">
                    <SelectValue placeholder="Pilih H- Hari" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hari Sebelum Jatuh Tempo (H-1)</SelectItem>
                    <SelectItem value="2">2 Hari Sebelum Jatuh Tempo (H-2)</SelectItem>
                    <SelectItem value="3">3 Hari Sebelum Jatuh Tempo (H-3) — Rekomendasi</SelectItem>
                    <SelectItem value="5">5 Hari Sebelum Jatuh Tempo (H-5)</SelectItem>
                    <SelectItem value="7">7 Hari Sebelum Jatuh Tempo (H-7 / 1 Minggu)</SelectItem>
                    <SelectItem value="10">10 Hari Sebelum Jatuh Tempo (H-10)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Tagihan invoice dan pengingat pertama akan otomatis diterbitkan mulai rentang H- ini.
                </p>
              </div>

              {/* Jam Pengiriman Otomatis */}
              <div className="space-y-2">
                <Label htmlFor="reminderHour" className="text-sm font-semibold flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  Jam Pengiriman Otomatis (WIB)
                </Label>
                <Select
                  value={settings.reminderHour.toString()}
                  onValueChange={(val) => setSettings({ ...settings, reminderHour: parseInt(val) })}
                >
                  <SelectTrigger id="reminderHour" className="h-10">
                    <SelectValue placeholder="Pilih Jam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Pukul 07:00 WIB (Pagi Awal)</SelectItem>
                    <SelectItem value="8">Pukul 08:00 WIB (Standar)</SelectItem>
                    <SelectItem value="9">Pukul 09:00 WIB</SelectItem>
                    <SelectItem value="10">Pukul 10:00 WIB</SelectItem>
                    <SelectItem value="12">Pukul 12:00 WIB (Siang)</SelectItem>
                    <SelectItem value="17">Pukul 17:00 WIB (Sore)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Waktu penjadwalan eksekusi cron harian untuk mengirim pengingat ke penghuni.
                </p>
              </div>
            </div>

            {/* Kondisi Pengiriman Berulang Sampai Lunas */}
            <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="autoDaily"
                  checked={settings.autoDailyReminder}
                  onChange={(e) => setSettings({ ...settings, autoDailyReminder: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="space-y-1">
                  <Label htmlFor="autoDaily" className="text-sm font-bold text-foreground cursor-pointer">
                    Kirim Otomatis Setiap Hari Jika Belum Bayar Sampai Hari Terakhir Jatuh Tempo (H-0)
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Jika dicentang, sistem akan terus mengirim email pengingat setiap hari (1x per hari) kepada penghuni yang berstatus <strong>BELUM BAYAR</strong> atau <strong>SEBAGIAN</strong>, dan pengiriman otomatis akan berakhir tepat pada tanggal jatuh tempo.
                  </p>
                </div>
              </div>
            </div>

            {/* Pilihan Saluran Notifikasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-3 p-3.5 rounded-lg border bg-card hover:bg-muted/20 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={settings.emailReminderActive}
                  onChange={(e) => setSettings({ ...settings, emailReminderActive: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-primary cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">Email Resmi (Resend)</span>
                    <span className="text-[11px] text-muted-foreground">Kirim PDF Invoice via billing@koswati.web.id</span>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-lg border bg-card hover:bg-muted/20 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={settings.whatsappReminderActive}
                  onChange={(e) => setSettings({ ...settings, whatsappReminderActive: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-primary cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">WhatsApp Notifikasi</span>
                    <span className="text-[11px] text-muted-foreground">Pesan pengingat instan ke no HP penyewa</span>
                  </div>
                </div>
              </label>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/5 border-t px-6 py-3.5 flex justify-end">
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan Pengaturan...
                </>
              ) : (
                "Simpan Pengaturan Pengingat"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* 2. PANEL UJI COBA LANGSUNG (TEST CONSOLE) */}
      <Card className="border border-indigo-200 dark:border-indigo-900/60 bg-linear-to-br from-card to-indigo-50/20 dark:to-indigo-950/10 shadow-xs">
        <CardHeader className="pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                Alat Uji Coba Pengingat Jatuh Tempo (Live Test Console)
              </CardTitle>
              <CardDescription className="text-xs">
                Uji langsung pengiriman email tagihan sekarang juga tanpa perlu menunggu waktu cron Vercel.
              </CardDescription>
            </div>
            <Link href="/dashboard/pembayaran">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary hover:underline">
                Lihat Tagihan <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-lg border border-indigo-200/60 dark:border-indigo-900/50 bg-background/80">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={forceTest}
                onChange={(e) => setForceTest(e.target.checked)}
                className="h-4 w-4 rounded border-indigo-300 text-indigo-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-foreground">
                Paksa Kirim Uji Coba (Kirim sekarang meskipun tagihan hari ini sudah pernah dikirim)
              </span>
            </label>

            <Button
              type="button"
              onClick={handleRunTest}
              disabled={isTesting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-9 text-xs sm:self-auto shrink-0 shadow-xs"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memindai & Mengirim Pengingat...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Jalankan Pengingat Sekarang (Test)
                </>
              )}
            </Button>
          </div>

          {/* HASIL EKSEKUSI PENGUJIAN */}
          {testResult && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-bold text-foreground">
                    Hasil Pemindaian: {testResult.processedCount || 0} Tagihan Diproses
                  </span>
                </div>
                <Badge variant={testResult.processedCount > 0 ? "default" : "secondary"} className="text-xs">
                  {testResult.processedCount > 0 ? "Ada Pengingat Dikirim" : "Semua Lunas / Di Luar Rentang"}
                </Badge>
              </div>

              {testResult.results && testResult.results.length > 0 ? (
                <div className="space-y-2">
                  {testResult.results.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{item.tenantName}</span>
                          <Badge variant="outline" className="text-[11px] font-semibold">
                            Kamar {item.roomNumber}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          Tagihan: <strong className="text-foreground">Rp {Number(item.amount).toLocaleString("id-ID")}</strong> • Periode: {item.periodLabel}
                        </p>
                        <p className="text-muted-foreground">
                          Jatuh Tempo: <span className="font-medium text-foreground">{item.dueDate}</span>{" "}
                          ({item.daysLeft === 0 ? (
                            <strong className="text-red-500">HARI INI TERAKHIR</strong>
                          ) : (
                            <strong className="text-amber-600">Tersisa {item.daysLeft} hari lagi</strong>
                          )})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <Badge
                          variant={item.emailSent ? "default" : "outline"}
                          className={`text-[11px] gap-1 ${item.emailSent ? "bg-emerald-600 text-white" : "text-muted-foreground"}`}
                        >
                          <Mail className="h-3 w-3" />
                          {item.emailSent ? "Email Terkirim" : "Email Skip/Off"}
                        </Badge>
                        <Badge
                          variant={item.waSent ? "default" : "outline"}
                          className={`text-[11px] gap-1 ${item.waSent ? "bg-teal-600 text-white" : "text-muted-foreground"}`}
                        >
                          <MessageSquare className="h-3 w-3" />
                          {item.waSent ? "WA Terkirim" : "WA Skip/Off"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-dashed text-center text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Tidak ada penghuni yang masuk dalam rentang jatuh tempo (H-{settings.reminderDaysBefore}) untuk saat ini.</p>
                  <p>Semua penghuni kost yang aktif telah melunasi tagihannya atau tanggal jatuh temponya masih di luar rentang H-{settings.reminderDaysBefore}.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

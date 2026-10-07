"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Mail,
  Sparkles,
  ExternalLink,
  Copy,
  Check
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
    reminderMinute: 0,
    autoDailyReminder: true,
    emailReminderActive: true,
    whatsappReminderActive: false
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Testing state
  const [isTesting, setIsTesting] = useState(false)
  const [forceTest, setForceTest] = useState(true)
  const [testResult, setTestResult] = useState<any>(null)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [copiedWebhook, setCopiedWebhook] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWebhookUrl(`${window.location.origin}/api/cron/payment-reminder`)
    }
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

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const res = await saveReminderSettings(settings)
      if (res.success) {
        setSaveSuccess(true)
        // Refresh local state to ensure it matches the database 100%
        const fresh = await getReminderSettings()
        setSettings(fresh)
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

        <div>
          <CardContent className="pt-6 space-y-5">
            {saveSuccess && (
              <div className="flex items-center gap-2 p-3 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Pengaturan pengingat berhasil disimpan ke database!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mulai H-Berapa */}
              <div className="space-y-2 min-w-0">
                <Label htmlFor="daysBefore" className="text-sm font-semibold flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span>Mulai Mengingatkan (H- Hari)</span>
                </Label>
                <Select
                  value={settings.reminderDaysBefore.toString()}
                  onValueChange={(val) => setSettings({ ...settings, reminderDaysBefore: parseInt(val) })}
                >
                  <SelectTrigger id="daysBefore" className="h-10 w-full min-w-0">
                    <SelectValue placeholder="Pilih H- Hari" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">H-1 (1 Hari Sebelum)</SelectItem>
                    <SelectItem value="2">H-2 (2 Hari Sebelum)</SelectItem>
                    <SelectItem value="3">H-3 (3 Hari Sebelum — Standar)</SelectItem>
                    <SelectItem value="5">H-5 (5 Hari Sebelum)</SelectItem>
                    <SelectItem value="7">H-7 (7 Hari Sebelum / 1 Minggu)</SelectItem>
                    <SelectItem value="10">H-10 (10 Hari Sebelum)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Tagihan invoice dan pengingat pertama diterbitkan mulai rentang H- ini.
                </p>
              </div>

              {/* Waktu Pengiriman Otomatis (Jam & Menit Bebas) */}
              <div className="space-y-2 min-w-0">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminderTime" className="text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span>Waktu Pengiriman Otomatis (WIB)</span>
                  </Label>
                  <Badge variant="secondary" className="text-xs font-mono font-semibold">
                    {settings.reminderHour.toString().padStart(2, "0")}:{(settings.reminderMinute || 0).toString().padStart(2, "0")} WIB
                  </Badge>
                </div>

                <Input
                  id="reminderTime"
                  type="time"
                  value={`${settings.reminderHour.toString().padStart(2, "0")}:${(settings.reminderMinute || 0).toString().padStart(2, "0")}`}
                  onChange={(e) => {
                    const val = e.target.value
                    if (!val) return
                    const [hStr, mStr] = val.split(":")
                    const h = parseInt(hStr, 10)
                    const m = parseInt(mStr, 10)
                    setSettings({
                      ...settings,
                      reminderHour: isNaN(h) ? 8 : h,
                      reminderMinute: isNaN(m) ? 0 : m,
                    })
                  }}
                  className="h-10 text-base font-semibold px-3 bg-background"
                />

                {/* Preset tombol cepat */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] text-muted-foreground mr-0.5">Preset:</span>
                  {[
                    { label: "08:00 (Pagi)", h: 8, m: 0 },
                    { label: "12:00 (Siang)", h: 12, m: 0 },
                    { label: "18:00 (Sore)", h: 18, m: 0 },
                    { label: "18:24 (Kustom)", h: 18, m: 24 },
                    { label: "20:00 (Malam)", h: 20, m: 0 },
                  ].map((preset, idx) => {
                    const isActive =
                      settings.reminderHour === preset.h &&
                      (settings.reminderMinute || 0) === preset.m
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setSettings({
                            ...settings,
                            reminderHour: preset.h,
                            reminderMinute: preset.m,
                          })
                        }
                        className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${isActive
                            ? "bg-primary text-primary-foreground border-primary font-semibold"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                          }`}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Ketik jam dan menit bebas kapan pengingat otomatis dikirimkan ke WhatsApp & Email penghuni.
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

            {/* Saluran Pengiriman: Email Resmi Resend */}
            <div className="flex items-center justify-between p-3.5 rounded-lg border bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-600">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground block">Email Resmi Resend</span>
                  <span className="text-[11px] text-muted-foreground">Kuitansi dan invoice PDF dikirim via billing@koswati.web.id</span>
                </div>
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 text-xs font-medium">
                Aktif
              </Badge>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/5 border-t px-6 py-3.5 flex justify-end">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
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
        </div>
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
              {testResult.skipped && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-lg text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>Pengingat Dilewati (Bukan Jadwal Jam Pengiriman)</span>
                  </div>
                  <p>{testResult.message}</p>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    💡 Centang opsi <strong>"Paksa Kirim Uji Coba"</strong> di atas jika Anda ingin memaksa eksekusi langsung sekarang juga tanpa menunggu jam tiba.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-bold text-foreground">
                    Hasil Pemindaian: {testResult.processedCount || 0} Tagihan Diproses
                  </span>
                </div>
                <Badge variant={testResult.processedCount > 0 ? "default" : "secondary"} className="text-xs">
                  {testResult.processedCount > 0 ? "Ada Pengingat Dikirim" : "Semua Lunas / Tidak Ada Jadwal"}
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
                          ({item.daysLeft < 0 ? (
                            <strong className="text-red-600 dark:text-red-400 font-bold">TERLAMBAT {Math.abs(item.daysLeft)} HARI</strong>
                          ) : item.daysLeft === 0 ? (
                            <strong className="text-red-500 font-bold">HARI INI TERAKHIR</strong>
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-dashed text-center text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Tidak ada penghuni yang perlu diingatkan saat ini.</p>
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

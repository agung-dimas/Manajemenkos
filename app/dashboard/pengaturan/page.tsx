"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Home, CreditCard, Bell, CheckCircle2, ChevronLeft, Loader2, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { getFonnteDeviceStatus } from "@/src/actions/whatsapp.action"
import { getResendStatus, sendTestEmail } from "@/src/actions/email.action"
import { getCurrentUser, updateUserProfile } from "@/src/actions/auth"
import { ReminderSettingsCard } from "@/src/components/pengaturan/ReminderSettingsCard"

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState("menu")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [waStatus, setWaStatus] = useState<any>(null)
  const [isLoadingWa, setIsLoadingWa] = useState(false)

  const fetchWaStatus = async () => {
    setIsLoadingWa(true)
    try {
      const status = await getFonnteDeviceStatus()
      setWaStatus(status)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingWa(false)
    }
  }

  const [emailStatus, setEmailStatus] = useState<any>(null)
  const [isLoadingEmail, setIsLoadingEmail] = useState(false)

  const fetchEmailStatus = async () => {
    setIsLoadingEmail(true)
    try {
      const status = await getResendStatus()
      setEmailStatus(status)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingEmail(false)
    }
  }

  const [testEmail, setTestEmail] = useState("")
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false)
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      alert("Masukkan alamat email yang valid!")
      return
    }
    setIsSendingTestEmail(true)
    setTestEmailResult(null)
    try {
      const res = await sendTestEmail(testEmail.trim())
      if (res.success) {
        setTestEmailResult({ success: true, message: `Email uji coba berhasil dikirim ke ${testEmail}!` })
      } else {
        setTestEmailResult({ success: false, message: res.error || "Gagal mengirim email." })
      }
    } catch (err: any) {
      setTestEmailResult({ success: false, message: err.message || "Terjadi kesalahan sistem." })
    } finally {
      setIsSendingTestEmail(false)
    }
  }

  useEffect(() => {
    if (activeTab === "notifications") {
      fetchWaStatus()
      fetchEmailStatus()
    }
  }, [activeTab])

  // Profile state connected to database
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "PETUGAS"
  })

  // Load profile from database on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await getCurrentUser()
        if (user) {
          setProfile({
            name: user.name,
            email: user.email,
            role: user.role
          })
        }
      } catch (err) {
        console.error("Gagal memuat profil pengguna:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  const [kostInfo, setKostInfo] = useState({
    name: "KOST BUWATI",
    phone: "081234567890",
    address: "Jl. Margonda Raya No. 100, Depok, Jawa Barat",
    rules: "1. Jam malam maksimal pukul 23:00 WIB\n2. Tamu menginap harus melapor petugas\n3. Dilarang merokok di area lorong kamar"
  })

  const [bankInfo, setBankInfo] = useState({
    bankName: "Bank Central Asia (BCA)",
    accountNumber: "8001298453",
    accountHolder: "KOST BUWATI"
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMsg(null)

    try {
      if (activeTab === "profile" || activeTab === "menu") {
        const res = await updateUserProfile(profile.name)
        if (res?.error) {
          alert(res.error)
        } else {
          setSuccessMsg("Profil berhasil disimpan ke database!")
        }
      } else {
        // Mock save for other settings
        await new Promise((resolve) => setTimeout(resolve, 800))
        setSuccessMsg("Pengaturan berhasil disimpan secara lokal!")
      }
    } catch (err) {
      console.error(err)
      alert("Terjadi kesalahan saat menyimpan pengaturan.")
    } finally {
      setIsSaving(false)
      setTimeout(() => setSuccessMsg(null), 3000)
    }
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola konfigurasi akun, detail kost, dan rekening pembayaran.</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {isLoading ? (
        <Card className="flex flex-col items-center justify-center p-12 min-h-[350px] shadow-sm border border-border/60">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Memuat data pengaturan...</p>
        </Card>
      ) : (
        <>
          {/* Mobile Card-style Menu Grid */}
          {activeTab === "menu" && (
            <div className="grid gap-4 md:hidden">
              <Card
                className="p-4 cursor-pointer hover:bg-accent/40 active:bg-accent/60 transition-all flex items-start gap-4 shadow-sm border border-border/60"
                onClick={() => setActiveTab("profile")}
              >
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm">Profil Pengguna</h3>
                  <p className="text-xs text-muted-foreground">Ubah data personal akun operator atau admin Anda.</p>
                </div>
              </Card>

              <Card
                className="p-4 cursor-pointer hover:bg-accent/40 active:bg-accent/60 transition-all flex items-start gap-4 shadow-sm border border-border/60"
                onClick={() => setActiveTab("kost")}
              >
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Home className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm">Detail Informasi Kost</h3>
                  <p className="text-xs text-muted-foreground">Detail properti kost ini yang terlampir di laporan.</p>
                </div>
              </Card>

              <Card
                className="p-4 cursor-pointer hover:bg-accent/40 active:bg-accent/60 transition-all flex items-start gap-4 shadow-sm border border-border/60"
                onClick={() => setActiveTab("bank")}
              >
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm">Metode Rekening Bank</h3>
                  <p className="text-xs text-muted-foreground">Rekening transfer resmi untuk pembayaran tagihan.</p>
                </div>
              </Card>

              <Card
                className="p-4 cursor-pointer hover:bg-accent/40 active:bg-accent/60 transition-all flex items-start gap-4 shadow-sm border border-border/60"
                onClick={() => setActiveTab("notifications")}
              >
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm">Notifikasi & Preferensi</h3>
                  <p className="text-xs text-muted-foreground">Sesuaikan preferensi pengingat sistem dan WhatsApp.</p>
                </div>
              </Card>
            </div>
          )}

          <div className={cn(
            "flex flex-col gap-6 md:flex-row",
            activeTab === "menu" ? "hidden md:flex" : "flex"
          )}>
            {/* Tab Navigation Sidebar (Desktop only) */}
            <div className="w-full md:w-64 shrink-0 hidden md:block">
              <Card className="p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                    (activeTab === "profile" || activeTab === "menu") ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <User className="h-4 w-4" />
                  Profil Pengguna
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("kost")}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                    activeTab === "kost" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <Home className="h-4 w-4" />
                  Detail Informasi Kost
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("bank")}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                    activeTab === "bank" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <CreditCard className="h-4 w-4" />
                  Metode Rekening Bank
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("notifications")}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                    activeTab === "notifications" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <Bell className="h-4 w-4" />
                  Notifikasi & Preferensi
                </button>
              </Card>
            </div>

            {/* Tab Content Panels */}
            <div className="flex-1">
              <form onSubmit={handleSave}>
                {/* Profile Tab Panel */}
                <div className={cn(
                  activeTab === "profile" ? "block" : "hidden",
                  activeTab === "menu" ? "md:block" : ""
                )}>
                  <Card>
                    <CardHeader>
                      {/* Mobile Back Button */}
                      <div className="md:hidden mb-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8 px-2.5"
                          onClick={() => setActiveTab("menu")}
                        >
                          <ChevronLeft className="h-4 w-4" /> Kembali
                        </Button>
                      </div>
                      <CardTitle>Profil Pengguna</CardTitle>
                      <CardDescription>Ubah data personal akun operator atau admin Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="prof-name">Nama Lengkap</Label>
                        <Input
                          id="prof-name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="prof-email">Email Terdaftar</Label>
                        <Input
                          id="prof-email"
                          type="email"
                          value={profile.email}
                          disabled
                          className="bg-zinc-50 dark:bg-zinc-900 cursor-not-allowed"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="prof-role">Hak Akses Sistem</Label>
                        <Select value={profile.role} disabled>
                          <SelectTrigger id="prof-role" className="bg-zinc-50 dark:bg-zinc-900 cursor-not-allowed">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Administrator / Pemilik (Owner)</SelectItem>
                            <SelectItem value="PETUGAS">Petugas Lapangan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4 justify-end">
                      <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                {/* Information Kost Tab Panel */}
                <div className={cn(activeTab === "kost" ? "block" : "hidden")}>
                  <Card>
                    <CardHeader>
                      {/* Mobile Back Button */}
                      <div className="md:hidden mb-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8 px-2.5"
                          onClick={() => setActiveTab("menu")}
                        >
                          <ChevronLeft className="h-4 w-4" /> Kembali
                        </Button>
                      </div>
                      <CardTitle>Informasi Kost</CardTitle>
                      <CardDescription>Detail properti kost ini yang akan terlampir di laporan dan info pembayaran.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="kost-name">Nama Kost</Label>
                        <Input
                          id="kost-name"
                          value={kostInfo.name}
                          onChange={(e) => setKostInfo({ ...kostInfo, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="kost-phone">Nomor Telepon Operasional</Label>
                        <Input
                          id="kost-phone"
                          value={kostInfo.phone}
                          onChange={(e) => setKostInfo({ ...kostInfo, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="kost-address">Alamat Kost</Label>
                        <Textarea
                          id="kost-address"
                          value={kostInfo.address}
                          onChange={(e) => setKostInfo({ ...kostInfo, address: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="kost-rules">Tata Tertib Hunian</Label>
                        <Textarea
                          id="kost-rules"
                          rows={5}
                          value={kostInfo.rules}
                          onChange={(e) => setKostInfo({ ...kostInfo, rules: e.target.value })}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4 justify-end">
                      <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                {/* Bank Tab Panel */}
                <div className={cn(activeTab === "bank" ? "block" : "hidden")}>
                  <Card>
                    <CardHeader>
                      {/* Mobile Back Button */}
                      <div className="md:hidden mb-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8 px-2.5"
                          onClick={() => setActiveTab("menu")}
                        >
                          <ChevronLeft className="h-4 w-4" /> Kembali
                        </Button>
                      </div>
                      <CardTitle>Rekening Bank Penerima</CardTitle>
                      <CardDescription>Rekening transfer resmi untuk pembayaran tagihan bulanan para penghuni.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="bank-name">Pilih Bank</Label>
                        <Input
                          id="bank-name"
                          value={bankInfo.bankName}
                          onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bank-number">Nomor Rekening</Label>
                        <Input
                          id="bank-number"
                          value={bankInfo.accountNumber}
                          onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bank-holder">Nama Pemilik Rekening (Atas Nama)</Label>
                        <Input
                          id="bank-holder"
                          value={bankInfo.accountHolder}
                          onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4 justify-end">
                      <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                {/* Notifications Tab Panel */}
                <div className={cn(activeTab === "notifications" ? "block" : "hidden")}>
                  <Card>
                    <CardHeader>
                      {/* Mobile Back Button */}
                      <div className="md:hidden mb-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8 px-2.5"
                          onClick={() => setActiveTab("menu")}
                        >
                          <ChevronLeft className="h-4 w-4" /> Kembali
                        </Button>
                      </div>
                      <CardTitle>Notifikasi & Preferensi</CardTitle>
                      <CardDescription>Sesuaikan preferensi pengingat sistem dan metode sinkronisasi data.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Resend Email Gateway Status */}
                      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-md bg-zinc-50/50 dark:bg-zinc-900/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold">Layanan Email Otomatis (Resend API)</h3>
                          </div>
                          <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Utama (Primary)
                          </span>
                        </div>
                        {isLoadingEmail ? (
                          <p className="text-xs text-muted-foreground animate-pulse">Memeriksa konfigurasi Resend...</p>
                        ) : emailStatus ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "h-2.5 w-2.5 rounded-full",
                                emailStatus.configured ? "bg-green-500 animate-pulse" : "bg-amber-500 animate-pulse"
                              )} />
                              <span className="text-sm font-medium">
                                {emailStatus.configured ? "Aktif & Terhubung (Live API)" : "Mode Simulasi (Belum Ada API Key)"}
                              </span>
                            </div>
                            <div className="text-xs space-y-1 text-muted-foreground border-t border-zinc-200/60 dark:border-zinc-800/60 pt-2.5 mt-2.5">
                              <p>Pengirim (From): <span className="text-foreground font-mono font-medium">{emailStatus.from || "KOST BU WATI <onboarding@resend.dev>"}</span></p>
                              <p>Keterangan: <span className="text-foreground">{emailStatus.message}</span></p>
                            </div>
                            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium">Uji Coba Kirim Email</Label>
                                <button
                                  type="button"
                                  onClick={() => setTestEmail("sistemaset.plnupdlpalembang@gmail.com")}
                                  className="text-[11px] text-primary hover:underline"
                                >
                                  Gunakan Email Terdaftar Resend
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  type="email"
                                  placeholder="sistemaset.plnupdlpalembang@gmail.com"
                                  value={testEmail}
                                  onChange={(e) => setTestEmail(e.target.value)}
                                  className="h-8 text-xs max-w-xs"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={isSendingTestEmail}
                                  onClick={handleSendTestEmail}
                                  className="h-8 text-xs px-3"
                                >
                                  {isSendingTestEmail ? (
                                    <>
                                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                      Mengirim...
                                    </>
                                  ) : (
                                    "Kirim Email Uji Coba"
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={fetchEmailStatus}
                                  className="h-8 text-xs px-3"
                                >
                                  Segarkan
                                </Button>
                              </div>
                              <div className="p-2.5 rounded bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                                <strong>Catatan Akun Uji Coba Resend:</strong> Karena menggunakan domain gratis bawaan (<code>onboarding@resend.dev</code>), Resend membatasi penerima hanya ke email pemilik akun Anda (<code>sistemaset.plnupdlpalembang@gmail.com</code>). Untuk mengirim ke sembarang email publik, verifikasi domain Anda di <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="underline font-medium">resend.com/domains</a>.
                              </div>
                              {testEmailResult && (
                                <p className={cn(
                                  "text-xs font-medium mt-1.5",
                                  testEmailResult.success ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                                )}>
                                  {testEmailResult.message}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={fetchEmailStatus}
                            className="h-8 text-xs px-3"
                          >
                            Periksa Status Resend
                          </Button>
                        )}
                      </div>

                      {/* WhatsApp Device Connection Status */}
                      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-md bg-zinc-50/50 dark:bg-zinc-900/30">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold">Status WhatsApp Gateway (Fonnte)</h3>
                          <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-zinc-500/10 text-muted-foreground">
                            Sekunder / Opsional
                          </span>
                        </div>
                        {isLoadingWa ? (
                          <p className="text-xs text-muted-foreground animate-pulse">Memeriksa status koneksi perangkat...</p>
                        ) : waStatus ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "h-2.5 w-2.5 rounded-full",
                                waStatus.mode === "SIMULATED"
                                  ? "bg-amber-500 animate-pulse"
                                  : waStatus.deviceStatus === "connect"
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-red-500"
                              )} />
                              <span className="text-sm font-medium">
                                {waStatus.mode === "SIMULATED"
                                  ? "Mode Simulasi (Local Console)"
                                  : waStatus.deviceStatus === "connect"
                                    ? "Terhubung (Connected)"
                                    : "Terputus (Disconnected)"
                                }
                              </span>
                            </div>
                            {waStatus.mode === "LIVE" && waStatus.success && (
                              <div className="text-xs space-y-1 text-muted-foreground border-t border-zinc-200/60 dark:border-zinc-800/60 pt-2.5 mt-2.5">
                                <p>Nama Perangkat: <span className="text-foreground font-medium">{waStatus.name || "-"}</span></p>
                                <p>Nomor HP: <span className="text-foreground font-medium">+{waStatus.device || "-"}</span></p>
                                <p>Kuota Harian: <span className="text-foreground font-medium">{waStatus.quota || 0} pesan</span></p>
                                <p>Masa Aktif: <span className="text-foreground font-medium">{waStatus.expired || "-"}</span></p>
                              </div>
                            )}
                            {waStatus.mode === "SIMULATED" && (
                              <p className="text-xs text-muted-foreground border-t border-zinc-200/60 dark:border-zinc-800/60 pt-2.5 mt-2.5 leading-relaxed">
                                Aplikasi berjalan dalam mode simulasi karena token Fonnte belum disetel di <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">.env</code>. Semua notifikasi WhatsApp akan dicetak di terminal konsol server.
                              </p>
                            )}
                            {waStatus.mode === "LIVE" && !waStatus.success && (
                              <p className="text-xs text-red-500 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-2.5 mt-2.5">
                                Error: {waStatus.message || "Gagal menghubungi API Fonnte"}
                              </p>
                            )}
                            <div className="pt-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={fetchWaStatus}
                                className="h-8 text-xs px-3"
                              >
                                Segarkan Status
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={fetchWaStatus}
                            className="h-8 text-xs px-3"
                          >
                            Periksa Koneksi
                          </Button>
                        )}
                      </div>
                      {/* Fix Supabase Storage Button */}
                      <div className="flex flex-col gap-4 p-4 border border-amber-200/50 bg-amber-50/30 dark:bg-amber-950/10 rounded-md">
                        <div className="space-y-0.5">
                          <Label className="text-base font-semibold text-amber-600 dark:text-amber-400">Perbaiki Koneksi Database Storage</Label>
                          <p className="text-sm text-muted-foreground">Jalankan ini jika pengunggahan PDF Invoice / Kuitansi gagal. Sistem akan otomatis mengonfigurasi Bucket dan Perizinan Supabase Storage Anda.</p>
                        </div>
                        <Button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch("/api/setup-storage")
                              const json = await res.json()
                              if (json.success) {
                                alert(json.message)
                              } else {
                                alert("Gagal mengatur storage: " + json.error)
                              }
                            } catch (err) {
                              alert("Gagal memanggil API setup storage")
                            }
                          }}
                          className="w-full sm:w-auto self-start bg-amber-600 hover:bg-amber-500 text-white"
                        >
                          Perbaiki Storage Sekarang
                        </Button>
                      </div>

                      {/* Pengaturan Pengingat Jatuh Tempo & Uji Coba Langsung */}
                      <ReminderSettingsCard />
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4 justify-end">
                      <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

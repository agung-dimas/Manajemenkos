import Link from "next/link"
import { getAllTenants } from "@/src/repositories/penghuni.repo"
import { removeTenant, checkoutTenant } from "@/src/actions/penghuni.action"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, LogOut, CheckCircle2, AlertCircle, Calendar, CreditCard } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

function getTenantPaymentSummary(tenant: any) {
  const payments = tenant.payments || []
  const pendingPayment = payments.find(
    (p: any) => p.status === "BELUM_BAYAR" || p.status === "TERKIRIM" || p.status === "SEBAGIAN"
  )
  const latestPaid = payments.find((p: any) => p.status === "LUNAS")

  let nextDueDate: Date | null = null
  let coveredPeriod = ""

  if (latestPaid) {
    coveredPeriod = latestPaid.periodLabel || `${latestPaid.month}/${latestPaid.year}`
    const joinDateObj = tenant.joinDate && !isNaN(new Date(tenant.joinDate).getTime())
      ? new Date(tenant.joinDate)
      : new Date()
    const joinDay = joinDateObj.getDate() || 1

    const startM = latestPaid.month
    const startY = latestPaid.year
    const duration = latestPaid.durationMonth || 1

    // Tanggal jatuh tempo berikutnya dihitung dari awal sewa + durasi bulan yang dibayar
    nextDueDate = new Date(startY, (startM - 1) + duration, joinDay)
  }

  return {
    pendingPayment,
    latestPaid,
    coveredPeriod,
    nextDueDate,
  }
}

export default async function PenghuniPage(props: any) {
  const searchParams = await props.searchParams
  const tab = searchParams?.status === "TIDAK_AKTIF" ? "TIDAK_AKTIF" : "AKTIF"
  
  const tenants = await getAllTenants(tab)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daftar Penghuni</h1>
          <p className="text-muted-foreground">Kelola data penghuni kost yang sedang aktif dan riwayat mantan penghuni.</p>
        </div>
        <Link href="/dashboard/penghuni/tambah" className="w-full sm:w-auto">
          <Button className="w-full"><Plus className="mr-2 h-4 w-4" /> Tambah Penghuni</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-2">
        <Link href="/dashboard/penghuni">
          <Button variant={tab === "AKTIF" ? "default" : "ghost"} size="sm" className="rounded-full">
            Penghuni Aktif
          </Button>
        </Link>
        <Link href="/dashboard/penghuni?status=TIDAK_AKTIF">
          <Button variant={tab === "TIDAK_AKTIF" ? "default" : "ghost"} size="sm" className="rounded-full">
            Mantan Penghuni
          </Button>
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kamar</TableHead>
              <TableHead>No. HP</TableHead>
              <TableHead>Tgl Masuk</TableHead>
              {tab === "TIDAK_AKTIF" && <TableHead>Tgl Keluar</TableHead>}
              <TableHead>Status Pembayaran & Tagihan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tab === "TIDAK_AKTIF" ? 8 : 7} className="text-center h-24 text-muted-foreground">
                  Belum ada data penghuni.
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant: any) => {
                const payInfo = getTenantPaymentSummary(tenant)
                const now = new Date()
                const isUpcoming = payInfo.nextDueDate && (payInfo.nextDueDate.getTime() - now.getTime()) <= 7 * 24 * 60 * 60 * 1000
                const isOverdue = payInfo.nextDueDate && (payInfo.nextDueDate.getTime() < now.getTime())

                return (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{tenant.name}</div>
                        {tenant.email && (
                          <div className="text-[11px] text-muted-foreground font-mono">{tenant.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/kamar/${tenant.room.id}`}>
                        <Badge variant="outline" className="font-bold hover:bg-primary/10 transition-colors cursor-pointer text-primary">
                          Kamar {tenant.room.number}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell>{tenant.phone}</TableCell>
                    <TableCell>{tenant.joinDate && !isNaN(new Date(tenant.joinDate).getTime()) ? format(new Date(tenant.joinDate), "dd MMM yyyy") : "-"}</TableCell>
                    {tab === "TIDAK_AKTIF" && (
                      <TableCell>{tenant.leaveDate ? format(new Date(tenant.leaveDate), "dd MMM yyyy") : "-"}</TableCell>
                    )}
                    
                    {/* Kolom Detail Pembayaran & Tagihan Berikutnya */}
                    <TableCell>
                      {payInfo.pendingPayment ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50">
                            <AlertCircle className="h-3 w-3" />
                            Ada Tagihan Pending
                          </span>
                          <div className="text-xs font-semibold text-foreground">
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(payInfo.pendingPayment.amount)}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Periode: {payInfo.pendingPayment.periodLabel || `${payInfo.pendingPayment.month}/${payInfo.pendingPayment.year}`}
                          </div>
                        </div>
                      ) : payInfo.latestPaid ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50">
                            <CheckCircle2 className="h-3 w-3" />
                            Lunas ({payInfo.latestPaid.durationMonth || 1} Bln)
                          </span>
                          <div className="text-xs font-medium text-foreground">
                            {payInfo.coveredPeriod}
                          </div>
                          {payInfo.nextDueDate && (
                            <div className={cn(
                              "text-[11px] font-medium flex items-center gap-1",
                              isOverdue
                                ? "text-red-600 dark:text-red-400 font-semibold"
                                : isUpcoming
                                  ? "text-amber-600 dark:text-amber-400 font-semibold"
                                  : "text-muted-foreground"
                            )}>
                              <Calendar className="h-3 w-3" />
                              Tagihan Berikutnya: {format(payInfo.nextDueDate, "dd MMM yyyy")}
                              {isOverdue ? " (Jatuh Tempo)" : isUpcoming ? " (Segera)" : ""}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Belum ada pembayaran
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant={tenant.status === "AKTIF" ? "default" : "secondary"}>
                        {tenant.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {tenant.status === "AKTIF" && (
                          <form action={checkoutTenant}>
                            <input type="hidden" name="id" value={tenant.id} />
                            <input type="hidden" name="roomId" value={tenant.roomId} />
                            <Button variant="outline" size="sm" className="h-8 gap-1 border-amber-200 text-amber-700 hover:bg-amber-50" type="submit">
                              <LogOut className="h-3.5 w-3.5" /> <span className="hidden lg:inline">Checkout</span>
                            </Button>
                          </form>
                        )}
                        <form action={removeTenant}>
                          <input type="hidden" name="id" value={tenant.id} />
                          <input type="hidden" name="roomId" value={tenant.roomId} />
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" type="submit">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {tenants.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Belum ada data penghuni.
          </Card>
        ) : (
          tenants.map((tenant: any) => {
            const payInfo = getTenantPaymentSummary(tenant)
            const now = new Date()
            const isUpcoming = payInfo.nextDueDate && (payInfo.nextDueDate.getTime() - now.getTime()) <= 7 * 24 * 60 * 60 * 1000
            const isOverdue = payInfo.nextDueDate && (payInfo.nextDueDate.getTime() < now.getTime())

            return (
              <Card key={tenant.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-lg">{tenant.name}</span>
                    {tenant.email && (
                      <p className="text-xs text-muted-foreground font-mono">{tenant.email}</p>
                    )}
                  </div>
                  <Badge variant={tenant.status === "AKTIF" ? "default" : "secondary"}>
                    {tenant.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>Kamar:</span>
                    <Link href={`/dashboard/kamar/${tenant.room.id}`}>
                      <span className="font-semibold text-primary hover:underline">Kamar {tenant.room.number}</span>
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span>No. HP:</span>
                    <span className="text-foreground">{tenant.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal Masuk:</span>
                    <span className="text-foreground">{tenant.joinDate && !isNaN(new Date(tenant.joinDate).getTime()) ? format(new Date(tenant.joinDate), "dd MMM yyyy") : "-"}</span>
                  </div>
                  {tenant.status === "TIDAK_AKTIF" && (
                    <div className="flex justify-between border-t border-border/50 pt-1.5 mt-1.5">
                      <span>Tanggal Keluar:</span>
                      <span className="text-foreground">{tenant.leaveDate ? format(new Date(tenant.leaveDate), "dd MMM yyyy") : "-"}</span>
                    </div>
                  )}
                </div>

                {/* Mobile Payment Summary Box */}
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1.5 text-xs">
                  <div className="font-semibold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                      Status Pembayaran
                    </span>
                    {payInfo.pendingPayment ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        Tagihan Pending
                      </span>
                    ) : payInfo.latestPaid ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Lunas ({payInfo.latestPaid.durationMonth || 1} Bln)
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">Belum Ada Data</span>
                    )}
                  </div>
                  {payInfo.pendingPayment ? (
                    <div className="text-muted-foreground">
                      Total: <span className="font-semibold text-foreground">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(payInfo.pendingPayment.amount)}</span> ({payInfo.pendingPayment.periodLabel})
                    </div>
                  ) : payInfo.latestPaid ? (
                    <>
                      <div className="text-muted-foreground">
                        Periode: <span className="font-medium text-foreground">{payInfo.coveredPeriod}</span>
                      </div>
                      {payInfo.nextDueDate && (
                        <div className={cn(
                          "flex items-center gap-1",
                          isOverdue ? "text-red-600 font-semibold" : isUpcoming ? "text-amber-600 font-semibold" : "text-muted-foreground"
                        )}>
                          <Calendar className="h-3 w-3" />
                          Tagihan Berikutnya: {format(payInfo.nextDueDate, "dd MMM yyyy")}
                        </div>
                      )}
                    </>
                  ) : null}
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-border/50 pt-2">
                  {tenant.status === "AKTIF" && (
                    <form action={checkoutTenant}>
                      <input type="hidden" name="id" value={tenant.id} />
                      <input type="hidden" name="roomId" value={tenant.roomId} />
                      <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50 gap-1.5 h-8" type="submit">
                        <LogOut className="h-4 w-4" /> Checkout
                      </Button>
                    </form>
                  )}
                  <form action={removeTenant}>
                    <input type="hidden" name="id" value={tenant.id} />
                    <input type="hidden" name="roomId" value={tenant.roomId} />
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 h-8" type="submit">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

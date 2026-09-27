import Link from "next/link"
import { getAllPayments } from "@/src/repositories/pembayaran.repo"
import { removePayment, markAsPaid, resendInvoice, addInstallment } from "@/src/actions/pembayaran.action"
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, ExternalLink, CheckCircle, Send, Banknote } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"

// Array helper untuk mengubah angka bulan menjadi nama bulan
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

export default async function PembayaranPage() {
  const payments = await getAllPayments()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Pembayaran</h1>
          <p className="text-muted-foreground">Kelola riwayat transaksi, tagihan, dan cicilan penghuni.</p>
        </div>
        <Link href="/dashboard/pembayaran/tambah" className="w-full sm:w-auto">
          <Button className="w-full"><Plus className="mr-2 h-4 w-4" /> Catat Pembayaran</Button>
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Penghuni (Kamar)</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dokumen</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  Belum ada data pembayaran.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment: any) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.tenant.name} <span className="text-muted-foreground">({payment.tenant.room.number})</span>
                    {payment.invoiceNumber && <div className="text-xs text-muted-foreground">{payment.invoiceNumber}</div>}
                  </TableCell>
                  <TableCell>{payment.periodLabel || `${MONTHS[payment.month - 1]} ${payment.year}`}</TableCell>
                  <TableCell>
                    <div>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(payment.amount)}</div>
                    {payment.paidAmount > 0 && payment.status !== "LUNAS" && (
                      <div className="text-xs text-orange-600 font-medium mt-1">
                        Terbayar: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(payment.paidAmount)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.status === "LUNAS" ? "default" : payment.status === "BELUM_BAYAR" || payment.status === "TERKIRIM" ? "secondary" : payment.status === "SEBAGIAN" ? "outline" : "destructive"}>
                      {payment.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {payment.invoiceUrl && (
                        <a href={payment.invoiceUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-xs">
                          Invoice <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {payment.proofUrl && (
                        <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="text-green-600 hover:underline flex items-center gap-1 text-xs">
                          Kuitansi Lunas <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {payment.installments && payment.installments.map((inst: any, idx: number) => inst.receiptUrl && (
                        <a key={inst.id} href={inst.receiptUrl} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline flex items-center gap-1 text-xs">
                          Kuitansi Cicilan {idx+1} <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                      {!payment.invoiceUrl && !payment.proofUrl && (!payment.installments || payment.installments.length === 0) && <span className="text-muted-foreground text-sm">-</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {payment.status !== "LUNAS" && (
                        <>
                          <form action={addInstallment} className="flex gap-1 items-center bg-muted/30 p-1 rounded-md border border-border/50">
                            <input type="hidden" name="paymentId" value={payment.id} />
                            <input type="hidden" name="method" value="Transfer" />
                            <Input name="amount" type="number" placeholder="Nominal Cicil" className="w-24 h-8 text-xs px-2" required min="1" max={payment.amount - payment.paidAmount} />
                            <SubmitButton type="submit" size="sm" variant="ghost" pendingText="" className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50" title="Simpan Cicilan">
                              <Banknote className="h-3.5 w-3.5" />
                            </SubmitButton>
                          </form>
                          <form action={markAsPaid.bind(null, payment.id)}>
                            <SubmitButton variant="outline" size="sm" pendingText="Memproses..." className="h-8 gap-1 border-green-200 text-green-700 hover:bg-green-50">
                              <CheckCircle className="h-3.5 w-3.5" /> <span className="hidden lg:inline">Lunas</span>
                            </SubmitButton>
                          </form>
                        </>
                      )}
                      {payment.status !== "LUNAS" && (
                        <form action={resendInvoice.bind(null, payment.id)}>
                          <SubmitButton variant="outline" size="sm" pendingText="Mengirim..." className="h-8 gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-950/30" title="Kirim Pengingat Tagihan (Email & WhatsApp)">
                            <Send className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline text-xs">Ingatkan</span>
                          </SubmitButton>
                        </form>
                      )}
                      <form action={removePayment.bind(null, payment.id)}>
                        <SubmitButton variant="ghost" size="icon" pendingText="" className="h-8 w-8 text-red-500" title="Hapus Pembayaran">
                          <Trash2 className="h-4 w-4" />
                        </SubmitButton>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {payments.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Belum ada data pembayaran.
          </Card>
        ) : (
          payments.map((payment: any) => (
            <Card key={payment.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-base block">{payment.tenant.name}</span>
                  <span className="text-sm text-muted-foreground">Kamar {payment.tenant.room.number}</span>
                </div>
                <Badge variant={payment.status === "LUNAS" ? "default" : payment.status === "BELUM_BAYAR" || payment.status === "TERKIRIM" ? "secondary" : payment.status === "SEBAGIAN" ? "outline" : "destructive"}>
                  {payment.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Periode:</span>
                  <span className="font-medium text-foreground">{payment.periodLabel || `${MONTHS[payment.month - 1]} ${payment.year}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nominal:</span>
                  <span className="font-semibold text-foreground">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(payment.amount)}
                  </span>
                </div>
                {payment.paidAmount > 0 && payment.status !== "LUNAS" && (
                  <div className="flex justify-between text-orange-600 font-medium">
                    <span>Telah Dibayar:</span>
                    <span>
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(payment.paidAmount)}
                    </span>
                  </div>
                )}
                {payment.invoiceNumber && (
                  <div className="flex justify-between">
                    <span>Invoice:</span>
                    <span className="text-foreground">{payment.invoiceNumber}</span>
                  </div>
                )}
                {(payment.invoiceUrl || payment.proofUrl || (payment.installments && payment.installments.length > 0)) && (
                  <div className="flex justify-between items-start pt-1">
                    <span>Dokumen:</span>
                    <div className="flex flex-col items-end gap-1">
                      {payment.invoiceUrl && (
                        <a href={payment.invoiceUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                          Lihat Invoice <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      )}
                      {payment.proofUrl && (
                        <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="text-green-600 hover:underline flex items-center gap-1">
                          Lihat Kuitansi Lunas <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      )}
                      {payment.installments && payment.installments.map((inst: any, idx: number) => inst.receiptUrl && (
                        <a key={inst.id} href={inst.receiptUrl} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline flex items-center gap-1 text-xs">
                          Kuitansi Cicilan {idx+1} <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Form Input Cicilan Mobile */}
              {payment.status !== "LUNAS" && (
                <div className="border-t border-border/50 pt-3">
                  <form action={addInstallment} className="flex gap-2 items-center bg-muted/30 p-2 rounded-md border border-border/50">
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <input type="hidden" name="method" value="Transfer" />
                    <Input name="amount" type="number" placeholder="Nominal Cicil" className="h-9 flex-1 text-sm" required min="1" max={payment.amount - payment.paidAmount} />
                    <SubmitButton type="submit" size="sm" variant="secondary" pendingText="Menyimpan..." className="h-9 text-orange-600 hover:text-orange-700 hover:bg-orange-100">
                      Cicil
                    </SubmitButton>
                  </form>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2 border-t border-border/50 pt-3 mt-3">
                {payment.status !== "LUNAS" && (
                  <form action={markAsPaid.bind(null, payment.id)}>
                    <SubmitButton variant="outline" size="sm" pendingText="Memproses..." className="border-green-200 text-green-700 hover:bg-green-50 gap-1.5 h-8">
                      <CheckCircle className="h-4 w-4" /> Lunas
                    </SubmitButton>
                  </form>
                )}
                {payment.status !== "LUNAS" && (
                  <form action={resendInvoice.bind(null, payment.id)}>
                    <SubmitButton variant="outline" size="sm" pendingText="Mengirim..." className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-950/30 gap-1.5 h-8" title="Kirim Pengingat Tagihan (Email & WhatsApp)">
                      <Send className="h-3.5 w-3.5" /> Ingatkan
                    </SubmitButton>
                  </form>
                )}
                <form action={removePayment.bind(null, payment.id)}>
                  <SubmitButton variant="ghost" size="sm" pendingText="" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 h-8">
                    <Trash2 className="h-4 w-4" />
                  </SubmitButton>
                </form>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

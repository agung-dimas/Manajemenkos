import Link from "next/link"
import { getAllExpenses } from "@/src/repositories/pengeluaran.repo"
import { removeExpense } from "@/src/actions/pengeluaran.action"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"

export default async function PengeluaranPage() {
  const expenses = await getAllExpenses()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Biaya Operasional (Pengeluaran)</h1>
          <p className="text-muted-foreground">Catat dan kelola pengeluaran operasional kost bulanan.</p>
        </div>
        <Link href="/dashboard/pengeluaran/tambah" className="w-full sm:w-auto">
          <Button className="w-full"><Plus className="mr-2 h-4 w-4" /> Catat Pengeluaran</Button>
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Pengeluaran</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  Belum ada data pengeluaran.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense: any) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="text-red-600 font-semibold">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(expense.amount)}
                  </TableCell>
                  <TableCell>{format(new Date(expense.date), "dd MMM yyyy")}</TableCell>
                  <TableCell>{expense.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <form action={removeExpense.bind(null, expense.id)}>
                      <Button variant="ghost" size="icon" className="text-red-500" type="submit">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {expenses.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Belum ada data pengeluaran.
          </Card>
        ) : (
          expenses.map((expense: any) => (
            <Card key={expense.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-base block">{expense.title}</span>
                  <Badge variant="outline" className="mt-1">{expense.category}</Badge>
                </div>
                <span className="text-red-600 font-bold text-base">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(expense.amount)}
                </span>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span className="text-foreground">{format(new Date(expense.date), "dd MMM yyyy")}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span>Keterangan:</span>
                  <span className="text-foreground text-xs">{expense.description || "-"}</span>
                </div>
              </div>
              <div className="flex justify-end border-t border-border/50 pt-2">
                <form action={removeExpense.bind(null, expense.id)}>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 h-8" type="submit">
                    <Trash2 className="h-4 w-4" />
                    <span>Hapus Pengeluaran</span>
                  </Button>
                </form>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

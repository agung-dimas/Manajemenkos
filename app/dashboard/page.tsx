import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardStats, getRevenueChartData } from "@/src/repositories/dashboard.repo"
import { RevenueChart } from "@/src/components/dashboard/revenue-chart"
import { BedDouble, Users, Wallet, Home, ArrowDownRight, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  // Fetch data dari database (berjalan di Server)
  const stats = await getDashboardStats()
  const chartData = await getRevenueChartData()
  const netProfit = stats.revenue - stats.expenses

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan operasional dan finansial kost Anda.</p>
      </div>

      {/* Grid Statistik Utama */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Laba Bersih */}
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laba Bersih Bulan Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pendapatan dikurangi pengeluaran
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Pendapatan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(stats.revenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari tagihan terbayar lunas
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Pengeluaran */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(stats.expenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Biaya operasional bulan ini
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Kamar Terisi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Okupansi Kamar</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.occupiedRooms} / {stats.totalRooms} Kamar
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}% Tingkat Hunian
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid Grafik */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Grafik Pendapatan Tahun Ini</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Ringkasan Hunian & Penghuni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Total Penghuni Aktif</p>
                  <p className="text-sm text-muted-foreground">Penyewa kamar terdaftar</p>
                </div>
                <div className="ml-auto font-medium">{stats.totalTenants} Orang</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none text-green-500">Kamar Terisi</p>
                  <p className="text-sm text-muted-foreground">Kamar berpenghuni</p>
                </div>
                <div className="ml-auto font-medium">{stats.occupiedRooms}</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none text-blue-500">Kamar Kosong</p>
                  <p className="text-sm text-muted-foreground">Kamar siap huni</p>
                </div>
                <div className="ml-auto font-medium">{stats.emptyRooms}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

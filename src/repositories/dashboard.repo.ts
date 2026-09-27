import prisma from "@/lib/prisma"

export async function getDashboardStats() {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Tanggal awal dan akhir bulan berjalan
  const startDate = new Date(currentYear, currentMonth - 1, 1)
  const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999)

  // Menjalankan query secara paralel agar lebih cepat
  const [totalRooms, emptyRooms, occupiedRooms, totalTenants, currentMonthRevenue, currentMonthExpenses] = await Promise.all([
    prisma.room.count(),
    prisma.room.count({ where: { status: "KOSONG" } }),
    prisma.room.count({ where: { status: "TERISI" } }),
    prisma.tenant.count({ where: { status: "AKTIF" } }),
    prisma.payment.aggregate({
      where: {
        month: currentMonth,
        year: currentYear,
        status: "LUNAS",
      },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { amount: true },
    })
  ])

  return {
    totalRooms,
    emptyRooms,
    occupiedRooms,
    totalTenants,
    revenue: currentMonthRevenue._sum.amount || 0,
    expenses: currentMonthExpenses._sum.amount || 0,
  }
}

export async function getRevenueChartData() {
  const currentYear = new Date().getFullYear()
  
  // Ambil semua pembayaran lunas tahun ini
  const payments = await prisma.payment.findMany({
    where: { year: currentYear, status: "LUNAS" },
    select: { month: true, amount: true }
  })

  // Inisialisasi array 12 bulan dengan nilai 0
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    name: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"][i],
    total: 0
  }))

  // Akumulasikan pendapatan per bulan
  payments.forEach(p => {
    monthlyData[p.month - 1].total += p.amount
  })

  // Tampilkan data hanya sampai bulan saat ini agar grafik terlihat realistis
  const currentMonth = new Date().getMonth() + 1
  return monthlyData.slice(0, currentMonth)
}

import prisma from "@/lib/prisma"

export async function getDashboardStats() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Tanggal awal dan akhir bulan berjalan
  const startDate = new Date(currentYear, currentMonth - 1, 1)
  const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999)

  // Indeks bulan berjalan dalam hitungan total bulan (contoh: 2026 * 12 + 9 untuk Oktober 2026)
  const currentMonthIndex = (currentYear * 12) + (currentMonth - 1)

  // Ambil data ruangan, penghuni, pembayaran lunas, dan pengeluaran secara paralel
  const [totalRooms, emptyRooms, occupiedRooms, totalTenants, paidPayments, currentMonthCash, currentMonthExpenses] = await Promise.all([
    prisma.room.count(),
    prisma.room.count({ where: { status: "KOSONG" } }),
    prisma.room.count({ where: { status: "TERISI" } }),
    prisma.tenant.count({ where: { status: "AKTIF" } }),
    // Ambil semua pembayaran yang berstatus LUNAS atau SEBAGIAN untuk dihitung prorata
    prisma.payment.findMany({
      where: {
        status: { in: ["LUNAS", "SEBAGIAN"] }
      },
      select: {
        month: true,
        year: true,
        durationMonth: true,
        amount: true,
        paidAmount: true,
        status: true,
      }
    }),
    // Uang kas masuk baru tepat di bulan ini (opsional untuk informasi arus kas)
    prisma.payment.aggregate({
      where: {
        month: currentMonth,
        year: currentYear,
        status: "LUNAS",
      },
      _sum: { amount: true },
    }),
    // Pengeluaran operasional bulan ini
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

  // Hitung Pendapatan Sewa Prorata untuk Bulan Ini:
  // Sebuah pembayaran mencakup bulan berjalan jika:
  // startIndex <= currentMonthIndex < endIndex
  let proratedRevenue = 0
  for (const p of paidPayments) {
    const duration = p.durationMonth && p.durationMonth > 0 ? p.durationMonth : 1
    const startIndex = (p.year * 12) + (p.month - 1)
    const endIndex = startIndex + duration

    if (currentMonthIndex >= startIndex && currentMonthIndex < endIndex) {
      // Ambil nilai nominal yang efektif (jika LUNAS pakai amount, jika SEBAGIAN pakai paidAmount)
      const effectiveAmount = p.status === "LUNAS" ? p.amount : (p.paidAmount || 0)
      if (effectiveAmount > 0) {
        proratedRevenue += (effectiveAmount / duration)
      }
    }
  }

  return {
    totalRooms,
    emptyRooms,
    occupiedRooms,
    totalTenants,
    revenue: Math.round(proratedRevenue),
    cashRevenue: currentMonthCash._sum.amount || 0,
    expenses: currentMonthExpenses._sum.amount || 0,
  }
}

export async function getRevenueChartData() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  
  // Ambil semua pembayaran lunas atau cicilan
  const payments = await prisma.payment.findMany({
    where: { status: { in: ["LUNAS", "SEBAGIAN"] } },
    select: { month: true, year: true, durationMonth: true, amount: true, paidAmount: true, status: true }
  })

  // Inisialisasi array 12 bulan (Jan - Des)
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    name: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"][i],
    total: 0
  }))

  // Hitung pendapatan prorata untuk setiap bulan (0 - 11) di tahun berjalan
  for (let m = 0; m < 12; m++) {
    const targetMonthIndex = (currentYear * 12) + m
    let monthlySum = 0

    for (const p of payments) {
      const duration = p.durationMonth && p.durationMonth > 0 ? p.durationMonth : 1
      const startIndex = (p.year * 12) + (p.month - 1)
      const endIndex = startIndex + duration

      if (targetMonthIndex >= startIndex && targetMonthIndex < endIndex) {
        const effectiveAmount = p.status === "LUNAS" ? p.amount : (p.paidAmount || 0)
        if (effectiveAmount > 0) {
          monthlySum += (effectiveAmount / duration)
        }
      }
    }

    monthlyData[m].total = Math.round(monthlySum)
  }

  // Tampilkan data sampai bulan saat ini agar grafik realistis
  return monthlyData.slice(0, currentMonth)
}

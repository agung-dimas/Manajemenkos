import prisma from "@/lib/prisma"

export async function getLaporanPembayaran() {
  return await prisma.payment.findMany({
    include: {
      tenant: {
        include: { room: true }
      }
    },
    // Urutkan dari pembayaran terbaru
    orderBy: { createdAt: "desc" }
  })
}

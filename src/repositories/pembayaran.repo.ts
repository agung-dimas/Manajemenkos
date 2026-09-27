import prisma from "@/lib/prisma"

export async function getAllPayments() {
  return await prisma.payment.findMany({
    include: {
      // Mengambil data penghuni, dan sekalian ambil data kamarnya
      tenant: {
        include: { room: true }
      },
      installments: {
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getActiveTenants() {
  return await prisma.tenant.findMany({
    where: { status: "AKTIF" },
    include: { room: true },
    orderBy: { name: "asc" },
  })
}
